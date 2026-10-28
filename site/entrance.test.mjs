import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {model} from './decryption/shared.mjs';
import {scannerTogetherPhase} from './decryption/scanner-return-together.mjs';

const source=(await readFile(new URL('./entrance.mjs',import.meta.url),'utf8'))
 .replace(/^import .*;\n/gm,'').replace('export function mountEntrance','function mountEntrance');

// The main entrance opts into the rotating labels; cycleLabels:false mirrors the
// older panels composition, which shares this module without the rotation.
function harness({reducedMotion=false,deferFonts=false,interactions=false,cycleLabels=true,siteLanguage='fr',prepare=()=>Promise.resolve()}={}){
 let now=0,nextFrame=0,nextTimer=0,locale=siteLanguage,theme='light',dialog=null,destroyed=0;
 const frames=new Map(),timers=new Map(),animations=new Set(),events=[],rendered=[],opened=[],listeners={},mediaListeners={};
 let resolveFontLoad,rejectFontLoad,resolveFontsReady;
 const fontLoad=deferFonts?new Promise((resolve,reject)=>{resolveFontLoad=resolve;rejectFontLoad=reject;}):Promise.resolve([]);
 const fontsReady=deferFonts?new Promise(resolve=>{resolveFontsReady=resolve;}):Promise.resolve();
 const nodes=new Map();
 class Element{
  constructor(name){this.name=name;this.children=[];this.hidden=false;this.style={};this.dataset={};this.attributes={};this.listeners={};this.className='';}
  set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
  append(...children){this.children.push(...children);for(const child of children)child.parentElement=this;}replaceChildren(...children){this.children=[];this._text='';this.append(...children);}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(child=>child!==this);this.parentElement=null;}
  get textContent(){return this.children.length?this.children.map(child=>child.textContent).join(''):this._text||'';}set textContent(value){this.children=[];this._text=value;}
  setAttribute(name,value){this.attributes[name]=value;}
  getAttribute(name){return this.attributes[name]??null;}
  addEventListener(name,callback){this.listeners[name]=callback;}
  click(){this.listeners.click?.();}focus(){this.focused=true;document.activeElement=this;}
  contains(node){return this===node||this.children.some(child=>child.contains(node));}
  querySelector(selector){return this.children.find(n=>n.name===selector||selector[0]==='.'&&n.className.split(' ').includes(selector.slice(1)))||this.children.map(n=>n.querySelector(selector)).find(Boolean)||null;}
  getBoundingClientRect(){return this.id==='globe'?{left:388.8,top:208,width:1051.2,height:668}:{left:620,top:380,width:200,height:200};}
  animate(keyframes,options){
   let resolve;const finished=new Promise(r=>{resolve=r;});
   const animation={element:this,keyframes,options,end:now+options.duration,finished,finish(){animations.delete(animation);resolve();},cancel(){animations.delete(animation);resolve();}};
   animations.add(animation);return animation;
  }
 }
 for(const id of ['entrance','entrance-scene','entrance-access','entrance-status','entrance-symbol','entrance-veil','main','globe']){const n=new Element(id);n.id=id;}
 if(interactions)for(const id of ['entry-theme-toggle','dialog']){const node=new Element(id);node.id=id;}
 const logo=new Element('.entrance-logo');logo.append(new Element('img'));nodes.get('entrance-symbol').append(logo,new Element('circle'));
 const document={body:{dataset:{}},documentElement:{lang:siteLanguage,dir:siteLanguage==='ar'?'rtl':'ltr'},activeElement:null,hidden:false,fonts:{load:()=>fontLoad,ready:fontsReady},getElementById:id=>nodes.get(id),createElement:name=>new Element(name),addEventListener:(name,callback)=>listeners[name]=callback};
 const media={matches:reducedMotion,addEventListener:(name,callback)=>mediaListeners[name]=callback};
 const context=vm.createContext({document,window:{addEventListener:(name,callback)=>listeners[`window:${name}`]=callback},matchMedia:()=>media,performance:{now:()=>now},model,
  requestAnimationFrame:callback=>{frames.set(++nextFrame,callback);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),
  AbortController,setTimeout:(callback,delay)=>{timers.set(++nextTimer,{callback,at:now+delay});return nextTimer;},clearTimeout:id=>timers.delete(id),
  mount:()=>({render(time){rendered.push(time);nodes.get('entrance-scene').dataset.phase=scannerTogetherPhase(time);},destroy(){destroyed++;}}),
 });
 vm.runInContext(source,context);
 const entrance=context.mountEntrance({getLocale:()=>locale,cycleLabels,prepare,
  ...(interactions?{getTheme:()=>theme,onToggleTheme:()=>{theme=theme==='light'?'dark':'light';}}:{}),
  getGlobeGeometry:()=>({center:{x:966.96,y:542},radius:269.225}),onOpen:mode=>opened.push(mode),onEvent:event=>events.push(event),
  openDialog(title,build){dialog=nodes.get('dialog')||new Element('dialog');dialog.children=[];dialog.title=title;dialog.open=true;build(dialog);},closeDialog(){const closing=dialog;dialog=null;if(closing){closing.open=false;closing.listeners.close?.();}},
 });
 async function flush(){for(let n=0;n<12;n++)await Promise.resolve();}
 async function advance(ms){now+=ms;const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(now);for(const animation of [...animations])if(animation.end<=now)animation.finish();for(const [id,timer]of [...timers])if(timer.at<=now&&timers.delete(id))timer.callback();await flush();}
 // A scan counts presented frames, so regular playback must not simulate one
 // long blocked frame. advance() deliberately retains that distinction.
 async function play(ms){while(ms>0){const step=Math.min(16,ms);await advance(step);ms-=step;}}
 async function start(){await flush();await advance(0);}
 return{nodes,frames,timers,animations,events,rendered,opened,document,entrance,advance,flush,play,start,
  fonts:{loaded(){resolveFontLoad?.([]);},failed(){rejectFontLoad?.(new Error('font unavailable'));},ready(){resolveFontsReady?.();}},
  get phase(){return document.body.dataset.entry;},get destroyed(){return destroyed;},get lastRender(){return rendered.at(-1);},
  get locale(){return locale;},get theme(){return theme;},
  get displayLocale(){return nodes.get('entry-login').attributes.lang;},get dialogTitle(){return dialog?.title;},
  confirm(){nodes.get('entry-login').click();dialog.children[1].click();},guest(){nodes.get('entry-guest').click();},
  language(value){locale=value;entrance.refresh();},hidden(value){document.hidden=value;listeners.visibilitychange();},
  reduced(value){media.matches=value;mediaListeners.change();},resize(){listeners['window:resize']();},
  hover(value){nodes.get('entrance-access').listeners[value?'pointerenter':'pointerleave']?.({pointerType:'mouse'});},
  focus(id,keyboard=true){listeners[keyboard?'keydown':'pointerdown']?.(keyboard?{key:'Tab'}:{pointerType:'mouse'});nodes.get(id).focus();nodes.get('entrance').listeners.focusin?.();},
  pointer(){listeners.pointerdown?.({pointerType:'mouse'});},key(event){listeners.keydown?.(typeof event==='string'?{key:event}:event);},
  // A closing modal dialog returns focus to its opener, whatever closed it.
  restoreFocus(id){nodes.get(id).focus();nodes.get('entrance').listeners.focusin?.();},
  blur(){document.activeElement=null;nodes.get('entrance').listeners.focusout?.();},
  cancelDialog(){dialog.children[2].click();},
 };
}

