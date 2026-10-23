// The artwork is drawn with SVG primitives. No raster imagery is used.
const random = (seed) => () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
const repeat = (count, callback) => Array.from({ length: count }, (_, i) => callback(i)).join('');
const svg = (content, cls = '') => `<svg class="electric-art ${cls}" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">${content}</svg>`;
const portrait = 'M31 213 L37 184 Q41 161 67 153 L82 147 L88 135 Q81 128 80 116 Q74 113 77 101 L79 94 Q75 66 93 59 Q108 50 124 61 Q137 67 135 91 L138 98 L135 114 Q134 127 121 137 L123 147 L147 157 Q166 165 171 187 L178 213 Z';

function cyberArt() {
  const rng = random(21337);
  const outline = 'M10 35 L38 14 L78 12 L91 17 L101 8 L113 15 L152 10 L172 27 L188 35 L188 274 Q188 291 171 296 L100 319 L28 297 Q10 291 10 274 Z';
  const circuits = repeat(100, () => {
    const x = 14 + rng() * 172, y = 15 + rng() * 275;
    const color = ['#00b5ed', '#0343ab', '#8f15e5', '#c417ce'][Math.floor(rng() * 4)];
    return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}h${(rng()*22-11).toFixed(1)}v${(rng()*25-12).toFixed(1)}h${(rng()*16-8).toFixed(1)}" stroke="${color}" stroke-width="${rng() > .86 ? 1.2 : .35}" opacity="${(.16+rng()*.6).toFixed(2)}"/><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${rng() > .9 ? 3 : 1.2}" height="${rng()>.85 ? 5 : 1.3}" fill="${color}" opacity=".7"/>`;
  });
  const points = [[103,59],[91,66],[82,80],[80,94],[82,109],[87,126],[98,138],[111,141],[123,131],[132,115],[135,97],[133,80],[123,65],[112,62],[99,77],[88,88],[104,98],[118,84],[124,106],[111,118],[95,117],[107,132],[88,142],[80,153],[66,160],[52,169],[41,186],[49,211],[73,203],[87,184],[96,166],[108,158],[119,147],[129,156],[151,168],[165,186],[169,209],[146,204],[128,185],[113,192],[104,210],[86,211]];
  const edges = [[0,1],[0,13],[1,2],[1,14],[2,3],[2,15],[3,4],[3,15],[4,5],[4,20],[5,6],[5,20],[6,7],[6,21],[7,8],[7,21],[8,9],[8,19],[9,10],[9,18],[10,11],[10,17],[11,12],[11,17],[12,13],[12,17],[13,14],[13,17],[14,15],[14,16],[14,17],[15,16],[15,20],[16,17],[16,18],[16,19],[16,20],[17,18],[18,19],[19,20],[19,21],[20,21],[6,22],[7,22],[8,32],[22,23],[23,24],[24,25],[25,26],[26,27],[27,28],[28,29],[29,30],[30,22],[23,30],[24,29],[25,29],[25,28],[26,28],[30,31],[31,32],[31,33],[32,33],[33,34],[34,35],[35,36],[36,37],[37,38],[38,33],[38,31],[31,39],[39,40],[40,41],[41,28],[29,39],[30,39],[28,41],[38,39],[37,39],[34,38],[35,37]];
  const web = edges.map(([a,b]) => `<path d="M${points[a]}L${points[b]}"/>`).join('');
  const subdivisions = [[86,73,92,82],[92,82,99,77],[92,82,88,88],[92,82,104,98],[104,98,109,85],[109,85,118,84],[109,85,112,62],[109,85,122,75],[122,75,133,80],[122,75,118,84],[117,98,124,106],[117,98,118,84],[117,98,104,98],[88,103,95,117],[88,103,104,98],[88,103,80,94],[102,111,111,118],[102,111,104,98],[102,111,95,117],[114,128,123,131],[114,128,107,132],[114,128,111,118],[81,164,87,184],[81,164,66,160],[139,168,128,185],[139,168,151,168]].map(([x,y,xx,yy])=>`M${x} ${y}L${xx} ${yy}`).join('');
  const triangles = ['103,59 91,66 99,77','91,66 82,80 88,88 99,77','112,62 123,65 118,84','82,109 87,126 95,117','123,131 132,115 111,118','66,160 52,169 87,184','129,156 151,168 128,185','104,98 118,84 124,106','49,211 73,203 41,186'];
  return svg(`<defs>
    <linearGradient id="cy-panel" x2=".8" y2="1"><stop stop-color="#080c2e"/><stop offset=".52" stop-color="#090a20"/><stop offset="1" stop-color="#03080e"/></linearGradient>
    <linearGradient id="cy-edge" x2="1" y2="1"><stop stop-color="#d222ed"/><stop offset=".3" stop-color="#00d5ff"/><stop offset=".55" stop-color="#6428fa"/><stop offset=".85" stop-color="#d82bd3"/><stop offset="1" stop-color="#009aff"/></linearGradient>
    <linearGradient id="cy-person" x2=".6" y2="1"><stop stop-color="#003b5e"/><stop offset=".45" stop-color="#061128"/><stop offset="1" stop-color="#080b21"/></linearGradient>
    <pattern id="cy-grid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M15 0H0V15" fill="none" stroke="#2041b5" stroke-width=".4" opacity=".35"/><circle cx="0" cy="0" r=".7" fill="#2068aa"/></pattern>
    <clipPath id="cy-clip"><path d="${outline}"/></clipPath>
    <filter id="cy-glow"><feGaussianBlur stdDeviation="1.5"/></filter>
  </defs>
  <path d="${outline}" fill="#01030b" stroke="#050508" stroke-width="7"/>
  <path d="${outline}" fill="url(#cy-panel)" stroke="url(#cy-edge)" stroke-width="2"/>
  <path d="${outline}" transform="translate(4 5) scale(.96 .966)" fill="none" stroke="#265a9b" stroke-width=".7"/>
  <path d="${outline}" transform="translate(7 8) scale(.93 .948)" fill="none" stroke="#8a24d5" stroke-width=".7"/>
  <g clip-path="url(#cy-clip)"><rect x="8" y="10" width="185" height="310" fill="url(#cy-grid)"/>${circuits}
  <g fill="none" stroke="#6f26d7" stroke-width=".5" opacity=".55"><path d="M40 17L79 50 110 17 164 53 185 37M12 58L64 47 95 74 151 39 183 76M16 159L46 143 31 119 72 100M31 302L64 285 103 308 137 290 173 295"/></g>
  <g transform="translate(0 -8)">
  <path d="${portrait}" fill="none" stroke="#046ad4" stroke-width="5" opacity=".3" filter="url(#cy-glow)"/>
  <path d="${portrait}" fill="url(#cy-person)" stroke="#009bc8" stroke-width=".75"/>
  <g fill="#0079b9" opacity=".24">${triangles.map(p=>`<polygon points="${p}"/>`).join('')}</g>
  <g fill="none" stroke="#087bb9" stroke-width=".55" opacity=".5">${web}</g>
  <path d="${subdivisions}" fill="none" stroke="#087bb9" stroke-width=".35" opacity=".45"/>
  <path d="M80 94L82 80 91 66 103 59 112 62 123 65 132 80M80 98L78 107 82 114M89 137L82 147 67 153 52 161 42 176M124 148L146 158 159 168" fill="none" stroke="#03ccff" stroke-width="1.4"/>
  <path d="M38 188L35 205M165 182L170 199M95 63L105 58 113 60" fill="none" stroke="#a547f8" stroke-width="1.2"/>
  <g fill="#10c9ed">${points.map((p,i)=>i%3===0?`<rect x="${p[0]-.7}" y="${p[1]-.7}" width="1.4" height="1.4"/>`:'').join('')}</g>
  </g>
  <path d="M17 204H184V315H17Z" fill="#030913" opacity=".35"/>
  <path d="M19 270V281L34 289M181 270V281L163 288M28 296L98 317 173 294" fill="none" stroke="#00aadb" stroke-width=".7"/>
  </g>
  <g stroke="#03bce8" fill="#02a7d2"><path d="M91 8V1l4 2v19M139 13V1h4v18M157 20V12M187 157v63M20 200v25" stroke-width="1"/><path d="M151 9h14M175 29h14M23 303l16 5M65 316l14 3" stroke-width="1.4"/></g>
  <g stroke="#a420d7" stroke-width="1.6"><path d="M8 214H22M7 223H16M178 38h13M174 47h19M184 270h8M26 12h19M58 13h20M178 33v17M11 172v14"/></g>
  <g transform="translate(33 105)" fill="#04bddb" opacity=".8"><path d="M3 3h3v3h-3zM15 3h3v3h-3zM6 6h9v3H6zM3 9h15v6H3zM0 12h3v6H0zM18 12h3v6h-3zM3 18h6v3H3zM12 18h6v3h-6z"/><path d="M6 10h3v3H6zM12 10h3v3h-3z" fill="#050f29"/></g>
  `, 'cyber-art');
}

function hologramArt() {
  const rng = random(975);
  const rim = 'M100 5C151 5 188 40 188 89V247C188 286 152 315 100 315S12 286 12 247V89C12 40 49 5 100 5Z';
  const rings = [34,42,49,58,68,77,85].map((r,i)=>`<circle cx="101" cy="126" r="${r}" stroke="${i%2?'#0ba28e':'#4e847c'}" stroke-width="${i%3===0?1:.4}" stroke-dasharray="${i%2 ? `${r*.6} 6 2 3 14 9` : `${r*1.4} 4 20 13`}" transform="rotate(${i*47} 101 126)" opacity="${.35+i*.05}"/>`).join('');
  const ticks = repeat(84,i=>{const a=(i/84)*Math.PI*2,r=79;return `<path d="M${101+Math.cos(a)*r} ${126+Math.sin(a)*r}L${101+Math.cos(a)*(r+(i%7===0?5:2))} ${126+Math.sin(a)*(r+(i%7===0?5:2))}" stroke="${i%5?'#18786e':'#00f3d2'}" stroke-width="${i%7? .55:1.3}"/>`;});
  const details = repeat(150,()=> {const x=19+rng()*163,y=12+rng()*295;return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}h${(1+rng()*8).toFixed(1)}" stroke="${rng()>.7?'#02bda4':'#235d54'}" stroke-width="${rng()>.9?2:.5}" opacity="${.3+rng()*.6}"/>`;});
  const scanPerson = 'M43 208L44 186Q46 167 69 161L84 153L89 143Q79 134 78 117L75 108 79 101Q74 80 87 70Q100 59 115 67Q129 72 128 97L131 104 127 117Q126 134 113 143L115 154 135 164Q155 171 158 188L161 207Z';
  // Fine scan grain is batched into two paths rather than hundreds of nodes.
  const grainRng = random(976);
  const grain = [0,1].map(layer=>`<path d="${repeat(120,i=>{const head=i<70,x=(head?78:40)+grainRng()*(head?53:122),y=(head?65:145)+grainRng()*(head?80:65);return `M${x.toFixed(1)} ${y.toFixed(1)}h${(.3+grainRng()*.8).toFixed(1)}`;})}" stroke="${layer?'#22bca0':'#0c7864'}" stroke-width=".55" opacity=".6"/>`).join('');
  return svg(`<defs>
    <linearGradient id="ho-rim" x2="1" y2=".5"><stop stop-color="#6b7773"/><stop offset=".14" stop-color="#111c1a"/><stop offset=".5" stop-color="#8c9990"/><stop offset=".7" stop-color="#10241f"/><stop offset="1" stop-color="#466b61"/></linearGradient>
    <radialGradient id="ho-bg"><stop stop-color="#032a24"/><stop offset=".6" stop-color="#041511"/><stop offset="1" stop-color="#030909"/></radialGradient>
    <linearGradient id="ho-fade" x2="0" y2="1"><stop stop-color="#071614"/><stop offset="1" stop-color="#051412"/></linearGradient>
    <clipPath id="ho-clip"><path d="${rim}"/></clipPath>
    <clipPath id="ho-person"><path d="${scanPerson}"/></clipPath>
    <pattern id="ho-grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" fill="none" stroke="#1b554d" stroke-width=".3" opacity=".35"/></pattern>
  </defs>
  <path d="${rim}" fill="#020706" stroke="#030707" stroke-width="6"/>
  <path d="${rim}" fill="url(#ho-bg)" stroke="url(#ho-rim)" stroke-width="2"/>
  <path d="${rim}" transform="translate(3 3) scale(.97 .981)" fill="none" stroke="#637b72" stroke-width=".55"/>
  <path d="${rim}" transform="translate(7 6) scale(.93 .962)" fill="none" stroke="#0dd5b3" stroke-width="1.4" stroke-dasharray="27 7 9 5 2 8 37 11 4 3"/>
  <path d="${rim}" transform="translate(10 8) scale(.9 .948)" fill="none" stroke="#087a66" stroke-width=".8"/>
  <g clip-path="url(#ho-clip)"><rect x="15" y="8" width="170" height="310" fill="url(#ho-grid)"/>${details}
  <g fill="none">${rings}${ticks}<path d="M23 124H45M155 124H177M101 39V57M101 195V212" stroke="#3e9a84" stroke-width=".5"/><path d="M25 131h9M169 131h8M23 137h11M169 137h8" stroke="#00a18a" stroke-width="1.5"/>
  <path d="M57 41Q101 18 145 41M38 62L30 71M163 60l8 11M36 222v12h14M150 234h14v-12" stroke="#00ba9f" stroke-width="1.3"/>
  </g>
  <path d="${scanPerson}" fill="url(#ho-fade)" stroke="#09a98f" stroke-width=".7"/>
  <g clip-path="url(#ho-person)">${grain}${repeat(45,()=>{const x=40+rng()*122,y=65+rng()*145;return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}h${(rng()*7).toFixed(1)}" stroke="${rng()>.8?'#08aa8f':'#146e5e'}" stroke-width=".4" opacity="${(rng()*.65).toFixed(2)}"/>`;})}<rect x="40" y="60" width="125" height="150" fill="url(#ho-grid)"/></g>
  <path d="M82 97Q78 79 90 72Q106 62 119 75M78 108L83 125 90 138M116 141l-3 9 5 8 19 10M83 155l-14 10-18 10M64 188l18-10 17 9 18-11 24 12" fill="none" stroke="#0c7c68" stroke-width=".7"/>
  <path d="M68 174Q98 191 131 174M59 198Q98 210 146 197" fill="none" stroke="#04664f" stroke-width=".45"/>
  <path d="M27 213H174V293Q99 325 27 291Z" fill="#040c0b" opacity=".55"/>
  <g stroke="#0c8676" fill="none" stroke-width=".7"><path d="M28 238h144M34 270h132M50 294h100" opacity=".5"/><path d="M28 245v14M172 245v14"/><path d="M44 286l5 5h12M139 291h13l5-5"/></g>
  <g fill="#00bca5"><rect x="85" y="15" width="18" height="2"/><rect x="111" y="16" width="13" height="2"/><rect x="36" y="54" width="4" height="5" transform="rotate(37 38 56)"/><rect x="159" y="56" width="5" height="3" transform="rotate(-35 161 57)"/><rect x="178" y="89" width="2" height="11"/><rect x="18" y="190" width="2" height="13"/><rect x="57" y="299" width="7" height="2"/></g>
  </g>
  <g transform="translate(34 110)" stroke="#04bba3" fill="none" stroke-width=".8"><path d="M0 3l5-2 4 4-2 6-6 1-3-5zM8 13l4-3 3 5-4 5-4-2M1 16l2 5-4 2M10-2l3-3 2 5"/><path d="M-2 4l10 7M4 0l-2 13M9 13l6 3"/></g>
  `, 'hologram-art');
}

function cosmicArt() {
  const rng = random(92345);
  const outline = 'M100 5L188 51L188 273L100 317L11 273L11 51Z';
  const stars = repeat(330,()=> {const x=10+rng()*180,y=12+rng()*292,r=rng()>.96?1:.15+rng()*.45;return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="${['#edacff','#9b68ed','#518aef','#fff0ff'][Math.floor(rng()*4)]}" opacity="${.15+rng()*.85}"/>`;});
  const veins = repeat(55,()=>{let x=122+(rng()-.5)*50,y=40+rng()*118;let d=`M${x} ${y}`;for(let j=0;j<6;j++){x+=(rng()-.7)*18;y+=rng()*13;d+=`L${x.toFixed(1)} ${y.toFixed(1)}`;}return `<path d="${d}" stroke="${rng()>.5?'#e037f0':'#6946ef'}" stroke-width="${rng()*.9+.2}" opacity="${rng()*.6+.2}"/>`;});
  const person = 'M35 226L43 201Q47 182 69 174L88 163 93 149Q84 142 85 127L81 119 86 110Q83 86 98 80Q116 74 129 88Q136 98 132 113L135 119 131 133Q129 144 119 150L119 163 141 175Q157 182 163 204L168 225Z';
  const dustRng = random(92346);
  const streams = [[[127,24],[116,49],[129,71],[141,91],[133,118],[151,141],[137,175]],[[118,64],[102,92],[94,119],[78,137],[83,151],[58,167],[42,194]]];
  const nebulaDust = [0,1].map(layer=>`<path d="${repeat(150,i=>{const stream=streams[i%2],v=dustRng()*(stream.length-1),j=Math.floor(v),f=v-j,x=stream[j][0]*(1-f)+stream[j+1][0]*f+(dustRng()-.5)*24,y=stream[j][1]*(1-f)+stream[j+1][1]*f+(dustRng()-.5)*14;return `M${x.toFixed(1)} ${y.toFixed(1)}h${(.2+dustRng()*.65).toFixed(1)}`;})}" fill="none" stroke="${layer?'#f3a2f3':'#ba50e3'}" stroke-width=".55" opacity="${layer?.65:.55}"/>`).join('');
  return svg(`<defs>
    <linearGradient id="co-base" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#050a1b"/><stop offset=".43" stop-color="#100722"/><stop offset="1" stop-color="#110729"/></linearGradient>
    <linearGradient id="co-edge" x2=".6" y2="1"><stop stop-color="#83bcf6"/><stop offset=".17" stop-color="#6433ce"/><stop offset=".5" stop-color="#d728f5"/><stop offset=".77" stop-color="#3266ad"/><stop offset="1" stop-color="#e2ab88"/></linearGradient>
    <linearGradient id="co-glass" x2="1" y2="1"><stop stop-color="#7de8ff"/><stop offset=".3" stop-color="#7088e1"/><stop offset=".7" stop-color="#25164a"/><stop offset="1" stop-color="#ab5bea"/></linearGradient>
    <linearGradient id="co-person" x2="1" y2="1"><stop stop-color="#0a0620"/><stop offset="1" stop-color="#0e0a24"/></linearGradient>
    <radialGradient id="co-haze"><stop stop-color="#e02cf4" stop-opacity=".8"/><stop offset=".28" stop-color="#6f19c7" stop-opacity=".7"/><stop offset="1" stop-color="#510ba1" stop-opacity="0"/></radialGradient>
    <filter id="co-cloud"><feTurbulence type="fractalNoise" baseFrequency=".035 .055" numOctaves="4" seed="17"/><feColorMatrix type="matrix" values=".8 0 0 0 .08  0 0 0 0 0  .9 0 0 0 .15  1.9 0 0 0 -.85"/><feGaussianBlur stdDeviation=".35"/></filter>
    <filter id="co-glow"><feGaussianBlur stdDeviation="2.1"/></filter>
    <clipPath id="co-clip"><path d="${outline}"/></clipPath><clipPath id="co-personclip"><path d="${person}"/></clipPath>
  </defs>
  <path d="${outline}" fill="#02040c" stroke="#02030b" stroke-width="6"/>
  <path d="${outline}" fill="url(#co-base)" stroke="url(#co-edge)" stroke-width="1.5"/>
  <g clip-path="url(#co-clip)"><ellipse cx="115" cy="111" rx="72" ry="108" fill="url(#co-haze)"/><rect x="17" y="26" width="168" height="208" filter="url(#co-cloud)" opacity=".7"/>
  <path d="M140 28L112 62 134 84 100 117 112 136 65 171 70 190 47 210" stroke="#ed39f1" stroke-width="10" opacity=".45" fill="none" filter="url(#co-glow)"/>
  <path d="M133 37L118 60 130 79 111 105 99 113 109 132 92 143 86 159 67 167 73 178 59 192" stroke="#ff94fc" stroke-width="1.2" opacity=".8" fill="none"/>
  <g fill="none">${veins}</g>${nebulaDust}${stars}
  <g fill="#ffdfff"><path d="M115 68l1-6 1 6 5 1-5 1-1 5-1-5-5-1z"/><path d="M71 164l1-5 1 5 5 1-5 1-1 5-1-5-5-1z"/><path d="M143 100l.6-4 .6 4 3 .6-3 .6-.6 4-.6-4-3-.6z"/></g>
  <path d="${person}" fill="none" stroke="#bb28e9" stroke-width="2.5" opacity=".5" filter="url(#co-glow)"/>
  <path d="${person}" fill="url(#co-person)" stroke="#7731bd" stroke-width=".8"/>
  <g clip-path="url(#co-personclip)" fill="none" opacity=".75"><path d="M128 93l-12 16 4 13-16 14 7 17-20 19 7 15-23 21-8 20M140 173l-17 12-4 21-19 10M52 211l13-14-2-12 22-12M99 84l4 12-11 11 3 14" stroke="#ab2add" stroke-width=".6" stroke-dasharray="2 1.5 5 2.5"/><path d="M127 104l-10 8 2 9-13 15M110 153l-9 9 2 4-12 7M77 208l-8 11M141 175l-12 6-6 12" stroke="#e74be7" stroke-width=".7" stroke-dasharray="3 1 1 2"/>${repeat(85,()=>`<circle cx="${44+rng()*115}" cy="${85+rng()*143}" r="${rng()*.65}" fill="${rng()>.6?'#f260ee':'#5550c0'}" opacity=".65"/>`)}</g>
  <path d="M88 103l1-11 8-10 11-3M134 178l13 8 10 19M72 177l-15 10-9 17" stroke="#c354ef" stroke-width=".8" fill="none"/>
  <path d="M14 225H188V278L100 317 14 273Z" fill="#05091b" opacity=".65"/>
  </g>
  <g stroke="url(#co-edge)" stroke-width=".7">
  <path d="M100 5L99 12 17 55 11 51Z" fill="url(#co-glass)"/><path d="M100 5L188 51 181 55 99 12Z" fill="url(#co-glass)"/><path d="M11 51L17 55 17 270 11 273Z" fill="#211044"/><path d="M188 51L181 55 181 270 188 273Z" fill="#34134c"/><path d="M11 273L17 270 100 310 100 317Z" fill="#221e37"/><path d="M188 273L181 270 100 310 100 317Z" fill="#242635"/>
  <path d="M100 5L135 34 114 27Z" fill="#a5d5ec" opacity=".7"/><path d="M99 12L67 30 53 30 100 5Z" fill="#91b1f5" opacity=".3"/><path d="M14 52L33 26 31 44 17 55Z" fill="#1c2865"/><path d="M181 55L162 38 188 51Z" fill="#aa73d7" opacity=".7"/>
  <path d="M12 191l5 25-4 32M184 120l-3 22 6 26M17 270l27 20-2-13M100 310l-12 2 12 5M181 270l-24 23-13 4" fill="none"/>
  </g>
  <path d="M19 59L100 15 179 59V268L100 307 19 268Z" fill="none" stroke="#9e3dd6" stroke-width=".5" opacity=".8"/>
  <g fill="#5532bc" stroke="#8a4ddc" stroke-width=".5"><path d="M36 35L39 2 61 15Z"/><path d="M53 28L72 10 64 29Z"/><path d="M187 214l9 13-7 15Z"/><path d="M9 121L4 136 10 152Z"/></g>
  <path d="M36 35L39 2 46 13" fill="none" stroke="#aa7bff" stroke-width="1"/>
  `, 'cosmic-art');
}

