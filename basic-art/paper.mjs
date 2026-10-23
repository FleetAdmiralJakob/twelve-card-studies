/*
 * Paper studies made from ordinary rounded HTML boxes. Build-time seeds only
 * scatter invented fibers, wear and charcoal strokes; no source pixels are used.
 * Every portrait is assembled from rounded anatomical masses, not traced points.
 */
const paperRandom = seed => () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
const paperNumber = n => Number(n.toFixed(2));
const p = (name, style = '', content = '', tag = 'i') => `<${tag} class="ba-p-${name}"${style ? ` style="${style}"` : ''}>${content}</${tag}>`;
const box = (name, x, y, w, h, a = 0, extra = '', content = '') => p(name, `left:${paperNumber(x)}px;top:${paperNumber(y)}px;width:${paperNumber(w)}px;height:${paperNumber(h)}px;transform:rotate(${paperNumber(a)}deg);${extra}`, content);
const mark = (x, y, w, a, color = '#39392d', opacity = .65, h = .8) => box('mark', x, y, w, h, a, `background:${color};opacity:${paperNumber(opacity)}`);
const paperWrap = (theme, art) => `<div class="ba-paper ba-${theme}">${art}</div>`;

function paperDust(seed, color, bounds = [15, 20, 170, 280], count = 92) {
  const r = paperRandom(seed), shadows = [];
  for (let i = 0; i < count; i++) shadows.push(`${paperNumber(bounds[0] + r() * bounds[2])}px ${paperNumber(bounds[1] + r() * bounds[3])}px 0 ${paperNumber(r() * .28)}px ${color}`);
  return p('dust', `box-shadow:${shadows.join(',')}`);
}
function paperFibers(seed, count, bounds, color = '#62543b', opacity = .26) {
  const r = paperRandom(seed); let out = '';
  for (let i = 0; i < count; i++) out += box('fiber', bounds[0] + r() * bounds[2], bounds[1] + r() * bounds[3], 6 + r() * 23, 2 + r() * 5, -65 + r() * 110, `border-color:${color};opacity:${paperNumber(.08 + r() * opacity)}`);
  return out;
}
function pageCreases(seed, count, kind) {
  const r = paperRandom(seed); let out = '';
  for (let i = 0; i < count; i++) {
    const edge = i % 4, x = edge === 0 ? 13 + r() * 13 : edge === 1 ? 152 + r() * 15 : 25 + r() * 140;
    const y = edge < 2 ? 25 + r() * 257 : edge === 2 ? 17 + r() * 17 : 277 + r() * 24;
    out += box(`crease ba-p-crease-${kind}`, x, y, 10 + r() * 14, 15 + r() * 18, -45 + r() * 100, `opacity:${paperNumber(.2 + r() * .32)}`);
  }
  return out;
}
function raggedEdge(kind) {
  const r = paperRandom(kind === 'parchment' ? 942 : kind === 'doodle' ? 317 : 781); let out = '';
  const sideCount = kind === 'parchment' ? 13 : kind === 'doodle' ? 10 : 7;
  for (let side = 0; side < 2; side++) for (let i = 0; i < sideCount; i++) {
    const y = 26 + i * 260 / sideCount + r() * 5;
    out += box(`rag ba-p-rag-${kind}`, (side ? (kind==='parchment'?181:183) : 6) + r() * 3, y, (kind==='parchment'?10:7) + r() * 5, 24 + r() * 12, -7 + r() * 14, `border-radius:${paperNumber(10+r()*23)}% ${paperNumber(5+r()*22)}% ${paperNumber(9+r()*27)}% ${paperNumber(7+r()*18)}%;--ba-frag:${paperNumber(r())}`);
  }
  const n = kind === 'parchment' ? 10 : kind === 'doodle' ? 8 : 6;
  for (let side = 0; side < 2; side++) for (let i = 0; i < n; i++) {
    const x = 14 + i * 166 / n;
    const curve = kind === 'parchment' ? (1 - Math.abs(x + 10 - 100) / 100) * 19 : 0;
    const y = side ? (kind === 'parchment' ? 286 + curve : 300) + r() * 6 : (kind === 'parchment' ? 10 + Math.abs(x + 10 - 100) * .1 : kind === 'doodle' ? 9 : 19) + r() * 7;
    out += box(`rag ba-p-rag-${kind}`, x, y, 22 + r() * 14, (kind==='parchment'?10:7) + r() * (kind==='parchment'?8:5), -18 + r() * 36, `border-radius:${paperNumber(6+r()*17)}% ${paperNumber(5+r()*14)}% ${paperNumber(12+r()*17)}% ${paperNumber(4+r()*16)}%;--ba-frag:${paperNumber(r())}`);
  }
  return out;
}
function charcoalStrokes(seed, count, w, h, kind, angle = 0) {
  const r = paperRandom(seed); let out = '';
  for (let i = 0; i < count; i++) out += mark(r()*w, r()*h, 3+r()*(kind==='ink'?15:10), -52+r()*24-angle, kind === 'steam' ? (i%3 ? '#b28345' : '#171c14') : (i%4 ? '#e0d6bc' : '#090e0b'), .16+r()*.64, .4+r()*(kind === 'steam' ? .5 : 1.2));
  return out;
}
function portrait(kind) {
  const ink = kind === 'ink', steam = kind === 'steam';
  const parts = ink ? [
    ['torso',48,137,94,63,-9,24],['arm',28,152,43,53,34,11],['arm',120,149,39,51,-39,10],
    ['neck',82,116,26,33,-3,3],['ear',68,88,8,16,-8,1],['ear',111,91,7,16,7,1],['head',71,62,45,69,-7,12]
  ] : steam ? [
    ['torso',51,141,96,83,0,23],['arm',31,157,41,67,27,10],['arm',128,156,38,65,-24,10],
    ['neck',84,121,31,35,0,3],['ear',72,98,8,16,-7,1],['ear',116,100,8,17,13,1],['head',77,69,44,66,3,10]
  ] : [
    ['torso',57,135,91,72,-3,28],['arm',34,148,42,60,29,12],['arm',129,147,37,61,-25,12],
    ['neck',91,112,28,37,-3,3],['ear',79,90,8,17,-10,1],['ear',126,91,7,15,10,1],['head',82,56,49,74,5,14]
  ];
  let art = parts.map(([part,x,y,w,h,a,count],i) => box(`portrait-part ba-p-${part}`,x,y,w,h,a,`--ba-hatch-a:${145-a}deg;--ba-hatch-b:${153-a}deg`,charcoalStrokes(494+i*317+(ink?18:0),count,w,h,kind,a)+paperDust(313+i*19,steam?'#bc8f4940':'#e5dcc46b',[0,0,w,h],22))).join('');
  if (ink) {
    const r = paperRandom(593);
    for (let i=0;i<14;i++) art += mark(28+r()*54,186+r()*23,44+r()*45,-26+r()*8,'#34372b',.5+r()*.35,.7+r()*1.5);
  } else if (!steam) {
    const r = paperRandom(248);
    for (let i=0;i<10;i++) art += mark(32+r()*126,185+r()*19,8+r()*15,-38,'#2b3029',.7,.8+r());
  }
  const r=paperRandom(177+(ink?13:steam?29:0));
  for(let i=0;i<9;i++) {
    const left=i%2===0, y=150+r()*42, x=left?38+(188-y)*.43:151-(183-y)*.22;
    art+=mark(x,y,6+r()*10,left?-48:-121,steam?'#25291e':'#30362a',.45+r()*.4,.7+r()*1.1);
  }
  return p(`portrait ba-p-portrait-${kind}`, '', art, 'div');
}
function manuscriptPortrait() {
  let art = box('shirt',58,132,95,72,0,'',charcoalStrokes(115,22,95,72,'outline'))+
    box('shirt-arm ba-p-shirt-left',34,144,29,60,21,'',charcoalStrokes(423,7,29,60,'outline'))+
    box('shirt-arm ba-p-shirt-right',148,142,28,61,-22,'',charcoalStrokes(344,7,28,61,'outline'))+
    box('shoulder',52,128,47,28,-22)+box('shoulder ba-p-shoulder-right',121,129,43,26,23)+
    box('drawn-neck',100,106,23,28,-5)+box('collar',94,122,35,17,-7)+
    box('drawn-face',93,49,42,68,-6)+box('face-echo',95,50,40,66,-3)+box('hair-shadow',88,53,16,66,-10);
  const r = paperRandom(454);
  for(let i=0;i<11;i++) art += box('hair',86-i*.55,51+i*.5,43+i*.45,72+i*1.65,-19+r()*8,`opacity:${paperNumber(.37+r()*.5)}`);
  for(const [x,y,w,a] of [[65,147,19,118],[77,168,24,112],[135,157,21,97],[153,179,20,112],[103,167,26,124],[49,179,18,95],[33,173,11,132],[166,162,14,66],[123,185,14,135]]) art += mark(x,y,w,a,'#37372b',.5,.8);
  return p('manuscript','',art,'div');
}
const parchment = paperWrap('parchment', p('parchment-base')+p('parchment-tip')+
  raggedEdge('parchment')+p('parchment-face')+p('paper-grain')+paperDust(24,'#5a3e2247')+paperFibers(78,27,[14,20,160,276])+
  pageCreases(874,21,'parchment')+manuscriptPortrait()+p('cannon','',p('wheel')+p('cannon-support'))+
  p('parchment-rule')+p('signature-cross')+paperFibers(442,7,[151,58,20,129],'#393928',.65));

