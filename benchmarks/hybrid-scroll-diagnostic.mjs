import {webkit} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {profileFour} from './four-profile.mjs';
const variants=[
 ['baseline',''],
 ['visibility','@media(max-width:760px){.card-slot{content-visibility:auto;contain-intrinsic-block-size:310px}}'],
 ['paint','@media(max-width:760px){.card-slot{contain:paint}}'],
 ['layer','@media(max-width:760px){.card-motion{transform:translateZ(0)}}'],
];
const out={date:new Date().toISOString(),note:'Separate diagnostic, injected CSS; same profileFour workload. Not part of the published 64-run comparison.',runs:[]};
const b=await webkit.launch({headless:true});
try{
 for(let round=0;round<4;round++){
  for(const [variant,css] of [...variants.slice(round),...variants.slice(0,round)]){
   const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
   try{
    const p=await ctx.newPage();await p.goto('http://127.0.0.1:18787/hybrid/');
    if(css)await p.addStyleTag({content:css});
    const r=await p.evaluate(profileFour);
    out.runs.push({round:round+1,variant,css,baseline:r.baselineFrames,open:r.dialogTwoFrame,browse:r.browseFrames,scroll:r.scrollFrames,checks:r.checks});
    console.log(JSON.stringify(out.runs.at(-1)));
    await writeFile('benchmarks/hybrid-scroll-diagnostic.json',JSON.stringify(out,null,2));
   }finally{await ctx.close();}
  }
 }
}finally{await b.close();}
