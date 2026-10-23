import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync,brotliCompressSync} from 'node:zlib';
import {zipSync,strToU8} from 'fflate';
import {cards,editions,countries,escape} from './cards.mjs';
import {flagsFor} from './flags.mjs';
import {portableHTML} from './portable.mjs';
import {crest} from './crests.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const output='dist/revision-2';
await mkdir(`${output}/assets`,{recursive:true});await mkdir(`${output}/source`,{recursive:true});
const assets=new Map();
async function asset(path){
 if(assets.has(path))return assets.get(path).url;
 const bytes=await readFile(path),name=path.split('/').at(-1),dot=name.lastIndexOf('.'),sha256=hash(bytes);
 const file=name.slice(0,dot)+'.'+sha256.slice(0,12)+name.slice(dot),url='/revision-2/assets/'+file;
 await writeFile(`${output}/assets/${file}`,bytes);assets.set(path,{url,bytes,sha256,file});return url;
}
let fonts=await readFile('assets/fonts.css','utf8');
fonts=[...fonts.matchAll(/@font-face\s*\{[^}]+\}/g)].map(m=>m[0]).filter(rule=>rule.includes("'Oswald'")?/font-weight: (400|500|600);/.test(rule):/font-weight: (400|600);/.test(rule)).join('\n');
for(const match of [...fonts.matchAll(/url\('([^']+)'\)/g)])fonts=fonts.replace(match[0],`url('data:font/woff2;base64,${(await readFile('assets/'+match[1])).toString('base64')}')`);
const style=await readFile('revision-2/style.css','utf8'),app=await readFile('revision-2/app.js','utf8');
let groups=[];
if(!process.argv.includes('--only-hybrid'))groups=await Promise.all(['metal','energy','expressive'].map(group=>import(`./art/${group}/index.mjs`)));
const only=process.argv.includes('--only-hybrid')?editions.filter(e=>e.id==='hybrid'):editions;
const audit=[];
for(const edition of only){
 const flags=await flagsFor(edition.id);
 let art={},artStyles='';
 if(edition.id!=='hybrid'){
  const key=edition.id==='svg'?'svgArt':edition.id==='css'?'cssArt':'basicArt';
  art=Object.assign({},...groups.map(group=>group[key]));
  artStyles=edition.id==='svg'?'':groups.map(group=>group[edition.id==='css'?'cssStyles':'basicStyles']).join('\n');
 }
 const gallery=[];
 for(const card of cards){
  let illustration=art[card.theme];
  if(edition.id==='hybrid'){
   const urls={};for(const suffix of ['','@2x'])for(const format of ['avif','webp'])urls[suffix+format]=await asset(`revision-2/assets/frames/${card.theme}${suffix}.${format}`);
   const sizes='(max-width:760px) calc((100vw - 34px)/2), (max-width:1308px) calc((100vw - 108px)/4), 300px';
   illustration=`<picture><source type="image/avif" srcset="${urls.avif} 300w, ${urls['@2xavif']} 600w" sizes="${sizes}"><img src="${urls.webp}" srcset="${urls.webp} 300w, ${urls['@2xwebp']} 600w" sizes="${sizes}" data-high-res="${urls['@2xwebp']}" alt="" width="300" height="380" decoding="async"${card.index===0?' fetchpriority="high"':''}></picture>`;
  }
  if(typeof illustration!=='string'||!illustration.trim())throw Error(`Missing ${edition.id} artwork: ${card.theme}`);
  gallery.push(`<article class="card-slot"><div class="card-shell"><button class="card card--${card.theme}" data-theme="${card.theme}" data-width="300" data-height="380" type="button" aria-haspopup="dialog" aria-label="${card.name}, ${card.rating} ${card.position}. Customize card" style="--card-color:${card.color}"><div class="card-art" aria-hidden="true">${illustration}</div><div class="card-info" aria-hidden="true"><div class="card-rating"><strong>${card.rating}</strong><span>${card.position}</span></div><p class="card-name">${card.name}</p><div class="card-flag">${flags.drawings[card.country]}</div>${edition.id==='hybrid'?crest(card.theme,card.color):''}<div class="card-stats">${card.stats.map((value,i)=>`<div class="card-stat"><small>${['PAC','SHO','PAS','DRI','DEF','PHY'][i]}</small><strong>${value}</strong></div>`).join('')}</div></div></button></div><div class="card-caption"><span>${String(card.index+1).padStart(2,'0')} &nbsp; ${card.name}</span><span class="customize">Customize ↗</span></div></article>`);
 }
 const renderNav=editions.map(e=>`<a href="/revision-2/${e.id}/"${e.id===edition.id?' aria-current="page"':''}>${e.label}</a>`).join('');
 const config=JSON.stringify({cards,edition:edition.id,flags:flags.drawings}).replaceAll('<','\\u003c');
 const hybrid=edition.id==='hybrid';
 let html=`<!doctype html><html lang="en"><head><meta charset="utf-8">${['svg','hybrid'].includes(edition.id)?'<link rel="icon" href="data:,">':''}<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0a0c0e"><meta name="description" content="Twelve new football card designs. Revision 2, ${edition.label}. Explore, customize and compare all four rendering approaches."><title>The Twelve — Revision 2 · ${edition.label}</title><style>${fonts}\n${style}\n${flags.styles}\n${artStyles}</style></head><body data-edition="${edition.id}" data-revision="2"><a class="skip" href="#gallery">Skip to cards</a><header class="site-header"><a class="wordmark" href="/collections/">THE <span>TWELVE</span></a><nav class="revision-nav" aria-label="Collections"><a class="hub-link" href="/collections/">All collections ↗</a><a href="/original/">Revision 1</a><a href="/revision-2/${edition.id}/" aria-current="page">Revision 2</a></nav></header><main class="page-shell"><div class="collection-intro"><div><p class="eyebrow">Collection 02 · Twelve new identities</p><h1>Elements of the game<span>.</span></h1><p class="intro-copy">${edition.description}</p></div><nav class="edition-nav" aria-label="Rendering approach">${renderNav}</nav></div><div class="collection-tools"><span class="collection-count">12 CARDS / ${edition.short.toUpperCase()}</span><nav aria-label="Collection resources"><button type="button" class="layout-toggle" id="layout-toggle" aria-pressed="false" aria-controls="gallery">Larger cards</button><a href="/revision-2/reference" target="_blank" rel="noopener">Reference ↗</a><a href="/revision-2/benchmarks/">Benchmarks</a><a href="/revision-2/source/${edition.id}" download>Source ↓</a></nav></div><section class="gallery" id="gallery" aria-label="Revision 2 card collection">${gallery.join('\n')}</section><footer class="collection-footer"><p>One reference. Four approaches. Each collection keeps its own visual language and technical constraints. Select a card to make it yours.</p><nav class="footer-links" aria-label="More collections"><a href="/collections/">All collections</a><a href="/original/">Revision 1</a><a href="/revision-2/benchmarks/">Compare performance</a></nav></footer></main>
<dialog class="card-dialog" id="card-dialog" aria-labelledby="detail-title" aria-describedby="detail-description"><div class="dialog-top"><div><h2 id="detail-title">Customize card</h2><p id="detail-description"></p></div><button class="icon-button" id="close-dialog" type="button" aria-label="Close editor">×</button></div><div class="dialog-body"><div class="detail-view"><div class="detail-stage" id="detail-stage"></div><nav class="detail-pagination" aria-label="Browse cards"><button class="icon-button" id="previous-card" aria-label="Previous card" type="button">←</button><span id="detail-position">01 / 12</span><button class="icon-button" id="next-card" aria-label="Next card" type="button">→</button></nav></div><form class="editor" id="card-editor"><p class="eyebrow">Make it yours · ${edition.label}</p><label class="field"><span>Player name</span><input id="player-name" name="name" maxlength="18" autocomplete="off" spellcheck="false"></label><div class="field-row"><label class="field"><span>Rating</span><input id="player-rating" name="rating" type="number" min="1" max="99" step="1" inputmode="numeric" required></label><label class="field"><span>Position</span><select id="player-position" name="position">${['GK','CB','RB','LB','CDM','CM','CAM','RM','LM','RW','LW','CF','ST'].map(p=>`<option>${p}</option>`).join('')}</select></label></div><label class="field"><span>Country</span><select id="player-country" name="country">${Object.entries(countries).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><fieldset><legend>Player statistics</legend><div class="stat-fields">${['PAC','SHO','PAS','DRI','DEF','PHY'].map((label,i)=>`<label class="field"><span>${label}</span><input data-stat="${i}" name="stat${i}" type="number" min="1" max="99" step="1" inputmode="numeric" required></label>`).join('')}</div></fieldset><div class="editor-actions">${hybrid?'<button class="primary-button" id="export-card" type="button">Download PNG ↓</button>':`<a class="primary-button" href="/revision-2/source/${edition.id}" download>Download source ↓</a>`}<button class="text-button" id="reset-card" type="button">Reset card</button></div><div class="reset-confirm" id="reset-confirm" hidden><p>Restore this card’s original name and stats?</p><button class="text-button" id="cancel-reset" type="button">Keep edits</button> <button class="primary-button" id="confirm-reset" type="button">Restore original</button></div><p class="status" id="editor-feedback" aria-live="polite"></p>${hybrid?'<p class="status" id="export-status" aria-live="polite"></p><p class="status">1280px PNG export. Source artwork is approximately 550 × 700px per card; exporting larger does not add detail.</p>':''}</form></div></dialog><script id="collection-data" type="application/json">${config}</script><script>${app}${hybrid?'\n'+await readFile('revision-2/export.js','utf8'):''}</script></body></html>`;
 await mkdir(`${output}/${edition.id}`,{recursive:true});
 await writeFile(`${output}/${edition.id}/index.html`,html);
 await writeFile(`${output}/${edition.id}/index.html.gz`,gzipSync(html));await writeFile(`${output}/${edition.id}/index.html.br`,brotliCompressSync(html));
 if(!hybrid)await writeFile(`${output}/source/${edition.id}`,html);
 else{
  const portable=portableHTML(html);
  const entries={'index.html':strToU8(portable),'reference.png':new Uint8Array(await readFile('revision-2/assets/reference.png')),'README.txt':strToU8('The Twelve · Revision 2 hybrid\nRun node serve.mjs and open http://localhost:5182. All artwork, fonts and flags are local. Collection links refer to the hosted site. Original reference supplied by the user; artwork adapted with imagegen. PNG export upscales the supplied source artwork.\n'),'serve.mjs':strToU8(`import http from 'node:http';import{readFile}from'node:fs/promises';import{resolve,sep,extname}from'node:path';const root=resolve('.');http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),f=resolve(root,'.'+(p==='/'?'/index.html':p));if(!f.startsWith(root+sep))throw Error();const b=await readFile(f);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.avif':'image/avif','.webp':'image/webp','.png':'image/png'})[extname(f)]||'application/octet-stream'}).end(b)}catch{res.writeHead(404).end('Not found')}}).listen(5182,'127.0.0.1',()=>console.log('Open http://localhost:5182'));`)};
  for(const {file,bytes} of assets.values())entries['assets/'+file]=new Uint8Array(bytes);
  for(const file of ['Oswald-LICENSE.txt','Barlow-Condensed-LICENSE.txt'])entries['licenses/'+file]=new Uint8Array(await readFile('assets/'+file));
  await writeFile(`${output}/source/hybrid`,zipSync(Object.fromEntries(Object.entries(entries).map(([name,data])=>[name,[data,{mtime:new Date(1980,0,1)}]])),{level:6}));
 }
 audit.push({edition:edition.id,sha256:hash(html),htmlBytes:Buffer.byteLength(html),brotliBytes:brotliCompressSync(html).length,artElements:gallery.map(markup=>(markup.split('class="card-art"')[1]?.split('class="card-info"')[0].match(/<[A-Za-z][\w:-]*(?:\s|>)/g)||[]).length)});
}
await copyFile('revision-2/assets/reference.png',`${output}/reference`);
await asset('revision-2/assets/reference-preview.webp');
await writeFile(`${output}/assets-manifest.json`,JSON.stringify([...assets.values()].map(({url,bytes,sha256})=>({url,bytes:bytes.length,sha256})),null,2)+'\n');
await writeFile(`${output}/audit.json`,JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit,null,2));
