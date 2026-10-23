/*
 * CSS illustrations, authored at a 200 × 320 coordinate size.
 * This module runs at build time. The seeds describe procedural paper grain,
 * pencil marks and metal wear; no photograph or reference pixels are sampled.
 */
const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const f = n => Number(n.toFixed(2));
const el = (name, style = '', inner = '') => `<i class="pp-${name}"${style ? ` style="${style}"` : ''}>${inner}</i>`;
const group = (name, inner, style = '') => `<div class="pp-${name}"${style ? ` style="${style}"` : ''}>${inner}</div>`;
const line = (x,y,w,a,c='#28271f',o=1,h=.8) => el('stroke',`left:${f(x)}px;top:${f(y)}px;width:${f(w)}px;height:${h}px;transform:rotate(${f(a)}deg);background:${c};opacity:${f(o)}`);
function dust(seed,count,color,bounds=[0,0,200,320],size=.6){
 const r=rng(seed), shadows=[];
 // A bounded set of flecks supplements the inexpensive tiled CSS grain.
 // Increasing an author's density request never creates an unbounded paint list.
 count=Math.min(count,160);
 for(let i=0;i<count;i++)shadows.push(`${f(bounds[0]+r()*bounds[2])}px ${f(bounds[1]+r()*bounds[3])}px 0 ${f(r()*.3)}px ${color}`);
 return el('dust',`width:${size}px;height:${size}px;box-shadow:${shadows.join(',')}`);
}
function wisps(seed,count,bounds,color,opacity=.4,angle=-38){
 const r=rng(seed); let out='';
 for(let i=0;i<count;i++)out+=line(bounds[0]+r()*bounds[2],bounds[1]+r()*bounds[3],3+r()*16,angle-14+r()*28,color,.12+r()*opacity,.25+r()*.55);
 return out;
}
function cracks(seed,count){
 const r=rng(seed);let out='';
 for(let i=0;i<count;i++){
  let x,y,a;
  if(i<count*.3){x=13+r()*21;y=25+r()*266;a=-10+r()*65;}
  else if(i<count*.6){x=158+r()*24;y=23+r()*268;a=100+r()*70;}
  else{x=29+r()*143;y=i%2?11+r()*28:270+r()*30;a=r()*180;}
  out+=el('crack',`left:${f(x)}px;top:${f(y)}px;width:${f(13+r()*22)}px;height:${f(17+r()*25)}px;transform:rotate(${f(a)}deg);opacity:${f(.22+r()*.4)}`);
 }
 return out;
}
function curledEdges(){
 const r=rng(842),out=[];
 for(let i=0;i<64;i++){
  let x,y,a;
  if(i<20){x=7+r()*5;y=28+(i/20)*251;a=-12+r()*49;}
  else if(i<40){x=184+r()*5;y=27+((i-20)/20)*252;a=-20+r()*50;}
  else if(i<52){x=21+((i-40)/12)*160;y=7+Math.abs(x-102)*.17+r()*6;a=-25+r()*65;}
  else{x=18+((i-52)/12)*166;y=284+(1-Math.abs(x-100)/90)*26+r()*5;a=-20+r()*45;}
  out.push(el('curl',`left:${f(x)}px;top:${f(y)}px;width:${f(6+r()*8)}px;height:${f(4+r()*9)}px;transform:rotate(${f(a)}deg);--curl-light:${i%3?'#c69b5f':'#e8c28a'}`));
 }
 return out.join('');
}
function manuscript(){
 let hair='';const r=rng(329);
 for(let i=0;i<12;i++)hair+=el('hair',`left:${f(87-i*.6)}px;top:${f(47+i*.52)}px;width:${f(42+i*.8)}px;height:${f(74+i*1.65)}px;transform:rotate(${f(-19+r()*9)}deg);opacity:${f(.3+r()*.5)}`);
 const outline=[
 [98,120,29,155],[72,131,24,155],[51,141,30,125],[33,167,30,116],[43,171,25,-64],[45,186,20,-84],
 [120,122,26,30],[141,135,24,31],[162,150,35,70],[176,182,22,99],
 [74,134,24,13],[96,140,25,-12],[62,139,26,109],[57,166,39,102],[145,144,26,73],[155,169,34,85],
 [98,111,13,108],[119,108,15,84],[99,128,13,25],[112,133,13,-40]
 ].map(([x,y,w,a],i)=>line(x,y,w,a,'#27271c',.84,i%3?1.1:1.6)).join('');
 return group('manuscript',hair+el('face')+el('face pp-face-echo')+outline+el('shoulder-left')+el('shoulder-right')+el('sleeve-left')+el('sleeve-right')+el('shirt-collar')+group('shirt-shading',wisps(213,43,[32,136,143,67],'#393728',.52))+wisps(92,18,[149,59,24,119],'#4c4431',.45));
}
const parchment=group('parchment',el('parchment-base')+el('parchment-face')+curledEdges()+group('parchment-surface',dust(91,1300,'#503b1c33')+el('grain')+cracks(22,27)+manuscript()+el('cannon', '',el('cannon-wheel'))+el('parchment-rule')+el('parchment-cross')));

