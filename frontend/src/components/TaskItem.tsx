/**
 * Task item component for displaying individual tasks with completion toggle and edit functionality.
 */
'use client';

import { useState } from 'react';
import type { Task, UpdateTaskRequest } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: number) => Promise<void>;
  onUpdate: (taskId: number, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export default function TaskItem({ task, onToggleComplete, onUpdate, onDelete }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleComplete(task.id);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setError(null);
  };

  const handleSave = async () => {
    // Validation
    if (!editTitle.trim()) {
      setError('Task title is required');
      return;
    }

    if (editTitle.length > 200) {
      setError('Task title must be 200 characters or less');
      return;
    }

    if (editDescription.length > 2000) {
      setError('Description must be 2000 characters or less');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      // Task will be removed from UI by parent component
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit mode view
  if (isEditing) {
    return (
      <li className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-l-4 border-purple-500 rounded-xl shadow-lg">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-purple-700 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Task
          </h4>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-sm text-red-800 flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label htmlFor={`edit-title-${task.id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`edit-title-${task.id}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 transition-all"
              maxLength={200}
            />
            <p className="mt-2 text-xs text-gray-500">{editTitle.length}/200 characters</p>
          </div>

          <div>
            <label htmlFor={`edit-description-${task.id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id={`edit-description-${task.id}`}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={isSaving}
              rows={3}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 transition-all"
              maxLength={2000}
            />
            <p className="mt-2 text-xs text-gray-500">{editDescription.length}/2000 characters</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !editTitle.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  // Normal view
  return (
    <li className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-300 overflow-hidden">
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-2 border-purple-100 transform scale-100 animate-in">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Delete Task?</h3>
            <p className="text-sm text-gray-600 mb-6 text-center leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{task.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-xl hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-5 flex items-start gap-4">
        {/* Checkbox for completion toggle */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={task.isCompleted ?? false}
            onChange={handleToggle}
            disabled={isToggling}
            className="w-6 h-6 text-purple-600 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            aria-label={`Mark "${task.title}" as ${task.isCompleted ? 'incomplete' : 'complete'}`}
          />
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold transition-all duration-200 ${
              task.isCompleted
                ? 'text-gray-400 line-through'
                : 'text-gray-900 group-hover:text-purple-700'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`mt-2 text-sm leading-relaxed transition-all duration-200 ${
                task.isCompleted
                  ? 'text-gray-400 line-through'
                  : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
            {task.isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEdit}
            className="p-2.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label={`Edit "${task.title}"`}
            title="Edit task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Delete "${task.title}"`}
            title="Delete task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}
