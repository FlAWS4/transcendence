import {resolveCampusWebsite} from './campus-website.mjs?v=1';
import {coverArt} from './content-preview-art.mjs?v=1';

const copy = {
 fr:{
  country:'Pays',address:'Adresse',website:'Site officiel du campus',profile:'Fiche officielle · 42 Network',newTab:'S’ouvre dans un nouvel onglet',
  intro:'Retrouvez les projets, les parcours et les récits rattachés à ce campus sur Horizon.',
  expand:'Déployer la fiche',collapse:'Réduire la fiche',copyAddress:'Copier l’adresse',copied:'Adresse copiée.',
  copyError:'La copie automatique est indisponible. Sélectionnez l’adresse ci-dessus pour la copier.',
  related:'Ce qui se crée ici',demo:'Contenus de démonstration : ces exemples sont fictifs et ne décrivent pas des réalisations réelles du campus.',
  emptyTitle:'Une histoire encore à raconter',emptyText:'Aucun contenu de démonstration n’est encore rattaché à ce campus. Son adresse et son site officiel restent disponibles.',
  total:n=>n+' contenu'+(n===1?'':'s')+' de démonstration',
  sections:{projects:'Projets',people:'Parcours',journal:'Journal'},
  count:{projects:n=>n+' projet'+(n===1?'':'s'),people:n=>n+' parcours',journal:n=>n+' article'+(n===1?'':'s')},
  browse:{projects:'Voir les projets du campus',people:'Voir les parcours du campus',journal:'Lire le journal du campus'},
 },
 en:{
  country:'Country',address:'Address',website:'Official campus website',profile:'Official profile · 42 Network',newTab:'Opens in a new tab',
  intro:'Discover the projects, learning journeys and stories linked to this campus on Horizon.',
  expand:'Expand campus details',collapse:'Collapse campus details',copyAddress:'Copy address',copied:'Address copied.',
  copyError:'Automatic copying is unavailable. Select the address above to copy it.',
  related:'Created here',demo:'Demonstration content: these fictional examples do not describe real work from the campus.',
  emptyTitle:'A story still to be told',emptyText:'No demonstration content is linked to this campus yet. Its address and official website remain available.',
  total:n=>n+' demonstration '+(n===1?'item':'items'),
  sections:{projects:'Projects',people:'Learning journeys',journal:'Journal'},
  count:{projects:n=>n+' project'+(n===1?'':'s'),people:n=>n+' learning '+(n===1?'journey':'journeys'),journal:n=>n+' article'+(n===1?'':'s')},
  browse:{projects:'View campus projects',people:'View campus learning journeys',journal:'Read the campus journal'},
 },
 ar:{
  country:'الدولة',address:'العنوان',website:'الموقع الرسمي للفرع',profile:'الصفحة الرسمية · 42 Network',newTab:'يفتح في علامة تبويب جديدة',
  intro:'اكتشف المشاريع والمسارات والقصص المرتبطة بهذا الفرع على أفق.',
  expand:'توسيع بطاقة الفرع',collapse:'طي بطاقة الفرع',copyAddress:'نسخ العنوان',copied:'تم نسخ العنوان.',
  copyError:'النسخ التلقائي غير متاح. حدّد العنوان أعلاه لنسخه.',
  related:'ما يُنجز هنا',demo:'محتوى توضيحي: هذه أمثلة خيالية ولا تصف أعمالًا حقيقية من هذا الفرع.',
  emptyTitle:'قصة تنتظر أن تُروى',emptyText:'لا يوجد محتوى توضيحي مرتبط بهذا الفرع بعد. يظل عنوانه وموقعه الرسمي متاحين.',
  total:n=>'عدد المحتويات التوضيحية: '+new Intl.NumberFormat('ar').format(n),
  sections:{projects:'المشاريع',people:'المسارات',journal:'المجلة'},
  count:{projects:n=>'المشاريع: '+new Intl.NumberFormat('ar').format(n),people:n=>'المسارات: '+new Intl.NumberFormat('ar').format(n),journal:n=>'المقالات: '+new Intl.NumberFormat('ar').format(n)},
  browse:{projects:'عرض مشاريع الفرع',people:'عرض مسارات الفرع',journal:'قراءة مجلة الفرع'},
 },
};
const sections=['projects','people','journal'];
const localized=(value,language)=>typeof value==='string'?value:value?.[language]||value?.fr||value?.en||value?.ar||'';
let instanceCount=0;

