/* Trial « Le chemin en étapes » of the version B filter study (26 Oct 2026). It stands in for the copy's
 * scope-pill.mjs through the study's import map (essais/styles.js), so the copy's controller calls this fit() at its
 * usual moments: after every filter change (updateScope), on a language, form or reading change, a resize and the fonts.
 *
 * The pill shows the whole path: the chosen steps in the text colour, the steps still to choose as muted placeholders
 * (« Monde › Continent › Pays › Campus », « Europe › Pays › Campus », « Europe › France › Campus », « Europe › France ›
 * 42 Paris »). Its width is the longest full path over every indication, in the current language, measured on invisible
 * copies of the live pill as the copy does, and its height the tallest. Where that path cannot fit (phones) or in the
 * copy's compact form, a short form shows the current step and the next placeholder (« France › Campus »), with the
 * size of the largest short form. The steps are centred on the pill's middle; a path too long for that starts right
 * after the globe's seat. styles.css centres the pill itself on the page's axis. */
import {CONTINENTS,continentName,continentOfCountry} from '../../baseline/continents.mjs?v=b1';

/** Every indication the pill can show, as {name, crumb}: unchanged from the copy (welcome.mjs imports it). Pure. */
export function scopeIndications({world,continents=[],countries=[],campuses=[]}){
 return [{name:world},...continents.map(name=>({name})),...countries.map(name=>({name})),...campuses.map(({name,country})=>({name,crumb:country}))]
  .filter(item=>item.name);
}

// The steps still to choose. « Pays », « Campus » and their English and Arabic forms are the field labels of the pill's
// own chooser (scope-selectors.mjs); the copy has no word for a continent: « Continent » and « القارة » are new.
const WORDS=Object.freeze({
 fr:Object.freeze({continent:'Continent',country:'Pays',campus:'Campus'}),
 en:Object.freeze({continent:'Continent',country:'Country',campus:'Campus'}),
 ar:Object.freeze({continent:'القارة',country:'الدولة',campus:'الفرع'}),
});
// The steps still to choose after each level, in the path's order.
const PENDING=Object.freeze({world:['continent','country','campus'],continent:['country','campus'],country:['campus'],campus:[]});
const LEVELS=Object.keys(PENDING);
const words=lang=>WORDS[lang]||WORDS.fr;
// One path, as the measures and the live filter name it.
const pathKey=({level,name,crumb})=>JSON.stringify([level,name||'',crumb||'']);

// The continent of a country or a campus comes from the copy's own catalogue file (same address as welcome.mjs) and
// continents.mjs. Started when the module loads, before welcome.mjs asks for the same file.
let catalogue=null;
const catalogueReady=fetch(new URL('./campuses.json',document.baseURI))
 .then(response=>response.ok?response.json():Promise.reject(new Error(`campuses.json: ${response.status}`)))
 .then(data=>{catalogue=data;return data;},error=>{console.warn('[essai chemin-en-etapes]',error);return null;});

// Per language: the continent's name for each country name and campus name the copy writes in the pill. Country
// names are localized exactly as the copy does (welcome.mjs countryName()).
const lookups=new Map();
function lookupFor(lang){
 if(!catalogue)return null;
 if(lookups.has(lang))return lookups.get(lang);
 let regions=null;
 try{regions=new Intl.DisplayNames(lang,{type:'region'});}catch{/* The catalogue's English names stay. */}
 const countryById=new Map(catalogue.countries.map(country=>[country.id,country]));
 const nameOf=country=>{try{return regions?.of(country.iso2)||country.name;}catch{return country.name;}};
 const continentOf=id=>{const continent=continentOfCountry(id);return continent?continentName(continent,lang):null;};
 const country=new Map(),campus=new Map();
 for(const item of catalogue.countries){const continent=continentOf(item.id);if(continent)country.set(nameOf(item),continent);}
 for(const item of catalogue.campuses){const continent=countryById.has(item.country)&&continentOf(item.country);if(continent)campus.set(item.name,continent);}
 const lookup={country,campus};lookups.set(lang,lookup);return lookup;
}

/** Paints the trial's own steps of a trail (the live one or a measuring copy) for a path {level, continent}: the
 * continent before a country or a campus, and the placeholders still to choose; the first one is marked as the next
 * step (the only placeholder the short form shows). Writes only what changed. */
function paintSteps(line,{level,continent},lang){
 const text=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
 const hide=(node,hidden)=>{if(node.hidden!==hidden)node.hidden=hidden;};
 const ancestor=line.querySelector('.chemin-continent'),shown=Boolean(continent)&&(level==='country'||level==='campus');
 if(ancestor){hide(ancestor,!shown);text(ancestor.querySelector('.chemin-label'),shown?continent:'');}
 const pending=PENDING[level]||[],labels=words(lang);
 for(const node of line.querySelectorAll('.chemin-placeholder')){
  const index=pending.indexOf(node.dataset.step);
  hide(node,index<0);
  if(node.classList.contains('chemin-next')!==(index===0))node.classList.toggle('chemin-next',index===0);
  text(node.querySelector('.chemin-label'),labels[node.dataset.step]||'');
 }
}

