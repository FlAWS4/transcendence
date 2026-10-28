const ROOT_SELECTOR='.cp-authors[data-compact="true"][data-collapsible="true"]';
const PROBE_CLASS='cp-author-fit-probe';
const EPSILON=.5;

export function authorPreviewNeedsCollapse(available,required,tolerance=EPSILON){
 return Number.isFinite(available)&&Number.isFinite(required)&&available>=0&&required>available+tolerance;
}

/** One controller per content surface. Call sync after each render; destroy on
 * teardown. Only invisible probes ever show both authors during measurement. */
export function createAuthorPreviewFit({container,signal}={}){
 if(!container?.ownerDocument)throw new TypeError('An author preview container is required.');
 const doc=container.ownerDocument,view=doc.defaultView,records=new Map(),observedWidths=new WeakMap();
 let destroyed=false,frame=null;
 const observer=view?.ResizeObserver?new view.ResizeObserver(entries=>{
  let widthChanged=false;
  for(const entry of entries){
   const width=entry.contentRect?.width;
   if(!Number.isFinite(width))continue;
   const previous=observedWidths.get(entry.target);
   if(previous===undefined||Math.abs(width-previous)>EPSILON){observedWidths.set(entry.target,width);widthChanged=true;}
  }
  // ResizeObserver runs before paint. Height changes caused by the reflow do
  // not schedule another pass, and unchanged states never write an attribute.
  if(widthChanged)measure();
 }):null;

 function schedule(){
  if(destroyed||frame!==null)return;
  if(view?.requestAnimationFrame)frame=view.requestAnimationFrame(()=>{frame=null;measure();});
  else measure();
 }
 function style(element,properties){for(const [property,value]of Object.entries(properties))element.style.setProperty(property,value,'important');}
 function createProbe(root,list){
  const probe=root.cloneNode(false);probe.classList.add(PROBE_CLASS);probe.dataset.overflow='false';
  probe.setAttribute('aria-hidden','true');probe.inert=true;
  const probeList=list.cloneNode(true);probe.append(probeList);
  for(const node of [probe,...probe.querySelectorAll('*')]){
   node.removeAttribute('id');
   if(node.matches('a,area'))node.removeAttribute('href');
   if(node.matches('a,area,button,input,select,textarea,[tabindex]'))node.setAttribute('tabindex','-1');
  }
  style(probe,{position:'absolute',visibility:'hidden','pointer-events':'none','inline-size':'0','max-inline-size':'none','block-size':'0',overflow:'hidden','inset-block-start':'0','inset-inline-start':'0',margin:'0','white-space':'nowrap'});
  style(probeList,{display:'inline-flex','flex-wrap':'nowrap','inline-size':'max-content','max-inline-size':'none','white-space':'nowrap'});
  for(const item of probeList.children)style(item,{flex:'0 0 auto','max-inline-size':'none','white-space':'nowrap'});
  // The sibling placement retains the actual card/list/RTL selector context.
  root.parentNode.append(probe);
  return {probe,probeList};
 }
 function restore(record){
  if(record.originalOverflow===null)record.root.removeAttribute('data-overflow');
  else record.root.setAttribute('data-overflow',record.originalOverflow);
 }
 function release(record){observer?.unobserve(record.list);observedWidths.delete(record.list);record.probe.remove();restore(record);records.delete(record.root);}
 function measure(){
  if(destroyed)return;
  const decisions=[];
  for(const record of [...records.values()]){
   if(!record.root.isConnected||!container.contains(record.root)||record.root.parentNode!==record.parent){release(record);continue;}
   const available=record.list.getBoundingClientRect().width,required=record.probeList.getBoundingClientRect().width;
   // A hidden section has no useful geometry. Resize observation measures it
   // again when it becomes visible, preserving its initial safe state meanwhile.
   if(available<=0||required<=0||!Number.isFinite(available)||!Number.isFinite(required))continue;
   decisions.push({record,overflow:authorPreviewNeedsCollapse(available,required)});
  }
  // Read all geometry first, then update only the bylines whose state changes.
  for(const {record,overflow}of decisions){
   const value=String(overflow);if(record.root.dataset.overflow===value)continue;
   const secondary=record.list.querySelector('[data-secondary="true"]'),more=record.list.querySelector('.cp-author-more'),moreItem=more?.closest('.cp-author-more-item');
   const moveToMore=overflow&&secondary?.contains(doc.activeElement);
   const moveToSecondary=!overflow&&moreItem?.dataset.narrowOnly==='true'&&moreItem.contains(doc.activeElement);
   record.root.dataset.overflow=value;
   if(moveToMore)more?.focus({preventScroll:true});
   else if(moveToSecondary)secondary?.querySelector('.cp-author-link')?.focus({preventScroll:true});
  }
 }
 function sync(){
  if(destroyed)return;
  const roots=[...container.querySelectorAll(ROOT_SELECTOR)].filter(root=>!root.classList.contains(PROBE_CLASS)&&root.isConnected),present=new Set(roots);
  for(const record of [...records.values()])if(!present.has(record.root))release(record);
  for(const root of roots){
   const list=root.querySelector('.cp-author-list');if(!list||!root.parentNode)continue;
   let record=records.get(root);
   if(record&&(record.list!==list||record.parent!==root.parentNode)){release(record);record=null;}
   if(record)record.probe.remove();
   const probe=createProbe(root,list);
   if(record)Object.assign(record,probe);
   else{
    record={root,list,parent:root.parentNode,originalOverflow:root.getAttribute('data-overflow'),...probe};records.set(root,record);observer?.observe(list);
   }
  }
  // Synchronous first measurement prevents the newly mounted wide preview
  // from appearing for a frame before it collapses.
  measure();
 }
 function destroy(){
  if(destroyed)return;destroyed=true;
  if(frame!==null){view?.cancelAnimationFrame?.(frame);frame=null;}
  observer?.disconnect();
  for(const record of [...records.values()])release(record);
  view?.removeEventListener('resize',schedule);
  doc.fonts?.removeEventListener?.('loadingdone',schedule);doc.fonts?.removeEventListener?.('loadingerror',schedule);
  signal?.removeEventListener('abort',destroy);
 }
 if(signal?.aborted){destroy();return {sync,measure,destroy};}
 view?.addEventListener('resize',schedule);
 doc.fonts?.addEventListener?.('loadingdone',schedule);doc.fonts?.addEventListener?.('loadingerror',schedule);
 if(doc.fonts?.ready)Promise.resolve(doc.fonts.ready).then(schedule,schedule);
 signal?.addEventListener('abort',destroy,{once:true});
 return {sync,measure,destroy};
}
