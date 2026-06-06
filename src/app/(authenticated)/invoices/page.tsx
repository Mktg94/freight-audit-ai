'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { Search, Plus, Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { FileText } from 'lucide-react';
import type { InvoiceStatus } from '@/types';

interface Invoice {
  id: string;
  invoice_number: string;
  carrier_name: string;
  upload_date: string;
  invoice_date: string;
  total_billed: number;
  discrepancy: number;
  status: InvoiceStatus;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'approved', label: 'Approved' },
  { value: 'disputed', label: 'Disputed' },
];

const columnHelper = createColumnHelper<Invoice>();

function InvoicesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      setInvoices(data.invoices ?? data ?? []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const columns: ColumnDef<Invoice, any>[] = [
    columnHelper.accessor('invoice_number', {
      header: 'Invoice #',
      cell: (info) => (
        <Link
          href={`/invoices/${info.row.original.id}`}
          className="font-medium text-[var(--primary)] hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('carrier_name', {
      header: 'Carrier',
    }),
    columnHelper.accessor('upload_date', {
      header: 'Upload Date',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('invoice_date', {
      header: 'Invoice Date',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('total_billed', {
      header: 'Total Billed',
      cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('discrepancy', {
      header: 'Discrepancy',
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className={val > 0 ? 'text-[var(--danger)]' : ''}>
            {formatCurrency(val)}
          </span>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <InvoiceStatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/invoices/${info.row.original.id}`)}
        >
          <Eye size={16} className="mr-1" /> View
        </Button>
      ),
    }),
  ];

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Invoices">
          <Link href="/invoices/upload">
            <Button>
              <Plus size={16} className="mr-1" /> Upload Invoice
            </Button>
          </Link>
        </PageHeader>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <Input
              placeholder="Search by invoice # or carrier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          loading={loading}
          emptyMessage="No invoices found. Upload your first invoice to get started."
        />
      </div>
    </main>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="px-6 py-10 text-center text-[var(--text-muted)]">Loading invoices...</div>}>
      <InvoicesPageInner />
    </Suspense>
  );
}
