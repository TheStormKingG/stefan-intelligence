import { Metric } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

interface ContextMetricsProps {
  metrics: Metric[];
}

export function ContextMetrics({ metrics }: ContextMetricsProps) {
  if (metrics.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
        {metrics.map((metric, i) => (
          <MetricPill key={metric.id} metric={metric} index={i} />
        ))}
      </div>
    </section>
  );
}

function MetricPill({ metric, index }: { metric: Metric; index: number }) {
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
      className="card flex-shrink-0 min-w-[120px] p-3 animate-slide-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-caption text-tertiary">{metric.label}</span>
        <DirectionIcon size={12} className={dirColor} />
      </div>
      <p className="text-title-sm text-foreground tabular-nums">
        {formatMetricValue(metric.value, metric.unit)}
      </p>
    </div>
  );
}
