/* Hand-built vector illustrations. Everything scales with the CSS card. */
const random = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const fixed = (n) => Number(n.toFixed(2));
const svg = (id, defs, contents) => `<svg class="paper-artwork" viewBox="0 0 200 320" preserveAspectRatio="none" aria-hidden="true"><defs>${defs}</defs>${contents}</svg>`;
const noise = (id, seed, opacity = .26) => `<filter id="${id}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".64" numOctaves="3" stitchTiles="stitch" seed="${seed}"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/><feComposite in2="SourceAlpha" operator="in"/></filter>`;
function flecks(seed, count, color, bounds = [0, 0, 200, 320], opacity = .32) {
  const r = random(seed); let out = '';
  for (let i = 0; i < count; i++) {
    const x = bounds[0] + r() * bounds[2], y = bounds[1] + r() * bounds[3], s = .15 + r() * 1.3;
    out += `<path d="M${fixed(x)} ${fixed(y)}l${fixed(s * 2)} ${fixed(-s)} ${fixed(s)} ${fixed(s)} -${fixed(s)} ${fixed(s * .6)}Z" fill="${color}" opacity="${fixed(r() * opacity)}"/>`;
  }
  return out;
}
function fibers(seed, count, color, opacity = .2) {
  const r = random(seed); let out = '';
  for (let i = 0; i < count; i++) {
    const x = r() * 200, y = r() * 320, length = 3 + r() * 17;
    out += `<path d="M${fixed(x)} ${fixed(y)}q${fixed(length / 2)} ${fixed(-r() * 5)} ${fixed(length)} ${fixed(-r() * 7)}" fill="none" stroke="${color}" stroke-width="${fixed(.2 + r() * .6)}" opacity="${fixed(.06 + r() * opacity)}"/>`;
  }
  return out;
}
function hatching(seed, count, color, bounds, opacity = .65, direction = -1) {
  const r = random(seed); let out = '';
  for (let i = 0; i < count; i++) {
    const x = bounds[0] + r() * bounds[2], y = bounds[1] + r() * bounds[3];
    const length = 2 + r() * 20;
    out += `<path d="M${fixed(x)} ${fixed(y)}l${fixed(length)} ${fixed(direction * (length * .7 + r() * 5))}" stroke="${color}" stroke-width="${fixed(.25 + r() * 1.1)}" opacity="${fixed(.15 + r() * opacity)}"/>`;
  }
  return out;
}
const portrait = 'M20 194L25 177 31 170 35 157 44 148 50 140 62 133 80 127 91 118 92 108 85 102 82 94 78 91 79 82 77 77 81 66 87 59 96 55 102 52 111 54 116 52 124 57 127 56 133 64 135 74 139 81 135 88 136 96 130 100 126 107 119 113 121 124 143 132 153 143 161 151 164 162 175 176 179 186 185 192 169 198 152 193 140 199 116 195 94 198 70 194 51 198 37 192Z';
function charcoalMarks() {
  const r = random(349); let out = '';
  for (let i = 0; i < 330; i++) {
    const head = i < 100, x = head ? 76 + r() * 65 : 18 + r() * 165, y = head ? 54 + r() * 62 : 122 + r() * 78;
    const length = head ? 3 + r() * 10 : 8 + r() * 23;
    out += `<path d="M${fixed(x)} ${fixed(y)}l${fixed(length * .45)} ${fixed(-length * .35)} ${fixed(length * .55)} ${fixed(-length * .55)}" fill="none" stroke="#d8d6c8" stroke-width="${fixed(head ? .45 + r() * .65 : .6 + r() * 1.45)}" opacity="${fixed(.25 + r() * .6)}"/>`;
  }
  return out;
}
function inkBrushwork() {
  const r = random(631); let out = '';
  for (let i = 0; i < 78; i++) {
    const x = 19 + r() * 143, y = 139 + r() * 67, length = 26 + r() * 68, width = 1.2 + r() * 5;
    out += `<path d="M0 0L${fixed(length * .18)} ${fixed(-width * .4)} ${fixed(length * .67)} ${fixed(-width * .55)} ${fixed(length)} 0 ${fixed(length * .79)} ${fixed(width * .3)} ${fixed(length * .44)} ${fixed(width * .5)}Z" transform="translate(${fixed(x)} ${fixed(y)}) rotate(${fixed(-36 + r() * 13)})" fill="${i % 4 ? '#282b22' : '#c8b99a'}" opacity="${fixed(i % 4 ? .5 + r() * .45 : .2 + r() * .4)}"/>`;
  }
  return out;
}

