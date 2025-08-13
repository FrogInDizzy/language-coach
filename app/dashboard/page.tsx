'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import WeeklyFocus from '@/components/WeeklyFocus';
import ProgressWidget, { ProgressSummary, ProgressData } from '@/components/ProgressWidget';
import Link from 'next/link';

interface TopMistake { category: string; count: number; }
interface ErrorRate { date: string; rate: number; }
interface DashboardData {
  topMistakes: TopMistake[];
  errorRates: ErrorRate[];
  trend: Record<string, 'up' | 'down' | 'flat'>;
  weeklyGoal: any;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
  if (trend === 'down') return (
    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l3 3 7-7" />
    </svg>
  );
  if (trend === 'up') return (
    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  return (
    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
    </svg>
  );
};

const formatCategoryName = (category: string) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock progress data - in real app, this would come from API
  const progressData: ProgressData = {
    currentXP: 1240,
    currentLevel: 8,
    xpForNextLevel: 950,
    xpForCurrentLevel: 800,
    streak: 12,
    dailyGoal: {
      target: 3,
      completed: 2,
      unit: 'sessions'
    },
    lastActivity: new Date().toISOString()
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error fetching dashboard');
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.email?.split('@')[0] || 'there';

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-8 px-6">
        <div className="space-y-6">
          <div className="skeleton h-8 w-64"></div>
          <div className="card-solid">
            <div className="skeleton h-20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-solid">
              <div className="skeleton h-32"></div>
            </div>
            <div className="card-solid">
              <div className="skeleton h-32"></div>
            </div>
            <div className="card-solid">
              <div className="skeleton h-32"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto py-8 px-6">
        <div className="card-solid bg-red-50 border-red-200 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Unable to load dashboard</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-8 px-6 space-y-8 animate-in">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2 font-display">
          {getTimeGreeting()}, {userName}
        </h1>
        <p className="text-neutral-600">
          {data?.weeklyGoal ? 
            `Today's focus: ${formatCategoryName(data.weeklyGoal.focus_categories?.[0] || 'general practice')}` :
            "Ready to improve your English?"
          }
        </p>
      </section>

      {/* Progress Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressWidget 
            data={progressData}
            variant="dashboard"
            showDailyGoal={true}
          />
        </div>
        <div className="card">
          <ProgressSummary data={progressData} />
        </div>
      </section>

      {/* Daily Practice CTA */}
      <section>
        <div className="card-solid bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 text-center">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Daily Practice Session</h2>
            <p className="text-neutral-600">Get personalized feedback on your speaking</p>
          </div>
          <Link href="/practice" className="btn-primary text-lg px-8 py-4 shadow-glow">
            Start practicing
          </Link>
          <p className="text-sm text-neutral-500 mt-3">5-10 minutes • AI-powered feedback</p>
        </div>
      </section>

      {data && (
        <>
          {/* Weekly Focus */}
          <section>
            <WeeklyFocus goal={data.weeklyGoal} />
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Focus Areas */}
            <div className="card-solid">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Focus Areas</h3>
              </div>
              
              {data.topMistakes.length > 0 ? (
                <div className="space-y-3">
                  {data.topMistakes.slice(0, 3).map((mistake, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <span className={`badge mistake-${mistake.category}`}>
                        {formatCategoryName(mistake.category)}
                      </span>
                      <span className="text-sm font-medium text-neutral-700">{mistake.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <p className="text-sm text-neutral-500">Start practicing to see focus areas</p>
                </div>
              )}
            </div>

            {/* Progress Trends */}
            <div className="card-solid">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Recent Trends</h3>
              </div>
              
              {Object.keys(data.trend).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.trend).slice(0, 4).map(([category, trend]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <span className="text-sm text-neutral-700">
                        {formatCategoryName(category)}
                      </span>
                      <div className="flex items-center gap-2">
                        <TrendIcon trend={trend} />
                        <span className="text-xs text-neutral-500 capitalize">{trend === 'down' ? 'improving' : trend === 'up' ? 'needs work' : 'stable'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm text-neutral-500">Practice more to see trends</p>
                </div>
              )}
            </div>

            {/* Accuracy Score */}
            <div className="card-solid">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Accuracy</h3>
              </div>
              
              {data.errorRates.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {Math.max(0, 100 - data.errorRates[data.errorRates.length - 1].rate).toFixed(0)}%
                    </div>
                    <p className="text-sm text-neutral-500">Current accuracy</p>
                  </div>
                  <div className="space-y-2">
                    {data.errorRates.slice(-3).map((rate, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-neutral-50 rounded">
                        <span className="text-neutral-500">{new Date(rate.date).toLocaleDateString()}</span>
                        <span className="font-medium">{rate.rate.toFixed(1)} errors/100w</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-neutral-500">Complete a session to see accuracy</p>
                </div>
              )}
            </div>
          </section>

          {/* AI Coach Insight */}
          <section>
            <div className="card-solid bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">AI Coach Insight</h4>
                  <p className="text-neutral-700 leading-relaxed">
                    {data.topMistakes.length > 0 ? 
                      `Focus on ${formatCategoryName(data.topMistakes[0].category).toLowerCase()} today. Try speaking more slowly and pay attention to ${data.topMistakes[0].category.includes('verb') ? 'verb forms and tenses' : 'word choices and structure'}.` :
                      "Consistent daily practice is the key to fluency. Even 5 minutes a day will significantly improve your speaking confidence and accuracy."
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
