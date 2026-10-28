import test from 'node:test';
import assert from 'node:assert/strict';
import {mountDockSearch} from '../dock-search.mjs';

const settle=async()=>{await Promise.resolve();await Promise.resolve();};
class Node {
 constructor(doc,tag='div') {
  this.ownerDocument=doc;this.tagName=tag;this.children=[];this.dataset={};this.attrs=new Map();this.events=new Map();this.value='';this.inert=false;
  const styles=new Map();this.style={setProperty:(k,v)=>styles.set(k,v),getPropertyValue:k=>styles.get(k)||'',removeProperty:k=>styles.delete(k)};
  const classes=new Set();this.classList={add:k=>classes.add(k),remove:k=>classes.delete(k)};
 }
 setAttribute(k,v){this.attrs.set(k,String(v));}
 getAttribute(k){return this.attrs.get(k)??null;}
 removeAttribute(k){this.attrs.delete(k);}
 append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
 insertBefore(node,reference){if(node===reference)return node;node.remove();const index=reference===null?this.children.length:this.children.indexOf(reference);if(index<0)throw new Error('Reference is not a child');node.parentNode=this;this.children.splice(index,0,node);return node;}
 replaceChildren(...nodes){for(const child of [...this.children])child.remove();this.append(...nodes);}
 matches(){return this.tagName==='button'&&Boolean(this.dataset.section);}
 addEventListener(name,callback,options={}){const listeners=this.events.get(name)||[];listeners.push({callback,signal:options.signal});this.events.set(name,listeners);}
 emit(name,values={}){const event={target:this,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;},...values};for(let node=this;node;node=node.parentNode){for(const {callback,signal}of node.events.get(name)||[])if(!signal?.aborted)callback(event);if(event.stopped)break;}return event;}
 contains(node){return this===node||this.children.some(child=>child.contains(node));}
 focus(){this.ownerDocument.activeElement=this;this.emit('focusin');}
 scrollIntoView(){}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);this.parentNode=null;}
}
function fixture(search,{locale='fr'}={}){
 const doc=new Node(null,'document');doc.ownerDocument=doc;
 doc.createElement=tag=>new Node(doc,tag);doc.createElementNS=(ns,tag)=>Object.assign(new Node(doc,tag),{namespaceURI:ns});
 let sequence=0,now=0;const frames=new Map(),timers=new Map(),windowEvents=new Map();
 doc.defaultView={
  innerHeight:844,scrollY:0,AbortController,ResizeObserver:class{observe(){}disconnect(){}},
  addEventListener(name,callback,options={}){
   const listeners=windowEvents.get(name)||[];listeners.push({callback,...options});windowEvents.set(name,listeners);
   options.signal?.addEventListener('abort',()=>windowEvents.set(name,(windowEvents.get(name)||[]).filter(item=>item.callback!==callback)),{once:true});
  },
  requestAnimationFrame:cb=>{const id=++sequence;frames.set(id,cb);return id;},cancelAnimationFrame:id=>frames.delete(id),
  setTimeout:(cb,delay)=>{const id=++sequence;timers.set(id,{callback:cb,due:now+delay});return id;},clearTimeout:id=>timers.delete(id),
 };
 function advance(milliseconds){const end=now+milliseconds;while(true){const next=[...timers.entries()].filter(([,timer])=>timer.due<=end).sort((a,b)=>a[1].due-b[1].due)[0];if(!next)break;timers.delete(next[0]);now=next[1].due;next[1].callback();}now=end;}
 function scroll(value,target=doc){doc.defaultView.scrollY=value;for(const item of windowEvents.get('scroll')||[])if(!item.signal?.aborted)item.callback({target});}

 const nav=new Node(doc,'nav');nav.id='nav';const after=new Node(doc,'footer');doc.append(nav,after);
 for(const section of ['explore','projects','people','journal']){const button=new Node(doc,'button');button.dataset.section=section;nav.append(button);}
 const selected=[],controller=mountDockSearch({nav,search,getLocale:()=>locale,onSelect:result=>selected.push(result)});
 const find=(node,name)=>node.className===name?node:node.children.map(child=>find(child,name)).find(Boolean);
 const get=name=>find(doc,'dock-search-'+name);
 return {nav,doc,after,controller,selected,get,scroll,advance,pending:()=>({frames:frames.size,timers:timers.size,scrollListeners:(windowEvents.get('scroll')||[]).length}),flush(){const current=[...frames.values()];frames.clear();for(const cb of current)cb();},open(){get('toggle').emit('click');},type(value){get('input').value=value;get('input').emit('input');},submit(){get('form').emit('submit');}};
}

