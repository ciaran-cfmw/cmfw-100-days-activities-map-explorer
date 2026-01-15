-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('School Pledge', 'Community Awareness', 'Faith Leader Action', 'Gov Engagement')),
  coordinates FLOAT[] NOT NULL, -- [longitude, latitude]
  description TEXT CHECK (char_length(description) <= 500),
  body TEXT,
  image TEXT,
  day INTEGER CHECK (day BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create countries table
CREATE TABLE countries (
  id TEXT PRIMARY KEY, -- GeoJSON country name
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Mobilizing' CHECK (status IN ('Mobilizing', 'Active', 'Completed')),
  active_schools INTEGER DEFAULT 0,
  total_pledges INTEGER DEFAULT 0,
  highlights TEXT[], -- Array of strings
  body TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Public read access for both tables
CREATE POLICY "Anyone can read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Anyone can read countries" ON countries FOR SELECT USING (true);

-- Authenticated users can modify activities
CREATE POLICY "Authenticated users can insert activities" ON activities 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update activities" ON activities 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete activities" ON activities 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Only admins can modify countries
CREATE POLICY "Authenticated users can update countries" ON countries 
  FOR UPDATE USING (auth.role() = 'authenticated');
