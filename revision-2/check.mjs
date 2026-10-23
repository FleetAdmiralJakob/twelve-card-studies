// Functional checks only. Run against the already-built root preview:
//   node revision-2/check.mjs [--engine edge|webkit]
//   node revision-2/check.mjs --layout-only  (focused layout/resize follow-up)
//   $env:CARD_CHECK_ORIGIN='http://127.0.0.1:4174'
// No build, benchmark, Git operation, production storage, or golden-byte loop.
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, relative} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium, webkit} from 'playwright';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = (process.env.CARD_CHECK_ORIGIN || 'http://127.0.0.1:4174').replace(/\/$/, '');
const args = process.argv.slice(2);
const layoutOnly = args.includes('--layout-only');
const selected = args.find(a => a.startsWith('--engine='))?.split('=')[1] || (args.includes('--engine') ? args[args.indexOf('--engine') + 1] : undefined);
if (selected && !['edge', 'webkit'].includes(selected)) throw Error('--engine must be edge or webkit');
const engines = selected ? [selected] : ['edge', 'webkit'];
const editions = ['svg', 'css', 'basic', 'hybrid'];
const sizes = {desktop:{width:1440,height:1080}, mobile:{width:390,height:844}};
const key = 'the-twelve.revision-2.cards.v1';
const ratios = {france:1.5,norway:22/16,spain:1.5,japan:1.5,brazil:10/7,england:5/3,portugal:1.5,italy:1.5,netherlands:1.5,argentina:1.6,germany:5/3,uruguay:1.5};
const labels = {france:'France',norway:'Norway',spain:'Spain',japan:'Japan',brazil:'Brazil',england:'England',portugal:'Portugal',italy:'Italy',netherlands:'Netherlands',argentina:'Argentina',germany:'Germany',uruguay:'Uruguay'};
const keeper = ['DIV','HAN','KIC','REF','SPE','POS'];
const outfield = ['PAC','SHO','PAS','DRI','DEF','PHY'];
const positions = ['GK','CB','RB','LB','CDM','CM','CAM','RM','LM','RW','LW','CF','ST'];
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const output = resolve(root, 'revision-2/evidence/checkoutputs', `${runId}-${selected || 'both'}`);
await mkdir(output, {recursive:true});
const summary = {startedAt:new Date().toISOString(),origin,platform:process.platform,engines,viewports:sizes,mode:layoutOnly?'layout-only':'full',output:relative(root,output).replaceAll('\\','/'),
  notes:['Windows WebKit is Playwright WebKit, not Safari on an Apple device.','Mobile means a 390 × 844 CSS-pixel viewport with touch, not a physical phone.','Resource routes are href contracts only until integration.','Screenshots and canvas draw observations complement decoded PNG checks; no byte-golden comparisons.'],checks:[],pages:[],errors:[],expectedExportFailures:[],exports:[],evidence:[],counts:{}};
const artifact = name => resolve(output, name);
const shortPath = path => relative(root,path).replaceAll('\\','/');
async function saveSummary() {
  summary.counts = {checks:summary.checks.length,passed:summary.checks.filter(c=>c.ok).length,failed:summary.checks.filter(c=>!c.ok).length,
    pageViews:summary.pages.length,cardsObserved:summary.pages.reduce((sum,p)=>sum+p.cards,0),statsObserved:summary.pages.reduce((sum,p)=>sum+p.stats,0),errors:summary.errors.length,exports:summary.exports.length,evidence:summary.evidence.length};
  await writeFile(artifact('summary.json'), JSON.stringify(summary,null,2)+'\n');
}
async function check(scope, name, operation) {
  try {const detail = await operation(); summary.checks.push({scope,name,ok:true,...(detail===undefined?{}:{detail})}); return true;}
  catch(error) {summary.checks.push({scope,name,ok:false,error:error.message}); console.error(`FAIL ${scope}: ${name}: ${error.message.split('\n')[0]}`); return false;}
}
async function ready(page) {
  await page.waitForFunction(()=>document.fonts.status==='loaded' && !!document.querySelector('#gallery .card'));
  await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>img.decode())); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
}
async function capture(page, filename, locator) {
  await ready(page);
  const path = artifact(filename);
  await (locator || page).screenshot({path,...(locator?{}:{fullPage:true}),animations:'disabled'});
  summary.evidence.push(shortPath(path));
  return path;
}
async function open(page,index=0) {
  if (await page.locator('#card-dialog').evaluate(d=>d.open)) await page.locator('#close-dialog').click();
  await page.locator('#gallery .card').nth(index).click();
  await page.waitForFunction(()=>document.querySelector('#card-dialog').open && document.querySelector('#detail-stage .card'));
  await ready(page);
}
async function close(page) {if(await page.locator('#card-dialog').evaluate(d=>d.open)) await page.locator('#close-dialog').click();}
async function readState(page,where='#detail-stage') {
  return page.locator(`${where} .card`).first().evaluate(card=>({
    name:card.querySelector('.card-name').textContent,rating:Number(card.querySelector('.card-rating strong').textContent),
    position:card.querySelector('.card-rating span').textContent,country:card.querySelector('.flag').className.match(/flag--([a-z]+)/)?.[1],
    stats:[...card.querySelectorAll('.card-stat strong')].map(e=>Number(e.textContent))
  }));
}
async function edit(page,state) {
  await page.locator('#player-name').fill(state.name);
  await page.locator('#player-rating').fill(String(state.rating));
  await page.locator('#player-position').selectOption(state.position);
  await page.locator('#player-country').selectOption(state.country);
  for(let i=0;i<6;i++) await page.locator(`[data-stat="${i}"]`).fill(String(state.stats[i]));
}
async function persisted(page,theme,state) {
  await page.waitForFunction(({key,theme,state})=>{
    const got=JSON.parse(localStorage.getItem(key)||'null')?.cards?.[theme];
    return got && ['name','rating','position','country'].every(k=>got[k]===state[k]) && got.stats.join()===state.stats.join();
  },{key,theme,state});
}
const defaultState = card => Object.fromEntries(['name','rating','position','country','stats'].map(k=>[k,card[k]]));

