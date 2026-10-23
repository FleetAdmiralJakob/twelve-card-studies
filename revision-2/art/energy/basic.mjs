import {naturalFigure,naturalStyles} from './basic-figure.mjs';
import {naturalLion} from './basic-lion.mjs';
// Original, layered illustrations in a 300 × 380 coordinate system.
// Empty decorative elements keep all typography and national emblems live.
const scope = '.r2-energy.r2-energy-basic';
const el = (name, style = '', children = '', tag = 'i') =>
  `<${tag} class="eb-${name}"${style ? ` style="${style}"` : ''}>${children}</${tag}>`;
const box = (x, y, w, h, angle = 0) =>
  `left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${angle}deg);`;
const frameBox = (x, y, w, h, angle = 0) => {
  const radians = angle * Math.PI / 180;
  const halfWidth = (Math.abs(w * Math.cos(radians)) + Math.abs(h * Math.sin(radians))) / 2;
  const halfHeight = (Math.abs(h * Math.cos(radians)) + Math.abs(w * Math.sin(radians))) / 2;
  const cx = Math.max(10 + halfWidth, Math.min(290 - halfWidth, x + w / 2));
  const cy = Math.max(10 + halfHeight, Math.min(370 - halfHeight, y + h / 2));
  return box(Number((cx - w / 2).toFixed(2)), Number((cy - h / 2).toFixed(2)), w, h, angle);
};

function frame() {
  return el('frame', '', [
    el('frame-outer'), el('frame-inner'),
    el('crown-wing crown-wing-l'), el('crown-wing crown-wing-r'),
    el('crown-echo crown-echo-l'), el('crown-echo crown-echo-r'),
    el('crown-curl crown-curl-l'), el('crown-curl crown-curl-r'),
    el('crown-gem'),
    el('foot foot-l'), el('foot foot-r'),
    el('foot-echo foot-echo-l'), el('foot-echo foot-echo-r'),
    el('corner corner-l'), el('corner corner-r'),
    ...[[55,26,43,12,-16], [202,26,43,12,16], [18,115,8,31,-5],
      [274,115,8,31,5], [18,269,8,29,-5], [274,269,8,29,5]]
      .map(v => el('filigree', box(...v))),
    ...[[24,75], [274,75], [24,157], [274,157], [24,245], [274,245], [35,330], [263,330]]
      .map(([x,y], n) => el('stud', `${box(x,y,3,6,n % 2 ? 18 : -18)}`)),
    el('foot-jewel'),
  ].join(''), 'div');
}

const iceLayout = [
  [28,45,16,56,-17], [43,14,23,67,-27], [70,8,23,62,22],
  [102,14,18,54,34], [126,3,17,45,37], [203,7,22,62,-25],
  [232,19,27,76,18], [258,51,17,67,12], [264,110,19,63,28],
  [242,103,23,73,-22], [257,162,25,75,22], [273,212,14,57,8],
  [247,238,21,51,36], [264,294,15,41,-12], [235,333,22,32,48],
  [193,346,17,27,55], [69,337,19,28,-48], [21,283,18,42,-16],
  [12,222,20,63,-21], [24,175,26,68,-34], [10,127,17,57,-13],
  [41,119,21,64,24],
];

function frostScenery() {
  return el('scenery frost-scene', '', [
    el('ice-aureole'),
    ...iceLayout.map(([x,y,w,h,a]) => el('crystal',
      frameBox(x,y,w,h,a), el('crystal-vein'))),
    ...[[51,105,98,53,-22], [177,104,77,56,26], [67,179,95,64,-25]]
      .map(v => el('ice-current', box(...v))),
    ...[[17,92,3], [76,24,3], [217,17,4], [279,96,3], [43,249,3], [267,319,3]]
      .map(([x,y,w]) => el('spark', box(x,y,w,w))),
  ].join(''), 'div');
}

