'use client';

import React from 'react';
import Image from 'next/image';
import { Layers, Folder } from 'lucide-react';
import { Project, PostWithDetails } from '@/types/database';
import { cn } from '@/lib/utils';

export interface ProjectTileProps {
  project: Project;
  posts?: PostWithDetails[];
  onClick?: () => void;
}

export function ProjectTile({ project, posts = [], onClick }: ProjectTileProps) {
  const postCount = posts.length;
  const firstPost = posts[0];

  const coverUrl =
    firstPost?.media_type === 'image'
      ? firstPost.image_url
      : firstPost?.media_type === 'video_link'
      ? firstPost.video_thumbnail_url
      : null;

  return (
    <div
      onClick={onClick}
      className="group relative mb-4 overflow-hidden rounded-2xl bg-[var(--bg-card)] card-hover-shadow cursor-pointer break-inside-avoid select-none"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--bg-subtle)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[var(--text-secondary)]">
            <Folder className="h-12 w-12 stroke-1 text-[var(--text-secondary)] mb-2" />
            <span className="text-xs">Empty Project</span>
          </div>
        )}

        {/* Stacked-card badge, top-right per UI_KIT §5 */}
        <div className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md">
          <Layers className="h-4 w-4 text-[var(--text-primary)]" />
        </div>

        {/* Gradient and Title / Hover Post count */}
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 text-white">
          <div>
            <span className="inline-block rounded-md bg-black/40 px-2 py-0.5 text-xs font-medium backdrop-blur-md">
              Project
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold drop-shadow-sm">{project.title}</h3>
            <p className="text-xs text-white/80 opacity-90 transition-opacity group-hover:opacity-100">
              {postCount} {postCount === 1 ? 'post' : 'posts'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
