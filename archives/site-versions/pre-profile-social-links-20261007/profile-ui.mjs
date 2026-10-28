import {coverArt} from './content-preview-art.mjs?v=1';
import {profileSections,normalizeProfileSection} from './profile-sections.mjs?v=2';

// Public, fictional profiles reuse the site's content styles and real route links.
const copy={
 fr:{overview:'Vue d’ensemble',contribution:'Contribution',sectionPicker:'Dans ce profil',sections:'Rubriques du profil',awards:'Distinctions',noAwards:'Aucune distinction renseignée',awardsHint:'Les distinctions 42 Awards de ce profil apparaîtront ici.',noFilteredProjects:'Aucun projet de ce profil ne correspond à ces filtres.',allProjects:'Tous les projets',projectCount:'{count} projet(s)',arrival:'Arrivée au campus',promotion:'Promotion',intra:'Pseudo Intra',intraPending:'Pseudo Intra à renseigner',intraDemo:'Pseudo de démonstration',discover:'Découvrir le profil',student:'Cadet',transcender:'Transcender',transcenderDescription:'Tronc commun terminé, spécialisation en cours',alumni:'Alumni',featured:'Un projet à découvrir',about:'À propos',projects:'Projets',journey:'Parcours',contributions:'Contributions au journal',noProjects:'Pas encore de projet présenté.',noContributions:'Pas encore de contribution au journal.',story:'Un récit du parcours',campus:'Explorer {campus}',back:'Retour aux profils',authors:'Créé par',read:'Découvrir',skills:'Compétences'},
 en:{overview:'Overview',contribution:'Contribution',sectionPicker:'In this profile',sections:'Profile sections',awards:'Distinctions',noAwards:'No distinctions listed',awardsHint:'This profile’s 42 Awards distinctions will appear here.',noFilteredProjects:'No projects from this person match these filters.',allProjects:'All projects',projectCount:'{count} project(s)',arrival:'Joined campus',promotion:'Cohort',intra:'Intra login',intraPending:'Intra login to be added',intraDemo:'Demo username',discover:'Discover the profile',student:'Cadet',transcender:'Transcender',transcenderDescription:'Common core completed, specialization in progress',alumni:'Alumni',featured:'A project to discover',about:'About',projects:'Projects',journey:'Journey',contributions:'Journal contributions',noProjects:'No projects shared yet.',noContributions:'No journal contributions yet.',story:'A story from the journey',campus:'Explore {campus}',back:'Back to profiles',authors:'Created by',read:'Discover',skills:'Skills'},
 ar:{overview:'نظرة عامة',contribution:'المساهمة',sectionPicker:'في هذا الملف',sections:'أقسام الملف الشخصي',awards:'الجوائز',noAwards:'لا توجد جوائز مسجلة',awardsHint:'ستظهر هنا جوائز 42 Awards الخاصة بهذا الملف.',noFilteredProjects:'لا توجد مشاريع لهذا الشخص تطابق هذه المرشحات.',allProjects:'جميع المشاريع',projectCount:'عدد المشاريع: {count}',arrival:'سنة الالتحاق',promotion:'الدفعة',intra:'اسم المستخدم في Intra',intraPending:'اسم مستخدم Intra غير محدد',intraDemo:'اسم مستخدم تجريبي',discover:'اكتشف الملف',student:'كاديت',transcender:'Transcender',transcenderDescription:'أكمل الجذع المشترك ويتابع التخصص',alumni:'خريج / خريجة',featured:'مشروع لاكتشافه',about:'نبذة',projects:'المشاريع',journey:'المسار',contributions:'المساهمات في المجلة',noProjects:'لا توجد مشاريع معروضة بعد.',noContributions:'لا توجد مساهمات في المجلة بعد.',story:'حكاية من المسار',campus:'استكشف {campus}',back:'العودة إلى الملفات',authors:'من إعداد',read:'اكتشف',skills:'المهارات'}
};
const localized=(value,locale)=>typeof value==='string'?value:value?.[locale]||value?.en||value?.fr||'';
const words=locale=>copy[locale]||copy.fr;
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

