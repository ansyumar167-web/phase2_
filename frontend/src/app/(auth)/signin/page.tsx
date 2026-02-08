/**
 * Sign In page for user authentication.
 *
 * Features:
 * - Centered layout with SignInForm component
 * - Link to sign up page for new users
 * - Responsive design
 *
 * Security:
 * - All authentication logic handled by SignInForm and AuthProvider
 * - JWT tokens stored in httpOnly cookies
 * - Generic error messages to prevent user enumeration
 */

import Link from 'next/link';
import { SignInForm } from '@/components/auth/SignInForm';

export const metadata = {
  title: 'Sign In - Todo App',
  description: 'Sign in to your Todo App account',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-center text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-3 text-center text-base text-gray-600">
            Sign in to continue to your tasks
          </p>
        </div>

        {/* Sign In Form */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-purple-100">
          <SignInForm />

          {/* Link to Sign Up */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gradient-to-r from-purple-200 to-indigo-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-600 font-medium">
                  New to Todo App?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/signup"
                className="font-semibold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
              >
                Create an account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
