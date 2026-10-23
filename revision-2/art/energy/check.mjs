// Technique and integration-contract checks; deliberately not a performance benchmark.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import sharp from 'sharp';
import {svgArt,cssArt,basicArt,cssStyles,basicStyles} from './index.mjs';
const themes=['frost','blaze','volt','silvah'];
const violations=[];
const assertRecord=(record,name)=>assert.deepEqual(Object.keys(record).sort(),themes.toSorted(),`${name} keys`);
assertRecord(svgArt,'svgArt');assertRecord(cssArt,'cssArt');assertRecord(basicArt,'basicArt');
assert(!/\b(?:clip(?:-path)?|mask(?:-[\w-]+)?|border-shape)\s*:|\b(?:polygon|path|shape)\s*\(|url\s*\(|data:/i.test(basicStyles),'Basic style vocabulary');
assert(!/url\s*\(|data:/i.test(cssStyles),'CSS styles contain no external/encoded images');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:304,height:384},deviceScaleFactor:1});
const reports=[];
for(const [edition,art,styles,limit] of [['svg',svgArt,'',Infinity],['css',cssArt,cssStyles,180],['basic',basicArt,basicStyles,200]]) {
  for(const theme of themes) {
    const markup=art[theme];
    assert(!/<(?:text|image|img|canvas|foreignObject)\b|(?:https?:)?\/\/(?!www\.w3\.org\/2000\/svg)/i.test(markup),`${edition}/${theme} resource and label tags`);
    if(edition==='svg') {
      assert(/^<svg\b/.test(markup.trim()),`${theme} complete svg`);
      assert(/\bxmlns=['"]http:\/\/www\.w3\.org\/2000\/svg['"]/.test(markup),`${theme} xmlns`);
      assert(/\bviewBox=['"]0 0 300 380['"]/.test(markup),`${theme} viewBox`);
    } else {
      assert(/^<div\b/.test(markup.trim()),`${theme} div root`);
      assert(!/url\s*\(|data:|<(?:svg|style|script)\b/i.test(markup),`${edition}/${theme} native CSS only`);
      if(edition==='basic') assert(!/\b(?:clip(?:-path)?|mask(?:-[\w-]+)?|border-shape)\s*:|\b(?:polygon|path|shape)\s*\(/i.test(markup),`${theme} basic markup vocabulary`);
    }
    await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}#sandbox{width:300px;height:380px}#sandbox>svg{display:block;width:300px;height:380px}${styles}</style><div id="sandbox">${markup}</div>`);
    const audit=await page.evaluate(({edition,theme})=>{
      const root=document.querySelector('#sandbox').firstElementChild;
      const nodes=[root,...root.querySelectorAll('*')], problems=[];
      const tags=[...new Set(nodes.map(el=>el.localName))];
      if(edition!=='svg'&&(!root.classList.contains('r2-art')||!root.classList.contains('r2-energy')||!root.classList.contains(theme))) problems.push('Root classes');
      if(edition==='basic'&&tags.some(t=>!['div','span','i','b'].includes(t)))problems.push('Non-basic tag');
      if(root.textContent.trim())problems.push('Artwork contains text');
      if(edition==='svg') {
        const parsed=new DOMParser().parseFromString(root.outerHTML,'image/svg+xml');
        if(parsed.querySelector('parsererror'))problems.push('SVG XML parse error');
        const ids=new Set(nodes.filter(el=>el.id).map(el=>el.id));
        for(const match of root.outerHTML.matchAll(/url\(#([^)]*)\)/g))if(!ids.has(match[1]))problems.push('Missing local SVG reference');
        if(root.querySelector('filter,animate,animateTransform,animateMotion,script,foreignObject'))problems.push('Expensive or active SVG feature');
      }
      if(edition!=='svg') for(const el of nodes) for(const pseudo of [null,'::before','::after']) {
        const cs=getComputedStyle(el,pseudo);
        if(/url\s*\(/i.test(cs.backgroundImage))problems.push('Image reference');
        if(cs.animationName!=='none')problems.push('Ambient animation');
        if(cs.filter!=='none')problems.push('Filter');
        if(edition==='basic'&&(cs.clipPath!=='none'||cs.maskImage!=='none'||!['','none'].includes(cs.getPropertyValue('border-shape'))))problems.push('Forbidden basic feature');
      }
      if(edition!=='svg') for(const sheet of document.styleSheets) for(const rule of sheet.cssRules) {
        if(rule.selectorText&&!rule.selectorText.includes('html')&&!rule.selectorText.includes('#sandbox')&&rule.selectorText.split(',').some(s=>!s.includes('.r2-energy')))problems.push('Unscoped selector');
      }
      return {edition,theme,elements:nodes.length,tags,problems:[...new Set(problems)]};
    },{edition,theme});
    if(audit.elements>limit)audit.problems.push(`Element budget ${audit.elements}/${limit}`);
    // A nontransparent perimeter catches decorative artwork accidentally cut by its artboard.
    const png=await page.locator('#sandbox').screenshot({omitBackground:true});
    const {data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let edgePixels=0;
    for(let x=0;x<info.width;x++) for(const y of [0,info.height-1]) if(data[(y*info.width+x)*4+3]>10)edgePixels++;
    for(let y=1;y<info.height-1;y++) for(const x of [0,info.width-1]) if(data[(y*info.width+x)*4+3]>10)edgePixels++;
    audit.nontransparentPerimeterPixels=edgePixels;
    if(edgePixels>0)audit.problems.push('Artwork touches artboard perimeter');
    if(audit.problems.length)violations.push({edition,theme,problems:audit.problems});
    reports.push(audit);
  }
}
await browser.close();
await writeFile(new URL('./checks.json',import.meta.url),JSON.stringify({reports,violations},null,2));
console.log(JSON.stringify({counts:reports.map(({edition,theme,elements,nontransparentPerimeterPixels})=>({edition,theme,elements,nontransparentPerimeterPixels})),violations},null,2));
assert.equal(violations.length,0,'Energy artwork constraint violations');
