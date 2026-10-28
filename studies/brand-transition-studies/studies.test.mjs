import test from 'node:test';
import assert from 'node:assert/strict';
import {studies,transitionFrame,mountStudyGallery} from './studies.mjs';
import {studies as initialStudies,transitionFrame as initialFrame} from './archive/initial-20261008/studies.mjs';

const newStudies=studies.slice(4);
function finite(value,key=''){
 if(typeof value==='number'){assert.ok(Number.isFinite(value),key);if(/opacity/i.test(key))assert.ok(value>=0&&value<=1,key);}
 else if(typeof value==='string')assert.doesNotMatch(value,/NaN|Infinity/,key);
 else if(value&&typeof value==='object')for(const [name,item]of Object.entries(value))finite(item,key+'.'+name);
}
function equivalent(left,right){
 if(typeof left==='number'){assert.ok(Math.abs(left-right)<1e-8,`${left} ≠ ${right}`);return;}
 if(typeof left==='string'){
  const numbers=/-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
  assert.equal(left.replace(numbers,'#'),right.replace(numbers,'#'));
  const a=left.match(numbers)||[],b=right.match(numbers)||[];assert.equal(a.length,b.length);a.forEach((value,index)=>equivalent(Number(value),Number(b[index])));return;
 }
 if(Array.isArray(left)){assert.equal(left.length,right.length);left.forEach((item,index)=>equivalent(item,right[index]));return;}
 if(left&&typeof left==='object'){assert.deepEqual(Object.keys(left),Object.keys(right));for(const key of Object.keys(left))equivalent(left[key],right[key]);return;}
 assert.equal(left,right);
}

test('the original four studies and every sampled frame are unchanged; six distinct proposals follow',()=>{
 assert.deepEqual(studies.slice(0,4),initialStudies);assert.equal(studies.length,10);assert.equal(new Set(studies.map(study=>study.id)).size,10);
 assert.deepEqual(newStudies.map(study=>study.number),['05','06','07','08','09','10']);
 for(const study of initialStudies)for(const forward of [false,true])for(let step=0;step<=100;step++){
  const options={forward,width:173.4,fromR:29.3,toR:58.7};assert.deepEqual(transitionFrame(study.id,step/100,options),initialFrame(study.id,step/100,options));
 }
});

test('all ten studies have finite frames and exact visible start/end states in both directions',()=>{
 for(const study of studies)for(const forward of [false,true]){
  for(let step=0;step<=100;step++)finite(transitionFrame(study.id,step/100,{forward,width:173.4}));
  const first=transitionFrame(study.id,0,{forward}),last=transitionFrame(study.id,1,{forward});
  assert.equal(first.sourceOpacity,1);assert.equal(first.targetOpacity,0);assert.equal(first.sourceY,0);assert.equal(first.sourceBlur,0);assert.equal(first.sourceClip,'none');
  assert.equal(last.sourceOpacity,0);assert.equal(last.targetOpacity,1);assert.equal(last.targetY,0);assert.equal(last.targetBlur,0);assert.equal(last.targetClip,'none');
  if(first.sourceGlyphs)assert.ok(first.sourceGlyphs.every(glyph=>glyph.opacity===1&&glyph.y===0));
  if(last.targetGlyphs)assert.ok(last.targetGlyphs.every(glyph=>glyph.opacity===1&&glyph.y===0));
 }
});

test('the six added studies can reverse at any sampled instant without moving either visible word',()=>{
 for(const study of newStudies)for(const progress of [0,.001,.08,.19,.3,.42,.499,.5,.501,.63,.77,.92,.999,1]){
  const normal=transitionFrame(study.id,progress,{forward:true,width:169.3}),reverse=transitionFrame(study.id,1-progress,{forward:false,width:169.3});
  for(const [key,value]of Object.entries(normal)){
   if(key.startsWith('source'))equivalent(value,reverse['target'+key.slice(6)]);
   if(key.startsWith('target'))equivalent(value,reverse['source'+key.slice(6)]);
  }
 }
});

test('central reveal partitions the word plane, and cascades never overlap two names',()=>{
 const width=170;
 for(let step=0;step<=100;step++){
  const iris=transitionFrame('iris',step/100,{width});
  const spans=[...iris.sourcePieces,...iris.targetPieces].map(piece=>{
   const [,right,,left]=piece.clip.match(/-?\d+(?:\.\d+)?/g).map(Number);
   return [Math.max(0,left),Math.min(width,width-right)];
  }).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);
  assert.equal(spans[0][0],0);assert.equal(spans.at(-1)[1],width);
  for(let index=1;index<spans.length;index++)equivalent(spans[index-1][1],spans[index][0]);
  const cascade=transitionFrame('cascade',step/100);
  if(cascade.targetGlyphs.some(glyph=>glyph.opacity>0))assert.ok(cascade.sourceGlyphs.every(glyph=>glyph.opacity===0));
 }
});

