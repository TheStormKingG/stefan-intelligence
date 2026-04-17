-- Add run_number column to reports table
-- Stores the Cowork run number (e.g. Run #23) for dashboard freshness verification
ALTER TABLE reports ADD COLUMN IF NOT EXISTS run_number INTEGER;
