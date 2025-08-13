import { NextRequest, NextResponse } from 'next/server';
import { analyseTranscript } from '@/lib/analysis';

/**
 * POST /api/analyze
 *
 * Body: { transcript: string }
 * Returns the parsed analysis JSON containing mistakes, per_category_counts and summary.
 */
export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  if (!transcript || typeof transcript !== 'string') {
    return NextResponse.json({ error: 'Missing transcript in request body' }, { status: 400 });
  }
  try {
    const result = await analyseTranscript(transcript);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
