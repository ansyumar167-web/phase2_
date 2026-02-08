/**
 * Sign Up page for new user registration.
 *
 * Features:
 * - Centered layout with SignUpForm component
 * - Link to sign in page for existing users
 * - Responsive design
 *
 * Security:
 * - All authentication logic handled by SignUpForm and AuthProvider
 * - JWT tokens stored in httpOnly cookies
 */

import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'Sign Up - Todo App',
  description: 'Create a new account to get started with Todo App',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-center text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Join Todo App
          </h1>
          <p className="mt-3 text-center text-base text-gray-600">
            Create your account and start organizing
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-purple-100">
          <SignUpForm />

          {/* Link to Sign In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gradient-to-r from-purple-200 to-indigo-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-600 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/signin"
                className="font-semibold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
              >
                Sign in instead →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
