const User = require('../models/User');
const Investment = require('../models/Investment');
const Document = require('../models/Document');
const RiskAssessment = require('../models/RiskAssessment');
const MFA = require('../models/MFA');

class RiskAssessmentEngine {
  constructor() {
    this.version = '1.0';
    this.factorWeights = {
      creditworthiness: 0.25,
      financial_stability: 0.20,
      reputation_history: 0.15,
      investment_purpose: 0.15,
      documentation_quality: 0.10,
      platform_behavior: 0.10,
      external_validation: 0.05
    };
  }

  async assessInvestment(investmentId) {
    const startTime = Date.now();
    
    try {
      const investment = await Investment.findById(investmentId).populate('borrower');
      if (!investment) {
        throw new Error('Investment not found');
      }

      const borrower = investment.borrower;
      const assessmentData = await this.gatherAssessmentData(borrower, investment);
      
      const riskFactors = await this.calculateRiskFactors(assessmentData);
      const categoryScores = this.calculateCategoryScores(riskFactors);
      const overallScore = this.calculateOverallScore(categoryScores);
      const riskLevel = this.determineRiskLevel(overallScore);
      
      const similarInvestments = await this.findSimilarInvestments(investment);
      const borrowerHistory = await this.analyzeBorrowerHistory(borrower._id);
      
      const assessment = new RiskAssessment({
        investment: investmentId,
        borrower: borrower._id,
        assessmentVersion: this.version,
        overallRiskScore: overallScore,
        riskLevel: riskLevel,
        riskFactors: riskFactors,
        categoryScores: categoryScores,
        algorithmMetadata: {
          modelVersion: this.version,
          computationTime: Date.now() - startTime,
          dataSourcesUsed: Object.keys(assessmentData),
          confidence: this.calculateConfidence(assessmentData),
          lastUpdated: new Date()
        },
        historicalComparisons: {
          similarInvestments: similarInvestments,
          borrowerHistory: borrowerHistory
        }
      });

      assessment.recommendations = assessment.generateRecommendations();
      assessment.scheduleReassessment();
      
      await assessment.save();
      
      return assessment;
    } catch (error) {
      console.error('Risk assessment failed:', error);
      throw error;
    }
  }

  async gatherAssessmentData(borrower, investment) {
    const data = {
      borrower: borrower,
      investment: investment,
      documents: await Document.find({ user: borrower._id }),
      userInvestments: await Investment.find({ borrower: borrower._id }),
      investorHistory: await Investment.find({ investor: borrower._id }),
      mfaStatus: await MFA.findOne({ user: borrower._id }),
      platformStats: await this.getPlatformStatistics(),
      timeOnPlatform: Date.now() - new Date(borrower.joinedAt).getTime()
    };

    return data;
  }

