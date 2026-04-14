"use client";

import { Phone } from "lucide-react";

export function FocusBanner() {
  return (
    <div className="w-full px-4 py-2 bg-indigo-600/90 backdrop-blur-sm flex items-center justify-center gap-2">
      <Phone size={14} className="text-white/80" />
      <span className="text-xs font-medium text-white/90 tracking-wide">
        Focus Mode Active — Calls only
      </span>
    </div>
  );
}
