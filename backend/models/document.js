const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid user ID'
    }
  },
  type: {
    type: String,
    enum: {
      values: [
        'government_id',
        'passport',
        'drivers_license',
        'bank_statement',
        'utility_bill',
        'income_proof',
        'business_registration',
        'tax_document',
        'investment_proof',
        'risk_assessment',
        'governance_proposal',
        'other'
      ],
      message: 'Invalid document type'
    },
    required: [true, 'Document type is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._-]+$/.test(v);
      },
      message: 'File name contains invalid characters'
    }
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true,
    maxlength: [255, 'Original file name cannot exceed 255 characters']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
    trim: true,
    maxlength: [500, 'File path cannot exceed 500 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9\/._-]+$/.test(v);
      },
      message: 'File path contains invalid characters'
    }
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte'],
    max: [10485760, 'File size cannot exceed 10MB'],
    validate: {
      validator: function(v) {
        return v > 0 && v <= 10485760;
      },
      message: 'File size must be between 1 byte and 10MB'
    }
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true,
    validate: {
      validator: function(v) {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];
        return allowedTypes.includes(v);
      },
      message: 'Unsupported file type'
    }
  },
  fileHash: {
    type: String,
    required: [true, 'File hash is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[a-f0-9]{64}$/.test(v);
      },
      message: 'Invalid file hash format (must be SHA-256)'
    }
  },
  algorandTxId: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[A-Z2-7]{52}$/.test(v) || /^[a-f0-9]{64}$/.test(v);
      },
      message: 'Invalid Algorand transaction ID format'
    }
  },
  verificationStatus: {
    type: String,
    enum: {
      values: ['pending', 'in_review', 'verified', 'rejected', 'expired', 'archived'],
      message: 'Invalid verification status'
    },
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        if (!v) return true;
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid verifier ID'
    }
  },
  verifiedAt: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v <= new Date();
      },
      message: 'Verification timestamp cannot be in the future'
    }
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  metadata: {
    documentNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Document number cannot exceed 100 characters']
    },
    issueDate: {
      type: Date,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return v <= new Date();
        },
        message: 'Issue date cannot be in the future'
      }
    },
    issuingAuthority: {
      type: String,
      trim: true,
      maxlength: [200, 'Issuing authority cannot exceed 200 characters']
    },
    extractedText: {
      type: String,
      maxlength: [10000, 'Extracted text cannot exceed 10,000 characters']
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be negative'],
      max: [100, 'Confidence cannot exceed 100'],
      validate: {
        validator: function(v) {
          if (!v) return true;
          return v >= 0 && v <= 100;
        },
        message: 'Confidence must be between 0 and 100'
      }
    },
    ocrProcessed: {
      type: Boolean,
      default: false
    }
  },
  securityChecks: {
    virusScan: {
      status: {
        type: String,
        enum: {
          values: ['pending', 'clean', 'infected', 'error', 'timeout'],
          message: 'Invalid virus scan status'
        },
        default: 'pending'
      },
      scannedAt: {
        type: Date,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return v <= new Date();
          },
          message: 'Scan timestamp cannot be in the future'
        }
      },
      engine: {
        type: String,
        trim: true,
        maxlength: [100, 'Scan engine name cannot exceed 100 characters']
      }
    },
    duplicateCheck: {
      status: {
        type: String,
        enum: {
          values: ['pending', 'unique', 'duplicate', 'error', 'timeout'],
          message: 'Invalid duplicate check status'
        },
        default: 'pending'
      },
      checkedAt: {
        type: Date,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return v <= new Date();
          },
          message: 'Check timestamp cannot be in the future'
        }
      },
      duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        validate: {
          validator: function(v) {
            if (!v) return true;
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: 'Invalid duplicate document ID'
        }
      }
    },
    formatValidation: {
      isValid: {
        type: Boolean,
        default: false
      },
      validatedAt: {
        type: Date,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return v <= new Date();
          },
          message: 'Validation timestamp cannot be in the future'
        }
      },
      errors: [{
        type: String,
        trim: true,
        maxlength: [200, 'Validation error cannot exceed 200 characters']
      }]
    }
  },
  accessLog: [{
    action: {
      type: String,
      enum: {
        values: ['uploaded', 'viewed', 'downloaded', 'verified', 'rejected', 'deleted', 'archived', 'restored'],
        message: 'Invalid access action'
      },
      required: [true, 'Access action is required']
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User performing action is required'],
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid user ID in access log'
      }
    },
    at: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Access timestamp cannot be in the future'
      }
    },
    ipAddress: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v) ||
                 /^[0-9a-fA-F:]+$/.test(v);
        },
        message: 'Invalid IP address format'
      }
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters']
    }
  }],
  uploadedAt: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Upload timestamp cannot be in the future'
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
documentSchema.index({ user: 1, type: 1 });
documentSchema.index({ verificationStatus: 1 });
documentSchema.index({ fileHash: 1 });
documentSchema.index({ algorandTxId: 1 });
documentSchema.index({ uploadedAt: -1 });
documentSchema.index({ verifiedAt: -1 });
documentSchema.index({ 'securityChecks.virusScan.status': 1 });
documentSchema.index({ 'securityChecks.duplicateCheck.status': 1 });

// Pre-save middleware to update timestamp and validate file size
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Validate file size based on MIME type
  if (this.mimeType && this.fileSize) {
    const maxSizes = {
      'application/pdf': 10485760, // 10MB
      'image/jpeg': 5242880,      // 5MB
      'image/png': 5242880,       // 5MB
      'image/gif': 2097152,       // 2MB
      'image/webp': 5242880,      // 5MB
      'application/msword': 2097152, // 2MB
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 2097152, // 2MB
      'text/plain': 1048576       // 1MB
    };
    
    const maxSize = maxSizes[this.mimeType];
    if (maxSize && this.fileSize > maxSize) {
      return next(new Error(`File size exceeds maximum allowed size for ${this.mimeType}`));
    }
  }
  
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