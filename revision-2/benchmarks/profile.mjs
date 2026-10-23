// Serialized into the top-level page. Keep all helpers inside this function.
export async function profileRevisionTwo() {
  const frame = () => new Promise(requestAnimationFrame);
  const round = n => Math.round(n * 100) / 100;
  const summary = values => {
    const sorted = [...values].sort((a,b) => a-b), count = sorted.length;
    return count ? {n:count, median:round(count % 2 ? sorted[(count-1)/2] : (sorted[count/2-1]+sorted[count/2])/2), p95:round(sorted[Math.ceil(count*.95)-1]), max:round(sorted.at(-1)), over33ms:sorted.filter(n => n > 33.5).length} : null;
  };
  const entries = () => [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')]
    .filter(entry => /^https?:/.test(entry.name))
    .map(e => ({name:e.name, entryType:e.entryType, initiatorType:e.initiatorType || 'navigation', startTime:e.startTime, responseEnd:e.responseEnd, encodedBodySize:e.encodedBodySize, decodedBodySize:e.decodedBodySize, transferSize:e.transferSize, deliveryType:e.deliveryType || null}));
  const imageSources = new Map(), brokenImages = new Set();
  const captureImages = selector => {
    const images = [...document.querySelectorAll(selector)], current = new Map();
    for (const image of images) {
      const key = image.currentSrc || image.src;
      if (!key) continue;
      const size = {width:image.naturalWidth, height:image.naturalHeight};
      current.set(key, size); imageSources.set(key, size);
      if (!image.complete || !size.width || !size.height) brokenImages.add(key);
    }
    return {imageCount:images.length, uniqueImageSources:current.size, estimatedRGBABytes:[...current.values()].reduce((n,image) => n+image.width*image.height*4, 0)};
  };
  const decode = async selector => {
    await Promise.all([...document.querySelectorAll(selector)].map(async image => {
      try { await image.decode(); } catch { brokenImages.add(image.currentSrc || image.src || 'missing image source'); }
    }));
  };
  const pageStart = performance.now(), longTasks = [];
  let observer;
  try {
    observer = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(e => ({start:round(e.startTime), duration:round(e.duration)}))));
    observer.observe({type:'longtask', buffered:true});
  } catch {}
  await document.fonts.ready;
  await decode('#gallery img');
  await frame(); await frame(); await frame();
  const ready = performance.now(), coldEntries = entries();
  const galleryImages = captureImages('#gallery img');
  const cards = [...document.querySelectorAll('#gallery .card')];
  const dialog = document.getElementById('card-dialog');
  const initialNodes = document.querySelectorAll('*').length;
  const nodes = cards.map(card => card.querySelectorAll('*').length);
  const baseline = [];
  let previous = await frame();
  for (let i=0; i<30; i++) { const now=await frame(); baseline.push(now-previous); previous=now; }
  const openResults = [];
  let dialogOpened = true, artworkPresent = true;
  for (let i=0; i<cards.length; i++) {
    const start = performance.now();
    cards[i].click();
    const handler = performance.now()-start;
    await frame(); await frame();
    const twoFrames = performance.now()-start;
    await decode('#detail-stage img');
    // Two subsequent callbacks give decoded artwork a rendering opportunity. Not a paint/INP measurement.
    await frame(); await frame();
    openResults.push({index:i, handler:round(handler), twoFrames:round(twoFrames), decoded:round(performance.now()-start)});
    dialogOpened = dialogOpened && dialog.open;
    artworkPresent = artworkPresent && !!document.querySelector('#detail-stage .card .card-art')?.children.length;
    captureImages('#detail-stage img');
    dialog.close(); await frame();
  }
  cards[0].click(); await decode('#detail-stage img'); await frame(); await frame();
  const browseFrames = [];
  previous = await frame();
  for (let i=0; i<180; i++) {
    if (i%15 === 0) document.getElementById('next-card').click();
    const now=await frame(); browseFrames.push(now-previous); previous=now;
  }
  dialog.close(); await frame(); await frame();
  const scrollFrames = [], distance = document.documentElement.scrollHeight-innerHeight;
  let maximumObservedScroll = 0;
  if (distance > 80) {
    previous=await frame();
    for (let i=0; i<180; i++) {
      scrollTo(0, distance*Math.sin(Math.PI*i/180)**2);
      const now=await frame(); scrollFrames.push(now-previous); previous=now;
      maximumObservedScroll=Math.max(maximumObservedScroll, scrollY);
    }
    scrollTo(0,0); await frame();
  }
  const api = window.cardCollection;
  const checks = {cards:cards.length, stats:document.querySelectorAll('#gallery .card-stat').length, horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1, dialogOpened, artworkPresent, scrollExercised:distance>80 && maximumObservedScroll>80};
  cards[0].click();
  checks.firstPosition = document.getElementById('detail-position').textContent.trim() === '01 / 12';
  document.getElementById('previous-card').click();
  checks.wrap = document.getElementById('detail-position').textContent.trim() === '12 / 12';
  const input = document.getElementById('player-name'), originalName = input.value;
  input.value='BENCH TEST'; input.dispatchEvent(new Event('input', {bubbles:true}));
  document.getElementById('next-card').click(); document.getElementById('previous-card').click();
  checks.editPersisted = input.value === 'BENCH TEST' && document.querySelector('#detail-stage .card-name').textContent === 'BENCH TEST' && cards[11].querySelector('.card-name').textContent === 'BENCH TEST';
  const exported = typeof api?.exportState === 'function' ? api.exportState() : null;
  checks.stateAPI = typeof api?.getState === 'function' && api.getState(11)?.name === 'BENCH TEST' && exported?.version === 1 && Object.keys(exported?.cards || {}).length === 12 && Object.values(exported.cards).some(state => state.name === 'BENCH TEST');
  checks.fullEditor = ['player-name','player-rating','player-position','player-country','reset-card','confirm-reset','cancel-reset'].every(id => !!document.getElementById(id)) && document.querySelectorAll('#card-editor [data-stat]').length === 6;
  input.value=originalName; input.dispatchEvent(new Event('input', {bubbles:true}));
  await decode('#gallery img, #detail-stage img');
  dialog.close(); await frame();
  const workloadEnd = performance.now(), finalEntries = entries();
  const afterWorkloadImages = captureImages('#gallery img, #detail-stage img');
  afterWorkloadImages.uniqueImageSources=imageSources.size;
  afterWorkloadImages.estimatedRGBABytes=[...imageSources.values()].reduce((n,image) => n+image.width*image.height*4, 0);
  checks.brokenImages=[...brokenImages];
  const nav=performance.getEntriesByType('navigation')[0], paint=performance.getEntriesByName('first-contentful-paint')[0];
  observer?.disconnect();
  return {
    url:location.href, time:new Date().toISOString(), edition:api?.edition || null, revision:api?.revision || null,
    viewport:[innerWidth,innerHeight], dpr:devicePixelRatio, userAgent:navigator.userAgent,
    hardwareConcurrency:navigator.hardwareConcurrency, deviceMemory:navigator.deviceMemory || null, documentVisible:document.visibilityState,
    load:{fcp:paint ? round(paint.startTime) : null, domReady:round(nav.domContentLoadedEventEnd), responseEnd:round(nav.responseEnd), requestStart:round(nav.requestStart), transferBytes:nav.transferSize, encodedBytes:nav.encodedBodySize, decodedBytes:nav.decodedBodySize, galleryReadyObserved:round(ready), harnessStarted:round(pageStart)},
    nodes:{documentInitial:initialNodes, gallery:document.querySelector('#gallery').querySelectorAll('*').length, perCard:nodes},
    baselineFrames:summary(baseline), openCards:openResults, dialogTwoFrame:summary(openResults.map(x => x.twoFrames)), dialogDecode:summary(openResults.map(x => x.decoded)), dialogHandlers:summary(openResults.map(x => x.handler)), browseFrames:summary(browseFrames), scrollFrames:summary(scrollFrames), scroll:{distance, maximumObservedScroll}, longTasks, checks,
    resourceTiming:{timeOrigin:performance.timeOrigin, coldCutoff:ready, workloadCutoff:workloadEnd, cold:coldEntries, workload:finalEntries},
    assetDecoded:{gallery:galleryImages, afterWorkload:afterWorkloadImages, basis:'Observed unique img currentSrc, naturalWidth × naturalHeight × 4. An RGBA surface estimate, not actual resident/GPU memory. Excludes CSS backgrounds, fonts, SVG internals, duplicate surfaces and GPU overhead; responsive source pixels may exceed natural dimensions.'},
  };
}
