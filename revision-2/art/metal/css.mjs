/**
 * Metal studies, authored in a 300 × 380 coordinate space.
 * Every visible mark is a CSS shape, gradient, border or shadow. The small
 * deterministic generators describe invented material, never sampled pixels.
 * The live card's typography and flag belong to the caller, not this artwork.
 */
const round = value => Number(value.toFixed(2));
const node = (name, style = '', children = '', tag = 'i') =>
  `<${tag} class="${name.split(/\s+/).map(part => `r2-mc-${part}`).join(' ')}"${style ? ` style="${style}"` : ''}>${children}</${tag}>`;
const group = (name, children, style = '') => node(name, style, children, 'div');
const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const rect = (x, y, w, h) => `left:${round(x)}px;top:${round(y)}px;width:${round(w)}px;height:${round(h)}px;`;
const stroke = (x, y, w, angle, color, opacity = 1, thickness = .7) =>
  node('stroke', `${rect(x, y, w, thickness)}transform:rotate(${angle}deg);background:${color};opacity:${opacity}`);
const polygon = (name, x, y, w, h, points, paint, extra = '') =>
  node(name, `${rect(x, y, w, h)}clip-path:polygon(${points});background:${paint};${extra}`);

function specks(seed, color, bounds, count = 72) {
  const random = rng(seed);
  const dots = Array.from({ length: count }, () =>
    `${round(bounds[0] + random() * bounds[2])}px ${round(bounds[1] + random() * bounds[3])}px 0 ${round(random() * .6)}px ${color}`);
  return node('specks', `box-shadow:${dots.join(',')}`);
}

function frame() {
  return node('aura') + node('foot-glow') + node('frame-shell') + node('frame-reed') +
    node('plate') + node('frame-incision') + node('frame-glints') +
    node('top-fleur') + node('bottom-fleur');
}

function laurel(bronze = false) {
  let leaves = '';
  for (const side of [0, 1]) {
    let branch = node('laurel-stem');
    for (let i = 0; i < 13; i++) {
      const y = 126 + i * 10.5;
      // Rotated leaf tips need ten pixels beyond their nominal left position.
      // This leaves a clear guard at both canvas edges after mirroring.
      const x = 26 + Math.pow((i - 4) / 9, 2) * 15;
      branch += node('laurel-leaf', `${rect(x - (i % 2 ? 0 : 7), y, i % 2 ? 10 : 12, 27)}transform:rotate(${i % 2 ? 28 : -39}deg);--leaf-shade:${i % 3 ? (bronze ? '#4b2814' : '#65480f') : '#21170a'};`);
    }
    leaves += group('laurel-branch', branch, side ? 'transform:scaleX(-1)' : '');
  }
  return group('laurel', leaves);
}

function shards(theme) {
  const gold = theme === 'valor';
  const random = rng(gold ? 813 : 221);
  const positions = gold ? [
    [97,34,55,90,-15],[124,26,48,101,18],[202,29,38,115,15],[230,39,39,103,32],
    [92,89,43,84,-44],[236,103,34,80,32],[43,124,53,78,-27],[48,171,61,50,-8],
    [213,150,48,81,10],[87,55,32,84,-38],[186,23,22,104,-16],[249,79,18,96,22],
    [37,103,26,53,-40],[85,183,37,49,-39],[223,190,45,38,43],[112,31,24,47,-10],
    [217,31,31,59,23],[59,209,42,30,-39]
  ] : [
    [94,28,48,103,-30],[124,28,39,118,4],[214,27,34,126,23],[241,43,35,111,27],
    [40,113,64,99,-48],[29,159,53,81,-45],[211,133,64,83,42],[246,175,25,58,15],
    [95,54,39,72,-20],[238,91,37,87,22],[39,79,43,55,-53],[54,191,51,47,-37],
    [228,216,38,35,17],[115,22,22,68,-31],[191,33,25,73,22],[262,68,13,90,12],
    [29,208,40,39,-36],[210,80,28,67,39],[65,125,33,64,-31],[225,40,25,60,38],
    [38,43,39,25,-21],[255,267,17,43,19]
  ];
  return group('shards', positions.map(([x,y,w,h,a], i) => {
    const light = gold ? (i % 3 ? '#f1d07a' : '#fff8c5') : (i % 3 ? '#b5b9bb' : '#f0f0e9');
    const mid = gold ? '#b68b32' : '#383b3e';
    const dark = gold ? '#2b210b' : '#050709';
    return node('shard', `${rect(x,y,w,h)}transform:rotate(${a}deg);--shard-lit:${light};--shard-mid:${mid};--shard-dark:${dark};opacity:${round(.58 + random() * .38)}`);
  }).join(''));
}

function fissures(theme) {
  const marble = theme === 'aurum';
  const color = marble ? '#a57933' : theme === 'nexus' ? '#e3e6df' : '#d7a162';
  const paths = [
    [31,50,47,97,-22],[88,28,45,85,10],[214,32,43,104,20],[249,74,31,121,12],
    [32,154,39,80,-26],[239,174,31,80,16],[55,193,51,47,46],[115,24,44,58,-18],
    [198,123,53,61,44],[45,271,32,66,-12],[237,280,29,59,24],[96,317,72,32,62],
    [172,55,37,53,-38],[254,224,27,48,-23]
  ];
  return group('fissures', paths.map(([x,y,w,h,a], i) => polygon('fissure', x,y,w,h,
    '2% 0,8% 26%,36% 33%,31% 51%,66% 60%,59% 76%,100% 100%,56% 79%,61% 62%,27% 53%,31% 35%,4% 28%',
    `linear-gradient(155deg,transparent,${color} 21%,${marble ? '#6f573e' : '#b2b4af'} 48%,transparent)`,
    `transform:rotate(${a}deg);opacity:${marble ? .27 + i % 3 * .11 : .28 + i % 3 * .17}`)).join(''));
}

// Each facet follows a fold of the garment. A fine highlight is built into the
// gradient, so cloth has rounded tension and narrow seams rather than flat mesh.
const cloth = {
  valor: [
    [91,123,65,29,-14,1],[112,131,71,19,14,0],[153,131,53,29,27,1],
    [183,131,40,51,-11,2],[98,146,27,61,-13,2],[121,151,29,83,-8,0],
    [142,150,32,82,13,1],[169,154,31,62,14,0],[197,158,26,59,14,2],
    [97,196,44,40,-15,0],[123,209,71,26,6,1],[151,185,64,18,12,2],
    [83,131,27,42,8,1],[212,135,26,48,-10,1],[99,160,46,19,20,2],
    [153,161,39,25,-17,0],[175,217,43,21,0,1],[108,222,63,17,-7,2]
  ],
  nexus: [
    [144,126,54,26,-8,1],[170,135,46,23,20,2],[186,147,24,59,-8,1],
    [200,152,31,54,-9,1],[145,153,36,80,9,0],[124,163,32,72,21,2],
    [161,170,37,66,-6,1],[180,203,42,29,-17,2],[194,134,23,39,-18,0],
    [176,145,20,55,-16,1],[154,193,24,44,-6,0],[120,213,45,24,16,2],
    [169,221,40,18,1,2],[213,166,19,34,-10,2],[159,137,31,19,12,1]
  ],
  aurum: [
    [120,131,39,47,8,1],[147,137,39,54,18,0],[179,124,45,33,19,1],
    [203,141,31,47,-9,2],[116,165,43,49,16,2],[153,175,37,57,-8,0],
    [185,155,38,64,4,1],[212,172,27,44,-10,1],[131,211,54,28,5,2],
    [176,211,47,32,-8,2],[111,145,28,25,-22,1],[151,147,27,34,16,2],
    [180,139,23,29,-22,1],[117,187,29,34,18,1],[206,215,23,28,9,0],
    [154,227,60,16,-2,1],[167,163,25,54,-17,2],[229,155,20,30,-22,1]
  ],
  legacy: [
    [100,129,55,25,-9,1],[122,142,61,21,20,0],[162,134,39,26,19,1],
    [190,149,23,49,-14,2],[104,149,34,56,4,1],[128,162,29,59,-16,0],
    [156,166,35,53,14,1],[181,182,32,42,4,2],[112,207,56,29,-12,2],
    [149,218,52,24,-9,1],[91,145,21,32,17,2],[141,153,29,24,30,1],
    [176,149,27,29,-12,2],[106,185,53,17,-18,0],[161,198,44,26,-8,1],
    [98,226,58,15,0,2],[121,131,27,23,11,2],[186,225,27,18,-8,1]
  ]
};

function garment(theme) {
  const paints = theme === 'aurum' ? [
    'linear-gradient(99deg,transparent 4%,#827d70 21%,#c7c1ae 30%,#f1eee1 39%,#f8f6eb 52%,transparent 72%)',
    'linear-gradient(110deg,transparent 8%,#918c7b 28%,#fffcf2 33%,#d8d4c6 46%,transparent 78%)',
    'linear-gradient(83deg,transparent 9%,#a7a28d 31%,#e4e0cf 40%,#fffdf5 44%,transparent 66%)'
  ] : [
    'linear-gradient(100deg,transparent 5%,var(--cloth-dark) 19%,var(--cloth-mid) 31%,var(--cloth-lit) 35%,var(--cloth-dark) 48%,transparent 74%)',
    'linear-gradient(114deg,transparent 9%,var(--cloth-lit) 28%,var(--cloth-mid) 32%,var(--cloth-dark) 48%,transparent 80%)',
    'linear-gradient(80deg,transparent 8%,var(--cloth-dark) 20%,var(--cloth-mid) 29%,var(--cloth-lit) 31%,transparent 63%)'
  ];
  return group('cloth-folds', cloth[theme].map(([x,y,w,h,a,p], i) => polygon('cloth-fold',x,y,w,h,
    i % 3 === 0 ? '0 4%,93% 0,67% 37%,100% 100%,23% 86%,10% 32%' : i % 3 === 1 ? '0 0,100% 10%,64% 53%,79% 100%,26% 88%' : '0 8%,100% 0,72% 100%,31% 82%',
    paints[p],`transform:rotate(${a}deg);opacity:${theme === 'aurum' ? .78 : .8}`)).join(''));
}

