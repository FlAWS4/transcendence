import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {createExplorerSelector} from './explorer-selector.mjs';

// A rich fake DOM: attributes, dataset, classList, style, focus with inert/fixup on removal, capture and
// bubble dispatch, passive listeners, pointer capture, a measured layout and controllable animations.
const HTML='http://www.w3.org/1999/xhtml';
const kebab=name=>name.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());
const camel=name=>name.replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
const flush=async()=>{for(let n=0;n<12;n++)await Promise.resolve();};
function compile(selector){
 return selector.split(',').map(part=>{
  let rest=part.trim();const tests=[];
  const tag=rest.match(/^[a-zA-Z][\w-]*/);if(tag){const name=tag[0].toLowerCase();tests.push(node=>node.localName===name);rest=rest.slice(tag[0].length);}
  while(rest){
   const id=rest.match(/^#([\w-]+)/),cls=rest.match(/^\.([\w-]+)/),attr=rest.match(/^\[([\w-]+)(?:=(?:"([^"]*)"|([^\]]*)))?\]/);
   if(id){tests.push(node=>node.id===id[1]);rest=rest.slice(id[0].length);}
   else if(cls){tests.push(node=>node.classList.contains(cls[1]));rest=rest.slice(cls[0].length);}
   else if(attr){const value=attr[2]??attr[3];tests.push(node=>node.hasAttribute(attr[1])&&(value===undefined||node.getAttribute(attr[1])===value));rest=rest.slice(attr[0].length);}
   else throw new Error('Unsupported selector '+selector);
  }
  return node=>tests.every(check=>check(node));
 });
}
class FakeEvent{
 constructor(type,init={}){
  Object.assign(this,{bubbles:true,cancelable:true,detail:0,key:'',repeat:false,isComposing:false,altKey:false,ctrlKey:false,metaKey:false,shiftKey:false,isPrimary:true,button:0,pointerId:1,pointerType:'mouse',clientX:0,clientY:0,deltaX:0,deltaY:0,deltaMode:0},init);
  this.type=type;this.defaultPrevented=false;this.propagationStopped=false;this.immediateStopped=false;this.passive=false;
 }
 preventDefault(){if(this.cancelable&&!this.passive)this.defaultPrevented=true;}
 stopPropagation(){this.propagationStopped=true;}
 stopImmediatePropagation(){this.propagationStopped=true;this.immediateStopped=true;}
}
class FakeAnimation{
 constructor(element,keyframes,options){
  Object.assign(this,{element,keyframes,options,playState:'running'});
  this.finished=new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});this.finished.catch(()=>{});
 }
 finish(){if(this.playState!=='running')return;this.playState='finished';this.resolve(this);}
 cancel(){if(this.playState!=='running')return;this.playState='idle';const error=new Error('Animation cancelled');error.name='AbortError';this.reject(error);}
}
class FakeStyle{setProperty(name,value){this[name]=String(value);}removeProperty(name){delete this[name];}getPropertyValue(name){return this[name]??'';}}
class FakeElement{
 constructor(doc,tag,namespace=HTML){
  Object.assign(this,{ownerDocument:doc,localName:String(tag).toLowerCase(),namespaceURI:namespace,children:[],parentNode:null,attrs:new Map(),listeners:[],style:new FakeStyle(),text:'',scrollTop:0,scrollLeft:0,scrollHeight:0,clientHeight:0,open:false,isContentEditable:false,capturedPointer:null});
  this.tagName=namespace===HTML?this.localName.toUpperCase():this.localName;
  const name=property=>'data-'+kebab(String(property));
  this.dataset=new Proxy({},{
   get:(_,property)=>typeof property==='string'?this.attrs.get(name(property)):undefined,
   set:(_,property,value)=>{this.attrs.set(name(property),String(value));return true;},
   deleteProperty:(_,property)=>{this.attrs.delete(name(property));return true;},
   has:(_,property)=>this.attrs.has(name(property)),
   ownKeys:()=>[...this.attrs.keys()].filter(key=>key.startsWith('data-')).map(key=>camel(key.slice(5))),
   getOwnPropertyDescriptor:(_,property)=>this.attrs.has(name(property))?{enumerable:true,configurable:true,value:this.attrs.get(name(property))}:undefined,
  });
 }
 get parentElement(){return this.parentNode instanceof FakeElement?this.parentNode:null;}
 get id(){return this.attrs.get('id')??'';}set id(value){this.attrs.set('id',String(value));}
 get className(){return this.attrs.get('class')??'';}set className(value){this.attrs.set('class',String(value));}
 get classList(){
  const names=()=>this.className.split(/\s+/).filter(Boolean);
  return {contains:name=>names().includes(name),add:(...added)=>{this.className=[...new Set([...names(),...added])].join(' ');},remove:(...removed)=>{this.className=names().filter(name=>!removed.includes(name)).join(' ');}};
 }
 get type(){return this.attrs.get('type')??'';}set type(value){this.attrs.set('type',String(value));}
 get dir(){return this.attrs.get('dir')??'';}set dir(value){this.attrs.set('dir',String(value));}
 get lang(){return this.attrs.get('lang')??'';}set lang(value){this.attrs.set('lang',String(value));}
 get tabIndex(){const value=this.attrs.get('tabindex');return value===undefined?(['button','a'].includes(this.localName)?0:-1):Number(value);}
 set tabIndex(value){this.attrs.set('tabindex',String(value));}
 get hidden(){return this.attrs.has('hidden');}set hidden(value){if(value)this.attrs.set('hidden','');else this.attrs.delete('hidden');}
 get inert(){return this.attrs.has('inert');}set inert(value){if(value)this.attrs.set('inert','');else this.attrs.delete('inert');}
 setAttribute(name,value){this.attrs.set(String(name).toLowerCase(),String(value));}
 getAttribute(name){return this.attrs.get(String(name).toLowerCase())??null;}
 hasAttribute(name){return this.attrs.has(String(name).toLowerCase());}
 removeAttribute(name){this.attrs.delete(String(name).toLowerCase());}
 get textContent(){return this.children.length?this.children.map(child=>child.textContent).join(''):this.text;}
 set textContent(value){for(const child of [...this.children])this.detach(child);this.text=String(value??'');}
 get isConnected(){let node=this;while(node.parentNode)node=node.parentNode;return node===this.ownerDocument.documentElement;}
 detach(child){
  const index=this.children.indexOf(child);if(index>=0)this.children.splice(index,1);child.parentNode=null;
  // Focus fixup: a removed (or moved) focused node loses the focus, as in browsers.
  const doc=this.ownerDocument;if(child.contains(doc.activeElement))doc.activeElement=doc.body;
 }
 insertBefore(node,reference){
  node.parentNode?.detach(node);
  const index=reference?this.children.indexOf(reference):-1;
  if(index<0)this.children.push(node);else this.children.splice(index,0,node);
  node.parentNode=this;this.text='';return node;
 }
 append(...nodes){for(const node of nodes)this.insertBefore(node,null);}
 prepend(...nodes){const first=this.children[0]??null;for(const node of nodes)this.insertBefore(node,first);}
 replaceChildren(...nodes){for(const child of [...this.children])this.detach(child);this.text='';this.append(...nodes);}
 remove(){this.parentNode?.detach(this);}
 contains(node){for(let current=node;current;current=current.parentNode)if(current===this)return true;return false;}
 matches(selector){return compile(selector).some(check=>check(this));}
 closest(selector){const checks=compile(selector);for(let node=this;node instanceof FakeElement;node=node.parentNode)if(checks.some(check=>check(node)))return node;return null;}
 querySelectorAll(selector){const checks=compile(selector),found=[];const walk=node=>{for(const child of node.children){if(checks.some(check=>check(child)))found.push(child);walk(child);}};walk(this);return found;}
 querySelector(selector){return this.querySelectorAll(selector)[0]??null;}
 focus(options){
  if(!this.isConnected)return;
  for(let node=this;node instanceof FakeElement;node=node.parentNode)if(node.inert||node.hidden)return;
  this.ownerDocument.activeElement=this;this.ownerDocument.focusLog.push({node:this,options});
 }
 blur(){if(this.ownerDocument.activeElement===this)this.ownerDocument.activeElement=this.ownerDocument.body;}
 addEventListener(type,listener,options){
  const capture=typeof options==='boolean'?options:Boolean(options?.capture);
  if(this.listeners.some(entry=>entry.type===type&&entry.listener===listener&&entry.capture===capture))return;
  this.listeners.push({type,listener,capture,once:Boolean(options?.once),passive:Boolean(options?.passive)});
 }
 removeEventListener(type,listener,options){
  const capture=typeof options==='boolean'?options:Boolean(options?.capture);
  this.listeners=this.listeners.filter(entry=>!(entry.type===type&&entry.listener===listener&&entry.capture===capture));
 }
 dispatchEvent(event){
  event.target=this;const path=[];for(let node=this;node;node=node.parentNode)path.push(node);
  const invoke=(node,phase)=>{
   event.currentTarget=node;
   for(const entry of [...node.listeners]){
    if(entry.type!==event.type||!node.listeners.includes(entry))continue;
    if(phase==='capture'&&!entry.capture||phase==='bubble'&&entry.capture)continue;
    if(entry.once)node.removeEventListener(entry.type,entry.listener,entry.capture);
    event.passive=entry.passive;entry.listener.call(node,event);event.passive=false;
    if(event.immediateStopped)return;
   }
  };
  for(const node of path.slice(1).reverse()){invoke(node,'capture');if(event.propagationStopped)return !event.defaultPrevented;}
  invoke(this,'capture');if(!event.immediateStopped)invoke(this,'bubble');
  if(event.bubbles&&!event.propagationStopped)for(const node of path.slice(1)){invoke(node,'bubble');if(event.propagationStopped)break;}
  return !event.defaultPrevented;
 }
 click(){return this.dispatchEvent(new FakeEvent('click',{detail:0}));}
 getBoundingClientRect(){return this.ownerDocument.layout(this);}
 animate(keyframes,options){const animation=new FakeAnimation(this,keyframes,options);this.ownerDocument.animations.push(animation);return animation;}
 setPointerCapture(id){this.capturedPointer=id;}
 releasePointerCapture(id){if(this.capturedPointer===id)this.capturedPointer=null;}
 hasPointerCapture(id){return this.capturedPointer===id;}
 scrollIntoView(options){this.ownerDocument.scrolled.push({node:this,options});}
}

