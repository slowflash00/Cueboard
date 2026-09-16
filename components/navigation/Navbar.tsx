'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Sparkles, FolderPlus, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenNewPost?: () => void;
  onOpenNewBoard?: () => void;
  onOpenNewProject?: () => void;
  showProjectButton?: boolean;
}

export function Navbar({
  searchQuery = '',
  onSearchChange,
  onOpenNewPost,
  onOpenNewBoard,
  onOpenNewProject,
  showProjectButton,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/95 px-4 md:px-6 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Prompt Board
          </span>
        </Link>
      </div>

      {/* Center Search Input (9999px radius per UI_KIT) */}
      <div className="relative mx-4 max-w-md flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
        <Input
          variant="pill"
          placeholder="Search prompts (e.g., cyberpunk, anime, photorealistic)..."
          className="pl-11"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {showProjectButton && onOpenNewProject && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenNewProject}
            className="hidden sm:inline-flex"
          >
            <FolderPlus className="mr-1.5 h-4 w-4 text-[var(--text-secondary)]" />
            New Project
          </Button>
        )}

        {onOpenNewBoard && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenNewBoard}
            className="hidden sm:inline-flex"
          >
            New Board
          </Button>
        )}

        {onOpenNewPost && (
          <Button variant="primary" size="sm" onClick={onOpenNewPost}>
            <Plus className="mr-1 h-4 w-4" />
            New Post
          </Button>
        )}
      </div>
    </header>
  );
}
