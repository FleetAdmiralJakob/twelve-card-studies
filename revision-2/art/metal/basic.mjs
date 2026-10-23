// The metal edition, assembled entirely from ordinary CSS primitives.
const box = (name, x, y, w, h, turn = 0, extra = '', inside = '') =>
  `<i class="${name.split(' ').map(part => `r2-mb-${part}`).join(' ')}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${turn}deg);${extra}">${inside}</i>`;

const crown = (x, y, small = false) => `<div class="r2-mb-crown${small ? ' r2-mb-crown-small' : ''}" style="left:${x}px;top:${y}px">${[[-17, 8], [-9, 3], [0, 0], [9, 3], [17, 8]].map(([angle, top], n) => box('crown-tine', n * 8 + 2, top, 3, 20 - top, angle)).join('')}<b class="r2-mb-crown-band"></b></div>`;

const laurels = (bronze = false) => `<div class="r2-mb-laurels">${[false, true].map(right => {
  const leaves = Array.from({ length: 13 }, (_, n) => {
    const y = 116 + n * 12.2;
    const x = 13 + Math.pow((n - 3) / 9, 2) * 13;
    return box('leaf', right ? 291 - x : x, y, 7, 21, right ? 29 - n * 2 : -29 + n * 2, `--leaf-tone:${bronze ? '.75' : '1'};`) +
      box('leaf leaf-inner', right ? 285 - x : x + 7, y + 8, 6, 16, right ? -32 - n : 32 + n, `--leaf-tone:${bronze ? '.7' : '.9'};`);
  }).join('');
  return `<div class="r2-mb-branch${right ? ' r2-mb-branch-right' : ''}"></div>${leaves}`;
}).join('')}</div>`;

const seams = items => items.map(([x, y, w, h, a, o = 1]) => box('fold', x, y, w, h, a, `opacity:${o};`)).join('');
const hair = (x, y, color = '') => `<div class="r2-mb-hair" style="left:${x}px;top:${y}px;${color}">${[[2, 11, 7, 9], [5, 5, 7, 7], [11, 2, 8, 6], [19, 0, 8, 6], [27, 1, 8, 6], [34, 4, 8, 7], [41, 7, 7, 8], [46, 13, 6, 9]].map(([a, b, w, h], n) => box('curl', a, b, w, h, n * 15)).join('')}</div>`;

function valorFigure() {
  return `<div class="r2-mb-figure r2-mb-back-player">
    ${box('arm arm-left', 79, 154, 27, 66, 31)}
    ${box('forearm forearm-left', 60, 204, 50, 21, -34)}
    ${box('neck', 156, 102, 29, 35, -12)}
    ${box('torso', 110, 119, 116, 133, -9)}
    ${box('shoulder', 98, 115, 105, 48, -13)}
    ${box('sleeve sleeve-left', 88, 130, 48, 51, 35)}
    ${box('sleeve sleeve-right', 198, 133, 38, 58, -19)}
    ${box('arm arm-right', 214, 175, 25, 54, -18)}
    ${box('head', 145, 55, 49, 64, 8)}
    ${box('ear', 189, 82, 8, 17, 8)}
    ${hair(143, 47)}
    ${box('collar', 143, 115, 48, 13, -9)}
    ${seams([[109, 129, 50, 12, -12], [123, 139, 62, 17, 19, .75], [135, 154, 65, 21, 17, .46], [145, 174, 61, 12, -12, .56], [123, 183, 53, 18, 32, .55], [130, 210, 58, 9, -27, .65], [102, 142, 24, 11, 37], [96, 151, 27, 7, 31, .75], [209, 151, 21, 12, -19], [213, 162, 20, 10, -20, .7], [153, 132, 12, 59, -22, .32], [164, 191, 14, 38, 20, .5]])}
    <div class="r2-mb-ball">${box('ball-panel', 22, 22, 19, 18, 20)}${box('ball-panel', 4, 8, 15, 14, -25)}${box('ball-panel', 44, 10, 15, 15, 27)}${box('ball-panel', 9, 43, 15, 14, 27)}${box('ball-panel', 41, 43, 16, 15, -24)}<i class="r2-mb-ball-latitude"></i><i class="r2-mb-ball-longitude"></i></div>
    ${crown(191, 155, true)}
    ${box('forearm forearm-right', 186, 216, 53, 20, -15)}
    ${box('hand', 176, 211, 29, 16, 12)}
    ${box('finger', 180, 211, 23, 3, 10)}${box('finger', 179, 216, 22, 2, 9)}
  </div>`;
}

function nexusFigure() {
  return `<div class="r2-mb-figure r2-mb-profile-player">
    ${box('cape cape-back', 53, 135, 132, 112, -17, 'transform:rotate(-17deg) skewX(-14deg);')}
    ${box('cape cape-shoulder', 84, 122, 112, 55, -21, 'transform:rotate(-21deg) skewX(-23deg);')}
    ${[[39, 159, 133, 32, -19], [43, 180, 145, 24, -28], [54, 196, 125, 22, -32], [67, 215, 106, 18, -28], [74, 142, 98, 19, -15]].map(p => box('cape-ridge', ...p)).join('')}
    ${box('neck', 159, 104, 26, 35, -8)}
    ${box('torso', 129, 126, 102, 132, -10)}
    ${box('shoulder', 135, 123, 91, 49, 8)}
    ${box('sleeve sleeve-right', 195, 139, 42, 61, -23)}
    ${box('arm arm-right', 217, 184, 26, 53, -29)}
    ${box('forearm forearm-right', 230, 221, 37, 21, 29)}
    ${box('head', 147, 52, 48, 66, 7)}
    ${box('nose', 189, 78, 9, 12, -14)}
    ${box('jaw', 175, 97, 18, 17, 8)}
    ${box('ear', 148, 81, 9, 17, 7)}
    ${hair(146, 47)}
    ${box('brow', 178, 77, 15, 3, 7)}
    ${box('collar', 145, 118, 45, 13, 9)}
    ${seams([[141, 133, 62, 13, -6], [148, 145, 69, 14, 11, .75], [159, 167, 40, 24, -15, .5], [158, 201, 37, 20, 17, .5], [145, 220, 52, 12, -15, .65], [201, 149, 29, 14, -22], [206, 163, 28, 12, -22, .7], [210, 178, 27, 9, -21, .8], [171, 160, 14, 58, -9, .45], [126, 174, 16, 62, 12, .4]])}
  </div>`;
}

