const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  // Blockchain Information
  app_id: {
    type: Number,
    required: true,
    unique: true
  },
  tx_id: {
    type: String,
    required: true
  },
  
  // Investment Details
  amount: {
    type: Number,
    required: true,
    min: 0.001 // Minimum 0.001 ALGO
  },
  purpose: {
    type: String,
    required: true,
    maxlength: 500
  },
  description: {
    type: String,
    maxlength: 1000
  },
  interest_rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 365 // Maximum 1 year
  },
  
  // Parties
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Status and Timeline
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'defaulted', 'paused'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  funded_at: {
    type: Date,
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  },
  due_date: {
    type: Date,
    default: null
  },
  
  // Financial Information
  repayment_amount: {
    type: Number,
    default: null
  },
  amount_repaid: {
    type: Number,
    default: 0
  },
  remaining_balance: {
    type: Number,
    default: null
  },
  
  // Risk and Verification
  risk_score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Repayment History
  repayments: [{
    amount: {
      type: Number,
      required: true
    },
    tx_id: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending'
    }
  }],
  
  // Social Features
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [{
    type: String,
    maxlength: 50
  }],
  category: {
    type: String,
    enum: ['education', 'business', 'medical', 'home', 'vehicle', 'emergency', 'other'],
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