// Geometry of a 1440 × 900 stage: a 932 px viewport, 300 px cards on a 316 px pitch, a 1040 px campus panel.
const VIEWPORT={left:254,top:360,width:932},CARD={width:300,height:204},GAP=16,PANEL={left:200,top:168,width:1040,height:536};
const rect=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height,x:left,y:top});
const translation=element=>Number(String(element.style.transform||'').match(/translateX\((-?[\d.]+)px\)/)?.[1]??0);
function layout(doc,element){
 const rtl=doc.documentElement.dir==='rtl';
 if(element.classList.contains('explorer-viewport'))return rect(VIEWPORT.left,VIEWPORT.top,VIEWPORT.width,CARD.height+16);
 if(element.classList.contains('explorer-track')){
  const count=element.children.length,width=count*CARD.width+Math.max(0,count-1)*GAP;
  return rect((rtl?VIEWPORT.left+VIEWPORT.width-width:VIEWPORT.left)+translation(element),VIEWPORT.top+8,width,CARD.height);
 }
 if(element.classList.contains('explorer-card')){
  const track=layout(doc,element.parentNode),index=element.parentNode.children.indexOf(element);
  return rect(rtl?track.right-(index+1)*CARD.width-index*GAP:track.left+index*(CARD.width+GAP),track.top,CARD.width,CARD.height);
 }
 if(element.classList.contains('explorer-campus')||element.classList.contains('explorer-campus-surface'))return rect(PANEL.left,PANEL.top,PANEL.width,PANEL.height);
 // The sibling strip shows 400 px of 110 px-pitch pills, moved by its own scrollLeft.
 if(element.classList.contains('explorer-siblings'))return rect(PANEL.left+24,PANEL.top+PANEL.height-70,400,70);
 if(element.classList.contains('explorer-sibling')){const strip=element.parentNode,frame=layout(doc,strip),index=strip.children.indexOf(element);return rect(frame.left+index*110-strip.scrollLeft,frame.top+13,100,44);}
 if(element.id==='explorer')return rect(0,0,1440,900);
 return rect(0,0,0,0);
}
function createDocument({dir='ltr',lang='fr'}={}){
 let clock=1000,nextTimer=0;const timers=new Map();
 const doc={focusLog:[],scrolled:[],animations:[],observers:[],activeElement:null};
 doc.createElement=tag=>new FakeElement(doc,tag);doc.createElementNS=(namespace,tag)=>new FakeElement(doc,tag,namespace);
 doc.documentElement=new FakeElement(doc,'html');doc.documentElement.dir=dir;doc.documentElement.lang=lang;
 doc.body=new FakeElement(doc,'body');doc.documentElement.append(doc.body);doc.activeElement=doc.body;
 doc.getElementById=id=>doc.documentElement.querySelector('#'+id);
 doc.layout=element=>layout(doc,element);
 class FakeResizeObserver{constructor(callback){this.callback=callback;this.targets=new Set();doc.observers.push(this);}observe(target){this.targets.add(target);}unobserve(target){this.targets.delete(target);}disconnect(){this.targets.clear();}}
 doc.defaultView={performance:{now:()=>clock},setTimeout:(callback,delay=0)=>{timers.set(++nextTimer,{callback,at:clock+delay});return nextTimer;},clearTimeout:id=>timers.delete(id),ResizeObserver:FakeResizeObserver};
 doc.advance=async ms=>{clock+=ms;for(const [id,timer]of [...timers])if(timer.at<=clock&&timers.delete(id))timer.callback();await flush();};
 doc.timers=timers;
 return doc;
}

// Hand-made views with the exact shapes of the specification's literal examples (section 5).
const world={kind:'world',id:'world',name:'Monde',campuses:58,countries:30,countText:'58 campus · 30 pays',ariaLabel:'Monde · 58 campus · 30 pays'};
const continent=(id,name,campuses,countries,countText)=>({kind:'continent',id,name,campuses,countries,countText,ariaLabel:`${name} · ${countText}`});
const L1_FR={key:'continents',level:'continents',depth:1,parent:null,step:{index:1,total:3},cursorId:'world',items:[world,
 continent('africa','Afrique',6,3,'6 campus · 3 pays'),continent('americas','Amériques',4,2,'4 campus · 2 pays'),
 continent('asia','Asie',16,11,'16 campus · 11 pays'),continent('europe','Europe',32,14,'32 campus · 14 pays')]};
// Same key in Arabic: Intl.Collator('ar') puts Asia second.
const L1_AR={key:'continents',level:'continents',depth:1,parent:null,step:{index:1,total:3},cursorId:'world',items:[
 {kind:'world',id:'world',name:'العالم',campuses:58,countries:30,countText:'58 فرعًا · 30 دولة',ariaLabel:'العالم · 58 فرعًا · 30 دولة'},
 continent('asia','آسيا',16,11,'16 فرعًا · 11 دولة'),continent('africa','أفريقيا',6,3,'6 فروع · 3 دول'),
 continent('americas','الأمريكتان',4,2,'4 فروع · دولتان'),continent('europe','أوروبا',32,14,'32 فرعًا · 14 دولة')]};
