const mongoose = require('mongoose');
const crypto = require('crypto');

const mfaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  methods: {
    totp: {
      enabled: {
        type: Boolean,
        default: false
      },
      secret: String,
      qrCodeUrl: String,
      backupCodes: [{
        code: String,
        used: {
          type: Boolean,
          default: false
        },
        usedAt: Date
      }],
      verifiedAt: Date
    },
    algorandSignature: {
      enabled: {
        type: Boolean,
        default: false
      },
      challengeHistory: [{
        challenge: String,
        signature: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        verified: Boolean,
        walletAddress: String
      }]
    },
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      verificationCode: String,
      codeExpiry: Date,
      lastSent: Date,
      verificationAttempts: {
        type: Number,
        default: 0
      }
    }
  },
  trustedDevices: [{
    deviceId: String,
    deviceName: String,
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String,
      region: String
    },
    trustedAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  loginAttempts: [{
    ipAddress: String,
    userAgent: String,
    method: {
      type: String,
      enum: ['totp', 'algorand_signature', 'email', 'backup_code']
    },
    success: Boolean,
    timestamp: {
      type: Date,
      default: Date.now
    },
    failureReason: String
  }],
  settings: {
    requireMFAForLogin: {
      type: Boolean,
      default: true
    },
    requireMFAForTransactions: {
      type: Boolean,
      default: true
    },
    requireMFAForHighValue: {
      type: Boolean,
      default: true
    },
    highValueThreshold: {
      type: Number,
      default: 1000
    },
    deviceTrustDuration: {
      type: Number,
      default: 30
    }
  },
  lastMFAVerification: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

mfaSchema.index({ user: 1 });
mfaSchema.index({ 'trustedDevices.deviceId': 1 });
mfaSchema.index({ 'loginAttempts.timestamp': -1 });

mfaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

mfaSchema.methods.generateTOTPSecret = function() {
  const secret = crypto.randomBytes(20).toString('base32');
  this.methods.totp.secret = secret;
  return secret;
};

mfaSchema.methods.generateBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
    this.methods.totp.backupCodes.push({
      code: code,
      used: false
    });
  }
  return codes;
};

mfaSchema.methods.generateEmailCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.methods.email.verificationCode = code;
  this.methods.email.codeExpiry = new Date(Date.now() + 10 * 60 * 1000);
  this.methods.email.lastSent = new Date();
  this.methods.email.verificationAttempts = 0;
  return code;
};

mfaSchema.methods.generateAlgorandChallenge = function() {
  const challenge = crypto.randomBytes(32).toString('hex');
  return challenge;
};

mfaSchema.methods.verifyBackupCode = function(code) {
  const backupCode = this.methods.totp.backupCodes.find(
    bc => bc.code === code.toUpperCase() && !bc.used
  );
  
  if (backupCode) {
    backupCode.used = true;
    backupCode.usedAt = new Date();
    return true;
  }
  return false;
};

mfaSchema.methods.verifyEmailCode = function(code) {
  if (!this.methods.email.verificationCode || 
      !this.methods.email.codeExpiry ||
      new Date() > this.methods.email.codeExpiry) {
    return false;
  }
  
  this.methods.email.verificationAttempts += 1;
  
  if (this.methods.email.verificationAttempts > 5) {
    this.methods.email.verificationCode = null;
    this.methods.email.codeExpiry = null;
    return false;
  }
  
  return this.methods.email.verificationCode === code;
};

mfaSchema.methods.addTrustedDevice = function(deviceData) {
  const deviceId = crypto.createHash('sha256')
    .update(deviceData.userAgent + deviceData.ipAddress)
    .digest('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + this.settings.deviceTrustDuration);
  
  this.trustedDevices.push({
    deviceId,
    deviceName: deviceData.deviceName || 'Unknown Device',
    userAgent: deviceData.userAgent,
    ipAddress: deviceData.ipAddress,
    location: deviceData.location || {},
    expiresAt,
    lastUsed: new Date()
  });
  
  return deviceId;
};

mfaSchema.methods.isTrustedDevice = function(userAgent, ipAddress) {
  const deviceId = crypto.createHash('sha256')
    .update(userAgent + ipAddress)
    .digest('hex');
  
  const device = this.trustedDevices.find(
    d => d.deviceId === deviceId && 
         d.isActive && 
         new Date() < d.expiresAt
  );
  
  if (device) {
    device.lastUsed = new Date();
    return true;
  }
  
  return false;
};

mfaSchema.methods.logLoginAttempt = function(attemptData) {
  this.loginAttempts.push({
    ipAddress: attemptData.ipAddress,
    userAgent: attemptData.userAgent,
    method: attemptData.method,
    success: attemptData.success,
    failureReason: attemptData.failureReason,
    timestamp: new Date()
  });
  
  if (this.loginAttempts.length > 100) {
    this.loginAttempts = this.loginAttempts.slice(-50);
  }
};

mfaSchema.methods.getRecentFailedAttempts = function(minutes = 15) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  return this.loginAttempts.filter(
    attempt => attempt.timestamp > cutoff && !attempt.success
  ).length;
};

mfaSchema.methods.isRequiredForAction = function(action, amount = 0) {
  switch (action) {
    case 'login':
      return this.settings.requireMFAForLogin && this.isEnabled;
    case 'transaction':
      return this.settings.requireMFAForTransactions && this.isEnabled;
    case 'high_value':
      return this.settings.requireMFAForHighValue && 
             amount >= this.settings.highValueThreshold && 
             this.isEnabled;
    default:
      return false;
  }
};

mfaSchema.statics.cleanupExpiredDevices = async function() {
  const result = await this.updateMany(
    {},
    {
      $pull: {
        trustedDevices: {
          expiresAt: { $lt: new Date() }
        }
      }
    }
  );
  return result;
};

module.exports = mongoose.model('MFA', mfaSchema);