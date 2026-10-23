// Private, deterministic visual inspection. Does not use the shared browser or run benchmarks.
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {cssArt,cssStyles} from './css.mjs';
const variants=[['CSS',cssArt,cssStyles]];
try { const m=await import('./svg.mjs'); variants.unshift(['SVG',m.svgArt,'']); } catch(e) { if(e.code!=='ERR_MODULE_NOT_FOUND') throw e; }
try { const m=await import('./basic.mjs'); variants.push(['BASIC',m.basicArt,m.basicStyles]); } catch(e) { if(e.code!=='ERR_MODULE_NOT_FOUND') throw e; }
const meta={frost:['92','CAM',[88,90,94,93,60,82]],blaze:['93','LW',[97,91,86,95,42,78]],volt:['91','RW',[96,89,87,93,51,76]],silvah:['90','CDM',[78,71,88,85,92,89]]};
const labels=['PAC','SHO','PAS','DRI','DEF','PHY'];
const overlay=k=>`<div class="overlay"><strong class="rating">${meta[k][0]}</strong><span class="position">${meta[k][1]}</span><strong class="name">${k.toUpperCase()}</strong><i class="flag ${k}"></i><div class="stats">${meta[k][2].map((x,i)=>`<span><small>${labels[i]}</small><b>${x}</b></span>`).join('')}</div></div>`;
const style=`body{margin:0;background:#0b1014;color:#b4bfc9;font-family:Arial,sans-serif}h1{font:500 14px monospace;margin:20px 28px 2px}section{display:flex;gap:12px;padding:10px 25px 20px}article{position:relative;width:300px;height:380px;flex:none;background:radial-gradient(ellipse at 50% 60%,#1a242d44,transparent 70%)}svg{width:300px;height:380px;display:block}.overlay{position:absolute;inset:0;color:#e9f5f9;text-shadow:0 2px 4px #000}.rating{position:absolute;left:32px;top:47px;font-size:46px;line-height:1;font-stretch:condensed;letter-spacing:-2px}.position{position:absolute;left:34px;top:96px;font-size:24px;font-weight:bold}.name{position:absolute;left:40px;right:40px;top:237px;line-height:28px;text-align:center;font-size:24px;letter-spacing:3px}.stats{position:absolute;top:316px;left:29px;right:27px;display:flex;justify-content:space-between;text-align:center}.stats span{width:34px}.stats small{font-size:10px;display:block;height:12px;line-height:12px}.stats b{display:block;margin-top:6px;font-size:20px;line-height:23px}.flag{position:absolute;left:91px;top:276px;width:38px;height:25px;box-shadow:0 0 0 1px #fff4}.flag.frost{background:linear-gradient(90deg,transparent 0 10px,#fff 10px 13px,#15306e 13px 18px,#fff 18px 21px,transparent 21px),linear-gradient(0deg,#bc2334 0 9px,#fff 9px 12px,#15306e 12px 17px,#fff 17px 20px,#bc2334 20px)}.flag.blaze{background:linear-gradient(#b81020 0 25%,#e6bb18 25% 75%,#b81020 75%)}.flag.volt{background:radial-gradient(circle,#b52c44 0 7px,transparent 7.5px),#f6f5ec}.flag.silvah{background:linear-gradient(90deg,#077e4a 0 40%,#cf1623 40%)}.flag.silvah:after{content:'';position:absolute;left:11px;top:7px;width:9px;height:11px;border:1px solid #eed467;border-radius:40%;background:#b62d24}.art-only .overlay{display:none}`;
const html=`<!doctype html><html><meta charset="utf-8"><title>Energy · private revision 2 inspection</title><style>${style}${variants.map(x=>x[2]).join('\n')}</style><body>${variants.map(([title,art])=>`<h1>${title} · LIVE OVERLAY CHECK</h1><section>${Object.keys(meta).map(k=>`<article data-technique="${title}" data-theme="${k}">${art[k]}${overlay(k)}</article>`).join('')}</section>`).join('')}<h1>CSS · ART ONLY</h1><section class="art-only">${Object.keys(meta).map(k=>`<article>${cssArt[k]}</article>`).join('')}</section></body></html>`;
const root=new URL('./',import.meta.url);
await writeFile(new URL('preview.html',root),html);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1286,height:480},deviceScaleFactor:1.5});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(new URL('preview.html',root).href);
await page.screenshot({path:fileURLToPath(new URL('preview.png',root)),fullPage:true});
for(const edition of variants.map(v=>v[0])) {
  const articles=page.locator(`article[data-technique="${edition}"]`);
  for(let i=0;i<4;i++) await articles.nth(i).screenshot({path:fileURLToPath(new URL(`preview-${edition.toLowerCase()}-${Object.keys(meta)[i]}.png`,root))});
}
console.log(JSON.stringify({editions:variants.map(v=>v[0]),errors,counts:await page.locator('article[data-technique]').evaluateAll(els=>els.map(el=>({technique:el.dataset.technique,theme:el.dataset.theme,count:el.firstElementChild.querySelectorAll('*').length+1})))}));
await browser.close();
