import {readFile, mkdir, writeFile, rename, realpath} from 'node:fs/promises';
import {resolve, dirname, basename} from 'node:path';
import {viewports, ENGINES, CONTEXT_OPTIONS, WORKLOAD, AUXILIARY_AUDIT, editionOrder, launchOptions, fromRoot, fingerprints, assertSameFingerprints, functionalFailures, sha256, isMain} from './config.mjs';
import {verifyNetwork} from './network.mjs';
import {renderReport} from './report-view.mjs';

const equal = (actual, expected, label) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label} differs from primary benchmark contract`);
};
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const isoTime = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
export const LATEST_POINTER = 'revision-2/benchmarks/latest.json';
export function parseReportOptions(args) {
  if (args.length === 0) return {input:undefined, setLatest:false, help:false};
  if (args.length === 1 && ['--help','-h'].includes(args[0])) return {help:true};
  requireThat((args.length === 2 || args.length === 3 && args[2] === '--set-latest') && args[0] === '--input' && typeof args[1] === 'string' && args[1].length > 0 && !args[1].startsWith('--'), 'Usage: node revision-2/benchmarks/report.mjs [--input <snapshot.json> [--set-latest]]');
  return {input:args[1], setLatest:args.length === 3, help:false};
}
export function validateSnapshotPointer(pointer) {
  requireThat(pointer && typeof pointer === 'object' && !Array.isArray(pointer) && pointer.schemaVersion === 1 && Object.keys(pointer).sort().join(',') === 'batchId,completedAt,file,schemaVersion,sha256', 'latest.json must contain only schemaVersion:1, file, sha256, batchId and completedAt');
  requireThat(typeof pointer.file === 'string' && /^measurements\/[A-Za-z0-9][A-Za-z0-9._-]*\.json$/.test(pointer.file) && !pointer.file.toLowerCase().endsWith('.partial.json'), 'latest.json must select one immutable measurements/<filename>.json, never a partial/diagnostic or traversal path');
  requireThat(validHash(pointer.sha256) && typeof pointer.batchId === 'string' && pointer.batchId.length > 8 && isoTime(pointer.completedAt), 'latest.json has invalid digest or measurement identity');
  return pointer;
}
export function validateSnapshotSelection(raw, pointer) {
  if (pointer) {
    validateSnapshotPointer(pointer);
    requireThat(sha256(raw) === pointer.sha256, 'Selected snapshot bytes differ from latest.json SHA-256; never rewrite measured records');
  }
  const data=validateDataset(JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, '')));
  if (pointer) requireThat(data.batchId === pointer.batchId && data.completedAt === pointer.completedAt, 'Selected snapshot identity differs from latest.json');
  return data;
}
async function confinedMeasurement(path) {
  const benchmarkDirectory=await realpath(fromRoot('revision-2/benchmarks'));
  const directory=await realpath(fromRoot('revision-2/benchmarks/measurements'));
  const file=await realpath(path);
  const canonical=value => process.platform === 'win32' ? value.toLowerCase() : value;
  requireThat(canonical(directory) === canonical(resolve(benchmarkDirectory, 'measurements')), 'Measurements directory must not resolve outside the owned benchmark directory');
  requireThat(canonical(dirname(file)) === canonical(directory), 'Selected snapshot must resolve directly inside revision-2/benchmarks/measurements');
  return file;
}
async function readSnapshot(input) {
  if (input !== undefined) return {raw:await readFile(resolve(input)), path:resolve(input)};
  let pointer;
  try { pointer=validateSnapshotPointer(JSON.parse((await readFile(fromRoot(LATEST_POINTER), 'utf8')).replace(/^\uFEFF/, ''))); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error('No selected primary snapshot: revision-2/benchmarks/latest.json is missing. After a successful 64-run batch, run report.mjs --input <measurement.json> --set-latest and commit the snapshot plus latest.json. No directory scan or fallback is used.');
    throw error;
  }
  const path=await confinedMeasurement(fromRoot(`revision-2/benchmarks/${pointer.file}`));
  return {raw:await readFile(path), path, pointer};
}
function summary(value, count, label) {
  requireThat(value?.n === count && ['median','p95','max','over33ms'].every(key => finite(value[key])) && value.median <= value.p95 && value.p95 <= value.max && value.over33ms <= count, `Invalid ${label} summary`);
}

// Pure record validation is exported for static checks; file identity verification remains mandatory in generateReport.
export function validateDataset(data) {
  requireThat(data?.schemaVersion === 2 && data.revision === 2 && data.status === 'complete' && data.diagnostic === false, 'Only complete primary Revision 2 snapshots can be published');
  requireThat(typeof data.batchId === 'string' && data.batchId.length > 8 && isoTime(data.startedAt) && isoTime(data.completedAt) && Date.parse(data.completedAt) >= Date.parse(data.startedAt), 'Invalid measurement identity/timestamps');
  const origin=new URL(data.origin);
  requireThat(origin.protocol === 'http:' && origin.hostname === '127.0.0.1' && origin.origin === data.origin, 'Primary origin must be unthrottled loopback HTTP');
  const method=data.method;
  equal(method?.rounds, 4, 'Rounds'); equal(method.expectedRuns, 64, 'Run count');
  equal(method.engines, ENGINES, 'Engines'); equal(method.viewports, viewports, 'Profiles');
  equal(method.contextOptions, CONTEXT_OPTIONS, 'Browser context'); equal(method.workload, WORKLOAD, 'Workload');
  equal(method.auxiliaryAudit, AUXILIARY_AUDIT, 'Auxiliary response observation');
  equal(method.order, Array.from({length:4}, (_,i) => editionOrder(i)), 'Balanced order');
  for (const [key, expected] of Object.entries({headless:true, dpr:1, networkThrottling:false, cpuThrottling:false, freshContextPerRun:true, processIsolation:false, balancedOrder:true, navigationWaitUntil:'load', navigationTimeoutMs:60000, profileTimeoutMs:120000})) equal(method[key], expected, `Method ${key}`);
  requireThat(['auto','identity','br','gzip'].includes(method.requestedTransport), 'Missing transport policy');
  requireThat(data.machine && ['cpu','platform','release','arch','node','playwright','osVersion'].every(key => typeof data.machine[key] === 'string' && data.machine[key]) && data.machine.logicalCores > 0 && data.machine.memoryBytes > 0, 'Machine/runtime provenance is incomplete');
  for (const engine of ENGINES) {
    const browser=data.browsers?.[engine];
    requireThat(browser?.engine === engine && typeof browser.version === 'string' && browser.version.length > 0, `Missing ${engine} version`);
    equal(browser.launchOptions, launchOptions(engine), `${engine} launch options`);
    equal(browser.channel, engine === 'edge' ? 'msedge' : 'playwright-webkit', `${engine} channel`);
    equal(browser.customArguments, [], `${engine} custom arguments`);
    requireThat(browser.defaultBrowserArguments === true && browser.processPerEngine === true, `Missing ${engine} process policy`);
  }
  requireThat(data.fingerprints?.assetManifest?.assets?.length > 0 && validHash(data.fingerprints.assetManifest.sha256) && data.fingerprints.sources?.length > 0 && data.fingerprints.harness?.length > 0, 'Incomplete frozen fingerprint set');
  requireThat(Array.isArray(data.runs) && data.runs.length === 64, 'Exactly 64 primary runs required');
  let index=0, htmlEncoding;
  const userAgents=new Map();
  for (const engine of ENGINES) for (const profile of viewports) for (let round=1; round<=4; round++) for (const [position, edition] of editionOrder(round-1).entries()) {
    const run=data.runs[index++], label=`${engine}/${profile.name}/${round}/${edition}`;
    equal([run.engine,run.profile,run.round,run.position,run.edition,run.expectedEdition], [engine,profile.name,round,position+1,edition,edition], `${label} sequence/identity`);
    equal(run.viewport, [profile.width,profile.height], `${label} viewport`);
    equal(run.contextOptions, {...CONTEXT_OPTIONS, viewport:{width:profile.width,height:profile.height}}, `${label} context`);
    requireThat(run.dpr === 1 && run.documentVisible === 'visible' && typeof run.userAgent === 'string' && run.userAgent.length > 0 && isoTime(run.time) && Date.parse(run.time) >= Date.parse(data.startedAt) && Date.parse(run.time) <= Date.parse(data.completedAt), `${label}: invalid environment/time`);
    if (userAgents.has(engine)) equal(run.userAgent, userAgents.get(engine), `${engine} user agent`);
    else userAgents.set(engine, run.userAgent);
    const expectedURL=new URL(`/revision-2/${edition}/`, data.origin);
    expectedURL.searchParams.set('bench', `${data.batchId}-${engine}-${profile.name}-${round}`);
    equal(run.url, expectedURL.href, `${label} URL`);
    requireThat(Array.isArray(run.errors) && run.errors.length === 0 && Array.isArray(run.failures) && run.failures.length === 0, `${label}: recorded errors/failures`);
    const functional=functionalFailures(run);
    requireThat(!functional.length, `${label}: ${functional.join('; ')}`);
    const build=data.fingerprints.builds?.[edition];
    requireThat(build && ['sha256','gzipSha256','brotliSha256'].every(key => validHash(build[key])) && ['rawBytes','gzipBytes','brotliBytes'].every(key => finite(build[key]) && build[key]>0), `${label}: incomplete HTML fingerprint`);
    requireThat(run.verification?.matches === true && run.verification.servedSha256 === build.sha256 && run.verification.localSha256 === build.sha256 && run.verification.url === expectedURL.href, `${label}: served/local HTML fingerprint mismatch`);
    requireThat(run.load && (run.load.fcp === null || finite(run.load.fcp) && run.load.fcp > 0) && ['domReady','responseEnd','requestStart','galleryReadyObserved','harnessStarted'].every(key => finite(run.load[key])), `${label}: invalid navigation metrics (unavailable FCP must be null)`);
    requireThat(run.nodes?.documentInitial > 0 && run.nodes.gallery > 0 && run.nodes.perCard?.length === 12 && run.nodes.perCard.every(value => Number.isInteger(value) && value > 0), `${label}: missing DOM counts`);
    for (const [key,count] of [['baselineFrames',30],['browseFrames',180],['scrollFrames',180],['dialogDecode',12],['dialogTwoFrame',12],['dialogHandlers',12]]) summary(run[key],count,`${label} ${key}`);
    requireThat(run.openCards.every((open,i) => open.index === i && ['handler','twoFrames','decoded'].every(key => finite(open[key])) && open.handler <= open.twoFrames && open.twoFrames <= open.decoded), `${label}: invalid first-open measurements`);
    requireThat(run.scroll?.distance > 80 && run.scroll.maximumObservedScroll > 80, `${label}: scroll did not exercise gallery`);
    requireThat(run.transport && ['br','gzip','identity'].includes(run.transport.htmlEncoding), `${label}: missing HTML transport`);
    equal(run.transport.requiredEncoding, method.requestedTransport === 'auto' ? null : method.requestedTransport, `${label} required encoding`);
    htmlEncoding ??= run.transport.htmlEncoding;
    equal(run.transport.htmlEncoding, htmlEncoding, `${label} transport parity`);
    const accounting=verifyNetwork(run, data.fingerprints, data.origin);
    requireThat(!accounting.length, `${label}: ${accounting.join('; ')}`);
  }
  return data;
}

export async function generateReport(input, {setLatest=false}={}) {
  requireThat(!setLatest || input !== undefined, '--set-latest requires an explicit --input');
  const selection=await readSnapshot(input), raw=selection.raw;
  const data=validateSnapshotSelection(raw, selection.pointer);
  assertSameFingerprints(data.fingerprints, await fingerprints());
  const pointer=setLatest ? validateSnapshotPointer({schemaVersion:1, file:`measurements/${basename(await confinedMeasurement(selection.path))}`, sha256:sha256(raw), batchId:data.batchId, completedAt:data.completedAt}) : null;
  const html=renderReport({...data, snapshotSha256:sha256(raw)});
  requireThat(typeof html === 'string' && html.includes('<!doctype html>'), 'Report renderer did not return a full HTML document');
  const directory=fromRoot('dist/revision-2/benchmarks');
  await mkdir(directory, {recursive:true});
  // No clock reads: content derives only from this validated immutable snapshot and fingerprinted renderer.
  await writeFile(`${directory}/data.json.tmp`, raw);
  await writeFile(`${directory}/index.html.tmp`, html);
  await rename(`${directory}/data.json.tmp`, `${directory}/data.json`);
  await rename(`${directory}/index.html.tmp`, `${directory}/index.html`);
  if (pointer) {
    // Selection metadata is deliberately outside source/harness fingerprints: promotion must not invalidate the measured batch.
    await writeFile(fromRoot(`${LATEST_POINTER}.tmp`), JSON.stringify(pointer,null,2)+'\n');
    await rename(fromRoot(`${LATEST_POINTER}.tmp`), fromRoot(LATEST_POINTER));
    console.log(`Selected ${pointer.file}. Commit ${LATEST_POINTER} together with that immutable snapshot.`);
  }
  console.log(`Validated 64 primary runs. Wrote ${directory}/index.html and data.json. Measured ${data.completedAt}.`);
}

if (isMain(import.meta.url)) {
  const options=parseReportOptions(process.argv.slice(2));
  if (options.help) console.log('node revision-2/benchmarks/report.mjs\n  Uses revision-2/benchmarks/latest.json: one explicit SHA-256-pinned primary snapshot; no scan/fallback.\nnode revision-2/benchmarks/report.mjs --input revision-2/benchmarks/measurements/<immutable-snapshot>.json [--set-latest]\n  --set-latest writes the checked-in selection pointer only after full validation and report generation.\nRequires exactly 64 complete primary runs and exact current source/art/HTML/assets/harness fingerprints. Writes dist/revision-2/benchmarks/{index.html,data.json}. No preview, placeholders or timestamp rewrites.');
  else await generateReport(options.input, options);
}
