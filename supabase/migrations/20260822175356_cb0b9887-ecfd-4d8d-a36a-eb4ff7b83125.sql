ALTER TABLE public.candidate_dossier
  ADD COLUMN IF NOT EXISTS uploaded_context text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS uploaded_name text,
  ADD COLUMN IF NOT EXISTS uploaded_at timestamptz;