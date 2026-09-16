'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { MasonryGrid } from '@/components/grid/MasonryGrid';
import { PostCard } from '@/components/post/PostCard';
import { ProjectTile } from '@/components/grid/ProjectTile';
import { GroupWrapper } from '@/components/group/GroupWrapper';
import { GroupColorPicker } from '@/components/group/GroupColorPicker';
import { PostDetailModal } from '@/components/post/PostDetailModal';
import { PostEditorModal } from '@/components/post/PostEditorModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PostWithDetails, Board, Project } from '@/types/database';
import { Sparkles, Layers, Plus, CheckSquare } from 'lucide-react';

// Curated seed items so the app is immediately visual & testable
const DEMO_POSTS: PostWithDetails[] = [
  {
    id: 'demo-1',
    board_id: 'board-1',
    project_id: null,
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
    project_id: null,
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
    project_id: null,
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
    project_id: null,
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
    project_id: null,
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

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);

  // Grouping & Multi-select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [groupColorPickerOpen, setGroupColorPickerOpen] = useState(false);

  // New Board modal state
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  // Fetch real data from Supabase backend if configured
  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?boardId=${activeBoardId}`);
      const data = await res.json();
      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      }
    } catch {
      // Keep demo posts if DB is not yet populated
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeBoardId]);

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().trim();
    return posts.filter((p) => {
      const titleMatch = p.prompt?.title?.toLowerCase().includes(q);
      const partsMatch = p.prompt?.parts?.some((part) =>
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

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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
      {/* Pinterest-style Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewPost={() => setIsEditorOpen(true)}
        onOpenNewBoard={() => setIsBoardModalOpen(true)}
      />

      {/* Board & Action Sub-header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Boards Pills Selector */}
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

          {/* Grouping / Selection Toggle */}
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

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Project Folders Row */}
        {projects.length > 0 && !searchQuery && (
          <div className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Projects
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {projects.map((proj) => (
                <ProjectTile
                  key={proj.id}
                  project={proj}
                  posts={posts.filter((p) => p.project_id === proj.id)}
                  onClick={() => alert(`Opening project: ${proj.title}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pinterest Masonry Grid */}
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {searchQuery ? `Search results for "${searchQuery}"` : 'All Prompts & Media'}
        </h2>

        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
            <Sparkles className="h-10 w-10 text-[var(--text-secondary)] mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              No prompts found
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm">
              Try adjusting your search terms or click &ldquo;New Post&rdquo; to add your first AI creation.
            </p>
          </div>
        ) : (
          <MasonryGrid>
            {/* 1. Grouped clusters */}
            {Array.from(groupedPostsMap.entries()).map(([groupKey, groupPosts]) => {
              const color = groupPosts[0]?.group_color;
              return (
                <GroupWrapper
                  key={groupKey}
                  colorToken={color}
                  label={`Group (${groupPosts.length} posts)`}
                >
                  {groupPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => setSelectedPost(post)}
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
              <PostCard
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
                isSelectable={isSelectMode}
                isSelected={selectedPostIds.includes(post.id)}
                onToggleSelect={() => handleToggleSelect(post.id)}
              />
            ))}
          </MasonryGrid>
        )}
      </main>

      {/* Post Detail & Split Prompt Copy Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        onDelete={handleDeletePost}
      />

      {/* Post Editor Modal */}
      <PostEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        boardId={activeBoardId}
        onPostCreated={fetchPosts}
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
                placeholder="e.g. Product Renders, Anime, Sci-Fi"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                autoFocus
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
