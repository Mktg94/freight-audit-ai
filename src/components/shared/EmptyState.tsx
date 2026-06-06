import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)]">
        <Icon className="h-8 w-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="mb-1 font-[var(--font-syne)] text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mb-6 max-w-xs text-sm text-[var(--text-secondary)]">{description}</p>
      {action}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
