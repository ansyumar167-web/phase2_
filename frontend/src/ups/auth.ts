/**
 * Authentication utility functions for user signup, signin, signout, and session management.
 *
 * Security features:
 * - JWT tokens stored in localStorage (for cross-origin compatibility)
 * - Authorization header used for API requests
 * - Type-safe API responses
 * - Centralized error handling via API client
 *
 * Usage:
 *   import { signUp, signIn, signOut, getCurrentUser } from '@/lib/auth';
 *
 *   await signUp('user@example.com', 'SecurePass123');
 *   await signIn('user@example.com', 'SecurePass123');
 *   const user = await getCurrentUser();
 *   await signOut();
 */

import { api, setAuthToken, removeAuthToken } from '@/ups/api-client';
import { User, AuthResponse } from '@/types/user';

/**
 * Sign up a new user
 *
 * @param email - User's email address
 * @param password - User's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 * @returns AuthResponse with user data and token
 * @throws ApiError on validation failure or if email already exists (409)
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/signup', {
    email,
    password,
  });

  // Store token in localStorage
  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
}

/**
 * Sign in an existing user
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns AuthResponse with user data and token
 * @throws ApiError on invalid credentials (401)
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/signin', {
    email,
    password,
  });

  // Store token in localStorage
  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
}

/**
 * Sign out the current user
 * Clears the JWT token from localStorage
 *
 * @returns Success message
 * @throws ApiError if not authenticated
 */
export async function signOut(): Promise<{ message: string }> {
  try {
    const response = await api.post<{ message: string }>('/api/auth/signout', {});
    return response;
  } finally {
    // Always remove token from localStorage, even if API call fails
    removeAuthToken();
  }
}

/**
 * Get the current authenticated user
 * Validates the JWT token from localStorage
 *
 * @returns User object if authenticated
 * @throws ApiError if not authenticated (401) or token invalid/expired
 */
export async function getCurrentUser(): Promise<User> {
  return api.get<User>('/api/auth/me');
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 *
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
}

/**
 * Get password strength requirements as a list
 * Useful for displaying requirements to users
 *
 * @returns Array of password requirement strings
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 8 characters long',
    'Contains at least one uppercase letter (A-Z)',
    'Contains at least one lowercase letter (a-z)',
    'Contains at least one number (0-9)',
  ];
}
