// Authored anatomy, shared as native SVG contours and native CSS curved shapes.
// These are designed silhouette/cloth contours, not image samples or stencils.
// CSS shapes use a tight local bounding box; no full-card masked gradients.
const num = x => +x.toFixed(2);
const escape = s => s.replaceAll('"', '&quot;');
const grads = {
  rivera: { skin: [105,'#13243b','#030615 33%','#07091b 78%','#66317c'], cloth:[105,'#23334d','#080b20 25%','#070818 65%','#17102c 89%','#18789e'], fold:[100,'#956bc480','#1e194930 54%','#080b2000'], rim:[100,'#78f8ff','#bd6cf5 50%','#ff51db'] },
  majestic:{skin:[105,'#30203e','#080810 25%','#080711 75%','#764c8d'],cloth:[110,'#3a2550','#100b1c 22%','#090812 68%','#31113f'],fold:[100,'#c39bdf80','#6b378536 52%','#180c2000'],rim:[100,'#f0cbff','#945ed2 42%','#efc7ff']},
  drift:{skin:[110,'#111414','#020506 55%','#050709'],cloth:[105,'#656866','#161b1d 17%','#080c10 58%','#23272b 86%','#858581'],fold:[100,'#d3d6ce88','#69727055 26%','#11171a00'],rim:[100,'#b7c5c8','#f5f1e2 35%','#8d9694 73%','#e3e0cd']},
  prism:{skin:[100,'#354e67','#0a0e1c 30%','#080a17 78%','#706087'],cloth:[110,'#123547','#071222 26%','#090d21 67%','#231530'],fold:[110,'#7fc7dd','#193d57 32%','#0b1028'],rim:[110,'#c3f5ff','#80adf1 50%','#f4b6f3']}
};
function tokenize(d) {
  const a=d.match(/[MLCQZ]|-?\d*\.?\d+/g), out=[];let i=0;
  while(i<a.length){const op=a[i++],len={M:2,L:2,C:6,Q:4,Z:0}[op];if(len===undefined)throw Error('Unsupported contour '+op);out.push([op,...a.slice(i,i+len).map(Number)]);i+=len;}return out;
}
function points(cmds) {
  let p=[0,0],start=p,rs=[],row=[];
  for(const [op,...v] of cmds){if(op==='M'){if(row.length)rs.push(row);p=v;start=p;row=[p];}else if(op==='L'){p=v;row.push(p);}else if(op==='Z'){row.push(start);p=start;}else{
    const from=p,end=v.slice(-2);const steps=op==='C'?14:10;
    for(let i=1;i<=steps;i++){const t=i/steps,u=1-t;row.push(op==='Q'?[u*u*from[0]+2*u*t*v[0]+t*t*v[2],u*u*from[1]+2*u*t*v[1]+t*t*v[3]]:[u*u*u*from[0]+3*u*u*t*v[0]+3*u*t*t*v[2]+t*t*t*v[4],u*u*u*from[1]+3*u*u*t*v[1]+3*u*t*t*v[3]+t*t*t*v[5]]);}p=end;
  }}if(row.length)rs.push(row);return rs;
}
function strokePoly(p,w){const sides=p.map((a,i)=>{const prev=p[Math.max(i-1,0)],next=p[Math.min(i+1,p.length-1)],len=Math.hypot(next[0]-prev[0],next[1]-prev[1])||1,dx=-(next[1]-prev[1])/len*w/2,dy=(next[0]-prev[0])/len*w/2;return [[a[0]+dx,a[1]+dy],[a[0]-dx,a[1]-dy]];});return [...sides.map(x=>x[0]),...sides.map(x=>x[1]).reverse()];}
function render(theme,mode,shapes,palette=null,suffix='anatomy'){
  const g=palette??grads[theme],prefix=suffix+'-'+theme;let defs='',body='';
  const cssFill=f=>g[f]?`linear-gradient(${g[f][0]}deg,${g[f].slice(1).join(',')})`:f;
  if(mode==='svg')for(const [name,[angle,...stops]] of Object.entries(g).filter(([name])=>shapes.some(s=>s.fill===name||s.stroke===name))){
    const a=(angle-90)*Math.PI/180,x=Math.cos(a)*.5,y=Math.sin(a)*.5;
    defs+=`<linearGradient id="${prefix}-${name}" x1="${num((.5-x)*100)}%" y1="${num((.5-y)*100)}%" x2="${num((.5+x)*100)}%" y2="${num((.5+y)*100)}%">${stops.map((s,i)=>{const [col,pos]=s.split(' ');return `<stop offset="${pos??num(i/(stops.length-1)*100)+'%'}" stop-color="${col}"/>`;}).join('')}</linearGradient>`;
  }
  const sf=f=>g[f]?`url(#${prefix}-${f})`:f;
  for(const {d,fill='none',stroke='',width=1,opacity=1,name='form'} of shapes){
    if(mode==='svg'){body+=`<path d="${d}" fill="${sf(fill)}"${stroke?` stroke="${sf(stroke)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`:''}${opacity<1?` opacity="${opacity}"`:''}/>`;continue;}
    const cmds=tokenize(d),ps=points(cmds);
    const emit=(p,content,clipping)=>{const xs=p.map(p=>p[0]),ys=p.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;if(w<.02||h<.02)return;body+=`<i class="ec-anatomy ec-${name}" style="left:${num(x)}px;top:${num(y)}px;width:${num(w)}px;height:${num(h)}px;background:${escape(cssFill(content))};clip-path:${clipping(x,y)};${opacity<1?`opacity:${opacity};`:''}"></i>`;};
    if(fill!=='none'){
      // Include Bézier controls in the bounds to avoid raster edges cutting curves.
      const all=cmds.flatMap(([op,...v])=>op==='Z'?[]:Array.from({length:v.length/2},(_,i)=>v.slice(i*2,i*2+2)));
      emit(all,fill,(x,y)=>`path('${cmds.map(([op,...v])=>op+v.map((n,i)=>num(n-(i%2?y:x))).join(' ')).join(' ')}')`);
    }
    if(stroke)for(const line of ps){const p=strokePoly(line,width);emit(p,stroke,(x,y)=>`polygon(${p.map(v=>`${num(v[0]-x)}px ${num(v[1]-y)}px`).join(',')})`);}
  }
  return mode==='svg'?`<defs>${defs}</defs><g>${body}</g>`:body;
}
function painter(){const shapes=[];return {shapes,p:(d,fill,stroke='',width=1,opacity=1,name='form')=>shapes.push({d,fill,stroke,width,opacity,name}),line:(d,stroke,width=1,opacity=1)=>shapes.push({d,stroke,width,opacity,name:'seam'})};}
function head(b,theme){const {p,line}=b,royal=theme==='majestic';const start=b.shapes.length;
  // River: three-quarter downward face. Royal: nape and back of the skull.
  if(royal){
    p('M118 115 Q119 129 111 141 Q133 153 161 138 Q151 127 157 109 Z','skin');
    p('M109 86 Q105 66 112 60 Q116 48 133 48 Q157 47 165 65 Q170 79 163 98 Q162 110 155 117 Q151 126 141 130 Q126 126 121 116 Q116 106 114 96 Q108 99 109 86 Z','#080810');
    line('M110 87 Q106 69 114 58 Q126 45 143 49 Q158 51 163 61','rim',1.05);
    line('M115 94 Q110 92 113 102 Q114 109 118 110 M162 93 Q166 91 163 103 Q161 109 158 110', '#9c78ae',.6);
    line('M123 118 Q125 130 116 140 M151 119 Q148 129 160 138','#725383',.7);
  }else{
    p('M139 112 Q143 127 134 133 Q155 145 179 126 Q165 123 170 103 Z','skin');
    p('M128 59 Q134 39 156 39 Q178 40 186 59 Q189 74 182 93 Q181 107 172 118 L159 125 L147 124 L139 117 L134 111 L133 102 L128 100 L129 93 Q123 83 128 59 Z','#060a19');
    line('M128 78 Q122 62 133 48 Q144 36 160 40 Q177 40 184 55','rim',1.25);
    line('M133 101 Q136 115 145 121 L154 126 M175 113 Q170 122 176 127','#40345c',.7);
    p('M132 89 Q128 83 128 90 Q129 98 133 101 Z','#223147');
  }
  const cx=royal?137:156,cy=royal?69:62;
  // One organic curly mass and a compound material stroke; the face stays dark.
  let seed=royal?42:92;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const knots=Array.from({length:54},(_,i)=>{const a=i/54*Math.PI*2,r=1+(random()-.5)*.14;return [cx+Math.cos(a)*29*r,cy+Math.sin(a)*25*r];});
  let hair=`M${num(knots[0][0])} ${num(knots[0][1])}`;
  for(let i=1;i<=knots.length;i++){const a=knots[i%knots.length],prev=knots[(i-1)%knots.length];hair+=` Q${num(a[0]+(a[0]-cx)*.04)} ${num(a[1]+(a[1]-cy)*.05)} ${num((a[0]+prev[0])/2)} ${num((a[1]+prev[1])/2)}`;}
  p(hair+' Z',royal?'#0b0912':'#080e1d');
  let curls='';for(let i=0;i<54;i++){const a=random()*Math.PI*2,r=Math.sqrt(random()),x=cx+Math.cos(a)*26*r,y=cy+Math.sin(a)*22*r,s=.8+random()*1.1;curls+=` M${num(x)} ${num(y)} Q${num(x-2*s)} ${num(y-3*s)} ${num(x+s)} ${num(y-2*s)} Q${num(x-s)} ${num(y-2*s)} ${num(x+.3)} ${num(y+.3)} Z`;}
  p(curls,royal?'#81658e':'#407497','',1,.42);
  line(royal?'M110 67 Q115 51 132 47 Q148 47 161 57':'M127 60 Q137 38 158 38 Q173 39 182 51',royal?'#d9b7ec':'#7de7ff',.9,.65);
  if(!royal){
    line('M131 99 L134 108 L143 119 L154 124','#516079',.65,.6);
    line('M173 110 Q169 122 177 129','#86518c',.8,.7);
    // Tilt the skull toward the lowered left shoulder; keep the neck anchored.
    for(const s of b.shapes.slice(start+1)){s.d=tokenize(s.d).map(([op,...v])=>op+v.map((x,i)=>{const px=v[i-i%2]-156,py=v[i-i%2+1]-83,a=-.105;return num(i%2?83+px*Math.sin(a)+py*Math.cos(a):151+px*Math.cos(a)-py*Math.sin(a));}).join(' ')).join(' ');}
  }
}
function rivera(){const b=painter(),{p,line}=b;
  // Left arm reaches across the horizon; the right elbow is bent behind the body.
  p('M96 172 Q106 180 111 190 Q88 204 65 211 Q42 218 25 220 L24 211 Q50 204 69 194 Q80 187 87 175 Z','skin');
  p('M239 166 Q260 169 268 185 Q274 196 269 212 L257 239 L244 245 L237 239 Q249 221 250 205 Q242 198 232 187 Z','skin');
  p('M135 129 Q147 139 171 124 Q192 122 213 135 Q232 140 244 157 Q251 165 260 175 Q249 182 229 186 L224 176 Q225 204 217 231 L218 249 L99 249 Q107 219 105 194 L97 195 Q83 192 77 185 Q88 167 97 154 Q109 139 135 129 Z','cloth');
  p('M99 153 Q113 141 137 134 Q145 138 149 139 Q117 149 108 168 L99 184 L84 183 Q92 168 99 153 Z','fold');
  p('M174 129 Q207 128 228 147 Q236 155 241 164 Q224 149 202 146 Q187 140 165 141 Z','fold');
  p('M111 174 Q114 191 109 208 Q114 221 110 239 L118 244 Q117 219 119 209 Q115 191 118 175 Z','#321c4c', '',1,.7);
  p('M199 149 Q194 168 196 184 Q204 207 205 237 L211 241 Q214 215 206 194 Q201 179 205 154 Z','#322044','',1,.75);
  p('M136 145 Q145 146 157 142 Q144 155 137 172 L133 181 Q138 157 136 145 Z','#75309b','',1,.54);
  p('M156 148 Q160 159 154 173 Q144 186 142 202 Q137 197 142 182 Q150 166 156 148 Z','#633383','',1,.5);
  p('M171 145 Q163 174 157 187 Q159 195 161 211 L157 206 Q152 190 156 181 Z','#9b46b4','',1,.5);
  p('M210 151 Q220 156 226 170 L219 176 Q214 164 210 151 Z','#070c1e');
  line('M85 175 Q98 144 136 131 M174 126 Q213 126 240 156 Q251 169 258 175','rim',1.05);
  line('M104 153 Q101 166 105 183 M211 137 Q208 155 226 177','#9966c5',.9);
  line('M80 185 Q88 194 104 195 M230 182 Q244 186 258 177','#5bcbe7',1.1);
  line('M101 157 Q117 153 130 143 M110 164 Q123 157 134 146 M120 174 Q131 158 144 143 M145 180 Q154 160 166 143 M160 179 Q170 154 181 138 M182 153 Q178 173 177 183 M202 188 Q199 213 204 231','#b956d5',.65,.72);
  line('M109 205 Q140 199 175 201 Q197 199 216 193 M108 217 Q159 209 215 204 M105 230 Q156 217 211 220','#a443b7',.65,.65);
  // Distinct refracted cyan slash, with magenta upper reflection and broken endings.
  p('M24 211 L257 160 L260 164 L26 219 Z','#3bdff0');
  p('M84 202 L253 160 L253 162 L84 205 Z','#c3ffff');
  line('M24 224 L122 204 M105 182 L249 148','#ed57c9',.9,.9);
  line('M28 216 Q58 212 83 201 M268 187 Q271 202 261 222','#31d8ed',1.3,.8);
  head(b,'rivera');
  p('M132 130 Q142 137 151 135 Q164 131 176 123 L182 128 Q161 143 145 144 Q135 142 130 135 Z','#29224f');
  line('M131 131 Q140 140 151 137 Q166 133 179 126','#aeb0ef',1.05);
  return b.shapes;
}
function majestic(){const b=painter(),{p,line}=b;
  p('M82 169 Q65 185 62 214 L58 233 L81 240 Q86 219 97 202 L109 184 Z','skin');
  p('M217 166 Q231 177 242 198 Q251 207 260 219 L254 234 L237 227 Q225 217 218 204 L202 190 Z','skin');
  p('M116 136 Q133 143 158 135 Q184 137 202 145 Q218 151 229 172 L239 193 Q225 200 211 199 L205 187 Q207 214 219 240 L217 250 L73 250 Q86 221 86 199 L77 197 L58 186 Q67 163 83 153 Q99 141 116 136 Z','cloth');
  p('M71 172 Q84 150 118 138 Q126 144 135 143 Q110 148 92 158 Q79 169 71 181 Z','fold');
  p('M155 138 Q184 138 206 149 Q213 156 217 165 Q193 149 167 147 Z','fold');
  p('M95 159 Q86 178 90 196 Q92 213 85 232 L92 239 Q99 221 95 198 Q93 178 102 159 Z','#5b326a','',1,.5);
  p('M114 155 Q118 173 113 191 Q119 211 114 232 L119 240 Q124 216 119 195 Q121 171 114 155 Z','#5e347b','',1,.36);
  p('M180 154 Q171 168 181 185 Q184 198 183 212 L189 224 Q191 198 186 184 Q179 164 186 154 Z','#764793','',1,.38);
  p('M202 154 Q210 164 209 178 L218 190 L228 188 Q216 178 216 168 Z','#613179','',1,.43);
  p('M131 147 Q146 153 159 145 L157 149 Q140 158 127 152 Z','#71458b','',1,.6);
  line('M61 180 Q73 152 115 137 M154 136 Q187 136 209 150 Q224 163 234 188','rim',1.15);
  line('M97 150 Q84 172 91 190 M191 145 Q185 159 196 180','#9663ae',.8);
  line('M64 185 Q75 195 86 196 M213 194 Q228 198 236 190','#c79adb',1.05,.75);
  line('M91 159 Q88 172 91 180 M103 152 Q99 170 102 183 M114 156 Q119 165 115 179 M181 156 Q176 165 180 173 M200 160 Q210 175 207 184 M86 208 Q84 219 80 229 M194 205 Q204 216 204 229','#ab7bc1',.65,.55);
  head(b,'majestic');
  p('M118 128 Q128 135 141 133 L153 126 Q156 135 171 141 Q147 136 136 139 Q120 140 105 146 Z','#24152e');
  line('M110 141 Q130 132 151 136 Q159 138 164 139','#d1afe1',1.15);
  line('M80 159 Q97 146 115 144 M86 163 L105 153 M105 149 L114 146 M160 141 Q184 139 204 152 M172 145 L185 147','#bb8dce',.85,.8);
  for(const [x,y,r] of [[112,190,4],[155,190,5],[92,211,2.4],[139,215,3.5],[180,217,3]])p(`M${x} ${y-r} Q${x+1} ${y-1} ${x+r} ${y} Q${x+1} ${y+1} ${x} ${y+r} Q${x-1} ${y+1} ${x-r} ${y} Q${x-1} ${y-1} ${x} ${y-r} Z`,'#cd9af3');
  return b.shapes;
}
function drift(){const b=painter(),{p,line}=b;
  p('M137 143 Q119 147 105 162 Q91 180 80 207 L65 235 L87 246 L109 223 L104 250 L242 250 Q232 224 237 207 L250 214 L272 199 Q264 179 252 165 Q237 148 213 140 L187 133 Z','cloth');
  p('M108 163 Q116 155 127 153 Q117 172 112 194 Q104 211 92 224 L86 224 Q98 198 101 188 Q99 177 108 163 Z','fold');
  p('M205 147 Q225 143 243 160 Q259 175 266 194 L256 199 Q251 180 242 171 Q230 154 215 155 Z','fold');
  p('M138 151 Q130 166 128 185 Q124 197 122 205 L126 218 Q132 198 133 188 Q134 173 144 159 Z','#747c77','',1,.28);
  p('M193 151 Q187 173 197 191 Q202 205 199 219 L208 237 Q209 213 205 201 Q197 176 201 158 Z','#6d756e','',1,.25);
  p('M220 158 Q216 178 226 195 L231 206 Q229 182 224 174 Z','#9b9f94','',1,.3);
  p('M121 211 Q138 216 151 208 L159 212 Q142 220 122 217 Z','#555f5b','',1,.55);
  line('M82 208 Q92 177 110 159 Q122 148 137 146 M205 142 Q234 142 252 164 Q266 181 271 198','rim',1.05);
  line('M117 159 Q105 186 104 203 M128 159 Q120 178 122 190 M139 160 Q136 184 141 195 M209 156 Q205 176 216 195 M239 163 Q253 181 254 194','#b5c1b6',.8,.6);
  line('M97 209 Q106 208 111 218 M112 226 Q142 218 158 230 M174 227 Q197 219 215 224','#a9b1a5',.75,.6);
  // Tall asymmetrical hood: a sharp cloth peak and deeply recessed face void.
  p('M151 49 Q164 48 184 70 Q199 86 204 98 Q208 108 198 126 L187 145 Q172 161 156 166 Q137 158 123 146 Q116 137 120 122 Q126 91 140 65 Z','cloth');
  p('M122 125 Q125 91 145 62 Q149 55 154 51 Q164 53 174 59 Q152 61 140 87 Q131 106 127 127 Z','fold');
  p('M149 58 Q169 58 187 82 Q173 73 154 75 Q144 77 135 91 Q140 72 149 58 Z','#727b76','',1,.7);
  p('M130 119 Q149 95 179 92 Q197 91 201 102 Q199 118 184 140 Q172 153 156 158 Q138 150 125 139 Z','#070b0d');
  p('M134 121 Q150 101 175 97 Q190 95 194 105 Q187 124 174 137 Q166 147 156 150 Q141 144 130 136 Z','#030609');
  p('M201 102 Q206 114 192 137 Q181 154 163 161 L158 156 Q182 143 192 126 Z','#5d6661','',1,.55);
  p('M124 128 Q136 142 158 149 Q146 149 138 147 Q127 143 121 136 Z','#a4ada1','',1,.5);
  line('M120 125 Q124 96 138 73 Q146 55 154 49 Q169 51 183 64','rim',1.15);
  line('M127 130 Q137 111 151 103 Q164 95 180 94','#ced7c5',1.3,.8);
  line('M129 143 Q142 154 156 160 M175 151 Q191 136 195 124','#909d8f',.9,.7);
  line('M133 95 Q148 81 164 79 M138 80 Q150 68 166 67 M143 66 Q154 61 170 64 M173 62 Q185 74 188 82','#dee6d7',.7,.8);
  line('M127 119 Q136 91 150 84 M154 51 Q157 58 172 62','#edf0df',.6,.65);
  line('M145 159 Q140 173 142 181 Q144 191 137 202 M184 151 Q187 166 183 176 Q180 182 183 193','#d9e0d2',1.1);
  line('M137 200 L136 207 M183 191 L184 198','#ebe9d8',2);
  // Irregular brush marks, kept separate from editable card wording.
  line('M140 220 L149 198 L151 212 L159 205 L155 221 M168 220 L181 196 L174 221 M181 214 L195 198 L190 219 M203 214 L210 201','#e0e2d8',2.2,.9);
  line('M133 219 L162 208 M173 214 L198 205','#e8eae2',1.15,.85);
  return b.shapes;
}
function prism(){const b=painter(),{p,line}=b;
  // Crisp right-facing profile with cheek/jaw and a restrained, dark interior.
  p('M159 113 L157 133 Q139 135 122 147 Q109 159 99 180 L76 225 L89 244 L112 223 L111 248 L237 249 Q230 221 229 202 Q238 208 246 202 L252 184 Q245 165 225 153 L199 140 Q188 130 189 115 Z','cloth');
  const facets=[
    ['M122 147 L151 137 L138 161 L113 171 Z','#254a5d'],['M151 137 L174 142 L166 167 L138 161 Z','#0c1528'],['M174 142 L199 140 L218 158 L185 160 Z','#3c4168'],['M218 158 L239 174 L225 188 L200 174 Z','#171a31'],
    ['M113 171 L138 161 L123 197 L99 206 Z','#10455c'],['M138 161 L166 167 L151 188 L123 197 Z','#0b1429'],['M166 167 L185 160 L200 174 L179 197 Z','#214258'],['M151 188 L166 167 L179 197 L158 215 Z','#28273e'],
    ['M179 197 L200 174 L225 188 L211 212 Z','#15162a'],['M225 188 L240 181 L248 191 L239 207 Z','#694878'],['M123 197 L151 188 L158 215 L126 224 Z','#122a40'],['M158 215 L179 197 L191 229 L165 246 Z','#11182e'],['M179 197 L211 212 L191 229 Z','#493758'],['M211 212 L227 203 L234 242 L191 229 Z','#1d2240'],['M126 224 L158 215 L165 246 L111 248 Z','#07182b'],['M99 206 L123 197 L111 220 L90 237 Z','#175377']
  ];facets.forEach(([d,c])=>p(d,c,'#a7d6e633',.45));
  // Small spectral reflections interrupt selected facets, never a uniform mesh.
  p('M138 161 L151 137 L148 152 L125 167 Z','#63cde3');
  p('M185 160 L218 158 L199 164 Z','#b5a5f5');
  p('M200 174 L225 188 L217 195 Z','#bb6bb7');
  p('M123 197 L130 182 L127 198 L116 210 Z','#93e1de');
  p('M179 197 L191 229 L181 211 Z','#6273a1');
  p('M159 112 Q159 129 154 134 L174 145 L195 139 Q184 129 189 114 Z','skin');
  p('M157 64 Q161 45 179 43 Q200 40 213 52 Q220 57 218 67 L214 76 Q216 82 215 87 L223 100 Q224 102 219 103 L216 104 L217 111 L213 114 Q215 120 211 123 L201 125 L189 116 L181 110 Q175 107 170 97 Q158 92 157 80 Z','#090d1d');
  p('M196 74 L213 78 L215 87 L205 90 L209 104 L198 110 L188 96 Z','#10172b');
  p('M205 90 L215 87 L223 101 L213 100 Z','#1e2840');
  p('M198 110 L209 104 L215 112 L211 122 L201 123 Z','#15172a');
  p('M174 84 Q166 78 166 88 Q168 103 176 104 L178 96 Z','#1b2a3f');
  line('M175 88 Q168 81 169 90 Q170 96 174 98','#7198b6',.75);
  line('M158 79 Q152 60 169 48 Q185 37 203 45 Q215 49 219 57','#bddeed',1.05);
  line('M214 77 L215 87 L223 101 L216 103 L217 111 L213 114 Q215 121 211 123 L201 125 L190 117','#7b749b',.65);
  line('M178 104 Q178 119 189 129 M160 113 Q160 126 154 133','#83a6be',.75);
  line('M154 133 L174 145 L195 139 M155 137 L174 150 L198 143','#c1d6e8',.9);
  line('M101 176 Q113 148 152 136 M202 143 Q235 153 249 179','#afdaee',1.05);
  const hair=[['M158 66 Q165 48 184 45 Q205 43 215 55 L210 56 Q189 46 173 56 Z','#121f31'],['M161 61 L166 50 L171 52 L179 45 L184 48 L190 44 L195 47 L201 46 L207 51 L213 51 L218 58 L209 54 L204 55 L195 50 L187 52 L179 49 L173 56 L168 55 Z','#283648']];hair.forEach(([d,c])=>p(d,c));
  line('M161 60 L166 51 L172 52 L178 47 L184 49 L190 46 L196 49 L201 48 L207 52','#b5d7e5',.7,.7);
  return b.shapes;
}
export function figure(theme,mode){return render(theme,mode,({rivera,majestic,drift,prism}[theme])());}
export const renderContours=render;
