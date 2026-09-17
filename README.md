# Cueboard

A Pinterest-style visual library for organizing AI-generated images, videos, and the multi-part prompts that created them. Built with Next.js 16, Supabase, and Tailwind CSS.

## Features

- **Boards & Projects** — Organize AI creations into thematic collections and sub-projects
- **Multi-Part Prompts** — Store positive/negative prompts, camera settings, LoRA weights, and more as structured prompt parts with one-click copy
- **Pinterest-Style Masonry Grid** — Visual browsing with infinite scroll, skeleton loading, and smooth animations
- **Full-Screen Post Detail** — 60/40 media + prompt panel layout with quick copy actions
- **Google Drive Video Links** — Link video content with manually-uploaded thumbnails
- **Post Grouping** — Visually group related posts with color-coded clusters
- **Many-to-Many Projects** — Add the same post to multiple projects without duplication
- **Full Auth Suite** — Email/password login, OTP passwordless login, forgot/reset password, account settings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (Postgres + RLS + Storage)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **Drag & Drop**: @dnd-kit

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Run the migration files in `supabase/migrations/` against your Supabase project, or connect your GitHub repo to Supabase for automatic schema deployment.

## License

Private project.
