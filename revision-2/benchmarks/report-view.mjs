/**
 * Static, presentation-only rendering of the validated Revision 2 benchmark dataset.
 * Contract: renderReport(dataset: SchemaV2) -> HTML string, synchronously.
 * The caller verifies artifacts/checks and writes index.html plus data.json.
 * This module performs no I/O, reads no clock, and does not mutate its input.
 */

const EDITIONS = [
  { id: 'svg', label: 'SVG + CSS', short: 'SVG', detail: 'Stylized vector artwork' },
  { id: 'css', label: 'CSS shapes', short: 'CSS', detail: 'CSS polygons and curved paths' },
  { id: 'basic', label: 'CSS primitives', short: 'Basic', detail: 'Stylized basic shapes' },
  { id: 'hybrid', label: 'Hybrid', short: 'Hybrid', detail: 'Raster artwork + live type' },
];
const ENGINES = ['edge', 'webkit'];
const ENGINE_NAMES = { edge: 'Microsoft Edge', webkit: 'Playwright WebKit' };
const ROUNDS = 4;

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const number = (value, digits = 1) => value.toFixed(digits).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
const integer = value => number(value, 1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const bytes = value => finite(value) ? `${escapeHTML(integer(value))} <span class="unit">B</span>` : '<span class="unavailable">Unavailable</span>';
const rawText = value => value === null || value === undefined || value === '' ? 'Not recorded' : String(value);

// Stable object key order without sorting or otherwise changing the source object.
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort(compareText).map(key => [key, stableValue(value[key])]));
  }
  return value;
}
const json = value => escapeHTML(JSON.stringify(stableValue(value), null, 2));

function requireDataset(dataset) {
  if (!Array.isArray(dataset?.runs) || dataset.runs.length === 0) {
    throw new TypeError('renderReport requires measured runs; an empty report cannot be published.');
  }
  if (dataset.schemaVersion !== 2 || dataset.revision !== 2 || dataset.status !== 'complete' || dataset.diagnostic !== false) {
    throw new TypeError('renderReport requires a complete, nondiagnostic schemaVersion 2 / revision 2 dataset.');
  }
  const method = dataset.method;
  if (method?.rounds !== ROUNDS || !Array.isArray(method.viewports) || method.viewports.length !== 2 ||
      !Array.isArray(method.engines) || method.engines.length !== 2 || !ENGINES.every(engine => method.engines.includes(engine))) {
    throw new TypeError('renderReport requires four rounds, two viewports, and Edge plus WebKit.');
  }
  const profiles = new Set(method.viewports.map(viewport => viewport.name));
  if (profiles.size !== 2 || method.viewports.some(viewport => typeof viewport.name !== 'string' || !viewport.name ||
      !finite(viewport.width) || viewport.width <= 0 || !finite(viewport.height) || viewport.height <= 0)) {
    throw new TypeError('renderReport requires two distinct named viewports with positive dimensions.');
  }
  if (dataset.runs.length !== 64) throw new TypeError('renderReport requires all 64 measured runs.');
  const keys = new Set();
  for (const run of dataset.runs) {
    if (!run || !ENGINES.includes(run.engine) || !EDITIONS.some(edition => edition.id === run.edition) ||
        !profiles.has(run.profile) || !Number.isInteger(run.round) || run.round < 1 || run.round > ROUNDS) {
      throw new TypeError('renderReport received a run outside the expected engine/edition/profile/round matrix.');
    }
    const key = JSON.stringify([run.engine, run.edition, run.profile, run.round]);
    if (keys.has(key)) throw new TypeError('renderReport received a duplicate run.');
    keys.add(key);
    if ([run.errors, run.failures, run.network?.failures].some(items => Array.isArray(items) && items.length > 0)) {
      throw new TypeError('renderReport cannot publish runs with recorded errors or failures.');
    }
    if (run.network?.cold?.complete !== true || run.network?.workload?.complete !== true) {
      throw new TypeError('renderReport requires complete cold and total network accounting.');
    }
  }
  if (typeof dataset.completedAt !== 'string' || !dataset.completedAt || !dataset.machine || !dataset.browsers ||
      !dataset.fingerprints || !ENGINES.every(engine => dataset.browsers[engine]) ||
      !EDITIONS.every(edition => dataset.fingerprints.builds?.[edition.id]) ||
      !Array.isArray(dataset.fingerprints.assetManifest?.assets) ||
      !Array.isArray(dataset.fingerprints.sources) || !Array.isArray(dataset.fingerprints.harness)) {
    throw new TypeError('renderReport requires completion, machine, browser, and fingerprint provenance.');
  }
}

