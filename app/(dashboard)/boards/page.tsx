'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navigation/Navbar';
import { MasonryGrid } from '@/components/grid/MasonryGrid';
import { BoardTile } from '@/components/grid/BoardTile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BoardWithDetails } from '@/types/database';
import { PostEditorModal } from '@/components/post/PostEditorModal';

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardWithDetails[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    async function loadBoards() {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const data = await res.json();
          if (data.boards) {
            setBoards(data.boards);
          }
        }
      } catch (e) {
        console.warn('Could not fetch boards', e);
      }
    }
    loadBoards();
  }, []);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.board) {
          setBoards((prev) => [...prev, data.board]);
        }
      }
    } catch (err) {
      console.error('Failed to create board', err);
    }

    setNewTitle('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">
      <Navbar
        onOpenNewBoard={() => setIsCreateModalOpen(true)}
        onOpenNewPost={() => setIsPostModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Your Boards
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Collections of projects and AI prompt references
          </p>
        </div>

        {/* Pinterest Boards Grid with Fixed First "Create board" dashed tile */}
        <MasonryGrid>
          {/* Always first: dashed Create Board tile per UI_KIT §8 */}
          <BoardTile
            isCreateTile
            onClick={() => setIsCreateModalOpen(true)}
          />

          {/* Board Tiles */}
          {boards.map((board) => (
            <BoardTile
              key={board.id}
              board={board}
              onClick={() => router.push(`/boards/${board.id}`)}
            />
          ))}
        </MasonryGrid>
      </main>

      {/* Create Board Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setIsCreateModalOpen(false)}
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
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
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

      <PostEditorModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        boardId={boards[0]?.id || 'board-1'}
        onPostCreated={() => {}}
      />
    </div>
  );
}
