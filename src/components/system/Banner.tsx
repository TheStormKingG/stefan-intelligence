import { InfoIcon, AlertTriangleIcon, AlertOctagonIcon } from "lucide-react";

interface BannerProps {
  message: string;
  detail?: string;
  variant?: "info" | "warning" | "critical";
}

export function Banner({ message, detail, variant = "info" }: BannerProps) {
  const styles = {
    info: "bg-objective-revenue/6 text-objective-revenue",
    warning: "bg-severity-high/8 text-severity-high",
    critical: "bg-severity-critical/8 text-severity-critical",
  };

  const Icon =
    variant === "critical"
      ? AlertOctagonIcon
      : variant === "warning"
        ? AlertTriangleIcon
        : InfoIcon;

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-card text-body-sm mb-6 animate-fade-in ${styles[variant]}`}
    >
      <Icon size={16} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
      <div>
        <span>{message}</span>
        {detail && (
          <p className="mt-1 opacity-75 text-caption">{detail}</p>
        )}
      </div>
    </div>
  );
}
