'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileSignature } from 'lucide-react';
import { ContractCard } from '@/components/contracts/ContractCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface Contract {
  id: string;
  carrier_name: string;
  effective_date: string;
  expiry_date: string;
  key_rates: {
    rate_per_lb?: number;
    rate_per_mile?: number;
    minimum_charge?: number;
  };
}

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contracts');
      const data = await res.json();
      const rawList = data.data ?? data.contracts ?? [];
      setContracts(
        rawList.map((c: Record<string, unknown>) => ({
          id: c.id,
          carrier_name: c.carrier_name,
          effective_date: c.effective_date,
          expiry_date: c.expiry_date,
          key_rates: {
            rate_per_lb: c.base_rate_per_lb != null ? Number(c.base_rate_per_lb) : undefined,
            rate_per_mile: c.base_rate_per_mile != null ? Number(c.base_rate_per_mile) : undefined,
            minimum_charge: c.minimum_charge != null ? Number(c.minimum_charge) : undefined,
          },
        }))
      );
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this contract?')) return;
      try {
        await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
        setContracts((prev) => prev.filter((c) => c.id !== id));
      } catch {}
    },
    [],
  );

  if (loading) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <LoadingSpinner size="md" text="Loading contracts..." />
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Contracts">
          <Link href="/contracts/new">
            <Button>
              <Plus size={16} className="mr-1" /> Add Contract
            </Button>
          </Link>
        </PageHeader>

        {contracts.length === 0 ? (
          <EmptyState
            icon={FileSignature}
            title="No contracts yet"
            description="Add your first carrier contract to enable AI auditing."
            action={
              <Link href="/contracts/new">
                <Button>Add Contract</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onEdit={(id) => router.push(`/contracts/${id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
