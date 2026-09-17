'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PromptPartCardProps {
  subheading?: string | null;
  bodyText: string;
  className?: string;
  onDelete?: () => void;
  isEditable?: boolean;
}

export function PromptPartCard({
  subheading,
  bodyText,
  className,
}: PromptPartCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(bodyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div
      className={cn(
        'group rounded-xl bg-[var(--bg-subtle)] p-3.5 transition-all',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-1.5">
        <span className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {subheading || 'Prompt'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy prompt part"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-white hover:text-[var(--text-primary)] cursor-pointer"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--success)] animate-in fade-in zoom-in duration-200" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-[14px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap select-text">
        {bodyText}
      </p>
    </div>
  );
}
