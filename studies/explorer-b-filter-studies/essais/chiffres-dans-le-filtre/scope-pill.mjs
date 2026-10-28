/* Trial « Les chiffres dans le filtre » of the version B filter study (26 Oct 2026; README.md of this folder). This copy
 * of baseline/scope-pill.mjs (refinements §T) replaces it through the study's import map (essais/styles.js).
 * The counts of the line under the pill (#globe-hint, welcome.mjs scopeHint(): « 58 campus · 30 pays » for « Monde »,
 * a continent's campuses and countries, a country's campuses) are written in the pill after the place's name, behind a
 * « · », in the muted colour. At the campus level, where that line is hidden (it would give the country's campuses),
 * the campus's country takes their place (« 42 Paris · France ») and no longer stands before the campus. styles.css
 * hides the line and that country, and puts the pill on the page's axis.
 * The pill still keeps one width: the longest « name · counts » it can show (« Monde », the continents, the countries,
 * each campus with its country), measured as §T does, on copies of the live pill in its current language and form, with
 * the real fonts, and measured again when one of these or the viewport changes. On phones a longer one ends with « … »;
 * the picker's accessible name and title, and the reading summary, carry the whole text.
 * The picker spans the pill after the globe's seat, so that the place popover it anchors never moves; its text stands
 * in the middle of the whole pill, or starts right after the seat when it is too long for that. */
import {continentIds,continentOfCountry,continentName} from '../../baseline/continents.mjs?v=b1';
import {countLabel} from '../../baseline/explorer-model.mjs?v=b6';

/** Every indication the pill can show, as {kind, name, crumb}: « Monde », the continents, the countries, then each
 * campus with its country as crumb. Pure. (§T's list, each item with its kind.) */
export function scopeIndications({world,continents=[],countries=[],campuses=[]}){
 return [{kind:'world',name:world},...continents.map(name=>({kind:'continent',name})),...countries.map(name=>({kind:'country',name})),
  ...campuses.map(({name,country})=>({kind:'campus',name,crumb:country}))].filter(item=>item.name);
}

/** Each indication with the text that follows its name, `more`: the counts the line under the pill showed for it (the
 * rules of welcome.mjs scopeHint()), or a campus's country. The catalogue (campuses.json) gives each campus's country
 * code and the countries' codes, whose continent continents.mjs knows; places are matched by their name in the pill's
 * language, named as welcome.mjs names them (Intl region names, continents.mjs). Pure. */
export function scopeFigures(indications,{campuses=[],countries=[]}={},locale='fr'){
 const regions=new Intl.DisplayNames(locale||'fr',{type:'region'}),figures=new Map();
 figures.set('world',countLabel({campuses:campuses.length,countries:countries.length},locale));
 for(const id of continentIds)figures.set('continent:'+continentName(id,locale),countLabel({campuses:campuses.filter(campus=>continentOfCountry(campus.country)===id).length,
  countries:countries.filter(country=>continentOfCountry(country.id)===id).length},locale));
 for(const country of countries)figures.set('country:'+(regions.of(country.iso2)||country.name),countLabel({campuses:campuses.filter(campus=>campus.country===country.id).length},locale));
 return indications.map(item=>({...item,more:item.kind==='campus'?item.crumb||'':figures.get(item.kind==='world'?'world':`${item.kind}:${item.name}`)??''}));
}

/** The pill's label and width controller: fit() writes the counts after the live name (and into the picker's accessible
 * name, its title and the reading summary), measures again only when the indications, the language, the form, the
 * viewport or the fonts changed, places the text in the pill's middle, and returns the width it set (null while there is
 * nothing to measure). measure(items) may be replaced (tests); by default each « name · counts » is laid out once on an
 * invisible copy of the pill. */
