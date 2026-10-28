/* Explorer level selector of version B, « Halo » design (25 Oct 2026, SPEC-B-HALO §3–5, §7.2). Every level is a row of
 * silhouettes standing on halos of light along a curved horizon (the edge of the former globe): the cursor in a pool of
 * light with its « Valider » chip, its neighbours stepping down, smaller. The campus screen hosts B's sheet in place of
 * the level, with the strip of the other campuses outside its scroller. Moving the cursor never filters: an item's click
 * is the only path to onValidate, keyboard activation reaching it as the native detail-0 click. Only root.ownerDocument
 * and its defaultView are used, so a fake document can drive the whole module; the art (silhouettes, campus dots,
 * printed logos, icons) arrives through `art` and is never imported here. */
const copy={
 fr:{title:'Explorer',prompt:{continents:'Où veux-tu aller ?',countries:'Choisir un pays',campuses:'Choisir un campus'},step:'Étape {n} sur 3',previous:'Précédent',next:'Suivant',select:'Valider',position:'{i} sur {n}',carousel:'carrousel',
  keys:[['Flèches','pour choisir'],['Entrée','pour valider'],['Échap','pour revenir']],touch:'Glisse pour choisir · Touche le centre pour valider',back:'Revenir aux campus · {country}',siblings:'Tous les campus · {country}'},
 en:{title:'Explore',prompt:{continents:'Where would you like to go?',countries:'Choose a country',campuses:'Choose a campus'},step:'Step {n} of 3',previous:'Previous',next:'Next',select:'Select',position:'{i} of {n}',carousel:'carousel',
  keys:[['Arrows','to choose'],['Enter','to select'],['Esc','to go back']],touch:'Swipe to choose · Tap the centre to select',back:'Back to campuses · {country}',siblings:'All campuses · {country}'},
 ar:{title:'استكشف',prompt:{continents:'إلى أين تريد الذهاب؟',countries:'اختر دولة',campuses:'اختر فرعًا'},step:'المرحلة {n} من 3',previous:'السابق',next:'التالي',select:'تأكيد',position:'{i} من {n}',carousel:'عرض دوّار',
  // The Latin key names keep their own language inside the Arabic hint.
  keys:[['الأسهم','للاختيار'],['Enter','للتأكيد','en'],['Esc','للرجوع','en']],touch:'اسحب للاختيار · المس العنصر في الوسط للتأكيد',back:'العودة إلى فروع {country}',siblings:'جميع فروع {country}'},
};
const languageOf=locale=>String(locale||'fr').toLowerCase().split(/[-_]/)[0];
const words=locale=>{const language=languageOf(locale);return Object.hasOwn(copy,language)?copy[language]:copy.fr;};
const format=(template,values)=>template.replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));
const keyOf=item=>item.kind+':'+item.id;
const SVG='http://www.w3.org/2000/svg',EASE='cubic-bezier(.22,1,.36,1)';
// The track bleeds 170 px above and below the carousel, so halos are never cut (halo).
const BLEED=170;
// Pointer clicks landing within 350 ms of a new level belong to the gesture that opened it.
const SETTLE_MS=350,DRAG_PX=8,WHEEL_STEP=50,WHEEL_IDLE=150,GLIDE_MS=560,COMPACT_GAP=26,STAGE_SCROLL_BAND=44,REBUILD_K=.05;
const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
const round=(value,digits=2)=>{const k=10**digits;return Math.round(value*k)/k;};
const px=value=>round(value)+'px';
let instanceCount=0;

/** Halo's carousel geometry (SPEC-B-HALO §3.4, §3.5): the cursor box, the neighbours' slots and the horizon circle. */
export function haloGeometry({W,H,phone=W<700,campus=false,density='normal'}){
 if(density==='compact'){
  const bh=clamp(H-16,28,60);
  return {density,phone,compact:true,campus,W,H,bh,bw:bh*1.5,s1:1,s2:1,x1:null,x2:null,top:(H-bh)/2,floor0:null,d1:null,R:null,F:15,below:0};
 }
 const below=campus?12+26+12+36:10+20+12+36;   // the name or the count, then the chip
 const bh=clamp(H-below-30,84,campus?200:250);
 const bw=campus?bh:clamp(Math.min(W*(phone?.64:.25),bh*1.42),110,340);
 const s1=phone?.56:.58,s2=.42;
 const x1=phone?W/2+bw*s1/2-46:Math.max(bw*.5+bw*s1*.5+60,Math.min(W*.23,360));
 const x2=phone?x1+400:x1+bw*(s1+s2)/2+64;
 const top=Math.max(8,(H-bh-below)/2-2),floor0=top+bh,d1=bh*(phone?.09:.12);
 return {density,phone,compact:false,campus,W,H,bh,bw,s1,s2,x1,x2,top,floor0,d1,R:(x1*x1+d1*d1)/(2*d1),
  F:campus?clamp(.11*bh,18,22):clamp(.13*bh,22,32),below};
}

/** The horizon: a circle through the cursor's feet; y at a horizontal distance x (track coordinates without the bleed). */
export function floorAt(geometry,x){
 const {floor0,R}=geometry;
 if(!Number.isFinite(floor0)||!Number.isFinite(R))return (geometry.top||0)+(geometry.bh||0);
 return floor0+R-Math.sqrt(Math.max(0,R*R-x*x));
}

// The figure at the cursor scale: the viewBox ratio inside the cursor box, bottom-aligned (L3: the lantern square).
function figureOf(g,ratio,campus=g.campus,width=campus?g.bh:g.bw,height=g.bh){
 if(campus)return {fw:height,fh:height};
 const r=Number(ratio)>0?Number(ratio):1.2;
 return width/height>r?{fw:height*r,fh:height}:{fw:width,fh:width/r};
}
// Phones: the cursor's button is the widest one that keeps 8 px from the widest possible ±1 art (base·s1) on each side
// (fix 8, 25 Oct 2026: §3.4's « − 8 » left 4 px a side at 320×640), so it never changes with the neighbours and the edge
// fade stays level-constant (§3.4, §4.19).
function cursorButton(g){
 const base=g.campus?g.bh:g.bw,wide=Math.max(base,220);
 return g.phone?Math.min(wide,2*(g.x1-base*g.s1/2-8)):wide;
}
function edgeFade(g){
 if(!g.compact&&g.phone)return Math.min(64,(g.W-(cursorButton(g)+16))/2-4);
 return .06*g.W;
}

/**
 * The positions and sizes of every item (SPEC-B-HALO §3.4, §4.2, §4.10, §4.14, R16, R20, R24). Pure: it calls only its
 * arguments. items: [{id, kind, ratio, nameWidth, print, labelX}] (compact rows also take the measured on-screen
 * `width` and `height` of each item). `arabic` (default: rtl) picks the Arabic text floors.
 */
