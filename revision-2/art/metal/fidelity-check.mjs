// Private artwork-only rendering and evidence. No server, full build or timing run.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { svgArt, cssArt, basicArt, cssStyles, basicStyles } from './index.mjs';
import { cards } from '../../cards.mjs';
import { flagsFor } from '../../flags.mjs';
const root=new URL('../../../',import.meta.url),out=new URL('../../evidence/fidelity/metal/',import.meta.url);
await mkdir(out,{recursive:true});
let fonts=await readFile(new URL('assets/fonts.css',root),'utf8');
for(const match of [...fonts.matchAll(/url\('([^']+)'\)/g)])fonts=fonts.replace(match[0],`url('data:font/woff2;base64,${(await readFile(new URL('assets/'+match[1],root))).toString('base64')}')`);
const shared=await readFile(new URL('../../style.css',import.meta.url),'utf8');
const themes=['valor','nexus','aurum','legacy'];
const editions={svg:[svgArt,''],css:[cssArt,cssStyles],basic:[basicArt,basicStyles]};
const engine=process.argv.includes('--webkit')?'webkit':'chromium';
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true});
const report={engine,errors:[],cards:[]};
try {
  const page=await browser.newPage({viewport:{width:1280,height:430},deviceScaleFactor:1});
  page.on('pageerror',e=>report.errors.push(e.message));
  for(const [edition,[art,styles]] of Object.entries(editions)){
    const flags=await flagsFor(edition);
    for(const scale of [1,1.5]){
      const html=`<!doctype html><html><head><meta charset="utf-8"><style>${fonts}\n${shared}\n${styles}\n${flags.styles}\nbody{background:#111516;margin:0;padding:20px;display:flex;gap:16px}.sample{position:relative;width:${300*scale}px;height:${380*scale}px;flex:none}.card{transform:scale(${scale})}</style></head><body data-edition="${edition}">${themes.map(theme=>{const c=cards.find(c=>c.theme===theme);return `<div class="sample" data-theme="${theme}"><div class="card card--${theme}" style="--card-color:${c.color}"><div class="card-art">${art[theme]}</div><div class="card-info"><div class="card-rating"><strong>${c.rating}</strong><span>${c.position}</span></div><p class="card-name">${c.name}</p><div class="card-flag">${flags.drawings[c.country]}</div><div class="card-stats">${c.stats.map((n,i)=>`<div class="card-stat"><small>${['PAC','SHO','PAS','DRI','DEF','PHY'][i]}</small><strong>${n}</strong></div>`).join('')}</div></div></div></div>`;}).join('')}</body></html>`;
      await writeFile(new URL(`${edition}-${300*scale}-preview.html`,out),html);
      await page.setViewportSize({width:40+4*300*scale+48,height:40+380*scale});
      await page.setContent(html,{waitUntil:'load'});
      await page.evaluate(()=>document.fonts.ready);
      await page.screenshot({path:fileURLToPath(new URL(`${engine}-${edition}-${300*scale}-grid.png`,out))});
      for(const theme of themes){
        await page.locator(`[data-theme="${theme}"]`).screenshot({path:fileURLToPath(new URL(`${engine}-${edition}-${theme}-${300*scale}.png`,out))});
      }
      if(scale===1)report.cards.push(...await page.evaluate(edition=>[...document.querySelectorAll('.sample')].map(sample=>{
        const root=sample.querySelector('.card-art').firstElementChild,all=[root,...root.querySelectorAll('*')],bad=[];
        let masks=0,conicGradients=0;
        for(const el of all){
          const tag=el.tagName.toLowerCase();
          if(edition==='svg'&&['image','foreignobject','text','filter'].includes(tag))bad.push(tag);
          if(edition!=='svg'&&['svg','canvas','img','image','picture'].includes(tag))bad.push(tag);
          for(const pseudo of [null,'::before','::after']){
            const s=getComputedStyle(el,pseudo);
            if(edition!=='svg'&&/url\(/i.test(s.backgroundImage))bad.push('external image');
            if(edition==='basic'&&(s.clipPath!=='none'||s.maskImage!=='none'||s.clip!=='auto'))bad.push('restricted basic geometry');
            if(s.filter!=='none'||s.animationName!=='none')bad.push('filter/animation');
            if(s.maskImage!=='none')masks++;
            if(s.backgroundImage.includes('conic-gradient'))conicGradients++;
          }
        }
        const r=root.getBoundingClientRect();
        return {edition,theme:sample.dataset.theme,elements:all.length,width:r.width,height:r.height,masks,conicGradients,bad:[...new Set(bad)]};
      }),edition));
    }
  }
  const isolated=await browser.newPage({viewport:{width:300,height:380},deviceScaleFactor:1});
  for(const [edition,[art,styles]] of Object.entries(editions))for(const theme of themes){
    await isolated.setContent(`<style>html,body{margin:0;width:300px;height:380px;background:transparent}body>svg{display:block}${styles}</style>${art[theme]}`);
    const {data,info}=await sharp(await isolated.screenshot({omitBackground:true})).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let edgePixels=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
      if(x!==0&&x!==info.width-1&&y!==0&&y!==info.height-1)continue;
      if(data[(y*info.width+x)*4+3]>10)edgePixels++;
    }
    report.cards.find(c=>c.edition===edition&&c.theme===theme).edgePixels=edgePixels;
  }
} finally {await browser.close();report.browserClosed=true;}
assert.deepEqual(report.errors,[]);
for(const c of report.cards){
  assert.deepEqual(c.bad,[],`${c.edition}/${c.theme}`);
  assert(c.elements<=(c.edition==='svg'?350:220));assert.equal(c.width,300);assert.equal(c.height,380);
  assert.equal(c.edgePixels,0,`${c.edition}/${c.theme} canvas clearance`);
  if(c.edition==='css'){assert.equal(c.masks,0);assert.equal(c.conicGradients,0);}
}
assert(!/(?:clip-path|mask(?:-image)?\s*:|polygon\(|path\(|shape\(|border-shape)/i.test(basicStyles+Object.values(basicArt).join('')));
if(engine==='chromium'){
  for(const edition of Object.keys(editions))for(const theme of themes){
    const baseline=new URL(`../../evidence/fidelity/baseline/${edition}-${theme}.png`,import.meta.url);
    let before;
    try {before=await sharp(await readFile(baseline)).resize(450,570,{fit:'contain',background:'#111516'}).toBuffer();} catch {continue;}
    const ref=await readFile(new URL(`reference-${theme}-450.png`,out));
    const after=await readFile(new URL(`chromium-${edition}-${theme}-450.png`,out));
    await sharp({create:{width:1382,height:570,channels:4,background:'#111516'}}).composite([{input:ref,left:0,top:0},{input:before,left:466,top:0},{input:after,left:932,top:0}]).png().toFile(fileURLToPath(new URL(`compare-${edition}-${theme}.png`,out)));
  }
}
if(engine==='chromium'){
  const gridNames=Object.keys(editions).map(edition=>`chromium-${edition}-300-grid.png`);
  const grids=await Promise.all(gridNames.map(name=>readFile(new URL(name,out))));
  const m=await sharp(grids[0]).metadata();
  await sharp({create:{width:m.width,height:m.height*3,channels:4,background:'#111516'}}).composite(grids.map((input,i)=>({input,left:0,top:i*m.height}))).png().toFile(fileURLToPath(new URL('./preview.png',import.meta.url)));
  const preview=`<!doctype html><meta charset="utf-8"><title>Metal artwork inspection</title><style>body{background:#111516;color:#fff;font:14px sans-serif}iframe{display:block;border:0;width:${m.width}px;height:${m.height}px}h2{font-weight:400}</style>${Object.keys(editions).map(edition=>`<h2>${edition.toUpperCase()} · actual shared fields</h2><iframe src="../../evidence/fidelity/metal/${edition}-300-preview.html"></iframe>`).join('')}`;
  await writeFile(new URL('./preview.html',import.meta.url),preview);
}
await writeFile(new URL(`${engine}-checks.json`,out),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