function contentRoute(campus,section,entryId=null){
 return {section,entryId,country:campus.country,campus:campus.id,query:''};
}
function routeHref(route){
 const params=new URLSearchParams({country:route.country,campus:route.campus});
 return '#'+route.section+(route.entryId?'/'+encodeURIComponent(route.entryId):'')+'?'+params.toString();
}

/** Catalogue facts and explicitly labelled editorial samples. No campus photos
 *  or descriptive claims are inferred from the location or sample projects. */
export function mountCampusDetails({container,campus,countryName,locale='fr',entries=[],onNavigate,onCopyAddress}){
 const language=copy[locale]?locale:'fr',text=copy[language],doc=container.ownerDocument;
 const root=doc.createElement('section');root.className='campus-details';root.lang=language;root.dir=language==='ar'?'rtl':'ltr';
 root.id='campus-details-'+(++instanceCount);root.dataset.expanded='false';
 let destroyed=false,copying=false;
 const dialog=container.closest?.('dialog');
 if(dialog)dialog.dataset.expanded='false';
 const create=(tag,className,value)=>{const node=doc.createElement(tag);if(className)node.className=className;if(value!==undefined)node.textContent=value;return node;};
 const region=typeof countryName==='function'?countryName(campus.country):countryName||campus.country;
 const hero=create('div','campus-details-hero'),identity=create('div','campus-details-identity');
 const country=create('p','campus-details-country',region),name=create('h3','campus-details-name',campus.name);
 country.dir='auto';name.dir='auto';identity.append(country,name);
 const mark=create('span','campus-details-mark');mark.setAttribute('aria-hidden','true');
 mark.innerHTML='<svg viewBox="0 0 80 80" fill="none" aria-hidden="true" focusable="false"><circle cx="40" cy="40" r="30"/><circle cx="40" cy="40" r="21"/><path d="M40 7v9M40 64v9M7 40h9M64 40h9"/><path d="M50 35c0 8-10 17-10 17S30 43 30 35a10 10 0 0 1 20 0Z"/><circle cx="40" cy="35" r="3"/></svg>';
 hero.append(identity,mark);root.append(hero,create('p','campus-details-intro',text.intro));

 const expand=create('button','campus-details-expand',text.expand);expand.type='button';
 expand.setAttribute('aria-expanded','false');expand.setAttribute('aria-controls',dialog?.id||root.id);
 expand.addEventListener('click',()=>{
  const expanded=root.dataset.expanded!=='true';root.dataset.expanded=String(expanded);
  if(dialog)dialog.dataset.expanded=String(expanded);
  expand.setAttribute('aria-expanded',String(expanded));expand.textContent=expanded?text.collapse:text.expand;
 });
 root.append(expand);

 const facts=create('dl','campus-details-facts');
 if(typeof campus.address==='string'&&campus.address.trim()){
  const group=create('div','campus-details-address'),term=create('dt','',text.address),description=create('dd');
  const address=create('address','',campus.address.trim());address.dir='auto';
  const copyButton=create('button','campus-details-copy',text.copyAddress);copyButton.type='button';
  const status=create('p','campus-details-copy-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  copyButton.addEventListener('click',async()=>{
   if(copying||destroyed)return;copying=true;copyButton.disabled=true;status.textContent='';
   try{
    if(typeof onCopyAddress==='function')await onCopyAddress(campus.address.trim());
    else{
     const clipboard=doc.defaultView?.navigator?.clipboard;
     if(typeof clipboard?.writeText!=='function')throw new Error('Clipboard unavailable');
     await clipboard.writeText(campus.address.trim());
    }
    if(!destroyed)status.textContent=text.copied;
   }catch{if(!destroyed)status.textContent=text.copyError;}
   finally{copying=false;if(!destroyed)copyButton.disabled=false;}
  });
  description.append(address,copyButton,status);group.append(term,description);facts.append(group);
 }
 if(facts.children.length)root.append(facts);

 const destination=resolveCampusWebsite(campus,language),url=destination?.url;
 if(url){
  const link=create('a','campus-details-link');link.href=url;link.target='_blank';link.rel='noopener noreferrer';if(destination.language)link.hreflang=destination.language;
  const label=create('span','',destination.kind==='campus-site'?text.website:text.profile);
  link.setAttribute('aria-label',label.textContent+' · '+campus.name+'. '+text.newTab);
  const arrow=doc.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('aria-hidden','true');
  const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M8 5h11v11M19 5 5 19');arrow.append(path);link.append(label,arrow);
  const note=create('p','campus-details-link-note',text.newTab);
  if(destination.isFallback&&destination.language){
   const translated=new Intl.DisplayNames(language,{type:'language'}).of(destination.language),prefix={fr:'Site en',en:'Website in',ar:'الموقع باللغة'}[language];
   note.textContent=prefix+' '+translated+' · '+text.newTab;
  }
  root.append(link,note);
  if(destination.manualLanguage){
   const translated=new Intl.DisplayNames(language,{type:'language'}).of(destination.manualLanguage);
   root.append(create('p','campus-details-link-note',{fr:'Pour afficher le site en '+translated+', utilise son menu de langue.',en:'Select '+translated+' from the website’s language menu.',ar:'اختر '+translated+' من قائمة اللغات في الموقع.'}[language]));
  }
 }

 const seen=new Set(),relatedEntries=(Array.isArray(entries)?entries:[]).filter(entry=>{
  if(!entry||entry.campus!==campus.id||!sections.includes(entry.section)||typeof entry.id!=='string'||!entry.id||!localized(entry.title,language)||seen.has(entry.id))return false;
  seen.add(entry.id);return true;
 });
 const related=create('section','campus-details-related'),heading=create('div','campus-details-related-heading');
 heading.append(create('h3','',text.related));
 if(relatedEntries.length)heading.append(create('p','campus-details-count',text.total(relatedEntries.length)));
 related.append(heading);
 function internalLink(className,route){
  const link=create('a',className);link.href=routeHref(route);
  link.addEventListener('click',event=>{
   if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   if(typeof onNavigate==='function')onNavigate({...route},event);
  });
  return link;
 }
 if(relatedEntries.length){
  related.append(create('p','campus-details-demo',text.demo));
  for(const section of sections){
   const matching=relatedEntries.filter(entry=>entry.section===section);if(!matching.length)continue;
   const entry=matching[0],group=create('section','campus-details-group'),groupHeading=create('div','campus-details-group-heading');
   groupHeading.append(create('h4','',text.sections[section]),create('span','campus-details-group-count',text.count[section](matching.length)));
   const card=internalLink('campus-details-card',contentRoute(campus,section,entry.id));
   const cover=create('div','campus-details-cover'),art=create('div','cp-art');cover.dataset.cover=entry.cover||'garden';cover.setAttribute('aria-hidden','true');art.innerHTML=coverArt(entry.cover);cover.append(art);
   const content=create('div','campus-details-card-copy');
   const eyebrow=localized(entry.eyebrow,language),summary=localized(entry.summary,language);
   if(eyebrow)content.append(create('p','campus-details-eyebrow',eyebrow));
   content.append(create('h5','',localized(entry.title,language)));
   if(summary)content.append(create('p','campus-details-summary',summary));
   card.append(cover,content);
   const browse=internalLink('campus-details-browse',contentRoute(campus,section));browse.textContent=text.browse[section];
   group.append(groupHeading,card,browse);related.append(group);
  }
 }else{
  const empty=create('div','campus-details-empty');
  empty.append(create('h4','',text.emptyTitle),create('p','',text.emptyText));related.append(empty);
 }
 root.append(related);container.append(root);
 return {element:root,destroy(){destroyed=true;root.remove();}};
}
