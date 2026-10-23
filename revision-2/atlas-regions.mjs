// Audited against these exact source atlases. Coordinates are absolute source
// pixels [left, top, right, bottom), not output pixels or new crop bounds.
// Keep each original quadrant canvas: cropping to visible content would move
// the artwork relative to the independently rendered labels and flags.
export const atlasSources = {
 a:{width:1116,height:1410,sha256:'47abe7d79b37f5dd0d1b25c62f3c448aef901f97207725f53857a023b8a438f8'},
 b:{width:1114,height:1412,sha256:'844f31b6cde58b75fc3a6b9b31290d5f819c789cb1c5fbafc9d9031ff2b57e14'},
 c:{width:1113,height:1413,sha256:'da45582ce118ab14348ab0553af08bdd5d10e8edad62bbcb1484a0e9648b08ae'},
};

export const atlasExclusions = {
 valor:{rectangles:[],redHalo:[0,696,558,705],reason:'Remove Blaze’s red halo within the last nine rows of Valor’s quadrant, selecting only pixels where 20*G < 9*R. Preserve the gold centerline and original canvas. The mixed halo includes 23 selected center-region pixels with alpha at most 18/255.'},
 rivera:{rectangles:[[201,691,386,706]],reason:'Remove the Silvah crown tips below Rivera.'},
 nexus:{rectangles:[[727,690,923,706]],reason:'Remove the Aurum crown tips below Nexus. Their merged glow cannot be separated losslessly; the boundary follows the narrow junction below the silver tip.'},
 silvah:{rectangles:[[546,935,557,992]],reason:'Remove the edge of Aurum’s gold orbit sphere. This also removes a small shared fringe of green glow with alpha at most 29/255.'},
 drift:{rectangles:[[555,217,556,222],[555,372,556,373]],reason:'Remove two tiny runs belonging to the neighboring Majestic contour; preserve Drift’s bottom glow.'},
 majestic:{rectangles:[[867,691,1112,694],[860,694,1112,695],[859,695,1112,696],[858,696,1112,697],[856,697,1112,698],[853,698,1112,699],[852,699,1112,700],[848,700,1112,706],[773,702,808,706]],reason:'Remove faint white/cyan Prism crown pixels while preserving the adjoining blue/magenta Majestic glow.'},
 legacy:{rectangles:[[98,706,105,711],[209,706,250,718],[452,706,495,711]],reason:'Remove identifiable faint Drift tail fragments at the top edge, before the ambiguous shared glow.'},
 prism:{rectangles:[[556,999,561,1045],[556,1048,565,1103],[556,1103,566,1139]],reason:'Remove the bronze Legacy leaf fragments and surrounding fringe at Prism’s left edge. Outside the 172 confirmed fragment pixels, removed mixed-halo pixels have alpha at most 17/255.'},
};

export function excludeNeighborPixels(data, region, rectangles) {
 if(data.length!==region.width*region.height*4)throw Error('Expected an RGBA tile');
 let clearedPixels=0;
 for(const rect of rectangles){
  if(rect.length!==4||!rect.every(Number.isInteger))throw Error('Invalid atlas exclusion');
  const [left,top,right,bottom]=rect;
  if(left<region.left||top<region.top||right>region.left+region.width||bottom>region.top+region.height||right<=left||bottom<=top)throw Error('Atlas exclusion escapes its tile');
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
   const offset=((y-region.top)*region.width+x-region.left)*4;
   if(data[offset+3])clearedPixels++;
   data.fill(0,offset,offset+4);
  }
 }
 return clearedPixels;
}

// This source-pinned correction is intentionally bounded to Valor’s seam.
// A horizontal trim would also cut the declining gold tail. The red halo
// instead grows toward the neighboring fire card; keep the gold centerline.
export function excludeRedHaloPixels(data, region, bounds) {
 if(data.length!==region.width*region.height*4)throw Error('Expected an RGBA tile');
 if(bounds.length!==4||!bounds.every(Number.isInteger))throw Error('Invalid halo bounds');
 const [left,top,right,bottom]=bounds;
 if(left<region.left||top<region.top||right>region.left+region.width||bottom>region.top+region.height||right<=left||bottom<=top)throw Error('Halo exclusion escapes its tile');
 let clearedPixels=0;
 for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
  const offset=((y-region.top)*region.width+x-region.left)*4;
  if(data[offset+3]&&20*data[offset+1]<9*data[offset]){
   if(data[offset+3]>60)throw Error('Halo exclusion would remove an unaudited opaque pixel');
   data.fill(0,offset,offset+4);clearedPixels++;
  }
 }
 return clearedPixels;
}
