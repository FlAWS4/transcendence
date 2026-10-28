import {mount} from './decryption/scanner-return-random.mjs';
import {model} from './decryption/shared.mjs';

// The selected n°22 renderer uses a 6.8s timeline. Its two scanner passes
// precede this boundary; only the final character resolution requires sign-in.
const SCAN_END=model.durationMs*3650/6800;
// A busy startup frame must not consume an unseen part of either scan pass.
const MAX_SCAN_FRAME_MS=64;
const LANGUAGE_INTERVAL_MS=4000;
const ENTRY_LANGUAGES=['fr','en','ar'];
const NAVIGATION_KEYS=['Tab','Enter',' '];
// Version B draws an arc where the Explorer's horizon line stands (25 Oct 2026 refinements, §E), from its centre outwards
// with the former ring's easing. Then the page arrives (26 Oct 2026, §R): the 42 flies onto the header's in FLIGHT_MS
// while the real line takes over from the drawn arc in ARC_HANDOVER_MS; once it has landed, the rest arrives in ARRIVE_MS
// (the continents' glide along the line, the longest).
const ARC_MS=800,FLIGHT_MS=1000,ARRIVE_MS=1200,ARC_HANDOVER_MS=400,ARC_EASE='cubic-bezier(.22,1,.36,1)',FLIGHT_EASE='cubic-bezier(.33,0,.67,1)';
// « Placer le 42 plus haut » (26 Oct 2026, §U): where the arc would pass less than LIFT_CLEAR px under the centred 42 (the
// short bands, whose line could not come down enough), the 42 shows higher, the arc LIFT_UNDER px under its bottom edge as
// on the other bands, its top never above the header's 42; it glides up there in LIFT_MS when the horizon comes after it.
const LIFT_CLEAR=20,LIFT_UNDER=40,LIFT_MS=600;
// « Chacun depuis son bord » (§R): the page's other parts come in from their own edge once the 42 has landed, each with a
// short slide and a fade, slightly staggered: [selector, edge, delay in ms after the landing]. The dock, and the buttons
// after it, come in from its side when it stands upright on one (§W's rail).
const EDGE_MS=500,EDGE_SLIDE=18,EDGES=[['.header .utilities','top',0],['#scope-bar','top',60],['#main-nav','bottom',120],['.dock-search-toggle','bottom',200],['.dock-random-toggle','bottom',260]];
const NUMBER=/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const fixed=value=>Math.round(value*100)/100;
// The flying 42's scale keeps the landing within a hundredth of a pixel on its 128 px.
const scaled=value=>Math.round(value*1e6)/1e6;
const interactionCopy={
 fr:{light:'Passer au mode clair',dark:'Passer au mode sombre',languages:'Les langues alternent automatiquement. Le survol ou le focus des boutons suspend le changement.'},
 en:{light:'Switch to light mode',dark:'Switch to dark mode',languages:'Languages rotate automatically. Hovering or focusing the buttons pauses the changes.'},
 ar:{light:'التبديل إلى الوضع الفاتح',dark:'التبديل إلى الوضع الداكن',languages:'تتبدل اللغات تلقائياً. يتوقف التبديل عند تمرير المؤشر على الأزرار أو التركيز عليها.'},
};

