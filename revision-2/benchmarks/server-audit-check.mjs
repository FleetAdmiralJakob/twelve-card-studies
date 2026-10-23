// Static, in-memory fixtures only: no server creation, listening, or browser.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {EventEmitter} from 'node:events';
import {test} from 'node:test';
import {AUXILIARY_AUDIT} from './config.mjs';
import {createAuxiliaryAuditLedger, isAuxiliaryReferer, parseAuxiliaryAuditQuery} from './server-audit.mjs';

const HOST = '127.0.0.1:4175';
const UUID = '01234567-89ab-cdef-0123-456789abcdef';
const REFERER = `http://${HOST}/revision-2/svg/?bench=${UUID}-edge-desktop-1`;
const OTHER_REFERER = REFERER.replace('/svg/', '/css/');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const EMPTY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const RECORD_KEYS = ['sequence', 'url', 'method', 'referer', 'receivedAtEpochMs',
  'finishedAtEpochMs', 'completed', 'aborted', 'status', 'contentType',
  'contentEncoding', 'contentLength', 'etag', 'encodedBodyBytes', 'bodySha256'].sort();

function request({url = '/favicon.ico', method = 'GET', referer = REFERER, host = HOST} = {}) {
  const req = new EventEmitter();
  Object.assign(req, {url, method, headers:{host, referer}, aborted:false});
  req.on('error', () => {}); // Simulate the application's own error handling.
  return req;
}

class Response extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 200;
    this.headers = new Map();
    this.calls = [];
    this.callbacks = [];
    this.writableEnded = false;
    this.writableFinished = false;
    this.destroyed = false;
    this.writeResult = false;
    this.on('error', () => {});
  }
  setHeader(name, value) { this.headers.set(name.toLowerCase(), value); return this; }
  getHeader(name) { return this.headers.get(name.toLowerCase()); }
  write(...args) {
    this.calls.push({method:'write', receiver:this, args});
    if (typeof args.at(-1) === 'function') this.callbacks.push(args.at(-1));
    return this.writeResult;
  }
  end(...args) {
    this.calls.push({method:'end', receiver:this, args});
    if (typeof args.at(-1) === 'function') this.callbacks.push(args.at(-1));
    this.writableEnded = true;
    return this;
  }
  finish() {
    this.writableFinished = true;
    this.emit('finish');
    for (const callback of this.callbacks.splice(0)) callback();
  }
}

function observe(ledger, options) {
  const req = request(options), res = new Response();
  assert.equal(ledger.observe(req, res), true);
  return {req, res};
}

function record(ledger, referer = REFERER) {
  const snapshot = ledger.snapshot(referer);
  assert.equal(snapshot.records.length, 1);
  return snapshot.records[0];
}

function unfinished(value, aborted = false) {
  assert.equal(value.completed, false);
  assert.equal(value.aborted, aborted);
  for (const key of ['finishedAtEpochMs', 'status', 'contentType', 'contentLength', 'etag', 'encodedBodyBytes', 'bodySha256']) {
    assert.equal(value[key], null, `${key} must not claim completed response evidence`);
  }
}

test('snapshot schema, exact referer isolation, detached copies, and no clearing', () => {
  const ledger = createAuxiliaryAuditLedger();
  observe(ledger);
  observe(ledger, {referer:OTHER_REFERER});
  const first = ledger.snapshot(REFERER);
  assert.deepEqual(Object.keys(first).sort(), ['schemaVersion', 'serverInstanceId', 'clock', 'queriedAtEpochMs', 'referer', 'limit', 'evictedRecords', 'records'].sort());
  assert.equal(first.schemaVersion, 1);
  assert.match(first.serverInstanceId, /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i);
  assert.equal(first.clock, 'unix-epoch-ms/monotonic');
  assert.ok(Number.isFinite(first.queriedAtEpochMs) && first.queriedAtEpochMs > 1e12);
  assert.equal(first.referer, REFERER);
  assert.equal(first.limit, 2048);
  assert.equal(first.evictedRecords, 0);
  assert.equal(first.records.length, 1);
  assert.deepEqual(Object.keys(first.records[0]).sort(), RECORD_KEYS);
  const original = structuredClone(first.records[0]);
  assert.equal(original.url, `http://${HOST}/favicon.ico`);
  assert.equal(original.method, 'GET');
  assert.equal(original.referer, REFERER);
  assert.ok(Number.isSafeInteger(original.sequence) && original.sequence > 0);
  assert.ok(original.receivedAtEpochMs <= first.queriedAtEpochMs);
  unfinished(original);
  first.records[0].method = 'corrupted';
  first.records.length = 0;
  first.limit = 99;
  const second = ledger.snapshot(REFERER);
  assert.deepEqual(second.records, [original]);
  assert.equal(second.limit, 2048);
  assert.equal(second.serverInstanceId, first.serverInstanceId);
  assert.ok(second.queriedAtEpochMs >= first.queriedAtEpochMs);
  assert.equal(record(ledger, OTHER_REFERER).referer, OTHER_REFERER);
  assert.deepEqual(ledger.snapshot(REFERER.replace('-1', '-2')).records, []);
  assert.notEqual(createAuxiliaryAuditLedger().snapshot(REFERER).serverInstanceId, second.serverInstanceId);
});

