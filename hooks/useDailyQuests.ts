'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { DailyQuestSet, DailyQuest } from '@/lib/dailyQuests';

interface UseDailyQuestsReturn {
  questSet: DailyQuestSet | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateQuestProgress: (questId: string, increment: number, reason?: string) => Promise<boolean>;
  refreshQuests: () => Promise<void>;
}

export function useDailyQuests(date?: string): UseDailyQuestsReturn {
  const { user } = useAuth();
  const [questSet, setQuestSet] = useState<DailyQuestSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDate = date || new Date().toISOString().split('T')[0];

  const fetchQuests = useCallback(async () => {
    if (!user) {
      setQuestSet(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `/api/daily-quests?date=${targetDate}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setQuestSet(null);
          return;
        }
        throw new Error(`Failed to fetch quests: ${response.status}`);
      }

      const data = await response.json();
      setQuestSet(data);
      
    } catch (err: any) {
      console.error('Error fetching daily quests:', err);
      setError(err.message || 'Failed to load daily quests');
      setQuestSet(null);
    } finally {
      setLoading(false);
    }
  }, [user, targetDate]);

  const updateQuestProgress = useCallback(async (
    questId: string, 
    increment: number, 
    reason?: string
  ): Promise<boolean> => {
    if (!user || !questSet) {
      return false;
    }

    try {
      setError(null);

      const response = await fetch('/api/daily-quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questId,
          increment,
          reason
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update quest: ${response.status}`);
      }

      const updatedQuest = await response.json();
      
      // Update local state
      setQuestSet(prevSet => {
        if (!prevSet) return prevSet;

        const updatedQuests = prevSet.quests.map(quest => {
          if (quest.id === questId) {
            return {
              ...quest,
              progress: updatedQuest.progress,
              completed: updatedQuest.completed
            };
          }
          return quest;
        });

        const completedCount = updatedQuests.filter(q => q.completed).length;
        const totalXpEarned = updatedQuests
          .filter(q => q.completed)
          .reduce((sum, q) => sum + q.xpReward, 0);

        return {
          ...prevSet,
          quests: updatedQuests,
          allCompleted: completedCount === updatedQuests.length,
          totalXpEarned
        };
      });

      return true;
      
    } catch (err: any) {
      console.error('Error updating quest progress:', err);
      setError(err.message || 'Failed to update quest progress');
      return false;
    }
  }, [user, questSet]);

  const refreshQuests = useCallback(async () => {
    await fetchQuests();
  }, [fetchQuests]);

  // Fetch quests when user or date changes
  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  return {
    questSet,
    loading,
    error,
    refetch: fetchQuests,
    updateQuestProgress,
    refreshQuests,
  };
}