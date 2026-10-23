# Fourth edition artwork

The user-supplied `assets/reference.png` is the visual reference. The two source PNG atlases here were prepared with the built-in imagegen tool: first to remove ratings, positions, names, statistics and flags while retaining frames and illustrations; then to separate the twelve clean cards into a four-column atlas with transparent gutters.

These are image-assisted interpretations, not a claim of pixel identity. The source art is raster; editing the player fields does not edit the underlying portrait or painted texture.

`prepare-assets.mjs` keeps the PNG sources unchanged. It extracts each card cell, normalizes near-transparent matte residue (alpha below 4/255), and makes AVIF and WebP assets at 200×320 and 400×640. The normalized file dimensions are stretched back to each reference card's aspect ratio by the layout, detail view and export. The 1280px-high PNG export adds crisp live type and flags; it does not invent new resolution in the source illustration.

AVIF uses quality 65 and 4:4:4 chroma; WebP uses quality 88 and full alpha quality. The browser selects the supported format with `<picture>` and the resolution with `srcset`. The measured Windows WebKit build selects WebP, while Chromium/Edge selects AVIF. Both paths passed image decoding and all twelve export checks. The build adds content hashes to filenames so cached assets can be reused safely.

Names, ratings, positions and statistics are HTML. Country flags use the existing bundled SVGs with their original national proportions. The doodle card's yellow name strip is a small CSS surface, also painted by the PNG exporter. Hover movement uses only a wrapper transform and an opacity overlay, and is disabled for reduced-motion preferences and non-hover pointers.

Relevant primary references: [responsive image selection](https://html.spec.whatwg.org/multipage/images.html), [Sharp encoding options](https://sharp.pixelplumbing.com/api-output/), [compositing-friendly animation guidance](https://web.dev/articles/animations-guide).
