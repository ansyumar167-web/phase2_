/**
 * Home page - Landing page for the Todo application.
 *
 * Features:
 * - Server Component for optimal performance and SEO
 * - Delegates client-side authentication check to LandingContent
 * - Proper metadata for search engines
 * - Redirects authenticated users to /tasks
 *
 * Architecture:
 * - This is a Server Component (default in Next.js 16 App Router)
 * - LandingContent is a Client Component that handles authentication state
 * - Separation allows for better performance and progressive enhancement
 */

import { Metadata } from 'next';
import { LandingContent } from '@/components/LandingContent';

export const metadata: Metadata = {
  title: 'Todo App - Organize Your Tasks, Boost Your Productivity',
  description: 'A simple and elegant task management application. Sign up to get started and organize your tasks efficiently with our secure, multi-user todo app.',
  keywords: ['todo app', 'task management', 'productivity', 'task organizer', 'todo list'],
  authors: [{ name: 'Todo App Team' }],
  openGraph: {
    title: 'Todo App - Organize Your Tasks',
    description: 'A simple and elegant task management application. Sign up to get started!',
    type: 'website',
  },
};

export default function HomePage() {
  return <LandingContent />;
}
