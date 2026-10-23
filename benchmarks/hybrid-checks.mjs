import {chromium,webkit} from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const origin=process.env.CARD_BENCH_ORIGIN||'http://127.0.0.1:18787';
await mkdir('benchmarks/screenshots/hybrid-exports',{recursive:true});
const results=[];
for(const [engine,launcher] of Object.entries({chromium,webkit})){
 const browser=await launcher.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1080,height:792},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/hybrid/');
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('#gallery img')].map(i=>i.decode()))});
  assert.equal(await page.locator('#gallery .card').count(),12);assert.equal(await page.locator('#gallery .card-stat').count(),72);
  await page.screenshot({path:`benchmarks/screenshots/${engine}-hybrid-desktop.png`});
  const defaults=await page.evaluate(()=>window.cardCollection.exportState());
  await page.locator('#gallery .card').first().click();
  await page.locator('#player-name').fill('JAKOB');await page.locator('#player-rating').fill('99');await page.locator('#player-position').selectOption('GK');await page.locator('#player-country').selectOption('brazil');await page.locator('[data-stat]').first().fill('97');
  assert.equal(await page.locator('#detail-artwork .card-name').textContent(),'JAKOB');
  assert.equal(await page.locator('#detail-artwork .card-stat small').first().textContent(),'DIV');
  await page.locator('#next-card').click();await page.locator('#previous-card').click();assert.equal(await page.locator('#player-name').inputValue(),'JAKOB');
  await page.reload();await page.locator('#gallery .card').first().click();
  const saved=await page.evaluate(()=>window.cardCollection.getState('parchment'));assert.equal(saved.name,'JAKOB');assert.equal(saved.rating,99);assert.equal(saved.position,'GK');assert.equal(saved.country,'brazil');assert.equal(saved.stats[0],97);
  await page.locator('#reset-card').click();await page.locator('#cancel-reset').click();assert.equal(await page.locator('#player-name').inputValue(),'JAKOB');await page.locator('#reset-card').click();await page.locator('#confirm-reset').click();
  assert.deepEqual(await page.evaluate(()=>window.cardCollection.getState('parchment')),{theme:'parchment',...defaults.cards.parchment});
  await page.locator('#previous-card').click();assert.equal(await page.locator('#detail-position').textContent(),'12 / 12');await page.keyboard.press('Escape');
  const exports=[];
  for(let index=0;index<12;index++){
   await page.locator('#gallery .card').nth(index).click();
   const shape=await page.locator('#detail-artwork .card').evaluate(c=>({theme:c.dataset.theme,width:+c.dataset.width,height:+c.dataset.height,rect:c.getBoundingClientRect().toJSON()}));
   assert(Math.abs(shape.rect.width/shape.rect.height-shape.width/shape.height)<.002);
   const event=page.waitForEvent('download');await page.locator('#export-card').click();const download=await event;
   const file=`benchmarks/screenshots/hybrid-exports/${engine}-${shape.theme}.png`;await download.saveAs(file);const metadata=await sharp(file).metadata();assert.equal(metadata.height,1280);assert.equal(metadata.width,Math.round(1280*shape.width/shape.height));assert(metadata.hasAlpha);
   exports.push({theme:shape.theme,width:metadata.width,height:metadata.height,alpha:metadata.hasAlpha});
   await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
  const mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,scrollHeight:document.documentElement.scrollHeight,cardWidths:[...document.querySelectorAll('#gallery .card')].map(c=>c.getBoundingClientRect().width)}));assert.equal(mobile.overflow,false);assert(mobile.cardWidths.every(w=>w>=130&&w<=175));
  await page.screenshot({path:`benchmarks/screenshots/${engine}-hybrid-mobile.png`,fullPage:true});
  await page.locator('#gallery .card').nth(3).click();await page.locator('#player-name').fill('MAXIMILIAN MUSTER');
  await page.screenshot({path:`benchmarks/screenshots/${engine}-hybrid-mobile-editor.png`,fullPage:true});
  const clipped=await page.locator('#detail-artwork .card-name').evaluate(e=>e.scrollWidth>e.clientWidth);assert.equal(clipped,false);
  await page.locator('#reset-all').click();await page.locator('#confirm-reset').click();assert.deepEqual(await page.evaluate(()=>window.cardCollection.exportState()),defaults);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#card-dialog').evaluate(d=>d.open),false);
  assert.deepEqual(errors,[]);results.push({engine,browser:browser.version(),editing:true,persistence:true,resets:true,wrap:true,escape:true,originalAspectRatio:true,mobile,exports,errors});
  console.log(engine+' passed editing, reload, resets, 12 PNG exports, proportions and mobile checks.');
 }finally{await browser.close()}
}
await writeFile('benchmarks/hybrid-checks.json',JSON.stringify(results,null,2));
