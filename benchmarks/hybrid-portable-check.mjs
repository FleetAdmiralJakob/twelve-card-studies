import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {unzipSync} from 'fflate';
import {chromium} from 'playwright';
const root=resolve('benchmarks/portable-hybrid');
const files=unzipSync(new Uint8Array(await readFile('dist/hybrid-source.zip')));
assert(files['licenses/Oswald-LICENSE.txt']);assert(files['licenses/Barlow-Condensed-LICENSE.txt']);
for(const [name,data] of Object.entries(files)){
 const path=resolve(root,name);assert(path.startsWith(root+sep));
 await mkdir(dirname(path),{recursive:true});await writeFile(path,data);
}
const child=spawn(process.execPath,['serve.mjs'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
let browser;
try{
 await new Promise((yes,no)=>{const timer=setTimeout(()=>no(Error('Portable server readiness timeout')),10000);child.stdout.once('data',()=>{clearTimeout(timer);yes();});child.once('error',no);child.once('exit',code=>{clearTimeout(timer);no(Error('Portable server exited '+code));});});
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1080,height:792},acceptDownloads:true});
 const errors=[],failures=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto('http://localhost:5180/');await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('#gallery .card').count(),12);
 assert(await page.locator('#gallery img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>i.decode()));return imgs.every(i=>i.complete&&i.naturalWidth>0);}));
 await page.locator('#gallery .card').first().click();await page.locator('#player-name').fill('PORTABLE TEST');
 assert.equal(await page.locator('#detail-artwork .card-name').innerText(),'PORTABLE TEST');
 const download=page.waitForEvent('download');await page.locator('#export-card').click();
 const file=await download;assert.equal(await file.failure(),null);assert.match(file.suggestedFilename(),/\.png$/);
 await file.saveAs('benchmarks/screenshots/hybrid-portable-export.png');
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 const evidence={date:new Date().toISOString(),files:Object.keys(files).length,cards:12,fontsReady:true,artDecoded:true,edited:true,exported:file.suggestedFilename(),errors,failures};
 await writeFile('benchmarks/hybrid-portable-check.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
}finally{await browser?.close();child.kill();}
