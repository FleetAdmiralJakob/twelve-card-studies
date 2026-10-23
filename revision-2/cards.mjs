export const cards = [
 ['valor','VALOR',94,'ST','france',[94,96,88,93,46,91],'Gold, glory and a crown.','#eed17d'],
 ['frost','FROST',92,'CAM','norway',[88,90,94,93,60,82],'Cut from blue ice.','#a9e3ff'],
 ['blaze','BLAZE',93,'LW','spain',[97,91,86,95,42,78],'A silhouette forged in fire.','#ffb293'],
 ['volt','VOLT',91,'RW','japan',[96,89,87,93,51,76],'Electric nights, endless energy.','#dcd2ff'],
 ['rivera','RIVERA',89,'CM','brazil',[84,83,91,88,78,85],'After the sun goes down.','#fff29b'],
 ['nexus','NEXUS',95,'CB','england',[82,58,75,78,96,92],'The power of black and silver.','#ececec'],
 ['silvah','SILVAH',90,'CDM','portugal',[78,71,88,85,92,89],'Instinct, unleashed.','#d1ee87'],
 ['aurum','AURUM',92,'CM','italy',[87,86,93,91,77,84],'Marble, movement and gold.','#25251f'],
 ['drift','DRIFT',88,'LW','netherlands',[95,85,80,90,50,78],'Leave your mark.','#f2f1eb'],
 ['majestic','MAJESTIC',96,'ST','argentina',[93,97,89,94,48,87],'Made for the biggest stage.','#e6d5f1'],
 ['legacy','LEGACY',87,'RB','germany',[89,70,82,83,88,86],'Built to outlast the game.','#e6c297'],
 ['prism','PRISM',93,'CF','uruguay',[91,92,88,94,66,80],'Every angle tells a story.','#e4eaff'],
].map(([theme,name,rating,position,country,stats,description,color],index)=>({theme,name,rating,position,country,stats,description,color,index}));
export const editions = [
 {id:'hybrid',label:'Hybrid',short:'Illustrated',description:'Detailed image artwork, sharp live type and editable card data. The illustrated collection.'},
 {id:'svg',label:'SVG + CSS',short:'Vector',description:'Scalable artwork built from SVG paths, gradients and CSS. No raster artwork.'},
 {id:'css',label:'CSS shapes',short:'CSS',description:'Artwork built from HTML and CSS gradients, polygons and curved paths. No SVG or raster images.'},
 {id:'basic',label:'CSS primitives',short:'Primitives',description:'Boxes, ellipses, borders and gradients. No SVG, images, masks, paths or polygon outlines.'},
];
export const countries={france:'France',norway:'Norway',spain:'Spain',japan:'Japan',brazil:'Brazil',england:'England',portugal:'Portugal',italy:'Italy',netherlands:'Netherlands',argentina:'Argentina',germany:'Germany',uruguay:'Uruguay'};
export const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
