import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'subtle' | 'group';
}

export function Badge({
  className,
  variant = 'subtle',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-xs font-medium backdrop-blur-md',
        variant === 'subtle' &&
          'bg-white/85 text-[var(--text-primary)] shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
