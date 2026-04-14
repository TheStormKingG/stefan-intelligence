"use client";

import { Objective } from "@/lib/types";
import { sortObjectivesByUrgency, formatRelativeDate, isOverdue } from "@/lib/utils";
import { STATUS_CONFIG, OBJECTIVE_TYPE_CONFIG } from "@/lib/constants";
import { SectionContainer } from "@/components/system/SectionContainer";
import { EmptyState } from "@/components/system/EmptyState";
import { FlagIcon } from "lucide-react";

interface StrategicTimelineProps {
  objectives: Objective[];
}

export function StrategicTimeline({ objectives }: StrategicTimelineProps) {
  if (objectives.length === 0) {
    return (
      <SectionContainer title="Strategic Timeline" subtitle="90-day objectives">
        <EmptyState
          title="No objectives"
          description="Strategic objectives will appear here once ingested."
          icon={<FlagIcon size={24} strokeWidth={1.5} />}
        />
      </SectionContainer>
    );
  }

  const sorted = sortObjectivesByUrgency(objectives);

  return (
    <SectionContainer
      title="Strategic Timeline"
      subtitle={`${objectives.length} objective${objectives.length !== 1 ? "s" : ""} tracked`}
    >
      <div className="relative pl-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-[2px] rounded-full bg-border" />
        <div className="space-y-3">
          {sorted.map((obj) => {
            const statusCfg = STATUS_CONFIG[obj.status];
            const typeCfg = OBJECTIVE_TYPE_CONFIG[obj.type];
            const overdue = isOverdue(obj.due_date);

            return (
              <div key={obj.id} className="relative flex gap-3">
                <div
                  className={`absolute -left-[9px] top-[10px] w-3 h-3 rounded-full border-2 border-surface-solid ${statusCfg.dotColor}`}
                />
                <div
                  className={`card flex-1 p-4 ${overdue ? "overdue-tint" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-caption font-medium ${typeCfg.color}`}>
                      {typeCfg.label}
                    </span>
                    <span className={`text-caption ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-body-sm text-foreground font-medium leading-snug">
                    {obj.title}
                  </p>
                  {obj.due_date && (
                    <p
                      className={`text-caption mt-1.5 ${
                        overdue ? "text-severity-critical" : "text-tertiary"
                      }`}
                    >
                      {formatRelativeDate(obj.due_date)}
                    </p>
                  )}
                  {obj.notes && (
                    <p className="text-caption text-tertiary mt-1 line-clamp-2">
                      {obj.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
