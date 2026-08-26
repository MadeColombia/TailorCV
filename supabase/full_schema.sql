-- ==============================================================================
-- TailorCV Complete Database Schema & Security Policies for Supabase
-- Run this entire script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Extensions & Custom Types
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Timestamp update helper function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ==============================================================================
-- 3. Core Tables Definition
-- ==============================================================================

-- Profiles (Master CV per user per language)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid NOT NULL,
  language text NOT NULL DEFAULT 'en',
  full_name text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  links text NOT NULL DEFAULT '',
  link_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text NOT NULL DEFAULT '',
  experiences jsonb NOT NULL DEFAULT '[]'::jsonb,
  education jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  photo_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, language)
);

-- User Settings (Preferences, AI tone, retention, etc.)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY,
  ui_language text NOT NULL DEFAULT 'en',
  default_app_language text NOT NULL DEFAULT 'en',
  cv_languages text[] NOT NULL DEFAULT ARRAY['en']::text[],
  cover_letter_tone text NOT NULL DEFAULT 'enthusiastic and professional',
  interview_depth text NOT NULL DEFAULT 'moderate',
  session_message_cap integer NOT NULL DEFAULT 30,
  auto_delete_enabled boolean NOT NULL DEFAULT false,
  auto_delete_months integer NOT NULL DEFAULT 12,
  email_new_features boolean NOT NULL DEFAULT true,
  email_context_expiry boolean NOT NULL DEFAULT true,
  response_window_days integer NOT NULL DEFAULT 21,
  ghost_after_days integer NOT NULL DEFAULT 45,
  archive_retention_days integer NOT NULL DEFAULT 30,
  followup_offset_days integer NOT NULL DEFAULT 10,
  deep_prep_on_interview boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Visual CV Templates
