# AI Freight Bill Auditor — Full Build Prompt for Cursor

---

## PROJECT OVERVIEW

Build a full-stack SaaS web application called **LogiMatriks** — an intelligent freight invoice auditing platform that automatically detects billing errors in freight invoices by comparing them against pre-loaded carrier contracts. The system uses AI to extract line items, flag discrepancies, and generate dispute reports.

---

## TECH STACK (Free / Free-tier only)

| Layer | Tool | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Use TypeScript throughout |
| Styling | Tailwind CSS + shadcn/ui | Custom theme defined below |
| Backend | Next.js API Routes (built-in) | No separate backend server needed |
| Database | Supabase (free tier) | PostgreSQL + Auth + Storage |
| AI/LLM | Anthropic Claude API (claude-haiku-3) | For line-item auditing logic |
| PDF Extraction | LlamaParse free tier OR pdf-parse npm | Extract invoice text |
| Auth | Supabase Auth | Email/password + magic link |
| File Storage | Supabase Storage | Store uploaded invoice PDFs |
| Email | Resend free tier (100 emails/day) | Dispute letter delivery |
| Deployment | Vercel free tier | CI/CD from GitHub |

---

## DESIGN SYSTEM

### Color Palette
```css
--background: #0A0F1E        /* Deep navy — main background */
--surface: #111827            /* Card/panel background */
--surface-2: #1C2537          /* Elevated surface */
--border: #1F2D45             /* Subtle borders */
--primary: #2DD4BF            /* Teal — primary actions */
--primary-hover: #14B8A4      /* Teal dark hover */
--accent: #F59E0B             /* Amber — warnings, flags */
--danger: #EF4444             /* Red — errors, overcharges */
--success: #10B981            /* Green — approved, savings */
--text-primary: #F1F5F9       /* White-ish main text */
--text-secondary: #94A3B8     /* Muted secondary text */
--text-muted: #475569          /* Very muted labels */
```

### Typography
- **Display / Headings**: `Syne` (Google Font) — geometric, technical feel
- **Body / UI**: `DM Sans` (Google Font) — clean, readable
- Import in `layout.tsx`: `import { Syne, DM_Sans } from 'next/font/google'`

### Design Aesthetic
- Dark industrial/fintech aesthetic — feels serious, trustworthy, data-heavy
- Cards with subtle `1px` teal-tinted borders (`border-teal-900/40`)
- Glassy panels using `backdrop-blur` on modals and sidebars
- Teal glow on primary CTAs: `shadow-[0_0_20px_rgba(45,212,191,0.3)]`
- All tables have alternating row shading using `surface-2`
- Status badges: rounded pill shape, color-coded (amber = flagged, green = approved, red = disputed, gray = pending)
- Page transitions: subtle fade-in using Tailwind's `animate-fade-in`
- Icons: use `lucide-react` exclusively
- NO purple gradients, NO white backgrounds, NO generic Inter font

---

## DATABASE SCHEMA (Supabase / PostgreSQL)

Create these tables in Supabase SQL editor:

