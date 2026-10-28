/* Trial « Un filtre plus court » (filtre-plus-court) of the version B filter study, 26 Oct 2026. Stands in for the
 * copy's scope-pill.mjs (baseline/scope-pill.mjs, refinements §T) through the study's import map: welcome.mjs keeps
 * calling it as before. The pill now shows only the current place's name (the country before a campus stands under the
 * pill: styles.css), so its fixed width is that of the longest single name the pill can show: « Monde », the
 * continents, the countries and the campuses, without the country before a campus. As in the copy, each name is laid
 * out once on an invisible copy of the live pill, in its current language and form, with the real fonts, and measured
 * again when one of these or the viewport changes; the trial's stylesheet gives the copies the same symmetric layout as
 * the live pill (the globe's seat at the start, the same room at the end, the name centred).
 * The height is fixed the same way, on the tallest name: in Arabic the Arabic names (the world, the continents, the
 * countries) lay out taller than the Latin campus names (49 against 46 px on a phone), and the pill, which no longer
 * shows the country beside a campus, would otherwise lose that height at the campus level. */

/** Every name the pill can show, once each: « Monde », the continents, the countries, then the campuses (their country,
 * which welcome.mjs still passes, is dropped). Pure. */
export function scopeIndications({world,continents=[],countries=[],campuses=[]}){
 return [...new Set([world,...continents,...countries,...campuses.map(campus=>campus?.name)])].filter(Boolean).map(name=>({name}));
}

/** The pill's size controller, with the copy's interface: fit() measures again only when the names, the language, the
 * form, the viewport or the fonts changed, and returns the width it set (null while there is nothing to measure); it
 * sets the tallest name's height as the pill's min-height. measure(indications) may be replaced (tests) and return
 * widths or {width,height}; by default each name is laid out once on an invisible copy of the pill. */
export function mountScopePill({app,bar,path,trail,getIndications,measure=null}){
 const doc=path.ownerDocument,win=doc.defaultView;
 let key=null,width=null,fonts=0;
 const picker=trail.querySelector('.scope-picker'),name=picker?.querySelector('span');
 // The copies sit in the bar, so that every rule of the live pill applies to them; the picker's font size comes from
 // an id rule (design-review-selection.css), which the copies, without ids, receive inline. The ancestors never show in
 // this trial's pill: the copies leave them out.
 function layout(indications){
  const box=doc.createElement('div'),size=element=>element?win.getComputedStyle(element).fontSize:'';
  const pickerSize=size(picker),nameSize=size(name);
  box.className='scope-measure';box.setAttribute('aria-hidden','true');box.inert=true;
  box.style.cssText='position:absolute;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
  const copies=indications.map(({name:text})=>{
   const copy=path.cloneNode(false),seat=doc.createElement('span'),line=trail.cloneNode(true);
   // The copy also clones the sizes this controller set inline on the live pill: the copies measure without them.
   copy.removeAttribute('id');copy.removeAttribute('aria-label');copy.style.width='max-content';copy.style.minHeight='';seat.className='scope-medallion';
   line.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));line.querySelectorAll('use').forEach(node=>node.remove());
   line.querySelectorAll('.scope-ancestor').forEach(node=>node.remove());
   const current=line.querySelector('.scope-picker');
   current.style.fontSize=pickerSize;current.querySelector('span').style.fontSize=nameSize;current.querySelector('span').textContent=text;
   copy.append(seat,line);box.append(copy);return copy;
  });
  bar.append(box);
  const sizes=copies.map(copy=>{const rect=copy.getBoundingClientRect();return {width:rect.width,height:rect.height};});
  box.remove();
  return sizes;
 }
 function clear(){path.style.width='';path.style.minHeight='';}
 function fit(){
  const indications=getIndications()||[];
  const next=JSON.stringify([doc.documentElement.lang,app.dataset.compactScope,app.dataset.reading,win.innerWidth,win.innerHeight,fonts,indications]);
  if(next===key)return width;
  key=next;
  if(!indications.length){clear();return width=null;}
  const sizes=(measure||layout)(indications).map(size=>typeof size==='number'?{width:size,height:0}:size);
  const longest=Math.max(...sizes.map(size=>size.width)),tallest=Math.max(...sizes.map(size=>size.height));
  // A pill without a layout box measures nothing: it keeps its natural size and measures again at the next call.
  if(!(longest>0)){key=null;clear();return width=null;}
  width=Math.ceil(longest-.01);
  path.style.width=width+'px';
  path.style.minHeight=tallest>0?Math.ceil(tallest-.01)+'px':'';
  return width;
 }
 const refit=()=>{fonts++;fit();};
 win.addEventListener('resize',fit);
 doc.fonts?.ready?.then(refit,()=>{});
 doc.fonts?.addEventListener?.('loadingdone',refit);
 return {fit,get width(){return width;}};
}
