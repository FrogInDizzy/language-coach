import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface PracticeSession {
  id: string;
  focus_category: string;
  session_type: string;
  duration_seconds: number;
  mistakes_before?: number;
  mistakes_after?: number;
  improved: boolean;
  effectiveness_score: number;
  created_at: string;
}

interface PracticeSummary {
  total_sessions: number;
  total_duration: number;
  avg_effectiveness: number;
  categories_practiced: string[];
  improvement_rate: number;
}

interface UseFocusPracticeReturn {
  sessions: PracticeSession[];
  summary: PracticeSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getCategoryMetrics: (category: string) => {
    sessions: number;
    avgEffectiveness: number;
    lastPracticed?: string;
    trend: 'improving' | 'stable' | 'declining';
  };
}

export function useFocusPractice(days: number = 7): UseFocusPracticeReturn {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        user_id: user.id,
        days: days.toString()
      });

      const response = await fetch(`/api/focus-practice?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch practice data');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSessions([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, days]);

  const getCategoryMetrics = (category: string) => {
    const categorySessions = sessions.filter(s => s.focus_category === category);
    
    if (categorySessions.length === 0) {
      return {
        sessions: 0,
        avgEffectiveness: 0,
        trend: 'stable' as const
      };
    }

    const avgEffectiveness = categorySessions.reduce((sum, s) => sum + s.effectiveness_score, 0) / categorySessions.length;
    const lastPracticed = categorySessions[0]?.created_at; // Sessions are ordered by created_at desc

    // Determine trend based on recent effectiveness
    const recentSessions = categorySessions.slice(0, 3); // Last 3 sessions
    const recentAvg = recentSessions.reduce((sum, s) => sum + s.effectiveness_score, 0) / recentSessions.length;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvg > 0.7) {
      trend = 'improving';
    } else if (recentAvg < 0.3) {
      trend = 'declining';
    }

    return {
      sessions: categorySessions.length,
      avgEffectiveness: Math.round(avgEffectiveness * 100) / 100,
      lastPracticed,
      trend
    };
  };

  return {
    sessions,
    summary,
    loading,
    error,
    refetch: fetchData,
    getCategoryMetrics
  };
}

export function useCategoryPracticeHistory(category: string, days: number = 30) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !category) {
      setLoading(false);
      return;
    }

    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          user_id: user.id,
          focus_category: category,
          days: days.toString()
        });

        const response = await fetch(`/api/focus-practice?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch category practice data');
        }

        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [user?.id, category, days]);

  return { sessions, loading, error };
}