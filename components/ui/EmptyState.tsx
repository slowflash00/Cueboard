import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-20 px-4 max-w-sm mx-auto select-none',
        className
      )}
    >
      <Icon className="h-12 w-12 text-[var(--text-secondary)] mb-3.5 stroke-[1.75]" />
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
