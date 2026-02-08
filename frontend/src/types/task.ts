/**
 * Task type definitions for todo item management.
 *
 * These types mirror the backend Task model and API request/response formats.
 */

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: number;
  created_at: string;  // ISO 8601 datetime string
  updated_at: string;  // ISO 8601 datetime string
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
