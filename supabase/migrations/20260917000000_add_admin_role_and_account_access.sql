-- Add a controlled administrator role and account access flag.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Roles are created by the signup trigger or by an administrator, never by clients.
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can manage employee permissions" ON public.employee_permissions;
CREATE POLICY "Admins can manage employee permissions"
  ON public.employee_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Provision an administrator only after creating the account in Supabase Auth:
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = '<auth-user-id>';