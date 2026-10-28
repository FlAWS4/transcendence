/* Campus sheet of the version B Explorer « Halo » (SPEC-B-HALO §5.2–5.7, §5.9, §7.4; 25 Oct 2026). Validating a
 * campus unfolds halo's three-column sheet in place of the carousel, inside #explorer's band: photos as a stack of
 * prints and the contacts on one wing; the printed logo on its lantern, the name, the country, the facts and the
 * website at the heart; the address and the Piscines on the other wing; one honest « Pas encore renseignés ici : … »
 * line. Every fact keeps A's rules exactly (campus-details.mjs: safe URLs, localised photos, alternative texts and
 * credits, the clipboard flow, the Piscines filtering, the website notes and the Source links). The printed logo,
 * the country's locator silhouette and the icons come through `art` (never imported here); without it every text
 * stays. Only container.ownerDocument and its defaultView are used, each optional API feature-tested (§7.4 D13), so a
 * fake document can drive the whole module. B chooses the layout (`data-layout`) and, in the wide layout of a normal
 * band, the first step of the fit cascade that fits without scrolling (`data-fit`, §5.6). */
import {resolveCampusWebsite} from './campus-website.mjs?v=1';
import {openMediaViewer} from './media-viewer.mjs?v=1';

// Halo's strings (mock-up halo.js) where it has some, A's strings (campus-details.mjs) elsewhere (§5.4).
const copy={
 fr:{
  photos:'Photos',enlarge:'Agrandir la photo',prevPhoto:'Photo précédente',nextPhoto:'Photo suivante',photoAlt:name=>'Photo de '+name,
  contacts:'Contacts',address:'Adresse',copy:'Copier l’adresse',copied:'Adresse copiée.',
  copyError:'La copie automatique est indisponible. Sélectionnez l’adresse ci-dessus pour la copier.',
  directions:'Itinéraire',directionsLabel:'Itinéraire dans Google Maps',
  website:'Site officiel du campus',profile:'Fiche officielle · 42 Network',newTab:'S’ouvre dans un nouvel onglet',
  siteIn:name=>'Site en '+name,siteMenu:name=>'Pour afficher le site en '+name+', utilise son menu de langue.',
  opening:'Ouverture',students:'Étudiants',cohorts:'Promotions',alumni:'Alumni',asOf:'en {date}',asOfDay:'au {date}',source:'Source',
  piscines:'Prochaines Piscines',piscine:'Piscine',upcoming:'Prochaine',ongoing:'En cours',
  checkDates:'Les dates des Piscines sont publiées sur le site officiel du campus.',officialDates:'Consulter les dates officielles',
  verified:'Dernière vérification : ',missingIntro:'Pas encore renseignés ici : ',
  missing:{photos:'photos',contacts:'contacts',opening:'date d’ouverture',figures:'chiffres',students:'étudiants',cohorts:'promotions',alumni:'alumni'},
  comma:', ',and:' et ',locator:'Où se trouve {campus}',empty:'Non renseigné',
 },
 en:{
  photos:'Photos',enlarge:'Enlarge photo',prevPhoto:'Previous photo',nextPhoto:'Next photo',photoAlt:name=>'Photo of '+name,
  contacts:'Contacts',address:'Address',copy:'Copy address',copied:'Address copied.',
  copyError:'Automatic copying is unavailable. Select the address above to copy it.',
  directions:'Directions',directionsLabel:'Directions in Google Maps',
  website:'Official campus website',profile:'Official profile · 42 Network',newTab:'Opens in a new tab',
  siteIn:name=>'Website in '+name,siteMenu:name=>'Select '+name+' from the website’s language menu.',
  opening:'Opened',students:'Students',cohorts:'Cohorts',alumni:'Alumni',asOf:'in {date}',asOfDay:'as of {date}',source:'Source',
  piscines:'Upcoming Piscines',piscine:'Piscine',upcoming:'Next',ongoing:'In progress',
  checkDates:'Piscine dates are published on the official campus website.',officialDates:'Check official dates',
  verified:'Last checked: ',missingIntro:'Not provided here yet: ',
  missing:{photos:'photos',contacts:'contacts',opening:'opening date',figures:'figures',students:'students',cohorts:'cohorts',alumni:'alumni'},
  comma:', ',and:' and ',locator:'Where {campus} is',empty:'Not provided',
 },
 ar:{
  photos:'الصور',enlarge:'تكبير الصورة',prevPhoto:'الصورة السابقة',nextPhoto:'الصورة التالية',photoAlt:name=>'صورة لفرع '+name,
  contacts:'التواصل',address:'العنوان',copy:'نسخ العنوان',copied:'تم نسخ العنوان.',
  copyError:'النسخ التلقائي غير متاح. حدّد العنوان أعلاه لنسخه.',
  directions:'الاتجاهات',directionsLabel:'الاتجاهات في خرائط Google',
  website:'الموقع الرسمي للفرع',profile:'الصفحة الرسمية · 42 Network',newTab:'يفتح في علامة تبويب جديدة',
  siteIn:name=>'الموقع باللغة '+name,siteMenu:name=>'اختر '+name+' من قائمة اللغات في الموقع.',
  opening:'الافتتاح',students:'الطلاب',cohorts:'الدفعات',alumni:'الخريجون',asOf:'في {date}',asOfDay:'في {date}',source:'المصدر',
  piscines:'فترات البيسين القادمة',piscine:'البيسين',upcoming:'القادمة',ongoing:'جارية الآن',
  checkDates:'تُنشر مواعيد البيسين على الموقع الرسمي للفرع.',officialDates:'الاطلاع على المواعيد الرسمية',
  verified:'آخر تحقق: ',missingIntro:'لم تُضف هنا بعد: ',
  missing:{photos:'الصور',contacts:'جهات التواصل',opening:'تاريخ الافتتاح',figures:'الأرقام',students:'الطلاب',cohorts:'الدفعات',alumni:'الخريجون'},
  comma:'، ',and:' و',locator:'موقع {campus}',empty:'غير متوفر',
 },
};
const FIGURES=['students','cohorts','alumni'];
// The fit cascade of §5.6: each step adds to the previous one; `scroll` is halo's own overflow state.
const STEPS=['full','snug','tight','tighter'];
// The lantern's logo box (halo: .76 × .36 of the lantern in the sheet) and the diameter assumed before layout.
const LOGO_W=.76,LOGO_H=.36,FIRST_D=160;
let instanceCount=0;

