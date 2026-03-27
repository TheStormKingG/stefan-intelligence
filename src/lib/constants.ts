import { Severity, Priority, ObjectiveType, ObjectiveStatus, VerificationStatus } from "./types";

export const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bg: string; border: string; order: number }
> = {
  critical: {
    label: "Critical",
    color: "text-severity-critical",
    bg: "bg-severity-critical/8",
    border: "border-severity-critical",
    order: 0,
  },
  high: {
    label: "High",
    color: "text-severity-high",
    bg: "bg-severity-high/8",
    border: "border-severity-high",
    order: 1,
  },
  medium: {
    label: "Medium",
    color: "text-severity-medium",
    bg: "bg-severity-medium/10",
    border: "border-severity-medium",
    order: 2,
  },
  low: {
    label: "Low",
    color: "text-severity-low",
    bg: "bg-severity-low/8",
    border: "border-severity-low",
    order: 3,
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; dotColor: string; order: number }
> = {
  critical: { label: "Critical", dotColor: "bg-severity-critical", order: 0 },
  high: { label: "High", dotColor: "bg-severity-high", order: 1 },
  medium: { label: "Medium", dotColor: "bg-severity-medium", order: 2 },
  low: { label: "Low", dotColor: "bg-severity-low", order: 3 },
};

export const OBJECTIVE_TYPE_CONFIG: Record<
  ObjectiveType,
  { label: string; color: string; bg: string }
> = {
  revenue: {
    label: "Revenue",
    color: "text-objective-revenue",
    bg: "bg-objective-revenue/8",
  },
  operational: {
    label: "Operational",
    color: "text-objective-operational",
    bg: "bg-objective-operational/8",
  },
  strategic: {
    label: "Strategic",
    color: "text-objective-strategic",
    bg: "bg-objective-strategic/8",
  },
  growth: {
    label: "Growth",
    color: "text-objective-growth",
    bg: "bg-objective-growth/8",
  },
};

export const STATUS_CONFIG: Record<
  ObjectiveStatus,
  { label: string; color: string; dotColor: string }
> = {
  on_track: {
    label: "On Track",
    color: "text-status-on-track",
    dotColor: "bg-status-on-track",
  },
  at_risk: {
    label: "At Risk",
    color: "text-status-at-risk",
    dotColor: "bg-status-at-risk",
  },
  behind: {
    label: "Behind",
    color: "text-status-behind",
    dotColor: "bg-status-behind",
  },
  completed: {
    label: "Completed",
    color: "text-status-completed",
    dotColor: "bg-status-completed",
  },
};

export const VERIFICATION_CONFIG: Record<
  VerificationStatus,
  { label: string; color: string; bg: string; icon: "pending" | "check" | "x" | "minus" }
> = {
  pending_verification: {
    label: "Awaiting verification",
    color: "text-severity-high",
    bg: "bg-severity-high/8",
    icon: "pending",
  },
  verified: {
    label: "Verified",
    color: "text-severity-low",
    bg: "bg-severity-low/8",
    icon: "check",
  },
  failed_verification: {
    label: "Not verified",
    color: "text-severity-critical",
    bg: "bg-severity-critical/8",
    icon: "x",
  },
  not_applicable: {
    label: "N/A",
    color: "text-tertiary",
    bg: "bg-gray-100",
    icon: "minus",
  },
};

export const APP_NAME = "Executive Intelligence System";
export const APP_SHORT_NAME = "EIS";
