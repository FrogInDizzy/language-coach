/**
 * Quest Integration - Connect daily quests with practice sessions
 */

import { getQuestUpdatesFromSession, DailyQuest } from './dailyQuests';

export interface SessionQuestUpdate {
  questId: string;
  increment: number;
  reason: string;
  completed: boolean;
  xpEarned: number;
}

/**
 * Process session data and update relevant quests
 */
export async function updateQuestsFromSession(
  sessionData: {
    durationSeconds: number;
    mistakeCount: number;
    mistakeCategories: string[];
    transcript: string;
  }
): Promise<SessionQuestUpdate[]> {
  try {
    // Fetch current quests
    const response = await fetch('/api/daily-quests');
    if (!response.ok) {
      throw new Error('Failed to fetch quests');
    }
    
    const questSet = await response.json();
    if (!questSet?.quests) {
      return [];
    }

    // Estimate words spoken (rough approximation)
    const wordsSpoken = sessionData.transcript.split(/\s+/).length;
    
    // Get quest updates from session
    const questUpdates = getQuestUpdatesFromSession(
      { ...sessionData, wordsSpoken },
      questSet.quests
    );

    const results: SessionQuestUpdate[] = [];

    // Apply updates
    for (const update of questUpdates) {
      const quest = questSet.quests.find((q: DailyQuest) => q.id === update.questId);
      if (!quest) continue;

      // Update quest progress via API
      const updateResponse = await fetch('/api/daily-quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: update.questId,
          increment: update.increment,
          reason: update.reason
        })
      });

      if (updateResponse.ok) {
        const updatedQuest = await updateResponse.json();
        results.push({
          questId: update.questId,
          increment: update.increment,
          reason: update.reason,
          completed: updatedQuest.completed,
          xpEarned: updatedQuest.completed ? quest.xpReward : 0
        });
      }
    }

    return results;
    
  } catch (error) {
    console.error('Error updating quests from session:', error);
    return [];
  }
}

/**
 * Get timezone-aware date for quest generation
 */
export function getCurrentQuestDate(timezone?: string): string {
  const now = new Date();
  
  if (timezone) {
    try {
      // Use user's timezone
      const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      return userDate.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Invalid timezone:', timezone);
    }
  }
  
  // Fallback to local timezone
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if it's a new day and reset quests if needed
 */
export async function checkDailyReset(lastActiveDate?: string, timezone?: string): Promise<boolean> {
  const currentDate = getCurrentQuestDate(timezone);
  
  if (!lastActiveDate || lastActiveDate !== currentDate) {
    // It's a new day - quests will be automatically generated
    return true;
  }
  
  return false;
}

/**
 * Quest completion notifications
 */
export interface QuestCompletionResult {
  questsCompleted: SessionQuestUpdate[];
  allQuestsComplete: boolean;
  streakShieldEarned: boolean;
  totalBonusXp: number;
  notifications: Array<{
    type: 'quest_complete' | 'all_complete' | 'streak_shield';
    message: string;
    xp: number;
  }>;
}

/**
 * Generate quest completion notifications
 */
export function generateQuestNotifications(
  updates: SessionQuestUpdate[],
  allComplete: boolean = false,
  streakShield: boolean = false
): QuestCompletionResult {
  const notifications: Array<{
    type: 'quest_complete' | 'all_complete' | 'streak_shield';
    message: string;
    xp: number;
  }> = [];

  const completedQuests = updates.filter(u => u.completed);
  let totalBonusXp = 0;

  // Individual quest completions
  completedQuests.forEach(quest => {
    notifications.push({
      type: 'quest_complete',
      message: `Quest completed: ${quest.reason}!`,
      xp: quest.xpEarned
    });
    totalBonusXp += quest.xpEarned;
  });

  // All quests complete
  if (allComplete) {
    const completionBonus = 25;
    notifications.push({
      type: 'all_complete',
      message: 'All daily quests completed! Great consistency!',
      xp: completionBonus
    });
    totalBonusXp += completionBonus;
  }

  // Streak shield earned
  if (streakShield) {
    const shieldBonus = 50;
    notifications.push({
      type: 'streak_shield',
      message: 'Streak Shield earned! Your dedication is paying off!',
      xp: shieldBonus
    });
    totalBonusXp += shieldBonus;
  }

  return {
    questsCompleted: completedQuests,
    allQuestsComplete: allComplete,
    streakShieldEarned: streakShield,
    totalBonusXp,
    notifications
  };
}

/**
 * Quest type mapping for UI display
 */
export const QUEST_TYPE_INFO = {
  warmup: {
    name: 'Warm-up',
    description: 'Quick practice to start your day',
    color: 'orange',
    bgGradient: 'from-orange-50 to-yellow-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700'
  },
  mistake_review: {
    name: 'Focus Practice',
    description: 'Target your common mistakes',
    color: 'blue',
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  vocabulary: {
    name: 'Word Power',
    description: 'Expand your vocabulary',
    color: 'green',
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700'
  }
} as const;

/**
 * Calculate quest difficulty bonuses
 */
export function calculateQuestBonus(difficulty: 'easy' | 'medium' | 'hard'): {
  xpMultiplier: number;
  streakBonus: number;
} {
  const bonuses = {
    easy: { xpMultiplier: 1.0, streakBonus: 1 },
    medium: { xpMultiplier: 1.2, streakBonus: 2 },
    hard: { xpMultiplier: 1.5, streakBonus: 3 }
  };

  return bonuses[difficulty];
}

/**
 * Quest analytics for user insights
 */
export interface QuestAnalytics {
  completionRate: number;
  favoriteType: string;
  averageTimeToComplete: number;
  streakDays: number;
  totalXpFromQuests: number;
}

/**
 * Analyze user quest performance
 */
export async function analyzeQuestPerformance(days: number = 7): Promise<QuestAnalytics | null> {
  try {
    // This would typically fetch from an analytics endpoint
    // For now, return mock data structure
    return {
      completionRate: 0.85, // 85% completion rate
      favoriteType: 'vocabulary',
      averageTimeToComplete: 12, // minutes
      streakDays: 5,
      totalXpFromQuests: 420
    };
  } catch (error) {
    console.error('Error analyzing quest performance:', error);
    return null;
  }
}

/**
 * Smart quest suggestions based on user behavior
 */
export function generateSmartQuestSuggestions(analytics: QuestAnalytics): string[] {
  const suggestions: string[] = [];

  if (analytics.completionRate < 0.5) {
    suggestions.push("Try starting with easier quests to build momentum");
  }

  if (analytics.favoriteType === 'warmup') {
    suggestions.push("You love warm-ups! Try extending your practice sessions");
  }

  if (analytics.streakDays < 3) {
    suggestions.push("Focus on building a consistent daily practice habit");
  }

  if (analytics.averageTimeToComplete > 20) {
    suggestions.push("Break larger goals into smaller, manageable tasks");
  }

  return suggestions;
}