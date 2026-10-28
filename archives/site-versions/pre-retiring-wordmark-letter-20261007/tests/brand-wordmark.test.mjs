import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBrandWordmark,wordmarkGlyphs,WORDMARK_DURATION} from '../brand-wordmark.mjs';
import {resolutionOrder} from '../../decryption-examples/scanner-return-together.mjs';
import {ALPHABET,encrypt} from '../../horizon-decryption-engine.mjs';

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

test('glyphs reuse the entrance alphabet and seed42 order, with simultaneous starts and staggered random stops',()=>{
 for(const word of ['HORIZON','AWARDS']){
  assert.equal(wordmarkGlyphs(word,0).map(glyph=>glyph.character).join(''),encrypt(word));
  assert.ok(wordmarkGlyphs(word,500).every(glyph=>!glyph.settled&&ALPHABET.includes(glyph.character)));
  const order=resolutionOrder(word,'random');assert.notDeepEqual(order,[...word].map((_,index)=>index));
  order.forEach((index,rank)=>{
   const time=1100+rank/(word.length-1)*500;
   assert.equal(wordmarkGlyphs(word,time-.01)[index].settled,false);
   assert.equal(wordmarkGlyphs(word,time)[index].settled,true);
  });
  assert.equal(wordmarkGlyphs(word,WORDMARK_DURATION).map(glyph=>glyph.character).join(''),word);
 }
});

test('word changes visibly through cipher states and interpolates measured width to exact six and seven letter endpoints',()=>{
 const h=harness(),startWidth=parseFloat(h.element.style.width);assert.equal(h.element.textContent,'HORIZON');
 assert.equal(h.controller.setAwards(true),true);assert.equal(h.link.getAttribute('aria-label'),'42 Awards');assert.equal(h.element.textContent,'HORIZON');
 h.advance(0);h.play(800);
 assert.notEqual(h.element.textContent,'HORIZON');assert.notEqual(h.element.textContent,'AWARDS');
 assert.equal(h.element.dataset.wordmarkPhase,'switching');assert.ok(h.element.children.some(cell=>cell.dataset.active==='true'));
 assert.ok(h.element.children.some(cell=>/scaleX\(0\./.test(cell.style.transform)),'wide cipher glyphs fit narrower source cells');
 const middleWidth=parseFloat(h.element.style.width);h.play(800);
 assert.equal(h.element.textContent,'AWARDS');assert.equal(h.element.children.length,6);assert.equal(h.frames.size,0);assert.equal(h.element.dataset.wordmarkPhase,'settled');
 const endWidth=parseFloat(h.element.style.width);assert.ok(middleWidth>startWidth&&middleWidth<endWidth,'actual W width makes six letters wider in this fixture');
 h.controller.setAwards(false);h.advance(0);h.play(1600);
 assert.equal(h.element.textContent,'HORIZON');assert.equal(h.element.children.length,7);assert.equal(h.link.getAttribute('aria-label'),'42 Horizon');assert.equal(parseFloat(h.element.style.width),startWidth);
});

test('rapid reversals preserve the current frame, cancel stale work and settle only the latest target',()=>{
 const h=harness();h.controller.setAwards(true);h.advance(0);h.play(450);
 const prior={text:h.element.textContent,width:h.element.style.width},stale=[...h.frames.values()][0];
 h.controller.setAwards(false);assert.equal(h.element.textContent,prior.text);assert.equal(h.element.style.width,prior.width);assert.equal(h.frames.size,1);
 stale(99999);assert.equal(h.element.textContent,prior.text,'a cancelled callback cannot commit its old target');
 h.advance(0);h.play(200);h.controller.setAwards(true);h.advance(0);h.play(1600);
 assert.equal(h.element.textContent,'AWARDS');assert.equal(h.link.getAttribute('aria-label'),'42 Awards');assert.equal(h.frames.size,0);
 assert.equal(h.controller.setAwards(true),false);assert.equal(h.frames.size,0,'same-target refresh does not restart the transition');
});

test('direct-route setup, reduced motion and visibility changes finish immediately without pending frames',()=>{
 const h=harness();h.controller.setAwards(true,{animate:false});assert.equal(h.element.textContent,'AWARDS');assert.equal(h.frames.size,0);
 h.setReduced(true);h.controller.setAwards(false);assert.equal(h.element.textContent,'HORIZON');assert.equal(h.frames.size,0);
 h.setReduced(false);h.controller.setAwards(true);h.advance(0);h.play(200);h.setReduced(true);
 assert.equal(h.element.textContent,'AWARDS');assert.equal(h.frames.size,0);
 h.setReduced(false);h.controller.setAwards(false);h.hidden(true);assert.equal(h.element.textContent,'HORIZON');assert.equal(h.frames.size,0);
 const direct=harness({initial:'AWARDS',reduced:true});assert.equal(direct.element.textContent,'AWARDS');assert.equal(direct.link.getAttribute('aria-label'),'42 Awards');
});

test('responsive metrics refresh without restarting the sequence; destroy removes frames and listeners and keeps a readable final word',async()=>{
 const h=harness();h.controller.setAwards(true);h.advance(0);h.play(600);
 const width=parseFloat(h.element.style.width);h.resize(30);assert.ok(parseFloat(h.element.style.width)>width);assert.equal(h.element.dataset.wordmarkPhase,'switching');assert.equal(h.frames.size,1);
 h.play(1000);assert.equal(h.element.textContent,'AWARDS');
 h.controller.setAwards(false);h.advance(0);h.play(100);h.controller.destroy();
 assert.equal(h.element.textContent,'HORIZON');assert.equal(h.element.children.length,0);assert.equal(h.element.style.width,'');assert.equal(h.frames.size,0);
 assert.equal(h.view.listenerCount,0);assert.equal(h.doc.listenerCount,0);assert.equal(h.motion.listenerCount,0);assert.deepEqual(h.element.dataset,{});
 assert.equal(h.element.getAttribute('aria-hidden'),'true');assert.equal(h.link.getAttribute('aria-label'),'42 Horizon');
 h.resolveFonts();await Promise.resolve();h.controller.setAwards(true);h.resize(40);h.advance(5000);
 assert.equal(h.element.textContent,'HORIZON');assert.equal(h.frames.size,0);
});
