/* Version B, refinements of 26 Oct 2026 (EXPLORER-B-REFINEMENTS-20261025 §Y, after §T): the scope pill shows the whole
 * path in steps, the ones still to choose as muted placeholders (« Monde › Pays › Campus », « Europe › France › Campus »;
 * welcome.mjs paints the live trail), at one width that no longer follows the filter: the longest full path over every
 * indication, measured on copies of the live pill in its current language and form (reading hides the chevron), with the
 * real fonts, and measured again when one of these, the section or the viewport changes; its height is the tallest
 * path's. Where the full path cannot fit (phones), and in the compact form, a short form shows the current step and the
 * next one (a campus keeps its country, which the compact form hides as before), at the width of the longest short form;
 * the bar's max-width still applies, so a longer one ends with « … » (its full text stays in the picker's accessible name
 * and title, and in the reading summary). The steps are centred on the pill's whole width, a path too long for that
 * starting right after the seat, and the pill on the page's axis: the bar keeps after it a room as wide as the ←
 * (dock-navigation.css). */

const LEVELS=['world','continent','country','campus'];
// One path, as the measures and the live pill name it.
const pathKey=({level,name,crumb})=>JSON.stringify([level,name||'',crumb||'']);

/** Every indication the pill can show, as {level, name, crumb, continent}: « Monde », the continents, the countries with
 * their continent, then each campus with its country as crumb and its continent. Pure. */
export function scopeIndications({world,continents=[],countries=[],campuses=[]}){
 return [{level:'world',name:world},...continents.map(name=>({level:'continent',name})),...countries.map(({name,continent})=>({level:'country',name,continent})),
  ...campuses.map(({name,country,continent})=>({level:'campus',name,crumb:country,continent}))].filter(item=>item.name);
}

/** The pill's controller: fit() measures again only when the indications, the language, the form, the section, the
 * viewport or the fonts changed, centres the steps of the live path, and returns the width it set (null while there is
 * nothing to measure). measure(items, form) may be replaced (tests): it returns one box {width, height, start, trail} per
 * item, start being where its trail begins from the pill's starting edge; by default each item is laid out once on an
 * invisible copy of the pill. */
export function mountScopePill({app,bar,path,trail,getIndications,measure=null}){
 const doc=path.ownerDocument,win=doc.defaultView;
 let key=null,width=null,room=0,fonts=0,boxes=new Map();
 const back=bar.querySelector('.scope-back'),picker=trail.querySelector('.scope-picker'),name=picker?.querySelector('span');
 const countryName=trail.querySelector('.scope-country')?.querySelector('button>span');
 // The copies sit in the bar, so that every rule of the live pill applies to them; the picker's font size comes from
 // an id rule (design-review-selection.css), which the copies, without ids, receive inline. They drop the live pill's
 // inline style (its width, height and the steps' margin) and show each path's steps as welcome.mjs paints the live ones.
 function layout(items,form){
  const box=doc.createElement('div'),size=element=>element?win.getComputedStyle(element).fontSize:'';
  const pickerSize=size(picker),nameSize=size(name),rtl=win.getComputedStyle(path).direction==='rtl';
  box.className='scope-measure';box.setAttribute('aria-hidden','true');box.inert=true;
  box.style.cssText='position:absolute;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
  const copies=items.map(item=>{
   const copy=path.cloneNode(false),seat=doc.createElement('span'),line=trail.cloneNode(true);
   copy.removeAttribute('id');copy.removeAttribute('aria-label');copy.removeAttribute('style');copy.style.width='max-content';copy.dataset.form=form;
   seat.className='scope-medallion';
   line.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));line.querySelectorAll('use').forEach(node=>node.remove());
   const continent=line.querySelector('.scope-continent'),country=line.querySelector('.scope-country'),current=line.querySelector('.scope-picker');
   if(continent){continent.hidden=!item.continent;continent.querySelector('span').textContent=item.continent||'';}
   if(country){country.hidden=!item.crumb;country.querySelector('button>span').textContent=item.crumb||'';}
   for(const step of line.querySelectorAll('.scope-placeholder'))step.hidden=LEVELS.indexOf(item.level)>=LEVELS.indexOf(step.dataset.step);
   current.style.fontSize=pickerSize;current.querySelector('span').style.fontSize=nameSize;current.querySelector('span').textContent=item.name;
   copy.append(seat,line);box.append(copy);return [copy,line];
  });
  bar.append(box);
  const measured=copies.map(([copy,line])=>{
   const outer=copy.getBoundingClientRect(),inner=line.getBoundingClientRect();
   return {width:outer.width,height:outer.height,start:rtl?outer.right-inner.right:inner.left-outer.left,trail:inner.width};
  });
  box.remove();
  return measured;
 }
 function measureAll(indications){
  // The room after the pill is as wide as the ← (none while reading, which drops it), so the pill's centre is the bar's.
  bar.style.setProperty('--scope-back',(back?.offsetWidth||0)+'px');
  boxes=new Map();path.style.minHeight='';path.dataset.form=app.dataset.compactScope==='true'?'short':'full';
  if(!indications.length){path.style.width='';return width=null;}
  // The widest the bar lets the pill be: its max-width, less the ← and its room.
  path.style.width='100000px';room=path.getBoundingClientRect().width;
  const largest=form=>{
   const measured=(measure||layout)(indications,form);
   return {measured,width:Math.max(...measured.map(box=>box.width)),height:Math.max(...measured.map(box=>box.height))};
  };
  let form=path.dataset.form,size=room>0?largest(form):null;
  // The full path does not fit (phones): the short form, the current step and the next one.
  if(size&&form==='full'&&size.width>room+.5){form='short';size=largest(form);}
  path.dataset.form=form;
  // A pill without a layout box measures nothing: it keeps its natural size and measures again at the next call.
  if(!(size?.width>0)){key=null;path.style.width='';return width=null;}
  indications.forEach((item,index)=>boxes.set(pathKey(item),size.measured[index]));
  // One height too: an Arabic name makes the line taller than « 42 Paris ».
  width=Math.ceil(size.width-.01);
  path.style.width=width+'px';path.style.minHeight=Math.ceil(size.height-.01)+'px';
  return width;
 }
 // The steps centred on the pill's whole width, so on the page's axis and over the line under the pill: the trail's
 // margin after the seat (dock-navigation.css). The pill is as wide as set, or the bar's room on a phone too narrow.
 function centre(){
  const level=bar.dataset.level||'world';
  const box=width===null?null:boxes.get(pathKey({level,name:name?.textContent,crumb:level==='campus'?countryName?.textContent:''}));
  const shift=box?Math.max(0,Math.min(width,room)/2-box.start-box.trail/2):0;
  const value=shift>.005?shift.toFixed(2)+'px':'';
  if(path.style.getPropertyValue('--scope-shift')===value)return;
  if(value)path.style.setProperty('--scope-shift',value);else path.style.removeProperty('--scope-shift');
 }
 function fit(){
  const indications=getIndications()||[];
  const next=JSON.stringify([doc.documentElement.lang,app.dataset.compactScope,app.dataset.reading,app.dataset.section,win.innerWidth,win.innerHeight,fonts,indications]);
  if(next!==key){key=next;measureAll(indications);}
  centre();
  return width;
 }
 const refit=()=>{fonts++;fit();};
 win.addEventListener('resize',fit);
 doc.fonts?.ready?.then(refit,()=>{});
 doc.fonts?.addEventListener?.('loadingdone',refit);
 return {fit,get width(){return width;}};
}
