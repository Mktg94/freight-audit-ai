import { NextRequest } from 'next/server';
import { getSupabaseServerClientAsync, getAuthenticatedUserOrgId } from '@/lib/supabase/server';
import { Resend } from 'resend';

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

    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (disputeError) throw disputeError;
    if (!dispute) {
      return Response.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }

    if (!dispute.carrier_email) {
      return Response.json(
        { success: false, error: 'Carrier email is required to send dispute' },
        { status: 400 }
      );
    }

    if (!dispute.dispute_letter_text) {
      return Response.json(
        { success: false, error: 'Dispute letter text is required' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return Response.json({ success: false, error: 'Resend API key not configured' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', dispute.invoice_id)
      .single();

    await resend.emails.send({
      from: 'disputes@freightaudit.ai',
      to: dispute.carrier_email,
      subject: `Freight Bill Dispute - Invoice ${invoice?.invoice_number ?? ''}`,
      text: dispute.dispute_letter_text,
    });

    const { data: updatedDispute, error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return Response.json({ success: true, data: updatedDispute });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send dispute' },
      { status: 500 }
    );
  }
}