async function technique(page,edition) {
  const audit = await page.evaluate(()=>{
    const styles=[...document.querySelectorAll('style')].map(e=>e.textContent).join('\n')+'\n'+[...document.querySelectorAll('[style]')].map(e=>e.getAttribute('style')).join('\n');
    return {tags:{img:document.querySelectorAll('img').length,svg:document.querySelectorAll('svg').length,canvas:document.querySelectorAll('canvas').length},
      artwork:[...document.querySelectorAll('#gallery .card-art')].map(e=>e.innerHTML),styles,
      // Raw style text also catches forbidden declarations rejected by the browser CSS parser.
      fonts:[...document.querySelectorAll('style')].flatMap(e=>[...e.textContent.matchAll(/@font-face\s*\{[^}]*\}/g)].map(m=>m[0]))};
  });
  // The sole URL exception is an embedded font in the src declaration of @font-face.
  const css=audit.styles.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@font-face\s*\{[^}]*\}/g, rule=>rule.replace(/\bsrc\s*:\s*url\(\s*['"]?data:(?:font\/[^;,]+|application\/(?:x-font-woff|font-woff|font-sfnt))[^)]*\)(?:\s*format\([^)]*\))?\s*;?/gi,''));
  if (edition==='basic'||edition==='css') {
    assert.deepEqual(audit.tags,{img:0,svg:0,canvas:0},'CSS editions cannot contain img/svg/canvas elements');
    assert(!/url\s*\(|(?:image|image-set|-webkit-image-set)\s*\(/i.test(css),'Image URL/image function outside embedded font src');
  }
  if(edition==='basic') {
    const forbidden=css.match(/(?:^|[;{\s])(?:-webkit-)?(?:clip(?:-path)?|mask(?:-[\w-]+)?|border-shape)\s*:|\b(?:polygon|path|shape)\s*\(/gi)||[];
    assert.deepEqual(forbidden,[],'Basic must not use clip, mask, polygon, path, shape, or border-shape anywhere in CSS');
  }
  if(edition==='svg') {
    assert.equal(audit.tags.img,0,'SVG edition raster/img artwork'); assert.equal(audit.tags.canvas,0);
    assert(audit.artwork.every(a=>/<svg\b/.test(a)&&!/<(?:image|foreignObject|img|canvas)\b/i.test(a)),'Every artwork is vector SVG without embedded image/foreignObject');
    for(const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)/gi)) {
      const value=match[1];
      assert(value.startsWith('#')||value.startsWith('data:image/svg+xml'),`Non-vector CSS URL: ${value.slice(0,80)}`);
      if(value.startsWith('data:image/svg+xml')) {
        const data=value.includes(';base64,')?Buffer.from(value.split(',')[1],'base64').toString():decodeURIComponent(value.slice(value.indexOf(',')+1));
        assert(!/<(?:image|foreignObject|script)\b|data:image\/(?:png|jpe?g|webp|avif)/i.test(data),'Raster/active content inside SVG flag');
      }
    }
  }
  return {elements:audit.tags,styleBytes:Buffer.byteLength(audit.styles),rawCSSStrict:true};
}
async function geometry(page, selector='#gallery .card') {
  return page.locator(selector).evaluateAll((cards,ratios)=>{
    const ctx=document.createElement('canvas').getContext('2d');
    return cards.map(card=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const cr=rect(card),flag=card.querySelector('.flag'),fr=rect(flag),country=flag.className.match(/flag--([a-z]+)/)?.[1],stats=rect(card.querySelector('.card-stats'));
    const name=card.querySelector('.card-name'),nr=rect(name),cs=getComputedStyle(name),crest=card.querySelector('.card-crest svg'),crestRect=crest?rect(crest):null;
    // A text line box includes unused ascent/descent space. Measure actual glyph bounds,
    // so a flag touching that empty space is not incorrectly called a text collision.
    const statInk=[...card.querySelectorAll('.card-stat small,.card-stat strong')].map(el=>{
      const text=el.textContent,style=getComputedStyle(el),r=rect(el),scale=cr.width/300;
      ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      if('letterSpacing' in ctx)ctx.letterSpacing=style.letterSpacing==='normal'?'0px':style.letterSpacing;
      const m=ctx.measureText(text),probe=document.createElement('span');
      probe.style.cssText='display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline';
      el.append(probe);const baseline=probe.getBoundingClientRect().top;probe.remove();
      const x=r.x+(r.width-m.width*scale)/2;
      return {text,x:x-m.actualBoundingBoxLeft*scale,right:x+m.actualBoundingBoxRight*scale,y:baseline-m.actualBoundingBoxAscent*scale,bottom:baseline+m.actualBoundingBoxDescent*scale};
    });
    const flagInkOverlaps=statInk.filter(ink=>Math.min(fr.right,ink.right)-Math.max(fr.x,ink.x)>.5 && Math.min(fr.bottom,ink.bottom)-Math.max(fr.y,ink.y)>.5);
    return {theme:card.dataset.theme,country,ratio:fr.width/fr.height,expectedRatio:ratios[country],flagStatsGap:stats.y-fr.bottom,flagInkOverlaps,statInk,
      flagInside:fr.x>=cr.x-1&&fr.right<=cr.right+1&&fr.y>=cr.y-1&&fr.bottom<=cr.bottom+1,
      nameSafe:nr.x>=cr.x-1&&nr.right<=cr.right+1&&(name.scrollWidth<=name.clientWidth+1||['hidden','clip'].includes(cs.overflowX)),
      flag:fr,stats,card:cr,crest:crestRect,crestStatsGap:crestRect?stats.y-crestRect.bottom:null,paintedFlag:flag.firstElementChild?rect(flag.firstElementChild):null};
  });},ratios);
}
function assertGeometry(items) {
  for(const g of items) {
    assert(Math.abs(g.ratio-g.expectedRatio)<0.025,`${g.theme}/${g.country} distorted flag: ${g.ratio} vs ${g.expectedRatio}`);
    assert.equal(g.flagInkOverlaps.length,0,`${g.theme}/${g.country} flag overlaps visible stat glyphs: ${g.flagInkOverlaps.map(i=>i.text).join(', ')}`);
    assert(g.flagInside && g.nameSafe,`${g.theme} flag/name escapes card`);
    if(g.crest) {
      assert(g.crestStatsGap>=-0.5,`${g.theme} live crest overlaps stats by ${-g.crestStatsGap}px`);
      assert(g.crest.x>=g.card.x-1 && g.crest.right<=g.card.right+1 && g.crest.bottom<=g.card.bottom+1,`${g.theme} crest escapes card`);
      assert(g.crest.x>=g.flag.right || g.flag.x>=g.crest.right || g.crest.y>=g.flag.bottom || g.flag.y>=g.crest.bottom,`${g.theme} crest overlaps flag`);
    }
    if(g.paintedFlag) assert(Math.abs(g.paintedFlag.width-g.flag.width)<1.5 && Math.abs(g.paintedFlag.height-g.flag.height)<1.5,`${g.theme}/${g.country} flag art does not fill its intrinsic-ratio box`);
  }
}
async function hrefs(page,edition) {
  const all=await page.locator('a[href]').evaluateAll(links=>links.map(a=>({href:a.getAttribute('href'),current:a.getAttribute('aria-current'),download:a.hasAttribute('download'),blank:a.target==='_blank',rel:a.rel})));
  for(const route of [...editions.map(e=>`/revision-2/${e}/`),'/original/','/collections/','/revision-2/reference','/revision-2/benchmarks/',`/revision-2/source/${edition}`]) assert(all.some(a=>a.href===route),`Missing href ${route}`);
  assert.equal(await page.locator('.edition-nav a').count(),4);
  assert.equal(await page.locator('.edition-nav [aria-current="page"]').getAttribute('href'),`/revision-2/${edition}/`);
  assert(all.filter(a=>a.href.startsWith('/revision-2/source/')).every(a=>a.download),'Source links should download');
  assert(all.filter(a=>a.blank).every(a=>a.rel.split(/\s+/).includes('noopener')),'New-window links need noopener');
  return {hrefs:[...new Set(all.map(a=>a.href))],httpRequired:false};
}
async function keyboard(page) {
  await open(page,2);
  assert.equal(await page.locator('#card-dialog').evaluate(d=>d.tagName==='DIALOG' && d.matches(':modal')),true,'Native modal dialog');
  await page.locator('#gallery .card').first().evaluate(card=>card.focus());
  assert(await page.evaluate(()=>document.querySelector('#card-dialog').contains(document.activeElement)),'Background card accepted focus while modal open');
  await page.locator('#close-dialog').focus();
  const visited=[];
  for(let i=0;i<24;i++) {
    await page.keyboard.press('Tab');
    const active=await page.evaluate(()=>({inside:document.querySelector('#card-dialog').contains(document.activeElement),id:document.activeElement.id,tag:document.activeElement.tagName,documentFocused:document.hasFocus()}));
    // Native dialogs may cycle through browser chrome. That is not focus on inert page content.
    assert(active.inside||(!active.documentFocused&&active.tag==='BODY'),`Tab focused background content ${active.tag}#${active.id}`); visited.push(active);
  }
  await page.locator('#close-dialog').focus(); await page.keyboard.press('Shift+Tab');
  assert(await page.evaluate(()=>document.querySelector('#card-dialog').contains(document.activeElement)||(!document.hasFocus()&&document.activeElement===document.body)),'Reverse Tab focused background content');
  await page.locator('#close-dialog').focus();
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#card-dialog').open);
  assert(await page.locator('#gallery .card').nth(2).evaluate(e=>e===document.activeElement),'Escape must restore opener focus');
  await open(page,3); await page.locator('#close-dialog').click();
  assert(await page.locator('#gallery .card').nth(3).evaluate(e=>e===document.activeElement),'Close button must restore opener focus');
  return {forwardTabs:visited.length,browserChromeStops:visited.filter(a=>!a.documentFocused).length,reverseTab:true,escape:true,focusReturn:true};
}
async function modalReachability(page) {
  await open(page,0);
  const bounds=await page.locator('#card-dialog').evaluate(d=>({x:d.getBoundingClientRect().x,right:d.getBoundingClientRect().right,width:innerWidth,overflow:d.scrollWidth-d.clientWidth}));
  assert(bounds.x>=-1 && bounds.right<=bounds.width+1 && bounds.overflow<=1,`Modal horizontal overflow: ${JSON.stringify(bounds)}`);
  for(const selector of ['#player-name','#player-rating','#player-country','[data-stat="5"]','#reset-card','#close-dialog']) {
    const control=page.locator(selector); await control.scrollIntoViewIfNeeded();
    const reachable=await control.evaluate(el=>{
      const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);
      return {inside:x>=0&&x<=innerWidth&&y>=0&&y<=innerHeight,hit:hit===el||el.contains(hit),height:r.height};
    });
    assert(reachable.inside&&reachable.hit,`${selector} cannot be reached without being covered`);
    assert(reachable.height>=40,`${selector} too short for a usable touch target`);
  }
  return bounds;
}
async function largerCards(page,engine,edition,view,viewport) {
  await close(page);
  const toggle=page.locator('#layout-toggle');
  assert(await toggle.isVisible(),'Larger cards toggle is not visible');
  assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  const compact=await page.locator('#gallery .card').first().evaluate(e=>e.getBoundingClientRect().width);
  const audit=async()=>{
    await ready(page);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Larger-card layout overflows page');
    const cards=await page.locator('#gallery .card').evaluateAll(cards=>cards.map(card=>{
      const c=card.getBoundingClientRect(),shell=card.closest('.card-shell').getBoundingClientRect();
      return {theme:card.dataset.theme,width:c.width,height:c.height,shellWidth:shell.width,shellHeight:shell.height};
    }));
    assert.equal(cards.length,12);
    for(const card of cards){assert(Math.abs(card.width-card.shellWidth)<1 && Math.abs(card.height-card.shellHeight)<1,`${card.theme} scale does not match resized shell`);assert(Math.abs(card.width/card.height-300/380)<0.002,`${card.theme} distorted after resize`);}
    return cards;
  };
  try {
    await toggle.click();assert.equal(await toggle.getAttribute('aria-pressed'),'true');
    await page.waitForFunction(width=>document.querySelector('#gallery .card').getBoundingClientRect().width>width*1.15,compact);
    const large=await audit();
    await capture(page,`${engine}-${edition}-${view}-larger-gallery.png`);
    for(const index of [0,11]) {
      await open(page,index);
      assert.equal(await page.locator('#detail-stage .card').getAttribute('data-theme'),large[index].theme);
      assert((await geometry(page,'#detail-stage .card')).every(g=>Math.abs(g.card.width/g.card.height-300/380)<0.002),'Opened card distorted in larger layout');
      await close(page);
    }
    await open(page,11);
    const opposite=view==='desktop'?sizes.mobile:sizes.desktop;
    await page.setViewportSize(opposite);await ready(page);
    const resized=await page.locator('#card-dialog').evaluate(d=>{
      const r=d.getBoundingClientRect(),stage=document.querySelector('#detail-stage').getBoundingClientRect(),card=document.querySelector('#detail-stage .card').getBoundingClientRect();
      return {dialogLeft:r.left,dialogRight:r.right,viewportWidth:innerWidth,overflow:d.scrollWidth-d.clientWidth,stageWidth:stage.width,cardWidth:card.width,cardHeight:card.height};
    });
    assert(resized.dialogLeft>=-1 && resized.dialogRight<=resized.viewportWidth+1 && resized.overflow<=1,'Open editor overflows after viewport resize');
    assert(Math.abs(resized.stageWidth-resized.cardWidth)<1 && Math.abs(resized.cardWidth/resized.cardHeight-300/380)<0.002,'Open card does not resize with its stage');
    await page.setViewportSize(viewport);await ready(page);await close(page);await audit();
    await toggle.focus();await toggle.press('Space');assert.equal(await toggle.getAttribute('aria-pressed'),'false');await ready(page);
    const restored=await audit();assert(Math.abs(restored[0].width-compact)<1,'Compact size did not restore');
    return {compactWidth:compact,largeWidth:large[0].width,openedCards:[0,11],resizedEditor:resized,keyboardToggleBack:true};
  } finally {
    await page.setViewportSize(viewport);await close(page);
    if(await toggle.getAttribute('aria-pressed')==='true')await toggle.click();
    await ready(page);
  }
}
async function instrument(page) {
  await page.addInitScript(()=>{
    window.__cardCheckExport={text:[],images:[],results:[]};
    const originalText=CanvasRenderingContext2D.prototype.fillText,originalImage=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.fillText=function(text,...rest){window.__cardCheckExport.text.push(String(text)); return originalText.call(this,text,...rest);};
    CanvasRenderingContext2D.prototype.drawImage=function(img,...rest){window.__cardCheckExport.images.push({src:img.currentSrc||img.src||'',width:img.naturalWidth,height:img.naturalHeight});return originalImage.call(this,img,...rest);};
    document.addEventListener('revision2:export-result',e=>window.__cardCheckExport.results.push(e.detail));
  });
}
async function exportOne(page,scope,theme,state,filename) {
  await page.evaluate(()=>{window.__cardCheckExport.text=[];window.__cardCheckExport.images=[];window.__cardCheckExport.results=[];});
  const downloadPromise=page.waitForEvent('download',{timeout:15000});
  await page.locator('#export-card').click();
  const download=await downloadPromise; assert.equal(await download.failure(),null);
  const path=artifact(filename); await download.saveAs(path);
  await page.waitForFunction(()=>window.__cardCheckExport.results.length>0 && !document.querySelector('#export-card').disabled);
  const obs=await page.evaluate(()=>({trace:window.__cardCheckExport,flag:getComputedStyle(document.querySelector('#detail-stage .flag')).backgroundImage,crest:document.querySelector('#detail-stage .card-crest svg')?.outerHTML}));
  assert.equal(obs.trace.results.at(-1).ok,true);
  const text=[state.rating.toString(),state.position,state.name,...(state.position==='GK'?keeper:outfield),...state.stats.map(String)];
  for(const value of text) assert(obs.trace.text.includes(value),`Export missing custom label ${value}`);
  const flagURL=obs.flag.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
  assert(flagURL && obs.trace.images.some(i=>i.src===flagURL),'PNG did not draw the selected country flag');
  assert(obs.crest,'Hybrid editor has no live SVG crest');
  assert(obs.trace.images.some(i=>{
    if(!i.src.startsWith('data:image/svg+xml'))return false;
    const data=i.src.slice(i.src.indexOf(',')+1);
    return (i.src.slice(0,i.src.indexOf(',')).includes(';base64')?Buffer.from(data,'base64').toString():decodeURIComponent(data))===obs.crest;
  }),'PNG omitted or substituted the live SVG crest');
  const metadata=await sharp(path).metadata();
  assert.equal(metadata.width,1011);assert.equal(metadata.height,1280);assert.equal(metadata.format,'png');assert(metadata.hasAlpha);
  const {data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let transparent=0,opaque=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)transparent++;if(data[i]>=240)opaque++;}
  assert(transparent>info.width*info.height*.005,'PNG has an alpha channel but no meaningful transparency');
  assert(opaque>info.width*info.height*.25,'PNG is empty/nearly transparent');
  const result={scope,theme,path:shortPath(path),filename:download.suggestedFilename(),width:metadata.width,height:metadata.height,transparentPixels:transparent,nearlyOpaquePixels:opaque,
    artworkDecoded:obs.trace.images.filter(i=>!i.src.startsWith('data:')).map(({width,height})=>({width,height})),state,drawnLabels:obs.trace.text,selectedFlagDrawn:true,liveCrestDrawn:true};
  summary.exports.push(result);summary.evidence.push(shortPath(path));return result;
}

for(const engine of engines) {
  let browser;
  if(!await check(engine,'Browser launch',async()=>{browser=await (engine==='edge'?chromium:webkit).launch({headless:true,...(engine==='edge'?{channel:'msedge'}:{})});return {version:browser.version()};})) continue;
  try {
    for(const edition of editions) for(const [view,viewport] of Object.entries(sizes)) {
      const scope=`${engine}/${edition}/${view}`;
      console.log(`CHECK ${scope}`);
      const context=await browser.newContext({viewport,deviceScaleFactor:1,hasTouch:view==='mobile',locale:'en-US',colorScheme:'dark',serviceWorkers:'block',acceptDownloads:true});
      const page=await context.newPage();page.setDefaultTimeout(6000);page.setDefaultNavigationTimeout(15000);
      const errors=[]; let intentionalExportFailure=false;
      const record=event=>{const item={scope,...event};if(intentionalExportFailure&&event.type!=='pageerror')summary.expectedExportFailures.push(item);else{errors.push(item);summary.errors.push(item);}};
      page.on('pageerror',e=>record({type:'pageerror',message:e.message}));
      page.on('console',msg=>{if(msg.type()==='error')record({type:'console',message:msg.text(),location:msg.location()});});
      page.on('requestfailed',request=>record({type:'requestfailed',url:request.url(),message:request.failure()?.errorText}));
      page.on('response',response=>{if(response.status()>=400)record({type:'http',url:response.url(),status:response.status()});});
      await instrument(page);
      let config;
      try {
        const loaded=await check(scope,'Load, decode artwork, 12 cards / 72 stats',async()=>{
          const response=await page.goto(`${origin}/revision-2/${edition}/`);assert.equal(response.status(),200);await ready(page);
          config=await page.locator('#collection-data').evaluate(e=>JSON.parse(e.textContent));
          assert.equal(config.edition,edition);assert.equal(config.cards.length,12);
          assert.equal(await page.locator('#gallery .card').count(),12);assert.equal(await page.locator('#gallery .card-stat').count(),72);
          assert.equal(new Set(await page.locator('#gallery .card').evaluateAll(cs=>cs.map(c=>c.dataset.theme))).size,12);
          const images=await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,complete:i.complete})));
          assert(images.every(i=>i.complete&&i.width>0&&i.height>0));
          summary.pages.push({scope,url:page.url(),cards:12,stats:72,images,htmlSHA256:createHash('sha256').update(await response.body()).digest('hex')});
          return {cards:12,stats:72,images};
        });
        if(!loaded) continue;
        await check(scope,'Gallery screenshot after fonts and all image decodes',()=>capture(page,`${engine}-${edition}-${view}-gallery.png`));
        await check(scope,'Technique constraints, strict raw CSS and rendered tags',()=>technique(page,edition));
        await check(scope,'Navigation/resource href contracts',()=>hrefs(page,edition));
        await check(scope,'Gallery fits viewport and all twelve country ratios',async()=>{
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page horizontally overflows');
          const measured=await geometry(page);assertGeometry(measured);return measured;
        });
        await check(scope,'Larger cards toggle, all card scaling, opening, live viewport resize and compact restore',()=>largerCards(page,engine,edition,view,viewport));
        if(layoutOnly)continue;
        await check(scope,'Every gallery card opens correct editor and defaults',async()=>{
          const measured=[];
          for(let i=0;i<12;i++) {
            await open(page,i);assert.equal(await page.locator('#detail-stage .card').getAttribute('data-theme'),config.cards[i].theme);
            assert.deepEqual(await readState(page),defaultState(config.cards[i]));
            assert.equal(await page.locator('#player-name').inputValue(),config.cards[i].name);
            assert.equal(await page.locator('#detail-position').textContent(),`${String(i+1).padStart(2,'0')} / 12`);
            measured.push(...await geometry(page,'#detail-stage .card'));
            await close(page);
          }
          assertGeometry(measured);
          return {clicked:12,defaultStats:72};
        });
        await check(scope,'Next/previous traverse all twelve and wrap both ends',async()=>{
          await open(page,0);
          for(let i=1;i<=12;i++){await page.locator('#next-card').click();assert.equal(await page.locator('#detail-stage .card').getAttribute('data-theme'),config.cards[i%12].theme);}
          for(let i=11;i>=0;i--){await page.locator('#previous-card').click();assert.equal(await page.locator('#detail-stage .card').getAttribute('data-theme'),config.cards[i].theme);}
          await close(page);return {next:12,previous:12};
        });
        const custom={name:'JAKOB CHECK',rating:98,position:'GK',country:'brazil',stats:[91,82,73,64,55,46]};
        await check(scope,'Edit name/rating/position/country/all six stats; navigation and reload persistence',async()=>{
          await open(page,0);await edit(page,custom);assert.deepEqual(await readState(page),custom);
          assert.deepEqual(await page.locator('#detail-stage .card-stat small').allTextContents(),keeper);
          assert.deepEqual(await page.locator('.stat-fields label > span').allTextContents(),keeper);
          await persisted(page,config.cards[0].theme,custom);
          await page.locator('#next-card').click();await page.locator('#previous-card').click();assert.deepEqual(await readState(page),custom);
          await page.reload();await ready(page);assert.deepEqual(await readState(page,'#gallery'),custom);await open(page,0);assert.deepEqual(await readState(page),custom);
          await capture(page,`${engine}-${edition}-${view}-editor.png`);return {state:custom,storageKey:key};
        });
        await check(scope,'All position choices, GK labels, all country choices and intrinsic flag proportions',async()=>{
          await open(page,0);
          for(const position of positions){await page.locator('#player-position').selectOption(position);assert.equal((await readState(page)).position,position);assert.deepEqual(await page.locator('#detail-stage .card-stat small').allTextContents(),position==='GK'?keeper:outfield);}
          const measured=[];
          for(const country of Object.keys(ratios)) {
            await page.locator('#player-country').selectOption(country);assert.equal((await readState(page)).country,country);
            assert.equal(await page.locator('#detail-stage .flag').getAttribute('aria-label'),labels[country]);
            measured.push(...await geometry(page,'#detail-stage .card'));
          }
          assertGeometry(measured);
          return {positions:positions.length,countries:measured};
        });
        await check(scope,'Invalid numbers do not alter saved card; oversized names stay within card',async()=>{
          await open(page,0);await edit(page,custom);await persisted(page,config.cards[0].theme,custom);
          for(const bad of ['0','100','-1','2.5','']){await page.locator('#player-rating').fill(bad);assert.deepEqual(await readState(page),custom);await page.locator('#player-rating').fill('98');}
          await page.locator('[data-stat="3"]').fill('100');assert.deepEqual(await readState(page),custom);await page.locator('[data-stat="3"]').fill('64');
          await page.locator('#player-name').fill('WWWWWWWWWWWWWWWWWW');
          assert((await geometry(page,'#detail-stage .card')).every(g=>g.nameSafe),'Oversized name escapes its card');
          await capture(page,`${engine}-${edition}-${view}-long-name.png`,page.locator('#detail-stage'));
          assert.equal((await readState(page)).name,'WWWWWWWWWWWWWWWWWW');return {invalidRatings:5,invalidStat:true,nameLength:18};
        });
        await check(scope,'Reset cancel preserves edits; confirm restores original and persists',async()=>{
          await open(page,0);await edit(page,custom);await persisted(page,config.cards[0].theme,custom);
          await page.locator('#reset-card').click();assert(await page.locator('#reset-confirm').isVisible());await page.locator('#cancel-reset').click();assert.deepEqual(await readState(page),custom);
          await page.locator('#reset-card').click();await page.locator('#confirm-reset').click();assert.deepEqual(await readState(page),defaultState(config.cards[0]));
          await persisted(page,config.cards[0].theme,defaultState(config.cards[0]));await page.reload();await ready(page);await open(page,0);assert.deepEqual(await readState(page),defaultState(config.cards[0]));return {cancel:true,confirm:true,reload:true};
        });
        await check(scope,'Native modal: Escape, focus return, forward/reverse Tab containment',()=>keyboard(page));
        await check(scope,'Editor controls reachable by scrolling, no modal horizontal overflow',()=>modalReachability(page));
        if(edition==='hybrid') {
          const indices=view==='desktop'?Array.from({length:12},(_,i)=>i):[0,11];
          for(const index of indices) await check(scope,`Transparent PNG export ${config.cards[index].theme} with customized fields`,async()=>{
            await open(page,index);
            const state={name:`CHECK ${String(index+1).padStart(2,'0')}`,rating:99-index,position:index%2?'ST':'GK',country:index%2?'japan':'brazil',stats:[91-index,82-index,73-index,64-index,55-index,46-index]};
            await edit(page,state);
            if([0,7,10,11].includes(index)) await capture(page,`${engine}-${edition}-${view}-export-editor-${config.cards[index].theme}.png`,page.locator('#detail-stage'));
            return await exportOne(page,scope,config.cards[index].theme,state,`${engine}-${view}-export-${config.cards[index].theme}.png`);
          });
          await check(scope,'PNG error reports failure and button recovers for retry',async()=>{
            await open(page,0);
            const state=await readState(page);
            const source=await page.locator('#detail-stage .card-art img').getAttribute('data-high-res');
            await page.locator('#detail-stage .card-art img').evaluate(img=>img.dataset.highRes='data:image/png;base64,broken');
            await page.evaluate(()=>window.__cardCheckExport.results=[]);intentionalExportFailure=true;
            try {await page.locator('#export-card').click();await page.waitForFunction(()=>window.__cardCheckExport.results.length>0 && !document.querySelector('#export-card').disabled);
              assert.equal(await page.evaluate(()=>window.__cardCheckExport.results.at(-1).ok),false);assert.match(await page.locator('#export-status').textContent(),/failed|try again/i);
            } finally {intentionalExportFailure=false;await page.locator('#detail-stage .card-art img').evaluate((img,src)=>img.dataset.highRes=src,source);}
            await exportOne(page,scope,config.cards[0].theme,state,`${engine}-${view}-export-recovered.png`);return {failureInjected:'undecodable export-only image',retrySucceeded:true};
          });
        }
        // Invalid persisted records are tested on desktop; the same startup parser serves both viewports.
        if(view==='desktop') await check(scope,'Corrupt JSON, invalid record shapes/numbers, and HTML-looking names are safe',async()=>{
          const theme=config.cards[0].theme,defaults=defaultState(config.cards[0]);
          const variants=[{name:'malformed JSON',raw:'{broken'},
            ...[null,'99',0,100,2.5].map(n=>({name:`rating ${JSON.stringify(n)}`,raw:JSON.stringify({version:1,cards:{[theme]:{...defaults,rating:n}}})})),
            {name:'bad stat',raw:JSON.stringify({version:1,cards:{[theme]:{...defaults,stats:[1,2,3,'4',5,6]}}})},
            {name:'name object',raw:JSON.stringify({version:1,cards:{[theme]:{...defaults,name:{html:'<img>'}}}})},
            {name:'oversized persisted name',raw:JSON.stringify({version:1,cards:{[theme]:{...defaults,name:'W'.repeat(200)}}})},
            {name:'unknown country/position',raw:JSON.stringify({version:1,cards:{[theme]:{...defaults,country:'missing',position:'<svg>'}}})}];
          for(const variant of variants){await page.evaluate(({key,raw})=>{localStorage.setItem(key,raw);}, {key,raw:variant.raw});
            // pagehide normally saves current edits; override the load via an init script in a fresh page instead.
            const probe=await context.newPage();await probe.addInitScript(({key,raw})=>localStorage.setItem(key,raw),{key,raw:variant.raw});
            const probeErrors=[];probe.on('pageerror',e=>probeErrors.push(e.message));await probe.goto(`${origin}/revision-2/${edition}/`);await ready(probe);
            assert.deepEqual(await readState(probe,'#gallery'),defaults,variant.name);assert.deepEqual(probeErrors,[]);await probe.close();
          }
          const htmlName='<svg/onload=x=1>',safeState={...defaults,name:htmlName};
          const probe=await context.newPage();await probe.addInitScript(({key,theme,state})=>{window.x=0;localStorage.setItem(key,JSON.stringify({version:1,cards:{[theme]:state}}));},{key,theme,state:safeState});
          await probe.goto(`${origin}/revision-2/${edition}/`);await ready(probe);assert.equal((await readState(probe,'#gallery')).name,htmlName.toUpperCase());
          assert.equal(await probe.locator('#gallery .card-name *').count(),0);assert.equal(await probe.evaluate(()=>window.x),0);await open(probe,0);assert.equal(await probe.locator('#detail-stage .card-name *').count(),0);await probe.close();
          return {invalidStorageCases:variants.map(v=>v.name),htmlNameRenderedAsText:true};
        });
      } catch(error) {summary.checks.push({scope,name:'Scenario continuation',ok:false,error:error.stack});}
      finally {
        await check(scope,'No uncaught JS, console, failed requests, or HTTP errors',async()=>assert.deepEqual(errors,[]));
        await context.close();await saveSummary();
      }
    }
    if(!layoutOnly)await check(engine,'Edited state is shared by all four edition navigations and reloads',async()=>{
      const context=await browser.newContext({viewport:sizes.desktop});const page=await context.newPage();page.setDefaultTimeout(6000);
      try {
        await page.goto(`${origin}/revision-2/svg/`);await ready(page);const theme=await page.locator('#gallery .card').first().getAttribute('data-theme');
        const state={name:'CROSS EDITION',rating:97,position:'GK',country:'norway',stats:[99,88,77,66,55,44]};await open(page,0);await edit(page,state);await persisted(page,theme,state);await close(page);
        for(const edition of ['css','basic','hybrid','svg']){await page.locator(`.edition-nav a[href="/revision-2/${edition}/"]`).click();await ready(page);assert.deepEqual(await readState(page,'#gallery'),state);await page.reload();await ready(page);await open(page,0);assert.deepEqual(await readState(page),state);await close(page);}
        return {editions:4,storageKey:key,state};
      } finally {await context.close();}
    });
  } finally {await browser.close();await saveSummary();}
}
summary.finishedAt=new Date().toISOString();await saveSummary();
console.log(JSON.stringify({summary:shortPath(artifact('summary.json')),counts:summary.counts,failures:summary.checks.filter(c=>!c.ok).map(({scope,name,error})=>({scope,name,error}))},null,2));
process.exitCode=summary.counts.failed?1:0;