export function mountScopePill({app,bar,path,trail,getIndications,measure=null}){
 const doc=path.ownerDocument,win=doc.defaultView;
 let key=null,width=null,fonts=0,catalogue=null,request=null;
 const picker=trail.querySelector('.scope-picker'),name=picker?.querySelector('span'),chevron=picker?.querySelector('.chevron'),hint=bar.querySelector('#globe-hint');
 const country=trail.querySelector('.scope-country button>span'),summary=path.querySelector('#scope-reading-summary'),back=bar.querySelector('.scope-back');
 // The label: the name and its counts on one line, which ends with « … » where the pill is too narrow (phones).
 const label=doc.createElement('span'),counts=doc.createElement('span');
 label.className='essai-scope-label';counts.className='essai-scope-counts';counts.dir='auto';
 if(name){name.replaceWith(label);label.append(name,counts);}
 // What this module last wrote over the copy's own accessible texts, which welcome.mjs updateScope() writes again,
 // without the counts, on every filter or language change.
 const written={label:null,title:null,summary:null};
 // The catalogue gives the countries' codes, hence the continents' counts: the copy's own file, which welcome.mjs loads
 // too, requested once more here (again at the next fit after a failure).
 function load(){
  if(catalogue||request)return;
  request=win.fetch(new URL('campuses.json',doc.baseURI)).then(response=>response.ok?response.json():Promise.reject(new Error(String(response.status))))
   .then(value=>{catalogue=value;key=null;fit();},()=>{}).finally(()=>{request=null;});
 }
 // The live label follows the copy's texts: the line's counts (#globe-hint), and at the campus level the country.
 function sync(){
  const campus=bar.dataset.level==='campus',more=(campus?country?.textContent:hint?.textContent)||'',text=more?' · '+more:'';
  if(counts.textContent!==text)counts.textContent=text;
  const own=name.textContent,head=own+' · ',base=picker.getAttribute('aria-label')||'';
  // « Monde · Choisir un pays ou un campus » becomes « Monde · 58 campus · 30 pays · Choisir un pays ou un campus ».
  if(base!==written.label){written.label=more&&base.startsWith(head)?head+more+' · '+base.slice(head.length):base;if(written.label!==base)picker.setAttribute('aria-label',written.label);}
  if(picker.title!==written.title){written.title=more&&picker.title===own?own+text:picker.title;if(picker.title!==written.title)picker.title=written.title;}
  // The reading summary already names a campus's country (« France › 42 Paris »): elsewhere the counts are added.
  if(summary&&summary.textContent!==written.summary){
   written.summary=more&&!campus&&summary.textContent?summary.textContent+text:summary.textContent;
   if(summary.textContent!==written.summary)summary.textContent=written.summary;
  }
 }
 // styles.css mirrors the ← on the pill's other side with a room as wide, so that the bar, centred, has the pill in its
 // middle. The ← keeps its width in a form (it only hides in reading, where the room hides too).
 function mirror(){
  const room=back?.getBoundingClientRect().width;
  if(room>0&&bar.style.getPropertyValue('--essai-back-room')!==room+'px')bar.style.setProperty('--essai-back-room',room+'px');
 }
 // The text (the label and the chevron after it) in the middle of the whole pill, the globe's seat included: styles.css
 // moves the label by --essai-text-shift from the picker's start. A text too long for the middle starts where the copy
 // starts it, right after the seat and the picker's own padding (never closer to the globe), and runs to the pill's end.
 function place(){
  const pill=path.getBoundingClientRect();
  // A pill without a layout box keeps its shift until the next call.
  if(!(pill.width>0))return;
  picker.style.setProperty('--essai-text-shift','0px');
  const rtl=win.getComputedStyle(picker).direction==='rtl',first=label.getBoundingClientRect();
  const last=chevron&&chevron.getClientRects().length?chevron.getBoundingClientRect():first;
  const size=rtl?first.right-last.left:last.right-first.left,start=rtl?pill.right-first.right:first.left-pill.left;
  const shift=Math.max(0,Math.round(((pill.width-size)/2-start)*100)/100);
  if(shift)picker.style.setProperty('--essai-text-shift',shift+'px');
 }
 // The copies sit in the bar, so that every rule of the live pill applies to them; the picker's font size comes from
 // an id rule (design-review-selection.css), which the copies, without ids, receive inline.
 function layout(items){
  const box=doc.createElement('div'),size=element=>element?win.getComputedStyle(element).fontSize:'';
  const pickerSize=size(picker),nameSize=size(name);
  box.className='scope-measure';box.setAttribute('aria-hidden','true');box.inert=true;
  box.style.cssText='position:absolute;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
  const copies=items.map(({name:text,more})=>{
   const copy=path.cloneNode(false),seat=doc.createElement('span'),line=trail.cloneNode(true);
   copy.removeAttribute('id');copy.removeAttribute('aria-label');copy.style.width='max-content';seat.className='scope-medallion';
   line.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));line.querySelectorAll('use').forEach(node=>node.remove());
   // No place stands before the name in this trial (the country follows a campus): none is measured.
   line.querySelectorAll('.scope-ancestor').forEach(node=>{node.hidden=true;});
   const current=line.querySelector('.scope-picker'),copyLabel=current.querySelector('.essai-scope-label'),copyName=copyLabel.firstElementChild;
   current.style.removeProperty('--essai-text-shift');
   current.style.fontSize=pickerSize;copyName.style.fontSize=nameSize;copyName.textContent=text;
   copyLabel.querySelector('.essai-scope-counts').textContent=more?' · '+more:'';
   copy.append(seat,line);box.append(copy);return copy;
  });
  bar.append(box);
  const widths=copies.map(copy=>copy.getBoundingClientRect().width);
  box.remove();
  return widths;
 }
 // The width, measured again only when what it depends on changed.
 function setWidth(){
  const indications=getIndications()||[],lang=doc.documentElement.lang;
  const next=JSON.stringify([lang,app.dataset.compactScope,app.dataset.reading,win.innerWidth,win.innerHeight,fonts,Boolean(catalogue),indications]);
  if(next===key)return;
  key=next;
  mirror();
  // Until the catalogue is here the pill keeps its natural width, as before the copy's own catalogue.
  if(indications.length&&!catalogue)load();
  if(!indications.length||!catalogue||!name){key=null;path.style.width='';width=null;return;}
  const longest=Math.max(...(measure||layout)(scopeFigures(indications,catalogue,lang)));
  // A pill without a layout box measures nothing: it keeps its natural width and measures again at the next call.
  if(!(longest>0)){key=null;path.style.width='';width=null;return;}
  width=Math.ceil(longest-.01);
  path.style.width=width+'px';
 }
 function fit(){
  if(name)sync();
  setWidth();
  if(name)place();
  return width;
 }
 const refit=()=>{fonts++;fit();};
 load();
 if(name){sync();mirror();place();}
 win.addEventListener('resize',fit);
 doc.fonts?.ready?.then(refit,()=>{});
 doc.fonts?.addEventListener?.('loadingdone',refit);
 return {fit,get width(){return width;}};
}