const languageOf=locale=>{const code=String(locale||'fr').toLowerCase().split(/[-_]/)[0];return Object.hasOwn(copy,code)?code:'fr';};
const localized=(value,language)=>typeof value==='string'?value:value?.[language]||value?.fr||value?.en||value?.ar||'';
// « a, b et c » (FR), « a, b and c » (EN), « a، b وc » (AR, R18).
const joinList=(items,text)=>items.length<2?items.join(''):items.slice(0,-1).join(text.comma)+text.and+items[items.length-1];
const tagOf=language=>language==='ar'?'ar-u-nu-latn':language;
const metric=value=>{const number=Number(value);return Number.isFinite(number)?number:0;};
function parsedDate(value){
 if(typeof value!=='string'||!/^\d{4}(?:-\d{2})?(?:-\d{2})?$/.test(value))return null;
 const [year,month=1,day=1]=value.split('-').map(Number),date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
 return {date,precision:value.length===10?'day':value.length===7?'month':'year'};
}
// A's dateText with Latin digits (§2.3): a date never gains a month or a day it does not have.
function dateText(value,language){
 const parsed=parsedDate(value);if(!parsed)return '';
 return new Intl.DateTimeFormat(tagOf(language),{year:'numeric',...(parsed.precision!=='year'?{month:'long'}:{}),...(parsed.precision==='day'?{day:'numeric'}:{}),timeZone:'UTC'}).format(parsed.date);
}
function safeURL(value,{base,contact=false}={}){
 if(typeof value!=='string'||!value.trim())return null;
 try{
  const url=new URL(value,base);
  if(url.username||url.password)return null;
  return (['https:','http:',...(contact?['mailto:','tel:']:[])].includes(url.protocol))?url.href:null;
 }catch{return null;}
}
const viewBoxSize=viewBox=>{const values=String(viewBox??'').trim().split(/[\s,]+/).map(Number);return values.length===4&&values.every(Number.isFinite)&&values[2]>0&&values[3]>0?[values[2],values[3]]:null;};
// Halo's fit of a logo in its box when `art` has no fitLogo: as tall as the box allows, never wider than it.
const fitInBox=(print,maxW,maxH)=>{const ratio=Number(print?.aspectRatio)>0?Number(print.aspectRatio):3,height=Math.min(maxH,maxW/ratio);return {width:height*ratio,height};};

