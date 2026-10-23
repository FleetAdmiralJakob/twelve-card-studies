/*
 * Revision 2 — original, authored vector plates. No embedded assets, fonts,
 * filters, animation, or baked-in live fields. All dimensions are card units.
 * Skin, cloth, metal, ice, fire and fur are paths; small surface marks are seeded.
 */

const shield = 'M150 16C144 28 134 29 127 20C99 24 66 46 23 53L21 339Q21 354 43 360L108 369Q134 371 150 374Q166 371 192 369L257 360Q279 354 279 339L277 53C234 46 201 24 173 20C166 29 156 28 150 16Z';
const inset = 'M150 29Q138 39 125 29C94 37 67 53 31 60L29 337Q29 350 47 356L111 364Q135 366 150 370Q165 366 189 364L253 356Q271 350 271 337L269 60C233 53 206 37 175 29Q162 39 150 29Z';
const palettes = {
  frost: { ink:'#020b17', shadow:'#07192b', mid:'#234760', light:'#87d6fb', hot:'#e2faff', accent:'#319bea', other:'#bcf4ff', skin:'#466b7d', warm:'#99b0b4' },
  blaze: { ink:'#100204', shadow:'#28080b', mid:'#692020', light:'#ff6945', hot:'#ffe0a3', accent:'#ef2418', other:'#ffb72d', skin:'#7c3028', warm:'#bc7160' },
  volt: { ink:'#08051b', shadow:'#15132e', mid:'#332d64', light:'#61dffa', hot:'#e5f6ff', accent:'#ce39ec', other:'#23ceff', skin:'#4d526f', warm:'#9a9ca6' },
  silvah: { ink:'#030c07', shadow:'#10271b', mid:'#345337', light:'#a7df66', hot:'#edffc0', accent:'#42a55b', other:'#c7f651', skin:'#3c5540', warm:'#879276' },
};

