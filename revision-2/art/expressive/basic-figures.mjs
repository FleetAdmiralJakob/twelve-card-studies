// Basic edition: ordinary rounded boxes, borders and transformed quadrilaterals.
// The overlapping masses are kept dark so joints read as anatomy, not armor.
const n=v=>+v.toFixed(2);
const box=(name,x,y,w,h,fill,radius='0',extra='')=>`<i class="eb-native-${name}" style="left:${n(x)}px;top:${n(y)}px;width:${n(w)}px;height:${n(h)}px;background:${fill};border-radius:${radius};${extra}"></i>`;
const line=(x,y,w,a,c,h=.8,extra='')=>box('seam',x,y,w,h,c,'60%',`transform:rotate(${a}deg);transform-origin:0 50%;${extra}`);
const arc=(x,y,w,h,a,c,width=1,extra='')=>box('fold',x,y,w,h,'transparent','50%',`border-top:${width}px solid ${c};transform:rotate(${a}deg);${extra}`);
function hair(cx,cy,violet=false){
  let h=box('hair',cx-28,cy-24,56,50,violet?'#0b0912':'#080d1b','46% 51% 39% 42% / 42% 47% 51% 50%',`transform:rotate(-7deg);border-top:.8px solid ${violet?'#b68ac7':'#5fb7d6'};`);
  for(const [x,y,w,hh,a] of [[-28,-12,10,19,-18],[-24,-22,15,13,-20],[-15,-27,14,11,-9],[-4,-28,12,12,17],[7,-26,14,12,-13],[18,-20,12,14,17],[24,-9,8,19,16]])h+=box('curl',cx+x,cy+y,w,hh,violet?'#0b0912':'#080d1b','44% 55% 47% 38%',`transform:rotate(${a}deg);border-top:.65px solid ${violet?'#96749f':'#43879b'};`);
  // Sparse curved hair texture. Avoid bright ringed locks or separate ears.
  for(const [x,y,w,a] of [[-20,-13,10,-38],[-12,-20,11,23],[-2,-20,12,-17],[11,-14,10,29],[-15,-3,10,-24],[3,-9,10,26],[15,-1,6,42]])h+=arc(cx+x,cy+y,w,4,a,violet?'#58435e':'#254658',.65);
  return h;
}
function back(theme){const royal=theme==='majestic',cx=royal?137:156,cy=royal?69:62,rim=royal?'#bc8ddb':'#53d7ee',soft=royal?'#85519f':'#914fb3';let h='';
  const cloth=royal?'linear-gradient(105deg,#33203e,#0c0915 22% 73%,#22102e)':'linear-gradient(106deg,#243247,#090b1d 19% 78%,#19102b)';
  if(royal){
    h+=box('arm',65,176,25,66,'linear-gradient(100deg,#3e2354,#0c0a17 32% 85%,#2a1638)','42% 37% 26% 25%','transform:rotate(23deg);border-left:.7px solid #9471a8;');
    h+=box('arm',222,183,26,61,'linear-gradient(95deg,#100b1c,#1a0d26 75%,#563563)','43% 42% 30% 25%','transform:rotate(-34deg);border-right:.7px solid #9f71bb;');
    h+=box('torso',91,138,121,114,cloth,'30% 38% 13% 14% / 23% 29% 11% 9%','transform:rotate(-6deg);');
    h+=box('shoulder',68,148,66,49,cloth,'60% 22% 12% 8% / 53% 22% 10% 9%','transform:rotate(-28deg);');
    h+=box('shoulder',171,145,59,53,cloth,'35% 63% 9% 11% / 29% 65% 8% 8%','transform:rotate(-17deg);');
    h+=arc(66,150,72,31,-27,rim,.95)+arc(159,143,70,35,25,rim,.95);
    h+=arc(82,167,30,49,-5,soft,.65)+arc(190,151,27,44,11,soft,.65);
    h+=box('fold',91,170,7,55,'linear-gradient(90deg,#88629455,transparent)','70% 25% 30% 50%','transform:rotate(9deg);');
    h+=box('fold',181,160,6,59,'linear-gradient(90deg,#ab78b344,transparent)','70% 22% 50% 50%','transform:rotate(-9deg);');
    h+=arc(106,155,26,49,-16,'#6b458879',.7)+arc(168,178,16,41,-17,'#825e8b69',.7);
    h+=line(69,186,23,25,'#b184cc99',1)+line(215,195,21,-9,'#b184cc99',1);
  }else{
    h+=box('left-upper-arm',72,176,29,40,'linear-gradient(105deg,#123143,#070e1d 60%,#27526a)','30% 30% 46% 26%','transform:rotate(48deg);');
    h+=box('forearm',26,199,67,17,'linear-gradient(180deg,#174c63,#070d1c 51%,#173248)','37% 23% 44% 30%','transform:rotate(-16deg);border-bottom:.7px solid #57cbe8;');
    h+=box('right-upper-arm',243,172,28,40,'linear-gradient(95deg,#081322,#17334a)','29% 43% 44% 39%','transform:rotate(-18deg);border-right:.7px solid #61c0d4;');
    h+=box('right-forearm',243,201,22,47,'linear-gradient(95deg,#0b1021,#101828 73%,#245064)','31% 28% 39% 28%','transform:rotate(19deg);');
    h+=box('torso',108,129,113,125,cloth,'31% 29% 10% 13% / 22% 22% 12% 11%','transform:rotate(3deg) skewX(-5deg);');
    h+=box('shoulder',84,143,68,49,cloth,'59% 33% 11% 18% / 50% 26% 10% 15%','transform:rotate(-30deg);');
    h+=box('shoulder',190,135,64,45,cloth,'29% 62% 9% 8% / 25% 70% 9% 8%','transform:rotate(25deg);');
    h+=arc(84,143,65,32,-29,rim,.9)+arc(173,133,77,35,24,rim,.9);
    h+=box('fold',114,172,7,69,'linear-gradient(90deg,#7b469252,transparent)','50% 30% 70% 20%','transform:rotate(-3deg);');
    h+=box('fold',202,158,8,72,'linear-gradient(90deg,#9a58a04f,transparent)','70% 40% 30% 30%','transform:rotate(-8deg);');
    h+=arc(125,149,17,48,25,soft,.75)+arc(146,148,14,42,26,'#954cb8',.65)+arc(161,141,15,46,27,'#7c3e9b',.8);
    h+=line(87,185,21,21,'#68d3e7',1)+line(232,180,23,-17,'#5ab6db',1);
    for(const [x,y,w,a] of [[113,167,115,-14],[110,196,105,-8],[108,209,106,-5],[109,222,102,-7]])h+=line(x,y,w,a,'#bd4cc066',.65);
    h+=line(24,212,238,-12.8,'#36daed',5)+line(82,200,174,-12.8,'#aaf8fb',1)+line(26,223,144,-14,'#c64fbf',.7);
  }
  const nx=royal?123:143,ny=royal?111:111;
  h+=box('neck',nx,ny,royal?30:28,31,royal?'linear-gradient(90deg,#1f1329,#080910 55%,#301b3b)':'linear-gradient(90deg,#202037,#090b1b 50%,#271a37)','20% 24% 17% 19%','transform:rotate(-6deg);');
  h+=box('head',cx-24,cy-7,48,royal?65:71,royal?'#090910':'#080b19','42% 41% 42% 38% / 34% 34% 62% 57%','transform:rotate(-6deg);');
  h+=hair(cx,cy,royal);
  h+=arc(royal?111:131,royal?132:127,royal?48:49,13,-9,royal?'#b894cc':'#aaa4e2',1.3,'border-top:0;border-bottom:1.3px solid currentColor;color:'+ (royal?'#b894cc':'#aaa4e2')+';');
  if(royal)for(const [x,y,s] of [[111,191,6],[153,190,8],[135,218,5]]){h+=line(x-s/2,y,s,0,'#d4a1f1',1.4)+line(x,y-s/2,s,90,'#d4a1f1',1.4);}
  return h;
}
function drift(){let h='';const cloth='linear-gradient(106deg,#484e4d,#11171a 18% 75%,#343a3a)';
  h+=box('arm',86,169,37,78,cloth,'38% 32% 20% 15%','transform:rotate(31deg);');
  h+=box('body',109,142,125,111,cloth,'30% 36% 10% 12% / 18% 26% 8% 9%','transform:rotate(-5deg);');
  h+=box('shoulder',100,150,56,52,cloth,'60% 36% 10% 10% / 59% 30% 9% 10%','transform:rotate(-26deg);');
  h+=box('sleeve',204,145,54,67,cloth,'25% 66% 14% 11% / 20% 64% 8% 7%','transform:rotate(-33deg);');
  h+=arc(97,155,51,41,-34,'#d5dbce',1)+arc(195,147,70,33,28,'#d9dbce',1);
  for(const [x,y,w,hh,a] of [[106,170,10,55,21],[128,162,6,44,8],[203,160,7,56,-12],[236,169,6,28,-35]])h+=box('fold',x,y,w,hh,'linear-gradient(90deg,#bdc5b755,#8c969533,transparent)','65% 40% 50% 20%',`transform:rotate(${a}deg);`);
  h+=arc(111,206,47,15,-11,'#78857b',.8)+arc(176,211,44,18,3,'#67766c',.8);
  // Hood outer cloth shares the torso palette; the dark opening supplies depth.
  h+=box('hood',125,51,80,105,'linear-gradient(111deg,#c4c7bb,#646c65 8%,#242d2c 20%,#141b1d 63%,#767c71 91%,#252c2c)','44% 39% 45% 41% / 52% 43% 41% 40%','transform:rotate(11deg);border-left:1px solid #e1e6d8;');
  h+=box('hood-crown',142,51,43,38,'linear-gradient(145deg,#899084,#28302d 40%,#111719)','19% 57% 18% 13%','transform:rotate(26deg) skewY(4deg);');
  h+=box('opening',136,82,61,64,'#030709','45% 38% 52% 37% / 39% 38% 56% 42%','transform:rotate(23deg);border-left:1.5px solid #9ba899;border-bottom:1px solid #657461;');
  h+=arc(134,78,60,29,17,'#c8d1c2',1.1)+arc(139,67,42,18,16,'#9ca893',.8)+arc(143,60,32,14,24,'#cdd7c7',.7);
  h+=arc(126,124,68,27,15,'#8f9a89',1,'border-top:0;border-bottom:1px solid #8f9a89;');
  // Broken fabric lights concentrate on the outer left hood and the raised
  // right shoulder, leaving the opening and most of the cloth almost black.
  h+=box('hood-fold-light',131,79,6,43,'linear-gradient(90deg,#e5e6d5,#899384 38%,transparent)','70% 20% 65% 20%','transform:rotate(21deg);');
  h+=box('hood-fold-light',142,58,5,29,'linear-gradient(90deg,#f2f1de,#9da78c 35%,transparent)','70% 20% 65% 20%','transform:rotate(32deg);');
  h+=box('hood-peak-fold',146,61,27,3,'linear-gradient(90deg,#f3f2de,#a3b09b 62%,transparent)','70% 12% 65% 20%','transform:rotate(19deg);');
  h+=line(139,79,17,-17,'#d7dfcd',1.1)+line(136,88,13,-24,'#b8c5b3',.9);
  h+=box('shoulder-fold-light',228,155,5,31,'linear-gradient(90deg,#e6e8d7aa,#8e9c9277,transparent)','60% 20% 70% 20%','transform:rotate(-34deg);');
  h+=line(220,150,20,24,'#d7dfcb',1.2)+line(237,167,19,48,'#e7e4d6',1.05);
  h+=box('string',141,149,4,52,'transparent','50%','border-left:1.15px solid #d6dbcc;transform:rotate(4deg);');
  h+=box('string',181,148,5,43,'transparent','50%','border-right:1.15px solid #b8c5b7;transform:rotate(4deg);');
  h+=line(137,199,7,100,'#dce4d1',2)+line(184,189,7,83,'#dce4d1',2);
  for(const [x,y,w,a] of [[141,218,22,-67],[149,199,16,83],[150,213,19,-40],[170,218,29,-59],[178,204,19,99],[182,215,25,-49],[192,201,19,101],[135,216,31,-17]])h+=line(x,y,w,a,'#d8ded2',1.9);
  return h;
}
function prism(){let h='';
  h+=box('arm',93,169,28,78,'linear-gradient(110deg,#20546a,#091224 45% 85%,#14273d)','40% 36% 25% 20%','transform:rotate(24deg);');
  h+=box('body',118,140,110,115,'linear-gradient(110deg,#19384b,#091021 30% 76%,#21152d)','30% 34% 9% 9% / 20% 25% 8% 8%','transform:rotate(-6deg);');
  h+=box('sleeve',104,146,55,49,'#101f30','49% 31% 9% 10% / 49% 24% 10% 8%','transform:rotate(-27deg);');
  h+=box('sleeve',202,152,43,52,'#15162c','27% 60% 10% 10% / 25% 55% 9% 8%','transform:rotate(-28deg);');
  // A small set of actual skewed quadrilateral planes; no curved face tiles.
  for(const [x,y,w,hh,a,s,c] of [[118,149,26,30,22,-23,'#285b70'],[149,145,27,24,-12,22,'#102034'],[179,149,31,20,17,-19,'#343050'],[115,181,21,35,21,-17,'#113e53'],[140,177,31,28,-13,21,'#0b1629'],[174,175,29,30,17,-26,'#243747'],[204,175,21,23,-21,16,'#583758'],[133,209,25,29,15,-19,'#132b40'],[168,213,27,30,-11,18,'#20203a'],[198,209,26,34,13,-16,'#151c30']])h+=box('facet',x,y,w,hh,c,'0',`transform:rotate(${a}deg) skewY(${s}deg);border-left:.5px solid #87c6d24d;`);
  h+=line(115,161,34,-30,'#8bdbe7',1)+line(190,163,31,-8,'#b1a3e9',1)+line(217,184,22,35,'#c478bd',1);
  h+=box('neck',163,110,27,33,'linear-gradient(95deg,#263e51,#0a1121 48% 75%,#31273f)','13% 20% 20% 20%','transform:rotate(-15deg);');
  // The connected facial profile is formed by a skull, brow and jaw mass with
  // almost identical dark fills. Only the external contour is picked out.
  h+=box('head',157,49,54,66,'#0b1020','43% 42% 23% 42% / 38% 32% 23% 50%','transform:rotate(-7deg);border-left:.7px solid #88bbcc;');
  h+=box('face',185,71,29,48,'#0b1020','16% 22% 20% 36% / 15% 14% 30% 47%','transform:rotate(-8deg);');
  h+=box('nose',209,87,10,18,'#11172a','10% 34% 26% 0','transform:rotate(-29deg);border-right:.5px solid #65718c;');
  h+=box('jaw',193,106,22,18,'#0b1020','10% 13% 44% 39%','transform:rotate(-4deg);border-bottom:.6px solid #7f7497;');
  h+=box('ear',166,85,9,17,'#142032','44%','transform:rotate(-17deg);border-left:.65px solid #6e95ae;');
  h+=arc(169,87,5,8,-20,'#6e95ae',.6);
  h+=box('hair',157,45,58,27,'linear-gradient(100deg,#1c3043,#0a1020 50%)','43% 51% 22% 35% / 54% 57% 25% 30%','transform:rotate(-7deg);border-top:.85px solid #bbdce6;');
  for(const [x,y,w,hh,a] of [[161,47,13,8,-20],[173,42,15,8,-9],[187,42,15,8,9],[200,47,13,8,17]])h+=box('lock',x,y,w,hh,'#111c2e','28% 43% 14% 14%',`transform:rotate(${a}deg);border-top:.6px solid #7e9aaf;`);
  h+=arc(155,132,43,17,10,'#a8c1db',1.2,'border-top:0;border-bottom:1.2px solid #a8c1db;');
  h+=arc(105,146,57,26,-29,'#9dd3e7',1)+arc(193,149,48,26,27,'#7f9ebc',.8);
  return h;
}
export const basicFigure=theme=>theme==='drift'?drift():theme==='prism'?prism():back(theme);
