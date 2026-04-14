-- Drop old table if exists
DROP TABLE IF EXISTS profile_visits;

-- Create unique visitors table
CREATE TABLE IF NOT EXISTS unique_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  visitor_fingerprint TEXT NOT NULL, -- IP + User-Agent hash
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  visit_count INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE unique_visitors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Visitors are viewable by everyone" 
  ON unique_visitors FOR SELECT USING (true);

CREATE POLICY "Anyone can insert visitors" 
  ON unique_visitors FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their own visits" 
  ON unique_visitors FOR UPDATE USING (true);

-- Unique constraint on profile + fingerprint
CREATE UNIQUE INDEX idx_unique_visitor ON unique_visitors(profile_id, visitor_fingerprint);

-- Function to get total unique visitors for a profile
CREATE OR REPLACE FUNCTION get_unique_visitor_count(profile_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO count_result
  FROM unique_visitors
  WHERE profile_id = profile_uuid;
  RETURN count_result;
END;
$$ LANGUAGE plpgsql;
