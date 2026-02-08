/**
 * Error type definitions for API error handling and user feedback.
 *
 * These types categorize errors and provide structured error information.
 */

export interface ApiError {
  status: number;
  detail: string;
  errors?: Record<string, string[]>;  // Field-level validation errors
}

export interface ErrorInfo {
  message: string;
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  shouldRetry: boolean;
  fieldErrors?: Record<string, string>;
  redirect?: string;
}
