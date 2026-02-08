/**
 * Centralized API client for all backend communication.
 *
 * Features:
 * - Automatic inclusion of credentials (httpOnly cookies)
 * - Authorization header with JWT token
 * - Consistent error handling
 * - Type-safe request/response handling
 * - Request timeout (10 seconds)
 * - Retry logic for failed requests
 * - Rate limit handling with exponential backoff
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get JWT token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
};

/**
 * Set JWT token in localStorage
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth-token', token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth-token');
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (attempt: number): number => {
  return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 2
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Get auth token and add to headers
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include', // Still include cookies for fallback
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting (429)
      if (response.status === 429) {
        clearTimeout(timeoutId);

        if (attempt < retries) {
          const delay = getBackoffDelay(attempt);
          console.warn(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
          await sleep(delay);
          continue;
        }

        throw new ApiError(429, 'Too many requests. Please try again later.', { detail: 'Rate limit exceeded' });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new ApiError(response.status, errorData.detail || 'Request failed', errorData);
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle timeout or network errors
      if (error.name === 'AbortError') {
        lastError = new ApiError(408, 'Request timeout - backend may be sleeping', { detail: 'Request timeout' });

        // Retry on timeout
        if (attempt < retries) {
          const delay = getBackoffDelay(attempt);
          console.warn(`Request timeout. Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
          await sleep(delay);
          continue;
        }
      } else if (error instanceof ApiError) {
        // Don't retry on client errors (4xx except 429)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }
        lastError = error;
      } else {
        // Network error - retry
        lastError = error;
      }

      // Retry with exponential backoff
      if (attempt < retries) {
        const delay = getBackoffDelay(attempt);
        console.warn(`Request failed. Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }
    }
  }

  // All retries exhausted
  throw lastError;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
