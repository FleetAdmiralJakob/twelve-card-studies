import {createHash, randomUUID} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {AUXILIARY_AUDIT} from './config.mjs';

const MAX_TARGET_LENGTH = 2048;
const MAX_REFERER_LENGTH = 512;
const MAX_HEADER_LENGTH = 1024;
const MAX_METHOD_LENGTH = 32;
const HOST_PATTERN = /^127\.0\.0\.1:([1-9]\d{0,4})$/;
const REFERER_PATTERN = /^http:\/\/(127\.0\.0\.1:([1-9]\d{0,4}))\/revision-2\/(?:svg|css|basic|hybrid)\/\?bench=[a-fA-F\d]{8}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{12}-(?:edge|webkit)-(?:desktop|mobile)-([1-9]\d{0,15})$/;
const epochNow = () => performance.timeOrigin + performance.now();
const boundedText = (value, limit) => typeof value === 'string' && value.length <= limit && !/[\x00-\x20\x7f]/.test(value);

function validHost(host) {
  if (!boundedText(host, 21)) return false;
  const match = HOST_PATTERN.exec(host);
  return !!match && Number(match[1]) <= 65535;
}

/** Only exact, unique local benchmark page URLs are eligible; no normalization. */
export function isAuxiliaryReferer(referer, host) {
  if (!boundedText(referer, MAX_REFERER_LENGTH)) return false;
  const match = REFERER_PATTERN.exec(referer);
  if (!match || Number(match[2]) > 65535 || !Number.isSafeInteger(Number(match[3]))) return false;
  return host === undefined || (validHost(host) && match[1] === host);
}

/** Read-only endpoint query parser. Duplicate, extra and out-of-origin arguments fail. */
export function parseAuxiliaryAuditQuery(target, host) {
  if (!boundedText(target, MAX_TARGET_LENGTH) || !validHost(host)) return null;
  const queryIndex = target.indexOf('?');
  if (queryIndex < 0 || target.slice(0, queryIndex) !== AUXILIARY_AUDIT.path) return null;
  const params = new URLSearchParams(target.slice(queryIndex + 1));
  const referer = params.get('referer');
  return params.size === 1 && isAuxiliaryReferer(referer, host) ? referer : null;
}

// Only these explicit response headers are read. An unrepresentable value stays
// null rather than truncating a value and claiming it was the actual header.
function responseHeader(res, name) {
  const value = res.getHeader(name);
  if (value === undefined) return null;
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value);
  return text.length <= MAX_HEADER_LENGTH && !/[\x00-\x1f\x7f]/.test(text) ? text : null;
}

