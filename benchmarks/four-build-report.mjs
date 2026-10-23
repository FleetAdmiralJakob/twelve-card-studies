import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {gzipSync, brotliCompressSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {editions, viewports, fromRoot, readJSON, sha256, functionalFailures} from './four-config.mjs';
import {validateBuildHistory} from './four-build-history.mjs';

const args=process.argv.slice(2);
assert(args.every(arg=>['--preview','--help','-h'].includes(arg)), 'Supported options: --preview, --help');
if (args.includes('--help') || args.includes('-h')) {
  console.log(`Validate and build the NEW four-edition report, leaving all old reports intact.
  node benchmarks/four-build-report.mjs
  node benchmarks/four-build-report.mjs --preview   Also write bench-four/index.html

Requires complete four-results.json AND four-webkit-results.json from 3 or 4 rounds,
the unchanged measured HTML snapshots and harness, successful functional/network checks,
and matching measured served/local HTML SHA-256 in every run. Current V1–V3 HTML
may differ ONLY inside the collection footer; V4 must remain exact. Current compressed
siblings must decode to current HTML. Diagnostic/partial data is rejected.
Outputs: dist/compare.html{,.gz,.br} and benchmarks/four-combined.json.
Root must wire /compare/, /compare/data.json, /hybrid/, assets, and /source/hybrid.`);
} else {
  await build();
}

async function build() {
  const main=await readJSON('benchmarks/four-results.json');
  const webkit=await readJSON('benchmarks/four-webkit-results.json');
  assert(Number.isFinite(Date.parse(main.completedAt)) && Number.isFinite(Date.parse(webkit.date)), 'Missing run timestamps');
  assert(Date.parse(main.completedAt)<=Date.parse(webkit.date), 'Run Edge first, then WebKit sequentially. WebKit data must not predate or overlap the Edge run.');
  const history=await validateBuildHistory({edge:main,webkit});
  const harness={};
  for (const [key,file] of [['profileSha256','four-profile.mjs'],['runnerSha256','four-run.mjs'],['networkSha256','four-network.mjs'],['configSha256','four-config.mjs']]) harness[key]=sha256(await readFile(fromRoot(`benchmarks/${file}`)));
  const assetHashes=new Map();
  const assetsWithoutHash=new Set();
  for (const [engine,source] of [['edge',main],['webkit',webkit]]) {
    assert.equal(source.schemaVersion,1,`${engine}: unsupported data schema`);
    assert.equal(source.status,'complete',`${engine}: result set is incomplete`);
    assert.equal(source.diagnostic,false,`${engine}: diagnostic data cannot build the final report`);
    assert.equal(source.browser?.engine,engine,`${engine}: wrong browser dataset`);
    assert(source.browser.version,`${engine}: browser version missing`);
    assert.deepEqual(source.editions,editions.map(e=>e.id),`${engine}: all four editions are required`);
    assert([3,4].includes(source.method?.rounds),`${engine}: final report requires 3 or 4 rounds`);
    assert.equal(source.method.rounds,main.method.rounds,'Both engines must use the same number of rounds');
    assert.equal(source.origin,main.origin,'Both engines must use the same origin');
    assert.deepEqual(source.hardware,main.hardware,'Both engines must use the same hardware/OS');
    assert.deepEqual(source.harness,harness,`${engine}: harness changed since measurement`);
    for (const [key,value] of Object.entries({headless:true,networkThrottling:false,cpuThrottling:false,freshContextPerRun:true,processIsolation:false,serviceWorkers:'block',dpr:1})) {
      assert.equal(source.method[key],value,`${engine}: unexpected ${key}`);
    }
    assert.deepEqual(source.method.viewports,viewports,`${engine}: viewport contract differs`);
    assert.equal(source.method.balancedOrder,source.method.rounds%4===0,`${engine}: incorrect rotation label`);
    const expectedCount=editions.length*viewports.length*source.method.rounds;
    assert.equal(source.runs.length,expectedCount,`${engine}: incomplete run count`);
    assert.equal(source.method.expectedRuns,expectedCount,`${engine}: incorrect expected run count`);
    const keys=new Set();
    for (const run of source.runs) {
      const label=`${engine}/${run.edition}/${run.profile}/${run.round}`;
      const edition=editions.find(e=>e.id===run.edition);
      const viewport=viewports.find(v=>v.name===run.profile);
      assert(edition && viewport,`${label}: unknown edition or viewport`);
      assert(Number.isInteger(run.round) && run.round>=1 && run.round<=source.method.rounds,`${label}: invalid round`);
      assert(!keys.has(label),`${label}: duplicate run`);
      keys.add(label);
      assert.equal(run.engine,engine,`${label}: engine mismatch`);
      assert.deepEqual(run.viewport,[viewport.width,viewport.height],`${label}: incorrect viewport`);
      assert.equal(run.dpr,1,`${label}: incorrect DPR`);
      const rotation=(run.round-1)%4;
      const order=[...editions.slice(rotation),...editions.slice(0,rotation)].map(e=>e.id);
      assert.deepEqual(source.method.order[run.round-1],order,`${label}: incorrect rotation plan`);
      assert.equal(order[run.position-1],run.edition,`${label}: incorrect position in rotation`);
      assert.deepEqual(run.errors,[],`${label}: page errors`);
      assert.deepEqual(run.failures,[],`${label}: run failed`);
      assert.deepEqual(functionalFailures(run),[],`${label}: functional check failed`);
      assert.equal(run.openCards.length,12,`${label}: incomplete first opens`);
      assert.equal(run.browseFrames.n,180,`${label}: incomplete warm browse`);
      assert.equal(run.baselineFrames.n,30,`${label}: incomplete baseline`);
      assert(run.scrollFrames===null || run.scrollFrames.n===180,`${label}: incomplete scroll workload`);
      assert.equal(run.verification?.matches,true,`${label}: served/local verification failed`);
      assert.equal(run.verification.localSha256,history.measured[edition.id].sha256,`${label}: wrong measured local fingerprint`);
      assert.equal(run.verification.servedSha256,history.measured[edition.id].sha256,`${label}: wrong measured served fingerprint`);
      assert.deepEqual(run.network?.failures,[],`${label}: network failures`);
      for (const scope of ['cold','workload']) {
        const total=run.network[scope];
        const resources=scope==='cold'?run.network.resources.filter(r=>r.cold):run.network.resources;
        assert.equal(total.complete,true,`${label}: ${scope} network accounting incomplete`);
        assert(total.requests>0 && total.requests===resources.length,`${label}: ${scope} request count mismatch`);
        assert(resources.every(r=>Number.isFinite(r.encodedBodyBytes) && r.encodedBodyBytes>=0),`${label}: unknown ${scope} response bytes`);
        assert.equal(total.encodedBodyBytes,resources.reduce((n,r)=>n+r.encodedBodyBytes,0),`${label}: ${scope} encoded byte sum mismatch`);
      }
      for (const resource of run.network.resources) {
        if (resource.type==='document' || resource.type==='navigation' || (resource.status>=300 && resource.status<400)) continue;
        if (!resource.bodySha256) { assetsWithoutHash.add(resource.url); continue; }
        const existing=assetHashes.get(resource.url);
        assert(!existing || existing.sha256===resource.bodySha256,`${resource.url}: response body changed between measured runs/engines`);
        assetHashes.set(resource.url,{url:resource.url,sha256:resource.bodySha256,decodedBodyBytes:resource.decodedBodyBytes,contentType:resource.contentType});
      }
    }
    for (const edition of editions) for (const viewport of viewports) for (let round=1;round<=source.method.rounds;round++) {
      assert(keys.has(`${engine}/${edition.id}/${viewport.name}/${round}`),`${engine}: missing ${edition.id}/${viewport.name}/${round}`);
    }
  }
  const data={
    schemaVersion:1,generatedAt:new Date().toISOString(),editions,main,webkit,
    verification:{
      html:'Every recorded navigation response hash matches the actual measured HTML: immutable pre-V4 snapshots for V1–V3, exact current HTML for unchanged V4. Recorded build fingerprints, including compressed byte counts, are validated against those measured files. Current compressed HTML siblings decode to current HTML.',
      navigation:'V1–V3 footer navigation was updated after timing. All figures describe the archived measured builds, not newly measured navigation. Current V1–V3 HTML may differ only inside the single collection-footer element, including its inline wrapping styles; bytes before and after it must be identical. Artwork and interaction code outside that footer are preserved. V4 must match its measured HTML exactly. No benchmarks were rerun for the footer update.',
      currentBuilds:history.current,
      htmlComparisons:history.comparisons,
      assets:'Response bodies fingerprinted after timing and compared across measured runs and engines. These fingerprints document measured assets; this builder does not fetch the deployed site or assert that external assets are still unchanged.',
      assetResponses:[...assetHashes.values()],assetsWithoutBodyHash:[...assetsWithoutHash],
    },
  };
  try {
    const diagnostic=await readJSON('benchmarks/hybrid-scroll-diagnostic.json');
    assert.equal(diagnostic.runs.length,16,'Scroll diagnostic must be complete');
    for(const variant of ['baseline','visibility','paint','layer']){
      const runs=diagnostic.runs.filter(run=>run.variant===variant);
      assert.equal(runs.length,4,'Scroll diagnostic variant missing');
      assert(runs.every(run=>run.checks.cards===12 && run.checks.stats===72 && run.checks.dialogOpened && run.checks.wrap && run.checks.editPersisted && !run.checks.horizontalOverflow && run.checks.brokenImages.length===0),'Scroll diagnostic check failed');
    }
    data.diagnostics={hybridScroll:diagnostic};
  } catch(error) { if(error.code!=='ENOENT')throw error; }
  const template=await readFile(fromRoot('benchmarks/four-report-template.html'),'utf8');
  const marker='/*FOUR_BENCHMARK_DATA*/null';
  assert.equal(template.split(marker).length,2,'Template must contain exactly one data marker');
  const payload=JSON.stringify(data).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');
  const html=template.replace(marker,()=>payload);
  await mkdir(fromRoot('dist'),{recursive:true});
  await writeFile(fromRoot('dist/compare.html'),html);
  await writeFile(fromRoot('dist/compare.html.gz'),gzipSync(html));
  await writeFile(fromRoot('dist/compare.html.br'),brotliCompressSync(html));
  await writeFile(fromRoot('benchmarks/four-combined.json'),JSON.stringify(data,null,2)+'\n');
  if (args.includes('--preview')) {
    await mkdir(fromRoot('bench-four'),{recursive:true});
    await writeFile(fromRoot('bench-four/index.html'),html);
  }
  console.log(`Four-edition report built: ${main.runs.length} Edge + ${webkit.runs.length} WebKit runs. Serve dist/compare.html at /compare/ and benchmarks/four-combined.json at /compare/data.json.`);
}
