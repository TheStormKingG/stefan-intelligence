interface ScoreSparklineProps {
  scores: { date: string; score: number }[];
}

export function ScoreSparkline({ scores }: ScoreSparklineProps) {
  if (scores.length < 2) return null;

  const slice = scores.slice(-14);
  const min = Math.min(...slice.map((s) => s.score), 0);
  const max = Math.max(...slice.map((s) => s.score), 10);
  const range = max - min || 1;

  const w = 280;
  const h = 48;
  const pad = 4;
  const pts = slice.map((s, i) => {
    const x = pad + (i / Math.max(slice.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((s.score - min) / range) * (h - pad * 2);
    return { x, y, ...s };
  });

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const first = slice[0]!.score;
  const last = slice[slice.length - 1]!.score;
  const delta = last - first;

  return (
    <div className="card p-4 mb-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-caption text-tertiary uppercase tracking-widest">Score momentum</p>
        <span
          className={`text-body-sm font-semibold tabular-nums ${
            delta >= 0 ? "text-severity-low" : "text-severity-critical"
          }`}
        >
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(2)} vs start of window
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-[min(100%,280px)] h-12"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(91, 141, 239)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(91, 141, 239)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathD} L ${pts[pts.length - 1]!.x.toFixed(1)} ${h} L ${pts[0]!.x.toFixed(1)} ${h} Z`}
          fill="url(#sparkFill)"
        />
        <path
          d={pathD}
          fill="none"
          stroke="rgb(91, 141, 239)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={p.date + i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 4 : 2.5}
            fill={i === pts.length - 1 ? "rgb(91, 141, 239)" : "rgba(91, 141, 239, 0.6)"}
          />
        ))}
      </svg>
      <p className="text-caption text-tertiary mt-1">
        Last {slice.length} reports with scores (oldest → newest)
      </p>
    </div>
  );
}
