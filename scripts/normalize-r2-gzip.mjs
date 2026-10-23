import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { assertSameFingerprints, editions, fingerprints, fromRoot, readJSON, sha256 } from '../revision-2/benchmarks/config.mjs';
import { LATEST_POINTER, validateSnapshotPointer, validateSnapshotSelection } from '../revision-2/benchmarks/report.mjs';

// Deployment-only platform artifact normalization. CI run 40005616796 proved
// all four Linux gzip files differ from the recorded Windows files only in the
// RFC 1952 OS byte at offset 9 (3 -> 10). Keep the measured builder, snapshots,
// raw HTML, Brotli, and gzip payload/trailer untouched. Never recompress or
// accept decoded equality alone: the complete recorded gzip hash must match.
export function matchRecordedGzip(gzip, raw, expected) {
  assert.equal(raw.length, expected.rawBytes, 'Raw HTML size differs from the snapshot');
  assert.equal(sha256(raw), expected.sha256, 'Raw HTML hash differs from the snapshot');
  assert.equal(gzip.length, expected.gzipBytes, 'Gzip size differs from the snapshot');
  assert(gunzipSync(gzip).equals(raw), 'Gzip does not decode to the recorded HTML');
  if (sha256(gzip) === expected.gzipSha256) return gzip;

  // This exact, flag-free header excludes optional fields and a header CRC.
  assert.equal(gzip.subarray(0, 10).toString('hex'), '1f8b0800000000000003', 'Unsupported gzip header; only the observed Linux OS metadata may change');
  const candidate = Buffer.from(gzip);
  candidate[9] = 10;
  assert.equal(sha256(candidate), expected.gzipSha256, 'Gzip differs beyond the proven OS byte; refusing normalization');
  assert(gunzipSync(candidate).equals(raw), 'Normalized gzip does not decode to the recorded HTML');
  return candidate;
}

export async function normalizeRevision2Gzip() {
  const pointer = validateSnapshotPointer(await readJSON(LATEST_POINTER));
  const snapshot = validateSnapshotSelection(await readFile(fromRoot(`revision-2/benchmarks/${pointer.file}`)), pointer);
  const proposed = await fingerprints();
  const changes = [];
  for (const { id } of editions) {
    const expected = snapshot.fingerprints.builds[id];
    if (proposed.builds[id].gzipSha256 === expected.gzipSha256) continue;
    assert.equal(process.platform, 'linux', 'Gzip normalization is limited to the proven Linux build difference');
    assert.equal(snapshot.machine.platform, 'win32', 'Gzip normalization requires the recorded Windows snapshot');
    const file = fromRoot(`dist/revision-2/${id}/index.html.gz`);
    const [gzip, raw] = await Promise.all([readFile(file), readFile(fromRoot(`dist/revision-2/${id}/index.html`))]);
    const candidate = matchRecordedGzip(gzip, raw, expected);
    // Use the actual proposed bytes, never substitute the expected fingerprint.
    proposed.builds[id].gzipBytes = candidate.length;
    proposed.builds[id].gzipSha256 = sha256(candidate);
    changes.push({ id, file, candidate });
  }
  // Every frozen source, harness, manifest, asset, compression and ordering check
  // must pass before any write. The unchanged report repeats this check on disk.
  assertSameFingerprints(snapshot.fingerprints, proposed);
  for (const { id, file, candidate } of changes) {
    await writeFile(file, candidate);
    console.log(`Normalized Revision 2 ${id} gzip OS byte 3 -> 10; ${candidate.length} bytes and full SHA-256 match the selected snapshot.`);
  }
}
