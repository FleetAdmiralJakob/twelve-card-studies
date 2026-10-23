import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('benchmarks/screenshots',{recursive:true});
const engines=process.argv.includes('--webkit')?{webkit}:{chromium};
const results=[];
for(const [engine,launcher] of Object.entries(engines)){
 const browser=await launcher.launch({headless:true});
 for(const [edition,file] of [['svg','hosted'],['css','css'],['basic','basic']]){
  const context=await browser.newContext({viewport:{width:1080,height:792},deviceScaleFactor:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://localhost:5173/dist/${file}.html`,{waitUntil:'load'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('#gallery img')].map(i=>i.decode()));await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
  await page.screenshot({path:`benchmarks/screenshots/${engine}-${edition}-desktop.png`});
  const audit=await page.evaluate(()=>{
    const elements=[...document.querySelectorAll('#gallery *')];
    const violations={clipPaths:[],masks:[],imageUrls:[],borderShapes:[]};
    for(const el of elements){for(const pseudo of [null,'::before','::after']){const s=getComputedStyle(el,pseudo),name=el.className+(pseudo||'');if(s.clipPath&&s.clipPath!=='none')violations.clipPaths.push(name);if(s.maskImage&&s.maskImage!=='none')violations.masks.push(name);if(/url\(/i.test(s.backgroundImage))violations.imageUrls.push(name);const b=s.getPropertyValue('border-shape');if(b&&b!=='none')violations.borderShapes.push(name);}}
    const flags=[...document.querySelectorAll('#gallery .card')].map(c=>{const a=c.querySelector('.card-stats').getBoundingClientRect(),b=c.querySelector('.flag').getBoundingClientRect();return {theme:c.dataset.theme||c.className,gap:Math.round((b.top-a.bottom)*100)/100,ratio:Math.round(b.width/b.height*1000)/1000}});
    return {cards:document.querySelectorAll('#gallery .card').length,stats:document.querySelectorAll('#gallery .card-stat').length,svg:document.querySelectorAll('#gallery svg').length,img:document.querySelectorAll('#gallery img').length,canvas:document.querySelectorAll('canvas').length,violations:Object.fromEntries(Object.entries(violations).map(([k,v])=>[k,{count:v.length,examples:[...new Set(v)].slice(0,5)}])),flags,features:{borderShape:CSS.supports('border-shape:circle(50%)'),cornerShape:CSS.supports('corner-shape:superellipse(.6)'),shape:CSS.supports('clip-path:shape(from 0% 0%,line to 100% 0%,line to 0% 100%,close)'),contentVisibility:CSS.supports('content-visibility:auto')},horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
  });
  await page.locator('#gallery .card').first().click();await page.locator('#player-name').fill('JAKOB');await page.locator('#next-card').click();await page.locator('#previous-card').click();const persisted=await page.locator('#player-name').inputValue();await page.locator('#player-name').fill('');await page.keyboard.press('Escape');
  const closed=await page.locator('#card-dialog').evaluate(d=>!d.open);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:`benchmarks/screenshots/${engine}-${edition}-mobile.png`,fullPage:true});
  const mobile=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,scrollHeight:document.documentElement.scrollHeight}));
  results.push({engine,edition,audit,mobile,persisted:persisted==='JAKOB',escape:closed,errors});console.log(JSON.stringify(results.at(-1)));
  await context.close();
 }
 await browser.close();
}
await writeFile(`benchmarks/checks-${Object.keys(engines)[0]}.json`,JSON.stringify(results,null,2));
if(results.some(r=>r.errors.length||!r.persisted||!r.escape||r.mobile.overflow||r.audit.horizontalOverflow||r.audit.cards!==12||r.audit.stats!==72||(r.edition==='basic'&&(r.audit.svg||r.audit.img||r.audit.canvas||r.audit.violations.clipPaths.count||r.audit.violations.masks.count||r.audit.violations.imageUrls.count||r.audit.violations.borderShapes.count))))process.exitCode=1;
