import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync,brotliCompressSync} from 'node:zlib';
import {zipSync,strToU8} from 'fflate';
import {cards} from '../css-art/cards.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex').slice(0,12);
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await mkdir('dist/hybrid/assets',{recursive:true});
const assets=new Map(),manifest=[];
async function asset(path){
 if(assets.has(path))return assets.get(path).url;
 const bytes=await readFile(path),base=path.split('/').at(-1),dot=base.lastIndexOf('.');
 const file=`${base.slice(0,dot)}.${hash(bytes)}${base.slice(dot)}`,url=`/hybrid/assets/${file}`;
 await writeFile('hybrid/assets/'+file,bytes);await writeFile('dist/hybrid/assets/'+file,bytes);
 assets.set(path,{file,url,bytes});manifest.push({url,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});return url;
}
let fonts=await readFile('assets/fonts.css','utf8');
for(const match of [...fonts.matchAll(/url\('([^']+)'\)/g)])fonts=fonts.replace(match[0],`url('${await asset('assets/'+match[1])}')`);
let flags=await readFile('assets/flags.css','utf8');
for(const match of [...flags.matchAll(/url\('([^']+)'\)/g)])flags=flags.replace(match[0],`url('data:image/svg+xml;base64,${(await readFile('assets/'+match[1])).toString('base64')}')`);
const gallery=[];
for(const [index,card] of cards.entries()){
 const [x,y,w,h]=card.box,labels=card.position==='GK'?['DIV','HAN','KIC','REF','SPE','POS']:['PAC','SHO','PAS','DRI','DEF','PHY'];
 const webp=await asset(`hybrid/assets/${card.theme}.webp`),webp2=await asset(`hybrid/assets/${card.theme}@2x.webp`),avif=await asset(`hybrid/assets/${card.theme}.avif`),avif2=await asset(`hybrid/assets/${card.theme}@2x.avif`);
 gallery.push(`<div class="card-slot" data-row="${index<5?'top':'bottom'}" style="--x:${x}px;--y:${y}px;--w:${w}px;--h:${h}px;--scale-x:${w/200};--scale-y:${h/320};--reference-ratio:${w/h}"><div class="card-motion"><button class="card card--${card.theme}" type="button" data-theme="${card.theme}" data-title="${escape(card.title)}" data-description="${escape(card.description)}" data-width="${w}" data-height="${h}" data-rating="${card.rating}" data-position="${card.position}" data-country="${card.country}" data-stats="${escape(JSON.stringify(card.stats))}" data-player-name="" aria-label="${escape(card.title)}, ${card.rating} ${card.position}. Customize card" aria-haspopup="dialog"><div class="card-art" aria-hidden="true"><picture><source type="image/avif" srcset="${avif} 200w,${avif2} 400w" sizes="200px"><img src="${webp}" srcset="${webp} 200w,${webp2} 400w" sizes="200px" data-high-res="${webp2}" width="200" height="320" decoding="async"${index===0?' fetchpriority="high"':''} alt=""></picture></div><div class="card-info" aria-hidden="true"><div class="card-rating"><strong>${card.rating}</strong><span>${card.position}</span></div><p class="card-name">${card.theme==='comic'?'PLAYER NAME!':'PLAYER NAME'}</p><div class="card-stats">${card.stats.map((value,i)=>`<div class="card-stat"><small>${labels[i]}</small><strong>${value}</strong></div>`).join('')}</div><div class="card-flag"><span class="flag flag--${card.country}" role="img" aria-label="${card.country}"></span></div></div></button></div></div>`);
}
let css=fonts+'\n'+flags+'\n'+await readFile('css-art/metadata.css','utf8')+'\n'+await readFile('hybrid-art/style.css','utf8');
try{css+='\n'+await readFile('hybrid-art/refinements.css','utf8')}catch(error){if(error.code!=='ENOENT')throw error;}
css+='\n.card-art picture,.card-art img{display:block;position:absolute;inset:0;width:200px;height:320px}.card.card .card-art{filter:none}';
const script=await readFile('hybrid/app.js','utf8')+'\n'+await readFile('hybrid/export.js','utf8');
let html=await readFile('hybrid-art/template.html','utf8');
// Keep the measured template intact; update navigation only inside its footer.
const footers=[...html.matchAll(/<footer class="collection-footer">[\s\S]*?<\/footer>/g)];
if(footers.length!==1)throw new Error('Expected exactly one hybrid collection footer.');
const footer=footers[0][0],v1Link='<a href="/" aria-label="Version 1">V1</a>';
if(footer.split(v1Link).length!==2)throw new Error('Expected exactly one V1 footer link.');
const currentFooter=footer.replace(v1Link,'<a href="/collections/">All collections</a>\n        <a href="/revision-2/svg/">Revision 2</a>\n        <a href="/original/" aria-label="Version 1">V1</a>');
html=html.slice(0,footers[0].index)+currentFooter+html.slice(footers[0].index+footer.length);
for(const [token,value] of [['<!--GALLERY-->',gallery.join('\n')],['<!--STYLES-->',`<style>${css}</style>`],['<!--SCRIPT-->',`<script>${script}</script>`]]){if(!html.includes(token))throw new Error('Missing template token '+token);html=html.replace(token,value);}
await writeFile('hybrid/index.html',html);
await writeFile('dist/hybrid/index.html',html);
await writeFile('dist/hybrid.html',html);
await writeFile('dist/hybrid.html.gz',gzipSync(html));await writeFile('dist/hybrid.html.br',brotliCompressSync(html));
await writeFile('dist/hybrid-assets.json',JSON.stringify(manifest,null,2));
let portableHTML=html.replaceAll('/hybrid/assets/','assets/').replaceAll('href="/hybrid/"','href="./"').replaceAll('href="/reference"','href="reference.png"');
const deploymentDomain=process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
const configuredOrigin=process.env.CARD_SITE_ORIGIN || (deploymentDomain ? `https://${deploymentDomain}` : 'http://localhost:4173');
const siteURL=new URL(configuredOrigin);
if(!['http:','https:'].includes(siteURL.protocol) || siteURL.username || siteURL.password || siteURL.pathname!=='/' || siteURL.search || siteURL.hash)throw new Error('CARD_SITE_ORIGIN must be an HTTP(S) origin without credentials, a path, query or fragment.');
portableHTML=portableHTML.replace(/href="\/(?!\/)([^"]*)"/g,(_,route)=>`href="${escape(siteURL.origin+'/'+route)}"`);
const sourceFiles={'index.html':strToU8(portableHTML),'reference.png':new Uint8Array(await readFile('assets/reference.png'))};
for(const item of assets.values())sourceFiles['assets/'+item.file]=new Uint8Array(item.bytes);
for(const file of ['Oswald-LICENSE.txt','Barlow-Condensed-LICENSE.txt'])sourceFiles['licenses/'+file]=new Uint8Array(await readFile('assets/'+file));
sourceFiles['licenses/flag-sources.md']=new Uint8Array(await readFile('assets/flags/SOURCES.md'));
sourceFiles['README.txt']=strToU8('The Twelve — Studio edition\nRun: node serve.mjs\nOpen: http://localhost:5180\n\nAll artwork, fonts, flags, styles and scripts are included. Card edits stay in this browser. PNG exports are rendered locally. Original artwork supplied as a reference; cleaned image assets were prepared with imagegen. This is a hybrid implementation, not a CSS-only reproduction. See /compare/ on the hosted site for measured performance.\n');
sourceFiles['serve.mjs']=strToU8(`import http from 'node:http';import{readFile}from'node:fs/promises';import{resolve,extname,sep}from'node:path';const root=resolve('.');http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const f=resolve(root,'.'+(p==='/'?'/index.html':p));if(!f.startsWith(root+sep))throw Error();const b=await readFile(f);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'})[extname(f)]||'application/octet-stream'}).end(b)}catch{res.writeHead(404).end('Not found')}}).listen(5180,'127.0.0.1',()=>console.log('Open http://localhost:5180'));`);
// ZIP's DOS timestamps use local date fields. A fixed local calendar date keeps
// this download identical across builds, machines and time zones.
const zipEntries=Object.fromEntries(Object.entries(sourceFiles).map(([name,bytes])=>[name,[bytes,{mtime:new Date(1980,0,1)}]]));
await writeFile('dist/hybrid-source.zip',zipSync(zipEntries,{level:6}));
const audit={cards:cards.length,artworkImages:12,htmlBytes:Buffer.byteLength(html),brotliBytes:brotliCompressSync(html).length,assets:manifest.length,assetBytes:manifest.reduce((n,a)=>n+a.bytes,0),metadataEditable:true,renderer:'raster artwork + HTML metadata + SVG flags + CSS interactions'};
await writeFile('dist/hybrid-audit.json',JSON.stringify(audit,null,2));console.log(JSON.stringify(audit));
