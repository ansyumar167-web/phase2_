/**
 * EmptyState component - Displays a friendly message when user has no tasks.
 *
 * Purpose: Provides clear feedback to users with empty task lists
 * Accessibility: Semantic HTML with descriptive text
 * Responsive: Mobile-first design with centered layout
 */

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export default function EmptyState({
  message = "No tasks yet",
  description = "Create your first task to get started!"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 inline-block p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl shadow-lg">
          <svg
            className="h-20 w-20 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>

        {/* Message */}
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {message}
        </h3>

        {/* Description */}
        <p className="text-base text-gray-600 leading-relaxed">
          {description}
        </p>

        {/* Decorative element */}
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