test('stream hashing uses each write immediately and captures actual finish metadata', () => {
  const ledger = createAuxiliaryAuditLedger();
  const {req, res} = observe(ledger, {method:'POST'});
  const callbacks = [];
  const written = () => callbacks.push('write');
  const ended = () => callbacks.push('end');
  const bytes = Buffer.from([0, 255, 17]);
  const backing = new Uint8Array([99, 2, 3, 4, 88]);
  const view = backing.subarray(1, 4);
  const expected = Buffer.concat([Buffer.from('é', 'latin1'), Buffer.from(bytes), Buffer.from(view), Buffer.from('f09f9880', 'hex'), Buffer.from('終', 'utf8')]);
  assert.equal(res.write('é', 'latin1', written), false);
  res.writeResult = true;
  assert.equal(res.write(bytes), true);
  assert.equal(res.write(view), true);
  assert.equal(res.write('f09f9880', 'hex'), true);
  bytes.fill(42);
  backing.fill(42); // Retaining references until finish would produce the wrong hash.
  req.emit('close'); // A normal request close is not a response abort.
  assert.equal(res.end('終', 'utf8', ended), res);
  unfinished(record(ledger));
  res.statusCode = 405;
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.setHeader('content-encoding', 'gzip');
  res.setHeader('content-length', String(expected.length));
  res.setHeader('etag', '"actual-response"');
  res.setHeader('set-cookie', 'not-in-audit');
  res.finish();
  const value = record(ledger);
  assert.equal(value.completed, true);
  assert.equal(value.aborted, false);
  assert.equal(value.method, 'POST');
  assert.equal(value.status, 405);
  assert.equal(value.contentType, 'text/plain; charset=utf-8');
  assert.equal(value.contentEncoding, 'gzip');
  assert.equal(value.contentLength, expected.length);
  assert.equal(value.etag, '"actual-response"');
  assert.equal(value.encodedBodyBytes, expected.length);
  assert.equal(value.bodySha256, digest(expected));
  assert.ok(value.finishedAtEpochMs >= value.receivedAtEpochMs);
  assert.ok(value.finishedAtEpochMs <= ledger.snapshot(REFERER).queriedAtEpochMs);
  assert.deepEqual(Object.keys(value).sort(), RECORD_KEYS);
  assert.deepEqual(callbacks, ['write', 'end']);
  assert.deepEqual(res.calls[0].args, ['é', 'latin1', written]);
  assert.equal(res.calls[1].args[0], bytes);
  assert.equal(res.calls[2].args[0], view);
  assert.deepEqual(res.calls.at(-1).args, ['終', 'utf8', ended]);
  assert.ok(res.calls.every(call => call.receiver === res));
  res.emit('close');
  req.emit('aborted');
  assert.deepEqual(record(ledger), value);
});

test('empty end and callback-only end complete only on finish with empty SHA256', () => {
  for (const callbackOnly of [false, true]) {
    const ledger = createAuxiliaryAuditLedger();
    const {res} = observe(ledger);
    let called = 0;
    const callback = () => called++;
    assert.equal(callbackOnly ? res.end(callback) : res.end(), res);
    unfinished(record(ledger));
    res.finish();
    const value = record(ledger);
    assert.equal(value.completed, true);
    assert.equal(value.status, 200);
    assert.equal(value.contentEncoding, 'identity');
    assert.equal(value.contentLength, null);
    assert.equal(value.contentType, null);
    assert.equal(value.etag, null);
    assert.equal(value.encodedBodyBytes, 0);
    assert.equal(value.bodySha256, EMPTY_HASH);
    assert.equal(called, Number(callbackOnly));
  }
});

test('response close/error and request aborted/error never publish success evidence', () => {
  for (const [emitter, event] of [['res', 'close'], ['res', 'error'], ['req', 'aborted'], ['req', 'error']]) {
    const ledger = createAuxiliaryAuditLedger();
    const pair = observe(ledger);
    pair.res.write(Buffer.from('partial'));
    pair[emitter].emit(event, ...(event === 'error' ? [new Error('fixture failure')] : []));
    unfinished(record(ledger), true);
    pair.res.end('late');
    pair.res.finish();
    unfinished(record(ledger), true);
  }
});

