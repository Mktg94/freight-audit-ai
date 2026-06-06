import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient, getAuthenticatedUserOrgId } from '@/lib/supabase/server';

export async function GET() {
  try {
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

    const { count: invoicesThisMonth } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('uploaded_at', startOfMonth);

    const { data: allInvoices } = await supabase
      .from('invoices')
      .select('total_billed, total_savings, status, uploaded_at')
      .eq('org_id', orgId);

    const totalBilled = (allInvoices ?? []).reduce(
      (sum, inv) => sum + parseFloat(inv.total_billed ?? '0'),
      0
    );

    const totalSavings = (allInvoices ?? []).reduce(
      (sum, inv) => sum + parseFloat(inv.total_savings ?? '0'),
      0
    );

    const flaggedCount = (allInvoices ?? []).filter(
      (inv) => inv.status === 'flagged'
    ).length;

    const monthlySavings: Array<{ month: string; savings: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = d.toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0).toISOString();

      const monthData = (allInvoices ?? []).filter((inv) => {
        return inv.uploaded_at >= monthStart && inv.uploaded_at <= monthEnd;
      });

      const savings = monthData.reduce(
        (sum, inv) => sum + parseFloat(inv.total_savings ?? '0'),
        0
      );

      monthlySavings.push({
        month: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        savings,
      });
    }

    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('org_id', orgId)
      .order('uploaded_at', { ascending: false })
      .limit(5);

    const { data: topFlaggedLineItems } = await supabase
      .from('line_items')
      .select('*, invoices!inner(org_id)')
      .eq('invoices.org_id', orgId)
      .not('discrepancy', 'is', null)
      .not('discrepancy', 'eq', '0')
      .order('discrepancy', { ascending: false })
      .limit(10);

    return Response.json({
      success: true,
      data: {
        invoicesThisMonth: invoicesThisMonth ?? 0,
        totalBilled,
        totalSavings,
        flaggedCount,
        monthlySavings,
        recentInvoices: recentInvoices ?? [],
        topFlaggedLineItems: (topFlaggedLineItems ?? []).map((item) => ({
          description: item.description,
          billed_amount: item.billed_amount,
          expected_amount: item.expected_amount,
          discrepancy: item.discrepancy,
          ai_flag_reason: item.ai_flag_reason,
          confidence_score: item.confidence_score,
        })),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
