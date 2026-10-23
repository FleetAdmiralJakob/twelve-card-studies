// Ordinary CSS primitives only: overlapping rounded boxes, borders and gradients.
// The masses connect at joints; details describe a silhouette, not mechanical parts.
const piece=(x,y,w,h,bg,radius='0',angle=0,extra='')=>`<i class="eb-natural" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg};border-radius:${radius};transform:rotate(${angle}deg);${extra}"></i>`;
const tone={frost:['#020d17','#193c53','#79aec9','#d3f4ff'],blaze:['#100304','#2c0808','#a02d1c','#ff9b5d'],volt:['#030712','#0c1d30','#185b7a','#46c9ef'],silvah:['#020c05','#102c13','#4c6e24','#c5e26b']};
export function naturalFigure(t){
 const [ink,shade,mid,hi]=tone[t],bent=t==='frost'||t==='silvah',frost=t==='frost',profile=t==='blaze';
 const cloth=`linear-gradient(132deg,${frost?'#aecfdd':mid},${shade} 17%,${ink} 52%,${shade} 91%,${mid})`;
 const skin=`linear-gradient(104deg,${mid},${ink} 13% 85%,${shade})`;
 const s=[];
 // Connected arm and shoulder volumes. Only the lit edge is separated visually.
 s.push(piece(profile?58:bent?61:53,174,25,69,skin,'40% 37% 35% 45%',bent?33:profile?31:43));
 s.push(piece(t==='volt'?238:229,173,24,73,skin,'37% 48% 43% 38%',t==='volt'?-40:-24));
 s.push(piece(159,107,32,42,skin,'24% 24% 37% 44%',profile?11:0));
 s.push(piece(108,135,118,121,cloth,'33% 38% 12% 19% / 20% 27% 45% 47%',profile?4:frost?-4:0));
 s.push(piece(profile?87:85,132,75,41,cloth,'68% 64% 12% 24% / 74% 64% 24% 19%',-24));
 s.push(piece(191,143,54,36,cloth,'43% 71% 16% 8% / 46% 72% 28% 14%',31));
 s.push(piece(profile?73:76,151,36,41,cloth,'45% 30% 16% 12%',31));
 s.push(piece(218,161,28,36,cloth,'31% 45% 16% 20%',-28));
 // Chest illumination is local and soft; the interior stays a single dark jersey.
 if(frost)s.push(piece(111,139,88,42,'radial-gradient(ellipse at 7% 5%,#c7e6ef8c,#42738f50 38%,transparent 73%)','40% 60% 30% 10%',8));
 else s.push(piece(111,137,82,35,`radial-gradient(ellipse at 7% 2%,${mid}70,transparent 70%)`,'40% 60% 30% 10%',12));
 s.push(piece(90,140,50,22,'transparent','83% 30% 0 0',-28,`border-top:${frost?1.4:.85}px solid ${hi};opacity:.85`));
 s.push(piece(96,145,41,20,'transparent','80% 35% 0 0',-31,`border-top:.65px solid ${mid};opacity:.8`));
 s.push(piece(207,150,34,19,'transparent','25% 80% 0 0',40,`border-top:.7px solid ${hi};opacity:.75`));
 s.push(piece(76,173,27,5,shade,'12% 18% 48% 35%',31,`border-bottom:.65px solid ${mid}`));
 s.push(piece(230,184,19,3,shade,'10% 10% 40% 40%',-26,`border-bottom:.6px solid ${mid}`));
 // Unequal folds: tapered border radii and short directional glints, not ribs.
 const folds=profile?[[116,140,43,5,11],[109,153,26,4,-10],[139,164,31,5,13],[180,157,26,4,-16],[150,188,25,4,-17],[203,180,13,8,32]]:t==='volt'?[[110,147,33,4,12],[193,152,23,4,21],[119,173,19,5,-35],[190,194,22,4,-28]]:t==='silvah'?[[116,137,37,4,16],[108,151,22,4,-22],[185,148,24,4,-11],[179,185,25,4,-31],[146,191,18,5,-42],[199,213,23,4,-45]]:
 [[117,137,34,4,12],[110,148,27,4,-8],[132,155,20,5,18],[174,152,26,4,-13],[119,173,24,4,15],[188,174,18,4,-13],[135,193,19,4,-16]];
 folds.forEach(([x,y,w,h,a],i)=>s.push(piece(x,y,w,h,`linear-gradient(180deg,${mid}${frost?'55':'26'},transparent 75%)`,`${i%2?'24% 78%':'70% 23%'} 0 0`,a,`border-top:${i===0?1:.6}px solid ${hi}${frost?(i<5?'aa':'66'):(i<4?'85':'43')}`)));
 // A shallow collar rests against the neck; no separate raised ring.
 s.push(piece(151,127,31,7,shade,'15% 20% 60% 30%',32,`border-top:1px solid ${hi};opacity:.8`));
 s.push(piece(174,130,24,6,shade,'10% 20% 30% 70%',-32,`border-bottom:.65px solid ${mid}`));
 if(bent){
  s.push(piece(50,207,38,21,skin,'44% 32% 46% 40%',18));
  s.push(piece(66,208,80,18,skin,'35% 20% 40% 46%',-16,`border-bottom:.7px solid ${mid}`));
  s.push(piece(137,197,28,13,skin,'40% 55% 30% 40%',-17));
  s.push(piece(146,198,23,4,ink,'30% 50%',12,`border-top:.5px solid ${mid}`));
  s.push(piece(147,202,21,3,ink,'30% 50%',5,`border-top:.4px solid ${mid}`));
  if(frost)s.push(piece(59,211,75,7,'linear-gradient(180deg,#b9e9fb88,#2b638255,transparent)','50% 30% 60% 40%',-13));
 }
 // Face is intentionally almost black; silhouette, ear hint and narrow jaw light
 // carry the human anatomy without a lit block nose or robotic inset eyes.
 const hx=profile?155:frost?143:149,hy=profile?53:t==='volt'?59:t==='silvah'?55:52,rot=profile?12:t==='volt'?15:t==='silvah'?17:-7;
 const head=[];
 head.push(piece(0,0,53,74,`linear-gradient(103deg,${mid},${ink} 7% 88%,${shade})`,'40% 47% 42% 46% / 34% 35% 62% 61%',0));
 head.push(piece(-3,31,7,17,skin,'42% 50% 40% 53%',-10));
 if(profile){
  head.push(piece(45,26,8,19,ink,'25% 40% 0 50%',-9));
  head.push(piece(49,34,11,9,ink,'9% 80% 42% 15%',-30,`border-right:.6px solid ${mid}`));
  head.push(piece(47,46,7,4,ink,'10% 60% 40% 25%',0));
  head.push(piece(40,51,12,13,ink,'20% 30% 60% 50%',12,`border-right:.45px solid ${mid}`));
  head.push(piece(36,28,11,3,ink,'70% 30%',9));
 }else{
  head.push(piece(13,31,12,2,ink,'70% 30%',12));
  head.push(piece(34,31,10,2,ink,'30% 70%',-9));
  head.push(piece(24,34,5,17,`linear-gradient(90deg,transparent,${shade}88)`,'35% 40% 20% 30%',9));
  head.push(piece(19,58,16,2,shade,'50%',-4,'opacity:.35'));
 }
 head.push(piece(7,50,15,19,'transparent','0 0 20% 80%',-32,`border-left:.5px solid ${mid};opacity:.4`));
 head.push(piece(-1,-4,55,26,`linear-gradient(156deg,${mid},${ink} 15% 100%)`,'47% 55% 20% 23%',-3));
 // A varied short-cropped hair contour; ten small dark tufts, no outlined curls.
 [[-1,5,8,12,-21],[4,-1,11,12,-18],[13,-4,10,12,-13],[23,-5,10,13,3],[33,-3,10,12,16],[42,0,9,12,23],[48,7,8,12,26]].forEach(([x,y,w,h,a],i)=>head.push(piece(x,y,w,h,ink,'55% 35% 12% 9%',a,`border-top:.6px solid ${i%2?mid:hi};opacity:1`)));
 head.push(piece(4,-1,40,18,'transparent','74% 43% 0 0',-5,`border-top:.7px solid ${hi};opacity:.62`));
 const bodyTransform=t==='volt'?'translateY(5px)':frost?'rotate(-4deg)':t==='silvah'?'rotate(3deg)':'none';
 const body=`<div style="position:absolute;inset:0;transform:${bodyTransform};transform-origin:150px 210px">${s.join('')}</div>`;
 return `<div class="eb-player eb-natural-player">${body}<div class="eb-natural-head" style="position:absolute;left:${hx}px;top:${hy}px;width:56px;height:80px;transform:rotate(${rot}deg)">${head.join('')}</div></div>`;
}

export const naturalStyles=`
.r2-energy.r2-energy-basic .eb-natural{position:absolute;display:block;box-sizing:border-box;margin:0;padding:0}
.r2-energy.r2-energy-basic .eb-natural-player{position:absolute;inset:0;z-index:5}
`;