function seams(theme) {
  const list = theme === 'valor' ? [
    [105,129,43,-9],[115,135,38,6],[96,140,30,75],[98,172,34,106],
    [203,141,31,68],[152,143,31,14],[103,215,44,-17],[159,232,42,-6]
  ] : theme === 'nexus' ? [
    [153,127,41,8],[169,137,35,25],[196,146,31,61],[201,166,36,76],
    [177,158,53,81],[137,198,37,111],[164,223,43,-9]
  ] : theme === 'aurum' ? [
    [123,143,29,112],[137,139,28,41],[183,128,33,18],[214,144,28,63],
    [222,174,25,21],[136,189,43,87],[181,198,30,95],[145,233,65,-3]
  ] : [
    [111,130,40,1],[104,144,28,97],[165,139,32,20],[188,156,24,69],
    [109,170,26,111],[130,193,35,-17],[164,213,36,-14],[132,234,49,-6]
  ];
  return group('seams', list.map(([x,y,w,a], i) => stroke(x,y,w,a, i % 3 ? 'var(--seam)' : 'var(--rim)',i % 3 ? .48 : .75,i % 2 ? .55 : .8)).join(''));
}

function cape() {
  const folds = [
    [48,133,116,52,-11],[41,158,124,44,-17],[56,174,103,42,-22],
    [37,199,121,36,-26],[78,189,87,31,-27],[55,221,95,26,-31],
    [112,147,52,54,7],[92,169,53,47,-3],[69,154,66,22,-12]
  ];
  return group('cape', node('cape-body') + node('cape-hem') + folds.map(([x,y,w,h,a], i) => polygon('cape-fold',x,y,w,h,
    '0 78%,23% 44%,89% 0,100% 16%,48% 48%,14% 100%',
    `linear-gradient(${i % 2 ? 172 : 180}deg,#fafbf1 0%,#8f9490 12%,#383d3c 21%,#0b0e10 48%,#020405 70%,#69706c 95%)`,
    `transform:rotate(${a}deg);opacity:${i % 3 ? .88 : .64}`)).join('') +
    [[48,170,100,-15],[48,203,103,-25],[66,223,83,-35],[116,140,43,-8]].map(([x,y,w,a]) => stroke(x,y,w,a,'#d5d8c9',.54)).join(''));
}

function portrait(theme) {
  return group('player', (theme === 'nexus' ? cape() : '') +
    node('neck') + node('neck-tendon') + node('back-arm') + node('back-arm-light') +
    node('back-arm-crease') + node('torso') + node('sleeve-left') + node('sleeve-right') +
    node('front-arm') + node('forearm') + node('elbow') + node('wrist') + node('hand') +
    garment(theme) + seams(theme) + node('collar') + node('collar-piping') +
    node('shirt-grain') + node('head') + node('face-plane') + node('nose-plane') +
    node('brow') + node('eye') + node('ear') + node('hair') + node('hair-light') +
    node('temple') + (theme === 'legacy' ? node('shirt-embroidery') : '') +
    (theme === 'valor' ? football() : ''));
}

function football() {
  const panels = [[18,3,19,17,0],[1,18,17,20,-23],[34,14,20,20,17],[17,27,20,20,11],[1,41,19,17,13],[40,37,17,20,-8]];
  return group('ball', node('ball-surface') + panels.map(([x,y,w,h,a], i) => polygon('ball-panel',x,y,w,h,
    '50% 0,100% 34%,79% 100%,20% 94%,0 33%',
    `linear-gradient(${i % 2 ? 135 : 40}deg,#fff5bc,#d7a94b 16%,#201707 21%,#3b2b0f 60%,#ac7e2e 94%,#fff0ad)`,
    `transform:rotate(${a}deg)`)).join('') + node('ball-seams') + node('ball-gloss') +
    node('ball-crown') + node('ball-fingers'));
}

function crown() {
  return group('crown', node('crown-points') + node('crown-band') + node('crown-jewels'));
}

function orbitals(front = false) {
  return group(front ? 'orbits-front' : 'orbits-back',
    node('orbit orbit-one') + node('orbit orbit-two') + (front ? '' : node('orbit orbit-three')));
}

function marble() {
  return node('marble-cloud') + node('marble-grain') + fissures('aurum') +
    polygon('marble-lode',27,31,105,145,'80% 0,86% 9%,60% 30%,66% 41%,34% 56%,39% 66%,0 100%,32% 63%,29% 54%,62% 39%,57% 29%', 'linear-gradient(20deg,#9c6a25,#e4c27e,#b79350,transparent)') +
    polygon('marble-lode',206,168,74,140,'42% 0,43% 27%,70% 46%,61% 60%,99% 100%,56% 62%,66% 46%,37% 29%', 'linear-gradient(55deg,transparent,#a4732c,#f6d995,#a77534)');
}

function colosseum() {
  let arches = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      arches += node('arch', `${rect(153+col*16.3,111-col*6.1+row*34,11.5+col*.5,23+col*.9)}--arch-shade:${col % 3 ? '#4a2d16' : '#654220'}`);
    }
  }
  return group('colosseum', node('amphitheatre-wall') + arches +
    [0,1,2,3].map(i => node('cornice', `${rect(150,111+i*34,125,4.5)}transform:rotate(-21deg)`)).join('') + node('amphitheatre-rubble') +
    [[207,69,25,69],[259,96,27,89],[237,155,25,60]].map(([x,y,w,a]) => stroke(x,y,w,a,'#f3c48c',.38)).join(''));
}

function ruins() {
  return group('ruins', [[31,207,54,28,-13],[53,218,70,23,-5],[217,210,52,21,-19],[218,229,48,14,-7],[36,234,63,19,12],[204,198,62,13,-14]].map(([x,y,w,h,a], i) =>
    polygon('ruin',x,y,w,h,'0 40%,20% 5%,43% 20%,66% 0,100% 44%,88% 97%,20% 100%',
      `linear-gradient(${i % 2 ? 170 : 12}deg,#2c1a0e,#916137 32%,#e1ad70 35%,#5b371e 48%,#28180e)`,`transform:rotate(${a}deg)`)).join(''));
}

function crest(theme) {
  const body = theme === 'aurum' ?
    node('temple-roof') + node('temple-capital') + [0,1,2,3].map(i => node('temple-column',`left:${7+i*5}px`)).join('') + node('temple-plinth') : theme === 'legacy' ?
      node('helmet-plume') + node('helmet-shell') + node('helmet-cheek') + node('helmet-visor') :
      node('crest-shield') + node('crest-inlay') + node('crest-sword') + node('crest-wing') + node('crest-wing crest-wing-right');
  return group(`crest crest-${theme}`,body);
}

function lower(theme) {
  return node('portrait-fade') + node('name-recess') + node('footer-grain') + node('footer-rule') + crest(theme);
}

const composition = theme => {
  let scene = node('backlight');
  if (theme === 'valor') scene += shards(theme) + node('sun-wheel') + specks(14,'#ffe6a073',[35,25,232,202]);
  if (theme === 'nexus') scene += shards(theme) + fissures(theme) + crown() + specks(56,'#e8eee95a',[32,24,235,229]);
  if (theme === 'aurum') scene += marble() + orbitals() + node('sphere sphere-distant');
  if (theme === 'legacy') scene += node('bronze-patina') + colosseum() + fissures(theme) + ruins() + specks(37,'#e5b37d77',[33,27,232,215]);
  scene += portrait(theme);
  if (theme === 'aurum') scene += orbitals(true);
  return `<div class="r2-art r2-metal r2-metal-css r2-mc-${theme}" aria-hidden="true">` +
    frame() + group('scene',scene) + (theme === 'valor' || theme === 'legacy' ? laurel(theme === 'legacy') : '') +
    (theme === 'aurum' ? node('sphere sphere-left') + node('sphere sphere-right') : '') +
    lower(theme) + '</div>';
};

export const cssArt = Object.fromEntries(['valor','nexus','aurum','legacy'].map(theme => [theme,composition(theme)]));

