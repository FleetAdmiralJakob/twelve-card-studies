import assert from 'node:assert/strict';

// This is applied only to the published copy. bench/index.html and its embedded
// measurement records remain immutable inputs, as does bench/data.json.
export function publishedBenchHTML(original) {
  const replacements = [
    ['<a href="/">V1 · SVG</a>', '<a href="/original/">V1 · SVG</a>'],
    ['<a href="/">Edition öffnen ↗</a>', '<a href="/original/">Edition öffnen ↗</a>'],
    ['<nav>', '<nav><a href="/collections/">All collections</a><a href="/revision-2/svg/">Revision 2</a>'],
    ['</nav>', '</nav><p class="notice" id="navigation-history">Navigation aktualisiert: Die Links führen zu den aktuellen Sammlungen. Alle Messwerte und Ergebnisdaten stammen unverändert aus dem historischen Bericht; für diese Navigationsänderung wurden keine Benchmarks erneut ausgeführt.</p>'],
  ];
  let html = original.toString('utf8');
  for (const [before, after] of replacements) {
    assert.equal(html.split(before).length, 2, `Historical benchmark navigation marker must occur once: ${before}`);
    assert(!html.includes(after), `Historical benchmark input already contains updated navigation: ${after}`);
    html = html.replace(before, after);
  }
  let restored = html;
  for (const [before, after] of [...replacements].reverse()) restored = restored.replace(after, before);
  assert(Buffer.from(restored).equals(original), 'Published historical report changed beyond its explicit navigation substitutions');
  return Buffer.from(html);
}
