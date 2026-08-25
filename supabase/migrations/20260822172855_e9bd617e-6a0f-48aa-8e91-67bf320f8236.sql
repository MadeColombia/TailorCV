CREATE TABLE public.candidate_dossier (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_dossier TO authenticated;
GRANT ALL ON public.candidate_dossier TO service_role;

ALTER TABLE public.candidate_dossier ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own dossier"
ON public.candidate_dossier FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER candidate_dossier_updated_at
BEFORE UPDATE ON public.candidate_dossier
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();