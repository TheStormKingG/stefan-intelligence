import { Metric } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, BarChart3Icon } from "lucide-react";
import { EmptyState } from "@/components/system/EmptyState";

interface ContextMetricsProps {
  metrics: Metric[];
  note?: string | null;
}

const METRIC_ACCENTS = [
  "linear-gradient(135deg, #5B8DEF, #4A7BD9)",
  "linear-gradient(135deg, #3FBF6E, #2FA85C)",
  "linear-gradient(135deg, #F0923B, #E0802B)",
  "linear-gradient(135deg, #7B6CD9, #6B5CC9)",
  "linear-gradient(135deg, #E8505B, #D8404B)",
  "linear-gradient(135deg, #EAB930, #DAA920)",
];

export function ContextMetrics({ metrics, note }: ContextMetricsProps) {
  if (metrics.length === 0) {
    return (
      <section className="mb-8">
        <EmptyState
          title="No metrics"
          description="No metrics available for today."
          icon={<BarChart3Icon size={24} strokeWidth={1.5} />}
        />
      </section>
    );
  }

  return (
    <section className="mb-8">
      {note && (
        <p className="text-caption text-tertiary mb-2 px-1">{note}</p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        {metrics.map((metric, i) => (
          <MetricPill key={metric.id} metric={metric} index={i} accent={METRIC_ACCENTS[i % METRIC_ACCENTS.length]} />
        ))}
      </div>
    </section>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function MetricPill({ metric, index, accent }: { metric: Metric; index: number; accent: string }) {
  const DirectionIcon =
    metric.change_direction === "up"
      ? TrendingUpIcon
      : metric.change_direction === "down"
        ? TrendingDownIcon
        : MinusIcon;

  const dirColor =
    metric.change_direction === "up"
      ? "text-severity-low"
      : metric.change_direction === "down"
        ? "text-severity-critical"
        : "text-tertiary";

  return (
    <div
      className="card flex-shrink-0 min-w-[130px] p-4 animate-slide-up overflow-hidden relative"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="absolute top-0 left-0 w-1 h-full rounded-full" style={{ background: accent }} />
      <div className="flex items-center justify-between mb-1.5 pl-2">
        <span className="text-caption text-tertiary">{metric.label}</span>
        <DirectionIcon size={12} className={dirColor} />
      </div>
      <p className="text-title-sm text-foreground tabular-nums pl-2">
        {formatMetricValue(metric.value, metric.unit)}
      </p>
      {metric.created_at && (
        <p className="text-[10px] text-tertiary mt-1 pl-2 opacity-60">
          {formatTimestamp(metric.created_at)}
        </p>
      )}
    </div>
  );
}