function aurumFigure() {
  return `<div class="r2-mb-figure r2-mb-statue-player">
    ${box('neck', 161, 105, 29, 34, -13)}
    ${box('arm arm-left', 110, 167, 29, 79, 18)}
    ${box('torso', 126, 125, 110, 131, -13)}
    ${box('shoulder', 122, 124, 113, 51, -8)}
    ${box('sleeve sleeve-left', 114, 138, 43, 51, 19)}
    ${box('sleeve sleeve-right', 204, 132, 43, 59, -26)}
    ${box('arm arm-right', 227, 180, 28, 64, -25)}
    ${box('head', 147, 53, 48, 64, -9)}
    ${box('nose', 142, 82, 11, 12, 12)}
    ${box('jaw', 150, 99, 21, 14, -12)}
    ${box('ear', 188, 78, 9, 16, -10)}
    ${hair(146, 48)}
    ${box('brow', 148, 78, 20, 3, -9)}
    ${box('collar', 152, 123, 40, 17, -20)}
    ${box('shirt-placket', 168, 139, 3, 16, 7)}
    ${seams([[135, 139, 28, 21, -24], [178, 139, 36, 15, 14], [159, 161, 44, 22, -15, .7], [145, 179, 33, 19, 13, .5], [169, 198, 45, 12, -21, .7], [148, 219, 64, 16, 11, .65], [211, 144, 27, 21, -22, .8], [216, 162, 26, 12, -25, .75], [117, 155, 30, 16, 16, .75], [121, 174, 24, 9, 12, .75], [195, 173, 13, 44, -16, .6], [145, 155, 11, 47, 12, .45]])}
  </div>`;
}

function legacyFigure() {
  return `<div class="r2-mb-figure r2-mb-roman-player">
    ${box('neck', 159, 105, 27, 34, 2)}
    ${box('torso', 109, 128, 116, 124, -6)}
    ${box('shoulder', 106, 125, 111, 44, 1)}
    ${box('sleeve sleeve-left', 95, 144, 45, 58, 26)}
    ${box('arm arm-left', 90, 185, 29, 39, 19)}
    ${box('forearm forearm-left', 105, 211, 72, 23, -17)}
    ${box('sleeve sleeve-right', 191, 140, 38, 56, -18)}
    ${box('arm arm-right', 209, 184, 25, 39, -19)}
    ${box('forearm forearm-right', 172, 218, 61, 20, 17)}
    ${box('hand', 157, 211, 31, 17, 12)}
    ${box('head', 147, 55, 49, 65, 8)}
    ${box('nose', 191, 82, 9, 11, -10)}
    ${box('jaw', 181, 99, 16, 17, 8)}
    ${box('ear', 148, 83, 9, 17, 7)}
    ${hair(145, 48)}
    ${box('brow', 181, 80, 15, 3, 7)}
    ${box('collar', 142, 121, 49, 13, 7)}
    ${seams([[113, 138, 55, 12, -3], [124, 150, 71, 19, 14, .7], [137, 173, 56, 21, -12, .6], [131, 198, 50, 16, 13, .5], [150, 215, 34, 11, -16, .4], [102, 154, 29, 16, 25], [99, 170, 27, 11, 25, .7], [199, 155, 23, 16, -19], [205, 173, 21, 11, -17, .75], [141, 146, 12, 51, -16, .45]])}
    ${box('finger', 159, 212, 22, 2, 10)}${box('finger', 159, 216, 24, 2, 9)}
  </div>`;
}

const crack = ([x, y, w, a, opacity = 1]) => box('fracture', x, y, w, 1, a, `opacity:${opacity};`);

function valorBackdrop() {
  return `<div class="r2-mb-atmosphere"></div><div class="r2-mb-sun-disc"></div>
    ${[[103, 51, 66, 14, -38], [181, 46, 72, 17, 54], [213, 76, 57, 13, -44], [93, 159, 80, 12, -31], [221, 122, 42, 11, 34], [57, 193, 71, 9, -27], [211, 204, 63, 10, -38]].map(p => box('gold-ribbon', ...p)).join('')}
    ${[[106, 62, 92, -29, .5], [209, 66, 45, 68, .65], [220, 111, 51, -48, .6], [61, 163, 55, 33, .45], [53, 206, 54, -25, .5]].map(crack).join('')}
    <div class="r2-mb-star r2-mb-star-top"></div>`;
}

function nexusBackdrop() {
  return `<div class="r2-mb-atmosphere"></div>${[[102, 42, 64, 74, -28], [209, 43, 48, 99, 24], [225, 109, 49, 83, -26], [91, 100, 52, 85, 33], [45, 144, 55, 73, -22], [210, 175, 51, 61, 29], [114, 190, 49, 61, 40]].map(p => box('obsidian', ...p)).join('')}
    ${[[104, 42, 50, 39, .6], [129, 71, 54, 57, .9], [141, 93, 43, -27, .7], [117, 117, 54, 31, .8], [104, 118, 32, -69, .5], [208, 47, 69, 74, .9], [217, 80, 40, -41, .8], [232, 112, 36, 63, .7], [244, 148, 31, -33, .9], [226, 180, 47, 28, .7], [47, 170, 70, -28, .8], [67, 161, 35, 41, .7], [59, 208, 57, -52, .4], [97, 214, 52, 29, .35], [250, 226, 29, -62, .6]].map(crack).join('')}
    ${crown(118, 29)}`;
}

function aurumBackdrop() {
  return `<div class="r2-mb-atmosphere"></div>
    ${[[31, 41, 55, -23, .55], [80, 32, 28, 41, .45], [222, 49, 43, 19, .6], [242, 61, 37, 67, .65], [256, 90, 49, 112, .45], [31, 136, 48, 65, .6], [41, 173, 28, -29, .45], [45, 180, 43, 63, .6], [54, 221, 37, -42, .7], [224, 203, 47, 29, .6], [252, 221, 43, 78, .55], [242, 248, 34, -39, .4], [44, 298, 24, -39, .2], [227, 328, 40, 22, .18]].map(crack).join('')}
    <div class="r2-mb-orbit r2-mb-orbit-back"></div><div class="r2-mb-orbit r2-mb-orbit-high"></div>
    <div class="r2-mb-sphere r2-mb-sphere-small"></div>`;
}

