import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mountReadingScope} from '../reading-scope.mjs';

const settle=async()=>{await Promise.resolve();await Promise.resolve();};
const vector=value=>String(value).split(/\s+/).map(part=>parseFloat(part)||0);
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-7,message+' ('+actual+' vs '+expected+')');
function sameRect(actual,expected){for(const name of ['left','top','width','height'])near(actual[name],expected[name],name);}

function fixture(t,{reading=false,reduced=false,animatable=true,fit}={}){
 const app={dataset:{reading:String(reading)}},motion=new EventTarget(),win=new EventTarget();
 motion.matches=reduced;
 const layouts={list:{left:480.25,top:84.5,width:32,height:32},reading:{left:608.75,top:40.25,width:32,height:32}};
 const attrs=new Map([['aria-hidden','true']]),animations=[];
 const bar={inert:true,effect:null,removeAttribute(name){attrs.delete(name);},getAttribute(name){return attrs.get(name)??null;}};
 // Version B §S: the world command (#reset) shows in reading too, inert like the other commands.
 const trail={inert:reading},back={inert:reading},reset={inert:reading},summary={hidden:!reading,textContent:'France · 42 Paris'};
 function finalRect(){return {...(app.dataset.reading==='true'?layouts.reading:layouts.list)};}
 function translation(){return bar.effect?.translation||[0,0];}
 const anchor={getBoundingClientRect(){const rect=finalRect(),[x,y]=translation();return {...rect,left:rect.left+x,top:rect.top+y};}};
 if(animatable)bar.animate=(keyframes,options)=>{
  let resolve,reject,state='running';
  const finished=new Promise((yes,no)=>{resolve=yes;reject=no;});
  const first=vector(keyframes[0].translate),last=vector(keyframes.at(-1).translate);
  const animation={keyframes:structuredClone(keyframes),options:structuredClone(options),finished,cancelled:false,translation:first,
   sample(progress){if(state!=='running')return;this.translation=first.map((value,index)=>value+(last[index]-value)*progress);},
   finish(){if(state!=='running')return;state='finished';if(bar.effect===this)bar.effect=null;resolve();},
   cancel(){this.cancelled=true;if(bar.effect===this)bar.effect=null;if(state==='running'){state='cancelled';reject(new DOMException('Animation cancelled','AbortError'));}},
  };
  animations.push(animation);bar.effect=animation;return animation;
 };
 const oldWindow=globalThis.window,oldComputed=globalThis.getComputedStyle;
 globalThis.window=win;
 globalThis.getComputedStyle=element=>{assert.equal(element,bar);return {translate:bar.effect?translation().map(value=>value+'px').join(' '):'none'};};
 t.after(()=>{
  win.dispatchEvent(new Event('resize'));
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
  if(oldComputed===undefined)delete globalThis.getComputedStyle;else globalThis.getComputedStyle=oldComputed;
 });
 const controller=mountReadingScope({app,bar,anchor,trail,back,reset,summary,motion,...(fit?{fit}:{})});
 return {app,bar,anchor,trail,back,reset,summary,motion,layouts,animations,controller,finalRect,
  reduce(value=true){motion.matches=value;motion.dispatchEvent(new Event('change'));},
  resize(){win.dispatchEvent(new Event('resize'));},
 };
}
function assertReading(f){
 assert.equal(f.app.dataset.reading,'true');assert.equal(f.bar.inert,false);assert.equal(f.bar.getAttribute('aria-hidden'),null);
 assert.equal(f.trail.inert,true);assert.equal(f.back.inert,true);assert.equal(f.reset.inert,true);assert.equal(f.summary.hidden,false);
 assert.equal(f.summary.textContent,'France · 42 Paris');
}
function assertInteractive(f){
 assert.equal(f.app.dataset.reading,'false');assert.equal(f.bar.inert,false);assert.equal(f.bar.getAttribute('aria-hidden'),null);
 assert.equal(f.trail.inert,false);assert.equal(f.back.inert,false);assert.equal(f.reset.inert,false);assert.equal(f.summary.hidden,true);
}

test('reading locks only the commands while preserving a plain accessible context',t=>{
 const f=fixture(t);const before=f.anchor.getBoundingClientRect();f.controller.setReading(true);
 assertReading(f);assert.equal(f.animations.length,1);
 // The first displayed animation frame keeps the prior visible position.
 sameRect(f.anchor.getBoundingClientRect(),before);
 sameRect(f.controller.getAnchorRect(),f.layouts.reading);
});

test('returning to a list restores interactive commands and hides the reading summary',async t=>{
 const f=fixture(t,{reading:true});f.controller.setReading(false);assertInteractive(f);
 sameRect(f.controller.getAnchorRect(),f.layouts.list);
 f.animations.at(-1).finish();await settle();
 assertInteractive(f);sameRect(f.anchor.getBoundingClientRect(),f.layouts.list);assert.equal(f.bar.effect,null);
});

test('the globe destination stays at the final anchor throughout horizontal and vertical movement',t=>{
 const f=fixture(t);f.controller.setReading(true);const animation=f.animations.at(-1);
 for(const progress of [0,.1,.35,.7,1]){
  animation.sample(progress);sameRect(f.controller.getAnchorRect(),f.layouts.reading);
 }
 assertReading(f);
});

test('reversing an unfinished move starts from its displayed position without a jump',async t=>{
 const f=fixture(t);f.controller.setReading(true);const outward=f.animations.at(-1);
 outward.sample(.43);const visible=f.anchor.getBoundingClientRect();
 f.controller.setReading(false);const returning=f.animations.at(-1);
 assert.equal(outward.cancelled,true);assert.notEqual(returning,outward);assertInteractive(f);
 sameRect(f.anchor.getBoundingClientRect(),visible);sameRect(f.controller.getAnchorRect(),f.layouts.list);
 await settle();assert.equal(returning.cancelled,false);
 returning.finish();await settle();sameRect(f.anchor.getBoundingClientRect(),f.layouts.list);
});

