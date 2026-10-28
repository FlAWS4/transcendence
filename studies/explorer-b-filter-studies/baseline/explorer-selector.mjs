/* Explorer level selector of version B, « Halo » design (25 Oct 2026, SPEC-B-HALO §3–5, §7.2). Every level is a row of
 * silhouettes standing on a curved horizon (the edge of the former globe): the cursor in a pool of
 * light above the fixed « Valider » button (§P), its neighbours stepping down, smaller. The campus screen hosts B's sheet
 * in place of the level, with the strip of the other campuses outside its scroller. Moving the cursor never filters: an
 * item's click (or the « Valider » button's) is the only path to onValidate, keyboard activation reaching it as the
 * native detail-0 click. Only root.ownerDocument and its defaultView are used, so a fake document can drive the whole
 * module; the art (silhouettes, campus dots, printed logos, icons) arrives through `art` and is never imported here. */
const copy={
 fr:{title:'Explorer',prompt:{continents:'Où veux-tu aller ?',countries:'Choisir un pays',campuses:'Choisir un campus'},step:'Étape {n} sur 3',select:'Valider',position:'{i} sur {n}',carousel:'carrousel',
  keys:[['Flèches','pour choisir'],['Entrée','pour valider'],['Échap','pour revenir']],touch:'Glisse pour choisir · Touche le centre pour valider',help:'Aide',back:'Revenir aux campus · {country}',siblings:'Tous les campus · {country}'},
 en:{title:'Explore',prompt:{continents:'Where would you like to go?',countries:'Choose a country',campuses:'Choose a campus'},step:'Step {n} of 3',select:'Select',position:'{i} of {n}',carousel:'carousel',
  keys:[['Arrows','to choose'],['Enter','to select'],['Esc','to go back']],touch:'Swipe to choose · Tap the centre to select',help:'Help',back:'Back to campuses · {country}',siblings:'All campuses · {country}'},
 ar:{title:'استكشف',prompt:{continents:'إلى أين تريد الذهاب؟',countries:'اختر دولة',campuses:'اختر فرعًا'},step:'المرحلة {n} من 3',select:'تأكيد',position:'{i} من {n}',carousel:'عرض دوّار',
  // The Latin key names keep their own language inside the Arabic hint.
  keys:[['الأسهم','للاختيار'],['Enter','للتأكيد','en'],['Esc','للرجوع','en']],touch:'اسحب للاختيار · المس العنصر في الوسط للتأكيد',help:'مساعدة',back:'العودة إلى فروع {country}',siblings:'جميع فروع {country}'},
};
const languageOf=locale=>String(locale||'fr').toLowerCase().split(/[-_]/)[0];
const words=locale=>{const language=languageOf(locale);return Object.hasOwn(copy,language)?copy[language]:copy.fr;};
const format=(template,values)=>template.replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));
const keyOf=item=>item.kind+':'+item.id;
const SVG='http://www.w3.org/2000/svg',EASE='cubic-bezier(.22,1,.36,1)';
// The track bleeds 170 px above and below the carousel, so the pool, the horizon's glow and the shadows are never cut.
const BLEED=170;
// Pointer clicks landing within 350 ms of a new level belong to the gesture that opened it. A glide along the horizon
// lasts today's 0.5 s (§L); the looks' fades it started end within .35 s after it.
const SETTLE_MS=350,DRAG_PX=8,WHEEL_STEP=50,WHEEL_IDLE=150,GLIDE_MS=560,SLIDE_MS=500,FADE_MS=350,COMPACT_GAP=26,STAGE_SCROLL_BAND=44,REBUILD_K=.05;
// The key hints' bubble stands 8 px clear of the info button (its 44 px target included) or of the « Valider » button.
const HINT_GAP=8;
// The horizon comes down 40 px (26 Oct 2026, refinements §U, « Nettement sous le 42 »), where the room under it allows.
const LOWER=40;
// The entrance's arrival (§R): the level's centre parts rise 10 px as they fade in, 0.45 s after 0.25 s.
const ARRIVE_RISE=10,ARRIVE_PARTS_MS=450,ARRIVE_PARTS_DELAY=250;
const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
const round=(value,digits=2)=>{const k=10**digits;return Math.round(value*k)/k;};
const px=value=>round(value)+'px';
let instanceCount=0;

/** Halo's carousel geometry (SPEC-B-HALO §3.4, §3.5): the cursor box, the neighbours' slots and the horizon circle.
 * One horizon per band (25 Oct 2026, refinements §I): the campus level keeps its own item sizes but stands on the line
 * of the continents and countries (their floor0, d1 and R), so its cursor box starts bh above that floor0.
 * A lower horizon (26 Oct 2026, refinements §U): the line, and every level standing on it, comes down LOWER px from the
 * middle of the carousel, so the entrance's arc, drawn on it, passes clearly below the 42; less where the room under it
 * runs out, so that the campus level's one-line name and the fixed « Valider » under it (goTop, 36 px tall) still end
 * inside the carousel, above the foot's pager row; never higher than the middle. The sizes, the curve and its drops do
 * not change: only floor0 (and top, the cursor box's top) moves. */
export function haloGeometry({W,H,phone=W<700,campus=false,density='normal'}){
 if(density==='compact'){
  const bh=clamp(H-16,28,60);
  return {density,phone,compact:true,campus,W,H,bh,bw:bh*1.5,s1:1,s2:1,x1:null,x2:null,top:(H-bh)/2,floor0:null,d1:null,R:null,F:15,below:0};
 }
 // Under the cursor box: the campus name, or the room of the count the continents and countries showed until 25 Oct
 // 2026 (refinements §K: kept, so the line does not move), then the chip.
 const below=campus?12+26+12+36:10+20+12+36;
 const bh=clamp(H-below-30,84,campus?200:250);
 const bw=campus?bh:clamp(Math.min(W*(phone?.64:.25),bh*1.42),110,340);
 const s1=phone?.56:.58,s2=.42;
 const x1=phone?W/2+bw*s1/2-46:Math.max(bw*.5+bw*s1*.5+60,Math.min(W*.23,360));
 const x2=phone?x1+400:x1+bw*(s1+s2)/2+64;
 const F=campus?clamp(.11*bh,18,22):clamp(.13*bh,22,32);
 if(campus){const {floor0,d1,R}=haloGeometry({W,H,phone,density});return {density,phone,compact:false,campus,W,H,bh,bw,s1,s2,x1,x2,top:floor0-bh,floor0,d1,R,F,below};}
 // The campus level's name size in this band (its lantern as above), which sets where the « Valider » ends (§U).
 const middle=Math.max(8,(H-bh-below)/2-2)+bh,nameF=round(clamp(.11*clamp(H-(12+26+12+36)-30,84,200),18,22));
 const floor0=Math.max(middle,Math.min(middle+LOWER,H-(10+1.12*nameF+12+36))),d1=bh*(phone?.09:.12);
 return {density,phone,compact:false,campus,W,H,bh,bw,s1,s2,x1,x2,top:floor0-bh,floor0,d1,R:(x1*x1+d1*d1)/(2*d1),F,below};
}

