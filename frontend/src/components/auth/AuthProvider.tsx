/**
 * AuthProvider component for managing authentication state across the application.
 *
 * Features:
 * - React Context for global authentication state
 * - Session management with JWT tokens (httpOnly cookies)
 * - Automatic session restoration on mount
 * - Sign in, sign up, sign out, and refresh user methods
 * - Loading states for async operations
 *
 * Security:
 * - JWT tokens stored in httpOnly cookies (not accessible to JavaScript)
 * - Automatic session validation on mount
 * - Graceful handling of expired sessions
 *
 * Usage:
 *   import { useAuth } from '@/components/auth/AuthProvider';
 *
 *   function MyComponent() {
 *     const { user, isAuthenticated, signIn, signOut } = useAuth();
 *     // ...
 *   }
 */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { AuthContextValue } from '@/types/session';
import * as authService from '@/ups/auth';
import { handleApiError, ErrorType } from '@/ups/error-handler';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch current user from backend
   * Called on mount to restore session
   */
  const fetchCurrentUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      // Session expired or invalid - clear user state
      // Don't log authentication errors (expected when not logged in)
      if (error?.status === 403 || error?.status === 401) {
        setUser(null);
      } else {
        // Network or other errors - log but don't clear user state
        console.error('Failed to fetch current user:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in user with email and password
   * Sets user state and redirects to /tasks on success
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    const response = await authService.signIn(email, password);
    setUser(response.user);
    router.push('/tasks');
  };

  /**
   * Sign up new user with email and password
   * Sets user state and redirects to /tasks on success
   */
  const signUp = async (email: string, password: string): Promise<void> => {
    const response = await authService.signUp(email, password);
    setUser(response.user);
    router.push('/tasks');
  };

  /**
   * Sign out current user
   * Clears user state and redirects to /signin
   */
  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      // Always clear user state and redirect, even if API call fails
      // Token is already removed by authService.signOut()
      setUser(null);
      router.push('/signin');
    }
  };

  /**
   * Refresh current user data
   * Useful after profile updates
   */
  const refreshUser = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  // Fetch current user on mount to restore session
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