const parchmentShape = 'M8 40 L11 27 19 23 17 19 26 16 31 8 39 8 47 4 52 10 65 8 72 12 85 5 95 9 102 5 112 8 124 3 135 10 144 11 149 9 157 15 172 15 177 21 188 23 190 30 196 34 193 57 196 62 193 76 195 89 191 108 194 121 192 137 195 149 192 159 195 178 191 186 194 201 191 215 194 229 191 242 193 252 190 266 193 280 185 291 174 296 165 303 146 305 129 311 112 314 101 319 84 314 69 311 57 308 43 303 30 302 23 295 14 291 8 282 10 268 5 262 7 246 8 231 5 215 9 200 7 183 9 164 6 151 9 137 7 122 11 108 8 93 10 80 7 68 10 53Z';
const parchmentInside = 'M16 43 L20 31 31 27 38 19 51 18 63 16 77 20 89 14 103 18 115 14 130 16 143 21 156 22 172 29 185 38 183 72 186 102 183 128 185 155 182 184 184 214 181 242 183 278 169 289 147 296 125 301 100 309 75 301 52 294 31 288 18 278 17 250 16 221 18 189 15 158 18 130 16 99 18 73Z';
function parchmentBorder() {
  const r = random(724); let out = '';
  // Small folded, charred facets make the edge read as curled antique paper.
  for (let i = 0; i < 190; i++) {
    let x, y, angle;
    if (i < 64) { x = 7 + r() * 12; y = 25 + r() * 257; angle = -30 + r() * 80; }
    else if (i < 128) { x = 182 + r() * 11; y = 28 + r() * 253; angle = -70 + r() * 110; }
    else if (i < 159) { x = 25 + r() * 155; y = 9 + r() * 17 + (Math.abs(x - 100) / 9); angle = r() * 170; }
    else { x = 20 + r() * 164; y = 290 + (1 - Math.abs(x - 100) / 100) * 24 + r() * 4; angle = -30 + r() * 70; }
    out += `<path d="M-4 -3L2 -5 7 -1 3 4 -3 2Z" transform="translate(${fixed(x)} ${fixed(y)}) rotate(${fixed(angle)})" fill="${['#ac7136','#d0a061','#b58145','#dfb771','#65421f'][i % 5]}" stroke="#60401f" stroke-width=".6"/><path d="M-4 -3L2 -5 7 -1M-4 -3L3 4" transform="translate(${fixed(x)} ${fixed(y)}) rotate(${fixed(angle)})" fill="none" stroke="#e9c891" stroke-width=".55"/>`;
  }
  return out;
}
function manuscriptPortrait() {
  let hair = '';
  for (let i = 0; i < 23; i++) {
    const a = i * .49;
    hair += `<path d="M${112 + Math.sin(a) * 13} ${49 + i * .33} C${82 + i * .42} ${49 + i * .2},${80 + i * .3} ${86 + i * .2},${95 + i * .5} ${112 + i * .6} Q${100 - i * .7} ${130 - i * .1} ${76 - i * .5} ${133 + i * .3}"/>`;
  }
  return `<g fill="none" stroke="#28261c" stroke-linecap="round"><path d="M102 119Q88 116 80 123L64 129Q52 130 47 144L36 167 28 185M116 120L140 133Q157 136 166 155L179 189 173 205M64 131Q62 147 54 157M140 135Q147 161 156 169M50 151L52 174 44 202M161 163L163 195" stroke-width="2"/><path d="M106 52Q86 52 88 76Q89 98 103 111Q109 116 118 104Q130 91 132 72Q132 53 113 49Z" stroke-width="1.4"/><path d="M103 113L99 125Q107 133 118 123L118 105M100 125Q110 141 124 126M72 135Q106 149 138 138" stroke-width="1.2"/><g stroke-width=".75">${hair}</g><path d="M41 177l-8 10 6 7M44 164l-6 15 4 5M55 143l-8 11 3 12M61 172l8-20M78 153l-4 14M88 167l-7 19M120 149l-6 13 7 3M136 153l-3 21M150 180l-8 19M166 163l-7 12 6 11M101 175l-7 18M64 190l8-10" stroke-width=".9"/></g><g clip-path="url(#parchment-shirt)">${hatching(516, 140, '#474334', [25, 132, 155, 74], .48)}</g>`;
}
const parchment = svg('parchment', `
  <linearGradient id="parchment-paper" x2=".8" y2="1"><stop stop-color="#d7b77f"/><stop offset=".2" stop-color="#ecdcaf"/><stop offset=".54" stop-color="#d6bc88"/><stop offset=".74" stop-color="#eddaab"/><stop offset="1" stop-color="#ccaa72"/></linearGradient>
  <clipPath id="parchment-clip"><path d="${parchmentShape}"/></clipPath>
  <clipPath id="parchment-shirt"><path d="M45 147L77 128 97 124 114 136 131 128 157 146 179 205H25Z"/></clipPath>
  ${noise('parchment', 24, .32)}
`, `<path d="${parchmentShape}" fill="#8c5929" stroke="#392b1c" stroke-width="2"/>
  <g clip-path="url(#parchment-clip)">
  <path d="${parchmentShape}" fill="url(#parchment-paper)" filter="url(#parchment-grain)"/>
  ${parchmentBorder()}<path d="${parchmentInside}" fill="url(#parchment-paper)" stroke="#8a632e" stroke-width=".75" filter="url(#parchment-grain)"/>
  ${fibers(413, 450, '#644d31', .24)}${flecks(8, 560, '#463820', [10, 12, 180, 300], .2)}
  <g fill="none" stroke="#61472c" stroke-width=".6" opacity=".62"><path d="M37 19l5 12 13 6-5 16 4 11M39 32l-16 8 7 8M75 17l4 17 14 9-4 16M88 40l16-4 14 9M152 25l-8 18 9 14-9 11 6 11M179 74l-15 8-4 15 10 10-15 12M184 143l-16 6-9 17 3 16M16 112l18 9-4 9 7 10-15 15M17 197l15-7 8 8-2 18M19 251l21 1 7 9-9 15 11 15M185 266l-16 7-1 19M75 298l12-14 8 3 7 20M103 307l10-14 20-7 5-13"/>
  <path d="M27 68l17 1 8-5 15 2M152 93l18 2M149 98l11-8M31 232q65-5 147-1M29 234q61-4 150-1M31 293q67 22 140 0"/></g>
  <g fill="none" stroke="#373426" stroke-width=".8" opacity=".7"><path d="M153 58l13-8-6 13 8-8-4 13M156 77l12-14-6 16 12-8M159 112l15-11-8 17 7-2M24 153l8-12-3 17 12-11M27 168l12-9-6 14M145 280l14 13m-12-1 13-15M153 290l9 5"/></g>
  ${manuscriptPortrait()}
  <path d="M27 107l30-7-2 5-29 8Zm7 4 13-3-3 6-5 1Z" fill="#343023"/><circle cx="35" cy="114" r="3.5" fill="none" stroke="#343023" stroke-width="2"/>
  <path d="M24 217Q97 213 178 217" fill="none" stroke="#8d774f" stroke-width=".8"/>
  </g>`);

