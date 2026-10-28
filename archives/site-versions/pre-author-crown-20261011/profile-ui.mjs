import {coverArt} from './content-preview-art.mjs?v=1';
import {profileSections,normalizeProfileSection} from './profile-sections.mjs?v=6';
import {normalizeProfileSocialLinks,getProfileCampusContext} from './profile-data.mjs?v=9';
import {openMediaViewer} from './media-viewer.mjs?v=1';

// Public, fictional profiles reuse the site's content styles and real route links.
const copy={
 fr:{at42:'À 42',statusLabel:'Statut',campusLabel:'Campus',overview:'Vue d’ensemble',contribution:'Contribution',sectionPicker:'Dans ce profil',sections:'Rubriques du profil',awards:'Distinctions',noAwards:'Aucune distinction renseignée',awardsHint:'Les distinctions 42 Awards de ce profil apparaîtront ici.',noFilteredProjects:'Aucun projet de ce profil ne correspond à ces filtres.',allProjects:'Tous les projets',projectCount:'{count} projet(s)',arrival:'Rentrée',promotion:'Promotion',intra:'Pseudo Intra',intraPending:'Pseudo Intra à renseigner',intraDemo:'Pseudo de démonstration',discover:'Découvrir le profil',student:'Cadet',transcender:'Transcender',transcenderDescription:'Tronc commun terminé, spécialisation en cours',alumni:'Alumni',featured:'Un projet à découvrir',about:'À propos',projects:'Projets',journey:'Parcours',contributions:'Contributions aux chroniques',noProjects:'Pas encore de projet présenté.',noContributions:'Pas encore de contribution aux chroniques.',story:'Un récit du parcours',campus:'Explorer {campus}',back:'Retour aux profils',authors:'Créé par',read:'Découvrir',skills:'Compétences'},
 en:{at42:'At 42',statusLabel:'Status',campusLabel:'Campus',overview:'Overview',contribution:'Contribution',sectionPicker:'In this profile',sections:'Profile sections',awards:'Distinctions',noAwards:'No distinctions listed',awardsHint:'This profile’s 42 Awards distinctions will appear here.',noFilteredProjects:'No projects from this person match these filters.',allProjects:'All projects',projectCount:'{count} project(s)',arrival:'Joined campus',promotion:'Cohort',intra:'Intra login',intraPending:'Intra login to be added',intraDemo:'Demo username',discover:'Discover the profile',student:'Cadet',transcender:'Transcender',transcenderDescription:'Common core completed, specialization in progress',alumni:'Alumni',featured:'A project to discover',about:'About',projects:'Projects',journey:'Journey',contributions:'Contributions to Chronicles',noProjects:'No projects shared yet.',noContributions:'No contributions to Chronicles yet.',story:'A story from the journey',campus:'Explore {campus}',back:'Back to profiles',authors:'Created by',read:'Discover',skills:'Skills'},
 ar:{at42:'في 42',statusLabel:'الحالة',campusLabel:'الحرم',overview:'نظرة عامة',contribution:'المساهمة',sectionPicker:'في هذا الملف',sections:'أقسام الملف الشخصي',awards:'الجوائز',noAwards:'لا توجد جوائز مسجلة',awardsHint:'ستظهر هنا جوائز 42 Awards الخاصة بهذا الملف.',noFilteredProjects:'لا توجد مشاريع لهذا الشخص تطابق هذه المرشحات.',allProjects:'جميع المشاريع',projectCount:'عدد المشاريع: {count}',arrival:'سنة الالتحاق',promotion:'الدفعة',intra:'اسم المستخدم في Intra',intraPending:'اسم مستخدم Intra غير محدد',intraDemo:'اسم مستخدم تجريبي',discover:'اكتشف الملف',student:'كاديت',transcender:'Transcender',transcenderDescription:'أكمل الجذع المشترك ويتابع التخصص',alumni:'خريج / خريجة',featured:'مشروع لاكتشافه',about:'نبذة',projects:'المشاريع',journey:'المسار',contributions:'المساهمات في حكايات',noProjects:'لا توجد مشاريع معروضة بعد.',noContributions:'لا توجد مساهمات في حكايات بعد.',story:'حكاية من المسار',campus:'استكشف {campus}',back:'العودة إلى الأعضاء',authors:'من إعداد',read:'اكتشف',skills:'المهارات'}
};
const localized=(value,locale)=>typeof value==='string'?value:value?.[locale]||value?.en||value?.fr||'';
const words=locale=>copy[locale]||copy.fr;
const socialCopy={
 fr:{title:'Réseaux et liens',empty:'Aucun lien renseigné.',hint:'Les réseaux sociaux et sites partagés par cette personne apparaîtront ici.',open:'Ouvrir {label} · nouvel onglet'},
 en:{title:'Socials and links',empty:'No links added.',hint:'Social networks and websites shared by this person will appear here.',open:'Open {label} · new tab'},
 ar:{title:'الشبكات والروابط',empty:'لم تُضف روابط بعد.',hint:'ستظهر هنا الشبكات الاجتماعية والمواقع التي يشاركها هذا الشخص.',open:'فتح {label} · علامة تبويب جديدة'}
};
const messageCopy={
 fr:{action:'Envoyer un message',to:'À',label:'Votre message',placeholder:'Écrivez quelques mots…',cancel:'Annuler',close:'Fermer',send:'Envoyer (démo)',hint:'Démonstration locale : aucun message réel n’est envoyé.',empty:'Écrivez un message avant de continuer.',sent:'Message enregistré pour cet essai. Aucun envoi réel.',last:'Votre dernier message de démonstration'},
 en:{action:'Send a message',to:'To',label:'Your message',placeholder:'Write a few words…',cancel:'Cancel',close:'Close',send:'Send (demo)',hint:'Local demonstration: no real message is sent.',empty:'Write a message before continuing.',sent:'Message saved for this demo. Nothing was sent.',last:'Your latest demonstration message'},
 ar:{action:'إرسال رسالة',to:'إلى',label:'رسالتك',placeholder:'اكتب بضع كلمات…',cancel:'إلغاء',close:'إغلاق',send:'إرسال (تجريبي)',hint:'عرض محلي تجريبي: لا تُرسل أي رسالة فعلية.',empty:'اكتب رسالة قبل المتابعة.',sent:'حُفظت الرسالة لهذا العرض التجريبي. لم تُرسل فعلياً.',last:'آخر رسالة تجريبية لك'}
};
const profileDemoMessages=new Map();
const campusHistoryCopy={
 fr:{current:'Campus actuel',history:'Historique des campus',first:'Première rentrée',change:'Changement de campus'},
 en:{current:'Current campus',history:'Campus history',first:'First enrollment',change:'Campus transfer'},
 ar:{current:'الحرم الحالي',history:'سجلّ الأحرام',first:'الالتحاق الأول',change:'الانتقال إلى حرم آخر'}
};
const authorResponsibilityCopy={
 fr:{short:'Responsable',shortProject:'Chef de projet',project:'Chef de projet',article:'Responsable de l’article'},
 en:{short:'Lead',project:'Project lead',article:'Article lead'},
 ar:{short:'المسؤول',project:'المسؤول عن المشروع',article:'المسؤول عن المقال'}
};
function node(tag,className,text){const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;}
function arrow(back=false){const element=document.createElementNS('http://www.w3.org/2000/svg','svg');element.setAttribute('viewBox','0 0 24 24');element.setAttribute('aria-hidden','true');element.innerHTML=back?'<path d="m14 6-6 6 6 6M8 12h12"/>':'<path d="M5 12h14m-6-6 6 6-6 6"/>';return element;}
function portrait(profile,className='cp-person-avatar'){
 const image=node('img',className);image.src=profile.avatar;image.alt='';image.width=240;image.height=240;image.decoding='async';return image;
}
function statusBadge(profile,locale){
 const t=words(locale),badge=node('span','cp-profile-status',t[profile.status]||t.student);
 if(profile.status==='transcender'){badge.title=t.transcenderDescription;badge.dir='ltr';}
 return badge;
}
function routeLink({href,item,onNavigate,className}){
 const link=node('a',className);link.href=href;
 if(onNavigate)link.addEventListener('click',event=>onNavigate(event,item));
 return link;
}
function tags(values,locale){
 const list=node('ul','cp-profile-tags');list.setAttribute('aria-label',words(locale).skills);
 for(const value of values||[])list.append(node('li','',localized(value,locale)));
 return list;
}
function artwork(entry,className='cp-cover'){
 const cover=node('div',className);cover.dataset.cover=entry.cover;cover.setAttribute('aria-hidden','true');
 const art=node('div','cp-art');art.innerHTML=coverArt(entry.cover);cover.append(art);return cover;
}

