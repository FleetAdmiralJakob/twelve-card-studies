(() => {
  'use strict';

  // Artwork and overlay CSS share this authored coordinate system. The output
  // aspect comes from the reference silhouette, not the dialog's screen size.
  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 320;
  const OUTPUT_HEIGHT = 1280;
  const TEXT_SELECTOR = '.card-rating strong, .card-rating span, .card-name, .card-stat small, .card-stat strong';
  let exporting = false;

  class ExportError extends Error {}
  const number = (value, fallback = 0) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;

  function result(ok, message) {
    document.dispatchEvent(new CustomEvent('hybrid:export-result', { detail: { ok, message } }));
  }

  function box(element, style) {
    const borderX = number(style.borderLeftWidth) + number(style.borderRightWidth);
    const borderY = number(style.borderTopWidth) + number(style.borderBottomWidth);
    const paddingX = number(style.paddingLeft) + number(style.paddingRight);
    const paddingY = number(style.paddingTop) + number(style.paddingBottom);
    return {
      width: number(style.width, element.offsetWidth) + (style.boxSizing === 'border-box' ? 0 : borderX + paddingX),
      height: number(style.height, element.offsetHeight) + (style.boxSizing === 'border-box' ? 0 : borderY + paddingY),
      insetX: number(style.borderLeftWidth) + number(style.paddingLeft),
      insetY: number(style.borderTopWidth) + number(style.paddingTop),
      insetRight: number(style.borderRightWidth) + number(style.paddingRight),
    };
  }

  function position(element, card) {
    let x = 0;
    let y = 0;
    let node = element;
    // A static grid/flex child may skip its DOM parent here. Walking DOM
    // parents instead would count the stats/rating placement twice.
    while (node && node !== card) {
      const style = getComputedStyle(node);
      const absolute = style.position === 'absolute';
      x += absolute && style.left.endsWith('px') ? number(style.left) + number(style.marginLeft) : node.offsetLeft;
      y += absolute && style.top.endsWith('px') ? number(style.top) + number(style.marginTop) : node.offsetTop;
      const parent = node.offsetParent;
      if (parent && parent !== card) {
        x += parent.clientLeft - parent.scrollLeft;
        y += parent.clientTop - parent.scrollTop;
      }
      node = parent;
    }
    if (node !== card) throw new ExportError('Keep the card open while preparing its PNG.');
    return { x, y };
  }

  function matrix(transform) {
    const Matrix = window.DOMMatrixReadOnly || window.DOMMatrix;
    if (Matrix) {
      const value = new Matrix(transform);
      if (!value.is2D) throw new ExportError('This card uses a transform that PNG export cannot render.');
      return [value.a, value.b, value.c, value.d, value.e, value.f];
    }
    const match = /^matrix\(([^)]+)\)$/.exec(transform);
    const values = match && match[1].split(',').map(Number);
    if (!values || values.length !== 6 || !values.every(Number.isFinite)) {
      throw new ExportError('This browser cannot render the card transforms.');
    }
    return values;
  }

  function geometry(element, card) {
    const style = getComputedStyle(element);
    const bounds = { ...position(element, card), ...box(element, style) };
    const transforms = [];
    let opacity = 1;
    for (let node = element; node && node !== card; node = node.parentElement) {
      const computed = getComputedStyle(node);
      if (computed.display === 'none' || computed.visibility === 'hidden') opacity = 0;
      opacity *= number(computed.opacity, 1);
      if (computed.transform !== 'none') {
        const origin = computed.transformOrigin.split(/\s+/).map(parseFloat);
        const point = position(node, card);
        transforms.unshift({ x: point.x + origin[0], y: point.y + origin[1], matrix: matrix(computed.transform) });
      }
    }
    return { ...bounds, transforms, opacity };
  }

  function applyGeometry(context, item) {
    context.globalAlpha = item.opacity;
    for (const transform of item.transforms) {
      context.translate(transform.x, transform.y);
      context.transform(...transform.matrix);
      context.translate(-transform.x, -transform.y);
    }
  }

  function textSnapshot(element, card) {
    const style = getComputedStyle(element);
    let text = element.textContent.replace(/\s+/g, ' ').trim();
    if (style.textTransform === 'uppercase') text = text.toUpperCase();
    if (style.textTransform === 'lowercase') text = text.toLowerCase();
    return {
      ...geometry(element, card), text,
      font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
      fontSize: number(style.fontSize, 16), lineHeight: number(style.lineHeight, number(style.fontSize, 16) * 1.2),
      color: style.color, spacing: number(style.letterSpacing), align: style.textAlign,
      background: style.backgroundColor,
      direction: style.direction, kerning: style.fontKerning,
      clip: style.overflowX === 'hidden' || style.overflowX === 'clip',
    };
  }

  function graphemes(text) {
    return typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), part => part.segment)
      : Array.from(text);
  }

  function drawText(context, item) {
    if (!item.text || !item.opacity) return;
    context.save();
    applyGeometry(context, item);
    if (item.background && item.background !== 'rgba(0, 0, 0, 0)' && item.background !== 'transparent') {
      context.fillStyle = item.background;
      context.fillRect(item.x,item.y,item.width,item.height);
    }
    if (item.clip) {
      context.beginPath();
      context.rect(item.x, item.y, item.width, item.height);
      context.clip();
    }
    context.font = item.font;
    context.fillStyle = item.color;
    context.textBaseline = 'alphabetic';
    context.textAlign = 'left';
    context.direction = item.direction;
    if ('fontKerning' in context) context.fontKerning = item.kerning;
    const nativeSpacing = 'letterSpacing' in context;
    if (nativeSpacing) context.letterSpacing = `${item.spacing}px`;
    const letters = nativeSpacing ? null : graphemes(item.text);
    const width = context.measureText(item.text).width + (nativeSpacing ? 0 : letters.length * item.spacing);
    const contentWidth = item.width - item.insetX - item.insetRight;
    let x = item.x + item.insetX;
    const align = item.align === 'start' ? (item.direction === 'rtl' ? 'right' : 'left')
      : item.align === 'end' ? (item.direction === 'rtl' ? 'left' : 'right') : item.align;
    if (align === 'center') x += (contentWidth - width) / 2;
    if (align === 'right') x += contentWidth - width;
    // Font bounds, rather than the particular letters' ink bounds, preserve a
    // shared baseline for numbers, capitals, and names with descenders.
    const metrics = context.measureText('Hg');
    const ascent = metrics.fontBoundingBoxAscent ?? metrics.emHeightAscent ?? item.fontSize * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? metrics.emHeightDescent ?? item.fontSize * 0.2;
    const baseline = item.y + item.insetY + (item.lineHeight - ascent - descent) / 2 + ascent;
    if (nativeSpacing || !item.spacing) {
      context.fillText(item.text, x, baseline);
    } else {
      let prefix = '';
      letters.forEach((letter, index) => {
        prefix += letter;
        const advance = context.measureText(prefix).width - context.measureText(letter).width;
        context.fillText(letter, x + advance + index * item.spacing, baseline);
      });
    }
    context.restore();
  }

  function permittedSource(source) {
    if (!source) return null;
    const url = new URL(source, document.baseURI);
    if (url.protocol === 'data:') return /^data:image\//i.test(source) ? url.href : null;
    if (url.protocol === 'blob:') return url.origin === location.origin ? url.href : null;
    if (url.protocol === 'file:') return location.protocol === 'file:' ? url.href : null;
    return /^https?:$/.test(url.protocol) && url.origin === location.origin ? url.href : null;
  }

  function imageSources(image, galleryImage) {
    const candidates = [];
    // Whitespace separates srcset descriptors; commas may occur inside data
    // URLs, so splitting srcset on every comma would corrupt inline exports.
    for (const match of image.srcset.matchAll(/(?:^|,\s*)(\S+)\s+(\d+(?:\.\d+)?)([wx])(?=\s*(?:,|$))/g)) {
      candidates.push({ src: match[1], size: Number(match[2]) * (match[3] === 'x' ? image.width : 1) });
    }
    candidates.sort((a, b) => b.size - a.size);
    return [...new Set([
      image.dataset.highRes, galleryImage?.dataset.highRes,
      ...candidates.map(candidate => candidate.src), image.currentSrc, image.src,
    ].filter(Boolean).map(permittedSource).filter(Boolean))];
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const timer = setTimeout(() => finish(new ExportError('The card image took too long to load. Please try again.')), 15000);
      function finish(error) {
        clearTimeout(timer);
        image.onload = image.onerror = null;
        if (error) reject(error);
        else resolve(image);
      }
      image.onload = () => image.naturalWidth && image.naturalHeight
        ? finish() : finish(new ExportError('The card image could not be decoded.'));
      image.onerror = () => finish(new ExportError('The card image could not be loaded.'));
      image.src = source;
    });
  }

  async function loadArtwork(sources) {
    for (const source of sources) {
      try { return await loadImage(source); } catch { /* Try the displayed image if a high-resolution asset is missing. */ }
    }
    throw new ExportError('The card artwork could not be loaded. Reopen the card and try again.');
  }

  function flagSnapshot(card, rect) {
    const element = card.querySelector('.card-flag .flag');
    if (!element) return null;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return null;
    const match = /^url\((?:"([\s\S]*)"|'([\s\S]*)'|([\s\S]*))\)$/.exec(style.backgroundImage);
    const source = match && permittedSource(match[1] ?? match[2] ?? match[3]);
    if (!source) throw new ExportError('The country flag could not be loaded for export.');
    const flagRect = element.getBoundingClientRect();
    return {
      source,
      centerX: (flagRect.left + flagRect.width / 2 - rect.left) / rect.width * CARD_WIDTH,
      y: (flagRect.top - rect.top) / rect.height * CARD_HEIGHT,
      height: flagRect.height / rect.height * CARD_HEIGHT,
    };
  }

  function capture(card, theme) {
    if (!(card instanceof HTMLElement) || !card.isConnected) throw new ExportError('Open a card before exporting its PNG.');
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) throw new ExportError('Open a card before exporting its PNG.');
    const image = card.querySelector('.card-art img');
    if (!image) throw new ExportError('This card has no artwork to export.');
    const gallery = Array.from(document.querySelectorAll('.card[data-width][data-height]')).find(candidate =>
      candidate !== card && (candidate.dataset.theme === theme || Array.from(candidate.classList).includes(`card--${theme}`)));
    const reference = [card, gallery].find(candidate => Number(candidate?.dataset.width) > 0 && Number(candidate?.dataset.height) > 0);
    const ratio = reference ? Number(reference.dataset.width) / Number(reference.dataset.height) : rect.width / rect.height;
    const width = Math.round(OUTPUT_HEIGHT * ratio);
    if (!Number.isFinite(width) || width < 1 || width > 8192) throw new ExportError('The card dimensions are not valid for export.');
    return {
      width, height: OUTPUT_HEIGHT, artwork: geometry(image, card),
      sources: imageSources(image, gallery?.querySelector('.card-art img')),
      texts: Array.from(card.querySelectorAll(TEXT_SELECTOR), element => textSnapshot(element, card)),
      flag: flagSnapshot(card, rect),
    };
  }

  function pngBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new ExportError('The browser could not create the PNG. Please try again.')), 'image/png');
    });
  }

  function download(blob, theme) {
    const slug = String(theme || 'card').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'card';
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hybrid-${slug}.png`;
    link.hidden = true;
    document.body.append(link);
    try { link.click(); }
    finally {
      link.remove();
      // Give Safari and other download handlers time to consume the blob.
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
  }

  async function exportCard(detail) {
    if (exporting) return; // One completion event releases the UI's busy state.
    exporting = true;
    let outcome;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext?.('2d');
      if (!context || typeof canvas.toBlob !== 'function' || typeof URL.createObjectURL !== 'function') {
        throw new ExportError('PNG export is unavailable in this browser. Please try a browser with Canvas support.');
      }
      if (document.fonts) await document.fonts.ready;
      const card = detail?.card;
      const theme = detail?.theme || card?.dataset.theme || Array.from(card?.classList || []).find(name => name.startsWith('card--'))?.slice(6) || 'card';
      // The rendered DOM is authoritative for edited values. No application
      // state, storage, account information, or metadata is put in the PNG.
      const snapshot = capture(card, theme);
      const [artwork, flag] = await Promise.all([
        loadArtwork(snapshot.sources), snapshot.flag ? loadImage(snapshot.flag.source) : null,
      ]);
      canvas.width = snapshot.width;
      canvas.height = snapshot.height;
      context.scale(snapshot.width / CARD_WIDTH, snapshot.height / CARD_HEIGHT);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.save();
      applyGeometry(context, snapshot.artwork);
      context.drawImage(artwork, snapshot.artwork.x, snapshot.artwork.y, snapshot.artwork.width, snapshot.artwork.height);
      context.restore();
      snapshot.texts.forEach(item => drawText(context, item));
      if (flag) {
        const bounds = snapshot.flag;
        // Screen bounds locate the compensated flag. Use its intrinsic ratio
        // in output pixels even if a mobile detail layout uses another scale.
        const width = bounds.height * (flag.naturalWidth / flag.naturalHeight)
          * (snapshot.height / CARD_HEIGHT) / (snapshot.width / CARD_WIDTH);
        context.drawImage(flag, bounds.centerX - width / 2, bounds.y, width, bounds.height);
      }
      const blob = await pngBlob(canvas);
      download(blob, theme);
      outcome = { ok: true, message: `PNG ready · ${snapshot.width} × ${snapshot.height} px` };
    } catch (error) {
      outcome = { ok: false, message: error instanceof ExportError ? error.message
        : error?.name === 'SecurityError' ? 'PNG export needs locally loaded artwork. Reopen the card and try again.'
          : 'The PNG could not be exported. Please try again.' };
    } finally {
      exporting = false;
    }
    result(outcome.ok, outcome.message);
  }

  document.addEventListener('hybrid:export', event => { void exportCard(event.detail); });
})();
