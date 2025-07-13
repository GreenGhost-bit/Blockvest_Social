const express = require('express');
const RiskAssessment = require('../models/RiskAssessment');
const Investment = require('../models/Investment');
const User = require('../models/User');
const RiskAssessmentEngine = require('../services/riskAssessmentEngine');
const { authenticateToken } = require('./auth');

const router = express.Router();
const riskEngine = new RiskAssessmentEngine();

router.post('/assess/:investmentId', authenticateToken, async (req, res) => {
  try {
    const { investmentId } = req.params;
    const userId = req.user.userId;
    
    const investment = await Investment.findById(investmentId).populate('borrower');
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const user = await User.findById(userId);
    const canAssess = user.isVerified || 
                     investment.borrower._id.toString() === userId || 
                     user.profile.userType === 'admin';

    if (!canAssess) {
      return res.status(403).json({ error: 'Not authorized to assess this investment' });
    }

    let assessment = await RiskAssessment.findOne({ investment: investmentId, isActive: true });
    
    if (!assessment) {
      assessment = await riskEngine.assessInvestment(investmentId);
    } else {
      const daysSinceAssessment = (Date.now() - assessment.assessedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAssessment > 7) {
        assessment.isActive = false;
        await assessment.save();
        assessment = await riskEngine.assessInvestment(investmentId);
      }
    }

    res.json({
      assessment: {
        id: assessment._id,
        overallRiskScore: assessment.overallRiskScore,
        riskLevel: assessment.riskLevel,
        categoryScores: assessment.categoryScores,
        recommendations: assessment.recommendations,
        assessedAt: assessment.assessedAt,
        confidence: assessment.algorithmMetadata.confidence,
        nextReassessment: assessment.nextReassessment
      }
    });
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ error: 'Failed to assess investment risk' });
  }
});

router.get('/investment/:investmentId', authenticateToken, async (req, res) => {
  try {
    const { investmentId } = req.params;
    const userId = req.user.userId;
    
    const investment = await Investment.findById(investmentId).populate('borrower');
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const user = await User.findById(userId);
    const canView = user.isVerified || 
                   investment.borrower._id.toString() === userId || 
                   user.profile.userType === 'admin';

    if (!canView) {
      return res.status(403).json({ error: 'Not authorized to view this assessment' });
    }

    const assessment = await RiskAssessment.findOne({ 
      investment: investmentId, 
      isActive: true 
    }).populate('borrower', 'profile.name reputationScore');

    if (!assessment) {
      return res.status(404).json({ error: 'Risk assessment not found' });
    }

    const detailedAssessment = {
      id: assessment._id,
      overallRiskScore: assessment.overallRiskScore,
      riskLevel: assessment.riskLevel,
      categoryScores: assessment.categoryScores,
      riskFactors: assessment.riskFactors,
      recommendations: assessment.recommendations,
      historicalComparisons: assessment.historicalComparisons,
      algorithmMetadata: assessment.algorithmMetadata,
      assessedAt: assessment.assessedAt,
      nextReassessment: assessment.nextReassessment,
      borrower: {
        name: assessment.borrower.profile.name,
        reputationScore: assessment.borrower.reputationScore
      }
    };

    if (user.profile.userType === 'admin') {
      detailedAssessment.manualOverrides = assessment.manualOverrides;
    }

    res.json({ assessment: detailedAssessment });
  } catch (error) {
    console.error('Get risk assessment error:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
});

router.get('/borrower/:borrowerId', authenticateToken, async (req, res) => {
  try {
    const { borrowerId } = req.params;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    const canView = user.isVerified || 
                   borrowerId === userId || 
                   user.profile.userType === 'admin';

    if (!canView) {
      return res.status(403).json({ error: 'Not authorized to view borrower assessments' });
    }

    const assessments = await RiskAssessment.find({ 
      borrower: borrowerId, 
      isActive: true 
    }).sort({ assessedAt: -1 }).limit(10);

    const riskTrends = await RiskAssessment.getRiskTrends(borrowerId, 12);

    res.json({
      assessments: assessments.map(assessment => ({
        id: assessment._id,
        investmentId: assessment.investment,
        overallRiskScore: assessment.overallRiskScore,
        riskLevel: assessment.riskLevel,
        assessedAt: assessment.assessedAt
      })),
      riskTrends: riskTrends,
      summary: {
        averageRiskScore: assessments.length > 0 ? 
          Math.round(assessments.reduce((sum, a) => sum + a.overallRiskScore, 0) / assessments.length) : 0,
        assessmentCount: assessments.length,
        latestRiskLevel: assessments.length > 0 ? assessments[0].riskLevel : 'unknown'
      }
    });
  } catch (error) {
    console.error('Get borrower assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch borrower assessments' });
  }
});

router.put('/override/:assessmentId', authenticateToken, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { factor, newScore, reason } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user.isVerified || user.profile.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const assessment = await RiskAssessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const riskFactor = assessment.riskFactors.find(rf => rf.factor === factor);
    if (!riskFactor) {
      return res.status(404).json({ error: 'Risk factor not found' });
    }

    const originalScore = riskFactor.score;
    riskFactor.score = newScore;

    assessment.manualOverrides.push({
      factor,
      originalScore,
      newScore,
      reason,
      overriddenBy: userId
    });

    const categoryScores = riskEngine.calculateCategoryScores(assessment.riskFactors);
    const overallScore = riskEngine.calculateOverallScore(categoryScores);
    const riskLevel = riskEngine.determineRiskLevel(overallScore);

    assessment.categoryScores = categoryScores;
    assessment.overallRiskScore = overallScore;
    assessment.riskLevel = riskLevel;
    assessment.recommendations = assessment.generateRecommendations();

    await assessment.save();

    res.json({
      message: 'Risk assessment updated successfully',
      assessment: {
        id: assessment._id,
        overallRiskScore: assessment.overallRiskScore,
        riskLevel: assessment.riskLevel,
        updatedFactor: {
          factor,
          originalScore,
          newScore
        }
      }
    });
  } catch (error) {
    console.error('Override risk assessment error:', error);
    res.status(500).json({ error: 'Failed to override risk assessment' });
  }
});