test('arrival plays both scanner passes, keeps access available, then holds the cipher',async()=>{
 const h=harness();await h.start();assert.equal(h.phase,'scanning');assert.equal(h.lastRender,0);
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
 assert.equal(h.nodes.get('entrance-access').hidden,false);
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-up');
 await h.play(1250);assert.equal(h.phase,'encrypted');assert.equal(h.nodes.get('entrance-scene').dataset.phase,'cipher');
 assert.equal(h.frames.size,0);assert.equal(h.lastRender,3649.999);
 h.language('en');assert.equal(h.lastRender,3649.999);assert.equal(h.frames.size,0);
 assert.equal(h.events.some(e=>e.decoded),false);
});

test('late sign-in starts only final resolution, holds the slogan, then joins circle to the prepared globe',async()=>{
 const h=harness();await h.start();await h.play(3650);h.confirm();assert.equal(h.phase,'decrypting');assert.equal(h.lastRender,3650);
 await h.advance(0);await h.advance(3150);assert.equal(h.phase,'slogan');assert.equal(h.lastRender,6800);assert.equal(h.opened.length,0);
 await h.advance(1299);assert.equal(h.phase,'slogan');
 await h.advance(1);assert.equal(h.phase,'opening');
 await h.advance(600);assert.equal(h.phase,'ring');
 await h.advance(800);assert.equal(h.phase,'revealing');assert.equal(h.opened.length,0);
 await h.advance(600);assert.match(h.nodes.get('entrance-veil').style.maskImage,/radial-gradient/);
 assert.notEqual(h.nodes.get('globe').style.transform,'');
 await h.advance(600);assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);
 assert.equal(h.nodes.get('main').inert,false);assert.equal(h.nodes.get('globe').style.transform,'');
 assert.equal(h.nodes.get('entrance').hidden,true);assert.equal(h.destroyed,1);
 assert.equal(h.events.filter(e=>e.scanComplete).length,1);
});