/** Summarize four run-level scalars. Missing values never become zero or a partial four-round result. */
function metric(runs, pick, format = 'ms') {
  const values = runs.map(pick).filter(finite).sort((left, right) => left - right);
  if (values.length !== ROUNDS) {
    return `<td><span class="unavailable">Unavailable</span><span class="range">${values.length}/4 reported</span></td>`;
  }
  const median = values[1] + (values[2] - values[1]) / 2;
  const divisor = format === 'KiB' ? 1024 : 1;
  const digits = format === 'KiB' ? 2 : 1;
  const display = value => escapeHTML(number(value / divisor, digits));
  const unit = format === 'count' ? '' : ` <span class="unit">${format}</span>`;
  return `<td><span class="value">${display(median)}${unit}</span><span class="range">[${display(values[0])}–${display(values[3])}]</span></td>`;
}

function metricTable(caption, rows, byEdition) {
  return `<div class="table-scroll" role="region" aria-label="${escapeHTML(caption)}" tabindex="0"><table class="metrics">
    <caption>${escapeHTML(caption)}</caption>
    <thead><tr><th scope="col">Metric <span class="heading-note">median [min–max] across 4 runs</span></th>${EDITIONS.map(edition => `<th scope="col"><a href="/revision-2/${edition.id}/">${edition.short}</a></th>`).join('')}</tr></thead>
    <tbody>${rows.map(row => row.heading
      ? `<tr class="row-group"><th colspan="5">${escapeHTML(row.heading)}</th></tr>`
      : `<tr><th scope="row">${escapeHTML(row.label)}${row.note ? `<span class="row-note">${escapeHTML(row.note)}</span>` : ''}</th>${EDITIONS.map(edition => metric(byEdition[edition.id], row.pick, row.format)).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

// Presentation only: expose recorded summaries without changing sampling or timing.
const PERFORMANCE_ROWS = [
  { label: 'First contentful paint', note: 'FCP · browser reported', pick: run => run.load?.fcp },
  { label: 'Gallery ready', note: 'Observed by the harness', pick: run => run.load?.galleryReadyObserved },
  { label: 'First open · ready median', note: 'Per-run median of 12 opens', pick: run => run.dialogDecode?.median },
  { label: 'First open · ready p95', note: 'Per-run maximum · worst of 12 opens', pick: run => run.dialogDecode?.p95 },
  { label: 'First open · 2 RAFs p95', note: 'Per-run maximum · worst of 12 opens', pick: run => run.dialogTwoFrame?.p95 },
  { label: 'Warm browse · RAF p95', note: 'Per-run interval p95', pick: run => run.browseFrames?.p95 },
  { label: 'Warm browse · RAF max', note: 'Per-run maximum interval', pick: run => run.browseFrames?.max },
  { label: 'Scroll · RAF p95', note: 'Per-run interval p95', pick: run => run.scrollFrames?.p95 },
  { label: 'Scroll · RAF max', note: 'Per-run maximum interval', pick: run => run.scrollFrames?.max },
  { label: 'Initial document DOM', note: 'Element count', format: 'count', pick: run => run.nodes?.documentInitial },
  { label: 'Gallery DOM', note: 'Element count', format: 'count', pick: run => run.nodes?.gallery },
];

const TRAFFIC_ROWS = ['cold', 'workload'].flatMap(scope => [
  { heading: scope === 'cold' ? 'Cold navigation · HTML + requested assets' : 'Total workload · includes cold navigation' },
  { label: 'Requests', format: 'count', pick: run => run.network?.[scope]?.requests },
  { label: 'Encoded bodies', note: 'Measured response bodies', format: 'KiB', pick: run => run.network?.[scope]?.encodedBodyBytes },
  { label: 'Decoded bodies', note: 'After content decoding', format: 'KiB', pick: run => run.network?.[scope]?.decodedBodyBytes },
  { label: 'Response transfer', note: 'Browser reported · if supported', format: 'KiB', pick: run => run.network?.[scope]?.transferBytes },
]);

function groupSection(dataset, engine, viewport, index) {
  const selected = dataset.runs.filter(run => run.engine === engine && run.profile === viewport.name);
  const byEdition = Object.fromEntries(EDITIONS.map(edition => [edition.id,
    selected.filter(run => run.edition === edition.id).sort((left, right) => left.round - right.round),
  ]));
  const auxiliary = ['cold', 'workload'].flatMap(scope => [
    { heading: scope === 'cold' ? 'Cold navigation' : 'Total workload (cumulative)' },
    { label: 'Response headers', note: 'If reported by browser', format: 'KiB', pick: run => run.network?.[scope]?.responseHeadersBytes },
    { label: 'Request bytes', note: 'If reported by browser', format: 'KiB', pick: run => run.network?.[scope]?.requestBytes },
  ]);
  const warnings = EDITIONS.flatMap(edition => byEdition[edition.id].flatMap(run =>
    (run.network?.warnings ?? []).map(message => ({ edition: edition.id, round: run.round, message }))));
  const encodings = [...new Set(selected.flatMap(run => (run.network?.resources ?? []).map(resource =>
    resource.contentEncoding === null || resource.contentEncoding === undefined || resource.contentEncoding === ''
      ? '(no content-encoding recorded)' : String(resource.contentEncoding))))].sort(compareText);
  const htmlEncodings = [...new Set(selected.map(run => run.transport?.htmlEncoding || 'not recorded'))].sort(compareText);
  const observedAuxiliary = selected.reduce((sum,run) => sum+(run.network?.resources ?? []).filter(resource => resource.source === 'observed-server-response + resource-timing').length,0);
  return `<section class="result-group" id="group-${index}" aria-labelledby="group-title-${index}">
    <header class="group-heading"><div><p class="eyebrow">${String(index).padStart(2, '0')} / engine × viewport</p><h3 id="group-title-${index}">${ENGINE_NAMES[engine]} <span>/${escapeHTML(viewport.name)}</span></h3></div>
      <p class="group-meta">${escapeHTML(viewport.width)} × ${escapeHTML(viewport.height)} CSS px<br>${selected.length} runs · 4 per edition</p></header>
    <p class="fine">HTML transport: <strong>${escapeHTML(htmlEncodings.join(', '))}</strong>. ${htmlEncodings.includes('identity') ? 'This batch used uncompressed HTML; Brotli/gzip file sizes below were not the measured HTML transport.' : 'Compression is recorded from the navigation response, with its decoded body checked against the frozen build.'}</p>
    <div class="results-grid">
      ${metricTable('Timing & document structure', PERFORMANCE_ROWS, byEdition)}
      ${metricTable('Full page traffic · 1 KiB = 1,024 bytes', TRAFFIC_ROWS, byEdition)}
    </div>
    <details class="network-detail"><summary>Network accounting details <span>headers, requests, encodings & ${warnings.length} warning${warnings.length === 1 ? '' : 's'}</span></summary>
      <p>Response transfer is the browser-reported response metric, not total wire traffic. It does not include outbound request bytes, TLS or TCP overhead. Encoded body totals count response representations; fallback Content-Length sizes may also count cache-served representations when an engine does not expose cache provenance. They must not be read as packet-level traffic. An unavailable value means the browser or harness did not report a complete four-round value; it does not mean zero.</p>
      <p>${observedAuxiliary} favicon response${observedAuxiliary === 1 ? '' : 's'} used actual server-response observations together with Resource Timing because Playwright did not expose the request. Each requires one completed response matching the unique page Referer, URL and browser interval with a recorded 25 ms epoch-clock tolerance. The actual status, response-body hash and zero body size come from that response; browser transfer is retained and unknown header/request bytes remain unavailable. Original browser entries and raw server evidence remain in data.json. The read-only audit GET runs in Node after the timed workload and is recorded separately as instrumentation, outside page traffic. No favicon request is injected.</p>
      ${metricTable('Additional byte accounting · KiB', auxiliary, byEdition)}
      <p class="fine">Recorded content encodings: <code>${escapeHTML(encodings.join(', ') || 'Not recorded')}</code>. Resource-by-resource accounting and collection metadata are retained in <a href="data.json" download>data.json</a>.</p>
      ${warnings.length ? `<details><summary>Recorded network warnings (${warnings.length})</summary><pre>${json(warnings)}</pre></details>` : '<p class="fine">No network warnings recorded in this engine/viewport group.</p>'}
    </details>
  </section>`;
}

function metadataList(entries) {
  return `<dl class="metadata">${entries.map(([key, value]) => `<div><dt>${escapeHTML(key)}</dt><dd>${escapeHTML(rawText(value))}</dd></div>`).join('')}</dl>`;
}

function fingerprintTable(caption, rows, nameField = 'path') {
  return `<div class="table-scroll" role="region" aria-label="${escapeHTML(caption)}" tabindex="0"><table class="fingerprints">
    <caption>${escapeHTML(caption)}</caption><thead><tr><th scope="col">${nameField === 'url' ? 'Asset URL' : 'Path'}</th><th scope="col">Bytes</th><th scope="col">SHA-256</th></tr></thead>
    <tbody>${[...rows].sort((left, right) => compareText(String(left[nameField]), String(right[nameField]))).map(row => `<tr><th scope="row"><code>${escapeHTML(rawText(row[nameField]))}</code></th><td>${bytes(row.bytes)}</td><td><code class="hash">${escapeHTML(rawText(row.sha256))}</code></td></tr>`).join('')}</tbody>
  </table></div>`;
}

function provenance(dataset) {
  const machine = dataset.machine;
  const fingerprints = dataset.fingerprints;
  const manifest = fingerprints.assetManifest;
  return `<section class="section" id="provenance" aria-labelledby="provenance-title">
    <div class="section-heading"><span class="section-number">03</span><h2 id="provenance-title">The measurement record.</h2></div>
    <p class="section-copy">One batch, with the machine, browser builds and measured file identities kept alongside the results. Full run-level measurements and checks are available in the raw JSON.</p>
    ${metadataList([
      ['Batch', dataset.batchId], ['Snapshot SHA-256', dataset.snapshotSha256], ['Origin', dataset.origin], ['CPU', machine.cpu], ['Logical cores', machine.logicalCores],
      ['Memory', finite(machine.memoryBytes) ? `${integer(machine.memoryBytes)} bytes (${number(machine.memoryBytes / 1024 ** 3, 2)} GiB)` : null],
      ['Operating system', [machine.platform, machine.release, machine.arch].filter(value => value !== undefined && value !== null).join(' · ')],
      ['Node.js', machine.node], ['Playwright', machine.playwright],
      ...ENGINES.map(engine => [ENGINE_NAMES[engine], `${rawText(dataset.browsers[engine].version)} · engine: ${rawText(dataset.browsers[engine].engine)}`]),
    ])}
    <details><summary>Recorded machine, browsers & method</summary><pre>${json({ machine, browsers: dataset.browsers, method: dataset.method })}</pre></details>
    <details><summary>HTML fingerprints <span>raw, Brotli & gzip · SHA-256</span></summary>
      <div class="build-hashes">${EDITIONS.map(edition => {
        const build = fingerprints.builds[edition.id];
        return `<section><h3>${edition.label}</h3>${metadataList([['Raw HTML', build.sha256], ['Brotli', build.brotliSha256], ['Gzip', build.gzipSha256]])}</section>`;
      }).join('')}</div>
    </details>
    <details><summary>Asset manifest <span>${manifest.assets.length} recorded assets</span></summary>
      ${metadataList([['Manifest path', manifest.path], ['Manifest SHA-256', manifest.sha256]])}
      ${fingerprintTable('Asset manifest entries · artifact bytes, not per-page traffic', manifest.assets, 'url')}
    </details>
    <details><summary>Source fingerprints <span>${fingerprints.sources.length} files</span></summary>${fingerprintTable('Measured sources', fingerprints.sources)}</details>
    <details><summary>Harness fingerprints <span>${fingerprints.harness.length} files</span></summary>${fingerprintTable('Measurement harness', fingerprints.harness)}</details>
    <details><summary>Run order, functional checks & per-card DOM counts</summary>
      <p class="fine">Per-card counts retain their recorded array order. They are not pooled into the timing or gallery summaries.</p>
      <pre>${json(ENGINES.flatMap(engine => dataset.method.viewports.flatMap(viewport => EDITIONS.flatMap(edition => dataset.runs
        .filter(run => run.engine === engine && run.profile === viewport.name && run.edition === edition.id)
        .sort((left, right) => left.round - right.round)
        .map(run => ({ engine: run.engine, profile: run.profile, edition: run.edition, round: run.round, position: run.position,
          perCard: run.nodes?.perCard, checks: run.checks, errors: run.errors, failures: run.failures, networkFailures: run.network?.failures }))))))}</pre>
    </details>
  </section>`;
}

const STYLES = `
  :root { color-scheme: dark; --ground: #141614; --panel: #1b1e1a; --ink: #f0f0e4; --muted: #b7bdb0; --accent: #d7e68a; --line: #444b3c; --quiet: #30362c; font: 14px/1.55 "Trebuchet MS", Verdana, sans-serif; color: var(--ink); background: var(--ground); }
  * { box-sizing: border-box; }
  html { scroll-padding-top: 24px; }
  body { margin: 0; }
  a { color: var(--accent); text-underline-offset: .22em; text-decoration-thickness: 1px; }
  a:hover { color: #f0ffc0; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 5px; }
  ::selection { color: var(--ground); background: var(--accent); }
  .shell { width: min(1480px, 100%); padding-inline: clamp(18px, 3.5vw, 52px); margin-inline: auto; }
  .skip { position: absolute; left: 18px; top: -100px; padding: 12px 18px; z-index: 2; background: var(--panel); }
  .skip:focus { top: 12px; }
  .masthead { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding-block: 23px; border-bottom: 1px solid var(--line); }
  .wordmark { color: var(--ink); text-decoration: none; font-size: 16px; font-weight: bold; letter-spacing: .12em; white-space: nowrap; }
  .wordmark span { color: var(--accent); }
  .masthead nav, .section-nav, .group-nav { display: flex; flex-wrap: wrap; gap: 8px 22px; }
  .masthead nav { font-size: 12px; }
  .masthead nav a { padding-block: 7px; }
  h1, h2, h3, p { margin-top: 0; }
  .hero { display: grid; grid-template-columns: minmax(0, 1fr) 300px; align-items: end; gap: 40px; padding-block: 50px 30px; }
  .eyebrow { color: var(--accent); font-size: 10px; letter-spacing: .16em; text-transform: uppercase; margin-bottom: 13px; }
  h1, h2 { font-family: "Palatino Linotype", "Book Antiqua", Georgia, serif; font-weight: 400; letter-spacing: -.04em; }
  h1 { font-size: clamp(43px, 5.7vw, 79px); line-height: 1.04; margin-bottom: 20px; }
  h1 em { color: var(--accent); font-weight: 400; }
  .intro { font-size: 15px; max-width: 690px; margin-bottom: 0; color: var(--muted); }
  .batch { padding: 20px; border: 1px solid var(--line); border-top: 2px solid var(--accent); background: var(--panel); }
  .batch-line { display: flex; align-items: baseline; gap: 12px; }
  .batch-line strong { font: 400 52px/1 Georgia, serif; letter-spacing: -.05em; color: var(--accent); }
  .batch-line span { font-size: 12px; color: var(--muted); }
  .batch p { margin-block: 10px 16px; color: var(--muted); font-size: 11px; overflow-wrap: anywhere; }
  .download { display: inline-block; padding: 11px 15px; color: var(--ground); background: var(--accent); text-decoration: none; font-size: 12px; font-weight: bold; border: 1px solid var(--accent); }
  .download:hover { color: var(--ground); background: #e7f4af; }
  .edition-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-block: 1px solid var(--line); }
  .edition-link { padding: 16px 18px; border-right: 1px solid var(--line); color: var(--ink); text-decoration: none; }
  .edition-link:first-child { padding-left: 0; }
  .edition-link:last-child { border-right: 0; }
  .edition-link b { font-size: 14px; font-weight: 400; }
  .edition-link span { display: block; color: var(--muted); margin-top: 4px; font-size: 11px; }
  .edition-link .index { display: inline; color: var(--accent); font: 11px "Courier New", monospace; margin-right: 10px; }
  .scope-note { border-left: 2px solid var(--accent); padding: 13px 18px; margin-block: 22px 16px; background: var(--panel); color: var(--muted); font-size: 12px; max-width: 1100px; }
  .scope-note strong { color: var(--ink); font-weight: 400; }
  .section-nav { font-size: 12px; padding-block: 6px; }
  .section-nav a { padding-block: 6px; }
  .section { margin-top: 46px; }
  .section-heading { display: flex; align-items: baseline; gap: 15px; margin-bottom: 15px; }
  .section-number { font: 12px "Courier New", monospace; color: var(--accent); }
  h2 { font-size: clamp(27px, 3vw, 38px); line-height: 1.18; margin-bottom: 0; }
  .section-copy { max-width: 940px; color: var(--muted); font-size: 13px; margin-bottom: 18px; }
  .section-copy strong { color: var(--ink); font-weight: 400; }
  .group-nav { gap: 8px; margin-block: 20px 26px; }
  .group-nav a { border: 1px solid var(--line); padding: 9px 12px; color: var(--ink); font-size: 11px; text-decoration: none; }
  .group-nav a:hover { border-color: var(--accent); color: var(--accent); }
  .result-group { padding-top: 22px; margin-top: 32px; border-top: 1px solid var(--accent); }
  .group-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 16px; }
  .group-heading .eyebrow { margin-bottom: 8px; }
  .group-heading h3 { font-size: 21px; line-height: 1.3; font-weight: 400; margin: 0; }
  .group-heading h3 span { color: var(--muted); font-size: 15px; margin-left: 8px; overflow-wrap: anywhere; }
  .group-meta { color: var(--muted); font-size: 11px; text-align: right; margin: 0; flex-shrink: 0; }
  .results-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; align-items: start; }
  .table-scroll { overflow-x: auto; max-width: 100%; min-width: 0; border: 1px solid var(--line); scrollbar-color: var(--line) var(--ground); }
  table { border-collapse: collapse; width: 100%; text-align: left; font-size: 12px; font-variant-numeric: tabular-nums; }
  caption { text-align: left; color: var(--ink); padding: 12px 13px; border-bottom: 1px solid var(--line); background: var(--panel); font-size: 12px; }
  th, td { padding: 10px 11px; border-bottom: 1px solid var(--quiet); vertical-align: middle; }
  thead th { font-size: 11px; font-weight: 400; color: var(--muted); padding-block: 11px; background: var(--panel); }
  tbody th { font-weight: 400; }
  tbody tr:last-child > * { border-bottom: 0; }
  tbody tr:hover { background: #20251d; }
  .metrics { min-width: 602px; table-layout: fixed; }
  .metrics th:first-child { width: 30%; }
  .metrics td, .metrics thead th:not(:first-child) { text-align: right; }
  .heading-note, .row-note { display: block; font-size: 10px; line-height: 1.5; color: var(--muted); margin-top: 3px; }
  .heading-note { font-size: 9px; }
  .value { display: block; color: var(--ink); white-space: nowrap; font-size: 14px; line-height: 1.3; }
  .unit { font-size: 10px; color: var(--muted); }
  .range { display: block; font-size: 10px; color: var(--muted); line-height: 1.55; margin-top: 3px; white-space: nowrap; }
  .unavailable { display: block; font-size: 11px; color: var(--muted); }
  .row-group th { color: var(--accent); font-size: 10px; letter-spacing: .015em; background: var(--panel); padding-block: 7px; text-align: left; }
  details { border-top: 1px solid var(--line); margin-top: 12px; }
  summary { padding: 13px 2px; cursor: pointer; color: var(--accent); font-size: 12px; }
  summary span { color: var(--muted); font-size: 11px; margin-left: 8px; }
  details > p { font-size: 12px; color: var(--muted); max-width: 1000px; }
  details .table-scroll { margin-bottom: 14px; }
  .network-detail { border-top: 0; margin-top: 3px; }
  .network-detail .metrics { table-layout: auto; }
  .fine { font-size: 11px; line-height: 1.65; color: var(--muted); }
  .fine a { white-space: nowrap; }
  .artifact-table { min-width: 520px; }
  .artifact-table td, .artifact-table thead th:not(:first-child) { text-align: right; }
  .artifact-table tbody td { font-size: 15px; }
  .artifact-table th, .artifact-table td { padding: 14px; }
  .metadata { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 30px; margin-block: 22px; }
  .metadata > div { min-width: 0; padding-block: 12px; border-top: 1px solid var(--quiet); }
  dt { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  dd { margin: 5px 0 0; font-size: 12px; overflow-wrap: anywhere; }
  pre { padding: 16px; margin: 0 0 18px; max-height: 440px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; background: var(--panel); color: var(--muted); font: 11px/1.65 Consolas, "Courier New", monospace; }
  code { font: 11px/1.6 Consolas, "Courier New", monospace; overflow-wrap: anywhere; }
  .build-hashes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
  .build-hashes h3 { font-size: 13px; font-weight: 400; margin-bottom: 8px; }
  .build-hashes .metadata { grid-template-columns: 1fr; margin-top: 0; }
  .build-hashes dd { font: 11px/1.6 Consolas, "Courier New", monospace; }
  .fingerprints { min-width: 670px; table-layout: fixed; }
  .fingerprints th:first-child { width: 37%; }
  .fingerprints th:nth-child(2) { width: 14%; }
  .fingerprints td:nth-child(2) { white-space: nowrap; }
  .hash { word-break: break-all; }
  .limits { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 34px; }
  .limits > div { border-top: 1px solid var(--line); padding-top: 16px; margin-top: 10px; }
  .limits h3 { font-size: 13px; color: var(--accent); font-weight: 400; margin-bottom: 8px; }
  .limits p { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
  footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 14px; border-top: 1px solid var(--accent); padding-block: 22px 32px; margin-top: 40px; color: var(--muted); font-size: 11px; }
  footer p { margin: 0; }
  @media (max-width: 1280px) { .results-grid { grid-template-columns: 1fr; } .metrics { table-layout: auto; } }
  @media (max-width: 760px) {
    .masthead { align-items: flex-start; flex-direction: column; gap: 10px; }
    .masthead nav { gap: 4px 16px; }
    .hero { grid-template-columns: 1fr; gap: 24px; padding-top: 32px; }
    .batch { max-width: none; }
    .batch-line strong { font-size: 40px; }
    .edition-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .edition-link { padding: 14px 10px; }
    .edition-link:nth-child(2n) { border-right: 0; }
    .edition-link:nth-child(3) { padding-left: 0; }
    .edition-link:nth-child(-n+2) { border-bottom: 1px solid var(--line); }
    .edition-link b { font-size: 12px; }
    .edition-link .index { margin-right: 5px; }
    .group-heading { align-items: flex-start; flex-direction: column; gap: 8px; }
    .group-meta { text-align: left; }
    .group-heading h3 span { display: block; margin-left: 0; margin-top: 4px; }
    .metadata, .build-hashes, .limits { grid-template-columns: 1fr; }
    .section { margin-top: 36px; }
    summary span { display: block; margin-left: 16px; }
  }
  @media print {
    :root { color-scheme: light; --ground: #fff; --panel: #f4f5ee; --ink: #172014; --muted: #485141; --accent: #405019; --line: #969e8c; --quiet: #d7dbd1; }
    .shell { width: 100%; padding-inline: 0; }
    .skip, .download, .section-nav, .group-nav { display: none; }
    .hero { padding-top: 24px; }
    h1 { font-size: 42px; }
    .results-grid { grid-template-columns: 1fr; }
    .table-scroll { overflow: visible; }
    table.metrics, .artifact-table, .fingerprints { min-width: 0; }
    th, td { padding: 7px; }
    .result-group { break-before: page; }
    tr { break-inside: avoid; }
    a { color: inherit; }
  }
`;

export function renderReport(dataset) {
  requireDataset(dataset);
  const groups = ENGINES.flatMap(engine => dataset.method.viewports.map(viewport => ({ engine, viewport })));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="icon" href="data:,">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#141614">
  <meta name="description" content="Revision 2 of The Twelve: four football card rendering approaches, measured across Edge and WebKit with complete traffic and reproducible provenance.">
  <title>The Twelve — Revision 2 benchmark report</title>
  <style>${STYLES}</style>
</head>
<body>
  <a class="skip" href="#main">Skip to report</a>
  <div class="shell">
    <header class="masthead"><a class="wordmark" href="/collections/">THE <span>TWELVE</span></a>
      <nav aria-label="Collections and reference"><a href="/collections/">All collections ↗</a><a href="/compare/">R1 report</a><a href="/revision-2/reference">Reference ↗</a><a href="data.json" download>Raw JSON ↓</a></nav>
    </header>
    <main id="main">
      <div class="hero"><div><p class="eyebrow">Collection 02 / Measurement report</p><h1>Four approaches.<br><em>One measured field.</em></h1><p class="intro">Revision 2 football cards, across two browser engines and two viewport profiles. Read the rendering cost alongside the artwork constraints, full page traffic and the machine that produced it.</p></div>
        <aside class="batch" aria-label="Completed benchmark batch"><div class="batch-line"><strong>${dataset.runs.length}</strong><span>completed runs<br>4 rounds × 4 editions × 4 groups</span></div><p>Completed <time datetime="${escapeHTML(dataset.completedAt)}">${escapeHTML(dataset.completedAt)}</time></p><a class="download" href="data.json" download>Download raw JSON ↓</a></aside>
      </div>
      <nav class="edition-strip" aria-label="Revision 2 editions">${EDITIONS.map((edition, index) => `<a class="edition-link" href="/revision-2/${edition.id}/"><b><span class="index">R2 / 0${index + 1}</span>${edition.label} ↗</b><span>${edition.detail}</span></a>`).join('')}</nav>
      <p class="scope-note"><strong>R2 is not directly comparable with R1:</strong> new content, workload and viewport definitions. These are headless, DPR 1, unthrottled localhost measurements. Windows WebKit is not Mac Safari or a phone. There is no pixel-perfect comparison or universal winner.</p>
      <nav class="section-nav" aria-label="Report sections"><a href="#measurements">01 / Measurements</a><a href="#html-size">02 / HTML sizes</a><a href="#provenance">03 / Provenance</a><a href="#reading">04 / How to read this</a></nav>
      <section class="section" id="measurements" aria-labelledby="measurements-title">
        <div class="section-heading"><span class="section-number">01</span><h2 id="measurements-title">The measured workload.</h2></div>
        <p class="section-copy">Each cell is the <strong>median [min–max] across four run-level scalars</strong> for one edition, engine and viewport. A median, p95 or max row summarizes the four recorded medians, p95s or maxima respectively; samples are never pooled across runs. First-open p95 is the maximum of 12 opens under the nearest-rank rule. Four replicates show observed spread, not confidence intervals.</p>
        <p class="fine">Timing units: milliseconds. Traffic units: KiB (1,024 bytes). “Unavailable” preserves missing or unsupported measurements, including null FCP; no value is replaced with zero. Partial reporting shows n/4 and receives no four-round summary. Tables scroll horizontally on narrow screens.</p>
        <nav class="group-nav" aria-label="Engine and viewport groups">${groups.map(({ engine, viewport }, index) => `<a href="#group-${index + 1}">${ENGINE_NAMES[engine]} / ${escapeHTML(viewport.name)} · ${escapeHTML(viewport.width)} × ${escapeHTML(viewport.height)}</a>`).join('')}</nav>
        ${groups.map(({ engine, viewport }, index) => groupSection(dataset, engine, viewport, index + 1)).join('\n')}
        <p class="fine">Cold and total traffic include the HTML document and requested assets. Total workload is cumulative and already includes cold navigation; do not add the two. Encoded and decoded bodies are different representations of the same responses. Browser response transfer is separately reported where supported, never synthesized from file sizes.</p>
      </section>
      <section class="section" id="html-size" aria-labelledby="html-size-title">
        <div class="section-heading"><span class="section-number">02</span><h2 id="html-size-title">HTML, on its own.</h2></div>
        <p class="section-copy">Exact build-artifact byte sizes. Raw, Brotli and gzip are separate representations of each edition’s HTML, including embedded content. These sizes exclude separately requested assets and do not establish which encoding the browser received.</p>
        <div class="table-scroll" role="region" aria-label="HTML artifact sizes in bytes" tabindex="0"><table class="artifact-table"><caption>Measured HTML artifacts · exact bytes (B)</caption><thead><tr><th scope="col">R2 edition</th><th scope="col">Raw HTML</th><th scope="col">Brotli (.br)</th><th scope="col">Gzip (.gz)</th></tr></thead><tbody>${EDITIONS.map(edition => {
          const build = dataset.fingerprints.builds[edition.id];
          return `<tr><th scope="row"><a href="/revision-2/${edition.id}/">${edition.label}</a></th><td>${bytes(build.rawBytes)}</td><td>${bytes(build.brotliBytes)}</td><td>${bytes(build.gzipBytes)}</td></tr>`;
        }).join('')}</tbody></table></div>
      </section>
      ${provenance(dataset)}
      <section class="section" id="reading" aria-labelledby="reading-title">
        <div class="section-heading"><span class="section-number">04</span><h2 id="reading-title">Keep the numbers in context.</h2></div>
        <div class="limits">
          <div><h3>Art direction changes the comparison</h3><p>SVG, CSS shapes and CSS primitives are authored interpretations. The CSS-shapes approach includes polygons and curved CSS paths; the primitives approach excludes both. Hybrid uses approximately 550 × 700 px source art with live text. A 1280px export adds no source-art detail. This is not a pixel-perfect comparison, and the measurements establish no universal winner. No actual Discord implementation was benchmarked, so these results cannot establish beating it.</p></div>
          <div><h3>One revision, one workload</h3><p>R2 is not directly comparable with <a href="/compare/">R1</a>: content, workload and viewport definitions changed. All R2 editions share the full editor. PNG export is excluded from these measurements; its rendering and download costs are not represented.</p></div>
          <div><h3>Desktop engines, emulated layouts</h3><p>Runs use headless browsers at DPR 1, unthrottled CPU and network, on localhost. A narrow viewport models layout, not phone hardware. Playwright WebKit on Windows is not Mac Safari, iOS Safari or a real phone; do not generalize these timings to those devices.</p></div>
          <div><h3>“Ready” is a harness checkpoint</h3><p>Timing starts immediately before the programmatic click: two requestAnimationFrame (RAF) callbacks, then an image-ready/decode await (empty for pure CSS), then two additional callbacks. The 2 RAFs row stops at the original second callback; ready includes the full sequence. The stored “decoded” endpoint is elapsed time, not CPU decode time. Callbacks offer rendering opportunities, with no guarantee of actual presentation. This is not INP.</p></div>
          <div><h3>Fixed order limits attribution</h3><p>All 12 cards first-open in fixed order, with the same card first each run. Card identity and order are confounded, especially first-modal overhead. Warm browsing starts only after all 12 first opens; it does not measure cold switching.</p></div>
          <div><h3>Read p95 alongside max</h3><p>Warm browsing records 180 RAF intervals with only 12 card changes; its p95 is not specific to transitions. Warm browse and scroll each use 180 intervals: nearest-rank p95 selects rank 171, leaving the nine largest intervals beyond its rank. Max exposes the worst interval. These are callback intervals, not display FPS; headless scheduling and instrumentation affect them.</p></div>
          <div><h3>Four replicates, no confidence intervals</h3><p>Each summary uses four separately recorded run values within its engine/viewport/edition group. The median is the midpoint of the two central values; brackets show the smallest and largest run values. Four replicates are not confidence intervals, and small differences need more evidence.</p></div>
          <div><h3>Read availability literally</h3><p>FCP remains unavailable when the browser does not expose it; observed gallery readiness is a separate harness measurement. Null response transfer, request bytes or response headers remain unavailable even when body accounting is complete. A recorded zero is distinct from an unavailable value. A Resource-Timing-only favicon needs matching evidence from the original server response; a later fetch of the icon cannot establish its status or hash.</p></div>
        </div>
      </section>
    </main>
    <footer><p>The Twelve / Revision 2 · schema ${escapeHTML(dataset.schemaVersion)} · batch <code>${escapeHTML(dataset.batchId)}</code></p><p><a href="/collections/">All collections</a> &nbsp; / &nbsp; <a href="data.json" download>Download raw JSON</a></p></footer>
  </div>
</body>
</html>`;
}
