# The Twelve

Twelve football cards in four separately preserved editions, hosted privately on the tailnet:

- [V1 · SVG](http://jakobs-pc.taile7e918.ts.net:8787/)
- [V2 · CSS polygons](http://jakobs-pc.taile7e918.ts.net:8787/css/)
- [V3 · CSS basic primitives](http://jakobs-pc.taile7e918.ts.net:8787/basic/)
- [V4 · Hybrid / Studio](http://jakobs-pc.taile7e918.ts.net:8787/hybrid/)
- [Four-edition comparison](http://jakobs-pc.taile7e918.ts.net:8787/compare/) · [raw data](http://jakobs-pc.taile7e918.ts.net:8787/compare/data.json)
- [Historical three-edition report](http://jakobs-pc.taile7e918.ts.net:8787/bench/) · [reference](http://jakobs-pc.taile7e918.ts.net:8787/reference)

Connect the viewing device to the tailnet and keep the Windows PC awake. Download the built [SVG HTML](http://jakobs-pc.taile7e918.ts.net:8787/source/svg), [polygon HTML](http://jakobs-pc.taile7e918.ts.net:8787/source/css), [primitive HTML](http://jakobs-pc.taile7e918.ts.net:8787/source/basic), or [self-contained hybrid ZIP](http://jakobs-pc.taile7e918.ts.net:8787/source/hybrid). For the ZIP, extract it, change into that directory, run `node serve.mjs`, and open http://localhost:5180. V4 needs its included assets; its HTML alone is not self-contained.

## Run and build

Normal serving needs only Node.js, with no package installation:

```sh
npm start
```

Open http://localhost:5173/ and the `/css/`, `/basic/`, or `/hybrid/` paths. `npm run dev` is the same server. Hosted download/report routes are separate from this local file server.

Building now uses `fflate` to package the hybrid ZIP, so install dependencies first:

```sh
npm ci
npm run build
```

`build` remains `node build.mjs` and now builds all four editions. `npm run build:hybrid` rebuilds V4 alone. Reports are generated separately. Outputs include:

- `dist/hosted.html`, `css.html`, `basic.html`, `hybrid.html`, each with `.br` and `.gz` variants, plus corresponding static-host directories including `dist/hybrid/index.html`.
- `dist/standalone.html`: V1 with its reference embedded. V2/V3 HTML bundles embed their artwork, scripts and fonts; navigation/reference links still need hosted routes.
- `hybrid/index.html`, content-hashed artwork/fonts in `hybrid/assets/` and `dist/hybrid/assets/`, and `dist/hybrid-source.zip` containing the runnable edition.
- `dist/{css,basic,hybrid}-audit.json` and `dist/hybrid-assets.json`: generated counts, sizes and asset fingerprints.

Optional `npm run assets:hybrid` uses Sharp to regenerate assets from `hybrid-art/atlas-separated.png`; run it before `build:hybrid` only when preparing artwork. It extracts transparent clean plates, clears invisible matte residue with alpha below 4, and encodes 200 × 320 / 400 × 640 variants at AVIF quality 65 and WebP quality 88. The unchanged 1122 × 1402 source PNG (about 2.5 MB) stays archived locally and is not a runtime download.

## V4 artwork and editing

V4 combines detailed raster clean plates generated with imagegen from the user's reference, live HTML names/rating/position/six stats, the original bundled SVG flags, and small CSS hover effects. All 12 cards retain their individual reference proportions and the five-card/seven-card desktop arrangement; mobile uses two columns. Modern browsers select AVIF through `<picture>`; Windows Playwright WebKit uses the WebP fallback. Both paths have been tested.

Every card supports editing its name, rating, position, all six stats and any of the 10 bundled countries. Goalkeeper positions switch the stat labels. Validated `localStorage` preserves edits on this browser/origin; unavailable storage falls back to the current visit. No account or backend is required. Resetting one card or the collection requires confirmation. Arrow browsing, Escape and reduced-motion preferences remain supported.

PNG export renders locally at **1280 pixels high**, with width determined by the card's actual aspect ratio and transparent background. Existing `benchmarks/hybrid-checks.json` records passing editing, reload persistence, reset, proportions, mobile and all 12 PNG export checks in both Chromium and WebKit. Those output dimensions do **not** create new high-resolution artwork detail: source cells are roughly 400 pixels high. Neither the larger encodings nor exports are native 1280-pixel or print-resolution artwork.

For an unconstrained visual result, the hybrid approach preserves detailed illustration and editable user fields, at the cost of image transfer/decoding and losing independent editing of every painted stroke. This is established, useful architecture, not a novel rendering trick. V4 is an interpretation, not pixel-identical to the reference. The Discord participant's actual site was not provided, so this project cannot claim to outperform it or establish acceptance of the bet.

## Preserved V1–V3 and history

- **V1** uses hand-coded SVG illustrations and bundled SVG flags, cached artwork images and detail nodes.
- **V2** uses gradients, borders, shadows, polygon clips and some masks. It has no SVG, canvas or image artwork, paint worklet, or encoded reference pixels.
- **V3** uses boxes, ellipses, gradients, borders, shadows and transforms. Its audits exclude SVG, `img`, canvas, clips, polygons, paths, shapes, masks and traced contour lists. This restricts drawing techniques; it does not mean CSS is mathematically vector-free. Textures are procedural; browser checks inspect pseudo-element styles too.

V1–V3 retain their original artwork and interaction code outside the footer, with names saved for the page visit. After the four-edition timings, their footer navigation was updated to link V4 and the four-edition comparison, including inline wrapping styles. Their current whole-HTML hashes therefore differ from the archived measured builds. The report verifies byte-identical HTML before and after each collection footer; V4 must still match its measured HTML exactly. Hosted V2/V3 block images through CSP. All editions are artistic interpretations, with bundled subset WOFF2 fonts and no continuous artwork animation. V1–V3 retain the shared removal of full-card drop-shadow filters, speculative layers and backdrop blur; smaller authored shadows remain.

Historical enhancements remain scoped to V1–V3: V2 guards `border-shape` with a polygon fallback; V3 guards `corner-shape` with ordinary rounded corners; all three guard enhanced `color-mix()` focus colors. `data-css-fallback` disables these enhancements. Mobile `content-visibility`/intrinsic sizing remains opt-in through `data-enable-cv`, disabled in primary timings and measured separately.

Preserve `versions/original.html`, the V1/V2 snapshots in `versions/2026-10-23-before-third/`, and all three pre-V4 snapshots in `versions/2026-10-23-before-fourth/`. Earlier reports/results remain historical evidence, not measurements of V4.

## Four-edition checks and comparison

After `npm ci`, browser checks need `npx playwright install chromium webkit`; timing uses installed Microsoft Edge plus Playwright WebKit. Publish all four builds before timing. `CARD_BENCH_ORIGIN` defaults to http://127.0.0.1:18787; these commands do not start a server or build artwork. Run sequentially on an otherwise idle machine, keeping builds and harness unchanged:

```sh
npm run check:hybrid
npm run benchmark:four
npm run report:four
```

- `check:hybrid` runs `benchmarks/hybrid-checks.mjs` in Chromium and WebKit and writes `hybrid-checks.json` plus screenshots/export evidence under `benchmarks/`.
- `benchmark:four` runs `four-run.mjs`, using `four-config.mjs`, `four-profile.mjs` and `four-network.mjs`. Edge runs first, then WebKit: four editions × two viewports × four balanced rounds = **32 runs per engine, 64 total**. Completed outputs are `four-results.json` and `four-webkit-results.json`; incomplete work stays in `.partial.json`. `--quick` and `--only-hybrid` use separate diagnostic files.
- `report:four` runs `four-build-report.mjs --preview`. It validates full run counts, functional/network checks, unchanged harness hashes and each recorded build/run against the actual measured HTML: the immutable pre-V4 snapshots for V1–V3 and the exact current V4 build. The separate `four-build-history.mjs` helper reproduces archived compressed byte counts with the builders’ default Node compression, verifies current compressed siblings decode to current HTML, and accepts V1–V3 changes only inside the single collection footer. Any byte difference before or after that footer fails. Measured fingerprints and run data remain untouched; separate current fingerprints and comparison records are added to the combined report. Partial/diagnostic results are rejected. The preview flag keeps those checks and additionally writes `bench-four/index.html`; it does not permit incomplete data. Outputs are `dist/compare.html{,.br,.gz}` and `benchmarks/four-combined.json`. Preview at http://localhost:5173/bench-four/.

The footer-only update does not require new benchmarks. All reported timings, DOM counts, network totals and HTML sizes still describe the archived measured builds, not newly measured navigation. To refresh this disclosure and current fingerprints after the footer change, run `npm run build`, then `npm run report:four`, then publish. Keep both result JSON files, the measured snapshots and the timing harness unchanged. The old three-edition report remains historical and is not rebuilt for this update.

Cold-load accounting includes **all HTTP resources requested through gallery readiness**, including V4's external artwork/fonts, so it can be compared fairly with V1–V3's embedded assets. Workload totals also cover later requests. Bytes and response hashes are collected after timed work; HTML size alone is not the comparison. Captured hashes establish what was measured; report generation does not re-fetch the live deployment.

The workload opens all 12 cards, performs 12 next-card changes over 180 warmed animation frames, and samples 180 scrolling frames where overflow permits. Viewports are 1080 × 792 and 390 × 844, DPR 1, fresh contexts, headless, with no CPU/network throttling. This does not isolate OS/GPU caches or browser processes. Frame intervals are not display FPS; two-frame open latency is not pure paint time or INP. Windows WebKit is not Safari on a MacBook, and a mobile viewport is not a physical phone. Use `/compare/` for validated figures and environment details; no universal winner follows from these measurements.

`node benchmarks/hybrid-scroll-diagnostic.mjs` runs a separate, balanced 16-run Windows WebKit mobile investigation of V4: unchanged layout, content-visibility, paint containment and forced compositing. It writes `hybrid-scroll-diagnostic.json` without overwriting the main comparison. If that file is present and complete, the report includes it under a separately labelled investigation; it does not count those runs in the primary 64. The initial follow-up found no consistent improvement over the unchanged layout, so no renderer change was adopted. The main dataset retains its original variation.

`node benchmarks/four-verify-publish.mjs` verifies live tailnet HTML against current build hashes and rechecks its exact relationship to measured snapshots: footer-only differences for V1–V3, whole-file equality for V4. It checks footer links to every other edition and `/compare/`, immutable assets, the downloadable ZIP, current report/data publication and report controls. It retains the original measured hashes alongside current hashes in its output. `node benchmarks/hybrid-portable-check.mjs` extracts the ZIP into `benchmarks/portable-hybrid`, starts its included server on localhost:5180, checks artwork/editing/export, then stops that server. The source ZIP includes font licenses and flag provenance.

## Publish

From PowerShell in the project root, after dependencies are installed:

```powershell
.\hosting\publish.ps1
```

The publisher builds all four editions and copies HTML/compressed variants, hybrid assets/ZIP and existing reports/data into `%LOCALAPPDATA%\TwelveCardCollection`. It does not generate or validate reports: run `report:four` before the final publication, keeping measured artwork unchanged. Publish compressed and plain HTML together.

The existing `TwelveCardCollection` sign-in task runs a hidden Node server at `127.0.0.1:18787`; Tailscale Serve proxies tailnet port 8787. The publisher restarts the task when server code changes and assumes this setup already exists. `tailscale serve status` shows the route; Funnel is not enabled. Hosted hashed assets use immutable caching; HTML uses `no-cache` with ETags. `/compare/` and `/compare/data.json` expose the new report/data; `/bench/` and its data remain separate.

## Historical three-edition workflow

Existing commands keep their original meaning:

```sh
npm run benchmark
npm run benchmark:webkit
npm run benchmark:features
npm run check
npm run check:webkit
npm run report
```

`benchmarks/run.mjs` measures V1–V3 over three rounds at both viewports: 18 runs per engine, with rotated order. `--features` measures V3 mobile enhancements, forced fallback and content-visibility opt-in over nine runs. Outputs remain `results.json`, `webkit-results.json` and `features-results.json`. The old runner reads local bundle hashes but does not verify hosted correspondence. Its `--quick` option overwrites the regular result file, unlike the new four-edition diagnostics.

`check`/`check:webkit` use `capture.mjs` and fixed `http://localhost:5173/dist/{hosted,css,basic}.html` URLs with `npm start` running; they do not use `CARD_BENCH_ORIGIN`. They retain card/stat, name, Escape, overflow, flag and computed-style checks, engine JSON and screenshots. `report` uses `build-report.mjs`, requires complete 18/18/9 runs plus both CSS audits, checks functional results/current bundle hashes and includes captures when available. It writes `bench/index.html`, `benchmarks/report.html`, `benchmarks/combined.json` and `dist/bench.html{,.br,.gz}`. The historical `verify-publish.mjs` checks its tailnet publication; it is not the four-edition validator.

`hosting/performance-evidence.json` and `hosting/profile-browser.js` predate even that workflow and are not directly comparable. Keep these older artifacts alongside the new evidence.

## Source map

- `index.html`, `app.js`, `styles.css`, `themes/`: V1; `css-art/` and `css/app.js`: V2; `basic-art/` and `basic/app.js`: V3.
- `hybrid-art/`: V4 atlas, asset preparation, template/styles and builder; `hybrid/app.js` and `hybrid/export.js`: editor, storage and export. Shared card data lives in `css-art/cards.mjs`.
- `assets/editions.css`: V1–V3 shared enhancements; `assets/fonts.css`, WOFF2 files and licenses: fonts; `assets/flags/` and `flags.css`: original [Flagpedia / FlagCDN](https://flagpedia.net/download/api) flags.
- `benchmarks/`: separate historical and four-edition harnesses, checks, reports and evidence; `hosting/`: publisher/server; `server.mjs`: local server; `versions/`: historical snapshots.
