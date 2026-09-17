'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Video, FileText, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MediaType } from '@/types/database';
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
  boardId: string;
  projectId?: string | null;
  onPostCreated: () => void;
}

export function PostEditorModal({
  isOpen,
  onClose,
  boardId,
  projectId,
  onPostCreated,
}: PostEditorModalProps) {
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState<string | null>(null);

  const [promptTitle, setPromptTitle] = useState('');
  const [promptParts, setPromptParts] = useState<PromptPartInput[]>([
    { id: '1', subheading: 'Positive', body_text: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time Drive validation per PRD §10 / UI_KIT §9
  const isInvalidDriveLink =
    videoUrl.trim().length > 0 && !parseDriveLink(videoUrl);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      let uploadedImageUrl: string | null = null;
      let imgWidth: number | null = null;
      let imgHeight: number | null = null;
      let uploadedThumbnailUrl: string | null = null;

      if (mediaType === 'image') {
        if (!imageFile) {
          throw new Error('Please select an image to upload.');
        }
        const res = await uploadImage(imageFile, 'post-images');
        uploadedImageUrl = res.url;
        imgWidth = res.width;
        imgHeight = res.height;
      } else if (mediaType === 'video_link') {
        if (!videoUrl) {
          throw new Error('Please paste a Google Drive video link.');
        }
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
          board_id: boardId,
          project_id: projectId || null,
          media_type: mediaType,
          image_url: uploadedImageUrl,
          image_width: imgWidth,
          image_height: imgHeight,
          video_url: videoUrl || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--bg-page)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Create New Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-[#D32F2F] border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* Media Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-2">
              Post Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                  mediaType === 'image'
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-semibold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Image
              </button>
              <button
                type="button"
                onClick={() => setMediaType('video_link')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                  mediaType === 'video_link'
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-semibold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                <Video className="h-4 w-4" />
                Video (Drive)
              </button>
              <button
                type="button"
                onClick={() => setMediaType('none')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                  mediaType === 'none'
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-semibold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                <FileText className="h-4 w-4" />
                Text Only
              </button>
            </div>
          </div>

          {/* Image Upload Area */}
          {mediaType === 'image' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-2">
                Upload Image
              </label>
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-6 text-center cursor-pointer hover:border-[var(--accent)] transition-colors">
                {imagePreview ? (
                  <div className="relative aspect-auto max-h-60 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="max-h-60 rounded-xl object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[var(--text-secondary)] mb-2" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Click to choose an image
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1">
                      PNG, JPG, WEBP
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Video Drive Link Area */}
          {mediaType === 'video_link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-2">
                  Google Drive Video URL
                </label>
                <Input
                  placeholder="https://drive.google.com/file/d/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />

                {/* Inline Drive Validation Error in dedicated #D32F2F per UI_KIT §9 */}
                {isInvalidDriveLink && (
                  <p className="mt-1.5 text-xs text-[#D32F2F] font-medium">
                    This link does not look like a Google Drive file link. Post can still be saved, but video preview may not embed.
                  </p>
                )}

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Make sure link sharing is set to &ldquo;Anyone with the link&rdquo;.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-2">
                  Upload Video Thumbnail (Required for card preview)
                </label>
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4 text-center cursor-pointer hover:border-[var(--accent)] transition-colors">
                  {videoThumbnailPreview ? (
                    <div className="relative max-h-40 overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={videoThumbnailPreview}
                        alt="Thumbnail preview"
                        className="max-h-40 rounded-xl object-contain"
                      />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-[var(--text-secondary)] mb-1" />
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        Select a thumbnail image
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Prompt Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-2">
                Prompt Title (Optional)
              </label>
              <Input
                placeholder="e.g. Cyberpunk Street Portrait"
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase text-[var(--text-secondary)]">
                  Prompt Parts (Multi-part breakdown)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addPromptPart('Negative')}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    + Negative
                  </button>
                  <button
                    type="button"
                    onClick={() => addPromptPart('Camera / Style')}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    + Style
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {promptParts.map((part, index) => (
                  <div
                    key={part.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Subheading (e.g. Positive, Negative, Camera)"
                        value={part.subheading}
                        onChange={(e) =>
                          updatePromptPart(part.id, 'subheading', e.target.value)
                        }
                        className="bg-transparent text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] focus:outline-none"
                      />
                      {promptParts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePromptPart(part.id)}
                          className="text-[var(--text-secondary)] hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Enter the prompt text..."
                      value={part.body_text}
                      onChange={(e) =>
                        updatePromptPart(part.id, 'body_text', e.target.value)
                      }
                      className="w-full resize-none bg-transparent text-sm text-[var(--text-primary)] focus:outline-none"
                      required={index === 0 && mediaType === 'none'}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addPromptPart('')}
                className="mt-3 w-full"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Prompt Part
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Post...' : 'Save Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
