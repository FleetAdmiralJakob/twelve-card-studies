import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { basicArt, basicStyles } from './basic-art.mjs';

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:#14161d}body{padding:28px;display:flex;gap:20px}
.study{position:relative;flex:0 0 300px;width:300px;height:380px}
${basicStyles}</style>${Object.values(basicArt).map(art => `<section class="study">${art}</section>`).join('')}`;
await writeFile(new URL('./basic-preview.html', import.meta.url), html);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1316, height: 436 }, deviceScaleFactor: 2 });
  await page.route('**/*', route => route.abort());
  await page.setContent(html);
  const report = await page.evaluate(() => [...document.querySelectorAll('.r2-art')].map(root => {
    const r = root.getBoundingClientRect();
    const nodes = [...root.querySelectorAll('*')];
    const outside = nodes.flatMap(node => {
      const n = node.getBoundingClientRect();
      if (n.left >= r.left - .05 && n.top >= r.top - .05 && n.right <= r.right + .05 && n.bottom <= r.bottom + .05) return [];
      return [{ class: node.className, bounds: [n.left-r.left,n.top-r.top,n.right-r.left,n.bottom-r.top].map(v=>+v.toFixed(2)) }];
    });
    return { theme: root.classList[3], elements: nodes.length + 1, size: [r.width,r.height], outside };
  }));
  await page.screenshot({ path: fileURLToPath(new URL('./basic-preview.png', import.meta.url)) });
  console.log(JSON.stringify(report,null,2));
  if (report.some(item => item.outside.length || item.elements > 200 || item.size[0] !== 300 || item.size[1] !== 380)) process.exitCode = 1;
} finally {
  await browser.close();
}
