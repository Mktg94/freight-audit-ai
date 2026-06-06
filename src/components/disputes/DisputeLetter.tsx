'use client';

import { cn } from '@/lib/utils/cn';

interface DisputeLetterProps {
  letterText: string;
  editable?: boolean;
  onChange?: (text: string) => void;
}

function DisputeLetter({ letterText, editable = false, onChange }: DisputeLetterProps) {
  if (editable) {
    return (
      <textarea
        value={letterText}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-96 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6',
        'prose prose-invert max-w-none',
      )}
    >
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
        {letterText}
      </p>
    </div>
  );
}

export { DisputeLetter };
export type { DisputeLetterProps };
