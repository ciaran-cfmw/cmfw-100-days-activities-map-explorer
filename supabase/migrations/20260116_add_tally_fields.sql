-- Add Tally reporting fields to activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS pledges_count INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS participant_feedback TEXT;
