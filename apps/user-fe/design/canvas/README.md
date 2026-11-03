# Canvas source (design reference, not production code)

A mirror of the live Claude Design canvas, pulled with `/sync-design`:
https://claude.ai/artifact/NfGiyyEmMHGe5EQcXRdE59

The canvas is the source of truth. Don't edit these files by hand; change the canvas and sync.
`canvas.json` is the canvas index: board titles, sizes and order.

| File | What it shows |
|---|---|
| Main.dc.html | The idea, wordmark, typography |
| Colours.dc.html | UI tokens, light + dark, sign colours |
| Components.dc.html | SignBoard, ShadeChip, shade strip, part tabs, colour-set card, buttons, inputs, cans |
| Photography.dc.html | Product image treatments, banner photo slots + Unsplash credits |
| CompHome.dc.html | Home, mobile, light (interactive colour sets) |
| CompVisualizer.dc.html | Visualizer, mobile, dark (part + shade picking, Look A/B) |
| CompProduct.dc.html | Product page, desktop (size picker, price per litre) |
| OptionA-Signboard.dc.html | Direction option A, Bazaar Signboard (the chosen one) |
| OptionB-Newa.dc.html | Direction option B, Newa Timber & Brick (rejected, kept for reference) |
| OptionC-Dhaka.dc.html | Direction option C, Dhaka Weave (rejected, kept for reference) |
| HomeMobileLight.dc.html | Step 2 · Home, mobile, light (interactive colour sets) |
| HomeMobileDark.dc.html | Step 2 · Home, mobile, dark (same layout, dark tokens) |
| HomeDesktopLight.dc.html | Step 2 · Home, desktop, light |
| HomeDesktopDark.dc.html | Step 2 · Home, desktop, dark (same layout, dark tokens) |
| VizMobileLight.dc.html | Step 3 · Visualizer, mobile, light (live 3D) |
| VizMobileDark.dc.html | Step 3 · Visualizer, mobile, dark (live 3D) |
| VizLandscapeLight.dc.html | Step 3 · Visualizer, phone landscape |
| VizDesktopLight.dc.html | Step 3 · Visualizer, desktop, light, compare looks |
| VizDesktopDark.dc.html | Step 3 · Visualizer, desktop, dark, compare looks |
| VizStates.dc.html | Step 3 · Visualizer loading state, no-3D fallback, and how the 3D behaves |

Reading them:

- Take sizes, spacing and radii from the inline `style="…"` values, then express colours with the Tailwind
  tokens from `src/styles/tokens.css`. Never copy hex values for UI colours; paint hexes are data.
- `{{name}}` placeholders and the `<script type="text/x-dc">` block are the canvas's demo logic (selected
  set/part/shade/size). Treat them as behaviour notes, not code to copy.
- `<sc-for>` is a list rendered from data; `<sc-if>` is conditional.
- Images are canvas uploads (`/_blob/<id>`). Local copies are in `../assets/`:

| Blob id | File |
|---|---|
| 22f1192bf5c3eb5b9bc13d873999a06d | royale-18l.png |
| cbeb017aa0ccef5b490b3be4ee33fcb7 | ultima-basecoat.png |
| 0f7a7820a3bef81fa79a49442de822d6 | house-still.webp (the house picture shown while 3D loads) |
| 1437ff76d322ba4d73b0df06f8dabec6 | not stored: a glTF re-export of `apps/admin-fe/public/models/house.glb` the canvas uses for its live demo |
| 0b86421ec307a6667c197368ffc09d30 | not stored: the three.js library bundle the canvas loads; the app gets three from npm |
