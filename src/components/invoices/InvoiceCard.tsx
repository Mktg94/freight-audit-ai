import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import type { InvoiceStatus } from '@/types';

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoice_number: string;
    carrier_name: string;
    total_billed: number;
    status: InvoiceStatus;
    uploaded_at: string;
  };
}

function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Card className="transition-colors hover:border-[var(--primary)]/50">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <FileText className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                {invoice.invoice_number}
              </p>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {invoice.carrier_name}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {formatDate(invoice.uploaded_at)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[var(--text-primary)]">
              {formatCurrency(invoice.total_billed)}
            </p>
            <div className="mt-1">
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>
        <Link
          href={`/invoices/${invoice.id}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
        >
          View Details <ArrowRight size={14} />
        </Link>
      </CardContent>
    </Card>
  );
}

export { InvoiceCard };
export type { InvoiceCardProps };
