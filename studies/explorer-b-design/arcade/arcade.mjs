/* Arcade study (24 Oct 2026) — "Sélection de niveau, version douce" for Explorer B.
 * A static, playable mock-up: version B's own model (site-b/explorer-model.mjs) builds every level, the real
 * catalogue and campus profiles fill it, and site-b/explorer-band.mjs measures the free band of the page.
 * Everything from site/ and site-b/ is read, never written. */
import {continentOfCountry,continentName} from '../../../site-b/continents.mjs?v=b1';
import {buildExplorerView,countLabel} from '../../../site-b/explorer-model.mjs';
import {createExplorerBand} from '../../../site-b/explorer-band.mjs';

const SITE=new URL('../../../site/',import.meta.url),SITE_B=new URL('../../../site-b/',import.meta.url);
const root=document.documentElement,LANG=root.lang,RTL=root.dir==='rtl';
const params=new URLSearchParams(location.search);
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const $=selector=>document.querySelector(selector);
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
const icon=(name,className)=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS('http://www.w3.org/2000/svg','use');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');if(className)svg.setAttribute('class',className);use.setAttribute('href','#i-'+name);svg.append(use);return svg;};
const fill=(template,values)=>template.replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??''));

/* ------------------------------------------------------------------ copy (FR / EN / AR) */
// Frame strings are the site's own (site-b/welcome.mjs, account-menu.mjs); sheet strings are campus-details.mjs's,
// except the few marked "study" which this proposal adds.
const COPY={
 fr:{frame:{explore:'Explorer',projects:'Projets',people:'Profils',journal:'Chroniques',awards:'42 Awards',capsule:'Chercher dans Horizon',search:'Rechercher dans Horizon',prototype:'Exploration · 42 Horizon',back:'Revenir au niveau précédent',reset:'Revenir au monde',breadcrumb:'Chemin géographique',choosePlace:'Choisir un pays ou un campus',world:'Monde',random:'Visiter un campus',account:'Menu du compte',nav:'Navigation principale'},
  title:'Explorer',steps:['Continent','Pays','Campus'],progress:'Étape {i} sur 3 : {word}',select:'Valider',selectName:'Valider {name}',enter:'Entrée',esc:'Échap',previous:'Précédent',next:'Suivant',carousel:'carrousel',position:'{i} sur {n}',
  choose:'pour choisir',validate:'pour valider',goBack:'pour revenir',touch:'Glisse pour choisir · Touche Valider',siblings:'Tous les campus · {country}',
  address:'Adresse',copyAddress:'Copier l’adresse',copied:'Adresse copiée.',copyError:'La copie automatique est indisponible. Sélectionnez l’adresse pour la copier.',directions:'Itinéraire',directionsLabel:'Itinéraire dans Google Maps',
  website:'Site officiel du campus',profile:'Fiche officielle · 42 Network',newTab:'S’ouvre dans un nouvel onglet',contacts:'Contacts',since:'Depuis {date}',
  stats:'Le campus en chiffres',students:'Étudiants',cohorts:'Promotions',alumni:'Alumni',missingStats:'Les chiffres non renseignés sont indiqués par un tiret.',
  piscines:'Prochaines Piscines',checkDates:'Dates à consulter sur le site officiel.',officialDates:'Consulter les dates officielles',ongoing:'En cours',
  photos:'Photos',enlarge:'Agrandir la photo',previousPhoto:'Photo précédente',nextPhoto:'Photo suivante',source:'Source',verified:'Dernière vérification : ',
  sparse:'Photos, contacts et chiffres ne sont pas encore renseignés pour ce campus.',sparseMore:'Son site officiel reste la meilleure source.',
  missing:'Non renseigné',chosen:'{name} · {count}',opened:'{name} ouvert',later:'À compléter',noPhotos:'Pas encore de photos'},
 en:{frame:{explore:'Explore',projects:'Projects',people:'Profiles',journal:'Chronicles',awards:'42 Awards',capsule:'Search Horizon',search:'Search Horizon',prototype:'Exploration · 42 Horizon',back:'Back to the previous level',reset:'Back to the world',breadcrumb:'Location path',choosePlace:'Choose a country or campus',world:'World',random:'Visit a campus',account:'Account menu',nav:'Main navigation'},
  title:'Explore',steps:['Continent','Country','Campus'],progress:'Step {i} of 3: {word}',select:'Select',selectName:'Select {name}',enter:'Enter',esc:'Esc',previous:'Previous',next:'Next',carousel:'carousel',position:'{i} of {n}',
  choose:'to choose',validate:'to select',goBack:'to go back',touch:'Swipe to choose · Tap Select',siblings:'All campuses · {country}',
  address:'Address',copyAddress:'Copy address',copied:'Address copied.',copyError:'Automatic copying is unavailable. Select the address to copy it.',directions:'Directions',directionsLabel:'Directions in Google Maps',
  website:'Official campus website',profile:'Official profile · 42 Network',newTab:'Opens in a new tab',contacts:'Contacts',since:'Since {date}',
  stats:'Campus in figures',students:'Students',cohorts:'Cohorts',alumni:'Alumni',missingStats:'Figures that are not provided are shown as a dash.',
  piscines:'Upcoming Piscines',checkDates:'Check the official website for dates.',officialDates:'Check official dates',ongoing:'In progress',
  photos:'Photos',enlarge:'Enlarge photo',previousPhoto:'Previous photo',nextPhoto:'Next photo',source:'Source',verified:'Last checked: ',
  sparse:'Photos, contacts and figures have not been added for this campus yet.',sparseMore:'Its official website remains the best source.',
  missing:'Not provided',chosen:'{name} · {count}',opened:'{name} opened',later:'Still to come',noPhotos:'No photos yet'},
 ar:{frame:{explore:'استكشف',projects:'المشاريع',people:'الأعضاء',journal:'حكايات',awards:'جوائز 42',capsule:'ابحث في أفق',search:'البحث في أفق',prototype:'تصوّر أولي · 42 Horizon',back:'العودة إلى المستوى السابق',reset:'العودة إلى العالم',breadcrumb:'مسار الموقع',choosePlace:'اختر دولة أو فرعًا',world:'العالم',random:'زيارة فرع',account:'قائمة الحساب',nav:'التنقل الرئيسي'},
  title:'استكشف',steps:['القارة','الدولة','الفرع'],progress:'الخطوة {i} من 3: {word}',select:'تأكيد',selectName:'تأكيد {name}',enter:'Enter',esc:'Esc',previous:'السابق',next:'التالي',carousel:'عرض دوّار',position:'{i} من {n}',
  choose:'للاختيار',validate:'للتأكيد',goBack:'للرجوع',touch:'اسحب للاختيار · المس تأكيد',siblings:'جميع فروع {country}',
  address:'العنوان',copyAddress:'نسخ العنوان',copied:'تم نسخ العنوان.',copyError:'النسخ التلقائي غير متاح. حدّد العنوان لنسخه.',directions:'الاتجاهات',directionsLabel:'الاتجاهات في خرائط Google',
  website:'الموقع الرسمي للفرع',profile:'الصفحة الرسمية · 42 Network',newTab:'يفتح في علامة تبويب جديدة',contacts:'التواصل',since:'منذ {date}',
  stats:'الفرع بالأرقام',students:'الطلاب',cohorts:'الدفعات',alumni:'الخريجون',missingStats:'تشير الشرطة إلى الأرقام غير المتوفرة.',
  piscines:'فترات البيسين القادمة',checkDates:'راجع الموقع الرسمي للاطلاع على المواعيد.',officialDates:'الاطلاع على المواعيد الرسمية',ongoing:'جارية الآن',
  photos:'الصور',enlarge:'تكبير الصورة',previousPhoto:'الصورة السابقة',nextPhoto:'الصورة التالية',source:'المصدر',verified:'آخر تحقق: ',
  sparse:'لم تُضف بعد صور هذا الفرع ولا جهات التواصل ولا أرقامه.',sparseMore:'يبقى موقعه الرسمي أفضل مصدر.',
  missing:'غير متوفر',chosen:'{name} · {count}',opened:'فُتحت صفحة {name}',later:'قيد الإكمال',noPhotos:'لا توجد صور بعد'},
};
const T=COPY[LANG]||COPY.fr;

