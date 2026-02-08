/**
 * SignInForm component for user authentication.
 *
 * Features:
 * - Email and password input with basic validation
 * - Loading state during submission
 * - Error handling with user-friendly messages
 * - Generic error messages for security
 *
 * Security:
 * - Generic error messages to prevent user enumeration
 * - Uses AuthProvider for centralized authentication
 * - JWT tokens stored in httpOnly cookies
 * - No sensitive data exposed in error messages
 *
 * Usage:
 *   import { SignInForm } from '@/components/auth/SignInForm';
 *   <SignInForm />
 */
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ErrorMessage } from '../ui/ErrorMessage';
import { handleApiError } from '@/ups/error-handler';

export function SignInForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Validate form fields before submission
   * Returns true if all validations pass
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   * Validates inputs and calls signIn from AuthContext
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      // AuthProvider handles redirect to /tasks on success
    } catch (err) {
      const { message, statusCode } = handleApiError(err);

      // Security: Use generic error message for authentication failures
      // Don't reveal whether email exists or password is wrong
      if (statusCode === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        // Other errors (network, server, etc.)
        setError(message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && <ErrorMessage message={error} />}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
        disabled={isLoading}
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        required
        disabled={isLoading}
        autoComplete="current-password"
        placeholder="Enter your password"
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
}
