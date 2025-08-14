import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { calculateSessionAchievements, generateMicroWins, getMostImpressiveAchievement } from '@/lib/achievements';

/**
 * GET /api/achievements
 * 
 * Returns recent achievements and micro-wins for the authenticated user
 */
export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get recent achievements from database
    const { data: storedAchievements, error: achievementError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(10);

    if (achievementError) {
      console.error('Error fetching achievements:', achievementError);
      return NextResponse.json({ error: achievementError.message }, { status: 500 });
    }

    // Get recent session data for calculating new achievements
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('speaking_samples')
      .select(`
        created_at,
        duration_seconds,
        mistakes (
          category,
          severity
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (sessionsError) {
      console.error('Error fetching recent sessions:', sessionsError);
      // Return stored achievements even if we can't calculate new ones
      return NextResponse.json({
        achievements: storedAchievements || [],
        microWins: [],
        mostImpressive: null
      });
    }

    // Get user progress summary for context
    const { data: progressSummary, error: progressError } = await supabase
      .rpc('get_user_progress_summary', { p_user_id: user.id });

    // Process recent sessions to calculate accuracy and trends
    const processedSessions = (recentSessions || []).map(session => ({
      mistakeCount: session.mistakes?.length || 0,
      accuracyScore: Math.max(0, 100 - (session.mistakes?.length || 0) * 5), // Rough accuracy calculation
      categories: session.mistakes?.map((m: any) => m.category) || [],
      date: session.created_at
    }));

    // Calculate new achievements based on recent activity
    const newAchievements = recentSessions && recentSessions.length > 0 ? 
      calculateSessionAchievements(
        {
          mistakeCategories: processedSessions[0]?.categories || [],
          mistakeCount: processedSessions[0]?.mistakeCount || 0,
          durationSeconds: recentSessions[0]?.duration_seconds || 0,
          accuracyScore: processedSessions[0]?.accuracyScore || 0
        },
        {
          previousSessions: processedSessions.slice(1),
          totalSessions: progressSummary?.total_sessions || 0,
          currentStreak: progressSummary?.streak || 0,
          averageAccuracy: processedSessions.reduce((sum, s) => sum + s.accuracyScore, 0) / Math.max(1, processedSessions.length)
        }
      ) : [];

    // Generate micro-wins for greeting display
    const microWins = generateMicroWins(newAchievements);
    const mostImpressive = getMostImpressiveAchievement(newAchievements);

    // Store new achievements in database
    if (newAchievements.length > 0) {
      const achievementsToStore = newAchievements.map(achievement => ({
        user_id: user.id,
        achievement_id: achievement.id,
        type: achievement.type,
        category: achievement.category,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        value: achievement.value,
        percentage: achievement.percentage,
        earned_at: achievement.earnedAt
      }));

      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert(achievementsToStore);

      if (insertError) {
        console.error('Error storing new achievements:', insertError);
        // Continue without failing - we can still return the calculated achievements
      }
    }

    // Combine stored and new achievements
    const allAchievements = [
      ...newAchievements,
      ...(storedAchievements || []).map(a => ({
        id: a.achievement_id,
        type: a.type,
        category: a.category,
        title: a.title,
        description: a.description,
        icon: a.icon,
        value: a.value,
        percentage: a.percentage,
        isNew: false, // Stored achievements are not new
        earnedAt: a.earned_at
      }))
    ];

    return NextResponse.json({
      achievements: allAchievements,
      microWins,
      mostImpressive
    });

  } catch (err: any) {
    console.error('Unexpected error in achievements API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/achievements
 * 
 * Mark achievement as viewed (no longer "new")
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
    const { achievementId } = body;

    if (!achievementId) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
    }

    // Mark achievement as viewed
    const { error } = await supabase
      .from('user_achievements')
      .update({ viewed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId);

    if (error) {
      console.error('Error marking achievement as viewed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Unexpected error marking achievement as viewed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}