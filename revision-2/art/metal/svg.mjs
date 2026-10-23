import { figureSVG } from './figures.mjs';
// Authored vector drawings. All coordinates are native 300 × 380 art coordinates.
// No fonts, external resources, raster images, filters, or animated effects.
const path = (d, fill = 'none', extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, color, width = 1, opacity = 1) => path(d, 'none', `stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"`);
const ellipse = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const group = (children, extra = '') => `<g ${extra}>${children}</g>`;
const palettes = {
  valor: { light: '#fff4bc', metal: '#eebd4d', mid: '#a77420', deep: '#2d200a', dark: '#090b08', cloth: '#24271d', skin: '#342b16' },
  nexus: { light: '#f8faf8', metal: '#b4bcb9', mid: '#58615e', deep: '#232827', dark: '#070a0c', cloth: '#171d20', skin: '#262b29' },
  aurum: { light: '#fffef8', metal: '#d2a04a', mid: '#a67c37', deep: '#d1c6ae', dark: '#e8e5dc', cloth: '#f7f5ed', skin: '#77776d' },
  legacy: { light: '#ffddb0', metal: '#c18b50', mid: '#79502d', deep: '#332216', dark: '#110d09', cloth: '#453323', skin: '#573a22' },
};
const outerFrame = 'M20 34L30 33C66 30 94 19 122 13C128 29 142 29 150 11C158 29 172 29 178 16C209 20 239 30 270 33L280 34L279 320C278 340 271 347 246 350C209 354 180 355 150 371C120 355 91 354 54 350C29 347 22 340 21 320Z';
const innerFrame = 'M26 38L34 37C68 34 96 24 121 20C129 36 143 35 150 23C158 35 172 36 179 23C207 25 239 35 266 37L274 38L273 319C272 336 267 341 245 345C208 350 178 351 150 364C122 351 92 350 55 345C33 341 28 336 27 319Z';
const innerLine = 'M30 41C67 38 98 29 120 26C129 41 143 39 150 31C158 39 171 41 180 28C208 30 239 39 270 41L269 318C268 332 263 337 244 340C206 346 177 346 150 358C123 346 94 346 56 340C37 337 32 332 31 318Z';

