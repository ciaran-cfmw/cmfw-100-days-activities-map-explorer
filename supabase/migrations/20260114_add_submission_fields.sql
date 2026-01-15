-- Add columns for Tally form submissions
-- Supports admin review workflow (pending → approved)

ALTER TABLE activities ADD COLUMN IF NOT EXISTS submitter_name TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS submitter_email TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- Add check constraint separately
DO $$ BEGIN
  ALTER TABLE activities ADD CONSTRAINT activities_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Existing activities should remain approved
UPDATE activities SET status = 'approved' WHERE status IS NULL;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);

-- Update RLS policy for pending submissions (public can only see approved)
DROP POLICY IF EXISTS "Anyone can read activities" ON activities;
CREATE POLICY "Anyone can read approved activities" ON activities 
  FOR SELECT USING (status = 'approved');

-- Authenticated users can see all activities for admin panel
CREATE POLICY "Authenticated users can read all activities" ON activities 
  FOR SELECT TO authenticated USING (true);
