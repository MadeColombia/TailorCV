CREATE TABLE public.role_targets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  seniority text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_offers text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'en',
  generated_cv jsonb,
  match_result jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_targets TO authenticated;
GRANT ALL ON public.role_targets TO service_role;

ALTER TABLE public.role_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own role targets" ON public.role_targets
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX role_targets_user_id_idx ON public.role_targets (user_id);

CREATE TRIGGER role_targets_set_updated_at
  BEFORE UPDATE ON public.role_targets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();