test('early sign-in waits for the existing scan and never replays it',async()=>{
 const h=harness();await h.start();await h.play(900);const initialRenders=h.rendered.filter(t=>t===0).length;
 h.confirm();assert.equal(h.phase,'scanning');assert.equal(h.lastRender,900);
 await h.play(2750);assert.equal(h.phase,'decrypting');assert.equal(h.lastRender,3650);
 await h.advance(0);await h.advance(100);assert.equal(h.lastRender,3750);
 assert.equal(h.rendered.filter(t=>t===0).length,initialRenders);assert.equal(h.events.filter(e=>e.decryptionVariant===22).length,1);
});

test('visitor interrupts the scan and follows the common logo-circle-globe path without decryption or slogan',async()=>{
 const h=harness();await h.start();await h.play(800);h.guest();assert.equal(h.phase,'opening');assert.equal(h.frames.size,0);
 await h.advance(600);await h.advance(800);assert.equal(h.phase,'revealing');
 h.resize();await h.flush();assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);
 assert.equal(h.events.some(e=>e.decoded||e.sloganHoldMs||e.decryptionVariant),false);
 assert.ok(h.rendered.every(t=>t<=800));
});

test('hidden tabs pause the scan rather than skipping it when shown',async()=>{
 const h=harness();await h.start();await h.play(800);h.hidden(true);await h.advance(10000);assert.equal(h.lastRender,800);
 h.hidden(false);await h.advance(0);await h.play(500);assert.equal(h.lastRender,1300);assert.equal(h.phase,'scanning');
});

test('reduced motion holds the cipher until confirmation, then completes without timed animation',async()=>{
 const h=harness({reducedMotion:true});assert.equal(h.phase,'encrypted');assert.equal(h.lastRender,3649.999);
 assert.equal(h.frames.size,0);assert.equal(h.animations.size,0);
 h.confirm();await h.flush();assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);
 assert.equal(h.animations.size,0);assert.equal(h.frames.size,0);
});

test('enabling reduced motion during an early confirmed scan finishes the pending sign-in',async()=>{
 const h=harness();await h.start();await h.play(500);h.confirm();h.reduced(true);await h.flush();
 assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);assert.equal(h.frames.size,0);
});

test('map failure returns to the same scan position and a finished scan is never replayed',async()=>{
 for(const elapsed of [800,3650]){
  const h=harness({prepare:()=>Promise.reject(new Error('offline'))});await h.start();await h.play(elapsed);h.guest();
  await h.advance(600);await h.advance(800);assert.equal(h.phase,'error');
  h.nodes.get('entrance-access').children[1].click();assert.equal(h.phase,elapsed<3650?'scanning':'encrypted');assert.equal(h.lastRender,Math.min(elapsed,3649.999));
  assert.equal(h.frames.size,elapsed<3650?1:0);assert.equal(h.nodes.get('entrance-scene').hidden,false);
 }
});

