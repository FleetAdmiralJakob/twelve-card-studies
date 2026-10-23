import {readFile,writeFile} from 'node:fs/promises';
const css=(await readFile('css-art/flags.css','utf8')).replace(/clip-path\s*:[^;]+;/g,'');
const overrides=`
/* National flags drawn with rounded boxes, bands and circles only. */
.cf-diamond {left:61.6px;top:16.6px;width:176.8px;height:176.8px;transform:scaleY(.696) rotate(45deg);transform-origin:center;}
.cf-star {background:none;}
.cf-star b {left:40%;top:0;width:20%;height:60%;border-radius:80% 80% 15% 15%;background:#fff;transform-origin:50% 83.33%;}
.cf-ray {width:2px;left:17px;border-radius:100% 100% 20% 20%;}
.cf-ray-wave {border-radius:90% 10% 60% 20%;}
.cf-castle {background:linear-gradient(#ffce00,#ffce00) 0 50% / 100% 50% no-repeat,repeating-linear-gradient(90deg,#ffce00 0 25%,transparent 25% 37.5%) 0 0 / 100% 50% no-repeat;}
.cf-castle::after {content:'';position:absolute;left:40%;bottom:0;width:20%;height:30%;border-radius:50% 50% 0 0;background:#a81b23;}
.cf-lion {width:5px;height:13px;left:8px;top:4px;border-radius:50% 30% 20% 40%;transform:rotate(-15deg);box-shadow:-3px 9px #c33b7a;}
.cf-lion::before {content:'';position:absolute;left:-5px;top:4px;width:7px;height:4px;background:#c33b7a;border-radius:50%;transform:rotate(-35deg);}
.cf-lion::after {content:'';position:absolute;left:3px;top:-2px;width:7px;height:12px;border:2px solid #c33b7a;border-left-color:transparent;border-bottom-color:transparent;border-radius:60%;transform:rotate(25deg);}
.cf-crown {height:9px;top:14px;border-radius:0 0 35% 35%;background:linear-gradient(#e4ad33,#b42332 55%,#edbc35 70%);}
.cf-crown::before {content:'';position:absolute;left:4px;top:-8px;width:30px;height:12px;border:2px solid #edbc35;border-radius:50% 50% 0 0;background:radial-gradient(ellipse,#b21e2d 42%,transparent 48%);}
.cf-crown-arches {top:-8px;left:17px;width:4px;height:10px;border:1px solid #d4a22f;background:#edbc35;border-radius:50%;}
.cf-pillar-cap {height:5px;border-radius:30% 30% 10% 10%;box-shadow:0 -2px 0 -1px #aa151b;}
`;
await writeFile('basic-art/flags.css',css+overrides);
let js=await readFile('css-art/flags.mjs','utf8');
js=js.replace('width:${s}px;height:${s}px`)', 'width:${s}px;height:${s}px`,Array.from({length:5},(_,i)=>`<b style="transform:rotate(${i*72}deg)"></b>`).join(\'\'))');
await writeFile('basic-art/flags.mjs',js);
