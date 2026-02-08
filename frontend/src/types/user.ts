/**
 * User type definitions for authentication and user management.
 *
 * These types mirror the backend User model and API responses.
 */

export interface User {
  id: number;
  email: string;
  created_at: string;  // ISO 8601 datetime string
  updated_at: string;  // ISO 8601 datetime string
}

export interface AuthResponse {
  user: User;
  token: string;  // JWT token (also set in httpOnly cookie)
}
