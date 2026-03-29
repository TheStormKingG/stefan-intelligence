import { CompassIcon } from "lucide-react";

interface CoachingCardProps {
  insight: string;
}

export function CoachingCard({ insight }: CoachingCardProps) {
  return (
    <section className="mb-6 animate-fade-in">
      <div
        className="rounded-card p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1C2A3A 0%, #2A4060 50%, #3A5580 100%)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <CompassIcon size={16} strokeWidth={1.8} className="text-blue-300/80" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/70 mb-1.5">
              Daily Insight
            </p>
            <p className="text-body-sm text-white/90 leading-relaxed">
              {insight}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
