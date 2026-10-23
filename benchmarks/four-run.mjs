import {chromium, webkit} from 'playwright';
import {readFile, writeFile, rename, mkdir, stat} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import os from 'node:os';
import {editions, viewports, fromRoot, fingerprint, sha256, functionalFailures} from './four-config.mjs';
import {profileFour} from './four-profile.mjs';
import {observeNetwork, collectNetwork} from './four-network.mjs';

function options(args) {
  const result={rounds:4, engine:'both', onlyHybrid:false, quick:false};
  for (let i=0;i<args.length;i++) {
    const arg=args[i];
    if (arg==='--help' || arg==='-h') result.help=true;
    else if (arg==='--only-hybrid') result.onlyHybrid=true;
    else if (arg==='--quick') result.quick=true;
    else if (arg==='--webkit') result.engine='webkit';
    else if (arg==='--edge') result.engine='edge';
    else if (arg==='--rounds') result.rounds=Number(args[++i]);
    else if (arg.startsWith('--rounds=')) result.rounds=Number(arg.slice(9));
    else if (arg==='--engine') result.engine=args[++i];
    else if (arg.startsWith('--engine=')) result.engine=arg.slice(9);
    else throw new Error(`Unknown option: ${arg}. Use --help.`);
  }
  if (result.quick) result.rounds=1;
  if (!Number.isInteger(result.rounds) || result.rounds<1 || result.rounds>20) throw new Error('--rounds must be an integer between 1 and 20');
  if (!['edge','webkit','both'].includes(result.engine)) throw new Error('--engine must be edge, webkit, or both');
  return result;
}

const opts=options(process.argv.slice(2));
if (opts.help) {
  console.log(`Four-edition benchmark. Run only after all four dist builds are served unchanged.
  node benchmarks/four-run.mjs                Edge then WebKit, sequential; 4 rounds
  node benchmarks/four-run.mjs --rounds 4     Balanced four-position rotation
  node benchmarks/four-run.mjs --edge         Only Edge (--webkit for only WebKit)
  node benchmarks/four-run.mjs --only-hybrid  Diagnostic, separate output files
  node benchmarks/four-run.mjs --quick        One-round diagnostic, separate output files

CARD_BENCH_ORIGIN defaults to http://127.0.0.1:18787.
Each round runs all selected editions at both 1080×792 and 390×844.
3 rounds: 24 runs/browser, 48 total; 4 rounds: 32 runs/browser, 64 total.
Three rounds rotate order but do not balance all four positions.
Full outputs: benchmarks/four-results.json and four-webkit-results.json.
Incomplete runs stay in *.partial.json; final outputs are replaced only after success.
No server, artwork build, screenshot check, or report build is started by this command.`);
} else {
  await main();
}

