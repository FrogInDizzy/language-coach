'use client';

import { useState } from 'react';
import { DailyQuest } from '@/lib/dailyQuests';

interface DailyQuestCardProps {
  quest: DailyQuest;
  onProgressUpdate?: (increment: number, reason?: string) => Promise<void>;
  showActions?: boolean;
  compact?: boolean;
}

export default function DailyQuestCard({
  quest,
  onProgressUpdate,
  showActions = true,
  compact = false
}: DailyQuestCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const progressPercentage = Math.min((quest.progress / quest.target) * 100, 100);
  const isCompleted = quest.completed;
  const canProgress = !isCompleted && quest.progress < quest.target;

  const handleProgressClick = async (increment: number = 1) => {
    if (!onProgressUpdate || isUpdating || !canProgress) return;
    
    setIsUpdating(true);
    try {
      await onProgressUpdate(increment, `Manual progress: +${increment}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'warmup': return 'from-orange-50 to-yellow-50 border-orange-200';
      case 'mistake_review': return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'vocabulary': return 'from-green-50 to-emerald-50 border-green-200';
      default: return 'from-neutral-50 to-gray-50 border-neutral-200';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
        isCompleted 
          ? 'bg-primary-50 border-primary-200' 
          : `bg-gradient-to-r ${getTypeGradient(quest.type)}`
      }`}>
        <div className="text-2xl">{quest.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium truncate ${isCompleted ? 'text-primary-700' : 'text-neutral-900'}`}>
              {quest.title}
            </h4>
            {isCompleted && <span className="text-primary-600">✓</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-neutral-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-primary-500' : 'bg-accent-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs text-neutral-600">
              {quest.progress}/{quest.target}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card transition-all duration-200 hover:shadow-lg ${
      isCompleted 
        ? 'bg-primary-50 border-primary-200 shadow-primary-100' 
        : `bg-gradient-to-br ${getTypeGradient(quest.type)} hover:scale-[1.02]`
    }`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-3xl ${isCompleted ? 'animate-bounce' : ''}`}>
            {quest.icon}
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${
              isCompleted ? 'text-primary-700' : 'text-neutral-900'
            }`}>
              {quest.title}
              {isCompleted && (
                <span className="ml-2 text-primary-600 animate-pulse">✓</span>
              )}
            </h3>
            <p className="text-neutral-600 text-sm mt-1">
              {quest.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty Badge */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
            {quest.difficulty}
          </span>
          
          {/* Time Estimate */}
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <span>⏱️</span>
            {quest.estimatedMinutes}m
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">
            Progress
          </span>
          <span className="text-sm text-neutral-600">
            {quest.progress}/{quest.target}
          </span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="relative">
          <div className="bg-neutral-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                isCompleted ? 'bg-primary-500' : 'bg-accent-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Progress bar shimmer effect */}
              {!isCompleted && progressPercentage > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-soft"></div>
              )}
            </div>
          </div>
          
          {/* Completion celebration */}
          {isCompleted && (
            <div className="absolute -top-1 -right-1 animate-bounce">
              <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                ✓
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reward Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-500">⚡</span>
          <span className="text-sm font-medium text-neutral-700">
            {quest.xpReward} XP Reward
          </span>
        </div>
        
        {quest.category && (
          <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
            {quest.category.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && !isCompleted && (
        <div className="flex gap-2">
          {canProgress && (
            <>
              <button
                onClick={() => handleProgressClick(1)}
                disabled={isUpdating}
                className="flex-1 btn-accent text-sm disabled:opacity-50"
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </span>
                ) : (
                  `+1 Progress`
                )}
              </button>
              
              {quest.target - quest.progress > 1 && (
                <button
                  onClick={() => handleProgressClick(Math.min(quest.target - quest.progress, 3))}
                  disabled={isUpdating}
                  className="px-4 btn-secondary text-sm disabled:opacity-50"
                >
                  Skip
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Completed State */}
      {isCompleted && (
        <div className="bg-primary-100 border border-primary-200 rounded-xl p-3">
          <div className="flex items-center gap-2 text-primary-700">
            <span className="text-lg">🎉</span>
            <span className="font-medium text-sm">
              Quest Completed! +{quest.xpReward} XP earned
            </span>
          </div>
        </div>
      )}
    </div>
  );
}