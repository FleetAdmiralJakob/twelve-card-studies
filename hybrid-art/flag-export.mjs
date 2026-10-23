// Applied only to the embedded exporter by polish.mjs; the measured source stays
// untouched. Keep LF literals so its guarded apply/remove can preserve file EOLs.
// CSS contract: axis-aligned holder, uniform solid border and circular radius,
// one outer zero-spread shadow, and a rectangular flag without border/padding.
export const flagExportEdits = [
  {
    before: String.raw`  function flagSnapshot(card, rect) {
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
  }`,
    after: String.raw`  function flagSnapshot(card, rect) {
    const element = card.querySelector('.card-flag .flag');
    if (!element) return null;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return null;
    const match = /^url\((?:"([\s\S]*)"|'([\s\S]*)'|([\s\S]*))\)$/.exec(style.backgroundImage);
    const source = match && permittedSource(match[1] ?? match[2] ?? match[3]);
    if (!source) throw new ExportError('The country flag could not be loaded for export.');
    const flagRect = element.getBoundingClientRect();
    const holder = element.closest('.card-flag');
    const frameStyle = getComputedStyle(holder);
    const frameRect = holder.getBoundingClientRect();
    const frameBox = box(holder, frameStyle);
    if (!flagRect.width || !flagRect.height || !frameBox.width || !frameBox.height) return null;
    const sx = CARD_WIDTH / rect.width, sy = CARD_HEIGHT / rect.height;
    // Computed shadows serialize as color, offsets, blur and spread. Only the
    // holder's single outer, zero-spread shadow is part of this CSS contract.
    const shadow = /^([^()]+\([^)]*\)|[a-z]+)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px\s+0px$/i.exec(frameStyle.boxShadow);
    return {
      source,
      centerX: (flagRect.left + flagRect.width / 2 - rect.left) * sx,
      y: (flagRect.top - rect.top) * sy,
      width: flagRect.width * sx,
      height: flagRect.height * sy,
      frame: {
        x: (frameRect.left - rect.left) * sx, y: (frameRect.top - rect.top) * sy,
        width: frameRect.width * sx, height: frameRect.height * sy,
        // Fractional computed border boxes retain padding, border snapping and
        // the holder's scale compensation without offsetWidth integer rounding.
        scaleX: frameRect.width / frameBox.width * sx,
        scaleY: frameRect.height / frameBox.height * sy,
        background: frameStyle.backgroundColor,
        border: number(frameStyle.borderTopWidth), color: frameStyle.borderTopColor,
        radius: number(frameStyle.borderTopLeftRadius),
        shadow: shadow ? { color: shadow[1], x: number(shadow[2]), y: number(shadow[3]), blur: number(shadow[4]) } : null,
      },
    };
  }

  function drawFlagFrame(context, snapshot, flagWidth) {
    const bounds = snapshot.flag, frame = bounds.frame;
    // Match the final intrinsic SVG width while retaining the actual DOM gaps
    // (including padding/borders) on both sides of the flag.
    const delta = flagWidth - bounds.width;
    const x = frame.x - delta / 2, y = frame.y;
    const width = (frame.width + delta) / frame.scaleX;
    const height = frame.height / frame.scaleY;
    const radius = Math.min(frame.radius, width / 2, height / 2);
    const border = frame.border, shadow = frame.shadow;
    // Rasterize uniformly, then map the layer through each measured axis. This
    // scales shadow blur/offsets too (Canvas shadows ignore the context matrix).
    // Resolution depends on PNG pixels, never the display's devicePixelRatio.
    const scale = Math.max(frame.scaleX * snapshot.width / CARD_WIDTH,
      frame.scaleY * snapshot.height / CARD_HEIGHT);
    const margin = Math.ceil((shadow ? shadow.blur * 3 + Math.max(Math.abs(shadow.x), Math.abs(shadow.y)) : 0) * scale) + 2;
    const layer = document.createElement('canvas');
    layer.width = Math.ceil(width * scale) + margin * 2;
    layer.height = Math.ceil(height * scale) + margin * 2;
    const paint = layer.getContext('2d');
    if (!paint) throw new ExportError('PNG export is unavailable in this browser. Please try a browser with Canvas support.');
    paint.setTransform(scale, 0, 0, scale, margin, margin);
    const outline = () => {
      paint.beginPath();
      paint.roundRect(0, 0, width, height, radius);
    };
    outline();
    if (shadow) {
      paint.fillStyle = '#000';
      paint.shadowColor = shadow.color;
      paint.shadowOffsetX = shadow.x * scale;
      paint.shadowOffsetY = shadow.y * scale;
      paint.shadowBlur = shadow.blur * scale;
      paint.fill();
      paint.shadowColor = 'transparent';
      paint.shadowOffsetX = paint.shadowOffsetY = paint.shadowBlur = 0;
      // CSS outer shadows never darken the holder's interior. Knock out only
      // this temporary layer, leaving the already rendered card untouched.
      paint.globalCompositeOperation = 'destination-out';
      paint.fill();
      paint.globalCompositeOperation = 'source-over';
    }
    paint.fillStyle = frame.background;
    paint.fill();
    if (border > 0) {
      // The translucent rim overlays the background, just like border-box CSS.
      // A ring avoids both an outward stroke and painting across the flag.
      if (width > border * 2 && height > border * 2) {
        paint.roundRect(border, border, width - border * 2, height - border * 2, Math.max(0, radius - border));
      }
      paint.fillStyle = frame.color;
      paint.fill('evenodd');
    }
    context.drawImage(layer, x - margin / scale * frame.scaleX, y - margin / scale * frame.scaleY,
      layer.width / scale * frame.scaleX, layer.height / scale * frame.scaleY);
  }`,
  },
  {
    before: String.raw`        const width = bounds.height * (flag.naturalWidth / flag.naturalHeight)
          * (snapshot.height / CARD_HEIGHT) / (snapshot.width / CARD_WIDTH);
        context.drawImage(flag, bounds.centerX - width / 2, bounds.y, width, bounds.height);`,
    after: String.raw`        const width = bounds.height * (flag.naturalWidth / flag.naturalHeight)
          * (snapshot.height / CARD_HEIGHT) / (snapshot.width / CARD_WIDTH);
        drawFlagFrame(context, snapshot, width);
        context.drawImage(flag, bounds.centerX - width / 2, bounds.y, width, bounds.height);`,
  },
];
