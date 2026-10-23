// Private visual/contract check. Does not build the site or run benchmarks.
import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { svgArt, cssArt, basicArt, cssStyles, basicStyles } from './index.mjs';

const themes = ['rivera', 'drift', 'majestic', 'prism'];
const editions = { svg: svgArt, css: cssArt, basic: basicArt };
const out = name => fileURLToPath(new URL(name, import.meta.url));
const checks = [], report = { counts: {}, checks, overflow: [], clones: [], browserErrors: [] };
const check = (condition, label) => {
  checks.push({ label, pass: Boolean(condition) });
};

for (const [edition, art] of Object.entries(editions)) {
  check(Object.keys(art).sort().join() === [...themes].sort().join(), `${edition}: exact theme keys`);
  for (const theme of themes) {
    const value = art[theme];
    check(typeof value === 'string' && value.length > 0, `${edition}/${theme}: nonempty string`);
    check(!/<(?:img|image|canvas|text|foreignObject)\b|data:|base64|<script|\bon\w+\s*=/i.test(value), `${edition}/${theme}: no raster, text or script`);
    if (edition === 'svg') {
      check(/^\s*<svg\b/.test(value) && /xmlns=['"]http:\/\/www\.w3\.org\/2000\/svg['"]/.test(value) && /viewBox=['"]0 0 300 380['"]/.test(value), `svg/${theme}: standalone 300×380 viewBox`);
      check(!/<filter\b|<animate|<set\b/i.test(value), `svg/${theme}: no filters or animation`);
    } else {
      const count = (value.match(/<(?:div|span|i|b)(?:\s|>)/g) ?? []).length;
      report.counts[`${edition}/${theme}`] = count;
      check(count <= 220, `${edition}/${theme}: element budget (${count})`);
      check(!/<\/?(?!div\b|span\b|i\b|b\b)[a-z][\w-]*/i.test(value), `${edition}/${theme}: normal primitive tags only`);
      check(!/url\s*\(|<svg|<canvas|<img/i.test(value), `${edition}/${theme}: no image source`);
      check(/class=['"][^'"]*\br2-art\b/.test(value) && /class=['"][^'"]*\br2-expressive\b/.test(value), `${edition}/${theme}: scoped root classes`);
      check(!/>\s*[^<\s][^<]*</.test(value), `${edition}/${theme}: no baked text`);
    }
  }
}
check(!/url\s*\(|@import|@font-face|animation\s*:|filter\s*:/i.test(cssStyles + basicStyles), 'Styles: no image/font dependencies, filters or animation');
check(!/(?:clip(?:-path)?|mask(?:-image)?|shape(?:-outside)?|border-shape)\s*:|\b(?:polygon|path|shape|url)\s*\(|<svg|<canvas|<img/i.test(basicStyles + Object.values(basicArt).join('')), 'Basic: no clipped, masked, vector or image primitives');

const font = await readFile(new URL('../../../assets/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2_3E.woff2', import.meta.url));
const previewStyle = `@font-face{font-family:Review;src:url(data:font/woff2;base64,${font.toString('base64')})}*{box-sizing:border-box}body{margin:0;background:#0b0d12;color:#e7e9ef;font-family:Review,sans-serif}main{padding:20px 24px;width:1390px}.review-row{display:grid;grid-template-columns:repeat(4,320px);gap:20px;margin:12px 0 30px}h2{margin:0;font:600 15px sans-serif;letter-spacing:2px;color:#9ba6bc;text-transform:uppercase}.review-card{width:320px;height:400px;position:relative}.review-canvas{position:absolute;left:10px;top:10px;width:300px;height:380px}.review-canvas>svg{width:300px;height:380px;display:block}.review-fields{position:absolute;inset:0;pointer-events:none;color:#f3efff;text-shadow:0 1px 4px #000}.review-fields>*{position:absolute}.review-rating{left:32px;top:41px;font-size:46px;line-height:1}.review-position{left:34px;top:88px;font-size:24px;line-height:1}.review-name{left:32px;right:27px;top:235px;height:31px;text-align:center;line-height:31px;font-size:24px;letter-spacing:3px}.review-country{left:91px;top:276px;width:38px;height:24px;box-shadow:0 0 0 1px #ffffff60}.review-country.rivera{background:linear-gradient(#009b3a,#009b3a)}.review-country.rivera:before{content:'';position:absolute;left:8px;top:2px;width:22px;height:20px;background:#fddd28;transform:scaleY(.75) rotate(45deg)}.review-country.rivera:after{content:'';position:absolute;left:12px;top:6px;width:14px;height:12px;background:#123681;border-radius:50%}.review-country.drift{background:linear-gradient(#ad2036 33.3%,#fff 33.3% 66.6%,#1e3f83 66.6%)}.review-country.majestic{background:linear-gradient(#7bc4ee 33.3%,#fff 33.3% 66.6%,#7bc4ee 66.6%)}.review-country.majestic:after{content:'';position:absolute;left:17px;top:10px;width:4px;height:4px;background:#e8ba41;border-radius:50%}.review-country.prism{background:repeating-linear-gradient(#fff 0 2.7px,#68a6e8 2.7px 5.4px)}.review-country.prism:after{content:'';position:absolute;left:1px;top:1px;width:13px;height:10px;background:radial-gradient(circle,#d6ac2e 0 2px,#fff 2.5px)}.review-stats{left:29px;top:311px;display:grid;grid-template-columns:repeat(6,40.7px);width:244px;text-align:center}.review-stat-label{display:block;font-size:12px;line-height:19px}.review-stat-value{display:block;font-size:21px;line-height:23px}.review-rivera{color:#fff098}.art-capture{width:340px;height:420px;position:relative;background:transparent}.art-capture>.review-canvas{left:20px;top:20px}.art-only .review-fields{display:none}`;
const data = {
  rivera: ['89','CM',[84,83,91,88,78,85]], drift: ['88','LW',[95,85,80,90,50,78]],
  majestic: ['96','ST',[93,97,89,94,48,87]], prism: ['93','CF',[91,92,88,94,66,80]],
};
const metadata = theme => `<div class="review-fields review-${theme}"><b class="review-rating">${data[theme][0]}</b><b class="review-position">${data[theme][1]}</b><b class="review-name">${theme.toUpperCase()}</b><i class="review-country ${theme}"></i><div class="review-stats">${['PAC','SHO','PAS','DRI','DEF','PHY'].map((label,i)=>`<span><span class="review-stat-label">${label}</span><span class="review-stat-value">${data[theme][2][i]}</span></span>`).join('')}</div></div>`;
const head = `<meta charset="utf-8"><title>Expressive Revision 2 private artwork review</title><style>${previewStyle}</style><style data-art="css">${cssStyles}</style><style data-art="basic">${basicStyles}</style>`;
const gallery = Object.entries(editions).map(([edition,art])=>`<section><h2>${edition} · expressive revision 2</h2><div class="review-row">${themes.map(theme=>`<article class="review-card" data-edition="${edition}" data-theme="${theme}"><div class="review-canvas">${art[theme]}${metadata(theme)}</div></article>`).join('')}</div></section>`).join('');
const html = `<!doctype html><html><head>${head}</head><body><main>${gallery}</main></body></html>`;
await writeFile(out('preview.html'), html);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1390, height: 1370 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => report.browserErrors.push(e.message));
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const dom = await page.evaluate(() => {
    const failures = [], counts = {}, rules = [];
    for (const style of document.querySelectorAll('style[data-art]')) {
      for (const rule of style.sheet.cssRules) if (rule.selectorText && rule.selectorText.split(',').some(s=>!s.includes('.r2-expressive'))) rules.push(rule.selectorText);
    }
    for (const card of document.querySelectorAll('.review-card')) {
      const key = `${card.dataset.edition}/${card.dataset.theme}`, root = card.querySelector('.r2-art,svg');
      counts[key] = { elements: root.querySelectorAll('*').length + 1, painted: root.matches('svg') ? root.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon,use').length : root.querySelectorAll('*').length + 1 };
      if (root.matches('svg')) {
        const parsed = new DOMParser().parseFromString(root.outerHTML, 'image/svg+xml');
        if (parsed.querySelector('parsererror')) failures.push(key + ': XML parse error');
        const ids = [...root.querySelectorAll('[id]')].map(node=>node.id);
        const repeated = ids.filter((id,i)=>ids.indexOf(id)!==i);
        if (repeated.length) failures.push(key + ': duplicate SVG IDs ' + repeated.join(', '));
        for (const node of root.querySelectorAll('*')) for (const attribute of node.attributes) {
          for (const match of attribute.value.matchAll(/url\(#([^)]*)\)/g)) if (!ids.includes(match[1])) failures.push(key + ': unresolved SVG ID ' + match[1]);
        }
        const b = root.getBoundingClientRect();
        if (b.width !== 300 || b.height !== 380) failures.push(key + ': bad SVG size');
      } else {
        const b = root.getBoundingClientRect();
        if (b.width !== 300 || b.height !== 380) failures.push(key + `: bad root size ${b.width}×${b.height}`);
        for (const node of [root,...root.querySelectorAll('*')]) for (const pseudo of [null,'::before','::after']) {
          const s = getComputedStyle(node,pseudo), name = key + ':' + node.className + (pseudo??'');
          if (/url\(/i.test(s.backgroundImage) || /url\(/i.test(s.maskImage)) failures.push(name + ': image URL');
          if (s.filter !== 'none' || s.backdropFilter !== 'none') failures.push(name + ': filter');
          if (s.animationName !== 'none') failures.push(name + ': animation');
          if (card.dataset.edition==='basic' && (s.clipPath!=='none'||s.maskImage!=='none'||(s.getPropertyValue('border-shape') && s.getPropertyValue('border-shape')!=='none'))) failures.push(name + ': forbidden basic primitive');
        }
      }
    }
    return { failures, counts, unscopedRules: rules };
  });
  report.dom = dom;
  check(!dom.unscopedRules.length, 'Styles: every selector scoped to .r2-expressive');
  check(!dom.failures.length, `Browser: technique and dimensions check (${dom.failures.join('; ')})`);
  check(!report.browserErrors.length, 'Browser: no page errors');
  await page.screenshot({ path: out('preview-with-fields.png'), fullPage: true });
  await page.evaluate(() => document.body.classList.add('art-only'));
  await page.screenshot({ path: out('preview-art-only.png'), fullPage: true });
  for (const [edition, art] of Object.entries(editions)) for (const theme of themes) {
    await page.setContent(`<!doctype html><html><head>${head}<style>body{background:transparent}</style></head><body><div class="art-capture"><div class="review-canvas">${art[theme]}</div></div></body></html>`);
    const bytes = await page.locator('.art-capture').screenshot({ omitBackground: true });
    const { data: pixels, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let outside = 0, alphaMax = 0, outsideBounds = [Infinity,Infinity,-Infinity,-Infinity];
    for (let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) if(x<20||x>=320||y<20||y>=400) {
      const a=pixels[(y*info.width+x)*4+3]; if(a>8) { outside++; outsideBounds=[Math.min(outsideBounds[0],x-20),Math.min(outsideBounds[1],y-20),Math.max(outsideBounds[2],x-20),Math.max(outsideBounds[3],y-20)]; } alphaMax=Math.max(alphaMax,a);
    }
    report.overflow.push({ edition, theme, paintedPixelsOutsideFrame: outside, maxAlphaOutsideFrame: alphaMax, outsideBounds:outside?outsideBounds:null });
    await sharp(bytes).extract({left:20,top:20,width:300,height:380}).png().toFile(out(`${edition}-${theme}.png`));
    if (edition==='svg') {
      const cloneAudit = await page.evaluate(theme=>{
        const original=document.querySelector('.review-canvas>svg'), clone=original.cloneNode(true);
        const ids=new Map([...clone.querySelectorAll('[id]')].map(node=>[node.id,`detail-clone-${theme}-${node.id}`]));
        const missing=[];
        for(const node of [clone,...clone.querySelectorAll('*')]) {
          if(node.id)node.id=ids.get(node.id);
          for(const attr of [...node.attributes]) if(attr.name!=='id') {
            let value=attr.value.replace(/url\(#([^)]*)\)/g,(_match,id)=>{if(!ids.has(id))missing.push(id);return `url(#${ids.get(id)})`;});
            if(/^(?:href|xlink:href)$/.test(attr.name)&&value.startsWith('#'))value='#'+ids.get(value.slice(1));
            if(value!==attr.value)node.setAttribute(attr.name,value);
          }
        }
        const wrapper=document.createElement('div');wrapper.className='clone-canvas';wrapper.style.cssText='position:absolute;left:360px;top:20px;width:300px;height:380px';clone.style.display='block';wrapper.append(clone);document.body.append(wrapper);
        const allIds=[...document.querySelectorAll('[id]')].map(n=>n.id);
        return {theme,ids:ids.size,missing,uniqueDocumentIds:new Set(allIds).size===allIds.length};
      },theme);
      const originalPixels=await sharp(await page.locator('.review-canvas>svg').screenshot({omitBackground:true})).ensureAlpha().raw().toBuffer();
      // Render at the same screen origin so gradient dithering and subpixel
      // antialiasing do not create a false difference between independent IDs.
      await page.evaluate(()=>{document.querySelector('.review-canvas>svg').style.visibility='hidden';document.querySelector('.clone-canvas').style.left='20px';});
      const clonePixels=await sharp(await page.locator('.clone-canvas>svg').screenshot({omitBackground:true})).ensureAlpha().raw().toBuffer();
      report.clones.push({...cloneAudit,pixelIdentical:originalPixels.equals(clonePixels)});
    }
  }
  check(report.overflow.every(v=>v.paintedPixelsOutsideFrame===0), 'All painted artwork contained within 300×380');
  check(report.clones.every(v=>v.uniqueDocumentIds&&!v.missing.length&&v.pixelIdentical), 'SVG editor clones: prefixed IDs resolve independently and render pixel-identically');
} finally {
  await browser.close();
  await writeFile(out('validation.json'), JSON.stringify(report,null,2));
}
console.log(JSON.stringify({ counts: report.dom?.counts, overflow: report.overflow, checks: checks.length, failed: checks.filter(v=>!v.pass), browserErrors: report.browserErrors },null,2));
assert(checks.every(v=>v.pass), `Artwork contract checks failed: ${checks.filter(v=>!v.pass).map(v=>v.label).join('; ')}`);