// Minimal DOM and animation clock exercise the real controls, not layout/rendering.
class Element extends EventTarget {
 constructor(tag='div',className=''){super();this.tagName=tag;this.className=className;this.children=[];this.dataset={};this.style={};this.attributes={};this.value='0';this._text='';}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=[...children];this._text='';}
 set textContent(value){this._text=value;this.children=[];}
 get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 cloneNode(deep){const clone=new Element(this.tagName,this.className);clone.dataset={...this.dataset};clone.attributes={...this.attributes};clone._text=this._text;if(deep)clone.children=this.children.map(child=>child.cloneNode(true));return clone;}
 querySelectorAll(selector){
  const matches=node=>selector.startsWith('.')?node.className.split(' ').includes(selector.slice(1)):selector.startsWith('[data-')?Object.hasOwn(node.dataset,selector.slice(6,-1).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())):node.tagName===selector;
  return this.children.flatMap(child=>[...(matches(child)?[child]:[]),...child.querySelectorAll(selector)]);
 }
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function harness(){
 const node=(tag,className,...children)=>{const element=new Element(tag,className);element.append(...children);return element;};
 const target=word=>{const button=node('button');button.dataset.target=word;return button;};
 const template=node('section','study',node('h2'),node('span','number'),node('p','study-description'),node('div','destinations',target('HORIZON'),target('AWARDS')),node('input'),node('output'),node('button','replay'),node('div','brand-demo',node('div','word-frame',node('span','word-source'),node('span','word-target'),node('span','shared-letter'),node('span','sweep-light'))),node('p','stage-route'),node('span','duration'));
 const doc=new EventTarget(),view=new EventTarget(),motion=new EventTarget(),queue=new Map();let nextFrame=1;
 const nodes=Object.fromEntries(['studies','announcement','motion-note','speed','theme-toggle'].map(id=>[id,node('div')]));nodes['study-template']={content:{firstElementChild:template}};
 const all=['HORIZON','AWARDS'].map(word=>{const button=node('button');button.dataset.allTarget=word;return button;});
 doc.defaultView=view;doc.hidden=false;doc.documentElement={dataset:{theme:'light'}};doc.getElementById=id=>nodes[id];doc.querySelectorAll=selector=>selector==='[data-all-target]'?all:[];
 doc.createElement=tag=>tag==='canvas'?{getContext:()=>({measureText:text=>({width:text.length*18})})}:node(tag);doc.createTextNode=text=>{const element=node('text');element.textContent=text;return element;};
 view.matchMedia=()=>motion;motion.matches=false;view.getComputedStyle=()=>({fontSize:'32px',letterSpacing:'-1.12px',fontWeight:'500',fontFamily:'Jost'});
 view.requestAnimationFrame=callback=>{const id=nextFrame++;queue.set(id,callback);return id;};view.cancelAnimationFrame=id=>queue.delete(id);
 const gallery=mountStudyGallery(doc);
 return {doc,view,motion,nodes,gallery,queue,all:word=>all.find(button=>button.dataset.allTarget===word),tick(time){const pending=[...queue.values()];queue.clear();pending.forEach(callback=>callback(time));}};
}
const click=node=>node.dispatchEvent(new Event('click'));

test('requesting HORIZON immediately after AWARDS cancels the pending start, including its first zero-progress frame',()=>{
 for(const anchorFirst of [false,true]){
  const h=harness();click(h.all('AWARDS'));if(anchorFirst)h.tick(0);click(h.all('HORIZON'));
  assert.equal(h.queue.size,0);h.tick(10000);
  assert.ok(h.nodes.studies.children.every(card=>card.dataset.word==='HORIZON'));
 }
});

test('mid-course reversal, speed change and replay all settle at the requested name',()=>{
 const h=harness();click(h.all('AWARDS'));h.tick(0);h.tick(330);
 assert.ok(h.nodes.studies.children.every(card=>card.dataset.phase==='transition'));
 click(h.all('HORIZON'));h.nodes.speed.value='1.5';h.nodes.speed.dispatchEvent(new Event('change'));h.tick(400);h.tick(3000);
 assert.ok(h.nodes.studies.children.every(card=>card.dataset.word==='HORIZON'));
 const last=h.nodes.studies.children.at(-1);click(last.querySelector('.replay'));assert.equal(last.dataset.word,'AWARDS');h.tick(3100);h.tick(5000);assert.equal(last.dataset.word,'HORIZON');
});

test('reduced motion and hidden tabs finish only active cards; sliders remain inspectable',()=>{
 const h=harness(),cards=h.nodes.studies.children;
 click(cards[4].querySelectorAll('[data-target]')[1]);h.tick(0);h.tick(150);h.motion.matches=true;h.motion.dispatchEvent(new Event('change'));
 assert.equal(cards[4].dataset.word,'AWARDS');assert.equal(cards[5].dataset.word,'HORIZON');assert.equal(h.queue.size,0);
 click(cards[5].querySelectorAll('[data-target]')[1]);assert.equal(cards[5].dataset.word,'AWARDS');assert.equal(h.queue.size,0);
 const slider=cards[8].querySelector('input');slider.value='42';slider.dispatchEvent(new Event('input'));assert.equal(slider.value,'42');assert.equal(cards[8].dataset.phase,'transition');
 h.motion.matches=false;click(cards[9].querySelectorAll('[data-target]')[1]);h.doc.hidden=true;h.doc.dispatchEvent(new Event('visibilitychange'));
 assert.equal(cards[9].dataset.word,'AWARDS');assert.equal(slider.value,'42');assert.equal(cards[0].dataset.word,'HORIZON');assert.equal(h.queue.size,0);
});
