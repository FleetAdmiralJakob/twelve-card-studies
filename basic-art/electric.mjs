// Native-box edition: authored rounded solids, finite local gradients and
// deterministic ornamental marks. This module only runs while building HTML.
// No source image is sampled, and no contour is reconstructed from segments.
const ebRandom = seed => () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
const ebN = n => Math.round(n * 100) / 100;
const ebRepeat = (count, fn) => Array.from({length: count}, (_, i) => fn(i)).join('');
const ebEl = (name, style = '', children = '') => `<i class="ba-el-${name}"${style ? ` style="${style}"` : ''}>${children}</i>`;
const ebBox = (name, x, y, w, h, style = '', children = '') => ebEl(name, `left:${ebN(x)}px;top:${ebN(y)}px;width:${ebN(w)}px;height:${ebN(h)}px;${style}`, children);
const ebArt = (name, content) => `<div class="ba-electric ba-el-${name}" aria-hidden="true">${content}</div>`;

function ebPortrait(kind, seed) {
  const rng = ebRandom(seed);
  const marks = (count, w, h, bright) => ebRepeat(count, i => ebBox('skin-mark', rng()*w, rng()*h, .4+rng()*1.1, .4+rng()*2.8, `opacity:${ebN(.2+rng()*.6)};background:${i%6===0?bright:'var(--ba-person-dust)'};transform:rotate(${ebN(rng()*130-65)}deg);${kind==='cosmic'?`box-shadow:${ebN(rng()*12-6)}px ${ebN(rng()*12-6)}px 0 #b64ac259,${ebN(rng()*18-9)}px ${ebN(rng()*18-9)}px 0 #e486ed33;`:''}`));
  const hair = kind === 'cosmic' ? ebRepeat(8, i => ebBox('hair', 84+i*5.6, 57+(i<2?5-i*2:i>5?(i-5)*3:0), 9+rng()*5, 10+rng()*4, `transform:rotate(${ebN(rng()*60-30)}deg);`)) : '';
  const mesh = kind === 'cyber' ? ebRepeat(8,i=>ebBox('mesh-band',-12,5+i*10,85,10,`transform:rotate(${i%2?28:-27}deg);`)) : '';
  return ebEl('person', '',
    ebBox('shoulder ba-el-shoulder-left',40,137,48,67)+
    ebBox('shoulder ba-el-shoulder-right',127,137,39,67)+
    ebBox('torso',53,136,101,72,'',marks(24,101,68,'var(--ba-person-edge)')+ebEl('shirt-weave')+ebBox('shirt-fold',10,20,24,39)+ebBox('shirt-fold ba-el-fold-right',67,16,23,44))+
    ebBox('neck',94,117,25,28)+
    ebBox('collar',75,132,61,20)+
    ebBox('collar-inner',86,132,41,13)+
    ebBox('ear',79,84,10,23)+ebBox('ear ba-el-ear-right',126,84,9,22)+
    ebBox('head',83,57,49,75,'',ebEl('head-light')+mesh+marks(26,49,75,'var(--ba-person-edge)')+ebBox('temple',7,11,24,35)+ebBox('jaw',10,37,33,31))+
    hair+ebBox('nape-light',119,124,1,11,'transform:rotate(12deg);'));
}

function ebCyber() {
  const rng = ebRandom(72139);
  const circuits = ebRepeat(51,i=>{
    const x=16+rng()*166, y=16+rng()*274;
    return ebBox('circuit',x,y,3+rng()*12,9+rng()*37,`border-color:${['#153d8e80','#007fac70','#701da280','#9014a76b'][i%4]};border-width:${i%8?'.45':'1'}px;transform:rotate(${i%5===0?180:0}deg);`, i%3===0?ebBox('circuit-pin',-1,-2,2,3):'');
  });
  const lights=ebRepeat(34,i=>ebBox('diode',15+rng()*170,17+rng()*279,i%5?1:2.5,i%4?1:4,`background:${i%3?'#1589cd':'#b82fc7'};opacity:${ebN(.3+rng()*.55)};`));
  const abrasion=ebRepeat(16,i=>ebBox('scratch',17+rng()*166,20+rng()*274,2+rng()*10,.35,`background:${i%3?'#2d6dc962':'#ba54d957'};transform:rotate(${i%2?90:0}deg);`));
  const ribs=ebRepeat(7,i=>ebBox('cy-rib',28+i*23,22+(i%3)*3,1,6+i%3*5,`background:${i%2?'#9f1dd3':'#00b9e9'};`));
  const invader = [[3,0,3,3],[15,0,3,3],[6,3,9,3],[3,6,15,3],[0,9,6,6],[9,9,3,6],[15,9,6,6],[3,15,3,3],[15,15,3,3],[6,18,3,3],[12,18,3,3]].map(p=>ebBox('invader-bit',...p)).join('');
  return ebArt('cyber',ebEl('cy-rim')+ebEl('cy-panel','',ebEl('cy-grid')+circuits+lights+abrasion+ebPortrait('cyber',349)+ebEl('cy-lower'))+ebEl('cy-inner')+ebEl('cy-inner-fine')+ribs+ebBox('cy-spike',91,0,4,21)+ebBox('cy-spike',140,0,5,20)+ebBox('cy-spike',158,11,2,15)+ebBox('cy-glitch',175,38,18,2)+ebBox('cy-glitch',178,47,15,2)+ebBox('cy-glitch',7,214,14,2)+ebBox('cy-glitch',8,225,8,2)+ebBox('cy-glitch',181,270,12,2)+ebBox('invader',34,105,21,21,'',invader));
}

function ebHologram() {
  const rng=ebRandom(98731);
  const rings=[34,42,50,59,68,77,85].map((r,i)=>ebBox('scan-ring',101-r,126-r,2*r,2*r,`border-width:${i%3?'.5':'1'}px;transform:rotate(${i*43}deg);opacity:${ebN(.38+i*.055)};`)).join('');
  // Separate radial calibration ticks, not a traced silhouette.
  const ticks=ebRepeat(48,i=>{
    const a=i*Math.PI/24;
    return ebBox('scan-tick',101+Math.sin(a)*80,126-Math.cos(a)*80,i%6===0?1.3:.55,i%6===0?5:2.5,`transform:rotate(${i*7.5}deg);background:${i%6?'#388f77a6':'#04dab2ba'};`);
  });
  const data=ebRepeat(42,i=>ebBox('readout',21+rng()*157,20+rng()*278,1+rng()*8,i%10===0?1.5:.45,`background:${i%4?'#357f6680':'#00c8a5a8'};`));
  const rimwear=ebRepeat(19,i=>{
    const side=i%2, y=65+rng()*193;
    return ebBox('rim-wear',side?185:12,y,.5+rng()*.8,2+rng()*8,`background:${i%3?'#749b896b':'#02a88b94'};`);
  });
  return ebArt('hologram',ebEl('ho-metal')+ebEl('ho-panel')+ebEl('ho-inset')+ebEl('ho-dashes')+data+rings+ticks+ebPortrait('hologram',151)+ebBox('ho-cross',23,126,21,.6)+ebBox('ho-cross',157,126,21,.6)+ebBox('ho-cross',101,39,.6,17)+ebBox('ho-orbit',44,172,114,25)+ebEl('ho-lower')+rimwear+ebBox('ho-led',84,15,19,2)+ebBox('ho-led',110,16,14,2)+ebBox('ho-led',178,88,2,12)+ebBox('ho-led',18,188,2,14)+ebBox('ho-corner',29,224,18,12)+ebBox('ho-corner ba-el-ho-corner-right',153,224,18,12)+ebBox('ho-insignia',34,111,15,17,'',ebBox('ho-insignia-ring',2,2,12,11)+ebBox('ho-insignia-line',-3,8,21,.8,'transform:rotate(32deg);')+ebBox('ho-insignia-ring',9,15,9,9)));
}

function ebCosmic() {
  const rng=ebRandom(48115);
  // Three loosely related cloud masses. Each lobe is a small radial field;
  // there are no full-card stacks of gas layers or raster-derived coordinates.
  const clouds=ebRepeat(37,i=>{
    const band=i%3, y=band===1?62+rng()*137:27+rng()*150;
    const x=band===0?123+Math.sin(y*.057)*16:band===1?137-y*.41:151+Math.cos(y*.04)*16;
    const w=16+rng()*26,h=10+rng()*20;
    return ebBox('nebula',x-w/2-12,y-h/2-6,w,h,`transform:rotate(${ebN(rng()*140-70)}deg);--ba-cloud:${['#c144e579','#7d26c16b','#e47be769','#4f30a36b'][i%4]};--ba-cloud-core:${['#ee99ef5c','#be3edb4d','#ea80de52'][i%3]};`);
  });
  const dark=ebRepeat(10,i=>ebBox('dark-cloud',70+rng()*68,27+rng()*128,10+rng()*16,12+rng()*18,`transform:rotate(${ebN(rng()*100)}deg);`));
  const stars=ebRepeat(46,i=>{
    const scatter=Array.from({length:5},(_,j)=>`${ebN(rng()*46-23)}px ${ebN(rng()*54-27)}px 0 ${ebN(-.15+rng()*.1)}px ${['#9c89cf99','#88a5d7ad','#efd9ef9c'][j%3]}`).join(',');
    return ebBox('star',2+rng()*165,8+rng()*283,i%17===0?1.35:.4+rng()*.45,i%17===0?1.35:.4+rng()*.45,`background:${['#c4b4e8','#808cd9','#f0c8f1','#bc67de'][i%4]};opacity:${ebN(.4+rng()*.6)};box-shadow:${scatter}${i%17===0?',0 0 3px #ca76ed99':''};`);
  });
  const dust=ebRepeat(44,i=>{
    const y=31+rng()*154, x=i%3?124+Math.sin(y*.057)*18:137-y*.41;
    const dustCluster=Array.from({length:8},(_,j)=>`${ebN(rng()*20-10)}px ${ebN(rng()*13-6.5)}px ${j%3===0?.3:0}px ${ebN(-.1+rng()*.15)}px ${['#e2a2f2a6','#ba66d699','#f8d6f4ba','#ce70e18c'][j%4]}`).join(',');
    return ebBox('cosmic-dust',x+rng()*24-24,y-6,.4+rng()*.55,.35+rng()*.55,`background:${i%4?'#e695edb0':'#ffe0fac9'};opacity:${ebN(.5+rng()*.5)};transform:rotate(${ebN(rng()*180)}deg);box-shadow:${dustCluster};`);
  });
  const wisps=ebRepeat(8,i=>{
    const y=34+i*16,x=i%3===0?125-y*.38:112+Math.sin(y*.057)*15;
    return ebBox('nebula-wisp',x,y,3+rng()*4,18+rng()*14,`transform:rotate(${ebN(rng()*110-35)}deg);opacity:${ebN(.5+rng()*.35)};`);
  });
  const flecks=ebRepeat(16,i=>ebBox('crystal-scuff',i%2?181+rng()*4:14+rng()*4,54+rng()*214,.5+rng()*1.2,2+rng()*10,`background:${['#7da9da96','#b265d68f','#7354938c'][i%3]};transform:rotate(${ebN(rng()*10-5)}deg);`));
  const glints=[[112,64,7],[73,161,6],[144,97,4],[98,40,3]].map(([x,y,s])=>ebBox('star-flare',x,y,s,.7,'',ebBox('star-flare-upright',s/2,-s/2,.6,s))).join('');
  return ebArt('cosmic',ebEl('co-rim')+ebEl('co-panel','',clouds+dark+wisps+dust+stars+glints+ebPortrait('cosmic',987)+ebEl('co-lower'))+ebEl('co-bevel')+ebEl('co-inner')+ebBox('glass-shard',36,8,12,35,'transform:rotate(16deg);')+ebBox('glass-shard ba-el-glass-small',59,17,7,25,'transform:rotate(36deg);')+ebBox('glass-shard ba-el-glass-side',185,223,6,17,'transform:rotate(-20deg);')+flecks);
}

function ebArcade() {
  const rng=ebRandom(93871);
  // Hand-authored game sprite, expressed as rectangular runs. These are pixel
  // illustration blocks, not samples or a vector contour approximation.
  const footballer=[
    [8,0,3,1],[7,1,5,2],[8,3,4,2],[9,5,2,1],
    [5,6,9,2],[3,7,3,2],[2,8,2,2],[1,10,2,2],[0,11,2,2],
    [13,7,4,2],[16,8,3,1],[18,7,2,2],[19,6,2,2],
    [7,8,6,6],[6,13,7,3],[5,16,5,2],[4,17,4,2],[3,18,4,2],[2,19,5,2],
    [9,15,4,2],[11,17,3,2],[12,19,3,3],[13,21,3,2],[14,23,4,2]
  ];
  const sprite=footballer.map((p,i)=>ebBox('football-pixel',p[0]*2.6,p[1]*2.6,p[2]*2.6,p[3]*2.6,`background:${i%7===0?'#ffeb26':i%5===0?'#c2b817':'#e5d520'};`)).join('');
  const highlights=[[9,1,1,3],[8,7,1,7],[4,8,1,1],[6,16,2,1],[13,20,1,3],[16,24,2,1],[15,8,2,1]].map(p=>ebBox('football-pixel',p[0]*2.6,p[1]*2.6,p[2]*2.6,p[3]*2.6,'background:#fff33a88;')).join('');
  const noise=ebRepeat(28,i=>ebBox('screen-fleck',rng()*124,rng()*78,.7+rng()*2,.4+rng()*.8,`background:${i%3?'#89c96b33':'#bfd8443d'};`));
  const chips=ebRepeat(67,i=>{
    // Keep wear on the cabinet's exposed surfaces, away from its screen.
    const zone=i%3,x=zone===0?23+rng()*153:zone===1?(i%2?177:17)+rng()*6:21+rng()*157;
    const y=zone===0?27+rng()*35:zone===1?75+rng()*225:216+rng()*85;
    return ebBox('cabinet-chip',x,y,.7+rng()*2.4,.5+rng()*2.5,`background:${['#b94ac9','#d96735','#5255a0','#e24236','#745597'][i%5]};opacity:${ebN(.4+rng()*.5)};transform:rotate(${i%5===0?90:0}deg);`);
  });
  const bolts=[[21,22],[179,22],[17,201],[183,201],[20,304],[181,304]].map(([x,y])=>ebBox('bolt',x,y,2.7,2.7)).join('');
  const controls=[112,155].map(x=>ebBox('button-mount',x-12,185,25,11,'',ebEl('push-button'))).join('');
  const scuffs=ebRepeat(15,i=>ebBox('cabinet-scuff',20+rng()*159,181+rng()*19,1+rng()*8,.4,`background:${i%3?'#ae6dc456':'#4b599766'};transform:rotate(${ebN(rng()*22-11)}deg);`));
  return ebArt('arcade',ebEl('ar-body')+ebEl('ar-left-edge')+ebEl('ar-right-edge')+ebBox('ar-top',17,12,166,12)+ebBox('marquee-rim',18,25,165,42)+ebBox('marquee',24,27,153,37)+ebBox('screen-well',25,75,151,101)+ebBox('screen-rim',31,80,138,91)+ebBox('crt',36,85,127,81,'',ebEl('pitch')+ebBox('pitch-circle',65,33,36,21)+noise+ebBox('footballer',43,8,56,65,'',sprite+highlights)+ebBox('football',14,59,17,17,'',ebBox('ball-patch',6,3,6,6)+ebBox('ball-patch',0,7,3,5)+ebBox('ball-patch',7,13,5,3)+ebBox('ball-patch',14,8,3,4))+ebEl('scanlines')+ebEl('crt-glass'))+ebEl('console')+ebEl('console-inset')+scuffs+ebBox('stick-mount',40,183,28,11)+ebBox('stick-shaft',51,173,5,16)+ebBox('stick-ball',45,164,16,16)+controls+ebBox('ar-lower',15,211,171,94)+ebBox('ar-lower-inset',20,216,161,83)+ebBox('ar-bottom-edge',24,308,152,1)+ebBox('speaker',157,291,15,5)+ebBox('speaker',29,292,11,4)+ebBox('coin-slot',159,278,10,3)+chips+bolts+ebBox('score-light',158,41,3,3));
}

export const basicElectricThemes = {
  cyber: {art: ebCyber()},
  hologram: {art: ebHologram()},
  cosmic: {art: ebCosmic()},
  arcade: {art: ebArcade()},
};