function defs(theme) {
  const c = palettes[theme], id = name => `r2-ms-${theme}-${name}`;
  const lg = (name, stops, xy = 'x1="0" y1="0" x2="1" y2="1"') => `<linearGradient id="${id(name)}" ${xy}>${stops.map(([o,col,a])=>`<stop offset="${o}" stop-color="${col}"${a === undefined?'':` stop-opacity="${a}"`}/>`).join('')}</linearGradient>`;
  const rg = (name, stops, xy = '') => `<radialGradient id="${id(name)}" ${xy}>${stops.map(([o,col,a])=>`<stop offset="${o}" stop-color="${col}"${a === undefined?'':` stop-opacity="${a}"`}/>`).join('')}</radialGradient>`;
  return `<defs>${lg('metal', [[0,c.mid],[.17,c.light],[.29,c.metal],[.48,c.deep],[.61,c.light],[.79,c.mid],[1,c.light]])}${lg('field',[[0,c.deep],[.42,c.dark],[1,c.dark]])}${lg('fade',[[0,c.dark,0],[.38,c.dark,.94],[1,c.dark]],'x1="0" y1="0" x2="0" y2="1"')}${lg('ribbon',[[0,c.deep],[.23,c.dark],[.75,c.dark],[1,c.deep]])}${lg('shard',[[0,c.light],[.05,c.metal],[.23,c.deep],[.65,c.dark],[1,c.metal]])}${lg('marble',[[0,'#fffef8'],[.25,'#e0dfd5'],[.49,'#fbfaf5'],[.73,'#d2d0c5'],[1,'#f6f5ed']])}${rg('halo',[[0,c.metal,.42],[.45,c.mid,.12],[1,c.dark,0]])}${rg('ball',[[0,c.light],[.28,c.metal],[.67,c.mid],[.88,c.deep],[1,c.light]],'cx=".28" cy=".24" r=".82"')}${rg('stoneball',[[0,'#fffef9'],[.52,'#eeece1'],[.84,'#bfb9a7'],[1,'#fff4d9']],'cx=".28" cy=".22" r=".83"')}<clipPath id="${id('inside')}">${path(innerFrame,'white')}</clipPath></defs>`;
}
const fill = (t,n) => `url(#r2-ms-${t}-${n})`;
function dust(theme, count = 52) {
  // Fixed-seed engraved flecks; deliberately sparse authored surface detail.
  let seed = 307;
  const next = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  let d = '';
  for(let i=0;i<count;i++) {
    const x = 36 + next()*228, y = 41 + next()*300, l = .35 + next()*1.5;
    if((x<91&&y<133)||(y>236&&y<344)) continue;
    d += `M${x.toFixed(1)} ${y.toFixed(1)}l${l.toFixed(1)} -${(l*.6).toFixed(1)}`;
  }
  return line(d,palettes[theme].light,.65,.32);
}
function laurel(theme, side, start=136, end=281, count=11) {
  const c=palettes[theme];
  let leaves='',veins='';
  for(let i=0;i<count;i++) {
    const y=start+i*(end-start)/count;
    const x=24+Math.pow((y-202)/89,2)*9;
    const tilt=-25+i*.6;
    // Bake the authored cubic leaf transforms into two batched vector paths.
    // This retains 44 individual leaf silhouettes without 132 DOM nodes.
    for(const [xx,yy,a,sx,sy] of [[x,y,tilt,1,1],[x+2,y+6,34,-.76,.78]]) {
      const rad=a*Math.PI/180;
      const p=(u,v)=>`${(xx+u*sx*Math.cos(rad)-v*sy*Math.sin(rad)).toFixed(2)} ${(yy+u*sx*Math.sin(rad)+v*sy*Math.cos(rad)).toFixed(2)}`;
      leaves+=`M${p(0,0)}C${p(-12,-5)} ${p(-14,-16)} ${p(-12,-24)}C${p(-3,-20)} ${p(3,-9)} ${p(0,0)}Z`;
      veins+=`M${p(0,0)}Q${p(-8,-10)} ${p(-12,-24)}`;
    }
  }
  return group(line(`M30 ${end+9}Q7 213 27 ${start-21}`,c.metal,1.5)+line(`M28 ${end+8}Q9 210 29 ${start-21}`,c.light,.5)+path(leaves,fill(theme,'metal'))+line(veins,c.light,.6,.75),side==='right'?'transform="translate(300 0) scale(-1 1)"':'');
}
function crown(theme,x,y,s=1) {
  const c=palettes[theme];
  return group(path('M-16 0L-19-17L-10-10L-7-24L0-12L7-24L10-10L19-17L16 0Z',fill(theme,'metal'),`stroke="${c.light}" stroke-width=".8"`)+path('M-14-3L-15-10L-8-5L-6-15L0-5L6-15L8-5L15-10L14-3Z',c.dark)+rect(-16,1,32,3,c.metal)+[-19,-7,7,19].map((a,i)=>ellipse(a,[-18,-25,-25,-18][i],1.4,1.4,c.light)).join(''),`transform="translate(${x} ${y}) scale(${s})"`);
}
function rawCrest(theme) {
  const c=palettes[theme];
  if(theme==='aurum')return group(path('M-17-10L0-18L17-10Z',c.mid)+rect(-15,-7,30,2,c.mid)+[-11,-4,3,10].map(x=>rect(x,-4,3,21,c.mid)+line(`M${x+1} -3v19`,c.light,.7)).join('')+rect(-16,19,32,3,c.mid)+rect(-18,23,36,2,c.mid), 'transform="translate(203 292) scale(.8)"');
  if(theme==='legacy') return group(path('M-12 11C-20-4-11-21 5-20C18-18 23-7 19 6L11 3L11-6L2-10L-7-6L-7 4L0 8L0 18L-6 18L-8 8Z',fill(theme,'metal'))+path('M-6-20Q13-27 21-11L15-10Q7-20-6-17Z',c.light)+path('M1-7L9-6L9 7L17 12L14 19L1 15Z',c.metal)+line('M-7-13Q10-19 15-6M-11 0Q-10-9-4-10',c.light,.8), 'transform="translate(202 294) scale(.86)"');
  const lion = 'M-4-9L0-13L3-9L8-10L6-6L8-3L3-2L1 3L6 6L10 4L11 8L5 10L-1 7L-4 10L-10 9L-7 5L-9 1L-5 1L-3 4L-2 0L-5-3L-9-2L-10-5L-4-5Z';
  return group(path('M-16-15Q0-10 16-15L14 5Q9 17 0 22Q-9 17-14 5Z',c.dark,`stroke="${c.metal}" stroke-width="1.4"`)+path('M-12-10L-10 5Q-6 13 0 17Q7 12 10 5L12-10', 'none',`stroke="${c.light}" stroke-width=".5"`)+path(lion,c.metal)+line('M-7 9L-10 14M4-9L7-13',c.light,1), 'transform="translate(202 294) scale(.83)"');
}
function frame(theme) {
  const c=palettes[theme];
  return path(outerFrame,'none',`stroke="${fill(theme,'metal')}" stroke-width="3.5"`)+path(outerFrame,'none',`stroke="${c.light}" stroke-width=".75"`)+path(innerFrame,'none',`stroke="${c.metal}" stroke-width="1.25"`)+path(innerLine,'none',`stroke="${c.light}" stroke-width=".5" opacity=".8"`)+line('M35 139L35 321Q35 334 58 337M265 70L265 321Q265 334 242 337',c.mid,.65,.7)+line('M42 33L82 27M216 27L259 33M60 349Q116 355 150 369Q185 354 241 348',c.light,.9,.9);
}
function footer(theme) {
  const c=palettes[theme], white=theme==='aurum';
  const panel=white?'#eeeae0':fill(theme,'ribbon');
  return rect(32,219,236,123,fill(theme,'fade'))+path('M35 249Q94 228 150 235Q212 231 265 249L261 269Q204 258 150 265Q94 257 39 270Z',panel)+line('M37 247Q96 228 150 235Q211 231 264 247',c.metal,.85,.8)+line('M43 269Q99 258 150 265Q205 258 258 269',c.mid,.65,.5)+line('M40 310H260',c.mid,.55,.24)+crest(theme)+group(line('M0-7V7M-5 0H5M-3-3L3 3M3-3L-3 3',c.metal,.8), 'transform="translate(150 350)"');
}

