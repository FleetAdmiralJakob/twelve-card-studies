// All of the artwork is original, resolution-independent SVG markup. There are
// no image crops or bitmap backgrounds in these four card treatments.
const svg = (body, defs = '') => `<svg class="illustrated-frame" viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
const random = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const n = value => Number(value.toFixed(2));
const points = list => list.map(p => p.map(n).join(',')).join(' ');
const dust = (seed, count, color, bounds = [0, 0, 200, 320]) => {
  const rand = random(seed), shades = new Map();
  // Retain every seeded speck, radius and opacity; share a path per shade.
  // The original edition embeds this SVG as an image, so this trims its
  // internal vector tree rather than changing the host page's DOM count.
  for (let i = 0; i < count; i++) {
    const x = n(bounds[0] + rand() * bounds[2]), y = n(bounds[1] + rand() * bounds[3]);
    const r = n(.15 + rand() * .7), opacity = n(.1 + rand() * .55), d = n(r * 2);
    const mark = `M${n(x-r)} ${y}a${r} ${r} 0 1 0 ${d} 0a${r} ${r} 0 1 0 ${-d} 0Z`;
    shades.set(opacity, (shades.get(opacity) || '') + mark);
  }
  return [...shades].map(([opacity, d]) => `<path d="${d}" fill="${color}" opacity="${opacity}"/>`).join('');
};
const paperFilter = id => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="3" seed="15" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".17"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>`;

function blueprintArt() {
  const rand = random(881);
  const shield = 'M10 11L190 11L190 292L100 315L10 292Z';
  let fineGrid = '';
  for (let x = 15; x < 190; x += 9) fineGrid += `<path d="M${x} 15V294" stroke="#baa774" stroke-width="${x % 3 === 0 ? '.38' : '.2'}" opacity=".25"/>`;
  for (let y = 17; y < 301; y += 9) fineGrid += `<path d="M14 ${y}H187" stroke="#baa774" stroke-width=".25" opacity=".28"/>`;
  let diagram = '';
  for (let i=0;i<36;i++) {
    const x=n(16+rand()*166), y=n(16+rand()*282), w=n(3+rand()*14), h=n(2+rand()*11);
    diagram += `<path d="M${x} ${y}h${w}v${h}" stroke="#c8ac68" stroke-width=".45" opacity="${n(.18+rand()*.4)}"/>`;
  }
  let wear = '';
  for (let i=0;i<130;i++) {
    const x=n(12+rand()*178),y=n(12+rand()*293);
    wear+=`<path d="M${x} ${y}l${n(rand()*7)} ${n(rand()*2-1)}" stroke="${i%3?'#c9aa67':'#101210'}" stroke-width="${n(.2+rand()*.5)}" opacity="${n(.1+rand()*.28)}"/>`;
  }
  return svg(`
    <path d="${shield}" fill="#111511" stroke="#baa269" stroke-width="2"/>
    <g clip-path="url(#bp-cut)">${fineGrid}${diagram}
      <rect x="15" y="16" width="170" height="274" fill="url(#bp-shade)"/>
      <path d="M14 185Q68 163 187 187M25 307Q17 237 38 185M18 19L70 14M173 15L181 301" stroke="#cbb579" stroke-width=".7" opacity=".6"/>
      <path d="M114 38C92 38 76 57 76 80C76 105 91 122 114 122Z" fill="url(#bp-gold)"/>
      <path d="M114 38C136 38 153 58 153 80C153 103 138 122 114 122" fill="#101512" stroke="#c3b27d" stroke-width="1"/>
      <path d="M114 122C87 126 65 151 57 185L114 190Z" fill="url(#bp-gold)"/>
      <path d="M114 122C141 126 169 143 185 179L185 183L114 190Z" fill="#0e1411" stroke="#c3b27d" stroke-width=".9"/>
      <path d="M114 25V196M70 81H162M52 184H190" stroke="#d1bd83" stroke-width=".4" opacity=".4"/>
      <path d="M22 20L183 20L183 287L100 307L17 287L17 16L186 16" stroke="#e0c98a" stroke-width=".7"/>
      <path d="M15 24l13-9M15 29l17-14M172 288l11-2M169 294l17-4M175 278l7 25M168 282l6 22" stroke="#cbb579" stroke-width=".7"/>
      <rect x="157" y="30" width="14" height="5" stroke="#cdb578" stroke-width=".7"/>
      <path d="M164 24v17M155 32h19M19 163h12m-6-5v10M48 19v7m-3-3h6" stroke="#ccb779" stroke-width=".5"/>
      <path d="M24 98l9 4 10-4-1 12-9 9-10-8Z" stroke="#d7bd74" stroke-width="1.3"/><path d="M26 109l5 4 4-8 4 3 3-4" stroke="#e7cd85" stroke-width="1.4"/>
      ${wear}${dust(88,450,'#ead199')}
    </g>
    <path d="M11 13L189 12L189 291L101 313L11 291Z" stroke="#f1d99c" stroke-width=".65"/>
    <path d="M11 10l31 1 11-2 24 2 19-1 26 1 28-1 38 1M13 15l-1 14M22 295l48 11" stroke="#e9d398" stroke-width="1.1"/>
  `, `<clipPath id="bp-cut"><path d="${shield}"/></clipPath><linearGradient id="bp-gold" x1="80" y1="45" x2="147" y2="193" gradientUnits="userSpaceOnUse"><stop stop-color="#d1bf8c"/><stop offset=".45" stop-color="#d9c99c"/><stop offset="1" stop-color="#b7a36b"/></linearGradient><radialGradient id="bp-shade"><stop stop-color="#080e0c" stop-opacity="0"/><stop offset="1" stop-color="#080a09" stop-opacity=".65"/></radialGradient>`);
}

