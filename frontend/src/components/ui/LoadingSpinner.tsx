'use client';

/**
 * Reusable LoadingSpinner component for loading states.
 *
 * @component
 * @example
 * ```tsx
 * <LoadingSpinner size="md" />
 * <LoadingSpinner size="lg" message="Loading tasks..." />
 * ```
 */
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`} role="status" aria-live="polite">
      <div className="relative">
        <svg
          className={`animate-spin text-purple-600 ${sizeClasses[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <svg
          className={`animate-spin absolute inset-0 text-indigo-600 ${sizeClasses[size]}`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
      </div>
      <span className="sr-only">{message || 'Loading'}</span>
      {message && (
        <p className="mt-3 text-sm text-gray-600 font-medium" aria-hidden="true">{message}</p>
      )}
    </div>
  );
}
