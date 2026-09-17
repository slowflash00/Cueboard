'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navigation/Navbar';
import { MasonryGrid } from '@/components/grid/MasonryGrid';
import { PostCard } from '@/components/post/PostCard';
import { ProjectTile } from '@/components/grid/ProjectTile';
import { GroupWrapper } from '@/components/group/GroupWrapper';
import { GroupColorPicker } from '@/components/group/GroupColorPicker';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PostEditorModal } from '@/components/post/PostEditorModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PostWithDetails, Board, Project } from '@/types/database';
import { Sparkles, Layers, Search, FolderPlus } from 'lucide-react';

const PAGE_SIZE = 24;

// Curated seed items for immediate visual fidelity
const DEMO_POSTS: PostWithDetails[] = [
  {
    id: 'demo-1',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'image',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    image_width: 1000,
    image_height: 1250,
    video_url: null,
    video_thumbnail_url: null,
    group_key: null,
    group_color: null,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prompt: {
      id: 'pr-1',
      post_id: 'demo-1',
      user_id: 'demo-user',
      title: 'Neon Cyberpunk Portrait',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parts: [
        {
          id: 'pp-1',
          prompt_id: 'pr-1',
          user_id: 'demo-user',
          subheading: 'Positive Prompt',
          body_text: 'cinematic portrait of a futuristic android in neon rain, volumetric lighting, ray tracing, sharp focus, 8k octane render, photorealistic, Hasselblad 80mm f/1.4',
          position: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pp-2',
          prompt_id: 'pr-1',
          user_id: 'demo-user',
          subheading: 'Negative Prompt',
          body_text: 'deformed, blurry, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, low quality, artifacts',
          position: 1,
          created_at: new Date().toISOString(),
        },
      ],
    },
  },
  {
    id: 'demo-2',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'video_link',
    image_url: null,
    image_width: 1280,
    image_height: 720,
    video_url: 'https://drive.google.com/file/d/1gqjD0k3u_mock_id/view?usp=sharing',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80',
    group_key: null,
    group_color: null,
    position: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prompt: {
      id: 'pr-2',
      post_id: 'demo-2',
      user_id: 'demo-user',
      title: 'Retro Sci-Fi Computer Terminal (Runway Gen-2)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parts: [
        {
          id: 'pp-3',
          prompt_id: 'pr-2',
          user_id: 'demo-user',
          subheading: 'Motion Prompt',
          body_text: 'slow camera push-in towards flickering green phosphor CRT monitors in an abandoned 1980s bunker, dust particles floating in air, ambient fog',
          position: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pp-4',
          prompt_id: 'pr-2',
          user_id: 'demo-user',
          subheading: 'Camera Settings',
          body_text: 'Zoom: 3.5, Pan Right: 1.0, Motion Strength: 5, Motion Brush on monitor screens',
          position: 1,
          created_at: new Date().toISOString(),
        },
      ],
    },
  },
  {
    id: 'demo-3',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'image',
    image_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    image_width: 800,
    image_height: 800,
    video_url: null,
    video_thumbnail_url: null,
    group_key: 'sample-group-1',
    group_color: '--group-purple',
    position: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prompt: {
      id: 'pr-3',
      post_id: 'demo-3',
      user_id: 'demo-user',
      title: 'Minimalist 3D Abstract Sphere',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parts: [
        {
          id: 'pp-5',
          prompt_id: 'pr-3',
          user_id: 'demo-user',
          subheading: 'Concept Prompt',
          body_text: 'iridescent metallic spheres hovering over a matte ceramic podium, soft pastel studio lighting, minimal composition, clean backdrop, Cinema4D render',
          position: 0,
          created_at: new Date().toISOString(),
        },
      ],
    },
  },
  {
    id: 'demo-4',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'image',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    image_width: 800,
    image_height: 1000,
    video_url: null,
    video_thumbnail_url: null,
    group_key: 'sample-group-1',
    group_color: '--group-purple',
    position: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prompt: {
      id: 'pr-4',
      post_id: 'demo-4',
      user_id: 'demo-user',
      title: 'Variant B: Gradient Fluid Shapes',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parts: [
        {
          id: 'pp-6',
          prompt_id: 'pr-4',
          user_id: 'demo-user',
          subheading: 'Style Prompt',
          body_text: 'flowing glass liquid forms, translucent refraction, rainbow dispersion, minimal studio backdrop, clean high key aesthetic',
          position: 0,
          created_at: new Date().toISOString(),
        },
      ],
    },
  },
  {
    id: 'demo-5',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'none',
    image_url: null,
    image_width: null,
    image_height: null,
    video_url: null,
    video_thumbnail_url: null,
    group_key: null,
    group_color: null,
    position: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prompt: {
      id: 'pr-5',
      post_id: 'demo-5',
      user_id: 'demo-user',
      title: 'Master Architecture System Prompt',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parts: [
        {
          id: 'pp-7',
          prompt_id: 'pr-5',
          user_id: 'demo-user',
          subheading: 'System Persona',
          body_text: 'Act as an award-winning architectural photographer. You specialize in brutalist and Scandinavian modern interior concepts with natural daylighting and honest materials.',
          position: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pp-8',
          prompt_id: 'pr-5',
          user_id: 'demo-user',
          subheading: 'Default Camera Rig',
          body_text: 'Shot on Canon EOS R5, 24mm tilt-shift lens, f/8, ISO 100, long exposure, tripod mount, morning golden hour sunlight cascading across raw concrete textures.',
          position: 1,
          created_at: new Date().toISOString(),
        },
      ],
    },
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<PostWithDetails[]>(DEMO_POSTS);
  const [boards, setBoards] = useState<Board[]>([
    {
      id: 'board-1',
      user_id: 'demo',
      title: 'All AI Creations',
      cover_url: null,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-1',
      board_id: 'board-1',
      user_id: 'demo',
      title: 'Client A - 3D Brand Icons',
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [activeBoardId, setActiveBoardId] = useState<string>('board-1');
  const [searchQuery, setSearchQuery] = useState('');

  // Infinite Scroll State per TRD §14
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  // Grouping & Multi-select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [groupColorPickerOpen, setGroupColorPickerOpen] = useState(false);

  // Fetch initial posts (standalone only per PRD §9)
  const fetchPosts = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    try {
      const res = await fetch(
        `/api/posts?boardId=${activeBoardId}&standalone=true&limit=${PAGE_SIZE}&offset=${currentOffset}`
      );
      const data = await res.json();
      if (data.posts && data.posts.length > 0) {
        if (reset) {
          setPosts(data.posts);
          setOffset(data.posts.length);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
          setOffset((prev) => prev + data.posts.length);
        }
        setHasMore(data.posts.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      // Keep demo posts if DB is not yet populated
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [activeBoardId]);

  // Infinite Scroll IntersectionObserver per TRD §14
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoadingMore) {
        setIsLoadingMore(true);
        fetchPosts(false);
      }
    },
    [hasMore, isLoadingMore, offset, activeBoardId]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().trim();
    return posts.filter((p) => {
      const titleMatch = p.prompt?.title?.toLowerCase().includes(q);
      const partsMatch = p.prompt?.parts?.some(
        (part) =>
          part.body_text.toLowerCase().includes(q) ||
          part.subheading?.toLowerCase().includes(q)
      );
      return titleMatch || partsMatch;
    });
  }, [posts, searchQuery]);

  // Separate grouped and standalone posts
  const { groupedPostsMap, standalonePosts } = useMemo(() => {
    const map = new Map<string, PostWithDetails[]>();
    const standalone: PostWithDetails[] = [];

    filteredPosts.forEach((post) => {
      if (post.group_key) {
        const group = map.get(post.group_key) || [];
        group.push(post);
        map.set(post.group_key, group);
      } else {
        standalone.push(post);
      }
    });

    return { groupedPostsMap: map, standalonePosts: standalone };
  }, [filteredPosts]);

  const handleToggleSelect = (postId: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleApplyGroupColor = (token: string) => {
    const newGroupKey = `group-${Date.now()}`;
    setPosts((prev) =>
      prev.map((p) =>
        selectedPostIds.includes(p.id)
          ? { ...p, group_key: newGroupKey, group_color: token }
          : p
      )
    );
    setSelectedPostIds([]);
    setIsSelectMode(false);
    setGroupColorPickerOpen(false);
  };

  const handleUngroup = (groupKey: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.group_key === groupKey
          ? { ...p, group_key: null, group_color: null }
          : p
      )
    );
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    const newBoard: Board = {
      id: `board-${Date.now()}`,
      user_id: 'user',
      title: newBoardTitle.trim(),
      cover_url: null,
      position: boards.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    setNewBoardTitle('');
    setIsBoardModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewPost={() => setIsEditorOpen(true)}
        onOpenNewBoard={() => setIsBoardModalOpen(true)}
      />

      {/* Subheader: Board selection pills & Grouping actions */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBoardId(b.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                  activeBoardId === b.id
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle-bg)] hover:text-[var(--accent)]'
                }`}
              >
                {b.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSelectMode(true)}
              >
                <Layers className="mr-1.5 h-4 w-4" />
                Select to Group
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Project Folders Row */}
        {projects.length > 0 && !searchQuery && (
          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Projects
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {projects.map((proj) => (
                <ProjectTile
                  key={proj.id}
                  project={proj}
                  onClick={() =>
                    router.push(`/boards/${activeBoardId}/projects/${proj.id}`)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Standalone Posts Grid */}
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {searchQuery ? `Search results for "${searchQuery}"` : 'Prompts & Creations'}
        </h2>

        {filteredPosts.length === 0 ? (
          <EmptyState
            icon={Search}
            title={searchQuery ? `No results for "${searchQuery}"` : 'No prompts yet'}
            description={
              searchQuery
                ? 'Try searching for another keyword or phrase.'
                : 'Click "Create" in the top bar to record your first prompt.'
            }
            actionLabel={searchQuery ? undefined : 'Create Post'}
            onAction={searchQuery ? undefined : () => setIsEditorOpen(true)}
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.03 },
              },
            }}
          >
            <MasonryGrid>
              {/* 1. Grouped clusters */}
              {Array.from(groupedPostsMap.entries()).map(([groupKey, groupPosts]) => {
                const color = groupPosts[0]?.group_color;
                return (
                  <GroupWrapper
                    key={groupKey}
                    colorToken={color}
                    label={`Group (${groupPosts.length} items)`}
                  >
                    {groupPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        isSelectable={isSelectMode}
                        isSelected={selectedPostIds.includes(post.id)}
                        onToggleSelect={() => handleToggleSelect(post.id)}
                      />
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

              {/* 2. Standalone Posts */}
              {standalonePosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <PostCard
                    post={post}
                    isSelectable={isSelectMode}
                    isSelected={selectedPostIds.includes(post.id)}
                    onToggleSelect={() => handleToggleSelect(post.id)}
                  />
                </motion.div>
              ))}

              {/* 3. Skeleton Loading Shimmers when fetching next page */}
              {isLoadingMore && (
                <>
                  <SkeletonCard aspectRatio="3 / 4" />
                  <SkeletonCard aspectRatio="1 / 1" />
                  <SkeletonCard aspectRatio="4 / 5" />
                </>
              )}
            </MasonryGrid>
          </motion.div>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={observerRef} className="h-10 w-full" />
      </main>

      {/* Post Editor Modal */}
      <PostEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        boardId={activeBoardId}
        onPostCreated={() => fetchPosts(true)}
      />

      {/* New Board Modal */}
      {isBoardModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setIsBoardModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[var(--bg-page)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Create New Board
            </h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <Input
                placeholder="e.g. Concept Art, Ads, 3D Assets"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                autoFocus
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsBoardModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Board
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
