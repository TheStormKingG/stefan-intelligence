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

export interface IngestPayload {
  report_date: string;
  raw_content?: string;
  summary?: string;
  generated_at?: string;
  risks: Omit<Risk, "id" | "report_id" | "created_at">[];
  tasks: (Omit<Task, "id" | "report_id" | "completed" | "completed_at" | "verification_status" | "created_at"> & {
    completed?: boolean;
    completed_at?: string | null;
    verification_status?: VerificationStatus | null;
  })[];
  objectives: Omit<Objective, "id" | "report_id" | "created_at">[];
  metrics: Omit<Metric, "id" | "report_id" | "created_at">[];
  financial_entries?: Omit<FinancialEntry, "id" | "report_id" | "created_at">[];
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
}

export interface ComputedMetrics {
  activeTasksCount: number;
  criticalRiskCount: number;
  overdueObjectivesCount: number;
}
