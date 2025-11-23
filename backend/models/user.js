const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: false,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  full_name: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  
  // Blockchain Information
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Strict Algorand address validation for mainnet/testnet
        return /^[A-Z2-7]{58}$/.test(v);
      },
      message: 'Invalid Algorand wallet address format - must be 58 characters'
    }
  },
  wallet_private_key: {
    type: String,
    select: false, // Don't include in queries by default
    required: false
  },
  
  // Profile Information - Updated to match frontend expectations
  profile: {
    name: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true
    },
    location: {
      type: String,
      default: '',
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    phone: {
      type: String,
      default: '',
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
    }
  },
  profile_picture: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v) || /^data:image\/.+;base64,/.test(v);
      },
      message: 'Profile picture must be a valid URL or base64 data URI'
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    default: ''
  },
  phone_number: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number'],
    default: null
  },
  
  // Enhanced Social Features
  social_links: {
    twitter: { 
      type: String, 
      default: null,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?twitter\.com\/.+/.test(v);
        },
        message: 'Please provide a valid Twitter URL'
      }
    },
    linkedin: { 
      type: String, 
      default: null,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
        },
        message: 'Please provide a valid LinkedIn URL'
      }
    },
    github: { 
      type: String, 
      default: null,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?github\.com\/.+/.test(v);
        },
        message: 'Please provide a valid GitHub URL'
      }
    },
    website: { 
      type: String, 
      default: null,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid website URL'
      }
    }
  },
  
  // Reputation System
  reputationScore: {
    type: Number,
    min: [0, 'Reputation score cannot be negative'],
    max: [100, 'Reputation score cannot exceed 100'],
    default: 50
  },
  reputation_level: {
    type: String,
    enum: {
      values: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      message: 'Invalid reputation level'
    },
    default: 'bronze'
  },
  reputation_history: [{
    score_change: { 
      type: Number, 
      required: [true, 'Score change is required'] 
    },
    reason: { 
      type: String, 
      required: [true, 'Reason is required'],
      maxlength: [200, 'Reason cannot exceed 200 characters']
    },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Enhanced Verification and Security
  isVerified: {
    type: Boolean,
    default: false
  },
  verification_status: {
    type: String,
    enum: {
      values: ['pending', 'verified', 'rejected', 'suspended'],
      message: 'Invalid verification status'
    },
    default: 'pending'
  },
  verification_token: {
    type: String,
    default: null
  },
  verification_expires: {
    type: Date,
    default: null
  },
  verification_documents: [{
    type: { 
      type: String, 
      required: [true, 'Document type is required'],
      enum: {
        values: ['id_card', 'passport', 'drivers_license', 'utility_bill', 'bank_statement', 'other'],
        message: 'Invalid document type'
      }
    },
    url: { 
      type: String, 
      required: [true, 'Document URL is required'],
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v) || /^data:.+;base64,/.test(v);
        },
        message: 'Document URL must be a valid URL or base64 data URI'
      }
    },
    uploaded_at: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
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
  
  // Enhanced Risk Assessment
  risk_score: {
    type: Number,
    min: [0, 'Risk score cannot be negative'],
    max: [100, 'Risk score cannot exceed 100'],
    default: 50
  },
  risk_factors: [{
    factor: { 
      type: String, 
      required: [true, 'Risk factor is required'],
      maxlength: [100, 'Risk factor cannot exceed 100 characters']
    },
    weight: { 
      type: Number, 
      min: [0, 'Weight cannot be negative'], 
      max: [1, 'Weight cannot exceed 1'], 
      required: [true, 'Weight is required'] 
    },
    score: { 
      type: Number, 
      min: [0, 'Score cannot be negative'], 
      max: [100, 'Score cannot exceed 100'], 
      required: [true, 'Score is required'] 
    }
  }],
  risk_assessment_date: {
    type: Date,
    default: Date.now
  },
  
  // Investment Statistics
  totalInvested: {
    type: Number,
    default: 0,
    min: [0, 'Total invested cannot be negative']
  },
  totalBorrowed: {
    type: Number,
    default: 0,
    min: [0, 'Total borrowed cannot be negative']
  },
  total_repayments: {
    type: Number,
    default: 0,
    min: [0, 'Total repayments cannot be negative']
  },
  successful_investments: {
    type: Number,
    default: 0,
    min: [0, 'Successful investments cannot be negative']
  },
  defaulted_investments: {
    type: Number,
    default: 0,
    min: [0, 'Defaulted investments cannot be negative']
  },
  
  // Enhanced Social Features
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        return !this.following.includes(v);
      },
      message: 'Cannot follow yourself'
    }
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        return !this.followers.includes(v);
      },
      message: 'Cannot follow yourself'
    }
  }],
  connections: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    strength: { 
      type: Number, 
      min: [1, 'Connection strength must be at least 1'], 
      max: [10, 'Connection strength cannot exceed 10'], 
      default: 5 
    },
    connected_at: { type: Date, default: Date.now }
  }],
  
  // Preferences and Settings
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profile_public: { type: Boolean, default: true },
      investment_history_public: { type: Boolean, default: false },
      risk_score_public: { type: Boolean, default: false }
    },
    investment: {
      min_amount: { 
        type: Number, 
        default: 0.001,
        min: [0.001, 'Minimum investment amount must be at least 0.001']
      },
      max_amount: { 
        type: Number, 
        default: 1000,
        min: [0.001, 'Maximum investment amount must be at least 0.001']
      },
      preferred_risk_level: { 
        type: String, 
        enum: {
          values: ['low', 'medium', 'high'],
          message: 'Invalid risk level'
        }, 
        default: 'medium' 
      }
    }
  },
  
  // Activity and Engagement
  last_active: {
    type: Date,
    default: Date.now
  },
  login_count: {
    type: Number,
    default: 0,
    min: [0, 'Login count cannot be negative']
  },
  activity_log: [{
    action: {
      type: String,
      required: true,
      enum: ['login', 'logout', 'investment_created', 'investment_funded', 'profile_updated', 'verification_submitted', 'connection_added', 'badge_earned']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Map,
      of: String
    },
    ip_address: String,
    user_agent: String
  }],
  badges: [{
    name: { 
      type: String, 
      required: [true, 'Badge name is required'],
      maxlength: [50, 'Badge name cannot exceed 50 characters']
    },
    description: { 
      type: String, 
      required: [true, 'Badge description is required'],
      maxlength: [200, 'Badge description cannot exceed 200 characters']
    },
    earned_at: { type: Date, default: Date.now }
  }],
  
  // Enhanced Security
  failed_login_attempts: {
    type: Number,
    default: 0,
    min: [0, 'Failed login attempts cannot be negative'],
    max: [10, 'Failed login attempts cannot exceed 10']
  },
  account_locked_until: {
    type: Date,
    default: null
  },
  password_changed_at: {
    type: Date,
    default: Date.now
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reputation level calculation
userSchema.virtual('reputation_level_calculated').get(function() {
  if (this.reputationScore >= 80) return 'diamond';
  if (this.reputationScore >= 60) return 'platinum';
  if (this.reputationScore >= 40) return 'gold';
  if (this.reputationScore >= 20) return 'silver';
  return 'bronze';
});

// Virtual for investment success rate
userSchema.virtual('success_rate').get(function() {
  const total = this.successful_investments + this.defaulted_investments;
  return total > 0 ? (this.successful_investments / total * 100).toFixed(2) : 0;
});

// Virtual for total portfolio value
userSchema.virtual('portfolio_value').get(function() {
  return this.totalInvested + this.totalBorrowed;
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.password_changed_at = new Date();
  }
  
  // Update reputation level based on score
  this.reputation_level = this.reputation_level_calculated;
  
  // Update last active timestamp
  this.last_active = new Date();
  
  next();
});