const country=(id,name,campuses,countText)=>({kind:'country',id,name,campuses,countText,ariaLabel:`${name} · ${countText}`});
const L2_EUROPE_FR={key:'countries:europe',level:'countries',depth:2,parent:{kind:'continent',id:'europe',name:'Europe'},step:{index:2,total:3},cursorId:'ALB',items:[
 ['ALB','Albanie',1],['DEU','Allemagne',3],['AUT','Autriche',2],['BEL','Belgique',2],['ESP','Espagne',4],['FRA','France',8],['ITA','Italie',3],
 ['LUX','Luxembourg',1],['NLD','Pays-Bas',1],['POL','Pologne',1],['PRT','Portugal',2],['GBR','Royaume-Uni',1],['CHE','Suisse',2],['CZE','Tchéquie',1],
].map(([id,name,campuses])=>country(id,name,campuses,`${campuses} campus`))};
const arabicCampuses=n=>({1:'فرع واحد',2:'فرعان'})[n]||`${n} فروع`;
const L2_EUROPE_AR={key:'countries:europe',level:'countries',depth:2,parent:{kind:'continent',id:'europe',name:'أوروبا'},step:{index:2,total:3},cursorId:'ESP',items:[
 ['ESP','إسبانيا',4],['ALB','ألبانيا',1],['PRT','البرتغال',2],['CZE','التشيك',1],['DEU','ألمانيا',3],['GBR','المملكة المتحدة',1],['AUT','النمسا',2],
 ['ITA','إيطاليا',3],['BEL','بلجيكا',2],['POL','بولندا',1],['CHE','سويسرا',2],['FRA','فرنسا',8],['LUX','لوكسمبورغ',1],['NLD','هولندا',1],
].map(([id,name,campuses])=>country(id,name,campuses,arabicCampuses(campuses)))};
const FRENCH_CAMPUSES=[['angouleme','42 Angoulême'],['le-havre','42 Le Havre'],['lyon','42 Lyon'],['marseille','42 Marseille'],['mulhouse','42 Mulhouse'],['nice','42 Nice'],['paris','42 Paris'],['perpignan','42 Perpignan']];
const FRANCE={fr:'France',en:'France',ar:'فرنسا'};
const l3France=(cursorId='angouleme')=>({key:'campuses:FRA',level:'campuses',depth:3,parent:{kind:'country',id:'FRA',name:'France'},step:{index:3,total:3},cursorId,
 items:FRENCH_CAMPUSES.map(([id,name])=>({kind:'campus',id,name,countText:'France',ariaLabel:`${name} · France`}))});
const L3_ALBANIA={key:'campuses:ALB',level:'campuses',depth:3,parent:{kind:'country',id:'ALB',name:'Albanie'},step:{index:3,total:3},cursorId:'tirana',
 items:[{kind:'campus',id:'tirana',name:'42 Tirana',countText:'Albanie',ariaLabel:'42 Tirana · Albanie'}]};
const campusView=(id,locale='fr')=>{const [,name]=FRENCH_CAMPUSES.find(([campus])=>campus===id);
 return {key:'campus:'+id,level:'campus',depth:4,parent:{kind:'country',id:'FRA',name:FRANCE[locale]},step:null,items:[],cursorId:null,
  campus:{id,name,country:'FRA',address:id==='paris'?'96, boulevard Bessières\n75017 PARIS\nFrance':''},siblings:FRENCH_CAMPUSES.map(([campus,label])=>({id:campus,name:label}))};};
const TIRANA={key:'campus:tirana',level:'campus',depth:4,parent:{kind:'country',id:'ALB',name:'Albanie'},step:null,items:[],cursorId:null,campus:{id:'tirana',name:'42 Tirana',country:'ALB'},siblings:[{id:'tirana',name:'42 Tirana'}]};

