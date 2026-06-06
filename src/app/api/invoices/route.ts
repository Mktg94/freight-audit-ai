import { NextRequest } from 'next/server';
import { getSupabaseServerClientAsync, getAuthenticatedUserOrgId } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const offset = (page - 1) * limit;

    const supabase = await getSupabaseServerClientAsync();

    let countQuery = supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    let dataQuery = supabase
      .from('invoices')
      .select('*')
      .eq('org_id', orgId);

    if (status) {
      countQuery = countQuery.eq('status', status);
      dataQuery = dataQuery.eq('status', status);
    }

    if (search) {
      const searchFilter = `carrier_name.ilike.%${search}%,invoice_number.ilike.%${search}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    if (dateFrom) {
      countQuery = countQuery.gte('invoice_date', dateFrom);
      dataQuery = dataQuery.gte('invoice_date', dateFrom);
    }

    if (dateTo) {
      countQuery = countQuery.lte('invoice_date', dateTo);
      dataQuery = dataQuery.lte('invoice_date', dateTo);
    }

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    const { data, error } = await dataQuery
      .order('uploaded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return Response.json({
      success: true,
      data: {
        invoices: data,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