function notebookMarks() {
  const sets = [
    ['#303730',[[22,22,13,-42],[31,14,10,24],[40,19,9,-47],[47,12,9,77],[50,22,11,-50],[67,16,10,61],[75,25,8,155],[168,101,13,-34],[165,105,17,-9],[181,103,15,133],[170,113,10,14],[180,117,13,140],[170,126,12,31],[173,177,13,141],[166,187,14,20],[179,192,13,141],[165,202,10,32],[170,270,12,140],[163,278,12,4],[173,278,12,142],[165,286,11,-12],[76,295,11,127],[68,303,13,-8],[78,302,9,116]]],
    ['#276d9c',[[159,65,23,-8],[157,75,24,-8],[163,59,23,103],[174,59,23,104],[182,61,17,94],[180,81,2,0],[33,88,17,-26],[48,81,17,118],[40,96,10,-123],[34,88,11,75],[35,103,5,110],[22,170,9,-39],[28,164,10,55],[18,183,16,-32],[22,238,14,-32],[31,232,15,115]]],
    ['#b74e42',[[24,124,18,-78],[20,113,17,-22],[27,108,12,22],[27,128,13,-44],[26,127,12,-128]]]
  ];
  return sets.map(([color,lines])=>lines.map(([x,y,w,a])=>mark(x,y,w,a,color,.85,1.1)).join('')).join('')+
    p('crown','',p('crown-tine ba-p-tine-one')+p('crown-tine ba-p-tine-two')+p('crown-tine ba-p-tine-three')+p('crown-band'))+
    p('notebook-star','',Array.from({length:5},(_,i)=>box('star-ray',10,10,11,1,i*72-90)).join(''))+
    p('smile','',p('smile-eyes')+p('smile-mouth'));
}
const doodle = paperWrap('doodle',raggedEdge('doodle')+p('notebook-page')+p('paper-grain')+
  paperDust(843,'#474b342b')+paperFibers(782,21,[13,13,165,284],'#696951',.22)+pageCreases(61,10,'doodle')+
  notebookMarks()+portrait('doodle')+p('yellow-tape')+p('yellow-tape-edge')+p('page-dogear'));

