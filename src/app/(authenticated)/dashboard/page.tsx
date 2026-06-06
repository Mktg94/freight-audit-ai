import { FileText, DollarSign, TrendingDown, AlertTriangle, Upload } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { StatCard } from '@/components/dashboard/StatCard';
import { SavingsChart } from '@/components/dashboard/SavingsChart';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { FlaggedInvoicesQueue } from '@/components/dashboard/FlaggedInvoicesQueue';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { InvoiceStatus } from '@/types';

interface StatsData {
  invoicesThisMonth: number;
  totalBilled: number;
  totalSavings: number;
  flaggedCount: number;
  monthlySavings: { month: string; savings: number }[];
  recentInvoices: {
    id: string;
    invoice_number: string;
    carrier_name: string;
    total_billed: number;
    status: string;
    uploaded_at: string;
  }[];
  topFlaggedLineItems: {
    description: string;
    billed_amount: string;
    expected_amount: string;
    discrepancy: string;
    ai_flag_reason: string;
    confidence_score: number;
  }[];
}

async function getStats(): Promise<StatsData | null> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const res = await fetch(`${protocol}://${host}/api/stats`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.data as StatsData;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const chartData = (stats?.monthlySavings ?? []).map((item) => {
    const monthlyBilled = (stats?.totalBilled ?? 0) / Math.max(1, (stats?.monthlySavings?.length ?? 1));
    return {
      month: item.month,
      billed: monthlyBilled,
      approved: Math.max(0, monthlyBilled - item.savings),
    };
  });

  const flaggedItems = (stats?.topFlaggedLineItems ?? []).map((item, i) => ({
    id: `line-${i}`,
    invoice_number: item.description || `Line Item ${i + 1}`,
    flag_reason: item.ai_flag_reason || 'Rate discrepancy detected',
    discrepancy: parseFloat(item.discrepancy ?? '0'),
  }));

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-[var(--font-syne)] text-2xl font-semibold text-[var(--text-primary)]">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Overview of your freight audit activity.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Invoices This Month"
            value={(stats?.invoicesThisMonth ?? 0).toString()}
          />
          <StatCard
            icon={DollarSign}
            label="Total Billed"
            value={formatCurrency(stats?.totalBilled ?? 0)}
          />
          <StatCard
            icon={TrendingDown}
            label="Savings Captured"
            value={formatCurrency(stats?.totalSavings ?? 0)}
            trend={{ value: 12, direction: 'up' }}
          />
          <StatCard
            icon={AlertTriangle}
            label="Flagged for Review"
            value={(stats?.flaggedCount ?? 0).toString()}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="mb-4 font-[var(--font-syne)] text-base font-semibold text-[var(--text-primary)]">
                Savings vs Billed
              </h3>
              {chartData.length > 0 ? (
                <SavingsChart data={chartData} />
              ) : (
                <p className="py-12 text-center text-sm text-[var(--text-muted)]">
                  No chart data available.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="mb-4 font-[var(--font-syne)] text-base font-semibold text-[var(--text-primary)]">
                Recent Activity
              </h3>
              <RecentActivityFeed invoices={(stats?.recentInvoices ?? []).map((inv) => ({ ...inv, status: inv.status as InvoiceStatus }))} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="mb-4 font-[var(--font-syne)] text-base font-semibold text-[var(--text-primary)]">
                Flagged Items
              </h3>
              <FlaggedInvoicesQueue items={flaggedItems} />
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="mb-4 font-[var(--font-syne)] text-base font-semibold text-[var(--text-primary)]">
                Quick Upload
              </h3>
              <p className="mb-4 text-sm text-[var(--text-secondary)]">
                Upload new invoices for auditing.
              </p>
              <Link href="/invoices/upload">
                <Button className="w-full gap-2">
                  <Upload size={16} />
                  Upload Invoices
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
