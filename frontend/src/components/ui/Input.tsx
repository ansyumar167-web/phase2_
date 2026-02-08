'use client';

/**
 * Reusable Input component with label and error message support.
 *
 * @component
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={errors.email}
 *   required
 * />
 * ```
 */
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = '',
  id,
  required,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={errorId}
        aria-required={required}
        className={`
          w-full px-4 py-3 border-2 rounded-xl shadow-sm
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-transparent' : 'border-purple-200 hover:border-purple-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 flex items-start" role="alert">
          <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
