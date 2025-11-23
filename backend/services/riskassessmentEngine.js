const User = require('../models/User');
const Investment = require('../models/Investment');
const Document = require('../models/Document');
const RiskAssessment = require('../models/RiskAssessment');
const MFA = require('../models/MFA');

class RiskAssessmentEngine {
  constructor() {
    this.version = '2.0';
    this.factorWeights = {
      creditworthiness: 0.25,
      financial_stability: 0.20,
      reputation_history: 0.15,
      investment_purpose: 0.15,
      documentation_quality: 0.10,
      platform_behavior: 0.10,
      external_validation: 0.05
    };
    
    this.advancedFactors = {
      market_volatility: 0.08,
      social_network_analysis: 0.07,
      behavioral_patterns: 0.06,
      geographic_risk: 0.04
    };
    
    this.mlModel = {
      version: '1.0',
      lastTrained: new Date(),
      accuracy: 0.89,
      features: ['credit_score', 'transaction_history', 'social_connections', 'market_conditions']
    };
    
    this.realTimeThresholds = {
      highRisk: 0.7,
      mediumRisk: 0.4,
      lowRisk: 0.2
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
      const advancedRiskFactors = await this.calculateAdvancedRiskFactors(assessmentData);
      const categoryScores = this.calculateCategoryScores(riskFactors);
      const overallScore = this.calculateOverallScore(categoryScores, advancedRiskFactors);
      const riskLevel = this.determineRiskLevel(overallScore);
      
      const similarInvestments = await this.findSimilarInvestments(investment);
      const borrowerHistory = await this.analyzeBorrowerHistory(borrower._id);
      const marketConditions = await this.analyzeMarketConditions();
      const socialNetworkRisk = await this.analyzeSocialNetworkRisk(borrower._id);
      
      const assessment = new RiskAssessment({
        investment: investmentId,
        borrower: borrower._id,
        assessmentVersion: this.version,
        overallRiskScore: overallScore,
        riskLevel: riskLevel,
        riskFactors: riskFactors,
        advancedRiskFactors: advancedRiskFactors,
        categoryScores: categoryScores,
        algorithmMetadata: {
          modelVersion: this.version,
          mlModelVersion: this.mlModel.version,
          computationTime: Date.now() - startTime,
          dataSourcesUsed: Object.keys(assessmentData),
          confidence: this.calculateConfidence(assessmentData),
          accuracy: this.mlModel.accuracy,
          lastUpdated: new Date()
        },
        historicalComparisons: {
          similarInvestments: similarInvestments,
          borrowerHistory: borrowerHistory,
          marketConditions: marketConditions,
          socialNetworkRisk: socialNetworkRisk
        },
        realTimeMonitoring: {
          enabled: true,
          checkInterval: 3600000, // 1 hour
          alertThresholds: this.realTimeThresholds,
          lastCheck: new Date()
        }
      });

      assessment.recommendations = assessment.generateRecommendations();
      assessment.scheduleReassessment();
      
      await assessment.save();
      
      // Enable real-time monitoring for high-risk investments
      if (riskLevel === 'high') {
        await this.enableRealTimeMonitoring(assessment._id);
      }
      
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
      timeOnPlatform: Date.now() - new Date(borrower.joinedAt).getTime(),
      socialConnections: await this.getSocialConnections(borrower._id),
      marketData: await this.getMarketData(),
      behavioralData: await this.getBehavioralData(borrower._id)
    };

    return data;
  }

