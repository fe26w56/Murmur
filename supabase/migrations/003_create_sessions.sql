-- ENUM
CREATE TYPE translation_tier AS ENUM ('standard', 'lite', 'premium');

-- sessions table
CREATE TABLE public.sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_id       UUID REFERENCES public.contexts(id) ON DELETE SET NULL,
  title            TEXT NOT NULL DEFAULT '',
  translation_tier translation_tier NOT NULL DEFAULT 'standard',
  started_at       TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_context_id ON public.sessions(context_id);
