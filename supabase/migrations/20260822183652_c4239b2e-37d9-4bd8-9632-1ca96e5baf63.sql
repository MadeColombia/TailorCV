-- 1. Application pipeline fields
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS interview_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS previous_stage text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS outcome_feedback text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS next_action_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS offer_summary jsonb,
  ADD COLUMN IF NOT EXISTS salary_expectation text NOT NULL DEFAULT '';

-- 2. Tracking preferences
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS response_window_days integer NOT NULL DEFAULT 21,
  ADD COLUMN IF NOT EXISTS ghost_after_days integer NOT NULL DEFAULT 45,
  ADD COLUMN IF NOT EXISTS archive_retention_days integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS followup_offset_days integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS deep_prep_on_interview boolean NOT NULL DEFAULT true;

-- 3. Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. AI usage log
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
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read usage" ON public.ai_usage;
CREATE POLICY "Admins read usage" ON public.ai_usage
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS ai_usage_created_idx ON public.ai_usage (created_at DESC);

-- 5. Issue reports
CREATE TABLE IF NOT EXISTS public.issue_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL DEFAULT '',
  route text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.issue_reports TO authenticated;
GRANT ALL ON public.issue_reports TO service_role;
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own issues" ON public.issue_reports;
CREATE POLICY "Users manage own issues" ON public.issue_reports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read issues" ON public.issue_reports;
CREATE POLICY "Admins read issues" ON public.issue_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update issues" ON public.issue_reports;
CREATE POLICY "Admins update issues" ON public.issue_reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Feedback / reviews
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
GRANT SELECT, INSERT, UPDATE ON public.feedback_reviews TO authenticated;
GRANT ALL ON public.feedback_reviews TO service_role;
ALTER TABLE public.feedback_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own reviews" ON public.feedback_reviews;
CREATE POLICY "Users manage own reviews" ON public.feedback_reviews
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read reviews" ON public.feedback_reviews;
CREATE POLICY "Admins read reviews" ON public.feedback_reviews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));