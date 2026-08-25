CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  links TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  experiences JSONB NOT NULL DEFAULT '[]'::jsonb,
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  role_title TEXT NOT NULL DEFAULT '',
  offer_text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  tailored_cv JSONB,
  cover_letter TEXT NOT NULL DEFAULT '',
  match_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own applications" ON public.applications FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX applications_user_idx ON public.applications (user_id, created_at DESC);

CREATE TABLE public.application_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_messages TO authenticated;
GRANT ALL ON public.application_messages TO service_role;
ALTER TABLE public.application_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON public.application_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX application_messages_app_idx ON public.application_messages (application_id, created_at);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();