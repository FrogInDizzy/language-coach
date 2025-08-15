'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import ProgressWidget, { RealDataProgressWidget } from './ProgressWidget';
import { ProgressData } from '@/hooks/useProgress';
import { NavLink } from './ui/NavLink';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  progressData?: ProgressData | null;
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
        className={`sidebar-panel ${isOpen ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <Link
              href="/dashboard"
              className="font-bold text-lg text-gray-900"
              onClick={onClose}
            >
              Language Coach
            </Link>
          </div>

          {/* Progress Widget */}
          <div className="p-6 border-b border-gray-100">
            {progressData ? (
              <ProgressWidget 
                data={progressData}
                variant="sidebar"
                showDailyGoal={true}
              />
            ) : (
              <RealDataProgressWidget 
                variant="sidebar"
                showDailyGoal={true}
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1" role="list">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      onClick={onClose}
                      isActive={isActive}
                      icon={item.icon}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="text-xs text-gray-400 text-center">
              © 2025 Language Coach
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}