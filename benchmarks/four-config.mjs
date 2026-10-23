import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {readFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const fromRoot = path => resolve(ROOT, path);
export const editions = [
  {id:'svg', label:'SVG + CSS', route:'/', source:'/source/svg', file:'hosted'},
  {id:'css', label:'CSS + Polygone', route:'/css/', source:'/source/css', file:'css'},
  {id:'basic', label:'CSS-Grundformen', route:'/basic/', source:'/source/basic', file:'basic'},
  {id:'hybrid', label:'Hybrid HTML + assets', route:'/hybrid/', source:'/source/hybrid', file:'hybrid'},
];
export const viewports = [
  {name:'desktop', width:1080, height:792},
  {name:'mobile', width:390, height:844},
];
export const sha256 = body => createHash('sha256').update(body).digest('hex');
export const readJSON = async path => JSON.parse((await readFile(fromRoot(path), 'utf8')).replace(/^\uFEFF/, ''));
export async function fingerprint(edition) {
  const path = fromRoot(`dist/${edition.file}.html`);
  const body = await readFile(path);
  const size = async suffix => {
    try { return (await stat(path + suffix)).size; }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  };
  return {rawBytes:body.length, gzipBytes:await size('.gz'), brotliBytes:await size('.br'), sha256:sha256(body)};
}

export function functionalFailures(run) {
  const failures = [...(run.errors || [])];
  const expected = {cards:12, stats:72, horizontalOverflow:false, wrap:true, editPersisted:true, dialogOpened:true};
  for (const [key, value] of Object.entries(expected)) {
    if (run.checks?.[key] !== value) failures.push(`Check ${key}: expected ${value}, got ${run.checks?.[key]}`);
  }
  if (run.checks?.brokenImages?.length) failures.push('One or more gallery/detail images failed to decode');
  return failures;
}