// renderCampus stand-in: the same child classes as the real mountCampusDetails, a link to focus inside.
function stubCampus(container,campusId,locale,calls){
 const doc=container.ownerDocument,node=(tag,className,text)=>{const element=doc.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
 const root=node('section','campus-details');root.lang=locale;root.dir=locale==='ar'?'rtl':'ltr';root.dataset.campus=campusId;
 const hero=node('div','campus-details-hero'),slot=node('div','campus-details-logo-slot');slot.append(node('h3','campus-details-name',campusId));hero.append(slot,node('p','campus-details-country','France'));
 const photos=node('section','campus-details-section campus-details-photos');photos.append(node('h4','campus-details-section-title','Photos'));
 const contacts=node('section','campus-details-section campus-details-contacts'),actions=node('div','campus-details-actions'),link=node('a','campus-details-link','Site');
 link.setAttribute('href','https://example.invalid/'+campusId);actions.append(link);contacts.append(node('h4','campus-details-section-title','Contacts'),actions);
 root.append(hero,photos,node('dl','campus-details-facts'),contacts,node('section','campus-details-section campus-details-opening'),node('section','campus-details-section campus-details-stats'),node('section','campus-details-section campus-details-piscines'),node('p','campus-details-verified','2026'));
 container.append(root);calls.renders.push({campusId,locale});
 return {element:root,destroy(){calls.destroys.push({campusId,locale});root.remove();}};
}

function harness({dir='ltr',locale='fr',reduced=false,title=false}={}){
 const doc=createDocument({dir,lang:locale});
 const app=doc.createElement('div');app.id='app';doc.body.append(app);
 const main=doc.createElement('main');main.id='main';app.append(main);
 const root=doc.createElement('section');root.id='explorer';root.className='explorer-selector';root.tabIndex=-1;
 root.setAttribute('aria-labelledby','explorer-title');root.setAttribute('aria-describedby','loading');main.append(root);
 if(title){const heading=doc.createElement('h1');heading.id='explorer-title';root.append(heading);}
 const outside=doc.createElement('button');outside.id='outside';app.append(outside);
 const state={locale},calls={validate:[],ascend:0,announce:[],renders:[],destroys:[]};
 const media={matches:reduced,listeners:[],addEventListener(type,callback){if(type==='change')this.listeners.push(callback);},removeEventListener(type,callback){this.listeners=this.listeners.filter(entry=>entry!==callback);},set(value){this.matches=value;for(const callback of [...this.listeners])callback({matches:value});}};
 const h={doc,root,outside,state,calls,media,onValidate:null,onAscend:null};
 h.selector=createExplorerSelector({root,getLocale:()=>state.locale,motion:media,
  onValidate:target=>{calls.validate.push(target);h.onValidate?.(target);},
  onAscend:()=>{calls.ascend++;h.onAscend?.();},
  onAnnounce:text=>calls.announce.push(text),
  renderCampus:(container,campusId,campusLocale)=>stubCampus(container,campusId,campusLocale,calls)});
 h.screens=()=>root.children.filter(node=>node.classList.contains('explorer-level')||node.classList.contains('explorer-campus'));
 h.current=()=>h.screens().find(node=>!node.inert);
 h.cards=()=>h.current().querySelectorAll('[data-explorer-card]');
 h.card=id=>h.cards().find(card=>card.dataset.id===id);
 h.cursor=()=>h.cards().find(card=>card.dataset.cursor==='true')?.dataset.id;
 h.nav=direction=>h.current().querySelector(`.explorer-nav[data-dir=${direction}]`);
 h.viewport=()=>h.current().querySelector('.explorer-viewport');
 h.event=(type,target,init={})=>{const event=new FakeEvent(type,init);target.dispatchEvent(event);return event;};
 h.key=(key,init={},target=doc.activeElement)=>h.event('keydown',target,{key,...init});
 // Native button activation: Enter clicks the element focused when its keypress arrives, Space on keyup.
 h.press=(key,init={})=>{
  const target=doc.activeElement,down=h.key(key,init,target);
  if(down.defaultPrevented||target.localName!=='button')return down;
  if(key==='Enter')h.event('click',doc.activeElement,{detail:0});
  if(key===' '){h.event('keyup',target,{key});if(doc.activeElement===target)h.event('click',target,{detail:0});}
  return down;
 };
 // A mouse click: pointerdown (which focuses a button, as in Chrome), pointerup, then click.
 h.tap=(target,{detail=1,x=0}={})=>{
  h.event('pointerdown',target,{clientX:x,detail});if(target.localName==='button')target.focus();
  h.event('pointerup',target,{clientX:x,detail});return h.event('click',target,{detail});
 };
 h.wheel=init=>h.event('wheel',h.viewport(),init);
 h.later=(ms=400)=>doc.advance(ms);
 h.finish=async()=>{for(const animation of [...doc.animations])animation.finish();await flush();};
 return h;
}

test('renders a labelled carousel of keyed cards with roving focus, positions and copy',()=>{
 const h=harness();
 const title=h.root.children[0];assert.equal(title.id,'explorer-title');assert.equal(title.localName,'h1');assert.equal(title.className,'sr-only');assert.equal(title.textContent,'Explorer');
 assert.equal(h.selector.hasView(),false);
 h.selector.show(L1_FR);assert.equal(h.selector.hasView(),true);
 const level=h.current(),eyebrow=level.querySelector('.explorer-eyebrow'),group=level.querySelector('.explorer-carousel'),hint=level.querySelector('.explorer-hint');
 assert.equal(eyebrow.textContent,'1 · Continent');
 assert.equal(group.getAttribute('role'),'group');assert.equal(group.getAttribute('aria-roledescription'),'carrousel');
 assert.equal(group.getAttribute('aria-labelledby'),eyebrow.id);assert.equal(group.getAttribute('aria-describedby'),hint.id);assert.match(eyebrow.id,/^explorer-eyebrow-\d+$/);
 assert.equal(hint.querySelector('.explorer-hint-keys').textContent,'Flèches pour choisir · Entrée pour valider · Échap pour revenir');
 assert.equal(hint.querySelector('.explorer-hint-touch').textContent,'Glisse pour choisir · Touche la carte du centre pour valider');
 assert.deepEqual(h.cards().map(card=>card.dataset.id),['world','africa','americas','asia','europe']);
 const [monde,afrique]=h.cards();
 assert.equal(monde.getAttribute('aria-label'),'Monde · 58 campus · 30 pays · 1 sur 5 · Valider');assert.equal(afrique.getAttribute('aria-label'),'Afrique · 6 campus · 3 pays · 2 sur 5');
 assert.equal(monde.tabIndex,0);assert.ok(h.cards().slice(1).every(card=>card.tabIndex===-1));assert.equal(monde.type,'button');
 assert.equal(monde.querySelector('.explorer-card-index').textContent,'01');assert.equal(monde.querySelector('.explorer-card-index').getAttribute('aria-hidden'),'true');
 assert.equal(monde.querySelector('.explorer-card-name').dir,'auto');assert.equal(monde.querySelector('.explorer-card-count').textContent,'58 campus · 30 pays');
 assert.equal(monde.querySelector('.explorer-card-dots').children.length,58);assert.equal(h.card('europe').querySelector('.explorer-card-dots').children.length,32);
 assert.equal(monde.querySelector('.explorer-card-dots').getAttribute('aria-hidden'),'true');assert.equal(monde.querySelector('.explorer-card-chip').textContent,'Valider');
 assert.equal(h.nav('prev').getAttribute('aria-label'),'Précédent');assert.equal(h.nav('next').getAttribute('aria-label'),'Suivant');
 assert.equal(h.nav('prev').getAttribute('aria-disabled'),'true');assert.equal(h.nav('next').getAttribute('aria-disabled'),null);
 assert.equal(h.nav('prev').querySelector('use').getAttribute('href'),'#i-back');assert.equal(h.nav('next').querySelector('use').getAttribute('href'),'#i-arrow');
 const pager=level.querySelector('.explorer-pager');assert.equal(pager.getAttribute('aria-hidden'),'true');
 assert.equal(pager.querySelector('.explorer-pager-count').textContent,'1 / 5');assert.equal(pager.querySelector('.explorer-pager-count').dir,'ltr');
 assert.equal(pager.querySelector('.explorer-pager-fill').style['--explorer-progress'],'0.2');
});

test('an existing title is reused and the Arabic and English copy follow the interface language',()=>{
 const h=harness({title:true,locale:'ar',dir:'rtl'});
 assert.equal(h.root.querySelectorAll('h1').length,1);assert.equal(h.root.children[0].textContent,'استكشف');
 h.selector.show(L2_EUROPE_AR);
 const level=h.current();
 assert.equal(level.querySelector('.explorer-eyebrow').textContent,'2 · الدولة · أوروبا');
 assert.equal(level.querySelector('.explorer-carousel').getAttribute('aria-roledescription'),'عرض دوّار');
 assert.equal(h.card('ESP').getAttribute('aria-label'),'إسبانيا · 4 فروع · 1 من 14 · تأكيد');
 assert.equal(h.card('FRA').getAttribute('aria-label'),'فرنسا · 8 فروع · 12 من 14');
 assert.equal(h.nav('prev').getAttribute('aria-label'),'السابق');assert.equal(h.nav('next').getAttribute('aria-label'),'التالي');
 assert.equal(level.querySelector('.explorer-hint-keys').textContent,'الأسهم للاختيار · Enter للتأكيد · Esc للرجوع');
 assert.equal(level.querySelector('.explorer-hint-touch').textContent,'اسحب للاختيار · المس البطاقة الوسطى للتأكيد');
 assert.equal(level.querySelector('.explorer-pager-count').textContent,'1 / 14');assert.equal(h.card('FRA').querySelector('.explorer-card-index').textContent,'12');
 h.state.locale='en';h.selector.localize();
 assert.equal(h.root.children[0].textContent,'Explore');assert.equal(level.querySelector('.explorer-eyebrow').textContent,'2 · Country · أوروبا');
 assert.equal(h.card('ESP').getAttribute('aria-label'),'إسبانيا · 4 فروع · 1 of 14 · Select');assert.equal(h.nav('next').getAttribute('aria-label'),'Next');
 assert.equal(level.querySelector('.explorer-hint-keys').textContent,'Arrow keys to choose · Enter to select · Esc to go back');
 assert.equal(level.querySelector('.explorer-carousel').getAttribute('aria-roledescription'),'carousel');
});

test('one Enter validates exactly once and focus lands on the first card of the next level',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});
 h.onValidate=()=>h.selector.show(L2_EUROPE_FR,{direction:'descend',focus:h.root.contains(h.doc.activeElement)});
 h.key('End');assert.equal(h.cursor(),'europe');assert.equal(h.doc.activeElement,h.card('europe'));
 const down=h.press('Enter');
 assert.equal(down.defaultPrevented,false);
 assert.deepEqual(h.calls.validate,[{kind:'continent',id:'europe'}]);
 assert.equal(h.current().dataset.level,'countries');assert.equal(h.doc.activeElement,h.card('ALB'));assert.equal(h.cursor(),'ALB');
 assert.ok(h.doc.focusLog.every(entry=>entry.options?.preventScroll===true));
 // The key is still held: every auto-repeat keydown is cancelled, so no native click follows.
 const repeat=h.press('Enter',{repeat:true});
 assert.equal(repeat.defaultPrevented,true);assert.equal(h.calls.validate.length,1);assert.equal(h.doc.activeElement,h.card('ALB'));
});

test('a held Enter arriving on the first card never validates, and Space validates once on keyup',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});assert.equal(h.doc.activeElement,h.card('world'));
 for(let n=0;n<3;n++)assert.equal(h.press('Enter',{repeat:true}).defaultPrevented,true);
 assert.equal(h.calls.validate.length,0);
 assert.equal(h.press(' ').defaultPrevented,false);assert.deepEqual(h.calls.validate,[{kind:'world',id:'world'}]);
 assert.equal(h.press(' ',{repeat:true}).defaultPrevented,true);assert.equal(h.calls.validate.length,1);
});

test('a detail-0 click validates that very card, even a side card, and is never throttled',()=>{
 const h=harness();h.selector.show(L1_FR);
 h.card('asia').click();assert.deepEqual(h.calls.validate,[{kind:'continent',id:'asia'}]);assert.equal(h.cursor(),'world');
 h.card('world').click();assert.deepEqual(h.calls.validate.at(-1),{kind:'world',id:'world'});
});

test('a pointer click positions a side card, then validates only the card that was the cursor when pressed',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();
 const click=h.tap(h.card('africa'));
 assert.equal(h.calls.validate.length,0);assert.equal(h.cursor(),'africa');assert.equal(h.doc.activeElement,h.card('africa'));
 assert.equal(click.defaultPrevented,false);assert.equal(h.card('africa').tabIndex,0);assert.equal(h.card('world').tabIndex,-1);
 h.tap(h.card('africa'));assert.deepEqual(h.calls.validate,[{kind:'continent',id:'africa'}]);
 // Pressed while it was a side card, the click only positions, even if the keyboard made it the cursor meanwhile.
 h.event('pointerdown',h.card('asia'),{detail:1});h.key('ArrowRight',{},h.card('africa'));h.key('ArrowRight');
 assert.equal(h.cursor(),'asia');h.event('click',h.card('asia'),{detail:1});assert.equal(h.calls.validate.length,1);
});

test('double clicks and pointer clicks within 350 ms of a level change are ignored',async()=>{
 const h=harness();h.selector.show(L1_FR);
 h.tap(h.card('world'));assert.equal(h.calls.validate.length,0,'pointer click right after the level appeared');
 await h.later(349);h.tap(h.card('world'));assert.equal(h.calls.validate.length,0);
 await h.later(2);h.tap(h.card('world'),{detail:2});assert.equal(h.calls.validate.length,0,'detail 2');
 h.onValidate=()=>h.selector.show(L2_EUROPE_FR,{direction:'descend'});
 h.tap(h.card('world'));assert.equal(h.calls.validate.length,1);
 // The second click of the double click lands on the new level's centred card.
 h.tap(h.card('ALB'),{detail:2});h.tap(h.card('ALB'));assert.equal(h.calls.validate.length,1);
 h.card('ALB').click();assert.equal(h.calls.validate.length,2,'keyboard and assistive-technology clicks are never throttled');
});

