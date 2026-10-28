// Archive viewer: adapted dependency/asset paths only. Original: welcome.mjs.
import {createDetailScroll} from '../../../site/detail-scroll.mjs?v=4';
import {mountBrandWordmark} from '../../../site/brand-wordmark.mjs?v=2';
import {createRandomDiscovery} from '../../../site/random-discovery.mjs?v=2';
import {projectFilterOptions,projectFilterGroups,profileFilterOptions,profileFilterGroups,applyContentCategory} from './runtime/content-filters.mjs?v=7';
import {createContentPreferences,sortContentEntries,publishedAt,CONTENT_PREFERENCES_KEY} from './runtime/content-preferences.mjs?v=7';
import {mountContentControls,createFavoriteButton,contentControlCopy} from '../../../site/content-controls.mjs?v=11';
import {mountReadingScope} from '../../../site/reading-scope.mjs?v=1';
import {mountScopePopover} from '../../../site/scope-popover.mjs?v=2';
import {mountDockSearch} from './runtime/dock-search.mjs?v=detail-scroll-14';
import {searchDockData} from '../../../site/dock-search-data.mjs?v=7';
import {createContentTransitions} from '../../../site/content-transitions.mjs?v=3';
import {mountDockNavigation} from '../../../site/dock-navigation.mjs?v=progressive-center-6';
import {createCampusMapDialog} from './runtime/campus-map-dialog.mjs?v=1';
import {mountEntrance} from '../../../site/entrance.mjs?v=visible-scan-5';
import {mountCampusDetails} from './runtime/campus-details.mjs?v=5';
import {previewEntries} from './runtime/content-preview-data.mjs?v=1';
import {createDiscoveryEntries,profileById,entryAuthors,getAuthors,getProfileEntries,legacyProfileRoutes} from './runtime/profile-data.mjs?v=7';
import {renderProfileCard,renderProfileDetail,clearProfileDetail,createAuthorByline} from './runtime/profile-ui.mjs?v=16';
import {normalizeProfileSection,normalizeProfileProjectFilters,profileBackDistance} from './runtime/profile-sections.mjs?v=2';
const discoveryEntries=createDiscoveryEntries(previewEntries);
import {coverArt} from './runtime/content-preview-art.mjs?v=1';
import {renderProjectDetail,clearProjectDetail,normalizeProjectSection,projectBackDistance} from './runtime/project-ui.mjs?v=7';
import {renderJournalDetail,clearJournalDetail,normalizeJournalSection,journalBackDistance} from './runtime/journal-ui.mjs?v=6';
import {mountScopeSelectors} from '../../../site/scope-selectors.mjs?v=1';
import {createGeographyLoader} from '../../../site/geography-loader.mjs';

