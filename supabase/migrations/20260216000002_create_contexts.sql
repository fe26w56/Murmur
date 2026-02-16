-- ENUMs
create type public.context_type as enum ('theme_park', 'museum', 'theater', 'other');
create type public.context_status as enum ('pending', 'ready', 'researching', 'error');

-- contexts table
create table public.contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  context_type public.context_type not null default 'other',
  status public.context_status not null default 'pending',
  source_url text,
  description text,
  glossary jsonb not null default '[]'::jsonb,
  keywords text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  template_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger contexts_updated_at
  before update on public.contexts
  for each row execute function public.update_updated_at();

-- Indexes
create index contexts_user_id_idx on public.contexts(user_id);
create index contexts_template_id_idx on public.contexts(template_id);

-- RLS
alter table public.contexts enable row level security;

create policy "Users can read own contexts"
  on public.contexts for select
  using (auth.uid() = user_id);

create policy "Users can create own contexts"
  on public.contexts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own contexts"
  on public.contexts for update
  using (auth.uid() = user_id);

create policy "Users can delete own contexts"
  on public.contexts for delete
  using (auth.uid() = user_id);
