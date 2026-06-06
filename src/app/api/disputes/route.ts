import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient, getAuthenticatedUserOrgId } from '@/lib/supabase/server';
import { generateDisputeLetterWithClaude } from '@/lib/ai/generateDispute';

export async function GET() {
  try {
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const cookieStore = cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    let disputeLetterText = body.dispute_letter_text;

    if (!disputeLetterText && body.invoice_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', body.invoice_id)
        .single();

      if (!invoice) {
        return Response.json({ success: false, error: 'Invoice not found' }, { status: 404 });
      }

      const { data: lineItems } = await supabase
        .from('line_items')
        .select('*')
        .eq('invoice_id', body.invoice_id)
        .or('discrepancy.gt.0,discrepancy.lt.0')
        .not('discrepancy', 'is', null);

      const auditResult = (lineItems ?? []).map((li) => ({
        description: li.description,
        billed_amount: parseFloat(li.billed_amount),
        expected_amount: parseFloat(li.expected_amount ?? '0'),
        discrepancy: parseFloat(li.discrepancy ?? '0'),
        status: (li.ai_flag_reason ? 'overcharged' : 'correct') as
          | 'correct'
          | 'overcharged'
          | 'undercharged'
          | 'not_in_contract'
          | 'suspicious',
        confidence_score: parseFloat(li.confidence_score ?? '0'),
        flag_reason: li.ai_flag_reason ?? '',
      }));

      const totalDisputed = auditResult.reduce((sum, item) => sum + Math.abs(item.discrepancy), 0);

      disputeLetterText = await generateDisputeLetterWithClaude({
        companyName: '',
        carrierName: invoice.carrier_name ?? '',
        invoiceNumber: invoice.invoice_number ?? '',
        invoiceDate: invoice.invoice_date ?? '',
        disputedItems: auditResult,
        totalDisputed,
      });
    }

    const { data, error } = await supabase
      .from('disputes')
      .insert({
        invoice_id: body.invoice_id,
        org_id: orgId,
        carrier_name: body.carrier_name,
        carrier_email: body.carrier_email,
        dispute_letter_text: disputeLetterText,
        total_disputed_amount: body.total_disputed_amount,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create dispute' },
      { status: 400 }
    );
  }
}
