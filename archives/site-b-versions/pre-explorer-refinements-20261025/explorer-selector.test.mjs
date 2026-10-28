import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {createExplorerSelector,haloGeometry,floorAt,layoutItems,pagerDots} from './explorer-selector.mjs';

// A rich fake DOM: attributes, dataset, classList, style with custom properties, focus with inert/fixup on removal,
// capture and bubble dispatch, passive listeners, pointer capture, a layout computed from the selector's own
// variables, controllable animations, frames, timers, ResizeObserver and matchMedia. :focus-visible matches the focused
// node unless doc.pointerFocus says a pointer press focused it; doc.rects and doc.computed let a test place a node and
// give it computed styles.
const HTML='http://www.w3.org/1999/xhtml',SVGNS='http://www.w3.org/2000/svg';
const kebab=name=>name.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());
const camel=name=>name.replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
const flush=async()=>{for(let n=0;n<12;n++)await Promise.resolve();};
const near=(actual,expected,tolerance,message)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${message??''} ${actual} ≠ ${expected} ±${tolerance}`);
function compile(selector){
 return selector.split(',').map(part=>{
  let rest=part.trim();const tests=[];
  const tag=rest.match(/^[a-zA-Z][\w-]*/);if(tag){const name=tag[0].toLowerCase();tests.push(node=>node.localName===name);rest=rest.slice(tag[0].length);}
  while(rest){
   const id=rest.match(/^#([\w-]+)/),cls=rest.match(/^\.([\w-]+)/),attr=rest.match(/^\[([\w-]+)(?:=(?:"([^"]*)"|([^\]]*)))?\]/),visible=rest.match(/^:focus-visible/);
   if(id){tests.push(node=>node.id===id[1]);rest=rest.slice(id[0].length);}
   else if(cls){tests.push(node=>node.classList.contains(cls[1]));rest=rest.slice(cls[0].length);}
   else if(attr){const value=attr[2]??attr[3];tests.push(node=>node.hasAttribute(attr[1])&&(value===undefined||node.getAttribute(attr[1])===value));rest=rest.slice(attr[0].length);}
   else if(visible){tests.push(node=>node.ownerDocument.activeElement===node&&!node.ownerDocument.pointerFocus);rest=rest.slice(visible[0].length);}
   else throw new Error('Unsupported selector '+selector);
  }
  return node=>tests.every(check=>check(node));
 });
}
class FakeEvent{
 constructor(type,init={}){
  Object.assign(this,{bubbles:true,cancelable:true,detail:0,key:'',repeat:false,isComposing:false,altKey:false,ctrlKey:false,metaKey:false,shiftKey:false,isPrimary:true,button:0,pointerId:1,pointerType:'mouse',clientX:0,clientY:0,deltaX:0,deltaY:0,deltaMode:0,propertyName:''},init);
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
  Object.assign(this,{ownerDocument:doc,localName:String(tag).toLowerCase(),namespaceURI:namespace,children:[],parentNode:null,attrs:new Map(),listeners:[],style:new FakeStyle(),text:'',scrollTop:0,scrollLeft:0,scrollHeight:0,scrollWidth:0,open:false,isContentEditable:false,capturedPointer:null,sizes:{}});
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
 // Sizes come from the document's fake screen (carousel, root, names) or from values a test sets.
 get clientWidth(){return this.sizes.clientWidth??this.ownerDocument.size(this,'clientWidth');}set clientWidth(value){this.sizes.clientWidth=value;}
 get clientHeight(){return this.sizes.clientHeight??this.ownerDocument.size(this,'clientHeight');}set clientHeight(value){this.sizes.clientHeight=value;}
 get offsetWidth(){return this.ownerDocument.size(this,'offsetWidth');}
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

// Fake screens: the stage's content box (the band), the carousel measured inside it and where it sits.
const DESKTOP={W:1440,height:900,band:518.7,gutter:48,top:178.3,H:411,carouselTop:207.5};
const PHONE={W:390,height:844,band:481.2,gutter:24,top:174.84,H:377.1,carouselTop:204.04};
const LANDSCAPE={W:667,height:375,band:76.2,gutter:24,top:156.84,H:76.2,carouselTop:156.84};
const rect=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height,x:left,y:top});
const varOf=(element,name)=>Number.parseFloat(element?.style?.[name]);
// The heart logo of the stub sheet, where the FLIP lands.
const HEART={left:678,top:230,width:84,height:60};
function itemRect(doc,button){
 const screen=doc.screen,top=screen.carouselTop-170,x=varOf(button,'--x')||0,y=varOf(button,'--y')||0;
 if(button.style['--w0']==='auto'){const width=button.dataset.off==='0'?250:72;return rect(x-width/2,top+y,width,44);}
 const s=varOf(button,'--s')||1,h0=varOf(button.parentNode,'--h0')||0,width=(varOf(button,'--w0')||0)*s;
 return rect(x-width/2,top+y+h0-h0*s,width,(h0+78)*s);
}
function layout(doc,element){
 const screen=doc.screen,classes=element.classList,placed=doc.rects.get(element);
 if(placed)return placed();
 if(element.id==='explorer')return rect(0,0,screen.W,screen.height);
 if(classes.contains('explorer-level'))return rect(screen.gutter,screen.top,screen.W-2*screen.gutter,screen.band);
 if(classes.contains('explorer-campus'))return rect(0,148,screen.W,549);
 if(classes.contains('explorer-carousel'))return rect(0,screen.carouselTop,screen.W,screen.H);
 if(classes.contains('explorer-item'))return itemRect(doc,element);
 if(classes.contains('hx-logo')&&'heartLogo' in element.dataset)return rect(HEART.left,HEART.top,HEART.width,HEART.height);
 if(classes.contains('hx-logo')){
  const button=element.closest('.explorer-item');if(!button)return rect(0,0,0,0);
  const box=itemRect(doc,button),s=varOf(button,'--s')||1,h0=varOf(button.parentNode,'--h0')||0,k=s*(varOf(button,'--lk')||1);
  const width=Number.parseFloat(element.style.width)*k,height=Number.parseFloat(element.style.height)*k;
  return rect(box.left+box.width/2-width/2,box.top+h0*s/2-height/2,width,height);
 }
 // The sibling list shows 400 px (or the clientWidth a test sets) of 110 px-pitch pills, moved by its own scrollLeft;
 // in RTL the first pill stands at the right and scrollLeft runs from 0 to negative values.
 if(classes.contains('explorer-siblings-list'))return rect(300,640,element.sizes.clientWidth||400,52);
 if(classes.contains('explorer-sibling')){
  const list=element.parentNode,frame=layout(doc,list),index=list.children.indexOf(element);
  if(doc.documentElement.dir==='rtl')return rect(frame.right-index*110-100-list.scrollLeft,frame.top+4,100,44);
  return rect(frame.left+index*110-list.scrollLeft,frame.top+4,100,44);
 }
 return rect(0,0,0,0);
}
function size(doc,element,name){
 const screen=doc.screen,classes=element.classList;
 if(name==='offsetWidth'){
  if(classes.contains('explorer-level')){doc.flushes++;return screen.W-2*screen.gutter;}
  if(classes.contains('explorer-name'))return doc.nameWidth(element);
  if(classes.contains('explorer-count'))return 55;
  return 0;
 }
 if(element.id==='explorer')return name==='clientWidth'?screen.W:screen.height;
 if(classes.contains('explorer-carousel'))return name==='clientWidth'?screen.W:screen.H;
 return 0;
}
function createDocument({dir='ltr',lang='fr',screen=DESKTOP,coarse=false}={}){
 let clock=1000,nextTimer=0,nextFrame=0;const timers=new Map(),frames=new Map();
 const doc={focusLog:[],scrolled:[],animations:[],observers:[],activeElement:null,flushes:0,screen:{...screen},nameWidth:element=>element.textContent.length*10,
  pointerFocus:false,rects:new Map(),computed:new Map()};
 doc.createElement=tag=>new FakeElement(doc,tag);doc.createElementNS=(namespace,tag)=>new FakeElement(doc,tag,namespace);
 doc.documentElement=new FakeElement(doc,'html');doc.documentElement.dir=dir;doc.documentElement.lang=lang;
 doc.body=new FakeElement(doc,'body');doc.documentElement.append(doc.body);doc.activeElement=doc.body;
 doc.getElementById=id=>doc.documentElement.querySelector('#'+id);
 doc.layout=element=>layout(doc,element);doc.size=(element,name)=>size(doc,element,name);
 class FakeResizeObserver{constructor(callback){this.callback=callback;this.targets=new Set();this.options=new Map();doc.observers.push(this);}observe(target,options){this.targets.add(target);this.options.set(target,options);}unobserve(target){this.targets.delete(target);this.options.delete(target);}disconnect(){this.targets.clear();this.options.clear();}}
 const coarseQuery={matches:coarse,listeners:[],addEventListener(type,callback){if(type==='change')this.listeners.push(callback);},removeEventListener(type,callback){this.listeners=this.listeners.filter(entry=>entry!==callback);},set(value){this.matches=value;for(const callback of [...this.listeners])callback({matches:value});}};
 doc.coarse=coarseQuery;
 doc.defaultView={performance:{now:()=>clock},setTimeout:(callback,delay=0)=>{timers.set(++nextTimer,{callback,at:clock+delay});return nextTimer;},clearTimeout:id=>timers.delete(id),
  requestAnimationFrame:callback=>{frames.set(++nextFrame,callback);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),
  // The stage's paddings are the band's insets (§3.1); only the root is ever asked.
  getComputedStyle:element=>element.id==='explorer'?{paddingLeft:doc.screen.gutter+'px',paddingRight:doc.screen.gutter+'px',paddingTop:doc.screen.top+'px',paddingBottom:(doc.screen.height-doc.screen.top-doc.screen.band)+'px'}:doc.computed.get(element)??{},
  ResizeObserver:FakeResizeObserver,matchMedia:query=>query==='(hover:none) and (pointer:coarse)'?coarseQuery:{matches:false,addEventListener(){},removeEventListener(){}}};
 doc.advance=async ms=>{clock+=ms;for(const [id,timer]of [...timers])if(timer.at<=clock&&timers.delete(id))timer.callback();await flush();};
 doc.runFrames=()=>{for(const [id,callback]of [...frames]){frames.delete(id);callback();}};
 doc.timers=timers;doc.frames=frames;
 doc.resize=changes=>{Object.assign(doc.screen,changes);for(const observer of doc.observers)observer.callback([]);};
 return doc;
}

// A fake explorerArt (§7.5) recording its calls; fitLogo uses the real formula of §7.1.
const PRINTS={paris:{kind:'mask',src:'assets/campus-logos/print/paris.png',width:193,height:138,aspectRatio:1.3986},nice:{kind:'mask',src:'print/nice.png',aspectRatio:2.1375},
 mulhouse:{kind:'mask',src:'print/mulhouse.png',aspectRatio:2.339},perpignan:{kind:'mask',src:'print/perpignan.png',aspectRatio:3.6711},lyon:{kind:'mask',src:'print/lyon.png',aspectRatio:2.2}};
const realFitLogo=(print,maxW,maxH,{minH=0}={})=>{const ar=Number(print?.aspectRatio)>0?Number(print.aspectRatio):3,height=Math.max(Math.min(maxH,maxW/ar),minH);return {width:height*ar,height};};
const shape=(viewBox,label)=>({viewBox,d:'M0 0L10 0L10 10Z',label});
const SHAPES={continents:{africa:shape('0 0 92 100',[58.5,44.5]),americas:shape('0 0 60 100',[39.7,64.9]),asia:shape('0 0 100 90',[45.8,46]),europe:shape('0 0 100 80',[52.1,53.3])},
 countries:Object.fromEntries(['ALB','DEU','AUT','BEL','ESP','FRA','ITA','LUX','NLD','POL','PRT','GBR','CHE','CZE'].map((id,index)=>[id,shape(`0 0 100 ${70+index*3}`,[40+index,45])]))};
function fakeArt({shapes=SHAPES,prints=PRINTS}={}){
 const calls={defs:0,silhouettes:[],dots:[],logos:[],icons:[]};
 const element=(doc,tag,className,namespace=SVGNS)=>{const node=namespace===SVGNS?doc.createElementNS(SVGNS,tag):doc.createElement(tag);node.setAttribute('class',className);return node;};
 const art={calls,shapes,
  ensureArtDefs(){calls.defs++;},
  createSilhouette(doc,options){calls.silhouettes.push(options);const svg=element(doc,'svg','hx-art');svg.setAttribute('data-kind',options.kind);return svg;},
  createDots(doc,options){calls.dots.push(options);return element(doc,'svg','hx-dots');},
  createPrintedLogo(doc,{print,width,height}){calls.logos.push({print,width,height});const node=element(doc,'span','hx-logo',HTML);node.style.width=width+'px';node.style.height=height+'px';return node;},
  fitLogo:realFitLogo,
  icon(doc,name){calls.icons.push(name);const svg=element(doc,'svg','hx-icon');svg.setAttribute('data-icon',name);return svg;},
  flagHref:id=>'assets/flags/'+id.toLowerCase()+'.svg',
  logo:id=>prints[id]||null,
 };
 return art;
}

// Hand-made views with the exact shapes of explorer-model.mjs. Level 1 holds the four continents only (Monde removed,
// 25 Oct 2026), the cursor on the first.
const continent=(id,name,campuses,countries,countText)=>({kind:'continent',id,name,campuses,countries,countText,ariaLabel:`${name} · ${countText}`});
const L1_FR={key:'continents',level:'continents',depth:1,parent:null,step:{index:1,total:3},cursorId:'africa',items:[
 continent('africa','Afrique',6,3,'6 campus · 3 pays'),continent('americas','Amériques',4,2,'4 campus · 2 pays'),
 continent('asia','Asie',16,11,'16 campus · 11 pays'),continent('europe','Europe',32,14,'32 campus · 14 pays')]};
// Same key in Arabic: Intl.Collator('ar') puts Asia first.
const L1_AR={key:'continents',level:'continents',depth:1,parent:null,step:{index:1,total:3},cursorId:'asia',items:[
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

// renderCampus stand-in with B's handle (§7.4): heading, lantern and logo, heart items, wings, destroy.
function stubSheet(container,campusId,locale,options,calls){
 const doc=container.ownerDocument,node=(tag,className,text)=>{const element=doc.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
 const section=container.parentNode;
 calls.renders.push({campusId,locale,options,section:{connected:section.isConnected,density:section.dataset.density,band:section.style['--explorer-band'],entering:'entering' in section.dataset,first:section.children[0]?.className}});
 if(calls.noSheet)return null;
 const root=node('div','explorer-sheet');root.lang=locale;root.dir=locale==='ar'?'rtl':'ltr';root.dataset.campus=campusId;
 const heart=node('div','explorer-sheet-heart'),lantern=node('span','explorer-sheet-lantern'),logo=node('span','hx-logo');logo.dataset.heartLogo='';lantern.append(logo);
 const heading=node('h2','explorer-sheet-title',FRENCH_CAMPUSES.find(([id])=>id===campusId)?.[1]??campusId);heading.id=options?.headingId;heading.tabIndex=-1;
 const countryLine=node('p','explorer-sheet-country','France'),cta=node('a','explorer-sheet-cta','Site officiel du campus');cta.setAttribute('href','https://example.invalid/'+campusId);
 heart.append(lantern,heading,countryLine,cta);
 const start=node('div','explorer-sheet-wing'),end=node('div','explorer-sheet-wing'),link=node('a','explorer-sheet-link','Itinéraire');start.dataset.wing='start';end.dataset.wing='end';
 link.setAttribute('href','https://example.invalid/route');end.append(link);root.append(heart,start,end);container.append(root);
 return {element:root,heading,lantern,logo,heartItems:[heading,countryLine,cta],wings:{start,end},destroy(){calls.destroys.push({campusId,locale});root.remove();}};
}

function harness({dir='ltr',locale='fr',reduced=false,title=false,art=fakeArt(),screen=DESKTOP,coarse=false}={}){
 const doc=createDocument({dir,lang:locale,screen,coarse});
 const app=doc.createElement('div');app.id='app';doc.body.append(app);
 const main=doc.createElement('main');main.id='main';app.append(main);
 const root=doc.createElement('section');root.id='explorer';root.className='explorer-selector';root.tabIndex=-1;
 root.setAttribute('aria-labelledby','explorer-title');root.setAttribute('aria-describedby','loading');main.append(root);
 if(title){const heading=doc.createElement('h1');heading.id='explorer-title';root.append(heading);}
 const outside=doc.createElement('button');outside.id='outside';app.append(outside);
 const state={locale},calls={validate:[],ascend:0,announce:[],renders:[],destroys:[],noSheet:false};
 const media={matches:reduced,listeners:[],addEventListener(type,callback){if(type==='change')this.listeners.push(callback);},removeEventListener(type,callback){this.listeners=this.listeners.filter(entry=>entry!==callback);},set(value){this.matches=value;for(const callback of [...this.listeners])callback({matches:value});}};
 const h={doc,root,outside,state,calls,media,art,onValidate:null,onAscend:null};
 h.selector=createExplorerSelector({root,getLocale:()=>state.locale,motion:media,art,
  onValidate:target=>{calls.validate.push(target);h.onValidate?.(target);},
  onAscend:()=>{calls.ascend++;h.onAscend?.();},
  onAnnounce:text=>calls.announce.push(text),
  renderCampus:(container,campusId,campusLocale,options)=>stubSheet(container,campusId,campusLocale,options,calls)});
 h.screens=()=>root.children.filter(node=>node.classList.contains('explorer-level')||node.classList.contains('explorer-campus'));
 h.current=()=>h.screens().find(node=>!node.inert);
 h.cards=()=>h.current().querySelectorAll('[data-explorer-card]');
 h.card=id=>h.cards().find(card=>card.dataset.id===id);
 h.cursor=()=>h.cards().find(card=>card.dataset.off==='0')?.dataset.id;
 h.nav=direction=>h.current().querySelector(`.explorer-nav[data-dir=${direction}]`);
 h.carousel=()=>h.current().querySelector('.explorer-carousel');
 h.layer=()=>h.current().querySelector('.explorer-items');
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
 h.wheel=init=>h.event('wheel',h.carousel(),init);
 h.later=(ms=400)=>doc.advance(ms);
 h.finish=async()=>{for(const animation of [...doc.animations])animation.finish();await flush();};
 h.vars=button=>Object.fromEntries(Object.entries(button.style).filter(([name])=>name.startsWith('--')));
 return h;
}

/* ---- Pure geometry (§3.4, §3.5, §4.17) ------------------------------------------------------------------------- */
// The §3.4 tables: [viewport, W, H, phone, bh, bw, x1, x2, d1, R, floor0, drop ±1, drop ±2, F, cursor button, fade].
const TABLE_L12=[
 ['1440 FR',1440,411,false,250,340,331.2,565.2,30,1843.2,289.5,30,88.8,32,340,86.4],
 ['1440 AR',1440,395.1,false,250,340,331.2,565.2,30,1843.2,281.5,30,88.8,32,340,86.4],
 ['1366',1366,307.5,false,199.5,283.3,314.2,519.8,23.9,2073.6,212.5,23.9,66.2,25.9,283.3,82],
 ['1280×1024',1280,535,false,250,320,312.8,536.8,30,1645.7,351.5,30,90,32,320,76.8],
 ['1280×720',1280,259.5,false,151.5,215.1,294.4,466,18.2,2392.8,164.5,18.2,45.8,22,220,76.8],
 ['1024 FR',1024,307.5,false,199.5,256,262.2,454.2,23.9,1448.3,212.5,23.9,73.1,25.9,256,61.4],
 ['1024 AR',1024,293.1,false,185.1,256,262.2,454.2,22.2,1559.1,198.1,22.2,67.6,24.1,256,61.4],
 ['768 FR',768,538.6,false,250,192,211.7,371.7,30,761.8,353.3,30,96.8,32,220,46.1],
 ['768 AR',768,520.7,false,250,192,211.7,371.7,30,761.8,344.4,30,96.8,32,220,46.1],
 ['390 FR',390,377.1,true,250,249.6,218.9,null,22.5,1076,272.6,22.5,null,32,249.6,58.2],
 ['390 AR',390,359.2,true,250,249.6,218.9,null,22.5,1076,263.6,22.5,null,32,249.6,58.2],
 // 320: cursor button 212 and fade 42 since fix 8 (25 Oct 2026; the § 3.4 table said 220 and 38, 4 px from the ±1 art).
 ['320',320,204,true,96,136.3,152.2,null,8.6,1344.3,109,8.6,null,22,212,42],
];
const TABLE_L3=[
 ['1440 FR',1440,411,false,200,200,331.2,495.2,24,2297.3,260.5,24,54,22,220,86.4],
 ['1440 AR',1440,395.1,false,200,200,331.2,495.2,24,2297.3,252.6,24,54,22,220,86.4],
 ['1366',1366,307.5,false,191.5,191.5,314.2,473.9,23,2159.2,204.5,23,52.7,21.1,220,82],
 ['1280×1024',1280,535,false,200,200,294.4,458.4,24,1817.7,322.5,24,58.8,22,220,76.8],
 ['1280×720',1280,259.5,false,143.5,143.5,294.4,430.2,17.2,2525.2,156.5,17.2,36.9,18,220,76.8],
 ['1024 FR',1024,307.5,false,191.5,191.5,235.5,395.3,23,1218.4,204.5,23,65.9,21.1,220,61.4],
 ['1024 AR',1024,293.1,false,177.1,177.1,235.5,388.1,21.3,1315.7,190.1,21.3,58.5,19.5,220,61.4],
 ['768 FR',768,538.6,false,200,200,218,382,24,1002.1,324.3,24,75.7,22,220,46.1],
 ['768 AR',768,520.7,false,200,200,218,382,24,1002.1,315.4,24,75.7,22,220,46.1],
 ['390 FR',390,377.1,true,200,200,205,null,18,1176.4,243.6,18,null,22,220,64],
 ['390 AR',390,359.2,true,200,200,205,null,18,1176.4,234.6,18,null,22,220,64],
 ['320',320,204,true,88,88,138.6,null,7.9,1217.4,101,7.9,null,18,212,42],
];
const five=(ratio=1.36)=>['a','b','c','d','e'].map(id=>({id,kind:'country',ratio}));
test('haloGeometry, floorAt and the edge fade reproduce both tables of §3.4 for the given H',()=>{
 for(const [campus,table]of [[false,TABLE_L12],[true,TABLE_L3]])for(const [name,W,H,phone,bh,bw,x1,x2,d1,R,floor0,drop1,drop2,F,button,fade]of table){
  const g=haloGeometry({W,H,phone,campus,density:'normal'}),label=`${campus?'L3':'L1/L2'} ${name}`;
  assert.equal(g.compact,false);assert.equal(g.phone,phone);assert.equal(g.campus,campus);
  near(g.bh,bh,.15,label+' bh');near(g.bw,bw,.15,label+' bw');near(g.x1,x1,.15,label+' x1');if(x2!==null)near(g.x2,x2,.15,label+' x2');
  near(g.d1,d1,.15,label+' d1');near(g.R,R,.15,label+' R');near(g.floor0,floor0,.15,label+' floor0');near(g.F,F,.15,label+' F');
  near(floorAt(g,g.x1)-g.floor0,drop1,.15,label+' drop ±1');if(drop2!==null)near(floorAt(g,g.x2)-g.floor0,drop2,.15,label+' drop ±2');
  near(floorAt(g,0),g.floor0,1e-9,label+' the cursor stands on floor0');assert.equal(floorAt(g,-g.x1),floorAt(g,g.x1),'the horizon is symmetric');
  const lay=layoutItems({geometry:g,items:five(),cursorIndex:2});
  near(lay.items[2].w0*lay.items[2].s,button,.15,label+' cursor button');near(lay.fade,fade,.15,label+' fade');
  if(phone){assert.equal(g.x2,g.x1+400);near(lay.nmax,W-2*lay.fade-8,1e-9);}else assert.equal(lay.nmax,null);
 }
 // The compact row (§3.5): 853×480 and 667×375 → 60 px, 640×360 → 45.2 px.
 for(const [W,H,bh]of [[853,175.7,60],[667,76.2,60],[640,61.2,45.2]]){
  const g=haloGeometry({W,H,phone:W<700,campus:false,density:'compact'});
  assert.equal(g.compact,true);near(g.bh,bh,.05);near(g.bw,1.5*bh,.1);
 }
});

test('layoutItems: ranks, slots, the mirrored centre, feet on the horizon and « out » items',()=>{
 const g=haloGeometry({W:1440,H:411,phone:false,campus:false,density:'normal'}),items=[...five(),{id:'f',ratio:1.36},{id:'g',ratio:1.36}];
 const lay=layoutItems({geometry:g,items,cursorIndex:2});
 assert.deepEqual(lay.items.map(entry=>entry.off),[-2,-1,0,1,2,'out','out']);
 assert.deepEqual(lay.items.map(entry=>Math.round(entry.s*1000)/1000),[.42,.58,1,.58,.42,.336,.336]);
 assert.deepEqual(lay.items.map(entry=>Math.round(entry.dist*10)/10),[565.2,331.2,0,331.2,565.2,715.2,865.2]);
 assert.deepEqual(lay.items.map(entry=>Math.round(entry.x*10)/10),[154.8,388.8,720,1051.2,1285.2,1435.2,1585.2],'x is the centre, W/2 + dx');
 assert.deepEqual(lay.items.map(entry=>entry.visible),[true,true,true,true,true,false,false]);
 for(const entry of lay.items)near(entry.y+g.bh,170+floorAt(g,entry.dist),1e-9,'the foot stands on the horizon');
 const rtl=layoutItems({geometry:g,items,cursorIndex:2,rtl:true});
 assert.deepEqual(rtl.items.map(entry=>Math.round(entry.x*10)/10),[1285.2,1051.2,720,388.8,154.8,4.8,-145.2],'RTL mirrors the row');
 assert.deepEqual(rtl.items.map(entry=>entry.off),lay.items.map(entry=>entry.off),'data-off stays logical');
 // Effective sizes: names 32 / 16 / 13 (Arabic 14), counts 14 / 13 (Arabic 14), 10 px between the box and the count.
 const [two,one,cursor]=lay.items;
 near(cursor.nk,1,1e-9);near(one.nk,16/32,1e-9);near(two.nk,13/32,1e-9);near(one.ns,.5/.58,1e-9);
 near(cursor.ms,1,1e-9);near(one.ms,13/(14*.58),1e-9);near(two.ms,13/(14*.42),1e-9);near(one.mt,10/.58-10,1e-9);near(cursor.mt,0,1e-9);
 const arabic=layoutItems({geometry:g,items,cursorIndex:2,rtl:true});
 near(arabic.items[0].nk,14/32,1e-9);near(arabic.items[1].ms,14/(14*.58),1e-9);
 assert.equal(layoutItems({geometry:g,items,cursorIndex:2,rtl:true,arabic:false}).items[0].nk,13/32,'arabic follows its own flag');
 // The figure keeps its viewBox ratio inside the cursor box, at the cursor scale and the same at every rank.
 for(const entry of lay.items){near(entry.fh,250,1e-9);near(entry.fw,340,1e-9);}
 const tall=layoutItems({geometry:g,items:[{id:'x',ratio:.8}],cursorIndex:0}).items[0];near(tall.fw,200,1e-9);near(tall.fh,250,1e-9);
 const flat=layoutItems({geometry:g,items:[{id:'x',ratio:2}],cursorIndex:0}).items[0];near(flat.fw,340,1e-9);near(flat.fh,170,1e-9);
 const unknown=layoutItems({geometry:g,items:[{id:'x'}],cursorIndex:0}).items[0];near(unknown.fw,300,1e-9,'name-only items use halo\'s 1.2');
});

test('layoutItems: button widths never overlap, phones use the art, glows keep halo\'s un-narrowed width',()=>{
 // A small desktop window (bh = 84): the ±2 buttons are narrowed to stay 8 px from the ±1 buttons (R16).
 const small=haloGeometry({W:1024,H:192,phone:false,campus:false,density:'short'});near(small.bh,84,1e-9);
 const lay=layoutItems({geometry:small,items:five(1.42),cursorIndex:2}),onScreen=lay.items.map(entry=>entry.w0*entry.s);
 near(onScreen[2],220,1e-9);near(onScreen[3],120,1e-9);near(onScreen[1],120,1e-9);
 near(onScreen[4],2*(small.x2-small.x1-60-8),1e-9,'±2 narrowed');assert.ok(onScreen[4]<120);
 for(const side of [1,-1]){
  const sorted=[2,2+side,2+2*side].map(index=>({left:lay.items[index].x-onScreen[index]/2,right:lay.items[index].x+onScreen[index]/2})).sort((a,b)=>a.left-b.left);
  for(let index=1;index<sorted.length;index++)assert.ok(sorted[index].left-sorted[index-1].right>=8-1e-9,'≥ 8 px between buttons');
 }
 for(const entry of lay.items)assert.ok(entry.w0*entry.s>=entry.fw*entry.s-1e-9,'never narrower than its art');
 // gx: the glow's width factor uses halo's un-narrowed max(base·s, 220 | 120).
 near(lay.items[4].gx,(120/.42)/small.bw,1e-9);near(lay.items[2].gx,220/small.bw,1e-9);
 const big=haloGeometry({W:1440,H:411,phone:false,campus:false,density:'normal'}),wide=layoutItems({geometry:big,items:five(),cursorIndex:2});
 for(const entry of wide.items)near(entry.gx,1,1e-9,'at 1440 every itemW is base·s');
 const l3=layoutItems({geometry:haloGeometry({W:1440,H:411,phone:false,campus:true,density:'normal'}),items:five(1),cursorIndex:2});
 near(l3.items[2].gx,1.1,1e-9);near(l3.items[1].gx,(120/.58)/200,1e-9);
 // Phones: neighbours' buttons are their art; the cursor's keeps 8 px from the widest ±1 art.
 const phone=haloGeometry({W:390,H:377.1,phone:true,campus:false,density:'normal'}),mobile=layoutItems({geometry:phone,items:five(1.1),cursorIndex:2});
 near(mobile.items[1].w0*mobile.items[1].s,mobile.items[1].fw*.56,1e-9);near(mobile.items[2].w0,249.6,.05);
 assert.deepEqual(mobile.items.map(entry=>entry.off),[-2,-1,0,1,2]);assert.deepEqual(mobile.items.map(entry=>entry.visible),[false,true,true,true,false]);
 near(mobile.items[4].dist,phone.x1+400,1e-9,'±2 wait off screen at x1 + 400');
});

test('layoutItems: the edge rule R20 at 768×1024, 1024×768 and 1280×1024',()=>{
 const tablet=layoutItems({geometry:haloGeometry({W:768,H:538.6,phone:false,campus:false,density:'normal'}),items:five(),cursorIndex:2});
 assert.deepEqual(tablet.items.map(entry=>entry.off),['out',-1,0,1,'out'],'768×1024: no ±2');
 near(tablet.items[0].dist,371.7,.05,'an item made « out » by R20 keeps its slot');
 const g=haloGeometry({W:1024,H:307.5,phone:false,campus:false,density:'short'}),nk=13/g.F;
 const named=width=>five().map((item,index)=>({...item,nameWidth:index===4?width/nk:0}));
 assert.equal(layoutItems({geometry:g,items:named(40),cursorIndex:2}).items[4].off,2,'1024×768: a 40 px ±2 name is shown');
 assert.equal(layoutItems({geometry:g,items:named(42),cursorIndex:2}).items[4].off,'out','1024×768: a 42 px ±2 name is out');
 const g2=haloGeometry({W:1280,H:535,phone:false,campus:false,density:'normal'}),nk2=13/g2.F;
 const named2=width=>five().map((item,index)=>({...item,nameWidth:index===0?width/nk2:0}));
 assert.equal(layoutItems({geometry:g2,items:named2(114),cursorIndex:2}).items[0].off,-2,'1280×1024: 114 px shown');
 assert.equal(layoutItems({geometry:g2,items:named2(116),cursorIndex:2}).items[0].off,'out','1280×1024: 116 px out');
 const one=layoutItems({geometry:g,items:five().map(item=>({...item,nameWidth:300})),cursorIndex:2});
 assert.deepEqual(one.items.map(entry=>entry.off),['out',-1,0,1,'out'],'R20 never hides a ±1 item at these widths');
});

test('layoutItems: L3 logo boxes at the cursor scale and the 28 / 22 px floors (worked values of §4.10)',()=>{
 const g=haloGeometry({W:1440,H:411,phone:false,campus:true,density:'normal'});
 const items=['mulhouse','nice','paris','perpignan','lyon'].map(id=>({id,kind:'campus',print:PRINTS[id]}));
 const lay=layoutItems({geometry:g,items,cursorIndex:2,fitLogo:realFitLogo});
 const screen=entry=>({width:entry.logo.width*entry.s*entry.lk,height:entry.logo.height*entry.s*entry.lk});
 const [mulhouse,nice,paris,perpignan]=lay.items;
 near(screen(paris).width,84,.5,'42 Paris cursor 84 × 60');near(screen(paris).height,60,.5);near(paris.lk,1,1e-9);
 near(screen(nice).width,74,.5,'42 Nice ±1 74 × 35');near(screen(nice).height,35,.5);near(nice.lk,1,1e-9);
 near(screen(mulhouse).width,59,.5,'42 Mulhouse ±2 59 × 25');near(screen(mulhouse).height,25,.5);near(mulhouse.lk,1,1e-9);
 near(perpignan.lk,28/(.58*152/3.6711),1e-9,'a 3.6711 mark at ±1 takes the 28 px floor');near(perpignan.lk,1.167,.002);near(screen(perpignan).height,28,.01);near(screen(perpignan).width,103,.5);
 for(const entry of lay.items){near(entry.logo.height,Math.min(60,152/PRINTS[entry.id].aspectRatio),1e-9,'.76·h0 × .30·h0, the same at every rank');assert.ok(entry.lk<=entry.w0/entry.logo.width+1e-9);}
 assert.equal(layoutItems({geometry:g,items,cursorIndex:2}).items[2].logo,null,'no logo without fitLogo');
 assert.equal(layoutItems({geometry:g,items:[{id:'x',kind:'campus'}],cursorIndex:0,fitLogo:realFitLogo}).items[0].logo,null,'no logo without a print');
});

test('layoutItems: phones keep the cursor\'s name inside the unfaded width (R24)',()=>{
 const g=haloGeometry({W:390,H:377.1,phone:true,campus:false,density:'normal'}),fade=layoutItems({geometry:g,items:five(),cursorIndex:2}).fade;
 near(fade,58.2,.05);
 const at=(labelX,nameWidth)=>layoutItems({geometry:g,items:five().map((item,index)=>index===2?{...item,labelX,nameWidth}:item),cursorIndex:2}).items[2];
 near(at(.5,200).nx,0,1e-9,'centred and inside: no shift');
 const right=at(.9,120),centre=195+.4*right.fw;near(right.nx,(390-fade-4)-(centre+60),1e-9,'shifted back inside');assert.ok(right.nx<0);
 near(at(.1,120).nx,(fade+4)-(195-.4*right.fw-60),1e-9);
 near(at(.9,400).nx,195-centre,1e-9,'wider than the room: centred on the screen');
 const l3=layoutItems({geometry:haloGeometry({W:390,H:377.1,phone:true,campus:true,density:'normal'}),items:five(1).map(item=>({...item,kind:'campus',nameWidth:300,labelX:.9})),cursorIndex:2});
 near(l3.fade,64,1e-9);assert.equal(l3.items[2].nx,0,'campus names sit under the lantern');
 near(layoutItems({geometry:haloGeometry({W:320,H:204,phone:true,campus:false,density:'short'}),items:five(),cursorIndex:2}).fade,42,.05,'fix 8: 38 before');
 assert.equal(layoutItems({geometry:haloGeometry({W:1440,H:411,phone:false}),items:five(),cursorIndex:2}).items[2].nx,0);
});

test('phones: at least 8 px between the cursor\'s button and the widest ±1 art, on both sides (fix 8)',()=>{
 const gap=lay=>{const box=entry=>({left:entry.x-entry.w0*entry.s/2,right:entry.x+entry.w0*entry.s/2}),[left,cursor,right]=[1,2,3].map(index=>box(lay.items[index]));return Math.min(cursor.left-left.right,right.left-cursor.right);};
 for(const [W,H,density]of [[320,204,'short'],[360,330,'normal'],[390,377.1,'normal']])for(const campus of [false,true]){
  // Ratio 3: the art fills the cursor box's width, the widest a ±1 art can be (L3 lanterns are always bh wide).
  const g=haloGeometry({W,H,phone:true,campus,density}),lay=layoutItems({geometry:g,items:five(3),cursorIndex:2});
  assert.ok(gap(lay)>=8-1e-9,`${W} ${campus?'L3':'L1/L2'}: ${gap(lay)} px`);
  assert.ok(gap(layoutItems({geometry:g,items:five(.7),cursorIndex:2}))>=8-1e-9,'narrower arts only widen the gap');
 }
 // 320×640: exactly 8 px with the widest art (it was 4); the button W − 108 = 212 px.
 for(const campus of [false,true]){const g=haloGeometry({W:320,H:204,phone:true,campus,density:'short'}),lay=layoutItems({geometry:g,items:five(3),cursorIndex:2});near(gap(lay),8,1e-9);near(lay.items[2].w0,212,1e-9);}
});

test('compact row: no scale, the cursor centred and the others outwards with 26 px gaps',()=>{
 const g=haloGeometry({W:853,H:175.7,phone:false,campus:false,density:'compact'});
 const items=five().map((item,index)=>({...item,width:index===2?250:72,height:index===2?44:44}));
 const lay=layoutItems({geometry:g,items,cursorIndex:2});
 assert.deepEqual(lay.items.map(entry=>entry.off),['out',-1,0,1,'out']);
 assert.deepEqual(lay.items.map(entry=>entry.s),[1,1,1,1,1]);assert.ok(lay.items.every(entry=>entry.w0===null&&entry.nk===1&&entry.lk===1));
 assert.deepEqual(lay.items.map(entry=>entry.x),[426.5-125-26-72-26-36,426.5-125-26-36,426.5,426.5+125+26+36,426.5+125+26+72+26+36]);
 near(lay.items[2].y,170+(175.7-44)/2,1e-9);
 assert.deepEqual(layoutItems({geometry:g,items,cursorIndex:2,rtl:true}).items.map(entry=>entry.x),lay.items.map(entry=>853-entry.x),'RTL mirrors the row');
 // Mini art: the cursor fits bw × bh, a neighbour .8·bw × .8·bh; L3 prints .5·bh / .4·bh tall at most.
 near(lay.items[2].fh,60,1e-9);near(lay.items[1].fh,48,1e-9);
 const l3=layoutItems({geometry:haloGeometry({W:853,H:175.7,phone:false,campus:true,density:'compact'}),items:['nice','paris'].map(id=>({id,kind:'campus',print:PRINTS[id]})),cursorIndex:1,fitLogo:realFitLogo});
 near(l3.items[1].fh,30,1e-9);near(l3.items[0].fh,24,1e-9);
});

test('pagerDots: normal, dense or none, never wider than the band (R15)',()=>{
 assert.equal(pagerDots({n:14,width:1344}),'normal','L2 Europe at 1440');
 assert.equal(pagerDots({n:14,width:1184}),'normal','L2 Europe at 1280');
 assert.equal(pagerDots({n:14,width:342}),'dense','L2 Europe at 390');
 assert.equal(pagerDots({n:30,width:1344}),'dense','30 items at 1440');assert.equal(pagerDots({n:30,width:1184}),'dense');
 assert.equal(pagerDots({n:30,width:342}),'none','30 items on phones');
 assert.equal(pagerDots({n:5,width:342}),'normal');assert.equal(pagerDots({n:8,width:342}),'normal');
 assert.equal(pagerDots({n:5,width:280,viewport:320}),'none','below 381 px of viewport width');
 assert.equal(pagerDots({n:14,width:355,countWidth:55}),'normal','88 + 36 + 55 + 84 + 78 + 14 = 355');
});

/* ---- DOM, copy and accessible names --------------------------------------------------------------------------- */
test('renders a labelled carousel of keyed items with roving focus, the halo head, pager and hint',()=>{
 const h=harness();
 const title=h.root.children[0];assert.equal(title.id,'explorer-title');assert.equal(title.localName,'h1');assert.equal(title.className,'sr-only');assert.equal(title.textContent,'Explorer');
 assert.equal(h.selector.hasView(),false);
 h.selector.show(L1_FR);assert.equal(h.selector.hasView(),true);
 const level=h.current(),prompt=level.querySelector('.explorer-prompt'),group=level.querySelector('.explorer-carousel'),keys=level.querySelector('.explorer-hint-keys');
 assert.equal(h.art.calls.defs,1,'the shared defs come before the first level');
 assert.deepEqual(level.children.map(node=>node.className),['explorer-head','explorer-carousel','explorer-foot']);
 assert.equal(prompt.textContent,'Où veux-tu aller ? · Étape 1 sur 3');assert.equal(prompt.querySelector('.sr-only').textContent,' · Étape 1 sur 3');assert.match(prompt.id,/^explorer-prompt-\d+$/);
 assert.deepEqual(level.querySelectorAll('.explorer-step').map(dot=>dot.dataset.state),['current','todo','todo']);assert.equal(level.querySelector('.explorer-steps').getAttribute('aria-hidden'),'true');
 assert.equal(group.getAttribute('role'),'group');assert.equal(group.getAttribute('aria-roledescription'),'carrousel');
 assert.equal(group.getAttribute('aria-labelledby'),prompt.id);assert.equal(group.getAttribute('aria-describedby'),keys.id,'the visible hint only');
 assert.equal(keys.textContent,'Flèches pour choisir · Entrée pour valider · Échap pour revenir');assert.deepEqual(keys.querySelectorAll('kbd').map(kbd=>kbd.textContent),['Flèches','Entrée','Échap']);
 assert.equal(level.querySelector('.explorer-hint-touch').textContent,'Glisse pour choisir · Touche le centre pour valider');assert.equal(level.querySelector('.explorer-hint-touch').hidden,true);
 const track=level.querySelector('.explorer-track');assert.deepEqual(track.children.map(node=>node.getAttribute('class')),['explorer-horizon','explorer-pool','explorer-items']);
 assert.equal(track.children[0].getAttribute('aria-hidden'),'true');assert.equal(track.children[1].getAttribute('aria-hidden'),'true');
 assert.deepEqual(h.cards().map(card=>card.dataset.id),['africa','americas','asia','europe']);
 const [afrique,ameriques]=h.cards();
 assert.equal(afrique.getAttribute('aria-label'),'Afrique · 6 campus · 3 pays · 1 sur 4 · Valider');assert.equal(ameriques.getAttribute('aria-label'),'Amériques · 4 campus · 2 pays · 2 sur 4');
 assert.equal(afrique.tabIndex,0);assert.ok(h.cards().slice(1).every(card=>card.tabIndex===-1));assert.equal(afrique.type,'button');
 assert.deepEqual([afrique.localName,afrique.className,afrique.dataset.kind,afrique.dataset.off,'explorerCard' in afrique.dataset],['button','explorer-item','continent','0',true]);
 assert.deepEqual(h.cards().map(card=>card.dataset.off),['0','1','2','out']);
 // Item DOM (§4.2): box (glows, figure: art, name, dots), count, chip.
 const [box,meta,go]=afrique.children;
 assert.deepEqual([box.className,meta.className,go.className],['explorer-box','explorer-meta','explorer-go']);
 assert.equal(box.getAttribute('aria-hidden'),'true');assert.equal(meta.getAttribute('aria-hidden'),'true');assert.equal(go.getAttribute('aria-hidden'),'true');
 assert.deepEqual(box.children.map(node=>node.className),['explorer-glow','explorer-glow explorer-glow-cursor','explorer-figure']);
 const figure=box.children[2];assert.deepEqual(figure.children.map(node=>node.getAttribute('class')),['hx-art','explorer-name','hx-dots']);
 assert.equal(figure.children[1].dir,'auto');assert.equal(figure.children[1].textContent,'Afrique');assert.equal(meta.textContent,'6 campus · 3 pays');
 assert.equal(go.textContent,'Valider');assert.equal(go.children[0].getAttribute('data-icon'),'enter');
 assert.equal(h.nav('prev').getAttribute('aria-label'),'Précédent');assert.equal(h.nav('next').getAttribute('aria-label'),'Suivant');
 assert.equal(h.nav('prev').getAttribute('aria-disabled'),'true');assert.equal(h.nav('next').getAttribute('aria-disabled'),null);
 assert.equal(h.nav('prev').children[0].getAttribute('data-icon'),'prev');assert.equal(h.nav('next').children[0].getAttribute('data-icon'),'next');
 const dots=level.querySelector('.explorer-dots'),count=level.querySelector('.explorer-count');
 assert.equal(dots.getAttribute('aria-hidden'),'true');assert.equal(dots.children.length,4);assert.equal(dots.hidden,false);
 assert.deepEqual(dots.children.map(dot=>'current' in dot.dataset),[true,false,false,false]);
 assert.equal(count.textContent,'1 / 4');assert.equal(count.dir,'ltr');assert.equal(count.getAttribute('aria-hidden'),'true');
 // The silhouettes are built once at the cursor scale with the flag of each country: here one per continent.
 assert.deepEqual(h.art.calls.silhouettes.map(call=>call.kind),['continent','continent','continent','continent']);
 near(h.art.calls.silhouettes[0].scale,250*.92/92,1e-9,'k = fw / vbW (Afrique: fw = 250 × .92)');
});

test('an existing title is reused and the Arabic and English copy follow the interface language',()=>{
 const h=harness({title:true,locale:'ar',dir:'rtl'});
 assert.equal(h.root.querySelectorAll('h1').length,1);assert.equal(h.root.children[0].textContent,'استكشف');
 h.selector.show(L2_EUROPE_AR);
 const level=h.current(),keys=level.querySelector('.explorer-hint-keys');
 assert.equal(level.querySelector('.explorer-prompt').textContent,'اختر دولة · المرحلة 2 من 3');
 assert.deepEqual(level.querySelectorAll('.explorer-step').map(dot=>dot.dataset.state),['done','current','todo']);
 assert.equal(level.querySelector('.explorer-carousel').getAttribute('aria-roledescription'),'عرض دوّار');
 assert.equal(h.card('ESP').getAttribute('aria-label'),'إسبانيا · 4 فروع · 1 من 14 · تأكيد');
 assert.equal(h.card('FRA').getAttribute('aria-label'),'فرنسا · 8 فروع · 12 من 14');
 assert.equal(h.nav('prev').getAttribute('aria-label'),'السابق');assert.equal(h.nav('next').getAttribute('aria-label'),'التالي');
 assert.equal(keys.textContent,'الأسهم للاختيار · Enter للتأكيد · Esc للرجوع');
 assert.deepEqual(keys.querySelectorAll('kbd').map(kbd=>[kbd.textContent,kbd.lang]),[['الأسهم',''],['Enter','en'],['Esc','en']]);
 assert.equal(level.querySelector('.explorer-hint-touch').textContent,'اسحب للاختيار · المس العنصر في الوسط للتأكيد');
 assert.equal(level.querySelector('.explorer-count').textContent,'1 / 14');
 // Arabic ±2 names and ±1 counts take the 14 px floor.
 const variables=h.vars(h.card('PRT'));near(Number(variables['--nk']),14/32,1e-4);
 near(Number(h.vars(h.card('ALB'))['--ms']),14/(14*.58),1e-3);
 h.state.locale='en';h.selector.localize();
 assert.equal(h.root.children[0].textContent,'Explore');assert.equal(level.querySelector('.explorer-prompt').textContent,'Choose a country · Step 2 of 3');
 assert.equal(h.card('ESP').getAttribute('aria-label'),'إسبانيا · 4 فروع · 1 of 14 · Select');assert.equal(h.nav('next').getAttribute('aria-label'),'Next');
 assert.equal(level.querySelector('.explorer-hint-keys').textContent,'Arrows to choose · Enter to select · Esc to go back');
 assert.equal(level.querySelector('.explorer-hint-touch').textContent,'Swipe to choose · Tap the centre to select');
 assert.equal(level.querySelector('.explorer-carousel').getAttribute('aria-roledescription'),'carousel');
 near(Number(h.vars(h.card('PRT'))['--nk']),13/32,1e-4,'English ±2 names at 13 px');
});

test('the group is described by the visible hint only, following the coarse-pointer query (H2f)',()=>{
 const h=harness({coarse:true});h.selector.show(L3_ALBANIA);
 const group=h.carousel(),keys=h.current().querySelector('.explorer-hint-keys'),touch=h.current().querySelector('.explorer-hint-touch');
 assert.equal(group.getAttribute('aria-describedby'),touch.id);assert.equal(keys.hidden,true);assert.equal(touch.hidden,false);
 assert.match(keys.id,/^explorer-hint-keys-\d+$/);assert.match(touch.id,/^explorer-hint-touch-\d+$/);
 h.doc.coarse.set(false);
 assert.equal(group.getAttribute('aria-describedby'),keys.id);assert.equal(keys.hidden,false);assert.equal(touch.hidden,true);
 h.selector.destroy();assert.equal(h.doc.coarse.listeners.length,0,'destroy() removes the listener');
});

test('one Enter validates exactly once and focus lands on the first item of the next level',()=>{
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

test('a held Enter arriving on the first item never validates, and Space validates once on keyup',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});assert.equal(h.doc.activeElement,h.card('africa'));
 for(let n=0;n<3;n++)assert.equal(h.press('Enter',{repeat:true}).defaultPrevented,true);
 assert.equal(h.calls.validate.length,0);
 assert.equal(h.press(' ').defaultPrevented,false);assert.deepEqual(h.calls.validate,[{kind:'continent',id:'africa'}]);
 assert.equal(h.press(' ',{repeat:true}).defaultPrevented,true);assert.equal(h.calls.validate.length,1);
});

test('a detail-0 click validates that very item, even a side item, and is never throttled',()=>{
 const h=harness();h.selector.show(L1_FR);
 h.card('asia').click();assert.deepEqual(h.calls.validate,[{kind:'continent',id:'asia'}]);assert.equal(h.cursor(),'africa');
 h.card('africa').click();assert.deepEqual(h.calls.validate.at(-1),{kind:'continent',id:'africa'});
});

test('a pointer click positions a side item, then validates only the item that was the cursor when pressed',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();
 const click=h.tap(h.card('americas'));
 assert.equal(h.calls.validate.length,0);assert.equal(h.cursor(),'americas');assert.equal(h.doc.activeElement,h.card('americas'));
 assert.equal(click.defaultPrevented,false);assert.equal(h.card('americas').tabIndex,0);assert.equal(h.card('africa').tabIndex,-1);
 h.tap(h.card('americas'));assert.deepEqual(h.calls.validate,[{kind:'continent',id:'americas'}]);
 // Pressed while it was a side item, the click only positions, even if the keyboard made it the cursor meanwhile.
 h.event('pointerdown',h.card('europe'),{detail:1});h.key('ArrowRight',{},h.card('americas'));h.key('ArrowRight');
 assert.equal(h.cursor(),'europe');h.event('click',h.card('europe'),{detail:1});assert.equal(h.calls.validate.length,1);
});

test('double clicks and pointer clicks within 350 ms of a level change are ignored',async()=>{
 const h=harness();h.selector.show(L1_FR);
 h.tap(h.card('africa'));assert.equal(h.calls.validate.length,0,'pointer click right after the level appeared');
 await h.later(349);h.tap(h.card('africa'));assert.equal(h.calls.validate.length,0);
 await h.later(2);h.tap(h.card('africa'),{detail:2});assert.equal(h.calls.validate.length,0,'detail 2');
 h.onValidate=()=>h.selector.show(L2_EUROPE_FR,{direction:'descend'});
 h.tap(h.card('africa'));assert.equal(h.calls.validate.length,1);
 // The second click of the double click lands on the new level's cursor.
 h.tap(h.card('ALB'),{detail:2});h.tap(h.card('ALB'));assert.equal(h.calls.validate.length,1);
 h.card('ALB').click();assert.equal(h.calls.validate.length,2,'keyboard and assistive-technology clicks are never throttled');
});

test('a drag moves the items layer with the finger, steps by halo\'s pitch on release and swallows its click',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();h.doc.runFrames();
 const layer=h.layer(),carousel=h.carousel(),x=id=>Number.parseFloat(h.card(id).style['--x']);
 assert.equal(x('africa'),720,'the first continent is centred');
 h.event('pointerdown',h.card('africa'),{clientX:700,clientY:500});h.card('africa').focus();
 h.event('pointermove',h.card('africa'),{clientX:695,clientY:503});assert.equal(carousel.capturedPointer,null,'below the 8 px threshold');
 h.event('pointermove',h.card('africa'),{clientX:690,clientY:501});assert.equal(carousel.capturedPointer,1);
 assert.equal(h.current().dataset.dragging,'true');assert.equal(layer.style.transform,'translateX(-10px)');assert.equal(x('africa'),720,'the items stay, their layer moves');
 h.event('pointermove',carousel,{clientX:380,clientY:505});assert.equal(layer.style.transform,'translateX(-320px)');
 h.event('pointerup',carousel,{clientX:380,clientY:505});
 // round(320 / x1) = round(320 / 331.2) = 1 step.
 assert.equal(h.cursor(),'americas');assert.equal(h.doc.activeElement,h.card('americas'),'focus follows a focused item');assert.equal(h.current().dataset.dragging,undefined);
 assert.equal(layer.style.transform,undefined,'the layer is reset');assert.equal(x('americas'),720);assert.ok('gliding' in h.card('americas').dataset,'then the new layout glides');
 const click=h.event('click',h.card('americas'),{detail:1});
 assert.equal(click.defaultPrevented,true);assert.equal(h.calls.validate.length,0);assert.equal(h.cursor(),'americas');
 // A short drag snaps back (gliding home) and still swallows its click, even on the cursor.
 h.event('pointerdown',h.card('americas'),{clientX:700});h.event('pointermove',h.card('americas'),{clientX:720});
 assert.equal(h.card('americas').dataset.gliding,undefined,'a drag stops the glide');
 h.event('pointerup',carousel,{clientX:720});
 assert.equal(h.cursor(),'americas');assert.equal(layer.style.transform,undefined);assert.equal(x('americas'),720);assert.ok('gliding' in h.card('americas').dataset);
 h.event('click',h.card('americas'),{detail:1});assert.equal(h.calls.validate.length,0);
 // Keyboard and assistive-technology clicks are not swallowed.
 h.event('pointerdown',h.card('americas'),{clientX:700});h.event('pointermove',h.card('americas'),{clientX:730});h.event('pointerup',carousel,{clientX:730});
 h.card('americas').click();assert.deepEqual(h.calls.validate,[{kind:'continent',id:'americas'}]);
 // A vertical pan is left to the browser; a cancelled drag snaps back.
 h.event('pointerdown',h.card('americas'),{clientX:700,clientY:500});h.event('pointermove',h.card('americas'),{clientX:702,clientY:530});h.event('pointermove',h.card('americas'),{clientX:600,clientY:530});
 assert.equal(layer.style.transform,undefined);
 h.event('pointerdown',h.card('americas'),{clientX:700});h.event('pointermove',h.card('americas'),{clientX:600});assert.equal(layer.style.transform,'translateX(-100px)');
 h.event('pointercancel',carousel,{clientX:600});assert.equal(layer.style.transform,undefined);assert.equal(h.cursor(),'americas');assert.equal(x('americas'),720);
 // Touch: the pressed item held the implicit capture; losing it to the carousel must not end the drag.
 h.event('pointerdown',h.card('americas'),{clientX:700,pointerType:'touch'});h.event('pointermove',h.card('americas'),{clientX:690,pointerType:'touch'});
 h.event('lostpointercapture',h.card('americas'),{pointerType:'touch'});
 h.event('pointermove',carousel,{clientX:400,pointerType:'touch'});assert.equal(layer.style.transform,'translateX(-300px)');
 h.event('pointerup',carousel,{clientX:400,pointerType:'touch'});h.event('lostpointercapture',carousel,{pointerType:'touch'});
 assert.equal(h.cursor(),'asia');assert.equal(x('asia'),720);
});

test('dragging in RTL brings the next item from the left, as the finger moves right',async()=>{
 const h=harness({dir:'rtl',locale:'ar'});h.selector.show(L1_AR);await h.later();
 const carousel=h.carousel();
 assert.equal(Number.parseFloat(h.card('africa').style['--x']),720-331.2,'the next item stands on the left');
 h.event('pointerdown',h.card('asia'),{clientX:700});h.event('pointermove',carousel,{clientX:720});h.event('pointermove',carousel,{clientX:1030});h.event('pointerup',carousel,{clientX:1030});
 assert.equal(h.cursor(),'africa');assert.equal(Number.parseFloat(h.card('africa').style['--x']),720);
});

test('Previous and Next keep focus, stop at the ends with aria-disabled and announce each move',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});
 const next=h.nav('next'),prev=h.nav('prev');next.focus();
 prev.click();assert.equal(h.cursor(),'africa');assert.deepEqual(h.calls.announce,[]);
 next.click();assert.equal(h.cursor(),'americas');assert.equal(h.doc.activeElement,next);assert.deepEqual(h.calls.announce,['Amériques · 2 sur 4']);
 assert.equal(prev.getAttribute('aria-disabled'),null);assert.equal(h.card('americas').tabIndex,0);
 assert.equal(h.current().querySelector('.explorer-count').textContent,'2 / 4');assert.ok('current' in h.current().querySelector('.explorer-dots').children[1].dataset);
 next.click();next.click();assert.equal(h.cursor(),'europe');assert.equal(next.getAttribute('aria-disabled'),'true');
 assert.deepEqual(h.calls.announce,['Amériques · 2 sur 4','Asie · 3 sur 4','Europe · 4 sur 4']);
 next.click();assert.equal(h.cursor(),'europe');assert.equal(h.calls.announce.length,3);assert.equal(h.doc.activeElement,next,'a disabled end stays focusable');
 assert.equal(h.press('Enter').defaultPrevented,false);assert.equal(h.calls.validate.length,0,'Enter on Next never validates an item');
 prev.focus();h.press('Enter');assert.equal(h.cursor(),'asia');assert.equal(h.doc.activeElement,prev);assert.equal(h.calls.announce.at(-1),'Asie · 3 sur 4');
});

test('arrow keys move the cursor in reading order, swap in RTL and stop at the ends',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});
 let event=h.key('ArrowRight');assert.equal(event.defaultPrevented,true);assert.equal(h.cursor(),'americas');assert.equal(h.doc.activeElement,h.card('americas'));
 h.key('ArrowLeft');assert.equal(h.cursor(),'africa');
 event=h.key('ArrowLeft');assert.equal(event.defaultPrevented,true);assert.equal(h.cursor(),'africa','no wrap');
 h.key('End');assert.equal(h.cursor(),'europe');h.key('ArrowRight');assert.equal(h.cursor(),'europe');h.key('Home');assert.equal(h.cursor(),'africa');
 assert.equal(h.calls.validate.length+h.calls.ascend+h.calls.announce.length,0,'positioning never validates or announces');
 const rtl=harness({dir:'rtl',locale:'ar'});rtl.selector.show(L1_AR,{focus:true});
 rtl.key('ArrowLeft');assert.equal(rtl.cursor(),'africa');assert.equal(rtl.doc.activeElement,rtl.card('africa'));
 rtl.key('ArrowRight');assert.equal(rtl.cursor(),'asia');rtl.key('End');assert.equal(rtl.cursor(),'europe');
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

test('Escape and Backspace ascend from any level but the World level, from anywhere, once while held',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});
 assert.equal(h.press('Escape').defaultPrevented,false);assert.equal(h.press('Backspace').defaultPrevented,false);assert.equal(h.calls.ascend,0);
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.equal(h.key('Escape').defaultPrevented,true);assert.equal(h.calls.ascend,1);
 // A held key: its auto-repeats are swallowed and never ascend again (H2f).
 for(let n=0;n<3;n++)assert.equal(h.key('Escape',{repeat:true}).defaultPrevented,true);
 assert.equal(h.calls.ascend,1);
 assert.equal(h.key('Backspace',{},h.nav('prev')).defaultPrevented,true);assert.equal(h.calls.ascend,2);
 assert.equal(h.key('Backspace',{repeat:true},h.nav('prev')).defaultPrevented,true);assert.equal(h.calls.ascend,2);
 h.selector.show(campusView('paris'),{direction:'descend'});
 const link=h.current().querySelector('.explorer-sheet-link');link.focus();
 assert.equal(h.key('Backspace').defaultPrevented,true);assert.equal(h.calls.ascend,3);
 assert.equal(h.key('Escape',{repeat:true}).defaultPrevented,true);assert.equal(h.calls.ascend,3);
 // Only Escape and Backspace are handled on the campus screen: Space, Home, End and Enter stay native.
 for(const key of [' ','Home','End','Enter','ArrowLeft','ArrowRight'])assert.equal(h.key(key).defaultPrevented,false);
});

test('show hands focus over only when it was inside or requested, always without scrolling',()=>{
 const h=harness();h.outside.focus();
 h.selector.show(L1_FR);assert.equal(h.doc.activeElement,h.outside);
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(h.doc.activeElement,h.outside,'an external change never moves focus');
 h.selector.show(L1_FR,{direction:'ascend',focus:true});assert.equal(h.doc.activeElement,h.card('africa'));
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(h.doc.activeElement,h.card('ALB'),'focus was inside');
 assert.ok(h.doc.focusLog.filter(entry=>h.root.contains(entry.node)).every(entry=>entry.options?.preventScroll===true));
 assert.equal(h.doc.scrolled.length,0,'the stage does not scroll: nothing is scrolled into view');
 h.outside.focus();h.selector.focus();assert.equal(h.doc.activeElement,h.card('ALB'));
 // A new view key places the cursor on the item the controller passes (the one we came back from).
 h.selector.show({...L1_FR,cursorId:'europe'},{direction:'ascend'});assert.equal(h.cursor(),'europe');assert.equal(h.doc.activeElement,h.card('europe'));
 h.selector.show({...L2_EUROPE_FR,cursorId:'nowhere'},{direction:'descend'});assert.equal(h.cursor(),'ALB');
});

test('focus() targets the cursor item, the campus heading, or the empty named section',()=>{
 const h=harness();
 h.selector.focus();assert.equal(h.doc.activeElement,h.root);assert.equal(h.selector.hasView(),false);
 h.selector.show(L1_FR);assert.equal(h.doc.activeElement,h.card('africa'),'focus inside the section moves to the first view, on its first continent');
 h.selector.show(campusView('paris'),{direction:'descend'});assert.equal(h.doc.activeElement,h.current().querySelector('h2'));
 h.outside.focus();h.selector.focus();assert.equal(h.doc.activeElement,h.current().querySelector('h2'));
});

test('public setCursor moves the UI cursor without announcement and reports whether the level holds the id',()=>{
 const h=harness();
 assert.equal(h.selector.setCursor('africa'),false,'no view');
 h.selector.show(L1_FR);
 assert.equal(h.selector.setCursor('asia'),true);assert.equal(h.cursor(),'asia');assert.ok('gliding' in h.card('asia').dataset,'it glides by default');
 assert.equal(h.selector.setCursor('asia'),true,'already there');assert.equal(h.selector.setCursor('nowhere'),false);assert.equal(h.cursor(),'asia');
 assert.equal(h.selector.setCursor('africa',{animate:false}),true);assert.equal(h.cursor(),'africa');assert.equal(h.card('africa').dataset.gliding,undefined);
 assert.equal(h.doc.activeElement,h.doc.body,'focus only when asked');h.selector.setCursor('americas',{focus:true});assert.equal(h.doc.activeElement,h.card('americas'));
 assert.deepEqual(h.calls.announce,[]);
 // The internal move still reports « changed »: Previous at the first item neither moves nor announces.
 h.selector.setCursor('africa');h.nav('prev').click();assert.deepEqual(h.calls.announce,[]);
 h.selector.show(campusView('paris'),{direction:'descend'});assert.equal(h.selector.setCursor('paris'),false,'not on the campus screen');
});

test('the outgoing level is frozen, inert and hidden at once, then removed after its exit',async()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});await h.later();
 assert.equal(h.doc.animations.length,0,'the first view has no transition');
 const first=h.current();
 h.selector.show(L2_EUROPE_FR,{direction:'descend',focus:true});
 assert.equal(first.inert,true);assert.equal(first.getAttribute('aria-hidden'),'true');assert.equal(first.dataset.state,'leaving');
 // R21: frozen at its last laid-out box (stage padding box, physical px).
 assert.deepEqual([first.style.position,first.style.gridArea,first.style.left,first.style.top,first.style.width,first.style.height,first.style.margin],['absolute','auto','48px','178.3px','1344px','518.7px','0']);
 assert.equal(h.screens().length,2);assert.notEqual(h.current(),first);assert.equal(h.doc.activeElement,h.card('ALB'));
 const [exit,enter]=h.doc.animations;
 assert.equal(exit.element,first);assert.deepEqual(exit.keyframes,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-18px) scale(1.03)'}]);
 assert.equal(exit.options.duration,260);assert.equal(exit.options.easing,'cubic-bezier(.22,1,.36,1)');
 assert.equal(enter.element,h.current());assert.deepEqual(enter.keyframes,[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}]);
 assert.deepEqual([enter.options.duration,enter.options.delay,enter.options.fill],[420,80,'backwards']);
 // Pointer clicks on the outgoing level are ignored, whatever the delay.
 await h.later();const stale=first.querySelector('[data-explorer-card]');
 assert.equal(h.event('click',stale,{detail:1}).defaultPrevented,true);stale.click();assert.equal(h.calls.validate.length,0);
 await h.finish();assert.equal(h.screens().length,1);assert.equal(first.parentNode,null);
 // Ascending reverses the motion; a new view finishes the running transition at once.
 h.selector.show(L1_FR,{direction:'ascend',focus:true});const second=h.screens()[0];
 assert.deepEqual(h.doc.animations.at(-2).keyframes[1],{opacity:0,transform:'translateY(18px) scale(.97)'});assert.deepEqual(h.doc.animations.at(-1).keyframes[0],{opacity:0,transform:'translateY(-22px)'});
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(second.parentNode,null);assert.equal(h.screens().length,2);
 assert.ok(h.doc.animations.slice(0,-2).every(animation=>animation.playState!=='running'));
 // Without motion (direction none) the outgoing level goes at once and is never frozen.
 const before=h.current();h.selector.show(L3_ALBANIA);assert.equal(before.parentNode,null);assert.equal(before.style.position,undefined);
});

test('the same view key keeps the item nodes and the UI cursor by id, re-sorted for a new language',()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});h.key('ArrowRight');
 assert.equal(h.cursor(),'americas');
 const nodes=new Map(h.cards().map(card=>[card.dataset.id,card])),level=h.current(),animations=h.doc.animations.length,svgs=h.art.calls.silhouettes.length;
 h.state.locale='ar';h.doc.documentElement.dir='rtl';h.selector.localize();h.selector.show(L1_AR);
 assert.equal(h.current(),level,'no new level for the same key');assert.equal(h.doc.animations.length,animations,'no transition either');
 assert.deepEqual(h.cards().map(card=>card.dataset.id),['asia','africa','americas','europe']);
 assert.ok(h.cards().every(card=>nodes.get(card.dataset.id)===card));
 assert.equal(h.art.calls.silhouettes.length,svgs,'no silhouette is rebuilt');
 assert.equal(h.cursor(),'americas','the view cursorId (asia) does not override the UI cursor');
 assert.equal(h.doc.activeElement,h.card('americas'),'focus survives the re-sort');
 assert.equal(h.card('americas').getAttribute('aria-label'),'الأمريكتان · 4 فروع · دولتان · 3 من 4 · تأكيد');
 assert.equal(h.current().querySelector('.explorer-count').textContent,'3 / 4');assert.equal(Number.parseFloat(h.card('americas').style['--x']),720);
 assert.equal(h.root.children[0].textContent,'استكشف');
 // A cursor id that disappeared falls back to the view's cursor.
 h.selector.show({...L1_AR,items:L1_AR.items.filter(item=>item.id!=='americas'),cursorId:'africa'});
 assert.equal(h.cursor(),'africa');assert.equal(nodes.get('americas').parentNode,null);assert.equal(h.doc.activeElement,h.card('africa'),'focus moves off the removed item');
});

/* ---- Layout protocol, glides and art ------------------------------------------------------------------------------ */
test('each item carries one centre-anchored transform; ranks change only its own variables (no jump)',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8');
 assert.match(css,/\.explorer-item\{[^}]*transform:translate3d\(calc\(var\(--x\) - 50%\),var\(--y\),0\) scale\(var\(--s\)\);transform-origin:50% var\(--h0\)/);
 assert.match(css,/\.explorer-item\{[^}]*inline-size:var\(--w0\)/);
 const h=harness();h.selector.show(L2_EUROPE_FR);h.selector.setCursor('FRA',{animate:false});
 const france=h.card('FRA'),snapshot=button=>({attrs:Object.fromEntries([...button.attrs]),vars:h.vars(button)});
 const before=snapshot(france),layer=h.vars(h.layer());
 h.nav('next').click();
 const after=snapshot(france);
 const changedAttrs=Object.keys({...before.attrs,...after.attrs}).filter(name=>before.attrs[name]!==after.attrs[name]);
 const changedVars=Object.keys({...before.vars,...after.vars}).filter(name=>before.vars[name]!==after.vars[name]);
 assert.deepEqual(changedAttrs.filter(name=>name!=='data-gliding').sort(),['aria-label','data-off','tabindex']);
 assert.ok(changedVars.every(name=>['--x','--y','--s','--w0','--nk','--ns','--ms','--mt','--gx','--lk','--nx'].includes(name)),changedVars.join());
 assert.deepEqual(h.vars(h.layer()),layer,'level-wide sizes do not change on a cursor move');
 assert.equal(before.vars['--fw'],after.vars['--fw']);assert.equal(before.vars['--lx'],after.vars['--lx']);
 // The level-wide variables (§4.2).
 assert.deepEqual([layer['--h0'],layer['--b0'],layer['--F'],layer['--nmax']],['250px','340px','32px',undefined]);
 assert.deepEqual([france.style['--lx'],france.style['--ly']],['45%',`${Math.round(45/85*100*1000)/1000}%`],'(label − vb) / vb · 100 %');
});

test('the instant protocol: data-instant, a style flush, removal on the next frame; resizes re-lay out at once',()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR);
 const level=h.current();
 assert.equal(level.dataset.instant,'','data-instant at insertion');assert.ok(h.doc.flushes>=1,'the flush read');
 assert.equal(level.dataset.density,'normal');assert.equal(level.dataset.phone,undefined);
 h.doc.runFrames();assert.equal(level.dataset.instant,undefined,'removed after a frame');
 // A cursor move glides: at most 6 items at 1440.
 h.selector.setCursor('ITA',{animate:false});h.nav('next').click();
 const gliding=()=>h.cards().filter(card=>'gliding' in card.dataset).map(card=>card.dataset.id);
 assert.deepEqual(gliding(),['ESP','FRA','ITA','LUX','NLD','POL'],'visible before or after the move: 6 items at 1440');
 // The ResizeObserver re-lays the level out instantly, which ends the glide.
 assert.ok(h.doc.observers.some(observer=>observer.targets.has(h.carousel())&&observer.targets.has(h.root)));
 h.doc.resize({H:300});
 assert.equal(level.dataset.instant,'');assert.deepEqual(gliding(),[]);
 assert.equal(h.vars(h.layer())['--h0'],`${Math.round((300-78-30)*100)/100}px`,'the new carousel height');
 h.doc.runFrames();
 // A resize that changes nothing does not re-lay out.
 const flushes=h.doc.flushes;h.doc.resize({});assert.equal(h.doc.flushes,flushes);assert.equal(level.dataset.instant,undefined);
 // The glide ends on the item's own transform transition, or after 560 ms.
 h.nav('next').click();const card=h.cards().find(node=>'gliding' in node.dataset);
 h.event('transitionend',card.querySelector('.explorer-name'),{propertyName:'transform'});assert.ok('gliding' in card.dataset,'a sub-element ends nothing');
 h.event('transitionend',card,{propertyName:'opacity'});assert.ok('gliding' in card.dataset);
 h.event('transitionend',card,{propertyName:'transform'});assert.equal(card.dataset.gliding,undefined);
 return h.later(560).then(()=>assert.deepEqual(gliding(),[]));
});

test('the root is observed by its border box; band changes reach the views through their own boxes (fix 2)',()=>{
 const h=harness();h.selector.show(L1_FR);
 const observer=h.doc.observers.find(entry=>entry.targets.has(h.root));
 assert.deepEqual(observer.options.get(h.root),{box:'border-box'},'never the content box that explorer-band.mjs rewrites in its own callback');
 assert.ok(observer.targets.has(h.carousel()));assert.equal(observer.options.get(h.carousel()),undefined,'the carousel by its content box');
 // A lower band (the root's padding) re-lays the level out through the carousel.
 h.doc.resize({H:300});assert.equal(h.vars(h.layer())['--h0'],`${Math.round((300-78-30)*100)/100}px`);
 h.selector.show(campusView('paris'),{direction:'descend'});
 const screen=h.current();
 for(const name of ['.explorer-campus-body','.explorer-siblings-list','.explorer-sheet']){const node=screen.querySelector(name);assert.ok(observer.targets.has(node),name);assert.equal(observer.options.get(node),undefined,name);}
 assert.equal(observer.targets.has(h.screens()[0].querySelector('.explorer-carousel')),false,'the outgoing level is no longer observed');
 assert.deepEqual(observer.options.get(h.root),{box:'border-box'});
});

test('pager dots keep their size: the current pill is an indicator moved by transform (fix 7, §9.3)',async()=>{
 const h=harness();h.selector.show(L1_FR);
 const dots=h.current().querySelector('.explorer-dots');
 assert.equal(dots.style['--dot'],'0');assert.equal(dots.children.length,4,'one i per item, the indicator is a pseudo-element');
 h.nav('next').click();assert.equal(dots.style['--dot'],'1');assert.deepEqual(dots.children.map(dot=>'current' in dot.dataset),[false,true,false,false]);
 h.selector.setCursor('europe');assert.equal(dots.style['--dot'],'3');
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8'),code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(code,/\.explorer-dots[^{}]*\{[^}]*transition:[^;}]*inline-size/,'no width transition');
 assert.doesNotMatch(code,/\.explorer-dots(\[[\w-]+\])?>i\[data-current\]\{[^}]*inline-size/,'the current dot keeps its size');
 assert.match(code,/\.explorer-dots>i\{display:block;inline-size:6px;block-size:6px;[^}]*transition:transform \.4s var\(--ease\),background \.3s\}/);
 assert.match(code,/\.explorer-dots\{position:relative;display:flex;align-items:center;gap:6px;padding-inline-end:14px\}/,'the 14 px of the pill are reserved');
 assert.match(code,/\.explorer-dots>i\[data-current\]~i\{transform:translateX\(14px\)\}/);assert.match(code,/\.explorer-dots:dir\(rtl\)>i\[data-current\]~i\{transform:translateX\(-14px\)\}/);
 assert.match(code,/\.explorer-dots::after\{[^}]*inline-size:20px;block-size:6px;[^}]*transform:translateX\(calc\(var\(--dot,0\) \* 12px\)\);transition:transform \.4s var\(--ease\)\}/);
 assert.match(code,/\.explorer-dots\[data-dense\]::after\{inline-size:14px;block-size:4px;transform:translateX\(calc\(var\(--dot,0\) \* 8px\)\)\}/);
 assert.match(code,/\.explorer-level\[data-instant\] \.explorer-dots::after\{transition:none\}/,'instant layouts do not slide it');
});

test('phones: the hidden ±2 wait off screen, at most 4 items glide, names and logos of neighbours are hidden by CSS',async()=>{
 const h=harness({screen:PHONE});h.selector.show(L2_EUROPE_FR);h.selector.setCursor('FRA',{animate:false});
 const level=h.current();assert.equal(level.dataset.phone,'');assert.equal(level.dataset.density,'normal');
 assert.equal(h.current().querySelector('.explorer-track').style['--fade'],'58.2px');assert.equal(h.vars(h.layer())['--nmax'],'265.6px');
 assert.equal(h.card('ITA').dataset.off,'1');assert.equal(h.card('LUX').dataset.off,'2');near(Number.parseFloat(h.card('LUX').style['--x']),195+218.9+400,.05);
 assert.equal(h.current().querySelector('.explorer-dots').dataset.dense,'','14 dots are dense at 390');
 h.nav('next').click();
 const gliding=h.cards().filter(card=>'gliding' in card.dataset).map(card=>card.dataset.id);
 assert.deepEqual(gliding,['ESP','FRA','ITA','LUX']);
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8');
 assert.match(css,/\.explorer-level\[data-phone\] \.explorer-item:not\(\[data-off="0"\]\) \.explorer-name\{opacity:0\}/);
 assert.match(css,/\.explorer-level\[data-phone\]:not\(\[data-density=compact\]\) \.explorer-item:not\(\[data-off="0"\]\) \.explorer-lantern>\.hx-logo\{opacity:0\}/);
 assert.match(css,/\.explorer-level\[data-phone\] \.explorer-item:not\(\[data-off="0"\]\)\) \.explorer-meta\{opacity:0\}/);
});

test('L3 logos are fitted once through art.fitLogo, resized in place, with the 28 / 22 px floors as --lk',()=>{
 const h=harness();h.selector.show(l3France('paris'));
 const logo=id=>h.card(id).querySelector('.hx-logo');
 assert.deepEqual(h.card('paris').children.map(node=>node.className),['explorer-box','explorer-name','explorer-go'],'no count on L3');
 assert.equal(h.card('paris').querySelector('.explorer-lantern').children[0],logo('paris'));
 near(Number.parseFloat(logo('paris').style.width),60*1.3986,.01);near(Number.parseFloat(logo('paris').style.height),60,.01);
 near(Number(h.card('perpignan').style['--lk']),1.167,.002,'Kuala-Lumpur-like 3.67 mark at ±1');assert.equal(h.card('nice').style['--lk'],'1');
 assert.equal(h.art.calls.logos.length,5,'one print per campus that has one');assert.equal(h.card('angouleme').querySelector('.hx-logo'),null,'no print, no logo');
 const node=logo('paris');h.doc.resize({H:300});assert.equal(logo('paris'),node,'never re-created');
 near(Number.parseFloat(node.style.height),(300-86-30)*.3,.01,'rewritten on a re-layout');
 assert.equal(h.art.calls.logos.length,5);
});

test('name-only items without art or without a shape; late shapes are drawn by localize()',()=>{
 const bare=harness({art:null});bare.selector.show(L1_FR);
 const figure=bare.card('europe').querySelector('.explorer-figure');
 assert.deepEqual(figure.children.map(node=>node.className),['explorer-name'],'no svg without art');
 assert.equal(bare.card('europe').style['--fw'],'300px','halo\'s 1.2 ratio in the 340 × 250 box');assert.equal(bare.card('europe').style['--lx'],'50%');
 assert.equal(bare.nav('next').children.length,0,'no icons without art');assert.equal(bare.nav('next').getAttribute('aria-label'),'Suivant');
 assert.equal(bare.card('europe').querySelector('.explorer-go').textContent,'Valider');
 const art=fakeArt({shapes:null}),h=harness({art});h.selector.show(L1_FR);
 assert.equal(h.card('europe').querySelector('.hx-art'),null);assert.equal(art.calls.silhouettes.length,0);
 art.shapes={...SHAPES,continents:{europe:SHAPES.continents.europe}};h.selector.localize();
 assert.ok(h.card('europe').querySelector('.hx-art'));assert.equal(h.card('asia').querySelector('.hx-art'),null,'a shape missing for one item: that item stays name-only');
 assert.equal(h.card('europe').style['--fw'],'312.5px','its own ratio now');
 const figureChildren=h.card('europe').querySelector('.explorer-figure').children.map(node=>node.getAttribute('class'));
 assert.deepEqual(figureChildren,['hx-art','explorer-name','hx-dots'],'dots above the name');
});

test('silhouettes are rebuilt only when their scale k moves by more than 5 %',()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR);
 const count=h.art.calls.silhouettes.length,svg=h.card('FRA').querySelector('.hx-art');
 h.doc.resize({H:405});assert.equal(h.art.calls.silhouettes.length,count,'bh stays 250: the same k');
 h.doc.resize({H:350});assert.equal(h.art.calls.silhouettes.length,count,'bh 242: k −3 %, kept');assert.equal(h.card('FRA').querySelector('.hx-art'),svg);
 h.doc.resize({H:300});assert.equal(h.art.calls.silhouettes.length,2*count,'bh 192: k −23 %, every silhouette rebuilt');
 const fresh=h.card('FRA').querySelector('.hx-art');assert.notEqual(fresh,svg);assert.equal(svg.parentNode,null);
 assert.deepEqual(h.card('FRA').querySelector('.explorer-figure').children.map(node=>node.getAttribute('class')),['hx-art','explorer-name','hx-dots'],'in place, before the name');
 near(h.art.calls.silhouettes.at(-1).scale,Number.parseFloat(h.card('CZE').style['--fw'])/100,1e-3,'k = fw / vbW');
 h.nav('next').click();assert.equal(h.art.calls.silhouettes.length,2*count,'a cursor move never rebuilds an SVG');
});

test('the stage scrolls only below the compact row\'s 44 px, and only then is a focused control scrolled into view',()=>{
 const h=harness({screen:{...LANDSCAPE,band:30,H:30}});h.selector.show(L1_FR,{focus:true});
 assert.equal(h.root.dataset.stageScroll,'true');assert.equal(h.current().dataset.density,'compact');
 assert.ok(h.doc.scrolled.some(entry=>entry.node===h.card('africa')&&entry.options.block==='nearest'));
 h.doc.resize({band:76.2,H:76.2});assert.equal(h.root.dataset.stageScroll,undefined);
 const count=h.doc.scrolled.length;h.key('ArrowRight');assert.equal(h.doc.scrolled.length,count);
 h.selector.show(campusView('paris'),{direction:'descend'});assert.equal(h.root.dataset.stageScroll,undefined,'the campus screen never sets it');
});

test('compact row: no scale, auto widths, positions from the measured widths with 26 px gaps',async()=>{
 const h=harness({screen:LANDSCAPE});h.selector.show(L2_EUROPE_FR);h.selector.setCursor('FRA',{animate:false});
 const level=h.current();assert.equal(level.dataset.density,'compact');assert.equal(level.dataset.phone,'');
 assert.ok(h.cards().every(card=>card.style['--s']==='1'&&card.style['--w0']==='auto'));
 const x=id=>Number.parseFloat(h.card(id).style['--x']);
 assert.equal(x('FRA'),333.5);assert.equal(x('ITA'),333.5+125+26+36);assert.equal(x('ESP'),333.5-125-26-36);assert.equal(x('LUX'),333.5+125+26+72+26+36);
 near(Number.parseFloat(h.card('FRA').style['--y']),170+(76.2-44)/2,1e-9);
 assert.deepEqual(['ESP','FRA','ITA','LUX'].map(id=>h.card(id).dataset.off),['-1','0','1','out']);
 assert.equal(h.card('FRA').style['--fh'],'60px');assert.equal(h.card('ITA').style['--fh'],'48px');
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8');
 assert.match(css,/\[data-density=compact\] \.explorer-item\{[^}]*min-block-size:44px[^}]*scale\(1\)/);
});

/* ---- Campus screen -------------------------------------------------------------------------------------------------- */
test('the campus screen: heading focused, back pill, sibling pills that validate and keep the focus',()=>{
 const h=harness();h.selector.show(l3France('paris'),{focus:true});
 h.onValidate=target=>h.selector.show(target.kind==='campus'?campusView(target.id):l3France(),{direction:'descend',focus:h.root.contains(h.doc.activeElement)});
 h.onAscend=()=>h.selector.show(l3France(h.current().querySelector('[aria-current=true]').dataset.id),{direction:'ascend',focus:h.root.contains(h.doc.activeElement)});
 h.press('Enter');assert.deepEqual(h.calls.validate,[{kind:'campus',id:'paris'}]);
 const screen=h.current(),heading=screen.querySelector('h2');
 assert.equal(screen.localName,'section');assert.equal(screen.className,'explorer-campus');assert.equal(screen.dataset.level,'campus');
 assert.equal(screen.getAttribute('aria-labelledby'),heading.id);assert.match(heading.id,/^explorer-campus-title-\d+$/);
 assert.equal(heading.textContent,'42 Paris');assert.equal(h.doc.activeElement,heading);
 assert.deepEqual(screen.children.map(node=>node.className),['explorer-campus-body','explorer-campus-foot'],'the strip stays outside the scroller');
 assert.equal(screen.dataset.density,'normal');assert.equal(screen.style['--explorer-band'],'518.7px');
 const foot=screen.querySelector('.explorer-campus-foot'),back=foot.children[0];
 assert.equal(back.className,'explorer-campus-back');assert.equal(back.getAttribute('aria-label'),'Revenir aux campus · France');assert.equal(back.textContent,'France');
 assert.equal(back.children[0].getAttribute('data-icon'),'back');assert.equal(back.querySelector('.explorer-campus-back-label').dir,'auto');
 const nav=foot.children[1];assert.equal(nav.localName,'nav');assert.equal(nav.className,'explorer-siblings');assert.equal(nav.getAttribute('aria-label'),'Tous les campus · France');assert.equal(nav.hidden,false);
 const list=nav.children[0];assert.equal(list.className,'explorer-siblings-list');
 const pills=list.querySelectorAll('.explorer-sibling');assert.deepEqual(pills.map(pill=>pill.dataset.id),FRENCH_CAMPUSES.map(([id])=>id));
 assert.deepEqual(pills.filter(pill=>pill.getAttribute('aria-current')==='true').map(pill=>pill.dataset.id),['paris']);
 assert.equal(pills[6].children[0].getAttribute('data-icon'),'check');assert.equal(pills[6].textContent,'42 Paris');
 assert.equal(h.calls.renders.length,1);assert.deepEqual([h.calls.renders[0].campusId,h.calls.renders[0].locale,h.calls.renders[0].options.headingId],['paris','fr',heading.id]);
 const body=screen.querySelector('.explorer-campus-body');assert.equal(body.children[0].className,'explorer-sheet');assert.equal(body.children[0].dataset.campus,'paris');
 // A sibling switch keeps the same screen, the same pill node and its focus; aria-current moves.
 const lyon=pills[2];lyon.focus();h.press('Enter');
 assert.deepEqual(h.calls.validate.at(-1),{kind:'campus',id:'lyon'});assert.equal(h.current(),screen);assert.equal(h.doc.activeElement,lyon);
 assert.equal(lyon.getAttribute('aria-current'),'true');assert.equal(pills[6].getAttribute('aria-current'),null);assert.equal(screen.querySelector('h2').textContent,'42 Lyon');
 assert.equal(h.calls.renders.at(-1).campusId,'lyon');assert.equal(h.calls.renders.at(-1).options.headingId,heading.id,'the same heading id');assert.deepEqual(h.calls.destroys,[{campusId:'paris',locale:'fr'}]);
 assert.equal(body.children.length,1);assert.equal(body.children[0].dataset.campus,'lyon');
 lyon.click();assert.equal(h.calls.validate.length,2,'the current campus pill does nothing');
 // The back pill ascends to the campus carousel, the cursor and focus on the campus we came from.
 back.click();assert.equal(h.calls.ascend,1);assert.equal(h.current().dataset.level,'campuses');assert.equal(h.cursor(),'lyon');assert.equal(h.doc.activeElement,h.card('lyon'));
 assert.equal(screen.inert,true);
});

test('renderCampus runs after the section is placed: density, band, tiny order and the entrance guard',()=>{
 const h=harness();h.selector.show(l3France('paris'));h.selector.show(campusView('paris'),{direction:'descend'});
 assert.deepEqual(h.calls.renders[0].section,{connected:true,density:'normal',band:'518.7px',entering:true,first:'explorer-campus-body'});
 const tiny=harness({screen:{...LANDSCAPE,band:109}});tiny.selector.show(campusView('paris'));
 assert.deepEqual(tiny.calls.renders[0].section,{connected:true,density:'tiny',band:'109px',entering:false,first:'explorer-campus-foot'});
 const short=harness({screen:{...DESKTOP,band:369}});short.selector.show(campusView('paris'));assert.equal(short.current().dataset.density,'short');
 // Without a sheet the screen still names the campus with a focusable fallback heading.
 const fallback=harness();fallback.calls.noSheet=true;fallback.selector.show(campusView('nice'),{focus:true});
 const heading=fallback.current().querySelector('h2');
 assert.equal(heading.className,'explorer-campus-title');assert.equal(heading.textContent,'42 Nice');assert.equal(heading.tabIndex,-1);
 assert.equal(heading.id,fallback.current().getAttribute('aria-labelledby'));assert.equal(fallback.doc.activeElement,heading);
});

test('tiny bands put the strip before the scroller and back, keeping the focus',()=>{
 const h=harness({screen:{...LANDSCAPE,band:109}});h.selector.show(campusView('paris'),{focus:true});
 const screen=h.current(),foot=screen.querySelector('.explorer-campus-foot'),body=screen.querySelector('.explorer-campus-body');
 assert.equal(screen.dataset.density,'tiny');assert.deepEqual(screen.children,[foot,body]);
 const pill=foot.querySelector('.explorer-sibling');pill.focus();
 h.doc.resize({band:549});
 assert.equal(screen.dataset.density,'normal');assert.deepEqual(screen.children,[body,foot]);assert.equal(h.doc.activeElement,pill,'the moved strip keeps its focus');
 assert.equal(screen.style['--explorer-band'],'549px');
 h.doc.resize({band:94});assert.equal(screen.dataset.density,'tiny');assert.deepEqual(screen.children,[foot,body]);assert.equal(h.doc.activeElement,pill);
});

test('scroll-position fades on the body and on the list, valid in RTL',()=>{
 const h=harness();h.selector.show(campusView('paris'));
 const body=h.current().querySelector('.explorer-campus-body'),list=h.current().querySelector('.explorer-siblings-list');
 assert.equal(body.dataset.fadeStart,undefined);assert.equal(body.dataset.fadeEnd,undefined);
 Object.assign(body,{scrollTop:0,scrollHeight:1000});body.clientHeight=400;h.event('scroll',body,{bubbles:false});
 assert.equal(body.dataset.fadeStart,undefined);assert.equal(body.dataset.fadeEnd,'');
 body.scrollTop=300;h.event('scroll',body,{bubbles:false});assert.equal(body.dataset.fadeStart,'');assert.equal(body.dataset.fadeEnd,'');
 body.scrollTop=600;h.event('scroll',body,{bubbles:false});assert.equal(body.dataset.fadeStart,'');assert.equal(body.dataset.fadeEnd,undefined);
 Object.assign(list,{scrollLeft:0,scrollWidth:880});list.clientWidth=400;h.event('scroll',list,{bubbles:false});
 assert.equal(list.dataset.fadeStart,undefined);assert.equal(list.dataset.fadeEnd,'');
 list.scrollLeft=480;h.event('scroll',list,{bubbles:false});assert.equal(list.dataset.fadeStart,'');assert.equal(list.dataset.fadeEnd,undefined);
 // RTL scrolls with negative scrollLeft from the inline start.
 list.scrollLeft=-200;h.event('scroll',list,{bubbles:false});assert.equal(list.dataset.fadeStart,'');assert.equal(list.dataset.fadeEnd,'');
 // The observers update them too.
 body.scrollTop=0;h.doc.resize({});assert.equal(body.dataset.fadeStart,undefined);
});

test('tiny bands: no top fade; a control the keyboard focuses lands inside the scroll paddings, top first when taller (fix 19)',async()=>{
 const h=harness({screen:{...LANDSCAPE,band:94}});h.selector.show(campusView('paris'),{focus:true});
 const screen=h.current(),body=screen.querySelector('.explorer-campus-body'),sheet=body.querySelector('.explorer-sheet');
 assert.equal(screen.dataset.density,'tiny');
 Object.assign(body,{scrollTop:300,scrollHeight:900});body.clientHeight=184;h.event('scroll',body,{bubbles:false});
 assert.equal(body.dataset.fadeStart,undefined,'no top fade in a tiny band');assert.equal(body.dataset.fadeEnd,'');
 h.doc.resize({band:549});assert.equal(screen.dataset.density,'normal');assert.equal(body.dataset.fadeStart,'','the other densities keep halo\'s top fade');
 h.doc.resize({band:94});assert.equal(screen.dataset.density,'tiny');assert.equal(body.dataset.fadeStart,undefined);
 // 640×360: the body runs from 176 px to the bottom of the viewport; its scroll paddings leave the window 183–227 px.
 h.doc.computed.set(body,{scrollPaddingTop:'7px',scrollPaddingBottom:'133px'});
 const place=(node,y,height)=>h.doc.rects.set(node,()=>rect(100,176+y-body.scrollTop,240,height));
 const heading=sheet.querySelector('h2'),link=sheet.querySelector('.explorer-sheet-link'),cta=sheet.querySelector('.explorer-sheet-cta');
 const photo=h.doc.createElement('button');photo.className='explorer-sheet-photo-open';sheet.querySelector('.explorer-sheet-wing').append(photo);
 h.doc.rects.set(body,()=>rect(0,176,640,184));place(heading,10,32);place(link,40,24);place(cta,150,44);place(photo,300,90);
 const tab=node=>{node.focus();h.event('focusin',node);return node.getBoundingClientRect();};
 body.scrollTop=0;h.event('scroll',body,{bubbles:false});
 let box=tab(link);assert.equal(body.scrollTop,13,'just below the window: the least scroll');assert.deepEqual([box.top,box.bottom],[203,227]);
 box=tab(cta);assert.equal(body.scrollTop,143);assert.deepEqual([box.top,box.bottom],[183,227],'its 7 px ring inside the body and above the capsule');
 box=tab(photo);assert.equal(body.scrollTop,293);assert.equal(box.top,183,'taller than the window: its top first');
 box=tab(cta);assert.equal(body.scrollTop,143,'back up (Shift+Tab): its top at the window\'s top');assert.equal(box.top,183);
 box=tab(link);assert.equal(body.scrollTop,33);assert.equal(box.top,183);
 tab(link);assert.equal(body.scrollTop,33,'inside the window: nothing moves');
 // A pointer press and the heading the selector focuses never scroll the body; the end of the scroll is a limit.
 h.doc.pointerFocus=true;tab(photo);assert.equal(body.scrollTop,33);h.doc.pointerFocus=false;
 body.scrollTop=200;tab(heading);assert.equal(body.scrollTop,200);
 body.scrollTop=0;Object.assign(body,{scrollHeight:400});tab(photo);assert.equal(body.scrollTop,216,'clamped at the end of the scroll');
 assert.equal(body.dataset.fadeEnd,undefined,'the fades follow at once');
 // A fractional position: a whole-pixel offset that never lifts the control's top above the window (no slack here).
 place(cta,150.4,44);body.scrollTop=0;box=tab(cta);assert.equal(body.scrollTop,143);assert.ok(box.top>=183,String(box.top));
 // The other densities keep the browser's own scrolling to the fades' scroll paddings.
 h.doc.resize({band:549});body.scrollTop=0;tab(photo);assert.equal(body.scrollTop,0);
 assert.equal(h.doc.scrolled.length,0,'no scrollIntoView, so no ancestor scrolls');
 // The stylesheet: the scroll ends at the capsule's top (16 px below the band) and the window keeps the 2 px ring and its
 // 5 px offset inside the body and above the capsule; the other densities keep the fades' 18 / 28 px.
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8'),code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.match(code,/:root #explorer \.explorer-campus\[data-density=tiny\] \.explorer-campus-body\{padding-block-end:calc\(var\(--explorer-bottom,0px\) - 16px\);scroll-padding-block:7px calc\(var\(--explorer-bottom,0px\) - 9px\)\}/);
 assert.match(code,/:root #explorer \.explorer-campus-body\{flex:1 1 0;[^}]*scroll-padding-block:18px 28px\}/);
});

test('the sibling list scrolls the current campus into its own view only, clear of its fades',()=>{
 const h=harness();h.selector.show(campusView('angouleme'));
 const list=h.current().querySelector('.explorer-siblings-list');assert.equal(list.scrollLeft,0,'already visible');
 Object.assign(list,{scrollWidth:880});list.clientWidth=400;
 h.selector.show(campusView('paris'));assert.equal(list.scrollLeft,510,'42 Paris, the seventh pill, is centred in the list');
 const pill=list.querySelector('[aria-current=true]');assert.equal(pill.getBoundingClientRect().left+50,list.getBoundingClientRect().left+200);
 h.selector.show(campusView('perpignan'));assert.equal(list.scrollLeft,510,'a visible current pill does not move the list');
 list.scrollLeft=40;h.selector.show(campusView('marseille'));assert.equal(list.scrollLeft,180,'42 Marseille lay under the end fade: centred');
 assert.equal(h.doc.scrolled.length,0,'no scrollIntoView, so no ancestor scrolls');
});

test('the current pill comes back into the strip after a direction switch, an update or a new strip width (fix 1)',()=>{
 const h=harness();h.selector.show(campusView('paris'));
 const list=h.current().querySelector('.explorer-siblings-list'),pill=()=>list.querySelector('[aria-current=true]');
 const inside=()=>{const frame=list.getBoundingClientRect(),box=pill().getBoundingClientRect();return box.left>=frame.left&&box.right<=frame.right;};
 Object.assign(list,{scrollWidth:880});list.clientWidth=400;
 assert.equal(list.scrollLeft,510);assert.ok(inside(),'revealed by show()');
 // fr → ar: the page turns RTL and the browser resets the strip's offset; 42 Paris (seventh) lies off its left end.
 h.doc.documentElement.dir='rtl';list.scrollLeft=0;assert.equal(inside(),false);
 h.state.locale='ar';h.selector.localize();
 assert.ok(inside(),'localize() reveals it');assert.equal(list.scrollLeft,-510);
 h.selector.show(campusView('paris','ar'));assert.equal(list.scrollLeft,-510,'a visible pill does not move the list');
 // ar → en through show() alone (same view key: update()).
 h.doc.documentElement.dir='ltr';list.scrollLeft=0;assert.equal(inside(),false);
 h.state.locale='en';h.selector.show(campusView('paris','en'));assert.ok(inside(),'update() reveals it');
 // A rotation: the strip is narrower and its offset was lost.
 list.clientWidth=270;list.scrollLeft=0;assert.equal(inside(),false);h.doc.resize({});assert.ok(inside(),'resized() reveals it');
 // A resize that leaves the strip as it was never undoes the visitor's own scroll of the strip.
 list.scrollLeft=0;h.doc.resize({});assert.equal(list.scrollLeft,0);
 assert.equal(h.doc.scrolled.length,0,'no scrollIntoView, so no ancestor scrolls');
});

test('a pill the keyboard focuses while partly hidden comes clear of the list\'s fades, the list alone scrolling (fix 20)',()=>{
 const h=harness();h.selector.show(campusView('angouleme'));
 const list=h.current().querySelector('.explorer-siblings-list'),pills=list.querySelectorAll('.explorer-sibling'),frame=list.getBoundingClientRect();
 const tab=(pill,on=h)=>{pill.focus();on.event('focusin',pill);return pill.getBoundingClientRect();};
 Object.assign(list,{scrollWidth:880});list.clientWidth=400;h.event('scroll',list,{bubbles:false});
 // 42 Marseille (630–730 px in the 300–700 px list) shows 70 px, half under the 32 px end fade: it comes 32 px clear of it.
 let box=tab(pills[3]);assert.equal(list.scrollLeft,62);assert.equal(box.right,frame.right-32);
 assert.deepEqual([list.dataset.fadeStart,list.dataset.fadeEnd],['',''],'the fades follow at once');
 tab(pills[2]);assert.equal(list.scrollLeft,62,'a pill clear of the fades that show leaves the list alone');
 // The first pill, under the start fade: at the start of the list that fade goes and the pill stands whole at the edge.
 box=tab(pills[0]);assert.equal(list.scrollLeft,0);assert.equal(box.left,frame.left);assert.equal(list.dataset.fadeStart,undefined);
 // A hidden pill at the far end: the list stops at its end, where no fade remains.
 box=tab(pills[7]);assert.equal(list.scrollLeft,480);assert.ok(box.right<=frame.right);assert.equal(list.dataset.fadeEnd,undefined);
 // A pointer press focuses a pill too: the list does not move under the pointer, so the click lands on that pill.
 list.scrollLeft=0;h.event('scroll',list,{bubbles:false});h.doc.pointerFocus=true;tab(pills[3]);assert.equal(list.scrollLeft,0);h.doc.pointerFocus=false;
 assert.equal(h.doc.activeElement,pills[3]);assert.equal(h.doc.scrolled.length,0,'no scrollIntoView, so no ancestor scrolls');
 // RTL: the inline end is on the left and the offsets run negative from the inline start.
 const r=harness({dir:'rtl',locale:'ar'});r.selector.show(campusView('angouleme','ar'));
 const rtlList=r.current().querySelector('.explorer-siblings-list'),rtlPills=rtlList.querySelectorAll('.explorer-sibling');
 Object.assign(rtlList,{scrollWidth:880});rtlList.clientWidth=400;r.event('scroll',rtlList,{bubbles:false});
 box=tab(rtlPills[3],r);assert.equal(rtlList.scrollLeft,-62);assert.equal(box.left,frame.left+32);
 box=tab(rtlPills[0],r);assert.equal(rtlList.scrollLeft,0);assert.equal(box.right,frame.right);
 // A list that cannot scroll is never moved.
 const fit=harness();fit.selector.show(campusView('angouleme'));const fitList=fit.current().querySelector('.explorer-siblings-list');
 Object.assign(fitList,{scrollWidth:400});fitList.clientWidth=400;tab(fitList.querySelectorAll('.explorer-sibling')[3],fit);assert.equal(fitList.scrollLeft,0);
});

test('renderCampus runs again only for another campus or another language, keeping the scroll',()=>{
 const h=harness();h.selector.show(campusView('paris'));
 const screen=h.current(),body=screen.querySelector('.explorer-campus-body');
 h.selector.show(campusView('paris'));h.selector.localize();assert.equal(h.calls.renders.length,1);
 Object.assign(body,{scrollHeight:1000,scrollTop:300});body.clientHeight=400;
 screen.querySelector('.explorer-sheet-link').focus();
 h.state.locale='en';h.selector.localize();
 assert.deepEqual([h.calls.renders.at(-1).campusId,h.calls.renders.at(-1).locale],['paris','en']);assert.deepEqual(h.calls.destroys,[{campusId:'paris',locale:'fr'}]);
 assert.equal(body.scrollTop,300);assert.equal(h.doc.activeElement,screen.querySelector('h2'),'focus that was in the body goes to the heading');
 assert.equal(body.querySelector('.explorer-sheet').lang,'en');
 h.selector.show(campusView('paris','en'));assert.equal(h.calls.renders.length,2,'the same campus in the same language is not mounted again');
 assert.equal(screen.querySelector('.explorer-campus-back').getAttribute('aria-label'),'Back to campuses · France');
 assert.equal(screen.querySelector('.explorer-siblings').getAttribute('aria-label'),'All campuses · France');
 // The kept position is clamped to the new content, and a language change through show() also re-mounts.
 Object.assign(body,{scrollHeight:500,scrollTop:300});body.clientHeight=400;h.outside.focus();
 h.state.locale='ar';h.selector.show(campusView('paris','ar'));
 assert.deepEqual([h.calls.renders.at(-1).campusId,h.calls.renders.at(-1).locale],['paris','ar']);assert.equal(h.calls.renders.length,3);assert.equal(body.scrollTop,100);
 assert.equal(h.doc.activeElement,h.outside,'focus outside the body stays where it is');
 assert.equal(screen.querySelector('.explorer-campus-back').getAttribute('aria-label'),'العودة إلى فروع فرنسا');
 assert.equal(screen.querySelector('.explorer-siblings').getAttribute('aria-label'),'جميع فروع فرنسا');
 h.selector.show(campusView('nice','ar'));assert.equal(h.calls.renders.length,4);assert.equal(body.scrollTop,0,'another campus starts at the top');
 // Shapes that arrive late re-mount the sheet once (the locator gets drawn).
 h.art.shapes={...SHAPES};h.selector.localize();assert.equal(h.calls.renders.length,5);h.selector.localize();assert.equal(h.calls.renders.length,5);
});

test('a one-item level and its campus: both arrows disabled, keys and wheel inert, back pill without strip',async()=>{
 const h=harness();h.selector.show(L3_ALBANIA,{focus:true});await h.later();
 assert.deepEqual(h.cards().map(card=>card.dataset.id),['tirana']);assert.equal(h.cursor(),'tirana');
 assert.equal(h.nav('prev').getAttribute('aria-disabled'),'true');assert.equal(h.nav('next').getAttribute('aria-disabled'),'true');
 assert.equal(h.current().querySelector('.explorer-count').textContent,'1 / 1');assert.equal(h.card('tirana').getAttribute('aria-label'),'42 Tirana · Albanie · 1 sur 1 · Valider');
 for(const key of ['ArrowRight','ArrowLeft','Home','End'])h.key(key);
 h.wheel({deltaY:120});h.nav('next').click();assert.equal(h.cursor(),'tirana');assert.equal(h.calls.announce.length,0);
 h.selector.show(TIRANA,{direction:'descend'});
 const screen=h.current();assert.equal(screen.querySelector('.explorer-siblings').hidden,true);assert.equal(screen.querySelectorAll('.explorer-sibling').length,0);
 assert.equal(screen.querySelector('.explorer-campus-back').textContent,'Albanie','the back pill is always there (R13)');
});

test('the wheel steps once per gesture, follows the reading direction and leaves zoom gestures alone',async()=>{
 const h=harness();h.selector.show(L1_FR);
 assert.equal(h.wheel({deltaY:30}).defaultPrevented,true,'registered as a non-passive listener');assert.equal(h.cursor(),'africa');
 h.wheel({deltaY:30});assert.equal(h.cursor(),'americas');
 h.wheel({deltaY:200});h.wheel({deltaY:200});assert.equal(h.cursor(),'americas','inertia is ignored until the wheel rests');
 await h.later(150);h.wheel({deltaY:4,deltaMode:1});assert.equal(h.cursor(),'asia','lines count 16 px');
 await h.later(150);h.wheel({deltaX:-60,deltaY:10});assert.equal(h.cursor(),'americas','the dominant horizontal axis');
 await h.later(150);const zoom=h.wheel({deltaY:-200,ctrlKey:true});assert.equal(zoom.defaultPrevented,false);assert.equal(h.cursor(),'americas');
 assert.equal(h.wheel({deltaY:-1,metaKey:true}).defaultPrevented,false);
 assert.equal(h.doc.activeElement,h.doc.body,'the wheel never takes the focus');assert.equal(h.calls.announce.length+h.calls.validate.length,0);
 const rtl=harness({dir:'rtl',locale:'ar'});rtl.selector.show(L1_AR);
 rtl.wheel({deltaX:-60});assert.equal(rtl.cursor(),'africa','in RTL a leftward swipe goes forward');
 await rtl.later(150);rtl.wheel({deltaX:60});assert.equal(rtl.cursor(),'asia');
});

test('no animate() call under reduced motion; turning it on cancels what runs and drops the outgoing view',async()=>{
 const h=harness({reduced:true});h.selector.show(L1_FR,{focus:true});
 h.nav('next').click();h.key('ArrowRight',{},h.card('americas'));h.wheel({deltaY:80});
 assert.ok(h.cards().every(card=>!('gliding' in card.dataset)),'no glide');
 h.selector.show(l3France('paris'),{direction:'descend'});h.selector.show(campusView('paris'),{direction:'descend'});h.selector.show(l3France('paris'),{direction:'ascend'});
 assert.equal(h.doc.animations.length,0);assert.equal(h.screens().length,1,'outgoing views are removed at once');
 const m=harness();m.selector.show(L1_FR);m.nav('next').click();assert.equal(m.doc.animations.length,0,'glides are CSS transitions');
 assert.ok(m.cards().some(card=>'gliding' in card.dataset));
 m.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(m.screens().length,2);assert.equal(m.doc.animations.length,2);
 m.nav('next').click();assert.ok(m.cards().some(card=>'gliding' in card.dataset));
 m.media.set(true);
 assert.ok(m.doc.animations.every(animation=>animation.playState==='idle'));assert.equal(m.screens().length,1);
 assert.ok(m.cards().every(card=>!('gliding' in card.dataset)),'running glides stop');
 await flush();assert.equal(m.screens().length,1);
});

test('the validated logo glides into the heart (FLIP on the logos\' own rects); the generic descend otherwise',async()=>{
 const h=harness();h.selector.show(l3France('paris'));h.doc.runFrames();
 const source=h.card('paris').querySelector('.hx-logo').getBoundingClientRect(),lantern=h.card('paris').querySelector('.explorer-lantern');
 h.selector.show(campusView('paris'),{direction:'descend'});
 const screen=h.current(),handle=screen.querySelector('.explorer-sheet');
 const byElement=element=>h.doc.animations.filter(animation=>animation.element===element);
 const level=h.screens()[0];assert.equal(level.dataset.state,'leaving');
 assert.deepEqual(byElement(level)[0].keyframes,[{opacity:1},{opacity:0}]);assert.deepEqual([byElement(level)[0].options.duration,byElement(level)[0].options.easing],[220,'linear']);
 assert.equal(lantern.style.visibility,'hidden','the source lantern hides');
 const heartLantern=handle.querySelector('.explorer-sheet-lantern'),[flip]=byElement(heartLantern);
 const dx=Math.round((source.left+source.width/2-HEART.left-HEART.width/2)*100)/100,dy=Math.round((source.top+source.height/2-HEART.top-HEART.height/2)*100)/100;
 assert.deepEqual(flip.keyframes,[{transform:`translate(${dx}px, ${dy}px) scale(${Math.round(source.width/HEART.width*10000)/10000})`},{transform:'none'}]);
 assert.equal(flip.options.duration,560);
 assert.equal(h.doc.animations.some(animation=>animation.element.localName==='h2'&&animation.keyframes.some(frame=>/scale/.test(frame.transform||''))),false,'the h2 is never scaled');
 const heart=['h2','p','a'].map(tag=>handle.querySelector('.explorer-sheet-heart').children.find(node=>node.localName===tag));
 assert.deepEqual(heart.map(node=>byElement(node)[0].options.delay),[200,240,280]);
 assert.deepEqual(byElement(heart[0])[0].keyframes,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}]);
 const [start,end]=handle.querySelectorAll('.explorer-sheet-wing');
 assert.deepEqual(byElement(start)[0].keyframes[0],{opacity:0,transform:'translateX(28px)'});assert.deepEqual(byElement(end)[0].keyframes[0],{opacity:0,transform:'translateX(-28px)'});
 assert.deepEqual([byElement(start)[0].options.duration,byElement(start)[0].options.delay],[460,260]);
 const strip=byElement(screen.querySelector('.explorer-campus-foot'))[0];assert.deepEqual(strip.keyframes[0],{opacity:0,transform:'translateY(12px)'});assert.deepEqual([strip.options.duration,strip.options.delay],[360,340]);
 assert.ok(h.doc.animations.filter(animation=>animation.options.delay).every(animation=>animation.options.fill==='backwards'));
 // RTL: the wings slide the other way.
 const rtl=harness({dir:'rtl',locale:'ar'});rtl.selector.show(l3France('paris'));rtl.selector.show(campusView('paris','ar'),{direction:'descend'});
 const wings=rtl.current().querySelectorAll('.explorer-sheet-wing');assert.deepEqual(rtl.doc.animations.find(animation=>animation.element===wings[0]).keyframes[0],{opacity:0,transform:'translateX(-28px)'});
 // A deep link, the dice or Back/Forward have no visible source logo: the generic descend plays.
 const g=harness();g.selector.show(L1_FR);g.selector.show(campusView('paris'),{direction:'descend'});
 assert.deepEqual(g.doc.animations.map(animation=>animation.keyframes[0].transform),['none','translateY(22px)']);
 // Another campus than the L3 cursor, or the compact row: generic too.
 const other=harness();other.selector.show(l3France('nice'));other.selector.show(campusView('paris'),{direction:'descend'});assert.equal(other.doc.animations.length,2);
 const compact=harness({screen:LANDSCAPE});compact.selector.show(l3France('paris'));compact.selector.show(campusView('paris'),{direction:'descend'});
 assert.deepEqual(compact.doc.animations.map(animation=>animation.keyframes[0].transform),['none','translateY(22px)']);
 // A new view during the FLIP cancels it and removes the outgoing level at once.
 h.selector.show(l3France('paris'),{direction:'ascend'});
 assert.ok(h.doc.animations.slice(0,-2).every(animation=>animation.playState!=='running'));assert.equal(h.screens().filter(node=>node.classList.contains('explorer-campus')).length,1);
});

test('pointer clicks inside the campus section are ignored while it enters; keyboard activation passes (R26)',async()=>{
 const h=harness();h.selector.show(l3France('paris'));await h.later();
 h.selector.show(campusView('paris'),{direction:'descend'});
 const screen=h.current(),cta=screen.querySelector('.explorer-sheet-cta'),reached=[];
 h.root.addEventListener('click',()=>reached.push('root'));
 assert.equal(screen.dataset.entering,'');
 await h.later(400);
 for(const type of ['click','auxclick','mousedown']){const event=h.event(type,cta,{detail:1});assert.equal(event.defaultPrevented,true,type);assert.equal(event.propagationStopped,true);}
 assert.deepEqual(reached,[],'nothing behind the guard sees the click');
 assert.equal(h.event('click',cta,{detail:0}).defaultPrevented,false,'keyboard and assistive technology pass');assert.deepEqual(reached,['root']);
 await h.later(320);assert.equal(screen.dataset.entering,undefined,'removed after the FLIP (720 ms)');
 assert.equal(h.event('click',cta,{detail:1}).defaultPrevented,false);
 // Generic descend: 500 ms; reduced motion: still 350 ms.
 const g=harness();g.selector.show(L1_FR);g.selector.show(campusView('paris'),{direction:'descend'});await g.later(499);assert.equal(g.current().dataset.entering,'');await g.later(2);assert.equal(g.current().dataset.entering,undefined);
 const r=harness({reduced:true});r.selector.show(l3France('paris'));r.selector.show(campusView('paris'),{direction:'descend'});
 await r.later(349);assert.equal(r.current().dataset.entering,'');assert.equal(r.event('click',r.current().querySelector('.explorer-sheet-cta'),{detail:1}).defaultPrevented,true);
 await r.later(2);assert.equal(r.current().dataset.entering,undefined);
 // A sibling switch sets no guard, and the first view (nothing before it) has none.
 r.selector.show(campusView('lyon'));assert.equal(r.current().dataset.entering,undefined);
 const first=harness();first.selector.show(campusView('paris'));assert.equal(first.current().dataset.entering,undefined);
});

test('the outgoing campus section is frozen at its recorded box when the band moves',()=>{
 const h=harness();h.selector.show(campusView('paris'));
 const screen=h.current();h.selector.show(l3France('paris'),{direction:'ascend'});
 assert.deepEqual([screen.style.position,screen.style.left,screen.style.top,screen.style.width,screen.style.height],['absolute','0px','148px','1440px','549px']);
 assert.equal(screen.inert,true);
});

test('destroy removes the listeners, observers, timers, frames, the screens and the title it created',async()=>{
 const h=harness();h.selector.show(l3France('paris'));h.selector.show(campusView('paris'),{direction:'descend',focus:true});
 const screen=h.current();h.selector.destroy();
 assert.equal(h.root.children.length,0);assert.equal(screen.parentNode,null);assert.equal(h.selector.hasView(),false);
 assert.deepEqual(h.calls.destroys,[{campusId:'paris',locale:'fr'}]);
 assert.equal(h.root.listeners.length,0);assert.equal(h.media.listeners.length,0);assert.equal(h.doc.coarse.listeners.length,0);
 assert.ok(h.doc.observers.every(observer=>observer.targets.size===0));
 assert.equal(h.doc.frames.size,0,'pending frames are cancelled');
 await h.later(1000);assert.equal(screen.dataset.entering,undefined);
 h.selector.show(L1_FR);assert.equal(h.root.children.length,0);assert.equal(h.selector.setCursor('africa'),false);
 const kept=harness({title:true});kept.selector.destroy();assert.equal(kept.root.children[0].id,'explorer-title');
});

/* ---- Stylesheet contract ------------------------------------------------------------------------------------------- */
test('stylesheet: the focus cue of decision A, halo\'s glows, no [data-band] and no colour literal',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8');
 const block=css.slice(css.indexOf('/* Focus cue: user decision A (24 Oct 2026) */'));
 assert.ok(css.includes('/* Focus cue: user decision A (24 Oct 2026) */'));
 assert.ok(block.startsWith('/* Focus cue: user decision A (24 Oct 2026) */\n:root #explorer .explorer-item:focus{outline:none}\n:root #explorer .explorer-item:focus-visible > .explorer-go{outline:var(--hx-focus-ring-width) solid var(--hx-focus);outline-offset:var(--hx-focus-ring-offset)}\n@media (forced-colors: active){:root #explorer .explorer-item:focus-visible > .explorer-go{outline-color:Highlight}}'));
 const rules=[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 const itemOutlines=rules.filter(rule=>/explorer-item/.test(rule.selector)&&/outline/.test(rule.body));
 assert.deepEqual(itemOutlines.map(rule=>rule.selector),[':root #explorer .explorer-item:focus',':root #explorer .explorer-item:focus-visible > .explorer-go',':root #explorer .explorer-item:focus-visible > .explorer-go'],'no other outline on items');
 // No block on items (H1, D3): the button has no background, border, radius or shadow, in any state.
 const item=rules.find(rule=>rule.selector===':root #explorer .explorer-item');
 for(const declaration of ['background:none','border:0','border-radius:0','box-shadow:none'])assert.ok(item.body.includes(declaration),declaration);
 const self=rules.filter(rule=>rule.selector.split(',').some(part=>/\.explorer-item(\[[^\]]*\]|:[\w-]+(\([^)]*\))?)*\s*$/.test(part.trim())));
 assert.ok(self.every(rule=>!/(^|;)\s*(background|border|border-radius|box-shadow|outline)\s*:/.test(rule.body)||rule===item||/:focus$/.test(rule.selector)),self.map(rule=>rule.selector).join(' | '));
 assert.match(css,/\.explorer-glow\{[^}]*inline-size:calc\(1\.5 \* var\(--b0\)\);block-size:calc\(1\.5 \* var\(--h0\)\);transform:translate\(-50%,-50%\) scale\(var\(--gx\),1\)/);
 assert.match(css,/\.explorer-glow-cursor\{inline-size:calc\(1\.9 \* var\(--b0\)\);block-size:calc\(1\.75 \* var\(--h0\)\);background:var\(--hx-cursor-glow\)/);
 const code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(code,/\[data-band/);assert.doesNotMatch(code,/\.explorer-sheet/);assert.doesNotMatch(code,/\.campus-details/);
 assert.doesNotMatch(code,/--hx-[\w-]+\s*:/,'tokens are defined in explorer-art.css only');
 const hexes=[...code.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(match=>match[0]);
 assert.ok(hexes.every(hex=>hex==='#000'),hexes.join());
 for(const line of code.split('\n').filter(line=>line.includes('#000')))assert.match(line,/mask-image/);
 assert.doesNotMatch(code,/\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/);
 // System and named colours only inside forced-colours blocks.
 const outside=withoutBlocks(code,/@media ?\(forced-colors: ?active\)\{/);
 assert.doesNotMatch(outside,/(?<![\w-])(Canvas|CanvasText|Highlight|ButtonText|GrayText|white|black|red|blue|green|gray|grey)(?![\w-])/);
 // Transitions are scoped to glides; instant layouts switch them off.
 assert.match(css,/\.explorer-item\[data-gliding\]\{transition:transform \.5s var\(--ease\),opacity \.35s;will-change:transform\}/);
 assert.match(css,/\.explorer-level\[data-instant\] :is\(\.explorer-item,\.explorer-item \*,\.explorer-pool,\.explorer-dots>i\)/);
 assert.ok(rules.filter(rule=>/explorer-item/.test(rule.selector)&&/transition/.test(rule.body)&&!/prefers-reduced/.test(rule.selector)).every(rule=>/data-gliding|data-instant|explorer-item,\.explorer-item \*/.test(rule.selector)),'no transition outside a glide');
});

test('stylesheet: the heart-column top fade, the scoped margin reset and the forced-colours fixes (fixes 3–6)',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8'),code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(code,/:where\(p,h2\)/);assert.match(code,/:root #explorer :is\(\.explorer-prompt,\.explorer-hint,\.explorer-campus-title\)\{margin:0\}/);
 // Fix 3: at normal density and in the wide short layout only; the scroll fades minus halo's 18 px over the 360 px heart column.
 const heart=[...code.matchAll(/[^{}]*\.explorer-campus\[data-density=(\w+)\] \.explorer-campus-body\{([^}]*)\}/g)].filter(match=>/mask/.test(match[2]));
 assert.deepEqual(heart.map(match=>match[1]),['normal','short']);
 for(const [, ,body]of heart){
  for(const prefix of ['-webkit-mask-image:','mask-image:'])assert.ok(body.includes(prefix+'linear-gradient(180deg,transparent 0,#000 var(--explorer-fade-start),#000 calc(100% - var(--explorer-fade-end)),transparent 100%),linear-gradient(180deg,#000 0,transparent calc(18px - var(--explorer-fade-start)))'),prefix);
  for(const declaration of ['mask-size:100% 100%,360px 100%','mask-position:center top','mask-repeat:no-repeat','-webkit-mask-composite:source-out','mask-composite:subtract'])assert.ok(body.includes(declaration),declaration);
 }
 assert.match(code,/@media\(min-width:1100px\)\{:root #explorer \.explorer-campus\[data-density=short\] \.explorer-campus-body\{/);
 // Fixes 5 and 6, in the forced-colours block.
 const forced=code.slice(code.indexOf('@media(forced-colors:active){'));
 assert.match(forced,/:root #explorer \.explorer-item\[data-off\] \.hx-art\{filter:none\}/);
 assert.match(forced,/:root #explorer \.explorer-siblings-list \.explorer-sibling\[aria-current=true\]:focus-visible\{outline:2px solid CanvasText;outline-offset:-6px\}/);
 // Final check: names over shapes opt out of the browser's rectangular backplate and keep a Canvas halo on the glyphs.
 assert.match(forced,/:root #explorer \.explorer-item:not\(\[data-kind=campus\]\) \.explorer-name\{forced-color-adjust:none;color:CanvasText;-webkit-text-stroke-width:calc\(var\(--hx-name-stroke\) \/ var\(--nk\)\);-webkit-text-stroke-color:Canvas;paint-order:stroke fill;text-shadow:none\}/);
});

// Removes every block opened by `opener` (with its nested braces).
function withoutBlocks(text,opener){
 let output='',index=0;
 for(const match of text.matchAll(new RegExp(opener.source,'g'))){
  if(match.index<index)continue;
  output+=text.slice(index,match.index);let depth=0,cursor=match.index+match[0].length-1;
  for(;cursor<text.length;cursor++){if(text[cursor]==='{')depth++;else if(text[cursor]==='}'&&--depth===0)break;}
  index=cursor+1;
 }
 return output+text.slice(index);
}

// The views, the art and the shapes come from other modules written in parallel: check the shared contract once
// they exist (gates: the model; explorer-art.mjs exports fitLogo and ensureArtDefs; SHAPES.world.sphere exists).
const modelURL=new URL('./explorer-model.mjs',import.meta.url),artURL=new URL('./explorer-art.mjs',import.meta.url),shapesURL=new URL('./explorer-shapes.mjs',import.meta.url);
const exists=url=>access(url).then(()=>true,()=>false);
const realArt=await exists(artURL)?await import(artURL.href).catch(()=>null):null,realShapes=await exists(shapesURL)?await import(shapesURL.href).catch(()=>null):null;
const contractReady=await exists(modelURL)&&typeof realArt?.fitLogo==='function'&&typeof realArt?.ensureArtDefs==='function'&&Boolean(realShapes?.SHAPES?.world?.sphere);
test('contract: the real model, art and shapes render the three literal views as specified',{skip:!contractReady&&'explorer-art.mjs or the regenerated explorer-shapes.mjs is not there yet'},async()=>{
 const {buildExplorerView}=await import(modelURL.href);
 const network=JSON.parse(await readFile(new URL('./campuses.json',import.meta.url),'utf8')),catalog={countries:network.countries,campuses:network.campuses};
 const logos=JSON.parse(await readFile(new URL('./campus-logos.json',import.meta.url),'utf8'));
 const countryName=locale=>{const names=new Intl.DisplayNames(locale,{type:'region'});return id=>{const entry=network.countries.find(item=>item.id===id);return names.of(entry.iso2)||entry.name;};};
 const art={...realArt,shapes:realShapes.SHAPES,flagHref:id=>{const entry=network.countries.find(item=>item.id===id);return entry?.iso2?'assets/flags/'+entry.iso2.toLowerCase()+'.svg':null;},logo:id=>logos.campuses?.[id]?.print||null};
 const fr=harness({art});fr.selector.show(buildExplorerView({scope:{level:'world'},catalog,locale:'fr',countryName:countryName('fr')}));
 // Level 1: the four continents only, the cursor on the first of the locale's order (Monde removed, 25 Oct 2026).
 assert.deepEqual(fr.cards().map(card=>card.dataset.id),['africa','americas','asia','europe']);assert.equal(fr.cursor(),'africa');
 assert.ok(fr.cards().every(card=>card.dataset.kind==='continent'),'no Monde globe');
 assert.equal(fr.card('africa').getAttribute('aria-label'),'Afrique · 6 campus · 3 pays · 1 sur 4 · Valider');
 assert.equal(fr.card('americas').getAttribute('aria-label'),'Amériques · 4 campus · 2 pays · 2 sur 4');
 assert.equal(fr.current().querySelector('.explorer-prompt').textContent,'Où veux-tu aller ? · Étape 1 sur 3');
 for(const card of fr.cards())assert.ok(card.querySelector('.explorer-figure').children.some(node=>node.getAttribute('class')?.split(' ').includes('hx-art')),card.dataset.id+' has its silhouette');
 const arL1=harness({locale:'ar',dir:'rtl',art});arL1.selector.show(buildExplorerView({scope:{level:'world'},catalog,locale:'ar',countryName:countryName('ar')}),{focus:true});
 assert.deepEqual(arL1.cards().map(card=>card.dataset.id),['asia','africa','americas','europe']);assert.equal(arL1.cursor(),'asia');assert.equal(arL1.doc.activeElement,arL1.card('asia'));
 const ar=harness({locale:'ar',dir:'rtl',art});ar.selector.show(buildExplorerView({scope:{level:'continent',continent:'europe'},catalog,locale:'ar',countryName:countryName('ar')}));
 assert.equal(ar.current().querySelector('.explorer-prompt').textContent,'اختر دولة · المرحلة 2 من 3');assert.equal(ar.cards().length,14);
 assert.equal(ar.card('FRA').getAttribute('aria-label'),`فرنسا · 8 فروع · ${ar.cards().indexOf(ar.card('FRA'))+1} من 14`);
 assert.ok(ar.cards().every(card=>card.querySelector('svg.hx-art')));
 const l3=harness({art});l3.selector.show(buildExplorerView({scope:{level:'country',country:'FRA'},catalog,locale:'fr',countryName:countryName('fr'),cursorId:'paris'}));
 assert.equal(l3.cursor(),'paris');
 if(logos.campuses?.paris?.print)assert.ok(l3.card('paris').querySelector('.explorer-lantern').children.some(node=>node.getAttribute('class')?.split(' ').includes('hx-logo')),'the printed logo of 42 Paris');
 const en=harness({locale:'en',art});en.selector.show(buildExplorerView({scope:{level:'campus',country:'FRA',campus:'paris'},catalog,locale:'en',countryName:countryName('en')}),{focus:true});
 const screen=en.current();assert.equal(en.doc.activeElement,screen.querySelector('h2'));assert.equal(screen.querySelector('h2').textContent,'42 Paris');
 assert.equal(screen.querySelector('.explorer-campus-back').getAttribute('aria-label'),'Back to campuses · France');
 const pills=screen.querySelectorAll('.explorer-sibling');assert.equal(pills.length,8);assert.equal(pills[0].textContent,'42 Angoulême');assert.equal(pills.at(-1).textContent,'42 Perpignan');
 assert.deepEqual(pills.filter(pill=>pill.getAttribute('aria-current')==='true').map(pill=>pill.dataset.id),['paris']);
 assert.equal(en.calls.renders[0].options.headingId,screen.getAttribute('aria-labelledby'));
});
