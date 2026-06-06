# Next build step: Contracts CRUD

## Why next
Current pages for Contracts are only UI scaffolds. Next step per prompt is to implement:
- Contracts CRUD (UI + API routes)
- RLS-enforced Supabase data access

## What will be implemented next (code)
1) Add API routes under `src/app/api/contracts/`:
- `GET /api/contracts` (list)
- `POST /api/contracts` (create)
- `GET /api/contracts/[id]` (fetch one)
- `PUT /api/contracts/[id]` (update)
- `DELETE /api/contracts/[id]` (delete)

2) Replace UI scaffold in:
- `src/app/contracts/page.tsx` (list + delete)
- `src/app/contracts/new/page.tsx` (create form)
- `src/app/contracts/[id]/page.tsx` (edit form)

3) Use shadcn/ui components + Lucide icons (per prompt styling rules).

## Required prerequisites to confirm before coding
- shadcn/ui is initialized and required components exist.
- `.env.local` has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

## Acceptance criteria
- No TypeScript/build errors.
- Contracts pages load and call the API routes.
- RLS prevents cross-org reads.

