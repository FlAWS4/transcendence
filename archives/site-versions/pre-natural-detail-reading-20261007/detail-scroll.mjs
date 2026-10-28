/** Remember the independent detail columns without changing mobile document scroll. */
export function createDetailScroll({sheet,view=sheet.ownerDocument.defaultView}){
 const media=view.matchMedia('(min-width:841px)');
 let current=null;
 const offset=value=>Number.isFinite(value)&&value>0?value:0;
 function capture(){
  if(!media.matches||!current)return null;
  return {key:current.key,identity:current.identity,sidebar:offset(current.sidebar.scrollTop),reading:offset(current.reading.scrollTop)};
 }
 function restore(snapshot){
  if(!media.matches||!current||snapshot?.key!==current.key)return;
  current.sidebar.scrollTop=offset(snapshot.sidebar);current.reading.scrollTop=offset(snapshot.reading);
  current.lastSidebar=current.sidebar.scrollTop;current.lastReading=current.reading.scrollTop;
 }
 function updateAccessibility(){
  if(!current)return;
  for(const [role,element]of [['sidebar',current.sidebar],['reading',current.reading]]){
   if(media.matches){element.dataset.detailScroll=role;element.tabIndex=0;}
   else{delete element.dataset.detailScroll;element.removeAttribute('tabindex');element.scrollTop=0;}
  }
  current.lastSidebar=current.sidebar.scrollTop;current.lastReading=current.reading.scrollTop;
 }
 function sync({identity,key,previous}={}){
  const container=[...sheet.querySelectorAll('#profile-detail,#project-detail,#journal-detail')].find(element=>!element.hidden);
  const sidebar=container?.querySelector('.cp-profile-sidebar,.cp-project-sidebar'),reading=container?.querySelector('.cp-profile-reading-pane,.cp-project-reading-pane');
  if(!identity||!sidebar||!reading){current=null;return;}
  current={identity,key,sidebar,reading};
  sidebar.setAttribute('aria-labelledby',container.querySelector('h1').id);
  reading.setAttribute('role','region');reading.setAttribute('aria-labelledby',container.querySelector('h2').id);
  updateAccessibility();
  if(media.matches&&previous?.identity===identity){
   sidebar.scrollTop=offset(previous.sidebar);
   if(previous.key===key)reading.scrollTop=offset(previous.reading);
  }
  current.lastSidebar=sidebar.scrollTop;current.lastReading=reading.scrollTop;
 }
 function didScroll(target){
  if(!media.matches||!current)return false;
  const key=target===current.sidebar?'lastSidebar':target===current.reading?'lastReading':null;
  if(!key||target.scrollTop===current[key])return false;
  current[key]=target.scrollTop;return true;
 }
 media.addEventListener('change',updateAccessibility);
 return {capture,restore,sync,didScroll};
}
