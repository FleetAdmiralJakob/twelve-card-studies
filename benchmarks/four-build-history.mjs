import {readFile} from 'node:fs/promises';
import {gzipSync, brotliCompressSync, gunzipSync, brotliDecompressSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {editions, fromRoot, fingerprint, sha256} from './four-config.mjs';

const snapshots = {
  svg: 'versions/2026-10-23-before-fourth/svg.html',
  css: 'versions/2026-10-23-before-fourth/css-polygons.html',
  basic: 'versions/2026-10-23-before-fourth/css-primitives.html',
};

export function collectionFooter(bytes, label) {
  // Latin-1 keeps one character per byte: no UTF-8 or newline normalization.
  const text = bytes.toString('latin1');
  const starts = [...text.matchAll(/<footer\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)];
  const ends = [...text.matchAll(/<\/footer\s*>/gi)];
  assert.equal(starts.length, 1, `${label}: expected exactly one footer opening`);
  assert.equal(ends.length, 1, `${label}: expected exactly one footer closing`);
  const start = starts[0];
  const end = ends[0];
  assert.match(start[0], /^<footer\s+class="collection-footer"(?:\s|>)/, `${label}: unexpected footer boundary`);
  assert(end.index >= start.index + start[0].length, `${label}: malformed footer`);
  return {
    before: bytes.subarray(0, start.index),
    footer: bytes.subarray(start.index, end.index + end[0].length),
    after: bytes.subarray(end.index + end[0].length),
  };
}

export function compareMeasuredHtml(edition, measuredHtml, currentHtml) {
  if (measuredHtml.equals(currentHtml)) return 'exact';
  assert(Object.hasOwn(snapshots, edition.id), `${edition.id}: HTML changed since measurement; no footer exception for this edition`);
  const measured = collectionFooter(measuredHtml, `${edition.id} measured`);
  const current = collectionFooter(currentHtml, `${edition.id} current`);
  assert(measured.before.equals(current.before), `${edition.id}: HTML before the collection footer changed since measurement`);
  assert(measured.after.equals(current.after), `${edition.id}: HTML after the collection footer changed since measurement`);
  return 'footer-only';
}

export async function validateBuildHistory(sources) {
  const measured = {}, current = {}, measuredHtml = {}, comparisons = {};
  for (const edition of editions) {
    const currentPath = `dist/${edition.file}.html`;
    const currentHtml = await readFile(fromRoot(currentPath));
    current[edition.id] = await fingerprint(edition);
    assert.equal(current[edition.id].sha256, sha256(currentHtml), `${edition.id}: HTML changed during validation`);
    for (const [suffix, decode, size] of [['.gz', gunzipSync, current[edition.id].gzipBytes], ['.br', brotliDecompressSync, current[edition.id].brotliBytes]]) {
      assert(size !== null, `${edition.id}${suffix}: current compressed HTML missing`);
      const compressed = await readFile(fromRoot(currentPath + suffix));
      assert.equal(compressed.length, size, `${edition.id}${suffix}: changed during validation`);
      assert(decode(compressed).equals(currentHtml), `${edition.id}${suffix}: stale or does not match current HTML`);
    }
    const measuredPath = snapshots[edition.id] || currentPath;
    const bytes = snapshots[edition.id] ? await readFile(fromRoot(measuredPath)) : currentHtml;
    measuredHtml[edition.id] = bytes;
    // The archived V1–V3 HTML has no compressed siblings. Reproduce the build
    // scripts' default Node compression to validate their recorded byte counts.
    measured[edition.id] = snapshots[edition.id] ? {
      rawBytes: bytes.length,
      gzipBytes: gzipSync(bytes).length,
      brotliBytes: brotliCompressSync(bytes).length,
      sha256: sha256(bytes),
    } : current[edition.id];
    for (const [engine, source] of Object.entries(sources)) {
      assert.deepEqual(source.builds?.[edition.id], measured[edition.id], `${engine}: ${edition.id} measured HTML/fingerprint mismatch (${measuredPath})`);
    }
    comparisons[edition.id] = {
      measuredPath, currentPath,
      measuredSha256: measured[edition.id].sha256,
      currentSha256: current[edition.id].sha256,
      difference: compareMeasuredHtml(edition, bytes, currentHtml),
    };
  }
  return {measured, current, measuredHtml, comparisons};
}
