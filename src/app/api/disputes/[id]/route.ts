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

    const { data: dispute, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (error) throw error;
    if (!dispute) {
      return Response.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: dispute });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dispute' },
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
      .from('disputes')
      .update(body)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return Response.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update dispute' },
      { status: 400 }
    );
  }
}