const copy={
 fr:{login:'Se connecter',guest:'Visiter',encrypted:'Message chiffré',decoding:'Déchiffrement en cours',title:'Connexion — prototype',description:'Cette maquette simule la connexion. Aucune authentification réelle n’est effectuée.',confirm:'Simuler une connexion réussie',cancel:'Annuler',waiting:'Le monde se prépare…',error:'Le monde n’a pas pu se préparer.',retry:'Réessayer',back:'Revenir au message',continue:'Continuer quand même'},
 en:{login:'Sign in',guest:'Visit',encrypted:'Encrypted message',decoding:'Decrypting',title:'Sign in — prototype',description:'This preview simulates sign-in. No real authentication takes place.',confirm:'Simulate a successful sign-in',cancel:'Cancel',waiting:'Getting the world ready…',error:'The world could not be prepared.',retry:'Try again',back:'Back to the message',continue:'Continue anyway'},
 ar:{login:'تسجيل الدخول',guest:'زيارة',encrypted:'رسالة مشفرة',decoding:'جارٍ فك التشفير',title:'تسجيل الدخول — نموذج أولي',description:'يحاكي هذا النموذج تسجيل الدخول. لا يتم إجراء مصادقة حقيقية.',confirm:'محاكاة تسجيل دخول ناجح',cancel:'إلغاء',waiting:'نجهّز العالم…',error:'تعذّر تجهيز العالم.',retry:'إعادة المحاولة',back:'العودة إلى الرسالة',continue:'المتابعة على أي حال'},
};
const signupCopy={
 fr:{title:'Création de compte simulée',description:'Cet aperçu simule la création de compte avec le profil fictif de Leïla Mansour. Aucun compte réel n’est créé.',confirm:'Simuler la création du compte'},
 en:{title:'Simulated account creation',description:'This preview simulates account creation using Leïla Mansour’s fictional profile. No real account is created.',confirm:'Simulate account creation'},
 ar:{title:'إنشاء حساب تجريبي',description:'يحاكي هذا النموذج إنشاء حساب باستخدام الملف الخيالي لليلى منصور. لا يتم إنشاء أي حساب حقيقي.',confirm:'محاكاة إنشاء حساب'},
};

// A compact row draws no horizon: a gentle arc of a circle through the band's vertical centre stands in for it, over the
// horizon's extent (40 px past each side) and dropping 3 % of the width (8 to 24 px) at its ends.
function gentleArc(width,y){
 const half=width/2+40,sag=Math.max(8,Math.min(24,width*.03)),radius=(half*half+sag*sag)/(2*sag);
 return Array.from({length:65},(_,index)=>{const x=-half+2*half*index/64;return [width/2+x,y+radius-Math.sqrt(radius*radius-x*x)];});
}

// The arc's highest point between left and right (its polyline cut there); none (Infinity) outside its extent.
function arcTop(points,left,right){
 let top=Infinity;
 for(let index=1;index<points.length;index++){
  const [x0,y0]=points[index-1],[x1,y1]=points[index],from=Math.max(left,Math.min(x0,x1)),to=Math.min(right,Math.max(x0,x1));
  if(from<=to)for(const x of [from,to])top=Math.min(top,x1===x0?Math.min(y0,y1):y0+(y1-y0)*(x-x0)/(x1-x0));
 }
 return top;
}

