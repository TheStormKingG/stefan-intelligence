"use client";

import { useState } from "react";
import { Objective } from "@/lib/types";
import { sortObjectivesByUrgency, formatRelativeDate, isOverdue } from "@/lib/utils";
import { OBJECTIVE_TYPE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { SectionContainer } from "@/components/system/SectionContainer";
import { EmptyState } from "@/components/system/EmptyState";
import { TargetIcon } from "lucide-react";
import Link from "next/link";

interface StrategicZoneProps {
  objectives: Objective[];
}

export function StrategicZone({ objectives }: StrategicZoneProps) {
  if (objectives.length === 0) {
    return (
      <SectionContainer title="Strategic Objectives">
        <EmptyState
          title="No objectives"
          description="Strategic objectives will appear here"
          icon={<TargetIcon size={32} strokeWidth={1.5} />}
        />
      </SectionContainer>
    );
  }

  const sorted = sortObjectivesByUrgency(objectives);

  return (
    <SectionContainer
      title="Strategic Objectives"
      action={
        <Link
          href="/objectives"
          className="text-body-sm text-objective-revenue font-medium"
        >
          See all
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {sorted.slice(0, 4).map((obj, i) => (
          <ObjectivePreview key={obj.id} objective={obj} index={i} />
        ))}
      </div>
    </SectionContainer>
  );
}

function ObjectivePreview({
  objective,
  index,
}: {
  objective: Objective;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = OBJECTIVE_TYPE_CONFIG[objective.type];
  const statusConfig = STATUS_CONFIG[objective.status];
  const overdue = isOverdue(objective.due_date);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`card text-left p-3.5 animate-slide-up ${
        overdue ? "overdue-tint" : ""
      } ${expanded ? "col-span-2" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
        <span className={`text-caption font-medium ${typeConfig.color}`}>
          {typeConfig.label}
        </span>
      </div>
      <p className="text-body-sm text-foreground font-medium leading-snug line-clamp-2">
        {objective.title}
      </p>
      {objective.due_date && (
        <p
          className={`text-caption mt-1.5 ${
            overdue ? "text-severity-critical" : "text-tertiary"
          }`}
        >
          {formatRelativeDate(objective.due_date)}
        </p>
      )}

      {expanded && objective.notes && (
        <div className="mt-3 pt-3 border-t border-border animate-fade-in">
          <p className="text-body-sm text-secondary">{objective.notes}</p>
        </div>
      )}
    </button>
  );
}
