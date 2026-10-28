import {mount} from '../decryption-examples/scanner-return-random.mjs';
import {model} from '../decryption-examples/shared.mjs';

// The selected n°22 renderer uses a 6.8s timeline. Its two scanner passes
// precede this boundary; only the final character resolution requires sign-in.
const SCAN_END=model.durationMs*3650/6800;
// A busy startup frame must not consume an unseen part of either scan pass.
const MAX_SCAN_FRAME_MS=64;
const LANGUAGE_INTERVAL_MS=4000;
const ENTRY_LANGUAGES=['fr','en','ar'];
const MODIFIER_KEYS=['Alt','AltGraph','CapsLock','Control','Meta','OS','Shift'];
const interactionCopy={
 fr:{light:'Passer au mode clair',dark:'Passer au mode sombre',languages:'Les langues alternent automatiquement. Le survol ou le focus des boutons suspend le changement.'},
 en:{light:'Switch to light mode',dark:'Switch to dark mode',languages:'Languages rotate automatically. Hovering or focusing the buttons pauses the changes.'},
 ar:{light:'التبديل إلى الوضع الفاتح',dark:'التبديل إلى الوضع الداكن',languages:'تتبدل اللغات تلقائياً. يتوقف التبديل عند تمرير المؤشر على الأزرار أو التركيز عليها.'},
};

const copy={
 fr:{login:'Se connecter',guest:'Visiter',encrypted:'Message chiffré',decoding:'Déchiffrement en cours',title:'Connexion — prototype',description:'Cette maquette simule la connexion. Aucune authentification réelle n’est effectuée.',confirm:'Simuler une connexion réussie',cancel:'Annuler',waiting:'Le monde se prépare…',error:'Le monde n’a pas pu se préparer.',retry:'Réessayer',back:'Revenir au message',continue:'Continuer sans le globe'},
 en:{login:'Sign in',guest:'Visit',encrypted:'Encrypted message',decoding:'Decrypting',title:'Sign in — prototype',description:'This preview simulates sign-in. No real authentication takes place.',confirm:'Simulate a successful sign-in',cancel:'Cancel',waiting:'Getting the world ready…',error:'The world could not be prepared.',retry:'Try again',back:'Back to the message',continue:'Continue without the globe'},
 ar:{login:'تسجيل الدخول',guest:'زيارة',encrypted:'رسالة مشفرة',decoding:'جارٍ فك التشفير',title:'تسجيل الدخول — نموذج أولي',description:'يحاكي هذا النموذج تسجيل الدخول. لا يتم إجراء مصادقة حقيقية.',confirm:'محاكاة تسجيل دخول ناجح',cancel:'إلغاء',waiting:'نجهّز العالم…',error:'تعذّر تجهيز العالم.',retry:'إعادة المحاولة',back:'العودة إلى الرسالة',continue:'المتابعة دون الكرة الأرضية'},
};
const signupCopy={
 fr:{title:'Création de compte simulée',description:'Cet aperçu simule la création de compte avec le profil fictif de Leïla Mansour. Aucun compte réel n’est créé.',confirm:'Simuler la création du compte'},
 en:{title:'Simulated account creation',description:'This preview simulates account creation using Leïla Mansour’s fictional profile. No real account is created.',confirm:'Simulate account creation'},
 ar:{title:'إنشاء حساب تجريبي',description:'يحاكي هذا النموذج إنشاء حساب باستخدام الملف الخيالي لليلى منصور. لا يتم إنشاء أي حساب حقيقي.',confirm:'محاكاة إنشاء حساب'},
};

