'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { LineItemTable } from '@/components/invoices/LineItemTable';
import { AuditResultPanel } from '@/components/invoices/AuditResultPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { ArrowLeft, FileText } from 'lucide-react';
import type { InvoiceStatus, AuditLineItemResult } from '@/types';

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  carrier_name: string;
  upload_date: string;
  invoice_date: string;
  origin: string;
  destination: string;
  weight_lbs: number;
  total_billed: number;
  total_approved: number;
  discrepancy: number;
  status: InvoiceStatus;
  line_items: (AuditLineItemResult & { id?: string })[];
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<(AuditLineItemResult & { id?: string }) | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      try {
        const res = await fetch(`/api/invoices/${id}?include=line_items`);
        const data = await res.json();
        setInvoice(data.invoice ?? data);
      } catch {
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  const handleApproveItem = useCallback((itemId: string) => {
    // optimistic update
  }, []);

  const handleDisputeItem = useCallback((itemId: string) => {
    // optimistic update
  }, []);

  const flaggedCount = invoice?.line_items?.filter(
    (i) => i.status !== 'correct',
  ).length ?? 0;
  const totalDiscrepancy = invoice?.line_items?.reduce(
    (sum, i) => sum + (i.status !== 'correct' ? i.discrepancy : 0),
    0,
  ) ?? 0;
  const approvedCount = invoice?.line_items?.filter(
    (i) => i.status === 'correct',
  ).length ?? 0;

  if (loading) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm text-[var(--text-muted)]">Loading invoice...</p>
        </div>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm text-[var(--danger)]">Invoice not found.</p>
          <Button variant="ghost" onClick={() => router.push('/invoices')}>
            <ArrowLeft size={16} className="mr-1" /> Back to Invoices
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <Button variant="ghost" onClick={() => router.push('/invoices')} className="mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Invoices
        </Button>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-[var(--font-syne)] text-2xl font-semibold text-[var(--text-primary)]">
                Invoice {invoice.invoice_number}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--text-secondary)]">
              <span>Carrier: <strong className="text-[var(--text-primary)]">{invoice.carrier_name}</strong></span>
              <span>Date: {formatDate(invoice.invoice_date)}</span>
              <span>
                Origin→Destination:{' '}
                <strong className="text-[var(--text-primary)]">
                  {invoice.origin}→{invoice.destination}
                </strong>
              </span>
              <span>Weight: {invoice.weight_lbs?.toLocaleString()} lbs</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Generate Dispute
            </Button>
            <Button variant="outline" size="sm">
              Approve All Clean Items
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-xs text-[var(--text-muted)]">Total Billed</p>
            <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
              {formatCurrency(invoice.total_billed)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[var(--text-muted)]">Total Approved</p>
            <p className="mt-1 text-xl font-semibold text-[var(--success)]">
              {formatCurrency(invoice.total_approved)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[var(--text-muted)]">Discrepancy</p>
            <p
              className={`mt-1 text-xl font-semibold ${
                invoice.discrepancy > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'
              }`}
            >
              {invoice.discrepancy > 0 ? '+' : ''}
              {formatCurrency(invoice.discrepancy)}
            </p>
          </Card>
        </div>

        <LineItemTable
          items={invoice.line_items ?? []}
          onApprove={handleApproveItem}
          onDispute={handleDisputeItem}
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-sm text-[var(--text-secondary)]">
            {flaggedCount} item{flaggedCount !== 1 ? 's' : ''} flagged,{' '}
            {formatCurrency(totalDiscrepancy)} in potential overcharges.{' '}
            {approvedCount} item{approvedCount !== 1 ? 's' : ''} approved.
          </p>
          <Button>
            <FileText size={16} className="mr-1" /> Finalize &amp; Create Dispute Letter
          </Button>
        </div>

        <AuditResultPanel
          item={selectedItem}
          open={panelOpen}
          onClose={() => {
            setPanelOpen(false);
            setSelectedItem(null);
          }}
          onApprove={() => {
            if (selectedItem) handleApproveItem(selectedItem.id ?? '');
            setPanelOpen(false);
            setSelectedItem(null);
          }}
          onDispute={() => {
            if (selectedItem) handleDisputeItem(selectedItem.id ?? '');
            setPanelOpen(false);
            setSelectedItem(null);
          }}
        />
      </div>
    </main>
  );
}
