'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { DisputeStatusBadge } from '@/components/disputes/DisputeStatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import type { DisputeStatus } from '@/types';

interface Dispute {
  id: string;
  invoice_number: string;
  carrier_name: string;
  amount_disputed: number;
  status: DisputeStatus;
  date_created: string;
  date_sent: string | null;
  resolution_amount: number | null;
}

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetch('/api/disputes')
      .then((res) => res.json())
      .then((data) => setDisputes(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeFilter === 'all'
      ? disputes
      : disputes.filter((d) => d.status === activeFilter);

  const totalDisputed = disputes.reduce((sum, d) => sum + d.amount_disputed, 0);
  const totalDrafted = disputes
    .filter((d) => d.status === 'draft')
    .reduce((sum, d) => sum + d.amount_disputed, 0);
  const totalSent = disputes
    .filter((d) => d.status === 'sent')
    .reduce((sum, d) => sum + d.amount_disputed, 0);
  const totalRecovered = disputes
    .filter((d) => d.status === 'resolved' && d.resolution_amount)
    .reduce((sum, d) => sum + (d.resolution_amount ?? 0), 0);

  const columns: ColumnDef<Dispute>[] = [
    { accessorKey: 'invoice_number', header: 'Invoice #', enableSorting: true },
    { accessorKey: 'carrier_name', header: 'Carrier', enableSorting: true },
    {
      accessorKey: 'amount_disputed',
      header: 'Amount Disputed ($)',
      cell: ({ row }) => formatCurrency(row.original.amount_disputed),
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <DisputeStatusBadge status={row.original.status} />,
      enableSorting: true,
    },
    {
      accessorKey: 'date_created',
      header: 'Date Created',
      cell: ({ row }) => formatDate(row.original.date_created),
      enableSorting: true,
    },
    {
      accessorKey: 'date_sent',
      header: 'Date Sent',
      cell: ({ row }) => (row.original.date_sent ? formatDate(row.original.date_sent) : '—'),
      enableSorting: true,
    },
    {
      accessorKey: 'resolution_amount',
      header: 'Resolution ($)',
      cell: ({ row }) =>
        row.original.resolution_amount != null ? formatCurrency(row.original.resolution_amount) : '—',
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/disputes/${row.original.id}`)}
        >
          <Eye size={14} className="mr-1" />
          View
        </Button>
      ),
    },
  ];

  const filterTabs = [
    { value: 'all', label: 'All', content: null },
    { value: 'draft', label: 'Draft', content: null },
    { value: 'sent', label: 'Sent', content: null },
    { value: 'resolved', label: 'Resolved', content: null },
    { value: 'rejected', label: 'Rejected', content: null },
  ].map((t) => ({
    ...t,
    content: (
      <DataTable
        columns={columns}
        data={t.value === 'all' ? disputes : disputes.filter((d) => d.status === t.value)}
        loading={loading}
        emptyMessage={`No ${t.label.toLowerCase()} disputes found.`}
      />
    ),
  }));

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Disputes" description={`${formatCurrency(totalDisputed)} total in dispute`} />

        <div className="mb-4">
          <Tabs tabs={filterTabs} defaultValue="all" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <div>
            <span className="text-[var(--text-secondary)]">Total Drafted</span>
            <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatCurrency(totalDrafted)}</p>
          </div>
          <div>
            <span className="text-[var(--text-secondary)]">Total Sent</span>
            <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatCurrency(totalSent)}</p>
          </div>
          <div>
            <span className="text-[var(--text-secondary)]">Total Recovered</span>
            <p className="mt-1 font-semibold text-[var(--success)]">{formatCurrency(totalRecovered)}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
