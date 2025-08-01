const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Blockchain Information
  wallet_address: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  wallet_private_key: {
    type: String,
    select: false, // Don't include in queries by default
    required: false
  },
  
  // Profile Information
  profile_picture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  phone_number: {
    type: String,
    match: /^\+?[\d\s\-\(\)]+$/,
    default: null
  },
  
  // Verification and Security
  verified: {
    type: Boolean,
    default: false
  },
  verification_token: {
    type: String,
    default: null
  },
  verification_expires: {
    type: Date,
    default: null
  },
  mfa_enabled: {
    type: Boolean,
    default: false
  },
  mfa_secret: {
    type: String,
    select: false,
    default: null
  },
  mfa_backup_codes: [{
    type: String,
    select: false
  }],
  
  // Risk Assessment
  risk_score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  risk_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'very_high'],
    default: null
  },
  risk_assessment_completed: {
    type: Boolean,
    default: false
  },
  risk_assessment_data: {
    income_level: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    credit_history: {
      type: String,
      enum: ['none', 'poor', 'fair', 'good', 'excellent']
    },
    employment_status: {
      type: String,
      enum: ['employed', 'self_employed', 'unemployed', 'student']
    },
    monthly_income: {
      type: Number,
      min: 0
    },
    existing_debts: {
      type: Number,
      min: 0
    },
    employment_duration: {
      type: Number,
      min: 0
    }
  },
  
  // Reputation and Social Features
  reputation_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  total_investments_received: {
    type: Number,
    default: 0
  },
  total_investments_made: {
    type: Number,
    default: 0
  },
  total_amount_borrowed: {
    type: Number,
    default: 0
  },
  total_amount_invested: {
    type: Number,
    default: 0
  },
  on_time_repayments: {
    type: Number,
    default: 0
  },
  late_repayments: {
    type: Number,
    default: 0
  },
  defaults: {
    type: Number,
    default: 0
  },
  
  // Account Status
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  is_online: {
    type: Boolean,
    default: false
  },
  last_seen: {
    type: Date,
    default: Date.now
  },
  
  // Preferences
  notification_preferences: {
    email_notifications: {
      type: Boolean,
      default: true
    },
    push_notifications: {
      type: Boolean,
      default: true
    },
    investment_alerts: {
      type: Boolean,
      default: true
    },
    payment_reminders: {
      type: Boolean,
      default: true
    },
    risk_assessment_reminders: {
      type: Boolean,
      default: true
    }
  },
  
  // Security and Privacy
  login_attempts: {
    type: Number,
    default: 0
  },
  lock_until: {
    type: Date,
    default: null
  },
  password_reset_token: {
    type: String,
    default: null
  },
  password_reset_expires: {
    type: Date,
    default: null
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ wallet_address: 1 });
userSchema.index({ verified: 1 });
userSchema.index({ risk_score: 1 });
userSchema.index({ reputation_score: 1 });
userSchema.index({ status: 1 });
userSchema.index({ created_at: -1 });

// Virtual for account age
userSchema.virtual('account_age').get(function() {
  return Math.floor((Date.now() - this.created_at) / (1000 * 60 * 60 * 24));
});

// Virtual for repayment rate
userSchema.virtual('repayment_rate').get(function() {
  const total = this.on_time_repayments + this.late_repayments + this.defaults;
  return total > 0 ? (this.on_time_repayments / total) * 100 : 100;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lock_until && this.lock_until > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lock_until && this.lock_until < Date.now()) {
    return this.updateOne({
      $unset: { lock_until: 1 },
      $set: { login_attempts: 1 }
    });
  }
  
  const updates = { $inc: { login_attempts: 1 } };
  if (this.login_attempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lock_until: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { login_attempts: 1, lock_until: 1 }
  });
};

// Method to update reputation score
userSchema.methods.updateReputationScore = function() {
  let score = 50; // Base score
  
  // Adjust based on repayment history
  const totalRepayments = this.on_time_repayments + this.late_repayments + this.defaults;
  if (totalRepayments > 0) {
    const onTimeRate = this.on_time_repayments / totalRepayments;
    score += onTimeRate * 30; // Up to 30 points for good repayment history
  }
  
  // Adjust based on risk score
  if (this.risk_score) {
    score += (this.risk_score - 50) * 0.2; // Up to 10 points for good risk score
  }
  
  // Adjust based on account age
  const accountAge = this.account_age;
  if (accountAge > 365) {
    score += 10; // Bonus for old accounts
  } else if (accountAge > 30) {
    score += 5; // Small bonus for established accounts
  }
  
  // Adjust based on verification
  if (this.verified) {
    score += 5;
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  return this.updateOne({ reputation_score: Math.round(score) });
};

// Static method to find users by risk level
userSchema.statics.findByRiskLevel = function(riskLevel) {
  return this.find({ risk_level: riskLevel, status: 'active' });
};

// Static method to find verified users
userSchema.statics.findVerified = function() {
  return this.find({ verified: true, status: 'active' });
};

// Static method to get top borrowers
userSchema.statics.getTopBorrowers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ total_investments_received: -1, reputation_score: -1 })
    .limit(limit);
};

// Static method to get top investors
userSchema.statics.getTopInvestors = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ total_investments_made: -1, reputation_score: -1 })
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);