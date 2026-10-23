// Focused observer diagnostic only: two sequential CSS navigations, no benchmark workload or primary output.
import {chromium,webkit} from 'playwright';
import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {createBenchmarkServer} from './serve.mjs';
import {observeNetwork,collectNetwork,verifyNetwork} from './network.mjs';
import {CONTEXT_OPTIONS,launchOptions,fingerprints,fromRoot} from './config.mjs';

const snapshot=await fingerprints();
const server=await createBenchmarkServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin=`http://127.0.0.1:${server.address().port}`,batchId=randomUUID();
const diagnostic={diagnostic:true,purpose:'Actual favicon observation only; not a benchmark',startedAt:new Date().toISOString(),origin,runs:[]};
try {
  for (const engine of ['edge','webkit']) {
    const browser=await (engine==='edge'?chromium:webkit).launch(launchOptions(engine));
    try {
      const context=await browser.newContext({...CONTEXT_OPTIONS,viewport:{width:1440,height:1080}});
      try {
        const page=await context.newPage(),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
        const observed=observeNetwork(page),url=new URL('/revision-2/css/',origin);
        url.searchParams.set('bench',`${batchId}-${engine}-desktop-1`);
        await page.goto(url.href,{waitUntil:'load'});
        await page.waitForTimeout(500); // Allow the browser's own favicon lookup; never inject one.
        const timing=await page.evaluate(()=>({timeOrigin:performance.timeOrigin,coldCutoff:performance.now(),workloadCutoff:performance.now(),workload:[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')].filter(e=>/^https?:/.test(e.name)).map(e=>({name:e.name,entryType:e.entryType,initiatorType:e.initiatorType||'navigation',startTime:e.startTime,responseEnd:e.responseEnd,encodedBodySize:e.encodedBodySize,decodedBodySize:e.decodedBodySize,transferSize:e.transferSize,deliveryType:e.deliveryType||null}))}));
        const network=await collectNetwork(observed,timing,{}, {documentURL:url.href,auditServer:true});
        const run={engine,edition:'css',url:url.href,transport:{requiredEncoding:'br'},network,errors};
        run.failures=[...errors,...verifyNetwork(run,snapshot,origin)];
        diagnostic.runs.push(run);
        console.log(JSON.stringify({engine,requests:network.workload.requests,failures:run.failures,favicon:network.resources.filter(resource=>new URL(resource.url).pathname==='/favicon.ico'),audit:network.auxiliaryAudit?.matches}));
      } finally {await context.close();}
    } finally {await browser.close();}
  }
} finally {
  server.closeAllConnections();
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  diagnostic.completedAt=new Date().toISOString();
  const path=fromRoot(`revision-2/benchmarks/diagnostics/favicon-observer-${batchId}.json`);
  await mkdir(fromRoot('revision-2/benchmarks/diagnostics'),{recursive:true});
  await writeFile(path,JSON.stringify(diagnostic,null,2)+'\n',{flag:'wx'});
  console.log(`Focused diagnostic evidence: ${path}`);
}
if(diagnostic.runs.length!==2 || diagnostic.runs.some(run=>run.failures.length))throw new Error('Focused favicon observation diagnostic failed');
