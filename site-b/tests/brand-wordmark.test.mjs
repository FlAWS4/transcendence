import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBrandWordmark,wordmarkGlyphs,WORDMARK_DURATION} from '../brand-wordmark.mjs';
// The entrance's arrival (26 Oct 2026, refinements §R), read from the namespace so that its tests fail one by one on a
// module without it.
import * as wordmark from '../brand-wordmark.mjs';
import {transitionFrame} from '../../studies/brand-transition-studies/studies.mjs';

class Target extends EventTarget{
 listeners=new Map();
 addEventListener(type,callback){super.addEventListener(type,callback);if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(callback);}
 removeEventListener(type,callback){super.removeEventListener(type,callback);this.listeners.get(type)?.delete(callback);}
 get listenerCount(){return [...this.listeners.values()].reduce((sum,set)=>sum+set.size,0);}
}
function harness({initial='HORIZON',reduced=false}={}){
 let now=0,nextFrame=0,fontSize=20,resolveFonts;
 const frames=new Map(),view=new Target(),doc=new Target(),motion=new Target();motion.matches=reduced;
 class Element extends Target{
  constructor(){super();this.children=[];this.dataset={};this.style={width:''};this.attributes={};this.ownerDocument=doc;this.text='';}
  get textContent(){return this.text+this.children.map(child=>child.textContent).join('');}
  set textContent(text){this.text=String(text);this.children=[];}
  append(child){child.parent=this;this.children.push(child);}
  replaceChildren(...children){this.text='';this.children=[];for(const child of children)this.append(child);}
  remove(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);}
  setAttribute(name,value){this.attributes[name]=String(value);}
  getAttribute(name){return this.attributes[name]??null;}
  removeAttribute(name){delete this.attributes[name];}
  closest(){return link;}
 }
 const context={font:'',measureText(text){const size=parseFloat(this.font.match(/([\d.]+)px/)[1]);return {width:[...text].reduce((sum,letter)=>sum+(letter==='W'?18:letter==='I'?5:10),0)*size/20};}};
 doc.createElement=tag=>tag==='canvas'?{getContext:()=>context}:new Element();doc.defaultView=view;doc.hidden=false;
 doc.fonts={ready:new Promise(resolve=>{resolveFonts=resolve;})};
 view.matchMedia=()=>motion;view.getComputedStyle=()=>({fontSize:fontSize+'px',fontWeight:'500',fontStyle:'normal',fontFamily:'Jost, sans-serif',letterSpacing:'-0.5px'});
 view.requestAnimationFrame=callback=>{frames.set(++nextFrame,callback);return nextFrame;};view.cancelAnimationFrame=id=>frames.delete(id);
 const link=new Element(),element=new Element();element.textContent=initial;element.setAttribute('aria-hidden','true');link.setAttribute('aria-label','42 Horizon');
 const controller=mountBrandWordmark({element,brandLink:link,motion});
 function advance(ms){now+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback(now));}
 function play(ms){while(ms>0){const step=Math.min(50,ms);advance(step);ms-=step;}}
 return {element,link,controller,frames,view,doc,motion,advance,play,resolveFonts,
  setReduced(value){motion.matches=value;motion.dispatchEvent(new Event('change'));},
  resize(size){fontSize=size;view.dispatchEvent(new Event('resize'));},
  hidden(value){doc.hidden=value;doc.dispatchEvent(new Event('visibilitychange'));},
 };
}

const pose=element=>element.children.map(cell=>({text:cell.textContent,opacity:cell.style.opacity,transform:cell.style.transform}));
const visible=element=>element.children.filter(cell=>Number(cell.style.opacity)>.5).map(cell=>cell.textContent).join('');
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-10,message||`${actual} ≠ ${expected}`);

