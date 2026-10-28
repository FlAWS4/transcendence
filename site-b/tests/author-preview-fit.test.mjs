import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthorPreviewFit,authorPreviewNeedsCollapse} from '../author-preview-fit.mjs';

const dataName=name=>'data-'+String(name).replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());
class Element{
 constructor(tag,doc){
  this.tagName=tag;this.ownerDocument=doc;this.children=[];this.attributes=new Map();
  this.dataset=new Proxy({}, {get:(_,name)=>this.getAttribute(dataName(name))??undefined,set:(_,name,value)=>{this.setAttribute(dataName(name),value);return true;}});
  this.classList={contains:name=>this.className.split(' ').includes(name),add:name=>{if(!this.classList.contains(name))this.className=(this.className+' '+name).trim();}};
  const styles=new Map();this.style={setProperty:(name,value,priority)=>styles.set(name,{value,priority}),getPropertyValue:name=>styles.get(name)?.value};
 }
 set className(value){this.setAttribute('class',value);}get className(){return this.getAttribute('class')||'';}
 setAttribute(name,value){this.attributes.set(name,String(value));this.ownerDocument?.writes?.push({node:this,name,value:String(value)});}
 getAttribute(name){return this.attributes.get(name)??null;}removeAttribute(name){this.attributes.delete(name);}
 append(...nodes){for(const node of nodes){node.remove();this.children.push(node);node.parentNode=this;}}
 remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;}}
 contains(node){return this===node||this.children.some(child=>child.contains(node));}
 get isConnected(){return this===this.ownerDocument.body||Boolean(this.parentNode?.isConnected);}
 matches(selector){
  if(selector.includes(','))return selector.split(',').some(part=>this.matches(part.trim()));
  if(selector==='*')return true;
  const tag=selector.match(/^[\w-]+/)?.[0];if(tag&&tag!==this.tagName)return false;
  for(const match of selector.matchAll(/\.([\w-]+)/g))if(!this.classList.contains(match[1]))return false;
  for(const match of selector.matchAll(/\[([\w-]+)(?:="?([^"\]]+)"?)?\]/g)){
   const value=this.getAttribute(match[1]);if(value===null||match[2]!==undefined&&value!==match[2])return false;
  }
  return true;
 }
 closest(selector){return this.matches(selector)?this:this.parentNode?.closest(selector)||null;}
 querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 cloneNode(deep=false){const clone=new Element(this.tagName,this.ownerDocument);for(const [key,value]of this.attributes)clone.setAttribute(key,value);if(deep)clone.append(...this.children.map(child=>child.cloneNode(true)));return clone;}
 getBoundingClientRect(){
  const root=this.closest('.cp-authors'),measure=this.ownerDocument.geometry.get(root?.dataset.key);
  const width=measure?(root.classList.contains('cp-author-fit-probe')?measure.required:measure.available):0;
  this.ownerDocument.reads++;return {width,height:40,left:0,right:width,top:0,bottom:40};
 }
 focus(options){if(this.isConnected){this.ownerDocument.activeElement=this;this.focusOptions=options;}}
}

