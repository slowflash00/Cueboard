'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import { BoardWithDetails } from '@/types/database';
import { cn } from '@/lib/utils';

export interface BoardTileProps {
  board?: BoardWithDetails;
  isCreateTile?: boolean;
  onClick?: () => void;
}

export function BoardTile({
  board,
  isCreateTile = false,
  onClick,
}: BoardTileProps) {
  if (isCreateTile) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        onClick={onClick}
        className="group relative mb-4 flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-6 transition-colors hover:border-[var(--accent)] break-inside-avoid select-none"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
          <Plus className="h-7 w-7 text-[var(--accent)]" />
        </div>
        <span className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
          Create board
        </span>
        <span className="text-xs text-[var(--text-secondary)] mt-0.5">
          Organize projects & posts
        </span>
      </motion.div>
    );
  }

  if (!board) return null;

  const totalItems = (board.posts_count || 0) + (board.projects_count || 0);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      className="group relative mb-4 overflow-hidden rounded-2xl bg-[var(--bg-card)] card-hover-shadow cursor-pointer break-inside-avoid select-none"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--bg-subtle)]">
        {board.cover_image_url ? (
          <Image
            src={board.cover_image_url}
            alt={board.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[var(--text-secondary)]">
            <Folder className="h-14 w-14 stroke-1 text-[var(--text-secondary)] mb-2 opacity-60" />
            <span className="text-xs">Empty Board</span>
          </div>
        )}

        {/* Bottom gradient and hover text */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 text-white">
          <h3 className="text-lg font-bold drop-shadow-sm line-clamp-1">
            {board.title}
          </h3>
          <p className="text-xs text-white/80 opacity-90 transition-opacity group-hover:opacity-100">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
