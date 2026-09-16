import React from 'react';
import { cn } from '@/lib/utils';

export interface GroupWrapperProps {
  colorToken?: string | null;
  label?: string | null;
  children: React.ReactNode;
  className?: string;
  onUngroup?: () => void;
}

export function GroupWrapper({
  colorToken,
  label,
  children,
  className,
}: GroupWrapperProps) {
  const bgStyle = colorToken
    ? { backgroundColor: `var(${colorToken})` }
    : { backgroundColor: 'var(--group-blue)' };

  return (
    <div
      style={bgStyle}
      className={cn(
        'rounded-2xl p-3 transition-colors break-inside-avoid mb-4',
        className
      )}
    >
      {label && (
        <div className="mb-2 px-1">
          <span className="inline-block rounded-md bg-white/70 px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
            {label}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}
