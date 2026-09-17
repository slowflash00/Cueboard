'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] p-4">
      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--accent)]">
            <LayoutGrid className="h-6 w-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Log in to Cueboard
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Access your personal visual prompt library
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-[#D32F2F]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--accent)] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        {/* Alternative Login & Sign Up Options per UI_KIT §10 */}
        <div className="mt-8 space-y-4 text-center border-t border-[var(--border-subtle)] pt-6">
          <div>
            <Link
              href="/otp"
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Log in with a code instead
            </Link>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/signup"
              className="font-semibold text-[var(--text-primary)] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
