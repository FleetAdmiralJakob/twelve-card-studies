// Authored Bezier geometry, never image sampling. SVG keeps the source curves;
// CSS uses native path() for filled contours and bounded polygon stroke outlines.
export const round = n => Math.round(n * 100) / 100;
export const shape = (d, fill, opacity=1) => ({d,fill,opacity});
export const stroke = (d, fill, width=1, opacity=1) => ({d,fill,width,opacity});
export const polygon = (pts, fill, opacity=1) => shape(`M${pts.map(p=>p.map(round).join(' ')).join('L')}Z`,fill,opacity);
export const rectangle = (x,y,w,h,fill,opacity=1) => polygon([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill,opacity);
export function curves(d) {
  const tokens=d.match(/[MLCQZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[];
  let i=0,p=[0,0],start=p,points=[],paths=[];
  const take=()=>[Number(tokens[i++]),Number(tokens[i++])];
  const emit=q=>{points.push(q);p=q;};
  while(i<tokens.length) {
    const op=tokens[i++];
    if(op==='M'){if(points.length)paths.push(points);points=[];emit(take());start=p;}
    else if(op==='L')emit(take());
    else if(op==='C'||op==='Q') {
      const a=p,b=take(),c=take(),e=op==='C'?take():c;
      const dist=Math.hypot(e[0]-a[0],e[1]-a[1])+Math.hypot(b[0]-a[0],b[1]-a[1]);
      const steps=Math.max(3,Math.min(18,Math.ceil(dist/6)));
      for(let j=1;j<=steps;j++) {const t=j/steps,u=1-t;emit([0,1].map(k=>op==='C'?u*u*u*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t*t*t*e[k]:u*u*a[k]+2*u*t*b[k]+t*t*c[k]));}
    } else if(op==='Z') {emit(start);} else throw Error(`Unsupported authored command ${op}`);
  }
  if(points.length)paths.push(points);
  return paths;
}
function outline(points,width) {
  points=points.filter((p,i)=>!i||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>.02);
  const left=[],right=[];
  for(let i=0;i<points.length;i++) {
    const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
    const nx=-(b[1]-a[1])/l*width/2,ny=(b[0]-a[0])/l*width/2;
    left.push([points[i][0]+nx,points[i][1]+ny]);right.push([points[i][0]-nx,points[i][1]-ny]);
  }
  return [...left,...right.reverse()];
}
export function render(scene,gradients,mode,prefix) {
  const used=new Set(scene.map(s=>s.fill).filter(s=>gradients[s]));
  const gradientCSS=g=>g.radial?`radial-gradient(ellipse at ${g.cx||50}% ${g.cy||50}%,${g.stops.map(([c,o])=>`${c} ${o}%`).join(',')})`:`linear-gradient(${g.angle??110}deg,${g.stops.map(([c,o])=>`${c} ${o}%`).join(',')})`;
  const defs=[...used].map(name=>{const g=gradients[name],rad=(g.angle??110)*Math.PI/180,dx=Math.sin(rad),dy=-Math.cos(rad);return g.radial?`<radialGradient id="${prefix}-${name}" cx="${g.cx||50}%" cy="${g.cy||50}%" r="70%">${g.stops.map(([c,o])=>`<stop offset="${o}%" stop-color="${c}"/>`).join('')}</radialGradient>`:`<linearGradient id="${prefix}-${name}" x1="${50-dx*50}%" y1="${50-dy*50}%" x2="${50+dx*50}%" y2="${50+dy*50}%">${g.stops.map(([c,o])=>`<stop offset="${o}%" stop-color="${c}"/>`).join('')}</linearGradient>`;}).join('');
  const markup=scene.map(s=>{
    if(mode==='css'&&s.materialWindows)return s.materialWindows.map(([x,y,w,h])=>`<i class="en-shape" style="left:${x+2}px;top:${y+4}px;width:${w-4}px;height:${h-8}px;background:repeating-linear-gradient(0deg,transparent 0 4.3px,#30c9f485 4.3px 5px)"></i>`).join('');
    if(mode==='svg')return `<path d="${s.d}" ${s.width?`fill="none" stroke="${gradients[s.fill]?`url(#${prefix}-${s.fill})`:s.fill}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"`:`fill="${gradients[s.fill]?`url(#${prefix}-${s.fill})`:s.fill}"`}${s.opacity===1?'':` opacity="${s.opacity}"`}/>`;
    const contours=curves(s.d);
    if(s.width&&s.batch){
      const d=contours.map(pts=>`M${outline(pts,s.width).map(p=>p.map(round).join(' ')).join('L')}Z`).join('');
      return render([{d,fill:s.fill,opacity:s.opacity}],gradients,'css',prefix).markup;
    }
    return (s.width?contours:[contours.flat()]).map(points=>{
      if(s.width)points=outline(points,s.width);
      const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x||.1,h=Math.max(...ys)-y||.1;
      const pts=points.map(p=>`${round((p[0]-x)/w*100)}% ${round((p[1]-y)/h*100)}%`).join(',');
      let ordinate=0;
      const local=s.d.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi,n=>String(round(Number(n)-(ordinate++%2?y:x))));
      const clipping=s.width?`polygon(${pts})`:`path('${local}')`;
      return `<i class="en-shape" style="left:${round(x)}px;top:${round(y)}px;width:${round(w)}px;height:${round(h)}px;clip-path:${clipping};background:${gradients[s.fill]?gradientCSS(gradients[s.fill]):s.fill}${s.opacity===1?'':`;opacity:${s.opacity}`}"></i>`;
    }).join('');
  }).join('');
  return {markup,defs};
}
