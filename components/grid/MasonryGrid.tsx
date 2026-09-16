import React from 'react';
import { cn } from '@/lib/utils';

export interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

export function MasonryGrid({ children, className }: MasonryGridProps) {
  return (
    <div
      className={cn(
        'columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 [column-fill:_balance]',
        className
      )}
    >
      {children}
    </div>
  );
}
