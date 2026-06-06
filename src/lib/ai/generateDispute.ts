import 'server-only';

import type { AuditInvoiceResult } from '@/types';

export async function generateDisputeLetterWithGemini(params: {
  companyName: string;
  carrierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  disputedItems: AuditInvoiceResult;
  totalDisputed: number;
}): Promise<string> {
  const prompt = `You are a professional freight billing dispute specialist. 
Write a formal, firm, professional dispute letter for the following billing discrepancies.

Company Name: ${params.companyName}
Carrier Name: ${params.carrierName}
Invoice Number: ${params.invoiceNumber}
Invoice Date: ${params.invoiceDate}
Disputed Items: ${JSON.stringify(params.disputedItems)}
Total Amount Disputed: $${params.totalDisputed}

The letter should:
1. Reference the specific contract rates
2. List each disputed charge with expected vs billed amounts
3. Request a credit memo or corrected invoice within 15 business days
4. Be professional but firm in tone
5. Include a formal closing

Return only the letter text, no JSON.`;

  const { geminiGenerateText } = await import('./geminiClient');
  const text = await geminiGenerateText({
    system: 'Write a professional dispute letter. Return only text.',
    userContent: prompt,
    temperature: 0.2,
  });

  return text.trim();
}