function inkBamboo(x,y,scale,a) {
  const leaves=[[-1,-36,29,6,-150],[-10,-46,25,5,-167],[-1,-49,27,6,-104],[7,-52,31,7,-67],[11,-52,29,6,-27],[5,-41,29,5,-3],[-1,-22,27,5,-150],[-9,-29,23,5,-176]];
  return p('bamboo',`left:${x}px;top:${y}px;transform:rotate(${a}deg) scale(${scale})`,p('bamboo-stem')+leaves.map(([lx,ly,w,h,rot])=>box('bamboo-leaf',lx,ly,w,h,rot)).join(''),'div');
}
function sealMarks() {
  return p('seal','',Array.from({length:3},(_,i)=>box('seal-character',3,5+i*13,10,10,i%2?-5:4,'',p('seal-vertical')+p('seal-slash'))).join(''));
}
const ink = paperWrap('ink',raggedEdge('ink')+p('ink-page')+p('paper-fold')+p('paper-grain')+
  paperDust(941,'#5a482634')+paperFibers(342,30,[13,26,163,276],'#60543a',.28)+pageCreases(922,10,'ink')+
  p('sun-disc')+inkBamboo(181,119,.74,-14)+inkBamboo(175,56,.62,11)+inkBamboo(19,202,.88,34)+inkBamboo(29,300,.62,28)+
  portrait('ink')+sealMarks()+p('ink-rule'));

