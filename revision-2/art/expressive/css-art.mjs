import { prismSurface, riveraGrid, royalShards, graffiti } from './surfaces.mjs';
import { figure as renderFigure } from './figures.mjs';
// Original, authored CSS artwork. Coordinates are in the full 300 × 380 card.
// Authored curves use native CSS path() shapes; straight facets use polygons.
// All texture is deterministic. Nothing animates and no filter is required.
const N = n => Number(n.toFixed(2));
const rand = seed => () => ((seed = Math.imul(1664525, seed) + 1013904223 >>> 0) / 4294967296);
const node = (name, style, content = '') => `<i class="ec-${name}" style="${style}">${content}</i>`;
const box = (name, x, y, w, h, fill, extra = '') => node(name, `left:${N(x)}px;top:${N(y)}px;width:${N(w)}px;height:${N(h)}px;background:${fill};${extra}`);
function polygon(name, points, fill, extra = '') {
  const x = Math.min(...points.map(p => p[0])), y = Math.min(...points.map(p => p[1]));
  const w = Math.max(...points.map(p => p[0])) - x, h = Math.max(...points.map(p => p[1])) - y;
  return box(name, x, y, w, h, fill, `clip-path:polygon(${points.map(p => `${N(p[0] - x)}px ${N(p[1] - y)}px`).join(',')});${extra}`);
}
// A cubic contour is sampled into an authored, smooth CSS polygon (not a path asset).
function curve(start, segments, steps = 9) {
  const points = [start]; let from = start;
  for (const [a, b, end] of segments) {
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      points.push([u*u*u*from[0] + 3*u*u*t*a[0] + 3*u*t*t*b[0] + t*t*t*end[0], u*u*u*from[1] + 3*u*u*t*a[1] + 3*u*t*t*b[1] + t*t*t*end[1]]);
    }
    from = end;
  }
  return points;
}
function stroke(name, pts, width, fill, extra = '') {
  const edges = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const dx = -(b[1] - a[1]) / len * width / 2, dy = (b[0] - a[0]) / len * width / 2;
    return [[p[0] + dx, p[1] + dy], [p[0] - dx, p[1] - dy]];
  });
  return polygon(name, [...edges.map(p => p[0]), ...edges.map(p => p[1]).reverse()], fill, extra);
}
const ink = (name, start, segments, width, fill, extra = '') => stroke(name, curve(start, segments), width, fill, extra);
const segment = (name, a, b, width, fill, extra = '') => stroke(name, [a, b], width, fill, extra);
const ellipse = (name, x, y, w, h, fill, extra = '') => box(name, x, y, w, h, fill, `border-radius:50%;${extra}`);
function star(name, x, y, size, fill, points = 4, inner = .18, extra = '') {
  return polygon(name, Array.from({length: points * 2}, (_, i) => {
    const a = Math.PI * i / points - Math.PI / 2, r = i % 2 ? size * inner : size;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r];
  }), fill, extra);
}
function speckle(name, seed, count, bounds, colors, size = .7) {
  const r = rand(seed), [x, y, w, h] = bounds;
  const marks = Array.from({length: count}, (_, i) => `${N(r() * (w - 2))}px ${N(r() * (h - 2))}px 0 ${N(r() * size * .45)}px ${colors[i % colors.length]}`);
  return box(name, x + 1, y + 1, size, size, 'transparent', `border-radius:50%;box-shadow:${marks.join(',')};`);
}
const close = p => [...p, p[0]];
const scalePoints = (p, sx, sy = sx, cx = 150, cy = 190) => p.map(([x,y]) => [cx + (x-cx)*sx, cy + (y-cy)*sy]);
function hairLocks(offsetX = 0, offsetY = 0, profile = false) {
  const locks = profile ? [[154,65],[159,60],[166,58],[175,58],[184,61],[151,74],[158,70],[166,65],[174,65],[161,77]]
    : [[152,68],[157,62],[164,60],[173,59],[182,62],[190,69],[151,77],[159,73],[167,68],[176,69],[185,76],[156,84],[164,81],[173,78],[181,86],[168,90]];
  return locks.map(([x,y],i)=>ink('hair-lock',[x+offsetX,y+offsetY],[[[x+offsetX-1,y+offsetY-4],[x+offsetX+5,y+offsetY-4],[x+offsetX+5,y+offsetY-1]]],i%3===0?.65:.45,profile?'#9dd4f17c':i%3?'#89bbd14a':'#c5dbf07c')).join('');
}
const shell = curve([16, 49], [
  [[35,41],[79,24],[115,16]], [[121,29],[136,29],[150,9]], [[164,29],[179,29],[185,16]],
  [[221,24],[265,41],[284,49]], [[283,132],[287,263],[282,337]], [[280,354],[243,357],[210,361]],
  [[180,364],[163,370],[150,377]], [[137,370],[120,364],[90,361]], [[57,357],[20,354],[18,337]],
  [[13,263],[17,132],[16,49]]
], 7);
const innerShell = scalePoints(shell, .952, .97);
function root(theme, content) {
  return `<div class="r2-art r2-expressive r2-expressive-css ${theme} r2-theme-${theme}" aria-hidden="true">${content}</div>`;
}
function darkFields(theme, shade) {
  return polygon('fields', [[24,225],[78,230],[125,232],[173,229],[225,230],[277,226],[277,337],[259,349],[205,354],[150,370],[93,354],[41,347],[24,336]], `linear-gradient(180deg,transparent,${shade} 24%,${shade} 87%,transparent)`)
    + polygon('name-ribbon', [[34,239],[102,234],[198,234],[267,239],[263,263],[202,268],[100,268],[37,263]], `linear-gradient(90deg,transparent,${shade} 15%,${shade} 85%,transparent)`)
    + segment('field-rule', [34,307], [267,307], .55, theme === 'majestic' ? '#dcb56d80' : theme === 'drift' ? '#d9d7cc38' : '#94dcff45');
}
function rawCrest(theme) {
  const edge = [[185,279],[194,279],[201.5,277],[209,279],[218,279],[215,301],[201.5,313],[188,301]];
  const color = {rivera:'#43efff', drift:'#e8ece7', majestic:'#f7dfa9', prism:'#bcf4ff'}[theme];
  let c = polygon('crest-edge', edge, theme === 'rivera' ? 'linear-gradient(140deg,#23ffff,#7e63ff 48%,#ff4fd7)' : theme === 'prism' ? 'linear-gradient(130deg,#fff,#69baff 45%,#f4acff 72%,#fff)' : color);
  c += polygon('crest-inset', scalePoints(edge, .88, .88, 201.5, 293), '#090e21');
  if (theme === 'rivera') {
    c += ink('crest-palm', [200,306], [[[204,296],[199,288],[202,286]]], 1.5, color);
    c += polygon('crest-fronds', [[201,285],[194,283],[190,287],[197,286],[192,292],[199,288],[199,297],[202,289],[206,295],[205,288],[213,291],[210,285],[204,283]], color);
    c += ink('crest-orbit', [190,298], [[[194,309],[209,309],[213,296]]], .6, '#e373ff');
  } else if (theme === 'drift') {
    c += polygon('crest-crown', [[192,285],[196,288],[199,282],[203,288],[210,283],[207,291],[195,292]], '#f3e343');
    c += ink('crest-swipe', [191,301], [[[206,282],[211,290],[197,306]],[[197,300],[202,296],[212,297]]], 1.35, color);
    c += segment('crest-scratch', [198,293], [203,307], 1.3, color);
    c += segment('crest-scratch', [207,292], [198,303], .8, color);
  } else if (theme === 'majestic') {
    c += star('crest-star-edge', 201.5, 294, 13, color, 5, .48);
    c += star('crest-star-inset', 201.5, 294, 9.5, '#251142', 5, .48);
    c += star('crest-star-core', 201.5, 294, 6, '#dcc6ff', 4, .28);
    c += ellipse('crest-gem', 200,292.5,3,3,'#fff8cf');
  } else {
    c += polygon('crest-crystal', [[192,287],[210,287],[214,293],[201,308],[189,293]], '#cdf9ff');
    c += polygon('crest-facet', [[192,287],[199,291],[195,294],[201,308],[189,293]], '#286197');
    c += polygon('crest-facet', [[199,291],[205,287],[208,293],[201,308]], '#99b9ff');
    c += polygon('crest-facet', [[208,293],[214,293],[201,308]], '#e5b4fb');
    c += segment('crest-cut', [189,293], [214,293], .65, '#fff');
  }
  return c;
}
function palm(x, y, height, spread, color, light) {
  let p = ink('palm-trunk', [x-5, y+height], [[[x+2,y+height*.65],[x-3,y+height*.24],[x,y]]], 3.3, color);
  const leaves = [
    [[0,0],[-.25,-.23],[-.72,-.25],[-1,-.02],[-.65,-.09],[-.4,-.04]],
    [[0,0],[-.25,-.4],[-.6,-.6],[-.86,-.47],[-.57,-.34],[-.3,-.11]],
    [[0,0],[-.07,-.43],[.03,-.66],[.23,-.69],[.09,-.41],[.08,-.1]],
    [[0,0],[.32,-.39],[.68,-.42],[.97,-.23],[.61,-.23],[.24,-.05]],
    [[0,0],[.36,-.12],[.75,.03],[.91,.3],[.57,.15],[.19,.08]],
    [[0,0],[-.26,.06],[-.54,.35],[-.53,.62],[-.35,.31],[-.08,.1]]
  ];
  for (const l of leaves) p += polygon('palm-frond', l.map(([px,py]) => [x+px*spread,y+py*spread]), color);
  return p + ink('palm-rim', [x-5,y+height], [[[x,y+height*.5],[x-2,y+5],[x,y]]], .65, light);
}
const backHair = [[145,85],[143,76],[146,72],[145,66],[150,64],[150,60],[155,60],[158,55],[163,57],[168,53],[172,55],[177,53],[180,57],[186,56],[188,61],[193,62],[193,67],[197,70],[195,75],[198,79],[195,84],[195,92],[191,102],[186,108],[182,115],[169,119],[157,113],[151,104],[147,99]];
function backHead(theme) {
  const violet = theme === 'majestic';
  const rim = violet ? '#edd3ff' : '#5efbff', other = violet ? '#a664ff' : '#fc52da';
  let h = polygon('neck', [[157,105],[185,103],[184,121],[196,131],[178,145],[149,130],[158,122]], violet ? 'linear-gradient(105deg,#100e1e,#070812 55%,#9c5cd3)' : 'linear-gradient(100deg,#17324a,#090b21 45%,#b438b9)');
  h += polygon('neck-light', [[181,111],[185,105],[183,122],[192,130],[179,134],[176,125]], `linear-gradient(120deg,transparent,${other}99)`);
  h += polygon('head-rim', backHair, `linear-gradient(110deg,${rim},#101d38 27%,#06091a 60%,${other})`);
  h += polygon('head', scalePoints(backHair,.958,.97,171,85), violet ? 'radial-gradient(ellipse at 23% 21%,#252339,#11101e 43%,#060711 82%)' : 'radial-gradient(ellipse at 22% 15%,#16394d,#0d1730 42%,#070a19 80%)');
  h += polygon('nape', [[153,97],[160,104],[170,108],[185,104],[182,113],[171,119],[160,114]], 'linear-gradient(95deg,#101529,#050914 65%,#63305e)');
  h += ink('ear', [148,87], [[[143,84],[145,101],[152,103]],[[154,99],[149,95],[149,91]]], 1.45, violet ? '#b299d6' : '#478eb4');
  h += ink('nape-rim', [183,108], [[[181,117],[183,122],[188,125]]], .95, other);
  h += polygon('hair-grain', scalePoints(backHair,.91,.89,171,83), `radial-gradient(ellipse at 40% 55%,transparent 38%,${rim}15 45%,transparent 62%) 0 0/3px 4px,radial-gradient(ellipse,${other}15 .35px,transparent .8px) 0 0/5px 3px`);
  h += hairLocks();
  h += ink('hair-rim', [148,71], [[[157,50],[179,54],[190,64]]], .8, rim);
  return h;
}
function riveraFigure() { return renderFigure('rivera','css'); }
function rivera() {
  let a = stroke('neon-edge-halo',close(shell),4.1,'linear-gradient(130deg,#fb42db44,#59e7fb22,#df39e744)');
  a += polygon('neon-body', shell, 'linear-gradient(125deg,#e86bdf,#315db6 30%,#39ebdf 46%,#c435d4 70%,#f99ed8)');
  a += polygon('neon-interior', innerShell, 'linear-gradient(180deg,#221354,#621962 29%,#cb3d84 45%,#182654 61%,#070f2e 85%)');
  a += ellipse('sun-haze',91,29,187,188,'radial-gradient(ellipse,#ff5eb36b,transparent 70%)');
  a += ellipse('striped-sun',107,49,154,154,'linear-gradient(180deg,#fff68a,#ffd569 33%,#fd8a89 65%,#ff4abb)','mask-image:repeating-linear-gradient(180deg,#000 0 10px,transparent 10px 13px);');
  a += box('scan-sky',22,35,255,185,'repeating-linear-gradient(0deg,transparent 0 7px,#ff72da20 7px 7.65px)','clip-path:polygon(0 12%,35% 0,65% 0,100% 12%,100% 100%,0 100%);');
  a += polygon('distant-skyline', [[24,192],[24,177],[33,177],[33,171],[40,171],[40,186],[51,186],[51,175],[57,175],[57,195],[79,195],[79,183],[87,183],[87,175],[94,175],[94,191],[114,191],[114,183],[126,183],[126,195],[211,195],[211,177],[219,177],[219,168],[225,168],[225,184],[234,184],[234,174],[242,174],[242,164],[252,164],[252,188],[260,188],[260,179],[276,179],[276,223],[24,223]], '#171c48');
  a += box('skyline-windows',26,178,247,24,'repeating-linear-gradient(90deg,transparent 0 10px,#ff89c983 10px 11px,transparent 11px 17px)','mask-image:repeating-linear-gradient(0deg,#000 0 1px,transparent 1px 6px);');
  a += palm(59,151,71,29,'#15204d','#70d5ed');
  a += palm(256,124,87,30,'#161b46','#cd58bb');
  a += palm(34,194,38,17,'#0c2348','#0cabd5');
  a += polygon('grid-floor', [[22,214],[278,214],[278,338],[263,349],[207,356],[150,369],[90,355],[24,341]], 'linear-gradient(180deg,#18214b99,#071532)');
  for (const x of [24,58,95,150,205,243,276]) a += segment('grid-ray',[150,211],[x,357 - Math.abs(x-150)*.1],.8,'linear-gradient(180deg,#fb67df33,#44dbf8aa)');
  for (const [y, width] of [[220,.4],[230,.5],[245,.6],[266,.7],[293,.85],[328,.95],[350,.65]]) a += segment('grid-horizon',[24,y],[276,y],width,'#eb4ad575');
  a += segment('horizon', [23,213],[277,213],1.8,'#fe5cd2');
  a += riveraFigure();
  a += darkFields('rivera','#071026d9')+riveraGrid('css');
  a += polygon('rating-shade', [[25,51],[90,34],[96,115],[25,125]], 'linear-gradient(90deg,#181642dd,#26164b11)');
  a += speckle('neon-print', 8901, 120,[24,35,250,309],['#68dfff35','#fb79d52b'],.5);
  a += stroke('cyan-frame', close(scalePoints(shell,.973,.986)),1.2,'linear-gradient(30deg,#ff80de,#76fff7 42%,#ae76ff 70%,#5af7fa)');
  a += stroke('pink-frame', close(scalePoints(shell,.937,.958)),.9,'linear-gradient(35deg,#65e9ff,#fa5be1 47%,#e78ddc)');
  a += stroke('inner-frame', close(scalePoints(shell,.916,.945)),.55,'#bfa3f771');
  for (const [x,y,w,h] of [[13,98,5,22],[15,169,4,27],[16,270,4,19],[281,90,5,31],[281,223,5,18],[279,305,5,15]]) {
    a += box('chromatic-edge',x,y,w,h,'repeating-linear-gradient(0deg,#39edff 0 3px,#ff74c4 3px 5px,#f9ed6f 5px 6px,transparent 6px 8px)');
  }
  a += segment('top-prism', [33,42],[110,20],1.5,'#f5d75d');
  a += segment('top-prism', [192,21],[269,44],1.3,'#b5f3ed');
  a += segment('bottom-prism', [32,346],[142,371],1.1,'#ff8bdc');
  a += segment('bottom-prism', [158,371],[270,346],1.1,'#6fe9ff');
  for(const [p,c] of [
    [[[17,59],[32,43],[28,67]],'linear-gradient(160deg,#fd9ae3,#7751ae 50%,#52eef1)'],
    [[[17,146],[22,150],[16,172]],'#63f2e8'],
    [[[280,114],[288,137],[282,150]],'linear-gradient(80deg,#ff7ada,#9d61de,#65eafa)'],
    [[[279,326],[285,319],[277,344],[262,351]],'linear-gradient(120deg,#66f2fa,#c262e4,#ffb3dc)'],
    [[[35,350],[69,356],[54,356]],'#65fff4'],
    [[[214,363],[249,354],[238,361]],'#fa90e7']
  ])a+=polygon('edge-inlay',p,c);
  a+=speckle('frame-foil',8915,90,[18,58,4,272],['#edf58fbb','#9efff3a1','#f66fdcd9'],.8);
  a+=speckle('frame-foil',8916,90,[279,58,4,272],['#edf58fbb','#9efff3a1','#f66fdcd9'],.8);
  a += crest('rivera');
  return root('rivera', a);
}
function splat(seed, x, y, radius, color) {
  const r = rand(seed), points = [];
  for (let i=0;i<34;i++) {
    const angle = i/34*Math.PI*2, length = radius*(i%2 ? .25+r()*.35 : .68+r()*.32);
    points.push([x+Math.cos(angle)*length,y+Math.sin(angle)*length]);
  }
  return polygon('paint-impact',points,color);
}
function driftFigure() { return renderFigure('drift','css'); }
function drift() {
  let a = polygon('street-frame', shell, 'linear-gradient(110deg,#c2c6c8,#1c242d 26%,#f1f2e9 49%,#171d29 75%,#c7cac2)');
  a += polygon('street-board', innerShell, 'radial-gradient(ellipse at 61% 30%,#25242d,#090d13 62%,#080d13)');
  a += polygon('torn-paper', [[20,52],[58,36],[51,51],[24,67],[26,127],[17,117]], '#dee4dd');
  a += polygon('torn-paper', [[276,66],[285,72],[278,124],[285,126],[277,161],[272,150]], '#afbeb8');
  a += box('wall-scratches',23,39,253,306,'repeating-linear-gradient(107deg,transparent 0 13px,#cad7d008 13px 13.6px),repeating-linear-gradient(2deg,transparent 0 21px,#8c989408 21px 22px)','clip-path:polygon(0 5%,38% 0,64% 0,100% 6%,100% 98%,50% 100%,0 98%);');
  for (const [s,x,y,r,c] of [[1,44,181,34,'#05cce3'],[2,33,251,30,'#ee1b9e'],[3,249,142,35,'#f2ce19'],[4,268,238,27,'#e82c9f'],[5,259,293,25,'#1ccce8'],[6,70,349,24,'#ecc818'],[7,210,41,24,'#14d9ee'],[8,39,119,22,'#f4c914']]) a += splat(s,x,y,r,c);
  a += ink('spray-slash',[25,197],[[[79,172],[129,127],[218,90]]],6.5,'#e4c31d');
  a += ink('spray-slash',[30,266],[[[71,230],[118,216],[145,168]]],4.6,'#f321ac');
  a += ink('spray-slash',[208,270],[[[228,234],[251,217],[278,212]]],5.3,'#1cc6e9');
  a += speckle('cyan-spray',8823,42,[19,124,61,166],['#16dfff','#18b2e5b2','#55f1ffc2'],1.2);
  a += speckle('pink-spray',8824,42,[20,218,77,115],['#f12ea6','#f73db0a5','#c14bb766'],1.2);
  a += speckle('yellow-spray',8825,42,[222,87,56,153],['#f4d52b','#f6e434a8','#ffd33672'],1.1);
  a += speckle('white-grit',8826,42,[24,39,250,306],['#e8e5da72','#d4e6e846','#7a85894f'],.85);
  a += speckle('cyan-pigment',8827,42,[24,153,46,54],['#fff8ce67','#071729aa','#042a3c6e'],1.3);
  a += speckle('ochre-pigment',8828,42,[229,115,45,53],['#101b219e','#fbf1a762','#4f483255'],1.3);
  a += speckle('magenta-pigment',8829,42,[18,231,44,47],['#fff6d756','#18142d9a','#3c1c3e73'],1.3);
  a += ink('paint-drip',[23,244],[[[23,264],[21,278],[22,303]]],2.1,'#ef309e');
  a += ellipse('paint-drip-tip',20,301,4,7,'#f932aa');
  a += ink('paint-drip',[268,147],[[[272,168],[265,178],[269,192]]],1.8,'#f2d820');
  // White freehand loops sit beside the hood, away from the rating and name.
  a += ink('wall-brush',[38,156],[[[85,146],[95,165],[51,186]],[[34,199],[65,203],[91,185]],[[100,177],[90,200],[53,225]]],3.5,'#eceee1');
  a += ink('wall-brush',[58,140],[[[67,166],[67,191],[76,216]]],3.1,'#e7e9df');
  a += ink('wall-brush',[39,214],[[[69,209],[83,211],[100,213]]],2.2,'#f3f1e4');
  a += ink('wall-brush',[85,132],[[[74,149],[86,150],[100,138]]],2.6,'#e4eadd');
  a += graffiti('css')+driftFigure();
  a += polygon('crown', [[201,35],[211,41],[216,23],[226,39],[240,28],[235,52],[207,54]], '#f7df37');
  a += polygon('crown-cutout', [[207,40],[213,47],[217,34],[224,47],[233,38],[230,48],[211,50]], '#0a131b');
  a += ink('crown-brush-base',[206,57],[[[218,54],[230,55],[237,52]]],1.8,'#f6db29');
  a += darkFields('drift','#080d13ef');
  a += polygon('rating-shade', [[25,49],[90,32],[99,114],[25,124]], 'linear-gradient(90deg,#0a1118ec,#0a111855)');
  a += stroke('chalk-border',close(scalePoints(shell,.977,.983)),.85,'#dfded6c0');
  a += stroke('chalk-border-inner',close(scalePoints(shell,.944,.962)),.55,'#acb9b29c');
  a += ink('frame-scrape',[22,63],[[[18,154],[25,234],[21,327]],[[23,344],[52,348],[72,350]]],1.5,'#e3e6d4a6');
  a += ink('frame-scrape',[280,83],[[[279,193],[281,259],[277,326]]],1.1,'#d8dacf9c');
  a += segment('yellow-edge',[42,40],[95,20],3.0,'#f1cd15');
  a += segment('pink-edge',[17,284],[23,333],2.7,'#ed34b7');
  a += segment('cyan-edge',[279,254],[278,291],3.0,'#23d7f2');
  a += splat(8871,111,357,17,'#f4d728');
  a += splat(8872,271,339,16,'#11cde3');
  a += speckle('edge-spit',8830,100,[29,337,243,21],['#faf8d7bb','#1ddde7','#f0cb19','#d9318c'],1.05);
  a += polygon('taped-corner',[[24,58],[40,45],[45,49],[29,63]],'repeating-linear-gradient(110deg,#d3d5c46e 0 1px,#eef1da1c 1px 3px)');
  a += polygon('taped-corner',[[257,41],[276,49],[274,57],[253,48]],'repeating-linear-gradient(55deg,#a5bcb433 0 1px,#f5edc381 1px 3px)');
  a += ink('white-edge-scuff',[28,336],[[[49,340],[58,346],[82,347]]],2.3,'#ece9d6ad');
  a += ink('white-edge-scuff',[266,331],[[[270,314],[273,303],[271,297]]],2.6,'#e5e8d4ab');
  a += speckle('worn-paper-edge',8891,75,[18,81,9,250],['#dee8ddaa','#1c282ba9','#c5d8c276'],1.0);
  a += crest('drift');
  return root('drift',a);
}
function trophy() {
  let a = ink('trophy-handle-shadow',[229,109],[[[211,71],[201,85],[207,119]],[[209,141],[217,148],[230,151]]],6,'#150e2b');
  a += ink('trophy-handle',[229,107],[[[213,75],[204,85],[210,116]],[[212,135],[219,143],[230,146]]],3.5,'linear-gradient(80deg,#efd6ff,#72528e 38%,#efe6dd 75%,#b091c8)');
  a += ink('trophy-handle',[253,107],[[[268,77],[278,88],[270,117]],[[267,135],[260,145],[251,147]]],4,'linear-gradient(100deg,#392047,#e9d1ff 48%,#fff7d5 74%,#9874b3)');
  a += ink('trophy-handle-light',[254,105],[[[267,82],[275,90],[269,111]],[[268,125],[261,138],[255,140]]],.9,'#fff5e1');
  a += polygon('trophy-cup', [[219,100],[261,100],[258,127],[253,149],[244,164],[237,166],[227,151],[222,129]], 'linear-gradient(90deg,#5d3f73,#e3c6ef 17%,#f8ead2 25%,#866391 36%,#3e2a59 54%,#c4a6d2 74%,#fcf0da 82%,#76518e)');
  a += ellipse('trophy-lip',217,96,47,10,'linear-gradient(180deg,#f4ddff,#795686 41%,#eee4e0 59%,#9b7cae)');
  a += ellipse('trophy-mouth',221,98,39,4,'linear-gradient(180deg,#2a193b,#b29bbd)');
  a += polygon('trophy-central-flute', [[237,108],[242,108],[242,154],[239,161],[237,146]], 'linear-gradient(90deg,#efdff552,#fff4ed85,transparent)');
  a += ink('trophy-flute',[225,109],[[[225,130],[229,147],[237,158]]],.8,'#fff0d7b8');
  a += ink('trophy-flute',[254,108],[[[255,131],[249,150],[244,157]]],1.1,'#dfc9e1');
  a += polygon('trophy-stem', [[237,162],[244,162],[244,190],[252,200],[229,200],[237,190]], 'linear-gradient(90deg,#ae88bb,#ffefdc 34%,#6b467e 56%,#d3b5d1)');
  a += ellipse('trophy-knop',234,169,13,8,'linear-gradient(100deg,#68447a,#f8e8dc 45%,#9565a4)');
  a += polygon('trophy-foot', [[228,197],[253,197],[258,204],[258,211],[222,211],[222,205]], 'linear-gradient(180deg,#b28fbe,#fff1de 25%,#614075 40%,#8c699c 71%,#21172f)');
  a += ellipse('trophy-medal',235,119,13,17,'linear-gradient(120deg,#e8d1e8,#715381 70%,#ecd9d7)','border:1px solid #f3e6d3;');
  a += star('trophy-medallion',241.5,127.5,4.5,'#f4e9d4',5,.46);
  a += segment('trophy-base-etch',[227,205],[253,205],.7,'#f9e9d0');
  return a;
}
function majesticFigure() { return renderFigure('majestic','css'); }
function ornament(x,y,flip=1) {
  const p = ([a,b])=>[x+a*flip,y+b];
  let a = ink('gilt-scroll',p([0,0]),[[p([16,-22]),p([19,-43]),p([5,-47])],[p([-8,-50]),p([-9,-31]),p([1,-36])]],1.1,'#e4b96b');
  a += ink('violet-scroll',p([4,-1]),[[p([22,-20]),p([26,-41]),p([15,-51])]],.7,'#b88dff');
  a += polygon('gilt-leaf',[p([3,-11]),p([15,-22]),p([12,-35]),p([7,-23])],'linear-gradient(130deg,#fff0b2,#82602f 68%,#e3be74)');
  a += polygon('gilt-leaf',[p([5,-35]),p([-3,-39]),p([-3,-47]),p([3,-44])],'#eed19a');
  return a;
}
function majestic() {
  let a = stroke('royal-edge-aura',close(shell),4,'linear-gradient(120deg,#f7d98c2a,#a357f927,#e8bc8a38)');
  a += polygon('gilt-shell',shell,'linear-gradient(112deg,#fbe3b0,#a27639 22%,#f4df9e 40%,#ffe8bd 58%,#80562d 78%,#d9b469)');
  a += polygon('amethyst-inset',innerShell,'radial-gradient(ellipse at 63% 35%,#6b20a3,#30105a 43%,#110829 72%,#110c25)');
  a += ellipse('amethyst-aura',95,34,180,211,'radial-gradient(ellipse,#bc6cff52,transparent 67%)');
  const lightning = [
    [[31,72],[51,84],[45,105],[70,122],[66,145],[98,151],[103,173],[85,185],[97,215]],
    [[262,53],[246,72],[262,85],[255,107],[268,127],[251,146],[265,164],[246,186]],
    [[37,224],[62,203],[76,218],[87,195],[113,203],[128,177],[142,184]],
    [[99,40],[106,58],[97,76],[108,90],[100,115],[119,127]],
    [[177,31],[194,52],[190,68],[207,84],[198,101]]
  ];
  lightning.forEach((p,i)=>{a+=stroke('violet-fracture-halo',p,3.2,'#ad40ff2f');a+=stroke('violet-fracture',p,.55,i%2?'#d8a6ffa8':'#ba75ffa8');});
  for(const [x,y,s] of [[91,136,13],[78,189,9],[109,213,10],[224,63,8],[258,215,11],[121,51,5],[59,159,5],[204,45,5]]) {
    a+=ellipse('star-aura',x-s*1.7,y-s*1.7,s*3.4,s*3.4,'radial-gradient(ellipse,#ca77ff70,transparent 65%)');
    a+=star('royal-star',x,y,s,'linear-gradient(150deg,#fff2ff,#c87dff)',4,.16);
  }
  a+=royalShards('css','back')+trophy();
  a+=majesticFigure();
  a+=darkFields('majestic','#100922f2');
  a+=polygon('rating-shade',[[26,52],[91,33],[100,117],[26,128]],'linear-gradient(90deg,#1b0b39ed,#210c3910)');
  a+=speckle('royal-dust',9661,120,[28,42,244,299],['#f5cdff45','#d5b98a33','#c3a0fa55'],.6);
  a+=stroke('gold-outer-wire',close(scalePoints(shell,.987,.99)),.75,'#fff2be');
  a+=stroke('gold-inner-wire',close(scalePoints(shell,.962,.978)),1.1,'linear-gradient(105deg,#f1d592,#8c5a35 36%,#ffe5ad 55%,#aa733e 75%,#f7d2a1)');
  a+=stroke('violet-frame-channel',close(scalePoints(shell,.940,.961)),2.3,'#7d42cd');
  a+=stroke('gold-fillet',close(scalePoints(shell,.923,.948)),.7,'#e8c696');
  a+=royalShards('css','front');
  a+=ink('left-hem-scroll',[28,337],[[[44,356],[74,344],[93,355]],[[107,361],[124,362],[144,372]]],1.1,'#eccf8a');
  a+=ink('right-hem-scroll',[272,337],[[[256,356],[226,344],[207,355]],[[193,361],[176,362],[156,372]]],1.1,'#eccf8a');
  a+=polygon('top-jewel',[[150,14],[155,23],[150,31],[145,23]],'linear-gradient(125deg,#ffedc2,#a985e7 45%,#5e329d 64%,#dfb7ff)');
  for(const [x,y,d] of [[44,39,1],[66,32,1],[89,24,1],[256,39,-1],[234,32,-1],[211,24,-1]]) {
    a+=polygon('laurel-engraving',[[x,y],[x+10*d,y-7],[x+17*d,y-7],[x+10*d,y-3]],'linear-gradient(150deg,#fff2bb,#b08a4a 60%,#e5c48a)');
  }
  a+=ink('lower-filigree',[48,352],[[[57,346],[73,355],[84,352]],[[96,348],[109,358],[121,360]]],.7,'#f7d995');
  a+=ink('lower-filigree',[252,352],[[[243,346],[227,355],[216,352]],[[204,348],[191,358],[179,360]]],.7,'#f7d995');
  a+=ellipse('left-setting',25,170,4,7,'linear-gradient(90deg,#d8b7ff,#773ab7 60%,#e4c7ff)','border:.6px solid #f1dcb4;');
  a+=ellipse('right-setting',271,170,4,7,'linear-gradient(90deg,#d8b7ff,#773ab7 60%,#e4c7ff)','border:.6px solid #f1dcb4;');
  a+=star('lower-jewel',150,359,6,'#dbb7ff',4,.32);
  a+=crest('majestic');
  return root('majestic',a);
}
function prismFigure() { return renderFigure('prism','css'); }
function prism() { return root('prism',prismSurface('css','back')+prismFigure()+darkFields('prism','#071023e3')+prismSurface('css','front')+crest('prism')); }

export const cssArt = {
  rivera: rivera(),
  drift: drift(),
  majestic: majestic(),
  prism: prism()
};

export const cssStyles = `
.r2-expressive.r2-expressive-css {
  position:absolute;left:0;top:0;width:300px;height:380px;
  overflow:visible;isolation:isolate;pointer-events:none;
}
.r2-expressive.r2-expressive-css i {
  display:block;position:absolute;box-sizing:border-box;margin:0;padding:0;
  font-size:0;line-height:0;font-style:normal;pointer-events:none;
}
`;

function crest(...args){return `<div style="position:absolute;left:0;top:0;width:300px;height:380px;transform:translate(40.3px,46.6px) scale(.8);transform-origin:0 0">${rawCrest(...args)}</div>`}
