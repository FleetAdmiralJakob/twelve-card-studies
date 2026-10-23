# The Twelve

Two twelve-card collections, each in four separately preserved rendering approaches. Includes all artwork, editable cards, PNG export, comparison reports and source downloads. The site deploys as static files on Vercel; it needs no database, server functions or API keys.

## Deploy to Vercel

Import [FleetAdmiralJakob/twelve-card-studies](https://github.com/FleetAdmiralJakob/twelve-card-studies) into Vercel. Use the repository root and the **Other** framework preset. The committed `vercel.json` supplies the install command (`npm ci`), build command (`npm run build:vercel`) and output directory (`site`). Node.js 24 is selected in `package.json`. No environment variables are required for a standard Vercel deployment.

The build includes both revisions and all eight editions, their reports and JSON data, both references, PNG export and source downloads. `/` and `/collections/` open the collection hub. Revision 1 lives at `/original/`, `/css/`, `/basic/` and `/hybrid/`; Revision 2 lives under `/revision-2/{svg,css,basic,hybrid}/`. Every edition links back to the hub and the other revision. Vercel serves the site independently of the original Windows machine and tailnet.

The hub, every edition and all reports include **GitHub** and **View source** links. GitHub opens the repository; View source opens the relevant implementation folder. These links are added only to published navigation after benchmark validation. This publication step preserves the validated builds' scripts and styles; source downloads contain those current builds without the added repository links. The R1 report separately discloses the unmeasured V4 flag-frame, comic-title and PNG-renderer polish. Measured snapshots and benchmark records remain unchanged.

Production builds require the complete Revision 2 measurement snapshot selected by `revision-2/benchmarks/latest.json`. Missing, incomplete or stale measurements fail the build; see the [benchmark workflow](revision-2/benchmarks/README.md) for measurement and selection commands.

Production builds use `VERCEL_PROJECT_PRODUCTION_URL` for both hybrid ZIPs' links back to the public collection, avoiding the login-protected generated deployment URL. Preview builds use `VERCEL_URL`, with the production domain as a fallback. Set optional `CARD_SITE_ORIGIN=https://your-domain.example` to override either with a specific domain. Without deployment variables, local builds use `http://localhost:4173`. Card edits are stored per browser/origin, so they do not transfer automatically between the tailnet and a new domain.

To build and check the exact static output locally:

```sh
npm ci
npm run build:vercel
npm run check:routes
npm run preview
```

Open http://localhost:4173. Use `npm run preview -- --port 4180` to select another port. The route check verifies generated files, navigation, downloads, cache/security headers and redirects. It does not rerun browser performance benchmarks. A GitHub Actions workflow runs the install, static build and route check on Linux.

`site/`, `dist/`, generated pages, hashed asset copies and local captures are ignored by Git. Original AVIF/WebP assets, atlas sources, fonts/licenses, the reference and benchmark snapshots remain tracked. `.gitattributes` preserves exact file bytes on Windows and Linux because the benchmark validation uses source and HTML hashes. The static builder publishes only its allowlisted output, not the source workspace. ZIP timestamps and the static report snapshot date are fixed for reproducible builds.

Vercel references: [project configuration](https://vercel.com/docs/project-configuration/vercel-json), [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [deployment environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

Linux deployment builds normalize the generated Revision 2 gzip OS header byte to the recorded Windows value, only when the complete result matches the selected snapshot's hash and size. Compressed payloads, decoded HTML, Brotli, frozen sources and measurement records remain unchanged; the original validators still run.

## Revision 2: Elements of the game

The second supplied reference introduces twelve named cards in a 4 × 3 desktop composition: VALOR, FROST, BLAZE, VOLT, RIVERA, NEXUS, SILVAH, AURUM, DRIFT, MAJESTIC, LEGACY and PRISM. A **revision** changes the reference collection; an **approach** changes its rendering technique. The hub exposes all eight edition links, both references, reports and downloads.

| Approach | Revision 2 route | Artwork |
| --- | --- | --- |
| Hybrid | `/revision-2/hybrid/` | Optimized AVIF/WebP frames, live HTML fields and SVG flags/crests |
| SVG + CSS | `/revision-2/svg/` | Authored scalable vectors; no raster artwork |
| CSS polygons | `/revision-2/css/` | HTML/CSS, including polygon outlines; no SVG/images/canvas |
| CSS primitives | `/revision-2/basic/` | Boxes, ellipses, gradients, borders and transforms; no image, clip, mask, path or polygon outlines |

All four new editions support names, ratings, positions, twelve countries and all six stats. Validated local edits are shared across Revision 2 approaches on the same browser origin; Revision 1 remains separate. Each card can be reset after confirmation. The larger-card toggle supports closer reading, especially on small screens. Hybrid exports transparent 1011 × 1280 PNGs with live fields and crests. Source art is approximately 550 × 700 pixels per card; larger exports do not add underlying detail.

Source downloads are at `/revision-2/source/{svg,css,basic,hybrid}`. Three constrained editions are single HTML files; hybrid is a complete ZIP with assets and a local server (`node serve.mjs`, http://localhost:5182). The ZIP reference link works locally and its other collection links use the configured site origin. No external artwork/font/flag service is contacted at runtime. [Asset provenance](revision-2/assets/ARTWORK.md) documents the imagegen adaptations and flag sources. All approaches are interpretations; the constrained drawings are deliberately stylized, and no edition is claimed pixel-identical to the reference.

Use `npm run build:revision2` to build the four pages and hub, `npm run assets:revision2` only to re-encode authored raster inputs, and `npm run check:revision2` for the dedicated browser checks. The full production workflow is `npm run build:vercel` followed by `npm run check:routes`. The older `npm run build` command retains its Revision 1 behavior.

The initial full functional QA on 2026-10-23 passed **284/284 checks**, with **0 errors**, **16 edition/engine/viewport views** and **32 hybrid PNG exports**. The [QA summary](revision-2/evidence/checkoutputs/2026-10-23T17-39-08-631Z-both/summary.json) is local evidence, ignored by Git.

A subsequent hybrid asset correction removes neighboring card fragments accidentally included by the original atlas quadrant extraction. Source-pinned exclusions preserve the original tile size and field alignment; all source atlases remain intact. The [artwork provenance](revision-2/assets/ARTWORK.md) documents the narrow mixed-glow tradeoffs. Targeted Edge and Windows WebKit checks passed **72/72**, with **0 errors** and **30 PNG exports**, covering compact/larger desktop/mobile galleries and every card editor. The [crop QA summary](revision-2/evidence/atlas-crop/browser-2026-10-23T19-53-30-479Z/summary.json) is also local ignored evidence. R1 and the three nonhybrid R2 pages are unchanged by this correction.

The corrected assets have a fresh [64-run measurement snapshot](revision-2/benchmarks/measurements/2026-10-23T19-57-15-388Z-093293df-a0c9-4d8b-9464-e1305d36fe0d.json), completed at 20:08:43 UTC on 2026-10-23. Earlier snapshots remain archived; `latest.json` selects the new complete, validated batch.

Revision 2 has an independent [benchmark workflow](revision-2/benchmarks/README.md). It requires 64 runs across Edge and Windows WebKit, two layout profiles and four balanced rounds. Report generation validates frozen source, HTML, resource and harness hashes against the selected immutable snapshot; the production routes are `/revision-2/benchmarks/` and `/revision-2/benchmarks/data.json`. R1 reports remain historical. Content, desktop viewport and decode workload differ between revisions, so their timings are not a controlled before/after comparison. Headless Windows WebKit is not Safari on a Mac or a real phone; animation-frame callback intervals are not FPS or INP.

## Existing tailnet site

After publication, these routes are available on the existing private host:

- [Collection hub](http://jakobs-pc.taile7e918.ts.net:8787/)
- Revision 2: [Hybrid](http://jakobs-pc.taile7e918.ts.net:8787/revision-2/hybrid/) · [SVG](http://jakobs-pc.taile7e918.ts.net:8787/revision-2/svg/) · [CSS polygons](http://jakobs-pc.taile7e918.ts.net:8787/revision-2/css/) · [CSS primitives](http://jakobs-pc.taile7e918.ts.net:8787/revision-2/basic/)
- Revision 2: [report](http://jakobs-pc.taile7e918.ts.net:8787/revision-2/benchmarks/) · [raw data](http://jakobs-pc.taile7e918.ts.net:8787/revision-2/benchmarks/data.json) · [reference](http://jakobs-pc.taile7e918.ts.net:8787/revision-2/reference)
- [Revision 1 · SVG](http://jakobs-pc.taile7e918.ts.net:8787/original/)
- [V2 · CSS polygons](http://jakobs-pc.taile7e918.ts.net:8787/css/)
- [V3 · CSS basic primitives](http://jakobs-pc.taile7e918.ts.net:8787/basic/)
- [V4 · Hybrid / Studio](http://jakobs-pc.taile7e918.ts.net:8787/hybrid/)
- [Revision 1 four-edition comparison](http://jakobs-pc.taile7e918.ts.net:8787/compare/) · [raw data](http://jakobs-pc.taile7e918.ts.net:8787/compare/data.json)
- [Historical three-edition report](http://jakobs-pc.taile7e918.ts.net:8787/bench/) · [reference](http://jakobs-pc.taile7e918.ts.net:8787/reference)

Connect the viewing device to the tailnet and keep the Windows PC awake. Download the built [SVG HTML](http://jakobs-pc.taile7e918.ts.net:8787/source/svg), [polygon HTML](http://jakobs-pc.taile7e918.ts.net:8787/source/css), [primitive HTML](http://jakobs-pc.taile7e918.ts.net:8787/source/basic), or [self-contained hybrid ZIP](http://jakobs-pc.taile7e918.ts.net:8787/source/hybrid). For the ZIP, extract it, change into that directory, run `node serve.mjs`, and open http://localhost:5180. V4 needs its included assets; its HTML alone is not self-contained.

## Run and build

For the Revision 1 development file server, install and build once after cloning, then start it:

```sh
npm ci
npm run build
npm start
```

Open http://localhost:5173/ for V1 and the `/css/`, `/basic/`, or `/hybrid/` paths for V2–V4. `npm run dev` is the same workspace file server. It does not reproduce the production hub, download routes or headers. To check both revisions with production routing, use `build:vercel`, `check:routes` and `preview` as shown above; the static preview serves only `site/` on port 4173.

`build` remains `node build.mjs` and builds all four Revision 1 editions, using `fflate` to package the hybrid ZIP. `npm run build:hybrid` rebuilds V4 alone. These commands generate no reports. Outputs include:

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

V1–V3 retain their measured artwork and interaction code outside the collection footer and save names for the page visit. After the four-edition timings, their footer navigation was updated to link V4 and the four-edition comparison, including inline wrapping styles. The later hub/Revision 2 links also change V4's footer. V4 additionally has newer visual polish: a flag frame, comic-card title alignment and corresponding PNG renderer changes. These visual changes and the navigation updates have not been benchmarked. Current whole-HTML hashes are recorded separately from the archived measured builds. The report permits footer-only differences for V1–V3; for V4 it first removes only the exact known CSS/JS polish through `hybrid-art/polish.mjs`, then verifies byte-identical HTML before and after the footer. A polished V4 is labelled `footer-and-visual-polish`, so the report does not claim all four editions are unchanged outside their footers. V4's measured HTML remains in the immutable pre-Revision-2 snapshot. Hosted V2/V3 block images through CSP. All editions are artistic interpretations, with bundled subset WOFF2 fonts and no continuous artwork animation. V1–V3 retain the shared removal of full-card drop-shadow filters, speculative layers and backdrop blur; smaller authored shadows remain.

Historical enhancements remain scoped to V1–V3: V2 guards `border-shape` with a polygon fallback; V3 guards `corner-shape` with ordinary rounded corners; all three guard enhanced `color-mix()` focus colors. `data-css-fallback` disables these enhancements. Mobile `content-visibility`/intrinsic sizing remains opt-in through `data-enable-cv`, disabled in primary timings and measured separately.

Preserve `versions/original.html`, the V1/V2 snapshots in `versions/2026-10-23-before-third/`, all three pre-V4 snapshots in `versions/2026-10-23-before-fourth/`, and the immutable V4 archive at `versions/2026-10-23-before-revision2/hybrid.html`. Earlier three-edition reports/results remain historical evidence, not measurements of V4.

## Revision 1 four-edition checks and comparison

The timing commands below document the original R1 workflow: its frozen runner expects V1 at `/`, so the current hub deployment is not a compatible timing target. After `npm ci`, browser checks need `npx playwright install chromium webkit`; timing uses installed Microsoft Edge plus Playwright WebKit. Publish all four measured builds at their original routes before timing. `CARD_BENCH_ORIGIN` defaults to http://127.0.0.1:18787; these commands do not start a server or build artwork. Run sequentially on an otherwise idle machine, keeping builds and harness unchanged:

```sh
npm run check:hybrid
npm run benchmark:four
npm run report:four
```

- `check:hybrid` runs `benchmarks/hybrid-checks.mjs` in Chromium and WebKit and writes `hybrid-checks.json` plus screenshots/export evidence under `benchmarks/`.
- `benchmark:four` runs `four-run.mjs`, using `four-config.mjs`, `four-profile.mjs` and `four-network.mjs`. Edge runs first, then WebKit: four editions × two viewports × four balanced rounds = **32 runs per engine, 64 total**. Completed outputs are `four-results.json` and `four-webkit-results.json`; incomplete work stays in `.partial.json`. `--quick` and `--only-hybrid` use separate diagnostic files.
- `report:four` runs `four-build-report.mjs --preview`. It validates full run counts, functional/network checks, unchanged harness hashes and each recorded build/run against the actual measured HTML: the immutable pre-V4 snapshots for V1–V3 and the immutable pre-Revision-2 snapshot for V4. The separate `four-build-history.mjs` helper reproduces archived compressed byte counts with the builders’ default Node compression and verifies current compressed siblings decode to current HTML. V1–V3 accept changes only inside the single collection footer. V4 also accepts only the exact known flag-frame, comic-title and PNG-renderer polish; the shared helper removes its guarded injections before the same footer comparison. Lossless UTF-8 conversion and Latin-1 footer indexing preserve bytes without newline normalization. Every unrelated byte difference outside the footer fails, including modified or partial polish. Raw pre-polish HTML and footer-only historical builds remain supported. Measured fingerprints and run data remain untouched; separate current fingerprints, comparison records and explicit history invariants are added to the combined report. Partial/diagnostic results are rejected. The preview flag keeps those checks and additionally writes `bench-four/index.html`; it does not permit incomplete data. Outputs are `dist/compare.html{,.br,.gz}` and `benchmarks/four-combined.json`. Preview at http://localhost:5173/bench-four/.

No R1 benchmarks were rerun for the navigation updates or small V4 visual polish. All reported timings, DOM counts, network totals and measured HTML sizes still describe the archived builds. They do not establish current V4 performance or equality with its archived performance; current fingerprints are validation metadata, not new timing results. To refresh the R1 disclosure and current fingerprints locally, run `npm run build`, then `npm run report:four`. The full static build and publisher perform this validation automatically. Keep both result JSON files, all four measured snapshots and the timing harness unchanged. The old three-edition report remains historical and is not rebuilt for this update.

Cold-load accounting includes **all HTTP resources requested through gallery readiness**, including V4's external artwork/fonts, so it can be compared fairly with V1–V3's embedded assets. Workload totals also cover later requests. Bytes and response hashes are collected after timed work; HTML size alone is not the comparison. Captured hashes establish what was measured; report generation does not re-fetch the live deployment.

The workload opens all 12 cards, performs 12 next-card changes over 180 warmed animation frames, and samples 180 scrolling frames where overflow permits. Viewports are 1080 × 792 and 390 × 844, DPR 1, fresh contexts, headless, with no CPU/network throttling. This does not isolate OS/GPU caches or browser processes. Frame intervals are not display FPS; two-frame open latency is not pure paint time or INP. Windows WebKit is not Safari on a MacBook, and a mobile viewport is not a physical phone. Use `/compare/` for validated figures and environment details; no universal winner follows from these measurements.

`node benchmarks/hybrid-scroll-diagnostic.mjs` runs a separate, balanced 16-run Windows WebKit mobile investigation of V4: unchanged layout, content-visibility, paint containment and forced compositing. It writes `hybrid-scroll-diagnostic.json` without overwriting the main comparison. If that file is present and complete, the report includes it under a separately labelled investigation; it does not count those runs in the primary 64. The initial follow-up found no consistent improvement over the unchanged layout, so no renderer change from that investigation was adopted. Those archived diagnostics also predate the newer flag-frame, comic-title and PNG-renderer polish and do not measure it. The main dataset retains its original variation.

`node benchmarks/four-verify-publish.mjs` verifies live tailnet HTML against the current build plus the footer-only repository-link publication transform. Against measured snapshots it accepts exact equality or footer-only differences for all four R1 editions, and `footer-and-visual-polish` only for the exact known V4 polish. Its invariants are derived from those comparisons: V1–V3 remain unchanged outside their footers; `allEditionsOutsideFooterUnchanged` is false when V4 is polished, and `currentVisualPolishBenchmarked` remains false. It checks footer links to every other R1 edition, `/compare/`, `/collections/` and `/revision-2/svg/`; current V1 links use `/original/`. It also verifies immutable assets, source downloads against current HTML (including polish, after portable URL rewrites for the V4 ZIP), the static report/data publication and report controls. Original measured hashes remain alongside current build and published hashes in its output. `node benchmarks/hybrid-portable-check.mjs` extracts the ZIP into `benchmarks/portable-hybrid`, starts its included server on localhost:5180, checks artwork/editing/export, then stops that server. The source ZIP includes font licenses and flag provenance.

## Publish

From PowerShell in the project root, after dependencies are installed:

```powershell
.\hosting\publish.ps1
```

The publisher runs the full static build for both revisions and the hub, regenerates and validates the R1 four-edition and selected R2 reports, then runs the public route checks. It copies only the allowlisted files from `dist/public-files.json` into `%LOCALAPPDATA%\TwelveCardCollection\releases\<release>\site`, verifying every copied file's size and SHA-256. After staging the release and server files, it switches `current.json`. Old releases remain available for rollback and are not exposed through current site routes. The older three-edition report stays historical.

The existing `TwelveCardCollection` sign-in task runs a hidden Node server at `127.0.0.1:18787`; Tailscale Serve proxies tailnet port 8787. The publisher assumes this setup already exists, restarts the task for every release, and checks the served hub's ETag against the staged inventory. The server shares the static preview's routes and headers and enables HTML compression. `tailscale serve status` shows the route; Funnel is not enabled. Hosted hashed assets use immutable caching; HTML uses `no-cache` with ETags. `/compare/` and its data serve R1; `/revision-2/benchmarks/` and its data serve R2; `/bench/` remains the earlier three-edition report.

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
- `revision-2/`: four approaches, assets, builders, functional QA and independent benchmarks; `revision-2/build-hub.mjs`: collection hub; `scripts/`: static assembly, production route checks and preview server.