test('a drag moves by whole cards following the finger, and the click that follows it is swallowed',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();
 const track=h.current().querySelector('.explorer-track'),start=translation(track),viewport=h.viewport();
 assert.equal(start,316,'Monde is centred from measured rectangles');
 h.event('pointerdown',h.card('world'),{clientX:700,clientY:500});h.card('world').focus();
 h.event('pointermove',h.card('world'),{clientX:695,clientY:503});assert.equal(viewport.capturedPointer,null,'below the 8 px threshold');
 h.event('pointermove',h.card('world'),{clientX:690,clientY:501});assert.equal(viewport.capturedPointer,1);
 assert.equal(h.current().dataset.dragging,'true');assert.equal(translation(track),start-10);
 h.event('pointermove',viewport,{clientX:380,clientY:505});assert.equal(translation(track),start-320);
 h.event('pointerup',viewport,{clientX:380,clientY:505});
 assert.equal(h.cursor(),'africa');assert.equal(h.doc.activeElement,h.card('africa'),'focus follows a focused card');assert.equal(h.current().dataset.dragging,undefined);
 assert.equal(translation(track),0);
 const click=h.event('click',h.card('africa'),{detail:1});
 assert.equal(click.defaultPrevented,true);assert.equal(h.calls.validate.length,0);assert.equal(h.cursor(),'africa');
 // A short drag snaps back and still swallows its click, even on the cursor card.
 h.event('pointerdown',h.card('africa'),{clientX:700});h.event('pointermove',h.card('africa'),{clientX:720});h.event('pointerup',viewport,{clientX:720});
 assert.equal(h.cursor(),'africa');assert.equal(translation(track),0);
 h.event('click',h.card('africa'),{detail:1});assert.equal(h.calls.validate.length,0);
 // Keyboard and assistive-technology clicks are not swallowed.
 h.event('pointerdown',h.card('africa'),{clientX:700});h.event('pointermove',h.card('africa'),{clientX:730});h.event('pointerup',viewport,{clientX:730});
 h.card('africa').click();assert.deepEqual(h.calls.validate,[{kind:'continent',id:'africa'}]);
 // A vertical pan is left to the browser; a cancelled drag snaps back.
 h.event('pointerdown',h.card('africa'),{clientX:700,clientY:500});h.event('pointermove',h.card('africa'),{clientX:702,clientY:530});h.event('pointermove',h.card('africa'),{clientX:600,clientY:530});
 assert.equal(translation(track),0);
 h.event('pointerdown',h.card('africa'),{clientX:700});h.event('pointermove',h.card('africa'),{clientX:600});assert.equal(translation(track),-100);
 h.event('pointercancel',viewport,{clientX:600});assert.equal(translation(track),0);assert.equal(h.cursor(),'africa');
 // Touch: the pressed card held the implicit capture; losing it to the viewport must not end the drag.
 h.event('pointerdown',h.card('africa'),{clientX:700,pointerType:'touch'});h.event('pointermove',h.card('africa'),{clientX:690,pointerType:'touch'});
 h.event('lostpointercapture',h.card('africa').querySelector('.explorer-card-name'),{pointerType:'touch'});
 h.event('pointermove',viewport,{clientX:400,pointerType:'touch'});assert.equal(translation(track),-300);
 h.event('pointerup',viewport,{clientX:400,pointerType:'touch'});h.event('lostpointercapture',viewport,{pointerType:'touch'});
 assert.equal(h.cursor(),'americas');assert.equal(translation(track),-316);
});

test('dragging in RTL brings the next card from the left, as the finger moves right',async()=>{
 const h=harness({dir:'rtl',locale:'ar'});h.selector.show(L1_AR);await h.later();
 const track=h.current().querySelector('.explorer-track'),viewport=h.viewport();
 assert.equal(translation(track),-316);
 h.event('pointerdown',h.card('world'),{clientX:700});h.event('pointermove',viewport,{clientX:720});h.event('pointermove',viewport,{clientX:1030});h.event('pointerup',viewport,{clientX:1030});
 assert.equal(h.cursor(),'asia');assert.equal(translation(track),0);
});

test('Previous and Next keep focus, stop at the ends with aria-disabled and announce each move',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});
 const next=h.nav('next'),prev=h.nav('prev');next.focus();
 prev.click();assert.equal(h.cursor(),'world');assert.deepEqual(h.calls.announce,[]);
 next.click();assert.equal(h.cursor(),'africa');assert.equal(h.doc.activeElement,next);assert.deepEqual(h.calls.announce,['Afrique · 2 sur 5']);
 assert.equal(prev.getAttribute('aria-disabled'),null);assert.equal(h.card('africa').tabIndex,0);
 next.click();next.click();next.click();assert.equal(h.cursor(),'europe');assert.equal(next.getAttribute('aria-disabled'),'true');
 assert.deepEqual(h.calls.announce,['Afrique · 2 sur 5','Amériques · 3 sur 5','Asie · 4 sur 5','Europe · 5 sur 5']);
 next.click();assert.equal(h.cursor(),'europe');assert.equal(h.calls.announce.length,4);assert.equal(h.doc.activeElement,next,'a disabled end stays focusable');
 assert.equal(h.press('Enter').defaultPrevented,false);assert.equal(h.calls.validate.length,0,'Enter on Next never validates a card');
 prev.focus();h.press('Enter');assert.equal(h.cursor(),'asia');assert.equal(h.doc.activeElement,prev);assert.equal(h.calls.announce.at(-1),'Asie · 4 sur 5');
});

test('arrow keys move the cursor in reading order, swap in RTL and stop at the ends',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});
 let event=h.key('ArrowRight');assert.equal(event.defaultPrevented,true);assert.equal(h.cursor(),'africa');assert.equal(h.doc.activeElement,h.card('africa'));
 h.key('ArrowLeft');assert.equal(h.cursor(),'world');
 event=h.key('ArrowLeft');assert.equal(event.defaultPrevented,true);assert.equal(h.cursor(),'world','no wrap');
 h.key('End');assert.equal(h.cursor(),'europe');h.key('ArrowRight');assert.equal(h.cursor(),'europe');h.key('Home');assert.equal(h.cursor(),'world');
 assert.equal(h.calls.validate.length+h.calls.ascend+h.calls.announce.length,0,'positioning never validates or announces');
 const rtl=harness({dir:'rtl',locale:'ar'});rtl.selector.show(L1_AR,{focus:true});
 rtl.key('ArrowLeft');assert.equal(rtl.cursor(),'asia');assert.equal(rtl.doc.activeElement,rtl.card('asia'));
 rtl.key('ArrowRight');assert.equal(rtl.cursor(),'world');rtl.key('End');assert.equal(rtl.cursor(),'europe');
});

test('keys on other targets, with modifiers, while composing, in a dialog or a field are ignored',()=>{
 const h=harness();h.selector.show(l3France(),{focus:true});
 for(const init of [{altKey:true},{ctrlKey:true},{metaKey:true},{isComposing:true}]){assert.equal(h.key('ArrowRight',init).defaultPrevented,false);assert.equal(h.key('Escape',init).defaultPrevented,false);}
 assert.equal(h.cursor(),'angouleme');assert.equal(h.calls.ascend,0);
 assert.equal(h.key('ArrowRight',{},h.nav('next')).defaultPrevented,false);assert.equal(h.key('End',{},h.root).defaultPrevented,false);assert.equal(h.cursor(),'angouleme');
 assert.equal(h.key('Enter',{repeat:true},h.nav('next')).defaultPrevented,false);
 const dialog=h.doc.createElement('dialog'),inner=h.doc.createElement('button'),field=h.doc.createElement('input');dialog.open=true;dialog.append(inner);h.current().append(dialog,field);
 assert.equal(h.key('Escape',{},inner).defaultPrevented,false);assert.equal(h.key('Escape',{},field).defaultPrevented,false);assert.equal(h.calls.ascend,0);
 dialog.open=false;assert.equal(h.key('Escape',{},inner).defaultPrevented,true);assert.equal(h.calls.ascend,1);
});

