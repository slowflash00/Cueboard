import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'pill';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 text-sm',
          variant === 'pill' ? 'rounded-full h-11 px-5' : 'rounded-lg h-10 px-3 border border-transparent focus:border-transparent',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
