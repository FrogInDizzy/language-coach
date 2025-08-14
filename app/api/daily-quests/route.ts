import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/daily-quests
 * Fetch or generate daily quests for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token.value);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Get date parameter (defaults to today)
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    const questDate = dateParam || new Date().toISOString().split('T')[0];

    // Generate or fetch daily quests using the database function
    const { data: questData, error: questError } = await supabase
      .rpc('generate_daily_quests_for_user', {
        p_user_id: user.id,
        p_quest_date: questDate
      });

    if (questError) {
      console.error('Quest generation error:', questError);
      return NextResponse.json({ error: 'Failed to generate quests' }, { status: 500 });
    }

    return NextResponse.json(questData);
    
  } catch (error) {
    console.error('Daily quests API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/daily-quests
 * Update quest progress
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token.value);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const body = await request.json();
    const { questId, increment, reason } = body;

    if (!questId || increment === undefined) {
      return NextResponse.json({ 
        error: 'Quest ID and increment are required' 
      }, { status: 400 });
    }

    // Update quest progress using database function
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_quest_progress', {
        p_user_id: user.id,
        p_quest_id: questId,
        p_increment: increment,
        p_reason: reason || null
      });

    if (updateError) {
      console.error('Quest update error:', updateError);
      return NextResponse.json({ error: 'Failed to update quest' }, { status: 500 });
    }

    // Check if there's an error in the result
    if (updateResult?.error) {
      return NextResponse.json({ error: updateResult.error }, { status: 400 });
    }

    return NextResponse.json(updateResult);
    
  } catch (error) {
    console.error('Quest update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}