export function mountExplorerCampus({container,campus,country=null,locale='fr',headingId,art=null,now=new Date(),onCopyAddress,onOpenMedia=openMediaViewer}){
 const language=languageOf(locale),text=copy[language],doc=container.ownerDocument,view=doc.defaultView||null;
 const profile=campus?.profile&&typeof campus.profile==='object'?campus.profile:{};
 const base=doc.baseURI||'https://horizon.invalid/',n=++instanceCount;
 const numbers=new Intl.NumberFormat(tagOf(language),{numberingSystem:'latn'});
 const countryName=typeof country?.name==='string'&&country.name?country.name:String(campus.country||'');
 const disposers=[];
 let destroyed=false,copying=false,mediaView=null,observer=null,last=null;

 const create=(tag,className,value)=>{const node=doc.createElement(tag);if(className)node.className=className;if(value!==undefined)node.textContent=value;return node;};
 // Icons come from the art module (halo's sprite paths drawn inline); without it nothing is appended (§7.4).
 const icon=name=>{const node=typeof art?.icon==='function'?art.icon(doc,name):null;return node||null;};
 const withIcon=(node,name)=>{const glyph=icon(name);if(glyph)node.append(glyph);return node;};
 const unhide=node=>{if(typeof node.removeAttribute==='function')node.removeAttribute('aria-hidden');else node.setAttribute('aria-hidden','false');};
 const clear=node=>{if(typeof node.replaceChildren==='function')node.replaceChildren();else for(const child of [...node.children])child.remove();};
 const timeNode=(value,label)=>{const time=create('time','',label);time.dateTime=value;return time;};
 const newTab=(link,label)=>{link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',label+'. '+text.newTab);return link;};
 // A's external links: only safe absolute URLs (as A, no base: only photos resolve against the page); http(s) ones
 // open a new tab and say so. `content` false leaves the link empty for a caller that composes its text with an icon.
 const externalLink=(className,value,label,{contact=false,content=true}={})=>{
  const href=safeURL(value,{contact});if(!href)return null;
  const link=create('a',className,content?label:undefined);link.href=href;
  if(/^https?:/.test(href))newTab(link,label);
  return link;
 };
 // « Source » keeps A's text and accessible name (§5.4): « Source. S’ouvre dans un nouvel onglet ».
 const sourceLink=(value,className='explorer-sheet-source')=>externalLink(className,value,text.source);
 const title=label=>create('h3','',label);
 const languageName=code=>{try{return new Intl.DisplayNames(language,{type:'language'}).of(code)||code;}catch{return code;}};

 // ---- facts (A's rules) ----
 const photos=(Array.isArray(profile.photos)?profile.photos:[]).map(photo=>({...photo,src:safeURL(photo?.src,{base})})).filter(photo=>photo.src);
 const contacts=(Array.isArray(profile.contacts)?profile.contacts:[]).filter(contact=>localized(contact?.value,language));
 const openingLabel=localized(profile.openedLabel,language)||dateText(profile.openedOn,language);
 const stats=FIGURES.flatMap(key=>{
  const stat=profile.stats?.[key],raw=stat?.value,validNumber=typeof raw==='number'&&Number.isFinite(raw)&&raw>=0;
  const label=typeof raw==='string'?raw.trim():'';
  return validNumber||label?[{key,stat,value:validNumber?numbers.format(raw):label}]:[];
 });
 const addressValue=typeof campus.address==='string'?campus.address.trim():'';
 const destination=resolveCampusWebsite(campus,language),websiteURL=safeURL(destination?.url);
 let today=new Date(now);if(Number.isNaN(today.getTime()))today=new Date();
 const todayUTC=Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate());
 const piscines=(Array.isArray(profile.piscines)?profile.piscines:[]).map(item=>{
  const start=parsedDate(item?.startsOn),end=parsedDate(item?.endsOn);
  if(start?.precision!=='day'||(item.endsOn&&end?.precision!=='day'))return null;
  const lastDay=end?.date||start.date;if(lastDay<start.date||lastDay.getTime()<todayUTC)return null;
  return {...item,start,end};
 }).filter(Boolean).sort((a,b)=>a.start.date-b.start.date);
 // What is missing is said once (§5.5): photos → contacts → opening → figures, or each absent figure.
 const absent=FIGURES.filter(key=>!stats.some(stat=>stat.key===key));
 const missing=[
  ...(photos.length?[]:['photos']),...(contacts.length?[]:['contacts']),...(openingLabel?[]:['opening']),
  ...(stats.length?absent:['figures']),
 ];
 const sparse=!photos.length&&!contacts.length&&!openingLabel&&!stats.length;

 const root=create('div','explorer-sheet');
 const rootId='explorer-sheet-'+n;
 root.id=rootId;root.lang=language;root.dir=language==='ar'?'rtl':'ltr';
 root.dataset.layout='wide';root.dataset.fit='full';root.dataset.sparse=String(sparse);

 // ---- heart: the printed logo on its lantern, the name, the country, the facts, the website ----
 const heart=create('div','explorer-sheet-heart');
 const print=campus.logo?.print||null;
 const fitLogo=(maxW,maxH)=>typeof art?.fitLogo==='function'?art.fitLogo(print,maxW,maxH):fitInBox(print,maxW,maxH);
 let lantern=null,logo=null;
 if(print&&typeof art?.createPrintedLogo==='function'){
  logo=art.createPrintedLogo(doc,{print,...fitLogo(LOGO_W*FIRST_D,LOGO_H*FIRST_D),baseURI:base})||null;
  if(logo){lantern=create('span','explorer-sheet-lantern');lantern.setAttribute('aria-hidden','true');lantern.append(logo);heart.append(lantern);}
 }
 const heading=create('h2','explorer-sheet-title');
 heading.id=headingId||rootId+'-title';heading.tabIndex=-1;heading.setAttribute('tabindex','-1');
 heading.append(create('bdi','',campus.name));
 // A Latin-script name (every catalogue name) may keep halo's line height under Arabic: the short wide heart uses it so
 // its website pill clears the bottom fade (fixes of 25 Oct 2026, item 11).
 if(/^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]+$/u.test(String(campus.name??'')))heading.dataset.script='latin';
 const countryLine=create('p','explorer-sheet-country');
 if(country?.flagHref){
  const flag=create('img','explorer-sheet-flag');
  flag.alt='';flag.width=20;flag.height=15;flag.decoding='async';flag.src=country.flagHref;countryLine.append(flag);
 }
 const countryText=create('span','',countryName);countryText.dir='auto';countryLine.append(countryText);
 heart.append(heading,countryLine);
 const heartItems=[heading,countryLine];

 const facts=[
  ...(openingLabel?[{key:'opening',label:text.opening,value:openingLabel,time:parsedDate(profile.openedOn)?profile.openedOn:null,source:profile.openedSourceUrl}]:[]),
  ...stats.map(({key,stat,value})=>({key,label:text[key],value,asOf:stat.asOf,source:stat.sourceUrl})),
 ];
 if(facts.length){
  const list=create('dl','explorer-sheet-facts');
  for(const fact of facts){
   const group=create('div','explorer-sheet-fact'),term=create('dt'),detail=create('dd');
   group.dataset.key=fact.key;
   // Numbers stay LTR inside any sentence (« 5 000+ » in Arabic); a date keeps the reading direction.
   if(fact.time)detail.append(timeNode(fact.time,fact.value));
   else{const value=create('span','',fact.value);value.dir=fact.key==='opening'?'auto':'ltr';detail.append(value);}
   term.append(create('span','explorer-sheet-fact-label',fact.label));
   const dated=dateText(fact.asOf,language);
   if(dated){
    const asOf=create('span','explorer-sheet-asof'),[before,after='']=(parsedDate(fact.asOf).precision==='day'?text.asOfDay:text.asOf).split('{date}');
    if(before)asOf.append(create('span','',before));
    asOf.append(timeNode(fact.asOf,dated));
    if(after)asOf.append(create('span','',after));
    term.append(create('span','',' · '),asOf);
   }
   const source=sourceLink(fact.source);if(source)term.append(create('span','',' · '),source);
   group.append(term,detail);list.append(group);
  }
  heart.append(list);heartItems.push(list);
 }
 if(websiteURL){
  const label=destination.kind==='campus-site'?text.website:text.profile;
  const link=create('a','explorer-sheet-cta');link.href=websiteURL;newTab(link,label+' · '+campus.name);
  if(destination.language)link.hreflang=destination.language;
  link.append(create('span','',label));withIcon(link,'external');
  heart.append(link);heartItems.push(link);
  const notes=[
   ...(destination.isFallback&&destination.language?[text.siteIn(languageName(destination.language))]:[]),
   ...(destination.manualLanguage?[text.siteMenu(languageName(destination.manualLanguage))]:[]),
  ].map(note=>create('p','explorer-sheet-note',note));
  heart.append(...notes);heartItems.push(...notes);
 }
 const verifiedText=dateText(profile.verifiedAt,language);
 if(verifiedText){
  const verified=create('p','explorer-sheet-verified');
  verified.append(create('span','',text.verified),timeNode(profile.verifiedAt,verifiedText));
  heart.append(verified);heartItems.push(verified);
 }

 // ---- start wing: the photos as a stack of prints, or the campus's place in its country; the contacts ----
 const start=create('div','explorer-sheet-wing');start.dataset.wing='start';
 let locatorArt=null;
 if(photos.length){
  const section=create('section','explorer-sheet-section explorer-sheet-photos');
  const stack=create('div','explorer-sheet-stack');stack.id=rootId+'-photos';
  const items=photos.map(photo=>{
   const alt=localized(photo.alt,language)||text.photoAlt(campus.name);
   return {type:'image',src:photo.src,alt,caption:localized(photo.caption,language)||text.photoAlt(campus.name),credit:localized(photo.credit,language)};
  });
  const prints=photos.map((photo,index)=>{
   const figure=create('figure','explorer-sheet-photo'),open=create('button','explorer-sheet-photo-open'),image=create('img','explorer-sheet-photo-image');
   image.src=photo.src;image.alt=items[index].alt;image.loading=index?'lazy':'eager';image.decoding='async';
   open.type='button';open.setAttribute('aria-haspopup','dialog');open.setAttribute('aria-label',text.enlarge+' : '+items[index].alt);
   const expand=create('span','explorer-sheet-expand');expand.setAttribute('aria-hidden','true');withIcon(expand,'expand');
   open.append(image,expand);
   open.addEventListener('click',()=>{if(!destroyed)mediaView=onOpenMedia({items,index,locale:language,trigger:open});});
   figure.append(open);stack.append(figure);return figure;
  });
  const bar=create('div','explorer-sheet-photo-bar'),credit=create('p','explorer-sheet-credit');
  let active=0,count=null;
  // The front print is the active photo; the next ones wait behind it, tilted, out of the accessibility tree.
  const turn=index=>{
   active=(index+prints.length)%prints.length;
   prints.forEach((figure,i)=>{
    const depth=(i-active+prints.length)%prints.length;
    figure.dataset.depth=String(Math.min(depth,2));
    // Deeper prints keep their order under the third one, as in halo (10, 9, 8, 7…).
    figure.style?.setProperty?.('z-index',String(10-depth));
    if(depth){figure.setAttribute('aria-hidden','true');figure.inert=true;}
    else{unhide(figure);figure.inert=false;}
   });
   if(count)count.textContent=numbers.format(active+1)+' / '+numbers.format(prints.length);
   clear(credit);
   const author=localized(photos[active].credit,language),source=sourceLink(photos[active].sourceUrl,'');
   if(author){const name=create('bdi','',author);name.dir='auto';credit.append(name);}
   // « · Source » never splits when the credit wraps: the only break is the space before it (item 13).
   if(author&&source){const tail=create('span','explorer-sheet-credit-tail','· ');tail.append(source);credit.append(create('span','',' '),tail);}
   else if(source)credit.append(source);
   credit.hidden=!author&&!source;
  };
  if(prints.length>1){
   const previous=create('button','explorer-sheet-photo-nav explorer-sheet-photo-prev'),next=create('button','explorer-sheet-photo-nav explorer-sheet-photo-next');
   count=create('span','explorer-sheet-photo-count');
   for(const [button,label,glyph] of [[previous,text.prevPhoto,'prev'],[next,text.nextPhoto,'next']]){
    button.type='button';button.setAttribute('aria-label',label);button.setAttribute('aria-controls',rootId+'-photos');withIcon(button,glyph);
   }
   count.setAttribute('role','status');count.setAttribute('aria-live','polite');count.setAttribute('aria-atomic','true');count.dir='ltr';
   previous.addEventListener('click',()=>{if(!destroyed)turn(active-1);});next.addEventListener('click',()=>{if(!destroyed)turn(active+1);});
   bar.append(previous,count,next);
  }
  bar.append(credit);turn(0);
  section.append(title(text.photos),stack,bar);start.append(section);
 }else{
  // No photo: the campus's place in its country takes the photos' place (§5.5).
  const figure=create('figure','explorer-sheet-section explorer-sheet-locator'),caption=create('figcaption');
  // The figure is named by its caption (item 12).
  const captionId=rootId+'-locator';caption.id=captionId;figure.setAttribute('aria-labelledby',captionId);
  const [before,after='']=text.locator.split('{campus}');
  if(before)caption.append(create('span','',before));
  caption.append(create('bdi','',campus.name));
  if(after)caption.append(create('span','',after));
  if(country?.shape&&typeof art?.createSilhouette==='function'&&viewBoxSize(country.shape.viewBox)){
   locatorArt=create('span','explorer-sheet-locator-art');locatorArt.setAttribute('aria-hidden','true');
   const [width,height]=viewBoxSize(country.shape.viewBox);
   locatorArt.style?.setProperty?.('--ratio',String(Math.round(width/height*10000)/10000));
   figure.append(locatorArt);
  }
  figure.append(caption);start.append(figure);
 }
 if(contacts.length){
  const section=create('section','explorer-sheet-section explorer-sheet-contacts'),list=create('ul','explorer-sheet-contact-list');
  for(const contact of contacts){
   const item=create('li'),label=localized(contact.label,language),value=localized(contact.value,language);
   if(label)item.append(create('span','explorer-sheet-contact-label',label));
   const link=externalLink('explorer-sheet-link explorer-sheet-contact-value',contact.href,value,{contact:true});
   const valueNode=link||create('span','explorer-sheet-contact-value',value);valueNode.dir='auto';
   item.append(valueNode);list.append(item);
  }
  section.append(title(text.contacts),list);
  const source=sourceLink(profile.contactSourceUrl,'');
  if(source){const line=create('p','explorer-sheet-source');line.append(source);section.append(line);}
  start.append(section);
 }

 // ---- end wing: the address and its two actions, the Piscines, the missing line ----
 const end=create('div','explorer-sheet-wing');end.dataset.wing='end';
 const where=create('section','explorer-sheet-section explorer-sheet-address');where.append(title(text.address));
 if(addressValue){
  const address=create('address','',addressValue);address.dir='auto';
  const actions=create('div','explorer-sheet-actions'),copyButton=create('button','explorer-sheet-pill explorer-sheet-copy');
  copyButton.type='button';withIcon(copyButton,'copy');copyButton.append(create('span','',text.copy));
  const status=create('p','explorer-sheet-status');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  copyButton.addEventListener('click',async()=>{
   if(copying||destroyed)return;copying=true;copyButton.disabled=true;status.textContent='';
   try{
    if(typeof onCopyAddress==='function')await onCopyAddress(addressValue);
    else{const clipboard=view?.navigator?.clipboard;if(typeof clipboard?.writeText!=='function')throw new Error('Clipboard unavailable');await clipboard.writeText(addressValue);}
    if(!destroyed)status.textContent=text.copied;
   }catch{if(!destroyed)status.textContent=text.copyError;}
   finally{copying=false;if(!destroyed)copyButton.disabled=false;}
  });
  const route=new URL('https://www.google.com/maps/dir/');
  route.searchParams.set('api','1');route.searchParams.set('destination',campus.name+', '+addressValue.replace(/\s+/g,' '));
  const directions=create('a','explorer-sheet-pill explorer-sheet-directions');
  directions.href=route.href;directions.target='_blank';directions.rel='noopener noreferrer';directions.setAttribute('aria-label',text.directionsLabel);
  withIcon(directions,'route');directions.append(create('span','',text.directions));
  actions.append(copyButton,directions);where.append(address,actions,status);
 }else where.append(create('p','explorer-sheet-note',text.empty));
 end.append(where);

 const pool=create('section','explorer-sheet-section explorer-sheet-piscines');pool.append(title(text.piscines));
 // A's dates link: the published schedule, or the website when nothing is upcoming.
 const datesValue=profile.piscineSourceUrl||(!piscines.length?destination?.url:null),datesHref=safeURL(datesValue);
 if(piscines.length){
  const range=new Intl.DateTimeFormat(tagOf(language),{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const nextIndex=piscines.findIndex(item=>item.start.date.getTime()>todayUTC);
  // The text shown stays formatRange's; its start and end parts become A's <time datetime> (item 14). formatRangeToParts
  // splits the range into start, end and shared parts (« 25 janv. » · « – » · « 19 févr. » · « 2027 »): consecutive
  // parts of one source are joined, the start and end ones are time elements, the shared ones plain text.
  const datesOf=item=>{
   const line=create('p','explorer-sheet-piscine-dates');
   if(!item.end){line.append(timeNode(item.startsOn,range.format(item.start.date)));return line;}
   if(typeof range.formatRangeToParts!=='function'){
    line.append(timeNode(item.startsOn,range.format(item.start.date)),create('span','',' – '),timeNode(item.endsOn,range.format(item.end.date)));
    return line;
   }
   const segments=[];
   for(const part of range.formatRangeToParts(item.start.date,item.end.date)){
    const last=segments[segments.length-1];
    if(last?.source===part.source)last.text+=part.value;else segments.push({source:part.source,text:part.value});
   }
   // A range of one day has only shared parts: the whole text is the start date.
   if(!segments.some(segment=>segment.source==='startRange')){line.append(timeNode(item.startsOn,segments.map(segment=>segment.text).join('')));return line;}
   line.append(...segments.map(({source,text})=>source==='startRange'?timeNode(item.startsOn,text):source==='endRange'?timeNode(item.endsOn,text):create('span','',text)));
   return line;
  };
  const list=create('ul','explorer-sheet-timeline');
  piscines.forEach((item,index)=>{
   const row=create('li','explorer-sheet-piscine'),name=create('p','explorer-sheet-piscine-name'),label=localized(item.label,language)||text.piscine;
   row.dataset.startsOn=item.startsOn;if(item.end)row.dataset.endsOn=item.endsOn;
   name.append(create('span','',label));
   if(item.start.date.getTime()<=todayUTC)name.append(create('span','explorer-sheet-chip',text.ongoing));
   else if(index===nextIndex)name.append(create('span','explorer-sheet-chip',text.upcoming));
   row.append(name,datesOf(item));
   // A Piscine's own source is shown only when it is not already the dates link.
   const href=safeURL(item.sourceUrl);if(href&&href!==datesHref)row.append(sourceLink(item.sourceUrl));
   list.append(row);
  });
  pool.append(list);
 }else pool.append(create('p','explorer-sheet-note',text.checkDates));
 const note=localized(profile.piscinesNote,language);if(note)pool.append(create('p','explorer-sheet-note',note));
 const datesLink=externalLink('explorer-sheet-link explorer-sheet-dates-link',datesValue,text.officialDates,{content:false});
 if(datesLink){
  datesLink.append(create('span','',text.officialDates));withIcon(datesLink,'external');
  const line=create('p','explorer-sheet-dates');line.append(datesLink);pool.append(line);
 }
 end.append(pool);
 if(missing.length){
  const line=create('p','explorer-sheet-missing');withIcon(line,'sparkle');
  line.append(create('span','',text.missingIntro+joinList(missing.map(key=>text.missing[key]),text)+'.'));
  end.append(line);
 }

 root.append(heart,start,end);
 container.append(root);

 // ---- the locator, drawn once its box is laid out (the scale only sizes the cut masks, §4.3) ----
 if(locatorArt){
  art.ensureArtDefs?.(doc);
  const height=metric(locatorArt.clientHeight)||180,[,viewHeight]=viewBoxSize(country.shape.viewBox);
  const svg=art.createSilhouette(doc,{shape:country.shape,kind:'country',variant:'locator',hotPin:campus.id,scale:height/viewHeight});
  if(svg)locatorArt.append(svg);
 }

 // ---- layout and fit cascade (§5.6) ----
 const section=container.closest?.('.explorer-campus')||container.parentElement||null;
 const densityOf=()=>section?.dataset?.density||'normal';
 const media=query=>{try{return typeof view?.matchMedia==='function'?view.matchMedia(query):null;}catch{return null;}};
 const single=media('(max-width: 699px)'),wide=media('(min-width: 1100px)');
 const layoutOf=()=>densityOf()==='tiny'||single?.matches?'single':!wide||wide.matches?'wide':'stacked';
 const boxOf=()=>{
  const rect=typeof container.getBoundingClientRect==='function'?container.getBoundingClientRect():null;
  return rect?[Math.round(rect.width),Math.round(rect.height)]:[metric(container.clientWidth),metric(container.clientHeight)];
 };
 // The heart logo follows the lantern's laid-out diameter (every step may change it).
 function refitLogo(){
  if(!lantern||!logo)return;
  const diameter=metric(lantern.clientWidth);if(!diameter)return;
  const {width,height}=fitLogo(LOGO_W*diameter,LOGO_H*diameter);
  logo.style?.setProperty?.('width',width+'px');logo.style?.setProperty?.('height',height+'px');
  if(print.kind==='sticker'){logo.width=Math.round(width);logo.height=Math.round(height);}
 }
 function fit(){
  if(destroyed)return;
  const layout=layoutOf(),density=densityOf();
  root.dataset.layout=layout;
  last={box:boxOf(),density,layout};
  if(layout!=='wide'||density!=='normal'){root.dataset.fit='full';refitLogo();return;}
  for(const step of STEPS){
   root.dataset.fit=step;refitLogo();
   if(metric(container.scrollHeight)<=metric(container.clientHeight)+1)return;
  }
  root.dataset.fit='scroll';refitLogo();
 }
 fit();
 // Only the container is observed: its size depends on the band, never on the sheet, so no step can loop (D12).
 const Observer=view?.ResizeObserver;
 if(typeof Observer==='function'){
  observer=new Observer(()=>{
   if(destroyed)return;
   const box=boxOf();
   if(last&&box[0]===last.box[0]&&box[1]===last.box[1]&&densityOf()===last.density&&layoutOf()===last.layout)return;
   fit();
  });
  observer.observe(container,{box:'border-box'});
 }
 for(const list of [single,wide]){
  if(!list)continue;
  // Both lists may fire for one resize: the cascade runs once, when the layout changes.
  const onChange=()=>{if(!destroyed&&layoutOf()!==last?.layout)fit();};
  if(typeof list.addEventListener==='function'){list.addEventListener('change',onChange);disposers.push(()=>list.removeEventListener('change',onChange));}
  else if(typeof list.addListener==='function'){list.addListener(onChange);disposers.push(()=>list.removeListener(onChange));}
 }
 doc.fonts?.ready?.then?.(()=>fit(),()=>{});

 return {element:root,heading,lantern,logo,heartItems,wings:{start,end},destroy(){
  if(destroyed)return;destroyed=true;
  mediaView?.close?.();mediaView=null;
  observer?.disconnect?.();observer=null;
  disposers.splice(0).forEach(dispose=>dispose());
  root.remove();
 }};
}
