import 'server-only';

import type { ExtractedInvoiceData } from '@/types';

export async function extractInvoiceWithVeryfi(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ extractedText: string; extractedData: ExtractedInvoiceData }> {
  const { processDocumentWithVeryfi } = await import('./veryfiClient');

  const doc = await processDocumentWithVeryfi(fileBuffer, fileName);

  const extractedText = doc.ocr_text ?? '';

  const lineItems = (doc.line_items ?? []).map((li) => ({
    description: li.description || '',
    billed_amount: li.total || 0,
    quantity: li.quantity ?? 1,
    unit: li.unit_of_measure ?? 'each',
  }));

  const extractedData: ExtractedInvoiceData = {
    carrier_name: doc.vendor?.name ?? '',
    invoice_number: doc.invoice_number ?? '',
    invoice_date: doc.invoice_date ?? '',
    shipment_date: doc.date ?? '',
    origin: doc.origin ?? '',
    destination: doc.destination ?? '',
    weight_lbs: doc.weight ?? 0,
    distance_miles: 0,
    line_items: lineItems,
    total_billed: doc.total ?? 0,
  };

  return { extractedText, extractedData };
}
