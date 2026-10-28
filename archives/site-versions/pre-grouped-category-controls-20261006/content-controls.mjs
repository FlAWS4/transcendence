export const contentControlCopy={
 fr:{layout:'Affichage',grid:'Grille',list:'Liste',sort:'Trier',newest:'Du plus récent au plus ancien',oldest:'Du plus ancien au plus récent',favorites:'Le plus de favoris',favoritesOnly:'Mes favoris uniquement',local:'Favoris conservés dans ce navigateur. Le tri utilise vos favoris, sans compteur public.',dates:'Dates illustratives des contenus de démonstration.',add:'Ajouter aux favoris',remove:'Retirer des favoris',saved:'Favori',save:'Mettre en favoris',savedNotice:'Ajouté aux favoris dans ce navigateur.',removedNotice:'Retiré des favoris.',emptyTitle:'Aucun favori dans ce périmètre',emptyText:'Enregistre un contenu avec le cœur, ou affiche tous les contenus.',showAll:'Afficher tous les contenus'},
 en:{layout:'View',grid:'Grid',list:'List',sort:'Sort',newest:'Newest first',oldest:'Oldest first',favorites:'Most favorites',favoritesOnly:'My favorites only',local:'Favorites stay in this browser. Sorting uses your favorites, without a public count.',dates:'Illustrative dates for the sample content.',add:'Add to favorites',remove:'Remove from favorites',saved:'Saved',save:'Save to favorites',savedNotice:'Saved to favorites in this browser.',removedNotice:'Removed from favorites.',emptyTitle:'No favorites in this location',emptyText:'Save a story using its heart, or show all content.',showAll:'Show all content'},
 ar:{layout:'العرض',grid:'شبكة',list:'قائمة',sort:'الترتيب',newest:'من الأحدث إلى الأقدم',oldest:'من الأقدم إلى الأحدث',favorites:'الأكثر تفضيلًا',favoritesOnly:'المفضلة فقط',local:'تُحفظ المفضلة في هذا المتصفح. يعتمد الترتيب على مفضلتك، دون عدّاد عام.',dates:'تواريخ توضيحية للمحتوى التجريبي.',add:'إضافة إلى المفضلة',remove:'إزالة من المفضلة',saved:'في المفضلة',save:'حفظ في المفضلة',savedNotice:'حُفظ في المفضلة في هذا المتصفح.',removedNotice:'أُزيل من المفضلة.',emptyTitle:'لا توجد مفضلة ضمن هذا النطاق',emptyText:'احفظ محتوى باستخدام القلب، أو اعرض كل المحتوى.',showAll:'عرض كل المحتوى'},
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
export function mountContentControls({container,getLocale,getState,getFilter=()=>null,onChange}){
 const doc=container.ownerDocument;
 container.replaceChildren();
 container.className='cp-content-controls';
 container.removeAttribute('role');container.removeAttribute('aria-label');
 const menus=[];
 let openedAtScroll=null;
 const pageScroll=()=>({x:doc.defaultView?.scrollX||0,y:doc.defaultView?.scrollY||0});
 const labels=()=>contentControlCopy[getLocale()]||contentControlCopy.fr;
 const categoryValues=filter=>{
  const valid=new Set((filter?.options||[]).filter(option=>option.value!=='all').map(option=>option.value));
  return [...new Set(Array.isArray(filter?.values)?filter.values:[])].filter(value=>valid.has(value));
 };
 function close(restoreFocus=false){
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
  const topLimit=Math.max(viewportTop+8,...headerRects.map(rect=>rect.bottom+8));
  const bottomLimit=Math.min(viewportTop+viewportHeight-8,...dockRects.map(rect=>rect.top-8));
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
  const panelLeft=Math.max(viewportLeft+12,Math.min(preferredLeft,viewportLeft+viewportWidth-panelWidth-12));
  menu.panel.style.insetInlineEnd='auto';
  menu.panel.style.insetInlineStart=(rtl?wrapper.right-panelLeft-panelWidth:panelLeft-wrapper.left)+'px';

 }
 function focusItem(menu,index){
  const item=menu.items[index];item.focus({preventScroll:true});
  const bounds=menu.panel.getBoundingClientRect(),target=item.getBoundingClientRect();
  const top=bounds.top+menu.panel.clientTop+5,bottom=bounds.bottom-menu.panel.clientTop-5;
  // Scroll only the menu; focusing its last option must not move the document.
  if(target.top<top)menu.panel.scrollTop-=top-target.top;
  else if(target.bottom>bottom)menu.panel.scrollTop+=target.bottom-bottom;
 }
 function makeMenu(name,options){
  const wrapper=doc.createElement('div');wrapper.className='cp-control-menu';wrapper.dataset.control=name;
  const trigger=doc.createElement('button');trigger.type='button';trigger.id='content-'+name+'-button';trigger.className='cp-control-trigger';
  trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML=svg(name==='layout'?'grid':name==='category'?'filter':'sort')+'<span></span>'+svg('chevron');
  const panel=doc.createElement('div');panel.className='cp-control-panel';panel.id='content-'+name+'-menu';panel.hidden=true;panel.setAttribute('role','menu');panel.setAttribute('aria-labelledby',trigger.id);
  trigger.setAttribute('aria-controls',panel.id);
  const items=[];
  const note=doc.createElement('p');note.className='cp-control-note';
  function setOptions(nextOptions){
   for(const item of items)item.remove();
   items.length=0;
   for(const {value,icon,type='radio',action,label} of nextOptions){
    const button=doc.createElement('button');button.type='button';button.dataset.value=value;button.setAttribute('role',type==='checkbox'?'menuitemcheckbox':'menuitemradio');button.tabIndex=-1;
    button.innerHTML=svg(icon)+'<span></span>'+svg('check');
    if(label!==undefined)button.querySelector('span').textContent=label;
    button.addEventListener('click',()=>{
     if(name!=='category'){close(true);action();return;}
     // Multiple choices stay in the same menu. The caller may rerender the
     // collection, but unchanged options keep their identity and keyboard focus.
     action();refresh();
     if(!panel.hidden&&!wrapper.hidden){
      position(menu);
      const index=items.indexOf(button);
      if(index>=0)focusItem(menu,index);
      // Filtering can shorten the document and clamp its scroll position.
      // Treat that reflow as part of this selection, not as a scroll dismissal.
      openedAtScroll=pageScroll();
     }
    });
    panel.append(button);items.push(button);
   }
   if(name==='sort')panel.append(note);
  }
  setOptions(options);
  if(name==='sort'){note.id='content-sort-note';panel.setAttribute('aria-describedby',note.id);}
  const menu={name,wrapper,trigger,panel,items,note,setOptions};menus.push(menu);
  function open(index){
   close();refresh();if(wrapper.hidden||!items.length)return;panel.hidden=false;trigger.setAttribute('aria-expanded','true');position(menu);openedAtScroll=pageScroll();
   const selected=items.findIndex(item=>item.getAttribute('aria-checked')==='true');
   focusItem(menu,index==='last'?items.length-1:index===undefined?Math.max(0,selected):Math.max(0,Math.min(index,items.length-1)));
  }
  trigger.addEventListener('click',()=>panel.hidden?open():close(true));
  trigger.addEventListener('keydown',event=>{
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open(event.key==='ArrowUp'?'last':0);}
  });
  panel.addEventListener('keydown',event=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return;}
   if(event.key==='Tab'){close(true);return;}
   const current=items.indexOf(doc.activeElement);
   const destination={ArrowDown:(current+1)%items.length,ArrowUp:(current+items.length-1)%items.length,Home:0,End:items.length-1}[event.key];
   if(destination!==undefined){event.preventDefault();focusItem(menu,destination);}
  });
  wrapper.append(trigger,panel);container.append(wrapper);return menu;
 }
 makeMenu('category',[]);
 makeMenu('layout',['grid','list'].map(value=>({value,icon:value,action:()=>onChange('view',value)})));
 makeMenu('sort',[
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
    const signature=JSON.stringify(options.map(option=>[option.value,option.label]));
    if(signature!==menu.optionSignature){
     if(!menu.panel.hidden)close(true);
     menu.setOptions(options.map(option=>({...option,icon:'filter',type:'checkbox',action:()=>{
      const current=categoryValues(getFilter());
      const next=option.value==='all'?[]:current.includes(option.value)?current.filter(value=>value!==option.value):[...current,option.value];
      onChange('category',next);
     }})));
     menu.optionSignature=signature;
    }
    const selectedValues=categoryValues(filter);
    const selected=options.filter(option=>selectedValues.includes(option.value));
    const all=options.find(option=>option.value==='all');
    const countLabel=filter.selectionLabel||new Intl.NumberFormat(getLocale()).format(selected.length)+' '+({fr:'sélections',en:'selected',ar:'اختيارات'}[getLocale()]||'selected');
    menu.trigger.querySelector('span').textContent=!selected.length?filter.label:selected.length===1?selected[0].label:countLabel;
    const selectionNames=selected.length?selected.map(option=>option.label).join(getLocale()==='ar'?'، ':', '):all?.label||filter.label;
    menu.trigger.setAttribute('aria-label',filter.label+' · '+selectionNames);
    menu.trigger.title=filter.label+' · '+selectionNames;
    menu.trigger.dataset.filtered=String(selected.length>0);
    for(const item of menu.items)item.setAttribute('aria-checked',String(item.dataset.value==='all'?selected.length===0:selectedValues.includes(item.dataset.value)));
    continue;
   }
   menu.trigger.querySelector('span').textContent=copy[menu.name];
   menu.trigger.setAttribute('aria-label',copy[menu.name]+' · '+copy[menu.name==='layout'?state.view:state.sort]);
   menu.trigger.title=copy[menu.name==='layout'?state.view:state.sort];
   if(menu.name==='layout')menu.trigger.querySelector('svg').innerHTML=paths[state.view];
   if(menu.name==='sort'){menu.trigger.dataset.filtered=String(state.favoritesOnly);menu.note.textContent=copy.local+' '+copy.dates;}
   for(const item of menu.items){
    const value=item.dataset.value;
    item.querySelector('span').textContent=copy[value];
    item.setAttribute('aria-checked',String(value==='favoritesOnly'?state.favoritesOnly:(menu.name==='layout'?state.view:state.sort)===value));
   }
  }
 }
 doc.addEventListener('pointerdown',event=>{if(!container.contains(event.target))close();});
 container.addEventListener('focusout',event=>{if(!container.contains(event.relatedTarget))close();});
 doc.defaultView?.addEventListener('resize',()=>close());
 doc.defaultView?.visualViewport?.addEventListener('resize',()=>close());
 doc.addEventListener('scroll',event=>{
  const documentScroll=event.target===doc||event.target===doc.documentElement||event.target===doc.body;
  if(documentScroll&&contentMenuPageMoved(openedAtScroll,pageScroll()))close();
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