test('a failed globe can be skipped in all locales without decrypting the visitor message',async()=>{
 for(const [locale,label]of [['fr','Continuer sans le globe'],['en','Continue without the globe'],['ar','المتابعة دون الكرة الأرضية']]){
  let attempts=0;
  const h=harness({reducedMotion:true,prepare:()=>{attempts++;return Promise.reject(new Error('WebGL unavailable'));}});
  h.language(locale);h.guest();await h.flush();assert.equal(h.phase,'error');
  const actions=h.nodes.get('entrance-access').children;assert.equal(actions.length,3);assert.equal(actions[2].textContent,label);
  actions[2].click();assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);assert.equal(h.nodes.get('main').inert,false);assert.equal(h.nodes.get('entrance').hidden,true);
  assert.equal(attempts,1);assert.equal(h.destroyed,1);assert.equal(h.events.some(event=>event.decoded),false);assert.equal(h.events.filter(event=>event.globeUnavailable).length,1);
 }
});

test('retry still prepares and reveals the globe after a failed attempt',async()=>{
 let attempts=0;
 const h=harness({reducedMotion:true,prepare:()=>++attempts===1?Promise.reject(new Error('offline')):Promise.resolve()});
 h.guest();await h.flush();assert.equal(h.phase,'error');h.nodes.get('entrance-access').children[0].click();await h.flush();
 assert.equal(attempts,2);assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);assert.equal(h.events.some(event=>event.globeUnavailable),false);assert.equal(h.destroyed,1);
});

test('continuing without a globe preserves the simulated member identity',async()=>{
 const h=harness({reducedMotion:true,prepare:()=>Promise.reject(new Error('offline'))});h.confirm();await h.flush();assert.equal(h.phase,'error');
 h.nodes.get('entrance-access').children[2].click();assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);assert.equal(h.events.filter(event=>event.decoded).length,1);
});

test('a delayed first visible frame still starts at the initial binary message',async()=>{
 const h=harness();await h.flush();
 await h.advance(2400);
 assert.equal(h.lastRender,0);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'binary');
 assert.equal(h.events.find(event=>event.scanStartedAt!==undefined).scanFirstFrameElapsedMs,0);
 await h.play(599);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'binary');
 await h.play(1);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
});

test('font loading and the font layout barrier cannot consume either scanner pass',async()=>{
 const h=harness({deferFonts:true});await h.flush();await h.advance(5000);
 assert.equal(h.frames.size,0);assert.equal(h.lastRender,0);assert.equal(h.nodes.get('entrance-access').hidden,false);
 h.fonts.loaded();await h.flush();await h.advance(2000);
 assert.equal(h.frames.size,0);assert.equal(h.lastRender,0);
 h.fonts.ready();await h.flush();await h.advance(1000);
 assert.equal(h.lastRender,0);
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-up');
 await h.play(1250);assert.equal(h.phase,'encrypted');
});

test('a blocked main thread cannot skip the visible scanner passes',async()=>{
 const h=harness();await h.start();await h.play(900);const before=h.lastRender;
 await h.advance(1800);
 assert.ok(h.lastRender>before);assert.ok(h.lastRender-before<=64);
 assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
 await h.play(3650-h.lastRender);assert.equal(h.phase,'encrypted');
 assert.equal(h.events.filter(event=>event.scanComplete).length,1);
});

test('sign-in confirmed before fonts are ready waits for the full visible scan',async()=>{
 const h=harness({deferFonts:true});h.confirm();await h.advance(5000);
 assert.equal(h.phase,'scanning');assert.equal(h.lastRender,0);
 h.fonts.loaded();h.fonts.ready();await h.start();
 await h.play(3649);assert.equal(h.phase,'scanning');
 await h.play(1);assert.equal(h.phase,'decrypting');assert.equal(h.lastRender,3650);
 await h.advance(0);await h.advance(3150);assert.equal(h.phase,'slogan');
 assert.equal(h.events.filter(event=>event.decryptionVariant===22).length,1);
});