export const cssStyles = `
.r2-metal.r2-metal-css{position:absolute;inset:0;width:300px;height:380px;overflow:hidden;isolation:isolate;pointer-events:none;--metal:#d6b354;--metal-light:#fff2b2;--metal-dark:#694514;--base:#100e08;--rim:#f5d88f;--cloth-dark:#0b0c08;--cloth-mid:#504629;--cloth-lit:#b9a367;--seam:#9d8b57;--skin:#493821;--skin-light:#c3a163;--frame-shape:polygon(0 13%,9% 10%,22% 6%,34% 2%,39% 3.1%,43% 2.4%,46% 0,48% 2.5%,50% 3.3%,52% 2.5%,54% 0,57% 2.4%,61% 3.1%,66% 2%,78% 6%,91% 10%,100% 13%,100% 88%,99.6% 90.6%,98% 92.6%,95% 94.2%,89% 95.5%,69% 97.6%,57% 99%,50% 100%,43% 99%,31% 97.6%,11% 95.5%,5% 94.2%,2% 92.6%,.4% 90.6%,0 88%)}
.r2-metal .r2-mc-scene,.r2-metal .r2-mc-player,.r2-metal .r2-mc-shards,.r2-metal .r2-mc-fissures,.r2-metal .r2-mc-cloth-folds,.r2-metal .r2-mc-seams,.r2-metal .r2-mc-cape,.r2-metal .r2-mc-colosseum,.r2-metal .r2-mc-ruins,.r2-metal .r2-mc-orbits-back,.r2-metal .r2-mc-orbits-front,.r2-metal .r2-mc-laurel,.r2-metal .r2-mc-laurel-branch{position:absolute;inset:0}
.r2-metal.r2-metal-css i{display:block;position:absolute;box-sizing:border-box;font-style:normal}
.r2-metal.r2-metal-css i::before,.r2-metal.r2-metal-css i::after{position:absolute;box-sizing:border-box}
.r2-metal .r2-mc-aura{inset:6px;background:radial-gradient(ellipse at 50% 45%,transparent 47%,#d4a5360c 59%,transparent 73%),radial-gradient(ellipse at 50% 92%,#d2a14524,transparent 62%);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);z-index:0}
.r2-metal .r2-mc-foot-glow{left:34px;top:350px;width:234px;height:28px;border-radius:50%;background:radial-gradient(ellipse,#f6d47563,transparent 65%);z-index:0}
.r2-metal .r2-mc-frame-shell{left:17px;top:8px;width:266px;height:359px;clip-path:var(--frame-shape);background:linear-gradient(115deg,#34220c 1%,var(--metal-light) 9%,var(--metal) 18%,#b28735 27%,var(--metal-light) 42%,var(--metal-dark) 45%,var(--metal-light) 60%,var(--metal) 81%,var(--metal-light) 93%);z-index:1}
.r2-metal .r2-mc-frame-shell::before{content:'';inset:1.4px;clip-path:var(--frame-shape);background:linear-gradient(135deg,var(--metal-dark),#120f09 38%,var(--metal-dark) 65%,#160e05)}
.r2-metal .r2-mc-frame-shell::after{content:'';inset:3.2px;clip-path:var(--frame-shape);background:linear-gradient(150deg,var(--metal-light),var(--metal-dark) 19%,var(--metal) 33%,var(--metal-light) 43%,var(--metal-dark) 62%,var(--metal-light) 88%,var(--metal))}
.r2-metal .r2-mc-frame-reed{left:22px;top:13px;width:256px;height:349px;clip-path:var(--frame-shape);background:linear-gradient(95deg,var(--metal-dark),var(--metal-light) 2%,var(--metal-dark) 3%,var(--metal-dark) 97%,var(--metal-light) 98%,var(--metal-dark));z-index:2}
.r2-metal .r2-mc-frame-reed::before{content:'';inset:1px;clip-path:var(--frame-shape);background:var(--base)}
.r2-metal .r2-mc-plate{left:25px;top:17px;width:250px;height:341px;clip-path:var(--frame-shape);background:radial-gradient(ellipse at 67% 29%,#8b6a2b 0,#2c2510 32%,#0c0c07 67%);z-index:3}
.r2-metal .r2-mc-frame-incision{left:27px;top:20px;width:246px;height:336px;clip-path:var(--frame-shape);background:linear-gradient(90deg,#ffe6a34d,transparent 1%,transparent 99%,#ffdfa37a);z-index:24}
.r2-metal .r2-mc-frame-glints{left:18px;top:56px;width:2px;height:264px;background:linear-gradient(transparent,#fff5be 3%,transparent 13%,transparent 40%,#fff6c7 64%,#fff6c7 86%,transparent);box-shadow:263px 0 0 -.25px #ffe6a8b3;z-index:25}
.r2-metal .r2-mc-top-fleur{left:147px;top:33px;width:6px;height:17px;clip-path:polygon(50% 0,72% 30%,100% 40%,68% 49%,64% 67%,86% 79%,60% 81%,50% 100%,39% 82%,14% 79%,35% 67%,32% 49%,0 40%,28% 30%);background:linear-gradient(90deg,var(--metal-dark),var(--metal-light),var(--metal));z-index:19}
.r2-metal .r2-mc-bottom-fleur{left:146px;top:344px;width:8px;height:14px;background:linear-gradient(90deg,var(--metal-dark),var(--metal),var(--metal-dark));clip-path:polygon(50% 0,64% 30%,94% 44%,68% 60%,100% 70%,59% 73%,50% 100%,40% 74%,0 70%,32% 60%,6% 44%,37% 30%);z-index:24}
.r2-metal .r2-mc-scene{z-index:5;clip-path:polygon(25px 61px,45px 50px,88px 34px,111px 26px,130px 29px,139px 21px,150px 30px,161px 21px,170px 29px,189px 26px,212px 34px,255px 50px,275px 61px,275px 324px,270px 337px,256px 343px,195px 351px,150px 361px,105px 351px,44px 343px,30px 337px,25px 324px)}
.r2-metal .r2-mc-backlight{inset:0;background:radial-gradient(ellipse 95px 105px at 177px 102px,#ffeb9c73,transparent 90%),linear-gradient(90deg,#0a0c06b5 25%,transparent 50%);z-index:0}
.r2-metal .r2-mc-shards{z-index:1}
.r2-metal .r2-mc-shard{clip-path:polygon(11% 0,100% 30%,58% 49%,73% 100%,0 79%,22% 39%);background:conic-gradient(from 22deg at 40% 43%,var(--shard-dark),var(--shard-mid) 26deg,var(--shard-lit) 29deg,var(--shard-dark) 32deg,var(--shard-mid) 96deg,var(--shard-lit) 117deg,var(--shard-dark) 120deg,var(--shard-mid) 180deg,var(--shard-lit) 184deg,var(--shard-dark) 188deg,var(--shard-dark) 250deg,var(--shard-lit) 257deg,var(--shard-mid) 262deg,var(--shard-dark) 320deg);transform-origin:50% 60%}
.r2-metal .r2-mc-shard::before{content:'';inset:0;clip-path:polygon(11% 0,13% 0,42% 42%,100% 30%,100% 31%,43% 44%,73% 100%,71% 100%,40% 45%,0 80%,0 78%,39% 43%);background:var(--shard-lit)}
.r2-metal .r2-mc-shard::after{content:'';inset:0;background:repeating-linear-gradient(21deg,transparent 0 5px,#fff4c60d 5.4px 5.8px,transparent 6.2px 10px);opacity:.6}
.r2-metal .r2-mc-specks{left:0;top:0;width:.65px;height:.65px;border-radius:50%;z-index:4}
.r2-metal .r2-mc-sun-wheel{left:137px;top:55px;width:119px;height:122px;border:1px solid #fff0ba8c;border-radius:50%;transform:rotate(-24deg);background:repeating-conic-gradient(from 18deg at 46% 58%,transparent 0 19deg,#ffe6a34a 19.4deg 20deg,transparent 20.5deg 34deg);opacity:.56;z-index:2}
.r2-metal .r2-mc-fissures{z-index:3}
.r2-metal .r2-mc-stroke{transform-origin:0 50%;border-radius:50%;z-index:7}
.r2-metal .r2-mc-player{z-index:10}
.r2-metal .r2-mc-neck{left:155px;top:104px;width:39px;height:44px;background:linear-gradient(100deg,var(--rim),var(--skin) 9%,#171a12 28%,#0e100c 70%,var(--skin-light));clip-path:polygon(9% 0,84% 0,85% 48%,100% 82%,70% 100%,0 75%,14% 42%);z-index:2}
.r2-metal .r2-mc-neck-tendon{left:157px;top:112px;width:25px;height:26px;background:linear-gradient(119deg,transparent 18%,var(--skin-light) 20%,#080b08 26%,transparent 46%);clip-path:polygon(10% 0,100% 100%,35% 80%);z-index:3;opacity:.65}
.r2-metal .r2-mc-torso{left:90px;top:119px;width:141px;height:133px;background:linear-gradient(100deg,#15170e,var(--cloth-mid) 14%,#13150d 29%,#0d100a 50%,var(--cloth-mid) 77%,#11140d 89%,var(--cloth-lit));clip-path:polygon(4% 14%,24% 3%,43% 0,61% 7%,78% 10%,94% 23%,100% 46%,91% 57%,89% 100%,2% 100%,10% 65%,0 40%);z-index:3}
.r2-metal .r2-mc-torso::before{content:'';inset:0;background:radial-gradient(ellipse at 58% 34%,#0007,transparent 42%),linear-gradient(171deg,#f7dfa448,transparent 15%,transparent 80%,#0507049e);clip-path:polygon(0 9%,32% 0,68% 12%,100% 38%,80% 41%,43% 16%,3% 33%)}
.r2-metal .r2-mc-sleeve-left{left:79px;top:131px;width:45px;height:51px;clip-path:polygon(29% 0,100% 7%,89% 68%,31% 100%,0 76%,4% 38%);background:linear-gradient(115deg,var(--rim),var(--cloth-mid) 10%,#13160d 23%,var(--cloth-mid) 47%,#14150c 63%,var(--cloth-lit) 78%,var(--cloth-dark) 83%);z-index:4}
.r2-metal .r2-mc-sleeve-left::after{content:'';left:0;bottom:7px;width:44px;height:3px;background:linear-gradient(90deg,transparent,var(--seam),var(--cloth-dark));transform:rotate(-29deg);border-top:.7px solid var(--rim);opacity:.8}
.r2-metal .r2-mc-sleeve-right{left:203px;top:135px;width:39px;height:56px;background:linear-gradient(76deg,#10130c,var(--cloth-mid) 49%,var(--cloth-lit) 62%,var(--cloth-dark) 67%,var(--cloth-mid) 83%,var(--rim));clip-path:polygon(0 0,62% 12%,100% 72%,83% 96%,21% 100%,9% 66%);z-index:4}
.r2-metal .r2-mc-sleeve-right::after{content:'';left:7px;bottom:5px;width:31px;height:2px;transform:rotate(-15deg);background:var(--rim);opacity:.48}
.r2-metal .r2-mc-back-arm{left:47px;top:168px;width:53px;height:74px;clip-path:polygon(61% 0,100% 18%,89% 44%,65% 72%,32% 100%,0 89%,14% 56%,37% 27%);background:linear-gradient(118deg,var(--skin-light) 1%,#967b45 8%,#262516 20%,#10130c 46%,var(--skin) 66%,#baa06a 73%,#171a0f 78%,#15170d);z-index:2}
.r2-metal .r2-mc-back-arm-light{left:55px;top:174px;width:40px;height:61px;clip-path:polygon(75% 0,81% 7%,39% 52%,17% 92%,0 100%,22% 49%);background:linear-gradient(170deg,var(--rim),var(--skin-light) 50%,transparent);opacity:.66;z-index:3}
.r2-metal .r2-mc-back-arm-crease{left:59px;top:199px;width:26px;height:20px;clip-path:polygon(0 43%,42% 31%,100% 0,47% 45%,2% 54%);background:var(--skin-light);opacity:.48;z-index:3}
.r2-metal .r2-mc-front-arm{left:218px;top:179px;width:32px;height:47px;clip-path:polygon(0 8%,70% 0,100% 54%,93% 83%,54% 100%,16% 59%);background:linear-gradient(94deg,#161a0f,var(--skin) 38%,#b39255 74%,var(--rim) 80%,#252517 87%);z-index:4}
.r2-metal .r2-mc-forearm{left:199px;top:207px;width:49px;height:26px;clip-path:polygon(0 18%,26% 0,78% 22%,100% 14%,100% 68%,79% 100%,25% 68%,0 63%);background:linear-gradient(164deg,var(--rim),var(--skin-light) 18%,var(--skin) 43%,#15190e 74%,#4f4426);z-index:5}
.r2-metal .r2-mc-elbow{left:228px;top:206px;width:16px;height:19px;border-radius:60% 32% 63% 36%;background:radial-gradient(ellipse at 70% 31%,#ad8f51,var(--skin) 46%,#1c2114 72%);z-index:6;opacity:.8}
.r2-metal .r2-mc-wrist{left:190px;top:208px;width:26px;height:17px;transform:rotate(14deg);background:linear-gradient(var(--skin-light),#2d2b19 42%,#12160c);border-radius:30% 20% 25% 30%;z-index:6}
.r2-metal .r2-mc-hand{left:179px;top:206px;width:27px;height:19px;background:linear-gradient(155deg,var(--skin-light),var(--skin) 30%,#171a0e 78%);clip-path:polygon(0 29%,22% 6%,68% 0,100% 20%,94% 64%,49% 100%,7% 73%);z-index:6}
.r2-metal .r2-mc-cloth-folds{z-index:5}
.r2-metal .r2-mc-cloth-fold{transform-origin:50% 10%}
.r2-metal .r2-mc-seams{z-index:6}
.r2-metal .r2-mc-collar{left:145px;top:120px;width:47px;height:24px;clip-path:polygon(4% 0,22% 18%,58% 39%,86% 31%,100% 46%,72% 65%,39% 47%,0 16%);background:linear-gradient(173deg,var(--rim),var(--cloth-dark) 29%,var(--cloth-lit) 42%,var(--cloth-dark) 55%);z-index:7}
.r2-metal .r2-mc-collar-piping{left:151px;top:126px;width:44px;height:12px;clip-path:polygon(0 0,54% 67%,100% 71%,71% 81%,53% 80%,0 8%);background:var(--rim);opacity:.68;z-index:7}
.r2-metal .r2-mc-shirt-grain{left:98px;top:140px;width:122px;height:103px;clip-path:polygon(0 0,74% 0,100% 38%,91% 100%,4% 100%,13% 33%);background:repeating-linear-gradient(13deg,transparent 0 2.6px,#e3d4a00c 2.8px 3.1px),repeating-linear-gradient(101deg,transparent 0 2px,#0a0a0933 2.3px 2.7px);z-index:7;opacity:.7}
.r2-metal .r2-mc-head{left:149px;top:51px;width:57px;height:78px;clip-path:polygon(15% 5%,38% 0,66% 2%,85% 13%,94% 30%,94% 45%,100% 47%,96% 61%,88% 66%,82% 84%,65% 100%,36% 94%,23% 76%,17% 59%,9% 53%,4% 40%,7% 26%);background:radial-gradient(ellipse at 41% 31%,#080c08 25%,#10170e 57%,transparent 77%),linear-gradient(108deg,var(--skin-light),#151a10 17%,#12190e 76%,var(--skin) 88%,var(--rim) 94%,#262b18);z-index:8}
.r2-metal .r2-mc-head::after{content:'';inset:0;background:repeating-radial-gradient(ellipse at 51% 33%,#b7a36c21 0 .4px,transparent .8px 3px),repeating-linear-gradient(115deg,transparent 0 2.4px,#0004 2.7px 3px);opacity:.38}
.r2-metal .r2-mc-face-plane{left:169px;top:85px;width:31px;height:36px;clip-path:polygon(22% 0,100% 5%,69% 62%,24% 100%,0 44%);background:linear-gradient(115deg,transparent,#ab8d4c22 60%,var(--skin) 85%);z-index:8}
.r2-metal .r2-mc-nose-plane{display:none!important}
.r2-metal .r2-mc-brow,.r2-metal .r2-mc-eye{display:none!important}
.r2-metal .r2-mc-ear{left:149px;top:86px;width:10px;height:19px;border-radius:65% 32% 39% 60%;transform:rotate(-9deg);background:radial-gradient(ellipse at 57% 47%,#12170e 24%,var(--skin) 35%,#9b804d 44%,#313622 63%,#10150c 69%);border-left:.8px solid var(--skin-light);z-index:9}
.r2-metal .r2-mc-hair{left:147px;top:45px;width:60px;height:46px;clip-path:polygon(2% 37%,7% 25%,4% 19%,14% 15%,13% 9%,23% 11%,28% 1%,34% 6%,44% 0,48% 6%,58% 0,63% 8%,73% 4%,77% 12%,87% 11%,86% 20%,96% 26%,93% 36%,100% 42%,94% 54%,96% 70%,91% 93%,83% 100%,83% 66%,65% 56%,39% 58%,15% 74%,14% 92%,6% 77%,5% 56%,0 48%);background:radial-gradient(ellipse at 43% 67%,#050905 30%,#0c1109 55%,#312f17 75%,var(--rim) 87%,#fff3b4 92%);z-index:9}
.r2-metal .r2-mc-hair::after{content:'';inset:0;background:repeating-radial-gradient(ellipse at 52% 90%,transparent 0 1.6px,#d4b77038 2px 2.7px,transparent 3.1px 4.6px),repeating-linear-gradient(125deg,transparent 0 2px,#0b100ac9 2.2px 3.1px);opacity:.66}
.r2-metal .r2-mc-hair-light{left:151px;top:47px;width:50px;height:17px;border-radius:50%;background:radial-gradient(ellipse at 40% 20%,var(--rim),transparent 49%);mask-image:repeating-linear-gradient(120deg,#000 0 1px,transparent 2px 3px);opacity:.7;z-index:10}
.r2-metal .r2-mc-temple{left:151px;top:77px;width:9px;height:15px;border-radius:30% 70% 30% 60%;background:linear-gradient(90deg,#151a10,var(--skin) 70%,#11170d);z-index:10}
.r2-metal .r2-mc-ball{position:absolute;left:183px;top:186px;width:58px;height:59px;z-index:11;transform:rotate(-7deg)}
.r2-metal .r2-mc-ball-surface{inset:0;border-radius:50%;background:radial-gradient(circle at 30% 21%,#fffde0 1%,#f1db91 15%,#c29538 46%,#534015 77%,#130f07 97%);border:1px solid #ffe4a1;box-shadow:inset 2px 2px 5px #fff2b2aa,inset -5px -6px 8px #0f0e08c2,0 2px 4px #0007}
.r2-metal .r2-mc-ball-panel{z-index:1}
.r2-metal .r2-mc-ball-seams{inset:0;border-radius:50%;background:conic-gradient(from 21deg at 54% 45%,transparent 0 30deg,#efc867 31deg 32deg,transparent 33deg 109deg,#201705 110deg 111deg,transparent 112deg 183deg,#fff3b5 184deg 185deg,transparent 186deg 247deg,#201705 248deg 250deg,transparent 251deg);opacity:.8;z-index:2}
.r2-metal .r2-mc-ball-gloss{inset:0;border-radius:50%;background:radial-gradient(ellipse at 28% 18%,#fffde8b8 2%,transparent 29%,#0a0908aa 98%);z-index:3}
.r2-metal .r2-mc-ball-crown{left:14px;top:-18px;width:34px;height:22px;background:linear-gradient(103deg,#66420c,#fff5b2 18%,#b88629 47%,#fff7bb 75%,#7a4c0c);clip-path:polygon(0 12%,25% 49%,30% 0,48% 42%,66% 0,72% 51%,100% 14%,88% 86%,13% 100%);z-index:4}
.r2-metal .r2-mc-ball-crown::after{content:'';left:5px;bottom:4px;width:25px;height:2px;background:#fff1b3;box-shadow:0 -3px 0 #5a3e11}
.r2-metal .r2-mc-ball-fingers{left:-5px;top:44px;width:20px;height:5px;border-radius:50%;transform:rotate(18deg);background:linear-gradient(#ddc27f,#675330 36%,#2d2a17);box-shadow:3px 4px 0 -.2px #9a7f47,6px 7px 0 -.3px #695530;z-index:5}
.r2-metal .r2-mc-laurel{z-index:16}
.r2-metal .r2-mc-laurel-stem{left:19px;top:130px;width:44px;height:155px;border-left:1.4px solid var(--metal-light);border-bottom:1px solid var(--metal);border-radius:0 0 0 80%;transform:rotate(-8deg);box-shadow:-1.2px 0 0 #5b3d1a,inset 1px 0 0 #fff3b34d}
.r2-metal .r2-mc-laurel-leaf{border-radius:100% 0 100% 0;transform-origin:50% 100%;background:linear-gradient(56deg,var(--leaf-shade) 4%,var(--metal) 23%,var(--metal-light) 47%,#7d552a 49%,var(--metal) 57%,var(--metal-light) 84%,var(--metal-dark) 100%);box-shadow:inset .5px 0 0 var(--metal-light)}
.r2-metal .r2-mc-laurel-leaf::before{content:'';inset:0;border-radius:inherit;background:repeating-linear-gradient(40deg,transparent 0 3px,#36210d8a 3.3px 3.7px,transparent 4px 7px);opacity:.6}
.r2-metal .r2-mc-laurel-leaf::after{content:'';left:49%;top:12%;width:.6px;height:80%;background:var(--metal-light);transform:rotate(19deg);opacity:.85}
.r2-metal .r2-mc-portrait-fade{left:26px;top:211px;width:248px;height:143px;background:linear-gradient(transparent,var(--base) 37%,var(--base) 100%);clip-path:polygon(0 0,100% 0,100% 88%,84% 94%,50% 100%,16% 94%,0 88%);z-index:17}
.r2-metal .r2-mc-name-recess{left:33px;top:237px;width:234px;height:34px;background:linear-gradient(174deg,transparent 4%,#b4974840 4.6%,var(--base) 6%,var(--base) 89%,#b4974840 90%,transparent 92%);clip-path:polygon(0 21%,21% 5%,52% 0,79% 5%,100% 20%,94% 87%,50% 100%,6% 87%);z-index:18}
.r2-metal .r2-mc-footer-grain{left:29px;top:273px;width:242px;height:81px;background:repeating-linear-gradient(128deg,transparent 0 3px,#c5a76508 3.3px 3.8px,transparent 4px 8px),radial-gradient(ellipse at 50% 0,#c59e3020,transparent 66%);clip-path:polygon(0 0,100% 0,100% 78%,50% 100%,0 78%);z-index:18}
.r2-metal .r2-mc-footer-rule{left:40px;top:307px;width:220px;height:.6px;background:linear-gradient(90deg,transparent,var(--metal) 24%,var(--metal) 76%,transparent);opacity:.19;z-index:19}
.r2-metal .r2-mc-crest{position:absolute;left:185px;top:277px;width:33px;height:36px;z-index:21}
.r2-metal .r2-mc-crest-shield{inset:0;background:linear-gradient(110deg,var(--metal),var(--metal-light) 34%,var(--metal-dark) 65%,var(--metal-light));clip-path:polygon(4% 3%,32% 12%,50% 0,68% 12%,96% 3%,91% 64%,75% 83%,50% 100%,25% 83%,9% 64%)}
.r2-metal .r2-mc-crest-inlay{inset:2px;background:linear-gradient(120deg,var(--metal-dark),var(--base) 40%,#21190b);clip-path:polygon(4% 3%,32% 12%,50% 0,68% 12%,96% 3%,91% 64%,75% 83%,50% 100%,25% 83%,9% 64%)}
.r2-metal .r2-mc-crest-sword{left:15px;top:7px;width:4px;height:24px;background:var(--metal-light);clip-path:polygon(50% 0,100% 25%,72% 59%,100% 68%,65% 71%,65% 94%,50% 100%,35% 94%,35% 71%,0 68%,28% 59%,0 25%)}
.r2-metal .r2-mc-crest-wing{left:7px;top:9px;width:9px;height:16px;background:linear-gradient(90deg,var(--metal),var(--metal-light));clip-path:polygon(0 0,100% 48%,86% 83%,65% 100%,41% 92%,59% 78%,19% 66%,48% 60%,9% 39%,39% 41%)}
.r2-metal .r2-mc-crest-wing-right{left:18px;transform:scaleX(-1)}

/* NEXUS — white-hot fractures, graphite skin, and a wind-folded cape. */
.r2-metal.r2-mc-nexus{--metal:#a6aaa7;--metal-light:#f1f1e7;--metal-dark:#4e514d;--base:#090b0d;--rim:#e0e2d6;--cloth-dark:#05090b;--cloth-mid:#343b3c;--cloth-lit:#9ba29a;--seam:#949e99;--skin:#333b36;--skin-light:#a8b2a1}
.r2-metal.r2-mc-nexus .r2-mc-aura{background:radial-gradient(ellipse at 51% 43%,transparent 49%,#e5f0eb0b 61%,transparent 75%)}
.r2-metal.r2-mc-nexus .r2-mc-foot-glow{background:radial-gradient(ellipse,#d2dfdd3f,transparent 65%)}
.r2-metal.r2-mc-nexus .r2-mc-plate{background:radial-gradient(ellipse at 65% 29%,#626963 0,#222826 31%,#080b0d 67%)}
.r2-metal.r2-mc-nexus .r2-mc-frame-glints{background:linear-gradient(transparent,#edf5ed 3%,transparent 17%,transparent 30%,#edf4ed 61%,transparent 74%,#f3f3e5 86%,transparent);box-shadow:263px 0 0 -.25px #dfe5d8b3}
.r2-metal.r2-mc-nexus .r2-mc-frame-incision{background:linear-gradient(90deg,#e0e4dc77,transparent 1%,transparent 99%,#c8d7cd88)}
.r2-metal.r2-mc-nexus .r2-mc-top-fleur{display:none}
.r2-metal.r2-mc-nexus .r2-mc-backlight{background:radial-gradient(ellipse 81px 109px at 190px 101px,#f7f9e175,transparent 86%),linear-gradient(90deg,#030609d4 23%,transparent 54%)}
.r2-metal .r2-mc-crown{position:absolute;left:139px;top:34px;width:35px;height:25px;z-index:4}
.r2-metal .r2-mc-crown-points{inset:0;background:linear-gradient(100deg,#78817d,#fffef2 20%,#d4d9cf 49%,#fffef0 70%,#7c8985);clip-path:polygon(0 14%,23% 54%,28% 1%,45% 45%,51% 0,62% 46%,78% 4%,81% 56%,100% 17%,87% 84%,15% 84%)}
.r2-metal .r2-mc-crown-band{left:5px;top:21px;width:26px;height:3px;border-top:1px solid #fffdf0;border-bottom:1px solid #e2e9dc;background:#75817b;transform:rotate(-1deg)}
.r2-metal .r2-mc-crown-jewels{left:5px;top:16px;width:2px;height:2px;border-radius:50%;background:#0b100e;box-shadow:6px 1px 0 #121712,12px 1px 0 #121712,18px 0 0 #121712}
.r2-metal .r2-mc-cape{z-index:1}
.r2-metal .r2-mc-cape-body{left:35px;top:125px;width:153px;height:127px;clip-path:polygon(89% 0,100% 11%,86% 43%,68% 60%,64% 95%,45% 100%,21% 93%,0 99%,18% 78%,7% 80%,21% 58%,3% 48%,25% 45%,42% 23%,60% 15%);background:linear-gradient(150deg,#a5ada3 0,#1c2425 14%,#070b0d 35%,#34403f 53%,#070b0e 60%,#1c2626 78%,#040609);z-index:0}
.r2-metal .r2-mc-cape-hem{left:38px;top:155px;width:104px;height:93px;clip-path:polygon(90% 0,52% 38%,20% 55%,0 96%,4% 98%,23% 59%,55% 41%,100% 0);background:linear-gradient(170deg,#d4d8cb,#5e6b66 53%,#ced8cb 72%,#1b2826);z-index:1}
.r2-metal .r2-mc-cape-fold{z-index:2}
.r2-metal.r2-mc-nexus .r2-mc-neck{left:169px;top:108px;transform:rotate(11deg)}
.r2-metal.r2-mc-nexus .r2-mc-neck-tendon{left:177px;top:117px;transform:rotate(-10deg)}
.r2-metal.r2-mc-nexus .r2-mc-torso{left:128px;top:126px;width:101px;height:130px;clip-path:polygon(17% 9%,51% 0,78% 10%,94% 29%,100% 54%,85% 65%,86% 100%,0 100%,5% 63%,0 33%)}
.r2-metal.r2-mc-nexus .r2-mc-sleeve-left{left:142px;top:140px;width:37px;height:45px;opacity:.4}
.r2-metal.r2-mc-nexus .r2-mc-sleeve-right{left:195px;top:141px;width:38px;height:54px;transform:rotate(-7deg)}
.r2-metal.r2-mc-nexus .r2-mc-back-arm,.r2-metal.r2-mc-nexus .r2-mc-back-arm-light,.r2-metal.r2-mc-nexus .r2-mc-back-arm-crease{opacity:0}
.r2-metal.r2-mc-nexus .r2-mc-front-arm{left:210px;top:185px;width:30px;height:46px;transform:rotate(-12deg)}
.r2-metal.r2-mc-nexus .r2-mc-forearm{left:225px;top:212px;width:31px;height:43px;transform:rotate(-29deg);clip-path:polygon(0 0,66% 0,100% 100%,57% 100%,19% 53%)}
.r2-metal.r2-mc-nexus .r2-mc-elbow{left:221px;top:215px}
.r2-metal.r2-mc-nexus .r2-mc-wrist,.r2-metal.r2-mc-nexus .r2-mc-hand{opacity:0}
.r2-metal.r2-mc-nexus .r2-mc-collar{left:162px;top:126px;transform:rotate(8deg)}
.r2-metal.r2-mc-nexus .r2-mc-collar-piping{left:161px;top:132px;transform:rotate(8deg)}
.r2-metal.r2-mc-nexus .r2-mc-shirt-grain{left:135px;top:143px;width:88px}
.r2-metal.r2-mc-nexus .r2-mc-head{left:164px;top:56px;width:58px;height:77px;clip-path:polygon(18% 3%,48% 0,74% 8%,90% 25%,87% 42%,95% 52%,100% 60%,88% 65%,91% 72%,84% 76%,82% 88%,68% 100%,45% 92%,31% 80%,20% 64%,8% 56%,3% 41%,5% 20%);background:radial-gradient(ellipse at 35% 31%,#080e0e 24%,#0e1615 55%,transparent 71%),linear-gradient(100deg,#a7b4a3,#24332e 15%,#101917 63%,#435348 86%,#d5deca 93%,#6e8070)}
.r2-metal.r2-mc-nexus .r2-mc-hair{left:163px;top:51px;width:58px;height:45px;background:radial-gradient(ellipse at 43% 67%,#05090b 31%,#0d1615 58%,#9fac9a 87%,#eef2df 92%)}
.r2-metal.r2-mc-nexus .r2-mc-hair-light{left:169px;top:53px}
.r2-metal.r2-mc-nexus .r2-mc-ear{left:172px;top:91px;width:10px;height:17px;transform:rotate(-14deg)}
.r2-metal.r2-mc-nexus .r2-mc-temple{left:179px;top:79px;width:11px;height:18px}
.r2-metal.r2-mc-nexus .r2-mc-face-plane{left:188px;top:87px;width:28px;height:36px;clip-path:polygon(0 18%,100% 0,74% 57%,91% 69%,59% 100%,5% 77%);background:linear-gradient(105deg,#101915,#28382b 62%,#91a184 97%)}
.r2-metal.r2-mc-nexus .r2-mc-nose-plane{display:block!important;left:212px;top:89px;width:10px;height:19px;clip-path:polygon(0 0,29% 14%,49% 56%,100% 87%,26% 100%,31% 65%);background:linear-gradient(94deg,#112017,#afbaa0);z-index:10}
.r2-metal.r2-mc-nexus .r2-mc-brow{display:block!important;left:202px;top:87px;width:11px;height:5px;background:linear-gradient(175deg,#71816b,#0a100d 70%);transform:rotate(12deg);clip-path:polygon(0 4%,100% 20%,92% 100%,27% 55%);z-index:10}
.r2-metal.r2-mc-nexus .r2-mc-eye{display:block!important;left:205px;top:94px;width:7px;height:1.1px;background:#050a08;box-shadow:0 1.1px 0 #74816a66;z-index:10}
.r2-metal.r2-mc-nexus .r2-mc-name-recess{background:linear-gradient(174deg,transparent 4%,#c2cfbd40 4.6%,var(--base) 6%,var(--base) 89%,#b6c1b540 90%,transparent 92%)}
.r2-metal.r2-mc-nexus .r2-mc-footer-grain{background:radial-gradient(ellipse at 50% 0,#9eafa315,transparent 70%),repeating-linear-gradient(135deg,transparent 0 5px,#dbe8dc06 5.3px 5.7px,transparent 6px 9px)}

/* AURUM — chalk, warm shadow, gold inlay, and interrupted orbital ellipses. */
.r2-metal.r2-mc-aurum{--metal:#c49c53;--metal-light:#fff3c8;--metal-dark:#84612e;--base:#e8e5dc;--rim:#fff8d4;--cloth-dark:#8b897b;--cloth-mid:#c9c6b5;--cloth-lit:#fffdf0;--seam:#8d866b;--skin:#4a493c;--skin-light:#a29b7a}
.r2-metal.r2-mc-aurum .r2-mc-aura{background:radial-gradient(ellipse at 51% 45%,transparent 45%,#ece5cf0e 60%,transparent 77%)}
.r2-metal.r2-mc-aurum .r2-mc-foot-glow{background:radial-gradient(ellipse,#e8d2a044,transparent 67%)}
.r2-metal.r2-mc-aurum .r2-mc-plate{background:linear-gradient(123deg,#eeeae0,#faf8f1 36%,#dedbce 65%,#f4f0e7)}
.r2-metal.r2-mc-aurum .r2-mc-frame-incision{background:linear-gradient(90deg,#b98e4b8c,transparent 1%,transparent 99%,#b98e4ba3)}
.r2-metal.r2-mc-aurum .r2-mc-frame-glints{background:linear-gradient(transparent,#fff7df 3%,transparent 33%,#fff8d8 64%,transparent 91%);box-shadow:263px 0 0 -.25px #fff8e4b3}
.r2-metal.r2-mc-aurum .r2-mc-backlight{background:radial-gradient(ellipse 100px 118px at 171px 105px,#fffdf8 4%,#fffaf080 48%,transparent 90%)}
.r2-metal .r2-mc-marble-cloud{inset:0;background:radial-gradient(ellipse at 84% 14%,#aaa39326,transparent 30%),radial-gradient(ellipse at 12% 49%,#b6a27a2b,transparent 24%),linear-gradient(126deg,transparent 10%,#b9b3a222 13%,#fffdf0b3 15%,transparent 24%,#aca18c24 35%,transparent 37%,#aa9c7c1a 59%,transparent 62%);z-index:1}
.r2-metal .r2-mc-marble-grain{inset:0;background:repeating-radial-gradient(ellipse at 28% 36%,#4b483513 0 .4px,transparent .7px 4px),repeating-linear-gradient(119deg,transparent 0 4px,#b4a98913 4.3px 4.8px,transparent 5px 13px);background-size:21px 23px,100% 100%;opacity:.7;z-index:2}
.r2-metal .r2-mc-marble-lode{z-index:3;opacity:.7}
.r2-metal .r2-mc-orbits-back{z-index:5}
.r2-metal .r2-mc-orbits-front{z-index:12}
.r2-metal .r2-mc-orbit{left:22px;top:118px;width:265px;height:79px;border:2.2px solid #c49a43;border-radius:50%;transform:rotate(-32deg);box-shadow:inset 0 1px 0 #fffce6,0 1px 0 #fff3c2,inset 0 -1px 0 #70501b,0 -1px 0 #8e692c;background:transparent}
.r2-metal .r2-mc-orbit-two{left:30px;top:169px;width:253px;height:76px;transform:rotate(-27deg);border-width:3px}
.r2-metal .r2-mc-orbit-three{left:36px;top:123px;width:226px;height:87px;transform:rotate(-38deg);border-width:.9px;opacity:.65}
.r2-metal .r2-mc-orbits-back .r2-mc-orbit{mask-image:linear-gradient(#000 0 49%,transparent 52%)}
.r2-metal .r2-mc-orbits-front .r2-mc-orbit{mask-image:linear-gradient(transparent 0 49%,#000 52%)}
.r2-metal .r2-mc-sphere{width:38px;height:39px;border-radius:50%;background:radial-gradient(circle at 28% 24%,#fffef8 0,#f7f4e7 25%,#d5d0bb 62%,#9a8863 91%);border:.8px solid #e0c991;box-shadow:inset 2px 0 0 #fffaf4,inset -2px -2px 4px #9b875563,0 1px 2px #76634266;z-index:20}
.r2-metal .r2-mc-sphere::before{content:'';inset:1px;border-radius:50%;clip-path:polygon(39% 0,48% 19%,39% 31%,60% 60%,58% 71%,81% 100%,72% 100%,53% 73%,55% 62%,34% 31%,44% 18%,35% 0);background:linear-gradient(110deg,#b98c39,#d8b76b,#9c7938)}
.r2-metal .r2-mc-sphere::after{content:'';inset:1px;border-radius:50%;background:repeating-linear-gradient(126deg,transparent 0 8px,#a38c6030 8.6px 9px,transparent 9.5px 16px);opacity:.7}
.r2-metal .r2-mc-sphere-left{left:10px;top:157px}
.r2-metal .r2-mc-sphere-right{left:252px;top:188px;width:34px;height:35px}
.r2-metal .r2-mc-sphere-distant{left:240px;top:108px;width:29px;height:30px;z-index:6;background:radial-gradient(circle at 28% 24%,#f4d48e 0,#d6b563 27%,#7e5e28 75%,#3b2a0f 94%);opacity:.86}
.r2-metal.r2-mc-aurum .r2-mc-neck{left:159px;top:105px;width:35px;height:43px;background:linear-gradient(105deg,#3b3b30,#6f6d57 55%,#33362b 79%,#e5dbc0);clip-path:polygon(10% 0,83% 0,78% 44%,100% 70%,50% 100%,0 67%,16% 42%)}
.r2-metal.r2-mc-aurum .r2-mc-neck-tendon{left:164px;top:111px;background:linear-gradient(116deg,transparent 18%,#aaa386 21%,#4e5040 27%,transparent 47%)}
.r2-metal.r2-mc-aurum .r2-mc-torso{left:113px;top:125px;width:126px;height:128px;background:linear-gradient(107deg,#a9a798,#eeecdf 18%,#f6f3e6 38%,#c7c3b0 66%,#f5f2e8 80%,#a6a493 97%);clip-path:polygon(5% 17%,26% 5%,39% 0,50% 17%,65% 0,81% 4%,95% 19%,100% 47%,90% 54%,91% 100%,0 100%,4% 64%,0 37%)}
.r2-metal.r2-mc-aurum .r2-mc-torso::before{background:radial-gradient(ellipse at 54% 35%,#fffef6bd,transparent 51%),linear-gradient(170deg,#fffdf9 0,transparent 42%,#b6b19b4d);clip-path:polygon(0 15%,33% 0,65% 15%,100% 35%,90% 63%,40% 31%,3% 39%)}
.r2-metal.r2-mc-aurum .r2-mc-sleeve-left{left:103px;top:144px;width:38px;height:46px;background:linear-gradient(105deg,#f9f7ed,#b9b7a7 15%,#eee9d7 30%,#c9c6b5 58%,#f9f6e9 79%,#8a897a 86%);transform:rotate(9deg)}
.r2-metal.r2-mc-aurum .r2-mc-sleeve-right{left:215px;top:137px;width:39px;height:54px;background:linear-gradient(76deg,#c1bcaa,#faf8ec 27%,#d9d5c5 46%,#b0ac96 51%,#f6f2e8 75%,#fffaf1);transform:rotate(-9deg)}
.r2-metal.r2-mc-aurum .r2-mc-sleeve-left::after,.r2-metal.r2-mc-aurum .r2-mc-sleeve-right::after{background:#9b947e;border-color:#fffdf2}
.r2-metal.r2-mc-aurum .r2-mc-back-arm{left:98px;top:181px;width:33px;height:61px;background:linear-gradient(100deg,#8e8c78,#f2eedc 12%,#c3bd9f 36%,#807d66 65%,#dbd4ba);clip-path:polygon(14% 0,100% 3%,76% 57%,80% 100%,0 98%,1% 55%)}
.r2-metal.r2-mc-aurum .r2-mc-back-arm-light{left:100px;top:183px;width:29px;height:53px;opacity:.48}
.r2-metal.r2-mc-aurum .r2-mc-back-arm-crease{left:101px;top:211px}
.r2-metal.r2-mc-aurum .r2-mc-front-arm{left:235px;top:182px;width:29px;height:61px;background:linear-gradient(99deg,#aaa58b,#ece5cf 43%,#a6a186 68%,#f6eed4 87%,#b4ae92);clip-path:polygon(0 6%,70% 0,100% 100%,40% 96%,8% 53%)}
.r2-metal.r2-mc-aurum .r2-mc-forearm,.r2-metal.r2-mc-aurum .r2-mc-wrist,.r2-metal.r2-mc-aurum .r2-mc-hand{opacity:0}
.r2-metal.r2-mc-aurum .r2-mc-elbow{left:242px;top:222px;background:linear-gradient(90deg,#8f8c75,#d7ceb3 68%,#a9a38a)}
.r2-metal.r2-mc-aurum .r2-mc-collar{left:151px;top:125px;width:50px;height:27px;background:linear-gradient(110deg,#f8f4e4,#8b826c 21%,#fffcef 32%,#cec7b0 59%,#fff8e4 90%);clip-path:polygon(0 3%,16% 0,49% 71%,85% 0,100% 4%,52% 100%,40% 85%)}
.r2-metal.r2-mc-aurum .r2-mc-collar-piping{left:158px;top:129px;width:35px;height:21px;background:#b79a5c;clip-path:polygon(0 0,48% 88%,100% 0,50% 100%);opacity:.74}
.r2-metal.r2-mc-aurum .r2-mc-shirt-grain{left:116px;top:145px;background:repeating-linear-gradient(13deg,transparent 0 2px,#4f4d3210 2.4px 2.7px),repeating-linear-gradient(101deg,transparent 0 2.4px,#fffdf53b 2.7px 3px);opacity:.7}
.r2-metal.r2-mc-aurum .r2-mc-head{left:148px;top:51px;width:60px;height:79px;clip-path:polygon(28% 0,61% 1%,84% 12%,94% 30%,91% 51%,83% 70%,60% 92%,43% 100%,26% 91%,24% 78%,16% 73%,16% 65%,0 61%,12% 46%,10% 29%,17% 12%);background:radial-gradient(ellipse at 56% 37%,#585a49 5%,#3b4033 52%,transparent 82%),linear-gradient(86deg,#373c30,#777965 41%,#4a4c3e 75%,#c6bea1 98%)}
.r2-metal.r2-mc-aurum .r2-mc-head::after{background:repeating-radial-gradient(ellipse at 31% 48%,#cec6a16b 0 .3px,transparent .7px 2.4px),repeating-linear-gradient(113deg,transparent 0 2.7px,#151e172b 3px 3.4px);opacity:.46}
.r2-metal.r2-mc-aurum .r2-mc-hair{left:150px;top:46px;width:57px;height:44px;clip-path:polygon(8% 26%,21% 8%,38% 1%,61% 0,79% 11%,94% 29%,100% 54%,92% 86%,83% 100%,79% 64%,65% 53%,51% 47%,29% 52%,10% 68%,0 62%);background:radial-gradient(ellipse at 45% 70%,#393e31 20%,#4c5140 63%,#aca98c 92%)}
.r2-metal.r2-mc-aurum .r2-mc-hair::after{background:repeating-radial-gradient(ellipse at 48% 80%,#d4cba661 0 .4px,transparent .8px 2.2px),repeating-linear-gradient(123deg,transparent 0 1.8px,#252e2180 2.1px 2.6px);opacity:.65}
.r2-metal.r2-mc-aurum .r2-mc-hair-light{left:156px;top:49px;opacity:.43}
.r2-metal.r2-mc-aurum .r2-mc-face-plane{left:163px;top:85px;width:28px;height:35px;clip-path:polygon(0 16%,73% 0,100% 40%,37% 100%,4% 80%,26% 53%);background:linear-gradient(130deg,#888672,#4b5040 34%,#686b55 64%,#303b2a 83%)}
.r2-metal.r2-mc-aurum .r2-mc-nose-plane{display:block!important;left:149px;top:85px;width:15px;height:19px;clip-path:polygon(74% 0,100% 11%,46% 74%,81% 88%,37% 100%,0 75%);background:linear-gradient(126deg,#b1ab8e,#535947 37%,#273221 75%);z-index:10}
.r2-metal.r2-mc-aurum .r2-mc-brow{display:block!important;left:159px;top:82px;width:15px;height:5px;transform:rotate(-13deg);background:linear-gradient(#b0a88c,#333d2c 65%);clip-path:polygon(0 40%,71% 0,100% 70%,41% 64%,0 100%);z-index:10}
.r2-metal.r2-mc-aurum .r2-mc-eye{display:block!important;left:160px;top:88px;width:9px;height:1.4px;background:#2c3527;transform:rotate(-9deg);box-shadow:0 1.4px 0 #8e8e7180;z-index:10}
.r2-metal.r2-mc-aurum .r2-mc-ear{left:192px;top:86px;width:10px;height:19px;transform:rotate(9deg);background:radial-gradient(ellipse at 45% 47%,#353d2c 21%,#777a60 36%,#aaa185 44%,#515d43 64%);border-left:0;border-right:1px solid #d8ccb0}
.r2-metal.r2-mc-aurum .r2-mc-temple{left:184px;top:76px;width:11px;height:20px;background:linear-gradient(100deg,#5b614c,#394530 70%,#acaa87)}
.r2-metal.r2-mc-aurum .r2-mc-portrait-fade{background:linear-gradient(transparent,#eae7ddce 24%,var(--base) 42%,var(--base) 100%)}
.r2-metal.r2-mc-aurum .r2-mc-name-recess{background:linear-gradient(174deg,transparent 4%,#a8966e63 4.6%,#eeece4 6%,#ece9df 89%,#a8966e63 90%,transparent 92%)}
.r2-metal.r2-mc-aurum .r2-mc-footer-grain{background:repeating-linear-gradient(133deg,transparent 0 5px,#6d634e0b 5.3px 5.7px,transparent 6px 10px),radial-gradient(ellipse at 30% 62%,#fffdf36b,transparent 72%)}
.r2-metal .r2-mc-temple-roof{left:1px;top:1px;width:31px;height:9px;clip-path:polygon(50% 0,100% 80%,95% 100%,5% 100%,0 80%);background:linear-gradient(160deg,#514b3a,#28291e 55%,#786b4b)}
.r2-metal .r2-mc-temple-capital{left:4px;top:11px;width:25px;height:2px;background:#443e2d;box-shadow:0 2px 0 #78705a}
.r2-metal .r2-mc-temple-column{top:15px;width:3px;height:15px;background:linear-gradient(90deg,#3a3628,#a3977b 45%,#302d21 72%);border-radius:1px}
.r2-metal .r2-mc-temple-column::after{content:'';left:-1px;bottom:-1px;width:5px;height:2px;background:#4b4432}
.r2-metal .r2-mc-temple-plinth{left:3px;top:32px;width:27px;height:2px;background:#3c392b;box-shadow:-1px 2px 0 #776a50}

/* LEGACY — carved bronze, embroidered cloth, and a receding Roman arcade. */
.r2-metal.r2-mc-legacy{--metal:#b98553;--metal-light:#f2d1a1;--metal-dark:#684224;--base:#1f140c;--rim:#f4cc91;--cloth-dark:#1b170e;--cloth-mid:#705231;--cloth-lit:#c8a26b;--seam:#b88c53;--skin:#604326;--skin-light:#c9a06b}
.r2-metal.r2-mc-legacy .r2-mc-plate{background:radial-gradient(ellipse at 69% 26%,#c0925e 0,#8c5f35 33%,#382515 65%,#1d150e)}
.r2-metal.r2-mc-legacy .r2-mc-aura{background:radial-gradient(ellipse at 50% 44%,transparent 46%,#c18b4b10 60%,transparent 76%)}
.r2-metal.r2-mc-legacy .r2-mc-foot-glow{background:radial-gradient(ellipse,#d5a57852,transparent 66%)}
.r2-metal.r2-mc-legacy .r2-mc-frame-incision{background:linear-gradient(90deg,#edc49777,transparent 1%,transparent 99%,#ebc49b88)}
.r2-metal.r2-mc-legacy .r2-mc-frame-glints{background:linear-gradient(transparent,#f9debd 3%,transparent 18%,transparent 43%,#f8d4a3 64%,#f9d3aa 86%,transparent);box-shadow:263px 0 0 -.25px #f2cea1b3}
.r2-metal.r2-mc-legacy .r2-mc-backlight{background:radial-gradient(ellipse 104px 115px at 171px 95px,#ffdeb682,transparent 87%),linear-gradient(90deg,#321e12a3 21%,transparent 52%)}
.r2-metal .r2-mc-bronze-patina{inset:0;background:repeating-linear-gradient(113deg,transparent 0 4px,#f7ce9e16 4.3px 4.8px,transparent 5px 17px),radial-gradient(ellipse at 19% 20%,#1e201b45,transparent 47%),radial-gradient(ellipse at 80% 9%,#ffdeb341,transparent 31%);z-index:1}
.r2-metal .r2-mc-colosseum{z-index:2}
.r2-metal .r2-mc-amphitheatre-wall{left:148px;top:67px;width:126px;height:158px;clip-path:polygon(0 33%,100% 0,100% 85%,0 100%);background:linear-gradient(94deg,#614327,#b58b56 35%,#cc9e68 68%,#8a6036);box-shadow:inset -9px 0 17px #4c311983}
.r2-metal .r2-mc-amphitheatre-wall::after{content:'';inset:0;background:repeating-linear-gradient(0deg,transparent 0 9px,#513b254a 9.6px 10px),repeating-linear-gradient(89deg,transparent 0 12px,#f7c98b33 12.6px 13.2px,transparent 13.5px 18px);opacity:.62}
.r2-metal .r2-mc-arch{border-radius:50% 50% 0 0 / 36% 36% 0 0;background:linear-gradient(90deg,#3c2819,var(--arch-shade) 58%,#9b7747 91%);border:1.2px solid #d2a66a;border-bottom:1px solid #6d4a2b;box-shadow:2.5px 0 0 #694723,3.5px 0 0 #e5b878,inset 1.4px 2px 0 #362416;transform:skewY(-19deg);z-index:2}
.r2-metal .r2-mc-arch::before{content:'';left:-3px;top:4px;width:2px;height:100%;background:linear-gradient(90deg,#f3c68b,#a07745);box-shadow:16px 0 0 -.4px #9f7240}
.r2-metal .r2-mc-arch::after{content:'';left:2px;top:3px;width:2px;height:68%;background:linear-gradient(#d3a56988,transparent);border-radius:50%}
.r2-metal .r2-mc-cornice{transform-origin:0 50%;background:linear-gradient(#f2c896,#b18b57 30%,#684727 65%,#d4a76d);box-shadow:0 1px 0 #e3b378;z-index:3}
.r2-metal .r2-mc-amphitheatre-rubble{left:135px;top:203px;width:144px;height:29px;clip-path:polygon(0 81%,14% 51%,20% 66%,32% 29%,39% 42%,50% 18%,64% 33%,74% 0,100% 9%,100% 100%,0 100%);background:repeating-linear-gradient(172deg,#8a6039 0 5px,#e4b27a 6px,#5a3a20 8px,#9b7046 11px);z-index:4}
.r2-metal .r2-mc-ruins{z-index:4}
.r2-metal.r2-mc-legacy .r2-mc-neck{left:155px;top:105px;transform:rotate(8deg)}
.r2-metal.r2-mc-legacy .r2-mc-neck-tendon{left:164px;top:113px}
.r2-metal.r2-mc-legacy .r2-mc-torso{left:95px;top:124px;width:117px;height:130px;clip-path:polygon(14% 9%,43% 0,63% 8%,83% 16%,100% 38%,100% 60%,92% 100%,0 100%,7% 65%,0 36%);background:linear-gradient(100deg,#1e1a10,#5f482b 14%,#2a2415 32%,#4b3a22 59%,#89643a 80%,#242013 97%)}
.r2-metal.r2-mc-legacy .r2-mc-sleeve-left{left:83px;top:139px;width:41px;height:48px;transform:rotate(5deg)}
.r2-metal.r2-mc-legacy .r2-mc-sleeve-right{left:184px;top:144px;width:31px;height:51px;transform:rotate(-11deg)}
.r2-metal.r2-mc-legacy .r2-mc-back-arm{left:69px;top:179px;width:40px;height:48px;clip-path:polygon(25% 0,100% 15%,81% 39%,58% 55%,81% 76%,54% 100%,14% 78%,0 52%,7% 23%);background:linear-gradient(111deg,#deb37b,#705331 12%,#342d1b 31%,#997446 52%,#302818 74%,#b68f58)}
.r2-metal.r2-mc-legacy .r2-mc-back-arm-light{left:71px;top:182px;width:29px;height:38px}
.r2-metal.r2-mc-legacy .r2-mc-back-arm-crease{left:73px;top:204px;transform:rotate(31deg)}
.r2-metal.r2-mc-legacy .r2-mc-front-arm{left:191px;top:187px;width:25px;height:40px;transform:rotate(-12deg)}
.r2-metal.r2-mc-legacy .r2-mc-forearm{left:93px;top:211px;width:71px;height:22px;clip-path:polygon(0 10%,18% 0,72% 23%,100% 7%,100% 75%,68% 94%,11% 100%,0 60%);transform:rotate(-12deg);background:linear-gradient(174deg,#dfb47a,#705333 28%,#3b301d 57%,#1a190f 90%);z-index:8}
.r2-metal.r2-mc-legacy .r2-mc-wrist{left:155px;top:208px;transform:rotate(-12deg);z-index:8}
.r2-metal.r2-mc-legacy .r2-mc-hand{left:176px;top:201px;transform:rotate(-14deg);z-index:8}
.r2-metal.r2-mc-legacy .r2-mc-elbow{left:77px;top:209px;width:17px;height:14px;z-index:9}
.r2-metal.r2-mc-legacy .r2-mc-collar{left:143px;top:124px;transform:rotate(12deg)}
.r2-metal.r2-mc-legacy .r2-mc-collar-piping{left:147px;top:131px;transform:rotate(10deg)}
.r2-metal.r2-mc-legacy .r2-mc-shirt-grain{left:104px;top:144px;width:103px}
.r2-metal.r2-mc-legacy .r2-mc-head{left:150px;top:51px;width:59px;height:78px;clip-path:polygon(16% 5%,42% 0,70% 6%,86% 20%,88% 38%,84% 45%,92% 53%,100% 59%,89% 64%,91% 71%,82% 76%,80% 88%,66% 100%,43% 91%,31% 80%,20% 65%,8% 55%,2% 37%,7% 20%);background:radial-gradient(ellipse at 33% 33%,#0d100a 24%,#1b2114 54%,transparent 79%),linear-gradient(104deg,#ddb27a,#443b23 14%,#222816 64%,#735c31 86%,#edc58a 95%)}
.r2-metal.r2-mc-legacy .r2-mc-face-plane{left:174px;top:85px;width:27px;height:36px;background:linear-gradient(110deg,#272b18,#4e4827 66%,#be9b5d 98%);clip-path:polygon(0 17%,100% 0,71% 56%,88% 67%,52% 100%,3% 79%)}
.r2-metal.r2-mc-legacy .r2-mc-nose-plane{display:block!important;left:199px;top:87px;width:11px;height:19px;background:linear-gradient(94deg,#3c3d20,#bfa16c);clip-path:polygon(0 0,27% 15%,48% 57%,100% 88%,24% 100%,29% 64%);z-index:10}
.r2-metal.r2-mc-legacy .r2-mc-brow{display:block!important;left:188px;top:84px;width:12px;height:5px;clip-path:polygon(0 0,100% 20%,100% 100%,24% 66%);background:linear-gradient(#a88b50,#10190c 75%);transform:rotate(8deg);z-index:10}
.r2-metal.r2-mc-legacy .r2-mc-eye{display:block!important;left:191px;top:91px;width:7px;height:1px;background:#0a1008;box-shadow:0 1.3px 0 #987f4d80;z-index:10}
.r2-metal.r2-mc-legacy .r2-mc-ear{left:155px;top:88px;transform:rotate(-13deg)}
.r2-metal.r2-mc-legacy .r2-mc-hair{left:148px;top:45px;width:61px;height:44px;background:radial-gradient(ellipse at 42% 67%,#0b0e07 30%,#1b1b0d 58%,#624b24 78%,#f8d293 89%,#cba364 96%)}
.r2-metal.r2-mc-legacy .r2-mc-hair-light{left:154px;top:47px}
.r2-metal.r2-mc-legacy .r2-mc-temple{left:163px;top:77px}
.r2-metal .r2-mc-shirt-embroidery{left:109px;top:146px;width:94px;height:82px;clip-path:polygon(9% 0,73% 0,100% 34%,87% 100%,0 100%,12% 42%);background:repeating-conic-gradient(from 22deg at 31% 42%,transparent 0 12deg,#c59a5838 13deg 15deg,transparent 16deg 41deg),repeating-radial-gradient(ellipse at 20% 40%,transparent 0 6px,#dbad632b 7px 7.8px,transparent 8.3px 12px);background-size:27px 33px,41px 39px;opacity:.65;z-index:7}
.r2-metal.r2-mc-legacy .r2-mc-name-recess{background:linear-gradient(174deg,transparent 4%,#d4ae704d 4.6%,var(--base) 6%,var(--base) 89%,#b38a5040 90%,transparent 92%)}
.r2-metal.r2-mc-legacy .r2-mc-footer-grain{background:radial-gradient(ellipse at 50% 0,#ad74311f,transparent 72%),repeating-linear-gradient(123deg,transparent 0 3px,#d0a4710a 3.4px 3.8px,transparent 4px 9px)}
.r2-metal .r2-mc-helmet-plume{left:3px;top:1px;width:29px;height:22px;clip-path:polygon(0 72%,5% 40%,22% 14%,52% 0,80% 11%,100% 40%,83% 58%,64% 38%,41% 34%,22% 45%,10% 78%);background:repeating-conic-gradient(from -70deg at 50% 100%,#f1c995 0 5deg,#a0703d 6deg 9deg,#edc494 10deg 16deg)}
.r2-metal .r2-mc-helmet-shell{left:9px;top:9px;width:20px;height:22px;clip-path:polygon(2% 35%,19% 10%,53% 0,83% 18%,100% 45%,73% 47%,68% 63%,78% 72%,93% 100%,31% 96%,22% 67%,0 64%);background:linear-gradient(100deg,#9d6b35,#f8d8a7 42%,#b37e42 70%,#e7ba7b)}
.r2-metal .r2-mc-helmet-cheek{left:12px;top:22px;width:15px;height:13px;clip-path:polygon(0 0,46% 17%,57% 77%,100% 100%,31% 100%,15% 64%);background:linear-gradient(110deg,#e8bd84,#9f6e36)}
.r2-metal .r2-mc-helmet-visor{left:19px;top:18px;width:11px;height:5px;clip-path:polygon(0 0,100% 21%,78% 65%,29% 100%);background:#302112}
`;
