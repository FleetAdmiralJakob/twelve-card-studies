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
const outerFrame = 'M24 54C59 45 95 30 126 16Q137 32 150 11Q163 32 175 16C210 31 242 45 276 54L277 323Q277 346 247 351Q190 354 150 372Q111 354 52 351Q23 346 23 323Z';
const innerFrame = 'M31 58C65 48 98 35 125 23Q137 38 150 21Q163 38 176 23C207 36 237 49 269 59L270 322Q270 338 246 344Q188 347 150 364Q112 347 53 344Q30 340 30 321Z';
const innerLine = 'M35 62C68 52 99 39 124 28Q137 42 150 28Q163 42 177 28C207 40 236 53 265 62L266 321Q266 335 244 339Q186 344 150 359Q114 344 55 339Q34 335 34 321Z';

function defs(theme) {
  const c = palettes[theme], id = name => `r2-ms-${theme}-${name}`;
  const lg = (name, stops, xy = 'x1="0" y1="0" x2="1" y2="1"') => `<linearGradient id="${id(name)}" ${xy}>${stops.map(([o,col,a])=>`<stop offset="${o}" stop-color="${col}"${a === undefined?'':` stop-opacity="${a}"`}/>`).join('')}</linearGradient>`;
  const rg = (name, stops, xy = '') => `<radialGradient id="${id(name)}" ${xy}>${stops.map(([o,col,a])=>`<stop offset="${o}" stop-color="${col}"${a === undefined?'':` stop-opacity="${a}"`}/>`).join('')}</radialGradient>`;
  return `<defs>${lg('metal', [[0,c.mid],[.17,c.light],[.29,c.metal],[.48,c.deep],[.61,c.light],[.79,c.mid],[1,c.light]])}${lg('field',[[0,c.deep],[.42,c.dark],[1,c.dark]])}${lg('fabric',[[0,c.light],[.035,c.mid],[.16,c.cloth],[.53,c.dark],[.8,c.cloth],[1,c.mid]])}${lg('fold',[[0,c.mid],[.23,c.cloth],[.65,c.dark],[1,c.metal]])}${lg('skin',[[0,c.mid],[.17,c.skin],[.56,c.dark],[1,c.dark]])}${lg('fade',[[0,c.dark,0],[.38,c.dark,.94],[1,c.dark]],'x1="0" y1="0" x2="0" y2="1"')}${lg('ribbon',[[0,c.deep],[.23,c.dark],[.75,c.dark],[1,c.deep]])}${lg('shard',[[0,c.light],[.05,c.metal],[.23,c.deep],[.65,c.dark],[1,c.metal]])}${lg('marble',[[0,'#fffef8'],[.25,'#e0dfd5'],[.49,'#fbfaf5'],[.73,'#d2d0c5'],[1,'#f6f5ed']])}${lg('whitecloth',[[0,'#eeece0'],[.19,'#fefdf8'],[.42,'#aaa99f'],[.58,'#f0efe7'],[.8,'#d4d2c6'],[1,'#fffdf4']])}${rg('halo',[[0,c.metal,.42],[.45,c.mid,.12],[1,c.dark,0]])}${rg('ball',[[0,c.light],[.28,c.metal],[.67,c.mid],[.88,c.deep],[1,c.light]],'cx=".28" cy=".24" r=".82"')}${rg('stoneball',[[0,'#fffef9'],[.52,'#eeece1'],[.84,'#bfb9a7'],[1,'#fff4d9']],'cx=".28" cy=".22" r=".83"')}<clipPath id="${id('inside')}">${path(innerFrame,'white')}</clipPath></defs>`;
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
function clothGrain(theme) {
  // Fine, discontinuous woven threads; one path rather than a filter surface.
  let d='';
  for(let j=0;j<47;j++){
    const x=137+(j*17%47),y=146+(j*23%79),w=1.1+(j%4)*.4;
    d+=`M${x} ${y}q${(w*.45).toFixed(1)} -.7 ${w.toFixed(1)} -.2`;
  }
  return line(d,theme==='aurum'?'#827f70':palettes[theme].light,.42,theme==='aurum'?.26:.2);
}
function hair(theme, x, y, rx, ry, angle = 0) {
  let d = `M${x-rx} ${y+4}`;
  for(let j=0;j<=33;j++) {
    const a = Math.PI+j*Math.PI/33, r = j%3===0?1.045:j%3===1?.96:1.015;
    d += `L${(x+Math.cos(a)*rx*r).toFixed(1)} ${(y+Math.sin(a)*ry*r).toFixed(1)}`;
  }
  d += `Q${x+rx-2} ${y+11} ${x+rx-9} ${y+13}L${x+rx-12} ${y+19}Q${x+1} ${y+11} ${x-rx+5} ${y+8}Z`;
  const light = palettes[theme].light;
  let curls='';
  for(let j=0;j<19;j++) {
    const xx=x-rx+5+(j*11)%(rx*2-8), yy=y-ry+5+Math.floor(j/5)*4;
    curls+=`M${xx} ${yy}q2 -2 3 .2`;
  }
  return group(path(d,theme==='aurum'?'#42453c':palettes[theme].dark,`stroke="${palettes[theme].mid}" stroke-width=".5"`)+line(curls,theme==='aurum'?'#bdbba6':light,.55,.31),`transform="rotate(${angle} ${x} ${y})"`);
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
  return path(outerFrame,'none',`stroke="${fill(theme,'metal')}" stroke-width="3.5"`)+path(outerFrame,'none',`stroke="${c.light}" stroke-width=".75"`)+path(innerFrame,'none',`stroke="${c.metal}" stroke-width="1.25"`)+path(innerLine,'none',`stroke="${c.light}" stroke-width=".5" opacity=".8"`)+line('M38 63L38 321Q38 332 58 335M262 63L262 321Q262 332 242 335',c.mid,.65,.7)+line('M42 56L82 43M216 43L259 57M60 349Q116 355 150 369Q185 354 241 348',c.light,.9,.9);
}
function footer(theme) {
  const c=palettes[theme], white=theme==='aurum';
  const panel=white?'#eeeae0':fill(theme,'ribbon');
  return rect(32,219,236,123,fill(theme,'fade'))+path('M35 249Q94 228 150 235Q212 231 265 249L261 269Q204 258 150 265Q94 257 39 270Z',panel)+line('M37 247Q96 228 150 235Q211 231 264 247',c.metal,.85,.8)+line('M43 269Q99 258 150 265Q205 258 258 269',c.mid,.65,.5)+line('M40 310H260',c.mid,.55,.24)+crest(theme)+group(line('M0-7V7M-5 0H5M-3-3L3 3M3-3L-3 3',c.metal,.8), 'transform="translate(150 350)"');
}

function valorBackground() {
  const t='valor';
  const facets = [
    ['M110 40L148 144L168 57Z',.8],['M132 39L165 128L151 72Z',.9],['M179 43L166 147L208 58Z',1],['M206 39L181 146L225 92Z',1],['M225 65L192 158L254 96Z',.9],['M265 76L213 175L266 125Z',.8],['M269 146L204 196L264 181Z',.9],['M266 192L204 216L268 230Z',.7],['M74 120L123 184L85 154Z',.5],['M45 150L120 201L67 183Z',.7],['M40 199L96 220L58 235Z',.8],['M199 130L230 83L213 145Z',.95],['M183 117L191 66L201 71Z',1],['M236 120L260 111L236 153Z',1],['M113 75L131 128L96 96Z',.7],['M54 93L83 107L67 118Z',.55],
  ];
  return ellipse(174,153,119,145,fill(t,'halo'))+facets.map(([d,o])=>path(d,fill(t,'shard'),`opacity="${o}" stroke="#ffe4a0" stroke-width=".75"`)).join('')+line('M110 40L165 128L208 58M132 39L151 72L168 57M225 65L213 145L254 96M45 150L96 202L58 235M236 120L266 125L204 196','#fff4b2',.7,.65)+line('M87 60L113 68L126 63M194 47L208 50L222 48M46 131L60 132L66 141','#e5bf66',.5,.5);
}
function valorPlayer() {
  const t='valor', light=palettes[t].light;
  return path('M147 96L145 121L176 136L187 119L181 94Z',fill(t,'skin'))+
    path('M147 67C154 52 177 48 189 61C197 71 191 93 184 107L175 119L154 113L144 97L142 81Z',fill(t,'skin'))+
    ellipse(145,88,4,8,'#4d3b1c')+line('M143 82Q149 80 149 91M151 105L157 110',light,.7,.6)+hair(t,168,70,27,22,-7)+
    path('M140 114Q119 116 101 128L77 151L87 177L108 184L99 226L119 245L203 244L221 209L217 162L205 137L182 120L174 128Z',fill(t,'fabric'),`stroke="#897844" stroke-width=".7"`)+
    path('M101 128Q117 131 128 150L111 182L86 175L77 152Z',fill(t,'fold'))+
    path('M82 164L72 183L51 213L40 236L51 240L68 225L86 209L104 181Z',fill(t,'skin'),`stroke="#b8a273" stroke-width=".7"`)+
    path('M91 177L84 195L61 219L51 233L48 232L67 205L76 181Z','#474324')+
    path('M201 138Q222 146 225 167L220 192L206 198L190 186L192 155Z',fill(t,'fold'))+
    path('M210 184Q223 185 225 199L222 215Q210 224 193 225L179 219L175 209L184 203L197 209L207 208Z',fill(t,'skin'),`stroke="#ad914d" stroke-width=".8"`)+
    path('M113 139Q144 127 171 137L202 154L186 149L163 142L137 141Z','#5b5030')+
    path('M125 154L115 183L115 213L130 231L127 206L130 175Z','#0b100b')+
    path('M138 150L133 187L141 216L139 181L150 159Z','#383a21')+
    path('M162 147L178 165L187 195L195 205L186 173L179 155Z','#514529')+
    path('M159 161L157 211L171 235L169 213L165 181Z','#12170e')+
    line('M144 116Q160 129 178 129M141 119Q158 132 176 132',light,1,.65)+
    line('M100 129Q116 132 126 151L111 179M84 170L105 179M204 141Q219 157 216 179',light,.9,.65)+
    line('M115 146L106 164M120 159L111 175M130 140L152 139L175 147M150 151L143 172M137 182L137 199M178 158L186 177M113 203L119 222M175 213L183 228','#e4c474',.7,.55)+
    line('M130 143L152 144L176 152M118 188L115 202M145 209L150 220M191 161L198 179','#777046',.8,.75)+
    ellipse(193,209,28,28,fill(t,'ball'),`stroke="#ffe9a5" stroke-width="1.1"`)+
    path('M187 191L199 191L207 200L201 211L188 211L181 201Z','#3b3012',`stroke="#fff4ba" stroke-width="1"`)+
    path('M174 200L173 216L180 222L186 212L180 203Z','#8f6b24')+
    path('M212 205L217 202L219 214L211 226L204 217Z','#3e3416')+
    path('M183 232L195 235L202 227L199 218L187 218Z','#876521')+
    line('M188 191L183 184M199 191L205 186M207 200L217 201M201 211L204 217M188 211L186 218M181 201L174 200M180 222L183 232M202 227L211 226',light,1,.8)+
    crown(t,194,180,.72)+
    path('M173 219L184 220L191 218L200 219L200 223L190 225L183 228L173 225Z',fill(t,'skin'),`stroke="#c0a65d" stroke-width=".65"`)+line('M181 222L191 221M184 224L193 223',light,.5,.55);
}

function nexusBackground() {
  const t='nexus';
  const shards=['M36 52L80 37L61 67Z','M84 42L125 29L113 78Z','M128 33L146 105L158 49Z','M176 39L214 45L195 111Z','M219 48L265 65L225 133Z','M261 71L259 139L217 168Z','M267 149L249 213L225 190Z','M263 215L243 243L264 263Z','M38 139L102 178L42 187Z','M39 194L94 213L37 247Z','M52 81L88 124L42 115Z'];
  return ellipse(178,142,117,123,fill(t,'halo'))+shards.map((d,i)=>path(d,fill(t,'shard'),`opacity="${.38+(i%4)*.14}" stroke="#cdd3d0" stroke-width=".65"`)).join('')+line('M36 92L59 96L70 114L85 112L112 141L134 157M60 98L64 77L52 61M78 110L102 99L109 75L122 66M260 77L233 93L231 111L207 138L193 139M233 93L218 86L213 65M249 163L229 165L215 184L192 198M262 221L235 216L225 231L209 240M42 203L65 194L79 202L94 194M67 195L62 178L51 173M111 48L122 66L145 69M143 37L150 53L147 68','#ecf1ed',1,.64)+line('M35 91L57 94L69 112L85 110M259 76L231 91L229 110L205 137M42 205L65 196L79 204','#4c5657',2,.7)+crown(t,150,52,.8);
}
function nexusPlayer() {
  const t='nexus';
  return path('M162 105L157 125L181 146L199 127L197 106Z',fill(t,'skin'))+
    path('M164 65Q181 52 197 61Q212 67 211 83L209 91L215 102L208 106L205 120L197 126L183 122L172 111L167 99L160 94L158 80Z',fill(t,'skin'),`stroke="#9ea6a2" stroke-width=".75"`)+
    path('M203 77L204 89L200 93L207 95L210 102L205 102L202 115L196 119L190 115L197 111L199 97L196 87Z','#181c1b')+
    ellipse(169,94,4,7,'#414843')+line('M168 90Q173 88 171 98M206 105L202 106M198 115L202 115','#d1d8d2',.55,.55)+hair(t,185,71,27,18,7)+
    path('M154 120Q132 116 111 126L83 144L58 153L40 157L68 167L101 161L65 181L39 190L37 204L91 188L57 216L40 238L69 237L111 209L88 244L193 246L221 220L220 173L200 143L181 132Z',fill(t,'fabric'),`stroke="#808986" stroke-width=".8"`)+
    path('M149 124L114 137L78 157L42 157L67 168L99 161L132 142L170 137Z','#8b928a')+
    path('M153 132L110 160L64 182L41 189L55 198L91 184L128 158L177 143Z','#10171a')+
    path('M160 142L119 174L93 200L43 237L62 237L103 212L139 169L176 146Z','#47514f')+
    path('M166 146L141 182L125 210L106 242L125 242L153 197L183 154Z','#0a1113')+
    path('M178 149L165 184L149 227L167 246L193 246L213 213L205 171L194 154Z','#252d2e')+
    path('M192 145Q218 149 225 174L220 198L202 208L184 192L185 165Z',fill(t,'fold'),`stroke="#a1a8a0" stroke-width=".7"`)+
    path('M207 196L216 196L225 217L243 241L228 249L209 232L196 210Z',fill(t,'skin'))+
    path('M209 200L214 203L220 220L237 241L232 243L213 225L205 208Z','#46504b')+
    line('M155 122L175 135L197 142M156 127L173 140L194 145M114 133L92 148L66 158M141 141L115 159L84 175M150 149L117 181L87 208M166 149L146 189L130 220M174 161L164 203M181 164L175 201M196 148Q215 158 217 178L212 192M192 163L187 183L201 198M196 197L211 204','#d6ded6',.9,.64)+
    line('M154 157L132 191L123 203M126 158L108 173L97 185M191 157L194 176L202 188M199 165L202 180M177 209L169 229M182 216L182 237','#8a9490',.8,.7)+
    path('M47 209L83 194L119 164L106 183L74 210Z','#060b0e')+line('M40 204L70 194M55 220L78 207M100 237L123 211','#cdd8cd',.8,.55);
}

function aurumBackground() {
  const veins='M48 48L62 69L57 83L72 106L64 128L74 143M62 69L78 72L91 86M57 83L43 96L40 122M227 45L219 72L231 84L225 107L241 129L234 153M219 72L200 78L196 94M241 129L260 135L265 159M46 188L64 201L68 223L91 238M64 201L79 192L93 204M251 216L232 231L239 252L221 270M239 252L258 267L254 288M49 301L59 316L54 336M254 312L237 329L242 341';
  return path(innerFrame,fill('aurum','marble'))+line(veins,'#b9ad91',1,.5)+line(veins,'#fefdf4',.38,.8)+line('M48 48L62 69L57 83M72 106L64 128L74 143M227 45L219 72M225 107L241 129L234 153M232 231L239 252L221 270M46 188L64 201L68 223','#cba75e',1.1,.85)+line('M90 45L99 60L108 63M94 153L107 162L99 181M192 48L187 63M231 174L245 181L254 176M96 321L102 335M181 345L188 339','#c7c3b5',.6,.4)+ellipse(163,163,137,37,'none','stroke="#a8792d" stroke-width="4" transform="rotate(-32 163 163)"')+ellipse(163,162,137,37,'none','stroke="#ffe7ac" stroke-width="1.4" transform="rotate(-32 163 162)"')+ellipse(154,207,131,30,'none','stroke="#c49b53" stroke-width="2.4" transform="rotate(-22 154 207)"');
}
function aurumPlayer() {
  const t='aurum';
  return `<defs><linearGradient id="r2-ms-aurum-stonehead" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#999a87"/><stop offset=".23" stop-color="#53584b"/><stop offset=".8" stop-color="#292f29"/><stop offset="1" stop-color="#747967"/></linearGradient></defs>`+path('M147 105L145 124L161 143L182 131L183 105Z',fill(t,'stonehead'))+
    path('M149 63C158 52 178 48 189 62L193 80L187 93L186 105L176 117L164 115L151 105L145 90L142 78Z',fill(t,'stonehead'),`stroke="#aaa792" stroke-width=".7"`)+
    path('M146 77L153 75L155 91L163 104L167 112L156 107L150 99L143 93L143 86L138 84L143 77Z','#868575')+
    ellipse(187,89,4,7,'#5c6054')+line('M150 77L159 76M151 87L147 91L153 94M153 101L159 101M161 106L168 111','#bcb9a3',.7,.6)+hair(t,168,69,25,21,-10)+
    path('M143 119L127 125L111 136L97 167L109 181L123 180L115 215L109 241L222 244L225 218L211 177L228 168L219 140L196 128L183 119L162 135Z',fill(t,'whitecloth'),`stroke="#a8a591" stroke-width=".8"`)+
    path('M142 119L153 132L163 138L182 121L188 128L163 150L143 137L136 124Z','#faf9f0',`stroke="#aba78f" stroke-width=".8"`)+
    path('M143 123L157 139L163 142L181 125L182 130L163 147L144 132Z','#a6a28d')+
    path('M124 128Q116 147 123 174L110 182L97 167L109 140Z','#e7e5db')+
    path('M196 129Q216 140 220 164L207 175L192 162L190 142Z','#faf9ef')+
    path('M107 178L119 179L115 204L108 229L100 237L91 234L92 218L100 195Z','#d7d5c8',`stroke="#a49f8a" stroke-width=".65"`)+
    path('M208 173L219 167L226 190L237 215L233 228L222 224L209 201L204 184Z','#f2f0e6',`stroke="#b1ac98" stroke-width=".65"`)+
    path('M125 149L136 168L130 187L126 217L133 234L119 230L122 195Z','#b5b4a8')+
    path('M148 152L144 174L151 191L147 223L159 238L155 214L159 186Z','#e9e7dc')+
    path('M178 146L172 168L184 188L180 208L189 235L194 226L189 198L191 185Z','#afafa3')+
    path('M195 165L201 187L213 211L214 231L222 234L218 211L207 183Z','#d0cfc2')+
    path('M159 155L165 171L160 195L168 213L164 234L171 234L174 210L167 191L170 174Z','#fbfaf2')+
    line('M128 131Q125 148 129 159M109 172L119 176M196 133Q209 146 213 165M206 169L219 164M138 150L145 166L141 181M129 192L125 213M177 151L180 165M187 176L193 189M180 216L186 230M149 211L151 222','#8f8d7d',.65,.75)+
    line('M130 151L138 171M151 161L152 177M174 186L178 200M201 193L209 213M136 216L140 232','#ffffff',1.4,.95)+
    path('M109 241L123 215L145 225L171 220L193 225L216 214L225 242Z','#eeece2')+
    line('M131 224L153 230L173 226M177 229L197 232L215 222','#b4b0a2',.65,.55);
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
      const x=180+j*15, yy=y+8-j*3.0, ww=9.3;
      s+=path(`M${x} ${yy+h}V${yy+8}Q${x+ww/2} ${yy-2} ${x+ww} ${yy+6}V${yy+h}Z`,'#2d2115',`stroke="#b78d5f" stroke-width="1.2"`);
      s+=line(`M${x+11} ${yy+2}v${h+2}`,'#e8b786',1,.6);
      s+=line(`M${x+3} ${yy+9}v${h-11}`,'#6c4d2e',1.4,.9);
    }
  }
  s+=line('M182 222L267 200M178 211L267 190M183 105L267 77M181 147L267 119M178 187L267 157','#e6bd8a',1.2,.65);
  s+=line('M203 76L205 87M236 66L238 80M222 117L224 130M251 151L253 165M193 153L195 165','#3f2c19',1,.7);
  return s;
}
function legacyBackground() {
  return ellipse(184,149,115,130,fill('legacy','halo'))+path('M36 201L58 172L70 182L82 164L105 176L125 159L149 171L170 162L182 200Z','#64442a')+colosseum()+
    line('M45 58L57 69L51 92L65 108M52 92L40 104M220 40L216 54L225 60M84 43L81 59L93 72M240 231L226 243L234 257','#cfa174',.8,.65)+
    path('M36 228L63 211L88 219L105 208L132 227L160 216L185 232L214 216L241 231L269 217L268 266L33 268Z','#735033')+line('M36 228L63 217L77 228L91 225M215 231L234 236L251 231M45 245L63 236L85 246M191 244L214 240L224 250','#d3a375',1,.6);
}
function legacyPlayer() {
  const t='legacy';
  return path('M151 105L147 124L173 139L187 125L185 109Z',fill(t,'skin'))+
    path('M149 65Q166 50 184 61L193 77L192 91L199 100L193 105L190 118L182 122L170 117L155 108L149 96L143 91L141 80Z',fill(t,'skin'),`stroke="#c19560" stroke-width=".65"`)+
    path('M187 80L185 91L190 96L193 101L187 104L183 114L177 115L172 110L178 110L182 100L181 88Z','#271d10')+
    ellipse(149,92,4.5,7,'#6a4b2b')+line('M149 89Q153 91 151 97M189 105L185 106M180 115L185 115','#d9ae72',.55,.6)+hair(t,168,71,27,21,-4)+
    path('M145 119L123 125L107 137L92 164L102 180L119 184L109 223L121 246L202 246L216 223L210 179L215 161L205 142L183 127L171 136Z',fill(t,'fabric'),`stroke="#a27747" stroke-width=".8"`)+
    path('M122 126L137 142L133 165L119 184L104 180L92 163L105 141Z',fill(t,'fold'))+
    path('M101 177L115 181L107 203L111 216L136 220L148 213L158 218L155 228L133 236L103 230L89 216L87 202Z',fill(t,'skin'),`stroke="#b08855" stroke-width=".75"`)+
    path('M94 204L95 216L106 223L132 227L137 223L109 219L103 208L107 190Z','#6f5531')+
    path('M200 159L212 173L216 199L226 217L221 227L209 220L197 198L191 178Z',fill(t,'skin'))+
    path('M143 144L133 169L138 189L129 211L142 225L148 204L144 184L152 165Z','#282317')+
    path('M165 144L170 164L185 179L180 204L193 231L198 223L191 199L194 176L180 153Z','#5c492b')+
    path('M161 159L155 182L165 206L162 226L172 239L173 211L166 188L170 171Z','#1f1c12')+
    line('M144 121L162 137L172 141L185 131M144 125L162 141L171 144M109 137Q127 141 129 156L117 178M103 172L119 181M201 148Q210 158 208 174M139 153L134 168M148 159L145 174M153 190L158 203M176 155L183 166M189 189L187 203M173 214L178 228','#f2ca8c',.85,.7)+
    line('M134 143L139 150L136 160M143 171L147 183M169 149L174 161L178 163M176 173L183 182L179 190M151 209L146 218M184 215L189 227','#ae8c56',1.4,.6)+
    // Broken embroidery along the shoulders and chest, built as linework.
    line('M126 135l4 4-2 4 5 4-1 4M148 145l5 3-1 4 5 2-1 5M186 144l6 4-2 4 5 5M134 190l5 3-2 4 5 3M179 194l4 4-1 4 5 3','#c6a267',.8,.68)+
    line('M136 221L147 217L154 220M138 226L149 222M142 229L152 225','#e4bc83',.6,.75);
}

