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
const shield = 'M19 44 Q65 30 112 14 Q129 30 143 11 Q151 27 164 14 Q215 28 281 44 L281 327 Q281 349 255 352 Q184 356 150 373 Q114 356 45 352 Q19 350 19 327 Z';
const inset = 'M25 49 Q72 34 112 21 Q130 35 143 21 Q152 35 165 21 Q221 36 275 49 L275 326 Q275 342 252 345 Q186 348 150 365 Q111 349 48 345 Q25 343 25 326 Z';
const root = (theme, defs, content) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380" aria-hidden="true" focusable="false"><defs><clipPath id="${theme}-bounds"><path d="M0 0H300V380H0Z"/></clipPath>${defs}</defs><g clip-path="${url(theme, 'bounds')}">${content}</g></svg>`;

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
function curlyHair(theme, seed, base = '#090b1b', rim = '#6adfff') {
  const silhouette = 'M148 93Q143 91 144 86L141 82L143 78L140 74L143 70L142 66L146 62L146 58L152 55L153 51L158 51L162 47L168 48L173 45L178 48L183 46L188 50L192 50L194 55L199 57L198 62L201 66L199 71L201 75L198 80L199 84L196 88Q197 96 191 100L188 106Q179 111 170 108L161 105Q156 102 152 97Z';
  const rand = rng(seed); let curls = '', highlights = '';
  for (let i = 0; i < 360; i++) {
    const x = 141 + rand() * 60, y = 46 + rand() * 62, s=.5+rand()*1.3;
    curls += `M${n(x)} ${n(y)}q${n(-s)} ${n(-s*1.7)} ${n(s*.8)} ${n(-s*1.4)}q${n(s)} ${n(s*.8)} ${n(s*.15)} ${n(s*1.35)}`;
  }
  for (let i = 0; i < 59; i++) {
    const a = Math.PI*.9 + i / 58 * Math.PI*1.2, x = 170 + Math.cos(a) * (27+rand()*2), y = 77 + Math.sin(a) * (28+rand()*2);
    highlights += `M${n(x)} ${n(y+rand()*2)}q${n(-1+rand()*1.5)} ${n(-1-rand()*2)} ${n(.3+rand()*1.8)} ${n(-1-rand()*2)}`;
  }
  return `<defs>${clip(theme, 'hair', silhouette)}${lg(theme,'hairTone',[['0','#30324b'],['.3',base],['.8','#131422'],['1','#29233c']],0,0,1,.8)}</defs>`
    + path('M152 94Q167 100 191 96L188 109L181 117L166 114L157 106Z',url(theme,'skin'),'#5a5274',.4)
    + path('M155 99Q171 110 188 104L182 113L168 111Z',base)
    + path(silhouette, url(theme,'hairTone'), rim, .6)
    + group(path(curls, 'none', '#7b79a0', .45, 'opacity=".4"') + grain(seed+2, 290, [141,47,61,62], rim, .19), `clip-path="${url(theme,'hair')}"`)
    + path(highlights, 'none', rim, .65, 'opacity=".75"')
    + path('M148 86Q151 96 157 100M190 101L186 106','none',rim,.45,'opacity=".65"');
}