/** The fixed « Valider » button (26 Oct 2026, refinements §P): its top in carousel coordinates, one place for every level
 * of a band, where the campus level puts its cursor's chip: under the logo (the common floor0) and a one-line campus name
 * (its 10 px margin and its line, 1.12 × F at the stylesheet's F), then the chip's 12 px margin. None in the compact row. */
export function goTop({W,H,phone=W<700,density='normal'}){
 const g=haloGeometry({W,H,phone,campus:true,density});
 return g.compact?null:g.floor0+10+1.12*round(g.F)+12;
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
 return rankLayout({g,list,cursor,mirror,fade,arabic,fitLogo});
}
// The ranks around a whole cursor index, which a drag past either end of the list may put outside it (§C).
function rankLayout({g,list,cursor,mirror,fade,arabic,fitLogo}){
 const n=list.length,{W,bh,bw,s1,s2,x1,x2,phone,campus,F}=g,base0=campus?bh:bw,small=arabic?14:13;
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
  // The cursor's button (the same rule as widths[cursor]) starts each side, also where no item stands at the cursor.
  let previousDist=0,previousWidth=Math.max(base0,220);
  for(let index=side>0?Math.max(cursor+1,0):Math.min(cursor-1,n-1);index>=0&&index<n;index+=side){
   const entry=entries[index];if(entry.off==='out')continue;
   widths[index]=Math.max(entry.fw*entry.s,Math.min(widths[index],2*(entry.dist-previousDist-previousWidth/2-8)));
   previousDist=entry.dist;previousWidth=widths[index];
  }
 }
 const nmax=phone?W-2*fade-8:null;
 return {fade,nmax,items:entries.map((entry,index)=>{
  const {item,a,side,s,dist,fw,fh,base,nk,off}=entry,w0=widths[index]/s;
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
  // mt: the campus names stand 10 px under the lantern on screen at every rank (no count under the shapes since §K).
  return {id:item.id,off,visible:phone?a<=1:off!=='out'&&dist-base/2<W/2,s,dist,x:W/2+dist*side*mirror,y:BLEED+floorAt(g,dist)-bh,w0,fw,fh,nk,ns:nk/s,
   mt:10/s-10,lk,nx,logo};
 })};
}

/**
 * The layout of a drag (25 Oct 2026, refinements §C): the row around a fractional cursor `cursor`, which may lie past
 * either end of the list. Pure, like layoutItems. Between two whole cursors, every item's distance from the centre,
 * scale, name scale (nk), logo floor (lk) and name shift (nx) go linearly from one rank value to the next, its feet stay
 * on the horizon (y = BLEED + floorAt(g, dist) − bh), and the name's counter-scale (ns) and the campus names' offset (mt)
 * follow. The rank looks (off, the button width w0) are those of the nearest whole cursor, Math.round(cursor), and `sr`
 * is that rank's scale. `visible`: some of the item's art box is on screen (a look may be fading it). A whole cursor
 * inside the list gives layoutItems' positions, scales and looks. A compact row is not continuous (its drag moves the
 * row rigidly): layoutItems.
 */
export function continuousLayout({geometry:g,items,cursor,rtl=false,arabic=rtl,fitLogo=null}){
 const list=items||[],c=Number(cursor)||0;
 if(g.compact||!list.length)return layoutItems({geometry:g,items:list,cursorIndex:c,rtl,arabic,fitLogo});
 const low=Math.floor(c),u=c-low,mirror=rtl?-1:1,fade=edgeFade(g),{W,bh,bw,campus}=g,base0=campus?bh:bw;
 const ranks=index=>rankLayout({g,list,cursor:index,mirror,fade,arabic,fitLogo}),from=ranks(low),to=u?ranks(low+1):from,near=u<.5?from:to;
 return {fade,nmax:from.nmax,items:from.items.map((a,index)=>{
  const b=to.items[index],look=near.items[index],mix=key=>a[key]+(b[key]-a[key])*u,o=index-c,dist=mix('dist'),s=mix('s'),nk=mix('nk');
  return {id:a.id,off:look.off,visible:dist-base0*s/2<W/2,s,dist,x:W/2+dist*Math.sign(o)*mirror,y:BLEED+floorAt(g,dist)-bh,w0:look.w0,fw:a.fw,fh:a.fh,
   nk,ns:nk/s,mt:10/s-10,lk:mix('lk'),nx:mix('nx'),logo:a.logo,sr:look.s};
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
  y:BLEED+(H-(Number(entry.item.height)>0?Number(entry.item.height):bh))/2,w0:null,fw:entry.fw,fh:entry.fh,nk:1,ns:1,mt:0,lk:1,nx:0,logo:entry.logo}))};
}

// The selector's easing, cubic-bezier(.22,1,.36,1) (EASE, --ease): y = 1 − (1 − s)³ where x(s) = .66 s(1 − s)² +
// 1.08 s²(1 − s) + s³ is the time fraction u; [its value, its slope] at u (x(s) = u by Newton's method inside a bracket).
const bezierX=s=>.66*s*(1-s)**2+1.08*s*s*(1-s)+s**3,bezierSlope=s=>.66*(1-s)**2+.84*s*(1-s)+1.92*s*s;
function easing(u){
 if(u>=1)return [1,0];
 let low=0,high=1,s=u;
 for(let step=0;step<64;step++){
  const x=bezierX(s)-u;if(Math.abs(x)<1e-14)break;
  if(x>0)high=s;else low=s;
  const next=s-x/bezierSlope(s);s=next>low&&next<high?next:(low+high)/2;
 }
 return [1-(1-s)**3,3*(1-s)**2/bezierSlope(s)];
}
// A move made while the row still glides keeps the easing's course but starts at rest: the part 4.55·u·(1 − u)¹² taken
// off its start (4.55 = 3 / .66, the easing's starting slope) brings its starting speed to 0, so the row's speed never
// jumps; it is under 2 % of the step after 0.15 s and nothing at the end, which stays the easing's.
const START=3/.66,SMOOTH=12;
// A move lasts 0.5 s, or its own `duration` (the entrance's arrival, §R).
function moveAt({at,step,smooth,duration=SLIDE_MS},time){
 const u=(time-at)/duration;
 if(u<0)return [0,0];
 if(u>=1)return [step,0];
 const [value,slope]=easing(u);
 if(!smooth)return [step*value,step*slope/duration];
 return [step*(value-START*u*(1-u)**SMOOTH),step*(slope-START*(1-u)**(SMOOTH-1)*(1-(SMOOTH+1)*u))/duration];
}
/**
 * Glides along the horizon (26 Oct 2026, refinements §L): the fractional cursor that every frame of a cursor move lays the
 * row out for (continuousLayout), from where the row stands to the target index. Pure. Each move adds its step as the
 * selector's easing over 0.5 s: a move from rest is exactly that easing, so a single move lands on the whole cursor
 * (layoutItems) after 0.5 s as today's glide did; a move made while the row still glides (a held key's repeats; a press,
 * a click or the wheel before the last glide ended) takes the same course from a start at rest, so it only moves the
 * target: neither the position nor the speed jumps. The glide is the sum of its moves: it ends on the last target 0.5 s
 * after the last move, never goes beyond the targets it went through, and settles with the easing's end.
 * glideTo(glide | null, {from, to, at}) → glide | null: without a glide the row starts from rest at `from`, where it
 * stands; a glide that ended starts again from its target; null when there is nothing to glide. glideAt(glide, at) →
 * {cursor, speed, to, done}, the speed in items per millisecond, for any time from the last glideTo on (the moves that
 * were over by then count whole). Times in milliseconds. A glide from rest may take its own `duration` (the entrance's
 * arrival, §R); a move made while it glides keeps the 0.5 s.
 */