function make(theme) {
  const c=palettes[theme];
  let content = defs(theme)+ellipse(150,202,146,174,fill(theme,'halo'))+path(outerFrame,fill(theme,'field'));
  const background={valor:valorBackground,nexus:nexusBackground,aurum:aurumBackground,legacy:legacyBackground}[theme]();
  const player={valor:valorPlayer,nexus:nexusPlayer,aurum:aurumPlayer,legacy:legacyPlayer}[theme]();
  content+=group(background+dust(theme,88),`clip-path="url(#r2-ms-${theme}-inside)"`);
  // Quiet upper-left field gives live rating/position sufficient contrast.
  if(theme!=='aurum') content+=path('M34 62L91 45L100 123L34 137Z',fill(theme,'fade'),'opacity=".7"');
  content+=player+clothGrain(theme);
  content+=footer(theme)+frame(theme);
  if(theme==='valor'||theme==='legacy') content+=laurel(theme,'left',theme==='valor'?141:149,282,11)+laurel(theme,'right',theme==='valor'?141:149,282,11);
  if(theme==='aurum') content+=aurumFront();
  if(theme==='nexus') content+=line('M22 74L17 89L24 121M22 190L17 206L23 225M278 90L283 115L277 135M277 239L283 255L276 277M73 36L83 30L94 33M213 35L226 37L240 43',c.light,.9,.7);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380" aria-hidden="true" focusable="false">${content}</svg>`;
}
export const svgArt = Object.fromEntries(Object.keys(palettes).map(theme=>[theme,make(theme)]));

function crest(...args){return `<g transform="translate(40.3 46.6) scale(.8)">${rawCrest(...args)}</g>`}
