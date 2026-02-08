/**
 * Dashboard page - protected route for task management.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { api } from '@/lib/api';
import TaskForm from '@/components/TaskForm';
import TaskItem from '@/components/TaskItem';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data: CreateTaskRequest) => {
    setIsCreating(true);
    try {
      const newTask = await api.createTask(data);
      // Add new task to the beginning of the list (optimistic update)
      setTasks([newTask, ...tasks]);
    } catch (err: any) {
      throw err; // Let TaskForm handle the error
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    // Find the task to determine new completion status
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompletionStatus = !task.isCompleted;

    // Optimistic update: toggle the task immediately in UI
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId
          ? { ...t, isCompleted: newCompletionStatus }
          : t
      )
    );

    try {
      // Call API to persist the change
      const updatedTask = await api.toggleTaskCompletion(taskId, newCompletionStatus);

      // Update with server response to ensure consistency
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? updatedTask : t
        )
      );
    } catch (err: any) {
      // Revert optimistic update on error
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId
            ? { ...t, isCompleted: task.isCompleted }
            : t
        )
      );
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const handleUpdateTask = async (taskId: number, data: UpdateTaskRequest) => {
    try {
      // Call API to update the task
      const updatedTask = await api.updateTask(taskId, data);

      // Update task in state with server response
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (err: any) {
      throw err; // Let TaskItem handle the error
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      // Call API to delete the task
      await api.deleteTask(taskId);

      // Remove task from UI immediately after successful deletion
      setTasks(prevTasks =>
        prevTasks.filter(task => task.id !== taskId)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err; // Let TaskItem handle the error
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Task Creation Form */}
        <TaskForm onSubmit={handleCreateTask} isLoading={isCreating} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={loadTasks}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        )}

        {/* Task List */}
        {!isLoading && (
          <div className="bg-white shadow-md rounded-lg">
            {tasks.length === 0 ? (
              <div className="p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first task above.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Task Count */}
        {!isLoading && tasks.length > 0 && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
          </p>
        )}
      </main>
    </div>
  );
}