export function layoutItems({geometry:g,items,cursorIndex,rtl=false,arabic=rtl,fitLogo=null}){
 const list=items||[],n=list.length,cursor=clamp(Math.round(Number(cursorIndex))||0,0,Math.max(0,n-1)),mirror=rtl?-1:1,fade=edgeFade(g);
 if(g.compact)return compactLayout({g,list,cursor,mirror,fade,fitLogo});
 const {W,bh,bw,s1,s2,x1,x2,phone,campus,F}=g,base0=campus?bh:bw,small=arabic?14:13;
 const entries=list.map((item,index)=>{
  const o=index-cursor,a=Math.abs(o),side=Math.sign(o);
  const s=a===0?1:a===1?s1:a===2?s2:s2*.8,dist=a===0?0:a===1?x1:a===2?x2:x2+(a-2)*150;
  const {fw,fh}=figureOf(g,item.ratio),base=base0*s,nk=a===0?1:a===1?16/F:small/F;
  let off=a===0?0:a<=2?a*side:'out';
  // R20 (desktops): a ±1 / ±2 item whose slot box would leave the viewport, or whose name would enter the outer 60 % of
  // the edge fade, is « out » at its own slot.
  if(!phone&&(a===1||a===2)){
   const width=Number(item.nameWidth)||0;
   if(dist+base/2>W/2||width>0&&dist+width*nk/2>W/2-.6*fade)off='out';
  }
  return {item,o,a,side,s,dist,fw,fh,base,nk,off};
 });
 // R16: button widths on screen, from the cursor outwards, never overlapping (≥ 8 px apart) and never narrower than the art.
 const widths=entries.map(entry=>Math.max(entry.base,entry.a===0?220:120));
 if(phone)entries.forEach((entry,index)=>{widths[index]=entry.a===0?cursorButton(g):entry.fw*entry.s;});
 else for(const side of [-1,1]){
  let previousDist=0,previousWidth=widths[cursor];
  for(let index=cursor+side;index>=0&&index<n;index+=side){
   const entry=entries[index];if(entry.off==='out')continue;
   widths[index]=Math.max(entry.fw*entry.s,Math.min(widths[index],2*(entry.dist-previousDist-previousWidth/2-8)));
   previousDist=entry.dist;previousWidth=widths[index];
  }
 }
 const nmax=phone?W-2*fade-8:null;
 return {fade,nmax,items:entries.map((entry,index)=>{
  const {item,a,side,s,dist,fw,fh,base,nk,off}=entry,w0=widths[index]/s;
  const itemW=Math.max(base,a===0?220:120);
  const logo=campus&&fitLogo&&item.print?fitLogo(item.print,.76*bh,.30*bh):null;
  const minH=a===1?28:a===2?22:0;
  const lk=logo&&logo.height>0&&logo.width>0?Math.max(1,Math.min(minH/(s*logo.height),w0/logo.width)):1;
  let nx=0;
  if(phone&&a===0&&!campus){
   // R24: the cursor's name stays inside the unfaded part of the screen (shifted sideways, never resized).
   const width=Number(item.nameWidth)||0,centre=W/2+((Number(item.labelX)>=0?Number(item.labelX):.5)-.5)*fw,low=fade+4,high=W-fade-4;
   if(width>high-low)nx=W/2-centre;
   else if(centre-width/2<low)nx=low-(centre-width/2);
   else if(centre+width/2>high)nx=high-(centre+width/2);
  }
  return {id:item.id,off,visible:phone?a<=1:off!=='out'&&dist-base/2<W/2,s,dist,x:W/2+dist*side*mirror,y:BLEED+floorAt(g,dist)-bh,w0,fw,fh,nk,ns:nk/s,
   ms:(a===0?14:small)/(14*s),mt:10/s-10,gx:(itemW/s)/bw,lk,nx,logo};
 })};
}
// Compact row (§3.5, R23): no scale, sizes from layout, the cursor centred and the others outwards with 26 px gaps.
function compactLayout({g,list,cursor,mirror,fade,fitLogo}){
 const {W,H,bh,bw,campus}=g,n=list.length,measured=list.every(item=>Number(item.width)>0);
 const entries=list.map((item,index)=>{
  const o=index-cursor,a=Math.abs(o),near=a===0,logo=campus&&fitLogo&&item.print?fitLogo(item.print,near?bw:.8*bw,(near?.5:.4)*bh):null;
  const figure=campus?{fw:logo?.width||0,fh:logo?.height||0}:figureOf(g,item.ratio,false,near?bw:.8*bw,near?bh:.8*bh);
  return {item,o,a,off:a===0?0:a===1?Math.sign(o):'out',logo,...figure};
 });
 const xs=entries.map(()=>W/2);
 if(measured)for(const side of [-1,1]){
  let edge=W/2+side*mirror*(Number(list[cursor].width)/2+COMPACT_GAP);
  for(let index=cursor+side;index>=0&&index<n;index+=side){
   const width=Number(list[index].width);xs[index]=edge+side*mirror*width/2;edge+=side*mirror*(width+COMPACT_GAP);
  }
 }
 return {fade,nmax:null,items:entries.map((entry,index)=>({id:entry.item.id,off:entry.off,visible:entry.a<=1,s:1,dist:Math.abs(xs[index]-W/2),x:xs[index],
  y:BLEED+(H-(Number(entry.item.height)>0?Number(entry.item.height):bh))/2,w0:null,fw:entry.fw,fh:entry.fh,nk:1,ns:1,ms:1,mt:0,gx:1,lk:1,nx:0,logo:entry.logo}))};
}

/** Pager dots that fit the band (R15): 'normal' | 'dense' | 'none'; hidden below 381 px of viewport width (halo). */
export function pagerDots({n,width,countWidth=55,viewport=Infinity}){
 if(!(n>0)||viewport<381)return 'none';
 const need=(size,gap,current)=>88+36+countWidth+n*size+(n-1)*gap+(current-size);
 if(n<=16&&need(6,6,20)<=width)return 'normal';
 return need(4,4,14)<=width?'dense':'none';
}

