-- Create visitor counts table
CREATE TABLE IF NOT EXISTS profile_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  visit_count INTEGER DEFAULT 0,
  last_visit_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_visits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public reads
CREATE POLICY "Profile visits are viewable by everyone" 
  ON profile_visits FOR SELECT 
  USING (true);

-- Create policy to allow inserts
CREATE POLICY "Anyone can increment visit count" 
  ON profile_visits FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow updates
CREATE POLICY "Anyone can update visit count" 
  ON profile_visits FOR UPDATE 
  USING (true);

-- Create function to auto-update last_visit_at
CREATE OR REPLACE FUNCTION update_last_visit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_visit_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_visit_timestamp ON profile_visits;
CREATE TRIGGER update_visit_timestamp
  BEFORE UPDATE ON profile_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_last_visit();