test('explicit reading-column movement follows the shared dock fade and routing suspension',()=>{
 const f=fixture(()=>[]);f.controller.notifyContentScroll();f.flush();
 assert.equal(f.nav.parentNode.dataset.documentScrolling,'true');
 f.advance(400);assert.equal(f.nav.parentNode.dataset.documentScrolling,undefined);
 const resume=f.controller.suspendDocumentScroll();f.controller.notifyContentScroll();f.flush();
 assert.equal(f.nav.parentNode.dataset.documentScrolling,undefined);
 resume();f.controller.notifyContentScroll();f.flush();assert.equal(f.nav.parentNode.dataset.documentScrolling,'true');
 f.controller.destroy();
});

test('typing a new query then immediately submitting never selects the previous query',async()=>{
 const f=fixture(query=>[{id:query,title:query,type:'campus'}]);f.open();f.type('Paris');f.flush();await settle();
 assert.equal(f.get('results').children[0].children[0].children[0].textContent,'Paris');
 f.type('Tokyo');f.submit();await settle();
 assert.equal(f.selected[0]?.id,'Tokyo');
 f.controller.destroy();
});

test('a late answer from a closed search cannot overwrite a reopened query',async()=>{
 const deferred=new Map(),f=fixture(query=>new Promise(resolve=>deferred.set(query,resolve)));
 f.open();f.type('Paris');f.flush();f.controller.close();
 f.get('input').value='Tokyo';f.open();
 deferred.get('Tokyo')([{id:'tokyo',title:'Tokyo'}]);await settle();
 deferred.get('Paris')([{id:'paris',title:'Paris'}]);await settle();
 assert.equal(f.get('results').children[0].children[0].children[0].textContent,'Tokyo');
 f.submit();assert.equal(f.selected[0].id,'tokyo');f.controller.destroy();
});

test('keyboard navigation, Escape and rapid reopening keep focus and inert state coherent',async()=>{
 const f=fixture(()=>[{id:'paris',title:'Paris'},{id:'tokyo',title:'Tokyo'}]);
 const shell=f.nav.parentNode;assert.equal(shell.className,'dock-shell');assert.equal(f.get('toggle').parentNode,shell);assert.equal(f.nav.contains(f.get('toggle')),false);
 f.open();
 assert.equal(f.doc.activeElement,f.get('input'));assert.ok(f.nav.children.slice(0,4).every(n=>n.inert));
 f.type('42');f.flush();await settle();f.get('input').emit('keydown',{key:'ArrowUp'});
 assert.equal(f.get('input').getAttribute('aria-activedescendant'),'nav-search-option-1');
 f.get('input').emit('keydown',{key:'Escape'});
 assert.equal(f.doc.activeElement,f.get('toggle'));assert.ok(f.nav.children.slice(0,4).every(n=>!n.inert));assert.ok(f.get('form').inert);
 f.open();f.controller.close();f.open();assert.ok(!f.get('form').inert);assert.equal(f.nav.dataset.searchOpen,'true');
 f.controller.destroy();await settle();assert.equal(f.nav.children.length,4);assert.deepEqual(f.doc.children,[f.nav,f.after]);assert.equal(shell.parentNode,null);assert.equal(f.get('toggle'),undefined);
});

test('an old asynchronous query resolving between input and refresh is not the new query',async()=>{
 const deferred=new Map(),f=fixture(query=>new Promise(resolve=>deferred.set(query,resolve)));
 f.open();f.type('Paris');f.flush();f.type('Tokyo');
 deferred.get('Paris')([{id:'paris',title:'Paris'}]);await settle();f.submit();await settle();
 assert.notEqual(f.selected[0]?.id,'paris');f.controller.destroy();
});

test('a delayed submit cannot choose from a search reopened after cancellation',async()=>{
 const deferred=new Map(),f=fixture(query=>new Promise(resolve=>deferred.set(query,resolve)));
 f.open();f.type('Paris');f.submit();f.controller.close();
 f.get('input').value='Tokyo';f.open();deferred.get('Tokyo')([{id:'tokyo',title:'Tokyo'}]);await settle();
 deferred.get('Paris')([{id:'paris',title:'Paris'}]);await settle();
 assert.equal(f.selected.length,0);assert.equal(f.nav.dataset.searchOpen,'true');f.controller.destroy();
});