function contentLength(res) {
  const value = responseHeader(res, 'content-length');
  if (value === null || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

/**
 * In-memory observation only: no files, sockets, fetches or response mutations.
 *
 * observe(req, res) must run before any response branch. It returns true only
 * for the first observation of a favicon response with an eligible same-origin
 * Referer. It wraps write/end without changing their arguments, callbacks,
 * return values or exceptions, and hashes their chunks incrementally. Set
 * response headers with setHeader before writeHead so getHeader can read them.
 *
 * snapshot(referer) returns a detached, exact-match payload and never clears
 * anything. Invalid referers throw TypeError. Pending/aborted records have null
 * finish/status/body evidence; only an observed finish publishes those fields.
 * Request close is not an abort: Node emits it on ordinary completed requests.
 *
 * The FIFO limit includes pending responses. Every eviction increments the
 * global evictedRecords counter (even for a different referer), and releases
 * the evicted response's observers/hash. Consumers must reject an incomplete
 * ledger. A smaller positive limit is available for in-memory tests only.
 */
export function createAuxiliaryAuditLedger({limit = AUXILIARY_AUDIT.limit} = {}) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > AUXILIARY_AUDIT.limit) {
    throw new RangeError(`Auxiliary ledger limit must be 1..${AUXILIARY_AUDIT.limit}.`);
  }
  const serverInstanceId = randomUUID();
  const entries = new Map();
  const observed = new WeakSet();
  let sequence = 0;
  let evictedRecords = 0;

  function observe(req, res) {
    const target = req.url;
    if (!boundedText(target, MAX_TARGET_LENGTH) || target.split('?', 1)[0] !== '/favicon.ico'
        || /[\\#]/.test(target)) return false;
    const receivedAtEpochMs = epochNow();
    const host = req.headers?.host;
    const referer = req.headers?.referer;
    if (!validHost(host) || !isAuxiliaryReferer(referer, host)
        || !boundedText(req.method, MAX_METHOD_LENGTH)
        || !/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(req.method) || observed.has(res)) return false;
    observed.add(res);

    if (entries.size === limit) {
      const oldest = entries.keys().next().value;
      entries.get(oldest).dispose?.();
      entries.delete(oldest);
      evictedRecords++;
    }
    const record = {
      sequence: ++sequence,
      url: `http://${host}${target}`, method: req.method, referer,
      receivedAtEpochMs, finishedAtEpochMs: null, completed: false, aborted: false,
      status: null, contentType: null, contentEncoding: 'identity', contentLength: null,
      etag: null, encodedBodyBytes: null, bodySha256: null,
    };
    const entry = {record, dispose: null};
    entries.set(record.sequence, entry);
    let hash = createHash('sha256');
    let bodyBytes = 0;
    let stopped = false;
    let callDepth = 0;
    const originalWrite = res.write;
    const originalEnd = res.end;
    const ownWrite = Object.getOwnPropertyDescriptor(res, 'write');
    const ownEnd = Object.getOwnPropertyDescriptor(res, 'end');

    function dispose() {
      if (stopped) return;
      stopped = true;
      hash = null;
      entry.dispose = null;
      res.off('finish', finish);
      res.off('close', abort);
      res.off('error', abort);
      req.off('aborted', abort);
      req.off('error', abort);
      // Do not overwrite a wrapper installed by another observer later.
      if (res.write === wrappedWrite) {
        if (ownWrite) Object.defineProperty(res, 'write', ownWrite);
        else delete res.write;
      }
      if (res.end === wrappedEnd) {
        if (ownEnd) Object.defineProperty(res, 'end', ownEnd);
        else delete res.end;
      }
    }

    function abort() {
      if (stopped) return;
      record.aborted = true;
      dispose();
    }

    function finish() {
      if (stopped) return;
      record.finishedAtEpochMs = epochNow();
      record.status = res.statusCode;
      record.contentType = responseHeader(res, 'content-type');
      record.contentEncoding = res.getHeader('content-encoding') === undefined
        ? 'identity' : responseHeader(res, 'content-encoding');
      record.contentLength = contentLength(res);
      record.etag = responseHeader(res, 'etag');
      record.encodedBodyBytes = bodyBytes;
      record.bodySha256 = hash.digest('hex');
      record.completed = true;
      dispose();
    }

    function capture(chunk, encoding) {
      if (chunk === undefined || chunk === null || typeof chunk === 'function') return;
      let bytes;
      if (typeof chunk === 'string') bytes = Buffer.from(chunk, typeof encoding === 'string' ? encoding : 'utf8');
      else if (ArrayBuffer.isView(chunk)) bytes = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      else throw new TypeError('Unobservable response body chunk.');
      bodyBytes += bytes.byteLength;
      hash.update(bytes);
    }

    function invoke(original, receiver, args) {
      if (!stopped && callDepth === 0 && receiver === res) {
        if (res.writableEnded || res.destroyed) abort();
        else {
          try { capture(args[0], args[1]); } catch { abort(); }
        }
      }
      callDepth++;
      try { return Reflect.apply(original, receiver, args); }
      catch (error) { abort(); throw error; }
      finally { callDepth--; }
    }
    function wrappedWrite(...args) { return invoke(originalWrite, this, args); }
    function wrappedEnd(...args) { return invoke(originalEnd, this, args); }
    entry.dispose = dispose;
    res.write = wrappedWrite;
    res.end = wrappedEnd;
    res.once('finish', finish);
    res.once('close', abort);
    res.once('error', abort);
    req.once('aborted', abort);
    req.once('error', abort);
    if (req.aborted || res.destroyed) abort();
    return true;
  }

  function snapshot(referer) {
    if (!isAuxiliaryReferer(referer)) throw new TypeError('Invalid auxiliary audit referer.');
    return {
      schemaVersion: AUXILIARY_AUDIT.schemaVersion, serverInstanceId,
      clock: 'unix-epoch-ms/monotonic', queriedAtEpochMs: epochNow(), referer,
      limit, evictedRecords,
      records: [...entries.values()].filter(entry => entry.record.referer === referer)
        .map(entry => ({...entry.record})),
    };
  }

  return Object.freeze({observe, snapshot});
}
