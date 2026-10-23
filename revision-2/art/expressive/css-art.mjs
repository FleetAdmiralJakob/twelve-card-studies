// Original, authored CSS artwork. Coordinates are in the full 300 × 380 card.
// Curves below become native CSS polygons; there are no image or SVG assets.
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
function riveraFigure() {
  let a = polygon('left-arm', [[114,164],[98,173],[88,187],[74,196],[46,207],[40,216],[53,220],[87,207],[109,192],[124,185]], 'linear-gradient(160deg,#122e4c 16%,#06122c 47%,#ce22af 70%,#0bdfff 93%)');
  a += polygon('right-arm', [[238,166],[257,181],[265,205],[256,228],[246,237],[239,226],[249,207],[242,191],[229,182]], 'linear-gradient(105deg,#0c1127 40%,#245d83 72%,#55efff)');
  a += polygon('jersey', [[153,123],[130,129],[111,139],[99,157],[91,180],[111,191],[122,181],[120,211],[107,246],[232,248],[226,215],[232,184],[249,194],[264,181],[252,157],[238,142],[211,133],[188,122],[176,132]], 'linear-gradient(112deg,#27445b 0%,#131734 25%,#090d23 46%,#1c1342 76%,#09628b)');
  a += polygon('back-plane', [[155,137],[181,139],[211,135],[226,153],[221,192],[227,239],[166,239],[155,205]], 'linear-gradient(120deg,#15132d,#0a1227 62%,#35134a)');
  a += polygon('shoulder-plane', [[130,130],[153,124],[175,134],[211,133],[230,140],[202,144],[172,145]], 'linear-gradient(155deg,#75c1d5aa,#623e9177 50%,transparent)');
  a += polygon('sleeve-fold', [[115,144],[126,139],[118,165],[116,178],[105,183],[98,177]], 'linear-gradient(108deg,#121126,#535cb655 65%,#05dff7bb)');
  a += polygon('right-sleeve-fold', [[230,148],[251,162],[261,179],[248,185],[236,175]], 'linear-gradient(130deg,#291744,#060d24 54%,#079dd3)');
  a += polygon('satin-fold', [[139,158],[132,178],[138,196],[133,228],[151,241],[142,208]], 'linear-gradient(95deg,transparent,#83328388,transparent)');
  a += polygon('satin-fold', [[199,156],[207,178],[204,197],[219,225],[217,236],[198,199]], 'linear-gradient(92deg,transparent,#4d288b88,transparent)');
  for(const [p,c] of [
    [[[128,142],[141,146],[158,159],[137,149]],'#c772db45'],
    [[[127,172],[126,185],[139,204],[131,183]],'#87b5f138'],
    [[[193,151],[208,148],[223,154],[207,151]],'#dfa8ed53'],
    [[[208,191],[220,208],[224,229],[218,212]],'#ba60d549'],
    [[[152,230],[172,233],[198,229],[184,235]],'#d958ca42']
  ])a+=polygon('taut-satin-fold',p,c);
  const folds = [
    [[125,145],[[[130,151],[130,166],[123,180]]],.8,'#68c9dfaa'],
    [[136,144],[[[149,149],[163,153],[187,149]]],.65,'#ee55d2aa'],
    [[186,149],[[[201,147],[213,145],[222,148]]],.7,'#8e68d5'],
    [[124,187],[[[132,199],[130,217],[120,232]]],1.1,'#fc4ec2a0'],
    [[143,164],[[[147,176],[157,181],[175,179]]],.65,'#b756d9a0'],
    [[204,164],[[[211,181],[206,193],[215,210]]],.8,'#8468d6aa'],
    [[147,208],[[[164,216],[187,211],[201,218]]],.6,'#fb43b99a'],
    [[149,222],[[[170,229],[195,227],[210,231]]],.75,'#ba33c2bb']
  ];
  folds.forEach(([s,c,w,f]) => a += ink('cloth-seam',s,c,w,f));
  a += ink('shoulder-rim', [100,157], [[[110,134],[131,130],[152,126]],[[170,141],[189,132],[207,134]],[[229,137],[245,147],[257,167]]], 1.5, 'linear-gradient(95deg,#5effff,#d16cff 54%,#fe54db)');
  a += ink('left-cuff', [93,178], [[[98,185],[105,188],[112,188]]], 2.2, '#52e8fa');
  a += ink('right-cuff', [237,182], [[[247,189],[251,189],[262,181]]], 2.3, '#30e9ff');
  a += ink('arm-rim', [41,213], [[[58,209],[77,201],[92,192]]], 1.45, '#77edff');
  a += polygon('diagonal-flash', [[52,210],[242,160],[247,163],[59,215]], 'linear-gradient(90deg,#29f4ff,#7efff6 52%,#38d8ff)');
  a += segment('diagonal-flash-fine', [63,221],[250,173],.75,'#f964e3');
  a += polygon('jersey-knit', [[131,148],[207,146],[219,239],[121,238],[137,205]], 'repeating-linear-gradient(86deg,transparent 0 3px,#cc7bf60c 3px 3.6px),repeating-linear-gradient(0deg,transparent 0 4px,#5ddaff13 4px 4.7px)');
  a += backHead('rivera');
  a += ink('collar', [151,126], [[[155,136],[165,141],[177,141]],[[183,137],[188,132],[190,128]]], 3.5, '#493a86');
  a += ink('collar-piping', [150,126], [[[160,138],[171,142],[178,139]],[[184,135],[187,132],[190,128]]], .95, '#b2b2ef');
  return a;
}
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
  a += darkFields('rivera','#071026ed');
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
function driftFigure() {
  let a = polygon('hoodie-silhouette', [[145,128],[130,134],[109,145],[98,160],[87,189],[74,221],[102,239],[119,224],[116,245],[240,246],[231,216],[248,221],[272,204],[262,182],[249,163],[226,146],[206,138],[191,129]], 'linear-gradient(108deg,#1b1d23,#0b0c11 40%,#202127 71%,#04080c)');
  a += polygon('left-sleeve', [[109,147],[127,143],[119,174],[108,197],[98,227],[82,223],[89,196]], 'linear-gradient(108deg,#626465,#15171b 27%,#0d1017 65%,#393d43)');
  a += polygon('right-sleeve', [[213,143],[235,152],[252,170],[269,201],[253,212],[241,194],[231,179]], 'linear-gradient(105deg,#17191f,#090c11 42%,#7f8281 73%,#171b21 89%)');
  a += polygon('hoodie-chest', [[141,146],[162,150],[185,149],[209,144],[221,168],[218,202],[232,241],[119,243],[127,210],[125,179]], 'linear-gradient(120deg,#25262b,#0b0d12 45%,#101318 73%,#3e3c42)');
  a += polygon('fabric-light', [[120,153],[128,145],[144,150],[130,161],[126,190],[115,211],[116,187]], 'linear-gradient(100deg,#85878a55,transparent)');
  a += polygon('fabric-light', [[207,150],[218,153],[230,175],[229,195],[219,176]], 'linear-gradient(90deg,transparent,#b2b2ac44)');
  for(const [p,c] of [
    [[[110,155],[108,170],[98,193],[105,173]],'#dce1d534'],
    [[[112,184],[106,200],[108,211],[114,189]],'#a6b0b136'],
    [[[134,160],[141,169],[146,176],[137,168]],'#dce1d529'],
    [[[203,171],[201,182],[214,195],[207,183]],'#ccd4d027'],
    [[[235,170],[241,177],[248,197],[240,183]],'#e0e3d839'],
    [[[151,216],[167,211],[184,214],[164,214]],'#dce1d528']
  ])a+=polygon('hoodie-fold-plane',p,c);
  a += polygon('ribbed-hem', [[123,229],[227,229],[232,242],[119,242]], 'repeating-linear-gradient(93deg,#35383c 0 .6px,#11141b .6px 3px)');
  const folds = [
    [[112,153],[[[106,173],[100,181],[96,198]]],1.5,'#a1a3a095'],
    [[119,164],[[[116,179],[107,189],[106,203]]],.8,'#d7d8cf9c'],
    [[93,214],[[[98,211],[102,216],[106,220]]],1.7,'#858c90'],
    [[220,151],[[[230,158],[235,169],[239,187]]],1.3,'#dbdcd27c'],
    [[238,162],[[[248,181],[249,187],[258,200]]],.9,'#fbf7d0b2'],
    [[129,174],[[[136,186],[134,193],[128,205]]],1.0,'#83878b9c'],
    [[204,168],[[[200,184],[213,196],[214,209]]],1.1,'#74797f9c'],
    [[143,217],[[[165,213],[181,216],[199,211]]],.8,'#a2a5a576'],
    [[139,225],[[[160,222],[188,225],[210,219]]],1.1,'#c8cac278']
  ];
  folds.forEach(([s,c,w,f])=>a+=ink('hoodie-fold',s,c,w,f));
  a += ink('shoulder-piping', [89,187], [[[100,151],[118,141],[140,134]],[[167,142],[189,138],[207,139]],[[234,145],[256,166],[271,201]]],1.35,'linear-gradient(100deg,#90e1ec,#e5e5df 35%,#a2a2a0 70%,#fff1b3)');
  a += ink('pocket', [139,208], [[[146,192],[189,190],[207,206]]],1.1,'#42474c');
  a += polygon('hood-outline', [[130,115],[135,91],[142,69],[154,52],[165,48],[178,51],[192,62],[204,83],[210,108],[206,128],[193,144],[166,152],[143,141]], 'linear-gradient(125deg,#f2f1df,#9b9f9b 27%,#25272a 42%,#c2c3b7 68%,#31383a)');
  a += polygon('hood-cloth', [[133,115],[139,92],[146,71],[156,55],[166,51],[177,55],[190,66],[200,86],[205,108],[201,126],[191,140],[166,148],[146,138]], 'linear-gradient(130deg,#323536,#111419 38%,#2a2d30 56%,#090c11 82%)');
  a += polygon('hood-top-fold', [[145,78],[157,58],[168,54],[181,62],[191,79],[176,72],[164,70]], 'linear-gradient(160deg,#a6a89f99,#2c3035 49%,#0a0e14)');
  a += polygon('hood-opening', [[143,107],[151,91],[163,80],[176,79],[190,88],[198,106],[194,125],[182,138],[164,141],[151,132]], 'linear-gradient(130deg,#020506,#050709 70%,#10161d)');
  a += ink('hood-opening-rim', [143,107], [[[155,79],[175,71],[191,89]],[[203,109],[193,132],[177,140]],[[163,146],[151,137],[144,126]]],1.5,'linear-gradient(115deg,#dadbd0,#565c5d 45%,#2d3237 75%,#e2e2d6)');
  a += polygon('hood-deep-shadow', [[160,91],[181,84],[195,100],[187,124],[175,132],[161,123]], 'linear-gradient(100deg,#050708,#030406)');
  a += ink('hood-crown-fold', [143,88], [[[147,72],[154,64],[167,57]],[[170,63],[171,66],[174,68]]],1.15,'#d9dbd0b0');
  a += ink('hood-fan-fold', [139,101], [[[148,93],[154,88],[162,84]]],1.05,'#bcc4bcb5');
  a += ink('hood-fan-fold', [145,81], [[[153,77],[159,75],[170,73]]],.8,'#e2e4d2ac');
  a += ink('hood-needlework',[140,106],[[[149,83],[163,73],[177,77]],[[192,81],[200,101],[199,116]]],.5,'#dce2d153');
  a += ink('hood-needlework',[146,132],[[[153,143],[167,148],[180,142]]],.55,'#cbd3c268');
  a += ink('hood-rim-fold', [195,91], [[[202,109],[198,128],[189,137]]],1.2,'#d1d1c5ad');
  a += ink('neck-bunch', [147,137], [[[150,145],[159,150],[168,152]],[[178,148],[190,146],[195,140]]],2.2,'#666c6c');
  a += ink('drawstring', [154,145], [[[149,157],[151,178],[145,193]]],1.05,'#ced2c8');
  a += ink('drawstring', [185,147], [[[188,158],[182,173],[184,184]]],1.15,'#9da8a9');
  a += segment('aglet',[145,190],[144,196],1.8,'#f4f2dc');
  a += segment('aglet',[184,182],[185,188],1.8,'#dadecb');
  a += polygon('hood-weave', [[134,110],[142,77],[163,51],[189,64],[204,104],[193,136],[166,148],[145,135]], 'repeating-linear-gradient(32deg,transparent 0 3px,#e8eedb0a 3px 3.6px)');
  // Loose gestural paint, intentionally abstract: no letters or words.
  a += ink('shirt-brush', [145,211], [[[157,190],[151,183],[154,205]],[[160,218],[168,185],[172,199]],[[170,211],[182,189],[190,197]]],1.75,'#e8e7dc');
  a += ink('shirt-brush', [177,211], [[[193,183],[196,180],[188,211]],[[194,207],[202,200],[210,199]]],1.25,'#f0eee1');
  a += speckle('fabric-flecks', 8819,70,[122,155,95,76],['#c8cdc365','#eef1da32','#6d6a6257'],.65);
  return a;
}
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
  a += speckle('cyan-spray',8823,125,[19,124,61,166],['#16dfff','#18b2e5b2','#55f1ffc2'],1.2);
  a += speckle('pink-spray',8824,100,[20,218,77,115],['#f12ea6','#f73db0a5','#c14bb766'],1.2);
  a += speckle('yellow-spray',8825,115,[222,87,56,153],['#f4d52b','#f6e434a8','#ffd33672'],1.1);
  a += speckle('white-grit',8826,160,[24,39,250,306],['#e8e5da72','#d4e6e846','#7a85894f'],.85);
  a += speckle('cyan-pigment',8827,85,[24,153,46,54],['#fff8ce67','#071729aa','#042a3c6e'],1.3);
  a += speckle('ochre-pigment',8828,90,[229,115,45,53],['#101b219e','#fbf1a762','#4f483255'],1.3);
  a += speckle('magenta-pigment',8829,80,[18,231,44,47],['#fff6d756','#18142d9a','#3c1c3e73'],1.3);
  a += ink('paint-drip',[23,244],[[[23,264],[21,278],[22,303]]],2.1,'#ef309e');
  a += ellipse('paint-drip-tip',20,301,4,7,'#f932aa');
  a += ink('paint-drip',[268,147],[[[272,168],[265,178],[269,192]]],1.8,'#f2d820');
  // White freehand loops sit beside the hood, away from the rating and name.
  a += ink('wall-brush',[38,156],[[[85,146],[95,165],[51,186]],[[34,199],[65,203],[91,185]],[[100,177],[90,200],[53,225]]],3.5,'#eceee1');
  a += ink('wall-brush',[58,140],[[[67,166],[67,191],[76,216]]],3.1,'#e7e9df');
  a += ink('wall-brush',[39,214],[[[69,209],[83,211],[100,213]]],2.2,'#f3f1e4');
  a += ink('wall-brush',[85,132],[[[74,149],[86,150],[100,138]]],2.6,'#e4eadd');
  a += driftFigure();
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
function majesticFigure() {
  let a = polygon('royal-arm', [[112,158],[93,181],[86,211],[92,241],[113,244],[116,218],[128,187]], 'linear-gradient(104deg,#665184,#201536 38%,#0f1020 78%)');
  a += polygon('royal-jersey', [[151,124],[134,130],[116,136],[103,153],[96,177],[118,192],[126,178],[124,210],[113,246],[239,246],[232,218],[231,184],[246,194],[260,178],[249,152],[234,140],[208,131],[189,123],[175,135]], 'linear-gradient(108deg,#51456c,#27153f 27%,#100c21 53%,#211131 71%,#8359a2)');
  a += polygon('royal-shoulder', [[118,138],[151,125],[171,136],[203,132],[233,140],[221,147],[178,145],[145,140],[128,146]], 'linear-gradient(180deg,#d2a8ef8c,#3c24544d)');
  a += polygon('royal-back', [[143,147],[174,150],[212,144],[222,176],[216,196],[232,243],[127,243],[141,210]], 'linear-gradient(110deg,#241438,#100a1c 57%,#301442)');
  a += polygon('royal-sleeve', [[109,155],[121,144],[130,147],[119,181],[111,187],[100,176]], 'linear-gradient(105deg,#bea0c467,#281a3f 60%,#110c24)');
  a += polygon('royal-fold', [[211,148],[222,152],[231,175],[222,177],[221,198],[215,187]], 'linear-gradient(110deg,#bea2e75c,transparent)');
  a += polygon('royal-fold', [[143,156],[137,188],[144,205],[135,232],[151,241],[148,207]], 'linear-gradient(90deg,transparent,#875aa64f,transparent)');
  for(const [p,c] of [
    [[[136,144],[149,148],[160,158],[144,151]],'#d3acd53a'],
    [[[138,163],[134,185],[140,198],[138,181]],'#dac5e62a'],
    [[[202,152],[214,150],[224,158],[212,154]],'#deaaeb4a'],
    [[[207,197],[222,222],[223,238],[216,218]],'#bc7ad238'],
    [[[144,229],[166,234],[184,232],[167,236]],'#ae79c940']
  ])a+=polygon('royal-tension-fold',p,c);
  const folds = [
    [[119,149],[[[115,157],[117,170],[111,177]]],1.0,'#d1acd4ad'],
    [[139,141],[[[151,147],[165,150],[185,147]]],.8,'#d3acf3a8'],
    [[196,147],[[[206,146],[217,148],[224,153]]],.9,'#d1a4e3b5'],
    [[139,161],[[[136,175],[132,186],[135,199]]],.8,'#815e9db9'],
    [[146,183],[[[156,189],[170,186],[180,189]]],.65,'#9872b0a1'],
    [[208,167],[[[216,179],[211,190],[218,207]]],1.05,'#7b5097bd'],
    [[148,214],[[[164,210],[183,217],[202,211]]],.8,'#a16bbea8'],
    [[136,229],[[[156,226],[178,229],[196,224]]],.7,'#74508eaa'],
    [[97,203],[[[94,218],[99,226],[98,237]]],1.3,'#b48fe7ab']
  ];
  folds.forEach(([s,c,w,f])=>a+=ink('royal-seam',s,c,w,f));
  a += ink('royal-outline',[100,168],[[[107,142],[127,135],[152,127]],[[170,140],[190,132],[208,132]],[[235,137],[251,153],[258,176]]],1.8,'linear-gradient(100deg,#d4b5f5,#e7d0fc 30%,#7c5cae 60%,#e4b4ff)');
  a += ink('gold-cuff',[98,176],[[[102,183],[109,187],[117,189]]],1.7,'#d9bda5');
  a += ink('gold-cuff',[234,185],[[[241,190],[246,192],[257,181]]],1.65,'#d4bad6');
  a += polygon('velvet-weave',[[140,147],[209,146],[224,239],[129,241]],'repeating-linear-gradient(83deg,transparent 0 2px,#f3a9ff08 2px 2.55px),repeating-linear-gradient(7deg,transparent 0 4px,#b6a0dd0a 4px 4.6px)');
  a += backHead('majestic');
  a += ink('royal-collar',[151,127],[[[158,137],[167,142],[177,142]],[[182,138],[190,133],[192,128]]],3.1,'#645274');
  a += ink('royal-collar-rim',[151,127],[[[161,139],[172,142],[179,140]],[[185,136],[190,132],[192,128]]],.85,'#e1c4e1');
  for (const [x,y,s] of [[141,190,4.5],[174,180,5.3],[190,207,4],[128,218,3.4],[158,221,3.2]]) a += star('embroidered-star',x,y,s,'#d6b3f4',5,.35);
  return a;
}
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
  a+=trophy();
  a+=majesticFigure();
  a+=darkFields('majestic','#100922f2');
  a+=polygon('rating-shade',[[26,52],[91,33],[100,117],[26,128]],'linear-gradient(90deg,#1b0b39ed,#210c3910)');
  a+=speckle('royal-dust',9661,120,[28,42,244,299],['#f5cdff45','#d5b98a33','#c3a0fa55'],.6);
  a+=stroke('gold-outer-wire',close(scalePoints(shell,.987,.99)),.75,'#fff2be');
  a+=stroke('gold-inner-wire',close(scalePoints(shell,.962,.978)),1.1,'linear-gradient(105deg,#f1d592,#8c5a35 36%,#ffe5ad 55%,#aa733e 75%,#f7d2a1)');
  a+=stroke('violet-frame-channel',close(scalePoints(shell,.940,.961)),2.3,'#7d42cd');
  a+=stroke('gold-fillet',close(scalePoints(shell,.923,.948)),.7,'#e8c696');
  for(const [x,y,f] of [[22,136,1],[278,136,-1],[22,263,1],[278,263,-1]])a+=ornament(x,y,f);
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
function prismFigure() {
  let a=polygon('crystal-jersey',[[157,125],[143,133],[126,139],[108,151],[99,176],[85,215],[99,241],[126,237],[130,249],[237,248],[230,217],[244,194],[229,166],[207,148],[188,136],[184,122]],'linear-gradient(112deg,#12314b,#0a1528 40%,#14102a 70%,#27345c)');
  a+=polygon('left-faceted-arm',[[109,152],[125,144],[126,174],[110,193],[99,229],[87,216],[99,177]],'linear-gradient(140deg,#264e65,#071326 60%,#5487a9)');
  a+=polygon('right-faceted-arm',[[212,155],[231,169],[243,194],[227,210],[221,186]],'linear-gradient(110deg,#0c1225,#3a235b 55%,#5b9cca)');
  a+=polygon('back-plane',[[141,141],[158,145],[180,146],[204,154],[220,175],[213,203],[226,241],[121,242],[131,198],[124,174]],'#0b1326');
  const facets=[
    [[[109,153],[140,136],[153,146],[129,159]],'#467ca0'],
    [[[129,159],[153,146],[145,180]],'#18364e'],
    [[[109,153],[129,159],[111,186]],'#14283c'],
    [[[111,186],[129,159],[126,183],[99,214]],'#0b5574'],
    [[[153,146],[177,149],[166,178],[145,180]],'#101b30'],
    [[[177,149],[204,154],[194,175],[166,178]],'#211a38'],
    [[[204,154],[220,175],[194,175]],'#3e3560'],
    [[[145,180],[166,178],[151,207]],'#152c43'],
    [[[166,178],[194,175],[184,199]],'#101121'],
    [[[194,175],[220,175],[213,203],[184,199]],'#191e38'],
    [[[151,207],[184,199],[177,230],[132,238]],'#0b182b'],
    [[[184,199],[213,203],[226,241],[177,230]],'#171328'],
    [[[99,214],[111,186],[108,224],[100,236]],'#273654'],
    [[[214,163],[231,174],[235,191],[224,188]],'#3e345d'],
    [[[129,159],[145,154],[126,183]],'linear-gradient(100deg,#91d6ee99,transparent)'],
    [[[204,154],[220,175],[216,178],[194,157]],'linear-gradient(130deg,#efb9ff99,#a55ae9a6)']
  ];
  for(const [p,c] of facets)a+=polygon('jersey-facet',p,c);
  a+=ink('silhouette-rim',[86,216],[[[96,187],[99,162],[113,150]],[[129,140],[139,137],[154,131]],[[175,142],[194,141],[212,155]],[[229,167],[237,184],[243,194]]],1.35,'linear-gradient(110deg,#6df6ff,#daf9ff 34%,#6aa0dd 53%,#e48cff 79%,#c4ecff)');
  a+=segment('facet-seam',[126,159],[144,149],.8,'#b7e6ee');
  a+=segment('facet-seam',[144,149],[159,153],.65,'#b7e6ee');
  a+=segment('facet-seam',[126,159],[112,186],.85,'#5fdfed');
  a+=segment('facet-seam',[194,175],[216,178],.75,'#f4acff');
  a+=segment('facet-seam',[194,175],[184,199],.65,'#886ec1');
  a+=segment('facet-seam',[145,180],[151,207],.65,'#5c7b9b');
  a+=polygon('prism-neck',[[160,111],[184,115],[183,129],[196,143],[180,152],[151,138],[162,128]],'linear-gradient(95deg,#183d52,#0d1325 55%,#954c99)');
  a+=polygon('prism-neck-plane',[[177,116],[184,115],[183,129],[195,143],[181,145],[173,128]],'#1c2340');
  const head=[[146,83],[147,69],[155,57],[171,51],[186,55],[196,63],[198,74],[196,86],[201,92],[206,99],[199,103],[201,109],[197,112],[196,118],[187,126],[176,128],[162,118],[153,105],[148,101]];
  a+=polygon('profile-rim',head,'linear-gradient(118deg,#95ecff,#214564 40%,#372657 65%,#dfb1ff)');
  a+=polygon('profile',scalePoints(head,.962,.977,174,89),'linear-gradient(120deg,#101c30,#0b1122 48%,#13152b)');
  a+=polygon('face-plane',[[183,65],[194,70],[192,86],[201,97],[192,101],[190,117],[180,122],[180,99]],'#171b34');
  a+=polygon('brow-plane',[[183,80],[193,82],[196,89],[188,88]],'#28516b');
  a+=polygon('nose-plane',[[193,87],[201,95],[205,99],[196,100],[196,94]],'linear-gradient(100deg,#1d2d48,#79c7f3)');
  a+=polygon('cheek-plane',[[189,91],[196,101],[190,111],[180,104]],'#212a46');
  a+=polygon('jaw-plane',[[181,104],[190,111],[196,109],[194,118],[184,125],[179,120]],'linear-gradient(125deg,#18223b,#794990)');
  a+=polygon('temple-plane',[[179,69],[185,67],[183,80],[180,99],[172,94]],'#142d40');
  a+=polygon('ear',[[165,88],[171,85],[175,89],[175,101],[169,106],[165,99]],'linear-gradient(120deg,#70afcc,#172d46 35%,#12172a 70%,#466087)');
  a+=ink('ear-fold',[170,90],[[[166,88],[166,97],[170,99]]],.8,'#6380a4');
  a+=polygon('profile-hair',[[145,82],[143,75],[147,69],[148,64],[152,63],[154,57],[158,58],[162,53],[166,55],[173,51],[177,54],[182,52],[185,56],[191,55],[194,60],[199,62],[197,67],[191,71],[183,68],[175,74],[168,82],[164,96],[157,100],[149,96]],'linear-gradient(110deg,#45697b,#0b192c 25%,#0b1121 75%,#785a9c)');
  a+=polygon('hair-texture',[[147,76],[155,61],[172,54],[190,58],[196,64],[185,66],[173,74],[161,90],[150,90]],'radial-gradient(ellipse,#bdefff2f .4px,transparent 1.1px) 0 0/3px 4px');
  a+=hairLocks(0,0,true);
  a+=ink('hair-white-rim',[148,70],[[[156,53],[177,49],[192,60]]],1.15,'#b8f2ff');
  a+=ink('profile-jaw-rim',[196,112],[[[197,118],[190,123],[184,126]],[[181,128],[184,132],[188,136]]],.9,'#ce8ee3');
  a+=ink('profile-collar',[152,136],[[[161,145],[173,151],[182,151]],[[187,148],[191,145],[195,143]]],2.4,'#344b66');
  a+=ink('profile-collar-rim',[152,135],[[[163,145],[174,149],[181,149]],[[188,146],[191,144],[195,143]]],.9,'#a8d8eb');
  return a;
}
function prism() {
  const outer=[[15,46],[61,31],[107,7],[143,23],[177,6],[226,29],[278,38],[296,79],[280,130],[296,177],[281,226],[297,281],[277,348],[230,364],[150,378],[78,365],[24,348],[5,296],[21,247],[5,191],[20,135],[5,84]];
  const inner=[[32,57],[68,43],[110,28],[145,38],[177,27],[218,44],[264,52],[272,84],[263,129],[274,177],[264,224],[273,278],[260,334],[224,346],[150,363],[85,346],[40,335],[28,295],[37,246],[27,192],[36,137],[27,88]];
  let a=polygon('crystal-shell',outer,'linear-gradient(125deg,#d4f6ff,#2862ab 26%,#c8d9ff 47%,#8f5acc 70%,#bff3ff)');
  a+=polygon('crystal-depth',inner,'radial-gradient(ellipse at 69% 33%,#203858,#11172d 45%,#070e22 85%)');
  a+=polygon('prism-backlight',[[92,38],[164,29],[247,53],[260,166],[232,229],[105,225],[64,170]],'conic-gradient(from 20deg at 62% 45%,#68c7ff33,#191d4722,#c447fa32,#53d9eb24,#1c295c22,#68c7ff33)');
  for(const [p,c] of [
    [[[67,49],[108,29],[123,102]],'linear-gradient(125deg,#b4f5ff,#527dd2b5)'],[[[108,29],[143,39],[123,102]],'linear-gradient(160deg,#f3bcff,#5e61a6)'],
    [[[218,44],[263,53],[240,107]],'linear-gradient(155deg,#f2ffff,#75c9ef)'],[[[240,107],[263,53],[264,165]],'linear-gradient(35deg,#6852b4,#d7f6ff)'],
    [[[47,105],[88,132],[39,197]],'linear-gradient(130deg,#84edff,#3977aeb5)'],[[[43,215],[89,168],[108,227]],'linear-gradient(150deg,#c39bff,#f0bbec)'],
    [[[246,157],[269,178],[243,230]],'linear-gradient(80deg,#fbcbff,#4a80cb)'],[[[89,168],[105,87],[116,141]],'linear-gradient(120deg,#e3ffff,#6fd0f7b5)']
  ])a+=polygon('interior-refraction',p,c);
  a+=prismFigure();
  a+=darkFields('prism','#071023f0');
  a+=polygon('rating-shade',[[29,56],[93,35],[101,118],[28,127]],'linear-gradient(90deg,#0d1832ef,#13203d21)');
  a+=speckle('diamond-dust',9301,90,[36,43,225,294],['#cdeeff48','#e9afff43','#70c7ff3c'],.6);
  const palettes=[
    ['#ebfdff','#3276bd','#8edfff'],['#dae9ff','#e69dff','#3d80c4'],['#89eeff','#164a85','#effcff'],
    ['#e7faff','#7093df','#f3afff'],['#ffdcff','#4583c9','#d0fcff'],['#dcfdff','#275d9e','#b3baff'],
    ['#fcfdff','#639fe5','#90efff'],['#9bedff','#3f508d','#cf9bfc']
  ];
  // Three facets per crystalline edge segment, using irregular inner/outer rings.
  outer.forEach((p,i)=>{
    const next=(i+1)%outer.length, q=outer[next], a0=inner[i], a1=inner[next];
    const mid=[(p[0]+q[0]+a0[0]+a1[0])/4,(p[1]+q[1]+a0[1]+a1[1])/4];
    const [light,dark,tint]=palettes[i%palettes.length];
    a+=polygon('crystal-facet', [p,q,mid], `linear-gradient(${60+i*23}deg,${light},${tint})`);
    a+=polygon('crystal-facet', [p,mid,a0], `linear-gradient(${120+i*17}deg,${dark},${tint})`);
    a+=polygon('crystal-facet', [mid,q,a1,a0], `linear-gradient(${30+i*31}deg,${tint},${dark} 80%)`);
  });
  a+=stroke('crystal-perimeter',close(outer),.85,'#d4faffdc');
  a+=stroke('crystal-inner-cut',close(inner),.8,'linear-gradient(120deg,#8fe9ff,#ffd1ff 42%,#8abaff 65%,#c4fcff)');
  for(const [p,c] of [
    [[[62,31],[106,9],[92,28],[68,43]],'linear-gradient(120deg,#e7ffff6b,#52cfff7c)'],
    [[[177,7],[218,43],[207,28]],'#fff1ff70'],
    [[[279,39],[272,82],[291,77]],'linear-gradient(30deg,#a8faff82,transparent)'],
    [[[9,86],[36,136],[27,113]],'#e1faff6e'],
    [[[281,226],[274,278],[290,274]],'#e3cfff77'],
    [[[79,365],[150,377],[121,364]],'#c49aff88'],
    [[[150,377],[230,364],[211,357]],'#d9fcff77']
  ])a+=polygon('internal-crystal-sheen',p,c);
  for(const [p,q] of [[[15,46],[61,31]],[[5,84],[27,88]],[[296,177],[274,177]],[[5,296],[28,295]],[[230,364],[224,346]]])a+=segment('white-cut',p,q,.9,'#f7ffffe0');
  for(const [p,c] of [
    [[[29,113],[55,136],[38,179],[23,156]],'linear-gradient(115deg,#dbfbff,#4ba3df 40%,#1e387b 44%,#d3a9fd)'],
    [[[269,115],[248,150],[268,191],[278,157]],'linear-gradient(75deg,#79caff,#e9caff 36%,#5b53a3 40%,#e9fbff)'],
    [[[26,218],[48,242],[30,271],[17,248]],'linear-gradient(155deg,#edc0ff,#2e4f9f 47%,#72edff 50%,#e1fcff)'],
    [[[273,245],[253,267],[278,298],[288,279]],'linear-gradient(125deg,#f3e7ff,#7b75d9 40%,#4b99db 46%,#c1fcff)']
  ])a+=polygon('crossing-crystal',p,c);
  for(const [x,y,s] of [[108,13,4.1],[285,76,4.4],[18,293,4.5],[269,341,4.2]])a+=star('crystal-glint',x,y,s,'#e9ffff',4,.15);
  a+=crest('prism');
  return root('prism',a);
}

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