function colosseum() {
  return `<div class="r2-mb-colosseum"><div class="r2-mb-colosseum-wall"></div>${[0, 1, 2].map(row => `<div class="r2-mb-arcade" style="top:${22 + row * 36}px">${Array.from({ length: 7 }, (_, n) => `<i class="r2-mb-arch" style="left:${n * 20 + 3}px;top:${n * .8}px;width:${11 + n * .25}px;height:${23 + row * 2}px"></i>`).join('')}</div><i class="r2-mb-cornice" style="top:${17 + row * 36}px"></i>`).join('')}<i class="r2-mb-cornice r2-mb-cornice-base"></i><i class="r2-mb-colosseum-rim"></i></div>`;
}

function legacyBackdrop() {
  return `<div class="r2-mb-atmosphere"></div><div class="r2-mb-antique-disc"></div>${colosseum()}
    ${[[36, 187, 63, 9, -22], [43, 213, 75, 10, 15], [220, 220, 42, 9, -17], [62, 229, 61, 7, -9]].map(p => box('rubble', ...p)).join('')}
    ${[[106, 47, 26, 61, .45], [120, 71, 35, -30, .4], [231, 48, 42, 31, .5], [249, 73, 32, 74, .5], [39, 131, 39, -19, .3]].map(crack).join('')}`;
}

function crest(theme) {
  if (theme === 'aurum') return `<div class="r2-mb-crest r2-mb-temple"><b class="r2-mb-temple-roof"></b>${[5, 12, 19, 26].map(x => box('column', x, 10, 3, 20)).join('')}<b class="r2-mb-temple-step"></b><i class="r2-mb-temple-step-bottom"></i></div>`;
  if (theme === 'legacy') return `<div class="r2-mb-crest r2-mb-helmet"><i class="r2-mb-helmet-plume"></i><i class="r2-mb-helmet-dome"></i><i class="r2-mb-helmet-cheek"></i><i class="r2-mb-helmet-eye"></i><i class="r2-mb-helmet-nose"></i><i class="r2-mb-helmet-neck"></i></div>`;
  if (theme === 'nexus') return `<div class="r2-mb-crest r2-mb-shield">${box('sword', 15, 5, 2, 24, -32)}${box('sword', 15, 5, 2, 24, 32)}${box('sword-hilt', 5, 21, 10, 2, -32)}${box('sword-hilt', 17, 21, 10, 2, 32)}<i class="r2-mb-crest-gem"></i><i class="r2-mb-crest-edge"></i></div>`;
  return `<div class="r2-mb-crest r2-mb-shield"><i class="r2-mb-lion-head"></i><i class="r2-mb-lion-body"></i><i class="r2-mb-lion-tail"></i>${[[9, 12, 8, 3, 25], [17, 14, 9, 3, -35], [9, 24, 10, 3, -35], [17, 24, 9, 3, 35]].map(p => box('lion-limb', ...p)).join('')}<i class="r2-mb-crest-edge"></i></div>`;
}

function card(theme, backdrop, figure, front = '') {
  return `<div class="r2-art r2-metal r2-metal-basic r2-mb-${theme}" aria-hidden="true"><div class="r2-mb-ground-glow"></div><div class="r2-mb-frame-shadow"></div><div class="r2-mb-panel"></div><div class="r2-mb-scene">${backdrop}${figure}${front}</div><div class="r2-mb-rating-well"></div><div class="r2-mb-footer"></div><div class="r2-mb-nameplate"></div><div class="r2-mb-frame"></div><div class="r2-mb-frame-inner"></div><i class="r2-mb-top-line r2-mb-top-line-left"></i><i class="r2-mb-top-line r2-mb-top-line-right"></i><div class="r2-mb-diadem"><i class="r2-mb-diadem-left"></i><b class="r2-mb-diadem-right"></b></div><div class="r2-mb-point"></div>${theme === 'valor' || theme === 'legacy' ? laurels(theme === 'legacy') : ''}${crest(theme)}<i class="r2-mb-footer-rule"></i><div class="r2-mb-bottom-jewel"></div></div>`;
}

export const basicArt = {
  valor: card('valor', valorBackdrop(), valorFigure()),
  nexus: card('nexus', nexusBackdrop(), nexusFigure()),
  aurum: card('aurum', aurumBackdrop(), aurumFigure(), '<div class="r2-mb-orbit r2-mb-orbit-front"></div><div class="r2-mb-sphere r2-mb-sphere-left"></div><div class="r2-mb-sphere r2-mb-sphere-right"></div>'),
  legacy: card('legacy', legacyBackdrop(), legacyFigure()),
};

