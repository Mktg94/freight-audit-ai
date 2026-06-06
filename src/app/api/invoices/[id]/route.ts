import { NextRequest } from 'next/server';
import { getSupabaseServerClientAsync, getAuthenticatedUserOrgId } from '@/lib/supabase/server';

export async function GET(
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

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (error) throw error;
    if (!invoice) {
      return Response.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    const { data: lineItems } = await supabase
      .from('line_items')
      .select('*')
      .eq('invoice_id', id)
      .order('created_at', { ascending: true });

    return Response.json({ success: true, data: { ...invoice, line_items: lineItems ?? [] } });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await getSupabaseServerClientAsync();

    const { data, error } = await supabase
      .from('invoices')
      .update(body)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return Response.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update invoice' },
      { status: 400 }
    );
  }
}
