# Project Standards — Prompt Board

## 1. UI & Design System Guidelines (Strictly Follow UI_KIT.md)
- **Theme**: Pinterest-style light visual grid.
- **Font**: Inter font loaded via `next/font/google`.
- **Accent Color**: `#E60023` (Pinterest Red).
  - Reserved strictly for: Primary buttons, active nav/tab state, focus rings, save confirmation.
  - NEVER use the accent color for cards, decorative backgrounds, group colors, or badges.
- **Group Palette**: Only ever use the 6 designated pastel tokens for post grouping:
  - Blue: `#E8F0FE`
  - Green: `#E6F4EA`
  - Yellow: `#FEF7E0`
  - Purple: `#F3E8FD`
  - Peach: `#FDEEE4`
  - Teal: `#E0F7F5`
- **Copy Success State**: `#0F9D58` (temporary checkmark confirmation for 1.5s).
- **Radius Tokens**:
  - Cards (Post, Project tile): `16px` (`rounded-2xl`)
  - Primary actions & search bar: `9999px` (`rounded-full`)
  - Prompt part cards: `12px` (`rounded-xl`)
  - Badges: `6px` (`rounded-md`)
  - Secondary buttons: `8px` (`rounded-lg`)
- **Spacing Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px only.
- **Card Styling Rule**: Cards NEVER have visible borders at rest. Visual separation is achieved via whitespace and soft hover shadow (`box-shadow: 0 8px 20px rgba(0,0,0,0.08)`).
- **Icons**: Use `lucide-react` exclusively with consistent 2px stroke width.

## 2. Architectural Boundaries
- **Storage Abstraction**: Never call `supabase.storage.from(...)` directly from components. All uploads and storage interactions MUST go through `/lib/media.ts`.
- **Zero Layout Shift (CLS)**: Always compute and store `image_width` and `image_height` during client-side upload so masonry cards have pre-rendered aspect ratios before media loads.
- **Data Fetching**: Prefer Server Components for page data fetching to avoid client waterfalls. Use Server Actions for database mutations.
- **Positioning**: Use float midpoint calculations for drag-and-drop reordering without rewriting neighbor rows.
