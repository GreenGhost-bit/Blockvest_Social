const { logger } = require('../middleware/errorHandler');

class RiskAssessmentService {
  constructor() {
    this.riskFactors = {
      income: { weight: 0.25, maxScore: 100 },
      creditHistory: { weight: 0.20, maxScore: 100 },
      employment: { weight: 0.15, maxScore: 100 },
      debtToIncome: { weight: 0.20, maxScore: 100 },
      purpose: { weight: 0.10, maxScore: 100 },
      verification: { weight: 0.10, maxScore: 100 }
    };
  }

  // Calculate risk score based on multiple factors
  calculateRiskScore(assessmentData) {
    try {
      const scores = {};
      let totalScore = 0;
      let totalWeight = 0;

      // Income level scoring
      scores.income = this.calculateIncomeScore(assessmentData.monthly_income, assessmentData.income_level);
      
      // Credit history scoring
      scores.creditHistory = this.calculateCreditHistoryScore(assessmentData.credit_history);
      
      // Employment status scoring
      scores.employment = this.calculateEmploymentScore(assessmentData.employment_status, assessmentData.employment_duration);
      
      // Debt-to-income ratio scoring
      scores.debtToIncome = this.calculateDebtToIncomeScore(assessmentData.monthly_income, assessmentData.existing_debts);
      
      // Purpose scoring
      scores.purpose = this.calculatePurposeScore(assessmentData.purpose, assessmentData.amount);
      
      // Verification scoring
      scores.verification = this.calculateVerificationScore(assessmentData.verification_status);

      // Calculate weighted score
      for (const [factor, score] of Object.entries(scores)) {
        const weight = this.riskFactors[factor]?.weight || 0;
        totalScore += score * weight;
        totalWeight += weight;
      }

      const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
      
      logger.info('Risk score calculated', {
        userId: assessmentData.userId,
        finalScore,
        factorScores: scores
      });

      return {
        riskScore: finalScore,
        riskLevel: this.getRiskLevel(finalScore),
        factorScores: scores,
        recommendations: this.generateRecommendations(scores, finalScore)
      };
    } catch (error) {
      logger.error('Failed to calculate risk score', { error: error.message });
      throw new Error('Risk assessment calculation failed');
    }
  }

  // Calculate income score
  calculateIncomeScore(monthlyIncome, incomeLevel) {
    let score = 0;
    
    // Base score from income level
    switch (incomeLevel) {
      case 'high':
        score = 80;
        break;
      case 'medium':
        score = 60;
        break;
      case 'low':
        score = 40;
        break;
      default:
        score = 30;
    }

    // Adjust based on actual income amount
    if (monthlyIncome >= 5000) {
      score += 20;
    } else if (monthlyIncome >= 3000) {
      score += 10;
    } else if (monthlyIncome >= 1500) {
      score += 5;
    }

    return Math.min(score, this.riskFactors.income.maxScore);
  }

  // Calculate credit history score
  calculateCreditHistoryScore(creditHistory) {
    switch (creditHistory) {
      case 'excellent':
        return 100;
      case 'good':
        return 80;
      case 'fair':
        return 60;
      case 'poor':
        return 30;
      case 'none':
        return 20;
      default:
        return 10;
    }
  }

  // Calculate employment score
  calculateEmploymentScore(employmentStatus, employmentDuration) {
    let score = 0;
    
    // Base score from employment status
    switch (employmentStatus) {
      case 'employed':
        score = 80;
        break;
      case 'self_employed':
        score = 70;
        break;
      case 'student':
        score = 50;
        break;
      case 'unemployed':
        score = 20;
        break;
      default:
        score = 30;
    }

    // Adjust based on employment duration
    if (employmentDuration >= 24) { // 2+ years
      score += 20;
    } else if (employmentDuration >= 12) { // 1+ years
      score += 10;
    } else if (employmentDuration >= 6) { // 6+ months
      score += 5;
    }

    return Math.min(score, this.riskFactors.employment.maxScore);
  }

  // Calculate debt-to-income ratio score
  calculateDebtToIncomeScore(monthlyIncome, existingDebts) {
    if (monthlyIncome <= 0) return 0;
    
    const debtToIncomeRatio = existingDebts / monthlyIncome;
    
    if (debtToIncomeRatio <= 0.2) {
      return 100;
    } else if (debtToIncomeRatio <= 0.3) {
      return 80;
    } else if (debtToIncomeRatio <= 0.4) {
      return 60;
    } else if (debtToIncomeRatio <= 0.5) {
      return 40;
    } else {
      return 20;
    }
  }

