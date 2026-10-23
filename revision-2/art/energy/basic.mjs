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
    ...iceLayout.map(([x,y,w,h,a], n) => el('crystal',
      `${frameBox(x,y,w,h,a)}--eb-ice:${n % 3 === 0 ? '.9' : '.57'};`, el('crystal-vein'))),
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

function lion() {
  const mane = [
    [16,7,55,25,-29], [35,0,54,23,-11], [59,6,46,20,13],
    [6,24,61,23,-40], [4,44,58,24,-49], [0,66,62,23,-54],
    [5,90,59,24,-66], [22,108,53,23,-75], [39,109,51,21,-80],
    [58,105,43,19,-72], [77,99,32,16,-59], [20,28,43,16,-33],
    [17,51,42,17,-48], [24,78,45,17,-66], [43,84,45,15,-73],
  ];
  return el('lion', '', [
    el('lion-halo'),
    ...mane.map((v,n) => el(`mane${n % 3 === 0 ? ' mane-lit' : ''}`, box(...v))),
    el('lion-ear'), el('lion-ear-inner'), el('lion-skull'), el('lion-cheek'),
    el('lion-brow'), el('lion-eye'), el('lion-snout'), el('lion-muzzle'),
    el('lion-nose'), el('lion-mouth'), el('lion-jaw'), el('lion-fang'),
    el('lion-whisker whisker-one'), el('lion-whisker whisker-two'),
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
    el('forest-aureole'), lion(),
    ...bolts.map(([x,y,w,a],n) => el(`lightning${n % 3 === 1 ? ' lightning-dim' : ''}`, box(x,y,w,2,a))),
    ...[[27,101,12,42,-29], [20,224,11,45,-18], [30,315,12,34,-30],
      [266,271,12,45,27], [257,324,12,35,36]]
      .map(v => el('leaf-flare', box(...v))),
    ...[[52,50,3], [107,20,2], [230,31,3], [280,238,3], [52,338,2]]
      .map(([x,y,w]) => el('spark', box(x,y,w,w))),
  ].join(''), 'div');
}

function hair(back = false) {
  const locks = [[0,5,13,13,-23], [8,0,13,14,-20], [18,-2,13,15,-13],
    [29,-3,12,15,9], [39,0,11,14,19], [47,4,10,12,25], [51,9,8,11,21]];
  return el(`hair${back ? ' hair-back' : ''}`, '', [
    ...locks.map(v => el('hair-lock', box(...v))),
    el('hair-sweep hair-sweep-one'), el('hair-sweep hair-sweep-two'),
  ].join(''), 'div');
}

function frontHead() {
  return el('head', '', [
    el('temple'), el('forehead'), el('cheek cheek-l'), el('cheek cheek-r'),
    el('brow brow-l'), el('brow brow-r'), el('eye eye-l'), el('eye eye-r'),
    el('nose'), el('nose-tip'), el('nostril'), el('mouth'), el('lower-lip'),
    el('chin'), el('jaw'), hair(),
  ].join(''), 'div');
}

function profileHead() {
  return el('head head-profile', '', [
    el('temple'), el('forehead'), el('profile-cheek'), el('profile-brow'),
    el('profile-eye'), el('profile-nose'), el('profile-nostril'),
    el('profile-mouth'), el('profile-lip'), el('profile-chin'), el('profile-jaw'), hair(),
  ].join(''), 'div');
}

function backHead() {
  return el('head head-back', '', [
    el('back-temple'), el('back-ear'), el('nape'), el('nape-line'), hair(true),
  ].join(''), 'div');
}