function valorBackground() {
  const t='valor';
  const facets=[
    'M104 34L120 29L167 132L141 105Z','M99 43L112 47L154 128L124 90Z',
    'M230 26L213 31L180 139L201 105Z','M235 41L246 63L189 142L202 108Z',
    'M268 71L251 112L200 169L220 113Z','M271 111L270 137L210 195L239 144Z',
    'M268 157L268 179L208 220L218 190Z','M44 127L62 134L116 199L78 171Z',
    'M36 169L57 176L115 225L68 204Z','M46 203L68 205L107 239L57 223Z',
    'M213 37L241 55L217 120L223 64Z','M273 82L265 104L233 137L249 97Z',
  ];
  return ellipse(181,138,114,127,fill(t,'halo'))+facets.map((d,i)=>path(d,fill(t,'metal'),`stroke="#ffefac" stroke-width="${i%3?.65:1}"`)).join('')+
    line('M105 34L152 118M230 27L190 122L247 63M267 72L220 148L270 115M44 127L91 177L47 165M38 171L86 207L51 202M233 137L263 124L247 161L271 149M114 57L129 64L126 83M214 64L234 76L221 96','#fff3b0',.85,.8)+
    path('M218 41L212 74L200 105L201 77Z','#fff6b1','opacity=".8"')+path('M246 90L237 120L220 145L226 121Z','#ffefad','opacity=".7"');
}
function nexusBackground() {
  const t='nexus';
  const shards=['M36 52L80 37L61 67Z','M84 42L125 29L113 78Z','M128 33L146 105L158 49Z','M176 39L214 45L195 111Z','M219 48L265 65L225 133Z','M261 71L259 139L217 168Z','M267 149L249 213L225 190Z','M263 215L243 243L264 263Z','M38 139L102 178L42 187Z','M39 194L94 213L37 247Z','M52 81L88 124L42 115Z'];
  return ellipse(178,142,117,123,fill(t,'halo'))+shards.map((d,i)=>path(d,fill(t,'shard'),`opacity="${.38+(i%4)*.14}" stroke="#cdd3d0" stroke-width=".65"`)).join('')+line('M36 92L59 96L70 114L85 112L112 141L134 157M60 98L64 77L52 61M78 110L102 99L109 75L122 66M260 77L233 93L231 111L207 138L193 139M233 93L218 86L213 65M249 163L229 165L215 184L192 198M262 221L235 216L225 231L209 240M42 203L65 194L79 202L94 194M67 195L62 178L51 173M111 48L122 66L145 69M143 37L150 53L147 68','#ecf1ed',1,.64)+line('M35 91L57 94L69 112L85 110M259 76L231 91L229 110L205 137M42 205L65 196L79 204','#4c5657',2,.7)+crown(t,150,52,.8);
}
function aurumBackground() {
  const veins='M48 48L62 69L57 83L72 106L64 128L74 143M62 69L78 72L91 86M57 83L43 96L40 122M227 45L219 72L231 84L225 107L241 129L234 153M219 72L200 78L196 94M241 129L260 135L265 159M46 188L64 201L68 223L91 238M64 201L79 192L93 204M251 216L232 231L239 252L221 270M239 252L258 267L254 288M49 301L59 316L54 336M254 312L237 329L242 341';
  return path(innerFrame,fill('aurum','marble'))+line(veins,'#b9ad91',1,.5)+line(veins,'#fefdf4',.38,.8)+line('M48 48L62 69L57 83M72 106L64 128L74 143M227 45L219 72M225 107L241 129L234 153M232 231L239 252L221 270M46 188L64 201L68 223','#cba75e',1.1,.85)+line('M90 45L99 60L108 63M94 153L107 162L99 181M192 48L187 63M231 174L245 181L254 176M96 321L102 335M181 345L188 339','#c7c3b5',.6,.4)+ellipse(163,163,137,37,'none','stroke="#a8792d" stroke-width="4" transform="rotate(-32 163 163)"')+ellipse(163,162,137,37,'none','stroke="#ffe7ac" stroke-width="1.4" transform="rotate(-32 163 162)"')+ellipse(154,207,131,30,'none','stroke="#c49b53" stroke-width="2.4" transform="rotate(-22 154 207)"');
}
function aurumFront() {
  return path('M44 223C80 214 238 148 276 167C299 185 133 263 56 265','none','stroke="#ba8635" stroke-width="3"')+path('M43 222C80 213 238 147 276 166C299 184 133 262 56 264','none','stroke="#fff0bc" stroke-width="1.1"')+
    ellipse(25,174,18,21,fill('aurum','stoneball'),'stroke="#c49b55" stroke-width=".8"')+line('M19 155L23 163L21 170L28 177L27 188M9 177L18 174M27 164L37 161','#bc944d',.65,.7)+
    ellipse(274,203,17,20,fill('aurum','stoneball'),'stroke="#c49b55" stroke-width=".8"')+line('M272 184L270 197L278 204L275 218M279 194L287 197','#c19a56',.7,.8)+
    ellipse(238,118,9,11,fill('aurum','ball'),'stroke="#ebcf8e" stroke-width=".7"');
}

