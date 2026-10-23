// Artwork-only shared-field preview. No app build, server or benchmark run.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium,webkit} from 'playwright';
import sharp from 'sharp';
import {cards} from '../../cards.mjs';
import {flagsFor} from '../../flags.mjs';
import {svgArt,cssArt,basicArt,cssStyles,basicStyles} from './index.mjs';
const themes=['rivera','drift','majestic','prism'],editions={svg:svgArt,css:cssArt,basic:basicArt};
const out=new URL('../../evidence/fidelity/expressive/',import.meta.url);await mkdir(out,{recursive:true});
const target=n=>fileURLToPath(new URL(n,out));
const shared=await readFile(new URL('../../style.css',import.meta.url),'utf8');
let fonts=await readFile(new URL('../../../assets/fonts.css',import.meta.url),'utf8');
fonts=[...fonts.matchAll(/@font-face\s*\{[^}]+\}/g)].map(m=>m[0]).filter(rule=>rule.includes("'Oswald'")?/font-weight: (400|500|600);/.test(rule):/font-weight: (400|600);/.test(rule)).join('\n');
for(const match of [...fonts.matchAll(/url\('([^']+)'\)/g)])fonts=fonts.replace(match[0],`url('data:font/woff2;base64,${(await readFile(new URL('../../../assets/'+match[1],import.meta.url))).toString('base64')}')`);
const flags=Object.fromEntries(await Promise.all(Object.keys(editions).map(async k=>[k,await flagsFor(k)])));
const fields=(theme,edition)=>{const c=cards.find(c=>c.theme===theme);return `<div class="card-info"><div class="card-rating"><strong>${c.rating}</strong><span>${c.position}</span></div><p class="card-name">${c.name}</p><div class="card-flag">${flags[edition].drawings[c.country]}</div><div class="card-stats">${c.stats.map((v,i)=>`<div class="card-stat"><small>${['PAC','SHO','PAS','DRI','DEF','PHY'][i]}</small><strong>${v}</strong></div>`).join('')}</div></div>`;};
const card=(theme,edition,size=300)=>{const c=cards.find(c=>c.theme===theme);return `<div class="capture" data-theme="${theme}" data-edition="${edition}" style="width:${size}px;height:${size*380/300}px;position:relative"><div class="card card--${theme}" style="--card-color:${c.color};--card-scale:${size/300}"><div class="card-art">${editions[edition][theme]}</div>${fields(theme,edition)}</div></div>`;};
const scopedFlags=Object.entries(flags).map(([e,f])=>f.styles.replace(/([^{}]+)\{/g,(_s,selectors)=>selectors.split(',').map(s=>`.capture[data-edition="${e}"] ${s.trim()}`).join(',')+'{')).join('\n');
const style=`${fonts}\n${shared}\n${cssStyles}\n${basicStyles}\n${scopedFlags}\nbody{background:#0a0c0e;color:#d7dce5}h2{font:500 14px sans-serif;letter-spacing:2px;margin:0 0 12px}main{padding:24px;width:max-content}.row{display:flex;gap:20px;margin-bottom:28px}.capture{flex:none}.card{cursor:default}.card-shell:hover{transform:none}`;
const html=body=>`<!doctype html><meta charset="utf-8"><style>${style}</style><body data-edition="review">${body}</body>`;
const gallery=size=>html(`<main>${Object.keys(editions).map(e=>`<section><h2>${e.toUpperCase()} · CURRENT SHARED FIELDS</h2><div class="row">${themes.map(t=>card(t,e,size)).join('')}</div></section>`).join('')}</main>`);
const report={sharedStyle:'revision-2/style.css',checks:[],counts:{},browserErrors:[],fieldBounds:{},nativePathSupport:null};
const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1400,height:1500},deviceScaleFactor:1});page.on('pageerror',e=>report.browserErrors.push(e.message));
 for(const size of [300,450]){await page.setContent(gallery(size));await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:target(`gallery-${size}.png`),fullPage:true});if(size===300)await writeFile(target('preview.html'),gallery(size));
  for(const e of Object.keys(editions))for(const t of themes){await page.locator(`.capture[data-theme="${t}"][data-edition="${e}"]`).screenshot({path:target(`${e}-${t}-${size}.png`)});}
 }
 report.nativePathSupport=await page.evaluate(()=>CSS.supports('clip-path',"path('M0 0Q10 10 20 0L20 20L0 20Z')"));
 await page.setContent(gallery(300));await page.evaluate(()=>document.fonts.ready);
 const state=await page.evaluate(()=>{const data={counts:{},fieldBounds:{}};for(const el of document.querySelectorAll('.capture')){const k=el.dataset.edition+'/'+el.dataset.theme,art=el.querySelector('.card-art'),origin=el.getBoundingClientRect();data.counts[k]=art.querySelectorAll('*').length;data.fieldBounds[k]=Object.fromEntries(['card-rating','card-name','card-flag','card-stats'].map(c=>{const r=el.querySelector('.'+c).getBoundingClientRect();return[c,{x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height}];}));}return data;});Object.assign(report,state);
 report.checks.push({label:'300×380 shared field origins',pass:Object.values(state.fieldBounds).every(v=>v['card-rating'].x===32&&v['card-rating'].y===43&&v['card-name'].y===233&&v['card-flag'].y===269)});
 report.checks.push({label:'SVG ≤350 / CSS and Basic ≤220 elements',pass:Object.entries(report.counts).every(([key,count])=>count<=(key.startsWith('svg')?350:220))});
 report.checks.push({label:'Chromium native CSS path() support',pass:report.nativePathSupport});
 const originalRegions={rivera:[84,356,293,352],drift:[75,704,302,355],majestic:[410,705,298,355],prism:[1068,704,318,355]};
 for(const t of themes){const [left,top,width,height]=originalRegions[t];const original=await sharp(await readFile(new URL('../../assets/reference.png',import.meta.url))).extract({left,top,width,height}).resize(450,570,{fit:'fill'}).png().toBuffer();await writeFile(target('original-'+t+'.png'),original);
  for(const e of Object.keys(editions)){
   // Historical captures are optional local evidence, absent from a clean clone.
   let baseline;try{baseline=await readFile(new URL(`../../evidence/fidelity/baseline/${e}-${t}.png`,import.meta.url));}catch(error){if(error.code==='ENOENT')continue;throw error;}
   const before=await sharp(baseline).resize(450,570,{fit:'fill'}).png().toBuffer();const after=await readFile(target(`${e}-${t}-450.png`));const title=Buffer.from(`<svg width="1390" height="28"><style>text{font:13px sans-serif;fill:#cbd4e4}</style><text x="10" y="19">ORIGINAL REFERENCE</text><text x="480" y="19">BEFORE · ${e.toUpperCase()}</text><text x="950" y="19">AFTER · ${e.toUpperCase()}</text></svg>`);await sharp({create:{width:1390,height:608,channels:4,background:'#0a0c0e'}}).composite([{input:title,left:0,top:0},{input:original,left:0,top:34},{input:before,left:470,top:34},{input:after,left:940,top:34}]).png().toFile(target(`comparison-${t}-${e}.png`));}
 }
}finally{await browser.close();}
let webkitBrowser;
try{webkitBrowser=await webkit.launch({headless:true});const p=await webkitBrowser.newPage({viewport:{width:1400,height:1500}});await p.setContent(gallery(300));await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:target('webkit-gallery-300.png'),fullPage:true});report.webkitNativePathSupport=await p.evaluate(()=>CSS.supports('clip-path',"path('M0 0Q10 10 20 0L20 20L0 20Z')"));report.checks.push({label:'WebKit native CSS path() support',pass:report.webkitNativePathSupport});}catch(e){report.webkitUnavailable=e.message;}finally{await webkitBrowser?.close();}
report.checks.push({label:'No browser errors',pass:report.browserErrors.length===0});await writeFile(target('fidelity-checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
if(report.checks.some(c=>!c.pass))process.exitCode=1;