// Pages opt into the rotating access labels; older compositions sharing this
// module keep plain labels in the site language, as before the rotation.
// `landing`: the header's 42, where the entrance's 42 lands as the page arrives (§R); onLand(mode) then tells the page
// that it has landed there (the page shows its own 42 from then on and brings its name in), before onOpen(mode).
export function mountEntrance({getLocale,cycleLabels=false,getTheme=()=>document.documentElement.dataset.theme,onToggleTheme=()=>{},openDialog,closeDialog,prepare,stage=document.getElementById('explorer'),landing=document.querySelector?.('.brand img')??null,onFocusStage=()=>stage.focus({preventScroll:true}),onReveal=()=>{},onLand=()=>{},onOpen,onEvent=()=>{}}){
 const entrance=document.getElementById('entrance'),scene=document.getElementById('entrance-scene');
 const access=document.getElementById('entrance-access'),status=document.getElementById('entrance-status');
 const themeToggle=document.getElementById('entry-theme-toggle'),dialog=document.getElementById('dialog');
 const symbol=document.getElementById('entrance-symbol');
 // The arc lies over the entrance's background and under the 42.
 const arc=document.getElementById('entrance-arc'),arcLine=arc.querySelector('path');
 const main=document.getElementById('main');main.inert=true;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const renderer=mount({root:scene,model});
 let phase='encrypted',elapsed=0,last=null,frame=0,sequence=0,paused=false,identity='visitor',pendingDecryption=false,morph=null;
 let visualReady=false,scanStarted=false;
 // Until a pointer is used, focus is assumed to come from a keyboard or an assistive technology.
 let languageTimer=0,languageLocked=false,accessHovered=false,keyboardFocus=true;
 let siteLocale=getLocale(),displayLocale=siteLocale;
 const interactionEvents=cycleLabels||themeToggle?new AbortController():null,labelMotions=new Map();
 const animations=new Set();
 // How far the 42 stands above the centre (§U), in px.
 let lift=0;
 const t=key=>copy[getLocale()][key];
 const choosing=()=>!languageLocked&&!pendingDecryption&&(phase==='scanning'||phase==='encrypted');
 function canCycleLanguage(){
  const active=document.activeElement;
  // Only keyboard focus holds the labels: a closing dialog returns focus to its
  // opener after a pointer action too, which must not stop the rotation.
  return cycleLabels&&choosing()&&!document.hidden&&!dialog?.open&&!accessHovered&&!((access.contains(active)||active===themeToggle)&&keyboardFocus);
 }
 function syncLanguageCycle(restart=false){
  if(languageTimer&&(restart||!canCycleLanguage())){clearTimeout(languageTimer);languageTimer=0;}
  if(!canCycleLanguage()){settleLabels();return;}
  if(languageTimer)return;
  languageTimer=setTimeout(()=>{
   languageTimer=0;
   if(canCycleLanguage()){
    displayLocale=ENTRY_LANGUAGES[(ENTRY_LANGUAGES.indexOf(displayLocale)+1)%ENTRY_LANGUAGES.length];
    refreshLabels(true);
   }
   syncLanguageCycle();
  },LANGUAGE_INTERVAL_MS);
 }
 function settleLabels(){
  for(const {incoming,outgoing,oldLabel}of labelMotions.values()){incoming.cancel();outgoing.cancel();oldLabel.remove();}
  labelMotions.clear();
 }
 function labelSpan(key,locale,className){
  const span=document.createElement('span');span.className=className;span.textContent=copy[locale][key];span.setAttribute('lang',locale);span.setAttribute('dir',locale==='ar'?'rtl':'ltr');return span;
 }
 function prepareLabel(button,key){
  const slot=document.createElement('span');slot.className='entrance-action-labels';
  for(const locale of ENTRY_LANGUAGES){const measure=labelSpan(key,locale,'entrance-action-measure');measure.setAttribute('aria-hidden','true');slot.append(measure);}
  slot.append(labelSpan(key,displayLocale,'entrance-action-label'));button.replaceChildren(slot);
 }
 function refreshLabels(moving=false){
  settleLabels();
  for(const [id,key]of [['entry-login','login'],['entry-guest','guest']]){
   const button=document.getElementById(id),label=button?.querySelector('.entrance-action-label');if(!label)continue;
   if(moving&&!reduced.matches){
    const oldLabel=labelSpan(key,button.getAttribute('lang')||displayLocale,'entrance-action-label entrance-action-label-outgoing');oldLabel.setAttribute('aria-hidden','true');label.parentElement.append(oldLabel);
    const incoming=label.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
    const outgoing=oldLabel.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:220,easing:'ease-out',fill:'forwards'});
    const motion={incoming,outgoing,oldLabel};labelMotions.set(button,motion);
    incoming.finished.then(()=>{oldLabel.remove();outgoing.cancel();if(labelMotions.get(button)===motion)labelMotions.delete(button);},()=>{});
   }
   label.textContent=copy[displayLocale][key];label.setAttribute('lang',displayLocale);label.setAttribute('dir',displayLocale==='ar'?'rtl':'ltr');
   button.setAttribute('lang',displayLocale);button.setAttribute('aria-description',interactionCopy[displayLocale].languages);
  }
 }
 function refreshThemeToggle(){
  if(!themeToggle)return;
  themeToggle.hidden=!choosing();
  themeToggle.setAttribute('aria-label',interactionCopy[getLocale()][getTheme()==='dark'?'light':'dark']);
  themeToggle.setAttribute('lang',getLocale());
 }
 function lockLanguage(){languageLocked=true;syncLanguageCycle();refreshThemeToggle();}
 function setPhase(next){phase=next;document.body.dataset.entry=next;refreshThemeToggle();syncLanguageCycle();onEvent({entry:next});}
 function action(label,handler,secondary=false){
  const button=document.createElement('button');button.type='button';button.className=`entrance-action${secondary?' secondary':''}`;button.textContent=label;button.addEventListener('click',handler);return button;
 }
 function refresh(){
  if(phase==='welcome')return;
  if(phase==='arriving'||phase==='landed')morph?.finish();
  entrance.setAttribute('aria-label',{fr:'Entrée',en:'Entrance',ar:'الدخول'}[getLocale()]);
  // Hold just before the renderer's decrypting phase, with every cipher glyph
  // intact. A confirmed connection resumes at the exact boundary.
  renderer.render(phase==='encrypted'?Math.min(elapsed,SCAN_END-.001):elapsed);
  scene.setAttribute('aria-label',phase==='decrypting'?t('decoding'):elapsed===model.durationMs?model.PHRASE:t('encrypted'));
  if(phase==='encrypted'||phase==='scanning'){
   if(cycleLabels){
    if(siteLocale!==getLocale()){siteLocale=getLocale();displayLocale=siteLocale;}
    refreshLabels();
   }else for(const [id,key] of [['entry-login','login'],['entry-guest','guest']]){
    const button=document.getElementById(id);button.textContent=t(key);button.setAttribute('lang',getLocale());
   }
  }
  if(phase==='waiting')status.textContent=t('waiting');
  if(phase==='error'){status.textContent=t('error');access.replaceChildren(action(t('retry'),()=>enter(identity)),action(t('back'),reset,true),action(t('continue'),()=>{onEvent({explorerUnavailable:true});openWelcome(identity);},true));}
  refreshThemeToggle();syncLanguageCycle();
 }
 function reset(){
  settleLabels();
  sequence++;cancelAnimationFrame(frame);for(const animation of animations)animation.cancel();animations.clear();
  // Returning after a map error keeps the scan already played; it never
  // repeats the two passes after a successful sign-in.
  elapsed=reduced.matches?SCAN_END:Math.min(elapsed,SCAN_END);pendingDecryption=false;languageLocked=false;
  symbol.hidden=true;raise(0);scene.hidden=false;status.hidden=true;access.hidden=false;arc.hidden=true;arc.style.clipPath='';
  entrance.style.background='';setPhase(elapsed<SCAN_END?'scanning':'encrypted');
  const login=action(t('login'),loginDialog),guest=action(t('guest'),()=>enter('visitor'),true);
  login.id='entry-login';guest.id='entry-guest';if(cycleLabels){prepareLabel(login,'login');prepareLabel(guest,'guest');}access.replaceChildren(login,guest);refresh();
  resumePlayback();
 }
 function resumePlayback(){
  cancelAnimationFrame(frame);frame=0;last=null;paused=document.hidden;
  if(!paused&&(phase==='decrypting'||(phase==='scanning'&&visualReady)))frame=requestAnimationFrame(tick);
 }
 function openWelcome(mode){
  sequence++;cancelAnimationFrame(frame);pendingDecryption=false;
  status.hidden=true;access.hidden=true;symbol.hidden=true;
  setPhase('welcome');main.inert=false;onOpen(mode);
  entrance.hidden=true;renderer.destroy();interactionEvents?.abort();
  onFocusStage();
 }
 async function animate(element,keyframes,options){
  if(reduced.matches)return;
  const animation=element.animate(keyframes,options);animations.add(animation);
  try{await animation.finished;}catch{}finally{animation.cancel();animations.delete(animation);}
 }
 // The horizon line of the Explorer's current level, in the entrance's px: the selector draws it as an absolute polyline
 // (« M x y L x y … ») in its track's units, mapped here through the line's screen matrix. Without a displayed line (the
 // compact row) the band's gentle arc stands in; without any horizon (no view yet) there is nothing to draw: null.
 function horizon(){
  const lines=[...(stage.querySelectorAll?.('.explorer-horizon-line')||[])].reverse();
  if(!lines.length)return null;
  const view=entrance.getBoundingClientRect();
  for(const line of lines){
   const matrix=line.getBoundingClientRect().width?line.getScreenCTM?.():null,local=matrix&&linePoints(line);
   if(local)return {points:local.map(([x,y])=>[matrix.a*x+matrix.c*y+matrix.e-view.left,matrix.b*x+matrix.d*y+matrix.f-view.top]),width:view.width,height:view.height,band:false};
  }
  return band(view);
 }
 // Any other path syntax is sampled along its length.
 function linePoints(line){
  const d=line.getAttribute('d')||'',values=/^\s*M[\d\s.,eE+\-L]*$/.test(d)?d.match(NUMBER)||[]:[];
  if(values.length>=4&&values.length%2===0)return Array.from({length:values.length/2},(_,index)=>[+values[2*index],+values[2*index+1]]);
  const length=line.getTotalLength?.();if(!(length>0))return null;
  return Array.from({length:65},(_,index)=>{const point=line.getPointAtLength(length*index/64);return [point.x,point.y];});
 }
 // The compact row stands in the middle of the band, the stage's content box.
 function band(view=entrance.getBoundingClientRect()){
  const box=stage.getBoundingClientRect(),style=getComputedStyle(stage);
  const top=box.top+(parseFloat(style.paddingTop)||0),bottom=box.bottom-(parseFloat(style.paddingBottom)||0);
  return {points:gentleArc(view.width,(top+bottom)/2-view.top),width:view.width,height:view.height,band:true};
 }
 function placeArc(shape){arcLine.setAttribute('d','M'+shape.points.map(([x,y])=>fixed(x)+' '+fixed(y)).join('L'));arc.dataset.shape=shape.band?'band':'horizon';}
 // Drawn from the centre outwards to both edges by a clip that opens symmetrically (the line itself never changes).
 async function drawArc(shape){
  placeArc(shape);
  const xs=shape.points.map(([x])=>x),centre=(Math.min(...xs)+Math.max(...xs))/2,start=fixed(Math.max(0,Math.min(100,centre/shape.width*100)));
  const from=`inset(0% ${fixed(100-start)}% 0% ${start}%)`;
  arc.style.clipPath=from;arc.hidden=false;setPhase('arc');
  onEvent({horizonArc:{centre:fixed(centre),band:shape.band,durationMs:ARC_MS}});
  await animate(arc,[{clipPath:from},{clipPath:'inset(0% 0% 0% 0%)'}],{duration:ARC_MS,easing:ARC_EASE,fill:'forwards'});
  arc.style.clipPath='';
 }
 // §U: the 42's lift for an arc. None while the arc passes at least LIFT_CLEAR px under the 42's bottom edge at rest (its
 // highest point across the 42's width); otherwise the lift that leaves LIFT_UNDER px, the 42's top staying under the
 // header's 42. Read from the 42 at rest (no motion runs on it when this is called).
 function liftFor(shape){
  const box=shape&&symbol.querySelector('img')?.getBoundingClientRect?.();if(!(box?.width>0))return 0;
  const view=entrance.getBoundingClientRect(),gap=arcTop(shape.points,box.left-view.left,box.right-view.left)-(box.bottom-view.top+lift);
  if(!(gap<LIFT_CLEAR))return 0;
  const ceiling=Math.max(0,(landing?.getBoundingClientRect?.()?.bottom??view.top)-view.top);
  return fixed(Math.max(0,Math.min(LIFT_UNDER-gap,box.top-view.top+lift-ceiling)));
 }
 // Composed with the symbol's centring transform.
 function raise(value){lift=value;symbol.style.translate=value?`0px ${-value}px`:'';}
 // The 42 moves to its place for the arc, gliding there from where it shows.
 async function liftTo(value){
  const from=lift;raise(value);
  if(Math.abs(value-from)>.5)await animate(symbol,[{translate:`0px ${-from}px`},{translate:`0px ${-value}px`}],{duration:LIFT_MS,easing:ARC_EASE});
 }
 // §R: the transform that brings the entrance's 42 onto the header's (its centre on the other's, at its width), from both
 // boxes as laid out when the page starts arriving, read once; none without a header 42 to land on.
 function flightOnto(logo){
  const from=logo?.getBoundingClientRect?.(),to=landing?.getBoundingClientRect?.();
  if(!(from?.width>0)||!(to?.width>0))return null;
  return `translate(${fixed(to.left+to.width/2-from.left-from.width/2)}px,${fixed(to.top+to.height/2-from.top-from.height/2)}px) scale(${scaled(to.width/from.width)})`;
 }
 // The page's parts that come in from their edge (EDGES), each with the slide that brings it in from there, read once as
 // the page starts arriving; a part that is not displayed is left out.
 function edgeMoves(){
  const dock=document.querySelector?.('#main-nav')?.getBoundingClientRect?.(),view=entrance.getBoundingClientRect();
  const side=dock&&dock.height>dock.width?(dock.left+dock.width/2<view.left+view.width/2?'left':'right'):null;
  const slide={top:`translate(0px,${-EDGE_SLIDE}px)`,bottom:`translate(0px,${EDGE_SLIDE}px)`,left:`translate(${-EDGE_SLIDE}px,0px)`,right:`translate(${EDGE_SLIDE}px,0px)`};
  return EDGES.map(([selector,edge,delay])=>{
   const element=document.querySelector?.(selector);
   return element?.getClientRects?.().length?[element,slide[edge==='bottom'&&side?side:edge],delay]:null;
  }).filter(Boolean);
 }
 // The page arrives (26 Oct 2026, refinements §R, « Chacun depuis son bord », then no opening from the arc): once the arc
 // is drawn, the entrance's background gives way at once to the page's, the same, and nothing is revealed by a mask; every
 // part comes in by its own motion. First the 42 flies to the header's 42 (top-left; top-right in Arabic, the header being
 // mirrored), shrinking to its size, while the real horizon fades in at the drawn arc's very place as the arc fades out
 // (the page, onReveal; a compact row has no horizon: the arc stays until it fades at the end); nothing else moves before
 // it has landed, the page's other parts waiting hidden. Then the page's own 42 takes over at that place and the page brings
 // its name in (onLand), as its continents slide in along the line and its selector's centre parts fade and rise in (the
 // page, from onReveal's delay on), the header's controls and the scope pill come down from the top, the dock comes up
 // from the bottom (from its side when it stands upright on one) and the search and the dice follow it: a short slide
 // (composed with their own transforms) and a fade (to their own opacity), slightly staggered. Without a header 42, the 42
 // fades out with the drawn arc and the rest comes in after the same time.
 async function arriveFromArc(shape,mode){
  placeArc(shape);
  onReveal(mode,{delay:FLIGHT_MS,duration:ARRIVE_MS,handover:shape.band?0:ARC_HANDOVER_MS});arc.hidden=false;entrance.style.background='transparent';
  setPhase('arriving');onEvent({arrival:{band:shape.band,flightMs:FLIGHT_MS,durationMs:ARRIVE_MS}});
  const logo=symbol.querySelector('img'),onto=flightOnto(logo),edges=edgeMoves();
  if(onto)onEvent({brandFlight:{transform:onto,durationMs:FLIGHT_MS}});
  morph={finish(){for(const animation of [...animations])animation.finish();}};
  const handover={duration:ARC_HANDOVER_MS,easing:'linear',fill:'forwards'};
  const rest=Promise.all([
   shape.band?animate(arc,[{opacity:1},{opacity:1,offset:.85},{opacity:0}],{duration:FLIGHT_MS+ARRIVE_MS,fill:'forwards'}):animate(arc,[{opacity:1},{opacity:0}],handover),
   ...edges.flatMap(([element,slide,delay])=>[
    animate(element,[{opacity:0},{}],{duration:EDGE_MS,delay:FLIGHT_MS+delay,easing:ARC_EASE,fill:'backwards'}),
    animate(element,[{transform:slide},{transform:'translate(0px,0px)'}],{duration:EDGE_MS,delay:FLIGHT_MS+delay,easing:ARC_EASE,fill:'backwards',composite:'add'}),
   ]),
   // The arrival lasts until the continents' glide has ended (the page settles them as it opens).
   animate(entrance,[{opacity:1},{opacity:1}],{duration:FLIGHT_MS+ARRIVE_MS}),
  ]);
  await (onto?animate(logo,[{transform:'none'},{transform:onto}],{duration:FLIGHT_MS,easing:FLIGHT_EASE,fill:'forwards'}):animate(logo,[{opacity:1},{opacity:0}],handover));
  // Landed, in the very frame the page's own 42 shows at that place.
  if(onto&&phase==='arriving'){symbol.hidden=true;setPhase('landed');onLand(mode);}
  await rest;
  morph=null;arc.hidden=true;
 }
 async function enter(mode){
  lockLanguage();
  cancelAnimationFrame(frame);pendingDecryption=false;
  identity=mode;const current=++sequence;access.hidden=true;status.hidden=true;
  // The data/map preparation has already started behind the encrypted screen.
  // Attach a rejection handler immediately while the short logo motion runs.
  const readiness=prepare().then(()=>({ok:true}),error=>({ok:false,error}));
  let settled=false;readiness.then(()=>{settled=true;});
  if(mode==='member'){
   setPhase('slogan');onEvent({sloganHoldMs:1300});
   await animate(scene,[{opacity:1},{opacity:1}],{duration:1300});
   if(current!==sequence)return;
  }else scene.hidden=true;
  symbol.hidden=false;setPhase('opening');
  // On a short band the 42 appears at its place above the arc (§U); without a horizon yet, at the centre.
  raise(reduced.matches?0:liftFor(horizon()));
  await Promise.all([
   animate(symbol.querySelector('.entrance-logo'),[{opacity:0,filter:'blur(8px)',transform:'translateY(10px) scale(.86)',clipPath:'inset(0 0 100% 0)'},{opacity:1,filter:'blur(0px)',transform:'translateY(0) scale(1)',clipPath:'inset(0 0 0 0)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}),
   mode==='member'?animate(scene,[{opacity:1,transform:'translate(-50%,-50%) scale(1)',filter:'blur(0px)'},{opacity:0,transform:'translate(-50%,-50%) scale(.94)',filter:'blur(4px)'}],{duration:450,easing:'ease-in',fill:'forwards'}).then(()=>{scene.hidden=true;}):Promise.resolve(),
  ]);
  if(current!==sequence)return;scene.hidden=true;
  // The arc starts once the 42 has appeared and the horizon is laid out; the horizon comes with the first view, so
  // without one it waits for the preparation. The 42 first glides to its place above it if it shows elsewhere (§U).
  let shape=reduced.matches?null:horizon();
  if(shape){await liftTo(liftFor(shape));if(current!==sequence)return;await drawArc(shape);if(current!==sequence)return;}
  if(!settled){
   // As after the former ring, the status shows only if the preparation still runs once an arc's time has passed.
   if(!shape&&!reduced.matches)await new Promise(resolve=>{const timer=setTimeout(resolve,ARC_MS);readiness.then(()=>{clearTimeout(timer);resolve();});});
   if(current!==sequence)return;
   if(!settled){setPhase('waiting');status.hidden=false;refresh();}
  }
  const result=await readiness;if(current!==sequence)return;
  // The error message shows even when the status never had to (a preparation failing at once).
  if(!result.ok){symbol.hidden=true;arc.hidden=true;status.hidden=false;access.hidden=false;setPhase('error');refresh();access.querySelector('button').focus();return;}
  status.hidden=true;
  if(!reduced.matches){
   if(!shape){shape=horizon()||band();await liftTo(liftFor(shape));if(current!==sequence)return;await drawArc(shape);if(current!==sequence)return;}
   // Read again: the page arrives on the horizon exactly as laid out now.
   if(!reduced.matches)await arriveFromArc(horizon()||band(),mode);
   if(current!==sequence)return;
  }
  openWelcome(mode);
 }
 function finish(){
  cancelAnimationFrame(frame);elapsed=model.durationMs;renderer.render(elapsed);scene.setAttribute('aria-label',model.PHRASE);
  onEvent({decoded:model.PHRASE});enter('member');
 }
 function tick(now){
  if((phase!=='scanning'&&phase!=='decrypting')||paused)return;
  // Anchor to a visible frame, not module evaluation or font loading. The
  // first callback paints the current frame intact before time can advance.
  const delta=last===null?0:Math.max(0,now-last);last=now;
  elapsed=Math.min(phase==='scanning'?SCAN_END:model.durationMs,elapsed+(phase==='scanning'?Math.min(delta,MAX_SCAN_FRAME_MS):delta));
  if(phase==='scanning'&&!scanStarted){scanStarted=true;onEvent({scanStartedAt:performance.now(),scanFirstFrameElapsedMs:elapsed});}
  if(phase==='scanning'&&elapsed>=SCAN_END){
   setPhase('encrypted');refresh();onEvent({scanComplete:true,scanElapsedMs:SCAN_END});
   if(pendingDecryption)beginDecryption();
   return;
  }
  renderer.render(elapsed);
  if(phase==='decrypting'&&elapsed>=model.durationMs)finish();else frame=requestAnimationFrame(tick);
 }
 function beginDecryption(){
  pendingDecryption=false;access.hidden=true;elapsed=SCAN_END;paused=document.hidden;setPhase('decrypting');refresh();onEvent({decryptionVariant:22,decryptionStartedAtMs:elapsed});
  if(reduced.matches){finish();return;}
  resumePlayback();
 }
 function decrypt(){
  if(phase!=='scanning'&&phase!=='encrypted')return;
  lockLanguage();
  pendingDecryption=true;access.hidden=true;
  if(phase==='scanning'){onEvent({signInWaitingForScan:true});return;}
  beginDecryption();
 }
 function accessDialog(kind){
  if(languageTimer){clearTimeout(languageTimer);languageTimer=0;}
  const words=kind==='signup'?signupCopy[getLocale()]:copy[getLocale()];
  openDialog(words.title,container=>{
   const text=document.createElement('p');text.className='dialog-text';text.textContent=words.description;
   container.append(text,action(words.confirm,()=>{closeDialog();decrypt();}),action(t('cancel'),closeDialog,true));
  },kind);
 }
 function loginDialog(){accessDialog('login');}
 if(interactionEvents){
  const options={signal:interactionEvents.signal};
  access.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){accessHovered=true;syncLanguageCycle();}},options);
  access.addEventListener('pointerleave',()=>{accessHovered=false;syncLanguageCycle(true);},options);
  entrance.addEventListener('focusin',()=>syncLanguageCycle(),options);
  entrance.addEventListener('focusout',()=>Promise.resolve().then(()=>syncLanguageCycle(true)),options);
  // Only keys that move or activate focus are keyboard navigation; modifiers,
  // shortcuts (Alt+Tab, Ctrl+C…), lock keys or Escape after a pointer action are not.
  document.addEventListener('keydown',event=>{
   if(event.ctrlKey||event.metaKey||event.altKey||!NAVIGATION_KEYS.includes(event.key))return;
   keyboardFocus=true;syncLanguageCycle(true);
  },{...options,capture:true});
  document.addEventListener('pointerdown',()=>{keyboardFocus=false;syncLanguageCycle(true);},{...options,capture:true});
  dialog?.addEventListener('close',()=>syncLanguageCycle(true),options);
  themeToggle?.addEventListener('click',()=>{
   if(!choosing()||dialog?.open)return;
   onToggleTheme();refresh();syncLanguageCycle(true);
  },options);
 }
 document.addEventListener('visibilitychange',()=>{
  syncLanguageCycle(true);
  if(phase!=='scanning'&&phase!=='decrypting')return;
  resumePlayback();
 });
 reduced.addEventListener('change',()=>{if(reduced.matches){
  settleLabels();
  for(const animation of animations)animation.finish();
  if(phase==='scanning'){
   cancelAnimationFrame(frame);elapsed=SCAN_END;setPhase('encrypted');refresh();onEvent({scanComplete:true,scanElapsedMs:SCAN_END,reducedMotion:true});
   if(pendingDecryption)beginDecryption();
  }else if(phase==='decrypting')finish();
 }});
 window.addEventListener('resize',()=>{
  if(phase==='arriving'||phase==='landed')morph?.finish();
  // The selector lays its horizon out again on its next frame: the drawn arc follows it there, and the 42 its place above it.
  else if(phase==='arc'||phase==='waiting')requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!arc.hidden&&(phase==='arc'||phase==='waiting')){const shape=horizon()||band();placeArc(shape);raise(liftFor(shape));}}));
 });
 reset();
 // The archived renderer rebuilds its glyphs when fonts.ready resolves. Wait
 // for that same visual prerequisite; map preparation remains independent.
 // A missing font falls back to the renderer's sans-serif instead of locking
 // the entrance. Visitors can leave and sign-in can be confirmed meanwhile.
 Promise.resolve().then(()=>document.fonts?.load('500 192px Jost','BEYOND THE CODE'))
  .catch(()=>{}).then(()=>document.fonts?.ready).catch(()=>{}).then(()=>{
   visualReady=true;onEvent({scanResourcesReadyAt:performance.now()});
   if(phase==='scanning')resumePlayback();
  });
 return {refresh,
  signIn(){if(phase==='error')reset();if(phase==='scanning'||phase==='encrypted')loginDialog();},
  signUp(){if(phase==='error')reset();if(phase==='scanning'||phase==='encrypted')accessDialog('signup');},
 };
}
