-- Add event_date column to activities table
-- This stores the actual date when the activity occurred or is planned to occur

ALTER TABLE activities ADD COLUMN IF NOT EXISTS event_date DATE;

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_activities_event_date ON activities(event_date);

-- Add comment for documentation
COMMENT ON COLUMN activities.event_date IS 'The actual or planned date of the activity event';
