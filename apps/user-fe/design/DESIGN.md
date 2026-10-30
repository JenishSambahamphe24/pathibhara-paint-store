# Pathibhara Paints — customer site (user-fe) design spec

Direction: **Bazaar Signboard** (approved, step 1 of 8).
Canvas (source of truth for visuals): https://claude.ai/artifact/NfGiyyEmMHGe5EQcXRdE59
Full brief: `design/user-fe-design-brief.md`. Canvas source in the repo: `design/canvas/` (see its README).

## The idea

Hand-painted shop signs of Asan and Indra Chowk give the site its voice: bold condensed letters, enamel red and blue, a yellow pinstripe frame, Nepali beside English. Underneath, the tools sit on plain lime-wash white so paint colours read true.

1. **Signboards frame, paint fills.** Red, blue and yellow appear only on signboards (header, section titles, notices, share images). Swatches, the 3D house, the calculator and forms sit on neutral ground.
2. **Bilingual like the bazaar.** The wordmark carries पाथीभरा पेन्ट्स above “Pathibhara Paints”. All other site copy is English only.
3. **Numbers painted big.** Totals, litres and sq ft use the display face, so an estimate reads like a price board.

## Tokens

Defined in `src/styles/tokens.css` as a Tailwind v4 `@theme`, with dark overrides in the same file.

| Token     | Light “Lime wash” | Dark “Night bazaar” | Tailwind             | Use                                |
| --------- | ----------------- | ------------------- | -------------------- | ---------------------------------- |
| bg        | #F5F1E8           | #15130F             | `bg-bg`              | page                               |
| surface   | #FFFDF8           | #1F1C17             | `bg-surface`         | cards, sheets                      |
| surface-2 | #ECE5D6           | #2A2620             | `bg-surface-2`       | stages, image plinths              |
| line      | #D8D0BF           | #3D382F             | `border-line`        | dividers, inputs                   |
| ink       | #1E1B16           | #F5EEDC             | `text-ink`, `bg-ink` | text, primary button               |
| muted     | #5E574B           | #ADA593             | `text-muted`         | secondary text                     |
| accent    | #1E3A7B           | #9EB4F2             | `accent`             | focus ring, links, selected part   |
| brand     | #A3192B           | #E8606F             | `text-brand`         | red text on page ground (eyebrows) |
| success   | #1D6B3F           | #6FD39A             | `bg-success`         | WhatsApp, in stock                 |
| warning   | #8A5300           | #F0B65A             | `text-warning`       | “Ask store”                        |
| danger    | #B3261E           | #F59088             | `text-danger`        | errors, always with icon + message |

Fixed sign colours (identical in both themes): `sign-red` #A3192B, `sign-blue` #1E3A7B, `pinstripe` #F2C230, `sign-cream` #FBF4E4.
**Paint colours never change with the theme.** Put paint hex in inline `style`, never in a themed class. Every swatch gets the neutral frame (`Swatch` component).

Theme: follow `prefers-color-scheme`; toggle in the header sets `<html data-theme="light|dark">` and saves it to localStorage (wrap in try/catch).

## Typography

| Role            | Font                        | Size / leading  | Notes                                |
| --------------- | --------------------------- | --------------- | ------------------------------------ |
| Display H1      | Teko 600, uppercase         | 56/48 mobile 58 | line-height 0.82–0.9                 |
| H2 / sign title | Teko 600, uppercase         | 34–40           |                                      |
| H3              | Teko 600, uppercase         | 28/26           |                                      |
| Button          | Teko 600, uppercase, 0.04em | 22              | add ~3px top padding (Teko sits low) |
| Big figures     | Teko 500, tabular-nums      | ≥ 22            | Rs. totals, litres, sq ft            |
| Body            | Mukta 400–500               | 16/24           |                                      |
| Small / labels  | Mukta 600                   | 13–14           | shade codes, captions                |

