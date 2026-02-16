-- context_templates table (read-only, public access)
CREATE TABLE public.context_templates (
  id              TEXT PRIMARY KEY,
  type            context_type NOT NULL,
  park            TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  researched_data JSONB NOT NULL DEFAULT '{}',
  glossary        JSONB NOT NULL DEFAULT '[]',
  keywords        TEXT[] NOT NULL DEFAULT '{}',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.context_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read templates"
  ON public.context_templates FOR SELECT
  USING (true);

CREATE INDEX idx_templates_park ON public.context_templates(park);
CREATE INDEX idx_templates_type ON public.context_templates(type);
