import {profiles,profileById,getAuthors,getProfileEntries} from './profile-data.mjs';
import {previewEntries} from './content-preview-data.mjs';
import {coverArt} from './content-preview-art.mjs';
import {applyContentCategory,projectFilterGroups,projectFilterOptions,validProjectFilters} from './content-filters.mjs?v=9';
import {mountContentControls} from './content-controls.mjs?v=8';

const titles={1:'Repères permanents',2:'Dock contextuel',3:'Double niveau',4:'Sommaire latéral'};
const variant=String(new URLSearchParams(location.search).get('variant')||'1');
const selectedVariant=Object.hasOwn(titles,variant)?variant:'1';
const leila=profiles[0],entriesById=new Map(previewEntries.map(entry=>[entry.id,entry]));
const campuses={paris:['42 Paris','France'],lyon:['42 Lyon','France'],tokyo:['42 Tokyo','Japon'],rio:['42 Rio','Brésil'],sao:['42 São Paulo','Brésil']};
const globalItems=[['explore','Explorer','compass'],['projects','Projets','projects'],['profiles','Profils','people'],['journal','Le journal','journal']];
const localItems=[['overview','Vue d’ensemble','user'],['projects','Projets','projects'],['journey','Parcours','journey'],['contribution','Contribution','journal']];
const paths={
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
 projects:'<path d="m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 4a4 4 0 0 1 3 4v1"/>',
 journal:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 3v18m4-12h3m-3 4h3"/>',
 user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
 journey:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v5a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8m-3 2 3-3 3 3"/>',
 back:'<path d="m10 6-6 6 6 6m-6-6h16"/>',
 menu:'<path d="M5 6h14M5 12h14M5 18h14"/>',
 chevron:'<path d="m7 10 5 5 5-5"/>',
 award:'<path d="M8 3h8v5a4 4 0 0 1-8 0Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v6m-4 3h8m-7-3h6"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
};
const icon=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]||paths.user}</svg>`;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const status=profile=>({student:'Cadet',transcender:'Transcender',alumni:'Alumni'}[profile.status]);
const personName=profile=>profile.title.fr;
const campusName=id=>campuses[id]?.[0]||id;
const profileHref=(profile=leila,tab='overview')=>`#profile/${tab}${profile.id===leila.id?'':`?person=${encodeURIComponent(profile.id)}`}`;
const root=document.documentElement,body=document.body,main=document.getElementById('study-content'),navArea=document.getElementById('navigation-area');
const dialog=document.getElementById('horizon-menu'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
const animations=new Set();let currentRoute=null,lastFocusedKey=null,replaySequence=0;
const projectSelections=new Map();let projectControls=null;

function selectedProjects(profile){
 if(!projectSelections.has(profile.id)){
  let saved=[];
  try{saved=JSON.parse(sessionStorage.getItem(`horizon-profile-study-project-filters:${profile.id}`)||'[]');}catch{}
  projectSelections.set(profile.id,[...new Set(Array.isArray(saved)?saved:[])].filter(value=>value!=='all'&&validProjectFilters.includes(value)));
 }
 return projectSelections.get(profile.id);
}
function profileProjectList(profile){
 const ownProjects=getProfileEntries(profile.id,previewEntries,{section:'projects'});
 return applyContentCategory(ownProjects,{section:'projects',project:selectedProjects(profile)});
}
function projectCount(profile,list){return `${list.length} projet${list.length>1?'s':''} · ${esc(personName(profile))}`;}
function projectResults(profile,list){
 if(list.length)return `<div class="project-grid">${list.map(entry=>editorialCard(entry,'h3')).join('')}</div>`;
 return `<div class="empty-state"><h3>Aucun projet pour ces filtres</h3><p>Aucun projet de ${esc(personName(profile))} ne correspond aux types sélectionnés dans cet aperçu.</p><button class="cp-show-all" type="button" data-clear-project-filters>Effacer les filtres</button></div>`;
}
function mountProfileProjectControls(route){
 if(route.kind!=='profile'||route.tab!=='projects')return;
 const profile=route.profile;
 const results=document.getElementById('profile-project-results');
 // Keep the document height while choosing several categories. Removing a card
 // must not clamp page scroll, move the anchored menu or dismiss it mid-choice.
 const reserveResultSpace=()=>{results.style.minHeight=Math.ceil(results.getBoundingClientRect().height)+'px';};
 const update=values=>{
  projectSelections.set(profile.id,values);
  try{sessionStorage.setItem(`horizon-profile-study-project-filters:${profile.id}`,JSON.stringify(values));}catch{}
  const list=profileProjectList(profile);
  document.getElementById('profile-project-count').innerHTML=projectCount(profile,list);
  document.getElementById('profile-project-results').innerHTML=projectResults(profile,list);
 };
 projectControls=mountContentControls({
  container:document.getElementById('profile-project-controls'),categoryOnly:true,
  getLocale:()=> 'fr',getState:()=>({}),
  getFilter:()=>({label:'Projet',values:selectedProjects(profile),groups:projectFilterGroups('fr'),options:projectFilterOptions('fr')}),
  onOpen:reserveResultSpace,onClose:()=>results.style.removeProperty('min-height'),
  onChange:(name,values)=>{if(name==='category'){reserveResultSpace();update(values);}},
 });
 projectControls.reset=()=>{update([]);projectControls.refresh();document.getElementById('content-category-button').focus({preventScroll:true});};
}

body.dataset.variant=selectedVariant;
document.getElementById('study-title').textContent=`0${selectedVariant} · ${titles[selectedVariant]}`;
document.title=`42 Horizon · ${titles[selectedVariant]} — étude de navigation`;
try{root.dataset.theme=sessionStorage.getItem('horizon-profile-navigation-study-theme')==='dark'?'dark':'light';}catch{}
function refreshThemeLabel(){document.getElementById('study-theme').textContent=root.dataset.theme==='dark'?'Mode clair':'Mode sombre';document.getElementById('study-theme').setAttribute('aria-label',`Activer le thème ${root.dataset.theme==='dark'?'clair':'sombre'}`);}
refreshThemeLabel();
document.getElementById('study-theme').addEventListener('click',()=>{
 root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';refreshThemeLabel();
 try{sessionStorage.setItem('horizon-profile-navigation-study-theme',root.dataset.theme);}catch{}
});

function routeFromHash(){
 const [path,query='']=(location.hash.slice(1)||'profiles').split('?'),[section,detail]=path.split('/');
 const params=new URLSearchParams(query);
 if(section==='profile'){
  const tab=detail==='journal'?'contribution':detail;
  return {kind:'profile',section:'profiles',tab:localItems.some(([key])=>key===tab)?tab:'overview',profile:profileById.get(params.get('person'))||leila};
 }
 if(section==='project'||section==='article'){
  const entry=entriesById.get(detail);
  if(entry&&(entry.section==='projects'||entry.section==='journal'))return {kind:'entry',section:entry.section,entry};
 }
 if(globalItems.some(([key])=>key===section))return {kind:'global',section,campus:Object.hasOwn(campuses,params.get('campus'))?params.get('campus'):null};
 return {kind:'global',section:'profiles',campus:null};
}
function pageHeader(eyebrow,title,description=''){
 return `<header class="page-header"><p class="eyebrow">${esc(eyebrow)}</p><h1 tabindex="-1">${esc(title)}</h1>${description?`<p>${esc(description)}</p>`:''}</header>`;
}
function identityDetails(profile){return `<div class="identity-details"><span>${esc(campusName(profile.campus))}</span><span>Rentrée ${profile.arrivalYear}</span><span>Promotion ${profile.promotionNumber}</span></div>`;}
function personCard(profile){
 return `<a class="person-card" href="${profileHref(profile)}" aria-label="Ouvrir le profil de ${esc(personName(profile))}"><span class="person-portrait"><img src="${esc(profile.avatar)}" alt="" width="96" height="96"></span><span class="status">${status(profile)}</span><h2>${esc(personName(profile))}</h2><p class="login">@${esc(profile.intraLogin)}</p><p class="campus">${esc(campusName(profile.campus))}</p><div class="identity-details"><span>Rentrée ${profile.arrivalYear}</span><span>Promo ${profile.promotionNumber}</span></div></a>`;
}
function editorialCard(entry,heading='h2'){
 const authors=getAuthors(entry).map(personName).join(' · '),href=`#${entry.section==='projects'?'project':'article'}/${entry.id}`;
 return `<a class="editorial-card" href="${href}"><span class="cover">${coverArt(entry.cover)}</span><p class="eyebrow">${esc(campusName(entry.campus))}</p><${heading}>${esc(entry.title.fr)}</${heading}><p>${esc(entry.summary.fr)}</p><span class="article-meta">${esc(authors)}</span></a>`;
}
function localNav(profile,tab,extraClass=''){
 return `<nav class="local-nav ${extraClass}" aria-label="Rubriques du profil de ${esc(personName(profile))}">${localItems.map(([key,label,symbol])=>`<a href="${profileHref(profile,key)}" data-focus-key="local-${key}" ${key===tab?'aria-current="page"':''} aria-label="${esc(label)} de ${esc(personName(profile))}">${icon(symbol)}<span class="nav-label">${label}</span></a>`).join('')}</nav>`;
}
function profileSectionSelector(profile,tab){
 const selected=localItems.find(([key])=>key===tab);
 return `<details class="section-switch"><summary class="section-switch-trigger glass" data-focus-key="section-switch"><span class="switch-caption">Dans ce profil</span><span class="switch-selection">${icon(selected[2])}<span>${selected[1]}</span></span>${icon('chevron')}</summary><nav class="section-switch-panel glass" aria-label="Choisir une rubrique du profil de ${esc(personName(profile))}">${localItems.map(([key,label,symbol],index)=>`<a href="${profileHref(profile,key)}" data-focus-key="mobile-${key}" ${key===tab?'aria-current="page"':''}>${icon(symbol)}<span>${label}</span><span class="section-number" aria-hidden="true">0${index+1}</span></a>`).join('')}</nav></details>`;
}
function profileSidebarNav(profile,tab){
 return `<nav class="profile-sidebar-nav" aria-label="Rubriques du profil de ${esc(personName(profile))}">${localItems.map(([key,label,symbol],index)=>`<a href="${profileHref(profile,key)}" data-focus-key="sidebar-${key}" ${key===tab?'aria-current="page"':''}>${icon(symbol)}<span>${label}</span><span class="section-number" aria-hidden="true">0${index+1}</span></a>`).join('')}</nav>`;
}
function profileContent(route){
 const {profile,tab}=route,name=personName(profile),works=profileProjectList(profile),articles=getProfileEntries(profile.id,previewEntries,{section:'journal'});
 const heading={overview:'Vue d’ensemble',projects:`Projets de ${name.split(' ')[0]}`,journey:`Parcours de ${name.split(' ')[0]}`,contribution:`Contribution de ${name.split(' ')[0]}`}[tab];
 let section='';
 if(tab==='overview')section=`<h2>${heading}</h2><div class="overview-block"><h3>À propos</h3><p>${esc(profile.bio.fr)}</p></div><div class="overview-block"><h3>Compétences</h3><div class="tags">${profile.tags.map(tag=>`<span class="tag">${esc(tag)}</span>`).join('')}</div></div><div class="overview-block awards-block"><h3>Distinctions <span class="heading-note">42 Awards</span></h3><div class="award-empty">${icon('award')}<div><p class="award-empty-title">Aucune distinction renseignée</p><p>Les distinctions 42 Awards de ce profil apparaîtront ici.</p></div></div></div>`;
 if(tab==='projects')section=`<div class="section-heading"><h2>${heading}</h2><a class="text-link" href="#projects">Tous les projets Horizon →</a></div><div class="profile-projects-toolbar"><p id="profile-project-count" class="content-count" role="status" aria-live="polite" aria-atomic="true">${projectCount(profile,works)}</p><div id="profile-project-controls"></div></div><div id="profile-project-results">${projectResults(profile,works)}</div>`;
 if(tab==='journey'){
  const journey=entriesById.get(profile.journeyEntryId);
  section=`<h2>${heading}</h2><ol class="timeline">${profile.milestones.map(step=>`<li><time>${esc(step.date)}</time><div><h3>${esc(step.label.fr)}</h3><p>${esc(step.text.fr)}</p></div></li>`).join('')}</ol>${journey?`<div class="article"><h2>${esc(journey.title.fr)}</h2><p>${esc(journey.summary.fr)}</p>${journey.body.map(part=>`<h2>${esc(part.heading.fr)}</h2><p>${esc(part.text.fr)}</p>`).join('')}</div>`:''}`;
 }
 if(tab==='contribution')section=`<div class="section-heading"><h2>${heading}</h2><a class="text-link" href="#journal">Tout le journal Horizon →</a></div><p class="contribution-intro">Les contributions de ce profil au journal Horizon.</p>${articles.length?`<div class="project-grid">${articles.map(entry=>editorialCard(entry,'h3')).join('')}</div>`:`<div class="empty-state"><h3>Une page encore ouverte</h3><p>${esc(name)} n’a pas encore de contribution au journal dans cet aperçu.</p><a class="text-link" href="#journal">Découvrir les articles de la communauté →</a></div>`}`;
 const topline=`<div class="profile-topline"><a class="text-link" href="#profiles">${icon('back')}Tous les profils</a><button class="replay-button" type="button" data-replay>Rejouer l’entrée du profil</button></div>`;
 const identity=`<header class="profile-identity"><img class="hero-portrait" src="${esc(profile.avatar)}" alt="Portrait illustré de ${esc(name)}" width="150" height="150"><div class="identity-copy"><span class="status">${status(profile)}</span><h1 tabindex="-1">${esc(name)}</h1><p class="login">@${esc(profile.intraLogin)}</p>${identityDetails(profile)}</div></header>`;
 const content=`<section class="profile-section" aria-label="${esc(heading)}">${section}</section>`;
 if(selectedVariant==='4')return `${topline}<div class="profile-workspace"><aside class="profile-sidebar">${identity}${profileSidebarNav(profile,tab)}</aside><div class="profile-reading-pane">${profileSectionSelector(profile,tab)}${content}</div></div>`;
 return `${topline}${identity}${selectedVariant==='1'?localNav(profile,tab,'profile-tabs'):''}${content}`;
}
function entryContent(route){
 const {entry}=route,isProject=entry.section==='projects';
 return `<a class="text-link" href="#${entry.section}">${icon('back')}${isProject?'Tous les projets':'Tout le journal'}</a><article class="article">${pageHeader(`${campusName(entry.campus)} · ${isProject?'Projet':'Journal'}`,entry.title.fr,entry.summary.fr)}<div class="author-links">${getAuthors(entry).map(profile=>`<a class="author-link" href="${profileHref(profile)}"><img src="${esc(profile.avatar)}" alt="" width="30" height="30">${esc(personName(profile))}</a>`).join('')}</div><div class="cover">${coverArt(entry.cover)}</div>${entry.body.map(part=>`<h2>${esc(part.heading.fr)}</h2><p>${esc(part.text.fr)}</p>`).join('')}</article>`;
}
function globalContent(route){
 if(route.section==='profiles'){
  const list=profiles.filter(profile=>!route.campus||profile.campus===route.campus);
  return `${pageHeader(route.campus?campusName(route.campus):'La communauté Horizon','Profils','Des personnes, des idées et autant de façons de tracer son chemin.')}${route.campus?'<a class="text-link" href="#profiles">Tous les campus →</a>':''}<p class="content-count">${list.length} profil${list.length>1?'s':''}</p><div class="profile-grid">${list.map(personCard).join('')}</div>`;
 }
 if(route.section==='explore')return `${pageHeader('Le réseau Horizon','Explorer','Retrouver les personnes qui font vivre chaque campus.')}<p class="explore-note eyebrow">Aperçu simplifié pour tester la navigation entre rubriques.</p><div class="campus-grid">${Object.entries(campuses).map(([key,[name,country]])=>`<a href="#profiles?campus=${key}" class="campus-card">${icon('globe')}<h2>${name}</h2><p>${country} · ${profiles.filter(profile=>profile.campus===key).length} profil${profiles.filter(profile=>profile.campus===key).length>1?'s':''}</p></a>`).join('')}</div>`;
 const list=previewEntries.filter(entry=>entry.section===route.section),isProject=route.section==='projects';
 return `${pageHeader('Tous les campus · Tous les auteurs',isProject?'Projets':'Le journal',isProject?'Explorer les réalisations de toute la communauté.':'Des essais, des rencontres et des découvertes partagées.')}<p class="content-count">${list.length} ${isProject?'projets':'articles'}</p><div class="project-grid">${list.map(entry=>editorialCard(entry)).join('')}</div>`;
}
function globalNav(route){return `<nav class="dock-nav glass" aria-label="Navigation générale Horizon">${globalItems.map(([key,label,symbol])=>`<a href="#${key}" data-motion-key="${key==='profiles'?'profile-root':`global-${key}`}" data-focus-key="global-${key}" ${key===route.section?'aria-current="page"':''} aria-label="${label}">${icon(symbol)}<span class="nav-label">${label}</span></a>`).join('')}</nav>`;}
function contextNav(route){
 return `<button type="button" class="menu-horizon-trigger glass" id="open-menu" aria-haspopup="dialog" aria-expanded="false" aria-controls="horizon-menu">${icon('menu')}Menu Horizon</button><nav class="dock-nav context-dock glass" aria-label="Navigation dans le profil de ${esc(personName(route.profile))}"><a href="#profiles" class="profile-return" data-motion-key="profile-root" data-focus-key="profile-back" aria-label="Retour à tous les profils">${icon('back')}<span class="nav-label">Profils</span></a><span class="dock-separator" aria-hidden="true"></span>${localItems.map(([key,label,symbol])=>`<a href="${profileHref(route.profile,key)}" data-motion-key="local-${key}" data-focus-key="local-${key}" ${key===route.tab?'aria-current="page"':''} aria-label="${label} de ${esc(personName(route.profile))}">${icon(symbol)}<span class="nav-label">${label}</span></a>`).join('')}</nav>`;
}
function finishAnimations(){for(const animation of animations)try{animation.finish();}catch{}animations.clear();document.querySelectorAll('.nav-ghost').forEach(node=>node.remove());}
function animate(element,frames,options){
 if(reduced.matches)return null;
 const animation=element.animate(frames,{duration:360,easing:'cubic-bezier(.22,1,.36,1)',...options});animations.add(animation);
 animation.finished.catch(()=>{}).finally(()=>{animations.delete(animation);if(element.classList.contains('nav-ghost'))element.remove();});return animation;
}
function captureNavigation(){
 return new Map([...navArea.querySelectorAll('[data-motion-key]')].map(element=>{
  const clone=element.cloneNode(true),label=element.querySelector('.nav-label');
  if(label)clone.querySelector('.nav-label').style.display=getComputedStyle(label).display;
  return [element.dataset.motionKey,{rect:element.getBoundingClientRect(),clone}];
 }));
}
function moveNavigation(previous){
 if(reduced.matches)return;
 const current=new Set();
 for(const element of navArea.querySelectorAll('[data-motion-key]')){
  const key=element.dataset.motionKey,old=previous.get(key);current.add(key);
  if(old){
   const next=element.getBoundingClientRect(),dx=old.rect.left-next.left,dy=old.rect.top-next.top;
   if(Math.abs(dx)+Math.abs(dy)>.5)animate(element,[{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:440});
  }else animate(element,[{opacity:0,transform:'translateX(15px)'},{opacity:1,transform:'translateX(0)'}],{delay:95,duration:280,fill:'backwards'});
 }
 for(const [key,{rect,clone}]of previous){
  if(current.has(key))continue;
  clone.removeAttribute('id');clone.removeAttribute('href');clone.removeAttribute('data-motion-key');clone.removeAttribute('data-focus-key');clone.removeAttribute('aria-current');clone.className='nav-ghost';clone.setAttribute('aria-hidden','true');clone.inert=true;
  Object.assign(clone.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});document.body.append(clone);
  animate(clone,[{opacity:.8,transform:'translateY(0)'},{opacity:0,transform:'translateY(7px)'}],{duration:145,fill:'forwards'});
 }
}
function fitSectionPanel({ensureRoom=false}={}){
 const sectionSwitch=main.querySelector('.section-switch');if(!sectionSwitch?.open||!sectionSwitch.getClientRects().length)return;
 const trigger=sectionSwitch.querySelector('summary'),dock=navArea.querySelector('.dock-nav');
 const spaceBelow=()=>Math.floor((dock?.getBoundingClientRect().top??innerHeight)-trigger.getBoundingClientRect().bottom-20);
 const minimumRoom=Math.min(180,innerHeight*.36);
 if(ensureRoom&&spaceBelow()<minimumRoom&&trigger.getBoundingClientRect().top>12){
  window.scrollBy({top:Math.min(minimumRoom-spaceBelow(),trigger.getBoundingClientRect().top-12),behavior:'instant'});
 }
 sectionSwitch.style.setProperty('--section-panel-room',`${Math.max(0,spaceBelow())}px`);
}
function closeMenu(){if(dialog.open)dialog.close();document.getElementById('open-menu')?.setAttribute('aria-expanded','false');}
function render({initial=false,replay=false}={}){
 finishAnimations();const previous=captureNavigation(),oldRoute=currentRoute,next=routeFromHash();closeMenu();currentRoute=next;
 projectControls?.destroy();projectControls=null;
 body.dataset.profileOpen=String(next.kind==='profile');
 main.innerHTML=next.kind==='profile'?profileContent(next):next.kind==='entry'?entryContent(next):globalContent(next);
 if(next.kind==='profile'&&selectedVariant==='2')navArea.innerHTML=contextNav(next);
 else navArea.innerHTML=`${next.kind==='profile'&&selectedVariant==='3'?`<div class="local-surface glass"><p class="local-context">Profil de ${esc(personName(next.profile))}</p>${localNav(next.profile,next.tab)}</div>`:''}${globalNav(next)}`;
 mountProfileProjectControls(next);
 document.getElementById('study-variants').innerHTML=Object.entries(titles).map(([key,title])=>`<a class="variant-link" href="demo.html?variant=${key}${location.hash||'#profiles'}" ${key===selectedVariant?'aria-current="page"':''} aria-label="Piste ${key} · ${title}">0${key}</a>`).join('');
 document.getElementById('horizon-menu-links').innerHTML=globalItems.map(([key,label,symbol])=>`<a href="#${key}" ${key===next.section?'aria-current="page"':''}>${icon(symbol)}${label}</a>`).join('');
 if(!initial){
  if(selectedVariant==='2')moveNavigation(previous);
  if(selectedVariant==='3'&&next.kind==='profile'&&oldRoute?.kind!=='profile')animate(navArea.querySelector('.local-surface'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:330});
  const readingChange=selectedVariant==='4'&&next.kind==='profile'&&oldRoute?.kind==='profile'&&next.profile.id===oldRoute.profile.id;
  animate(readingChange?main.querySelector('.profile-section'):main,[{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:210});
  window.scrollTo({top:0,behavior:'instant'});
  const focusedKey=lastFocusedKey?.startsWith('mobile-')?'section-switch':lastFocusedKey;
  const focused=focusedKey&&document.querySelector(`[data-focus-key="${focusedKey}"]`);
  (focused?.getClientRects().length?focused:main.querySelector('h1')||main).focus({preventScroll:true});
 }
 lastFocusedKey=null;
 const announcement=next.kind==='profile'?`${personName(next.profile)} · ${localItems.find(([key])=>key===next.tab)[1]}`:main.querySelector('h1')?.textContent;
 document.getElementById('route-status').textContent=announcement;
}
document.addEventListener('click',event=>{
 const sectionSwitch=main.querySelector('.section-switch');
 if(sectionSwitch?.open&&!event.target.closest('.section-switch'))sectionSwitch.open=false;
 if(event.target.closest('[data-clear-project-filters]')){projectControls?.reset();return;}
 const replay=event.target.closest('[data-replay]');
 if(replay){
  const target=profileHref(currentRoute.profile,'overview'),sequence=++replaySequence;
  history.replaceState(null,'','#profiles');render();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(sequence!==replaySequence)return;history.replaceState(null,'',target);render({replay:true});}));return;
 }
 const menu=event.target.closest('#open-menu');
 if(menu){menu.setAttribute('aria-expanded','true');dialog.showModal();dialog.querySelector('a')?.focus();return;}
 if(event.target.closest('#close-menu')){closeMenu();return;}
 const link=event.target.closest('a[href^="#"]');
 if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 if(link.classList.contains('skip-link')){event.preventDefault();main.focus();main.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});return;}
 replaySequence++;
 lastFocusedKey=link.dataset.focusKey||null;closeMenu();
 if(link.getAttribute('href')===location.hash){event.preventDefault();lastFocusedKey=null;if(link.closest('.section-switch-panel')){sectionSwitch.open=false;sectionSwitch.querySelector('summary').focus();}}
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeMenu();}});
dialog.addEventListener('close',()=>document.getElementById('open-menu')?.setAttribute('aria-expanded','false'));
document.addEventListener('keydown',event=>{
 const sectionSwitch=main.querySelector('.section-switch');
 if(event.key==='Escape'&&sectionSwitch?.open){event.preventDefault();sectionSwitch.open=false;sectionSwitch.querySelector('summary').focus();return;}
 if(event.target.closest('.section-switch-trigger')&&['ArrowDown','ArrowUp'].includes(event.key)){
  event.preventDefault();sectionSwitch.open=true;
  const links=[...sectionSwitch.querySelectorAll('a')];(event.key==='ArrowDown'?links[0]:links.at(-1))?.focus();return;
 }
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
 const nav=event.target.closest('.dock-nav,.local-nav,.profile-sidebar-nav,.section-switch-panel');if(!nav)return;
 const vertical=nav.matches('.profile-sidebar-nav,.section-switch-panel');
 if(vertical?['ArrowLeft','ArrowRight'].includes(event.key):['ArrowUp','ArrowDown'].includes(event.key))return;
 const links=[...nav.querySelectorAll('a')],index=links.indexOf(document.activeElement);if(index<0)return;
 const target=event.key==='Home'?0:event.key==='End'?links.length-1:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+links.length)%links.length;
 event.preventDefault();links[target].focus();
});
main.addEventListener('toggle',event=>{
 if(event.target.matches('.section-switch')&&event.target.open){fitSectionPanel({ensureRoom:true});animate(event.target.querySelector('.section-switch-panel'),[{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:180});}
},true);
main.addEventListener('focusout',event=>{
 const sectionSwitch=event.target.closest('.section-switch');
 if(sectionSwitch?.open&&event.relatedTarget&&!sectionSwitch.contains(event.relatedTarget))sectionSwitch.open=false;
});
let sectionPanelFrame=0;
function scheduleSectionPanelFit(){
 if(sectionPanelFrame)return;
 sectionPanelFrame=requestAnimationFrame(()=>{sectionPanelFrame=0;fitSectionPanel();});
}
window.addEventListener('scroll',scheduleSectionPanelFit,{passive:true});
window.addEventListener('resize',scheduleSectionPanelFit);
matchMedia('(max-width:840px)').addEventListener('change',event=>{
 const sectionSwitch=main.querySelector('.section-switch');if(!sectionSwitch)return;
 sectionSwitch.open=false;
 if(event.matches&&document.activeElement?.closest('.profile-sidebar-nav'))sectionSwitch.querySelector('summary').focus({preventScroll:true});
 else if(!event.matches&&document.activeElement?.closest('.section-switch'))main.querySelector('.profile-sidebar-nav [aria-current]')?.focus({preventScroll:true});
});
window.addEventListener('hashchange',()=>{replaySequence++;render();});
reduced.addEventListener('change',()=>{if(reduced.matches)finishAnimations();});
if(!location.hash)history.replaceState(null,'','#profiles');
render({initial:true});
