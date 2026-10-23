import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {chromium} from 'playwright';
import {editions,fromRoot,readJSON,sha256 as hash} from './four-config.mjs';
import {validateBuildHistory,compareMeasuredHtml,collectionFooter,currentEditions} from './four-build-history.mjs';
const origin='http://jakobs-pc.taile7e918.ts.net:8787';
const data=await readJSON('benchmarks/four-combined.json');
assert.deepEqual(data.editions,editions,'Report edition routes changed');
assert.deepEqual(data.currentEditions,currentEditions,'Report current edition routes are stale');
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
const checks={date:new Date().toISOString(),origin,pages:[],assets:[],downloads:[],originalEditionsOutsideFooterUnchanged:true,allEditionsOutsideFooterUnchanged:true,hybridHtmlUnchanged:history.comparisons.hybrid.difference==='exact'};
for(const e of currentEditions){
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
  for(const route of [...currentEditions.filter(other=>other.id!==e.id).map(other=>other.route),'/compare/','/collections/','/revision-2/svg/'])assert(links.has(route),`${e.id}: footer link missing for ${route}`);
  assert(!links.has('/'),`${e.id}: footer still links to the historical V1 route`);
  assert.match(nav,/<a href="\/collections\/">All collections<\/a>/,`${e.id}: missing All collections label`);
  assert.match(nav,/<a href="\/revision-2\/svg\/">Revision 2<\/a>/,`${e.id}: missing Revision 2 label`);
  assert.equal([...nav.matchAll(/aria-current="page"/g)].length,1,`${e.id}: missing or duplicate current edition`);
  checks.pages.push({edition:e.id,route:e.route,measuredRoute:editions.find(measured=>measured.id===e.id).route,status:r.status,sha256:hash(bytes),measuredSha256:history.measured[e.id].sha256,difference,navigationLinks:true});
  if(e.id!=='hybrid'){
    const download=await fetch(origin+e.source);assert.equal(download.status,200,`${e.id}: source download missing`);
    assert.match(download.headers.get('content-disposition')||'',/attachment/,`${e.id}: source must download as an attachment`);
    const sourceHash=hash(Buffer.from(await download.arrayBuffer()));
    assert.equal(sourceHash,history.current[e.id].sha256,`${e.id}: download differs from current HTML`);
    checks.downloads.push({edition:e.id,route:e.source,sha256:sourceHash,matchesCurrentHtml:true});
  }
}
for(const a of data.verification.assetResponses){const path=new URL(a.url).pathname;const r=await fetch(origin+path);assert.equal(r.status,200);assert.equal(hash(Buffer.from(await r.arrayBuffer())),a.sha256);assert.match(r.headers.get('cache-control'),/immutable/);checks.assets.push({path,match:true,immutable:true});}
// Both hosting targets publish the deterministic measurement-snapshot copy.
// Only its generation label differs from the fresh validation output in dist.
const publishedData=await readJSON('site/compare/data.json');
assert.deepEqual({...publishedData,generatedAt:data.generatedAt},data,'Static report differs from the validated report beyond its timestamp');
assert.equal(publishedData.generatedAt,new Date(Math.max(Date.parse(data.main.completedAt),Date.parse(data.webkit.completedAt))).toISOString(),'Static report snapshot timestamp is stale');
const raw=await fetch(origin+'/compare/data.json');assert.equal(raw.status,200);const online=await raw.json();assert.deepEqual(online,publishedData,'Published report data is stale');assert.equal(online.main.runs.length,online.main.method.expectedRuns);assert.equal(online.webkit.runs.length,online.webkit.method.expectedRuns);
const reportResponse=await fetch(origin+'/compare/');assert.equal(reportResponse.status,200);assert.equal(hash(Buffer.from(await reportResponse.arrayBuffer())),hash(await readFile(fromRoot('site/compare/index.html'))),'Published report HTML is stale');
const zipResponse=await fetch(origin+'/source/hybrid');assert.equal(zipResponse.status,200);assert.match(zipResponse.headers.get('content-disposition')||'',/attachment/);
const zipBytes=Buffer.from(await zipResponse.arrayBuffer());
assert.equal(hash(zipBytes),hash(await readFile(fromRoot('dist/hybrid-source.zip'))),'Published hybrid ZIP differs from the current local ZIP');
const zip=unzipSync(zipBytes);assert(zip['index.html']);assert(zip['serve.mjs']);assert(zip['reference.png']);
const html=strFromU8(zip['index.html']);
for(const m of html.matchAll(/assets\/([a-zA-Z0-9@._-]+\.(?:avif|webp|woff2))/g))assert(zip['assets/'+m[1]],m[1]+' missing from ZIP');
// The ZIP rewrites asset/navigation URLs for portable use. Infer its configured
// origin, then reproduce only those build substitutions before comparing hashes.
const portableFooter=collectionFooter(Buffer.from(zip['index.html']),'hybrid ZIP').footer.toString('utf8');
const portableV1=[...portableFooter.matchAll(/<a href="(https?:\/\/[^"\s]+)" aria-label="Version 1">V1<\/a>/g)];
assert.equal(portableV1.length,1,'Hybrid ZIP must have one current V1 link');
const portableURL=new URL(portableV1[0][1]);
assert.equal(portableURL.pathname,'/original/','Hybrid ZIP still uses the historical V1 route');
assert(!portableURL.username && !portableURL.password && !portableURL.search && !portableURL.hash,'Invalid hybrid ZIP navigation origin');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const currentHybrid=await readFile(fromRoot('dist/hybrid.html'));
assert.equal(hash(currentHybrid),history.current.hybrid.sha256,'Hybrid HTML changed during download validation');
const expectedPortable=currentHybrid.toString('utf8').replaceAll('/hybrid/assets/','assets/').replaceAll('href="/hybrid/"','href="./"').replaceAll('href="/reference"','href="reference.png"').replace(/href="\/(?!\/)([^"]*)"/g,(_,route)=>`href="${escape(portableURL.origin+'/'+route)}"`);
assert.equal(hash(zip['index.html']),hash(expectedPortable),'Hybrid ZIP HTML differs from current HTML after portable URL rewrites');
for(const asset of await readJSON('dist/hybrid-assets.json')){
  const filename='assets/'+asset.url.split('/').at(-1);
  assert(zip[filename],`${filename} missing from ZIP`);
  assert.equal(hash(zip[filename]),asset.sha256,`${filename}: ZIP asset differs from current manifest`);
}
assert.equal(hash(zip['reference.png']),hash(await readFile(fromRoot('assets/reference.png'))),'Hybrid ZIP reference is stale');
checks.downloads.push({edition:'hybrid',route:'/source/hybrid',sha256:hash(zipBytes),htmlSha256:hash(zip['index.html']),currentHtmlSha256:history.current.hybrid.sha256,matchesCurrentHtmlAfterPortableUrlRewrites:true,portableOrigin:portableURL.origin});
checks.zipFiles=Object.keys(zip).length;
const b=await chromium.launch({headless:true});
try{const p=await b.newPage({viewport:{width:1080,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/compare/');await p.screenshot({path:'benchmarks/screenshots/four-report-desktop.png',fullPage:true});assert.equal(await p.locator('select').count(),2);const selects=p.locator('select');for(const engine of ['main','webkit'])for(const viewport of ['desktop','mobile']){await selects.nth(0).selectOption(engine);await selects.nth(1).selectOption(viewport);assert.doesNotMatch(await p.locator('main').innerText(),/NaN|undefined/);}
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'benchmarks/screenshots/four-report-mobile.png',fullPage:true});assert.deepEqual(errors,[]);checks.report={controls:true,mobileOverflow:false,errors};
}finally{await b.close();}
await writeFile('benchmarks/four-publish-checks.json',JSON.stringify(checks,null,2));console.log(JSON.stringify({pages:checks.pages.length,assets:checks.assets.length,downloads:checks.downloads.length,zipFiles:checks.zipFiles,originalEditionsOutsideFooterUnchanged:checks.originalEditionsOutsideFooterUnchanged,allEditionsOutsideFooterUnchanged:checks.allEditionsOutsideFooterUnchanged,hybridHtmlUnchanged:checks.hybridHtmlUnchanged,report:checks.report}));
