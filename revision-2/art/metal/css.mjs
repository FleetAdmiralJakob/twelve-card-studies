import { figureCSS } from './figures.mjs';
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

function goldWings() {
  const wings=[
    [104,29,63,103,'0 5%,23% 0,100% 100%,73% 74%'],
    [99,43,55,85,'0 0,22% 5%,100% 100%,46% 55%'],
    [180,26,50,113,'100% 0,67% 5%,0 100%,41% 68%'],
    [199,45,45,89,'74% 0,100% 24%,31% 44%,56% 55%,0 100%,22% 52%'],
    [205,82,68,74,'100% 0,72% 49%,100% 38%,46% 74%,0 100%,34% 41%'],
    [226,119,47,67,'100% 0,76% 38%,51% 30%,0 100%,15% 52%'],
    [218,176,49,35,'100% 0,100% 31%,0 100%,19% 50%'],
    [44,127,72,72,'0 0,25% 10%,100% 100%,48% 61%'],
    [36,169,79,56,'0 0,27% 12%,100% 100%,41% 62%'],
    [46,203,61,36,'0 0,36% 6%,100% 100%,18% 56%'],
    [213,37,28,83,'0 0,100% 22%,12% 100%,37% 32%'],
    [233,82,40,55,'100% 0,79% 40%,0 100%,39% 27%'],
  ];
  return group('shards',wings.map(([x,y,w,h,points],i)=>polygon('gold-wing',x,y,w,h,points,
    `linear-gradient(${i%2?104:75}deg,#624314,#d6a63b 29%,#fff7c3 43%,#fff1a0 48%,#bf8b22 52%,#f9d363 80%,#725017)`)).join(''));
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
      arches += node('arch', `${rect(153+col*16.3,111-col*6.1+row*34,7.5+col*1.05,17+row*2+col*1.2)}--arch-shade:${col % 3 ? '#3c2818' : '#695034'}`);
    }
  }
  return group('colosseum', node('amphitheatre-wall') + arches +
    [0,1,2,3].map(i => node('cornice', `${rect(150,111+i*34,125,4.5)}transform:rotate(-21deg)`)).join('') + node('amphitheatre-rubble') +
    [[207,69,25,69],[259,96,27,89],[237,155,25,60]].map(([x,y,w,a]) => stroke(x,y,w,a,'#f3c48c',.38)).join('')+
    [[219,87,9,58],[224,94,8,115],[221,101,8,43],[256,120,11,138],[248,128,10,82],[249,138,9,122],[235,170,10,65],[240,179,7,117]].map(([x,y,w,a])=>stroke(x,y,w,a,'#4b301c',.65,.7)).join(''));
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
  if (theme === 'valor') scene += goldWings() + node('sun-wheel');
  if (theme === 'nexus') scene += shards(theme) + fissures(theme) + crown();
  if (theme === 'aurum') scene += marble() + orbitals() + node('sphere sphere-distant');
  if (theme === 'legacy') scene += node('bronze-patina') + colosseum() + fissures(theme) + ruins();
  scene += figureCSS(theme);
  if (theme === 'aurum') scene += orbitals(true);
  return `<div class="r2-art r2-metal r2-metal-css r2-mc-${theme}" aria-hidden="true">` +
    frame() + group('scene',scene) + (theme === 'valor' || theme === 'legacy' ? laurel(theme === 'legacy') : '') +
    (theme === 'aurum' ? node('sphere sphere-left') + node('sphere sphere-right') : '') +
    lower(theme) + '</div>';
};

export const cssArt = Object.fromEntries(['valor','nexus','aurum','legacy'].map(theme => [theme,composition(theme)]));

// Absolute path() coordinates are scaled at authoring time to each frame layer.
// The percentage polygon remains the compatible fallback in the base rules.
function curvedFrames() {
  const shape=(w,h)=>{
    const pt=(x,y)=>`${round(x*w)} ${round(y*h)}`;
    return `path('M${pt(0,.075)}L${pt(.04,.07)}C${pt(.18,.06)} ${pt(.28,.035)} ${pt(.38,.02)}C${pt(.405,.066)} ${pt(.46,.069)} ${pt(.5,0)}C${pt(.54,.069)} ${pt(.595,.066)} ${pt(.62,.02)}C${pt(.74,.038)} ${pt(.85,.06)} ${pt(.96,.07)}L${pt(1,.075)}L${pt(.997,.87)}C${pt(.996,.935)} ${pt(.97,.95)} ${pt(.87,.96)}C${pt(.72,.972)} ${pt(.61,.972)} ${pt(.5,1)}C${pt(.39,.972)} ${pt(.28,.972)} ${pt(.13,.96)}C${pt(.03,.95)} ${pt(.004,.935)} ${pt(.003,.87)}Z')`;
  };
  return [['frame-shell',266,359],['frame-shell::before',263.2,356.2],['frame-shell::after',259.6,352.6],['frame-reed',256,349],['frame-reed::before',254,347],['plate',250,341],['frame-incision',246,336]].map(([name,w,h])=>`.r2-metal .r2-mc-${name}{clip-path:${shape(w,h)}}`).join('\n');
}

