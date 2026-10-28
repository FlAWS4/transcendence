import {createReportButton,openReportDialog} from './content-report.mjs?v=1';
import {createComments} from './comments.mjs?v=12';
import {coverArt} from './content-preview-art.mjs?v=1';
import {createAuthorByline} from './profile-ui.mjs?v=25';
import {profileBackDistance} from './profile-sections.mjs?v=6';
import {openMediaViewer} from './media-viewer.mjs?v=1';

export const projectSections=Object.freeze(['overview','implementation','media','team','comments']);
export const normalizeProjectSection=value=>projectSections.includes(value)?value:'overview';
export const projectBackDistance=state=>profileBackDistance({...state,profileDepth:state?.projectDepth});
const copy={
 fr:{comments:'Commentaires',overview:'Vue d’ensemble',implementation:'Réalisation',media:'Médias',team:'Équipe',about:'À propos du projet',technologies:'Technologies et savoir-faire',sections:'Rubriques du projet',inProject:'Dans ce projet',back:'Retour aux projets',campus:'Explorer {campus}',mediaCaption:'Illustration de démonstration',mediaNote:'Ce visuel accompagne le projet fictif. Il ne s’agit pas d’une capture de sa réalisation.',teamIntro:'Les personnes à l’origine de ce projet.',authors:'Créé par',noAuthors:'Aucun auteur renseigné.'},
 en:{comments:'Comments',overview:'Overview',implementation:'Development',media:'Media',team:'Team',about:'About the project',technologies:'Technologies and skills',sections:'Project sections',inProject:'In this project',back:'Back to projects',campus:'Explore {campus}',mediaCaption:'Demonstration illustration',mediaNote:'This illustration accompanies the fictional project. It is not a screenshot of its implementation.',teamIntro:'The people behind this project.',authors:'Created by',noAuthors:'No authors listed.'},
 ar:{comments:'التعليقات',overview:'نظرة عامة',implementation:'التنفيذ',media:'الوسائط',team:'الفريق',about:'عن المشروع',technologies:'التقنيات والمهارات',sections:'أقسام المشروع',inProject:'في هذا المشروع',back:'العودة إلى المشاريع',campus:'استكشف {campus}',mediaCaption:'رسم توضيحي تجريبي',mediaNote:'يرافق هذا الرسم المشروع الخيالي، وليس لقطة شاشة لتنفيذه.',teamIntro:'الأشخاص الذين أنشؤوا هذا المشروع.',authors:'من إعداد',noAuthors:'لم يُحدَّد مؤلفون.'},
};
const paths={
 comments:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5Z"/><path d="M7 9h9M7 13h6"/>',
 overview:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 implementation:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
 media:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8" cy="9" r="1.5"/><path d="m3 17 6-5 4 3 4-5 4 4"/>',
 team:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 4a4 4 0 0 1 3 4v1"/>',
 chevron:'<path d="m7 10 5 5 5-5"/>',back:'<path d="m14 6-6 6 6 6M8 12h12"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
};
const localized=(value,locale)=>typeof value==='string'?value:value?.[locale]||value?.en||value?.fr||'';
const mediaCopy={
 fr:{image:'Agrandir l’image',video:'Agrandir et lire la vidéo',illustration:'Agrandir l’illustration'},
 en:{image:'Enlarge image',video:'Enlarge and play video',illustration:'Enlarge illustration'},
 ar:{image:'تكبير الصورة',video:'تكبير الفيديو وتشغيله',illustration:'تكبير الرسم التوضيحي'},
};
function mediaSource(value,base){
 if(typeof value!=='string'||!value.trim())return '';
 try{const url=new URL(value,base);return ['http:','https:'].includes(url.protocol)?value.trim():'';}catch{return '';}
}
/** Only explicit image/video media become source-backed previews; illustrations stay local. */
export function getEntryMedia(entry,locale='fr',base='https://horizon.invalid/'){
 return (Array.isArray(entry?.media)?entry.media:[]).flatMap(item=>{
  if(!item||!['image','video'].includes(item.type))return [];
  const src=mediaSource(item.src,base);if(!src)return [];
  return [{type:item.type,src,alt:localized(item.alt,locale)||localized(entry.title,locale),caption:localized(item.caption,locale),credit:localized(item.credit,locale),...(item.type==='video'&&mediaSource(item.poster,base)?{poster:mediaSource(item.poster,base)}:{})}];
 });
}
/** A shared gallery with stable indexes, while each body placement keeps its own caption. */
export function collectEntryMedia(entry,locale='fr',base='https://horizon.invalid/'){
 const items=[],known=new Map();
 const include=media=>{
  const key=media.type+':'+new URL(media.src,base).href;
  if(!known.has(key)){known.set(key,items.length);items.push(media);}
  return known.get(key);
 };
 const primary=getEntryMedia(entry,locale,base);
 primary.forEach(include);
 const bodyMedia=(Array.isArray(entry?.body)?entry.body:[]).map(part=>{
  const seen=new Set();
  return getEntryMedia({...entry,media:part?.media},locale,base).flatMap(media=>{
   const index=include(media);
   if(seen.has(index))return [];
   seen.add(index);return [{media,index}];
  });
 });
 return {items,hasPrimaryMedia:primary.length>0,bodyMedia};
}
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function icon(name){const el=document.createElementNS('http://www.w3.org/2000/svg','svg');el.setAttribute('viewBox','0 0 24 24');el.setAttribute('aria-hidden','true');el.classList.add('cp-project-icon');el.innerHTML=paths[name==='article'?'overview':name==='authors'?'team':name];return el;}
function artwork(entry,className){const el=node('div',className);el.dataset.cover=entry.cover;el.setAttribute('aria-hidden','true');el.innerHTML=coverArt(entry.cover);return el;}
const lifecycles=new WeakMap();
export function clearProjectDetail(container){lifecycles.get(container)?.();lifecycles.delete(container);}

