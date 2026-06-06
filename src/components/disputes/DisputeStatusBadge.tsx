import { Badge, type BadgeVariant } from '@/components/ui/badge';
import type { DisputeStatus } from '@/types';

const statusConfig: Record<DisputeStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  sent: { label: 'Sent', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

interface DisputeStatusBadgeProps {
  status: DisputeStatus;
}

function DisputeStatusBadge({ status }: DisputeStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { DisputeStatusBadge };
export type { DisputeStatusBadgeProps };
