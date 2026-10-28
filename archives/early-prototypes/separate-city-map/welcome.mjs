import { createCityMap } from './city-map.mjs';
const byId = id => document.getElementById(id);
const app = byId('app');
const nav = byId('main-nav');
const indicator = nav.querySelector('.nav-indicator');
const buttons = [...nav.querySelectorAll('button')];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let locale = 'fr', section = 'explore', dark = false, globe, sheetAnimation;
let scope = {level:'world',country:null,campus:null};
let network = null, campuses = [], countries = [], loadFailed = false;
let cityCampus = null, cityTimer = 0;
const cityMap = createCityMap({container:byId('city-map'),reducedMotion:motion.matches,locale,
 onExit(){globe?.back();byId('globe').focus({preventScroll:true});}
});
const campusById = new Map(), countryById = new Map();
let regionNames = new Intl.DisplayNames(locale, {type:'region'});
const dataControls = ['scope-picker','reset','zoom-in','zoom-out'];
dataControls.forEach(id=>{byId(id).disabled=true;});
const copy = {
 fr:{explore:'Explorer',projects:'Projets',people:'Parcours',journal:'Le journal',world:'Le monde',hint:'Fais tourner le monde.',language:'Choisir une langue',themeDark:'Activer le thème sombre',themeLight:'Activer le thème clair',profile:'Mon espace',back:'Revenir au niveau précédent',reset:'Revenir au monde',zoomIn:'Zoomer',zoomOut:'Dézoomer',close:'Fermer',closeSheet:'Revenir au globe',sample:'Contenus de démonstration',prototype:'Exploration · 42 Horizon',scopeTitle:'Où veux-tu aller ?',countries:'Choisir un pays',campuses:'Choisir un campus',all:'Tous les campus',globeLabel:'Globe interactif. Glisse pour tourner, pince ou utilise la molette pour zoomer. Au clavier : flèches, plus et moins. Échap revient au niveau précédent.',marker:'Explorer',loading:'Le monde se prépare…',error:'Le globe n’a pas pu se charger. Recharge la page pour réessayer.',projectsIntro:'Des idées qui prennent forme, ensemble.',peopleIntro:'Chaque parcours commence quelque part.',journalIntro:'La vie de la communauté, au fil des jours.',guestTitle:'Bienvenue sur Horizon',guestText:'Tu explores Horizon en visiteur. Cet aperçu permet de découvrir le globe et les rubriques, sans connexion à un compte.',aboutTitle:'Une nouvelle façon d’explorer',detailNote:'Exemple de contenu pour cette exploration.'},
 en:{explore:'Explore',projects:'Projects',people:'Journeys',journal:'Journal',world:'The world',hint:'Give the world a spin.',language:'Choose a language',themeDark:'Switch to dark theme',themeLight:'Switch to light theme',profile:'My space',back:'Back to the previous level',reset:'Back to the world',zoomIn:'Zoom in',zoomOut:'Zoom out',close:'Close',closeSheet:'Back to the globe',sample:'Sample content',prototype:'Exploration · 42 Horizon',scopeTitle:'Where would you like to go?',countries:'Choose a country',campuses:'Choose a campus',all:'All campuses',globeLabel:'Interactive globe. Drag to rotate, pinch or use the wheel to zoom. Keyboard: arrows, plus and minus. Escape goes back one level.',marker:'Explore',loading:'Getting the world ready…',error:'The globe could not load. Refresh the page to try again.',projectsIntro:'Ideas taking shape, together.',peopleIntro:'Every journey starts somewhere.',journalIntro:'Stories from our community, day by day.',guestTitle:'Welcome to Horizon',guestText:'You are exploring Horizon as a visitor. This preview lets you discover the globe and its sections without signing into an account.',aboutTitle:'A new way to explore',detailNote:'Sample content for this exploration.'},
 ar:{explore:'استكشف',projects:'المشاريع',people:'المسارات',journal:'المجلة',world:'العالم',hint:'أدر العالم واكتشفه.',language:'اختر اللغة',themeDark:'تفعيل المظهر الداكن',themeLight:'تفعيل المظهر الفاتح',profile:'مساحتي',back:'العودة إلى المستوى السابق',reset:'العودة إلى العالم',zoomIn:'تكبير',zoomOut:'تصغير',close:'إغلاق',closeSheet:'العودة إلى الكرة الأرضية',sample:'محتوى توضيحي',prototype:'تصوّر أولي · 42 Horizon',scopeTitle:'إلى أين تريد الذهاب؟',countries:'اختر دولة',campuses:'اختر حرمًا',all:'جميع الفروع',globeLabel:'كرة أرضية تفاعلية. اسحب للتدوير واستخدم إصبعين أو عجلة الفأرة للتكبير. استخدم الأسهم وعلامتي الجمع والطرح بلوحة المفاتيح. اضغط Escape للعودة.',marker:'استكشف',loading:'نجهّز العالم…',error:'تعذّر تحميل الكرة الأرضية. أعد تحميل الصفحة للمحاولة مجددًا.',projectsIntro:'أفكار نبنيها معًا.',peopleIntro:'لكل رحلة نقطة بداية.',journalIntro:'حكايات المجتمع، يومًا بعد يوم.',guestTitle:'مرحبًا بك في Horizon',guestText:'أنت تتصفح Horizon كزائر. يتيح لك هذا التصوّر استكشاف العالم والأقسام دون تسجيل الدخول إلى حساب.',aboutTitle:'طريقة جديدة للاستكشاف',detailNote:'محتوى توضيحي لهذا التصوّر.'}
};
Object.assign(copy.fr, {
 search:'Rechercher un campus ou un pays', searchPlaceholder:'Paris, Codam, Japon…', countryFilter:'Pays', allCountries:'Tous les pays',
 searchWithin:'Recherche dans {country}', searchEverywhere:'Recherche dans tous les pays', results:'{count} campus', noResults:'Aucun campus ne correspond à cette recherche.',
 emptyTitle:'Pas encore de contenu dans cet aperçu', emptyText:'Aucun contenu de démonstration n’a été ajouté pour ce périmètre du réseau.',
 networkText:'{count} campus référencés dans {countries} pays, d’après la source officielle consultée le {date}. Cet instantané n’indique pas si les admissions sont ouvertes.',
 networkSource:'Consulter la source officielle des campus', aboutSource:'Les repères viennent du réseau 42, avec des positions corrigées à partir de sources cartographiques et des adresses officielles. La précision des autres positions reste à vérifier. Globe : Natural Earth / D3 Maps ; rues et bâtiments : OpenStreetMap.',
 aboutDemo:'Les rubriques restent une démonstration : seuls Paris, Lyon, Tokyo, Rio et São Paulo disposent de contenus fictifs.', networkUnavailable:'Les données du réseau ne sont pas encore disponibles.'
});
Object.assign(copy.en, {
 search:'Search for a campus or country', searchPlaceholder:'Paris, Codam, Japan…', countryFilter:'Country', allCountries:'All countries',
 searchWithin:'Searching in {country}', searchEverywhere:'Searching all countries', results:'{count} campuses', noResults:'No campuses match this search.',
 emptyTitle:'No content in this preview yet', emptyText:'No sample content has been added for this part of the network.',
 networkText:'{count} campuses listed in {countries} countries, based on the official source retrieved on {date}. This snapshot does not indicate whether admissions are open.',
 networkSource:'View the official campus source', aboutSource:'Markers come from the 42 network, with positions corrected using maps and official addresses. The accuracy of the other positions has yet to be checked. Globe: Natural Earth / D3 Maps; streets and buildings: OpenStreetMap.',
 aboutDemo:'The sections remain a demonstration: only Paris, Lyon, Tokyo, Rio and São Paulo have fictional content.', networkUnavailable:'The network data is not available yet.'
});
Object.assign(copy.ar, {
 search:'ابحث عن فرع أو دولة', searchPlaceholder:'Paris، Codam، اليابان…', countryFilter:'الدولة', allCountries:'جميع الدول',
 searchWithin:'البحث في {country}', searchEverywhere:'البحث في جميع الدول', results:'عدد الفروع: {count}', noResults:'لا توجد فروع تطابق هذا البحث.',
 emptyTitle:'لا يوجد محتوى في هذا التصوّر بعد', emptyText:'لم يُضف محتوى توضيحي لهذا النطاق من الشبكة بعد.',
 networkText:'{count} فرعًا مُدرجًا في {countries} دولة، وفق المصدر الرسمي الذي جرت مراجعته في {date}. لا يبيّن هذا السجل ما إذا كان التسجيل مفتوحًا.',
 networkSource:'الاطلاع على المصدر الرسمي للفروع', aboutSource:'مصدر العلامات هو شبكة 42، مع تصحيح بعض المواقع باستخدام الخرائط والعناوين الرسمية. لم تُتحقق دقة المواقع الأخرى بعد. الكرة الأرضية: Natural Earth / D3 Maps؛ الشوارع والمباني: OpenStreetMap.',
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
const place = (name, entry) => entry?.type==='country' ? countryName(entry.id) : name;
const searchText = text => String(text).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase(locale).trim();
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;

function moveIndicator() {
 const current = buttons.find(b=>b.dataset.section===section);
 if (!current) return;
 indicator.style.width = `${current.offsetWidth}px`;
 indicator.style.height = `${current.offsetHeight}px`;
 indicator.style.transform = `translate(${current.offsetLeft}px,${current.offsetTop}px)`;
}
function announce(text) { byId('announcement').textContent=text; }
function updateScope() {
 byId('scope-name').textContent=scopeName();
 byId('section-scope').textContent=scope.country?scopeName():t('all');
}
function syncCityView(){
 if(scope.campus === cityCampus)return;
 clearTimeout(cityTimer);
 cityMap.close();app.dataset.map='globe';byId('globe').inert=false;
 cityCampus=scope.campus;
 if(!cityCampus){
  byId('globe-hint').textContent=t('hint');return;
 }
 const campus=campusById.get(cityCampus);
 cityTimer=setTimeout(()=>{
  app.dataset.map='city';byId('globe').inert=true;
  byId('globe-hint').textContent={fr:'Explore les alentours du campus.',en:'Explore around the campus.',ar:'استكشف محيط الفرع.'}[locale];
  cityMap.open(campus);
 },motion.matches?0:650);
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
 section=next; app.dataset.section=section;
 buttons.forEach(button=>{if(button.dataset.section===section)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 byId('content-sheet').inert=section==='explore';byId('about').hidden=section!=='explore';
 renderContent();moveIndicator();globe?.refreshLayout();cityMap.refreshLayout();announce(`${t(section)} · ${scopeName()}`);
}
buttons.forEach(button=>button.addEventListener('click',()=>setSection(button.dataset.section)));
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();setSection('explore');});
byId('close-sheet').addEventListener('click',()=>{setSection('explore');buttons[0].focus();});

const dialog=byId('dialog');
function openDialog(title,render,kind=''){
 dialog.dataset.kind=kind;byId('dialog-title').textContent=title;byId('dialog-content').replaceChildren();render(byId('dialog-content'));dialog.showModal();
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
byId('language').addEventListener('click',()=>openDialog(t('language'),container=>{
 for(const [id,label] of [['fr','Français'],['en','English'],['ar','العربية']])option(container,label,()=>{locale=id;localize();closeDialog();},{active:locale===id});
}));
byId('scope-picker').addEventListener('click',()=>{
 if(!globe||!network)return;
 openDialog(t('scopeTitle'),container=>{
  option(container,t('world'),()=>{globe.reset();closeDialog();},{active:!scope.country,detail:message('results',{count:campuses.length})});
  const searchLabel=document.createElement('label');searchLabel.className='scope-search-label';searchLabel.htmlFor='campus-search';searchLabel.textContent=t('search');
  const search=document.createElement('input');search.id='campus-search';search.className='scope-search';search.type='search';search.autocomplete='off';search.spellcheck=false;search.placeholder=t('searchPlaceholder');search.setAttribute('aria-controls','campus-search-results');search.setAttribute('aria-describedby','campus-search-status');
  const filterRow=document.createElement('div');filterRow.className='scope-filter-row';
  const countryLabel=document.createElement('label');countryLabel.htmlFor='campus-country';countryLabel.textContent=t('countryFilter');
  const countrySelect=document.createElement('select');countrySelect.id='campus-country';countrySelect.setAttribute('aria-controls','campus-search-results');
  const all=document.createElement('option');all.value='';all.textContent=t('allCountries');countrySelect.append(all);
  [...countries].sort((a,b)=>countryName(a.id).localeCompare(countryName(b.id),locale)).forEach(country=>{
   const item=document.createElement('option');item.value=country.id;item.textContent=countryName(country.id);countrySelect.append(item);
  });
  countrySelect.value=scope.country||'';filterRow.append(countryLabel,countrySelect);
  const countryAction=option(container,'',()=>{if(countrySelect.value){globe.selectCountry(countrySelect.value);closeDialog();}});
  countryAction.classList.add('scope-country-action');
  const status=document.createElement('p');status.id='campus-search-status';status.className='scope-search-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const results=document.createElement('div');results.id='campus-search-results';results.className='scope-results';
  // Only replace results: typing and changing the country keep their focus.
  function renderResults(){
   const country=countrySelect.value;
   const query=searchText(search.value);
   const matches=campuses.filter(campus=>!country||campus.country===country).filter(campus=>{
    const region=countryById.get(campus.country);
    return searchText([campus.name,countryName(campus.country),region?.name,region?.iso2,campus.country].join(' ')).includes(query);
   }).sort((a,b)=>a.name.localeCompare(b.name,locale));
   countryAction.hidden=!country;
   countryAction.querySelector('span').textContent=country?`${t('marker')} · ${countryName(country)}`:'';
   status.textContent=`${country?message('searchWithin',{country:countryName(country)}):t('searchEverywhere')} · ${message('results',{count:matches.length})}`;
   results.replaceChildren();
   if(!matches.length){const empty=document.createElement('p');empty.className='scope-no-results';empty.textContent=t('noResults');results.append(empty);}
   matches.forEach(campus=>option(results,campus.name,()=>{globe.selectCampus(campus.id);closeDialog();},{active:scope.campus===campus.id,detail:countryName(campus.country)}));
   results.scrollTop=0;
  }
  container.append(searchLabel,search,filterRow,countryAction,status,results);
  search.addEventListener('input',renderResults);countrySelect.addEventListener('change',renderResults);renderResults();
 },'scope');
});
byId('profile').addEventListener('click',()=>openDialog(t('guestTitle'),container=>{const p=document.createElement('p');p.className='dialog-text';p.textContent=t('guestText');container.append(p);}));
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
byId('reset').addEventListener('click',()=>globe?.reset());
byId('zoom-in').addEventListener('click',()=>app.dataset.map==='city'?cityMap.zoomBy(1.25):globe?.zoomBy(1.25));
byId('zoom-out').addEventListener('click',()=>app.dataset.map==='city'?cityMap.zoomBy(.8):globe?.zoomBy(.8));
byId('theme').addEventListener('click',()=>{
 dark=!dark;document.documentElement.dataset.theme=dark?'dark':'light';byId('theme').setAttribute('aria-pressed',String(dark));
 byId('theme').querySelector('use').setAttribute('href',dark?'#i-sun':'#i-moon');
 byId('theme').setAttribute('aria-label',t(dark?'themeLight':'themeDark'));globe?.setTheme(dark);
});
function localize(){
 regionNames=new Intl.DisplayNames(locale,{type:'region'});
 byId('loading').textContent=t(loadFailed?'error':'loading');
 document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-copy]').forEach(element=>{element.textContent=t(element.dataset.copy);});
 byId('language').textContent={fr:'FR',en:'EN',ar:'ع'}[locale];
 const labels={language:'language',profile:'profile','scope-back':'back',reset:'reset','zoom-in':'zoomIn','zoom-out':'zoomOut','close-dialog':'close','close-sheet':'closeSheet'};
 for(const [id,key] of Object.entries(labels))byId(id).setAttribute('aria-label',t(key));
 byId('theme').setAttribute('aria-label',t(dark?'themeLight':'themeDark'));
 byId('globe').setAttribute('aria-label',t('globeLabel'));byId('globe-hint').textContent=app.dataset.map==='city'?{fr:'Explore les alentours du campus.',en:'Explore around the campus.',ar:'استكشف محيط الفرع.'}[locale]:t('hint');
 cityMap.setLocale(locale);
 nav.setAttribute('aria-label',{fr:'Navigation principale',en:'Main navigation',ar:'التنقل الرئيسي'}[locale]);
 updateScope();renderContent();globe?.refreshLabels();globe?.refreshLayout();requestAnimationFrame(moveIndicator);announce(`${t(section)} · ${scopeName()}`);
}
new ResizeObserver(moveIndicator).observe(nav);
document.fonts.ready.then(moveIndicator);
motion.addEventListener('change',()=>{if(motion.matches)sheetAnimation?.cancel();cityMap.setReducedMotion(motion.matches);});
moveIndicator();localize();

try{
 const [world,dataset,corrections]=await Promise.all(['../../../shared/map-data/world.json','./campuses.json','./campus-location-overrides.json'].map(async url=>{const response=await fetch(url);if(!response.ok)throw new Error(`Unable to load ${url}: ${response.status}`);return response.json();}));
 const locationOverrides=new Map(corrections.map(correction=>[correction.campusId,correction]));
 network=dataset;countries=network.countries;
 campuses=network.campuses.map(campus=>{
  const correction=locationOverrides.get(campus.id);
  return correction?{...campus,coordinates:correction.coordinates,locationSource:{url:correction.sourceUrl,precision:correction.precision}}:campus;
 });
 campuses.forEach(campus=>campusById.set(campus.id,campus));countries.forEach(country=>countryById.set(country.id,country));
 globe=window.createWelcomeGlobe({container:byId('globe'),world,campuses,countries,
  formatPlace:place,markerLabel:entry=>`${t('marker')} · ${place(entry.name,entry)}`,
  onScopeChange(next){scope=next;updateScope();renderContent();syncCityView();announce(`${t(section)} · ${scopeName()}`);},
  onViewChange({canBack}){byId('scope-back').disabled=!canBack;}
 });
 globe.setTheme(dark);byId('globe').setAttribute('aria-label',t('globeLabel'));byId('loading').hidden=true;dataControls.forEach(id=>{byId(id).disabled=false;});updateScope();renderContent();
}catch(error){loadFailed=true;byId('loading').textContent=t('error');renderContent();console.error(error);}
