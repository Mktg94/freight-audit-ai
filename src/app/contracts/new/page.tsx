'use client';

import { useRouter } from 'next/navigation';
import { ContractForm } from '@/components/contracts/ContractForm';
import { PageHeader } from '@/components/layout/PageHeader';

export default function NewContractPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push('/contracts');
    }
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader title="Add Contract" />
        <ContractForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