function blazeScenery() {
  const flames = [
    [22,36,40,112,-29], [46,3,29,97,28], [96,10,27,80,39],
    [128,8,24,76,18], [195,5,31,103,-16], [223,18,40,104,33],
    [246,63,33,107,26], [241,121,40,110,31], [251,202,31,94,24],
    [249,283,25,63,31], [199,320,30,49,64], [24,274,29,76,-37],
    [13,204,39,101,-24], [23,137,35,104,-33], [62,113,28,88,-56],
    [205,135,24,91,47], [104,51,18,83,-30],
  ];
  return el('scenery blaze-scene', '', [
    el('fire-aureole'),
    ...flames.map((v, n) => el(`flame${n % 3 === 0 ? ' flame-bright' : ''}`, frameBox(...v))),
    ...[[38,87,101,17,-14],[45,101,81,13,-22],[57,76,82,12,9],[32,115,62,10,-32]].map(v=>el('fire-wing',box(...v))),
    ...[[25,92,13,24,24],[18,151,18,32,-18],[26,242,12,28,18],[271,136,12,24,-27],[270,227,18,28,21],[265,304,16,23,-28],[85,25,22,8,-28],[216,33,21,9,-18]].map(v=>el('fire-edge',box(...v))),
    ...[[24,107,91,35,-41], [173,39,87,46,-36], [209,147,64,26,-52],
      [32,231,85,40,-40], [204,256,59,35,-44], [53,333,72,27,11],
      [105,170,119,27,-17], [87,26,62,22,-17]]
      .map(v => el('fire-whip', frameBox(...v))),
    ...[[29,22,2,5,-29], [85,13,2,6,25], [235,8,2,6,32], [282,68,2,7,26],
      [14,164,2,5,-20], [281,250,2,6,30], [60,354,2,5,-26], [226,354,2,4,33]]
      .map(v => el('ember', box(...v))),
  ].join(''), 'div');
}

function voltScenery() {
  const towers = [
    [34,147,13,98], [50,165,17,76], [69,190,14,63], [22,196,9,56],
    [217,164,17,91], [237,113,11,135], [253,147,17,112], [273,184,9,72],
    [229,209,18,56], [51,234,12,47], [18,257,11,37], [266,260,12,38],
  ];
  const circuits = [
    [31,68,1,66,0], [31,132,19,1,-34], [49,121,1,47,0],
    [269,50,1,82,0], [251,143,19,1,-34], [251,143,1,34,0],
    [20,242,1,60,0], [20,302,18,1,34], [279,223,1,68,0], [264,301,18,1,-34],
  ];
  return el('scenery volt-scene', '', [
    el('neon-aureole'),
    el('triangle-bar triangle-one'), el('triangle-bar triangle-two'), el('triangle-bar triangle-three'),
    el('triangle-echo triangle-echo-one'), el('triangle-echo triangle-echo-two'),
    ...towers.map((v,n) => el(`tower tower-${n % 3}`, box(...v))),
    ...circuits.map(v => el('circuit', box(...v))),
    ...[[31,68], [49,168], [269,50], [251,177], [20,242], [279,223]]
      .map(([x,y]) => el('terminal', box(x-2,y-2,5,5))),
    ...[[20,93,2], [74,30,2], [251,26,3], [284,121,2], [17,281,3], [280,315,2]]
      .map(([x,y,w]) => el('spark', box(x,y,w,w))),
  ].join(''), 'div');
}

