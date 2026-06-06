import { NextRequest } from 'next/server';
import { getSupabaseServerClientAsync, getAuthenticatedUserOrgId } from '@/lib/supabase/server';

export async function GET() {
  try {
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await getSupabaseServerClientAsync();

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch contracts' },
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
    const supabase = await getSupabaseServerClientAsync();

    const { data, error } = await supabase
      .from('contracts')
      .insert({ ...body, org_id: orgId })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create contract' },
      { status: 400 }
    );
  }
}
