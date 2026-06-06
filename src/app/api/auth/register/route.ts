import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, companyName, name } = await request.json();

    if (!email || !password || !companyName) {
      return Response.json({ success: false, error: 'Email, password, and companyName are required' }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();

    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (createError) throw createError;
    if (!userData.user) throw new Error('User creation failed');

    const { data: orgData, error: orgError } = await admin
      .from('organizations')
      .insert({ name: companyName, owner_id: userData.user.id })
      .select()
      .single();

    if (orgError) throw orgError;

    return Response.json(
      { success: true, data: { user: userData.user, organization: orgData } },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