function woodSurface() {
  const r=paperRandom(971);let art='';
  for(let i=0;i<9;i++) art += box('plank-seam',21,49+i*27,158,1.3);
  for(let i=0;i<27;i++) art += box('wood-fiber',20+r()*35,25+r()*268,55+r()*100,2+r()*4,-1+r()*2,`opacity:${paperNumber(.18+r()*.38)}`);
  for(let i=0;i<20;i++) art += mark(23+r()*146,27+r()*261,2+r()*12,-9+r()*18,i%3?'#211b11':'#b68b4b',.2+r()*.4,.5+r());
  for(let i=0;i<29;i++) art+=box('wood-scar',20+r()*160,27+r()*253,1+r()*8,.5+r()*3.4,-20+r()*40,`opacity:${paperNumber(.16+r()*.4)};background:${i%3?'#171b0f':'#c69a50'}`);
  for(const [x,y,w,h,a] of [[24,26,32,47,8],[141,51,32,61,-3],[19,153,21,64,7],[156,179,24,79,-8],[76,260,48,24,-4]]) art+=box('wood-stain',x,y,w,h,a);
  return art+box('wood-knot',122,81,30,6)+box('wood-knot',34,177,35,4)+paperDust(312,'#c8994b35');
}
function brasswork() {
  let art='';
  for(const side of [0,1]) {
    let scroll='';
    for(const [x,y,w,h,a] of [[13,24,13,19,30],[28,19,19,10,-20],[48,16,16,10,-23],[12,54,10,23,-16],[12,94,10,23,13],[12,135,10,22,-15],[12,176,10,23,14],[12,218,10,25,-15],[14,256,10,22,13],[28,286,20,10,25],[54,301,21,9,19],[77,310,20,8,14]]) scroll+=box('brass-scroll',x,y,w,h,a);
    for(const [x,y,a] of [[12,44,18],[12,119,-17],[13,159,16],[13,202,-12],[14,245,21],[39,295,38]]) scroll+=box('brass-leaf',x,y,6,12,a);
    art+=p('brass-ornament',side?'transform:scaleX(-1)':'',scroll,'div');
  }
  for(const [x,y] of [[24,43],[176,43],[24,273],[176,273],[100,18],[100,310]])art+=box('rivet',x,y,5,5);
  return art;
}
function steamChain() {
  return p('chain-rail')+p('chain','',[[144,2,-35],[148,14,17],[153,25,-26],[160,37,42],[167,47,-32],[173,59,27],[177,71,-18]].map(([x,y,a],i)=>box(`chain-link${i%2?' ba-p-chain-edge':''}`,x,y,i%2?8:13,23,a)).join(''),'div');
}
const steampunk = paperWrap('steampunk',p('wood-tip')+p('wood-top')+p('wood-body')+woodSurface()+
  p('frame-side ba-p-frame-left')+p('frame-side ba-p-frame-right')+p('frame-top ba-p-frame-top-left')+p('frame-top ba-p-frame-top-right')+
  p('frame-bottom ba-p-frame-bottom-left')+p('frame-bottom ba-p-frame-bottom-right')+portrait('steam')+
  p('steam-banner-shadow')+p('steam-banner','',p('banner-grain')+paperDust(783,'#443b283e',[3,2,157,29],44))+brasswork()+steamChain());

export const basicPaperThemes = {parchment:{art:parchment},doodle:{art:doodle},ink:{art:ink},steampunk:{art:steampunk}};