test('show more appends the next page and exposes its first result to the keyboard',async()=>{
 const records=Array.from({length:12},(_,index)=>({id:'result-'+index,title:'Result '+index})),calls=[];
 let resolvePage;
 const f=fixture((query,options)=>{
  calls.push({query,...options});
  if(options.offset)return new Promise(resolve=>{resolvePage=resolve;});
  return {results:records.slice(0,8),total:12,hasMore:true};
 });
 f.open();f.type('France');f.flush();await settle();
 assert.deepEqual(calls,[{query:'France',offset:0,limit:8}]);
 assert.equal(f.get('results').children.length,8);assert.equal(f.get('more').hidden,false);
 f.get('more').focus();f.get('more').emit('click');assert.equal(f.get('more').disabled,true);
 assert.deepEqual(calls[1],{query:'France',offset:8,limit:8});
 resolvePage({results:records.slice(8),total:12,hasMore:false});await settle();
 assert.equal(f.get('results').children.length,12);assert.equal(new Set(f.get('results').children.map(node=>node.id)).size,12);
 assert.equal(f.get('more').hidden,true);assert.match(f.get('status').textContent,/12/);
 assert.equal(f.doc.activeElement,f.get('input'));assert.equal(f.get('input').getAttribute('aria-activedescendant'),'nav-search-option-8');
 f.submit();assert.equal(f.selected[0].id,'result-8');f.controller.destroy();
});

test('typing another query invalidates an outstanding page before the next frame',async()=>{
 let resolvePage;
 const f=fixture((query,{offset})=>offset?new Promise(resolve=>{resolvePage=resolve;})
  :{results:[{id:query,title:query}],total:query==='France'?2:1,hasMore:query==='France'});
 f.open();f.type('France');f.flush();await settle();f.get('more').emit('click');
 f.type('Tokyo');resolvePage({results:[{id:'stale',title:'Stale French record'}],total:2,hasMore:false});await settle();
 assert.equal(f.get('results').children.some(node=>node.children[0].children[0].textContent==='Stale French record'),false);
 f.flush();await settle();assert.equal(f.get('results').children.length,1);assert.equal(f.get('more').hidden,true);
 assert.equal(f.get('results').children[0].children[0].children[0].textContent,'Tokyo');
 f.submit();assert.equal(f.selected[0].id,'Tokyo');f.controller.destroy();
});

test('a page resolving after close and reopen cannot append to the new search session',async()=>{
 let resolvePage;
 const f=fixture((query,{offset})=>offset?new Promise(resolve=>{resolvePage=resolve;})
  :{results:[{id:'france',title:'France'}],total:2,hasMore:true});
 f.open();f.type('France');f.flush();await settle();f.get('more').emit('click');
 f.controller.close();f.open();await settle();
 resolvePage({results:[{id:'stale',title:'Stale French record'}],total:2,hasMore:false});await settle();
 assert.equal(f.nav.dataset.searchOpen,'true');assert.equal(f.get('results').children.length,1);
 assert.equal(f.get('more').hidden,false);assert.equal(f.selected.length,0);f.controller.destroy();
});


test('document movement lowers the glass until 400 ms of rest, including the search state',()=>{
 const f=fixture(()=>[]),shell=f.nav.parentNode;f.flush();
 f.scroll(0);f.flush();assert.equal(shell.dataset.documentScrolling,undefined);assert.equal(f.pending().timers,0);
 f.scroll(120);f.flush();assert.equal(shell.dataset.documentScrolling,'true');
 f.advance(399);assert.equal(shell.dataset.documentScrolling,'true');
 f.scroll(180);f.flush();f.advance(399);assert.equal(shell.dataset.documentScrolling,'true');
 f.advance(1);assert.equal(shell.dataset.documentScrolling,undefined);
 f.open();f.flush();f.scroll(240);f.flush();assert.equal(shell.dataset.documentScrolling,'true');assert.equal(f.nav.dataset.searchOpen,'true');
 f.advance(100);f.scroll(240,f.get('panel'));f.scroll(240,f.doc.createElement('canvas'));f.scroll(240);f.flush();
 f.advance(300);assert.equal(shell.dataset.documentScrolling,undefined,'nested or stationary scroll events do not extend the effect');
 f.controller.destroy();
});

test('an idle scroll cancels a delayed animation frame instead of leaving the glass transparent',()=>{
 const f=fixture(()=>[]),shell=f.nav.parentNode;f.flush();
 f.scroll(100);assert.equal(f.pending().frames,1);assert.equal(f.pending().timers,1);
 f.advance(400);f.flush();assert.equal(shell.dataset.documentScrolling,undefined);assert.equal(f.pending().timers,0);assert.equal(f.pending().frames,0);
 f.controller.destroy();
});

test('destroy removes document scrolling work and its listener',()=>{
 const f=fixture(()=>[]),shell=f.nav.parentNode;f.flush();
 f.scroll(100);f.flush();assert.equal(shell.dataset.documentScrolling,'true');
 f.scroll(160);assert.equal(f.pending().frames,1);assert.equal(f.pending().timers,1);
 f.controller.destroy();assert.equal(shell.dataset.documentScrolling,undefined);assert.deepEqual(f.pending(),{frames:0,timers:0,scrollListeners:0});
 f.scroll(200);f.advance(1200);f.flush();assert.equal(shell.dataset.documentScrolling,undefined);assert.deepEqual(f.pending(),{frames:0,timers:0,scrollListeners:0});
});


