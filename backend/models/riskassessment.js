const mongoose = require('mongoose');

const riskFactorSchema = new mongoose.Schema({
  factor: {
    type: String,
    required: true
  },
  value: mongoose.Schema.Types.Mixed,
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  reasoning: String
});

const riskAssessmentSchema = new mongoose.Schema({
  investment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true,
    unique: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentVersion: {
    type: String,
    required: true,
    default: '1.0'
  },
  overallRiskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    required: true
  },
  riskFactors: [riskFactorSchema],
  categoryScores: {
    creditworthiness: {
      score: Number,
      weight: Number,
      factors: [String]
    },
    financial_stability: {
      score: Number,
      weight: Number,
      factors: [String]
    },
    reputation_history: {
      score: Number,
      weight: Number,
      factors: [String]
    },
    investment_purpose: {
      score: Number,
      weight: Number,
      factors: [String]
    },
    documentation_quality: {
      score: Number,
      weight: Number,
      factors: [String]
    },
    platform_behavior: {
      score: Number,
      weight: Number,
      factors: [String]
    },
    external_validation: {
      score: Number,
      weight: Number,
      factors: [String]
    }
  },
  recommendations: [{
    type: {
      type: String,
      enum: ['approve', 'conditional_approve', 'request_more_info', 'reject', 'monitor']
    },
    reasoning: String,
    conditions: [String],
    suggestedInterestRate: {
      min: Number,
      max: Number
    },
    suggestedAmount: {
      min: Number,
      max: Number
    },
    monitoringFlags: [String]
  }],
  algorithmMetadata: {
    modelVersion: String,
    computationTime: Number,
    dataSourcesUsed: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    lastUpdated: Date
  },
  manualOverrides: [{
    factor: String,
    originalScore: Number,
    newScore: Number,
    reason: String,
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    overriddenAt: {
      type: Date,
      default: Date.now
    }
  }],
  historicalComparisons: {
    similarInvestments: [{
      investmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Investment'
      },
      similarityScore: Number,
      outcome: String,
      relevantFactors: [String]
    }],
    borrowerHistory: {
      previousAssessments: [{
        assessmentId: mongoose.Schema.Types.ObjectId,
        riskScore: Number,
        outcome: String,
        assessedAt: Date
      }],
      riskTrend: {
        type: String,
        enum: ['improving', 'stable', 'deteriorating', 'insufficient_data']
      }
    }
  },
  assessedAt: {
    type: Date,
    default: Date.now
  },
  assessedBy: {
    type: String,
    enum: ['algorithm', 'manual', 'hybrid'],
    default: 'algorithm'
  },
  lastReassessment: Date,
  nextReassessment: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

riskAssessmentSchema.index({ investment: 1 });
riskAssessmentSchema.index({ borrower: 1 });
riskAssessmentSchema.index({ overallRiskScore: 1 });
riskAssessmentSchema.index({ riskLevel: 1 });
riskAssessmentSchema.index({ assessedAt: -1 });

riskAssessmentSchema.methods.calculateRiskLevel = function() {
  const score = this.overallRiskScore;
  if (score >= 80) return 'very_low';
  if (score >= 65) return 'low';
  if (score >= 45) return 'medium';
  if (score >= 25) return 'high';
  return 'very_high';
};

riskAssessmentSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  const riskLevel = this.riskLevel;
  const score = this.overallRiskScore;

  switch (riskLevel) {
    case 'very_low':
      recommendations.push({
        type: 'approve',
        reasoning: 'Excellent risk profile with strong indicators across all categories',
        suggestedInterestRate: { min: 3, max: 8 },
        suggestedAmount: { min: 0.8, max: 1.0 }
      });
      break;
      
    case 'low':
      recommendations.push({
        type: 'approve',
        reasoning: 'Good risk profile with minor concerns that can be monitored',
        suggestedInterestRate: { min: 6, max: 12 },
        suggestedAmount: { min: 0.7, max: 0.9 },
        monitoringFlags: ['payment_schedule', 'communication_responsiveness']
      });
      break;
      
    case 'medium':
      recommendations.push({
        type: 'conditional_approve',
        reasoning: 'Moderate risk requiring additional safeguards and monitoring',
        conditions: [
          'Require additional documentation',
          'Implement milestone-based funding',
          'Increase monitoring frequency'
        ],
        suggestedInterestRate: { min: 10, max: 18 },
        suggestedAmount: { min: 0.5, max: 0.8 },
        monitoringFlags: ['payment_schedule', 'purpose_verification', 'financial_updates']
      });
      break;
      
    case 'high':
      recommendations.push({
        type: 'request_more_info',
        reasoning: 'High risk requiring substantial additional information before approval',
        conditions: [
          'Provide comprehensive financial statements',
          'Submit additional references',
          'Complete enhanced verification process',
          'Consider co-signer requirement'
        ],
        suggestedInterestRate: { min: 15, max: 25 },
        suggestedAmount: { min: 0.3, max: 0.6 }
      });
      break;
      
    case 'very_high':
      recommendations.push({
        type: 'reject',
        reasoning: 'Very high risk profile with multiple concerning factors',
        conditions: [
          'Improve credit history',
          'Provide additional collateral',
          'Complete financial counseling',
          'Reapply after 6 months with improved profile'
        ]
      });
      break;
  }

  return recommendations;
};

riskAssessmentSchema.methods.scheduleReassessment = function() {
  const nextDate = new Date();
  
  switch (this.riskLevel) {
    case 'very_low':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'low':
      nextDate.setMonth(nextDate.getMonth() + 4);
      break;
    case 'medium':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'high':
      nextDate.setMonth(nextDate.getMonth() + 2);
      break;
    case 'very_high':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }
  
  this.nextReassessment = nextDate;
};

riskAssessmentSchema.statics.getAverageRiskByCategory = async function(category, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  const pipeline = [
    {
      $match: {
        assessedAt: { $gte: startDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: `$categoryScores.${category}.score`,
        averageScore: { $avg: `$categoryScores.${category}.score` },
        count: { $sum: 1 }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

riskAssessmentSchema.statics.getRiskTrends = async function(borrowerId, months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return this.find({
    borrower: borrowerId,
    assessedAt: { $gte: startDate },
    isActive: true
  }).sort({ assessedAt: 1 }).select('overallRiskScore riskLevel assessedAt');
};

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);