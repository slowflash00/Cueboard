-- Migration: 20260917000001_initial_schema.sql
-- Prompt Board Initial Schema

-- 1. Create custom types
do $$ begin
  create type media_type as enum ('image', 'video_link', 'none');
exception
  when duplicate_object then null;
end $$;

-- 2. Boards Table
create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover_url text,
  position float not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists boards_user_id_idx on boards(user_id);

-- 3. Projects Table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  position float not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_board_id_idx on projects(board_id);
create index if not exists projects_user_id_idx on projects(user_id);

-- 4. Posts Table
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  media_type media_type not null default 'none',
  image_url text,
  image_width int,
  image_height int,

  video_url text,
  video_thumbnail_url text,

  group_key uuid,
  group_color text,

  position float not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_media check (
    (media_type = 'image' and image_url is not null) or
    (media_type = 'video_link' and video_url is not null) or
    (media_type = 'none')
  )
);
create index if not exists posts_board_id_idx on posts(board_id);
create index if not exists posts_project_id_idx on posts(project_id);
create index if not exists posts_user_id_idx on posts(user_id);
create index if not exists posts_group_key_idx on posts(group_key);

-- 5. Prompts Table (1:1 with post)
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists prompts_post_id_idx on prompts(post_id);
create index if not exists prompts_user_id_idx on prompts(user_id);

-- 6. Prompt Parts Table (1:many with prompt)
create table if not exists prompt_parts (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subheading text,
  body_text text not null,
  position float not null default 0,
  created_at timestamptz not null default now(),
  search_vector tsvector generated always as (to_tsvector('english', coalesce(body_text, ''))) stored
);
create index if not exists prompt_parts_prompt_id_idx on prompt_parts(prompt_id);
create index if not exists prompt_parts_user_id_idx on prompt_parts(user_id);
create index if not exists prompt_parts_search_idx on prompt_parts using gin(search_vector);

-- 7. Row Level Security Policies
alter table boards enable row level security;
alter table projects enable row level security;
alter table posts enable row level security;
alter table prompts enable row level security;
alter table prompt_parts enable row level security;

-- Boards RLS
do $$ begin
  create policy "select own boards" on boards for select using (auth.uid() = user_id);
  create policy "insert own boards" on boards for insert with check (auth.uid() = user_id);
  create policy "update own boards" on boards for update using (auth.uid() = user_id);
  create policy "delete own boards" on boards for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Projects RLS
do $$ begin
  create policy "select own projects" on projects for select using (auth.uid() = user_id);
  create policy "insert own projects" on projects for insert with check (auth.uid() = user_id);
  create policy "update own projects" on projects for update using (auth.uid() = user_id);
  create policy "delete own projects" on projects for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Posts RLS
do $$ begin
  create policy "select own posts" on posts for select using (auth.uid() = user_id);
  create policy "insert own posts" on posts for insert with check (auth.uid() = user_id);
  create policy "update own posts" on posts for update using (auth.uid() = user_id);
  create policy "delete own posts" on posts for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Prompts RLS
do $$ begin
  create policy "select own prompts" on prompts for select using (auth.uid() = user_id);
  create policy "insert own prompts" on prompts for insert with check (auth.uid() = user_id);
  create policy "update own prompts" on prompts for update using (auth.uid() = user_id);
  create policy "delete own prompts" on prompts for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Prompt Parts RLS
do $$ begin
  create policy "select own prompt_parts" on prompt_parts for select using (auth.uid() = user_id);
  create policy "insert own prompt_parts" on prompt_parts for insert with check (auth.uid() = user_id);
  create policy "update own prompt_parts" on prompt_parts for update using (auth.uid() = user_id);
  create policy "delete own prompt_parts" on prompt_parts for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- 8. Storage buckets setup
insert into storage.buckets (id, name, public)
values
  ('post-images', 'post-images', true),
  ('video-thumbnails', 'video-thumbnails', true)
on conflict (id) do update set public = true;

-- Storage policies
do $$ begin
  create policy "Public Access to post images" on storage.objects for select using (bucket_id in ('post-images', 'video-thumbnails'));
  create policy "Authenticated users can upload post media" on storage.objects for insert with check (
    bucket_id in ('post-images', 'video-thumbnails') and auth.role() = 'authenticated'
  );
  create policy "Authenticated users can update own media" on storage.objects for update using (
    bucket_id in ('post-images', 'video-thumbnails') and auth.uid() = owner
  );
  create policy "Authenticated users can delete own media" on storage.objects for delete using (
    bucket_id in ('post-images', 'video-thumbnails') and auth.uid() = owner
  );
exception when duplicate_object then null; end $$;
