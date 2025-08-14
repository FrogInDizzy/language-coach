import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const {
      user_id,
      focus_category,
      session_type = 'micro',
      duration_seconds,
      mistakes_before,
      mistakes_after,
      improved
    } = await request.json();

    // Validate required fields
    if (!user_id || !focus_category || !duration_seconds) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate effectiveness score
    let effectiveness_score = 0.0;
    if (mistakes_before && mistakes_after !== null) {
      if (mistakes_before > 0) {
        const improvement = Math.max(0, mistakes_before - mistakes_after);
        effectiveness_score = improvement / mistakes_before;
      } else if (mistakes_after === 0) {
        effectiveness_score = 1.0; // Perfect maintenance of accuracy
      }
    } else if (improved) {
      effectiveness_score = 0.5; // Default positive score for subjective improvement
    }

    // Insert practice session record
    const { data: session, error: sessionError } = await supabase
      .from('focus_practice_sessions')
      .insert({
        user_id,
        focus_category,
        session_type,
        duration_seconds,
        mistakes_before,
        mistakes_after,
        improved,
        effectiveness_score
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error inserting focus practice session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to record practice session' },
        { status: 500 }
      );
    }

    // Update focus area metrics in weekly goal
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekOf = weekStart.toISOString().split('T')[0];

    // Get current weekly goal
    const { data: weeklyGoal } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', user_id)
      .eq('week_of', weekOf)
      .single();

    if (weeklyGoal) {
      const practiceMetrics = weeklyGoal.practice_sessions || {};
      
      // Initialize category metrics if not exists
      if (!practiceMetrics[focus_category]) {
        practiceMetrics[focus_category] = {
          total_sessions: 0,
          total_duration: 0,
          avg_effectiveness: 0,
          improvement_trend: 'stable'
        };
      }

      const categoryMetrics = practiceMetrics[focus_category];
      
      // Update metrics
      categoryMetrics.total_sessions += 1;
      categoryMetrics.total_duration += duration_seconds;
      
      // Calculate new average effectiveness
      const prevAvg = categoryMetrics.avg_effectiveness || 0;
      const newAvg = ((prevAvg * (categoryMetrics.total_sessions - 1)) + effectiveness_score) / categoryMetrics.total_sessions;
      categoryMetrics.avg_effectiveness = Math.round(newAvg * 100) / 100; // Round to 2 decimal places

      // Determine improvement trend
      if (effectiveness_score > 0.7) {
        categoryMetrics.improvement_trend = 'improving';
      } else if (effectiveness_score < 0.3) {
        categoryMetrics.improvement_trend = 'declining';
      } else {
        categoryMetrics.improvement_trend = 'stable';
      }

      // Update last practiced
      categoryMetrics.last_practiced = new Date().toISOString();

      // Update weekly goal with new metrics
      await supabase
        .from('weekly_goals')
        .update({ practice_sessions: practiceMetrics })
        .eq('user_id', user_id)
        .eq('week_of', weekOf);
    }

    return NextResponse.json({
      success: true,
      session,
      effectiveness_score,
      message: improved ? 'Great practice session! Keep it up!' : 'Practice recorded. Try focusing more on accuracy next time.'
    });

  } catch (error) {
    console.error('Error in focus practice API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const focus_category = searchParams.get('focus_category');
    const days = parseInt(searchParams.get('days') || '7');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('focus_practice_sessions')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (focus_category) {
      query = query.eq('focus_category', focus_category);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching focus practice sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch practice sessions' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = {
      total_sessions: sessions?.length || 0,
      total_duration: sessions?.reduce((sum, s) => sum + s.duration_seconds, 0) || 0,
      avg_effectiveness: sessions?.length ? 
        (sessions.reduce((sum, s) => sum + (s.effectiveness_score || 0), 0) / sessions.length) : 0,
      categories_practiced: [...new Set(sessions?.map(s => s.focus_category) || [])],
      improvement_rate: sessions?.filter(s => s.improved).length || 0
    };

    return NextResponse.json({
      sessions,
      summary,
      period: { start: startDate, end: endDate, days }
    });

  } catch (error) {
    console.error('Error in focus practice GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}