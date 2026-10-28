import test from 'node:test';
import assert from 'node:assert/strict';
import {createContentTransitions} from '../content-transitions.mjs';

const settle=async()=>{await Promise.resolve();await Promise.resolve();};
const owned=['--cp-exit-left','--cp-exit-top','--cp-exit-width','--cp-exit-height'];

function fixture(t,{reduced=false}={}){
 const app={dataset:{}},properties=new Map([['--unrelated','retained']]),animations=[],events=[];
 const motion=new EventTarget();motion.matches=reduced;
 const sheet={
  opacity:'1',rect:{left:48,top:200,width:1100},
  style:{setProperty(name,value){properties.set(name,String(value));},removeProperty(name){const value=properties.get(name);properties.delete(name);return value;},getPropertyValue:name=>properties.get(name)||''},
  getBoundingClientRect(){events.push('measure');return {...this.rect};},
  animate(keyframes,options){
   let state='running',deferred;
   const animation={keyframes:structuredClone(keyframes),options:structuredClone(options),cancelled:false,
    get finished(){
     if(!deferred){
      let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
      deferred={promise,resolve,reject};
      if(state==='finished')resolve();else if(state==='cancelled')reject(new DOMException('Animation cancelled','AbortError'));
     }
     return deferred.promise;
    },
    finish(){if(state!=='running')return;state='finished';deferred?.resolve();},
    cancel(){
     events.push('cancel');animation.cancelled=true;
     sheet.opacity='1';sheet.rect={left:48,top:200,width:1100};
     if(state==='running'){state='cancelled';deferred?.reject(new DOMException('Animation cancelled','AbortError'));}
    },
   };
   animations.push(animation);events.push('animate');return animation;
  },
 };
 const previous=globalThis.getComputedStyle;
 globalThis.getComputedStyle=element=>{assert.equal(element,sheet);events.push('opacity');return {opacity:sheet.opacity};};
 t.after(()=>{if(previous===undefined)delete globalThis.getComputedStyle;else globalThis.getComputedStyle=previous;});
 const transitions=createContentTransitions({app,sheet,motion});
 return {app,sheet,motion,properties,animations,events,transitions,
  reduce(){motion.matches=true;motion.dispatchEvent(new Event('change'));},
 };
}
function assertClean(f){
 assert.notEqual(f.app.dataset.contentExiting,'true');
 for(const name of owned)assert.equal(f.sheet.style.getPropertyValue(name),'',name);
 assert.equal(f.sheet.style.getPropertyValue('--unrelated'),'retained');
}

test('an exit captures the visible rect and opacity before cancelling an entrance',async t=>{
 const f=fixture(t);f.transitions.enter();const entrance=f.animations.at(-1);
 f.sheet.rect={left:24,top:-425,width:342};f.sheet.opacity='0.42';
 const snapshot=f.transitions.captureExit();
 assert.deepEqual(snapshot,{rect:{left:24,top:-425,width:342},opacity:'0.42'});
 f.transitions.exit(snapshot);
 assert.equal(entrance.cancelled,true);
 assert.equal(f.sheet.style.getPropertyValue('--cp-exit-top'),'-425px');
 assert.equal(f.animations.at(-1).keyframes[0].opacity,'0.42');
 assert.ok(f.events.indexOf('measure')<f.events.indexOf('cancel'));
 assert.ok(f.events.indexOf('opacity')<f.events.indexOf('cancel'));
 f.transitions.cancel();await settle();assertClean(f);
});

test('enter uses the existing upward fade without leaving an exit overlay',async t=>{
 const f=fixture(t);f.transitions.enter();const animation=f.animations.at(-1);
 assert.equal(animation.keyframes[0].opacity,0);
 assert.equal(animation.keyframes.at(-1).opacity,1);
 assert.equal(animation.keyframes[0].transform,'translateY(10px)');
 assert.ok(['none','translateY(0px)','translateY(0)'].includes(animation.keyframes.at(-1).transform));
 assert.equal(animation.options.duration,360);
 assertClean(f);animation.finish();await settle();assertClean(f);
});