function charcoalPortrait(kind){
 const sketch=kind==='doodle';
 const r=rng(sketch?24:687); let strokes='';
 for(let i=0;i<(sketch?98:83);i++){
  // Keep the head dense; exposed paper and longer strokes break up the torso.
  const head=i<24, y=head?55+r()*59:126+r()*77, x=head?74+r()*64:19+r()*149;
  if(sketch){
   strokes+=line(x,y,head?4+r()*12:9+r()*25,-48+r()*23,'#e4e0ce',.24+r()*.62,head?.45+r()*.7:.7+r()*1.5);
  }else{
   const light=i%4===0;
   strokes+=el('brush',`left:${f(x)}px;top:${f(y)}px;width:${f(head?5+r()*13:30+r()*62)}px;height:${f(head?.4+r()*.7:light?.7+r()*1.6:2+r()*6)}px;transform:rotate(${f(-36+r()*13)}deg);background:${light?'#d6c5a6':'#292c23'};opacity:${f(light?.22+r()*.4:.5+r()*.45)}`);
  }
 }
 return group(`charcoal pp-charcoal-${kind}`,el('charcoal-head')+el('charcoal-neck')+el('charcoal-body')+group('charcoal-hatch',strokes+dust(sketch?331:83,370,sketch?'#e4e0ce66':'#d6c5a677',[27,52,155,166],.45)))+
 (sketch?wisps(434,20,[22,163,148,31],'#262923',.7):wisps(569,24,[24,173,132,29],'#24261e',.76,-29));
}
function doodles(){
 const lines=[
 [21,22,12,-40],[29,14,10,25],[38,19,10,-40],[45,13,9,80],[49,22,11,-50],[64,17,10,62],[72,25,8,160],
 [93,29,9,-9],[102,27,9,70],[102,36,9,140],[95,40,11,-96],[88,38,12,-27],
 [161,64,23,-8],[158,75,24,-8],[163,59,23,103],[174,58,23,104],
 [179,59,18,94],[177,80,2,0],
 [34,88,17,-26],[49,81,18,119],[40,97,11,-125],[35,88,11,75],[35,102,5,110],
 [167,98,13,-35],[163,103,18,-7],[180,99,15,135],[169,110,11,15],[178,114,15,142],[167,125,13,32],
 [24,124,18,-78],[20,113,17,-22],[26,108,12,22],[27,128,13,-44],[26,127,12,-128],
 [23,171,10,-39],[28,165,10,55],[18,183,16,-32],
 [174,174,13,142],[166,186,14,21],[177,193,13,143],[164,201,10,35],
 [20,238,14,-32],[30,230,16,115],[24,242,11,-29],
 [169,270,12,140],[161,278,12,4],[172,278,12,140],[164,285,11,-12],
 [72,295,11,127],[66,303,13,-9],[76,301,9,116],[173,302,7,18],[169,308,7,1]
 ];
 return lines.map(([x,y,w,a],i)=>line(x,y,w,a,i>=27&&i<32?'#bf5349':(i>=12&&i<23)||(i>=32&&i<35)?'#35668b':'#313834',.82,i<7?.9:1.3)).join('')+
 el('crown', '',el('crown-inner')+el('crown-band'))+el('doodle-star')+el('smile','',el('smile-mouth')+el('smile-eyes'));
}
const doodle=group('doodle',el('doodle-back')+group('doodle-paper',el('grain')+dust(329,1900,'#46463825')+cracks(81,23)+doodles()+charcoalPortrait('doodle')+el('yellow-tape')+el('torn-fold')));

