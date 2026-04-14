-- EIS Daily Work Tab — Migration
-- Creates tables for task suggestions, daily tasks, and task completions

-- Table: eis_task_suggestions (written by Cowork daily)
CREATE TABLE IF NOT EXISTS eis_task_suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  task_name     TEXT NOT NULL,
  description   TEXT NOT NULL,
  priority_impact TEXT CHECK (priority_impact IN ('High','Moderate','Low')),
  difficulty    TEXT CHECK (difficulty IN ('Hard','Medium','Easy')),
  execution_tips TEXT,
  rank          INTEGER,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_date ON eis_task_suggestions(date DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_rank ON eis_task_suggestions(date, rank);

-- Table: daily_tasks (written at morning intake)
CREATE TABLE IF NOT EXISTS daily_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  task_number   INTEGER CHECK (task_number IN (1,2)),
  task_name     TEXT NOT NULL,
  task_description TEXT,
  assigned_block INTEGER,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status);

-- Table: task_completions (written at evidence submission)
CREATE TABLE IF NOT EXISTS task_completions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_task_id UUID REFERENCES daily_tasks(id),
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  evidence_items JSONB,
  overflow_state TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_completions_task ON task_completions(daily_task_id);

-- RLS (permissive for single-user app)
ALTER TABLE eis_task_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to eis_task_suggestions" ON eis_task_suggestions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to daily_tasks" ON daily_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to task_completions" ON task_completions FOR ALL USING (true) WITH CHECK (true);
