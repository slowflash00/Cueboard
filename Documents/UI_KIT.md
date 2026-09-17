# UI Kit — Prompt Board
Theme: **Pinterest-style light grid**. References: pinterest.com (layout, card, and interaction patterns).

## 1. Design philosophy
- Content is the hero. UI chrome stays minimal, quiet, and out of the way of images/videos.
- Whitespace and card separation, not borders — cards float on the background, distinguished by shadow-on-hover, not outlines.
- One accent color, used sparingly and only for meaningful actions/states — never decoratively.
- Every visual pattern should generalize: a Post with 1 prompt part looks like a Post with 3 prompt parts, just taller.

## 2. Color tokens
```css
:root {
  /* Neutrals */
  --bg-page: #FFFFFF;
  --bg-subtle: #F5F5F5;        /* grid background, input fields */
  --bg-card: #FFFFFF;
  --text-primary: #211922;
  --text-secondary: #5F5F5F;
  --border-subtle: #E9E9E9;    /* only for inputs/dividers, never on cards at rest */

  /* Accent (Pinterest red) */
  --accent: #E60023;
  --accent-hover: #AD081B;
  --accent-subtle-bg: #FDECEA; /* light red tint, e.g. active nav item background */

  /* Group highlight palette — fixed set, never red (reserved for accent) */
  --group-blue: #E8F0FE;
  --group-green: #E6F4EA;
  --group-yellow: #FEF7E0;
  --group-purple: #F3E8FD;
  --group-peach: #FDEEE4;
  --group-teal: #E0F7F5;

  /* Feedback */
  --success: #0F9D58;   /* copy-confirmed state */
}
```
Rule: the group-color picker only ever offers the 6 `--group-*` tokens above. Never let a group use `--accent` — that would make grouped posts visually compete with primary buttons/active states.

## 3. Typography
- Font: **Inter** (free, close to Pinterest's own geometric sans; load via `next/font/google`).
- Scale:
  - Page title: 28px / 700
  - Board/Project title: 20px / 600
  - Post title / prompt title: 16px / 600
  - Prompt part subheading: 13px / 600, uppercase, `--text-secondary`
  - Body text (prompt content): 14px / 400, `--text-primary`, line-height 1.5
  - Meta text (dates, counts): 12px / 400, `--text-secondary`

## 4. Spacing & radius
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48 — no arbitrary values outside this scale.
- Radius:
  - Cards (Post, Project tile): **16px**
  - Buttons, search bar, inputs: pill / **9999px** for primary actions, **8px** for secondary/inline buttons
  - Prompt part card: **12px**
  - Badges (e.g. "Video" tag): **6px**

## 5. Core components

### MasonryGrid
- CSS `columns` layout, responsive column count (2 on mobile, 3–5 on desktop based on viewport).
- Gap: 16px.
- Every tile inside pre-sizes via stored `image_width`/`image_height` aspect ratio — no layout shift.

### ProjectTile (folder — contains multiple posts)
- Thumbnail = first Post's image (or video thumbnail).
- Distinguishing marks from a plain Post tile:
  - Small stacked-card icon badge, top-right corner (indicates "multiple items")
  - Post count label, e.g. "12 posts", bottom-left overlay on hover
  - Slightly thicker corner radius shadow on hover vs a regular Post tile (subtle, not a heavy border)
- Click → opens Project detail view.

### PostCard (image type)
- Full-bleed image, 16px radius, no border at rest.
- On hover: soft shadow lift (`box-shadow: 0 8px 20px rgba(0,0,0,0.08)`), overlay gradient at the bottom with quick actions (copy prompt icon, more-options icon) fading in.
- If part of a group: card background/wrapper tinted with the assigned `--group-*` color, applied as a padding-wrapped container around all grouped cards so they read as one cluster (like a Kanban swimlane), not per-card fills that fight the image.

### PostCard (video_link type)
- Uploaded thumbnail image as the base.
- Centered play-button icon overlay (white circle, 48px, subtle shadow) — lucide-react `Play` icon.
- Top-left badge: small pill, `--text-primary` on `--bg-subtle`, label "Video".
- Click → Post detail view with embedded Drive iframe; a small "Open in Drive" icon (lucide `ExternalLink`) links out using the raw URL.

### PostCard (text-only type)
- No image area. Card shows the prompt title + a truncated preview of the first prompt part's body text, on a `--bg-subtle` card background (since there's no image to carry it).
- Small badge top-left: "Text" pill, same style as the Video badge.

### PromptPartCard
- One card per Prompt Part, stacked vertically within the Post detail view.
- Header row: subheading (uppercase, `--text-secondary`) on the left, copy icon button on the right.
- Body: the prompt text, `--bg-subtle` background, 12px radius, 12–16px padding.
- Copy button: on click, icon briefly swaps to a checkmark in `--success` color for ~1.5s, then reverts — standard copy-confirmation pattern, no toast needed for such a small action.

### GroupWrapper
- Wraps 2+ PostCards in a Project/Board list view.
- Rounded container (16px radius) in the assigned `--group-*` background, padding 12px, cards arranged in a row/wrap inside it.
- Optional small label chip top-left of the wrapper if the user named the group (future feature — leave the label prop optional now).

