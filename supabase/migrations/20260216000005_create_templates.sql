-- context_templates table (read-only for users)
create table public.context_templates (
  id text primary key,
  title text not null,
  description text,
  context_type public.context_type not null default 'theme_park',
  park_name text,
  glossary jsonb not null default '[]'::jsonb,
  keywords text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes
create index templates_sort_order_idx on public.context_templates(sort_order);
create index templates_park_name_idx on public.context_templates(park_name);

-- RLS (read-only for authenticated users)
alter table public.context_templates enable row level security;

create policy "Authenticated users can read templates"
  on public.context_templates for select
  to authenticated
  using (true);
