import { cn } from '@/lib/utils/cn';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

interface LoadingSpinnerProps {
  size?: keyof typeof sizeMap;
  text?: string;
}

function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'animate-spin rounded-full border-[var(--border)] border-t-[var(--primary)]',
          sizeMap[size],
        )}
      />
      {text && (
        <p className="text-sm text-[var(--text-muted)]">{text}</p>
      )}
    </div>
  );
}

export { LoadingSpinner };
export type { LoadingSpinnerProps };