/** onNavigate(event, profile) may use the shared router; links still support new tabs. */
function intraLogin(profile,locale){
 const t=words(locale),login=node('p','cp-profile-login',profile.intraLogin?'@'+profile.intraLogin:t.intraPending);
 login.setAttribute('aria-label',t.intra+': '+(profile.intraLogin||t.intraPending));
 if(profile.intraLogin){login.dir='ltr';if(profile.intraLoginIsDemo)login.title=t.intraDemo;}
 return login;
}
function cohortFacts(profile,locale){
 const t=words(locale),facts=node('dl','cp-profile-cohort');
 for(const [key,label] of [['arrivalYear',t.arrival],['promotionNumber',t.promotion]]){
  const value=profile[key];if(!Number.isInteger(value)||value<=0)continue;
  const item=node('div','cp-profile-cohort-item');item.dataset.profileFact=key;
  const term=node('dt','',label),description=node('dd','');
  const number=node('bdi','',String(value));number.dir='ltr';description.append(number);
  item.append(term,description);facts.append(item);
 }
 return facts;
}
export function renderProfileCard({profile,locale='fr',campusName,href,onNavigate}){
 const card=node('article','cp-card cp-profile-card');card.dataset.profileId=profile.id;card.dataset.cover='profile';
 const link=routeLink({href,item:profile,onNavigate,className:'cp-card-open'});
 const face=node('div','cp-profile-portrait');face.append(portrait(profile),statusBadge(profile,locale));
 const body=node('div','cp-card-copy');
 const title=node('h2','',localized(profile.title,locale));title.dir='auto';
 body.append(title,intraLogin(profile,locale),node('p','cp-meta',campusName||profile.campus),cohortFacts(profile,locale));
 link.append(face,body);card.append(link);return card;
}