/* ------------------------------------------------------------------ data */
const json=url=>fetch(url).then(response=>{if(!response.ok)throw new Error(String(url));return response.json();});
const [catalog,profiles,websites]=await Promise.all([json(new URL('campuses.json',SITE)),json(new URL('campus-profiles.json',SITE)),json(new URL('campus-websites.json',SITE))]);
const STANDIN=(await import('./standin-shapes.mjs')).SHAPES;
let SHAPES=STANDIN,shapesSource='standin',POINTS=null;
try{const module=await import(new URL('explorer-shapes.mjs',SITE_B).href);if(module?.SHAPES?.countries){SHAPES=module.SHAPES;shapesSource='site-b';}}catch{/* stand-ins stay */}
// site-b's silhouettes carry no campus positions: tools/build-campus-points.mjs places them in the same viewBoxes.
if(shapesSource==='site-b'){try{POINTS=(await import('./campus-points.mjs')).POINTS;}catch{POINTS=null;}}
const pointsFor=(kind,id)=>{
 const shape=kind==='world'?SHAPES.world:kind==='continent'?SHAPES.continents?.[id]:SHAPES.countries?.[id];
 if(shape?.points)return shape.points;
 if(shapesSource!=='site-b')return (kind==='world'?STANDIN.world:kind==='continent'?STANDIN.continents[id]:STANDIN.countries[id])?.points||{};
 return (kind==='world'?POINTS?.world:kind==='continent'?POINTS?.continents?.[id]:POINTS?.countries?.[id])||{};
};
let logoManifest=null;try{logoManifest=await json(new URL('campus-logos.json',SITE_B));}catch{/* probe the files instead */}

const countryById=new Map(catalog.countries.map(country=>[country.id,country]));
const campusById=new Map(catalog.campuses.map(campus=>[campus.id,campus]));
const regionNames=new Intl.DisplayNames([LANG],{type:'region'});
const countryName=id=>{const country=countryById.get(id);return country?regionNames.of(country.iso2)||country.name:id;};
const flagURL=iso2=>new URL(`assets/flags/${iso2.toLowerCase()}.svg`,SITE_B).href;
const flagFallback=iso2=>`https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/flags/4x3/${iso2.toLowerCase()}.svg`;
const number=new Intl.NumberFormat(LANG);

