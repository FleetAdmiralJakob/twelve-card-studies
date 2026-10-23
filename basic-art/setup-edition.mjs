import {readFile,writeFile} from 'node:fs/promises';
const nav=(edition)=>`<nav class="edition-nav" aria-label="Website edition" style="flex-wrap:wrap;row-gap:0;white-space:nowrap">${[['svg','/','V1 · SVG'],['css','/css/','V2 · Polygone'],['basic','/basic/','V3 · Grundformen'],['hybrid','/hybrid/','V4 · Hybrid']].map(([id,url,label])=>edition===id?`<span aria-current="page">${label}</span>`:`<a href="${url}">${label}</a>`).join('')}<a href="/compare/">Benchmarks</a></nav>`;
let original=await readFile('index.html','utf8');
original=original.replace(/<nav class="edition-nav"[\s\S]*?<\/nav>/,nav('svg')).replace('<title>The Twelve — Football Card Collection</title>','<title>The Twelve — SVG Edition</title>');
if(!original.includes('href="assets/editions.css"'))original=original.replace('</head>','  <link rel="stylesheet" href="assets/editions.css">\n</head>');
await writeFile('index.html',original);
let second=await readFile('css-art/build.mjs','utf8');
second=second.replace(/<nav class="edition-nav"[\s\S]*?<\/nav>/,nav('css'));
second=second.replace("const css = (await Promise.all(styles.map(name => readFile(`css-art/${name}.css`,'utf8')))).join('\\n');", "const metadata=(await Promise.all(['paper','electric','artistic'].map(name=>readFile(`themes/${name}.css`,'utf8')))).join('\\n');\nawait writeFile('css-art/metadata.css',metadata);\nconst css = (await Promise.all(styles.map(name => readFile(`css-art/${name}.css`,'utf8')))).join('\\n')+'\\n'+await readFile('assets/editions.css','utf8');");
await writeFile('css-art/build.mjs',second);
let third=second
 .replace("from './cards.mjs'","from '../css-art/cards.mjs'")
 .replaceAll('paperCssThemes','basicPaperThemes').replaceAll('electricCssThemes','basicElectricThemes').replaceAll('artisticCssThemes','basicArtisticThemes')
 .replace("const styles = ['base','metadata','flags','paper','electric','artistic','edition'];", "const styles = ['flags','paper','electric','artistic','edition'];")
 .replace(/const metadata=[\s\S]*?const css = [^\n]+;/, "const css = (await readFile('css-art/base.css','utf8')).replace(/clip:\\s*rect\\([^)]*\\);/g,'opacity:0;')+'\\n'+await readFile('css-art/metadata.css','utf8')+'\\n'+(await Promise.all(styles.map(name=>readFile(`basic-art/${name}.css`,'utf8')))).join('\\n')+'\\n'+await readFile('assets/editions.css','utf8');")
 .replace(/if \(\/(?:[^\n]+)CSS artwork audit failed[^\n]+\n/, '')
 .replace("const gallery = cards.map", "if (/clip-path|(?:^|[;{\\s])(?:-webkit-)?mask(?:-[a-z]+)?\\s*:|(?:polygon|path|shape|url|paint)\\s*\\(|data:image/i.test(css)) throw new Error('Basic CSS audit failed: forbidden drawing primitive');\nconst gallery = cards.map")
 .replaceAll('css-shield','basic-shield')
 .replace(nav('css'),nav('basic'))
 .replaceAll('CSS Edition','CSS Primitives Edition').replaceAll('CSS EDITION','CSS PRIMITIVES').replaceAll('CSS edition','CSS primitives edition')
 .replace('native HTML and CSS shapes, textures, gradients and borders.','CSS boxes, rounded corners, gradients and borders. No SVG, images, masks or polygon paths.')
 .replace('<h2 id="proof-title">Drawn in CSS</h2>','<h2 id="proof-title">CSS ohne Pfade</h2>')
 .replace('The paper, portraits, glass, circuitry, stonework, stars and flags are native HTML elements styled with CSS gradients, borders, polygons and shadows.','Diese Edition zeichnet Karten und Flaggen mit CSS-Flächen, Rundungen, Verläufen, Rahmen und Schatten. Keine SVGs, Canvas, Bilder, Clip-Pfade, Polygone, Masken oder nachgezeichneten Punktlisten.')
 .replace('SVG, canvas or image artwork','SVG, Bilder oder Formpfade')
 .replace('The illustrations are included in the HTML. JavaScript handles the enlarged view, names and responsive scaling. Textures are procedural patterns, not an encoded copy of the reference image.','Die Illustrationen stehen statisch im HTML. JavaScript bedient Vergrößerung, Namen und Layout. Normale CSS-Grundformen bleiben erlaubt; das ist keine Behauptung, dass CSS mathematisch frei von Geometrie wäre. Texturen sind prozedural und keine kodierte Kopie der Vorlage.')
 .replaceAll("mkdir('css'","mkdir('basic'").replaceAll("'css/index.html'","'basic/index.html'")
 .replaceAll("readFile('css/app.js'","readFile('basic/app.js'")
 .replaceAll('dist/css','dist/basic');
third=third.replace('imageArtwork:0,bitmapEncoding:false','imageArtwork:0,clipPaths:0,masks:0,bitmapEncoding:false');
await writeFile('basic-art/build.mjs',third);
let basicStyles=(await readFile('css-art/edition.css','utf8')).replace(/\.css-shield[^\n]*\n/g,'');
basicStyles+=`\n.basic-shield{position:absolute;inset:0;border:1px solid currentColor;border-radius:5% 5% 48% 48%}.basic-shield::before{content:'';position:absolute;left:30%;top:25%;width:45%;height:35%;border-left:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-45deg)}\n`;
await writeFile('basic-art/edition.css',basicStyles);
await writeFile('basic/app.js',(await readFile('css/app.js','utf8')).replace("edition:'css'","edition:'basic'"));
let build=await readFile('build.mjs','utf8');
build=build.replace("'themes/artistic.css'];","'themes/artistic.css', 'assets/editions.css'];");
build=build.replace("await cp('css','dist/css',{recursive:true});","await cp('css','dist/css',{recursive:true});\nawait import('./basic-art/build.mjs');\nawait cp('basic','dist/basic',{recursive:true});");
build=build.replace('Built both editions.','Built three editions.');
await writeFile('build.mjs',build);