// Pages opt into the rotating access labels; older compositions sharing this
// module keep plain labels in the site language, as before the rotation.
export function mountEntrance({getLocale,cycleLabels=false,getTheme=()=>document.documentElement.dataset.theme,onToggleTheme=()=>{},openDialog,closeDialog,prepare,getGlobeGeometry,onOpen,onEvent=()=>{}}){
 const entrance=document.getElementById('entrance'),scene=document.getElementById('entrance-scene');
 const access=document.getElementById('entrance-access'),status=document.getElementById('entrance-status');
 const themeToggle=document.getElementById('entry-theme-toggle'),dialog=document.getElementById('dialog');
 const symbol=document.getElementById('entrance-symbol'),veil=document.getElementById('entrance-veil');
 const main=document.getElementById('main');main.inert=true;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const renderer=mount({root:scene,model});
 let phase='encrypted',elapsed=0,last=null,frame=0,sequence=0,paused=false,identity='visitor',pendingDecryption=false,morph=null;
 let visualReady=false,scanStarted=false;
 let languageTimer=0,languageLocked=false,accessHovered=false,keyboardFocus=false;
 let siteLocale=getLocale(),displayLocale=siteLocale;
 const interactionEvents=cycleLabels||themeToggle?new AbortController():null,labelMotions=new Map();
 const animations=new Set();
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
  if(phase==='revealing')morph?.finish();
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
  if(phase==='error'){status.textContent=t('error');access.replaceChildren(action(t('retry'),()=>enter(identity)),action(t('back'),reset,true),action(t('continue'),()=>{onEvent({globeUnavailable:true});openWelcome(identity);},true));}
  refreshThemeToggle();syncLanguageCycle();
 }
 function reset(){
  settleLabels();
  sequence++;cancelAnimationFrame(frame);for(const animation of animations)animation.cancel();animations.clear();
  // Returning after a map error keeps the scan already played; it never
  // repeats the two passes after a successful sign-in.
  elapsed=reduced.matches?SCAN_END:Math.min(elapsed,SCAN_END);pendingDecryption=false;languageLocked=false;
  symbol.hidden=true;scene.hidden=false;status.hidden=true;access.hidden=false;veil.hidden=true;
  symbol.querySelector('circle').style.strokeDashoffset='';
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
  document.getElementById('globe').focus({preventScroll:true});
 }
 async function animate(element,keyframes,options){
  if(reduced.matches)return;
  const animation=element.animate(keyframes,options);animations.add(animation);
  try{await animation.finished;}catch{}finally{animation.cancel();animations.delete(animation);}
 }
 function animateProgress(duration,draw){
  if(reduced.matches){draw(1);return Promise.resolve();}
  return new Promise(resolve=>{
   let id=0,done=false;const start=performance.now();
   const complete=()=>{if(done)return;done=true;cancelAnimationFrame(id);animations.delete(animation);morph=null;resolve();};
   const animation={cancel:complete,finish(){draw(1);complete();}};
   const update=now=>{if(done)return;const t=Math.min(1,(now-start)/duration);draw(t*t*(3-2*t));if(t===1)complete();else id=requestAnimationFrame(update);};
   animations.add(animation);morph=animation;draw(0);id=requestAnimationFrame(update);
  });
 }
 async function revealGlobe(){
  const globe=document.getElementById('globe'),rect=globe.getBoundingClientRect();
  const geometry=getGlobeGeometry?.();
  // The engine supplies the exact perspective sphere in viewport CSS pixels.
  // Its stage fallback is used only by a renderer that does not expose it.
  const target=geometry?{...geometry.center,radius:geometry.radius}:{x:rect.left+rect.width/2,y:rect.top+rect.height/2,radius:Math.min(rect.width,rect.height)*.4};
  const box=symbol.getBoundingClientRect(),origin={x:box.left+box.width/2,y:box.top+box.height/2,radius:box.width*.48};
  const local={x:target.x-rect.left,y:target.y-rect.top};
  veil.hidden=false;entrance.style.background='transparent';
  const previousTransition=globe.style.transition;
  globe.style.transition='none';globe.style.transformOrigin=`${local.x}px ${local.y}px`;globe.style.clipPath=`circle(${target.radius}px at ${local.x}px ${local.y}px)`;globe.style.willChange='transform, opacity';
  const logo=symbol.querySelector('img'),ring=symbol.querySelector('circle');
  const draw=p=>{
   const x=origin.x+(target.x-origin.x)*p,y=origin.y+(target.y-origin.y)*p,r=origin.radius+(target.radius-origin.radius)*p;
   globe.style.transform=`translate(${x-target.x}px,${y-target.y}px) scale(${r/target.radius})`;
   globe.style.opacity=String(Math.min(1,p/.32));
   symbol.style.transform=`translate(-50%,-50%) translate(${x-origin.x}px,${y-origin.y}px) scale(${r/origin.radius})`;
   logo.style.opacity=String(1-Math.min(1,p/.25));ring.style.opacity=String(1-Math.max(0,(p-.65)/.35));
   veil.style.maskImage=`radial-gradient(circle at ${x}px ${y}px,transparent ${Math.max(0,r-1)}px,#000 ${r+1}px)`;
  };
  draw(0);setPhase('revealing');onEvent({globeReveal:{...target,durationMs:1200}});
  await animateProgress(1200,draw);
  for(const field of ['transformOrigin','clipPath','willChange','transform','opacity'])globe.style[field]='';
  globe.style.transition=previousTransition;
  symbol.style.transform='';logo.style.opacity='';ring.style.opacity='';veil.hidden=true;veil.style.maskImage='';
 }
 async function enter(mode){
  lockLanguage();
  cancelAnimationFrame(frame);pendingDecryption=false;
  identity=mode;const current=++sequence;access.hidden=true;status.hidden=true;
  // The data/map preparation has already started behind the encrypted screen.
  // Attach a rejection handler immediately while the short logo motion runs.
  const readiness=prepare().then(()=>({ok:true}),error=>({ok:false,error}));
  if(mode==='member'){
   setPhase('slogan');onEvent({sloganHoldMs:1300});
   await animate(scene,[{opacity:1},{opacity:1}],{duration:1300});
   if(current!==sequence)return;
  }else scene.hidden=true;
  symbol.hidden=false;setPhase('opening');
  await Promise.all([
   animate(symbol.querySelector('.entrance-logo'),[{opacity:0,filter:'blur(8px)',transform:'translateY(10px) scale(.86)',clipPath:'inset(0 0 100% 0)'},{opacity:1,filter:'blur(0px)',transform:'translateY(0) scale(1)',clipPath:'inset(0 0 0 0)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}),
   mode==='member'?animate(scene,[{opacity:1,transform:'translate(-50%,-50%) scale(1)',filter:'blur(0px)'},{opacity:0,transform:'translate(-50%,-50%) scale(.94)',filter:'blur(4px)'}],{duration:450,easing:'ease-in',fill:'forwards'}).then(()=>{scene.hidden=true;}):Promise.resolve(),
  ]);
  if(current!==sequence)return;scene.hidden=true;
  setPhase('ring');await animate(symbol.querySelector('circle'),[{strokeDashoffset:100},{strokeDashoffset:0}],{duration:800,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
  symbol.querySelector('circle').style.strokeDashoffset='0';
  if(current!==sequence)return;
  setPhase('waiting');status.hidden=false;refresh();
  const result=await readiness;if(current!==sequence)return;
  if(!result.ok){symbol.hidden=true;access.hidden=false;setPhase('error');refresh();access.querySelector('button').focus();return;}
  status.hidden=true;
  // Reveal the same prepared WebGL sphere inside the moving, growing circle.
  if(!reduced.matches)await revealGlobe();
  if(current!==sequence)return;
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
  // Modifier keys and shortcuts (Alt+Tab, Ctrl+C…) are not keyboard navigation.
  document.addEventListener('keydown',event=>{
   if(event.ctrlKey||event.metaKey||event.altKey||MODIFIER_KEYS.includes(event.key))return;
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
 window.addEventListener('resize',()=>morph?.finish());
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
