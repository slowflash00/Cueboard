'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navigation/Navbar';
import { MasonryGrid } from '@/components/grid/MasonryGrid';
import { PostCard } from '@/components/post/PostCard';
import { ProjectTile } from '@/components/grid/ProjectTile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { PostEditorModal } from '@/components/post/PostEditorModal';
import { Board, Project, PostWithDetails } from '@/types/database';
import { Folder, FolderPlus, Plus, ChevronRight, Layers } from 'lucide-react';

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = use(params);
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>({
    id: boardId,
    user_id: 'user',
    title: 'Board Collection',
    cover_url: null,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPost, setIsUploadingPost] = useState(false);

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch board info
      const bRes = await fetch(`/api/boards`);
      if (bRes.ok) {
        const bData = await bRes.json();
        const found = bData.boards?.find((b: Board) => b.id === boardId);
        if (found) setBoard(found);
      }

      // 2. Fetch projects in this board
      const prRes = await fetch(`/api/projects?boardId=${boardId}`);
      if (prRes.ok) {
        const prData = await prRes.json();
        setProjects(prData.projects || []);
      }

      // 3. Fetch standalone posts in this board
      const pRes = await fetch(`/api/posts?boardId=${boardId}&standalone=true`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setPosts(pData.posts || []);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
      setIsUploadingPost(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [boardId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: boardId,
          title: newProjectTitle.trim(),
        }),
      });
      if (res.ok) {
        setNewProjectTitle('');
        setIsProjectModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">
      <Navbar
        onOpenNewPost={() => setIsPostModalOpen(true)}
        showProjectButton
        onOpenNewProject={() => setIsProjectModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
          <Link href="/boards" className="hover:text-[var(--accent)] transition-colors">
            Boards
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--text-primary)]">{board?.title || 'Board'}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {board?.title || 'Board Collection'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} • {posts.length} {posts.length === 1 ? 'standalone post' : 'standalone posts'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProjectModalOpen(true)}
            >
              <FolderPlus className="mr-1.5 h-4 w-4 text-[var(--text-secondary)]" /> New Project
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPostModalOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> New Post
            </Button>
          </div>
        </div>

        {/* Projects Folders Section */}
        {projects.length > 0 && (
          <section className="mt-8 mb-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Projects in this board
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {projects.map((proj) => (
                <ProjectTile
                  key={proj.id}
                  project={proj}
                  onClick={() => router.push(`/boards/${boardId}/projects/${proj.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Standalone Posts Section */}
        <section className="mt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Standalone Posts
          </h2>

          {posts.length === 0 && projects.length === 0 && !isUploadingPost ? (
            <EmptyState
              icon={Folder}
              title="Nothing here yet"
              description="Start building this board by adding your first AI prompt or project folder."
              actionLabel="Create post"
              onAction={() => setIsPostModalOpen(true)}
            />
          ) : posts.length === 0 && !isUploadingPost ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center text-sm text-[var(--text-secondary)]">
              All posts in this board are organized inside project folders above.
            </div>
          ) : (
            <MasonryGrid>
              {isUploadingPost && (
                <SkeletonCard aspectRatio="4 / 5" className="animate-pulse" />
              )}
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </MasonryGrid>
          )}
        </section>
      </main>

      {/* New Project Modal */}
      {isProjectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setIsProjectModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[var(--bg-page)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              New Project Folder
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                placeholder="e.g. Variant Renders, Client A"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                autoFocus
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsProjectModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      <PostEditorModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        boardId={boardId}
        onPostCreated={loadData}
        onUploadStart={() => setIsUploadingPost(true)}
      />
    </div>
  );
}
