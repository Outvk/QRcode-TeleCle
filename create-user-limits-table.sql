-- Create user_limits table for custom daily profile creation limits
CREATE TABLE IF NOT EXISTS user_limits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_profile_limit INTEGER NOT NULL DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can read own limit" ON user_limits;
DROP POLICY IF EXISTS "Only admins can update limits" ON user_limits;
DROP POLICY IF EXISTS "Only admins can insert limits" ON user_limits;

-- Allow users to read their own limit
CREATE POLICY "Users can read own limit" ON user_limits
    FOR SELECT USING (auth.uid() = user_id);

-- Allow all authenticated users to modify (admin check done in app + function)
CREATE POLICY "Allow all authenticated to modify" ON user_limits
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_user_limits_updated_at ON user_limits;

CREATE TRIGGER update_user_limits_updated_at
    BEFORE UPDATE ON user_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_user_limits_updated_at();

-- Create function to update user limit (runs as admin to bypass RLS)
CREATE OR REPLACE FUNCTION update_user_daily_limit(
    target_user_id UUID,
    new_limit INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if calling user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can update user limits';
    END IF;

    -- Validate limit range
    IF new_limit < 1 OR new_limit > 100 THEN
        RAISE EXCEPTION 'Limit must be between 1 and 100';
    END IF;

    -- Insert or update the limit
    INSERT INTO user_limits (user_id, daily_profile_limit, updated_at)
    VALUES (target_user_id, new_limit, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        daily_profile_limit = new_limit,
        updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_daily_limit(UUID, INTEGER) TO authenticated;
