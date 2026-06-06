'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FileText, DollarSign, TrendingUp, Percent } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DisputeStatusBadge } from '@/components/disputes/DisputeStatusBadge';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

interface MonthlyTrend {
  month: string;
  billed: number;
  approved: number;
}

interface TopCarrier {
  name: string;
  discrepancy: number;
}

interface ErrorType {
  name: string;
  value: number;
}

interface RecentDispute {
  id: string;
  invoice_number: string;
  carrier_name: string;
  amount_disputed: number;
  status: string;
  date_created: string;
}

interface ReportData {
  totalInvoicesAudited: number;
  totalOverchargesDetected: number;
  totalSavingsRecovered: number;
  averageErrorRate: number;
  monthlyTrend: MonthlyTrend[];
  topCarriers: TopCarrier[];
  errorTypes: ErrorType[];
  recentDisputes: RecentDispute[];
}

const dateRanges = [
  { label: 'Last 30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '12 months', value: '12m' },
  { label: 'Custom', value: 'custom' },
];

const CHART_TEAL = '#2DD4BF';
const CHART_RED = '#EF4444';
const CHART_GREEN = '#10B981';
const CHART_AMBER = '#F59E0B';
const CHART_GRID = '#1F2D45';
const CHART_TEXT = '#94A3B8';

const PIE_COLORS = [CHART_TEAL, CHART_RED, CHART_AMBER, CHART_GREEN, '#6366F1', '#EC4899'];

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  accent?: 'danger' | 'success';
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            accent === 'danger'
              ? 'bg-[var(--danger)]/10'
              : accent === 'success'
                ? 'bg-[var(--success)]/10'
                : 'bg-[var(--primary)]/10',
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              accent === 'danger'
                ? 'text-[var(--danger)]'
                : accent === 'success'
                  ? 'text-[var(--success)]'
                  : 'text-[var(--primary)]',
            )}
          />
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 font-[var(--font-syne)] text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [range, setRange] = useState('12m');

  useEffect(() => {
    fetch(`/api/stats?range=${range}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, [range]);

  if (!data) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-[var(--text-muted)]">Loading reports...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Reports & Analytics">
          <div className="flex gap-2">
            {dateRanges.map((r) => (
              <Button
                key={r.value}
                variant={range === r.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </PageHeader>

        <div className="mb-8 grid grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Invoices Audited"
            value={data.totalInvoicesAudited.toLocaleString()}
          />
          <StatCard
            icon={DollarSign}
            label="Total Overcharges Detected"
            value={formatCurrency(data.totalOverchargesDetected)}
            accent="danger"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Savings Recovered"
            value={formatCurrency(data.totalSavingsRecovered)}
            accent="success"
          />
          <StatCard
            icon={Percent}
            label="Average Error Rate"
            value={`${(data.averageErrorRate * 100).toFixed(1)}%`}
          />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data.monthlyTrend}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_TEAL} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_TEAL} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: CHART_TEXT, fontSize: 12 }} stroke={CHART_GRID} />
                <YAxis tick={{ fill: CHART_TEXT, fontSize: 12 }} stroke={CHART_GRID} />
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #1F2D45',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="billed"
                  stroke={CHART_RED}
                  fill="none"
                  strokeWidth={2}
                  name="Billed"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke={CHART_TEAL}
                  fill="url(#tealGrad)"
                  strokeWidth={2}
                  name="Approved"
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: CHART_TEXT }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="mb-6 grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Carriers by Discrepancy</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topCarriers} layout="vertical">
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: CHART_TEXT, fontSize: 12 }} stroke={CHART_GRID} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: CHART_TEXT, fontSize: 11 }}
                    stroke={CHART_GRID}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#111827',
                      border: '1px solid #1F2D45',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Bar dataKey="discrepancy" fill={CHART_TEAL} radius={[0, 4, 4, 0]} name="Discrepancy" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Types Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.errorTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {data.errorTypes.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#111827',
                      border: '1px solid #1F2D45',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: CHART_TEXT }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border border-[var(--border)]">
              <table className="w-full text-sm text-[var(--text-primary)]">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Invoice #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Carrier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentDisputes.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-[var(--border)] transition-colors even:bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                    >
                      <td className="px-4 py-3 font-medium">{d.invoice_number}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{d.carrier_name}</td>
                      <td className="px-4 py-3">{formatCurrency(d.amount_disputed)}</td>
                      <td className="px-4 py-3">
                        <DisputeStatusBadge status={d.status as any} />
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(d.date_created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
