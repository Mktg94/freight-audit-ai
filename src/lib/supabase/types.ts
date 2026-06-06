// Minimal Database typing placeholder.
// For a production setup, you should generate types using supabase gen types.
// For now, keep it strict by using unknown-based helpers in queries.

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; owner_id: string; created_at: string };
        Insert: { id?: string; name: string; owner_id: string; created_at?: string };
        Update: { id?: string; name?: string; owner_id?: string; created_at?: string };
      };
      contracts: {
        Row: {
          id: string;
          org_id: string;
          carrier_name: string;
          effective_date: string | null;
          expiry_date: string | null;
          base_rate_per_lb: string | null;
          base_rate_per_mile: string | null;
          fuel_surcharge_pct: string | null;
          residential_surcharge: string | null;
          detention_rate_per_hr: string | null;
          liftgate_fee: string | null;
          inside_delivery_fee: string | null;
          custom_rules: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          carrier_name: string;
          effective_date?: string | null;
          expiry_date?: string | null;
          base_rate_per_lb?: string | null;
          base_rate_per_mile?: string | null;
          fuel_surcharge_pct?: string | null;
          residential_surcharge?: string | null;
          detention_rate_per_hr?: string | null;
          liftgate_fee?: string | null;
          inside_delivery_fee?: string | null;
          custom_rules?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          carrier_name?: string;
          effective_date?: string | null;
          expiry_date?: string | null;
          base_rate_per_lb?: string | null;
          base_rate_per_mile?: string | null;
          fuel_surcharge_pct?: string | null;
          residential_surcharge?: string | null;
          detention_rate_per_hr?: string | null;
          liftgate_fee?: string | null;
          inside_delivery_fee?: string | null;
          custom_rules?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          org_id: string;
          contract_id: string | null;
          file_name: string;
          file_url: string;
          carrier_name: string | null;
          invoice_number: string | null;
          invoice_date: string | null;
          shipment_date: string | null;
          origin: string | null;
          destination: string | null;
          weight_lbs: string | null;
          distance_miles: string | null;
          raw_extracted_text: string | null;
          extracted_data: Record<string, unknown> | null;
          status: string;
          total_billed: string | null;
          total_approved: string | null;
          total_savings: string | null;
          uploaded_at: string;
          audited_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          contract_id?: string | null;
          file_name: string;
          file_url: string;
          carrier_name?: string | null;
          invoice_number?: string | null;
          invoice_date?: string | null;
          shipment_date?: string | null;
          origin?: string | null;
          destination?: string | null;
          weight_lbs?: string | null;
          distance_miles?: string | null;
          raw_extracted_text?: string | null;
          extracted_data?: Record<string, unknown> | null;
          status?: string;
          total_billed?: string | null;
          total_approved?: string | null;
          total_savings?: string | null;
          uploaded_at?: string;
          audited_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          contract_id?: string | null;
          file_name?: string;
          file_url?: string;
          carrier_name?: string | null;
          invoice_number?: string | null;
          invoice_date?: string | null;
          shipment_date?: string | null;
          origin?: string | null;
          destination?: string | null;
          weight_lbs?: string | null;
          distance_miles?: string | null;
          raw_extracted_text?: string | null;
          extracted_data?: Record<string, unknown> | null;
          status?: string;
          total_billed?: string | null;
          total_approved?: string | null;
          total_savings?: string | null;
          uploaded_at?: string;
          audited_at?: string | null;
        };
      };
      line_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          billed_amount: string;
          expected_amount: string | null;
          discrepancy: string | null;
          ai_flag_reason: string | null;
          confidence_score: string | null;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          billed_amount: string;
          expected_amount?: string | null;
          discrepancy?: string | null;
          ai_flag_reason?: string | null;
          confidence_score?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          billed_amount?: string;
          expected_amount?: string | null;
          discrepancy?: string | null;
          ai_flag_reason?: string | null;
          confidence_score?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          invoice_id: string;
          org_id: string | null;
          carrier_name: string | null;
          carrier_email: string | null;
          dispute_letter_text: string | null;
          total_disputed_amount: string | null;
          status: string;
          sent_at: string | null;
          resolved_at: string | null;
          resolution_amount: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          org_id?: string | null;
          carrier_name?: string | null;
          carrier_email?: string | null;
          dispute_letter_text?: string | null;
          total_disputed_amount?: string | null;
          status?: string;
          sent_at?: string | null;
          resolved_at?: string | null;
          resolution_amount?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          org_id?: string | null;
          carrier_name?: string | null;
          carrier_email?: string | null;
          dispute_letter_text?: string | null;
          total_disputed_amount?: string | null;
          status?: string;
          sent_at?: string | null;
          resolved_at?: string | null;
          resolution_amount?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          org_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          user_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
  };
};