const byId = id => document.getElementById(id);
const app = byId('app');
const nav = byId('main-nav');
const indicator = nav.querySelector('.nav-indicator');
const buttons = [...nav.querySelectorAll('button[data-section]')];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const brandWordmark=mountBrandWordmark({element:byId('brand-wordmark'),brandLink:document.querySelector('.brand'),motion});
const contentTransitions=createContentTransitions({app,sheet:byId('content-sheet'),motion});
const detailScroll=createDetailScroll({sheet:byId('content-sheet')});
const hasEntrance=document.body.dataset.entry!=='welcome';
let entryOpen=!hasEntrance;
const defaultSection=hasEntrance?'explore':'projects';
let locale = 'fr', section = defaultSection, dark = false, globe;
const readingScope=mountReadingScope({app,bar:byId('scope-bar'),anchor:byId('scope-medallion'),trail:document.querySelector('.scope-trail'),back:byId('scope-back'),summary:byId('scope-reading-summary'),motion});
const dockNavigation=mountDockNavigation({app,stage:byId('globe'),anchor:byId('scope-medallion'),getAnchorRect:readingScope.getAnchorRect,getWorldGeometry:()=>globe?.getWorldScreenGeometry?.()});
let scope = {level:'world',country:null,campus:null};
let campusPreparation=null,campusRenderError=null,campusRendering=false;
let network = null, campuses = [], countries = [], loadFailed = false, entrance, preparation=null, identity='visitor';
const preloadTrace={startedAt:null,attempts:0,phase:'scheduled'};
const diagnostics=new URLSearchParams(location.search).get('perf')==='1';
const traceOutput=diagnostics?document.createElement('pre'):null;
if(traceOutput){traceOutput.id='entry-preload-state';traceOutput.className='entry-diagnostics';document.body.append(traceOutput);}
function trace(update){Object.assign(preloadTrace,update);document.getElementById('entrance').dataset.preload=preloadTrace.phase;if(traceOutput)traceOutput.textContent=JSON.stringify(preloadTrace,null,2);}
const geography=createGeographyLoader({
 workerFactory:()=>new Worker(new URL('../../../site/geography-worker.mjs',import.meta.url),{type:'module'}),
 url:new URL('../../../site/geography/world-countries.topo.json.gz?v=ne5.1.1-1',import.meta.url).href,
 rawUrl:new URL('../../../site/geography/world-countries.topo.json?v=ne5.1.1-1',import.meta.url).href,
 onState(state){if(state.phase==='downloading')trace({startedAt:performance.now(),attempts:preloadTrace.attempts+1});trace(state);},
});
const campusById = new Map(), countryById = new Map();
const sampleCampuses={paris:{name:'42 Paris',country:'FRA'},lyon:{name:'42 Lyon',country:'FRA'},tokyo:{name:'42 Tokyo',country:'JPN'},rio:{name:'42 Rio',country:'BRA'},sao:{name:'42 São Paulo',country:'BRA'}};
let searchCatalog={campuses:Object.entries(sampleCampuses).map(([id,campus])=>({id,...campus})),countries:[]};
let dockSearch;
const randomDiscovery=createRandomDiscovery();
const contentPreferences=createContentPreferences({storage:()=>localStorage,validIds:discoveryEntries.map(entry=>entry.id),idAliases:legacyProfileRoutes});
function contentCategoryFilter(){
 const state=contentPreferences.snapshot();
 if(section==='projects')return {label:{fr:'Projet',en:'Project',ar:'المشروع'}[locale],values:state.project,selectionLabel:{fr:state.project.length+' projets',en:state.project.length+' projects',ar:state.project.length+' مشاريع'}[locale],options:projectFilterOptions(locale),groups:projectFilterGroups(locale)};
 if(section==='people')return {label:{fr:'Profil',en:'Profile',ar:'الملف'}[locale],values:state.status,selectionLabel:{fr:state.status.length+' critères',en:state.status.length+' filters',ar:state.status.length+' معايير'}[locale],options:profileFilterOptions(discoveryEntries.filter(entry=>entry.kind==='profile'),locale),groups:profileFilterGroups(locale)};
 return null;
}
const contentControls=mountContentControls({
 container:byId('content-views'),getLocale:()=>locale,getState:()=>contentPreferences.snapshot(),getFilter:contentCategoryFilter,
 onChange(name,value){contentPreferences.setPreference(name==='category'?(section==='projects'?'project':'status'):name,value);updateContentView();renderContent({keepControlsOpen:name==='category'});},
});
function updateContentView(){
 byId('content-index').dataset.view=contentPreferences.snapshot().view;
 contentControls.refresh();
}
window.addEventListener('storage',event=>{
 if(event.key===CONTENT_PREFERENCES_KEY||event.key===null){contentPreferences.restore();updateContentView();renderContent();}
});
const sampleCampus=id=>campusById.get(id)||sampleCampuses[id];
const sections=['explore','projects','people','journal','awards'];
let route=readRoute(), mapReady=false, applyingRoute=false, scopePopover;
history.scrollRestoration='manual';
function readRoute(){
 const [path,query='']=location.hash.slice(1).split('?');
 const [tab,id]=path.split('/'),params=new URLSearchParams(query);
 const section=sections.includes(tab)?tab:defaultSection;
 const entryId=section==='people'?(legacyProfileRoutes[id]||id):id;
 const isProfile=section==='people'&&profileById.has(entryId);
 return {section,entryId:discoveryEntries.some(entry=>entry.id===entryId&&entry.section===section)?entryId:null,country:params.get('country')||null,campus:params.get('campus')||null,query:'',profileTab:isProfile?normalizeProfileSection(params.get('tab'),{legacy:Boolean(legacyProfileRoutes[id])}):'overview',profileProjects:isProfile?normalizeProfileProjectFilters(params.get('project')):[],projectTab:section==='projects'?normalizeProjectSection(params.get('tab')):'overview',journalTab:section==='journal'?normalizeJournalSection(params.get('tab')):'article'};
}
function routeURL(next){
 const params=new URLSearchParams();
 for(const [key,value] of [['country',next.country],['campus',next.campus],['q',next.query]])if(value)params.set(key,value);
 if(next.section==='people'&&profileById.has(next.entryId)){
  const tab=normalizeProfileSection(next.profileTab),projects=normalizeProfileProjectFilters(next.profileProjects);
  if(tab!=='overview')params.set('tab',tab);
  if(projects.length)params.set('project',projects.join(','));
 }
 if(next.section==='projects'&&next.entryId&&normalizeProjectSection(next.projectTab)!=='overview')params.set('tab',normalizeProjectSection(next.projectTab));
 if(next.section==='journal'&&next.entryId&&normalizeJournalSection(next.journalTab)!=='article')params.set('tab',normalizeJournalSection(next.journalTab));
 return `#${next.section}${next.entryId?'/'+next.entryId:''}${params.size?'?'+params:''}`;
}
const profileProjectControlsContainer=document.createElement('div');
profileProjectControlsContainer.id='profile-project-controls';
const profileProjectControls=mountContentControls({
 container:profileProjectControlsContainer,idPrefix:'profile-project',controls:['category'],getLocale:()=>locale,getState:()=>contentPreferences.snapshot(),
 getFilter:()=>({label:{fr:'Projet',en:'Project',ar:'المشروع'}[locale],values:route.profileProjects,options:projectFilterOptions(locale),groups:projectFilterGroups(locale)}),
 onChange(name,value){
  if(name!=='category')return;
  route.profileProjects=normalizeProfileProjectFilters(value);
  history.replaceState({...history.state},'',routeURL(route));
  renderContent({keepProfileControlsOpen:true});
 },
});
function changeProfileSection(event,key){
 if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 if(route.profileTab===key){const picker=byId('profile-section-picker');if(picker?.parentElement.open){picker.parentElement.open=false;picker.focus({preventScroll:true});}detailScroll.centerActive();return;}
 const origin=history.state||{};
 navigate({profileTab:key},{fromList:origin.fromList,fromDetail:origin.fromDetail,returnSection:origin.returnSection||section,profileDepth:(origin.profileDepth||0)+1,profileSectionChange:true});
}
function changeProjectSection(event,key){
 if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 if(route.projectTab===key){const picker=byId('project-section-picker');if(picker?.parentElement.open){picker.parentElement.open=false;picker.focus({preventScroll:true});}detailScroll.centerActive();return;}
 const origin=history.state||{};
 navigate({projectTab:key},{fromList:origin.fromList,fromDetail:origin.fromDetail,returnSection:origin.returnSection||section,projectDepth:(origin.projectDepth||0)+1,projectSectionChange:true});
}
function changeJournalSection(event,key){
 if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 if(route.journalTab===key){const picker=byId('journal-section-picker');if(picker?.parentElement.open){picker.parentElement.open=false;picker.focus({preventScroll:true});}detailScroll.centerActive();return;}
 const origin=history.state||{};
 navigate({journalTab:key},{fromList:origin.fromList,fromDetail:origin.fromDetail,returnSection:origin.returnSection||section,journalDepth:(origin.journalDepth||0)+1,journalSectionChange:true});
}
function rememberScroll(){history.replaceState({...history.state,cp:true,scroll:scrollY,detailScroll:detailScroll.capture()},'',location.href);}
function navigate(next,{replace=false,fromList=false,fromDetail=false,returnSection=route.section,profileDepth=0,profileSectionChange=false,projectDepth=0,projectSectionChange=false,journalDepth=0,journalSectionChange=false}={}){
 rememberScroll();
 const changedEntry=(next.entryId!==undefined&&next.entryId!==route.entryId)||(next.section&&next.section!==route.section);
 route={...route,...(changedEntry?{profileTab:'overview',profileProjects:[],projectTab:'overview',journalTab:'article'}:{}),...next};
 history[replace?'replaceState':'pushState']({cp:true,scroll:0,fromList,fromDetail,returnSection,profileDepth,projectDepth,journalDepth},'',routeURL(route));
 applyRoute({scroll:0,focus:true,profileSectionChange,projectSectionChange,journalSectionChange});
}
function syncMap(){
 if(!mapReady||!entryOpen)return;
 let desiredCampus=campusById.get(route.campus);
 const desiredCountry=desiredCampus?.country||(countryById.has(route.country)?route.country:null);
 route.campus=desiredCampus?.id||null;route.country=desiredCountry;
 if(location.hash!==routeURL(route))history.replaceState({...history.state},'',routeURL(route));
 if(scope.country===route.country&&scope.campus===route.campus)return;
 applyingRoute=true;
 try{if(route.campus)globe.selectCampus(route.campus);else if(route.country)globe.selectCountry(route.country);else globe.reset();}
 finally{applyingRoute=false;}
}
let routeApplyVersion=0;
function applyRoute({scroll=0,columns=null,focus=false,profileSectionChange=false,projectSectionChange=false,journalSectionChange=false}={}){
 const applyVersion=++routeApplyVersion;
 const resumeDockScroll=dockSearch?.suspendDocumentScroll();
 scopePopover?.close();
 dockSearch?.close({restoreFocus:false});
 // Keep the world visible behind the entrance until the circle has revealed it.
 const nextSection=entryOpen?route.section:'explore';
 const exitSnapshot=section!=='explore'&&section!=='awards'&&nextSection==='explore'?contentTransitions.captureExit():null;
 contentTransitions.cancel();
 section=nextSection;app.dataset.section=section;
 brandWordmark.setAwards(section==='awards',{animate:entryOpen});
 const reading=section!=='explore'&&Boolean(route.entryId);
 readingScope.setReading(reading);
 updateScope();
 buttons.forEach(button=>{if(button.dataset.section===section)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 byId('content-sheet').inert=section==='explore'||section==='awards';
 byId('content-sheet').hidden=section==='awards';
 byId('scope-bar').inert=section==='awards';
 byId('scope-bar').setAttribute('aria-hidden',String(section==='awards'));
 byId('about').hidden=section!=='explore';
 byId('globe').inert=section!=='explore';byId('globe').setAttribute('aria-hidden',String(section!=='explore'));
 document.querySelector('.globe-footer').inert=section!=='explore';
 syncMap();renderContent();moveIndicator();dockNavigation.sync();
 if(exitSnapshot)contentTransitions.exit(exitSnapshot);
 else if(focus&&section!=='explore'&&section!=='awards'&&!profileSectionChange&&!projectSectionChange&&!journalSectionChange)contentTransitions.enter();
 if(profileSectionChange&&!motion.matches)byId('profile-detail').querySelector('.cp-profile-active-section')?.animate([{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:210,easing:'cubic-bezier(.22,1,.36,1)'});
 if((projectSectionChange||journalSectionChange)&&!motion.matches)byId(journalSectionChange?'journal-detail':'project-detail').querySelector('.cp-project-active-section')?.animate([{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:210,easing:'cubic-bezier(.22,1,.36,1)'});
 if(section==='explore')globe?.refreshLayout();
 requestAnimationFrame(()=>{
  if(applyVersion!==routeApplyVersion){resumeDockScroll?.();return;}
  window.scrollTo({top:scroll,behavior:'instant'});
  detailScroll.restore(columns);
  if(focus){
   const sectionTarget=profileSectionChange?(matchMedia('(max-width:840px)').matches?byId('profile-section-picker'):byId('profile-detail').querySelector('.cp-profile-sidebar-nav [aria-current]')):projectSectionChange?(matchMedia('(max-width:840px)').matches?byId('project-section-picker'):byId('project-detail').querySelector('.cp-project-sidebar-nav [aria-current]')):journalSectionChange?(matchMedia('(max-width:840px)').matches?byId('journal-section-picker'):byId('journal-detail').querySelector('.cp-project-sidebar-nav [aria-current]')):null;
   (sectionTarget||(section==='awards'?buttons.find(button=>button.dataset.section==='awards'):null)||byId(section==='explore'?'globe':route.entryId?(profileById.has(route.entryId)?'profile-title':section==='projects'?'project-title':section==='journal'?'journal-title':'detail-title'):'section-title')).focus({preventScroll:true});
  }
  if(profileSectionChange||projectSectionChange||journalSectionChange)detailScroll.centerActive();
  resumeDockScroll?.();
  moveIndicator();
 });
 announce(section==='awards'?t('awards'):`${t(section)} · ${scopeName()}`);
}
let scrollSaveTimer;
function scheduleScrollSave(){
 if(scrollSaveTimer)return;
 const url=location.href;scrollSaveTimer=setTimeout(()=>{scrollSaveTimer=null;if(location.href===url)rememberScroll();},120);
}
window.addEventListener('scroll',scheduleScrollSave,{passive:true});
document.addEventListener('scroll',event=>{if(detailScroll.didScroll(event.target)){scheduleScrollSave();dockSearch?.notifyContentScroll();}},{capture:true,passive:true});
window.addEventListener('popstate',()=>{if(dialog.open)dialog.close();campusMap.close();route=readRoute();applyRoute({scroll:history.state?.scroll||0,columns:history.state?.detailScroll,focus:true});});
function followRoute(event,next,options){if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate(next,options);}

let regionNames = new Intl.DisplayNames(locale, {type:'region'});
const dataControls = ['scope-picker','scope-world','scope-country','reset','zoom-in','zoom-out'];
dataControls.forEach(id=>{byId(id).disabled=true;});
const copy = {
 fr:{awards:'42 Awards',explore:'Explorer',projects:'Projets',people:'Profils',journal:'Le journal',world:'Le monde',hint:'{campuses} campus · {countries} pays',language:'Choisir une langue',themeDark:'Activer le thème sombre',themeLight:'Activer le thème clair',profile:'Mon espace',back:'Revenir au niveau précédent',reset:'Revenir au monde',zoomIn:'Zoomer',zoomOut:'Dézoomer',close:'Fermer',closeSheet:'Revenir au globe',sample:'Contenus de démonstration',prototype:'Exploration · 42 Horizon',scopeTitle:'Où veux-tu aller ?',countries:'Choisir un pays',campuses:'Choisir un campus',all:'Tous les campus',globeLabel:'Globe interactif. Glisse pour tourner, pince ou utilise la molette pour zoomer dans les limites du niveau actuel. Clique sur un pays, puis sur un campus pour descendre. Utilise le chemin géographique ou la flèche de retour pour remonter. Au clavier : flèches, plus et moins. Échap revient au niveau précédent.',marker:'Explorer',loading:'Le monde se prépare…',error:'Le globe n’a pas pu se charger. Recharge la page pour réessayer.',projectsIntro:'Des idées qui prennent forme, ensemble.',peopleIntro:'Les personnes derrière les idées. Étudiants et alumni, avant, pendant et après 42.',journalIntro:'La vie de la communauté, au fil des jours.',guestTitle:'Bienvenue sur Horizon',guestText:'Tu explores Horizon en visiteur. Cet aperçu permet de découvrir le globe et les rubriques, sans connexion à un compte.',aboutTitle:'Une nouvelle façon d’explorer',detailNote:'Exemple de contenu pour cette exploration.'},
 en:{awards:'42 Awards',explore:'Explore',projects:'Projects',people:'Profiles',journal:'Journal',world:'The world',hint:'{campuses} campuses · {countries} countries',language:'Choose a language',themeDark:'Switch to dark theme',themeLight:'Switch to light theme',profile:'My space',back:'Back to the previous level',reset:'Back to the world',zoomIn:'Zoom in',zoomOut:'Zoom out',close:'Close',closeSheet:'Back to the globe',sample:'Sample content',prototype:'Exploration · 42 Horizon',scopeTitle:'Where would you like to go?',countries:'Choose a country',campuses:'Choose a campus',all:'All campuses',globeLabel:'Interactive globe. Drag to rotate, pinch or use the wheel to zoom within the current level. Select a country, then a campus to go closer. Use the location path or back arrow to return to a higher level. Keyboard: arrows, plus and minus. Escape goes back one level.',marker:'Explore',loading:'Getting the world ready…',error:'The globe could not load. Refresh the page to try again.',projectsIntro:'Ideas taking shape, together.',peopleIntro:'The people behind the ideas. Students and alumni, before, during and after 42.',journalIntro:'Stories from our community, day by day.',guestTitle:'Welcome to Horizon',guestText:'You are exploring Horizon as a visitor. This preview lets you discover the globe and its sections without signing into an account.',aboutTitle:'A new way to explore',detailNote:'Sample content for this exploration.'},
 ar:{awards:'جوائز 42',explore:'استكشف',projects:'المشاريع',people:'الملفات الشخصية',journal:'المجلة',world:'العالم',hint:'{campuses} فرعًا · {countries} دولة',language:'اختر اللغة',themeDark:'تفعيل المظهر الداكن',themeLight:'تفعيل المظهر الفاتح',profile:'مساحتي',back:'العودة إلى المستوى السابق',reset:'العودة إلى العالم',zoomIn:'تكبير',zoomOut:'تصغير',close:'إغلاق',closeSheet:'العودة إلى الكرة الأرضية',sample:'محتوى توضيحي',prototype:'تصوّر أولي · 42 Horizon',scopeTitle:'إلى أين تريد الذهاب؟',countries:'اختر دولة',campuses:'اختر حرمًا',all:'جميع الفروع',globeLabel:'كرة أرضية تفاعلية. اسحب للتدوير واستخدم إصبعين أو عجلة الفأرة للتكبير ضمن حدود المستوى الحالي. اختر دولة ثم فرعًا للاقتراب. استخدم مسار الموقع أو سهم الرجوع للعودة إلى مستوى أعلى. استخدم الأسهم وعلامتي الجمع والطرح بلوحة المفاتيح. اضغط Escape للعودة إلى المستوى السابق.',marker:'استكشف',loading:'نجهّز العالم…',error:'تعذّر تحميل الكرة الأرضية. أعد تحميل الصفحة للمحاولة مجددًا.',projectsIntro:'أفكار نبنيها معًا.',peopleIntro:'الأشخاص وراء الأفكار. طلاب وخريجون، قبل 42 وخلالها وبعدها.',journalIntro:'حكايات المجتمع، يومًا بعد يوم.',guestTitle:'مرحبًا بك في Horizon',guestText:'أنت تتصفح Horizon كزائر. يتيح لك هذا التصوّر استكشاف العالم والأقسام دون تسجيل الدخول إلى حساب.',aboutTitle:'طريقة جديدة للاستكشاف',detailNote:'محتوى توضيحي لهذا التصوّر.'}
};
Object.assign(copy.fr, {
 randomCampus:'Visiter un campus au hasard', randomDestination:'Destination choisie : {campus}, {country}.',
 breadcrumb:'Chemin géographique', breadcrumbWorld:'Monde', choosePlace:'Choisir un pays ou un campus',
 countryHint:'Choisis un campus pour t’en approcher.', campusHint:'Explore les alentours du campus.',
 search:'Rechercher un campus ou un pays', searchPlaceholder:'Paris, Codam, Japon…', countryFilter:'Pays', allCountries:'Tous les pays',
 searchWithin:'Recherche dans {country}', searchEverywhere:'Recherche dans tous les pays', results:'{count} campus', noResults:'Aucun campus ne correspond à cette recherche.',
 emptyTitle:'Pas encore de contenu dans cet aperçu', emptyText:'Aucun contenu de démonstration n’a été ajouté pour ce périmètre du réseau.',
 networkText:'{count} campus référencés dans {countries} pays, d’après la source officielle consultée le {date}. Cet instantané n’indique pas si les admissions sont ouvertes.',
 networkSource:'Consulter la source officielle des campus', aboutSource:'Les repères viennent du réseau 42, avec des positions corrigées à partir de sources cartographiques et des adresses officielles. La précision des autres positions reste à vérifier. Carte continue : OpenStreetMap / OpenFreeMap ; rendu Horizon.',
 aboutDemo:'Les rubriques restent une démonstration : seuls Paris, Lyon, Tokyo, Rio et São Paulo disposent de contenus fictifs.', networkUnavailable:'Les données du réseau ne sont pas encore disponibles.'
});
Object.assign(copy.en, {
 randomCampus:'Visit a random campus', randomDestination:'Selected destination: {campus}, {country}.',
 breadcrumb:'Location path', breadcrumbWorld:'World', choosePlace:'Choose a country or campus',
 countryHint:'Choose a campus to explore up close.', campusHint:'Explore around the campus.',
 search:'Search for a campus or country', searchPlaceholder:'Paris, Codam, Japan…', countryFilter:'Country', allCountries:'All countries',
 searchWithin:'Searching in {country}', searchEverywhere:'Searching all countries', results:'{count} campuses', noResults:'No campuses match this search.',
 emptyTitle:'No content in this preview yet', emptyText:'No sample content has been added for this part of the network.',
 networkText:'{count} campuses listed in {countries} countries, based on the official source retrieved on {date}. This snapshot does not indicate whether admissions are open.',
 networkSource:'View the official campus source', aboutSource:'Markers come from the 42 network, with positions corrected using maps and official addresses. The accuracy of the other positions has yet to be checked. Continuous map: OpenStreetMap / OpenFreeMap; Horizon styling.',
 aboutDemo:'The sections remain a demonstration: only Paris, Lyon, Tokyo, Rio and São Paulo have fictional content.', networkUnavailable:'The network data is not available yet.'
});
Object.assign(copy.ar, {
 randomCampus:'زيارة فرع عشوائي', randomDestination:'الوجهة المختارة: {campus}، {country}.',
 breadcrumb:'مسار الموقع', breadcrumbWorld:'العالم', choosePlace:'اختر دولة أو فرعًا',
 countryHint:'اختر فرعًا لاستكشافه عن قرب.', campusHint:'استكشف محيط الفرع.',
 search:'ابحث عن فرع أو دولة', searchPlaceholder:'Paris، Codam، اليابان…', countryFilter:'الدولة', allCountries:'جميع الدول',
 searchWithin:'البحث في {country}', searchEverywhere:'البحث في جميع الدول', results:'عدد الفروع: {count}', noResults:'لا توجد فروع تطابق هذا البحث.',
 emptyTitle:'لا يوجد محتوى في هذا التصوّر بعد', emptyText:'لم يُضف محتوى توضيحي لهذا النطاق من الشبكة بعد.',
 networkText:'{count} فرعًا مُدرجًا في {countries} دولة، وفق المصدر الرسمي الذي جرت مراجعته في {date}. لا يبيّن هذا السجل ما إذا كان التسجيل مفتوحًا.',
 networkSource:'الاطلاع على المصدر الرسمي للفروع', aboutSource:'مصدر العلامات هو شبكة 42، مع تصحيح بعض المواقع باستخدام الخرائط والعناوين الرسمية. لم تُتحقق دقة المواقع الأخرى بعد. خريطة متصلة: OpenStreetMap / OpenFreeMap؛ بأسلوب Horizon.',
 aboutDemo:'الأقسام ما زالت توضيحية: يوجد محتوى خيالي فقط لفروع باريس وليون وطوكيو وريو وساو باولو.', networkUnavailable:'بيانات الشبكة غير متاحة بعد.'
});
const t = key => copy[locale][key];
const message = (key, values) => t(key).replace(/\{(\w+)\}/g, (_,name)=>String(values[name] ?? ''));
const countryName = id => { const country=countryById.get(id); return country ? regionNames.of(country.iso2) || country.name : id || t('world'); };
const scopeName = () => scope.campus ? campusById.get(scope.campus)?.name || scope.campusName || t('world') : scope.country ? countryName(scope.country) : t('world');
const scopeHint = () => scope.campus?t('campusHint'):scope.country?t('countryHint'):message('hint',{campuses:network?.campuses.length??58,countries:network?.countries.length??30});
function updateCampusStatus(){
 const current=scope.campus&&campusPreparation?.campusId===scope.campus?campusPreparation:null;
 const failed=Boolean(scope.campus&&(campusRenderError===scope.campus||current&&['error','partial'].includes(current.phase)));
 const pending=scope.campus&&(campusRendering||current&&['metadata','loading'].includes(current.phase));
 const text={fr:['Préparation des alentours…','Les alentours n’ont pas pu se charger.','Réessayer'],en:['Preparing the neighbourhood…','The neighbourhood could not load.','Try again'],ar:['نجهّز محيط الفرع…','تعذّر تحميل محيط الفرع.','إعادة المحاولة']}[locale];
 byId('globe-hint').textContent=failed?text[1]:pending?text[0]:scopeHint();
 byId('campus-retry').hidden=!failed;byId('campus-retry').textContent=text[2];
}
byId('campus-retry').addEventListener('click',()=>{
 if(!scope.campus)return;
 campusRenderError=null;updateCampusStatus();globe?.selectCampus(scope.campus,{retry:true});
 byId('globe').focus({preventScroll:true});
});
const place = (name, entry) => entry?.type==='country' ? countryName(entry.id) : name;
const searchText = text => String(text).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase(locale).trim();
const icon = name => `<svg aria-hidden="true"><use href="${location.href.split('#')[0]}#i-${name}"/></svg>`;

function moveIndicator() {
 // Read the compact mode chosen by the dock's own container query. The filter
 // must change at that exact moment, not at an unrelated viewport breakpoint.
 const compact=Boolean(getComputedStyle(buttons[0]).getPropertyValue('--dock-compact-item').trim());
 if(app.dataset.compactScope!==String(compact)){
  app.dataset.compactScope=String(compact);
  if(compact&&document.activeElement===byId('scope-country')&&app.dataset.reading!=='true')byId('scope-picker').focus({preventScroll:true});
  scopePopover?.position();dockNavigation.sync();
 }
 const current = buttons.find(b=>b.dataset.section===section);
 if (!current) return;
 indicator.style.width = `${current.offsetWidth}px`;
 indicator.style.height = `${current.offsetHeight}px`;
 // CSS centres the pill vertically without rounding fractional border metrics.
 indicator.style.transform = `translate(${current.offsetLeft}px,-50%)`;
}
function announce(text) { if(document.body.dataset.entry==='welcome')byId('announcement').textContent=text; }
function updateScope() {
 const active=document.activeElement;
 const name=scope.country?scopeName():t('breadcrumbWorld');
 byId('scope-bar').dataset.level=scope.level;
 byId('scope-path').setAttribute('aria-label',t('breadcrumb'));
 // World is the current label only; a campus keeps its useful country parent.
 byId('scope-world-item').hidden=true;
 byId('scope-country-item').hidden=!scope.country||!scope.campus;
 byId('scope-world-name').textContent=t('breadcrumbWorld');
 byId('scope-country-name').textContent=scope.country?countryName(scope.country):'';
 byId('scope-country').title=scope.country?countryName(scope.country):'';
 byId('scope-name').textContent=name;
 const context=scope.campus?[countryName(scope.country),name].join(' › '):name;
 byId('scope-reading-summary').textContent=({fr:'Contexte géographique : ',en:'Location context: ',ar:'السياق الجغرافي: '}[locale])+context;
 byId('scope-picker').title=name;
 byId('scope-picker').setAttribute('aria-label',`${name} · ${t('choosePlace')}`);
 // An ancestor becomes the current item after navigation; keep keyboard focus in the path.
 if(app.dataset.reading!=='true'&&(active===byId('scope-world')||(active===byId('scope-country')&&!scope.campus)))byId('scope-picker').focus({preventScroll:true});
 scopePopover?.position();
 dockNavigation.sync();
}
const editorialCopy={
 fr:{eyebrow:'Le réseau en action',read:'Découvrir',map:'Voir la carte',search:'Rechercher dans les contenus',placeholder:'Un sujet, une technologie…',count:'{count} contenus',back:'Retour à la liste',campus:'Explorer {campus}',noResults:'Aucun résultat',noResultsText:'Essaie un autre sujet ou élargis le périmètre géographique.'},
 en:{eyebrow:'The network in action',read:'Discover',map:'View the map',search:'Search content',placeholder:'A topic, a technology…',count:'{count} stories',back:'Back to the list',campus:'Explore {campus}',noResults:'No results',noResultsText:'Try another topic or broaden your location filter.'},
 ar:{eyebrow:'الشبكة تنبض بالحياة',read:'اكتشف',map:'عرض الخريطة',search:'البحث في المحتوى',placeholder:'موضوع أو تقنية…',count:'عدد المحتويات: {count}',back:'العودة إلى القائمة',campus:'استكشف {campus}',noResults:'لا توجد نتائج',noResultsText:'جرّب موضوعًا آخر أو وسّع النطاق الجغرافي.'}
};
const e=key=>editorialCopy[locale][key];
function relatedRoute(entry){
 return {...route,section:entry.section,entryId:entry.id,country:sampleCampus(entry.campus)?.country||null,campus:entry.campus,query:'',profileTab:'overview',profileProjects:[],projectTab:'overview',journalTab:'article'};
}
const relatedHref=entry=>routeURL(relatedRoute(entry));
function followRelated(event,entry){followRoute(event,relatedRoute(entry),{fromList:!route.entryId,fromDetail:Boolean(route.entryId)});}
function returnFromContent(){rememberScroll();const steps=profileById.has(route.entryId)?profileBackDistance(history.state):section==='projects'&&route.entryId?projectBackDistance(history.state):section==='journal'&&route.entryId?journalBackDistance(history.state):0;if(steps)history.go(-steps);else if(history.state?.fromList||history.state?.fromDetail)history.back();else navigate({entryId:null});}
function contentBackLabel(){
 const labels={fr:{projects:'Retour au projet',people:'Retour au profil',journal:'Retour à l’article'},en:{projects:'Back to the project',people:'Back to the profile',journal:'Back to the article'},ar:{projects:'العودة إلى المشروع',people:'العودة إلى الملف الشخصي',journal:'العودة إلى المقال'}};
 if(history.state?.fromDetail)return labels[locale][history.state.returnSection]||e('back');
 const lists={fr:{projects:'Retour aux projets',people:'Retour aux profils',journal:'Retour au journal'},en:{projects:'Back to projects',people:'Back to profiles',journal:'Back to the journal'},ar:{projects:'العودة إلى المشاريع',people:'العودة إلى الملفات الشخصية',journal:'العودة إلى المجلة'}};
 const origin=history.state?.fromList?history.state.returnSection:section;
 return lists[locale][origin]||e('back');
}
function contentCandidates(){
 const preferences=contentPreferences.snapshot();
 const scoped=discoveryEntries.filter(entry=>entry.section===section&&(!route.country||sampleCampus(entry.campus)?.country===route.country)&&(!route.campus||entry.campus===route.campus));
 return sortContentEntries(applyContentCategory(scoped,{section,project:preferences.project,status:preferences.status}),preferences);
}
function randomContextKey(){
 const preferences=contentPreferences.snapshot();
 const categories=section==='projects'?preferences.project:section==='people'?preferences.status:[];
 return JSON.stringify([section,route.country,route.campus,[...categories].sort(),preferences.favoritesOnly]);
}
const discoveryCopy={
 fr:{projects:'Découvrir un projet au hasard',people:'Découvrir un profil au hasard',journal:'Découvrir un article au hasard',empty:'Aucun contenu avec ces filtres',current:'Seul résultat déjà découvert',selected:'Découverte : '},
 en:{projects:'Discover a random project',people:'Discover a random profile',journal:'Discover a random article',empty:'No content with these filters',current:'Only result already discovered',selected:'Discovery: '},
 ar:{projects:'اكتشف مشروعًا عشوائيًا',people:'اكتشف ملفًا شخصيًا عشوائيًا',journal:'اكتشف مقالًا عشوائيًا',empty:'لا يوجد محتوى بهذه المرشحات',current:'اكتُشفت النتيجة الوحيدة بالفعل',selected:'اكتشاف: '}
};
function updateRandomDiscovery(){
 const button=byId('random-campus'),text=discoveryCopy[locale];
 if(section==='awards'){button.disabled=true;button.dataset.discoverySection=section;return;}
 let label=section==='explore'?t('randomCampus'):text[section];
 let available=Boolean(globe&&mapReady&&campuses.length);
 if(section!=='explore'){
  const candidates=contentCandidates();
  available=randomDiscovery.canPick(candidates,{key:randomContextKey(),currentId:route.entryId});
  if(!available)label+=' · '+text[candidates.length?'current':'empty'];
 }
 button.disabled=!entryOpen||!available;
 button.title=label;button.setAttribute('aria-label',label);
 button.dataset.discoverySection=section;
}
function renderContent({keepControlsOpen=false,keepProfileControlsOpen=false}={}) {
 const previousColumns=detailScroll.capture();
 if(!keepControlsOpen)contentControls.close();
 if(!keepProfileControlsOpen)profileProjectControls.close();
 profileProjectControls.refresh();
 contentControls.refresh();
 updateRandomDiscovery();
 if(section==='explore'||section==='awards'){detailScroll.sync();clearProfileDetail(byId('profile-detail'));clearProjectDetail(byId('project-detail'));clearJournalDetail(byId('journal-detail'));return;}
 const preferences=contentPreferences.snapshot(),controlsCopy=contentControlCopy[locale];
 byId('content-index').dataset.section=section;
 const selected=discoveryEntries.find(entry=>entry.id===route.entryId&&entry.section===section);
 const isProfile=selected?.kind==='profile',isProject=selected?.section==='projects',isJournal=selected?.section==='journal';
 if(!isProfile)clearProfileDetail(byId('profile-detail'));
 if(!isProject)clearProjectDetail(byId('project-detail'));
 if(!isJournal)clearJournalDetail(byId('journal-detail'));
 byId('content-index').hidden=Boolean(selected);byId('content-detail').hidden=!selected||isProfile||isProject||isJournal;byId('profile-detail').hidden=!isProfile;byId('project-detail').hidden=!isProject;byId('journal-detail').hidden=!isJournal;
 byId('content-sheet').setAttribute('aria-labelledby',selected?(isProfile?'profile-title':isProject?'project-title':isJournal?'journal-title':'detail-title'):'section-title');
 document.querySelector('.sample-note').textContent=section==='people'?{fr:'Profils et pseudos fictifs · portraits illustrés',en:'Fictional profiles and usernames · illustrated portraits',ar:'ملفات وأسماء مستخدمين خيالية · صور توضيحية'}[locale]:t('sample');
 const favoriteButton=(entry,compact=false)=>createFavoriteButton({
  entry,locale,compact,saved:contentPreferences.isFavorite(entry.id),
  onToggle(id){
   const saved=contentPreferences.toggleFavorite(id);
   renderContent();
   const replacement=[...byId('content-sheet').querySelectorAll('[data-favorite-id]')].find(button=>button.dataset.favoriteId===id&&!button.closest('[hidden]'));
   if(replacement&&!replacement.closest('[hidden]'))replacement.focus({preventScroll:true});
   else byId('content-sort-button').focus({preventScroll:true});
   announce(controlsCopy[saved?'savedNotice':'removedNotice']);
  },
 });
 const dateElement=entry=>{
  const time=document.createElement('time');time.className='cp-published';
  const date=publishedAt(entry);
  if(date){time.dateTime=date;time.textContent=new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00Z'));time.title=controlsCopy.dates;}
  return time;
 };
 if(!selected)detailScroll.sync();
 const syncColumns=tab=>detailScroll.sync({identity:selected.id,key:selected.id+'/'+tab,previous:previousColumns});
 if(isProfile){
  renderProfileDetail({container:byId('profile-detail'),profile:selected,locale,campusName:sampleCampus(selected.campus)?.name,getCampusName:id=>sampleCampus(id)?.name,
   entries:getProfileEntries(selected.id,discoveryEntries),journey:selected.journey,getEntryHref:relatedHref,onNavigate:followRelated,
   createFavoriteButton:favoriteButton,onExploreCampus:(_event,_profile,campusId)=>campusMap.open(campusId),onBack:returnFromContent,backLabel:contentBackLabel(),
   activeSection:route.profileTab,getSectionHref:key=>routeURL({...route,profileTab:key}),onSectionNavigate:changeProfileSection,
   projectControls:profileProjectControlsContainer,filteredProjects:applyContentCategory(getProfileEntries(selected.id,discoveryEntries),{section:'projects',project:route.profileProjects}),projectFilterActive:route.profileProjects.length>0,
   onResetProjects(){route.profileProjects=[];history.replaceState({...history.state},'',routeURL(route));renderContent();byId('profile-project-category-button').focus({preventScroll:true});}});
  syncColumns(route.profileTab);
  return;
 }
 if(isProject){
  renderProjectDetail({container:byId('project-detail'),entry:selected,locale,campusName:sampleCampus(selected.campus)?.name,authors:getAuthors(selected),
   activeSection:route.projectTab,getSectionHref:key=>routeURL({...route,projectTab:key}),onSectionNavigate:changeProjectSection,
   getAuthorHref:relatedHref,onAuthorNavigate:followRelated,createFavoriteButton:favoriteButton,dateElement:dateElement(selected),
   onExploreCampus:()=>campusMap.open(selected.campus),onBack:returnFromContent,backLabel:contentBackLabel()});
  syncColumns(isJournal?route.journalTab:route.projectTab);
  return;
 }
 if(isJournal){
  renderJournalDetail({container:byId('journal-detail'),entry:selected,locale,campusName:sampleCampus(selected.campus)?.name,authors:getAuthors(selected),
   activeSection:route.journalTab,getSectionHref:key=>routeURL({...route,journalTab:key}),onSectionNavigate:changeJournalSection,
   getAuthorHref:relatedHref,onAuthorNavigate:followRelated,createFavoriteButton:favoriteButton,dateElement:dateElement(selected),
   onExploreCampus:()=>campusMap.open(selected.campus),onBack:returnFromContent,backLabel:contentBackLabel()});
  syncColumns(isJournal?route.journalTab:route.projectTab);
  return;
 }
 if(selected){
  byId('content-back-label').textContent=contentBackLabel();
  byId('detail-meta').textContent=`${selected.eyebrow[locale]} · ${sampleCampus(selected.campus)?.name||selected.campus}`;
  byId('detail-title').textContent=selected.title[locale];
  byId('detail-summary').textContent=selected.summary[locale];
  byId('detail-authors')?.remove();
  const authorBlock=createAuthorByline({authors:getAuthors(selected),locale,getHref:relatedHref,onNavigate:followRelated,
   label:selected.section==='journal'?{fr:'Rédigé par',en:'Written by',ar:'بقلم'}[locale]:undefined});
  authorBlock.id='detail-authors';byId('detail-title').after(authorBlock);
  let actions=byId('detail-actions');
  if(!actions){actions=document.createElement('div');actions.id='detail-actions';actions.className='cp-detail-actions';byId('detail-summary').after(actions);}
  actions.replaceChildren(favoriteButton(selected),dateElement(selected));
  const cover=byId('detail-cover');cover.dataset.cover=selected.cover;cover.innerHTML=`<div class="cp-art">${coverArt(selected.cover)}</div>`;
  const body=byId('detail-body');body.replaceChildren();
  selected.body.forEach(part=>{const h=document.createElement('h2'),p=document.createElement('p');h.textContent=part.heading[locale];p.textContent=part.text[locale];body.append(h,p);});
  byId('detail-campus-label').textContent=e('campus').replace('{campus}',sampleCampus(selected.campus)?.name||selected.campus);
  return;
 }
 byId('section-title').textContent=t(section);
 byId('section-intro').textContent=t(`${section}Intro`);
 byId('content-eyebrow').textContent=e('eyebrow');
 const filtered=contentCandidates();
 const list=byId('content-list');list.replaceChildren();
 byId('content-count').textContent=section==='people'?({fr:filtered.length+' profil'+(filtered.length===1?'':'s'),en:filtered.length+' profile'+(filtered.length===1?'':'s'),ar:'عدد الملفات: '+filtered.length}[locale]):locale==='fr'?`${filtered.length} contenu${filtered.length===1?'':'s'}`:e('count').replace('{count}',filtered.length);
 if(!filtered.length){
  const empty=document.createElement('div'),h=document.createElement('h2'),p=document.createElement('p');empty.className='content-empty';
  const category=contentCategoryFilter(),categoryActive=category&&category.values.length>0;
  h.textContent=categoryActive?{fr:'Aucun résultat avec ces filtres',en:'No results with these filters',ar:'لا توجد نتائج لهذه المرشحات'}[locale]:preferences.favoritesOnly?controlsCopy.emptyTitle:t('emptyTitle');
  p.textContent=categoryActive?{fr:'Aucun contenu de démonstration ne correspond à cette combinaison. Essaie un autre choix ou élargis le pays ou le campus.',en:'No sample content matches this combination. Try another choice or broaden the country or campus.',ar:'لا يطابق أي محتوى توضيحي هذا الجمع من المرشحات. جرّب اختيارًا آخر أو وسّع نطاق الدولة أو الحرم.'}[locale]:preferences.favoritesOnly?controlsCopy.emptyText:t('emptyText');empty.append(h,p);
  if(categoryActive){
   const resetCategory=document.createElement('button');resetCategory.type='button';resetCategory.className='cp-show-all';resetCategory.textContent=category.options.find(option=>option.value==='all').label;
   resetCategory.addEventListener('click',()=>{contentPreferences.setPreference(section==='projects'?'project':'status',[]);updateContentView();renderContent();byId('content-category-button').focus({preventScroll:true});});empty.append(resetCategory);
  }
  if(preferences.favoritesOnly){
   const reset=document.createElement('button');reset.type='button';reset.className='cp-show-all';reset.textContent=controlsCopy.showAll;
   reset.addEventListener('click',()=>{contentPreferences.setPreference('favoritesOnly',false);updateContentView();renderContent();byId('content-sort-button').focus({preventScroll:true});});empty.append(reset);
  }
  list.append(empty);
 }
 for(const entry of filtered){
  const next={...route,entryId:entry.id};
  if(entry.kind==='profile'){
   const card=renderProfileCard({profile:entry,locale,campusName:sampleCampus(entry.campus)?.name,href:routeURL(next),
    onNavigate:event=>followRoute(event,next,{fromList:true})});
   list.append(card);continue;
  }
  const card=document.createElement('article');card.className='cp-card';card.dataset.cover=entry.cover;
  const makeEntryLink=className=>{const link=document.createElement('a');link.className=className;link.href=new URL(routeURL(next),location.href).href;link.addEventListener('click',event=>followRoute(event,next,{fromList:true}));return link;};
  const coverLink=makeEntryLink('cp-card-cover-link');coverLink.tabIndex=-1;coverLink.setAttribute('aria-hidden','true');
  coverLink.innerHTML='<div class="cp-cover"><div class="cp-art">'+coverArt(entry.cover)+'</div></div>';
  const body=document.createElement('div');body.className='cp-card-copy';
  const meta=document.createElement('p');meta.className='cp-meta';meta.textContent=entry.eyebrow[locale]+' · '+(sampleCampus(entry.campus)?.name||entry.campus);meta.append(dateElement(entry));
  const heading=document.createElement('h2'),title=makeEntryLink('cp-card-title-link');title.textContent=entry.title[locale];heading.append(title);
  const summary=document.createElement('p');summary.className='cp-summary';summary.textContent=entry.summary[locale];
  const authors=createAuthorByline({authors:getAuthors(entry),locale,getHref:relatedHref,onNavigate:followRelated,compact:true,
   label:entry.section==='journal'?{fr:'Rédigé par',en:'Written by',ar:'بقلم'}[locale]:undefined});
  body.append(meta,heading,authors,summary);
  if(entry.section!=='projects'){const read=makeEntryLink('cp-card-link');read.tabIndex=-1;read.setAttribute('aria-hidden','true');read.textContent=e('read');read.insertAdjacentHTML('beforeend',icon('arrow'));body.append(read);}
  card.append(coverLink,body,favoriteButton(entry,true));list.append(card);
 }
}
function setSection(next) {if(next!==section)navigate({section:next,entryId:null,query:''});}
buttons.forEach(button=>button.addEventListener('click',()=>setSection(button.dataset.section)));
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();setSection('explore');});
byId('content-back').addEventListener('click',returnFromContent);
byId('detail-campus').addEventListener('click',event=>{
 const entry=discoveryEntries.find(item=>item.id===route.entryId);
 if(entry)campusMap.open(entry.campus);
});


const dialog=byId('dialog');
function openDialog(title,render,kind=''){
 scopePopover?.close();
 dialog.dataset.kind=kind;byId('dialog-title').textContent=title;byId('dialog-content').replaceChildren();render(byId('dialog-content'));dialog.showModal();dialog.scrollTop=0;
}
const closeDialog=()=>dialog.close();
byId('close-dialog').addEventListener('click',closeDialog);
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeDialog();}});
function option(container,label,action,{active=false,detail=''}={}){
 const button=document.createElement('button');button.type='button';button.className='dialog-option';
 const text=document.createElement('span');text.dir='auto';text.textContent=label;button.append(text);
 if(detail){const small=document.createElement('small');small.textContent=detail;button.append(small);}
 if(active)button.setAttribute('aria-pressed','true');button.addEventListener('click',action);container.append(button);return button;
}
const campusMap=createCampusMapDialog({getGlobe:()=>globe,prepare:prepareGlobe,getLocale:()=>locale,getCampus:sampleCampus,countryName,
 onRestore(view){if(view)applyGlobeView(view);updateScope();updateCampusStatus();}
});
const languageTrigger=byId('language'),languageMenu=byId('language-menu'),languageSwitcher=byId('language-switcher');
const languageOptions=[...languageMenu.querySelectorAll('[data-locale]')];
function highlightLanguage(button){
 const index=languageOptions.indexOf(button);
 if(index>=0)languageMenu.style.setProperty('--language-highlight-y',`${6+index*46}px`);
}
function closeLanguageMenu(restoreFocus=false){
 if(languageMenu.hidden)return;
 languageMenu.hidden=true;languageTrigger.setAttribute('aria-expanded','false');
 if(restoreFocus)languageTrigger.focus({preventScroll:true});
}
function openLanguageMenu(index=languageOptions.findIndex(button=>button.dataset.locale===locale)){
 highlightLanguage(languageOptions[Math.max(0,index)]);
 languageMenu.hidden=false;languageTrigger.setAttribute('aria-expanded','true');
 languageOptions[Math.max(0,index)].focus({preventScroll:true});
}
languageTrigger.addEventListener('click',()=>languageMenu.hidden?openLanguageMenu():closeLanguageMenu(true));
languageTrigger.addEventListener('keydown',event=>{
 if(!['ArrowDown','ArrowUp'].includes(event.key))return;
 event.preventDefault();openLanguageMenu(event.key==='ArrowUp'?languageOptions.length-1:0);
});
languageOptions.forEach(button=>button.addEventListener('click',()=>{
 locale=button.dataset.locale;localize();closeLanguageMenu(true);
}));
languageOptions.forEach(button=>button.addEventListener('pointerenter',()=>highlightLanguage(button)));
languageMenu.addEventListener('focusin',event=>highlightLanguage(event.target));
languageMenu.addEventListener('pointerleave',()=>highlightLanguage(languageOptions.includes(document.activeElement)?document.activeElement:languageOptions.find(button=>button.dataset.locale===locale)));
languageMenu.addEventListener('keydown',event=>{
 const index=languageOptions.indexOf(document.activeElement);
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeLanguageMenu(true);return;}
 if(event.key==='Tab'){closeLanguageMenu(true);return;}
 const destination={ArrowDown:(index+1)%languageOptions.length,ArrowUp:(index+languageOptions.length-1)%languageOptions.length,Home:0,End:languageOptions.length-1}[event.key];
 if(destination!==undefined){event.preventDefault();languageOptions[destination].focus({preventScroll:true});}
});
document.addEventListener('pointerdown',event=>{if(!languageSwitcher.contains(event.target))closeLanguageMenu();});
languageSwitcher.addEventListener('focusout',event=>{if(!languageSwitcher.contains(event.relatedTarget))closeLanguageMenu();});
let scopeSelectors;
scopePopover=mountScopePopover({trigger:byId('scope-picker'),panel:byId('scope-popover'),closeButton:byId('close-scope-popover'),
 onOpen(){
  if(app.dataset.reading==='true'||!globe||!network)return false;
  closeLanguageMenu();
  byId('scope-popover-title').textContent=t('scopeTitle');
  scopeSelectors?.destroy();
  const container=byId('scope-popover-content');container.replaceChildren();
  scopeSelectors=mountScopeSelectors({container,locale,countries,campuses,scope,countryName,
   onSelect(next){
    if(app.dataset.reading==='true')return;
    if(next.campus)globe.selectCampus(next.campus);
    else if(next.country)globe.selectCountry(next.country);
    else globe.reset();
   },
  });
  return scopeSelectors.countrySelect;
 },
});
byId('profile').addEventListener('click',()=>{
 const member={fr:['Connexion simulée','Tu as suivi le parcours connecté de cette maquette. Aucun compte réel n’a été connecté.'],en:['Simulated sign-in','You followed the signed-in preview. No real account was connected.'],ar:['تسجيل دخول تجريبي','اتبعت مسار تسجيل الدخول في هذا النموذج. لم يتم ربط أي حساب حقيقي.']}[locale];
 openDialog(identity==='member'?member[0]:t('guestTitle'),container=>{const p=document.createElement('p');p.className='dialog-text';p.textContent=identity==='member'?member[1]:t('guestText');container.append(p);});
});
byId('about').addEventListener('click',()=>openDialog(t('aboutTitle'),container=>{
 const paragraph=text=>{const p=document.createElement('p');p.className='dialog-text';p.textContent=text;container.append(p);};
 if(network){
  const date=new Date(`${network.retrievedAt.slice(0,10)}T12:00:00Z`);
  paragraph(message('networkText',{count:campuses.length,countries:countries.length,date:new Intl.DateTimeFormat(locale,{dateStyle:'long'}).format(date)}));
  const source=document.createElement('a');source.href=network.sourceUrl;source.target='_blank';source.rel='noreferrer';source.className='network-source';source.textContent=t('networkSource');container.append(source);
 }else paragraph(t('networkUnavailable'));
 paragraph(t('aboutSource'));paragraph(t('aboutDemo'));
}));
byId('scope-back').addEventListener('click',()=>{if(app.dataset.reading!=='true')globe?.back();});
byId('scope-world').addEventListener('click',()=>{if(app.dataset.reading!=='true')globe?.reset();});
byId('scope-country').addEventListener('click',()=>{if(app.dataset.reading!=='true'&&scope.country)globe?.selectCountry(scope.country);});
byId('reset').addEventListener('click',()=>globe?.reset());
byId('zoom-in').addEventListener('click',()=>globe?.zoomBy(1.25));
byId('zoom-out').addEventListener('click',()=>globe?.zoomBy(.8));
byId('random-campus').addEventListener('click',()=>{
 if(byId('random-campus').disabled)return;
 if(section==='explore'){
  // Preserve the prepared destination and the existing campus flight.
  const campus=globe?.visitRandomCampus();if(!campus)return;
  announce(message('randomDestination',{campus:campus.name,country:countryName(campus.country)}));
  return;
 }
 const entry=randomDiscovery.pick(contentCandidates(),{key:randomContextKey(),currentId:route.entryId});
 if(!entry){updateRandomDiscovery();return;}
 // Successive discoveries replace the detail, keeping its original return
 // destination and the list's remembered reading position intact.
 const origin=history.state||{};
 const options=route.entryId?{replace:true,fromList:origin.fromList,fromDetail:origin.fromDetail,returnSection:origin.returnSection||section,profileDepth:origin.profileDepth||0,projectDepth:origin.projectDepth||0,journalDepth:origin.journalDepth||0}:{fromList:true};
 navigate({entryId:entry.id},options);
 announce(discoveryCopy[locale].selected+entry.title[locale]);
});
byId('theme').addEventListener('click',()=>{
 dark=!dark;document.documentElement.dataset.theme=dark?'dark':'light';byId('theme').setAttribute('aria-pressed',String(dark));
 byId('theme').querySelector('use').setAttribute('href',dark?'#i-sun':'#i-moon');
 byId('theme').setAttribute('aria-label',t(dark?'themeLight':'themeDark'));globe?.setTheme(dark);entrance?.refresh();
});
function localize(){
 regionNames=new Intl.DisplayNames(locale,{type:'region'});
 byId('loading').textContent=t(loadFailed?'error':'loading');
 document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-copy]').forEach(element=>{element.textContent=t(element.dataset.copy);});
 byId('language').textContent={fr:'FR',en:'EN',ar:'ع'}[locale];
 languageMenu.setAttribute('aria-label',t('language'));
 languageOptions.forEach(button=>button.setAttribute('aria-checked',String(button.dataset.locale===locale)));
 const labels={language:'language',profile:'profile','scope-back':'back',reset:'reset','zoom-in':'zoomIn','zoom-out':'zoomOut','close-dialog':'close','close-scope-popover':'close'};
 for(const [id,key] of Object.entries(labels))byId(id).setAttribute('aria-label',t(key));
 byId('theme').setAttribute('aria-label',t(dark?'themeLight':'themeDark'));
 byId('globe').setAttribute('aria-label',t('globeLabel'));byId('globe-hint').textContent=scopeHint();
 nav.setAttribute('aria-label',{fr:'Navigation principale',en:'Main navigation',ar:'التنقل الرئيسي'}[locale]);
 updateContentView();dockSearch?.localize();entrance?.refresh();updateScope();updateCampusStatus();renderContent();globe?.refreshLabels();globe?.refreshLayout();requestAnimationFrame(moveIndicator);announce(section==='awards'?t('awards'):`${t(section)} · ${scopeName()}`);
}
dockSearch=mountDockSearch({nav,getLocale:()=>locale,
 search:(query,{offset=0,limit=8}={})=>searchDockData({query,locale,...searchCatalog,entries:discoveryEntries,entryAuthors,offset,limit}),
 onSelect(result){
  navigate({section:result.section,entryId:result.entryId,country:result.countryId,campus:result.campusId,query:''});
 },onLayout:moveIndicator
});
const discoveryButton=byId('random-campus');
discoveryButton.classList.add('dock-random-toggle');
nav.parentElement.dataset.hasDiscovery='true';
nav.parentElement.append(discoveryButton);
new ResizeObserver(moveIndicator).observe(nav);
document.fonts.ready.then(moveIndicator);
section=entryOpen?route.section:'explore';localize();
history.replaceState({cp:true,scroll:0},'',routeURL(route));applyRoute();

