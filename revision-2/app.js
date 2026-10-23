(() => {
 'use strict';
 const config=JSON.parse(document.getElementById('collection-data').textContent);
 const gallery=document.getElementById('gallery');
 const cards=[...gallery.querySelectorAll('.card')];
 const shells=cards.map(card=>({element:card.parentElement,images:[...card.querySelectorAll('img,source')],width:null}));
 const dialog=document.getElementById('card-dialog');
 const stage=document.getElementById('detail-stage');
 const form=document.getElementById('card-editor');
 const feedback=document.getElementById('editor-feedback');
 const confirm=document.getElementById('reset-confirm');
 const fields={name:form.elements.name,rating:form.elements.rating,position:form.elements.position,country:form.elements.country};
 const statInputs=[...form.querySelectorAll('[data-stat]')];
 const key='the-twelve.revision-2.cards.v1';
 document.getElementById('layout-toggle').addEventListener('click',event=>{
  const large=gallery.classList.toggle('is-large');event.currentTarget.setAttribute('aria-pressed',String(large));event.currentTarget.textContent=large?'Compact grid':'Larger cards';resize();
 });
 const positions=['GK','CB','RB','LB','CDM','CM','CAM','RM','LM','RW','LW','CF','ST'];
 const labels=['PAC','SHO','PAS','DRI','DEF','PHY'];
 const keeper=['DIV','HAN','KIC','REF','SPE','POS'];
 const clone=state=>({...state,stats:[...state.stats]});
 const defaults=config.cards.map(({name,rating,position,country,stats})=>({name,rating,position,country,stats}));
 const states=defaults.map(clone),cache=new Map();
 let current=0,opener=null,persistTimer;
 const number=value=>Number.isInteger(value)&&value>=1&&value<=99;
 const normalizeName=value=>Array.from(value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim().toUpperCase()).slice(0,18).join('');
 const valid=s=>s&&typeof s==='object'&&typeof s.name==='string'&&Array.from(s.name).length<=18&&number(s.rating)&&positions.includes(s.position)&&Object.hasOwn(config.flags,s.country)&&Array.isArray(s.stats)&&s.stats.length===6&&s.stats.every(number);
 try{
  const raw=localStorage.getItem(key);
  if(raw&&raw.length<64000){const saved=JSON.parse(raw);if(saved.version===1&&saved.cards)config.cards.forEach((card,i)=>{if(valid(saved.cards[card.theme]))states[i]={...clone(saved.cards[card.theme]),name:normalizeName(saved.cards[card.theme].name)}});}
 }catch{feedback.textContent='Saved edits could not be loaded. You can still edit this collection.'}
 function fitName(card){
  const el=card.querySelector('.card-name');el.style.fontSize='23px';
  for(let size=22;el.scrollWidth>el.clientWidth+1&&size>=13;size--)el.style.fontSize=size+'px';
 }
 function render(card,index){
  const s=states[index];card.querySelector('.card-rating strong').textContent=s.rating;card.querySelector('.card-rating span').textContent=s.position;
  card.querySelector('.card-name').textContent=s.name||defaults[index].name;
  card.querySelector('.card-flag').innerHTML=config.flags[s.country];
  card.querySelectorAll('.card-stat').forEach((el,i)=>{el.querySelector('small').textContent=(s.position==='GK'?keeper:labels)[i];el.querySelector('strong').textContent=s.stats[i]});
  card.setAttribute('aria-label',`${s.name||defaults[index].name}, ${s.rating} ${s.position}. Customize card`);
  fitName(card);
 }
 function resize(){
  // Read geometry before writing styles, and leave unchanged scales alone.
  // Opening/browsing a dialog normally does not change any gallery width.
  const widths=shells.map(({element})=>element.clientWidth),detailWidth=stage.clientWidth;
  shells.forEach((shell,i)=>{
   const width=widths[i];if(shell.width===width)return;shell.width=width;
   shell.element.style.setProperty('--card-scale',width/300);
   const size=width+'px';for(const image of shell.images)if(image.sizes!==size)image.sizes=size;
  });
  const scale=String(detailWidth/300);if(stage.style.getPropertyValue('--card-scale')!==scale)stage.style.setProperty('--card-scale',scale);
 }
 function fillForm(){
  const state=states[current];Object.entries(fields).forEach(([key,input])=>{input.value=state[key]});
  statInputs.forEach((input,i)=>{input.value=state.stats[i];input.previousElementSibling.textContent=(state.position==='GK'?keeper:labels)[i]});
 }
 function show(index){
  current=(index+cards.length)%cards.length;
  let card=cache.get(current);
  if(!card){
   card=cards[current].cloneNode(true);card.removeAttribute('aria-haspopup');card.tabIndex=-1;
   const ids=new Set([...card.querySelectorAll('[id]')].map(el=>el.id));
   if(ids.size)for(const el of card.querySelectorAll('*'))for(const attr of [...el.attributes]){
    let value=attr.value.replace(/url\(#([^)]+)\)/g,(match,id)=>ids.has(id)?`url(#detail-${id})`:match);
    if(attr.name==='id')value='detail-'+value;
    else if((attr.name==='href'||attr.name==='xlink:href')&&ids.has(value.slice(1)))value='#detail-'+value.slice(1);
    if(value!==attr.value)el.setAttribute(attr.name,value);
   }
   cache.set(current,card);
  }
  stage.replaceChildren(card);render(card,current);fillForm();confirm.hidden=true;
  document.getElementById('detail-title').textContent=config.cards[current].name;
  document.getElementById('detail-description').textContent=config.cards[current].description;
  document.getElementById('detail-position').textContent=`${String(current+1).padStart(2,'0')} / 12`;
  resize();
  const img=card.querySelector('img');if(img){img.sizes='600px';card.querySelector('source')?.setAttribute('sizes','600px')}
  feedback.textContent='Edits are saved on this device and shared across all four approaches.';
 }
 function open(index){opener=cards[index];dialog.showModal();document.body.style.overflow='hidden';show(index);document.getElementById('close-dialog').focus({preventScroll:true})}
 function close(){dialog.close()}
 dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus({preventScroll:true})});
 gallery.addEventListener('click',event=>{const card=event.target.closest('.card');if(card)open(cards.indexOf(card))});
 document.getElementById('close-dialog').addEventListener('click',close);
 document.getElementById('previous-card').addEventListener('click',()=>show(current-1));
 document.getElementById('next-card').addEventListener('click',()=>show(current+1));
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()}});
 dialog.addEventListener('keydown',event=>{if(event.target.matches('input,select,button')&&!event.target.classList.contains('icon-button'))return;if(event.key==='ArrowRight'){event.preventDefault();show(current+1)}if(event.key==='ArrowLeft'){event.preventDefault();show(current-1)}});
 function exportState(){return{version:1,cards:Object.fromEntries(config.cards.map((card,i)=>[card.theme,clone(states[i])]))}}
 function persist(){clearTimeout(persistTimer);try{localStorage.setItem(key,JSON.stringify(exportState()));feedback.textContent='Saved on this device · available in every Revision 2 approach.'}catch{feedback.textContent='Browser storage is unavailable. Your edits work for this visit.'}}
 form.addEventListener('submit',event=>event.preventDefault());
 form.addEventListener('input',()=>{
  const next={name:normalizeName(fields.name.value),rating:Number(fields.rating.value),position:fields.position.value,country:fields.country.value,stats:statInputs.map(input=>Number(input.value))};
  if(!valid(next)){feedback.textContent='Use a value from 1 to 99 for the rating and every stat.';return}
  states[current]=next;render(cards[current],current);render(cache.get(current),current);
  statInputs.forEach((input,i)=>input.previousElementSibling.textContent=(next.position==='GK'?keeper:labels)[i]);
  clearTimeout(persistTimer);persistTimer=setTimeout(persist,180);
 });
 window.addEventListener('pagehide',persist);
 document.getElementById('reset-card').addEventListener('click',()=>{confirm.hidden=false;document.getElementById('cancel-reset').focus()});
 document.getElementById('cancel-reset').addEventListener('click',()=>{confirm.hidden=true;document.getElementById('reset-card').focus()});
 document.getElementById('confirm-reset').addEventListener('click',()=>{states[current]=clone(defaults[current]);render(cards[current],current);show(current);persist();document.getElementById('reset-card').focus()});
 document.getElementById('export-card')?.addEventListener('click',()=>{
  const button=document.getElementById('export-card');button.disabled=true;
  document.getElementById('export-status').textContent='Preparing PNG…';
  document.dispatchEvent(new CustomEvent('revision2:export',{detail:{card:cache.get(current),theme:config.cards[current].theme,state:clone(states[current])}}));
 });
 document.addEventListener('revision2:export-result',event=>{document.getElementById('export-card').disabled=false;document.getElementById('export-status').textContent=event.detail.message});
 cards.forEach(render);resize();
 new ResizeObserver(resize).observe(gallery);
 new ResizeObserver(()=>{if(dialog.open)resize()}).observe(stage);
 document.fonts.ready.then(()=>{cards.forEach(fitName);cache.forEach(fitName)});
 window.cardCollection=Object.freeze({revision:2,edition:config.edition,getState(theme){const i=typeof theme==='number'?theme:config.cards.findIndex(card=>card.theme===theme);return states[i]?clone(states[i]):null},exportState});
})();
