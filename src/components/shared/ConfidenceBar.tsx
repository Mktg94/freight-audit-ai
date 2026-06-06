import { cn } from '@/lib/utils/cn';

interface ConfidenceBarProps {
  value: number;
  showLabel?: boolean;
}

function ConfidenceBar({ value, showLabel = false }: ConfidenceBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const pct = Math.round(clamped * 100);
  const color =
    clamped < 0.6
      ? 'bg-[var(--danger)]'
      : clamped < 0.8
        ? 'bg-[var(--accent)]'
        : 'bg-[var(--primary)]';

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 text-right text-xs font-medium text-[var(--text-secondary)]">
          {pct}%
        </span>
      )}
    </div>
  );
}

export { ConfidenceBar };
export type { ConfidenceBarProps };