test('the selected cascade exactly matches study08, keeping every letter literal in both directions',()=>{
 assert.equal(WORDMARK_DURATION,1250);
 for(let index=0;index<=200;index++){
  const progress=index/200,frame=transitionFrame('cascade',progress);
  for(const [word,key]of [['HORIZON','sourceGlyphs'],['AWARDS','targetGlyphs']]){
   const glyphs=wordmarkGlyphs(word,progress*WORDMARK_DURATION);
   assert.equal(glyphs.map(glyph=>glyph.character).join(''),word);
   glyphs.forEach((glyph,i)=>{near(glyph.opacity,frame[key][i].opacity);near(glyph.y,frame[key][i].y);});
  }
  const back=transitionFrame('cascade',1-progress,{forward:false});
  frame.sourceGlyphs.forEach((glyph,i)=>{near(glyph.opacity,back.targetGlyphs[i].opacity);near(glyph.y,back.targetGlyphs[i].y);});
 }
 assert.ok(wordmarkGlyphs('HORIZON',0).every(glyph=>glyph.opacity===1&&glyph.y===0));
 assert.ok(wordmarkGlyphs('AWARDS',WORDMARK_DURATION).every(glyph=>glyph.opacity===1&&glyph.y===0));
});

test('the word cascades into exact six and seven character endpoints, with natural measured widths',()=>{
 const h=harness(),startWidth=parseFloat(h.element.style.width);assert.equal(h.element.textContent,'HORIZON');
 assert.equal(h.controller.setAwards(true),true);assert.equal(h.link.getAttribute('aria-label'),'42 Awards');assert.equal(visible(h.element),'HORIZON');
 h.advance(0);h.play(250);
 assert.equal(h.element.dataset.wordmarkPhase,'switching');assert.equal(h.element.children.length,13);
 assert.ok(Number(h.element.children[0].style.opacity)<Number(h.element.children[6].style.opacity),'letters retire successively');
 assert.equal(h.element.children[6].textContent,'N');assert.equal(h.element.style.width,startWidth+'px');
 h.play(325);assert.equal(visible(h.element),'');const endWidth=parseFloat(h.element.style.width);
 assert.ok(endWidth>startWidth,'actual W width makes six letters wider in this fixture');
 h.play(175);assert.ok(visible(h.element).startsWith('A'));assert.equal(h.element.style.width,endWidth+'px');
 h.play(500);assert.equal(h.element.textContent,'AWARDS');assert.equal(h.element.children.length,6);assert.equal(h.frames.size,0);assert.equal(h.element.dataset.wordmarkPhase,'settled');
 h.controller.setAwards(false);h.advance(0);h.play(1250);
 assert.equal(h.element.textContent,'HORIZON');assert.equal(h.element.children.length,7);assert.equal(h.link.getAttribute('aria-label'),'42 Horizon');assert.equal(parseFloat(h.element.style.width),startWidth);
});

test('the outgoing N fades as a literal letter before AWARDS appears; the two words never overlap',()=>{
 const h=harness();h.controller.setAwards(true);h.advance(0);
 h.play(400);const retiring=h.element.children[6];assert.equal(retiring.textContent,'N');near(Number(retiring.style.opacity),.5);
 assert.equal(h.element.children.slice(7).some(cell=>Number(cell.style.opacity)>0),false);
 h.play(125);assert.equal(Number(h.element.children[6].style.opacity),0);
 h.play(725);assert.equal(h.element.textContent,'AWARDS');assert.equal(h.element.children.length,6);
 for(let ms=0;ms<=1250;ms++){
  const oldVisible=wordmarkGlyphs('HORIZON',ms).some(glyph=>glyph.opacity>0);
  const newVisible=wordmarkGlyphs('AWARDS',ms).some(glyph=>glyph.opacity>0);
  assert.ok(!(oldVisible&&newVisible),'no superposed words at '+ms+'ms');
 }
});

