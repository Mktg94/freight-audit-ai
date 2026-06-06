export function calculateSavings(totalBilled: number | string | null | undefined, totalApproved: number | string | null | undefined): number {
  const billed = typeof totalBilled === 'string' ? parseFloat(totalBilled) : (totalBilled ?? 0);
  const approved = typeof totalApproved === 'string' ? parseFloat(totalApproved) : (totalApproved ?? 0);
  return Math.max(0, billed - approved);
}

export function calculateErrorRate(totalBilled: number | string | null | undefined, totalSavings: number | string | null | undefined): number {
  const billed = typeof totalBilled === 'string' ? parseFloat(totalBilled) : (totalBilled ?? 0);
  const savings = typeof totalSavings === 'string' ? parseFloat(totalSavings) : (totalSavings ?? 0);
  if (billed === 0) return 0;
  return (savings / billed) * 100;
}

export function calculateTrendDirection(current: number, previous: number): 'up' | 'down' | 'flat' {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'flat';
}
