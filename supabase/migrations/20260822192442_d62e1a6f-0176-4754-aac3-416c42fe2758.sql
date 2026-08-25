REVOKE ALL ON FUNCTION public.protect_master_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_master_admin(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_master_admin(uuid) TO service_role;