  // Calculate purpose score
  calculatePurposeScore(purpose, amount) {
    let score = 60; // Base score
    
    // Positive factors
    const positiveKeywords = ['education', 'business', 'medical', 'home', 'vehicle', 'emergency'];
    const negativeKeywords = ['gambling', 'luxury', 'entertainment', 'vacation'];
    
    const purposeLower = purpose.toLowerCase();
    
    // Check for positive keywords
    for (const keyword of positiveKeywords) {
      if (purposeLower.includes(keyword)) {
        score += 20;
        break;
      }
    }
    
    // Check for negative keywords
    for (const keyword of negativeKeywords) {
      if (purposeLower.includes(keyword)) {
        score -= 30;
        break;
      }
    }
    
    // Adjust based on amount (reasonable amounts get higher scores)
    if (amount <= 1000) {
      score += 10;
    } else if (amount <= 5000) {
      score += 5;
    } else if (amount > 10000) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(score, this.riskFactors.purpose.maxScore));
  }

  // Calculate verification score
  calculateVerificationScore(verificationStatus) {
    switch (verificationStatus) {
      case 'verified':
        return 100;
      case 'pending':
        return 50;
      case 'unverified':
        return 20;
      default:
        return 10;
    }
  }

  // Get risk level based on score
  getRiskLevel(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'very_high';
  }

  // Generate recommendations based on risk factors
  generateRecommendations(factorScores, overallScore) {
    const recommendations = [];
    
    if (factorScores.income < 50) {
      recommendations.push('Consider providing additional income documentation');
    }
    
    if (factorScores.creditHistory < 40) {
      recommendations.push('Build credit history through small loans or credit cards');
    }
    
    if (factorScores.employment < 50) {
      recommendations.push('Consider stable employment or longer employment history');
    }
    
    if (factorScores.debtToIncome < 50) {
      recommendations.push('Reduce existing debt before applying for new loans');
    }
    
    if (factorScores.purpose < 50) {
      recommendations.push('Provide more detailed explanation of loan purpose');
    }
    
    if (factorScores.verification < 50) {
      recommendations.push('Complete account verification process');
    }
    
    if (overallScore < 40) {
      recommendations.push('Consider smaller loan amounts or co-signer options');
    }
    
    return recommendations;
  }

  // Calculate maximum loan amount based on risk score
  calculateMaxLoanAmount(riskScore, monthlyIncome) {
    const baseMultiplier = monthlyIncome * 0.3; // 30% of monthly income
    
    if (riskScore >= 80) {
      return baseMultiplier * 3; // Up to 3 months of income
    } else if (riskScore >= 60) {
      return baseMultiplier * 2; // Up to 2 months of income
    } else if (riskScore >= 40) {
      return baseMultiplier * 1.5; // Up to 1.5 months of income
    } else {
      return baseMultiplier; // Up to 1 month of income
    }
  }

  // Calculate recommended interest rate based on risk score
  calculateRecommendedInterestRate(riskScore) {
    const baseRate = 5; // Base 5% interest rate
    
    if (riskScore >= 80) {
      return baseRate + 2; // 7%
    } else if (riskScore >= 60) {
      return baseRate + 5; // 10%
    } else if (riskScore >= 40) {
      return baseRate + 10; // 15%
    } else {
      return baseRate + 20; // 25%
    }
  }

  // Assess investment risk for investors
  assessInvestmentRisk(investment, borrowerRiskScore) {
    const investmentRisk = {
      low: 0.1,
      medium: 0.3,
      high: 0.6,
      very_high: 0.9
    };
    
    const borrowerRiskLevel = this.getRiskLevel(borrowerRiskScore);
    const defaultProbability = investmentRisk[borrowerRiskLevel] || 0.5;
    
    return {
      riskLevel: borrowerRiskLevel,
      defaultProbability,
      expectedReturn: this.calculateExpectedReturn(investment.interestRate, defaultProbability),
      recommendation: this.getInvestmentRecommendation(borrowerRiskLevel)
    };
  }

  // Calculate expected return
  calculateExpectedReturn(interestRate, defaultProbability) {
    const successProbability = 1 - defaultProbability;
    return (interestRate * successProbability) - (100 * defaultProbability);
  }

  // Get investment recommendation
  getInvestmentRecommendation(riskLevel) {
    switch (riskLevel) {
      case 'low':
        return 'Safe investment with low risk of default';
      case 'medium':
        return 'Moderate risk investment with good potential returns';
      case 'high':
        return 'High risk investment, consider diversifying portfolio';
      case 'very_high':
        return 'Very high risk, only invest what you can afford to lose';
      default:
        return 'Risk assessment incomplete';
    }
  }

  // Update risk score based on payment history
  updateRiskScoreWithPaymentHistory(currentScore, paymentHistory) {
    let adjustment = 0;
    
    // Positive adjustments for good payment history
    if (paymentHistory.onTimePayments > 0) {
      adjustment += Math.min(paymentHistory.onTimePayments * 2, 20);
    }
    
    // Negative adjustments for late payments
    if (paymentHistory.latePayments > 0) {
      adjustment -= Math.min(paymentHistory.latePayments * 5, 30);
    }
    
    // Negative adjustments for defaults
    if (paymentHistory.defaults > 0) {
      adjustment -= Math.min(paymentHistory.defaults * 20, 50);
    }
    
    const newScore = Math.max(0, Math.min(100, currentScore + adjustment));
    
    logger.info('Risk score updated with payment history', {
      previousScore: currentScore,
      newScore,
      adjustment,
      paymentHistory
    });
    
    return newScore;
  }
}

module.exports = new RiskAssessmentService(); 