export const basicStyles = String.raw`
.r2-metal.r2-metal-basic{position:absolute;inset:0;width:300px;height:380px;overflow:hidden;isolation:isolate;pointer-events:none;--metal:#e9bd62;--metal-light:#fff1ba;--metal-dark:#77501c;--ink:#080a08;--paper:#171409;--rim:rgba(255,216,128,.7);--fold:rgba(236,201,133,.64);--skin-light:#75603b;--skin-mid:#272419;--skin-dark:#080b09;--cloth-light:#4c4530;--cloth-mid:#171a13;--cloth-dark:#060b08;--footer:#0a100c;--aura:rgba(227,177,60,.2)}
.r2-metal.r2-mb-nexus{--metal:#c4c9ce;--metal-light:#fcfdfd;--metal-dark:#65686b;--ink:#07090b;--paper:#131719;--rim:rgba(238,246,250,.75);--fold:rgba(206,220,229,.64);--skin-light:#51575b;--skin-mid:#171b1d;--skin-dark:#030608;--cloth-light:#4c5155;--cloth-mid:#14181c;--cloth-dark:#04070a;--footer:#080c10;--aura:rgba(219,231,245,.12)}
.r2-metal.r2-mb-aurum{--metal:#bb9146;--metal-light:#ffecb1;--metal-dark:#785420;--ink:#3d382b;--paper:#eeeae0;--rim:rgba(255,244,209,.85);--fold:rgba(125,108,77,.45);--skin-light:#706b59;--skin-mid:#3d3e34;--skin-dark:#262c28;--cloth-light:#fffef7;--cloth-mid:#d8d5c8;--cloth-dark:#8e8e7b;--footer:#efede4;--aura:rgba(237,210,141,.14)}
.r2-metal.r2-mb-legacy{--metal:#cb955f;--metal-light:#ffdeae;--metal-dark:#714326;--ink:#140c07;--paper:#3e2b1b;--rim:rgba(255,211,151,.68);--fold:rgba(221,166,101,.7);--skin-light:#8b653e;--skin-mid:#322319;--skin-dark:#100e09;--cloth-light:#7b5631;--cloth-mid:#332417;--cloth-dark:#120e09;--footer:#20160e;--aura:rgba(205,133,67,.2)}
.r2-metal .r2-mb-panel,.r2-metal .r2-mb-frame,.r2-metal .r2-mb-frame-inner,.r2-metal .r2-mb-frame-shadow{position:absolute;box-sizing:border-box;left:19px;top:24px;width:262px;height:333px;border-radius:45% 45% 42% 42% / 8% 8% 8% 8%}
.r2-metal .r2-mb-panel{z-index:1;background:radial-gradient(ellipse at 64% 34%,#393021 0,transparent 64%),linear-gradient(125deg,#080b08,var(--paper) 48%,#0a0d09)}
.r2-metal .r2-mb-frame-shadow{z-index:0;box-shadow:0 0 9px 2px var(--aura),inset 0 0 18px var(--aura),0 8px 13px #0009}
.r2-metal .r2-mb-frame{z-index:8;border:2px solid var(--metal);box-shadow:inset 0 0 0 2px var(--ink),inset 0 0 0 3px var(--metal-dark),0 0 0 1px var(--metal-dark),0 0 5px var(--aura)}
.r2-metal .r2-mb-frame-inner{z-index:8;left:25px;top:29px;width:250px;height:321px;border:1px solid var(--metal-light);opacity:.65}
.r2-metal .r2-mb-ground-glow{position:absolute;z-index:0;left:12px;top:346px;width:276px;height:33px;border-radius:50%;background:radial-gradient(ellipse,var(--aura),transparent 70%)}
.r2-metal .r2-mb-top-line{position:absolute;z-index:8;top:24px;width:119px;height:13px;border-top:2px solid var(--metal-light);border-radius:40%;box-shadow:0 -1px 0 var(--metal-dark)}
.r2-metal .r2-mb-top-line-left{left:25px;transform:rotate(-14deg)}
.r2-metal .r2-mb-top-line-right{right:25px;transform:rotate(14deg)}
.r2-metal .r2-mb-diadem{position:absolute;z-index:9;left:132px;top:11px;width:36px;height:20px}
.r2-metal .r2-mb-diadem i,.r2-metal .r2-mb-diadem b{position:absolute;box-sizing:border-box;top:0;width:21px;height:18px;border-bottom:2px solid var(--metal-light);border-radius:0 0 70% 60%;background:linear-gradient(0deg,var(--paper),var(--ink));box-shadow:0 1px 0 var(--metal-dark)}
.r2-metal .r2-mb-diadem i{left:-2px;transform:rotate(18deg)}
.r2-metal .r2-mb-diadem b{right:-2px;transform:rotate(-18deg)}
.r2-metal .r2-mb-point{position:absolute;z-index:8;left:136px;top:339px;width:28px;height:28px;transform:rotate(45deg);border-right:2px solid var(--metal);border-bottom:2px solid var(--metal);border-radius:0 0 4px 0;background:linear-gradient(135deg,transparent 40%,var(--footer) 60%);box-shadow:2px 2px 0 -1px var(--metal-dark)}
.r2-metal .r2-mb-scene{position:absolute;z-index:2;inset:0;overflow:hidden;border-radius:38% 38% 12% 12% / 5% 5% 6% 6%}
.r2-metal .r2-mb-atmosphere{position:absolute;left:27px;top:32px;width:246px;height:236px;border-radius:40% 40% 0 0 / 8% 8% 0 0;background:radial-gradient(ellipse at 68% 35%,#e6b23f69,transparent 50%),radial-gradient(ellipse at 40% 78%,#97703540,transparent 50%)}
.r2-metal .r2-mb-rating-well{position:absolute;z-index:5;left:29px;top:45px;width:68px;height:86px;border-radius:4px;background:linear-gradient(90deg,var(--paper),transparent);opacity:.64}
.r2-metal .r2-mb-footer{position:absolute;z-index:6;left:27px;top:257px;width:246px;height:92px;border-radius:0 0 40% 40% / 0 0 16% 16%;background:linear-gradient(0deg,var(--footer) 57%,var(--footer) 85%,transparent)}
.r2-metal .r2-mb-nameplate{position:absolute;z-index:7;left:29px;top:235px;width:242px;height:32px;border-radius:42% 42% 14% 14% / 24% 24% 5% 5%;background:linear-gradient(90deg,transparent,var(--footer) 17%,var(--footer) 83%,transparent);border-top:1px solid var(--metal-dark);box-shadow:0 -7px 14px -8px var(--metal-light)}
.r2-metal .r2-mb-footer-rule{position:absolute;z-index:7;left:43px;top:309px;width:214px;height:1px;background:linear-gradient(90deg,transparent,var(--metal-dark),transparent);opacity:.5}
.r2-metal .r2-mb-bottom-jewel{position:absolute;z-index:9;left:148px;top:350px;width:4px;height:6px;transform:rotate(45deg);border:1px solid var(--metal-light);background:var(--metal-dark);border-radius:1px}
.r2-metal .r2-mb-figure{position:absolute;inset:0;z-index:4}
.r2-metal .r2-mb-figure i,.r2-metal .r2-mb-crown i,.r2-metal .r2-mb-crest i,.r2-metal .r2-mb-fracture,.r2-metal .r2-mb-gold-ribbon,.r2-metal .r2-mb-obsidian,.r2-metal .r2-mb-rubble{position:absolute;display:block;box-sizing:border-box}
.r2-metal .r2-mb-head{border-radius:46% 45% 43% 45% / 35% 40% 56% 52%;background:radial-gradient(ellipse at 27% 31%,var(--skin-light),var(--skin-mid) 38%,var(--skin-dark) 78%);box-shadow:inset 2px 0 2px -1px var(--rim),inset -1px 0 1px var(--skin-light),1px 0 3px #0008}
.r2-metal .r2-mb-neck{border-radius:26% 23% 34% 35%;background:linear-gradient(100deg,var(--skin-mid),var(--skin-dark) 60%,var(--skin-light));box-shadow:inset 1px 0 1px var(--rim)}
.r2-metal .r2-mb-ear{border-radius:48%;background:radial-gradient(ellipse at 60% 48%,var(--skin-dark) 28%,var(--skin-mid) 52%,var(--skin-light) 80%);border-left:1px solid var(--rim)}
.r2-metal .r2-mb-nose{border-radius:15% 60% 42% 50%;background:linear-gradient(110deg,var(--skin-dark),var(--skin-mid));box-shadow:1px 0 1px var(--skin-light)}
.r2-metal .r2-mb-jaw{border-radius:45% 28% 66% 30%;background:linear-gradient(110deg,var(--skin-dark),var(--skin-mid));box-shadow:1px 1px 1px -1px var(--rim)}
.r2-metal .r2-mb-brow{border-radius:50%;background:var(--skin-dark);box-shadow:0 -1px 0 #ffffff10}
.r2-metal .r2-mb-hair{position:absolute;width:52px;height:34px;border-radius:48% 46% 36% 30%;background:radial-gradient(ellipse at 40% 10%,var(--skin-mid),var(--skin-dark) 65%);box-shadow:inset 1px 1px 1px var(--rim)}
.r2-metal .r2-mb-curl{border-radius:44%;background:var(--skin-dark);box-shadow:inset 0 1px 1px -1px var(--metal-light)}
.r2-metal .r2-mb-torso{border-radius:37% 41% 21% 22% / 22% 24% 8% 7%;background:linear-gradient(148deg,transparent 40%,#ffffff0b 43%,transparent 47%),linear-gradient(29deg,transparent 57%,#ffffff09 59%,transparent 63%),radial-gradient(ellipse at 35% 10%,var(--cloth-light),transparent 43%),linear-gradient(100deg,var(--cloth-mid),var(--cloth-dark) 51%,var(--cloth-mid) 90%);box-shadow:inset 2px 0 2px -1px var(--rim),inset -2px 0 3px var(--cloth-light),2px 3px 8px #0009}
.r2-metal .r2-mb-shoulder{border-radius:48% 50% 32% 28% / 46% 48% 32% 30%;background:linear-gradient(170deg,var(--cloth-light),var(--cloth-mid) 36%,var(--cloth-dark) 85%);box-shadow:inset 1px 2px 1px -1px var(--rim)}
.r2-metal .r2-mb-sleeve{border-radius:42% 46% 19% 18% / 33% 42% 16% 13%;background:linear-gradient(110deg,var(--cloth-light),var(--cloth-mid) 32%,var(--cloth-dark) 70%,var(--cloth-mid));box-shadow:inset 1px 1px 1px var(--rim),inset 0 -3px 0 #0007,0 2px 2px #0004}
.r2-metal .r2-mb-arm{border-radius:44% 40% 42% 45% / 23% 24% 25% 24%;background:linear-gradient(95deg,var(--skin-light),var(--skin-mid) 34%,var(--skin-dark) 72%,var(--skin-mid));box-shadow:inset 1px 0 1px var(--rim)}
.r2-metal .r2-mb-forearm{border-radius:38% 35% 38% 37% / 44% 52% 48% 47%;background:linear-gradient(170deg,var(--skin-light),var(--skin-mid) 36%,var(--skin-dark) 82%);box-shadow:inset 1px 1px 1px -1px var(--rim)}
.r2-metal .r2-mb-hand{border-radius:36% 42% 42% 43%;background:linear-gradient(170deg,var(--skin-light),var(--skin-mid) 53%,var(--skin-dark));box-shadow:inset 1px 1px 1px -1px var(--rim)}
.r2-metal .r2-mb-finger{border-top:1px solid var(--skin-light);border-radius:50%;opacity:.7}
.r2-metal .r2-mb-collar{border-radius:50%;border-top:2px solid var(--cloth-light);border-bottom:1px solid var(--skin-dark);background:linear-gradient(0deg,transparent 45%,var(--cloth-dark) 50%);box-shadow:0 -1px 0 var(--rim)}
.r2-metal .r2-mb-fold{border-top:1px solid var(--fold);border-left:1px solid transparent;border-radius:43% 60% 25% 30%;background:linear-gradient(180deg,#ffffff07,transparent 45%);box-shadow:0 -1px 1px #0003}
.r2-metal .r2-mb-sun-disc{position:absolute;left:108px;top:45px;width:152px;height:163px;border:1px solid #ffe8a680;border-radius:50%;background:radial-gradient(ellipse at 65% 35%,#eac36d33,transparent 65%);box-shadow:inset 0 0 0 7px #d4ab4c0b,inset 0 0 0 8px #f4dc801a,0 0 22px #f7bc3012;transform:rotate(25deg)}
.r2-metal .r2-mb-gold-ribbon{border-radius:4% 32% 8% 22%;background:linear-gradient(155deg,#fff1a9 0,#d4a344 12%,#745721 38%,#f8da86 47%,#98772a 55%,#302b16 83%);box-shadow:0 -1px 0 #ffecaa8c,0 2px 3px #080b0855;opacity:.85}
.r2-metal .r2-mb-fracture{transform-origin:left center;background:linear-gradient(90deg,transparent,var(--metal-light) 13%,var(--metal) 76%,transparent);box-shadow:0 1px 0 #0006}
.r2-metal .r2-mb-star{position:absolute;width:3px;height:19px;border-radius:50%;background:linear-gradient(0deg,transparent,var(--metal-light),transparent)}
.r2-metal .r2-mb-star::after{content:"";position:absolute;left:-7px;top:8px;width:17px;height:3px;border-radius:50%;background:linear-gradient(90deg,transparent,var(--metal-light),transparent)}
.r2-metal .r2-mb-star-top{left:150px;top:31px}
.r2-metal .r2-mb-ball{position:absolute;left:181px;top:177px;width:61px;height:61px;overflow:hidden;border:1px solid #eaca7c;border-radius:50%;background:radial-gradient(circle at 32% 24%,#fffbe0 0,#f7d883 19%,#c09335 44%,#8c6322 67%,#332d15 94%);box-shadow:inset -6px -9px 8px #110f08a8,inset 2px 2px 3px #fff6b4,0 3px 7px #0009}
.r2-metal .r2-mb-ball-panel{border-radius:25%;border:1px solid #ffe4a8;background:linear-gradient(135deg,#574719,#141b10 68%,#80682d);box-shadow:1px 1px 1px #211c13}
.r2-metal .r2-mb-ball-latitude{left:1px;top:13px;width:59px;height:35px;border:1px solid #ffefaf80;border-radius:50%;transform:rotate(-17deg)}
.r2-metal .r2-mb-ball-longitude{left:17px;top:-2px;width:28px;height:64px;border-left:1px solid #ffe6ab9c;border-right:1px solid #fff3b970;border-radius:50%;transform:rotate(24deg)}
.r2-metal .r2-mb-crown{position:absolute;z-index:3;width:42px;height:25px;color:var(--metal-light)}
.r2-metal .r2-mb-crown-tine{transform-origin:bottom;background:linear-gradient(90deg,var(--metal),var(--metal-light));border-radius:50% 50% 12% 12%;box-shadow:0 1px 1px var(--metal-dark)}
.r2-metal .r2-mb-crown-tine::before{content:"";position:absolute;left:-1px;top:-1px;width:5px;height:5px;border-radius:50%;background:var(--metal-light)}
.r2-metal .r2-mb-crown-band{position:absolute;left:1px;top:19px;width:38px;height:5px;border-top:1px solid var(--metal-light);border-bottom:1px solid var(--metal-light);border-radius:50%;background:linear-gradient(90deg,var(--metal-dark),var(--metal),var(--metal-light),var(--metal-dark));box-shadow:0 2px 1px #0008}
.r2-metal .r2-mb-crown-small{transform:rotate(9deg) scale(.88)}
.r2-metal .r2-mb-laurels{position:absolute;inset:0;z-index:9}
.r2-metal .r2-mb-leaf{position:absolute;box-sizing:border-box;border-radius:90% 4% 90% 4%;border-left:1px solid var(--metal-light);background:linear-gradient(116deg,var(--metal-dark) 4%,var(--metal) 35%,var(--metal-light) 48%,var(--metal) 54%,var(--metal-dark) 90%);box-shadow:0 1px 1px #000b;opacity:var(--leaf-tone)}
.r2-metal .r2-mb-leaf::after{content:"";position:absolute;left:3px;top:3px;width:1px;height:15px;transform:rotate(15deg);background:linear-gradient(0deg,var(--metal-dark),var(--metal-light));opacity:.8}
.r2-metal .r2-mb-leaf-inner::after{left:2px;height:10px;transform:rotate(9deg)}
.r2-metal .r2-mb-branch{position:absolute;left:19px;top:116px;width:21px;height:166px;border-left:2px solid var(--metal);border-radius:53%;transform:rotate(-5deg);box-shadow:-1px 0 0 #0004}
.r2-metal .r2-mb-branch-right{left:auto;right:19px;transform:rotate(5deg);border-left:0;border-right:2px solid var(--metal)}
.r2-metal.r2-mb-nexus .r2-mb-panel{background:radial-gradient(ellipse at 70% 31%,#737e8066,transparent 56%),linear-gradient(130deg,#0a0d10,#20262a 60%,#080b0f)}
.r2-metal.r2-mb-nexus .r2-mb-atmosphere{background:radial-gradient(ellipse at 66% 35%,#e4edf84f,transparent 52%),linear-gradient(150deg,transparent 30%,#72808b1f 49%,transparent 70%)}
.r2-metal .r2-mb-obsidian{border:1px solid #8d989b48;border-radius:7% 12% 5% 9%;background:linear-gradient(116deg,#010407 7%,#2f373e 42%,#acb4b840 43%,#0b1015 45%,#11181e 80%);box-shadow:inset 1px 1px 0 #c3d0da33,3px 6px 9px #0005}
.r2-metal.r2-mb-nexus .r2-mb-fracture{background:linear-gradient(90deg,transparent,#bfcbd4 22%,#eff8ff 55%,#9eacb6 82%,transparent);box-shadow:0 1px 0 #010407}
.r2-metal .r2-mb-cape{border-radius:65% 13% 16% 9% / 43% 11% 8% 15%;background:linear-gradient(147deg,#465057 1%,#090e13 17%,#242d33 29%,#03070b 43%,#273238 58%,#060a0e 66%,#151c22 82%,#080d11);box-shadow:inset 0 2px 1px -1px #e9f0f4,0 4px 6px #0008}
.r2-metal .r2-mb-cape-shoulder{background:linear-gradient(160deg,#a5adb0 0,#29343c 9%,#050b0f 23%,#303b42 41%,#070d11 51%,#182128 73%,#04090d);border-top:1px solid #d1dadd}
.r2-metal .r2-mb-cape-ridge{border-radius:65% 28% 10% 70%;border-top:1px solid #b1bec6b3;background:linear-gradient(180deg,#73818b55,#0000 48%);box-shadow:0 -2px 2px #01040780}
.r2-metal.r2-mb-nexus .r2-mb-hair{height:29px;background:linear-gradient(140deg,#353e42,#05090b 63%)}
.r2-metal.r2-mb-nexus .r2-mb-curl{opacity:.65}
.r2-metal.r2-mb-aurum .r2-mb-panel{background:radial-gradient(ellipse at 57% 30%,#fffdf5,transparent 59%),linear-gradient(128deg,#cecbbc 1%,#f8f5ec 27%,#d7d5cb 63%,#f9f6ed 86%,#d4cbb5)}
.r2-metal.r2-mb-aurum .r2-mb-atmosphere{background:radial-gradient(ellipse at 54% 50%,#b9b4a15e,transparent 62%),linear-gradient(145deg,transparent 35%,#ffffff8a 37%,transparent 46%,#a9a79526 65%,transparent 70%)}
.r2-metal.r2-mb-aurum .r2-mb-rating-well{background:linear-gradient(90deg,#eeeae0,transparent);opacity:.76}
.r2-metal.r2-mb-aurum .r2-mb-fracture{background:linear-gradient(90deg,transparent,#9b75483d 14%,#be9c5788 48%,#95764455 85%,transparent);box-shadow:0 1px 0 #ffffff90}
.r2-metal.r2-mb-aurum .r2-mb-head{background:radial-gradient(ellipse at 35% 34%,#79746344,transparent 45%),linear-gradient(115deg,#565749,#2e342d 55%,#55574a);box-shadow:inset 1px 0 0 #a9a18b,inset -2px 1px 1px #e3ddc17d,1px 2px 3px #4c4b3b55}
.r2-metal.r2-mb-aurum .r2-mb-hair{height:30px;background:linear-gradient(130deg,#686650,#3b4036 70%);box-shadow:inset 1px 1px 0 #a49b7b}
.r2-metal.r2-mb-aurum .r2-mb-curl{background:linear-gradient(130deg,#62624e,#3c4137);box-shadow:none}
.r2-metal.r2-mb-aurum .r2-mb-torso{background:radial-gradient(ellipse at 35% 35%,#fffdf2 9%,transparent 59%),linear-gradient(110deg,#c5c2b2,#f7f5e9 36%,#cecebe 63%,#f4f1e5 81%,#9e9f8e);box-shadow:inset 2px 0 2px #fff8df,inset -2px 0 2px #aaa18a,2px 5px 7px #55513f33}
.r2-metal.r2-mb-aurum .r2-mb-shoulder{background:linear-gradient(165deg,#fffdf2,#e8e5d8 40%,#d3d1c3 75%,#eeeeDF);box-shadow:inset 0 2px 1px #fffdf0}
.r2-metal.r2-mb-aurum .r2-mb-arm{background:linear-gradient(100deg,#e3e0ce,#f8f4e6 32%,#c8c7b7 67%,#999b89);box-shadow:inset 1px 0 1px #fff8da}
.r2-metal.r2-mb-aurum .r2-mb-sleeve{background:linear-gradient(100deg,#f8f5e9,#fffdf3 22%,#ceccbd 62%,#eeeade 85%,#b2b09e);box-shadow:inset 1px 1px 1px #fffae3,inset 0 -2px 1px #a7a28d,0 2px 2px #6f705f26}
.r2-metal.r2-mb-aurum .r2-mb-collar{border-top:3px solid #f0eadd;border-bottom:2px solid #aaa18a;background:linear-gradient(180deg,#77775e,transparent 70%);box-shadow:0 -1px 0 #fff9df}
.r2-metal.r2-mb-aurum .r2-mb-fold{box-shadow:0 -1px 1px #ffffff70;background:linear-gradient(180deg,#6e6c5512,transparent 50%)}
.r2-metal .r2-mb-shirt-placket{border-radius:2px;background:linear-gradient(90deg,#a19b80,#eee8d6);box-shadow:1px 0 0 #fff9e8}
.r2-metal .r2-mb-orbit{position:absolute;box-sizing:border-box;border:3px solid #bb9140;border-radius:50%;background:transparent;box-shadow:inset 0 1px 0 #fffbe5,0 1px 1px #78552680,0 -1px 0 #fff5bf}
.r2-metal .r2-mb-orbit::after{content:"";position:absolute;inset:0;border:1px solid #e8c874;border-radius:50%}
.r2-metal .r2-mb-orbit-back{z-index:3;left:31px;top:124px;width:249px;height:70px;transform:rotate(-34deg)}
.r2-metal .r2-mb-orbit-high{z-index:3;left:84px;top:88px;width:203px;height:57px;transform:rotate(-36deg);border-width:2px}
.r2-metal .r2-mb-orbit-front{z-index:5;left:52px;top:187px;width:229px;height:55px;transform:rotate(-23deg);border-top-color:transparent;border-left-color:#c69a4b;box-shadow:0 1px 1px #8b6a3b66}
.r2-metal .r2-mb-orbit-front::after{border-top-color:transparent}
.r2-metal .r2-mb-sphere{position:absolute;z-index:6;border-radius:50%;border:1px solid #b18b4980;background:linear-gradient(123deg,transparent 35%,#aa874a80 36%,#ecd9a5 37%,transparent 39%),linear-gradient(69deg,transparent 67%,#b99b5770 68%,transparent 70%),radial-gradient(circle at 32% 25%,#fffef5 4%,#eeeadc 37%,#cfc9b4 70%,#ab9b74 92%);box-shadow:inset 2px 2px 3px #fffdf5,inset -2px -3px 5px #a695724f,2px 5px 9px #7c693c33}
.r2-metal .r2-mb-sphere-left{left:12px;top:143px;width:43px;height:43px}
.r2-metal .r2-mb-sphere-right{left:250px;top:176px;width:35px;height:35px}
.r2-metal .r2-mb-sphere-small{z-index:3;left:243px;top:121px;width:22px;height:22px}
.r2-metal.r2-mb-aurum .r2-mb-nameplate{border-top-color:#c3b28b;background:linear-gradient(90deg,transparent,#f2efe6 14%,#f2efe6 86%,transparent);box-shadow:0 -5px 9px -6px #fff9e6}
.r2-metal.r2-mb-legacy .r2-mb-panel{background:radial-gradient(ellipse at 64% 33%,#bb8d5499,transparent 62%),linear-gradient(120deg,#322219,#775233 53%,#2c1e12)}
.r2-metal.r2-mb-legacy .r2-mb-atmosphere{background:radial-gradient(ellipse at 59% 34%,#ffe0ac5e,transparent 56%),linear-gradient(160deg,#2d1a1314,#9f6b3930 45%,#24170f70 89%)}
.r2-metal .r2-mb-antique-disc{position:absolute;left:124px;top:49px;width:131px;height:167px;border:1px solid #ddb27d30;border-radius:50%;background:radial-gradient(ellipse at 52% 39%,#f5cd8d35,transparent 64%);transform:rotate(14deg)}
.r2-metal .r2-mb-colosseum{position:absolute;left:135px;top:65px;width:141px;height:157px;transform:rotate(-9deg) skewY(-7deg) scale(.94);opacity:.85}
.r2-metal .r2-mb-colosseum-wall{position:absolute;inset:0;border-radius:24% 13% 11% 20% / 8% 5% 5% 8%;background:linear-gradient(95deg,#4c3520,#bc905c 45%,#d1a977 76%,#765133);border:1px solid #ddb787;box-shadow:inset 5px 0 8px #36231380,2px 4px 4px #25180d55}
.r2-metal .r2-mb-arcade{position:absolute;left:0;width:140px;height:32px}
.r2-metal .r2-mb-arch{position:absolute;box-sizing:border-box;border-radius:48% 48% 2px 2px / 30% 30% 2px 2px;background:linear-gradient(95deg,#382719,#63482d);border:2px solid #c69a67;box-shadow:1px 1px 0 #ead0a85e,inset 1px 1px 3px #170f08bd}
.r2-metal .r2-mb-cornice{position:absolute;left:-2px;width:144px;height:7px;border-radius:20%;background:linear-gradient(#e5b681,#8a613b 27%,#b98955 61%,#5f4127 76%,#9d764b);box-shadow:0 2px 2px #36241180}
.r2-metal .r2-mb-cornice-base{top:132px;height:11px}
.r2-metal .r2-mb-colosseum-rim{position:absolute;left:-2px;top:-5px;width:144px;height:18px;border-radius:50%;border-top:4px solid #d7ad7d;background:linear-gradient(#7f5c3b,#b3895b);box-shadow:0 2px 0 #5a3b21,inset 0 3px 2px #432b1c}
.r2-metal .r2-mb-rubble{border-radius:16% 38% 24% 8%;background:linear-gradient(170deg,#d4a66a,#836039 23%,#38271a 67%,#a47948);border-top:1px solid #d7aa7280;box-shadow:1px 3px 3px #130e0866}
.r2-metal.r2-mb-legacy .r2-mb-shoulder{background:linear-gradient(170deg,#987445,#49321d 36%,#21190f 85%)}
.r2-metal.r2-mb-legacy .r2-mb-torso{background:radial-gradient(ellipse at 45% 24%,#8460384d,transparent 55%),linear-gradient(115deg,#604427,#211b11 49%,#543a22 85%);box-shadow:inset 2px 0 2px -1px #edc994,inset -2px 0 2px #89633d,2px 3px 7px #140c0866}
.r2-metal .r2-mb-crest{position:absolute;z-index:9;left:185px;top:278px;width:33px;height:36px;box-sizing:border-box;color:var(--metal)}
.r2-metal .r2-mb-shield{border:1px solid var(--metal-light);border-radius:4% 4% 48% 48% / 3% 3% 34% 34%;background:linear-gradient(125deg,#ffffff0b,#00000030);box-shadow:0 1px 2px #0008}
.r2-metal .r2-mb-crest-edge{inset:3px;border:1px solid var(--metal);border-radius:4% 4% 48% 48% / 3% 3% 34% 34%;opacity:.7}
.r2-metal .r2-mb-lion-head{left:14px;top:6px;width:10px;height:10px;border-radius:45%;background:radial-gradient(circle at 70% 35%,var(--metal-dark) 12%,var(--metal-light) 14%,var(--metal) 45%);box-shadow:-2px 0 0 var(--metal-dark)}
.r2-metal .r2-mb-lion-body{left:13px;top:14px;width:8px;height:13px;transform:rotate(-16deg);border-radius:44%;background:linear-gradient(90deg,var(--metal-dark),var(--metal-light))}
.r2-metal .r2-mb-lion-tail{left:5px;top:10px;width:8px;height:13px;border-left:2px solid var(--metal);border-top:2px solid var(--metal);border-radius:60%;transform:rotate(-20deg)}
.r2-metal .r2-mb-lion-limb{background:var(--metal);border-radius:30%}
.r2-metal .r2-mb-sword{background:linear-gradient(90deg,var(--metal-dark),var(--metal-light));border-radius:50% 50% 0 0}
.r2-metal .r2-mb-sword-hilt{border-radius:50%;background:var(--metal-light)}
.r2-metal .r2-mb-crest-gem{left:12px;top:9px;width:7px;height:10px;border:1px solid var(--metal-light);border-radius:50%;background:var(--metal-dark)}
.r2-metal .r2-mb-temple{color:#4c4739}
.r2-metal .r2-mb-temple-roof{position:absolute;left:1px;top:3px;width:31px;height:5px;border-top:3px solid #4c4739;border-bottom:1px solid #4c4739;border-radius:50% 50% 0 0 / 95% 95% 0 0}
.r2-metal .r2-mb-column{background:linear-gradient(90deg,#514b3c,#b3aa8d,#4c4739);border-radius:1px}
.r2-metal .r2-mb-column::before{content:"";position:absolute;left:-1px;top:0;width:5px;height:2px;background:#4c4739}
.r2-metal .r2-mb-temple-step{position:absolute;left:3px;top:30px;width:28px;height:2px;background:#4c4739}
.r2-metal .r2-mb-temple-step-bottom{left:0;top:34px;width:33px;height:2px;background:#4c4739}
.r2-metal .r2-mb-helmet-plume{left:0;top:1px;width:31px;height:25px;border-top:7px solid var(--metal-light);border-left:4px solid var(--metal);border-radius:60% 48% 0 0;transform:rotate(-12deg)}
.r2-metal .r2-mb-helmet-dome{left:6px;top:8px;width:24px;height:20px;border-radius:55% 50% 12% 20%;background:linear-gradient(120deg,var(--metal-light),var(--metal) 45%,var(--metal-dark));box-shadow:inset 1px 1px 0 var(--metal-light)}
.r2-metal .r2-mb-helmet-cheek{left:9px;top:20px;width:8px;height:15px;transform:rotate(-14deg);border-radius:20% 40%;background:var(--metal)}
.r2-metal .r2-mb-helmet-eye{left:20px;top:19px;width:12px;height:4px;transform:rotate(-7deg);border-radius:50%;background:var(--footer)}
.r2-metal .r2-mb-helmet-nose{left:27px;top:21px;width:3px;height:10px;transform:rotate(-9deg);border-radius:20%;background:var(--metal-light)}
.r2-metal .r2-mb-helmet-neck{left:5px;top:29px;width:17px;height:5px;transform:rotate(12deg);border-radius:30%;background:var(--metal-dark)}
`;
