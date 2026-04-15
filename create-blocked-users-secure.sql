-- Secure version - only admins can block/unblock
-- Run this in Supabase SQL Editor

-- First, drop the permissive policies
DROP POLICY IF EXISTS "Allow all authenticated" ON public.blocked_users;
DROP POLICY IF EXISTS "Allow anon select" ON public.blocked_users;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Get email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Get role from user metadata
  SELECT (raw_user_meta_data->>'role') INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_email = 'admin@telecle.com' OR user_role = 'admin';
END;
$$;

-- Policy: Only admins can view blocked users
DROP POLICY IF EXISTS "Admins view blocked" ON public.blocked_users;
CREATE POLICY "Admins view blocked"
  ON public.blocked_users
  FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

-- Policy: Only admins can block users
DROP POLICY IF EXISTS "Admins insert blocked" ON public.blocked_users;
CREATE POLICY "Admins insert blocked"
  ON public.blocked_users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

-- Policy: Only admins can unblock users
DROP POLICY IF EXISTS "Admins delete blocked" ON public.blocked_users;
CREATE POLICY "Admins delete blocked"
  ON public.blocked_users
  FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- Allow anyone to check if blocked (for login page)
DROP POLICY IF EXISTS "Anyone can check blocked" ON public.blocked_users;
CREATE POLICY "Anyone can check blocked"
  ON public.blocked_users
  FOR SELECT
  TO anon
  USING (true);

GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
