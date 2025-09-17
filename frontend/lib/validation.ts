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
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
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