function clothRelief(theme, color, attrs='') {
  // Long curved wedges and short tension creases make the jersey read as cloth.
  const ridges=[
    'M119 144Q132 143 141 139Q125 149 126 164Q122 150 119 144Z',
    'M147 142Q170 149 187 136Q174 151 158 149Z',
    'M136 155Q137 172 133 183Q132 176 133 170Z',
    'M149 153Q143 170 149 188Q155 205 151 219Q158 202 152 185Q147 166 153 153Z',
    'M183 149Q176 170 184 188Q181 166 188 150Z',
    'M194 151Q200 158 201 172Q204 161 197 151Z',
    'M125 180Q121 199 126 214L122 229Q123 210 119 202Z',
    'M133 198Q134 211 143 222Q136 208 137 202Z',
    'M173 199Q179 212 176 227L171 240Q180 229 182 219Z',
    'M194 202Q204 216 200 236L205 239Q207 219 194 202Z',
    'M209 180Q204 191 210 203L210 217Q214 200 209 195Z',
    'M119 229Q129 232 137 243L128 238Z',
    'M101 158Q106 151 117 150L107 157L98 172Z',
    'M210 143Q223 152 230 168L225 165Q217 149 210 146Z',
  ];
  const details=path('M127 151Q123 161 125 170M151 157Q147 168 151 183M183 155Q180 164 183 174M124 184Q122 193 124 202M175 206Q179 215 177 222M197 211Q202 223 201 230M107 155L102 163','none',color,.45,'opacity=".55"')
    +path('M129 148L123 158M191 144L200 154M135 224L141 234M118 213L119 222M192 227L197 235','none',color,.65,'opacity=".4"');
  return group(ridges.map(d=>path(d,url(theme,'clothLight'))).join('')+details,attrs);
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
  let player = path('M153 105Q170 114 190 102L190 125L204 135Q173 155 139 136L152 121Z',url(t,'skin'),'#6a8eae',.6)
    + path('M158 109L159 127L169 136L169 113Z','#313052')
    + path('M182 110L183 124L177 135L191 127L190 105Z','#a74e93', '',1,'opacity=".6"')
    + path('M93 164Q100 168 113 180L94 202Q79 211 54 216L47 212L52 204L79 191Z',url(t,'skin'),'#26d9ed',.8)
    + path('M95 177Q89 193 73 199L53 207L52 211L80 204L101 186Z','#35234f')
    + path('M231 171Q248 168 256 181L268 202Q270 207 264 214L244 238L234 235L250 207L236 191Z',url(t,'skin'),'#d741d0',.9)
    + path('M255 187L262 204L248 225L250 211L244 193Z','#15132c')
    + path('M249 226L243 236L233 244L226 240L235 232L238 224Z','#28213f','#5c5699',.6)
    + path(torso,url(t,'shirt'),'#80d7f2',.8);
  const folds = [
    ['M120 141L151 135L132 151L116 172L104 174Z','#46316e'],
    ['M148 139Q165 144 184 136L177 147L151 147L132 159Z','#24183f'],
    ['M188 132L207 138L227 156L209 150L194 144Z','#673476'],
    ['M126 155Q121 183 131 205L121 231L119 204Z','#702e83'],
    ['M139 151L147 173L138 212L147 238L133 235L134 205Z','#301c55'],
    ['M174 149L169 190L178 223L169 241L166 206Z','#080e24'],
    ['M195 149L196 179L208 208L205 239L193 226L193 188L182 170Z','#3e245e'],
    ['M207 147L221 155L239 170L227 179L217 169Z','#201a49'],
    ['M213 180L208 197L213 223L216 206Z','#9b3896'],
    ['M124 211L137 218L146 242L117 242Z','#251641'],
  ];
  player += folds.map(([d,c])=>path(d,c)).join('') + clothRelief(t,'#db9bdc');
  // A continuous electric sash wraps the back and both shoulder sleeves.
  player += group(path('M88 190L244 145L250 154L91 198Z','#f547d0')
    + path('M87 190L245 148L245 153L89 196Z','#2defff')
    + path('M108 186L232 152','none','#ddfdff',1.2)
    + path('M111 197L221 168','none','#ae46e4',.8)
    + path('M119 206L219 180','none','#ed4de6',.6,'opacity=".7"')
    + grain(651,1100,[88,126,165,120],'#e884e7',.11)
    + scratches(652,170,[91,129,160,114],'#aa7cbd',.21,2.5),`clip-path="${url(t,'shirtClip')}"`);
  player += path('M120 142Q128 151 126 168M212 136Q202 152 215 174M116 174L110 180M228 178L248 168','none','#d267dd',1.1)
    + path('M122 143Q130 155 128 169M210 138Q203 152 214 172','none','#d5abed',.45,'stroke-dasharray="1.5 1.8"')
    + path('M144 126Q162 140 185 125L192 129Q166 148 140 132Z','#261847','#7c52c5',1)
    + path('M147 129Q165 140 185 128','none','#beeaff',.8)
    + path('M130 152Q135 174 129 188M141 154L151 170M190 154Q183 181 191 206M139 207L145 228M201 209L206 235','none','#a34ca8',.65)
    + path('M131 156L134 176M189 157L188 177M198 217L204 230M119 218L117 233','none','#b7a0e1',.5,'opacity=".7"')
    + path('M151 91Q148 87 148 93L150 103Q153 108 156 105M194 89Q198 85 198 92L195 102Q192 106 191 102',url(t,'skin'),'#a4559d',.6)
    + curlyHair(t,91,'#101125','#46e5ff');
  let art = group(sky + player + path('M22 37H86V116H22Z',url(t,'shade')),`clip-path="${url(t,'card')}"`);
  art += footer(t,'#10102b','#794a94');
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
  let figure=path('M102 173L83 187L69 217L82 226L107 203L118 179Z',url(t,'cloth'),'#a3a79f',.75)
    +path('M77 203L83 207L75 221L69 218Z','#cecbbb')
    +path('M242 178L259 189L273 213L260 233L247 229L255 211L232 199Z',url(t,'cloth'),'#b9b7ac',.7)
    +path(body,url(t,'cloth'),'#c0c5bd',1.05);
  const panels=[
    ['M111 153L137 139L132 154L113 182L102 208L109 176Z','#616968'],
    ['M120 155L144 145L137 178L130 197L125 231L113 243L117 201Z','#222c32'],
    ['M144 146L160 155L153 188L154 242L132 243L142 206Z','#11171c'],
    ['M177 143L201 132L219 144L204 163L200 196L217 239L174 244L184 202Z','#11181e'],
    ['M206 140L221 146L240 170L248 187L236 182L218 163Z','#727874'],
    ['M208 155L216 155L232 179L223 188L220 170Z','#242d33'],
    ['M219 191L215 210L228 237L218 221Z','#686b65'],
    ['M112 201L105 223L113 237L119 221Z','#4f5856'],
    ['M160 189L165 215L163 243L155 242Z','#5c605a'],
    ['M183 196L194 222L187 242L178 242Z','#282d30'],
  ];
  figure+=panels.map(([d,c])=>path(d,c)).join('') + clothRelief(t,'#cbd1bd');
  figure+=group(grain(3601,1600,[80,130,184,114],'#c2c5b9',.14)
    +scratches(3602,310,[82,133,178,112],'#bdc2b8',.2,2)
    +path('M119 160L114 178M126 170L117 197M134 153L129 174M220 151L236 177M225 190L221 205M107 215L111 228M188 211L197 230M169 175L174 191','none','#d2d3c3',.65),`clip-path="${url(t,'body')}"`);
  figure+=path('M113 151Q124 159 118 178M220 144Q209 155 220 181M109 208L130 214M190 211L214 208','none','#969c91',1)
    +path('M111 153Q121 161 115 178M218 144Q207 157 218 181M110 210L129 216M192 213L214 210','none','#d5d7c9',.45,'stroke-dasharray="1.2 1.9"')
    +path('M119 228L146 215L150 237M174 237L180 215L209 224','none','#7b8681',.65)
    +path('M121 230L144 220M181 219L205 226','none','#b0b5a9',.45)
    +path(hood,url(t,'hoodLight'),'#e5e4d7',1.15);
  // Hood has an exterior shell, rolled opening, lining, and a recessed face plane.
  figure+=path('M128 120Q130 91 146 65Q157 49 166 45Q178 51 186 69Q196 83 202 106L193 125L182 138L149 140Z','#3c4446')
    +path('M133 118Q135 95 150 74Q161 61 171 66Q185 75 197 104Q194 123 177 136L152 133Z',url(t,'face'),'#a5ada2',1.1)
    +path('M136 118Q149 92 169 83L190 95L197 106Q191 120 177 131L154 132Z','#060b10')
    +path('M180 86L189 95L189 105L195 111L189 116L188 123L178 129L172 124L180 119L182 108Z','#1e292d')
    +path('M190 105L195 111L189 113M185 118L189 119M173 128L179 130','none','#52615d',.6,'opacity=".65"')
    +path('M126 121Q129 90 145 62L165 44L155 63L139 90Z','#bfc2b5')
    +path('M144 67L164 48L171 58L153 66Z','#edf0e1')
    +path('M140 82L159 69L178 75L166 64L157 62Z','#737c78')
    +path('M131 104L147 86L160 81L148 93L133 119Z','#777f79')
    +path('M177 55L188 72L194 94L187 87L180 66Z','#171d23')
    +path('M196 93L204 108L198 124L189 132L197 113Z','#656d67')
    +path('M125 122L143 136L166 142L150 150L131 139Z','#92998e')
    +path('M137 132L151 136L177 140L166 150L147 144Z','#2b3638')
    +path('M130 119Q139 83 159 72Q171 65 182 83','none','#f2f0dc',1.5)
    +path('M128 119Q139 79 158 69M132 124L146 137M148 58L166 46M177 58L187 76','none','#e4e5d5',.65)
    +group(grain(3605,850,[122,44,85,104],'#d9d9c7',.18)+scratches(3607,95,[124,48,79,94],'#eff0e0',.25,1.5),`clip-path="${url(t,'hoodShell')}"`)
    +path('M146 145Q143 171 138 190M184 138Q188 161 185 183','none','#04090d',3)
    +path('M145 145Q142 168 137 189M183 139Q187 163 184 181','none','#cacabe',1.35)
    +path('M136 188L135 196M183 181L183 188','none','#eeeddd',2.2)
    +path('M163 153L161 239','none','#a1a89e',.8)
    +path('M166 157L164 239','none','#525e5b',1.3,'stroke-dasharray="1.2 1.8"')
    +path('M157 158L169 157L168 165L157 166Z','#9ea69b','#151b21',.7)
    +path('M161 161L165 160L165 163L161 163Z','#1c292b');
  // Small nonverbal brush scars printed across the cloth, following its folds.
  figure+=path('M117 191L127 177L121 203M120 195L132 190M194 170L202 179L195 191M193 185L207 179M171 203L179 190L177 211','none','#dedfd0',1.8,'opacity=".72"')
    +path('M119 190L125 181M195 172L201 180M175 198L178 193','none','#fff8e0',.5);
  art+=figure + path('M22 39H93V119H22Z',url(t,'shade'));
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
  scene+=cup;
  let figure=path('M154 106L156 128L142 136L167 148L192 134L185 121L187 105Z',url(t,'skin'),'#b482d7',.6)
    +path('M158 113L164 130L174 136L166 111Z','#513560')
    +path('M181 111L180 126L188 133L185 115Z','#ce8cef')
    +path('M84 172Q98 175 107 186L94 206L73 231L60 228L66 215L82 192Z',url(t,'skin'),'#cf9cee',.7)
    +path('M86 190L94 186L89 206L74 224L69 224Z','#3f2659')
    +path('M219 175L234 174L249 197L244 221L233 239L222 233L231 209L221 194Z',url(t,'skin'),'#c890ee',.65)
    +path('M234 194L242 205L234 225L231 225L237 207Z','#301741')
    +path(body,url(t,'cloth'),'#d5a4f3',1.1);
  const panels=[
    ['M111 141L146 131L138 146L109 161L92 178L82 176Z','#75518f'],
    ['M145 140L167 143L184 135L175 155L150 155L129 169Z','#3f235d'],
    ['M195 132L211 141L226 163L214 155L198 149Z','#81459a'],
    ['M113 161L126 157L121 187L127 217L117 240L106 242L113 209Z','#4b2a63'],
    ['M132 160L148 157L140 184L144 212L155 240L137 244L131 207Z','#251639'],
    ['M162 156L169 163L166 200L175 227L169 244L161 242L158 211Z','#0d0c20'],
    ['M183 151L194 152L188 174L197 201L193 225L207 242L189 242L181 216L182 186Z','#3b2157'],
    ['M202 156L211 165L206 187L211 214L206 220L201 194Z','#a957c1'],
    ['M121 220L131 231L127 245L116 245Z','#774895'],
  ];
  figure+=panels.map(([d,c])=>path(d,c)).join('') + clothRelief(t,'#e4b4f2');
  figure+=group(grain(4200,1450,[82,132,159,113],'#cfaae6',.12)
    +scratches(4201,230,[83,137,150,109],'#a99bbe',.2,2.3),`clip-path="${url(t,'body')}"`);
  figure+=path('M143 127Q161 139 185 125L193 132Q166 148 137 136Z','#251338','#a16ac5',.9)
    +path('M144 131Q164 142 186 130','none','#f1c5ff',.9)
    +path('M112 144Q122 153 114 176M209 138Q201 153 212 174M79 176L97 187M220 183L233 173','none','#d09ce5',1.05)
    +path('M110 146Q119 154 112 175M207 140Q199 153 210 174','none','#f0c4f7',.4,'stroke-dasharray="1.4 1.6"')
    +path('M131 151L128 170M141 153Q146 169 140 183M181 151Q175 167 183 185M190 201L196 224M120 197L122 213M151 221L156 240','none','#a16ebe',.8)
    +path('M132 154L130 168M140 159L142 174M181 155L180 171M189 203L193 217M121 226L124 236','none','#edb6fa',.45)
    +path('M151 91Q147 88 148 96L151 105Q155 109 157 104M194 89Q198 87 198 95L194 104Q190 108 189 103',url(t,'skin'),'#d5a0f6',.55)
    +curlyHair(t,4138,'#161022','#e0b1ff');
  // Embroidered star points are nonverbal, small and placed with the fabric.
  [[143,184,4],[168,171,5],[189,192,3],[159,218,4],[123,203,2.8]].forEach(([x,y,r])=>figure+=star(x,y,r,'#bb7fea',.35));
  scene+=figure+path('M22 38H91V119H22Z',url(t,'shade'));
  let art=group(scene,`clip-path="${url(t,'card')}"`)+footer(t,'#130b25','#79519c');
  art+=path(shield,'none','#26133b',8)+path(shield,'none',url(t,'gold'),4.5)
    +path(shield,'none','#fff0c6',.65)+path(inset,'none',url(t,'violetEdge'),1.65)
    +path('M28 53Q74 38 111 25M170 25Q223 39 271 53L271 325Q272 337 251 341Q187 344 150 361Q111 344 49 341Q29 338 29 325V53','none','#c99276',.65);
  // Long acanthus curls and inset diamonds give the frame an engraved edge.
  for(const side of [0,1]){
    let ornaments='';
    ornaments+=path('M20 73Q2 86 14 104Q28 118 16 132Q8 143 18 154Q31 170 16 187Q5 199 17 213Q30 230 16 247Q5 261 18 276Q29 290 17 307Q8 322 24 336','none',url(t,'gold'),1.6)
      +path('M18 64Q30 82 18 95Q8 107 19 120Q28 133 19 148M19 283Q9 298 22 313Q28 324 24 335','none','#d29a6c',.6);
    for(let i=0;i<8;i++){
      const y=80+i*32;
      ornaments+=path(`M19 ${y}Q9 ${y-8} 7 ${y-19}Q21 ${y-13} 20 ${y-2}Q25 ${y-12} 29 ${y-13}Q27 ${y-1} 19 ${y}Z`,url(t,'gold'),'#f3c891',.45)
        +path(`M18 ${y-2}L11 ${y-13}M20 ${y-2}L26 ${y-9}`,'none','#5d3c55',.6)
        +polygon([[16,y+5],[20,y+10],[16,y+15],[12,y+10]],url(t,'violetEdge'),'#e7b7ff',.45)
        +circle(21,y+18,.85,'#ffebbe');
    }
    art+=group(ornaments,side?'transform="translate(300 0) scale(-1 1)"':'');
  }
  art+=path('M31 47Q49 22 79 27Q56 28 50 37Q82 28 108 17M192 17Q219 27 249 36Q241 26 222 25Q256 25 269 46','none',url(t,'gold'),1.9)
    +path('M31 337Q47 359 77 352Q103 348 130 366M269 337Q252 358 222 352Q197 348 170 366','none',url(t,'gold'),1.7)
    +path('M37 341Q44 346 53 346M247 347Q258 346 263 341M113 23L121 27M178 27L186 24','none','#fff4cf',.9)
    +path('M143 355L150 347L157 355L150 365Z',url(t,'gold'),'#efd1c0',.6)
    +path('M150 350L153 355L150 360L147 355Z','#8e38bc');
  art+=crest(t,'#e2c7d4',path('M185 274L188 281L196 282L190 287L191 295L185 291L178 295L180 287L174 282L182 281Z','#d4b0e3','#f5e0e7',.5)+path('M185 279L187 283L191 284L188 287L189 290L185 288L181 290L182 286L179 284L183 283Z','#34104c'));
  return root(t,defs,art);
}

