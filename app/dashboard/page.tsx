'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import WeeklyFocus from '@/components/WeeklyFocus';
import { RealDataProgressWidget, ProgressSummary } from '@/components/ProgressWidget';
import PersonalizedGreeting from '@/components/PersonalizedGreeting';
import DailyQuestPanel from '@/components/DailyQuestPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { mockProgressData, mockRecentMistakes } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { EmptyPanel } from '@/components/ui/EmptyPanel';
import { FocusAreasEmptyState, TrendsEmptyState, AccuracyEmptyState } from '@/components/ui/EmptyState';
import { useFocusPractice } from '@/hooks/useFocusPractice';
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
  const { getCategoryMetrics } = useFocusPractice();
  
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
      {/* Personalized Header */}
      <section className="mb-8">
        <ErrorBoundary
          fallback={
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Good day!
              </h1>
              <p className="text-gray-600">
                Ready to improve your English?
              </p>
            </div>
          }
        >
          <PersonalizedGreeting 
            showProgressWidget={true}
            variant="dashboard"
          />
        </ErrorBoundary>
        
        {/* Progress Widget */}
        <div className="mt-6">
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
              <h3 className="font-semibold text-gray-900">Start 3-min session</h3>
              <p className="text-sm text-gray-600">Quick focused practice</p>
            </div>
          </div>
          <div className="text-green-600 text-sm font-medium">Let's go →</div>
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

      {/* Daily Quest Panel */}
      <section>
        <DailyQuestPanel 
          variant="dashboard"
          onQuestComplete={(questId, xpEarned) => {
            console.log(`Quest ${questId} completed! +${xpEarned} XP`);
          }}
          onAllQuestsComplete={(totalXp, streakShield) => {
            console.log(`All quests complete! +${totalXp} XP, Shield: ${streakShield}`);
          }}
        />
      </section>

      {data && (
        <>
          {/* Weekly Focus */}
          <section>
            <WeeklyFocus goal={data.weeklyGoal} />
          </section>

          {/* Focus Areas - Full Width Section */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
              <div className="p-6 pb-4 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">Your Practice Focus</h3>
                      <p className="text-sm text-neutral-600">Ready-to-practice areas for quick improvement</p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-xs text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-full">
                    2-min drills
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-5">
              
              {data.topMistakes.length > 0 ? (
                <div className="space-y-3">
                  {data.topMistakes.slice(0, 3).map((mistake, idx) => {
                    const practiceMetrics = getCategoryMetrics(mistake.category);
                    const categoryIcon = mistake.category === 'articles' ? '📰' :
                                       mistake.category === 'verb_tense' ? '⏰' :
                                       mistake.category === 'prepositions' ? '🔗' :
                                       mistake.category === 'pluralization' ? '📊' : '💬';
                    
                    return (
                      <div key={idx} className="group bg-white rounded-xl border border-neutral-200 hover:border-amber-300 focus-card-hover overflow-hidden">
                        {/* Header Section */}
                        <div className="p-4 pb-3">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                <span className="text-xl">{categoryIcon}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-neutral-900 text-base">
                                  {formatCategoryName(mistake.category)}
                                </h4>
                                <p className="text-sm text-neutral-600">
                                  {mistake.count} {mistake.count === 1 ? 'mistake' : 'mistakes'} • {idx === 0 ? 'Most common' : idx === 1 ? 'Second most' : 'Third most'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Progress Indicator */}
                            {practiceMetrics.sessions > 0 && (
                              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                practiceMetrics.trend === 'improving' ? 'bg-emerald-100 text-emerald-700' :
                                practiceMetrics.trend === 'declining' ? 'bg-rose-100 text-rose-700' :
                                'bg-neutral-100 text-neutral-600'
                              }`}>
                                {practiceMetrics.trend === 'improving' ? '📈 Improving' :
                                 practiceMetrics.trend === 'declining' ? '📉 Needs focus' : '➡️ Stable'}
                              </div>
                            )}
                          </div>
                          
                          {/* Practice Stats (if available) */}
                          {practiceMetrics.sessions > 0 && (
                            <div className="flex items-center gap-4 text-xs text-neutral-600 mb-3">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                {practiceMetrics.sessions} practice {practiceMetrics.sessions === 1 ? 'session' : 'sessions'}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                {Math.round(practiceMetrics.avgEffectiveness * 100)}% effectiveness
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Section */}
                        <div className="bg-amber-25 px-4 py-3 border-t border-amber-100">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-amber-700">
                              <span className="font-medium">2-minute focused drill</span>
                              <span className="text-amber-600 ml-2">• Quick improvement practice</span>
                            </div>
                            <Link 
                              href={`/practice?focus=${mistake.category}&drill=micro`}
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 group shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-amber-900 text-xs">
                                {categoryIcon}
                              </div>
                              <span>{practiceMetrics.sessions > 0 ? 'Practice again' : 'Start 2-min drill'}</span>
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <FocusAreasEmptyState size="small" />
              )}
              
              {/* Footer Action */}
              <div className="px-6 py-4 bg-neutral-25 border-t border-neutral-100 rounded-b-2xl">
                <Link href="/practice" className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-2 group">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>View all practice options</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              </div>
            </div>
          </section>

          {/* Enhanced Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <TrendsEmptyState size="small" />
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
                <AccuracyEmptyState size="small" />
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
