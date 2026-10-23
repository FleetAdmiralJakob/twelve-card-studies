import {performance} from 'node:perf_hooks';
import {AUXILIARY_AUDIT, FAVICON, sha256} from './config.mjs';

export const SERVER_OBSERVED_SOURCE = 'observed-server-response + resource-timing';
const epochNow = () => performance.timeOrigin+performance.now();
const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const sumKnown = (records,key) => records.every(record => finite(record[key])) ? records.reduce((sum,record) => sum+record[key],0) : null;

// Called from Node only AFTER the browser workload. This GET retrieves observations; it never requests the favicon.
export async function fetchAuxiliaryAudit(documentURL) {
  const pageURL=new URL(documentURL);
  assert(pageURL.protocol === 'http:' && pageURL.hostname === '127.0.0.1', 'Auxiliary audit requires loopback HTTP');
  const url=new URL(AUXILIARY_AUDIT.path,pageURL.origin);
  url.searchParams.set('referer',documentURL);
  const requestedAtEpochMs=epochNow();
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(5000),headers:{accept:'application/json'}});
  assert(response.status === 200, `Auxiliary audit HTTP ${response.status}; restart the frozen benchmark server with the current harness`);
  assert(response.headers.get('content-type')?.split(';')[0].trim() === 'application/json', 'Auxiliary audit returned non-JSON content');
  const raw=Buffer.from(await response.arrayBuffer());
  assert(raw.length <= 2*1024*1024, 'Auxiliary audit exceeds the bounded response size');
  return {url:url.href, method:'GET', status:response.status, requestedAtEpochMs, receivedAtEpochMs:epochNow(), responseSha256:sha256(raw), responseBody:raw.toString('utf8')};
}

export function aggregateResources(resources, failures, coldCutoff) {
  const aggregate = selected => {
    const encodedBodyBytes=sumKnown(selected,'encodedBodyBytes');
    return {requests:selected.length,encodedBodyBytes,decodedBodyBytes:sumKnown(selected,'decodedBodyBytes'),transferBytes:sumKnown(selected,'transferBytes'),responseHeadersBytes:sumKnown(selected,'responseHeadersBytes'),requestBytes:sumKnown(selected,'requestBytes'),
      resourceEncodedBodyBytes:selected.every(r => finite(r.resourceTiming?.encodedBodySize) && (r.resourceTiming.encodedBodySize>0 || r.decodedBodyBytes===0)) ? selected.reduce((sum,r) => sum+r.resourceTiming.encodedBodySize,0) : null,
      complete:selected.length>0 && encodedBodyBytes!==null && !failures.some(f => selected.some(r => r.url===f.url)),
      source:[...new Set(selected.map(r => r.source || 'unavailable'))].join(' + '),cachedResponses:selected.filter(r=>r.fromCache).length,
      pendingAtCold:selected.filter(r=>r.cold && (r.responseEnd===null || r.responseEnd>coldCutoff)).length};
  };
  return {cold:aggregate(resources.filter(resource=>resource.cold)),workload:aggregate(resources)};
}