test('a queued completion from an older move cannot cancel its replacement',async t=>{
 const f=fixture(t);f.controller.setReading(true);const old=f.animations.at(-1);old.finish();
 f.controller.setReading(false);const current=f.animations.at(-1);
 await settle();assert.equal(current.cancelled,false);assert.equal(f.bar.effect,current);
 assertInteractive(f);sameRect(f.controller.getAnchorRect(),f.layouts.list);
});

test('reapplying the same reading state cancels temporary movement without replaying it',async t=>{
 const f=fixture(t);f.controller.setReading(true);const old=f.animations.at(-1);old.sample(.3);
 f.controller.setReading(true);await settle();
 assert.equal(f.animations.length,1);assert.equal(old.cancelled,true);assert.equal(f.bar.effect,null);assertReading(f);
 sameRect(f.anchor.getBoundingClientRect(),f.layouts.reading);sameRect(f.controller.getAnchorRect(),f.layouts.reading);
});

test('reduced motion applies both states immediately without creating an animation',t=>{
 const f=fixture(t,{reduced:true});f.controller.setReading(true);assertReading(f);
 sameRect(f.anchor.getBoundingClientRect(),f.layouts.reading);sameRect(f.controller.getAnchorRect(),f.layouts.reading);
 f.controller.setReading(false);assertInteractive(f);sameRect(f.anchor.getBoundingClientRect(),f.layouts.list);
 assert.equal(f.animations.length,0);
});

test('enabling reduced motion mid-move reveals the final layout and keeps the reading lock',async t=>{
 const f=fixture(t);f.controller.setReading(true);const old=f.animations.at(-1);old.sample(.28);
 f.reduce();await settle();assert.equal(old.cancelled,true);assert.equal(f.bar.effect,null);assertReading(f);
 sameRect(f.anchor.getBoundingClientRect(),f.layouts.reading);sameRect(f.controller.getAnchorRect(),f.layouts.reading);
});

test('a later move can animate after reduced motion is disabled without an old rejection cancelling it',async t=>{
 const f=fixture(t);f.controller.setReading(true);f.reduce();f.reduce(false);f.controller.setReading(false);
 const current=f.animations.at(-1);await settle();assert.equal(f.animations.length,2);assert.equal(current.cancelled,false);
 assertInteractive(f);sameRect(f.controller.getAnchorRect(),f.layouts.list);
});

test('resize cancels the old visual offset and exposes the new final geometry',async t=>{
 const f=fixture(t);f.controller.setReading(true);const animation=f.animations.at(-1);animation.sample(.6);
 f.layouts.reading={left:160.125,top:65.5,width:28,height:28};f.resize();await settle();
 assert.equal(animation.cancelled,true);assert.equal(f.bar.effect,null);assertReading(f);
 sameRect(f.anchor.getBoundingClientRect(),f.layouts.reading);sameRect(f.controller.getAnchorRect(),f.layouts.reading);
});

test('browsers without Element.animate still get an accessible locked context and correct return state',t=>{
 const f=fixture(t,{animatable:false});f.controller.setReading(true);assertReading(f);
 sameRect(f.controller.getAnchorRect(),f.layouts.reading);
 f.controller.setReading(false);assertInteractive(f);sameRect(f.controller.getAnchorRect(),f.layouts.list);
 assert.equal(f.animations.length,0);
});

test('version B §T: the pill is fitted for the new form before its final place is read, so the move lands on it',t=>{
 const calls=[];let f;
 // Reading hides the chevron: the fitted pill is narrower and the centred bar puts the medallion 12 px further right.
 f=fixture(t,{fit(){calls.push({reading:f.app.dataset.reading,summary:f.summary.hidden});if(f.app.dataset.reading==='true')f.layouts.reading={...f.layouts.reading,left:620.75};}});
 const before=f.anchor.getBoundingClientRect();f.controller.setReading(true);
 assert.deepEqual(calls,[{reading:'true',summary:false}],'once, after the state change');
 const [first]=f.animations.at(-1).keyframes;
 assert.equal(first.translate,(before.left-620.75)+'px '+(before.top-f.layouts.reading.top)+'px','the move starts from the visible place towards the fitted one');
 sameRect(f.controller.getAnchorRect(),f.layouts.reading);
 f.controller.setReading(false);assert.equal(calls.length,2);assert.equal(calls[1].reading,'false');
});

test('version B §S: the world command shows while reading but, like the other commands, only shows; the list gives it back',t=>{
 const f=fixture(t);
 f.controller.setReading(true);assert.equal(f.reset.inert,true,'inert while reading');assert.equal(f.reset.hidden,undefined,'never hidden');
 f.controller.setReading(false);assert.equal(f.reset.inert,false,'a command again on the list');
 // Its click returns the filter to the world, as on the Explorer; while reading the whole bar ignores pointers.
 assert.match(readFileSync(new URL('../welcome.mjs',import.meta.url),'utf8'),/^byId\('reset'\)\.addEventListener\('click',\(\)=>resetScope\(\)\);$/m);
 assert.match(readFileSync(new URL('../globe-framing.css',import.meta.url),'utf8'),/:root \.app\[data-navigation=dock\]\[data-reading=true\] \.scope-bar \{\n top:40px;max-width:min\(460px,calc\(100vw - 560px\)\);pointer-events:none;\n\}/);
});
