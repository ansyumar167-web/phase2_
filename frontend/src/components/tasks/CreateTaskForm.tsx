/**
 * CreateTaskForm component - Form for creating new tasks.
 *
 * User Story: US2 - Task Creation
 * Features:
 *   - Title input (required, max 200 characters)
 *   - Description textarea (optional, max 1000 characters)
 *   - Client-side validation
 *   - Loading state during submission
 *   - Error handling and display
 *   - Form reset after successful creation
 * Accessibility: Semantic HTML, ARIA labels, proper error messages
 * Responsive: Mobile-first design with proper spacing
 */
'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { api } from '@/lib/api';
import { handleApiError, isRetryableError } from '@/lib/error-handler';
import type { CreateTaskRequest } from '@/lib/types';

interface CreateTaskFormProps {
  onTaskCreated?: () => void;
}

export default function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState(false);

  // Validation errors
  const [titleError, setTitleError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');

  /**
   * Validate form fields
   * Returns true if valid, false otherwise
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setTitleError('');
    setDescriptionError('');

    // Validate title
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else if (title.length > 200) {
      setTitleError('Title must be 200 characters or less');
      isValid = false;
    }

    // Validate description
    if (description.length > 1000) {
      setDescriptionError('Description must be 1000 characters or less');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous error
    setError(null);
    setShowRetry(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare request data
    const taskData: CreateTaskRequest = {
      title: title.trim(),
    };

    // Only include description if it's not empty
    if (description.trim()) {
      taskData.description = description.trim();
    }

    // Submit to API
    setIsSubmitting(true);
    try {
      await api.createTask(taskData);

      // Clear form on success
      setTitle('');
      setDescription('');
      setTitleError('');
      setDescriptionError('');
      setError(null);
      setShowRetry(false);

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (err: any) {
      console.error('Failed to create task:', err);

      // Use error handler utility to get user-friendly message
      const { message, fieldErrors, shouldRetry } = handleApiError(err);

      // Set field-specific errors if available
      if (fieldErrors) {
        if (fieldErrors.title) setTitleError(fieldErrors.title);
        if (fieldErrors.description) setDescriptionError(fieldErrors.description);
      }

      // Set general error message
      setError(message);

      // Show retry button for retryable errors
      setShowRetry(shouldRetry);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    setError(null);
    setShowRetry(false);
    // Trigger form submission
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  /**
   * Handle title change with real-time validation
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);

    // Clear error when user starts typing
    if (titleError) {
      setTitleError('');
    }
  };

  /**
   * Handle description change with real-time validation
   */
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);

    // Clear error when user starts typing
    if (descriptionError) {
      setDescriptionError('');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6 sm:p-8 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Create New Task
        </h2>
      </div>

      {/* Error message with retry option */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={showRetry ? handleRetry : undefined} />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title input */}
        <div>
          <Input
            label="Title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            error={titleError}
            placeholder="Enter task title"
            disabled={isSubmitting}
            required
            maxLength={200}
            aria-required="true"
            aria-invalid={!!titleError}
            aria-describedby={titleError ? 'title-error' : undefined}
          />
          {/* Character count for title */}
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {title.length}/200 characters
          </div>
        </div>

        {/* Description textarea */}
        <div>
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={handleDescriptionChange}
            error={descriptionError}
            placeholder="Enter task description"
            disabled={isSubmitting}
            rows={4}
            maxLength={1000}
            aria-invalid={!!descriptionError}
            aria-describedby={descriptionError ? 'description-error' : undefined}
          />
          {/* Character count for description */}
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {description.length}/1000 characters
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </Button>
        </div>
      </form>
    </div>
  );
}
