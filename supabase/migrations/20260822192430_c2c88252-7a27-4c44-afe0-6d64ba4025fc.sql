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

REVOKE ALL ON FUNCTION public.is_master_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_master_admin(uuid) TO authenticated, service_role;

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

DROP TRIGGER IF EXISTS protect_master_admin ON public.user_roles;
CREATE TRIGGER protect_master_admin
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_master_admin();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE lower(email) = 'monnameestethan@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;