// Pre-save middleware for account security
userSchema.pre('save', function(next) {
  if (this.failed_login_attempts >= 5) {
    this.account_locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  next();
});

// Instance method to check password
userSchema.methods.checkPassword = async function(candidatePassword) {
  if (!this.password) {
    return false; // No password set (wallet-only user)
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update reputation with validation
userSchema.methods.updateReputation = function(scoreChange, reason) {
  if (typeof scoreChange !== 'number' || isNaN(scoreChange) || !reason || typeof reason !== 'string') {
    throw new Error('Invalid reputation update parameters');
  }
  
  if (reason.length > 200) {
    throw new Error('Reason cannot exceed 200 characters');
  }
  
  this.reputationScore = Math.max(0, Math.min(100, this.reputationScore + scoreChange));
  this.reputation_history.push({
    score_change: scoreChange,
    reason: reason.substring(0, 200),
    timestamp: new Date()
  });
  
  // Keep only last 50 reputation changes
  if (this.reputation_history.length > 50) {
    this.reputation_history = this.reputation_history.slice(-50);
  }
  
  return this.save();
};

// Instance method to add badge with duplicate prevention
userSchema.methods.addBadge = function(name, description) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Badge name is required');
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    throw new Error('Badge description is required');
  }
  
  const existingBadge = this.badges.find(badge => badge.name === name);
  if (!existingBadge) {
    this.badges.push({ 
      name: name.trim().substring(0, 50), 
      description: description.trim().substring(0, 200),
      earned_at: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove badge
userSchema.methods.removeBadge = function(badgeName) {
  this.badges = this.badges.filter(badge => badge.name !== badgeName);
  return this.save();
};

// Instance method to get badges by category
userSchema.methods.getBadgesByCategory = function(category) {
  return this.badges.filter(badge => badge.category === category);
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
  return this.account_locked_until && this.account_locked_until > new Date();
};

// Instance method to increment failed login attempts
userSchema.methods.incrementFailedLogins = function() {
  this.failed_login_attempts += 1;
  return this.save();
};

// Instance method to reset failed login attempts
userSchema.methods.resetFailedLogins = function() {
  this.failed_login_attempts = 0;
  this.account_locked_until = null;
  return this.save();
};

// Static method to find users by reputation level
userSchema.statics.findByReputationLevel = function(level) {
  return this.find({ reputation_level: level });
};

// Static method to find top investors
userSchema.statics.findTopInvestors = function(limit = 10) {
  return this.find()
    .sort({ totalInvested: -1, reputationScore: -1 })
    .limit(limit);
};

// Static method to find verified users
userSchema.statics.findVerifiedUsers = function() {
  return this.find({ isVerified: true, verification_status: 'verified' });
};

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ reputationScore: -1 });
userSchema.index({ risk_score: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ created_at: -1 });
userSchema.index({ last_active: -1 });

// Instance method to follow another user
userSchema.methods.followUser = function(userIdToFollow) {
  if (!this.following.includes(userIdToFollow)) {
    this.following.push(userIdToFollow);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to unfollow another user
userSchema.methods.unfollowUser = function(userIdToUnfollow) {
  this.following = this.following.filter(id => id.toString() !== userIdToUnfollow.toString());
  return this.save();
};

// Instance method to add connection with validation
userSchema.methods.addConnection = function(userId, strength = 5) {
  if (userId.toString() === this._id.toString()) {
    throw new Error('Cannot connect to yourself');
  }
  
  const existingConnection = this.connections.find(conn => conn.user.toString() === userId.toString());
  if (!existingConnection) {
    this.connections.push({
      user: userId,
      strength: Math.max(1, Math.min(10, strength)),
      connected_at: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to update connection strength with validation
userSchema.methods.updateConnectionStrength = function(userId, newStrength) {
  const connection = this.connections.find(conn => conn.user.toString() === userId.toString());
  if (connection) {
    connection.strength = Math.max(1, Math.min(10, newStrength));
    connection.updated_at = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove connection
userSchema.methods.removeConnection = function(userId) {
  this.connections = this.connections.filter(conn => conn.user.toString() !== userId.toString());
  return this.save();
};

// Instance method to get top connections
userSchema.methods.getTopConnections = function(limit = 5) {
  return this.connections
    .sort((a, b) => b.strength - a.strength)
    .slice(0, limit);
};

// Instance method to calculate social score with enhanced algorithm
userSchema.methods.calculateSocialScore = function() {
  const followerBonus = Math.min(this.followers.length * 2, 20); // Cap at 20 points
  const connectionBonus = Math.min(this.connections.reduce((sum, conn) => sum + conn.strength, 0), 30); // Cap at 30 points
  const activityBonus = Math.min(this.login_count * 0.1, 10); // Cap at 10 points
  const verificationBonus = this.isVerified ? 15 : 0; // Bonus for verification
  const badgeBonus = Math.min(this.badges.length * 2, 10); // Cap at 10 points
  
  const socialScore = Math.min(100, 
    this.reputationScore + 
    followerBonus + 
    connectionBonus + 
    activityBonus + 
    verificationBonus + 
    badgeBonus
  );
  
  return Math.round(socialScore);
};

// Instance method to update preferences
userSchema.methods.updatePreferences = function(newPreferences) {
  this.preferences = { ...this.preferences, ...newPreferences };
  return this.save();
};

// Instance method to add verification document with validation
userSchema.methods.addVerificationDocument = function(type, url) {
  if (!type || !url) {
    throw new Error('Document type and URL are required');
  }
  
  const validTypes = ['id_card', 'passport', 'drivers_license', 'utility_bill', 'bank_statement', 'other'];
  if (!validTypes.includes(type)) {
    throw new Error('Invalid document type');
  }
  
  this.verification_documents.push({
    type,
    url,
    uploaded_at: new Date(),
    verified: false
  });
  return this.save();
};

// Instance method to mark document as verified with logging
userSchema.methods.verifyDocument = function(documentId) {
  const document = this.verification_documents.id(documentId);
  if (document) {
    document.verified = true;
    document.verified_at = new Date();
    console.log(`Document ${documentId} verified for user ${this._id}`);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to get verification status
userSchema.methods.getVerificationStatus = function() {
  const totalDocs = this.verification_documents.length;
  const verifiedDocs = this.verification_documents.filter(doc => doc.verified).length;
  
  return {
    total: totalDocs,
    verified: verifiedDocs,
    percentage: totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0,
    isFullyVerified: verifiedDocs === totalDocs && totalDocs > 0
  };
};

// Instance method to log user activity
userSchema.methods.logActivity = function(action, metadata = {}, ipAddress = null, userAgent = null) {
  this.activity_log.push({
    action,
    metadata,
    ip_address: ipAddress,
    user_agent: userAgent,
    timestamp: new Date()
  });
  
  // Keep only last 100 activities to prevent unbounded growth
  if (this.activity_log.length > 100) {
    this.activity_log = this.activity_log.slice(-100);
  }
  
  this.last_active = new Date();
  return this.save();
};

// Instance method to get recent activity
userSchema.methods.getRecentActivity = function(limit = 10) {
  return this.activity_log
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Instance method to get activity statistics
userSchema.methods.getActivityStats = function() {
  const stats = {};
  this.activity_log.forEach(activity => {
    stats[activity.action] = (stats[activity.action] || 0) + 1;
  });
  return stats;
};

module.exports = mongoose.model('User', userSchema);