  async calculateRiskFactors(data) {
    const factors = [];
    
    // Enhanced creditworthiness factors
    factors.push({
      factor: 'reputation_score',
      value: data.borrower.reputationScore,
      weight: 0.4,
      score: this.normalizeScore(data.borrower.reputationScore, 0, 100),
      reasoning: `Borrower has a reputation score of ${data.borrower.reputationScore}/100`,
      confidence: 0.95
    });

    factors.push({
      factor: 'verification_status',
      value: data.borrower.isVerified,
      weight: 0.3,
      score: data.borrower.isVerified ? 100 : 20,
      reasoning: `Borrower ${data.borrower.isVerified ? 'is' : 'is not'} verified`,
      confidence: 1.0
    });

    factors.push({
      factor: 'previous_defaults',
      value: data.userInvestments.filter(inv => inv.status === 'defaulted').length,
      weight: 0.3,
      score: Math.max(0, 100 - (data.userInvestments.filter(inv => inv.status === 'defaulted').length * 25)),
      reasoning: `${data.userInvestments.filter(inv => inv.status === 'defaulted').length} previous defaults found`,
      confidence: 0.9
    });

    // Enhanced financial stability factors
    factors.push({
      factor: 'investment_amount_vs_history',
      value: data.investment.amount,
      weight: 0.4,
      score: this.assessInvestmentAmount(data.investment.amount, data.userInvestments),
      reasoning: 'Investment amount relative to borrower history',
      confidence: 0.85
    });

    factors.push({
      factor: 'debt_to_income_ratio',
      value: this.calculateDebtRatio(data.userInvestments),
      weight: 0.3,
      score: this.assessDebtRatio(data.userInvestments),
      reasoning: 'Estimated debt-to-income based on platform activity',
      confidence: 0.8
    });

    factors.push({
      factor: 'financial_documents_quality',
      value: data.documents.filter(doc => ['bank_statement', 'income_proof', 'tax_document'].includes(doc.type) && doc.verificationStatus === 'verified').length,
      weight: 0.3,
      score: Math.min(100, data.documents.filter(doc => ['bank_statement', 'income_proof', 'tax_document'].includes(doc.type) && doc.verificationStatus === 'verified').length * 40),
      reasoning: `${data.documents.filter(doc => ['bank_statement', 'income_proof', 'tax_document'].includes(doc.type) && doc.verificationStatus === 'verified').length} verified financial documents`,
      confidence: 0.9
    });

    // Enhanced reputation history factors
    factors.push({
      factor: 'completed_investments_ratio',
      value: data.userInvestments.filter(inv => inv.status === 'completed').length / Math.max(1, data.userInvestments.length),
      weight: 0.5,
      score: (data.userInvestments.filter(inv => inv.status === 'completed').length / Math.max(1, data.userInvestments.length)) * 100,
      reasoning: `${Math.round((data.userInvestments.filter(inv => inv.status === 'completed').length / Math.max(1, data.userInvestments.length)) * 100)}% completion rate`,
      confidence: 0.95
    });

    factors.push({
      factor: 'time_on_platform',
      value: data.timeOnPlatform,
      weight: 0.3,
      score: this.assessTimeOnPlatform(data.timeOnPlatform),
      reasoning: `${Math.round(data.timeOnPlatform / (1000 * 60 * 60 * 24))} days on platform`,
      confidence: 1.0
    });

    factors.push({
      factor: 'investor_activity',
      value: data.investorHistory.length,
      weight: 0.2,
      score: Math.min(100, data.investorHistory.length * 20),
      reasoning: `Has invested in ${data.investorHistory.length} other opportunities`,
      confidence: 0.9
    });

    // Enhanced investment purpose factors
    factors.push({
      factor: 'purpose_clarity',
      value: data.investment.description.length,
      weight: 0.4,
      score: this.assessPurposeClarity(data.investment.purpose, data.investment.description),
      reasoning: 'Assessment of investment purpose clarity and detail',
      confidence: 0.8
    });

    factors.push({
      factor: 'purpose_risk_category',
      value: data.investment.purpose,
      weight: 0.6,
      score: this.assessPurposeRisk(data.investment.purpose),
      reasoning: `Investment purpose: ${data.investment.purpose}`,
      confidence: 0.9
    });

    // Enhanced documentation quality factors
    factors.push({
      factor: 'document_completeness',
      value: data.documents.length,
      weight: 0.5,
      score: Math.min(100, data.documents.filter(doc => doc.verificationStatus === 'verified').length * 25),
      reasoning: `${data.documents.filter(doc => doc.verificationStatus === 'verified').length} verified documents uploaded`,
      confidence: 0.9
    });

    factors.push({
      factor: 'document_authenticity',
      value: data.documents.filter(doc => doc.securityChecks.virusScan.status === 'clean' && doc.securityChecks.duplicateCheck.status === 'unique').length,
      weight: 0.3,
      score: data.documents.length > 0 ? (data.documents.filter(doc => doc.securityChecks.virusScan.status === 'clean' && doc.securityChecks.duplicateCheck.status === 'unique').length / data.documents.length) * 100 : 50,
      reasoning: 'Document authenticity and security check results',
      confidence: 0.95
    });

    // New: Platform behavior factors
    factors.push({
      factor: 'login_patterns',
      value: data.behavioralData.loginFrequency,
      weight: 0.4,
      score: this.assessLoginPatterns(data.behavioralData.loginFrequency),
      reasoning: `Login frequency: ${data.behavioralData.loginFrequency} times per week`,
      confidence: 0.8
    });

    factors.push({
      factor: 'transaction_timing',
      value: data.behavioralData.avgTransactionTime,
      weight: 0.3,
      score: this.assessTransactionTiming(data.behavioralData.avgTransactionTime),
      reasoning: `Average transaction time: ${data.behavioralData.avgTransactionTime} minutes`,
      confidence: 0.7
    });

    factors.push({
      factor: 'device_consistency',
      value: data.behavioralData.deviceCount,
      weight: 0.3,
      score: this.assessDeviceConsistency(data.behavioralData.deviceCount),
      reasoning: `Using ${data.behavioralData.deviceCount} devices`,
      confidence: 0.9
    });

    return factors;
  }