export const cssStyles = `
.r2-metal.r2-metal-css{position:absolute;inset:0;width:300px;height:380px;overflow:hidden;isolation:isolate;pointer-events:none;--metal:#d6b354;--metal-light:#fff2b2;--metal-dark:#694514;--base:#100e08;--rim:#f5d88f;--cloth-dark:#0b0c08;--cloth-mid:#504629;--cloth-lit:#b9a367;--seam:#9d8b57;--skin:#493821;--skin-light:#c3a163;--frame-shape:polygon(0 7.5%,9% 6.5%,22% 4.5%,34% 2%,39% 3.1%,43% 2.4%,46% 0,48% 2.5%,50% 3.3%,52% 2.5%,54% 0,57% 2.4%,61% 3.1%,66% 2%,78% 4.5%,91% 6.5%,100% 7.5%,100% 88%,99.6% 90.6%,98% 92.6%,95% 94.2%,89% 95.5%,69% 97.6%,57% 99%,50% 100%,43% 99%,31% 97.6%,11% 95.5%,5% 94.2%,2% 92.6%,.4% 90.6%,0 88%)}
.r2-metal .r2-mc-scene,.r2-metal .r2-mc-player,.r2-metal .r2-mc-shards,.r2-metal .r2-mc-fissures,.r2-metal .r2-mc-cloth-folds,.r2-metal .r2-mc-seams,.r2-metal .r2-mc-cape,.r2-metal .r2-mc-colosseum,.r2-metal .r2-mc-ruins,.r2-metal .r2-mc-orbits-back,.r2-metal .r2-mc-orbits-front,.r2-metal .r2-mc-laurel,.r2-metal .r2-mc-laurel-branch{position:absolute;inset:0}
.r2-metal.r2-metal-css i{display:block;position:absolute;box-sizing:border-box;font-style:normal}
.r2-metal.r2-metal-css i::before,.r2-metal.r2-metal-css i::after{position:absolute;box-sizing:border-box}
.r2-metal .r2-mc-aura{inset:6px;background:radial-gradient(ellipse at 50% 45%,transparent 47%,#d4a5360c 59%,transparent 73%),radial-gradient(ellipse at 50% 92%,#d2a14524,transparent 62%);z-index:0}
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
.r2-metal .r2-mc-scene{z-index:5;clip-path:polygon(25px 42px,45px 39px,88px 30px,111px 25px,130px 29px,139px 21px,150px 30px,161px 21px,170px 29px,189px 25px,212px 30px,255px 39px,275px 42px,275px 324px,270px 337px,256px 343px,195px 351px,150px 361px,105px 351px,44px 343px,30px 337px,25px 324px)}
.r2-metal .r2-mc-backlight{inset:0;background:radial-gradient(ellipse 95px 105px at 177px 102px,#ffeb9c73,transparent 90%),linear-gradient(90deg,#0a0c06b5 25%,transparent 50%);z-index:0}
.r2-metal .r2-mc-shards{z-index:1}
.r2-metal .r2-mc-shard{clip-path:polygon(11% 0,100% 30%,58% 49%,73% 100%,0 79%,22% 39%);background:linear-gradient(112deg,var(--shard-lit),var(--shard-mid) 3%,var(--shard-dark) 39%,var(--shard-lit) 40%,var(--shard-mid) 45%,var(--shard-dark) 90%);transform-origin:50% 60%}
.r2-metal .r2-mc-shard::before{content:'';inset:0;clip-path:polygon(11% 0,13% 0,42% 42%,100% 30%,100% 31%,43% 44%,73% 100%,71% 100%,40% 45%,0 80%,0 78%,39% 43%);background:var(--shard-lit)}
.r2-metal .r2-mc-shard::after{content:'';inset:0;background:repeating-linear-gradient(21deg,transparent 0 5px,#fff4c60d 5.4px 5.8px,transparent 6.2px 10px);opacity:.6}
.r2-metal .r2-mc-specks{left:0;top:0;width:.65px;height:.65px;border-radius:50%;z-index:4}
.r2-metal .r2-mc-sun-wheel{left:137px;top:55px;width:119px;height:122px;border:1px solid #fff0ba8c;border-radius:50%;transform:rotate(-24deg);background:radial-gradient(ellipse,#fff1b149,transparent 68%);opacity:.56;z-index:2}
.r2-metal .r2-mc-fissures{z-index:3}
.r2-metal .r2-mc-stroke{transform-origin:0 50%;border-radius:50%;z-index:7}
.r2-metal .r2-mc-player{z-index:10}
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
.r2-metal .r2-mc-marble-grain{inset:0;background:repeating-linear-gradient(119deg,transparent 0 8px,#b4a9890b 8.3px 8.8px,transparent 9px 19px);opacity:.65;z-index:2}
.r2-metal .r2-mc-marble-lode{z-index:3;opacity:.7}
.r2-metal .r2-mc-orbits-back{z-index:5}
.r2-metal .r2-mc-orbits-front{z-index:12}
.r2-metal .r2-mc-orbit{left:22px;top:118px;width:265px;height:79px;border:2.2px solid #c49a43;border-radius:50%;transform:rotate(-32deg);box-shadow:inset 0 1px 0 #fffce6,0 1px 0 #fff3c2,inset 0 -1px 0 #70501b,0 -1px 0 #8e692c;background:transparent}
.r2-metal .r2-mc-orbit-two{left:30px;top:169px;width:253px;height:76px;transform:rotate(-27deg);border-width:3px}
.r2-metal .r2-mc-orbit-three{left:36px;top:123px;width:226px;height:87px;transform:rotate(-38deg);border-width:.9px;opacity:.65}
.r2-metal .r2-mc-orbits-back .r2-mc-orbit{border-bottom-color:transparent;border-right-color:transparent;box-shadow:none}
.r2-metal .r2-mc-orbits-front .r2-mc-orbit{border-top-color:transparent;border-left-color:transparent;box-shadow:none}
.r2-metal .r2-mc-sphere{width:38px;height:39px;border-radius:50%;background:radial-gradient(circle at 28% 24%,#fffef8 0,#f7f4e7 25%,#d5d0bb 62%,#9a8863 91%);border:.8px solid #e0c991;box-shadow:inset 2px 0 0 #fffaf4,inset -2px -2px 4px #9b875563,0 1px 2px #76634266;z-index:20}
.r2-metal .r2-mc-sphere::before{content:'';inset:1px;border-radius:50%;clip-path:polygon(39% 0,48% 19%,39% 31%,60% 60%,58% 71%,81% 100%,72% 100%,53% 73%,55% 62%,34% 31%,44% 18%,35% 0);background:linear-gradient(110deg,#b98c39,#d8b76b,#9c7938)}
.r2-metal .r2-mc-sphere::after{content:'';inset:1px;border-radius:50%;background:repeating-linear-gradient(126deg,transparent 0 8px,#a38c6030 8.6px 9px,transparent 9.5px 16px);opacity:.7}
.r2-metal .r2-mc-sphere-left{left:10px;top:157px}
.r2-metal .r2-mc-sphere-right{left:252px;top:188px;width:34px;height:35px}
.r2-metal .r2-mc-sphere-distant{left:240px;top:108px;width:29px;height:30px;z-index:6;background:radial-gradient(circle at 28% 24%,#f4d48e 0,#d6b563 27%,#7e5e28 75%,#3b2a0f 94%);opacity:.86}
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
.r2-metal.r2-mc-legacy .r2-mc-name-recess{background:linear-gradient(174deg,transparent 4%,#d4ae704d 4.6%,var(--base) 6%,var(--base) 89%,#b38a5040 90%,transparent 92%)}
.r2-metal.r2-mc-legacy .r2-mc-footer-grain{background:radial-gradient(ellipse at 50% 0,#ad74311f,transparent 72%),repeating-linear-gradient(123deg,transparent 0 3px,#d0a4710a 3.4px 3.8px,transparent 4px 9px)}
.r2-metal .r2-mc-helmet-plume{left:3px;top:1px;width:29px;height:22px;clip-path:polygon(0 72%,5% 40%,22% 14%,52% 0,80% 11%,100% 40%,83% 58%,64% 38%,41% 34%,22% 45%,10% 78%);background:repeating-linear-gradient(70deg,#f1c995 0 3px,#a0703d 4px 5px,#edc494 6px 9px)}
.r2-metal .r2-mc-helmet-shell{left:9px;top:9px;width:20px;height:22px;clip-path:polygon(2% 35%,19% 10%,53% 0,83% 18%,100% 45%,73% 47%,68% 63%,78% 72%,93% 100%,31% 96%,22% 67%,0 64%);background:linear-gradient(100deg,#9d6b35,#f8d8a7 42%,#b37e42 70%,#e7ba7b)}
.r2-metal .r2-mc-helmet-cheek{left:12px;top:22px;width:15px;height:13px;clip-path:polygon(0 0,46% 17%,57% 77%,100% 100%,31% 100%,15% 64%);background:linear-gradient(110deg,#e8bd84,#9f6e36)}
.r2-metal .r2-mc-helmet-visor{left:19px;top:18px;width:11px;height:5px;clip-path:polygon(0 0,100% 21%,78% 65%,29% 100%);background:#302112}
${curvedFrames()}
`;