export function createExplorerSelector({root,getLocale=()=>'fr',motion=null,onValidate=()=>{},onAscend=()=>{},onAnnounce=()=>{},renderCampus=null,art=null}){
 const doc=root.ownerDocument,view=doc.defaultView||{},disposers=[],running=new Map(),leaving=new Set(),frames=new Set();
 let current=null,cursorId=null,changedAt=-Infinity,pressed=null,gesture=null,swallow=null,destroyed=false,defsReady=false;
 const wheel={sum:0,locked:false,timer:null};
 const now=()=>view.performance?.now?.()??Date.now();
 const t=()=>words(getLocale());
 const arabic=()=>languageOf(getLocale())==='ar';
 const rtl=()=>doc.documentElement?.dir==='rtl';
 const reduced=()=>Boolean(motion?.matches);
 const listen=(target,type,listener,options,bucket=disposers)=>{target.addEventListener(type,listener,options);bucket.push(()=>target.removeEventListener(type,listener,options));};
 const create=(tag,className,text)=>{const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
 const icon=name=>art?.icon?.(doc,name)||null;
 const editable=node=>Boolean(node?.isContentEditable||node?.closest?.('input,textarea,select'));
 // Keyboard focus only (Tab, or a script after a key press): a pointer press focuses a button too, and scrolling it away
 // under the pointer would carry the click elsewhere. A browser without :focus-visible keeps its own behaviour.
 const keyboardFocus=node=>{try{return Boolean(node?.matches?.(':focus-visible'));}catch{return false;}};
 const setDisabled=(button,disabled)=>{if(disabled)button.setAttribute('aria-disabled','true');else button.removeAttribute('aria-disabled');};
 const flag=(node,name,on)=>{if(on){if(node.dataset[name]!=='')node.dataset[name]='';}else if(name in node.dataset)delete node.dataset[name];};
 const validCursor=next=>next.items.some(item=>item.id===next.cursorId)?next.cursorId:next.items[0]?.id??null;
 const nodeOf=(level,id)=>{const item=level.view.items.find(entry=>entry.id===id);return item?level.nodes.get(keyOf(item)):null;};
 const itemFocused=level=>{const active=doc.activeElement;return Boolean(active?.dataset&&'explorerCard' in active.dataset&&level.element.contains(active));};
 const coarse=typeof view.matchMedia==='function'?view.matchMedia('(hover:none) and (pointer:coarse)'):null;

 let title=root.querySelector?.('#explorer-title');const ownTitle=!title;
 if(ownTitle){title=create('h1','sr-only');title.id='explorer-title';root.prepend(title);}
 title.textContent=t().title;
 const Observer=view.ResizeObserver;
 const observer=typeof Observer==='function'?new Observer(()=>resized()):null;
 // The root's border box is the viewport (fix 2): explorer-band.mjs rewrites the root's padding (the band) inside its own
 // ResizeObserver callback, so observing the content box here looped. A new --explorer-top/-bottom still re-lays the view
 // out through the deeper observations (the carousel; the campus body, strip and sheet) (§3.1).
 observer?.observe(root,{box:'border-box'});

 // Runs once on the next animation frame (or task); destroy() cancels what is still pending.
 function frame(callback){
  const pending={cancel:()=>{}},run=()=>{if(!frames.delete(pending))return;callback();};
  frames.add(pending);
  if(typeof view.requestAnimationFrame==='function'){const id=view.requestAnimationFrame(run);pending.cancel=()=>view.cancelAnimationFrame?.(id);}
  else if(typeof view.setTimeout==='function'){const id=view.setTimeout(run,0);pending.cancel=()=>view.clearTimeout?.(id);}
  else run();
 }
 function focusNode(node){
  if(!node?.focus)return;
  node.focus({preventScroll:true});
  // Only a band too short for the compact row lets the stage scroll (§3.1): keep the focused control inside it.
  if(node!==root&&root.dataset.stageScroll==='true')node.scrollIntoView?.({block:'nearest'});
 }
 function focusTarget(){
  if(current?.kind==='level'){const node=nodeOf(current,cursorId);if(node)return focusNode(node.button);}
  if(current?.kind==='campus')return focusNode(current.title);
  focusNode(root);
 }
 // The band is the stage's content box (§3.1); the carousel is full bleed, so W is the stage's client width.
 function stageBox(){
  const width=Number(root.clientWidth)||0,height=Number(root.clientHeight)||0,style=view.getComputedStyle?.(root);
  if(!style)return {W:width,width,height};
  const length=value=>Number.parseFloat(value)||0;
  return {W:width,width:Math.max(0,width-length(style.paddingLeft)-length(style.paddingRight)),height:Math.max(0,height-length(style.paddingTop)-length(style.paddingBottom))};
 }
 function setStageScroll(on){if(on)root.dataset.stageScroll='true';else if('stageScroll' in root.dataset)delete root.dataset.stageScroll;}
 // R21: each view's border box relative to the stage's padding box, as laid out (physical px, valid in RTL).
 function recordBox(record){
  const box=record.element.getBoundingClientRect?.(),frame=root.getBoundingClientRect?.();if(!box||!frame)return;
  record.box={left:round(box.left-frame.left),top:round(box.top-frame.top+(Number(root.scrollTop)||0)),width:round(box.width),height:round(box.height)};
 }
 function freeze(record){
  const box=record.box;if(!box)return;
  Object.assign(record.element.style,{position:'absolute',gridArea:'auto',left:px(box.left),top:px(box.top),width:px(box.width),height:px(box.height),margin:'0'});
 }

 // Decorative motion only: every DOM and focus change has already happened when these start.
 function play(element,keyframes,options,onEnd){
  if(typeof element?.animate!=='function'){onEnd?.(true);return null;}
  const animation=element.animate(keyframes,{easing:EASE,...options});
  running.set(animation,onEnd);
  const end=finished=>{if(!running.has(animation))return;running.delete(animation);onEnd?.(finished);};
  if(animation.finished)animation.finished.then(()=>end(true),()=>end(false));else end(true);
  return animation;
 }
 function settle(){
  for(const [animation,onEnd]of [...running]){running.delete(animation);animation.cancel();onEnd?.(false);}
  for(const record of [...leaving])drop(record);
  if(current?.kind==='campus')endEntering(current);
 }
 function drop(record){
  if(!leaving.delete(record))return;
  record.element.remove();record.disposers.splice(0).forEach(dispose=>dispose());
  if(record.kind==='campus'){record.handle?.destroy?.();record.handle=null;endEntering(record);}
  else stopGlide(record);
 }
 function leave(record){
  if(record.kind==='level'){observer?.unobserve(record.carousel);stopGlide(record);}
  else observer&&[record.body,record.list,record.sheet].forEach(node=>{if(node)observer.unobserve(node);});
  record.element.inert=true;record.element.setAttribute('aria-hidden','true');record.element.dataset.state='leaving';
  leaving.add(record);
 }
 function ensureDefs(){if(!defsReady&&typeof art?.ensureArtDefs==='function'){art.ensureArtDefs(doc);defsReady=true;}}

 /* ---- Levels ---------------------------------------------------------------------------------------------- */
 function buildLevel(model){
  const n=++instanceCount;
  const element=create('div','explorer-level');element.dataset.level=model.level;
  const head=create('div','explorer-head'),steps=create('span','explorer-steps'),dots=[];
  steps.setAttribute('aria-hidden','true');
  for(let index=0;index<3;index++){if(index)steps.append(create('span','explorer-step-line'));const dot=create('span','explorer-step');dots.push(dot);steps.append(dot);}
  const prompt=create('p','explorer-prompt'),promptText=create('span','explorer-prompt-text'),stepText=create('span','sr-only');
  prompt.id='explorer-prompt-'+n;prompt.append(promptText,stepText);head.append(steps,prompt);
  const carousel=create('div','explorer-carousel');carousel.setAttribute('role','group');carousel.setAttribute('aria-labelledby',prompt.id);
  const track=create('div','explorer-track'),horizon=doc.createElementNS(SVG,'svg'),pool=create('div','explorer-pool'),items=create('div','explorer-items');
  horizon.setAttribute('class','explorer-horizon');horizon.setAttribute('aria-hidden','true');horizon.setAttribute('focusable','false');horizon.setAttribute('preserveAspectRatio','none');
  const glowPath=doc.createElementNS(SVG,'path'),linePath=doc.createElementNS(SVG,'path');
  glowPath.setAttribute('class','explorer-horizon-glow');linePath.setAttribute('class','explorer-horizon-line');horizon.append(glowPath,linePath);
  pool.setAttribute('aria-hidden','true');
  track.append(horizon,pool,items);carousel.append(track);
  const foot=create('div','explorer-foot'),pager=create('div','explorer-pager');
  const nav=direction=>{const button=create('button','explorer-nav');button.type='button';button.dataset.dir=direction;const glyph=icon(direction);if(glyph)button.append(glyph);return button;};
  const prev=nav('prev'),next=nav('next'),dotsBar=create('span','explorer-dots'),count=create('span','explorer-count');
  dotsBar.setAttribute('aria-hidden','true');count.dir='ltr';count.setAttribute('aria-hidden','true');
  pager.append(prev,dotsBar,count,next);
  const hint=create('p','explorer-hint'),keys=create('span','explorer-hint-keys'),touch=create('span','explorer-hint-touch');
  keys.id='explorer-hint-keys-'+n;touch.id='explorer-hint-touch-'+n;hint.append(keys,touch);
  foot.append(pager,hint);element.append(head,carousel,foot);
  const level={kind:'level',key:model.key,view:model,element,head,steps:dots,prompt,promptText,stepText,carousel,track,horizon,glowPath,linePath,pool,items,foot,prev,next,
   dots:dotsBar,count,hint,keys,touch,hintLanguage:null,nodes:new Map(),g:null,lay:null,size:null,box:null,glideTimer:null,cursorId:null,disposers:[]};
  bindCarousel(level);
  // A glide ends on its item's own transform transition (sub-elements bubble theirs with other targets).
  listen(items,'transitionend',event=>{const node=event.target;if(event.propertyName==='transform'&&node?.parentNode===items&&node.dataset)delete node.dataset.gliding;},undefined,level.disposers);
  return level;
 }
 function createItem(item){
  const button=create('button','explorer-item');button.type='button';button.dataset.explorerCard='';button.dataset.id=item.id;button.dataset.kind=item.kind;button.dataset.off='out';
  const box=create('span','explorer-box'),quiet=create('span','explorer-glow'),glow=create('span','explorer-glow explorer-glow-cursor'),figure=create('span','explorer-figure'),name=create('span','explorer-name');
  box.setAttribute('aria-hidden','true');name.dir='auto';box.append(quiet,glow,figure);button.append(box);
  const node={item,button,figure,name,meta:null,lantern:null,logo:null,logoPrint:null,art:null,artK:0,shape:null,dots:null,ratio:1.2,lx:50,ly:50,nameWidth:0,go:null,goLabel:null};
  if(item.kind==='campus'){node.lantern=create('span','explorer-lantern');figure.append(node.lantern);button.append(name);}
  else{figure.append(name);node.meta=create('span','explorer-meta');node.meta.setAttribute('aria-hidden','true');button.append(node.meta);}
  node.go=create('span','explorer-go');node.go.setAttribute('aria-hidden','true');
  const enter=icon('enter');if(enter)node.go.append(enter);
  node.goLabel=create('span','explorer-go-label');node.go.append(node.goLabel);button.append(node.go);
  return node;
 }
 // Items are keyed by kind:id, so a re-render keeps the nodes (and the focus) of the same items.
 function syncItems(level){
  const items=level.view.items,keys=new Set(items.map(keyOf));
  for(const item of items){const node=level.nodes.get(keyOf(item));if(node)node.item=item;else level.nodes.set(keyOf(item),createItem(item));}
  for(const [key,node]of level.nodes)if(!keys.has(key)){node.button.remove();level.nodes.delete(key);}
  const ordered=items.map(item=>level.nodes.get(keyOf(item)).button);
  if(ordered.some((button,index)=>level.items.children[index]!==button)){
   // Moving a node blurs it: give the focus back to the same item after a re-sort.
   const active=doc.activeElement;ordered.forEach(button=>level.items.append(button));
   if(active&&active!==doc.activeElement&&active.isConnected)active.focus({preventScroll:true});
  }
 }
 function shapeOf(item){
  const shapes=art?.shapes;if(!shapes)return null;
  if(item.kind==='world')return shapes.world||null;
  if(item.kind==='continent')return shapes.continents?.[item.id]||null;
  if(item.kind==='country')return shapes.countries?.[item.id]||null;
  return null;
 }
 // Silhouettes are built at the cursor scale, the same at every rank; a new one only when k moved by more than 5 %.
 function ensureArt(level,g){
  for(const node of level.nodes.values()){
   const {item}=node;
   if(item.kind==='campus'){node.print=art?.logo?.(item.id)||null;continue;}
   const shape=shapeOf(item),box=String(shape?.viewBox??'').trim().split(/[\s,]+/).map(Number);
   const usable=Boolean(shape&&typeof art?.createSilhouette==='function'&&box.length===4&&box.every(Number.isFinite)&&box[2]>0&&box[3]>0);
   if(!usable){if(!node.art){node.ratio=1.2;node.lx=node.ly=50;}continue;}
   const ratio=box[2]/box[3],{fw}=figureOf(g,ratio,false),k=fw/box[2];
   if(node.art&&node.shape===shape&&Math.abs(k-node.artK)<=REBUILD_K*node.artK)continue;
   const svg=art.createSilhouette(doc,{shape,kind:item.kind,flagHref:item.kind==='country'?art.flagHref?.(item.id)??null:null,scale:k});
   if(!svg){if(!node.art){node.ratio=1.2;node.lx=node.ly=50;}continue;}
   if(node.art)node.art.remove();
   node.figure.insertBefore(svg,node.name);node.art=svg;node.artK=k;
   if(node.shape!==shape){
    node.dots?.remove();node.dots=art.createDots?.(doc,{shape,kind:item.kind})||null;if(node.dots)node.figure.append(node.dots);
    const label=Array.isArray(shape.label)&&shape.label.length>=2?shape.label:null;
    node.lx=label?round((label[0]-box[0])/box[2]*100,3):50;node.ly=label?round((label[1]-box[1])/box[3]*100,3):50;
   }
   node.shape=shape;node.ratio=ratio;
  }
 }
 function paintHint(level,text){
  const language=languageOf(getLocale());
  if(level.hintLanguage!==language){
   level.hintLanguage=language;
   const parts=[];
   text.keys.forEach(([key,action,lang],index)=>{
    if(index)parts.push(create('span','explorer-hint-sep',' · '));
    const kbd=create('kbd','',key);if(lang)kbd.lang=lang;parts.push(kbd,create('span','',' '+action));
   });
   level.keys.replaceChildren(...parts);level.touch.textContent=text.touch;
  }
  // The group is described by the hint the visitor sees (H2f).
  const touch=Boolean(coarse?.matches);
  level.keys.hidden=touch;level.touch.hidden=!touch;
  level.carousel.setAttribute('aria-describedby',(touch?level.touch:level.keys).id);
 }
 function paintItem(node,item,position,total,text){
  const isCursor=item.id===cursorId,place=format(text.position,{i:position+1,n:total});
  node.name.textContent=item.name;if(node.meta)node.meta.textContent=item.countText??'';node.goLabel.textContent=text.select;
  node.button.setAttribute('aria-label',[item.ariaLabel||[item.name,item.countText].filter(Boolean).join(' · '),place,...(isCursor?[text.select]:[])].join(' · '));
  node.button.tabIndex=isCursor?0:-1;
 }
 function paintLevel(level){
  const text=t(),items=level.view.items,total=items.length,index=items.findIndex(item=>item.id===cursorId);
  const step=level.view.step?.index??{continents:1,countries:2,campuses:3}[level.view.level]??1;
  level.promptText.textContent=text.prompt[level.view.level]??'';level.stepText.textContent=' · '+format(text.step,{n:step});
  level.steps.forEach((dot,position)=>{dot.dataset.state=position+1<step?'done':position+1===step?'current':'todo';});
  level.carousel.setAttribute('aria-roledescription',text.carousel);
  level.prev.setAttribute('aria-label',text.previous);level.next.setAttribute('aria-label',text.next);
  setDisabled(level.prev,index<=0);setDisabled(level.next,index<0||index>=total-1);
  level.count.textContent=total?`${index+1} / ${total}`:'';
  if(level.dots.children.length!==total)level.dots.replaceChildren(...items.map(()=>create('i')));
  [...level.dots.children].forEach((dot,position)=>flag(dot,'current',position===index));
  // The current pill is an indicator moved by transform to this index: the dots never change size (fix 7, §9.3).
  level.dots.style.setProperty('--dot',String(Math.max(0,index)));
  paintHint(level,text);
  items.forEach((item,position)=>paintItem(level.nodes.get(keyOf(item)),item,position,total,text));
 }
 const inputs=level=>level.view.items.map(item=>{const node=level.nodes.get(keyOf(item));return {id:item.id,kind:item.kind,ratio:node.ratio,nameWidth:node.nameWidth,print:node.print||null,labelX:node.lx/100,width:node.width,height:node.height};});
 const indexOf=level=>Math.max(0,level.view.items.findIndex(item=>item.id===(level===current?cursorId:level.cursorId)));
 function writeSizes(node,entry,g){
  const button=node.button,style=button.style;
  button.dataset.off=String(entry.off);
  style.setProperty('--s',String(round(entry.s,4)));style.setProperty('--w0',entry.w0==null?'auto':px(entry.w0));
  style.setProperty('--fw',px(entry.fw));style.setProperty('--fh',px(entry.fh));
  style.setProperty('--lx',node.lx+'%');style.setProperty('--ly',node.ly+'%');
  for(const name of ['nk','ns','ms','gx','lk'])style.setProperty('--'+name,String(round(entry[name],4)));
  style.setProperty('--mt',px(entry.mt));style.setProperty('--nx',px(entry.nx));
  if(node.lantern){
   // The printed logo is created once and resized in place (§4.10).
   if(entry.logo&&!node.logo&&node.print&&node.logoPrint!==node.print&&typeof art?.createPrintedLogo==='function'){
    node.logoPrint=node.print;
    node.logo=art.createPrintedLogo(doc,{print:node.print,width:round(entry.logo.width),height:round(entry.logo.height)})||null;
    if(node.logo)node.lantern.append(node.logo);
   }
   if(node.logo&&entry.logo){node.logo.style.width=px(entry.logo.width);node.logo.style.height=px(entry.logo.height);}
  }
 }
 function writePosition(node,entry){node.button.style.setProperty('--x',px(entry.x));node.button.style.setProperty('--y',px(entry.y));}
 function drawStage(level,g,lay){
  level.track.style.setProperty('--fade',px(lay.fade));
  if(g.compact)return;
  const half=g.W/2+40,points=[];
  for(let index=0;index<=64;index++){const x=-half+2*half*index/64;points.push(`${round(g.W/2+x,1)} ${round(BLEED+floorAt(g,x),1)}`);}
  const d='M'+points.join('L');
  level.horizon.setAttribute('viewBox',`0 0 ${round(g.W)} ${round(g.H+2*BLEED)}`);level.glowPath.setAttribute('d',d);level.linePath.setAttribute('d',d);
  const width=g.bw*(g.campus?1.35:1.25);
  Object.assign(level.pool.style,{left:px(g.W/2-width/2),top:px(BLEED+g.floor0-15),width:px(width)});
 }
 function stopGlide(level){if(level.glideTimer!=null){view.clearTimeout?.(level.glideTimer);level.glideTimer=null;}}
 // One layout of a level: 'instant' (no transition: data-instant, a style flush, removed next frame), 'glide' (a cursor
 // move: the items visible before or after it transition) or 'jump' (a move without motion).
 function layoutLevel(level,mode){
  const g=level.g;if(!g)return;
  const nodes=level.view.items.map(item=>level.nodes.get(keyOf(item))),before=level.lay,fitLogo=art?.fitLogo||null;
  const options=()=>({geometry:g,items:inputs(level),cursorIndex:indexOf(level),rtl:rtl(),arabic:arabic(),fitLogo});
  let lay=layoutItems(options());
  if(mode==='instant')level.element.dataset.instant='';
  const glide=new Set();
  if(mode==='glide'&&!reduced()&&before){
   const was=new Map(before.items.map(entry=>[entry.id,entry.visible]));
   lay.items.forEach(entry=>{if(entry.visible||was.get(entry.id))glide.add(entry.id);});
  }
  nodes.forEach(node=>flag(node.button,'gliding',glide.has(node.item.id)));
  nodes.forEach((node,index)=>writeSizes(node,lay.items[index],g));
  if(g.compact){
   // The row's positions follow the items' measured on-screen widths (no transform scales them).
   nodes.forEach(node=>{const box=node.button.getBoundingClientRect?.();node.width=box?.width||0;node.height=box?.height||0;});
   lay=layoutItems(options());
  }
  nodes.forEach((node,index)=>writePosition(node,lay.items[index]));
  level.lay=lay;
  if(mode==='instant'){
   drawStage(level,g,lay);
   void level.element.offsetWidth;   // the transition-less style applies before transitions come back
   frame(()=>{if(!destroyed&&level.element.dataset)delete level.element.dataset.instant;});
   recordBox(level);
  }
  stopGlide(level);
  if(glide.size)level.glideTimer=view.setTimeout?.(()=>{level.glideTimer=null;level.nodes.forEach(node=>flag(node.button,'gliding',false));},GLIDE_MS)??null;
 }
 // The instant protocol (§4.15): show(), resize, fonts, localize() and band changes re-lay the level out at once.
 function relayout(level){
  if(!level||destroyed)return;
  const band=stageBox(),density=band.height<250?'compact':band.height<420?'short':'normal',phone=band.W<700;
  level.element.dataset.density=density;flag(level.element,'phone',phone);
  setStageScroll(band.height<STAGE_SCROLL_BAND);
  const W=Number(level.carousel.clientWidth)||band.W,H=Number(level.carousel.clientHeight)||band.height;
  const g=haloGeometry({W,H,phone,campus:level.view.level==='campuses',density});
  level.g=g;level.size={W,H,band:band.height,width:band.width};
  const layer=level.items.style;
  layer.setProperty('--h0',px(g.bh));layer.setProperty('--b0',px(g.bw));layer.setProperty('--F',px(g.F));
  const nmax=!g.compact&&g.phone?g.W-2*edgeFade(g)-8:null;
  if(nmax==null)layer.removeProperty('--nmax');else layer.setProperty('--nmax',px(nmax));
  ensureArt(level,g);
  // Names are measured at the cursor size, where they are laid out at every rank (§4.8).
  for(const node of level.nodes.values())node.nameWidth=Number(node.name.offsetWidth)||0;
  const mode=pagerDots({n:level.view.items.length,width:band.width,countWidth:Number(level.count.offsetWidth)||55,viewport:band.W});
  level.dots.hidden=mode==='none';flag(level.dots,'dense',mode==='dense');
  layoutLevel(level,'instant');
 }
 // Internal move: returns whether the cursor changed (drives moveBy, the wheel and the drag snap-back).
 function moveCursor(id,{focus=false,animate=false,announce=false}={}){
  const level=current;if(level?.kind!=='level')return false;
  const items=level.view.items,index=items.findIndex(item=>item.id===id);if(index<0)return false;
  const changed=id!==cursorId;cursorId=id;level.cursorId=id;
  paintLevel(level);layoutLevel(level,animate&&!reduced()?'glide':'jump');
  if(focus)focusNode(level.nodes.get(keyOf(items[index])).button);
  if(announce&&changed)onAnnounce(`${items[index].name} · ${format(t().position,{i:index+1,n:items.length})}`);
  return changed;
 }
 function moveBy(step,options){
  const items=current.view.items,index=items.findIndex(item=>item.id===cursorId),target=clamp(index+step,0,items.length-1);
  return target!==index&&moveCursor(items[target].id,options);
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
  const g=level.g;if(!g)return 0;
  if(!g.compact)return g.x1;
  const index=indexOf(level),entries=level.lay?.items||[],near=entries[index+1]||entries[index-1];
  return near?Math.abs(near.x-entries[index].x):0;
 }
 // On release the layer's offset is folded into each item's --x in one frame, then the new layout glides (§4.15).
 function fold(level,dx){
  level.nodes.forEach(node=>{flag(node.button,'gliding',false);const x=Number.parseFloat(node.button.style.getPropertyValue('--x'))||0;node.button.style.setProperty('--x',px(x+dx));});
  level.items.style.removeProperty('transform');
  void level.element.offsetWidth;
 }
 function bindCarousel(level){
  const {carousel,disposers:bucket}=level,own=event=>gesture?.level===level&&event.pointerId===gesture.pointerId;
  listen(carousel,'pointerdown',event=>{
   if(current!==level||event.isPrimary===false||event.button!==0)return;
   gesture={level,pointerId:event.pointerId,x:event.clientX,y:event.clientY,cursorId,dragging:false,dx:0};
  },undefined,bucket);
  listen(carousel,'pointermove',event=>{
   if(!own(event))return;
   const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
   if(!gesture.dragging){
    if(Math.abs(dy)>=DRAG_PX&&Math.abs(dy)>=Math.abs(dx)){gesture=null;return;}
    if(Math.abs(dx)<DRAG_PX||Math.abs(dx)<=Math.abs(dy))return;
    gesture.dragging=true;carousel.setPointerCapture?.(event.pointerId);level.element.dataset.dragging='true';
    stopGlide(level);level.nodes.forEach(node=>flag(node.button,'gliding',false));
   }
   // The items layer follows the finger; the horizon and the pool stay.
   gesture.dx=dx;level.items.style.setProperty('transform',`translateX(${round(dx)}px)`);
  },undefined,bucket);
  listen(carousel,'pointerup',event=>{
   if(!own(event))return;
   const drag=gesture;gesture=null;if(!drag.dragging)return;
   delete level.element.dataset.dragging;armSwallow();
   const items=level.view.items,from=items.findIndex(item=>item.id===drag.cursorId),pitch=pitchOf(level);
   const steps=pitch?Math.round(-(event.clientX-drag.x)*(rtl()?-1:1)/pitch):0,target=items[clamp(from+steps,0,items.length-1)];
   fold(level,drag.dx);
   if(!target||target.id===cursorId||!moveCursor(target.id,{animate:true,focus:itemFocused(level)}))layoutLevel(level,reduced()?'jump':'glide');
  },undefined,bucket);
  const cancel=event=>{
   if(!own(event))return;
   const drag=gesture;gesture=null;
   if(drag.dragging){delete level.element.dataset.dragging;fold(level,drag.dx);layoutLevel(level,reduced()?'jump':'glide');}
  };
  // Touch pointers start captured by the pressed item: taking the capture fires a bubbling lostpointercapture there.
  listen(carousel,'pointercancel',cancel,undefined,bucket);listen(carousel,'lostpointercapture',event=>{if(event.target===carousel)cancel(event);},undefined,bucket);
  listen(carousel,'wheel',event=>{
   if(event.ctrlKey||event.metaKey||current!==level)return;
   event.preventDefault();
   const unit=event.deltaMode===1?16:event.deltaMode===2?carousel.getBoundingClientRect().width||1:1;
   const x=(Number(event.deltaX)||0)*unit,y=(Number(event.deltaY)||0)*unit,delta=Math.abs(x)>Math.abs(y)?x*(rtl()?-1:1):y;
   view.clearTimeout?.(wheel.timer);wheel.timer=view.setTimeout?.(()=>{wheel.sum=0;wheel.locked=false;},WHEEL_IDLE);
   if(wheel.locked||!delta)return;
   wheel.sum+=delta;if(Math.abs(wheel.sum)<WHEEL_STEP)return;
   const step=Math.sign(wheel.sum);wheel.sum=0;wheel.locked=true;
   moveBy(step,{animate:true,focus:itemFocused(level)});
  },{passive:false},bucket);
 }

 /* ---- Campus screen ---------------------------------------------------------------------------------------- */
 function buildCampus(next){
  const n=++instanceCount,headingId='explorer-campus-title-'+n;
  const element=create('section','explorer-campus');element.dataset.level='campus';element.setAttribute('aria-labelledby',headingId);
  const body=create('div','explorer-campus-body'),foot=create('div','explorer-campus-foot');
  const back=create('button','explorer-campus-back'),backLabel=create('span','explorer-campus-back-label');
  back.type='button';backLabel.dir='auto';const arrow=icon('back');if(arrow)back.append(arrow);back.append(backLabel);
  const nav=create('nav','explorer-siblings'),list=create('div','explorer-siblings-list');nav.append(list);
  foot.append(back,nav);element.append(body,foot);
  const level={kind:'campus',key:next.key,view:next,element,body,foot,back,backLabel,nav,list,pills:new Map(),handle:null,title:null,headingId,sheet:null,
   campusId:null,locale:null,shapes:null,density:null,box:null,listSize:null,enteringTimer:null,disposers:[]};
  // R26: pointer clicks inside the section do nothing while its entrance runs (the website pill appears under the chip).
  const guard=event=>{if(!('entering' in element.dataset)||!(event.detail>0))return;event.preventDefault();event.stopPropagation();};
  for(const type of ['click','auxclick','mousedown'])listen(element,type,guard,true,level.disposers);
  listen(body,'scroll',()=>updateFades(level),{passive:true},level.disposers);
  listen(list,'scroll',()=>updateFades(level),{passive:true},level.disposers);
  listen(body,'focusin',event=>revealFocusedControl(level,event.target),undefined,level.disposers);
  listen(list,'focusin',event=>revealFocusedPill(level,event.target),undefined,level.disposers);
  return level;
 }
 function syncSiblings(level){
  // The strip lists the country's campuses only when it has at least two; the back pill is always there (R13).
  const list=level.view.siblings||[],siblings=list.length>1?list:[],currentId=level.view.campus?.id,ids=new Set(siblings.map(item=>item.id));
  level.nav.hidden=!siblings.length;
  for(const sibling of siblings)if(!level.pills.has(sibling.id)){
   const pill=create('button','explorer-sibling'),label=create('span','explorer-sibling-name'),check=icon('check');
   pill.type='button';pill.dataset.id=sibling.id;label.dir='auto';if(check)pill.append(check);pill.append(label);level.pills.set(sibling.id,pill);
  }
  for(const [id,pill]of level.pills)if(!ids.has(id)){pill.remove();level.pills.delete(id);}
  const ordered=siblings.map(item=>level.pills.get(item.id));
  if(ordered.some((pill,index)=>level.list.children[index]!==pill)){
   const active=doc.activeElement;ordered.forEach(pill=>level.list.append(pill));
   if(active&&active!==doc.activeElement&&active.isConnected)active.focus({preventScroll:true});
  }
  siblings.forEach(sibling=>{
   const pill=level.pills.get(sibling.id);pill.querySelector('.explorer-sibling-name').textContent=sibling.name;
   if(sibling.id===currentId)pill.setAttribute('aria-current','true');else pill.removeAttribute('aria-current');
  });
 }
 // The strip's box and content widths, as last revealed: a resize reveals the pill again only when they changed.
 const listSize=list=>(Number(list.clientWidth)||0)+'x'+(Number(list.scrollWidth)||0);
 // The list's fades as physical insets [left, right]: 22 px at the inline start and 32 px at the inline end (sides
 // swapped in RTL), on the sides where content is hidden now, or on both sides (`all`) for a scroll about to happen.
 function listFades(list,all=false){
  const scroll=Math.abs(Number(list.scrollLeft)||0),start=all||scroll>1,end=all||scroll+(Number(list.clientWidth)||0)<(Number(list.scrollWidth)||0)-1;
  return rtl()?[end?32:0,start?22:0]:[start?22:0,end?32:0];
 }
 // The list scrolls the current campus into its own view (clear of its fades), never its ancestors.
 function revealPill(level){
  const pill=level.pills.get(level.view.campus?.id);if(!pill||level.nav.hidden)return;
  const list=level.list;level.listSize=listSize(list);
  const frame=list.getBoundingClientRect(),box=pill.getBoundingClientRect(),[left,right]=listFades(list);
  if(box.left>=frame.left+left&&box.right<=frame.right-right)return;
  list.scrollLeft=(Number(list.scrollLeft)||0)+box.left+box.width/2-frame.left-frame.width/2;
 }
 // A pill the keyboard focuses (fix 20): Chrome leaves a pill that shows 32 px or more where it is, half under the
 // list's edge fade. Where the list can scroll, it alone (never an ancestor) moves the pill the least that brings it
 // clear of the fade on that side; at either end of the list that fade goes and the pill stands whole at the edge.
 function revealFocusedPill(level,target){
  const list=level.list,pill=target?.closest?.('.explorer-sibling');
  if(!pill||!list.contains(pill)||!keyboardFocus(pill))return;
  const range=(Number(list.scrollWidth)||0)-(Number(list.clientWidth)||0);if(range<=1)return;
  const frame=list.getBoundingClientRect(),box=pill.getBoundingClientRect(),[left,right]=listFades(list);
  if(box.left>=frame.left+left&&box.right<=frame.right-right)return;
  const [leftFade,rightFade]=listFades(list,true),scroll=Number(list.scrollLeft)||0;
  const delta=box.left<frame.left+left?box.left-frame.left-leftFade:box.right-frame.right+rightFade;
  // Whole pixels, rounded past the fade (the browser rounds the offset it is given); RTL offsets run from 0 at the
  // inline start to negative values.
  const offset=delta>0?Math.ceil(scroll+delta):Math.floor(scroll+delta);
  list.scrollLeft=rtl()?clamp(offset,-range,0):clamp(offset,0,range);
  updateFades(level);
 }
 // Tiny bands (fix 19): between the strip and the capsule the body shows about one control, inside its scroll paddings
 // (the ring's 2 px and 5 px offset below its top edge and above the capsule). Chrome centres there a hidden control
 // that Tab reaches and leaves alone one that covers the window, so the ring or the top of a control taller than the
 // window (the photo; any 44 px control in Arabic at 640×360) could be cut by the body's top edge. A control the keyboard
 // focuses there scrolls the body alone, the least that brings it inside the window, its top first when it is taller.
 function revealFocusedControl(level,target){
  if(level.density!=='tiny'||!target||target===level.title||!keyboardFocus(target))return;
  const body=level.body,style=view.getComputedStyle?.(body),length=value=>Number.parseFloat(value)||0;
  const frame=body.getBoundingClientRect(),box=target.getBoundingClientRect();
  const low=frame.top+length(style?.scrollPaddingTop),high=frame.bottom-length(style?.scrollPaddingBottom);
  // Offsets from `bottom` to `top` keep the control inside the window (none when it is taller: then its top first).
  // Whole pixels, rounded towards the window and, when the slack is under a pixel, in favour of its top edge.
  const scroll=Number(body.scrollTop)||0,top=scroll+box.top-low,bottom=scroll+box.bottom-high;
  const range=Math.max(0,(Number(body.scrollHeight)||0)-(Number(body.clientHeight)||0));
  const offset=clamp(scroll>top||bottom>top?Math.floor(top):scroll<bottom?Math.min(Math.ceil(bottom),Math.floor(top)):scroll,0,range);
  if(offset===scroll)return;
  body.scrollTop=offset;
  updateFades(level);
 }
 function updateFades(level){
  if(level?.kind!=='campus')return;
  const {body,list}=level,top=Number(body.scrollTop)||0,left=Math.abs(Number(list.scrollLeft)||0);
  // No top fade in tiny bands (fix 19): its 18 px would take a third of the room between the strip and the capsule, so
  // neither a focused control nor the last line could rest clear of it.
  flag(body,'fadeStart',top>1&&level.density!=='tiny');flag(body,'fadeEnd',top+(Number(body.clientHeight)||0)<(Number(body.scrollHeight)||0)-1);
  flag(list,'fadeStart',left>1);flag(list,'fadeEnd',left+(Number(list.clientWidth)||0)<(Number(list.scrollWidth)||0)-1);
 }
 function paintCampus(level){
  const text=t(),country=level.view.parent?.name??'';
  level.backLabel.textContent=country;level.back.setAttribute('aria-label',format(text.back,{country}));
  level.nav.setAttribute('aria-label',format(text.siblings,{country}));
  syncSiblings(level);
  const name=level.fallback?.children?.[0];if(name)name.textContent=level.view.campus?.name??'';
 }
 // The density and band of the campus screen come from the stage's content box, never from the section (§5.1).
 function placeCampus(level,band=stageBox()){
  const density=band.height<200?'tiny':band.height<480?'short':'normal';
  level.density=density;level.element.dataset.density=density;level.element.style.setProperty('--explorer-band',px(band.height));
  const tiny=density==='tiny',first=tiny?level.foot:level.body;
  if(level.element.children[0]!==first){
   // Tiny bands put the strip on top, before the scroller, so the visual and Tab orders agree (WCAG 2.4.3).
   const active=doc.activeElement,held=Boolean(active&&level.foot.contains(active));
   if(tiny)level.element.insertBefore(level.foot,level.body);else level.element.append(level.foot);
   if(held&&doc.activeElement!==active&&active.isConnected)active.focus({preventScroll:true});
  }
  level.band=band.height;
 }
 // The campus body is mounted again only for another campus, another language or newly arrived shapes.
 function mountBody(level,{keepScroll=false}={}){
  const campusId=level.view.campus?.id??null,locale=getLocale(),shapes=art?.shapes??null;
  if(level.campusId===campusId&&level.locale===locale&&level.shapes===shapes)return false;
  const active=doc.activeElement,inBody=Boolean(active&&level.body.contains(active)),scroll=Number(level.body.scrollTop)||0;
  level.handle?.destroy?.();level.handle=null;level.body.replaceChildren();level.fallback=null;
  if(level.sheet)observer?.unobserve(level.sheet);level.sheet=null;
  level.campusId=campusId;level.locale=locale;level.shapes=shapes;
  if(campusId!==null&&typeof renderCampus==='function')level.handle=renderCampus(level.body,campusId,locale,{headingId:level.headingId})||null;
  let heading=level.handle?.heading||null;
  if(!heading){
   // Without a sheet the screen still names the campus (and keeps a focus target).
   heading=create('h2','explorer-campus-title');heading.id=level.headingId;heading.tabIndex=-1;
   const name=create('span','',level.view.campus?.name??'');name.dir='auto';heading.append(name);
   level.body.prepend(heading);level.fallback=heading;
  }
  level.title=heading;
  level.sheet=level.handle?.element||null;if(level.sheet)observer?.observe(level.sheet);
  if(keepScroll)level.body.scrollTop=clamp(scroll,0,Math.max(0,(Number(level.body.scrollHeight)||0)-(Number(level.body.clientHeight)||0)));else level.body.scrollTop=0;
  return inBody;
 }
 function endEntering(level){
  if(level.enteringTimer!=null){view.clearTimeout?.(level.enteringTimer);level.enteringTimer=null;}
  if(level.element.dataset&&'entering' in level.element.dataset)delete level.element.dataset.entering;
 }
 function guardEntrance(level,ms){
  if(!('entering' in level.element.dataset))return;
  view.clearTimeout?.(level.enteringTimer);
  level.enteringTimer=typeof view.setTimeout==='function'?view.setTimeout(()=>{level.enteringTimer=null;endEntering(level);},Math.max(SETTLE_MS,ms)):null;
  if(level.enteringTimer==null)endEntering(level);
 }

 /* ---- Transitions ------------------------------------------------------------------------------------------ */
 // The FLIP source: the logo of the visible L3 cursor that was validated (never the compact row).
 function flipSource(previous,next){
  if(previous?.kind!=='level'||previous.view.level!=='campuses'||!previous.g||previous.g.compact||previous.cursorId!==next.campus?.id)return null;
  const node=nodeOf(previous,previous.cursorId);if(!node?.logo)return null;
  const box=node.logo.getBoundingClientRect?.(),frame=root.getBoundingClientRect?.();
  if(!box||!frame||!(box.width>0&&box.height>0)||box.right<=frame.left||box.left>=frame.right||box.bottom<=frame.top||box.top>=frame.bottom)return null;
  return {left:box.left,top:box.top,width:box.width,height:box.height,lantern:node.lantern};
 }
 function generic(previous,built,direction){
  const ascend=direction==='ascend';
  play(previous.element,[{opacity:1,transform:'none'},{opacity:0,transform:ascend?'translateY(18px) scale(.97)':'translateY(-18px) scale(1.03)'}],{duration:260},()=>drop(previous));
  play(built.element,[{opacity:0,transform:`translateY(${ascend?-22:22}px)`},{opacity:1,transform:'none'}],{duration:420,delay:80,fill:'backwards'});
  if(built.kind==='campus')guardEntrance(built,500);
 }
 // The validated logo glides into the heart and the sheet unfolds around it (§5.8).
 function flip(previous,built,source){
  const handle=built.handle,target=handle.logo.getBoundingClientRect?.();
  if(!target||!(target.width>0))return generic(previous,built,'descend');
  if(source.lantern)source.lantern.style.visibility='hidden';
  play(previous.element,[{opacity:1},{opacity:0}],{duration:220,easing:'linear'},()=>drop(previous));
  const dx=source.left+source.width/2-target.left-target.width/2,dy=source.top+source.height/2-target.top-target.height/2;
  play(handle.lantern,[{transform:`translate(${round(dx)}px, ${round(dy)}px) scale(${round(source.width/target.width,4)})`},{transform:'none'}],{duration:560});
  const items=(handle.heartItems||[]).filter(Boolean),r=rtl()?-1:1;
  items.forEach((node,index)=>play(node,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:380,delay:200+40*index,fill:'backwards'}));
  if(handle.wings?.start)play(handle.wings.start,[{opacity:0,transform:`translateX(${28*r}px)`},{opacity:1,transform:'none'}],{duration:460,delay:260,fill:'backwards'});
  if(handle.wings?.end)play(handle.wings.end,[{opacity:0,transform:`translateX(${-28*r}px)`},{opacity:1,transform:'none'}],{duration:460,delay:260,fill:'backwards'});
  play(built.foot,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:360,delay:340,fill:'backwards'});
  guardEntrance(built,Math.max(560,items.length?200+40*(items.length-1)+380:0,720,700));
 }
 function animateChange(previous,built,direction,source){
  if(reduced()||!['descend','ascend'].includes(direction)){drop(previous);if(built.kind==='campus')guardEntrance(built,SETTLE_MS);return;}
  if(source&&built.kind==='campus'&&built.handle?.logo&&built.handle?.lantern)return flip(previous,built,source);
  generic(previous,built,direction);
 }

 function show(next,{direction='none',focus=false}={}){
  if(destroyed||!next)return;
  const active=doc.activeElement,inside=Boolean(active&&root.contains(active));
  if(current&&current.key===next.key)return update(next,{focus,inside});
  // A new view first finishes the transition still running, so its outgoing view is gone at once.
  settle();
  if(current?.kind==='campus'&&next.level==='campus')return switchCampus(next,{focus,inside});
  const previous=current;if(previous?.kind==='level')previous.cursorId=cursorId;
  gesture=null;pressed=null;wheel.sum=0;
  const moving=Boolean(previous)&&!reduced()&&['descend','ascend'].includes(direction);
  // R21: the outgoing view stays where it was painted, whatever the band and the incoming view do.
  if(moving)freeze(previous);
  const source=moving&&direction==='descend'&&next.level==='campus'?flipSource(previous,next):null;
  const built=next.level==='campus'?buildCampus(next):buildLevel(next);
  current=built;changedAt=now();
  if(built.kind==='level'){
   cursorId=validCursor(next);built.cursorId=cursorId;ensureDefs();syncItems(built);paintLevel(built);
   root.append(built.element);relayout(built);observer?.observe(built.carousel);
  }else{
   cursorId=null;setStageScroll(false);placeCampus(built);if(previous)built.element.dataset.entering='';
   paintCampus(built);root.append(built.element);
   mountBody(built);revealPill(built);updateFades(built);recordBox(built);
   if(observer)[built.body,built.list].forEach(node=>observer.observe(node));
  }
  if(previous)leave(previous);
  if(focus||inside)focusTarget();
  if(previous)animateChange(previous,built,direction,source);
 }
 // Same view key: texts change in place, the nodes and the UI cursor (by id) stay.
 function update(next,{focus,inside}){
  current.view=next;
  if(current.kind==='level'){
   if(!next.items.some(item=>item.id===cursorId))cursorId=validCursor(next);
   current.cursorId=cursorId;syncItems(current);paintLevel(current);relayout(current);
  }else{
   paintCampus(current);
   // A language that flips the direction resets the strip's scroll offset (fix 1): reveal the current pill again.
   const lost=mountBody(current,{keepScroll:true});revealPill(current);updateFades(current);
   if(lost)return focusNode(current.title);
  }
  if(focus&&!current.element.contains(doc.activeElement)||inside&&!root.contains(doc.activeElement))focusTarget();
 }
 // Another campus keeps the screen: a sibling pill that was activated keeps the focus.
 function switchCampus(next,{focus,inside}){
  current.view=next;current.key=next.key;changedAt=now();
  paintCampus(current);revealPill(current);
  const lost=mountBody(current),active=doc.activeElement;updateFades(current);
  if([...current.pills.values()].includes(active))return;
  if(lost||(focus||inside)&&!current.element.contains(active))focusNode(current.title);
 }
 function resized(){
  if(destroyed||!current)return;
  if(current.kind==='level'){
   if(gesture?.dragging)return;
   const band=stageBox(),size=current.size,W=Number(current.carousel.clientWidth)||band.W,H=Number(current.carousel.clientHeight)||band.height;
   if(!size||size.band!==band.height||size.width!==band.width||size.W!==W||size.H!==H)relayout(current);
   return;
  }
  const band=stageBox();
  if(band.height!==current.band)placeCampus(current,band);
  // A strip that changed width (rotation, window, fonts) may hide the current pill (fix 1); an unrelated resize (the
  // sheet's own size) never undoes a scroll of the strip by the visitor.
  if(listSize(current.list)!==current.listSize)revealPill(current);
  updateFades(current);recordBox(current);
 }

 function localize(){
  if(destroyed)return;
  title.textContent=t().title;
  if(current?.kind==='level'){paintLevel(current);relayout(current);}
  if(current?.kind==='campus'){paintCampus(current);if(mountBody(current,{keepScroll:true}))focusNode(current.title);revealPill(current);updateFades(current);}
 }
 /** Moves the UI cursor of the current level (no announcement): true when the level holds `id`, also if already there. */
 function setCursor(id,{focus=false,animate=true}={}){
  if(destroyed||current?.kind!=='level'||!current.view.items.some(item=>item.id===id))return false;
  moveCursor(id,{focus,animate});
  return true;
 }

 function activateItem(button,event){
  const item=current.view.items.find(entry=>entry.id===button.dataset.id);
  if(!item||event.detail>1)return;
  if(event.detail>0){
   // A pointer click validates only the item that was already the cursor when it was pressed.
   const wasCursor=pressed?.card===button?pressed.wasCursor:item.id===cursorId;pressed=null;
   if(!wasCursor){moveCursor(item.id,{focus:true,animate:true});return;}
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
  const outgoing=[...leaving].some(record=>record.element.contains(event.target));
  if(outgoing||now()-changedAt<SETTLE_MS){event.preventDefault();event.stopPropagation();}
 },true);
 listen(root,'click',event=>{
  const target=event.target;if(!current||!current.element.contains(target))return;
  if(current.kind==='level'){
   const card=target.closest?.('[data-explorer-card]');if(card)return activateItem(card,event);
   const nav=target.closest?.('.explorer-nav');
   if(nav&&nav.getAttribute('aria-disabled')!=='true')moveBy(nav.dataset.dir==='next'?1:-1,{animate:true,announce:true});
   return;
  }
  if(target.closest?.('.explorer-campus-back'))return onAscend();
  const pill=target.closest?.('.explorer-sibling');
  if(pill&&current.list.contains(pill)&&pill.getAttribute('aria-current')!=='true')onValidate({kind:'campus',id:pill.dataset.id});
 });
 listen(root,'keydown',event=>{
  if(!current||event.altKey||event.ctrlKey||event.metaKey||event.isComposing)return;
  const target=event.target;
  if(target?.closest?.('dialog')?.open||editable(target))return;
  if(event.key==='Escape'||event.key==='Backspace'){
   // A held key ascends once (H2f): its auto-repeats are swallowed.
   if((current.view.depth??1)>1){event.preventDefault();if(!event.repeat)onAscend();}
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
  moveCursor(items[clamp(destination,0,items.length-1)].id,{focus:true,animate:true});
 });
 if(motion?.addEventListener)listen(motion,'change',()=>{
  if(!motion.matches)return;
  settle();
  if(current?.kind==='level'){stopGlide(current);current.nodes.forEach(node=>flag(node.button,'gliding',false));}
 });
 if(coarse?.addEventListener)listen(coarse,'change',()=>{if(current?.kind==='level')paintHint(current,t());});
 doc.fonts?.ready?.then?.(()=>{
  if(destroyed)return;
  if(current?.kind==='level')relayout(current);
  if(current?.kind==='campus')updateFades(current);
 },()=>{});

 function destroy(){
  if(destroyed)return;
  settle();destroyed=true;disarmSwallow();view.clearTimeout?.(wheel.timer);
  if(current){
   if(current.kind==='campus'){current.handle?.destroy?.();current.handle=null;endEntering(current);}else stopGlide(current);
   current.element.remove();current.disposers.splice(0).forEach(dispose=>dispose());current=null;
  }
  observer?.disconnect();disposers.splice(0).forEach(dispose=>dispose());
  for(const pending of [...frames])pending.cancel();frames.clear();
  if(ownTitle)title.remove();
 }
 return {show,focus:focusTarget,localize,destroy,hasView:()=>Boolean(current),setCursor};
}
