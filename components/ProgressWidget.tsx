'use client';

import { useEffect, useState } from 'react';

// Types for progress data
export interface ProgressData {
  currentXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpForCurrentLevel: number;
  streak: number;
  dailyGoal: {
    target: number;
    completed: number;
    unit: string; // 'sessions', 'minutes', 'exercises'
  };
  lastActivity?: string; // ISO date string
}

interface ProgressWidgetProps {
  data: ProgressData;
  variant?: 'sidebar' | 'dashboard';
  showDailyGoal?: boolean;
  className?: string;
}

// XP calculation utilities
const calculateXPForLevel = (level: number): number => {
  // Progressive XP requirement: level * 100 + (level - 1) * 50
  return level * 100 + Math.max(0, level - 1) * 50;
};

const getXPProgress = (currentXP: number, currentLevel: number) => {
  const currentLevelXP = calculateXPForLevel(currentLevel);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);
  
  return {
    currentLevelXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercentage,
    xpUntilNext: Math.max(0, nextLevelXP - currentXP)
  };
};

// Streak status calculation
const getStreakStatus = (streak: number, lastActivity?: string) => {
  const today = new Date();
  const lastDate = lastActivity ? new Date(lastActivity) : today;
  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: 'active' | 'at-risk' | 'broken' = 'active';
  let message = '';
  
  if (daysDiff === 0) {
    status = 'active';
    message = 'Keep it up!';
  } else if (daysDiff === 1) {
    status = 'at-risk';
    message = 'Practice today to maintain streak';
  } else if (daysDiff > 1) {
    status = 'broken';
    message = 'Start a new streak today';
  }
  
  return { status, message, daysSinceActivity: daysDiff };
};

export default function ProgressWidget({ 
  data, 
  variant = 'dashboard', 
  showDailyGoal = true,
  className = '' 
}: ProgressWidgetProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedXP, setAnimatedXP] = useState(0);
  
  const xpProgress = getXPProgress(data.currentXP, data.currentLevel);
  const streakStatus = getStreakStatus(data.streak, data.lastActivity);
  const dailyProgress = (data.dailyGoal.completed / data.dailyGoal.target) * 100;
  
  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(xpProgress.progressPercentage);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [xpProgress.progressPercentage]);
  
  // Animate XP counter
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = xpProgress.xpInCurrentLevel / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= xpProgress.xpInCurrentLevel) {
        setAnimatedXP(xpProgress.xpInCurrentLevel);
        clearInterval(timer);
      } else {
        setAnimatedXP(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [xpProgress.xpInCurrentLevel]);
  
  const isSidebar = variant === 'sidebar';
  const containerClass = isSidebar 
    ? 'space-y-3' 
    : 'bg-white rounded-2xl p-6 shadow-soft border border-neutral-100';
  
  return (
    <div className={`${containerClass} ${className}`}>
      {/* Header */}
      {!isSidebar && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 font-display">
            Your Progress
          </h3>
          <div className="text-2xl">📊</div>
        </div>
      )}
      
      {/* XP Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-400 rounded-full"></div>
            <span className={`font-medium ${isSidebar ? 'text-sm' : 'text-base'} text-neutral-700`}>
              Level {data.currentLevel}
            </span>
          </div>
          <div className={`${isSidebar ? 'text-xs' : 'text-sm'} text-neutral-500`}>
            {animatedXP.toLocaleString()} / {xpProgress.xpNeededForNext.toLocaleString()} XP
          </div>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="relative">
          <div className={`bg-neutral-200 rounded-full ${isSidebar ? 'h-2' : 'h-3'}`}>
            <div 
              className="bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${animatedProgress}%`,
                height: '100%'
              }}
            >
              {/* Progress bar glow effect */}
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse-soft"></div>
            </div>
          </div>
          
          {/* XP until next level */}
          {!isSidebar && xpProgress.xpUntilNext > 0 && (
            <div className="mt-1 text-xs text-neutral-500 text-center">
              {xpProgress.xpUntilNext.toLocaleString()} XP until Level {data.currentLevel + 1}
            </div>
          )}
        </div>
      </div>
      
      {/* Streak Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${
            streakStatus.status === 'active' ? 'text-orange-500' :
            streakStatus.status === 'at-risk' ? 'text-amber-500' :
            'text-neutral-400'
          } ${isSidebar ? 'text-lg' : 'text-xl'}`}>
            {streakStatus.status === 'broken' ? '💨' : '🔥'}
          </div>
          <div>
            <div className={`font-medium ${isSidebar ? 'text-sm' : 'text-base'} text-neutral-700`}>
              {data.streak} day streak
            </div>
            {!isSidebar && (
              <div className={`text-xs ${
                streakStatus.status === 'active' ? 'text-green-600' :
                streakStatus.status === 'at-risk' ? 'text-amber-600' :
                'text-neutral-500'
              }`}>
                {streakStatus.message}
              </div>
            )}
          </div>
        </div>
        
        {/* Total XP display for sidebar */}
        {isSidebar && (
          <div className="text-right">
            <div className="text-sm font-medium text-neutral-700">
              {data.currentXP.toLocaleString()} XP
            </div>
          </div>
        )}
      </div>
      
      {/* Daily Goal Progress */}
      {showDailyGoal && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-green-500 text-sm">🎯</div>
              <span className={`font-medium ${isSidebar ? 'text-sm' : 'text-base'} text-neutral-700`}>
                Daily Goal
              </span>
            </div>
            <div className={`${isSidebar ? 'text-xs' : 'text-sm'} text-neutral-500`}>
              {data.dailyGoal.completed} / {data.dailyGoal.target} {data.dailyGoal.unit}
            </div>
          </div>
          
          {/* Daily Progress Bar */}
          <div className={`bg-neutral-200 rounded-full ${isSidebar ? 'h-1.5' : 'h-2'}`}>
            <div 
              className={`bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700 ease-out ${
                dailyProgress >= 100 ? 'animate-pulse-soft' : ''
              }`}
              style={{ 
                width: `${Math.min(dailyProgress, 100)}%`,
                height: '100%'
              }}
            />
          </div>
          
          {/* Completion status */}
          {!isSidebar && (
            <div className="text-xs text-center">
              {dailyProgress >= 100 ? (
                <span className="text-green-600 font-medium">🎉 Daily goal completed!</span>
              ) : (
                <span className="text-neutral-500">
                  {data.dailyGoal.target - data.dailyGoal.completed} {data.dailyGoal.unit} remaining
                </span>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Achievement badge for completed daily goal */}
      {showDailyGoal && dailyProgress >= 100 && isSidebar && (
        <div className="flex items-center justify-center">
          <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
            🎉 Goal Complete
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for dashboard stats overview
export function ProgressSummary({ data }: { data: ProgressData }) {
  const xpProgress = getXPProgress(data.currentXP, data.currentLevel);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary-600">{data.currentLevel}</div>
        <div className="text-sm text-neutral-600">Current Level</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-500">{data.streak}</div>
        <div className="text-sm text-neutral-600">Day Streak</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-500">
          {Math.round((data.dailyGoal.completed / data.dailyGoal.target) * 100)}%
        </div>
        <div className="text-sm text-neutral-600">Daily Goal</div>
      </div>
    </div>
  );
}