const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  // Blockchain Information
  app_id: {
    type: Number,
    required: [true, 'App ID is required'],
    unique: true,
    min: [1, 'App ID must be a positive number']
  },
  tx_id: {
    type: String,
    required: [true, 'Transaction ID is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z2-7]{52}$/.test(v) || /^[a-f0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction ID format'
    }
  },
  
  // Investment Details
  amount: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: [0.001, 'Minimum investment amount is 0.001 ALGO'],
    validate: {
      validator: function(v) {
        return v > 0 && v <= 1000000; // Max 1M ALGO
      },
      message: 'Investment amount must be between 0.001 and 1,000,000 ALGO'
    }
  },
  purpose: {
    type: String,
    required: [true, 'Investment purpose is required'],
    trim: true,
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  interest_rate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate cannot be negative'],
    max: [100, 'Interest rate cannot exceed 100%'],
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Interest rate must be between 0% and 100%'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Investment duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= 1 && v <= 365;
      },
      message: 'Duration must be a whole number between 1 and 365 days'
    }
  },
  
  // Parties
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Borrower is required'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid borrower ID'
    }
  },
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid investor ID'
    }
  },
  
  // Status and Timeline
  status: {
    type: String,
    enum: {
      values: ['pending', 'active', 'completed', 'defaulted', 'paused', 'cancelled'],
      message: 'Invalid investment status'
    },
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Creation date cannot be in the future'
    }
  },
  funded_at: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v >= this.created_at;
      },
      message: 'Funding date cannot be before creation date'
    }
  },
  completed_at: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v >= this.funded_at;
      },
      message: 'Completion date cannot be before funding date'
    }
  },
  due_date: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v > this.funded_at;
      },
      message: 'Due date must be after funding date'
    }
  },
  
  // Financial Information
  repayment_amount: {
    type: Number,
    default: null,
    min: [0, 'Repayment amount cannot be negative'],
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v >= this.amount;
      },
      message: 'Repayment amount must be greater than or equal to investment amount'
    }
  },
  amount_repaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount repaid cannot be negative'],
    validate: {
      validator: function(v) {
        if (!this.repayment_amount) return true;
        return v <= this.repayment_amount;
      },
      message: 'Amount repaid cannot exceed repayment amount'
    }
  },
  remaining_balance: {
    type: Number,
    default: null,
    min: [0, 'Remaining balance cannot be negative']
  },
  
  // Risk and Verification
  risk_score: {
    type: Number,
    min: [0, 'Risk score cannot be negative'],
    max: [100, 'Risk score cannot exceed 100'],
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v >= 0 && v <= 100;
      },
      message: 'Risk score must be between 0 and 100'
    }
  },
  verification_status: {
    type: String,
    enum: {
      values: ['pending', 'verified', 'rejected', 'under_review'],
      message: 'Invalid verification status'
    },
    default: 'pending'
  },
  
  // Repayment History
  repayments: [{
    amount: {
      type: Number,
      required: [true, 'Repayment amount is required'],
      min: [0.001, 'Repayment amount must be at least 0.001 ALGO']
    },
    tx_id: {
      type: String,
      required: [true, 'Repayment transaction ID is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^[A-Z2-7]{52}$/.test(v) || /^[a-f0-9]{64}$/.test(v);
        },
        message: 'Invalid repayment transaction ID format'
      }
    },
    timestamp: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Repayment timestamp cannot be in the future'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'failed', 'cancelled'],
        message: 'Invalid repayment status'
      },
      default: 'pending'
    }
  }],
  
  // Social Features
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid user ID in likes'
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment user is required'],
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid comment user ID'
      }
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Comment timestamp cannot be in the future'
      }
    }
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  shares: {
    type: Number,
    default: 0,
    min: [0, 'Share count cannot be negative']
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return v.length > 0 && v.length <= 50;
      },
      message: 'Tag must be between 1 and 50 characters'
    }
  }],
  category: {
    type: String,
    enum: {
      values: ['education', 'business', 'medical', 'home', 'vehicle', 'emergency', 'technology', 'agriculture', 'other'],
      message: 'Invalid investment category'
    },
    default: 'other'
  },
  
  // Flags
  is_featured: {
    type: Boolean,
    default: false
  },
  is_urgent: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
