CREATE TABLE public.candidate_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  question TEXT NOT NULL DEFAULT '',
  answer TEXT NOT NULL,
  source_application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_knowledge TO authenticated;
GRANT ALL ON public.candidate_knowledge TO service_role;
ALTER TABLE public.candidate_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own knowledge" ON public.candidate_knowledge FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX candidate_knowledge_user_idx ON public.candidate_knowledge(user_id, created_at DESC);