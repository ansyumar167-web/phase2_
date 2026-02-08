/**
 * TaskItemDisplay component - Display-only task item for User Story 1.
 *
 * Purpose: Shows task information without interactive actions (view only)
 * User Story: US1 - Authenticated Task Viewing
 * Accessibility: Semantic HTML, proper heading hierarchy, ARIA labels
 * Responsive: Mobile-first design with flexible layout
 *
 * Note: This is a simplified version for US1. Full interactive TaskItem
 * with edit/delete/toggle will be used in later user stories.
 */

import type { Task } from '@/ups/types';

interface TaskItemDisplayProps {
  task: Task;
}

export default function TaskItemDisplay({ task }: TaskItemDisplayProps) {
  return (
    <li className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Completion status indicator (non-interactive) */}
        <div className="flex-shrink-0 pt-1">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              task.isCompleted
                ? 'bg-green-500 border-green-500'
                : 'bg-white border-gray-300'
            }`}
            aria-label={task.isCompleted ? 'Completed' : 'Not completed'}
          >
            {task.isCompleted && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base sm:text-lg font-medium transition-all ${
              task.isCompleted
                ? 'text-gray-500 line-through opacity-75'
                : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`mt-1 text-sm transition-all ${
                task.isCompleted
                  ? 'text-gray-400 line-through opacity-75'
                  : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>
              Created {new Date(task.createdAt).toLocaleDateString()}
            </span>
            {task.isCompleted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
