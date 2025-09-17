'use client';

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          {spinner}
          {text && (
            <p className={`text-sm font-medium ${colorClasses[color]}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center space-x-3">
        {spinner}
        <p className={`text-sm font-medium ${colorClasses[color]}`}>
          {text}
        </p>
      </div>
    );
  }

  return spinner;
};

// Skeleton loading components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="animate-pulse">
    <div className="grid grid-cols-4 gap-4 mb-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded"></div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 mb-2">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="h-3 bg-gray-200 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Loading states for different components
export const LoadingButton: React.FC<{ 
  loading: boolean; 
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ 
  loading, 
  children, 
  className = '', 
  disabled = false, 
  onClick 
}) => (
  <button
    className={`relative ${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={disabled || loading}
    onClick={onClick}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loading size="sm" color="white" />
      </div>
    )}
    <span className={loading ? 'opacity-0' : ''}>
      {children}
    </span>
  </button>
);

export const LoadingInput: React.FC<{ 
  loading: boolean; 
  children: React.ReactNode;
  className?: string;
}> = ({ loading, children, className = '' }) => (
  <div className={`relative ${className}`}>
    {children}
    {loading && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <Loading size="sm" color="gray" />
      </div>
    )}
  </div>
);

// Progress bar component
export const ProgressBar: React.FC<{
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}> = ({ 
  progress, 
  className = '', 
  showPercentage = false, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ease-in-out ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

// Loading overlay component
export const LoadingOverlay: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}> = ({ 
  loading, 
  children, 
  className = '', 
  overlayClassName = '' 
}) => (
  <div className={`relative ${className}`}>
    {children}
    {loading && (
      <div className={`absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 ${overlayClassName}`}>
        <div className="flex flex-col items-center space-y-2">
          <Loading size="lg" color="primary" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )}
  </div>
);

export default Loading;