/** Only the card preview is shortened. Full bylines and the data keep every
 * author; without a route to the complete list a compact byline stays complete. */
export function createAuthorByline({authors=[],locale='fr',getHref,onNavigate,compact=false,label,allAuthorsHref,onAllAuthorsNavigate,leadAuthorId,authorContext='project'}){
 const root=node('div','cp-authors');root.dataset.compact=String(compact);
 if(!authors.length)return root;
 root.append(node('p','cp-authors-label',label||words(locale).authors));
 const list=node('ul','cp-author-list');
 // Responsibility is explicit and must refer to a listed author. The display
 // puts that person first without changing the record's collaboration order.
 const leadIndex=typeof leadAuthorId==='string'?authors.findIndex(author=>author.id===leadAuthorId):-1;
 const lead=leadIndex>=0?authors[leadIndex]:null;
 const ordered=leadIndex>0?[lead,...authors.slice(0,leadIndex),...authors.slice(leadIndex+1)]:authors;
 const visible=compact&&allAuthorsHref?ordered.slice(0,2):ordered;
 for(const author of visible){
  const item=node('li','cp-author-item');
  const link=routeLink({href:getHref(author),item:author,onNavigate,className:'cp-author-link'});
  link.title=localized(author.title,locale);
  const text=node('span','cp-author-copy'),name=node('strong','',localized(author.title,locale));name.dir='auto';
  text.append(name);
  if(author===lead){
   const roleCopy=authorResponsibilityCopy[locale]||authorResponsibilityCopy.fr;
   const responsibility=roleCopy[authorContext==='article'?'article':'project'];
   const badge=node('span','cp-author-responsibility',compact?(authorContext!=='article'&&roleCopy.shortProject||roleCopy.short):responsibility);
   badge.title=responsibility;text.append(badge);
   link.title=localized(author.title,locale)+' · '+responsibility;
   link.setAttribute('aria-label',[localized(author.title,locale),responsibility,!compact?localized(author.role,locale):''].filter(Boolean).join('. '));
  }
  if(!compact)text.append(node('span','cp-author-role',localized(author.role,locale)));
  link.append(portrait(author),text);item.append(link);list.append(item);
 }
 const remaining=authors.length-visible.length;
 if(remaining){
  const number=new Intl.NumberFormat(locale),item=node('li','cp-author-item cp-author-more-item');
  const link=node('a','cp-author-more');link.href=allAuthorsHref;
  const count=node('bdi','',number.format(remaining));count.dir='ltr';
  link.append(node('span','','+'),count);
  const label={fr:'Voir les {count} auteurs',en:'View all {count} authors',ar:'عرض جميع الكتّاب ({count})'}[locale]||'View all {count} authors';
  link.setAttribute('aria-label',label.replace('{count}',number.format(authors.length)));
  link.title=link.getAttribute('aria-label');
  if(onAllAuthorsNavigate)link.addEventListener('click',onAllAuthorsNavigate);
  item.append(link);list.append(item);
 }
 root.append(list);return root;
}

