import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,brotliCompressSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {paperThemes} from '../themes/paper.js';
import {electricThemes} from '../themes/electric.js';
import {artisticThemes} from '../themes/artistic.js';
const readJson=async p=>JSON.parse((await readFile(p,'utf8')).replace(/^\uFEFF/,''));
const optional=async p=>{try{return await readJson(p)}catch{return null}};
const main=await readJson('benchmarks/results.json');
const css=await readJson('dist/css-audit.json'),basic=await readJson('dist/basic-audit.json');
const sourceSVGElements=Object.values({...paperThemes,...electricThemes,...artisticThemes}).reduce((sum,t)=>sum+(t.art.match(/<[a-z][^>]*>/gi)||[]).length,0);
const data={main,webkit:await optional('benchmarks/webkit-results.json'),experiments:await optional('benchmarks/features-results.json'),history:{beforeOptimization:await optional('benchmarks/before-optimization.json'),paintExperiment:await optional('benchmarks/paint-experiment.json'),dialogExperiment:await optional('benchmarks/dialog-experiment.json'),partialWebKitBeforeDialog:await optional('benchmarks/webkit-before-dialog-optimization.json')},checks:{chromium:await optional('benchmarks/checks-chromium.json'),webkit:await optional('benchmarks/checks-webkit.json')},audits:{svg:{sourceSVGElements},css,basic}};
for(const [label,source,count] of [['Edge',main,18],['WebKit',data.webkit,18],['Features',data.experiments,9]]){
  assert.equal(source?.runs.length,count,label+' results are incomplete');
  for(const run of source.runs){
    assert.deepEqual(run.errors,[],label+' browser errors');
    assert.equal(run.checks.cards,12);assert.equal(run.checks.stats,72);
    assert.equal(run.checks.horizontalOverflow,false);assert.equal(run.checks.wrap,true);assert.equal(run.checks.editPersisted,true);
  }
  for(const [edition,file] of [['svg','hosted'],['css','css'],['basic','basic']]){
    const hash=createHash('sha256').update(await readFile(`dist/${file}.html`)).digest('hex');
    assert.equal(hash,source.builds[edition].sha256,label+' results use a different '+edition+' build');
  }
}
const template=await readFile('benchmarks/report-template.html','utf8');
const html=template.replace('/*BENCHMARK_DATA*/null',JSON.stringify(data).replaceAll('<','\\u003c'));
await mkdir('bench',{recursive:true});
await writeFile('bench/index.html',html);
await writeFile('benchmarks/report.html',html);
await writeFile('benchmarks/combined.json',JSON.stringify(data,null,2));
await writeFile('dist/bench.html',html);
await writeFile('dist/bench.html.gz',gzipSync(html));
await writeFile('dist/bench.html.br',brotliCompressSync(html));
await mkdir('dist/bench',{recursive:true});
await writeFile('dist/bench/index.html',html);
const inlineTemplate=await readFile('benchmarks/inline-template.html','utf8');
const inlineData={main:data.main,webkit:data.webkit};
await writeFile('benchmarks/inline.html',inlineTemplate.replace('/*BENCHMARK_DATA*/null',JSON.stringify(inlineData).replaceAll('<','\\u003c')));
console.log('Benchmark report built from '+main.runs.length+' Edge runs and '+(data.webkit?.runs.length||0)+' WebKit runs.');