function comicArt() {
  const rand=random(898);
  let ink='', scuffs='';
  for(let i=0;i<75;i++) {
    const x=n(rand()*200),y=n(rand()*320);
    ink+=`<path d="M${x} ${y}l${n(rand()*10-5)} ${n(rand()*14-7)}" stroke="#0b0e0b" stroke-width="${n(.4+rand()*1.8)}" opacity=".8"/>`;
  }
  for(let i=0;i<500;i++) {
    const x=n(12+rand()*175),y=n(17+rand()*278);
    scuffs+=`<path d="M${x} ${y}l${n(rand()*3+.4)} ${n(rand()*2-1)}" stroke="${i%4?'#0b140e':'#f5df95'}" stroke-width="${n(.15+rand()*.5)}" opacity="${n(.15+rand()*.35)}"/>`;
  }
  const athlete='M121 53C119 46 124 39 134 40C146 40 151 46 150 57L147 74L141 87L132 93L126 90L122 81L118 80L117 68L118 60Z M124 89L116 86L108 90L104 86L96 88L91 96L79 95L70 101L66 111L60 116L55 127L47 134L41 146L41 154L47 157L52 151L58 155L64 148L65 139L70 138L76 128L78 141L89 150L92 169L101 175L116 169L126 176L140 165L142 152L149 145L153 148L157 145L163 150L173 145L184 146L190 140L187 132L181 128L176 126L167 117L158 111L153 101L144 95L137 97L129 98Z';
  return svg(`
    <path d="M6 7L83 17L159 1L145 20L194 17L187 55L200 53L192 287L103 316L4 288L10 81L2 64L9 65Z" fill="#0d100d" stroke="#080b0c" stroke-width="4"/>
    <path d="M8 9L83 20L155 5L141 25L191 19L184 60L196 56L190 285L103 313L7 286L13 81L5 68L13 71Z" fill="#ec242b"/>
    <path d="M16 15L81 25L149 12L115 49L175 29L164 70L193 60L173 119L196 126L180 156L196 177L181 191L193 213L170 226L188 284L150 274L145 298L114 294L103 309L78 298L38 298L52 284L9 281L28 245L11 232L38 208L12 174L27 162L14 125L46 122L28 87L73 89L75 61L87 77L104 35Z" fill="#090d0c"/>
    <path d="M56 91L72 100L75 65L86 83L104 38L99 80L135 42L129 84L175 35L160 86L190 67L172 119L191 127L160 146L188 158L168 175L183 196L154 194L172 225L141 212L134 243L114 224L102 254L82 231L62 257L67 227L34 244L43 213L16 215L36 191L13 175L48 166L24 130L58 136Z" fill="#0688bd" stroke="#080d0d" stroke-width="2.5"/>
    <path d="M21 165L63 161L43 137L78 144L69 111L92 132L100 93L117 120L146 79L139 125L174 105L157 141L190 139L166 161L190 174L160 179L184 204L147 198L152 224L123 206L106 232L94 207L66 224L74 200L39 211L54 186L18 188L43 176Z" fill="#f6cf09" stroke="#0c100d" stroke-width="2.5"/>
    <path d="M69 130l-14-31 12 17M81 107L77 83m25 23 12-50m-20 45 1-27m61 47 26-35m-14 73 24-9M41 163l-21-20M34 200l-16 8M172 208l15 13M22 268l20-19m120 24 21 11" stroke="#0c100f" stroke-width="2"/>
    <g opacity=".3"><path d="M11 14L82 23L83 77L26 96L14 64Z" fill="url(#comic-dots)"/><path d="M20 125L53 88L192 29L188 162L154 207L50 220Z" fill="url(#comic-dots)"/></g>
    <path d="M15 230L57 219L95 228L139 221L183 228L187 283L102 309L11 283Z" fill="#e52d26"/>
    <path d="M17 239L35 234L21 259L35 250L17 281L42 273L38 286L69 293M164 228L179 237L166 242L181 262L171 257L185 279L162 270L164 283L147 292" stroke="#16130d" stroke-width="1.3"/>
    <g>${ink}</g>
    <path d="${athlete}" fill="#080e0a" stroke="#f6cd20" stroke-width="6.5" stroke-linejoin="round"/>
    <path d="${athlete}" fill="#080d09" stroke="#0b110b" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M121 65l3 2m19-7 3 3M125 78c2 9 6 12 11 9l8-10M117 92c2 12 4 20 13 25m-12-17c5 11 11 14 18 11m-24-15-10-2-5 8-8-1-5 10M74 114l-8 17-7 2-2 7m23-16 3 12 9 7M91 143l8-12M101 149l-2 9m12-30 4 10m31-32 7 10 9 6M155 129l-9-3-6 9 4 7 7-2 4 5m9-16 8 6m-70 35 17-5M48 145l5 2m84-48 6-7" stroke="#f8d325" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 188L34 181L30 170L55 179L71 171L79 179L95 171L106 180L123 173L135 180L153 174L157 182L180 175L176 189L197 188L181 202L192 211L170 213L177 227L151 221L141 229L124 221L110 229L95 222L76 228L67 220L45 227L44 217L18 224L27 210L7 213L22 201L9 198Z" fill="#0b100e"/>
    <path d="M20 189L41 185L35 176L56 184L72 177L80 185L95 178L106 186L123 179L135 185L153 180L158 188L177 182L172 194L188 192L174 202L184 207L163 209L169 220L151 215L141 222L125 216L110 222L95 216L77 222L68 214L50 220L49 211L27 217L34 206L17 208L30 200L17 197Z" fill="#f7dfa0"/>
    <path d="M18 17L80 24L78 91L24 108L17 72Z" fill="#f3d99b" stroke="#0e1210" stroke-width="3.5"/>
    <path d="M18 17L80 24L79 30L22 24Z" fill="#fff2b7" opacity=".7"/>
    <path d="M14 282L43 283L35 288L60 298L28 289Z" fill="#087eaa" stroke="#0b1210" stroke-width="1.8"/>
    <path d="M22 287L57 298L48 290L66 294L60 284M152 291L170 279L163 290L183 284M112 23L119 20L115 34M148 17L155 13L151 24" stroke="#080b0d" stroke-width="3"/>
    ${dust(89,380,'#120c0b')}${scuffs}
    <path d="M9 10L84 21L155 5L141 25L191 19L184 60L196 56L190 285L103 313L7 286L13 81L5 68L13 71Z" fill="#514a31" opacity=".21" filter="url(#comic-print)" style="mix-blend-mode:multiply"/>
  `, '<pattern id="comic-dots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#071616"/></pattern><filter id="comic-print"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="83" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComposite in2="SourceGraphic" operator="in"/></filter>');
}