function relatedEntry(entry,{locale,getEntryHref,onNavigate,createFavoriteButton}){
 const card=node('article','cp-profile-related-card');
 const link=routeLink({href:getEntryHref(entry),item:entry,onNavigate,className:'cp-profile-related-link'});
 link.append(artwork(entry));
 const text=node('div','cp-profile-related-copy');
 text.append(node('p','cp-meta',localized(entry.eyebrow,locale)),node('h3','',localized(entry.title,locale)),node('p','cp-profile-related-summary',localized(entry.summary,locale)));
 if(entry.section!=='projects'){const action=node('span','cp-card-link',words(locale).read);action.append(arrow());text.append(action);}
 link.append(text);card.append(link);
 if(createFavoriteButton)card.append(createFavoriteButton(entry,true));return card;
}
function section(title,id){const section=node('section','cp-profile-section');const heading=node('h2','',title);heading.id=id;section.setAttribute('aria-labelledby',id);section.append(heading);return section;}

/** External destinations stay separate from Horizon's internal profile router. */
export function renderProfileSocialLinks({profile,locale='fr'}){
 const t=socialCopy[locale]||socialCopy.fr,links=normalizeProfileSocialLinks(profile?.socialLinks);
 const block=node('section','cp-profile-overview-block cp-profile-socials');
 const title=node('h3','',t.title);title.id='profile-social-links-title';block.setAttribute('aria-labelledby',title.id);block.append(title);
 if(!links.length){
  block.append(node('p','cp-profile-social-empty',t.empty),node('p','cp-profile-social-hint',t.hint));
  return block;
 }
 const list=node('ul','cp-profile-social-list');
 for(const item of links){
  const row=node('li'),link=node('a','cp-profile-social-link');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
  link.setAttribute('aria-label',t.open.replace('{label}',item.label));
  const label=node('bdi','',item.label);label.dir='auto';
  link.append(label,profileIcon('external'));row.append(link);list.append(row);
 }
 block.append(list);return block;
}

const resolveProfileCampusName=(id,{profile,campusName,getCampusName})=>getCampusName?.(id)||(id===profile.campus?campusName:null)||id||'';

/** The cohort remains attached to the first enrollment, even after a return. */
export function renderProfileCampusInfo({profile,locale='fr',campusName,getCampusName,onExploreCampus}){
 const t=words(locale),labels=campusHistoryCopy[locale]||campusHistoryCopy.fr,context=getProfileCampusContext(profile);
 const resolve=id=>resolveProfileCampusName(id,{profile,campusName,getCampusName});
 const block=node('section','cp-profile-overview-block cp-profile-campus-info'),facts=cohortFacts(context,locale);facts.classList.add('cp-profile-campus-facts');
 const campusFact=node('div','cp-profile-cohort-item');campusFact.dataset.profileFact='campus';
 campusFact.append(node('dt','',t.campusLabel),node('dd','',resolve(context.originCampus)));
 const statusFact=node('div','cp-profile-cohort-item');statusFact.dataset.profileFact='status';statusFact.append(node('dt','',t.statusLabel),node('dd','',t[profile.status]||t.student));
 facts.prepend(statusFact,campusFact);
 if(context.hasCampusChanges){
  const current=node('div','cp-profile-cohort-item');current.dataset.profileFact='currentCampus';current.append(node('dt','',labels.current),node('dd','',resolve(context.currentCampus)));facts.append(current);
 }
 block.append(node('h3','',t.at42),facts);
 const explorationCampus=context.hasCampusChanges?context.currentCampus:context.originCampus;
 if(onExploreCampus&&explorationCampus){const campus=node('button','cp-profile-campus');campus.type='button';campus.append(document.createTextNode(t.campus.replace('{campus}',resolve(explorationCampus))),arrow());campus.addEventListener('click',event=>onExploreCampus(event,profile,explorationCampus));block.append(campus);}
 return block;
}

