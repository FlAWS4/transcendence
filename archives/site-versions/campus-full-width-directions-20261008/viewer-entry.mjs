import {mountCampusDetails} from './runtime/campus-details.mjs';
const base=new URL('./runtime/',import.meta.url);
const [network,sites,locales,profiles]=await Promise.all(['campuses.json','campus-websites.json','campus-website-locales.json','campus-profiles.json'].map(async name=>{const r=await fetch(new URL(name,base));if(!r.ok)throw new Error(name);return r.json();}));
const dialog=document.querySelector('#dialog'),container=document.querySelector('#dialog-content');let mounted=null,locale='fr';
function open(id){mounted?.destroy();container.replaceChildren();const campus={...network.campuses.find(item=>item.id===id),websiteUrl:sites.campuses[id]?.url,websiteLocales:locales.campuses[id]};document.querySelector('#dialog-title').textContent=campus.name;mounted=mountCampusDetails({container,campus,countryName:locale==='ar'?'فرنسا':'France',locale,profile:profiles.campuses[id]||{},now:new Date('2026-10-08T12:00:00Z')});dialog.showModal();dialog.scrollTop=0;}
document.querySelectorAll('[data-campus]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.campus)));
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(!dialog.open){mounted?.destroy();mounted=null;}});
document.querySelector('#locale').addEventListener('click',()=>{locale={fr:'en',en:'ar',ar:'fr'}[locale];document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';document.querySelector('#archive-status').textContent='Langue : '+locale;});
document.querySelector('#theme').addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';});
document.querySelector('#archive-status').textContent='Archive prête';open('paris');
