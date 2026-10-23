import { mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'assets', 'themes']) {
  await cp(file, path.join('dist', file), { recursive: true });
}
let html = await readFile('index.html', 'utf8');
const styles = ['assets/fonts.css', 'styles.css', 'assets/flags.css', 'themes/paper.css', 'themes/electric.css', 'themes/artistic.css', 'assets/editions.css'];
for (const file of styles) {
  let css = await readFile(file, 'utf8');
  if (file === 'assets/fonts.css') {
    const matches = [...css.matchAll(/url\('([^']+)'\)/g)];
    for (const match of matches) {
      const data = await readFile(path.join('assets', match[1]));
      css = css.replace(match[0], `url('data:font/woff2;base64,${data.toString('base64')}')`);
    }
  }
  if (file === 'assets/flags.css') {
    for (const match of [...css.matchAll(/url\('([^']+)'\)/g)]) {
      const data = await readFile(path.join('assets', match[1]));
      css = css.replace(match[0], `url('data:image/svg+xml;base64,${data.toString('base64')}')`);
    }
  }
  html = html.replace(`<link rel="stylesheet" href="${file}">`, `<style>${css}</style>`);
}
// Each artwork module has its own scope, as in the normal ES module application.
const modules = [];
for (const [file, name] of [['paper', 'paperThemes'], ['electric', 'electricThemes'], ['artistic', 'artisticThemes']]) {
  const source = (await readFile(`themes/${file}.js`, 'utf8')).replace(/export const /g, 'const ');
  modules.push(`const ${name} = (() => {\n${source}\nreturn ${name};\n})();`);
}
const script = modules.join('\n') + '\n' + (await readFile('app.js', 'utf8')).replace(/^import .+;\s*$/gm, '');
html = html.replace('<script type="module" src="app.js"></script>', `<script type="module">${script}</script>`);
// Reference imagery is requested only when opened on the hosted edition.
const hosted = html.replace('data-src="assets/reference.png"','data-src="/reference"');
await writeFile('dist/hosted.html',hosted);
await writeFile('dist/hosted.html.br',brotliCompressSync(hosted));
await writeFile('dist/hosted.html.gz',gzipSync(hosted));
const reference = await readFile('assets/reference.png');
html = html.replace('data-src="assets/reference.png"', `data-src="data:image/png;base64,${reference.toString('base64')}"`);
await writeFile('dist/standalone.html', html);
await import('./css-art/build.mjs');
await cp('css','dist/css',{recursive:true});
await import('./basic-art/build.mjs');
await cp('basic','dist/basic',{recursive:true});
await import('./hybrid-art/build.mjs');
console.log(`Built four editions. Original hosted: ${Buffer.byteLength(hosted)} bytes, ${brotliCompressSync(hosted).length} Brotli bytes.`);
