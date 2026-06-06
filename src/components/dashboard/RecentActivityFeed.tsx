import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import type { InvoiceStatus } from '@/types';

interface RecentInvoice {
  id: string;
  invoice_number: string;
  carrier_name: string;
  total_billed: number;
  status: InvoiceStatus;
  uploaded_at: string;
}

interface RecentActivityFeedProps {
  invoices: RecentInvoice[];
}

function RecentActivityFeed({ invoices }: RecentActivityFeedProps) {
  if (invoices.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--text-muted)]">
        No recent activity.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.slice(0, 5).map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {inv.invoice_number}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {inv.carrier_name} &middot; {formatDate(inv.uploaded_at)}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {formatCurrency(inv.total_billed)}
            </span>
            <InvoiceStatusBadge status={inv.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

export { RecentActivityFeed };
export type { RecentActivityFeedProps, RecentInvoice };