Teko is **never below 22px**. Shade codes and small numbers use Mukta 600.

## Components (`src/components/<Name>/<Name>.tsx`)

- **SignBoard** `variant="header|section|notice"` — 6px plate, 2px pinstripe frame, 3px inner radius. Kicker (Mukta 12 bold caps, tracking .16em) + Teko title.
- **Wordmark** — bilingual red plate; used in the header.
- **ShadeChip** — colour block, code + name below. Selected: 2px ink border + 2px ink outline offset 2 + check badge + “On”. Strip size (`sm`, 56px wide) lifts 6px when selected.
- **Swatch** — framed small swatch for part tabs, lists, estimates.
- **CanIcon / CanBreakdown** — 2D cans, height follows volume, band shows the paint. Tins for 0.5/1/4 L, pails for 10/20 L. No 3D cans anywhere.
- **Buttons** — primary: `bg-ink text-on-ink`; secondary: 2px ink border; WhatsApp: `bg-success` with chat icon; icon buttons 44×44 with `aria-label`. Radius 6px. Min height 44px (48–52px for main actions).
- **Inputs** — 48px high, radius 10px, label above (Mukta 14 600), unit suffix (ft) inside the field, error = danger border + icon + message below.
- **Part tabs** (visualizer) — 4 tabs in a row, each with current Swatch; active = 2px accent border.
- **Colour-set card** — 4 swatches + name; selected = double ink ring.

## Layout rules

- Mobile first (360px), then 768 and 1280+. Check 320px and landscape.
- Header: red Wordmark plate full width on mobile, theme toggle + menu as 44px icon buttons in sign-cream.
- Sticky contact bar on mobile: Call | WhatsApp (wider, green) | Map. It must never cover inputs or the visualizer bottom sheet.
- Visualizer mobile: house stage ≈ 55–60% height, bottom sheet with part tabs → shade strip → actions; note “Screen colours are close, not exact…”.
- Product imagery: lifestyle shots full-bleed (4:3 or 1:1); cut-out cans on `surface-2` plinth with a soft contact shadow; no image → can glyph + category on `surface-2`.
- Money: always `CurrencyHelper.formatNpr(paisa)` (`src/lib/helpers/currency.helper.ts`) → `Rs. 1,25,000`; price per litre with `CurrencyHelper.formatPerLitre`.

## Don’t

- No gradients, glassmorphism, blobs, emoji icons, testimonial carousels.
- No signboard colour behind swatches, the house or form fields.
- No Devanagari in body copy (wordmark only).
- No hover-only actions; no colour-only state.

## Photo candidates (Unsplash — review before use, credit in build)

- Home hero: aerial Kathmandu, Sajan Rajbahak — https://unsplash.com/photos/aerial-view-of-city-during-daytime-1Q4HgoSRgtg
- Exterior banner: Arjun Ramtel — https://unsplash.com/photos/white-and-brown-concrete-building-wfbIVRtaswk
- Painting in progress: Ali Mkumbwa — https://unsplash.com/photos/a-man-painting-a-wall-with-yellow-paint-1iho4gvI4-g
- Monsoon guide: Sushanta Rokka — https://unsplash.com/photos/person-walking-in-the-rain-with-a-blue-tarp-HIfCogWW_m8
- Visit page: Sushanta Rokka — https://unsplash.com/photos/cityscape-nestled-in-rolling-green-hills-under-cloudy-sky-Uot44-Epzz0
- Interior guides: Quilia — https://unsplash.com/photos/man-and-woman-painting-wall-d6YyP28-Ycw

## Open items

- City, address, hours, phone: placeholders `[CITY]` etc.
- Error red vs brand red: kept both for now (errors always carry an icon).
- Stock status display: to confirm.
- Remaining steps: 2 Home · 3 Visualizer · 4 Calculator · 5 Catalog · 6 Blog · 7 Visit/contact · 8 States.
