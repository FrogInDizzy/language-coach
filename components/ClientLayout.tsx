'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import AuthForm from './AuthForm';
import Sidebar from './Sidebar';
import { ProgressData } from './ProgressWidget';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock progress data - in real app, this would come from API or context
  const progressData: ProgressData = {
    currentXP: 1240,
    currentLevel: 8,
    xpForNextLevel: 950, // Will be calculated automatically
    xpForCurrentLevel: 800, // Will be calculated automatically
    streak: 12,
    dailyGoal: {
      target: 3,
      completed: 2,
      unit: 'sessions'
    },
    lastActivity: new Date().toISOString() // Today
  };

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
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        progressData={progressData}
      />

      {/* Main Layout */}
      <div className="md:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Open sidebar"
              >
                <svg
                  className="w-5 h-5 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Desktop brand (hidden on mobile since it's in sidebar) */}
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-neutral-900">
                  Welcome back!
                </h1>
              </div>

              {/* Profile section */}
              <div className="flex items-center gap-3">
                {/* Mobile stats */}
                <div className="flex md:hidden items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="font-medium text-neutral-700">{progressData.streak}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span className="font-medium text-neutral-700">{progressData.currentXP}</span>
                  </div>
                </div>

                {/* Profile avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                </div>

                {/* Sign out button */}
                <button
                  onClick={() => signOut()}
                  className="text-neutral-500 hover:text-neutral-700 text-sm transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}