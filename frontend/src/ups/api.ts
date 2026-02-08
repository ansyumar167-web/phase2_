/**
 * API client for making authenticated requests to the backend.
 *
 * Handles:
 * - Authenticated requests with JWT cookies
 * - Field name transformation (snake_case backend <-> camelCase frontend)
 * - Error handling and redirects
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

/**
 * Transform task data from backend format (snake_case) to frontend format (camelCase)
 */
function transformTaskFromBackend(backendTask: any): Task {
  return {
    id: backendTask.id,
    userId: backendTask.user_id,
    title: backendTask.title,
    description: backendTask.description,
    isCompleted: backendTask.is_completed,
    createdAt: backendTask.created_at,
    updatedAt: backendTask.updated_at,
  };
}

/**
 * Transform task update data from frontend format (camelCase) to backend format (snake_case)
 */
function transformTaskUpdateToBackend(frontendData: UpdateTaskRequest): any {
  const backendData: any = {};

  if (frontendData.title !== undefined) {
    backendData.title = frontendData.title;
  }

  if (frontendData.description !== undefined) {
    backendData.description = frontendData.description;
  }

  if (frontendData.isCompleted !== undefined) {
    backendData.is_completed = frontendData.isCompleted;
  }

  return backendData;
}

/**
 * Transform task creation data from frontend format to backend format
 */
function transformTaskCreateToBackend(frontendData: CreateTaskRequest): any {
  return {
    title: frontendData.title,
    description: frontendData.description || undefined,
  };
}

/**
 * Make an authenticated API request.
 * Automatically includes credentials (cookies) with the request.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies (JWT token)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - redirect to sign-in
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
      throw new Error('Unauthorized');
    }

    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API error: ${response.status}`);
    } catch {
      throw new Error(`API error: ${response.status}`);
    }
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/**
 * API client methods with automatic field transformation
 */
export const api = {
  /**
   * Get all tasks for the authenticated user.
   * Transforms backend snake_case to frontend camelCase.
   */
  getTasks: async (): Promise<Task[]> => {
    const backendTasks = await apiRequest<any[]>('/api/tasks', { method: 'GET' });
    return backendTasks.map(transformTaskFromBackend);
  },

  /**
   * Create a new task.
   * Transforms frontend camelCase to backend snake_case and back.
   */
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const backendData = transformTaskCreateToBackend(data);
    const backendTask = await apiRequest<any>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    return transformTaskFromBackend(backendTask);
  },

  /**
   * Update an existing task (partial updates supported).
   * Transforms frontend camelCase to backend snake_case and back.
   */
  updateTask: async (id: number, data: UpdateTaskRequest): Promise<Task> => {
    const backendData = transformTaskUpdateToBackend(data);
    const backendTask = await apiRequest<any>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    return transformTaskFromBackend(backendTask);
  },

  /**
   * Toggle task completion status (convenience method).
   * Transforms frontend camelCase to backend snake_case and back.
   */
  toggleTaskCompletion: async (id: number, isCompleted: boolean): Promise<Task> => {
    const backendData = { is_completed: isCompleted };
    const backendTask = await apiRequest<any>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    return transformTaskFromBackend(backendTask);
  },

  /**
   * Delete a task.
   */
  deleteTask: (id: number) =>
    apiRequest<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
};

// Type definitions (imported from types.ts)
import type { Task, CreateTaskRequest, UpdateTaskRequest } from './types';
