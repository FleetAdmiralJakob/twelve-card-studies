# Revision 2 benchmark contract

This directory owns the independent Revision 2 workload, compression server, immutable measurement snapshots and report generator. Revision 1 harness/results are untouched. `network.mjs` imports the unchanged `benchmarks/four-network.mjs`; that module and its `four-config.mjs` dependency are SHA-256 fingerprinted alongside the R2 scripts.

Do not run primary benchmark commands until the integrating agent freezes the artwork, UI, build outputs and benchmark scripts. The favicon observer has a separate focused Edge/WebKit diagnostic; it produces no primary measurements or production report. No measurement or production report is fabricated while waiting.

## Run after the freeze

Requirements: the repository's installed Node/Playwright dependencies, Microsoft Edge (`msedge` channel), and Playwright's matching WebKit installation. Build all four editions through the integrating agent's build workflow first; this harness never builds artwork or HTML. Close competing browser/benchmark work and keep the machine configuration stable.

Required inputs:

- `dist/revision-2/{svg,css,basic,hybrid}/index.html`, plus exact `.gz` and `.br` variants.
- `dist/revision-2/assets-manifest.json`: array of `{url, bytes, sha256}`, listing every external asset. URLs use `/revision-2/assets/<filename>`; each listed file must exist and match its hash/size. Any fetched unlisted asset rejects a run.
- All R2 source/art/asset inputs; shared flag/font dependencies; `package.json` and `package-lock.json`. The source fingerprint inventory follows literal local module imports from explicit build/art seeds, includes R2 assets and shared fonts/flags, and is deterministic. New dynamically selected source dependencies must be added to `config.mjs` before measuring.
- The DOM/API described below, unchanged for the full batch.

Start the server in one terminal (no other writes to the frozen inputs):

```powershell
node revision-2/benchmarks/serve.mjs
```

It binds only `127.0.0.1:4175`, loads an allowlisted in-memory snapshot of the four pages and manifest-listed assets, validates HTML compression and asset hashes, and serves existing Brotli/gzip variants with ETag and cache headers. Assets use identity encoding. Report/source/reference routes are optional. Restart after changing any served files; an already running server deliberately retains its snapshot. `/collections/` and `/compare/` links belong to the full site and are not served by this restricted benchmark server.

`/favicon.ico` serves the fingerprinted empty `assets/favicon.ico` for every edition. The server also keeps a bounded in-memory ledger of actual favicon responses keyed by the full same-origin page Referer, including the unique `bench` batch/engine/profile/round token. It observes response `write`/`end` bytes, SHA-256, actual final headers/status and completion/abort events. The readonly `/revision-2/__benchmark/auxiliary?referer=<encoded-page-URL>` endpoint returns exact matches, the server instance ID, monotonic epoch timestamps and any eviction count. The maximum 2,048 records includes pending responses; consumers reject any eviction. No favicon fetch is injected and the audit endpoint never records itself.

In a second terminal, run the final production-Brotli batch:

```powershell
node revision-2/benchmarks/run.mjs --rounds 4 --engine both --origin http://127.0.0.1:4175 --transport br
```

Defaults are `--rounds 4 --engine both --transport auto` and `R2_BENCH_ORIGIN` or `http://127.0.0.1:4174`. The existing preview commonly serves identity HTML; the dataset and report disclose the actual navigation encoding. All 64 runs must receive the same HTML encoding. `--transport br` rejects any navigation that is not Brotli; changing that option does not force unsupported browser negotiation or pretend an uncompressed preview was compressed.

The sequential order is Edge, then WebKit; desktop, then mobile; four rounds; four rotated editions. Each edition occupies each position once. Desktop is **1440×1080**, mobile **390×844**, both DPR 1. These are layout profiles, not device emulation: no touch/mobile flag, no throttling, fresh context and empty storage/cache per run, service workers blocked, locale `en-US`, timezone `UTC`, dark scheme, normal motion. One browser process is reused within each engine. OS, GPU, filesystem and machine caches are not isolated.

Successful runs produce a new `revision-2/benchmarks/measurements/<UTC>-<UUID>.json` and print its path. Files are never overwritten. The integrating agent should commit the actual successful snapshot under this directory. A failed batch remains a `*.partial.json`; do not rename or relabel it as successful.

After a successful primary batch, generate the report and select that immutable file for production builds:

```powershell
node revision-2/benchmarks/report.mjs --input revision-2/benchmarks/measurements/<UTC>-<UUID>.json --set-latest
```

This command validates the complete dataset and current fingerprints, writes the report, then atomically updates `revision-2/benchmarks/latest.json`. **Commit both the immutable measured JSON and `latest.json`.** No pointer is created before a successful primary snapshot exists. `latest.json` is selection metadata, deliberately excluded from measured source/harness fingerprints so selecting a successful measurement does not invalidate it. No measured JSON is edited.

The pointer contains exactly `schemaVersion: 1`, `file: "measurements/<UTC>-<UUID>.json"`, `sha256` of the exact snapshot bytes, `batchId` and `completedAt` copied from that snapshot. It resolves to one regular measurement path within this directory; traversal, partial files, diagnostic directories, mismatched digests and mismatched identities are rejected. The selected record must independently pass all primary validation. The explicit selection is authoritative: file timestamps, directory order and the presence of newer candidates never silently change the published dataset.

Production/default invocation (used by `scripts/build-vercel.mjs` and `npm run report:revision2`):

```powershell
node revision-2/benchmarks/report.mjs
```

Without `--input`, the generator requires `latest.json`; it never scans for candidates or falls back when the pointer is missing, invalid, stale or points at an incomplete dataset. `--input <snapshot>` without `--set-latest` remains available for explicit validation/report generation and does not alter production selection. `--set-latest` requires `--input`.