async function main() {
  const selected=opts.onlyHybrid?editions.filter(e=>e.id==='hybrid'):editions;
  const origin=new URL(process.env.CARD_BENCH_ORIGIN || 'http://127.0.0.1:18787').origin;
  const engines=opts.engine==='both'?['edge','webkit']:[opts.engine];
  const diagnostic=opts.onlyHybrid || ![3,4].includes(opts.rounds);
  const batchId=randomUUID();
  // Presence checks only. All hashes and body reads happen after a timed run.
  for (const edition of selected) await stat(fromRoot(`dist/${edition.file}.html`));
  await mkdir(fromRoot('benchmarks'),{recursive:true});
  console.log(`Four-edition benchmark: ${selected.length*viewports.length*opts.rounds} runs per engine; ${engines.join(' then ')}; sequential. ${diagnostic?'DIAGNOSTIC — not eligible for the final report.':''}`);
  for (const engine of engines) {
    const name=opts.onlyHybrid ? `four-hybrid${engine==='webkit'?'-webkit':''}-results.json`
      : diagnostic ? `four-diagnostic-${engine}-results.json`
      : engine==='webkit'?'four-webkit-results.json':'four-results.json';
    const output=fromRoot(`benchmarks/${name}`);
    const partial=output.replace(/\.json$/,'.partial.json');
    const results={
      schemaVersion:1, batchId, date:new Date().toISOString(), completedAt:null, status:'running', diagnostic,
      origin, editions:selected.map(e=>e.id),
      hardware:{cpu:os.cpus()[0]?.model, logicalCores:os.cpus().length, memoryGB:Math.round(os.totalmem()/1024**3), platform:os.platform(), release:os.release()},
      method:{
        headless:true, networkThrottling:false, cpuThrottling:false, freshContextPerRun:true,
        processIsolation:false, serviceWorkers:'block', dpr:1, rounds:opts.rounds,
        viewports, sequentialEngines:engines, expectedRuns:selected.length*viewports.length*opts.rounds,
        order:Array.from({length:opts.rounds},(_,round)=>[...selected.slice(round%selected.length),...selected.slice(0,round%selected.length)].map(e=>e.id)),
        balancedOrder:opts.rounds%selected.length===0,
        workload:'Same as profile.js: decode gallery images/fonts, three RAF callbacks; 30 baseline frames; all 12 first opens; 12 next-card changes over 180 warmed animation frames; 180 scroll frames when vertical overflow exceeds 80px; wrap and live-name persistence checks. No artificial artwork animation.',
        accounting:'Passive network events during timing; response sizes, body reads, response hashes, and local file hashes after the timed workload. Cold scope is every HTTP request initiated by galleryReady. Workload scope ends after the functional checks. No repeat-load cache experiment.',
        caveats:'Fresh contexts do not isolate the machine, GPU, OS caches, or browser process. No CPU/network throttling. Mobile is a layout viewport, not a physical phone. Windows Playwright WebKit is not Safari on a Mac. RAF intervals are not display FPS; two-frame open latency is not INP.',
      },
      browser:{engine,version:null}, builds:{}, runs:[],
      harness:{profileSha256:null, runnerSha256:null, networkSha256:null, configSha256:null},
    };
    let browser;
    const save=()=>writeFile(partial,JSON.stringify(results,null,2)+'\n');
    await save();
    try {
      browser=engine==='webkit'?await webkit.launch({headless:true}):await chromium.launch({channel:'msedge',headless:true});
      results.browser.version=browser.version();
      for (const viewport of viewports) {
        for (let round=0;round<opts.rounds;round++) {
          const ordered=[...selected.slice(round%selected.length),...selected.slice(0,round%selected.length)];
          for (const [position,edition] of ordered.entries()) {
            const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,serviceWorkers:'block'});
            let run;
            try {
              const page=await context.newPage();
              page.setDefaultTimeout(30000);
              const errors=[];
              page.on('pageerror',error=>errors.push(error.message));
              const observed=observeNetwork(page);
              const url=new URL(edition.route,origin);
              url.searchParams.set('bench',`${batchId}-${engine}-${viewport.name}-${round}`);
              const response=await page.goto(url.href,{waitUntil:'load',timeout:60000});
              if (!response || response.status()!==200) throw new Error(`${edition.route}: HTTP ${response?.status() ?? 'no response'}`);
              await page.waitForFunction(()=>document.querySelectorAll('#gallery .card').length===12);
              let timer;
              try {
                run=await Promise.race([
                  page.evaluate(profileFour),
                  new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Profiling exceeded 120 seconds')),120000);}),
                ]);
              } finally { clearTimeout(timer); }
              // Everything below is after the timings; never fetch an extra page to verify its HTML.
              Object.assign(run,{engine,round:round+1,position:position+1,profile:viewport.name,featureMode:'enhanced',errors});
              if (run.edition!==edition.id) throw new Error(`Expected edition ${edition.id}, page declared ${run.edition}`);
              const local=await fingerprint(edition);
              const servedSha256=sha256(await response.body());
              run.verification={localSha256:local.sha256,servedSha256,matches:local.sha256===servedSha256,url:response.url()};
              if (results.builds[edition.id] && results.builds[edition.id].sha256!==local.sha256) throw new Error(`${edition.id} dist HTML changed during the benchmark`);
              results.builds[edition.id]=local;
              run.network=await collectNetwork(observed,run.resourceTiming,run.assetDecoded);
              delete run.resourceTiming;
              delete run.assetDecoded;
              run.capabilities=await page.evaluate(()=>({borderShape:CSS.supports('border-shape:circle(50%)'),cornerShape:CSS.supports('corner-shape:superellipse(.6)'),contentVisibility:CSS.supports('content-visibility:auto'),colorMix:CSS.supports('color:color-mix(in oklch,red,blue)'),shape:CSS.supports('clip-path:shape(from 0% 0%,line to 100% 0%,line to 0% 100%,close)')}));
              run.failures=functionalFailures(run);
              if (!run.verification.matches) run.failures.push('Served navigation HTML differs from local dist HTML (including stale compressed variants)');
              run.failures.push(...run.network.failures.map(f=>`${f.url}: ${f.reason}`));
              if (!run.network.cold.complete || !run.network.workload.complete) run.failures.push('Network response byte accounting is incomplete');
              results.runs.push(run);
              await save();
              console.log(JSON.stringify({engine,edition:edition.id,viewport:viewport.name,round:round+1,fcp:run.load.fcp,openP95:run.dialogTwoFrame.p95,browseP95:run.browseFrames.p95,scrollP95:run.scrollFrames?.p95,coldEncodedBytes:run.network.cold.encodedBodyBytes,coldRequests:run.network.cold.requests,htmlMatches:run.verification.matches,failures:run.failures}));
              if (run.failures.length) throw new Error(`${engine}/${edition.id}/${viewport.name}/round ${round+1}: ${run.failures.join('; ')}`);
            } finally { await context.close(); }
          }
        }
      }
      // Verify that the files are still the measured builds before promoting the final dataset.
      for (const edition of selected) {
        if ((await fingerprint(edition)).sha256!==results.builds[edition.id].sha256) throw new Error(`${edition.id} dist HTML changed before completion`);
      }
      for (const [key,file] of [['profileSha256','four-profile.mjs'],['runnerSha256','four-run.mjs'],['networkSha256','four-network.mjs'],['configSha256','four-config.mjs']]) results.harness[key]=sha256(await readFile(fromRoot(`benchmarks/${file}`)));
      results.status='complete';
      results.completedAt=new Date().toISOString();
      await save();
      await rename(partial,output);
      console.log(`Saved ${name} (${results.runs.length} runs).`);
    } catch (error) {
      results.status='failed';
      results.failure={message:error.message,time:new Date().toISOString()};
      await save();
      throw error;
    } finally { if (browser) await browser.close(); }
  }
}
