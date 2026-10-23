// The artwork and text are already in the HTML. JavaScript only controls
// responsive scaling, the enlarged view, and the editable player names.
const gallery = document.getElementById('gallery');
const cards = [...gallery.querySelectorAll('.card')];
const collection = document.querySelector('.collection');
new ResizeObserver(([entry]) => collection.style.setProperty('--scene-scale', entry.contentRect.width / 1080)).observe(collection);
const dialog = document.getElementById('card-dialog');
const nameInput = document.getElementById('player-name');
let current = 0;
const detailCards = new Map();
function showCard(index) {
  current = (index + cards.length) % cards.length;
  const source = cards[current];
  let clone = detailCards.get(current);
  if (!clone) {
    clone = document.createElement('div');
    clone.className = source.className;
    clone.append(...[...source.children].map(element => element.cloneNode(true)));
    detailCards.set(current,clone);
  }
  document.getElementById('detail-artwork').replaceChildren(clone);
  document.getElementById('detail-title').textContent = source.dataset.title;
  document.getElementById('detail-description').textContent = source.dataset.description;
  document.getElementById('detail-number').textContent = `EDITION ${String(current + 1).padStart(2,'0')} / THE TWELVE`;
  document.getElementById('detail-position').textContent = `${String(current + 1).padStart(2,'0')} / 12`;
  nameInput.value = source.dataset.playerName || '';
  if (!dialog.open) dialog.showModal();
}
gallery.addEventListener('click', event => {
  const card = event.target.closest('.card');
  if (card) showCard(cards.indexOf(card));
});
nameInput.addEventListener('input', () => {
  const name = nameInput.value.trim().toUpperCase();
  cards[current].dataset.playerName = name;
  const displayedName = name || (cards[current].dataset.theme === 'comic' ? 'PLAYER NAME!' : 'PLAYER NAME');
  cards[current].querySelector('.card-name').textContent = displayedName;
  document.querySelector('#detail-artwork .card-name').textContent = displayedName;
});
document.getElementById('previous-card').addEventListener('click', () => showCard(current - 1));
document.getElementById('next-card').addEventListener('click', () => showCard(current + 1));
dialog.addEventListener('keydown', event => {
  if (event.target.matches('input')) return;
  if (event.key === 'ArrowRight') { event.preventDefault();showCard(current + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault();showCard(current - 1); }
});
document.getElementById('show-proof').addEventListener('click', () => document.getElementById('proof-dialog').showModal());
const syncScrollLock = () => { document.body.style.overflow = document.querySelector('dialog[open]') ? 'hidden' : ''; };
document.querySelectorAll('dialog').forEach(modal => {
  modal.querySelector('[data-close]').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  });
  modal.addEventListener('close', syncScrollLock);
  new MutationObserver(syncScrollLock).observe(modal,{attributes:true,attributeFilter:['open']});
});
window.cardCollection = { edition:'css',count:cards.length, themes:cards.map(c => c.dataset.theme) };
