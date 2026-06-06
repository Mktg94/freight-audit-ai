import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, companyName, name } = await request.json();

    if (!email || !password || !companyName) {
      return Response.json({ success: false, error: 'Email, password, and companyName are required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('User creation failed');

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: companyName, owner_id: authData.user.id })
      .select()
      .single();

    if (orgError) throw orgError;

    return Response.json(
      { success: true, data: { user: authData.user, organization: orgData } },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
