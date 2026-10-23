// A spectral lion sculpted from ordinary rounded boxes and short fur borders.
const box=(x,y,w,h,bg,radius,angle=0,extra='')=>`<i class="eb-natural" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg};border-radius:${radius};transform:rotate(${angle}deg);${extra}"></i>`;
export function naturalLion(){
 const s=[];
 s.push(box(195,53,69,112,'linear-gradient(115deg,#072a20,#0e593a 35%,#082e20 76%)','46% 48% 58% 29%',16));
 const locks=[[192,59,18,48,40],[184,74,15,48,45],[179,94,15,46,39],[186,112,15,51,32],[201,125,14,45,23],[215,132,13,40,16],[229,130,12,39,12],[209,49,17,39,65],[229,51,13,36,72],[241,59,11,30,70]];
 for(const [x,y,w,h,a]of locks)s.push(box(x,y,w,h,'linear-gradient(100deg,#449b6e,#0c432f 12%,#05271a 70%)','87% 4% 81% 9%',a,'border-left:.6px solid #64b984'));
 s.push(box(226,56,12,17,'linear-gradient(120deg,#42865b,#092a1c 45%)','43% 55% 23% 30%',-24));
 s.push(box(230,60,6,10,'#031e14','40% 40% 20% 20%',-24));
 s.push(box(233,70,32,42,'linear-gradient(122deg,#367e56,#0b482e 50%,#062d1d)','24% 51% 33% 27%',-16));
 s.push(box(229,93,25,34,'linear-gradient(105deg,#073222,#286842 72%,#0d3d27)','17% 62% 31% 64%',-23));
 // A long upper muzzle overhangs the open mouth; the jaw has an angled underside.
 s.push(box(252,108,23,25,'#000e08','11% 17% 43% 31%',12));
 s.push(box(245,130,27,9,'linear-gradient(#092a18,#306f42)','14% 20% 48% 43%',14));
 s.push(box(251,91,14,21,'linear-gradient(130deg,#367b51,#0b3c28)','14% 37% 25% 28%',-14));
 s.push(box(260,96,25,14,'linear-gradient(155deg,#438b5b,#103e26 67%)','18% 43% 31% 22%',11));
 s.push(box(278,99,8,7,'#02160c','15% 24% 56% 17%',15));
 s.push(box(270,110,2.5,6,'#9acb89','0 0 80% 0',9));
 s.push(box(254,115,2,3.5,'#7ca46b','0 0 70% 0',-8));
 s.push(box(242,80,24,6,'linear-gradient(#48885e,#052419 35%)','14% 31% 10% 20%',22));
 s.push(box(252,88,7,1.3,'#b6df88','20%',20));
 const fur=[[195,63,24,10,-30],[189,78,28,10,-35],[183,97,28,12,-42],[191,117,24,10,-50],[204,135,21,10,-61],[219,140,18,9,-62],[210,55,21,8,-14],[228,58,19,7,13],[237,66,20,8,28],[231,104,18,7,61],[238,118,14,6,51],[261,103,15,4,9]];
 for(const [x,y,w,h,a]of fur)s.push(box(x,y,w,h,'transparent','75% 27% 0 0',a,'border-top:.6px solid #72b98c;opacity:.73'));
 return `<div class="eb-spectral-lion" style="position:absolute;inset:0;transform:translateX(-18px) scale(.98);transform-origin:190px 105px">${s.join('')}</div>`;
}
