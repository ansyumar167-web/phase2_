/**
 * Tasks page - Protected route for authenticated users.
 *
 * User Story: US1 - Authenticated Task Viewing
 * Features:
 *   - Fetches and displays user's tasks
 *   - Handles loading, empty, and error states
 *   - Automatic redirect on authentication failure (via middleware and API client)
 * Accessibility: Semantic HTML, ARIA labels, keyboard navigation
 * Responsive: Mobile-first design with proper breakpoints
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import TaskList from '@/components/tasks/TaskList';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import { api } from '@/lib/api';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on mount
  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    setError(null);

    try {
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      setError(err.message || 'Failed to load tasks. Please try again.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Handle task completion toggle
  const handleToggleComplete = async (taskId: number) => {
    // Find the task to toggle
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update: immediately update UI
    const newCompletionStatus = !task.isCompleted;
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId ? { ...t, isCompleted: newCompletionStatus } : t
      )
    );

    try {
      // Call API to update task
      const updatedTask = await api.toggleTaskCompletion(taskId, newCompletionStatus);

      // Update with server response (in case of any differences)
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (err: any) {
      console.error('Failed to toggle task completion:', err);

      // Revert optimistic update on error
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, isCompleted: task.isCompleted } : t
        )
      );

      // Show error to user
      setError(err.message || 'Failed to update task. Please try again.');

      // Re-throw to let TaskItem handle it
      throw err;
    }
  };

  // Handle task update (title/description)
  const handleUpdateTask = async (taskId: number, data: any) => {
    try {
      const updatedTask = await api.updateTask(taskId, data);
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (err: any) {
      console.error('Failed to update task:', err);
      throw err;
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchTasks();
    }
  }, [authLoading, user]);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Navigation bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Todo App
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden sm:inline font-medium">
                {user?.email}
              </span>
              <Button variant="secondary" onClick={signOut}>
                Sign Out
              </Button>
              
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            My Tasks
          </h2>
          <p className="mt-2 text-base text-gray-600">
            View and manage your personal task list
          </p>
        </div>

        {/* Create task form */}
        <div className="mb-8">
          <CreateTaskForm onTaskCreated={fetchTasks} />
        </div>

        {/* Task list with loading, empty, and error states */}
        <TaskList
          tasks={tasks}
          isLoading={isLoadingTasks}
          error={error}
          onRetry={fetchTasks}
          onToggleComplete={handleToggleComplete}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      </main>
    </div>
  );
}