const forestBody = 'M55 207L60 188Q63 176 83 171L94 162L94 150Q82 140 82 125L81 108Q81 87 99 80Q120 73 132 89L138 110L133 135L124 153L124 163L132 172Q151 174 160 187L171 208Z';
function forestArt() {
  const rand=random(874);
  const inner='M18 66Q19 42 45 35L77 23L102 8L130 25L162 34Q184 42 185 68L188 264Q186 294 161 303L103 316L48 303Q20 296 17 266Z';
  const rockPath=[[20,69],[22,51],[35,39],[52,33],[69,27],[86,21],[103,11],[120,23],[137,28],[154,34],[171,41],[180,55],[184,74],[185,96],[187,117],[186,139],[190,161],[188,182],[188,205],[190,226],[190,248],[184,270],[179,288],[164,301],[145,307],[124,312],[104,315],[82,312],[62,305],[44,299],[29,286],[22,268],[17,246],[17,224],[19,203],[18,182],[20,160],[17,138],[19,116],[17,93]];
  let rocks='',vines='',leaves='',magic='', crags='';
  rockPath.forEach(([x,y],i)=>{
    const a=rand()*6.28,rx=4+rand()*6,ry=6+rand()*7;
    const poly=Array.from({length:6},(_,j)=>[x+Math.cos(a+j*6.28/6)*(rx+rand()*3),y+Math.sin(a+j*6.28/6)*(ry+rand()*3)]);
    const colors=['#555e4d','#818774','#3e4937','#969a82','#5b6450','#969b83'];
    rocks+=`<path d="M${points(poly).replaceAll(' ','L')}Z" fill="${colors[i%6]}" stroke="#181e16" stroke-width="1.6"/><path d="M${points([poly[0],poly[1],[x,y],poly[5]]).replaceAll(' ','L')}Z" fill="#b7baa2" opacity="${n(.2+rand()*.4)}"/><path d="M${points([poly[2],poly[3],[x,y],poly[5]]).replaceAll(' ','L')}Z" fill="#21281f" opacity=".75"/><path d="M${points([poly[0],[x+1,y-1],poly[2]]).replaceAll(' ','L')}M${points([poly[4],[x-1,y+1]]).replaceAll(' ','L')}" stroke="#bdbda4" stroke-width=".6" opacity=".65"/>`;
  });
  for(let j=0;j<6;j++) {
    const vinePoints=rockPath.map(([x,y],i)=>[x+Math.sin(i*1.4+j)*5+(j-3)*.8,y+Math.cos(i*1.8+j)*4]);
    vines+=`<path d="M${points(vinePoints).replaceAll(' ','L')}Z" stroke="${['#1b2f0a','#354418','#788d23','#495c0c','#b0ac3a','#586318'][j]}" stroke-width="${j%2?1.1:2}" stroke-linejoin="round"/>`;
  }
  const cragPositions=[[33,39,-20],[55,31,-35],[82,22,16],[117,22,28],[143,30,-18],[167,39,40],[183,66,-20],[185,105,15],[188,144,-12],[188,188,15],[188,253,-20],[177,286,36],[150,304,-33],[65,305,22],[34,289,-35],[18,250,10],[18,209,-20],[18,163,15],[18,121,-15],[18,77,32]];
  cragPositions.forEach(([x,y,angle],i)=>{
    const sy=.62+rand()*.5,sx=.68+rand()*.5;
    crags+=`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${n(sx)} ${n(sy)})"><path d="M-6-9L1-13L8-4L5 8L-2 12L-8 3Z" fill="${i%3?'#737c68':'#969b83'}" stroke="#252b21" stroke-width="1.1"/><path d="M-6-9L1-13L1-3L-3 4L-8 3Z" fill="#a8ae99"/><path d="M1-13L8-4L4-1L1-3Z" fill="#969d87"/><path d="M4-1L5 8L-2 12L-3 4Z" fill="#4c5344"/><path d="M-6-9L-3-4L1-3L-3 4L-2 12M1-3L4-1L8-4M-8 3L-3 4" stroke="#c2c4aa" stroke-width=".55"/><path d="M-5-6L-3-6M1 0L2 2M-5 2L-1 1M2-7L4-5M0 7L2 5" stroke="#333e2b" stroke-width=".7"/></g>`;
  });
  for(let i=0;i<120;i++) {
    const [bx,by]=rockPath[Math.floor(rand()*rockPath.length)],x=n(bx+rand()*17-8),y=n(by+rand()*19-9),angle=n(rand()*360);
    leaves+=`<path d="M0 0Q-2-5 0-8Q4-5 0 0Z" transform="translate(${x} ${y}) rotate(${angle})" fill="${['#8c9b1d','#556c10','#c1b73d','#364810','#7e942b'][i%5]}" opacity="${n(.45+rand()*.5)}"/>`;
  }
  for(let i=0;i<65;i++) {
    const x=25+rand()*150,y=35+rand()*160;
    magic+=`<path d="M${n(x)} ${n(y)}l${n(rand()*14-7)} ${n(rand()*12-6)} ${n(rand()*15-7)} ${n(rand()*14-7)} ${n(rand()*12-6)} ${n(rand()*16-8)}" stroke="${i%5===0?'#c8ce4c':'#17ca78'}" stroke-width="${n(.25+rand()*.45)}" opacity="${n(.2+rand()*.7)}"/>`;
  }
  let veins='';
  for(let i=0;i<40;i++) {
    let x=55+rand()*116,y=75+rand()*133;
    veins+=`<path d="M${n(x)} ${n(y)}l${n(rand()*12-6)} ${n(rand()*17)} ${n(rand()*12-6)} ${n(rand()*12)} ${n(rand()*15-7)} ${n(rand()*10)}" stroke="${i%3?'#31d99b':'#7ba87a'}" stroke-width=".6" opacity=".6"/>`;
  }
  return svg(`
    <path d="${inner}" fill="#041d17" stroke="#202b1a" stroke-width="6"/>
    <g clip-path="url(#forest-inner)">
      <rect x="10" y="10" width="180" height="306" fill="url(#forest-soul)"/>
      <path d="M24 205Q87 164 84 111T161 46M39 182Q57 125 137 110T164 41M26 115Q53 127 69 75T146 51M173 189Q117 155 143 116T115 51" stroke="#14cf79" stroke-width="7" opacity=".22" filter="url(#forest-haze)"/>
      <path d="M25 208Q39 172 61 162T73 109Q66 91 77 73T98 56Q112 48 114 31M174 203Q163 180 164 164T147 141Q146 124 155 108T158 76Q145 75 140 57M29 95l18-13 12 1 8-14-3-19M174 73l-20-9-3-13M31 167l13-8-3-18 17-13 9-20M168 167l-12-11 8-11-8-9" stroke="#35cd83" stroke-width=".8" opacity=".8"/>
      <path d="M48 58Q75 40 105 43T165 59M31 209Q100 195 176 210" stroke="#5b8d25" stroke-width="1.3" opacity=".5"/>
      ${magic}${dust(871,650,'#29d582',[20,29,165,196])}
      <path d="${forestBody}" fill="#031a1a" stroke="#59d7a2" stroke-width=".9"/>
      <path d="${forestBody}" fill="url(#forest-person)"/>
      <g clip-path="url(#forest-portrait)">${veins}${dust(878,330,'#9bb96e',[49,77,130,135])}<path d="M102 79l-3 20 5 13-2 20 8 15 5 19-8 18 8 23M84 111l14 4 18-5 19 5M92 140l12-5 16 6 12-4M76 180l28 8 17-8 31 8M61 198l30-7 10 18 21-9 32 5" stroke="#67ae69" stroke-width=".65" opacity=".7"/></g>
      <path d="M94 155q14 14 30-2M98 165l12 14 15-14M83 106q9-4 12-17M124 91l7 9M108 116l-2 12 5 2" stroke="#9bbd78" stroke-width=".7" opacity=".65"/>
      <rect x="22" y="231" width="162" height="86" fill="url(#forest-bottom)"/>
    </g>
    ${rocks}${vines}${crags}
    <path d="M103 1L98 18L87 28L98 28L104 40L110 28L121 25L110 19Z" fill="#9a9f83" stroke="#262f23" stroke-width="1"/><path d="M103 1L105 19L113 26L104 36L99 25Z" fill="#d7d2bc"/><path d="M103 1L103 24L104 36M99 25L103 24L110 19M103 24L113 26" stroke="#464f3c" stroke-width=".9"/>
    ${leaves}
    <g transform="translate(0 -12)">
    <path d="M24 214L47 210L82 213L102 211L130 212L157 211L180 216L178 225L184 234L155 237L125 234L100 237L76 236L51 237L24 232L28 224Z" fill="#999a84" stroke="#252c20" stroke-width="2"/>
    <path d="M28 215L66 216L82 214L112 216L147 214L175 217L172 230L146 232L117 230L90 232L61 230L31 232Z" fill="#bab8a0"/>
    <path d="M30 216l10 5-8 6m16-12 7 5-2 6m85-11-3 5 11 4-5 7m26-14-6 4 9 6M31 234l7-5m136 0 4 4" stroke="#5b5e4e" stroke-width=".8"/>
    ${dust(872,130,'#292d23',[25,212,155,23])}
    </g>
  `, `<clipPath id="forest-inner"><path d="${inner}"/></clipPath><clipPath id="forest-portrait"><path d="${forestBody}"/></clipPath><radialGradient id="forest-soul" cx="52%" cy="38%" r="68%"><stop stop-color="#043b2c"/><stop offset=".48" stop-color="#02251c"/><stop offset="1" stop-color="#060d09"/></radialGradient><radialGradient id="forest-person" cx="50%" cy="30%"><stop stop-color="#13483e" stop-opacity=".24"/><stop offset="1" stop-color="#03121c" stop-opacity=".88"/></radialGradient><linearGradient id="forest-bottom" x2="0" y2="1"><stop stop-color="#060c09" stop-opacity=".7"/><stop offset="1" stop-color="#080d09"/></linearGradient><filter id="forest-haze"><feGaussianBlur stdDeviation="3"/></filter>`);
}

