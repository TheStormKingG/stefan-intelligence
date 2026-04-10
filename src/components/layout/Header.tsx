import { formatDate } from "@/lib/utils";
import { ClientGreeting } from "./ClientGreeting";

interface HeaderProps {
  name?: string;
  ingestionTime?: string | null;
  performanceScore?: number | null;
}

function getScoreColor(score: number): string {
  if (score >= 9.0) return "bg-severity-low/15 text-severity-low";
  if (score >= 7.5) return "bg-accent-blue/15 text-accent-blue";
  if (score >= 6.0) return "bg-severity-medium/15 text-severity-medium";
  return "bg-severity-critical/15 text-severity-critical";
}

export function Header({ name = "Stefan", ingestionTime, performanceScore }: HeaderProps) {
  const today = formatDate(new Date().toISOString());
  const score = performanceScore != null ? Number(performanceScore) : null;

  return (
    <header className="mb-8 animate-fade-in">
      <p className="text-caption text-tertiary uppercase tracking-widest mb-1.5">
        Executive Intelligence
      </p>
      <div className="flex items-center gap-3">
        <h1 className="text-title-lg text-foreground tracking-tight">
          <ClientGreeting name={name} />
        </h1>
        {score != null && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-badge text-[11px] font-semibold tabular-nums ${getScoreColor(score)}`}
          >
            {score.toFixed(1)}/10
          </span>
        )}
      </div>
      <p className="text-body-sm text-secondary mt-1">{today}</p>
      {ingestionTime && (
        <p className="text-caption text-tertiary mt-2">
          Last sync{" "}
          {new Date(ingestionTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </header>
  );
}
