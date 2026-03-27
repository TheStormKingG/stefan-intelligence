"use client";

import { useState } from "react";
import { Risk } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/constants";
import { filterCriticalRisks, sortRisksBySeverity } from "@/lib/utils";
import { SectionContainer } from "@/components/system/SectionContainer";
import { EmptyState } from "@/components/system/EmptyState";
import { ShieldAlertIcon, ChevronDownIcon } from "lucide-react";

interface CriticalZoneProps {
  risks: Risk[];
}

export function CriticalZone({ risks }: CriticalZoneProps) {
  const criticalRisks = sortRisksBySeverity(filterCriticalRisks(risks));

  if (criticalRisks.length === 0) {
    return (
      <SectionContainer title="Risks" subtitle="No critical items">
        <EmptyState
          title="All clear"
          description="No critical or high-severity risks detected"
          icon={<ShieldAlertIcon size={32} strokeWidth={1.5} />}
        />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer
      title="Attention Required"
      subtitle={`${criticalRisks.length} item${criticalRisks.length > 1 ? "s" : ""}`}
    >
      <div className="space-y-3">
        {criticalRisks.map((risk, i) => (
          <RiskCard key={risk.id} risk={risk} index={i} />
        ))}
      </div>
    </SectionContainer>
  );
}

function RiskCard({ risk, index }: { risk: Risk; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[risk.severity];
  const borderClass =
    risk.severity === "critical" ? "risk-border-critical" : "risk-border-high";

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`card w-full text-left p-4 pl-4.5 ${borderClass} animate-slide-up`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`status-badge ${config.bg} ${config.color}`}
            >
              {config.label}
            </span>
            {risk.category && (
              <span className="text-caption text-tertiary">{risk.category}</span>
            )}
          </div>
          <p className="text-body-md text-foreground font-medium leading-snug">
            {risk.title}
          </p>
        </div>
        <ChevronDownIcon
          size={16}
          className={`text-tertiary flex-shrink-0 mt-1 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border animate-fade-in">
          {risk.description && (
            <p className="text-body-sm text-secondary mb-2">
              {risk.description}
            </p>
          )}
          {risk.mitigation && (
            <div className="mt-2">
              <p className="text-caption text-tertiary font-medium uppercase tracking-wide mb-1">
                Mitigation
              </p>
              <p className="text-body-sm text-secondary">{risk.mitigation}</p>
            </div>
          )}
        </div>
      )}
    </button>
  );
}
