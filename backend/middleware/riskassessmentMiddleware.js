const RiskAssessmentEngine = require('../services/riskAssessmentEngine');
const RiskAssessment = require('../models/RiskAssessment');
const Investment = require('../models/Investment');
const Notification = require('../models/Notification');

const riskEngine = new RiskAssessmentEngine();

const autoAssessInvestment = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 201 && req.route && req.route.path === '/create') {
      setImmediate(async () => {
        try {
          const responseData = JSON.parse(data);
          if (responseData.investment && responseData.investment.id) {
            await triggerRiskAssessment(responseData.investment.id, req.user.userId);
          }
        } catch (error) {
          console.error('Auto risk assessment failed:', error);
        }
      });
    }
    return originalSend.call(this, data);
  };

  next();
};

const triggerRiskAssessment = async (investmentId, userId) => {
  try {
    console.log(`Triggering risk assessment for investment ${investmentId}`);
    
    const existingAssessment = await RiskAssessment.findOne({ 
      investment: investmentId, 
      isActive: true 
    });
    
    if (existingAssessment) {
      console.log('Risk assessment already exists for this investment');
      return;
    }

    const assessment = await riskEngine.assessInvestment(investmentId);
    
    await Notification.createNotification({
      recipient: userId,
      type: 'risk_assessment_completed',
      title: 'Risk Assessment Complete',
      message: `Your investment has been assessed with a risk score of ${assessment.overallRiskScore}/100 (${assessment.riskLevel} risk).`,
      category: 'investment',
      priority: assessment.riskLevel === 'high' || assessment.riskLevel === 'very_high' ? 'high' : 'medium',
      data: {
        investmentId: investmentId,
        riskScore: assessment.overallRiskScore,
        riskLevel: assessment.riskLevel,
        assessmentId: assessment._id
      },
      actionUrl: `/investments/${investmentId}#risk-assessment`
    });

    if (assessment.riskLevel === 'high' || assessment.riskLevel === 'very_high') {
      const adminUsers = await require('../models/User').find({ 
        'profile.userType': 'admin', 
        isVerified: true 
      });

      for (const admin of adminUsers) {
        await Notification.createNotification({
          recipient: admin._id,
          type: 'high_risk_investment_alert',
          title: 'High Risk Investment Alert',
          message: `A new investment with ${assessment.riskLevel} risk has been created and requires review.`,
          category: 'security',
          priority: 'urgent',
          data: {
            investmentId: investmentId,
            riskScore: assessment.overallRiskScore,
            riskLevel: assessment.riskLevel,
            assessmentId: assessment._id
          },
          actionUrl: `/risk-assessment/review/${assessment._id}`
        });
      }
    }

    console.log(`Risk assessment completed for investment ${investmentId}: ${assessment.overallRiskScore}/100 (${assessment.riskLevel})`);
    
  } catch (error) {
    console.error('Risk assessment trigger failed:', error);
  }
};

const validateRiskThreshold = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;
    
    if (!amount || amount <= 0) {
      return next();
    }

    const user = await require('../models/User').findById(userId);
    if (!user) {
      return next();
    }

    const userAssessments = await RiskAssessment.find({
      borrower: userId,
      isActive: true
    }).sort({ assessedAt: -1 }).limit(5);

    if (userAssessments.length === 0) {
      return next();
    }

    const latestAssessment = userAssessments[0];
    const avgRiskScore = userAssessments.reduce((sum, a) => sum + a.overallRiskScore, 0) / userAssessments.length;

    if (latestAssessment.riskLevel === 'very_high' && amount > 5000) {
      return res.status(400).json({
        error: 'Investment amount exceeds risk threshold',
        details: 'High-risk borrowers are limited to investments under $5,000',
        riskLevel: latestAssessment.riskLevel,
        riskScore: latestAssessment.overallRiskScore,
        suggestedMaxAmount: 5000
      });
    }

    if (latestAssessment.riskLevel === 'high' && amount > 15000) {
      return res.status(400).json({
        error: 'Investment amount exceeds risk threshold',
        details: 'Medium-high risk borrowers are limited to investments under $15,000',
        riskLevel: latestAssessment.riskLevel,
        riskScore: latestAssessment.overallRiskScore,
        suggestedMaxAmount: 15000
      });
    }

    if (avgRiskScore < 30 && amount > 25000) {
      return res.status(400).json({
        error: 'Investment amount exceeds risk threshold',
        details: 'Based on your risk history, please consider a smaller investment amount',
        averageRiskScore: Math.round(avgRiskScore),
        suggestedMaxAmount: 25000
      });
    }

    const activeInvestments = await Investment.find({
      borrower: userId,
      status: 'active'
    });

    const totalActiveDebt = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const maxDebtThreshold = 50000;

    if (totalActiveDebt + amount > maxDebtThreshold) {
      return res.status(400).json({
        error: 'Total debt limit exceeded',
        details: `Adding this investment would exceed the maximum debt limit of $${maxDebtThreshold}`,
        currentDebt: totalActiveDebt,
        newTotal: totalActiveDebt + amount,
        maxAllowed: maxDebtThreshold,
        availableCredit: Math.max(0, maxDebtThreshold - totalActiveDebt)
      });
    }

    next();
  } catch (error) {
    console.error('Risk threshold validation error:', error);
    next();
  }
};

