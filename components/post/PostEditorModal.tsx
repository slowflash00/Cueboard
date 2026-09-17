'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  FolderPlus,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MediaType, Board } from '@/types/database';
import { uploadImage } from '@/lib/media';
import { parseDriveLink } from '@/lib/video-link';

export interface PromptPartInput {
  id: string;
  subheading: string;
  body_text: string;
}

export interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId?: string | null;
  projectId?: string | null;
  onPostCreated: () => void;
  onUploadStart?: () => void;
}

export function PostEditorModal({
  isOpen,
  onClose,
  boardId: initialBoardId,
  projectId,
  onPostCreated,
  onUploadStart,
}: PostEditorModalProps) {
  // Boards state
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    initialBoardId || ''
  );
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isBoardSubmitting, setIsBoardSubmitting] = useState(false);

  // Media state
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState<string | null>(null);

  // Prompts state
  const [promptTitle, setPromptTitle] = useState('');
  const [promptParts, setPromptParts] = useState<PromptPartInput[]>([
    { id: '1', subheading: 'Positive', body_text: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch boards on modal open
  useEffect(() => {
    if (!isOpen) return;

    async function loadBoards() {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const data = await res.json();
          const list: Board[] = data.boards || [];
          setBoards(list);

          if (!selectedBoardId && list.length > 0) {
            setSelectedBoardId(list[0].id);
          } else if (initialBoardId) {
            setSelectedBoardId(initialBoardId);
          }
        }
      } catch (err) {
        console.warn('Could not fetch boards in PostEditorModal', err);
      }
    }

    loadBoards();
  }, [isOpen, initialBoardId]);

  if (!isOpen) return null;

  // Real-time Drive validation per PRD §10 / UI_KIT §9
  const isInvalidDriveLink =
    mediaType === 'video_link' &&
    videoUrl.trim().length > 0 &&
    !parseDriveLink(videoUrl);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoThumbnailFile(file);
      setVideoThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const addPromptPart = (suggestedSubheading = '') => {
    setPromptParts((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        subheading: suggestedSubheading,
        body_text: '',
      },
    ]);
  };

  const removePromptPart = (id: string) => {
    if (promptParts.length <= 1) return;
    setPromptParts((prev) => prev.filter((part) => part.id !== id));
  };

  const updatePromptPart = (
    id: string,
    field: 'subheading' | 'body_text',
    value: string
  ) => {
    setPromptParts((prev) =>
      prev.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
  };

  // Inline Quick Board Creation
  const handleQuickCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    setIsBoardSubmitting(true);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBoardName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.board) {
          setBoards((prev) => [data.board, ...prev]);
          setSelectedBoardId(data.board.id);
          setNewBoardName('');
          setIsCreatingBoard(false);
        }
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create board');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create board');
    } finally {
      setIsBoardSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Verify board is selected
    if (!selectedBoardId) {
      setErrorMsg('Please select or create a board to save this post.');
      return;
    }

    if (mediaType === 'image' && !imageFile && !imagePreview) {
      setErrorMsg('Please select an image to upload.');
      return;
    }

    if (mediaType === 'video_link' && !videoUrl.trim()) {
      setErrorMsg('Please enter a Google Drive video link.');
      return;
    }

    setIsSubmitting(true);
    if (onUploadStart) {
      onUploadStart();
    }

    try {
      let uploadedImageUrl: string | null = null;
      let imgWidth: number | null = null;
      let imgHeight: number | null = null;
      let uploadedThumbnailUrl: string | null = null;

      if (mediaType === 'image' && imageFile) {
        const res = await uploadImage(imageFile, 'post-images');
        uploadedImageUrl = res.url;
        imgWidth = res.width;
        imgHeight = res.height;
      } else if (mediaType === 'video_link') {
        if (videoThumbnailFile) {
          const res = await uploadImage(videoThumbnailFile, 'video-thumbnails');
          uploadedThumbnailUrl = res.url;
          imgWidth = res.width;
          imgHeight = res.height;
        }
      }

      // Call API to save post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: selectedBoardId,
          project_id: projectId || null,
          media_type: mediaType,
          image_url: uploadedImageUrl,
          image_width: imgWidth,
          image_height: imgHeight,
          video_url: videoUrl.trim() || null,
          video_thumbnail_url: uploadedThumbnailUrl,
          prompt_title: promptTitle.trim() || null,
          prompt_parts: promptParts
            .filter((p) => p.body_text.trim().length > 0)
            .map((p, idx) => ({
              subheading: p.subheading.trim() || null,
              body_text: p.body_text.trim(),
              position: idx,
            })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save post.');
      }

      onPostCreated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl bg-[var(--bg-page)] shadow-2xl overflow-hidden border border-[var(--border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Top Bar per Pinterest Pin-Builder Pattern */}
        <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-page)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5 stroke-[2]" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Create Pin
            </h2>
          </div>

          {/* Target Board Dropdown & Publish Action */}
          <div className="flex items-center gap-3">
            {/* Board Selector */}
            <div className="flex items-center gap-2">
              <label className="hidden sm:inline text-xs font-semibold uppercase text-[var(--text-secondary)]">
                Board:
              </label>
              {boards.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedBoardId}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsCreatingBoard(true);
                      } else {
                        setSelectedBoardId(e.target.value);
                      }
                    }}
                    className="h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-subtle)] pl-4 pr-8 text-xs sm:text-sm font-semibold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
                  >
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                    <option value="__NEW__">+ Create new board...</option>
                  </select>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingBoard(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle-bg)] transition-colors"
                >
                  <FolderPlus className="h-3.5 w-3.5" /> Create a Board
                </button>
              )}
            </div>

            {/* Primary Save / Publish Button in Pinterest Red */}
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 font-semibold shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </span>
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </header>

        {/* Inline Create Board Card (if triggered) */}
        {isCreatingBoard && (
          <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-6 py-3">
            <form
              onSubmit={handleQuickCreateBoard}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-semibold uppercase text-[var(--text-secondary)]">
                New Board:
              </span>
              <Input
                placeholder="e.g. Anime Portraits, Ad Concepts"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                autoFocus
                className="max-w-xs h-9 bg-white"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isBoardSubmitting || !newBoardName.trim()}
              >
                {isBoardSubmitting ? 'Creating...' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreatingBoard(false);
                  setNewBoardName('');
                }}
              >
                Cancel
              </Button>
            </form>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-xs font-medium text-[#D32F2F] flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-[#D32F2F] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Two-Column Pin Builder Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ============================================================ */}
            {/* LEFT COLUMN: Media Dropzone & Preview (~45% width on desktop) */}
            {/* ============================================================ */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Media Type Tabs */}
              <div className="flex rounded-full bg-[var(--bg-subtle)] p-1 border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all cursor-pointer ${
                    mediaType === 'image'
                      ? 'bg-white text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video_link')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all cursor-pointer ${
                    mediaType === 'video_link'
                      ? 'bg-white text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  Video (Drive)
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('none')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all cursor-pointer ${
                    mediaType === 'none'
                      ? 'bg-white text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Text Only
                </button>
              </div>

              {/* 1. Image Mode Dropzone */}
              {mediaType === 'image' && (
                <div className="w-full">
                  <label
                    htmlFor="post-image-upload"
                    className="relative flex min-h-[380px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-6 text-center transition-colors hover:border-[var(--accent)] cursor-pointer overflow-hidden group"
                  >
                    {imagePreview ? (
                      <div className="relative h-full w-full flex flex-col items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Post upload preview"
                          className="max-h-[360px] w-auto max-w-full rounded-2xl object-contain shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                          <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[var(--text-primary)] shadow">
                            Click to replace image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="h-7 w-7 text-[var(--accent)]" />
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                          Choose a file or drag and drop it here
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] max-w-xs">
                          High quality PNG, JPG, or WEBP. Max 20MB.
                        </p>
                      </div>
                    )}
                    <input
                      id="post-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* 2. Video Link Mode */}
              {mediaType === 'video_link' && (
                <div className="space-y-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1.5">
                      Google Drive Video Share Link
                    </label>
                    <Input
                      placeholder="https://drive.google.com/file/d/.../view"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="bg-white"
                    />
                    {isInvalidDriveLink && (
                      <p className="mt-1.5 text-xs text-[#D32F2F] font-medium">
                        This does not look like a Google Drive file link. Post can still be saved, but video player may not embed.
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                      Set share permission to &ldquo;Anyone with the link can view&rdquo;.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1.5">
                      Video Thumbnail Image
                    </label>
                    <label
                      htmlFor="video-thumb-upload"
                      className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] bg-white p-4 text-center cursor-pointer hover:border-[var(--accent)] transition-colors overflow-hidden"
                    >
                      {videoThumbnailPreview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={videoThumbnailPreview}
                          alt="Thumbnail preview"
                          className="max-h-36 rounded-xl object-contain shadow-sm"
                        />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-[var(--text-secondary)] mb-1.5" />
                          <span className="text-xs font-semibold text-[var(--text-primary)]">
                            Select thumbnail cover
                          </span>
                        </>
                      )}
                      <input
                        id="video-thumb-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* 3. Text Only Mode Preview */}
              {mediaType === 'none' && (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-8 text-center">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] shadow-sm mb-3">
                    Text-Only Post
                  </span>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    No visual media attached
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
                    This post will appear as a styled card showcasing your prompt title and parameters.
                  </p>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* RIGHT COLUMN: Prompt Metadata & Section Cards (~55% width)   */}
            {/* ============================================================ */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Prompt Title */}
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1.5">
                  Title
                </label>
                <Input
                  placeholder="e.g. Cyberpunk Street Portrait, 8k Unreal Engine"
                  value={promptTitle}
                  onChange={(e) => setPromptTitle(e.target.value)}
                  className="text-base font-semibold py-2.5"
                />
              </div>

              {/* Prompt Parts (Sections) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Prompt Sections
                    </label>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Add and organize your multi-part generation prompts
                    </p>
                  </div>

                  {/* Section Quick Presets */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => addPromptPart('Positive')}
                      className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--accent-subtle-bg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                    >
                      + Positive
                    </button>
                    <button
                      type="button"
                      onClick={() => addPromptPart('Negative')}
                      className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--accent-subtle-bg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                    >
                      + Negative
                    </button>
                    <button
                      type="button"
                      onClick={() => addPromptPart('Style / Camera')}
                      className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--accent-subtle-bg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                    >
                      + Style
                    </button>
                  </div>
                </div>

                {/* Prompt Parts List with Generous Visibility */}
                <div className="space-y-3.5">
                  {promptParts.map((part, index) => (
                    <div
                      key={part.id}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4 transition-all focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[var(--text-secondary)] shadow-xs">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="Section Name (e.g. Positive, Negative, Lighting)"
                            value={part.subheading}
                            onChange={(e) =>
                              updatePromptPart(part.id, 'subheading', e.target.value)
                            }
                            className="bg-transparent text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]"
                          />
                        </div>

                        {promptParts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePromptPart(part.id)}
                            aria-label="Remove prompt part"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Full-width Generous Textarea so prompts are fully readable */}
                      <textarea
                        rows={4}
                        placeholder="Enter prompt text here..."
                        value={part.body_text}
                        onChange={(e) =>
                          updatePromptPart(part.id, 'body_text', e.target.value)
                        }
                        className="w-full resize-y rounded-xl bg-white p-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addPromptPart('Custom')}
                  className="w-full py-2.5 rounded-2xl border-dashed"
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Add Another Prompt Section
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
