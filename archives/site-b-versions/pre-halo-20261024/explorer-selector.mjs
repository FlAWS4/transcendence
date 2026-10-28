/* Explorer level selector of version B (24 Oct 2026): one large centred card per level with its neighbours
 * on the sides, then the campus screen. Moving the cursor never filters: a card's click is the only path to
 * onValidate, keyboard activation reaching it as the native detail-0 click. Only root.ownerDocument and its
 * defaultView are used, so a fake document can drive the whole module. */
const copy={
 fr:{title:'Explorer',words:{continents:'Continent',countries:'Pays',campuses:'Campus'},previous:'Précédent',next:'Suivant',select:'Valider',position:'{i} sur {n}',carousel:'carrousel',keys:'Flèches pour choisir · Entrée pour valider · Échap pour revenir',touch:'Glisse pour choisir · Touche la carte du centre pour valider',back:'Revenir aux campus · {country}',siblings:'Tous les campus · {country}',campus:'Campus · {country}'},
 en:{title:'Explore',words:{continents:'Continent',countries:'Country',campuses:'Campus'},previous:'Previous',next:'Next',select:'Select',position:'{i} of {n}',carousel:'carousel',keys:'Arrow keys to choose · Enter to select · Esc to go back',touch:'Swipe to choose · Tap the centre card to select',back:'Back to campuses · {country}',siblings:'All campuses · {country}',campus:'Campus · {country}'},
 ar:{title:'استكشف',words:{continents:'القارة',countries:'الدولة',campuses:'الفرع'},previous:'السابق',next:'التالي',select:'تأكيد',position:'{i} من {n}',carousel:'عرض دوّار',keys:'الأسهم للاختيار · Enter للتأكيد · Esc للرجوع',touch:'اسحب للاختيار · المس البطاقة الوسطى للتأكيد',back:'العودة إلى فروع {country}',siblings:'جميع فروع {country}',campus:'الفرع · {country}'},
};
const words=locale=>{const language=String(locale||'fr').toLowerCase().split(/[-_]/)[0];return Object.hasOwn(copy,language)?copy[language]:copy.fr;};
const format=(template,values)=>template.replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));
const keyOf=item=>item.kind+':'+item.id;
const EASE='cubic-bezier(.22,1,.36,1)',SVG='http://www.w3.org/2000/svg';
// Pointer clicks landing within 350 ms of a new level belong to the gesture that opened it.
const SETTLE_MS=350,DRAG_PX=8,WHEEL_STEP=50,WHEEL_IDLE=150,MAX_DOTS=60;
let instanceCount=0;

