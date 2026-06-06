'use client';

import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { AuditLineItemResult, AuditLineStatus } from '@/types';

const statusVariant: Record<AuditLineStatus, 'success' | 'danger' | 'warning' | 'default' | 'info'> = {
  correct: 'success',
  overcharged: 'danger',
  undercharged: 'warning',
  not_in_contract: 'default',
  suspicious: 'info',
};

const statusLabels: Record<AuditLineStatus, string> = {
  correct: 'Correct',
  overcharged: 'Overcharged',
  undercharged: 'Undercharged',
  not_in_contract: 'Not in Contract',
  suspicious: 'Suspicious',
};

interface AuditResultPanelProps {
  item: AuditLineItemResult | null;
  open: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onDispute?: () => void;
}

function AuditResultPanel({ item, open, onClose, onApprove, onDispute }: AuditResultPanelProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Audit Detail">
      {item ? (
        <div className="space-y-6">
          <div>
            <h4 className="mb-1 font-medium text-[var(--text-primary)]">
              {item.description}
            </h4>
            <Badge variant={statusVariant[item.status]}>
              {statusLabels[item.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <p className="text-xs text-[var(--text-muted)]">Billed Amount</p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {formatCurrency(item.billed_amount)}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <p className="text-xs text-[var(--text-muted)]">Expected Amount</p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {formatCurrency(item.expected_amount)}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-[var(--surface-2)] p-3">
            <p className="text-xs text-[var(--text-muted)]">Discrepancy</p>
            <p
              className={`mt-1 text-lg font-semibold ${
                item.discrepancy > 0
                  ? 'text-[var(--danger)]'
                  : item.discrepancy < 0
                    ? 'text-[var(--success)]'
                    : 'text-[var(--text-primary)]'
              }`}
            >
              {item.discrepancy > 0 ? '+' : ''}
              {formatCurrency(item.discrepancy)}
            </p>
          </div>

          <Separator />

          <div>
            <p className="mb-1 text-sm font-medium text-[var(--text-secondary)]">
              AI Confidence
            </p>
            <ConfidenceBar value={item.confidence_score} showLabel />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-[var(--text-secondary)]">
              AI Reasoning
            </p>
            <p className="rounded-lg bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)]">
              {item.flag_reason}
            </p>
          </div>

          <Separator />

          {onApprove && onDispute && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-[var(--success)] text-[var(--success)] hover:bg-[var(--success)]/10"
                onClick={onApprove}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)]/10"
                onClick={onDispute}
              >
                Dispute
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Select a line item to view audit details.</p>
      )}
    </Sheet>
  );
}

export { AuditResultPanel };
export type { AuditResultPanelProps };
