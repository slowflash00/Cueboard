'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Account created! Please check your email to confirm.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Authentication error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-subtle)] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[var(--bg-page)] p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-md">
            <Sparkles className="h-6 w-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Prompt Board
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {isSignUp
              ? 'Create an account to store your AI prompts'
              : 'Sign in to access your personal AI library'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1.5">
              Password
            </label>
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
            className="w-full mt-2 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account yet? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