export function renderProjectDetail(options){return renderSectionedDetail(options);}

// Shared composition; editorial documents choose their own sections and copy.
export function renderSectionedDetail({container,entry,locale='fr',campusName,authors=[],commentAuthor,resolveCommentAuthor,mentionProfiles=[],activeSection='overview',getSectionHref,onSectionNavigate,getAuthorHref,onAuthorNavigate,createFavoriteButton,dateElement,onExploreCampus,onBack,backLabel,kind='project',sectionKeys=projectSections,labels=copy,defaultSection='overview'}){
 clearProjectDetail(container);
 const t=labels[locale]||labels.fr,selected=sectionKeys.includes(activeSection)?activeSection:defaultSection,controller=new AbortController(),signal=controller.signal;
 const doc=container.ownerDocument,view=doc.defaultView;
 const collection=collectEntryMedia(entry,locale,doc.baseURI),mediaOffset=collection.hasPrimaryMedia?0:1;
 const mediaItems=collection.hasPrimaryMedia?collection.items:[{type:'illustration',content:artwork(entry,''),alt:localized(entry.title,locale),caption:t.mediaCaption+'. '+t.mediaNote},...collection.items];
 let activeMedia=null;
 function mediaButton(item,index,className){
  const button=node('button',className+' cp-project-media-open');button.type='button';button.dataset.mediaType=item.type;
  const action=(mediaCopy[locale]||mediaCopy.fr)[item.type];button.setAttribute('aria-label',action+(item.alt?' : '+item.alt:''));button.setAttribute('aria-haspopup','dialog');
  if(item.type==='illustration')button.append(item.content.cloneNode(true));
  else if(item.type==='image'||item.poster){const image=node('img','cp-project-media-image');image.src=item.type==='image'?item.src:item.poster;image.alt='';image.decoding='async';if(className==='cp-project-media-art')image.loading='lazy';button.append(image);}
  if(item.type==='video'){
   const play=node('span','cp-project-media-play');play.setAttribute('aria-hidden','true');
   play.innerHTML='<svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7Z"/></svg>';button.append(play);
  }
  button.addEventListener('click',()=>{activeMedia?.close();activeMedia=openMediaViewer({items:mediaItems,index,locale,trigger:button});},{signal});
  return button;
 }
 function mediaFigure(item,index,{lead=false}={}){
  const figure=node('figure','cp-project-media'+(lead?' cp-project-lead-media':''));figure.append(mediaButton(item,index,'cp-project-media-art'));
  if(item.type==='illustration'||item.caption||item.credit){
   const caption=node('figcaption');
   if(item.type==='illustration')caption.append(node('strong','',t.mediaCaption),node('p','',t.mediaNote));
   else{if(item.caption)caption.append(node('strong','',item.caption));if(item.credit)caption.append(node('p','',item.credit));}
   figure.append(caption);
  }
  return figure;
 }
 container.replaceChildren();container.dataset[kind+'Section']=selected;
 const back=node('button','cp-back');back.type='button';back.append(icon('back'),document.createTextNode(backLabel||t.back));back.addEventListener('click',onBack);container.append(back);
 const workspace=node('div','cp-project-workspace'),sidebar=node('aside','cp-project-sidebar'),reading=node('div','cp-project-reading-pane');
 const identity=node('header','cp-project-identity'),heading=node('div','cp-project-heading');
 const title=node('h1','',localized(entry.title,locale));title.id=kind+'-title';title.tabIndex=-1;title.dir='auto';
 heading.append(node('p','cp-project-eyebrow',localized(entry.eyebrow,locale)),title);
 const facts=node('div','cp-project-facts');facts.append(node('span','',campusName||entry.campus));if(dateElement)facts.append(dateElement);heading.append(facts);
 const actions=node('div','cp-project-actions');if(createFavoriteButton)actions.append(createFavoriteButton(entry));
 if(onExploreCampus){const campus=node('button','cp-project-campus',t.campus.replace('{campus}',campusName||entry.campus));campus.type='button';campus.append(icon('arrow'));campus.addEventListener('click',onExploreCampus);actions.append(campus);}
 actions.append(createReportButton({doc,locale,target:{kind:kind==='journal'?'article':'project',id:entry.id,title:localized(entry.title,locale)},signal}));
 identity.append(mediaButton(mediaItems[0],0,'cp-project-thumbnail'),heading,actions);sidebar.append(identity);
 function navigation(className){
  const nav=node('nav',className);nav.setAttribute('aria-label',t.sections);
  sectionKeys.forEach(key=>{const link=node('a');link.href=getSectionHref(key);link.dataset[kind+'SectionLink']=key;if(selected===key)link.setAttribute('aria-current','page');
   link.append(icon(key),node('span','',t[key]));link.addEventListener('click',event=>onSectionNavigate(event,key));nav.append(link);
  });return nav;
 }
 sidebar.append(navigation('cp-project-sidebar-nav'));
 const selector=node('details','cp-project-section-switch'),trigger=node('summary','cp-project-section-trigger');trigger.id=kind+'-section-picker';
 trigger.append(node('span','cp-project-switch-caption',t.inProject));const choice=node('span','cp-project-switch-choice');choice.append(icon(selected),node('span','',t[selected]));trigger.append(choice,icon('chevron'));
 const panel=navigation('cp-project-switch-panel');selector.append(trigger,panel);reading.append(selector);
 const content=node('section','cp-project-active-section'),sectionTitle=node('h2','',t[selected]);sectionTitle.id=kind+'-section-title';sectionTitle.tabIndex=-1;content.setAttribute('aria-labelledby',sectionTitle.id);content.append(sectionTitle);
 if((kind==='journal'&&selected==='article')||(kind==='project'&&selected==='overview'))content.append(mediaFigure(mediaItems[0],0,{lead:true}));
 if(selected==='overview'||selected==='article'){
  const about=node('section','cp-project-block');about.append(node('h3','',t.about),node('p','',localized(entry.summary,locale)));content.append(about);
  const tech=node('section','cp-project-block'),tags=node('ul','cp-project-tags');tech.append(node('h3','',t.technologies));for(const tag of entry.tags||[])tags.append(node('li','',localized(tag,locale)));tech.append(tags);content.append(tech);
 }
 if(selected==='implementation'||selected==='article')for(const [bodyIndex,part] of (entry.body||[]).entries()){
  const block=node('section','cp-project-block');block.append(node('h3','',localized(part.heading,locale)),node('p','',localized(part.text,locale)));
  const inline=collection.bodyMedia[bodyIndex]||[];
  if(inline.length){
   const gallery=node('div','cp-project-media-gallery cp-project-inline-media');
   for(const {media,index} of inline)gallery.append(mediaFigure(media,index+mediaOffset));
   block.append(gallery);
  }
  content.append(block);
 }
 if(selected==='media'){
  const gallery=node('div','cp-project-media-gallery');
  mediaItems.forEach((item,index)=>gallery.append(mediaFigure(item,index)));content.append(gallery);
 }
 if(selected==='team'||selected==='authors'){
  content.append(node('p','cp-project-section-intro',t.teamIntro));
  if(authors.length)content.append(createAuthorByline({authors,locale,getHref:getAuthorHref,onNavigate:onAuthorNavigate,label:t.byline||t.authors,leadAuthorId:entry.leadAuthorId,authorContext:kind==='journal'?'article':'project'}));
  else content.append(node('p','cp-project-section-intro',t.noAuthors));
 }
 if(selected==='comments')content.append(createComments({doc,entryId:entry.id,kind,locale,signal,currentAuthor:commentAuthor,resolveAuthor:resolveCommentAuthor,mentionProfiles,getAuthorHref,onAuthorNavigate,
  onReport:({comment,trigger})=>openReportDialog({doc,locale,trigger,signal,target:{kind:'comment',id:comment.id,parentKind:kind==='journal'?'article':'project',parentId:entry.id,title:comment.text}})
 }));
 reading.append(content);workspace.append(sidebar,reading);container.append(workspace);
 let frame=0;
 const close=focus=>{selector.open=false;if(focus)trigger.focus({preventScroll:true});};
 const fit=ensureRoom=>{
  if(!selector.open||container.hidden||!selector.getClientRects().length)return;
  const dockRects=[doc.getElementById('main-nav'),doc.querySelector('.dock-search-toggle')].filter(el=>el?.getClientRects().length).map(el=>el.getBoundingClientRect());
  const bottom=Math.min(view.innerHeight-8,...dockRects.map(rect=>rect.top-12));
  const available=()=>Math.floor(bottom-trigger.getBoundingClientRect().bottom-8),top=parseFloat(view.getComputedStyle(selector).top)||0,needed=Math.min(180,view.innerHeight*.36);
  if(ensureRoom&&available()<needed&&trigger.getBoundingClientRect().top>top)view.scrollBy({top:Math.min(needed-available(),trigger.getBoundingClientRect().top-top),behavior:'instant'});
  selector.style.setProperty('--project-selector-room',Math.max(0,available())+'px');
 };
 selector.addEventListener('toggle',()=>{if(selector.open)fit(true);},{signal});
 doc.addEventListener('pointerdown',event=>{if(selector.open&&!selector.contains(event.target))close(false);},{signal});
 selector.addEventListener('focusout',event=>{if(event.relatedTarget&&!selector.contains(event.relatedTarget))close(false);},{signal});
 container.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&selector.open){event.preventDefault();event.stopPropagation();close(true);return;}
  if(event.target===trigger&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();selector.open=true;fit(true);const links=[...panel.querySelectorAll('a')];(event.key==='ArrowDown'?links[0]:links.at(-1)).focus({preventScroll:true});return;}
  const nav=event.target.closest('.cp-project-sidebar-nav,.cp-project-switch-panel');if(!nav||!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  const links=[...nav.querySelectorAll('a')],index=links.indexOf(doc.activeElement);if(index<0)return;event.preventDefault();links[event.key==='Home'?0:event.key==='End'?links.length-1:(index+(event.key==='ArrowDown'?1:-1)+links.length)%links.length].focus();
 },{signal});
 const schedule=()=>{if(!frame)frame=view.requestAnimationFrame(()=>{frame=0;fit(false);});};view.addEventListener('scroll',schedule,{signal,passive:true});view.addEventListener('resize',schedule,{signal});
 view.matchMedia('(max-width:840px)').addEventListener('change',event=>{close(false);if(event.matches&&doc.activeElement.closest('.cp-project-sidebar-nav'))trigger.focus({preventScroll:true});else if(!event.matches&&selector.contains(doc.activeElement))sidebar.querySelector('[aria-current]')?.focus({preventScroll:true});},{signal});
 lifecycles.set(container,()=>{controller.abort();activeMedia?.close();if(frame)view.cancelAnimationFrame(frame);});return container;
}
