import { readFile } from 'node:fs/promises';
import { fingerprints, fromRoot, readJSON, sha256 } from '../revision-2/benchmarks/config.mjs';
import { LATEST_POINTER, validateSnapshotPointer, validateSnapshotSelection } from '../revision-2/benchmarks/report.mjs';

const pointer = validateSnapshotPointer(await readJSON(LATEST_POINTER));
const snapshot = validateSnapshotSelection(await readFile(fromRoot(`revision-2/benchmarks/${pointer.file}`)), pointer);
const expected = snapshot.fingerprints;
const actual = await fingerprints();
console.log(JSON.stringify({ node: process.version, platform: process.platform, snapshot: pointer.file, snapshotSha256: pointer.sha256 }));

let differences = 0;
function report(path, expected, actual) {
  differences++;
  console.log(JSON.stringify({ path, expected: expected === undefined ? { missing: true } : expected, actual: actual === undefined ? { missing: true } : actual }));
}
function compare(expected, actual, path = '$') {
  if (JSON.stringify(expected) === JSON.stringify(actual)) return;
  if (expected === null || actual === null || typeof expected !== 'object' || typeof actual !== 'object' || Array.isArray(expected) !== Array.isArray(actual)) {
    report(path, expected, actual);
    return;
  }
  const expectedKeys = Object.keys(expected), actualKeys = Object.keys(actual);
  // The frozen validator compares JSON text, so property order is diagnostic too.
  if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) report(`${path}.$keyOrder`, expectedKeys, actualKeys);
  for (const key of new Set([...expectedKeys, ...actualKeys])) compare(expected[key], actual[key], Array.isArray(expected) ? `${path}[${key}]` : `${path}.${key}`);
}
compare(expected, actual);

// Read-only proof for the platform-metadata hypothesis: never rewrite artifacts.
// fingerprints() above already verified each gzip decodes to its raw HTML.
for (const [edition, build] of Object.entries(expected.builds)) {
  if (build.gzipSha256 === actual.builds[edition]?.gzipSha256) continue;
  const gzip = await readFile(fromRoot(`dist/revision-2/${edition}/index.html.gz`));
  const header = gzip.subarray(0, 10).toString('hex');
  const validHeader = gzip.length >= 18 && gzip[0] === 0x1f && gzip[1] === 0x8b && gzip[2] === 8 && gzip[3] === 0;
  const matchingOSBytes = [];
  if (validHeader && gzip.length === build.gzipBytes) {
    const candidate = Buffer.from(gzip);
    for (let os = 0; os <= 255; os++) {
      candidate[9] = os;
      if (sha256(candidate) === build.gzipSha256) matchingOSBytes.push(os);
    }
  }
  console.log(JSON.stringify({ edition, gzipHeader: header, gzipOSByte: gzip[9], gzipBytes: gzip.length, expectedGzipBytes: build.gzipBytes, matchingOSBytes }));
}
console.log(`Revision 2 fingerprint differences: ${differences}`);
if (differences) process.exitCode = 1;