export function glideTo(glide,{from,to,at,duration}){
 const state=glide?glideAt(glide,at):null;
 if(!state||state.done){const base=state?state.to:Number.isFinite(from)?from:to;return base===to?null:{base,to,moves:[{at,step:to-base,smooth:false,...(duration>0?{duration}:{})}]};}
 if(to===glide.to)return glide;
 // Moves that are over join the base, so a long held key keeps a short list.
 const over=glide.moves.filter(move=>at>=move.at+(move.duration??SLIDE_MS));
 return {base:over.reduce((sum,move)=>sum+move.step,glide.base),to,moves:[...glide.moves.filter(move=>!over.includes(move)),{at,step:to-glide.to,smooth:true}]};
}
export function glideAt(glide,at){
 let cursor=glide.base,speed=0,done=true;
 for(const move of glide.moves){const [value,rate]=moveAt(move,at);cursor+=value;speed+=rate;if(at<move.at+(move.duration??SLIDE_MS))done=false;}
 return done?{cursor:glide.to,speed:0,to:glide.to,done}:{cursor,speed,to:glide.to,done};
}

/** Pager dots that fit the band (R15): 'normal' | 'dense' | 'none'; hidden below 381 px of viewport width (halo). */
export function pagerDots({n,width,countWidth=55,viewport=Infinity}){
 if(!(n>0)||viewport<381)return 'none';
 const need=(size,gap,current)=>88+36+countWidth+n*size+(n-1)*gap+(current-size);
 if(n<=16&&need(6,6,20)<=width)return 'normal';
 return need(4,4,14)<=width?'dense':'none';
}