test('FIFO limit counts pending and completed responses globally and every eviction', () => {
  const ledger = createAuxiliaryAuditLedger({limit:2});
  const pending = observe(ledger);
  const firstSequence = record(ledger).sequence;
  const completed = observe(ledger, {referer:OTHER_REFERER});
  completed.res.end();
  completed.res.finish();
  const secondSequence = record(ledger, OTHER_REFERER).sequence;
  const third = observe(ledger);
  assert.equal(ledger.snapshot(REFERER).limit, 2);
  assert.equal(ledger.snapshot(REFERER).evictedRecords, 1);
  assert.ok(record(ledger).sequence > secondSequence);
  assert.ok(secondSequence > firstSequence);
  pending.res.end('evicted pending response');
  pending.res.finish();
  assert.equal(ledger.snapshot(REFERER).records.length, 1);
  unfinished(record(ledger));
  observe(ledger, {referer:OTHER_REFERER});
  assert.equal(ledger.snapshot(REFERER).evictedRecords, 2);
  assert.equal(ledger.snapshot(OTHER_REFERER).evictedRecords, 2);
  unfinished(record(ledger, OTHER_REFERER));
  third.res.end();
  third.res.finish();
  assert.equal(record(ledger).bodySha256, EMPTY_HASH);
  assert.equal(ledger.snapshot(REFERER).evictedRecords, 2);
});

test('only bounded favicon requests with valid same-host benchmark referers are accepted', () => {
  for (const edition of ['svg', 'css', 'basic', 'hybrid']) {
    for (const engine of ['edge', 'webkit']) for (const profile of ['desktop', 'mobile']) {
      const referer = `http://${HOST}/revision-2/${edition}/?bench=${UUID}-${engine}-${profile}-2`;
      assert.equal(isAuxiliaryReferer(referer, HOST), true);
      observe(createAuxiliaryAuditLedger(), {referer});
    }
  }
  for (const port of [1, 80, 65535]) {
    const host = `127.0.0.1:${port}`;
    observe(createAuxiliaryAuditLedger(), {host, referer:REFERER.replace(HOST, host)});
  }
  const invalidReferers = [undefined, null, 42, [REFERER], '',
    REFERER.replace('http:', 'https:'), REFERER.replace('127.0.0.1', 'localhost'),
    REFERER.replace(':4175', ':0'), REFERER.replace(':4175', ':65536'),
    REFERER.replace('/svg/', '/unknown/'), REFERER.replace('/svg/', '/svg'),
    REFERER.replace(UUID, 'not-a-uuid'), REFERER.replace('-edge-', '-chrome-'),
    REFERER.replace('-desktop-', '-tablet-'), REFERER.replace(/-1$/, '-0'),
    REFERER.replace(/-1$/, '--1'), REFERER.replace(/-1$/, '-1.5'),
    `${REFERER}&extra=1`, `${REFERER}#fragment`, `${REFERER}\r\nX-Test: 1`,
    `${REFERER}${'x'.repeat(70000)}`];
  const invalid = [
    ...invalidReferers.map(referer => ({referer})),
    ...[undefined, null, [HOST], 'localhost:4175', '127.0.0.1:4176', `${HOST}.evil`].map(host => ({host})),
    ...['', 'GET POST', 'GET\r\n', 'GET\0', 'X'.repeat(70000), null, 42].map(method => ({method})),
    ...['/other.ico', '/favicon.ico/', '/favicon.ico#fragment', `/favicon.ico?${'x'.repeat(70000)}`, AUXILIARY_AUDIT.path].map(url => ({url})),
  ];
  for (const options of invalid) {
    const ledger = createAuxiliaryAuditLedger();
    const req = request(), res = new Response();
    // Assign explicitly so undefined tests are not replaced by fixture defaults.
    for (const [key, value] of Object.entries(options)) {
      if (key === 'referer' || key === 'host') req.headers[key] = value;
      else req[key] = value;
    }
    assert.equal(ledger.observe(req, res), false, `must reject ${JSON.stringify(options).slice(0, 160)}`);
    assert.equal(res.write, Response.prototype.write);
    assert.equal(res.end, Response.prototype.end);
    assert.deepEqual(ledger.snapshot(REFERER).records, []);
  }
  for (const referer of invalidReferers) assert.equal(isAuxiliaryReferer(referer, HOST), false);
});

test('audit query requires one exact same-host referer and audit requests are never recorded', () => {
  const target = `${AUXILIARY_AUDIT.path}?referer=${encodeURIComponent(REFERER)}`;
  assert.equal(parseAuxiliaryAuditQuery(target, HOST), REFERER);
  for (const [url, host] of [
    [AUXILIARY_AUDIT.path, HOST], [`${AUXILIARY_AUDIT.path}?referer=`, HOST],
    [`${target}&referer=${encodeURIComponent(REFERER)}`, HOST], [`${target}&extra=1`, HOST],
    [target, '127.0.0.1:4176'], [target, undefined], [target, [HOST]],
    [target.replace('referer=', 'referrer='), HOST], [target.replace(AUXILIARY_AUDIT.path, '/other'), HOST],
    [`${AUXILIARY_AUDIT.path}?referer=%ZZ`, HOST], [`${target}${'x'.repeat(70000)}`, HOST],
  ]) assert.equal(parseAuxiliaryAuditQuery(url, host), null);
  const ledger = createAuxiliaryAuditLedger();
  for (const method of ['GET', 'HEAD']) {
    const res = new Response();
    assert.equal(ledger.observe(request({url:target, method}), res), false);
    res.end();
    res.finish();
  }
  assert.deepEqual(ledger.snapshot(REFERER).records, []);
});
