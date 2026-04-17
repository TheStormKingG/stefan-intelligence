-- EIS v24: calendar fallback storage on reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS calendar_events JSONB;
