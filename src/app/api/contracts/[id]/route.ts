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
    const supabase = await getSupabaseServerClientAsync();

    const dbRecord = {
      carrier_name: body.carrier_name,
      effective_date: body.effective_date || null,
      expiry_date: body.expiry_date || null,
      base_rate_per_lb: body.rate_per_lb ? String(body.rate_per_lb) : null,
      base_rate_per_mile: body.rate_per_mile ? String(body.rate_per_mile) : null,
      fuel_surcharge_pct: body.fuel_surcharge ? String(body.fuel_surcharge) : null,
      residential_surcharge: body.residential_delivery_fee ? String(body.residential_delivery_fee) : null,
      liftgate_fee: body.liftgate_fee ? String(body.liftgate_fee) : null,
      detention_rate_per_hr: body.detention_rate ? String(body.detention_rate) : null,
      inside_delivery_fee: body.inside_delivery_fee ? String(body.inside_delivery_fee) : null,
      custom_rules: body.custom_rules ?? null,
    };

    const { data, error } = await supabase
      .from('contracts')
      .update(dbRecord)
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

    const supabase = await getSupabaseServerClientAsync();

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
