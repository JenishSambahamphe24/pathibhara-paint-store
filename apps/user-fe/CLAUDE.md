# Customer site (user-fe): Claude Guidelines

Server-rendered customer site built with **TanStack Start**, **React 19**, **Tailwind CSS v4** and **Nitro**. It must stay SEO friendly (root `CLAUDE.md`, SEO section). Structure, export style and import rules follow `apps/admin-fe/.claude/structure.md` and `conventions.md`, apart from the Ark UI and i18n parts.

## Site layout

- `src/layouts/SiteLayout.tsx` wraps every page: header, footer and the mobile contact bar (`src/features/siteShell/`). Pages render only their own content.
- Every route sets its `<head>` with `SeoHelper.page({ title, description, path })`. Pages not built yet use `PagePlaceholder` and `noIndex: true`; drop the flag when the real page lands.
- Store contact details live in `Config.store` (placeholders until the client confirms). Build tel/WhatsApp/map links with `ContactHelper`, never by hand.
- Theme: `ThemeHelper.initScript` sets `<html data-theme>` before paint; use the `dark:` variant for theme-dependent markup, never React state, so SSR can't mismatch.
- Env: copy `.env.example` to `.env` (`VITE_SITE_URL`, `VITE_API_BASE_URL`).
- A route with `staticData: { fullScreen: true }` gets no header, footer or contact bar; it draws its own (the visualizer). `hideContactBar: true` drops only the contact bar, for a page with its own bottom bar (the calculator's running total).
- Fixed bottom bars hide while a field is focused (`useIsTyping`), so they never sit over the phone keyboard.
- `wide:` (tablet and up, or a phone in landscape) switches tools from a bottom sheet to a side panel. JS that must know the same thing uses `useIsWide`.

## 3D house

- The model is `public/models/house.glb`, a copy of `apps/admin-fe/public/models/house.glb`; replace both together. Its paintable materials are named after `VISUALIZER_COMPONENTS`.
- three.js loads only through the lazy `HouseScene` (`features/visualizer/components/HouseStage.tsx`): the picture (`public/images/house-still.webp`) shows first, and the drawing (`HouseIllustration`) replaces 3D when WebGL or the model fails.
- No tone mapping, and the lights are tuned so a lit wall renders within a few percent of the shade's hex. Re-check that if you change the lights.

## Data and URLs

- Data comes from the API's `/public/*` routes through `ApiClient` (`src/lib/api.ts`), with one `<Feature>Api` class per feature (`features/<feature>/api.ts`). Load page data in the route `loader` so it is in the server-rendered HTML.
- Slugged pages load through `SlugRedirectHelper.loadBySlug(type, slug, load)`: an old slug gets a 301 to the current one, otherwise a 404.
- Record URLs come only from `SiteUrlHelper.entityPath(kind, slug)`: `/categories/`, `/products/`, `/guides/`, `/colour-sets/`. Changing a prefix needs a redirect from the old one.
- `sitemap.xml` lists only what's in `features/seo/indexing.ts`. When a page's real design ships, add it there and drop `noIndex` from its route in the same change.

## Design

Before building or changing any UI, read `design/DESIGN.md`.

- **Source of truth** is the live Claude Design canvas: https://claude.ai/artifact/NfGiyyEmMHGe5EQcXRdE59. `design/canvas/` is a mirror of it. Before building a screen, run `/sync-design` so the mirror is current, then read the matching `.dc.html` and build it from the tokens and components below. Don't ask the user to describe a screen that's on the canvas.
- **Colours, fonts and radii** come from `src/styles/tokens.css` (`bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-sign-red`, `font-display`, `font-body`, `rounded-card` …). Never hard-code a UI colour.
- **Paint colours** come from the API and go in inline `style`; they never change with the theme.
- **Design components** are in `src/components/`: `SignBoard`, `Wordmark`, `ShadeChip`, `Swatch`, `CanIcon`, `CanBreakdown`. Reuse them; don't re-create them.
- **Money** is shown with `CurrencyHelper.formatNpr(paisa)` (`Rs. 1,25,000`). Volumes are in ml; label them with `VolumeHelper.label`.
- **Language:** the only Devanagari on the site is the logo (`Wordmark`). All copy is English.
- **Images:** product images used on the canvas are in `design/assets/`. They are references; real product images come from the API.
