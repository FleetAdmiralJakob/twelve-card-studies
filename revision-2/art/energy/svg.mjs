// Authored vectors only. Curved silhouettes share their source geometry with CSS shapes.
import {illustration,palette} from './illustration.mjs';
const fmt = n => Number(n.toFixed(2));
const path = (d, fill = 'none', attrs = '') => `<path d="${d}" fill="${fill}"${attrs ? ` ${attrs}` : ''}/>`;
const stroke = (d, color, width = 1, opacity = 1, attrs = '') => path(d, 'none', `stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" ${attrs}`);
const lines = (ds, color, width = 1, opacity = 1) => stroke(ds.join(''), color, width, opacity);
const polygon = (pts, fill, attrs = '') => `<polygon points="${pts.map(p=>p.map(fmt).join(',')).join(' ')}" fill="${fill}" ${attrs}/>`;

function rawCrest(theme,id,c) {
  const badge='M185 281Q194 282 201.5 278Q209 282 218 281L216.5 299Q213.5 307 201.5 314Q189.5 307 186.5 299Z';
  let motif='';
  if(theme==='frost') motif=path('M190 302L197 288 201 296 206 285 213 303Z',c.shadow)+lines(['M190 302l7-14 4 8 5-11 7 18','M195 298l2-5 3 8 3-5 3 4 2-6 3 8','M192 306l8-2 8 2','M201.5 284v3M200 285.5h3'],c.hot,.8,.95);
  if(theme==='blaze') motif=path('M202 307C190 303 192 296 197 290C195 298 202 294 201 285C209 293 206 294 210 291C216 300 208 306 202 307Z',c.accent,`stroke="${c.hot}" stroke-width=".65"`)+path('M202 304C198 300 201 298 203 294C204 300 208 300 202 304Z',c.other);
  if(theme==='volt') motif=polygon([[201.5,284],[211,293],[207,304],[201.5,309],[195,304],[192,293]],c.shadow,`stroke="${c.light}" stroke-width=".7"`)+path('M204 285L196 298 202 297 199 308 208 293 201 295Z',c.hot)+lines(['M193 289l-3 5 4 8','M210 289l3 5-4 8'],c.accent,.8);
  if(theme==='silvah') motif=lines(['M201.5 307V286','M201.5 295l-7-6M201.5 299l-9-3M201.5 303l-7-3','M201.5 295l7-6M201.5 299l9-3M201.5 303l7-3','M196 290l-.5-4M207 290l.5-4','M193 296l-1-4M210 296l1-4','M201.5 307l-4 2M201.5 307l4 2'],c.hot,.9)+[[-5,-6],[5,-6],[-8,0],[8,0]].map(([x,y])=>path(`M${201.5+x} ${294+y}q-4-5 0-6q4 2 0 6`,c.light)).join('');
  return path(badge,c.ink,`stroke="url(#${id}-metal)" stroke-width="1.2"`)+
    path('M189 285Q197 285 201.5 282Q206 285 214 285L212.5 298Q210 304 201.5 310Q193 304 190.5 298Z','none',`stroke="${c.light}" stroke-width=".45" opacity=".7"`)+motif;
}


function card(theme){
 const {markup,defs,prefix}=illustration(theme,'svg'),c=palette[theme];
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380"><defs>${defs}</defs>${markup}<g transform="translate(40.3 46.6) scale(.8)">${rawCrest(theme,prefix,{...c,light:c.rim,shadow:c.shade,other:c.hot})}</g></svg>`;
}
export const svgArt=Object.freeze(Object.fromEntries(Object.keys(palette).map(t=>[t,card(t)])));
