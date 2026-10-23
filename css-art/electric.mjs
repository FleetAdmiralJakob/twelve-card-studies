// Build-time drawing instructions. Every emitted mark is an ordinary HTML
// element painted with CSS. Procedural grain and stars use a fixed PRNG;
// no image is read, sampled, embedded, or used to produce these marks.
const random = seed => () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
const n = value => Math.round(value * 100) / 100;
const repeat = (count, fn) => Array.from({length: count}, (_, i) => fn(i)).join('');
const el = (cls, style = '', children = '') => `<i class="${cls}"${style ? ` style="${style}"` : ''}>${children}</i>`;
const box = (cls, x, y, w, h, rest = '', children = '') => el(cls, `left:${n(x)}px;top:${n(y)}px;width:${n(w)}px;height:${n(h)}px;${rest}`, children);
const line = (x1, y1, x2, y2, color, width = .55, rest = '') => box('ee-line', x1, y1, Math.hypot(x2-x1, y2-y1), width, `transform:rotate(${n(Math.atan2(y2-y1,x2-x1)*180/Math.PI)}deg);background:${color};${rest}`);
const polygon = (cls, points, color, rest = '') => el(cls, `clip-path:polygon(${points.map(p=>`${p[0]/2}% ${p[1]/3.2}%`).join(',')});background:${color};${rest}`);