  async calculateRiskFactors(data) {
    const factors = [];
    
    // Creditworthiness factors
    factors.push({
      factor: 'reputation_score',
      value: data.borrower.reputationScore,
      weight: 0.4,
      score: this.normalizeScore(data.borrower.reputationScore, 0, 100),
      reasoning: `Borrower has a reputation score of ${data.borrower.reputationScore}/100`
    });

    factors.push({
      factor: 'verification_status',
      value: data.borrower.isVerified,
      weight: 0.3,
      score: data.borrower.isVerified ? 100 : 20,
      reasoning: `Borrower ${data.borrower.isVerified ? 'is' : 'is not'} verified`
    });

    factors.push({
      factor: 'previous_defaults',
      value: data.userInvestments.filter(inv => inv.status === 'defaulted').length,
      weight: 0.3,
      score: Math.max(0, 100 - (data.userInvestments.filter(inv => inv.status === 'defaulted').length * 25)),
      reasoning: `${data.userInvestments.filter(inv => inv.status === 'defaulted').length} previous defaults found`
    });

    // Financial stability factors
    factors.push({
      factor: 'investment_amount_vs_history',
      value: investment.amount,
      weight: 0.4,
      score: this.assessInvestmentAmount(data.investment.amount, data.userInvestments),
      reasoning: 'Investment amount relative to borrower history'
    });

    factors.push({
      factor: 'debt_to_income_ratio',
      value: this.calculateDebtRatio(data.userInvestments),
      weight: 0.3,
      score: this.assessDebtRatio(data.userInvestments),
      reasoning: 'Estimated debt-to-income based on platform activity'
    });

    factors.push({
      factor: 'financial_documents_quality',
      value: data.documents.filter(doc => ['bank_statement', 'income_proof', 'tax_document'].includes(doc.type) && doc.verificationStatus === 'verified').length,
      weight: 0.3,
      score: Math.min(100, data.documents.filter(doc => ['bank_statement', 'income_proof', 'tax_document'].includes(doc.type) && doc.verificationStatus === 'verified').length * 40),
      reasoning: `${data.documents.filter(doc => ['bank_statement', 'income_proof', 'tax_document'].includes(doc.type) && doc.verificationStatus === 'verified').length} verified financial documents`
    });

    // Reputation history factors
    factors.push({
      factor: 'completed_investments_ratio',
      value: data.userInvestments.filter(inv => inv.status === 'completed').length / Math.max(1, data.userInvestments.length),
      weight: 0.5,
      score: (data.userInvestments.filter(inv => inv.status === 'completed').length / Math.max(1, data.userInvestments.length)) * 100,
      reasoning: `${Math.round((data.userInvestments.filter(inv => inv.status === 'completed').length / Math.max(1, data.userInvestments.length)) * 100)}% completion rate`
    });

    factors.push({
      factor: 'time_on_platform',
      value: data.timeOnPlatform,
      weight: 0.3,
      score: this.assessTimeOnPlatform(data.timeOnPlatform),
      reasoning: `${Math.round(data.timeOnPlatform / (1000 * 60 * 60 * 24))} days on platform`
    });

    factors.push({
      factor: 'investor_activity',
      value: data.investorHistory.length,
      weight: 0.2,
      score: Math.min(100, data.investorHistory.length * 20),
      reasoning: `Has invested in ${data.investorHistory.length} other opportunities`
    });

    // Investment purpose factors
    factors.push({
      factor: 'purpose_clarity',
      value: data.investment.description.length,
      weight: 0.4,
      score: this.assessPurposeClarity(data.investment.purpose, data.investment.description),
      reasoning: 'Assessment of investment purpose clarity and detail'
    });

    factors.push({
      factor: 'purpose_risk_category',
      value: data.investment.purpose,
      weight: 0.6,
      score: this.assessPurposeRisk(data.investment.purpose),
      reasoning: `Investment purpose: ${data.investment.purpose}`
    });

    // Documentation quality factors
    factors.push({
      factor: 'document_completeness',
      value: data.documents.length,
      weight: 0.5,
      score: Math.min(100, data.documents.filter(doc => doc.verificationStatus === 'verified').length * 25),
      reasoning: `${data.documents.filter(doc => doc.verificationStatus === 'verified').length} verified documents uploaded`
    });

    factors.push({
      factor: 'document_authenticity',
      value: data.documents.filter(doc => doc.securityChecks.virusScan.status === 'clean' && doc.securityChecks.duplicateCheck.status === 'unique').length,
      weight: 0.3,
      score: data.documents.length > 0 ? (data.documents.filter(doc => doc.securityChecks.virusScan.status === 'clean' && doc.securityChecks.duplicateCheck.status === 'unique').length / data.documents.length) * 100 : 50,
      reasoning: 'Document authenticity and security check results'
    });

    factors.push({
      factor: 'document_recency',
      value: this.calculateDocumentRecency(data.documents),
      weight: 0.2,
      score: this.assessDocumentRecency(data.documents),
      reasoning: 'Recency of uploaded documents'
    });

    // Platform behavior factors
    factors.push({
      factor: 'mfa_enabled',
      value: data.mfaStatus?.isEnabled || false,
      weight: 0.4,
      score: data.mfaStatus?.isEnabled ? 100 : 30,
      reasoning: `Multi-factor authentication ${data.mfaStatus?.isEnabled ? 'enabled' : 'disabled'}`
    });

    factors.push({
      factor: 'communication_responsiveness',
      value: this.assessCommunicationPattern(data.borrower),
      weight: 0.3,
      score: this.assessCommunicationPattern(data.borrower),
      reasoning: 'Communication patterns and responsiveness'
    });

    factors.push({
      factor: 'profile_completeness',
      value: this.calculateProfileCompleteness(data.borrower),
      weight: 0.3,
      score: this.calculateProfileCompleteness(data.borrower),
      reasoning: 'Completeness of user profile information'
    });

    // External validation factors
    factors.push({
      factor: 'social_validation',
      value: 0,
      weight: 0.6,
      score: 50,
      reasoning: 'Social validation metrics (future implementation)'
    });

    factors.push({
      factor: 'external_credit_check',
      value: 0,
      weight: 0.4,
      score: 50,
      reasoning: 'External credit bureau check (future implementation)'
    });

    return factors;
  }

