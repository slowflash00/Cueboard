'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export const GROUP_COLORS = [
  { name: 'Blue', token: '--group-blue', hex: '#E8F0FE' },
  { name: 'Green', token: '--group-green', hex: '#E6F4EA' },
  { name: 'Yellow', token: '--group-yellow', hex: '#FEF7E0' },
  { name: 'Purple', token: '--group-purple', hex: '#F3E8FD' },
  { name: 'Peach', token: '--group-peach', hex: '#FDEEE4' },
  { name: 'Teal', token: '--group-teal', hex: '#E0F7F5' },
] as const;

export interface GroupColorPickerProps {
  selectedColor?: string | null;
  onSelectColor: (token: string) => void;
  className?: string;
}

export function GroupColorPicker({
  selectedColor,
  onSelectColor,
  className,
}: GroupColorPickerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {GROUP_COLORS.map((c) => {
        const isSelected = selectedColor === c.token;
        return (
          <button
            key={c.token}
            type="button"
            onClick={() => onSelectColor(c.token)}
            style={{ backgroundColor: c.hex }}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95 cursor-pointer',
              isSelected && 'ring-2 ring-[var(--accent)] ring-offset-2'
            )}
            title={c.name}
            aria-label={`Select ${c.name} group highlight`}
          >
            {isSelected && <Check className="h-4 w-4 text-[var(--text-primary)]" />}
          </button>
        );
      })}
    </div>
  );
}
