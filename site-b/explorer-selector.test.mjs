import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {createExplorerSelector,haloGeometry,floorAt,layoutItems,pagerDots} from './explorer-selector.mjs';
// The drag's continuous layout (25 Oct 2026, refinements §C), read from the namespace so that its tests fail one by one
// on a module without it.
import * as selector from './explorer-selector.mjs';

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
const SMALL={W:320,height:640,band:283.2,gutter:20,top:170.8,H:204,carouselTop:200};
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
 // A level frozen as it leaves (R21) stays at the box written on it (the stage's padding box starts at 0, 0 here).
 if(classes.contains('explorer-level')&&element.style.position==='absolute')return rect(...['left','top','width','height'].map(name=>Number.parseFloat(element.style[name])));
 if(classes.contains('explorer-level'))return rect(screen.gutter,screen.top,screen.W-2*screen.gutter,screen.band);
 // The head (§4.16): the steps (68 × 8 px), centred alone in the level since 26 Oct 2026 (§V); after them in reading
 // order (on their left in RTL), the visually hidden prompt, 1 px wide in the flow (its margin takes that pixel back)
 // and one line tall (its paragraph and its text share the box).
 if(classes.contains('explorer-steps')||classes.contains('explorer-prompt-text')||classes.contains('explorer-prompt')){
  const frame=layout(doc,element.closest('.explorer-level')),start=frame.left+(frame.width-68)/2,rtl=doc.documentElement.dir==='rtl';
  if(classes.contains('explorer-steps'))return rect(start,frame.top+13,68,8);
  return rect(rtl?start-1:start+68,frame.top+6,1,23);
 }
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
 // The foot (§H): at the bottom of its level, 78.5 px tall in normal bands (the room of the former hint line) and 50 px
 // otherwise; its 44 px pager row, 4 px down, holds the dots (6 px dots 6 px apart and the pill's 14 px, or 4 / 4 / 10
 // dense), the 55 px count and the 28 px info button, 12 px apart and centred, the dots on the right in RTL.
 if(classes.contains('explorer-foot')){const level=element.closest('.explorer-level'),frame=layout(doc,level),height=level.dataset.density==='normal'?78.5:50;return rect(frame.left,frame.top+frame.height-height,frame.width,height);}
 if(['explorer-dots','explorer-count','explorer-info'].some(name=>classes.contains(name))){
  const pager=element.parentNode,foot=layout(doc,pager.parentNode),dots=pager.children[0],n=dots.hidden?0:dots.children.length,rtl=doc.documentElement.dir==='rtl';
  const width=node=>node===dots?('dense' in dots.dataset?n*4+(n-1)*4+10:n*6+(n-1)*6+14):node.classList.contains('explorer-count')?55:28;
  const parts=pager.children.filter(node=>!node.hidden&&(node!==dots||n)),total=parts.reduce((sum,node)=>sum+width(node),0)+12*(parts.length-1);
  let x=foot.left+(foot.width-total)/2;
  for(const node of rtl?[...parts].reverse():parts){if(node===element){const height=node===dots?6:node===pager.children[2]?28:19;return rect(x,foot.top+4+(44-height)/2,width(node),height);}x+=width(node)+12;}
  return rect(foot.left,foot.top,0,0);
 }
 // The fixed « Valider » (§P): centred in the carousel at its --go-y (track coordinates), 36 px tall, as wide as its label.
 if(classes.contains('explorer-go')&&element.parentNode?.classList.contains('explorer-track')){
  if(element.hidden)return rect(0,0,0,0);
  const width=55+element.textContent.length*6.2;return rect(screen.W/2-width/2,screen.carouselTop-170+varOf(element,'--go-y'),width,36);
 }
 // The open bubble (§H): its hint at 7 px a character and 2 × 13 px of padding and border, at most the foot's width; one
 // line of 24 px or two of 46.39 px (Chrome, 26 Oct 2026), plus 10 px of padding and border; placed in the foot by
 // --hint-left and --hint-bottom.
 if(classes.contains('explorer-hint')&&'open' in element.dataset){
  const foot=layout(doc,element.parentNode),shown=element.children.find(child=>!child.hidden),natural=(shown?.textContent.length??0)*7+26;
  const width=Math.min(natural,foot.width),height=(natural>foot.width?46.39:24)+10;
  return rect(foot.left+(varOf(element,'--hint-left')||0),foot.bottom-(varOf(element,'--hint-bottom')||0)-height,width,height);
 }
 // Any other part of a level (the hint, the horizon, the pool) stands where its level stands.
 const level=element.closest?.('.explorer-level');
 if(level){const frame=layout(doc,level);return rect(frame.left,frame.top,0,0);}
 return rect(0,0,0,0);
}
// The step dots' looks as a browser computes them (§4.16), by state.
const STEP_LOOKS={done:{backgroundColor:'rgb(0, 186, 188)',width:'6px',height:'6px',boxShadow:'none'},todo:{backgroundColor:'rgba(24, 61, 60, 0.22)',width:'6px',height:'6px',boxShadow:'none'},
 current:{backgroundColor:'rgb(237, 52, 145)',width:'8px',height:'8px',boxShadow:'rgba(237, 52, 145, 0.16) 0px 0px 0px 4px'}};
