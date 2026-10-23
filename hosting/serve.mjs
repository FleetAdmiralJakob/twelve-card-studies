import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';

// Only the published editions, report, source downloads and reference are exposed.
const routes = new Map([
  ['/', ['index.html','text/html; charset=utf-8']],
  ['/index.html', ['index.html','text/html; charset=utf-8']],
  ['/original/', ['index.html','text/html; charset=utf-8']],
  ['/css/', ['css.html','text/html; charset=utf-8']],
  ['/css/index.html', ['css.html','text/html; charset=utf-8']],
  ['/basic/', ['basic.html','text/html; charset=utf-8']],
  ['/basic/index.html', ['basic.html','text/html; charset=utf-8']],
  ['/hybrid/', ['hybrid.html','text/html; charset=utf-8']],
  ['/hybrid/index.html', ['hybrid.html','text/html; charset=utf-8']],
  ['/compare/', ['compare.html','text/html; charset=utf-8']],
  ['/compare/data.json', ['four-benchmark-results.json','application/json; charset=utf-8']],
  ['/bench/', ['bench.html','text/html; charset=utf-8']],
  ['/bench/data.json', ['benchmark-results.json','application/json; charset=utf-8']],
  ['/source/svg', ['index.html','application/octet-stream','the-twelve-svg.html']],
  ['/source/css', ['css.html','application/octet-stream','the-twelve-css-polygons.html']],
  ['/source/basic', ['basic.html','application/octet-stream','the-twelve-css-primitives.html']],
  ['/source/hybrid', ['hybrid-source.zip','application/zip','the-twelve-studio.zip']],
  ['/reference', ['reference.png','image/png']],
]);
const cache = new Map();
async function readCached(file) {
  const url = new URL(`./${file}`,import.meta.url);
  const info = await stat(url);
  const old = cache.get(file);
  if (old?.mtime === info.mtimeMs) return old;
  const entry = {mtime:info.mtimeMs,body:await readFile(url),etag:`"${info.size.toString(16)}-${Math.round(info.mtimeMs).toString(16)}"`};
  cache.set(file,entry);
  return entry;
}
const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  if (['/css','/basic','/bench','/hybrid','/compare'].includes(pathname)) { response.writeHead(302,{Location:pathname+'/'}).end();return; }
  const assetMatch = pathname.match(/^\/hybrid\/assets\/([a-z0-9][a-z0-9@._-]*\.(webp|avif|woff2))$/i);
  const assetTypes = {webp:'image/webp',avif:'image/avif',woff2:'font/woff2'};
  const route = routes.get(pathname) || (assetMatch ? ['hybrid/assets/'+assetMatch[1],assetTypes[assetMatch[2].toLowerCase()]] : null);
  if (!route) {
    response.writeHead(404).end('Not found');
    return;
  }
  try {
    const [filename,type,download] = route;
    const accepts = request.headers['accept-encoding'] || '';
    const encoding = type.startsWith('text/html') ? (/\bbr\b/.test(accepts) ? 'br' : /\bgzip\b/.test(accepts) ? 'gzip' : '') : '';
    const suffix = encoding === 'br' ? '.br' : encoding === 'gzip' ? '.gz' : '';
    const {body,etag} = await readCached(filename+suffix);
    const headers = {
      'Content-Type': type,
      'Cache-Control': assetMatch && /\.[a-f0-9]{12}\./.test(filename) ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Accept-Encoding',
      'ETag': etag,
      ...(encoding ? {'Content-Encoding':encoding} : {}),
      ...(download ? {'Content-Disposition':`attachment; filename="${download}"`} : {}),
    };
    if (['css.html','basic.html'].includes(filename)) headers['Content-Security-Policy'] = "default-src 'self'; img-src 'none'; object-src 'none'; font-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'";
    if (request.headers['if-none-match']===etag) {response.writeHead(304,headers).end();return;}
    response.writeHead(200, {...headers,'Content-Length':body.length});
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    console.error(error);
    response.writeHead(503).end('Website is being updated. Please reload.');
  }
});
server.on('error', error => {
  // A second sign-in/start request should leave the existing host alone.
  if (error.code === 'EADDRINUSE') process.exit(0);
  console.error(error);
  process.exit(1);
});
server.listen(18787, '127.0.0.1', () => console.log('The Twelve is ready on 127.0.0.1:18787'));
