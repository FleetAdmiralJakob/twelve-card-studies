import { createHash } from 'node:crypto';
import { constants, realpathSync } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { AUXILIARY_AUDIT, FAVICON } from './config.mjs';
import { createAuxiliaryAuditLedger, parseAuxiliaryAuditQuery } from './server-audit.mjs';

export const HOST = '127.0.0.1';
export const DEFAULT_PORT = 4175;
export const EDITIONS = Object.freeze(['svg', 'css', 'basic', 'hybrid']);
const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const PREFIX = '/revision-2/';
const REVALIDATE = 'public, max-age=0, must-revalidate';
const IMMUTABLE = 'public, max-age=31536000, immutable';
const HTML = 'text/html; charset=utf-8';

export const HELP = `Frozen Revision 2 production-compression benchmark server

Usage: node revision-2/benchmarks/serve.mjs [--port PORT]
       node revision-2/benchmarks/serve.mjs --help

  --port PORT, --port=PORT  TCP port (1-65535; default ${DEFAULT_PORT})
  -h, --help               Show this help without loading files or listening

Binds only to ${HOST}; no dependencies, builds, writes, or runtime compression.
Reads dist/revision-2 relative to this script, independently of the working directory.
Before listening, snapshots all four edition pages and manifest-listed assets,
checks asset sizes/SHA-256, and verifies existing .br/.gz HTML sidecars decompress
to the exact identity HTML. Invalid files or symlinks fail startup.

Routes:
  /revision-2/{svg,css,basic,hybrid}/  (also /index.html, no slash, or .html)
  /revision-2/assets/<manifest-listed filename>
  /favicon.ico  (known empty assets/favicon.ico; available to every edition)
  /revision-2/__benchmark/auxiliary?referer=<full unique run page URL>
  /revision-2/reference and /revision-2/source/{svg,css,basic,hybrid}, if present
  /revision-2/benchmarks/ and /revision-2/benchmarks/index.html, if present
  /revision-2/benchmarks/data.json, if present

Only GET and HEAD are supported. HTML negotiates existing Brotli/gzip variants
using Accept-Encoding quality weights; ties prefer br, then gzip, then identity.
Implicit identity is a fallback; absent/empty Accept-Encoding selects identity.
Assets and downloads use identity only. Successful responses include
x-r2-benchmark-server: 1. ETags identify the selected representation's bytes.
Everything is frozen at startup, including optional reports: restart after changes.
The read-only auxiliary audit reports actual favicon responses from this process.
No other repository paths, directory listings, or direct .br/.gz URLs are served.
`;

export function parseArgs(args = []) {
  let port = DEFAULT_PORT;
  let portSeen = false;
  let help = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--port' || arg.startsWith('--port=')) {
      if (portSeen) throw new Error('--port may only be specified once.');
      const value = arg === '--port' ? args[++i] : arg.slice('--port='.length);
      if (typeof value !== 'string' || !/^\d+$/.test(value)
          || Number(value) < 1 || Number(value) > 65535) {
        throw new Error('--port requires an integer from 1 through 65535.');
      }
      port = Number(value);
      portSeen = true;
    } else {
      throw new Error(`Unknown argument: ${arg}. Use --help for usage.`);
    }
  }
  return { port, help };
}

