import {resolveCampusWebsite} from './campus-website.mjs?v=1';
import {mountCampusSheet} from './campus-sheet.mjs?v=1';

const copy={
 fr:{
  address:'Adresse',website:'Site officiel du campus',profile:'Fiche officielle · 42 Network',newTab:'S’ouvre dans un nouvel onglet',
  logo:'Emplacement du logo officiel',copyAddress:'Copier l’adresse',copied:'Adresse copiée.',
  copyError:'La copie automatique est indisponible. Sélectionnez l’adresse ci-dessus pour la copier.',
  photos:'Photos',noPhotos:'Photos non renseignées.',photoAlt:name=>'Photo de '+name,previousPhoto:'Photo précédente',nextPhoto:'Photo suivante',
  contacts:'Contacts',missing:'Non renseigné',directions:'Itinéraire',directionsLabel:'Itinéraire dans Google Maps',
  opening:'Date d’ouverture',piscines:'Prochaines Piscines',piscine:'Piscine',checkDates:'Dates à consulter sur le site officiel.',ongoing:'En cours',
  source:'Source',officialDates:'Consulter les dates officielles',verified:'Dernière vérification : ',
  stats:'Le campus en chiffres',students:'Étudiants',cohorts:'Promotions',alumni:'Alumni',missingStats:'Les chiffres non renseignés sont indiqués par un tiret.',asOf:'Au ',
 },
 en:{
  address:'Address',website:'Official campus website',profile:'Official profile · 42 Network',newTab:'Opens in a new tab',
  logo:'Official logo placeholder',copyAddress:'Copy address',copied:'Address copied.',
  copyError:'Automatic copying is unavailable. Select the address above to copy it.',
  photos:'Photos',noPhotos:'Photos not provided.',photoAlt:name=>'Photo of '+name,previousPhoto:'Previous photo',nextPhoto:'Next photo',
  contacts:'Contacts',missing:'Not provided',directions:'Directions',directionsLabel:'Directions in Google Maps',
  opening:'Opening date',piscines:'Upcoming Piscines',piscine:'Piscine',checkDates:'Check the official website for dates.',ongoing:'In progress',
  source:'Source',officialDates:'Check official dates',verified:'Last checked: ',
  stats:'Campus in figures',students:'Students',cohorts:'Cohorts',alumni:'Alumni',missingStats:'Figures that are not provided are shown as a dash.',asOf:'As of ',
 },
 ar:{
  address:'العنوان',website:'الموقع الرسمي للفرع',profile:'الصفحة الرسمية · 42 Network',newTab:'يفتح في علامة تبويب جديدة',
  logo:'مساحة للشعار الرسمي',copyAddress:'نسخ العنوان',copied:'تم نسخ العنوان.',
  copyError:'النسخ التلقائي غير متاح. حدّد العنوان أعلاه لنسخه.',
  photos:'الصور',noPhotos:'الصور غير متوفرة.',photoAlt:name=>'صورة لفرع '+name,previousPhoto:'الصورة السابقة',nextPhoto:'الصورة التالية',
  contacts:'التواصل',missing:'غير متوفر',directions:'الاتجاهات',directionsLabel:'الاتجاهات في خرائط Google',
  opening:'تاريخ الافتتاح',piscines:'فترات البيسين القادمة',piscine:'البيسين',checkDates:'راجع الموقع الرسمي للاطلاع على المواعيد.',ongoing:'جارية الآن',
  source:'المصدر',officialDates:'الاطلاع على المواعيد الرسمية',verified:'آخر تحقق: ',
  stats:'الفرع بالأرقام',students:'الطلاب',cohorts:'الدفعات',alumni:'الخريجون',missingStats:'تشير الشرطة إلى الأرقام غير المتوفرة.',asOf:'بتاريخ ',
 },
};
const localized=(value,locale)=>typeof value==='string'?value:value?.[locale]||value?.fr||value?.en||value?.ar||'';
let instanceCount=0;