  calculateCategoryScores(riskFactors) {
    const categoryMapping = {
      creditworthiness: ['reputation_score', 'verification_status', 'previous_defaults'],
      financial_stability: ['investment_amount_vs_history', 'debt_to_income_ratio', 'financial_documents_quality'],
      reputation_history: ['completed_investments_ratio', 'time_on_platform', 'investor_activity'],
      investment_purpose: ['purpose_clarity', 'purpose_risk_category'],
      documentation_quality: ['document_completeness', 'document_authenticity', 'document_recency'],
      platform_behavior: ['mfa_enabled', 'communication_responsiveness', 'profile_completeness'],
      external_validation: ['social_validation', 'external_credit_check']
    };

    const categoryScores = {};

    Object.keys(categoryMapping).forEach(category => {
      const relevantFactors = riskFactors.filter(factor => categoryMapping[category].includes(factor.factor));
      
      let weightedSum = 0;
      let totalWeight = 0;
      
      relevantFactors.forEach(factor => {
        weightedSum += factor.score * factor.weight;
        totalWeight += factor.weight;
      });
      
      const score = totalWeight > 0 ? weightedSum / totalWeight : 50;
      
      categoryScores[category] = {
        score: Math.round(score),
        weight: this.factorWeights[category],
        factors: categoryMapping[category]
      };
    });

    return categoryScores;
  }

  calculateOverallScore(categoryScores) {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.keys(categoryScores).forEach(category => {
      const categoryData = categoryScores[category];
      weightedSum += categoryData.score * categoryData.weight;
      totalWeight += categoryData.weight;
    });

    return Math.round(weightedSum / totalWeight);
  }

  determineRiskLevel(score) {
    if (score >= 80) return 'very_low';
    if (score >= 65) return 'low';
    if (score >= 45) return 'medium';
    if (score >= 25) return 'high';
    return 'very_high';
  }

  async findSimilarInvestments(investment) {
    const similarInvestments = await Investment.find({
      purpose: investment.purpose,
      amount: { $gte: investment.amount * 0.7, $lte: investment.amount * 1.3 },
      _id: { $ne: investment._id }
    }).limit(10);

    return similarInvestments.map(inv => ({
      investmentId: inv._id,
      similarityScore: this.calculateSimilarityScore(investment, inv),
      outcome: inv.status,
      relevantFactors: ['purpose', 'amount', 'duration']
    }));
  }

  async analyzeBorrowerHistory(borrowerId) {
    const previousAssessments = await RiskAssessment.find({
      borrower: borrowerId,
      isActive: true
    }).sort({ assessedAt: -1 }).limit(5);

    let riskTrend = 'insufficient_data';
    if (previousAssessments.length >= 2) {
      const recent = previousAssessments[0].overallRiskScore;
      const older = previousAssessments[previousAssessments.length - 1].overallRiskScore;
      
      if (recent > older + 5) riskTrend = 'improving';
      else if (recent < older - 5) riskTrend = 'deteriorating';
      else riskTrend = 'stable';
    }

    return {
      previousAssessments: previousAssessments.map(assessment => ({
        assessmentId: assessment._id,
        riskScore: assessment.overallRiskScore,
        outcome: assessment.investment ? 'pending' : 'unknown',
        assessedAt: assessment.assessedAt
      })),
      riskTrend: riskTrend
    };
  }

  // Helper methods
  normalizeScore(value, min, max) {
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  }

  assessInvestmentAmount(amount, history) {
    if (history.length === 0) return 30;
    
    const avgAmount = history.reduce((sum, inv) => sum + inv.amount, 0) / history.length;
    const ratio = amount / avgAmount;
    
    if (ratio <= 1.2) return 100;
    if (ratio <= 2.0) return 80;
    if (ratio <= 3.0) return 60;
    return 30;
  }

