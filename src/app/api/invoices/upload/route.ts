import { NextRequest } from 'next/server';
import { getSupabaseServerClientAsync, getAuthenticatedUserOrgId } from '@/lib/supabase/server';
import { extractInvoiceWithVeryfi } from '@/lib/ai/extractInvoice';

export async function POST(request: NextRequest) {
  try {
    const orgId = await getAuthenticatedUserOrgId();
    if (!orgId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return Response.json({ success: false, error: 'Only PDF files are supported' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { extractedText, extractedData } = await extractInvoiceWithVeryfi(buffer, file.name);

    const supabase = await getSupabaseServerClientAsync();

    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        org_id: orgId,
        file_name: file.name,
        file_url: '',
        carrier_name: extractedData.carrier_name,
        invoice_number: extractedData.invoice_number,
        invoice_date: extractedData.invoice_date,
        shipment_date: extractedData.shipment_date,
        origin: extractedData.origin,
        destination: extractedData.destination,
        weight_lbs: String(extractedData.weight_lbs),
        distance_miles: String(extractedData.distance_miles),
        raw_extracted_text: extractedText,
        extracted_data: extractedData as unknown as Record<string, unknown>,
        total_billed: String(extractedData.total_billed),
        status: 'pending',
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    if (extractedData.line_items.length > 0) {
      const lineItems = extractedData.line_items.map((item) => ({
        invoice_id: invoiceData.id,
        description: item.description,
        billed_amount: String(item.billed_amount),
      }));

      const { error: lineItemsError } = await supabase
        .from('line_items')
        .insert(lineItems);

      if (lineItemsError) throw lineItemsError;
    }

    return Response.json({ success: true, data: { id: invoiceData.id } }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload invoice' },
      { status: 400 }
    );
  }
}