const scheduleReassessment = async () => {
  try {
    const overdueAssessments = await RiskAssessment.find({
      nextReassessment: { $lt: new Date() },
      isActive: true
    }).populate('investment');

    console.log(`Found ${overdueAssessments.length} assessments due for reassessment`);

    for (const assessment of overdueAssessments) {
      if (assessment.investment && assessment.investment.status === 'active') {
        try {
          console.log(`Reassessing investment ${assessment.investment._id}`);
          
          assessment.isActive = false;
          assessment.lastReassessment = new Date();
          await assessment.save();

          const newAssessment = await riskEngine.assessInvestment(assessment.investment._id);
          
          const scoreDifference = newAssessment.overallRiskScore - assessment.overallRiskScore;
          const riskLevelChanged = newAssessment.riskLevel !== assessment.riskLevel;

          if (Math.abs(scoreDifference) >= 10 || riskLevelChanged) {
            await Notification.createNotification({
              recipient: assessment.borrower,
              type: 'risk_assessment_updated',
              title: 'Risk Assessment Updated',
              message: `Your risk profile has been updated. New score: ${newAssessment.overallRiskScore}/100 (${newAssessment.riskLevel} risk).`,
              category: 'investment',
              priority: newAssessment.riskLevel === 'high' || newAssessment.riskLevel === 'very_high' ? 'high' : 'medium',
              data: {
                investmentId: assessment.investment._id,
                oldScore: assessment.overallRiskScore,
                newScore: newAssessment.overallRiskScore,
                scoreDifference: scoreDifference,
                oldRiskLevel: assessment.riskLevel,
                newRiskLevel: newAssessment.riskLevel
              }
            });
          }

          console.log(`Reassessment completed: ${assessment.overallRiskScore} -> ${newAssessment.overallRiskScore}`);
          
        } catch (reassessError) {
          console.error(`Failed to reassess investment ${assessment.investment._id}:`, reassessError);
        }
      }
    }
  } catch (error) {
    console.error('Scheduled reassessment failed:', error);
  }
};

const generateRiskReport = async (timeframe = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    const assessments = await RiskAssessment.find({
      assessedAt: { $gte: startDate },
      isActive: true
    }).populate('borrower investment');

    const riskDistribution = {};
    let totalScore = 0;
    let highRiskCount = 0;
    const categoryTotals = {
      creditworthiness: 0,
      financial_stability: 0,
      reputation_history: 0,
      investment_purpose: 0,
      documentation_quality: 0,
      platform_behavior: 0,
      external_validation: 0
    };

    assessments.forEach(assessment => {
      const level = assessment.riskLevel;
      riskDistribution[level] = (riskDistribution[level] || 0) + 1;
      totalScore += assessment.overallRiskScore;
      
      if (level === 'high' || level === 'very_high') {
        highRiskCount++;
      }

      Object.keys(categoryTotals).forEach(category => {
        if (assessment.categoryScores[category]) {
          categoryTotals[category] += assessment.categoryScores[category].score;
        }
      });
    });

    const report = {
      timeframe,
      totalAssessments: assessments.length,
      averageRiskScore: assessments.length > 0 ? Math.round(totalScore / assessments.length) : 0,
      highRiskPercentage: assessments.length > 0 ? Math.round((highRiskCount / assessments.length) * 100) : 0,
      riskDistribution,
      categoryAverages: {},
      generatedAt: new Date()
    };

    Object.keys(categoryTotals).forEach(category => {
      report.categoryAverages[category] = assessments.length > 0 
        ? Math.round(categoryTotals[category] / assessments.length) 
        : 0;
    });

    return report;
  } catch (error) {
    console.error('Risk report generation failed:', error);
    throw error;
  }
};

module.exports = {
  autoAssessInvestment,
  triggerRiskAssessment,
  validateRiskThreshold,
  scheduleReassessment,
  generateRiskReport
};