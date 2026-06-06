'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SavingsChartData {
  month: string;
  billed: number;
  approved: number;
}

interface SavingsChartProps {
  data: SavingsChartData[];
}

function formatCurrencyTooltip(value: number) {
  return `$${value.toLocaleString()}`;
}

function SavingsChart({ data }: SavingsChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1F2D45" strokeDasharray="4" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#475569', fontSize: 12 }}
            axisLine={{ stroke: '#1F2D45' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#475569', fontSize: 12 }}
            axisLine={{ stroke: '#1F2D45' }}
            tickLine={false}
            tickFormatter={formatCurrencyTooltip}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #1F2D45',
              borderRadius: '8px',
              color: '#F1F5F9',
            }}
            formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, undefined]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#94A3B8' }}
          />
          <Area
            type="monotone"
            dataKey="billed"
            name="Billed"
            stroke="#2DD4BF"
            fill="url(#billedGrad)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="approved"
            name="Approved"
            stroke="#F59E0B"
            fill="url(#approvedGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { SavingsChart };
export type { SavingsChartProps, SavingsChartData };
