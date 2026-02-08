/**
 * TypeScript type definitions for the Todo application.
 */

export interface User {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  isCompleted?: boolean;
}

export interface AuthResponse {
  user: User;
}

export interface ErrorResponse {
  detail: string;
}
