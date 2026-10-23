import {cssArt, cssStyles} from './css-art.mjs';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';

for (const [theme, markup] of Object.entries(cssArt)) {
  const count = [...markup.matchAll(/<(?:div|i)\b/g)].length;
  assert(count <= 180, `${theme}: ${count} elements`);
  assert.equal(markup.replace(/<[^>]*>/g,''), '', `${theme}: text content`);
  assert(!/url\(|<svg\b|<canvas\b|<img\b|data:|animation\s*:|filter\s*:/i.test(markup + cssStyles));
  assert(markup.startsWith(`<div class="r2-art r2-expressive r2-expressive-css ${theme} `));
  for(const match of markup.matchAll(/style="left:([\d.-]+)px;top:([\d.-]+)px;width:([\d.-]+)px;height:([\d.-]+)px;/g)) {
    const [,x,y,w,h] = match.map(Number);
    assert(x>=0 && y>=0 && x+w<=300.02 && y+h<=380.02, `${theme}: outside card (${x},${y},${w},${h})`);
  }
  if (!process.argv.includes('--html')) console.log(`${theme}: ${count} total elements (${count-1} art primitives), no text or forbidden assets, bounded to 300 × 380`);
}
assert([...cssStyles.matchAll(/([^{}]+)\{/g)].every(([,selector])=>selector.trim().startsWith('.r2-expressive')));

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#0b1018;color:white;font:12px sans-serif}
.sheet{display:grid;grid-template-columns:repeat(4,300px);gap:24px;padding:24px}
.slot{position:relative;width:300px;height:380px}
${cssStyles}
</style></head><body><div class="sheet">${Object.values(cssArt).map(art=>`<div class="slot">${art}</div>`).join('')}</div></body></html>`;
if (process.argv.includes('--html')) process.stdout.write(html);
else writeFileSync(new URL('./css-preview.html',import.meta.url),html);
