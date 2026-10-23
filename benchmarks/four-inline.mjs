import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = JSON.parse(await readFile('benchmarks/four-combined.json', 'utf8'));
const median = a => { const b = a.filter(Number.isFinite).sort((x,y)=>x-y); return b.length ? (b[Math.floor((b.length-1)/2)] + b[Math.ceil((b.length-1)/2)])/2 : null; };
const stats = a => ({median:median(a),min:Math.min(...a),max:Math.max(...a)});
const data = {};
for (const engine of ['main','webkit']) {
  data[engine] = {};
  for (const profile of ['desktop','mobile']) {
    data[engine][profile] = source.editions.map(e => {
      const runs = source[engine].runs.filter(r=>r.edition===e.id && r.profile===profile);
      return {id:e.id,route:e.route,fcp:stats(runs.map(r=>r.load.fcp)),open:stats(runs.map(r=>r.dialogTwoFrame.p95)),cold:stats(runs.map(r=>r.network.cold.encodedBodyBytes/1024))};
    });
  }
}
const img = file => resolve(file).replaceAll('\\','/');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}html,body{margin:0;background:transparent;color:var(--foreground);font-family:var(--font-sans,system-ui)}button,select,a{font:inherit}button,select{color:inherit;background:var(--secondary);border:1px solid var(--border);border-radius:7px;padding:8px 12px;min-height:38px}button{cursor:pointer}button[aria-pressed=true]{background:var(--primary);color:var(--primary-foreground);border-color:var(--primary)}a{color:var(--foreground);text-underline-offset:4px}a:focus-visible,button:focus-visible,select:focus-visible{outline:2px solid var(--ring);outline-offset:3px}.image-controls{display:flex;align-items:center;gap:8px;margin:0 0 12px;flex-wrap:wrap}.image-controls span{color:var(--muted-foreground);font-size:12px;margin-left:auto}figure{margin:0}figure img{display:block;width:100%;height:auto;aspect-ratio:1080/792;object-fit:contain;border-radius:8px;background:#0d1012}figcaption{margin:9px 0 18px;font-size:12px;line-height:1.5;color:var(--muted-foreground)}.links{display:flex;gap:12px 20px;flex-wrap:wrap;margin:0 0 24px;font-size:13px}.links a:first-child{font-weight:650}.controls{display:flex;flex-wrap:wrap;gap:14px;margin:12px 0}label{display:flex;gap:6px;flex-direction:column;font-size:11px;color:var(--muted-foreground)}select{font-size:13px;min-width:150px;color:var(--foreground)}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:13px}thead th{font-weight:500;font-size:11px;color:var(--muted-foreground);line-height:1.5}th,td{text-align:right;padding:12px 5px;border-bottom:1px solid var(--border);font-variant-numeric:tabular-nums}th:first-child,td:first-child{text-align:left;padding-left:0;width:31%}tbody th{font-weight:500}tbody tr:last-child th{color:var(--accent-foreground)}.range{display:block;font-size:10px;color:var(--muted-foreground);margin-top:4px}.intro{font-size:14px;line-height:1.6;margin:0 0 14px}.method{font-size:12px;line-height:1.6;color:var(--muted-foreground);margin:12px 0 0}.status{font-size:12px;line-height:1.6;margin-top:18px;color:var(--muted-foreground)}strong{color:var(--foreground)}@media(max-width:420px){th,td{font-size:11px;padding:11px 3px}.range{font-size:9px}.image-controls span{width:100%;margin:0}select{min-width:145px}.links{gap:12px 16px}}
</style></head><body>
<div class="image-controls" role="group" aria-label="Compare the artwork"><button id="show-hybrid" aria-pressed="true">V4 · Website</button><button id="show-reference" aria-pressed="false">Original reference</button><span>Same twelve cards · preserved proportions</span></div>
<figure><img id="art" src="${img('benchmarks/screenshots/chromium-hybrid-desktop.png')}" alt="The fourth website edition showing twelve illustrated football cards"><figcaption id="caption">Actual browser capture of V4. The fields and flags are separate from the illustrated frames.</figcaption></figure>
<nav class="links" aria-label="Website links"><a href="http://jakobs-pc.taile7e918.ts.net:8787/hybrid/" target="_blank" rel="noopener">Open V4 ↗</a><a href="http://jakobs-pc.taile7e918.ts.net:8787/compare/" target="_blank" rel="noopener">Full benchmark report ↗</a><a href="http://jakobs-pc.taile7e918.ts.net:8787/source/hybrid" target="_blank" rel="noopener">Download website ZIP ↓</a></nav>
<p class="intro">V4 combines detailed artwork with editable names, ratings, positions, stats and country flags. Changes are saved locally; each card exports as a transparent PNG. All three earlier editions remain available.</p>
<div class="controls"><label>Browser engine<select id="engine"><option value="main">Microsoft Edge</option><option value="webkit">Windows WebKit</option></select></label><label>Viewport<select id="profile"><option value="desktop">Desktop · 1080 × 792</option><option value="mobile">Mobile · 390 × 844</option></select></label></div>
<table><thead><tr><th scope="col">Edition</th><th scope="col">First paint<br>ms ↓</th><th scope="col">Card open<br>p95 · ms ↓</th><th scope="col">Cold load<br>KiB ↓</th></tr></thead><tbody id="rows"></tbody></table>
<p class="method">Median of four runs; smaller text shows the min–max range. Cold load includes all requested artwork and fonts. Card open measures two animation frames after opening, not INP. 64 runs total on Windows, unthrottled and headless; WebKit is not a MacBook Safari test, and mobile is a viewport test.</p>
<p class="method"><strong>Tradeoffs:</strong> V4 downloads more data. Its Windows WebKit mobile scrolling varied in the main batch; 16 additional runs found no consistent benefit from three CSS optimizations. Both datasets are retained in the full report.</p>
<p class="status"><strong>Verified:</strong> all 12 card exports, editing, persistence, resets and layout checks passed in Chromium and WebKit. The live files match the measured builds. V4 is an illustrated interpretation, not a pixel-identical copy.</p>
<script>
const DATA=${JSON.stringify(data)};
const art=document.getElementById('art'), caption=document.getElementById('caption');
const shots={hybrid:${JSON.stringify(img('benchmarks/screenshots/chromium-hybrid-desktop.png'))},reference:${JSON.stringify(img('assets/reference.png'))}};
for(const key of ['hybrid','reference'])document.getElementById('show-'+key).addEventListener('click',()=>{art.src=shots[key];art.alt=key==='hybrid'?'Actual fourth-edition website capture':'Original twelve-card reference supplied by the user';caption.textContent=key==='hybrid'?'Actual browser capture of V4. The fields and flags are separate from the illustrated frames.':'Original reference. Compare the individual drawings, frames, typography and spacing.';for(const other of ['hybrid','reference'])document.getElementById('show-'+other).setAttribute('aria-pressed',String(other===key));});
const labels={svg:'V1 · SVG + CSS',css:'V2 · CSS polygons',basic:'V3 · CSS primitives',hybrid:'V4 · Hybrid'};
const format=n=>n.toLocaleString('en-US',{maximumFractionDigits:1});
const cell=s=>'<td>'+format(s.median)+'<span class="range">'+format(s.min)+'–'+format(s.max)+'</span></td>';
function render(){document.getElementById('rows').innerHTML=DATA[document.getElementById('engine').value][document.getElementById('profile').value].map(r=>'<tr><th scope="row"><a href="http://jakobs-pc.taile7e918.ts.net:8787'+r.route+'" target="_blank" rel="noopener">'+labels[r.id]+'</a></th>'+cell(r.fcp)+cell(r.open)+cell(r.cold)+'</tr>').join('');}
document.getElementById('engine').addEventListener('change',render);document.getElementById('profile').addEventListener('change',render);render();
</script></body></html>`;
await writeFile('benchmarks/four-inline.html',html);
console.log(JSON.stringify(data));
