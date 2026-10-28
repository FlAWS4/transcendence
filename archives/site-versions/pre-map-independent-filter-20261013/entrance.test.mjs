import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {model} from '../decryption-examples/shared.mjs';
import {scannerTogetherPhase} from '../decryption-examples/scanner-return-together.mjs';

const source=(await readFile(new URL('./entrance.mjs',import.meta.url),'utf8'))
 .replace(/^import .*;\n/gm,'').replace('export function mountEntrance','function mountEntrance');

function harness({reducedMotion=false,deferFonts=false,prepare=()=>Promise.resolve()}={}){
 let now=0,nextFrame=0,locale='fr',dialog=null,destroyed=0;
 const frames=new Map(),animations=new Set(),events=[],rendered=[],opened=[],listeners={},mediaListeners={};
 let resolveFontLoad,rejectFontLoad,resolveFontsReady;
 const fontLoad=deferFonts?new Promise((resolve,reject)=>{resolveFontLoad=resolve;rejectFontLoad=reject;}):Promise.resolve([]);
 const fontsReady=deferFonts?new Promise(resolve=>{resolveFontsReady=resolve;}):Promise.resolve();
 const nodes=new Map();
 class Element{
  constructor(name){this.name=name;this.children=[];this.hidden=false;this.style={};this.dataset={};this.attributes={};this.listeners={};this.className='';}
  set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
  append(...children){this.children.push(...children);}replaceChildren(...children){this.children=children;}
  setAttribute(name,value){this.attributes[name]=value;}
  addEventListener(name,callback){this.listeners[name]=callback;}
  click(){this.listeners.click?.();}focus(){this.focused=true;}
  querySelector(selector){return this.children.find(n=>n.name===selector)||this.children.map(n=>n.querySelector(selector)).find(Boolean)||null;}
  getBoundingClientRect(){return this.id==='globe'?{left:388.8,top:208,width:1051.2,height:668}:{left:620,top:380,width:200,height:200};}
  animate(keyframes,options){
   let resolve;const finished=new Promise(r=>{resolve=r;});
   const animation={element:this,keyframes,options,end:now+options.duration,finished,finish(){animations.delete(animation);resolve();},cancel(){animations.delete(animation);resolve();}};
   animations.add(animation);return animation;
  }
 }
 for(const id of ['entrance','entrance-scene','entrance-access','entrance-status','entrance-symbol','entrance-veil','main','globe']){const n=new Element(id);n.id=id;}
 const logo=new Element('.entrance-logo');logo.append(new Element('img'));nodes.get('entrance-symbol').append(logo,new Element('circle'));
 const document={body:{dataset:{}},hidden:false,fonts:{load:()=>fontLoad,ready:fontsReady},getElementById:id=>nodes.get(id),createElement:name=>new Element(name),addEventListener:(name,callback)=>listeners[name]=callback};
 const media={matches:reducedMotion,addEventListener:(name,callback)=>mediaListeners[name]=callback};
 const context=vm.createContext({document,window:{addEventListener:(name,callback)=>listeners[`window:${name}`]=callback},matchMedia:()=>media,performance:{now:()=>now},model,
  requestAnimationFrame:callback=>{frames.set(++nextFrame,callback);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),
  mount:()=>({render(time){rendered.push(time);nodes.get('entrance-scene').dataset.phase=scannerTogetherPhase(time);},destroy(){destroyed++;}}),
 });
 vm.runInContext(source,context);
 const entrance=context.mountEntrance({getLocale:()=>locale,prepare,
  getGlobeGeometry:()=>({center:{x:966.96,y:542},radius:269.225}),onOpen:mode=>opened.push(mode),onEvent:event=>events.push(event),
  openDialog(title,build){dialog=new Element('dialog');build(dialog);},closeDialog(){dialog=null;},
 });
 async function flush(){for(let n=0;n<12;n++)await Promise.resolve();}
 async function advance(ms){now+=ms;const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(now);for(const animation of [...animations])if(animation.end<=now)animation.finish();await flush();}
 // A scan counts presented frames, so regular playback must not simulate one
 // long blocked frame. advance() deliberately retains that distinction.
 async function play(ms){while(ms>0){const step=Math.min(16,ms);await advance(step);ms-=step;}}
 async function start(){await flush();await advance(0);}
 return{nodes,frames,animations,events,rendered,opened,document,entrance,advance,flush,play,start,
  fonts:{loaded(){resolveFontLoad?.([]);},failed(){rejectFontLoad?.(new Error('font unavailable'));},ready(){resolveFontsReady?.();}},
  get phase(){return document.body.dataset.entry;},get destroyed(){return destroyed;},get lastRender(){return rendered.at(-1);},
  confirm(){nodes.get('entry-login').click();dialog.children[1].click();},guest(){nodes.get('entry-guest').click();},
  language(value){locale=value;entrance.refresh();},hidden(value){document.hidden=value;listeners.visibilitychange();},
  reduced(value){media.matches=value;mediaListeners.change();},resize(){listeners['window:resize']();},
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
