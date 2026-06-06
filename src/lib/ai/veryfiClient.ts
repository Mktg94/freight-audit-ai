import 'server-only';

interface VeryfiLineItem {
  description: string;
  total: number;
  quantity?: number;
  unit_of_measure?: string;
  sku?: string;
}

interface VeryfiDocumentResponse {
  id: number;
  vendor?: { name?: string };
  invoice_number?: string;
  invoice_date?: string;
  date?: string;
  origin?: string;
  destination?: string;
  weight?: number;
  total?: number;
  line_items?: VeryfiLineItem[];
  ocr_text?: string;
}

export async function processDocumentWithVeryfi(
  fileBuffer: Buffer,
  fileName: string
): Promise<VeryfiDocumentResponse> {
  const clientId = process.env.VERYFI_CLIENT_ID;
  const clientSecret = process.env.VERYFI_CLIENT_SECRET;
  const apiKey = process.env.VERYFI_API_KEY;

  if (!clientId || !clientSecret || !apiKey) {
    throw new Error('Missing Veryfi credentials');
  }

  const base64Data = fileBuffer.toString('base64');

  const res = await fetch('https://api.veryfi.com/api/v8/partner/documents/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': clientId,
      Authorization: `apikey ${apiKey}`,
    },
    body: JSON.stringify({
      file_data: base64Data,
      file_name: fileName,
      auto_rotate: true,
      boost_mode: true,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Veryfi API error: ${res.status} ${txt}`);
  }

  const json = (await res.json()) as VeryfiDocumentResponse;
  return json;
}