function cyberArt() {
  const rng = random(21337);
  const points = [[103,51],[91,58],[82,72],[80,86],[82,101],[87,118],[98,130],[111,133],[123,123],[132,107],[135,89],[133,72],[123,57],[112,54],[99,69],[88,80],[104,90],[118,76],[124,98],[111,110],[95,109],[107,124],[88,134],[80,145],[66,152],[52,161],[41,178],[42,199],[73,195],[87,176],[96,158],[108,150],[119,139],[129,148],[151,160],[165,178],[169,199],[146,196],[128,177],[113,184],[104,201],[86,201]];
  const edges = [[0,1],[0,13],[1,2],[1,14],[2,3],[2,15],[3,4],[3,15],[4,5],[4,20],[5,6],[5,20],[6,7],[6,21],[7,8],[7,21],[8,9],[8,19],[9,10],[9,18],[10,11],[10,17],[11,12],[11,17],[12,13],[12,17],[13,14],[13,17],[14,15],[14,16],[14,17],[15,16],[15,20],[16,17],[16,18],[16,19],[16,20],[17,18],[18,19],[19,20],[19,21],[20,21],[6,22],[7,22],[8,32],[22,23],[23,24],[24,25],[25,26],[26,27],[27,28],[28,29],[29,30],[30,22],[23,30],[24,29],[25,29],[25,28],[26,28],[30,31],[31,32],[31,33],[32,33],[33,34],[34,35],[35,36],[36,37],[37,38],[38,33],[38,31],[31,39],[39,40],[40,41],[41,28],[29,39],[30,39],[28,41],[38,39],[37,39],[34,38],[35,37]];
  const faceted = [[0,1,14],[1,2,15,14],[13,12,17],[4,5,20],[8,9,19],[24,25,29],[33,34,38],[16,17,18],[27,28,26]].map((ids,i)=>polygon('ee-plane', ids.map(j=>points[j]), ['#0069aa55','#093d7e55','#0085b566','#008bae40'][i%4])).join('');
  const circuit = repeat(44, i => {
    const x = 17 + rng()*167, y = 14 + rng()*292, w = 4+rng()*20, h = 3+rng()*23;
    const color = ['#04bbe46b','#0644937d','#831fd270','#c013bb69'][i%4];
    return box('ee-circuit',x,y,w,h,`border-color:${color};border-width:${i%9===0 ? 1 : .45}px;transform:rotate(${i%4*90}deg);`);
  });
  const glints = repeat(24, i=>box('ee-spark',15+rng()*170,10+rng()*295,i%4?1:3,i%4?1:4,`background:${i%3?'#058ac7':'#b62aca'};opacity:${n(.3+rng()*.5)};`));
  const seams = [[14,35,38,17],[39,17,76,15],[78,15,91,19],[93,18,102,11],[113,17,153,13],[153,13,173,29],[173,29,186,36],[14,39,14,268],[14,275,20,287],[21,288,98,313],[101,313,178,288],[179,287,185,275],[185,39,185,271]];
  const trim = seams.map((p,i)=>line(...p,i%2?'#9a28d9':'#00bee4',i%3? .8:1.3)).join('');
  const web = edges.map(([a,b],i)=>line(...points[a],...points[b],i%6?'#087ab466':'#0c9ace99',i%9? .5:.75)).join('');
  const subdivisions=[[86,65,92,74],[92,74,99,69],[92,74,88,80],[92,74,104,90],[104,90,109,77],[109,77,118,76],[109,77,112,54],[109,77,122,67],[122,67,133,72],[122,67,118,76],[117,90,124,98],[117,90,118,76],[117,90,104,90],[88,95,95,109],[88,95,104,90],[88,95,80,86],[102,103,111,110],[102,103,104,90],[102,103,95,109],[114,120,123,123],[114,120,107,124],[114,120,111,110],[81,156,87,176],[81,156,66,152],[139,160,128,177],[139,160,151,160]].map((p,i)=>line(...p,i%4?'#0476aa5c':'#0ca2cc80',.4)).join('');
  const bright = [[80,86,82,72],[82,72,91,58],[91,58,103,51],[103,51,112,54],[112,54,123,57],[123,57,132,72],[89,129,82,139],[82,139,67,145],[67,145,52,153],[52,153,42,168],[124,140,146,150],[146,150,159,160]].map(p=>line(...p,'#00ccf0bd',1.1)).join('');
  const pins = points.filter((_,i)=>i%3===0).map(([x,y])=>box('ee-spark',x-.6,y-.6,1.2,1.2,'background:#15c8e1;')).join('');
  const invader = box('ee-invader',34,105,3,3,'box-shadow:3px 0 #03bcd6,15px 0 #03bcd6,6px 3px #03bcd6,9px 3px #03bcd6,12px 3px #03bcd6,3px 6px #03bcd6,6px 6px #03bcd6,9px 6px #03bcd6,12px 6px #03bcd6,15px 6px #03bcd6,0 9px #03bcd6,3px 9px #03bcd6,9px 9px #03bcd6,15px 9px #03bcd6,18px 9px #03bcd6,0 12px #03bcd6,3px 12px #03bcd6,6px 12px #03bcd6,9px 12px #03bcd6,12px 12px #03bcd6,15px 12px #03bcd6,18px 12px #03bcd6,0 15px #03bcd6,18px 15px #03bcd6,3px 18px #03bcd6,6px 18px #03bcd6,12px 18px #03bcd6,15px 18px #03bcd6;');
  return `<div class="ee-art ee-cyber">${el('ee-cy-edge')}${el('ee-cy-face')}${el('ee-cy-inner')}${el('ee-cy-clip','',el('ee-cy-grid')+circuit+glints+el('ee-cy-person','',faceted+web+subdivisions+pins)+bright+el('ee-cy-bottom'))}${trim}${invader}${box('ee-cy-spike',91,0,4,22)}${box('ee-cy-spike',139,0,5,20)}${box('ee-cy-spike',158,10,2,16)}${box('ee-cy-glitch',176,35,17,2)}${box('ee-cy-glitch',178,46,15,2)}${box('ee-cy-glitch',8,214,15,2)}${box('ee-cy-glitch',7,224,8,2)}${box('ee-cy-glitch',183,273,9,2)}</div>`;
}

