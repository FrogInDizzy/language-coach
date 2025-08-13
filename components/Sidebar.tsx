'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import ProgressWidget, { ProgressData } from './ProgressWidget';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  progressData: ProgressData;
}

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/practice', label: 'Practice', icon: '🎤' },
  { href: '/history', label: 'History', icon: '🕘' },
  { href: '/account', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ isOpen, onClose, progressData }: SidebarProps) {
  const pathname = usePathname();

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-panel ${isOpen ? 'open' : 'closed'}`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200">
            <Link
              href="/dashboard"
              className="font-bold text-xl text-neutral-900 font-display"
              onClick={onClose}
            >
              Language Coach
            </Link>
          </div>

          {/* Progress Widget */}
          <div className="p-6 border-b border-neutral-200">
            <ProgressWidget 
              data={progressData}
              variant="sidebar"
              showDailyGoal={true}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2" role="list">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                        transition-all duration-200 ease-out
                        hover:bg-neutral-50 active:scale-[0.98]
                        ${
                          isActive
                            ? 'bg-accent-100 text-accent-700 border border-accent-200'
                            : 'text-neutral-700 hover:text-neutral-900'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="text-lg" aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <div className="text-xs text-neutral-500 text-center">
              © 2024 Language Coach
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}