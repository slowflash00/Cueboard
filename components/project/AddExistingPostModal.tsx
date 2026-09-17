'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Search, Plus, Check, FileText } from 'lucide-react';
import { PostWithDetails } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface AddExistingPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  boardId: string;
  onPostsAdded: () => void;
}

export function AddExistingPostModal({
  isOpen,
  onClose,
  projectId,
  boardId,
  onPostsAdded,
}: AddExistingPostModalProps) {
  const [availablePosts, setAvailablePosts] = useState<PostWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadAvailable() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/available-posts?boardId=${boardId}`
        );
        if (res.ok) {
          const data = await res.json();
          setAvailablePosts(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to load available posts', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAvailable();
  }, [isOpen, projectId, boardId]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredPosts = availablePosts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = post.prompt?.title?.toLowerCase() || '';
    const body = post.prompt?.parts?.[0]?.body_text?.toLowerCase() || '';
    return title.includes(q) || body.includes(q);
  });

  const handleAddSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);

    try {
      for (const postId of selectedIds) {
        await fetch(`/api/projects/${projectId}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        });
      }
      onPostsAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add posts to project', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-[var(--bg-page)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Add Existing Posts to Project
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select posts from this board to link into this folder
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <Input
            placeholder="Search available posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Post Grid Picker */}
        <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[450px] pr-1">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent)]" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-[var(--text-secondary)]">
              No available posts found to add.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredPosts.map((post) => {
                const isSelected = selectedIds.includes(post.id);
                const title = post.prompt?.title || 'Untitled';
                const thumb =
                  post.media_type === 'image'
                    ? post.image_url
                    : post.media_type === 'video_link'
                    ? post.video_thumbnail_url
                    : null;

                return (
                  <div
                    key={post.id}
                    onClick={() => toggleSelect(post.id)}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                        : 'border-transparent bg-[var(--bg-subtle)] hover:border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[var(--bg-subtle)]">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={title}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                          <FileText className="h-8 w-8 text-[var(--text-secondary)] mb-1 opacity-60" />
                          <span className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2">
                            {title}
                          </span>
                        </div>
                      )}

                      {/* Selection Checkmark */}
                      <div
                        className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-transform ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white scale-110'
                            : 'bg-white/80 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <div className="p-2">
                      <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                        {title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] mt-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            {selectedIds.length} post{selectedIds.length === 1 ? '' : 's'} selected
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddSelected}
              disabled={selectedIds.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add to Project'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