function hologramArt() {
  const rng=random(975);
  const details=repeat(61,i=>box('ee-ho-data',21+rng()*157,18+rng()*281,1+rng()*10,i%9===0?1.7:.55,`background:${i%4?'#1c75606b':'#00c8acb3'};`));
  const rings=[34,42,49,58,68,77,85].map((r,i)=>box('ee-ho-ring',101-r,126-r,r*2,r*2,`--turn:${i*47}deg;--ring-ink:${i%2?'#0ba28e':'#63847c'};--ring-alpha:${n(.37+i*.045)};--ring-width:${i%3===0?1:.45}px;`)).join('');
  let dust=[];for(let i=0;i<240;i++){const head=i<120;dust.push(`${n((head?78:40)+rng()*(head?53:122))}px ${n((head?65:145)+rng()*(head?80:65))}px 0 ${n(rng()*.4)}px ${i%3?'#087b6199':'#22cba5b3'}`);}
  const contour=[[79,98,80,83],[80,83,87,73],[89,70,100,66],[111,68,122,75],[126,89,127,97],[128,105,126,120],[124,127,118,138],[87,139,83,151],[83,154,69,162],[69,162,49,175],[119,155,139,165],[139,165,154,181],[154,181,158,196],[46,187,45,203],[51,197,70,180],[81,174,98,183],[102,183,120,174],[128,179,145,190]].map((p,i)=>line(...p,i%4?'#14a585b3':'#42d2b3a8',i%3?.65:.9)).join('');
  const scanFragments=repeat(12,i=>box('ee-ho-scan-fragment',52+rng()*96,74+rng()*125,4+rng()*12,.55,`background:${i%4?'#0d8f6d99':'#23cfa380'};`));
  // Follow the two end caps and straight rails, rather than an inset ellipse.
  const rimMarks = [
    ...Array.from({length:9},(_,i)=>{const t=Math.PI+(i+.5)/9*Math.PI;return [100+Math.cos(t)*81,89+Math.sin(t)*77,Math.atan2(77*Math.cos(t),-81*Math.sin(t))*180/Math.PI];}),
    ...Array.from({length:7},(_,i)=>{const t=(i+.5)/7*Math.PI;return [100+Math.cos(t)*81,247+Math.sin(t)*61,Math.atan2(61*Math.cos(t),-81*Math.sin(t))*180/Math.PI];}),
    ...[103,137,185,222].flatMap(y=>[[19,y,90],[181,y,90]]),
  ];
  const segments=rimMarks.map(([x,y,turn],i)=>box('ee-ho-dash',x-3,y-.65,6+i%3,1.3,`transform:rotate(${n(turn)}deg);background:${i%5?'#0ba88f':'#9eb2a4'};`)).join('');
  const glyph=box('ee-ho-glyph',34,109,14,16,'',el('ee-ho-glyph-inner'));
  return `<div class="ee-art ee-hologram">${el('ee-ho-rim')}${el('ee-ho-panel')}${el('ee-ho-border')}${el('ee-ho-inset')}${el('ee-ho-detail-clip','',details)}${segments}${box('ee-ho-reticle',15,40,172,172)}${rings}${box('ee-ho-ticks',15,40,172,172)}${line(23,126,45,126,'#3e9a8499')}${line(156,126,178,126,'#3e9a8499')}${line(101,39,101,56,'#3e9a8499')}${line(101,196,101,213,'#3e9a8499')}${el('ee-ho-person','',el('ee-ho-grain',`box-shadow:${dust.join(',')};`)+contour+scanFragments+box('ee-ho-collar',69,153,58,32))}${box('ee-ho-orbit',44,169,116,26)}${el('ee-ho-lower')}${glyph}${box('ee-ho-top-led',84,15,20,2)}${box('ee-ho-top-led',110,16,14,2)}${box('ee-ho-corner',30,224,17,12)}${box('ee-ho-corner ee-ho-corner-right',151,224,17,12)}${box('ee-ho-side',19,109,2,23)}${box('ee-ho-side',178,88,2,13)}${box('ee-ho-side',19,189,2,17)}</div>`;
}

