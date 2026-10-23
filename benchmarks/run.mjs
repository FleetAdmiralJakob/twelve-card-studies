import {chromium,webkit} from 'playwright';
import {readFile,writeFile,stat,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import os from 'node:os';
const origin=process.env.CARD_BENCH_ORIGIN||'http://127.0.0.1:18787';
const script=(await readFile('benchmarks/profile.js','utf8')).trim();
const quick=process.argv.includes('--quick');
const featureOnly=process.argv.includes('--features');
const webkitOnly=process.argv.includes('--webkit');
const variants=[['svg','/','hosted'],['css','/css/','css'],['basic','/basic/','basic']];
const viewports=[{name:'desktop',width:1080,height:792},{name:'mobile',width:390,height:844}];
const results={date:new Date().toISOString(),origin,hardware:{cpu:os.cpus()[0]?.model,logicalCores:os.cpus().length,memoryGB:Math.round(os.totalmem()/1024**3),platform:os.platform(),release:os.release()},method:{headless:true,networkThrottling:false,cpuThrottling:false,freshContextPerRun:true,dpr:1,rounds:quick?1:3,order:'Rotated SVG/CSS/basic, CSS/basic/SVG, basic/SVG/CSS',workload:'All12first opens;12next-card changes over180animationframes;180scrollframes on mobile. No artificial animation of static artwork. Viewports emulate layout, not physicaldevices. Longtask/FCP support varies byengine.'},builds:{},runs:[]};
for(const [key,,file] of variants){const bytes=await readFile(`dist/${file}.html`);results.builds[key]={rawBytes:bytes.length,gzipBytes:(await stat(`dist/${file}.html.gz`)).size,brotliBytes:(await stat(`dist/${file}.html.br`)).size,sha256:createHash('sha256').update(bytes).digest('hex')};}
const engine=webkitOnly?'webkit':'edge';
const browser=webkitOnly?await webkit.launch({headless:true}):await chromium.launch({channel:'msedge',headless:true});
results.browser={engine,version:browser.version()};
const rounds=quick?1:3;
const output=featureOnly?'benchmarks/features-results.json':webkitOnly?'benchmarks/webkit-results.json':'benchmarks/results.json';
try{
 for(const viewport of (featureOnly?[viewports[1]]:viewports)){
  for(let round=0;round<rounds;round++){
   const ordered=featureOnly?[variants[2]]:[...variants.slice(round%3),...variants.slice(0,round%3)];
   for(const [edition,route] of ordered){
    for(const featureMode of (featureOnly?(round%2?['cv','fallback','enhanced']:['enhanced','fallback','cv']):['enhanced'])){
     const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
     if(featureMode==='fallback')await context.addInitScript(()=>{const mark=()=>{if(document.documentElement){document.documentElement.dataset.cssFallback='true';return true}return false};if(!mark()){const o=new MutationObserver(()=>{if(mark())o.disconnect()});o.observe(document,{childList:true,subtree:true})}});
     if(featureMode==='cv')await context.addInitScript(()=>{const mark=()=>{if(document.documentElement){document.documentElement.dataset.enableCv='true';return true}return false};if(!mark()){const o=new MutationObserver(()=>{if(mark())o.disconnect()});o.observe(document,{childList:true,subtree:true})}});
     const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
     const response=await page.goto(`${origin}${route}?bench=${Date.now()}-${round}-${featureMode}`,{waitUntil:'load'});
     if(response.status()!==200)throw new Error(`HTTP${response.status()}: ${route}`);
     await page.waitForFunction(()=>document.querySelectorAll('#gallery .card').length===12);
     const run=await page.evaluate(script);
     run.engine=engine;run.round=round+1;run.profile=viewport.name;run.featureMode=featureMode;run.errors=errors;
     run.capabilities=await page.evaluate(()=>({borderShape:CSS.supports('border-shape:circle(50%)'),cornerShape:CSS.supports('corner-shape:superellipse(.6)'),contentVisibility:CSS.supports('content-visibility:auto'),colorMix:CSS.supports('color:color-mix(in oklch,red,blue)'),shape:CSS.supports('clip-path:shape(from 0% 0%,line to 100% 0%,line to 0% 100%,close)')}));
     results.runs.push(run);await writeFile(output,JSON.stringify(results,null,2));
     console.log(JSON.stringify({engine,edition,viewport:viewport.name,round:round+1,features:run.featureMode,fcp:run.load.fcp,openP95:run.dialogTwoFrame.p95,browseP95:run.browseFrames.p95,scrollP95:run.scrollFrames?.p95,checks:run.checks,errors}));
     await context.close();
    }
   }
  }
 }
}finally{await browser.close();await writeFile(output,JSON.stringify(results,null,2));}
if(results.runs.some(r=>r.errors.length||r.checks.cards!==12||r.checks.stats!==72||r.checks.horizontalOverflow||!r.checks.wrap||!r.checks.editPersisted))process.exitCode=1;