export function createExplorerSelector({root,getLocale=()=>'fr',motion=null,onValidate=()=>{},onAscend=()=>{},onAnnounce=()=>{},renderCampus=null}){
 const doc=root.ownerDocument,view=doc.defaultView||{},disposers=[],running=new Map(),leaving=new Set();
 let current=null,cursorId=null,changedAt=-Infinity,pressed=null,gesture=null,swallow=null,destroyed=false;
 const wheel={sum:0,locked:false,timer:null};
 const now=()=>view.performance?.now?.()??Date.now();
 const t=()=>words(getLocale());
 const rtl=()=>doc.documentElement?.dir==='rtl';
 const reduced=()=>Boolean(motion?.matches);
 const listen=(target,type,listener,options,bucket=disposers)=>{target.addEventListener(type,listener,options);bucket.push(()=>target.removeEventListener(type,listener,options));};
 const create=(tag,className,text)=>{const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
 const icon=name=>{const svg=doc.createElementNS(SVG,'svg'),use=doc.createElementNS(SVG,'use');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');use.setAttribute('href','#i-'+name);svg.append(use);return svg;};
 const editable=node=>Boolean(node?.isContentEditable||node?.closest?.('input,textarea,select'));
 const setDisabled=(button,disabled)=>{if(disabled)button.setAttribute('aria-disabled','true');else button.removeAttribute('aria-disabled');};
 const translate=offset=>`translateX(${offset}px)`;
 const validCursor=next=>next.items.some(item=>item.id===next.cursorId)?next.cursorId:next.items[0]?.id??null;
 const cardFor=(level,id)=>{const item=level.view.items.find(entry=>entry.id===id);return item?level.cards.get(keyOf(item)):null;};
 const cardFocused=level=>{const active=doc.activeElement;return Boolean(active?.dataset&&'explorerCard' in active.dataset&&level.element.contains(active));};

 let title=root.querySelector?.('#explorer-title');const ownTitle=!title;
 if(ownTitle){title=create('h1','sr-only');title.id='explorer-title';root.prepend(title);}
 title.textContent=t().title;
 const Observer=view.ResizeObserver;
 const observer=typeof Observer==='function'?new Observer(()=>{if(current?.kind==='level'&&!gesture?.dragging)centre(current,false);}):null;
 observer?.observe(root);

 function focusNode(node){
  if(!node?.focus)return;
  node.focus({preventScroll:true});
  // When the band is too short the stage itself scrolls: keep the focused control inside it.
  if(node!==root&&root.scrollHeight>root.clientHeight+1)node.scrollIntoView?.({block:'nearest'});
 }
 function focusTarget(){
  if(current?.kind==='level'){const card=cardFor(current,cursorId);if(card)return focusNode(card);}
  if(current?.kind==='campus')return focusNode(current.title);
  focusNode(root);
 }

 // Decorative motion only: every DOM and focus change has already happened when these start.
 function play(element,keyframes,options,onEnd){
  if(typeof element.animate!=='function'){onEnd?.(true);return null;}
  const animation=element.animate(keyframes,{easing:EASE,...options});
  running.set(animation,onEnd);
  const end=finished=>{if(!running.has(animation))return;running.delete(animation);onEnd?.(finished);};
  if(animation.finished)animation.finished.then(()=>end(true),()=>end(false));else end(true);
  return animation;
 }
 function settle(){
  for(const [animation,onEnd]of [...running]){running.delete(animation);animation.cancel();onEnd?.(false);}
  for(const level of [...leaving])drop(level);
 }
 function drop(level){
  if(!leaving.delete(level))return;
  level.element.remove();level.disposers.splice(0).forEach(dispose=>dispose());
  if(level.kind==='campus'){level.handle?.destroy?.();level.handle=null;}
 }
 function leave(level){
  if(level.kind==='level'){level.animation?.cancel();level.animation=null;observer?.unobserve(level.viewport);observer?.unobserve(level.track);}
  level.element.inert=true;level.element.setAttribute('aria-hidden','true');level.element.dataset.state='leaving';
  leaving.add(level);
 }

 function buildLevel(model){
  const n=++instanceCount;
  const element=create('div','explorer-level');element.dataset.level=model.level;
  const eyebrow=create('p','explorer-eyebrow');eyebrow.id='explorer-eyebrow-'+n;
  const hint=create('p','explorer-hint');hint.id='explorer-hint-'+n;
  const keys=create('span','explorer-hint-keys'),touch=create('span','explorer-hint-touch');hint.append(keys,touch);
  const carousel=create('div','explorer-carousel');carousel.setAttribute('role','group');carousel.setAttribute('aria-labelledby',eyebrow.id);carousel.setAttribute('aria-describedby',hint.id);
  const nav=direction=>{const button=create('button','explorer-nav');button.type='button';button.dataset.dir=direction;button.append(icon(direction==='prev'?'back':'arrow'));return button;};
  const prev=nav('prev'),next=nav('next'),viewport=create('div','explorer-viewport'),track=create('div','explorer-track');
  viewport.append(track);carousel.append(prev,viewport,next);
  const pager=create('div','explorer-pager');pager.setAttribute('aria-hidden','true');
  const count=create('span','explorer-pager-count');count.dir='ltr';
  const bar=create('span','explorer-pager-bar'),progress=create('span','explorer-pager-fill');bar.append(progress);pager.append(count,bar);
  element.append(eyebrow,carousel,pager,hint);
  const level={kind:'level',key:model.key,view:model,element,eyebrow,carousel,prev,next,viewport,track,count,progress,keys,touch,cards:new Map(),offset:0,animation:null,cursorId:null,disposers:[]};
  bindViewport(level);
  return level;
 }
 function createCard(item){
  const card=create('button','explorer-card');card.type='button';card.dataset.explorerCard='';card.dataset.id=item.id;card.dataset.kind=item.kind;
  const index=create('span','explorer-card-index'),name=create('span','explorer-card-name'),count=create('span','explorer-card-count'),dots=create('span','explorer-card-dots'),chip=create('span','explorer-card-chip');
  index.setAttribute('aria-hidden','true');dots.setAttribute('aria-hidden','true');chip.setAttribute('aria-hidden','true');name.dir='auto';
  card.append(index,name,count,dots,chip);
  return card;
 }
 // Cards are keyed by kind:id, so a re-render keeps the nodes (and the focus) of the same items.
 function syncCards(level){
  const items=level.view.items,keys=new Set(items.map(keyOf));
  for(const item of items)if(!level.cards.has(keyOf(item)))level.cards.set(keyOf(item),createCard(item));
  for(const [key,card]of level.cards)if(!keys.has(key)){card.remove();level.cards.delete(key);}
  const ordered=items.map(item=>level.cards.get(keyOf(item)));
  if(ordered.some((card,index)=>level.track.children[index]!==card)){
   // Moving a node blurs it: give the focus back to the same card after a re-sort.
   const active=doc.activeElement;ordered.forEach(card=>level.track.append(card));
   if(active&&active!==doc.activeElement&&active.isConnected)active.focus({preventScroll:true});
  }
 }
 function fillCard(card,item,index,total,text){
  const isCursor=item.id===cursorId,position=format(text.position,{i:index+1,n:total});
  const [number,name,count,dots,chip]=card.children,dotCount=Math.min(MAX_DOTS,Math.max(0,Math.floor(Number(item.campuses)||0)));
  number.textContent=String(index+1).padStart(2,'0');name.textContent=item.name;count.textContent=item.countText??'';chip.textContent=text.select;
  if(dots.children.length!==dotCount)dots.replaceChildren(...Array.from({length:dotCount},()=>create('i')));
  dots.style.setProperty('--explorer-dots',String(Math.min(dotCount,10)));
  card.setAttribute('aria-label',[item.ariaLabel||[item.name,item.countText].filter(Boolean).join(' · '),position,...(isCursor?[text.select]:[])].join(' · '));
  card.tabIndex=isCursor?0:-1;card.dataset.cursor=String(isCursor);
 }
 function paintLevel(level){
  const text=t(),items=level.view.items,total=items.length,index=items.findIndex(item=>item.id===cursorId);
  level.eyebrow.textContent=[level.view.step?.index,text.words[level.view.level],level.view.parent?.name].filter(part=>part!==undefined&&part!==null&&part!=='').join(' · ');
  level.carousel.setAttribute('aria-roledescription',text.carousel);
  level.prev.setAttribute('aria-label',text.previous);level.next.setAttribute('aria-label',text.next);
  setDisabled(level.prev,index<=0);setDisabled(level.next,index<0||index>=total-1);
  level.count.textContent=total?`${index+1} / ${total}`:'';
  level.progress.style.setProperty('--explorer-progress',String(total?(index+1)/total:0));
  level.keys.textContent=text.keys;level.touch.textContent=text.touch;
  items.forEach((item,position)=>fillCard(level.cards.get(keyOf(item)),item,position,total,text));
 }
 // Converts a running centring animation into the track's inline offset, where it is painted now.
 function settleTrack(level){
  if(!level.animation)return;
  const before=level.track.getBoundingClientRect().left;level.animation.cancel();level.animation=null;
  level.offset+=before-level.track.getBoundingClientRect().left;level.track.style.transform=translate(level.offset);
 }
 // Centring follows measured rectangles, never index × width, so RTL, pills and resizes need no special case.
 function centre(level,animate){
  const card=cardFor(level,level===current?cursorId:level.cursorId);if(!card)return;
  settleTrack(level);
  const frame=level.viewport.getBoundingClientRect();if(!frame.width)return;
  const box=card.getBoundingClientRect(),from=level.offset;
  level.offset=Math.round((from+frame.left+frame.width/2-box.left-box.width/2)*100)/100;
  level.track.style.transform=translate(level.offset);
  if(!animate||reduced()||Math.abs(level.offset-from)<.5)return;
  const animation=level.track.animate?.([{transform:translate(from)},{transform:translate(level.offset)}],{duration:320,easing:EASE});
  if(!animation)return;
  level.animation=animation;const end=()=>{if(level.animation===animation)level.animation=null;};
  animation.finished?.then(end,end);
 }
 function setCursor(id,{focus=false,animate=false,announce=false}={}){
  const level=current;if(level?.kind!=='level')return false;
  const items=level.view.items,index=items.findIndex(item=>item.id===id);if(index<0)return false;
  const changed=id!==cursorId;cursorId=id;level.cursorId=id;
  paintLevel(level);centre(level,animate);
  if(focus)focusNode(level.cards.get(keyOf(items[index])));
  if(announce&&changed)onAnnounce(`${items[index].name} · ${format(t().position,{i:index+1,n:items.length})}`);
  return changed;
 }
 function moveBy(step,options){
  const items=current.view.items,index=items.findIndex(item=>item.id===cursorId),target=Math.max(0,Math.min(items.length-1,index+step));
  return target!==index&&setCursor(items[target].id,options);
 }

 // Drag, swipe and wheel move the cursor only; a drag swallows the click that may follow it.
 function armSwallow(){
  disarmSwallow();
  const cancel=event=>{if(!(event.detail>0))return;disarmSwallow();event.preventDefault();event.stopPropagation();};
  root.addEventListener('click',cancel,true);
  swallow={cancel,timer:view.setTimeout?.(disarmSwallow,500)};
 }
 function disarmSwallow(){
  if(!swallow)return;
  root.removeEventListener('click',swallow.cancel,true);view.clearTimeout?.(swallow.timer);swallow=null;
 }
 function pitchOf(level){
  const cards=[...level.track.children];if(cards.length<2)return cards[0]?.getBoundingClientRect().width||0;
  return Math.abs(cards.at(-1).getBoundingClientRect().left-cards[0].getBoundingClientRect().left)/(cards.length-1);
 }
 function bindViewport(level){
  const {viewport,disposers:bucket}=level,own=event=>gesture?.level===level&&event.pointerId===gesture.pointerId;
  listen(viewport,'pointerdown',event=>{
   if(current!==level||event.isPrimary===false||event.button!==0)return;
   gesture={level,pointerId:event.pointerId,x:event.clientX,y:event.clientY,cursorId,dragging:false,base:0};
  },undefined,bucket);
  listen(viewport,'pointermove',event=>{
   if(!own(event))return;
   const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
   if(!gesture.dragging){
    if(Math.abs(dy)>=DRAG_PX&&Math.abs(dy)>=Math.abs(dx)){gesture=null;return;}
    if(Math.abs(dx)<DRAG_PX||Math.abs(dx)<=Math.abs(dy))return;
    gesture.dragging=true;viewport.setPointerCapture?.(event.pointerId);level.element.dataset.dragging='true';
    settleTrack(level);gesture.base=level.offset;
   }
   level.offset=gesture.base+dx;level.track.style.transform=translate(level.offset);
  },undefined,bucket);
  listen(viewport,'pointerup',event=>{
   if(!own(event))return;
   const drag=gesture;gesture=null;if(!drag.dragging)return;
   delete level.element.dataset.dragging;armSwallow();
   const items=level.view.items,from=items.findIndex(item=>item.id===drag.cursorId),pitch=pitchOf(level);
   const steps=pitch?Math.round(-(event.clientX-drag.x)*(rtl()?-1:1)/pitch):0,target=items[Math.max(0,Math.min(items.length-1,from+steps))];
   if(!target||target.id===cursorId||!setCursor(target.id,{animate:true,focus:cardFocused(level)}))centre(level,true);
  },undefined,bucket);
  const cancel=event=>{
   if(!own(event))return;
   const drag=gesture;gesture=null;
   if(drag.dragging){delete level.element.dataset.dragging;centre(level,true);}
  };
  // Touch pointers start captured by the pressed card: taking the capture fires a bubbling lostpointercapture there.
  listen(viewport,'pointercancel',cancel,undefined,bucket);listen(viewport,'lostpointercapture',event=>{if(event.target===viewport)cancel(event);},undefined,bucket);
  listen(viewport,'wheel',event=>{
   if(event.ctrlKey||event.metaKey||current!==level)return;
   event.preventDefault();
   const unit=event.deltaMode===1?16:event.deltaMode===2?viewport.getBoundingClientRect().width||1:1;
   const x=(Number(event.deltaX)||0)*unit,y=(Number(event.deltaY)||0)*unit,delta=Math.abs(x)>Math.abs(y)?x*(rtl()?-1:1):y;
   view.clearTimeout?.(wheel.timer);wheel.timer=view.setTimeout?.(()=>{wheel.sum=0;wheel.locked=false;},WHEEL_IDLE);
   if(wheel.locked||!delta)return;
   wheel.sum+=delta;if(Math.abs(wheel.sum)<WHEEL_STEP)return;
   const step=Math.sign(wheel.sum);wheel.sum=0;wheel.locked=true;
   moveBy(step,{animate:true,focus:cardFocused(level)});
  },{passive:false},bucket);
 }

 function buildCampus(next){
  const n=++instanceCount;
  const element=create('section','explorer-campus');element.dataset.level='campus';
  const head=create('div','explorer-campus-head'),back=create('button','explorer-campus-back'),backLabel=create('span','explorer-campus-back-label');
  back.type='button';backLabel.dir='auto';back.append(icon('back'),backLabel);
  const eyebrow=create('p','explorer-eyebrow'),heading=create('h2','explorer-campus-title'),name=create('span');
  heading.id='explorer-campus-title-'+n;heading.tabIndex=-1;name.dir='auto';heading.append(name);
  element.setAttribute('aria-labelledby',heading.id);head.append(back,eyebrow,heading);
  const body=create('div','explorer-campus-body'),strip=create('nav','explorer-siblings');
  element.append(head,body,strip);
  return {kind:'campus',key:next.key,view:next,element,back,backLabel,eyebrow,title:heading,name,body,strip,pills:new Map(),handle:null,campusId:null,locale:null,disposers:[]};
 }
 function syncSiblings(level){
  // The strip exists only when the country has at least two campuses.
  const list=level.view.siblings||[],siblings=list.length>1?list:[],currentId=level.view.campus?.id,ids=new Set(siblings.map(item=>item.id));
  level.strip.hidden=!siblings.length;
  for(const sibling of siblings)if(!level.pills.has(sibling.id)){
   const pill=create('button','explorer-sibling'),label=create('span','explorer-sibling-name');
   pill.type='button';pill.dataset.id=sibling.id;label.dir='auto';pill.append(icon('check'),label);level.pills.set(sibling.id,pill);
  }
  for(const [id,pill]of level.pills)if(!ids.has(id)){pill.remove();level.pills.delete(id);}
  const ordered=siblings.map(item=>level.pills.get(item.id));
  if(ordered.some((pill,index)=>level.strip.children[index]!==pill)){
   const active=doc.activeElement;ordered.forEach(pill=>level.strip.append(pill));
   if(active&&active!==doc.activeElement&&active.isConnected)active.focus({preventScroll:true});
  }
  siblings.forEach(sibling=>{
   const pill=level.pills.get(sibling.id);pill.children[1].textContent=sibling.name;
   if(sibling.id===currentId)pill.setAttribute('aria-current','true');else pill.removeAttribute('aria-current');
  });
 }
 // The strip scrolls the current campus into its own view, never its ancestors (rectangles, so RTL holds).
 function revealPill(level){
  const pill=level.pills.get(level.view.campus?.id);if(!pill||level.strip.hidden)return;
  const strip=level.strip.getBoundingClientRect(),box=pill.getBoundingClientRect();
  if(box.left>=strip.left&&box.right<=strip.right)return;
  level.strip.scrollLeft+=box.left+box.width/2-strip.left-strip.width/2;
 }
 function paintCampus(level){
  const text=t(),country=level.view.parent?.name??'';
  level.backLabel.textContent=country;level.back.setAttribute('aria-label',format(text.back,{country}));
  level.eyebrow.textContent=format(text.campus,{country});
  level.name.textContent=level.view.campus?.name??'';
  level.strip.setAttribute('aria-label',format(text.siblings,{country}));
  syncSiblings(level);
 }
 // The campus body is mounted again only for another campus or another language.
 function mountBody(level,{keepScroll=false}={}){
  const campusId=level.view.campus?.id??null,locale=getLocale();
  if(level.campusId===campusId&&level.locale===locale)return false;
  const active=doc.activeElement,inBody=Boolean(active&&level.body.contains(active)),scroll=[level.body.scrollTop,level.element.scrollTop];
  level.handle?.destroy?.();level.handle=null;level.body.replaceChildren();
  level.campusId=campusId;level.locale=locale;
  if(campusId!==null&&typeof renderCampus==='function')level.handle=renderCampus(level.body,campusId,locale)||null;
  const clamp=(node,value)=>{node.scrollTop=Math.max(0,Math.min(value,(node.scrollHeight||0)-(node.clientHeight||0)));};
  if(keepScroll){clamp(level.body,scroll[0]);clamp(level.element,scroll[1]);}else{level.body.scrollTop=0;level.element.scrollTop=0;}
  return inBody;
 }

 function animateChange(previous,built,direction){
  if(reduced()||!['descend','ascend'].includes(direction))return drop(previous);
  const sign=(direction==='ascend'?-1:1)*(rtl()?-1:1);
  if(built.kind==='campus'&&direction==='descend'&&previous.kind==='level'&&previous.cursorId===built.view.campus?.id){
   const card=cardFor(previous,previous.cursorId);
   if(card&&visibleIn(card,previous.viewport))return grow(previous,built,card);
  }
  play(previous.element,[{opacity:1,transform:'none'},{opacity:0,transform:translate(-24*sign)}],{duration:280},()=>drop(previous));
  play(built.element,[{opacity:0,transform:translate(24*sign)},{opacity:1,transform:'none'}],{duration:280});
 }
 function visibleIn(node,frame){
  const box=node.getBoundingClientRect(),area=frame.getBoundingClientRect();
  return box.width>0&&box.height>0&&box.right>area.left&&box.left<area.right&&box.bottom>area.top&&box.top<area.bottom;
 }
 // The validated card grows into the screen as a separate surface: text is clipped, never scaled.
 function grow(previous,built,card){
  const surface=create('div','explorer-campus-surface');surface.setAttribute('aria-hidden','true');
  root.insertBefore(surface,built.element);built.element.dataset.growing='true';
  const area=surface.getBoundingClientRect(),box=card.getBoundingClientRect();
  const inset=[box.top-area.top,area.right-box.right,area.bottom-box.bottom,box.left-area.left].map(value=>Math.max(0,Math.round(value))+'px').join(' ');
  play(previous.element,[{opacity:1},{opacity:0}],{duration:200},()=>drop(previous));
  play(surface,[{clipPath:`inset(${inset} round 20px)`},{clipPath:'inset(0px round 20px)'}],{duration:360},finished=>{
   delete built.element.dataset.growing;surface.remove();
   if(finished&&current===built)for(const child of [...built.element.children])play(child,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:210});
  });
 }

 function show(next,{direction='none',focus=false}={}){
  if(destroyed||!next)return;
  const active=doc.activeElement,inside=Boolean(active&&root.contains(active));
  if(current&&current.key===next.key)return update(next,{focus,inside});
  // A new view first finishes the transition still running, so its outgoing level is gone at once.
  settle();
  if(current?.kind==='campus'&&next.level==='campus')return switchCampus(next,{focus,inside});
  const previous=current;if(previous?.kind==='level')previous.cursorId=cursorId;
  gesture=null;pressed=null;wheel.sum=0;
  const built=next.level==='campus'?buildCampus(next):buildLevel(next);
  current=built;changedAt=now();
  if(built.kind==='level'){cursorId=validCursor(next);built.cursorId=cursorId;syncCards(built);paintLevel(built);}
  else{cursorId=null;paintCampus(built);}
  root.append(built.element);
  if(built.kind==='level'){centre(built,false);observer?.observe(built.viewport);observer?.observe(built.track);}
  else{mountBody(built);revealPill(built);}
  if(previous)leave(previous);
  if(focus||inside)focusTarget();
  if(previous)animateChange(previous,built,direction);
 }
 // Same view key: texts change in place, the nodes and the UI cursor (by id) stay.
 function update(next,{focus,inside}){
  current.view=next;
  if(current.kind==='level'){
   if(!next.items.some(item=>item.id===cursorId))cursorId=validCursor(next);
   current.cursorId=cursorId;syncCards(current);paintLevel(current);centre(current,false);
  }else{
   paintCampus(current);
   if(mountBody(current,{keepScroll:true}))return focusNode(current.title);
  }
  if(focus&&!current.element.contains(doc.activeElement)||inside&&!root.contains(doc.activeElement))focusTarget();
 }
 // Another campus keeps the screen: a sibling pill that was activated keeps the focus.
 function switchCampus(next,{focus,inside}){
  current.view=next;current.key=next.key;changedAt=now();
  paintCampus(current);revealPill(current);
  const lost=mountBody(current),active=doc.activeElement;
  if([...current.pills.values()].includes(active))return;
  if(lost||(focus||inside)&&!current.element.contains(active))focusNode(current.title);
 }

 function localize(){
  if(destroyed)return;
  title.textContent=t().title;
  if(current?.kind==='level')paintLevel(current);
  if(current?.kind==='campus'){paintCampus(current);if(mountBody(current,{keepScroll:true}))focusNode(current.title);}
 }

 function activateCard(card,event){
  const item=current.view.items.find(entry=>entry.id===card.dataset.id);
  if(!item||event.detail>1)return;
  if(event.detail>0){
   // A pointer click validates only the card that was already the cursor when it was pressed.
   const wasCursor=pressed?.card===card?pressed.wasCursor:item.id===cursorId;pressed=null;
   if(!wasCursor){setCursor(item.id,{focus:true,animate:true});return;}
  }
  onValidate({kind:item.kind,id:item.id});
 }
 listen(root,'pointerdown',event=>{
  disarmSwallow();
  const card=event.target?.closest?.('[data-explorer-card]');
  pressed=card&&current?.kind==='level'&&current.element.contains(card)?{card,wasCursor:card.dataset.id===cursorId}:null;
 },true);
 listen(root,'click',event=>{
  if(!(event.detail>0))return;
  const outgoing=[...leaving].some(level=>level.element.contains(event.target));
  if(outgoing||now()-changedAt<SETTLE_MS){event.preventDefault();event.stopPropagation();}
 },true);
 listen(root,'click',event=>{
  const target=event.target;if(!current||!current.element.contains(target))return;
  if(current.kind==='level'){
   const card=target.closest?.('[data-explorer-card]');if(card)return activateCard(card,event);
   const nav=target.closest?.('.explorer-nav');
   if(nav&&nav.getAttribute('aria-disabled')!=='true')moveBy(nav.dataset.dir==='next'?1:-1,{animate:true,announce:true});
   return;
  }
  if(target.closest?.('.explorer-campus-back'))return onAscend();
  const pill=target.closest?.('button[data-id]');
  if(pill&&current.strip.contains(pill)&&pill.getAttribute('aria-current')!=='true')onValidate({kind:'campus',id:pill.dataset.id});
 });
 listen(root,'keydown',event=>{
  if(!current||event.altKey||event.ctrlKey||event.metaKey||event.isComposing)return;
  const target=event.target;
  if(target?.closest?.('dialog')?.open||editable(target))return;
  if(event.key==='Escape'||event.key==='Backspace'){
   if((current.view.depth??1)>1){event.preventDefault();onAscend();}
   return;
  }
  if(current.kind!=='level')return;
  const card=target?.closest?.('[data-explorer-card]');if(!card||!current.element.contains(card))return;
  // Native activation turns Enter or Space into the click; a held key must not click again.
  if(event.key==='Enter'||event.key===' '){if(event.repeat)event.preventDefault();return;}
  const items=current.view.items,index=items.findIndex(item=>item.id===cursorId),forward=rtl()?-1:1;
  const destination={ArrowRight:index+forward,ArrowLeft:index-forward,Home:0,End:items.length-1}[event.key];
  if(destination===undefined)return;
  event.preventDefault();
  setCursor(items[Math.max(0,Math.min(items.length-1,destination))].id,{focus:true,animate:true});
 });
 if(motion?.addEventListener)listen(motion,'change',()=>{
  if(!motion.matches)return;
  settle();if(current?.kind==='level'){current.animation?.cancel();current.animation=null;}
 });

 function destroy(){
  if(destroyed)return;
  settle();destroyed=true;disarmSwallow();view.clearTimeout?.(wheel.timer);
  if(current){if(current.kind==='campus'){current.handle?.destroy?.();current.handle=null;}current.element.remove();current.disposers.splice(0).forEach(dispose=>dispose());current=null;}
  observer?.disconnect();disposers.splice(0).forEach(dispose=>dispose());
  if(ownTitle)title.remove();
 }
 return {show,focus:focusTarget,localize,destroy,hasView:()=>Boolean(current)};
}

