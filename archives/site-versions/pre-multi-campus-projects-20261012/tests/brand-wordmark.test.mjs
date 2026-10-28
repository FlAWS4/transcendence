import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBrandWordmark,wordmarkGlyphs,WORDMARK_DURATION} from '../brand-wordmark.mjs';
import {transitionFrame} from '../../brand-transition-studies/studies.mjs';

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
