/* Version B (24 Oct 2026): the free band of the Explorer stage, as A's resting globe used it. The top is the
 * bottom of the filter's status line (or of the filter itself when the status is hidden), the bottom is the top of
 * the first visible control below (#about, then the search capsule, then the random toggle), each with 16 px of
 * air. The stage receives --explorer-top/--explorer-bottom and data-band; explorer-selector.css lays it out.
 * Refinements §W (26 Oct 2026): when the dock stands as a side rail, nothing lies under the band; getBottomEdge() then
 * gives its lower bound itself (the window's bottom margin, the rail standing beside the band), air included, and null
 * otherwise. */
const GAP=16,COMPACT_GAP=8,COMPACT_BAND=260,SCROLL_BAND=120;

export function createExplorerBand({stage,app=null,getTopElements=()=>[],getBottomElements=()=>[],getBottomEdge=()=>null}){
 const view=stage.ownerDocument?.defaultView||{},observed=new Set();
 let state=null,destroyed=false;
 const visible=element=>Boolean(element&&!element.hidden&&element.getClientRects?.().length);
 const round=value=>Math.round(value*100)/100;
 const Observer=view.ResizeObserver,observer=typeof Observer==='function'?new Observer(()=>measure()):null;
 // Controls created later (the search capsule, the random toggle moved into the dock) are watched once found.
 function watch(elements){for(const element of elements)if(element&&!observed.has(element)){observed.add(element);observer?.observe(element);}}
 function measure(){
  if(destroyed)return state;
  const tops=(getTopElements()||[]).filter(Boolean),bottoms=(getBottomElements()||[]).filter(Boolean);
  watch(tops);watch(bottoms);
  // Outside Explorer the stage is hidden: its last band is kept until the page comes back.
  if(app&&app.dataset?.section!=='explore')return state;
  const top=tops.find(visible),edge=getBottomEdge(),bottom=edge==null?bottoms.find(visible):null;
  // An open search grows its capsule into the results: the band stays as it was until it closes.
  if(!top||(edge==null&&(!bottom||bottom.closest?.('[data-search-open=true]'))))return state;
  const frame=stage.getBoundingClientRect(),height=frame.height||view.innerHeight||0;if(!height)return state;
  const above=top.getBoundingClientRect().bottom-frame.top,below=round(frame.top+height-(edge??bottom.getBoundingClientRect().top-GAP));
  // A short band first gains 8 px at the top (compact cards), then lets the stage scroll.
  const roomy=height-above-GAP-below,mode=roomy>=COMPACT_BAND?'normal':roomy+GAP-COMPACT_GAP>=SCROLL_BAND?'compact':'scroll';
  const next={top:round(above+(mode==='normal'?GAP:COMPACT_GAP)),bottom:below,mode};next.band=round(height-next.top-next.bottom);
  if(state?.top!==next.top)stage.style.setProperty('--explorer-top',next.top+'px');
  if(state?.bottom!==next.bottom)stage.style.setProperty('--explorer-bottom',next.bottom+'px');
  if(stage.dataset.band!==mode)stage.dataset.band=mode;
  state=next;return state;
 }
 // The border box of the fixed stage follows the viewport; its padding (the band itself) never re-triggers it.
 observer?.observe(stage,{box:'border-box'});
 stage.ownerDocument?.fonts?.ready?.then(()=>measure(),()=>{});
 measure();
 return {measure,get state(){return state;},destroy(){destroyed=true;observer?.disconnect();observed.clear();}};
}
