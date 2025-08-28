const mongoose = require('mongoose');

const riskFactorSchema = new mongoose.Schema({
  factor: {
    type: String,
    required: [true, 'Risk factor name is required'],
    trim: true,
    maxlength: [100, 'Risk factor name cannot exceed 100 characters']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Risk factor value is required']
  },
  weight: {
    type: Number,
    required: [true, 'Risk factor weight is required'],
    min: [0, 'Weight cannot be negative'],
    max: [1, 'Weight cannot exceed 1'],
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 1;
      },
      message: 'Weight must be between 0 and 1'
    }
  },
  score: {
    type: Number,
    required: [true, 'Risk factor score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100'],
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Score must be between 0 and 100'
    }
  },
  reasoning: {
    type: String,
    trim: true,
    maxlength: [500, 'Reasoning cannot exceed 500 characters']
  }
});

const riskAssessmentSchema = new mongoose.Schema({
  investment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: [true, 'Investment reference is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid investment ID'
    }
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Borrower reference is required'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid borrower ID'
    }
  },
  assessmentVersion: {
    type: String,
    required: [true, 'Assessment version is required'],
    default: '1.0',
    validate: {
      validator: function(v) {
        return /^\d+\.\d+$/.test(v);
      },
      message: 'Invalid version format. Use format: X.Y'
    }
  },
  overallRiskScore: {
    type: Number,
    required: [true, 'Overall risk score is required'],
    min: [0, 'Risk score cannot be negative'],
    max: [100, 'Risk score cannot exceed 100'],
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Risk score must be between 0 and 100'
    }
  },
  riskLevel: {
    type: String,
    enum: {
      values: ['very_low', 'low', 'medium', 'high', 'very_high'],
      message: 'Invalid risk level'
    },
    required: [true, 'Risk level is required']
  },
  riskFactors: {
    type: [riskFactorSchema],
    validate: {
      validator: function(v) {
        if (!Array.isArray(v)) return false;
        if (v.length === 0) return false;
        
        // Check if weights sum to approximately 1
        const totalWeight = v.reduce((sum, factor) => sum + factor.weight, 0);
        return Math.abs(totalWeight - 1) < 0.01;
      },
      message: 'Risk factors must be provided and weights must sum to 1'
    }
  },
  categoryScores: {
    creditworthiness: {
      score: {
        type: Number,
        min: [0, 'Creditworthiness score cannot be negative'],
        max: [100, 'Creditworthiness score cannot exceed 100']
      },
      weight: {
        type: Number,
        min: [0, 'Creditworthiness weight cannot be negative'],
        max: [1, 'Creditworthiness weight cannot exceed 1']
      },
      factors: [{
        type: String,
        trim: true,
        maxlength: [100, 'Factor description cannot exceed 100 characters']
      }]
    },
    financial_stability: {
      score: {
        type: Number,
        min: [0, 'Financial stability score cannot be negative'],
        max: [100, 'Financial stability score cannot exceed 100']
      },
      weight: {
        type: Number,
        min: [0, 'Financial stability weight cannot be negative'],
        max: [1, 'Financial stability weight cannot exceed 1']
      },
      factors: [{
        type: String,
        trim: true,
        maxlength: [100, 'Factor description cannot exceed 100 characters']
      }]
    },
    reputation_history: {
      score: {
        type: Number,
        min: [0, 'Reputation history score cannot be negative'],
        max: [100, 'Reputation history score cannot exceed 100']
      },
      weight: {
        type: Number,
        min: [0, 'Reputation history weight cannot be negative'],
        max: [1, 'Reputation history weight cannot exceed 1']
      },
      factors: [{
        type: String,
        trim: true,
        maxlength: [100, 'Factor description cannot exceed 100 characters']
      }]
    },
    investment_purpose: {
      score: {
        type: Number,
        min: [0, 'Investment purpose score cannot be negative'],
        max: [100, 'Investment purpose score cannot exceed 100']
      },
      weight: {
        type: Number,
        min: [0, 'Investment purpose weight cannot be negative'],
        max: [1, 'Investment purpose weight cannot exceed 1']
      },
      factors: [{
        type: String,
        trim: true,
        maxlength: [100, 'Factor description cannot exceed 100 characters']
      }]
    },
    documentation_quality: {
      score: {
        type: Number,
        min: [0, 'Documentation quality score cannot be negative'],
        max: [100, 'Documentation quality score cannot exceed 100']
      },
      weight: {
        type: Number,
        min: [0, 'Documentation quality weight cannot be negative'],
        max: [1, 'Documentation quality weight cannot exceed 1']
      },
      factors: [{
        type: String,
        trim: true,
        maxlength: [100, 'Factor description cannot exceed 100 characters']
      }]
    },
    platform_behavior: {
      score: {
        type: Number,
        min: [0, 'Platform behavior score cannot be negative'],
        max: [100, 'Platform behavior score cannot exceed 100']
      },
      weight: {
        type: Number,
        min: [0, 'Platform behavior weight cannot be negative'],
        max: [1, 'Platform behavior weight cannot exceed 1']
      },
      factors: [{
        type: String,
        trim: true,
        maxlength: [100, 'Factor description cannot exceed 100 characters']
      }]
    },
    external_validation: {
      score: {
        type: Number,
        min: [0, 'External validation score cannot be negative'],
        max: [100, 'External validation score cannot exceed 100']
      },
      weight: {
        type: Number,
        min: [0, 'External validation weight cannot be negative'],
        max: [1, 'External validation weight cannot exceed 1']
      },
      factors: [{
        type: String,
        trim: true,
        maxlength: [100, 'Factor description cannot exceed 100 characters']
      }]
    }
  },
  recommendations: [{
    type: {
      type: String,
      enum: {
        values: ['approve', 'conditional_approve', 'request_more_info', 'reject', 'monitor'],
        message: 'Invalid recommendation type'
      },
      required: [true, 'Recommendation type is required']
    },
    reasoning: {
      type: String,
      required: [true, 'Recommendation reasoning is required'],
      trim: true,
      maxlength: [500, 'Reasoning cannot exceed 500 characters']
    },
    conditions: [{
      type: String,
      trim: true,
      maxlength: [200, 'Condition cannot exceed 200 characters']
    }],
    suggestedInterestRate: {
      min: {
        type: Number,
        min: [0, 'Minimum interest rate cannot be negative'],
        max: [100, 'Minimum interest rate cannot exceed 100%']
      },
      max: {
        type: Number,
        min: [0, 'Maximum interest rate cannot be negative'],
        max: [100, 'Maximum interest rate cannot exceed 100%']
      },
      validate: {
        validator: function(v) {
          if (!v.min || !v.max) return true;
          return v.min <= v.max;
        },
        message: 'Minimum interest rate must be less than or equal to maximum'
      }
    },
    suggestedAmount: {
      min: {
        type: Number,
        min: [0, 'Minimum suggested amount cannot be negative'],
        max: [1, 'Minimum suggested amount cannot exceed 1']
      },
      max: {
        type: Number,
        min: [0, 'Maximum suggested amount cannot be negative'],
        max: [1, 'Maximum suggested amount cannot exceed 1']
      },
      validate: {
        validator: function(v) {
          if (!v.min || !v.max) return true;
          return v.min <= v.max;
        },
        message: 'Minimum suggested amount must be less than or equal to maximum'
      }
    },
    monitoringFlags: [{
      type: String,
      trim: true,
      maxlength: [100, 'Monitoring flag cannot exceed 100 characters']
    }]
  }],
  algorithmMetadata: {
    modelVersion: {
      type: String,
      trim: true,
      maxlength: [50, 'Model version cannot exceed 50 characters']
    },
    computationTime: {
      type: Number,
      min: [0, 'Computation time cannot be negative']
    },
    dataSourcesUsed: [{
      type: String,
      trim: true,
      maxlength: [100, 'Data source name cannot exceed 100 characters']
    }],
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be negative'],
      max: [1, 'Confidence cannot exceed 1'],
      validate: {
        validator: function(v) {
          if (!v) return true;
          return v >= 0 && v <= 1;
        },
        message: 'Confidence must be between 0 and 1'
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Last updated date cannot be in the future'
      }
    }
  },
  manualOverrides: [{
    factor: {
      type: String,
      required: [true, 'Override factor is required'],
      trim: true,
      maxlength: [100, 'Factor name cannot exceed 100 characters']
    },
    originalScore: {
      type: Number,
      required: [true, 'Original score is required'],
      min: [0, 'Original score cannot be negative'],
      max: [100, 'Original score cannot exceed 100']
    },
    newScore: {
      type: Number,
      required: [true, 'New score is required'],
      min: [0, 'New score cannot be negative'],
      max: [100, 'New score cannot exceed 100']
    },
    reason: {
      type: String,
      required: [true, 'Override reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Override user is required'],
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid override user ID'
      }
    },
    overriddenAt: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Override timestamp cannot be in the future'
      }
    }
  }],
  historicalComparisons: {
    similarInvestments: [{
      investmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Investment',
        validate: {
          validator: function(v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: 'Invalid similar investment ID'
        }
      },
      similarityScore: {
        type: Number,
        min: [0, 'Similarity score cannot be negative'],
        max: [1, 'Similarity score cannot exceed 1']
      },
      outcome: {
        type: String,
        enum: {
          values: ['successful', 'defaulted', 'ongoing', 'unknown'],
          message: 'Invalid outcome value'
        }
      },
      relevantFactors: [{
        type: String,
        trim: true,
        maxlength: [100, 'Factor description cannot exceed 100 characters']
      }]
    }],
    borrowerHistory: {
      previousAssessments: [{
        assessmentId: {
          type: mongoose.Schema.Types.ObjectId,
          validate: {
            validator: function(v) {
              return mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid previous assessment ID'
          }
        },
        riskScore: {
          type: Number,
          min: [0, 'Risk score cannot be negative'],
          max: [100, 'Risk score cannot exceed 100']
        },
        outcome: {
          type: String,
          enum: {
            values: ['successful', 'defaulted', 'ongoing', 'unknown'],
            message: 'Invalid outcome value'
          }
        },
        assessedAt: {
          type: Date,
          validate: {
            validator: function(v) {
              return v <= new Date();
            },
            message: 'Assessment date cannot be in the future'
          }
        }
      }],
      riskTrend: {
        type: String,
        enum: {
          values: ['improving', 'stable', 'deteriorating', 'insufficient_data'],
          message: 'Invalid risk trend value'
        }
      }
    }
  },
  assessedAt: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Assessment date cannot be in the future'
    }
  },
  assessedBy: {
    type: String,
    enum: {
      values: ['algorithm', 'manual', 'hybrid'],
      message: 'Invalid assessment method'
    },
    default: 'algorithm'
  },
  lastReassessment: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v <= new Date();
      },
      message: 'Last reassessment date cannot be in the future'
    }
  },
  nextReassessment: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v > new Date();
      },
      message: 'Next reassessment date must be in the future'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
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