```sql
-- Users are handled by Supabase Auth (auth.users)

-- Organizations (each company using the platform)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Carrier Contracts (rate cards uploaded by users)
create table contracts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
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
  custom_rules jsonb,        -- flexible key-value for extra rules
  created_at timestamptz default now()
);

-- Invoices (uploaded freight bills)
create table invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  contract_id uuid references contracts(id),
  file_name text not null,
  file_url text not null,            -- Supabase Storage URL
  carrier_name text,
  invoice_number text,
  invoice_date date,
  shipment_date date,
  origin text,
  destination text,
  weight_lbs numeric,
  distance_miles numeric,
  raw_extracted_text text,           -- raw OCR output
  extracted_data jsonb,              -- structured JSON from AI
  status text default 'pending',     -- pending | auditing | flagged | approved | disputed
  total_billed numeric,
  total_approved numeric,
  total_savings numeric,
  uploaded_at timestamptz default now(),
  audited_at timestamptz
);

-- Line Items (individual charges per invoice)
create table line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  billed_amount numeric not null,
  expected_amount numeric,
  discrepancy numeric,
  ai_flag_reason text,
  confidence_score numeric,          -- 0.0 to 1.0
  status text default 'pending',     -- pending | approved | disputed
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- Disputes (generated dispute letters)
create table disputes (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  org_id uuid references organizations(id),
  carrier_name text,
  carrier_email text,
  dispute_letter_text text,
  total_disputed_amount numeric,
  status text default 'draft',       -- draft | sent | resolved | rejected
  sent_at timestamptz,
  resolved_at timestamptz,
  resolution_amount numeric,
  created_at timestamptz default now()
);

-- Audit Logs (immutable trail)
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  user_id uuid references auth.users(id),
  action text not null,              -- e.g. 'approved_line_item', 'sent_dispute'
  entity_type text,                  -- 'invoice' | 'line_item' | 'dispute'
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
```

Enable Row Level Security (RLS) on all tables. Each org can only see its own data.

---

## FILE STRUCTURE

```
/app
  /layout.tsx                  — Root layout with fonts, providers
  /page.tsx                    — Landing page (public)
  /auth
    /login/page.tsx
    /signup/page.tsx
  /dashboard
    /layout.tsx                — Dashboard shell with sidebar
    /page.tsx                  — Main dashboard / overview
  /invoices
    /page.tsx                  — Invoice list
    /upload/page.tsx           — Upload new invoice
    /[id]/page.tsx             — Invoice detail + audit review
  /contracts
    /page.tsx                  — Contract list
    /new/page.tsx              — Add new contract
    /[id]/page.tsx             — Contract detail + edit
  /disputes
    /page.tsx                  — Disputes list
    /[id]/page.tsx             — Dispute detail + send
  /reports
    /page.tsx                  — Savings & analytics dashboard
  /settings
    /page.tsx                  — Org settings, team, API keys

/components
  /ui                          — shadcn/ui components
  /layout
    Sidebar.tsx
    TopBar.tsx
    PageHeader.tsx
  /invoices
    InvoiceCard.tsx
    InvoiceStatusBadge.tsx
    LineItemTable.tsx
    AuditResultPanel.tsx
    UploadDropzone.tsx
  /contracts
    ContractForm.tsx
    ContractCard.tsx
  /disputes
    DisputeLetter.tsx
    DisputeStatusBadge.tsx
  /dashboard
    StatCard.tsx
    SavingsChart.tsx
    RecentActivityFeed.tsx
    FlaggedInvoicesQueue.tsx
  /shared
    ConfidenceBar.tsx
    EmptyState.tsx
    LoadingSpinner.tsx
    DataTable.tsx

/lib
  /supabase
    client.ts                  — browser Supabase client
    server.ts                  — server Supabase client
  /ai
    extractInvoice.ts          — LlamaParse / pdf-parse logic
    auditInvoice.ts            — Claude API auditing logic
    generateDispute.ts         — Claude API dispute letter generation
  /utils
    formatCurrency.ts
    formatDate.ts
    calculateSavings.ts

/api (Next.js API Routes under /app/api)
  /invoices
    /upload/route.ts           — Handle file upload to Supabase Storage
    /[id]/audit/route.ts       — Trigger AI audit for an invoice
  /disputes
    /[id]/send/route.ts        — Send dispute email via Resend

/types
  index.ts                     — All TypeScript interfaces
```

---

## PAGE-BY-PAGE SPECIFICATIONS

---

### PAGE 1: Landing Page (`/`)

**Purpose**: Public marketing page to convert visitors to sign up.

