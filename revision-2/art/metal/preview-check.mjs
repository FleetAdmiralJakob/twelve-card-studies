import { chromium } from 'playwright';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { svgArt } from './svg.mjs';

// Private development page only; the overlay is deliberately outside the art.
const entries = [['svg',svgArt,'']];
for (const edition of ['css','basic']) {
  if (process.argv.includes('--svg')) break;
  try { await access(new URL(`./${edition}.mjs`,import.meta.url)); }
  catch { continue; }
  const mod = await import(`./${edition}.mjs`);
  entries.push([edition,mod[`${edition}Art`],mod[`${edition}Styles`]]);
}
const values={valor:['94','ST','94 96 88 93 46 91'],nexus:['95','CB','82 58 75 78 96 92'],aurum:['92','CM','87 86 93 91 77 84'],legacy:['87','RB','89 70 82 83 88 86']};
const style=`*{box-sizing:border-box}body{margin:0;padding:24px;background:#171a1b;color:#eee;font-family:Arial,sans-serif}h2{font-size:14px;font-weight:400;letter-spacing:2px;margin:0 0 14px}.row{display:flex;gap:12px;margin-bottom:30px}.sample{width:300px;height:380px;position:relative;flex-shrink:0}.sample>.r2-art,.sample>svg{position:absolute;inset:0}.live{position:absolute;inset:0;pointer-events:none;color:#fff4d7;font-family:Impact,'Arial Narrow',sans-serif;font-stretch:condensed}.sample[data-theme=nexus] .live{color:#f0f1ee}.sample[data-theme=aurum] .live{color:#252621}.sample[data-theme=legacy] .live{color:#f3cfa7}.rating{position:absolute;left:32px;top:48px;font-size:46px;line-height:1}.position{position:absolute;left:34px;top:97px;font-size:24px;line-height:1}.name{position:absolute;left:36px;right:36px;top:238px;text-align:center;font-size:25px;line-height:28px;letter-spacing:3px}.flag{position:absolute;left:91px;top:276px;width:38px;height:25px;border:1px solid #ddd;background:linear-gradient(90deg,#144d9b 33.33%,#fff 33.33% 66.66%,#e22936 66.66%)}[data-theme=nexus] .flag{background:linear-gradient(0deg,transparent 39%,#ce2733 39% 61%,transparent 61%),linear-gradient(90deg,#fff 43%,#ce2733 43% 57%,#fff 57%)}[data-theme=aurum] .flag{background:linear-gradient(90deg,#168b50 33.33%,#fff 33.33% 66.66%,#d6323e 66.66%)}[data-theme=legacy] .flag{background:linear-gradient(#101010 33.33%,#c62828 33.33% 66.66%,#edc344 66.66%)}.stats{position:absolute;left:29px;right:27px;top:315px;display:grid;grid-template-columns:repeat(6,1fr);text-align:center}.stat span{display:block;font:10px Arial,sans-serif}.stat b{display:block;font-size:20px;font-weight:400;line-height:25px}`;
const overlay = theme => { const [rating,pos,nums]=values[theme];return `<div class="live"><span class="rating">${rating}</span><span class="position">${pos}</span><span class="name">${theme.toUpperCase()}</span><i class="flag"></i><div class="stats">${nums.split(' ').map((v,i)=>`<div class="stat"><span>${['PAC','SHO','PAS','DRI','DEF','PHY'][i]}</span><b>${v}</b></div>`).join('')}</div></div>`; };
const html=`<!doctype html><html><head><meta charset="utf-8"><title>Metal — private Revision 2 art inspection</title><style>${style}\n${entries.map(e=>e[2]).join('\n')}</style></head><body>${entries.map(([edition,art])=>`<section data-edition="${edition}"><h2>${edition.toUpperCase()} — REVISION 2 / METAL</h2><div class="row">${Object.entries(art).map(([theme,markup])=>`<div class="sample" data-theme="${theme}">${markup}${overlay(theme)}</div>`).join('')}</div></section>`).join('')}</body></html>`;
await writeFile(new URL('./preview.html',import.meta.url),html);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1308,height:Math.max(460,entries.length*440+24)},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.setContent(html,{waitUntil:'load'});
await page.screenshot({path:fileURLToPath(new URL('./preview.png',import.meta.url)),fullPage:true});
const result=await page.evaluate(()=>[...document.querySelectorAll('.sample')].map(sample=>{
 const root=sample.firstElementChild,edition=sample.closest('section').dataset.edition,all=[root,...root.querySelectorAll('*')],forbidden=[];
 for(const el of all){
   if(edition==='basic'&&!['DIV','SPAN','I','B'].includes(el.tagName))forbidden.push(el.tagName);
   if(edition!=='svg'&&['SVG','CANVAS','IMG','IMAGE','PICTURE'].includes(el.tagName.toUpperCase()))forbidden.push(el.tagName);
   for(const pseudo of [null,'::before','::after']) {
     const s=getComputedStyle(el,pseudo);
     if(edition==='basic'&&s.clipPath!=='none')forbidden.push('clipPath');
     if(edition==='basic'&&s.maskImage!=='none')forbidden.push('maskImage');
     if(edition!=='svg'&&/url\(/i.test(s.backgroundImage))forbidden.push('url image');
     if(s.filter!=='none')forbidden.push('filter');
     if(s.animationName!=='none')forbidden.push('animation');
   }
 }
 return {edition,theme:sample.dataset.theme,elements:all.length,forbidden:[...new Set(forbidden)],width:root.getBoundingClientRect().width,height:root.getBoundingClientRect().height};
}));
const isolated=await browser.newPage({viewport:{width:300,height:380},deviceScaleFactor:1});
for(const [edition,art,css] of entries){
 const unscoped=await isolated.evaluate(css=>{
   const sheet=new CSSStyleSheet();sheet.replaceSync(css);
   return [...sheet.cssRules].filter(rule=>rule.selectorText).flatMap(rule=>rule.selectorText.split(',')).map(s=>s.trim()).filter(s=>!s.startsWith('.r2-metal'));
 },css);
 assert.deepEqual(unscoped,[],`${edition} selector scope`);
 for(const [theme,markup] of Object.entries(art)){
  await isolated.setContent(`<style>html,body{margin:0;width:300px;height:380px;background:transparent}body>svg{display:block}${css}</style>${markup}`);
  const bytes=await isolated.screenshot({omitBackground:true});
  const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let brightEdgePixels=0,maxEdgeAlpha=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
   if(x!==0&&x!==info.width-1&&y!==0&&y!==info.height-1)continue;
   const a=data[(y*info.width+x)*4+3];maxEdgeAlpha=Math.max(a,maxEdgeAlpha);if(a>10)brightEdgePixels++;
  }
  Object.assign(result.find(r=>r.edition===edition&&r.theme===theme),{brightEdgePixels,maxEdgeAlpha});
 }
}
for(const [edition,art,css] of entries){
 for(const markup of Object.values(art)) {
  if(edition==='svg')assert(!/<(?:image|text|foreignObject|filter)\b/i.test(markup),'SVG forbidden content');
  else assert(!/(?:url\(|<svg\b|<canvas\b|<img\b|data:)/i.test(markup+css),`${edition} raster/url content`);
 }
 if(edition==='basic')assert(!/(?:clip-path|mask(?:-image)?\s*:|polygon\(|path\(|shape\(|border-shape)/i.test(css+Object.values(art).join('')),'Basic forbidden shape features');
}
assert.equal(errors.length,0,errors.join('\n'));
for(const r of result){assert.deepEqual(r.forbidden,[],`${r.edition}/${r.theme} forbidden`);if(r.edition!=='svg')assert(r.elements<=(r.edition==='css'?180:200),`${r.edition}/${r.theme} element budget`);assert.equal(r.width,300);assert.equal(r.height,380);}
await writeFile(new URL('./checks.json',import.meta.url),JSON.stringify({errors,cards:result},null,2));
console.log(JSON.stringify(result,null,2));
await browser.close();
