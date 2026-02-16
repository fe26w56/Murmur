-- ENUM
create type public.translation_tier as enum ('lite', 'standard', 'premium');

-- sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  context_id uuid references public.contexts(id) on delete set null,
  title text not null,
  translation_tier public.translation_tier not null default 'standard',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds int,
  created_at timestamptz not null default now()
);

-- Indexes
create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_context_id_idx on public.sessions(context_id);
create index sessions_started_at_idx on public.sessions(started_at desc);

-- RLS
alter table public.sessions enable row level security;

create policy "Users can read own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can create own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);
