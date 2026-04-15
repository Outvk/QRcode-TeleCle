-- Create function for admin to delete users
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user_admin(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if current user is admin
  SELECT (
    au.email = 'admin@telecle.com' 
    OR au.raw_user_meta_data->>'role' = 'admin'
  ) INTO is_admin
  FROM auth.users au
  WHERE au.id = current_user_id;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Delete user's profiles first (cascade will handle related data)
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  -- Delete user from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_admin(UUID) TO authenticated;
