const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

// Common validation schemas
const commonSchemas = {
  objectId: Joi.string().hex().length(24).messages({
    'string.hex': 'ID must be a valid hexadecimal string',
    'string.length': 'ID must be exactly 24 characters long'
  }),
  
  email: Joi.string().email().max(255).messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email cannot exceed 255 characters'
  }),
  
  password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
  }),
  
  username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 30 characters',
    'string.pattern.base': 'Username can only contain letters, numbers, and underscores'
  }),
  
  walletAddress: Joi.string().pattern(/^[A-Z2-7]{58}$/).messages({
    'string.pattern.base': 'Invalid Algorand wallet address format'
  }),
  
  amount: Joi.number().positive().max(1000000).precision(6).messages({
    'number.base': 'Amount must be a valid number',
    'number.positive': 'Amount must be positive',
    'number.max': 'Amount cannot exceed 1,000,000',
    'number.precision': 'Amount cannot have more than 6 decimal places'
  }),
  
  percentage: Joi.number().min(0).max(100).precision(2).messages({
    'number.base': 'Percentage must be a valid number',
    'number.min': 'Percentage cannot be negative',
    'number.max': 'Percentage cannot exceed 100',
    'number.precision': 'Percentage cannot have more than 2 decimal places'
  }),
  
  date: Joi.date().max('now').messages({
    'date.base': 'Invalid date format',
    'date.max': 'Date cannot be in the future'
  }),
  
  futureDate: Joi.date().greater('now').messages({
    'date.base': 'Invalid date format',
    'date.greater': 'Date must be in the future'
  }),
  
  ipAddress: Joi.string().ip().messages({
    'string.ip': 'Invalid IP address format'
  }),
  
  url: Joi.string().uri().messages({
    'string.uri': 'Invalid URL format'
  }),
  
  phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).max(20).messages({
    'string.pattern.base': 'Invalid phone number format',
    'string.max': 'Phone number cannot exceed 20 characters'
  })
};

// User validation schemas
const userValidation = {
  register: Joi.object({
    username: commonSchemas.username.required(),
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    full_name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters',
      'any.required': 'Full name is required'
    }),
    wallet_address: commonSchemas.walletAddress.required(),
    phone_number: commonSchemas.phoneNumber.optional(),
    location: Joi.string().max(100).optional().messages({
      'string.max': 'Location cannot exceed 100 characters'
    }),
    bio: Joi.string().max(500).optional().messages({
      'string.max': 'Bio cannot exceed 500 characters'
    })
  }),
  
  login: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),
  
  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters'
    }),
    phone_number: commonSchemas.phoneNumber.optional(),
    location: Joi.string().max(100).optional().messages({
      'string.max': 'Location cannot exceed 100 characters'
    }),
    bio: Joi.string().max(500).optional().messages({
      'string.max': 'Bio cannot exceed 500 characters'
    }),
    profile_picture: commonSchemas.url.optional(),
    social_links: Joi.object({
      twitter: commonSchemas.url.optional(),
      linkedin: commonSchemas.url.optional(),
      github: commonSchemas.url.optional(),
      website: commonSchemas.url.optional()
    }).optional()
  }),
  
  changePassword: Joi.object({
    current_password: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    new_password: commonSchemas.password.required(),
    confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
  })
};

// Investment validation schemas
const investmentValidation = {
  create: Joi.object({
    amount: commonSchemas.amount.required(),
    purpose: Joi.string().min(10).max(500).required().messages({
      'string.min': 'Purpose must be at least 10 characters long',
      'string.max': 'Purpose cannot exceed 500 characters',
      'any.required': 'Investment purpose is required'
    }),
    description: Joi.string().max(1000).optional().messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    interest_rate: commonSchemas.percentage.required(),
    duration: Joi.number().integer().min(1).max(365).required().messages({
      'number.base': 'Duration must be a valid number',
      'number.integer': 'Duration must be a whole number',
      'number.min': 'Duration must be at least 1 day',
      'number.max': 'Duration cannot exceed 365 days',
      'any.required': 'Duration is required'
    }),
    category: Joi.string().valid(
      'education', 'business', 'medical', 'home', 'vehicle', 
      'emergency', 'technology', 'agriculture', 'other'
    ).required().messages({
      'any.only': 'Invalid investment category',
      'any.required': 'Category is required'
    }),
    tags: Joi.array().items(
      Joi.string().min(1).max(50)
    ).max(10).optional().messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.min': 'Tag must be at least 1 character long',
      'string.max': 'Tag cannot exceed 50 characters'
    }),
    is_urgent: Joi.boolean().optional(),
    is_featured: Joi.boolean().optional()
  }),
  
  update: Joi.object({
    purpose: Joi.string().min(10).max(500).optional().messages({
      'string.min': 'Purpose must be at least 10 characters long',
      'string.max': 'Purpose cannot exceed 500 characters'
    }),
    description: Joi.string().max(1000).optional().messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    interest_rate: commonSchemas.percentage.optional(),
    duration: Joi.number().integer().min(1).max(365).optional().messages({
      'number.base': 'Duration must be a valid number',
      'number.integer': 'Duration must be a whole number',
      'number.min': 'Duration must be at least 1 day',
      'number.max': 'Duration cannot exceed 365 days'
    }),
    category: Joi.string().valid(
      'education', 'business', 'medical', 'home', 'vehicle', 
      'emergency', 'technology', 'agriculture', 'other'
    ).optional().messages({
      'any.only': 'Invalid investment category'
    }),
    tags: Joi.array().items(
      Joi.string().min(1).max(50)
    ).max(10).optional().messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.min': 'Tag must be at least 1 character long',
      'string.max': 'Tag cannot exceed 50 characters'
    }),
    is_urgent: Joi.boolean().optional(),
    is_featured: Joi.boolean().optional()
  }),
  
  fund: Joi.object({
    amount: commonSchemas.amount.required(),
    message: Joi.string().max(200).optional().messages({
      'string.max': 'Message cannot exceed 200 characters'
    })
  }),
  
  repay: Joi.object({
    amount: commonSchemas.amount.required(),
    message: Joi.string().max(200).optional().messages({
      'string.max': 'Message cannot exceed 200 characters'
    })
  })
};

