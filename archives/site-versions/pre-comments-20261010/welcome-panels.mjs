import {mountCampusDetails} from './campus-details.mjs?v=2';
import {mountEntrance} from './entrance.mjs?v=visible-scan-5';
import {createGeographyLoader} from './geography-loader.mjs';
import {mountScopeSelectors} from './scope-selectors.mjs?v=1';

const byId = id => document.getElementById(id);
const app = byId('app');
const nav = byId('main-nav');
const indicator = nav.querySelector('.nav-indicator');
const buttons = [...nav.querySelectorAll('button')];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let locale = 'fr', section = 'explore', dark = false, globe, sheetAnimation;
let scope = {level:'world',country:null,campus:null};
let campusPreparation=null,campusRenderError=null,campusRendering=false;
let network = null, campuses = [], countries = [], loadFailed = false, entrance, preparation=null, identity='visitor';
const preloadTrace={startedAt:null,attempts:0,phase:'scheduled'};
const diagnostics=new URLSearchParams(location.search).get('perf')==='1';
const traceOutput=diagnostics?document.createElement('pre'):null;
if(traceOutput){traceOutput.id='entry-preload-state';traceOutput.className='entry-diagnostics';document.body.append(traceOutput);}
function trace(update){Object.assign(preloadTrace,update);document.getElementById('entrance').dataset.preload=preloadTrace.phase;if(traceOutput)traceOutput.textContent=JSON.stringify(preloadTrace,null,2);}
const geography=createGeographyLoader({
 workerFactory:()=>new Worker(new URL('./geography-worker.mjs',import.meta.url),{type:'module'}),
 url:new URL('./geography/world-countries.topo.json.gz?v=ne5.1.1-1',import.meta.url).href,
 rawUrl:new URL('./geography/world-countries.topo.json?v=ne5.1.1-1',import.meta.url).href,
 onState(state){if(state.phase==='downloading')trace({startedAt:performance.now(),attempts:preloadTrace.attempts+1});trace(state);},
});
const campusById = new Map(), countryById = new Map();
let regionNames = new Intl.DisplayNames(locale, {type:'region'});
const dataControls = ['scope-picker','scope-world','scope-country','reset','zoom-in','zoom-out','random-campus'];
dataControls.forEach(id=>{byId(id).disabled=true;});
const copy = {
 fr:{explore:'Explorer',projects:'Projets',people:'Parcours',journal:'Le journal',world:'Le monde',hint:'Fais tourner, puis choisis un pays.',language:'Choisir une langue',themeDark:'Activer le thème sombre',themeLight:'Activer le thème clair',profile:'Mon espace',back:'Revenir au niveau précédent',reset:'Revenir au monde',zoomIn:'Zoomer',zoomOut:'Dézoomer',close:'Fermer',closeSheet:'Revenir au globe',sample:'Contenus de démonstration',prototype:'Exploration · 42 Horizon',scopeTitle:'Où veux-tu aller ?',countries:'Choisir un pays',campuses:'Choisir un campus',all:'Tous les campus',globeLabel:'Globe interactif. Glisse pour tourner, pince ou utilise la molette pour zoomer dans les limites du niveau actuel. Clique sur un pays, puis sur un campus pour descendre. Utilise le chemin géographique ou la flèche de retour pour remonter. Au clavier : flèches, plus et moins. Échap revient au niveau précédent.',marker:'Explorer',loading:'Le monde se prépare…',error:'Le globe n’a pas pu se charger. Recharge la page pour réessayer.',projectsIntro:'Des idées qui prennent forme, ensemble.',peopleIntro:'Chaque parcours commence quelque part.',journalIntro:'La vie de la communauté, au fil des jours.',guestTitle:'Bienvenue sur Horizon',guestText:'Tu explores Horizon en visiteur. Cet aperçu permet de découvrir le globe et les rubriques, sans connexion à un compte.',aboutTitle:'Une nouvelle façon d’explorer',detailNote:'Exemple de contenu pour cette exploration.'},
 en:{explore:'Explore',projects:'Projects',people:'Journeys',journal:'Journal',world:'The world',hint:'Spin the world, then choose a country.',language:'Choose a language',themeDark:'Switch to dark theme',themeLight:'Switch to light theme',profile:'My space',back:'Back to the previous level',reset:'Back to the world',zoomIn:'Zoom in',zoomOut:'Zoom out',close:'Close',closeSheet:'Back to the globe',sample:'Sample content',prototype:'Exploration · 42 Horizon',scopeTitle:'Where would you like to go?',countries:'Choose a country',campuses:'Choose a campus',all:'All campuses',globeLabel:'Interactive globe. Drag to rotate, pinch or use the wheel to zoom within the current level. Select a country, then a campus to go closer. Use the location path or back arrow to return to a higher level. Keyboard: arrows, plus and minus. Escape goes back one level.',marker:'Explore',loading:'Getting the world ready…',error:'The globe could not load. Refresh the page to try again.',projectsIntro:'Ideas taking shape, together.',peopleIntro:'Every journey starts somewhere.',journalIntro:'Stories from our community, day by day.',guestTitle:'Welcome to Horizon',guestText:'You are exploring Horizon as a visitor. This preview lets you discover the globe and its sections without signing into an account.',aboutTitle:'A new way to explore',detailNote:'Sample content for this exploration.'},
 ar:{explore:'استكشف',projects:'المشاريع',people:'المسارات',journal:'المجلة',world:'العالم',hint:'أدر العالم، ثم اختر دولة.',language:'اختر اللغة',themeDark:'تفعيل المظهر الداكن',themeLight:'تفعيل المظهر الفاتح',profile:'مساحتي',back:'العودة إلى المستوى السابق',reset:'العودة إلى العالم',zoomIn:'تكبير',zoomOut:'تصغير',close:'إغلاق',closeSheet:'العودة إلى الكرة الأرضية',sample:'محتوى توضيحي',prototype:'تصوّر أولي · 42 Horizon',scopeTitle:'إلى أين تريد الذهاب؟',countries:'اختر دولة',campuses:'اختر حرمًا',all:'جميع الفروع',globeLabel:'كرة أرضية تفاعلية. اسحب للتدوير واستخدم إصبعين أو عجلة الفأرة للتكبير ضمن حدود المستوى الحالي. اختر دولة ثم فرعًا للاقتراب. استخدم مسار الموقع أو سهم الرجوع للعودة إلى مستوى أعلى. استخدم الأسهم وعلامتي الجمع والطرح بلوحة المفاتيح. اضغط Escape للعودة إلى المستوى السابق.',marker:'استكشف',loading:'نجهّز العالم…',error:'تعذّر تحميل الكرة الأرضية. أعد تحميل الصفحة للمحاولة مجددًا.',projectsIntro:'أفكار نبنيها معًا.',peopleIntro:'لكل رحلة نقطة بداية.',journalIntro:'حكايات المجتمع، يومًا بعد يوم.',guestTitle:'مرحبًا بك في Horizon',guestText:'أنت تتصفح Horizon كزائر. يتيح لك هذا التصوّر استكشاف العالم والأقسام دون تسجيل الدخول إلى حساب.',aboutTitle:'طريقة جديدة للاستكشاف',detailNote:'محتوى توضيحي لهذا التصوّر.'}
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
// The same illustrative subjects as the earlier globe prototype; no live data.
const records = {
 projects:[['paris',['Un moteur 3D fait maison','A home-built 3D engine','محرك ثلاثي الأبعاد من الصفر']],['lyon',['Le jardin connecté','The connected garden','الحديقة المتصلة']],['tokyo',['La ville en sons','The sounds of the city','أصوات المدينة']],['rio',['Une bibliothèque ouverte','An open library','مكتبة مفتوحة']],['sao',['Apprendre ensemble','Learning together','نتعلم معًا']]],
 people:[['paris',['Camille · Du premier code au premier emploi','Camille · From first code to first job','كاميل · من أول برنامج إلى أول وظيفة']],['lyon',['Samir · Apprendre en construisant','Samir · Learning by building','سمير · التعلم من خلال البناء']],['tokyo',['Aki · Quand le code devient création','Aki · When code becomes art','آكي · حين يصبح الكود إبداعًا']],['rio',['Lia · Lancer son premier projet','Lia · Launching a first project','ليا · إطلاق أول مشروع']],['sao',['Alex · Transmettre à son tour','Alex · Sharing what we learn','أليكس · مشاركة المعرفة']]],
 journal:[['paris',['Le déclic derrière le premier moteur 3D','The spark behind a first 3D engine','الفكرة وراء أول محرك ثلاثي الأبعاد']],['lyon',['Quand un projet rejoint une association','When a project meets a community','حين يخدم المشروع المجتمع']],['tokyo',['Créer une installation interactive','Creating an interactive installation','إنشاء عمل تفاعلي']],['rio',['Une bibliothèque portée par ses lecteurs','A library driven by its readers','مكتبة يبنيها قرّاؤها']],['sao',['Apprendre ensemble, après 42 aussi','Learning together, beyond 42','التعلم معًا، حتى بعد 42']]]
};
const t = key => copy[locale][key];
const message = (key, values) => t(key).replace(/\{(\w+)\}/g, (_,name)=>String(values[name] ?? ''));
const countryName = id => { const country=countryById.get(id); return country ? regionNames.of(country.iso2) || country.name : id || t('world'); };
const scopeName = () => scope.campus ? campusById.get(scope.campus)?.name || scope.campusName || t('world') : scope.country ? countryName(scope.country) : t('world');
const scopeHint = () => t(scope.campus?'campusHint':scope.country?'countryHint':'hint');
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
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;

function moveIndicator() {
 const current = buttons.find(b=>b.dataset.section===section);
 if (!current) return;
 indicator.style.width = `${current.offsetWidth}px`;
 indicator.style.height = `${current.offsetHeight}px`;
 indicator.style.transform = `translate(${current.offsetLeft}px,${current.offsetTop}px)`;
}
function announce(text) { if(document.body.dataset.entry==='welcome')byId('announcement').textContent=text; }
function updateScope() {
 const active=document.activeElement;
 const name=scope.country?scopeName():t('breadcrumbWorld');
 byId('scope-bar').dataset.level=scope.level;
 byId('scope-path').setAttribute('aria-label',t('breadcrumb'));
 byId('scope-world-item').hidden=!scope.country;
 byId('scope-country-item').hidden=!scope.country||!scope.campus;
 byId('scope-world-name').textContent=t('breadcrumbWorld');
 byId('scope-country-name').textContent=scope.country?countryName(scope.country):'';
 byId('scope-country').title=scope.country?countryName(scope.country):'';
 byId('scope-name').textContent=name;
 byId('scope-picker').title=name;
 byId('scope-picker').setAttribute('aria-label',`${name} · ${t('choosePlace')}`);
 // An ancestor becomes the current item after navigation; keep keyboard focus in the path.
 if((active===byId('scope-world')&&!scope.country)||(active===byId('scope-country')&&!scope.campus))byId('scope-picker').focus({preventScroll:true});
 byId('section-scope').textContent=scope.country?scopeName():t('all');
}
function renderContent() {
 if(section==='explore') return;
 byId('section-title').textContent=t(section);
 byId('section-intro').textContent=t(`${section}Intro`);
 const list=byId('content-list'); list.replaceChildren();byId('content-sheet').scrollTop=0;
 const languageIndex=['fr','en','ar'].indexOf(locale);
 const filtered=records[section].filter(([id])=>campusById.has(id)&&(!scope.country||campusById.get(id).country===scope.country)&&(!scope.campus||id===scope.campus));
 if(!filtered.length){
  const empty=document.createElement('div');empty.className='content-empty';
  const title=document.createElement('h2');title.textContent=network?t('emptyTitle'):t(loadFailed?'error':'loading');
  const paragraph=document.createElement('p');paragraph.textContent=network?t('emptyText'):t('networkUnavailable');
  empty.append(title,paragraph);list.append(empty);
 }
 for(const [campusId,titles] of filtered){
  const campus=campusById.get(campusId);
  const button=document.createElement('button'); button.type='button';button.className='content-item';
  const symbol=section==='people'?'people':section==='projects'?'projects':'journal';
  button.innerHTML=`<span class="item-sign">${icon(symbol)}</span><span class="item-text"><span class="item-title"></span><span class="item-meta"></span></span>${icon('arrow')}`;
  button.querySelector('.item-title').textContent=titles[languageIndex];
  button.querySelector('.item-meta').textContent=campus.name;button.querySelector('.item-meta').dir='auto';
  button.addEventListener('click',()=>openDialog(titles[languageIndex],container=>{
   const paragraph=document.createElement('p');paragraph.className='dialog-text';paragraph.textContent=`${t('detailNote')} · ${campus.name}`;container.append(paragraph);
  }));
  list.append(button);
 }
 sheetAnimation?.cancel();
 if(!motion.matches) sheetAnimation=list.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
}
function setSection(next) {
 if(next===section)return;
 section=next; app.dataset.section=section;
 buttons.forEach(button=>{if(button.dataset.section===section)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 byId('content-sheet').inert=section==='explore';byId('about').hidden=section!=='explore';
 renderContent();moveIndicator();globe?.refreshLayout();announce(`${t(section)} · ${scopeName()}`);
}
buttons.forEach(button=>button.addEventListener('click',()=>setSection(button.dataset.section)));
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();setSection('explore');});
byId('close-sheet').addEventListener('click',()=>{setSection('explore');buttons[0].focus();});

const dialog=byId('dialog');
function openDialog(title,render,kind=''){
 dialog.dataset.kind=kind;byId('dialog-title').textContent=title;byId('dialog-content').replaceChildren();render(byId('dialog-content'));dialog.showModal();
 byId('scope-picker').setAttribute('aria-expanded',String(kind==='scope'));
}
const closeDialog=()=>dialog.close();
dialog.addEventListener('close',()=>byId('scope-picker').setAttribute('aria-expanded','false'));
byId('close-dialog').addEventListener('click',closeDialog);
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeDialog();}});
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
byId('scope-picker').addEventListener('click',()=>{
 if(!globe||!network)return;
 openDialog(t('scopeTitle'),container=>mountScopeSelectors({
  container,locale,countries,campuses,scope,countryName,
  onSelect(next){
   if(next.campus)globe.selectCampus(next.campus);
   else if(next.country)globe.selectCountry(next.country);
   else globe.reset();
  },
 }),'scope');
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
byId('scope-back').addEventListener('click',()=>globe?.back());
byId('scope-world').addEventListener('click',()=>globe?.reset());
byId('scope-country').addEventListener('click',()=>{if(scope.country)globe?.selectCountry(scope.country);});
byId('reset').addEventListener('click',()=>globe?.reset());
byId('zoom-in').addEventListener('click',()=>globe?.zoomBy(1.25));
byId('zoom-out').addEventListener('click',()=>globe?.zoomBy(.8));
byId('random-campus').addEventListener('click',()=>{
 if(!globe||!campuses.length||byId('random-campus').disabled)return;
 // Consume the destination drawn before this click, including its shared
 // in-flight/cache data. The next draw cannot replace the one being visited.
 const campus=globe.visitRandomCampus();if(!campus)return;
 announce(message('randomDestination',{campus:campus.name,country:countryName(campus.country)}));
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
 const labels={language:'language',profile:'profile','scope-back':'back',reset:'reset','zoom-in':'zoomIn','zoom-out':'zoomOut','random-campus':'randomCampus','close-dialog':'close','close-sheet':'closeSheet'};
 for(const [id,key] of Object.entries(labels))byId(id).setAttribute('aria-label',t(key));
 byId('random-campus').title=t('randomCampus');
 byId('theme').setAttribute('aria-label',t(dark?'themeLight':'themeDark'));
 byId('globe').setAttribute('aria-label',t('globeLabel'));byId('globe-hint').textContent=scopeHint();
 nav.setAttribute('aria-label',{fr:'Navigation principale',en:'Main navigation',ar:'التنقل الرئيسي'}[locale]);
 entrance?.refresh();updateScope();updateCampusStatus();renderContent();globe?.refreshLabels();globe?.refreshLayout();requestAnimationFrame(moveIndicator);announce(`${t(section)} · ${scopeName()}`);
}
new ResizeObserver(moveIndicator).observe(nav);
document.fonts.ready.then(moveIndicator);
motion.addEventListener('change',()=>{if(motion.matches)sheetAnimation?.cancel();});
moveIndicator();localize();

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
async function initializeGlobe(){
 loadFailed=false;
 const [{createWelcomeGlobe},world,dataset,corrections,websites,websiteLocales]=await Promise.all([
  import('./integrated-globe.mjs?v=28'),geography.load(),json('./campuses.json'),json('./campus-location-overrides.json'),json('./campus-websites.json?v=1').catch(()=>({campuses:{}})),json('./campus-website-locales.json?v=1').catch(()=>({campuses:{}})),
  Promise.all(['../map-data/d3.min.js','vendor/maplibre-gl.js'].map(loadScript)),
 ]);
 const locationOverrides=new Map(corrections.map(correction=>[correction.campusId,correction]));
 network=dataset;countries=network.countries;
 campuses=network.campuses.map(campus=>{
  const correction=locationOverrides.get(campus.id);
  const site=websites.campuses[campus.id];
  return {...campus,...(correction?{coordinates:correction.coordinates,locationSource:{url:correction.sourceUrl,precision:correction.precision}}:{}),...(site?.kind==='campus-site'?{websiteUrl:site.url}:{}),websiteLocales:websiteLocales.campuses[campus.id]};
 });
 campuses.forEach(campus=>campusById.set(campus.id,campus));countries.forEach(country=>countryById.set(country.id,country));
 let readyResolve,readyReject;
 const ready=new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;});
 const timer=setTimeout(()=>readyReject(new Error('Map preparation timed out')),45000);
 try {
  globe=createWelcomeGlobe({container:byId('globe'),world,campuses,countries,
   onCampusDetails(campus){openDialog({fr:'Le campus',en:'Campus',ar:'الفرع'}[locale],container=>mountCampusDetails({container,campus,countryName,locale}),'campus');},
   formatPlace:place,markerLabel:entry=>`${t('marker')} · ${place(entry.name,entry)}`,
   onScopeChange(next){
    if(!next.campus||next.campus!==scope.campus){campusRenderError=null;campusRendering=false;}
    scope=next;updateScope();renderContent();updateCampusStatus();announce(`${t(section)} · ${scopeName()}`);
   },
   onCampusLoad(state){campusPreparation=state;updateCampusStatus();},
   onRandomCampusLoad(state){
    const button=byId('random-campus');button.dataset.nextCampus=state.nextCampusId??'';
    button.dataset.preloadPhase=state.phase;button.dataset.preloadReady=String(Boolean(state.ready));
   },
   onStatus(status){
    if(scope.campus){campusRendering=status==='loading';updateCampusStatus();}
    if(document.body.dataset.entry==='welcome'&&scope.campus&&(status==='error'||status==='loading')){
     // The disk can be cached while a viewport tile or glyph still failed.
     // Only a deliberate new attempt clears that independent rendering error.
     campusRenderError=status==='error'?scope.campus:null;updateCampusStatus();return;
    }
    byId('loading').hidden=status==='ready';byId('loading').textContent=t(status==='error'?'error':'loading');
    if(status==='ready')readyResolve();else if(status==='error')readyReject(new Error('Map preparation failed'));
   },
   onViewChange({canBack,canZoomIn=false,canZoomOut=false}){
    const back=byId('scope-back');const restoreFocus=!canBack&&document.activeElement===back;
    back.disabled=!canBack;byId('zoom-in').disabled=!canZoomIn;byId('zoom-out').disabled=!canZoomOut;
    if(restoreFocus)byId('scope-picker').focus({preventScroll:true});
   }
  });
  globe.setTheme(dark);byId('globe').setAttribute('aria-label',t('globeLabel'));
  await ready;
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
entrance=mountEntrance({getLocale:()=>locale,openDialog,closeDialog,prepare:prepareGlobe,getGlobeGeometry:()=>globe?.getWorldScreenGeometry?.(),
 onOpen(mode){identity=mode;globe?.refreshLayout({animate:false});trace({openedAt:performance.now(),identity:mode});},
 onEvent(event){trace({...event,eventAt:performance.now()});if(event.decoded)byId('announcement').textContent=event.decoded;}
});
// Paint the encrypted entrance first. Its controls never wait for map preparation.
requestAnimationFrame(()=>setTimeout(()=>{prepareGlobe().catch(()=>{});},0));
