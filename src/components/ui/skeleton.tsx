import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--surface-2)]',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
