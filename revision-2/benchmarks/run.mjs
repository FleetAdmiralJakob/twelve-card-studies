import {chromium, webkit} from 'playwright';
import {readFile, writeFile, mkdir, unlink} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import os from 'node:os';
import {editions, viewports, ENGINES, CONTEXT_OPTIONS, WORKLOAD, AUXILIARY_AUDIT, editionOrder, launchOptions, fromRoot, fingerprints, fingerprintFile, assertSameFingerprints, sha256, functionalFailures, isMain} from './config.mjs';
import {profileRevisionTwo} from './profile.mjs';
import {observeNetwork, collectNetwork, verifyNetwork} from './network.mjs';

export function parseOptions(args) {
  const result = {rounds:4, engine:'both', quick:false, origin:process.env.R2_BENCH_ORIGIN || 'http://127.0.0.1:4174', transport:'auto'};
  for (let i=0; i<args.length; i++) {
    const [flag, inline] = args[i].split('=', 2);
    if (['--help','-h'].includes(flag)) result.help=true;
    else if (flag === '--quick') result.quick=true;
    else if (['--rounds','--engine','--origin','--transport'].includes(flag)) {
      const value=inline ?? args[++i];
      if (!value || value.startsWith('--')) throw new Error(`${flag} needs a value`);
      result[flag.slice(2)]=flag === '--rounds' ? Number(value) : value;
    } else throw new Error(`Unknown option: ${flag}`);
  }
  if (result.quick) result.rounds=1;
  if (!Number.isInteger(result.rounds) || result.rounds<1 || result.rounds>20) throw new Error('--rounds must be an integer from 1 to 20');
  if (!['both', ...ENGINES].includes(result.engine)) throw new Error('--engine must be both, edge or webkit');
  if (!['auto', 'br', 'gzip', 'identity'].includes(result.transport)) throw new Error('--transport must be auto, br, gzip or identity');
  const url=new URL(result.origin);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('--origin must be an http://127.0.0.1:PORT origin');
  result.origin=url.origin;
  return result;
}
export async function runBenchmark(opts) {
  const engines=opts.engine === 'both' ? ENGINES : [opts.engine];
  const diagnostic=opts.quick || opts.rounds !== 4 || opts.engine !== 'both';
  const batchId=randomUUID(), startedAt=new Date().toISOString();
  const directory=`revision-2/benchmarks/${diagnostic ? 'diagnostics' : 'measurements'}`;
  const name=`${startedAt.replaceAll(':', '-').replaceAll('.', '-')}-${batchId}`;
  const output=fromRoot(`${directory}/${name}.json`), partial=fromRoot(`${directory}/${name}.partial.json`);
  const require=createRequire(import.meta.url);
  const cpus=os.cpus();
  const dataset={
    schemaVersion:2, revision:2, batchId, startedAt, completedAt:null, status:'running', diagnostic, origin:opts.origin,
    machine:{cpu:cpus[0]?.model || 'unknown', cpuModels:[...new Set(cpus.map(cpu => cpu.model))], logicalCores:cpus.length, memoryBytes:os.totalmem(), freeMemoryBytesAtStart:os.freemem(), platform:os.platform(), release:os.release(), osVersion:os.version(), arch:os.arch(), node:process.version, playwright:require('playwright/package.json').version},
    method:{
      rounds:opts.rounds, engines, viewports, expectedRuns:opts.rounds*engines.length*viewports.length*editions.length,
      headless:true, dpr:1, networkThrottling:false, cpuThrottling:false, freshContextPerRun:true, processIsolation:false,
      contextOptions:CONTEXT_OPTIONS, workload:WORKLOAD, navigationWaitUntil:'load', navigationTimeoutMs:60000, profileTimeoutMs:120000,
      execution:'sequential engines → profiles → rounds → rotated editions; one browser process per engine, fresh context per run',
      order:Array.from({length:opts.rounds}, (_,i) => editionOrder(i)), balancedOrder:opts.rounds%4 === 0,
      requestedTransport:opts.transport,
      auxiliaryAudit:AUXILIARY_AUDIT,
      timing:'Fonts and gallery images decoded plus 3 RAF callbacks; 30 baseline intervals; 12 first opens (handler, 2 callbacks, decode + 2 more callbacks); 180 warm browse intervals changing card every 15; 180 sinusoidal scroll intervals over >80px overflow; wrap, full-editor structure, state API and name persistence checks. PNG export excluded.',
      accounting:'Passive browser events while timed; the restricted server also observes actual favicon responses with a bounded Referer-keyed ledger. Body reads, hashes, size queries and Node audit-endpoint GETs happen only after timing. Resource-Timing-only favicon entries require one actual completed server response matching URL, unique page Referer and request interval within 25ms epoch-clock tolerance. The original browser observation, raw audit response and reconciliation proof are retained; browser transfer stays intact, unknown request/header bytes stay null. Audit GET traffic is post-workload instrumentation, not page traffic, and is recorded separately. Cold scope includes HTML and requests begun by galleryReady; total scope includes requests begun by workload end. Encoded body representation sizes exclude headers and may include cache-served representations when engine cache provenance is unavailable. Browser response transfer and request/header counts are separate and can be null. No wire-packet traffic or repeat-load cache experiment.',
      limitations:'Headless DPR 1; unthrottled localhost. Layout profiles are not devices. Windows Playwright WebKit is not Mac Safari or a phone. RAF intervals are not real FPS; first-open timing is not INP. Four replicates describe this batch, not confidence intervals. R2 is not directly comparable to R1: content, decode workload and desktop viewport changed.',
    },
    browsers:{}, fingerprints:await fingerprints(), runs:[],
  };
  await mkdir(fromRoot(directory), {recursive:true});
  await writeFile(partial, JSON.stringify(dataset,null,2)+'\n', {flag:'wx'});
  const save=() => writeFile(partial, JSON.stringify(dataset,null,2)+'\n');
  console.log(`${diagnostic ? 'DIAGNOSTIC' : 'PRIMARY'}: ${dataset.method.expectedRuns} sequential runs; ${opts.origin}; partial ${partial}`);
  let firstEncoding;
  try {
    for (const engine of engines) {
      const options=launchOptions(engine), browser=await (engine === 'edge' ? chromium : webkit).launch(options);
      try {
        dataset.browsers[engine]={engine, version:browser.version(), launchOptions:options, channel:engine === 'edge' ? 'msedge' : 'playwright-webkit', defaultBrowserArguments:true, customArguments:[], processPerEngine:true};
        for (const viewport of viewports) for (let round=0; round<opts.rounds; round++) {
          for (const [position, id] of editionOrder(round).entries()) {
            const edition=editions.find(edition => edition.id === id);
            const contextOptions={...CONTEXT_OPTIONS, viewport:{width:viewport.width, height:viewport.height}};
            const context=await browser.newContext(contextOptions);
            try {
              const page=await context.newPage(), errors=[];
              page.setDefaultTimeout(30000);
              page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
              page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
              const observed=observeNetwork(page);
              const url=new URL(edition.route, opts.origin);
              url.searchParams.set('bench', `${batchId}-${engine}-${viewport.name}-${round+1}`);
              const response=await page.goto(url.href, {waitUntil:'load', timeout:60000});
              if (!response || response.status() !== 200) throw new Error(`${url.href}: HTTP ${response?.status() ?? 'no response'}`);
              await page.waitForFunction(() => document.querySelectorAll('#gallery .card').length === 12 && !!window.cardCollection);
              let timer, run;
              try {
                run=await Promise.race([page.evaluate(profileRevisionTwo), new Promise((_, reject) => { timer=setTimeout(() => reject(new Error('Profiling exceeded 120 seconds')), 120000); })]);
              } finally { clearTimeout(timer); }
              Object.assign(run, {engine, round:round+1, position:position+1, profile:viewport.name, expectedEdition:id, errors, contextOptions});
              // All verification/response reads follow the timed workload, with this context still alive.
              const local=await fingerprintFile(`dist/revision-2/${id}/index.html`), servedSha256=sha256(await response.body()), headers=await response.allHeaders();
              run.transport={htmlEncoding:headers['content-encoding'] || 'identity', requiredEncoding:opts.transport === 'auto' ? null : opts.transport, server:headers['x-r2-benchmark-server'] || null, contentLength:headers['content-length'] || null, cacheControl:headers['cache-control'] || null, etag:headers.etag || null, vary:headers.vary || null, responseProtocol:run.resourceTiming.workload[0]?.nextHopProtocol || null};
              firstEncoding ??= run.transport.htmlEncoding;
              run.verification={localSha256:local.sha256, servedSha256, matches:local.sha256 === servedSha256 && local.sha256 === dataset.fingerprints.builds[id].sha256, url:response.url()};
              run.network=await collectNetwork(observed, run.resourceTiming, run.assetDecoded, {documentURL:run.url, auditServer:run.transport.server==='1'});
              delete run.resourceTiming; delete run.assetDecoded;
              run.capabilities=await page.evaluate(() => ({borderShape:CSS.supports('border-shape:circle(50%)'), cornerShape:CSS.supports('corner-shape:superellipse(.6)'), contentVisibility:CSS.supports('content-visibility:auto'), colorMix:CSS.supports('color:color-mix(in oklch,red,blue)'), shape:CSS.supports('clip-path:shape(from 0% 0%,line to 100% 0%,line to 0% 100%,close)')}));
              run.failures=[...functionalFailures(run), ...verifyNetwork(run, dataset.fingerprints, opts.origin)];
              if (!run.verification.matches) run.failures.push('Navigation HTML differs from frozen dist');
              if (run.transport.htmlEncoding !== firstEncoding) run.failures.push('HTML transport encoding differs across editions/engines');
              if (run.dpr !== 1 || run.viewport[0] !== viewport.width || run.viewport[1] !== viewport.height || run.documentVisible !== 'visible') run.failures.push('Unexpected page viewport/DPR/visibility');
              dataset.runs.push(run); await save();
              console.log(JSON.stringify({engine, edition:id, profile:viewport.name, round:round+1, fcp:run.load.fcp, decodedOpenP95:run.dialogDecode.p95, browseP95:run.browseFrames.p95, scrollP95:run.scrollFrames?.p95, coldBodyBytes:run.network.cold.encodedBodyBytes, totalBodyBytes:run.network.workload.encodedBodyBytes, htmlEncoding:run.transport.htmlEncoding, failures:run.failures}));
              if (run.failures.length) throw new Error(`${engine}/${id}/${viewport.name}/${round+1}: ${run.failures.join('; ')}`);
            } finally { await context.close(); }
          }
        }
      } finally { await browser.close(); }
    }
    assertSameFingerprints(dataset.fingerprints, await fingerprints());
    if (dataset.runs.length !== dataset.method.expectedRuns) throw new Error('Incomplete batch');
    dataset.status='complete'; dataset.completedAt=new Date().toISOString();
    await save();
    // An immutable new snapshot: never overwrite a successful measurement file.
    await writeFile(output, JSON.stringify(dataset,null,2)+'\n', {flag:'wx'});
    await unlink(partial);
    console.log(`Saved ${output}\n${diagnostic ? 'Diagnostic: report.mjs will reject this snapshot.' : `Report after freezing: node revision-2/benchmarks/report.mjs --input "${output}"`}`);
    return output;
  } catch (error) {
    dataset.status='failed'; dataset.failure={message:error.message, time:new Date().toISOString()}; await save(); throw error;
  }
}

if (isMain(import.meta.url)) {
  const opts=parseOptions(process.argv.slice(2));
  if (opts.help) console.log(`R2 benchmark — run only after artwork/UI/build/harness are frozen.
  node revision-2/benchmarks/run.mjs                         64 runs, Edge then WebKit
  node revision-2/benchmarks/run.mjs --origin http://127.0.0.1:4175 --transport br
  node revision-2/benchmarks/run.mjs --quick --engine edge   Separate diagnostic snapshot
Options: --rounds 4 --engine both|edge|webkit --origin URL --transport auto|br|gzip|identity
Default origin: R2_BENCH_ORIGIN or http://127.0.0.1:4174 (preview commonly uses identity HTML).
Primary eligibility requires exactly four rounds, both engines, all editions/profiles, no --quick.
No build or server is started. Outputs: revision-2/benchmarks/measurements/<time>-<uuid>.json.
Diagnostics and partials cannot produce the production report. Do not run browsers concurrently.`);
  else await runBenchmark(opts);
}