test('a visitor can leave before font readiness without the scan restarting later',async()=>{
 const h=harness({deferFonts:true});h.guest();assert.equal(h.phase,'opening');
 h.fonts.loaded();h.fonts.ready();await h.flush();assert.equal(h.frames.size,0);
 await h.advance(600);await h.advance(800);assert.equal(h.phase,'revealing');
 h.resize();await h.flush();assert.equal(h.phase,'welcome');
 assert.deepEqual(h.opened,['visitor']);assert.ok(h.rendered.every(time=>time===0));
 assert.equal(h.events.some(event=>event.scanStartedAt!==undefined||event.decoded),false);
});

test('fonts becoming ready in a hidden tab wait for the first visible frame',async()=>{
 const h=harness({deferFonts:true});h.hidden(true);h.fonts.loaded();h.fonts.ready();await h.flush();
 await h.advance(10000);assert.equal(h.frames.size,0);assert.equal(h.lastRender,0);
 h.hidden(false);await h.advance(3000);assert.equal(h.lastRender,0);
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
});

test('failed fonts use fallback rather than preventing the initial scan',async()=>{
 const h=harness({deferFonts:true});await h.flush();h.fonts.failed();h.fonts.ready();await h.start();
 assert.equal(h.lastRender,0);await h.play(3650);assert.equal(h.phase,'encrypted');
});

test('reduced motion during pending fonts completes sign-in without a late restart',async()=>{
 const h=harness({deferFonts:true});h.confirm();h.reduced(true);await h.flush();
 assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);
 h.fonts.loaded();h.fonts.ready();await h.flush();await h.advance(1000);
 assert.equal(h.phase,'welcome');assert.equal(h.frames.size,0);assert.equal(h.destroyed,1);
 assert.equal(h.events.some(event=>event.scanStartedAt!==undefined),false);
});

test('only entry labels cycle every four seconds without replacing the two actions',async()=>{
 const h=harness({interactions:true,reducedMotion:true});const login=h.nodes.get('entry-login'),guest=h.nodes.get('entry-guest');
 for(const [locale,loginText,guestText]of [['en','Sign in','Visit'],['ar','تسجيل الدخول','زيارة'],['fr','Se connecter','Visiter']]){
  const before=h.displayLocale;await h.advance(3999);assert.equal(h.displayLocale,before);await h.advance(1);assert.equal(h.displayLocale,locale);
  assert.equal(h.nodes.get('entry-login'),login);assert.equal(h.nodes.get('entry-guest'),guest);
  assert.equal(login.querySelector('.entrance-action-label').textContent,loginText);assert.equal(guest.querySelector('.entrance-action-label').textContent,guestText);assert.equal(login.attributes.lang,locale);assert.equal(guest.attributes.lang,locale);
 }
});

test('scanner completion does not restart the independent four-second language clock',async()=>{
 const h=harness({interactions:true});await h.start();await h.play(3999);assert.equal(h.phase,'encrypted');assert.equal(h.displayLocale,'fr');
 await h.play(1);assert.equal(h.displayLocale,'en');assert.equal(h.lastRender,3649.999);assert.equal(h.events.filter(event=>event.scanComplete).length,1);
});

test('hover and action focus pause language changes and resume with a full interval',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(2500);h.hover(true);await h.advance(20000);assert.equal(h.displayLocale,'fr');assert.equal(h.timers.size,0);
 h.hover(false);await h.advance(3999);assert.equal(h.displayLocale,'fr');await h.advance(1);assert.equal(h.displayLocale,'en');
 h.focus('entry-login');await h.advance(20000);assert.equal(h.displayLocale,'en');assert.equal(h.timers.size,0);
 h.blur();await h.flush();await h.advance(3999);assert.equal(h.displayLocale,'en');await h.advance(1);assert.equal(h.displayLocale,'ar');
});