investmentSchema.index({ app_id: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ borrower: 1 });
investmentSchema.index({ investor: 1 });
investmentSchema.index({ created_at: -1 });
investmentSchema.index({ category: 1 });
investmentSchema.index({ risk_score: 1 });
investmentSchema.index({ is_featured: 1 });
investmentSchema.index({ amount: 1 });
investmentSchema.index({ interest_rate: 1 });

// Virtual for investment age
investmentSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.created_at) / (1000 * 60 * 60 * 24));
});

// Virtual for funding time
investmentSchema.virtual('funding_time').get(function() {
  if (!this.funded_at) return null;
  return Math.floor((this.funded_at - this.created_at) / (1000 * 60 * 60 * 24));
});

// Virtual for days until due
investmentSchema.virtual('days_until_due').get(function() {
  if (!this.due_date) return null;
  const now = new Date();
  const due = new Date(this.due_date);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
});

// Virtual for repayment progress
investmentSchema.virtual('repayment_progress').get(function() {
  if (!this.repayment_amount) return 0;
  return (this.amount_repaid / this.repayment_amount) * 100;
});

// Virtual for is overdue
investmentSchema.virtual('is_overdue').get(function() {
  if (!this.due_date || this.status !== 'active') return false;
  return new Date() > this.due_date;
});

// Pre-save middleware to calculate repayment amount
investmentSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('interest_rate')) {
    this.repayment_amount = this.amount + (this.amount * this.interest_rate / 100);
    this.remaining_balance = this.repayment_amount - this.amount_repaid;
  }
  
  if (this.isModified('funded_at') && this.funded_at) {
    this.due_date = new Date(this.funded_at.getTime() + (this.duration * 24 * 60 * 60 * 1000));
  }
  
  next();
});

// Method to add repayment
investmentSchema.methods.addRepayment = function(amount, txId) {
  this.repayments.push({
    amount,
    tx_id: txId,
    timestamp: new Date(),
    status: 'confirmed'
  });
  
  this.amount_repaid += amount;
  this.remaining_balance = this.repayment_amount - this.amount_repaid;
  
  // Check if investment is completed
  if (this.amount_repaid >= this.repayment_amount) {
    this.status = 'completed';
    this.completed_at = new Date();
  }
  
  return this.save();
};

// Method to mark as defaulted
investmentSchema.methods.markAsDefaulted = function() {
  this.status = 'defaulted';
  return this.save();
};

// Method to pause investment
investmentSchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

// Method to resume investment
investmentSchema.methods.resume = function() {
  this.status = 'active';
  return this.save();
};

// Static method to find available investments
investmentSchema.statics.findAvailable = function(filters = {}) {
  const query = { status: 'pending', ...filters };
  return this.find(query).populate('borrower', 'username full_name reputation_score risk_score verified');
};

// Static method to find user investments
investmentSchema.statics.findByUser = function(userId, type = 'all') {
  let query = {};
  
  switch (type) {
    case 'borrowed':
      query = { borrower: userId };
      break;
    case 'invested':
      query = { investor: userId };
      break;
    default:
      query = { $or: [{ borrower: userId }, { investor: userId }] };
  }
  
  return this.find(query).populate('borrower investor', 'username full_name reputation_score risk_score verified');
};

// Static method to get investment statistics
investmentSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total_investments: { $sum: 1 },
        total_amount: { $sum: '$amount' },
        total_funded: { $sum: { $cond: [{ $ne: ['$investor', null] }, '$amount', 0] } },
        avg_interest_rate: { $avg: '$interest_rate' },
        avg_duration: { $avg: '$duration' }
      }
    }
  ]);
};

// Static method to get category statistics
investmentSchema.statics.getCategoryStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        total_amount: { $sum: '$amount' },
        avg_interest_rate: { $avg: '$interest_rate' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Investment', investmentSchema);