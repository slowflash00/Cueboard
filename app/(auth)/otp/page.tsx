'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InputOTP } from '@/components/ui/InputOTP';
import { createClient } from '@/lib/supabase/client';

export default function OTPLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setSuccessMsg(`We sent a 6-digit login code to ${email}`);
      setStep('verify');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to send login code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setErrorMsg('Please enter all 6 digits.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) throw error;

      if (data.session) {
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid or expired code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-md">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {step === 'request' ? 'Passwordless Sign In' : 'Enter 6-digit Code'}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            {step === 'request'
              ? 'We will send a one-time code to your email'
              : `Check your inbox at ${email}`}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-[#D32F2F]">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3.5 text-xs font-medium text-[var(--success)]">
            {successMsg}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
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

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Code...' : 'Send Login Code'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="py-2">
              <InputOTP
                length={6}
                value={otpCode}
                onChange={setOtpCode}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || otpCode.length < 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Log In'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep('request');
                setOtpCode('');
                setErrorMsg(null);
              }}
              className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Change email or request new code
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-[var(--border-subtle)] pt-6">
          <Link
            href="/login"
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Log in with password instead
          </Link>
        </div>
      </div>
    </div>
  );
}
