# PRD — Prompt Board (working name)

## 1. Vision
A personal, Pinterest-style visual library for AI-generated content and the prompts that made them. The user (an AI content creator) needs one place to browse everything they've made, find the exact prompt that produced a specific result, and reuse it for a new subject/client without hunting through chat history, notes apps, or folders.

## 2. Problem
Prompts used to generate images/videos currently live nowhere durable. There's no way to browse past work visually and instantly retrieve the exact prompt (or the exact multi-part prompt, e.g. positive/negative, style/camera notes) that produced it.

## 3. Target user
Single user (the creator) initially. Personal tool, not a public product — but built with auth + RLS from day one so it's safe to deploy publicly on Vercel and could support more users later without a rebuild.

## 4. Core concepts

| Concept | Definition |
|---|---|
| **Board** | Top-level collection, e.g. "Product Ads," "Anime Portraits." Contains Projects and/or standalone Posts. |
| **Project** | A folder inside a Board. Purely organizational — holds multiple related Posts (e.g. all variants of one client job). No media/prompt of its own. One level deep only, no nested projects. |
| **Post** | The atomic unit. One image OR one Google Drive video link OR just text — always paired with a Prompt. Lives directly in a Board, or inside a Project. |
| **Prompt** | Belongs to one Post. Has an optional title, and is made of one or more **Prompt Parts**. |
| **Prompt Part** | `{ subheading, body_text }`. Rendered as its own card with its own copy button. A prompt with 1 part is a single box; a prompt with 2+ parts (positive/negative, style/camera, etc.) renders as multiple boxes automatically — no separate "is this split" flag needed, it's just `parts.length`. |
| **Group** | A tag shared by 2+ Posts within the same Project (or same Board-level list) that gives them a shared background/border color, Kanban-style. Purely visual grouping, not a data hierarchy. |

## 5. Feature list

### MVP (build first)
- Auth (single user login, email/password via Supabase)
- Create/edit/delete/reorder Boards
- Create/edit/delete/reorder Projects within a Board
- Create/edit/delete/reorder Posts within a Board or Project
- Post types: image upload, Google Drive video link (+ manually uploaded thumbnail image), text-only
- Prompt editor: add/remove/reorder Prompt Parts, each with subheading + body text
- Copy-to-clipboard button per Prompt Part
- Group 2+ Posts within the same Project/Board list, assign a shared highlight color
- Top-level Dashboard grid: shows Project folder tiles (thumbnail = first Post's image, with a badge/border indicating "multiple items") + standalone Post tiles, in Pinterest-style masonry
- Board detail view: same masonry pattern, scoped to one Board
- Project detail view: ordered list/grid of its Posts, with grouping visible
- Drag-to-reorder at every level (Boards, Projects, Posts)
- Search across prompt text

### Later / not MVP
- Dark mode toggle
- Tags/filters beyond Boards (e.g. cross-board tags)
- Multi-user support
- Public/shareable board links
- Bulk import

## 6. Key user flows

**Add a new post with a split prompt:**
1. Open a Board or Project → "New Post"
2. Choose type: Image / Video (Drive link) / Text-only
3. If Image: upload file. If Video: paste Drive share link + upload a thumbnail image manually. If Text-only: skip media.
4. Add prompt: enter title (optional), add first Prompt Part (subheading + text), click "+ Add Part" for more (e.g. "Positive" / "Negative")
5. Save — Post appears in the grid immediately

**Reuse a prompt for a new client:**
1. Browse Dashboard or search
2. Open Post → copy the relevant Prompt Part(s) via the copy button
3. Paste into generation tool, tweak, done

**Group related posts:**
1. Inside a Project, select 2+ Posts
2. Click "Group" → pick a highlight color from the defined palette
3. Posts now render with a shared colored wrapper/background in that Project's view

## 7. Non-goals
- Not building a general-purpose whiteboard/canvas tool (no freeform positioning)
- Not hosting video files — video is always an external Google Drive link
- Not a public prompt-sharing gallery (private, personal tool)
