ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS link_items jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD PRIMARY KEY (user_id, language);

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS offer_url text NOT NULL DEFAULT '';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, language, full_name, email)
  VALUES (NEW.id, 'en', COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (user_id, language) DO NOTHING;
  RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;