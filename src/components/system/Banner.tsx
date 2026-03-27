import { InfoIcon, AlertTriangleIcon, AlertOctagonIcon } from "lucide-react";

interface BannerProps {
  message: string;
  detail?: string;
  variant?: "info" | "warning" | "critical";
}

export function Banner({ message, detail, variant = "info" }: BannerProps) {
  const iconColors = {
    info: "text-accent-blue",
    warning: "text-severity-high",
    critical: "text-severity-critical",
  };

  const borderColors = {
    info: "border-accent-blue/20",
    warning: "border-severity-high/20",
    critical: "border-severity-critical/20",
  };

  const Icon =
    variant === "critical"
      ? AlertOctagonIcon
      : variant === "warning"
        ? AlertTriangleIcon
        : InfoIcon;

  return (
    <div
      className={`glass-banner flex items-start gap-3 px-4 py-3.5 mb-6 animate-fade-in ${borderColors[variant]}`}
      style={{ borderLeft: `3px solid` }}
    >
      <Icon size={16} strokeWidth={2} className={`flex-shrink-0 mt-0.5 ${iconColors[variant]}`} />
      <div>
        <span className="text-body-sm text-foreground font-medium">{message}</span>
        {detail && (
          <p className="mt-1 text-caption text-tertiary">{detail}</p>
        )}
      </div>
    </div>
  );
}