router.get('/analytics/platform', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user.isVerified || user.profile.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { timeframe = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const totalAssessments = await RiskAssessment.countDocuments({
      assessedAt: { $gte: startDate },
      isActive: true
    });

    const riskDistribution = await RiskAssessment.aggregate([
      {
        $match: {
          assessedAt: { $gte: startDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
          averageScore: { $avg: '$overallRiskScore' }
        }
      }
    ]);

    const categoryAverages = await RiskAssessment.aggregate([
      {
        $match: {
          assessedAt: { $gte: startDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          avgCreditworthiness: { $avg: '$categoryScores.creditworthiness.score' },
          avgFinancialStability: { $avg: '$categoryScores.financial_stability.score' },
          avgReputationHistory: { $avg: '$categoryScores.reputation_history.score' },
          avgInvestmentPurpose: { $avg: '$categoryScores.investment_purpose.score' },
          avgDocumentationQuality: { $avg: '$categoryScores.documentation_quality.score' },
          avgPlatformBehavior: { $avg: '$categoryScores.platform_behavior.score' },
          avgExternalValidation: { $avg: '$categoryScores.external_validation.score' }
        }
      }
    ]);

    const recentTrends = await RiskAssessment.aggregate([
      {
        $match: {
          assessedAt: { $gte: startDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$assessedAt' },
            month: { $month: '$assessedAt' },
            day: { $dayOfMonth: '$assessedAt' }
          },
          avgRiskScore: { $avg: '$overallRiskScore' },
          assessmentCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      analytics: {
        totalAssessments,
        riskDistribution,
        categoryAverages: categoryAverages[0] || {},
        recentTrends,
        timeframe: parseInt(timeframe)
      }
    });
  } catch (error) {
    console.error('Risk analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch risk analytics' });
  }
});

router.post('/reassess/:assessmentId', authenticateToken, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user.isVerified || user.profile.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const oldAssessment = await RiskAssessment.findById(assessmentId);
    if (!oldAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    oldAssessment.isActive = false;
    oldAssessment.lastReassessment = new Date();
    await oldAssessment.save();

    const newAssessment = await riskEngine.assessInvestment(oldAssessment.investment);

    res.json({
      message: 'Investment reassessed successfully',
      oldScore: oldAssessment.overallRiskScore,
      newScore: newAssessment.overallRiskScore,
      scoreDifference: newAssessment.overallRiskScore - oldAssessment.overallRiskScore,
      assessment: {
        id: newAssessment._id,
        overallRiskScore: newAssessment.overallRiskScore,
        riskLevel: newAssessment.riskLevel,
        assessedAt: newAssessment.assessedAt
      }
    });
  } catch (error) {
    console.error('Reassess investment error:', error);
    res.status(500).json({ error: 'Failed to reassess investment' });
  }
});

module.exports = router;