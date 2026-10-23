// Build-time composition: native boxes, ellipses, borders, and gradients only.
// Ornament is generated from fixed seeds; it is not sampled from any image.
const baRound = x => +x.toFixed(2);
const baRandom = seed => () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
const baMark = (name, style = '', content = '') => `<i class="${name.split(' ').map(part=>`ba-${part}`).join(' ')}"${style ? ` style="${style}"` : ''}>${content}</i>`;
const baBox = (name, x, y, w, h, extra = '', content = '') => baMark(name, `left:${baRound(x)}px;top:${baRound(y)}px;width:${baRound(w)}px;height:${baRound(h)}px;${extra}`, content);
function baSpeckle(seed, count, color, bounds) {
  const r = baRandom(seed), shadows = [];
  for (let i = 0; i < count; i++) shadows.push(`${baRound(bounds[0] + r() * bounds[2])}px ${baRound(bounds[1] + r() * bounds[3])}px 0 ${baRound(r() * .38)}px ${color}`);
  return baMark('at-dust', `box-shadow:${shadows.join(',')}`);
}
function baAbrasion(seed, count, bounds, color, maxLength = 7) {
  const r = baRandom(seed); let marks = '';
  for (let i = 0; i < count; i++) marks += baBox('at-wear', bounds[0] + r() * bounds[2], bounds[1] + r() * bounds[3], .6 + r() * maxLength, .25 + r() * .5, `background:${color};opacity:${baRound(.18+r()*.6)};transform:rotate(${baRound(r()*130-65)}deg)`);
  return marks;
}
function baBlueprint() {
  const r=baRandom(3881); let drafting='', scratches='';
  for(let i=0;i<30;i++) drafting+=baBox('bp-diagram',18+r()*157,18+r()*266,3+r()*15,2+r()*14,`opacity:${baRound(.2+r()*.4)}`);
  for(let i=0;i<25;i++) scratches+=baBox('bp-goldwear',77+r()*32,40+r()*79,.4+r()*2,1+r()*5,`transform:rotate(${baRound(r()*130)}deg);opacity:${baRound(.12+r()*.3)}`);
  return `<div class="ba-artistic ba-blueprint">${baMark('bp-tail', '', baMark('bp-tail-left')+baMark('bp-tail-right'))}${baMark('bp-paper')}${baMark('bp-grid')}${drafting}${baMark('bp-shoulders')}${baMark('bp-head')}${scratches}${baMark('bp-axis')}${baMark('bp-horizontal')}${baMark('bp-horizon')}${baMark('bp-inner-frame')}${baMark('bp-bottom-left')}${baMark('bp-bottom-right')}${baMark('bp-emblem','',baMark('bp-check'))}${baBox('bp-cross',160,31,13,5)}${baBox('bp-cross',24,158,7,3)}${baBox('bp-cross',46,20,5,2)}${baAbrasion(3811,69,[14,14,171,278],'#d2be805f',8)}${baSpeckle(3813,100,'#d7c28a60',[14,15,171,276])}${baSpeckle(3814,85,'#070e0b88',[76,38,38,149])}${baBox('bp-edgewear',11,11,62,.8,'transform:rotate(-.8deg)')}${baBox('bp-edgewear',111,12,75,.9,'transform:rotate(-.5deg)')}${baBox('bp-edgewear',12,74,.8,61)}${baBox('bp-corner',15,20,16,7,'transform:rotate(-39deg)')}${baBox('bp-corner',169,281,7,24,'transform:rotate(-16deg)')}</div>`;
}
function baComic() {
  const r=baRandom(3898);let bursts='',speed='',banner='';
  // Broad overlapping rectangular print rays, never a polygon point list.
  for(let i=0;i<19;i++){const w=14+r()*13,h=90+r()*28;bursts+=baBox('c-ray c-ray-blue',110-w/2,128-h,w,h,`transform:rotate(${i*19-10}deg)`);}
  for(let i=0;i<13;i++){const w=15+r()*14,h=63+r()*26;bursts+=baBox('c-ray c-ray-gold',111-w/2,133-h,w,h,`transform:rotate(${i*28+8}deg)`);}
  for(let i=0;i<18;i++){const angle=i*20+r()*7, rad=angle*Math.PI/180;speed+=baBox('c-speed',109+Math.cos(rad)*75,141+Math.sin(rad)*70,.8+r()*1.1,9+r()*16,`transform:rotate(${angle-90}deg)`);}
  for(let i=0;i<9;i++)banner+=baBox('c-banner-tab',17+i*19,183+(i%2)*3,26,36,`transform:rotate(${i%2?13:-14}deg)`);
  const athlete=baMark('c-backarm')+baMark('c-backforearm')+baMark('c-backfist')+baMark('c-frontarm')+baMark('c-frontforearm')+baMark('c-frontfist')+baMark('c-body')+baMark('c-shoulder')+baMark('c-neck')+baMark('c-head','',baMark('c-ear')+baMark('c-brow')+baMark('c-cheek'))+baMark('c-collar')+baMark('c-fold c-fold-a')+baMark('c-fold c-fold-b')+baMark('c-fold c-fold-c')+baMark('c-fold c-fold-d')+baMark('c-fold c-fold-e')+baMark('c-fold c-fold-f')+baMark('c-fold c-fold-g')+baMark('c-knuckles')+baMark('c-knuckles c-knuckles-back');
  return `<div class="ba-artistic ba-comic">${baMark('c-tail','',baMark('c-tail-left')+baMark('c-tail-right'))}${baMark('c-paper','',bursts+baMark('c-halftone')+speed+baMark('c-statground'))}${baBox('c-edge-shard',117,7,36,9,'transform:rotate(-17deg)')}${baBox('c-edge-shard',171,22,17,24,'transform:rotate(18deg)')}${athlete}${baMark('c-banner','',banner+baMark('c-banner-center'))}${baMark('c-score','',baSpeckle(3891,60,'#63432344',[1,1,54,73]))}${baAbrasion(3894,64,[12,17,172,263],'#0c100d',6)}${baSpeckle(3895,120,'#07130c66',[12,15,171,272])}${baSpeckle(3896,100,'#f7dda66b',[12,15,171,272])}${baBox('c-crease',20,269,24,1,'transform:rotate(-54deg)')}${baBox('c-crease',155,281,30,1.6,'transform:rotate(24deg)')}${baBox('c-crease',22,285,32,2,'transform:rotate(19deg)')}${baBox('c-crease',151,295,31,2,'transform:rotate(-22deg)')}</div>`;
}
function baForestRing(t) {
  // Evenly spread ornaments along the rounded frame, with longer straight sides.
  const d=((t/(Math.PI*2))%1+1)%1*790;
  if(d<190){const a=Math.PI+d/190*Math.PI;return [102+84*Math.cos(a),65+50*Math.sin(a)];}
  if(d<395)return [186,65+d-190];
  if(d<585){const a=(d-395)/190*Math.PI;return [102+84*Math.cos(a),270+44*Math.sin(a)];}
  return [18,270-(d-585)];
}
function baForest() {
  const r=baRandom(3874);let stones='',leaves='',vines='',magic='',portrait='';
  for(let i=0;i<52;i++){
    const a=i/52*Math.PI*2,p=baForestRing(a),w=12+r()*11,h=17+r()*13;
    stones+=baBox('f-stone',p[0]-w/2+r()*5-2,p[1]-h/2+r()*4-2,w,h,`transform:rotate(${baRound(a*180/Math.PI+30+r()*55)}deg);--stone:${['#6f7562','#a5a58f','#7e8672','#c2bca4','#68725e'][i%5]};--facet:${baRound(25+r()*90)}deg;--round:${baRound(4+r()*13)}%;`);
  }
  for(let i=0;i<18;i++){
    const a=i/18*Math.PI*2,p=baForestRing(a),next=baForestRing(a+.005),rotation=Math.atan2(next[1]-p[1],next[0]-p[0])*180/Math.PI-90;
    vines+=baBox('f-vine',p[0]-9,p[1]-22,11+r()*9,36+r()*16,`transform:rotate(${baRound(rotation-13+r()*26)}deg);--vine:${i%3?'#667323':'#a1a63b'}`);
  }
  for(let i=0;i<55;i++){
    const p=baForestRing(r()*Math.PI*2);
    leaves+=baBox('f-leaf',p[0]+r()*17-9,p[1]+r()*18-9,2+r()*3.2,5+r()*6,`transform:rotate(${baRound(r()*360)}deg);--leaf:${['#7f901f','#526613','#a0a232','#34480c','#91a92b'][i%5]}`);
  }
  for(let i=0;i<29;i++) magic+=baBox('f-energy',27+r()*137,31+r()*143,7+r()*21,12+r()*28,`transform:rotate(${baRound(r()*140-70)}deg);opacity:${baRound(.19+r()*.5)};--energy:${i%5?'#30c58c':'#b6c86c'}`);
  for(let i=0;i<20;i++) portrait+=baBox('f-portrait-vein',r()*100,r()*115,3+r()*12,6+r()*20,`transform:rotate(${baRound(r()*110-55)}deg);opacity:${baRound(.22+r()*.5)}`);
  return `<div class="ba-artistic ba-forest">${baMark('f-interior','',baMark('f-glow')+magic+baMark('f-torso')+baMark('f-neck')+baMark('f-head','',baMark('f-face-brow')+baMark('f-face-cheek')+baMark('f-face-nose'))+baMark('f-portrait-texture','',portrait+baSpeckle(3877,100,'#a7cf867a',[0,0,105,123]))+baMark('f-collar')+baMark('f-shirt-seam')+baSpeckle(3871,120,'#b2cc7377',[24,24,146,190])+baSpeckle(3876,110,'#27d18a80',[27,30,140,175])+baMark('f-statground'))}${baMark('f-twining')}${stones}${vines}${leaves}${baMark('f-crown','',baMark('f-crown-splinter'))}${baMark('f-title','',baSpeckle(3875,90,'#29362880',[2,1,152,23])+baAbrasion(3880,12,[3,2,150,21],'#333c2b',7))}</div>`;
}
function baCathedral() {
  const r=baRandom(3919),colors=['#164c92','#116a8e','#294ea4','#80206f','#a62b5d','#c39c32','#17768c','#253478','#33246d','#673082','#ab8c31','#17626d'];let panes='',rose='',tracery='',shirt='',rivets='';
  for(let row=0;row<11;row++)for(let col=0;col<6;col++){
    const color=colors[Math.floor(r()*colors.length)],other=colors[Math.floor(r()*colors.length)];
    panes+=baBox('s-pane',col*29-4+(row%2)*8,row*27-7,32,32,`transform:rotate(${baRound(r()*19-10)}deg);--glass:${color};--other:${other};--lead:${baRound(15+r()*150)}deg`);
  }
  for(let i=0;i<8;i++)rose+=baMark('s-petal',`transform:rotate(${i*45}deg);--petal:${i%3?'#d4a83a':'#318aa1'}`);
  for(let i=0;i<3;i++)tracery+=baBox('s-arch',16+i*4,42+i*5,63-i*8,166+i*13)+baBox('s-arch',121+i*4,42+i*5,63-i*8,166+i*13);
  for(let row=0;row<4;row++)for(let col=0;col<5;col++)shirt+=baBox('s-shirt-pane',col*24-8+(row%2)*7,row*20-2,29,26,`transform:rotate(${baRound(r()*50-25)}deg);--glass:${['#27527e','#144f70','#285792','#174759','#3d3b70','#243f71'][Math.floor(r()*6)]}`);
  for(let i=0;i<28;i++)rivets+=baBox('s-rivet',i<14?11:187,57+(i%14)*15,1.5,2.5);
  return `<div class="ba-artistic ba-cathedral">${baMark('s-tail','',baMark('s-tail-left')+baMark('s-tail-right'))}${baMark('s-outer')}${baMark('s-window','',panes+baMark('s-glass-shadow'))}${tracery}${baMark('s-rose','',rose+baMark('s-rose-ring')+baMark('s-rose-heart'))}${baMark('s-person','',baMark('s-torso','',shirt)+baMark('s-neck')+baMark('s-head','',baMark('s-face-seam'))+baMark('s-collar')+baMark('s-shirt-seam'))}${baMark('s-statground')}${baMark('s-side s-side-left')}${baMark('s-side s-side-right')}${rivets}${baMark('s-top-arch')}${baMark('s-crown','',baMark('s-jewel'))}${baMark('s-sun','',baMark('s-sun-core'))}${baMark('s-banner-left')}${baMark('s-banner-right')}${baMark('s-nameplate')}${baAbrasion(3917,15,[17,31,166,260],'#efd88a55',4)}${baSpeckle(3912,110,'#f3cc754a',[18,25,165,264])}${baSpeckle(3913,85,'#0c112c66',[18,25,165,264])}${baMark('s-bottom-left')}${baMark('s-bottom-right')}</div>`;
}
export const basicArtisticThemes = {
  blueprint:{art:baBlueprint()},
  comic:{art:baComic()},
  forest:{art:baForest()},
  cathedral:{art:baCathedral()},
};
