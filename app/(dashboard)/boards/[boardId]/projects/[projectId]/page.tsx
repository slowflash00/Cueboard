'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navigation/Navbar';
import { MasonryGrid } from '@/components/grid/MasonryGrid';
import { PostCard } from '@/components/post/PostCard';
import { GroupWrapper } from '@/components/group/GroupWrapper';
import { GroupColorPicker } from '@/components/group/GroupColorPicker';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddExistingPostModal } from '@/components/project/AddExistingPostModal';
import { PostEditorModal } from '@/components/post/PostEditorModal';
import { PostWithDetails, Project, Board } from '@/types/database';
import { Plus, ChevronRight, Layers, Folder, Trash2, Unlink } from 'lucide-react';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ boardId: string; projectId: string }>;
}) {
  const { boardId, projectId } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  // Grouping & Multi-select
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [groupColorPickerOpen, setGroupColorPickerOpen] = useState(false);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch board info
      const bRes = await fetch(`/api/boards`);
      if (bRes.ok) {
        const bData = await bRes.json();
        const foundB = bData.boards?.find((b: Board) => b.id === boardId);
        if (foundB) setBoard(foundB);
      }

      // 2. Fetch project info
      const prRes = await fetch(`/api/projects?boardId=${boardId}`);
      if (prRes.ok) {
        const prData = await prRes.json();
        const foundP = prData.projects?.find((p: Project) => p.id === projectId);
        if (foundP) setProject(foundP);
      }

      // 3. Fetch linked posts
      const pRes = await fetch(`/api/projects/${projectId}/posts`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setPosts(pData.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [boardId, projectId]);

  // Handle unlinking a post from project (does not delete the post row)
  const handleUnlinkPost = async (postId: string) => {
    if (!confirm('Remove this post from the project? It will remain in the board.')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/posts?postId=${postId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error('Failed to unlink post', err);
    }
  };

  // Grouping logic
  const handleToggleSelect = (postId: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleApplyGroupColor = async (token: string) => {
    const newGroupKey = `group-${Date.now()}`;
    setPosts((prev) =>
      prev.map((p) =>
        selectedPostIds.includes(p.id)
          ? { ...p, group_key: newGroupKey, group_color: token }
          : p
      )
    );

    try {
      await fetch('/api/posts/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postIds: selectedPostIds,
          groupColor: token,
        }),
      });
    } catch (e) {
      console.error(e);
    }

    setSelectedPostIds([]);
    setIsSelectMode(false);
    setGroupColorPickerOpen(false);
  };

  const handleUngroup = async (groupKey: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.group_key === groupKey
          ? { ...p, group_key: null, group_color: null }
          : p
      )
    );

    try {
      await fetch(`/api/posts/group?groupKey=${groupKey}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Separate grouped and standalone within project
  const groupedMap = new Map<string, PostWithDetails[]>();
  const standalone: PostWithDetails[] = [];

  posts.forEach((post) => {
    if (post.group_key) {
      const g = groupedMap.get(post.group_key) || [];
      g.push(post);
      groupedMap.set(post.group_key, g);
    } else {
      standalone.push(post);
    }
  });

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">
      <Navbar onOpenNewPost={() => setIsNewPostOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
          <Link href="/boards" className="hover:text-[var(--accent)] transition-colors">
            Boards
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/boards/${boardId}`}
            className="hover:text-[var(--accent)] transition-colors"
          >
            {board?.title || 'Board'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--text-primary)]">{project?.title || 'Project'}</span>
        </div>

        {/* Project Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {project?.title || 'Project Folder'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {posts.length} {posts.length === 1 ? 'item' : 'items'} in this project
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Grouping Toggle */}
            {isSelectMode ? (
              <div className="flex items-center gap-2 bg-[var(--bg-subtle)] px-3 py-1.5 rounded-full">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {selectedPostIds.length} selected
                </span>
                {selectedPostIds.length >= 2 && (
                  <div className="relative">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setGroupColorPickerOpen(!groupColorPickerOpen)}
                    >
                      Group
                    </Button>
                    {groupColorPickerOpen && (
                      <div className="absolute right-0 top-11 z-50 rounded-2xl bg-white p-3 shadow-xl border border-[var(--border-subtle)]">
                        <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">
                          Choose Highlight
                        </p>
                        <GroupColorPicker onSelectColor={handleApplyGroupColor} />
                      </div>
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedPostIds([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              posts.length > 1 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSelectMode(true)}
                >
                  <Layers className="mr-1.5 h-4 w-4" /> Select to Group
                </Button>
              )
            )}

            {/* Actions per PRD §9 */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddExistingOpen(true)}
            >
              + Add Existing Post
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewPostOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> New Post
            </Button>
          </div>
        </div>

        {/* Project Posts Grid */}
        <section className="mt-8">
          {posts.length === 0 ? (
            <EmptyState
              icon={Folder}
              title="Project is empty"
              description="Add existing posts from this board or create a new one to organize this project."
              actionLabel="+ Add Existing Post"
              onAction={() => setIsAddExistingOpen(true)}
            />
          ) : (
            <MasonryGrid>
              {/* Grouped clusters */}
              {Array.from(groupedMap.entries()).map(([groupKey, groupPosts]) => {
                const color = groupPosts[0]?.group_color;
                return (
                  <GroupWrapper
                    key={groupKey}
                    colorToken={color}
                    label={`Group (${groupPosts.length} posts)`}
                  >
                    {groupPosts.map((post) => (
                      <div key={post.id} className="relative group/item">
                        <PostCard
                          post={post}
                          isSelectable={isSelectMode}
                          isSelected={selectedPostIds.includes(post.id)}
                          onToggleSelect={() => handleToggleSelect(post.id)}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlinkPost(post.id);
                          }}
                          title="Remove from project"
                          className="absolute top-2 left-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-white cursor-pointer"
                        >
                          <Unlink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleUngroup(groupKey)}
                      className="text-xs font-medium text-[var(--text-secondary)] hover:text-red-500 hover:underline self-end pt-1"
                    >
                      Ungroup
                    </button>
                  </GroupWrapper>
                );
              })}

              {/* Standalone Posts inside this project */}
              {standalone.map((post) => (
                <div key={post.id} className="relative group/item">
                  <PostCard
                    post={post}
                    isSelectable={isSelectMode}
                    isSelected={selectedPostIds.includes(post.id)}
                    onToggleSelect={() => handleToggleSelect(post.id)}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlinkPost(post.id);
                    }}
                    title="Remove from project"
                    className="absolute top-2 left-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-white cursor-pointer"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </MasonryGrid>
          )}
        </section>
      </main>

      {/* Add Existing Post Modal */}
      <AddExistingPostModal
        isOpen={isAddExistingOpen}
        onClose={() => setIsAddExistingOpen(false)}
        projectId={projectId}
        boardId={boardId}
        onPostsAdded={loadProjectData}
      />

      {/* New Post Modal */}
      <PostEditorModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        boardId={boardId}
        projectId={projectId}
        onPostCreated={loadProjectData}
      />
    </div>
  );
}