test('inverting halfway retraces the existing cascade without changing any visible pose',()=>{
 const h=harness();h.controller.setAwards(true);h.advance(0);h.play(300);
 const earlier=pose(h.element);h.play(350);const prior=pose(h.element),width=h.element.style.width;
 h.controller.setAwards(false);assert.deepEqual(pose(h.element),prior);assert.equal(h.element.style.width,width);
 h.advance(0);h.play(350);
 pose(h.element).forEach((cell,index)=>{
  assert.equal(cell.text,earlier[index].text);near(Number(cell.opacity),Number(earlier[index].opacity));
  const parts=cell.transform.match(/-?[\d.]+/g).map(Number),before=earlier[index].transform.match(/-?[\d.]+/g).map(Number);
  parts.forEach((number,i)=>near(number,before[i]));
 });
 h.play(300);assert.equal(h.element.textContent,'HORIZON');assert.equal(h.frames.size,0);
});

test('immediate and rapid reversals cancel stale frames and honor the latest request without restarting repeated targets',()=>{
 for(const firstFrame of [false,true]){
  const h=harness();h.controller.setAwards(true);if(firstFrame)h.advance(0);
  const stale=[...h.frames.values()][0];h.controller.setAwards(false);
  assert.equal(h.frames.size,0);assert.equal(h.element.textContent,'HORIZON');stale(99999);assert.equal(h.element.textContent,'HORIZON');
 }
 const h=harness();h.controller.setAwards(true);h.advance(0);h.play(450);
 const prior=pose(h.element),stale=[...h.frames.values()][0];
 h.controller.setAwards(false);assert.deepEqual(pose(h.element),prior);assert.equal(h.frames.size,1);
 stale(99999);assert.deepEqual(pose(h.element),prior,'a cancelled callback cannot commit its old target');
 h.advance(0);h.play(200);h.controller.setAwards(true);h.advance(0);h.play(300);
 assert.equal(h.controller.setAwards(true),false);h.play(700);
 assert.equal(h.element.textContent,'AWARDS');assert.equal(h.link.getAttribute('aria-label'),'42 Awards');assert.equal(h.frames.size,0);
 assert.equal(h.controller.setAwards(true),false);assert.equal(h.frames.size,0);
});

test('direct-route setup, reduced motion and visibility changes finish immediately without pending frames',()=>{
 const h=harness();h.controller.setAwards(true,{animate:false});assert.equal(h.element.textContent,'AWARDS');assert.equal(h.frames.size,0);
 h.setReduced(true);h.controller.setAwards(false);assert.equal(h.element.textContent,'HORIZON');assert.equal(h.frames.size,0);
 h.setReduced(false);h.controller.setAwards(true);h.advance(0);h.play(200);h.setReduced(true);
 assert.equal(h.element.textContent,'AWARDS');assert.equal(h.frames.size,0);
 h.setReduced(false);h.controller.setAwards(false);h.hidden(true);assert.equal(h.element.textContent,'HORIZON');assert.equal(h.frames.size,0);
 h.controller.setAwards(true);assert.equal(h.element.textContent,'AWARDS');assert.equal(h.frames.size,0);
 const direct=harness({initial:'AWARDS',reduced:true});assert.equal(direct.element.textContent,'AWARDS');assert.equal(direct.link.getAttribute('aria-label'),'42 Awards');
});

test('responsive metrics and late fonts preserve progress; destroy cancels all work and leaves a readable word',async()=>{
 const h=harness();h.controller.setAwards(true);h.advance(0);h.play(800);
 const width=parseFloat(h.element.style.width),opacities=h.element.children.map(cell=>cell.style.opacity);
 h.resize(30);assert.ok(parseFloat(h.element.style.width)>width);assert.equal(h.element.dataset.wordmarkPhase,'switching');assert.equal(h.frames.size,1);
 assert.deepEqual(h.element.children.map(cell=>cell.style.opacity),opacities);
 h.resolveFonts();await Promise.resolve();assert.deepEqual(h.element.children.map(cell=>cell.style.opacity),opacities);
 h.play(450);assert.equal(h.element.textContent,'AWARDS');
 h.controller.setAwards(false);h.advance(0);h.play(100);const stale=[...h.frames.values()][0];h.controller.destroy();
 assert.equal(h.element.textContent,'HORIZON');assert.equal(h.element.children.length,0);assert.equal(h.element.style.width,'');assert.equal(h.frames.size,0);
 assert.equal(h.view.listenerCount,0);assert.equal(h.doc.listenerCount,0);assert.equal(h.motion.listenerCount,0);assert.deepEqual(h.element.dataset,{});
 assert.equal(h.element.getAttribute('aria-hidden'),'true');assert.equal(h.link.getAttribute('aria-label'),'42 Horizon');
 stale(99999);h.controller.setAwards(true);h.resize(40);h.advance(5000);assert.equal(h.element.textContent,'HORIZON');assert.equal(h.frames.size,0);
 const late=harness();late.controller.destroy();late.resolveFonts();await Promise.resolve();assert.equal(late.element.children.length,0);assert.equal(late.frames.size,0);
});

