import { basicGrid, basicGraffiti, basicRoyalShards, basicCrystals } from './basic-surfaces.mjs';
import { basicFigure } from './basic-figures.mjs';
/* Expressive / basic edition. Authored CSS primitives, in a 300 × 380 space.
 * All ornament is deterministic geometry. There are no external assets.
 * Foreground text, national flags, and numeric data belong to the host overlay.
 */
const mark = (name, style = '', children = '') => `<i class="${name.split(' ').map(part => `eb-${part}`).join(' ')}"${style ? ` style="${style}"` : ''}>${children}</i>`;
const box = (name, x, y, w, h, style = '', children = '') => mark(name, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;${style}`, children);
const stroke = (x, y, w, angle, color, h = 1, extra = '') => box('stroke', x, y, w, h, `background:${color};transform:rotate(${angle}deg);${extra}`);
const wrap = (theme, content) => `<div class="r2-art r2-expressive r2-expressive-basic ${theme} r2-theme-${theme}" aria-hidden="true">${content}</div>`;
const field = () => mark('field');

function frame() {
  return mark('frame') + mark('frame-inner') + mark('frame-etch') + mark('bottom-jewel') + mark('notch') +
    box('top-flourish', 112, 16, 28, 9, 'transform:rotate(-17deg)') +
    box('top-flourish', 160, 16, 28, 9, 'transform:rotate(17deg)');
}

function crest(theme) {
  let emblem = '';
  if (theme === 'rivera') {
    emblem = box('crest-trunk', 14, 11, 5, 17, 'transform:rotate(6deg)') +
      [-54, -29, 0, 29, 54].map((a, n) => box('crest-frond', 15, 9 + n % 2, 12, 6, `transform:rotate(${a - 180}deg)`)).join('') +
      [18, 46, 75].map(a => box('crest-frond', 15, 9, 11, 6, `transform:rotate(${a}deg)`)).join('');
  } else if (theme === 'drift') {
    emblem = box('crest-slash', 8, 8, 2, 18, 'transform:rotate(29deg)') +
      box('crest-slash', 15, 7, 2, 20, 'transform:rotate(-22deg)') +
      box('crest-slash', 21, 10, 2, 16, 'transform:rotate(27deg)') +
      box('crest-scratch', 7, 14, 19, 2, 'transform:rotate(-17deg)') +
      box('crest-scratch', 9, 22, 15, 1, 'transform:rotate(12deg)');
  } else if (theme === 'majestic') {
    emblem = box('crest-diamond', 10, 10, 12, 12, 'transform:rotate(45deg)') +
      box('crest-ray', 15, 4, 2, 26) + box('crest-ray', 4, 15, 26, 2) +
      box('crest-dot', 14, 14, 5, 5);
  } else {
    emblem = box('crest-diamond', 7, 7, 18, 18, 'transform:rotate(45deg)') +
      box('crest-diamond', 12, 10, 10, 15, 'transform:rotate(15deg)') +
      box('crest-ray', 16, 5, 1, 25, 'transform:rotate(16deg)');
  }
  return box('crest', 185, 278, 33, 36, '', mark('crest-inset') + emblem);
}

function rests(theme) {
  return mark('lower-shade') + mark('rating-rest') + mark('name-rest') +
    stroke(42, 267, 216, 0, 'var(--ink)', .6, 'opacity:.35') +
    stroke(37, 352, 226, 0, 'var(--ink)', .7, 'opacity:.25') + crest(theme);
}

function palm(x, y, scale = 1) {
  return box('palm', x, y, 66, 92, `transform:scale(${scale});transform-origin:33px 0`,
    box('palm-trunk', 30, 16, 9, 76) +
    box('palm-trunk-light', 34, 23, 1, 61, 'transform:rotate(-4deg)') +
    [[3,10,32,18,-21], [5,1,30,14,10], [11,-4,25,17,43], [32,0,28,17,-29], [33,7,32,17,8], [34,13,30,20,29], [19,5,18,25,-48]].map(([lx,ly,w,h,a]) =>
      box('palm-frond', lx, ly, w, h, `transform:rotate(${a}deg)`)).join(''));
}

// The back-facing athlete is assembled in anatomical depth order. The small
// shoulder arcs, sleeve piping, nape and cloth folds retain legibility at 1×.
function backPlayer(theme) { return basicFigure(theme); }

function rivera() {
  const horizon = [188,199,213,231,254,283,320,351].map((y,i) => stroke(24,y,252,0,'#ff38ce',i>4?.6:.8,'opacity:.45')).join('');
  const rays = [-65,-49,-32,-16,0,16,32,49,65].map(a => box('grid-ray',149,183,1,169,`transform:rotate(${a}deg);height:${Math.abs(a)>48?113:169}px`)).join('');
  const edgeBits = [[14,52,3,22,0],[279,64,3,34,0],[15,146,4,18,0],[280,181,3,33,0],[13,251,4,27,0],[278,292,4,28,0],[30,34,35,2,-18],[237,35,31,2,18],[27,342,32,2,15],[242,342,32,2,-15]]
    .map(([x,y,w,h,a],i)=>box('neon-chip',x,y,w,h,`transform:rotate(${a}deg);background:${i%2?'#eb51fc':'#74ffff'}`)).join('');
  const shooting = [[105,29,38,-13],[202,39,39,19],[29,120,31,-8],[224,157,39,-11],[47,223,46,-9]]
    .map(([x,y,w,a])=>stroke(x,y,w,a,'#f660d1',.8,'opacity:.65')).join('');
  return wrap('rivera', field() + mark('sun-haze') + box('sun',101,47,148,148) +
    box('sun-horizon',30,183,240,2) + mark('grid', '', horizon + rays) +
    palm(37,140,.8) + palm(225,112,.86) + palm(30,196,.48) + shooting +
    backPlayer('rivera') + rests('rivera') + basicGrid() + frame() + edgeBits +
    box('neon-corner',23,37,15,17,'transform:rotate(22deg)') +
    box('neon-corner',263,335,13,16,'transform:rotate(22deg)'));
}

function splash(x,y,color,angle,scale=1) {
  return box('splash',x,y,32,31,`color:${color};transform:rotate(${angle}deg) scale(${scale})`,
    box('paint-core',10,10,13,12) + box('paint-dab',2,9,18,5,'transform:rotate(24deg)') +
    box('paint-dab',8,0,4,26,'transform:rotate(-22deg)') + box('paint-dab',16,6,24,4,'transform:rotate(-39deg)') +
    box('paint-dot',2,24,3,4) + box('paint-dot',26,1,3,3) + box('paint-dot',28,23,4,2));
}

function driftPlayer() { return basicFigure('drift'); }

function crown() {
  return box('crown',211,28,45,36,'transform:rotate(10deg)',
    stroke(3,5,23.8,75.4,'#ffe22a',2.6) + stroke(9,28,29,0,'#ffe22a',2.6) +
    stroke(38,28,25.5,-78.7,'#ffe22a',2.6) + stroke(43,3,20.5,133,'#ffe22a',2.6) +
    stroke(29,18,18.4,247.6,'#ffe22a',2.6) + stroke(22,1,19.7,114,'#ffe22a',2.6) +
    stroke(14,19,17.8,232,'#ffe22a',2.6) +
    box('crown-dot',1,3,4,4) + box('crown-dot',20,0,4,4) + box('crown-dot',41,1,4,4));
}

function drift() {
  const paint = splash(22,123,'#08c9f4',-18,.9) + splash(23,215,'#ff298c',21,1.1) +
    splash(246,172,'#ffdf12',-18,.9) + splash(250,272,'#0ed3f5',15,.9) +
    splash(91,32,'#ffda13',-15,.75) + splash(238,227,'#fc208c',51,.8) +
    splash(26,322,'#ffdb1c',25,.75) + splash(252,82,'#10bce5',-32,.8);
  const white = [
    box('scrawl-loop',48,148,27,38,'transform:rotate(25deg)'),
    box('scrawl-loop',47,178,31,25,'transform:rotate(-17deg)'),
    stroke(52,165,60,64,'#e5e5de',4), stroke(43,198,51,-35,'#e5e5de',3),
    stroke(60,218,42,-72,'#e5e5de',3), stroke(42,223,45,-19,'#e5e5de',2),
    stroke(225,112,44,-24,'#eeeeeb',3), stroke(233,127,30,-18,'#eeeeeb',1),
    stroke(112,47,14,-33,'#cccfc7',2), stroke(36,296,27,-68,'#dadcd2',2),
    stroke(259,315,22,81,'#c9cdc5',2)
  ].join('');
  const drips = [[27,244,29,'#f52886'],[35,252,15,'#e91f8e'],[266,299,26,'#08bedc'],[260,111,21,'#10bfd6'],[52,333,14,'#e6b519'],[249,205,18,'#d8bc0e']]
    .map(([x,y,h,c])=>box('paint-drip',x,y,2,h,`background:${c}`)).join('');
  const edgeScuffs = [[19,174,32,-64,'#07c8ee'],[18,258,37,83,'#f82a8f'],[279,209,41,86,'#e7ca15'],[277,289,42,88,'#10cef0'],[35,346,37,16,'#f5d721'],[242,350,29,-13,'#aeb8b2']]
    .map(([x,y,w,a,c])=>stroke(x,y,w,a,c,2.3) + stroke(x+3,y+5,w*.63,a+7,c,.8)).join('');
  const paintFlecks = [[35,126,14,-42,'#13cdec'],[44,134,7,30,'#13cdec'],[23,149,9,81,'#13cdec'],[38,209,13,-63,'#ff2d8b'],[48,226,9,18,'#ff2d8b'],[26,235,10,71,'#ff2d8b'],[260,164,9,-29,'#ffda24'],[267,190,15,63,'#ffda24'],[248,183,8,-64,'#ffda24'],[259,283,10,-35,'#13cdec'],[270,306,12,75,'#13cdec'],[93,28,9,-26,'#ffda24'],[105,41,11,-61,'#ffda24'],[38,329,8,18,'#ffda24'],[48,337,11,41,'#ffda24'],[263,88,9,-64,'#13cdec'],[255,104,7,18,'#13cdec'],[249,235,8,36,'#ff2d8b']]
    .map(([x,y,w,a,c],i)=>stroke(x,y,w,a,c,i%3===0?2.4:1.2)).join('');
  return wrap('drift',field() + mark('wall-grain') + frame() + paint + drips + white +
    basicGraffiti() + driftPlayer() + crown() + rests('drift') +
    edgeScuffs + paintFlecks +
    stroke(26,45,54,-23,'#e2b718',2) + stroke(32,48,39,-23,'#f0d744',.7) +
    stroke(229,343,43,-14,'#ecefe3',1) + stroke(105,357,25,19,'#edc91b',3));
}

function star(x,y,size,color='#f3caff',angle=0) {
  return box('star',x,y,size,size,`color:${color};transform:rotate(${angle}deg)`,
    box('star-vertical',size*.45,0,size*.1,size) +
    box('star-horizontal',0,size*.45,size,size*.1) +
    box('star-diamond',size*.33,size*.33,size*.34,size*.34,'transform:rotate(45deg)'));
}

function trophy() {
  return box('trophy',201,78,68,149,'transform:rotate(10deg)',
    box('cup-handle',-5,7,28,73,'transform:rotate(-9deg)') +
    box('cup-handle',47,7,27,73,'transform:rotate(8deg)') +
    box('cup-handle-inner',0,12,16,54,'transform:rotate(-9deg)') +
    box('cup-handle-inner',53,12,16,54,'transform:rotate(8deg)') +
    box('cup-neck',26,77,18,36) +
    box('cup-bowl',10,27,48,66) +
    box('cup-rim',8,25,52,13) +
    box('cup-band',15,44,38,6) +
    box('cup-etch',27,54,15,21) +
    box('cup-medal',31,59,8,10) +
    box('cup-foot',17,108,35,13) +
    box('cup-plinth',12,118,46,14) +
    stroke(20,37,1,0,'#ffffff',40) + stroke(46,37,1,0,'#9b67c1',35) +
    box('cup-flare',11,24,7,7,'transform:rotate(45deg)'));
}

function majestic() {
  const stars = [[95,54,11,-18],[220,53,16,7],[79,187,21,17],[119,213,13,9],[247,228,17,-9],[174,204,12,6],[112,102,8,13],[241,150,9,8],[204,35,7,10]]
    .map(([x,y,s,a])=>star(x,y,s, '#ead3ff',a)).join('');
  const curls = [[22,52,16,52,-10],[260,55,15,48,10],[22,249,14,48,14],[262,248,14,48,-14],[39,343,40,14,8],[220,343,40,14,-8]]
    .map(([x,y,w,h,a])=>box('gold-scroll',x,y,w,h,`transform:rotate(${a}deg)`,mark('gold-scroll-inner'))).join('');
  const gems = [[28,35],[264,35],[18,150],[271,150],[18,227],[271,227],[51,348],[242,348]]
    .map(([x,y],i)=>box('frame-gem',x,y,8,13,`transform:rotate(${i%2?20:-20}deg)`)).join('');
  const arcs = [[50,133,56,63,-25],[89,37,63,144,-19],[198,74,57,134,15],[43,188,216,48,-11]]
    .map(([x,y,w,h,a])=>box('aura-arc',x,y,w,h,`transform:rotate(${a}deg)`)).join('');
  return wrap('majestic',field() + mark('royal-aura') + basicRoyalShards('back') + trophy() + backPlayer('majestic') +
    stars + rests('majestic') + frame() + basicRoyalShards('front') +
    box('royal-finial',144,30,12,12,'transform:rotate(45deg)') +
    box('royal-finial',144,351,12,12,'transform:rotate(45deg)'));
}

function crystal(x,y,w,h,angle,variant=0) {
  return box('crystal',x,y,w,h,`transform:rotate(${angle+26}deg) skewY(${variant%2?-20:20}deg);--glass-a:${['#8deaff','#edeaff','#8993ff','#f27de9'][variant%4]};--glass-b:${['#2458a8','#a663d1','#1a8dab','#4069b8'][variant%4]};--facet-angle:${45+variant*37}deg`,
    mark('crystal-edge') + mark('crystal-splinter'));
}

function prismPlayer() { return basicFigure('prism'); }

function prism() { return wrap('prism',field()+mark('prism-aura')+basicCrystals('back')+prismPlayer()+rests('prism')+frame()+basicCrystals('front')); }

export const basicArt = {
  rivera: rivera(),
  drift: drift(),
  majestic: majestic(),
  prism: prism()
};

// Use the edition-qualified scope on every selector, including pseudo-elements.
const S = '.r2-expressive.r2-expressive-basic';
export const basicStyles = `
${S}{position:absolute;width:300px;height:380px;inset:0;isolation:isolate;pointer-events:none;--ink:#71f8ff;--dark:#0d092b;--rim:#5af6ff;--rim-soft:#af59e2;--cloth-light:#742c9d;--metal:#65f4fa;--edge-shadow:#d23fdc}
${S},${S} *{box-sizing:border-box}
${S} i,${S} b,${S} span,${S} div{position:absolute;display:block;margin:0;padding:0;font-style:normal}
${S} .eb-stroke{border-radius:80%;transform-origin:0 50%}
${S} .eb-field{left:17px;top:19px;width:266px;height:345px;border-radius:44% 44% 48% 48% / 7% 7% 9% 9%;background:radial-gradient(ellipse at 65% 35%,#632c91 0,#221136 48%,#090b21 79%);box-shadow:inset 0 0 28px #070919}
${S} .eb-frame{left:13px;top:16px;width:274px;height:350px;border:1.3px solid var(--ink);border-radius:44% 44% 47% 47% / 7% 7% 9% 9%;box-shadow:inset 0 0 0 2px var(--dark),inset 0 0 0 3px var(--edge-shadow),0 0 3px var(--edge-shadow)}
${S} .eb-frame-inner{left:19px;top:21px;width:262px;height:339px;border:1px solid var(--metal);border-radius:44% 44% 47% 47% / 7% 7% 9% 9%;opacity:.8}
${S} .eb-frame-etch{left:23px;top:25px;width:254px;height:331px;border-left:1px solid var(--ink);border-right:1px solid var(--ink);border-radius:44% 44% 47% 47% / 7% 7% 9% 9%;opacity:.25}
${S} .eb-bottom-jewel{left:142px;top:353px;width:16px;height:16px;transform:rotate(45deg);background:var(--dark);border-bottom:1px solid var(--ink);border-right:1px solid var(--ink);box-shadow:2px 2px 0 -1px var(--edge-shadow)}
${S} .eb-notch{left:143px;top:11px;width:14px;height:14px;border-bottom:1.5px solid var(--ink);border-right:1px solid var(--ink);border-radius:20%;transform:rotate(45deg);background:var(--dark);box-shadow:1px 1px 0 var(--edge-shadow)}
${S} .eb-top-flourish{border-top:1px solid var(--metal);border-radius:50%}
${S} .eb-lower-shade{left:25px;top:211px;width:250px;height:145px;background:linear-gradient(transparent,#090817ed 32%,#070916 96%);border-radius:0 0 44% 44% / 0 0 15% 15%}
${S} .eb-rating-rest{left:27px;top:39px;width:65px;height:88px;border-radius:30%;background:radial-gradient(ellipse at 24% 42%,#08081794,#08081729 58%,transparent 78%)}
${S} .eb-name-rest{left:31px;top:235px;width:238px;height:31px;border-radius:44% 44% 15% 15% / 19% 19% 8% 8%;background:linear-gradient(90deg,#090918a6,#090918ed 20% 80%,#090918a6);border-top:1px solid #c292ed45;border-bottom:1px solid #5af6ff1c;box-shadow:0 -4px 10px #0a072469}
${S} .eb-crest{color:var(--ink);border:1px solid currentColor;border-radius:19% 19% 49% 49% / 14% 14% 72% 72%;background:linear-gradient(125deg,#1c21487d,#0b0a22e6);box-shadow:inset 0 0 0 2px #0b0b25}
${S} .eb-crest-inset{inset:3px;border:1px solid currentColor;border-radius:19% 19% 49% 49% / 14% 14% 72% 72%;opacity:.45}
${S} .eb-crest-trunk{border-left:2px solid currentColor;border-radius:50%}
${S} .eb-crest-frond{border-top:1.5px solid currentColor;border-radius:50%;transform-origin:0 0}
${S} .eb-crest-slash,${S} .eb-crest-scratch,${S} .eb-crest-ray{background:currentColor;border-radius:30%}
${S} .eb-crest-diamond{border:1px solid currentColor;border-radius:8%}
${S} .eb-crest-dot{background:currentColor;border-radius:50%}
${S} .eb-athlete,${S} .eb-hooded,${S} .eb-prism-player{inset:0}
${S} .eb-arm{border-radius:43% 43% 40% 38%;background:linear-gradient(90deg,#052345,var(--dark) 30% 70%,#382560 98%);border-left:1px solid var(--rim);box-shadow:inset 4px 0 4px #7346b74d}
${S} .eb-shirt-back{border-radius:36% 31% 16% 18% / 19% 16% 14% 17%;background:repeating-linear-gradient(114deg,transparent 0 2px,#aaa3d406 2px 3px),linear-gradient(101deg,#130e28 4%,#271140 33%,#0c1027 54%,#23113a 85%,#4f236a);border-right:1px solid var(--rim-soft);box-shadow:inset 5px 0 11px #57339866}
${S} .eb-sleeve{border-radius:45% 40% 12% 13% / 28% 30% 8% 8%;background:linear-gradient(105deg,#251249,#080e26 50%,#37235d);border-top:.8px solid var(--rim);box-shadow:inset 0 1px 0 #a668b6,inset 3px 0 7px #63429a66}
${S} .eb-shoulder{border-top:.9px solid var(--rim);border-radius:50% 60% 0 0;background:linear-gradient(180deg,#7146a344,transparent 62%)}
${S} .eb-neck{border-radius:20% 22% 30% 27%;background:linear-gradient(90deg,#6b325c,#181425 24%,#0c1024 72%,#69469b);border-right:.8px solid var(--rim-soft)}
${S} .eb-head-back{border-radius:45% 44% 39% 40% / 35% 36% 55% 53%;background:linear-gradient(95deg,#331f3c,#080c1c 33% 78%,#493763);border-right:1px solid var(--rim)}
${S} .eb-ear{border-radius:48%;background:linear-gradient(90deg,#74406c,#171525);border-left:.8px solid var(--rim-soft)}
${S} .eb-hair-mass{border-radius:43% 43% 26% 37%;background:radial-gradient(ellipse at 66% 16%,#193048,#0a1022 60%);border-top:.6px solid #649ab566}
${S} .eb-hair-lock{background:#0b1226;border-top:1px solid var(--rim);border-radius:40% 49% 31% 30%;box-shadow:-1px -1px 0 #54a6d94d}
${S} .eb-nape-shadow{border-radius:30% 20% 47% 42%;background:linear-gradient(#0b1021,#121427);border-bottom:1px solid #6d427077}
${S} .eb-collar-back{border-bottom:3px solid var(--rim-soft);border-radius:50%;box-shadow:0 1px 0 var(--rim)}
${S} .eb-collar-seam{border-bottom:1px solid #c2a4dd;border-radius:50%;opacity:.55}
${S} .eb-sleeve-seam{border-bottom:2px solid var(--rim-soft);border-radius:20% 20% 50% 40%;box-shadow:0 1px 0 var(--rim)}
${S} .eb-back-seam{border-left:.6px solid #ab67c3;border-radius:50%;opacity:.5}
${S} .eb-shirt-hem{border-bottom:1px solid var(--cloth-light);border-radius:50%}
${S}.rivera{--ink:#53faff;--metal:#fab5ff;--edge-shadow:#e936cd;--rim:#60f3ff;--rim-soft:#b43bf6;--dark:#130d33}
${S}.rivera .eb-field{background:linear-gradient(180deg,#39235a,#852682 23%,#aa357e 46%,#170b3e 64%,#070b22 95%)}
${S}.rivera .eb-frame{box-shadow:inset 0 0 0 2px #331465,inset 0 0 0 3px #ee51da,0 0 0 1px #ec4cd4,0 0 4px #b825bd}
${S}.rivera .eb-name-rest{border-top-color:#fa42c455;background:linear-gradient(90deg,#11102ab0,#0a1025f2 27% 73%,#11102ab0)}
${S} .eb-sun-haze{left:52px;top:24px;width:219px;height:201px;border-radius:50%;background:radial-gradient(ellipse,#f99bd44d 9%,#ed49961c 58%,transparent 72%)}
${S} .eb-sun{border-radius:50%;background:repeating-linear-gradient(0deg,transparent 0 10px,#7f2687 10px 13px),linear-gradient(#fff7a3,#ffc562 32%,#f46f88 69%,#df42af);box-shadow:0 0 12px #f8b06922}
${S} .eb-sun-horizon{background:#f1b3e2;box-shadow:0 2px 0 #bf2683,0 5px 0 #7b2878}
${S} .eb-grid{inset:0}
${S} .eb-grid-ray{background:linear-gradient(#f93bc2,#3f94d7);transform-origin:50% 0;opacity:.6}
${S} .eb-palm{color:#1c103d}
${S} .eb-palm-trunk{border-left:5px solid currentColor;border-right:1px solid #963f98;border-radius:40% 40% 0 0;transform:skewX(-5deg);background:linear-gradient(90deg,#351347,#140e33)}
${S} .eb-palm-trunk-light{background:#bd4b9c;opacity:.65}
${S} .eb-palm-frond{border-top:5px solid currentColor;border-radius:50% 65% 0 0;box-shadow:0 -1px 0 #c5549e66}
${S} .eb-neon-sash{border-radius:25%;background:linear-gradient(90deg,#3897ff,#73ffff 45%,#36e4ed 75%,#ab2be8);box-shadow:0 2px 0 #0f1340,0 -1px 0 #9d71f7}
${S} .eb-neon-chip{box-shadow:0 0 2px currentColor}
${S} .eb-neon-corner{border:1px solid #efff8f;box-shadow:inset 0 0 0 2px #f956db}
${S}.drift{--ink:#e9e9dd;--metal:#a6aaa7;--edge-shadow:#515654;--dark:#0c0f11}
${S}.drift .eb-field{background:radial-gradient(ellipse at 59% 29%,#2c3030,#131718 48%,#090c0e 82%)}
${S}.drift .eb-frame{border-color:#bfc4bc;box-shadow:inset 0 0 0 2px #080e0f,inset 0 0 0 3px #595f5c}
${S}.drift .eb-frame-etch{border-style:dashed;opacity:.5}
${S}.drift .eb-frame-inner{border-color:#515957}
${S}.drift .eb-lower-shade{background:linear-gradient(transparent,#090c0ded 35%,#090c0d 97%)}
${S}.drift .eb-name-rest{background:linear-gradient(90deg,#0a0d0ec9,#090c0ef5 25% 75%,#0a0d0ec9);border-color:#e6e8da22}
${S}.drift .eb-crest{background:#101617}
${S} .eb-wall-grain{left:27px;top:33px;width:246px;height:311px;border-radius:20%;background:repeating-linear-gradient(103deg,transparent 0 13px,#d7d9bc06 13px 14px,transparent 14px 29px),repeating-linear-gradient(8deg,transparent 0 19px,#e2e4dd04 19px 20px,transparent 20px 37px)}
${S} .eb-paint-core{background:currentColor;border-radius:40% 60% 33% 48%;box-shadow:3px -4px 0 -2px currentColor,-5px 4px 0 -1px currentColor,7px 5px 0 -3px currentColor}
${S} .eb-paint-dab{background:currentColor;border-radius:32% 63% 42% 51%}
${S} .eb-paint-dot{background:currentColor;border-radius:45%}
${S} .eb-paint-drip{border-radius:0 0 70% 70%}
${S} .eb-scrawl-loop{border:3px solid #e1e4dc;border-radius:49% 41% 51% 37%;border-right-color:transparent}
${S} .eb-hood-arm{border-radius:44% 43% 20% 24%;background:linear-gradient(90deg,#5a6262,#0b1013 14% 65%,#2c3436);border-left:1px solid #d2d9d3}
${S} .eb-hood-body{border-radius:38% 38% 13% 16% / 24% 22% 10% 12%;background:repeating-linear-gradient(107deg,transparent 0 2px,#b9c8bd05 2px 3px),linear-gradient(103deg,#383f40,#101718 21%,#0a0f12 56%,#343a3a 89%,#080d0e);border-left:1px solid #8e9690;border-right:1px solid #616967}
${S} .eb-hood-shoulder{border-radius:46% 46% 17% 23%;background:linear-gradient(108deg,#d9dad13d,#192022 21%,#101517 59%,#59605b66);border-top:1.4px solid #e2e4dc;box-shadow:inset 0 3px 0 #737a74,inset 2px 0 8px #bac5b822}
${S} .eb-hood-back{border-radius:48% 46% 32% 31% / 45% 47% 46% 36%;background:linear-gradient(110deg,#e2e6d8,#636a66 12%,#12191a 30%,#303737 69%,#969c92);border:1px solid #c7cdc3;box-shadow:inset 3px 0 0 #5e655e}
${S} .eb-hood-top{border-top:1.4px solid #f8faec;border-left:1px solid #e4e6dd;border-radius:48% 54% 0 0;background:linear-gradient(100deg,#dadccb44,transparent 42%)}
${S} .eb-hood-opening{border-radius:48% 43% 47% 40%;background:linear-gradient(125deg,#080c0d,#040608 68%,#151b1c);border-left:2px solid #adb5a8;border-right:2px solid #696f69;box-shadow:inset 4px 0 7px #000}
${S} .eb-hood-face{border-radius:35% 31% 37% 46%;background:linear-gradient(132deg,#141a1a,#070b0d 63%);border-right:.6px solid #222a2c}
${S} .eb-hood-left-lip{border-left:3px solid #d5dacb;border-radius:65% 0 0 45%;box-shadow:-2px 0 0 #4e5850}
${S} .eb-hood-right-lip{border-right:2px solid #969e93;border-radius:0 60% 60% 0}
${S} .eb-hood-brow{border-top:2px solid #d7dfd1;border-radius:50%;box-shadow:0 -2px 0 #536057}
${S} .eb-hood-neck-fold{border-bottom:3px solid #636d63;border-radius:50%;box-shadow:0 1px 0 #adb6a6}
${S} .eb-hood-drawstring{border-radius:50%;background:linear-gradient(90deg,#a7afa2,#e0e4d6)}
${S} .eb-hood-string-tip{background:#a2aea2;border-radius:20%}
${S} .eb-hood-cuff{border-top:2px solid #727c71;border-bottom:1px solid #bac2b4;border-radius:30%;background:#0e1518}
${S} .eb-hood-pocket{border-top:1px solid #49524d;border-bottom:1px solid #4a554c;border-radius:30% 30% 20% 20%;background:linear-gradient(#11191b22,#141c1c88)}
${S} .eb-crown-dot{border-radius:50%;background:#ffe22a}
${S}.majestic{--ink:#edc98b;--metal:#fce5b5;--dark:#1b0b32;--edge-shadow:#ae6add;--rim:#e5c2ff;--rim-soft:#af6fe5;--cloth-light:#613482}
${S}.majestic .eb-field{background:radial-gradient(ellipse at 70% 39%,#7526bc,#351067 40%,#170929 73%,#130d23)}
${S}.majestic .eb-frame{box-shadow:inset 0 0 0 2px #26103d,inset 0 0 0 3px #ae6fd2,inset 0 0 0 5px #24112e,0 0 0 1px #7c572a}
${S}.majestic .eb-frame-inner{border-color:#f9d99b;box-shadow:0 0 0 1px #6d4181}
${S}.majestic .eb-frame-etch{border-color:#d1b382;opacity:.7}
${S}.majestic .eb-hair-lock,${S}.majestic .eb-hair-mass{background:#140c20;border-top-color:#e7cded;box-shadow:-1px -1px 0 #bd84e04d}
${S}.majestic .eb-shirt-back{background:repeating-linear-gradient(114deg,transparent 0 2px,#aaa3d406 2px 3px),linear-gradient(107deg,#351447,#160d24 30%,#251036 58%,#0f0c20 80%,#442358)}
${S}.majestic .eb-sleeve{background:linear-gradient(100deg,#3f215c,#190c2c 52%,#321544);box-shadow:inset 0 2px 0 #9759b0,inset 4px 0 7px #5d287e}
${S}.majestic .eb-arm{background:linear-gradient(90deg,#39124f,#130c1d 36% 72%,#582173)}
${S}.majestic .eb-name-rest{background:linear-gradient(90deg,#180a28b0,#13091ff5 24% 76%,#180a28b0);border-top-color:#c889df4d}
${S}.majestic .eb-crest{color:#e4d6ff;background:linear-gradient(125deg,#301542,#1a1028)}
${S} .eb-royal-aura{left:43px;top:35px;width:226px;height:218px;border-radius:50%;background:radial-gradient(ellipse at 63% 58%,#d97dff55,transparent 65%)}
${S} .eb-aura-arc{border:1px solid #b26bdf55;border-left:2px solid #d296f3a3;border-radius:50%;box-shadow:-2px 0 5px #b23df526}
${S} .eb-star-vertical,${S} .eb-star-horizontal{background:currentColor;border-radius:50%;box-shadow:0 0 4px currentColor}
${S} .eb-star-diamond{background:currentColor;border-radius:12%}
${S} .eb-cup-handle{border:3px solid #debdf2;border-radius:48% 48% 44% 43%;box-shadow:inset 1px 0 0 #6f458b,1px 0 0 #693980,-1px -1px 0 #fff2ff}
${S} .eb-cup-handle-inner{border:1px solid #9463b9;border-radius:48%}
${S} .eb-cup-bowl{border-radius:9% 9% 43% 43% / 8% 8% 83% 83%;background:linear-gradient(90deg,#59366e,#b999ce 11%,#eeddf9 21%,#9c7eb4 29%,#59456f 52%,#bc9ed9 73%,#f2d5f8 86%,#654875);border-left:1px solid #ebd6f1;border-right:1px solid #cbb4e4;box-shadow:0 2px 7px #e39cff4d}
${S} .eb-cup-rim{border-radius:50%;background:linear-gradient(#ebd4f5,#5e416d 47%,#cbaedc 55%,#f5e6fb 80%,#77548b);border:1px solid #dac5ec}
${S} .eb-cup-band{border-top:1px solid #e4c8ee;border-bottom:1px solid #4f3b61;border-radius:50%}
${S} .eb-cup-neck{border-radius:8% 8% 30% 30%;background:linear-gradient(90deg,#4d305e,#dec5e6 24%,#9877ac 48%,#ebd8fa 74%,#4f345d)}
${S} .eb-cup-etch{border:1px solid #e0c8eb;border-radius:45%;opacity:.8}
${S} .eb-cup-medal{border:1px solid #6f5185;border-radius:50%;background:#dbb9ee}
${S} .eb-cup-foot{border-radius:50% 50% 25% 25%;background:linear-gradient(90deg,#4b315f,#e3caef 28%,#826293 56%,#e4caf0 82%,#4f3060);border-bottom:2px solid #cfb0e5}
${S} .eb-cup-plinth{border-radius:16%;background:linear-gradient(#c4a7dc 0 17%,#514060 20% 80%,#c9aadf 85%);border:1px solid #9772b0}
${S} .eb-cup-flare{background:#fff1ff;box-shadow:0 0 8px #f8baff}
${S} .eb-gold-scroll{border:1px solid #dfbb7a;border-right-color:transparent;border-radius:50% 50% 25% 50%;box-shadow:inset 2px 0 0 #7e4e6c,2px 0 0 #593269}
${S} .eb-gold-scroll-inner{left:25%;top:14%;width:45%;height:72%;border-left:1px solid #f0d5a1;border-top:1px solid #ac7d76;border-radius:50%;transform:rotate(12deg)}
${S} .eb-frame-gem{border:1px solid #f4d895;border-radius:12%;background:linear-gradient(110deg,#e1b77c,#8e529d 37%,#351450 52%,#b16bda);box-shadow:0 0 0 1px #462549}
${S} .eb-royal-finial{border:1px solid #e6c17f;border-radius:15%;background:linear-gradient(135deg,#e8c887,#542360 48%,#a265ba 52%,#251136)}
${S} .eb-embroidered-diamond{border:1px solid #d1a4ef;background:#d7b0f433;box-shadow:0 0 4px #af65d0}
${S}.prism{--ink:#e6f8ff;--metal:#a1f3ff;--dark:#0a1429;--edge-shadow:#8d78d1}
${S}.prism .eb-field{background:radial-gradient(ellipse at 70% 27%,#8f719c,#245a79 33%,#111c39 62%,#070d20 89%)}
${S}.prism .eb-frame{border-color:#a6dbf3;box-shadow:inset 0 0 0 2px #141a45,inset 0 0 0 3px #7e9ba7}
${S}.prism .eb-name-rest{background:linear-gradient(90deg,#0a1830ba,#0a1023f5 23% 77%,#0a1830ba);border-top-color:#bbd9ff55}
${S}.prism .eb-lower-shade{background:linear-gradient(transparent,#080f22ef 30%,#080f22 98%)}
${S}.prism .eb-crest{background:linear-gradient(120deg,#364957,#10152e);color:#e0faff}
${S} .eb-prism-aura{left:52px;top:30px;width:203px;height:214px;border-radius:50%;background:conic-gradient(from 67deg at 69% 34%,#80e7ef00,#a5b5ff3d 54deg,#e765b425 56deg,#8bc6e903 129deg,#62c8d435 183deg,#e692cf33 225deg,#cae5f30a 285deg,#80e7ef00)}
${S} .eb-crystal{border:.8px solid #d2f9ff;border-radius:2% 4% 2% 4%;background:conic-gradient(from var(--facet-angle) at 43% 37%,var(--glass-a) 0deg 73deg,var(--glass-b) 75deg 158deg,#bad4f5 160deg 217deg,#5e76b7 220deg 286deg,var(--glass-a) 289deg 360deg);box-shadow:inset 1px 1px 0 #ffffffa3,inset -1px -1px 0 #093666,0 0 3px #72ccf34d}
${S} .eb-long-splinter{border-left:1px solid #ecffff;border-top:1px solid #c4eeff;border-radius:4%;background:linear-gradient(90deg,var(--splinter),#4580b8 44%,#daeaff 48%,#7274ac 62%,#c184df);opacity:.9}
${S} .eb-crystal-edge{left:10%;top:6%;width:73%;height:80%;border-left:1px solid #f8ffffc9;border-bottom:1px solid #bfeaffd9;transform:skewY(-24deg);border-radius:5%}
${S} .eb-crystal-splinter{left:45%;top:9%;width:2px;height:79%;background:linear-gradient(#ffffffcf,#b6e7ff22);transform:rotate(17deg)}
${S} .eb-prism-arm{border-radius:38% 48% 26% 22%;background:linear-gradient(98deg,#4e9bac,#121a30 25% 66%,#371e4b);border-left:1px solid #b1f0f8}
${S} .eb-prism-shirt{border-radius:39% 38% 13% 17% / 21% 17% 9% 13%;background:linear-gradient(107deg,#354b65,#111728 26% 78%,#49436e);border-right:1px solid #d2c6ed}
${S} .eb-prism-sleeve{border-radius:43% 44% 18% 19%;background:linear-gradient(120deg,#2b3e54,#0e1627 55%,#4b2d66);border-top:1.5px solid #ddfaff;border-bottom:1px solid #db86d1;box-shadow:inset 2px 0 0 #3d909f}
${S} .eb-jersey-facet{border-radius:16%;border-left:.7px solid #9dd6ea69;border-top:.7px solid #b7b5e660;background:conic-gradient(from 32deg at 32% 44%,var(--facet-a),var(--facet-a) 94deg,var(--facet-b) 96deg 263deg,#465676 265deg,var(--facet-a));box-shadow:inset 0 -1px 0 #df8ad22e}
${S} .eb-prism-neck{border-radius:18% 30% 25% 20%;background:linear-gradient(113deg,#253950,#090f20 50%,#74547e);border-right:1px solid #a990bc}
${S} .eb-prism-head{border-radius:43% 44% 29% 43%;background:linear-gradient(100deg,#41536d,#0a1022 38% 76%,#514273);border-left:.7px solid #9ce1ef}
${S} .eb-prism-face{border-radius:10% 32% 37% 33%;background:conic-gradient(from 47deg at 43% 43%,#2c2a48,#0d1327 100deg,#404762 101deg 177deg,#0b1527 178deg,#3a4564);border-right:.8px solid #ac9dcb}
${S} .eb-prism-nose{border-radius:10% 47% 24% 17%;background:linear-gradient(65deg,#121a30,#353750);border-right:.8px solid #a4bde1}
${S} .eb-prism-mouth{border-radius:10% 24% 34% 9%;background:#151b30;border-right:.7px solid #8a779d}
${S} .eb-prism-chin{border-radius:12% 15% 48% 28%;background:#101c32;border-bottom:.9px solid #c1bfdc}
${S} .eb-prism-ear{border-radius:48%;border-left:1px solid #afc9db;background:linear-gradient(90deg,#384862,#101a30)}
${S} .eb-prism-ear-inner{border-left:1px solid #807298;border-top:1px solid #8d89ac;border-radius:50%}
${S} .eb-prism-hair,${S} .eb-prism-lock{border-radius:43% 42% 26% 25%;border-top:1px solid #a5e5f3;background:#0b1323;box-shadow:-1px -1px 0 #82d7e329}
${S} .eb-prism-hair{background:linear-gradient(100deg,#263950,#0a1425 52%,#151b33)}
${S} .eb-prism-temple{border-right:1px solid #706b93;border-radius:33%;background:linear-gradient(100deg,#131e34,#3b3e5d)}
${S} .eb-prism-collar{border-bottom:2px solid #b5ddeb;border-radius:50%;box-shadow:0 1px 0 #b377bf;background:linear-gradient(transparent 65%,#243d59)}
`;
