import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {cards} from './cards.mjs';
import {atlasSources,atlasExclusions,excludeNeighborPixels} from './atlas-regions.mjs';
await mkdir('revision-2/assets/frames',{recursive:true});
const provenance=[];
for(const [row,atlas] of ['a','b','c'].entries()){
 const input=`revision-2/assets/atlas-${atlas}-clean.png`;
 const source=await readFile(input),sourceSha256=createHash('sha256').update(source).digest('hex');
 const {width,height}=await sharp(source).metadata(),expected=atlasSources[atlas];
 if(width!==expected.width||height!==expected.height||sourceSha256!==expected.sha256)throw Error(`Atlas ${atlas} changed; review the isolation boundaries before preparing assets.`);
 for(let n=0;n<4;n++){
  const theme=cards[row*4+n].theme;
  const left=n%2*Math.floor(width/2),top=Math.floor(n/2)*Math.floor(height/2);
  const region={left,top,width:Math.floor(width/2),height:Math.floor(height/2)};
  let original=await sharp(source).extract(region).png().toBuffer();
  const exclusion=atlasExclusions[theme];
  let clearedPixels=0;
  if(exclusion){
   const {data,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   clearedPixels=excludeNeighborPixels(data,region,exclusion.rectangles);
   original=await sharp(data,{raw:info}).png().toBuffer();
  }
  // Remove neighboring artwork in place; never recenter, tighten or stretch
  // the remaining silhouette. Keep the existing live-field coordinate system.
  for(const [suffix,w] of [['',300],['@2x',600]]){
   const pipeline=sharp(original).resize(w,Math.round(w*380/300),{fit:'fill'});
   await pipeline.clone().webp({quality:86,alphaQuality:95,effort:6}).toFile(`revision-2/assets/frames/${theme}${suffix}.webp`);
   await pipeline.clone().avif({quality:63,effort:5}).toFile(`revision-2/assets/frames/${theme}${suffix}.avif`);
  }
  provenance.push({theme,source:input,sourceSha256,sourceRegion:region,isolation:{coordinateSystem:'absolute source pixels; [left,top,right,bottom), upper bounds exclusive',excludedRectangles:exclusion?.rectangles||[],clearedNontransparentPixels:clearedPixels,note:exclusion?.reason||'Original quadrant retained; no identifiable neighboring solid contour to remove.'},output:[300,380],highResolution:[600,760]});
 }
}
await sharp('revision-2/assets/reference.png').resize(1000).webp({quality:82}).toFile('revision-2/assets/reference-preview.webp');
await writeFile('revision-2/assets/frames.json',JSON.stringify(provenance,null,2)+'\n');
console.log('Prepared 12 frames, two sizes and two formats per card.');
