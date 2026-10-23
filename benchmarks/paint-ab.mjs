import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
const cases={baseline:'',noFilter:'.card,.detail-artwork .card{filter:none!important}',noPromote:'.card-motion{will-change:auto!important;transform:none!important;transition:none!important}',both:'.card,.detail-artwork .card{filter:none!important}.card-motion{will-change:auto!important;transform:none!important;transition:none!important}'};
try{for(let round=0;round<2;round++){for(const [name,css] of Object.entries(cases)){
 const context=await browser.newContext({viewport:{width:1080,height:792},deviceScaleFactor:1});const page=await context.newPage();
 await page.route('**/css/**',async route=>{const r=await route.fetch();const headers={...r.headers()};delete headers['content-encoding'];delete headers['content-length'];await route.fulfill({status:200,headers,body:(await r.text()).replace('</head>',`<style>${css}</style></head>`)});});
 await page.goto('http://127.0.0.1:18787/css/?paint='+Date.now());await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
 const p=await page.evaluate(()=>({fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,ready:performance.now(),dom:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd}));results.push({round:round+1,name,...p});console.log(JSON.stringify(results.at(-1)));
 if(round===1)await page.screenshot({path:`benchmarks/screenshots/paint-${name}.png`});await context.close();
}}}finally{await browser.close();await writeFile('benchmarks/paint-experiment.json',JSON.stringify(results,null,2));}
