'use client';

/**
 * TaskItem component for displaying a single task.
 *
 * Features:
 * - Displays task title, description, completion status
 * - Shows formatted timestamps (created_at, updated_at)
 * - Card layout with hover effects
 * - Responsive design (mobile-first)
 * - Accessible with semantic HTML
 *
 * @component
 * @example
 * ```tsx
 * <TaskItem
 *   task={task}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 * />
 * ```
 */
import React from 'react';
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
}

/**
 * Format ISO 8601 datetime string to user-friendly format
 * Example: "2026-01-11T10:30:00Z" -> "Jan 11, 2026 at 10:30 AM"
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  return (
    <article
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      aria-labelledby={`task-title-${task.id}`}
    >
      {/* Task Header: Title and Completion Status */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3
          id={`task-title-${task.id}`}
          className={`text-lg font-semibold text-gray-900 flex-1 ${
            task.completed ? 'line-through text-gray-500' : ''
          }`}
        >
          {task.title}
        </h3>

        {/* Completion Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
            task.completed
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
          aria-label={task.completed ? 'Task completed' : 'Task pending'}
        >
          {task.completed ? 'Completed' : 'Pending'}
        </span>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Task Metadata: Timestamps */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3 mt-3">
        <div className="flex items-center gap-1">
          <span className="font-medium">Created:</span>
          <time dateTime={task.created_at}>
            {formatDateTime(task.created_at)}
          </time>
        </div>

        {task.updated_at !== task.created_at && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Updated:</span>
            <time dateTime={task.updated_at}>
              {formatDateTime(task.updated_at)}
            </time>
          </div>
        )}
      </div>
    </article>
  );
}
