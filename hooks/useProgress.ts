'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

export interface ProgressData {
  currentXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpForCurrentLevel: number;
  streak: number;
  longestStreak?: number;
  dailyGoal: {
    target: number;
    completed: number;
    unit: string; // 'sessions', 'minutes', 'exercises'
  };
  lastActivity?: string; // ISO date string
}

export interface SessionResult {
  xp_earned: number;
  total_xp: number;
  level: number;
  level_up: boolean;
  streak: number;
}

interface UseProgressReturn {
  progress: ProgressData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProgress: (sessionData: {
    duration_seconds: number;
    mistake_count: number;
    mistake_categories: string[];
  }) => Promise<SessionResult | null>;
  updateDailyGoal: (target: number, unit?: string) => Promise<void>;
}

const defaultProgress: ProgressData = {
  currentXP: 0,
  currentLevel: 1,
  xpForNextLevel: 100,
  xpForCurrentLevel: 0,
  streak: 0,
  longestStreak: 0,
  dailyGoal: {
    target: 3,
    completed: 0,
    unit: 'sessions'
  },
  lastActivity: undefined
};

export function useProgress(): UseProgressReturn {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/progress', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setProgress(null);
          return;
        }
        throw new Error(`Failed to fetch progress: ${response.status}`);
      }

      const data = await response.json();
      setProgress(data || defaultProgress);
    } catch (err: any) {
      console.error('Error fetching progress:', err);
      setError(err.message || 'Failed to load progress data');
      setProgress(defaultProgress); // Fallback to default
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProgress = useCallback(async (sessionData: {
    duration_seconds: number;
    mistake_count: number;
    mistake_categories: string[];
  }): Promise<SessionResult | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update progress: ${response.status}`);
      }

      const data = await response.json();
      
      // Update local progress state
      if (data.progress) {
        setProgress(data.progress);
      }

      return data.sessionResult || null;
    } catch (err: any) {
      console.error('Error updating progress:', err);
      setError(err.message || 'Failed to update progress');
      return null;
    }
  }, [user]);

  const updateDailyGoal = useCallback(async (target: number, unit: string = 'sessions') => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch('/api/progress', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_goal_target: target,
          daily_goal_unit: unit,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update daily goal: ${response.status}`);
      }

      const data = await response.json();
      
      // Update local progress state
      if (data.progress) {
        setProgress(data.progress);
      }
    } catch (err: any) {
      console.error('Error updating daily goal:', err);
      setError(err.message || 'Failed to update daily goal');
      throw err;
    }
  }, [user]);

  // Fetch progress when user changes
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
    updateProgress,
    updateDailyGoal,
  };
}