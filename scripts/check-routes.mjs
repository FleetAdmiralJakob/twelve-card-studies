import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';
import { createPreviewServer } from './preview.mjs';
import { validateBuildHistory } from '../benchmarks/four-build-history.mjs';
import { publishedBenchHTML } from './bench-navigation.mjs';
import { publishedGithubHTML } from './github-navigation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFile(path.join(root, file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(await read('dist/hybrid-assets.json'));
const revision2Manifest = JSON.parse(await read('dist/revision-2/assets-manifest.json'));
const editionIds = ['svg', 'css', 'basic', 'hybrid'];
const originalRoutes = ['/original/', '/css/', '/basic/', '/hybrid/'];
const revision2Routes = editionIds.map(id => `/revision-2/${id}/`);
const files = [
  'index.html', 'collections/index.html', 'original/index.html', 'css/index.html', 'basic/index.html', 'hybrid/index.html',
  'compare/index.html', 'compare/data.json', 'bench/index.html', 'bench/data.json',
  'source/svg', 'source/css', 'source/basic', 'source/hybrid', 'reference', 'favicon.ico',
  ...manifest.map(asset => asset.url.slice(1)),
  'revision-2/reference', 'revision-2/benchmarks/index.html', 'revision-2/benchmarks/data.json',
  ...editionIds.flatMap(id => [`revision-2/${id}/index.html`, `revision-2/source/${id}`]),
  ...revision2Manifest.map(asset => asset.url.slice(1)),
];
async function listFiles(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `Unexpected output link: ${prefix}${entry.name}`);
    if (entry.isDirectory()) result.push(...await listFiles(path.join(directory, entry.name), `${prefix}${entry.name}/`));
    else result.push(prefix + entry.name);
  }
  return result.sort();
}
assert.deepEqual(await listFiles(path.join(root, 'site')), files.sort(), 'site must contain exactly the public allowlist');
const publication = JSON.parse(await read('dist/public-files.json'));
assert.deepEqual(publication.map(file => file.path).sort(), files, 'Tailnet publication inventory must match the public allowlist');
for (const file of publication) {
  const bytes = await read(`site/${file.path}`);
  assert.equal(hash(bytes), file.sha256, `${file.path}: publication hash`);
  assert.equal(bytes.length, file.bytes, `${file.path}: publication length`);
}

