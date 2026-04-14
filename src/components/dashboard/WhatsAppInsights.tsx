"use client";

import { useState } from "react";
import { MessageCircleIcon, ChevronDownIcon } from "lucide-react";
import { SectionContainer } from "@/components/system/SectionContainer";

interface WhatsAppInsightsProps {
  insights: string;
}

export function WhatsAppInsights({ insights }: WhatsAppInsightsProps) {
  const [expanded, setExpanded] = useState(false);

  const lines = insights.split("\n").filter((l) => l.trim());
  const preview = lines.slice(0, 3).join("\n");
  const hasMore = lines.length > 3;

  return (
    <SectionContainer
      title="WhatsApp Intelligence"
      subtitle="Latest comms insights"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="card w-full text-left p-5"
        style={{ borderLeft: "3px solid #25D366" }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <MessageCircleIcon
              size={16}
              strokeWidth={1.8}
              className="text-[#25D366]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm text-secondary leading-relaxed whitespace-pre-line">
              {expanded ? insights : preview}
            </p>
            {hasMore && !expanded && (
              <p className="text-caption text-tertiary mt-2">
                +{lines.length - 3} more line{lines.length - 3 > 1 ? "s" : ""}
              </p>
            )}
          </div>
          {hasMore && (
            <ChevronDownIcon
              size={16}
              className={`text-tertiary flex-shrink-0 mt-1 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </button>
    </SectionContainer>
  );
}
