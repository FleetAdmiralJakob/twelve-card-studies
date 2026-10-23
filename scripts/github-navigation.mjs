import assert from 'node:assert/strict';

export const repositoryURL = 'https://github.com/FleetAdmiralJakob/twelve-card-studies';

// Publication navigation is separate from measured builds. Downloads and
// benchmark data retain their original bytes and fingerprints.
const pages = new Map([
  ['index.html', ''],
  ['collections/index.html', ''],
  ['original/index.html', 'themes'],
  ['css/index.html', 'css-art'],
  ['basic/index.html', 'basic-art'],
  ['hybrid/index.html', 'hybrid-art'],
  ['revision-2/svg/index.html', 'revision-2/art'],
  ['revision-2/css/index.html', 'revision-2/art'],
  ['revision-2/basic/index.html', 'revision-2/art'],
  ['revision-2/hybrid/index.html', 'revision-2'],
  ['bench/index.html', 'benchmarks'],
  ['compare/index.html', 'benchmarks'],
  ['revision-2/benchmarks/index.html', 'revision-2/benchmarks'],
]);
const reports = new Set(['bench/index.html', 'compare/index.html', 'revision-2/benchmarks/index.html']);

function replaceOnce(html, pattern, transform, label) {
  const matches = [...html.matchAll(new RegExp(pattern.source, 'g'))];
  assert.equal(matches.length, 1, `${label}: expected exactly one navigation region`);
  const match = matches[0];
  return html.slice(0, match.index) + transform(match[0]) + html.slice(match.index + match[0].length);
}

function link(kind, href, label) {
  return `<a data-repository-link="${kind}" href="${href}" target="_blank" rel="noopener noreferrer" style="white-space:nowrap">${label} <span aria-hidden="true">↗</span></a>`;
}

export function publishedGithubHTML(bytes, target) {
  if (!pages.has(target)) return bytes;
  let html = Buffer.from(bytes).toString('utf8');
  assert(!html.includes('data-repository-link='), `${target}: repository navigation already applied`);
  const github = link('github', repositoryURL, 'GitHub');
  const folder = pages.get(target);
  const source = link('source', `${repositoryURL}/tree/main${folder ? '/' + folder : ''}`, 'View source');
  const isHub = target === 'index.html' || target === 'collections/index.html';

  if (isHub) {
    html = replaceOnce(html, /<header\b[^>]*>[\s\S]*?<\/header>/, header => {
      header = header.replace('<header>', '<header style="flex-wrap:wrap;gap:16px">');
      return replaceOnce(header, /<nav\b[^>]*class="top-nav"[^>]*>[\s\S]*?<\/nav>/,
        nav => nav.replace('</nav>', `${github}</nav>`), `${target} header`);
    }, `${target} header`);
  }

  html = replaceOnce(html, /<footer\b[^>]*>[\s\S]*?<\/footer>/, footer => {
    if (!isHub && !reports.has(target)) {
      return replaceOnce(footer, /<nav\b[^>]*class="(?:edition-nav|footer-links)"[^>]*>[\s\S]*?<\/nav>/,
        nav => nav.replace('</nav>', `${github}${source}</nav>`), `${target} footer`);
    }
    // The historical report did not wrap its footer; keep added links usable
    // on narrow screens without touching stylesheets or measured artwork.
    footer = footer.replace('<footer>', '<footer style="flex-wrap:wrap">');
    const nav = `<nav aria-label="Project source" style="display:flex;flex-wrap:wrap;gap:12px 20px;margin:0">${github}${source}</nav>`;
    const disclosure = reports.has(target)
      ? '<p data-repository-disclosure style="flex-basis:100%;margin:0">Repository navigation was added after timing; measured artwork, interaction code and benchmark records are unchanged. Published pages include these links; source downloads retain the validated build.</p>'
      : '';
    return footer.replace('</footer>', `${nav}${disclosure}</footer>`);
  }, `${target} footer`);
  return Buffer.from(html);
}
