import { paperThemes } from './themes/paper.js';
import { electricThemes } from './themes/electric.js';
import { artisticThemes } from './themes/artistic.js';

const themes = { ...paperThemes, ...electricThemes, ...artisticThemes };
const stats = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
const keeperStats = ['DIV', 'HAN', 'KIC', 'REF', 'SPE', 'POS'];
const cards = [
  { theme: 'parchment', title: 'The Manuscript', rating: 92, position: 'ST', country: 'england', stats: [91, 93, 80, 89, 45, 87], box: [23, 47, 175, 266], description: 'Weathered parchment, scorched edges, and a portrait in restless charcoal. A legend, found in the margins.' },
  { theme: 'cyber', title: 'Neon Protocol', rating: 90, position: 'CAM', country: 'korea', stats: [88, 85, 92, 91, 40, 70], box: [221, 42, 175, 278], description: 'Electric cyan and ultraviolet traces map a digital player. Every line is part of the circuit.' },
  { theme: 'blueprint', title: 'Golden Ratio', rating: 88, position: 'CM', country: 'netherlands', stats: [78, 76, 88, 85, 72, 84], box: [421, 51, 176, 266], description: 'Gold construction lines on midnight drafting paper. A player distilled into perfect geometry.' },
  { theme: 'comic', title: 'Matchday Hero', rating: 89, position: 'RW', country: 'brazil', stats: [95, 88, 81, 90, 35, 74], box: [622, 40, 208, 283], description: 'Scarlet ink, blue halftones, and a flash of yellow. The beautiful game jumps straight off the page.' },
  { theme: 'forest', title: 'Emerald Relic', rating: 87, position: 'CB', country: 'italy', stats: [80, 56, 70, 68, 89, 86], box: [836, 39, 224, 292], description: 'An ancient stone frame reclaimed by moss and ivy. Inside, a guardian glows with emerald energy.' },
  { theme: 'doodle', title: 'Playground Legend', rating: 86, position: 'CDM', country: 'france', stats: [82, 70, 81, 78, 85, 87], box: [20, 352, 150, 297], description: 'Torn notebook paper, blue-pen daydreams, and a hand-drawn crown. For the love of playing.' },
  { theme: 'cathedral', title: 'The Cathedral', rating: 91, position: 'GK', country: 'spain', stats: [90, 89, 82, 93, 60, 90], box: [177, 350, 140, 301], description: 'Jewel-toned stained glass held in fine golden tracery. A rose window crowns the last line of defence.' },
  { theme: 'ink', title: 'Rising Sun', rating: 88, position: 'LM', country: 'korea', stats: [93, 82, 86, 89, 38, 72], box: [324, 360, 135, 290], description: 'A vermilion sun rises over handmade paper. Black brushstrokes carry the quiet force of the player.' },
  { theme: 'hologram', title: 'Future Vision', rating: 90, position: 'CF', country: 'portugal', stats: [91, 90, 89, 94, 42, 71], box: [469, 355, 145, 301], description: 'Concentric scanners, turquoise data streams, and a luminous silhouette. A glimpse of the next generation.' },
  { theme: 'steampunk', title: 'The Alchemist', rating: 85, position: 'RB', country: 'england', stats: [92, 60, 75, 78, 82, 80], box: [620, 351, 143, 311], description: 'Aged brass, weathered timber, and a chain-wrapped frame. An industrial relic with a player at its heart.' },
  { theme: 'cosmic', title: 'Event Horizon', rating: 92, position: 'CAM', country: 'argentina', stats: [90, 91, 94, 93, 46, 75], box: [770, 353, 145, 305], description: 'Violet nebulae illuminate a figure in deep space. The galaxy is enclosed in a faceted crystal.' },
  { theme: 'arcade', title: 'Extra Time', rating: 87, position: 'ST', country: 'germany', stats: [89, 88, 76, 87, 40, 78], box: [921, 362, 140, 291], description: 'A miniature arcade cabinet, complete with pixel football, glowing trim, and red controls. One more game.' },
];

const emblem = `<svg viewBox="0 0 28 32" aria-hidden="true"><path d="M3 3L14 5 25 3 24 18 14 28 4 18Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m8 12 5 4 7-8-2 10-5 5 1-7-6 1 3-3Z" fill="currentColor"/><path d="M4 9h5m13 14-3-1" stroke="currentColor"/></svg>`;
const cannon = `<svg viewBox="0 0 40 24" aria-hidden="true"><path d="m4 9 30-4 2 4-30 5Z" fill="currentColor"/><path d="m8 14-4 5 20-3 6-6m-15 5 4-5" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="15" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m33 4 5-2M1 9l4 1" stroke="currentColor"/></svg>`;
const invader = `<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 6h3v3h12V6h3v3h-3v3h6v9h-3v-6h-3v6h-3v-3h-6v3H8v-6H5v6H2v-9h6V9H5Zm6 6v3h3v-3Zm6 0v3h3v-3ZM5 22h6v3H5Zm15 0h6v3h-6Z" fill="currentColor"/></svg>`;
const sun = `<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 1v6m0 14v6M1 14h6m14 0h6M5 5l4 4m10 10 4 4M23 5l-4 4M9 19l-4 4" stroke="currentColor" stroke-width="2"/></svg>`;
const noEmblem = new Set(['comic', 'doodle', 'ink', 'cosmic', 'arcade']);
// Keep the original vector drawings, but let the browser cache each as one
// isolated image rather than attaching 17,000 ornamental nodes to the page.
const artworkSources = new Map();
function artworkSource(theme) {
  if (!artworkSources.has(theme)) {
    let source = themes[theme].art;
    if (!source.includes('xmlns=')) source = source.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    // Preserve curls and chain links that overhang the original view box.
    source = source.replace('viewBox="0 0 200 320"', 'viewBox="-24 -24 248 368"');
    artworkSources.set(theme, `data:image/svg+xml,${encodeURIComponent(source)}`);
  }
  return artworkSources.get(theme);
}