### Buttons
- Primary (Save, Create, Add Part): pill shape, `--accent` background, white text, `--accent-hover` on hover.
- Secondary (Cancel, Ungroup): 8px radius, transparent background, `--border-subtle` border, `--text-primary` text.
- Icon-only buttons (copy, more-options, drag handle): no background at rest, `--bg-subtle` on hover, 8px radius.

### Inputs / search bar
- `--bg-subtle` background, no border at rest, 9999px radius for the search bar specifically, 8px radius for form fields.
- Focus state: 2px `--accent` outline ring.

## 6. Icon set
**lucide-react only** — do not mix in other icon libraries. Core icons used: `Plus`, `Copy`, `Check`, `Play`, `ExternalLink`, `MoreHorizontal`, `GripVertical` (drag handle), `Folder`, `Layers` (group indicator), `Search`, `X`.

## 7. Full-screen Post detail (not a modal)
This is its own route (see TRD §13), using the full viewport — the current basic popup should be replaced entirely:
- **Layout:** large media on the left ~60% of the viewport (image full-bleed or the Drive video iframe at a large fixed aspect ratio), Prompt panel scrolling independently on the right ~40% — stacks vertically on mobile, media first.
- **Close/back:** a circular icon button (`X`, lucide-react), top-left over the media, `--bg-page` background at 90% opacity with a soft shadow so it's legible over any image — same placement pattern Pinterest uses for its own pin close button.
- **Top-right of the panel:** quick actions — copy-all-prompts icon, "Open in Drive" (video posts only), more-options (`MoreHorizontal`).
- Prompt Parts stack in the right panel exactly per the `PromptPartCard` spec in §5 — this is where most of the value of the page lives, so give it real breathing room (24px padding, not cramped).
- Page transition: fade + slight scale-up from the grid card's position using framer-motion's shared-layout animation (`layoutId` matching the grid card) — reinforces that this is "the same card, now expanded," matching Pinterest's own pin-opening motion.

## 8. Navigation & Boards page
- **Top nav bar:** fixed, `--bg-page` background, `--border-subtle` bottom border only (1px, the one exception to "no borders" since it separates persistent chrome, not content cards). Height ~64px. Logo left, search bar centered (pill, `--bg-subtle`), "Boards" link + "Create" button right.
- **"Create" button:** primary pill button, `--accent` background, opens a small dropdown (New Board / New Post) — use a shadcn `DropdownMenu`.
- **Boards grid page:** same `MasonryGrid`-style layout as the Dashboard, but every tile is a `BoardTile` (cover image collage or single cover + title + item count, bottom-left overlay on hover). First tile is a fixed, non-scrolling **dashed-border "Create board" tile** (`--border-subtle` dashed 2px, `Plus` icon centered, `--bg-subtle` background) — always first regardless of sort.

## 9. Empty, loading & error states
- **Empty state (Board/Project/search):** centered column, a simple lucide icon (`Folder` / `Search` / `ImageOff` as fits) at 48px in `--text-secondary`, one line of message text, and where relevant a primary "Create post" pill button below it. No illustration assets needed — keep it icon + type, consistent with the rest of the kit's minimal-chrome philosophy.
- **Skeleton/loading cards:** `--bg-subtle` rounded rectangle (16px radius, matching card radius) with a subtle left-to-right shimmer animation (framer-motion or a CSS `@keyframes` gradient sweep) — used for both "next page loading" (infinite scroll) and "upload in progress."
- **Inline field error (e.g. invalid Drive link):** small text, 12px, a dedicated error red (`#D32F2F` — distinct from `--accent` red so error states never get confused with brand/primary-action red), directly under the field, no icon needed.

## 10. Auth screens
- Centered single-column card, max-width ~400px, on a plain `--bg-page` background (no imagery/split-screen — keep it minimal, consistent with the rest of the kit).
- Inputs and primary button follow §5's standard input/button styles exactly — auth screens should feel like the same product, not a separate styled page.
- OTP screen: 6 individual digit boxes (shadcn has an `InputOTP` primitive) rather than one text field — clearer affordance for a code.
- Toggle link between "Log in with password" / "Log in with a code instead" styled as plain `--accent`-colored text, underline on hover only.

## 11. Motion rules (framer-motion)
- Grid items: fade + slight upward slide (8px) on initial load/page fetch, staggered ~30ms per item so the grid feels alive without being slow.
- Card hover: shadow + 2% scale-up, 150ms ease-out — subtle, never a large "pop."
- Respect `prefers-reduced-motion` — disable stagger/scale, keep only opacity fades, for accessibility.

## 12. Rules to keep the theme consistent
1. `--accent` (red) is reserved for: primary buttons, active nav/tab state, focus rings, save-confirmation. Never used for decorative backgrounds, group colors, or badges.
2. Cards never have a visible border at rest — separation comes from whitespace + hover shadow only.
3. All radii come from the fixed scale in §4 — no one-off radius values.
4. All spacing comes from the 4/8/12/16/24/32/48 scale — no arbitrary padding/margin values.
5. Group colors only from the fixed 6-token palette in §2 — never a custom/arbitrary color per group.
6. Every card type (Post, Project tile) must support a "badge" in the same top-left position — keeps type indicators (Video/Text/multi-item) visually consistent across the whole grid.
7. Icons: lucide-react exclusively, consistent stroke width (default 2px).
8. Font: Inter everywhere, no secondary typeface.