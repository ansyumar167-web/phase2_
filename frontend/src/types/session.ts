/**
 * Session type definitions for authentication state management.
 *
 * These types define the shape of the authentication context and session state.
 */

import { User } from './user';

export interface Session {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends Session {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
