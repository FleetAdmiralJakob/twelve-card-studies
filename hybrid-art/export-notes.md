# Hybrid PNG export integration

Load or inline `hybrid/export.js` once, after `hybrid/app.js`. It is a dependency-free IIFE and does not create a global API.

Dispatch on `document` after applying edits to the visible detail card:

```js
document.dispatchEvent(new CustomEvent('hybrid:export', {
  detail: { card: visibleDetailCard, theme: currentTheme, state: currentState },
}));
```

The connected, visible `card` must contain `.card-art img`, the rating/name/stats DOM, and optionally `.card-flag .flag`. Rendered text is authoritative; `state` is accepted as part of the shared contract but is not serialized or read. No dependency on `window.cardCollection` is required.

Listen on `document` for `hybrid:export-result`, with `detail: { ok, message }`. Disable the export button before dispatch; restore it and show the message on this completion event. Duplicate requests during an active export are ignored, with one completion event for the active export. Failure also releases the internal busy state.

- Output height is 1280 pixels. Width is `Math.round(1280 * dataWidth / dataHeight)`. Keep `data-width` and `data-height` on the detail clone or a matching `.card[data-width][data-height]` gallery card. Without those attributes, the visible detail aspect is used.
- The card CSS must remain authored at 200 × 320. Output scaling replaces the outer card/dialog scale; local computed transforms, including rotated name and rating groups, are preserved around their computed origins.
- The frame is drawn at its computed image position and size. Cropped 200 × 320-coordinate artwork needs the hybrid image CSS to override the original SVG edition's `left: -24px; top: -24px; width: 248px; height: 368px` bleed rule.
- Image preference is `img.dataset.highRes`, matching gallery image `dataset.highRes`, largest `img.srcset` candidate, `currentSrc`, then `src`. Failed high-resolution candidates fall back to the displayed artwork. Inline data images, same-origin images/blobs, and local files when the document is local are supported. Inline the high-resolution attributes too when packaging the self-contained HTML, or omit them to use the inline displayed image.
- Fonts are awaited before capture. Text uses computed family/style/weight/size/color/alignment/letter spacing, unscaled layout offsets, local matrices, font-metric line-box baselines, and name overflow clipping. Canvas font metrics approximate CSS baselines; small platform-specific differences remain possible. CSS text/box shadows and borders are intentionally omitted.
- The flag's live bounds supply its center/top/height. Its SVG's intrinsic aspect supplies output width, preserving country proportions even if responsive detail scaling differs from the reference aspect.
- The canvas is never filled with an opaque background. Existing raster alpha supplies the card silhouette and transparent exterior. A larger PNG resamples the available frame; it does not generate additional artwork detail. Editable text and SVG flags are rendered at export resolution.
- Download names are sanitized `hybrid-<theme>.png`. The PNG receives no state or private application metadata; only visible card content is drawn.

Validation status: no browser or automated tests run, per the integration gate. Suggested root checks: export a rotated steampunk name and comic rating, a narrow cathedral card, changed name/rating/position/stats/country, and one mobile detail; verify PNG dimensions, transparent corners, placement, country aspect, download filename, and button recovery on failure.
