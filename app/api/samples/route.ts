import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * POST /api/samples
 *
 * Persists a speaking sample along with its associated mistakes.  The
 * authenticated user ID is inferred from the Supabase auth cookie; the
 * client must be signed in for this route to succeed.  Row‑level
 * security ensures users can only write their own data.
 *
 * Body:
 * {
 *   prompt_id?: string,
 *   audio_url: string,
 *   transcript: string,
 *   duration_seconds: number,
 *   mistakes: [
 *     {
 *       category: string,
 *       span: { start_char: number, end_char: number, text: string },
 *       explanation: string,
 *       suggestion: string,
 *       severity: number
 *     }, ...
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { prompt_id, audio_url, transcript, duration_seconds, mistakes } = body;
  if (!audio_url || !transcript) {
    return NextResponse.json({ error: 'audio_url and transcript are required' }, { status: 400 });
  }
  
  // Insert the sample record first with explicit user_id
  const { data: sampleData, error: sampleErr } = await supabase
    .from('speaking_samples')
    .insert({
      user_id: user.id,
      prompt_id: prompt_id ?? null,
      audio_url,
      transcript,
      duration_seconds
    })
    .select()
    .single();
  if (sampleErr || !sampleData) {
    return NextResponse.json({ error: sampleErr?.message || 'Could not insert sample' }, { status: 500 });
  }
  const sample_id = sampleData.id;
  // Insert mistakes if present
  if (Array.isArray(mistakes) && mistakes.length > 0) {
    const insertPayload = mistakes.map((m: any) => ({
      sample_id,
      category: m.category,
      span: m.span,
      explanation: m.explanation,
      suggestion: m.suggestion,
      severity: m.severity
    }));
    const { error: mistakesErr } = await supabase
      .from('mistakes')
      .insert(insertPayload);
    if (mistakesErr) {
      return NextResponse.json({ error: mistakesErr.message }, { status: 500 });
    }
  }
  return NextResponse.json({ id: sample_id });
}
