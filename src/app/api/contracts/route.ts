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

    const dbRecord = {
      org_id: orgId,
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
      .insert(dbRecord)
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