const doodleShape = 'M10 15L17 7 34 9 42 5 52 10 67 5 84 8 96 14 108 7 123 11 134 5 154 7 164 17 180 21 190 35 187 60 192 75 186 91 190 107 187 124 192 145 187 165 190 185 186 203 191 220 186 236 192 254 185 270 190 284 182 293 186 305 172 309 163 317 146 313 133 318 116 309 103 315 88 310 76 315 63 306 45 311 49 296 34 304 28 293 14 285 9 270 12 251 8 235 12 214 8 191 11 175 8 156 12 136 8 117 11 94 7 76 10 58 7 40Z';
const doodle = svg('doodle', `
  <linearGradient id="doodle-paper" x2="1" y2="1"><stop stop-color="#e3e0d1"/><stop offset=".38" stop-color="#e5e3d8"/><stop offset="1" stop-color="#cdc9b8"/></linearGradient>
  <clipPath id="doodle-clip"><path d="${doodleShape}"/></clipPath>
  <clipPath id="doodle-player"><path d="${portrait}"/></clipPath>
  ${noise('doodle', 31, .28)}
`, `<path d="${doodleShape}" fill="url(#doodle-paper)" stroke="#a09b8d" stroke-width=".7" filter="url(#doodle-grain)"/>
  <g clip-path="url(#doodle-clip)">
  ${fibers(839, 550, '#777466', .2)}${flecks(321, 800, '#4c493d', [0, 0, 200, 320], .2)}
  <g stroke="#8d897b" fill="none" opacity=".5" stroke-width=".6"><path d="M18 10l7 17-7 14 5 9M42 10l2 10 16 5 4 10M80 9l-6 17 9 14-7 12M144 10l-5 15 8 10M178 28l-9 18 10 10M17 81l17 8-4 9M184 120l-16 3 3 13-9 14M10 179l21 6 5 10-9 9M184 211l-14 11 5 18-8 4M31 277l12-8 8 15 15 4M101 302l10-19 8 9 16 2M162 292l12-9"/></g>
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
  <path d="M23 21l7-5 9 3 6-4 3 9 12-10M26 24l-3 9M65 18l4 9-7 3M71 12l6 7-7 5M90 26l8 4 2-8 4 9 9 2-8 4 3 7-9-5-7 5 1-9-6-2ZM97 15l4 6M87 22l-6 4" stroke="#373a40" stroke-width="1.2"/>
  <path d="M137 25l5-11 8 12 14-10-4 20 15-6-7 17-31-12Z" stroke="#252a27" stroke-width="2" fill="#e0bb36"/><path d="M136 32l31 13-4 6-28-12ZM143 19l-2 13 17 7 8-18" stroke="#252a27" stroke-width="1.1"/>
  <path d="M32 88l14-5-7 15-3-8-7-2 10-2M36 98l-4 7M30 105l4 7M160 65l-3 18m10-21-3 19m-14-12 23-1m-24 8 24-2M177 62l-1 17m-3 4h3M93 26l-1 12M91 47l5 2m-14 0 4 4M20 171l7-6 3 5m-12 13 13-7M48 56l8-4-1 8-6-1m5 0 4 9M173 156l7 3-8 8 4 5" stroke="#3274a0" stroke-width="1.3"/>
  <path d="M22 118l4 16-7-5m7 4 8-8m-8 4 5-23-12 7 10-3 9 5M18 143l7-3M150 192l8-7 3 7 5-5" stroke="#b34f43" stroke-width="1.4"/>
  <path d="M174 94l-12 7 16-2-8 11 11 1-15 8 11 5-9 7m-2-12-5 5M175 179l-8 8 13 4-12 9 9 2m-14 0 5 5M22 225l10-5-6 13 11-5m-12 13 5-1" stroke="#333b3e" stroke-width="1"/>
  </g>
  <path d="${portrait}" fill="#232523"/>
  <g clip-path="url(#doodle-player)">${charcoalMarks()}${hatching(113, 160, '#080c0c', [19, 52, 166, 147], .65)}</g>
  <g fill="none" stroke="#262927" stroke-width="1.1">${hatching(77, 54, '#272a27', [22, 163, 148, 31], .8)}<path d="M83 63l15-9 13 1 16 10M79 77l-2 8 5 5M134 75l3 9-2 10M91 113l-7 11-11 5M121 123l9 6 15 6M42 155l-12 16M163 161l12 17M31 194l11-5"/></g>
  <path d="M21 204l19 1 2-5 26 1 2 3 33-3 4 4 29-4 2 4 29-3 12 5-8 20-12-3-11 5-27-3-8 4-29-4-5 3-28-3-5 3-26-5Z" fill="#e7c14e" opacity=".9"/>
  <path d="M26 208l146-2M28 223l143 1" stroke="#ebd979" stroke-width=".6" opacity=".7"/>
  <g stroke="#283335" fill="none" stroke-width="2" stroke-linecap="round"><path d="M145 274q-23-1-25 14q-1 14 20 15q22-1 23-16q0-6-5-10M131 280l-2 6m17-7-1 6m-17 8q11 8 22-2M174 269l-7 8 9 1-9 8 10-2M78 294l-6 8 11-1-5 7"/><path d="M168 297l6 3m-8 5 7 1M24 262l9 4-7 5m18 16-5 5" stroke-width="1.1"/></g>
  </g>`);

