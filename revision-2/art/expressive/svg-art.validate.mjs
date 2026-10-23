import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { svgArt } from './svg-art.mjs';

// Validation and preview files are owned by the SVG implementation only.
assert.deepEqual(Object.keys(svgArt), ['rivera', 'drift', 'majestic', 'prism']);
assert.deepEqual(svgArt, (await import('./svg-art.mjs?determinism-check')).svgArt);
const idsSeen = new Set();
const counts = [];
const rendered = [];
for (const [theme, svg] of Object.entries(svgArt)) {
  assert.match(svg, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 300 380"/);
  assert.doesNotMatch(svg, /<(?:image|text|foreignObject|filter|animate|script)\b|@font-face|data:image|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i);
  assert.doesNotMatch(svg, /(?:NaN|Infinity|undefined)/);
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids) {
    assert.ok(id.startsWith(`${theme}-`), `ID lacks theme prefix: ${id}`);
    assert.ok(!idsSeen.has(id), `Duplicate ID: ${id}`);
    idsSeen.add(id);
  }
  for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(ref), `Missing ID: ${ref}`);
  const pixels = await sharp(Buffer.from(svg)).resize(600, 760).png().toBuffer();
  rendered.push(pixels);
  counts.push({ theme, bytes: Buffer.byteLength(svg), elements: (svg.match(/<[A-Za-z][^>]*>/g) || []).length, paths: (svg.match(/<path\b/g) || []).length, polygons: (svg.match(/<polygon\b/g) || []).length, ids: ids.length, filters: 0 });
}
await sharp({ create: { width: 1240, height: 1560, channels: 4, background: '#090d14' } })
  .composite(rendered.map((input, i) => ({ input, left: 10 + i % 2 * 620, top: 10 + Math.floor(i / 2) * 780 })))
  .png().toFile(new URL('./svg-art.preview.png', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
await writeFile(new URL('./svg-art.validation.json', import.meta.url), `${JSON.stringify({ passed: true, counts }, null, 2)}\n`);
console.log(JSON.stringify({ passed: true, counts }, null, 2));