test('pinned identity sidebars keep their viewport during entry and exit fades',async t=>{
 const f=fixture(t);f.sheet.querySelector=()=>({dataset:{detailScroll:'sidebar'}});
 f.transitions.enter();assert.ok(f.animations.at(-1).keyframes.every(frame=>frame.transform==='none'));
 const snapshot=f.transitions.captureExit();assert.equal(snapshot.pinnedSidebar,true);
 f.transitions.exit(snapshot);assert.ok(f.animations.at(-1).keyframes.every(frame=>frame.transform==='none'));
 assert.equal(f.animations.at(-1).keyframes.at(-1).opacity,0);
 f.transitions.cancel();await settle();assertClean(f);
});

test('exit keeps a scrolled article in its viewport position while fading down',async t=>{
 const f=fixture(t);f.sheet.rect={left:48,top:-960,width:1240};f.sheet.opacity='0.78';
 const snapshot=f.transitions.captureExit();
 // Explorer's document can reset its scroll/layout after this capture.
 f.sheet.rect={left:0,top:0,width:1440};
 f.transitions.exit(snapshot);const animation=f.animations.at(-1);
 assert.equal(f.app.dataset.contentExiting,'true');
 assert.equal(f.sheet.style.getPropertyValue('--cp-exit-left'),'48px');
 assert.equal(f.sheet.style.getPropertyValue('--cp-exit-top'),'-960px');
 assert.equal(f.sheet.style.getPropertyValue('--cp-exit-width'),'1240px');
 assert.equal(animation.keyframes[0].opacity,'0.78');assert.equal(animation.keyframes.at(-1).opacity,0);
 assert.ok(['none','translateY(0px)','translateY(0)'].includes(animation.keyframes[0].transform));
 assert.equal(animation.keyframes.at(-1).transform,'translateY(10px)');
 assert.equal(animation.options.duration,360);
 animation.finish();await settle();assertClean(f);
});

test('exit retains the fixed height of split detail columns until the fade finishes',async t=>{
 const f=fixture(t);f.sheet.rect={left:410,top:128,width:1100,height:763};
 const snapshot=f.transitions.captureExit();f.transitions.exit(snapshot);
 assert.equal(f.sheet.style.getPropertyValue('--cp-exit-height'),'763px');
 f.animations.at(-1).finish();await settle();assertClean(f);
});

test('an interrupted exit cannot clean or cancel the following entrance',async t=>{
 const f=fixture(t);f.transitions.exit(f.transitions.captureExit());const exit=f.animations.at(-1);
 f.transitions.enter();const entrance=f.animations.at(-1);
 assert.equal(exit.cancelled,true);assert.notEqual(entrance,exit);
 await settle();assert.equal(entrance.cancelled,false);assertClean(f);
 entrance.finish();await settle();assertClean(f);
});

test('a queued finish from an old exit cannot remove a newer exit snapshot',async t=>{
 const f=fixture(t);f.transitions.exit(f.transitions.captureExit());const first=f.animations.at(-1);
 first.finish();
 f.transitions.exit({rect:{left:20,top:-300,width:350},opacity:'0.5'});const current=f.animations.at(-1);
 await settle();
 assert.equal(f.app.dataset.contentExiting,'true');
 assert.equal(f.sheet.style.getPropertyValue('--cp-exit-top'),'-300px');
 assert.equal(f.sheet.style.getPropertyValue('--cp-exit-width'),'350px');
 assert.equal(current.cancelled,false);
 current.finish();await settle();assertClean(f);
});

test('cancel restores the final layout immediately and is safe to repeat',async t=>{
 const f=fixture(t);f.transitions.exit(f.transitions.captureExit());const animation=f.animations.at(-1);
 f.transitions.cancel();assertClean(f);assert.equal(animation.cancelled,true);
 f.transitions.cancel();await settle();assertClean(f);
});

test('enabling reduced motion during an exit removes its temporary layout',async t=>{
 const f=fixture(t);f.transitions.exit(f.transitions.captureExit());const animation=f.animations.at(-1);
 f.reduce();assertClean(f);assert.equal(animation.cancelled,true);
 await settle();assertClean(f);
});

test('reduced motion starts no animation or temporary exit layout',t=>{
 const f=fixture(t,{reduced:true});assert.equal(f.transitions.captureExit(),null);
 f.transitions.enter();f.transitions.exit(null);
 assert.equal(f.animations.length,0);assertClean(f);
});
