-- Migration: Add organizer display toggle and event end date
-- Date: 2026-01-14

-- Add toggle for organizer visibility on public map
ALTER TABLE activities ADD COLUMN IF NOT EXISTS show_organizer BOOLEAN DEFAULT false;

-- Add end date for multi-day events
ALTER TABLE activities ADD COLUMN IF NOT EXISTS event_end_date DATE;