function formatCampusHistoryDate(date,locale){
 const parts=date.split('-'),options={year:'numeric',timeZone:'UTC'};
 if(parts.length>1)options.month='long';if(parts.length>2)options.day='numeric';
 return new Intl.DateTimeFormat(locale,options).format(new Date(`${parts[0]}-${parts[1]||'01'}-${parts[2]||'01'}T12:00:00Z`));
}

/** Only supplied campus changes create this history; ordinary profiles omit it. */
export function renderProfileCampusHistory({profile,locale='fr',campusName,getCampusName}){
 const context=getProfileCampusContext(profile);if(!context.hasCampusChanges)return null;
 const t=campusHistoryCopy[locale]||campusHistoryCopy.fr,block=node('section','cp-profile-campus-history');block.append(node('h3','',t.history));
 const timeline=node('ol','cp-profile-campus-timeline');timeline.setAttribute('role','list');
 context.history.forEach((record,index)=>{
  const item=node('li','cp-profile-campus-stop');item.dataset.campus=record.campus;
  if(record.date){const date=node('time','',formatCampusHistoryDate(record.date,locale));date.dateTime=record.date;item.append(date);}
  const details=node('div');details.append(node('p','cp-profile-campus-step',index===0?t.first:t.change),node('p','cp-profile-campus-name',resolveProfileCampusName(record.campus,{profile,campusName,getCampusName})));item.append(details);timeline.append(item);
 });
 block.append(timeline);return block;
}

const profileIconPaths={
 overview:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
 projects:'<path d="m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
 journey:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v5a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8m-3 2 3-3 3 3"/>',
 contribution:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 3v18m4-12h3m-3 4h3"/>',
 chevron:'<path d="m7 10 5 5 5-5"/>',
 award:'<path d="M8 3h8v5a4 4 0 0 1-8 0Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v6m-4 3h8m-7-3h6"/>',
 external:'<path d="M14 4h6v6m0-6L10 14m0-10H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
 message:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5Z"/><path d="M7 9h9M7 13h6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
};
function profileIcon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('cp-profile-icon');svg.innerHTML=profileIconPaths[name];return svg;}
const profileLifecycles=new WeakMap();
export function clearProfileDetail(container){profileLifecycles.get(container)?.();profileLifecycles.delete(container);}

