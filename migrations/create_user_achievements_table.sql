-- Create user_achievements table for storing user achievement data
-- This tracks achievements earned by users through practice sessions

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

-- Create indexes for performance
create index idx_user_achievements_user_id on public.user_achievements(user_id);
create index idx_user_achievements_earned_at on public.user_achievements(earned_at desc);
create index idx_user_achievements_type on public.user_achievements(type);

-- Enable RLS
alter table public.user_achievements enable row level security;

-- Policies for user_achievements
-- Users can only see and manage their own achievements
create policy "Select own achievements" on public.user_achievements
  for select using (auth.uid() = user_id);

create policy "Insert own achievements" on public.user_achievements
  for insert with check (auth.uid() = user_id);

create policy "Update own achievements" on public.user_achievements
  for update using (auth.uid() = user_id);

create policy "Delete own achievements" on public.user_achievements
  for delete using (auth.uid() = user_id);

-- Grant privileges
grant select, insert, update, delete on public.user_achievements to authenticated;