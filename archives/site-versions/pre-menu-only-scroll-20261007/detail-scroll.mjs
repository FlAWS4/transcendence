/** The reading stays in the document. Only the desktop sidebar is independent. */
export function detailSidebarGeometry({rect,columnWidth,scrollY,topLimit,bottomLimit,rtl=false}){
 const naturalTop=rect.top+scrollY;
 // Short windows give the identity a useful scroll area below the header.
 const top=Math.max(topLimit,Math.min(naturalTop,bottomLimit-160));
 return {left:rtl?rect.right-columnWidth:rect.left,width:columnWidth,top,height:Math.max(48,bottomLimit-top)};
}

export function createDetailScroll({sheet,view=sheet.ownerDocument.defaultView}){
 const doc=sheet.ownerDocument,media=view.matchMedia('(min-width:841px)');
 let current=null,frame=0;
 const offset=value=>Number.isFinite(value)&&value>0?value:0;
 const properties=['--detail-sidebar-x','--detail-sidebar-width','--detail-sidebar-top','--detail-sidebar-height'];
 function pinBack(){
  if(!current||current.backInfo)return;
  const back=current.container.querySelector(':scope > .cp-back');if(!back)return;
  const backTop=back.getBoundingClientRect().top+(view.scrollY||0);
  const workspaceTop=current.workspace.getBoundingClientRect().top+(view.scrollY||0);
  const spacer=doc.createElement('div');spacer.className='cp-detail-back-spacer';spacer.setAttribute('aria-hidden','true');spacer.style.height='1px';
  back.before(spacer);back.dataset.detailBackPinned='true';
  const reserved=1+workspaceTop-(current.workspace.getBoundingClientRect().top+(view.scrollY||0));
  spacer.style.height=Math.max(1,reserved)+'px';
  current.backInfo={element:back,spacer,topOffset:backTop-(spacer.getBoundingClientRect().top+(view.scrollY||0))};
 }
 function unpinBack(){
  if(!current?.backInfo)return;
  const {element,spacer}=current.backInfo;delete element.dataset.detailBackPinned;
  element.style.removeProperty('--detail-back-x');element.style.removeProperty('--detail-back-top');spacer.remove();current.backInfo=null;
 }
 function capture(){
  if(!media.matches||!current)return null;
  return {key:current.key,identity:current.identity,sidebar:offset(current.sidebar.scrollTop)};
 }
 function restore(snapshot){
  if(!media.matches||!current||snapshot?.key!==current.key)return;
  current.sidebar.scrollTop=offset(snapshot.sidebar);current.lastSidebar=current.sidebar.scrollTop;
 }
 function layout(){
  if(!current||!media.matches)return;
  const {workspace,sidebar}=current,rect=workspace.getBoundingClientRect(),style=view.getComputedStyle(workspace);
  if(!rect.width)return;
  const appStyle=view.getComputedStyle(sheet.closest('.app'));
  let topLimit=(parseFloat(appStyle.getPropertyValue('--header-fade-end'))||124)+12;
  if(current.backInfo){
   const {element,spacer,topOffset}=current.backInfo;
   const top=spacer.getBoundingClientRect().top+(view.scrollY||0)+topOffset;
   const backRect=element.getBoundingClientRect();
   element.style.setProperty('--detail-back-x',(style.direction==='rtl'?rect.right-backRect.width:rect.left)+'px');
   element.style.setProperty('--detail-back-top',top+'px');
   topLimit=Math.max(topLimit,top+backRect.height+14);
  }
  const bottomLimit=view.innerHeight-16;
  const columnWidth=parseFloat(style.gridTemplateColumns)||sidebar.getBoundingClientRect().width;
  const geometry=detailSidebarGeometry({rect,columnWidth,scrollY:view.scrollY||0,topLimit,bottomLimit,rtl:style.direction==='rtl'});
  const overlappingControls=[doc.getElementById('main-nav'),doc.querySelector('.dock-search-toggle')]
   .filter(element=>element?.getClientRects().length).map(element=>element.getBoundingClientRect())
   .filter(control=>control.left<geometry.left+geometry.width&&control.right>geometry.left);
  const clearance=Math.max(12,...overlappingControls.map(control=>bottomLimit-control.top+12));
  for(const [name,value]of [['x',geometry.left],['width',geometry.width],['top',geometry.top],['height',geometry.height]])sidebar.style.setProperty('--detail-sidebar-'+name,value+'px');
  sidebar.style.setProperty('--detail-sidebar-clearance',clearance+'px');
  sheet.style.setProperty('--detail-reading-inset',(columnWidth+(parseFloat(style.columnGap)||0))+'px');
 }
 function scheduleLayout(){if(!frame)frame=view.requestAnimationFrame(()=>{frame=0;layout();});}
 function updateMode(){
  if(!current)return;
  const {sidebar}=current;
  if(media.matches){pinBack();layout();sidebar.dataset.detailScroll='sidebar';sidebar.tabIndex=0;}
  else{unpinBack();delete sidebar.dataset.detailScroll;sidebar.removeAttribute('tabindex');sidebar.scrollTop=0;properties.forEach(name=>sidebar.style.removeProperty(name));sidebar.style.removeProperty('--detail-sidebar-clearance');}
  current.lastSidebar=sidebar.scrollTop;
 }
 function sync({identity,key,previous}={}){
  const container=[...sheet.querySelectorAll('#profile-detail,#project-detail,#journal-detail')].find(element=>!element.hidden);
  const sidebar=container?.querySelector('.cp-profile-sidebar,.cp-project-sidebar'),workspace=container?.querySelector('.cp-profile-workspace,.cp-project-workspace');
  if(!identity||!sidebar||!workspace){current=null;sheet.style.removeProperty('--detail-reading-inset');return;}
  current={identity,key,container,sidebar,workspace};
  sidebar.setAttribute('aria-labelledby',container.querySelector('h1').id);
  updateMode();
  if(media.matches&&previous?.identity===identity)sidebar.scrollTop=offset(previous.sidebar);
  current.lastSidebar=sidebar.scrollTop;
 }
 function didScroll(target){
  if(!media.matches||!current||target!==current.sidebar||target.scrollTop===current.lastSidebar)return false;
  current.lastSidebar=target.scrollTop;return true;
 }
 media.addEventListener('change',updateMode);
 view.addEventListener('resize',scheduleLayout,{passive:true});
 doc.fonts?.ready.then(scheduleLayout);
 return {capture,restore,sync,didScroll};
}
