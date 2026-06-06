'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContractForm } from '@/components/contracts/ContractForm';
import { PageHeader } from '@/components/layout/PageHeader';

export default function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      try {
        const res = await fetch(`/api/contracts/${id}`);
        const data = await res.json();
        setInitialData(data.contract ?? data);
      } catch {
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  const handleSubmit = async (data: any) => {
    const { id } = await params;
    const res = await fetch(`/api/contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push('/contracts');
    }
  };

  if (loading) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-sm text-[var(--text-muted)]">Loading contract...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader title="Edit Contract" />
        <ContractForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
