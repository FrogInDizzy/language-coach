import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/progress
 * 
 * Returns the current user's progress data including XP, level, streak, and daily goals.
 * This data is used by the ProgressWidget component to display real-time progress.
 */
export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call the database function to get comprehensive progress summary
    const { data, error } = await supabase
      .rpc('get_user_progress_summary', { p_user_id: user.id });

    if (error) {
      console.error('Error fetching user progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no data returned, create default progress
    if (!data) {
      const defaultProgress = {
        currentXP: 0,
        currentLevel: 1,
        xpForNextLevel: 100,
        xpForCurrentLevel: 0,
        streak: 0,
        longestStreak: 0,
        lastActivity: null,
        dailyGoal: {
          target: 3,
          completed: 0,
          unit: 'sessions'
        }
      };
      return NextResponse.json(defaultProgress);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Unexpected error in progress API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/progress
 * 
 * Updates user progress after a practice session.
 * Calculates XP, updates streak, and handles level progression.
 * 
 * Body:
 * {
 *   duration_seconds: number,
 *   mistake_count: number,
 *   mistake_categories: string[]
 * }
 */
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { duration_seconds, mistake_count, mistake_categories } = body;

    // Validate required fields
    if (typeof duration_seconds !== 'number' || typeof mistake_count !== 'number') {
      return NextResponse.json({ 
        error: 'duration_seconds and mistake_count are required and must be numbers' 
      }, { status: 400 });
    }

    // Ensure mistake_categories is an array
    const categories = Array.isArray(mistake_categories) ? mistake_categories : [];

    // Get current date in user's timezone (defaulting to UTC for now)
    const sessionDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Call the database function to update progress
    const { data, error } = await supabase
      .rpc('update_user_progress_after_session', {
        p_user_id: user.id,
        p_session_date: sessionDate,
        p_duration_seconds: duration_seconds,
        p_mistake_count: mistake_count,
        p_mistake_categories: categories
      });

    if (error) {
      console.error('Error updating user progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get updated progress summary
    const { data: updatedProgress, error: progressError } = await supabase
      .rpc('get_user_progress_summary', { p_user_id: user.id });

    if (progressError) {
      console.error('Error fetching updated progress:', progressError);
      // Still return the session update result even if we can't fetch full progress
      return NextResponse.json({
        sessionResult: data,
        progress: null,
        error: 'Could not fetch updated progress'
      });
    }

    return NextResponse.json({
      sessionResult: data,
      progress: updatedProgress
    });

  } catch (err: any) {
    console.error('Unexpected error in progress update:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/progress
 * 
 * Updates user's daily goal settings.
 * 
 * Body:
 * {
 *   daily_goal_target?: number,
 *   daily_goal_unit?: string
 * }
 */
export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { daily_goal_target, daily_goal_unit } = body;

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (typeof daily_goal_target === 'number' && daily_goal_target > 0) {
      updates.daily_goal_target = daily_goal_target;
    }
    
    if (typeof daily_goal_unit === 'string' && daily_goal_unit.trim()) {
      updates.daily_goal_unit = daily_goal_unit.trim();
    }

    // If no valid updates, return error
    if (Object.keys(updates).length === 1) { // Only updated_at
      return NextResponse.json({ 
        error: 'No valid updates provided' 
      }, { status: 400 });
    }

    // Update user progress
    const { error } = await supabase
      .from('user_progress')
      .upsert({ 
        user_id: user.id,
        ...updates
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating daily goal:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get updated progress
    const { data: updatedProgress, error: progressError } = await supabase
      .rpc('get_user_progress_summary', { p_user_id: user.id });

    if (progressError) {
      console.error('Error fetching updated progress:', progressError);
      return NextResponse.json({ error: progressError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Daily goal updated successfully',
      progress: updatedProgress
    });

  } catch (err: any) {
    console.error('Unexpected error in daily goal update:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}