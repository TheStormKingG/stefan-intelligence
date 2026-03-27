"use client";

import { useState } from "react";
import { Objective } from "@/lib/types";
import { OBJECTIVE_TYPE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { formatRelativeDate, isOverdue } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

interface ObjectiveCardProps {
  objective: Objective;
  index?: number;
}

export function ObjectiveCard({ objective, index = 0 }: ObjectiveCardProps) {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = OBJECTIVE_TYPE_CONFIG[objective.type];
  const statusConfig = STATUS_CONFIG[objective.status];
  const overdue = isOverdue(objective.due_date) && objective.status !== "completed";

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`card w-full text-left p-5 animate-slide-up transition-all duration-200 ${
        overdue ? "overdue-tint" : ""
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`status-badge ${typeConfig.bg} ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            <span className={`status-badge ${statusConfig.color}`}>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                {statusConfig.label}
              </span>
            </span>
          </div>

          <h3 className="text-body-lg text-foreground font-medium leading-snug">
            {objective.title}
          </h3>

          {objective.due_date && (
            <p
              className={`text-body-sm mt-2 ${
                overdue ? "text-severity-critical font-medium" : "text-tertiary"
              }`}
            >
              Due {formatRelativeDate(objective.due_date)}
              {overdue && " — overdue"}
            </p>
          )}
        </div>

        <ChevronDownIcon
          size={18}
          className={`text-tertiary flex-shrink-0 mt-1 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in space-y-3">
          {objective.description && (
            <p className="text-body-sm text-secondary leading-relaxed">
              {objective.description}
            </p>
          )}
          {objective.notes && (
            <div>
              <p className="text-caption text-tertiary font-medium uppercase tracking-wide mb-1">
                Notes
              </p>
              <p className="text-body-sm text-secondary leading-relaxed">
                {objective.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </button>
  );
}
