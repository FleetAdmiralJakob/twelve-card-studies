import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { cards } from '../css-art/cards.mjs';
import { basicPaperThemes } from './paper.mjs';
import { basicElectricThemes } from './electric.mjs';
import { basicArtisticThemes } from './artistic.mjs';
import { flagMarkup } from './flags.mjs';

const themes = {...basicPaperThemes,...basicElectricThemes,...basicArtisticThemes};
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const styles = ['flags','paper','electric','artistic','edition'];
const css = (await readFile('css-art/base.css','utf8')).replace(/clip:\s*rect\([^)]*\);/g,'opacity:0;')+'\n'+await readFile('css-art/metadata.css','utf8')+'\n'+(await Promise.all(styles.map(name=>readFile(`basic-art/${name}.css`,'utf8')))).join('\n')+'\n'+await readFile('assets/editions.css','utf8');
if (/clip-path|(?:^|[;{\s])(?:-webkit-)?mask(?:-[a-z]+)?\s*:|(?:polygon|path|shape|url|paint)\s*\(|data:image/i.test(css)) throw new Error('Basic CSS audit failed: forbidden drawing primitive');
const gallery = cards.map((card,index) => {
  const [x,y,w,h] = card.box;
  const labels = card.position==='GK' ? ['DIV','HAN','KIC','REF','SPE','POS'] : ['PAC','SHO','PAS','DRI','DEF','PHY'];
  const art = themes[card.theme].art;
  if (/<(?:svg|img|canvas|image|object|embed|iframe)\b/i.test(art)) throw new Error(`Non-CSS artwork in ${card.theme}`);
  return `<div class="card-slot" data-row="${index<5?'top':'bottom'}" style="--x:${x}px;--y:${y}px;--w:${w}px;--h:${h}px;--scale-x:${w/200};--scale-y:${h/320}"><div class="card-motion"><button class="card card--${card.theme}" type="button" data-theme="${card.theme}" data-title="${escape(card.title)}" data-description="${escape(card.description)}" aria-label="${escape(card.title)}, ${card.rating} ${card.position}. View card" aria-haspopup="dialog"><div class="card-art" aria-hidden="true">${art}</div><div class="card-info" aria-hidden="true"><div class="card-rating"><strong>${card.rating}</strong><span>${card.position}</span></div><div class="card-emblem"><i class="basic-shield"></i></div><p class="card-name">${card.theme === 'comic' ? 'PLAYER NAME!' : 'PLAYER NAME'}</p><div class="card-stats">${card.stats.map((v,i)=>`<div class="card-stat"><small>${labels[i]}</small><strong>${v}</strong></div>`).join('')}</div><div class="card-flag">${flagMarkup(card.country,card.theme)}</div></div></button></div></div>`;
}).join('\n');
if (/clip-path|(?:^|[;{\s])(?:-webkit-)?mask(?:-[a-z]+)?\s*:|(?:polygon|path|shape|url|paint)\s*\(|data:image/i.test(gallery)) throw new Error('Basic HTML audit failed: forbidden inline artwork');
const artElements = cards.reduce((sum,c) => sum+(themes[c.theme].art.match(/<[a-z][^>]*>/gi)||[]).length,0);
let html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0e1113"><title>The Twelve — CSS Primitives Edition</title><meta name="description" content="Twelve football card illustrations made from CSS boxes, rounded corners, gradients and borders. No SVG, images, masks or polygon paths."><link rel="stylesheet" href="../assets/fonts.css"><style>${css}</style></head><body>
<main aria-label="The twelve football card designs, CSS primitives edition"><h1 class="sr-only">The Twelve — CSS Primitives Edition</h1><section class="collection" aria-label="Twelve collectible player cards"><div class="scene" id="gallery">${gallery}</div></section><footer class="collection-footer" style="height:auto;min-height:36px;flex-wrap:wrap;row-gap:0"><span class="collection-count">THE TWELVE <span>/</span> CSS PRIMITIVES</span><nav class="edition-nav" aria-label="Website edition" style="flex-wrap:wrap;row-gap:0;white-space:nowrap"><a href="/collections/">All collections</a><a href="/revision-2/svg/">Revision 2</a><a href="/original/">V1 · SVG</a><a href="/css/">V2 · Polygone</a><span aria-current="page">V3 · Grundformen</span><a href="/hybrid/">V4 · Hybrid</a><a href="/compare/">Benchmarks</a></nav><button class="text-button" id="show-proof" type="button">About the artwork ↗</button></footer></main>
<dialog id="card-dialog" class="card-dialog" aria-labelledby="detail-title"><button type="button" class="close-button" data-close aria-label="Close card details">×</button><div class="detail-layout"><div class="detail-artwork" id="detail-artwork"></div><div class="detail-copy"><p class="eyebrow" id="detail-number"></p><h2 id="detail-title"></h2><p class="detail-description" id="detail-description"></p><div class="detail-rule"></div><label class="field-label" for="player-name">PLAYER NAME</label><input id="player-name" name="player-name" type="text" maxlength="18" autocomplete="off" spellcheck="false" placeholder="PLAYER NAME"><p class="field-help">Make this edition yours.</p><div class="detail-navigation"><button type="button" id="previous-card" class="nav-button" aria-label="Previous card">←</button><span id="detail-position"></span><button type="button" id="next-card" class="nav-button" aria-label="Next card">→</button></div><p class="keyboard-hint">← → to browse <span>·</span> ESC to close</p></div></div></dialog>
<dialog id="proof-dialog" class="proof-dialog" aria-labelledby="proof-title"><button type="button" class="close-button" data-close aria-label="Close artwork information">×</button><h2 id="proof-title">CSS ohne Pfade</h2><p>Diese Edition zeichnet Karten und Flaggen mit CSS-Flächen, Rundungen, Verläufen, Rahmen und Schatten. Keine SVGs, Canvas, Bilder, Clip-Pfade, Polygone, Masken oder nachgezeichneten Punktlisten.</p><div class="proof-data"><div><strong>12</strong><span>individual card designs</span></div><div><strong>0</strong><span>SVG, Bilder oder Formpfade</span></div><div><strong>${artElements.toLocaleString('en-US')}</strong><span>illustration elements across all cards</span></div><div><strong>Static</strong><span>artwork; no animation loop</span></div></div><p>Die Illustrationen stehen statisch im HTML. JavaScript bedient Vergrößerung, Namen und Layout. Normale CSS-Grundformen bleiben erlaubt; das ist keine Behauptung, dass CSS mathematisch frei von Geometrie wäre. Texturen sind prozedural und keine kodierte Kopie der Vorlage.</p><p><a href="/reference" target="_blank" rel="noopener">Open the original reference ↗</a></p></dialog>
<script src="app.js" defer></script></body></html>`;
await mkdir('basic',{recursive:true});
await mkdir('dist',{recursive:true});
await writeFile('basic/index.html',html);
let fonts = await readFile('assets/fonts.css','utf8');
for (const match of [...fonts.matchAll(/url\('([^']+)'\)/g)]) {
  const bytes = await readFile(`assets/${match[1]}`);
  fonts = fonts.replace(match[0],`url('data:font/woff2;base64,${bytes.toString('base64')}')`);
}
html=html.replace('<link rel="stylesheet" href="../assets/fonts.css">',`<style>${fonts}</style>`);
html=html.replace('<script src="app.js" defer></script>',`<script>${await readFile('basic/app.js','utf8')}</script>`);
if (/<(?:svg|img|canvas|image|object|embed|iframe)\b|data:image|createElement\(['"](?:svg|canvas|img)/i.test(html)) throw new Error('Final CSS primitives edition contains a forbidden image renderer.');
await writeFile('dist/basic.html',html);
await writeFile('dist/basic.html.br',brotliCompressSync(html));
await writeFile('dist/basic.html.gz',gzipSync(html));
const report = {cards:cards.length,artworkElements:artElements,svg:0,canvas:0,imageArtwork:0,clipPaths:0,masks:0,bitmapEncoding:false,artworkCssBytes:Buffer.byteLength(css),htmlBytes:Buffer.byteLength(html),brotliBytes:brotliCompressSync(html).length};
await writeFile('dist/basic-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));

