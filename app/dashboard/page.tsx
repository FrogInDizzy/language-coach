'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import WeeklyFocus from '@/components/WeeklyFocus';
import { RealDataProgressWidget, ProgressSummary } from '@/components/ProgressWidget';
import { mockProgressData, mockRecentMistakes } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { EmptyPanel } from '@/components/ui/EmptyPanel';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Use mock data instead of API call
    setTimeout(() => {
      try {
        const mockData: DashboardData = {
          topMistakes: mockRecentMistakes.map(m => ({ category: m.category, count: m.count })),
          errorRates: mockProgressData.recentSessions.map(s => ({ 
            date: s.date, 
            rate: 100 - s.score 
          })),
          trend: mockRecentMistakes.reduce((acc, mistake) => {
            acc[mistake.category] = mistake.trend === 'improving' ? 'down' : 
                                  mistake.trend === 'worsening' ? 'up' : 'flat';
            return acc;
          }, {} as Record<string, 'up' | 'down' | 'flat'>),
          weeklyGoal: {
            focus_categories: [mockProgressData.improvementAreas[0]]
          }
        };
        setData(mockData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }, 1000); // Simulate API loading time
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
    <main className="max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* Modern Header */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTimeGreeting()}, {userName}
          </h1>
          <p className="text-gray-600 mb-6">
            {data?.weeklyGoal ? 
              `Today's focus: ${formatCategoryName(data.weeklyGoal.focus_categories?.[0] || 'general practice')}` :
              "Ready to improve your English?"
            }
          </p>
          
          {/* Integrated Progress Widget */}
          <RealDataProgressWidget 
            variant="dashboard"
            showDailyGoal={true}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link 
          href="/practice" 
          className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-200 transition-all duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <span className="text-2xl">🎤</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Start Practice</h3>
              <p className="text-sm text-gray-600">5-10 minute session</p>
            </div>
          </div>
          <div className="text-green-600 text-sm font-medium">Begin now →</div>
        </Link>

        <Link 
          href="/history" 
          className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 transition-all duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Review Progress</h3>
              <p className="text-sm text-gray-600">Past sessions</p>
            </div>
          </div>
          <div className="text-blue-600 text-sm font-medium">View history →</div>
        </Link>

        <Link 
          href="/account" 
          className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-amber-200 transition-all duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600">Customize goals</p>
            </div>
          </div>
          <div className="text-amber-600 text-sm font-medium">Configure →</div>
        </Link>
      </section>

      {data && (
        <>
          {/* Weekly Focus */}
          <section>
            <WeeklyFocus goal={data.weeklyGoal} />
          </section>

          {/* Enhanced Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Focus Areas */}
            <div className="card-solid border-l-4 border-l-amber-400">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Focus Areas</h3>
                  <p className="text-sm text-neutral-600">Areas needing attention</p>
                </div>
              </div>
              
              {data.topMistakes.length > 0 ? (
                <div className="space-y-4">
                  {data.topMistakes.slice(0, 3).map((mistake, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-neutral-25 rounded-xl border border-neutral-100 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-lg">
                            {mistake.category === 'articles' ? '📰' :
                             mistake.category === 'verb_tense' ? '⏰' :
                             mistake.category === 'prepositions' ? '🔗' :
                             mistake.category === 'pluralization' ? '📊' : '💬'}
                          </span>
                        </div>
                        <div>
                          <span className={`badge mistake-${mistake.category} text-xs`}>
                            {formatCategoryName(mistake.category)}
                          </span>
                          <div className="text-xs text-neutral-500 mt-1">
                            {idx === 0 ? 'Most common' : idx === 1 ? 'Second most' : 'Third most'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-600">{mistake.count}</div>
                        <div className="text-xs text-neutral-500">occurrences</div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <Link href="/practice" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 group">
                      Practice to improve
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">No focus areas yet</h4>
                  <p className="text-sm text-neutral-600 mb-4">Complete practice sessions to identify improvement areas</p>
                  <Link href="/practice" className="btn-accent text-sm px-4 py-2">
                    Start First Session
                  </Link>
                </div>
              )}
            </div>

            {/* Progress Trends */}
            <div className="card-solid border-l-4 border-l-emerald-400">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Recent Trends</h3>
                  <p className="text-sm text-neutral-600">How you're improving</p>
                </div>
              </div>
              
              {Object.keys(data.trend).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(data.trend).slice(0, 4).map(([category, trend]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-neutral-25 rounded-xl border border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                          trend === 'down' ? 'bg-emerald-100' : 
                          trend === 'up' ? 'bg-red-100' : 'bg-neutral-100'
                        }`}>
                          <TrendIcon trend={trend} />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">
                            {formatCategoryName(category)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {trend === 'down' ? '📈 Improving' : trend === 'up' ? '📉 Needs attention' : '➡️ Stable'}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trend === 'down' ? 'bg-emerald-100 text-emerald-700' : 
                        trend === 'up' ? 'bg-red-100 text-red-700' : 
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {trend === 'down' ? 'Great!' : trend === 'up' ? 'Focus' : 'Stable'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📈</span>
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">No trends yet</h4>
                  <p className="text-sm text-neutral-600 mb-4">Complete multiple sessions to see improvement trends</p>
                  <Link href="/practice" className="btn-secondary text-sm px-4 py-2">
                    Practice More
                  </Link>
                </div>
              )}
            </div>

            {/* Accuracy Score */}
            <div className="card-solid border-l-4 border-l-primary-400">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Accuracy Score</h3>
                  <p className="text-sm text-neutral-600">Your speaking precision</p>
                </div>
              </div>
              
              {data.errorRates.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="text-4xl font-bold text-primary-600 mb-1">
                        {Math.max(0, 100 - data.errorRates[data.errorRates.length - 1].rate).toFixed(0)}%
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-sm text-neutral-600 font-medium">Current accuracy</p>
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.max(0, 100 - data.errorRates[data.errorRates.length - 1].rate)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-neutral-900">Recent Sessions</h4>
                    {data.errorRates.slice(-3).map((rate, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-25 rounded-lg border border-primary-100">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-600">{idx + 1}</span>
                          </div>
                          <span className="text-sm text-neutral-700">{new Date(rate.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary-600">
                            {Math.max(0, 100 - rate.rate).toFixed(0)}%
                          </div>
                          <div className="text-xs text-neutral-500">{rate.rate.toFixed(1)} errors</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">No accuracy data yet</h4>
                  <p className="text-sm text-neutral-600 mb-4">Complete practice sessions to track your accuracy</p>
                  <Link href="/practice" className="btn-primary text-sm px-4 py-2">
                    Start Tracking
                  </Link>
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