function arcadeArt() {
  const rng = random(8719);
  const outline = 'M23 10H178L188 22V64L180 75L181 167L192 196L195 304L187 315H12L5 305L8 197L20 166L21 74L14 64V24Z';
  const scratches = repeat(80,()=>{const x=13+rng()*176,y=15+rng()*294;return `<rect x="${x}" y="${y}" width="${1+rng()*2}" height="${.6+rng()*2}" fill="${['#b42fd0','#fa3d22','#2253ab','#9459dd'][Math.floor(rng()*4)]}" opacity="${.4+rng()*.6}"/>`;});
  // A deliberately low-resolution sprite, with articulated feet and a kicking leg.
  const pixels = [
    '         YY         ',
    '        YYYY        ',
    '        YYY         ',
    '         Y          ',
    '     YYYYYYYY       ',
    '    YYYYYYYYYY   YY ',
    '   YY   YYYYYYYYYY  ',
    '  YY    YYYYY       ',
    ' YY     YYYYY       ',
    '        YYYY        ',
    '       YYYYY        ',
    '     YYYYYYY        ',
    '    YYYY  YY        ',
    '   YYY    YY        ',
    '    YY   YYY        ',
    '         YY         ',
    '         YY         ',
    '        YYYY        ',
  ];
  const spritePaths = ['', '', ''];
  pixels.forEach((row,y)=>[...row].forEach((p,x)=>{if(p==='Y') spritePaths[(x+y)%7===0?0:(x+y)%5===0?1:2]+=`M${(x*3.5).toFixed(1)} ${(y*3.1).toFixed(1)}h3.6v3.2h-3.6Z`;}));
  const player = spritePaths.map((d,i)=>`<path d="${d}" fill="${['#ffe92c','#b6b500','#e1d61b'][i]}"/>`).join('');
  const fieldNoise = repeat(95,()=>`<rect x="${37+rng()*128}" y="${90+rng()*77}" width="${rng()*7+1}" height="${.4+rng()*1.5}" fill="${rng()>.5?'#0da346':'#a8ae14'}" opacity="${rng()*.14+.03}"/>`);
  return svg(`<defs>
    <linearGradient id="ar-body" x2="1" y2=".5"><stop stop-color="#170d24"/><stop offset=".18" stop-color="#060b1c"/><stop offset=".8" stop-color="#0a0c20"/><stop offset="1" stop-color="#261037"/></linearGradient>
    <linearGradient id="ar-rim" x2="1" y2="1"><stop stop-color="#bb44ea"/><stop offset=".25" stop-color="#35166e"/><stop offset=".47" stop-color="#9355d3"/><stop offset=".7" stop-color="#bd15c5"/><stop offset="1" stop-color="#4f218e"/></linearGradient>
    <radialGradient id="ar-screen"><stop stop-color="#087b33"/><stop offset=".65" stop-color="#075027"/><stop offset="1" stop-color="#021d13"/></radialGradient>
    <linearGradient id="ar-control" x2="0" y2="1"><stop stop-color="#4c176a"/><stop offset=".5" stop-color="#1c1640"/><stop offset="1" stop-color="#050817"/></linearGradient>
    <radialGradient id="ar-red" cx=".32" cy=".25"><stop stop-color="#ff6b7d"/><stop offset=".3" stop-color="#ef153f"/><stop offset=".65" stop-color="#a40026"/><stop offset="1" stop-color="#3e071e"/></radialGradient>
    <pattern id="ar-scan" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 1.5H3" stroke="#000d0d" stroke-width=".9" opacity=".45"/></pattern>
    <clipPath id="ar-clip"><path d="${outline}"/></clipPath>
  </defs>
  <path d="${outline}" fill="#02040d" stroke="#020207" stroke-width="7"/>
  <path d="${outline}" fill="url(#ar-body)" stroke="url(#ar-rim)" stroke-width="2"/>
  <path d="M25 12H174L184 23H17ZM18 27H183V63L174 71H28L18 63Z" fill="#080d20" stroke="#9053bd" stroke-width=".7"/>
  <path d="M29 19H171M24 12H79M89 12H137M150 12H175" stroke="#d270e7" stroke-width="1.4"/>
  <path d="M24 27H177V64H25Z" fill="#0e1125" stroke="#bb35d0" stroke-width=".8"/>
  <g clip-path="url(#ar-clip)">${scratches}</g>
  <path d="M31 75H170L176 169 166 178H33L25 169Z" fill="#040912" stroke="#3b2253" stroke-width="2"/>
  <path d="M36 82Q98 78 163 83L168 168Q101 173 32 168Z" fill="#010a09" stroke="#08170f" stroke-width="4"/>
  <path d="M39 87Q100 83 159 87L163 164Q101 169 36 164Z" fill="url(#ar-screen)" stroke="#143f26" stroke-width=".8"/>
  <g opacity=".16" stroke="#44a750" stroke-width=".55" fill="none"><path d="M39 108H159M37 144H162M70 87L64 166M137 86L144 166M37 156Q92 152 162 157M111 86L111 166"/><ellipse cx="108" cy="124" rx="18" ry="10"/></g>
  ${fieldNoise}
  <g transform="translate(75 94)">${player}</g>
  <g transform="translate(59 154)"><circle r="9" fill="#b3dfbb"/><path d="M-2-5l5-1 3 4-3 4-5-2zM-8-4l3 1-1 5-3 1M-3 5l5 1 1 3-5-1M7 2l2-2v5L6 7z" fill="#16452c"/><path d="M-4-8l2 3M4-7L3-6M7 3L3 2M-2 2l-1 3" stroke="#306344" stroke-width=".7"/></g>
  <path d="M39 87Q100 83 159 87L163 164Q101 169 36 164Z" fill="url(#ar-scan)"/>
  <path d="M40 90Q100 86 155 89" fill="none" stroke="#438b42" stroke-width="1" opacity=".3"/>
  <path d="M24 174H176L187 203H13Z" fill="url(#ar-control)" stroke="#8441a9" stroke-width="1"/>
  <path d="M28 179H171L178 197H21Z" fill="#15122d" stroke="#312654" stroke-width=".8"/>
  <path d="M24 175L13 204H188L176 174M19 207H183" fill="none" stroke="#bf43d5" stroke-width="1.2"/>
  <g fill="#080a14" stroke="#78528b" stroke-width=".7"><ellipse cx="54" cy="189" rx="14" ry="5"/><ellipse cx="111" cy="191" rx="12" ry="5"/><ellipse cx="154" cy="191" rx="12" ry="5"/></g>
  <ellipse cx="54" cy="188" rx="9" ry="3.4" fill="#270936" stroke="#7f2472" stroke-width=".7"/>
  <path d="M53 187V176" stroke="#060812" stroke-width="5"/><path d="M52 185V175" stroke="#a24467" stroke-width="1.6"/>
  <circle cx="53" cy="172" r="8" fill="url(#ar-red)" stroke="#460d35" stroke-width=".8"/>
  <ellipse cx="51" cy="169" rx="2.5" ry="1.5" fill="#ff92a0" opacity=".6"/>
  <ellipse cx="111" cy="188" rx="10" ry="4.8" fill="url(#ar-red)" stroke="#ec285c" stroke-width=".6"/><ellipse cx="154" cy="188" rx="10" ry="4.8" fill="url(#ar-red)" stroke="#ec285c" stroke-width=".6"/>
  <path d="M104 185Q111 182 117 185M148 185Q154 182 160 185" fill="none" stroke="#ff7c84" stroke-width=".8"/>
  <path d="M15 211H186V305H15Z" fill="#090c1a" stroke="#431b64" stroke-width="1"/>
  <path d="M20 216H181V299H20Z" fill="none" stroke="#7930a0" stroke-width=".7"/>
  <path d="M8 213L8 303 13 311M191 211v92l-5 8M24 309H176M21 72L20 168M179 72L180 168" fill="none" stroke="#b534d0" stroke-width="1.3"/>
  <path d="M12 219v73M187 223v69M24 85v71M176 88v70" stroke="#302479" stroke-width="2"/>
  <g fill="#c93fe4"><rect x="17" y="304" width="9" height="2"/><rect x="171" y="304" width="8" height="2"/><rect x="10" y="228" width="1" height="15"/><rect x="189" y="268" width="1" height="16"/></g>
  <g fill="#e25b2c"><rect x="157" y="42" width="3" height="3"/><rect x="161" y="39" width="2" height="8"/><rect x="164" y="44" width="3" height="3"/><rect x="169" y="38" width="2" height="2"/><rect x="29" y="291" width="2" height="2"/><rect x="42" y="295" width="3" height="1"/><rect x="170" y="285" width="4" height="2"/></g>
  <g stroke="#5f4e6e" fill="#141124" stroke-width=".5">${[[19,22],[179,22],[16,201],[183,201],[20,304],[181,304]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.5"/><path d="M${x-.7} ${y}h1.4"/>`).join('')}</g>
  <g fill="#060811" stroke="#33354b" stroke-width=".35">${repeat(4,i=>`<rect x="${157+i*4}" y="293" width="2" height="4"/>`)}</g>
  `, 'arcade-art');
}

export const electricThemes = {
  cyber: { art: cyberArt() },
  hologram: { art: hologramArt() },
  cosmic: { art: cosmicArt() },
  arcade: { art: arcadeArt() },
};
