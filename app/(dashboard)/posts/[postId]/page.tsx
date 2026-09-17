'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Trash2, ArrowLeft } from 'lucide-react';
import { PostWithDetails } from '@/types/database';
import { PromptPartCard } from '@/components/post/PromptPartCard';
import { parseDriveLink } from '@/lib/video-link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Demo fallback items in case local database isn't populated
const DEMO_POSTS: Record<string, PostWithDetails> = {
  'demo-1': {
    id: 'demo-1',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'image',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85',
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
  'demo-2': {
    id: 'demo-2',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'video_link',
    image_url: null,
    image_width: 1280,
    image_height: 720,
    video_url: 'https://drive.google.com/file/d/1gqjD0k3u_mock_id/view?usp=sharing',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=85',
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
  'demo-3': {
    id: 'demo-3',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'image',
    image_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=85',
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
  'demo-4': {
    id: 'demo-4',
    board_id: 'board-1',
    user_id: 'demo-user',
    media_type: 'image',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
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
  'demo-5': {
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
};

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.post) {
            setPost(data.post);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not fetch from API, checking demo fallback', e);
      }

      // Check demo fallback
      if (DEMO_POSTS[postId]) {
        setPost(DEMO_POSTS[postId]);
      }
      setIsLoading(false);
    }

    loadPost();
  }, [postId]);

  const handleCopyAll = async () => {
    if (!post?.prompt?.parts) return;
    const allText = post.prompt.parts
      .map((p) => (p.subheading ? `[${p.subheading}]\n${p.body_text}` : p.body_text))
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch (err) {
      console.error('Failed to copy all prompts', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)]">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-[var(--border-subtle)] border-t-[var(--accent)]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-page)] p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Post not found</h2>
        <Button variant="primary" size="md" className="mt-4" onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const parsedDrive =
    post.media_type === 'video_link' && post.video_url
      ? parseDriveLink(post.video_url)
      : null;

  const promptTitle = post.prompt?.title || 'Untitled Prompt';
  const parts = post.prompt?.parts || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative min-h-screen w-full bg-[var(--bg-page)]"
    >
      {/* Pinterest-style Circular Close Button: top-left over media */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Close and go back"
        className="fixed top-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--text-primary)] shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
      >
        <X className="h-5 w-5 stroke-[2.2]" />
      </button>

      {/* Main Viewport Split: Media Left ~60%, Prompt Panel Right ~40% */}
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* LEFT COLUMN: Media Container (~60%) */}
        <div className="relative flex w-full lg:w-[60%] items-center justify-center bg-[var(--bg-subtle)] p-6 md:p-12 min-h-[50vh] lg:min-h-screen">
          {post.media_type === 'image' && post.image_url && (
            <div className="relative h-full max-h-[88vh] w-full flex items-center justify-center">
              <div
                className="relative max-h-[85vh] max-w-full overflow-hidden rounded-2xl shadow-xl"
                style={{
                  aspectRatio:
                    post.image_width && post.image_height
                      ? `${post.image_width} / ${post.image_height}`
                      : '4 / 5',
                  height: '85vh',
                }}
              >
                <Image
                  src={post.image_url}
                  alt={promptTitle}
                  fill
                  priority
                  className="object-contain rounded-2xl"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </div>
          )}

          {post.media_type === 'video_link' && (
            <div className="flex w-full max-w-3xl flex-col items-center justify-center">
              {parsedDrive?.embedUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl bg-black">
                  <iframe
                    src={parsedDrive.embedUrl}
                    width="100%"
                    height="100%"
                    allow="autoplay"
                    className="border-0 h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-12 text-center">
                  <p className="text-base text-[var(--text-secondary)] mb-3">
                    Preview unavailable for this Drive link.
                  </p>
                  {post.video_url && (
                    <a
                      href={post.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" /> Open in Google Drive
                    </a>
                  )}
                </div>
              )}

              {post.video_url && parsedDrive && (
                <a
                  href={post.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open original link in Google Drive
                </a>
              )}
            </div>
          )}

          {post.media_type === 'none' && (
            <div className="flex flex-col items-center justify-center text-center p-12">
              <Badge variant="subtle" className="mb-3 text-sm px-3 py-1">
                Text Prompt
              </Badge>
              <h2 className="text-3xl font-extrabold text-[var(--text-primary)] max-w-md">
                {promptTitle}
              </h2>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Prompt Panel (~40%) with 24px padding & independent scroll */}
        <div className="flex w-full lg:w-[40%] flex-col justify-between border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] bg-[var(--bg-page)] p-6 md:p-8 lg:p-10 lg:h-screen lg:overflow-y-auto">
          <div>
            {/* Top Row: Badges & Quick Action Icons */}
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Badge variant="subtle">
                  {post.media_type === 'image'
                    ? 'Image'
                    : post.media_type === 'video_link'
                    ? 'Video'
                    : 'Text'}
                </Badge>
                {post.group_color && (
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: `var(${post.group_color})` }}
                    title="Grouped Post"
                  />
                )}
              </div>

              {/* Quick Actions per UI_KIT §7 */}
              <div className="flex items-center gap-2">
                {parts.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyAll}
                    title="Copy all prompt parts"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="mr-1.5 h-4 w-4 text-[var(--success)]" />
                        Copied All
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-4 w-4 text-[var(--text-secondary)]" />
                        Copy All
                      </>
                    )}
                  </Button>
                )}

                {post.media_type === 'video_link' && post.video_url && (
                  <a
                    href={post.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                    title="Open in Drive"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Prompt Title */}
            <div className="pt-6 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {promptTitle}
              </h1>
            </div>

            {/* Prompt Parts Stack */}
            <div className="space-y-4">
              {parts.map((part) => (
                <PromptPartCard
                  key={part.id}
                  subheading={part.subheading}
                  bodyText={part.body_text}
                />
              ))}

              {parts.length === 0 && (
                <p className="text-sm italic text-[var(--text-secondary)]">
                  No prompt text recorded for this post.
                </p>
              )}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Created {new Date(post.created_at).toLocaleDateString()}</span>
            <span>Prompt Board</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
