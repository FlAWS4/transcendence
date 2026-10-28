import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectTrial} from '../project-trial.mjs';

// Native-like elements exercise URLs, messages and event lifetimes, not layout.
class Element extends EventTarget {
 constructor(tagName,doc){super();this.tagName=tagName.toUpperCase();this.ownerDocument=doc;this.children=[];this.attributes={};this.dataset={};this._text='';if(tagName==='iframe')this.contentWindow={postMessage:(value,origin)=>doc.messages.push({value,origin})};}
 append(...children){for(const child of children){child.remove();child.parentNode=this;this.children.push(child);}}
 remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(child=>child!==this);this.parentNode=null;}}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
}
const descendants=root=>[root,...root.children.flatMap(descendants)];
const byTag=(root,tag)=>descendants(root).filter(node=>node.tagName===tag.toUpperCase());
function fixture({theme='light',observer=true,aborted=false}={}){
 const doc={messages:[],observers:[],documentElement:{dataset:{theme}}};
 doc.createElement=tag=>new Element(tag,doc);
 class Observer {
  constructor(callback){this.callback=callback;this.connected=false;doc.observers.push(this);}
  observe(target,options){this.target=target;this.options=options;this.connected=true;}
  disconnect(){this.connected=false;}
  fire(){if(this.connected)this.callback([]);}
 }
 doc.defaultView=observer?{MutationObserver:Observer}:{};
 const controller=new AbortController();if(aborted)controller.abort();
 const render=(entry={id:'ft-transcendence-building-together'},locale='fr')=>createProjectTrial({doc,entry,locale,signal:controller.signal});
 return {doc,controller,render};
}

test('projects without the sample demo expose an honest empty state without a frame or launch link',()=>{
 for(const [locale,expected]of [['fr','Pas encore de version testable'],['en','No playable version yet'],['ar','لا توجد نسخة للتجربة بعد']]){
  const f=fixture(),entry={id:'another-project',demoUrl:'javascript:alert(1)'},snapshot=JSON.stringify(entry),root=f.render(entry,locale);
  assert.equal(byTag(root,'iframe').length,0);assert.equal(byTag(root,'a').length,0);
  assert.equal(byTag(root,'h3')[0].textContent,expected);assert.equal(f.doc.observers.length,0);
  assert.equal(JSON.stringify(entry),snapshot);f.controller.abort();
 }
});

test('the two test modes open the same local Pong with locale and theme, while only the iframe uses embedded mode',()=>{
 for(const locale of ['fr','en','ar'])for(const theme of ['light','dark']){
  const f=fixture({theme}),root=f.render(undefined,locale),frame=byTag(root,'iframe')[0],link=byTag(root,'a')[0];
  const embedded=new URL(frame.src),external=new URL(link.href);
  assert.ok(embedded.pathname.endsWith('/project-demos/pong/index.html'));
  assert.equal(embedded.origin,external.origin);assert.equal(embedded.pathname,external.pathname);
  assert.equal(embedded.searchParams.get('embedded'),'1');assert.equal(external.searchParams.has('embedded'),false);
  for(const url of [embedded,external]){assert.equal(url.searchParams.get('lang'),locale);assert.equal(url.searchParams.get('theme'),theme);}
  assert.ok(frame.title);assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');
  assert.match(link.getAttribute('aria-label'),locale==='fr'?/nouvel onglet/:locale==='en'?/new tab/:/علامة تبويب جديدة/);
  assert.equal(frame.getAttribute('sandbox'),'allow-scripts');assert.equal(frame.referrerPolicy,'no-referrer');
  for(const section of byTag(root,'section'))assert.ok(descendants(section).some(node=>node.id===section.getAttribute('aria-labelledby')));
  f.controller.abort();
 }
});

test('unsupported locale and theme values fall back without entering generated URLs or interface text',()=>{
 const f=fixture({theme:'<script>dark</script>'}),root=f.render(undefined,'"><script>bad</script>');
 for(const value of [byTag(root,'iframe')[0].src,byTag(root,'a')[0].href]){
  const url=new URL(value);assert.equal(url.searchParams.get('lang'),'fr');assert.equal(url.searchParams.get('theme'),'light');assert.equal(value.includes('script'),false);
 }
 assert.equal(byTag(root,'h3')[0].textContent,'Dans la page');f.controller.abort();
});

test('theme changes update the standalone link and message the sandboxed game without reloading it',()=>{
 const f=fixture(),root=f.render(),frame=byTag(root,'iframe')[0],link=byTag(root,'a')[0],initialSource=frame.src;
 const observer=f.doc.observers[0];assert.equal(observer.target,f.doc.documentElement);assert.deepEqual(observer.options,{attributes:true,attributeFilter:['data-theme']});
 frame.dispatchEvent(new Event('load'));assert.deepEqual(f.doc.messages.at(-1),{value:{type:'horizon-demo-theme',theme:'light'},origin:'*'});
 f.doc.documentElement.dataset.theme='dark';observer.fire();
 assert.equal(new URL(link.href).searchParams.get('theme'),'dark');assert.equal(frame.src,initialSource);
 assert.deepEqual(f.doc.messages.at(-1),{value:{type:'horizon-demo-theme',theme:'dark'},origin:'*'});
 frame.dispatchEvent(new Event('load'));assert.equal(f.doc.messages.at(-1).value.theme,'dark');
 f.controller.abort();
});

test('aborting the detail removes its browsing context, disconnects observation and prevents later load messages',()=>{
 const f=fixture(),root=f.render(),frame=byTag(root,'iframe')[0],observer=f.doc.observers[0];
 frame.dispatchEvent(new Event('load'));const before=f.doc.messages.length;
 f.controller.abort();assert.equal(byTag(root,'iframe').length,0);assert.equal(frame.parentNode,null);assert.equal(observer.connected,false);
 frame.dispatchEvent(new Event('load'));observer.fire();assert.equal(f.doc.messages.length,before);
 f.controller.abort();assert.equal(byTag(root,'a').length,1);
});

test('an already cancelled detail never starts a demo or an observer',()=>{
 const f=fixture({aborted:true}),root=f.render();
 assert.equal(byTag(root,'iframe').length,0);assert.equal(f.doc.observers.length,0);assert.equal(f.doc.messages.length,0);
});

test('demo creation and removal still work when MutationObserver is unavailable',()=>{
 const f=fixture({observer:false}),root=f.render(),frame=byTag(root,'iframe')[0];
 frame.dispatchEvent(new Event('load'));assert.equal(f.doc.messages.at(-1).value.theme,'light');
 f.controller.abort();assert.equal(byTag(root,'iframe').length,0);
});