function size(doc,element,name){
 const screen=doc.screen,classes=element.classList;
 if(name==='offsetWidth'){
  if(classes.contains('explorer-level')){doc.flushes++;return screen.W-2*screen.gutter;}
  if(classes.contains('explorer-name'))return doc.nameWidth(element);
  if(classes.contains('explorer-count'))return 55;
  // The open bubble (§H): its visible hint at 7 px a character and 2 × 13 px of padding and border, at most the band.
  if(classes.contains('explorer-hint')){const shown=element.children.find(child=>!child.hidden);return Math.min((shown?.textContent.length??0)*7+26,screen.W-2*screen.gutter);}
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
  // The stage's paddings are the band's insets (§3.1); the step dots' looks follow their state (a level change reads them).
  getComputedStyle:element=>element.id==='explorer'?{paddingLeft:doc.screen.gutter+'px',paddingRight:doc.screen.gutter+'px',paddingTop:doc.screen.top+'px',paddingBottom:(doc.screen.height-doc.screen.top-doc.screen.band)+'px'}:
   element.classList?.contains('explorer-step')?{...STEP_LOOKS[element.dataset.state]}:doc.computed.get(element)??{},
  ResizeObserver:FakeResizeObserver,matchMedia:query=>query==='(hover:none) and (pointer:coarse)'?coarseQuery:{matches:false,addEventListener(){},removeEventListener(){}}};
 doc.advance=async ms=>{clock+=ms;for(const [id,timer]of [...timers])if(timer.at<=clock&&timers.delete(id))timer.callback();await flush();};
 // The same without waiting for promises, for frame-by-frame tests; runFrames() may give the frames a time of their own.
 doc.tick=ms=>{clock+=ms;for(const [id,timer]of [...timers])if(timer.at<=clock&&timers.delete(id))timer.callback();};
 doc.now=()=>clock;
 doc.runFrames=time=>{for(const [id,callback]of [...frames]){frames.delete(id);callback(time);}};
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
 // The cursor itself (its tabindex, at once); since §L the looks (data-off) follow the nearest rank while the row glides.
 h.cursor=()=>h.cards().find(card=>card.tabIndex===0)?.dataset.id;
 h.centre=()=>h.cards().find(card=>card.dataset.off==='0')?.dataset.id;
 // Animation frames 1/60 s apart, for `ms` (by default long enough for a glide along the horizon and its fades, §L).
 h.frame=(ms=1000/60)=>{h.doc.tick(ms);h.doc.runFrames();};
 h.glide=(ms=900)=>{for(let time=0;time<ms-1e-9;time+=1000/60)h.frame();};
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
// L3 stands on the L1/L2 line since 25 Oct 2026 (refinements §I): its d1, R and floor0 are those of TABLE_L12's row,
// its drops those of its own slots on that line; its sizes, button and fade are §3.4's. Their floor0 is the middle of
// the carousel, which the line leaves since 26 Oct 2026 (§U, lowered).
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
 ['1440 FR',1440,411,false,200,200,331.2,495.2,30,1843.2,289.5,30,67.8,22,220,86.4],
 ['1440 AR',1440,395.1,false,200,200,331.2,495.2,30,1843.2,281.5,30,67.8,22,220,86.4],
 ['1366',1366,307.5,false,191.5,191.5,314.2,473.9,23.9,2073.6,212.5,23.9,54.9,21.1,220,82],
 ['1280×1024',1280,535,false,200,200,294.4,458.4,30,1645.7,351.5,26.5,65.1,22,220,76.8],
 ['1280×720',1280,259.5,false,143.5,143.5,294.4,430.2,18.2,2392.8,164.5,18.2,39,18,220,76.8],
 ['1024 FR',1024,307.5,false,191.5,191.5,235.5,395.3,23.9,1448.3,212.5,19.3,55,21.1,220,61.4],
 ['1024 AR',1024,293.1,false,177.1,177.1,235.5,388.1,22.2,1559.1,198.1,17.9,49.1,19.5,220,61.4],
 ['768 FR',768,538.6,false,200,200,218,382,30,761.8,353.3,31.9,102.7,22,220,46.1],
 ['768 AR',768,520.7,false,200,200,218,382,30,761.8,344.4,31.9,102.7,22,220,46.1],
 ['390 FR',390,377.1,true,200,200,205,null,22.5,1076,272.6,19.7,null,22,220,64],
 ['390 AR',390,359.2,true,200,200,205,null,22.5,1076,263.6,19.7,null,22,220,64],
 ['320',320,204,true,88,88,138.6,null,8.6,1344.3,109,7.2,null,18,212,42],
];
const five=(ratio=1.36)=>['a','b','c','d','e'].map(id=>({id,kind:'country',ratio}));
// The line of §U: 40 px under the middle of the carousel, or as far as the campus level's one-line name and the fixed
// « Valider » under it (10 + 1.12 F + 12 + 36 px, F the campus level's) still end inside the carousel; never higher.
const lowered=(middle,H,campusF)=>Math.max(middle,Math.min(middle+40,H-(10+1.12*campusF+12+36)));
test('haloGeometry, floorAt and the edge fade reproduce both tables of §3.4 for the given H (L3 on the L1/L2 line, §I; the line lowered, §U)',()=>{
 const campusF=Object.fromEntries(TABLE_L3.map(row=>[row[0],row[13]]));
 for(const [campus,table]of [[false,TABLE_L12],[true,TABLE_L3]])for(const [name,W,H,phone,bh,bw,x1,x2,d1,R,middle,drop1,drop2,F,button,fade]of table){
  const g=haloGeometry({W,H,phone,campus,density:'normal'}),label=`${campus?'L3':'L1/L2'} ${name}`,floor0=lowered(middle,H,campusF[name]);
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
 // Effective sizes: names 32 / 16 / 13 (Arabic 14); mt keeps 10 px on screen under the box (the campus names). No count
 // under the shapes since 25 Oct 2026 (§K): nothing sizes one.
 const [two,one,cursor]=lay.items;
 near(cursor.nk,1,1e-9);near(one.nk,16/32,1e-9);near(two.nk,13/32,1e-9);near(one.ns,.5/.58,1e-9);
 near(one.mt,10/.58-10,1e-9);near(cursor.mt,0,1e-9);assert.ok(lay.items.every(entry=>!('ms' in entry)),'no count scale');
 const arabic=layoutItems({geometry:g,items,cursorIndex:2,rtl:true});
 near(arabic.items[0].nk,14/32,1e-9);near(arabic.items[1].nk,16/32,1e-9);
 assert.equal(layoutItems({geometry:g,items,cursorIndex:2,rtl:true,arabic:false}).items[0].nk,13/32,'arabic follows its own flag');
 // The figure keeps its viewBox ratio inside the cursor box, at the cursor scale and the same at every rank.
 for(const entry of lay.items){near(entry.fh,250,1e-9);near(entry.fw,340,1e-9);}
 const tall=layoutItems({geometry:g,items:[{id:'x',ratio:.8}],cursorIndex:0}).items[0];near(tall.fw,200,1e-9);near(tall.fh,250,1e-9);
 const flat=layoutItems({geometry:g,items:[{id:'x',ratio:2}],cursorIndex:0}).items[0];near(flat.fw,340,1e-9);near(flat.fh,170,1e-9);
 const unknown=layoutItems({geometry:g,items:[{id:'x'}],cursorIndex:0}).items[0];near(unknown.fw,300,1e-9,'name-only items use halo\'s 1.2');
});

test('layoutItems: button widths never overlap, phones use the art',()=>{
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

/* ---- The drag's continuous layout (25 Oct 2026, refinements §C) -------------------------------------------------- */
// What a drag runs through: L1/L2 and L3 at 1440, the edge rule R20 at 1024 and 768, phones at 390 and 320 (the ±2 waiting
// off screen, R24's name shift), with names, labels and prints (and a campus without one).
const lerp=(a,b,t)=>a+(b-a)*t;
const named=(count,ratio=1.36)=>Array.from({length:count},(_,index)=>({id:'n'+index,kind:'country',ratio:ratio+index*.07,nameWidth:60+index*23,labelX:.3+index*.06}));
const printed=()=>['mulhouse','nice','paris','perpignan','lyon','angouleme'].map(id=>({id,kind:'campus',print:PRINTS[id]||null,nameWidth:90}));
const DRAG_CASES=[
 ['1440 L2',haloGeometry({W:1440,H:411,phone:false,campus:false,density:'normal'}),named(7)],
 ['1440 L3',haloGeometry({W:1440,H:411,phone:false,campus:true,density:'normal'}),printed()],
 ['1024 L2 (R20)',haloGeometry({W:1024,H:307.5,phone:false,campus:false,density:'short'}),named(6)],
 ['768 L3 (R20)',haloGeometry({W:768,H:538.6,phone:false,campus:true,density:'normal'}),printed()],
 ['390 L2',haloGeometry({W:390,H:377.1,phone:true,campus:false,density:'normal'}),named(5)],
 ['390 L3',haloGeometry({W:390,H:377.1,phone:true,campus:true,density:'normal'}),printed()],
 ['320 L2',haloGeometry({W:320,H:204,phone:true,campus:false,density:'short'}),named(4,2.2)],
];
const FIELDS=['x','y','s','dist','nk','ns','mt','lk','nx'];
test('continuousLayout: a whole cursor gives layoutItems\' positions, scales and looks, at every level, size and direction',()=>{
 for(const [label,g,items]of DRAG_CASES)for(const rtl of [false,true])for(let cursor=0;cursor<items.length;cursor++){
  const whole=layoutItems({geometry:g,items,cursorIndex:cursor,rtl,fitLogo:realFitLogo}),drag=selector.continuousLayout({geometry:g,items,cursor,rtl,fitLogo:realFitLogo});
  const where=`${label} ${rtl?'RTL':'LTR'} c=${cursor}`;
  assert.equal(drag.fade,whole.fade,where);assert.equal(drag.nmax,whole.nmax,where);
  drag.items.forEach((entry,index)=>{
   const {visible,sr,...rest}=entry,{visible:shown,...expected}=whole.items[index];
   assert.deepEqual(rest,expected,where+' '+entry.id);assert.equal(sr,expected.s,where+' the looks\' scale');
   // An item « out » by its looks may still stand on screen (fading out during a drag): the others agree.
   if(expected.off!=='out')assert.equal(visible,shown,where+' '+entry.id+' visible');
  });
 }
});

test('continuousLayout: for any cursor, also past either end, every item stands on the horizon and goes linearly from rank to rank',()=>{
 // The rank values of §4.14, stated again here, and their linear interpolation (§C).
 const rank=(g,a,small)=>({dist:a===0?0:a===1?g.x1:a===2?g.x2:g.x2+(a-2)*150,s:a===0?1:a===1?g.s1:a===2?g.s2:g.s2*.8,nk:a===0?1:a===1?16/g.F:small/g.F});
 for(const [label,g,items]of DRAG_CASES)for(const rtl of [false,true])for(let cursor=-2.5;cursor<=items.length+1.5;cursor+=1/16){
  const drag=selector.continuousLayout({geometry:g,items,cursor,rtl,fitLogo:realFitLogo}),small=rtl?14:13;
  drag.items.forEach((entry,index)=>{
   const where=`${label} ${rtl?'RTL':'LTR'} c=${cursor} ${entry.id}`,a=Math.abs(index-cursor),k=Math.floor(a),p=rank(g,k,small),q=rank(g,k+1,small);
   for(const key of ['dist','s','nk'])near(entry[key],lerp(p[key],q[key],a-k),1e-9,where+' '+key);
   near(entry.ns*entry.s,entry.nk,1e-9,where+' the name on screen');assert.ok(!('ms' in entry),where+': no count (§K)');
   near(entry.mt,10/entry.s-10,1e-9,where+' 10 px under the box');
   near(Math.abs(entry.x-g.W/2),entry.dist,1e-9,where);near(entry.y+g.bh,170+floorAt(g,entry.dist),1e-9,where+' the feet on the horizon');
   if(index!==cursor)assert.equal(Math.sign(entry.x-g.W/2),Math.sign(index-cursor)*(rtl?-1:1),where+' its side');
  });
 }
});

test('continuousLayout: no jump through whole cursors or between frames; the logo floors and the name shift go linearly too',()=>{
 for(const [label,g,items]of DRAG_CASES)for(const rtl of [false,true]){
  const at=cursor=>selector.continuousLayout({geometry:g,items,cursor,rtl,fitLogo:realFitLogo}),where=`${label} ${rtl?'RTL':'LTR'}`;
  for(let cursor=-1;cursor<=items.length;cursor++){
   const whole=at(cursor);
   for(const side of [-1,1])at(cursor+side*1e-9).items.forEach((entry,index)=>{for(const key of FIELDS)near(entry[key],whole.items[index][key],1e-4,`${where} ${cursor}${side>0?'+':'−'} ${entry.id} ${key}`);});
  }
  // Frame to frame (1/64 of a pitch) no item moves further than the steepest slope allows (x2 − x1: 400 px on phones).
  const slope=Math.max(g.x1,g.x2-g.x1,150);
  for(let cursor=-1;cursor<items.length;cursor+=1/64){const a=at(cursor),b=at(cursor+1/64);a.items.forEach((entry,index)=>assert.ok(Math.abs(b.items[index].x-entry.x)<=slope/64+1e-9,`${where} ${cursor} ${entry.id}`));}
  for(let cursor=0;cursor<items.length-1;cursor++)for(const u of [.25,.5,.75]){
   const from=layoutItems({geometry:g,items,cursorIndex:cursor,rtl,fitLogo:realFitLogo}),to=layoutItems({geometry:g,items,cursorIndex:cursor+1,rtl,fitLogo:realFitLogo});
   at(cursor+u).items.forEach((entry,index)=>{near(entry.lk,lerp(from.items[index].lk,to.items[index].lk,u),1e-9,where+' lk');near(entry.nx,lerp(from.items[index].nx,to.items[index].nx,u),1e-9,where+' nx');});
  }
 }
 // 42 Perpignan (a 3.67 mark) grows from its 28 px floor at ±1 to its own 41.4 px at the cursor, never jumping.
 const [,g,items]=DRAG_CASES[1],height=cursor=>{const entry=selector.continuousLayout({geometry:g,items,cursor,fitLogo:realFitLogo}).items[3];return entry.logo.height*entry.s*entry.lk;};
 near(height(2),28,1e-9);near(height(3),152/3.6711,1e-9);
 for(let cursor=2;cursor<3;cursor+=1/32)assert.ok(height(cursor+1/32)>height(cursor),'it grows as it nears the centre');
});

test('continuousLayout: the looks (data-off, the button width, the scale the strokes follow) are the nearest whole cursor\'s, as the release rounds',()=>{
 const [,g,items]=DRAG_CASES[0];
 for(const cursor of [.2,.49,.5,.51,2.5,2.7,5.9]){
  const nearest=layoutItems({geometry:g,items,cursorIndex:Math.round(cursor)}),drag=selector.continuousLayout({geometry:g,items,cursor});
  assert.deepEqual(drag.items.map(entry=>[entry.off,entry.w0,entry.sr]),nearest.items.map(entry=>[entry.off,entry.w0,entry.s]),String(cursor));
 }
 assert.equal(selector.continuousLayout({geometry:g,items,cursor:.5}).items[1].off,0,'half a pitch: the next item, as Math.round');
 // Past either end no item has the cursor's looks: the ranks go on around a cursor outside the list.
 const before=selector.continuousLayout({geometry:g,items,cursor:-.7});
 assert.deepEqual(before.items.slice(0,3).map(entry=>entry.off),[1,2,'out']);assert.ok(!before.items.some(entry=>entry.off===0));
 assert.deepEqual(selector.continuousLayout({geometry:g,items,cursor:7.6}).items.slice(-3).map(entry=>entry.off),['out','out',-2]);
});

test('continuousLayout: RTL mirrors every position about the centre; ranks, sizes and looks stay logical',()=>{
 for(const [label,g,items]of DRAG_CASES)for(const cursor of [-.4,.3,1.5,2.75,items.length-.2]){
  const ltr=selector.continuousLayout({geometry:g,items,cursor,arabic:false,fitLogo:realFitLogo}),rtl=selector.continuousLayout({geometry:g,items,cursor,rtl:true,arabic:false,fitLogo:realFitLogo});
  rtl.items.forEach((entry,index)=>{const mirror=ltr.items[index];near(entry.x,g.W-mirror.x,1e-9,`${label} ${cursor}`);assert.deepEqual({...entry,x:0},{...mirror,x:0},`${label} ${cursor}`);});
 }
});

test('continuousLayout: phones bring the ±2 in from off screen, campus names stay put, compact rows stay whole',()=>{
 const [,phone,items]=DRAG_CASES[4],halfway=selector.continuousLayout({geometry:phone,items,cursor:1.5});
 // Halfway between the ±1 slot and halo's off-screen ±2 slot (x1 + 400): 200 px further than x1, off screen.
 near(halfway.items[3].dist,phone.x1+200,1e-9);assert.equal(halfway.items[3].visible,false);near(halfway.items[0].dist,phone.x1+200,1e-9);
 assert.deepEqual(halfway.items.map(entry=>entry.visible),[false,true,true,false,false]);
 assert.deepEqual(selector.continuousLayout({geometry:phone,items,cursor:1.95}).items.map(entry=>entry.visible),[false,true,true,true,false],'it shows as it nears its ±1 slot');
 for(const cursor of [.4,1.6])assert.ok(selector.continuousLayout({geometry:DRAG_CASES[5][1],items:printed(),cursor,fitLogo:realFitLogo}).items.every(entry=>entry.nx===0),'campus names sit under their lantern');
 const compact=haloGeometry({W:853,H:175.7,phone:false,campus:false,density:'compact'}),row=five().map((item,index)=>({...item,width:index===1?250:72,height:44}));
 assert.deepEqual(selector.continuousLayout({geometry:compact,items:row,cursor:1.4}),layoutItems({geometry:compact,items:row,cursorIndex:1}),'the compact row moves rigidly');
 assert.deepEqual(selector.continuousLayout({geometry:phone,items:[],cursor:.5}).items,[]);
});

/* ---- One horizon at every level (25 Oct 2026, refinements §I) ---------------------------------------------------- */
// The campus level's own sizes (§3.4), stated again here: square lanterns at most 200 px tall, 86 px under the cursor box
// for the name and the chip.
const within=(value,low,high)=>Math.max(low,Math.min(high,value));
const campusSizes=({W,H,phone})=>{
 const bh=within(H-86-30,84,200),s1=phone?.56:.58,x1=phone?W/2+bh*s1/2-46:Math.max(bh*.5+bh*s1*.5+60,Math.min(W*.23,360));
 return {bh,bw:bh,s1,s2:.42,x1,x2:phone?x1+400:x1+bh*(s1+.42)/2+64,F:within(.11*bh,18,22),below:86};
};
test('haloGeometry: in every band the campus level draws the line of the continents and countries with its own item sizes; its feet stand on that line (layoutItems, continuousLayout)',()=>{
 const widths=[320,360,375,390,412,430,600,699,700,768,853,1024,1280,1366,1440,1920],heights=[...Array.from({length:76},(_,index)=>150+index*7.7),171,177.9,178,204,259.5,293.1,307.5,359.2,377.1,380,395.1,411,420,430,520,535,538.6,600];
 const items=printed();let checked=0;
 for(const W of widths)for(const H of heights)for(const phone of [W<700,W>=700])for(const density of ['normal','short','compact']){
  const g=haloGeometry({W,H,phone,campus:true,density}),line=haloGeometry({W,H,phone,campus:false,density}),where=`${W}×${H} ${phone?'phone':'desktop'} ${density}`;
  assert.deepEqual([g.floor0,g.d1,g.R],[line.floor0,line.d1,line.R],where+': one line (floor0, d1, R)');
  assert.equal(g.campus,true,where);
  if(density==='compact'){assert.equal(g.compact,true,where+': the compact row draws no horizon');continue;}
  const own=campusSizes({W,H,phone});
  for(const [key,value]of Object.entries(own))near(g[key],value,1e-9,where+' '+key);
  near(g.top,g.floor0-g.bh,1e-9,where+': the cursor box ends on the common floor0');assert.ok(g.top>=8,where+': inside the carousel');
  // The line of §U (lowered from the middle of the carousel): the room under it holds the campus name and the fixed
  // « Valider » wherever the middle line left that room; below H = 170 px the middle line (92 px: bh 84 at top 8)
  // stays, as before (reported, nothing shrunk).
  const middle=Math.max(8,(H-line.bh-78)/2-2)+line.bh,need=10+1.12*Math.round(g.F*100)/100+12+36;
  near(g.floor0,lowered(middle,H,Math.round(g.F*100)/100),1e-9,where+': the lowered line');
  if(H-middle>=need)assert.ok(H-g.floor0>=need-1e-9,`${where}: ${H-g.floor0} px under the line`);else assert.equal(g.floor0,middle,where);
  if(phone!==W<700||W%2||Math.round(H*10)%3)continue;
  // Every whole cursor and every fractional one of a drag, past either end too, in both directions.
  for(const rtl of [false,true]){
   for(let cursor=0;cursor<items.length;cursor++){
    const lay=layoutItems({geometry:g,items,cursorIndex:cursor,rtl,fitLogo:realFitLogo});
    lay.items.forEach(entry=>near(entry.y+g.bh,170+floorAt(line,entry.dist),1e-9,`${where} ${cursor} ${entry.id}: on the line`));
    near(lay.items[cursor].y+g.bh,170+line.floor0,1e-9,where+': the cursor on floor0');
   }
   for(let cursor=-1.5;cursor<=items.length+.5;cursor+=1/8)selector.continuousLayout({geometry:g,items,cursor,rtl,fitLogo:realFitLogo}).items
    .forEach(entry=>near(entry.y+g.bh,170+floorAt(line,entry.dist),1e-9,`${where} c=${cursor} ${entry.id}: dragged along the line`));
   checked++;
  }
 }
 assert.ok(checked>100,`${checked} bands laid out`);
 // The measured bands of the request (W × H of the carousel): the line was 29 px higher at L3; it is the same now, and
 // lower since §U: by 40 px, or 23.36 px at 320×380, where the « Valider » then ends on the carousel's bottom edge.
 for(const [W,H,lower]of [[1440,520,40],[1440,600,40],[1280,420,40],[390,430,40],[390,520,40],[320,380,23.36]]){
  const phone=W<700,g=haloGeometry({W,H,phone,campus:true}),line=haloGeometry({W,H,phone});
  near(g.floor0-(Math.max(8,(H-g.bh-86)/2-2)+g.bh),29+lower,1e-9,`${W}×${H}: 29 + ${lower} px lower than the campus level's own line`);
  assert.equal(g.floor0,line.floor0);assert.ok(H-g.floor0>=82.64-1e-9&&H-g.floor0<=176+1e-9,`${W}×${H}: ${H-g.floor0} px under the line`);
 }
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
 // The track: the horizon, the pool, the fixed « Valider » (§P), then the items, which pass over it.
 const track=level.querySelector('.explorer-track');assert.deepEqual(track.children.map(node=>node.getAttribute('class')),['explorer-horizon','explorer-pool','explorer-go','explorer-items']);
 assert.equal(track.children[0].getAttribute('aria-hidden'),'true');assert.equal(track.children[1].getAttribute('aria-hidden'),'true');assert.equal(track.children[2].getAttribute('aria-hidden'),'true');
 assert.deepEqual(h.cards().map(card=>card.dataset.id),['africa','americas','asia','europe']);
 const [afrique,ameriques]=h.cards();
 assert.equal(afrique.getAttribute('aria-label'),'Afrique · 6 campus · 3 pays · 1 sur 4 · Valider');assert.equal(ameriques.getAttribute('aria-label'),'Amériques · 4 campus · 2 pays · 2 sur 4');
 assert.equal(afrique.tabIndex,0);assert.ok(h.cards().slice(1).every(card=>card.tabIndex===-1));assert.equal(afrique.type,'button');
 assert.deepEqual([afrique.localName,afrique.className,afrique.dataset.kind,afrique.dataset.off,'explorerCard' in afrique.dataset],['button','explorer-item','continent','0',true]);
 assert.deepEqual(h.cards().map(card=>card.dataset.off),['0','1','2','out']);
 // Item DOM (§4.2): box (figure: art, name, dots; no glow since 25 Oct 2026), then the chip (no count since §K; shown in
 // the compact row only since §P).
 const [box,go]=afrique.children;
 assert.deepEqual(afrique.children.map(node=>node.className),['explorer-box','explorer-go']);
 assert.equal(box.getAttribute('aria-hidden'),'true');assert.equal(go.getAttribute('aria-hidden'),'true');
 assert.deepEqual(box.children.map(node=>node.className),['explorer-figure']);
 const figure=box.children[0];assert.deepEqual(figure.children.map(node=>node.getAttribute('class')),['hx-art','explorer-name','hx-dots']);
 assert.equal(figure.children[1].dir,'auto');assert.equal(figure.children[1].textContent,'Afrique');
 assert.equal(go.textContent,'Valider');assert.equal(go.children[0].getAttribute('data-icon'),'enter');
 // The pager: the dots, the count and the info button (§H), without Previous / Next (25 Oct 2026).
 assert.deepEqual(level.querySelector('.explorer-pager').children.map(node=>node.className),['explorer-dots','explorer-count','explorer-info']);
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
 assert.equal(keys.textContent,'الأسهم للاختيار · Enter للتأكيد · Esc للرجوع');
 assert.deepEqual(keys.querySelectorAll('kbd').map(kbd=>[kbd.textContent,kbd.lang]),[['الأسهم',''],['Enter','en'],['Esc','en']]);
 assert.equal(level.querySelector('.explorer-hint-touch').textContent,'اسحب للاختيار · المس العنصر في الوسط للتأكيد');
 assert.equal(level.querySelector('.explorer-count').textContent,'1 / 14');
 // Arabic ±2 names take the 14 px floor (no count under the shapes since §K).
 const variables=h.vars(h.card('PRT'));near(Number(variables['--nk']),14/32,1e-4);
 assert.equal(h.vars(h.card('ALB'))['--ms'],undefined);
 assert.equal(level.querySelector('.explorer-info').getAttribute('aria-label'),'مساعدة');
 h.state.locale='en';h.selector.localize();
 assert.equal(level.querySelector('.explorer-info').getAttribute('aria-label'),'Help');
 assert.equal(h.root.children[0].textContent,'Explore');assert.equal(level.querySelector('.explorer-prompt').textContent,'Choose a country · Step 2 of 3');
 assert.equal(h.card('ESP').getAttribute('aria-label'),'إسبانيا · 4 فروع · 1 of 14 · Select');
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

// The row a drag shows (refinements §C), stated from §4.14 and §C: the ranks' distances and scales, linear between them,
// the feet on the horizon; and the transform a drag frame writes inline on an item.
function along(g,c,index,mirror=1){
 const a=Math.abs(index-c),k=Math.floor(a),dist=r=>r===0?0:r===1?g.x1:r===2?g.x2:g.x2+(r-2)*150,scale=r=>r===0?1:r===1?g.s1:r===2?g.s2:g.s2*.8;
 const d=lerp(dist(k),dist(k+1),a-k),s=lerp(scale(k),scale(k+1),a-k);
 return {dist:d,s,x:g.W/2+Math.sign(index-c)*mirror*d,y:170+floorAt(g,d)-g.bh,shown:d-(g.campus?g.bh:g.bw)*s/2<g.W/2};
}
const dragged=button=>{const match=/^translate3d\(calc\((-?[\d.]+)px - 50%\),(-?[\d.]+)px,0\) scale\(([\d.]+)\)$/.exec(button.style.transform??'');return match&&{x:+match[1],y:+match[2],s:+match[3]};};
// The numbers of an inline transform a drag frame writes on an item's name, count or logo.
const numbers=element=>(element.style.transform??'').match(/-?[\d.]+(?=px|\))/g)?.map(Number)??null;
// Every item on screen stands where the drag at the fractional cursor c puts it.
function assertAlong(h,g,c,mirror=1,label=''){
 h.cards().forEach((card,index)=>{
  const expected=along(g,c,index,mirror),at=dragged(card),where=`${label} c=${Math.round(c*1000)/1000} ${card.dataset.id}`;
  if(!expected.shown)return;
  assert.ok(at,where+': no drag transform');near(at.x,expected.x,.006,where+' x');near(at.y,expected.y,.006,where+' y');near(at.s,expected.s,6e-5,where+' scale');
 });
}
const DESKTOP_L12=haloGeometry({W:1440,H:411,phone:false,campus:false,density:'normal'});
// The items whose inline transform a frame wrote since the last call (§C, §L: a frame writes every item at first, then only
// those on screen in this frame or the last).
function writes(h){
 const log=[];
 for(const card of h.cards())card.style.setProperty=(name,value)=>{if(name==='transform')log.push(card.dataset.id);FakeStyle.prototype.setProperty.call(card.style,name,value);};
 return ()=>log.splice(0);
}

test('a drag moves every item along the horizon, once per frame, its looks following the nearest rank, without reading the layout',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();h.doc.runFrames();
 const level=h.current(),carousel=h.carousel(),g=DESKTOP_L12;
 const pool={...level.querySelector('.explorer-pool').style},path=level.querySelector('.explorer-horizon-line').getAttribute('d');
 // A glide along the horizon (§L) that has ended: the drag starts at rest, from the cursor (one still moving is taken
 // over: see « a drag during a glide takes it over »).
 h.selector.setCursor('americas');h.selector.setCursor('africa');assert.equal(level.dataset.sliding,'');h.glide();assert.equal(level.dataset.sliding,undefined);
 let reads=0;const {layout,size}=h.doc;h.doc.layout=element=>{reads++;return layout(element);};h.doc.size=(element,name)=>{reads++;return size(element,name);};
 h.event('pointerdown',h.card('africa'),{clientX:700,clientY:500});h.card('africa').focus();
 h.event('pointermove',h.card('africa'),{clientX:695,clientY:503});assert.equal(carousel.capturedPointer,null,'below the 8 px threshold');assert.equal(h.doc.frames.size,0);
 // Moves are coalesced: three in one frame ask for one frame, which writes the last one.
 for(const x of [690,650,700-g.x1/4])h.event('pointermove',carousel,{clientX:x,clientY:501});
 assert.equal(carousel.capturedPointer,1);assert.equal(level.dataset.dragging,'true');assert.equal(h.doc.frames.size,1,'one frame for three moves');
 assert.ok(h.cards().every(card=>!('gliding' in card.dataset)),'no glide by transitions');assert.ok(h.cards().every(card=>card.style.transform===undefined),'nothing before the frame');
 h.doc.runFrames();
 // A quarter of a pitch (x1 = 331.2 px): every item on the curve at its interpolated distance and scale, and so is the
 // name of the cursor (32 → 16 px on screen; no count under the shapes since §K).
 assertAlong(h,g,.25,1,'a quarter');
 const name=h.card('africa').querySelector('.explorer-name'),s=lerp(1,.58,.25),nk=lerp(1,16/32,.25);
 const [nx,ns]=numbers(name);
 near(ns,nk/s,1e-4,'the name on screen');assert.equal(nx,0);assert.equal(h.card('africa').querySelector('.explorer-meta'),null);
 // The name's halo keeps its 4 px within 10 %: the stroke compensation (a repaint) is written only when it drifts further.
 near(+name.style['--nk'],nk,1e-4,'compensated');
 h.event('pointermove',carousel,{clientX:700-.27*g.x1,clientY:501});h.doc.runFrames();near(+name.style['--nk'],nk,1e-4,'2 % further: kept');
 h.event('pointermove',carousel,{clientX:700-.45*g.x1,clientY:501});h.doc.runFrames();near(+name.style['--nk'],lerp(1,.5,.45),1e-4,'12 % further: written');
 // The looks are the nearest rank's; the cursor itself (tabindex, accessible name, focus) changes only at the release.
 assert.deepEqual(h.cards().map(card=>card.dataset.off),['0','1','2','out']);
 h.event('pointermove',carousel,{clientX:700-.6*g.x1,clientY:502});h.doc.runFrames();
 assertAlong(h,g,.6,1,'past half a pitch');
 assert.deepEqual(h.cards().map(card=>card.dataset.off),['-1','0','1','2'],'the nearest rank\'s looks');
 assert.deepEqual(h.cards().map(card=>card.style['--s']),['0.58','1','0.58','0.42'],'and its strokes\' scale');assert.equal(h.card('americas').style['--w0'],'340px','and its button');
 assert.equal(h.card('africa').tabIndex,0);assert.match(h.card('africa').getAttribute('aria-label'),/ · Valider$/);assert.equal(h.doc.activeElement,h.card('africa'));
 // The pool, the horizon and the items layer stay still.
 assert.deepEqual({...level.querySelector('.explorer-pool').style},pool);assert.equal(level.querySelector('.explorer-horizon-line').getAttribute('d'),path);assert.equal(h.layer().style.transform,undefined);
 // The release: the nearest item, round(0.6) = 1 step (focus follows); the row glides on along the horizon from where it
 // stands (§L). Chrome flushes styles when the focused item's tabindex changes and on focus(): there the items must still
 // stand where the drag left them, with their fades.
 const flushes=[],snapshot=()=>({inline:h.cards().every(card=>Boolean(card.style.transform)),dragging:level.dataset.dragging});
 const attrs=h.card('africa').attrs,setAttribute=attrs.set.bind(attrs);attrs.set=(key,value)=>{if(key==='tabindex')flushes.push(snapshot());return setAttribute(key,value);};
 const focus=h.card('americas').focus.bind(h.card('americas'));h.card('americas').focus=options=>{flushes.push(snapshot());focus(options);};
 h.event('pointerup',carousel,{clientX:700-.6*g.x1,clientY:502});
 assert.deepEqual(flushes,[{inline:true,dragging:'true'},{inline:true,dragging:'true'}],'the drag\'s own styles go last');
 assert.equal(h.cursor(),'americas');assert.equal(h.doc.activeElement,h.card('americas'),'focus follows a focused item');assert.equal(level.dataset.dragging,undefined);
 assert.equal(level.dataset.sliding,'','the glide takes the drag\'s styles and fades over');assert.ok(h.cards().every(card=>!('gliding' in card.dataset)));
 h.doc.runFrames();assertAlong(h,g,.6,1,'its first frame: where the drag left the row');
 assert.equal(reads,0,'no layout read from the press to the glide');
 h.doc.layout=layout;h.doc.size=size;
 const click=h.event('click',h.card('americas'),{detail:1});assert.equal(click.defaultPrevented,true,'the click after a drag is swallowed');assert.equal(h.calls.validate.length,0);
 h.glide();
 assert.ok(h.cards().every(card=>[card,...card.querySelectorAll('.explorer-name')].every(node=>node.style.transform===undefined)&&card.querySelector('.explorer-name').style['--nk']===undefined),'its own styles go at its end');
 assert.equal(Number.parseFloat(h.card('americas').style['--x']),720);assert.equal(h.card('americas').style['--s'],'1');assert.equal(level.dataset.sliding,undefined);
});

test('a short drag glides back, one past either end follows the curve and glides back; the click after a drag is swallowed, not the keyboard\'s',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();h.doc.runFrames();
 const carousel=h.carousel(),g=DESKTOP_L12;
 // A third of a pitch: the cursor stays and the row glides home; its click is swallowed, even on the cursor.
 h.event('pointerdown',h.card('africa'),{clientX:700});h.event('pointermove',carousel,{clientX:700-g.x1/3});h.doc.runFrames();
 assertAlong(h,g,1/3,1,'a third');
 h.event('pointerup',carousel,{clientX:700-g.x1/3});
 assert.equal(h.cursor(),'africa');assert.equal(h.current().dataset.sliding,'','the row glides home along the horizon (§L)');h.doc.runFrames();assertAlong(h,g,1/3,1,'from where the drag left it');
 h.event('click',h.card('africa'),{detail:1});assert.equal(h.calls.validate.length,0,'even on the cursor');
 // Keyboard and assistive-technology clicks are not swallowed.
 h.event('pointerdown',h.card('africa'),{clientX:700});h.event('pointermove',carousel,{clientX:730});h.event('pointerup',carousel,{clientX:730});
 h.card('africa').click();assert.deepEqual(h.calls.validate,[{kind:'continent',id:'africa'}]);
 await h.later(600);
 // Before the first item (1.4 pitches to the right): the row keeps to the curve and no item has the cursor's looks; the
 // release, clamped to the list, glides back.
 h.event('pointerdown',h.card('africa'),{clientX:300});h.event('pointermove',carousel,{clientX:300+1.4*g.x1});h.doc.runFrames();
 assertAlong(h,g,-1.4,1,'before the first');assert.deepEqual(h.cards().map(card=>card.dataset.off),['1','2','out','out']);
 h.event('pointerup',carousel,{clientX:300+1.4*g.x1});
 assert.equal(h.cursor(),'africa');h.glide();assert.equal(h.card('africa').dataset.off,'0');assert.equal(Number.parseFloat(h.card('africa').style['--x']),720,'back');
 // After the last one, from Europe (2.3 pitches to the left).
 await h.later(600);h.selector.setCursor('europe',{animate:false});
 h.event('pointerdown',h.card('europe'),{clientX:1000});h.event('pointermove',carousel,{clientX:1000-2.3*g.x1});h.doc.runFrames();
 assertAlong(h,g,5.3,1,'after the last');assert.deepEqual(h.cards().map(card=>card.dataset.off),['out','out','out','-2']);
 h.event('pointerup',carousel,{clientX:1000-2.3*g.x1});assert.equal(h.cursor(),'europe');h.glide();assert.equal(Number.parseFloat(h.card('europe').style['--x']),720);
});

test('a vertical pan is left to the browser; a cancelled or lost drag glides back from where it stood; touch keeps its drag when the item loses the capture',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();h.doc.runFrames();
 const carousel=h.carousel(),g=DESKTOP_L12,untouched=()=>h.cards().every(card=>card.style.transform===undefined);
 h.event('pointerdown',h.card('africa'),{clientX:700,clientY:500});h.event('pointermove',h.card('africa'),{clientX:702,clientY:530});h.event('pointermove',h.card('africa'),{clientX:600,clientY:530});
 assert.equal(carousel.capturedPointer,null);assert.equal(h.doc.frames.size,0);assert.ok(untouched(),'a vertical pan moves nothing');
 h.event('pointerdown',h.card('africa'),{clientX:700});h.event('pointermove',h.card('africa'),{clientX:520});h.doc.runFrames();
 assertAlong(h,g,180/g.x1,1,'cancelled');assert.equal(h.card('americas').dataset.off,'0');
 h.event('pointercancel',carousel,{clientX:520});
 assert.equal(h.cursor(),'africa');assert.equal(h.current().dataset.dragging,undefined);assert.equal(h.current().dataset.sliding,'','it glides back (§L)');
 h.doc.runFrames();assertAlong(h,g,180/g.x1,1,'from where it stood');h.glide();assert.ok(untouched());assert.deepEqual(h.cards().map(card=>card.dataset.off),['0','1','2','out']);
 // The carousel losing its capture ends a drag the same way; a frame asked before the end writes nothing after it.
 h.event('pointerdown',h.card('africa'),{clientX:700});h.event('pointermove',carousel,{clientX:600});assert.equal(h.doc.frames.size,1);
 h.event('lostpointercapture',carousel,{});h.doc.runFrames();assert.ok(untouched(),'the pending frame is dropped');assert.equal(h.cursor(),'africa');
 // Touch: the pressed item held the implicit capture; losing it to the carousel does not end the drag.
 h.event('pointerdown',h.card('africa'),{clientX:700,pointerType:'touch'});h.event('pointermove',h.card('africa'),{clientX:690,pointerType:'touch'});
 h.event('lostpointercapture',h.card('africa'),{pointerType:'touch'});
 h.event('pointermove',carousel,{clientX:700-2.1*g.x1,pointerType:'touch'});h.doc.runFrames();assertAlong(h,g,2.1,1,'touch');
 h.event('pointerup',carousel,{clientX:700-2.1*g.x1,pointerType:'touch'});h.event('lostpointercapture',carousel,{pointerType:'touch'});
 assert.equal(h.cursor(),'asia');h.glide();assert.equal(Number.parseFloat(h.card('asia').style['--x']),720);assert.ok(untouched());
});

test('dragging in RTL brings the next item from the left as the finger moves right, every item on the mirrored curve',async()=>{
 const h=harness({dir:'rtl',locale:'ar'});h.selector.show(L1_AR);await h.later();h.doc.runFrames();
 const carousel=h.carousel(),g=DESKTOP_L12;
 assert.equal(Number.parseFloat(h.card('africa').style['--x']),720-331.2,'the next item stands on the left');
 h.event('pointerdown',h.card('asia'),{clientX:700});h.event('pointermove',carousel,{clientX:720});h.event('pointermove',carousel,{clientX:700+.6*g.x1});h.doc.runFrames();
 assertAlong(h,g,.6,-1,'RTL');
 assert.ok(dragged(h.card('africa')).x<720&&dragged(h.card('asia')).x>720,'the next item comes in from the left, the cursor leaves to the right');
 assert.deepEqual(h.cards().map(card=>card.dataset.off),['-1','0','1','2']);
 h.event('pointerup',carousel,{clientX:700+.6*g.x1});
 assert.equal(h.cursor(),'africa');h.glide();assert.equal(Number.parseFloat(h.card('africa').style['--x']),720);
});

test('phones and campuses: logos, campus names and the phone looks follow the same drag; items off screen are left alone',async()=>{
 const h=harness({screen:PHONE});h.selector.show(l3France('nice'));await h.later();h.doc.runFrames();
 const carousel=h.carousel(),g=haloGeometry({W:390,H:377.1,phone:true,campus:true,density:'normal'});
 const ranks=cursor=>layoutItems({geometry:g,items:FRENCH_CAMPUSES.map(([id])=>({id,kind:'campus',print:PRINTS[id]||null})),cursorIndex:cursor,fitLogo:realFitLogo});
 // 42 Nice is the sixth campus: 1.3 pitches to the left, c = 6.3.
 h.event('pointerdown',h.card('nice'),{clientX:200,pointerType:'touch'});h.event('pointermove',carousel,{clientX:200-1.3*g.x1,pointerType:'touch'});h.doc.runFrames();
 assertAlong(h,g,6.3,1,'phone L3');
 assert.deepEqual(['nice','paris','perpignan'].map(id=>h.card(id).dataset.off),['-1','0','1'],'on phones the neighbours\' names hide by their looks');
 // 42 Perpignan (a 3.67 mark), 0.7 from the centre: its logo floor between its two whole values; its name below the lantern.
 const perpignan=h.card('perpignan'),s=lerp(1,.56,.7),nk=lerp(1,16/22,.7);
 near(numbers(perpignan.querySelector('.hx-logo'))[0],lerp(ranks(6).items[7].lk,ranks(7).items[7].lk,.3),1e-4,'lk');assert.ok(ranks(6).items[7].lk>1,'the floor acts at ±1');
 const [mt,ns]=numbers(perpignan.querySelector('.explorer-name'));near(ns,nk/s,1e-4);near(mt,10/s-10,.006);
 // 42 Angoulême waits off screen: written by the first frame only.
 const far=h.card('angouleme').style.transform;assert.ok(far);
 h.event('pointermove',carousel,{clientX:200-1.4*g.x1,pointerType:'touch'});h.doc.runFrames();assertAlong(h,g,6.4,1,'phone L3');
 assert.equal(h.card('angouleme').style.transform,far,'left alone off screen');
 h.event('pointerup',carousel,{clientX:200-1.4*g.x1,pointerType:'touch'});
 assert.equal(h.cursor(),'paris');h.glide();assert.ok(h.cards().every(card=>[card,...card.querySelectorAll('.explorer-name,.hx-logo')].every(node=>node.style.transform===undefined)));
});

test('compact row: a drag still moves the whole row rigidly, then folds it and glides (unchanged)',async()=>{
 const h=harness({screen:LANDSCAPE});h.selector.show(L2_EUROPE_FR);h.selector.setCursor('FRA',{animate:false});await h.later();h.doc.runFrames();
 const carousel=h.carousel(),layer=h.layer(),x=id=>Number.parseFloat(h.card(id).style['--x']);
 h.event('pointerdown',h.card('FRA'),{clientX:300});h.event('pointermove',carousel,{clientX:290});
 assert.equal(layer.style.transform,'translateX(-10px)','the layer follows at once');assert.equal(h.doc.frames.size,0,'no frame is asked');
 h.event('pointermove',carousel,{clientX:150});assert.equal(layer.style.transform,'translateX(-150px)');
 assert.ok(h.cards().every(card=>card.style.transform===undefined));assert.equal(x('FRA'),333.5,'the items stay, their layer moves');assert.equal(h.card('FRA').dataset.off,'0');
 h.event('pointerup',carousel,{clientX:150});
 // The compact pitch is the measured distance to the next item (187 px): round(150 / 187) = 1 step.
 assert.equal(h.cursor(),'ITA');assert.equal(layer.style.transform,undefined,'the layer is reset');assert.equal(x('ITA'),333.5);assert.equal(h.card('ITA').dataset.gliding,'','a plain glide');
});

test('reduced motion: a drag still follows the pointer along the curve; the release jumps',async()=>{
 const h=harness({reduced:true});h.selector.show(L1_FR);await h.later();h.doc.runFrames();
 const carousel=h.carousel(),g=DESKTOP_L12;
 h.event('pointerdown',h.card('africa'),{clientX:700});h.event('pointermove',carousel,{clientX:450});h.doc.runFrames();
 assertAlong(h,g,250/g.x1,1,'reduced');
 h.event('pointerup',carousel,{clientX:450});
 assert.equal(h.cursor(),'americas');assert.ok(h.cards().every(card=>!('gliding' in card.dataset)&&card.style.transform===undefined),'no glide');
 assert.equal(Number.parseFloat(h.card('americas').style['--x']),720);assert.equal(h.doc.animations.length,0);
});

// No Previous / Next (25 Oct 2026): the arrows, Home / End, drag and swipe, the wheel and a click on a neighbour move the
// cursor; the pager keeps the dots and the count.
test('no Previous / Next: no nav button, label, disabled state or chevron at any level, size or language',()=>{
 for(const [screen,view,locale,dir]of [[DESKTOP,L1_FR,'fr','ltr'],[PHONE,L2_EUROPE_AR,'ar','rtl'],[SMALL,l3France('paris'),'en','ltr'],[LANDSCAPE,L2_EUROPE_FR,'fr','ltr']]){
  const h=harness({screen,locale,dir});h.selector.show(view,{focus:true});
  const level=h.current(),label=`${screen.W} ${view.key} ${locale}`;
  assert.equal(level.querySelectorAll('.explorer-nav').length,0,label);
  assert.deepEqual(level.querySelector('.explorer-pager').children.map(node=>node.className),['explorer-dots','explorer-count','explorer-info'],label);
  assert.deepEqual(level.querySelectorAll('button').filter(node=>!('explorerCard' in node.dataset)),[level.querySelector('.explorer-info')],label+': besides the items, the info button only (§H)');
  assert.equal(level.querySelectorAll('[aria-disabled]').length,0,label);
  assert.doesNotMatch(level.querySelectorAll('[aria-label]').map(node=>node.getAttribute('aria-label')).join(' | '),/Précédent|Suivant|Previous|Next|السابق|التالي/,label);
  assert.deepEqual(h.art.calls.icons.filter(name=>name==='prev'||name==='next'),[],label+': no chevron is drawn');
 }
});

test('a click or a tap on a visible neighbour moves the cursor at every size and density (WCAG 2.5.7)',async()=>{
 for(const [label,screen,view,neighbour]of [['1440 L1',DESKTOP,L1_FR,'americas'],['1440 L3, ±2',DESKTOP,l3France('lyon'),'angouleme'],['390 L2',PHONE,L2_EUROPE_FR,'DEU'],['390 L3',PHONE,l3France('paris'),'nice'],
  ['320 L1',SMALL,L1_FR,'americas'],['320 L3',SMALL,l3France('lyon'),'le-havre'],['667×375 compact',LANDSCAPE,L2_EUROPE_FR,'DEU'],['667×375 compact L3',LANDSCAPE,l3France('lyon'),'marseille']]){
  const h=harness({screen});h.selector.show(view);await h.later();
  const card=h.card(neighbour);assert.ok(!['0','out'].includes(card.dataset.off),label+' '+card.dataset.off);
  h.tap(card);
  assert.equal(h.cursor(),neighbour,label);assert.equal(h.doc.activeElement,card,label);assert.equal(h.calls.validate.length,0,label+': positioned, not validated');
 }
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
 const other=h.current().querySelector('.explorer-count');
 assert.equal(h.key('ArrowRight',{},other).defaultPrevented,false);assert.equal(h.key('End',{},h.root).defaultPrevented,false);assert.equal(h.cursor(),'angouleme');
 assert.equal(h.key('Enter',{repeat:true},other).defaultPrevented,false);
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
 const other=h.current().querySelector('.explorer-count');
 assert.equal(h.key('Backspace',{},other).defaultPrevented,true);assert.equal(h.calls.ascend,2);
 assert.equal(h.key('Backspace',{repeat:true},other).defaultPrevented,true);assert.equal(h.calls.ascend,2);
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
 assert.equal(h.selector.setCursor('asia'),true);assert.equal(h.cursor(),'asia');assert.equal(h.current().dataset.sliding,'','it glides by default (along the horizon, §L)');
 assert.equal(h.selector.setCursor('asia'),true,'already there');assert.equal(h.selector.setCursor('nowhere'),false);assert.equal(h.cursor(),'asia');
 assert.equal(h.selector.setCursor('africa',{animate:false}),true);assert.equal(h.cursor(),'africa');assert.equal(h.card('africa').dataset.gliding,undefined);
 assert.equal(h.current().dataset.sliding,undefined,'a jump ends the glide');assert.equal(h.card('africa').dataset.off,'0');assert.equal(Number.parseFloat(h.card('africa').style['--x']),720);
 assert.equal(h.doc.activeElement,h.doc.body,'focus only when asked');h.selector.setCursor('americas',{focus:true});assert.equal(h.doc.activeElement,h.card('americas'));
 assert.deepEqual(h.calls.announce,[]);
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
 // From level to level the levels themselves never move (refinements §D): their items leave and come as the levels did.
 const on=element=>h.doc.animations.filter(animation=>animation.element===element);
 assert.deepEqual([...on(first),...on(h.current())],[],'neither level moves as a whole');
 const [exit]=on(first.querySelector('.explorer-items')),[enter]=on(h.current().querySelector('.explorer-items'));
 assert.deepEqual(exit.keyframes,[{opacity:1,translate:'0 0',scale:'1'},{opacity:0,translate:'0 -18px',scale:'1.03'}]);
 assert.deepEqual([exit.options.duration,exit.options.easing,exit.options.fill],[260,'cubic-bezier(.22,1,.36,1)','forwards']);
 assert.deepEqual(enter.keyframes,[{opacity:0,translate:'0 22px'},{opacity:1,translate:'0 0'}]);
 assert.deepEqual([enter.options.duration,enter.options.delay,enter.options.fill],[420,80,'backwards']);
 // Pointer clicks on the outgoing level are ignored, whatever the delay.
 await h.later();const stale=first.querySelector('[data-explorer-card]');
 assert.equal(h.event('click',stale,{detail:1}).defaultPrevented,true);stale.click();assert.equal(h.calls.validate.length,0);
 await h.finish();assert.equal(h.screens().length,1);assert.equal(first.parentNode,null);
 // Ascending reverses the motion; a new view finishes the running transition at once.
 h.selector.show(L1_FR,{direction:'ascend',focus:true});const second=h.screens()[0],running=h.doc.animations.length;
 assert.deepEqual(on(second.querySelector('.explorer-items')).at(-1).keyframes[1],{opacity:0,translate:'0 18px',scale:'.97'});
 assert.deepEqual(on(h.current().querySelector('.explorer-items')).at(-1).keyframes[0],{opacity:0,translate:'0 -22px'});
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(second.parentNode,null);assert.equal(h.screens().length,2);
 assert.ok(h.doc.animations.slice(0,running).every(animation=>animation.playState!=='running'));
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
 h.selector.setCursor('ITA');h.glide();
 const after=snapshot(france);
 const changedAttrs=Object.keys({...before.attrs,...after.attrs}).filter(name=>before.attrs[name]!==after.attrs[name]);
 const changedVars=Object.keys({...before.vars,...after.vars}).filter(name=>before.vars[name]!==after.vars[name]);
 assert.deepEqual(changedAttrs.filter(name=>name!=='data-gliding').sort(),['aria-label','data-off','tabindex']);
 assert.ok(changedVars.every(name=>['--x','--y','--s','--w0','--nk','--ns','--ms','--mt','--lk','--nx'].includes(name)),changedVars.join());
 assert.deepEqual(h.vars(h.layer()),layer,'level-wide sizes do not change on a cursor move');
 assert.equal(before.vars['--fw'],after.vars['--fw']);assert.equal(before.vars['--lx'],after.vars['--lx']);
 // The level-wide variables (§4.2).
 assert.deepEqual([layer['--h0'],layer['--F'],layer['--nmax']],['250px','32px',undefined]);
 assert.deepEqual([france.style['--lx'],france.style['--ly']],['45%',`${Math.round(45/85*100*1000)/1000}%`],'(label − vb) / vb · 100 %');
});

test('the instant protocol: data-instant, a style flush, removal on the next frame; resizes re-lay out at once',()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR);
 const level=h.current();
 assert.equal(level.dataset.instant,'','data-instant at insertion');assert.ok(h.doc.flushes>=1,'the flush read');
 assert.equal(level.dataset.density,'normal');assert.equal(level.dataset.phone,undefined);
 h.doc.runFrames();assert.equal(level.dataset.instant,undefined,'removed after a frame');
 // A cursor move glides along the horizon (§L): no item transitions; its frames write the items inline, every item at the
 // first frame, then those on screen in that frame or the one before: at most 7 at 1440, the ranks on screen and the
 // « out » item fading on screen at either end.
 h.selector.setCursor('ITA',{animate:false});h.selector.setCursor('LUX');
 const gliding=()=>h.cards().filter(card=>'gliding' in card.dataset).map(card=>card.dataset.id),written=writes(h),start=h.doc.now();
 assert.equal(level.dataset.sliding,'');assert.deepEqual(gliding(),[]);assert.deepEqual(written(),[],'nothing before the first frame');
 const glide=selector.glideTo(null,{from:6,to:7,at:start}),shown=time=>h.cards().map((card,index)=>along(DESKTOP_L12,selector.glideAt(glide,time).cursor,index).shown);
 h.frame();assert.equal(written().length,14,'the first frame writes every item');
 for(let frame=2;frame<=12;frame++){
  const before=shown(h.doc.now());h.frame();const now=shown(h.doc.now()),ids=written();
  assert.deepEqual(ids,h.cards().filter((card,index)=>before[index]||now[index]).map(card=>card.dataset.id),'frame '+frame);assert.ok(ids.length<=7,'frame '+frame);
 }
 // The ResizeObserver re-lays the level out instantly, which ends the glide where it is.
 assert.ok(h.doc.observers.some(observer=>observer.targets.has(h.carousel())&&observer.targets.has(h.root)));
 h.doc.resize({H:300});
 assert.equal(level.dataset.instant,'');assert.equal(level.dataset.sliding,undefined);assert.ok(h.cards().every(card=>card.style.transform===undefined),'the items back to their variables');
 assert.equal(h.vars(h.layer())['--h0'],`${Math.round((300-78-30)*100)/100}px`,'the new carousel height');assert.equal(Number.parseFloat(h.card('LUX').style['--x']),720);
 h.frame();assert.deepEqual(written(),[],'no frame of the glide after it');
 // A resize that changes nothing does not re-lay out.
 const flushes=h.doc.flushes;h.doc.resize({});assert.equal(h.doc.flushes,flushes);assert.equal(level.dataset.instant,undefined);
 // The compact row glides by its transitions (§3.5, unchanged): its glide ends on the item's own transform transition,
 // or after 560 ms.
 const c=harness({screen:LANDSCAPE});c.selector.show(L2_EUROPE_FR);c.doc.runFrames();
 const compact=()=>c.cards().filter(card=>'gliding' in card.dataset);c.selector.setCursor('NLD');const card=compact()[0];
 assert.ok(card);assert.equal(c.current().dataset.sliding,undefined);
 c.event('transitionend',card.querySelector('.explorer-name'),{propertyName:'transform'});assert.ok('gliding' in card.dataset,'a sub-element ends nothing');
 c.event('transitionend',card,{propertyName:'opacity'});assert.ok('gliding' in card.dataset);
 c.event('transitionend',card,{propertyName:'transform'});assert.equal(card.dataset.gliding,undefined);
 return c.later(560).then(()=>assert.deepEqual(compact(),[]));
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
 h.selector.setCursor('americas');assert.equal(dots.style['--dot'],'1');assert.deepEqual(dots.children.map(dot=>'current' in dot.dataset),[false,true,false,false]);
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

test('phones: the hidden ±2 wait off screen, a glide writes at most 4 items a frame after its first, names of neighbours are hidden by CSS',async()=>{
 const h=harness({screen:PHONE});h.selector.show(L2_EUROPE_FR);h.selector.setCursor('FRA',{animate:false});
 const level=h.current();assert.equal(level.dataset.phone,'');assert.equal(level.dataset.density,'normal');
 assert.equal(h.current().querySelector('.explorer-track').style['--fade'],'58.2px');assert.equal(h.vars(h.layer())['--nmax'],'265.6px');
 assert.equal(h.card('ITA').dataset.off,'1');assert.equal(h.card('LUX').dataset.off,'2');near(Number.parseFloat(h.card('LUX').style['--x']),195+218.9+400,.05);
 assert.equal(h.current().querySelector('.explorer-dots').dataset.dense,'','14 dots are dense at 390');
 // The glide along the horizon (§L): after its first frame only what is on screen. Spain, at the edge, leaves it within
 // that frame for its −2 slot 400 px further; Luxembourg comes in from there.
 const written=writes(h);h.selector.setCursor('ITA');h.frame();assert.equal(written().length,14);
 const seen=new Set();
 for(let frame=0;frame<30;frame++){h.frame();const ids=written();ids.forEach(id=>seen.add(id));assert.ok(ids.length<=4,ids.join());}
 assert.deepEqual([...seen],['FRA','ITA','LUX']);assert.equal(level.dataset.sliding,'','its fades still end');
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8');
 assert.match(css,/\.explorer-level\[data-phone\] \.explorer-item:not\(\[data-off="0"\]\) \.explorer-name\{opacity:0\}/);
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
 assert.equal(bare.card('europe').querySelector('.explorer-go').children.length,1,'no icon without art: the label only');
 assert.equal(bare.card('europe').querySelector('.explorer-go').textContent,'Valider');
 const art=fakeArt({shapes:null}),h=harness({art});h.selector.show(L1_FR);
 assert.equal(h.card('europe').querySelector('.hx-art'),null);assert.equal(art.calls.silhouettes.length,0);
 art.shapes={...SHAPES,continents:{europe:SHAPES.continents.europe}};h.selector.localize();
 assert.ok(h.card('europe').querySelector('.hx-art'));assert.equal(h.card('asia').querySelector('.hx-art'),null,'a shape missing for one item: that item stays name-only');
 assert.equal(h.card('europe').style['--fw'],'312.5px','its own ratio now');
 const figureChildren=h.card('europe').querySelector('.explorer-figure').children.map(node=>node.getAttribute('class'));
 assert.deepEqual(figureChildren,['hx-art','explorer-name','hx-dots'],'siblings: the stylesheet stacks the name above the dots (§J)');
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
 h.selector.setCursor('DEU');assert.equal(h.art.calls.silhouettes.length,2*count,'a cursor move never rebuilds an SVG');
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

test('a one-item level and its campus: keys and wheel inert, back pill without strip',async()=>{
 const h=harness();h.selector.show(L3_ALBANIA,{focus:true});await h.later();
 assert.deepEqual(h.cards().map(card=>card.dataset.id),['tirana']);assert.equal(h.cursor(),'tirana');
 assert.equal(h.current().querySelector('.explorer-count').textContent,'1 / 1');assert.equal(h.card('tirana').getAttribute('aria-label'),'42 Tirana · Albanie · 1 sur 1 · Valider');
 for(const key of ['ArrowRight','ArrowLeft','Home','End'])h.key(key);
 h.wheel({deltaY:120});assert.equal(h.cursor(),'tirana');assert.equal(h.calls.announce.length,0);
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
 h.selector.setCursor('americas');h.key('ArrowRight',{},h.card('americas'));h.wheel({deltaY:80});
 assert.ok(h.cards().every(card=>!('gliding' in card.dataset)&&card.style.transform===undefined),'no glide');assert.equal(h.current().dataset.sliding,undefined);
 h.selector.show(l3France('paris'),{direction:'descend'});h.selector.show(campusView('paris'),{direction:'descend'});h.selector.show(l3France('paris'),{direction:'ascend'});
 assert.equal(h.doc.animations.length,0);assert.equal(h.screens().length,1,'outgoing views are removed at once');
 const m=harness();m.selector.show(L1_FR);m.selector.setCursor('americas');assert.equal(m.doc.animations.length,0,'glides run frame by frame (§L)');
 assert.equal(m.current().dataset.sliding,'');
 m.selector.show(L2_EUROPE_FR,{direction:'descend'});assert.equal(m.screens().length,2);assert.ok(m.doc.animations.length>2,'the parts that change (§D)');
 m.selector.setCursor('DEU');m.frame();assert.equal(m.current().dataset.sliding,'');assert.ok(m.cards().some(card=>card.style.transform));
 m.media.set(true);
 assert.ok(m.doc.animations.every(animation=>animation.playState==='idle'));assert.equal(m.screens().length,1);
 assert.ok(m.cards().every(card=>!('gliding' in card.dataset)&&card.style.transform===undefined),'a running glide jumps to its end');
 assert.equal(m.current().dataset.sliding,undefined);assert.equal(Number.parseFloat(m.card('DEU').style['--x']),720);assert.equal(m.centre(),'DEU');
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
test('stylesheet: the focus cue of decision A, no [data-band] and no colour literal',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8');
 const block=css.slice(css.indexOf('/* Focus cue: user decision A (24 Oct 2026) */'));
 assert.ok(css.includes('/* Focus cue: user decision A (24 Oct 2026) */'));
 assert.ok(block.startsWith('/* Focus cue: user decision A (24 Oct 2026) */\n:root #explorer .explorer-item:focus{outline:none}\n:root #explorer .explorer-item:focus-visible > .explorer-go{outline:var(--hx-focus-ring-width) solid var(--hx-focus);outline-offset:var(--hx-focus-ring-offset)}\n@media (forced-colors: active){:root #explorer .explorer-item:focus-visible > .explorer-go{outline-color:Highlight}}'));
 const rules=[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 const itemOutlines=rules.filter(rule=>/explorer-item/.test(rule.selector)&&/outline/.test(rule.body));
 // Since §P the ring goes to the fixed « Valider » button while an item (the cursor) has the keyboard focus.
 const fixedRing=':root #explorer .explorer-track>.explorer-go:has(+.explorer-items>.explorer-item:focus-visible)';
 assert.deepEqual(itemOutlines.map(rule=>rule.selector),[':root #explorer .explorer-item:focus',':root #explorer .explorer-item:focus-visible > .explorer-go',':root #explorer .explorer-item:focus-visible > .explorer-go',fixedRing,fixedRing],'no other outline on items');
 // No block on items (H1, D3): the button has no background, border, radius or shadow, in any state.
 const item=rules.find(rule=>rule.selector===':root #explorer .explorer-item');
 for(const declaration of ['background:none','border:0','border-radius:0','box-shadow:none'])assert.ok(item.body.includes(declaration),declaration);
 const self=rules.filter(rule=>rule.selector.split(',').some(part=>/\.explorer-item(\[[^\]]*\]|:[\w-]+(\([^)]*\))?)*\s*$/.test(part.trim())));
 assert.ok(self.every(rule=>!/(^|;)\s*(background|border|border-radius|box-shadow|outline)\s*:/.test(rule.body)||rule===item||/:focus$/.test(rule.selector)),self.map(rule=>rule.selector).join(' | '));
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
 // Transitions are scoped to glides (the compact row's, §4.15, and those along the horizon, §L) and drags (§C); instant
 // layouts switch them off.
 assert.match(css,/\.explorer-item\[data-gliding\]\{transition:transform \.5s var\(--ease\),opacity \.35s;will-change:transform\}/);
 assert.match(css,/\.explorer-level\[data-instant\] :is\(\.explorer-item,\.explorer-item \*,\.explorer-pool,\.explorer-dots>i\)/);
 assert.ok(rules.filter(rule=>/explorer-item/.test(rule.selector)&&/transition/.test(rule.body)&&!/prefers-reduced/.test(rule.selector)).every(rule=>/data-gliding|data-sliding|data-dragging|data-instant|explorer-item,\.explorer-item \*/.test(rule.selector)),'no transition outside a glide or a drag');
});

test('stylesheet: a drag transitions no transform, its looks keep the glides\' fades (names too); only the compact row\'s layer moves',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8'),code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 const drag=':root #explorer .explorer-level[data-dragging]:not([data-density=compact]) .explorer-item';
 // No chip fades since the fixed « Valider » (§P).
 for(const rule of [drag+'{transition:opacity .35s}',drag+' .explorer-name{transition:opacity .3s}',drag+' .hx-dots{transition:opacity .35s}'])assert.ok(code.includes(rule),rule);
 assert.doesNotMatch(code,/data-dragging[^{}]*explorer-go/);
 // What follows the pointer never transitions, and nothing a drag moves gets will-change (the art stays crisp as it grows).
 for(const [,selector,body]of code.matchAll(/([^{}]+)\{([^{}]*)\}/g))if(/data-dragging/.test(selector)&&/explorer-item\b/.test(selector)){
  if(!/explorer-go/.test(selector))assert.doesNotMatch(body,/transform \./,selector);assert.doesNotMatch(body,/will-change/,selector);
 }
 // The glide after a drag runs along the horizon (§L): no rule of its own any more.
 assert.doesNotMatch(code,/data-gliding=drag/);
 assert.match(code,/:root #explorer \.explorer-level\[data-density=compact\]\[data-dragging\] \.explorer-items\{will-change:transform\}/,'the compact row\'s layer');
 assert.doesNotMatch(code,/:root #explorer \.explorer-level\[data-dragging\] \.explorer-items/,'no other drag moves the layer');
 // Reduced motion switches every transition off, a drag's included.
 assert.match(code,/@media\(prefers-reduced-motion:reduce\)\{\s*:root #explorer :is\(\.explorer-item,\.explorer-item \*,/);
});

test('a drag writes inline the very transforms the stylesheet builds from the rank variables (item, name, campus name, logo)',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8'),code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 const template=pattern=>{const match=pattern.exec(code);assert.ok(match,String(pattern));return match[1];};
 // A template's shape: each var() stands for a number, in px or not.
 const shape=source=>new RegExp('^'+source.replace(/var\(--[\w-]+(?:, ?[^()]*)?\)/g,'§').replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/§/g,'-?[\\d.]+(?:px)?')+'$');
 const item=shape(template(/:root #explorer \.explorer-item\{[^}]*?transform:([^;]+);/)),name=shape(template(/\.explorer-item:not\(\[data-kind=campus\]\) \.explorer-name\{[^}]*?transform:([^;]+);/));
 const campusName=shape(template(/\.explorer-item\[data-kind=campus\] \.explorer-name\{[^}]*?transform:([^;]+);/));
 const logo=shape(template(/\.explorer-lantern>\.hx-logo\{transform:([^;}]+)\}/));
 for(const [view,screen]of [[L1_FR,DESKTOP],[l3France('paris'),PHONE],[L2_EUROPE_AR,PHONE]]){
  const h=harness({screen,...view===L2_EUROPE_AR?{dir:'rtl',locale:'ar'}:{}});h.selector.show(view);await h.later();h.doc.runFrames();
  h.event('pointerdown',h.cards()[1],{clientX:200});h.event('pointermove',h.carousel(),{clientX:80});h.doc.runFrames();
  for(const card of h.cards()){
   const where=`${view.key} ${card.dataset.id}`;assert.match(card.style.transform,item,where);
   if(card.dataset.kind!=='campus'){assert.match(card.querySelector('.explorer-name').style.transform,name,where);continue;}
   assert.match(card.querySelector('.explorer-name').style.transform,campusName,where);
   const mark=card.querySelector('.hx-logo');if(mark)assert.match(mark.style.transform,logo,where);
  }
 }
});

/* ---- 25 Oct 2026 refinements: no halos (§A), no Previous / Next (§B) ------------------------------------------------- */
test('no halo: no glow node in any item, at any level, density or rank; no gx field, no --gx or --b0',()=>{
 for(const [screen,view]of [[DESKTOP,L1_FR],[DESKTOP,L2_EUROPE_FR],[DESKTOP,l3France('paris')],[PHONE,l3France('paris')],[SMALL,L1_FR],[LANDSCAPE,L2_EUROPE_FR],[LANDSCAPE,l3France('paris')]]){
  const h=harness({screen});h.selector.show(view);h.selector.setCursor(view.items[1].id);
  const label=`${screen.W} ${view.key}`;
  assert.equal(h.current().querySelectorAll('.explorer-glow').length,0,label);
  for(const card of h.cards()){
   assert.deepEqual(card.querySelector('.explorer-box').children.map(node=>node.className),['explorer-figure'],label+' '+card.dataset.id);
   assert.ok(!('--gx' in card.style),label+' --gx');
  }
  assert.ok(!('--b0' in h.layer().style),label+' --b0');
 }
 const desktop=layoutItems({geometry:haloGeometry({W:1440,H:411,phone:false,campus:false,density:'normal'}),items:five(),cursorIndex:2}).items;
 const compact=layoutItems({geometry:haloGeometry({W:667,H:76.2,density:'compact'}),items:five().map(item=>({...item,width:72,height:44})),cursorIndex:2}).items;
 for(const entry of [...desktop,...compact])assert.ok(!('gx' in entry),'no gx field');
});

test('stylesheet: no glow rule in any state or mode (hover, glide, instant, compact, reduced motion, forced colours); the pool, the horizon and the shadows stay',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8'),code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(code,/explorer-glow/);assert.doesNotMatch(code,/explorer-lantern::(?:before|after)/);
 assert.doesNotMatch(code,/--hx-(?:glow|cursor-glow|logo-glow)\b/);assert.doesNotMatch(code,/--gx\b|--b0\b/);
 assert.doesNotMatch(code,/radial-gradient/,'no disc of light is drawn by the selector');
 // A hovered neighbour changes nothing: the only hover rules are the « Valider » shadow (the fixed button, §P, hovered or
 // under its hovered centre item, and the compact row's chip), the info button's edge (§H) and the strip pills' colour.
 const hovers=[...code.matchAll(/@media\(hover:hover\)\{([^{}]*)\{([^{}]*)\}\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 assert.deepEqual(hovers.map(rule=>rule.selector),[':root #explorer .explorer-track>.explorer-go:is(:hover,[data-hover]),:root #explorer .explorer-level[data-density=compact] .explorer-item[data-off="0"]:hover .explorer-go',
  ':root #explorer .explorer-info:hover',':root #explorer .explorer-sibling:hover']);
 // Kept: the pool, the horizon's line and glow, the cursor's shadow, the chip and its shadow, the names' halo and glow.
 assert.match(code,/\.explorer-pool\{[^}]*background:var\(--hx-pool\)/);
 assert.match(code,/\.explorer-horizon-glow\{fill:none;stroke:url\(#hx-horizon-glow-grad\);stroke-width:26;filter:blur\(14px\);opacity:\.55\}/);
 assert.match(code,/\.explorer-horizon-line\{fill:none;stroke:url\(#hx-horizon-line-grad\);stroke-width:1\.4\}/);
 assert.match(code,/\.explorer-item\[data-off="0"\] \.hx-art\{filter:var\(--hx-shape-shadow\)\}/);
 assert.match(code,/\.explorer-go\{[^}]*box-shadow:var\(--hx-go-shadow\)/);
 assert.match(code,/-webkit-text-stroke-color:var\(--hx-text-halo\)/);assert.match(code,/0 0 \.22em var\(--hx-text-glow\)/);
 assert.match(code,/\.explorer-track\{position:absolute;inset-inline:0;top:-170px;bottom:-170px;/,'the 170 px bleed stays');
});

test('stylesheet: no Previous / Next; the pager keeps their 44 px row, the compact foot is visually hidden, nothing over the row',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8'),code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(code,/explorer-nav/);
 // The buttons' glass serves the info button and its bubble only (§H).
 const glass=[...code.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,,body])=>/--control-glass/.test(body)).map(([,selector])=>selector.trim());
 assert.deepEqual(glass,[':root #explorer .explorer-info',':root #explorer .explorer-info[aria-expanded=true]',':root #explorer .explorer-info:hover',':root #explorer .explorer-hint[data-open]']);
 assert.match(code,/:root #explorer \.explorer-pager\{display:flex;align-items:center;justify-content:center;gap:12px;max-inline-size:100%;min-block-size:44px\}/);
 assert.match(code,/:root #explorer \.explorer-level\[data-density=compact\] :is\(\.explorer-head,\.explorer-foot\)\{position:absolute;inline-size:1px;block-size:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset\(50%\);white-space:nowrap\}/);
 assert.doesNotMatch(code,/\[data-density=compact\] \.explorer-(?:foot|pager)\{/,'no overlay of the foot or the pager');
 assert.match(code,/\[dir=rtl\] #explorer \.explorer-campus-back svg\{transform:scaleX\(-1\)\}/,'the back pill keeps its mirrored arrow');
});

test('phones, L3: the ±1 logos are never hidden; at their slots they stay clear of the cursor\'s name and button',async()=>{
 const css=await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8'),code=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(code,/\.hx-logo\{[^}]*opacity:0/,'no rule hides a logo');assert.doesNotMatch(code,/\[data-phone\][^{}]*\.hx-logo/,'no phone rule on the logos');
 // 390×844 and 320×640, both directions, the squarest print (42 Paris) and the widest (Kuala Lumpur).
 for(const [W,H,density]of [[390,377.1,'normal'],[320,204,'short']])for(const rtl of [false,true])for(const aspectRatio of [1.3986,3.6711]){
  const g=haloGeometry({W,H,phone:true,campus:true,density}),items=five(1).map(item=>({...item,kind:'campus',print:{kind:'mask',aspectRatio}}));
  const lay=layoutItems({geometry:g,items,cursorIndex:2,rtl,fitLogo:realFitLogo}),cursor=lay.items[2],label=`${W} ${rtl?'rtl':'ltr'} ${aspectRatio}`;
  // The cursor's button (wider than the fixed « Valider » under it, §P); its name is at most 12 em wide, centred under the
  // lantern.
  const half=Math.max(cursor.w0*cursor.s,12*g.F)/2;
  for(const index of [1,3]){
   const entry=lay.items[index],width=entry.logo.width*entry.s*entry.lk;
   assert.equal(entry.off,index-2,label);assert.equal(entry.visible,true,label);near(entry.dist,g.x1,1e-9,label+' at its slot');
   near(entry.lk,Math.max(1,Math.min(28/(entry.s*entry.logo.height),entry.w0/entry.logo.width)),1e-9,label+' the 28 px floor');
   assert.ok(entry.x+width/2<W/2-half||entry.x-width/2>W/2+half,`${label}: ${entry.x}±${width/2} against ${W/2}±${half}`);
  }
 }
});

/* ---- 25 Oct 2026 refinements: level changes, only what changes animates (§D) ---------------------------------------- */
const EASE_CSS='cubic-bezier(.22,1,.36,1)';
// Every animation recorded since `from`, keyed by its view ('out': the leaving one, 'in') and its part (a step dot with
// its index), with its keyframes and timing.
function motions(h,from=0){
 const parts=['explorer-level','explorer-campus','explorer-head','explorer-foot','explorer-carousel','explorer-track','explorer-items','explorer-prompt-text','explorer-prompt','explorer-steps','explorer-step','explorer-pager','explorer-dots','explorer-count','explorer-info','explorer-hint','explorer-horizon','explorer-pool'];
 return Object.fromEntries(h.doc.animations.slice(from).map(animation=>{
  const element=animation.element,view=element.closest('.explorer-level,.explorer-campus'),part=parts.find(name=>element.classList.contains(name))??element.className;
  const index=part==='explorer-step'?' '+element.parentNode.children.filter(node=>node.classList.contains('explorer-step')).indexOf(element):'';
  return [`${view?.dataset.state==='leaving'?'out':'in'} ${part}${index}`,{keyframes:animation.keyframes,timing:{...animation.options}}];
 }));
}
// The motion §D asks of a level change: the items as the levels moved before; the parts that change crossfade in place,
// both copies over the same 0.26 s (their opacities add up to 1); the prompt, no longer shown (§V), does not fade; the
// steps, centred alone (§V), glide by (dx, dy) only when a band that moved put them elsewhere, and the info button (§H:
// never faded; `info`) when the number of dots moved it; the dots that change state ease from their outgoing looks
// (`dots`: index → outgoing state) to their own.
function handoverMotion({ascend=false,fading=['explorer-dots','explorer-count'],steps=null,info=null,dots={}}={}){
 const out={easing:EASE_CSS,duration:260,fill:'forwards'};
 const expected={'out explorer-items':{keyframes:[{opacity:1,translate:'0 0',scale:'1'},{opacity:0,translate:`0 ${ascend?18:-18}px`,scale:ascend?'.97':'1.03'}],timing:out},
  'in explorer-items':{keyframes:[{opacity:0,translate:`0 ${ascend?-22:22}px`},{opacity:1,translate:'0 0'}],timing:{easing:EASE_CSS,duration:420,delay:80,fill:'backwards'}}};
 for(const part of fading){expected['out '+part]={keyframes:[{opacity:1},{opacity:0}],timing:out};expected['in '+part]={keyframes:[{opacity:0},{opacity:1}],timing:{easing:EASE_CSS,duration:260}};}
 for(const [part,move]of [['explorer-steps',steps],['explorer-info',info]])if(move)expected['in '+part]={keyframes:[{transform:`translate(${move[0]}px,${move[1]}px)`},{transform:'none'}],timing:{easing:EASE_CSS,duration:420}};
 for(const [index,state]of Object.entries(dots))expected['in explorer-step '+index]={keyframes:[STEP_LOOKS[state],{}],timing:{easing:EASE_CSS,duration:300}};
 return expected;
}
// The parts a level hides at once (inline): in the outgoing level, those the incoming one shows unchanged at that place,
// the steps and the info button (they stand still or glide in the incoming level).
const hiddenParts=level=>['explorer-steps','explorer-prompt','explorer-dots','explorer-count','explorer-info','explorer-hint','explorer-horizon','explorer-pool','explorer-items']
 .filter(name=>level.querySelector('.'+name)?.style.visibility==='hidden');
const STAGE_FADES=['explorer-dots','explorer-count','explorer-horizon','explorer-pool'];
// L2 ↔ L3 since §I: one horizon at both levels (it stands still); the pool keeps the level's own width (it crossfades).
const L23_FADES=['explorer-dots','explorer-count','explorer-pool'];

test('L1 → L2: the items move as before, the dots and count crossfade, the steps stand still as their dots ease (§V); the hint, horizon and pool stand still; the info button glides with the wider row',async()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});await h.later();h.doc.runFrames();h.key('End');
 const first=h.current();h.selector.show(L2_EUROPE_FR,{direction:'descend',focus:true});const second=h.current();
 // « Où veux-tu aller ? » → « Choisir un pays », no longer shown (§V): the steps, centred alone, keep their place; the
 // first dot passes from current to done, the second from todo to current.
 // 4 → 14 dots (56 → 176 px): the centred row ends 60 px further right, so the info button glides from 60 px left (§H).
 assert.deepEqual(motions(h),handoverMotion({info:[-60,0],dots:{0:'current',1:'todo'}}));
 assert.deepEqual(hiddenParts(first),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool'],'what the incoming level shows unchanged at the same place');
 assert.deepEqual(hiddenParts(second),[]);
 assert.deepEqual(second.querySelectorAll('.explorer-step').map(dot=>dot.dataset.state),['done','current','todo'],'the dots hold their new states');
 // Focus, ARIA and the frozen, inert outgoing level are as before; IDs stay per level.
 assert.equal(h.doc.activeElement,h.card('ALB'));assert.deepEqual([first.inert,first.getAttribute('aria-hidden'),first.style.position],[true,'true','absolute']);
 const carousel=second.querySelector('.explorer-carousel');
 assert.equal(carousel.getAttribute('aria-labelledby'),second.querySelector('.explorer-prompt').id);assert.equal(carousel.getAttribute('aria-describedby'),second.querySelector('.explorer-hint-keys').id);
 assert.notEqual(second.querySelector('.explorer-prompt').id,first.querySelector('.explorer-prompt').id);
 // The outgoing level goes once its items have left; nothing of the incoming one stays hidden.
 await h.finish();assert.equal(first.parentNode,null);assert.deepEqual(h.screens(),[second]);assert.deepEqual(hiddenParts(second),[]);
 // Another continent's countries (the scope popover): the same prompt stands still, so the steps neither glide nor ease.
 const asia={key:'countries:asia',level:'countries',depth:2,parent:{kind:'continent',id:'asia',name:'Asie'},step:{index:2,total:3},cursorId:'JPN',
  items:[['JPN','Japon',2],['KOR','Corée du Sud',2],['THA','Thaïlande',1]].map(([id,name,campuses])=>country(id,name,campuses,`${campuses} campus`))};
 const from=h.doc.animations.length;h.selector.show(asia,{direction:'descend'});
 assert.deepEqual(motions(h,from),handoverMotion({fading:['explorer-dots','explorer-count'],info:[66,0]}));
 assert.deepEqual(hiddenParts(second),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
});

test('L2 → L1: the items reverse, the steps stand still as their dots ease back (§V), in RTL too',async()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR);await h.later();h.doc.runFrames();
 const first=h.current();h.selector.show({...L1_FR,cursorId:'europe'},{direction:'ascend'});
 assert.deepEqual(motions(h),handoverMotion({ascend:true,info:[60,0],dots:{0:'done',1:'current'}}));
 assert.deepEqual(hiddenParts(first),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
 // Arabic: « اختر دولة » → « إلى أين تريد الذهاب؟ », not shown; the steps keep their place. The row is mirrored, the info
 // button at its left end: 14 → 4 dots bring it 60 px right.
 const r=harness({dir:'rtl',locale:'ar'});r.selector.show(L2_EUROPE_AR);await r.later();r.doc.runFrames();
 const leaving=r.current();r.selector.show({...L1_AR,cursorId:'europe'},{direction:'ascend'});
 assert.deepEqual(motions(r),handoverMotion({ascend:true,info:[-60,0],dots:{0:'done',1:'current'}}));
 assert.deepEqual(hiddenParts(leaving),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
});

test('L2 → L3: the horizon stands still with the hint (one line at every level, §I); only the pool, of the level\'s own width, crossfades',async()=>{
 const h=harness();h.selector.show({...L2_EUROPE_FR,cursorId:'FRA'});await h.later();h.doc.runFrames();
 const first=h.current();h.selector.show(l3France(),{direction:'descend',focus:true});const second=h.current();
 // « Choisir un pays » → « Choisir un campus », not shown: the steps keep their place (§V); 14 → 8 dots, the info
 // button 36 px left.
 assert.deepEqual(motions(h),handoverMotion({fading:L23_FADES,info:[36,0],dots:{1:'current',2:'todo'}}));
 assert.deepEqual(hiddenParts(first),['explorer-steps','explorer-info','explorer-hint','explorer-horizon']);
 for(const name of ['.explorer-horizon-line','.explorer-horizon-glow'])assert.equal(second.querySelector(name).getAttribute('d'),first.querySelector(name).getAttribute('d'),'the same line '+name);
 assert.equal(second.querySelector('.explorer-horizon').getAttribute('viewBox'),first.querySelector('.explorer-horizon').getAttribute('viewBox'));
 // The pool stays at the line, 340 × 1.25 px wide under a country and 200 × 1.35 px under a campus (the line at 328.36 px,
 // lowered by §U: 170 + 328.36 − 15).
 const pool=level=>['left','top','width'].map(name=>level.querySelector('.explorer-pool').style[name]);
 assert.deepEqual([pool(first),pool(second)],[['507.5px','483.36px','425px'],['585px','483.36px','270px']]);
 assert.equal(h.doc.activeElement,h.card('angouleme'));
 await h.finish();assert.deepEqual(h.screens(),[second]);assert.deepEqual(hiddenParts(second),[]);
 // 864 px wide: both pools are 270 px wide (216 × 1.25 and 200 × 1.35), so the pool stands still too.
 const w=harness({screen:{...DESKTOP,W:864}});w.selector.show({...L2_EUROPE_FR,cursorId:'FRA'});await w.later();w.doc.runFrames();
 const country=w.current();w.selector.show(l3France(),{direction:'descend'});
 assert.deepEqual(pool(country),pool(w.current()));
 assert.deepEqual(motions(w),handoverMotion({info:[36,0],dots:{1:'current',2:'todo'}}));
 assert.deepEqual(hiddenParts(country),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
});

test('L3 → sheet → L3 keep the whole-view motion (the sheet replaces the selector); L3 → L2 swaps the parts, the horizon still',async()=>{
 const h=harness();h.selector.show(l3France('paris'));await h.later();h.doc.runFrames();
 const level=h.current();h.selector.show(campusView('paris'),{direction:'descend'});
 // The FLIP (unchanged): the L3 level fades out whole while the sheet unfolds; none of its parts moves by itself.
 const flip=motions(h);
 assert.deepEqual(Object.keys(flip).filter(key=>key.startsWith('out ')),['out explorer-level']);
 assert.deepEqual(flip['out explorer-level'],{keyframes:[{opacity:1},{opacity:0}],timing:{easing:'linear',duration:220}});assert.deepEqual(hiddenParts(level),[]);
 await h.finish();
 // Sheet → L3 (unchanged): the generic ascend of the whole views, since the L3 head and foot appear.
 let from=h.doc.animations.length;h.selector.show(l3France('paris'),{direction:'ascend'});
 assert.deepEqual(motions(h,from),{'out explorer-campus':{keyframes:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(18px) scale(.97)'}],timing:{easing:EASE_CSS,duration:260}},
  'in explorer-level':{keyframes:[{opacity:0,transform:'translateY(-22px)'},{opacity:1,transform:'none'}],timing:{easing:EASE_CSS,duration:420,delay:80,fill:'backwards'}}});
 await h.finish();
 // L3 → L2: « Choisir un campus » → « Choisir un pays », on the same line; the pool takes the countries' width back.
 const third=h.current();from=h.doc.animations.length;h.selector.show({...L2_EUROPE_FR,cursorId:'FRA'},{direction:'ascend'});
 assert.deepEqual(motions(h,from),handoverMotion({ascend:true,fading:L23_FADES,info:[-36,0],dots:{1:'done',2:'current'}}));
 assert.deepEqual(hiddenParts(third),['explorer-steps','explorer-info','explorer-hint','explorer-horizon']);
 // L1 → sheet (a deep link, the dice): generic too.
 const g=harness();g.selector.show(L1_FR);g.selector.show(campusView('paris'),{direction:'descend'});assert.deepEqual(Object.keys(motions(g)),['out explorer-level','in explorer-campus']);
});

test('compact row: only the items animate; short bands (the hint visually hidden) follow the same rules as normal ones',async()=>{
 const h=harness({screen:LANDSCAPE});h.selector.show({...L2_EUROPE_FR,cursorId:'FRA'});await h.later();h.doc.runFrames();
 const first=h.current();assert.equal(first.dataset.density,'compact');
 h.selector.show(l3France(),{direction:'descend'});
 assert.deepEqual(motions(h),handoverMotion({fading:[]}),'the head and foot are visually hidden; no horizon, pool or pager');assert.deepEqual(hiddenParts(first),[]);
 h.selector.show({...L2_EUROPE_FR,cursorId:'FRA'},{direction:'ascend'});
 assert.deepEqual(motions(h,2),handoverMotion({ascend:true,fading:[]}));
 const s=harness({screen:{...DESKTOP,band:369,H:259.5}});s.selector.show(L1_FR);await s.later();s.doc.runFrames();
 const short=s.current();assert.equal(short.dataset.density,'short');
 s.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.deepEqual(motions(s),handoverMotion({info:[-60,0],dots:{0:'current',1:'todo'}}));
 assert.deepEqual(hiddenParts(short),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
});

test('a part that would not stand at the same place crossfades instead (the band moved between the views), and the steps glide from there; a band that changed density moves the whole views',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();h.doc.runFrames();
 const first=h.current();h.doc.screen.top+=30;
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.equal(first.style.top,'178.3px','the outgoing level stays where it was painted');
 assert.deepEqual(motions(h),handoverMotion({fading:[...STAGE_FADES,'explorer-hint'],steps:[0,-30],info:[-60,-30],dots:{0:'current',1:'todo'}}));
 assert.deepEqual(hiddenParts(first),['explorer-steps','explorer-info']);
 // A normal band that became short between the two views: the levels' layouts differ, so the generic motion of §2.5.
 const d=harness();d.selector.show(L1_FR);await d.later();d.doc.runFrames();
 const normal=d.current();Object.assign(d.doc.screen,{band:369,H:259.5});
 d.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.deepEqual([normal.dataset.density,d.current().dataset.density],['normal','short']);
 assert.deepEqual(motions(d),{'out explorer-level':{keyframes:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-18px) scale(1.03)'}],timing:{easing:EASE_CSS,duration:260}},
  'in explorer-level':{keyframes:[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],timing:{easing:EASE_CSS,duration:420,delay:80,fill:'backwards'}}});
 assert.deepEqual(hiddenParts(normal),[]);
});

test('reduced motion: no animation and no hidden part, the outgoing level goes at once; with motion, parts move and never a whole level',async()=>{
 const r=harness({reduced:true});r.selector.show(L1_FR,{focus:true});r.selector.show(L2_EUROPE_FR,{direction:'descend',focus:true});
 assert.equal(r.doc.animations.length,0);assert.equal(r.screens().length,1);assert.deepEqual(hiddenParts(r.current()),[]);
 assert.deepEqual(r.current().querySelectorAll('.explorer-step').map(dot=>dot.dataset.state),['done','current','todo']);assert.equal(r.doc.activeElement,r.card('ALB'));
 for(const [view,direction]of [[l3France(),'descend'],[campusView('angouleme'),'descend'],[l3France(),'ascend'],[L2_EUROPE_FR,'ascend'],[L1_FR,'ascend']])r.selector.show(view,{direction});
 assert.equal(r.doc.animations.length,0);assert.equal(r.screens().length,1);assert.deepEqual(hiddenParts(r.current()),[]);
 const m=harness();m.selector.show(L1_FR);m.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.ok(m.doc.animations.length>2);assert.ok(m.doc.animations.every(animation=>!animation.element.classList.contains('explorer-level')),'never a whole level');
 assert.deepEqual(hiddenParts(m.screens()[0]),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
});

test('interruptions: a new view settles the running change at once (validate then Escape, a double Enter); a resize or a language switch lets it run; nothing stays hidden, half faded or duplicated',async()=>{
 const settled=(h,label)=>{
  assert.equal(h.screens().length,1,label);assert.ok(h.doc.animations.every(animation=>animation.playState!=='running'),label);
  assert.deepEqual(hiddenParts(h.current()),[],label);assert.equal(h.doc.activeElement,h.cards().find(card=>card.dataset.off==='0'),label+': focus on the cursor');
 };
 // Validate Europe, then Escape at once on the new level's cursor.
 const h=harness();h.selector.show(L1_FR,{focus:true});await h.later();h.doc.runFrames();
 h.onValidate=()=>h.selector.show(L2_EUROPE_FR,{direction:'descend',focus:h.root.contains(h.doc.activeElement)});
 h.onAscend=()=>h.selector.show({...L1_FR,cursorId:'europe'},{direction:'ascend',focus:h.root.contains(h.doc.activeElement)});
 h.key('End');h.press('Enter');const first=h.screens()[0],second=h.current(),made=h.doc.animations.length;
 assert.equal(second.dataset.level,'countries');assert.deepEqual(hiddenParts(first),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
 h.key('Escape');assert.equal(h.calls.ascend,1);
 assert.equal(first.parentNode,null,'the first outgoing level goes at once');
 assert.ok(h.doc.animations.slice(0,made).every(animation=>animation.playState==='idle'),'its change is cancelled, every part at its end');
 assert.equal(second.dataset.state,'leaving');assert.deepEqual(hiddenParts(second),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
 assert.deepEqual(motions(h,made),handoverMotion({ascend:true,info:[60,0],dots:{0:'done',1:'current'}}),'the new change starts from the settled level');
 await h.finish();settled(h,'Escape');assert.equal(h.cursor(),'europe');
 // A double Enter: the second lands on the new level's cursor and descends again.
 const d=harness();d.selector.show(L1_FR,{focus:true});await d.later();d.doc.runFrames();
 d.onValidate=target=>d.selector.show(target.kind==='continent'?L2_EUROPE_FR:L3_ALBANIA,{direction:'descend',focus:d.root.contains(d.doc.activeElement)});
 d.key('End');d.press('Enter');const start=d.screens()[0],middle=d.current(),made2=d.doc.animations.length;d.press('Enter');
 assert.deepEqual(d.calls.validate,[{kind:'continent',id:'europe'},{kind:'country',id:'ALB'}]);
 assert.equal(start.parentNode,null);assert.equal(middle.dataset.state,'leaving');assert.equal(d.current().dataset.level,'campuses');
 assert.deepEqual(motions(d,made2),handoverMotion({fading:L23_FADES,info:[78,0],dots:{1:'current',2:'todo'}}));
 await d.finish();settled(d,'double Enter');
 // A resize re-lays the incoming level out at once; the frozen outgoing level stays as it was painted; the change runs on.
 const z=harness();z.selector.show(L1_FR,{focus:true});await z.later();z.doc.runFrames();
 const leaving=z.current(),x=leaving.querySelector('[data-explorer-card]').style['--x'];z.selector.show(L2_EUROPE_FR,{direction:'descend',focus:true});
 const made3=z.doc.animations.length;z.doc.resize({H:300});
 assert.equal(z.current().dataset.instant,'');assert.equal(leaving.querySelector('[data-explorer-card]').style['--x'],x);assert.equal(leaving.style.top,'178.3px');
 assert.equal(z.doc.animations.length,made3);assert.ok(z.doc.animations.every(animation=>animation.playState==='running'));
 assert.deepEqual(hiddenParts(leaving),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
 await z.finish();settled(z,'resize');
 // A language switch repaints the incoming level only; the outgoing one leaves as it was.
 const l=harness();l.selector.show(L1_FR,{focus:true});await l.later();l.doc.runFrames();
 const gone=l.current();l.selector.show(L2_EUROPE_FR,{direction:'descend',focus:true});const made4=l.doc.animations.length;
 l.state.locale='en';l.selector.localize();
 assert.equal(l.current().querySelector('.explorer-prompt-text').textContent,'Choose a country');assert.equal(gone.querySelector('.explorer-prompt-text').textContent,'Où veux-tu aller ?');
 assert.equal(l.doc.animations.length,made4);assert.ok(l.doc.animations.every(animation=>animation.playState==='running'));
 assert.deepEqual(hiddenParts(gone),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
 await l.finish();settled(l,'language');
});

test('a drag right after a level change follows the horizon; during one, the change never writes the transforms a drag writes',async()=>{
 const h=harness();h.selector.show(L1_FR);await h.later();h.doc.runFrames();
 h.selector.show(L2_EUROPE_FR,{direction:'descend'});
 const layers=h.doc.animations.filter(animation=>animation.element.classList.contains('explorer-items'));
 assert.equal(layers.length,2);assert.ok(layers.every(animation=>animation.keyframes.every(frame=>!('transform' in frame))),'translate, scale and opacity only');
 await h.finish();h.doc.runFrames();
 const carousel=h.carousel(),g=DESKTOP_L12;
 h.event('pointerdown',h.card('ALB'),{clientX:700});h.event('pointermove',carousel,{clientX:700-.4*g.x1});h.doc.runFrames();
 assertAlong(h,g,.4,1,'right after');
 h.event('pointerup',carousel,{clientX:700-.4*g.x1});assert.equal(h.cursor(),'ALB');assert.deepEqual(hiddenParts(h.current()),[]);
 // The compact row: a drag during the change moves the items layer by its own transform while the change runs on.
 const c=harness({screen:LANDSCAPE});c.selector.show(L1_FR);await c.later();c.doc.runFrames();
 c.selector.show(L2_EUROPE_FR,{direction:'descend'});const running=c.doc.animations.slice();
 c.event('pointerdown',c.card('ALB'),{clientX:300});c.event('pointermove',c.carousel(),{clientX:250});
 assert.equal(c.layer().style.transform,'translateX(-50px)');
 assert.equal(running.length,2);assert.ok(running.every(animation=>animation.playState==='running'&&animation.keyframes.every(frame=>!('transform' in frame))));
});

test('the outgoing level is frozen at its very box (1/64 px, the layout\'s precision), so the parts it shows as it leaves never shift',async()=>{
 // A band whose edges fall between hundredths of a pixel, as Chrome lays them out (multiples of 1/64 px).
 const h=harness({screen:{...DESKTOP,gutter:47.984375,top:178.296875,band:518.703125}});h.selector.show(L1_FR);await h.later();h.doc.runFrames();
 const first=h.current();h.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.deepEqual(['left','top','width','height'].map(name=>first.style[name]),['47.984375px','178.296875px','1344.03125px','518.703125px'],'not rounded to 0.01 px');
 assert.deepEqual(first.getBoundingClientRect(),h.current().getBoundingClientRect(),'the frozen level stands exactly where the incoming one is laid out');
 assert.deepEqual(hiddenParts(first),['explorer-steps','explorer-info','explorer-hint','explorer-horizon','explorer-pool']);
 // The campus section keeps the same precision.
 const c=harness({screen:{...DESKTOP,gutter:47.984375,top:178.296875,band:518.703125}});c.selector.show(campusView('paris'));
 c.doc.rects.set(c.current(),()=>({left:.015625,top:148.296875,width:1439.96875,height:549.703125,right:1439.984375,bottom:698,x:.015625,y:148.296875}));
 const sheet=c.current();c.doc.resize({});c.selector.show(l3France('paris'),{direction:'ascend'});
 assert.deepEqual(['left','top','width','height'].map(name=>sheet.style[name]),['0.015625px','148.296875px','1439.96875px','549.703125px']);
});

/* ---- 25 Oct 2026 refinements: one horizon at every level (§I), the names above the campus dots (§J) --------------- */
// The drawn line as a function of x: the selector's absolute polyline « M x y L x y … », in track coordinates.
const polyline=d=>{
 const points=d.slice(1).split('L').map(pair=>pair.trim().split(/\s+/).map(Number));
 return x=>{for(let index=1;index<points.length;index++){const [x0,y0]=points[index-1],[x1,y1]=points[index];if(x>=x0&&x<=x1)return y0+(y1-y0)*(x-x0)/(x1-x0);}return null;};
};
test('the horizon drawn at L3 is the line of L1 and L2 at every size and in both directions; the L3 logos stand on it, the pool keeps its own width at the line',()=>{
 for(const [screen,dir,locale,views]of [[DESKTOP,'ltr','fr',[L1_FR,L2_EUROPE_FR,l3France('paris')]],[PHONE,'ltr','fr',[L1_FR,L2_EUROPE_FR,l3France('paris')]],
  [SMALL,'ltr','en',[L1_FR,L2_EUROPE_FR,l3France('nice')]],[{...DESKTOP,H:395.1},'rtl','ar',[L1_AR,L2_EUROPE_AR,l3France('lyon')]],
  [{...DESKTOP,W:1280,band:338.7,H:259.5},'ltr','fr',[L1_FR,L2_EUROPE_FR,l3France('marseille')]]]){
  const h=harness({screen,dir,locale}),label=`${screen.W}×${screen.H} ${dir}`,drawn=[];
  for(const view of views){
   h.selector.show(view);const level=h.current(),svg=level.querySelector('.explorer-horizon');
   drawn.push({viewBox:svg.getAttribute('viewBox'),line:level.querySelector('.explorer-horizon-line').getAttribute('d'),glow:level.querySelector('.explorer-horizon-glow').getAttribute('d'),pool:level.querySelector('.explorer-pool').style.top});
  }
  assert.deepEqual(drawn[1],drawn[0],label+': L2 draws L1\'s line');assert.deepEqual(drawn[2],drawn[1],label+': L3 draws L2\'s line');
  // Every L3 item whose centre lies under the drawn line stands on it (its points are rounded to 0.1 px).
  const y=polyline(drawn[2].line),h0=Number.parseFloat(h.layer().style['--h0']);let standing=0;
  for(const card of h.cards()){const x=varOf(card,'--x');if(y(x)===null)continue;near(varOf(card,'--y')+h0,y(x),.1,`${label} ${card.dataset.id} at ${x}`);standing++;}
  assert.ok(standing>=(screen.W<700?3:5),`${label}: ${standing} items on the line`);
  // The pool stands at the line (its top above) with the campus level's own width.
  const g=haloGeometry({W:screen.W,H:screen.H,phone:screen.W<700,campus:true,density:h.current().dataset.density});
  assert.equal(h.current().querySelector('.explorer-pool').style.width,`${Math.round(g.bh*1.35*100)/100}px`,label);
 }
});

test('stylesheet: the names stand above the campus dots at every level, state, theme and size, with their stroke and glow (§J); the dots keep their place, size and opacities',async()=>{
 const strip=text=>text.replace(/\/\*[\s\S]*?\*\//g,''),rules=text=>[...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 const code=strip(await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8')),art=strip(await readFile(new URL('./explorer-art.css',import.meta.url),'utf8'));
 const all=rules(code),dots=':root #explorer .explorer-figure>.hx-dots',name=':root #explorer .explorer-item:not([data-kind=campus]) .explorer-name';
 // The first rule of a selector (the names' forced-colours rule comes later, checked with the others below).
 const first=selector=>{const found=all.find(rule=>rule.selector===selector);assert.ok(found,selector);return found;};
 const z=rule=>Number(/(?:^|;)\s*z-index:(-?\d+)/.exec(rule.body)?.[1]),stack=[first(dots),first(name)];
 assert.match(first(dots).body,/^position:absolute;inset:0;z-index:\d+$/,'the dots keep their layer over the whole figure');
 assert.match(first(name).body,/^\s*position:absolute;z-index:\d+;/);
 assert.ok(z(first(name))>z(first(dots)),`the name (${z(first(name))}) above the dots (${z(first(dots))})`);
 assert.ok(z(first(dots))>z(first(':root #explorer .explorer-figure>.hx-art')),'the dots above the silhouette');
 // No other rule stacks them otherwise (glides, drags, instant layouts, phones, reduced motion, forced colours), the figure
 // holding both never makes a stacking context of its own, and the compact row hides the dots.
 for(const rule of all){
  const parts=rule.selector.split(',').map(part=>part.trim());
  if(!stack.includes(rule)&&parts.some(part=>/\.hx-dots|\.explorer-name/.test(part)))assert.doesNotMatch(rule.body,/(?:^|;)\s*z-index:/,rule.selector);
  if(parts.some(part=>/\.explorer-figure$/.test(part)))assert.doesNotMatch(rule.body,/(?:^|;)\s*(?:z-index|transform|opacity|filter|isolation|will-change|mix-blend-mode|contain):/,rule.selector);
 }
 assert.match(code,/\[data-density=compact\] :is\([^)]*\.hx-dots\)\{display:none\}/);
 for(const rule of rules(art).filter(rule=>/hx-dots/.test(rule.selector)))assert.doesNotMatch(rule.body,/z-index|(?:^|;)\s*position:/,'explorer-art.css '+rule.selector);
 // Their opacities: .75 on the neighbours' continents, none on the neighbours' countries.
 assert.match(code,/:root #explorer \.explorer-item:not\(\[data-off="0"\]\) \.hx-dots\{opacity:\.75\}/);
 assert.match(code,/:root #explorer \.explorer-item\[data-kind=country\]:not\(\[data-off="0"\]\) \.hx-dots\{opacity:0\}/);
 // The name and the dots are siblings in the figure (one stacking context, where the z-indices decide), also during a drag.
 const h=harness();h.selector.show(L2_EUROPE_FR);await h.later();h.doc.runFrames();
 h.event('pointerdown',h.cards()[1],{clientX:700});h.event('pointermove',h.carousel(),{clientX:600});h.doc.runFrames();
 for(const card of h.cards()){const figure=card.querySelector('.explorer-figure');assert.deepEqual([figure.querySelector('.explorer-name').parentNode,figure.querySelector('.hx-dots').parentNode],[figure,figure],card.dataset.id);}
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

/* ---- 25 Oct 2026 refinements: the key hints behind an info button (§H), no counts under the shapes (§K) ------------ */
const HINTS={fr:'Flèches pour choisir · Entrée pour valider · Échap pour revenir',en:'Arrows to choose · Enter to select · Esc to go back',ar:'الأسهم للاختيار · Enter للتأكيد · Esc للرجوع'};
const TOUCH_HINTS={fr:'Glisse pour choisir · Touche le centre pour valider',en:'Swipe to choose · Tap the centre to select',ar:'اسحب للاختيار · المس العنصر في الوسط للتأكيد'};
// The current level's info button and bubble; open() also checks that aria-expanded tells the bubble's state.
function bubbleOf(h){
 const level=h.current(),info=level.querySelector('.explorer-info'),hint=level.querySelector('.explorer-hint');
 return {level,info,hint,open:()=>{const shown='open' in hint.dataset;assert.equal(info.getAttribute('aria-expanded'),String(shown),'aria-expanded tells the bubble\'s state');return shown;}};
}

test('the key hints sit behind an info button ending the pager row (§H): dots, count, ⓘ; its name in FR, EN and AR, aria-expanded and aria-controls; closed, the hint still describes the carousel; no id twice',()=>{
 for(const [locale,dir,view,name,coarse]of [['fr','ltr',L1_FR,'Aide',false],['en','ltr',L2_EUROPE_FR,'Help',true],['ar','rtl',L2_EUROPE_AR,'مساعدة',false]]){
  const h=harness({locale,dir,coarse});h.selector.show(view,{focus:true});h.selector.show(l3France(),{direction:'descend'});h.selector.show(view,{direction:'ascend'});
  const {level,info,hint,open}=bubbleOf(h);
  assert.deepEqual(level.querySelector('.explorer-pager').children.map(node=>node.className),['explorer-dots','explorer-count','explorer-info'],locale+': dots count ⓘ');
  assert.deepEqual([info.localName,info.type,info.hidden,info.getAttribute('aria-label'),info.getAttribute('aria-controls')],['button','button',false,name,hint.id],locale);
  assert.equal(open(),false,locale+': closed at first');assert.equal(info.getAttribute('aria-expanded'),'false');
  assert.equal(hint.localName,'p');assert.match(hint.id,/^explorer-hint-\d+$/);assert.equal(hint.parentNode,level.querySelector('.explorer-foot'));
  // The carousel stays described by the variant the bubble shows (H2f), inside the bubble.
  const description=h.doc.getElementById(h.carousel().getAttribute('aria-describedby'));
  assert.ok(hint.contains(description),locale);assert.equal(description.hidden,false);assert.equal(description.textContent,(coarse?TOUCH_HINTS:HINTS)[locale],locale);
  // The line's room: an invisible copy of both variants, without ids, hidden from assistive technology.
  const room=level.querySelector('.explorer-hint-room');
  assert.equal(room.getAttribute('aria-hidden'),'true');assert.equal(room.textContent,hint.textContent);assert.deepEqual(room.querySelectorAll('[id]'),[]);
  assert.deepEqual(room.children.map(node=>node.hidden),hint.children.map(node=>node.hidden));
  assert.deepEqual(room.querySelectorAll('kbd').map(kbd=>[kbd.textContent,kbd.lang]),hint.querySelectorAll('kbd').map(kbd=>[kbd.textContent,kbd.lang]),'the same keys');
  // No id twice in the page, with three levels in it.
  const ids=h.doc.documentElement.querySelectorAll('[id]').map(node=>node.id);assert.ok(h.screens().length>1);assert.equal(new Set(ids).size,ids.length,ids.join());
 }
});

test('the info button opens and closes the bubble by a click, a tap, Enter or Space; the focus stays on it; a held key toggles once; nothing is validated, ascended or moved',async()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR,{focus:true});await h.later();
 const {info,hint,open}=bubbleOf(h);
 h.tap(info);assert.equal(open(),true,'a click opens');assert.equal(h.doc.activeElement,info,'the pressed button has the focus');
 h.tap(info);assert.equal(open(),false,'a second click closes');
 // A tap; a press inside the bubble keeps it open.
 const touch=(target,type)=>h.event(type,target,{pointerType:'touch',detail:1});
 for(const type of ['pointerdown','pointerup','click'])touch(info,type);assert.equal(open(),true,'a tap opens');
 for(const type of ['pointerdown','pointerup','click'])touch(hint.querySelector('kbd'),type);assert.equal(open(),true,'a tap on the bubble keeps it');
 for(const type of ['pointerdown','pointerup','click'])touch(info,type);assert.equal(open(),false,'a second tap closes');
 // Enter and Space: the native activation (a detail-0 click); the focus stays on the button.
 info.focus();
 assert.equal(h.press('Enter').defaultPrevented,false);assert.equal(open(),true);assert.equal(h.doc.activeElement,info);
 assert.equal(h.press('Enter',{repeat:true}).defaultPrevented,true,'a held Enter clicks once');assert.equal(open(),true);
 h.press(' ');assert.equal(open(),false,'Space closes');assert.equal(h.doc.activeElement,info);
 assert.equal(h.press(' ',{repeat:true}).defaultPrevented,true);assert.equal(open(),false);
 h.press(' ');assert.equal(open(),true);assert.equal(h.doc.activeElement,info);
 assert.deepEqual([h.calls.validate.length,h.calls.ascend,h.cursor()],[0,0,'ALB'],'the button never validates, ascends or moves the cursor');
});

test('the bubble closes by Escape, which then ascends no level, by a press anywhere else, a level change and leaving the Explorer; a language change keeps it open with its new text',async()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR,{focus:true});await h.later();
 let {info,hint,open}=bubbleOf(h);
 // Escape, from the button or from the cursor item (depth 2): it closes the bubble, and only that.
 h.tap(info);const escape=h.key('Escape');
 assert.equal(escape.defaultPrevented,true);assert.equal(open(),false);assert.equal(h.calls.ascend,0,'no level is ascended');assert.equal(h.doc.activeElement,info);
 h.tap(info);h.card('ALB').focus();h.key('Escape');assert.equal(open(),false);assert.equal(h.calls.ascend,0);
 assert.equal(h.key('Escape',{repeat:true}).defaultPrevented,true,'its auto-repeats ascend nothing');assert.equal(h.calls.ascend,0);
 h.key('Escape');assert.equal(h.calls.ascend,1,'closed, Escape ascends as before');
 // Escape outside the stage (a browser that does not focus a pressed button): it closes, nothing else.
 h.tap(info);info.blur();const outside=h.key('Escape',{},h.doc.body);
 assert.equal(open(),false);assert.equal(outside.defaultPrevented,false);assert.equal(h.calls.ascend,1);
 // A press anywhere else: the page around the stage, an item (which then does what it does), the carousel (a drag).
 h.tap(info);h.event('pointerdown',h.outside,{detail:1});assert.equal(open(),false,'outside the stage');
 h.tap(info);h.tap(h.card('DEU'));assert.equal(open(),false,'an item');assert.equal(h.cursor(),'DEU','and the item moves the cursor');
 h.tap(info);h.event('pointerdown',h.carousel(),{clientX:700});assert.equal(open(),false,'the carousel');
 assert.equal(h.doc.documentElement.listeners.length,0,'no page-wide listener is left');
 // A language change keeps it open, with the new text and name.
 h.tap(info);h.state.locale='en';h.selector.localize();h.selector.show(L2_EUROPE_FR);
 assert.equal(open(),true);assert.equal(hint.querySelector('.explorer-hint-keys').textContent,HINTS.en);assert.equal(info.getAttribute('aria-label'),'Help');
 // Leaving the Explorer: the controller makes the stage inert, then shows the same view.
 h.root.inert=true;h.selector.show(L2_EUROPE_FR);assert.equal(open(),false,'left');
 h.root.inert=false;h.selector.show(L2_EUROPE_FR);assert.equal(open(),false,'still closed on the way back');
 // A level change, with or without motion: the outgoing level's bubble closes before the views swap.
 h.tap(info);assert.equal(open(),true);h.selector.show(l3France(),{direction:'descend'});
 assert.equal(open(),false,'the outgoing level\'s');assert.equal(bubbleOf(h).open(),false,'the incoming level\'s');
 await h.later();({info,open}=bubbleOf(h));h.tap(info);assert.equal(open(),true);h.selector.show(L3_ALBANIA);assert.equal(open(),false,'without motion');
 assert.equal(h.doc.documentElement.listeners.length,0);
 // destroy() too.
 await h.later();({info,open}=bubbleOf(h));h.tap(info);assert.equal(open(),true);h.selector.destroy();assert.equal(open(),false);assert.equal(h.doc.documentElement.listeners.length,0);
});

// The open bubble, the info button, the fixed « Valider » (§P) and the foot, as laid out.
function bubbleBoxes(h){
 const {level,info,hint}=bubbleOf(h);
 return {foot:level.querySelector('.explorer-foot').getBoundingClientRect(),button:info.getBoundingClientRect(),bubble:hint.getBoundingClientRect(),go:h.carousel().querySelector('.explorer-go').getBoundingClientRect()};
}
const apart=(a,b)=>a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top;
// Where the bubble must stand (§P): `beside` the info button, 8 px off towards the screen's edge, centred on its height and
// inside the foot; or `above` the « Valider » button, 8 px off, centred on it or at the band's edge. Never over it, and
// always inside the band's width.
function assertBubble(h,where,label){
 const at=bubbleBoxes(h),rtl=h.doc.documentElement.dir==='rtl';
 assert.ok(apart(at.bubble,at.go),`${label}: over the « Valider » button ${JSON.stringify(at)}`);
 assert.ok(at.bubble.left>=at.foot.left-1e-9&&at.bubble.right<=at.foot.right+1e-9,label+': inside the band\'s width');
 if(where==='beside'){
  const gap=rtl?at.button.left-at.bubble.right:at.bubble.left-at.button.right;
  assert.ok(gap>=8&&gap<9,`${label}: 8 px beside the button, towards the edge (${gap})`);
  assert.ok(at.bubble.top>=at.foot.top-1e-9&&at.bubble.bottom<=at.foot.bottom+1e-9,label+': inside the foot');
  near(at.bubble.top+at.bubble.height/2,at.button.top+at.button.height/2,.5,label+': centred on its height');
 }else{
  const gap=at.go.top-at.bubble.bottom;assert.ok(gap>=8&&gap<9,`${label}: 8 px above « Valider » (${gap})`);
  near(at.bubble.left+at.bubble.width/2,Math.min(Math.max(at.go.left+at.go.width/2,at.foot.left+at.bubble.width/2),at.foot.right-at.bubble.width/2),.5,label+': centred on it, or at the band\'s edge');
 }
 return at;
}
test('the bubble never covers the fixed « Valider » (§P, « À côté si possible »): beside the info button towards the screen\'s edge where the band leaves it room, otherwise above the « Valider » button; inside the band; placed again on a resize, a language or a pointer change',async()=>{
 // 1440: the keys hint (460 px here) fits right of the button, which ends the row 81.5 px right of the centre.
 const h=harness();h.selector.show(L1_FR);await h.later();h.tap(bubbleOf(h).info);
 let at=assertBubble(h,'beside','1440 L1');near(at.button.left+at.button.width/2,720+67.5,1e-9);assert.equal(at.bubble.left,810);
 // A resize and the language place it again: 900 px leaves 320 px right of the button, too little for 460.
 h.doc.resize({W:900});assertBubble(h,'above','900');
 h.doc.resize({W:1440});h.state.locale='en';h.selector.localize();at=assertBubble(h,'beside','1440 English');assert.equal(at.bubble.width,51*7+26);
 // Arabic: the row mirrored, the button at its left end; the bubble goes to its left, towards the screen's left edge.
 const r=harness({dir:'rtl',locale:'ar'});r.selector.show(L2_EUROPE_AR);await r.later();r.tap(bubbleOf(r).info);
 at=assertBubble(r,'beside','1440 AR');near(at.button.left+at.button.width/2,720-127.5,1e-9,'mirrored');assert.ok(at.bubble.right<at.button.left);
 // The campus level, where pass 7 found the bubble over the chip, and a short band. At 1280 px the 14 dots of Europe end
 // the row 450.5 px from the band's edge here: room for the English hint (383 px), not for the French one (460 px).
 const short={...DESKTOP,W:1280,band:369,H:259.5};
 for(const [label,screen,view,locale,where]of [['1440 L3',DESKTOP,l3France('paris'),'fr','beside'],['1280×720 L3',short,l3France(),'fr','beside'],
  ['1280×720 L2',short,L2_EUROPE_FR,'en','beside'],['1280×720 L2 FR',short,L2_EUROPE_FR,'fr','above']]){
  const d=harness({screen,locale});d.selector.show(view);await d.later();d.tap(bubbleOf(d).info);assertBubble(d,where,label);
 }
 // 390 and 320, keys and touch, every level, both directions: above « Valider », over the lower part of the centre item.
 for(const screen of [PHONE,SMALL])for(const [view,locale,dir]of [[L1_FR,'fr','ltr'],[L2_EUROPE_AR,'ar','rtl'],[l3France('lyon'),'en','ltr']]){
  const p=harness({screen,locale,dir});p.selector.show(view);await p.later();p.tap(bubbleOf(p).info);
  const label=`${screen.W} ${view.key} ${locale}`;at=assertBubble(p,'above',label);
  assert.ok(at.bubble.top>=p.current().getBoundingClientRect().top,label+': inside the band');
  p.doc.coarse.set(true);assertBubble(p,'above',label+' touch');
 }
});

test('densities: the short band gains the info button; the compact row has none and an open bubble closes when the band turns compact; below 381 px of viewport the row is count ⓘ',async()=>{
 const s=harness({screen:{...DESKTOP,band:369,H:259.5}});s.selector.show(L1_FR);
 assert.equal(s.current().dataset.density,'short');assert.equal(bubbleOf(s).info.hidden,false,'short: the button');
 const small=harness({screen:SMALL});small.selector.show(L2_EUROPE_FR);
 assert.deepEqual(small.current().querySelector('.explorer-pager').children.filter(node=>!node.hidden).map(node=>node.className),['explorer-count','explorer-info'],'320: count ⓘ');
 const c=harness({screen:LANDSCAPE});c.selector.show(L2_EUROPE_FR,{focus:true});
 const compact=bubbleOf(c);assert.equal(c.current().dataset.density,'compact');assert.equal(compact.info.hidden,true,'the compact row: no button');
 compact.info.focus();assert.notEqual(c.doc.activeElement,compact.info,'never focused');
 // A band that turns compact while the bubble is open closes it; back to normal, the button is there, closed.
 const z=harness();z.selector.show(L1_FR);await z.later();const {info,open}=bubbleOf(z);z.tap(info);assert.equal(open(),true);
 z.doc.resize({band:200,H:120});assert.equal(z.current().dataset.density,'compact');assert.equal(open(),false);assert.equal(info.hidden,true);
 z.doc.resize({band:518.7,H:411});assert.equal(info.hidden,false);assert.equal(open(),false);
});

test('the focus order: the cursor item, then the info button, then what follows the stage',()=>{
 for(const [screen,view]of [[DESKTOP,L1_FR],[PHONE,l3France('paris')],[{...DESKTOP,band:369,H:259.5},L2_EUROPE_FR],[LANDSCAPE,L2_EUROPE_FR]]){
  const h=harness({screen});h.selector.show(view,{focus:true});
  const stops=h.doc.body.querySelectorAll('button').filter(node=>node.tabIndex>=0&&!node.hidden&&!node.closest('[inert]'));
  assert.deepEqual(stops,[h.card(h.cursor()),...screen===LANDSCAPE?[]:[bubbleOf(h).info],h.outside],String(screen.W));
 }
});

test('level changes (§D): the info button is never faded; it stands still where the row keeps its width (count ⓘ at 320 px) and glides like the steps where the dots moved it',async()=>{
 const s=harness({screen:SMALL});s.selector.show(L1_FR);await s.later();s.doc.runFrames();
 const first=s.current();s.selector.show(L2_EUROPE_FR,{direction:'descend'});
 assert.equal(motions(s)['in explorer-info'],undefined,'still: not animated');assert.ok(hiddenParts(first).includes('explorer-info'),'the outgoing copy hidden at once');
 assert.deepEqual(bubbleOf(s).info.getBoundingClientRect(),first.querySelector('.explorer-info').getBoundingClientRect(),'at the same place');
 for(const screen of [DESKTOP,PHONE,SMALL,{...DESKTOP,band:369,H:259.5}]){
  const h=harness({screen});h.selector.show(L1_FR);h.selector.show(L2_EUROPE_FR,{direction:'descend'});h.selector.show(l3France(),{direction:'descend'});h.selector.show(L2_EUROPE_FR,{direction:'ascend'});
  const own=h.doc.animations.filter(animation=>animation.element.classList.contains('explorer-info'));
  assert.ok(own.every(animation=>animation.keyframes.every(frame=>!('opacity' in frame))&&animation.options.duration===420),String(screen.W));
 }
});

test('no count under the continents and countries (§K): no count node at any rank, level, size or density, nor during a drag; the chip comes right after the box; the accessible names keep the counts',async()=>{
 for(const [screen,view,locale,dir]of [[DESKTOP,L1_FR,'fr','ltr'],[DESKTOP,L2_EUROPE_FR,'fr','ltr'],[PHONE,L2_EUROPE_AR,'ar','rtl'],[SMALL,L1_AR,'ar','rtl'],[LANDSCAPE,L2_EUROPE_FR,'fr','ltr'],[{...DESKTOP,band:369,H:259.5},L1_FR,'en','ltr']]){
  const h=harness({screen,locale,dir});h.selector.show(view);await h.later();h.doc.runFrames();
  const label=`${screen.W}×${screen.band} ${view.key} ${locale}`;
  assert.equal(h.current().querySelectorAll('.explorer-meta').length,0,label);
  for(const card of h.cards()){
   assert.deepEqual(card.children.map(node=>node.className),['explorer-box','explorer-go'],`${label} ${card.dataset.id}: the chip right after the box`);
   assert.ok(!('--ms' in card.style),label);
   const item=view.items.find(entry=>entry.id===card.dataset.id),name=card.getAttribute('aria-label');
   assert.ok(name.startsWith(item.ariaLabel+' · ')&&name.includes(item.name)&&name.includes(item.countText),`${label}: ${name}`);
  }
  if(h.current().dataset.density==='compact')continue;
  h.event('pointerdown',h.cards()[0],{clientX:200});h.event('pointermove',h.carousel(),{clientX:120});h.doc.runFrames();
  assert.ok(h.cards().some(card=>card.style.transform),label+': dragged');assert.equal(h.current().querySelectorAll('.explorer-meta').length,0,label+': none during a drag');
 }
 const fr=harness();fr.selector.show(L1_FR);assert.equal(fr.card('africa').getAttribute('aria-label'),'Afrique · 6 campus · 3 pays · 1 sur 4 · Valider');
 const ar=harness({locale:'ar',dir:'rtl'});ar.selector.show(L2_EUROPE_AR);assert.equal(ar.card('FRA').getAttribute('aria-label'),'فرنسا · 8 فروع · 12 من 14');
 const l3=harness();l3.selector.show(l3France('paris'));
 assert.deepEqual(l3.card('paris').children.map(node=>node.className),['explorer-box','explorer-name','explorer-go'],'the campus names stay under the lanterns');
});

test('stylesheet (§K): no count rule (no .explorer-meta, no --ms) in any state; the campus names keep --mt',async()=>{
 const code=(await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8')).replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(code,/explorer-meta/);assert.doesNotMatch(code,/--ms\b/);
 assert.match(code,/:root #explorer \.explorer-item\[data-kind=campus\] \.explorer-name\{[^}]*transform:translateY\(var\(--mt\)\) scale\(var\(--ns\)\)/);
 assert.match(code,/:root #explorer \.explorer-item\{[^}]*display:flex;flex-direction:column/);
});

test('stylesheet (§H): the hint visually hidden until the bubble opens; the bubble above the button, inside the band; the line\'s room kept in normal bands; the button\'s target, glass and states; forced colours and reduced motion',async()=>{
 const code=(await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8')).replace(/\/\*[\s\S]*?\*\//g,'');
 const rules=[...code.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 const rule=selector=>{const found=rules.find(entry=>entry.selector===selector);assert.ok(found,selector);return found.body;};
 // Closed, in every density: the visually hidden pattern; only the open bubble shows it.
 assert.equal(rule(':root #explorer .explorer-hint:not([data-open])'),'position:absolute;inline-size:1px;block-size:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap');
 assert.doesNotMatch(code,/\]\) \.explorer-hint\{/,'no density rule of its own any more');
 const open=rule(':root #explorer .explorer-hint[data-open]');
 for(const declaration of ['position:absolute','left:var(--hint-left,0)','bottom:var(--hint-bottom,0)','box-sizing:border-box','inline-size:max-content','border:1px solid var(--control-glass-edge)'])assert.ok(open.includes(declaration),declaration);
 assert.match(rule(':root #explorer :is(.explorer-hint,.explorer-hint-room)'),/max-inline-size:100%/,'never wider than the band');
 assert.match(rule(':root #explorer .explorer-foot'),/position:relative/,'the foot (the band\'s width) holds the bubble');
 // The room: the hint's own type, invisible, in normal bands only.
 for(const selector of [':root #explorer :is(.explorer-hint,.explorer-hint-room):lang(ar)',':root #explorer :is(.explorer-hint,.explorer-hint-room) kbd',':root #explorer :is(.explorer-hint,.explorer-hint-room):lang(ar) kbd'])rule(selector);
 assert.equal(rule(':root #explorer .explorer-hint-room'),'visibility:hidden');
 assert.equal(rule(':root #explorer .explorer-level:is([data-density=short],[data-density=compact]) .explorer-hint-room'),'display:none');
 // The button: a 28 px glass circle with a 44 px target, at the row's end, gone when [hidden].
 const button=rule(':root #explorer .explorer-info');
 for(const declaration of ['flex:none','inline-size:28px','block-size:28px','border-radius:50%','border:1px solid var(--control-glass-edge)','background:var(--control-glass-surface)'])assert.ok(button.includes(declaration),declaration);
 // 44 px: 9 px around the 26 px padding box the pseudo-element is placed in (the 1 px border is inside the 28 px).
 assert.equal(rule(':root #explorer .explorer-info::before'),"content:'';position:absolute;inset:-9px");
 assert.equal(rule(':root #explorer .explorer-info[hidden]'),'display:none');
 assert.match(rule(':root #explorer .explorer-info[aria-expanded=true]'),/background:var\(--control-glass-selection\)/);
 // Nothing reorders the row: RTL mirrors it.
 for(const entry of rules.filter(entry=>/explorer-(?:pager|dots|count|info)\b/.test(entry.selector)))assert.doesNotMatch(entry.body,/(?:^|;)\s*(?:order|flex-direction):/,entry.selector);
 const forced=code.slice(code.indexOf('@media(forced-colors:active){'));
 assert.match(forced,/:root #explorer :is\([^)]*\.explorer-hint kbd,\.explorer-hint-room kbd,\.explorer-info\)\{border:1px solid ButtonText\}/);
 assert.match(forced,/:root #explorer \.explorer-info-mark,:root #explorer \.explorer-info-mark::before\{forced-color-adjust:none;background:ButtonText\}/);
 assert.match(forced,/:root #explorer \.explorer-hint\[data-open\]\{border:1px solid CanvasText\}/);
 assert.match(open,/animation:explorer-hint-in \.18s var\(--ease\)/);assert.match(code,/@keyframes explorer-hint-in\{from\{opacity:0;translate:0 5px\}\}/);
 assert.match(code,/@media\(prefers-reduced-motion:reduce\)\{[^@]*:root #explorer \.explorer-hint\{animation:none\}/);
});

// §K takes nothing else from the geometry: haloGeometry and every field the layouts give but the count's own scale (ms),
// over a grid of bands, levels, densities, cursors (whole and dragged) and directions, digested (FNV-1a over the values
// at 12 significant digits, then the text's length). 'd8cec080:3365511' is what the same function gives for the module
// before §K (pass 4 of the refinements, the evidence's layout-digest.mjs).
const LAYOUT_FIELDS=['id','off','visible','s','dist','x','y','w0','fw','fh','nk','ns','mt','lk','nx'];
function layoutDigest(module){
 let text='';
 const put=value=>{text+=(typeof value==='number'?String(Number(value.toPrecision(12))):String(value))+';';};
 const entry=item=>{for(const key of LAYOUT_FIELDS)put(item[key]);put(item.logo?.width??null);put(item.logo?.height??null);if('sr' in item)put(item.sr);};
 for(const W of [320,390,700,1024,1440])for(const H of [204,307.5,411])for(const campus of [false,true])for(const density of ['normal','short','compact']){
  const g=module.haloGeometry({W,H,campus,density});
  for(const key of Object.keys(g).sort()){put(key);put(g[key]);}
  const items=(campus?printed():named(6)).map((item,index)=>density==='compact'?{...item,width:60+index*7,height:44}:item);
  for(const rtl of [false,true]){
   for(let cursor=0;cursor<items.length;cursor++){const lay=module.layoutItems({geometry:g,items,cursorIndex:cursor,rtl,fitLogo:realFitLogo});put(lay.fade);put(lay.nmax);lay.items.forEach(entry);}
   for(let cursor=-1.5;cursor<=items.length+.5;cursor+=.375){const lay=module.continuousLayout({geometry:g,items,cursor,rtl,fitLogo:realFitLogo});put(lay.fade);put(lay.nmax);lay.items.forEach(entry);}
  }
 }
 let hash=0x811c9dc5;for(let index=0;index<text.length;index++){hash^=text.charCodeAt(index);hash=Math.imul(hash,0x01000193)>>>0;}
 return hash.toString(16).padStart(8,'0')+':'+text.length;
}
// The geometry as it stood before §U (26 Oct 2026): the line at the middle of the carousel, the same sizes and curve.
const middleLine=module=>({...module,haloGeometry(options){
 const g=module.haloGeometry(options);if(g.compact)return g;
 const line=module.haloGeometry({...options,campus:false}),middle=Math.max(8,(line.H-line.bh-78)/2-2)+line.bh;
 return {...g,top:middle-g.bh,floor0:middle};
}});
test('layouts (§K): haloGeometry and every position, scale and look of layoutItems and continuousLayout are those of the state before §K, without the count\'s ms (§U moved the line only)',()=>{
 const g=haloGeometry({W:1440,H:411}),lay=layoutItems({geometry:g,items:named(3),cursorIndex:1}),drag=selector.continuousLayout({geometry:g,items:named(3),cursor:.5});
 assert.deepEqual(Object.keys(lay.items[0]),[...LAYOUT_FIELDS,'logo'],'no count field');
 assert.deepEqual(Object.keys(drag.items[0]),[...LAYOUT_FIELDS,'logo','sr']);
 // The line put back at the middle, every value is the state's before §U, bit for bit: §U changed floor0 and top only.
 assert.equal(layoutDigest(middleLine(selector)),'d8cec080:3365511');
 assert.notEqual(layoutDigest(selector),'d8cec080:3365511','the line itself moved');
});

/* ---- 26 Oct 2026 refinements: held arrow keys follow the horizon (§L) ----------------------------------------------- */
// The selector's easing, cubic-bezier(.22,1,.36,1), stated again from its control points and solved by bisection.
function cubicBezier(x1,y1,x2,y2){
 const at=(a,b,s)=>3*(1-s)**2*s*a+3*(1-s)*s*s*b+s**3;
 return u=>{if(u<=0)return 0;if(u>=1)return 1;let low=0,high=1;for(let step=0;step<64;step++){const s=(low+high)/2;if(at(x1,x2,s)<u)low=s;else high=s;}return at(y1,y2,(low+high)/2);};
}
const EASED=cubicBezier(.22,1,.36,1);
// A sequence of moves [time, target] played in time order: the glide in force at every sample, and the samples.
function played(moves,{from=0,until=moves.at(-1)[0]+520,step=.5}={}){
 const samples=[];let glide=null,next=0;
 for(let time=0;time<=until+1e-9;time+=step){
  while(next<moves.length&&moves[next][0]<=time+1e-9){glide=selector.glideTo(glide,{from,to:moves[next][1],at:moves[next][0]});next++;}
  samples.push({time,...(glide?selector.glideAt(glide,time):{cursor:from,speed:0,done:true})});
 }
 return samples;
}

test('glideTo, glideAt: a move from rest is the selector\'s easing over 0.5 s (a press, Home / End, a click, a release); it lands exactly on its target and stays there',()=>{
 for(const [from,to]of [[0,1],[5,4],[0,13],[13,0],[.6,1],[-1.4,0],[5.3,3]]){
  const glide=selector.glideTo(null,{from,to,at:1000}),where=`${from} → ${to}`;
  assert.deepEqual(glide,{base:from,to,moves:[{at:1000,step:to-from,smooth:false}]},where);
  let previous=from;
  for(let time=0;time<=600;time+=.5){
   const at=selector.glideAt(glide,1000+time);
   if(time<500){
    near(at.cursor,from+(to-from)*EASED(time/500),1e-9,`${where} at ${time} ms`);assert.equal(at.done,false,where);
    assert.ok(Math.sign(to-from)*(at.cursor-previous)>=-1e-12,where+': monotonic');assert.ok(Math.sign(to-from)*(to-at.cursor)>=-1e-12,where+': never past it');
    // The speed is the course's slope, in items per millisecond.
    if(time>0&&time<499.5)near(at.speed,(selector.glideAt(glide,1000+time+1e-4).cursor-selector.glideAt(glide,1000+time-1e-4).cursor)/2e-4,1e-7*Math.max(1,Math.abs(to-from)),where+' speed');
   }else{assert.equal(at.cursor,to,where+': exactly its target from 500 ms on');assert.equal(at.speed,0);assert.equal(at.done,true);}
   previous=at.cursor;
  }
 }
 // The row already there: nothing to glide. An ended glide starts again from its target, with the easing itself.
 assert.equal(selector.glideTo(null,{from:3,to:3,at:0}),null);
 const ended=selector.glideTo(null,{from:0,to:1,at:0}),again=selector.glideTo(ended,{from:7,to:2,at:500});
 assert.deepEqual(again,{base:1,to:2,moves:[{at:500,step:1,smooth:false}]});
 assert.equal(selector.glideTo(again,{to:2,at:600}),again,'the same target: the same glide');
 assert.equal(selector.glideTo(ended,{to:1,at:500}),null);
});

test('glideTo, glideAt: a held key retargets the glide at every repeat with neither a jump of position nor of speed; it ends on the last target 0.5 s after the last repeat, never beyond the targets, also when the key changes',()=>{
 const start=3/.66/500;   // the speed the easing starts with, per item and millisecond: what a retarget from rest would add at once
 for(const every of [25,33,50,120,300])for(const back of [false,true]){
  const moves=[];let time=0,target=0;
  for(let n=0;n<20;n++){moves.push([time,++target]);time+=every;}
  if(back){time+=200;for(let n=0;n<20;n++){moves.push([time,--target]);time+=every;}}
  const where=`${every} ms${back?', then back':''}`,last=moves.at(-1)[0];
  // At each repeat the new glide takes over the old one exactly where and as fast as it was going; a key pressed once the
  // row rests (300 ms apart, after the 200 ms pause) starts the easing anew.
  let glide=null;const rests=[];
  for(const [at,to]of moves){
   const before=glide&&selector.glideAt(glide,at);glide=selector.glideTo(glide,{from:0,to,at});const after=selector.glideAt(glide,at);
   if(before){near(after.cursor,before.cursor,1e-12,where+' position');if(!before.done)near(after.speed,before.speed,1e-12,where+' speed');assert.equal(glide.moves.at(-1).smooth,!before.done,where);}
   if(!glide.moves.at(-1).smooth)rests.push(at);
   assert.ok(glide.moves.length<=Math.ceil(500/every)+1,where+': moves that are over join the base');
  }
  assert.deepEqual(rests,every===300&&back?[0,moves[20][0]]:[0],where);
  const samples=played(moves);
  samples.forEach((sample,index)=>{
   assert.ok(sample.cursor>=-1e-12&&sample.cursor<=20+1e-12,`${where}: ${sample.cursor} within the targets`);
   if(!index)return;
   const {cursor,speed}=samples[index-1];
   // The speed never jumps (a twentieth of what a fresh easing would add within the same half millisecond), and it only
   // changes sign when the key does.
   if(!rests.some(at=>sample.time>=at&&sample.time<=at+.5))assert.ok(Math.abs(sample.speed-speed)<=start/20,`${where} at ${sample.time} ms: ${speed} → ${sample.speed}`);
   if(!back||sample.time<moves[20]?.[0])assert.ok(sample.cursor-cursor>=-1e-12,where+': forward only');
  });
  const end=selector.glideAt(glide,last+500);
  assert.deepEqual(end,{cursor:back?0:20,speed:0,to:back?0:20,done:true},where);assert.equal(selector.glideAt(glide,last+499.9).done,false,where+': 0.5 s after the last repeat');
 }
});

// Keys and animation frames in time order on the fake clock: `keys` [[time from now in ms, key, init]], frames 1/60 s
// apart for `until` ms; each key goes to the focused element, and after each frame `check(time)` runs.
function play(h,keys,until,check=()=>{}){
 const start=h.doc.now(),events=keys.map(([time,key,init])=>({time:start+time,key,init}));
 for(let frame=1;frame*1000/60<=until+1e-9;frame++){
  const time=start+frame*1000/60;
  while(events.length&&events[0].time<=time+1e-9){const event=events.shift();h.doc.tick(event.time-h.doc.now());h.key(event.key,event.init);}
  h.doc.tick(time-h.doc.now());h.doc.runFrames();check(h.doc.now());
 }
}
// The variables and looks every item rests with (a layout without motion), to compare a glide's end with.
const rest=h=>h.cards().map(card=>[card.dataset.id,card.dataset.off,...['--x','--y','--s','--w0','--nk','--ns','--lk','--mt','--nx'].map(name=>card.style[name]),card.style.transform]);

test('a held arrow key glides along the horizon frame by frame (§L): every item on the curve where the glide puts it, none behind or across its neighbours; the cursor and the focus move at each repeat, the looks follow the nearest rank; no transition, no layout read',async()=>{
 for(const [label,screen,view,locale,dir,forward,g]of [['1440 L2',DESKTOP,L2_EUROPE_FR,'fr','ltr','ArrowRight',DESKTOP_L12],
  ['390 L2 AR',PHONE,L2_EUROPE_AR,'ar','rtl','ArrowLeft',haloGeometry({W:390,H:377.1,phone:true,campus:false,density:'normal'})],
  ['1440 L3',DESKTOP,l3France(),'fr','ltr','ArrowRight',haloGeometry({W:1440,H:411,phone:false,campus:true,density:'normal'})]]){
  const h=harness({screen,locale,dir});h.selector.show(view,{focus:true});await h.later();h.doc.runFrames();
  const level=h.current(),items=view.items,n=items.length,mirror=dir==='rtl'?-1:1,back=forward==='ArrowRight'?'ArrowLeft':'ArrowRight';
  // Held for 0.66 s (a press, then a repeat every 33 ms, past the end of a short list), let go, then the other way for 0.3 s.
  const keys=[];for(let k=0;k<21;k++)keys.push([k*33,forward,{repeat:k>0}]);for(let k=0;k<10;k++)keys.push([1200+k*33,back,{repeat:k>0}]);
  // The glide the selector should be running: each key moves the target by one, clamped, from the cursor (glideTo).
  const expected=[];let glide=null,index=0;
  for(const [time,key]of keys){const to=within(index+(key===forward?1:-1),0,n-1);if(to!==index){expected.push([time,to]);index=to;}}
  let reads=0;const {layout,size}=h.doc;h.doc.layout=element=>{reads++;return layout(element);};h.doc.size=(element,name)=>{reads++;return size(element,name);};
  const start=h.doc.now(),moves=expected.map(([time,to])=>[start+time,to]);let next=0,target=0,landed=0;
  play(h,keys,2400,time=>{
   while(next<moves.length&&moves[next][0]<=time){glide=selector.glideTo(glide,{from:target,to:moves[next][1],at:moves[next][0]});target=moves[next][1];next++;}
   const at=selector.glideAt(glide,time),where=`${label} at ${Math.round(time-start)} ms`;
   // The cursor itself: at the last key's target, focused, named « Valider »; the frames ask one frame at a time.
   assert.equal(h.cursor(),items[target].id,where);assert.equal(h.doc.activeElement,h.card(items[target].id),where);assert.match(h.card(items[target].id).getAttribute('aria-label'),locale==='ar'?/ · تأكيد$/:/ · Valider$/,where);
   assert.ok(h.doc.frames.size<=1,where);assert.ok(h.cards().every(card=>!('gliding' in card.dataset)),where+': no transition glide');
   if(at.done){
    // Landed: the variables of the rest layout, no inline transform; the fades end .35 s later.
    landed++;assert.ok(h.cards().every(card=>card.style.transform===undefined),where);assert.equal(Number.parseFloat(h.card(items[target].id).style['--x']),g.W/2,where);
    assert.equal(h.centre(),items[target].id,where);
    return;
   }
   assert.equal(level.dataset.sliding,'',where);
   assertAlong(h,g,at.cursor,mirror,where);
   // Neighbours keep their order along the row; the looks are the nearest rank's.
   const xs=h.cards().map((card,position)=>({x:dragged(card)?.x,shown:along(g,at.cursor,position,mirror).shown})).filter(entry=>entry.shown).map(entry=>entry.x*mirror);
   xs.forEach((x,position)=>{if(position)assert.ok(x>xs[position-1],where+': in order');});
   const nearest=Math.round(at.cursor);if(nearest>=0&&nearest<n)assert.equal(h.centre(),items[nearest].id,where+' looks');
  });
  assert.equal(reads,0,label+': no layout read');assert.ok(landed>0,label+': it landed');
  h.doc.layout=layout;h.doc.size=size;
  // The last target, as a layout without motion would put it; data-sliding went once the fades had ended.
  assert.equal(level.dataset.sliding,undefined,label);
  const landedOn=rest(h);h.selector.setCursor(items[target].id,{animate:false});assert.deepEqual(rest(h),landedOn,label+': exactly layoutItems\' layout');
 }
});

test('a single press, Home and End, the wheel, a click on a neighbour and setCursor glide along the horizon with the selector\'s easing; after 0.5 s the row rests exactly on layoutItems\' layout',async()=>{
 const g=DESKTOP_L12,ids=L2_EUROPE_FR.items.map(item=>item.id);
 for(const [label,from,act,to]of [['ArrowRight',3,h=>h.key('ArrowRight'),4],['ArrowLeft',3,h=>h.key('ArrowLeft'),2],['End',3,h=>h.key('End'),13],['Home',9,h=>h.key('Home'),0],
  ['the wheel',3,h=>h.wheel({deltaY:60}),4],['a click on the −2',5,h=>h.tap(h.card('BEL')),3],['setCursor',5,h=>h.selector.setCursor('PRT'),10]]){
  const h=harness();h.selector.show(L2_EUROPE_FR,{focus:true});h.selector.setCursor(ids[from],{animate:false,focus:true});await h.later();h.doc.runFrames();
  const level=h.current(),start=h.doc.now();act(h);
  assert.equal(h.cursor(),ids[to],label+': the cursor at once');assert.equal(level.dataset.sliding,'',label);
  for(let frame=1;frame<=36;frame++){
   h.frame();const elapsed=h.doc.now()-start,where=`${label} at ${Math.round(elapsed)} ms`;
   if(elapsed<500){assertAlong(h,g,from+(to-from)*EASED(elapsed/500),1,where);continue;}
   assert.ok(h.cards().every(card=>card.style.transform===undefined),where+': at rest');assert.equal(Number.parseFloat(h.card(ids[to]).style['--x']),720,where);
  }
  assert.equal(level.dataset.sliding,'',label+': its fades end within .35 s');h.doc.tick(300);assert.equal(level.dataset.sliding,undefined,label);
  const glided=rest(h),jump=harness();jump.selector.show(L2_EUROPE_FR);jump.selector.setCursor(ids[to],{animate:false});
  assert.deepEqual(glided,rest(jump),label+': the layout without motion');
 }
});

test('a drag during a glide takes it over where it stands, then follows the pointer from there; a key during the glide after a drag retargets it without a jump',async()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR,{focus:true});await h.later();h.doc.runFrames();
 const level=h.current(),carousel=h.carousel(),g=DESKTOP_L12,ids=L2_EUROPE_FR.items.map(item=>item.id);
 // ArrowRight, then the pointer goes down on the moving row and drags it 90 ms later, past the 8 px threshold.
 const pressed=h.doc.now();h.key('ArrowRight');const glide=selector.glideTo(null,{from:0,to:1,at:pressed});
 for(let n=0;n<4;n++)h.frame();
 h.event('pointerdown',h.card('DEU'),{clientX:900,clientY:500});h.frame();h.doc.tick(8);
 const taken=selector.glideAt(glide,h.doc.now()).cursor;assert.ok(taken>.5&&taken<1,String(taken));
 h.event('pointermove',carousel,{clientX:888,clientY:501});
 assert.equal(level.dataset.dragging,'true');assert.equal(level.dataset.sliding,undefined,'the glide gives the row to the drag');
 h.doc.runFrames();assertAlong(h,g,taken,1,'taken over where it stood: no jump');
 h.frame();assertAlong(h,g,taken,1,'the glide writes nothing more');
 h.event('pointermove',carousel,{clientX:888+.8*g.x1,clientY:501});h.frame();assertAlong(h,g,taken-.8,1,'then the pointer carries it');
 // A key during the drag moves the cursor, not the row: the pointer holds it until the release decides (§C).
 h.key('ArrowRight');assert.equal(h.cursor(),'AUT');assert.equal(level.dataset.sliding,undefined);h.frame();assertAlong(h,g,taken-.8,1,'still under the pointer');
 // Released: the item nearest to the pointer; the row glides on from where it was drawn.
 h.event('pointerup',carousel,{clientX:888+.8*g.x1,clientY:501});const released=h.doc.now(),c=taken-.8;
 assert.equal(h.cursor(),ids[Math.round(c)]);assert.equal(level.dataset.sliding,'');
 let expected=selector.glideTo(null,{from:c,to:Math.round(c),at:released});
 h.frame();h.frame();assertAlong(h,g,selector.glideAt(expected,h.doc.now()).cursor,1,'the glide after the drag');
 // A key during that glide only moves its target: the row goes on from where it is, as fast as it was going.
 const before=selector.glideAt(expected,h.doc.now());h.key('ArrowRight');expected=selector.glideTo(expected,{from:Math.round(c),to:Math.round(c)+1,at:h.doc.now()});
 near(selector.glideAt(expected,h.doc.now()).cursor,before.cursor,1e-12);near(selector.glideAt(expected,h.doc.now()).speed,before.speed,1e-12);
 assert.equal(h.cursor(),ids[Math.round(c)+1]);
 for(let n=0;n<20;n++){h.frame();const at=selector.glideAt(expected,h.doc.now());if(!at.done)assertAlong(h,g,at.cursor,1,'retargeted');}
 h.glide();assert.equal(Number.parseFloat(h.card(ids[Math.round(c)+1]).style['--x']),720);assert.ok(h.cards().every(card=>card.style.transform===undefined));
 // A drag that starts once the glide has ended, its last frame not drawn yet, starts from the cursor as at rest (§C).
 h.key('ArrowRight');h.doc.tick(600);
 h.event('pointerdown',h.card(ids[Math.round(c)+2]),{clientX:700});h.event('pointermove',carousel,{clientX:700-g.x1/4});h.doc.runFrames();
 assertAlong(h,g,Math.round(c)+2+.25,1,'at rest');h.event('pointerup',carousel,{clientX:700-g.x1/4});
});

test('a level change during a glide leaves the outgoing row where it was painted; a resize or a language switch during one settles it at once on the new layout',async()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});await h.later();h.doc.runFrames();
 h.onValidate=()=>h.selector.show(L2_EUROPE_FR,{direction:'descend',focus:true});
 h.key('ArrowRight');h.frame();h.frame();h.frame();
 const first=h.current(),cards=h.cards(),painted=cards.map(card=>card.style.transform);assert.ok(painted.every(Boolean));
 // Enter validates the cursor (Amériques), wherever the row is.
 h.press('Enter');assert.deepEqual(h.calls.validate,[{kind:'continent',id:'americas'}]);assert.equal(first.dataset.state,'leaving');
 for(let n=0;n<40;n++)h.frame();
 assert.deepEqual(cards.map(card=>card.style.transform),painted,'frozen as painted: the glide writes nothing more');
 assert.ok(h.cards().every(card=>card.style.transform===undefined),'the new level lays out at once');assert.equal(h.current().dataset.sliding,undefined);
 // A resize, a language switch: the instant layout ends the glide where it is and puts the row on its new layout.
 for(const [label,act]of [['resize',z=>z.doc.resize({H:300})],['language',z=>{z.state.locale='en';z.selector.localize();}]]){
  const z=harness();z.selector.show(L2_EUROPE_FR,{focus:true});await z.later();z.doc.runFrames();
  z.key('End');z.frame();z.frame();assert.ok(z.cards().some(card=>card.style.transform));
  act(z);const level=z.current();
  assert.equal(level.dataset.instant,'',label);assert.equal(level.dataset.sliding,undefined,label);assert.ok(z.cards().every(card=>card.style.transform===undefined),label);
  assert.equal(Number.parseFloat(z.card('CZE').style['--x']),720,label);assert.equal(z.centre(),'CZE',label);
  const settled=rest(z);for(let n=0;n<40;n++)z.frame();assert.deepEqual(rest(z),settled,label+': nothing glides on');
 }
});

test('reduced motion: every move jumps where with motion it glides along the horizon; the compact row keeps its straight glide by transitions',async()=>{
 for(const reduced of [true,false]){
  const r=harness({reduced});r.selector.show(L2_EUROPE_FR,{focus:true});r.doc.runFrames();
  for(const [label,act,to]of [['ArrowRight',()=>r.key('ArrowRight'),'DEU'],['End',()=>r.key('End'),'CZE'],['the wheel',()=>r.wheel({deltaY:-60}),'CHE'],
   ['a click',()=>r.tap(r.card('PRT')),'PRT'],['setCursor',()=>r.selector.setCursor('ITA'),'ITA']]){
   const where=`${label}${reduced?'':', with motion'}`;
   r.doc.tick(200);act();
   assert.equal(r.cursor(),to,where);assert.ok(r.cards().every(card=>!('gliding' in card.dataset)),where);
   if(!reduced){assert.equal(r.current().dataset.sliding,'',where);assert.equal(r.doc.frames.size,1,where+': its frames');continue;}
   assert.equal(r.doc.frames.size,0,where+': no frame asked');assert.equal(r.current().dataset.sliding,undefined,where);
   assert.ok(r.cards().every(card=>card.style.transform===undefined),where);
   assert.equal(r.centre(),to,where+': the looks at once');assert.equal(Number.parseFloat(r.card(to).style['--x']),720,where);
  }
 }
 const c=harness({screen:LANDSCAPE});c.selector.show(L2_EUROPE_FR,{focus:true});c.doc.runFrames();
 c.key('ArrowRight');
 assert.equal(c.cursor(),'DEU');assert.equal(c.centre(),'DEU');assert.equal(Number.parseFloat(c.card('DEU').style['--x']),333.5,'the row\'s new places at once, which its transitions reach');
 assert.ok(c.cards().filter(card=>'gliding' in card.dataset).length>0);assert.equal(c.current().dataset.sliding,undefined);
 assert.equal(c.doc.frames.size,0);assert.ok(c.cards().every(card=>card.style.transform===undefined));
});

test('a move repaints only what changed (§L): a held key repaints the level at every repeat, and a text or an attribute written again unchanged makes the browser restyle when the focus moves',()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR,{focus:true});h.doc.runFrames();
 // Every item carries its tabindex as an attribute, the first cursor too (a button's default is 0 without one).
 assert.deepEqual(h.cards().map(card=>card.getAttribute('tabindex')),['0',...Array(13).fill('-1')]);
 const level=h.current(),writes=[],text=Object.getOwnPropertyDescriptor(FakeElement.prototype,'textContent');
 const watch=(node,label)=>{
  const set=node.attrs.set.bind(node.attrs);node.attrs.set=(key,value)=>{writes.push(`${label} ${key}`);return set(key,value);};
  Object.defineProperty(node,'textContent',{configurable:true,get(){return text.get.call(this);},set(value){writes.push(label+' text');text.set.call(this,value);}});
 };
 for(const card of h.cards()){watch(card,card.dataset.id);watch(card.querySelector('.explorer-name'),card.dataset.id+' name');watch(card.querySelector('.explorer-go-label'),card.dataset.id+' chip');}
 for(const name of ['.explorer-prompt-text','.explorer-count','.explorer-carousel','.explorer-info','.explorer-hint-keys','.explorer-hint-touch','.explorer-step'])watch(level.querySelector(name),name);
 h.key('ArrowRight');
 assert.deepEqual(writes.sort(),['.explorer-count text','ALB aria-label','ALB tabindex','DEU aria-label','DEU tabindex']);
 writes.length=0;for(let n=0;n<5;n++)h.key('ArrowRight',{repeat:true});
 assert.equal(writes.filter(entry=>/ (text|aria-label|tabindex)$/.test(entry)).length,5*5,'per repeat: the count, and the old and new cursors\' names and tabindex');
 // A new language still repaints every text.
 writes.length=0;h.state.locale='en';h.selector.localize();
 assert.ok(h.cards().every(card=>writes.includes(card.dataset.id+' chip text')&&writes.includes(card.dataset.id+' aria-label')));
});

test('stylesheet (§L): a glide along the horizon transitions no transform; its looks keep a drag\'s very fades under data-sliding; only the compact row glides by transitions',async()=>{
 const code=(await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8')).replace(/\/\*[\s\S]*?\*\//g,'');
 const rules=[...code.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 const slide=':root #explorer .explorer-level[data-sliding] .explorer-item',drag=':root #explorer .explorer-level[data-dragging]:not([data-density=compact]) .explorer-item';
 const under=prefix=>rules.filter(rule=>rule.selector.startsWith(prefix)).map(rule=>[rule.selector.slice(prefix.length),rule.body]);
 assert.deepEqual(under(slide),under(drag),'the drag\'s fades');assert.equal(under(slide).length,3,'the items, names and dots (no chip since §P)');
 for(const rule of rules.filter(entry=>/data-sliding/.test(entry.selector))){
  if(!/explorer-go/.test(rule.selector))assert.doesNotMatch(rule.body,/transform \./,rule.selector);assert.doesNotMatch(rule.body,/will-change/,rule.selector);
 }
 // The transition glide of the items is the compact row's alone now: no rule gives a transform transition to an item or
 // its name, logo or chip but under data-gliding, which only the compact row gets.
 for(const rule of rules.filter(entry=>/explorer-item/.test(entry.selector)&&/transition:[^;]*transform \.5s/.test(entry.body)))assert.match(rule.selector,/\[data-gliding\]/,rule.selector);
 assert.doesNotMatch(code,/data-gliding=/);
});

/* ---- 26 Oct 2026: the user's answers to the last open points: a tight bubble (§H), a fixed « Valider » button (§P) ---- */
test('stylesheet (§H, « Resserrer la bulle »): the open bubble keeps 4 px above and below its text; the selector places it in the foot (§P)',async()=>{
 const code=(await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8')).replace(/\/\*[\s\S]*?\*\//g,'');
 const rules=[...code.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 const open=rules.find(entry=>entry.selector===':root #explorer .explorer-hint[data-open]').body;
 const value=name=>open.split(';').find(declaration=>declaration.startsWith(name+':'))?.slice(name.length+1);
 assert.equal(value('padding'),'4px 12px','4 px above and below the text, 12 px at its sides as before');
 assert.equal(value('border'),'1px solid var(--control-glass-edge)');
 assert.deepEqual([value('left'),value('bottom')],['var(--hint-left,0)','var(--hint-bottom,0)'],'placed by the selector: beside the info button or above « Valider »');
});

// The fixed « Valider » (§P): the button the selector moves into the current level's track, and its box.
const fixedGo=h=>h.carousel().querySelector('.explorer-track').children.find(node=>node.classList.contains('explorer-go'));
const goBox=h=>{const go=fixedGo(h);return {go,y:go.style['--go-y'],hidden:go.hidden,rect:go.getBoundingClientRect(),styles:Object.keys(go.style).filter(name=>name!=='--go-y')};};
// Where the campus level puts its cursor's chip (the pre-pass state, stated from its layout): the cursor's top (its y in
// the track, less the bleed), its lantern (bh), the one-line name (10 px of margin, 1.12 × F at the stylesheet's F), the
// chip's 12 px margin.
function campusChipTop(W,H,density='normal',phone=W<700){
 const g=haloGeometry({W,H,phone,campus:true,density}),lay=layoutItems({geometry:g,items:printed(),cursorIndex:2,fitLogo:realFitLogo});
 return lay.items[2].y-170+g.bh+10+1.12*Math.round(g.F*100)/100+12;
}

test('the fixed « Valider » (§P): one button for every level, in the current level\'s track between the pool and the items, at the place the campus level gives its chip under the logo and a one-line name; the same box at L1, L2 and L3 of a band, language and density',async()=>{
 // The campus level's chip place: the common floor (§I), 22 px of margins and the name's line. Chrome measured the pre-pass
 // L3 chip and this button at the very same boxes (26 Oct 2026), e.g. 1440×900 FR: 670.75, 543.609375, 98.484375 × 36.
 // Since §U the floor comes down until this button ends on the carousel's bottom edge (H − 36) in these bands.
 for(const [W,H,density]of [[1440,411,'normal'],[1440,395.1,'normal'],[1280,259.5,'short'],[1024,307.5,'normal'],[768,538.6,'normal'],[390,377.1,'normal'],[390,359.2,'normal'],[320,204,'short'],[320,191,'short']]){
  near(selector.goTop({W,H,density}),campusChipTop(W,H,density),1e-9,`${W}×${H}`);
 }
 near(selector.goTop({W:1440,H:411}),328.36+22+24.64,1e-9,'1440 FR: floor0 328.36 (289.5 + 38.86), F 22');near(selector.goTop({W:1280,H:259.5,density:'short'}),181.34+22+20.16,1e-9,'1280×720: floor0 181.34 (164.5 + 16.84), F 18');
 near(selector.goTop({W:320,H:204,density:'short'}),125.84+22+20.16,1e-9,'320×640: floor0 125.84 (109 + 16.84), F 18');
 near(selector.goTop({W:768,H:538.6}),393.3+22+24.64,1e-9,'768×1024: floor0 393.3 (353.3 + 40), F 22');assert.equal(selector.goTop({W:667,H:76.2,density:'compact'}),null,'none in the compact row');
 for(const [screen,locale,dir,l1,l2]of [[DESKTOP,'fr','ltr',L1_FR,L2_EUROPE_FR],[PHONE,'ar','rtl',L1_AR,L2_EUROPE_AR],[SMALL,'en','ltr',L1_FR,L2_EUROPE_FR],[{...DESKTOP,W:1280,band:369,H:259.5},'fr','ltr',L1_FR,L2_EUROPE_FR]]){
  const h=harness({screen,locale,dir}),label=`${screen.W}×${screen.band} ${locale}`;h.selector.show(l1,{focus:true});
  const first=goBox(h);
  assert.equal(first.y,Math.round((170+selector.goTop({W:screen.W,H:screen.H,density:h.current().dataset.density}))*1e4)/1e4+'px',label+': at the campus level\'s chip place (track coordinates)');
  assert.equal(first.hidden,false,label);assert.deepEqual(first.styles,[],label+': no other inline style');
  assert.deepEqual(fixedGo(h).parentNode.children.map(node=>node.getAttribute('class')),['explorer-horizon','explorer-pool','explorer-go','explorer-items'],label);
  for(const [view,direction]of [[l2,'descend'],[l3France(),'descend'],[l2,'ascend'],[l1,'ascend']]){
   h.selector.show(view,{direction,focus:true});const at=goBox(h),where=`${label} ${view.key} (${direction})`;
   assert.equal(at.go,first.go,where+': the same button, kept across the views');assert.deepEqual([at.y,at.hidden,at.rect,at.styles],[first.y,first.hidden,first.rect,first.styles],where+': the same box');
   const all=h.doc.documentElement.querySelectorAll('.explorer-go').filter(node=>!node.closest('.explorer-item'));assert.deepEqual(all,[first.go],where+': no copy');
   await h.finish();
  }
  // Language: the label follows; the button stays.
  h.state.locale='en';h.selector.localize();assert.equal(fixedGo(h).textContent,'Select');assert.equal(goBox(h).y,first.y);
  h.state.locale='ar';h.selector.localize();assert.equal(fixedGo(h).textContent,'تأكيد');
 }
 // Its parts: the enter icon and the label of the cursor's « Valider », hidden from assistive technology.
 const h=harness();h.selector.show(L1_FR);const go=fixedGo(h);
 assert.equal(go.localName,'span');assert.equal(go.getAttribute('aria-hidden'),'true');assert.equal(go.getAttribute('tabindex'),null);assert.equal(go.getAttribute('role'),null);
 assert.deepEqual(go.children.map(node=>node.getAttribute('class')),['hx-icon','explorer-go-label']);assert.equal(go.children[0].getAttribute('data-icon'),'enter');assert.equal(go.textContent,'Valider');
});

test('the fixed « Valider » never moves, fades or hides (§P): held keys (no fast-glide hiding any more), a single press, Home and End, the wheel, a click on a neighbour, a drag and its release, the level changes; L3 → sheet → L3 keeps the whole-view motion',async()=>{
 for(const [label,screen,view,locale,dir,forward]of [['1440 L2',DESKTOP,L2_EUROPE_FR,'fr','ltr','ArrowRight'],['390 L2 AR',PHONE,L2_EUROPE_AR,'ar','rtl','ArrowLeft'],['1440 L3',DESKTOP,l3France(),'fr','ltr','ArrowRight'],['320 L3',SMALL,l3France(),'en','ltr','ArrowRight']]){
  const h=harness({screen,locale,dir});h.selector.show(view,{focus:true});await h.later();h.doc.runFrames();
  const level=h.current(),still=goBox(h),from=h.doc.animations.length;
  const same=where=>{const at=goBox(h);assert.equal(at.go,still.go,where);assert.deepEqual([at.y,at.hidden,at.rect,at.styles],[still.y,false,still.rect,[]],where);assert.equal('fast' in level.dataset,false,where+': no fast-glide flag');};
  // Held 0.66 s, then the other way: checked at every frame.
  const back=forward==='ArrowRight'?'ArrowLeft':'ArrowRight',keys=[];for(let k=0;k<21;k++)keys.push([k*33,forward,{repeat:k>0}]);for(let k=0;k<10;k++)keys.push([900+k*33,back,{repeat:k>0}]);
  let frames=0;play(h,keys,1800,time=>{frames++;same(`${label} held key at ${Math.round(time)}`);});assert.ok(frames>100);
  for(const [what,act]of [['End',()=>h.key('End')],['Home',()=>h.key('Home')],['a press',()=>h.key(forward)],['the wheel',()=>h.wheel({deltaY:60})],['a click on a neighbour',()=>h.tap(h.cards().find(card=>card.dataset.off==='1'||card.dataset.off==='-1'))]]){
   act();for(let n=0;n<40;n++){h.frame();same(`${label} ${what}, frame ${n}`);}
  }
  // A drag from the centre, frame by frame, and its release glide.
  h.event('pointerdown',h.card(h.cursor()),{clientX:screen.W/2,clientY:500});
  for(let n=1;n<=24;n++){h.event('pointermove',h.carousel(),{clientX:screen.W/2-n*14,clientY:501});h.frame();same(`${label} drag ${n}`);}
  assert.equal(level.dataset.dragging,'true');h.event('pointerup',h.carousel(),{clientX:screen.W/2-24*14,clientY:501});
  for(let n=0;n<40;n++){h.frame();same(`${label} after the drag ${n}`);}
  assert.deepEqual(h.doc.animations.slice(from).filter(animation=>animation.element.contains(still.go)),[],label+': nothing animated holds it');
 }
 // Level changes: nothing animates the button or a part that holds it; it stands at its place in the incoming level.
 const h=harness();h.selector.show(L1_FR,{focus:true});await h.later();const still=goBox(h);
 for(const [view,direction]of [[L2_EUROPE_FR,'descend'],[l3France('paris'),'descend'],[L2_EUROPE_FR,'ascend'],[L1_FR,'ascend']]){
  const from=h.doc.animations.length;h.selector.show(view,{direction,focus:true});
  assert.ok(h.doc.animations.length>from,view.key+': the level changed with motion');
  assert.deepEqual(h.doc.animations.slice(from).filter(animation=>animation.element.contains(still.go)),[],view.key+': never faded nor moved');
  assert.deepEqual([goBox(h).rect,goBox(h).y],[still.rect,still.y],view.key);await h.finish();
 }
 // L3 → sheet: the sheet replaces the whole selector; the button leaves with the L3 level. Back on L3, it stands at its place.
 h.selector.show(l3France('paris'),{direction:'descend',focus:true});await h.later();const l3=h.current();
 h.selector.show(campusView('paris'),{direction:'descend',focus:true});assert.ok(l3.contains(still.go),'it leaves with the L3 level');
 await h.finish();await h.later();assert.equal(still.go.isConnected,false);
 h.selector.show(l3France('paris'),{direction:'ascend',focus:true});assert.equal(fixedGo(h),still.go);assert.deepEqual([goBox(h).rect,goBox(h).y],[still.rect,still.y],'back on L3');
});

test('a click or a tap on the fixed « Valider » validates the cursor, during a glide its target as Enter does; its press leaves the focus on the cursor item; a double click\'s second click, a click within 350 ms of a level change and the click after a drag do nothing',async()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});await h.later();h.doc.runFrames();
 h.onValidate=target=>h.selector.show(target.kind==='continent'?L2_EUROPE_FR:l3France(),{direction:'descend',focus:h.root.contains(h.doc.activeElement)});
 // During a glide: the row still near Afrique, the cursor (the target) on Amériques.
 h.key('ArrowRight');h.frame();h.frame();assert.equal(h.centre(),'africa');assert.equal(h.cursor(),'americas');
 // The press leaves the focus where a press on the cursor's chip put it. The cursor item has it: it keeps it (and its ring).
 assert.equal(h.doc.activeElement,h.card('americas'));assert.equal(h.event('mousedown',fixedGo(h),{detail:1}).defaultPrevented,true);assert.equal(h.doc.activeElement,h.card('americas'));
 // Elsewhere, the stage the browser focuses for the press hands the focus over to the cursor item (as a pointer focus).
 h.outside.focus();assert.equal(h.event('mousedown',fixedGo(h),{detail:1}).defaultPrevented,false);
 h.root.focus();h.event('focusin',h.root);assert.equal(h.doc.activeElement,h.card('americas'));
 // The stage focused without a press on the button keeps the focus.
 h.doc.tick(1);h.root.focus();h.event('focusin',h.root);assert.equal(h.doc.activeElement,h.root);
 h.outside.focus();h.event('mousedown',fixedGo(h),{detail:1});h.doc.tick(1);h.root.focus();h.event('focusin',h.root);assert.equal(h.doc.activeElement,h.root,'only the press\'s own focus');
 h.card('americas').focus();
 h.tap(fixedGo(h));assert.deepEqual(h.calls.validate,[{kind:'continent',id:'americas'}],'the target');
 assert.equal(h.current().dataset.level,'countries');assert.equal(h.doc.activeElement,h.card('ALB'),'the focus handed over to the next level');
 // The second click of a double click, and any click within 350 ms of the new level, belong to the gesture that opened it.
 h.tap(fixedGo(h),{detail:2});h.tap(fixedGo(h));assert.equal(h.calls.validate.length,1);
 await h.later();h.tap(fixedGo(h),{detail:2});assert.equal(h.calls.validate.length,1,'detail 2');
 // A drag that starts on it moves the row; its click is swallowed.
 const go=fixedGo(h);h.event('pointerdown',go,{clientX:720,clientY:560});
 for(let n=1;n<=6;n++){h.event('pointermove',h.carousel(),{clientX:720-n*40,clientY:561});h.frame();}
 h.event('pointerup',h.carousel(),{clientX:480,clientY:561});assert.notEqual(h.cursor(),'ALB','the drag moved the cursor');
 h.event('click',go,{detail:1});assert.equal(h.calls.validate.length,1,'the click after a drag is swallowed');
 // A plain click validates the cursor; a detail-0 click (a script) too.
 h.glide();await h.later();const cursor=h.cursor();h.tap(fixedGo(h));assert.deepEqual(h.calls.validate.at(-1),{kind:'country',id:cursor});
 await h.later();fixedGo(h).click();assert.equal(h.calls.validate.length,3);assert.equal(h.calls.announce.length,0,'never announced');
});

test('keyboards and screen readers keep the cursor item (§P): one tab stop per level, Enter or Space validates, its name keeps « Valider »; the fixed button is no tab stop, never focused, hidden from assistive technology',()=>{
 for(const [screen,view,locale,dir,select]of [[DESKTOP,L1_FR,'fr','ltr','Valider'],[PHONE,L2_EUROPE_AR,'ar','rtl','تأكيد'],[SMALL,l3France('paris'),'en','ltr','Select']]){
  const h=harness({screen,locale,dir});h.selector.show(view,{focus:true});const label=`${screen.W} ${view.key}`;
  const stops=h.doc.body.querySelectorAll('button,[tabindex]').filter(node=>node.tabIndex>=0&&!node.hidden&&!node.closest('[inert]'));
  assert.deepEqual(stops,[h.card(h.cursor()),bubbleOf(h).info,h.outside],label+': the cursor item, the info button, then what follows the stage');
  assert.ok(h.card(h.cursor()).getAttribute('aria-label').endsWith(' · '+select),label);
  assert.ok(h.cards().filter(card=>card.tabIndex===0).length===1,label);
  const go=fixedGo(h);assert.equal(go.closest('[aria-hidden="true"]'),go,label+': hidden from assistive technology');assert.notEqual(go.localName,'button');assert.equal(go.querySelectorAll('[id]').length,0);
  h.key(dir==='rtl'?'ArrowLeft':'ArrowRight');assert.ok(h.card(h.cursor()).getAttribute('aria-label').endsWith(' · '+select),label+' after a move');assert.equal(h.doc.activeElement,h.card(h.cursor()));
  const target=h.cursor();h.press(' ');assert.deepEqual(h.calls.validate,[{kind:view.items[0].kind,id:target}],label+': Space validates the cursor');
  assert.notEqual(h.doc.activeElement,go,label);assert.equal(h.calls.announce.length,0,label);
 }
});

test('the centre item hovered deepens the fixed « Valider »\'s shadow (data-hover, §P), as it did its own chip: not a neighbour, the button itself (its own :hover) or the stage; under a resting pointer it follows the rank through a glide, a jump and a level change, written on a change only',async()=>{
 const h=harness();h.selector.show(L2_EUROPE_FR,{focus:true});await h.later();h.doc.runFrames();
 const go=fixedGo(h),hover=()=>'hover' in go.dataset,over=target=>h.event('pointerover',target),writes=[];
 const {set,delete:remove}=go.attrs;
 go.attrs.set=function(name,value){if(name==='data-hover')writes.push('set');return set.call(this,name,value);};
 go.attrs.delete=function(name){if(name==='data-hover'&&this.has(name))writes.push('delete');return remove.call(this,name);};
 assert.equal(hover(),false);
 over(h.card('ALB').querySelector('.explorer-name'));assert.equal(hover(),true,'the centre item, from one of its parts');
 over(h.card('DEU'));assert.equal(hover(),false,'a neighbour');
 over(h.card('ALB'));assert.equal(hover(),true);
 over(go.querySelector('.explorer-go-label'));assert.equal(hover(),false,'the button itself: its own :hover');
 over(h.card('ALB'));h.event('pointerleave',h.root,{bubbles:false});assert.equal(hover(),false,'the pointer left the stage');
 // A resting pointer over the centre item: the row glides under it and the flag follows that item's rank, frame by frame.
 over(h.card('ALB'));writes.length=0;h.key('ArrowRight');
 let left=null;
 for(let n=0;n<60;n++){h.frame();const rank=h.card('ALB').dataset.off;assert.equal(hover(),rank==='0',`frame ${n}`);if(rank!=='0'&&left===null)left=n;}
 assert.ok(left>0,'it left the centre during the glide');assert.deepEqual(writes,['delete'],'written once, when it changed');
 over(h.card('DEU'));assert.equal(hover(),true,'the new centre');
 // A level change: the hovered item belongs to the outgoing level.
 h.selector.show(l3France(),{direction:'descend',focus:true});assert.equal(hover(),false,'a level change');
 over(h.card('angouleme'));assert.equal(hover(),true);await h.finish();
 // Without motion the move jumps, and the flag with it.
 const r=harness({reduced:true});r.selector.show(L1_FR,{focus:true});const still=fixedGo(r);
 r.event('pointerover',r.card('africa'));assert.equal('hover' in still.dataset,true);
 r.key('ArrowRight');assert.equal('hover' in still.dataset,false,'reduced motion');
});

test('compact row (§P): the fixed button is hidden and the cursor keeps its own chip in flow after its name, as before; a band that turns compact hides the button, one that leaves the compact row shows it again at its place',async()=>{
 const c=harness({screen:LANDSCAPE});c.selector.show(L2_EUROPE_FR,{focus:true});
 assert.equal(c.current().dataset.density,'compact');assert.equal(fixedGo(c).hidden,true);assert.equal(c.carousel().querySelector('.explorer-track').children.filter(node=>node.classList.contains('explorer-go')&&!node.hidden).length,0);
 assert.deepEqual(c.card('ALB').children.map(node=>node.className),['explorer-box','explorer-go'],'the cursor\'s own chip');assert.equal(c.card('ALB').querySelector('.explorer-go-label').textContent,'Valider');
 const h=harness();h.selector.show(L1_FR);const at=goBox(h);
 h.doc.resize({band:200,H:120});assert.equal(h.current().dataset.density,'compact');assert.equal(fixedGo(h).hidden,true);
 h.doc.resize({band:518.7,H:411});assert.equal(fixedGo(h).hidden,false);assert.deepEqual([goBox(h).y,goBox(h).rect],[at.y,at.rect]);
});

test('stylesheet (§P): the fixed button in the track, centred by its auto margins at --go-y, a pointer target with the chip\'s look; decision A\'s ring on it while an item has the keyboard focus (Highlight in forced colours); its icon mirrored in RTL, a ButtonText edge in forced colours; nothing moves, fades or hides it; the items\' chips only at the compact row\'s cursor; no fast-glide rule',async()=>{
 const code=(await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8')).replace(/\/\*[\s\S]*?\*\//g,'');
 const rules=[...code.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 const rule=selector=>{const found=rules.find(entry=>entry.selector===selector);assert.ok(found,selector);return found.body;};
 assert.equal(rule(':root #explorer .explorer-track>.explorer-go'),'position:absolute;inset-inline:0;top:var(--go-y);inline-size:max-content;margin-inline:auto;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent');
 const look=rule(':root #explorer .explorer-go');
 for(const declaration of ['display:inline-flex','block-size:36px','padding:0 16px 0 13px','border-radius:999px','background:var(--hx-go-bg)','color:var(--hx-go-ink)','box-shadow:var(--hx-go-shadow)'])assert.ok(look.includes(declaration),declaration);
 assert.doesNotMatch(look,/position|visibility|opacity|transform|margin/,'the chip\'s look only');
 assert.equal(rule(':root #explorer .explorer-track>.explorer-go[hidden],:root #explorer .explorer-item .explorer-go'),'display:none');
 assert.equal(rule(':root #explorer .explorer-level[data-density=compact] .explorer-item[data-off="0"] .explorer-go'),'position:relative;display:inline-flex');
 // The focus cue: decision A's ring, on the fixed button while an item of the items layer that follows it has
 // :focus-visible (the button is the :has() subject; the selector keeps the layer right after it).
 const ring=':root #explorer .explorer-track>.explorer-go:has(+.explorer-items>.explorer-item:focus-visible)';
 assert.equal(rule(ring),'outline:var(--hx-focus-ring-width) solid var(--hx-focus);outline-offset:var(--hx-focus-ring-offset)');
 assert.match(code,/@media \(forced-colors: active\)\{:root #explorer \.explorer-track>\.explorer-go:has\(\+\.explorer-items>\.explorer-item:focus-visible\)\{outline-color:Highlight\}\}/);
 // Its hover shadow: hovered, or data-hover (the centre item hovered, kept by the selector), on devices that hover.
 assert.match(code,/@media\(hover:hover\)\{:root #explorer \.explorer-track>\.explorer-go:is\(:hover,\[data-hover\]\),[^{}]*\{box-shadow:0 10px 26px color-mix\(in srgb,var\(--hx-go-bg\) 42%,transparent\)\}\}/);
 // Performance (Chrome, 26 Oct 2026, 1440×900 L2, held key): a :has() anchored on the track, the level or the stage made
 // every focus move restyle the track's whole subtree (309 elements a step), and one on the items' data-off the whole
 // level at every frame of a glide (584); the button as the :has() subject restyles the button alone.
 for(const [,selector]of code.matchAll(/([^{}]+)\{[^{}]*\}/g))for(const part of selector.split(/,(?![^()]*\))/)){
  const anchor=/([^\s>+~]+):has\(/.exec(part)?.[1]??'';
  if(/explorer-(?:track|carousel|level|items)\b|#explorer$/.test(anchor))assert.fail('a :has() above the items: '+part.trim());
  if(/:has\([^)]*data-off/.test(part))assert.fail('a :has() on the items\' data-off: '+part.trim());
 }
 assert.match(code,/\[dir=rtl\] #explorer \.explorer-go svg\{transform:scaleX\(-1\)\}/);
 assert.match(code.slice(code.indexOf('@media(forced-colors:active){')),/:root #explorer :is\(\.explorer-go,[^)]*\)\{border:1px solid ButtonText\}/);
 // Nothing transitions, animates, fades, hides or transforms the fixed button; no fast glide, no chip fade in glides or drags.
 // (A rule's subject: its selector parts, split outside parentheses, with the pseudo-classes' arguments set aside.)
 const subject=part=>part.trim().replace(/\((?:[^()]|\([^()]*\))*\)/g,'()');
 const own=rules.filter(entry=>entry.selector.split(/,(?![^()]*\))/).some(part=>/\.explorer-go(?:\[[^\]]*\]|:[\w-]+(?:\(\))?)*$/.test(subject(part))&&!/\.explorer-item/.test(subject(part))));
 assert.ok(own.length>=6,own.map(entry=>entry.selector).join(' | '));
 for(const entry of own)assert.doesNotMatch(entry.body,/transition|animation|opacity|visibility|transform/,entry.selector);
 assert.doesNotMatch(code,/data-fast/);assert.doesNotMatch(code,/data-(?:gliding|sliding|dragging)[^{},]*explorer-go/);
});

/* ---- 26 Oct 2026 refinements: a lower horizon (§U), only the step dots (§V), the entrance's arrival (§R) ----------- */
// The campus level's name size in a carousel H px tall, and the room its one-line name and the fixed « Valider » take
// under the line: 10 px, the name's line, 12 px, the button's 36 px (§P).
const campusNameF=H=>Math.round(within(.11*within(H-116,84,200),18,22)*100)/100,valider=H=>10+1.12*campusNameF(H)+12+36;
test('§U: in every band the line comes down 40 px, or as far as the campus name and the fixed « Valider » still end inside the carousel, above the pager row; one line at L1, L2 and L3; no size, curve or drop changes',()=>{
 const widths=[320,360,390,430,699,700,768,1024,1280,1366,1440,1920],heights=Array.from({length:1001},(_,index)=>150+index/2);
 const before=middleLine(selector);let full=0,shorter=0,kept=0;
 for(const W of widths)for(const H of heights)for(const phone of [W<700,W>=700]){
  const where=`${W}×${H} ${phone?'phone':'desktop'}`,l12=haloGeometry({W,H,phone}),l3=haloGeometry({W,H,phone,campus:true}),was=before.haloGeometry({W,H,phone});
  // One line for the three levels (§I); every other value as before §U (the line at the middle of the carousel).
  assert.deepEqual([l3.floor0,l3.d1,l3.R],[l12.floor0,l12.d1,l12.R],where);
  for(const [now,then]of [[l12,was],[l3,before.haloGeometry({W,H,phone,campus:true})]]){
   for(const key of Object.keys(then))if(key!=='floor0'&&key!=='top')assert.equal(now[key],then[key],where+' '+key);
   near(now.top,now.floor0-now.bh,1e-9,where);near(floorAt(now,now.x2)-now.floor0,floorAt(then,then.x2)-then.floor0,1e-9,where+': the same drops');
  }
  const lower=l12.floor0-was.floor0,go=selector.goTop({W,H,phone}),name=l12.floor0+10+1.12*campusNameF(H);
  assert.ok(lower>=0&&lower<=40+1e-9,`${where}: ${lower}`);
  // The campus name's line, 12 px, then the « Valider » (§P), which follows the line.
  near(go,name+12,1e-9,where+': the « Valider » under the campus name');
  if(H-was.floor0-40>=valider(H)){near(lower,40,1e-9,where+': the full 40 px');full++;}
  else if(H-was.floor0>=valider(H)){near(go+36,H,1e-9,where+': down to where the « Valider » ends on the carousel\'s bottom edge, 4 px above the pager row');shorter++;}
  else{assert.equal(lower,0,where+': a band too short already keeps its line');kept++;}
  if(lower>0)assert.ok(go+36<=H+1e-9,where+': clear of the pager row');
 }
 assert.ok(full>1000&&shorter>1000&&kept>0,`${full} bands lowered by 40 px, ${shorter} less, ${kept} not at all`);
 // The bands Chrome measured before this pass (26 Oct 2026, the carousel's W × H): how far the line comes down there.
 for(const [label,W,H,lower]of [['1440×900 FR',1440,411,38.86],['1440×900 AR',1440,395.1,30.91],['1366×768',1366,307.5,13.4],['1280×720',1280,259.5,16.84],
  ['1280×1024',1280,535,40],['768×1024',768,538.6,40],['390×844 FR',390,377.1,21.91],['390×844 AR',390,359.2,12.96],['320×640',320,204,16.84]]){
  near(haloGeometry({W,H}).floor0-before.haloGeometry({W,H}).floor0,lower,.005,label);
 }
 // The compact row draws no horizon: unchanged.
 assert.deepEqual(haloGeometry({W:667,H:76.2,density:'compact'}),before.haloGeometry({W:667,H:76.2,density:'compact'}));
});

test('§U: the items, the pool and the fixed « Valider » come down with the line, at every level; the items keep their sizes and stand on it',async()=>{
 for(const [screen,view]of [[DESKTOP,L1_FR],[DESKTOP,l3France()],[PHONE,L2_EUROPE_FR],[SMALL,l3France()]]){
  const h=harness({screen});h.selector.show(view);await h.later();h.doc.runFrames();
  const level=h.current(),density=level.dataset.density,campus=view.level==='campuses',where=`${screen.W} ${view.key}`;
  const g=haloGeometry({W:screen.W,H:screen.H,phone:screen.W<700,campus,density}),was=middleLine(selector).haloGeometry({W:screen.W,H:screen.H,phone:screen.W<700,campus,density});
  const lower=g.floor0-was.floor0;assert.ok(lower>10,where+': '+lower);
  const lay=layoutItems({geometry:was,items:view.items.map(()=>({kind:campus?'campus':'country'})),cursorIndex:0});
  h.cards().forEach((card,index)=>{near(Number.parseFloat(card.style['--y']),Math.round((lay.items[index].y+lower)*100)/100,.011,where+' '+card.dataset.id);});
  assert.equal(level.querySelector('.explorer-pool').style.top,Math.round((170+g.floor0-15)*100)/100+'px',where+': the pool');
  near(Number.parseFloat(fixedGo(h).style['--go-y']),170+was.floor0+10+1.12*campusNameF(screen.H)+12+lower,1e-4,where+': the « Valider »');
  assert.equal(level.querySelector('.explorer-horizon-line').getAttribute('d').split('L')[32].trim(),`${screen.W/2} ${Math.round((170+g.floor0)*10)/10}`,where+': the line\'s apex');
 }
});

test('§V: the prompt is no longer shown: the steps stand centred alone; the prompt stays in the head, visually hidden, labelling the carousel with its step, at every level and in every language',async()=>{
 for(const [locale,dir,views,texts]of [['fr','ltr',[L1_FR,L2_EUROPE_FR,l3France()],['Où veux-tu aller ? · Étape 1 sur 3','Choisir un pays · Étape 2 sur 3','Choisir un campus · Étape 3 sur 3']],
  ['en','ltr',[L1_FR,L2_EUROPE_FR,l3France()],['Where would you like to go? · Step 1 of 3','Choose a country · Step 2 of 3','Choose a campus · Step 3 of 3']],
  ['ar','rtl',[L1_AR,L2_EUROPE_AR,l3France()],['إلى أين تريد الذهاب؟ · المرحلة 1 من 3','اختر دولة · المرحلة 2 من 3','اختر فرعًا · المرحلة 3 من 3']]]){
  const h=harness({locale,dir});
  views.forEach((view,index)=>{
   h.selector.show(view);const level=h.current(),head=level.querySelector('.explorer-head'),prompt=level.querySelector('.explorer-prompt'),where=`${locale} ${view.key}`;
   assert.deepEqual(head.children.map(node=>node.className),['explorer-steps','explorer-prompt'],where+': in the head, after the steps');
   assert.equal(level.querySelector('.explorer-carousel').getAttribute('aria-labelledby'),prompt.id,where);assert.equal(prompt.textContent,texts[index],where);
   assert.deepEqual([prompt.hidden,prompt.getAttribute('aria-hidden'),head.getAttribute('aria-hidden')],[false,null,null],where+': not hidden from assistive technologies');
   // Centred alone: the steps' 68 px in the middle of the band, at every level.
   const steps=level.querySelector('.explorer-steps').getBoundingClientRect(),frame=level.getBoundingClientRect();near(steps.left+steps.width/2,frame.left+frame.width/2,1e-9,where);
  });
 }
 const code=(await readFile(new URL('./explorer-selector.css',import.meta.url),'utf8')).replace(/\/\*[\s\S]*?\*\//g,'');
 const rules=[...code.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 const rule=selector=>{const found=rules.find(entry=>entry.selector===selector);assert.ok(found,selector);return found.body;};
 // The head centres its steps alone (no gap left for a prompt, at any size); the prompt, visually hidden in the flow:
 // 1 px wide (its margin takes it back), clipped, one line at its font size and line height, so the head keeps its height.
 assert.equal(rule(':root #explorer .explorer-head'),'grid-row:1;position:relative;z-index:2;display:flex;justify-content:center;align-items:center;min-inline-size:0;padding:6px 0 0');
 assert.deepEqual(rules.filter(entry=>/explorer-head/.test(entry.selector)&&/gap/.test(entry.body)).map(entry=>entry.selector),[],'no gap in the head');
 assert.equal(rule(':root #explorer .explorer-prompt'),'flex:none;inline-size:1px;margin-inline-end:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;color:var(--hx-ink);font-size:16px;font-weight:500;line-height:1.45;letter-spacing:-.005em');
 assert.equal(rule(':root #explorer .explorer-level[data-phone] .explorer-prompt'),'font-size:15px');assert.equal(rule(':root #explorer .explorer-prompt:lang(ar)'),'letter-spacing:0;line-height:1.6');
 for(const entry of rules.filter(entry=>/explorer-prompt/.test(entry.selector)))assert.doesNotMatch(entry.body,/display:\s*none|visibility:\s*hidden|opacity:\s*0|position:\s*absolute/,entry.selector+': visually hidden only');
});

test('§V: the steps never move at a level change (no sideways glide; L1 ↔ L2 ↔ L3 both ways, FR, EN and AR, desktop, short and phone bands): only their dots ease, in place; the prompt is never animated',async()=>{
 for(const [screen,locale,dir,l1,l2]of [[DESKTOP,'fr','ltr',L1_FR,L2_EUROPE_FR],[{...DESKTOP,band:369,H:259.5},'en','ltr',L1_FR,L2_EUROPE_FR],[PHONE,'ar','rtl',L1_AR,L2_EUROPE_AR],[SMALL,'fr','ltr',L1_FR,L2_EUROPE_FR]]){
  const h=harness({screen,locale,dir});h.selector.show(l1);await h.later();h.doc.runFrames();
  const steps=()=>h.current().querySelector('.explorer-steps').getBoundingClientRect(),at=steps(),label=`${screen.W}×${screen.band} ${locale}`;
  for(const [view,direction]of [[{...l2,cursorId:'FRA'},'descend'],[l3France(),'descend'],[{...l2,cursorId:'FRA'},'ascend'],[l1,'ascend']]){
   const from=h.doc.animations.length;h.selector.show(view,{direction});const made=h.doc.animations.slice(from),where=`${label} ${view.key} (${direction})`;
   assert.ok(made.some(animation=>animation.element.classList.contains('explorer-items')),where+': with motion');
   const head=made.filter(animation=>animation.element.closest('.explorer-head'));
   assert.ok(head.length>0&&head.every(animation=>animation.element.classList.contains('explorer-step')),where+': in the head, the dots only');
   assert.ok(head.every(animation=>animation.keyframes.every(keyframe=>!['transform','translate','opacity'].some(name=>name in keyframe))),where+': they ease in place');
   assert.deepEqual(steps(),at,where+': the steps at their place');
   await h.finish();
  }
 }
});

test('glideTo, glideAt with a duration (§R): a glide from rest takes its own time with the selector\'s easing and lands on its target; a move made meanwhile keeps the 0.5 s, without a jump of position or speed',()=>{
 const glide=selector.glideTo(null,{from:6,to:0,at:1000,duration:1200});
 assert.deepEqual(glide,{base:6,to:0,moves:[{at:1000,step:-6,smooth:false,duration:1200}]});
 for(let time=1000;time<=2300;time+=5){const at=selector.glideAt(glide,time);if(time<2200){near(at.cursor,6-6*EASED((time-1000)/1200),1e-9,'at '+time);assert.equal(at.done,false);}else assert.deepEqual(at,{cursor:0,speed:0,to:0,done:true});}
 assert.deepEqual(selector.glideTo(null,{from:6,to:0,at:1000}).moves,[{at:1000,step:-6,smooth:false}],'0.5 s without a duration, as before');
 // A key 300 ms in: the target moves by one, the row neither jumps nor changes speed; it lands 0.5 s after that key.
 const moved=selector.glideTo(glide,{to:1,at:1300}),before=selector.glideAt(glide,1300),after=selector.glideAt(moved,1300);
 near(after.cursor,before.cursor,1e-9);near(after.speed,before.speed,1e-9);
 assert.equal(selector.glideAt(moved,2199).done,false,'the arrival\'s own time');assert.deepEqual(selector.glideAt(moved,2200),{cursor:1,speed:0,to:1,done:true});
});

test('§R: the arrival glides the row along the horizon from off screen at the left onto its first item, the cursor (from the right in RTL), every frame on the curve, in the given time; it rests exactly on layoutItems\' layout; the cursor, the focus, ARIA and the fixed « Valider » never move; no layout read during it',async()=>{
 for(const [label,screen,view,locale,dir,g]of [['1440 FR',DESKTOP,L1_FR,'fr','ltr',DESKTOP_L12],['390 AR',PHONE,L1_AR,'ar','rtl',haloGeometry({W:390,H:377.1,phone:true,campus:false,density:'normal'})],
  ['1440 L3',DESKTOP,l3France(),'fr','ltr',haloGeometry({W:1440,H:411,phone:false,campus:true,density:'normal'})]]){
  const h=harness({screen,locale,dir});h.selector.show(view,{focus:true});await h.later();h.doc.runFrames();
  const level=h.current(),mirror=dir==='rtl'?-1:1,n=view.items.length,first=view.items[0].id,rested=rest(h),still=goBox(h);
  const named=()=>h.cards().map(card=>[card.getAttribute('aria-label'),card.tabIndex]),aria=named(),focused=h.doc.activeElement;
  assert.equal(focused,h.card(first),label);
  const start=h.doc.now();assert.equal(h.selector.arrive({duration:1200}),true,label);
  // At once, before any frame: every item past its ±2 slot, « out », on the reading start's side, without fades.
  assert.equal(level.dataset.instant,'',label);assert.equal(level.dataset.sliding,'',label);
  assertAlong(h,g,n+2,mirror,label+' start');assert.ok(h.cards().every(card=>card.dataset.off==='out'),label+': all « out »');
  for(const card of h.cards()){const at=dragged(card);assert.ok(at&&at.x*mirror<g.W/2*mirror,label+' '+card.dataset.id+': on the reading start\'s side');}
  // The selector's own reads during its frames (the checks below read boxes too).
  let reads=0,counting=false;const {layout,size}=h.doc;h.doc.layout=element=>{if(counting)reads++;return layout(element);};h.doc.size=(element,name)=>{if(counting)reads++;return size(element,name);};
  let previous=h.cards().map(card=>dragged(card).x),frames=0;
  for(;;){
   counting=true;h.frame();counting=false;frames++;const elapsed=h.doc.now()-start,where=`${label} at ${Math.round(elapsed)} ms`;
   assert.equal(h.cursor(),first,where);assert.equal(h.doc.activeElement,focused,where);assert.deepEqual(named(),aria,where);
   const at=goBox(h);assert.deepEqual([at.go,at.y,at.hidden,at.rect],[still.go,still.y,false,still.rect],where+': the « Valider »');
   if(elapsed>=1200)break;
   assert.equal(level.dataset.instant,undefined,where);
   const c=n+2-(n+2)*EASED(elapsed/1200);assertAlong(h,g,c,mirror,where);
   // The row moves on in the reading direction (to the right; to the left in RTL), every item on the curve.
   const xs=h.cards().map(card=>dragged(card)?.x);xs.forEach((x,index)=>{if(x!=null&&previous[index]!=null)assert.ok(x*mirror>=previous[index]*mirror-1e-9,where+' '+index);});previous=xs;
   const nearest=Math.round(c);assert.equal(h.centre(),nearest<n?view.items[nearest].id:undefined,where+': the nearest rank\'s looks');
  }
  assert.equal(reads,0,label+': no layout read');assert.ok(frames>=72,label);
  h.doc.layout=layout;h.doc.size=size;
  assert.deepEqual(rest(h),rested,label+': it rests exactly where it stood');assert.equal(h.centre(),first);
  h.doc.tick(400);assert.equal(level.dataset.sliding,undefined,label+': the fades have ended');
 }
});

test('§R: a key during the arrival retargets it without a jump; a drag takes it over; a resize, reduced motion or a new view settles it; the compact row slides in straight (its layer, from the right in RTL); in Arabic it stops on آسيا, the first item, wherever the cursor was; nothing under reduced motion, during a drag or without a level',async()=>{
 const g=DESKTOP_L12;
 // A key 300 ms in: the cursor moves at once, the row goes on from where it stands and lands on the new cursor.
 const k=harness();k.selector.show(L1_FR,{focus:true});await k.later();k.doc.runFrames();
 const start=k.doc.now();k.selector.arrive({duration:1200});let glide=selector.glideTo(null,{from:6,to:0,at:start,duration:1200});
 while(k.doc.now()-start<300)k.frame();
 const before=k.cards().map(card=>dragged(card)?.x);k.key('ArrowRight');glide=selector.glideTo(glide,{to:1,at:k.doc.now()});
 assert.equal(k.cursor(),'americas');assert.deepEqual(k.cards().map(card=>dragged(card)?.x),before,'no jump at the key');
 while(k.doc.now()-start<1250){k.frame();const at=selector.glideAt(glide,k.doc.now());if(!at.done)assertAlong(k,g,at.cursor,1,'after the key at '+Math.round(k.doc.now()-start));}
 assert.equal(k.centre(),'americas');assert.equal(Number.parseFloat(k.card('americas').style['--x']),720);
 // A drag takes it over where it stands, as a glide (§L).
 const d=harness();d.selector.show(L1_FR,{focus:true});await d.later();d.doc.runFrames();
 const from=d.doc.now();d.selector.arrive({duration:1200});while(d.doc.now()-from<400)d.frame();
 const c=selector.glideAt(selector.glideTo(null,{from:6,to:0,at:from,duration:1200}),d.doc.now()).cursor;
 d.event('pointerdown',d.card('africa'),{clientX:700});d.event('pointermove',d.carousel(),{clientX:690});d.frame();
 assertAlong(d,g,c,1,'taken over where it stood');assert.equal(d.current().dataset.dragging,'true');
 assert.equal(d.selector.arrive({duration:1200}),false,'no arrival during a drag');
 // A resize settles it at once on the layout; so does reduced motion turned on; a new view leaves it where it was painted.
 const r=harness();r.selector.show(L1_FR);await r.later();r.doc.runFrames();r.selector.arrive({duration:1200});r.frame();r.frame();
 r.doc.resize({H:400});assert.ok(r.cards().every(card=>card.style.transform===undefined),'the resize settles it');assert.equal(r.current().dataset.sliding,undefined);
 const m=harness();m.selector.show(L1_FR);await m.later();m.doc.runFrames();m.selector.arrive({duration:1200});m.frame();m.media.set(true);
 assert.ok(m.cards().every(card=>card.style.transform===undefined),'reduced motion settles it');assert.equal(Number.parseFloat(m.card('africa').style['--x']),720);
 const v=harness();v.selector.show(L1_FR);await v.later();v.doc.runFrames();v.selector.arrive({duration:1200});v.frame();
 const painted=v.cards().map(card=>card.style.transform),left=v.current();v.selector.show(L2_EUROPE_FR,{direction:'descend'});
 for(let n=0;n<10;n++)v.frame();assert.deepEqual(left.querySelectorAll('[data-explorer-card]').map(card=>card.style.transform),painted,'the outgoing row stays where it was painted');
 // The compact row: its layer comes in from off screen, the last item's far edge first (the measured widths, §3.5).
 for(const [dir,sign]of [['ltr',-1],['rtl',1]]){
  const c=harness({screen:LANDSCAPE,dir,locale:dir==='rtl'?'ar':'fr'});c.selector.show(dir==='rtl'?L1_AR:L1_FR,{focus:true});await c.later();c.doc.runFrames();
  const before=rest(c),made=c.doc.animations.length;assert.equal(c.selector.arrive({duration:1200}),true,dir);
  const [slide,...others]=c.doc.animations.slice(made);assert.deepEqual(others,[],dir);assert.equal(slide.element,c.layer(),dir);
  // 4 items: the cursor 250 px wide at the centre (333.5), the others 72 px, 26 px apart: the far edge at 752.5 px.
  assert.deepEqual(slide.keyframes,[{transform:`translateX(${sign*752.5}px)`},{transform:'none'}],dir);assert.deepEqual(slide.options,{easing:EASE_CSS,duration:1200,delay:0,fill:'backwards'},dir);
  assert.deepEqual(rest(c),before,dir+': the items keep their layout');assert.equal(c.current().dataset.sliding,undefined,dir);
 }
 // It stops on the first item of the language's order: in Arabic on آسيا, also when a language change during the
 // entrance kept the cursor on أفريقيا (2 / 4); the cursor goes there at once, the focus with it if an item had it.
 for(const focused of [false,true]){
  const a=harness({screen:PHONE,dir:'rtl',locale:'ar'});a.selector.show({...L1_AR,cursorId:'africa'},{focus:focused});await a.later();a.doc.runFrames();
  assert.equal(a.cursor(),'africa');const start=a.doc.now();assert.equal(a.selector.arrive({duration:1200}),true);
  assert.equal(a.cursor(),'asia');assert.match(a.card('asia').getAttribute('aria-label'),/ · 1 من 4 · تأكيد$/);assert.doesNotMatch(a.card('africa').getAttribute('aria-label'),/تأكيد/);
  assert.equal(a.doc.activeElement,focused?a.card('asia'):a.doc.body,focused?'the focus follows':'no focus taken');
  const g=haloGeometry({W:390,H:377.1,phone:true,campus:false,density:'normal'});assertAlong(a,g,6,-1,'from the right');
  while(a.doc.now()-start<1250)a.frame();assert.equal(a.centre(),'asia');assert.equal(Number.parseFloat(a.card('asia').style['--x']),195);
 }
 // Nothing to arrive: reduced motion, no level yet, the campus screen.
 const q=harness({reduced:true});q.selector.show(L1_FR);const quiet=rest(q),made=q.doc.animations.length,pending=q.doc.frames.size;
 assert.equal(q.selector.arrive({duration:1200}),false);assert.deepEqual(rest(q),quiet);assert.equal(q.doc.animations.length,made);assert.equal(q.doc.frames.size,pending,'no frame asked');
 assert.equal('sliding' in q.current().dataset,false);
 const e=harness();assert.equal(e.selector.arrive(),false);e.selector.show(campusView('paris'));assert.equal(e.selector.arrive(),false);
});

test('§R: during the arrival the step dots, the pager row and the fixed « Valider » come in with a short fade and rise, after the delay; the horizon and the pool fade in at once over the arc\'s handover; nothing else of the level is animated; none of it in the compact row',async()=>{
 for(const [screen,view,dir]of [[DESKTOP,L1_FR,'ltr'],[PHONE,L1_AR,'rtl']]){
  const h=harness({screen,dir,locale:dir==='rtl'?'ar':'fr'});h.selector.show(view);await h.later();h.doc.runFrames();
  const level=h.current(),from=h.doc.animations.length;h.selector.arrive({duration:1200,delay:1000,handover:400});
  const made=Object.fromEntries(h.doc.animations.slice(from).map(animation=>[animation.element.getAttribute('class'),{keyframes:animation.keyframes,timing:{...animation.options}}]));
  const rise={keyframes:[{opacity:0,translate:'0 10px'},{}],timing:{easing:EASE_CSS,duration:450,delay:1250,fill:'backwards'}},fade={keyframes:[{opacity:0},{}],timing:{easing:'linear',duration:400}};
  assert.deepEqual(made,{'explorer-horizon':fade,'explorer-pool':fade,'explorer-steps':rise,'explorer-pager':rise,'explorer-go':rise},dir);
  assert.equal(h.doc.animations[from].element,level.querySelector('.explorer-horizon'));
  assert.equal(h.doc.animations.slice(from).find(animation=>animation.element.classList.contains('explorer-go')).element,fixedGo(h),'the fixed button');
  // Ended, they are at their own place and opacity (nothing written inline); the button never moved in the layout.
  await h.finish();assert.deepEqual([fixedGo(h).style.opacity,fixedGo(h).style.translate,level.querySelector('.explorer-steps').style.opacity],[undefined,undefined,undefined]);
 }
 // Without a handover (the compact row's arc stays until it fades): the parts only, without a delay right away.
 const n=harness();n.selector.show(L1_FR);await n.later();n.doc.runFrames();const from=n.doc.animations.length;n.selector.arrive({duration:1200});
 assert.deepEqual(n.doc.animations.slice(from).map(animation=>[animation.element.getAttribute('class'),animation.options.delay]),[['explorer-steps',250],['explorer-pager',250],['explorer-go',250]]);
 // The compact row: its layer only (its head and foot are visually hidden, it has no horizon, pool or fixed button), off
 // screen during the delay.
 const c=harness({screen:LANDSCAPE});c.selector.show(L1_FR);await c.later();c.doc.runFrames();const start=c.doc.animations.length;c.selector.arrive({duration:1200,delay:1000,handover:400});
 assert.deepEqual(c.doc.animations.slice(start).map(animation=>[animation.element.getAttribute('class'),animation.options]),[['explorer-items',{easing:EASE_CSS,duration:1200,delay:1000,fill:'backwards'}]]);
});

test('§R: with a delay (the entrance\'s 42 landing meanwhile) the row waits off screen, every item « out » at its start, then glides in for its time and rests on layoutItems\' layout',async()=>{
 const h=harness();h.selector.show(L1_FR,{focus:true});await h.later();h.doc.runFrames();
 const level=h.current(),g=DESKTOP_L12,rested=rest(h),start=h.doc.now();h.selector.arrive({duration:1200,delay:1000});
 for(;;){
  h.frame();const elapsed=h.doc.now()-start,where=`at ${Math.round(elapsed)} ms`;
  if(elapsed<1000){assertAlong(h,g,6,1,where+': waiting');assert.ok(h.cards().every(card=>card.dataset.off==='out'),where);continue;}
  if(elapsed>=2200)break;
  assertAlong(h,g,6-6*EASED((elapsed-1000)/1200),1,where);
 }
 assert.deepEqual(rest(h),rested,'it rests where it stood');assert.equal(h.centre(),'africa');assert.equal(level.dataset.sliding,'');
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
