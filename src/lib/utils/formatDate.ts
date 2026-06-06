import { format, parseISO } from 'date-fns';

export function formatDate(date: string | Date | null | undefined, fmt: string = 'MMM dd, yyyy'): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateShort(date: string | Date | null | undefined): string {
  return formatDate(date, 'MMM dd');
}

export function formatDateRange(from: string | Date | null | undefined, to: string | Date | null | undefined): string {
  if (!from && !to) return '—';
  return `${formatDate(from)} - ${formatDate(to)}`;
}
