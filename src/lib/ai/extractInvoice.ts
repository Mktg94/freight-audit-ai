import 'server-only';



import type { ExtractedInvoiceData } from '@/types';

function buildExtractionPrompt(invoiceText: string) {
  return `You are a freight invoice data extraction specialist. 
Extract ALL line items and shipment details from the following invoice text.

Return ONLY valid JSON with this exact structure:
{
  "carrier_name": "string",
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "shipment_date": "YYYY-MM-DD",
  "origin": "string",
  "destination": "string",
  "weight_lbs": number,
  "distance_miles": number,
  "line_items": [
    {
      "description": "string",
      "billed_amount": number,
      "quantity": number,
      "unit": "string"
    }
  ],
  "total_billed": number
}

Invoice text:
${invoiceText}`;
}

export async function extractInvoiceWithClaude(invoiceText: string): Promise<ExtractedInvoiceData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

  const prompt = buildExtractionPrompt(invoiceText);

  const { claudeMessagesCreate } = await import('./claudeClient');
  const text = await claudeMessagesCreate({
    apiKey,
    model: 'claude-haiku-3',
    maxTokens: 1500,
    temperature: 0,
    system: 'Return ONLY JSON and nothing else.',
    userContent: prompt,
  });

  const parsed = JSON.parse(text) as ExtractedInvoiceData;
  return parsed;
}

