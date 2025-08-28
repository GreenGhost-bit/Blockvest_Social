const mongoose = require('mongoose');
const crypto = require('crypto');

const mfaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid user ID'
    }
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
      secret: {
        type: String,
        select: false, // Don't include in queries by default for security
        validate: {
          validator: function(v) {
            if (!v) return true;
            return /^[A-Z2-7]{32}$/.test(v);
          },
          message: 'Invalid TOTP secret format'
        }
      },
      qrCodeUrl: {
        type: String,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return /^https?:\/\/.+/.test(v) || /^data:image\/.+;base64,/.test(v);
          },
          message: 'Invalid QR code URL format'
        }
      },
      backupCodes: [{
        code: {
          type: String,
          required: [true, 'Backup code is required'],
          validate: {
            validator: function(v) {
              return /^[A-F0-9]{8}$/.test(v);
            },
            message: 'Invalid backup code format'
          }
        },
        used: {
          type: Boolean,
          default: false
        },
        usedAt: {
          type: Date,
          validate: {
            validator: function(v) {
              if (!v) return true;
              return v <= new Date();
            },
            message: 'Used timestamp cannot be in the future'
          }
        }
      }],
      verifiedAt: {
        type: Date,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return v <= new Date();
          },
          message: 'Verification timestamp cannot be in the future'
        }
      }
    },
    algorandSignature: {
      enabled: {
        type: Boolean,
        default: false
      },
      challengeHistory: [{
        challenge: {
          type: String,
          required: [true, 'Challenge is required'],
          validate: {
            validator: function(v) {
              return /^[a-f0-9]{64}$/.test(v);
            },
            message: 'Invalid challenge format'
          }
        },
        signature: {
          type: String,
          required: [true, 'Signature is required'],
          validate: {
            validator: function(v) {
              return /^[A-Z2-7]{104}$/.test(v);
            },
            message: 'Invalid signature format'
          }
        },
        timestamp: {
          type: Date,
          default: Date.now,
          validate: {
            validator: function(v) {
              return v <= new Date();
            },
            message: 'Timestamp cannot be in the future'
          }
        },
        verified: {
          type: Boolean,
          default: false
        },
        walletAddress: {
          type: String,
          required: [true, 'Wallet address is required'],
          validate: {
            validator: function(v) {
              return /^[A-Z2-7]{58}$/.test(v);
            },
            message: 'Invalid Algorand wallet address format'
          }
        }
      }]
    },
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      verificationCode: {
        type: String,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return /^\d{6}$/.test(v);
          },
          message: 'Verification code must be 6 digits'
        }
      },
      codeExpiry: {
        type: Date,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return v > new Date();
          },
          message: 'Code expiry must be in the future'
        }
      },
      lastSent: {
        type: Date,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return v <= new Date();
          },
          message: 'Last sent timestamp cannot be in the future'
        }
      },
      verificationAttempts: {
        type: Number,
        default: 0,
        min: [0, 'Verification attempts cannot be negative'],
        max: [10, 'Verification attempts cannot exceed 10']
      }
    }
  },
  trustedDevices: [{
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      validate: {
        validator: function(v) {
          return /^[a-f0-9]{64}$/.test(v);
        },
        message: 'Invalid device ID format'
      }
    },
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
      maxlength: [100, 'Device name cannot exceed 100 characters']
    },
    userAgent: {
      type: String,
      required: [true, 'User agent is required'],
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters']
    },
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      validate: {
        validator: function(v) {
          return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v) ||
                 /^[0-9a-fA-F:]+$/.test(v); // IPv6 support
        },
        message: 'Invalid IP address format'
      }
    },
    location: {
      country: {
        type: String,
        trim: true,
        maxlength: [100, 'Country name cannot exceed 100 characters']
      },
      city: {
        type: String,
        trim: true,
        maxlength: [100, 'City name cannot exceed 100 characters']
      },
      region: {
        type: String,
        trim: true,
        maxlength: [100, 'Region name cannot exceed 100 characters']
      }
    },
    trustedAt: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Trusted timestamp cannot be in the future'
      }
    },
    lastUsed: {
      type: Date,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return v <= new Date();
        },
        message: 'Last used timestamp cannot be in the future'
      }
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
      validate: {
        validator: function(v) {
          return v > new Date();
        },
        message: 'Expiry date must be in the future'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  loginAttempts: [{
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      validate: {
        validator: function(v) {
          return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v) ||
                 /^[0-9a-fA-F:]+$/.test(v);
        },
        message: 'Invalid IP address format'
      }
    },
    userAgent: {
      type: String,
      required: [true, 'User agent is required'],
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters']
    },
    method: {
      type: String,
      enum: {
        values: ['totp', 'algorand_signature', 'email', 'backup_code'],
        message: 'Invalid MFA method'
      },
      required: [true, 'MFA method is required']
    },
    success: {
      type: Boolean,
      required: [true, 'Success status is required']
    },
    timestamp: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Timestamp cannot be in the future'
      }
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: [200, 'Failure reason cannot exceed 200 characters']
    }
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
      default: 1000,
      min: [0, 'High value threshold cannot be negative'],
      max: [1000000, 'High value threshold cannot exceed 1,000,000']
    },
    deviceTrustDuration: {
      type: Number,
      default: 30,
      min: [1, 'Device trust duration must be at least 1 day'],
      max: [365, 'Device trust duration cannot exceed 365 days']
    }
  },
  lastMFAVerification: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v <= new Date();
      },
      message: 'Last MFA verification timestamp cannot be in the future'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Creation timestamp cannot be in the future'
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Update timestamp cannot be in the future'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
mfaSchema.index({ user: 1 });
mfaSchema.index({ 'trustedDevices.deviceId': 1 });
mfaSchema.index({ 'loginAttempts.timestamp': -1 });
mfaSchema.index({ 'loginAttempts.ipAddress': 1 });
mfaSchema.index({ 'loginAttempts.method': 1 });

// Pre-save middleware to update timestamp
mfaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Validate that at least one MFA method is enabled if MFA is enabled
  if (this.isEnabled) {
    const hasEnabledMethod = this.methods.totp.enabled || 
                           this.methods.algorandSignature.enabled || 
                           this.methods.email.enabled;
    
    if (!hasEnabledMethod) {
      return next(new Error('At least one MFA method must be enabled when MFA is enabled'));
    }
  }
  
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