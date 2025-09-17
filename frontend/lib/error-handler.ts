export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: Error; context: ErrorContext; timestamp: string }> = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error, context: ErrorContext = {}): void {
    const timestamp = new Date().toISOString();
    const errorEntry = {
      error,
      context: {
        ...context,
        timestamp
      },
      timestamp
    };

    this.errorLog.push(errorEntry);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error, context);
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, context);
    }
  }

  private async reportError(error: Error, context: ErrorContext): Promise<void> {
    try {
      // In a real application, you would send this to an error reporting service
      // like Sentry, LogRocket, or Bugsnag
      console.log('Error reported to service:', { error: error.message, context });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  getErrorLog(): Array<{ error: Error; context: ErrorContext; timestamp: string }> {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getErrorCount(): number {
    return this.errorLog.length;
  }

  getErrorsByComponent(component: string): Array<{ error: Error; context: ErrorContext; timestamp: string }> {
    return this.errorLog.filter(entry => entry.context.component === component);
  }

  getRecentErrors(count: number = 10): Array<{ error: Error; context: ErrorContext; timestamp: string }> {
    return this.errorLog.slice(-count);
  }

  hasErrors(): boolean {
    return this.errorLog.length > 0;
  }

  getLastError(): { error: Error; context: ErrorContext; timestamp: string } | null {
    return this.errorLog.length > 0 ? this.errorLog[this.errorLog.length - 1] : null;
  }
}

// API Error handling
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred on the server',
      code: error.response.data?.code,
      status: error.response.status,
      details: error.response.data?.details
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
};

// Error messages for common scenarios
export const errorMessages = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  TIMEOUT: 'The request timed out. Please try again.',
  WALLET_CONNECTION_ERROR: 'Failed to connect wallet. Please try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  SMART_CONTRACT_ERROR: 'Smart contract execution failed. Please try again.',
  DOCUMENT_UPLOAD_ERROR: 'Failed to upload document. Please try again.',
  VERIFICATION_ERROR: 'Verification failed. Please check your documents and try again.'
};

// Error boundary helper
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance();
      errorHandler.handleError(error as Error, {
        component: Component.name,
        action: 'render'
      });
      throw error;
    }
  };
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};

// Error recovery strategies
export const recoveryStrategies = {
  retry: (fn: () => Promise<any>, maxRetries: number = 3) => {
    return withRetry(fn, maxRetries);
  },
  
  fallback: <T>(fn: () => Promise<T>, fallback: T) => {
    return async (): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        console.warn('Primary function failed, using fallback:', error);
        return fallback;
      }
    };
  },
  
  cache: <T>(fn: () => Promise<T>, cacheKey: string, ttl: number = 300000) => {
    const cache = new Map<string, { value: T; expiry: number }>();
    
    return async (): Promise<T> => {
      const cached = cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }
      
      try {
        const result = await fn();
        cache.set(cacheKey, { value: result, expiry: Date.now() + ttl });
        return result;
      } catch (error) {
        if (cached) {
          console.warn('Primary function failed, using cached value:', error);
          return cached.value;
        }
        throw error;
      }
    };
  },

  circuitBreaker: <T>(fn: () => Promise<T>, failureThreshold: number = 5, timeout: number = 60000) => {
    let failures = 0;
    let lastFailureTime = 0;
    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    return async (): Promise<T> => {
      if (state === 'OPEN') {
        if (Date.now() - lastFailureTime > timeout) {
          state = 'HALF_OPEN';
        } else {
          throw new Error('Circuit breaker is OPEN');
        }
      }

      try {
        const result = await fn();
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          failures = 0;
        }
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();
        
        if (failures >= failureThreshold) {
          state = 'OPEN';
        }
        
        throw error;
      }
    };
  },

  timeout: <T>(fn: () => Promise<T>, timeoutMs: number = 5000) => {
    return async (): Promise<T> => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
      });

      return Promise.race([fn(), timeoutPromise]);
    };
  }
};

// Global error handler for unhandled promises
export const setupGlobalErrorHandling = () => {
  const errorHandler = ErrorHandler.getInstance();
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(
      new Error(event.reason),
      { action: 'unhandledrejection' }
    );
  });
  
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorHandler.handleError(
      new Error(event.message),
      { 
        action: 'uncaught',
        component: event.filename,
        details: { line: event.lineno, column: event.colno }
      }
    );
  });
};

export default ErrorHandler;