CREATE TABLE IF NOT EXISTS public.cv_templates (
  user_id uuid PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Applications (Job search tracking, tailored CVs, prep, outcome)
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company text NOT NULL DEFAULT '',
  role_title text NOT NULL DEFAULT '',
  offer_text text NOT NULL DEFAULT '',
  offer_url text NOT NULL DEFAULT '',
  offer_summary jsonb,
  salary_expectation text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'draft',
  stage text NOT NULL DEFAULT 'draft',
  previous_stage text NOT NULL DEFAULT 'draft',
  tailored_cv jsonb,
  cover_letter text NOT NULL DEFAULT '',
  interview_prep jsonb,
  match_result jsonb,
  outcome_feedback text NOT NULL DEFAULT '',
  template_overrides jsonb,
  applied_at timestamptz,
  interview_at timestamptz,
  next_action_at timestamptz,
  last_followup_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Application Chat Messages
CREATE TABLE IF NOT EXISTS public.application_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Role Targets (Broader career target CV generator)
CREATE TABLE IF NOT EXISTS public.role_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  seniority text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_offers text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'en',
  generated_cv jsonb,
  match_result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Candidate Knowledge (Q&A facts learned across applications)
CREATE TABLE IF NOT EXISTS public.candidate_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  source_application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Candidate Dossier (Encrypted living career context)
CREATE TABLE IF NOT EXISTS public.candidate_dossier (
  user_id uuid PRIMARY KEY,
  content text NOT NULL DEFAULT '',
  uploaded_context text NOT NULL DEFAULT '',
  uploaded_name text,
  uploaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User Roles (Separate role assignments)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- AI Usage Telemetry
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  feature text NOT NULL DEFAULT 'chat',
  model text NOT NULL DEFAULT '',
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Issue Reports
CREATE TABLE IF NOT EXISTS public.issue_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL DEFAULT '',
  route text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  screenshot_path text,
  client_info jsonb,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Feedback Reviews
CREATE TABLE IF NOT EXISTS public.feedback_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rating integer NOT NULL DEFAULT 0,
  message text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'general',
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  may_quote boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. Triggers & Updated At Handlers
-- ==============================================================================

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS cv_templates_updated_at ON public.cv_templates;
CREATE TRIGGER cv_templates_updated_at BEFORE UPDATE ON public.cv_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS applications_updated_at ON public.applications;
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS role_targets_updated_at ON public.role_targets;
CREATE TRIGGER role_targets_updated_at BEFORE UPDATE ON public.role_targets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS candidate_dossier_updated_at ON public.candidate_dossier;
CREATE TRIGGER candidate_dossier_updated_at BEFORE UPDATE ON public.candidate_dossier FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 5. Role Verification & Master Admin Protection
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND lower(email) = 'monnameestethan@gmail.com'
  )
$$;

REVOKE ALL ON FUNCTION public.is_master_admin(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_master_admin(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.protect_master_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'admin' AND public.is_master_admin(OLD.user_id) THEN
      RAISE EXCEPTION 'The master admin role cannot be removed.';
    END IF;
    RETURN OLD;
  ELSE
    IF OLD.role = 'admin' AND public.is_master_admin(OLD.user_id)
       AND (NEW.role <> 'admin' OR NEW.user_id <> OLD.user_id) THEN
      RAISE EXCEPTION 'The master admin role cannot be changed.';
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_master_admin() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_master_admin ON public.user_roles;
CREATE TRIGGER protect_master_admin
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_master_admin();

-- ==============================================================================
-- 6. Row Level Security (RLS) & Permissions
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_dossier ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reviews ENABLE ROW LEVEL SECURITY;

-- Force RLS on user-isolated tables
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cv_templates FORCE ROW LEVEL SECURITY;
ALTER TABLE public.applications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.application_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.role_targets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_knowledge FORCE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_dossier FORCE ROW LEVEL SECURITY;

-- Revoke all table access from anonymous users
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.user_settings FROM anon;
REVOKE ALL ON TABLE public.cv_templates FROM anon;
REVOKE ALL ON TABLE public.applications FROM anon;
REVOKE ALL ON TABLE public.application_messages FROM anon;
REVOKE ALL ON TABLE public.role_targets FROM anon;
REVOKE ALL ON TABLE public.candidate_knowledge FROM anon;
REVOKE ALL ON TABLE public.candidate_dossier FROM anon;
REVOKE ALL ON TABLE public.user_roles FROM anon;
REVOKE ALL ON TABLE public.ai_usage FROM anon;
REVOKE ALL ON TABLE public.issue_reports FROM anon;
REVOKE ALL ON TABLE public.feedback_reviews FROM anon;

-- Grant permissions to authenticated and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_targets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_knowledge TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_dossier TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.issue_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.feedback_reviews TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Policies for Profiles
DROP POLICY IF EXISTS "Users manage own profiles" ON public.profiles;
CREATE POLICY "Users manage own profiles" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for User Settings
DROP POLICY IF EXISTS "Users manage own settings" ON public.user_settings;
CREATE POLICY "Users manage own settings" ON public.user_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for CV Templates
DROP POLICY IF EXISTS "Users manage own templates" ON public.cv_templates;
CREATE POLICY "Users manage own templates" ON public.cv_templates
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Applications
DROP POLICY IF EXISTS "Users manage own applications" ON public.applications;
CREATE POLICY "Users manage own applications" ON public.applications
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Application Messages
DROP POLICY IF EXISTS "Users manage own messages" ON public.application_messages;
CREATE POLICY "Users manage own messages" ON public.application_messages
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Role Targets
DROP POLICY IF EXISTS "Users manage own role targets" ON public.role_targets;
CREATE POLICY "Users manage own role targets" ON public.role_targets
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Candidate Knowledge
DROP POLICY IF EXISTS "Users manage own candidate knowledge" ON public.candidate_knowledge;
CREATE POLICY "Users manage own candidate knowledge" ON public.candidate_knowledge
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Candidate Dossier
DROP POLICY IF EXISTS "Users manage own dossier" ON public.candidate_dossier;
CREATE POLICY "Users manage own dossier" ON public.candidate_dossier
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for User Roles
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Policies for AI Usage
DROP POLICY IF EXISTS "Admins read usage" ON public.ai_usage;
CREATE POLICY "Admins read usage" ON public.ai_usage
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Policies for Issue Reports
DROP POLICY IF EXISTS "Users manage own issues" ON public.issue_reports;
CREATE POLICY "Users manage own issues" ON public.issue_reports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read issues" ON public.issue_reports;
CREATE POLICY "Admins read issues" ON public.issue_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update issues" ON public.issue_reports;
CREATE POLICY "Admins update issues" ON public.issue_reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for Feedback Reviews
DROP POLICY IF EXISTS "Users manage own reviews" ON public.feedback_reviews;
CREATE POLICY "Users manage own reviews" ON public.feedback_reviews
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read reviews" ON public.feedback_reviews;
CREATE POLICY "Admins read reviews" ON public.feedback_reviews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ==============================================================================
-- 7. Storage Bucket & Storage RLS
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-screenshots', 'issue-screenshots', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own issue screenshots" ON storage.objects;
CREATE POLICY "Users upload own issue screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'issue-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users read own issue screenshots" ON storage.objects;
CREATE POLICY "Users read own issue screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'issue-screenshots' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));

-- Automatically assign admin role to master admin if user already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE lower(email) = 'monnameestethan@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
