import {
  ReportWithChildren,
  ComputedMetrics,
  Task,
  Objective,
  Risk,
} from "./types";
import { PRIORITY_CONFIG, SEVERITY_CONFIG } from "./constants";

export function computeMetrics(report: ReportWithChildren): ComputedMetrics {
  return {
    activeTasksCount: report.tasks.filter((t) => !t.completed).length,
    criticalRiskCount: report.risks.filter(
      (r) => r.severity === "critical" || r.severity === "high"
    ).length,
    overdueObjectivesCount: report.objectives.filter(
      (o) =>
        o.due_date &&
        new Date(o.due_date) < new Date() &&
        o.status !== "completed"
    ).length,
  };
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order;
  });
}

export function sortRisksBySeverity(risks: Risk[]): Risk[] {
  return [...risks].sort(
    (a, b) =>
      SEVERITY_CONFIG[a.severity].order - SEVERITY_CONFIG[b.severity].order
  );
}

export function filterCriticalRisks(risks: Risk[]): Risk[] {
  return risks.filter(
    (r) => r.severity === "critical" || r.severity === "high"
  );
}

export function getTasksForTimeframe(
  tasks: Task[],
  days: number
): Task[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return tasks.filter(
    (t) => !t.due_date || new Date(t.due_date) <= cutoff
  );
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date(new Date().toDateString());
  const diff = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0 && diff <= 7) return `In ${diff} days`;
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return formatDateShort(dateStr);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatMetricValue(value: number, unit?: string | null): string {
  if (unit === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
  }
  return value.toString();
}

export function sortObjectivesByUrgency(objectives: Objective[]): Objective[] {
  const statusOrder: Record<string, number> = {
    behind: 0,
    at_risk: 1,
    on_track: 2,
    completed: 3,
  };
  return [...objectives].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );
}