test('Escape and Backspace ascend from any level but the World level, from anywhere in the selector',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});
 assert.equal(h.press('Escape').defaultPrevented,false);assert.equal(h.press('Backspace').defaultPrevented,false);assert.equal(h.calls.ascend,0);
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.equal(h.key('Escape').defaultPrevented,true);assert.equal(h.calls.ascend,1);
 assert.equal(h.key('Backspace',{},h.nav('prev')).defaultPrevented,true);assert.equal(h.calls.ascend,2);
 h.selector.show(campusView('paris'),{direction:'descend'});
 const link=h.current().querySelector('.campus-details-link');link.focus();
 assert.equal(h.key('Backspace').defaultPrevented,true);assert.equal(h.calls.ascend,3);
 // Only Escape and Backspace are handled on the campus screen: Space, Home, End and Enter stay native.
 for(const key of [' ','Home','End','Enter','ArrowLeft','ArrowRight'])assert.equal(h.key(key).defaultPrevented,false);
});

test('show hands focus over only when it was inside or requested, always without scrolling',()=>{
 const h=harness();h.outside.focus();
 h.selector.show(L1_FR);assert.equal(h.doc.activeElement,h.outside);
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(h.doc.activeElement,h.outside,'an external change never moves focus');
 h.selector.show(L1_FR,{direction:'ascend',focus:true});assert.equal(h.doc.activeElement,h.card('world'));
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(h.doc.activeElement,h.card('ALB'),'focus was inside');
 assert.ok(h.doc.focusLog.filter(entry=>h.root.contains(entry.node)).every(entry=>entry.options?.preventScroll===true));
 h.outside.focus();h.selector.focus();assert.equal(h.doc.activeElement,h.card('ALB'));
 // A new view key places the cursor on the item the controller passes (the one we came back from).
 h.selector.show({...L1_FR,cursorId:'europe'},{direction:'ascend'});assert.equal(h.cursor(),'europe');assert.equal(h.doc.activeElement,h.card('europe'));
 h.selector.show({...L2_EUROPE_FR,cursorId:'nowhere'},{direction:'descend'});assert.equal(h.cursor(),'ALB');
});

test('focus() targets the cursor card, the campus heading, or the empty named section',()=>{
 const h=harness();
 h.selector.focus();assert.equal(h.doc.activeElement,h.root);assert.equal(h.selector.hasView(),false);
 h.selector.show(L1_FR);assert.equal(h.doc.activeElement,h.card('world'),'focus inside the section moves to the first view');
 h.selector.show(campusView('paris'),{direction:'descend'});assert.equal(h.doc.activeElement,h.current().querySelector('h2'));
 h.outside.focus();h.selector.focus();assert.equal(h.doc.activeElement,h.current().querySelector('h2'));
});

test('the outgoing level is inert and hidden from assistive technology at once, then removed after its exit',async()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});await h.later();
 assert.equal(h.doc.animations.length,0,'the first view has no transition');
 const first=h.current();
 h.selector.show(L2_EUROPE_FR,{direction:'descend',focus:true});
 assert.equal(first.inert,true);assert.equal(first.getAttribute('aria-hidden'),'true');assert.equal(first.dataset.state,'leaving');
 assert.equal(h.screens().length,2);assert.notEqual(h.current(),first);assert.equal(h.doc.activeElement,h.card('ALB'));
 const [exit,enter]=h.doc.animations;
 assert.equal(exit.element,first);assert.deepEqual(exit.keyframes,[{opacity:1,transform:'none'},{opacity:0,transform:'translateX(-24px)'}]);
 assert.equal(enter.element,h.current());assert.deepEqual(enter.keyframes,[{opacity:0,transform:'translateX(24px)'},{opacity:1,transform:'none'}]);
 assert.equal(exit.options.duration,280);assert.equal(exit.options.easing,'cubic-bezier(.22,1,.36,1)');
 // Pointer clicks on the outgoing level are ignored, whatever the delay.
 await h.later();const stale=first.querySelector('[data-explorer-card]');
 assert.equal(h.event('click',stale,{detail:1}).defaultPrevented,true);stale.click();assert.equal(h.calls.validate.length,0);
 await h.finish();assert.equal(h.screens().length,1);assert.equal(first.parentNode,null);
 // Ascending reverses the slide; a new view finishes the running transition at once.
 h.selector.show(L1_FR,{direction:'ascend',focus:true});const second=h.screens()[0];
 assert.deepEqual(h.doc.animations.at(-2).keyframes[1],{opacity:0,transform:'translateX(24px)'});assert.deepEqual(h.doc.animations.at(-1).keyframes[0],{opacity:0,transform:'translateX(-24px)'});
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(second.parentNode,null);assert.equal(h.screens().length,2);
 assert.ok(h.doc.animations.slice(0,-2).every(animation=>animation.playState!=='running'));
 // RTL mirrors the slide.
 const rtl=harness({dir:'rtl',locale:'ar'});rtl.selector.show(L1_AR);rtl.selector.show(L2_EUROPE_AR,{direction:'descend'});
 assert.deepEqual(rtl.doc.animations[0].keyframes[1],{opacity:0,transform:'translateX(24px)'});assert.deepEqual(rtl.doc.animations[1].keyframes[0],{opacity:0,transform:'translateX(-24px)'});
});

test('the same view key keeps the card nodes and the UI cursor by id, re-sorted for a new language',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});h.key('ArrowRight');h.key('ArrowRight');h.key('ArrowRight');
 assert.equal(h.cursor(),'asia');
 const nodes=new Map(h.cards().map(card=>[card.dataset.id,card])),level=h.current(),animations=h.doc.animations.length;
 h.state.locale='ar';h.doc.documentElement.dir='rtl';h.selector.localize();h.selector.show(L1_AR);
 assert.equal(h.current(),level,'no new level for the same key');assert.equal(h.doc.animations.length,animations,'no transition either');
 assert.deepEqual(h.cards().map(card=>card.dataset.id),['world','asia','africa','americas','europe']);
 assert.ok(h.cards().every(card=>nodes.get(card.dataset.id)===card));
 assert.equal(h.cursor(),'asia','the view cursorId (world) does not override the UI cursor');
 assert.equal(h.doc.activeElement,h.card('asia'),'focus survives the re-sort');
 assert.equal(h.card('asia').getAttribute('aria-label'),'آسيا · 16 فرعًا · 11 دولة · 2 من 5 · تأكيد');
 assert.equal(h.card('asia').querySelector('.explorer-card-index').textContent,'02');assert.equal(h.current().querySelector('.explorer-pager-count').textContent,'2 / 5');
 assert.equal(h.root.children[0].textContent,'استكشف');
 // A cursor id that disappeared falls back to the view's cursor.
 h.selector.show({...L1_AR,items:L1_AR.items.filter(item=>item.id!=='asia'),cursorId:'africa'});
 assert.equal(h.cursor(),'africa');assert.equal(nodes.get('asia').parentNode,null);assert.equal(h.doc.activeElement,h.card('africa'),'focus moves off the removed card');
});

