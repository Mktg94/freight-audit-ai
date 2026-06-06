'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Send, CheckCircle, Circle, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DisputeLetter } from '@/components/disputes/DisputeLetter';
import { DisputeStatusBadge } from '@/components/disputes/DisputeStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import type { DisputeStatus } from '@/types';

interface LineItem {
  description: string;
  billed_amount: number;
  expected_amount: number;
  discrepancy: number;
}

interface DisputeDetail {
  id: string;
  invoice_number: string;
  carrier_name: string;
  carrier_email: string;
  amount_disputed: number;
  invoice_date: string;
  status: DisputeStatus;
  letter_text: string;
  line_items: LineItem[];
  date_created: string;
  date_sent: string | null;
  resolution_amount: number | null;
}

const timelineSteps = [
  { key: 'draft', label: 'Created', icon: Clock },
  { key: 'sent', label: 'Sent', icon: Send },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle },
];

export default function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [letterText, setLetterText] = useState('');
  const [carrierEmail, setCarrierEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/disputes/${id}`)
      .then((res) => res.json())
      .then((data: DisputeDetail) => {
        setDispute(data);
        setLetterText(data.letter_text);
        setCarrierEmail(data.carrier_email);
      })
      .catch(() => {});
  }, [id]);

  const handleSend = async () => {
    if (!carrierEmail) return;
    setSending(true);
    try {
      await fetch(`/api/disputes/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier_email: carrierEmail, letter_text: letterText }),
      });
      router.refresh();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const currentStepIndex = dispute
    ? timelineSteps.findIndex((s) => s.key === dispute.status) + (dispute.status === 'rejected' ? 3 : 0)
    : 0;

  if (!dispute) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-[var(--text-muted)]">Loading dispute...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => router.push('/disputes')} className="mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Disputes
        </Button>

        <PageHeader title={`Dispute — Invoice ${dispute.invoice_number}`}>
          <DisputeStatusBadge status={dispute.status} />
        </PageHeader>

        <div className="flex gap-6">
          <div className="w-3/5">
            <DisputeLetter letterText={letterText} editable onChange={setLetterText} />
          </div>

          <div className="w-2/5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Total Amount</span>
                  <span className="font-semibold">{formatCurrency(dispute.amount_disputed)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Carrier</span>
                  <span>{dispute.carrier_name}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Invoice Date</span>
                  <span>{formatDate(dispute.invoice_date)}</span>
                </div>
                {dispute.resolution_amount != null && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Resolution</span>
                      <span className="text-[var(--success)]">{formatCurrency(dispute.resolution_amount)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Line Items Disputed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dispute.line_items.map((item, i) => (
                    <div key={i} className="rounded-lg border border-[var(--border)] p-3 text-sm">
                      <p className="font-medium text-[var(--text-primary)]">{item.description}</p>
                      <div className="mt-1 flex justify-between text-xs text-[var(--text-secondary)]">
                        <span>Billed: {formatCurrency(item.billed_amount)}</span>
                        <span>Expected: {formatCurrency(item.expected_amount)}</span>
                        <span className="text-[var(--danger)]">Diff: {formatCurrency(item.discrepancy)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send Dispute</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  label="Carrier Email"
                  type="email"
                  value={carrierEmail}
                  onChange={(e) => setCarrierEmail(e.target.value)}
                  placeholder="carrier@example.com"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSend} disabled={sending || !carrierEmail} className="flex-1">
                    <Send size={14} className="mr-1" />
                    {sending ? 'Sending...' : 'Send Dispute Email'}
                  </Button>
                  <Button variant="outline" disabled>
                    <Download size={14} className="mr-1" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {timelineSteps.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i <= currentStepIndex && dispute.status !== 'rejected';
                    const isRejected = dispute.status === 'rejected' && i === 1;
                    return (
                      <div key={step.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                              isActive && !isRejected
                                ? 'border-[var(--primary)] text-[var(--primary)]'
                                : isRejected
                                  ? 'border-[var(--danger)] text-[var(--danger)]'
                                  : 'border-[var(--border)] text-[var(--text-muted)]'
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          {i < timelineSteps.length - 1 && (
                            <div
                              className={`h-8 w-px ${
                                isActive && !isRejected && i < currentStepIndex
                                  ? 'bg-[var(--primary)]'
                                  : 'bg-[var(--border)]'
                              }`}
                            />
                          )}
                        </div>
                        <div className="pb-6">
                          <p
                            className={`text-sm font-medium ${
                              isActive && !isRejected
                                ? 'text-[var(--text-primary)]'
                                : isRejected
                                  ? 'text-[var(--danger)]'
                                  : 'text-[var(--text-muted)]'
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.key === 'draft' && dispute.date_created && (
                            <p className="text-xs text-[var(--text-secondary)]">{formatDate(dispute.date_created)}</p>
                          )}
                          {step.key === 'sent' && dispute.date_sent && (
                            <p className="text-xs text-[var(--text-secondary)]">{formatDate(dispute.date_sent)}</p>
                          )}
                          {step.key === 'sent' && dispute.status === 'rejected' && (
                            <p className="text-xs text-[var(--danger)]">Rejected</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
