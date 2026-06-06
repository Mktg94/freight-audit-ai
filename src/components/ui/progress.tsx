import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
}

function Progress({ className, value = 0, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]',
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { Progress };
export type { ProgressProps };