function cosmicArt() {
  const rng=random(92345);
  let stars=[];
  for(let i=0;i<240;i++) stars.push(`${n(11+rng()*178)}px ${n(12+rng()*292)}px ${i%27===0?1:0}px ${n(i%29===0?.65:-.05+rng()*.3)}px ${['#edacffd0','#9b68ed99','#518aefb3','#fff0ffe0'][i%4]}`);
  // Clouds follow an authored diagonal nebula, with organically nested lobes.
  // These positions are seeded geometry, never a sampled source bitmap.
  let gas=[],dust=[];
  const streams=[[[127,24],[116,49],[129,71],[141,91],[133,118],[151,141],[137,175]],[[118,64],[102,92],[94,119],[78,137],[83,151],[58,167],[42,194]],[[137,83],[158,102],[166,120],[155,143],[168,168]]];
  const cloudPoint=(t,lane)=>{const list=streams[lane],v=t*(list.length-1),i=Math.min(Math.floor(v),list.length-2),f=v-i;return [list[i][0]*(1-f)+list[i+1][0]*f+Math.sin(t*43)*3,list[i][1]*(1-f)+list[i+1][1]*f+Math.cos(t*31)*2];};
  for(let i=0;i<53;i++){
    const t=rng(),[xx,yy]=cloudPoint(t,i%7<3?0:i%7<6?1:2),x=xx+(rng()-.5)*25,y=yy+(rng()-.5)*12;
    const rx=n(7+rng()*18),ry=n(5+rng()*14),color=['#c53aee9c','#6815aa9c','#e858df99','#3e137c99'][i%4];
    gas.push(box('ee-co-cloud',n(x)-rx,n(y)-ry,rx*2,ry*2,`background:radial-gradient(ellipse ${rx}px ${ry}px at ${rx}px ${ry}px,${color} 0,transparent 82%);`));
  }
  for(let i=0;i<480;i++){
    const t=rng(),[xx,yy]=cloudPoint(t,i%7<3?0:i%7<6?1:2),x=xx+(rng()-.5)*24,y=yy+(rng()-.5)*14;
    dust.push(`${n(x)}px ${n(y)}px ${n(rng()*.8)}px ${n(-.05+rng()*.5)}px ${['#e380f2d9','#a653d799','#ffb8fce6','#cf49e7b3'][i%4]}`);
  }
  const veins = repeat(44,i=>{
    const t=rng(),[x,y]=cloudPoint(t,i%7<3?0:i%7<6?1:2),w=9+rng()*21,h=4+rng()*13;
    const offsets=[0,18,41,59,80,100].map((p,j)=>[j*20,p===0?0:n(10+rng()*80)]);
    const poly=offsets.concat([...offsets].reverse().map(([a,b])=>[a,b+2+rng()*3])).map(([a,b])=>`${a}% ${b}%`).join(',');
    return box('ee-co-filament',x-w/2,y-h/2,w,h,`background:${rng()>.5?'#ef63f2bf':'#b34fdbb3'};transform:rotate(${n(20+rng()*110)}deg);clip-path:polygon(${poly});`);
  });
  const plumePoints=[[127,25],[119,37],[116,46],[125,57],[122,65],[131,78],[139,88],[133,100],[138,109],[130,121],[141,131],[148,143]];
  const plume=plumePoints.slice(1).map((p,i)=>line(...plumePoints[i],...p,i%4?'#ec70efb3':'#ffd1ffdd',i%3?.7:1.1,'box-shadow:0 0 3px 1px #d331ef88;')).join('');
  const branches=plumePoints.filter((_,i)=>i%2===0).map(([x,y],i)=>line(x,y,x+(i%2?-1:1)*(7+rng()*13),y+7+rng()*8,'#b951e2a8',.6,'box-shadow:0 0 2px #ad30cf99;')).join('');
  const leftPoints=[[102,92],[95,105],[96,115],[84,130],[78,136],[84,148],[74,154],[64,158],[58,170],[47,180]];
  const leftPlume=leftPoints.slice(1).map((p,i)=>line(...leftPoints[i],...p,i%3?'#dc57e9cc':'#f2a3f4dd',i%3?.55:.85,'box-shadow:0 0 2px 1px #c52fe966;')).join('');
  const rim=[
    [[[100,5],[99,12],[17,55],[11,51]],'linear-gradient(155deg,#96ddf3,#6780d2 35%,#282253 60%,#9c56ba)'],
    [[[100,5],[188,51],[181,55],[99,12]],'linear-gradient(30deg,#161330,#3d2c87 49%,#93bce0 70%,#3b173d)'],
    [[[11,51],[17,55],[17,270],[11,273]],'linear-gradient(110deg,#23104499,#4b206555,#131b4080)'],
    [[[188,51],[181,55],[181,270],[188,273]],'linear-gradient(93deg,#43115980,#23113a55 50%,#913ea280)'],
    [[[11,273],[17,270],[100,310],[100,317]],'linear-gradient(23deg,#4b244e88,#18132988,#6f4b6280)'],
    [[[188,273],[181,270],[100,310],[100,317]],'linear-gradient(130deg,#171e3a80,#6d406277,#96959899)'],
    [[[100,5],[135,34],[114,27]],'#a5d5ec99'],
    [[[99,12],[67,30],[53,30],[100,5]],'#91b1f54d'],
    [[[14,52],[33,26],[31,44],[17,55]],'linear-gradient(20deg,#1d1653,#467bcd)'],
    [[[181,55],[162,38],[188,51]],'#aa73d77a'],
    [[[36,35],[39,2],[53,15]],'linear-gradient(50deg,#37134c88,#793ecb88,#1e153c77)'],
    [[[53,28],[72,10],[64,29]],'#29214f'],
    [[[187,214],[196,227],[189,242]],'#553278'],
    [[[9,121],[4,136],[10,152]],'#3e2e7c']
    ,[[[11,90],[17,72],[16,109]],'#777cc855']
    ,[[[11,127],[17,114],[14,164]],'#32294899']
    ,[[[13,199],[17,211],[16,243]],'#8a3caf66']
    ,[[[187,78],[181,63],[184,112]],'#e4a5f044']
    ,[[[187,133],[182,151],[186,171]],'#34234a']
    ,[[[188,222],[181,238],[184,258]],'#aa39be55']
    ,[[[17,270],[55,289],[43,289]],'#6e88c555']
    ,[[[100,310],[128,299],[121,307]],'#b093b366']
  ].map(([points,color])=>polygon('ee-co-facet',points,color)).join('');
  const edges=[[100,5,188,51],[188,51,188,273],[188,273,100,317],[100,317,11,273],[11,273,11,51],[11,51,100,5],[100,12,181,55],[181,55,181,270],[181,270,100,310],[100,310,17,270],[17,270,17,55],[17,55,100,12],[100,5,100,12],[11,51,17,55],[188,51,181,55],[11,273,17,270],[188,273,181,270],[100,310,100,317],[36,35,39,2],[39,2,46,13]];
  const frameLines=edges.map((p,i)=>line(...p,i<6?'#9b6bbb':'#8399c070',i<6?.65:.5)).join('');
  const bodyVeins=repeat(22,i=>box('ee-co-body-vein',54+rng()*100,90+rng()*124,8+rng()*20,4+rng()*15,`transform:rotate(${n(20+rng()*90)}deg);background:${i%3?'#862aaf77':'#e74be7b3'};`));
  const flares=[[115,68,8],[71,164,8],[143,100,5],[96,47,4],[55,185,3]].map(([x,y,w])=>box('ee-co-flare',x-w/2,y-w/2,w,w)).join('');
  // Keep the same ellipses and stops while bounding each gradient's paint area.
  const darkClouds = [[117,40,12,9,'#11071ec9',100],[124,63,9,13,'#140720cc',74],[137,105,10,21,'#120b23c9',76],[76,151,14,8,'#090818cc',78],[105,79,19,14,'#08051adb',70],[150,141,8,12,'#180727bb',77],[66,167,9,5,'#10091ed0',77]].reverse().map(([x,y,rx,ry,color,stop])=>box('ee-co-darkcloud',x-rx,y-ry,rx*2,ry*2,`background:radial-gradient(ellipse ${rx}px ${ry}px at center,${color},transparent ${stop}%);`)).join('');
  return `<div class="ee-art ee-cosmic">${el('ee-co-background')}${el('ee-co-clip','',el('ee-co-gas','',gas.reverse().join(''))+darkClouds+el('ee-co-dust',`box-shadow:${dust.join(',')};`)+veins+plume+leftPlume+branches+el('ee-co-stars',`box-shadow:${stars.join(',')};`)+flares+el('ee-co-person','',bodyVeins+el('ee-co-person-dust',`box-shadow:${stars.slice(50,170).join(',')};`))+el('ee-co-bottom'))}${rim}${frameLines}</div>`;
}

