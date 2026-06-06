export type InvoiceStatus =
  | 'pending'
  | 'auditing'
  | 'flagged'
  | 'approved'
  | 'disputed';

export type LineItemStatus = 'pending' | 'approved' | 'disputed';

export type DisputeStatus = 'draft' | 'sent' | 'resolved' | 'rejected';

export type AuditLineStatus =
  | 'correct'
  | 'overcharged'
  | 'undercharged'
  | 'not_in_contract'
  | 'suspicious';

export interface ExtractedInvoiceLineItem {
  description: string;
  billed_amount: number;
  quantity: number;
  unit: string;
}

export interface ExtractedInvoiceData {
  carrier_name: string;
  invoice_number: string;
  invoice_date: string; // YYYY-MM-DD
  shipment_date: string; // YYYY-MM-DD
  origin: string;
  destination: string;
  weight_lbs: number;
  distance_miles: number;
  line_items: ExtractedInvoiceLineItem[];
  total_billed: number;
}

export interface ContractCustomRule {
  name: string;
  expectedValue: string;
  type: 'Fixed Fee' | 'Percentage' | 'Not Allowed';
}

export interface AuditLineItemResult {
  description: string;
  billed_amount: number;
  expected_amount: number;
  discrepancy: number;
  status: AuditLineStatus;
  confidence_score: number; // 0.0 - 1.0
  flag_reason: string;
}

export type AuditInvoiceResult = AuditLineItemResult[];