/* ------------------------------------------------------------------ logos: the official file as an ink mask */
const logoFiles=new Map();
async function logoURL(id){
 if(logoFiles.has(id))return logoFiles.get(id);
 const promise=(async()=>{
  const entry=logoManifest?.campuses?.[id]??logoManifest?.[id];
  const file=entry?.file||entry?.src||entry?.path;
  if(file)return new URL(file.includes('/')?file:'assets/campus-logos/'+file,SITE_B).href;
  for(const ext of ['png','jpg','svg']){const url=new URL(`assets/campus-logos/${id}.${ext}`,SITE_B).href;try{if((await fetch(url,{method:'HEAD'})).ok)return url;}catch{}}
  const local=profiles.campuses?.[id]?.logo?.src;return local?new URL(local,SITE).href:null;
 })();
 logoFiles.set(id,promise);return promise;
}
const inks=new Map();
// Opaque logos (black on white) become an alpha mask; transparent ones keep their alpha; colourful ones keep colour.
function inkLogo(url){
 if(inks.has(url))return inks.get(url);
 const promise=(async()=>{
  const image=new Image();image.decoding='async';image.src=url;await image.decode();
  let width=image.naturalWidth||640,height=image.naturalHeight||214;
  const scale=Math.min(1,900/Math.max(width,height));width=Math.round(width*scale);height=Math.round(height*scale);
  const canvas=el('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0,width,height);
  const data=context.getImageData(0,0,width,height),px=data.data;
  let clear=0,border=0;
  for(let x=0;x<width;x+=2)for(const y of [0,height-1]){border++;if(px[(y*width+x)*4+3]<200)clear++;}
  const transparent=clear/border>.5;
  let saturation=0,count=0;
  for(let i=0;i<px.length;i+=16){const a=px[i+3],r=px[i],g=px[i+1],b=px[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b);if(a>128&&(transparent||max<235)){saturation+=max?(max-min)/max:0;count++;}}
  const colourful=count>0&&saturation/count>.28;
  let minX=width,minY=height,maxX=-1,maxY=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=(y*width+x)*4,r=px[i],g=px[i+1],b=px[i+2];
   let alpha=px[i+3];
   if(!transparent){const ink=colourful?Math.max(255-r,255-g,255-b):255-(.2126*r+.7152*g+.0722*b);alpha=Math.max(0,Math.min(255,(ink-14)*1.08));}
   if(colourful&&!transparent&&alpha>0){const k=alpha/255;px[i]=Math.max(0,Math.min(255,Math.round((r-255*(1-k))/k)));px[i+1]=Math.max(0,Math.min(255,Math.round((g-255*(1-k))/k)));px[i+2]=Math.max(0,Math.min(255,Math.round((b-255*(1-k))/k)));}
   else if(!colourful){px[i]=px[i+1]=px[i+2]=0;}
   px[i+3]=alpha;
   if(alpha>24){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
  }
  context.putImageData(data,0,0);
  if(maxX<0)return null;
  const pad=2;minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(width-1,maxX+pad);maxY=Math.min(height-1,maxY+pad);
  const out=el('canvas');out.width=maxX-minX+1;out.height=maxY-minY+1;out.getContext('2d').drawImage(canvas,minX,minY,out.width,out.height,0,0,out.width,out.height);
  return {src:out.toDataURL('image/png'),ratio:out.width/out.height,colourful};
 })().catch(()=>null);
 inks.set(url,promise);return promise;
}
// Same visual weight for a "42" mark and a long lockup: equal ink area, within the box.
function logoHeight(ratio,boxRatio,area=.2,max=.42){const h=Math.sqrt(area/ratio);return Math.max(.22,Math.min(max,h,(boxRatio/ratio)*.95));}
async function logoNode(campusId,{boxRatio=1.3,area=.2,max=.42}={}){
 const url=await logoURL(campusId),ink=url&&await inkLogo(url);
 if(!ink)return null;
 const h=logoHeight(ink.ratio,boxRatio,area,max);
 if(ink.colourful){const image=el('img','arc-logo-img');image.src=ink.src;image.alt='';image.style.setProperty('--logo-h',(h*100).toFixed(1)+'%');image.style.setProperty('--logo-k',Math.sqrt(1/ink.ratio).toFixed(3));image.style.aspectRatio=ink.ratio.toFixed(3);return image;}
 const span=el('span','arc-logo');span.style.setProperty('--logo',`url("${ink.src}")`);span.style.setProperty('--logo-ratio',ink.ratio.toFixed(3));span.style.setProperty('--logo-h',(h*100).toFixed(1)+'%');
 // Equal ink area in the hero: a lone "42" stands taller than a long lockup.
 span.style.setProperty('--logo-k',Math.sqrt(1/ink.ratio).toFixed(3));
 return span;
}

/* ------------------------------------------------------------------ stickers */
let uid=0;
function shapeFor(item){
 if(item.kind==='world')return SHAPES.world;
 if(item.kind==='continent')return SHAPES.continents?.[item.id];
 if(item.kind==='country')return SHAPES.countries?.[item.id];
 return null;
}
const dims=shape=>shape.viewBox.trim().split(/[\s,]+/).map(Number);
function sticker(item){
 const shape=shapeFor(item);if(!shape)return null;
 const id='arc'+(++uid),[,,W,H]=dims(shape),M=Math.max(W,H),edge=M*.034,pad=edge*1.2;
 const box=[-pad,-pad,W+2*pad,H+2*pad].map(value=>+value.toFixed(1)).join(' ');
 const country=item.kind==='country'?countryById.get(item.id):null;
 let inner;
 if(country){const k=Math.max(W/640,H/480),fw=640*k,fh=480*k;inner=`<image class="arc-flag" href="${flagURL(country.iso2)}" data-fallback="${flagFallback(country.iso2)}" x="${((W-fw)/2).toFixed(1)}" y="${((H-fh)/2).toFixed(1)}" width="${fw.toFixed(1)}" height="${fh.toFixed(1)}" preserveAspectRatio="none" clip-path="url(#${id}-c)"/>`;}
 else inner=`<path d="${shape.d}" fill="url(#${id}-g)"/>`;
 const points=pointsFor(item.kind,item.id),r=M*(item.kind==='world'?.011:.016);
 const dots=Object.values(points).map(([x,y])=>`<circle class="arc-dot" cx="${x}" cy="${y}" r="${r.toFixed(1)}" stroke-width="${(r*.55).toFixed(1)}"/>`).join('');
 const svg=`<svg class="arc-sticker" viewBox="${box}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><defs><clipPath id="${id}-c"><path d="${shape.d}"/></clipPath>`+
  `<linearGradient id="${id}-g" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" style="stop-color:var(--arc-land-a)"/><stop offset="1" style="stop-color:var(--arc-land-b)"/></linearGradient>`+
  `<linearGradient id="${id}-s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--arc-gloss)"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`+
  `<path class="arc-die" d="${shape.d}" stroke-width="${(edge*2).toFixed(1)}"/>${inner}<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id}-s)" clip-path="url(#${id}-c)"/>`+
  `<path class="arc-keyline" d="${shape.d}" stroke-width="${(M*.006).toFixed(2)}"/>${dots}</svg>`;
 return {svg,aspect:(W+2*pad)/(H+2*pad)};
}
function wireFlags(scope){
 for(const image of scope.querySelectorAll('image.arc-flag'))image.addEventListener('error',()=>{const next=image.dataset.fallback;if(next&&image.getAttribute('href')!==next)image.setAttribute('href',next);},{once:true});
}
// The country with its campuses, the current one lit: beside the address and in the strip.
function locator(campusId,className){
 const campus=campusById.get(campusId),shape=SHAPES.countries?.[campus.country];if(!shape)return null;
 const points=pointsFor('country',campus.country),[,,W,H]=dims(shape),M=Math.max(W,H),r=M*.03;
 const others=Object.entries(points).filter(([id])=>id!==campusId).map(([,p])=>`<circle class="arc-loc-dot" cx="${p[0]}" cy="${p[1]}" r="${(r*.8).toFixed(1)}"/>`).join('');
 const [x,y]=points[campusId]||[W/2,H/2];
 const wrap=document.createElementNS('http://www.w3.org/2000/svg','svg');
 wrap.setAttribute('class',className);wrap.setAttribute('viewBox',shape.viewBox);wrap.setAttribute('aria-hidden','true');wrap.setAttribute('focusable','false');
 wrap.innerHTML=`<path class="arc-loc-land" d="${shape.d}"/>${others}<circle class="arc-loc-halo" cx="${x}" cy="${y}" r="${(r*3.2).toFixed(1)}"/><circle class="arc-loc-here" cx="${x}" cy="${y}" r="${(r*1.3).toFixed(1)}" stroke-width="${(r*.6).toFixed(1)}"/>`;
 return wrap;
}

/* ------------------------------------------------------------------ navigation state (version B's rules) */
const PRESETS={
 l1:{scope:{level:'world'},list:null,cursor:'europe'},
 l2:{scope:{level:'continent',continent:'europe'},list:null,cursor:'FRA'},
 l3:{scope:{level:'country',country:'FRA'},list:null,cursor:'paris'},
 paris:{scope:{level:'campus',campus:'paris'},list:null,cursor:null},
 lyon:{scope:{level:'campus',campus:'lyon'},list:null,cursor:null},
 mulhouse:{scope:{level:'campus',campus:'mulhouse'},list:null,cursor:null},
 world:{scope:{level:'world'},list:'countries',cursor:'FRA'},
};
const preset=PRESETS[params.get('state')]||PRESETS.l1;
let nav={scope:{...preset.scope},list:preset.list,cursor:preset.cursor};
let view=null,first=true;
const stage=$('#explorer'),band=$('#arc-band'),live=$('#arc-live');

function makeView(){
 return buildExplorerView({scope:nav.scope,list:nav.list,catalog,locale:LANG,countryName,cursorId:nav.cursor});
}
function announce(text){live.textContent='';requestAnimationFrame(()=>{live.textContent=text;});}

/* ------------------------------------------------------------------ frame (header, scope bar, dock) */
function paintFrame(){
 for(const node of document.querySelectorAll('[data-frame-copy]'))node.textContent=T.frame[node.dataset.frameCopy];
 $('#main-nav').setAttribute('aria-label',T.frame.nav);
 $('.dock-search-toggle').setAttribute('aria-label',T.frame.search);$('.dock-search-toggle').title=T.frame.search;
 $('#random-campus').setAttribute('aria-label',T.frame.random);$('#random-campus').title=T.frame.random;
 $('#profile').setAttribute('aria-label',T.frame.account);$('#profile').title=T.frame.account;
 $('#scope-back').setAttribute('aria-label',T.frame.back);$('#reset').setAttribute('aria-label',T.frame.reset);$('#reset').title=T.frame.reset;
 $('#scope-path').setAttribute('aria-label',T.frame.breadcrumb);
 $('#arc-title').textContent=T.title;
 placeIndicator();
}
function placeIndicator(){
 const indicator=$('.nav-indicator'),current=$('#main-nav [aria-current=page]');if(!indicator||!current)return;
 indicator.style.width=current.offsetWidth+'px';indicator.style.height=current.offsetHeight+'px';indicator.style.transform=`translate(${current.offsetLeft}px,-50%)`;
}
function paintScope(){
 const {level}=nav.scope,bar=$('#scope-bar');bar.dataset.level=level;
 $('#scope-back').disabled=level==='world'&&nav.list!=='countries';
 const campus=level==='campus'?campusById.get(nav.scope.campus):null,country=campus?campus.country:nav.scope.country;
 const name=level==='world'?T.frame.world:level==='continent'?continentName(nav.scope.continent,LANG):level==='country'?countryName(country):campus.name;
 $('#scope-name').textContent=name;$('#scope-picker').title=name;$('#scope-picker').setAttribute('aria-label',`${name} · ${T.frame.choosePlace}`);
 $('#scope-country-item').hidden=!campus;$('#scope-country-name').textContent=campus?countryName(country):'';
 const status=$('#globe-status');status.hidden=Boolean(campus);
 const places=level==='continent'?catalog.campuses.filter(c=>continentOfCountry(c.country)===nav.scope.continent):level==='country'?catalog.campuses.filter(c=>c.country===country):null;
 const countries=level==='continent'?catalog.countries.filter(c=>continentOfCountry(c.id)===nav.scope.continent).length:level==='country'?undefined:catalog.countries.length;
 $('#globe-hint').textContent=countLabel(places?{campuses:places.length,countries}:{campuses:catalog.campuses.length,countries},LANG);
}

/* ------------------------------------------------------------------ level path */
function pathNode(step,position){
 const list=el('ol','arc-path');list.setAttribute('aria-label',fill(T.progress,{i:Math.min(step,3),word:T.steps[Math.min(step,3)-1]}));
 T.steps.forEach((word,index)=>{
  const state=index+1<step?'done':index+1===step?'current':'next';
  const item=el('li');item.dataset.step=state;
  const pip=el('span','arc-pip');if(state==='done')pip.append(icon('check'));else pip.textContent=String(index+1);
  item.append(pip,el('span','',word));
  if(state==='current'&&position){const count=el('span','arc-path-count',position);count.dir='ltr';item.append(count);}
  list.append(item);
 });
 return list;
}

/* ------------------------------------------------------------------ levels 1-3 */
let level=null;
async function renderLevel(){
 view=makeView();nav.cursor=view.cursorId;
 const items=view.items,step=view.depth,index=items.findIndex(item=>item.id===nav.cursor);
 const wrap=el('div','arc-level');wrap.dataset.level=view.level;
 const scene=el('div','arc-scene');
 const beam=el('div','arc-beam');beam.setAttribute('aria-hidden','true');
 const aura=el('div','arc-aura');aura.setAttribute('aria-hidden','true');
 const pedestal=el('div','arc-pedestal');pedestal.setAttribute('aria-hidden','true');pedestal.append(el('span','arc-plate'),el('span','arc-ring'));
 const track=el('div','arc-track');track.setAttribute('role','group');track.setAttribute('aria-roledescription',T.carousel);
 track.setAttribute('aria-label',`${T.steps[Math.min(step,3)-1]}${view.parent?' · '+view.parent.name:''}`);
 const nodes=new Map();
 await Promise.all(items.map(async(item,order)=>{
  const button=el('button','arc-item');button.type='button';button.dataset.id=item.id;button.dataset.kind=item.kind;button.style.setProperty('--arc-order',String(order));button.style.setProperty('--arc-phase',String((order*0.37)%1.6));
  const float=el('span','arc-float');
  if(item.kind==='campus'){
   const wrapLogo=el('span','arc-logo-wrap'),logo=await logoNode(item.id);if(logo)wrapLogo.append(logo);
   const name=el('span','arc-campus-name'),bdi=el('bdi','',item.name);bdi.dir='ltr';const mini=locator(item.id,'arc-mini');if(mini)name.append(mini);name.append(bdi);
   float.append(wrapLogo,name);
  }else{
   const art=sticker(item);
   if(art){float.insertAdjacentHTML('beforeend',art.svg);const hFrac=Math.min(1,1/art.aspect);float.style.setProperty('--label-y',(100-hFrac*45).toFixed(1)+'%');}
   const name=el('span','arc-name',item.name);name.dir='auto';name.setAttribute('aria-hidden','true');float.append(name);
  }
  button.append(float);
  button.addEventListener('click',()=>{if(button.dataset.d==='0')validate();else moveTo(item.id,{focus:true});});
  nodes.set(item.id,button);
 }));
 items.forEach(item=>track.append(nodes.get(item.id)));
 wireFlags(track);
 const prev=el('button','arc-nav');prev.type='button';prev.dataset.dir='prev';prev.append(icon('chev-l'));prev.setAttribute('aria-label',T.previous);
 const next=el('button','arc-nav');next.type='button';next.dataset.dir='next';next.append(icon('chev-r'));next.setAttribute('aria-label',T.next);
 prev.addEventListener('click',()=>step1(-1));next.addEventListener('click',()=>step1(1));
 scene.append(aura,beam,pedestal,track,prev,next);
 const foot=el('div','arc-foot');
 const count=el('p','arc-count');
 const go=el('button','arc-go');go.type='button';
 const goLabel=el('span','',T.select),goName=el('span','sr-only'),kbd=el('kbd','arc-kbd',T.enter);kbd.setAttribute('aria-hidden','true');
 go.append(goLabel,goName,kbd);go.addEventListener('click',()=>validate());
 const hint=el('p','arc-hint');
 const keys=el('span','arc-hint-keys');
 const pair=(caps,words)=>{const span=el('span');caps.forEach(cap=>{const k=el('kbd','arc-kbd',cap);k.setAttribute('aria-hidden','true');span.append(k);});span.append(document.createTextNode(words));return span;};
 keys.append(pair(RTL?['→','←']:['←','→'],T.choose),pair([T.enter],T.validate),pair([T.esc],T.goBack));
 const touch=el('span','arc-hint-touch',T.touch);
 hint.append(keys,touch);
 // On narrow screens the arrows sit beside the action, like a pad; only one pair is ever displayed.
 const padPrev=el('button','arc-nav arc-nav-pad');padPrev.type='button';padPrev.dataset.dir='prev';padPrev.append(icon('chev-l'));padPrev.setAttribute('aria-label',T.previous);
 const padNext=el('button','arc-nav arc-nav-pad');padNext.type='button';padNext.dataset.dir='next';padNext.append(icon('chev-r'));padNext.setAttribute('aria-label',T.next);
 padPrev.addEventListener('click',()=>step1(-1));padNext.addEventListener('click',()=>step1(1));
 const actionRow=el('div','arc-action-row');actionRow.append(padPrev,go,padNext);
 foot.append(count,actionRow,hint);
 wrap.append(scene,foot);
 level={wrap,scene,track,nodes,prev,next,padPrev,padNext,count,go,goName,items};
 band.replaceChildren(pathNode(step,`${index+1}/${items.length}`),wrap);
 stage.dataset.view=view.level;
 paintCursor(false);
}
function paintCursor(animate=true){
 if(!level)return;
 const items=level.items,index=items.findIndex(item=>item.id===nav.cursor),total=items.length;
 items.forEach((item,position)=>{
  const node=level.nodes.get(item.id),d=position-index;
  node.dataset.d=String(Math.max(-3,Math.min(3,d)));
  if(Math.abs(d)>3)node.dataset.far='';else delete node.dataset.far;
  node.tabIndex=d===0?0:-1;
  const label=[item.ariaLabel||item.name,fill(T.position,{i:position+1,n:total})];
  node.setAttribute('aria-label',label.join(' · '));
 });
 const current=items[index];
 level.count.textContent=current.kind==='campus'?'':current.countText||'';
 level.count.hidden=current.kind==='campus';
 level.goName.textContent=' '+current.name;
 level.go.setAttribute('aria-label',fill(T.selectName,{name:current.name}));
 for(const button of [level.prev,level.padPrev])button.setAttribute('aria-disabled',String(index<=0));
 for(const button of [level.next,level.padNext])button.setAttribute('aria-disabled',String(index>=total-1));
 const counter=band.querySelector('.arc-path-count');if(counter)counter.textContent=`${index+1}/${total}`;
 if(animate&&!reduceMotion.matches){level.scene.removeAttribute('data-landed');void level.scene.offsetWidth;level.scene.dataset.landed='';}
}
function moveTo(id,{focus=false}={}){
 if(!level||id===nav.cursor)return;
 nav.cursor=id;paintCursor();
 const item=level.items.find(entry=>entry.id===id);
 announce([item.name,item.kind==='campus'?'':item.countText,fill(T.position,{i:level.items.indexOf(item)+1,n:level.items.length})].filter(Boolean).join(' · '));
 if(focus||level.track.contains(document.activeElement))level.nodes.get(id).focus({preventScroll:true});
}
function step1(direction){
 if(!level)return;
 const index=level.items.findIndex(item=>item.id===nav.cursor),next=level.items[index+direction];
 if(next)moveTo(next.id,{focus:level.track.contains(document.activeElement)});
}
function onKeys(event){
 const forward=RTL?'ArrowLeft':'ArrowRight',backward=RTL?'ArrowRight':'ArrowLeft';
 if(event.key===forward){event.preventDefault();step1(1);}
 else if(event.key===backward){event.preventDefault();step1(-1);}
 else if(event.key==='Home'){event.preventDefault();moveTo(level.items[0].id,{focus:true});}
 else if(event.key==='End'){event.preventDefault();moveTo(level.items.at(-1).id,{focus:true});}
}

/* ------------------------------------------------------------------ validate / ascend */
let busy=false,settledAt=0;
// As in version B: an activation landing within 350 ms of a new level belongs to the gesture that opened it.
async function validate(){
 if(busy||!level||performance.now()-settledAt<350)return;
 const item=level.items.find(entry=>entry.id===nav.cursor);if(!item)return;
 busy=true;
 if(!reduceMotion.matches){stage.dataset.validating='';await new Promise(resolve=>setTimeout(resolve,240));}
 if(item.kind==='world')nav={scope:{level:'world'},list:'countries',cursor:null};
 else if(item.kind==='continent')nav={scope:{level:'continent',continent:item.id},list:null,cursor:null};
 else if(item.kind==='country')nav={scope:{level:'country',country:item.id},list:null,cursor:null,via:nav.list};
 else if(item.kind==='campus')nav={scope:{level:'campus',campus:item.id},list:null,cursor:null,via:nav.via};
 delete stage.dataset.validating;
 await render({enter:true,focus:true});
 announce(item.kind==='campus'?fill(T.opened,{name:item.name}):fill(T.chosen,{name:item.name,count:item.countText||''}));
 busy=false;
}
async function ascend(){
 if(busy)return;
 const {scope}=nav;
 if(scope.level==='campus'){const campus=campusById.get(scope.campus);nav={scope:{level:'country',country:campus.country},list:null,cursor:campus.id,via:nav.via};}
 else if(scope.level==='country'){nav=nav.via==='countries'?{scope:{level:'world'},list:'countries',cursor:scope.country}:{scope:{level:'continent',continent:continentOfCountry(scope.country)},list:null,cursor:scope.country};}
 else if(scope.level==='continent')nav={scope:{level:'world'},list:null,cursor:scope.continent};
 else if(nav.list==='countries')nav={scope:{level:'world'},list:null,cursor:'world'};
 else return;
 await render({enter:true,focus:true});
 const node=level?.nodes.get(nav.cursor);if(node)announce(node.getAttribute('aria-label'));
}

/* ------------------------------------------------------------------ campus sheet: the level details */
const dateText=(value,options)=>{
 if(typeof value!=='string'||!/^\d{4}(-\d{2})?(-\d{2})?$/.test(value))return '';
 const [y,m=1,d=1]=value.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));
 const precision=value.length===10?'day':value.length===7?'month':'year';
 return new Intl.DateTimeFormat(LANG,options||{year:'numeric',...(precision!=='year'?{month:'long'}:{}),...(precision==='day'?{day:'numeric'}:{}),timeZone:'UTC'}).format(date);
};
const local=(value)=>typeof value==='string'?value:value?.[LANG]||value?.fr||value?.en||'';
function external(className,href,label){const a=el('a',className,label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',`${label}. ${T.newTab}`);return a;}
function group(kind,iconName,title){
 const section=el('section','arc-group');section.dataset.group=kind;
 const sign=el('span','arc-sign');sign.append(icon(iconName));sign.setAttribute('aria-hidden','true');
 const heading=el('h3','',title),body=el('div','arc-group-body');
 section.append(sign,heading,body);return {section,body};
}
async function renderSheet(){
 const campus=campusById.get(nav.scope.campus),profile=profiles.campuses?.[campus.id]||{},web=websites.campuses?.[campus.id];
 const country=countryById.get(campus.country);
 view={level:'campus'};
 const sheet=el('div','arc-sheet'),body=el('div','arc-sheet-body');
 // Hero: the validated logo, enlarged on the pedestal, with its name, country and opening date.
 const hero=el('header','arc-hero'),scene=el('div','arc-hero-scene');
 const beam=el('div','arc-beam');beam.setAttribute('aria-hidden','true');
 const pedestal=el('div','arc-pedestal');pedestal.setAttribute('aria-hidden','true');pedestal.append(el('span','arc-plate'),el('span','arc-ring'));
 const logoHolder=el('div','arc-hero-logo'),logo=await logoNode(campus.id,{boxRatio:2.6,area:.66,max:.86});if(logo)logoHolder.append(logo);
 const aura=el('div','arc-aura');aura.setAttribute('aria-hidden','true');
 scene.append(aura,beam,pedestal,logoHolder);
 const title=el('h2','arc-hero-name');title.tabIndex=-1;const bdi=el('bdi','',campus.name);bdi.dir='ltr';title.append(bdi);
 const meta=el('p','arc-hero-meta');
 const chip=el('span','arc-flag-chip'),flag=el('img');flag.src=flagURL(country.iso2);flag.alt='';flag.addEventListener('error',()=>{flag.src=flagFallback(country.iso2);},{once:true});chip.append(flag,document.createTextNode(countryName(country.id)));meta.append(chip);
 const opened=local(profile.openedLabel)||dateText(profile.openedOn);
 if(opened){const since=el('span','arc-since');since.append(icon('spark'),document.createTextNode(fill(T.since,{date:opened})));meta.append(since);}
 hero.append(scene,title,meta);
 const websiteURL=web?.url||campus.sourceUrl;
 if(websiteURL){const link=external('arc-pill',websiteURL,web?.kind==='campus-site'||web?.url?T.website:T.profile);link.dataset.primary='';link.textContent='';link.append(el('span','',web?.url?T.website:T.profile),icon('out'));hero.append(link);}

 // Start HUD: where it is and how to reach it.
 const start=el('div','arc-hud');start.dataset.side='start';
 const address=group('address','pin',T.address);
 // The address keeps the page's direction (aligned to its start) and isolates its own Latin order.
 const addressText=el('address'),addressBidi=el('bdi','',(campus.address||'').trim());addressBidi.dir='auto';addressText.append(addressBidi);address.body.append(addressText);
 const actions=el('div','arc-actions'),copy=el('button','arc-pill arc-pill-small');copy.type='button';copy.append(icon('copy'),el('span','',T.copyAddress));
 const copyStatus=el('p','arc-note');copyStatus.setAttribute('role','status');copyStatus.setAttribute('aria-live','polite');
 copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(campus.address);copyStatus.textContent=T.copied;}catch{copyStatus.textContent=T.copyError;}});
 const directionsURL=new URL('https://www.google.com/maps/dir/');directionsURL.searchParams.set('api','1');directionsURL.searchParams.set('destination',campus.name+', '+String(campus.address||'').replace(/\s+/g,' '));
 const directions=external('arc-pill arc-pill-small',directionsURL.href,T.directions);directions.textContent='';directions.append(icon('route'),el('span','',T.directions));directions.setAttribute('aria-label',`${T.directionsLabel}. ${T.newTab}`);
 actions.append(copy,directions);address.body.append(actions,copyStatus);
 start.append(address.section);
 const contacts=(Array.isArray(profile.contacts)?profile.contacts:[]).filter(contact=>local(contact.value));
 if(contacts.length){
  const g=group('contacts','mail',T.contacts),list=el('ul','arc-contacts');
  for(const contact of contacts){const li=el('li');li.append(el('span','',local(contact.label)));const a=el('a','',local(contact.value));a.href=contact.href;a.dir='ltr';if(/^https?:/.test(contact.href)){a.target='_blank';a.rel='noopener noreferrer';}li.append(a);list.append(li);}
  g.body.append(list);if(profile.contactSourceUrl)g.body.append(external('arc-source',profile.contactSourceUrl,T.source));
  start.append(g.section);
 }

 // End HUD: figures and the next Piscines.
 const end=el('div','arc-hud');end.dataset.side='end';
 const stats=['students','cohorts','alumni'].map(key=>({key,stat:profile.stats?.[key]}));
 const anyStat=stats.some(({stat})=>stat&&(typeof stat.value==='number'||String(stat.value||'').trim()));
 if(anyStat){
  const g=group('stats','chart',T.stats),dl=el('dl','arc-stats');
  // Known figures first and large; the missing ones keep their dash, smaller, as the sheet's rule says.
  const ordered=[...stats].sort((a,b)=>Number(Boolean(b.stat))-Number(Boolean(a.stat)));
  for(const {key,stat}of ordered){
   const available=stat&&(typeof stat.value==='number'||String(stat.value||'').trim());
   const cell=el('div');cell.dataset.available=String(Boolean(available));
   const dd=el('dd'),value=el('bdi','',available?(typeof stat.value==='number'?number.format(stat.value):String(stat.value)):'—');value.dir='ltr';dd.append(value);
   const dt=el('dt','',T[key]);if(available&&stat.asOf){const year=el('small','',' · '+dateText(stat.asOf));dt.append(year);}
   cell.append(dt,dd);
   dl.append(cell);
  }
  g.body.append(dl);
  if(stats.some(({stat})=>!stat))g.body.append(el('p','arc-note',T.missingStats));
  const source=stats.find(({stat})=>stat?.sourceUrl)?.stat.sourceUrl;if(source)g.body.append(external('arc-source',source,T.source));
  end.append(g.section);
 }
 const today=Date.UTC(2026,9,24);
 const piscines=(Array.isArray(profile.piscines)?profile.piscines:[]).filter(item=>Date.parse((item.endsOn||item.startsOn)+'T00:00:00Z')>=today).sort((a,b)=>a.startsOn.localeCompare(b.startsOn));
 const pg=group('piscines','wave',T.piscines);
 if(piscines.length){
  const list=el('ul','arc-piscines');
  for(const item of piscines){
   const li=el('li'),leaf=el('span','arc-leaf');leaf.setAttribute('aria-hidden','true');
   leaf.append(el('b','',dateText(item.startsOn,{month:'short',timeZone:'UTC'}).replace('.','')),el('span','',dateText(item.startsOn,{day:'numeric',timeZone:'UTC'})));
   const text=el('div');text.append(el('strong','',local(item.label)),el('p','',dateRange(item.startsOn,item.endsOn)));
   li.append(leaf,text);list.append(li);
  }
  pg.body.append(list);
 }else pg.body.append(el('p','',T.checkDates));
 const note=local(profile.piscinesNote);if(note)pg.body.append(el('p','arc-note',note));
 const datesURL=profile.piscineSourceUrl||(!piscines.length?websiteURL:null);
 if(datesURL){const link=external('arc-source',datesURL,T.officialDates);link.style.display='inline-block';link.style.marginTop='6px';pg.body.append(link);}
 end.append(pg.section);

 // Centre: postcards when there are photos, a kind sentence when the campus has shared little.
 const more=el('div','arc-more');
 const photos=(Array.isArray(profile.photos)?profile.photos:[]).map(photo=>({...photo,src:new URL(photo.src,SITE).href}));
 // A postcard from the campus: its photos as polaroids, the map of the country stuck on as a stamp. Without photos,
 // the stamp becomes the card itself, so a sparse campus still has its picture.
 more.append(photos.length?polaroids(photos,campus):mapCard(campus));
 const sparse=!photos.length&&!contacts.length&&!anyStat;
 if(sparse){
  const g=group('sparse','spark',T.later);g.body.append(el('p','',T.sparse),el('p','arc-note',T.sparseMore));
  end.append(g.section);
 }
 body.append(hero,start,end,more);
 if(profile.verifiedAt){const verified=el('p','arc-verified',T.verified);const time=el('time','',dateText(profile.verifiedAt));time.dateTime=profile.verifiedAt;verified.append(time);end.append(verified);}

 // Siblings: the other campuses of the country, to switch without going back.
 const siblings=el('nav','arc-siblings');siblings.setAttribute('aria-label',fill(T.siblings,{country:countryName(country.id)}));
 const label=el('span','arc-siblings-label',countryName(country.id));label.setAttribute('aria-hidden','true');siblings.append(label);
 const names=new Intl.Collator(LANG);
 for(const other of catalog.campuses.filter(c=>c.country===campus.country).sort((a,b)=>names.compare(a.name,b.name))){
  const button=el('button','arc-sibling');button.type='button';button.append(el('i'));const b=el('bdi','',other.name);b.dir='ltr';button.append(b);
  if(other.id===campus.id)button.setAttribute('aria-current','true');
  button.addEventListener('click',async()=>{if(other.id===nav.scope.campus)return;nav={scope:{level:'campus',campus:other.id},list:null,cursor:null,via:nav.via};await render({enter:true,focus:true});announce(fill(T.opened,{name:other.name}));});
  siblings.append(button);
 }
 sheet.append(body,siblings);
 band.replaceChildren(pathNode(4),sheet);
 stage.dataset.view='campus';
 level=null;
 // Centre the current campus in the strip without scrolling anything else (scrollIntoView would move the sheet).
 requestAnimationFrame(()=>{const chip=siblings.querySelector('[aria-current=true]');if(!chip)return;const a=chip.getBoundingClientRect(),b=siblings.getBoundingClientRect();siblings.scrollLeft+=a.left+a.width/2-(b.left+b.width/2);});
 return title;
}
function dateRange(start,end){
 const at=value=>{const [y,m,d]=value.split('-').map(Number);return new Date(Date.UTC(y,m-1,d));};
 const format=new Intl.DateTimeFormat(LANG,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
 return end?format.formatRange(at(start),at(end)):format.format(at(start));
}
// A postage stamp: perforated paper (scallops cut by a mask), a thin pink frame, the country with the campus lit.
function stamp(campus){
 const holder=el('span','arc-stamp');holder.setAttribute('aria-hidden','true');
 const id='arc'+(++uid),W=68,H=80,step=8,r=2.6;let holes='';
 for(let x=step/2;x<W;x+=step)holes+=`<circle cx="${x}" cy="0" r="${r}"/><circle cx="${x}" cy="${H}" r="${r}"/>`;
 for(let y=step/2;y<H;y+=step)holes+=`<circle cx="0" cy="${y}" r="${r}"/><circle cx="${W}" cy="${y}" r="${r}"/>`;
 holder.innerHTML=`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false"><defs><mask id="${id}"><rect width="${W}" height="${H}" fill="#fff"/><g fill="#000">${holes}</g></mask></defs>`+
  `<rect class="arc-stamp-paper" width="${W}" height="${H}" mask="url(#${id})"/><rect class="arc-stamp-frame" x="6.5" y="6.5" width="${W-13}" height="${H-13}" rx="1.5"/></svg>`;
 const map=locator(campus.id,'arc-stamp-map');if(map)holder.append(map);
 return holder;
}
function mapCard(campus){
 const holder=el('div','arc-photos arc-photos-map'),stack=el('div','arc-polaroids');
 const figure=el('figure','arc-polaroid');figure.dataset.front='';figure.dataset.map='';
 const map=locator(campus.id,'arc-card-map');if(map)figure.append(map);
 const caption=el('figcaption');const city=el('span');const b=el('bdi','',campus.name);b.dir='ltr';city.append(b);caption.append(city,el('span','',T.noPhotos));figure.append(caption);
 stack.append(figure);holder.append(stack);return holder;
}
function polaroids(photos,campus){
 const holder=el('div','arc-photos'),stack=el('div','arc-polaroids');
 let index=0;
 const frame=(photo,role)=>{
  const figure=el('figure','arc-polaroid');figure.dataset[role]='';
  const open=el('a','arc-photo-open');open.href=photo.src;open.target='_blank';open.rel='noopener noreferrer';open.setAttribute('aria-label',`${T.enlarge} : ${local(photo.alt)}`);
  const image=el('img');image.src=photo.src;image.alt=local(photo.alt);image.decoding='async';open.append(image);figure.append(open);
  const caption=el('figcaption');caption.append(el('span','',local(photo.credit)));if(photo.sourceUrl)caption.append(external('',photo.sourceUrl,T.source));figure.append(caption);
  if(role==='back'){figure.setAttribute('aria-hidden','true');open.tabIndex=-1;caption.querySelector('a')?.setAttribute('tabindex','-1');}
  return figure;
 };
 const paint=()=>{stack.replaceChildren(...(photos.length>1?[frame(photos[(index+1)%photos.length],'back')]:[]),frame(photos[index],'front'));status.textContent=`${number.format(index+1)} / ${number.format(photos.length)}`;};
 const controls=el('div','arc-photo-controls'),status=el('span');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 if(photos.length>1){
  const prev=el('button','arc-round');prev.type='button';prev.append(icon('chev-l'));prev.setAttribute('aria-label',T.previousPhoto);prev.addEventListener('click',()=>{index=(index-1+photos.length)%photos.length;paint();});
  const next=el('button','arc-round');next.type='button';next.append(icon('chev-r'));next.setAttribute('aria-label',T.nextPhoto);next.addEventListener('click',()=>{index=(index+1)%photos.length;paint();});
  controls.append(prev,status,next);
 }
 paint();
 holder.append(stack,stamp(campus));if(photos.length>1)holder.append(controls);
 return holder;
}

/* ------------------------------------------------------------------ render */
async function render({enter=false,focus=false}={}){
 paintScope();
 let target=null;
 if(nav.scope.level==='campus')target=await renderSheet();
 else{await renderLevel();target=level?.nodes.get(nav.cursor);}
 bandMeasure?.measure();settledAt=performance.now();
 if(enter&&!reduceMotion.matches){stage.dataset.entering='';clearTimeout(render.timer);render.timer=setTimeout(()=>delete stage.dataset.entering,1100);}
 if(focus&&target)target.focus({preventScroll:true});
 const url=new URL(location.href);
 const key=Object.entries(PRESETS).find(([,p])=>JSON.stringify(p.scope)===JSON.stringify(nav.scope)&&p.list===nav.list)?.[0];
 if(key&&!first){url.searchParams.set('state',key);history.replaceState(null,'',url);}
 first=false;
}

// Keys act on the selector while the focus is on the page or inside the stage, never inside other controls.
document.addEventListener('keydown',event=>{
 const active=document.activeElement,free=!active||active===document.body||Boolean(active.closest?.('.arc'));
 if(!free||event.altKey||event.ctrlKey||event.metaKey)return;
 if(event.key==='Escape'){event.preventDefault();ascend();return;}
 if(!level)return;
 if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)&&(active===document.body||active.closest?.('.arc-level'))){onKeys(event);return;}
 if(event.key==='Enter'&&active===document.body){event.preventDefault();validate();}
});
$('#scope-back').addEventListener('click',()=>ascend());
$('#reset').addEventListener('click',()=>{nav={scope:{level:'world'},list:null,cursor:'world'};render({enter:true});});

