import { prismSurface, riveraGrid, royalShards, graffiti } from './surfaces.mjs';
import { figure as renderFigure } from './figures.mjs';
// Original vector illustrations, authored in a 300 × 380 coordinate system.
// Live card typography and national flags belong to the parent compositor.
// All randomness is seeded; no images, fonts, animation, or SVG filters.
const n = v => +v.toFixed(2);
const rng = seed => () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
const path = (d, fill = 'none', stroke = '', sw = 1, attrs = '') => `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${attrs ? ` ${attrs}` : ''}/>`;
const polygon = (points, fill, stroke = '', sw = .6, attrs = '') => `<polygon points="${Array.isArray(points) ? points.map(p => p.map(n).join(',')).join(' ') : points}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${attrs ? ` ${attrs}` : ''}/>`;
const circle = (x, y, r, fill, attrs = '') => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}"${attrs ? ` ${attrs}` : ''}/>`;
const ellipse = (x, y, rx, ry, fill, attrs = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"${attrs ? ` ${attrs}` : ''}/>`;
const group = (body, attrs = '') => `<g${attrs ? ` ${attrs}` : ''}>${body}</g>`;
const url = (theme, id) => `url(#${theme}-${id})`;
const lg = (theme, id, stops, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `<linearGradient id="${theme}-${id}" x1="${x1 * 100}%" y1="${y1 * 100}%" x2="${x2 * 100}%" y2="${y2 * 100}%">${stops.map(([offset, color, opacity]) => `<stop offset="${offset}" stop-color="${color}"${opacity === undefined ? '' : ` stop-opacity="${opacity}"`}/>`).join('')}</linearGradient>`;
const rg = (theme, id, color, opacity = 1) => `<radialGradient id="${theme}-${id}"><stop stop-color="${color}" stop-opacity="${opacity}"/><stop offset=".52" stop-color="${color}" stop-opacity="${n(opacity * .25)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
const clip = (theme, id, d) => `<clipPath id="${theme}-${id}">${path(d)}</clipPath>`;
const shield = 'M18 47Q64 32 114 14Q132 33 150 10Q168 33 186 14Q237 32 282 47L282 329Q283 349 260 352Q186 355 150 374Q114 355 40 352Q17 348 18 329Z';
const inset = 'M25 52Q70 37 114 22Q133 40 150 22Q167 40 186 22Q234 38 275 52L275 327Q276 342 255 345Q186 348 150 366Q114 348 45 345Q24 343 25 327Z';
const root = (theme, defs, content) => {
  const active=defs.replace(/<(linearGradient|radialGradient|clipPath|pattern)\b[^>]*id="([^"]+)"[^>]*>[\s\S]*?<\/\1>/g,(block,_tag,id)=>content.includes('url(#'+id+')')?block:'');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380" aria-hidden="true" focusable="false"><defs><clipPath id="${theme}-bounds"><path d="M0 0H300V380H0Z"/></clipPath>${active}</defs><g clip-path="${url(theme, 'bounds')}">${content}</g></svg>`;
};

// Fine print and cloth grain are batched into a handful of paths rather than
// hundreds of DOM nodes. Coordinates are independently authored, never traced.
function grain(seed, count, bounds, color, opacity = .3) {
  const rand = rng(seed); let d = '';
  for (let i = 0; i < count; i++) {
    const x = bounds[0] + rand() * bounds[2], y = bounds[1] + rand() * bounds[3];
    d += `M${n(x)} ${n(y)}l${n(.12 + rand() * .65)} ${n(rand() * .35)}`;
  }
  return path(d, 'none', color, .55, `opacity="${opacity}" stroke-linecap="round"`);
}
function scratches(seed, count, bounds, color, opacity = .3, length = 5) {
  const rand = rng(seed); let d = '';
  for (let i = 0; i < count; i++) {
    const x = bounds[0] + rand() * bounds[2], y = bounds[1] + rand() * bounds[3];
    d += `M${n(x)} ${n(y)}l${n(rand() * length + .2)} ${n(rand() * 2 - 1)}`;
  }
  return path(d, 'none', color, .38, `opacity="${opacity}"`);
}
function star(x, y, r, color, width = .7) {
  return path(`M${x} ${y-r}Q${x+.6} ${y-.6} ${x+r} ${y}Q${x+.6} ${y+.6} ${x} ${y+r}Q${x-.6} ${y+.6} ${x-r} ${y}Q${x-.6} ${y-.6} ${x} ${y-r}Z`, color)
    + path(`M${x-r*1.35} ${y}H${x+r*1.35}M${x} ${y-r*1.35}V${y+r*1.35}`, 'none', color, width, 'opacity=".35"');
}
function footer(theme, tint, line) {
  return path('M23 217Q146 232 277 217V328Q277 346 252 348Q181 351 150 368Q112 351 48 348Q23 346 23 328Z', url(theme, 'footer'))
    + path('M30 238Q150 229 270 238L267 265Q150 257 33 265Z', tint, line, .55)
    + path('M36 305Q150 301 264 305M36 342Q150 341 264 342', 'none', line, .5, 'opacity=".32"');
}
function rawCrest(theme, color, motif) {
  return group(path('M169 269Q178 270 185 265Q192 270 202 269L200 285Q198 295 185 303Q172 295 170 285Z', '#080c1a', color, 1.3)
    + path('M172 273Q180 274 185 270Q191 274 199 273L197 285Q194 293 185 299Q176 293 173 285Z', 'none', color, .55)
    + group(motif, `stroke-linecap="round" stroke-linejoin="round"`), 'transform="translate(16 10)"');
}
function palm(x, y, scale, color) {
  const leaves = [
    'M0 0C-14-15-29-13-36-2C-23-8-11-5 0 0Z',
    'M0 0C-23-3-32 6-33 18C-21 5-10 6 0 0Z',
    'M0 0C-14 4-19 19-14 28C-12 14-4 8 0 0Z',
    'M0 0C1-17 13-23 23-18C11-14 7-5 0 0Z',
    'M0 0C13-15 29-12 35-2C20-7 13-3 0 0Z',
    'M0 0C17-3 28 8 28 20C19 10 11 6 0 0Z',
    'M0 0C4-13-2-24-11-26C-6-17-5-7 0 0Z',
  ];
  return group(path('M-2 0C-4 26-4 47-9 69L-2 70C2 43 3 25 2 0Z', color)
    + leaves.map(d => path(d, color)).join('')
    + path('M-4 20L0 19M-4 30L0 29M-5 40L-1 39M-6 51L-2 50', 'none', '#d52de1', .7, 'opacity=".35"'), `transform="translate(${x} ${y}) scale(${scale})"`);
}
function makeRivera() {
  const t = 'rivera';
  const torso = 'M147 124Q160 132 184 122L212 133Q228 138 244 158L253 174L228 187L215 173L219 212L215 244L113 244L116 204L123 172L106 186L87 171Q99 149 119 140Z';
  let defs = clip(t, 'card', shield) + clip(t, 'shirtClip', torso)
    + `<clipPath id="rivera-sunClip"><circle cx="188" cy="113" r="73"/></clipPath>`
    + lg(t,'sky',[['0','#160926'],['.3','#8e1479'],['.57','#f43fc2'],['.78','#352272'],['1','#0b0a29']],0,0,0,1)
    + lg(t,'sun',[['0','#fff9a1'],['.35','#ffd569'],['.7','#ff7c99'],['1','#ff34c0']],0,0,0,1)
    + lg(t,'shirt',[['0','#442a82'],['.28','#211245'],['.55','#10122f'],['.78','#3d2462'],['1','#0c1029']],0,0,1,.4)
    + lg(t,'skin',[['0','#1cc6ec'],['.13','#222448'],['.48','#171424'],['.8','#492544'],['1','#e556cb']],0,0,1,.3)
    + lg(t,'fold',[['0','#8531a5'],['.35','#36205c'],['1','#100f27']],0,0,1,1)
    + lg(t,'clothLight',[['0','#ee96e3',.55],['.35','#b159bd',.3],['1','#ac55d0',0]],0,0,1,.35)
    + lg(t,'chrome',[['0','#72f4ff'],['.21','#eb33d0'],['.4','#fff0a5'],['.6','#16def4'],['.81','#aa46ec'],['1','#ff4dcc']],0,0,1,1)
    + lg(t,'footer',[['0','#090c26',0],['.23','#090b26',.9],['.62','#070b1f',.97],['1','#10102c',1]],0,0,0,1)
    + lg(t,'shade',[['0','#15102d',.95],['.75','#17102e',.8],['1','#17102e',0]],0,0,1,0)
    + rg(t,'cyanGlow','#1de6ff',.7) + rg(t,'pinkGlow','#fc37c5',.65);
  let sky = path(shield, url(t,'sky'));
  sky += ellipse(182,118,128,112,url(t,'pinkGlow')) + circle(188,113,73,url(t,'sun'));
  let stripes = '';
  [94,106,119,133,148,164,179].forEach((y,i)=>stripes+=path(`M106 ${y}H266V${y+2+i*.8}H106Z`,'#9d2a94'));
  sky += group(stripes, `clip-path="${url(t,'sunClip')}"`);
  sky += path('M21 189L40 179L57 181L76 169L101 177L125 167L149 179L175 172L193 183L214 170L232 180L254 174L283 190V224H21Z','#281342')
    + path('M23 194L52 188L73 193L89 185L111 191L141 181L168 197L191 187L212 195L243 184L281 192V224H23Z','#101630')
    + path('M26 200Q155 192 275 202','none','#ee60da',1.2);
  sky += palm(70,145,.77,'#321548') + palm(253,128,.78,'#28123d') + palm(42,177,.43,'#411856') + palm(93,186,.35,'#311a53');
  let grid = '';
  for(let i=-9;i<=9;i++)grid+=path(`M150 194L${150+i*38} 380`,'none',i%2?'#29d8f2':'#db4ecf',.7);
  [200,209,222,241,266,300,345,377].forEach(y=>grid+=path(`M18 ${y}H282`,'none','#34cee8',.65));
  sky += group(grid,'opacity=".58"') + grain(145,850,[24,28,252,325],'#f3c6f1',.23);
  let scan = '';
  for(let y=32;y<233;y+=3.3)scan+=path(`M23 ${n(y)}H278`,'none','#eec4ff',.3,'opacity=".17"');
  sky += scan;
  // Trapezius, exposed upper arms, and bent forearm are separate anatomical forms.
  const player=renderFigure('rivera','svg');
  let art = group(sky + player + path('M22 37H86V116H22Z',url(t,'shade')),`clip-path="${url(t,'card')}"`);
  art += footer(t,'#10102bcc','#794a94')+riveraGrid('svg');
  // Glitching chrome edge, not a generic rectangular border.
  art += path(shield,'none','#0f0c31',7) + path(shield,'none',url(t,'chrome'),3.7)
    + path(inset,'none','#3dd9f4',.85) + path(shield,'none','#e3e8ff',.55)
    + path('M15 78L15 131L21 138V187L15 194V249L20 255M285 85L285 136L280 143V192L287 201V263L281 268','none','#ff40c7',2.1)
    + path('M10 151V169M14 273V294M288 45V74M287 304V328','none','#53eafd',1.4)
    + path('M24 53L95 30M199 30L273 52M34 341Q91 343 148 365Q207 343 266 341','none','#f6d67d',.7);
  let glitches='';
  const rand=rng(512);
  for(let i=0;i<52;i++){
    const x=i%2?274:15, y=46+rand()*292, w=3+rand()*8;
    glitches+=path(`M${x} ${n(y)}h${n(w)}v${n(.6+rand()*2.3)}h${n(-w)}Z`,['#ff47d5','#40ebf5','#ffe983'][i%3]);
  }
  art += glitches + path('M25 353L64 357M245 355L271 350M115 365L134 370M164 369L177 364','none','#f3a2e9',.8);
  art += crest(t,'#54d6f5',path('M184 294Q185 284 185 279M185 280Q178 273 175 279Q181 277 185 282M185 280Q192 273 196 279Q189 277 185 282M185 278Q184 271 180 274M185 279Q189 271 192 275','none','#4bddf7',1.2)+path('M177 294Q184 291 192 294','none','#cf53e2',.8));
  return root(t,defs,art);
}

function paintSplash(seed, x, y, sx, sy, color, rotation = 0) {
  const rand = rng(seed); let pts = [], drops = '', jets='';
  for(let i=0;i<31;i++){
    const angle=(i+rand()*.35)/31*Math.PI*2, radius=3.5+rand()*6.7;
    pts.push([Math.cos(angle)*radius,Math.sin(angle)*radius]);
  }
  let blot=`M${n((pts[0][0]+pts.at(-1)[0])/2)} ${n((pts[0][1]+pts.at(-1)[1])/2)}`;
  pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];blot+=`Q${n(p[0])} ${n(p[1])} ${n((p[0]+q[0])/2)} ${n((p[1]+q[1])/2)}`;});
  blot+='Z';
  for(let i=0;i<7;i++){
    const a=rand()*Math.PI*2,r=10+rand()*10,dx=Math.cos(a),dy=Math.sin(a),w=.25+rand()*.6;
    jets+=`M${n(dx*4-dy*w)} ${n(dy*4+dx*w)}Q${n(dx*8-dy)} ${n(dy*8+dx)} ${n(dx*r)} ${n(dy*r)}Q${n(dx*8+dy)} ${n(dy*8-dx)} ${n(dx*4+dy*w)} ${n(dy*4-dx*w)}Z`;
  }
  for(let i=0;i<29;i++){
    const a=rand()*Math.PI*2,r=5+rand()*17;
    const cx=n(Math.cos(a)*r),cy=n(Math.sin(a)*r),radius=n(.18+rand()*.85);
    // One compound pigment path preserves the individually authored droplets
    // while avoiding hundreds of separate circle elements.
    drops+=`M${n(cx-radius)} ${cy}a${radius} ${radius} 0 1 0 ${n(radius*2)} 0a${radius} ${radius} 0 1 0 ${n(-radius*2)} 0Z`;
  }
  return group(path(blot+jets,color)+path(drops,color),`transform="translate(${x} ${y}) rotate(${rotation}) scale(${sx} ${sy})"`);
}
function makeDrift() {
  const t='drift';
  const edge='M20 48L64 32L107 18L116 25L134 27L145 15L156 28L171 22L225 36L280 52L277 129L282 174L278 230L282 282L275 338L258 350L209 356L171 363L149 374L126 361L73 355L29 345L18 325L22 274L16 237L20 192L17 153Z';
  const hood='M119 123Q123 94 138 65Q149 44 165 39Q183 44 193 62Q204 80 210 109L203 129L192 141L144 148L124 139Z';
  const body='M141 132Q152 143 182 131L201 127Q220 133 236 151L261 182L245 197L223 186L228 217L239 245L93 245L98 210L109 174L88 197L72 187L99 151Q115 141 141 132Z';
  const hoodOpening='M133 118Q135 95 150 74Q161 61 171 66Q185 75 197 104Q194 123 177 136L152 133Z';
  const defs=clip(t,'card',edge)+clip(t,'hood',hood)+clip(t,'body',body)
    +`<clipPath id="drift-hoodShell"><path d="${hood+hoodOpening}" clip-rule="evenodd"/></clipPath>`
    +lg(t,'base',[['0','#15191d'],['.4','#090b0e'],['1','#11181c']],0,0,1,1)
    +lg(t,'cloth',[['0','#545858'],['.17','#181c21'],['.5','#0b1118'],['.76','#282c31'],['1','#777775']],0,0,1,.7)
    +lg(t,'hoodLight',[['0','#e8e5d6'],['.16','#777b79'],['.35','#242a2e'],['.65','#0c1118'],['.9','#4c5354'],['1','#c7c8bd']],0,0,1,.6)
    +lg(t,'face',[['0','#050a0e'],['.56','#0b1015'],['.82','#1e292d'],['1','#38454a']],0,0,1,1)
    +lg(t,'clothLight',[['0','#c4d0c2',.45],['.42','#a3b4a7',.17],['1','#82928d',0]],0,0,1,.25)
    +lg(t,'footer',[['0','#0a0d12',0],['.22','#080c10',.93],['.6','#080d12',.98],['1','#080d10',1]],0,0,0,1)
    +lg(t,'shade',[['0','#0c0f13',.96],['.8','#0b0e12',.96],['1','#0c1014',0]],0,0,1,0);
  let art=path(edge,url(t,'base'));
  art+=group(path('M27 62L117 32L93 127L24 186Z','#202327')
    +path('M205 29L278 55L273 217L239 170L218 107Z','#121820')
    +path('M22 147L100 111L82 211L23 241Z','#12161b')
    +grain(3001,1750,[21,21,260,336],'#c5bfb5',.23)
    +scratches(3002,290,[24,30,252,304],'#656e74',.22,6),`clip-path="${url(t,'card')}"`);
  // Individual pigment explosions have their own direction and paint viscosity.
  const splashes=[
    [34,136,1.3,2.1,'#00c6e8',-22],[63,163,1.7,1.1,'#e9007e',13],
    [264,120,1.1,1.9,'#ffe431',21],[237,94,1.5,1,'#00bee6',-11],
    [110,55,1.1,1.6,'#ffe431',34],[28,249,1.2,1.9,'#f30584',-8],
    [267,239,1.3,2,'#ed0988',-17],[272,283,.8,2.4,'#02bde6',17],
    [42,322,1.9,.7,'#ffdc24',-32],[260,335,1.2,.8,'#e4e7dc',12],
    [86,350,1.8,.65,'#e7e8db',4],[235,353,1.5,.5,'#ffc91f',-21],
    [41,39,1.3,.5,'#f8da23',-29],[258,47,.9,.4,'#e4e6d7',19],
    [284,192,.7,1.4,'#ffcf18',-8],[18,194,.8,1.3,'#e6e7dc',-12],
  ];
  splashes.forEach(([x,y,sx,sy,c,a],i)=>art+=paintSplash(3300+i,x,y,sx,sy,c,a));
  art+=path('M26 144L27 191Q28 195 29 192L31 160M40 145V205Q41 214 43 207L44 155M274 243L277 316Q278 325 280 316V256M21 247V290Q22 302 24 290L25 257','none','#ed168c',1.7)
    +path('M256 113L262 155M268 105L272 173Q273 181 274 173M43 319L39 349','none','#ffe336',1.3)
    +path('M29 131L34 198M270 280L264 345M241 96L225 111','none','#05c9f1',1.7);
  // These are purely gestural, non-letter brush marks, with dry bristle cuts.
  art+=path('M31 167Q55 150 66 156Q67 170 54 202Q72 177 82 182Q81 197 44 229Q59 214 73 220L58 240M48 167Q62 170 84 190M34 205Q54 214 81 210M214 110Q233 83 246 87Q250 94 237 122L264 108','none','#e6e7e1',3.7,'stroke-linecap="square" opacity=".8"')
    +path('M33 168L65 159M54 199L78 183M43 230L66 222M35 206L78 211M215 110L240 91','none','#f9f8ec',.8)
    +path('M29 171L58 161M42 210L68 212M57 227L73 222M230 107L243 93','none','#11161b',1.1)
    +path('M231 204Q255 172 266 182Q273 190 243 214Q229 225 258 219M231 194L273 208','none','#ecebdc',2.2,'opacity=".75"');
  // A loose, hand-painted crown balances the hood without occupying the rating.
  art+=path('M209 63L201 38L217 48L227 26L233 49L251 34L244 65Z','#f9d625','#fceb54',1.1)
    +path('M210 59L207 46L218 54L226 36L232 56L245 43L240 61Z','#0b1118')
    +path('M208 68L246 69M211 73L238 74','none','#f8d41d',2)
    +circle(201,36,2,'#ffdc35')+circle(227,24,2.2,'#ffdc35')+circle(252,32,1.8,'#ffdc35');
  const figure=renderFigure('drift','svg');
  art+=graffiti('svg')+figure + path('M22 39H93V119H22Z',url(t,'shade'));
  art+=footer(t,'#080c10','#525c61');
  // Frayed frame is broken into offset lines and torn little paper slivers.
  art+=path(edge,'none','#bec3b9',1.15)
    +path('M26 52L105 25M121 32L135 31M164 28L221 41L273 57L271 130M277 159L273 205L276 248M275 288L270 334L255 343L205 350M172 358L150 367L128 354L72 349L34 339L24 325M25 307L28 274M23 233L26 190L23 154L26 52','none','#e7e8df',.55)
    +path('M19 58L18 111M18 212L17 235M280 66L278 91M283 265L281 282M43 352L80 355M225 355L250 350','none','#6d7878',2.2)
    +path('M22 68L18 77L21 87M277 133L281 145L277 151M21 288L18 297L22 310M264 344L254 349L243 348','none','#fff8d9',1.2);
  const rand=rng(3640);let fragments='';
  for(let i=0;i<48;i++){
    const x=i%2?273+rand()*10:14+rand()*12,y=52+rand()*286;
    fragments+=polygon([[x,y],[x+rand()*4,y-2-rand()*4],[x+rand()*2,y+4+rand()*4]],['#d1d8cc','#f5d229','#00bee5','#ed1288'][i%4], '',0,'opacity=".85"');
  }
  art+=fragments + crest(t,'#d8e0cf',path('M177 280L182 276L181 290L189 281L194 277L191 291M176 288L193 282M182 295L190 289','none','#e0e7d7',1.25)+path('M180 271L183 275L186 271L190 275L193 272','none','#f2db42',.7));
  return root(t,defs,art);
}