/** A native modal composition exercise, isolated from any account or delivery API. */
function createProfileMessageComposer({profile,locale,trigger,signal}){
 const t=messageCopy[locale]||messageCopy.fr,doc=trigger.ownerDocument;
 let dialog=null,textarea,status,preview,previewText;
 const close=()=>dialog?.close();
 function open(){
  if(!dialog){
   dialog=node('dialog','cp-profile-message-dialog');dialog.setAttribute('aria-labelledby','profile-message-title');dialog.setAttribute('aria-describedby','profile-message-hint');
   const top=node('div','cp-profile-message-top'),title=node('h2','',t.action);title.id='profile-message-title';
   const dismiss=node('button','cp-profile-message-close');dismiss.type='button';dismiss.setAttribute('aria-label',t.close);dismiss.append(profileIcon('close'));dismiss.addEventListener('click',close,{signal});top.append(title,dismiss);
   const recipient=node('p','cp-profile-message-recipient');recipient.append(document.createTextNode(t.to+' '));
   const recipientName=node('bdi','',localized(profile.title,locale));recipientName.dir='auto';recipient.append(recipientName);
   if(profile.intraLogin){const login=node('bdi','', ' @'+profile.intraLogin);login.dir='ltr';recipient.append(login);}
   const hint=node('p','cp-profile-message-hint',t.hint);hint.id='profile-message-hint';
   const form=node('form','cp-profile-message-form'),label=node('label','cp-profile-message-label',t.label);textarea=node('textarea');textarea.name='message';textarea.rows=5;textarea.maxLength=2000;textarea.required=true;textarea.placeholder=t.placeholder;label.append(textarea);
   status=node('p','cp-profile-message-status');status.setAttribute('role','status');status.tabIndex=-1;
   preview=node('section','cp-profile-message-preview');preview.hidden=true;preview.append(node('h3','',t.last));previewText=node('p');preview.append(previewText);
   const controls=node('div','cp-profile-message-controls'),cancel=node('button','cp-profile-message-cancel',t.cancel),send=node('button','cp-profile-message-send',t.send);cancel.type='button';cancel.addEventListener('click',close,{signal});send.type='submit';controls.append(cancel,send);
   textarea.addEventListener('input',()=>textarea.setCustomValidity(''),{signal});
   form.addEventListener('submit',event=>{
    event.preventDefault();const text=textarea.value.trim();
    if(!text){textarea.setCustomValidity(t.empty);textarea.reportValidity();return;}
    profileDemoMessages.set(profile.id,text);previewText.textContent=text;preview.hidden=false;textarea.value='';status.textContent=t.sent;status.focus({preventScroll:true});
   },{signal});
   form.append(label,status,preview,controls);dialog.append(top,recipient,hint,form);doc.body.append(dialog);
   dialog.addEventListener('close',()=>{if(!signal.aborted&&trigger.isConnected)trigger.focus({preventScroll:true});},{signal});
  }
  status.textContent='';const previous=profileDemoMessages.get(profile.id);preview.hidden=!previous;previewText.textContent=previous||'';
  if(!dialog.open)dialog.showModal();textarea.focus({preventScroll:true});
 }
 trigger.addEventListener('click',open,{signal});
 return ()=>{if(dialog?.open)dialog.close();dialog?.remove();};
}