test('hidden tabs never catch up missed entry languages',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(1000);h.hidden(true);await h.advance(100000);assert.equal(h.displayLocale,'fr');assert.equal(h.timers.size,0);
 h.hidden(false);await h.advance(3999);assert.equal(h.displayLocale,'fr');await h.advance(1);assert.equal(h.displayLocale,'en');
});

test('an open access dialog holds its language and cancelling resumes from that language',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(4000);h.nodes.get('entry-login').click();await h.advance(20000);assert.equal(h.displayLocale,'en');assert.equal(h.timers.size,0);
 assert.equal(h.dialogTitle,'Connexion — prototype');assert.equal(h.locale,'fr');h.cancelDialog();await h.advance(3999);assert.equal(h.displayLocale,'en');await h.advance(1);assert.equal(h.displayLocale,'ar');
});

test('early sign-in stops the label cycle while fonts, scan and decryption complete',async()=>{
 const h=harness({interactions:true,deferFonts:true});await h.advance(4000);assert.equal(h.displayLocale,'en');h.confirm();assert.equal(h.phase,'scanning');assert.equal(h.nodes.get('entry-theme-toggle').hidden,true);
 await h.advance(20000);assert.equal(h.displayLocale,'en');assert.equal(h.timers.size,0);h.fonts.loaded();h.fonts.ready();await h.start();await h.play(3650);assert.equal(h.phase,'decrypting');assert.equal(h.displayLocale,'en');
 await h.advance(0);await h.advance(3150);assert.equal(h.phase,'slogan');assert.equal(h.displayLocale,'en');assert.equal(h.timers.size,0);
});

test('visiting leaves the site language unchanged and no label timer behind',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(4000);await h.advance(4000);assert.equal(h.displayLocale,'ar');assert.equal(h.locale,'fr');h.guest();await h.flush();assert.equal(h.phase,'welcome');
 await h.advance(20000);assert.equal(h.displayLocale,'ar');assert.equal(h.timers.size,0);assert.equal(h.nodes.get('entry-theme-toggle').hidden,true);
});

test('background theme activation is named, pauses for keyboard focus and never runs during opening',async()=>{
 const h=harness({interactions:true,reducedMotion:true});const toggle=h.nodes.get('entry-theme-toggle');assert.equal(toggle.hidden,false);assert.equal(toggle.attributes['aria-label'],'Passer au mode sombre');
 h.focus('entry-theme-toggle');toggle.click();assert.equal(h.theme,'dark');assert.equal(toggle.attributes['aria-label'],'Passer au mode clair');await h.advance(20000);assert.equal(h.displayLocale,'fr');
 h.focus('entry-theme-toggle',false);toggle.click();assert.equal(h.theme,'light');await h.advance(4000);assert.equal(h.displayLocale,'en');assert.equal(toggle.attributes['aria-label'],'Passer au mode sombre');
 h.guest();toggle.click();assert.equal(h.theme,'light');await h.flush();assert.equal(h.phase,'welcome');assert.equal(toggle.hidden,true);
});

test('Arabic entry labels neither change the site direction nor translate its sign-in dialog',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.flush();const renders=h.rendered.length;
 await h.advance(4000);await h.advance(4000);assert.equal(h.displayLocale,'ar');assert.equal(h.locale,'fr');assert.equal(h.document.documentElement.lang,'fr');assert.equal(h.document.documentElement.dir,'ltr');assert.equal(h.rendered.length,renders);
 h.nodes.get('entry-login').click();assert.equal(h.dialogTitle,'Connexion — prototype');assert.equal(h.displayLocale,'ar');
});

test('the label cycle starts in the site language and keeps other entry controls in that language',async()=>{
 const h=harness({interactions:true,reducedMotion:true,siteLanguage:'ar'});assert.equal(h.displayLocale,'ar');await h.advance(4000);assert.equal(h.displayLocale,'fr');assert.equal(h.locale,'ar');assert.equal(h.document.documentElement.dir,'rtl');
 assert.equal(h.nodes.get('entry-theme-toggle').attributes['aria-label'],'التبديل إلى الوضع الداكن');h.nodes.get('entry-login').click();assert.equal(h.dialogTitle,'تسجيل الدخول — نموذج أولي');
});