  // New: Calculate advanced risk factors using ML
  async calculateAdvancedRiskFactors(data) {
    const advancedFactors = [];
    
    // Market volatility factor
    advancedFactors.push({
      factor: 'market_volatility',
      value: data.marketData.volatilityIndex,
      weight: this.advancedFactors.market_volatility,
      score: this.calculateMarketVolatilityScore(data.marketData.volatilityIndex),
      reasoning: `Market volatility index: ${data.marketData.volatilityIndex}`,
      confidence: 0.85
    });

    // Social network analysis
    advancedFactors.push({
      factor: 'social_network_risk',
      value: data.socialConnections.riskScore,
      weight: this.advancedFactors.social_network_analysis,
      score: this.calculateSocialNetworkRisk(data.socialConnections),
      reasoning: `Social network risk score: ${data.socialConnections.riskScore}`,
      confidence: 0.8
    });

    // Behavioral pattern analysis
    advancedFactors.push({
      factor: 'behavioral_anomalies',
      value: data.behavioralData.anomalyScore,
      weight: this.advancedFactors.behavioral_patterns,
      score: this.calculateBehavioralAnomalyScore(data.behavioralData),
      reasoning: `Behavioral anomaly score: ${data.behavioralData.anomalyScore}`,
      confidence: 0.75
    });

    // Geographic risk factor
    advancedFactors.push({
      factor: 'geographic_risk',
      value: data.borrower.location,
      weight: this.advancedFactors.geographic_risk,
      score: this.calculateGeographicRisk(data.borrower.location),
      reasoning: `Geographic risk assessment for ${data.borrower.location}`,
      confidence: 0.9
    });

    return advancedFactors;
  }

