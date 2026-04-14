export type Severity = "critical" | "high" | "medium" | "low";
export type Priority = "critical" | "high" | "medium" | "low";
export type ObjectiveType = "revenue" | "operational" | "strategic" | "growth";
export type ObjectiveStatus = "on_track" | "at_risk" | "behind" | "completed";
export type ChangeDirection = "up" | "down" | "stable";
export type VerificationStatus = "pending_verification" | "verified" | "failed_verification" | "not_applicable";

export interface Report {
  id: string;
  report_date: string;
  raw_content: string | null;
  summary: string | null;
  generated_at: string | null;
  ingested_at: string;
  coaching_insight: string | null;
  performance_score: number | null;
  whatsapp_insights: string | null;
  created_at: string;
}

export interface Risk {
  id: string;
  report_id: string;
  title: string;
  description: string | null;
  severity: Severity;
  category: string | null;
  mitigation: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  report_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  verification_status: VerificationStatus | null;
  created_at: string;
}

export interface Objective {
  id: string;
  report_id: string;
  title: string;
  description: string | null;
  type: ObjectiveType;
  status: ObjectiveStatus;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Metric {
  id: string;
  report_id: string;
  label: string;
  value: number;
  unit: string | null;
  change_direction: ChangeDirection | null;
  created_at: string;
}

export type EntryType = "income" | "expense";

export interface PayslipAllowance {
  name: string;
  amount: number;
}

export interface PayslipDeduction {
  name: string;
  amount: number;
}

export interface PayslipData {
  employer: string;
  pay_period: string;
  basic_pay: number;
  allowances: PayslipAllowance[];
  gross_pay: number;
  deductions: PayslipDeduction[];
  total_deductions: number;
  net_pay: number;
}

export interface FinancialEntry {
  id: string;
  report_id: string;
  entry_type: EntryType;
  date: string;
  amount: number;
  currency: string;
  description: string;
  category: string | null;
  source: string | null;
  payslip_data: PayslipData | null;
  created_at: string;
}

export interface ReportWithChildren extends Report {
  risks: Risk[];
  tasks: Task[];
  objectives: Objective[];
  metrics: Metric[];
}

export interface BalanceSnapshot {
  id: string;
  snapshot_date: string;
  account_name: string;
  current_balance: number;
  available_balance: number | null;
  currency: string;
  source: string | null;
  notes: string | null;
  created_at: string;
}

export interface BankBalanceData {
  snapshots: BalanceSnapshot[];
  last_updated: string | null;
}

export interface IngestPayload {
  report_date: string;
  raw_content?: string;
  summary?: string;
  generated_at?: string;
  coaching_insight?: string;
  performance_score?: number;
  risks: Omit<Risk, "id" | "report_id" | "created_at">[];
  tasks: (Omit<Task, "id" | "report_id" | "completed" | "completed_at" | "verification_status" | "created_at"> & {
    completed?: boolean;
    completed_at?: string | null;
    verification_status?: VerificationStatus | null;
  })[];
  objectives: Omit<Objective, "id" | "report_id" | "created_at">[];
  metrics: Omit<Metric, "id" | "report_id" | "created_at">[];
  financial_entries?: Omit<FinancialEntry, "id" | "report_id" | "created_at">[];
  balance_snapshots?: Omit<BalanceSnapshot, "id" | "created_at">[];
}

export interface CategoryBreakdown {
  category: string;
  total_gyd: number;
  total_usd: number;
  percentage: number;
}

export interface FinancialSummary {
  total_income_gyd: number;
  total_expenses_gyd: number;
  total_expenses_usd: number;
  net_balance_gyd: number;
  avg_daily_spend_gyd: number;
  avg_weekly_spend_gyd: number;
  avg_monthly_spend_gyd: number;
  top_categories: CategoryBreakdown[];
  period_days: number;
  transaction_count: number;
  first_transaction_date: string | null;
  last_transaction_date: string | null;
}

export interface FinancialApiResponse {
  entries: FinancialEntry[];
  summary: FinancialSummary;
  financial_tip: string;
  bank_balance: BankBalanceData;
}

export interface ComputedMetrics {
  activeTasksCount: number;
  criticalRiskCount: number;
  overdueObjectivesCount: number;
}

/** Flexible payload accepted by both /api/reports and /api/ingest */
export interface UnifiedIngestPayload {
  // Date — accepts either field name
  date?: string;
  report_date?: string;

  run?: number;
  performance_score?: number;
  coaching_insight?: string;
  whatsapp_insights?: string;
  raw_content?: string;
  summary?: string;
  generated_at?: string;

  tasks: {
    title: string;
    description?: string;
    priority?: Priority;
    category?: string;
    due_date?: string;
    completed?: boolean;
    completed_at?: string | null;
    verification_status?: VerificationStatus | null;
  }[];
  risks: {
    title: string;
    description?: string;
    severity?: Severity;
    category?: string;
    mitigation?: string;
  }[];
  objectives: {
    title: string;
    description?: string;
    type?: ObjectiveType;
    status?: ObjectiveStatus;
    due_date?: string;
    notes?: string;
  }[];
  metrics: {
    label: string;
    value: number;
    unit?: string;
    change_direction?: ChangeDirection;
  }[];

  financial_entries?: Omit<FinancialEntry, "id" | "report_id" | "created_at">[];
  balance_snapshots?: Omit<BalanceSnapshot, "id" | "created_at">[];
}

/** @deprecated Use UnifiedIngestPayload — kept for backwards compat */
export type ReportsPayload = UnifiedIngestPayload;

// ── Daily Work Tab types ──

export type PriorityImpact = "High" | "Moderate" | "Low";
export type Difficulty = "Hard" | "Medium" | "Easy";
export type DailyTaskStatus = "pending" | "in_progress" | "completed" | "deferred";

export type OverflowState =
  | "TB1_NOMINAL_END"
  | "TB1_EXTENDED_30"
  | "TB1_EXTENDED_60"
  | "TB1_EXTENDED_60_THEN_30"
  | "TB2_BORROW_30"
  | "TB2_BORROW_60"
  | "TB2_FULLY_USED";

export interface EvidenceItem {
  type: "photo" | "screenshot" | "file";
  value: string;
}

export interface TaskSuggestion {
  id: string;
  date: string;
  task_name: string;
  description: string;
  priority_impact: PriorityImpact;
  difficulty: Difficulty;
  execution_tips: string | null;
  rank: number;
  created_at: string;
}

export interface DailyTask {
  id: string;
  date: string;
  task_number: 1 | 2;
  task_name: string;
  task_description: string | null;
  assigned_block: number;
  status: DailyTaskStatus;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  daily_task_id: string;
  completed_at: string | null;
  notes: string | null;
  evidence_items: EvidenceItem[];
  overflow_state: OverflowState | null;
  created_at: string;
}
