import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-tertiary mb-3">
        {icon || <InboxIcon size={32} strokeWidth={1.5} />}
      </div>
      <p className="text-body-md text-secondary font-medium">{title}</p>
      {description && (
        <p className="text-body-sm text-tertiary mt-1 max-w-[260px]">
          {description}
        </p>
      )}
    </div>
  );
}
