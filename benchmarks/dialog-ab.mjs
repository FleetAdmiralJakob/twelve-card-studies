import {webkit} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
const browser=await webkit.launch({headless:true});
const script=await readFile('benchmarks/profile.js','utf8');
const results=[];
try{
 for(const [mode,css] of [['baseline',''],['opaque','dialog::backdrop{background:#06090b;backdrop-filter:none}']]){
  const context=await browser.newContext({viewport:{width:1080,height:792}});
  const page=await context.newPage();
  await page.route('**/css/**',async route=>{const r=await route.fetch();const headers={...r.headers()};delete headers['content-encoding'];delete headers['content-length'];await route.fulfill({status:200,headers,body:(await r.text()).replace('</head>',`<style>${css}</style></head>`)});});
  await page.goto('http://127.0.0.1:18787/css/?dialog='+mode);
  const r=await page.evaluate(script);results.push({mode,...r});
  console.log(JSON.stringify({mode,open:r.dialogTwoFrame,browse:r.browseFrames}));
  await context.close();
 }
}finally{await browser.close();await writeFile('benchmarks/dialog-experiment.json',JSON.stringify(results,null,2));}