function crystalShard(theme, points, center, index) {
  const fills=[url(theme,'ice'),url(theme,'spectral'),url(theme,'deepGlass'),'#90e6fc','#182d6b','#d5efff','#6163c7','#3eb1dc'];
  let out=polygon(points,'#11304d','#e3f9ff',.7);
  for(let i=0;i<points.length;i++){
    out+=polygon([points[i],points[(i+1)%points.length],center],fills[(index+i)%fills.length],'#bbe4ff',.35);
  }
  out+=path(`M${points[0][0]} ${points[0][1]}L${center[0]} ${center[1]}L${points[2][0]} ${points[2][1]}`,'none','#f2fcff',.75);
  return out;
}
function makePrism() {
  const t='prism';
  const panel='M31 43L107 21L137 29L164 19L239 29L271 52L274 326L249 351L191 355L151 373L110 356L46 351L25 328L24 78Z';
  const torso='M150 126L176 126L192 134L207 140Q223 150 235 171L223 191L213 184L217 211L222 243L103 243L101 211L109 175L99 189L79 180Q92 153 116 142Z';
  const head='M146 74Q147 56 161 49Q179 42 192 54L201 69L200 82L207 94L212 100L204 104L205 112L198 121L184 125L179 137L155 132L155 115L148 103Z';
  const defs=clip(t,'card',panel)+clip(t,'torso',torso)+clip(t,'head',head)
    +lg(t,'base',[['0','#15233f'],['.3','#214767'],['.6','#1d2443'],['1','#070d22']],0,0,1,1)
    +lg(t,'ice',[['0','#f4fbff'],['.23','#8fe5ff'],['.5','#639fe3'],['.73','#eef6ff'],['1','#45b6e2']],0,0,1,.7)
    +lg(t,'spectral',[['0','#7dedff'],['.17','#87baf2'],['.34','#ba7bec'],['.51','#f6a2ef'],['.66','#fff5ad'],['.82','#8fe7f1'],['1','#4faaf2']],0,0,1,1)
    +lg(t,'deepGlass',[['0','#3ab4dc'],['.25','#1e3a78'],['.55','#70368b'],['.8','#162944'],['1','#d193e4']],0,0,1,.8)
    +lg(t,'shirt',[['0','#3485a5'],['.15','#18253d'],['.4','#0c1326'],['.65','#1c1a31'],['.85','#34285c'],['1','#d08ccd']],0,0,1,.5)
    +lg(t,'skin',[['0','#509da8'],['.15','#172a3e'],['.6','#0c1526'],['.85','#293155'],['1','#674887']],0,0,1,.25)
    +lg(t,'footer',[['0','#080e20',0],['.23','#080e20',.92],['.6','#070c1d',.98],['1','#0a1124',1]],0,0,0,1)
    +lg(t,'shade',[['0','#10172b',.98],['.84','#131c35',.94],['1','#131c35',0]],0,0,1,0)
    +rg(t,'aura','#b7e5ff',.65)+rg(t,'magenta','#dd78ef',.65);
  let scene=path(panel,url(t,'base'))+ellipse(179,115,119,113,url(t,'aura'));
  // The rear crystal field is a fully authored polygon composition. Each piece
  // has a separate refractive face; there is no bitmap sampling or triangulation.
  const rear=[
    [[[29,53],[83,38],[106,78],[53,115]],[68,76],0],
    [[[79,38],[116,21],[135,58],[106,78]],[112,48],2],
    [[[116,21],[164,17],[149,74],[135,58]],[141,43],3],
    [[[164,17],[211,35],[190,77],[149,74]],[176,51],1],
    [[[211,35],[261,41],[238,89],[190,77]],[224,60],4],
    [[[261,41],[276,102],[238,89]],[261,75],0],
    [[[53,115],[106,78],[105,139],[66,161]],[83,122],5],
    [[[106,78],[149,74],[139,123],[105,139]],[125,101],2],
    [[[190,77],[238,89],[212,133],[180,122]],[217,104],0],
    [[[238,89],[276,102],[267,161],[212,133]],[250,128],1],
    [[[29,123],[53,115],[66,161],[31,201]],[44,157],6],
    [[[66,161],[105,139],[108,198],[61,219]],[82,178],2],
    [[[212,133],[267,161],[233,198],[204,181]],[237,168],5],
    [[[267,161],[278,211],[253,244],[233,198]],[265,202],1],
    [[[31,201],[61,219],[47,266],[28,254]],[43,230],0],
    [[[47,266],[61,219],[99,236],[84,278]],[69,252],2],
    [[[233,198],[253,244],[223,272],[208,228]],[231,235],0],
  ];
  rear.forEach(([p,c,i])=>scene+=crystalShard(t,p,c,i));
  scene+=ellipse(178,115,57,81,url(t,'magenta'))
    +path('M106 34L204 230M128 27L250 244M36 175L270 72','none','#effcff',.7,'opacity=".36"')
    +path('M50 90L127 37L112 98L75 161M236 50L229 93L266 130L247 166M54 161L42 203L61 219','none','#e7f5ff',.55,'opacity=".8"')
    +grain(5100,700,[28,24,246,315],'#d9eeff',.18);
  let figure=path('M107 172L89 183L76 205L61 228L73 239L96 220L117 188Z',url(t,'skin'),'#8ad8f5',.7)
    +polygon('81,202 96,189 91,212 72,233 65,229','#203e52','#7bd7e8',.35)
    +polygon('96,189 106,177 109,188 91,212','#3d6d83')
    +path('M226 173L237 178L250 199L245 218L232 240L220 234L232 209L219 193Z',url(t,'skin'),'#c7a5e5',.6)
    +polygon('236,187 246,200 236,223 235,209','#5a426c','#e9bfed',.4)
    +path(torso,url(t,'shirt'),'#c3e7f5',.9);
  const clothFacets=[
    ['116,142 150,126 137,151','#8bbccd'],
    ['116,142 137,151 109,167','#284c68'],
    ['116,142 109,167 87,178','#144963'],
    ['137,151 150,126 157,153','#183244'],
    ['150,126 176,126 157,153','#183546'],
    ['176,126 192,134 177,155','#59446b'],
    ['176,126 177,155 157,153','#14233b'],
    ['192,134 207,140 204,156','#a08cc2'],
    ['192,134 204,156 177,155','#3d2f57'],
    ['207,140 225,157 204,156','#e3deeb'],
    ['225,157 235,171 218,176','#7b6aa4'],
    ['225,157 218,176 204,156','#282c50'],
    ['235,171 223,191 218,176','#254a6d'],
    ['109,167 137,151 129,181','#3f87ac'],
    ['109,167 129,181 110,197','#102f45'],
    ['137,151 157,153 146,180','#0a192b'],
    ['137,151 146,180 129,181','#24314d'],
    ['157,153 177,155 169,177','#12384d'],
    ['157,153 169,177 146,180','#112131'],
    ['177,155 204,156 191,179','#1d2241'],
    ['177,155 191,179 169,177','#3a2246'],
    ['204,156 218,176 191,179','#546590'],
    ['218,176 213,184 215,203 191,179','#151f3c'],
    ['110,197 129,181 128,205','#216887'],
    ['110,197 128,205 103,222','#35516a'],
    ['129,181 146,180 128,205','#0e1b2c'],
    ['146,180 157,199 128,205','#1c3954'],
    ['146,180 169,177 157,199','#155371'],
    ['169,177 191,179 182,202','#070e22'],
    ['169,177 182,202 157,199','#302842'],
    ['191,179 215,203 195,213','#321e43'],
    ['191,179 195,213 182,202','#492c5d'],
    ['103,222 128,205 125,242','#12263e'],
    ['128,205 157,199 146,230','#0a1227'],
    ['128,205 146,230 125,242','#22324c'],
    ['157,199 182,202 169,226','#25354f'],
    ['157,199 169,226 146,230','#142138'],
    ['182,202 195,213 169,226','#53517c'],
    ['195,213 215,203 222,243','#342845'],
    ['195,213 222,243 198,242','#1b122c'],
    ['169,226 195,213 198,242','#262d53'],
    ['125,242 146,230 169,226 171,243','#142a44'],
    ['169,226 198,242 171,243','#131c35'],
  ];
  figure+=clothFacets.map(([p,c])=>polygon(p,c,'#9dc8e8',.28)).join('');
  figure+=group(polygon('109,167 137,151 125,172 110,185',url(t,'spectral'))
    +polygon('177,155 204,156 197,164','#cf87e1')
    +polygon('169,177 182,202 172,192','#f1e6a6')
    +polygon('128,205 146,230 131,214','#5fc7d9')
    +polygon('191,179 213,184 203,189','#6ddaf2')
    +grain(5201,950,[87,135,150,108],'#bfdfeb',.14),`clip-path="${url(t,'torso')}"`);
  figure+=path('M111 147Q122 156 113 175M207 141Q199 151 216 177M80 180L96 188M221 186L231 176','none','#c3dceb',.85)
    +path('M113 147Q124 157 115 174M205 142Q197 152 214 177','none','#9f9bc5',.45,'stroke-dasharray="1 1.6"')
    +path('M148 126L157 133L177 133L190 135L179 144L158 140L140 133Z','#15283c','#a1c2d5',.75)
    +path('M148 129L158 136L177 137L185 135','none','#eff0f0',.6)
    +path(head,url(t,'skin'),'#9ac4e9',.75);
  const faceFacets=[
    ['149,72 161,55 176,64 159,81','#1d3b4b'],
    ['161,55 182,52 176,64','#3a5875'],
    ['182,52 196,63 176,64','#1b1d38'],
    ['176,64 196,63 200,81 187,78','#323656'],
    ['159,81 176,64 173,87','#12293d'],
    ['176,64 187,78 173,87','#0c192d'],
    ['187,78 200,81 194,87','#556181'],
    ['200,81 207,94 195,91 194,87','#263a57'],
    ['195,91 207,94 212,100 203,103','#393950'],
    ['195,91 203,103 190,102','#12253c'],
    ['173,87 187,78 194,87 190,102','#0b1529'],
    ['159,81 173,87 161,102 149,95','#274759'],
    ['149,95 161,102 155,115 148,103','#14374a'],
    ['173,87 190,102 177,111 161,102','#172037'],
    ['190,102 203,103 198,110 177,111','#3c3657'],
    ['203,103 205,112 198,110','#9b7199'],
    ['198,110 205,112 198,121 184,125','#251e34'],
    ['177,111 198,110 184,125','#172337'],
    ['161,102 177,111 155,115','#25495b'],
    ['155,115 177,111 179,137 155,132','#172d42'],
    ['177,111 184,125 179,137','#423756'],
  ];
  figure+=group(faceFacets.map(([p,c])=>polygon(p,c,'#86a9c4',.22)).join('')
    +polygon('194,87 200,81 199,87','#80cbdc')
    +polygon('190,102 203,103 199,105','#a67cc7')
    +polygon('161,102 155,115 155,132 160,125','#61b7c7')
    +grain(5251,350,[147,50,62,82],'#a6b4d4',.17),`clip-path="${url(t,'head')}"`);
  figure+=path('M167 84Q160 79 159 88Q158 99 166 102L170 94L168 87Z','#152f41','#77a9bc',.7)
    +path('M166 86Q160 84 162 92L165 90L166 97','none','#56667d',.75)
    +path('M192 87L198 88M199 107L204 108M188 120L197 119','none','#b1a2c9',.6)
    +path('M149 83L143 76L143 66L148 62L148 56L153 52L159 52L164 47L171 49L177 45L184 48L190 47L193 52L200 55L199 61L204 66L196 68L190 64L183 67L177 64L170 69L165 73L157 74L155 86Z','#0a1325','#a0e3f5',.85);
  const rand=rng(5281);let hair='',rim='';
  for(let i=0;i<100;i++){
    const x=149+rand()*48,y=53+rand()*17;
    hair+=`M${n(x)} ${n(y)}l${n(2+rand()*3)} ${n(-1-rand()*3)}`;
  }
  for(let i=0;i<26;i++){
    const x=148+i*1.9,y=62-Math.sin(i/25*Math.PI)*12;
    rim+=`M${n(x)} ${n(y+1)}l${n(rand()*2)} ${n(-2-rand()*3)}`;
  }
  figure+=path(hair,'none','#7085b0',.5,'opacity=".42"')+path(rim,'none','#b9e5ff',.7,'opacity=".78"')
    +path('M146 78L149 95L153 107M155 115L155 130M193 64L199 73L198 82M204 94L210 100L204 103','none','#b9dcf5',.65);
  scene+=figure+path('M25 40H90L94 123L25 128Z',url(t,'shade'));
  let art=group(scene,`clip-path="${url(t,'card')}"`)+footer(t,'#0b142a','#55759a');
  // Three offset rings define a cut-glass perimeter. Each edge sector is
  // triangulated around an authored kink, producing a variable-width frame.
  const outer=[[29,38],[68,28],[111,5],[136,26],[164,6],[195,19],[235,18],[273,42],[292,77],[280,117],[290,155],[280,190],[295,222],[278,254],[290,293],[276,326],[260,355],[212,358],[175,363],[150,377],[116,361],[78,357],[36,351],[18,328],[10,292],[22,256],[7,221],[23,187],[12,150],[24,113],[10,77]];
  const inner=[[39,49],[76,43],[113,28],[137,37],[164,27],[194,35],[231,35],[260,53],[268,80],[265,119],[271,155],[266,192],[274,223],[265,254],[272,291],[264,322],[251,341],[211,345],[172,350],[150,363],[119,349],[80,344],[48,338],[31,322],[29,291],[35,254],[29,222],[35,187],[29,151],[37,115],[28,79]];
  for(let i=0;i<outer.length;i++){
    const next=(i+1)%outer.length,a=outer[i],b=outer[next],c=inner[next],d=inner[i];
    const center=[n((a[0]+b[0]+c[0]+d[0])/4+(i%2?1.2:-1.2)),n((a[1]+b[1]+c[1]+d[1])/4)];
    art+=crystalShard(t,[a,b,c,d],center,i);
  }
  art+=path('M29 38L68 28L111 5L136 26M164 6L195 19L235 18L273 42M292 77L280 117L290 155M295 222L278 254L290 293M276 326L260 355L212 358M175 363L150 377L116 361M78 357L36 351L18 328M10 292L22 256L7 221M23 187L12 150L24 113L10 77L29 38','none','#e4f6ff',1.15)
    +path('M39 49L113 28L137 37L164 27L231 35L260 53L268 80L265 119L271 155L266 192L274 223L265 254L272 291L264 322L251 341L211 345L172 350L150 363L119 349L80 344L48 338L31 322L29 291L35 254L29 222L35 187L29 151L37 115L28 79Z','none','#c2e9ff',.7)
    +path('M10 77L28 79L36 63M12 150L26 162L35 187M23 187L18 207M280 117L270 136M290 293L274 307L276 326M260 355L253 346M36 351L46 342','none','#fff8ff',.65);
  [[111,5,3],[274,43,4],[11,150,2.5],[289,293,3],[36,350,2],[150,374,3],[20,82,2]].forEach(([x,y,r])=>art+=star(x,y,r,'#e8faff',.45));
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
