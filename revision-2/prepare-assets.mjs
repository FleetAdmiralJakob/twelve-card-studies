import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {cards} from './cards.mjs';
await mkdir('revision-2/assets/frames',{recursive:true});
const provenance=[];
for(const [row,atlas] of ['a','b','c'].entries()){
 const input=`revision-2/assets/atlas-${atlas}-clean.png`;
 const {width,height}=await sharp(input).metadata();
 for(let n=0;n<4;n++){
  const theme=cards[row*4+n].theme;
  const left=n%2*Math.floor(width/2),top=Math.floor(n/2)*Math.floor(height/2);
  const region={left,top,width:Math.floor(width/2),height:Math.floor(height/2)};
  const original=await sharp(input).extract(region).png().toBuffer();
  // Each generated quadrant is an authored card, including its transparent glow.
  // Preserve that composition instead of stretching the solid frame separately.
  for(const [suffix,w] of [['',300],['@2x',600]]){
   const pipeline=sharp(original).resize(w,Math.round(w*380/300),{fit:'fill'});
   await pipeline.clone().webp({quality:86,alphaQuality:95,effort:6}).toFile(`revision-2/assets/frames/${theme}${suffix}.webp`);
   await pipeline.clone().avif({quality:63,effort:5}).toFile(`revision-2/assets/frames/${theme}${suffix}.avif`);
  }
  provenance.push({theme,source:input,sourceRegion:region,output:[300,380],highResolution:[600,760]});
 }
}
await sharp('revision-2/assets/reference.png').resize(1000).webp({quality:82}).toFile('revision-2/assets/reference-preview.webp');
await writeFile('revision-2/assets/frames.json',JSON.stringify(provenance,null,2)+'\n');
console.log('Prepared 12 frames, two sizes and two formats per card.');
