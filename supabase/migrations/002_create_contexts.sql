-- ENUMs
CREATE TYPE context_type AS ENUM ('theme_park', 'museum', 'theater', 'other');
CREATE TYPE context_status AS ENUM ('pending', 'researching', 'ready', 'error');

-- contexts table
CREATE TABLE public.contexts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            context_type NOT NULL DEFAULT 'other',
  title           TEXT NOT NULL,
  source_url      TEXT,
  researched_data JSONB DEFAULT '{}',
  glossary        JSONB DEFAULT '[]',
  keywords        TEXT[] DEFAULT '{}',
  status          context_status NOT NULL DEFAULT 'pending',
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own contexts"
  ON public.contexts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_contexts_user_id ON public.contexts(user_id);
CREATE INDEX idx_contexts_status ON public.contexts(status);

CREATE TRIGGER contexts_updated_at
  BEFORE UPDATE ON public.contexts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
