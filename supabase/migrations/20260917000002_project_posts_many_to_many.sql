-- Migration: 20260917000002_project_posts_many_to_many.sql
-- Post <-> Project many-to-many relationship

-- 1. Create project_posts table
create table if not exists project_posts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position float not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, post_id)
);

create index if not exists project_posts_project_id_idx on project_posts(project_id);
create index if not exists project_posts_post_id_idx on project_posts(post_id);
create index if not exists project_posts_user_id_idx on project_posts(user_id);

-- 2. Row Level Security Policies
alter table project_posts enable row level security;

do $$ begin
  create policy "select own project_posts" on project_posts for select using (auth.uid() = user_id);
  create policy "insert own project_posts" on project_posts for insert with check (auth.uid() = user_id);
  create policy "update own project_posts" on project_posts for update using (auth.uid() = user_id);
  create policy "delete own project_posts" on project_posts for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- 3. Safely drop project_id column from posts if it exists
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'posts' and column_name = 'project_id'
  ) then
    alter table posts drop column project_id;
  end if;
end $$;
