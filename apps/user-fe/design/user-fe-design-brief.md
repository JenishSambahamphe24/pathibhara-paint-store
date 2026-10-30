# Design Brief: Paint Store Customer Website (user-fe)

Design the public website for **[STORE NAME]**, a paint and waterproofing store in **[CITY], Nepal**. The backend and admin panel already exist; this brief is for the customer-facing site only.

Read the whole brief before designing. Start with the design direction (section 6) and show it to me before designing full pages.

---

## 1. What this site is (and is not)

This is not a generic business website with a hero slogan, three feature cards and a contact form. It is a **colour and estimating tool for homeowners**, run by a local store.

A visitor should be able to:

1. **See** colour combinations on a house before painting (3D visualizer).
2. **Calculate** exactly how much paint they need and what it will cost (cost calculator).
3. **Browse** the store's products, sizes and prices (catalog).
4. **Learn** from practical guides (blog).
5. **Contact** the store with their chosen colours and estimate (WhatsApp, call, visit).

There is **no online checkout**. The goal of every page is to move the visitor toward contacting or visiting the store with a clear decision already made.

## 2. Who uses it

| User                                     | Context                                               | What they need                                                      |
| ---------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Homeowner building or repainting a house | On a phone, often on mobile data, not a design expert | Confidence in a colour choice and a budget number                   |
| Family members deciding together         | Sharing screenshots on WhatsApp/Viber                 | Easy-to-share visuals and estimates                                 |
| Contractor / painter (thekedar)          | Needs quantities fast                                 | A quick, accurate litres-and-cans calculator                        |
| Store owner (indirectly)                 | Uses the site in-store to show clients                | Visualizer and calculator that work well on a tablet at the counter |

Design **mobile-first** (360 px wide), then tablet and desktop.

## 3. Pages and features

### 3.1 Home

Open with the product, not a slogan: the **3D house itself**, slowly turning, with colour-set swatches the visitor can tap to repaint it instantly. A real photograph can sit behind or around it as a banner background (see 5.2), but the house and swatches stay the focus. Below that, short paths into the three tools (visualizer, calculator, products) and recent blog guides, plus store location, hours and contact.

### 3.2 Exterior colour visualizer

Most visitors will use this on a **phone**, often one-handed and on mobile data. Design it for that first; desktop is the bigger version, not the other way round.

**What it does**

- A 3D house the visitor can **rotate 360° and zoom**. The model already exists (`house.glb`, built for the admin panel): a modern three-storey Nepali RCC house with a carport, framed glass balconies, a wood-clad bay, a roof terrace and a stair cover. Design around it rather than inventing a different house.
- The house has 4 paintable parts: **walls, columns, doors and windows, roof edge**. Flat roof tops always stay off-white, and wood cladding, glass and railings keep their own look.
- The visitor **picks a shade for each part directly** from the store's shades: tap a part, then tap a shade, and the house repaints instantly. Any part left unpicked keeps its original colour.
- The store's **colour sets** are ready-made starting points: one tap fills all 4 parts, and the visitor can then change any single part.
- Every picked shade shows its swatch, shade code and name.
- **Compare** mode: 2–3 looks side by side on tablet and desktop; on mobile, a quick toggle between them.
- **Save / share** the current view as an image. The current combination should also be a shareable link that reopens the same look.
- **"Estimate this look"** button: opens the calculator pre-filled with the products for the picked shades.
- **"Send to store"** button: opens WhatsApp with the shade codes for each part pre-written.
- A short, honest note that screen colours are approximate and the physical shade card is the final check.

**Mobile experience (design this first)**

- **Layout:** the house fills the top of the screen (roughly 55–60% of the height); controls live in a **bottom sheet** below it, within thumb reach. The sheet can be dragged up for more shades and down to see more of the house.
- **Choosing a part:** a row of 4 large tabs or chips (Walls, Columns, Doors & windows, Roof edge), each showing its current swatch. Tapping one highlights that part on the house briefly so the visitor sees what they're about to repaint.
- **Choosing a shade:** a horizontally swipeable **shade-chip strip** (the fan-deck motif), plus search by code or name. Tap targets at least 44 px; the selected chip clearly marked with more than colour alone.
- **Presets:** colour sets as a swipeable row of compact cards, each with its 4 swatches.
- **Gestures:** one finger rotates, two fingers pinch-zoom, and a reset-view button returns to the default angle. Vertical page scrolling must never get trapped by the 3D canvas; a visitor should always be able to scroll past it.
- **Feedback:** repainting is instant (no loading spinner between taps); a subtle transition is fine if it stays smooth on mid-range Android phones.
- **Landscape:** the house goes to one side and the controls to the other.
- **Loading:** show a static image of the house immediately while the 3D model loads, then swap in the 3D view. If WebGL is unavailable or the phone is too slow, the static image plus the swatches is a working fallback, not an error.
- **Motion:** respect reduced-motion settings (no auto-rotate, no animated transitions).