function fixture({signal}={}){
 const doc={writes:[],reads:0,geometry:new Map()},view=new EventTarget(),frames=new Map();let frameId=0,resolveFonts;
 view.requestAnimationFrame=callback=>{const id=++frameId;frames.set(id,callback);return id;};view.cancelAnimationFrame=id=>frames.delete(id);
 const observers=[];
 view.ResizeObserver=class{
  constructor(callback){this.callback=callback;this.targets=new Set();this.disconnectCount=0;observers.push(this);}
  observe(node){this.targets.add(node);}unobserve(node){this.targets.delete(node);}disconnect(){this.targets.clear();this.disconnectCount++;}
  fire(node,width){this.callback([{target:node,contentRect:{width,height:40}}]);}
 };
 doc.defaultView=view;doc.fonts=new EventTarget();doc.fonts.ready=new Promise(resolve=>{resolveFonts=resolve;});
 doc.body=new Element('body',doc);doc.activeElement=doc.body;
 const container=new Element('section',doc);doc.body.append(container);
 const add=({key='one',available=300,required=220,total=2,compact=true,route=true,overflow='true',rtl=false}={})=>{
  const card=new Element('article',doc),root=new Element('div',doc),list=new Element('ul',doc);root.className='cp-authors';root.dataset.key=key;root.dataset.compact=String(compact);root.dataset.collapsible=String(compact&&route&&total>1);root.dataset.overflow=overflow;
  root.setAttribute('id','authors-'+key);if(rtl)root.setAttribute('dir','rtl');list.className='cp-author-list';list.setAttribute('id','author-list-'+key);
  const people=Array.from({length:compact&&route?Math.min(total,2):total},(_,index)=>{
   const item=new Element('li',doc),link=new Element('a',doc);item.className='cp-author-item';if(index===1&&compact&&route)item.dataset.secondary='true';link.className='cp-author-link';link.setAttribute('href','#people/'+key+'-'+index);link.setAttribute('id','author-'+key+'-'+index);item.append(link);list.append(item);return {item,link};
  });
  let more,moreItem;
  if(compact&&route&&total>1){moreItem=new Element('li',doc);moreItem.className='cp-author-item cp-author-more-item';moreItem.dataset.narrowOnly=String(total===2);more=new Element('a',doc);more.className='cp-author-more';more.setAttribute('href','#projects/'+key+'?tab=team');moreItem.append(more);list.append(moreItem);}
  root.append(list);card.append(root);container.append(card);doc.geometry.set(key,{available,required});return {root,list,card,people,more,moreItem,key};
 };
 const api=createAuthorPreviewFit({container,signal});
 const flush=()=>{const pending=[...frames.values()];frames.clear();for(const callback of pending)callback();};
 return {doc,view,container,api,add,frames,flush,resolveFonts,observer:observers[0],probes:()=>container.querySelectorAll('.cp-author-fit-probe')};
}

test('each card is measured against a full-width invisible probe, independently of the viewport and current collapse',()=>{
 const f=fixture(),wide=f.add({key:'wide',available:280,required:230}),narrow=f.add({key:'narrow',available:190,required:230,rtl:true});
 f.doc.writes=[];f.api.sync();
 assert.equal(wide.root.dataset.overflow,'false');assert.equal(narrow.root.dataset.overflow,'true');assert.equal(f.observer.targets.size,2);assert.equal(f.probes().length,2);
 assert.ok(!f.doc.writes.some(write=>write.node===narrow.root&&write.name==='data-overflow'&&write.value==='false'));
 for(const probe of f.probes()){
  assert.equal(probe.dataset.overflow,'false');assert.equal(probe.getAttribute('aria-hidden'),'true');assert.equal(probe.inert,true);
  assert.equal(probe.style.getPropertyValue('inline-size'),'0');assert.equal(probe.style.getPropertyValue('block-size'),'0');assert.equal(probe.style.getPropertyValue('overflow'),'hidden');
  const list=probe.querySelector('.cp-author-list');assert.equal(list.style.getPropertyValue('inline-size'),'max-content');assert.equal(list.style.getPropertyValue('flex-wrap'),'nowrap');
  assert.ok(list.children.every(item=>item.style.getPropertyValue('flex')==='0 0 auto'));
  assert.equal(probe.querySelectorAll('[id]').length,0);assert.equal(probe.getAttribute('id'),null);
  for(const link of probe.querySelectorAll('a')){assert.equal(link.getAttribute('href'),null);assert.equal(link.getAttribute('tabindex'),'-1');}
 }
 assert.equal(f.probes().find(probe=>probe.dataset.key==='narrow').getAttribute('dir'),'rtl');f.api.destroy();
});

test('the normal extra-author counter remains in the measurement, while solo, full and unroutable lists are untouched',()=>{
 const f=fixture(),pair=f.add({key:'pair',available:240,required:220,total:2}),team=f.add({key:'team',available:240,required:276,total:5});
 const ignored=[f.add({key:'solo',total:1}),f.add({key:'full',total:50,compact:false}),f.add({key:'unroutable',total:5,route:false})];
 f.api.sync();assert.equal(pair.root.dataset.overflow,'false');assert.equal(team.root.dataset.overflow,'true');assert.equal(f.probes().length,2);
 assert.equal(f.probes().find(probe=>probe.dataset.key==='pair').querySelector('.cp-author-more-item').dataset.narrowOnly,'true');
 assert.equal(f.probes().find(probe=>probe.dataset.key==='team').querySelector('.cp-author-more-item').dataset.narrowOnly,'false');
 for(const {root,list}of ignored){assert.equal(root.dataset.overflow,'true');assert.equal(f.observer.targets.has(list),false);}f.api.destroy();
});