/* ------------------------------------------------------------------ study switcher */
function switcher(){
 const groups={state:[['l1','L1 · Monde'],['l2','L2 · Europe'],['l3','L3 · France'],['paris','42 Paris'],['lyon','42 Lyon'],['mulhouse','42 Mulhouse']],theme:[['light','Clair'],['dark','Sombre']],lang:[['fr','FR'],['en','EN'],['ar','AR']]};
 const current={state:params.get('state')||'l1',theme:root.dataset.theme,lang:LANG};
 for(const [param,options]of Object.entries(groups)){
  const row=document.querySelector(`.arc-switcher-row[data-param=${param}]`);
  for(const [value,label]of options){const url=new URL(location.href);url.searchParams.set(param,value);const a=el('a','',label);a.href=url.search;if(current[param]===value)a.setAttribute('aria-current','true');row.append(a);}
 }
 $('#arc-switcher-note').textContent=`Silhouettes : ${shapesSource==='site-b'?'site-b/explorer-shapes.mjs':'remplacement (Natural Earth, simplifié)'} · drapeaux et logos : site-b/assets. Les flèches, Entrée, Échap et les clics fonctionnent.`;
 const toggle=$('#arc-switcher-toggle'),panel=$('#arc-switcher-panel');
 toggle.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));});
}

/* ------------------------------------------------------------------ start */
let bandMeasure=null;
paintFrame();switcher();
await document.fonts.ready;
placeIndicator();
bandMeasure=createExplorerBand({stage,app:$('#app'),
 getTopElements:()=>[$('#globe-status'),$('#scope-bar')].filter(node=>node&&!node.hidden),
 getBottomElements:()=>[$('#about'),$('.dock-search-toggle'),$('#random-campus')]});
await render();
addEventListener('resize',()=>{placeIndicator();bandMeasure?.measure();});
stage.dataset.state='ready';
// Captures wait for the flags, logos and photos actually painted.
const pending=[...document.querySelectorAll('.arc img')].map(image=>image.complete?null:image.decode().catch(()=>{}));
const flags=[...document.querySelectorAll('.arc image')].map(image=>new Promise(resolve=>{const done=()=>resolve();image.addEventListener('load',done,{once:true});image.addEventListener('error',done,{once:true});setTimeout(done,2500);}));
await Promise.all([...pending,...flags]);
await new Promise(resolve=>setTimeout(resolve,120));
root.dataset.ready='true';
