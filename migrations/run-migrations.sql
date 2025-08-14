-- Run Missing Database Migrations
-- Execute this file in your Supabase database to add all missing tables and functions

-- This file combines all the missing tables that were causing API errors:
-- 1. user_achievements
-- 2. focus_practice_sessions  
-- 3. user_progress
-- 4. daily_activities
-- 5. daily_quest_sets
-- 6. daily_quests
-- 7. quest_progress_log
-- 8. streak_shields
-- Plus all required functions and policies

-- Check if tables already exist before creating
DO $$
BEGIN

-- 1. User achievements table
IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_achievements') THEN
  CREATE TABLE public.user_achievements (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(user_id) on delete cascade,
    achievement_id text not null,
    type text not null,
    category text,
    title text not null,
    description text not null,
    icon text,
    value integer,
    percentage decimal(5,2),
    earned_at timestamptz not null default now(),
    viewed_at timestamptz,
    created_at timestamptz default now()
  );
  
  ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Select own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Update own achievements" ON public.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Delete own achievements" ON public.user_achievements
    FOR DELETE USING (auth.uid() = user_id);
    
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO authenticated;
  
  CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
  CREATE INDEX idx_user_achievements_earned_at ON public.user_achievements(earned_at desc);
END IF;

-- 2. Focus practice sessions table
IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'focus_practice_sessions') THEN
  CREATE TABLE public.focus_practice_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(user_id) on delete cascade,
    focus_category public.mistake_category not null,
    session_type text not null default 'micro',
    duration_seconds integer not null,
    mistakes_before integer,
    mistakes_after integer,
    improved boolean not null default false,
    effectiveness_score decimal(3,2),
    created_at timestamptz default now()
  );
  
  ALTER TABLE public.focus_practice_sessions ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Select own focus practice sessions" ON public.focus_practice_sessions
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Insert own focus practice sessions" ON public.focus_practice_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Update own focus practice sessions" ON public.focus_practice_sessions
    FOR UPDATE USING (auth.uid() = user_id);
    
  GRANT SELECT, INSERT, UPDATE ON public.focus_practice_sessions TO authenticated;
END IF;

-- 3. User progress table
IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress') THEN
  CREATE TABLE public.user_progress (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    total_xp integer NOT NULL DEFAULT 0,
    current_level integer NOT NULL DEFAULT 1,
    current_streak integer NOT NULL DEFAULT 0,
    longest_streak integer NOT NULL DEFAULT 0,
    last_activity_date date,
    daily_goal_target integer NOT NULL DEFAULT 3,
    daily_goal_unit text NOT NULL DEFAULT 'sessions',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  
  ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Select own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Update own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);
    
  GRANT SELECT, INSERT, UPDATE ON public.user_progress TO authenticated;
END IF;

-- 4. Daily activities table
IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_activities') THEN
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
  
  ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Select own activities" ON public.daily_activities
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Insert own activities" ON public.daily_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Update own activities" ON public.daily_activities
    FOR UPDATE USING (auth.uid() = user_id);
    
  GRANT SELECT, INSERT, UPDATE ON public.daily_activities TO authenticated;
END IF;

-- Add quest types if they don't exist
DO $$ BEGIN
    CREATE TYPE public.quest_type AS ENUM ('warmup', 'mistake_review', 'vocabulary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.quest_difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure mistake_category enum exists (it should already exist)
DO $$ BEGIN
    CREATE TYPE public.mistake_category AS ENUM (
      'articles',
      'prepositions', 
      'subject_verb_agreement',
      'verb_tense',
      'word_order',
      'run_on_fragment',
      'pluralization',
      'pronouns',
      'comparatives_superlatives',
      'conditionals',
      'modals',
      'filler_words',
      'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Daily quest sets table
IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_quest_sets') THEN
  CREATE TABLE public.daily_quest_sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    quest_date date NOT NULL,
    all_completed boolean NOT NULL DEFAULT false,
    streak_shield_earned boolean NOT NULL DEFAULT false,
    total_xp_available integer NOT NULL DEFAULT 0,
    total_xp_earned integer NOT NULL DEFAULT 0,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, quest_date)
  );
  
  ALTER TABLE public.daily_quest_sets ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Select own quest sets" ON public.daily_quest_sets
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Insert own quest sets" ON public.daily_quest_sets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Update own quest sets" ON public.daily_quest_sets
    FOR UPDATE USING (auth.uid() = user_id);
    
  GRANT SELECT, INSERT, UPDATE ON public.daily_quest_sets TO authenticated;
END IF;

