'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, companyName, name }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Account created but sign-in failed. Please try logging in.');
      setLoading(false);
      return;
    }

    toast('Account created!', 'success');
    router.push('/dashboard');
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
            Create your account
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Company Name"
              placeholder="Acme Logistics"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Your Name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-[var(--danger)]">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account\u2026' : 'Create Free Account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