function arcadeArt() {
  const rng=random(8719);
  const pixels=[
    '         YY         ',
    '        YYYY        ',
    '        YYY         ',
    '         Y          ',
    '     YYYYYYYY       ',
    '    YYYYYYYYYY   YY ',
    '   YY   YYYYYYYYYY  ',
    '  YY    YYYYY       ',
    ' YY     YYYYY       ',
    '        YYYY        ',
    '       YYYYY        ',
    '     YYYYYYY        ',
    '    YYYY  YY        ',
    '   YYY    YY        ',
    '    YY   YYY        ',
    '         YY         ',
    '         YY         ',
    '        YYYY        '
  ];
  const sprite=pixels.flatMap((row,y)=>[...row].flatMap((p,x)=>p==='Y'?[`${n(x*3.5)}px ${n(y*3.1)}px 0 ${(x+y)%7===0?'#ffe92c':(x+y)%5===0?'#b6b500':'#e1d61b'}`]:[])).join(',');
  const scratches=repeat(47,i=>box('ee-ar-scratch',13+rng()*176,15+rng()*294,1+rng()*2,.6+rng()*2,`background:${['#b42fd0','#fa3d22','#2253ab','#9459dd'][i%4]};opacity:${n(.4+rng()*.6)};`));
  const screenNoise=Array.from({length:90},(_,i)=>`${n(rng()*122)}px ${n(rng()*77)}px 0 ${n(rng()*.7)}px ${i%3?'#36a64c2b':'#bcd72f26'}`).join(',');
  const buttons=[111,154].map(x=>box('ee-ar-button-base',x-12,186,24,10,'',el('ee-ar-button'))).join('');
  const bolts=[[19,22],[179,22],[16,201],[183,201],[20,304],[181,304]].map(([x,y])=>box('ee-ar-bolt',x-1.5,y-1.5,3,3)).join('');
  return `<div class="ee-art ee-arcade">${el('ee-ar-edge')}${el('ee-ar-body')}${el('ee-ar-top')}${box('ee-ar-header-rim',18,26,165,41)}${box('ee-ar-header',24,27,153,37)}${scratches}${box('ee-ar-screen-well',25,75,151,101)}${box('ee-ar-screen-rim',32,82,136,89)}${box('ee-ar-screen',36,86,127,81,'',el('ee-ar-pitch')+el('ee-ar-pitch-ring')+el('ee-ar-screen-noise',`box-shadow:${screenNoise};`)+box('ee-ar-player',39,8,3.6,3.2,`box-shadow:${sprite};`)+box('ee-ar-ball',14,59,17,17,'',el('ee-ar-ball-panel'))+el('ee-ar-scan')+el('ee-ar-screen-shine'))}${el('ee-ar-controls')}${el('ee-ar-controls-inset')}${box('ee-ar-stick-base',40,184,28,10)}${box('ee-ar-stick-shaft',51,174,5,14)}${box('ee-ar-stick-ball',45,164,16,16)}${buttons}${box('ee-ar-bottom',15,211,171,94)}${box('ee-ar-bottom-inset',20,216,161,83)}${box('ee-ar-side-rail',8,213,4,91)}${box('ee-ar-side-rail ee-ar-side-right',187,211,4,93)}${box('ee-ar-side-rail ee-ar-upper-rail',20,74,3,93)}${box('ee-ar-side-rail ee-ar-upper-rail',177,73,3,95)}${box('ee-ar-bottom-line',24,308,152,1)}${box('ee-ar-speaker',157,293,15,4)}${box('ee-ar-score-pixels',157,42,3,3)}${bolts}</div>`;
}

export const electricCssThemes = {
  cyber: {art: cyberArt()},
  hologram: {art: hologramArt()},
  cosmic: {art: cosmicArt()},
  arcade: {art: arcadeArt()},
};
