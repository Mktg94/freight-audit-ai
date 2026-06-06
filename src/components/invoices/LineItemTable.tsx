'use client';

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/DataTable';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface LineItemTableProps {
  items: (AuditLineItemResult & { id?: string })[];
  onApprove?: (id: string) => void;
  onDispute?: (id: string) => void;
}

const columnHelper = createColumnHelper<AuditLineItemResult & { id?: string }>();

function LineItemTable({ items, onApprove, onDispute }: LineItemTableProps) {
  const columns: ColumnDef<AuditLineItemResult & { id?: string }, any>[] = [
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => (
        <span className="text-[var(--text-primary)]">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('billed_amount', {
      header: 'Billed',
      cell: (info) => (
        <span className="text-[var(--text-primary)]">{formatCurrency(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor('expected_amount', {
      header: 'Expected',
      cell: (info) => (
        <span className="text-[var(--text-primary)]">{formatCurrency(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor('discrepancy', {
      header: 'Discrepancy',
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className={val > 0 ? 'text-[var(--danger)]' : val < 0 ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}>
            {val > 0 ? '+' : ''}{formatCurrency(val)}
          </span>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue() as AuditLineStatus;
        return (
          <Badge variant={statusVariant[status]}>
            {statusLabels[status]}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('confidence_score', {
      header: 'Confidence',
      cell: (info) => <ConfidenceBar value={info.getValue()} showLabel />,
    }),
    columnHelper.accessor('flag_reason', {
      header: 'Reason',
      cell: (info) => (
        <span className="max-w-[160px] truncate text-sm text-[var(--text-secondary)]">
          {info.getValue()}
        </span>
      ),
    }),
    ...(onApprove || onDispute
      ? [
          columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
              <div className="flex items-center gap-2">
                {onApprove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onApprove(info.row.original.id ?? info.row.id)
                    }
                  >
                    Approve
                  </Button>
                )}
                {onDispute && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[var(--danger)] hover:text-[var(--danger)]"
                    onClick={() =>
                      onDispute(info.row.original.id ?? info.row.id)
                    }
                  >
                    Dispute
                  </Button>
                )}
              </div>
            ),
          }),
        ]
      : []),
  ];

  return <DataTable columns={columns} data={items} />;
}

export { LineItemTable };
export type { LineItemTableProps };
