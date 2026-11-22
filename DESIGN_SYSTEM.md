# Design System & UI Specifications

## Color Palette & Theming (iOS Minimalist Editorial)

| Token | Hex Value | Role / Usage |
|---|---|---|
| `--color-canvas` | `#FAF8F3` | Warm ivory paper background / canvas |
| `--color-obsidian` | `#08090B` | Deep obsidian midnight black for primary text, dark cards, headers |
| `--color-accent` | `#E05A38` | Warm Terracotta Sunset Ember (refined, human, modern iOS accent) |
| `--color-accent-hover` | `#C94C2D` | Hover state for accent buttons & interactive elements |
| `--color-surface` | `#FFFFFF` | Grouped cards, sheets, elevated surfaces |
| `--color-surface-muted` | `#F3EFE6` | Inset backgrounds, search fields, pills |
| `--color-border` | `#EDE8DE` | Hairline card & section borders |
| `--color-text-muted` | `#757984` | Secondary text, captions, timestamps |

## Typography & Hierarchy (iOS SF Pro Feel)
- Font Family: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif`
- Tracking: `-0.011em` for clean Apple-style legibility
- Section Header: `text-[10px]` or `text-[11px] font-bold uppercase tracking-wider text-[#757984]`
- Item Titles: `text-xs font-bold text-[#08090B]`
- Subtitles & Meta: `text-[10px]` or `text-[11px] text-[#757984]`

## iOS Component Standards
- **Buttons**: Pill-shaped (`rounded-full`), tactile tap response (`active:scale-[0.98]`), bold label tracking.
- **Switches**: True iOS toggle (`h-[24px] w-[42px]`), white knob with soft shadow, active accent color `#E05A38` or `#08090B`.
- **Search Bar**: Continuous squircle container (`rounded-2xl`), subtle inset background `#F3EFE6`.
- **Cards**: Smooth rounded corners (`rounded-[20px]`), hairline border `#EDE8DE`, soft diffused drop shadows.
- **Modals / Sheets**: Centered sheet with `rounded-[24px]`, backdrop blur (`backdrop-blur-md bg-black/40`), clean layout.
- **Dock / Sticky Bar**: Frosted glass (`backdrop-blur-xl bg-[#FAF8F3]/90`), hairline top border.
