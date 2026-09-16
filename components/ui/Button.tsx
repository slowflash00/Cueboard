import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          // Variants per UI_KIT.md
          variant === 'primary' &&
            'rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm active:scale-95',
          variant === 'secondary' &&
            'rounded-lg border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
          variant === 'ghost' &&
            'rounded-lg bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
          variant === 'icon' &&
            'rounded-lg p-2 bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
          // Sizes
          variant !== 'icon' && size === 'sm' && 'h-8 px-3 text-xs',
          variant !== 'icon' && size === 'md' && 'h-10 px-5 text-sm',
          variant !== 'icon' && size === 'lg' && 'h-12 px-7 text-base font-semibold',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