function auditPayload(evidence, documentURL, timeOrigin, workloadCutoff) {
  assert(finite(timeOrigin) && timeOrigin>0 && finite(workloadCutoff), 'Missing browser epoch/workload boundary for auxiliary audit');
  assert(evidence?.method==='GET' && evidence.status===200 && typeof evidence.responseBody==='string' && sha256(Buffer.from(evidence.responseBody))===evidence.responseSha256, 'Auxiliary audit response bytes/identity are not verified');
  const url=new URL(AUXILIARY_AUDIT.path,new URL(documentURL).origin); url.searchParams.set('referer',documentURL);
  assert(evidence.url===url.href && finite(evidence.requestedAtEpochMs) && finite(evidence.receivedAtEpochMs) && evidence.receivedAtEpochMs>=evidence.requestedAtEpochMs, 'Invalid auxiliary audit request evidence');
  assert(evidence.requestedAtEpochMs >= timeOrigin+workloadCutoff-AUXILIARY_AUDIT.matchToleranceMs, 'Auxiliary audit was requested before the browser workload ended');
  const payload=JSON.parse(evidence.responseBody);
  assert(payload.schemaVersion===AUXILIARY_AUDIT.schemaVersion && payload.clock==='unix-epoch-ms/monotonic' && /^[a-f\d-]{36}$/i.test(payload.serverInstanceId) && payload.referer===documentURL, 'Auxiliary audit schema/server/referer mismatch');
  assert(payload.limit===AUXILIARY_AUDIT.limit && payload.evictedRecords===0 && Array.isArray(payload.records) && payload.records.length<=payload.limit, 'Auxiliary audit is truncated, evicted or unbounded');
  assert(finite(payload.queriedAtEpochMs) && payload.queriedAtEpochMs>=evidence.requestedAtEpochMs-AUXILIARY_AUDIT.matchToleranceMs && payload.queriedAtEpochMs<=evidence.receivedAtEpochMs+AUXILIARY_AUDIT.matchToleranceMs, 'Auxiliary audit query timestamp is outside its observed HTTP interval');
  const ids=new Set();
  for (const record of payload.records) {
    assert(Number.isInteger(record.sequence) && record.sequence>0 && !ids.has(record.sequence), 'Duplicate/invalid auxiliary server sequence'); ids.add(record.sequence);
    assert(record.referer===documentURL && record.url===new URL(FAVICON.url,documentURL).href && finite(record.receivedAtEpochMs), 'Auxiliary observation has a wrong referer/URL/timestamp');
  }
  return payload;
}

function verifyActualEmptyResponse(record) {
  assert(record.completed===true && record.aborted===false && finite(record.finishedAtEpochMs) && record.finishedAtEpochMs>=record.receivedAtEpochMs, 'Auxiliary response did not finish successfully');
  assert(record.method==='GET' && record.status===200 && record.contentEncoding==='identity' && record.contentType?.split(';')[0].trim().toLowerCase()===FAVICON.contentType, 'Observed auxiliary response was not a GET 200 identity image/x-icon');
  assert(record.contentLength===0 && record.encodedBodyBytes===0 && record.bodySha256===FAVICON.sha256 && record.etag===`"sha256-${FAVICON.sha256}"`, 'Observed auxiliary response body was not the verified empty representation');
}

