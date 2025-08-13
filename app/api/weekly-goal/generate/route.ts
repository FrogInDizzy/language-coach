import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

// Instantiate a fresh OpenAI client.  We avoid importing the shared one to
// reduce cross‑dependence in case you choose to mock it in tests.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/weekly-goal/generate
 *
 * Generates a weekly focus goal based on a user's recent mistakes.  It
 * fetches the last 100 mistakes grouped by category, determines the top
 * categories that have not improved, and asks GPT to produce a narrative
 * with specific drills and success criteria.  The result is stored in
 * the `weekly_goals` table for the current week (starting Monday).
 */
export async function POST(req: NextRequest) {
  const now = new Date();
  // Determine Monday of current week
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  monday.setDate(now.getDate() + diff);
  const weekOf = monday.toISOString().substring(0, 10);

  // Fetch last 100 mistakes
  const { data: mistakes, error: mistakesErr } = await supabase
    .from('mistakes')
    .select('category')
    .order('created_at', { ascending: false })
    .limit(100);
  if (mistakesErr) {
    return NextResponse.json({ error: mistakesErr.message }, { status: 500 });
  }
  // Count frequency per category
  const counts: Record<string, number> = {};
  mistakes?.forEach((m) => {
    counts[m.category] = (counts[m.category] || 0) + 1;
  });
  // Sort categories by frequency descending
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const focusCategories = sorted.slice(0, 2).map(([cat]) => cat);
  if (focusCategories.length === 0) {
    return NextResponse.json({ error: 'Not enough data to generate a weekly goal' }, { status: 400 });
  }
  // Compose prompt for GPT to generate weekly plan
  const prompt = `You are a language coach creating a one‑week improvement plan for a learner.\nThe learner consistently struggles with the following grammar categories: ${focusCategories.join(', ')}.\nWrite a short narrative (3‑4 sentences) that motivates the learner and outlines 3 targeted practice drills and success criteria (e.g. \"make fewer than 2 article errors across 5 prompts\").\nReturn JSON with keys:\n{\n  \"focus_categories\": [${focusCategories.map((c) => `\"${c}\"`).join(', ')}],\n  \"narrative\": \"...\",\n  \"metrics\": {\"baseline_counts\": ${JSON.stringify(counts)} }\n}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert ESL teacher.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });
  const content = resp.choices[0]?.message?.content || '{}';
  let goalJson: any;
  try {
    goalJson = JSON.parse(content);
  } catch (err) {
    return NextResponse.json({ error: 'Could not parse GPT response' }, { status: 500 });
  }
  // Upsert weekly_goals (replace existing if any)
  const { error: upsertErr } = await supabase
    .from('weekly_goals')
    .upsert({
      week_of: weekOf,
      focus_categories: goalJson.focus_categories,
      narrative: goalJson.narrative,
      metrics: goalJson.metrics
    }, { onConflict: 'week_of' });
  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }
  return NextResponse.json(goalJson);
}