const server = await createPreviewServer();
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
let requests = 0;
const request = async (route, options = {}) => {
  requests++;
  return fetch(origin + route, { ...options, redirect: 'manual', signal: AbortSignal.timeout(10000) });
};
const noImages = "default-src 'self'; img-src 'none'; object-src 'none'; font-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'";
const githubRepo = 'https://github.com/FleetAdmiralJakob/twelve-card-studies';
const githubSourceFolders = {
  'index.html': '', 'collections/index.html': '',
  'original/index.html': 'themes', 'css/index.html': 'css-art', 'basic/index.html': 'basic-art', 'hybrid/index.html': 'hybrid-art',
  ...Object.fromEntries(['svg', 'css', 'basic'].map(id => [`revision-2/${id}/index.html`, 'revision-2/art'])),
  'revision-2/hybrid/index.html': 'revision-2',
  'bench/index.html': 'benchmarks', 'compare/index.html': 'benchmarks', 'revision-2/benchmarks/index.html': 'revision-2/benchmarks',
};
function checkGithubNavigation(baseline, published, target) {
  // Latin-1 preserves every byte while comparing regions, including UTF-8 text.
  const before = baseline.toString('latin1');
  const after = published.toString('latin1');
  const code = text => [...text.matchAll(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi)].map(match => match[0]);
  assert.deepEqual(code(after), code(before), `${target}: scripts, embedded report data and styles must remain byte-identical`);
  const isHub = ['index.html', 'collections/index.html'].includes(target);
  const isReport = ['compare/index.html', 'bench/index.html', 'revision-2/benchmarks/index.html'].includes(target);
  const navigation = isHub
    ? /<nav\b[^>]*\bclass="top-nav"[^>]*>[\s\S]*?<\/nav\s*>|<footer\b[^>]*>[\s\S]*?<\/footer\s*>/gi
    : /<footer\b[^>]*>[\s\S]*?<\/footer\s*>/gi;
  const regions = [...after.matchAll(navigation)].map(match => match[0]);
  assert.equal([...before.matchAll(navigation)].length, isHub ? 2 : 1, `${target}: unexpected source navigation boundaries`);
  assert.equal(regions.length, isHub ? 2 : 1, `${target}: navigation containers were added or removed`);
  const unwrapped = isHub ? after.replace('<header style="flex-wrap:wrap;gap:16px">', '<header>') : after;
  assert.equal(unwrapped.replace(navigation, '<publication-navigation>'), before.replace(navigation, '<publication-navigation>'), `${target}: bytes outside the existing footer${isHub ? ' and hub navigation/wrapping attribute' : ''} changed`);
  const attribute = (attributes, name) => new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, 'i').exec(attributes)?.[2];
  const links = [...after.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)]
    .filter(match => attribute(match[1], 'data-repository-link') || attribute(match[1], 'href')?.startsWith(githubRepo));
  assert.equal(links.length, isHub ? 3 : 2, `${target}: unexpected repository navigation links`);
  assert(Object.hasOwn(githubSourceFolders, target), `${target}: expected repository source mapping missing`);
  const folder = githubSourceFolders[target];
  const sourceURL = `${githubRepo}/tree/main${folder ? '/' + folder : ''}`;
  assert(links.some(match => attribute(match[1], 'href') === githubRepo && attribute(match[1], 'data-repository-link') === 'github' && /GitHub/i.test(match[2].replace(/<[^>]*>/g, ''))), `${target}: visible GitHub repository link missing`);
  assert(links.some(match => attribute(match[1], 'data-repository-link') === 'source' && attribute(match[1], 'href') === sourceURL), `${target}: contextual repository source link missing`);
  for (const link of links) {
    assert(regions.some(region => region.includes(link[0])), `${target}: GitHub link must be in existing header/footer navigation`);
    const kind = attribute(link[1], 'data-repository-link');
    assert(['github', 'source'].includes(kind), `${target}: unexpected repository link kind`);
    assert.equal(attribute(link[1], 'href'), kind === 'github' ? githubRepo : sourceURL, `${target}: incorrect repository destination`);
    assert.equal(attribute(link[1], 'target'), '_blank', `${target}: GitHub links must open a new tab`);
    const rel = attribute(link[1], 'rel')?.toLowerCase().split(/\s+/) ?? [];
    assert(rel.includes('noopener') && rel.includes('noreferrer'), `${target}: GitHub link must use rel="noopener noreferrer"`);
    assert(link[2].replace(/<[^>]*>/g, '').trim(), `${target}: GitHub links need visible text`);
    assert.doesNotMatch(link[1], /\s(?:hidden\b|aria-hidden\s*=\s*["']true["'])/i, `${target}: GitHub link is hidden`);
  }
  const disclosure = /<p data-repository-disclosure\b[^>]*>[\s\S]*?<\/p>/g;
  assert.equal([...after.matchAll(disclosure)].length, isReport ? 1 : 0, `${target}: unexpected publication disclosure count`);
  if (isReport) {
    const footer = regions[0];
    const disclosureText = target === 'compare/index.html'
      ? 'Repository navigation was added after timing without changing current artwork or interaction code. Separately, current Revision 1 V4 includes flag-frame, comic-title and PNG-export polish that has not been benchmarked; the figures describe archived builds. Source downloads contain the validated current build.'
      : 'Repository navigation was added after timing; measured artwork, interaction code and benchmark records are unchanged. Published pages include these links; source downloads retain the validated build.';
    assert(footer.includes('>' + disclosureText + '</p>'), `${target}: report footer must disclose navigation and any unmeasured visual polish`);
  }
  // Independently remove only the declared additions. Even existing content
  // inside an allowed navigation region must otherwise keep its exact bytes.
  let restored = unwrapped;
  for (const link of links) restored = restored.replace(link[0], '');
  restored = restored.replace(disclosure, '');
  if (isHub || isReport) {
    restored = restored.replace('<nav aria-label="Project source" style="display:flex;flex-wrap:wrap;gap:12px 20px;margin:0"></nav>', '');
    restored = restored.replace('<footer style="flex-wrap:wrap">', '<footer>');
  }
  assert.equal(restored, before, `${target}: publication changed bytes beyond the declared navigation additions`);
}
async function checkFile(route, expected, type, extra = {}) {
  const response = await request(route);
  assert.equal(response.status, 200, `${route}: GET status`);
  assert.equal(response.headers.get('content-type'), type, `${route}: MIME`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', `${route}: nosniff`);
  assert.equal(response.headers.get('cache-control'), extra.cache ?? 'no-cache', `${route}: cache`);
  assert.equal(response.headers.get('content-disposition'), extra.download ? `attachment; filename="${extra.download}"` : null, `${route}: attachment`);
  assert.equal(response.headers.get('content-security-policy'), extra.csp ?? null, `${route}: CSP`);
  const body = Buffer.from(await response.arrayBuffer());
  assert.equal(hash(body), hash(expected), `${route}: bytes differ from the selected build artifact`);
  const head = await request(route, { method: 'HEAD' });
  assert.equal(head.status, 200, `${route}: HEAD status`);
  for (const header of ['content-type', 'content-length', 'cache-control', 'content-disposition', 'content-security-policy', 'etag']) {
    assert.equal(head.headers.get(header), response.headers.get(header), `${route}: HEAD ${header}`);
  }
  assert.equal((await head.arrayBuffer()).byteLength, 0, `${route}: HEAD body`);
  const cached = await request(route, { headers: { 'If-None-Match': response.headers.get('etag') } });
  assert.equal(cached.status, 304, `${route}: conditional revalidation`);
  assert.equal((await cached.arrayBuffer()).byteLength, 0, `${route}: 304 body`);
  return body;
}

try {
  // Reproduce the publication's stable measurement timestamp, not the upstream
  // report builder's wall clock or the already-published HTML under test.
  const compareData = JSON.parse(await read('benchmarks/four-combined.json'));
  const snapshotTime = Math.max(Date.parse(compareData.main.completedAt), Date.parse(compareData.webkit.completedAt));
  assert(Number.isFinite(snapshotTime), 'The comparison report needs valid measurement dates');
  compareData.generatedAt = new Date(snapshotTime).toISOString();
  const comparePayload = JSON.stringify(compareData).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
  const compareTemplate = (await read('benchmarks/four-report-template.html')).toString();
  const compareMarker = '/*FOUR_BENCHMARK_DATA*/null';
  assert.equal(compareTemplate.split(compareMarker).length, 2, 'Unexpected comparison report template');
  const compareSource = Buffer.from(compareTemplate.replace(compareMarker, () => comparePayload).replace("'Report generated: '", "'Measurement snapshot: '"));
  const favicon = await checkFile('/favicon.ico', await read('assets/favicon.ico'), 'image/x-icon');
  assert.equal(favicon.length, 0, 'Default favicon must be a zero-byte response without raster or vector content');
  const pages = [
    ['/', 'index.html', 'dist/collections/index.html'], ['/collections/', 'collections/index.html', 'dist/collections/index.html'],
    ['/original/', 'original/index.html', 'dist/hosted.html'],
    ['/css/', 'css/index.html', 'dist/css.html', noImages], ['/basic/', 'basic/index.html', 'dist/basic.html', noImages],
    ['/hybrid/', 'hybrid/index.html', 'dist/hybrid.html'], ['/compare/', 'compare/index.html', null],
    ['/bench/', 'bench/index.html', 'bench/index.html'],
    ...editionIds.map(id => [`/revision-2/${id}/`, `revision-2/${id}/index.html`, `dist/revision-2/${id}/index.html`, ['css', 'basic'].includes(id) ? noImages : undefined]),
    ['/revision-2/benchmarks/', 'revision-2/benchmarks/index.html', 'dist/revision-2/benchmarks/index.html'],
  ];
  assert.deepEqual(pages.map(([, target]) => target).sort(), files.filter(file => file.endsWith('.html')), 'Every public HTML page must have a source and navigation check');
  for (const [route, target, artifact, csp] of pages) {
    const source = artifact ? await read(artifact) : compareSource;
    const baseline = target === 'bench/index.html' ? publishedBenchHTML(source) : source;
    const expected = publishedGithubHTML(baseline, target);
    assert((await read(`site/${target}`)).equals(expected), `${target}: published HTML differs from its source plus navigation transform`);
    const html = await checkFile(route, expected, 'text/html; charset=utf-8', { csp });
    checkGithubNavigation(baseline, html, target);
    if (csp === noImages) {
      assert.doesNotMatch(html.toString(), /<(?:img|picture|svg|canvas)\b|data:image\//i, `${route}: strict CSS editions must not contain image elements or data images`);
      assert.doesNotMatch(html.toString(), /<link\b[^>]*\brel\s*=\s*["'][^"']*\bicon\b/i, `${route}: explicit favicon links trigger the strict no-images CSP`);
    }
    // All real local HTML links/assets must resolve against the deployed output.
    const references = [...html.toString().matchAll(/(?:href|src|data-src|data-high-res)=["'](\/(?!\/)[^"']*)["']/g)].map(match => match[1]);
    for (const match of html.toString().matchAll(/srcset=["']([^"']+)["']/g)) {
      references.push(...match[1].split(',').map(candidate => candidate.trim().split(/\s+/)[0]).filter(url => /^\/(?!\/)/.test(url)));
    }
    references.push(...[...html.toString().matchAll(/url\(["']?(\/(?!\/)[^\s"')]+)["']?\)/g)].map(match => match[1]));
    for (const target of new Set(references)) {
      const linked = await request(target, { method: 'HEAD' });
      assert.equal(linked.status, 200, `${route}: broken local reference ${target}`);
    }
    if (['/', '/collections/'].includes(route)) {
      for (const target of [...originalRoutes, ...revision2Routes, '/compare/', '/revision-2/benchmarks/']) {
        assert(references.includes(target), `${route}: collection hub link missing for ${target}`);
      }
    }
    if (originalRoutes.includes(route)) {
      const footer = /<footer\b[^>]*class="collection-footer"[^>]*>[\s\S]*?<\/footer>/.exec(html.toString())?.[0];
      assert(footer, `${route}: collection footer missing`);
      for (const target of ['/collections/', '/revision-2/svg/']) assert(footer.includes(`href="${target}"`), `${route}: discovery link missing for ${target}`);
      assert(!/href="\/"/.test(footer), `${route}: V1 footer still points to the new hub as its edition`);
    }
    if (route === '/bench/') {
      for (const target of ['/original/', '/collections/', '/revision-2/svg/']) assert(references.includes(target), `Historical report: missing current navigation to ${target}`);
      assert(!references.includes('/'), 'Historical report: V1 still links to the collection hub');
      assert.match(html.toString(), /id="navigation-history"[^>]*>[^<]*Messwerte und Ergebnisdaten stammen unverändert[^<]*keine Benchmarks erneut ausgeführt/, 'Historical report: navigation-only disclosure missing');
      const scripts = bytes => [...bytes.toString().matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map(match => match[0]);
      assert.deepEqual(scripts(html), scripts(source), 'Historical benchmark data and scripts must remain byte-identical');
      assert((await read(artifact)).equals(source), 'Historical benchmark input was modified during publication checks');
    }
  }
  await checkFile('/compare/data.json', Buffer.from(JSON.stringify(compareData, null, 2) + '\n'), 'application/json; charset=utf-8');
  await checkFile('/bench/data.json', await read('benchmarks/combined.json'), 'application/json; charset=utf-8');
  await checkFile('/revision-2/benchmarks/data.json', await read('dist/revision-2/benchmarks/data.json'), 'application/json; charset=utf-8');
  for (const [edition, filename, source, csp] of [
    ['svg', 'the-twelve-svg.html', 'dist/hosted.html'],
    ['css', 'the-twelve-css-polygons.html', 'dist/css.html', noImages],
    ['basic', 'the-twelve-css-primitives.html', 'dist/basic.html', noImages],
  ]) await checkFile(`/source/${edition}`, await read(source), 'application/octet-stream', { download: filename, csp });
  for (const [edition, filename] of [['svg', 'the-twelve-revision-2-svg.html'], ['css', 'the-twelve-revision-2-css-shapes.html'], ['basic', 'the-twelve-revision-2-css-primitives.html']]) {
    const html = await read(`dist/revision-2/${edition}/index.html`);
    assert.equal(hash(await read(`dist/revision-2/source/${edition}`)), hash(html), `Revision 2 ${edition}: source HTML is stale`);
    await checkFile(`/revision-2/source/${edition}`, html, 'application/octet-stream', { download: filename, csp: ['css', 'basic'].includes(edition) ? noImages : undefined });
  }
  const zip = await checkFile('/source/hybrid', await read('dist/hybrid-source.zip'), 'application/zip', { download: 'the-twelve-studio.zip' });
  const archive = unzipSync(zip);
  assert(archive['index.html'] && archive['serve.mjs'] && archive['reference.png'], 'Portable archive is incomplete');
  const originalPortable = Buffer.from(archive['index.html']).toString();
  const portableV1 = /<a href="(https?:\/\/[^"\s]+)" aria-label="Version 1">V1<\/a>/.exec(originalPortable);
  assert(portableV1, 'Original hybrid archive must link to the current V1 route');
  const portableOrigin = new URL(portableV1[1]);
  assert.equal(portableOrigin.pathname, '/original/');
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const expectedPortable = (await read('dist/hybrid.html')).toString().replaceAll('/hybrid/assets/', 'assets/').replaceAll('href="/hybrid/"', 'href="./"').replaceAll('href="/reference"', 'href="reference.png"').replace(/href="\/(?!\/)([^"]*)"/g, (_, target) => `href="${escape(portableOrigin.origin + '/' + target)}"`);
  assert.equal(hash(archive['index.html']), hash(expectedPortable), 'Original hybrid archive HTML is stale beyond its portable URL rewrites');
  assert.equal(hash(archive['reference.png']), hash(await read('assets/reference.png')), 'Original hybrid archive reference is stale');
  for (const asset of manifest) {
    const bytes = await read(`site${asset.url}`);
    const ext = path.extname(asset.url);
    assert.match(asset.url, /\.[a-f0-9]{12}\.(?:webp|avif|woff2)$/);
    assert.equal(hash(bytes), asset.sha256, `${asset.url}: manifest hash`);
    assert.equal(hash(archive[`assets/${path.basename(asset.url)}`]), asset.sha256, `${asset.url}: archive hash`);
    await checkFile(asset.url, bytes, { '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2' }[ext], { cache: 'public, max-age=31536000, immutable' });
  }
  const revision2Zip = await checkFile('/revision-2/source/hybrid', await read('dist/revision-2/source/hybrid'), 'application/zip', { download: 'the-twelve-revision-2-studio.zip' });
  const revision2Archive = unzipSync(revision2Zip);
  assert(revision2Archive['index.html'] && revision2Archive['serve.mjs'] && revision2Archive['reference.png'], 'Revision 2 portable archive is incomplete');
  const portable = Buffer.from(revision2Archive['index.html']).toString();
  // Both ZIPs are built with the same deployment origin. Derive it from R1's
  // validated portable navigation so checks also work after build env vars exit.
  // Reproduce R2's documented transformations independently of portable.mjs.
  const expectedRevision2Portable = (await read('dist/revision-2/hybrid/index.html')).toString()
    .replaceAll('/revision-2/assets/', 'assets/')
    .replaceAll('href="/revision-2/reference"', 'href="reference.png"')
    .replaceAll('href="/revision-2/hybrid/"', 'href="./"')
    .replace(/href="\/(?!\/)([^"]*)"/g, (_, target) => `href="${escape(portableOrigin.origin + '/' + target)}"`);
  assert.equal(portable, expectedRevision2Portable, 'Revision 2 portable HTML differs from the current build beyond portable URL rewrites');
  for (const href of ['reference.png', './', ...['/collections/', '/original/', '/revision-2/svg/', '/revision-2/css/', '/revision-2/basic/', '/revision-2/benchmarks/', '/revision-2/source/hybrid'].map(target => portableOrigin.origin + target)]) {
    assert(portable.includes(`href="${escape(href)}"`), `Revision 2 portable HTML: missing usable link to ${href}`);
  }
  assert.doesNotMatch(portable, /href="\/(?!\/)|\/revision-2\/assets\//, 'Revision 2 portable HTML still depends on hosted root-relative routes');
  const portableAssets = new Set([...portable.matchAll(/assets\/([A-Za-z0-9@._-]+\.(?:webp|avif|woff2|png|svg))/g)].map(match => match[1]));
  const assetTypes = { '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
  for (const asset of revision2Manifest) {
    const bytes = await read(`site${asset.url}`);
    const basename = path.basename(asset.url);
    assert.match(asset.url, /^\/revision-2\/assets\/[A-Za-z0-9][A-Za-z0-9@._-]*\.[a-f0-9]{12}\.(?:webp|avif|woff2|png|svg)$/);
    assert.equal(hash(bytes), asset.sha256, `${asset.url}: manifest hash`);
    assert.equal(bytes.length, asset.bytes, `${asset.url}: manifest length`);
    assert(basename.includes(`.${asset.sha256.slice(0, 12)}.`), `${asset.url}: filename hash`);
    if (portableAssets.has(basename)) {
      assert(revision2Archive[`assets/${basename}`], `${asset.url}: missing from portable archive`);
      assert.equal(hash(revision2Archive[`assets/${basename}`]), asset.sha256, `${asset.url}: archive hash`);
      portableAssets.delete(basename);
    }
    await checkFile(asset.url, bytes, assetTypes[path.extname(asset.url)], { cache: 'public, max-age=31536000, immutable' });
  }
  assert.equal(portableAssets.size, 0, 'Revision 2 archive references assets absent from the manifest');
  const reference = await checkFile('/reference', await read('assets/reference.png'), 'image/png');
  assert.equal(reference.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Reference must be PNG');
  const revision2Reference = await checkFile('/revision-2/reference', await read('dist/revision-2/reference'), 'image/png');
  assert.equal(revision2Reference.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Revision 2 reference must be PNG');
  assert.equal(hash(revision2Archive['reference.png']), hash(revision2Reference), 'Revision 2 archive reference is stale');

  const report = JSON.parse(await read('site/compare/data.json'));
  const html = (await read('site/compare/index.html')).toString();
  const payload = JSON.stringify(report).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
  assert(html.includes(payload), 'Report HTML and downloadable JSON disagree');
  assert.equal(report.main.status, 'complete');
  assert.equal(report.webkit.status, 'complete');
  assert.deepEqual(report.main, JSON.parse(await read('benchmarks/four-results.json')), 'Historical Edge records changed');
  assert.deepEqual(report.webkit, JSON.parse(await read('benchmarks/four-webkit-results.json')), 'Historical WebKit records changed');
  const history = await validateBuildHistory({ edge: report.main, webkit: report.webkit });
  assert.deepEqual(report.verification.currentBuilds, history.current, 'Current report fingerprints are stale');
  assert.deepEqual(report.verification.htmlComparisons, history.comparisons, 'Current report does not validate its historical relationship');
  assert.deepEqual(report.verification.invariants, history.invariants, 'Current report must distinguish archived measurements from visual polish');
  assert.match(compareTemplate, /id="navigation-history">[^<]*flag frame[^<]*comic[^<]*PNG[^<]*Neither[^<]*benchmarked/i, 'Four-edition report must disclose the unmeasured visual polish');
  for (const [edition, artifact] of [['svg', 'dist/hosted.html'], ['css', 'dist/css.html'], ['basic', 'dist/basic.html'], ['hybrid', 'dist/hybrid.html']]) {
    assert.equal(hash(await read(artifact)), report.verification.currentBuilds[edition].sha256, `${edition}: source HTML is not the validated build before publication navigation`);
  }

  const redirects = [['/index.html', '/']];
  for (const page of ['css', 'basic', 'hybrid', 'compare', 'bench', 'original', 'collections', ...editionIds.map(id => `revision-2/${id}`), 'revision-2/benchmarks']) {
    redirects.push([`/${page}`, `/${page}/`], [`/${page}/index.html`, `/${page}/`]);
  }
  redirects.push(['/revision-2', '/revision-2/svg/'], ['/revision-2/', '/revision-2/svg/']);
  for (const [from, to] of redirects) {
    const response = await request(from + '?check=kept', { method: 'HEAD' });
    assert.equal(response.status, 308, `${from}: canonical redirect`);
    assert.equal(response.headers.get('location'), to + '?check=kept', `${from}: redirect destination/query`);
    const final = await request(response.headers.get('location'), { method: 'HEAD' });
    assert.equal(final.status, 200, `${from}: redirect loop or missing destination`);
  }
  for (const route of ['/missing', '/server.mjs', '/vercel.json', '/package.json', '/.env', '/benchmarks/four-results.json', '/hybrid/artwork-atlas.png', '/hybrid/assets/paper.webp', '/hybrid/app.js', '/source/', '/css.html', '/dist/hosted.html', '/assets/reference.png', '/reference/', '/source/svg/', '/CSS/', '/source/CSS', '/revision-2/build.mjs', '/revision-2/app.js', '/revision-2/style.css', '/revision-2/assets-manifest.json', '/revision-2/assets/reference.png', '/revision-2/assets/unlisted.0123456789ab.webp', '/revision-2/audit.json', '/revision-2/source/', '/revision-2/source/svg/', '/revision-2/reference/', '/revision-2/SVG/', '/revision-2/svg/index.html.gz', '/revision-2/benchmarks/results.json', '/public-files.json']) {
    const response = await request(route, { method: 'HEAD' });
    assert.equal(response.status, 404, `Unexpectedly exposed path: ${route}`);
  }
  const method = await request('/', { method: 'POST' });
  assert.equal(method.status, 405);
  assert.equal(method.headers.get('allow'), 'GET, HEAD');
  console.log(`Static route checks passed: ${files.length} allowlisted files, ${requests} HTTP checks, all source and published edition hashes, GitHub navigation, asset hashes, downloads, aliases, cache/CSP headers and report data verified.`);
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

// Tailnet uses the same routes with HTML compression enabled. Check its wire
// negotiation independently of Vercel CDN compression, which preview omits.
const compressedServer = await createPreviewServer({ compressHtml: true });
compressedServer.listen(0, '127.0.0.1');
await once(compressedServer, 'listening');
try {
  const compressedOrigin = `http://127.0.0.1:${compressedServer.address().port}`;
  const expected = await read('site/index.html');
  const encodings = new Map();
  for (const [accept, encoding] of [['br', 'br'], ['gzip', 'gzip'], ['br;q=0, gzip;q=0.5', 'gzip'], ['br;q=0.5, gzip;q=1', 'gzip'], ['br;q=0, gzip;q=0', null], ['identity', null]]) {
    const response = await fetch(compressedOrigin, { headers: { 'Accept-Encoding': accept }, signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `Tailnet compression ${accept}: GET status`);
    assert.equal(response.headers.get('content-encoding'), encoding, `Tailnet compression ${accept}: selected encoding`);
    assert.equal(response.headers.get('vary'), 'Accept-Encoding');
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(expected), `Tailnet compression ${accept}: decoded HTML differs`);
    const etag = response.headers.get('etag');
    encodings.set(encoding, etag);
    const head = await fetch(compressedOrigin, { method: 'HEAD', headers: { 'Accept-Encoding': accept }, signal: AbortSignal.timeout(10000) });
    for (const header of ['content-encoding', 'content-length', 'etag', 'vary']) assert.equal(head.headers.get(header), response.headers.get(header), `Tailnet compression ${accept}: HEAD ${header}`);
    const cached = await fetch(compressedOrigin, { headers: { 'Accept-Encoding': accept, 'If-None-Match': `W/${etag}` }, signal: AbortSignal.timeout(10000) });
    assert.equal(cached.status, 304, `Tailnet compression ${accept}: revalidation`);
  }
  assert.equal(new Set(encodings.values()).size, 3, 'Encoded HTML representations must use distinct ETags');
  console.log('Tailnet shared-route compression checks passed: Brotli, gzip, identity, quality values, HEAD and ETag revalidation.');
} finally {
  await new Promise((resolve, reject) => compressedServer.close(error => error ? reject(error) : resolve()));
}
