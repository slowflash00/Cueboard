---
name: supabase-workflows
description: Best practices for Supabase database migrations, RLS policies, type generation, and GitHub-connected schema deployment in Next.js apps.
---

# Supabase Workflows & Best Practices

This skill outlines how to maintain and deploy Supabase database schemas and client patterns for Prompt Board.

## 1. Migration Management
- Store all schema definitions in `supabase/migrations/`.
- Name migration files with chronological timestamps: `YYYYMMDDHHMMSS_<description>.sql`.
- Ensure migrations are idempotent (use `IF NOT EXISTS` or standard DDL statements).
- Never mix production database credentials in client code.

## 2. Row Level Security (RLS)
- Every table MUST have Row Level Security enabled:
  ```sql
  alter table <table_name> enable row level security;
  ```
- Scoping policy:
  ```sql
  create policy "select own" on <table_name> for select using (auth.uid() = user_id);
  create policy "insert own" on <table_name> for insert with check (auth.uid() = user_id);
  create policy "update own" on <table_name> for update using (auth.uid() = user_id);
  create policy "delete own" on <table_name> for delete using (auth.uid() = user_id);
  ```

## 3. Client Architecture with `@supabase/ssr`
- **Browser Client (`lib/supabase/client.ts`)**: Used inside `'use client'` components for real-time or client-side operations.
- **Server Client (`lib/supabase/server.ts`)**: Used inside Server Components and Server Actions. Reads and sets session cookies securely.
- **Middleware (`middleware.ts`)**: Refreshes session tokens on every request and protects `/boards`, `/posts`, and dashboard routes.
