'use client';

import { useState, useEffect } from 'react';
import { useDailyQuests } from '@/hooks/useDailyQuests';
import DailyQuestCard from './DailyQuestCard';
import StreakShieldModal from './StreakShieldModal';

interface DailyQuestPanelProps {
  variant?: 'dashboard' | 'sidebar' | 'page';
  className?: string;
  onQuestComplete?: (questId: string, xpEarned: number) => void;
  onAllQuestsComplete?: (totalXp: number, streakShield: boolean) => void;
}

export default function DailyQuestPanel({
  variant = 'dashboard',
  className = '',
  onQuestComplete,
  onAllQuestsComplete
}: DailyQuestPanelProps) {
  const { questSet, loading, error, updateQuestProgress } = useDailyQuests();
  const [showStreakShield, setShowStreakShield] = useState(false);
  const [justCompletedAll, setJustCompletedAll] = useState(false);

  const isCompact = variant === 'sidebar';
  const isFullPage = variant === 'page';

  // Track when all quests are completed for celebration
  useEffect(() => {
    if (questSet?.allCompleted && !justCompletedAll) {
      setJustCompletedAll(true);
      
      // Check if streak shield should be awarded
      if (questSet.streakShieldEarned) {
        setTimeout(() => setShowStreakShield(true), 1000);
      }
      
      onAllQuestsComplete?.(questSet.totalXpEarned, questSet.streakShieldEarned);
    }
  }, [questSet?.allCompleted, justCompletedAll, questSet?.totalXpEarned, questSet?.streakShieldEarned, onAllQuestsComplete]);

  const handleQuestProgress = async (questId: string, increment: number, reason?: string) => {
    const success = await updateQuestProgress(questId, increment, reason);
    if (success && questSet) {
      const quest = questSet.quests.find(q => q.id === questId);
      if (quest && quest.progress + increment >= quest.target) {
        onQuestComplete?.(questId, quest.xpReward);
      }
    }
  };

  if (loading) {
    return (
      <div className={`${isCompact ? 'space-y-2' : 'space-y-4'} ${className}`}>
        {/* Loading skeleton */}
        {[1, 2, 3].map(i => (
          <div key={i} className={`animate-pulse ${isCompact ? 'p-3' : 'p-6'} bg-neutral-100 rounded-xl`}>
            <div className="flex items-center gap-3">
              <div className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} bg-neutral-200 rounded`}></div>
              <div className="flex-1">
                <div className={`${isCompact ? 'h-3' : 'h-4'} bg-neutral-200 rounded mb-2`}></div>
                <div className={`${isCompact ? 'h-2' : 'h-3'} bg-neutral-200 rounded w-2/3`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card bg-red-50 border-red-200 text-center ${className}`}>
        <div className="text-2xl mb-2">⚠️</div>
        <h3 className="font-medium text-red-900 mb-1">Quest Loading Failed</h3>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!questSet) {
    return (
      <div className={`card bg-neutral-50 border-neutral-200 text-center ${className}`}>
        <div className="text-2xl mb-2">🎯</div>
        <h3 className="font-medium text-neutral-900 mb-1">No Quests Available</h3>
        <p className="text-sm text-neutral-600">Check back tomorrow for new challenges!</p>
      </div>
    );
  }

  const completedCount = questSet.quests.filter(q => q.completed).length;
  const totalQuests = questSet.quests.length;
  const overallProgress = (completedCount / totalQuests) * 100;

  return (
    <>
      <div className={className}>
        {/* Header - only show for non-compact variants */}
        {!isCompact && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎯</div>
                <div>
                  <h2 className={`font-bold ${isFullPage ? 'text-2xl' : 'text-xl'} text-neutral-900 font-display`}>
                    Daily Quests
                  </h2>
                  <p className="text-neutral-600 text-sm">
                    Complete all three quests to earn your streak shield!
                  </p>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="text-right">
                <div className="text-sm text-neutral-600 mb-1">
                  {completedCount}/{totalQuests} Complete
                </div>
                <div className="w-24 bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* XP Summary */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span className="font-medium text-amber-900">
                    {questSet.totalXpEarned}/{questSet.totalXpAvailable} XP Available
                  </span>
                </div>
                
                {questSet.allCompleted && (
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="animate-bounce">🎉</span>
                    <span className="font-medium text-sm">All Complete!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quest Cards */}
        <div className={`${isCompact ? 'space-y-2' : 'space-y-4'} ${isFullPage ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : ''}`}>
          {questSet.quests.map((quest, index) => (
            <DailyQuestCard
              key={quest.id}
              quest={quest}
              onProgressUpdate={(increment, reason) => handleQuestProgress(quest.id, increment, reason)}
              compact={isCompact}
              showActions={!isCompact}
            />
          ))}
        </div>

        {/* Completion Celebration for compact view */}
        {isCompact && questSet.allCompleted && (
          <div className="mt-4 bg-primary-50 border border-primary-200 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-primary-700">
              <span className="animate-bounce">🏆</span>
              <span className="font-medium text-sm">Daily Quests Complete!</span>
            </div>
            <div className="text-xs text-primary-600 mt-1">
              +{questSet.totalXpEarned} XP earned today
            </div>
          </div>
        )}

        {/* Achievement Milestones */}
        {!isCompact && completedCount > 0 && (
          <div className="mt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className={`text-center p-3 rounded-lg border-2 transition-all duration-300 ${
                completedCount >= 1 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-500'
              }`}>
                <div className="text-2xl mb-1">{completedCount >= 1 ? '🌟' : '⭐'}</div>
                <div className="text-xs font-medium">First Quest</div>
              </div>
              <div className={`text-center p-3 rounded-lg border-2 transition-all duration-300 ${
                completedCount >= 2 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-500'
              }`}>
                <div className="text-2xl mb-1">{completedCount >= 2 ? '🔥' : '🔴'}</div>
                <div className="text-xs font-medium">Momentum</div>
              </div>
              <div className={`text-center p-3 rounded-lg border-2 transition-all duration-300 ${
                completedCount >= 3 
                  ? 'bg-purple-50 border-purple-200 text-purple-700' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-500'
              }`}>
                <div className="text-2xl mb-1">{completedCount >= 3 ? '🛡️' : '⚪'}</div>
                <div className="text-xs font-medium">Shield Earned</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Streak Shield Modal */}
      {showStreakShield && (
        <StreakShieldModal
          isOpen={showStreakShield}
          onClose={() => setShowStreakShield(false)}
          streakLength={7} // This should come from user data
          xpBonus={50}
        />
      )}
    </>
  );
}