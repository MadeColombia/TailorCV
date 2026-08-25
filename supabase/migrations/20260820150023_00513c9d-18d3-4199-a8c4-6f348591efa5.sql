REVOKE ALL ON public.profiles, public.applications, public.application_messages, public.candidate_knowledge, public.cv_templates, public.role_targets FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.applications, public.application_messages, public.candidate_knowledge, public.cv_templates, public.role_targets TO authenticated;
GRANT ALL ON public.profiles, public.applications, public.application_messages, public.candidate_knowledge, public.cv_templates, public.role_targets TO service_role;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.applications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.application_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_knowledge FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cv_templates FORCE ROW LEVEL SECURITY;
ALTER TABLE public.role_targets FORCE ROW LEVEL SECURITY;