-- transcripts table
CREATE TABLE public.transcripts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  original_text   TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  confidence      REAL,
  timestamp_ms    INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transcripts"
  ON public.transcripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = transcripts.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transcripts"
  ON public.transcripts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = transcripts.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE INDEX idx_transcripts_session_id ON public.transcripts(session_id);
CREATE INDEX idx_transcripts_timestamp ON public.transcripts(session_id, timestamp_ms);