function makeCard(card, index, detail = false) {
  const element = document.createElement(detail ? 'div' : 'button');
  element.className = `card card--${card.theme}`;
  if (!detail) {
    element.type = 'button';
    element.setAttribute('aria-label', `${card.title}, ${card.rating} ${card.position}. View card`);
    element.setAttribute('aria-haspopup', 'dialog');
    element.dataset.cardIndex = index;
  }
  const labels = card.position === 'GK' ? keeperStats : stats;
  element.innerHTML = `<div class="card-art" aria-hidden="true"><img src="${artworkSource(card.theme)}" alt="" width="200" height="320" decoding="async" loading="${detail || index < 2 ? 'eager' : 'lazy'}" draggable="false"></div>
    <div class="card-info" aria-hidden="true">
      <div class="card-rating"><strong>${card.rating}</strong><span>${card.position}</span></div>
      ${noEmblem.has(card.theme) ? '' : `<div class="card-emblem">${card.theme === 'parchment' ? cannon : card.theme === 'cyber' ? invader : card.theme === 'cathedral' ? sun : emblem}</div>`}
      <p class="card-name"></p>
      <div class="card-stats">${card.stats.map((value, i) => `<div class="card-stat"><small>${labels[i]}</small><strong>${value}</strong></div>`).join('')}</div>
      <div class="card-flag"><i class="flag flag--${card.country}"></i></div>
    </div>`;
  element.querySelector('.card-name').textContent = card.name || (card.theme === 'comic' ? 'PLAYER NAME!' : 'PLAYER NAME');
  return element;
}

const gallery = document.getElementById('gallery');
cards.forEach((card, i) => {
  const [x, y, w, h] = card.box;
  const slot = document.createElement('div');
  slot.className = 'card-slot';
  slot.dataset.row = i < 5 ? 'top' : 'bottom';
  slot.style.cssText = `--x:${x}px;--y:${y}px;--w:${w}px;--h:${h}px;--scale-x:${w / 200};--scale-y:${h / 320};`;
  const motion = document.createElement('div');
  motion.className = 'card-motion';
  motion.append(makeCard(card, i));
  slot.append(motion);
  gallery.append(slot);
});

const collection = document.querySelector('.collection');
new ResizeObserver(([entry]) => {
  collection.style.setProperty('--scene-scale', entry.contentRect.width / 1080);
}).observe(collection);

const cardDialog = document.getElementById('card-dialog');
const nameInput = document.getElementById('player-name');
let currentCard = 0;
const detailCards = new Map();
function detailCard(index) {
  if (!detailCards.has(index)) {
    const source = gallery.querySelector(`[data-card-index="${index}"]`);
    const enlarged = document.createElement('div');
    enlarged.className = source.className;
    enlarged.append(...[...source.children].map(child => child.cloneNode(true)));
    enlarged.querySelector('.card-art img').loading = 'eager';
    detailCards.set(index,enlarged);
  }
  return detailCards.get(index);
}
// Detail nodes are cached on first use. Background decoding of twelve
// detached SVGs competed with painting the visible gallery.
function showCard(index) {
  currentCard = (index + cards.length) % cards.length;
  const card = cards[currentCard];
  document.getElementById('detail-artwork').replaceChildren(detailCard(currentCard));
  document.getElementById('detail-title').textContent = card.title;
  document.getElementById('detail-description').textContent = card.description;
  document.getElementById('detail-number').textContent = `EDITION ${String(currentCard + 1).padStart(2, '0')} / THE TWELVE`;
  document.getElementById('detail-position').textContent = `${String(currentCard + 1).padStart(2, '0')} / 12`;
  nameInput.value = card.name || '';
  if (!cardDialog.open) cardDialog.showModal();
}
gallery.addEventListener('click', event => {
  const card = event.target.closest('[data-card-index]');
  if (card) showCard(Number(card.dataset.cardIndex));
});
nameInput.addEventListener('input', () => {
  const value = nameInput.value.trim().toUpperCase();
  cards[currentCard].name = value;
  const displayedName = value || (cards[currentCard].theme === 'comic' ? 'PLAYER NAME!' : 'PLAYER NAME');
  document.querySelector('#detail-artwork .card-name').textContent = displayedName;
  gallery.querySelector(`[data-card-index="${currentCard}"] .card-name`).textContent = displayedName;
});
document.getElementById('previous-card').addEventListener('click', () => showCard(currentCard - 1));
document.getElementById('next-card').addEventListener('click', () => showCard(currentCard + 1));
cardDialog.addEventListener('keydown', event => {
  if (event.target.matches('input')) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); showCard(currentCard + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showCard(currentCard - 1); }
});
document.getElementById('view-reference').addEventListener('click', () => {
  const dialog = document.getElementById('reference-dialog');
  const image = dialog.querySelector('img');
  if (!image.src) image.src = image.dataset.src;
  dialog.showModal();
});
const syncScrollLock = () => { document.body.style.overflow = document.querySelector('dialog[open]') ? 'hidden' : ''; };
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  } });
  dialog.addEventListener('close', syncScrollLock);
  new MutationObserver(syncScrollLock).observe(dialog, { attributes: true, attributeFilter: ['open'] });
});

window.cardCollection = { count: cards.length, themes: cards.map(card => card.theme) };