/** The pill's controller, same interface as the copy's: fit() paints the steps of the live filter, measures again
 * only when the indications, the language, the form, the reading mode, the section, the viewport, the fonts or the
 * catalogue changed, centres the steps, and returns the width it set (null while there is nothing to measure).
 * measure(paths, form, lang) may be replaced: it returns one {width, height, start, trail} per path (start: from the
 * pill's starting edge to the trail; trail: the trail's width; without them the steps start after the seat). By
 * default each path is laid out once on an invisible copy of the pill. */
export function mountScopePill({app,bar,path,trail,getIndications,measure=null}){
 const doc=path.ownerDocument,win=doc.defaultView;
 let key=null,width=null,fonts=0,natural=new Map();
 const picker=trail.querySelector('.scope-picker'),name=picker?.querySelector('span');
 const back=doc.getElementById('scope-back'),countryItem=trail.querySelector('.scope-country'),current=trail.querySelector('.scope-current');
 const countryName=countryItem?.querySelector('button>span'),countryButton=countryItem?.querySelector('button');

 // The trial's steps, built once in the live trail: the continent before the country (text, like the ancestors but
 // not a button: no command exists for it today), then the three placeholders after the current step, out of the
 // accessibility tree. Each reuses the copy's separator.
 (function build(){
  const separator=trail.querySelector('.scope-separator');
  const step=className=>{
   const item=doc.createElement('li'),text=doc.createElement('span');
   item.className=`chemin-step ${className}`;item.hidden=true;text.className='chemin-label';text.dir='auto';
   return [item,text];
  };
  const [continent,continentLabel]=step('chemin-continent');
  continent.append(continentLabel);if(separator)continent.append(separator.cloneNode(true));
  trail.insertBefore(continent,countryItem||current);
  for(const pending of PENDING.world){
   const [placeholder,label]=step('chemin-placeholder');
   placeholder.dataset.step=pending;placeholder.setAttribute('aria-hidden','true');
   if(separator)placeholder.append(separator.cloneNode(true));placeholder.append(label);
   trail.append(placeholder);
  }
 })();

 // The paths the pill can show, from the copy's indications: « Monde », the continents, the countries, then each campus
 // with its country as crumb; the continent comes from the catalogue (none while it has not arrived).
 function paths(indications,lang){
  const lookup=lookupFor(lang),continents=new Set(CONTINENTS.map(continent=>continentName(continent.id,lang)));
  return indications.map((item,index)=>{
   const step=item.crumb?{level:'campus',name:item.name,crumb:item.crumb,continent:lookup?.country.get(item.crumb)||lookup?.campus.get(item.name)||null}
    :index===0?{level:'world',name:item.name}
    :continents.has(item.name)?{level:'continent',name:item.name}
    :{level:'country',name:item.name,continent:lookup?.country.get(item.name)||null};
   return {...step,key:pathKey(step)};
  });
 }
 // The live filter, as the copy wrote it.
 function live(lang){
  const level=LEVELS.includes(bar.dataset.level)?bar.dataset.level:'world',current=name?.textContent||'';
  const crumb=countryItem&&!countryItem.hidden?countryName?.textContent||'':'',lookup=lookupFor(lang);
  const continent=level==='country'?lookup?.country.get(current):level==='campus'?lookup?.country.get(crumb)||lookup?.campus.get(current):null;
  return {level,continent:continent||null,key:pathKey({level,name:current,crumb:level==='campus'?crumb:''})};
 }

 // The copies sit in the bar, so that every rule of the live pill applies to them; the picker's font size comes from
 // an id rule (design-review-selection.css), which the copies, without ids, receive inline (as in the copy). Returns
 // each copy's box: its width and height (Arabic lines are taller, from the fallback font of « Jost, sans-serif »),
 // and where its trail starts and how wide it is, to centre the live steps.
 function layout(items,form,lang){
  const box=doc.createElement('div'),size=element=>element?win.getComputedStyle(element).fontSize:'';
  const pickerSize=size(picker),nameSize=size(name),rtl=win.getComputedStyle(path).direction==='rtl';
  box.className='scope-measure chemin-measure';box.setAttribute('aria-hidden','true');box.inert=true;
  box.style.cssText='position:absolute;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
  const copies=items.map(item=>{
   const copy=path.cloneNode(false),seat=doc.createElement('span'),line=trail.cloneNode(true);
   copy.removeAttribute('id');copy.removeAttribute('aria-label');copy.removeAttribute('style');copy.style.width='max-content';copy.dataset.cheminForm=form;
   seat.className='scope-medallion';
   line.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));line.querySelectorAll('use').forEach(node=>node.remove());
   const country=line.querySelector('.scope-country'),currentPicker=line.querySelector('.scope-picker');
   if(country){country.hidden=!item.crumb;country.querySelector('button>span').textContent=item.crumb||'';}
   currentPicker.style.fontSize=pickerSize;currentPicker.querySelector('span').style.fontSize=nameSize;currentPicker.querySelector('span').textContent=item.name;
   paintSteps(line,item,lang);
   copy.append(seat,line);box.append(copy);return [copy,line];
  });
  bar.append(box);
  const boxes=copies.map(([copy,line])=>{
   const outer=copy.getBoundingClientRect(),inner=line.getBoundingClientRect();
   return {width:outer.width,height:outer.height,start:rtl?outer.right-inner.right:inner.left-outer.left,trail:inner.width};
  });
  box.remove();
  return boxes;
 }

 function measureAll(indications,lang){
  // The ← keeps its room on both sides of the pill: styles.css gives the bar, after the pill, an empty room as wide as
  // the ← (0 while reading, which drops it), so the pill's centre is the bar's centre, the page's axis.
  const backWidth=back&&win.getComputedStyle(back).display!=='none'?back.offsetWidth:0;
  if(bar.style.getPropertyValue('--chemin-back')!==backWidth+'px')bar.style.setProperty('--chemin-back',backWidth+'px');
  natural=new Map();
  const compact=app.dataset.compactScope==='true',clear=()=>{path.style.width='';path.style.minHeight='';return width=null;};
  if(!indications.length){path.dataset.cheminForm=compact?'short':'full';return clear();}
  // The widest the bar lets the pill be (its max-width, less the ← and its mirrored room).
  path.style.width='100000px';
  const room=path.getBoundingClientRect().width;
  const items=paths(indications,lang),largest=form=>{
   const boxes=(measure||layout)(items,form,lang);
   return {boxes,width:Math.max(...boxes.map(box=>box.width)),height:Math.max(...boxes.map(box=>box.height))};
  };
  let form=compact?'short':'full',size=room>0?largest(form):null;
  // The full path does not fit: the short form, the current step and the next one.
  if(size&&form==='full'&&size.width>room+.5){form='short';size=largest(form);}
  path.dataset.cheminForm=form;
  // A pill without a layout box measures nothing: it keeps its natural size and measures again at the next call.
  if(!(size?.width>0)){key=null;return clear();}
  items.forEach((item,index)=>natural.set(item.key,size.boxes[index]));
  // One width and one height for every path: the height too, since an Arabic name, unlike « 42 Paris », makes the
  // line taller (in the copy, 51 px at « العالم » and 54 px at a campus).
  width=Math.ceil(size.width-.01);
  path.style.width=width+'px';path.style.minHeight=Math.ceil(size.height-.01)+'px';
  return width;
 }

 // The steps centred on the pill's middle, so on the page's axis and over the line under the pill: the trail's
 // margin after the seat (styles.css, --chemin-shift). A path too long for that starts right after the seat; a phone
 // too narrow for the largest short form gets no margin, and only the chosen name ends with « … » (styles.css).
 function centre(step){
  const box=natural.get(step.key);
  let shift=0;
  if(width!==null&&box&&Number.isFinite(box.start)&&Number.isFinite(box.trail)){
   shift=Math.max(0,path.getBoundingClientRect().width/2-box.start-box.trail/2);
  }
  const value=shift>.005?shift.toFixed(2)+'px':'';
  if(path.style.getPropertyValue('--chemin-shift')!==value){
   if(value)path.style.setProperty('--chemin-shift',value);else path.style.removeProperty('--chemin-shift');
  }
 }

 function fit(){
  const indications=getIndications()||[],lang=doc.documentElement.lang;
  const next=JSON.stringify([lang,app.dataset.compactScope,app.dataset.reading,app.dataset.section,win.innerWidth,win.innerHeight,fonts,Boolean(catalogue),indications]);
  if(next!==key){key=next;measureAll(indications,lang);}
  const now=live(lang);
  paintSteps(trail,now,lang);
  centre(now);
  // The short form hides the country before a campus: keep the keyboard focus in the path (as the copy's compact form).
  if(path.dataset.cheminForm==='short'&&app.dataset.reading!=='true'&&countryButton&&doc.activeElement===countryButton)picker?.focus({preventScroll:true});
  return width;
 }
 const refit=()=>{fonts++;fit();};
 win.addEventListener('resize',fit);
 doc.fonts?.ready?.then(refit,()=>{});
 doc.fonts?.addEventListener?.('loadingdone',refit);
 // The continents arrive with the catalogue: paint and measure again then.
 catalogueReady.then(data=>{if(data)fit();});
 return {fit,get width(){return width;}};
}
