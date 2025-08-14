-- Public schema definition and row‑level security policies for the Language Coach app.
-- Run this file in your Supabase project to set up the database.

-- 1. Custom type for classifying grammar mistakes.
create type public.mistake_category as enum (
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

-- 2. User profile table.  Auth.users is automatically managed by Supabase.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- 3. Daily prompts for speaking practice.
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  level text,
  created_at timestamptz default now()
);

-- 4. Audio samples recorded by a user for a given prompt.
create table public.speaking_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  prompt_id uuid references public.prompts(id),
  audio_url text,         -- signed URL pointing to Supabase storage object
  transcript text,
  duration_seconds integer,
  created_at timestamptz default now()
);

-- 5. Individual grammar mistakes detected within a speaking sample.
create table public.mistakes (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references public.speaking_samples(id) on delete cascade,
  category public.mistake_category not null,
  span jsonb,          -- { start_char: int, end_char: int, text: string }
  explanation text,
  suggestion text,
  severity integer not null check (severity between 1 and 5),
  created_at timestamptz default now()
);

-- 6. Weekly goals for each user summarising focus areas.
create table public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  week_of date not null,
  focus_categories public.mistake_category[] not null,
  narrative text,
  metrics jsonb,
  created_at timestamptz default now(),
  unique (user_id, week_of) -- only one goal per week per user
);

-- 7. Enable Row Level Security (RLS) on all tables.
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.speaking_samples enable row level security;
alter table public.mistakes enable row level security;
alter table public.weekly_goals enable row level security;

-- 8. Policies for profiles
-- Each user can view and edit only their own profile.
create policy "Select own profile" on public.profiles
  for select using (auth.uid() = user_id);
create policy "Update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- 9. Policies for prompts
-- Prompts are public; everyone can read them but only service role can insert/update.
create policy "Select prompts" on public.prompts
  for select using (true);
-- Note: Insert/update policies intentionally omitted; manage prompts via service role.

-- 10. Policies for speaking_samples
-- Users can insert and select their own samples.
create policy "Insert speaking sample" on public.speaking_samples
  for insert with check (auth.uid() = user_id);
create policy "Select own samples" on public.speaking_samples
  for select using (auth.uid() = user_id);
create policy "Update own samples" on public.speaking_samples
  for update using (auth.uid() = user_id);
create policy "Delete own samples" on public.speaking_samples
  for delete using (auth.uid() = user_id);

-- 11. Policies for mistakes
-- Mistakes are associated with a sample; enforce access based on sample’s user.
create policy "Select mistakes for own samples" on public.mistakes
  for select using (
    exists (
      select 1 from public.speaking_samples s
      where s.id = mistakes.sample_id and s.user_id = auth.uid()
    )
  );
create policy "Insert mistakes for own sample" on public.mistakes
  for insert with check (
    exists (
      select 1 from public.speaking_samples s
      where s.id = mistakes.sample_id and s.user_id = auth.uid()
    )
  );
create policy "Delete mistakes for own sample" on public.mistakes
  for delete using (
    exists (
      select 1 from public.speaking_samples s
      where s.id = mistakes.sample_id and s.user_id = auth.uid()
    )
  );

-- 12. Policies for weekly_goals
-- Each user can select, insert and update only their own weekly goals.
create policy "Select own weekly goals" on public.weekly_goals
  for select using (auth.uid() = user_id);
create policy "Insert weekly goals" on public.weekly_goals
  for insert with check (auth.uid() = user_id);
create policy "Update own weekly goals" on public.weekly_goals
  for update using (auth.uid() = user_id);
create policy "Delete own weekly goals" on public.weekly_goals
  for delete using (auth.uid() = user_id);

-- 13. Grant minimal privileges to authenticated users.
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.prompts to authenticated;
grant select, insert, update, delete on public.speaking_samples to authenticated;
grant select, insert, delete on public.mistakes to authenticated;
grant select, insert, update, delete on public.weekly_goals to authenticated;

-- 14. Trigger to automatically create a profile when a user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 15. User achievements table for storing achievement data
create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  achievement_id text not null, -- Unique identifier for the achievement type
  type text not null, -- e.g., 'accuracy', 'streak', 'improvement', 'milestone'
  category text, -- e.g., 'speaking', 'grammar', 'vocabulary'
  title text not null,
  description text not null,
  icon text, -- emoji or icon identifier
  value integer, -- numeric value associated with achievement (e.g., streak count, accuracy percentage)
  percentage decimal(5,2), -- percentage value if applicable (0-100)
  earned_at timestamptz not null default now(),
  viewed_at timestamptz, -- when user acknowledged the achievement
  created_at timestamptz default now()
);

