// Flags are assembled from named CSS shapes. Nothing is sampled from a bitmap.
const node = (cls, style = '', children = '') => `<i class="${cls}"${style ? ` style="${style}"` : ''}>${children}</i>`;
const stars = [[150,73,4],[144,94,3],[153,103,3],[166,106,4],[180,102,3],[141,112,3],[129,114,3],[126,127,3],[137,132,3],[147,126,3],[152,137,4],[162,125,3],[176,121,3],[169,139,3],[153,150,3],[137,145,3],[122,144,3],[117,132,3],[184,116,3],[188,127,3],[176,144,3],[167,151,3],[158,157,3],[143,158,2],[131,153,2],[119,151,2],[112,141,2]];
function brazil() {
  return node('cf-diamond') + node('cf-globe', '', node('cf-band') + '<span class="cf-motto">ORDEM E PROGRESSO</span>' + stars.map(([x,y,s]) => node('cf-star', `left:${x-97.5}px;top:${y-52.5}px;width:${s}px;height:${s}px`,Array.from({length:5},(_,i)=>`<b style="transform:rotate(${i*72}deg)"></b>`).join(''))).join(''));
}
function korea() {
  return node('cf-taegeuk') + [['heaven','000'],['water','101'],['fire','010'],['earth','111']].map(([name,pattern]) => node(`cf-trigram cf-${name}`, '', [...pattern].map(p=>node(`cf-trigram-bar${p==='1'?' cf-broken':''}`)).join(''))).join('');
}
function sun() {
  return node('cf-sun', '', Array.from({length:32},(_,i)=>node(`cf-ray${i%2?' cf-ray-wave':''}`,`transform:rotate(${i*11.25}deg)`)).join('') + node('cf-sun-face','','<i></i><b></b>'));
}
function portugal() {
  const orbits=Array.from({length:5},(_,i)=>node('cf-orbit',`transform:rotate(${i*36}deg)`)).join('');
  const castles=[[9,5],[21,4],[32,5],[7,19],[34,19],[13,34],[28,34]].map(([x,y])=>node('cf-castle',`left:${x}px;top:${y}px`)).join('');
  const shields=[[12,6],[5,17],[19,17],[12,17],[12,28]].map(([x,y])=>node('cf-quina',`left:${x}px;top:${y}px`)).join('');
  return node('cf-armillary','',orbits+node('cf-equator'))+node('cf-portugal-shield','',castles+node('cf-portugal-white','',shields));
}
function spain() {
  const arms=node('cf-spain-quarters','',node('cf-quarter cf-castile','',node('cf-castle'))+node('cf-quarter cf-leon','',node('cf-lion'))+node('cf-quarter cf-aragon')+node('cf-quarter cf-navarre','',node('cf-navarre-chain'))+node('cf-bourbon')+node('cf-pomegranate'));
  const pillars=['left','right'].map(side=>node(`cf-pillar cf-pillar-${side}`,'',node('cf-pillar-cap')+node('cf-pillar-ribbon'))).join('');
  return node('cf-spanish-arms','',pillars+node('cf-crown','',node('cf-crown-arches'))+arms);
}
const info = {
  england: [300,180,'England',()=> ''], korea:[300,200,'South Korea',korea],
  netherlands:[300,200,'Netherlands',()=> ''], brazil:[300,210,'Brazil',brazil],
  italy:[300,200,'Italy',()=> ''], france:[300,200,'France',()=> ''],
  spain:[300,200,'Spain',spain], portugal:[300,200,'Portugal',portugal],
  argentina:[300,187.5,'Argentina',sun], germany:[300,180,'Germany',()=> ''],
};
const widths = {parchment:32,cyber:30,blueprint:34,comic:34,forest:33,doodle:29,cathedral:28,ink:29,hologram:29,steampunk:27,cosmic:28,arcade:31};
export function flagMarkup(country, theme) {
  const [width,height,label,draw] = info[country];
  return `<span class="flag flag--${country}" style="--flag-ratio:${width}/${height};aspect-ratio:${width}/${height}" role="img" aria-label="${label}"><span class="cf-art cf-${country}" style="height:${height}px;transform:scale(${widths[theme]/width})">${draw()}</span></span>`;
}
