-- Create function to fetch all users (for admin dashboard)
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admin users or service role to call this
  IF (SELECT current_user) != 'supabase_admin' 
     AND (SELECT current_user) != 'postgres'
     AND NOT EXISTS (
       SELECT 1 FROM auth.users 
       WHERE id = auth.uid() 
       AND (
         email = 'admin@telecle.com' 
         OR raw_user_meta_data->>'role' = 'admin'
       )
     ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY 
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    au.raw_user_meta_data
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

-- Alternative: If the above doesn't work, try a simpler version without access control
-- CREATE OR REPLACE FUNCTION get_all_users()
-- RETURNS TABLE (
--   id uuid,
--   email text,
--   created_at timestamptz,
--   last_sign_in_at timestamptz,
--   raw_user_meta_data jsonb
-- )
-- LANGUAGE sql
-- SECURITY DEFINER
-- AS $$
--   SELECT 
--     au.id,
--     au.email,
--     au.created_at,
--     au.last_sign_in_at,
--     au.raw_user_meta_data
--   FROM auth.users au
--   ORDER BY au.created_at DESC;
-- $$;
