# Customer site (user-fe): Claude Guidelines

Server-rendered customer site built with **TanStack Start**, **React 19**, **Tailwind CSS v4** and **Nitro**. It must stay SEO friendly (root `CLAUDE.md`, SEO section). Structure, export style and import rules follow `apps/admin-fe/.claude/structure.md` and `conventions.md`, apart from the Ark UI and i18n parts.

## Design

Before building or changing any UI, read `design/DESIGN.md`.

- **Source of truth** is the live Claude Design canvas: https://claude.ai/artifact/NfGiyyEmMHGe5EQcXRdE59. `design/canvas/` is a mirror of it. Before building a screen, run `/sync-design` so the mirror is current, then read the matching `.dc.html` and build it from the tokens and components below. Don't ask the user to describe a screen that's on the canvas.
- **Colours, fonts and radii** come from `src/styles/tokens.css` (`bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-sign-red`, `font-display`, `font-body`, `rounded-card` …). Never hard-code a UI colour.
- **Paint colours** come from the API and go in inline `style`; they never change with the theme.
- **Design components** are in `src/components/`: `SignBoard`, `Wordmark`, `ShadeChip`, `Swatch`, `CanIcon`, `CanBreakdown`. Reuse them; don't re-create them.
- **Money** is shown with `CurrencyHelper.formatNpr(paisa)` (`Rs. 1,25,000`). Volumes are in ml; label them with `VolumeHelper.label`.
- **Language:** the only Devanagari on the site is the logo (`Wordmark`). All copy is English.
- **Images:** product images used on the canvas are in `design/assets/`. They are references; real product images come from the API.
