'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import AuthForm from './AuthForm';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <div className="text-lg text-neutral-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <nav className="glass border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/" className="font-bold text-xl text-neutral-900 font-display">
              Language Coach
            </Link>
          </div>
        </nav>
        <main className="max-w-md mx-auto py-20 px-6">
          <div className="card-solid">
            <AuthForm />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <nav className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="font-bold text-xl text-neutral-900 font-display">
              Language Coach
            </Link>
            
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="font-medium text-neutral-700">12 day streak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <span className="font-medium text-neutral-700">1,240 XP</span>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="hidden md:flex items-center gap-2">
                <Link href="/practice" className="btn-ghost px-4 py-2 text-sm">Practice</Link>
                <Link href="/dashboard" className="btn-ghost px-4 py-2 text-sm">Dashboard</Link>
                <Link href="/history" className="btn-ghost px-4 py-2 text-sm">History</Link>
              </div>
              
              {/* Profile */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-neutral-500 hover:text-neutral-700 text-sm transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile navigation */}
          <div className="md:hidden mt-4 flex gap-2 border-t border-white/20 pt-4">
            <Link href="/practice" className="btn-ghost px-3 py-2 text-sm flex-1">Practice</Link>
            <Link href="/dashboard" className="btn-ghost px-3 py-2 text-sm flex-1">Dashboard</Link>
            <Link href="/history" className="btn-ghost px-3 py-2 text-sm flex-1">History</Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}