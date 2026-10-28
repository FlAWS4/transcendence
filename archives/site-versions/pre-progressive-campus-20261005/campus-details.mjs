import {resolveCampusWebsite} from './campus-website.mjs?v=1';
const copy = {
 fr:{country:'Pays',address:'Adresse',website:'Site officiel du campus',profile:'Fiche officielle · 42 Network',newTab:'S’ouvre dans un nouvel onglet'},
 en:{country:'Country',address:'Address',website:'Official campus website',profile:'Official profile · 42 Network',newTab:'Opens in a new tab'},
 ar:{country:'الدولة',address:'العنوان',website:'الموقع الرسمي للفرع',profile:'الصفحة الرسمية · 42 Network',newTab:'يفتح في علامة تبويب جديدة'},
};

/** Facts from the campus catalogue; the owner provides the dialog and CSS. */
export function mountCampusDetails({container,campus,countryName,locale='fr'}){
 const language=copy[locale]?locale:'fr',text=copy[language],doc=container.ownerDocument;
 const root=doc.createElement('section');root.className='campus-details';root.lang=language;root.dir=language==='ar'?'rtl':'ltr';
 const name=doc.createElement('h3');name.className='campus-details-name';name.dir='auto';name.textContent=campus.name;root.append(name);
 const facts=doc.createElement('dl');facts.className='campus-details-facts';
 function fact(label,value,{address=false}={}){
  if(typeof value!=='string'||!value.trim())return;
  const group=doc.createElement('div'),term=doc.createElement('dt'),description=doc.createElement('dd');
  term.textContent=label;
  const content=address?doc.createElement('address'):doc.createElement('span');
  content.dir='auto';content.textContent=value.trim();description.append(content);group.append(term,description);facts.append(group);
 }
 fact(text.country,typeof countryName==='function'?countryName(campus.country):countryName||campus.country);
 fact(text.address,campus.address,{address:true});root.append(facts);
 const destination=resolveCampusWebsite(campus,language),url=destination?.url;
 const website=destination?.kind==='campus-site';
 if(url){
  const link=doc.createElement('a');link.className='campus-details-link';link.href=url;link.target='_blank';link.rel='noopener noreferrer';if(destination.language)link.hreflang=destination.language;
  const label=doc.createElement('span');label.textContent=website?text.website:text.profile;
  link.setAttribute('aria-label',`${label.textContent} · ${campus.name}. ${text.newTab}`);
  const arrow=doc.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('aria-hidden','true');
  const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M8 5h11v11M19 5 5 19');arrow.append(path);link.append(label,arrow);
  const note=doc.createElement('p');note.className='campus-details-link-note';note.textContent=text.newTab;
  if(destination.isFallback&&destination.language){const translated=new Intl.DisplayNames(language,{type:'language'}).of(destination.language);const prefix={fr:'Site en',en:'Website in',ar:'الموقع باللغة'}[language];note.textContent=`${prefix} ${translated} · ${text.newTab}`;}
  root.append(link,note);
  if(destination.manualLanguage){const hint=doc.createElement('p');hint.className='campus-details-link-note';const translated=new Intl.DisplayNames(language,{type:'language'}).of(destination.manualLanguage);hint.textContent={fr:`Pour afficher le site en ${translated}, utilise son menu de langue.`,en:`Select ${translated} from the website’s language menu.`,ar:`اختر ${translated} من قائمة اللغات في الموقع.`}[language];root.append(hint);}
 }
 container.append(root);
 return {element:root,destroy(){root.remove();}};
}
