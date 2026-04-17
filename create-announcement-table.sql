-- Create table for system-wide announcements
CREATE TABLE IF NOT EXISTS system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read active announcements
CREATE POLICY "Anyone can read active announcements" 
  ON system_announcements FOR SELECT 
  USING (active = true);

-- Admins can read all announcements (role-based only)
DROP POLICY IF EXISTS "Admins can read all announcements" ON system_announcements;
CREATE POLICY "Admins can read all announcements"
  ON system_announcements FOR SELECT 
  TO authenticated 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Admins can insert/update announcements (role-based only)
DROP POLICY IF EXISTS "Admins can manage announcements" ON system_announcements;
CREATE POLICY "Admins can manage announcements"
  ON system_announcements FOR ALL 
  TO authenticated 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_announcement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_announcement_timestamp ON system_announcements;
CREATE TRIGGER update_announcement_timestamp
  BEFORE UPDATE ON system_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcement_timestamp();

-- Insert default empty announcement (if table is empty)
INSERT INTO system_announcements (message, active, type)
SELECT '', false, 'info'
WHERE NOT EXISTS (SELECT 1 FROM system_announcements);