const fmt = n => Number(n.toFixed(2));
const path = (d, fill = 'none', attrs = '') => `<path d="${d}" fill="${fill}"${attrs ? ` ${attrs}` : ''}/>`;
const stroke = (d, color, width = 1, opacity = 1, attrs = '') => path(d, 'none', `stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" ${attrs}`);
const group = (body, attrs = '') => `<g${attrs ? ` ${attrs}` : ''}>${body}</g>`;
const lines = (ds, color, width = 1, opacity = 1) => stroke(ds.join(''), color, width, opacity);
const circle = (x,y,r,fill,opacity=1) => `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
const seeded = seed => () => { seed = (Math.imul(seed,1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const polygon = (pts, fill, attrs = '') => `<polygon points="${pts.map(p=>p.map(fmt).join(',')).join(' ')}" fill="${fill}" ${attrs}/>`;

function definitions(id,c) {
  const linear = (name, stops, coords='x1="0" y1="0" x2="1" y2="1"') => `<linearGradient id="${id}-${name}" ${coords}>${stops.map(([o,col,a=1])=>`<stop offset="${o}" stop-color="${col}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  const radial = (name, stops, coords='cx=".6" cy=".35" r=".7"') => `<radialGradient id="${id}-${name}" ${coords}>${stops.map(([o,col,a=1])=>`<stop offset="${o}" stop-color="${col}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
  return `<defs>
    <clipPath id="${id}-inside">${path(inset,'#fff')}</clipPath>
    <clipPath id="${id}-boundary"><rect x="2" y="2" width="296" height="376"/></clipPath>
    ${linear('metal',[[0,c.hot],[.12,c.mid],[.24,c.light],[.36,c.hot],[.48,c.mid],[.62,c.light],[.74,c.shadow],[.86,c.light],[1,c.hot]])}
    ${linear('foil',[[0,c.shadow],[.16,c.light],[.31,c.hot],[.45,c.mid],[.62,c.hot],[.77,c.accent],[1,c.shadow]],'x1="0" y1="0" x2="1" y2="0"')}
    ${radial('ground',[[0,c.mid],[.36,c.shadow],[1,c.ink]])}
    ${radial('aura',[[0,c.light,.56],[.4,c.accent,.25],[1,c.accent,0]])}
    ${linear('cloth',[[0,c.light],[.13,c.mid],[.34,c.shadow],[.58,c.ink],[.77,c.shadow],[1,c.mid]])}
    ${linear('fold',[[0,c.light,.6],[.17,c.mid,.8],[.53,c.shadow],[1,c.ink]])}
    ${linear('skin',[[0,c.light],[.12,c.skin],[.38,c.skin],[.61,c.shadow],[.84,c.ink],[1,c.mid]],'x1="0" y1="0" x2="1" y2=".35"')}
    ${linear('face',[[0,c.skin],[.13,c.warm],[.29,c.skin],[.52,c.shadow],[.9,c.ink],[1,c.mid]],'x1="0" y1=".2" x2="1" y2=".65"')}
    ${radial('muscle',[[0,c.light,.24],[.36,c.mid,.15],[1,c.mid,0]],'cx=".35" cy=".28" r=".7"')}
    ${id.endsWith('-frost')?linear('glass',[[0,c.hot,.96],[.16,c.light,.86],[.38,c.mid,.8],[.58,c.light,.5],[.82,c.accent,.85],[1,c.shadow,.95]]):''}
    ${id.endsWith('-blaze')?linear('flare',[[0,c.hot],[.18,c.other],[.47,c.accent],[.8,c.accent,.23],[1,c.accent,0]],'x1="0" y1="0" x2=".2" y2="1"'):''}
    ${linear('panel',[[0,c.ink,0],[.12,c.ink,.7],[.27,c.ink,.98],[1,c.ink]],'x1="0" y1="0" x2="0" y2="1"')}
    ${radial('quiet',[[0,c.ink,.98],[.5,c.ink,.93],[.75,c.ink,.63],[1,c.ink,0]],'cx=".5" cy=".5" r=".5"')}
    ${linear('ribbon',[[0,c.ink],[.48,c.shadow],[1,c.ink]],'x1="0" y1="0" x2="1" y2="0"')}
    <pattern id="${id}-grain" width="19" height="23" patternUnits="userSpaceOnUse">
      ${path('M1 3h.6M8 1h.3M16 7h.7M5 12h.4M13 17h.5M2 21h.3M17 22h.4','none',`stroke="${c.hot}" stroke-width=".4" opacity=".17"`)}
      ${path('M4 5l1.5-.5M11 9l1-.3M7 19l1.7-.4','none',`stroke="${c.ink}" stroke-width=".5" opacity=".7"`)}
    </pattern>
    <pattern id="${id}-knit" width="3" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
      ${stroke('M.3 .4l.65 .9L1.6 .4M1.9 2l.5 .7',c.hot,.22,.16)}
    </pattern>
  </defs>`;
}

function motes(c, seed, count=70) {
  const rand=seeded(seed), buckets=new Map(); let stars='';
  for(let i=0;i<count;i++) {
    const x=7+rand()*286,y=8+rand()*354,r=fmt(.2+rand()*.6);
    const color=i%5===0?c.hot:c.light,alpha=fmt(Math.round((.2+rand()*.54)*5)/5),key=`${color}|${alpha}`;
    const d=`M${fmt(x-r)} ${fmt(y)}a${r} ${r} 0 1 0 ${fmt(r*2)} 0a${r} ${r} 0 1 0 ${fmt(-r*2)} 0Z`;
    buckets.set(key,(buckets.get(key)||'')+d);
    if(i%13===0) stars+=`M${fmt(x-2)} ${fmt(y)}h4M${fmt(x)} ${fmt(y-2)}v4`;
  }
  return [...buckets].map(([key,d])=>{const [color,alpha]=key.split('|');return path(d,color,`opacity="${alpha}"`);}).join('')+stroke(stars,c.hot,.35,.65);
}

function crystal(id,c,x,y,len,w,angle) {
  const a=angle*Math.PI/180;
  const p=(u,v)=>[x+u*w*Math.cos(a)-v*len*Math.sin(a),y+u*w*Math.sin(a)+v*len*Math.cos(a)];
  const A=p(0,-1),B=p(.51,-.31),C=p(.34,.65),D=p(-.15,1),E=p(-.5,.28),F=p(-.36,-.51),M=p(-.06,-.05);
  return polygon([A,B,C,D,E,F],`url(#${id}-glass)`,`stroke="${c.light}" stroke-width=".65"`)+
    polygon([A,F,M],c.hot,'opacity=".75"')+polygon([A,B,M],c.light,'opacity=".3"')+
    (len<15?'':polygon([F,E,D,M],c.accent,'opacity=".4"')+polygon([M,B,C,D],c.ink,'opacity=".35"'))+
    stroke(`M${A.map(fmt).join(' ')}L${M.map(fmt).join(' ')}L${D.map(fmt).join(' ')}M${E.map(fmt).join(' ')}L${M.map(fmt).join(' ')}L${B.map(fmt).join(' ')}`,c.hot,.48,.8);
}

function frostEnvironment(id,c) {
  const shards=[
    [48,47,24,16,-28],[72,30,23,19,-21],[97,30,21,16,24],[113,42,27,15,39],
    [195,32,25,20,-32],[222,30,25,20,-16],[247,46,29,17,19],[265,70,26,19,25],
    [31,84,34,17,-8],[20,120,25,16,-21],[34,145,39,20,18],[17,178,32,18,-9],
    [28,208,34,20,18],[17,248,28,16,-13],[29,277,36,19,11],[20,314,26,17,-17],
    [40,335,30,17,-36],[69,350,24,15,-59],[102,357,21,17,-66],[132,365,19,11,-65],
    [173,363,19,13,63],[202,356,23,19,57],[233,345,29,16,49],[266,325,29,17,22],
    [281,288,29,18,11],[275,249,39,23,-21],[286,205,32,16,5],[273,171,36,22,-19],
    [283,129,30,18,12],[274,101,26,17,-16],
  ];
  const rays=lines(['M166 132L74 29M166 132L104 43M166 132L223 20M166 132L259 61M166 132L279 157M166 132L33 158M166 132L26 249M166 132L267 290'],c.light,.8,.22);
  const interior=[[112,91,42,24,-38],[139,61,32,19,12],[218,99,43,23,24],[247,147,41,25,33],[64,176,39,24,-39],[88,207,28,18,-38],[238,210,33,22,34]];
  const chips=Array.from({length:18},(_,i)=>crystal(id,c,i%2?274:27,91+Math.floor(i/2)*27,8+i%4,5+i%3,i%2?-38:41)).join('');
  return {outside:shards.map(a=>crystal(id,c,...a)).join('')+chips+motes(c,92,82), inside:rays+interior.map(a=>crystal(id,c,...a)).join('')+lines(['M43 126l20 7 12-11 18 27-6 20 28 18M211 49l-8 26 15 13-8 34 22 10 16-8M33 290l23-11-4-26 24-12M245 270l-18-24 10-22'],c.hot,.55,.42)};
}

function blazeEnvironment(id,c) {
  const flames=[
    'M24 181C6 163 25 153 12 136C34 146 16 113 29 97C21 126 49 115 35 146C30 157 22 164 24 181Z',
    'M30 109C14 83 39 80 28 58C39 66 50 57 55 46C51 61 37 73 42 83C48 93 34 96 30 109Z',
    'M45 63C46 31 81 39 92 9C94 28 78 36 76 44C98 30 109 28 113 6C120 38 84 48 69 57Z',
    'M187 36C200 22 215 25 230 5C225 21 213 33 205 39C229 28 243 34 260 18C251 42 228 49 215 59Z',
    'M251 72C282 56 264 36 290 26C278 40 291 54 276 71C265 84 276 101 266 117C269 93 248 91 251 72Z',
    'M275 124C290 111 277 98 293 83C285 111 301 122 283 144C267 165 292 180 276 197C280 175 264 154 275 124Z',
    'M276 207C296 193 280 183 293 169C289 194 303 210 286 227C276 238 285 246 289 255C269 245 269 228 276 207Z',
    'M274 263C295 252 277 239 292 227C287 256 301 271 278 292C268 304 287 321 274 337C279 317 262 308 265 292Z',
    'M257 328C270 337 270 349 285 344C272 363 259 343 242 354C224 368 211 350 192 371C199 350 219 354 230 345Z',
    'M35 323C21 339 43 351 53 342C56 358 83 342 93 359C112 350 123 366 143 370C114 374 105 361 88 369C73 350 49 366 39 352C18 352 14 331 35 323Z',
    'M22 296C8 278 26 267 14 252C34 259 34 276 27 284C19 300 33 308 25 324C30 306 14 307 22 296Z',
    'M23 248C3 232 26 220 8 204C27 205 31 217 26 228C18 240 29 240 23 248Z',
  ];
  const outer=flames.map(d=>path(d,`url(#${id}-flare)`)+stroke(d,c.accent,.7,.8)).join('');
  const tongues=[
    'M85 224C98 196 59 186 76 159C87 140 66 129 79 112C73 141 110 140 103 162C95 183 131 185 123 217Z',
    'M190 200C220 164 196 147 225 121C243 105 217 90 240 64C232 89 255 106 241 127C222 156 251 165 222 213Z',
    'M126 150C108 119 126 114 118 91C101 70 125 54 116 34C140 58 119 71 134 87C150 106 140 126 145 151Z',
    'M191 133C217 110 195 97 206 77C217 58 199 46 210 31C210 52 234 62 220 83C208 102 226 113 212 136Z',
    'M234 239C229 217 254 205 249 184C268 207 245 219 260 238Z',
  ];
  const rand=seeded(931); let wisps='';
  for(let i=0;i<38;i++) {
    const side=i%2?1:-1,x=side===1?269+rand()*12:19+rand()*12,y=67+rand()*258,h=8+rand()*25;
    const d=`M${fmt(x)} ${fmt(y+h/2)}C${fmt(x-side*9)} ${fmt(y+4)} ${fmt(x+side*8)} ${fmt(y-3)} ${fmt(x+side*3)} ${fmt(y-h/2)}`;
    wisps+=stroke(d,c.accent,2.7,.18)+stroke(d,c.other,.6,.74);
  }
  return {outside:outer+wisps+motes(c,93,95), inside:tongues.map(d=>path(d,`url(#${id}-flare)`,'opacity=".64"')).join('')+lines([
    'M47 213C72 189 46 177 66 158C77 148 68 132 76 122',
    'M248 229C269 194 245 176 262 151C279 124 256 110 268 89',
    'M93 109C106 94 89 80 104 64M237 71C252 57 240 43 255 35',
    'M44 323C35 300 51 285 39 263M259 315C271 292 254 283 264 268',
  ],c.other,1.3,.84)+lines([
    'M72 222C104 201 77 180 91 166C99 158 88 146 94 136',
    'M85 221C96 215 92 205 104 204C119 204 103 190 111 184',
    'M109 142C119 124 105 112 115 101C125 92 114 84 119 74',
    'M119 83C130 74 119 62 128 55',
    'M208 188C227 167 215 156 230 143C247 128 225 122 239 112',
    'M231 207C239 196 229 190 241 180C251 172 237 159 248 147',
    'M221 104C231 91 219 84 230 74C243 62 224 55 233 46',
    'M39 194C51 185 45 176 57 171C69 164 56 154 66 145',
    'M46 232C58 226 47 216 61 209M258 249C249 238 263 235 254 224',
  ],c.other,.62,.8)};
}

function voltEnvironment(id,c) {
  const rand=seeded(91); let skyline='',traces='';
  for(let i=0;i<20;i++) {
    const x=29+i*12.2,w=7+rand()*6,h=25+rand()*96,y=236-h;
    skyline+=`<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}" fill="${i%2?c.shadow:c.ink}" stroke="${i%3?c.accent:c.other}" stroke-width=".45"/>`;
    for(let j=0;j<h/7-1;j++) {const yy=fmt(y+5+j*7); if(rand()>.3)skyline+=stroke(`M${fmt(x+2)} ${yy}h${fmt(w-4)}`,j%4===0?c.accent:c.other,.9,fmt(.2+rand()*.55));}
    if(i%4===0)skyline+=stroke(`M${fmt(x+w/2)} ${fmt(y)}v-12`,c.other,.6,.7);
  }
  for(let i=0;i<8;i++) {
    const x=12+i*4.2, rx=300-x,y=99+i*19;
    traces+=stroke(`M${fmt(x)} ${y}v${39-i*2}l${8+i} ${8+i}v${31+i*3}`,i%2?c.other:c.accent,.65,.7);
    traces+=stroke(`M${fmt(rx)} ${y-10}v${36+i}l-${8+i} ${8+i}v${20+i*3}`,i%2?c.accent:c.other,.65,.7);
    traces+=circle(x,y,1.2,c.hot,.75)+circle(rx,y-10,1,c.other,.8);
  }
  const tri='M88 110L261 59L199 222Z';
  return {outside:traces+motes(c,191,65)+lines(['M30 68L30 51 97 27M203 27L273 50V78M22 267V313Q22 327 38 332M278 270V313Q278 327 262 332'],c.accent,1.7,.95),
    inside:stroke(tri,c.accent,10,.08)+stroke(tri,c.accent,4,.27)+stroke(tri,c.accent,1.7,.98)+stroke('M88 110L261 59',c.hot,.65,.95)+stroke('M88 110L199 222',c.other,1.9,.9)+
    lines(['M38 188l35-37 26 5M37 204l41-35 20 2M231 146l30-34V86M244 188l18-22V143M43 226l41-13M229 231l34-14'],c.other,.6,.4)+skyline};
}

function lightning(d,c,width=1) {
  return stroke(d,c.accent,width*5,.09)+stroke(d,c.light,width*2,.28)+stroke(d,c.hot,width,.95);
}

function lion(id,c) {
  // Right-facing African lion: the muzzle projects to x267; the mane stays behind the player.
  const mane='M182 63Q193 60 199 57L202 42Q212 45 215 50L230 45Q229 53 233 57L249 58 246 69Q259 73 259 78L254 92 265 107Q255 110 252 119L254 140 242 146Q246 155 243 166L230 168 220 185 207 178Q198 187 190 189L180 172 164 176 160 158 149 149 157 132 150 118 162 106Q154 97 159 90L176 81Z';
  const face='M207 67Q220 58 233 69L241 80Q247 84 247 92Q253 96 261 98Q269 99 269 106Q269 114 257 117L255 128Q247 141 233 136L221 126 208 120 201 102 198 87Z';
  let fur=''; const rand=seeded(900);
  for(let i=0;i<67;i++) {
    const a=(-162+i*4.2)*Math.PI/180,cx=211,cy=113;
    const r=35+rand()*12,ex=cx+Math.cos(a)*r,ey=cy+Math.sin(a)*r*1.42;
    const sx=cx+Math.cos(a)*22,sy=cy+Math.sin(a)*28;
    fur+=stroke(`M${fmt(sx)} ${fmt(sy)}Q${fmt(ex-9)} ${fmt(ey-9)} ${fmt(ex)} ${fmt(ey)}`,i%4===0?c.hot:i%2?c.light:c.accent,.35+fmt(rand()*.55),.25+fmt(rand()*.43));
  }
  return group(path(mane,`url(#${id}-cloth)`,`stroke="${c.accent}" stroke-width="1.2"`)+fur+
    path('M203 74Q202 52 216 60L221 72Z',c.shadow,`stroke="${c.light}" stroke-width=".7"`)+path('M208 70Q207 60 214 64L217 71Z',c.ink)+
    path(face,`url(#${id}-skin)`,`stroke="${c.light}" stroke-width=".65"`)+
    path('M217 74L235 78 243 91 236 97 226 91 212 98 207 91Z',c.mid)+
    path('M234 94Q246 92 253 99Q266 97 267 104Q271 114 257 116L247 114 240 108Z',c.light,'opacity=".4"')+
    path('M259 100Q265 98 268 103L266 109 260 110 256 106Z',c.ink)+
    path('M230 87Q235 82 243 87L239 92 233 91Z',c.ink)+stroke('M232 87l8-.8',c.hot,1.15,.95)+
    path('M241 115Q249 115 256 118L251 129 240 129 237 124Z',c.ink)+path('M249 117l1 7 3-7',c.hot)+
    path('M234 127Q245 134 254 127Q251 138 240 137L232 132Z',c.light,'opacity=".45"')+
    path('M219 105Q218 121 234 132L241 128Q225 124 225 109Z',c.shadow)+
    lines(['M215 78l7 2 7 5M212 83l9 3M209 96l9-1M221 104l8-6M224 112l8-4M230 122l6-3M245 99l-3-5M248 111l7 1M231 137l-5 13-8-3M214 132l1 21-10 12'],c.hot,.55,.47)+
    lines(['M246 109l19-4M247 112l21 2M245 115l19 7M239 117l18 12'],c.hot,.4,.7)+
    [0,1,2,3].map(i=>circle(245+(i%2)*4,106+Math.floor(i/2)*4,.65,c.shadow,.8)).join('')+
    lines([
      'M197 64Q201 57 204 51Q203 64 207 68','M206 62Q213 52 220 53Q216 59 218 64',
      'M221 61Q228 55 235 61L231 65','M232 65Q243 63 249 72L244 73',
      'M245 79Q255 78 257 88','M251 90l8 5','M257 120Q263 128 258 139L254 135',
      'M249 134Q254 145 244 154L247 142','M237 139Q242 152 235 166L234 151',
      'M229 139Q231 161 221 173L225 155','M220 136Q219 151 212 162','M210 130Q205 147 205 164',
      'M199 76Q187 69 179 82L188 81','M193 85Q179 82 172 96L185 91',
      'M190 98Q175 98 167 111L179 108','M187 113Q170 116 168 130L177 126',
      'M190 126Q178 132 181 147L185 140','M194 135Q190 151 197 164',
    ],c.light,.7,.66)+
    lines(['M206 74Q210 69 219 69','M220 76l7 4M221 80l5 3','M213 92l7-2','M230 99l6-3','M227 115l7-6','M233 122l4-6','M242 102l5-1','M244 105l7-.5','M237 131l9 2'],c.hot,.32,.65), 'opacity=".94"');
}

function silvahEnvironment(id,c) {
  const bolts=[
    'M40 44L61 37 57 22 86 27 105 11 100 29 126 24',
    'M188 27L209 18 217 31 245 25 238 42 267 53 260 68 281 74',
    'M28 68L16 90 28 103 13 127 24 140 9 165 25 159 16 191 29 202 13 229 25 239',
    'M276 92L288 110 275 122 292 139 279 158 291 182 277 176 286 205 272 218 290 234 280 256',
    'M22 263L11 283 25 296 14 315 34 327 29 345 59 343 79 359 100 352 125 368 147 360',
    'M276 274L288 295 275 302 285 325 267 337 269 350 239 345 219 363 193 356 170 370 151 362',
  ];
  const inner=[
    'M96 55L114 41 110 65 130 58 119 90 137 85 128 108',
    'M199 48L187 64 202 72 194 96 210 112',
    'M60 136L79 122 74 144 91 154 80 172 94 190',
    'M246 166L260 183 248 191 262 208 243 225',
    'M47 233L64 221 57 207 76 194',
  ];
  return {outside:bolts.map(d=>lightning(d,c,.9)).join('')+motes(c,90,87),inside:inner.map(d=>lightning(d,c,.8)).join('')+lion(id,c)};
}

function hairTexture(c,seed,x,y,w,h,count=65) {
  const rand=seeded(seed), buckets=new Map();
  for(let i=0;i<count;i++) {
    const u=rand(),v=rand(),px=x+u*w,py=y+v*h;
    // Elliptical rejection keeps each tiny curved strand within the haircut.
    if((u-.5)**2/.25+(v-.5)**2/.25>1)continue;
    const d=`M${fmt(px)} ${fmt(py)}q${fmt(-2+rand()*4)} -3 ${fmt(1+rand()*3)} -4`,color=i%9===0?c.hot:c.light,alpha=fmt(Math.round((.09+rand()*.3)*10)/10),key=`${color}|${alpha}`;
    buckets.set(key,(buckets.get(key)||'')+d);
  }
  return [...buckets].map(([key,d])=>{const [color,alpha]=key.split('|');return stroke(d,color,.3,alpha);}).join('');
}

function frostPlayer(id,c) {
  const shirt='M154 127Q140 125 120 135Q103 137 91 150L76 176 97 190 109 181Q111 213 120 244L218 245Q218 215 224 184L239 194 251 178Q241 151 222 138L196 128 181 143Z';
  const head='M151 77Q147 86 151 99L155 104Q157 117 169 123Q181 128 191 119L199 108 204 87Q206 66 192 56Q174 45 159 59Z';
  let s=path('M84 169Q75 187 60 201L44 223Q43 231 51 236L64 231 80 212 101 189Z',`url(#${id}-skin)`)+
    path('M234 174Q248 183 251 200L264 220Q269 230 260 235L247 229 235 214 220 192Z',`url(#${id}-skin)`)+
    path('M163 106L162 127 150 134 177 150 199 132 188 124 190 108Z',`url(#${id}-skin)`)+
    path('M166 115Q178 130 188 116L187 128 178 139 166 126Z',c.ink,'opacity=".65"')+
    path(shirt,`url(#${id}-cloth)`,`stroke="${c.shadow}" stroke-width=".8"`)+path(shirt,`url(#${id}-knit)`)+
    path('M119 136Q108 147 104 176L91 185 80 176Q92 147 119 136Z',`url(#${id}-fold)`)+
    path('M202 133Q223 146 230 178L238 188 246 176Q236 146 218 141Z',`url(#${id}-fold)`)+
    path('M114 168Q145 146 165 158L148 169 123 175 115 197Z',`url(#${id}-muscle)`)+
    path('M183 156Q207 143 217 162L211 177 187 172 179 163Z',`url(#${id}-muscle)`)+
    path('M119 190Q143 178 171 184L159 195 132 201 125 215Z',c.ink,'opacity=".4"')+
    path('M178 176L184 196 206 187 210 174 212 199 193 212 184 234 178 218 173 199Z',c.ink,'opacity=".42"')+
    lines(['M153 129L175 147 193 132M151 133L175 152 198 134','M121 136Q104 151 103 176','M119 142Q130 144 150 141','M127 149Q150 146 164 157','M118 169Q139 158 158 161','M116 177Q130 169 145 172','M120 185Q143 176 164 179','M128 205Q148 196 162 195','M134 214Q151 205 164 208','M129 226Q150 215 167 224','M190 154Q208 148 216 159','M190 166Q202 172 216 165','M191 184Q205 180 216 173','M189 207Q208 199 217 186','M194 223L210 210','M222 145Q235 157 237 176','M85 175L99 184','M233 180L241 185'],c.light,.85,.57)+
    lines(['M148 135L171 146M156 140L170 145','M117 146L110 153M114 153L108 162','M129 151L146 151M124 173L135 170','M139 184L159 181M134 211L145 208','M197 151L207 153M200 201L209 196'],c.hot,.48,.75)+
    lines(['M78 189Q82 199 69 212','M62 205L52 222M65 214L58 227','M239 197Q251 203 252 215','M249 219l8 8'],c.light,.7,.66)+
    path(head,`url(#${id}-face)`)+
    path('M150 80Q142 76 145 88L150 96 155 93Z',`url(#${id}-skin)`)+
    path('M153 80Q159 85 160 99L168 110 161 113Q153 104 153 91Z',c.light,'opacity=".19"')+
    path('M184 76Q193 83 198 84L194 104 184 117 176 119 180 108 177 102 180 87Z',c.ink,'opacity=".42"')+
    path('M169 83L180 82 178 91 184 100 177 103 172 100 175 95Z',c.skin)+
    path('M177 88L176 96 181 99 176 100',c.warm,'opacity=".55"')+
    stroke('M157 81Q163 78 170 81M183 80Q189 78 194 81',c.ink,1.5,.8)+
    stroke('M158 85Q164 82.5 169 85M183 85Q188 83 192 85',c.ink,.85)+stroke('M160 84.5l5-.1M185 84.5l3 .2',c.warm,.4,.65)+
    path('M159 92Q164 91 170 95L170 104 165 101Z',c.warm,'opacity=".2"')+
    path('M168 108Q173 106 176 107Q181 106 185 108Q179 110 175 110Z',c.shadow,'opacity=".65"')+stroke('M170 108Q177 107.2 183 108',c.ink,.65)+
    stroke('M173 112Q178 114 182 111',c.warm,.7,.36)+
    lines(['M156 73Q163 68 171 71','M160 75L171 74','M185 72L194 75','M148 84L150 88 149 91','M155 101Q161 117 172 120','M163 101l3 3','M187 99l4-5'],c.light,.45,.46)+
    path('M151 83Q147 74 150 67Q148 61 155 58Q152 51 161 53Q163 46 170 50Q174 44 180 49Q186 44 190 51Q197 48 199 56Q209 61 204 75L200 83 197 71 194 65Q184 69 174 62L166 67 158 65 155 79Z',c.ink,`stroke="${c.mid}" stroke-width=".65"`)+
    hairTexture(c,920,153,49,48,22,100)+
    stroke('M151 77Q149 65 158 57M165 53L170 51M177 50l8 2M192 55l6 5',c.hot,.65,.83);
  return s;
}

function blazePlayer(id,c) {
  const shirt='M156 129Q136 131 120 139L96 145Q79 153 67 178L87 195 104 181Q117 212 122 245L217 246Q216 215 224 192L241 200 253 182Q248 154 223 142L192 131 176 144Z';
  // The left contour contains the brow, projecting nose, lips, and chin.
  const head='M159 60Q174 45 191 56Q208 65 204 84L201 100 191 111 188 127 171 135 155 123 157 114 148 112 144 106 147 102 141 99Q138 97 143 92L149 82 149 72Z';
  let s=path('M76 172Q62 180 55 195L40 213Q36 223 43 230L55 227 70 210 93 190Z',`url(#${id}-skin)`)+
    path('M237 184L253 200 266 221Q271 235 263 239L250 230 235 217 222 195Z',`url(#${id}-skin)`)+
    path('M162 106L158 128 146 136 174 150 196 136 185 126 191 106Z',`url(#${id}-skin)`)+
    path(shirt,`url(#${id}-cloth)`)+path(shirt,`url(#${id}-knit)`)+
    path('M113 141Q87 153 80 184L68 176Q81 150 101 147Z',`url(#${id}-fold)`)+
    path('M197 136Q226 141 243 172L246 186 229 179 220 158Z',`url(#${id}-fold)`)+
    path('M110 160Q140 149 163 157L153 166 119 175 110 192Z',`url(#${id}-muscle)`)+
    path('M186 150Q204 146 221 164L214 178 191 174 179 168Z',`url(#${id}-muscle)`)+
    path('M117 179L135 187 165 175 176 181 155 194 129 202 124 223Z',c.ink,'opacity=".42"')+
    path('M177 177L188 194 216 185 208 206 185 219 190 240 174 236 165 208Z',c.ink,'opacity=".43"')+
    lines(['M155 130L174 145 188 134M151 133L173 151 194 136','M116 142Q101 154 98 178','M117 148L141 144 159 151','M113 160Q132 153 152 157','M114 172L138 162 152 164','M122 181Q146 173 165 176','M129 203L157 191','M134 214L163 204','M133 228Q149 215 171 222','M187 155Q207 150 219 165','M189 173L210 174 222 165','M191 191L212 182','M187 215L207 202','M225 148Q243 163 245 181','M72 177L88 189','M231 187L246 193'],c.light,.85,.67)+
    lines(['M111 147L102 156','M126 147L141 146','M117 165L134 161','M132 181L150 177','M141 213L153 208','M199 154l13 5','M223 151l11 12'],c.hot,.55,.72)+
    lines(['M66 193Q64 206 50 215','M49 221l6-9','M243 204Q251 206 254 216','M254 224l8 6'],c.light,.7,.67)+
    path(head,`url(#${id}-face)`)+
    path('M156 77L153 86 144 96 151 98 150 104 155 110 161 112 158 119 173 124 180 115 170 107 173 92 165 82Z',c.skin,'opacity=".76"')+
    path('M171 70Q183 68 192 78L197 91 186 102 179 114 176 126 187 123 193 107 201 99 204 83 198 65Z',c.ink,'opacity=".55"')+
    stroke('M151 85Q157 81 165 84',c.ink,1.7,.9)+stroke('M153 87Q158 85 161 86',c.ink,1)+stroke('M153 84L161 83',c.light,.45,.7)+
    path('M149 88L143 96 150 98 155 96Z',c.warm,'opacity=".65"')+stroke('M145 98l5 1',c.ink,.9)+
    path('M149 103Q154 103 159 104L158 106 149 107 147 106Z',c.shadow,'opacity=".72"')+stroke('M149 105l8-.5',c.ink,.65)+
    stroke('M150 110Q155 113 161 111',c.light,.6,.57)+
    path('M182 84Q190 78 192 87L188 99 181 100 179 94Z',`url(#${id}-skin)`)+stroke('M184 87q5-6 4 2l-5 7',c.ink,.9)+
    path('M166 93Q171 96 172 105L166 108 161 101Z',c.warm,'opacity=".27"')+
    lines(['M155 75Q161 72 168 75','M153 79l11-1','M155 114Q162 123 173 125','M165 110l4 3','M175 119l6-7'],c.light,.55,.5)+
    path('M150 80L146 73 150 66 149 61 155 60 155 55 163 56 167 50 175 51 181 47 187 51 193 51 195 56Q209 57 209 75L203 88 197 91 195 77 187 70 180 72 174 65 166 69 158 68 155 78Z',c.ink,`stroke="${c.accent}" stroke-width=".8"`)+
    hairTexture(c,930,150,51,54,23,95)+
    stroke('M150 74L152 65 158 60M165 55l8-2M182 51l7 3M197 59l6 7',c.hot,.7,.9)+
    stroke('M149 82L145 91 141 97 148 100M147 104l1 4 7 5',c.other,.65,.88);
  return s;
}

function voltPlayer(id,c) {
  const shirt='M151 128Q134 127 117 136L97 144Q82 154 73 176L93 192 107 181Q112 210 119 245L220 245Q218 218 226 182L239 192 251 174Q241 149 220 138L192 129 174 143Z';
  const head='M149 77Q150 59 170 56Q193 52 202 73L201 98Q196 113 182 121L168 123Q154 116 151 102Z';
  let s=path('M81 172Q67 183 58 203L44 220 47 232 59 230 77 213 100 189Z',`url(#${id}-skin)`)+
    path('M235 174Q248 184 254 203L267 222 264 233 253 232 236 215 221 189Z',`url(#${id}-skin)`)+
    path('M159 108L159 128 149 135 174 150 196 135 187 128 190 108Z',`url(#${id}-skin)`)+
    path('M161 114L173 125 188 115 186 128 173 139 162 129Z',c.ink,'opacity=".63"')+
    path(shirt,`url(#${id}-cloth)`)+path(shirt,`url(#${id}-knit)`)+
    path('M118 136Q102 155 103 178L91 186 78 175Q90 145 118 136Z',`url(#${id}-fold)`)+
    path('M205 135Q233 147 247 173L237 186 227 176 222 156Z',`url(#${id}-fold)`)+
    path('M113 164Q136 148 160 157L150 168 118 175 114 188Z',`url(#${id}-muscle)`)+
    path('M184 154Q208 147 220 163L211 179 189 172 178 165Z',`url(#${id}-muscle)`)+
    path('M118 187L139 194 164 181 174 188 153 206 126 219Z',c.ink,'opacity=".4"')+
    path('M176 176L186 197 216 184 211 206 191 220 193 243 171 233 169 207Z',c.ink,'opacity=".42"')+
    lines(['M150 130L173 147 192 132M148 135L174 152 198 134','M118 140Q106 156 105 178','M123 144L148 142','M119 156Q140 147 159 158','M119 171Q136 161 153 166','M125 186L152 175 163 179','M130 211L154 198','M133 227Q149 215 166 222','M188 157L205 155 217 163','M188 171L207 176 220 169','M189 190L213 181','M190 217L210 201','M225 145Q240 159 243 175','M79 176L94 186','M231 179L242 185'],c.other,.7,.64)+
    lines(['M96 145Q85 154 79 168','M113 153L107 164','M120 157L137 151','M124 180L141 174','M129 217L145 208','M149 133l17 11','M222 146l9 12'],c.accent,1.2,.86)+
    lines(['M70 191Q66 205 55 213','M54 221l6-9','M245 196Q255 209 255 216'],c.other,.7,.8)+
    path(head,`url(#${id}-face)`)+
    path('M152 82Q144 76 146 88L151 99 155 95Z',c.skin)+path('M198 83Q205 77 204 89L198 99 195 95Z',c.shadow)+
    path('M155 84L166 84 168 96 163 106 158 101Z',c.warm,'opacity=".19"')+
    path('M181 79L196 84 197 100 187 114 178 119 181 109 177 102Z',c.ink,'opacity=".38"')+
    stroke('M157 81Q162 78 169 80M181 80Q187 78 194 81',c.ink,1.4,.9)+
    stroke('M157 86Q163 83.5 169 86M181 86Q187 83.5 193 86',c.ink,.9)+stroke('M160 85l5-.1M184 85l5 .1',c.warm,.4,.65)+
    path('M173 83L170 97 168 100 175 103 181 100 177 97 176 83Z',c.skin)+stroke('M174 87l-2 11 4 1',c.warm,.65,.54)+
    stroke('M170 101l3 1M178 101l2-1',c.ink,.8)+
    path('M166 109Q171 107 175 108Q180 107 183 109Q176 112 169 110Z',c.shadow,'opacity=".7"')+stroke('M167 109q8 .9 15-.1',c.ink,.65)+
    stroke('M171 115q5 2 9-1',c.warm,.65,.45)+
    lines(['M158 94l5 2M185 96l5-3','M154 101Q158 114 169 120','M160 74l8-.4M183 73l8 2','M149 85l2 5'],c.light,.45,.48)+
    path('M150 84L145 74 148 64 144 61 152 59 151 54 159 55 161 49 167 52 172 45 177 50 184 45 188 52 195 49 196 55 203 57 201 63 207 67 202 78 198 85 194 71 185 69 181 75 176 68 169 76 166 68 159 75 156 72Z',c.ink,`stroke="${c.other}" stroke-width=".6"`)+
    hairTexture(c,910,149,50,51,24,100)+
    lines(['M149 64l7-5 6-1','M164 54l7-4','M177 51l7-1','M191 55l7 6','M155 65l8-5','M169 60l5-4','M184 58l9 6'],c.other,.65,.8)+
    stroke('M148 77L151 94M154 103l6 10',c.accent,.8,.85);
  return s;
}

function silvahPlayer(id,c) {
  const shirt='M148 125Q132 127 114 134L91 141Q75 150 64 174L84 193 103 182Q112 208 118 245L224 245Q222 215 230 184L245 194 258 176Q244 148 221 137L193 127 171 139Z';
  const skull='M147 77Q145 56 163 51Q185 45 198 62L202 80 196 105Q188 117 174 123L158 113 150 99Z';
  return path('M72 173Q60 183 54 204L40 225 44 235 57 231 76 212 96 188Z',`url(#${id}-skin)`)+
    path('M242 174Q257 185 261 205L273 225 269 235 257 231 242 213 226 188Z',`url(#${id}-skin)`)+
    path('M156 101L154 124 143 133 168 149 197 135 185 124 190 102Z',`url(#${id}-skin)`)+
    path('M162 110L165 132 176 139 183 125 183 109Z',c.ink,'opacity=".66"')+
    path(shirt,`url(#${id}-cloth)`)+path(shirt,`url(#${id}-knit)`)+
    path('M112 136Q94 153 96 177L82 184 68 173Q82 144 112 136Z',`url(#${id}-fold)`)+
    path('M203 133Q235 142 253 173L242 185 226 174 224 157Z',`url(#${id}-fold)`)+
    path('M121 143Q145 143 166 155L153 176 133 171 113 158Z',`url(#${id}-muscle)`)+
    path('M178 151Q198 138 219 153L220 166 204 176 184 172Z',`url(#${id}-muscle)`)+
    path('M115 169L142 180 157 169 163 180 146 196 125 194Z',c.ink,'opacity=".32"')+
    path('M179 175L199 181 220 167 213 192 190 203 178 195Z',c.ink,'opacity=".4"')+
    path('M164 158Q173 172 170 187L179 214 176 240 164 234 159 213 164 190Z',c.ink,'opacity=".61"')+
    lines(['M147 128Q167 143 190 129M143 132Q168 150 196 133','M113 138Q99 154 100 178','M119 142Q143 140 162 153','M118 151Q141 148 156 159','M114 160L137 171 148 168','M120 178L137 184 150 179','M126 198L147 199 158 191','M131 213L151 210 162 215','M131 228L148 222 163 232','M183 150Q202 141 217 155','M187 160Q203 153 221 164','M186 179L203 181 218 172','M186 199L207 193','M190 219L210 205','M226 143Q242 153 249 174','M70 174L85 186','M234 179L247 187'],c.light,.85,.65)+
    lines(['M121 139L141 140','M119 153L133 154','M126 176L138 181','M132 211L145 208','M194 150L207 149','M206 174L215 170','M229 148L238 156'],c.hot,.5,.8)+
    lines(['M62 194Q62 206 52 215','M51 222l7-9','M251 196Q261 208 260 217'],c.light,.8,.7)+
    path(skull,`url(#${id}-skin)`)+
    path('M162 73Q179 63 191 76L196 94 186 111 173 119 164 111 166 99Z',c.ink,'opacity=".58"')+
    path('M150 83Q142 77 144 89L150 99 154 96Z',c.skin)+path('M198 83Q204 78 202 90L196 99 193 95Z',c.shadow)+
    path('M150 83L147 73 150 62 155 57 154 54 162 53 165 48 172 50 178 46 183 50 190 51 192 56 198 59 201 70 198 85 193 96 190 104 185 108 180 107 175 112 170 108 164 110 159 104 154 96Z',c.ink,`stroke="${c.mid}" stroke-width=".65"`)+
    hairTexture(c,901,150,51,49,43,145)+
    lines(['M149 78Q147 64 158 57','M164 53l8-2','M178 50l8 3','M192 58l5 8','M154 93l5 10','M164 109l7 5 7-1','M160 117l2 10M183 117l-2 11'],c.light,.65,.7)+
    stroke('M154 125Q162 134 171 135',c.hot,.6,.7);
}

function frame(id,c) {
  const detailPaths=['',''];
  for(let i=0;i<27;i++) {
    const y=70+i*8.65;
    detailPaths[i%3===0?0:1]+=`M25 ${fmt(y)}l3 1.5M272 ${fmt(y)}l3-1.5`;
  }
  const details=stroke(detailPaths[0],c.hot,.42,.8)+stroke(detailPaths[1],c.hot,.42,.35);
  return stroke(shield,c.ink,6,.85)+stroke(shield,`url(#${id}-metal)`,3.1)+stroke(shield,c.hot,.45,.75)+
    stroke(inset,`url(#${id}-foil)`,1.25)+
    stroke('M34 64L33 335Q33 347 49 353L113 361Q137 364 150 367Q163 364 187 361L251 353Q267 347 267 335L266 64',c.light,.45,.35)+
    lines(['M29 56Q77 47 126 25M174 25Q223 47 271 56','M27 339Q26 352 45 358L111 366Q138 370 150 372Q162 370 189 366L255 358Q274 352 273 339'],c.hot,.7,.75)+
    lines(['M35 55Q52 42 72 42Q64 50 49 51L41 56','M265 55Q248 42 228 42Q236 50 251 51L259 56','M77 39Q96 25 115 27L106 32 94 33','M223 39Q204 25 185 27L194 32 206 33'],c.light,.85,.85)+
    lines(['M48 359Q59 363 68 359Q66 365 81 364','M252 359Q241 363 232 359Q234 365 219 364','M118 366l10-2 12 4M182 366l-10-2-12 4'],c.hot,.65,.73)+
    details+polygon([[150,359],[153,363],[150,368],[147,363]],`url(#${id}-metal)`)+
    circle(150,363,.8,c.hot)+circle(128,26,.9,c.hot,.9)+circle(172,26,.9,c.hot,.9);
}

function rawCrest(theme,id,c) {
  const badge='M185 281Q194 282 201.5 278Q209 282 218 281L216.5 299Q213.5 307 201.5 314Q189.5 307 186.5 299Z';
  let motif='';
  if(theme==='frost') motif=path('M190 302L197 288 201 296 206 285 213 303Z',c.shadow)+lines(['M190 302l7-14 4 8 5-11 7 18','M195 298l2-5 3 8 3-5 3 4 2-6 3 8','M192 306l8-2 8 2','M201.5 284v3M200 285.5h3'],c.hot,.8,.95);
  if(theme==='blaze') motif=path('M202 307C190 303 192 296 197 290C195 298 202 294 201 285C209 293 206 294 210 291C216 300 208 306 202 307Z',c.accent,`stroke="${c.hot}" stroke-width=".65"`)+path('M202 304C198 300 201 298 203 294C204 300 208 300 202 304Z',c.other);
  if(theme==='volt') motif=polygon([[201.5,284],[211,293],[207,304],[201.5,309],[195,304],[192,293]],c.shadow,`stroke="${c.light}" stroke-width=".7"`)+path('M204 285L196 298 202 297 199 308 208 293 201 295Z',c.hot)+lines(['M193 289l-3 5 4 8','M210 289l3 5-4 8'],c.accent,.8);
  if(theme==='silvah') motif=lines(['M201.5 307V286','M201.5 295l-7-6M201.5 299l-9-3M201.5 303l-7-3','M201.5 295l7-6M201.5 299l9-3M201.5 303l7-3','M196 290l-.5-4M207 290l.5-4','M193 296l-1-4M210 296l1-4','M201.5 307l-4 2M201.5 307l4 2'],c.hot,.9)+[[-5,-6],[5,-6],[-8,0],[8,0]].map(([x,y])=>path(`M${201.5+x} ${294+y}q-4-5 0-6q4 2 0 6`,c.light)).join('');
  return path(badge,c.ink,`stroke="url(#${id}-metal)" stroke-width="1.2"`)+
    path('M189 285Q197 285 201.5 282Q206 285 214 285L212.5 298Q210 304 201.5 310Q193 304 190.5 298Z','none',`stroke="${c.light}" stroke-width=".45" opacity=".7"`)+motif;
}

function lowerPanel(theme,id,c) {
  return `<rect x="29" y="211" width="242" height="161" fill="url(#${id}-panel)"/>`+
    path('M30 242Q77 235 118 236L182 236Q223 235 270 242L270 267Q219 261 181 266L119 266Q81 261 30 267Z',`url(#${id}-ribbon)`)+
    stroke('M32 241Q78 234 119 235M181 235Q222 234 268 241',`url(#${id}-foil)`,.9,.75)+
    stroke('M41 266Q84 262 125 268M175 268Q216 262 259 266',c.light,.5,.28)+
    path('M33 242L41 247 38 259 32 264M267 242L259 247 262 259 268 264','none',`stroke="${c.light}" stroke-width=".7" opacity=".45"`)+
    // Country and live stats are intentionally unmarked; even faint boxes would resemble flags.
    stroke('M145 282v17',c.light,.5,.22)+crest(theme,id,c)+
    stroke('M43 307H173M230 307h27',c.light,.4,.18)+
    stroke('M61 358Q113 364 150 369Q187 364 239 358',c.light,.55,.35);
}

function makeCard(theme) {
  const id=`r2-energy-svg-${theme}`,c=palettes[theme];
  const env=({frost:frostEnvironment,blaze:blazeEnvironment,volt:voltEnvironment,silvah:silvahEnvironment})[theme](id,c);
  const player=({frost:frostPlayer,blaze:blazePlayer,volt:voltPlayer,silvah:silvahPlayer})[theme](id,c);
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 380'>${definitions(id,c)}${group(
    env.outside+path(shield,`url(#${id}-ground)`)+
    group(`<ellipse cx="176" cy="129" rx="130" ry="125" fill="url(#${id}-aura)"/>`+env.inside+
      `<ellipse cx="40" cy="76" rx="77" ry="93" fill="url(#${id}-quiet)"/>`+player+
      `<rect x="29" y="29" width="242" height="325" fill="url(#${id}-grain)"/>`+lowerPanel(theme,id,c),`clip-path="url(#${id}-inside)"`)+frame(id,c),`clip-path="url(#${id}-boundary)"`)
  }</svg>`;
}

export const svgArt = Object.freeze({
  frost: makeCard('frost'),
  blaze: makeCard('blaze'),
  volt: makeCard('volt'),
  silvah: makeCard('silvah'),
});

function crest(...args){return `<g transform="translate(40.3 46.6) scale(.8)">${rawCrest(...args)}</g>`}
