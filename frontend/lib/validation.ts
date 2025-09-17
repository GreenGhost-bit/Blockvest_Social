export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class Validator {
  private errors: ValidationError[] = [];

  constructor() {
    this.errors = [];
  }

  required(value: any, fieldName: string, message?: string): this {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} is required`
      });
    }
    return this;
  }

  email(value: string, fieldName: string, message?: string): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be a valid email address`
      });
    }
    return this;
  }

  minLength(value: string, minLength: number, fieldName: string, message?: string): this {
    if (value && value.length < minLength) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be at least ${minLength} characters long`
      });
    }
    return this;
  }

  maxLength(value: string, maxLength: number, fieldName: string, message?: string): this {
    if (value && value.length > maxLength) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be no more than ${maxLength} characters long`
      });
    }
    return this;
  }

  min(value: number, minValue: number, fieldName: string, message?: string): this {
    if (value !== undefined && value < minValue) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be at least ${minValue}`
      });
    }
    return this;
  }

  max(value: number, maxValue: number, fieldName: string, message?: string): this {
    if (value !== undefined && value > maxValue) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be no more than ${maxValue}`
      });
    }
    return this;
  }

  pattern(value: string, regex: RegExp, fieldName: string, message?: string): this {
    if (value && !regex.test(value)) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} format is invalid`
      });
    }
    return this;
  }

  custom(condition: boolean, fieldName: string, message: string): this {
    if (!condition) {
      this.errors.push({
        field: fieldName,
        message
      });
    }
    return this;
  }

  array(value: any[], fieldName: string, message?: string): this {
    if (!Array.isArray(value)) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be an array`
      });
    }
    return this;
  }

  arrayMinLength(value: any[], minLength: number, fieldName: string, message?: string): this {
    if (Array.isArray(value) && value.length < minLength) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must have at least ${minLength} items`
      });
    }
    return this;
  }

  arrayMaxLength(value: any[], maxLength: number, fieldName: string, message?: string): this {
    if (Array.isArray(value) && value.length > maxLength) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must have no more than ${maxLength} items`
      });
    }
    return this;
  }

  oneOf(value: any, options: any[], fieldName: string, message?: string): this {
    if (value && !options.includes(value)) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be one of: ${options.join(', ')}`
      });
    }
    return this;
  }

  date(value: string, fieldName: string, message?: string): this {
    if (value && isNaN(Date.parse(value))) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be a valid date`
      });
    }
    return this;
  }

  futureDate(value: string, fieldName: string, message?: string): this {
    if (value && new Date(value) <= new Date()) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be a future date`
      });
    }
    return this;
  }

  pastDate(value: string, fieldName: string, message?: string): this {
    if (value && new Date(value) >= new Date()) {
      this.errors.push({
        field: fieldName,
        message: message || `${fieldName} must be a past date`
      });
    }
    return this;
  }

  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors]
    };
  }

  reset(): this {
    this.errors = [];
    return this;
  }
}

// Common validation patterns
export const patterns = {
  walletAddress: /^[A-Z2-7]{58}$/, // Algorand wallet address
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  creditCard: /^[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}$/,
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  currency: /^\d+(\.\d{2})?$/,
  percentage: /^(100(\.0{1,2})?|[0-9]{1,2}(\.[0-9]{1,2})?)$/
};

// Validation schemas for common forms
export const schemas = {
  userProfile: (data: any) => {
    const validator = new Validator();
    return validator
      .required(data.name, 'name')
      .minLength(data.name, 2, 'name')
      .maxLength(data.name, 50, 'name')
      .email(data.email, 'email')
      .required(data.location, 'location')
      .minLength(data.location, 2, 'location')
      .maxLength(data.location, 100, 'location')
      .pattern(data.phone, patterns.phone, 'phone', 'Phone number format is invalid')
      .getResult();
  },

  investment: (data: any) => {
    const validator = new Validator();
    return validator
      .required(data.amount, 'amount')
      .min(data.amount, 100, 'amount', 'Minimum investment amount is $100')
      .max(data.amount, 100000, 'amount', 'Maximum investment amount is $100,000')
      .required(data.purpose, 'purpose')
      .minLength(data.purpose, 10, 'purpose')
      .maxLength(data.purpose, 200, 'purpose')
      .required(data.description, 'description')
      .minLength(data.description, 50, 'description')
      .maxLength(data.description, 1000, 'description')
      .required(data.interestRate, 'interestRate')
      .min(data.interestRate, 1, 'interestRate', 'Interest rate must be at least 1%')
      .max(data.interestRate, 50, 'interestRate', 'Interest rate cannot exceed 50%')
      .required(data.duration, 'duration')
      .min(data.duration, 1, 'duration', 'Duration must be at least 1 month')
      .max(data.duration, 60, 'duration', 'Duration cannot exceed 60 months')
      .getResult();
  },

  walletConnection: (data: any) => {
    const validator = new Validator();
    return validator
      .required(data.walletAddress, 'walletAddress')
      .pattern(data.walletAddress, patterns.walletAddress, 'walletAddress', 'Invalid Algorand wallet address')
      .getResult();
  },

  documentUpload: (data: any) => {
    const validator = new Validator();
    return validator
      .required(data.type, 'type')
      .required(data.name, 'name')
      .minLength(data.name, 2, 'name')
      .maxLength(data.name, 100, 'name')
      .required(data.file, 'file')
      .custom(
        data.file && data.file.size <= 10 * 1024 * 1024, // 10MB
        'file',
        'File size must be less than 10MB'
      )
      .custom(
        data.file && ['image/jpeg', 'image/png', 'application/pdf'].includes(data.file.type),
        'file',
        'File must be a JPEG, PNG, or PDF'
      )
      .getResult();
  },

  governanceProposal: (data: any) => {
    const validator = new Validator();
    return validator
      .required(data.title, 'title')
      .minLength(data.title, 10, 'title')
      .maxLength(data.title, 200, 'title')
      .required(data.description, 'description')
      .minLength(data.description, 100, 'description')
      .maxLength(data.description, 5000, 'description')
      .getResult();
  },

  riskAssessment: (data: any) => {
    const validator = new Validator();
    return validator
      .required(data.overallScore, 'overallScore')
      .min(data.overallScore, 0, 'overallScore')
      .max(data.overallScore, 100, 'overallScore')
      .required(data.riskLevel, 'riskLevel')
      .oneOf(data.riskLevel, ['low', 'medium', 'high'], 'riskLevel')
      .required(data.factors, 'factors')
      .array(data.factors, 'factors')
      .arrayMinLength(data.factors, 1, 'factors')
      .getResult();
  },

  notification: (data: any) => {
    const validator = new Validator();
    return validator
      .required(data.type, 'type')
      .oneOf(data.type, ['investment', 'payment', 'system', 'security'], 'type')
      .required(data.title, 'title')
      .minLength(data.title, 5, 'title')
      .maxLength(data.title, 100, 'title')
      .required(data.message, 'message')
      .minLength(data.message, 10, 'message')
      .maxLength(data.message, 500, 'message')
      .required(data.timestamp, 'timestamp')
      .date(data.timestamp, 'timestamp')
      .getResult();
  },

  marketplaceItem: (data: any) => {
    const validator = new Validator();
    return validator
      .required(data.type, 'type')
      .oneOf(data.type, ['investment', 'service', 'product'], 'type')
      .required(data.title, 'title')
      .minLength(data.title, 5, 'title')
      .maxLength(data.title, 200, 'title')
      .required(data.description, 'description')
      .minLength(data.description, 20, 'description')
      .maxLength(data.description, 1000, 'description')
      .required(data.price, 'price')
      .min(data.price, 0, 'price')
      .max(data.price, 1000000, 'price')
      .required(data.currency, 'currency')
      .oneOf(data.currency, ['USD', 'EUR', 'GBP', 'JPY'], 'currency')
      .required(data.category, 'category')
      .minLength(data.category, 2, 'category')
      .maxLength(data.category, 50, 'category')
      .required(data.tags, 'tags')
      .array(data.tags, 'tags')
      .arrayMinLength(data.tags, 1, 'tags')
      .arrayMaxLength(data.tags, 10, 'tags')
      .getResult();
  }
};

// Utility functions
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => `${error.field}: ${error.message}`).join('\n');
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  const error = errors.find(error => error.field === fieldName);
  return error?.message;
};

export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some(error => error.field === fieldName);
};
