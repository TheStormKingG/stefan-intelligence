-- Executive Intelligence System — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  raw_content TEXT,
  summary TEXT,
  generated_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT now(),
  coaching_insight TEXT,
  performance_score DECIMAL(4,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('critical','high','medium','low')) NOT NULL,
  category TEXT,
  mitigation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('critical','high','medium','low')) NOT NULL,
  category TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  verification_status TEXT CHECK (verification_status IN ('pending_verification','verified','failed_verification','not_applicable')) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('revenue','operational','strategic','growth')) NOT NULL,
  status TEXT CHECK (status IN ('on_track','at_risk','behind','completed')) DEFAULT 'on_track',
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  change_direction TEXT CHECK (change_direction IN ('up','down','stable')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_risks_report ON risks(report_id);
CREATE INDEX IF NOT EXISTS idx_risks_severity ON risks(severity);
CREATE INDEX IF NOT EXISTS idx_tasks_report ON tasks(report_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_objectives_report ON objectives(report_id);
CREATE INDEX IF NOT EXISTS idx_objectives_status ON objectives(status);
CREATE INDEX IF NOT EXISTS idx_metrics_report ON metrics(report_id);
CREATE INDEX IF NOT EXISTS idx_tasks_verification ON tasks(verification_status) WHERE verification_status IS NOT NULL;

CREATE TABLE IF NOT EXISTS financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense')),
  date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GYD',
  description TEXT NOT NULL,
  category TEXT,
  source TEXT,
  payslip_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_date ON financial_entries (date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_report ON financial_entries (report_id);
CREATE INDEX IF NOT EXISTS idx_financial_type ON financial_entries (entry_type);

-- Row Level Security (permissive for single-user app)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS balance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  account_name TEXT NOT NULL,
  current_balance DECIMAL(14,2) NOT NULL,
  available_balance DECIMAL(14,2),
  currency TEXT NOT NULL DEFAULT 'GYD',
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_date ON balance_snapshots (snapshot_date DESC);
ALTER TABLE balance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to reports" ON reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to risks" ON risks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to objectives" ON objectives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to metrics" ON metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to financial_entries" ON financial_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to balance_snapshots" ON balance_snapshots FOR ALL USING (true) WITH CHECK (true);