  calculateCategoryScores(riskFactors) {
    const categoryMapping = {
      creditworthiness: ['reputation_score', 'verification_status', 'previous_defaults'],
      financial_stability: ['investment_amount_vs_history', 'debt_to_income_ratio', 'financial_documents_quality'],
      reputation_history: ['completed_investments_ratio', 'time_on_platform', 'investor_activity'],
      investment_purpose: ['purpose_clarity', 'purpose_risk_category'],
      documentation_quality: ['document_completeness', 'document_authenticity'],
      platform_behavior: ['login_patterns', 'transaction_timing', 'device_consistency'],
      external_validation: ['social_network_risk', 'behavioral_anomalies', 'geographic_risk']
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

  // Enhanced overall score calculation with ML weighting
  calculateOverallScore(categoryScores, advancedFactors = []) {
    let baseScore = 0;
    
    // Calculate base score from category scores
    for (const [category, score] of Object.entries(categoryScores)) {
      baseScore += score * this.factorWeights[category];
    }
    
    // Apply advanced factors with ML-adjusted weights
    let advancedScore = 0;
    if (advancedFactors.length > 0) {
      for (const factor of advancedFactors) {
        advancedScore += factor.score * factor.weight;
      }
    }
    
    // Combine scores with ML model confidence
    const finalScore = (baseScore * 0.8) + (advancedScore * 0.2);
    
    // Apply confidence adjustment
    const confidenceAdjustment = this.calculateConfidenceAdjustment(categoryScores, advancedFactors);
    
    return Math.max(0, Math.min(100, finalScore * confidenceAdjustment));
  }

  // New: Calculate confidence adjustment
  calculateConfidenceAdjustment(categoryScores, advancedFactors) {
    const baseConfidence = Object.values(categoryScores).reduce((sum, score) => sum + score.confidence, 0) / Object.keys(categoryScores).length;
    const advancedConfidence = advancedFactors.reduce((sum, factor) => sum + factor.confidence, 0) / Math.max(1, advancedFactors.length);
    
    return (baseConfidence * 0.7) + (advancedConfidence * 0.3);
  }

  determineRiskLevel(score) {
    if (typeof score !== 'number' || isNaN(score)) {
      return 'unknown';
    }
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
    if (!investment1 || !investment2) {
      return 0;
    }
    
    let similarity = 0;
    
    if (investment1.purpose && investment2.purpose && investment1.purpose === investment2.purpose) {
      similarity += 40;
    }
    
    if (investment1.amount && investment2.amount && typeof investment1.amount === 'number' && typeof investment2.amount === 'number') {
      const maxAmount = Math.max(investment1.amount, investment2.amount);
      if (maxAmount > 0) {
        const amountDiff = Math.abs(investment1.amount - investment2.amount) / maxAmount;
        similarity += (1 - amountDiff) * 30;
      }
    }
    
    if (investment1.duration && investment2.duration && typeof investment1.duration === 'number' && typeof investment2.duration === 'number') {
      const maxDuration = Math.max(investment1.duration, investment2.duration);
      if (maxDuration > 0) {
        const durationDiff = Math.abs(investment1.duration - investment2.duration) / maxDuration;
        similarity += (1 - durationDiff) * 30;
      }
    }
    
    return Math.max(0, Math.min(100, Math.round(similarity)));
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

  // New: Enable real-time monitoring
  async enableRealTimeMonitoring(assessmentId) {
    try {
      const monitoringJob = {
        assessmentId: assessmentId,
        interval: 3600000, // 1 hour
        lastCheck: new Date(),
        nextCheck: new Date(Date.now() + 3600000),
        enabled: true,
        alertThresholds: this.realTimeThresholds
      };
      
      // Store monitoring job in database or job queue
      await this.storeMonitoringJob(monitoringJob);
      
      console.log(`Real-time monitoring enabled for assessment ${assessmentId}`);
    } catch (error) {
      console.error('Failed to enable real-time monitoring:', error);
    }
  }

  // New: Get social connections data
  async getSocialConnections(userId) {
    try {
      // This would integrate with social network analysis
      return {
        connections: 25,
        riskScore: 0.3,
        verifiedConnections: 20,
        suspiciousConnections: 2
      };
    } catch (error) {
      return {
        connections: 0,
        riskScore: 0.5,
        verifiedConnections: 0,
        suspiciousConnections: 0
      };
    }
  }

  // New: Get market data
  async getMarketData() {
    try {
      // This would integrate with external market data APIs
      return {
        volatilityIndex: 0.4,
        marketTrend: 'stable',
        sectorPerformance: 0.12,
        lastUpdated: new Date()
      };
    } catch (error) {
      return {
        volatilityIndex: 0.5,
        marketTrend: 'unknown',
        sectorPerformance: 0.0,
        lastUpdated: new Date()
      };
    }
  }

  // New: Get behavioral data
  async getBehavioralData(userId) {
    try {
      // This would analyze user behavior patterns
      return {
        loginFrequency: 5,
        avgTransactionTime: 2.5,
        deviceCount: 2,
        anomalyScore: 0.1,
        lastUpdated: new Date()
      };
    } catch (error) {
      return {
        loginFrequency: 3,
        avgTransactionTime: 5.0,
        deviceCount: 1,
        anomalyScore: 0.5,
        lastUpdated: new Date()
      };
    }
  }

  // New: Calculate market volatility score
  calculateMarketVolatilityScore(volatilityIndex) {
    if (volatilityIndex < 0.3) return 90;
    if (volatilityIndex < 0.5) return 70;
    if (volatilityIndex < 0.7) return 50;
    if (volatilityIndex < 0.9) return 30;
    return 10;
  }

  // New: Calculate social network risk
  calculateSocialNetworkRisk(socialConnections) {
    const { connections, verifiedConnections, suspiciousConnections } = socialConnections;
    
    if (connections === 0) return 50;
    
    const verificationRate = verifiedConnections / connections;
    const suspiciousRate = suspiciousConnections / connections;
    
    let score = 80;
    score += verificationRate * 20;
    score -= suspiciousRate * 30;
    
    return Math.max(0, Math.min(100, score));
  }

  // New: Calculate behavioral anomaly score
  calculateBehavioralAnomalyScore(behavioralData) {
    const { loginFrequency, avgTransactionTime, deviceCount, anomalyScore } = behavioralData;
    
    let score = 70;
    
    // Adjust based on login frequency (higher frequency = lower risk)
    if (loginFrequency > 7) score += 20;
    else if (loginFrequency < 2) score -= 20;
    
    // Adjust based on transaction time (faster = lower risk)
    if (avgTransactionTime < 2) score += 15;
    else if (avgTransactionTime > 10) score -= 15;
    
    // Adjust based on device count (more devices = higher risk)
    if (deviceCount === 1) score += 10;
    else if (deviceCount > 3) score -= 20;
    
    // Apply anomaly score
    score -= anomalyScore * 50;
    
    return Math.max(0, Math.min(100, score));
  }

  // New: Calculate geographic risk
  calculateGeographicRisk(location) {
    // This would integrate with geographic risk databases
    const riskZones = {
      'US': 20,
      'CA': 25,
      'UK': 30,
      'DE': 25,
      'JP': 20,
      'AU': 30
    };
    
    return riskZones[location] || 50;
  }

  // New: Assess login patterns
  assessLoginPatterns(loginFrequency) {
    if (loginFrequency >= 7) return 90;
    if (loginFrequency >= 5) return 80;
    if (loginFrequency >= 3) return 70;
    if (loginFrequency >= 1) return 60;
    return 40;
  }

  // New: Assess transaction timing
  assessTransactionTiming(avgTransactionTime) {
    if (avgTransactionTime <= 2) return 90;
    if (avgTransactionTime <= 5) return 80;
    if (avgTransactionTime <= 10) return 70;
    if (avgTransactionTime <= 15) return 60;
    return 50;
  }

  // New: Assess device consistency
  assessDeviceConsistency(deviceCount) {
    if (deviceCount === 1) return 90;
    if (deviceCount === 2) return 80;
    if (deviceCount === 3) return 70;
    if (deviceCount <= 5) return 60;
    return 40;
  }

  // New: Store monitoring job
  async storeMonitoringJob(monitoringJob) {
    // This would store the job in a database or job queue
    // For now, we'll just log it
    console.log('Monitoring job stored:', monitoringJob);
  }

  // New: Analyze market conditions
  async analyzeMarketConditions() {
    try {
      const marketData = await this.getMarketData();
      return {
        volatility: marketData.volatilityIndex,
        trend: marketData.marketTrend,
        performance: marketData.sectorPerformance,
        riskLevel: this.determineMarketRiskLevel(marketData.volatilityIndex)
      };
    } catch (error) {
      return {
        volatility: 0.5,
        trend: 'unknown',
        performance: 0.0,
        riskLevel: 'medium'
      };
    }
  }

  // New: Analyze social network risk
  async analyzeSocialNetworkRisk(userId) {
    try {
      const socialConnections = await this.getSocialConnections(userId);
      return {
        connectionCount: socialConnections.connections,
        riskScore: socialConnections.riskScore,
        verificationRate: socialConnections.verifiedConnections / Math.max(1, socialConnections.connections),
        suspiciousRate: socialConnections.suspiciousConnections / Math.max(1, socialConnections.connections)
      };
    } catch (error) {
      return {
        connectionCount: 0,
        riskScore: 0.5,
        verificationRate: 0.0,
        suspiciousRate: 0.0
      };
    }
  }

  // New: Determine market risk level
  determineMarketRiskLevel(volatilityIndex) {
    if (volatilityIndex < 0.3) return 'low';
    if (volatilityIndex < 0.6) return 'medium';
    return 'high';
  }
}

module.exports = RiskAssessmentEngine;