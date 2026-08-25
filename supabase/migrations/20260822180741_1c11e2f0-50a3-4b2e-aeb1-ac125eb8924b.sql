CREATE TABLE public.user_settings (
  user_id UUID NOT NULL PRIMARY KEY,
  ui_language TEXT NOT NULL DEFAULT 'en',
  cv_languages TEXT[] NOT NULL DEFAULT ARRAY['en']::text[],
  default_app_language TEXT NOT NULL DEFAULT 'en',
  cover_letter_tone TEXT NOT NULL DEFAULT 'professional',
  interview_depth TEXT NOT NULL DEFAULT 'standard',
  auto_delete_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_delete_months INTEGER NOT NULL DEFAULT 12,
  session_message_cap INTEGER NOT NULL DEFAULT 30,
  email_context_expiry BOOLEAN NOT NULL DEFAULT true,
  email_new_features BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own settings"
  ON public.user_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();