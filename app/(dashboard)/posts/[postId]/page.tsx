'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Trash2, ArrowLeft, ImageOff } from 'lucide-react';
import { PostWithDetails } from '@/types/database';
import { PromptPartCard } from '@/components/post/PromptPartCard';
import { parseDriveLink } from '@/lib/video-link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

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
        console.warn('Could not fetch post', e);
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
        <EmptyState
          icon={ImageOff}
          title="Post not found"
          description="This post may have been deleted or the link is invalid."
          actionLabel="Back to Dashboard"
          onAction={() => router.push('/')}
        />
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
            <span>Cueboard</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