/** Authors are separate links, so neither cards nor favorites create nested controls. */
export function createAuthorByline({authors=[],locale='fr',getHref,onNavigate,compact=false,label}){
 const root=node('div','cp-authors');root.dataset.compact=String(compact);
 if(!authors.length)return root;
 root.append(node('p','cp-authors-label',label||words(locale).authors));
 const list=node('ul','cp-author-list');
 for(const author of authors){
  const item=node('li','cp-author-item');
  const link=routeLink({href:getHref(author),item:author,onNavigate,className:'cp-author-link'});
  const text=node('span','cp-author-copy'),name=node('strong','',localized(author.title,locale));name.dir='auto';
  text.append(name);
  if(!compact)text.append(node('span','cp-author-role',localized(author.role,locale)));
  link.append(portrait(author),text);item.append(link);list.append(item);
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

const profileIconPaths={
 overview:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
 projects:'<path d="m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
 journey:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v5a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8m-3 2 3-3 3 3"/>',
 contribution:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 3v18m4-12h3m-3 4h3"/>',
 chevron:'<path d="m7 10 5 5 5-5"/>',
 award:'<path d="M8 3h8v5a4 4 0 0 1-8 0Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v6m-4 3h8m-7-3h6"/>',
};
function profileIcon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('cp-profile-icon');svg.innerHTML=profileIconPaths[name];return svg;}
const profileLifecycles=new WeakMap();
export function clearProfileDetail(container){profileLifecycles.get(container)?.();profileLifecycles.delete(container);}

/** The active document retains all source content, one routed section at a time. */
export function renderProfileDetail({container,profile,locale='fr',campusName,entries=[],journey,getEntryHref,onNavigate,createFavoriteButton,onExploreCampus,onBack,backLabel,activeSection='overview',getSectionHref,onSectionNavigate,projectControls,filteredProjects,projectFilterActive=false,onResetProjects}){
 clearProfileDetail(container);
 const t=words(locale),selected=normalizeProfileSection(activeSection),lifecycle=new AbortController(),signal=lifecycle.signal;
 container.replaceChildren();container.classList.add('cp-profile-detail');container.dataset.profileSection=selected;
 const back=node('button','cp-back');back.type='button';back.id='profile-back';back.append(arrow(true),document.createTextNode(backLabel||t.back));if(onBack)back.addEventListener('click',onBack);container.append(back);
 const workspace=node('div','cp-profile-workspace'),sidebar=node('aside','cp-profile-sidebar'),reading=node('div','cp-profile-reading-pane');
 const header=node('header','cp-profile-hero'),face=node('div','cp-profile-hero-portrait');face.append(portrait(profile));
 const heading=node('div','cp-profile-heading');heading.append(statusBadge(profile,locale));
 const name=node('h1','',localized(profile.title,locale));name.id='profile-title';name.tabIndex=-1;name.dir='auto';heading.append(name,intraLogin(profile,locale));
 const facts=node('p','cp-profile-facts');facts.append(node('span','',campusName||profile.campus));heading.append(facts,cohortFacts(profile,locale));
 const actions=node('div','cp-profile-actions');
 if(createFavoriteButton)actions.append(createFavoriteButton(profile));
 if(onExploreCampus){const campus=node('button','cp-profile-campus');campus.type='button';campus.append(document.createTextNode(t.campus.replace('{campus}',campusName||profile.campus)),arrow());campus.addEventListener('click',event=>onExploreCampus(event,profile));actions.append(campus);}
 header.append(face,heading,actions);sidebar.append(header);
 const makeNavigation=className=>{
  const navigation=node('nav',className);navigation.setAttribute('aria-label',t.sections);
  profileSections.forEach((key,index)=>{
   const link=node('a');link.href=getSectionHref?.(key)||'#';link.dataset.profileSectionLink=key;
   if(key===selected)link.setAttribute('aria-current','page');
   const number=node('span','cp-profile-section-number',new Intl.NumberFormat(locale,{minimumIntegerDigits:2}).format(index+1));number.setAttribute('aria-hidden','true');
   link.append(profileIcon(key),node('span','',t[key]),number);
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
  const skills=node('section','cp-profile-overview-block');skills.append(node('h3','',t.skills),tags(profile.tags,locale));
  const awards=node('section','cp-profile-overview-block'),awardsTitle=node('h3','',t.awards),awardName=node('bdi','cp-profile-heading-note','42 Awards');awardName.dir='ltr';awardsTitle.append(awardName);awards.append(awardsTitle);
  const empty=node('div','cp-profile-award-empty'),text=node('div');text.append(node('p','cp-profile-award-title',t.noAwards),node('p','',t.awardsHint));empty.append(profileIcon('award'),text);awards.append(empty);content.append(about,skills,awards);
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
 profileLifecycles.set(container,()=>{lifecycle.abort();if(layoutFrame)view.cancelAnimationFrame(layoutFrame);});
 return container;
}
