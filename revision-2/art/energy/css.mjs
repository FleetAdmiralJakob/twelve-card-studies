// Native HTML/CSS illustration. Authored path() curves + polygon stroke contours.
// No SVG DOM/resources, raster assets, canvas, masks, filters or animation.
import {illustration,palette} from './illustration.mjs';
const n = value => Math.round(value * 100) / 100;
const rect = (x,y,w,h,bg,extra='',cls='e-piece') => `<i class="${cls}" style="left:${n(x)}px;top:${n(y)}px;width:${n(w)}px;height:${n(h)}px;background:${bg};${extra}"></i>`;
const poly = (points,bg,extra='',cls='e-piece') => {
  const xx=points.map(p=>p[0]), yy=points.map(p=>p[1]);
  const x=Math.min(...xx), y=Math.min(...yy), w=Math.max(...xx)-x || 1, h=Math.max(...yy)-y || 1;
  return rect(x,y,w,h,bg,`clip-path:polygon(${points.map(p=>`${n((p[0]-x)/w*100)}% ${n((p[1]-y)/h*100)}%`).join(',')});${extra}`,cls);
};
const line = (x1,y1,x2,y2,color,w=1,extra='') => rect(x1,y1,Math.hypot(x2-x1,y2-y1),w,color,`transform-origin:0 50%;transform:rotate(${n(Math.atan2(y2-y1,x2-x1)*180/Math.PI)}deg);${extra}`);
const v = {
  frost: {hi:'#daf7ff',rim:'#8bdbff',mid:'#308bc4',ink:'#061827',light:'#78caff',deep:'#03101d'},
  blaze: {hi:'#ffe4a3',rim:'#ff5731',mid:'#b91d15',ink:'#280804',light:'#ef552f',deep:'#180403'},
  volt: {hi:'#b2f8ff',rim:'#c569ff',mid:'#6049b8',ink:'#100b28',light:'#20c9ff',deep:'#070718'},
  silvah: {hi:'#e6ff96',rim:'#a0d941',mid:'#388b3b',ink:'#061d12',light:'#a0cc41',deep:'#031209'},
};
function rawCrest(theme) {
  const c=v[theme];
  const outline=[[185,277],[194,281],[202,277],[217,280],[216,300],[207,311],[201,315],[193,309],[186,301]];
  let out=poly(outline,c.rim)+poly(outline.map(([x,y])=>[201+(x-201)*.86,296+(y-296)*.86]),c.deep);
  if(theme==='frost') {
    out+=poly([[190,302],[195,289],[200,296],[206,285],[213,303],[203,300],[198,304]],'#c4eaff');
    out+=poly([[193,302],[196,294],[199,298],[206,288],[209,298],[205,295],[201,303]],'#1f659b');
    out+=line(191,306,210,306,c.rim,.7);
  } else if(theme==='blaze') {
    out+=poly([[201,306],[193,300],[193,294],[198,297],[196,284],[204,292],[208,287],[210,299],[205,306]],'#ff5d31');
    out+=poly([[201,305],[198,299],[202,293],[203,300],[206,298],[204,304]],'#ffdc83');
  } else if(theme==='volt') {
    out+=poly([[201,283],[205,292],[212,295],[205,300],[201,308],[197,301],[191,296],[198,292]],'#e7a3ff');
    out+=poly([[201,288],[203,294],[208,296],[202,298],[201,304],[199,298],[195,296],[199,294]],'#6c2c98');
    out+=line(201,290,201,302,'#f8dcff',.6);
  } else {
    out+=line(201,286,201,306,'#d7f18b',1.6);
    for(const [x,y,x2,y2] of [[201,294,193,288],[201,291,207,285],[201,299,192,294],[201,296,209,290],[201,302,211,296],[201,298,195,283]]) out+=line(x,y,x2,y2,'#c8e783',1);
    out+=poly([[198,305],[205,305],[208,307],[194,307]],'#bdde76');
  }
  return out;
}


function card(theme){
 const {markup}=illustration(theme,'css');
 return `<div class="r2-art r2-energy r2-energy-css ${theme}">${markup}<div class="en-crest-placement">${rawCrest(theme)}</div></div>`;
}
export const cssArt=Object.freeze(Object.fromEntries(Object.keys(palette).map(t=>[t,card(t)])));
export const cssStyles=`
.r2-energy.r2-energy-css{position:relative;width:300px;height:380px;overflow:hidden;isolation:isolate;pointer-events:none}
.r2-energy.r2-energy-css .en-shape,.r2-energy.r2-energy-css .e-piece{position:absolute;display:block;box-sizing:border-box;margin:0;padding:0}
.r2-energy.r2-energy-css .en-crest-placement{position:absolute;left:0;top:0;width:300px;height:380px;transform:translate(40.3px,46.6px) scale(.8);transform-origin:0 0}
`;
