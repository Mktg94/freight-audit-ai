import 'server-only';



import type {
  AuditInvoiceResult,
  ExtractedInvoiceLineItem,
} from '@/types';

function buildAuditPrompt(contractJson: unknown, lineItemsJson: unknown) {
  return `You are a freight billing auditor. Compare each invoice line item against the contract rates provided.
For each line item, determine if the charge is correct, overcharged, undercharged, or suspicious.

Contract Rates:
${JSON.stringify(contractJson)}

Invoice Line Items:
${JSON.stringify(lineItemsJson)}

Return ONLY valid JSON array:
[
  {
    "description": "string",
    "billed_amount": number,
    "expected_amount": number,
    "discrepancy": number,
    "status": "correct" | "overcharged" | "undercharged" | "not_in_contract" | "suspicious",
    "confidence_score": number (0.0 to 1.0),
    "flag_reason": "string (explain exactly why this is flagged, referencing the contract rate)"
  }
]

Only flag items where there is a clear, calculable discrepancy. 
For items not in the contract, flag as "not_in_contract" with confidence 0.7.`;
}

export async function auditInvoiceWithClaude(params: {
  contractJson: unknown;
  lineItems: ExtractedInvoiceLineItem[];
}): Promise<AuditInvoiceResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

  const prompt = buildAuditPrompt(params.contractJson, params.lineItems);

  const { claudeMessagesCreate } = await import('./claudeClient');
  const text = await claudeMessagesCreate({
    apiKey,
    model: 'claude-haiku-3',
    maxTokens: 1800,
    temperature: 0,
    system: 'Return ONLY JSON. No Markdown.',
    userContent: prompt,
  });

  const parsed = JSON.parse(text) as AuditInvoiceResult;
  return parsed;
}

