import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {cards} from '../css-art/cards.mjs';
const source='hybrid-art/atlas-separated.png';
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
// Normalize virtually invisible matte residue before encoding transparent assets.
// Keep all visible artwork and edge antialiasing; retain the original PNG unchanged.
for(let i=0;i<data.length;i+=4)if(data[i+3]<4)data.fill(0,i,i+4);
// Separate the independently drawn cells; the new webpage retains the reference layout.
const windows=[
 [0,0,283,485],[283,0,549,485],[549,0,817,485],[817,0,1122,485],
 [0,485,310,935],[310,485,568,935],[568,485,822,935],[822,485,1122,935],
 [0,935,275,1402],[275,935,528,1402],[528,935,821,1402],[821,935,1122,1402],
];
await mkdir('hybrid/assets',{recursive:true});
const manifest={source,width:info.width,height:info.height,cards:[]};
for(let index=0;index<cards.length;index++){
 const [x0,y0,x1,y1]=windows[index];let l=x1,t=y1,r=x0,b=y0;
 for(let y=y0;y<Math.min(y1,info.height);y++)for(let x=x0;x<Math.min(x1,info.width);x++)if(data[(y*info.width+x)*4+3]>16){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 l=Math.max(x0,l-3);t=Math.max(y0,t-3);r=Math.min(x1-1,r+3);b=Math.min(y1-1,b+3);
 const crop={left:l,top:t,width:r-l+1,height:b-t+1};
 const files=[];
 for(const scale of [1,2]){
  const suffix=scale===1?'':'@2x';
  const pipeline=sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).extract(crop).resize(200*scale,320*scale,{fit:'fill',kernel:'lanczos3'});
  for(const format of ['webp','avif']){
   const output=`hybrid/assets/${cards[index].theme}${suffix}.${format}`;
   const result=await pipeline.clone()[format](format==='webp'?{quality:88,alphaQuality:100,effort:6,smartSubsample:true}:{quality:65,chromaSubsampling:'4:4:4',effort:4}).toFile(output);
   files.push({format,scale,file:output,bytes:result.size,width:result.width,height:result.height});
  }
 }
 manifest.cards.push({theme:cards[index].theme,crop,files});
 console.log(cards[index].theme,files.map(f=>`${f.format}${f.scale}x:${Math.round(f.bytes/1024)}KiB`).join(' '));
}
await writeFile('hybrid-art/assets-manifest.json',JSON.stringify(manifest,null,2));