/** The active document retains all source content, one routed section at a time. */
export function renderProfileDetail({container,profile,locale='fr',campusName,getCampusName,entries=[],journey,getEntryHref,onNavigate,createFavoriteButton,onExploreCampus,onBack,backLabel,activeSection='overview',getSectionHref,onSectionNavigate,projectControls,filteredProjects,projectFilterActive=false,onResetProjects}){
 clearProfileDetail(container);
 const t=words(locale),selected=normalizeProfileSection(activeSection),lifecycle=new AbortController(),signal=lifecycle.signal;
 container.replaceChildren();container.classList.add('cp-profile-detail');container.dataset.profileSection=selected;
 const back=node('button','cp-back');back.type='button';back.id='profile-back';back.append(arrow(true),document.createTextNode(backLabel||t.back));if(onBack)back.addEventListener('click',onBack);container.append(back);
 const workspace=node('div','cp-profile-workspace'),sidebar=node('aside','cp-profile-sidebar'),reading=node('div','cp-profile-reading-pane');
 const header=node('header','cp-profile-hero'),face=node('button','cp-profile-hero-portrait cp-profile-portrait-open');face.type='button';face.append(portrait(profile));
 const portraitLabel={fr:'Agrandir le portrait',en:'Enlarge portrait',ar:'تكبير الصورة الشخصية'}[locale]||'Agrandir le portrait';
 face.setAttribute('aria-label',portraitLabel+' : '+localized(profile.title,locale));face.setAttribute('aria-haspopup','dialog');
 let activeMedia=null;
 face.addEventListener('click',()=>{activeMedia?.close();activeMedia=openMediaViewer({items:[{type:'image',src:profile.avatar,alt:localized(profile.title,locale),caption:localized(profile.title,locale)}],locale,trigger:face});},{signal});
 const heading=node('div','cp-profile-heading');
 const name=node('h1','',localized(profile.title,locale));name.id='profile-title';name.tabIndex=-1;name.dir='auto';heading.append(name,intraLogin(profile,locale));
 const actions=node('div','cp-profile-actions');
 if(createFavoriteButton)actions.append(createFavoriteButton(profile));
 const message=node('button','cp-profile-message');message.type='button';message.append(profileIcon('message'),document.createTextNode((messageCopy[locale]||messageCopy.fr).action));actions.append(message);
 const cleanupMessage=createProfileMessageComposer({profile,locale,trigger:message,signal});
 header.append(face,heading,actions);sidebar.append(header);
 const makeNavigation=className=>{
  const navigation=node('nav',className);navigation.setAttribute('aria-label',t.sections);
  profileSections.forEach(key=>{
   const link=node('a');link.href=getSectionHref?.(key)||'#';link.dataset.profileSectionLink=key;
   if(key===selected)link.setAttribute('aria-current','page');
   link.append(profileIcon(key),node('span','',t[key]));
   link.addEventListener('click',event=>onSectionNavigate?.(event,key));navigation.append(link);
  });return navigation;
 };
 sidebar.append(makeNavigation('cp-profile-sidebar-nav'));
 const selector=node('details','cp-profile-section-switch'),trigger=node('summary','cp-profile-section-trigger');
 trigger.id='profile-section-picker';trigger.append(node('span','cp-profile-switch-caption',t.sectionPicker));
 const choice=node('span','cp-profile-switch-choice');choice.append(profileIcon(selected),node('span','',t[selected]));trigger.append(choice,profileIcon('chevron'));
 const selectorPanel=makeNavigation('cp-profile-switch-panel');selector.append(trigger,selectorPanel);reading.append(selector);
 const content=section(t[selected],'profile-section-title');content.classList.add('cp-profile-active-section');content.querySelector('h2').tabIndex=-1;
 if(selected==='overview'){
  const about=node('section','cp-profile-overview-block');about.append(node('h3','',t.about),node('p','',localized(profile.bio,locale)));
  const campusInfo=renderProfileCampusInfo({profile,locale,campusName,getCampusName,onExploreCampus});
  const skills=node('section','cp-profile-overview-block');skills.append(node('h3','',t.skills),tags(profile.tags,locale));
  const awards=node('section','cp-profile-overview-block'),awardsTitle=node('h3','',t.awards),awardName=node('bdi','cp-profile-heading-note','42 Awards');awardName.dir='ltr';awardsTitle.append(awardName);awards.append(awardsTitle);
  const empty=node('div','cp-profile-award-empty'),text=node('div');text.append(node('p','cp-profile-award-title',t.noAwards),node('p','',t.awardsHint));empty.append(profileIcon('award'),text);awards.append(empty);content.append(about,campusInfo,renderProfileSocialLinks({profile,locale}),skills,awards);
 }
 if(selected==='projects'){
  const projects=filteredProjects??entries.filter(entry=>entry.section==='projects');
  const toolbar=node('div','cp-profile-project-toolbar'),count=node('p','cp-profile-project-count');
  count.textContent=locale==='fr'?projects.length+' projet'+(projects.length===1?'':'s'):locale==='en'?projects.length+' project'+(projects.length===1?'':'s'):t.projectCount.replace('{count}',new Intl.NumberFormat(locale).format(projects.length));
  toolbar.append(count);if(projectControls)toolbar.append(projectControls);content.append(toolbar);
  if(projects.length){const grid=node('div','cp-profile-related-grid');for(const entry of projects)grid.append(relatedEntry(entry,{locale,getEntryHref,onNavigate,createFavoriteButton}));content.append(grid);}
  else {content.append(node('p','cp-profile-empty',projectFilterActive?t.noFilteredProjects:t.noProjects));if(projectFilterActive&&onResetProjects){const reset=node('button','cp-show-all',t.allProjects);reset.type='button';reset.addEventListener('click',onResetProjects);content.append(reset);}}
 }
 if(selected==='journey'){
  const campusHistory=renderProfileCampusHistory({profile,locale,campusName,getCampusName});if(campusHistory)content.append(campusHistory);
  const timeline=node('ol','cp-profile-timeline');timeline.setAttribute('role','list');
  for(const milestone of profile.milestones||[]){
   const item=node('li','cp-profile-milestone');item.setAttribute('role','listitem');item.append(node('span','cp-profile-milestone-date',milestone.date));
   const milestoneContent=node('div','cp-profile-milestone-copy');milestoneContent.append(node('h3','',localized(milestone.label,locale)),node('p','',localized(milestone.text,locale)));item.append(milestoneContent);timeline.append(item);
  }content.append(timeline);
  if(journey){
   const story=node('article','cp-profile-story');story.append(node('p','cp-meta',t.story),node('h3','',localized(journey.title,locale)),node('p','cp-profile-story-intro',localized(journey.summary,locale)));
   for(const part of journey.body||[]){story.append(node('h4','',localized(part.heading,locale)),node('p','',localized(part.text,locale)));}content.append(story);
  }
 }
 if(selected==='contribution'){
  const articles=entries.filter(entry=>entry.section==='journal');
  if(articles.length){const grid=node('div','cp-profile-related-grid');for(const entry of articles)grid.append(relatedEntry(entry,{locale,getEntryHref,onNavigate,createFavoriteButton}));content.append(grid);}else content.append(node('p','cp-profile-empty',t.noContributions));
 }
 reading.append(content);workspace.append(sidebar,reading);container.append(workspace);
 const view=container.ownerDocument.defaultView,doc=container.ownerDocument;
 let layoutFrame=0;
 const closeSelector=focus=>{selector.open=false;if(focus)trigger.focus({preventScroll:true});};
 const fitSelector=ensureRoom=>{
  if(!selector.open||container.hidden||!selector.getClientRects().length)return;
  const visibleRect=element=>element?.getClientRects().length?element.getBoundingClientRect():null;
  const dockRects=[visibleRect(doc.getElementById('main-nav')),visibleRect(doc.querySelector('.dock-search-toggle'))].filter(Boolean);
  const bottom=()=>Math.min(view.innerHeight-8,...dockRects.map(rect=>rect.top-12));
  const available=()=>Math.floor(bottom()-trigger.getBoundingClientRect().bottom-8);
  const stickyTop=parseFloat(view.getComputedStyle(selector).top)||0;
  const needed=Math.min(180,view.innerHeight*.36);
  if(ensureRoom&&available()<needed&&trigger.getBoundingClientRect().top>stickyTop)view.scrollBy({top:Math.min(needed-available(),trigger.getBoundingClientRect().top-stickyTop),behavior:'instant'});
  selector.style.setProperty('--profile-selector-room',Math.max(0,available())+'px');
 };
 selector.addEventListener('toggle',()=>{if(selector.open)fitSelector(true);},{signal});
 doc.addEventListener('pointerdown',event=>{if(selector.open&&!selector.contains(event.target))closeSelector(false);},{signal});
 selector.addEventListener('focusout',event=>{if(event.relatedTarget&&!selector.contains(event.relatedTarget))closeSelector(false);},{signal});
 container.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&selector.open){event.preventDefault();event.stopPropagation();closeSelector(true);return;}
  if(event.target===trigger&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();selector.open=true;fitSelector(true);const links=[...selectorPanel.querySelectorAll('a')];(event.key==='ArrowDown'?links[0]:links.at(-1)).focus({preventScroll:true});return;}
  const navigation=event.target.closest('.cp-profile-sidebar-nav,.cp-profile-switch-panel');if(!navigation||!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  const links=[...navigation.querySelectorAll('a')],index=links.indexOf(doc.activeElement);if(index<0)return;
  event.preventDefault();links[event.key==='Home'?0:event.key==='End'?links.length-1:(index+(event.key==='ArrowDown'?1:-1)+links.length)%links.length].focus();
 },{signal});
 const scheduleFit=()=>{if(layoutFrame)return;layoutFrame=view.requestAnimationFrame(()=>{layoutFrame=0;fitSelector(false);});};
 view.addEventListener('scroll',scheduleFit,{signal,passive:true});view.addEventListener('resize',scheduleFit,{signal});
 const compact=view.matchMedia('(max-width:840px)');compact.addEventListener('change',event=>{
  closeSelector(false);
  if(event.matches&&doc.activeElement.closest('.cp-profile-sidebar-nav'))trigger.focus({preventScroll:true});
  else if(!event.matches&&selector.contains(doc.activeElement))sidebar.querySelector('[aria-current]')?.focus({preventScroll:true});
 },{signal});
 profileLifecycles.set(container,()=>{lifecycle.abort();cleanupMessage();activeMedia?.close();if(layoutFrame)view.cancelAnimationFrame(layoutFrame);});
 return container;
}
