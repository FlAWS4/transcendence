import {mount} from '../decryption-examples/scanner-return-random.mjs';
import {model} from '../decryption-examples/shared.mjs';

// The selected n°22 renderer uses a 6.8s timeline. Its two scanner passes
// precede this boundary; only the final character resolution requires sign-in.
const SCAN_END=model.durationMs*3650/6800;
// A busy startup frame must not consume an unseen part of either scan pass.
const MAX_SCAN_FRAME_MS=64;

const copy={
 fr:{login:'Se connecter',guest:'Explorer en visiteur',encrypted:'Message chiffré',decoding:'Déchiffrement en cours',title:'Connexion — prototype',description:'Cette maquette simule la connexion. Aucune authentification réelle n’est effectuée.',confirm:'Simuler une connexion réussie',cancel:'Annuler',waiting:'Le monde se prépare…',error:'Le monde n’a pas pu se préparer.',retry:'Réessayer',back:'Revenir au message'},
 en:{login:'Sign in',guest:'Explore as a visitor',encrypted:'Encrypted message',decoding:'Decrypting',title:'Sign in — prototype',description:'This preview simulates sign-in. No real authentication takes place.',confirm:'Simulate a successful sign-in',cancel:'Cancel',waiting:'Getting the world ready…',error:'The world could not be prepared.',retry:'Try again',back:'Back to the message'},
 ar:{login:'تسجيل الدخول',guest:'استكشف كزائر',encrypted:'رسالة مشفرة',decoding:'جارٍ فك التشفير',title:'تسجيل الدخول — نموذج أولي',description:'يحاكي هذا النموذج تسجيل الدخول. لا يتم إجراء مصادقة حقيقية.',confirm:'محاكاة تسجيل دخول ناجح',cancel:'إلغاء',waiting:'نجهّز العالم…',error:'تعذّر تجهيز العالم.',retry:'إعادة المحاولة',back:'العودة إلى الرسالة'},
};

export function mountEntrance({getLocale,openDialog,closeDialog,prepare,getGlobeGeometry,onOpen,onEvent=()=>{}}){
 const entrance=document.getElementById('entrance'),scene=document.getElementById('entrance-scene');
 const access=document.getElementById('entrance-access'),status=document.getElementById('entrance-status');
 const symbol=document.getElementById('entrance-symbol'),veil=document.getElementById('entrance-veil');
 const main=document.getElementById('main');main.inert=true;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const renderer=mount({root:scene,model});
 let phase='encrypted',elapsed=0,last=null,frame=0,sequence=0,paused=false,identity='visitor',pendingDecryption=false,morph=null;
 let visualReady=false,scanStarted=false;
 const animations=new Set();
 const t=key=>copy[getLocale()][key];
 function setPhase(next){phase=next;document.body.dataset.entry=next;onEvent({entry:next});}
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
   document.getElementById('entry-login').textContent=t('login');document.getElementById('entry-guest').textContent=t('guest');
  }
  if(phase==='waiting')status.textContent=t('waiting');
  if(phase==='error'){status.textContent=t('error');access.replaceChildren(action(t('retry'),()=>enter(identity)),action(t('back'),reset,true));}
 }
 function reset(){
  sequence++;cancelAnimationFrame(frame);for(const animation of animations)animation.cancel();animations.clear();
  // Returning after a map error keeps the scan already played; it never
  // repeats the two passes after a successful sign-in.
  elapsed=reduced.matches?SCAN_END:Math.min(elapsed,SCAN_END);pendingDecryption=false;
  symbol.hidden=true;scene.hidden=false;status.hidden=true;access.hidden=false;veil.hidden=true;
  symbol.querySelector('circle').style.strokeDashoffset='';
  entrance.style.background='';setPhase(elapsed<SCAN_END?'scanning':'encrypted');
  const login=action(t('login'),loginDialog),guest=action(t('guest'),()=>enter('visitor'),true);
  login.id='entry-login';guest.id='entry-guest';access.replaceChildren(login,guest);refresh();
  resumePlayback();
 }
 function resumePlayback(){
  cancelAnimationFrame(frame);frame=0;last=null;paused=document.hidden;
  if(!paused&&(phase==='decrypting'||(phase==='scanning'&&visualReady)))frame=requestAnimationFrame(tick);
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
  setPhase('welcome');main.inert=false;onOpen(mode);
  entrance.hidden=true;renderer.destroy();
  document.getElementById('globe').focus({preventScroll:true});
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
  pendingDecryption=true;access.hidden=true;
  if(phase==='scanning'){onEvent({signInWaitingForScan:true});return;}
  beginDecryption();
 }
 function loginDialog(){
  openDialog(t('title'),container=>{
   const text=document.createElement('p');text.className='dialog-text';text.textContent=t('description');
   container.append(text,action(t('confirm'),()=>{closeDialog();decrypt();}),action(t('cancel'),closeDialog,true));
  },'login');
 }
 document.addEventListener('visibilitychange',()=>{
  if(phase!=='scanning'&&phase!=='decrypting')return;
  resumePlayback();
 });
 reduced.addEventListener('change',()=>{if(reduced.matches){
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
 return {refresh};
}