test('short pauses keep the glass transparent, and resumed movement rearms the final rest period',()=>{
 const f=fixture(()=>[]),shell=f.nav.parentNode;f.flush();
 let position=100;f.scroll(position);f.flush();
 for(let burst=0;burst<8;burst++){
  f.advance(100);assert.equal(shell.dataset.documentScrolling,'true','a 100 ms pause must not start the opaque return');
  f.scroll(position+=30);f.flush();assert.equal(f.pending().timers,1);
 }
 f.advance(399);assert.equal(shell.dataset.documentScrolling,'true');
 f.advance(1);assert.equal(shell.dataset.documentScrolling,undefined,'only 400 ms of uninterrupted rest starts the return');
 // The CSS return lasts 350 ms; restarting after 175 ms must re-enter the
 // scrolling state and let the browser retarget from its current colour.
 f.advance(175);f.scroll(position+=30);f.flush();assert.equal(shell.dataset.documentScrolling,'true');
 f.advance(399);assert.equal(shell.dataset.documentScrolling,'true');
 f.advance(1);assert.equal(shell.dataset.documentScrolling,undefined);assert.equal(f.pending().timers,0);
 f.controller.destroy();
});


test('navigation clears the active fade and ignores document clamping and delayed restoration events',()=>{
 const f=fixture(()=>[]),shell=f.nav.parentNode;f.flush();
 f.scroll(500);f.flush();assert.equal(shell.dataset.documentScrolling,'true');
 const resume=f.controller.suspendDocumentScroll();
 assert.equal(shell.dataset.documentScrolling,undefined);assert.equal(f.pending().timers,0);
 f.scroll(160);f.flush();assert.equal(shell.dataset.documentScrolling,undefined,'replacing a shorter document is not user scrolling');
 // scrollTo updates scrollY before the browser delivers its scroll event.
 f.doc.defaultView.scrollY=0;resume();f.scroll(0);f.flush();
 assert.equal(shell.dataset.documentScrolling,undefined);assert.equal(f.pending().timers,0);
 f.scroll(40);f.flush();assert.equal(shell.dataset.documentScrolling,'true','the first actual movement on the new page is detected');
 f.controller.destroy();
});

test('navigation cancels a queued scrolling frame before it can hide the new page menu',()=>{
 const f=fixture(()=>[]),shell=f.nav.parentNode;f.flush();f.scroll(240);
 assert.equal(f.pending().frames,1);
 const resume=f.controller.suspendDocumentScroll();f.flush();
 assert.equal(shell.dataset.documentScrolling,undefined);assert.equal(f.pending().frames,0);
 f.doc.defaultView.scrollY=120;resume();f.scroll(120);f.flush();
 assert.equal(shell.dataset.documentScrolling,undefined,'back navigation restoration is also ignored');
 f.scroll(150);f.flush();assert.equal(shell.dataset.documentScrolling,'true');f.controller.destroy();
});

test('only the latest navigation can resume document scrolling and destroy makes pending resumes inert',()=>{
 const f=fixture(()=>[]),shell=f.nav.parentNode;f.flush();f.scroll(500);f.flush();
 const earlier=f.controller.suspendDocumentScroll(),latest=f.controller.suspendDocumentScroll();
 earlier();f.scroll(200);f.flush();assert.equal(shell.dataset.documentScrolling,undefined);
 f.doc.defaultView.scrollY=0;latest();f.scroll(0);f.flush();assert.equal(shell.dataset.documentScrolling,undefined);
 f.scroll(80);f.flush();assert.equal(shell.dataset.documentScrolling,'true');
 const pending=f.controller.suspendDocumentScroll();f.controller.destroy();pending();
 f.scroll(100);f.flush();assert.equal(shell.dataset.documentScrolling,undefined);assert.deepEqual(f.pending(),{frames:0,timers:0,scrollListeners:0});
});

test('profile result labels and search invitations follow all three UI languages',async()=>{
 for(const [locale,label,word]of [['fr','Profil','profil'],['en','Profile','profile'],['ar','ملف شخصي','ملف شخصي']]){
  const f=fixture(()=>[{id:'profile-sample',title:'Sam Exemple',type:'people'}],{locale});
  f.open();assert.ok(f.get('helper').textContent.includes(word));assert.ok(f.get('input').placeholder.includes(word));
  f.type('Sam');f.flush();await settle();
  assert.equal(f.get('result-type').textContent,label);
  f.controller.destroy();
 }
});
