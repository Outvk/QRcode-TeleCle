-- Rate limiting table and functions
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP address or user ID
    action TEXT NOT NULL, -- 'login', 'profile_create', etc.
    attempt_count INTEGER DEFAULT 1,
    first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, action)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON rate_limits(identifier, action);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record RECORD;
    v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Delete old records outside the window
    DELETE FROM rate_limits 
    WHERE identifier = p_identifier 
    AND action = p_action 
    AND first_attempt_at < v_window_start;
    
    -- Try to get existing record
    SELECT * INTO v_record 
    FROM rate_limits 
    WHERE identifier = p_identifier 
    AND action = p_action;
    
    IF NOT FOUND THEN
        -- First attempt, create record
        INSERT INTO rate_limits (identifier, action, attempt_count)
        VALUES (p_identifier, p_action, 1);
        RETURN TRUE;
    END IF;
    
    -- Check if limit exceeded
    IF v_record.attempt_count >= p_max_attempts THEN
        RETURN FALSE;
    END IF;
    
    -- Increment counter
    UPDATE rate_limits 
    SET attempt_count = attempt_count + 1,
        last_attempt_at = NOW()
    WHERE id = v_record.id;
    
    RETURN TRUE;
END;
$$;

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can modify
CREATE POLICY "Service role only" ON rate_limits
    FOR ALL USING (false);

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO anon;