test('resizing moves focus from the disappearing second author to +N, then from disappearing +1 back to that author',()=>{
 const f=fixture(),card=f.add({available:280,required:230});f.api.sync();card.people[1].link.focus();
 f.doc.geometry.get(card.key).available=200;f.observer.fire(card.list,200);
 assert.equal(card.root.dataset.overflow,'true');assert.equal(f.doc.activeElement,card.more);assert.deepEqual(card.more.focusOptions,{preventScroll:true});
 f.doc.geometry.get(card.key).available=280;f.observer.fire(card.list,280);
 assert.equal(card.root.dataset.overflow,'false');assert.equal(f.doc.activeElement,card.people[1].link);assert.equal(f.frames.size,0);
 const team=f.add({key:'team',total:5,available:200,required:280});f.api.sync();team.more.focus();f.doc.geometry.get(team.key).available=320;f.observer.fire(team.list,320);
 assert.equal(team.root.dataset.overflow,'false');assert.equal(f.doc.activeElement,team.more);f.api.destroy();
});

test('font completion and viewport changes remeasure intrinsic width once per scheduled frame',async()=>{
 const f=fixture(),card=f.add({available:250,required:220});f.api.sync();assert.equal(card.root.dataset.overflow,'false');
 f.doc.geometry.get(card.key).required=290;f.doc.fonts.dispatchEvent(new Event('loadingdone'));f.view.dispatchEvent(new Event('resize'));f.view.dispatchEvent(new Event('resize'));
 assert.equal(f.frames.size,1);f.flush();assert.equal(card.root.dataset.overflow,'true');
 f.doc.geometry.get(card.key).required=210;f.resolveFonts();await Promise.resolve();assert.equal(f.frames.size,1);f.flush();assert.equal(card.root.dataset.overflow,'false');
 const reads=f.doc.reads;f.observer.fire(card.list,250);const afterFirst=f.doc.reads;f.observer.fire(card.list,250);assert.ok(afterFirst>reads);assert.equal(f.doc.reads,afterFirst);f.api.destroy();
});

test('subpixel tolerance ignores noise without losing the accumulation of successive width changes',()=>{
 assert.equal(authorPreviewNeedsCollapse(200,200.5),false);assert.equal(authorPreviewNeedsCollapse(200,200.6),true);assert.equal(authorPreviewNeedsCollapse(NaN,200),false);
 const f=fixture(),card=f.add({available:250,required:250.1});f.api.sync();f.observer.fire(card.list,250);
 f.doc.geometry.get(card.key).available=249.7;f.observer.fire(card.list,249.7);assert.equal(card.root.dataset.overflow,'false');
 f.doc.geometry.get(card.key).available=249.4;f.observer.fire(card.list,249.4);assert.equal(card.root.dataset.overflow,'true');f.api.destroy();
});

test('sync replaces stale probes and releases removed cards; hidden cards wait for useful geometry',()=>{
 const f=fixture(),old=f.add({available:0,required:220});f.api.sync();assert.equal(old.root.dataset.overflow,'true');
 f.doc.geometry.get(old.key).available=280;f.observer.fire(old.list,280);assert.equal(old.root.dataset.overflow,'false');
 const previousProbe=f.probes()[0];f.api.sync();assert.equal(f.probes().length,1);assert.notEqual(f.probes()[0],previousProbe);assert.equal(previousProbe.isConnected,false);
 old.card.remove();const next=f.add({key:'next',available:200,required:240});f.api.sync();assert.equal(f.observer.targets.has(old.list),false);assert.equal(old.root.dataset.overflow,'true');assert.equal(f.probes().length,1);assert.equal(next.root.dataset.overflow,'true');f.api.destroy();
});

test('abort destroys probes, observers and scheduled work, and late font completion cannot revive the controller',async()=>{
 const controller=new AbortController(),f=fixture({signal:controller.signal}),card=f.add({available:280,required:220});f.api.sync();assert.equal(card.root.dataset.overflow,'false');
 f.view.dispatchEvent(new Event('resize'));assert.equal(f.frames.size,1);controller.abort();
 assert.equal(f.frames.size,0);assert.equal(f.probes().length,0);assert.equal(f.observer.targets.size,0);assert.equal(f.observer.disconnectCount,1);assert.equal(card.root.dataset.overflow,'true');
 f.resolveFonts();await Promise.resolve();f.doc.fonts.dispatchEvent(new Event('loadingdone'));f.view.dispatchEvent(new Event('resize'));f.api.sync();f.api.measure();f.api.destroy();
 assert.equal(f.frames.size,0);assert.equal(f.probes().length,0);assert.equal(f.observer.disconnectCount,1);
});
