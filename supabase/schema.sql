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
