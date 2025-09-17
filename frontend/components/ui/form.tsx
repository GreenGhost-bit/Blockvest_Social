'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FormField {
  name: string;
  value: any;
  error?: string;
  touched: boolean;
  required: boolean;
  validators: Array<(value: any) => string | undefined>;
}

interface FormContextType {
  fields: Record<string, FormField>;
  setFieldValue: (name: string, value: any) => void;
  setFieldError: (name: string, error: string | undefined) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  isValid: boolean;
  isDirty: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

interface FormProviderProps {
  children: ReactNode;
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  validationSchema?: Record<string, Array<(value: any) => string | undefined>>;
  className?: string;
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  initialValues,
  onSubmit,
  validationSchema = {},
  className = ''
}) => {
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initialFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      initialFields[key] = {
        name: key,
        value: initialValues[key],
        error: undefined,
        touched: false,
        required: false,
        validators: validationSchema[key] || []
      };
    });
    return initialFields;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback((name: string, value: any) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: undefined // Clear error when value changes
      }
    }));
  }, []);

  const setFieldError = useCallback((name: string, error: string | undefined) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error
      }
    }));
  }, []);

  const setFieldTouched = useCallback((name: string, touched: boolean) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched
      }
    }));
  }, []);

  const validateField = useCallback((name: string): boolean => {
    const field = fields[name];
    if (!field) return true;

    const validators = field.validators;
    for (const validator of validators) {
      const error = validator(field.value);
      if (error) {
        setFieldError(name, error);
        return false;
      }
    }

    setFieldError(name, undefined);
    return true;
  }, [fields, setFieldError]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    Object.keys(fields).forEach(key => {
      if (!validateField(key)) {
        isValid = false;
      }
    });
    return isValid;
  }, [fields, validateField]);

  const resetForm = useCallback(() => {
    setFields(prev => {
      const resetFields: Record<string, FormField> = {};
      Object.keys(prev).forEach(key => {
        resetFields[key] = {
          ...prev[key],
          value: initialValues[key],
          error: undefined,
          touched: false
        };
      });
      return resetFields;
    });
  }, [initialValues]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setFields(prev => {
      const touchedFields: Record<string, FormField> = {};
      Object.keys(prev).forEach(key => {
        touchedFields[key] = { ...prev[key], touched: true };
      });
      return touchedFields;
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const values = Object.keys(fields).reduce((acc, key) => {
        acc[key] = fields[key].value;
        return acc;
      }, {} as Record<string, any>);
      
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, validateForm, onSubmit]);

  const isValid = Object.values(fields).every(field => !field.error);
  const isDirty = Object.keys(fields).some(key => fields[key].value !== initialValues[key]);

  const value: FormContextType = {
    fields,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    isSubmitting,
    setIsSubmitting,
    isValid,
    isDirty
  };

  return (
    <FormContext.Provider value={value}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Form field component
interface FormFieldProps {
  name: string;
  children: (field: FormField & { setValue: (value: any) => void; setTouched: (touched: boolean) => void }) => ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ name, children }) => {
  const { fields, setFieldValue, setFieldTouched } = useForm();
  const field = fields[name];

  if (!field) {
    console.warn(`FormField: Field "${name}" not found in form`);
    return null;
  }

  const setValue = (value: any) => setFieldValue(name, value);
  const setTouched = (touched: boolean) => setFieldTouched(name, touched);

  return <>{children({ ...field, setValue, setTouched })}</>;
};

// Input component
interface InputProps {
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

export const Input: React.FC<InputProps> = ({
  name,
  type = 'text',
  placeholder,
  className = '',
  disabled = false,
  required = false,
  autoComplete,
  autoFocus = false
}) => {
  return (
    <FormField name={name}>
      {({ value, error, touched, setValue, setTouched }) => (
        <div>
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              error && touched ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${className}`}
          />
          {error && touched && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </FormField>
  );
};

// Textarea component
interface TextareaProps {
  name: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  autoFocus?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  name,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  rows = 4,
  autoFocus = false
}) => {
  return (
    <FormField name={name}>
      {({ value, error, touched, setValue, setTouched }) => (
        <div>
          <textarea
            name={name}
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            autoFocus={autoFocus}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical ${
              error && touched ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${className}`}
          />
          {error && touched && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </FormField>
  );
};

// Select component
interface SelectProps {
  name: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  name,
  options,
  placeholder,
  className = '',
  disabled = false,
  required = false
}) => {
  return (
    <FormField name={name}>
      {({ value, error, touched, setValue, setTouched }) => (
        <div>
          <select
            name={name}
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={disabled}
            required={required}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              error && touched ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${className}`}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {error && touched && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </FormField>
  );
};

// Checkbox component
interface CheckboxProps {
  name: string;
  label: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  className = '',
  disabled = false,
  required = false
}) => {
  return (
    <FormField name={name}>
      {({ value, error, touched, setValue, setTouched }) => (
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name={name}
              checked={Boolean(value)}
              onChange={(e) => setValue(e.target.checked)}
              onBlur={() => setTouched(true)}
              disabled={disabled}
              required={required}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                error && touched ? 'border-red-500' : ''
              } ${className}`}
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
          </label>
          {error && touched && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </FormField>
  );
};

// Radio group component
interface RadioGroupProps {
  name: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  className = '',
  disabled = false,
  required = false
}) => {
  return (
    <FormField name={name}>
      {({ value, error, touched, setValue, setTouched }) => (
        <div>
          <div className={`space-y-2 ${className}`}>
            {options.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => setValue(e.target.value)}
                  onBlur={() => setTouched(true)}
                  disabled={disabled || option.disabled}
                  required={required}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    error && touched ? 'border-red-500' : ''
                  }`}
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {error && touched && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </FormField>
  );
};

// Submit button component
interface SubmitButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  className = '',
  disabled = false,
  loading = false
}) => {
  const { isSubmitting, isValid } = useForm();
  const isDisabled = disabled || isSubmitting || loading || !isValid;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
    >
      {isSubmitting || loading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Submitting...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Validation utilities
export const validators = {
  required: (message = 'This field is required') => (value: any) => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    return undefined;
  },

  email: (message = 'Please enter a valid email address') => (value: string) => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? undefined : message;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (!value) return undefined;
    const msg = message || `Must be at least ${min} characters long`;
    return value.length >= min ? undefined : msg;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (!value) return undefined;
    const msg = message || `Must be no more than ${max} characters long`;
    return value.length <= max ? undefined : msg;
  },

  min: (min: number, message?: string) => (value: number) => {
    if (value === undefined || value === null) return undefined;
    const msg = message || `Must be at least ${min}`;
    return value >= min ? undefined : msg;
  },

  max: (max: number, message?: string) => (value: number) => {
    if (value === undefined || value === null) return undefined;
    const msg = message || `Must be no more than ${max}`;
    return value <= max ? undefined : msg;
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (!value) return undefined;
    return regex.test(value) ? undefined : message;
  },

  custom: (validator: (value: any) => string | undefined) => validator
};

export default FormProvider;