**Layout**:
- Full-screen hero section with animated background (subtle moving dots/grid pattern using CSS animation)
- Navigation bar: Logo left, "Login" and "Get Started Free" buttons right
- Hero headline: `"Stop Overpaying on Freight. Automatically."` in Syne font, 64px, white
- Sub-headline: `"LogiMatriks AI catches billing errors across every invoice — before you pay them."` in DM Sans, 20px, muted text
- Two CTA buttons: `"Start Free Audit"` (teal, glowing) and `"See How It Works"` (outlined)
- Three feature cards below hero: "AI Extraction", "Contract Matching", "Dispute Automation" — each with a teal icon, bold title, 2-line description
- Stats row: `"$2.4B+"` saved industry-wide, `"15-25%"` avg error rate, `"30 min"` daily review time — large numbers in teal, labels in muted text
- Footer: minimal, dark, just copyright and links

**Design notes**: Dark navy background. Faint teal grid overlay at low opacity. Hero text has a subtle fade-up animation on load.

---

### PAGE 2: Login (`/auth/login`)

**Purpose**: Authenticate existing users.

**Layout**:
- Centered card on dark background (800px max-width, narrow form column)
- Logo at top of card
- "Welcome back" heading
- Email + password fields using shadcn/ui `Input`
- "Sign in" button (full-width, teal)
- Magic link option: "Send me a login link instead"
- Link to `/auth/signup`
- Error state: red inline message below the button

---

### PAGE 3: Sign Up (`/auth/signup`)

**Purpose**: Register a new organization and user.

**Layout**:
- Same card layout as login
- Fields: Company Name, Your Name, Email, Password, Confirm Password
- "Create Free Account" button
- On success: redirect to `/dashboard` with a welcome toast notification

---

### PAGE 4: Dashboard (`/dashboard`)

**Purpose**: Command center. At-a-glance financial overview and action queue.

**Layout** (two-column on desktop, stacked on mobile):

**Left column (70%)**:
- `StatCard` row (4 cards):
  - "Invoices This Month" (number + trend arrow)
  - "Total Billed" ($ amount)
  - "Total Savings Captured" ($ in green with upward arrow)
  - "Flagged for Review" (count in amber)
- `SavingsChart`: A bar/area chart (use `recharts`) showing monthly savings over the last 6 months. Teal bars, dark grid, amber line for billed vs approved.
- "Recent Invoices" table: Last 5 uploaded invoices with columns: Invoice #, Carrier, Date, Amount, Status badge, Action button

**Right column (30%)**:
- "Exceptions Queue" — list of top flagged line items needing review. Each item shows: invoice number, flag reason, discrepancy amount, "Review" button
- "Quick Upload" — a mini dropzone widget to instantly upload an invoice without navigating away

**Sidebar (persistent)**:
- Dark surface, 240px wide
- Logo at top
- Navigation links with lucide icons: Dashboard, Invoices, Contracts, Disputes, Reports, Settings
- Active state: teal left border + teal text + light teal background
- Bottom: user avatar, name, "Logout" button

---

### PAGE 5: Invoice List (`/invoices`)

**Purpose**: View and manage all uploaded invoices.

**Layout**:
- Page header with title "Invoices" and "Upload Invoice" button (teal)
- Filter bar: search by invoice # or carrier, filter by status dropdown (All / Pending / Flagged / Approved / Disputed), date range picker
- Data table with columns:
  - Invoice # 
  - Carrier Name
  - Upload Date
  - Invoice Date
  - Total Billed ($)
  - Discrepancy ($) — shown in red if > 0
  - Status (badge)
  - Actions (View button)
- Pagination at bottom
- Empty state: illustration + "Upload your first invoice to get started"

---

### PAGE 6: Upload Invoice (`/invoices/upload`)

**Purpose**: Upload a freight invoice PDF and trigger AI extraction + audit.

**Layout** (two-step wizard):