function makeMajestic() {
  const t='majestic';
  const body='M144 127Q164 137 186 124L210 136Q223 146 237 172L219 188L207 177L214 211L216 245L98 245L105 212L110 179L96 190L76 177Q87 150 111 140Z';
  const defs=clip(t,'card',shield)+clip(t,'body',body)
    +lg(t,'base',[['0','#130723'],['.35','#311060'],['.65','#1b0b41'],['1','#08091f']],0,0,1,1)
    +lg(t,'gold',[['0','#fff1bd'],['.15','#c3894e'],['.32','#ffe7a4'],['.47','#7c4a3e'],['.62','#eec99a'],['.8','#fff2c3'],['1','#a76448']],0,0,1,.7)
    +lg(t,'violetEdge',[['0','#9c3fff'],['.3','#f3b5ff'],['.52','#562ab5'],['.75','#b64dff'],['1','#fcdbff']],0,0,1,1)
    +lg(t,'skin',[['0','#af72ec'],['.2','#3e2756'],['.53','#1c142c'],['.83','#3f255a'],['1','#d9a7ff']],0,0,1,.2)
    +lg(t,'cloth',[['0','#8756a3'],['.12','#3d215b'],['.38','#231438'],['.65','#100e24'],['.86','#341a57'],['1','#aa56ce']],0,0,1,.6)
    +lg(t,'clothLight',[['0','#e5a9ff',.6],['.4','#b985db',.28],['1','#945ab9',0]],0,0,1,.35)
    +lg(t,'silver',[['0','#f9d7ff'],['.12','#643b8d'],['.25','#fff5ed'],['.38','#9767b4'],['.5','#ead0f3'],['.62','#3d2358'],['.8','#cb9ee2'],['.95','#fff0e1'],['1','#81528f']],0,0,1,.15)
    +lg(t,'cupInside',[['0','#1b0b35'],['.52','#754889'],['1','#301842']],0,0,0,1)
    +lg(t,'footer',[['0','#120922',0],['.22','#100820',.91],['.6','#0c0920',.98],['1','#100921',1]],0,0,0,1)
    +lg(t,'shade',[['0','#190b33',.98],['.8','#190b33',.88],['1','#190b33',0]],0,0,1,0)
    +rg(t,'aura','#bd43ff',.8)+rg(t,'spark','#e29bff',.72)
    +`<pattern id="majestic-brocade" width="32" height="40" patternUnits="userSpaceOnUse">${path('M16 3Q7 8 11 17Q4 13 3 19Q4 26 12 24Q10 29 16 35Q22 29 20 24Q28 26 29 19Q28 13 21 17Q25 8 16 3ZM16 10V29M8 21H24','none','#c489e3',.35,'opacity=".2"')}</pattern>`;
  let scene=path(shield,url(t,'base'))+path(shield,'url(#majestic-brocade)')
    +ellipse(173,132,101,129,url(t,'aura'))+ellipse(239,146,65,108,url(t,'spark'))
    +path('M160 52L174 97L215 72L193 111L245 127L199 141L227 184L181 160L163 211L151 163L105 188L130 148L83 126L133 116L111 78L151 98Z','#6024a4','',1,'opacity=".21"');
  let energy='';
  const energyPaths=[
    'M33 192L51 178L44 154L71 161L83 143L97 147L108 125',
    'M27 205L58 217L78 199L89 212L105 193L126 201L142 188',
    'M36 237L61 222L55 205L79 181L70 167L88 154',
    'M218 42L210 65L219 79L207 97L220 111',
    'M270 179L249 196L260 211L238 226L217 215L196 233L180 222',
    'M270 222L265 247L242 250L229 239L207 253',
    'M107 33L118 52L110 68L122 83L116 101',
    'M56 130L73 121L68 102L83 88L80 74',
  ];
  energyPaths.forEach(d=>energy+=path(d,'none','#943bf9',3,'opacity=".3"')+path(d,'none','#b45bff',.9)+path(d,'none','#eed0ff',.35));
  scene+=energy+grain(4100,1050,[23,24,254,320],'#d6b4fb',.19);
  [[62,143,5],[92,116,3],[241,54,5],[265,197,4],[57,218,7],[91,225,4],[222,230,7],[205,63,3],[131,41,2.5]].forEach(([x,y,r])=>scene+=star(x,y,r,'#e4b3ff'));
  // A substantial two-handled silver cup, with interior, foot, and engraved ribs.
  let cup=path('M223 119Q199 112 201 81Q203 61 217 68Q228 75 221 100L217 103Q222 80 216 76Q209 71 209 84Q208 104 226 110Z',url(t,'silver'),'#e6b8fb',.8)
    +path('M267 115Q287 101 284 77Q281 59 271 66Q262 73 267 96L271 98Q266 78 272 73Q278 69 278 82Q279 101 264 106Z',url(t,'silver'),'#f0c9f7',.85)
    +path('M221 116Q200 101 205 78Q208 65 215 71M270 109Q285 94 281 77Q278 65 272 70','none','#fff0ff',.6)
    +path('M216 108L272 105Q272 150 257 171Q252 179 246 184Q235 177 227 161Q218 141 216 108Z',url(t,'silver'),'#d7b3e6',1)
    +path('M219 113Q224 156 245 180Q232 152 232 112Z','#5c376e','',1,'opacity=".7"')
    +path('M247 111L259 109Q260 145 248 177Q249 137 247 111Z','#eee0ed','',1,'opacity=".55"')
    +path('M267 110Q265 149 251 172Q262 143 261 110Z','#2d193f','',1,'opacity=".85"')
    +ellipse(244,107,28,6,url(t,'silver'))
    +ellipse(244,106,24,3.7,url(t,'cupInside'))
    +path('M218 111Q244 117 271 108M219 118Q246 124 270 115','none','#f5d9f7',1)
    +path('M222 126Q246 134 266 123M228 152Q246 159 260 150','none','#76578d',.8)
    +path('M242 180L249 180L249 194L255 199L256 204L234 205L235 200L242 195Z',url(t,'silver'),'#f0caf3',.7)
    +ellipse(245,204,15,3.8,url(t,'silver'))
    +path('M233 205L257 205L263 215L228 215Z','#301938','#be89d8',.8)
    +path('M228 214L262 214L264 220L226 220Z',url(t,'silver'),'#e9cef0',.65)
    +ellipse(244,136,8.5,10,'#754583','stroke="#d5b0d4" stroke-width=".8"')
    +path('M244 129L246 134L252 134L248 138L249 144L244 141L239 144L240 138L236 134L242 134Z','#e3c5df')
    +path('M244 131L245 136L249 135L246 139L244 138L242 140L242 136L239 135L243 135Z','#8e5da3');
  for(let i=0;i<7;i++){
    const x=222+i*6.8;
    cup+=path(`M${n(x)} 120Q${n(234+i*3.5)} 160 246 176`,'none',i%2?'#f5daee':'#392044',.45,'opacity=".64"');
  }
  cup+=path('M228 119Q231 124 236 122M253 120Q259 122 263 117M232 158Q238 162 242 159M250 160L255 155','none','#ffefcf',.6)
    +scratches(4122,80,[222,115,47,47],'#fff1fa',.45,1.4)
    +star(218,79,3,'#ffe8ff')+star(269,112,4,'#fff0fd');
  scene+=royalShards('svg','back')+cup;
  const figure=renderFigure('majestic','svg');
  scene+=figure+path('M22 38H91V119H22Z',url(t,'shade'));
  let art=group(scene,`clip-path="${url(t,'card')}"`)+footer(t,'#130b25','#79519c');
  art+=path(shield,'none','#26133b',8)+path(shield,'none',url(t,'gold'),4.5)
    +path(shield,'none','#fff0c6',.65)+path(inset,'none',url(t,'violetEdge'),1.65)
    +path('M28 53Q74 38 111 25M170 25Q223 39 271 53L271 325Q272 337 251 341Q187 344 150 361Q111 344 49 341Q29 338 29 325V53','none','#c99276',.65);
  art+=royalShards('svg','front');
  art+=path('M31 47Q49 22 79 27Q56 28 50 37Q82 28 108 17M192 17Q219 27 249 36Q241 26 222 25Q256 25 269 46','none',url(t,'gold'),1.9)
    +path('M31 337Q47 359 77 352Q103 348 130 366M269 337Q252 358 222 352Q197 348 170 366','none',url(t,'gold'),1.7)
    +path('M37 341Q44 346 53 346M247 347Q258 346 263 341M113 23L121 27M178 27L186 24','none','#fff4cf',.9)
    +path('M143 355L150 347L157 355L150 365Z',url(t,'gold'),'#efd1c0',.6)
    +path('M150 350L153 355L150 360L147 355Z','#8e38bc');
  art+=crest(t,'#e2c7d4',path('M185 274L188 281L196 282L190 287L191 295L185 291L178 295L180 287L174 282L182 281Z','#d4b0e3','#f5e0e7',.5)+path('M185 279L187 283L191 284L188 287L189 290L185 288L181 290L182 286L179 284L183 283Z','#34104c'));
  return root(t,defs,art);
}

function makePrism() {
  const t='prism';
  const defs=lg(t,'footer',[['0','#080e20',0],['.25','#080e20',.75],['.6','#070c1d',.97],['1','#0a1124',1]],0,0,0,1);
  let art=prismSurface('svg','back')+renderFigure(t,'svg')+footer(t,'#0b142ac9','#55759a')+prismSurface('svg','front');
  art+=crest(t,'#c5e9f7',polygon('176,281 180,275 191,275 196,281 185,295','#96c4dc','#edf8fc',.7)
    +polygon('176,281 183,282 185,295','#0f3a69')+polygon('180,275 183,282 189,282 191,275','#d0ecfa')
    +polygon('183,282 189,282 185,295','#476fa3')+polygon('191,275 196,281 189,282','#7197ce')
    +path('M176 281L196 281M183 282L180 275M189 282L191 275','none','#f0fbff',.6));
  return root(t,defs,art);
}

export const svgArt = {
  rivera: makeRivera(),
  drift: makeDrift(),
  majestic: makeMajestic(),
  prism: makePrism(),
};

function crest(...args){return `<g transform="translate(40.3 46.6) scale(.8)">${rawCrest(...args)}</g>`}
