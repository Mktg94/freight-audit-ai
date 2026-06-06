import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TrendIndicator {
  value: number;
  direction: 'up' | 'down' | 'flat';
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: TrendIndicator;
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const trendColors = {
  up: 'text-[var(--success)]',
  down: 'text-[var(--danger)]',
  flat: 'text-[var(--text-muted)]',
};

function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  const TrendIcon = trend ? trendIcons[trend.direction] : null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
          <Icon className="h-5 w-5 text-[var(--primary)]" />
        </div>
        {trend && TrendIcon && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColors[trend.direction])}>
            <TrendIcon size={14} />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 font-[var(--font-syne)] text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

export { StatCard };
export type { StatCardProps, TrendIndicator };