**Step 1 — Upload File**:
- Large drag-and-drop zone (dashed teal border, upload icon, "Drop your invoice PDF here or click to browse")
- File accepted: shows file name, size, preview thumbnail
- Select Contract dropdown: "Which carrier contract should this be audited against?" — pulls from user's saved contracts
- "Start AI Audit" button — triggers the processing pipeline

**Step 2 — Processing State**:
- Full-page loading UI with 4 animated steps shown as a vertical stepper:
  1. ✅ "Uploading file to secure storage..."
  2. ✅ "Extracting invoice data with AI..."
  3. ⏳ "Comparing against contract rates..."
  4. ⏳ "Generating audit report..."
- Each step animates to a checkmark when complete
- On completion: auto-redirect to `/invoices/[id]`

**API behavior** (`/api/invoices/upload/route.ts`):
1. Upload PDF to Supabase Storage bucket `invoices`
2. Extract text using `pdf-parse` npm package
3. Send extracted text to Claude API with a structured prompt (see AI Prompts section below)
4. Store extracted JSON + line items in database
5. Run audit comparison against selected contract
6. Return invoice ID

---

### PAGE 7: Invoice Detail + Audit Review (`/invoices/[id]`)

**Purpose**: The core working screen. Review AI audit results and act on flagged items.

**Layout** (three-panel):

**Top bar**:
- Invoice metadata row: Invoice #, Carrier, Date, Origin → Destination, Weight, Status badge
- Three summary tiles: "Total Billed", "Total Approved", "Discrepancy" (in red)
- Action buttons: "Generate Dispute Letter", "Approve All Clean Items", "Export PDF"

**Main content — Line Items Table**:
- Full-width table with columns:
  - Description (e.g., "Fuel Surcharge", "Base Freight", "Residential Delivery")
  - Billed Amount ($)
  - Expected Amount ($) — from contract
  - Discrepancy ($) — red if overcharged, green if undercharged
  - AI Confidence — `ConfidenceBar` component (horizontal bar, teal fill)
  - AI Flag Reason — short text (e.g., "Contract rate is $0.15/lb; billed at $0.22/lb")
  - Status — badge (Pending / Approved / Disputed)
  - Actions — "Approve" (green button) / "Dispute" (red button)

**Right drawer (slides in when a row is clicked)**:
- `AuditResultPanel` — expanded view of the selected line item
- Shows: full AI reasoning, contract clause referenced, billed vs expected breakdown
- "Approve this charge" and "Add to Dispute" buttons

**Bottom summary bar**:
- "X items flagged, $Y in potential overcharges. Y items approved."
- "Finalize & Create Dispute Letter" CTA

---

### PAGE 8: Contracts List (`/contracts`)

**Purpose**: Manage carrier rate contracts.

**Layout**:
- Page header with "Contracts" title and "Add Contract" button
- Grid of `ContractCard` components (3-column desktop, 1-column mobile)
- Each card shows: Carrier name, Effective date, Key rates summary, Edit/Delete buttons
- Empty state: "No contracts yet. Add your first carrier contract to enable AI auditing."

---

### PAGE 9: Add / Edit Contract (`/contracts/new` and `/contracts/[id]`)

**Purpose**: Input carrier rate card information that the AI audits against.

**Layout**:
- Form with sections:

**Section 1 — Carrier Info**:
- Carrier Name (text input)
- Contract Effective Date (date picker)
- Contract Expiry Date (date picker)

**Section 2 — Base Rates**:
- Base Rate per lb (numeric)
- Base Rate per mile (numeric)
- Minimum Charge ($)

**Section 3 — Accessorial Charges** (these are the most commonly disputed):
- Fuel Surcharge % (numeric — e.g., 18.5)
- Residential Delivery Fee ($)
- Liftgate Fee ($)
- Detention Rate per Hour ($)
- Inside Delivery Fee ($)
- Redelivery Attempt Fee ($)

**Section 4 — Custom Rules** (dynamic form):
- "Add Custom Rule" button that adds a row with: Rule Name (text), Expected Value (text), Type (Fixed Fee / Percentage / Not Allowed)
- These are stored as `custom_rules` JSONB

