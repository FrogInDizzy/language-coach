'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { Achievement, MicroWin } from '@/lib/achievements';

interface UseAchievementsReturn {
  achievements: Achievement[];
  microWins: MicroWin[];
  mostImpressive: Achievement | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsViewed: (achievementId: string) => Promise<void>;
}

export function useAchievements(): UseAchievementsReturn {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [microWins, setMicroWins] = useState<MicroWin[]>([]);
  const [mostImpressive, setMostImpressive] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setAchievements([]);
      setMicroWins([]);
      setMostImpressive(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/achievements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAchievements([]);
          setMicroWins([]);
          setMostImpressive(null);
          return;
        }
        throw new Error(`Failed to fetch achievements: ${response.status}`);
      }

      const data = await response.json();
      setAchievements(data.achievements || []);
      setMicroWins(data.microWins || []);
      setMostImpressive(data.mostImpressive || null);

    } catch (err: any) {
      console.error('Error fetching achievements:', err);
      setError(err.message || 'Failed to load achievements');
      setAchievements([]);
      setMicroWins([]);
      setMostImpressive(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsViewed = useCallback(async (achievementId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievementId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark achievement as viewed: ${response.status}`);
      }

      // Update local state to mark achievement as viewed
      setAchievements(prev => prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, isNew: false }
          : achievement
      ));

      // Remove from micro-wins if it's there
      setMicroWins(prev => prev.filter(win => win.id !== achievementId));

      // Clear most impressive if it was this achievement
      if (mostImpressive?.id === achievementId) {
        setMostImpressive(null);
      }

    } catch (err: any) {
      console.error('Error marking achievement as viewed:', err);
      setError(err.message || 'Failed to mark achievement as viewed');
      throw err;
    }
  }, [user, mostImpressive]);

  // Fetch achievements when user changes
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    microWins,
    mostImpressive,
    loading,
    error,
    refetch: fetchAchievements,
    markAsViewed,
  };
}