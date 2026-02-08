'use client';

/**
 * LandingContent component - Client-side landing page content with authentication check.
 *
 * Features:
 * - Checks authentication status on mount
 * - Redirects authenticated users to /tasks
 * - Shows loading state during authentication check
 * - Displays hero section with CTA buttons for unauthenticated users
 * - Responsive design with mobile-first approach
 * - Accessible with semantic HTML and ARIA attributes
 *
 * Accessibility:
 * - Semantic HTML5 elements (main, section, nav)
 * - Proper heading hierarchy
 * - Focus indicators on interactive elements
 * - Loading state announced to screen readers
 * - Minimum 44x44px touch targets for buttons
 * - WCAG 2.1 AA compliant color contrast
 */

import  { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function LandingContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to tasks page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/tasks');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  // Don't render content if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-center">
          {/* App Icon */}
          <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-300">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>

          {/* App Name and Tagline */}
          <h1 className="text-5xl font-extrabold sm:text-6xl md:text-7xl">
            <span className="block bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Todo App
            </span>
            <span className="block mt-4 text-3xl sm:text-4xl md:text-5xl text-gray-700">
              Organize your tasks,
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              boost your productivity
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 text-lg text-gray-600 sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            A simple and elegant task management application. Sign up to get started!
          </p>

          {/* Call-to-Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 duration-200 min-h-[44px] min-w-[44px]"
              aria-label="Get started by signing up for a new account"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started
            </Link>
            <Link
              href="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-purple-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all border-2 border-purple-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200 min-h-[44px] min-w-[44px]"
              aria-label="Sign in to your existing account"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </Link>
          </div>

          {/* Features Section */}
          <section className="mt-20 sm:mt-24" aria-labelledby="features-heading">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12 border border-purple-100">
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-8 sm:mb-10">
                Why Choose Todo App?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 text-left">
                {/* Feature 1 */}
                <article className="flex flex-col group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow" aria-hidden="true">
                      <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-xl font-bold text-gray-900">Secure Authentication</h3>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Your data is protected with industry-standard JWT authentication and encrypted password storage.
                  </p>
                </article>

                {/* Feature 2 */}
                <article className="flex flex-col group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow" aria-hidden="true">
                      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-xl font-bold text-gray-900">Personal Workspace</h3>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Your tasks are completely private and isolated. Only you can access your personal task list.
                  </p>
                </article>

                {/* Feature 3 */}
                <article className="flex flex-col group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow" aria-hidden="true">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-xl font-bold text-gray-900">Modern & Fast</h3>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Built with cutting-edge technology: Next.js 16, FastAPI, and PostgreSQL for optimal performance.
                  </p>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