- "Save Contract" button (teal, full-width)
- Success: toast notification + redirect to contracts list

---

### PAGE 10: Disputes List (`/disputes`)

**Purpose**: Track all generated and sent dispute letters.

**Layout**:
- Page header: "Disputes" with total amount in dispute shown
- Filter tabs: All / Draft / Sent / Resolved / Rejected
- Table with columns: Invoice #, Carrier, Amount Disputed ($), Status, Date Created, Date Sent, Resolution ($), Actions
- Summary row at top: Total drafted, total sent, total recovered

---

### PAGE 11: Dispute Detail (`/disputes/[id]`)

**Purpose**: Review and send a dispute letter.

**Layout**:
- Left panel (60%): The dispute letter itself rendered as a formatted document
  - Letterhead: Company name, date
  - Subject line: "Formal Billing Dispute — Invoice #XXXXX"
  - Body: Auto-generated by Claude API listing each disputed item with contract reference
  - Professional tone, editable via a textarea
- Right panel (40%):
  - Dispute summary: Total amount, carrier name, invoice date
  - Line items being disputed (read-only list)
  - "Carrier Email" input field
  - "Send Dispute Email" button (calls Resend API)
  - "Download as PDF" button
  - Status timeline: Created → Sent → Resolved

---

### PAGE 12: Reports (`/reports`)

**Purpose**: Financial analytics and savings tracking.

**Layout**:
- Date range selector at top (Last 30 days / 90 days / 12 months / Custom)
- KPI row (4 stats):
  - Total Invoices Audited
  - Total Overcharges Detected ($)
  - Total Savings Recovered ($)
  - Average Error Rate (%)
- Chart 1 (full width): Monthly Savings Trend — area chart with teal fill, shows "Billed" vs "Approved" over time
- Chart 2 (half): Top Carriers by Discrepancy — horizontal bar chart (which carriers overcharge most)
- Chart 3 (half): Error Types Breakdown — donut chart (Fuel Surcharge errors vs Weight errors vs Accessorial errors)
- Recent Disputes table at bottom

Use `recharts` for all charts.

---

### PAGE 13: Settings (`/settings`)

**Purpose**: Organization and account management.

**Layout** (tabbed):

**Tab 1 — Organization**:
- Company name, logo upload
- Default currency

**Tab 2 — Team** (future / placeholder):
- "Invite team member" input + button
- Team members list with role badges

**Tab 3 — Integrations** (placeholder UI only — no actual integration needed for MVP):
- Cards for QuickBooks, Xero, SAP — all showing "Coming Soon" badge
- Resend API key input (for dispute emails)
- LlamaParse API key input

**Tab 4 — Security**:
- Change password
- Active sessions list
- "Sign out all devices" button

---

## AI LOGIC (Critical)

### Invoice Extraction Prompt
In `/lib/ai/extractInvoice.ts`, send this prompt to Claude API:

```
You are a freight invoice data extraction specialist. 
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
{INVOICE_TEXT}
```

### Invoice Auditing Prompt
In `/lib/ai/auditInvoice.ts`, send this prompt to Claude API:

```
You are a freight billing auditor. Compare each invoice line item against the contract rates provided.
For each line item, determine if the charge is correct, overcharged, undercharged, or suspicious.

Contract Rates:
{CONTRACT_JSON}

Invoice Line Items:
{LINE_ITEMS_JSON}

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
For items not in the contract, flag as "not_in_contract" with confidence 0.7.
```

### Dispute Letter Generation Prompt
In `/lib/ai/generateDispute.ts`:

