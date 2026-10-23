import {readFile} from 'node:fs/promises';
import {flagMarkup as basicFlag} from '../basic-art/flags.mjs';
import {flagMarkup as polygonFlag} from '../css-art/flags.mjs';
import {countries} from './cards.mjs';
export const ratios={france:1.5,norway:22/16,spain:1.5,japan:1.5,brazil:10/7,england:5/3,portugal:1.5,italy:1.5,netherlands:1.5,argentina:1.6,germany:5/3,uruguay:1.5};
export async function flagsFor(edition){
 const drawings={};
 let styles='';
 if(['svg','hybrid'].includes(edition)){
  for(const [country,label] of Object.entries(countries)){
   const path=['norway','japan','uruguay'].includes(country)?`revision-2/assets/flags/${country}.svg`:`assets/flags/${country}.svg`;
   const data=(await readFile(path)).toString('base64');
   drawings[country]=`<span class="flag flag--${country}" role="img" aria-label="${label}" style="aspect-ratio:${ratios[country]};background-image:url(data:image/svg+xml;base64,${data})"></span>`;
  }
 }else{
  styles=await readFile(`${edition==='basic'?'basic':'css'}-art/flags.css`,'utf8');
  for(const [country,label] of Object.entries(countries)){
   if(!['norway','japan','uruguay'].includes(country)){
    drawings[country]=(edition==='basic'?basicFlag:polygonFlag)(country,'parchment').replace('scale(0.10666666666666667)','scale(0.12666666666666668)');
   }else{
    const sun=Array.from({length:16},(_,i)=>`<i style="transform:rotate(${i*22.5}deg)"></i>`).join('');
    const detail=country==='uruguay'?`<i class="r2-sun">${sun}<b></b></i>`:'';
    drawings[country]=`<span class="flag flag--${country}" role="img" aria-label="${label}" style="aspect-ratio:${ratios[country]}"><span class="r2-flag-${country}">${detail}</span></span>`;
   }
  }
  styles+=`.r2-flag-norway,.r2-flag-japan,.r2-flag-uruguay{display:block;position:absolute;inset:0}.r2-flag-norway{background:linear-gradient(90deg,transparent 31.818%,#00205b 31.818% 40.909%,transparent 40.909%),linear-gradient(transparent 43.75%,#00205b 43.75% 56.25%,transparent 56.25%),linear-gradient(90deg,transparent 27.273%,#fff 27.273% 45.455%,transparent 45.455%),linear-gradient(#ba0c2f 37.5%,#fff 37.5% 62.5%,#ba0c2f 62.5%)}.r2-flag-japan{background:radial-gradient(circle 7.6px at center,#bc002d 0 99%,#fff 100%)}.r2-flag-uruguay{background:repeating-linear-gradient(#fff 0 11.111%,#0038a8 11.111% 22.222%)}.r2-flag-uruguay:before{content:'';position:absolute;left:0;top:0;width:44.444%;height:55.556%;background:white}.r2-sun{position:absolute;left:4px;top:3px;width:8px;height:8px}.r2-sun i{position:absolute;left:3.6px;top:0;width:.8px;height:4px;background:#f6b40e;transform-origin:50% 4px}.r2-sun b{position:absolute;inset:2px;border:.2px solid #8b6216;border-radius:50%;background:#f6b40e}`;
 }
 return {drawings,styles};
}
