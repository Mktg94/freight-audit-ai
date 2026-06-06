import 'server-only';



import type { AuditInvoiceResult } from '@/types';

export async function generateDisputeLetterWithClaude(params: {
  companyName: string;
  carrierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  disputedItems: AuditInvoiceResult;
  totalDisputed: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

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

  const { claudeMessagesCreate } = await import('./claudeClient');
  const text = await claudeMessagesCreate({
    apiKey,
    model: 'claude-haiku-3',
    maxTokens: 1000,
    temperature: 0.2,
    system: 'Write a professional dispute letter. Return only text.',
    userContent: prompt,
  });

  return text.trim();
}

