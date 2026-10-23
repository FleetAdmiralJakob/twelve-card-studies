// Basic decorative geometry: rectangles, skewed quadrilaterals and borders only.
const q=(x,y,w,h,b,a=0,s=0,more='')=>`<i class="eb-material" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${b};transform:rotate(${a}deg) skewY(${s}deg);${more}"></i>`;
const stroke=(x,y,w,a,c,h=.8)=>q(x,y,w,h,c,a,0,'transform-origin:0 50%;border-radius:40%;');
export function basicGrid(){let r='';
  for(const [x,y,w,a,c] of [[26,149,69,-5,'#f77ad35c'],[25,180,65,-9,'#6debf76f'],[22,226,79,-9,'#e840d18c'],[25,239,64,3,'#3ae4e97c'],[25,261,58,2,'#ed61cf66'],[24,285,58,3,'#40e9f273'],[27,309,51,2,'#de5ddb75'],[34,339,65,5,'#49d8ed83'],[224,206,55,-9,'#e944da77'],[236,261,40,-2,'#4ae6e982'],[235,288,40,-7,'#db4bc883'],[239,319,35,-6,'#58daed7f'],[197,346,69,-8,'#df6bdb83']])r+=stroke(x,y,w,a,c);
  for(const [x,y,w,a,c] of [[42,49,286,90,'#de4fcc77'],[64,43,301,90,'#58d8ed66'],[86,46,69,90,'#dc58d45e'],[87,204,133,90,'#e744bf77'],[111,145,99,89,'#ec6fda65'],[207,42,202,89,'#ed60da66'],[236,58,282,89,'#61e8ed77'],[263,52,279,89,'#ed60da77']])r+=stroke(x,y,w,a,c,.6);
  return r;
}
export function basicGraffiti(){let r='';
  for(const [x,y,w,a,h] of [[65,139,51,82,5],[67,139,42,58,5],[88,133,49,88,5],[46,180,28,-25,5],[50,187,40,77,5],[52,207,29,-23,5],[54,220,31,78,5],[42,244,45,-28,4],[47,228,32,-22,2]])r+=stroke(x,y,w,a,'#e1e6db',h);
  r+=q(48,177,27,21,'transparent',-12,0,'border:4px solid #e1e6db;border-left-color:transparent;border-radius:39% 53% 48% 18%;');
  r+=q(54,203,23,17,'transparent',-21,0,'border-top:4px solid #e1e6db;border-right:3px solid #e1e6db;border-radius:45%;');
  for(const [x,y,w,h,a,c] of [[24,242,10,21,-17,'#e6268e'],[37,229,15,7,26,'#ec2d9e'],[262,226,10,24,18,'#e92e9b'],[252,246,19,8,-29,'#f0cb15'],[267,196,8,16,29,'#efce22'],[106,353,25,5,21,'#ecd11d']])r+=q(x,y,w,h,c,a,0,'border-radius:39% 60% 18% 37%;');
  return r;
}
export function basicRoyalShards(layer){let r='';
  if(layer==='back'){
    for(const [x,y,w,h,a,s] of [[43,142,29,53,-27,-19],[63,166,30,54,31,15],[84,106,22,63,-15,-13],[183,99,20,65,-18,16],[234,167,29,60,25,-17],[51,213,36,28,-28,14]])r+=q(x,y,w,h,'linear-gradient(130deg,#e5adff,#8a3ad4 22%,#381268 61%,#180b34)',a,s,'border-left:1px solid #dea9ff;border-top:.7px solid #c794ed;');
    for(const [x,y,w,a] of [[36,173,60,-18],[49,218,55,-25],[191,119,35,65],[237,215,34,-31]])r+=stroke(x,y,w,a,'#db99fa',1.1);
  }else{
    for(const [x,y,w,h,a,s] of [[15,69,9,60,7,-23],[15,183,9,36,-13,20],[15,258,9,40,13,-20],[21,321,10,24,-26,20],[277,68,9,59,-7,23],[277,183,9,36,13,-20],[277,258,9,40,-13,20],[269,321,10,24,26,-20]])r+=q(x,y,w,h,'linear-gradient(105deg,#f2c9fb,#803bd4 33%,#21113e 62%,#d5bff0)',a,s,'border-left:.8px solid #eecb99;border-right:.7px solid #d8afff;');
  }return r;
}
const crystal=(x,y,w,h,a,s,k=0)=>q(x,y,w,h,[
  'conic-gradient(from 27deg at 37% 33%,#d8faff 0deg 92deg,#5c92cc 93deg 183deg,#1a4d81 184deg 263deg,#a6e8ed 264deg)',
  'conic-gradient(from 43deg at 55% 54%,#a5e9f9 0deg 97deg,#354a8c 98deg 190deg,#d299e6 191deg 276deg,#e6fcff 277deg)',
  'linear-gradient(120deg,#c9faff,#5fbee5 24%,#949bee 42%,#ef98de 57%,#f2eeb2 67%,#70d7ef 81%,#32639a)',
  'conic-gradient(from 20deg at 38% 52%,#b6eafa 0deg 80deg,#eceeff 81deg 174deg,#6477b9 175deg 261deg,#3c9cc1 262deg)'
][k%4],a,s,'border:.6px solid #bdeaf6;');
export function basicCrystals(layer){let r='';
  const parts=layer==='back'?[
    [93,39,31,58,-13,-17,1],[103,24,42,54,13,-19,2],[146,23,36,57,-15,17,3],[195,38,39,67,12,-13,2],
    [237,57,29,91,14,-13,2],[35,114,32,71,-18,14,0],[58,170,34,71,23,-17,1],[233,160,35,80,-19,18,3],
    [33,237,42,54,15,-17,2],[239,244,31,62,13,17,2]
  ]:[
    [39,29,48,15,-18,-13,0],[96,17,32,24,22,-23,3],[144,16,31,28,-20,16,0],[188,29,38,20,14,-16,1],[238,38,24,37,17,16,3],
    [15,72,14,42,-8,10,0],[19,130,20,47,10,-12,1],[18,185,23,46,-10,14,3],[17,247,22,48,12,-17,0],[28,306,21,35,-19,15,1],
    [259,84,19,54,11,-13,0],[261,141,19,50,-9,16,1],[262,198,21,43,12,-18,3],[260,260,20,41,-10,16,0],[250,309,19,33,19,-15,2],
    [48,337,47,14,11,-16,3],[94,346,40,13,15,-12,1],[134,353,28,15,25,-21,2],[162,349,42,14,-15,12,0],[204,340,49,13,-12,15,1]
  ];
  if(layer==='front')for(const [x,y,w,h,a,s,k] of [[23,105,12,35,-4,12,0],[21,165,13,32,6,-11,1],[22,225,13,35,-6,14,3],[24,285,15,34,9,-13,1],[265,118,13,37,4,-13,3],[266,180,13,31,-5,12,0],[264,230,13,39,6,-14,1],[260,292,14,31,-7,13,3]])r+=crystal(x,y,w,h,a,s,k);
  for(const v of parts)r+=crystal(...v);return r;
}
