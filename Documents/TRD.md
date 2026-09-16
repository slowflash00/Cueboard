# TRD — Prompt Board

## 1. Stack
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** lucide-react (only icon set used — see UI_KIT.md)
- **Backend:** Supabase (Postgres + Auth + Storage). No separate backend server.
- **Drag & drop:** `@dnd-kit/core` + `@dnd-kit/sortable` (reordering Boards/Projects/Posts, and multi-select for grouping)
- **Masonry grid:** CSS `columns` (simplest, no dependency) as default; if layout gets janky, swap to `react-masonry-css`. Store image `width`/`height` on upload so aspect ratio is known before the image loads — prevents layout shift either way.
- **Deployment:** Vercel, connected to the Supabase project via environment variables.

## 2. Why this stack
- Zero ops: Supabase gives Postgres + Auth + file storage in one dashboard, Vercel deploys Next.js with a git push.
- Free tier is enough for the MVP because video is never uploaded — only images (posts) and thumbnails (for video posts) touch Supabase Storage, which is comfortably within free limits for a personal library.
- Everything (DB + storage) is swappable later behind small abstraction functions (see §5) without touching UI code.

## 3. Folder structure
```
/app
  /(auth)/login
  /(dashboard)
    /page.tsx              -- top-level grid: project tiles + standalone posts
    /boards/[boardId]/page.tsx
    /boards/[boardId]/projects/[projectId]/page.tsx
    /posts/[postId]/page.tsx        -- post detail / edit
/components
  /grid                    -- MasonryGrid, ProjectTile, PostCard
  /post                    -- PostEditor, PromptPartCard, MediaUploader, VideoLinkInput
  /group                   -- GroupWrapper, GroupColorPicker
  /ui                      -- shadcn primitives
/lib
  /supabase                -- client.ts (browser), server.ts (server components/actions)
  /media.ts                -- uploadImage(), getPublicUrl() — the one place storage calls happen
  /video-link.ts           -- parseDriveLink(url) -> { fileId, embedUrl } | null
  /queries                 -- typed data-fetching functions per table
/types                     -- generated Supabase types + shared domain types
```

## 4. Auth
- Supabase email/password auth, single user account for MVP.
- Every table has `user_id` and RLS policies scoped to `auth.uid()` (see DATABASE.md) — even though it's single-user today, this makes the app safe to have publicly deployed and removes rework if a second user is ever added.
- Session handled via Supabase's Next.js SSR helpers (`@supabase/ssr`), middleware refreshes the session cookie on each request.

## 5. Storage abstraction (important)
Never call `supabase.storage.from(...)` directly from components. Route every upload/read through `/lib/media.ts`:
```ts
uploadImage(file: File, bucket: 'post-images' | 'video-thumbnails'): Promise<{ url: string, width: number, height: number }>
```
This is the one file to change if storage ever moves off Supabase (e.g. to Cloudflare R2) — nothing else in the app should know where files physically live.

## 6. Google Drive video handling
- User pastes a Drive share link (must be set to "anyone with the link" — manual step on their end, out of scope for the app to manage).
- `parseDriveLink()` extracts the file ID via regex (`/file/d/([a-zA-Z0-9_-]+)/`) and returns an iframe-embeddable URL: `https://drive.google.com/file/d/{id}/preview`.
- The Post's visible thumbnail is always the **manually uploaded image**, not anything derived from Drive — Drive doesn't expose a public thumbnail without OAuth, so don't try to fetch one.
- Thumbnail render: uploaded image with a centered play-button icon overlay and a small "Video" badge (top-left corner, see UI_KIT.md). Clicking it opens the Post detail with the embedded Drive iframe; a secondary "Open in Drive" link/icon uses the raw pasted URL.
- If the parse fails (not a recognizable Drive link), store the raw URL anyway and just show "Open link" instead of an embed — don't block saving the Post.

## 7. Reordering & grouping
- `position` is a float/integer column on `boards`, `projects`, and `posts`. On drag-drop, recompute the moved row's position as the midpoint between its new neighbors (avoids rewriting every row on every reorder). Periodically (or on save) renormalize to clean integers if gaps get too small.
- Grouping: select mode in the Project/Board view lets the user multi-select Posts, then assign a `group_key` (uuid) + `group_color` (from the fixed palette in UI_KIT.md) to each selected Post. Ungroup = clear both fields. No separate `groups` table needed for MVP — add one later only if named/reusable groups are wanted.

## 8. Data fetching
- Server Components fetch directly via the Supabase server client for initial page loads (fast, no client-side waterfall).
- Mutations (create/update/delete/reorder) via Next.js Server Actions calling Supabase — keeps API keys server-side, no separate REST/API route layer needed for a single-user app.

## 9. Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   -- server actions only, never exposed to client
```

## 10. Search
- Postgres full-text search (`tsvector`) on `prompt_parts.body_text` (and `prompts.title`), exposed via a single search input on the Dashboard. No external search service needed at this scale.
