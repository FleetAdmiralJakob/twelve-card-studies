import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {flagExportEdits} from './flag-export.mjs';

// Explicit, reversible delta from the archived hybrid implementation. Keep
// historical benchmark inputs intact; both build and history use this recipe.
const marker = '/* HYBRID_METADATA_POLISH_2026_10_23 */';
const css = `\n${marker}\n${readFileSync(new URL('./polish.css', import.meta.url), 'utf8')}\n/* END_HYBRID_METADATA_POLISH */\n`;

function replaceExact(html, before, after, label) {
  const candidates = before.includes('\n')
    ? [[before, after], [before.replaceAll('\n', '\r\n'), after.replaceAll('\n', '\r\n')]]
    : [[before, after]];
  const matches = candidates.filter(([needle]) => html.includes(needle));
  assert.equal(matches.length, 1, `${label}: expected the exact known source fragment`);
  const [needle, replacement] = matches[0];
  assert.equal(html.split(needle).length, 2, `${label}: duplicate source fragment`);
  const index = html.indexOf(needle);
  return html.slice(0, index) + replacement + html.slice(index + needle.length);
}

export function applyHybridPolish(html) {
  assert(!html.includes(marker), 'Hybrid metadata polish already applied');
  html = replaceExact(html, '</style>', css + '</style>', 'Hybrid polish stylesheet');
  for (const [index, edit] of flagExportEdits.entries()) {
    html = replaceExact(html, edit.before, edit.after, `Hybrid flag export patch ${index}`);
  }
  return html;
}

export function removeHybridPolish(html) {
  if (!html.includes(marker)) return html;
  // Styles are inserted byte-for-byte from their file, independent of existing
  // HTML line endings. Export fragments preserve their own original endings.
  assert.equal(html.split(css).length, 2, 'Hybrid polish stylesheet differs from its exact recipe');
  html = html.replace(css, '');
  for (const [index, edit] of [...flagExportEdits].reverse().entries()) {
    html = replaceExact(html, edit.after, edit.before, `Hybrid flag export inverse ${index}`);
  }
  return html;
}
