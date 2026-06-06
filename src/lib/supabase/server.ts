import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

type CookieStore = ReturnType<typeof cookies>;

// NOTE: This project expects you to set:
// NEXT_PUBLIC_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY
// SUPABASE_SERVICE_ROLE_KEY (used server-side only in routes)

export function getSupabaseServerClient(cookieStore: CookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // next/headers cookies() returns a Promise-like type in this project setup
          // Handle both sync and async shapes safely.
          if (typeof (cookieStore as unknown as { get?: unknown }).get === 'function') {
            return (cookieStore as unknown as { get: (n: string) => { value: string } | undefined }).get(name)?.value;
          }

          return undefined;
        },
      },
    }
  );
}


export async function getAuthenticatedUserOrgId() {
  const cookieStore = cookies();
  const supabase = getSupabaseServerClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Organization lookup is done by querying organizations table.
  // Keep this generic; actual org ownership logic should be enforced by RLS.
  const { data: orgRow } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  // Keep strict typing simple; rely on RLS for correctness.
  const id = (orgRow as { id?: string } | null)?.id;
  return id ?? null;
}

