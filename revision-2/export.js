(() => {
 let busy=false;
 const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Artwork could not be loaded'));img.src=src});
 const download=(blob,name)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)};
 document.addEventListener('revision2:export',async event=>{
  if(busy)return;busy=true;
  let result;
  try{
   const {card,theme,state}=event.detail;
   await document.fonts.ready;
   const canvas=document.createElement('canvas');canvas.width=1011;canvas.height=1280;
   const ctx=canvas.getContext('2d');ctx.scale(canvas.width/300,canvas.height/380);
   const art=card.querySelector('.card-art img');
   ctx.drawImage(await load(art.dataset.highRes||art.currentSrc||art.src),0,0,300,380);
   const scale=card.getBoundingClientRect().width/300,base=card.getBoundingClientRect();
   const crest=card.querySelector('.card-crest svg');
   if(crest){const r=crest.getBoundingClientRect();ctx.drawImage(await load('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(crest.outerHTML)),(r.left-base.left)/scale,(r.top-base.top)/scale,r.width/scale,r.height/scale)}
   for(const el of card.querySelectorAll('.card-rating strong,.card-rating span,.card-name,.card-stat small,.card-stat strong')){
    const css=getComputedStyle(el),r=el.getBoundingClientRect(),size=parseFloat(css.fontSize);
    ctx.font=`${css.fontWeight} ${size}px ${css.fontFamily}`;ctx.fillStyle=css.color;
    ctx.textBaseline='alphabetic';ctx.textAlign='left';
    ctx.letterSpacing=css.letterSpacing==='normal'?'0px':css.letterSpacing;
    const text=el.textContent,metrics=ctx.measureText(text);
    const ascent=metrics.fontBoundingBoxAscent||size,descent=metrics.fontBoundingBoxDescent||size*.2;
    const x=(r.left-base.left)/scale,y=(r.top-base.top)/scale,w=r.width/scale,h=r.height/scale;
    const center=el.classList.contains('card-name')||!!el.closest('.card-stat');
    ctx.fillText(text,center?x+(w-metrics.width)/2:x,y+(h-ascent-descent)/2+ascent);
   }
   const flag=card.querySelector('.flag'),style=getComputedStyle(flag),r=flag.getBoundingClientRect();
   const match=style.backgroundImage.match(/^url\(["']?(.*?)["']?\)$/);
   if(match)ctx.drawImage(await load(match[1]),(r.left-base.left)/scale,(r.top-base.top)/scale,r.width/scale,r.height/scale);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG encoding failed');
   download(blob,`${theme}-${(state.name||theme).toLowerCase().replace(/[^a-z0-9]+/g,'-')}-revision-2.png`);
   result={ok:true,message:'PNG downloaded · 1011 × 1280, transparent background.'};
  }catch(error){result={ok:false,message:`Export failed: ${error.message}. Please try again.`}}
  finally{busy=false;document.dispatchEvent(new CustomEvent('revision2:export-result',{detail:result}))}
 });
})();
