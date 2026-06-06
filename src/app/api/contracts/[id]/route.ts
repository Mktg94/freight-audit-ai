import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient, getAuthenticatedUserOrgId } from '@/lib/supabase/server';

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

    const cookieStore = cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (error) throw error;
    if (!data) {
      return Response.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch contract' },
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
    const cookieStore = cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const { data, error } = await supabase
      .from('contracts')
      .update(body)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return Response.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update contract' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) throw error;

    return Response.json({ success: true, data: null });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete contract' },
      { status: 400 }
    );
  }
}
