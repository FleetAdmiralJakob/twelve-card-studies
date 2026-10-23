import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
};

// This project's config uses exact, case-sensitive paths and terminal (.*)
// wildcards only. Refuse new syntax rather than silently emulate it incorrectly.
// Vercel's routing-utils sourceToRegex uses strict:true and sensitive:true.
function matches(source, pathname) {
  assert(/^\/[A-Za-z0-9/._-]*(?:\(\.\*\))?$/.test(source), `Unsupported preview route pattern: ${source}`);
  return source.endsWith('(.*)') ? pathname.startsWith(source.slice(0, -4)) : pathname === source;
}

export async function createPreviewServer() {
  const config = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.outputDirectory, 'site');
  assert.equal(config.cleanUrls, false, 'Preview requires explicit cleanUrls:false');
  assert(!Object.hasOwn(config, 'trailingSlash'), 'Use the explicit page redirects instead of global slash normalization');
  assert(!config.routes, 'Low-level routes are not supported by this static preview');
  const site = await realpath(path.join(root, 'site')).catch(error => {
    if (error.code === 'ENOENT') throw new Error('site/ is missing. Run npm run build:vercel first.');
    throw error;
  });
  // Windows resolves filenames without regard to case; deployed static paths
  // are case-sensitive. Inventory real names so the preview agrees with Vercel.
  const publicPaths = new Set();
  async function inventory(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      assert(!entry.isSymbolicLink(), `Unexpected site link: ${prefix}/${entry.name}`);
      if (entry.isDirectory()) await inventory(path.join(directory, entry.name), `${prefix}/${entry.name}`);
      else if (entry.isFile()) publicPaths.add(`${prefix}/${entry.name}`);
    }
  }
  await inventory(site);
  for (const rule of [...config.headers, ...config.redirects, ...config.rewrites]) {
    matches(rule.source, '/');
    assert(!rule.has && !rule.missing, 'Conditional routes are not supported by this static preview');
    if (rule.destination) assert(/^\/[A-Za-z0-9/._-]*$/.test(rule.destination), 'Preview requires literal local destinations');
  }

  return http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, { Allow: 'GET, HEAD' }).end();
        return;
      }
      const url = new URL(request.url, 'http://localhost');
      // Match the incoming URL, before rewriting, just as Vercel does.
      const pathname = url.pathname;
      const headers = {};
      for (const rule of config.headers) {
        if (matches(rule.source, pathname)) {
          for (const { key, value } of rule.headers) headers[key.toLowerCase()] = value;
        }
      }
      const redirect = config.redirects.find(rule => matches(rule.source, pathname));
      if (redirect) {
        const status = redirect.statusCode ?? (redirect.permanent === false ? 307 : 308);
        response.writeHead(status, { ...headers, location: redirect.destination + url.search }).end();
        return;
      }
      const rewrite = config.rewrites.find(rule => matches(rule.source, pathname));
      let localPath;
      try { localPath = decodeURIComponent(rewrite?.destination ?? pathname); }
      catch { response.writeHead(400).end('Invalid URL'); return; }
      if (localPath.includes('\\') || localPath.includes('\0') || localPath.split('/').includes('..')) {
        response.writeHead(404, headers).end('Not found');
        return;
      }
      if (localPath.endsWith('/')) localPath += 'index.html';
      if (!publicPaths.has(localPath)) {
        response.writeHead(404, headers).end(request.method === 'HEAD' ? undefined : 'Not found');
        return;
      }
      const filename = path.resolve(site, '.' + localPath);
      if (!filename.startsWith(site + path.sep)) {
        response.writeHead(404, headers).end('Not found');
        return;
      }
      try {
        const canonical = await realpath(filename);
        if (!canonical.startsWith(site + path.sep) || !(await stat(canonical)).isFile()) {
          response.writeHead(404, headers).end('Not found');
          return;
        }
        const body = await readFile(canonical);
        const etag = '"' + createHash('sha256').update(body).digest('hex') + '"';
        headers['content-type'] ??= mime[path.extname(filename)] ?? 'application/octet-stream';
        headers.etag = etag;
        const validators = (request.headers['if-none-match'] ?? '').split(',').map(value => value.trim().replace(/^W\//, ''));
        if (validators.includes(etag) || validators.includes('*')) {
          response.writeHead(304, headers).end();
          return;
        }
        response.writeHead(200, { ...headers, 'content-length': body.length });
        response.end(request.method === 'HEAD' ? undefined : body);
      } catch (error) {
        if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
        response.writeHead(404, headers).end(request.method === 'HEAD' ? undefined : 'Not found');
      }
    } catch (error) {
      console.error(error);
      if (!response.headersSent) response.writeHead(500);
      response.end('Preview error');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Preview the built site with vercel.json routes/headers.\nUsage: node scripts/preview.mjs [--port 4173] [--host 127.0.0.1]\nVercel CDN compression and caching infrastructure are not emulated.');
  } else {
    const options = { '--port': process.env.PORT ?? '4173', '--host': '127.0.0.1' };
    for (let index = 0; index < args.length; index += 2) {
      assert(Object.hasOwn(options, args[index]) && args[index + 1], `Unexpected argument: ${args[index]}`);
      options[args[index]] = args[index + 1];
    }
    const port = Number(options['--port']);
    assert(Number.isInteger(port) && port >= 0 && port <= 65535, 'Invalid port');
    const server = await createPreviewServer();
    server.on('error', error => { console.error(error.message); process.exitCode = 1; });
    server.listen(port, options['--host'], () => console.log(`The Twelve preview: http://${options['--host']}:${server.address().port}`));
  }
}
