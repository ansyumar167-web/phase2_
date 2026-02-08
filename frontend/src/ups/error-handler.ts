/**
 * Centralized error handling utility for consistent error management across the application.
 *
 * Purpose: Categorize errors by type and provide user-friendly error messages
 * Features:
 *   - Network error detection (offline, timeout, DNS failure)
 *   - Authentication error handling (401)
 *   - Authorization error handling (403)
 *   - Validation error handling (400, 422)
 *   - Server error handling (500, 502, 503)
 *   - Unknown error handling
 *
 * Usage:
 *   import { handleApiError, ErrorType } from '@/lib/error-handler';
 *
 *   try {
 *     await api.createTask(data);
 *   } catch (error) {
 *     const { message, type, shouldRetry } = handleApiError(error);
 *     setError(message);
 *     if (shouldRetry) {
 *       // Show retry button
 *     }
 *   }
 */

/**
 * Error types for categorization
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * Structured error response
 */
export interface ErrorResponse {
  message: string;
  type: ErrorType;
  shouldRetry: boolean;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
}

/**
 * Check if error is a network error (offline, timeout, DNS failure)
 */
export function isNetworkError(error: any): boolean {
  // Check for common network error indicators
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }

  // Check for timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return true;
  }

  // Check for DNS/connection errors
  if (
    error.message?.includes('NetworkError') ||
    error.message?.includes('Network request failed') ||
    error.message?.includes('ERR_INTERNET_DISCONNECTED') ||
    error.message?.includes('ERR_NAME_NOT_RESOLVED')
  ) {
    return true;
  }

  return false;
}

/**
 * Extract field errors from validation error response
 */
function extractFieldErrors(error: any): Record<string, string> | undefined {
  // FastAPI validation errors format
  if (error.detail && Array.isArray(error.detail)) {
    const fieldErrors: Record<string, string> = {};
    error.detail.forEach((err: any) => {
      if (err.loc && err.msg) {
        // loc is an array like ["body", "title"]
        const field = err.loc[err.loc.length - 1];
        fieldErrors[field] = err.msg;
      }
    });
    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
  }

  // Generic validation errors format
  if (error.errors && typeof error.errors === 'object') {
    return error.errors;
  }

  return undefined;
}

/**
 * Main error handler function
 * Categorizes errors and returns user-friendly messages
 */
export function handleApiError(error: any): ErrorResponse {
  // Network errors (offline, timeout, DNS failure)
  if (isNetworkError(error)) {
    return {
      message: 'Unable to connect. Please check your internet connection.',
      type: ErrorType.NETWORK,
      shouldRetry: true,
    };
  }

  // HTTP errors with status codes
  if (error.response || error.status || error.statusCode) {
    const statusCode = error.response?.status || error.status || error.statusCode;
    const errorData = error.response?.data || error.data || error;

    switch (statusCode) {
      // Authentication errors (401)
      case 401:
        return {
          message: 'Your session has expired. Please sign in again.',
          type: ErrorType.AUTHENTICATION,
          shouldRetry: false,
          statusCode,
        };

      // Authorization errors (403)
      case 403:
        return {
          message: "You don't have permission to perform this action.",
          type: ErrorType.AUTHORIZATION,
          shouldRetry: false,
          statusCode,
        };

      // Validation errors (400, 422)
      case 400:
      case 422:
        const fieldErrors = extractFieldErrors(errorData);
        const validationMessage =
          errorData.detail ||
          errorData.message ||
          'Please check your input and try again.';

        return {
          message: validationMessage,
          type: ErrorType.VALIDATION,
          shouldRetry: false,
          statusCode,
          fieldErrors,
        };

      // Server errors (500, 502, 503)
      case 500:
      case 502:
      case 503:
        return {
          message: 'Something went wrong on our end. Please try again.',
          type: ErrorType.SERVER,
          shouldRetry: true,
          statusCode,
        };

      // Other HTTP errors
      default:
        return {
          message:
            errorData.detail ||
            errorData.message ||
            'An error occurred. Please try again.',
          type: ErrorType.UNKNOWN,
          shouldRetry: true,
          statusCode,
        };
    }
  }

  // Error with message property
  if (error.message) {
    return {
      message: error.message,
      type: ErrorType.UNKNOWN,
      shouldRetry: true,
    };
  }

  // Unknown error format
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: ErrorType.UNKNOWN,
    shouldRetry: true,
  };
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    return navigator.onLine;
  }
  return true; // Assume online in SSR
}

/**
 * Get user-friendly error message for specific error types
 */
export function getErrorMessage(type: ErrorType, customMessage?: string): string {
  if (customMessage) {
    return customMessage;
  }

  switch (type) {
    case ErrorType.NETWORK:
      return 'Unable to connect. Please check your internet connection.';
    case ErrorType.AUTHENTICATION:
      return 'Your session has expired. Please sign in again.';
    case ErrorType.AUTHORIZATION:
      return "You don't have permission to perform this action.";
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.SERVER:
      return 'Something went wrong on our end. Please try again.';
    case ErrorType.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Format field errors for display
 */
export function formatFieldErrors(
  fieldErrors?: Record<string, string>
): string | null {
  if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
    return null;
  }

  const errors = Object.entries(fieldErrors)
    .map(([field, message]) => `${field}: ${message}`)
    .join(', ');

  return errors;
}

/**
 * Check if error should trigger a redirect to signin
 */
export function shouldRedirectToSignIn(error: any): boolean {
  const { type, statusCode } = handleApiError(error);
  return type === ErrorType.AUTHENTICATION || statusCode === 401;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const { shouldRetry } = handleApiError(error);
  return shouldRetry;
}
