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

## 8. Navigation (Pinterest pattern)
- **Top nav bar**, present on every page: logo/Home (goes to the flattened Dashboard), a persistent search bar, a **"Boards"** link, and a **"Create"** button (dropdown: "New Board" / "New Post").
- **Boards page** (`/boards`): a grid of every Board as a tile (cover image, title, item count), mirroring Pinterest's own boards grid. The **first tile is always a dashed "Create board" tile** — same pattern Pinterest uses — so creating a board never requires leaving the grid.
- Clicking a Board tile opens that Board's detail view (its own flattened Projects + standalone Posts).
- This makes the Dashboard the "everything" view and `/boards` the organizational entry point — matches how Pinterest separates your home feed from your profile's boards tab.

## 9. Post ↔ Project relationship (many-to-many)
- A Post belongs to exactly **one Board** (fixed at creation) but can be added to **zero or more Projects within that same Board** — the same way a Pinterest Pin can be saved to multiple boards.
- **Visibility rule:** a Post that belongs to at least one Project is **not** shown as a separate standalone tile at the Board level or the top-level Dashboard — it's only reachable inside its Project(s). A Post with zero Project memberships shows as a standalone tile, same as today.
- This keeps the "Projects are folders, standalone posts are individual" separation clean: nothing appears twice at the Board-flattened level, and a Post genuinely can live in more than one Project (e.g. a shared reference shot used across two client jobs) without duplication.
- **Adding an existing Post to a Project:** inside a Project, an "+ Add existing post" action opens a picker of that Board's Posts not already in this Project, with search/filter. Selecting one adds it via the join table — the original Post row is untouched, so removing it from the Project later doesn't delete it, just un-links it (and it reappears as standalone if it's no longer in any Project).

## 10. Empty, loading, and error states (Pinterest pattern)
- **Empty Board/Project:** centered icon + short message ("Nothing here yet") + a primary "Create post" button — no blank white space.
- **Search with no results:** centered message ("No results for '...'") with a suggestion to try different terms — no dead end.
- **Image/media uploading:** the new tile appears immediately in the grid as a skeleton card with a subtle shimmer animation, swapping to the real thumbnail the moment upload completes — never a blocking spinner that hides the rest of the grid.
- **Invalid Google Drive link:** inline red helper text under the input the moment it's clearly not a Drive URL; the Post can still be saved (per §"Video handling" in TRD) but the field visibly flags the problem rather than failing silently.

## 11. Auth
- Full auth screens: **Sign up, Log in, Forgot password (reset via email link), Change password (in account settings), and passwordless log in via email OTP** as an alternative to password login.
- **Long-lived sessions:** stay signed in far longer than a typical 30-day default — session persists until explicit logout (see TRD §Auth for the Supabase settings that control this).
- No manually-inserted accounts in the Supabase dashboard — account creation always goes through the Sign up screen.

## 12. Pagination
- **Infinite scroll** everywhere the grid appears (Dashboard, Board view, Boards page, search results) — matches Pinterest's own pattern. New batches load automatically as the user nears the bottom, with skeleton cards while the next batch fetches.