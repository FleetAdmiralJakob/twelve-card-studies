// This function is serialized into the top-level page by Playwright.
// Keep the workload aligned with profile.js; additional accounting is outside its timed loops.
export async function profileFour() {
  const frame = () => new Promise(requestAnimationFrame);
  const round = n => Math.round(n * 100) / 100;
  const summary = values => {
    const s = [...values].sort((a,b) => a-b);
    return s.length ? {n:s.length, median:round(s[Math.floor(s.length*.5)]), p95:round(s[Math.min(s.length-1,Math.floor(s.length*.95))]), max:round(s.at(-1)), over33ms:s.filter(n=>n>33.5).length} : null;
  };
  const entries = () => [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')]
    .filter(e => /^https?:/.test(e.name))
    .map(e => ({name:e.name, entryType:e.entryType, initiatorType:e.initiatorType || 'navigation', startTime:e.startTime, responseEnd:e.responseEnd, encodedBodySize:e.encodedBodySize, decodedBodySize:e.decodedBodySize, transferSize:e.transferSize, deliveryType:e.deliveryType || null}));
  // Natural dimensions give an RGBA surface estimate, not resident or GPU memory.
  const imageSources = new Map();
  const brokenImages = new Set();
  const captureImages = scope => {
    const images = [...document.querySelectorAll(scope)];
    const current = new Map();
    for (const image of images) {
      const key = image.currentSrc || image.src;
      if (!key) continue;
      const size = {width:image.naturalWidth, height:image.naturalHeight};
      current.set(key, size);
      imageSources.set(key, size);
      if (!image.complete || !size.width || !size.height) brokenImages.add(key);
    }
    return {imageCount:images.length, uniqueImageSources:current.size, estimatedRGBABytes:[...current.values()].reduce((n,image)=>n+image.width*image.height*4,0)};
  };
  const pageStart = performance.now();
  const longTasks = [];
  let observer;
  try {
    observer = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(e=>({start:round(e.startTime), duration:round(e.duration)}))));
    observer.observe({type:'longtask', buffered:true});
  } catch {}
  await document.fonts.ready;
  await Promise.all([...document.querySelectorAll('#gallery img')].map(image=>image.decode().catch(()=>{})));
  await frame(); await frame(); await frame();
  const ready = performance.now();
  const coldEntries = entries();
  const galleryImages = captureImages('#gallery img');
  const cards = [...document.querySelectorAll('#gallery .card')];
  const dialog = document.getElementById('card-dialog');
  const initialNodes = document.querySelectorAll('*').length;
  const nodes = cards.map(card=>card.querySelectorAll('*').length);
  const baseline = [];
  let previous = await frame();
  for (let i=0;i<30;i++) { const now=await frame(); baseline.push(now-previous); previous=now; }
  const openResults = [];
  let dialogOpened = true;
  for (let i=0;i<cards.length;i++) {
    const start = performance.now();
    cards[i].click();
    const sync = performance.now()-start;
    await frame(); await frame();
    const twoFrames = performance.now()-start;
    await Promise.all([...document.querySelectorAll('#detail-artwork img')].map(image=>image.decode().catch(()=>{})));
    openResults.push({index:i, handler:round(sync), twoFrames:round(twoFrames), decoded:round(performance.now()-start)});
    dialogOpened = dialogOpened && dialog.open;
    captureImages('#detail-artwork img');
    dialog.close(); await frame();
  }
  cards[0].click(); await frame(); await frame();
  const browseFrames = [];
  previous = await frame();
  for (let i=0;i<180;i++) {
    if (i%15===0) document.getElementById('next-card').click();
    const now=await frame(); browseFrames.push(now-previous); previous=now;
  }
  dialog.close(); await frame(); await frame();
  const scrollFrames = [];
  const distance = document.documentElement.scrollHeight-innerHeight;
  if (distance>80) {
    previous=await frame();
    for (let i=0;i<180;i++) { scrollTo(0,distance*Math.sin(Math.PI*i/180)**2); const now=await frame(); scrollFrames.push(now-previous); previous=now; }
    scrollTo(0,0); await frame();
  }
  const checks = {cards:cards.length, stats:document.querySelectorAll('#gallery .card-stat').length, horizontalOverflow:document.documentElement.scrollWidth>innerWidth, dialogOpened};
  cards[0].click(); document.getElementById('previous-card').click();
  checks.wrap=document.getElementById('detail-position').textContent==='12 / 12';
  const input=document.getElementById('player-name');
  input.value='BENCH TEST'; input.dispatchEvent(new Event('input',{bubbles:true}));
  document.getElementById('next-card').click(); document.getElementById('previous-card').click();
  checks.editPersisted=input.value==='BENCH TEST' && document.querySelector('#detail-artwork .card-name').textContent==='BENCH TEST';
  input.value=''; input.dispatchEvent(new Event('input',{bubbles:true}));
  dialog.close(); await frame();
  const workloadEnd = performance.now();
  const finalEntries = entries();
  const afterWorkloadImages = captureImages('#gallery img, #detail-artwork img');
  afterWorkloadImages.uniqueImageSources = imageSources.size;
  afterWorkloadImages.estimatedRGBABytes = [...imageSources.values()].reduce((n,image)=>n+image.width*image.height*4,0);
  checks.brokenImages = [...brokenImages];
  const nav = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByName('first-contentful-paint')[0];
  observer?.disconnect();
  return {
    url:location.href, time:new Date().toISOString(), edition:window.cardCollection?.edition || 'svg',
    viewport:[innerWidth,innerHeight], dpr:devicePixelRatio, userAgent:navigator.userAgent,
    hardwareConcurrency:navigator.hardwareConcurrency, deviceMemory:navigator.deviceMemory || null, documentVisible:document.visibilityState,
    load:{fcp:paint?round(paint.startTime):null, domReady:round(nav.domContentLoadedEventEnd), responseEnd:round(nav.responseEnd), requestStart:round(nav.requestStart), transferBytes:nav.transferSize, encodedBytes:nav.encodedBodySize, decodedBytes:nav.decodedBodySize, galleryReadyObserved:round(ready), harnessStarted:round(pageStart)},
    nodes:{documentInitial:initialNodes, gallery:document.querySelector('#gallery').querySelectorAll('*').length, perCard:nodes},
    baselineFrames:summary(baseline), openCards:openResults, dialogTwoFrame:summary(openResults.map(x=>x.twoFrames)), dialogDecode:summary(openResults.map(x=>x.decoded)), dialogHandlers:summary(openResults.map(x=>x.handler)), browseFrames:summary(browseFrames), scrollFrames:summary(scrollFrames), longTasks, checks,
    resourceTiming:{timeOrigin:performance.timeOrigin, coldCutoff:ready, workloadCutoff:workloadEnd, cold:coldEntries, workload:finalEntries},
    assetDecoded:{gallery:galleryImages, afterWorkload:afterWorkloadImages, basis:'Unique img currentSrc observed in gallery and each detail; density-corrected naturalWidth × naturalHeight × 4. Responsive source files can have larger pixel dimensions. Includes data/blob images; excludes CSS background images, fonts, vector internals, duplicate resident copies, and GPU overhead. Not actual memory usage.'},
  };
}
