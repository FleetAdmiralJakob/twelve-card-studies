import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {chromium} from 'playwright';
import {editions,fromRoot,readJSON,sha256 as hash} from './four-config.mjs';
import {validateBuildHistory,compareMeasuredHtml,collectionFooter} from './four-build-history.mjs';
const origin='http://jakobs-pc.taile7e918.ts.net:8787';
const data=await readJSON('benchmarks/four-combined.json');
assert.deepEqual(data.editions,editions,'Report edition routes changed');
assert.deepEqual(data.main,await readJSON('benchmarks/four-results.json'),'Report does not contain the original Edge records');
assert.deepEqual(data.webkit,await readJSON('benchmarks/four-webkit-results.json'),'Report does not contain the original WebKit records');
const history=await validateBuildHistory({edge:data.main,webkit:data.webkit});
assert.deepEqual(data.verification.currentBuilds,history.current,'Regenerate the report for the current HTML builds before publication');
assert.deepEqual(data.verification.htmlComparisons,history.comparisons,'Report snapshot/current comparisons are stale');
for(const [engine,source] of [['edge',data.main],['webkit',data.webkit]])for(const run of source.runs){
  const measured=history.measured[run.edition];
  assert(measured,`${engine}: unknown measured edition`);
  assert.equal(run.verification?.matches,true,`${engine}: unverified run`);
  assert.equal(run.verification.localSha256,measured.sha256,`${engine}: run local hash differs from measured HTML`);
  assert.equal(run.verification.servedSha256,measured.sha256,`${engine}: run served hash differs from measured HTML`);
}
const checks={date:new Date().toISOString(),origin,pages:[],assets:[],originalEditionsOutsideFooterUnchanged:true,hybridHtmlUnchanged:true};
for(const e of editions){
  const r=await fetch(origin+e.route);assert.equal(r.status,200);
  const bytes=Buffer.from(await r.arrayBuffer());
  assert.equal(hash(bytes),history.current[e.id].sha256,`${e.id}: published HTML differs from current dist`);
  const difference=compareMeasuredHtml(e,history.measuredHtml[e.id],bytes);
  assert.equal(difference,history.comparisons[e.id].difference);
  const footer=collectionFooter(bytes,`${e.id} published`).footer.toString('utf8');
  const navs=[...footer.matchAll(/<nav\b[^>]*\sclass="edition-nav"[^>]*>[\s\S]*?<\/nav>/g)];
  assert.equal(navs.length,1,`${e.id}: missing or duplicate edition navigation`);
  const nav=navs[0][0];
  const links=new Set([...nav.matchAll(/<a\s[^>]*\bhref="([^"]+)"/g)].map(match=>match[1]));
  for(const route of [...editions.filter(other=>other.id!==e.id).map(other=>other.route),'/compare/'])assert(links.has(route),`${e.id}: footer link missing for ${route}`);
  assert.equal([...nav.matchAll(/aria-current="page"/g)].length,1,`${e.id}: missing or duplicate current edition`);
  checks.pages.push({edition:e.id,status:r.status,sha256:hash(bytes),measuredSha256:history.measured[e.id].sha256,difference,navigationLinks:true});
}
for(const a of data.verification.assetResponses){const path=new URL(a.url).pathname;const r=await fetch(origin+path);assert.equal(r.status,200);assert.equal(hash(Buffer.from(await r.arrayBuffer())),a.sha256);assert.match(r.headers.get('cache-control'),/immutable/);checks.assets.push({path,match:true,immutable:true});}
const raw=await fetch(origin+'/compare/data.json');assert.equal(raw.status,200);const online=await raw.json();assert.deepEqual(online,data,'Published report data is stale');assert.equal(online.main.runs.length,online.main.method.expectedRuns);assert.equal(online.webkit.runs.length,online.webkit.method.expectedRuns);
const reportResponse=await fetch(origin+'/compare/');assert.equal(reportResponse.status,200);assert.equal(hash(Buffer.from(await reportResponse.arrayBuffer())),hash(await readFile(fromRoot('dist/compare.html'))),'Published report HTML is stale');
const zipResponse=await fetch(origin+'/source/hybrid');assert.equal(zipResponse.status,200);assert.match(zipResponse.headers.get('content-disposition'),/attachment/);const zip=unzipSync(new Uint8Array(await zipResponse.arrayBuffer()));assert(zip['index.html']);assert(zip['serve.mjs']);assert(zip['reference.png']);const html=strFromU8(zip['index.html']);for(const m of html.matchAll(/assets\/([a-zA-Z0-9@._-]+\.(?:avif|webp|woff2))/g))assert(zip['assets/'+m[1]],m[1]+' missing from ZIP');checks.zipFiles=Object.keys(zip).length;
const b=await chromium.launch({headless:true});
try{const p=await b.newPage({viewport:{width:1080,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/compare/');await p.screenshot({path:'benchmarks/screenshots/four-report-desktop.png',fullPage:true});assert.equal(await p.locator('select').count(),2);const selects=p.locator('select');for(const engine of ['main','webkit'])for(const viewport of ['desktop','mobile']){await selects.nth(0).selectOption(engine);await selects.nth(1).selectOption(viewport);assert.doesNotMatch(await p.locator('main').innerText(),/NaN|undefined/);}
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'benchmarks/screenshots/four-report-mobile.png',fullPage:true});assert.deepEqual(errors,[]);checks.report={controls:true,mobileOverflow:false,errors};
}finally{await b.close();}
await writeFile('benchmarks/four-publish-checks.json',JSON.stringify(checks,null,2));console.log(JSON.stringify({pages:checks.pages.length,assets:checks.assets.length,zipFiles:checks.zipFiles,originalEditionsOutsideFooterUnchanged:checks.originalEditionsOutsideFooterUnchanged,hybridHtmlUnchanged:checks.hybridHtmlUnchanged,report:checks.report}));
