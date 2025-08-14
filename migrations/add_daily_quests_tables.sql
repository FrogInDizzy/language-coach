-- Daily Quest System Tables
-- Add these tables to support the daily quest functionality

-- 1. Quest types enumeration
CREATE TYPE public.quest_type AS ENUM ('warmup', 'mistake_review', 'vocabulary');
CREATE TYPE public.quest_difficulty AS ENUM ('easy', 'medium', 'hard');

-- 2. Daily quest sets - one per user per day
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

-- 3. Individual daily quests
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

-- 4. Quest progress tracking (for real-time updates)
CREATE TABLE public.quest_progress_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  increment_amount integer NOT NULL,
  reason text,
  session_id uuid, -- Could reference speaking_samples if needed
  created_at timestamptz DEFAULT now()
);

-- 5. Streak shields earned by users
CREATE TABLE public.streak_shields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  earned_date date NOT NULL,
  streak_length integer NOT NULL,
  xp_bonus integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, earned_date)
);

-- 6. Enable RLS on all quest tables
ALTER TABLE public.daily_quest_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_progress_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_shields ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies for daily_quest_sets
CREATE POLICY "Select own quest sets" ON public.daily_quest_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert own quest sets" ON public.daily_quest_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own quest sets" ON public.daily_quest_sets
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. RLS policies for daily_quests
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

-- 9. RLS policies for quest_progress_log
CREATE POLICY "Select own quest progress" ON public.quest_progress_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert own quest progress" ON public.quest_progress_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. RLS policies for streak_shields
CREATE POLICY "Select own shields" ON public.streak_shields
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert own shields" ON public.streak_shields
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.daily_quest_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_quests TO authenticated;
GRANT SELECT, INSERT ON public.quest_progress_log TO authenticated;
GRANT SELECT, INSERT ON public.streak_shields TO authenticated;

-- 12. Function to generate daily quests for a user
CREATE OR REPLACE FUNCTION public.generate_daily_quests_for_user(
  p_user_id uuid,
  p_quest_date date DEFAULT CURRENT_DATE
) RETURNS json AS $$
DECLARE
  quest_set_id uuid;
  user_level integer := 1;
  user_streak integer := 0;
  result json;
BEGIN
  -- Get user progress data
  SELECT current_level, current_streak INTO user_level, user_streak
  FROM public.user_progress WHERE user_id = p_user_id;
  
  -- If no progress record, use defaults
  IF NOT FOUND THEN
    user_level := 1;
    user_streak := 0;
  END IF;
  
  -- Check if quests already exist for this date
  SELECT id INTO quest_set_id
  FROM public.daily_quest_sets
  WHERE user_id = p_user_id AND quest_date = p_quest_date;
  
  -- If quests don't exist, create them
  IF NOT FOUND THEN
    -- Create quest set
    INSERT INTO public.daily_quest_sets (user_id, quest_date, total_xp_available)
    VALUES (p_user_id, p_quest_date, 60) -- Base XP for 3 quests
    RETURNING id INTO quest_set_id;
    
    -- Create individual quests
    -- Quest 1: Warmup
    INSERT INTO public.daily_quests (
      quest_set_id, quest_type, title, description, icon, target, xp_reward, category, difficulty, estimated_minutes
    ) VALUES (
      quest_set_id, 'warmup', '2-Minute Speaking Warm-up', 
      'Get your voice ready with a quick 2-minute speaking session',
      '🌅', 120, 15, 'general', 
      CASE WHEN user_level <= 3 THEN 'easy' WHEN user_level <= 10 THEN 'medium' ELSE 'hard' END,
      2
    );
    
    -- Quest 2: Mistake Review (simplified for now)
    INSERT INTO public.daily_quests (
      quest_set_id, quest_type, title, description, icon, target, xp_reward, category, difficulty, estimated_minutes
    ) VALUES (
      quest_set_id, 'mistake_review', 'Fix 5 Grammar Errors', 
      'Practice avoiding common grammar mistakes in your speech',
      '📰', 5, 25, 'articles', 
      CASE WHEN user_level <= 3 THEN 'easy' WHEN user_level <= 10 THEN 'medium' ELSE 'hard' END,
      4
    );
    
    -- Quest 3: Vocabulary
    INSERT INTO public.daily_quests (
      quest_set_id, quest_type, title, description, icon, target, xp_reward, category, difficulty, estimated_minutes
    ) VALUES (
      quest_set_id, 'vocabulary', 'Learn 3 Food Verbs', 
      'Practice using 3 new words related to food in sentences',
      '🍽️', 3, 20, 'food verbs', 
      CASE WHEN user_level <= 3 THEN 'easy' WHEN user_level <= 10 THEN 'medium' ELSE 'hard' END,
      5
    );
  END IF;
  
  -- Return the quest set with quests
  SELECT json_build_object(
    'date', quest_date,
    'allCompleted', all_completed,
    'streakShieldEarned', streak_shield_earned,
    'totalXpAvailable', total_xp_available,
    'totalXpEarned', total_xp_earned,
    'quests', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'type', quest_type,
          'title', title,
          'description', description,
          'icon', icon,
          'target', target,
          'progress', progress,
          'completed', completed,
          'xpReward', xp_reward,
          'category', category,
          'difficulty', difficulty,
          'estimatedMinutes', estimated_minutes
        )
      )
      FROM public.daily_quests 
      WHERE quest_set_id = dqs.id
    )
  ) INTO result
  FROM public.daily_quest_sets dqs
  WHERE dqs.id = quest_set_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 13. Function to update quest progress
