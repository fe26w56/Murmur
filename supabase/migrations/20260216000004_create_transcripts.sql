-- transcripts table
create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  sequence_number int not null,
  original_text text not null,
  translated_text text not null,
  timestamp_ms int not null,
  translation_tier public.translation_tier not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index transcripts_session_id_idx on public.transcripts(session_id);
create index transcripts_session_seq_idx on public.transcripts(session_id, sequence_number);

-- RLS
alter table public.transcripts enable row level security;

create policy "Users can read own transcripts"
  on public.transcripts for select
  using (
    exists (
      select 1 from public.sessions
      where sessions.id = transcripts.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can create own transcripts"
  on public.transcripts for insert
  with check (
    exists (
      select 1 from public.sessions
      where sessions.id = transcripts.session_id
      and sessions.user_id = auth.uid()
    )
  );
