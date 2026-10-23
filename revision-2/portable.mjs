import {escape} from './cards.mjs';
export function portableHTML(html){
 const domain=process.env.VERCEL_URL||process.env.VERCEL_PROJECT_PRODUCTION_URL;
 const origin=new URL(process.env.CARD_SITE_ORIGIN||(domain?`https://${domain}`:'http://localhost:4173'));
 if(!['http:','https:'].includes(origin.protocol)||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw Error('CARD_SITE_ORIGIN must be an HTTP(S) origin without credentials, path, query or fragment');
 return html.replaceAll('/revision-2/assets/','assets/')
  .replaceAll('href="/revision-2/reference"','href="reference.png"')
  .replaceAll('href="/revision-2/hybrid/"','href="./"')
  .replace(/href="\/(?!\/)([^"]*)"/g,(_,route)=>`href="${escape(origin.origin+'/'+route)}"`);
}
