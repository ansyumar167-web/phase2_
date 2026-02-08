/**
 * SignUpForm component for user registration.
 *
 * Features:
 * - Email and password input with validation
 * - Password confirmation
 * - Client-side validation (email format, password strength)
 * - Password requirements display
 * - Loading state during submission
 * - Error handling with user-friendly messages
 *
 * Security:
 * - Password strength validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 * - Generic error messages to prevent user enumeration
 * - Client-side validation matches backend rules
 * - Uses AuthProvider for centralized authentication
 *
 * Usage:
 *   import { SignUpForm } from '@/components/auth/SignUpForm';
 *   <SignUpForm />
 */
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ErrorMessage } from '../ui/ErrorMessage';
import { isValidEmail, validatePassword, getPasswordRequirements } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

export function SignUpForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Validate form fields before submission
   * Returns true if all validations pass
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error || 'Invalid password';
      }
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   * Validates inputs and calls signUp from AuthContext
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
      await signUp(email, password);
      // AuthProvider handles redirect to /tasks on success
    } catch (err) {
      const { message, statusCode } = handleApiError(err);

      // Handle specific error cases
      if (statusCode === 409) {
        // Email already exists - show generic message for security
        setError('An account with this email already exists. Please sign in instead.');
      } else if (statusCode === 422 || statusCode === 400) {
        // Validation error from backend
        setError(message);
      } else {
        // Generic error message
        setError(message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = getPasswordRequirements();

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

      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
          disabled={isLoading}
          autoComplete="new-password"
          placeholder="Enter a strong password"
        />

        {/* Password requirements */}
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-medium mb-1">Password must contain:</p>
          <ul className="list-disc list-inside space-y-1">
            {passwordRequirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      </div>

      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        required
        disabled={isLoading}
        autoComplete="new-password"
        placeholder="Re-enter your password"
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        Sign Up
      </Button>
    </form>
  );
}
