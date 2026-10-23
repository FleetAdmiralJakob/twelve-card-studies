// Preserve the independently measured R1 implementation byte-for-byte.
export {observeNetwork} from '../../benchmarks/four-network.mjs';
import {collectNetwork as collectBrowserNetwork} from '../../benchmarks/four-network.mjs';
import {FAVICON} from './config.mjs';
import {fetchAuxiliaryAudit, reconcileAuxiliaryAudit, verifyAuxiliaryAudit, aggregateResources} from './auxiliary.mjs';

export async function collectNetwork(observed, timing, assetDecoded, {documentURL, auditServer=false}={}) {
  const network=await collectBrowserNetwork(observed,timing,assetDecoded);
  if (!auditServer) return network;
  try {
    const evidence=await fetchAuxiliaryAudit(documentURL);
    return reconcileAuxiliaryAudit(network,evidence,{documentURL,timeOrigin:timing.timeOrigin});
  } catch (error) {
    network.failures.push({url:new URL(FAVICON.url,documentURL).href,reason:`Auxiliary audit unavailable after timing: ${error.message}`});
    Object.assign(network,aggregateResources(network.resources,network.failures,network.coldCutoff));
    return network;
  }
}

export function verifyNetwork(run, snapshot, origin) {
  const errors = [];
  const network = run.network;
  const build = snapshot.builds[run.edition];
  const assets = new Map(snapshot.assetManifest.assets.map(asset => [asset.url, asset]));
  const favicon = snapshot.sources?.find(source => source.path === FAVICON.path);
  if (favicon?.bytes !== FAVICON.bytes || favicon.sha256 !== FAVICON.sha256) errors.push('Missing or invalid empty favicon source fingerprint');
  if (!network || !Array.isArray(network.resources) || !network.resources.length) return ['Missing network ledger'];
  if (!Array.isArray(network.failures) || !Array.isArray(network.warnings)) errors.push('Missing network diagnostic arrays');
  for (const failure of network.failures || []) errors.push(`${failure.url}: ${failure.reason}`);
  let documents = 0;
  for (const resource of network.resources) {
    let url;
    try { url = new URL(resource.url); } catch { errors.push(`Invalid resource URL: ${resource.url}`); continue; }
    if (url.origin !== origin) errors.push(`External resource: ${url.href}`);
    let expected;
    if (url.pathname === `/revision-2/${run.edition}/` && resource.type === 'document') { expected = {sha256:build?.sha256, bytes:build?.rawBytes}; documents++; }
    // An optional browser-initiated request, not an injected fetch or a discarded ledger entry.
    else if (url.pathname === FAVICON.url) {
      expected= favicon;
      if (resource.encodedBodyBytes !== 0 || resource.contentEncoding !== 'identity' || resource.contentType?.split(';')[0].trim().toLowerCase() !== FAVICON.contentType) errors.push('Favicon must be an empty identity image/x-icon response');
    }
    else expected = assets.get(url.pathname);
    if (!expected) errors.push(`Unlisted resource: ${url.pathname}`);
    else if (resource.bodySha256 !== expected.sha256 || resource.decodedBodyBytes !== expected.bytes) errors.push(`Served bytes do not match frozen manifest/HTML: ${url.pathname}`);
    if (resource.status !== 200 || resource.method !== 'GET' || resource.fromServiceWorker) errors.push(`Unexpected resource response: ${url.pathname}`);
    if (!Number.isFinite(resource.encodedBodyBytes) || resource.encodedBodyBytes < 0) errors.push(`Incomplete encoded size: ${url.pathname}`);
    if (!['identity', 'br', 'gzip'].includes(resource.contentEncoding)) errors.push(`Unsupported transport encoding: ${resource.contentEncoding}`);
    if (resource.type === 'document') {
      const expectedBytes=resource.contentEncoding === 'br' ? build?.brotliBytes : resource.contentEncoding === 'gzip' ? build?.gzipBytes : build?.rawBytes;
      if (!resource.cold || resource.encodedBodyBytes !== expectedBytes) errors.push(`Navigation representation bytes differ from frozen HTML: ${url.pathname}`);
    }
    if (run.transport?.requiredEncoding && resource.type === 'document' && resource.contentEncoding !== run.transport.requiredEncoding) errors.push(`Required ${run.transport.requiredEncoding} HTML, received ${resource.contentEncoding}`);
  }
  if (documents !== 1) errors.push(`Expected one navigation response, found ${documents}`);
  for (const [scope, resources] of [['cold', network.resources.filter(resource => resource.cold)], ['workload', network.resources]]) {
    const aggregate = network[scope];
    if (!aggregate?.complete || aggregate.requests !== resources.length) errors.push(`Incomplete ${scope} accounting`);
    for (const key of ['encodedBodyBytes', 'decodedBodyBytes', 'transferBytes', 'requestBytes', 'responseHeadersBytes']) {
      const sum = resources.every(resource => Number.isFinite(resource[key]) && resource[key] >= 0) ? resources.reduce((total, resource) => total + resource[key], 0) : null;
      if (aggregate?.[key] !== sum) errors.push(`${scope}.${key} does not equal resource ledger`);
    }
  }
  errors.push(...verifyAuxiliaryAudit(network,run.url));
  return errors;
}
