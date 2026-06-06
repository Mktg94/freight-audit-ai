import { Badge, type BadgeVariant } from '@/components/ui/badge';
import type { InvoiceStatus } from '@/types';

const statusConfig: Record<InvoiceStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  auditing: { label: 'Auditing', variant: 'info' },
  flagged: { label: 'Flagged', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  disputed: { label: 'Disputed', variant: 'danger' },
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { InvoiceStatusBadge };
export type { InvoiceStatusBadgeProps };
