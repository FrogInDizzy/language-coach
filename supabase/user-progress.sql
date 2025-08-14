-- User progress tracking tables for XP and streak functionality
-- Run this after the main schema.sql to add progress tracking capabilities

-- 1. User progress table to track XP, levels, and streaks
CREATE TABLE public.user_progress (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  total_xp integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  daily_goal_target integer NOT NULL DEFAULT 3, -- sessions per day
  daily_goal_unit text NOT NULL DEFAULT 'sessions',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Daily activity log to track streaks and daily goals
CREATE TABLE public.daily_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  activity_date date NOT NULL,
  sessions_completed integer NOT NULL DEFAULT 0,
  total_minutes integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- 3. Enable RLS on new tables
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for user_progress
CREATE POLICY "Select own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. RLS policies for daily_activities
CREATE POLICY "Select own activities" ON public.daily_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert own activities" ON public.daily_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own activities" ON public.daily_activities
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_activities TO authenticated;

-- 7. Function to calculate XP based on session performance
CREATE OR REPLACE FUNCTION public.calculate_session_xp(
  duration_seconds integer,
  mistake_count integer,
  mistake_categories text[]
) RETURNS integer AS $$
DECLARE
  base_xp integer := 10;
  duration_bonus integer;
  accuracy_bonus integer;
  category_bonus integer;
  total_xp integer;
BEGIN
  -- Duration bonus: 1 XP per 30 seconds, capped at 10 XP (5 minutes)
  duration_bonus := LEAST(duration_seconds / 30, 10);
  
  -- Accuracy bonus: inverse of mistakes (fewer mistakes = more XP)
  accuracy_bonus := GREATEST(0, 15 - mistake_count);
  
  -- Category diversity bonus: 2 XP per unique mistake category (learning opportunity)
  category_bonus := array_length(mistake_categories, 1) * 2;
  
  total_xp := base_xp + duration_bonus + accuracy_bonus + COALESCE(category_bonus, 0);
  
  -- Minimum 5 XP, maximum 50 XP per session
  RETURN GREATEST(5, LEAST(50, total_xp));
END;
$$ LANGUAGE plpgsql;

-- 8. Function to update user progress after a session
CREATE OR REPLACE FUNCTION public.update_user_progress_after_session(
  p_user_id uuid,
  p_session_date date,
  p_duration_seconds integer,
  p_mistake_count integer,
  p_mistake_categories text[]
) RETURNS json AS $$
DECLARE
  session_xp integer;
  new_total_xp integer;
  new_level integer;
  prev_level integer;
  current_streak integer;
  is_consecutive boolean;
  result json;
BEGIN
  -- Calculate XP for this session
  session_xp := public.calculate_session_xp(p_duration_seconds, p_mistake_count, p_mistake_categories);
  
  -- Insert or update daily activity
  INSERT INTO public.daily_activities (user_id, activity_date, sessions_completed, total_minutes, xp_earned)
  VALUES (p_user_id, p_session_date, 1, ROUND(p_duration_seconds / 60.0), session_xp)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    sessions_completed = daily_activities.sessions_completed + 1,
    total_minutes = daily_activities.total_minutes + ROUND(p_duration_seconds / 60.0),
    xp_earned = daily_activities.xp_earned + session_xp,
    updated_at = now();
  
  -- Get or create user progress record
  INSERT INTO public.user_progress (user_id, total_xp, current_level, last_activity_date)
  VALUES (p_user_id, 0, 1, p_session_date)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current progress
  SELECT total_xp, current_level INTO new_total_xp, prev_level
  FROM public.user_progress WHERE user_id = p_user_id;
  
  -- Add XP and calculate new level
  new_total_xp := new_total_xp + session_xp;
  new_level := public.calculate_level_from_xp(new_total_xp);
  
  -- Calculate streak
  SELECT public.calculate_current_streak(p_user_id, p_session_date) INTO current_streak;
  
  -- Update user progress
  UPDATE public.user_progress SET
    total_xp = new_total_xp,
    current_level = new_level,
    current_streak = current_streak,
    longest_streak = GREATEST(longest_streak, current_streak),
    last_activity_date = p_session_date,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Return result
  SELECT json_build_object(
    'xp_earned', session_xp,
    'total_xp', new_total_xp,
    'level', new_level,
    'level_up', new_level > prev_level,
    'streak', current_streak
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 9. Function to calculate level from total XP
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(total_xp integer)
RETURNS integer AS $$
DECLARE
  level integer := 1;
  cumulative_xp integer := 0;
  level_xp_cost integer;
BEGIN
  WHILE true LOOP
    -- XP required for this level: level * 100 + (level - 1) * 50
    level_xp_cost := (level * 100) + (GREATEST(0, level - 1) * 50);
    
    -- Check if we have enough XP to reach the next level
    IF total_xp < cumulative_xp + level_xp_cost THEN
      EXIT;
    END IF;
    
    cumulative_xp := cumulative_xp + level_xp_cost;
    level := level + 1;
    
    -- Prevent infinite loop
    IF level > 100 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN level;
END;
$$ LANGUAGE plpgsql;

-- 10. Function to calculate current streak
CREATE OR REPLACE FUNCTION public.calculate_current_streak(p_user_id uuid, p_current_date date)
RETURNS integer AS $$
DECLARE
  streak_count integer := 0;
  check_date date := p_current_date;
  has_activity boolean;
BEGIN
  -- Count consecutive days with activity, working backwards from current date
  WHILE true LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.daily_activities 
      WHERE user_id = p_user_id 
      AND activity_date = check_date
      AND sessions_completed > 0
    ) INTO has_activity;
    
    IF NOT has_activity THEN
      -- If this is the first day we're checking and no activity, streak is 0
      IF check_date = p_current_date THEN
        RETURN 0;
      END IF;
      EXIT;
    END IF;
    
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
    
    -- Prevent infinite loop - max reasonable streak
    IF streak_count > 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- 11. Function to get user progress summary
CREATE OR REPLACE FUNCTION public.get_user_progress_summary(p_user_id uuid)
RETURNS json AS $$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  today_activity public.daily_activities%ROWTYPE;
  current_level_xp integer;
  next_level_xp integer;
  result json;
BEGIN
  -- Get user progress
  SELECT * INTO progress_record FROM public.user_progress WHERE user_id = p_user_id;
  
  -- If no progress record, create default
  IF NOT FOUND THEN
    INSERT INTO public.user_progress (user_id) VALUES (p_user_id);
    SELECT * INTO progress_record FROM public.user_progress WHERE user_id = p_user_id;
  END IF;
  
  -- Get today's activity
  SELECT * INTO today_activity 
  FROM public.daily_activities 
  WHERE user_id = p_user_id AND activity_date = CURRENT_DATE;
  
  -- Calculate XP thresholds for current level
  IF progress_record.current_level = 1 THEN
    current_level_xp := 0;
  ELSE
    current_level_xp := ((progress_record.current_level - 1) * 100) + (GREATEST(0, progress_record.current_level - 2) * 50);
  END IF;
  
  next_level_xp := (progress_record.current_level * 100) + (GREATEST(0, progress_record.current_level - 1) * 50);
  
  -- Build result
  SELECT json_build_object(
    'currentXP', progress_record.total_xp,
    'currentLevel', progress_record.current_level,
    'xpForNextLevel', next_level_xp,
    'xpForCurrentLevel', current_level_xp,
    'streak', progress_record.current_streak,
    'longestStreak', progress_record.longest_streak,
    'lastActivity', progress_record.last_activity_date,
    'dailyGoal', json_build_object(
      'target', progress_record.daily_goal_target,
      'completed', COALESCE(today_activity.sessions_completed, 0),
      'unit', progress_record.daily_goal_unit
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;