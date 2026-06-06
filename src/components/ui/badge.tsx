import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const badgeVariants = {
  default: 'bg-[var(--surface-2)] text-[var(--text-secondary)]',
  secondary: 'bg-[var(--border)] text-[var(--text-secondary)]',
  success: 'bg-[var(--success)]/10 text-[var(--success)]',
  warning: 'bg-[var(--accent)]/10 text-[var(--accent)]',
  danger: 'bg-[var(--danger)]/10 text-[var(--danger)]',
  info: 'bg-[var(--primary)]/10 text-[var(--primary)]',
};

type BadgeVariant = keyof typeof badgeVariants;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
