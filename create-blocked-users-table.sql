-- Create table to track blocked users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_by UUID REFERENCES auth.users(id),
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage blocked users
CREATE POLICY "Only admins can view blocked users"
  ON public.blocked_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@telecle.com' 
        OR raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Only admins can insert blocked users"
  ON public.blocked_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@telecle.com' 
        OR raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Only admins can delete blocked users"
  ON public.blocked_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@telecle.com' 
        OR raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- Function to check if user is blocked (for login validation)
CREATE OR REPLACE FUNCTION is_user_blocked(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.blocked_users 
    WHERE user_id = check_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION is_user_blocked(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_user_blocked(UUID) TO authenticated;
