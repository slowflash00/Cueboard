'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-page)] p-6 text-center select-none">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--bg-subtle)] text-[var(--text-secondary)] mb-4">
        <HelpCircle className="h-8 w-8 stroke-[1.75]" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
        Page Not Found
      </h1>

      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">
        The prompt, board, or page you are looking for might have been removed or is temporarily unavailable.
      </p>

      <Link href="/">
        <Button variant="primary" size="md">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
