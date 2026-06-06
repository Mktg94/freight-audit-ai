import { NextRequest } from 'next/server';
import { getSupabaseServerClientAsync, getAuthenticatedUserOrgId } from '@/lib/supabase/server';
import { auditInvoiceWithClaude } from '@/lib/ai/auditInvoice';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await getSupabaseServerClientAsync();

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (invoiceError) throw invoiceError;
    if (!invoice) {
      return Response.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    await supabase
      .from('invoices')
      .update({ status: 'auditing' })
      .eq('id', id);

    const { data: lineItems, error: lineItemsError } = await supabase
      .from('line_items')
      .select('*')
      .eq('invoice_id', id);

    if (lineItemsError) throw lineItemsError;

    let contractJson: Record<string, unknown> | null = null;
    if (invoice.contract_id) {
      const { data: contract } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', invoice.contract_id)
        .single();
      contractJson = contract;
    }

    const auditResult = await auditInvoiceWithClaude({
      contractJson,
      lineItems: (lineItems ?? []).map((li) => ({
        description: li.description,
        billed_amount: parseFloat(li.billed_amount),
        quantity: 1,
        unit: 'each',
      })),
    });

    let totalApproved = 0;
    let totalSavings = 0;
    let hasFlags = false;

    for (const auditItem of auditResult) {
      const matchingLineItem = (lineItems ?? []).find(
        (li) => li.description === auditItem.description
      );
      if (!matchingLineItem) continue;

      const expectedAmount = String(auditItem.expected_amount);
      const discrepancy = String(auditItem.discrepancy);
      totalApproved += auditItem.expected_amount;
      totalSavings += auditItem.discrepancy;

      if (auditItem.status !== 'correct') hasFlags = true;

      await supabase
        .from('line_items')
        .update({
          expected_amount: expectedAmount,
          discrepancy: discrepancy,
          ai_flag_reason: auditItem.flag_reason,
          confidence_score: String(auditItem.confidence_score),
          status: auditItem.status === 'correct' ? 'approved' : 'pending',
        })
        .eq('id', matchingLineItem.id);
    }

    const newStatus = hasFlags ? 'flagged' : 'approved';

    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: newStatus,
        total_approved: String(totalApproved),
        total_savings: String(totalSavings),
        audited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return Response.json({ success: true, data: updatedInvoice });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to audit invoice' },
      { status: 500 }
    );
  }
}
