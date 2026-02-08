/**
 * TaskList component - Displays a list of tasks with loading, empty, and error states.
 *
 * Purpose: Main container for task display with comprehensive state handling
 * User Stories: US1 (Viewing), US3 (Completion Toggle), US4 (Editing), US5 (Deletion)
 * Features:
 *   - Loading state with spinner
 *   - Empty state when no tasks exist
 *   - Error state with retry option
 *   - Interactive task items with completion toggle, edit, and delete
 *   - Responsive task list display
 * Accessibility: Semantic HTML, ARIA live regions for dynamic updates
 * Responsive: Mobile-first design with proper spacing
 */

import type { Task, UpdateTaskRequest } from '@/ups/types';
import TaskItem from '@/components/TaskItem';
import EmptyState from './EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onToggleComplete: (taskId: number) => Promise<void>;
  onUpdate: (taskId: number, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export default function TaskList({
  tasks,
  isLoading,
  error,
  onRetry,
  onToggleComplete,
  onUpdate,
  onDelete
}: TaskListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100" role="status" aria-live="polite">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-base text-gray-600 font-medium">Loading your tasks...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8" role="alert" aria-live="assertive">
        <ErrorMessage message={error} />
        {onRetry && (
          <div className="mt-6 text-center">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-6 py-3 border-2 border-purple-200 text-sm font-semibold rounded-xl text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div role="status" aria-live="polite">
        <EmptyState
          message="No tasks yet"
          description="Your task list is empty. Create your first task to get started!"
        />
      </div>
    );
  }

  // Task list
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h2 className="text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Your Tasks ({tasks.length})
          </h2>
        </div>
      </div>
      <ul className="divide-y divide-purple-100 p-4 space-y-4" role="list" aria-label="Task list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
