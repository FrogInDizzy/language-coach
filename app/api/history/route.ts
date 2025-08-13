import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/history
 *
 * Returns the list of speaking samples for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const { data, error } = await supabase
    .from('speaking_samples')
    .select('id, created_at, transcript')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ samples: data });
}
