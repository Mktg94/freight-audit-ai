import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface FlaggedItem {
  id: string;
  invoice_number: string;
  flag_reason: string;
  discrepancy: number;
}

interface FlaggedInvoicesQueueProps {
  items: FlaggedItem[];
}

function FlaggedInvoicesQueue({ items }: FlaggedInvoicesQueueProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--text-muted)]">
        No flagged items.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10">
              <AlertTriangle className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {item.invoice_number}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                {item.flag_reason}
              </p>
            </div>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <span className="text-sm font-semibold text-[var(--danger)]">
              {formatCurrency(item.discrepancy)}
            </span>
            <Link href={`/invoices/${item.id}`}>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export { FlaggedInvoicesQueue };
export type { FlaggedInvoicesQueueProps, FlaggedItem };