test('the campus screen: visible heading as focus target, siblings keep focus on the pill, back ascends',()=>{
 const h=harness();h.selector.show(l3France('paris'),{focus:true});
 h.onValidate=target=>h.selector.show(target.kind==='campus'?campusView(target.id):l3France(),{direction:'descend',focus:h.root.contains(h.doc.activeElement)});
 h.onAscend=()=>h.selector.show(l3France(h.current().querySelector('[aria-current=true]').dataset.id),{direction:'ascend',focus:h.root.contains(h.doc.activeElement)});
 assert.equal(h.current().querySelector('.explorer-eyebrow').textContent,'3 · Campus · France');
 h.press('Enter');assert.deepEqual(h.calls.validate,[{kind:'campus',id:'paris'}]);
 const screen=h.current(),heading=screen.querySelector('h2');
 assert.equal(screen.localName,'section');assert.equal(screen.className,'explorer-campus');assert.equal(screen.getAttribute('aria-labelledby'),heading.id);
 assert.match(heading.id,/^explorer-campus-title-\d+$/);assert.equal(heading.tabIndex,-1);assert.equal(heading.textContent,'42 Paris');assert.equal(h.doc.activeElement,heading);
 assert.equal(screen.querySelector('.explorer-eyebrow').textContent,'Campus · France');
 const back=screen.querySelector('.explorer-campus-back');assert.equal(back.getAttribute('aria-label'),'Revenir aux campus · France');assert.equal(back.textContent,'France');
 assert.equal(back.querySelector('use').getAttribute('href'),'#i-back');
 const strip=screen.querySelector('.explorer-siblings');assert.equal(strip.localName,'nav');assert.equal(strip.getAttribute('aria-label'),'Tous les campus · France');assert.equal(strip.hidden,false);
 const pills=strip.querySelectorAll('button[data-id]');assert.deepEqual(pills.map(pill=>pill.dataset.id),FRENCH_CAMPUSES.map(([id])=>id));
 assert.deepEqual(pills.filter(pill=>pill.getAttribute('aria-current')==='true').map(pill=>pill.dataset.id),['paris']);
 assert.equal(pills[6].querySelector('use').getAttribute('href'),'#i-check');
 assert.deepEqual(h.calls.renders,[{campusId:'paris',locale:'fr'}]);
 const body=screen.querySelector('.explorer-campus-body');assert.equal(body.children[0].className,'campus-details');assert.equal(body.children[0].dataset.campus,'paris');
 // A sibling switch keeps the same screen, the same pill node and its focus; aria-current moves.
 const lyon=pills[2];lyon.focus();h.press('Enter');
 assert.deepEqual(h.calls.validate.at(-1),{kind:'campus',id:'lyon'});assert.equal(h.current(),screen);assert.equal(h.doc.activeElement,lyon);
 assert.equal(lyon.getAttribute('aria-current'),'true');assert.equal(pills[6].getAttribute('aria-current'),null);assert.equal(heading.textContent,'42 Lyon');
 assert.deepEqual(h.calls.renders.at(-1),{campusId:'lyon',locale:'fr'});assert.deepEqual(h.calls.destroys,[{campusId:'paris',locale:'fr'}]);
 assert.equal(body.children.length,1);assert.equal(body.children[0].dataset.campus,'lyon');
 lyon.click();assert.equal(h.calls.validate.length,2,'the current campus pill does nothing');
 // The back button ascends to the campus carousel, the cursor and focus on the campus we came from.
 back.click();assert.equal(h.calls.ascend,1);assert.equal(h.current().dataset.level,'campuses');assert.equal(h.cursor(),'lyon');assert.equal(h.doc.activeElement,h.card('lyon'));
 assert.equal(screen.inert,true);
});

test('the sibling strip scrolls the current campus into its own view only',()=>{
 const h=harness();h.selector.show(campusView('angouleme'));
 const strip=h.current().querySelector('.explorer-siblings');assert.equal(strip.scrollLeft,0,'already visible');
 h.selector.show(campusView('paris'));assert.equal(strip.scrollLeft,510,'42 Paris, the seventh pill, is centred in the strip');
 const pill=strip.querySelector('[aria-current=true]');assert.equal(pill.getBoundingClientRect().left+50,h.current().querySelector('.explorer-siblings').getBoundingClientRect().left+200);
 h.selector.show(campusView('perpignan'));assert.equal(strip.scrollLeft,510,'a visible current pill does not move the strip');
 assert.equal(h.doc.scrolled.length,0,'no scrollIntoView, so no ancestor scrolls');
});

test('renderCampus runs again only for another campus or another language, keeping the scroll',()=>{
 const h=harness();h.selector.show(campusView('paris'));
 const screen=h.current(),body=screen.querySelector('.explorer-campus-body');
 h.selector.show(campusView('paris'));h.selector.localize();assert.equal(h.calls.renders.length,1);
 Object.assign(body,{scrollHeight:1000,clientHeight:400,scrollTop:300});
 screen.querySelector('.campus-details-link').focus();
 h.state.locale='en';h.selector.localize();
 assert.deepEqual(h.calls.renders.at(-1),{campusId:'paris',locale:'en'});assert.deepEqual(h.calls.destroys,[{campusId:'paris',locale:'fr'}]);
 assert.equal(body.scrollTop,300);assert.equal(h.doc.activeElement,screen.querySelector('h2'),'focus that was in the body goes to the heading');
 assert.equal(body.querySelector('.campus-details').lang,'en');
 h.selector.show(campusView('paris','en'));assert.equal(h.calls.renders.length,2,'the same campus in the same language is not mounted again');
 assert.equal(screen.querySelector('.explorer-campus-back').getAttribute('aria-label'),'Back to campuses · France');
 assert.equal(screen.querySelector('.explorer-siblings').getAttribute('aria-label'),'All campuses · France');
 assert.equal(screen.querySelector('.explorer-eyebrow').textContent,'Campus · France');
 // The kept position is clamped to the new content, and a language change through show() also re-mounts.
 Object.assign(body,{scrollHeight:500,clientHeight:400,scrollTop:300});h.outside.focus();
 h.state.locale='ar';h.selector.show(campusView('paris','ar'));
 assert.deepEqual(h.calls.renders.at(-1),{campusId:'paris',locale:'ar'});assert.equal(h.calls.renders.length,3);assert.equal(body.scrollTop,100);
 assert.equal(h.doc.activeElement,h.outside,'focus outside the body stays where it is');
 assert.equal(screen.querySelector('.explorer-campus-back').getAttribute('aria-label'),'العودة إلى فروع فرنسا');
 assert.equal(screen.querySelector('.explorer-siblings').getAttribute('aria-label'),'جميع فروع فرنسا');
 assert.equal(screen.querySelector('.explorer-eyebrow').textContent,'الفرع · فرنسا');
 h.selector.show(campusView('nice','ar'));assert.equal(h.calls.renders.length,4);assert.equal(body.scrollTop,0,'another campus starts at the top');
});

test('a one-card level and its campus: both arrows disabled, keys and wheel inert, no sibling strip',async()=>{
 const h=harness();h.selector.show(L3_ALBANIA,{focus:true});await h.later();
 assert.deepEqual(h.cards().map(card=>card.dataset.id),['tirana']);assert.equal(h.cursor(),'tirana');
 assert.equal(h.nav('prev').getAttribute('aria-disabled'),'true');assert.equal(h.nav('next').getAttribute('aria-disabled'),'true');
 assert.equal(h.current().querySelector('.explorer-pager-count').textContent,'1 / 1');assert.equal(h.card('tirana').getAttribute('aria-label'),'42 Tirana · Albanie · 1 sur 1 · Valider');
 assert.equal(h.card('tirana').querySelector('.explorer-card-dots').children.length,0);
 for(const key of ['ArrowRight','ArrowLeft','Home','End'])h.key(key);
 h.wheel({deltaY:120});h.nav('next').click();assert.equal(h.cursor(),'tirana');assert.equal(h.calls.announce.length,0);
 h.selector.show(TIRANA,{direction:'descend'});
 assert.equal(h.current().querySelector('.explorer-siblings').hidden,true);assert.equal(h.current().querySelectorAll('button[data-id]').length,0);
});

test('the wheel steps once per gesture, follows the reading direction and leaves zoom gestures alone',async()=>{
 const h=harness();h.selector.show(L1_FR);
 assert.equal(h.wheel({deltaY:30}).defaultPrevented,true,'registered as a non-passive listener');assert.equal(h.cursor(),'world');
 h.wheel({deltaY:30});assert.equal(h.cursor(),'africa');
 h.wheel({deltaY:200});h.wheel({deltaY:200});assert.equal(h.cursor(),'africa','inertia is ignored until the wheel rests');
 await h.later(150);h.wheel({deltaY:4,deltaMode:1});assert.equal(h.cursor(),'americas','lines count 16 px');
 await h.later(150);h.wheel({deltaX:-60,deltaY:10});assert.equal(h.cursor(),'africa','the dominant horizontal axis');
 await h.later(150);const zoom=h.wheel({deltaY:-200,ctrlKey:true});assert.equal(zoom.defaultPrevented,false);assert.equal(h.cursor(),'africa');
 assert.equal(h.wheel({deltaY:-1,metaKey:true}).defaultPrevented,false);
 assert.equal(h.doc.activeElement,h.doc.body,'the wheel never takes the focus');assert.equal(h.calls.announce.length+h.calls.validate.length,0);
 const rtl=harness({dir:'rtl',locale:'ar'});rtl.selector.show(L1_AR);
 rtl.wheel({deltaX:-60});assert.equal(rtl.cursor(),'asia','in RTL a leftward swipe goes forward');
 await rtl.later(150);rtl.wheel({deltaX:60});assert.equal(rtl.cursor(),'world');
});

