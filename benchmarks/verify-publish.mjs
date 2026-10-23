import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const origin='http://jakobs-pc.taile7e918.ts.net:8787';
const data=JSON.parse(await readFile('benchmarks/combined.json','utf8'));
const results={date:new Date().toISOString(),origin,routes:[],browsers:[]};
for(const [edition,path,file] of [['svg','/','hosted'],['css','/css/','css'],['basic','/basic/','basic']]){
 const response=await fetch(origin+path);assert.equal(response.status,200);
 const body=Buffer.from(await response.arrayBuffer());
 const hash=createHash('sha256').update(body).digest('hex');
 assert.equal(hash,data.main.builds[edition].sha256,edition+' measured/hosted hash mismatch');
 assert.equal(hash,data.webkit.builds[edition].sha256,edition+' WebKit build mismatch');
 const local=await readFile(`dist/${file}.html`);assert.equal(Buffer.compare(local,body),0);
 if(edition!=='svg')assert.match(response.headers.get('content-security-policy'),/img-src 'none'/);
 const download=await fetch(origin+'/source/'+edition);
 assert.equal(download.status,200);assert.match(download.headers.get('content-disposition'),/^attachment;/);
 assert.equal(createHash('sha256').update(Buffer.from(await download.arrayBuffer())).digest('hex'),hash);
 results.routes.push({edition,status:200,hash,sourceDownload:true});
}
for(const path of ['/bench/','/bench/data.json','/reference']){
 const response=await fetch(origin+path);assert.equal(response.status,200);results.routes.push({path,status:response.status});
 if(path.endsWith('.json')){const online=await response.json();assert.equal(online.main.runs.length,18);assert.equal(online.webkit.runs.length,18);assert.equal(online.experiments.runs.length,9);}
}
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1080,height:792}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/bench/');
 for(const engine of ['main','webkit'])for(const profile of ['desktop','mobile']){
  await page.locator('#engine').selectOption(engine);await page.locator('#profile').selectOption(profile);
  assert.equal(await page.locator('#metrics tr').count(),3);
  assert.doesNotMatch(await page.locator('#metrics').innerText(),/undefined|NaN|null/);
 }
 await page.locator('#engine').selectOption('main');await page.locator('#profile').selectOption('desktop');
 await page.screenshot({path:'benchmarks/screenshots/report-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();
 const download=await downloadPromise;assert.equal(download.suggestedFilename(),'the-twelve-benchmarks.json');
 await page.screenshot({path:'benchmarks/screenshots/report-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);results.browsers.push({engine:'chromium',reportControls:true,rawDownload:true,mobileOverflow:false,errors});
}finally{await browser.close();}
await writeFile('benchmarks/publish-checks.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