function athlete(theme) {
  const back = theme === 'silvah';
  const folds = back
    ? [[116,164,49,11,24], [171,165,48,10,-24], [126,182,59,15,13],
      [174,186,43,12,-21], [123,204,60,13,-9], [169,213,49,10,24],
      [112,228,61,11,-15], [175,237,51,12,14], [135,245,59,10,-3]]
    : [[108,168,47,13,25], [174,165,49,12,-19], [132,180,65,15,-10],
      [112,196,62,14,15], [173,200,46,12,-26], [129,218,54,14,-12],
      [179,228,45,11,21], [107,237,60,12,-23], [147,246,61,12,6]];
  return el(`player player-${theme}`, '', [
    el('arm arm-far'), el('arm arm-near'),
    el('arm-light arm-light-near'), el('arm-light arm-light-far'),
    el('elbow elbow-near'), el('elbow elbow-far'),
    el('neck'), el('neck-tendon tendon-l'), el('neck-tendon tendon-r'),
    el('torso'), el('side-panel panel-l'), el('side-panel panel-r'),
    el('shoulder shoulder-far'), el('shoulder shoulder-near'),
    el('sleeve sleeve-far'), el('sleeve sleeve-near'),
    el('sleeve-rim rim-far'), el('sleeve-rim rim-near'),
    el('chest-light'), el('chest-shadow'),
    ...folds.map((v,n) => el(`fold fold-${n % 3}`, box(...v))),
    el('shoulder-seam seam-near'), el('shoulder-seam seam-far'),
    el('sleeve-fold sleeve-fold-near'), el('sleeve-fold sleeve-fold-far'),
    el('hem-tension hem-tension-l'), el('hem-tension hem-tension-r'),
    el('collar-under'), el('collar collar-l'), el('collar collar-r'),
    el('ear ear-l'), el('ear ear-r'),
    back ? backHead() : theme === 'blaze' ? profileHead() : frontHead(),
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
    el('rating-shade'), athlete(theme), el('lower-shade'),
    el('name-band'), el('stats-rule'), frame(), crest(theme),
  ].join('')}</div>`;
}

export const basicArt = Object.fromEntries(Object.keys(scenery).map(theme => [theme, card(theme)]));

export const basicStyles = `
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
  border:1px solid #bdeeff; border-radius:1px 4px 2px 7px;
  background:linear-gradient(117deg,#eefbff 0%,#6ac7ee 9%,#184773 10% 36%,#a9eaff 37% 40%,#2675b9 41% 65%,#74caff 66%,#132b5e 92%);
  box-shadow:inset 2px 0 0 #e4ffff7a,inset -3px -5px 9px #00164a9c,0 0 6px #398fe26b;
  opacity:var(--eb-ice); transform-origin:50% 50%;
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
  border-left:2px solid #ff702b; border-top:1px solid #ffb746;
  border-radius:95% 4% 91% 8%;
  background:linear-gradient(108deg,#ffc356aa,#ff2f1766 13%,#b209133b 35%,transparent 63%);
  box-shadow:-3px -1px 5px #ef190c55,inset 3px 0 6px #fa37085c;
}
${scope} .flame-bright { border-left-color:#ffd785; box-shadow:-2px 0 8px #ff370f99,inset 4px 0 6px #ff6c1680; }
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
${scope} .eb-lion { position:absolute; left:162px; top:54px; width:126px; height:150px; }
${scope} .eb-lion-halo {
  left:6px; top:6px; width:111px; height:134px; border-radius:49%;
  background:radial-gradient(ellipse at 61% 36%,#0b744c,#14583c72 52%,transparent 73%);
}
${scope} .eb-mane {
  border-top:2px solid #6de79f; border-left:1px solid #3a9b52;
  border-radius:92% 13% 86% 8%;
  background:linear-gradient(166deg,#3cba74,#0e4d32 18%,#042a1d 46%,#174b2942 74%,transparent);
  box-shadow:0 -2px 3px #4ce26733;
}
${scope} .mane-lit { border-top-color:#c7e97c; background:linear-gradient(165deg,#74c978,#12623c 18%,#073326 56%,transparent); }
${scope} .eb-lion-ear {
  left:64px; top:20px; width:20px; height:27px; transform:rotate(-18deg);
  border:2px solid #73d589; border-radius:65% 70% 30% 30%; background:#063426;
}
${scope} .eb-lion-ear-inner { left:70px; top:26px; width:9px; height:15px; border-radius:70%; background:#072a20; transform:rotate(-18deg); }
${scope} .eb-lion-skull {
  left:58px; top:37px; width:46px; height:58px; transform:rotate(-12deg);
  border-radius:36% 58% 28% 62%; border-top:2px solid #73e2a1;
  background:linear-gradient(118deg,#0d553b,#3eae6f 39%,#126d48 68%,#133927);
}
${scope} .eb-lion-cheek {
  left:61px; top:63px; width:35px; height:42px; transform:rotate(-28deg);
  border-radius:30% 68% 45% 70%; background:linear-gradient(97deg,#0e472d,#62b36e 52%,#174931);
  border-bottom:1px solid #72b66c;
}
${scope} .eb-lion-brow { left:83px; top:51px; width:22px; height:9px; transform:rotate(17deg); border-radius:90% 40%; background:linear-gradient(#91d78c,#276a45 60%,#0a3028); }
${scope} .eb-lion-eye { left:91px; top:59px; width:7px; height:2px; transform:rotate(9deg); border-radius:50%; background:#d0f29b; box-shadow:0 0 4px #96ec78; }
${scope} .eb-lion-snout { left:94px; top:62px; width:22px; height:19px; transform:rotate(16deg); border-radius:17% 52% 20% 30%; background:linear-gradient(160deg,#5bbd7a,#0d4f36); }
${scope} .eb-lion-muzzle { left:91px; top:75px; width:29px; height:17px; transform:rotate(-7deg); border-radius:45% 55% 44% 58%; background:linear-gradient(#86d598,#296a47 52%,#0a3525); border-top:1px solid #8bd392; }
${scope} .eb-lion-nose { left:112px; top:71px; width:10px; height:8px; transform:rotate(7deg); border-radius:45% 65% 60% 10%; background:#05211c; border-top:1px solid #46a97d; }
${scope} .eb-lion-mouth { left:96px; top:87px; width:20px; height:12px; transform:rotate(-12deg); border-radius:10% 20% 70% 60%; background:#021e19; }
${scope} .eb-lion-jaw { left:85px; top:95px; width:25px; height:9px; transform:rotate(-11deg); border-radius:20% 30% 70% 70%; background:linear-gradient(#246845,#75b477); }
${scope} .eb-lion-fang { left:111px; top:88px; width:3px; height:7px; transform:rotate(8deg); border-radius:0 0 80% 10%; background:linear-gradient(#b4e9a3,#629769); }
${scope} .eb-lion-whisker { width:22px; height:6px; border-top:1px solid #a6ddb85c; border-radius:50%; }
${scope} .whisker-one { left:100px; top:81px; transform:rotate(-12deg); }
${scope} .whisker-two { left:100px; top:85px; transform:rotate(8deg); }
${scope} .eb-lightning {
  transform-origin:0 50%; border-radius:1px; background:#d6f89e;
  box-shadow:0 0 3px #b6e74c,0 0 8px #78dc35,0 0 13px #4eab2755;
}
${scope} .lightning-dim { height:1px!important; background:#9fd14f; }
${scope} .eb-leaf-flare {
  border-top:1px solid #deeb83; border-left:2px solid #7fbe39; border-radius:95% 5% 90% 10%;
  background:linear-gradient(114deg,#adc64d88,#2f7e2940 30%,transparent 65%);
}

/* Shared human anatomy. The individual poses alter this construction below. */
${scope} .eb-player { position:absolute; inset:0; z-index:5; }
${scope} .eb-arm {
  border-radius:40% 44% 35% 34%;
  background:linear-gradient(95deg,#030b13,var(--eb-skin) 28%,var(--eb-skin-lit) 76%,#091219);
  border-right:1px solid color-mix(in srgb,var(--eb-rim) 53%,transparent);
}
${scope} .arm-far { left:224px; top:181px; width:25px; height:83px; transform:rotate(-29deg); }
${scope} .arm-near { left:79px; top:184px; width:29px; height:92px; transform:rotate(29deg); }
${scope} .eb-arm-light {
  width:10px; height:47px; border-radius:60% 30% 85% 30%;
  background:linear-gradient(100deg,transparent,color-mix(in srgb,var(--eb-skin-lit) 70%,transparent),transparent);
}
${scope} .arm-light-near { left:83px; top:206px; transform:rotate(31deg); }
${scope} .arm-light-far { left:244px; top:206px; transform:rotate(-28deg); }
${scope} .eb-elbow {
  width:17px; height:10px; border-top:1px solid color-mix(in srgb,var(--eb-skin-lit) 45%,transparent);
  border-radius:50%; background:linear-gradient(#01080c80,transparent);
}
${scope} .elbow-near { left:76px; top:235px; transform:rotate(29deg); }
${scope} .elbow-far { left:246px; top:234px; transform:rotate(-28deg); }
${scope} .eb-neck {
  left:157px; top:109px; width:35px; height:54px; transform:rotate(-6deg);
  border-radius:21% 20% 37% 48%; border-right:1px solid var(--eb-skin-lit);
  background:linear-gradient(108deg,#03090e 15%,var(--eb-skin) 53%,var(--eb-skin-lit) 92%);
  box-shadow:inset 0 10px 7px #0008;
}
${scope} .eb-neck-tendon { top:127px; width:3px; height:29px; border-radius:50%; background:linear-gradient(transparent,var(--eb-skin-lit)); opacity:.63; }
${scope} .tendon-l { left:163px; transform:rotate(-19deg); }
${scope} .tendon-r { left:182px; transform:rotate(18deg); }
${scope} .eb-torso {
  left:108px; top:152px; width:124px; height:128px; transform:rotate(-3deg);
  border-radius:40% 41% 14% 19% / 19% 24% 44% 43%;
  background:radial-gradient(ellipse at 22% 17%,var(--eb-jersey-lit),transparent 46%),
    linear-gradient(104deg,#040c12,var(--eb-jersey) 18%,#060c12 49%,var(--eb-jersey-lit) 93%,#040c12);
  box-shadow:inset 2px 0 2px color-mix(in srgb,var(--eb-rim) 20%,transparent),inset -3px 0 3px #030809;
}
${scope} .eb-torso::after {
  content:'';position:absolute;inset:0;border-radius:inherit;
  background:repeating-linear-gradient(110deg,transparent 0 1.8px,#e1f3ff09 1.8px 2.1px,transparent 2.1px 3px),repeating-linear-gradient(20deg,transparent 0 2px,#00000013 2px 2.3px,transparent 2.3px 3.5px);
}
${scope} .eb-side-panel { top:181px; width:20px; height:90px; border-radius:70% 20% 20% 60%; background:linear-gradient(90deg,#010709d9,transparent); }
${scope} .panel-l { left:111px; transform:rotate(-9deg); border-left:1px solid #ffffff19; }
${scope} .panel-r { left:210px; transform:rotate(7deg); opacity:.8; }
${scope} .eb-shoulder {
  border-top:2px solid var(--eb-seam); border-radius:65% 65% 18% 32%;
  background:linear-gradient(164deg,var(--eb-jersey-lit),var(--eb-jersey) 38%,#061018);
  box-shadow:0 -2px 3px color-mix(in srgb,var(--eb-hot) 28%,transparent);
}
${scope} .shoulder-near { left:96px; top:150px; width:64px; height:42px; transform:rotate(-27deg); }
${scope} .shoulder-far { left:192px; top:156px; width:47px; height:38px; transform:rotate(29deg); }
${scope} .eb-sleeve {
  border-radius:43% 32% 16% 18%; background:linear-gradient(97deg,#030b11,var(--eb-jersey-lit) 46%,var(--eb-jersey) 78%);
  border-left:1px solid color-mix(in srgb,var(--eb-rim) 66%,transparent);
  box-shadow:inset -5px -3px 5px #02060980;
}
${scope} .sleeve-near { left:88px; top:169px; width:36px; height:45px; transform:rotate(27deg); }
${scope} .sleeve-far { left:214px; top:170px; width:32px; height:43px; transform:rotate(-26deg); }
${scope} .eb-sleeve-rim {
  width:32px; height:5px; border-bottom:1px solid var(--eb-seam); border-top:1px solid #02070ca8;
  border-radius:0 0 50% 35%; background:color-mix(in srgb,var(--eb-jersey-lit) 60%,#000);
}
${scope} .rim-near { left:80px; top:207px; transform:rotate(27deg); }
${scope} .rim-far { left:223px; top:206px; transform:rotate(-26deg); }
${scope} .eb-chest-light {
  left:129px; top:167px; width:70px; height:56px; transform:rotate(-13deg); border-radius:48% 44% 68% 20%;
  background:radial-gradient(ellipse at 25% 4%,color-mix(in srgb,var(--eb-seam) 26%,transparent),transparent 69%);
}
${scope} .eb-chest-shadow {
  left:144px; top:185px; width:53px; height:82px; transform:rotate(18deg); border-radius:40%;
  background:linear-gradient(100deg,transparent,#0005 52%,transparent 77%);
}
${scope} .eb-fold {
  border-top:1px solid color-mix(in srgb,var(--eb-seam) 43%,transparent);
  border-radius:42% 70% 0 0; background:linear-gradient(180deg,#01060c66,transparent 57%);
  box-shadow:0 -1px 0 #01070d66;
}
${scope} .fold-1 { border-top-color:color-mix(in srgb,var(--eb-seam) 24%,transparent); border-radius:70% 30% 0 0; }
${scope} .fold-2 { border-top-width:2px; border-top-color:color-mix(in srgb,var(--eb-seam) 30%,transparent); }
${scope} .eb-shoulder-seam { width:32px; height:22px; border-top:1px solid color-mix(in srgb,var(--eb-rim) 60%,transparent); border-radius:75% 35% 0 0; }
${scope} .seam-near { left:96px; top:165px; transform:rotate(-50deg); }
${scope} .seam-far { left:204px; top:171px; transform:rotate(49deg); }
${scope} .eb-sleeve-fold {
  width:18px; height:29px; border-radius:48% 70% 0 0;
  border-left:1px solid color-mix(in srgb,var(--eb-seam) 45%,transparent);
  background:linear-gradient(90deg,#02080c80,transparent 69%);
}
${scope} .sleeve-fold-near { left:99px; top:175px; transform:rotate(22deg); }
${scope} .sleeve-fold-far { left:223px; top:178px; transform:rotate(-21deg); }
${scope} .eb-hem-tension { top:218px; width:9px; height:34px; border-radius:75% 25% 55% 15%; background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--eb-seam) 23%,transparent),#01060966); }
${scope} .hem-tension-l { left:120px; transform:rotate(17deg); }
${scope} .hem-tension-r { left:209px; transform:rotate(-12deg); }
${scope} .eb-collar-under { left:148px; top:148px; width:48px; height:22px; border-radius:0 0 50% 50%; background:#03090e; transform:rotate(-3deg); }
${scope} .eb-collar {
  top:151px; width:29px; height:7px; background:linear-gradient(180deg,var(--eb-jersey-lit),#060d12);
  border-top:1px solid var(--eb-seam); border-bottom:1px solid #ffffff14; border-radius:30% 20% 50% 40%;
}
${scope} .collar-l { left:146px; transform:rotate(31deg); }
${scope} .collar-r { left:169px; transform:rotate(-28deg); }
${scope} .eb-ear { border-radius:45% 50% 40% 55%; background:linear-gradient(90deg,var(--eb-skin-lit),var(--eb-skin) 48%,#030a10); border-left:1px solid var(--eb-skin-lit); }
${scope} .ear-l { left:141px; top:80px; width:9px; height:19px; transform:rotate(-8deg); }
${scope} .ear-r { left:196px; top:76px; width:8px; height:18px; transform:rotate(10deg); }
${scope} .eb-head {
  position:absolute; left:146px; top:52px; width:53px; height:73px; transform:rotate(-6deg);
  border-radius:38% 45% 44% 47% / 37% 37% 60% 59%;
  background:linear-gradient(100deg,var(--eb-skin-lit) -19%,var(--eb-skin) 18%,#030911 58%,var(--eb-skin) 86%,var(--eb-skin-lit));
  border-right:1px solid color-mix(in srgb,var(--eb-rim) 55%,transparent);
  box-shadow:inset -3px -3px 4px #03090d70;
}
${scope} .eb-temple { left:3px; top:14px; width:10px; height:27px; transform:rotate(-8deg); border-radius:70% 15% 60% 60%; background:linear-gradient(95deg,var(--eb-skin-lit),transparent); opacity:.46; }
${scope} .eb-forehead { left:15px; top:12px; width:30px; height:17px; border-radius:50%; background:radial-gradient(ellipse at 70% 0%,var(--eb-skin-lit),transparent 73%); opacity:.34; }
${scope} .eb-cheek { width:15px; height:24px; border-radius:25% 80% 35% 65%; background:linear-gradient(112deg,var(--eb-skin-lit),var(--eb-skin) 42%,transparent 70%); }
${scope} .cheek-l { left:4px; top:36px; transform:rotate(-20deg); opacity:.52; }
${scope} .cheek-r { left:36px; top:33px; transform:rotate(21deg); opacity:.44; }
${scope} .eb-brow { top:28px; width:15px; height:4px; border-radius:60% 40% 20% 20%; background:#02070c; border-top:1px solid color-mix(in srgb,var(--eb-skin-lit) 48%,transparent); }
${scope} .brow-l { left:7px; transform:rotate(9deg); }
${scope} .brow-r { left:31px; top:26px; width:13px; transform:rotate(-11deg); }
${scope} .eb-eye { width:8px; height:2px; border-radius:60% 40%; background:linear-gradient(90deg,var(--eb-skin-lit),#02070b 50%); opacity:.57; }
${scope} .eye-l { left:11px; top:33px; transform:rotate(7deg); }
${scope} .eye-r { left:33px; top:31px; width:7px; transform:rotate(-9deg); }
${scope} .eb-nose { left:25px; top:29px; width:8px; height:22px; transform:rotate(-6deg); border-radius:34% 40% 20% 35%; background:linear-gradient(98deg,#01070a 32%,var(--eb-skin) 66%,var(--eb-skin-lit)); opacity:.78; }
${scope} .eb-nose-tip { left:25px; top:46px; width:10px; height:6px; border-radius:50% 50% 35% 35%; background:linear-gradient(153deg,var(--eb-skin-lit),var(--eb-skin) 42%,#03080b 82%); opacity:.56; }
${scope} .eb-nostril { left:25px; top:50px; width:4px; height:2px; border-radius:50%; background:#020608; }
${scope} .eb-mouth { left:21px; top:58px; width:17px; height:2px; transform:rotate(-4deg); border-radius:50%; background:#010609; }
${scope} .eb-lower-lip { left:25px; top:60px; width:11px; height:2px; transform:rotate(-4deg); border-radius:50%; background:var(--eb-skin-lit); opacity:.37; }
${scope} .eb-chin { left:20px; top:64px; width:22px; height:7px; border-radius:40% 40% 70% 65%; background:linear-gradient(170deg,transparent,var(--eb-skin-lit)); opacity:.27; }
${scope} .eb-jaw { left:8px; top:48px; width:11px; height:22px; transform:rotate(-30deg); border-radius:50%; border-left:1px solid var(--eb-skin-lit); opacity:.32; }
${scope} .eb-hair {
  position:absolute; left:-3px; top:-7px; width:58px; height:27px; transform:rotate(-4deg);
  border-radius:45% 51% 20% 17%; border-top:1px solid var(--eb-rim);
  background:radial-gradient(ellipse at 32% 2%,var(--eb-skin-lit),#02080f 51%,#01060a 84%);
  box-shadow:0 -2px 4px color-mix(in srgb,var(--eb-hot) 50%,transparent);
}
${scope} .eb-hair-lock {
  border-radius:70% 43% 20% 12%; border-left:.7px solid color-mix(in srgb,var(--eb-rim) 38%,transparent);
  background:linear-gradient(111deg,var(--eb-skin-lit),#02080e 26%); transform-origin:50% 100%;
}
${scope} .eb-hair-sweep { width:37px; height:13px; border-top:1px solid color-mix(in srgb,var(--eb-skin-lit) 60%,transparent); border-radius:75% 40%; }
${scope} .hair-sweep-one { left:4px; top:5px; transform:rotate(-18deg); }
${scope} .hair-sweep-two { left:12px; top:10px; transform:rotate(-23deg); opacity:.65; }

/* Frost leans slightly into the near shoulder. */
${scope}.frost .eb-head { transform:rotate(-8deg); }
${scope}.frost .cheek-l { width:18px; opacity:.58; }
${scope}.frost .cheek-r { left:39px; width:11px; opacity:.39; }
${scope}.frost .eb-nose { left:28px; width:7px; }
${scope}.frost .eb-nose-tip { left:28px; width:9px; }
${scope}.frost .eb-nostril { left:28px; }
${scope}.frost .eb-mouth { left:25px; width:15px; }
${scope}.frost .eb-lower-lip { left:28px; width:10px; }
${scope}.frost .eb-torso { transform:rotate(-5deg); }
${scope}.frost .eb-shoulder { box-shadow:0 -2px 4px #70ceff55; }
${scope}.frost .eb-fold { border-top-color:#83bcdd73; }
${scope}.frost .fold-1 { border-top-color:#83bcdd35; }

/* Blaze turns toward the left, with the bright edge behind his head. */
${scope}.blaze .eb-player { transform:rotate(-3deg); transform-origin:170px 200px; }
${scope}.blaze .head-profile {
  left:148px; top:54px; width:49px; height:70px; transform:rotate(7deg);
  border-radius:31% 50% 45% 34% / 25% 37% 60% 56%;
  background:linear-gradient(94deg,var(--eb-skin-lit) -30%,#150909 16%,#080708 58%,#662019 92%,#ee5e30);
  border-right:2px solid #e45a35;
}
${scope}.blaze .eb-neck { left:160px; transform:rotate(8deg); }
${scope}.blaze .ear-l { left:185px; top:83px; width:9px; height:17px; transform:rotate(12deg); z-index:1; opacity:.85; }
${scope}.blaze .ear-r { left:194px; top:78px; width:6px; opacity:.4; }
${scope}.blaze .eb-hair { left:-2px; width:54px; top:-11px; transform:rotate(-4deg); border-top-color:#ffb060; box-shadow:1px -3px 7px #ff361a70; }
${scope}.blaze .shoulder-near { left:102px; top:154px; width:58px; transform:rotate(-22deg); }
${scope}.blaze .eb-chest-light { left:155px; transform:rotate(12deg); }
${scope}.blaze .eb-torso { transform:rotate(2deg); }
${scope} .eb-profile-cheek { left:9px; top:32px; width:24px; height:25px; transform:rotate(-21deg); border-radius:15% 70% 50% 70%; background:linear-gradient(150deg,#6b2a1e,#200b09 35%,transparent 72%); opacity:.74; }
${scope} .eb-profile-brow { left:-1px; top:25px; width:16px; height:5px; transform:rotate(-8deg); border-radius:50% 10%; background:#090708; border-top:1px solid #a8452870; }
${scope} .eb-profile-eye { left:3px; top:31px; width:7px; height:2px; transform:rotate(-9deg); border-radius:50%; background:linear-gradient(90deg,#8e4b34,#080808 65%); }
${scope} .eb-profile-nose { left:-7px; top:30px; width:13px; height:17px; transform:rotate(24deg); border-radius:85% 0 37% 20%; background:linear-gradient(100deg,#7c3525,#2c110c 32%,#140b0a); border-left:1px solid #b7502866; }
${scope} .eb-profile-nostril { left:0; top:43px; width:5px; height:2px; transform:rotate(9deg); border-radius:50%; background:#080608; }
${scope} .eb-profile-mouth { left:0; top:53px; width:12px; height:2px; transform:rotate(4deg); border-radius:20% 80%; background:#070506; }
${scope} .eb-profile-lip { left:1px; top:55px; width:9px; height:2px; border-radius:40%; background:#813526; opacity:.6; }
${scope} .eb-profile-chin { left:2px; top:58px; width:17px; height:10px; border-radius:20% 30% 55% 60%; background:linear-gradient(105deg,#5c281e,#1c0e0b 42%,transparent); }
${scope} .eb-profile-jaw { left:10px; top:53px; width:26px; height:11px; transform:rotate(-29deg); border-radius:50%; border-bottom:1px solid #91442a55; }

/* Volt has a squared stance and a cool face against a magenta rim. */
${scope}.volt .eb-head { left:148px; top:53px; transform:rotate(-1deg); border-right-color:#50d9ed; }
${scope}.volt .eb-hair { border-top-color:#7ce5ff; box-shadow:-3px 0 6px #ce16ed66,2px -3px 5px #23c4ea88; }
${scope}.volt .eb-hair-lock { border-radius:90% 0 13% 8%; border-left-color:#83e8ff91; }
${scope}.volt .shoulder-near { border-top-color:#f35fee; }
${scope}.volt .eb-sleeve.sleeve-near { border-left-color:#ec36eb; }
${scope}.volt .eb-torso { transform:rotate(0); background:radial-gradient(ellipse at 12% 17%,#a0299959,transparent 45%),linear-gradient(104deg,#06091a,#17213d 25%,#080b1b 58%,#13445d 94%,#030c1c); }
${scope}.volt .eb-chest-light { background:radial-gradient(ellipse at 73% 3%,#1798c348,transparent 67%); }
${scope}.volt .arm-near { transform:rotate(38deg); left:74px; }
${scope}.volt .arm-far { transform:rotate(-38deg); left:230px; }

/* Silvah shows the nape and shoulder blades, without facial features. */
${scope}.silvah .head-back {
  left:151px; top:52px; width:53px; height:72px; transform:rotate(9deg);
  border-radius:43% 48% 32% 33%;
  background:linear-gradient(104deg,#263c20,#0a170f 26%,#06120b 70%,#41652b 98%);
  border-right:1px solid #9db757;
}
${scope}.silvah .hair-back { top:-8px; height:48px; width:57px; border-radius:42% 43% 29% 25%; background:radial-gradient(ellipse at 69% 0%,#35542b,#06130c 53%,#09150c); border-top-color:#b9dc75; }
${scope} .eb-back-temple { left:41px; top:24px; width:9px; height:28px; transform:rotate(7deg); border-radius:45%; background:linear-gradient(90deg,#162b17,#618441); }
${scope} .eb-back-ear { left:48px; top:31px; width:8px; height:18px; transform:rotate(7deg); border-radius:50% 55% 50% 45%; background:linear-gradient(90deg,#274524,#6d8f42); border-right:1px solid #afd17a; }
${scope} .eb-nape { left:15px; top:41px; width:30px; height:31px; border-radius:20% 20% 35% 30%; background:linear-gradient(105deg,#172b15,#0b1b0f 60%,#344c23); box-shadow:inset 0 9px 5px #051109; }
${scope} .eb-nape-line { left:31px; top:56px; width:3px; height:17px; transform:rotate(-5deg); border-radius:70%; background:linear-gradient(transparent,#64823c55); }
${scope}.silvah .eb-neck { left:162px; top:109px; width:37px; transform:rotate(7deg); background:linear-gradient(100deg,#294020,#0b1b0f 36% 69%,#65823b); }
${scope}.silvah .ear-l { left:148px; top:79px; width:7px; height:17px; opacity:.6; }
${scope}.silvah .ear-r { left:199px; top:82px; opacity:.4; }
${scope}.silvah .eb-torso { left:104px; top:152px; width:134px; transform:rotate(3deg); border-radius:38% 40% 15% 13% / 18% 20% 40% 40%; background:radial-gradient(ellipse at 28% 17%,#416f36,transparent 43%),linear-gradient(101deg,#08190f,#173523 20%,#091d13 53%,#294f2f 90%,#091b0f); }
${scope}.silvah .shoulder-near { left:95px; top:155px; width:66px; transform:rotate(-20deg); }
${scope}.silvah .shoulder-far { left:194px; top:159px; width:50px; transform:rotate(32deg); }
${scope}.silvah .eb-collar-under { left:149px; top:145px; width:50px; height:19px; transform:rotate(4deg); }
${scope}.silvah .eb-collar { top:147px; height:10px; border-top:0; border-bottom:2px solid #b3cc725e; background:linear-gradient(transparent,#06160e); }
${scope}.silvah .collar-l { left:147px; transform:rotate(14deg); border-radius:0 0 20% 80%; }
${scope}.silvah .collar-r { left:172px; transform:rotate(-9deg); border-radius:0 0 80% 20%; }
${scope}.silvah .eb-chest-light { left:119px; top:175px; width:94px; height:45px; transform:rotate(8deg); background:radial-gradient(ellipse at 19% 5%,#9fce7940,transparent 51%),radial-gradient(ellipse at 89% 20%,#a0bb4b2e,transparent 52%); }
${scope}.silvah .eb-chest-shadow { left:163px; top:167px; width:22px; height:102px; transform:rotate(-1deg); opacity:.7; }

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
