import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/dashboard
 *
 * Returns aggregated statistics for the currently signed‑in user:
 * - `topMistakes`: top 3 mistake categories in the last 30 days with counts
 * - `errorRates`: last 14 days error rates (mistakes per 100 words) grouped by day
 * - `trend`: whether categories are improving (fewer mistakes) in last 7 days vs previous 7 days
 * - `weeklyGoal`: the current week's focus categories and narrative
 */
export async function GET(req: NextRequest) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  // Fetch mistakes in the last 30 days with their category and created_at
  const { data: mistakes, error: mistakesErr } = await supabase
    .from('mistakes')
    .select('category, created_at, sample_id')
    .gte('created_at', thirtyDaysAgo.toISOString());
  if (mistakesErr) {
    return NextResponse.json({ error: mistakesErr.message }, { status: 500 });
  }
  // Count per category
  const categoryCounts: Record<string, number> = {};
  mistakes?.forEach((m) => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  });
  const topMistakes = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => ({ category, count }));

  // Fetch speaking_samples to compute words and timeline in last 14 days
  const { data: samples, error: sampleErr } = await supabase
    .from('speaking_samples')
    .select('id, created_at, transcript')
    .gte('created_at', fourteenDaysAgo.toISOString());
  if (sampleErr) {
    return NextResponse.json({ error: sampleErr.message }, { status: 500 });
  }
  // Build daily bins for error rate (mistakes per 100 words)
  const daily: Record<string, { words: number; mistakes: number }> = {};
  const countMistakesBySample: Record<string, number> = {};
  mistakes?.forEach((m) => {
    countMistakesBySample[m.sample_id] = (countMistakesBySample[m.sample_id] || 0) + 1;
  });
  samples?.forEach((s) => {
    const dateKey = s.created_at.split('T')[0];
    const wordCount = s.transcript ? s.transcript.split(/\s+/).length : 0;
    const mistakesCount = countMistakesBySample[s.id] || 0;
    if (!daily[dateKey]) daily[dateKey] = { words: 0, mistakes: 0 };
    daily[dateKey].words += wordCount;
    daily[dateKey].mistakes += mistakesCount;
  });
  // Format error rates
  const errorRates = Object.entries(daily).map(([date, { words, mistakes }]) => ({
    date,
    rate: words > 0 ? (mistakes / words) * 100 : 0
  }));

  // Trend analysis: compare last 7 days vs previous 7 days counts per category
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const { data: recent, error: recentErr } = await supabase
    .from('mistakes')
    .select('category, created_at')
    .gte('created_at', sevenDaysAgo.toISOString());
  const fourteenDaysAgo2 = new Date(now);
  fourteenDaysAgo2.setDate(now.getDate() - 14);
  const { data: prev, error: prevErr } = await supabase
    .from('mistakes')
    .select('category, created_at')
    .gte('created_at', fourteenDaysAgo2.toISOString())
    .lt('created_at', sevenDaysAgo.toISOString());
  if (recentErr || prevErr) {
    return NextResponse.json({ error: (recentErr || prevErr)?.message }, { status: 500 });
  }
  const recentCounts: Record<string, number> = {};
  recent?.forEach((m) => {
    recentCounts[m.category] = (recentCounts[m.category] || 0) + 1;
  });
  const prevCounts: Record<string, number> = {};
  prev?.forEach((m) => {
    prevCounts[m.category] = (prevCounts[m.category] || 0) + 1;
  });
  const trend: Record<string, 'up' | 'down' | 'flat'> = {};
  Object.keys({ ...recentCounts, ...prevCounts }).forEach((cat) => {
    const r = recentCounts[cat] || 0;
    const p = prevCounts[cat] || 0;
    if (r < p) trend[cat] = 'down';
    else if (r > p) trend[cat] = 'up';
    else trend[cat] = 'flat';
  });

  // Fetch current week goal (week_of Monday)
  const currentMonday = new Date(now);
  const day = currentMonday.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday offset
  currentMonday.setDate(now.getDate() + diff);
  const { data: goal, error: goalErr } = await supabase
    .from('weekly_goals')
    .select('*')
    .eq('week_of', currentMonday.toISOString().substring(0, 10))
    .single();
  if (goalErr && goalErr.code !== 'PGRST116') {
    return NextResponse.json({ error: goalErr.message }, { status: 500 });
  }
  return NextResponse.json({ topMistakes, errorRates, trend, weeklyGoal: goal || null });
}