// The cursor moves are never announced: the only announcing path, Previous / Next, is gone (25 Oct 2026), so an
// `onAnnounce` option is ignored.
export function createExplorerSelector({root,getLocale=()=>'fr',motion=null,onValidate=()=>{},onAscend=()=>{},renderCampus=null,art=null}){
 const doc=root.ownerDocument,view=doc.defaultView||{},disposers=[],running=new Map(),leaving=new Set(),frames=new Set();
 let current=null,cursorId=null,changedAt=-Infinity,pressed=null,gesture=null,swallow=null,destroyed=false,defsReady=false,bubble=null;
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
 const flag=(node,name,on)=>{if(on){if(node.dataset[name]!=='')node.dataset[name]='';}else if(name in node.dataset)delete node.dataset[name];};
 // A repaint writes only what changes (§L): a held key repaints the level at every repeat, and a text or an attribute
 // written again unchanged still costs the browser a restyle when the focus moves. A text that changes (the count, at
 // every move) changes in its own text node: a replaced node makes Chrome check the page's :has() rules again, which
 // restyles the whole page (635 elements at 1440, 12–27 ms with the CPU slowed down four times).
 const setText=(node,value)=>{
  if(node.textContent===value)return;
  const only=node.firstChild;
  if(only&&only===node.lastChild&&only.nodeType===3)only.data=value;else node.textContent=value;
 };
 const setAttr=(node,name,value)=>{if(node.getAttribute(name)!==value)node.setAttribute(name,value);};
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
 // « Valider » (26 Oct 2026, refinements §P, « Fixe, il ne bouge jamais »): one button for every level, kept across the
 // level views. Each level's layout moves it into its own track, between the pool and the items (the stylesheet's ring
 // reads the items layer as its next sibling), at goTop(): the same box at L1, L2 and L3 of a band, which no glide, drag,
 // wheel move or level change moves or fades (the items pass over it). A pointer press on it validates the cursor;
 // keyboards and screen readers keep the cursor item (one tab stop, Enter or Space, « Valider » in its name), so it is
 // hidden from assistive technology and never focused. The compact row keeps its cursor's own chip, in flow after the name
 // (R23): no fixed place there fits without overlapping the row.
 const go=create('span','explorer-go'),goLabel=create('span','explorer-go-label'),goIcon=icon('enter');
 go.setAttribute('aria-hidden','true');go.hidden=true;if(goIcon)go.append(goIcon);go.append(goLabel);
 // Its shadow deepens while the centre item (rank 0) is hovered, as the cursor's own chip did (data-hover, for the
 // stylesheet's (hover:hover) rule): written here on a change only, since a :has() rule on the items' data-off restyled
 // the whole level at every frame of a glide.
 let hovered=null;
 function hoverGo(){flag(go,'hover',Boolean(hovered?.dataset?.off==='0'&&current?.kind==='level'&&current.items.contains(hovered)));}

 // Runs once on the next animation frame (or task), with the frame's time when there is one; destroy() cancels what is
 // still pending.
 function frame(callback){
  const pending={cancel:()=>{}},run=time=>{if(!frames.delete(pending))return;callback(time);};
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
 // R21: each view's border box relative to the stage's padding box, as laid out (physical px, valid in RTL). Kept to the
 // layout's own precision (1/64 px needs 6 decimals): parts of a frozen level stay in view as it leaves (§D), and a box
 // rounded to 0.01 px moved them by a pixel at the first frame.
 function recordBox(record){
  const box=record.element.getBoundingClientRect?.(),frame=root.getBoundingClientRect?.();if(!box||!frame)return;
  record.box={left:round(box.left-frame.left,6),top:round(box.top-frame.top+(Number(root.scrollTop)||0),6),width:round(box.width,6),height:round(box.height,6)};
 }
 function freeze(record){
  const box=record.box;if(!box)return;
  Object.assign(record.element.style,{position:'absolute',gridArea:'auto',left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px',margin:'0'});
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
  else{stopGlide(record);stopFades(record);}
 }
 // A level that leaves is frozen as it was painted (R21): a glide along the horizon stops where it is (§L).
 function leave(record){
  if(record.kind==='level'){observer?.unobserve(record.carousel);stopGlide(record);record.slide=null;}
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
  // The pager holds the dots, the count and the info button: no Previous / Next buttons (25 Oct 2026). The key hints,
  // still the group's description (H2f), open from that button in a bubble (refinements §H); an invisible copy of their
  // line, without ids, keeps its room in normal bands, so the carousel and its items stay where they were.
  const foot=create('div','explorer-foot'),pager=create('div','explorer-pager');
  const dotsBar=create('span','explorer-dots'),count=create('span','explorer-count'),info=create('button','explorer-info'),mark=create('span','explorer-info-mark');
  dotsBar.setAttribute('aria-hidden','true');count.dir='ltr';count.setAttribute('aria-hidden','true');
  info.type='button';info.setAttribute('aria-expanded','false');mark.setAttribute('aria-hidden','true');info.append(mark);
  pager.append(dotsBar,count,info);
  const hint=create('p','explorer-hint'),keys=create('span','explorer-hint-keys'),touch=create('span','explorer-hint-touch');
  hint.id='explorer-hint-'+n;keys.id='explorer-hint-keys-'+n;touch.id='explorer-hint-touch-'+n;hint.append(keys,touch);info.setAttribute('aria-controls',hint.id);
  const room=create('div','explorer-hint-room'),roomKeys=create('span'),roomTouch=create('span');
  room.setAttribute('aria-hidden','true');room.append(roomKeys,roomTouch);
  foot.append(pager,hint,room);element.append(head,carousel,foot);
  const level={kind:'level',key:model.key,view:model,element,head,stepRow:steps,steps:dots,prompt,promptText,stepText,carousel,track,horizon,glowPath,linePath,pool,items,foot,
   dots:dotsBar,count,info,hint,keys,touch,roomKeys,roomTouch,hintLanguage:null,nodes:new Map(),g:null,lay:null,size:null,box:null,glideTimer:null,slide:null,fadeTimer:null,
   cursorId:null,disposers:[]};
  bindCarousel(level);
  // A glide of the compact row ends on its item's own transform transition (sub-elements bubble theirs with other targets).
  listen(items,'transitionend',event=>{const node=event.target;if(event.propertyName==='transform'&&node?.parentNode===items&&node.dataset)delete node.dataset.gliding;},undefined,level.disposers);
  return level;
 }
 function createItem(item){
  const button=create('button','explorer-item');button.type='button';button.dataset.explorerCard='';button.dataset.id=item.id;button.dataset.kind=item.kind;button.dataset.off='out';
  // No halo around any item (25 Oct 2026): the box holds the figure only.
  const box=create('span','explorer-box'),figure=create('span','explorer-figure'),name=create('span','explorer-name');
  box.setAttribute('aria-hidden','true');name.dir='auto';box.append(figure);button.append(box);
  const node={item,button,figure,name,lantern:null,logo:null,logoPrint:null,art:null,artK:0,shape:null,dots:null,ratio:1.2,lx:50,ly:50,nameWidth:0,go:null,goLabel:null};
  // No count under the continents and countries (25 Oct 2026, refinements §K); the accessible name keeps the counts. The
  // item's own chip serves the compact row only since the fixed « Valider » (§P).
  if(item.kind==='campus'){node.lantern=create('span','explorer-lantern');figure.append(node.lantern);button.append(name);}
  else figure.append(name);
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
 function keyParts(text){
  const parts=[];
  text.keys.forEach(([key,action,lang],index)=>{
   if(index)parts.push(create('span','explorer-hint-sep',' · '));
   const kbd=create('kbd','',key);if(lang)kbd.lang=lang;parts.push(kbd,create('span','',' '+action));
  });
  return parts;
 }
 function paintHint(level,text){
  const language=languageOf(getLocale());
  if(level.hintLanguage!==language){
   level.hintLanguage=language;
   level.keys.replaceChildren(...keyParts(text));level.touch.textContent=text.touch;
   level.roomKeys.replaceChildren(...keyParts(text));level.roomTouch.textContent=text.touch;
  }
  // The group is described by the hint the bubble shows (H2f, §H): keys, or touch on coarse pointers.
  const touch=Boolean(coarse?.matches);
  for(const [node,hidden]of [[level.keys,touch],[level.roomKeys,touch],[level.touch,!touch],[level.roomTouch,!touch]])if(node.hidden!==hidden)node.hidden=hidden;
  setAttr(level.carousel,'aria-describedby',(touch?level.touch:level.keys).id);
 }
 function paintItem(node,item,position,total,text){
  const isCursor=item.id===cursorId,place=format(text.position,{i:position+1,n:total});
  setText(node.name,item.name);setText(node.goLabel,text.select);
  setAttr(node.button,'aria-label',[item.ariaLabel||[item.name,item.countText].filter(Boolean).join(' · '),place,...(isCursor?[text.select]:[])].join(' · '));
  setAttr(node.button,'tabindex',isCursor?'0':'-1');
 }
 function paintLevel(level){
  const text=t(),items=level.view.items,total=items.length,index=items.findIndex(item=>item.id===cursorId);
  const step=level.view.step?.index??{continents:1,countries:2,campuses:3}[level.view.level]??1;
  setText(level.promptText,text.prompt[level.view.level]??'');setText(level.stepText,' · '+format(text.step,{n:step}));
  level.steps.forEach((dot,position)=>{const state=position+1<step?'done':position+1===step?'current':'todo';if(dot.dataset.state!==state)dot.dataset.state=state;});
  setAttr(level.carousel,'aria-roledescription',text.carousel);
  setText(level.count,total?`${index+1} / ${total}`:'');
  if(level.dots.children.length!==total)level.dots.replaceChildren(...items.map(()=>create('i')));
  [...level.dots.children].forEach((dot,position)=>flag(dot,'current',position===index));
  // The current pill is an indicator moved by transform to this index: the dots never change size (fix 7, §9.3).
  if(level.dots.style.getPropertyValue('--dot')!==String(Math.max(0,index)))level.dots.style.setProperty('--dot',String(Math.max(0,index)));
  setAttr(level.info,'aria-label',text.help);setText(goLabel,text.select);
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
  for(const name of ['nk','ns','lk'])style.setProperty('--'+name,String(round(entry[name],4)));
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
 // A frame of a drag or of a glide along the horizon restyles as little as it can (§C, §L: 60 frames/s with the CPU
 // slowed down). The item, its name and its logo get inline the transforms the stylesheet builds from the rank variables
 // (transforms nothing inherits, so the art inside is not restyled). The looks (data-off), the button's width (--w0, a
 // layout) and the art's stroke compensation (--s, as at the start of a glide, R27) change only with the nearest rank;
 // the names' (--nk, a repaint) follows within 10 %, so their halo stays 4 px ± 0.4 px on screen and never jumps.
 function writeDrag(node,entry){
  const button=node.button,style=button.style,once=(name,value)=>{if(style.getPropertyValue(name)!==value)style.setProperty(name,value);};
  if(button.dataset.off!==String(entry.off))button.dataset.off=String(entry.off);
  once('--w0',px(entry.w0));once('--s',String(round(entry.sr,4)));
  style.setProperty('transform',`translate3d(calc(${px(entry.x)} - 50%),${px(entry.y)},0) scale(${round(entry.s,4)})`);
  const name=node.name.style,ns=round(entry.ns,4);
  if(node.lantern){name.setProperty('transform',`translateY(${px(entry.mt)}) scale(${ns})`);node.logo?.style.setProperty('transform',`scale(${round(entry.lk,4)})`);return;}
  name.setProperty('transform',`translate(calc(-50% + ${px(entry.nx)}),-50%) scale(${ns})`);
  const nk=Number(name.getPropertyValue('--nk'))||Number(style.getPropertyValue('--nk'))||1;
  if(Math.abs(nk/entry.nk-1)>.1)name.setProperty('--nk',String(round(entry.nk,4)));
 }
 // The end of a drag or of a glide along the horizon gives the items back to their own variables.
 function clearDrag(level){
  for(const node of level.nodes.values()){
   for(const element of [node.button,node.name,node.logo])element?.style.removeProperty('transform');
   node.name.style.removeProperty('--nk');
  }
 }
 // One frame of a drag or of a glide along the horizon (§C, §L): the continuous layout at the fractional cursor c, from the
 // stored geometry and measures (nothing is read from the layout). After the first frame, an item off screen now and at
 // its last frame is left where it is (nobody sees it).
 function follow(level,c,first){
  const lay=continuousLayout({geometry:level.g,items:inputs(level),cursor:c,rtl:rtl(),arabic:arabic(),fitLogo:art?.fitLogo||null});
  level.view.items.forEach((item,index)=>{
   const node=level.nodes.get(keyOf(item)),entry=lay.items[index];flag(node.button,'gliding',false);
   if(first||entry.visible||node.shown)writeDrag(node,entry);
   node.shown=entry.visible;
  });
  level.lay=lay;hoverGo();
 }
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
 function stopFades(level){if(level.fadeTimer!=null){view.clearTimeout?.(level.fadeTimer);level.fadeTimer=null;}}
 // A glide along the horizon ends at once where it is (§L), its fades with it; unless a drag holds the row, the items go
 // back to their variables (the caller writes them in the same task).
 function stopSlide(level){
  level.slide=null;stopFades(level);flag(level.element,'sliding',false);
  if(!(gesture?.level===level&&gesture.dragging))clearDrag(level);
 }
 // One layout of a level: 'instant' (no transition: data-instant, a style flush, removed next frame), 'glide' (a cursor
 // move of the compact row: the items visible before or after it transition, §4.15), 'jump' (a move without motion) or
 // 'rest' (the end of a glide along the horizon, §L: the variables take the values its last frames wrote inline, then
 // its own styles go, while the looks' fades it started end under data-sliding). Any other layout first ends a glide
 // along the horizon where it is.
 function layoutLevel(level,mode){
  const g=level.g;if(!g)return;
  if(mode!=='rest')stopSlide(level);
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
  level.lay=lay;hoverGo();
  if(mode==='instant'){
   drawStage(level,g,lay);
   void level.element.offsetWidth;   // the transition-less style applies before transitions come back
   frame(()=>{if(!destroyed&&level.element.dataset)delete level.element.dataset.instant;});
   recordBox(level);
  }
  stopGlide(level);
  if(glide.size)level.glideTimer=view.setTimeout?.(()=>{level.glideTimer=null;level.nodes.forEach(node=>flag(node.button,'gliding',false));},GLIDE_MS)??null;
  if(mode!=='rest')return;
  clearDrag(level);
  level.fadeTimer=view.setTimeout?.(()=>{level.fadeTimer=null;flag(level.element,'sliding',false);},FADE_MS)??null;
  if(level.fadeTimer==null)flag(level.element,'sliding',false);
 }
 // The instant protocol (§4.15): show(), resize, fonts, localize() and band changes re-lay the level out at once.
 function relayout(level){
  if(!level||destroyed)return;
  const band=stageBox(),density=band.height<250?'compact':band.height<420?'short':'normal',phone=band.W<700;
  level.element.dataset.density=density;flag(level.element,'phone',phone);
  // The compact row has no pager (its foot is visually hidden): no info button there, nor its bubble (§H).
  level.info.hidden=density==='compact';if(level.info.hidden&&bubble?.level===level)closeHint();
  setStageScroll(band.height<STAGE_SCROLL_BAND);
  const W=Number(level.carousel.clientWidth)||band.W,H=Number(level.carousel.clientHeight)||band.height;
  const g=haloGeometry({W,H,phone,campus:level.view.level==='campuses',density});
  level.g=g;level.size={W,H,band:band.height,width:band.width};
  // The fixed « Valider » (§P) comes into this level's track at its band's place (track coordinates, to the layout's own
  // precision); hidden in the compact row, whose cursor shows its own chip.
  if(go.parentNode!==level.track)level.track.insertBefore(go,level.items);
  const top=g.compact?null:goTop({W,H,phone,density});go.hidden=top==null;
  if(top!=null)go.style.setProperty('--go-y',round(BLEED+top,4)+'px');
  const layer=level.items.style;
  layer.setProperty('--h0',px(g.bh));layer.setProperty('--F',px(g.F));
  const nmax=!g.compact&&g.phone?g.W-2*edgeFade(g)-8:null;
  if(nmax==null)layer.removeProperty('--nmax');else layer.setProperty('--nmax',px(nmax));
  ensureArt(level,g);
  // Names are measured at the cursor size, where they are laid out at every rank (§4.8).
  for(const node of level.nodes.values())node.nameWidth=Number(node.name.offsetWidth)||0;
  const mode=pagerDots({n:level.view.items.length,width:band.width,countWidth:Number(level.count.offsetWidth)||55,viewport:band.W});
  level.dots.hidden=mode==='none';flag(level.dots,'dense',mode==='dense');
  layoutLevel(level,'instant');
  if(bubble?.level===level)placeHint(level);
 }
 /* ---- The key hints behind the info button (25 Oct 2026, refinements §H) ------------------------------------------- */
 // One bubble, the current level's: a click, a tap, Enter or Space on the button toggles it (the focus stays there); a
 // second one, Escape (which then ascends no level), a press anywhere else, a level change or leaving the Explorer (its
 // stage made inert) closes it. The page-wide listeners live only while it is open.
 function openHint(level){
  closeHint();
  bubble={level,disposers:[]};
  level.info.setAttribute('aria-expanded','true');flag(level.hint,'open',true);placeHint(level);
  const page=doc.documentElement;
  listen(page,'pointerdown',event=>{if(!level.info.contains(event.target)&&!level.hint.contains(event.target))closeHint();},true,bubble.disposers);
  // Inside the selector its own keydown handles Escape; elsewhere (a button a pointer did not focus) it only closes.
  listen(page,'keydown',event=>{if(event.key==='Escape'&&!root.contains(event.target))closeHint();},undefined,bubble.disposers);
 }
 function closeHint(){
  if(!bubble)return;
  const {level,disposers}=bubble;bubble=null;disposers.splice(0).forEach(dispose=>dispose());
  level.info.setAttribute('aria-expanded','false');flag(level.hint,'open',false);
 }
 // The bubble never covers the fixed « Valider » button (26 Oct 2026, §P, « À côté si possible »): where the band leaves it
 // room at its own width, it stands beside the info button towards the screen's edge (the right, the left in RTL), centred
 // on the button's height and inside the foot; elsewhere (phones) above the « Valider » button, over the lower part of the
 // centre item, centred on it. Always inside the band (the foot's width), so clear of the scope bar, the search capsule,
 // the dock and the viewport's edges. Measured when it opens and on every re-layout (resize, fonts, language) while open,
 // never during a glide (the « Valider » button never moves).
 function placeHint(level){
  const foot=level.foot.getBoundingClientRect?.(),button=level.info.getBoundingClientRect?.(),box=level.hint.getBoundingClientRect?.(),mark=go.getBoundingClientRect?.();
  if(!foot||!button||!box||!mark)return;
  const width=Math.min(box.width,foot.width),height=box.height,room=rtl()?button.left-foot.left:foot.right-button.right;
  // Whole pixels (crisp text), rounded away from the button the bubble stands clear of.
  let left,bottom;
  if(width<=room-HINT_GAP-1){
   left=rtl()?Math.floor(button.left-HINT_GAP-width-foot.left):Math.ceil(button.right+HINT_GAP-foot.left);
   bottom=clamp(Math.round(foot.bottom-button.top-button.height/2-height/2),0,Math.max(0,Math.floor(foot.height-height)));
  }else{
   left=clamp(Math.round(mark.left+mark.width/2-width/2-foot.left),0,Math.max(0,Math.floor(foot.width-width)));
   bottom=Math.ceil(foot.bottom-mark.top+HINT_GAP);
  }
  level.hint.style.setProperty('--hint-left',px(left));level.hint.style.setProperty('--hint-bottom',px(bottom));
 }
 // Internal move: returns whether the cursor changed (drives moveBy, the wheel and the drag snap-back). The cursor itself
 // (tabindex, names, focus) moves at once; the row glides along the horizon (§L), the compact row by its transitions, or
 // jumps without motion. During a drag along the horizon the row stays under the pointer: its release decides where it
 // glides (§C). `from`: where the row stands when a drag releases it.
 function moveCursor(id,{focus=false,animate=false,from}={}){
  const level=current;if(level?.kind!=='level')return false;
  const items=level.view.items,index=items.findIndex(item=>item.id===id);if(index<0)return false;
  const was=indexOf(level),changed=id!==cursorId;cursorId=id;level.cursorId=id;
  paintLevel(level);
  if(!(gesture?.level===level&&gesture.dragging&&!gesture.rigid)){
   if(!animate||reduced())layoutLevel(level,'jump');
   else if(!level.g||level.g.compact)layoutLevel(level,'glide');
   else slide(level,index,from??was);
  }
  if(focus)focusNode(level.nodes.get(keyOf(items[index])).button);
  return changed;
 }
 /* ---- Glides along the horizon (26 Oct 2026, refinements §L) ----------------------------------------------------------- */
 // Outside the compact row a cursor move is a glide (glideTo, glideAt): every frame lays the row out for its fractional
 // cursor, as a drag does, so every item stands on the horizon at its distance's size at any speed. A move while the row
 // still glides only moves its target; a held key's repeats retarget it, its speed never jumps. Its looks follow the
 // nearest rank with the drag's fades (data-sliding, kept .35 s after its end); no layout is read during it. An instant
 // layout or a jump ends it at once on its own layout (stopSlide), a drag takes it over where it stands, a level change
 // leaves it where it was painted (leave). The « Valider » button stays where it is, shown, at any speed (§P).
 function slide(level,index,from){
  const motion=level.slide,glide=glideTo(motion?.glide??null,{from,to:index,at:now()});
  if(!glide)return layoutLevel(level,'jump');
  stopGlide(level);stopFades(level);flag(level.element,'sliding',true);
  if(motion){motion.glide=glide;return;}
  level.slide={glide,pending:false,frames:0};
  nextSlide(level);
 }
 function nextSlide(level){
  const motion=level.slide;if(!motion||motion.pending)return;
  motion.pending=true;frame(time=>slideFrame(level,motion,time));
 }
 function slideFrame(level,motion,time){
  motion.pending=false;
  if(destroyed||level.slide!==motion||!level.g)return;
  const at=glideAt(motion.glide,Number.isFinite(time)?time:now());
  if(at.done){level.slide=null;return layoutLevel(level,'rest');}
  follow(level,at.cursor,!motion.frames++);
  nextSlide(level);
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
 // The compact row's drag moves its layer rigidly: on release the layer's offset is folded into each item's --x in one
 // frame, then the new layout glides (§4.15).
 function fold(level,dx){
  level.nodes.forEach(node=>{flag(node.button,'gliding',false);const x=Number.parseFloat(node.button.style.getPropertyValue('--x'))||0;node.button.style.setProperty('--x',px(x+dx));});
  level.items.style.removeProperty('transform');
  void level.element.offsetWidth;
 }
 // The fractional cursor of a drag whose pointer moved by dx (§C): c = start − dx·mirror / pitch, from where the row
 // stood when the drag began (§L: the glide it took over, or the cursor).
 function dragCursor(level,drag,dx){const pitch=pitchOf(level);return pitch?drag.from-(dx-drag.x0)*(rtl()?-1:1)/pitch:drag.from;}
 // Elsewhere every item follows the horizon (§C): one write per animation frame, the continuous layout at that cursor
 // (kept as drag.c, where the row was last drawn).
 function dragFrame(level,drag){
  drag.pending=false;
  if(destroyed||gesture!==drag||current!==level||!level.g||!pitchOf(level))return;
  stopGlide(level);
  drag.c=dragCursor(level,drag,drag.dx);follow(level,drag.c,!drag.frames++);
 }
 // The end of a drag whose row was last drawn at the fractional cursor c (a frame still pending is dropped): the cursor
 // moves to `target` (none: it stays) and the row glides there. The compact row folds its layer first, as before.
 // Elsewhere the row glides on along the horizon from c (§L): the glide takes over the drag's own styles (it writes them
 // again from its first frame) and its fades (data-sliding comes before data-dragging goes), so a style flush in between
 // (Chrome flushes when the focused item's tabindex changes) still sees the items and their fades where the drag left
 // them. Without motion the release jumps, the drag's styles gone.
 function release(level,drag,target,c){
  if(drag.rigid){delete level.element.dataset.dragging;fold(level,drag.dx);}
  const along=!drag.rigid&&!reduced();
  if(target&&target.id!==cursorId)moveCursor(target.id,{animate:true,focus:itemFocused(level),from:along?c:undefined});
  else if(along)slide(level,indexOf(level),c);
  else layoutLevel(level,reduced()?'jump':'glide');
  if(!drag.rigid)delete level.element.dataset.dragging;
 }
 function bindCarousel(level){
  const {carousel,disposers:bucket}=level,own=event=>gesture?.level===level&&event.pointerId===gesture.pointerId;
  listen(carousel,'pointerdown',event=>{
   if(current!==level||event.isPrimary===false||event.button!==0)return;
   gesture={level,pointerId:event.pointerId,x:event.clientX,y:event.clientY,cursorId,dragging:false,dx:0,from:0,x0:0,c:0,rigid:false,pending:false,frames:0};
  },undefined,bucket);
  listen(carousel,'pointermove',event=>{
   if(!own(event))return;
   const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
   if(!gesture.dragging){
    if(Math.abs(dy)>=DRAG_PX&&Math.abs(dy)>=Math.abs(dx)){gesture=null;return;}
    if(Math.abs(dx)<DRAG_PX||Math.abs(dx)<=Math.abs(dy))return;
    gesture.dragging=true;gesture.rigid=Boolean(level.g?.compact);carousel.setPointerCapture?.(event.pointerId);level.element.dataset.dragging='true';
    stopGlide(level);level.nodes.forEach(node=>flag(node.button,'gliding',false));
    // A glide along the horizon still moving is taken over where it stands (§L): the drag starts from its fractional
    // cursor and the pointer's moves from here on carry the row. At rest it starts from the cursor (§C).
    const at=level.slide?glideAt(level.slide.glide,now()):null;
    if(at&&!at.done){gesture.from=at.cursor;gesture.x0=dx;}else gesture.from=indexOf(level);
    gesture.c=gesture.from;stopSlide(level);
   }
   // The items follow the finger; the horizon and the pool stay.
   gesture.dx=dx;
   if(gesture.rigid)level.items.style.setProperty('transform',`translateX(${round(dx)}px)`);
   else if(!gesture.pending){const drag=gesture;drag.pending=true;frame(()=>dragFrame(level,drag));}
  },undefined,bucket);
  listen(carousel,'pointerup',event=>{
   if(!own(event))return;
   const drag=gesture;gesture=null;if(!drag.dragging)return;
   armSwallow();
   // The item nearest to the pointer, clamped to the list (§C).
   const items=level.view.items;
   release(level,drag,items[clamp(Math.round(dragCursor(level,drag,event.clientX-drag.x)),0,items.length-1)],drag.c);
  },undefined,bucket);
  const cancel=event=>{
   if(!own(event))return;
   const drag=gesture;gesture=null;if(drag.dragging)release(level,drag,null,drag.c);
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
 // Into and out of the campus screen the whole views move: the sheet replaces the selector's head, carousel and foot.
 function generic(previous,built,direction){
  const ascend=direction==='ascend';
  play(previous.element,[{opacity:1,transform:'none'},{opacity:0,transform:ascend?'translateY(18px) scale(.97)':'translateY(-18px) scale(1.03)'}],{duration:260},()=>drop(previous));
  play(built.element,[{opacity:0,transform:`translateY(${ascend?-22:22}px)`},{opacity:1,transform:'none'}],{duration:420,delay:80,fill:'backwards'});
  if(built.kind==='campus')guardEntrance(built,500);
 }
 // Level to level (25 Oct 2026, refinements §D): only what changes animates. Each level keeps its own head, carousel
 // and foot, so IDs, ARIA and listeners stay per level, and the parts are swapped in place, the outgoing level frozen
 // at its box (R21). A part the incoming level shows unchanged at the same place (the hint; the horizon, one line at
 // every level of a band since §I, though on phones the track's edge fade still follows each level's cursor button
 // (§4.19), so the line's faint ends may change slightly there; the pool, L1 ↔ L2) is hidden at once in the outgoing
 // level: it stands still. A part that changes (the pager's dots and count; the pool, of each level's own width,
 // L2 ↔ L3) crossfades in place, both copies over the same 0.26 s, so their opacities add up to 1 (where the two copies
 // overlap, the light still dips a little mid-way, as in any crossfade of two layers). The prompt is no longer shown
 // (26 Oct 2026, refinements §V, « Juste les points centrés »: visually hidden, it still labels the carousel), so it does
 // not fade, and the steps, centred alone, stand at the same place at every level: they glide from the outgoing steps'
 // box only when a band that moved between the views put them elsewhere (by half a pixel or more), and their dots ease
 // from the outgoing looks. The info button (§H) is never faded: it stands still, or, when the row's other parts moved
 // it (a different number of dots), glides from the outgoing button's box like the steps. The items keep the levels'
 // motion, written as translate and scale so that a drag's own transform of the layer (the compact row's) composes with
 // it. The compact row, its head and foot visually hidden, animates its items only.
 function handover(previous,built,direction){
  const ascend=direction==='ascend',compact=Boolean(built.g?.compact),parts=compact?[]:['dots','count','hint','horizon','pool'];
  const box=node=>{const r=node.getBoundingClientRect?.();return r?[r.left,r.top,r.width,r.height]:[0,0,0,0];};
  const look={count:level=>level.count.textContent,hint:level=>`${level.keys.hidden} ${level.hint.textContent}`,
   dots:level=>[level.dots.hidden,'dense' in level.dots.dataset,level.dots.children.length,level.dots.style.getPropertyValue('--dot')].join(),
   horizon:level=>`${level.horizon.getAttribute('viewBox')} ${level.linePath.getAttribute('d')}`,pool:level=>['left','top','width'].map(name=>level.pool.style[name]).join()};
  // Everything is read first (the boxes, the outgoing dots' looks), then written.
  const still=new Set(parts.filter(name=>{const a=box(previous[name]),b=box(built[name]);return look[name](previous)===look[name](built)&&a.every((value,index)=>Math.abs(value-b[index])<.5);}));
  const moves=compact?[]:[[built.stepRow,box(previous.stepRow),box(built.stepRow)],[built.info,box(previous.info),box(built.info)]];
  const eases=compact?[]:built.steps.map((dot,index)=>{
   const was=previous.steps[index],style=was.dataset.state===dot.dataset.state?null:view.getComputedStyle?.(was);
   return style?.backgroundColor?[dot,{backgroundColor:style.backgroundColor,width:style.width,height:style.height,boxShadow:style.boxShadow}]:null;
  }).filter(Boolean);
  const out=(node,keyframes,end)=>play(node,keyframes,{duration:260,fill:'forwards'},end);
  if(!compact)for(const node of [previous.stepRow,previous.info])node.style.visibility='hidden';
  for(const name of parts){
   if(still.has(name)){previous[name].style.visibility='hidden';continue;}
   out(previous[name],[{opacity:1},{opacity:0}]);play(built[name],[{opacity:0},{opacity:1}],{duration:260});
  }
  out(previous.items,[{opacity:1,translate:'0 0',scale:'1'},{opacity:0,translate:`0 ${ascend?18:-18}px`,scale:ascend?'.97':'1.03'}],()=>drop(previous));
  play(built.items,[{opacity:0,translate:`0 ${ascend?-22:22}px`},{opacity:1,translate:'0 0'}],{duration:420,delay:80,fill:'backwards'});
  for(const [node,from,to]of moves){
   const dx=from[0]-to[0],dy=from[1]-to[1];
   if(Math.abs(dx)>=.5||Math.abs(dy)>=.5)play(node,[{transform:`translate(${round(dx)}px,${round(dy)}px)`},{transform:'none'}],{duration:420});
  }
  // The current step's marker passes to its new dot as the colours ease in place (to each dot's own, live, style).
  eases.forEach(([dot,keyframe])=>play(dot,[keyframe,{}],{duration:300}));
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
  // Two levels of one density swap their parts; a band that changed density between them moves the whole views.
  if(previous.kind==='level'&&built.kind==='level'&&previous.element.dataset.density===built.element.dataset.density)return handover(previous,built,direction);
  generic(previous,built,direction);
 }

 function show(next,{direction='none',focus=false}={}){
  if(destroyed||!next)return;
  const active=doc.activeElement,inside=Boolean(active&&root.contains(active));
  // A new view, or the Explorer left (the controller makes the stage inert, then shows the same view), closes the key
  // hints' bubble (§H); a language change keeps it open.
  if(root.inert||current?.key!==next.key)closeHint();
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
 /** The entrance's arrival (26 Oct 2026, refinements §R): the current level's row comes in from off screen, from its
  * reading start (the left; the right in RTL), and stops on its first item in `duration` ms (« arrêt sur l'Asie » in
  * Arabic: the cursor first goes to that item, as a move without motion, the focus with it if an item had it; ARIA
  * follows). Outside the compact row it is a glide along the horizon (§L) from a cursor past every item's ±2 slot (all
  * « out »), so every item comes in standing on the line at its distance's size; the compact row, which has no horizon,
  * slides in straight, its layer moved as by its drag. With it, the level's centre parts (the step dots, the pager row,
  * the fixed « Valider » of §P) come in with a short fade and rise. All of it waits `delay` ms first (the entrance's 42
  * lands meanwhile), hidden from now on: the row off screen, the parts at their start. The horizon (its line and glow) and
  * the pool fade in at once over `handover` ms, as the entrance's arc drawn on this very line fades out. A later move,
  * drag, layout or view takes over as from any glide. False, and nothing moves, under reduced motion, during a drag or
  * without a level. */
 function arrive({duration=SLIDE_MS,delay=0,handover=0}={}){
  const level=current,items=level?.kind==='level'?level.view.items:[];
  if(destroyed||!items.length||!level.g||!level.lay||reduced()||gesture?.dragging)return false;
  if(cursorId!==items[0].id)moveCursor(items[0].id,{focus:itemFocused(level)});
  stopGlide(level);
  if(level.g.compact){
   // Its last item's far edge (the measured widths, §3.5) starts off screen.
   const mirror=rtl()?-1:1,reach=Math.max(...items.map((item,index)=>{const x=level.lay.items[index].x,half=(Number(level.nodes.get(keyOf(item)).width)||0)/2;return mirror>0?x+half:level.g.W-x+half;}));
   play(level.items,[{transform:`translateX(${round(-mirror*reach)}px)`},{transform:'none'}],{duration,delay,fill:'backwards'});
   return true;
  }
  if(handover>0)for(const node of [level.horizon,level.pool])play(node,[{opacity:0},{}],{duration:handover,easing:'linear'});
  for(const node of [level.stepRow,level.dots.parentNode,go])play(node,[{opacity:0,translate:`0 ${ARRIVE_RISE}px`},{}],{duration:ARRIVE_PARTS_MS,delay:delay+ARRIVE_PARTS_DELAY,fill:'backwards'});
  // A glide that starts after the delay: until then glideAt keeps the row where it starts.
  const from=items.length+2,glide=glideTo(null,{from,to:indexOf(level),at:now()+delay,duration});
  stopSlide(level);
  // Its first frame at once, the looks without fades, so the row at rest never shows.
  level.element.dataset.instant='';follow(level,from,true);void level.element.offsetWidth;
  frame(()=>{if(!destroyed&&level.element.dataset)delete level.element.dataset.instant;});
  flag(level.element,'sliding',true);level.slide={glide,pending:false,frames:1};nextSlide(level);
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
 // A press on the fixed « Valider » (§P) leaves the focus as a press on the cursor's own chip did: where it is when the
 // cursor item has it (its ring, if any, stays); otherwise the stage the browser focuses for the press hands it over to
 // the cursor item, which then shows no ring, as an item a pointer focused. A validation then hands the focus to the next
 // view (show); a swallowed click, or a drag, leaves it on the cursor item.
 let pressing=false;
 listen(go,'mousedown',event=>{
  const node=current?.kind==='level'?nodeOf(current,cursorId):null;if(!node)return;
  if(doc.activeElement===node.button){event.preventDefault();return;}
  pressing=true;view.setTimeout?.(()=>{pressing=false;},0);
 });
 listen(root,'focusin',event=>{
  if(!pressing)return;pressing=false;
  const node=current?.kind==='level'?nodeOf(current,cursorId):null;
  if(event.target===root&&node)focusNode(node.button);
 });
 // The item under the pointer, for the « Valider » button's hover shadow (hoverGo; every layout checks its rank again).
 listen(root,'pointerover',event=>{hovered=event.target?.closest?.('[data-explorer-card]')||null;hoverGo();});
 listen(root,'pointerleave',()=>{hovered=null;hoverGo();});
 listen(root,'click',event=>{
  if(!(event.detail>0))return;
  const outgoing=[...leaving].some(record=>record.element.contains(event.target));
  if(outgoing||now()-changedAt<SETTLE_MS){event.preventDefault();event.stopPropagation();}
 },true);
 listen(root,'click',event=>{
  const target=event.target;if(!current||!current.element.contains(target))return;
  if(current.kind==='level'){
   if(target.closest?.('.explorer-info'))return bubble?closeHint():openHint(current);
   // The fixed « Valider » (§P) validates the cursor, during a glide its target, as Enter does; not twice in a double click.
   if(go.contains(target)){const item=current.view.items.find(entry=>entry.id===cursorId);if(item&&!(event.detail>1))onValidate({kind:item.kind,id:item.id});return;}
   const card=target.closest?.('[data-explorer-card]');if(card)activateItem(card,event);
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
  // Escape closes the key hints' bubble, and only that: no level is ascended (§H).
  if(event.key==='Escape'&&bubble){event.preventDefault();closeHint();return;}
  if(event.key==='Escape'||event.key==='Backspace'){
   // A held key ascends once (H2f): its auto-repeats are swallowed.
   if((current.view.depth??1)>1){event.preventDefault();if(!event.repeat)onAscend();}
   return;
  }
  if(current.kind!=='level')return;
  // The info button toggles on its native activation; a held key toggles it once.
  if(target?.closest?.('.explorer-info')){if((event.key==='Enter'||event.key===' ')&&event.repeat)event.preventDefault();return;}
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
  if(current?.kind!=='level')return;
  stopGlide(current);current.nodes.forEach(node=>flag(node.button,'gliding',false));
  // A glide along the horizon jumps to its end (§L).
  if(current.slide||'sliding' in current.element.dataset)layoutLevel(current,'jump');
 });
 if(coarse?.addEventListener)listen(coarse,'change',()=>{if(current?.kind!=='level')return;paintHint(current,t());if(bubble?.level===current)placeHint(current);});
 doc.fonts?.ready?.then?.(()=>{
  if(destroyed)return;
  if(current?.kind==='level')relayout(current);
  if(current?.kind==='campus')updateFades(current);
 },()=>{});

 function destroy(){
  if(destroyed)return;
  settle();closeHint();destroyed=true;disarmSwallow();view.clearTimeout?.(wheel.timer);
  if(current){
   if(current.kind==='campus'){current.handle?.destroy?.();current.handle=null;endEntering(current);}else{stopGlide(current);stopFades(current);current.slide=null;}
   current.element.remove();current.disposers.splice(0).forEach(dispose=>dispose());current=null;
  }
  observer?.disconnect();disposers.splice(0).forEach(dispose=>dispose());
  for(const pending of [...frames])pending.cancel();frames.clear();
  if(ownTitle)title.remove();
 }
 return {show,focus:focusTarget,localize,destroy,hasView:()=>Boolean(current),setCursor,arrive};
}
