-- Add external link fields to activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS link_text TEXT DEFAULT 'Learn More';
