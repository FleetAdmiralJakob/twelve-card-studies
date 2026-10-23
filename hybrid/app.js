(() => {
  'use strict';

  const gallery = document.getElementById('gallery');
  const cards = [...gallery.querySelectorAll('.card')];
  const collection = document.querySelector('.collection');
  const dialog = document.getElementById('card-dialog');
  const artwork = document.getElementById('detail-artwork');
  const stage = document.getElementById('detail-stage');
  const form = document.getElementById('card-editor');
  const nameInput = document.getElementById('player-name');
  const ratingInput = document.getElementById('player-rating');
  const positionInput = document.getElementById('player-position');
  const countryInput = document.getElementById('player-country');
  const statInputs = [...form.querySelectorAll('[data-stat]')];
  const saveStatus = document.getElementById('save-status');
  const feedback = document.getElementById('editor-feedback');
  const exportButton = document.getElementById('export-card');
  const exportStatus = document.getElementById('export-status');
  const resetCardButton = document.getElementById('reset-card');
  const resetAllButton = document.getElementById('reset-all');
  const confirmation = document.getElementById('reset-confirm');
  const confirmButton = document.getElementById('confirm-reset');
  const cancelButton = document.getElementById('cancel-reset');
  const mobile = window.matchMedia('(max-width: 760px)');
  const STORAGE_KEY = 'the-twelve.hybrid.v1';
  const countries = new Map([...countryInput.options].map(option => [option.value, option.textContent]));
  const positions = new Set([...positionInput.options].map(option => option.value));
  const outfieldStats = [['PAC', 'Pace'], ['SHO', 'Shooting'], ['PAS', 'Passing'], ['DRI', 'Dribbling'], ['DEF', 'Defending'], ['PHY', 'Physical']];
  const keeperStats = [['DIV', 'Diving'], ['HAN', 'Handling'], ['KIC', 'Kicking'], ['REF', 'Reflexes'], ['SPE', 'Speed'], ['POS', 'Positioning']];
  const detailCards = new Map();
  const textMeasure = document.createElement('canvas').getContext('2d');
  let current = 0;
  let opener = null;
  let resetScope = null;
  let resetOpener = null;
  let exporting = false;
  let exportTimer;

  const statLabels = state => state.position === 'GK' ? keeperStats : outfieldStats;
  const copyState = state => ({ name: state.name, rating: state.rating, position: state.position, country: state.country, stats: [...state.stats] });
  const normalizeName = value => Array.from(value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/gu, '').replace(/\s+/gu, ' ').trim().toUpperCase()).slice(0, 18).join('');
  const validNumber = value => Number.isInteger(value) && value >= 1 && value <= 99;

  // Defaults come from the static gallery, which the build derives from cards.mjs.
  // Never restore artwork URLs, geometry, HTML or CSS from persisted data.
  const defaults = cards.map(card => ({
    name: normalizeName(card.dataset.playerName || ''),
    rating: Number(card.querySelector('.card-rating strong').textContent),
    position: card.querySelector('.card-rating span').textContent.trim(),
    country: card.dataset.country || [...countries.keys()].find(country => card.querySelector(`.flag--${country}`)),
    stats: [...card.querySelectorAll('.card-stat strong')].map(stat => Number(stat.textContent)),
  }));
  const geometry = cards.map(card => {
    const slot = card.closest('.card-slot');
    return {
      width: Number(card.dataset.width) || parseFloat(slot.style.getPropertyValue('--w')) || 200,
      height: Number(card.dataset.height) || parseFloat(slot.style.getPropertyValue('--h')) || 320,
    };
  });
  const states = defaults.map(copyState);

  function validateStoredState(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    if (typeof value.name !== 'string' || Array.from(value.name).length > 18 || /[\u0000-\u001f\u007f]/u.test(value.name)) return null;
    if (!validNumber(value.rating) || !positions.has(value.position) || !countries.has(value.country)) return null;
    if (!Array.isArray(value.stats) || value.stats.length !== 6 || !value.stats.every(validNumber)) return null;
    return { name: normalizeName(value.name), rating: value.rating, position: value.position, country: value.country, stats: [...value.stats] };
  }

  function restoreEdits() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      if (raw.length > 64000) throw new Error('Invalid saved collection');
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1 || !saved.cards || typeof saved.cards !== 'object' || Array.isArray(saved.cards)) throw new Error('Invalid saved collection');
      let invalid = false;
      cards.forEach((card, index) => {
        if (!Object.hasOwn(saved.cards, card.dataset.theme)) return;
        const state = validateStoredState(saved.cards[card.dataset.theme]);
        if (state) states[index] = state;
        else invalid = true;
      });
      saveStatus.textContent = invalid ? 'Some saved changes could not be loaded. Those cards use their originals.' : 'Saved changes restored from this device.';
    } catch {
      saveStatus.textContent = 'Saved changes are unavailable. You can still edit your cards.';
    }
  }

  function exportState() {
    return { version: 1, cards: Object.fromEntries(cards.map((card, index) => [card.dataset.theme, copyState(states[index])])) };
  }

  function persistEdits() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(exportState()));
      saveStatus.textContent = 'Saved on this device.';
    } catch {
      saveStatus.textContent = 'Changes are kept for this visit only. Device storage is unavailable.';
    }
  }

  function getState(themeOrIndex = current) {
    const index = typeof themeOrIndex === 'string' ? cards.findIndex(card => card.dataset.theme === themeOrIndex) : themeOrIndex;
    if (!Number.isInteger(index) || !cards[index]) return null;
    return { theme: cards[index].dataset.theme, ...copyState(states[index]) };
  }

  function hasEdits(index) {
    const state = states[index];
    const original = defaults[index];
    return state.name !== original.name || state.rating !== original.rating || state.position !== original.position || state.country !== original.country || state.stats.some((value, i) => value !== original.stats[i]);
  }

  function syncResetButtons() {
    resetCardButton.disabled = !hasEdits(current);
    resetAllButton.disabled = !states.some((_, index) => hasEdits(index));
    document.getElementById('preview-edit-state').textContent = hasEdits(current) ? 'Your edition' : 'Original edition';
  }

  function updateCard(element, index) {
    const state = states[index];
    const labels = statLabels(state);
    element.dataset.playerName = state.name;
    element.dataset.country = state.country;
    element.querySelector('.card-name').textContent = state.name || (cards[index].dataset.theme === 'comic' ? 'PLAYER NAME!' : 'PLAYER NAME');
    fitName(element);
    element.querySelector('.card-rating strong').textContent = state.rating;
    element.querySelector('.card-rating span').textContent = state.position;
    element.querySelectorAll('.card-stat').forEach((stat, i) => {
      stat.querySelector('small').textContent = labels[i][0];
      stat.querySelector('strong').textContent = state.stats[i];
    });
    const flag = element.querySelector('.flag');
    flag.className = `flag flag--${state.country}`;
    flag.setAttribute('aria-label', countries.get(state.country));
    if (element.tagName === 'BUTTON') {
      element.setAttribute('aria-label', `${cards[index].dataset.title}${state.name ? `, ${state.name}` : ''}, ${state.rating} ${state.position}, ${countries.get(state.country)}. Edit card`);
    }
  }

  function fitName(element) {
    if (!element.isConnected || !textMeasure) return;
    const name = element.querySelector('.card-name');
    name.style.fontSize = '';
    const style = getComputedStyle(name);
    textMeasure.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const width = parseFloat(style.width),size = parseFloat(style.fontSize);
    const measured = textMeasure.measureText(name.textContent).width + (parseFloat(style.letterSpacing)||0)*Math.max(0,name.textContent.length-1);
    if (width > 0 && measured > width-2) name.style.fontSize = `${Math.max(12,size*(width-2)/measured)}px`;
  }

  function updatePreviewLabel() {
    const state = states[current];
    artwork.setAttribute('aria-label', `${cards[current].dataset.title}. ${state.name || 'Player name'}, ${state.rating} ${state.position}, ${countries.get(state.country)}. ${statLabels(state).map(([abbr, label], i) => `${label} ${state.stats[i]}`).join(', ')}.`);
  }

  function renderCard(index) {
    updateCard(cards[index], index);
    if (detailCards.has(index)) updateCard(detailCards.get(index), index);
    if (index === current) updatePreviewLabel();
  }

  function updateFormLabels() {
    const labels = statLabels(states[current]);
    statInputs.forEach((input, index) => {
      const label = input.previousElementSibling;
      label.querySelector('[data-stat-abbr]').textContent = labels[index][0];
      label.querySelector('[data-stat-name]').textContent = labels[index][1];
    });
    document.getElementById('stat-kind').textContent = states[current].position === 'GK' ? 'Goalkeeper' : 'Outfield';
  }

  function fillForm() {
    const state = states[current];
    nameInput.value = state.name;
    ratingInput.value = state.rating;
    positionInput.value = state.position;
    countryInput.value = state.country;
    statInputs.forEach((input, index) => { input.value = state.stats[index]; });
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    feedback.textContent = '';
    updateFormLabels();
    syncResetButtons();
  }

  function detailCard(index) {
    if (!detailCards.has(index)) {
      const source = cards[index];
      const clone = document.createElement('div');
      clone.className = source.className;
      Object.assign(clone.dataset, source.dataset);
      clone.dataset.width = geometry[index].width;
      clone.dataset.height = geometry[index].height;
      clone.append(...[...source.children].map(child => child.cloneNode(true)));
      const image = clone.querySelector('.card-art img');
      if (image) {
        image.loading = 'eager';
        // Detail images need a larger source than the gallery's responsive slot.
        image.sizes = `${Math.ceil(448 * geometry[index].width / geometry[index].height)}px`;
      }
      detailCards.set(index, clone);
      updateCard(clone, index);
    }
    return detailCards.get(index);
  }

  function sizeDetail() {
    if (!dialog.open || !detailCards.has(current)) return;
    const ratio = geometry[current].width / geometry[current].height;
    const style = window.getComputedStyle(stage);
    const availableWidth = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = Math.min(mobile.matches ? 320 : 448, Math.max(1, availableWidth) / ratio);
    const width = height * ratio;
    artwork.style.width = `${width}px`;
    artwork.style.height = `${height}px`;
    const clone = detailCards.get(current);
    clone.style.setProperty('--scale-x', width / 200);
    clone.style.setProperty('--scale-y', height / 320);
    const image = clone.querySelector('.card-art img');
    if (image) image.sizes = `${Math.ceil(width)}px`;
    clone.querySelectorAll('picture source').forEach(source => { source.sizes = `${Math.ceil(width)}px`; });
    fitName(clone);
  }

  function dismissReset(restoreFocus = false) {
    confirmation.hidden = true;
    resetScope = null;
    if (restoreFocus && resetOpener?.isConnected) resetOpener.focus({ preventScroll: true });
    resetOpener = null;
  }

  function showCard(index, trigger) {
    if (!cards.length) return;
    const wasOpen = dialog.open;
    if (!wasOpen) opener = trigger || document.activeElement;
    dismissReset();
    current = (index + cards.length) % cards.length;
    artwork.replaceChildren(detailCard(current));
    const source = cards[current];
    document.getElementById('detail-title').textContent = source.dataset.title;
    document.getElementById('detail-description').textContent = source.dataset.description;
    document.getElementById('detail-number').textContent = `CARD ${String(current + 1).padStart(2, '0')} / THE TWELVE`;
    document.getElementById('detail-position').textContent = `${String(current + 1).padStart(2, '0')} / ${cards.length}`;
    fillForm();
    updatePreviewLabel();
    if (!exporting) exportStatus.textContent = '';
    if (!wasOpen) {
      dialog.showModal();
      document.body.classList.add('editor-open');
    }
    sizeDetail();
  }

  function validateNumbers() {
    let firstInvalid = null;
    [ratingInput, ...statInputs].forEach(input => {
      const valid = input.validity.valid && validNumber(input.valueAsNumber);
      if (valid) input.removeAttribute('aria-invalid');
      else {
        input.setAttribute('aria-invalid', 'true');
        firstInvalid ||= input;
      }
    });
    feedback.textContent = firstInvalid ? 'Use a whole number from 1 to 99. The preview keeps your last valid value.' : '';
    return firstInvalid;
  }

  function onEdit(event) {
    const input = event.target;
    if (event.isComposing) return;
    const state = states[current];
    let changed = false;
    if (input === nameInput) {
      const name = normalizeName(input.value);
      changed = state.name !== name;
      state.name = name;
    } else if (input === positionInput && positions.has(input.value)) {
      changed = state.position !== input.value;
      state.position = input.value;
      updateFormLabels();
    } else if (input === countryInput && countries.has(input.value)) {
      changed = state.country !== input.value;
      state.country = input.value;
    } else if (input === ratingInput || input.matches('[data-stat]')) {
      validateNumbers();
      if (!input.validity.valid || !validNumber(input.valueAsNumber)) return;
      if (input === ratingInput) {
        changed = state.rating !== input.valueAsNumber;
        state.rating = input.valueAsNumber;
      } else {
        const index = Number(input.dataset.stat);
        changed = state.stats[index] !== input.valueAsNumber;
        state.stats[index] = input.valueAsNumber;
      }
    }
    if (!changed) return;
    dismissReset();
    renderCard(current);
    syncResetButtons();
    persistEdits();
  }

  gallery.addEventListener('click', event => {
    const card = event.target.closest('.card');
    const index = cards.indexOf(card);
    if (index !== -1) showCard(index, card);
  });
  document.getElementById('open-editor').addEventListener('click', event => showCard(current, event.currentTarget));
  document.getElementById('previous-card').addEventListener('click', () => showCard(current - 1));
  document.getElementById('next-card').addEventListener('click', () => showCard(current + 1));
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);
  nameInput.addEventListener('blur', () => { nameInput.value = states[current].name; });

  dialog.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, select, textarea, [contenteditable]:not([contenteditable="false"])') || resetScope) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showCard(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('editor-open');
    dismissReset();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  });

  function requestReset(scope, trigger) {
    resetScope = scope;
    resetOpener = trigger;
    document.getElementById('reset-message').textContent = scope === 'all' ? 'Reset all 12 cards? Your saved names, ratings, positions, countries and attributes will return to the originals.' : 'Reset this card? Its saved name, rating, position, country and attributes will return to the original.';
    confirmButton.textContent = scope === 'all' ? 'Reset all 12' : 'Reset this card';
    confirmation.hidden = false;
    cancelButton.focus({ preventScroll: false });
  }
  resetCardButton.addEventListener('click', event => requestReset('card', event.currentTarget));
  resetAllButton.addEventListener('click', event => requestReset('all', event.currentTarget));
  cancelButton.addEventListener('click', () => dismissReset(true));
  confirmButton.addEventListener('click', () => {
    if (!resetScope) return;
    const resetAll = resetScope === 'all';
    states.forEach((_, index) => {
      if (resetAll || index === current) {
        states[index] = copyState(defaults[index]);
        renderCard(index);
      }
    });
    dismissReset();
    fillForm();
    persistEdits();
    saveStatus.textContent = `${resetAll ? 'All 12 cards' : 'This card'} reset. ${saveStatus.textContent}`;
    nameInput.focus({ preventScroll: true });
  });

  function finishExport(result) {
    if (!exporting) return;
    window.clearTimeout(exportTimer);
    exporting = false;
    exportButton.disabled = false;
    exportButton.removeAttribute('aria-busy');
    exportButton.replaceChildren(document.createTextNode('Save card as PNG '));
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↓';
    exportButton.append(arrow);
    exportStatus.textContent = typeof result.message === 'string' ? result.message : (result.ok ? 'Your card is ready.' : 'Your card could not be saved. Please try again.');
  }
  exportButton.addEventListener('click', () => {
    if (exporting) return;
    const invalid = validateNumbers();
    if (invalid) { invalid.focus(); return; }
    exporting = true;
    exportButton.disabled = true;
    exportButton.setAttribute('aria-busy', 'true');
    exportButton.textContent = 'Preparing your card…';
    exportStatus.textContent = 'Preparing your PNG…';
    // One bounded timeout keeps the editor usable if an export module fails.
    exportTimer = window.setTimeout(() => finishExport({ ok: false, message: 'Saving took too long. Please try again.' }), 45000);
    document.dispatchEvent(new CustomEvent('hybrid:export', {
      detail: { card: detailCards.get(current), theme: cards[current].dataset.theme, state: getState() },
    }));
  });
  document.addEventListener('hybrid:export-result', event => finishExport(event.detail || {}));

  function sizeGallery() {
    collection.style.setProperty('--scene-scale', collection.getBoundingClientRect().width / 1080);
    cards.forEach((card,index) => {
      const slot = card.closest('.card-slot');
      if (mobile.matches) {
        const scale = Math.min(slot.clientWidth/geometry[index].width,300/geometry[index].height);
        const width = geometry[index].width*scale,height = geometry[index].height*scale;
        slot.style.setProperty('--mobile-width',`${width}px`);slot.style.setProperty('--mobile-height',`${height}px`);
        card.style.setProperty('--scale-x',width/200);card.style.setProperty('--scale-y',height/320);
      } else { card.style.removeProperty('--scale-x');card.style.removeProperty('--scale-y'); }
    });
  }
  restoreEdits();
  cards.forEach((_, index) => renderCard(index));
  sizeGallery();
  if ('ResizeObserver' in window) {
    new ResizeObserver(sizeGallery).observe(collection);
    new ResizeObserver(sizeDetail).observe(stage);
  } else {
    window.addEventListener('resize', () => { sizeGallery(); sizeDetail(); });
  }
  mobile.addEventListener('change', () => { sizeGallery();sizeDetail(); });
  document.fonts.ready.then(() => { cards.forEach(fitName);if(dialog.open)fitName(detailCard(current)); });
  window.cardCollection = { edition: 'hybrid', count: cards.length, themes: cards.map(card => card.dataset.theme), getState, exportState };
})();
