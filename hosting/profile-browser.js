// Run in the page's main frame after fonts/artwork load. Uses the browser's
// actual animation frames and dialog layout; results describe this machine.
(async () => {
  await document.fonts.ready;
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
  const cards = [...document.querySelectorAll('#gallery .card')];
  const dialog = document.getElementById('card-dialog');
  const opens = [];
  const synchronousClicks = [];
  for (const card of cards) {
    const start = performance.now();
    card.click();
    synchronousClicks.push(performance.now()-start);
    await Promise.all([...document.querySelectorAll('#detail-artwork img')].map(image => image.decode()));
    await frame();
    await frame();
    opens.push(performance.now()-start);
    dialog.close();
    await frame();
  }
  const deltas=[];
  // Exercise motion only in editions that expose that interaction. Moving
  // static SVG artwork artificially would not measure the shipped behavior.
  const motionEnabled=getComputedStyle(cards[0].parentElement).willChange.includes('transform');
  let previous=await frame();
  let previousMotion;
  for(let i=0;motionEnabled && i<120;i++) {
    const motion=cards[Math.floor(i/10)%cards.length].parentElement;
    if(previousMotion && previousMotion!==motion) previousMotion.style.transform='';
    motion.style.transform=`translateY(${-3-3*Math.sin(i/4)}px)`;
    previousMotion=motion;
    const now=await frame();
    deltas.push(now-previous);
    previous=now;
  }
  if(previousMotion) previousMotion.style.transform='';
  const scrollFrames=[];
  if(innerWidth<700) {
    let prior=await frame();
    const distance=document.documentElement.scrollHeight-innerHeight;
    for(let i=0;i<90;i++) {
      scrollTo(0,distance*Math.sin(Math.PI*i/90)**2);
      const now=await frame();scrollFrames.push(now-prior);prior=now;
    }
    scrollTo(0,0);
  }
  const quantile=(numbers,q)=>[...numbers].sort((a,b)=>a-b)[Math.min(numbers.length-1,Math.floor(numbers.length*q))];
  const stats=numbers=>numbers.length?{medianMs:+quantile(numbers,.5).toFixed(2),p95Ms:+quantile(numbers,.95).toFixed(2),maxMs:+Math.max(...numbers).toFixed(2),framesOver33ms:numbers.filter(n=>n>33.4).length,samples:numbers.length}:null;
  const nav=performance.getEntriesByType('navigation')[0];
  return {url:location.href,viewport:[innerWidth,innerHeight],userAgent:navigator.userAgent,time:new Date().toISOString(),domElements:document.querySelectorAll('*').length,images:document.querySelectorAll('#gallery img').length,svg:document.querySelectorAll('#gallery svg').length,canvas:document.querySelectorAll('canvas').length,cardCount:cards.length,firstContentfulPaintMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,transferBytes:nav.transferSize,domReadyMs:nav.domContentLoadedEventEnd,synchronousClickMs:synchronousClicks.map(n=>+n.toFixed(2)),dialogTwoFrameMs:opens.map(n=>+n.toFixed(2)),motionFrames:stats(deltas),scrollFrames:stats(scrollFrames),horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
})()
