'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Copy, Check, ExternalLink, MoreHorizontal, CheckSquare, Square } from 'lucide-react';
import { PostWithDetails } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface PostCardProps {
  post: PostWithDetails;
  onClick?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function PostCard({
  post,
  onClick,
  isSelectable,
  isSelected,
  onToggleSelect,
}: PostCardProps) {
  const [copied, setCopied] = useState(false);

  // Aspect ratio calculation to eliminate layout shift (CLS)
  const aspectRatio =
    post.image_width && post.image_height
      ? `${post.image_width} / ${post.image_height}`
      : '1 / 1';

  // Get first prompt part for preview/quick copy
  const firstPromptPart = post.prompt?.parts?.[0]?.body_text || '';
  const promptTitle = post.prompt?.title || 'Untitled Prompt';

  const handleQuickCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstPromptPart) return;
    try {
      await navigator.clipboard.writeText(firstPromptPart);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleCardClick = () => {
    if (isSelectable && onToggleSelect) {
      onToggleSelect();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative mb-4 overflow-hidden rounded-2xl bg-[var(--bg-card)] card-hover-shadow cursor-pointer break-inside-avoid select-none',
        isSelected && 'ring-4 ring-[var(--accent)]'
      )}
    >
      {/* Multi-select overlay */}
      {isSelectable && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className="absolute top-3 right-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110"
        >
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-[var(--accent)]" />
          ) : (
            <Square className="h-5 w-5 text-[var(--text-secondary)]" />
          )}
        </div>
      )}

      {/* 1. Image Post */}
      {post.media_type === 'image' && post.image_url && (
        <div
          className="relative w-full overflow-hidden bg-[var(--bg-subtle)]"
          style={{ aspectRatio }}
        >
          <Image
            src={post.image_url}
            alt={promptTitle}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-102"
            loading="lazy"
          />

          {/* Hover overlay with quick actions */}
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 via-transparent to-black/20 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex justify-end">
              {post.prompt && (
                <button
                  type="button"
                  onClick={handleQuickCopy}
                  title="Copy first prompt part"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--text-primary)] shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[var(--success)]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            <div className="text-white">
              <p className="line-clamp-1 text-sm font-semibold drop-shadow-sm">
                {promptTitle}
              </p>
              {firstPromptPart && (
                <p className="line-clamp-2 text-xs text-white/80 drop-shadow-sm">
                  {firstPromptPart}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Video Post (External Google Drive with manual thumbnail) */}
      {post.media_type === 'video_link' && (
        <div
          className="relative w-full overflow-hidden bg-[var(--bg-subtle)]"
          style={{ aspectRatio }}
        >
          {post.video_thumbnail_url ? (
            <Image
              src={post.video_thumbnail_url}
              alt={promptTitle}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-102"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
              No Thumbnail
            </div>
          )}

          {/* Top-left Video Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="subtle">Video</Badge>
          </div>

          {/* Centered Play Button (48px white circle per UI_KIT) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[var(--text-primary)] shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Hover overlay with quick copy */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="text-white">
              <p className="line-clamp-1 text-sm font-semibold">{promptTitle}</p>
            </div>
            {firstPromptPart && (
              <button
                type="button"
                onClick={handleQuickCopy}
                title="Copy prompt"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--text-primary)] shadow backdrop-blur-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Text-only Post */}
      {post.media_type === 'none' && (
        <div className="flex min-h-[160px] flex-col justify-between rounded-2xl bg-[var(--bg-subtle)] p-4 transition-colors">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="subtle">Text</Badge>
              {firstPromptPart && (
                <button
                  type="button"
                  onClick={handleQuickCopy}
                  title="Copy prompt"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-white hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[var(--success)]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <h4 className="mb-1 text-[15px] font-semibold text-[var(--text-primary)] line-clamp-1">
              {promptTitle}
            </h4>
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] line-clamp-5">
              {firstPromptPart || 'No prompt content'}
            </p>
          </div>
          {post.prompt?.parts && post.prompt.parts.length > 1 && (
            <div className="mt-3 text-[11px] font-medium text-[var(--text-secondary)]">
              +{post.prompt.parts.length - 1} more prompt part{post.prompt.parts.length > 2 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
