-- Add focus area practice tracking
-- This tracks the effectiveness of targeted practice sessions for specific mistake categories

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

-- Add practice metrics to weekly goals
alter table public.weekly_goals 
add column if not exists practice_sessions jsonb default '{}';

-- Enable RLS
alter table public.focus_practice_sessions enable row level security;

-- Policies for focus_practice_sessions
create policy "Select own focus practice sessions" on public.focus_practice_sessions
  for select using (auth.uid() = user_id);
create policy "Insert own focus practice sessions" on public.focus_practice_sessions
  for insert with check (auth.uid() = user_id);
create policy "Update own focus practice sessions" on public.focus_practice_sessions
  for update using (auth.uid() = user_id);

-- Grant privileges
grant select, insert, update on public.focus_practice_sessions to authenticated;