const inkShape = 'M10 18L52 17 53 6 87 9 116 13 136 17 161 18 187 26 185 62 188 83 186 113 189 145 186 170 188 199 186 224 189 251 185 280 186 310 171 313 160 312 141 315 120 313 104 316 80 314 62 315 41 311 20 312 6 306 7 276 6 248 9 221 6 192 8 165 7 140 9 112 7 82 10 55Z';
function bamboo(x,y,scale,angle) {
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})" fill="#4d4b35" opacity=".73"><path d="M0 0Q-5-28-1-64L1-64Q-1-30 2 0ZM-1-32l-22-21 1-2L1-35ZM-1-46l22-19 1 2-21 21Z"/><path d="M-10-43Q-27-45-33-64Q-16-57-10-43M-17-49Q-30-51-41-48Q-28-42-17-49M-5-52Q-19-66-13-77Q-6-68-5-52M11-55Q11-73 21-82Q20-66 11-55M16-60Q31-64 36-76Q20-72 16-60M6-50Q22-49 32-55Q20-58 6-50"/><path d="M-4-16h6M-4-35h6M-3-55h5" stroke="#ded1b2" stroke-width="1"/></g>`;
}
const ink = svg('ink', `
  <linearGradient id="ink-paper" x2="1" y2="1"><stop stop-color="#cabb9b"/><stop offset=".3" stop-color="#e4d5b6"/><stop offset=".6" stop-color="#d9c9a9"/><stop offset="1" stop-color="#baa989"/></linearGradient>
  <clipPath id="ink-clip"><path d="${inkShape}"/></clipPath>
  <clipPath id="ink-player"><path d="M23 207L30 183 39 165 55 148 76 135 83 120 80 113 73 105 72 96 68 92 68 82 71 78Q69 65 81 63L87 61 98 63 103 62 112 68 117 78 115 91 118 94 114 104 109 108 103 119 108 129 130 140 148 153 171 174 162 182 142 181 127 190 108 188 89 199 74 196 57 204 46 201 30 211Z"/></clipPath>
  <linearGradient id="ink-wash" x1="0" y1="0" x2=".25" y2="1"><stop offset=".45" stop-color="#262821"/><stop offset=".7" stop-color="#262821" stop-opacity=".8"/><stop offset="1" stop-color="#514c36" stop-opacity="0"/></linearGradient>
  ${noise('ink', 9, .36)}
`, `<path d="${inkShape}" fill="url(#ink-paper)" stroke="#958668" stroke-width=".7" filter="url(#ink-grain)"/>
  <g clip-path="url(#ink-clip)">
  <path d="M53 7l-3 16 24-2 27 5 28-4 29 4 29 2-30-11-41-5Z" fill="#cfc0a2" stroke="#8e8066" stroke-width=".6"/><path d="M56 8l17 14 28 3 29-4 29 5" stroke="#f4e7cd" stroke-width="1" fill="none"/>
  ${fibers(14, 780, '#5e543e', .17)}${flecks(31, 1200, '#6e6246', [0, 0, 200, 320], .15)}
  <g fill="none" stroke="#6e614a" stroke-width=".5" opacity=".35"><path d="M22 19l10 20-9 24 13 7-6 18M76 24l-2 13 11 6 5 16M163 29l-15 18 7 14 16 3M184 108l-21 11-4 21 10 13M9 147l17 15-4 20 11 14M175 225l-11 22 10 10-9 16M16 277l17-1 6 15 14 5M90 311l-9-17 8-17"/></g>
  <circle cx="141" cy="65" r="21" fill="#a43c2d" filter="url(#ink-grain)"/><path d="M132 47q23-4 29 20M123 66q-1 13 18 19" stroke="#ba5740" stroke-width=".7" fill="none"/>
  ${bamboo(181,120,.72,-14)}${bamboo(175,58,.62,11)}${bamboo(18,204,.95,34)}${bamboo(30,297,.62,28)}
  <g clip-path="url(#ink-player)"><path d="M18 55H180V214H18Z" fill="url(#ink-wash)"/>${inkBrushwork()}${hatching(633, 68, '#bbae8e', [69, 62, 49, 59], .3)}${flecks(632, 360, '#d4c5a4', [25, 60, 150, 150], .4)}</g>
  <g fill="#2d2d22" opacity=".8"><path d="M24 205L116 151 80 176ZM29 211L140 158 94 185ZM42 207L157 164 110 184ZM60 206L145 181 94 201Z"/></g>
  <path d="M23 91l16-1 1 46-17-2Z" fill="#ab3c29"/><g stroke="#332a1e" stroke-width=".9" fill="none"><path d="M26 97h10m-5-4v14m-5-5 10 6m-1-9-8 8M26 114h11m-6-5v12m-5-3 10-6m-9 11 3 4 7-5M26 130h9m-6-4v7m5-6v7"/></g>
  <path d="M17 211Q93 208 180 210" stroke="#8e8066" stroke-width=".7" fill="none"/>
  <path d="M21 304l5-8 6 8M168 302l8-6-2 10" fill="none" stroke="#8b7d5d" stroke-width=".5"/>
  </g>`);