function silvahScenery() {
  const bolts = [
    [48,115,30,-48], [68,93,18,15], [85,98,47,-58],
    [118,43,24,-34], [139,30,26,12], [164,35,30,-48],
    [29,204,37,-60], [47,173,21,14], [66,178,37,-58],
    [249,217,29,-64], [261,191,16,14], [277,195,20,-78],
    [28,296,25,-58], [41,275,21,10], [61,278,35,-62],
  ];
  return el('scenery silvah-scene', '', [
    el('forest-aureole'), naturalLion(),
    ...bolts.map(([x,y,w,a],n) => el(`lightning${n % 3 === 1 ? ' lightning-dim' : ''}`, box(x,y,w,2,a))),
    ...[[27,101,12,42,-29], [20,224,11,45,-18], [30,315,12,34,-30],
      [266,271,12,45,27], [257,324,12,35,36], [19,147,9,25,-37], [29,151,8,23,32], [19,252,9,29,-31], [29,256,7,21,28], [269,176,9,28,31], [276,181,8,21,-26], [263,304,8,24,32]]
      .map(v => el('leaf-flare', box(...v))),
    ...[[52,50,3], [107,20,2], [230,31,3], [280,238,3], [52,338,2]]
      .map(([x,y,w]) => el('spark', box(x,y,w,w))),
  ].join(''), 'div');
}

function crest(theme) {
  const symbols = {
    frost: [[10,7,3,18,-21], [15,5,3,22,0], [20,8,3,17,21], [8,20,18,1,0]],
    blaze: [[8,9,9,16,-24], [14,5,9,22,12], [19,13,8,14,29]],
    volt: [[7,10,19,2,-12], [8,11,19,2,64], [25,6,23,2,112]],
    silvah: [[15,7,2,22,0], [7,10,10,5,36], [17,9,10,5,-33],
      [6,17,11,5,31], [17,16,11,5,-28], [9,23,8,4,24]],
  };
  return el(`crest crest-${theme}`, '', [el('crest-inner'),
    ...symbols[theme].map(v => el('crest-mark', box(...v))),
    el('crest-pin'),
  ].join(''), 'div');
}

const scenery = { frost: frostScenery, blaze: blazeScenery, volt: voltScenery, silvah: silvahScenery };
function card(theme) {
  return `<div class="r2-art r2-energy r2-energy-basic ${theme}" aria-hidden="true">${[
    el('ambient'), el('panel'), el('tail'), scenery[theme](),
    el('rating-shade'), naturalFigure(theme), el('lower-shade'),
    el('name-band'), el('stats-rule'), frame(), crest(theme),
  ].join('')}</div>`;
}

export const basicArt = Object.fromEntries(Object.keys(scenery).map(theme => [theme, card(theme)]));

