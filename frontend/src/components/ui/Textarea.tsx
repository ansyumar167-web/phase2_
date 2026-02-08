/**
 * Reusable Textarea component with label and error message support.
 */
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-4 py-3 border-2 rounded-xl shadow-sm
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          resize-vertical
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-transparent' : 'border-purple-200 hover:border-purple-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-start" role="alert">
          <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