const steamShape = 'M10 38L20 21 43 19 57 12 76 12 100 4 122 12 143 12 158 18 181 21 192 39 189 286 170 299 149 308 101 324 52 307 29 298 10 286Z';
const steamInner = 'M22 43L28 31 48 28 60 23 78 23 100 15 121 23 140 23 155 28 177 31 181 43 179 277 160 288 144 296 101 312 58 297 42 289 22 277Z';
function grainWood() {
  const r = random(84); let out = '';
  for (let i = 0; i < 170; i++) {
    const y = r() * 320, x = r() * 80, length = 50 + r() * 160;
    out += `<path d="M${fixed(x)} ${fixed(y)}Q${fixed(x + length * .3)} ${fixed(y + r() * 5)} ${fixed(x + length * .6)} ${fixed(y)}T${fixed(x + length)} ${fixed(y + r() * 3)}" stroke="${i % 4 === 0 ? '#c08b48' : '#2e2114'}" stroke-width="${fixed(.3 + r() * 1.1)}" opacity="${fixed(.15 + r() * .44)}" fill="none"/>`;
  }
  return out;
}
function metalChain() {
  let out = '';
  const links = [[146,5,-31],[151,14,17],[153,25,-24],[163,35,45],[168,47,-33],[171,59,28],[178,70,-17]];
  links.forEach(([x,y,a],i) => { out += `<g transform="translate(${x} ${y}) rotate(${a})"><ellipse rx="5.5" ry="10" fill="none" stroke="#100f0c" stroke-width="5"/><ellipse rx="5.5" ry="10" fill="none" stroke="url(#steam-chain)" stroke-width="3"/><path d="M-3-8Q-7-2-3 6" fill="none" stroke="#c0aa7b" stroke-width=".6"/></g>`; });
  return out;
}
function ornateMetal() {
  let out = '';
  for (const reflect of [false, true]) {
    out += `<g ${reflect ? 'transform="translate(201 -1) scale(-1 1)" opacity=".84"' : ''}><g fill="none" stroke="#87652f" stroke-width="2"><path d="M11 41Q8 30 18 28Q30 27 25 17Q19 11 13 20M19 40Q35 38 31 28Q29 22 39 22L49 24Q59 23 55 14Q53 8 48 16M12 48Q4 64 13 71Q21 77 15 85L10 93Q6 101 14 107M11 122Q21 133 13 143Q4 148 12 161M12 176Q22 189 12 198M11 221Q2 230 14 241Q22 250 11 262M12 275Q19 273 21 280Q22 290 32 291Q40 292 38 300M24 292Q22 304 35 307L55 312M52 306Q69 302 67 314M66 315Q83 307 91 319"/></g><g fill="none" stroke="#b79250" stroke-width=".6"><path d="M10 40Q8 29 18 28Q28 26 24 18M18 41Q35 39 30 28M12 48Q4 64 13 71M11 123Q20 133 12 144M11 177Q21 189 11 199M12 276Q19 275 22 282M24 292Q22 304 35 307L55 312M67 314Q82 308 91 319"/></g><g fill="#875d2d" stroke="#d5a65a" stroke-width=".5"><path d="M18 56l-7-9-3 9 7 7ZM13 112l-6-7-2 10 7 5ZM15 164l-8-7-2 10 7 5ZM13 210l-7-6-2 10 8 6ZM26 286l6-3 8 5-10 3ZM57 303l7-6 7 4-10 6Z"/></g></g>`;
  }
  return out;
}
const steampunk = svg('steampunk', `
  <linearGradient id="steam-wood" x2="1" y2="1"><stop stop-color="#49341d"/><stop offset=".25" stop-color="#795229"/><stop offset=".65" stop-color="#503a21"/><stop offset="1" stop-color="#252518"/></linearGradient>
  <linearGradient id="steam-brass"><stop stop-color="#30301d"/><stop offset=".2" stop-color="#947039"/><stop offset=".4" stop-color="#40371e"/><stop offset=".65" stop-color="#bc9450"/><stop offset=".79" stop-color="#353d26"/><stop offset="1" stop-color="#49351c"/></linearGradient>
  <radialGradient id="steam-stain"><stop stop-color="#1e2719" stop-opacity=".7"/><stop offset=".45" stop-color="#2d2c1b" stop-opacity=".4"/><stop offset="1" stop-color="#352c1b" stop-opacity="0"/></radialGradient>
  <linearGradient id="steam-chain" x2="1" y2="1"><stop stop-color="#bcb296"/><stop offset=".24" stop-color="#4c493a"/><stop offset=".5" stop-color="#161812"/><stop offset=".8" stop-color="#7d7660"/><stop offset="1" stop-color="#383b31"/></linearGradient>
  <clipPath id="steam-clip"><path d="${steamShape}"/></clipPath>
  <clipPath id="steam-player"><path d="M28 207Q39 174 53 158L76 148 84 135 83 126Q71 115 74 99L72 90 78 83Q77 68 91 68L100 62 115 68 121 79 119 99 124 101 122 113 116 119 113 137 121 147 144 153Q163 171 176 204L130 216 71 218Z"/></clipPath>
  ${noise('steam', 57, .25)}
`, `<path d="${steamShape}" fill="#342715" stroke="#332719" stroke-width="4"/><path d="${steamShape}" fill="url(#steam-wood)" stroke="url(#steam-brass)" stroke-width="3"/>
  <g clip-path="url(#steam-clip)"><path d="${steamInner}" fill="url(#steam-wood)" stroke="#c3974d" stroke-width="1" filter="url(#steam-grain)"/>
  ${grainWood()}${flecks(231, 1500, '#d4aa66', [14, 15, 172, 295], .29)}
  <g fill="url(#steam-stain)"><ellipse cx="171" cy="140" rx="33" ry="97"/><ellipse cx="29" cy="225" rx="30" ry="70"/><ellipse cx="73" cy="37" rx="41" ry="16"/></g>
  <g fill="none" stroke="#211b11" stroke-width="1.4" opacity=".8"><path d="M22 46L94 47 179 45M22 79L112 80 179 78M22 120L83 119 179 121M22 157L131 158 179 156M22 195L101 194 179 196M22 237L110 238 179 236M22 273L92 272 179 274"/></g><g fill="none" stroke="#b58a49" stroke-width=".6" opacity=".45"><path d="M28 48L86 49M106 48L173 47M24 81H75M119 82L171 80M31 122L81 121M135 122H177M26 159L63 160M145 160L174 158M24 197L71 196M114 198L168 199M36 239L89 240M126 239L173 238M41 275L89 274M128 275L162 276"/></g>
  <g fill="none" stroke="#322312" stroke-width="1.4" opacity=".65"><ellipse cx="144" cy="85" rx="21" ry="3"/><ellipse cx="144" cy="85" rx="11" ry="1.3"/><ellipse cx="53" cy="181" rx="19" ry="2"/><path d="M58 38q7 5 24 0m47 109q14-6 37-2M34 251q21 6 29-1"/></g>
  <g clip-path="url(#steam-player)"><path d="M20 60H181V224H20Z" fill="#1f2019"/>${flecks(321, 1450, '#b8803d', [25, 60, 155, 165], .65)}${fibers(772, 150, '#b68e4b', .15)}</g>
  <g transform="translate(0 -8)">
  <path d="M27 209L178 183 183 221 31 247 22 236Z" fill="#302719" opacity=".8"/>
  <path d="M20 214l15-7 137-23 12 6-5 12 3 11-11 9-145 24-6-9 5-9Z" fill="#c2b99c" stroke="#4e4631" stroke-width="1.2" filter="url(#steam-grain)"/>
  <path d="M31 215l139-24M31 237l139-24" stroke="#625d46" stroke-width=".75"/><path d="M20 214l8 8-3 16 8-6m146-44-11 8 5 17" stroke="#776d50" stroke-width="1" fill="none"/>
  ${flecks(621, 190, '#6a5637', [20, 190, 165, 53], .15)}
  </g>
  </g>
  <path d="${steamInner}" fill="none" stroke="url(#steam-brass)" stroke-width="3"/><path d="M26 44L31 34 55 31 64 27 82 27 100 19 119 27 138 27 152 32 174 35 177 44V277L146 295 100 309 55 294 26 277Z" fill="none" stroke="#b28b49" stroke-width=".6"/>
  ${ornateMetal()}
  <g fill="#2e281c" stroke="#c39850" stroke-width=".7">${[[23,43],[177,43],[23,273],[177,273],[100,19],[100,309]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.8"/><path d="M${x-1.3} ${y+1.4}l2.6-2.8"/>`).join('')}</g>
  <path d="M118 18L180 9 191 11 190 16 121 23Z" fill="url(#steam-brass)" stroke="#39291a" stroke-width="1"/>
  ${metalChain()}`);

export const paperThemes = {
  parchment: { art: parchment },
  doodle: { art: doodle },
  ink: { art: ink },
  steampunk: { art: steampunk },
};
