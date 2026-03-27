import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-tertiary"
        style={{ background: 'var(--color-background)', boxShadow: 'var(--neu-inset)' }}
      >
        {icon || <InboxIcon size={24} strokeWidth={1.5} />}
      </div>
      <p className="text-body-md text-secondary font-medium">{title}</p>
      {description && (
        <p className="text-body-sm text-tertiary mt-1.5 max-w-[260px]">
          {description}
        </p>
      )}
    </div>
  );
}
