-- Patch v20 Migration — Run in Supabase SQL Editor
-- Adds whatsapp_insights column to reports table

ALTER TABLE reports ADD COLUMN IF NOT EXISTS whatsapp_insights TEXT;
