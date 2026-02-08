/**
 * Next.js proxy for route protection.
 * Redirects unauthenticated users to sign-in page.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check for auth token in cookies
  const token = request.cookies.get('auth-token');

  // Protect /tasks routes (protected routes)
  if (request.nextUrl.pathname.startsWith('/tasks')) {
    if (!token) {
      // Redirect to sign-in if not authenticated
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/signin') || request.nextUrl.pathname.startsWith('/signup')) {
    if (token) {
      // Redirect to tasks if already authenticated
      return NextResponse.redirect(new URL('/tasks', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tasks/:path*', '/signin', '/signup'],
};
