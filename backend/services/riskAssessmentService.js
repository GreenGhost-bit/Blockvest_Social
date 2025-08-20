const User = require('../models/User');

class RiskAssessmentService {
  constructor() {
    this.riskFactors = {
      income: { weight: 0.25, maxScore: 25 },
      employment: { weight: 0.20, maxScore: 20 },
      creditHistory: { weight: 0.15, maxScore: 15 },
      debtToIncome: { weight: 0.15, maxScore: 15 },
      collateral: { weight: 0.10, maxScore: 10 },
      purpose: { weight: 0.10, maxScore: 10 },
      socialScore: { weight: 0.05, maxScore: 5 }
    };
  }

  // Calculate comprehensive risk score
  async calculateRiskScore(userId, assessmentData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let totalScore = 0;
      const factorScores = {};

      // Income assessment
      factorScores.income = this.assessIncome(assessmentData.income, assessmentData.incomeStability);
      totalScore += factorScores.income;

      // Employment assessment
      factorScores.employment = this.assessEmployment(assessmentData.employmentStatus, assessmentData.employmentDuration);
      totalScore += factorScores.employment;

      // Credit history assessment
      factorScores.creditHistory = this.assessCreditHistory(assessmentData.creditHistory, assessmentData.paymentHistory);
      totalScore += factorScores.creditHistory;

      // Debt-to-income ratio assessment
      factorScores.debtToIncome = this.assessDebtToIncome(assessmentData.monthlyIncome, assessmentData.monthlyDebts);
      totalScore += factorScores.debtToIncome;

      // Collateral assessment
      factorScores.collateral = this.assessCollateral(assessmentData.collateralValue, assessmentData.loanAmount);
      totalScore += factorScores.collateral;

      // Purpose assessment
      factorScores.purpose = this.assessPurpose(assessmentData.loanPurpose, assessmentData.businessPlan);
      totalScore += factorScores.purpose;

      // Social score assessment
      factorScores.socialScore = this.assessSocialScore(user.reputation_score, user.connections.length);
      totalScore += factorScores.socialScore;

      // Normalize score to 0-100 range
      const normalizedScore = Math.min(100, Math.max(0, totalScore));

      return {
        riskScore: normalizedScore,
        riskLevel: this.getRiskLevel(normalizedScore),
        factorScores,
        recommendations: this.generateRecommendations(factorScores, normalizedScore),
        maxLoanAmount: this.calculateMaxLoanAmount(normalizedScore, assessmentData.monthlyIncome),
        suggestedInterestRate: this.calculateSuggestedInterestRate(normalizedScore)
      };
    } catch (error) {
      console.error('Error calculating risk score:', error);
      throw error;
    }
  }

  // Assess income factor
  assessIncome(monthlyIncome, stability) {
    let score = 0;
    
    // Income amount scoring
    if (monthlyIncome >= 5000) score += 15;
    else if (monthlyIncome >= 3000) score += 12;
    else if (monthlyIncome >= 2000) score += 8;
    else if (monthlyIncome >= 1000) score += 4;
    
    // Income stability scoring
    if (stability === 'stable') score += 10;
    else if (stability === 'moderate') score += 6;
    else if (stability === 'unstable') score += 2;
    
    return Math.min(25, score);
  }

  // Assess employment factor
  assessEmployment(status, duration) {
    let score = 0;
    
    // Employment status scoring
    if (status === 'full_time') score += 12;
    else if (status === 'part_time') score += 8;
    else if (status === 'self_employed') score += 6;
    else if (status === 'contract') score += 4;
    else if (status === 'unemployed') score += 0;
    
    // Employment duration scoring
    if (duration >= 60) score += 8;
    else if (duration >= 36) score += 6;
    else if (duration >= 24) score += 4;
    else if (duration >= 12) score += 2;
    
    return Math.min(20, score);
  }

  // Assess credit history factor
  assessCreditHistory(creditHistory, paymentHistory) {
    let score = 0;
    
    // Credit history scoring
    if (creditHistory === 'excellent') score += 10;
    else if (creditHistory === 'good') score += 8;
    else if (creditHistory === 'fair') score += 5;
    else if (creditHistory === 'poor') score += 2;
    else if (creditHistory === 'none') score += 0;
    
    // Payment history scoring
    if (paymentHistory >= 95) score += 5;
    else if (paymentHistory >= 90) score += 3;
    else if (paymentHistory >= 80) score += 1;
    
    return Math.min(15, score);
  }

  // Assess debt-to-income ratio factor
  assessDebtToIncome(monthlyIncome, monthlyDebts) {
    if (monthlyIncome === 0) return 0;
    
    const ratio = monthlyDebts / monthlyIncome;
    let score = 15;
    
    if (ratio > 0.5) score = 0;
    else if (ratio > 0.4) score = 3;
    else if (ratio > 0.3) score = 6;
    else if (ratio > 0.2) score = 9;
    else if (ratio > 0.1) score = 12;
    
    return score;
  }

  // Assess collateral factor
  assessCollateral(collateralValue, loanAmount) {
    if (collateralValue === 0 || loanAmount === 0) return 0;
    
    const ratio = collateralValue / loanAmount;
    let score = 0;
    
    if (ratio >= 2.0) score = 10;
    else if (ratio >= 1.5) score = 8;
    else if (ratio >= 1.2) score = 6;
    else if (ratio >= 1.0) score = 4;
    
    return score;
  }

  // Assess loan purpose factor
  assessPurpose(purpose, businessPlan) {
    let score = 0;
    
    // Purpose scoring
    const purposeScores = {
      'business_expansion': 8,
      'education': 7,
      'home_improvement': 6,
      'debt_consolidation': 5,
      'emergency': 4,
      'personal': 3
    };
    
    score += purposeScores[purpose] || 3;
    
    // Business plan scoring
    if (businessPlan && businessPlan.length > 100) score += 2;
    
    return Math.min(10, score);
  }

  // Assess social score factor
  assessSocialScore(reputationScore, connectionsCount) {
    let score = 0;
    
    // Reputation score scoring
    if (reputationScore >= 800) score += 3;
    else if (reputationScore >= 600) score += 2;
    else if (reputationScore >= 400) score += 1;
    
    // Connections scoring
    if (connectionsCount >= 20) score += 2;
    else if (connectionsCount >= 10) score += 1;
    
    return Math.min(5, score);
  }

  // Get risk level based on score
  getRiskLevel(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'very_high';
  }

  // Generate recommendations based on factor scores
  generateRecommendations(factorScores, totalScore) {
    const recommendations = [];
    
    if (factorScores.income < 15) {
      recommendations.push('Consider increasing your income or providing additional income sources');
    }
    
    if (factorScores.employment < 12) {
      recommendations.push('Stable employment history would improve your risk profile');
    }
    
    if (factorScores.creditHistory < 10) {
      recommendations.push('Building a positive credit history will help your application');
    }
    
    if (factorScores.debtToIncome < 10) {
      recommendations.push('Reducing your debt-to-income ratio will improve your eligibility');
    }
    
    if (factorScores.collateral < 6) {
      recommendations.push('Providing collateral can improve your loan terms');
    }
    
    if (totalScore < 50) {
      recommendations.push('Consider a smaller loan amount for your first application');
    }
    
    return recommendations;
  }

  // Calculate maximum loan amount based on risk score
  calculateMaxLoanAmount(riskScore, monthlyIncome) {
    const baseMultiplier = riskScore / 100;
    const maxMultiplier = 12; // Maximum 12 months of income
    
    return Math.round(monthlyIncome * baseMultiplier * maxMultiplier);
  }

  // Calculate suggested interest rate based on risk score
  calculateSuggestedInterestRate(riskScore) {
    if (riskScore >= 80) return 5; // Low risk: 5%
    if (riskScore >= 60) return 8; // Medium risk: 8%
    if (riskScore >= 40) return 12; // High risk: 12%
    return 18; // Very high risk: 18%
  }

  // Update user risk assessment
  async updateUserRiskAssessment(userId, assessmentResult) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.risk_score = assessmentResult.riskScore;
      user.risk_factors = Object.entries(assessmentResult.factorScores).map(([factor, score]) => ({
        factor,
        weight: this.riskFactors[factor]?.weight || 0,
        score
      }));
      user.risk_assessment_date = new Date();

      await user.save();
      return user;
    } catch (error) {
      console.error('Error updating user risk assessment:', error);
      throw error;
    }
  }

  // Get risk assessment history
  async getRiskAssessmentHistory(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      // This would typically come from a separate risk assessment history collection
      // For now, return current assessment as placeholder
      return [{
        date: user.risk_assessment_date,
        score: user.risk_score,
        factors: user.risk_factors
      }];
    } catch (error) {
      console.error('Error getting risk assessment history:', error);
      return [];
    }
  }
}

module.exports = RiskAssessmentService; 