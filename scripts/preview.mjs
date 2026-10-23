import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// This project's config uses exact, case-sensitive paths and terminal (.*)
// wildcards only. Refuse new syntax rather than silently emulate it incorrectly.
// Vercel's routing-utils sourceToRegex uses strict:true and sensitive:true.
function matches(source, pathname) {
  assert(/^\/[A-Za-z0-9/._-]*(?:\(\.\*\))?$/.test(source), `Unsupported preview route pattern: ${source}`);
  return source.endsWith('(.*)') ? pathname.startsWith(source.slice(0, -4)) : pathname === source;
}

export async function createPreviewServer({ rootDirectory = root, compressHtml = false } = {}) {
  const config = JSON.parse(await readFile(path.join(rootDirectory, 'vercel.json'), 'utf8'));
  assert.equal(config.outputDirectory, 'site');
  assert.equal(config.cleanUrls, false, 'Preview requires explicit cleanUrls:false');
  assert(!Object.hasOwn(config, 'trailingSlash'), 'Use the explicit page redirects instead of global slash normalization');
  assert(!config.routes, 'Low-level routes are not supported by this static preview');
  const site = await realpath(path.join(rootDirectory, 'site')).catch(error => {
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
  const compressed = new Map();
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
        let body = await readFile(canonical);
        headers['content-type'] ??= mime[path.extname(filename)] ?? 'application/octet-stream';
        const digest = createHash('sha256').update(body).digest('hex');
        let encoding = '';
        if (compressHtml && headers['content-type'].startsWith('text/html')) {
          headers.vary = 'Accept-Encoding';
          const accepts = new Map((request.headers['accept-encoding'] ?? '').split(',').map(part => {
            const [name, ...parameters] = part.trim().toLowerCase().split(';');
            const quality = parameters.map(p => /^\s*q\s*=\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*$/.exec(p)).find(Boolean);
            return [name, quality ? Number(quality[1]) : 1];
          }));
          const quality = name => accepts.get(name) ?? accepts.get('*') ?? 0;
          encoding = quality('br') > 0 && quality('br') >= quality('gzip') ? 'br' : quality('gzip') > 0 ? 'gzip' : '';
          if (encoding) {
            let entry = compressed.get(canonical);
            if (!entry || entry.digest !== digest) {
              entry = { digest };
              compressed.set(canonical, entry);
            }
            entry[encoding] ??= encoding === 'br' ? brotliCompressSync(body) : gzipSync(body);
            body = entry[encoding];
            headers['content-encoding'] = encoding;
          }
        }
        const etag = '"' + digest + (encoding ? `-${encoding}` : '') + '"';
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

// Node resolves this module through junctions, while argv may retain the alias.
// Canonicalize both paths so npm run preview also starts from the C: workspace.
const entrypoint = process.argv[1] ? await realpath(path.resolve(process.argv[1])).catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
}) : null;
if (entrypoint && entrypoint === await realpath(fileURLToPath(import.meta.url))) {
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
