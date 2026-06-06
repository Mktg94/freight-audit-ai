'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    toast('Signed in successfully', 'success');
    router.push('/dashboard');
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = getSupabaseBrowserClient();
    const { error: magicError } = await supabase.auth.signInWithOtp({ email });

    if (magicError) {
      setError(magicError.message);
      setLoading(false);
      return;
    }

    toast('Magic link sent! Check your inbox.', 'success');
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
      <Card className="w-full max-w-md border-[var(--primary)]/30 shadow-[0_0_24px_rgba(45,212,191,0.12)]">
        <CardContent className="pt-8">
          <div className="mb-8 text-center">
            <h1 className="font-[var(--font-syne)] text-2xl font-bold text-[var(--primary)]">
              LogiMatriks
            </h1>
          </div>
          <h2 className="mb-6 font-[var(--font-syne)] text-xl font-semibold text-[var(--text-primary)]">
            Welcome back
          </h2>
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-[var(--danger)]">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in\u2026' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="text-sm text-[var(--primary)] hover:underline disabled:opacity-50"
            >
              Send me a login link instead
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-[var(--primary)] hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
