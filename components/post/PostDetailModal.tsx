'use client';

import React from 'react';
import Image from 'next/image';
import { X, ExternalLink, Trash2 } from 'lucide-react';
import { PostWithDetails } from '@/types/database';
import { PromptPartCard } from '@/components/post/PromptPartCard';
import { parseDriveLink } from '@/lib/video-link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface PostDetailModalProps {
  post: PostWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (postId: string) => void;
}

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  onDelete,
}: PostDetailModalProps) {
  if (!isOpen || !post) return null;

  const parsedDrive =
    post.media_type === 'video_link' && post.video_url
      ? parseDriveLink(post.video_url)
      : null;

  const promptTitle = post.prompt?.title || 'Untitled Prompt';
  const parts = post.prompt?.parts || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col md:flex-row overflow-hidden rounded-2xl bg-[var(--bg-page)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[var(--text-primary)] shadow-sm backdrop-blur-md hover:bg-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Media Preview Column */}
        <div className="flex flex-1 items-center justify-center bg-[var(--bg-subtle)] p-6 min-h-[300px]">
          {post.media_type === 'image' && post.image_url && (
            <div className="relative h-full max-h-[70vh] w-full">
              <Image
                src={post.image_url}
                alt={promptTitle}
                fill
                className="rounded-xl object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}

          {post.media_type === 'video_link' && (
            <div className="flex h-full w-full flex-col items-center justify-center">
              {parsedDrive?.embedUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                  <iframe
                    src={parsedDrive.embedUrl}
                    width="100%"
                    height="100%"
                    allow="autoplay"
                    className="border-0"
                  />
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Preview not available for this link.
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
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open original link in Google Drive
                </a>
              )}
            </div>
          )}

          {post.media_type === 'none' && (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <Badge variant="subtle" className="mb-2">
                Text Prompt
              </Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {promptTitle}
              </h3>
            </div>
          )}
        </div>

        {/* Prompt Parts & Metadata Column */}
        <div className="flex w-full md:w-[380px] flex-col justify-between border-t md:border-t-0 md:border-l border-[var(--border-subtle)] p-6 overflow-y-auto max-h-[90vh]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="subtle">
                {post.media_type === 'image'
                  ? 'Image'
                  : post.media_type === 'video_link'
                  ? 'Video'
                  : 'Text'}
              </Badge>
              {post.group_color && (
                <span
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: `var(${post.group_color})` }}
                  title="Grouped Post"
                />
              )}
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {promptTitle}
            </h2>

            {/* Prompt Parts Stack */}
            <div className="space-y-3">
              {parts.map((part) => (
                <PromptPartCard
                  key={part.id}
                  subheading={part.subheading}
                  bodyText={part.body_text}
                />
              ))}

              {parts.length === 0 && (
                <p className="text-sm italic text-[var(--text-secondary)]">
                  No prompt text recorded.
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">
              {new Date(post.created_at).toLocaleDateString()}
            </span>

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this post?')) {
                    onDelete(post.id);
                    onClose();
                  }
                }}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
