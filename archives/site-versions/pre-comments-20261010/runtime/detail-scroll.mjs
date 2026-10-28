/** The document scrolls normally; only the desktop section menu scrolls inside. */
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
  return {key:current.key,identity:current.identity,menu:offset(current.menu.scrollTop)};
 }
 function restore(snapshot){
  if(!media.matches||!current||snapshot?.key!==current.key)return;
  current.menu.scrollTop=offset(snapshot.menu);current.lastMenu=current.menu.scrollTop;updateArrows();
 }
 /** Only a section activation calls this, after route focus. History and re-renders
     retain their saved offset; no ancestor or document scrolling is requested. */
 function centerActive(){
  if(!media.matches||!current)return false;
  const {menu}=current,active=menu.querySelector('[aria-current="page"]');
  const maximum=Math.max(0,menu.scrollHeight-menu.clientHeight);
  if(!active||menu.clientHeight<=0||maximum<=1)return false;
  const selected=active.getBoundingClientRect(),viewport=menu.getBoundingClientRect();
  const requested=menu.scrollTop+selected.top-viewport.top-(menu.clientTop||0)+(selected.height-menu.clientHeight)/2;
  const top=Math.max(0,Math.min(maximum,requested));
  if(Math.abs(top-menu.scrollTop)<.5)return false;
  menu.scrollTo({top,behavior:view.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  return true;
 }
 function updateArrows(){
  if(!current?.menuFrame)return;
  const {menu,up,down}=current;
  const overflowing=media.matches&&menu.scrollHeight>menu.clientHeight+1;
  const states=[[up,overflowing&&menu.scrollTop>1],[down,overflowing&&menu.scrollTop+menu.clientHeight<menu.scrollHeight-1]];
  for(const [button,visible]of states){
   if(!visible&&doc.activeElement===button)menu.focus({preventScroll:true});
   button.hidden=!visible;
  }
 }
 function mountMenu(){
  if(current.menuFrame)return;
  const {menu,container}=current,controller=new AbortController(),signal=controller.signal;
  const menuFrame=doc.createElement('div');menuFrame.className='cp-detail-menu';
  menu.before(menuFrame);menuFrame.append(menu);
  const labels={fr:['Faire défiler les rubriques vers le haut','Faire défiler les rubriques vers le bas'],en:['Scroll sections up','Scroll sections down'],ar:['تمرير الأقسام إلى الأعلى','تمرير الأقسام إلى الأسفل']}[doc.documentElement.lang]||['Scroll sections up','Scroll sections down'];
  menu.id=container.id+'-desktop-menu';
  const arrows=[-1,1].map((direction,index)=>{
   const button=doc.createElement('button');button.type='button';button.className='cp-detail-menu-arrow';button.dataset.direction=direction<0?'up':'down';button.hidden=true;
   button.setAttribute('aria-label',labels[index]);button.setAttribute('aria-controls',menu.id);
   const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 20 20');icon.setAttribute('aria-hidden','true');
   const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',direction<0?'m5 12 5-5 5 5':'m5 8 5 5 5-5');icon.append(path);button.append(icon);
   button.addEventListener('click',()=>menu.scrollBy({top:direction*Math.max(48,menu.clientHeight*.7),behavior:view.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}),{signal});
   menuFrame.append(button);return button;
  });
  Object.assign(current,{menuFrame,up:arrows[0],down:arrows[1],menuController:controller});
  menu.addEventListener('scroll',updateArrows,{signal,passive:true});
  if(view.ResizeObserver){
   current.observer=new view.ResizeObserver(scheduleLayout);
   current.observer.observe(current.identityElement);current.observer.observe(menu);
  }
 }
 function unmountMenu(){
  if(!current?.menuFrame)return;
  current.menuController.abort();current.observer?.disconnect();
  const {menu,menuFrame}=current;menuFrame.before(menu);menuFrame.remove();
  current.menuFrame=null;delete menu.dataset.detailScroll;menu.removeAttribute('tabindex');menu.scrollTop=0;
 }
 function layout(){
  if(!current||!media.matches)return;
  const {workspace,sidebar,menu,menuFrame,identityElement}=current,rect=workspace.getBoundingClientRect(),style=view.getComputedStyle(workspace);
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
  const identityHeight=()=>identityElement.getBoundingClientRect().height+(parseFloat(view.getComputedStyle(identityElement).marginBottom)||0);
  delete sidebar.dataset.detailDensity;
  let room=geometry.height-identityHeight()-clearance;
  if(room<120){sidebar.dataset.detailDensity='compact';room=geometry.height-identityHeight()-clearance;}
  if(room<88){
   sidebar.dataset.detailDensity='dense';
   // Use the gap under Back in a short viewport, without moving any reading content.
   geometry.top=topLimit;geometry.height=bottomLimit-topLimit;
   sidebar.style.setProperty('--detail-sidebar-top',geometry.top+'px');sidebar.style.setProperty('--detail-sidebar-height',geometry.height+'px');
   room=geometry.height-identityHeight()-clearance;
  }
  const menuStyle=view.getComputedStyle(menu),links=[...menu.children];
  const rows=links.reduce((height,link)=>height+link.getBoundingClientRect().height,0)+(parseFloat(menuStyle.rowGap)||0)*Math.max(0,links.length-1);
  // Compare with the unadorned menu so adding arrows cannot perpetuate overflow.
  const naturalHeight=rows+21,available=Math.max(48,Math.floor(room));
  menuFrame.dataset.overflow=String(naturalHeight>available+1);
  menuFrame.style.height=Math.min(naturalHeight,available)+'px';
  sheet.style.setProperty('--detail-reading-inset',(columnWidth+(parseFloat(style.columnGap)||0))+'px');
  updateArrows();
 }
 function scheduleLayout(){if(!frame)frame=view.requestAnimationFrame(()=>{frame=0;layout();});}
 function updateMode(){
  if(!current)return;
  const {sidebar,menu}=current;
  if(media.matches){pinBack();mountMenu();sidebar.dataset.detailScroll='sidebar';menu.dataset.detailScroll='menu';menu.tabIndex=0;layout();}
  else{unpinBack();unmountMenu();delete sidebar.dataset.detailScroll;delete sidebar.dataset.detailDensity;properties.forEach(name=>sidebar.style.removeProperty(name));}
  current.lastMenu=menu.scrollTop;
 }
 function sync({identity,key,previous}={}){
  const container=[...sheet.querySelectorAll('#profile-detail,#project-detail,#journal-detail')].find(element=>!element.hidden);
  const sidebar=container?.querySelector('.cp-profile-sidebar,.cp-project-sidebar'),workspace=container?.querySelector('.cp-profile-workspace,.cp-project-workspace');
  const menu=sidebar?.querySelector('.cp-profile-sidebar-nav,.cp-project-sidebar-nav'),identityElement=sidebar?.querySelector('header');
  if(!identity||current?.sidebar!==sidebar){current?.menuController?.abort();current?.observer?.disconnect();}
  if(!identity||!sidebar||!workspace||!menu||!identityElement){current=null;sheet.style.removeProperty('--detail-reading-inset');return;}
  if(current?.sidebar===sidebar)Object.assign(current,{identity,key});
  else current={identity,key,container,sidebar,workspace,menu,identityElement};
  sidebar.setAttribute('aria-labelledby',container.querySelector('h1').id);
  updateMode();
  if(media.matches&&previous?.identity===identity)menu.scrollTop=offset(previous.menu);
  current.lastMenu=menu.scrollTop;updateArrows();
 }
 function didScroll(target){
  if(!media.matches||!current||target!==current.menu||target.scrollTop===current.lastMenu)return false;
  current.lastMenu=target.scrollTop;updateArrows();return true;
 }
 media.addEventListener('change',updateMode);
 view.addEventListener('resize',scheduleLayout,{passive:true});
 doc.fonts?.ready.then(scheduleLayout);
 return {capture,restore,sync,didScroll,centerActive};
}