// Pure reconciliation. Keep original browser observations and the raw audit response for independent report validation.
export function reconcileAuxiliaryAudit(network, evidence, {documentURL,timeOrigin}) {
  const result=structuredClone(network), matches=[], outsideWorkloadSequences=[];
  result.auxiliaryAudit={documentURL,timeOrigin,matchToleranceMs:AUXILIARY_AUDIT.matchToleranceMs,evidence,matches,outsideWorkloadSequences};
  try {
    const payload=auditPayload(evidence,documentURL,timeOrigin,result.workloadCutoff);
    const tolerance=AUXILIARY_AUDIT.matchToleranceMs, used=new Set();
    for (const [resourceIndex,resource] of result.resources.entries()) {
      if (new URL(resource.url).pathname!==FAVICON.url) continue;
      const rt=resource.resourceTiming;
      const isRTOnly=resource.source==='resource-timing-only';
      const hasTiming=rt && rt.name===resource.url && finite(rt.startTime) && finite(rt.responseEnd) && rt.responseEnd>rt.startTime;
      if (isRTOnly) assert(hasTiming && rt.entryType==='resource' && rt.startTime<=result.workloadCutoff && rt.encodedBodySize===0 && rt.decodedBodySize===0 && resource.fromCache!==true, 'Resource-Timing-only auxiliary entry lacks a completed, noncached, exact-zero body observation');
      if (!hasTiming) continue;
      const browserStartEpochMs=timeOrigin+rt.startTime, browserEndEpochMs=timeOrigin+rt.responseEnd;
      const candidates=payload.records.filter(record => record.url===resource.url && record.receivedAtEpochMs>=browserStartEpochMs-tolerance && record.receivedAtEpochMs<=browserEndEpochMs+tolerance);
      assert(candidates.length<=1 && (!isRTOnly || candidates.length===1), `Auxiliary request has ${candidates.length} matching actual server responses; exactly one is required`);
      if (!candidates.length) continue; // Playwright can expose a cache response with no actual server request.
      const record=candidates[0];
      assert(!used.has(record.sequence), 'One server response matches multiple browser observations');
      verifyActualEmptyResponse(record);
      assert(record.finishedAtEpochMs>=browserStartEpochMs-tolerance && record.finishedAtEpochMs<=browserEndEpochMs+tolerance, 'Observed server response finish is outside the browser request interval');
      used.add(record.sequence);
      const match={resourceIndex,sequence:record.sequence,serverInstanceId:payload.serverInstanceId,browserStartEpochMs,browserEndEpochMs,toleranceMs:tolerance};
      matches.push(match);
      if (isRTOnly) {
        const browserObservation=structuredClone(resource);
        Object.assign(resource,{method:record.method,status:record.status,contentType:record.contentType,contentEncoding:record.contentEncoding,encodedBodyBytes:record.encodedBodyBytes,decodedBodyBytes:record.encodedBodyBytes,bodySha256:record.bodySha256,source:SERVER_OBSERVED_SOURCE,browserObservation,serverEvidence:match});
        // Transfer bytes and browser timing stay untouched. Server logging is not response-header/request-byte measurement.
      } else {
        assert(resource.status===record.status && resource.method===record.method && resource.contentEncoding===record.contentEncoding && resource.encodedBodyBytes===record.encodedBodyBytes && resource.decodedBodyBytes===record.encodedBodyBytes && resource.bodySha256===record.bodySha256, 'Playwright auxiliary response conflicts with actual server observation');
      }
    }
    for (const record of payload.records) {
      if (used.has(record.sequence)) continue;
      const inWindow=record.receivedAtEpochMs>=timeOrigin-tolerance && record.receivedAtEpochMs<=timeOrigin+result.workloadCutoff+tolerance;
      assert(!inWindow, 'Actual server auxiliary request has no unique browser request in the workload ledger');
      outsideWorkloadSequences.push(record.sequence);
    }
  } catch (error) {
    result.failures.push({url:new URL(FAVICON.url,documentURL).href,reason:`Auxiliary observation reconciliation failed: ${error.message}`});
  }
  Object.assign(result,aggregateResources(result.resources,result.failures,result.coldCutoff));
  return result;
}

export function verifyAuxiliaryAudit(network, documentURL) {
  const errors=[], audit=network.auxiliaryAudit;
  if (!audit) {
    if (network.resources.some(resource=>resource.source===SERVER_OBSERVED_SOURCE || resource.serverEvidence || resource.browserObservation)) errors.push('Server-observed resource lacks the original auxiliary audit evidence');
    return errors;
  }
  if (audit.documentURL!==documentURL || audit.matchToleranceMs!==AUXILIARY_AUDIT.matchToleranceMs) errors.push('Auxiliary audit page/tolerance differs from the measured contract');
  const original=structuredClone(network);
  delete original.auxiliaryAudit;
  original.failures=[];
  original.resources=original.resources.map(resource => resource.source===SERVER_OBSERVED_SOURCE ? resource.browserObservation : resource);
  if (original.resources.some(resource=>!resource || resource.source===SERVER_OBSERVED_SOURCE || resource.serverEvidence || resource.browserObservation)) return [...errors,'Original browser resource observation is missing or recursive'];
  const replay=reconcileAuxiliaryAudit(original,audit.evidence,{documentURL,timeOrigin:audit.timeOrigin});
  errors.push(...replay.failures.map(f=>f.reason));
  if (!same(replay.resources,network.resources) || !same(replay.auxiliaryAudit,audit)) errors.push('Stored server-observed resources do not reproduce from browser timing and raw server evidence');
  return errors;
}
