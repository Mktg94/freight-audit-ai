-- LogiMatriks — Supabase Schema + RLS (MVP as specified)
-- Run in Supabase SQL Editor.

-- Enable extensions (for gen_random_uuid)
create extension if not exists pgcrypto;

-- Users are handled by Supabase Auth (auth.users)

-- Organizations (each company using the platform)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Carrier Contracts (rate cards uploaded by users)
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  carrier_name text not null,
  effective_date date,
  expiry_date date,
  base_rate_per_lb numeric,
  base_rate_per_mile numeric,
  fuel_surcharge_pct numeric,
  residential_surcharge numeric,
  detention_rate_per_hr numeric,
  liftgate_fee numeric,
  inside_delivery_fee numeric,
  custom_rules jsonb,
  created_at timestamptz default now()
);

-- Invoices (uploaded freight bills)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  contract_id uuid references public.contracts(id),
  file_name text not null,
  file_url text not null,
  carrier_name text,
  invoice_number text,
  invoice_date date,
  shipment_date date,
  origin text,
  destination text,
  weight_lbs numeric,
  distance_miles numeric,
  raw_extracted_text text,
  extracted_data jsonb,
  status text default 'pending',
  total_billed numeric,
  total_approved numeric,
  total_savings numeric,
  uploaded_at timestamptz default now(),
  audited_at timestamptz
);

-- Line Items (individual charges per invoice)
create table if not exists public.line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  description text not null,
  billed_amount numeric not null,
  expected_amount numeric,
  discrepancy numeric,
  ai_flag_reason text,
  confidence_score numeric,
  status text default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- Disputes (generated dispute letters)
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  org_id uuid references public.organizations(id),
  carrier_name text,
  carrier_email text,
  dispute_letter_text text,
  total_disputed_amount numeric,
  status text default 'draft',
  sent_at timestamptz,
  resolved_at timestamptz,
  resolution_amount numeric,
  created_at timestamptz default now()
);

-- Audit Logs (immutable trail)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id),
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);


-- ========= RLS Policies =========
-- For each org, owner_id is the only mapping from auth.users.
-- All tables are filtered by the org membership inferred from organizations.owner_id.

-- Organizations
alter table public.organizations enable row level security;

create policy "orgs_select_own" on public.organizations
for select using (owner_id = auth.uid());

create policy "orgs_insert_own" on public.organizations
for insert with check (owner_id = auth.uid());

create policy "orgs_update_own" on public.organizations
for update using (owner_id = auth.uid());

-- Contracts
alter table public.contracts enable row level security;

create policy "contracts_select_own" on public.contracts
for select using (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

create policy "contracts_insert_own" on public.contracts
for insert with check (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

create policy "contracts_update_own" on public.contracts
for update using (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

create policy "contracts_delete_own" on public.contracts
for delete using (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

-- Invoices
alter table public.invoices enable row level security;

create policy "invoices_select_own" on public.invoices
for select using (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

create policy "invoices_insert_own" on public.invoices
for insert with check (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

create policy "invoices_update_own" on public.invoices
for update using (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

-- Line items
alter table public.line_items enable row level security;

create policy "line_items_select_own" on public.line_items
for select using (
  invoice_id in (
    select i.id from public.invoices i
    where i.org_id in (
      select o.id from public.organizations o where o.owner_id = auth.uid()
    )
  )
);

create policy "line_items_insert_own" on public.line_items
for insert with check (
  invoice_id in (
    select i.id from public.invoices i
    where i.org_id in (
      select o.id from public.organizations o where o.owner_id = auth.uid()
    )
  )
);

create policy "line_items_update_own" on public.line_items
for update using (
  invoice_id in (
    select i.id from public.invoices i
    where i.org_id in (
      select o.id from public.organizations o where o.owner_id = auth.uid()
    )
  )
);

-- Disputes
alter table public.disputes enable row level security;

create policy "disputes_select_own" on public.disputes
for select using (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

create policy "disputes_insert_own" on public.disputes
for insert with check (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

create policy "disputes_update_own" on public.disputes
for update using (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

-- Audit logs
alter table public.audit_logs enable row level security;

create policy "audit_logs_select_own" on public.audit_logs
for select using (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

create policy "audit_logs_insert_own" on public.audit_logs
for insert with check (
  org_id in (
    select o.id from public.organizations o where o.owner_id = auth.uid()
  )
);