function bamboo(x,y,s,a){
 const leaves=[[-2,-35,27,-152],[-10,-46,25,-168],[-1,-48,26,-103],[8,-51,30,-65],[10,-51,31,-28],[5,-41,29,-5],[-1,-20,27,-151],[-9,-29,23,-177],[2,-29,24,-111]];
 return group('bamboo',el('bamboo-stem')+leaves.map(([lx,ly,w,rot])=>el('bamboo-leaf',`left:${lx}px;top:${ly}px;width:${w}px;transform:rotate(${rot}deg)`)).join(''),`left:${x}px;top:${y}px;transform:rotate(${a}deg) scale(${s})`);
}
const ink=group('ink',group('ink-paper',el('grain')+dust(162,2400,'#4f43252b')+el('paper-fold')+cracks(13,17)+el('sun-disc')+bamboo(181,119,.74,-14)+bamboo(175,56,.62,11)+bamboo(19,200,.88,34)+bamboo(27,300,.65,28)+charcoalPortrait('ink')+el('red-seal','',el('seal-mark')+el('seal-mark pp-seal-mark-two')+el('seal-mark pp-seal-mark-three'))+el('ink-rule')));

function steampunkOrnament(){
 let out='';
 for(const side of [0,1]){
  let metal='';
  for(const [i,[x,y,w,h,a]] of [[13,22,15,18,35],[27,18,18,12,-18],[47,15,16,11,-25],[13,53,11,25,-15],[12,90,10,23,12],[12,127,10,25,-15],[12,165,11,22,15],[12,206,11,24,-15],[14,246,11,24,15],[24,285,20,12,24],[48,300,22,10,18],[73,309,23,10,16]].entries())metal+=el('brass-scroll',`left:${x}px;top:${y+(side&&i%3===0?3:0)}px;width:${w}px;height:${h}px;transform:rotate(${a+(side?7:0)}deg);--scroll-glint:${(i+side)%3?'#947039':'#4b4930'}`);
  for(const [x,y,a] of [[13,43,20],[13,112,-20],[13,151,12],[14,191,-10],[14,235,20],[36,291,35],[65,308,40]])metal+=el('brass-leaf',`left:${x}px;top:${y}px;transform:rotate(${a}deg)`);
  out+=group('steam-scrolls',metal,side?'transform:scaleX(-1)':'');
 }
 return out;
}
function woodGrain(){
 const r=rng(17);let out='';
 for(let i=0;i<24;i++)out+=el('wood-fiber',`left:${f(20+r()*28)}px;top:${f(32+r()*247)}px;width:${f(68+r()*94)}px;height:${f(2+r()*3)}px;opacity:${f(.15+r()*.3)};transform:rotate(${f(-1+r()*2)}deg)`);
 for(let i=0;i<26;i++)out+=el('wood-chip',`left:${f(9+r()*150)}px;top:${f(20+r()*263)}px;width:${f(3+r()*13)}px;height:${f(1+r()*3.5)}px;opacity:${f(.15+r()*.44)};transform:rotate(${f(-7+r()*14)}deg);background:${i%3?'#211c11':'#c2944a'}`);
 return out;
}
function chain(){
 return group('chain',[[145,5,-35],[150,15,17],[153,27,-26],[161,36,45],[168,47,-32],[173,60,27],[178,71,-18]].map(([x,y,a],i)=>el(`chain-link${i%2?' pp-chain-link-edge':''}`,`left:${x}px;top:${y}px;transform:rotate(${a}deg)`)).join(''));
}
const steampunk=group('steampunk',el('steam-back')+group('wood',el('wood-planks')+woodGrain()+el('wood-knot')+el('wood-knot pp-wood-knot-two')+dust(321,2100,'#d6a96b35')+group('steam-player',el('steam-head')+el('steam-neck')+el('steam-body')+dust(194,1050,'#d99b4e77',[29,61,149,163],.65))+el('steam-banner-shadow')+el('steam-banner','',el('grain')+dust(812,300,'#4d3b2644',[0,0,169,37],.4)))+el('brass-frame')+el('brass-frame pp-brass-frame-inner')+steampunkOrnament()+[[23,43],[177,43],[23,273],[177,273],[100,19],[100,310]].map(([x,y])=>el('rivet',`left:${x}px;top:${y}px`)).join('')+el('chain-rail')+chain());

export const paperCssThemes={parchment:{art:parchment},doodle:{art:doodle},ink:{art:ink},steampunk:{art:steampunk}};
