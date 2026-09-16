# Database Architecture — Prompt Board (Supabase / Postgres)

## 1. Entity relationship overview
```
users (Supabase auth.users)
  └── boards
        └── projects
              └── posts
        └── posts (project_id NULL = lives directly on the board)
                └── prompts (1:1 with post)
                      └── prompt_parts (1:many, ordered)
```

## 2. Tables

### boards
```sql
create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover_url text,               -- optional manual cover; falls back to first project/post thumb in UI
  position float not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index boards_user_id_idx on boards(user_id);
```

### projects
```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  position float not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_board_id_idx on projects(board_id);
```

### posts
```sql
create type media_type as enum ('image', 'video_link', 'none');

create table posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,   -- NULL = standalone post directly on the board
  user_id uuid not null references auth.users(id) on delete cascade,

  media_type media_type not null default 'none',
  image_url text,                 -- uploaded image (only when media_type = 'image')
  image_width int,
  image_height int,

  video_url text,                 -- raw pasted Google Drive link (media_type = 'video_link')
  video_thumbnail_url text,       -- manually uploaded thumbnail for the video

  group_key uuid,                 -- shared across grouped posts within the same project/board list; NULL = ungrouped
  group_color text,               -- hex from the fixed palette in UI_KIT.md

  position float not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_media check (
    (media_type = 'image' and image_url is not null) or
    (media_type = 'video_link' and video_url is not null) or
    (media_type = 'none')
  )
);
create index posts_board_id_idx on posts(board_id);
create index posts_project_id_idx on posts(project_id);
create index posts_group_key_idx on posts(group_key);
```

### prompts
```sql
create table prompts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references posts(id) on delete cascade,  -- 1:1 with post
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### prompt_parts
```sql
create table prompt_parts (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  subheading text,                -- e.g. "Positive", "Negative", "Camera notes"; nullable for a single-part prompt
  body_text text not null,
  position float not null default 0,
  created_at timestamptz not null default now()
);
create index prompt_parts_prompt_id_idx on prompt_parts(prompt_id);

-- full-text search
alter table prompt_parts add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(body_text, ''))) stored;
create index prompt_parts_search_idx on prompt_parts using gin(search_vector);
```

## 3. Row Level Security
Enable RLS on every table; policy pattern is identical across all of them (shown once, repeat per table):
```sql
alter table boards enable row level security;

create policy "select own" on boards for select using (auth.uid() = user_id);
create policy "insert own" on boards for insert with check (auth.uid() = user_id);
create policy "update own" on boards for update using (auth.uid() = user_id);
create policy "delete own" on boards for delete using (auth.uid() = user_id);
```
Repeat verbatim (swap table name) for `projects`, `posts`, `prompts`, `prompt_parts`. For `prompts` and `prompt_parts`, since they don't have a direct `user_id`-friendly single-hop in every case, keep the `user_id` column on both (denormalized, written at insert time from the parent post) so the same simple policy pattern works everywhere — avoids nested subquery policies, which are slower and harder to debug.

## 4. Storage buckets
```
post-images        -- uploaded images for image-type posts
video-thumbnails    -- manually uploaded thumbnails for video-link posts
```
Both private buckets with RLS-equivalent storage policies scoped to the authenticated user's own folder path (e.g. `post-images/{user_id}/{post_id}.jpg`), served via signed URLs or, since this is single-user, can be simplified to public-read buckets if convenient — no sensitive data risk, just personal reference images.

## 5. Notes on `position` (float)
Using `float` instead of `int` for `position` lets reordering compute a new item's position as the midpoint between its neighbors (e.g. moving between position 1.0 and 2.0 → new value 1.5) without ever needing to rewrite other rows. Renormalize to clean integers periodically via a scheduled or on-demand cleanup if values get too granular.