The generator requires exactly 64 complete primary records with the expected order, engines, profiles, checks, no errors, matching served HTML/assets and complete response-body accounting. It recomputes every HTML/compressed artifact, asset-manifest, asset, source/art and script fingerprint against current files. Any change requires a new measured batch; never patch recorded fingerprints to make an old batch pass. Report timestamps derive only from `completedAt`. Rebuilding the report from the same snapshot and unchanged files is deterministic. Generated output is only `dist/revision-2/benchmarks/index.html` plus the exact raw snapshot as `data.json`; the existing root `dist/` ignore rule covers these generated files. Only the explicit `--set-latest` option additionally writes the checked-in pointer.

Diagnostics remain separate and are never report-eligible:

```powershell
node revision-2/benchmarks/run.mjs --quick --engine edge --origin http://127.0.0.1:4175 --transport br
```

`--quick` forces one round. Any non-four-round or single-engine run is also diagnostic and goes under ignored `diagnostics/`. A full primary requires a single successful `both` invocation; datasets cannot be silently mixed between machines, times or partial batches.

## Workload and interpretation

The profile waits for fonts and gallery images to decode plus three RAF callbacks, samples 30 baseline intervals, opens all 12 cards once, browses 12 warmed changes across 180 RAF intervals, and scrolls the overflowing gallery through 180 intervals. Both profiles must actually scroll more than 80 px. First-open records include synchronous handler, two-callback latency, and decoded readiness followed by two rendering callbacks. This is a rendering opportunity, not a compositor-presentation guarantee or INP. Warm browse and scroll values describe RAF intervals, not display FPS.

Checks cover 12 cards/72 stats, no horizontal overflow, real detail artwork and decoded images, dialog opening, padded `01 / 12` and `12 / 12` positions/wrap, full editor control presence, name edits surviving browsing and updating gallery/detail, and the state API. Required hooks are `#gallery .card`, `.card-stat`, `.card-art`, `.card-name`, `#card-dialog`, `#detail-stage`, `#detail-position`, `#previous-card`, `#next-card`, `#player-name`, `#card-editor` and its rating/position/country/stat/reset controls. `window.cardCollection` must expose `revision:2`, the edition ID, `getState(index)` and `exportState()` with version 1 and 12 card states. Name state is restored after the check. This is workload smoke coverage, not an exhaustive editor/export/accessibility test suite. Hybrid PNG export is excluded.

Network events are passive during timing; bodies, sizes and hashes are read afterward. Cold includes navigation and every HTTP request started by gallery-ready; total includes every request started by the workload end. Each fetched response is checked against local HTML or the asset manifest. The ledger includes method, status, encoding, timestamps, decoded SHA-256, encoded/decoded bytes, available response-transfer/header/request accounting, failures and warnings. Encoded body sums exclude headers and may count cache-served representations when only Content-Length is available; browser transfer is separate and can be null. These are not TCP/TLS wire totals. Inlined data assets are already inside HTML. The decoded image estimate is width × height × 4, not resident memory.

Some Edge favicon requests appear in Resource Timing without a Playwright request event. For these, an observed zero in Resource Timing alone is insufficient. After timing, Node reads the server audit ledger and requires exactly one completed original server response matching the favicon URL, exact unique Referer and browser request interval. Both processes use monotonic Unix-epoch clocks; the explicit matching tolerance is 25 ms. Missing, duplicate, reused, aborted, evicted, nonzero or unverifiable responses fail the run. Server requests inside the workload interval without a unique browser entry also fail. No subsequent fetch of `/favicon.ico` is used as evidence.

Reconciled resources are labelled `observed-server-response + resource-timing`. Their original browser observation and raw SHA-256-pinned audit response are retained with sequence/instance IDs and the matching interval. Actual response status, identity encoding and empty-body hash/size come from the original server observation. Browser `transferBytes` (for example, 300) remains untouched; unsupported request/header byte counts remain null. Response requests remain in all appropriate totals. The report independently replays this reconciliation from retained evidence. The post-timing audit GET is separate Node instrumentation, explicitly recorded outside the page workload. Engines that do not request a favicon receive no synthetic request or record. An old server without this endpoint fails with a restart instruction.

The report shows median [min–max] across four run-level scalars; p95 cells summarize four per-run p95s, never pooled frames. Null FCP stays unavailable, not zero. Four replicates are not confidence intervals. Windows Playwright WebKit is not Safari on a Mac or a phone. SVG/CSS/basic are stylized interpretations; hybrid uses roughly 550×700 source art and 1280px export cannot add detail. This is not a pixel-perfect comparison or a universal winner claim. **R2 cannot be directly compared to R1 because the content, decode workload and desktop viewport changed.**

## Static checks only (safe before freeze)

```powershell
node revision-2/benchmarks/static-check.mjs
```

This syntax-checks the owned modules and checks pure option, encoding, path, network-ledger and validator contracts with in-memory fixtures. It does not read build fingerprints, start a server/browser, write a report, or run measurements. The final report still requires browser/layout inspection after actual measurements; static checks cannot certify visual rendering or performance.

The additional `node revision-2/benchmarks/server-audit-check.mjs` command checks real Node response objects against in-memory streams, without opening sockets. When the integrating agent authorizes a focused browser diagnostic, `node revision-2/benchmarks/favicon-diagnostic.mjs` starts its own temporary server on a free loopback port, makes one CSS navigation per engine sequentially, records actual observer evidence under ignored `diagnostics/`, and closes its server. It does not run the benchmark workload or touch an already running server. Its output is never primary-report eligible.
