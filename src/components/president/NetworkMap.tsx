"use client";

import { NetworkIcon } from "lucide-react";
import { SectionContainer } from "@/components/system/SectionContainer";

const NETWORKS = [
  {
    name: "GYBN",
    fullName: "Global Youth Biodiversity Network",
    role: "Active Member",
    status: "active" as const,
    color: "#3FBF6E",
  },
  {
    name: "CYCLE",
    fullName: "Caribbean Youth Climate Leadership Exchange",
    role: "Delegate / Contributor",
    status: "active" as const,
    color: "#5B8DEF",
  },
  {
    name: "Academic",
    fullName: "University & Research Affiliations",
    role: "Candidate / Student",
    status: "active" as const,
    color: "#7B6CD9",
  },
];

const STATUS_STYLES = {
  active: "bg-severity-low/15 text-severity-low",
  pending: "bg-severity-medium/15 text-severity-medium",
  inactive: "bg-gray-100 text-tertiary",
};

export function NetworkMap() {
  return (
    <SectionContainer title="Network Map" subtitle="Strategic affiliations">
      <div className="space-y-3">
        {NETWORKS.map((net) => (
          <div key={net.name} className="card p-4" style={{ borderLeft: `3px solid ${net.color}` }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <NetworkIcon size={14} style={{ color: net.color }} />
                <span className="text-body-sm font-semibold text-foreground">
                  {net.name}
                </span>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-badge ${STATUS_STYLES[net.status]}`}
              >
                {net.status.charAt(0).toUpperCase() + net.status.slice(1)}
              </span>
            </div>
            <p className="text-caption text-secondary">{net.fullName}</p>
            <p className="text-caption text-tertiary mt-0.5">{net.role}</p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