/* ---- 26 Oct 2026 refinements: HORIZON arrives as AWARDS does (§R) ---------------------------------------------------- */
// The incoming letters of study 08 (AWARDS's in the cascade), for any word: at canonical time t, the letter at position
// p (0 … 1 along the word) is smooth((t / 1250 − .46 − .26 p) / .24) shown, rising from .26 em below.
const incoming=(word,time)=>Array.from(word,(character,index)=>{const p=index/Math.max(1,word.length-1),x=Math.max(0,Math.min(1,(time/1250-.46-.26*p)/.24)),a=x*x*(3-2*x);return {character,opacity:a,y:.26*(1-a)};});
const nearPose=(actual,expected,message)=>{assert.equal(actual.length,expected.length,message);actual.forEach((glyph,index)=>{assert.equal(glyph.character,expected[index].character,message);near(glyph.opacity,expected[index].opacity,message+' opacity '+index);near(glyph.y,expected[index].y,message+' y '+index);});};

test('the arrival poses (§R): any word can take the incoming part of the cascade, AWARDS\'s own; two arguments keep the HORIZON ↔ AWARDS timeline as it was',()=>{
 assert.equal(wordmark.WORDMARK_ARRIVAL,675,'the incoming part of the timeline: from 46 % (575 ms) to its end');
 for(let time=0;time<=1250;time+=5){
  nearPose(wordmarkGlyphs('HORIZON',time,true),incoming('HORIZON',time),'HORIZON at '+time);
  nearPose(wordmarkGlyphs('AWARDS',time,true),wordmarkGlyphs('AWARDS',time),'AWARDS at '+time);
  // Unchanged without the third argument: HORIZON leaves, AWARDS comes in (the cascade test above pins study 08).
  assert.deepEqual(wordmarkGlyphs('HORIZON',time,false),wordmarkGlyphs('HORIZON',time));
 }
 assert.ok(wordmarkGlyphs('HORIZON',575,true).every(glyph=>glyph.opacity===0&&glyph.y===.26),'an empty word at the start');
 assert.ok(wordmarkGlyphs('HORIZON',1200,true).every(glyph=>glyph.opacity===1&&glyph.y===0),'the whole word by 96 %');
});

test('arrive() brings HORIZON in from an empty word, letter after letter as AWARDS comes in, at its own width, in 675 ms; it ends exactly as the word at rest',()=>{
 const h=harness(),width=h.element.style.width,rest=pose(h.element);
 assert.equal(h.controller.arrive(),675);
 // At once, before a frame: every letter transparent and low; the header keeps HORIZON's width; the name stays.
 assert.equal(h.element.dataset.wordmarkPhase,'arriving');assert.equal(h.element.children.length,7);assert.equal(visible(h.element),'');
 assert.ok(h.element.children.every(cell=>cell.style.opacity==='0'),'empty');assert.equal(h.element.style.width,width);
 assert.equal(h.link.getAttribute('aria-label'),'42 Horizon');assert.equal(h.element.dataset.wordmarkTarget,'HORIZON');
 h.advance(0);let previous=-1,frames=0;
 for(let elapsed=0;elapsed<675;elapsed+=25){
  const poses=h.element.children.map(cell=>({opacity:Number(cell.style.opacity),y:Number(cell.style.transform.match(/,\s*(-?[\d.e-]+)em/)[1])}));
  nearPose(poses.map((glyph,index)=>({...glyph,character:'HORIZON'[index]})),incoming('HORIZON',575+elapsed),'at '+elapsed+' ms');
  // In reading order: no letter ahead of the one before it.
  poses.forEach((glyph,index)=>{if(index)assert.ok(glyph.opacity<=poses[index-1].opacity+1e-12,'at '+elapsed+' ms, letter '+index);});
  const shown=poses.filter(glyph=>glyph.opacity>.5).length;assert.ok(shown>=previous);previous=shown;
  assert.equal(h.element.style.width,width,'never resized');frames++;
  h.play(25);
 }
 assert.ok(frames>=27);h.play(50);
 assert.equal(h.element.dataset.wordmarkPhase,'settled');assert.equal(h.frames.size,0);assert.equal(h.element.textContent,'HORIZON');
 assert.deepEqual(pose(h.element),rest,'exactly the word at rest');assert.equal(h.element.style.width,width);
});

