import {sha256} from './four-config.mjs';

const finiteSize = value => Number.isFinite(value) && value >= 0;
const sumKnown = (records, key) => records.every(r=>finiteSize(r[key])) ? records.reduce((n,r)=>n+r[key],0) : null;

// Passive Playwright events only. Do not request bodies, headers, sizes, or CDP data during timing.
export function observeNetwork(page) {
  const records = [];
  const byRequest = new Map();
  page.on('request', request => {
    if (!/^https?:/.test(request.url())) return;
    const record = {request, seenAt:Date.now(), finished:false, failure:null};
    records.push(record);
    byRequest.set(request, record);
  });
  page.on('requestfinished', request => { const record=byRequest.get(request); if (record) record.finished=true; });
  page.on('requestfailed', request => {
    const record=byRequest.get(request);
    if (record) { record.finished=true; record.failure=request.failure()?.errorText || 'Request failed'; }
  });
  return records;
}

export async function collectNetwork(observed, timing, assetDecoded) {
  const resources = [];
  const warnings = [];
  const failures = [];
  const used = new Set();
  // A stable snapshot prevents late background requests changing the measured workload boundary.
  for (const record of [...observed]) {
    const {request} = record;
    const requestTiming = request.timing();
    const start = requestTiming.startTime >= 0 ? requestTiming.startTime-timing.timeOrigin : record.seenAt-timing.timeOrigin;
    if (start > timing.workloadCutoff) continue;
    const candidates = timing.workload.map((entry,index)=>({entry,index}))
      .filter(({entry,index})=>!used.has(index) && entry.name===request.url());
    candidates.sort((a,b)=>Math.abs(a.entry.startTime-start)-Math.abs(b.entry.startTime-start));
    const candidate = candidates[0];
    if (candidate) used.add(candidate.index);
    const entry = candidate?.entry;
    const item = {
      url:request.url(), method:request.method(), type:request.resourceType(), startTime:start,
      responseEnd:requestTiming.responseEnd >= 0 ? start+requestTiming.responseEnd : null,
      cold:start <= timing.coldCutoff, status:null, contentType:null, contentEncoding:null,
      encodedBodyBytes:null, decodedBodyBytes:null, transferBytes:null,
      responseHeadersBytes:null, requestBytes:null, bodySha256:null, source:null,
      // A zero transferSize alone can also mean unsupported/restricted timing.
      fromCache:entry?.deliveryType==='cache' ? true : null,
      fromServiceWorker:false, resourceTiming:entry || null,
    };
    if (record.failure || !record.finished) {
      failures.push({url:item.url, reason:record.failure || 'Request still pending when the workload ended'});
      resources.push(item);
      continue;
    }
    const response = await request.response();
    if (!response) {
      failures.push({url:item.url, reason:'No response available'});
      resources.push(item);
      continue;
    }
    item.status=response.status();
    item.fromServiceWorker=response.fromServiceWorker();
    const headers = await response.allHeaders();
    item.contentType=headers['content-type'] || null;
    item.contentEncoding=headers['content-encoding'] || 'identity';
    const contentLength = /^\d+$/.test(headers['content-length'] || '') ? Number(headers['content-length']) : null;
    const bodyless = request.method()==='HEAD' || [204,205,304].includes(item.status) || (item.status>=300 && item.status<400);
    let sizes;
    try { sizes=await request.sizes(); }
    catch (error) { warnings.push({url:item.url, reason:`request.sizes unavailable: ${error.message}`}); }
    // response.body is decoded; it is never substituted for encoded/compressed network bytes.
    if (bodyless) item.decodedBodyBytes=0;
    else {
      try {
        const body=await response.body();
        item.decodedBodyBytes=body.length;
        item.bodySha256=sha256(body);
      } catch (error) {
        if (finiteSize(entry?.decodedBodySize) && entry.decodedBodySize>0) item.decodedBodyBytes=entry.decodedBodySize;
        warnings.push({url:item.url, reason:`Response body unavailable after timing: ${error.message}`});
      }
    }
    const reported = sizes?.responseBodySize;
    // Some engines return zero for unsupported sizing. Only accept a zero when it is explained.
    if (finiteSize(reported) && (reported>0 || bodyless || item.decodedBodyBytes===0 || item.fromCache)) {
      item.encodedBodyBytes=reported;
      item.source='playwright-request-sizes';
    } else if (finiteSize(entry?.encodedBodySize) && entry.encodedBodySize>0) {
      item.encodedBodyBytes=entry.encodedBodySize;
      item.source='resource-timing';
    } else if (contentLength !== null && !item.fromCache) {
      item.encodedBodyBytes=contentLength;
      item.source='response-content-length';
    } else if (bodyless) {
      item.encodedBodyBytes=0;
      item.source='bodyless-response';
    }
    // RT transferSize is the browser's response transfer accounting, not TCP/TLS packet bytes.
    // Keep it separate from encoded bodies; unlike request.sizes, it may include zero for cache.
    if (finiteSize(entry?.transferSize) && (entry.transferSize>0 || item.fromCache)) item.transferBytes=entry.transferSize;
    if (finiteSize(sizes?.responseHeadersSize)) item.responseHeadersBytes=sizes.responseHeadersSize;
    if (finiteSize(sizes?.requestHeadersSize) && finiteSize(sizes?.requestBodySize)) item.requestBytes=sizes.requestHeadersSize+sizes.requestBodySize;
    if (item.status>=400) failures.push({url:item.url, reason:`HTTP ${item.status}`});
    if (item.fromServiceWorker) failures.push({url:item.url, reason:'Unexpected service worker response in a cold context'});
    if (item.encodedBodyBytes===null) warnings.push({url:item.url, reason:'No reliable encoded response size; totals will be unavailable'});
    resources.push(item);
  }
  // Resource timing covers the rare request not exposed by Playwright (engine-specific behavior).
  for (const [index,entry] of timing.workload.entries()) {
    if (used.has(index) || entry.startTime>timing.workloadCutoff) continue;
    const known=entry.encodedBodySize>0 && entry.responseEnd>0;
    resources.push({
      url:entry.name, method:'GET', type:entry.initiatorType, startTime:entry.startTime,
      responseEnd:entry.responseEnd, cold:entry.startTime<=timing.coldCutoff, status:null,
      contentType:null, contentEncoding:null, encodedBodyBytes:known?entry.encodedBodySize:null,
      decodedBodyBytes:entry.decodedBodySize>0?entry.decodedBodySize:null,
      transferBytes:entry.transferSize>0?entry.transferSize:null, responseHeadersBytes:null,
      requestBytes:null, bodySha256:null, source:'resource-timing-only',
      fromCache:entry.deliveryType==='cache' ? true : null, fromServiceWorker:false, resourceTiming:entry,
    });
    warnings.push({url:entry.name, reason:'Resource timing entry has no matching Playwright request'});
  }
  const aggregate = selected => {
    const encodedBodyBytes=sumKnown(selected,'encodedBodyBytes');
    return {
      requests:selected.length, encodedBodyBytes,
      decodedBodyBytes:sumKnown(selected,'decodedBodyBytes'), transferBytes:sumKnown(selected,'transferBytes'),
      responseHeadersBytes:sumKnown(selected,'responseHeadersBytes'), requestBytes:sumKnown(selected,'requestBytes'),
      resourceEncodedBodyBytes:selected.every(r=>finiteSize(r.resourceTiming?.encodedBodySize) && (r.resourceTiming.encodedBodySize>0 || r.decodedBodyBytes===0)) ? selected.reduce((n,r)=>n+r.resourceTiming.encodedBodySize,0) : null,
      complete:selected.length>0 && encodedBodyBytes!==null && !failures.some(f=>selected.some(r=>r.url===f.url)),
      source:[...new Set(selected.map(r=>r.source || 'unavailable'))].join(' + '),
      cachedResponses:selected.filter(r=>r.fromCache).length,
      pendingAtCold:selected.filter(r=>r.cold && (r.responseEnd===null || r.responseEnd>timing.coldCutoff)).length,
    };
  };
  return {
    cold:aggregate(resources.filter(r=>r.cold)), workload:aggregate(resources), resources, failures, warnings, assetDecoded,
    coldCutoff:timing.coldCutoff, workloadCutoff:timing.workloadCutoff,
    definition:'Cold includes the navigation and every HTTP(S) resource request begun by galleryReady; workload includes every resource request begun by the final workload boundary. Completed response sizes are retrieved after timing. Encoded bodies exclude headers; transferBytes is Resource Timing response accounting where supported, not packet-level network traffic. Resource requests may include cache hits; only explicit deliveryType=cache is labelled cached. A zero unsupported transfer size remains unavailable. Embedded data/blob assets are already inside their containing response and do not create requests.',
  };
}
