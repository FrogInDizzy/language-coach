'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Enhanced interfaces for better data structure
interface Mistake {
  id: string;
  category: string;
  explanation: string;
  suggestion: string;
  original_text: string;
  corrected_text: string;
}

interface Sample {
  id: string;
  transcript: string;
  created_at: string;
  duration_seconds?: number;
  audio_url?: string;
  mistakes?: Mistake[];
  prompt_id?: string;
  accuracy_score?: number;
}

interface FilterState {
  dateRange: 'all' | 'today' | 'week' | 'month';
  category: 'all' | 'articles' | 'verb_tense' | 'prepositions' | 'pluralization' | 'pronouns';
  sortBy: 'newest' | 'oldest' | 'accuracy' | 'duration';
}

// Utility functions
const formatCategoryName = (category: string) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    articles: '📰',
    prepositions: '🔗',
    verb_tense: '⏰',
    pluralization: '📊',
    pronouns: '👤',
    word_order: '🔀',
    run_on_fragment: '✂️',
    filler_words: '🗣️',
    other: '💬'
  };
  return iconMap[category] || '💬';
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return 'Unknown';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function HistoryPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Sample | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    category: 'all',
    sortBy: 'newest'
  });

  // Fetch samples
  useEffect(() => {
    const fetchSamples = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/history');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error fetching history');
        setSamples(json.samples || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...samples];

    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(s => new Date(s.created_at) >= today);
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(s => new Date(s.created_at) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(s => new Date(s.created_at) >= monthAgo);
        break;
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(s => 
        s.mistakes?.some(m => m.category === filters.category)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'accuracy':
        filtered.sort((a, b) => (b.accuracy_score || 0) - (a.accuracy_score || 0));
        break;
      case 'duration':
        filtered.sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredSamples(filtered);
  }, [samples, filters]);

  // Loading state
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-8 px-6">
        <div className="animate-in">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8 font-display">Practice History</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card">
                <div className="animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded mb-3"></div>
                  <div className="h-3 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="max-w-6xl mx-auto py-8 px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Unable to load history</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Empty state
  if (samples.length === 0) {
    return (
      <main className="max-w-6xl mx-auto py-8 px-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎤</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4 font-display">No practice sessions yet</h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
            Start your first practice session to begin tracking your progress and see your improvement over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/practice" className="btn-accent text-lg px-8 py-4">
              Start First Session
            </Link>
            <Link href="/dashboard" className="btn-secondary text-lg px-8 py-4">
              Go to Dashboard
            </Link>
          </div>
          
          {/* Features preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Track Progress</h3>
              <p className="text-sm text-neutral-600">See how your accuracy improves over time</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Review Mistakes</h3>
              <p className="text-sm text-neutral-600">Learn from detailed feedback on each session</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Filter & Sort</h3>
              <p className="text-sm text-neutral-600">Find specific sessions with powerful filters</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-8 px-6 space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2 font-display">Practice History</h1>
          <p className="text-neutral-600">
            {filteredSamples.length} session{filteredSamples.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
            className="input !py-2 !px-3 text-sm min-w-0"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as FilterState['category'] }))}
            className="input !py-2 !px-3 text-sm min-w-0"
          >
            <option value="all">All categories</option>
            <option value="articles">Articles</option>
            <option value="verb_tense">Verb Tense</option>
            <option value="prepositions">Prepositions</option>
            <option value="pluralization">Pluralization</option>
            <option value="pronouns">Pronouns</option>
          </select>

          {/* Sort Filter */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
            className="input !py-2 !px-3 text-sm min-w-0"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="accuracy">Best accuracy</option>
            <option value="duration">Longest duration</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSamples.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No sessions match your filters</h3>
          <p className="text-neutral-600 mb-4">Try adjusting your filters to see more results</p>
          <button
            onClick={() => setFilters({ dateRange: 'all', category: 'all', sortBy: 'newest' })}
            className="btn-secondary text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className="card cursor-pointer hover:shadow-medium transition-all duration-200 border-2 border-transparent hover:border-primary-200"
              onClick={() => setSelectedSession(sample)}
            >
              {/* Session Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🎤</span>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">Practice Session</div>
                    <div className="text-xs text-neutral-500">{getTimeAgo(sample.created_at)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary-600">
                    {formatDuration(sample.duration_seconds)}
                  </div>
                  {sample.accuracy_score && (
                    <div className="text-xs text-neutral-500">
                      {sample.accuracy_score.toFixed(0)}% accuracy
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript Preview */}
              <div className="mb-4">
                <p className="text-sm text-neutral-700 line-clamp-3 leading-relaxed">
                  {sample.transcript || 'No transcript available'}
                </p>
              </div>

              {/* Mistakes Summary */}
              {sample.mistakes && sample.mistakes.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-neutral-600">
                      {sample.mistakes.length} mistake{sample.mistakes.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sample.mistakes.slice(0, 3).map((mistake, idx) => (
                      <span key={idx} className={`badge mistake-${mistake.category} text-xs`}>
                        {getCategoryIcon(mistake.category)} {formatCategoryName(mistake.category)}
                      </span>
                    ))}
                    {sample.mistakes.length > 3 && (
                      <span className="badge-neutral text-xs">
                        +{sample.mistakes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                    <span>✨</span> Perfect session!
                  </div>
                </div>
              )}

              {/* Click indicator */}
              <div className="mt-4 text-xs text-neutral-400 flex items-center gap-1">
                <span>Click to view details</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-1">Practice Session Details</h2>
                  <p className="text-sm text-neutral-600">
                    {new Date(selectedSession.created_at).toLocaleString()} • {formatDuration(selectedSession.duration_seconds)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Transcript */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Your Speech</h3>
                <div className="card-solid">
                  <p className="text-neutral-700 leading-relaxed">
                    {selectedSession.transcript || 'No transcript available'}
                  </p>
                </div>
              </div>

              {/* Mistakes Analysis */}
              {selectedSession.mistakes && selectedSession.mistakes.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                    Mistakes Analysis ({selectedSession.mistakes.length} found)
                  </h3>
                  <div className="space-y-4">
                    {selectedSession.mistakes.map((mistake, idx) => (
                      <div key={idx} className="card border-l-4 border-l-amber-400">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">{getCategoryIcon(mistake.category)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`badge mistake-${mistake.category} text-xs`}>
                                {formatCategoryName(mistake.category)}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-700 mb-2">{mistake.explanation}</p>
                            {mistake.original_text && mistake.corrected_text && (
                              <div className="bg-neutral-50 rounded-lg p-3 mb-3">
                                <div className="text-xs text-neutral-600 mb-1">Original:</div>
                                <div className="text-sm text-red-600 mb-2 font-mono">{mistake.original_text}</div>
                                <div className="text-xs text-neutral-600 mb-1">Corrected:</div>
                                <div className="text-sm text-green-600 font-mono">{mistake.corrected_text}</div>
                              </div>
                            )}
                            <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
                              <div className="text-xs text-primary-600 font-medium mb-1">💡 Suggestion:</div>
                              <p className="text-sm text-primary-700">{mistake.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Perfect Session!</h3>
                  <p className="text-neutral-600">No mistakes were detected in this practice session.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <Link href="/practice" className="btn-accent flex-1" onClick={() => setSelectedSession(null)}>
                  Practice Again
                </Link>
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}