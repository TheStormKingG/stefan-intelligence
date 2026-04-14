"use client";

import { Metric } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { TrendingUpIcon, ZapIcon } from "lucide-react";
import { SectionContainer } from "@/components/system/SectionContainer";

interface ScoreEntry {
  date: string;
  score: number;
}

interface DailyGainTrackerProps {
  scores: ScoreEntry[];
  currentMetrics: Metric[];
}

function computeStreak(scores: ScoreEntry[]): number {
  let streak = 0;
  for (let i = scores.length - 1; i >= 0; i--) {
    if (i === 0 || scores[i].score >= scores[i - 1].score) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeCompoundGain(scores: ScoreEntry[]): string {
  if (scores.length < 2) return "+0.0%";
  const first = scores[0].score;
  const last = scores[scores.length - 1].score;
  if (first === 0) return "+0.0%";
  const pct = ((last - first) / first) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

export function DailyGainTracker({
  scores,
  currentMetrics,
}: DailyGainTrackerProps) {
  const streak = computeStreak(scores);
  const compoundGain = computeCompoundGain(scores);
  const latest = scores[scores.length - 1];
  const maxScore = Math.max(...scores.map((s) => s.score), 10);

  return (
    <SectionContainer title="Daily 1% Gains" subtitle="Performance trajectory">
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-caption text-tertiary uppercase tracking-wide">
              Current Score
            </p>
            <p className="text-title-lg text-foreground tabular-nums">
              {latest?.score.toFixed(2) ?? "—"}/10
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-caption text-tertiary">Streak</p>
              <div className="flex items-center gap-1 justify-end">
                <ZapIcon size={12} className="text-severity-medium" />
                <span className="text-body-md font-semibold text-foreground tabular-nums">
                  {streak}d
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-caption text-tertiary">30d Gain</p>
              <span className="text-body-md font-semibold text-severity-low tabular-nums">
                {compoundGain}
              </span>
            </div>
          </div>
        </div>

        {scores.length > 1 && (
          <div className="flex items-end gap-[3px] h-16">
            {scores.slice(-14).map((s, i) => {
              const h = Math.max((s.score / maxScore) * 100, 8);
              const isLatest = i === Math.min(scores.length, 14) - 1;
              return (
                <div
                  key={s.date}
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${h}%`,
                    background: isLatest
                      ? "var(--accent-gradient)"
                      : "rgba(91, 141, 239, 0.25)",
                  }}
                  title={`${s.date}: ${s.score.toFixed(2)}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {currentMetrics.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {currentMetrics.slice(0, 6).map((m) => (
            <div key={m.id} className="card p-3 text-center">
              <p className="text-caption text-tertiary truncate">{m.label}</p>
              <p className="text-body-md font-semibold text-foreground tabular-nums mt-0.5">
                {formatMetricValue(m.value, m.unit)}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