CREATE OR REPLACE FUNCTION public.update_quest_progress(
  p_user_id uuid,
  p_quest_id uuid,
  p_increment integer,
  p_reason text DEFAULT NULL
) RETURNS json AS $$
DECLARE
  quest_record public.daily_quests%ROWTYPE;
  quest_set_id uuid;
  new_progress integer;
  quest_completed boolean;
  result json;
BEGIN
  -- Get the quest and verify ownership
  SELECT dq.* INTO quest_record
  FROM public.daily_quests dq
  JOIN public.daily_quest_sets dqs ON dqs.id = dq.quest_set_id
  WHERE dq.id = p_quest_id AND dqs.user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Quest not found or access denied');
  END IF;
  
  -- Calculate new progress
  new_progress := LEAST(quest_record.progress + p_increment, quest_record.target);
  quest_completed := new_progress >= quest_record.target;
  
  -- Update quest progress
  UPDATE public.daily_quests SET
    progress = new_progress,
    completed = quest_completed,
    completed_at = CASE WHEN quest_completed AND NOT completed THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE id = p_quest_id;
  
  -- Log the progress update
  INSERT INTO public.quest_progress_log (quest_id, user_id, increment_amount, reason)
  VALUES (p_quest_id, p_user_id, p_increment, p_reason);
  
  -- Check if all quests in the set are completed
  SELECT quest_set_id INTO quest_set_id FROM public.daily_quests WHERE id = p_quest_id;
  
  -- Update quest set completion status
  UPDATE public.daily_quest_sets SET
    all_completed = (
      SELECT NOT EXISTS(
        SELECT 1 FROM public.daily_quests 
        WHERE quest_set_id = dqs.quest_set_id AND NOT completed
      )
    ),
    total_xp_earned = (
      SELECT COALESCE(SUM(xp_reward), 0)
      FROM public.daily_quests 
      WHERE quest_set_id = dqs.quest_set_id AND completed
    ),
    completed_at = CASE 
      WHEN all_completed AND completed_at IS NULL THEN now() 
      ELSE completed_at 
    END,
    updated_at = now()
  FROM (SELECT quest_set_id) dqs
  WHERE daily_quest_sets.id = dqs.quest_set_id;
  
  -- Return updated quest data
  SELECT json_build_object(
    'id', id,
    'progress', progress,
    'completed', completed,
    'xpReward', xp_reward
  ) INTO result
  FROM public.daily_quests
  WHERE id = p_quest_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;