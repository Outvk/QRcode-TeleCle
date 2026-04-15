-- Simple admin check - works with your existing admin setup
-- Run this in Supabase SQL Editor

-- Drop all existing policies first
DROP POLICY IF EXISTS "Admins view blocked" ON public.blocked_users;
DROP POLICY IF EXISTS "Admins insert blocked" ON public.blocked_users;
DROP POLICY IF EXISTS "Admins delete blocked" ON public.blocked_users;
DROP POLICY IF EXISTS "Only admins can view blocked users" ON public.blocked_users;
DROP POLICY IF EXISTS "Only admins can insert blocked users" ON public.blocked_users;
DROP POLICY IF EXISTS "Only admins can delete blocked users" ON public.blocked_users;
DROP POLICY IF EXISTS "Allow all authenticated" ON public.blocked_users;
DROP POLICY IF EXISTS "Allow anon select" ON public.blocked_users;
DROP POLICY IF EXISTS "Anyone can check blocked" ON public.blocked_users;

-- Create policy using a subquery - checks if current user is admin by email or role
CREATE POLICY "Admin only all"
  ON public.blocked_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND (
        au.email = 'admin@telecle.com' 
        OR au.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- Allow anonymous users to SELECT (for login blocking check)
CREATE POLICY "Anon can view"
  ON public.blocked_users
  FOR SELECT
  TO anon
  USING (true);
