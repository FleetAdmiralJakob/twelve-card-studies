import {fileURLToPath} from 'node:url';
import {resolve, dirname, relative, sep} from 'node:path';
import {readFile, readdir, realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {realpathSync} from 'node:fs';
import {gunzipSync, brotliDecompressSync} from 'node:zlib';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const fromRoot = path => resolve(ROOT, path);
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const FAVICON = Object.freeze({path:'assets/favicon.ico', url:'/favicon.ico', bytes:0, sha256:sha256(Buffer.alloc(0)), contentType:'image/x-icon'});
export const AUXILIARY_AUDIT = Object.freeze({path:'/revision-2/__benchmark/auxiliary', schemaVersion:1, limit:2048, matchToleranceMs:25});
export const readJSON = async path => JSON.parse((await readFile(fromRoot(path), 'utf8')).replace(/^\uFEFF/, ''));
// The user's C: workspace can be a junction into H:. URLs alone do not identify the entrypoint.
export function isMain(moduleURL) {
  if (!process.argv[1]) return false;
  const canonical = path => {
    const resolved=realpathSync(path);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
  };
  return canonical(process.argv[1]) === canonical(fileURLToPath(moduleURL));
}
export const editions = ['svg', 'css', 'basic', 'hybrid'].map(id => ({id, route:`/revision-2/${id}/`}));
export const viewports = [{name:'desktop', width:1440, height:1080}, {name:'mobile', width:390, height:844}];
export const ENGINES = ['edge', 'webkit'];
export const CONTEXT_OPTIONS = {deviceScaleFactor:1, serviceWorkers:'block', locale:'en-US', timezoneId:'UTC', colorScheme:'dark', reducedMotion:'no-preference', isMobile:false, hasTouch:false};
export const WORKLOAD = {baselineFrames:30, firstOpens:12, browseFrames:180, browseEvery:15, scrollFrames:180, minimumScrollDistance:80};
export const launchOptions = engine => engine === 'edge' ? {headless:true, channel:'msedge'} : {headless:true};
export const editionOrder = round => [...editions.slice(round % 4), ...editions.slice(0, round % 4)].map(e => e.id);

export async function fingerprintFile(path) {
  const file = await realpath(fromRoot(path));
  if (!file.startsWith((await realpath(ROOT)) + sep)) throw new Error(`File escapes repository: ${path}`);
  const bytes = await readFile(file);
  return {path:path.replaceAll('\\', '/'), bytes:bytes.length, sha256:sha256(bytes)};
}
async function filesIn(path) {
  const entries = await readdir(fromRoot(path), {withFileTypes:true});
  const files = [];
  for (const entry of entries.sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not a frozen source: ${path}/${entry.name}`);
    if (entry.isDirectory()) files.push(...await filesIn(`${path}/${entry.name}`));
    else if (entry.isFile()) files.push(`${path}/${entry.name}`);
  }
  return files;
}
async function sourcePaths() {
  // Follow only literal local module imports. Explicit seeds cover build.mjs's dynamic art groups.
  const paths = new Set(['revision-2/build.mjs', 'revision-2/prepare-assets.mjs', 'revision-2/app.js', 'revision-2/style.css', 'revision-2/export.js', 'revision-2/cards.mjs', 'revision-2/flags.mjs', 'assets/fonts.css', 'basic-art/flags.css', 'css-art/flags.css', FAVICON.path]);
  for (const group of ['metal', 'energy', 'expressive']) paths.add(`revision-2/art/${group}/index.mjs`);
  for (const path of paths) {
    if (!/\.(?:m?js|css)$/.test(path)) continue;
    const source = await readFile(fromRoot(path), 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"\r\n]+)['"]/g)) {
      const dependency = relative(ROOT, resolve(dirname(fromRoot(path)), match[1])).replaceAll('\\', '/');
      if (/\.(?:m?js|css)$/.test(dependency)) paths.add(dependency);
    }
  }
  for (const path of await filesIn('revision-2/assets')) paths.add(path);
  for (const path of await filesIn('assets/flags')) paths.add(path);
  for (const path of await filesIn('assets')) if (/\.(?:woff2?|ttf)$/.test(path) || /LICENSE\.txt$/.test(path)) paths.add(path);
  for (const path of ['package.json', 'package-lock.json']) paths.add(path);
  return [...paths].sort();
}

export async function fingerprints() {
  const builds = {};
  for (const {id} of editions) {
    const path = `dist/revision-2/${id}/index.html`;
    const [raw, gzip, brotli] = await Promise.all(['', '.gz', '.br'].map(suffix => readFile(fromRoot(path + suffix))));
    if (!gunzipSync(gzip).equals(raw) || !brotliDecompressSync(brotli).equals(raw)) throw new Error(`${id}: stale compressed HTML variant`);
    builds[id] = {path, rawBytes:raw.length, gzipBytes:gzip.length, brotliBytes:brotli.length, sha256:sha256(raw), gzipSha256:sha256(gzip), brotliSha256:sha256(brotli)};
  }
  const manifestPath = 'dist/revision-2/assets-manifest.json';
  const manifestFile = await fingerprintFile(manifestPath);
  const listed = await readJSON(manifestPath);
  if (!Array.isArray(listed) || !listed.length) throw new Error('R2 asset manifest must list built assets');
  const seen = new Set();
  for (const asset of listed) {
    if (!/^\/revision-2\/assets\/[A-Za-z0-9_@.-]+$/.test(asset.url) || seen.has(asset.url)) throw new Error(`Invalid/duplicate asset URL: ${asset.url}`);
    seen.add(asset.url);
    const actual = await fingerprintFile(`dist${asset.url}`);
    if (actual.sha256 !== asset.sha256 || actual.bytes !== asset.bytes) throw new Error(`Asset manifest mismatch: ${asset.url}`);
  }
  const harnessPaths = ['config.mjs', 'run.mjs', 'profile.mjs', 'network.mjs', 'auxiliary.mjs', 'serve.mjs', 'server-audit.mjs', 'report.mjs', 'report-view.mjs'].map(file => `revision-2/benchmarks/${file}`);
  // The unchanged R1 observer imports its own hash helper. Both dependencies are fingerprinted.
  harnessPaths.push('benchmarks/four-network.mjs', 'benchmarks/four-config.mjs');
  const sources=await Promise.all((await sourcePaths()).map(fingerprintFile));
  const favicon=sources.find(source => source.path === FAVICON.path);
  if (favicon?.bytes !== FAVICON.bytes || favicon.sha256 !== FAVICON.sha256) throw new Error('assets/favicon.ico must remain the known empty auxiliary response');
  return {
    builds,
    assetManifest:{...manifestFile, assets:listed},
    sources,
    harness:await Promise.all(harnessPaths.sort().map(fingerprintFile)),
  };
}
export function assertSameFingerprints(expected, actual) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('Frozen HTML, compression, manifest, assets, source/art or harness changed. Remeasure after freezing; do not rewrite snapshot hashes.');
}
export function functionalFailures(run) {
  const failures = [...(run.errors || [])];
  const expected = {cards:12, stats:72, horizontalOverflow:false, dialogOpened:true, wrap:true, firstPosition:true, editPersisted:true, stateAPI:true, fullEditor:true, scrollExercised:true, artworkPresent:true};
  for (const [key, value] of Object.entries(expected)) if (run.checks?.[key] !== value) failures.push(`Check ${key}: expected ${value}, got ${run.checks?.[key]}`);
  if (!Array.isArray(run.checks?.brokenImages) || run.checks.brokenImages.length) failures.push('Image decode checks missing or failed');
  if (run.edition !== run.expectedEdition || run.revision !== 2) failures.push('Page identifies the wrong edition/revision');
  if (run.openCards?.length !== 12 || run.baselineFrames?.n !== 30 || run.browseFrames?.n !== 180 || run.scrollFrames?.n !== 180) failures.push('Incomplete workload samples');
  return failures;
}
