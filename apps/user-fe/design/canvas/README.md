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