const scripts=new Map();
function loadScript(url){
 if(scripts.has(url))return scripts.get(url);
 const promise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=url;script.async=true;
  const timer=setTimeout(()=>{script.remove();scripts.delete(url);reject(new Error('Map library timed out'));},20000);
  script.onload=()=>{clearTimeout(timer);resolve();};
  script.onerror=()=>{clearTimeout(timer);scripts.delete(url);script.remove();reject(new Error('Map library unavailable'));};
  document.head.append(script);
 });scripts.set(url,promise);return promise;
}
const json=async url=>{const response=await fetch(url);if(!response.ok)throw new Error(`Unable to load ${url}: ${response.status}`);return response.json();};
// The search catalogue becomes available independently of the WebGL preparation.
const networkData=json('./archive/pre-campus-logo-sheet-20261008/runtime/campuses.json').then(dataset=>{searchCatalog=dataset;dockSearch.refresh();return dataset;});
networkData.catch(()=>{});
function applyGlobeView({canBack,canZoomIn=false,canZoomOut=false}){
 const back=byId('scope-back');const restoreFocus=!canBack&&document.activeElement===back;
 back.disabled=!canBack;byId('zoom-in').disabled=!canZoomIn;byId('zoom-out').disabled=!canZoomOut;
 if(restoreFocus&&app.dataset.reading!=='true')byId('scope-picker').focus({preventScroll:true});
}
async function initializeGlobe(){
 loadFailed=false;
 const [{createWelcomeGlobe},world,dataset,corrections,websites,websiteLocales,profiles]=await Promise.all([
  import('../../../site/integrated-globe.mjs?v=32'),geography.load(),networkData,json('./archive/pre-campus-logo-sheet-20261008/runtime/campus-location-overrides.json'),json('./archive/pre-campus-logo-sheet-20261008/runtime/campus-websites.json?v=1').catch(()=>({campuses:{}})),json('./archive/pre-campus-logo-sheet-20261008/runtime/campus-website-locales.json?v=1').catch(()=>({campuses:{}})),json('./archive/pre-campus-logo-sheet-20261008/runtime/campus-profiles.json?v=1').catch(()=>({campuses:{}})),
  Promise.all(['../map-data/d3.min.js','vendor/maplibre-gl.js'].map(loadScript)),
 ]);
 const locationOverrides=new Map(corrections.map(correction=>[correction.campusId,correction]));
 network=dataset;countries=network.countries;
 campuses=network.campuses.map(campus=>{
  const correction=locationOverrides.get(campus.id);
  const site=websites.campuses[campus.id];
  return {...campus,...(correction?{coordinates:correction.coordinates,locationSource:{url:correction.sourceUrl,precision:correction.precision}}:{}),...(site?.kind==='campus-site'?{websiteUrl:site.url}:{}),websiteLocales:websiteLocales.campuses[campus.id],profile:profiles.campuses?.[campus.id]||{}};
 });
 campuses.forEach(campus=>campusById.set(campus.id,campus));countries.forEach(country=>countryById.set(country.id,country));
 let readyResolve,readyReject;
 const ready=new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;});
 const timer=setTimeout(()=>readyReject(new Error('Map preparation timed out')),45000);
 try {
  globe=createWelcomeGlobe({container:byId('globe'),world,campuses,countries,
   onCampusDetails(campus){openDialog({fr:'Le campus',en:'Campus',ar:'الفرع'}[locale],container=>mountCampusDetails({container,campus,countryName,locale,profile:campus.profile}),'campus');},
   formatPlace:place,markerLabel:entry=>`${t('marker')} · ${place(entry.name,entry)}`,
   onScopeChange(next){
    if(campusMap.ownsMap)return;
    if(!next.campus||next.campus!==scope.campus){campusRenderError=null;campusRendering=false;}
    scope=next;
    if(entryOpen&&mapReady&&!applyingRoute&&(route.country!==next.country||route.campus!==next.campus)){
     const resumeDockScroll=dockSearch?.suspendDocumentScroll();
     rememberScroll();route={...route,country:next.country,campus:next.campus,entryId:null};
     history.pushState({cp:true,scroll:0},'',routeURL(route));
     // A new location returns to the list, without leaving its old reading
     // offset behind or taking focus away from the two open selectors.
     const destination=location.href;
     requestAnimationFrame(()=>{
      if(location.href===destination)window.scrollTo({top:0,behavior:'instant'});
      resumeDockScroll?.();
     });
    }
    updateScope();renderContent();updateCampusStatus();announce(section==='awards'?t('awards'):`${t(section)} · ${scopeName()}`);
   },
   onCampusLoad(state){if(campusMap.ownsMap)return;campusPreparation=state;updateCampusStatus();},
   onRandomCampusLoad(state){
    const button=byId('random-campus');button.dataset.nextCampus=state.nextCampusId??'';
    button.dataset.preloadPhase=state.phase;button.dataset.preloadReady=String(Boolean(state.ready));
   },
   onStatus(status){
    if(campusMap.ownsMap){campusMap.updateStatus(status);return;}
    if(scope.campus){campusRendering=status==='loading';updateCampusStatus();}
    if(document.body.dataset.entry==='welcome'&&scope.campus&&(status==='error'||status==='loading')){
     // The disk can be cached while a viewport tile or glyph still failed.
     // Only a deliberate new attempt clears that independent rendering error.
     campusRenderError=status==='error'?scope.campus:null;updateCampusStatus();return;
    }
    byId('loading').hidden=status==='ready';byId('loading').textContent=t(status==='error'?'error':'loading');
    if(status==='ready')readyResolve();else if(status==='error')readyReject(new Error('Map preparation failed'));
   },
   onViewChange(view){if(campusMap.ownsMap)campusMap.updateView(view);else{applyGlobeView(view);dockNavigation.sync();}}
  });
  globe.setTheme(dark);byId('globe').setAttribute('aria-label',t('globeLabel'));
  await ready;
  mapReady=true;syncMap();history.replaceState({...history.state},'',routeURL(route));
  dataControls.filter(id=>!id.startsWith('zoom-')).forEach(id=>{byId(id).disabled=false;});updateScope();renderContent();
  trace({phase:'ready',readyAt:performance.now(),preparedDuring:document.body.dataset.entry});
 }finally{clearTimeout(timer);}
}
function prepareGlobe(){
 if(preparation)return preparation;
 preparation=initializeGlobe().catch(error=>{
  globe?.destroy();globe=null;loadFailed=true;preparation=null;
  trace({phase:'error',message:error.message});byId('loading').textContent=t('error');renderContent();throw error;
 });
 return preparation;
}
if(hasEntrance){
 entrance=mountEntrance({getLocale:()=>locale,openDialog,closeDialog,prepare:prepareGlobe,getGlobeGeometry:()=>globe?.getWorldScreenGeometry?.(),
  onOpen(mode){
   identity=mode;entryOpen=true;globe?.refreshLayout({animate:false});
   trace({openedAt:performance.now(),identity:mode});
   // Restore a direct content/campus link only after the world reveal.
   applyRoute({focus:route.section!=='explore'});
  },
  onEvent(event){trace({...event,eventAt:performance.now()});if(event.decoded)byId('announcement').textContent=event.decoded;}
 });
 // The visible scan and the world preparation still run independently.
 requestAnimationFrame(()=>setTimeout(()=>{prepareGlobe().catch(()=>{});},0));
}else{
 // The companion review page remains a shortcut into the same content pages.
 prepareGlobe().catch(()=>{});
}
