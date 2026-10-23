// In-memory contract fixtures only. No browser, server, report output or build I/O.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {parseOptions} from './run.mjs';
import {parseArgs, parseRequestPath, selectEncoding, matchesIfNoneMatch, validateAssetManifest, faviconResource} from './serve.mjs';
import {validateDataset, parseReportOptions, validateSnapshotPointer, validateSnapshotSelection} from './report.mjs';
import {renderReport} from './report-view.mjs';
import {verifyNetwork, collectNetwork} from './network.mjs';
import {editions, viewports, ENGINES, CONTEXT_OPTIONS, WORKLOAD, AUXILIARY_AUDIT, editionOrder, launchOptions, assertSameFingerprints, sha256, FAVICON, fingerprintFile} from './config.mjs';
import {reconcileAuxiliaryAudit, aggregateResources, SERVER_OBSERVED_SOURCE, verifyAuxiliaryAudit} from './auxiliary.mjs';

for (const file of await readdir(new URL('./', import.meta.url))) {
  if (file.endsWith('.mjs')) execFileSync(process.execPath, ['--check', fileURLToPath(new URL(file, import.meta.url))], {stdio:'pipe'});
}
// Check CLI dispatch through the caller's workspace path, which may be a Windows junction.
for (const file of ['run.mjs', 'report.mjs', 'serve.mjs']) {
  const help=execFileSync(process.execPath, [`revision-2/benchmarks/${file}`, '--help'], {encoding:'utf8'});
  assert.ok(help.includes('revision-2/benchmarks/'), `${file} --help must dispatch without starting work`);
}
assert.equal(parseOptions([]).rounds, 4);
assert.equal(parseOptions([]).engine, 'both');
assert.deepEqual(parseReportOptions([]), {input:undefined, setLatest:false, help:false});
assert.deepEqual(parseReportOptions(['--input','snapshot.json','--set-latest']), {input:'snapshot.json', setLatest:true, help:false});
for (const args of [['--set-latest'],['--input'],['--input','--set-latest'],['--input','one.json','two.json']]) assert.throws(() => parseReportOptions(args));
assert.equal(parseOptions(['--quick','--rounds','4']).rounds, 1);
assert.equal(parseOptions(['--engine=webkit','--transport=br']).transport, 'br');
for (const args of [['--rounds','0'],['--engine','safari'],['--transport','pretend'],['--origin','https://example.com'],['--wat']]) assert.throws(() => parseOptions(args));
assert.deepEqual(parseArgs([]), {port:4175, help:false});
assert.throws(() => parseArgs(['--port','0']));
assert.equal(selectEncoding('gzip;q=0.8, br;q=1'), 'br');
assert.equal(selectEncoding('br;q=0, gzip;q=0.5'), 'gzip');
assert.equal(selectEncoding('br;q=0, gzip;q=0, identity;q=0'), null);
assert.equal(selectEncoding('br;q=1, identity;q=0.5', ['identity']), 'identity');
assert.equal(selectEncoding(undefined), 'identity');
assert.equal(parseRequestPath('/revision-2/assets/valor@2x.abc.webp?x=1'), '/revision-2/assets/valor@2x.abc.webp');
for (const path of ['/revision-2/../app.js','/revision-2/%2e%2e/app.js','/revision-2/assets%2fsecret','//evil/path','/revision-2/a:secret']) assert.equal(parseRequestPath(path), null);
assert.equal(matchesIfNoneMatch('W/"abc", "def"', '"abc"'), true);
assert.equal(matchesIfNoneMatch('"abcdef"', '"abc"'), false);
const hash='a'.repeat(64), otherHash='b'.repeat(64);
assert.deepEqual(await fingerprintFile(FAVICON.path), {path:FAVICON.path, bytes:0, sha256:FAVICON.sha256});
assert.equal(parseRequestPath(FAVICON.url), '/favicon.ico');
const faviconRepresentation=faviconResource(Buffer.alloc(0));
assert.equal(faviconRepresentation.type, 'image/x-icon');
assert.equal(faviconRepresentation.variants.get('identity').bytes.length, 0);
assert.equal(faviconRepresentation.variants.get('identity').etag, `"sha256-${FAVICON.sha256}"`);
assert.deepEqual([...faviconRepresentation.variants.keys()], ['identity']);
assert.throws(() => faviconResource(Buffer.from('not empty')));
assert.throws(() => validateAssetManifest([{url:'/elsewhere/file', bytes:1, sha256:hash}]));
assert.equal(validateAssetManifest([{url:'/revision-2/assets/valor@2x.abc.webp', bytes:1, sha256:hash}]).length, 1);
assertSameFingerprints({hash}, {hash});
assert.throws(() => assertSameFingerprints({hash}, {hash:otherHash}));

