-- Simple version - run this in Supabase SQL Editor

-- Create table to track blocked users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_by UUID,
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Admins can view blocked" ON public.blocked_users;
DROP POLICY IF EXISTS "Admins can insert blocked" ON public.blocked_users;
DROP POLICY IF EXISTS "Admins can delete blocked" ON public.blocked_users;
DROP POLICY IF EXISTS "Only admins can view blocked users" ON public.blocked_users;
DROP POLICY IF EXISTS "Only admins can insert blocked users" ON public.blocked_users;
DROP POLICY IF EXISTS "Only admins can delete blocked users" ON public.blocked_users;

-- Allow authenticated users full access (we control access in the app)
CREATE POLICY "Allow all authenticated"
  ON public.blocked_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon to check if blocked (for login validation)
CREATE POLICY "Allow anon select"
  ON public.blocked_users
  FOR SELECT
  TO anon
  USING (true);