/** Validate before normalization, which would otherwise erase traversal segments. */
export function parseRequestPath(target) {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')
      || /[\x00-\x20\x7f\\#]/.test(target)) return null;
  const rawPath = target.split('?', 1)[0];
  if (/%(?:2f|5c)/i.test(rawPath)) return null;
  let pathname;
  try { pathname = decodeURIComponent(rawPath); } catch { return null; }
  // The frozen build uses ASCII names, including @2x assets. Remaining percent
  // escapes, Windows drive/ADS syntax and alternate separators are not aliases.
  if (!/^\/[A-Za-z0-9_@./-]*$/.test(pathname) || pathname.includes('//')) return null;
  if (pathname.split('/').some(part => part === '.' || part === '..')) return null;
  return pathname;
}

const headerText = value => Array.isArray(value) ? value.join(',') : value;

/** Malformed or conflicting duplicate weights never upgrade an excluded coding. */
export function parseAcceptEncoding(header) {
  const weights = new Map();
  const text = headerText(header);
  if (typeof text !== 'string') return weights;
  for (const item of text.split(',')) {
    const [name, ...parameters] = item.trim().split(';');
    const coding = name.trim().toLowerCase();
    if (!/^[!#$%&'*+.^_`|~0-9a-z-]+$/.test(coding)) continue;
    let weight = 1;
    if (parameters.length) {
      const match = parameters.length === 1
        && /^\s*q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)\s*$/i.exec(parameters[0]);
      weight = match ? Number(match[1]) : 0;
    }
    weights.set(coding, weights.has(coding) ? Math.min(weights.get(coding), weight) : weight);
  }
  return weights;
}

/**
 * Return an available coding, or null for 406. Omitted identity is a fallback;
 * explicit identity participates in weighted preference. An absent header can
 * accept any coding, but this server deliberately chooses identity.
 * https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.3
 */
export function selectEncoding(header, available = ['br', 'gzip', 'identity']) {
  const supported = new Set(available);
  const text = headerText(header);
  if (text == null || text.trim() === '') return supported.has('identity') ? 'identity' : null;
  const weights = parseAcceptEncoding(text);
  let selected = null;
  let best = 0;
  for (const coding of ['br', 'gzip', 'identity']) {
    if (!supported.has(coding)) continue;
    const weight = weights.has(coding) ? weights.get(coding)
      : coding === 'identity' ? 0 : (weights.get('*') ?? 0);
    if (weight > best) {
      selected = coding;
      best = weight;
    }
  }
  if (selected) return selected;
  const identityAllowed = weights.has('identity') ? weights.get('identity') > 0 : weights.get('*') !== 0;
  return supported.has('identity') && identityAllowed ? 'identity' : null;
}

export function representationETag(bytes) {
  return `"sha256-${createHash('sha256').update(bytes).digest('hex')}"`;
}

/** Entity tags can contain commas, so splitting the header on commas is unsafe. */
function matchesETag(header, etag, weak) {
  const text = headerText(header);
  if (typeof text !== 'string') return false;
  if (text.trim() === '*') return true;
  const tag = /(?:W\/)?"[\x21\x23-\x7e\x80-\xff]*"/y;
  let index = 0;
  let matches = false;
  while (index < text.length) {
    // HTTP list syntax permits empty members.
    while (index < text.length && /[\t ,]/.test(text[index])) index++;
    if (index === text.length) break;
    tag.lastIndex = index;
    const found = tag.exec(text);
    if (!found) return false;
    const candidate = weak ? found[0].replace(/^W\//, '') : found[0];
    if (candidate === (weak ? etag.replace(/^W\//, '') : etag)) matches = true;
    index = tag.lastIndex;
    while (index < text.length && /[\t ]/.test(text[index])) index++;
    if (index < text.length && text[index] !== ',') return false;
  }
  return matches;
}

export function matchesIfNoneMatch(header, etag) {
  return matchesETag(header, etag, true);
}

export function validateAssetManifest(manifest) {
  if (!Array.isArray(manifest)) throw new Error('assets-manifest.json must be an array.');
  const seen = new Set();
  return manifest.map((entry, index) => {
    if (!entry || typeof entry.url !== 'string' || entry.url.includes('?')
        || !entry.url.startsWith(`${PREFIX}assets/`) || entry.url.endsWith('/')
        || parseRequestPath(entry.url) !== entry.url
        || !Number.isSafeInteger(entry.bytes) || entry.bytes < 0
        || typeof entry.sha256 !== 'string' || !/^[a-f\d]{64}$/i.test(entry.sha256)) {
      throw new Error(`Invalid asset manifest entry ${index}.`);
    }
    if (seen.has(entry.url)) throw new Error(`Duplicate asset manifest URL: ${entry.url}`);
    seen.add(entry.url);
    return { url: entry.url, bytes: entry.bytes, sha256: entry.sha256.toLowerCase() };
  });
}

function isWithin(root, path) {
  const rel = relative(root, path);
  return rel !== '' && !isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`);
}

async function inspectConfinedPath(root, name, directory = false) {
  const parts = name.split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || /[\\:]/.test(part))) {
    throw new Error(`Invalid frozen file path: ${name}`);
  }
  let path = root;
  let info;
  for (let i = 0; i < parts.length; i++) {
    path = resolve(path, parts[i]);
    info = await lstat(path);
    if (info.isSymbolicLink()) throw new Error(`Symlinks/junctions are not allowed: ${name}`);
    const wantsDirectory = i < parts.length - 1 || directory;
    if (wantsDirectory ? !info.isDirectory() : !info.isFile()) {
      throw new Error(`Expected a regular ${wantsDirectory ? 'directory' : 'file'}: ${name}`);
    }
  }
  const canonical = await realpath(path);
  if (!isWithin(root, canonical)) throw new Error(`File escapes the frozen root: ${name}`);
  return { path: canonical, info };
}

async function readConfined(root, name, optional = false) {
  let checked;
  try { checked = await inspectConfinedPath(root, name); } catch (error) {
    if (optional && error.code === 'ENOENT') return null;
    throw error;
  }
  const flags = constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0);
  const file = await open(checked.path, flags);
  try {
    const before = await file.stat();
    if (!before.isFile() || before.dev !== checked.info.dev || before.ino !== checked.info.ino) {
      throw new Error(`Frozen file changed while opening: ${name}`);
    }
    const bytes = await file.readFile();
    const after = await file.stat();
    const current = await inspectConfinedPath(root, name);
    if (before.size !== bytes.length || before.size !== after.size
        || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs
        || current.path !== checked.path || current.info.dev !== after.dev || current.info.ino !== after.ino) {
      throw new Error(`Frozen file changed while reading: ${name}`);
    }
    return bytes;
  } finally {
    await file.close();
  }
}

function contentType(path) {
  return ({
    '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
    '.woff': 'font/woff', '.ttf': 'font/ttf', '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.html': HTML, '.txt': 'text/plain; charset=utf-8', '.zip': 'application/zip',
  })[extname(path).toLowerCase()] ?? 'application/octet-stream';
}

function representation(bytes) {
  return Object.freeze({ bytes, etag: representationETag(bytes) });
}

export function faviconResource(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length !== FAVICON.bytes || representationETag(bytes) !== `"sha256-${FAVICON.sha256}"`) {
    throw new Error('assets/favicon.ico must be the known empty auxiliary response.');
  }
  return {type:FAVICON.contentType, cache:REVALIDATE, variants:new Map([['identity', representation(bytes)]])};
}

async function loadSnapshot() {
  const repo = await realpath(REPO_ROOT);
  const { path: root } = await inspectConfinedPath(repo, 'dist/revision-2', true);
  const manifest = validateAssetManifest(JSON.parse((await readConfined(root, 'assets-manifest.json')).toString('utf8')));
  const routes = new Map();
  const register = (paths, resource) => {
    for (const path of paths) {
      if (routes.has(path)) throw new Error(`Duplicate frozen route: ${path}`);
      routes.set(path, resource);
    }
  };
  // The only route outside /revision-2/: retain the actual zero-byte source and its representation ETag.
  register([FAVICON.url], faviconResource(await readConfined(repo, FAVICON.path)));
  const load = async (name, { type = contentType(name), html = false, optional = false, cache = REVALIDATE, disposition } = {}) => {
    const bytes = await readConfined(root, name, optional);
    if (bytes === null) return null;
    const variants = new Map([['identity', representation(bytes)]]);
    if (html) {
      for (const [encoding, suffix, decompress] of [['br', '.br', brotliDecompressSync], ['gzip', '.gz', gunzipSync]]) {
        const compressed = await readConfined(root, `${name}${suffix}`, true);
        if (compressed === null) continue;
        let decoded;
        try { decoded = decompress(compressed, { maxOutputLength: bytes.length + 1 }); } catch (error) {
          throw new Error(`Invalid ${encoding} HTML sidecar: ${name}${suffix}`, { cause: error });
        }
        if (!decoded.equals(bytes)) throw new Error(`HTML sidecar does not match identity: ${name}${suffix}`);
        variants.set(encoding, representation(compressed));
      }
    }
    return { type, cache, disposition, variants };
  };
  for (const id of EDITIONS) {
    const resource = await load(`${id}/index.html`, { type: HTML, html: true });
    register([`${PREFIX}${id}`, `${PREFIX}${id}/`, `${PREFIX}${id}.html`, `${PREFIX}${id}/index.html`], resource);
  }
  for (const entry of manifest) {
    const resource = await load(entry.url.slice(PREFIX.length), { cache: IMMUTABLE });
    const { bytes, etag } = resource.variants.get('identity');
    if (bytes.length !== entry.bytes || etag !== `"sha256-${entry.sha256}"`) {
      throw new Error(`Asset does not match manifest size/SHA-256: ${entry.url}`);
    }
    register([entry.url], resource);
  }
  const reference = await load('reference', { type: 'image/png', optional: true });
  if (reference) register([`${PREFIX}reference`], reference);
  for (const id of EDITIONS) {
    const zip = id === 'hybrid';
    const resource = await load(`source/${id}`, {
      type: zip ? 'application/zip' : HTML, optional: true,
      disposition: `attachment; filename="revision-2-${id}.${zip ? 'zip' : 'html'}"`,
    });
    if (resource) register([`${PREFIX}source/${id}`], resource);
  }
  const report = await load('benchmarks/index.html', { type: HTML, html: true, optional: true });
  if (report) register([`${PREFIX}benchmarks/`, `${PREFIX}benchmarks/index.html`], report);
  const data = await load('benchmarks/data.json', { optional: true });
  if (data) register([`${PREFIX}benchmarks/data.json`], data);
  return routes;
}

function writeHeaders(res, status, headers) {
  // writeHead's direct header argument can bypass getHeader's cache. Store the
  // same values first so the auxiliary observer can read actual headers at finish.
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.writeHead(status);
}

function sendError(req, res, status, message, extra = {}) {
  const body = Buffer.from(`${message}\n`);
  writeHeaders(res, status, {
    'content-type': 'text/plain; charset=utf-8', 'content-length': body.length,
    'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra,
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}

/** Pure request handler factory; also usable with in-memory req/res fixtures. */
export function createBenchmarkRequestHandler(routes, audit = createAuxiliaryAuditLedger()) {
  return (req, res) => {
    // Observe before method, negotiation and conditionals, including failures.
    // The ledger itself excludes every path except /favicon.ico.
    audit.observe(req, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendError(req, res, 405, 'Only GET and HEAD are supported.', { allow: 'GET, HEAD' });
      return;
    }
    const pathname = parseRequestPath(req.url);
    if (pathname === null) {
      sendError(req, res, 400, 'Invalid request path.');
      return;
    }
    if (pathname === AUXILIARY_AUDIT.path) {
      const referer = parseAuxiliaryAuditQuery(req.url, req.headers.host);
      if (referer === null) {
        sendError(req, res, 400, 'A single same-origin benchmark page referer is required.');
        return;
      }
      const body = Buffer.from(JSON.stringify(audit.snapshot(referer)));
      writeHeaders(res, 200, {
        'content-type': 'application/json; charset=utf-8', 'content-length': body.length,
        'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
        'x-r2-benchmark-server': '1',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
      return;
    }
    const resource = routes.get(pathname);
    if (!resource) {
      sendError(req, res, 404, 'Not found in the frozen Revision 2 allowlist.');
      return;
    }
    const encoding = selectEncoding(req.headers['accept-encoding'], resource.variants.keys());
    if (encoding === null) {
      sendError(req, res, 406, 'No acceptable content encoding is available.', { vary: 'Accept-Encoding' });
      return;
    }
    const selected = resource.variants.get(encoding);
    const headers = {
      'content-type': resource.type, 'cache-control': resource.cache,
      etag: selected.etag, vary: 'Accept-Encoding',
      'x-content-type-options': 'nosniff', 'x-r2-benchmark-server': '1',
    };
    if (encoding !== 'identity') headers['content-encoding'] = encoding;
    if (resource.disposition) headers['content-disposition'] = resource.disposition;
    if (req.headers['if-match'] !== undefined && !matchesETag(req.headers['if-match'], selected.etag, false)) {
      sendError(req, res, 412, 'The selected representation does not match If-Match.', { vary: 'Accept-Encoding' });
      return;
    }
    if (matchesIfNoneMatch(req.headers['if-none-match'], selected.etag)) {
      writeHeaders(res, 304, headers);
      res.end();
      return;
    }
    headers['content-length'] = selected.bytes.length;
    writeHeaders(res, 200, headers);
    res.end(req.method === 'HEAD' ? undefined : selected.bytes);
  };
}

/** Importing this module does no I/O. Calling this loads files but does not listen. */
export async function createBenchmarkServer() {
  const routes = await loadSnapshot();
  return createServer({ requestTimeout: 30_000, headersTimeout: 15_000 }, createBenchmarkRequestHandler(routes));
}

async function main() {
  const { port, help } = parseArgs(process.argv.slice(2));
  if (help) {
    process.stdout.write(HELP);
    return;
  }
  const server = await createBenchmarkServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, HOST, () => {
      server.off('error', rejectListen);
      resolveListen();
    });
  });
  console.log(`Frozen R2 benchmark server ready: http://${HOST}:${port}/revision-2/svg/`);
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => server.closeAllConnections(), 5_000);
    deadline.unref();
    server.close(() => clearTimeout(deadline));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

const canonicalEntryPath = path => {
  const canonical = realpathSync(path);
  return process.platform === 'win32' ? canonical.toLowerCase() : canonical;
};
if (process.argv[1] && canonicalEntryPath(process.argv[1]) === canonicalEntryPath(fileURLToPath(import.meta.url))) {
  main().catch(error => {
    console.error(`R2 benchmark server: ${error.message}`);
    process.exitCode = 1;
  });
}