-- 6. Daily quests table
IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_quests') THEN
  CREATE TABLE public.daily_quests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_set_id uuid NOT NULL REFERENCES public.daily_quest_sets(id) ON DELETE CASCADE,
    quest_type public.quest_type NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    target integer NOT NULL,
    progress integer NOT NULL DEFAULT 0,
    completed boolean NOT NULL DEFAULT false,
    xp_reward integer NOT NULL,
    category text,
    difficulty public.quest_difficulty NOT NULL,
    estimated_minutes integer NOT NULL DEFAULT 3,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  
  ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Select own quests" ON public.daily_quests
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.daily_quest_sets dqs
        WHERE dqs.id = daily_quests.quest_set_id 
        AND dqs.user_id = auth.uid()
      )
    );
  CREATE POLICY "Insert own quests" ON public.daily_quests
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.daily_quest_sets dqs
        WHERE dqs.id = daily_quests.quest_set_id 
        AND dqs.user_id = auth.uid()
      )
    );
  CREATE POLICY "Update own quests" ON public.daily_quests
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.daily_quest_sets dqs
        WHERE dqs.id = daily_quests.quest_set_id 
        AND dqs.user_id = auth.uid()
      )
    );
    
  GRANT SELECT, INSERT, UPDATE ON public.daily_quests TO authenticated;
END IF;

-- 7. Quest progress log table
IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quest_progress_log') THEN
  CREATE TABLE public.quest_progress_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_id uuid NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    increment_amount integer NOT NULL,
    reason text,
    session_id uuid,
    created_at timestamptz DEFAULT now()
  );
  
  ALTER TABLE public.quest_progress_log ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Select own quest progress" ON public.quest_progress_log
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Insert own quest progress" ON public.quest_progress_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
  GRANT SELECT, INSERT ON public.quest_progress_log TO authenticated;
END IF;

-- 8. Streak shields table
IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'streak_shields') THEN
  CREATE TABLE public.streak_shields (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    earned_date date NOT NULL,
    streak_length integer NOT NULL,
    xp_bonus integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, earned_date)
  );
  
  ALTER TABLE public.streak_shields ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Select own shields" ON public.streak_shields
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Insert own shields" ON public.streak_shields
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
  GRANT SELECT, INSERT ON public.streak_shields TO authenticated;
END IF;

-- 9. Add practice_sessions column to weekly_goals if it doesn't exist
IF NOT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'weekly_goals' 
  AND column_name = 'practice_sessions'
) THEN
  ALTER TABLE public.weekly_goals 
  ADD COLUMN practice_sessions jsonb DEFAULT '{}';
END IF;

END $$;

-- Create or replace all required functions
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(total_xp integer)
RETURNS integer AS $$
DECLARE
  level integer := 1;
  cumulative_xp integer := 0;
  level_xp_cost integer;
BEGIN
  WHILE true LOOP
    level_xp_cost := (level * 100) + (GREATEST(0, level - 1) * 50);
    IF total_xp < cumulative_xp + level_xp_cost THEN
      EXIT;
    END IF;
    cumulative_xp := cumulative_xp + level_xp_cost;
    level := level + 1;
    IF level > 100 THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN level;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_current_streak(p_user_id uuid, p_current_date date)
RETURNS integer AS $$
DECLARE
  streak_count integer := 0;
  check_date date := p_current_date;
  has_activity boolean;
BEGIN
  WHILE true LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.daily_activities 
      WHERE user_id = p_user_id 
      AND activity_date = check_date
      AND sessions_completed > 0
    ) INTO has_activity;
    
    IF NOT has_activity THEN
      IF check_date = p_current_date THEN
        RETURN 0;
      END IF;
      EXIT;
    END IF;
    
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
    
    IF streak_count > 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_progress_summary(p_user_id uuid)
RETURNS json AS $$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  today_activity public.daily_activities%ROWTYPE;
  current_level_xp integer;
  next_level_xp integer;
  result json;
BEGIN
  SELECT * INTO progress_record FROM public.user_progress WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_progress (user_id) VALUES (p_user_id);
    SELECT * INTO progress_record FROM public.user_progress WHERE user_id = p_user_id;
  END IF;
  
  SELECT * INTO today_activity 
  FROM public.daily_activities 
  WHERE user_id = p_user_id AND activity_date = CURRENT_DATE;
  
  IF progress_record.current_level = 1 THEN
    current_level_xp := 0;
  ELSE
    current_level_xp := ((progress_record.current_level - 1) * 100) + (GREATEST(0, progress_record.current_level - 2) * 50);
  END IF;
  
  next_level_xp := (progress_record.current_level * 100) + (GREATEST(0, progress_record.current_level - 1) * 50);
  
  SELECT json_build_object(
    'currentXP', progress_record.total_xp,
    'currentLevel', progress_record.current_level,
    'xpForNextLevel', next_level_xp,
    'xpForCurrentLevel', current_level_xp,
    'streak', progress_record.current_streak,
    'longestStreak', progress_record.longest_streak,
    'lastActivity', progress_record.last_activity_date,
    'total_sessions', (SELECT COALESCE(SUM(sessions_completed), 0) FROM public.daily_activities WHERE user_id = p_user_id),
    'dailyGoal', json_build_object(
      'target', progress_record.daily_goal_target,
      'completed', COALESCE(today_activity.sessions_completed, 0),
      'unit', progress_record.daily_goal_unit
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;