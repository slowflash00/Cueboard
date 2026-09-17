# Pinterest Design System & Principles (Gestalt Reference for Cueboard)

This document synthesizes the design language, UI patterns, and structural rules of **Pinterest** (based on Pinterest's official **Gestalt Design System** and web application patterns from `in.pinterest.com`). It serves as the design benchmark for **Cueboard** as we evolve into the premier public/private platform for AI-generated visual art and prompt engineering.

---

## 1. Core Philosophy: "Content is the Hero"

1. **Get Out of the Way of the Artwork:**
   - Chrome, borders, and controls must never compete with visual media.
   - Whitespace and subtle elevation replace heavy container borders.
   - Cards float effortlessly on a clean, warm-neutral canvas (`#FFFFFF` to `#F5F5F5`).

2. **Reserved, Intentional Color:**
   - **Pinterest Red (`#E60023`)** is never used decoratively. It is strictly reserved for high-intent primary actions ("Save", "Publish", "Create"), active navigation state indicators, and focus rings.
   - Text uses a warm dark-plum/charcoal (`#211922`) instead of harsh pure black (`#000000`).
   - Secondary text uses muted gray (`#5F5F5F`).

3. **Consistent Geometry & Radius:**
   - **Cards & Modal Containers:** `16px` radius (`rounded-2xl`).
   - **Primary Action Buttons & Search Bars:** Pill shape (`9999px` / `rounded-full`).
   - **Secondary & Form Field Inputs:** `8px` to `12px` radius.
   - **Badges:** `6px` radius (`rounded-[6px]`).

4. **Typography Hierarchy:**
   - Font: **Inter** (clean geometric sans-serif closely matching Pinterest's *Pin Sans*).
   - Display/Page Titles: 28px–32px, bold (700).
   - Board/Section Headings: 20px, semibold (600).
   - Card Titles: 14px–16px, semibold (600).
   - Prompt Parts & Body: 14px, regular (400), line-height 1.5.
   - Metadata / Subheadings: 12px–13px, uppercase tracking-wide, semibold (600).

---

## 2. Two-Column Pin Builder Pattern (Create Flow)

Pinterest's Pin Builder (`/pin-builder`) provides a focused, high-conversion creation experience:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Create Pin / Post                                  [Save to Board ▼]  [Publish] │
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │ Board & Project Selector           │
│  [Media Upload Dropzone / Preview] │ ────────────────────────────────── │
│                                   │ Title (Prompt Title)               │
│  • Drag & drop image / video link │ ────────────────────────────────── │
│  • Aspect ratio preview (2:3,     │ Multi-Part Prompt Sections:        │
│    1:1, 4:5, 16:9)                │  ┌───────────────────────────────┐ │
│  • Media type tabs (Image/Video)  │  │ [Positive Prompt]             │ │
│                                   │  │ Raw prompt text...            │ │
│                                   │  └───────────────────────────────┘ │
│                                   │  ┌───────────────────────────────┐ │
│                                   │  │ [Negative / Parameters]       │ │
│                                   │  │ Prompt text...                │ │
│                                   │  └───────────────────────────────┘ │
│                                   │  [+ Add Prompt Part]               │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Key Principles of the Two-Column Builder:
1. **Left Column (Visual Center ~45-50%):**
   - High-contrast dropzone with subtle dashed border at rest.
   - Instant live image/video preview with replace and delete actions.
   - Pre-calculates width and height to prevent cumulative layout shift (CLS).
2. **Right Column (Metadata & Prompts ~50-55%):**
   - **Board Selector at the Top:** Prominently displays the target Board with an inline "+ Create new board" option, ensuring posts are never orphaned.
   - **Full-Height Prompt Visibility:** Textareas auto-expand or scroll independently so multi-paragraph generative prompts (positive, negative, lighting, camera settings) are completely visible without cramped inputs.
   - **Section Cards:** Prompt parts are clearly delineated with uppercase category tags (`Positive`, `Negative`, `Style / Camera`, `Parameters`).
3. **Top Action Bar:**
   - Close (`X`) on the far left.
   - Board dropdown + Primary "Save" pill button (`#E60023`) pinned to the top right.

---

## 3. Dynamic Masonry Grid Patterns

1. **CSS Columns & Aspect Ratios:**
   - Multi-column masonry (2 cols on mobile, 3 cols on tablet, 4–6 cols on desktop).
   - 16px uniform gap.
   - Each card uses explicit aspect ratio placeholders to eliminate layout shifts when images load.
2. **Hover Interactions:**
   - Subtle scale-up (`scale-[1.02]`) and soft shadow lift (`box-shadow: 0 8px 20px rgba(0,0,0,0.08)`).
   - Quick-action floating buttons fade in on hover (Quick Copy prompt, Save to Board).
   - Dark gradient overlay on bottom of card for high-contrast title and metadata.
3. **Consistent Top-Left Badges:**
   - Video badge ("Video" + play indicator), Text-only badge ("Text"), and Folder badge ("Project") all share the identical top-left position and visual weight.

---

## 4. Boards, Projects & Organization

1. **Leading "Create Board" Tile:**
   - On the Boards grid, the very first tile is always a dedicated dashed-border "Create board" tile with a plus icon. It never moves regardless of sorting.
2. **Folders (Projects) vs Standalone Pins:**
   - Pins organized into Projects show stacked folder indicators.
   - Standalone pins display directly on the board canvas.
3. **Visual Grouping (Kanban Swimlanes):**
   - Group highlights use a fixed palette of 6 soft pastel background tones (`--group-blue`, `--group-green`, etc.) applied to a shared container wrapper with 16px radius, never jarring per-card fills.

---

## 5. Mobile & Responsive Adaptations

1. **Column Collapsing:**
   - Two-column builders collapse into a clean single column on screens $< 768\text{px}$, with the media preview on top and prompt inputs below.
2. **Touch Targets:**
   - Every clickable target (buttons, copy icons, navigation links, dropdown items) has an accessible touch footprint of at least $40\text{px} \times 40\text{px}$.
3. **Zero Horizontal Overflow:**
   - All containers use `max-w-full` with fluid padding (`px-4 sm:px-6`).