test('no animate() call under reduced motion; turning it on cancels what runs and drops the outgoing level',async()=>{
 const h=harness({reduced:true});h.selector.show(L1_FR,{focus:true});
 h.nav('next').click();h.key('ArrowRight',{},h.card('africa'));h.wheel({deltaY:80});
 h.selector.show(l3France('paris'),{direction:'descend'});h.selector.show(campusView('paris'),{direction:'descend'});h.selector.show(l3France('paris'),{direction:'ascend'});
 assert.equal(h.doc.animations.length,0);assert.equal(h.screens().length,1,'outgoing levels are removed at once');
 const m=harness();m.selector.show(L1_FR);m.nav('next').click();assert.equal(m.doc.animations.length,1,'the track centring transition');
 assert.equal(m.doc.animations[0].options.duration,320);
 m.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(m.screens().length,2);
 m.media.set(true);
 assert.ok(m.doc.animations.every(animation=>animation.playState==='idle'));assert.equal(m.screens().length,1);
 await flush();assert.equal(m.screens().length,1);
});

test('the validated card grows into the campus screen; without a visible card the generic transition plays',async()=>{
 const h=harness();h.selector.show(l3France('paris'));
 const card=h.card('paris');assert.deepEqual([card.getBoundingClientRect().left,card.getBoundingClientRect().top],[570,368]);
 h.selector.show(campusView('paris'),{direction:'descend'});
 const screen=h.current(),surface=h.root.children.find(node=>node.classList.contains('explorer-campus-surface'));
 assert.ok(surface);assert.equal(surface.getAttribute('aria-hidden'),'true');assert.equal(screen.dataset.growing,'true');
 assert.equal(h.root.children.indexOf(surface)+1,h.root.children.indexOf(screen),'the surface sits under the panel');
 const grow=h.doc.animations.find(animation=>animation.element===surface);
 assert.deepEqual(grow.keyframes,[{clipPath:'inset(200px 370px 132px 370px round 20px)'},{clipPath:'inset(0px round 20px)'}]);assert.equal(grow.options.duration,360);
 assert.equal(h.doc.animations.some(animation=>animation.keyframes.some(frame=>/scale/.test(frame.transform||''))),false,'text is never scaled');
 grow.finish();await flush();
 assert.equal(surface.parentNode,null);assert.equal(screen.dataset.growing,undefined);
 const fades=h.doc.animations.filter(animation=>animation.element.parentNode===screen);
 assert.equal(fades.length,3);assert.deepEqual(fades[0].keyframes,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}]);assert.equal(fades[0].options.duration,210);
 await h.finish();assert.equal(h.screens().length,1);
 // A deep link, the dice or Back/Forward have no visible source card: the generic descend plays.
 const g=harness();g.selector.show(L1_FR);g.selector.show(campusView('paris'),{direction:'descend'});
 assert.equal(g.root.children.some(node=>node.classList.contains('explorer-campus-surface')),false);
 assert.deepEqual(g.doc.animations.map(animation=>animation.keyframes[0].transform),['none','translateX(24px)']);
 // A new view during the growth removes the surface and the outgoing level at once.
 h.selector.show(l3France('nice'),{direction:'ascend'});h.selector.show(campusView('nice'),{direction:'descend'});
 const pending=h.root.children.find(node=>node.classList.contains('explorer-campus-surface'));assert.ok(pending);
 h.selector.show(l3France('nice'),{direction:'ascend'});
 assert.equal(pending.parentNode,null);assert.equal(h.root.children.filter(node=>node.classList.contains('explorer-campus')).length,1);
});

test('centring follows measured rectangles and a resize recentres the cursor card',()=>{
 const h=harness();h.selector.show(L1_FR);const track=h.current().querySelector('.explorer-track');
 assert.equal(translation(track),316);
 h.key('End',{},h.card('world'));assert.equal(translation(track),316-4*316);
 track.style.transform='translateX(5px)';for(const observer of h.doc.observers)observer.callback([]);
 assert.equal(translation(track),316-4*316);assert.ok(h.doc.observers.some(observer=>observer.targets.has(h.viewport())));
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.equal(h.doc.observers.some(observer=>observer.targets.has(track)),false,'the outgoing track is no longer observed');
});

test('destroy removes the listeners, the screens and the title it created',()=>{
 const h=harness();h.selector.show(campusView('paris'),{focus:true});
 const screen=h.current();h.selector.destroy();
 assert.equal(h.root.children.length,0);assert.equal(screen.parentNode,null);assert.equal(h.selector.hasView(),false);
 assert.deepEqual(h.calls.destroys,[{campusId:'paris',locale:'fr'}]);
 assert.equal(h.root.listeners.length,0);assert.equal(h.media.listeners.length,0);
 h.selector.show(L1_FR);assert.equal(h.root.children.length,0);
 const kept=harness({title:true});kept.selector.destroy();assert.equal(kept.root.children[0].id,'explorer-title');
});

// The views come from explorer-model.mjs, written in parallel: check the shared contract once it exists.
const modelURL=new URL('./explorer-model.mjs',import.meta.url),hasModel=await access(modelURL).then(()=>true,()=>false);
test('contract: the three literal views built by explorer-model.mjs render as specified',{skip:!hasModel&&'explorer-model.mjs is not there yet'},async()=>{
 const {buildExplorerView}=await import(modelURL.href);
 const network=JSON.parse(await readFile(new URL('./campuses.json',import.meta.url),'utf8')),catalog={countries:network.countries,campuses:network.campuses};
 const countryName=locale=>{const names=new Intl.DisplayNames(locale,{type:'region'});return id=>{const country=network.countries.find(entry=>entry.id===id);return names.of(country.iso2)||country.name;};};
 const fr=harness();fr.selector.show(buildExplorerView({scope:{level:'world'},catalog,locale:'fr',countryName:countryName('fr')}));
 assert.deepEqual(fr.cards().map(card=>card.dataset.id),['world','africa','americas','asia','europe']);
 assert.equal(fr.card('world').getAttribute('aria-label'),'Monde · 58 campus · 30 pays · 1 sur 5 · Valider');
 assert.equal(fr.card('africa').getAttribute('aria-label'),'Afrique · 6 campus · 3 pays · 2 sur 5');
 assert.equal(fr.card('world').querySelector('.explorer-card-dots').children.length,58);assert.equal(fr.current().querySelector('.explorer-eyebrow').textContent,'1 · Continent');
 const ar=harness({locale:'ar',dir:'rtl'});ar.selector.show(buildExplorerView({scope:{level:'continent',continent:'europe'},catalog,locale:'ar',countryName:countryName('ar')}));
 assert.equal(ar.current().querySelector('.explorer-eyebrow').textContent,'2 · الدولة · أوروبا');assert.equal(ar.cards().length,14);
 assert.equal(ar.card('FRA').getAttribute('aria-label'),`فرنسا · 8 فروع · ${ar.cards().indexOf(ar.card('FRA'))+1} من 14`);
 const en=harness({locale:'en'});en.selector.show(buildExplorerView({scope:{level:'campus',country:'FRA',campus:'paris'},catalog,locale:'en',countryName:countryName('en')}),{focus:true});
 const screen=en.current();assert.equal(screen.querySelector('h2').textContent,'42 Paris');assert.equal(en.doc.activeElement,screen.querySelector('h2'));
 assert.equal(screen.querySelector('.explorer-campus-back').getAttribute('aria-label'),'Back to campuses · France');assert.equal(screen.querySelector('.explorer-eyebrow').textContent,'Campus · France');
 const pills=screen.querySelectorAll('button[data-id]');assert.equal(pills.length,8);assert.equal(pills[0].textContent,'42 Angoulême');assert.equal(pills.at(-1).textContent,'42 Perpignan');
 assert.deepEqual(pills.filter(pill=>pill.getAttribute('aria-current')==='true').map(pill=>pill.dataset.id),['paris']);
 assert.deepEqual(en.calls.renders,[{campusId:'paris',locale:'en'}]);
});

