-- Create daily visits table for tracking visitors per day
CREATE TABLE IF NOT EXISTS daily_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unique_visitors INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, visit_date)
);

-- Enable RLS
ALTER TABLE daily_visits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Daily visits are viewable by everyone" 
  ON daily_visits FOR SELECT USING (true);

CREATE POLICY "Anyone can insert daily visits" 
  ON daily_visits FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update daily visits" 
  ON daily_visits FOR UPDATE USING (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_daily_visit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_daily_visit_timestamp ON daily_visits;
CREATE TRIGGER update_daily_visit_timestamp
  BEFORE UPDATE ON daily_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_visit_timestamp();

-- Index for faster queries
CREATE INDEX idx_daily_visits_profile_date ON daily_visits(profile_id, visit_date DESC);
