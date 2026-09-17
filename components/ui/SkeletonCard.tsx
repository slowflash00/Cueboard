'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SkeletonCardProps {
  aspectRatio?: string;
  className?: string;
}

export function SkeletonCard({
  aspectRatio = '4 / 5',
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'relative mb-4 w-full overflow-hidden rounded-2xl bg-[var(--bg-subtle)] break-inside-avoid',
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Framer-motion shimmer gradient sweep */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ translateX: ['-100%', '200%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