function parsedDate(value){
 if(typeof value!=='string'||!/^\d{4}(?:-\d{2})?(?:-\d{2})?$/.test(value))return null;
 const [year,month=1,day=1]=value.split('-').map(Number),date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
 return {date,precision:value.length===10?'day':value.length===7?'month':'year'};
}
function dateText(value,locale){
 const parsed=parsedDate(value);if(!parsed)return '';
 return new Intl.DateTimeFormat(locale,{year:'numeric',...(parsed.precision!=='year'?{month:'long'}:{}),...(parsed.precision==='day'?{day:'numeric'}:{}),timeZone:'UTC'}).format(parsed.date);
}
function safeURL(value,{base,contact=false}={}){
 if(typeof value!=='string'||!value.trim())return null;
 try{
  const url=new URL(value,base);
  if(url.username||url.password)return null;
  return (['https:','http:',...(contact?['mailto:','tel:']:[])].includes(url.protocol))?url.href:null;
 }catch{return null;}
}

/** Render only catalogue/profile facts. A missing number is never inferred from
 * sample content, and a year-only opening date never acquires an invented day. */
export function mountCampusDetails({container,campus,countryName,locale='fr',profile={},onCopyAddress,now=new Date()}){
 const language=copy[locale]?locale:'fr',text=copy[language],doc=container.ownerDocument;
 profile=profile&&typeof profile==='object'?profile:{};
 const root=doc.createElement('section');root.className='campus-details';root.lang=language;root.dir=language==='ar'?'rtl':'ltr';
 root.id='campus-details-'+(++instanceCount);root.dataset.expanded='false';
 const dialog=container.closest?.('dialog');if(dialog)dialog.dataset.expanded='false';
 let destroyed=false,copying=false;
 const create=(tag,className,value)=>{const node=doc.createElement(tag);if(className)node.className=className;if(value!==undefined)node.textContent=value;return node;};
 const section=(className,title)=>{const node=create('section','campus-details-section '+className);node.append(create('h4','campus-details-section-title',title));return node;};
 const externalLink=(className,value,label,{contact=false}={})=>{
  const href=safeURL(value,{contact});if(!href)return null;
  const link=create('a',className,label);link.href=href;
  if(/^https?:/.test(href)){link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',label+'. '+text.newTab);}
  return link;
 };
 const sourceLink=value=>externalLink('campus-details-source',value,text.source);
 const region=typeof countryName==='function'?countryName(campus.country):countryName||campus.country;
 const hero=create('div','campus-details-hero'),identity=create('div','campus-details-logo-slot');
 const country=create('p','campus-details-country',region),name=create('h3','campus-details-name',campus.name);
 country.dir='auto';name.dir='auto';
 identity.append(create('p','campus-details-logo-label',text.logo),name);
 hero.append(identity,country);root.append(hero);

 const photos=section('campus-details-photos',text.photos);
 const availablePhotos=(Array.isArray(profile.photos)?profile.photos:[]).map(photo=>({...photo,src:safeURL(photo?.src,{base:doc.baseURI||'https://horizon.invalid/'})})).filter(photo=>photo.src);
 if(availablePhotos.length){
  const gallery=create('div','campus-details-gallery');gallery.id=root.id+'-photos';
  const figures=availablePhotos.map((photo,index)=>{
   const figure=create('figure','campus-details-photo'),image=create('img','campus-details-photo-image');
   image.src=photo.src;image.alt=localized(photo.alt,language)||text.photoAlt(campus.name);image.loading=index?'lazy':'eager';image.decoding='async';
   figure.hidden=index!==0;figure.append(image);
   const credit=localized(photo.credit,language),source=sourceLink(photo.sourceUrl);
   if(credit||source){const caption=create('figcaption','campus-details-photo-caption');if(credit)caption.append(create('span','',credit));if(source)caption.append(source);figure.append(caption);}
   gallery.append(figure);return figure;
  });
  photos.append(gallery);
  if(figures.length>1){
   let active=0;const controls=create('div','campus-details-photo-controls');
   const previous=create('button','campus-details-photo-prev',language==='ar'?'→':'←'),next=create('button','campus-details-photo-next',language==='ar'?'←':'→'),status=create('span','campus-details-photo-status');
   for(const [button,label]of [[previous,text.previousPhoto],[next,text.nextPhoto]]){button.type='button';button.setAttribute('aria-label',label);button.setAttribute('aria-controls',gallery.id);}
   status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
   const show=index=>{active=(index+figures.length)%figures.length;figures.forEach((figure,i)=>{figure.hidden=i!==active;});status.textContent=new Intl.NumberFormat(language).format(active+1)+' / '+new Intl.NumberFormat(language).format(figures.length);};
   previous.addEventListener('click',()=>show(active-1));next.addEventListener('click',()=>show(active+1));show(0);
   controls.append(previous,status,next);photos.append(controls);
  }
 }else photos.append(create('p','campus-details-empty',text.noPhotos));
 root.append(photos);

 const facts=create('dl','campus-details-facts'),addressValue=typeof campus.address==='string'?campus.address.trim():'';
 const addressGroup=create('div','campus-details-address'),addressTerm=create('dt','',text.address),addressDescription=create('dd');
 if(addressValue){
  const address=create('address','',addressValue);address.dir='auto';
  const copyButton=create('button','campus-details-copy',text.copyAddress);copyButton.type='button';
  const status=create('p','campus-details-copy-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  copyButton.addEventListener('click',async()=>{
   if(copying||destroyed)return;copying=true;copyButton.disabled=true;status.textContent='';
   try{
    if(typeof onCopyAddress==='function')await onCopyAddress(addressValue);
    else{const clipboard=doc.defaultView?.navigator?.clipboard;if(typeof clipboard?.writeText!=='function')throw new Error('Clipboard unavailable');await clipboard.writeText(addressValue);}
    if(!destroyed)status.textContent=text.copied;
   }catch{if(!destroyed)status.textContent=text.copyError;}
   finally{copying=false;if(!destroyed)copyButton.disabled=false;}
  });
  addressDescription.append(address,copyButton,status);
 }else addressDescription.append(create('p','campus-details-empty',text.missing));
 if(addressValue){
  const directionsURL=new URL('https://www.google.com/maps/dir/');directionsURL.searchParams.set('api','1');directionsURL.searchParams.set('destination',campus.name+', '+addressValue.replace(/\s+/g,' '));
  const directions=externalLink('campus-details-directions',directionsURL.href,text.directions);
  directions.setAttribute('aria-label',text.directionsLabel);addressDescription.append(directions);
 }
 addressGroup.append(addressTerm,addressDescription);facts.append(addressGroup);root.append(facts);

 const contacts=section('campus-details-contacts',text.contacts);
 const availableContacts=(Array.isArray(profile.contacts)?profile.contacts:[]).filter(contact=>localized(contact?.value,language));
 if(availableContacts.length){
  const list=create('ul','campus-details-contact-list');
  for(const contact of availableContacts){
   const item=create('li'),label=localized(contact.label,language),value=localized(contact.value,language);
   if(label)item.append(create('span','campus-details-contact-label',label));
   const link=externalLink('campus-details-contact-value',contact.href,value,{contact:true});
   const valueNode=link||create('span','campus-details-contact-value',value);valueNode.dir='auto';item.append(valueNode);list.append(item);
  }
  contacts.append(list);const contactSource=sourceLink(profile.contactSourceUrl);if(contactSource)contacts.append(contactSource);
 }else contacts.append(create('p','campus-details-empty',text.missing));
 root.append(contacts);

 const actions=create('div','campus-details-actions'),destination=resolveCampusWebsite(campus,language),url=destination?.url,websiteNotes=[];
 if(url){
  const label=destination.kind==='campus-site'?text.website:text.profile,link=externalLink('campus-details-link',url,label);
  if(destination.language)link.hreflang=destination.language;
  link.setAttribute('aria-label',label+' · '+campus.name+'. '+text.newTab);
  if(destination.isFallback&&destination.language){
   const translated=new Intl.DisplayNames(language,{type:'language'}).of(destination.language),prefix={fr:'Site en',en:'Website in',ar:'الموقع باللغة'}[language];
   websiteNotes.push(create('p','campus-details-link-note',prefix+' '+translated));
  }
  actions.append(link);
  if(destination.manualLanguage){
   const translated=new Intl.DisplayNames(language,{type:'language'}).of(destination.manualLanguage);
   websiteNotes.push(create('p','campus-details-link-note',{fr:'Pour afficher le site en '+translated+', utilise son menu de langue.',en:'Select '+translated+' from the website’s language menu.',ar:'اختر '+translated+' من قائمة اللغات في الموقع.'}[language]));
  }
 }
 if(actions.children.length)contacts.append(actions);
 if(websiteNotes.length)contacts.append(...websiteNotes);

 const opening=section('campus-details-opening',text.opening);
 const openingLabel=localized(profile.openedLabel,language)||dateText(profile.openedOn,language);
 const openingDate=create('p','campus-details-opening-date',openingLabel||text.missing);
 if(openingLabel&&parsedDate(profile.openedOn)){
  const time=create('time','',openingLabel);time.dateTime=profile.openedOn;openingDate.textContent='';openingDate.append(time);
 }
 opening.append(openingDate);const openingSource=sourceLink(profile.openedSourceUrl);if(openingLabel&&openingSource)opening.append(openingSource);root.append(opening);

 const stats=section('campus-details-stats',text.stats),statGrid=create('dl','campus-details-stat-grid');let missingStats=false;
 for(const key of ['students','cohorts','alumni']){
  const stat=profile.stats?.[key],raw=stat?.value,validNumber=typeof raw==='number'&&Number.isFinite(raw)&&raw>=0;
  const label=typeof raw==='string'?raw.trim():'',available=validNumber||Boolean(label);
  const item=create('div','campus-details-stat');item.dataset.available=String(available);
  item.append(create('dt','',text[key]),create('dd','campus-details-stat-value',available?(validNumber?new Intl.NumberFormat(language).format(raw):label):'—'));
  if(available){
   const dated=dateText(stat.asOf,language);
   if(dated){const note=create('p','campus-details-stat-date',text.asOf),time=create('time','',dated);time.dateTime=stat.asOf;note.append(time);item.append(note);}
   const source=sourceLink(stat.sourceUrl);if(source)item.append(source);
  }else missingStats=true;
  statGrid.append(item);
 }
 stats.append(statGrid);if(missingStats)stats.append(create('p','campus-details-stat-note',text.missingStats));root.append(stats);

 const piscines=section('campus-details-piscines',text.piscines);
 let today=new Date(now);if(Number.isNaN(today.getTime()))today=new Date();
 const todayUTC=Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate());
 const availablePiscines=(Array.isArray(profile.piscines)?profile.piscines:[]).map(item=>{
  const start=parsedDate(item?.startsOn),end=parsedDate(item?.endsOn);
  if(start?.precision!=='day'||(item.endsOn&&end?.precision!=='day'))return null;
  const last=end?.date||start.date;if(last<start.date||last.getTime()<todayUTC)return null;
  return {...item,start,end};
 }).filter(Boolean).sort((a,b)=>a.start.date-b.start.date);
 if(availablePiscines.length){
  const list=create('ul','campus-details-piscine-list');
  for(const item of availablePiscines){
   const row=create('li'),label=localized(item.label,language);
   row.append(create('p','campus-details-piscine-label',label||text.piscine));
   const dates=create('p','campus-details-piscine-dates'),start=create('time','',dateText(item.startsOn,language));start.dateTime=item.startsOn;dates.append(start);
   if(item.endsOn){dates.append(create('span','',' — '));const end=create('time','',dateText(item.endsOn,language));end.dateTime=item.endsOn;dates.append(end);}
   row.append(dates);
   if(item.start.date.getTime()<=todayUTC)row.append(create('p','campus-details-piscine-state',text.ongoing));
   const source=sourceLink(item.sourceUrl);if(source)row.append(source);list.append(row);
  }
  piscines.append(list);
 }else piscines.append(create('p','campus-details-empty',text.checkDates));
 const piscineNote=localized(profile.piscinesNote,language);if(piscineNote)piscines.append(create('p','campus-details-piscine-note',piscineNote));
 const datesLink=externalLink('campus-details-source campus-details-dates-link',profile.piscineSourceUrl||(!availablePiscines.length?url:null),text.officialDates);
 if(datesLink)piscines.append(datesLink);root.append(piscines);
 const verified=dateText(profile.verifiedAt,language);
 if(verified){const note=create('p','campus-details-verified',text.verified),time=create('time','',verified);time.dateTime=profile.verifiedAt;note.append(time);root.append(note);}
 container.append(root);
 const sheet=dialog?mountCampusSheet({dialog}):null;
 return {element:root,destroy(){destroyed=true;sheet?.destroy();root.remove();}};
}
