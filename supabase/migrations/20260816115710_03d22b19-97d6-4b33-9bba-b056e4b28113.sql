CREATE TABLE public.cv_templates (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_templates TO authenticated;
GRANT ALL ON public.cv_templates TO service_role;
ALTER TABLE public.cv_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own cv template" ON public.cv_templates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.applications ADD COLUMN template_overrides JSONB;