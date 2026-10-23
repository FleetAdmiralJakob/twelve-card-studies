import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';
import { createPreviewServer } from './preview.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFile(path.join(root, file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(await read('dist/hybrid-assets.json'));
const files = [
  'index.html', 'css/index.html', 'basic/index.html', 'hybrid/index.html',
  'compare/index.html', 'compare/data.json', 'bench/index.html', 'bench/data.json',
  'source/svg', 'source/css', 'source/basic', 'source/hybrid', 'reference',
  ...manifest.map(asset => asset.url.slice(1)),
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
  for (const [route, artifact, csp] of [
    ['/', 'dist/hosted.html'], ['/original/', 'dist/hosted.html'],
    ['/css/', 'dist/css.html', noImages], ['/basic/', 'dist/basic.html', noImages],
    ['/hybrid/', 'dist/hybrid.html'], ['/compare/', 'site/compare/index.html'],
    ['/bench/', 'bench/index.html'],
  ]) {
    const html = await checkFile(route, await read(artifact), 'text/html; charset=utf-8', { csp });
    // All real local HTML links/assets must resolve against the deployed output.
    const references = [...html.toString().matchAll(/(?:href|src|data-src|data-high-res)="(\/(?!\/)[^"]*)"/g)].map(match => match[1]);
    for (const target of new Set(references)) {
      const linked = await request(target, { method: 'HEAD' });
      assert.equal(linked.status, 200, `${route}: broken local reference ${target}`);
    }
  }
  await checkFile('/compare/data.json', await read('site/compare/data.json'), 'application/json; charset=utf-8');
  await checkFile('/bench/data.json', await read('benchmarks/combined.json'), 'application/json; charset=utf-8');
  for (const [edition, filename, source, csp] of [
    ['svg', 'the-twelve-svg.html', 'dist/hosted.html'],
    ['css', 'the-twelve-css-polygons.html', 'dist/css.html', noImages],
    ['basic', 'the-twelve-css-primitives.html', 'dist/basic.html', noImages],
  ]) await checkFile(`/source/${edition}`, await read(source), 'application/octet-stream', { download: filename, csp });
  const zip = await checkFile('/source/hybrid', await read('dist/hybrid-source.zip'), 'application/zip', { download: 'the-twelve-studio.zip' });
  const archive = unzipSync(zip);
  assert(archive['index.html'] && archive['serve.mjs'] && archive['reference.png'], 'Portable archive is incomplete');
  for (const asset of manifest) {
    const bytes = await read(`site${asset.url}`);
    const ext = path.extname(asset.url);
    assert.match(asset.url, /\.[a-f0-9]{12}\.(?:webp|avif|woff2)$/);
    assert.equal(hash(bytes), asset.sha256, `${asset.url}: manifest hash`);
    assert.equal(hash(archive[`assets/${path.basename(asset.url)}`]), asset.sha256, `${asset.url}: archive hash`);
    await checkFile(asset.url, bytes, { '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2' }[ext], { cache: 'public, max-age=31536000, immutable' });
  }
  const reference = await checkFile('/reference', await read('assets/reference.png'), 'image/png');
  assert.equal(reference.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Reference must be PNG');

  const report = JSON.parse(await read('site/compare/data.json'));
  const html = (await read('site/compare/index.html')).toString();
  const payload = JSON.stringify(report).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
  assert(html.includes(payload), 'Report HTML and downloadable JSON disagree');
  assert.equal(report.main.status, 'complete');
  assert.equal(report.webkit.status, 'complete');
  for (const [edition, file] of [['svg', 'index.html'], ['css', 'css/index.html'], ['basic', 'basic/index.html'], ['hybrid', 'hybrid/index.html']]) {
    assert.equal(hash(await read(`site/${file}`)), report.verification.currentBuilds[edition].sha256, `${edition}: deployed HTML is not the validated build`);
  }

  const redirects = [['/index.html', '/']];
  for (const page of ['css', 'basic', 'hybrid', 'compare', 'bench', 'original']) {
    redirects.push([`/${page}`, `/${page}/`], [`/${page}/index.html`, `/${page}/`]);
  }
  for (const [from, to] of redirects) {
    const response = await request(from + '?check=kept', { method: 'HEAD' });
    assert.equal(response.status, 308, `${from}: canonical redirect`);
    assert.equal(response.headers.get('location'), to + '?check=kept', `${from}: redirect destination/query`);
    const final = await request(response.headers.get('location'), { method: 'HEAD' });
    assert.equal(final.status, 200, `${from}: redirect loop or missing destination`);
  }
  for (const route of ['/missing', '/server.mjs', '/vercel.json', '/package.json', '/.env', '/benchmarks/four-results.json', '/hybrid/artwork-atlas.png', '/hybrid/assets/paper.webp', '/hybrid/app.js', '/source/', '/css.html', '/dist/hosted.html', '/assets/reference.png', '/reference/', '/source/svg/', '/CSS/', '/source/CSS']) {
    const response = await request(route, { method: 'HEAD' });
    assert.equal(response.status, 404, `Unexpectedly exposed path: ${route}`);
  }
  const method = await request('/', { method: 'POST' });
  assert.equal(method.status, 405);
  assert.equal(method.headers.get('allow'), 'GET, HEAD');
  console.log(`Static route checks passed: ${files.length} allowlisted files, ${requests} HTTP checks, all edition hashes, asset hashes, downloads, aliases, cache/CSP headers and report data verified.`);
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
