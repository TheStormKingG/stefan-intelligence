"use client";

import { useState } from "react";
import { CompassIcon, ChevronDownIcon } from "lucide-react";
import { SectionContainer } from "@/components/system/SectionContainer";
import { EmptyState } from "@/components/system/EmptyState";
import { formatDateShort } from "@/lib/utils";

interface CoachingEntry {
  date: string;
  insight: string;
}

interface CoachingHistoryProps {
  entries: CoachingEntry[];
}

export function CoachingHistory({ entries }: CoachingHistoryProps) {
  const [showAll, setShowAll] = useState(false);

  if (entries.length === 0) {
    return (
      <SectionContainer title="Coaching History" subtitle="AI-driven insights">
        <EmptyState
          title="No coaching history"
          description="Daily insights will accumulate here as reports are ingested."
          icon={<CompassIcon size={24} strokeWidth={1.5} />}
        />
      </SectionContainer>
    );
  }

  const visible = showAll ? entries : entries.slice(0, 5);

  return (
    <SectionContainer
      title="Coaching History"
      subtitle={`${entries.length} insight${entries.length !== 1 ? "s" : ""}`}
    >
      <div className="space-y-2">
        {visible.map((entry, i) => (
          <div
            key={entry.date}
            className="card p-4 animate-slide-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start gap-3">
              <CompassIcon
                size={14}
                strokeWidth={1.8}
                className="text-accent-blue flex-shrink-0 mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="text-caption text-tertiary font-medium mb-1">
                  {formatDateShort(entry.date)}
                </p>
                <p className="text-body-sm text-secondary leading-relaxed">
                  {entry.insight}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {entries.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1.5 mx-auto mt-4 text-body-sm font-medium accent-gradient-text"
        >
          {showAll ? "Show less" : `Show all ${entries.length}`}
          <ChevronDownIcon
            size={14}
            className={`transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </SectionContainer>
  );
}