function cathedralArt() {
  const rand=random(919);
  const frame='M9 56Q20 32 68 17L100 3L132 17Q181 34 191 56L191 281L100 318L9 281Z';
  const shape='M16 58Q27 36 72 22L100 10L128 22Q174 37 184 58L184 277L100 310L16 277Z';
  const colors=['#174a9c','#16628e','#255cb2','#8d1978','#ba285c','#d9a933','#1d898e','#224079','#23256c','#6a2a9c','#a5821f','#136d74','#205ab5'];
  let panes='';
  const rows=[];
  for(let y=12;y<319;y+=19) {
    const row=[];for(let x=8;x<205;x+=19)row.push([x+rand()*12-6,y+rand()*13-6]);rows.push(row);
  }
  for(let y=0;y<rows.length-1;y++)for(let x=0;x<rows[y].length-1;x++) {
    const a=rows[y][x],b=rows[y][x+1],c=rows[y+1][x],d=rows[y+1][x+1];
    for(const triangle of [[a,b,c],[b,c,d]])panes+=`<polygon points="${points(triangle)}" fill="${colors[Math.floor(rand()*colors.length)]}" stroke="#121613" stroke-width="1"/><path d="M${points([triangle[0],triangle[1]]).replaceAll(' ','L')}" stroke="#b99a44" stroke-width=".35" opacity=".6"/>`;
  }
  let rose='',portraitPanes='';
  for(let i=0;i<8;i++) {
    const angle=i*45;
    rose+=`<path d="M100 32Q87 43 100 58Q113 43 100 32Z" transform="rotate(${angle} 100 65)" fill="${i%2?'#dda816':'#17699f'}" stroke="#282412" stroke-width="1.6"/><path d="M100 25L108 34L100 40L92 34Z" transform="rotate(${angle} 100 65)" fill="${i%3?'#bb941e':'#a52e6b'}" stroke="#2d2913" stroke-width="1"/>`;
  }
  const portrait='M42 222L43 194L50 174L65 162L81 155L86 143L80 131L77 115Q76 95 97 91Q119 88 124 109L122 128L113 145L115 155L136 164L150 178L157 201L162 224Z';
  for(let i=0;i<90;i++) {
    const x=35+rand()*136,y=90+rand()*141;
    portraitPanes+=`<path d="M${n(x)} ${n(y)}l${n(6+rand()*13)} ${n(rand()*10)}l${n(rand()*14-14)} ${n(7+rand()*14)}Z" fill="${['#175e7d','#234d8e','#176c88','#195654','#2a3b77','#682767','#144d61'][i%7]}" stroke="#102322" stroke-width=".6" opacity=".9"/>`;
  }
  let goldDetail='';
  for(let i=0;i<50;i++) {
    const y=50+i*4.5;
    goldDetail+=`<path d="M10 ${n(y)}h5m170 0h5" stroke="#b79735" stroke-width=".5"/>`;
  }
  return svg(`
    <path d="${frame}" fill="#171518" stroke="#8e7333" stroke-width="1.4"/>
    <path d="M12 57Q25 34 69 20L100 7L131 20Q176 35 188 57L188 279L100 314L12 279Z" stroke="#e0bd57" stroke-width="1.2"/>
    <g clip-path="url(#cathedral-window)">${panes}
      <path d="M20 287V78Q23 50 48 44Q70 51 70 78V296M130 297V78Q133 50 157 44Q180 51 181 78V286" stroke="#151616" stroke-width="4"/>
      <path d="M20 287V78Q23 50 48 44Q70 51 70 78V296M130 297V78Q133 50 157 44Q180 51 181 78V286" stroke="#b89730" stroke-width="1.1"/>
      <path d="M18 144Q40 118 68 141M130 143Q155 116 183 140M18 193Q40 174 70 190M131 190Q154 170 182 193M46 45V285M156 45V285" stroke="#24241a" stroke-width="3"/>
      <path d="M18 144Q40 118 68 141M130 143Q155 116 183 140M18 193Q40 174 70 190M131 190Q154 170 182 193M46 45V285M156 45V285" stroke="#c0a136" stroke-width=".8"/>
      <circle cx="100" cy="65" r="43" fill="#282555" stroke="#b49a3b" stroke-width="2"/>
      <circle cx="100" cy="65" r="38" stroke="#d7b34f" stroke-width="1"/>
      ${rose}<path d="M100 53L105 60L114 61L108 68L109 77L100 73L92 78L92 68L86 61L95 59Z" fill="#e6ba2d" stroke="#2a291b" stroke-width="1.5"/>
      <circle cx="100" cy="65" r="5" fill="#2a809f" stroke="#39351a" stroke-width="1"/>
      <path d="M100 15Q73 28 66 45M100 15Q126 29 135 45M30 51Q38 31 74 26M169 51Q162 32 127 26" stroke="#dfb43d" stroke-width="1.2"/>
      <path d="${portrait}" fill="#10394a" stroke="#c2a149" stroke-width="1.3"/>
      <g clip-path="url(#cathedral-person)">${portraitPanes}<rect x="34" y="91" width="130" height="140" fill="url(#cathedral-figure)"/></g>
      <path d="M82 112l5-12 10-6 13 4 9 12M79 119l7 5 2 14 10 11 12-4 8-12M86 145l10 11 15-7M81 157l15 11 19-12M95 168l-1 49M59 174l15 13 4 32M136 175l-14 14-5 31" stroke="#ac9957" stroke-width=".75" opacity=".68"/>
      <path d="M28 124l7-4-7-4-1-9-5 7-8 1 5 5-3 8 9-3 5 5Z" fill="#d8b633" stroke="#272213" stroke-width="1"/>
      <path d="M26 111v18m-9-9h18m-15-6 12 12m0-12-12 12" stroke="#f4d46d" stroke-width=".6"/>
      <path d="M19 243H182V278L100 307L19 277Z" fill="#101515" opacity=".68"/>
      ${dust(912,600,'#e4bc63')}
    </g>
    <path d="${shape}" stroke="#bd9d3c" stroke-width="1"/>
    <path d="M21 60Q31 40 76 25L100 16L125 26Q168 40 179 59L179 273L100 304L21 273Z" stroke="#d8b747" stroke-width=".6"/>
    ${goldDetail}
    <path d="M100 1L111 10L100 20L89 10Z" fill="#282322" stroke="#bba65e" stroke-width=".7"/><path d="M100 5L106 10L100 16L94 10Z" fill="#794259" stroke="#d5bd75" stroke-width=".7"/>
    <g transform="translate(0 -8)">
    <path d="M14 219L28 225L28 236L12 241L18 230Z M186 219L172 225L172 236L188 241L181 230Z" fill="#a57e1e" stroke="#3a2a0f" stroke-width="1.2"/>
    <path d="M25 221L174 221L174 240L25 240Z" fill="#ba9541" stroke="#392b16" stroke-width="1.8"/>
    <path d="M29 224H170V237H29Z" fill="#d5b86a" stroke="#e6cb82" stroke-width=".65"/>
    <path d="M29 224l7 6-7 7M169 224l-7 6 7 7" stroke="#9a7436" stroke-width=".5"/>
    ${dust(914,100,'#68501a',[29,224,141,13])}
    </g>
  `, `<clipPath id="cathedral-window"><path d="${shape}"/></clipPath><clipPath id="cathedral-person"><path d="${portrait}"/></clipPath><linearGradient id="cathedral-figure" x1="100" y1="91" x2="100" y2="220" gradientUnits="userSpaceOnUse"><stop stop-color="#020c17" stop-opacity=".8"/><stop offset=".4" stop-color="#04141b" stop-opacity=".25"/><stop offset="1" stop-color="#003a50" stop-opacity=".1"/></linearGradient>`);
}

export const artisticThemes = {
  blueprint: {art: blueprintArt()},
  comic: {art: comicArt()},
  forest: {art: forestArt()},
  cathedral: {art: cathedralArt()},
};