### 3.2.1 Where 3D (three.js) is and isn't used

- **Use three.js** (React Three Fiber in the build) only where 3D adds something: the **visualizer** and the **home hero house**. Both use the same `house.glb`.
- **Don't use 3D** for decoration elsewhere: no 3D icons, spinning cans or background scenes. Cans in the calculator, swatches and chips are 2D (SVG/CSS).
- Load the 3D bundle only on pages that show the house, and only once that part of the page is near the screen.
- Keep it light on phones: cap the render resolution on high-density screens, use simple lighting and soft shadows, and pause rendering when the house is off-screen or the tab is hidden.

### 3.3 Cost calculator

The flagship interactive tool. Make it feel like **building the job**, not filling a form.

**Input:**

- Sections: **Interior** and/or **Exterior**.
- In each section, add surfaces: label, width (ft), height (ft), quantity. Example: 4 walls of 12 × 12 ft, 2 walls of 6 × 5 ft.
- Optional deductions (doors, windows) the same way.
- Choose products per section (e.g. a primer + a paint) and number of coats (pre-filled with the product's recommended coats).

**Design ideas to explore:**

- Each surface appears as a **proportional rectangle** that grows as dimensions are typed, so the visitor sees the walls they're describing.
- A **live running total** of area (sq ft) that updates as they type.
- Quick presets ("Standard 12 × 10 room", "Single-storey exterior") to start faster.

**Output (from the API):**

- Per product: net area, litres needed, **container breakdown**, line cost.
- Show the breakdown **visually as paint cans of different sizes**, e.g. 16 L → one 10 L can, one 4 L can, two 1 L cans. The system always prefers larger cans.
- Per-section subtotal and a grand total in NPR.
- Actions: **share estimate on WhatsApp**, save as image/PDF, "send to store".

### 3.4 Products (catalog)

- Categories are a **dynamic tree** of any depth, managed by the admin. Example: Primer → Exterior Primer → Damp-proof Primer. Navigation must work for 1, 2 or 4 levels without breaking.
- Product page shows: name, category path, description, images, **coverage** (sq ft per litre per coat), recommended coats, and **available sizes with prices** (e.g. 1 L, 4 L, 10 L, 20 L; enamels also 0.5 L).
- Explore a way to make coverage tangible (e.g. "1 litre covers about 35 sq ft, roughly one 6 × 6 ft wall per coat").
- Size selector shows price, and **price per litre** so visitors can see larger cans are better value.
- "Calculate how much I need" button: opens the calculator with this product selected.

### 3.5 Blog

- Editorial, readable layout for practical guides (e.g. waterproofing before monsoon, choosing exterior colours, primer basics).
- Rich content: headings, images, lists.
- Each post can link to related products or tools.

### 3.6 Visit / contact

- Map, address, opening hours, phone, WhatsApp.
- Clear, tappable contact actions on every page (sticky on mobile, but not covering content).

## 4. Data the designs must handle

| Data              | Shape                                                                  | Design implication                                      |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| Categories        | Tree, unlimited depth, admin-created                                   | Navigation must not assume a fixed depth                |
| Products          | Name, category, description, images, coverage per litre, default coats | Some products may have no image; design a good fallback |
| Variants          | Size (0.5 / 1 / 4 / 10 / 20 L), price (NPR)                            | Varies per product; some products lack small sizes      |
| Colour sets       | Name, description, 4 shades (code, name, hex)                          | Swatches must be readable on any shade, light or dark   |
| Calculator result | Litres, can breakdown, costs per product and section                   | Must stay clear with many surfaces and products         |
| Blog posts        | Title, cover image, excerpt, rich content, date                        | Cover image may be missing                              |

Money format: Nepali grouping, e.g. **Rs. 1,25,000** (not 125,000).

## 5. Constraints

- **Mobile-first and lightweight.** Many visitors are on mobile data. Lazy-load the 3D viewer and large images; the rest of the site must feel fast without them.
- **English only.** The site has no Nepali-language version; design for English text only.
- **Accessible.** Readable contrast on every swatch background, tappable targets at least 44 px, keyboard-usable controls, no information conveyed by colour alone (always show shade code and name).
- **Colour honesty.** Swatches are close but not exact; say so once, clearly, without scaring people.
- **Implementation target:** React with Tailwind-style utility CSS. Design components that map cleanly to reusable React components.

### 5.1 Light and dark theme

- Design **both a light and a dark theme** for every screen. Follow the phone's system setting by default, with a visible toggle (e.g. in the header or menu) that remembers the visitor's choice.
- Define the UI colours as named tokens (background, surface, text, muted text, border, accent, success, warning, danger) with a value for each theme, so the build can switch themes without per-component work.
- **Paint colours never change with the theme.** A swatch, chip or the painted house shows the same shade in light and dark mode. Put each swatch on a neutral frame or border so light shades stay visible on a light background and dark shades on a dark one.
- The 3D scene adapts its background and lighting to the theme, but the paint colours on the house stay true.
- Check contrast for text, buttons and focus states in both themes.

### 5.2 Images and assets

- **Banner and background images** (home hero, section banners, blog covers, the visit page): use real photography from **Unsplash** that fits the local context, such as painted houses and facades (South Asian/Nepali where possible), interiors, painting in progress and monsoon damp-proofing.
- Note the Unsplash link and photographer for every image used, so the build can credit them and the store can swap in its own photos later.
- Optimise every image for mobile: modern formats (WebP/AVIF), several sizes for different screens, lazy-loading below the fold, and a solid-colour or blurred placeholder while loading.
- Photos support the page; they never replace the house or the swatches as the main visual.

### 5.3 Responsiveness

- Design and show **three widths**: mobile (360 px), tablet (768 px) and desktop (1280 px+). Also check a small phone (320 px) and landscape phone.
- Layouts reflow rather than shrink: on mobile, multi-column sections stack, tables become cards, and secondary content collapses behind tabs or "show more".
- Text and numbers never overflow or get cut off at 320 px, including long product names, deep category paths and large NPR totals.
- Touch first: 44 px minimum tap targets, no hover-only actions, and sticky contact actions that never cover form inputs or the visualizer controls.

## 6. Design direction

### The idea

**The store's shade card, turned into a website.** Paint chips, fan decks, can labels and the physical act of choosing colour are the visual language. Colour is the content, so the interface itself stays calm and lets swatches carry the energy.

### Do

- Let **real swatches and the house** be the hero visuals. Use photography (see 5.2) as supporting background, never generic stock imagery.
- Use the **shade card / fan deck** as a recurring motif (e.g. swipeable chip strips, cards that fan out).
- Use strong, confident typography with clear hierarchy; numbers (litres, sq ft, NPR) should feel precise and tool-like.
- Give every interaction **immediate visual feedback**: repainting, rectangles resizing, cans appearing.
- Connect features: visualizer → calculator → WhatsApp should feel like one journey.
- Show local context: Nepali houses, monsoon and damp-proofing realities, NPR prices.

### Avoid (the generic AI website look)

- Purple/blue gradients, glassmorphism, floating blobs, glowing orbs
- A hero with a vague slogan ("Transform your space") and a stock photo
- Rows of three identical icon cards
- Emoji as icons; random 3D illustrations unrelated to paint
- Testimonials carousels with invented quotes
- Over-animated scroll effects that slow the site down on phones

## 7. Deliverables and order

Show me each step before moving on:

1. **Direction board:** typography, colour system for the UI itself in **light and dark** themes (neutral, so paint colours stand out), swatch/chip component, can icon set, buttons, inputs, sample banner photography, and 2–3 sample compositions. **Stop for my feedback.**
2. **Home** (mobile + desktop, light + dark)
3. **Visualizer**, mobile first: part and shade picking in the bottom sheet, colour-set presets, compare mode, share, loading and no-3D fallback, landscape phone, and both themes
4. **Calculator**, including empty state, adding surfaces, results with can breakdown, and a long estimate with many surfaces
5. **Catalog:** category navigation (shallow and deep trees) and product page
6. **Blog:** list and article
7. **Visit / contact** and the sticky contact bar
8. **States:** loading, empty, error, offline, and reduced motion for the key screens

## 8. Open questions (ask me before assuming)

- Should exact prices be public, or shown as "starting from"?
- Should stock availability be shown ("In stock" / "Ask store")?
- Store name, logo, brand colours and photos: do any exist already?