test('arrive() shows the word at once under reduced motion or on a hidden page; AWARDS arrives as it does in the cascade; the cascade and the arrival interrupt each other cleanly; destroy cancels it',()=>{
 const r=harness({reduced:true}),rest=pose(r.element);assert.equal(r.controller.arrive(),0);assert.equal(r.frames.size,0);assert.deepEqual(pose(r.element),rest);assert.equal(r.element.dataset.wordmarkPhase,'settled');
 const hidden=harness();hidden.hidden(true);assert.equal(hidden.controller.arrive(),0);assert.equal(hidden.frames.size,0);assert.equal(visible(hidden.element),'HORIZON');
 // AWARDS (a deep link to the Awards): its own incoming letters.
 const a=harness({initial:'AWARDS'});assert.equal(a.controller.arrive(),675);a.advance(0);a.play(300);
 nearPose(a.element.children.map((cell,index)=>({character:'AWARDS'[index],opacity:Number(cell.style.opacity),y:Number(cell.style.transform.match(/,\s*(-?[\d.e-]+)em/)[1])})),wordmarkGlyphs('AWARDS',875),'AWARDS 300 ms in');
 a.play(400);assert.equal(a.element.textContent,'AWARDS');assert.equal(a.frames.size,0);
 // The same word asked during the arrival (the route applied as the entrance opens) leaves it running.
 const s=harness();s.controller.arrive();s.advance(0);s.play(200);const mid=pose(s.element);
 assert.equal(s.controller.setAwards(false),false);assert.deepEqual(pose(s.element),mid);assert.equal(s.frames.size,1);assert.equal(s.element.dataset.wordmarkPhase,'arriving');
 // Another word: the cascade to AWARDS from the word as if arrived, never both motions at once.
 assert.equal(s.controller.setAwards(true),true);assert.equal(s.element.dataset.wordmarkPhase,'switching');assert.equal(s.frames.size,1);
 s.advance(0);s.play(1250);assert.equal(s.element.textContent,'AWARDS');assert.equal(s.frames.size,0);
 // A resize during the arrival keeps its progress; reduced motion turned on, or destroy, ends it.
 const z=harness();z.controller.arrive();z.advance(0);z.play(300);const opacities=z.element.children.map(cell=>cell.style.opacity);
 z.resize(30);assert.deepEqual(z.element.children.map(cell=>cell.style.opacity),opacities);assert.equal(z.element.dataset.wordmarkPhase,'arriving');
 z.setReduced(true);assert.equal(z.element.dataset.wordmarkPhase,'settled');assert.equal(visible(z.element),'HORIZON');assert.equal(z.frames.size,0);
 const d=harness();d.controller.arrive();d.advance(0);d.play(100);const stale=[...d.frames.values()][0];d.controller.destroy();
 assert.equal(d.frames.size,0);assert.equal(d.element.textContent,'HORIZON');stale(99999);assert.equal(d.element.children.length,0);
 assert.equal(d.controller.arrive(),0,'nothing after destroy');
});
