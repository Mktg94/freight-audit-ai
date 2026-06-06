import { FileSignature, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/formatDate';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface ContractCardProps {
  contract: {
    id: string;
    carrier_name: string;
    effective_date: string;
    expiry_date: string;
    key_rates: {
      rate_per_lb?: number;
      rate_per_mile?: number;
      minimum_charge?: number;
    };
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function ContractCard({ contract, onEdit, onDelete }: ContractCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
              <FileSignature className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                {contract.carrier_name}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {formatDate(contract.effective_date)} –{' '}
                {formatDate(contract.expiry_date)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {contract.key_rates.rate_per_lb !== undefined && (
            <div className="rounded-lg bg-[var(--surface-2)] p-2.5 text-center">
              <p className="text-xs text-[var(--text-muted)]">Per lb</p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                {formatCurrency(contract.key_rates.rate_per_lb)}
              </p>
            </div>
          )}
          {contract.key_rates.rate_per_mile !== undefined && (
            <div className="rounded-lg bg-[var(--surface-2)] p-2.5 text-center">
              <p className="text-xs text-[var(--text-muted)]">Per mile</p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                {formatCurrency(contract.key_rates.rate_per_mile)}
              </p>
            </div>
          )}
          {contract.key_rates.minimum_charge !== undefined && (
            <div className="rounded-lg bg-[var(--surface-2)] p-2.5 text-center">
              <p className="text-xs text-[var(--text-muted)]">Min charge</p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                {formatCurrency(contract.key_rates.minimum_charge)}
              </p>
            </div>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="mt-4 flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(contract.id)}
              >
                <Edit size={16} className="mr-1" /> Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--danger)] hover:text-[var(--danger)]"
                onClick={() => onDelete(contract.id)}
              >
                <Trash2 size={16} className="mr-1" /> Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ContractCard };
export type { ContractCardProps };