-- 16. Focus practice sessions for tracking targeted practice effectiveness
create table public.focus_practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  focus_category public.mistake_category not null,
  session_type text not null default 'micro', -- 'micro', 'regular', 'drill'
  duration_seconds integer not null,
  mistakes_before integer, -- mistakes in this category before practice
  mistakes_after integer,  -- mistakes in this category after practice
  improved boolean not null default false,
  effectiveness_score decimal(3,2), -- 0.00 to 1.00 representing improvement
  created_at timestamptz default now()
);

-- 17. Enable RLS on new tables
alter table public.user_achievements enable row level security;
alter table public.focus_practice_sessions enable row level security;

-- 18. Create indexes for performance
create index idx_user_achievements_user_id on public.user_achievements(user_id);
create index idx_user_achievements_earned_at on public.user_achievements(earned_at desc);
create index idx_user_achievements_type on public.user_achievements(type);

-- 19. Policies for user_achievements
-- Users can only see and manage their own achievements
create policy "Select own achievements" on public.user_achievements
  for select using (auth.uid() = user_id);
create policy "Insert own achievements" on public.user_achievements
  for insert with check (auth.uid() = user_id);
create policy "Update own achievements" on public.user_achievements
  for update using (auth.uid() = user_id);
create policy "Delete own achievements" on public.user_achievements
  for delete using (auth.uid() = user_id);

-- 20. Policies for focus_practice_sessions
create policy "Select own focus practice sessions" on public.focus_practice_sessions
  for select using (auth.uid() = user_id);
create policy "Insert own focus practice sessions" on public.focus_practice_sessions
  for insert with check (auth.uid() = user_id);
create policy "Update own focus practice sessions" on public.focus_practice_sessions
  for update using (auth.uid() = user_id);

-- 21. Grant privileges on new tables
grant select, insert, update, delete on public.user_achievements to authenticated;
grant select, insert, update on public.focus_practice_sessions to authenticated;

-- 22. Add practice metrics to weekly goals
alter table public.weekly_goals 
add column if not exists practice_sessions jsonb default '{}';

-- 23. User progress table to track XP, levels, and streaks
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

-- 24. Daily activity log to track streaks and daily goals
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

-- 25. Quest types enumeration
CREATE TYPE public.quest_type AS ENUM ('warmup', 'mistake_review', 'vocabulary');
CREATE TYPE public.quest_difficulty AS ENUM ('easy', 'medium', 'hard');

-- 26. Daily quest sets - one per user per day
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

-- 27. Individual daily quests
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

-- 28. Quest progress tracking (for real-time updates)
CREATE TABLE public.quest_progress_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  increment_amount integer NOT NULL,
  reason text,
  session_id uuid, -- Could reference speaking_samples if needed
  created_at timestamptz DEFAULT now()
);

-- 29. Streak shields earned by users
CREATE TABLE public.streak_shields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  earned_date date NOT NULL,
  streak_length integer NOT NULL,
  xp_bonus integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, earned_date)
);

-- 30. Enable RLS on all new tables
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quest_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_progress_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_shields ENABLE ROW LEVEL SECURITY;

-- 31. RLS policies for user_progress
CREATE POLICY "Select own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 32. RLS policies for daily_activities
CREATE POLICY "Select own activities" ON public.daily_activities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own activities" ON public.daily_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own activities" ON public.daily_activities
  FOR UPDATE USING (auth.uid() = user_id);

-- 33. RLS policies for daily_quest_sets
CREATE POLICY "Select own quest sets" ON public.daily_quest_sets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own quest sets" ON public.daily_quest_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own quest sets" ON public.daily_quest_sets
  FOR UPDATE USING (auth.uid() = user_id);

-- 34. RLS policies for daily_quests
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

-- 35. RLS policies for quest_progress_log
CREATE POLICY "Select own quest progress" ON public.quest_progress_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own quest progress" ON public.quest_progress_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 36. RLS policies for streak_shields
CREATE POLICY "Select own shields" ON public.streak_shields
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own shields" ON public.streak_shields
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 37. Grant permissions on all new tables
GRANT SELECT, INSERT, UPDATE ON public.user_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_quest_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_quests TO authenticated;
GRANT SELECT, INSERT ON public.quest_progress_log TO authenticated;
GRANT SELECT, INSERT ON public.streak_shields TO authenticated;

-- 38. Function to calculate level from total XP
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

-- 39. Function to calculate current streak
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

-- 40. Function to calculate XP based on session performance
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

-- 41. Function to get user progress summary
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
