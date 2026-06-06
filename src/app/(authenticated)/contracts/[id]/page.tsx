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
        const json = await res.json();
        const c = json.data ?? json.contract ?? json;
        setInitialData({
          carrier_name: c.carrier_name ?? '',
          effective_date: c.effective_date ?? '',
          expiry_date: c.expiry_date ?? '',
          rate_per_lb: c.base_rate_per_lb ?? '',
          rate_per_mile: c.base_rate_per_mile ?? '',
          minimum_charge: '',
          fuel_surcharge: c.fuel_surcharge_pct ?? '',
          residential_delivery_fee: c.residential_surcharge ?? '',
          liftgate_fee: c.liftgate_fee ?? '',
          detention_rate: c.detention_rate_per_hr ?? '',
          inside_delivery_fee: c.inside_delivery_fee ?? '',
          redelivery_fee: '',
          custom_rules: c.custom_rules ?? [],
        });
      } catch {
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  const handleSubmit = async (formData: any) => {
    const { id } = await params;
    const res = await fetch(`/api/contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
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