// Risk assessment validation schemas
const riskAssessmentValidation = {
  create: Joi.object({
    investment_id: commonSchemas.objectId.required(),
    risk_factors: Joi.array().items(
      Joi.object({
        factor: Joi.string().min(1).max(100).required().messages({
          'string.min': 'Risk factor must be at least 1 character long',
          'string.max': 'Risk factor cannot exceed 100 characters',
          'any.required': 'Risk factor is required'
        }),
        weight: Joi.number().min(0).max(1).precision(3).required().messages({
          'number.base': 'Weight must be a valid number',
          'number.min': 'Weight cannot be negative',
          'number.max': 'Weight cannot exceed 1',
          'number.precision': 'Weight cannot have more than 3 decimal places',
          'any.required': 'Weight is required'
        }),
        score: Joi.number().min(0).max(100).precision(2).required().messages({
          'number.base': 'Score must be a valid number',
          'number.min': 'Score cannot be negative',
          'number.max': 'Score cannot exceed 100',
          'number.precision': 'Score cannot have more than 2 decimal places',
          'any.required': 'Score is required'
        }),
        reasoning: Joi.string().max(500).optional().messages({
          'string.max': 'Reasoning cannot exceed 500 characters'
        })
      })
    ).min(1).required().messages({
      'array.min': 'At least one risk factor is required',
      'any.required': 'Risk factors are required'
    }),
    overall_risk_score: Joi.number().min(0).max(100).precision(2).required().messages({
      'number.base': 'Overall risk score must be a valid number',
      'number.min': 'Overall risk score cannot be negative',
      'number.max': 'Overall risk score cannot exceed 100',
      'number.precision': 'Overall risk score cannot have more than 2 decimal places',
      'any.required': 'Overall risk score is required'
    }),
    recommendations: Joi.array().items(
      Joi.object({
        type: Joi.string().valid(
          'approve', 'conditional_approve', 'request_more_info', 'reject', 'monitor'
        ).required().messages({
          'any.only': 'Invalid recommendation type',
          'any.required': 'Recommendation type is required'
        }),
        reasoning: Joi.string().min(10).max(500).required().messages({
          'string.min': 'Reasoning must be at least 10 characters long',
          'string.max': 'Reasoning cannot exceed 500 characters',
          'any.required': 'Reasoning is required'
        }),
        conditions: Joi.array().items(
          Joi.string().max(200)
        ).optional().messages({
          'string.max': 'Condition cannot exceed 200 characters'
        }),
        suggested_interest_rate: Joi.object({
          min: commonSchemas.percentage.required(),
          max: commonSchemas.percentage.required()
        }).optional(),
        suggested_amount: Joi.object({
          min: Joi.number().min(0).max(1).precision(3).required(),
          max: Joi.number().min(0).max(1).precision(3).required()
        }).optional()
      })
    ).optional()
  })
};

// Document validation schemas
const documentValidation = {
  upload: Joi.object({
    type: Joi.string().valid(
      'government_id', 'passport', 'drivers_license', 'bank_statement',
      'utility_bill', 'income_proof', 'business_registration', 'tax_document',
      'investment_proof', 'risk_assessment', 'governance_proposal', 'other'
    ).required().messages({
      'any.only': 'Invalid document type',
      'any.required': 'Document type is required'
    }),
    document_number: Joi.string().max(100).optional().messages({
      'string.max': 'Document number cannot exceed 100 characters'
    }),
    issue_date: commonSchemas.date.optional(),
    issuing_authority: Joi.string().max(200).optional().messages({
      'string.max': 'Issuing authority cannot exceed 200 characters'
    })
  }),
  
  verify: Joi.object({
    verification_status: Joi.string().valid('verified', 'rejected').required().messages({
      'any.only': 'Invalid verification status',
      'any.required': 'Verification status is required'
    }),
    rejection_reason: Joi.when('verification_status', {
      is: 'rejected',
      then: Joi.string().min(10).max(500).required().messages({
        'string.min': 'Rejection reason must be at least 10 characters long',
        'string.max': 'Rejection reason cannot exceed 500 characters',
        'any.required': 'Rejection reason is required when status is rejected'
      }),
      otherwise: Joi.string().max(500).optional().messages({
        'string.max': 'Rejection reason cannot exceed 500 characters'
      })
    })
  })
};

