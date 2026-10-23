// Build-time HTML construction. Every visible mark is painted by native CSS.
// These seeds produce original texture; no pixels or vector image files are read.
const rng = seed => () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
const n = x => +x.toFixed(2);
const el = (c, s = '', body = '') => `<i class="${c}"${s ? ` style="${s}"` : ''}>${body}</i>`;
const poly = (c, coords, fill, extra = '') => el(c, `clip-path:polygon(${coords.map(([x,y])=>`${n(x)}px ${n(y)}px`).join(',')});background:${fill};${extra}`);
const line = (x,y,x2,y2,color,width=.6,extra='') => el('aa-line', `left:${n(x)}px;top:${n(y)}px;width:${n(Math.hypot(x2-x,y2-y))}px;height:${width}px;background:${color};transform:rotate(${n(Math.atan2(y2-y,x2-x)*180/Math.PI)}deg);${extra}`);
function ribbon(c,pts,w,color,extra=''){
  const edges=pts.map(([x,y],i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],d=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [[x-(b[1]-a[1])*w/d/2,y+(b[0]-a[0])*w/d/2],[x+(b[1]-a[1])*w/d/2,y-(b[0]-a[0])*w/d/2]];});
  return poly(c,[...edges.map(e=>e[0]),...edges.map(e=>e[1]).reverse()],color,extra);
}
function grain(seed, count, color, bounds=[0,0,200,320], className='aa-grain') {
  const r=rng(seed), shadows=[];
  count=Math.min(count,190);
  for(let i=0;i<count;i++)shadows.push(`${n(bounds[0]+r()*bounds[2])}px ${n(bounds[1]+r()*bounds[3])}px 0 ${n(r()*.43)}px ${color}`);
  return el(className,`box-shadow:${shadows.join(',')}`);
}
function scuffs(seed,count,bounds,color){const r=rng(seed);let a='';for(let i=0;i<count;i++){const x=bounds[0]+r()*bounds[2],y=bounds[1]+r()*bounds[3];a+=line(x,y,x+2+r()*11,y+r()*4-2,color,.2+r()*.5)}return a;}
const shield=[[10,11],[190,11],[190,292],[100,315],[10,292]];
function blueprint(){
  const r=rng(881);let diagrams='';
  for(let i=0;i<22;i++)diagrams+=el('aa-bp-diagram',`left:${n(18+r()*160)}px;top:${n(17+r()*275)}px;width:${n(3+r()*15)}px;height:${n(3+r()*12)}px;opacity:${n(.2+r()*.4)}`);
  let border='';[[12,13,187,13],[187,13,187,290],[187,290,100,312],[100,312,13,290],[13,290,13,13],[17,18,183,18],[183,18,183,286],[183,286,100,307],[100,307,17,286],[17,286,17,18]].forEach(p=>border+=line(...p,'#dcc58b',.65));
  return `<div class="aa-art aa-blueprint">${poly('aa-bp-shell',shield,'#b9a46f')}${poly('aa-bp-paper',[[12,14],[187,14],[187,290],[100,312],[13,290]],'radial-gradient(ellipse at 54% 35%,#151a15,#0b100e 78%)', '',)}<div class="aa-bp-inside">${el('aa-bp-grid')}${diagrams}${el('aa-bp-head')}${el('aa-bp-shoulders')}${line(114,27,114,195,'#ceb98266',.5)}${line(61,81,163,81,'#ceb98230',.5)}${el('aa-bp-horizon')}${el('aa-bp-emblem','',el('aa-bp-check'))}${scuffs(882,38,[13,14,175,278],'#cab5795a')}${grain(883,600,'#cdb68270',[13,15,173,284])}${grain(884,350,'#000a',[15,17,170,276])}</div>${border}${line(15,25,27,15,'#e2c88b',.8)}${line(15,30,34,15,'#d6be84',.6)}${line(168,282,175,306,'#d6be84',.6)}${line(175,279,182,300,'#d6be84',.6)}${el('aa-bp-cross','left:162px;top:31px')}${el('aa-bp-cross','left:26px;top:158px')}${line(13,11,62,10,'#e9d89b',1.1)}${line(69,10,126,11,'#dec58a',.9)}${line(133,12,188,10,'#dec58a',.7)}</div>`;
}
const comicOutline=[[6,7],[83,17],[159,1],[145,20],[194,17],[187,55],[199,53],[192,287],[103,316],[4,288],[10,81],[2,64],[9,65]];
const comicBlue=[[56,91],[72,100],[75,65],[86,83],[104,38],[99,80],[135,42],[129,84],[175,35],[160,86],[190,67],[172,119],[191,127],[160,146],[188,158],[168,175],[183,196],[154,194],[172,225],[141,212],[134,243],[114,224],[102,254],[82,231],[62,257],[67,227],[34,244],[43,213],[16,215],[36,191],[13,175],[48,166],[24,130],[58,136]];
const comicBurst=[[21,165],[63,161],[43,137],[78,144],[69,111],[92,132],[100,93],[117,120],[146,79],[139,125],[174,105],[157,141],[190,139],[166,161],[190,174],[160,179],[184,204],[147,198],[152,224],[123,206],[106,232],[94,207],[66,224],[74,200],[39,211],[54,186],[18,188],[43,176]];
const comicBanner=[[13,188],[34,181],[30,170],[55,179],[71,171],[79,179],[95,171],[106,180],[123,173],[135,180],[153,174],[157,182],[180,175],[176,189],[197,188],[181,202],[192,211],[170,213],[177,227],[151,221],[141,229],[124,221],[110,229],[95,222],[76,228],[67,220],[45,227],[44,217],[18,224],[27,210],[7,213],[22,201],[9,198]];
function comic(){
  let rays='';const r=rng(898);for(let i=0;i<34;i++){const a=r()*Math.PI*2,d=59+r()*30,l=5+r()*23,x=113+Math.cos(a)*d,y=144+Math.sin(a)*d;rays+=line(x,y,x+Math.cos(a)*l,y+Math.sin(a)*l,'#09120d',.6+r()*1.3)}
  const jersey=[[121,89],[113,86],[105,92],[98,89],[91,96],[79,96],[70,101],[67,112],[59,117],[55,128],[47,134],[42,147],[43,154],[48,156],[53,151],[58,154],[64,147],[65,138],[72,136],[77,124],[79,139],[89,150],[92,168],[101,174],[115,168],[125,175],[139,164],[142,150],[149,143],[155,147],[161,144],[167,149],[175,143],[184,145],[189,139],[186,133],[178,128],[170,120],[160,113],[153,102],[144,95],[137,97],[130,98]];
  const folds=[[72,111,66,128],[67,128,60,132],[77,122,82,136],[83,136,90,142],[90,142,97,132],[101,147,99,158],[111,129,115,138],[147,106,154,116],[154,116,162,121],[148,127,142,134],[142,134,146,141],[146,141,153,139],[163,130,174,136],[100,168,116,163],[105,96,97,98],[97,98,92,105],[91,105,84,104],[122,91,127,104],[127,104,134,107],[131,106,141,97]];
  return `<div class="aa-art aa-comic">${poly('aa-c-outline',comicOutline,'#070e0b')}${poly('aa-c-shell',comicOutline,'#e5272a','transform:scale(.978,.98);transform-origin:50% 50%')}${poly('aa-c-blackburst',comicBlue,'#070e0b','transform:scale(1.07);transform-origin:54% 45%')}${poly('aa-c-blue',comicBlue,'#087caf')}${el('aa-c-dots')}${poly('aa-c-yellowoutline',comicBurst,'#07130d','transform:scale(1.045);transform-origin:54% 45%')}${poly('aa-c-yellow',comicBurst,'#f1c91a')}${rays}${poly('aa-c-statground',[[14,229],[45,221],[81,229],[126,222],[184,229],[187,282],[103,309],[11,282]],'linear-gradient(12deg,#dc2423,#ef2c2d)')}${el('aa-c-runner','',poly('aa-c-jersey',jersey,'#07110b')+el('aa-c-neck')+el('aa-c-head'))}${folds.map(p=>line(...p,'#edcb27',1.1)).join('')}${el('aa-c-collar')}${el('aa-c-face-line')}${el('aa-c-temple')}${line(121,65,124,67,'#f4ca27',1.3)}${poly('aa-c-banneredge',comicBanner,'#09110e')}${poly('aa-c-banner',comicBanner,'#f2dda1','transform:scale(.93,.86);transform-origin:50% 63%')}${poly('aa-c-scoreborder',[[16,14],[82,23],[80,93],[23,111],[16,73]],'#09130e')}${poly('aa-c-scorepaper',[[20,19],[78,26],[76,89],[26,105],[20,71]],'linear-gradient(110deg,#f8e6b5,#e7cc95)')}${scuffs(894,30,[9,14,181,278],'#17201399')}${grain(895,1150,'#111c1266',[10,11,179,282])}${grain(896,400,'#fce39a88',[14,17,170,274])}${poly('aa-c-shard',[[14,282],[43,283],[35,288],[60,298],[28,289]],'#087eaa')}${line(24,287,61,297,'#06130c',2)}${line(151,293,180,281,'#06130c',2)}${line(20,274,36,251,'#06130c',1)}${line(170,260,181,278,'#06130c',1.4)}</div>`;
}
const forestPerimeter=[[21,66],[23,50],[35,39],[51,32],[68,27],[85,20],[102,12],[121,24],[138,29],[155,35],[170,42],[179,57],[183,75],[185,94],[187,115],[186,137],[189,158],[188,180],[188,201],[189,223],[188,245],[184,266],[177,286],[164,299],[145,307],[125,312],[103,315],[83,311],[62,305],[45,298],[31,286],[23,267],[18,246],[18,225],[19,204],[18,182],[20,161],[18,138],[19,116],[18,95]];
function forest(){
  const r=rng(874);let stones='',leaves='',vines='',veins='',portraitVeins='';
  forestPerimeter.forEach(([x,y],i)=>{
    const next=forestPerimeter[(i+1)%forestPerimeter.length];
    for(let j=0;j<3;j++){
      const t=j*.33,w=8+r()*14,h=11+r()*17,angle=r()*130-65;
      const rockPoly=[[r()*15,18+r()*14],[25+r()*18,0],[61+r()*20,r()*10],[100,24+r()*23],[81+r()*14,60+r()*9],[88+r()*12,84],[46+r()*20,100],[9+r()*20,85+r()*12],[0,42+r()*24]];
      stones+=el('aa-f-stone',`left:${n(x+(next[0]-x)*t-w/2+r()*8-4)}px;top:${n(y+(next[1]-y)*t-h/2+r()*6-3)}px;width:${n(w)}px;height:${n(h)}px;transform:rotate(${n(angle)}deg);--rock:${['#69705c','#a6a68e','#4a5541','#bab69d','#7d8270','#424f3f'][(i+j)%6]};--rock-light:${['#c8c6af','#87937b','#e0d9be'][(i+j)%3]};--fissure:${n(r()*130+10)}deg;clip-path:polygon(${rockPoly.map(([px,py])=>`${n(px)}% ${n(py)}%`).join(',')});`);
    }
  });
  for(let j=0;j<5;j++){
    const pts=forestPerimeter.flatMap(([x,y],i)=>{const next=forestPerimeter[(i+1)%forestPerimeter.length];return [[x+Math.sin(i*2.8+j)*5,y+Math.cos(i*1.2+j)*3],[(x+next[0])/2+Math.sin(i+j)*6,(y+next[1])/2+Math.cos(i+j)*4]]});pts.push(pts[0]);
    vines+=ribbon('aa-f-vineband',pts,j<2?2.2:.65,['#202c10','#43501b','#839329','#5f7525','#a7ad41'][j],`opacity:${j<2?1:.72}`);
  }
  for(let i=0;i<88;i++){
    const p=forestPerimeter[Math.floor(r()*forestPerimeter.length)],x=p[0]+r()*16-8,y=p[1]+r()*17-8;
    leaves+=el('aa-f-leaf',`left:${n(x)}px;top:${n(y)}px;width:${n(1.8+r()*2.8)}px;height:${n(4+r()*7)}px;transform:rotate(${n(r()*360)}deg);background:${['#7b8c17','#445a0d','#adab34','#5a7111','#839b24'][i%5]}`);
  }
  // A few continuous tendrils carry the glow; keep 37 background ribbons total.
  const tendrils=[
    [[27,204],[35,183],[48,168],[61,160],[70,141],[75,121],[70,107],[73,87],[83,72],[97,61],[106,44],[112,33]],
    [[174,205],[163,183],[165,166],[155,151],[147,136],[149,120],[158,105],[161,86],[150,74],[143,56]],
    [[33,116],[45,119],[56,111],[64,93],[66,76],[78,64],[96,57],[118,54],[144,63]]
  ];
  tendrils.forEach(pts=>veins+=ribbon('aa-f-energy',pts,.85,'linear-gradient(145deg,#829e3b99,#32dd8cbb 55%,#40b99a77)'));
  for(let i=0;i<34;i++){
    let x=30+r()*140,y=37+r()*149;const pts=[[x,y]];
    for(let j=0;j<5;j++){x+=r()*19-9;y+=r()*13-3;pts.push([x,y]);}
    veins+=ribbon('aa-f-energy',pts,.3+r()*.5,i%5?'#26bd6c99':'#c1ca6999');
  }
  const contours=[[[84,107],[85,95],[94,83],[105,79],[117,83],[128,94],[133,110]],[[82,106],[82,124],[88,138],[99,151],[109,155],[121,146],[130,131],[133,113]],[[94,149],[94,163],[87,170],[68,176],[59,186],[53,199]],[[123,148],[123,163],[134,173],[151,177],[162,190],[169,207]],[[94,163],[103,173],[111,179],[124,166]],[[65,181],[83,185],[97,192],[102,209]],[[133,179],[126,188],[119,202]],[[90,109],[98,106],[105,111],[113,106],[125,110]],[[105,112],[102,126],[107,130]],[[99,140],[110,142],[116,138]]];
  contours.forEach((pts,i)=>portraitVeins+=ribbon('aa-f-energy',pts,i<6?.75:.45,i%3?'#54d9a4c9':'#a7cd85b8'));
  for(let i=0;i<41;i++){
    let y=80+r()*128,x=y<150?83+r()*47:56+r()*110;const pts=[[x,y]];
    for(let j=0;j<4;j++){x+=r()*13-6;y+=3+r()*9;pts.push([x,y]);}
    portraitVeins+=ribbon('aa-f-energy',pts,.25+r()*.45,['#5adc9db3','#89bc7299','#2bd596b0','#92cb9488'][i%4]);
  }
  const torso=[[48,209],[57,189],[66,177],[83,171],[94,161],[94,149],[124,151],[124,163],[133,171],[151,177],[163,190],[173,210]];
  return `<div class="aa-art aa-forest">${el('aa-f-interior','',el('aa-f-aura')+el('aa-f-background-veins','',veins)+el('aa-f-person','',poly('aa-f-body',torso,'linear-gradient(115deg,#073423aa,#020e0ded,#123323dd)')+el('aa-f-neck')+el('aa-f-head')+el('aa-f-personveins','',portraitVeins+grain(873,180,'#78b69577',[55,82,112,126])))+grain(871,190,'#3dce785c',[23,30,154,186])+grain(876,190,'#aaba5255',[25,34,150,175])+el('aa-f-bottom'))}${stones}${vines}${leaves}${el('aa-f-crown','',el('aa-f-crownfacet'))}${el('aa-f-title','',el('aa-f-title-inner')+grain(875,150,'#232c2566',[1,1,151,22]))}${el('aa-f-moss','',grain(879,190,'#899c2966',[13,26,172,280]))}</div>`;
}
function cathedral(){
  const r=rng(919),colors=['#154e9c','#117398','#305ab2','#8d217d','#b62c63','#c39b2f','#168a91','#203877','#28266c','#683698','#a68329','#126c75','#205cb5'];
  let panes='',rose='',tracery='',figurePanes='';
  // Original leaded glass mesh: adjoining irregular native CSS triangles.
  const rows=[];
  for(let y=9;y<=321;y+=26){const row=[];for(let x=7;x<=199;x+=24)row.push([x+r()*12-6,y+r()*13-6]);rows.push(row);}
  for(let y=0;y<rows.length-1;y++)for(let x=0;x<rows[y].length-1;x++){
    const a=rows[y][x],b=rows[y][x+1],c=rows[y+1][x],d=rows[y+1][x+1];
    for(const tri of [[a,b,c],[b,c,d]]){
      const cx=tri.reduce((s,p)=>s+p[0],0)/3,cy=tri.reduce((s,p)=>s+p[1],0)/3;
      const pts=tri.map(([px,py])=>[px+(cx-px)*.055,py+(cy-py)*.055]);
      const color=colors[Math.floor(r()*colors.length)];
      panes+=poly('aa-s-glasspiece',pts,`linear-gradient(${n(r()*150)}deg,#f1d89428,transparent 45%),${color}`);
    }
  }
  for(let i=0;i<8;i++)rose+=el('aa-s-rosepetal',`transform:rotate(${i*45}deg);--petal:${i%2?'#d6aa25':'#247fa6'}`);
  for(let i=0;i<20;i++){
    const x=43+r()*113,y=105+r()*114;
    figurePanes+=el('aa-s-figurepane',`left:${n(x)}px;top:${n(y)}px;width:${n(9+r()*19)}px;height:${n(10+r()*23)}px;background:${['#235384','#185b69','#24518a','#216963','#2b3b72','#682b6c'][i%6]};transform:rotate(${n(r()*45)}deg)`);
  }
  tracery=el('aa-s-arch','left:20px;top:44px;width:50px;height:252px')+el('aa-s-arch','left:130px;top:44px;width:51px;height:253px');
  const torso=[[41,223],[43,194],[51,175],[65,163],[81,155],[87,144],[111,146],[115,155],[137,165],[151,180],[157,204],[161,225]];
  return `<div class="aa-art aa-cathedral">${el('aa-s-outer')}${el('aa-s-inset')}${el('aa-s-window','',panes+el('aa-s-glass-shade')+tracery+el('aa-s-rose','',rose+el('aa-s-roseheart'))+el('aa-s-person','',poly('aa-s-torso',torso,'#12394d')+el('aa-s-head')+el('aa-s-personmosaic','',figurePanes)+el('aa-s-collar')+el('aa-s-shirtline'))+el('aa-s-foot')+grain(912,500,'#e8bf6380',[16,20,168,282]))}${el('aa-s-side aa-s-side-left')}${el('aa-s-side aa-s-side-right')}${el('aa-s-bottomline')}${el('aa-s-crown','',el('aa-s-jewel'))}${el('aa-s-sun')}${el('aa-s-ribbonleft')}${el('aa-s-ribbonright')}${el('aa-s-nameplate','',el('aa-s-nameplateinner')+grain(914,80,'#68501a77',[3,2,138,15]))}</div>`;
}
export const artisticCssThemes = {blueprint:{art:blueprint()},comic:{art:comic()},forest:{art:forest()},cathedral:{art:cathedral()}};
