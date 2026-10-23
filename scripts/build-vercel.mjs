import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstat, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { publishedBenchHTML } from './bench-navigation.mjs';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const output = path.resolve(root, 'site');
assert.equal(path.dirname(output), root, 'Output must be the site directory immediately inside the project');
assert.equal(path.basename(output), 'site');

// Refuse links/junctions before deleting: never follow a site directory elsewhere.
try {
  const info = await lstat(output);
  assert(info.isDirectory() && !info.isSymbolicLink(), 'site must be a real directory, not a link');
  assert.equal(await realpath(output), output, 'site resolves outside its expected location');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

for (const script of ['build.mjs', 'benchmarks/four-build-report.mjs', 'revision-2/build.mjs', 'revision-2/build-hub.mjs', 'revision-2/benchmarks/report.mjs']) {
  const result = spawnSync(process.execPath, [script], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${script} failed; refusing to publish an unvalidated build`);
}

// Only these files and the verified asset manifests may be published.
// In particular, do not copy dist wholesale: it contains raw development sources.
const files = [
  ['dist/collections/index.html', 'index.html'],
  ['dist/collections/index.html', 'collections/index.html'],
  ['assets/favicon.ico', 'favicon.ico'],
  ['dist/hosted.html', 'original/index.html'],
  ['dist/css.html', 'css/index.html'],
  ['dist/basic.html', 'basic/index.html'],
  ['dist/hybrid.html', 'hybrid/index.html'],
  ['bench/index.html', 'bench/index.html'],
  ['benchmarks/combined.json', 'bench/data.json'],
  ['dist/hosted.html', 'source/svg'],
  ['dist/css.html', 'source/css'],
  ['dist/basic.html', 'source/basic'],
  ['dist/hybrid-source.zip', 'source/hybrid'],
  ['assets/reference.png', 'reference'],
  ['dist/revision-2/reference', 'revision-2/reference'],
  ['dist/revision-2/benchmarks/index.html', 'revision-2/benchmarks/index.html'],
  ['dist/revision-2/benchmarks/data.json', 'revision-2/benchmarks/data.json'],
];
for (const edition of ['svg', 'css', 'basic', 'hybrid']) {
  const htmlPath = `dist/revision-2/${edition}/index.html`;
  const html = await readFile(path.join(root, htmlPath));
  for (const [suffix, decode] of [['.gz', gunzipSync], ['.br', brotliDecompressSync]]) {
    assert(decode(await readFile(path.join(root, htmlPath + suffix))).equals(html), `${htmlPath}${suffix}: stale compressed HTML`);
  }
  if (edition !== 'hybrid') {
    assert((await readFile(path.join(root, `dist/revision-2/source/${edition}`))).equals(html), `Revision 2 ${edition}: source download differs from current HTML`);
  }
  files.push([htmlPath, `revision-2/${edition}/index.html`], [`dist/revision-2/source/${edition}`, `revision-2/source/${edition}`]);
}
const seen = new Set();
for (const [manifestPath, prefix] of [['dist/hybrid-assets.json', 'hybrid'], ['dist/revision-2/assets-manifest.json', 'revision-2']]) {
  const manifest = JSON.parse(await readFile(path.join(root, manifestPath), 'utf8'));
  assert(Array.isArray(manifest) && manifest.length > 0, `${prefix}: asset manifest is missing or empty`);
  const pattern = new RegExp(`^/${prefix}/assets/([A-Za-z0-9][A-Za-z0-9@._-]*\\.([a-f0-9]{12})\\.(?:webp|avif|woff2|png|svg))$`);
  for (const asset of manifest) {
    const match = pattern.exec(asset.url);
    assert(match && !seen.has(asset.url), `Invalid or duplicate asset: ${asset.url}`);
    seen.add(asset.url);
    const source = `dist/${prefix}/assets/${match[1]}`;
    const bytes = await readFile(path.join(root, source));
    const digest = createHash('sha256').update(bytes).digest('hex');
    assert.equal(digest, asset.sha256, `Asset fingerprint mismatch: ${asset.url}`);
    assert.equal(digest.slice(0, 12), match[2], `Asset filename hash mismatch: ${asset.url}`);
    assert.equal(bytes.length, asset.bytes, `Asset length mismatch: ${asset.url}`);
    files.push([source, asset.url.slice(1)]);
  }
}

// The upstream validator stamps its report with the wall clock. The published
// copy instead identifies the measurement snapshot, so repeated builds agree.
// Neither benchmark inputs nor the measured edition HTML are altered here.
const data = JSON.parse(await readFile(path.join(root, 'benchmarks/four-combined.json'), 'utf8'));
const snapshotTime = Math.max(Date.parse(data.main.completedAt), Date.parse(data.webkit.completedAt));
assert(Number.isFinite(snapshotTime), 'The report needs valid measurement dates');
data.generatedAt = new Date(snapshotTime).toISOString();
let report = await readFile(path.join(root, 'benchmarks/four-report-template.html'), 'utf8');
const marker = '/*FOUR_BENCHMARK_DATA*/null';
assert.equal(report.split(marker).length, 2, 'Unexpected report template');
const payload = JSON.stringify(data).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
report = report.replace(marker, () => payload).replace("'Report generated: '", "'Measurement snapshot: '");

await rm(output, { recursive: true, force: true });
await mkdir(output);
const publication = [];
async function publish(target, bytes) {
  const destination = path.join(output, target);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  publication.push({ path: target, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
for (const [source, target] of files) {
  const bytes = await readFile(path.join(root, source));
  if (target === 'favicon.ico') assert.equal(bytes.length, 0, 'The default favicon must remain empty; strict CSS editions cannot load image artwork');
  await publish(target, target === 'bench/index.html' ? publishedBenchHTML(bytes) : bytes);
}
await publish('compare/index.html', Buffer.from(report));
await publish('compare/data.json', Buffer.from(JSON.stringify(data, null, 2) + '\n'));
// The Tailnet publisher consumes this private inventory, never a directory copy.
await writeFile(path.join(root, 'dist/public-files.json'), JSON.stringify(publication, null, 2) + '\n');
console.log(`Static site ready: ${publication.length} allowlisted files in site/ (${seen.size} hashed assets across both revisions).`);