// MFA validation schemas
const mfaValidation = {
  enable: Joi.object({
    method: Joi.string().valid('totp', 'algorand_signature', 'email').required().messages({
      'any.only': 'Invalid MFA method',
      'any.required': 'MFA method is required'
    }),
    email: commonSchemas.email.when('method', {
      is: 'email',
      then: Joi.required().messages({
        'any.required': 'Email is required for email MFA'
      })
    })
  }),
  
  verify: Joi.object({
    method: Joi.string().valid('totp', 'algorand_signature', 'email', 'backup_code').required().messages({
      'any.only': 'Invalid MFA method',
      'any.required': 'MFA method is required'
    }),
    code: Joi.string().when('method', {
      is: 'totp',
      then: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
        'string.length': 'TOTP code must be exactly 6 digits',
        'string.pattern.base': 'TOTP code must contain only digits',
        'any.required': 'TOTP code is required'
      }),
      is: 'email',
      then: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
        'string.length': 'Email code must be exactly 6 digits',
        'string.pattern.base': 'Email code must contain only digits',
        'any.required': 'Email code is required'
      }),
      is: 'backup_code',
      then: Joi.string().length(8).pattern(/^[A-F0-9]{8}$/).required().messages({
        'string.length': 'Backup code must be exactly 8 characters',
        'string.pattern.base': 'Backup code must contain only uppercase letters and numbers',
        'any.required': 'Backup code is required'
      }),
      otherwise: Joi.string().required().messages({
        'any.required': 'Verification code is required'
      })
    }),
    challenge: Joi.string().when('method', {
      is: 'algorand_signature',
      then: Joi.string().pattern(/^[a-f0-9]{64}$/).required().messages({
        'string.pattern.base': 'Invalid challenge format',
        'any.required': 'Challenge is required for Algorand signature verification'
      })
    }),
    signature: Joi.string().when('method', {
      is: 'algorand_signature',
      then: Joi.string().pattern(/^[A-Z2-7]{104}$/).required().messages({
        'string.pattern.base': 'Invalid signature format',
        'any.required': 'Signature is required for Algorand signature verification'
      })
    })
  })
};

// Notification validation schemas
const notificationValidation = {
  create: Joi.object({
    recipient: commonSchemas.objectId.required(),
    type: Joi.string().valid(
      'investment_created', 'investment_funded', 'payment_received', 'payment_overdue',
      'investment_completed', 'investment_defaulted', 'profile_verified', 'reputation_updated',
      'new_message', 'system_announcement', 'risk_assessment_completed', 'verification_required',
      'account_locked', 'password_changed', 'mfa_enabled', 'mfa_disabled', 'login_attempt',
      'investment_approved', 'investment_rejected', 'repayment_due', 'repayment_late',
      'social_connection', 'governance_proposal', 'voting_reminder'
    ).required().messages({
      'any.only': 'Invalid notification type',
      'any.required': 'Notification type is required'
    }),
    title: Joi.string().min(1).max(200).required().messages({
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
    message: Joi.string().min(1).max(1000).required().messages({
      'string.min': 'Message must be at least 1 character long',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message is required'
    }),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional().messages({
      'any.only': 'Invalid priority level'
    }),
    category: Joi.string().valid(
      'investment', 'payment', 'system', 'social', 'security', 'governance', 'verification'
    ).optional().messages({
      'any.only': 'Invalid notification category'
    }),
    action_url: commonSchemas.url.optional(),
    expires_at: commonSchemas.futureDate.optional()
  })
};

// Query parameter validation schemas
const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a valid number',
      'number.integer': 'Page must be a whole number',
      'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'Limit must be a valid number',
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
  }),
  
  dateRange: Joi.object({
    start_date: commonSchemas.date.optional(),
    end_date: commonSchemas.date.optional()
  }),
  
  search: Joi.object({
    q: Joi.string().min(1).max(100).optional().messages({
      'string.min': 'Search query must be at least 1 character long',
      'string.max': 'Search query cannot exceed 100 characters'
    }),
    category: Joi.string().optional(),
    status: Joi.string().optional(),
    min_amount: commonSchemas.amount.optional(),
    max_amount: commonSchemas.amount.optional(),
    min_interest_rate: commonSchemas.percentage.optional(),
    max_interest_rate: commonSchemas.percentage.optional()
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      const validationError = new ValidationError(errorMessage, error.details);
      return next(validationError);
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

// Export all validation schemas and middleware
module.exports = {
  validate,
  commonSchemas,
  userValidation,
  investmentValidation,
  riskAssessmentValidation,
  documentValidation,
  mfaValidation,
  notificationValidation,
  queryValidation
}; 