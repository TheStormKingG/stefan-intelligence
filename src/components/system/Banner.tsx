import { InfoIcon, AlertTriangleIcon } from "lucide-react";

interface BannerProps {
  message: string;
  variant?: "info" | "warning";
}

export function Banner({ message, variant = "info" }: BannerProps) {
  const isWarning = variant === "warning";

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-card text-body-sm mb-6 animate-fade-in ${
        isWarning
          ? "bg-severity-high/8 text-severity-high"
          : "bg-objective-revenue/6 text-objective-revenue"
      }`}
    >
      {isWarning ? (
        <AlertTriangleIcon size={16} strokeWidth={2} />
      ) : (
        <InfoIcon size={16} strokeWidth={2} />
      )}
      <span>{message}</span>
    </div>
  );
}