test('only the label text animates, settles on focus, and respects reduced motion',async()=>{
 const h=harness({interactions:true,deferFonts:true});await h.advance(4000);assert.equal(h.displayLocale,'en');assert.equal(h.animations.size,4);assert.ok([...h.animations].every(animation=>animation.element.className.includes('entrance-action-label')));
 h.focus('entry-login');await h.flush();assert.equal(h.animations.size,0);assert.equal(h.nodes.get('entry-login').querySelector('.entrance-action-label').textContent,'Sign in');
 h.reduced(true);h.blur();await h.flush();await h.advance(4000);assert.equal(h.displayLocale,'ar');assert.equal(h.animations.size,0);
});

test('cancelling sign-in with the pointer returns focus to its button without stopping the labels',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(4000);assert.equal(h.displayLocale,'en');
 h.pointer();h.nodes.get('entry-login').click();assert.equal(h.dialogTitle,'Connexion — prototype');
 h.pointer();h.cancelDialog();h.restoreFocus('entry-login');
 await h.advance(3999);assert.equal(h.displayLocale,'en');await h.advance(1);assert.equal(h.displayLocale,'ar');
});

test('keyboard focus restored after a dialog still holds the labels until it leaves the actions',async()=>{
 const h=harness({interactions:true,reducedMotion:true});h.focus('entry-login');h.nodes.get('entry-login').click();
 h.key('Escape');h.cancelDialog();h.restoreFocus('entry-login');await h.advance(20000);assert.equal(h.displayLocale,'fr');
 h.blur();await h.flush();await h.advance(4000);assert.equal(h.displayLocale,'en');
});

test('modifier, lock, function keys and shortcuts do not hold the labels after a pointer action',async()=>{
 const h=harness({interactions:true,reducedMotion:true});const toggle=h.nodes.get('entry-theme-toggle');
 h.focus('entry-theme-toggle',false);toggle.click();
 for(const event of [{key:'Shift'},{key:'Alt'},{key:'Control'},{key:'Meta'},{key:'NumLock'},{key:'ScrollLock'},{key:'PrintScreen'},{key:'F11'},{key:'Escape'},{key:'c',ctrlKey:true},{key:'Tab',altKey:true}])h.key(event);
 await h.advance(4000);assert.equal(h.displayLocale,'en');
 h.key('Tab');await h.advance(20000);assert.equal(h.displayLocale,'en');
});

test('a page that does not opt in keeps plain site-language labels without rotation',async()=>{
 const h=harness({reducedMotion:true,cycleLabels:false});const login=h.nodes.get('entry-login'),guest=h.nodes.get('entry-guest');
 assert.equal(login.textContent,'Se connecter');assert.equal(guest.textContent,'Visiter');assert.equal(login.querySelector('.entrance-action-label'),null);
 assert.equal(login.getAttribute('aria-description'),null);assert.equal(login.getAttribute('lang'),'fr');
 await h.advance(20000);assert.equal(login.textContent,'Se connecter');assert.equal(h.timers.size,0);
 h.language('en');assert.equal(login.textContent,'Sign in');assert.equal(guest.textContent,'Visit');assert.equal(login.getAttribute('lang'),'en');
});

test('Escape after a pointer-opened sign-in closes it without holding the labels',async()=>{
 const h=harness({interactions:true,reducedMotion:true});h.pointer();h.nodes.get('entry-login').click();
 h.key('Escape');h.cancelDialog();h.restoreFocus('entry-login');
 await h.advance(3999);assert.equal(h.displayLocale,'fr');await h.advance(1);assert.equal(h.displayLocale,'en');
});

test('focus moved without keys or pointer, as by assistive technology, holds the labels',async()=>{
 const h=harness({interactions:true,reducedMotion:true});h.restoreFocus('entry-login');
 await h.advance(20000);assert.equal(h.displayLocale,'fr');assert.equal(h.timers.size,0);
 h.blur();await h.flush();await h.advance(4000);assert.equal(h.displayLocale,'en');
});
