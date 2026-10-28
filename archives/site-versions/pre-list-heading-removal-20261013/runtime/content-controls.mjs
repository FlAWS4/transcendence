import {createProjectFilterDialog,projectFilterDialogLabel} from './project-filter-dialog.mjs?v=1';

export const contentControlCopy={
 fr:{layout:'Affichage',grid:'Grille',list:'Liste',sort:'Trier',newest:'Du plus récent au plus ancien',oldest:'Du plus ancien au plus récent',favorites:'Le plus de favoris',favoritesOnly:'Mes favoris uniquement',local:'Favoris conservés dans ce navigateur. Le tri utilise vos favoris, sans compteur public.',dates:'Dates illustratives des contenus de démonstration.',add:'Ajouter aux favoris',remove:'Retirer des favoris',saved:'Favoris',save:'Favoris',savedNotice:'Ajouté aux favoris dans ce navigateur.',removedNotice:'Retiré des favoris.',emptyTitle:'Aucun favori dans ce périmètre',emptyText:'Enregistre un contenu avec le cœur, ou affiche tous les contenus.',showAll:'Afficher tous les contenus'},
 en:{layout:'View',grid:'Grid',list:'List',sort:'Sort',newest:'Newest first',oldest:'Oldest first',favorites:'Most favorites',favoritesOnly:'My favorites only',local:'Favorites stay in this browser. Sorting uses your favorites, without a public count.',dates:'Illustrative dates for the sample content.',add:'Add to favorites',remove:'Remove from favorites',saved:'Favorites',save:'Favorites',savedNotice:'Saved to favorites in this browser.',removedNotice:'Removed from favorites.',emptyTitle:'No favorites in this location',emptyText:'Save a story using its heart, or show all content.',showAll:'Show all content'},
 ar:{layout:'العرض',grid:'شبكة',list:'قائمة',sort:'الترتيب',newest:'من الأحدث إلى الأقدم',oldest:'من الأقدم إلى الأحدث',favorites:'الأكثر تفضيلًا',favoritesOnly:'المفضلة فقط',local:'تُحفظ المفضلة في هذا المتصفح. يعتمد الترتيب على مفضلتك، دون عدّاد عام.',dates:'تواريخ توضيحية للمحتوى التجريبي.',add:'إضافة إلى المفضلة',remove:'إزالة من المفضلة',saved:'المفضلة',save:'المفضلة',savedNotice:'حُفظ في المفضلة في هذا المتصفح.',removedNotice:'أُزيل من المفضلة.',emptyTitle:'لا توجد مفضلة ضمن هذا النطاق',emptyText:'احفظ محتوى باستخدام القلب، أو اعرض كل المحتوى.',showAll:'عرض كل المحتوى'},
};
const paths={
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
 filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
 sort:'<path d="M4 5h16M7 12h13M10 19h10M4 9v11m-3-3 3 3 3-3"/>',
 chevron:'<path d="m8 10 4 4 4-4"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
};
const svg=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+paths[name]+'</svg>';
// Keep anchored menus within the available space; sorting always unfolds downwards.
export function contentMenuPlacement({anchorTop,anchorBottom,naturalHeight,topLimit,bottomLimit,gap=9,direction='auto'}){
 const above=Math.max(0,anchorTop-gap-topLimit);
 const below=Math.max(0,bottomLimit-anchorBottom-gap);
 const side=direction==='below'?'below':naturalHeight<=below?'below':naturalHeight<=above?'above':below>=above?'below':'above';
 const maxHeight=side==='below'?below:above;
 const height=Math.min(Math.max(0,naturalHeight),maxHeight);
 const top=side==='below'?anchorBottom+gap:anchorTop-gap-height;
 return {side,top,height,maxHeight};
}
export function contentMenuPageMoved(openedAt,current,tolerance=.5){
 return Boolean(openedAt)&&(Math.abs(current.x-openedAt.x)>tolerance||Math.abs(current.y-openedAt.y)>tolerance);
}
// A grouped checkbox changes only its own option values; all other facets remain.
export function contentCategoryGroupState(selectedValues=[],groupValues=[]){
 const selected=new Set(selectedValues),values=[...new Set(groupValues)];
 const count=values.filter(value=>selected.has(value)).length;
 return count===0?'false':count===values.length?'true':'mixed';
}
export function toggleContentCategoryGroup(selectedValues=[],groupValues=[]){
 const selected=new Set(selectedValues),values=[...new Set(groupValues)];
 if(contentCategoryGroupState([...selected],values)==='true')for(const value of values)selected.delete(value);
 else for(const value of values)selected.add(value);
 return [...selected];
}
export function mountContentControls({container,getLocale,getState,getFilter=()=>null,onChange,idPrefix='content',controls=['category','layout','sort']}){
 const doc=container.ownerDocument;
 container.replaceChildren();
 container.className='cp-content-controls';
 container.removeAttribute('role');container.removeAttribute('aria-label');
 const menus=[];
 const expandedCategoryGroups=new Set();
 let openedAtScroll=null,categoryUpdating=false,categoryUpdateVersion=0,categoryUpdateFrame=0,filterDialog=null;
 const pageScroll=()=>({x:doc.defaultView?.scrollX||0,y:doc.defaultView?.scrollY||0});
 const labels=()=>contentControlCopy[getLocale()]||contentControlCopy.fr;
 const categoryValues=filter=>{
  const valid=new Set((filter?.options||[]).filter(option=>option.value!=='all').map(option=>option.value));
  return [...new Set(Array.isArray(filter?.values)?filter.values:[])].filter(value=>valid.has(value));
 };
 function cancelCategoryUpdate(){
  categoryUpdateVersion++;categoryUpdating=false;
  if(categoryUpdateFrame){doc.defaultView?.cancelAnimationFrame?.(categoryUpdateFrame);categoryUpdateFrame=0;}
 }
 function close(restoreFocus=false){
  cancelCategoryUpdate();
  filterDialog?.close(restoreFocus);
  openedAtScroll=null;
  for(const menu of menus){
   const wasOpen=!menu.panel.hidden;menu.panel.hidden=true;menu.trigger.setAttribute('aria-expanded','false');
   if(restoreFocus&&wasOpen)menu.trigger.focus({preventScroll:true});
  }
 }
 function position(menu){
  const view=doc.defaultView;
  const visibleRect=element=>{
   if(!element||element.hidden||element.closest('[hidden]'))return null;
   const style=view.getComputedStyle(element);
   if(style.display==='none'||style.visibility==='hidden')return null;
   const rect=element.getBoundingClientRect();
   return rect.width&&rect.height?rect:null;
  };
  const viewportHeight=view.visualViewport?.height||doc.documentElement.clientHeight;
  const viewportTop=view.visualViewport?.offsetTop||0;
  const headerRects=[visibleRect(doc.querySelector('.app > .header')),visibleRect(doc.getElementById('scope-bar'))].filter(Boolean);
  const dockRects=[visibleRect(doc.querySelector('.dock-search-toggle')),visibleRect(doc.getElementById('main-nav'))].filter(Boolean);
  const readingRect=visibleRect(container.closest('[data-detail-scroll="reading"]'));
  const topLimit=Math.max(viewportTop+8,readingRect?readingRect.top+8:0,...headerRects.map(rect=>rect.bottom+8));
  const bottomLimit=Math.min(viewportTop+viewportHeight-8,readingRect?readingRect.bottom-8:Infinity,...dockRects.map(rect=>rect.top-8));
  menu.panel.style.maxHeight='none';
  const anchor=menu.trigger.getBoundingClientRect(),wrapper=menu.wrapper.getBoundingClientRect();
  const panelStyle=view.getComputedStyle(menu.panel);
  const naturalHeight=menu.panel.scrollHeight+parseFloat(panelStyle.borderTopWidth)+parseFloat(panelStyle.borderBottomWidth);
  const placement=contentMenuPlacement({anchorTop:anchor.top,anchorBottom:anchor.bottom,naturalHeight,topLimit,bottomLimit,direction:menu.name==='layout'?'auto':'below'});
  menu.panel.dataset.placement=placement.side;
  menu.panel.style.insetBlockStart=(placement.top-wrapper.top)+'px';
  menu.panel.style.maxHeight=placement.maxHeight+'px';
  // Wrapped controls can change columns; constrain the panel to the viewport
  // while retaining alignment with its trigger, in either writing direction.
  const viewportLeft=view.visualViewport?.offsetLeft||0;
  const viewportWidth=view.visualViewport?.width||doc.documentElement.clientWidth;
  const panelWidth=menu.panel.offsetWidth;
  const rtl=view.getComputedStyle(container).direction==='rtl',alignStart=menu.name!=='sort';
  const preferredLeft=(rtl?alignStart:!alignStart)?anchor.right-panelWidth:anchor.left;
  const leftLimit=Math.max(viewportLeft+12,readingRect?readingRect.left+8:0);
  const rightLimit=Math.min(viewportLeft+viewportWidth-12,readingRect?readingRect.right-8:Infinity);
  const panelLeft=Math.max(leftLimit,Math.min(preferredLeft,rightLimit-panelWidth));
  menu.panel.style.insetInlineEnd='auto';
  menu.panel.style.insetInlineStart=(rtl?wrapper.right-panelLeft-panelWidth:panelLeft-wrapper.left)+'px';

 }
 function focusItem(menu,index){
  const item=menu.focusItems()[index];if(!item)return;item.focus({preventScroll:true});
  const bounds=menu.panel.getBoundingClientRect(),target=item.getBoundingClientRect();
  const top=bounds.top+menu.panel.clientTop+5,bottom=bounds.bottom-menu.panel.clientTop-5;
  // Scroll only the menu; focusing its last option must not move the document.
  if(target.top<top)menu.panel.scrollTop-=top-target.top;
  else if(target.bottom>bottom)menu.panel.scrollTop+=target.bottom-bottom;
 }
 function makeMenu(name,options){
  const wrapper=doc.createElement('div');wrapper.className='cp-control-menu';wrapper.dataset.control=name;
  const trigger=doc.createElement('button');trigger.type='button';trigger.id=idPrefix+'-'+name+'-button';trigger.className='cp-control-trigger';
  trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML=svg(name==='layout'?'grid':name==='category'?'filter':'sort')+'<span></span>'+svg('chevron');
  const panel=doc.createElement('div');panel.className='cp-control-panel';panel.id=idPrefix+'-'+name+'-menu';panel.hidden=true;panel.setAttribute('role','menu');panel.setAttribute('aria-labelledby',trigger.id);
  trigger.setAttribute('aria-controls',panel.id);
  const items=[],groups=[];
  const note=doc.createElement('p');note.className='cp-control-note';
  const focusItems=()=>items.filter(item=>!item.closest('[hidden]'));
  function settleChoice(button){
   if(panel.hidden||wrapper.hidden)return;
   position(menu);
   const index=focusItems().indexOf(button);
   if(index>=0)focusItem(menu,index);
   // A selection or a disclosure can reflow the collection and clamp the page.
   openedAtScroll=pageScroll();
  }
  function chooseCategory(button,action){
   const token=++categoryUpdateVersion;
   categoryUpdating=true;
   if(categoryUpdateFrame){doc.defaultView?.cancelAnimationFrame?.(categoryUpdateFrame);categoryUpdateFrame=0;}
   try{action();refresh();}catch(error){categoryUpdating=false;throw error;}
   const restore=()=>{
    if(token!==categoryUpdateVersion)return false;
    if(panel.hidden||wrapper.hidden){categoryUpdating=false;return false;}
    settleChoice(button);return true;
   };
   if(!restore())return;
   const finish=()=>{
    categoryUpdateFrame=0;
    if(token!==categoryUpdateVersion)return;
    restore();categoryUpdating=false;
   };
   if(doc.defaultView?.requestAnimationFrame)categoryUpdateFrame=doc.defaultView.requestAnimationFrame(finish);
   else finish();
  }
  function setOptions(nextOptions,nextGroups=[]){
   panel.replaceChildren();items.length=0;groups.length=0;
   function appendOption(parent,{value,icon,type='radio',action,label}){
    const button=doc.createElement('button');button.type='button';button.dataset.value=value;button.setAttribute('role',type==='checkbox'?'menuitemcheckbox':'menuitemradio');button.tabIndex=-1;
    button.innerHTML=svg(icon)+'<span></span>'+svg('check');
    if(label!==undefined)button.querySelector('span').textContent=label;
    button.addEventListener('click',()=>{
     if(name!=='category'){close(true);action();return;}
     // Updating values must preserve nodes, open groups and keyboard focus.
     chooseCategory(button,action);
    });
    parent.append(button);items.push(button);return button;
   }
   if(name==='category'&&nextGroups.length){
    nextOptions.filter(option=>option.value==='all').forEach(option=>appendOption(panel,option));
    for(const definition of nextGroups){
     const group=doc.createElement('div');group.className='cp-filter-group';group.setAttribute('role','none');
     const button=doc.createElement('button');button.type='button';button.className='cp-filter-group-trigger';button.dataset.group=definition.value;button.tabIndex=-1;button.setAttribute('role','menuitem');
     button.id=idPrefix+'-category-group-'+groups.length;
     button.innerHTML=svg('filter')+'<span></span>';button.querySelector('span').textContent=definition.label;
     const count=doc.createElement('span');count.className='cp-filter-group-count';count.setAttribute('aria-hidden','true');
     const chevron=doc.createElement('span');chevron.className='cp-filter-group-chevron';chevron.setAttribute('aria-hidden','true');chevron.innerHTML=svg('chevron');
     button.append(count,chevron);
     const content=doc.createElement('div');content.className='cp-filter-group-options';content.id=button.id+'-options';content.setAttribute('role','group');content.setAttribute('aria-labelledby',button.id);
     content.hidden=!expandedCategoryGroups.has(definition.value);button.setAttribute('aria-expanded',String(!content.hidden));button.setAttribute('aria-controls',content.id);
     const setExpanded=expanded=>{
      cancelCategoryUpdate();
      if(expanded)expandedCategoryGroups.add(definition.value);else expandedCategoryGroups.delete(definition.value);
      content.hidden=!expanded;button.setAttribute('aria-expanded',String(expanded));settleChoice(button);
     };
     button.addEventListener('click',()=>setExpanded(content.hidden));
     group.append(button,content);panel.append(group);items.push(button);
     const groupOptions=nextOptions.filter(option=>option.value!=='all'&&option.group===definition.value);
     let selectAll=null;
     if(definition.selectAllLabel&&groupOptions.length){
      selectAll=appendOption(content,{value:'group:'+definition.value,icon:'filter',type:'checkbox',label:definition.selectAllLabel,
       action:()=>onChange('category',toggleContentCategoryGroup(categoryValues(getFilter()),groupOptions.map(option=>option.value)))});
      selectAll.dataset.groupAll=definition.value;selectAll.classList.add('cp-filter-group-all');
     }
     groupOptions.forEach(option=>appendOption(content,option));
     groups.push({definition,button,content,count,setExpanded,selectAll,groupValues:groupOptions.map(option=>option.value)});
    }
    // Keep any caller-supplied ungrouped choice reachable rather than discarding it.
    nextOptions.filter(option=>option.value!=='all'&&!nextGroups.some(group=>group.value===option.group)).forEach(option=>appendOption(panel,option));
   }else nextOptions.forEach(option=>appendOption(panel,option));
   if(name==='sort')panel.append(note);
  }
  setOptions(options);
  if(name==='sort'){note.id=idPrefix+'-sort-note';panel.setAttribute('aria-describedby',note.id);}
  const menu={name,wrapper,trigger,panel,items,groups,note,setOptions,focusItems};menus.push(menu);
  function open(index){
   close();refresh();if(wrapper.hidden)return;
   if(name==='category'&&getFilter()?.presentation==='dialog'){
    filterDialog??=createProjectFilterDialog({doc,trigger,idPrefix,onApply:values=>onChange('category',values),onClose:()=>trigger.setAttribute('aria-expanded','false')});
    trigger.setAttribute('aria-expanded','true');filterDialog.open(getFilter(),getLocale());return;
   }
   if(!items.length)return;panel.hidden=false;trigger.setAttribute('aria-expanded','true');position(menu);openedAtScroll=pageScroll();
   const visible=focusItems(),selected=visible.findIndex(item=>item.getAttribute('aria-checked')==='true');
   focusItem(menu,index==='last'?visible.length-1:index===undefined?Math.max(0,selected):Math.max(0,Math.min(index,visible.length-1)));
  }
  trigger.addEventListener('click',()=>panel.hidden?open():close(true));
  trigger.addEventListener('keydown',event=>{
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open(event.key==='ArrowUp'?'last':0);}
  });
  panel.addEventListener('keydown',event=>{
   if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(event.key))cancelCategoryUpdate();
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return;}
   if(event.key==='Tab'){close(true);return;}
   const expandKey=getLocale()==='ar'?'ArrowLeft':'ArrowRight',collapseKey=getLocale()==='ar'?'ArrowRight':'ArrowLeft';
   const group=groups.find(item=>item.button===doc.activeElement||item.content.contains(doc.activeElement));
   if(group&&event.key===expandKey&&doc.activeElement===group.button){event.preventDefault();group.setExpanded(true);return;}
   if(group&&event.key===collapseKey){event.preventDefault();group.setExpanded(false);return;}
   const visible=focusItems(),current=visible.indexOf(doc.activeElement);
   const destination={ArrowDown:(current+1)%visible.length,ArrowUp:(current+visible.length-1)%visible.length,Home:0,End:visible.length-1}[event.key];
   if(destination!==undefined){event.preventDefault();focusItem(menu,destination);}
  });
  wrapper.append(trigger,panel);container.append(wrapper);return menu;
 }
 if(controls.includes('category'))makeMenu('category',[]);
 if(controls.includes('layout'))makeMenu('layout',['grid','list'].map(value=>({value,icon:value,action:()=>onChange('view',value)})));
 if(controls.includes('sort'))makeMenu('sort',[
  ...['newest','oldest','favorites'].map(value=>({value,icon:value==='favorites'?'heart':'sort',action:()=>onChange('sort',value)})),
  {value:'favoritesOnly',icon:'heart',type:'checkbox',action:()=>onChange('favoritesOnly',!getState().favoritesOnly)},
 ]);
 function refresh(){
  const copy=labels(),state=getState();
  for(const menu of menus){
   if(menu.name==='category'){
    const filter=getFilter(),options=Array.isArray(filter?.options)?filter.options:[];
    const available=Boolean(filter&&options.length);
    if(!available){
     const heldFocus=menu.wrapper.contains(doc.activeElement);
     menu.wrapper.hidden=true;menu.panel.hidden=true;menu.trigger.setAttribute('aria-expanded','false');
     if(heldFocus)menus.find(item=>item.name==='layout')?.trigger.focus({preventScroll:true});
     continue;
    }
    menu.wrapper.hidden=false;
    const groups=Array.isArray(filter.groups)?filter.groups:[],dialogMode=filter.presentation==='dialog';
    menu.trigger.dataset.presentation=dialogMode?'dialog':'menu';menu.trigger.setAttribute('aria-haspopup',dialogMode?'dialog':'menu');
    menu.trigger.setAttribute('aria-controls',dialogMode?idPrefix+'-category-dialog':menu.panel.id);
    const signature=JSON.stringify([filter.presentation,options.map(option=>[option.value,option.label,option.group]),groups.map(group=>[group.value,group.label,group.selectAllLabel])]);
    if(signature!==menu.optionSignature){
     if(!menu.panel.hidden)close(true);
     menu.setOptions(dialogMode?[]:options.map(option=>({...option,icon:'filter',type:'checkbox',action:()=>{
      const current=categoryValues(getFilter());
      const next=option.value==='all'?[]:current.includes(option.value)?current.filter(value=>value!==option.value):[...current,option.value];
      onChange('category',next);
     }})),dialogMode?[]:groups);
     menu.optionSignature=signature;
    }
    const selectedValues=categoryValues(filter);
    const selected=options.filter(option=>selectedValues.includes(option.value));
    const all=options.find(option=>option.value==='all');
    const countLabel=filter.selectionLabel||new Intl.NumberFormat(getLocale()).format(selected.length)+' '+({fr:'sélections',en:'selected',ar:'اختيارات'}[getLocale()]||'selected');
    menu.trigger.querySelector('span').textContent=dialogMode?projectFilterDialogLabel(getLocale()):!selected.length?filter.label:selected.length===1?selected[0].label:countLabel;
    const selectionNames=selected.length?selected.map(option=>option.label).join(getLocale()==='ar'?'، ':', '):all?.label||filter.label;
    const triggerLabel=dialogMode?projectFilterDialogLabel(getLocale()):filter.label;
    menu.trigger.setAttribute('aria-label',triggerLabel+' · '+selectionNames);
    menu.trigger.title=triggerLabel+' · '+selectionNames;
    menu.trigger.dataset.filtered=String(selected.length>0);
    for(const item of menu.items)if(item.dataset.value!==undefined&&!item.dataset.groupAll)item.setAttribute('aria-checked',String(item.dataset.value==='all'?selected.length===0:selectedValues.includes(item.dataset.value)));
    for(const group of menu.groups){
     if(group.selectAll){
      const state=contentCategoryGroupState(selectedValues,group.groupValues);
      group.selectAll.setAttribute('aria-checked',state);
      group.selectAll.querySelector('svg:last-child').innerHTML=state==='mixed'?'<path d="M5 12h14"/>':paths.check;
     }
     const count=options.filter(option=>option.group===group.definition.value&&selectedValues.includes(option.value)).length;
     const formatted=new Intl.NumberFormat(getLocale()).format(count);
     group.count.textContent=formatted;group.button.dataset.selected=String(count>0);
     const description=getLocale()==='fr'?formatted+' sélection'+(count===1?'':'s'):getLocale()==='ar'?formatted+' اختيارات':formatted+' selected';
     group.button.setAttribute('aria-label',group.definition.label+' · '+description);
    }
    continue;
   }
   menu.trigger.querySelector('span').textContent=copy[menu.name];
   menu.trigger.setAttribute('aria-label',copy[menu.name]+' · '+copy[menu.name==='layout'?state.view:state.sort]);
   menu.trigger.title=menu.trigger.getAttribute('aria-label');
   if(menu.name==='layout')menu.trigger.querySelector('svg').innerHTML=paths[state.view];
   if(menu.name==='sort'){menu.trigger.dataset.filtered=String(state.favoritesOnly);menu.note.textContent=copy.local+' '+copy.dates;}
   for(const item of menu.items){
    const value=item.dataset.value;
    item.querySelector('span').textContent=copy[value];
    item.setAttribute('aria-checked',String(value==='favoritesOnly'?state.favoritesOnly:(menu.name==='layout'?state.view:state.sort)===value));
   }
  }
 }
 doc.addEventListener('pointerdown',event=>{if(!container.contains(event.target)&&!filterDialog?.contains(event.target))close();});
 container.addEventListener('focusout',event=>{if(!categoryUpdating&&!container.contains(event.relatedTarget)&&!filterDialog?.contains(event.relatedTarget))close();});
 doc.defaultView?.addEventListener('resize',()=>{if(!filterDialog?.isOpen)close();});
 doc.defaultView?.visualViewport?.addEventListener('resize',()=>{if(!filterDialog?.isOpen)close();});
 doc.addEventListener('scroll',event=>{
  const documentScroll=event.target===doc||event.target===doc.documentElement||event.target===doc.body;
  if(documentScroll&&!categoryUpdating&&contentMenuPageMoved(openedAtScroll,pageScroll()))close();
 },{capture:true,passive:true});
 refresh();return {refresh,close};
}
export function createFavoriteButton({document:doc=globalThis.document,entry,locale='fr',saved=false,compact=false,onToggle}){
 const copy=contentControlCopy[locale]||contentControlCopy.fr;
 const button=doc.createElement('button');button.type='button';button.className='cp-favorite'+(compact?' cp-favorite-compact':'');
 button.dataset.favoriteId=entry.id;button.setAttribute('aria-pressed',String(saved));
 button.setAttribute('aria-label',(saved?copy.remove:copy.add)+' · '+entry.title[locale]);
 button.title=(saved?copy.remove:copy.add)+' — '+copy.local.split('. ')[0]+'.';
 button.innerHTML=svg('heart');
 if(!compact){const label=doc.createElement('span');label.textContent=saved?copy.saved:copy.save;button.append(label);}
 button.addEventListener('click',()=>onToggle(entry.id));
 return button;
}
