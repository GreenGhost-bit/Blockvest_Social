const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'government_id',
      'passport',
      'drivers_license',
      'bank_statement',
      'utility_bill',
      'income_proof',
      'business_registration',
      'tax_document',
      'other'
    ],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileHash: {
    type: String,
    required: true,
    unique: true
  },
  algorandTxId: {
    type: String,
    unique: true,
    sparse: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'in_review', 'verified', 'rejected', 'expired'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  rejectionReason: String,
  expiryDate: Date,
  metadata: {
    documentNumber: String,
    issueDate: Date,
    issuingAuthority: String,
    extractedText: String,
    confidence: Number,
    ocrProcessed: {
      type: Boolean,
      default: false
    }
  },
  securityChecks: {
    virusScan: {
      status: {
        type: String,
        enum: ['pending', 'clean', 'infected', 'error'],
        default: 'pending'
      },
      scannedAt: Date,
      engine: String
    },
    duplicateCheck: {
      status: {
        type: String,
        enum: ['pending', 'unique', 'duplicate', 'error'],
        default: 'pending'
      },
      checkedAt: Date,
      duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    },
    formatValidation: {
      isValid: {
        type: Boolean,
        default: false
      },
      validatedAt: Date,
      errors: [String]
    }
  },
  accessLog: [{
    action: {
      type: String,
      enum: ['uploaded', 'viewed', 'downloaded', 'verified', 'rejected', 'deleted']
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

documentSchema.index({ user: 1, type: 1 });
documentSchema.index({ verificationStatus: 1 });
documentSchema.index({ fileHash: 1 });
documentSchema.index({ algorandTxId: 1 });

documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

documentSchema.methods.logAccess = function(action, userId, ipAddress, userAgent) {
  this.accessLog.push({
    action,
    by: userId,
    at: new Date(),
    ipAddress,
    userAgent
  });
  return this.save();
};

documentSchema.methods.verify = function(verifierId, algorandTxId = null) {
  this.verificationStatus = 'verified';
  this.verifiedBy = verifierId;
  this.verifiedAt = new Date();
  if (algorandTxId) {
    this.algorandTxId = algorandTxId;
  }
  return this.save();
};

documentSchema.methods.reject = function(verifierId, reason) {
  this.verificationStatus = 'rejected';
  this.verifiedBy = verifierId;
  this.verifiedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

documentSchema.statics.getVerificationStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$verificationStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    in_review: 0,
    verified: 0,
    rejected: 0,
    expired: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('Document', documentSchema);