function colosseum() {
  let s=path('M180 93Q223 66 267 64L267 222L173 234Z','#785330');
  const rows=[{y:87,h:27},{y:124,h:30},{y:166,h:34}];
  for(let r=0;r<rows.length;r++){
    const {y,h}=rows[r];
    s+=path(`M178 ${y+7}Q223 ${y-13} 268 ${y-17}L268 ${y-10}Q222 ${y-6} 178 ${y+14}Z`,'#d5a773');
    for(let j=0;j<6;j++){
      const x=177+j*15, yy=y+8-j*3.0, ww=6.5+j*.85,hh=h-6+j*.8;
      s+=path(`M${x} ${yy+hh}V${yy+7}Q${x+ww/2} ${yy-2} ${x+ww} ${yy+6}V${yy+hh}Z`,j%3?'#2d2115':'#44331f',`stroke="#b78d5f" stroke-width="1.2"`);
      s+=line(`M${x+ww+2} ${yy+2}v${hh+2}`,'#e8b786',1,.6);
      s+=line(`M${x+2} ${yy+9}v${hh-11}`,'#6c4d2e',1.4,.9);
    }
  }
  s+=line('M182 222L267 200M178 211L267 190M183 105L267 77M181 147L267 119M178 187L267 157','#e6bd8a',1.2,.65);
  s+=line('M203 76L205 87M236 66L238 80M222 117L224 130M251 151L253 165M193 153L195 165','#3f2c19',1,.7);
  s+=line('M228 77L230 83L227 88L232 94M258 110L252 115L253 125L249 132M237 148L233 157L236 161L234 170M260 172L256 178L257 186M207 99L210 105M218 166L222 171','#50371e',.7,.75);
  s+=line('M204 83L209 82M244 69L248 68M251 102L259 100M225 142L231 140M244 182L251 180M230 205L236 203','#ecc38e',.65,.6);
  return s;
}
function legacyBackground() {
  return ellipse(184,149,115,130,fill('legacy','halo'))+path('M36 201L58 172L70 182L82 164L105 176L125 159L149 171L170 162L182 200Z','#64442a')+colosseum()+
    line('M45 58L57 69L51 92L65 108M52 92L40 104M220 40L216 54L225 60M84 43L81 59L93 72M240 231L226 243L234 257','#cfa174',.8,.65)+
    path('M36 228L63 211L88 219L105 208L132 227L160 216L185 232L214 216L241 231L269 217L268 266L33 268Z','#735033')+line('M36 228L63 217L77 228L91 225M215 231L234 236L251 231M45 245L63 236L85 246M191 244L214 240L224 250','#d3a375',1,.6);
}
function make(theme) {
  const c=palettes[theme];
  let content = defs(theme)+ellipse(150,202,146,174,fill(theme,'halo'))+path(outerFrame,fill(theme,'field'));
  const background={valor:valorBackground,nexus:nexusBackground,aurum:aurumBackground,legacy:legacyBackground}[theme]();
  const player=figureSVG(theme);
  content+=group(background+dust(theme,88),`clip-path="url(#r2-ms-${theme}-inside)"`);
  // Quiet upper-left field gives live rating/position sufficient contrast.
  if(theme!=='aurum') content+=path('M34 62L91 45L100 123L34 137Z',fill(theme,'fade'),'opacity=".7"');
  content+=player;
  content+=footer(theme)+frame(theme);
  if(theme==='valor'||theme==='legacy') content+=laurel(theme,'left',theme==='valor'?141:149,282,11)+laurel(theme,'right',theme==='valor'?141:149,282,11);
  if(theme==='aurum') content+=aurumFront();
  if(theme==='nexus') content+=line('M22 74L17 89L24 121M22 190L17 206L23 225M278 90L283 115L277 135M277 239L283 255L276 277M73 36L83 30L94 33M213 35L226 37L240 43',c.light,.9,.7);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380" aria-hidden="true" focusable="false">${content}</svg>`;
}
export const svgArt = Object.fromEntries(Object.keys(palettes).map(theme=>[theme,make(theme)]));

function crest(...args){return `<g transform="translate(40.3 46.6) scale(.8)">${rawCrest(...args)}</g>`}
