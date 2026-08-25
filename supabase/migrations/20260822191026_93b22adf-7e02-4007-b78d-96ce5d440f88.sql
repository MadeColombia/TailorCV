ALTER TABLE public.issue_reports
  ADD COLUMN IF NOT EXISTS screenshot_path text,
  ADD COLUMN IF NOT EXISTS client_info jsonb;

DROP POLICY IF EXISTS "Users upload own issue screenshots" ON storage.objects;
CREATE POLICY "Users upload own issue screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'issue-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users read own issue screenshots" ON storage.objects;
CREATE POLICY "Users read own issue screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'issue-screenshots' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));