```
You are a professional freight billing dispute specialist. 
Write a formal, firm, professional dispute letter for the following billing discrepancies.

Company Name: {COMPANY_NAME}
Carrier Name: {CARRIER_NAME}
Invoice Number: {INVOICE_NUMBER}
Invoice Date: {INVOICE_DATE}
Disputed Items: {DISPUTED_ITEMS_JSON}
Total Amount Disputed: ${TOTAL_DISPUTED}

The letter should:
1. Reference the specific contract rates
2. List each disputed charge with expected vs billed amounts
3. Request a credit memo or corrected invoice within 15 business days
4. Be professional but firm in tone
5. Include a formal closing

Return only the letter text, no JSON.
```

---

## KEY COMPONENTS TO BUILD

### `ConfidenceBar.tsx`
Horizontal progress bar showing AI confidence score. 0-60% = red, 60-80% = amber, 80-100% = teal.

### `InvoiceStatusBadge.tsx`
Pill badge component. Props: `status: 'pending' | 'auditing' | 'flagged' | 'approved' | 'disputed'`
Colors: pending=gray, auditing=blue, flagged=amber, approved=green, disputed=red

### `StatCard.tsx`
Dark card with: icon (lucide), label, large number value, optional trend indicator (↑ green / ↓ red with percentage).

### `UploadDropzone.tsx`
Drag-and-drop file input. Uses `react-dropzone`. Shows file name on drop. Accepts PDF only. Max 20MB.

### `AuditResultPanel.tsx`
Sliding right drawer. Shows full audit reasoning for a selected line item. Built with shadcn Sheet component.

### `DataTable.tsx`
Reusable sortable/filterable table component using `@tanstack/react-table`. Used on invoices, disputes, line items pages.

---

## ENVIRONMENT VARIABLES

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
LLAMAPARSE_API_KEY=
```

---

## INSTALLATION & SETUP COMMANDS

```bash
npx create-next-app@latest freightaudit-ai --typescript --tailwind --app --src-dir
cd freightaudit-ai
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card badge sheet dialog table tabs toast progress
npm install @supabase/supabase-js @supabase/ssr
npm install pdf-parse
npm install react-dropzone
npm install recharts
npm install @tanstack/react-table
npm install resend
npm install lucide-react
npm install date-fns
```

---

## IMPORTANT IMPLEMENTATION RULES

1. **TypeScript strict mode** — no `any` types. Define all interfaces in `/types/index.ts`.
2. **Server Components by default** — only add `"use client"` when using hooks or browser APIs.
3. **All Supabase queries** go through `/lib/supabase/server.ts` in Server Components and `/lib/supabase/client.ts` in Client Components.
4. **All AI API calls** happen in Next.js API Routes only — never expose API keys to the client.
5. **Error handling** — every API route returns `{ success: boolean, data?: any, error?: string }`.
6. **Loading states** — every async action must show a loading spinner or skeleton. Use shadcn Skeleton component.
7. **Toast notifications** — use shadcn Toast for all success/error feedback. Never use `alert()`.
8. **Mobile responsive** — all pages must work on 375px width. Sidebar collapses to hamburger menu on mobile.
9. **RLS enforced** — never query Supabase without authenticated user context. Use `supabase.auth.getUser()` at the start of every API route.
10. **Audit logging** — every approve/dispute action must insert a row into the `audit_logs` table.

---

## BUILD ORDER (Follow This Sequence)

1. Project setup + environment variables
2. Supabase schema creation + RLS policies
3. Auth pages (login, signup) + Supabase Auth integration
4. Dashboard layout shell (sidebar + topbar)
5. Contracts CRUD (add/edit/list) — needed before invoice upload
6. Invoice upload page + PDF extraction API route
7. Claude AI audit API route
8. Invoice detail page + line item review UI
9. Dashboard stats (query real data)
10. Disputes flow (generate + send)
11. Reports page with recharts
12. Settings page
13. Landing page
14. Polish: empty states, error boundaries, mobile responsiveness

---

*Build LogiMatriks exactly as specified above. Prioritize functionality and correctness over additional features. Do not add features not listed here.*