const stats=n => ({n, median:16, p95:20, max:22, over33ms:0});
function fixture() {
  const batchId='static-fixture-not-a-measurement', origin='http://127.0.0.1:4175';
  const data={
    schemaVersion:2, revision:2, status:'complete', diagnostic:false, batchId, origin,
    startedAt:'2000-01-01T00:00:00.000Z', completedAt:'2000-01-01T01:00:00.000Z',
    machine:{cpu:'IN-MEMORY FIXTURE', logicalCores:1, memoryBytes:1, platform:'fixture', release:'fixture', arch:'fixture', node:'fixture', playwright:'fixture', osVersion:'fixture'},
    method:{rounds:4, engines:ENGINES, viewports, expectedRuns:64, contextOptions:CONTEXT_OPTIONS, workload:WORKLOAD, auxiliaryAudit:AUXILIARY_AUDIT, order:Array.from({length:4}, (_,i) => editionOrder(i)), headless:true, dpr:1, networkThrottling:false, cpuThrottling:false, freshContextPerRun:true, processIsolation:false, balancedOrder:true, navigationWaitUntil:'load', navigationTimeoutMs:60000, profileTimeoutMs:120000, requestedTransport:'identity'},
    browsers:Object.fromEntries(ENGINES.map(engine => [engine,{engine, version:'fixture', launchOptions:launchOptions(engine), channel:engine === 'edge' ? 'msedge' : 'playwright-webkit', customArguments:[], defaultBrowserArguments:true, processPerEngine:true}])),
    fingerprints:{builds:Object.fromEntries(editions.map(({id}) => [id,{sha256:hash, gzipSha256:hash, brotliSha256:hash, rawBytes:100, gzipBytes:60, brotliBytes:40}])), assetManifest:{path:'fixture', sha256:hash, assets:[{url:'/revision-2/assets/fixture.webp', bytes:1, sha256:hash}]}, sources:[{path:'fixture', bytes:1, sha256:hash},{path:FAVICON.path,bytes:0,sha256:FAVICON.sha256}], harness:[{path:'fixture', bytes:1, sha256:hash}]}, runs:[],
  };
  for (const engine of ENGINES) for (const profile of viewports) for (let round=1; round<=4; round++) for (const [position, edition] of editionOrder(round-1).entries()) {
    const url=new URL(`/revision-2/${edition}/`, origin);
    url.searchParams.set('bench', `${batchId}-${engine}-${profile.name}-${round}`);
    const resource={url:url.href, type:'document', method:'GET', cold:true, status:200, contentEncoding:'identity', fromServiceWorker:false, bodySha256:hash, encodedBodyBytes:100, decodedBodyBytes:100, transferBytes:null, requestBytes:30, responseHeadersBytes:20};
    const aggregate={requests:1, complete:true, encodedBodyBytes:100, decodedBodyBytes:100, transferBytes:null, requestBytes:30, responseHeadersBytes:20};
    data.runs.push({engine, profile:profile.name, round, position:position+1, edition, expectedEdition:edition, revision:2, viewport:[profile.width,profile.height], contextOptions:{...CONTEXT_OPTIONS,viewport:{width:profile.width,height:profile.height}}, dpr:1, documentVisible:'visible', userAgent:`fixture-${engine}`, time:'2000-01-01T00:30:00.000Z', url:url.href, errors:[], failures:[],
      checks:{cards:12, stats:72, horizontalOverflow:false, dialogOpened:true, wrap:true, firstPosition:true, editPersisted:true, stateAPI:true, fullEditor:true, scrollExercised:true, artworkPresent:true, brokenImages:[]},
      verification:{matches:true, servedSha256:hash, localSha256:hash, url:url.href},
      load:{fcp:null, domReady:10, responseEnd:5, requestStart:1, galleryReadyObserved:30, harnessStarted:20},
      nodes:{documentInitial:100, gallery:80, perCard:Array(12).fill(5)},
      baselineFrames:stats(30), browseFrames:stats(180), scrollFrames:stats(180), dialogDecode:stats(12), dialogTwoFrame:stats(12), dialogHandlers:stats(12),
      openCards:Array.from({length:12}, (_,index) => ({index,handler:1,twoFrames:2,decoded:3})), scroll:{distance:100,maximumObservedScroll:100},
      transport:{htmlEncoding:'identity',requiredEncoding:'identity'},
      network:{resources:[resource], failures:[], warnings:[], cold:{...aggregate}, workload:{...aggregate}},
    });
  }
  return data;
}
const data=fixture();
assert.equal(validateDataset(data), data);
// Exercise the unchanged collector using request/response doubles, with no HTTP or browser activity.
async function emptyFaviconLedger({cold=true, unsupportedSizes=false}={}) {
  const url=data.origin+FAVICON.url;
  const response={status:()=>200, fromServiceWorker:()=>false, allHeaders:async()=>({'content-type':'image/x-icon','content-length':'0'}), body:async()=>Buffer.alloc(0)};
  const request={url:()=>url, method:()=> 'GET', resourceType:()=> 'other', timing:()=>({startTime:1010,responseEnd:4}), response:async()=>response,
    sizes:async()=>{ if (unsupportedSizes) throw new Error('fixture: sizes unavailable'); return {responseBodySize:0,responseHeadersSize:20,requestHeadersSize:30,requestBodySize:0}; }};
  const entry={name:url,entryType:'resource',initiatorType:'other',startTime:10,responseEnd:14,encodedBodySize:0,decodedBodySize:0,transferSize:unsupportedSizes?0:120,deliveryType:null};
  return collectNetwork([{request,seenAt:1010,finished:true,failure:null}],{timeOrigin:1000,coldCutoff:cold?20:5,workloadCutoff:30,workload:[entry]},{});
}
for (const cold of [true,false]) {
  const ledger=await emptyFaviconLedger({cold}), resource=ledger.resources[0];
  assert.equal(ledger.resources.length,1);
  assert.equal(resource.bodySha256,FAVICON.sha256);
  assert.equal(resource.encodedBodyBytes,0);
  assert.equal(resource.decodedBodyBytes,0);
  assert.equal(resource.transferBytes,120);
  assert.equal(resource.cold,cold);
  assert.equal(ledger.workload.requests,1);
  assert.equal(ledger.workload.complete,true);
  const run=structuredClone(data.runs[0]);
  run.network.resources.push(resource);
  for (const scope of cold?['cold','workload']:['workload']) {
    run.network[scope].requests++;
    run.network[scope].responseHeadersBytes+=20;
    run.network[scope].requestBytes+=30;
  }
  assert.deepEqual(verifyNetwork(run,data.fingerprints,data.origin),[]);
  const omittedCount=structuredClone(run); omittedCount.network.workload.requests--;
  assert.ok(verifyNetwork(omittedCount,data.fingerprints,data.origin).length>0);
  for (const changes of [{bodySha256:null},{bodySha256:otherHash},{encodedBodyBytes:1},{decodedBodyBytes:1},{contentType:'text/plain'},{contentEncoding:'gzip'},{status:404}]) {
    const invalid=structuredClone(run); Object.assign(invalid.network.resources.at(-1),changes);
    assert.ok(verifyNetwork(invalid,data.fingerprints,data.origin).length>0);
  }
  const missingSource=structuredClone(data.fingerprints); missingSource.sources=missingSource.sources.filter(source=>source.path!==FAVICON.path);
  assert.ok(verifyNetwork(run,missingSource,data.origin).length>0);
}
const fallbackFavicon=await emptyFaviconLedger({unsupportedSizes:true});
assert.equal(fallbackFavicon.resources[0].source,'response-content-length');
assert.equal(fallbackFavicon.resources[0].bodySha256,FAVICON.sha256);
assert.equal(fallbackFavicon.workload.encodedBodyBytes,0);
assert.equal(fallbackFavicon.workload.transferBytes,null);
assert.equal(fallbackFavicon.workload.requests,1);
assert.equal(fallbackFavicon.workload.complete,true);
const timeOrigin=Date.parse('2000-01-01T00:00:00.000Z'), documentURL=data.runs[0].url;
const rtEntry={name:data.origin+FAVICON.url,entryType:'resource',initiatorType:'other',startTime:10,responseEnd:14,encodedBodySize:0,decodedBodySize:0,transferSize:300,deliveryType:null};
const unresolved=await collectNetwork([],{timeOrigin,coldCutoff:20,workloadCutoff:30,workload:[rtEntry]},{});
unresolved.resources.unshift(structuredClone(data.runs[0].network.resources[0]));
Object.assign(unresolved,aggregateResources(unresolved.resources,unresolved.failures,unresolved.coldCutoff));
const actualResponse={sequence:1,url:rtEntry.name,method:'GET',referer:documentURL,receivedAtEpochMs:timeOrigin+11,finishedAtEpochMs:timeOrigin+13,completed:true,aborted:false,status:200,contentType:'image/x-icon',contentEncoding:'identity',contentLength:0,etag:`"sha256-${FAVICON.sha256}"`,encodedBodyBytes:0,bodySha256:FAVICON.sha256};
const payload={schemaVersion:1,serverInstanceId:'00000000-0000-4000-8000-000000000001',clock:'unix-epoch-ms/monotonic',queriedAtEpochMs:timeOrigin+102,referer:documentURL,limit:AUXILIARY_AUDIT.limit,evictedRecords:0,records:[actualResponse]};
function auditEvidence(value=payload) {
  const url=new URL(AUXILIARY_AUDIT.path,data.origin); url.searchParams.set('referer',documentURL);
  const responseBody=JSON.stringify(value);
  return {url:url.href,method:'GET',status:200,requestedAtEpochMs:timeOrigin+100,receivedAtEpochMs:timeOrigin+105,responseSha256:sha256(Buffer.from(responseBody)),responseBody};
}
const reconciled=reconcileAuxiliaryAudit(unresolved,auditEvidence(),{documentURL,timeOrigin});
assert.deepEqual(reconciled.failures,[]);
assert.equal(reconciled.resources[1].source,SERVER_OBSERVED_SOURCE);
assert.equal(reconciled.resources[1].transferBytes,300);
assert.equal(reconciled.resources[1].responseHeadersBytes,null);
assert.equal(reconciled.resources[1].requestBytes,null);
assert.equal(reconciled.resources[1].browserObservation.status,null);
assert.equal(reconciled.resources[1].bodySha256,FAVICON.sha256);
assert.equal(reconciled.workload.requests,2);
assert.equal(reconciled.workload.encodedBodyBytes,100);
assert.equal(reconciled.workload.complete,true);
assert.deepEqual(verifyNetwork({...data.runs[0],network:reconciled},data.fingerprints,data.origin),[]);
for (const mutation of [
  p=>{p.records=[];}, p=>{p.records.push({...p.records[0],sequence:2});},p=>{p.evictedRecords=1;},
  p=>{p.records[0].bodySha256=null;},p=>{p.records[0].encodedBodyBytes=1;},p=>{p.records[0].status=null;},
  p=>{p.records[0].status=404;},p=>{p.records[0].completed=false;},p=>{p.records[0].aborted=true;},
  p=>{p.records[0].referer+='-wrong';},p=>{p.records[0].receivedAtEpochMs=timeOrigin+1000;},
]) {
  const invalid=structuredClone(payload); mutation(invalid);
  assert.ok(reconcileAuxiliaryAudit(unresolved,auditEvidence(invalid),{documentURL,timeOrigin}).failures.length>0);
}
for (const sizes of [{encodedBodySize:1},{decodedBodySize:1},{decodedBodySize:undefined},{encodedBodySize:null}]) {
  const invalid=structuredClone(unresolved); Object.assign(invalid.resources[1].resourceTiming,sizes);
  assert.ok(reconcileAuxiliaryAudit(invalid,auditEvidence(),{documentURL,timeOrigin}).failures.length>0);
}
const forged=structuredClone(reconciled); forged.resources[1].transferBytes=301;
assert.ok(verifyAuxiliaryAudit(forged,documentURL).length>0);
const noAudit=structuredClone(reconciled); delete noAudit.auxiliaryAudit;
assert.ok(verifyAuxiliaryAudit(noAudit,documentURL).length>0);
const corruptedAudit=auditEvidence(); corruptedAudit.responseBody+=' ';
assert.ok(reconcileAuxiliaryAudit(unresolved,corruptedAudit,{documentURL,timeOrigin}).failures.length>0);
const snapshotBytes=Buffer.from(JSON.stringify(data));
const pointer={schemaVersion:1,file:'measurements/static-fixture.json',sha256:sha256(snapshotBytes),batchId:data.batchId,completedAt:data.completedAt};
assert.deepEqual(validateSnapshotSelection(snapshotBytes,pointer),data);
for (const file of ['measurements/../escape.json','diagnostics/test.json','measurements/test.partial.json','measurements/test.PARTIAL.json','/measurements/test.json','measurements/a/b.json']) assert.throws(() => validateSnapshotPointer({...pointer,file}));
for (const invalid of [{...pointer,sha256:otherHash},{...pointer,batchId:'another-fixture-batch'},{...pointer,completedAt:'2000-01-02T00:00:00.000Z'},{...pointer,otherFile:'measurements/another.json'}]) assert.throws(() => validateSnapshotSelection(snapshotBytes,invalid));
assert.throws(() => validateSnapshotSelection(Buffer.concat([snapshotBytes,Buffer.from('\n')]),pointer));
const diagnostic=fixture(); diagnostic.diagnostic=true;
const diagnosticBytes=Buffer.from(JSON.stringify(diagnostic));
assert.throws(() => validateSnapshotSelection(diagnosticBytes,{...pointer,sha256:sha256(diagnosticBytes)}));
const html=renderReport(data);
assert.equal(html, renderReport(structuredClone(data)));
assert.match(html, /Unavailable/);
assert.match(html, /2000-01-01T01:00:00.000Z/);
assert.match(html, /uncompressed HTML/);
assert.match(html, /Content-Length/);
assert.match(html, /<link rel="icon" href="data:,">/);
for (const path of ['/collections/','/compare/','/revision-2/reference',...editions.map(edition => edition.route)]) assert.ok(html.includes(`href="${path}"`));
const hostile=fixture(); hostile.machine.cpu='<script>alert("fixture")</script>';
assert.ok(!renderReport(hostile).includes('<script>alert('));
assert.ok(renderReport(hostile).includes('&lt;script&gt;'));
for (const mutation of [
  data => { data.diagnostic=true; }, data => { data.status='running'; }, data => { data.runs.pop(); },
  data => { data.runs[1]=data.runs[0]; }, data => { data.runs[0].checks.wrap=false; },
  data => { data.runs[0].errors.push('fixture error'); }, data => { data.runs[0].load.fcp=0; },
  data => { data.runs[0].network.resources[0].bodySha256=otherHash; },
  data => { data.runs[0].network.cold.encodedBodyBytes=99; },
  data => { data.runs[0].transport.htmlEncoding='br'; },
  data => { data.runs[0].verification.servedSha256=otherHash; },
]) { const invalid=fixture(); mutation(invalid); assert.throws(() => validateDataset(invalid)); }
const unknown=structuredClone(data.runs[0]); unknown.network.resources[0].url='http://127.0.0.1:4175/unlisted';
assert.ok(verifyNetwork(unknown,data.fingerprints,data.origin).some(error => error.includes('Unlisted')));
console.log('Static checks passed: module syntax, CLI/default selection, pinned pointer digests/identity/path rejection, compression negotiation, path confinement, immutable fingerprints, 64-run validator rejection cases, optional empty favicon source/response and retained ledger totals, deterministic/escaped HTML, data favicon and null metrics. No browser/server/build/report output or measurements.');