export const basicStyles = naturalStyles + `
${scope} {
  --eb-rim:#b6e6ff; --eb-light:#55b7f3; --eb-hot:#3aa5ff; --eb-glow:#218aec;
  --eb-deep:#041123; --eb-mid:#103a59; --eb-skin:#0b2639; --eb-skin-lit:#477b91;
  --eb-jersey:#102b42; --eb-jersey-lit:#306586; --eb-seam:#84c9ee;
  position:absolute; inset:0; width:300px; height:380px; overflow:hidden;
  isolation:isolate; pointer-events:none; background:transparent;
}
${scope}.blaze {
  --eb-rim:#ffbd76; --eb-light:#ff5430; --eb-hot:#ff3015; --eb-glow:#e72508;
  --eb-deep:#190506; --eb-mid:#53110a; --eb-skin:#32130e; --eb-skin-lit:#a23f26;
  --eb-jersey:#290909; --eb-jersey-lit:#65221c; --eb-seam:#fb6945;
}
${scope}.volt {
  --eb-rim:#a2efff; --eb-light:#7f82ff; --eb-hot:#f431ff; --eb-glow:#9921f6;
  --eb-deep:#08071c; --eb-mid:#27214f; --eb-skin:#181b3c; --eb-skin-lit:#4f6b9c;
  --eb-jersey:#101229; --eb-jersey-lit:#34315b; --eb-seam:#5ad5f5;
}
${scope}.silvah {
  --eb-rim:#d1f38e; --eb-light:#8adf41; --eb-hot:#8fdb29; --eb-glow:#65b820;
  --eb-deep:#071508; --eb-mid:#174728; --eb-skin:#172a18; --eb-skin-lit:#4e7138;
  --eb-jersey:#10271b; --eb-jersey-lit:#325835; --eb-seam:#c1df73;
}
${scope} i, ${scope} b, ${scope} span, ${scope} div { box-sizing:border-box; }
${scope} i, ${scope} b, ${scope} span { display:block; position:absolute; font-style:normal; }
${scope} .eb-ambient {
  inset:6px; z-index:0;
  background:radial-gradient(ellipse 135px 170px at 50% 50%,color-mix(in srgb,var(--eb-hot) 30%,transparent),transparent 100%),
    radial-gradient(ellipse 120px 20px at 50% 94%,color-mix(in srgb,var(--eb-hot) 21%,transparent),transparent 100%);
}
${scope} .eb-panel {
  left:24px; top:31px; width:252px; height:328px; z-index:1;
  border-radius:39% 39% 13% 13% / 8% 8% 8% 8%;
  background:radial-gradient(ellipse at 63% 32%,var(--eb-mid),transparent 66%),
    linear-gradient(122deg,#01070e,var(--eb-deep) 46%,#03060c);
  box-shadow:inset 0 0 23px #000b,0 0 13px color-mix(in srgb,var(--eb-glow) 30%,transparent);
}
${scope} .eb-tail {
  left:41px; top:300px; width:218px; height:74px; z-index:1;
  border-radius:0 0 50% 50% / 0 0 95% 95%; background:var(--eb-deep);
}
${scope} .eb-scenery { position:absolute; inset:0; z-index:2; }
${scope} .eb-frame { position:absolute; inset:0; z-index:9; }
${scope} .eb-frame-outer {
  left:24px; top:40px; width:252px; height:315px;
  border:2px solid var(--eb-light); border-top-color:transparent; border-bottom-color:transparent;
  border-radius:12px 12px 23px 23px;
  box-shadow:inset 2px 0 3px #010710,0 0 5px color-mix(in srgb,var(--eb-hot) 65%,transparent);
}
${scope} .eb-frame-inner {
  left:29px; top:42px; width:242px; height:308px;
  border:1px solid var(--eb-rim); border-top-color:transparent; border-bottom-color:transparent;
  border-radius:8px 8px 18px 18px; opacity:.83;
}
${scope} .eb-crown-wing, ${scope} .eb-crown-echo {
  top:40px; width:103px; height:27px; border-top:2px solid var(--eb-rim);
  border-radius:42% 0 0 0; transform-origin:0 0;
  box-shadow:0 -2px 4px color-mix(in srgb,var(--eb-hot) 20%,transparent);
}
${scope} .crown-wing-l { left:25px; transform:rotate(-16deg); }
${scope} .crown-wing-r { left:275px; transform:scaleX(-1) rotate(-16deg); }
${scope} .eb-crown-echo { width:101px; top:44px; border-top-width:1px; border-color:var(--eb-light); }
${scope} .crown-echo-l { left:30px; transform:rotate(-16deg); }
${scope} .crown-echo-r { left:270px; transform:scaleX(-1) rotate(-16deg); }
${scope} .eb-crown-curl {
  top:5px; width:25px; height:23px; border-bottom:2px solid var(--eb-rim); border-radius:0 0 70% 70%;
  box-shadow:0 3px 0 -2px var(--eb-light);
}
${scope} .crown-curl-l { left:125px; transform:rotate(-24deg); }
${scope} .crown-curl-r { left:150px; transform:rotate(24deg); }
${scope} .eb-crown-gem {
  left:148px; top:16px; width:5px; height:8px; transform:rotate(45deg);
  border:1px solid var(--eb-rim); border-radius:50% 10%; background:var(--eb-deep);
}
${scope} .eb-foot, ${scope} .eb-foot-echo {
  top:329px; width:126px; height:26px; border-bottom:2px solid var(--eb-rim);
  border-radius:0 0 0 75%; transform-origin:0 50%;
}
${scope} .foot-l { left:25px; transform:rotate(10deg); }
${scope} .foot-r { left:275px; transform:scaleX(-1) rotate(10deg); }
${scope} .eb-foot-echo { top:326px; width:121px; height:25px; border-bottom:1px solid var(--eb-light); }
${scope} .foot-echo-l { left:30px; transform:rotate(10deg); }
${scope} .foot-echo-r { left:270px; transform:scaleX(-1) rotate(10deg); }
${scope} .eb-corner {
  top:39px; width:21px; height:37px; border-top:1px solid var(--eb-rim);
  border-left:1px solid var(--eb-rim); border-radius:80% 0 0 0;
}
${scope} .corner-l { left:34px; transform:rotate(8deg); }
${scope} .corner-r { right:34px; transform:scaleX(-1) rotate(8deg); }
${scope} .eb-filigree {
  border-top:1px solid color-mix(in srgb,var(--eb-rim) 64%,transparent);
  border-bottom:1px solid color-mix(in srgb,var(--eb-light) 50%,transparent);
  border-radius:85% 12% 80% 20%;
  background:linear-gradient(140deg,color-mix(in srgb,var(--eb-hot) 12%,transparent),transparent 70%);
}
${scope} .eb-stud { border-radius:50%; background:var(--eb-rim); box-shadow:0 0 4px var(--eb-hot); }
${scope} .eb-foot-jewel {
  left:146px; top:360px; width:8px; height:8px; transform:rotate(45deg);
  border:1px solid var(--eb-rim); border-radius:0 40%; background:var(--eb-deep);
  box-shadow:0 0 4px var(--eb-glow);
}
${scope} .eb-spark {
  border-radius:50%; background:#d7f7ff; box-shadow:0 0 5px 1px var(--eb-hot),0 0 10px var(--eb-glow);
}
${scope} .eb-spark::before, ${scope} .eb-spark::after {
  content:''; position:absolute; top:50%; left:50%; width:9px; height:1px;
  transform:translate(-50%,-50%); background:linear-gradient(90deg,transparent,var(--eb-rim),transparent);
}
${scope} .eb-spark::after { transform:translate(-50%,-50%) rotate(90deg); }
${scope} .eb-rating-shade {
  left:31px; top:40px; width:75px; height:99px; z-index:4; border-radius:8px 35% 50% 9px;
  background:radial-gradient(ellipse at 18% 33%,var(--eb-deep) 31%,color-mix(in srgb,var(--eb-deep) 78%,transparent) 56%,transparent 74%);
}
${scope} .eb-lower-shade {
  left:29px; top:214px; width:242px; height:145px; z-index:7; border-radius:0 0 5px 5px;
  background:linear-gradient(180deg,transparent,var(--eb-deep) 40%,#02070beb 75%,var(--eb-deep));
}
${scope} .eb-name-band {
  left:32px; top:234px; width:236px; height:34px; z-index:8; border-radius:18% 18% 0 0 / 18% 18% 0 0;
  border-top:1px solid color-mix(in srgb,var(--eb-rim) 37%,transparent);
  border-bottom:1px solid color-mix(in srgb,var(--eb-light) 23%,transparent);
  background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--eb-deep) 90%,#000) 20% 80%,transparent);
}
${scope} .eb-stats-rule {
  left:39px; top:309px; width:222px; height:1px; z-index:8;
  background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--eb-rim) 26%,transparent),transparent);
}

/* Frost: translucent columns with separately lit inner planes. */
${scope} .eb-ice-aureole {
  left:40px; top:24px; width:224px; height:244px; border-radius:50%;
  background:radial-gradient(ellipse at 64% 42%,#8ae3ff4a,transparent 55%),
    radial-gradient(ellipse at 37% 72%,#31a6ff77,transparent 63%);
}
${scope} .eb-crystal {
  border:0; border-radius:1% 25% 2% 17%;
  background:linear-gradient(117deg,#d8f9ff 0%,#7ac4e8 10%,#174b7a 11% 38%,#d2f8ff 39% 42%,#347bb5 43% 69%,#0b2c59 70% 100%);
  box-shadow:inset 1px 0 0 #e4ffffa0,inset -1px 0 0 #80c4f399;
  opacity:.92; transform-origin:50% 50%;
}
${scope} .eb-crystal-vein {
  left:41%; top:4%; width:25%; height:90%; transform:skewY(-26deg);
  border-left:1px solid #d8faff; border-radius:0 2px 8px 0;
  background:linear-gradient(102deg,#b8efff88,transparent 75%);
}
${scope} .eb-ice-current {
  border-top:2px solid #90d9ff8a; border-left:1px solid #54a2d96b;
  border-radius:50%; box-shadow:0 -4px 6px -4px #dbffff;
}

/* Blaze: open curls and pointed, asymmetric rounded tongues. */
${scope} .eb-fire-aureole {
  left:58px; top:31px; width:218px; height:238px; border-radius:50%;
  background:radial-gradient(ellipse at 69% 41%,#ffb82575,transparent 33%),
    radial-gradient(ellipse at 45% 50%,#f8291287,transparent 69%);
}
${scope} .eb-flame {
  border-left:.7px solid #ffd080; border-top:0;
  border-radius:95% 2% 91% 7%;
  background:linear-gradient(108deg,#ffe6a5,#ff662d 8%,#e4281b 18%,#9e0b0e88 34%,transparent 62%);
  box-shadow:-2px 0 3px #ef190c55;
}
${scope} .flame-bright { border-left-color:#ffe6ad; background:linear-gradient(108deg,#fff4bd,#ff692a 11%,#c3191180 28%,transparent 62%); }
${scope} .eb-fire-wing{border-radius:90% 6% 80% 10%;border-top:1px solid #ffb87a;background:linear-gradient(180deg,#ef3f21,#650d0d 20%,#180406 64%);box-shadow:0 -1px 3px #ff321e66}
${scope} .eb-fire-edge{border-radius:75% 5% 50% 10%;border-left:.7px solid #ffe29b;border-top:.7px solid #ff5937;background:linear-gradient(100deg,#ff4b2244,transparent 40%)}
${scope} .eb-fire-whip {
  border-top:2px solid #ff7b39; border-right:1px solid #f33a18;
  border-radius:48% 80% 20% 60%; box-shadow:0 -3px 5px -3px #ffe186;
}
${scope} .eb-ember { border-radius:80% 10%; background:#ffba65; box-shadow:0 0 5px #ff3a1a; }

/* Volt: a neon triangle assembled from three ordinary bars. */
${scope} .eb-neon-aureole {
  left:63px; top:31px; width:203px; height:217px; border-radius:50%;
  background:radial-gradient(ellipse at 30% 41%,#ae13eb55,transparent 66%),
    radial-gradient(ellipse at 75% 55%,#0db8ea4a,transparent 59%);
}
${scope} .eb-triangle-bar {
  height:3px; transform-origin:0 50%; border-radius:2px; background:#fbb9ff;
  box-shadow:0 0 3px #fff,0 0 7px #ff25fc,0 0 17px #dd08e6;
}
${scope} .triangle-one { left:110px; top:88px; width:156px; transform:rotate(-16deg); }
${scope} .triangle-two { left:260px; top:45px; width:153px; transform:rotate(114deg); }
${scope} .triangle-three { left:198px; top:185px; width:131px; transform:rotate(-132deg); }
${scope} .eb-triangle-echo { height:1px; transform-origin:0 50%; background:#3ddcff; opacity:.48; }
${scope} .triangle-echo-one { left:114px; top:96px; width:139px; transform:rotate(-16deg); }
${scope} .triangle-echo-two { left:251px; top:57px; width:134px; transform:rotate(114deg); }
${scope} .eb-tower {
  border-top:1px solid #72d6f5; border-left:1px solid #2ac2ee; border-right:1px solid #7029bb;
  border-radius:2px 0 0 0; background:linear-gradient(90deg,#051524,#143047 57%,#080b24);
  box-shadow:-2px 0 7px #15c2ff29;
}
${scope} .eb-tower::before {
  content:''; position:absolute; left:3px; top:12px; width:2px; height:67%;
  background:linear-gradient(180deg,#66eaff 0% 9%,transparent 9% 15%,#2fa3ca 15% 27%,transparent 27% 32%,#55cdf0 32% 37%,transparent 37% 51%,#1b647e 51% 69%,transparent 69% 81%,#4796b6 81% 100%);
  box-shadow:4px 4px 0 #22709d55;
}
${scope} .eb-tower::after {
  content:''; position:absolute; top:-11px; right:3px; width:1px; height:11px;
  background:#448ba8; box-shadow:0 -1px 3px #9af3ff;
}
${scope} .tower-1 { border-left-color:#ca42f7; background:linear-gradient(90deg,#251235,#0a1230); }
${scope} .tower-2 { border-right-color:#20d4ff; }
${scope} .eb-circuit { background:#29bada; box-shadow:0 0 4px #008aca; transform-origin:0 50%; }
${scope} .eb-terminal { border:1px solid #70e7fc; border-radius:1px; background:#061023; box-shadow:0 0 5px #0999c9; }

/* Silvah: a right-facing lion, built behind the player's silhouette. */
${scope} .eb-forest-aureole {
  left:45px; top:28px; width:230px; height:252px; border-radius:50%;
  background:radial-gradient(ellipse at 72% 38%,#42da7970,transparent 44%),
    radial-gradient(ellipse at 26% 73%,#b0dc2b42,transparent 58%);
}
${scope} .eb-lightning {
  transform-origin:0 50%; border-radius:1px; background:#d6f89e;
  box-shadow:0 0 3px #b6e74c,0 0 8px #78dc35,0 0 13px #4eab2755;
}
${scope} .lightning-dim { height:1px!important; background:#9fd14f; }
${scope} .eb-leaf-flare {
  border-top:1px solid #deeb83; border-left:2px solid #7fbe39; border-radius:95% 5% 90% 10%;
  background:linear-gradient(114deg,#adc64d88,#2f7e2940 30%,transparent 65%);
}

/* Small ornamental crests occupy only the reserved crest position. */
${scope} .eb-crest {
  position:absolute; left:185px; top:278px; width:33px; height:36px; z-index:10;
  border:1px solid var(--eb-rim); border-radius:12% 12% 47% 47% / 8% 8% 52% 52%;
  background:linear-gradient(135deg,var(--eb-mid),var(--eb-deep) 62%);
  box-shadow:0 0 5px color-mix(in srgb,var(--eb-glow) 35%,transparent);
}
${scope} .eb-crest-inner { inset:3px; border:1px solid color-mix(in srgb,var(--eb-rim) 53%,transparent); border-radius:10% 10% 46% 46%; }
${scope} .eb-crest-mark { background:linear-gradient(90deg,var(--eb-light),var(--eb-rim)); border-radius:50% 8%; transform-origin:0 50%; }
${scope} .crest-blaze .eb-crest-mark { border-radius:90% 5% 85% 10%; background:linear-gradient(110deg,var(--eb-rim),#e54d25 48%,#811915); }
${scope} .crest-volt .eb-crest-mark { background:#f6a7fb; box-shadow:0 0 3px #eb37ef66; border-radius:1px; }
${scope} .crest-silvah .eb-crest-mark { border-radius:80% 10%; background:linear-gradient(160deg,#d6eda1,#7ba54c); }
${scope} .eb-crest-pin { left:13px; top:-3px; width:5px; height:5px; transform:rotate(45deg); border:1px solid var(--eb-rim); border-radius:0 40%; background:var(--eb-deep); }
`;
