/* Version B, refinements of 26 Oct 2026 (EXPLORER-B-REFINEMENTS-20261025 §T): the scope pill's width no longer follows
 * the filter. It is the width of the longest indication the pill can show (« Monde », the continents, the countries,
 * each campus with its country), measured on copies of the live pill in its current language and form (the compact
 * form hides the country, reading hides the chevron), with the real fonts, and measured again when one of these or the
 * viewport changes. The bar's max-width still applies: on phones a longer indication ends with « … » (its full text
 * stays in the picker's accessible name and title, and in the reading summary). */

/** Every indication the pill can show, as {name, crumb}: « Monde », the continents, the countries, then each campus
 * with its country as crumb. Pure. */
export function scopeIndications({world,continents=[],countries=[],campuses=[]}){
 return [{name:world},...continents.map(name=>({name})),...countries.map(name=>({name})),...campuses.map(({name,country})=>({name,crumb:country}))]
  .filter(item=>item.name);
}

/** The pill's width controller: fit() measures again only when the indications, the language, the form, the viewport
 * or the fonts changed, and returns the width it set (null while there is nothing to measure). measure(indications)
 * may be replaced (tests); by default each indication is laid out once on an invisible copy of the pill. */
export function mountScopePill({app,bar,path,trail,getIndications,measure=null}){
 const doc=path.ownerDocument,win=doc.defaultView;
 let key=null,width=null,fonts=0;
 const picker=trail.querySelector('.scope-picker'),name=picker?.querySelector('span');
 // The copies sit in the bar, so that every rule of the live pill applies to them; the picker's font size comes from
 // an id rule (design-review-selection.css), which the copies, without ids, receive inline.
 function layout(indications){
  const box=doc.createElement('div'),size=element=>element?win.getComputedStyle(element).fontSize:'';
  const pickerSize=size(picker),nameSize=size(name);
  box.className='scope-measure';box.setAttribute('aria-hidden','true');box.inert=true;
  box.style.cssText='position:absolute;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
  const copies=indications.map(({name:text,crumb})=>{
   const copy=path.cloneNode(false),seat=doc.createElement('span'),line=trail.cloneNode(true);
   copy.removeAttribute('id');copy.removeAttribute('aria-label');copy.style.width='max-content';seat.className='scope-medallion';
   line.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));line.querySelectorAll('use').forEach(node=>node.remove());
   const country=line.querySelector('.scope-country'),current=line.querySelector('.scope-picker');
   if(country){country.hidden=!crumb;country.querySelector('button>span').textContent=crumb||'';}
   current.style.fontSize=pickerSize;current.querySelector('span').style.fontSize=nameSize;current.querySelector('span').textContent=text;
   copy.append(seat,line);box.append(copy);return copy;
  });
  bar.append(box);
  const widths=copies.map(copy=>copy.getBoundingClientRect().width);
  box.remove();
  return widths;
 }
 function fit(){
  const indications=getIndications()||[];
  const next=JSON.stringify([doc.documentElement.lang,app.dataset.compactScope,app.dataset.reading,win.innerWidth,win.innerHeight,fonts,indications]);
  if(next===key)return width;
  key=next;
  if(!indications.length){path.style.width='';return width=null;}
  const longest=Math.max(...(measure||layout)(indications));
  // A pill without a layout box measures nothing: it keeps its natural width and measures again at the next call.
  if(!(longest>0)){key=null;path.style.width='';return width=null;}
  width=Math.ceil(longest-.01);
  path.style.width=width+'px';
  return width;
 }
 const refit=()=>{fonts++;fit();};
 win.addEventListener('resize',fit);
 doc.fonts?.ready?.then(refit,()=>{});
 doc.fonts?.addEventListener?.('loadingdone',refit);
 return {fit,get width(){return width;}};
}
