// Evaluate in the edition's top-level page. Same workload for all approaches.
(async()=>{
  const frame=()=>new Promise(requestAnimationFrame);
  const round=n=>Math.round(n*100)/100;
  const summary=values=>{const s=[...values].sort((a,b)=>a-b);return s.length?{n:s.length,median:round(s[Math.floor(s.length*.5)]),p95:round(s[Math.min(s.length-1,Math.floor(s.length*.95))]),max:round(s.at(-1)),over33ms:s.filter(n=>n>33.5).length}:null};
  const pageStart=performance.now();
  const longTasks=[];
  let observer;
  try{observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>({start:round(e.startTime),duration:round(e.duration)}))));observer.observe({type:'longtask',buffered:true});}catch{}
  await document.fonts.ready;
  await Promise.all([...document.querySelectorAll('#gallery img')].map(image=>image.decode().catch(()=>{})));
  await frame();await frame();await frame();
  const ready=performance.now();
  const cards=[...document.querySelectorAll('#gallery .card')];
  const dialog=document.getElementById('card-dialog');
  const initialNodes=document.querySelectorAll('*').length;
  const nodes=cards.map(card=>card.querySelectorAll('*').length);
  const baseline=[];let previous=await frame();
  for(let i=0;i<30;i++){const now=await frame();baseline.push(now-previous);previous=now;}
  const openResults=[];
  for(let i=0;i<cards.length;i++){
    const start=performance.now();cards[i].click();const sync=performance.now()-start;
    await frame();await frame();const twoFrames=performance.now()-start;
    await Promise.all([...document.querySelectorAll('#detail-artwork img')].map(image=>image.decode().catch(()=>{})));
    openResults.push({index:i,handler:round(sync),twoFrames:round(twoFrames),decoded:round(performance.now()-start)});
    dialog.close();await frame();
  }
  // Real next-card interaction at a fixed cadence, with all cards warmed once.
  cards[0].click();await frame();await frame();
  const browseFrames=[];previous=await frame();
  for(let i=0;i<180;i++){
    if(i%15===0)document.getElementById('next-card').click();
    const now=await frame();browseFrames.push(now-previous);previous=now;
  }
  dialog.close();await frame();await frame();
  const scrollFrames=[];
  const distance=document.documentElement.scrollHeight-innerHeight;
  if(distance>80){previous=await frame();for(let i=0;i<180;i++){scrollTo(0,distance*Math.sin(Math.PI*i/180)**2);const now=await frame();scrollFrames.push(now-previous);previous=now;}scrollTo(0,0);await frame();}
  const checks={cards:cards.length,stats:document.querySelectorAll('#gallery .card-stat').length,horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
  cards[0].click();document.getElementById('previous-card').click();checks.wrap=document.getElementById('detail-position').textContent==='12 / 12';
  const input=document.getElementById('player-name');input.value='BENCH TEST';input.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('next-card').click();document.getElementById('previous-card').click();checks.editPersisted=input.value==='BENCH TEST'&&document.querySelector('#detail-artwork .card-name').textContent==='BENCH TEST';input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));dialog.close();await frame();
  const nav=performance.getEntriesByType('navigation')[0];
  const paint=performance.getEntriesByName('first-contentful-paint')[0];
  observer?.disconnect();
  return {url:location.href,time:new Date().toISOString(),edition:window.cardCollection?.edition||'svg',viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,deviceMemory:navigator.deviceMemory||null,documentVisible:document.visibilityState,load:{fcp:paint?round(paint.startTime):null,domReady:round(nav.domContentLoadedEventEnd),responseEnd:round(nav.responseEnd),requestStart:round(nav.requestStart),transferBytes:nav.transferSize,encodedBytes:nav.encodedBodySize,decodedBytes:nav.decodedBodySize,galleryReadyObserved:round(ready),harnessStarted:round(pageStart)},nodes:{documentInitial:initialNodes,gallery:document.querySelector('#gallery').querySelectorAll('*').length,perCard:nodes},baselineFrames:summary(baseline),openCards:openResults,dialogTwoFrame:summary(openResults.map(x=>x.twoFrames)),dialogDecode:summary(openResults.map(x=>x.decoded)),dialogHandlers:summary(openResults.map(x=>x.handler)),browseFrames:summary(browseFrames),scrollFrames:summary(scrollFrames),longTasks,checks};
})()
