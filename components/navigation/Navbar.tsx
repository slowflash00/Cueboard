'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Plus, LayoutGrid, FolderPlus, User, LogOut, KeyRound } from 'lucide-react';
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
  const pathname = usePathname();
  const router = useRouter();

  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const createRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error', e);
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/95 px-4 md:px-6 backdrop-blur-md">
      {/* 1. Left: Logo / Home */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-sm transition-transform group-hover:scale-105">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Cueboard
          </span>
        </Link>

        {/* Boards Nav Link per UI_KIT §8 */}
        <Link
          href="/boards"
          className={`text-sm font-semibold transition-colors ${
            pathname === '/boards' || pathname.startsWith('/boards/')
              ? 'text-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Boards
        </Link>
      </div>

      {/* 2. Center: Pill Search Bar (9999px radius per UI_KIT §4) */}
      <div className="relative mx-4 max-w-md flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
        <Input
          variant="pill"
          placeholder="Search prompts (e.g., cyberpunk, anime, cinematic)..."
          className="pl-11"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* 3. Right: "Create" Button Dropdown & Profile */}
      <div className="flex items-center gap-3">
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

        {/* "Create" Dropdown Button per UI_KIT §8 */}
        <div className="relative" ref={createRef}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>

          {createDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              {onOpenNewPost && (
                <button
                  type="button"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    onOpenNewPost();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[var(--accent)]" />
                  New Post
                </button>
              )}
              {onOpenNewBoard && (
                <button
                  type="button"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    onOpenNewBoard();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4 text-[var(--text-secondary)]" />
                  New Board
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile / Account Settings Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-label="Account Settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <User className="h-4 w-4" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <Link
                href="/account/password"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-[var(--text-secondary)]" />
                Change Password
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