  calculateDebtRatio(investments) {
    const activeDebt = investments.filter(inv => inv.status === 'active').reduce((sum, inv) => sum + inv.amount, 0);
    return activeDebt;
  }

  assessDebtRatio(investments) {
    const activeDebt = this.calculateDebtRatio(investments);
    if (activeDebt === 0) return 100;
    if (activeDebt <= 5000) return 90;
    if (activeDebt <= 15000) return 70;
    if (activeDebt <= 30000) return 50;
    return 20;
  }

  assessTimeOnPlatform(timeMs) {
    const days = timeMs / (1000 * 60 * 60 * 24);
    if (days >= 365) return 100;
    if (days >= 180) return 85;
    if (days >= 90) return 70;
    if (days >= 30) return 55;
    return 30;
  }

  assessPurposeClarity(purpose, description) {
    const purposeScore = purpose ? 50 : 0;
    const descriptionScore = description ? Math.min(50, description.length / 10) : 0;
    return purposeScore + descriptionScore;
  }

  assessPurposeRisk(purpose) {
    const riskScores = {
      'Education': 90,
      'Medical': 85,
      'Home Improvement': 80,
      'Business': 70,
      'Debt Consolidation': 60,
      'Investment': 50,
      'Travel': 40,
      'Other': 30
    };
    
    return riskScores[purpose] || 30;
  }

  calculateDocumentRecency(documents) {
    if (documents.length === 0) return 0;
    
    const avgAge = documents.reduce((sum, doc) => {
      const age = Date.now() - new Date(doc.uploadedAt).getTime();
      return sum + age;
    }, 0) / documents.length;
    
    return avgAge;
  }

  assessDocumentRecency(documents) {
    const avgAge = this.calculateDocumentRecency(documents);
    const days = avgAge / (1000 * 60 * 60 * 24);
    
    if (days <= 30) return 100;
    if (days <= 90) return 80;
    if (days <= 180) return 60;
    if (days <= 365) return 40;
    return 20;
  }

  assessCommunicationPattern(borrower) {
    return 75; // Placeholder - would analyze message response times, etc.
  }

  calculateProfileCompleteness(borrower) {
    let completeness = 0;
    const profile = borrower.profile;
    
    if (profile.name) completeness += 20;
    if (profile.email) completeness += 20;
    if (profile.location) completeness += 20;
    if (profile.phone) completeness += 20;
    if (borrower.isVerified) completeness += 20;
    
    return completeness;
  }

  calculateSimilarityScore(investment1, investment2) {
    let similarity = 0;
    
    if (investment1.purpose === investment2.purpose) similarity += 40;
    
    const amountDiff = Math.abs(investment1.amount - investment2.amount) / Math.max(investment1.amount, investment2.amount);
    similarity += (1 - amountDiff) * 30;
    
    const durationDiff = Math.abs(investment1.duration - investment2.duration) / Math.max(investment1.duration, investment2.duration);
    similarity += (1 - durationDiff) * 30;
    
    return Math.round(similarity);
  }

  calculateConfidence(data) {
    let confidence = 0.5;
    
    if (data.documents.length >= 3) confidence += 0.1;
    if (data.borrower.isVerified) confidence += 0.1;
    if (data.userInvestments.length >= 1) confidence += 0.1;
    if (data.mfaStatus?.isEnabled) confidence += 0.1;
    if (data.timeOnPlatform > 30 * 24 * 60 * 60 * 1000) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  async getPlatformStatistics() {
    const totalUsers = await User.countDocuments();
    const totalInvestments = await Investment.countDocuments();
    const defaultRate = await this.calculatePlatformDefaultRate();
    
    return {
      totalUsers,
      totalInvestments,
      defaultRate
    };
  }

  async calculatePlatformDefaultRate() {
    const totalCompleted = await Investment.countDocuments({ status: { $in: ['completed', 'defaulted'] } });
    const totalDefaulted = await Investment.countDocuments({ status: 'defaulted' });
    
    return totalCompleted > 0 ? (totalDefaulted / totalCompleted) * 100 : 0;
  }
}

module.exports = RiskAssessmentEngine;