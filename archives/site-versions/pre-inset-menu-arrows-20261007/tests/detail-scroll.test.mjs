import test from 'node:test';
import assert from 'node:assert/strict';
import {createDetailScroll,detailSidebarGeometry} from '../detail-scroll.mjs';

function fixture(){
 const media=new EventTarget();media.matches=true;
 let sidebar,reading,container,menu,identityElement;
 const doc={documentElement:{lang:'fr'},getElementById:()=>null,querySelector:()=>null,activeElement:null};
 class Element extends EventTarget{
  constructor(tag='div'){super();this.tagName=tag;this.children=[];this.dataset={};this.attributes={};this.scrollTop=0;this.style={values:{},setProperty(key,value){this.values[key]=value;},removeProperty(key){delete this.values[key];}};}
  append(...children){for(const child of children){child.remove();child.parent=this;this.children.push(child);}}
  before(child){if(!this.parent)return;child.remove();child.parent=this.parent;this.parent.children.splice(this.parent.children.indexOf(this),0,child);}
  remove(){if(!this.parent)return;const i=this.parent.children.indexOf(this);if(i>=0)this.parent.children.splice(i,1);this.parent=null;}
  setAttribute(key,value){this.attributes[key]=value;}
  removeAttribute(key){delete this.attributes[key];if(key==='tabindex')delete this.tabIndex;}
  focus(){doc.activeElement=this;}
  getBoundingClientRect(){return {width:246,height:this.tagName==='a'?(sidebar.dataset.detailDensity==='dense'?38:48):0};}
 }
 doc.createElement=tag=>new Element(tag);doc.createElementNS=(_,tag)=>new Element(tag);
 const workspace={getBoundingClientRect:()=>({top:240,left:410,right:1510,width:1100})};
 const app={},sheet={ownerDocument:doc,style:new Element().style,querySelectorAll:()=>[container],closest:()=>app};
 const view={innerHeight:1047,scrollY:0,reduced:false,matchMedia:query=>query.includes('reduced')?{matches:view.reduced}:media,addEventListener(){},requestAnimationFrame(){return 1;},getComputedStyle:element=>element===app?{getPropertyValue:()=> '124px'}:element===identityElement?{marginBottom:sidebar.dataset.detailDensity==='dense'?'9px':sidebar.dataset.detailDensity?'14px':'28px'}:element===menu?{rowGap:'6px'}:{gridTemplateColumns:'246px 790px',columnGap:'64px',direction:'ltr'}};
 function fresh(){
  sidebar=new Element();reading=new Element();menu=new Element('nav');identityElement=new Element('header');
  identityElement.getBoundingClientRect=()=>({height:sidebar.dataset.detailDensity==='dense'?85:sidebar.dataset.detailDensity?140:280});
  menu.append(...Array.from({length:4},()=>new Element('a')));
  Object.defineProperty(menu,'scrollHeight',{get(){return menu.children.reduce((sum,link)=>sum+link.getBoundingClientRect().height,0)+18+(menu.parent?.dataset.overflow==='true'?8:21);}});
  Object.defineProperty(menu,'clientHeight',{get(){return parseFloat(menu.parent?.style.height||'231')-(menu.parent?.dataset.overflow==='true'?41:0);}});
  menu.scrollBy=options=>{menu.lastScroll=options;menu.scrollTop=Math.min(Math.max(0,menu.scrollTop+options.top),Math.max(0,menu.scrollHeight-menu.clientHeight));menu.dispatchEvent(new Event('scroll'));};
  sidebar.append(identityElement,menu);sidebar.querySelector=selector=>selector==='header'?identityElement:menu;
  container={id:'profile-detail',hidden:false,querySelector:selector=>selector.startsWith(':scope')?null:selector==='h1'?{id:'person-title'}:selector.includes('sidebar')?sidebar:selector.includes('workspace')?workspace:reading};
 }
 fresh();const scroll=createDetailScroll({sheet,view});
 return {scroll,media,view,doc,sheet,workspace,fresh,Element,get container(){return container;},get sidebar(){return sidebar;},get menu(){return menu;},get reading(){return reading;},get menuFrame(){return menu.parent;},get arrows(){return menu.parent.children.filter(child=>child.tagName==='button');},mount:(identity='person',tab='journey',previous)=>scroll.sync({identity,key:identity+'/'+tab,previous})};
}

test('only the section menu owns an inner scroll, leaving identity and reading untouched',()=>{
 const f=fixture();f.mount();f.menu.scrollTop=40;f.reading.scrollTop=260;
 assert.deepEqual(f.scroll.capture(),{identity:'person',key:'person/journey',menu:40});
 assert.equal(f.scroll.didScroll(f.reading),false);assert.equal(f.scroll.didScroll(f.sidebar),false);
 assert.equal(f.scroll.didScroll(f.menu),true);assert.equal(f.scroll.didScroll(f.menu),false);
 assert.equal(f.sidebar.attributes['aria-labelledby'],'person-title');assert.equal(f.sidebar.tabIndex,undefined);assert.equal(f.sidebar.scrollTop,0);
 assert.equal(f.menu.tabIndex,0);assert.equal(f.menu.dataset.detailScroll,'menu');
 assert.equal(f.reading.tabIndex,undefined);assert.deepEqual(f.reading.style.values,{});
 assert.equal(f.sidebar.style.values['--detail-sidebar-width'],'246px');
});

test('a favorite, language or section render preserves only the same identity menu offset',()=>{
 const f=fixture();f.mount();f.menu.scrollTop=80;const saved=f.scroll.capture();
 f.fresh();f.mount('person','journey',saved);assert.equal(f.menu.scrollTop,80);
 assert.equal(f.scroll.didScroll(f.menu),false,'restored positions do not fade the dock');
 f.fresh();f.mount('person','projects',saved);assert.equal(f.menu.scrollTop,80);
 f.fresh();f.mount('another','journey',saved);assert.equal(f.menu.scrollTop,0);
 assert.equal(f.sidebar.scrollTop,0);
});

test('history restores the matching menu and ignores former whole-sidebar and reading offsets',()=>{
 const f=fixture();f.mount();f.scroll.restore({key:'different/journey',menu:30});assert.equal(f.menu.scrollTop,0);
 f.scroll.restore({key:'person/journey',menu:42,sidebar:120,reading:314});
 assert.equal(f.menu.scrollTop,42);assert.equal(f.sidebar.scrollTop,0);assert.equal(f.reading.scrollTop,0);assert.equal(f.scroll.didScroll(f.menu),false);
 f.scroll.restore({key:'person/journey',menu:-5});assert.equal(f.menu.scrollTop,0);
 f.scroll.restore({key:'person/journey',sidebar:120});assert.equal(f.menu.scrollTop,0);
 f.scroll.sync();assert.equal(f.scroll.capture(),null);
});

test('desktop to mobile to desktop removes the menu shell and scroll region, without altering mobile navigation',()=>{
 const f=fixture();f.mount();f.menu.scrollTop=150;const oldArrows=f.arrows;
 f.media.matches=false;f.media.dispatchEvent(new Event('change'));
 assert.equal(f.scroll.capture(),null);assert.equal(f.scroll.didScroll(f.menu),false);
 assert.equal(f.sidebar.dataset.detailScroll,undefined);assert.equal(f.menu.dataset.detailScroll,undefined);assert.equal(f.menu.tabIndex,undefined);assert.equal(f.menu.scrollTop,0);assert.deepEqual(f.sidebar.style.values,{});
 assert.equal(f.menu.parent,f.sidebar);assert.equal(f.sidebar.children.length,2);
 oldArrows[1].dispatchEvent(new Event('click'));assert.equal(f.menu.scrollTop,0,'unmounted arrow has no surviving handler');
 f.scroll.restore({key:'person/journey',menu:150});assert.equal(f.menu.scrollTop,0);
 f.media.matches=true;f.media.dispatchEvent(new Event('change'));
 assert.equal(f.sidebar.dataset.detailScroll,'sidebar');assert.equal(f.sidebar.tabIndex,undefined);assert.equal(f.menu.tabIndex,0);assert.equal(f.arrows.length,2);
 assert.equal(f.scroll.didScroll(f.menu),false);f.menu.scrollTop=80;assert.equal(f.scroll.didScroll(f.menu),true);
});

test('only needed arrows appear, scroll buttons are accessible and reduced motion avoids smooth scrolling',()=>{
 const f=fixture();f.mount();assert.ok(f.arrows.every(arrow=>arrow.hidden),'no arrows when all sections fit');
 f.view.innerHeight=640;f.mount();const [up,down]=f.arrows;
 assert.equal(f.sidebar.dataset.detailDensity,'compact');assert.equal(up.hidden,true);assert.equal(down.hidden,false);
 assert.equal(down.attributes['aria-label'],'Faire défiler les rubriques vers le bas');assert.equal(down.attributes['aria-controls'],f.menu.id);
 f.menu.scrollTop=10;f.menu.dispatchEvent(new Event('scroll'));assert.equal(up.hidden,false);assert.equal(down.hidden,false);
 down.focus();down.dispatchEvent(new Event('click'));
 assert.equal(f.menu.lastScroll.behavior,'smooth');assert.equal(down.hidden,true);assert.equal(up.hidden,false);assert.equal(f.doc.activeElement,f.menu);
 assert.equal(f.sidebar.scrollTop,0);assert.equal(f.view.scrollY,0);
 f.view.reduced=true;up.dispatchEvent(new Event('click'));assert.equal(f.menu.lastScroll.behavior,'instant');assert.equal(up.hidden,true);assert.equal(down.hidden,false);
 f.view.innerHeight=1047;f.mount();assert.ok(f.arrows.every(arrow=>arrow.hidden));assert.equal(f.sidebar.dataset.detailDensity,undefined);
});

test('sidebar positioning is unchanged at document bottom, and short windows compact identity without scrolling it',()=>{
 const base={rect:{top:240,left:410,right:1510},columnWidth:246,scrollY:0,topLimit:136,bottomLimit:885};
 const initial=detailSidebarGeometry(base);assert.deepEqual(initial,{left:410,width:246,top:240,height:645});
 assert.deepEqual(detailSidebarGeometry({...base,scrollY:1440,rect:{...base.rect,top:-1200}}),initial);
 assert.equal(detailSidebarGeometry({...base,rtl:true}).left,1264);
 const f=fixture();f.view.innerHeight=440;f.mount();assert.equal(f.sidebar.dataset.detailDensity,'dense');assert.equal(f.sidebar.scrollTop,0);
 assert.ok(parseFloat(f.menuFrame.style.height)>=48);assert.equal(f.sidebar.style.values['--detail-sidebar-top'],'136px');
});

test('dock clearance only limits menu space when the dock overlaps its width, and footer stays in the reading column',()=>{
 const f=fixture();f.mount();assert.equal(f.sidebar.style.values['--detail-sidebar-height'],'791px');assert.equal(f.sheet.style.values['--detail-reading-inset'],'310px');
 f.view.innerHeight=740;f.mount();const full=f.menuFrame.style.height;
 f.doc.getElementById=()=>({getClientRects:()=>[{}],getBoundingClientRect:()=>({left:900,right:1200,top:650})});
 f.mount();assert.equal(f.menuFrame.style.height,full);
 f.doc.getElementById=()=>({getClientRects:()=>[{}],getBoundingClientRect:()=>({left:430,right:800,top:650})});
 f.mount();assert.equal(f.sidebar.style.values['--detail-sidebar-height'],'484px');assert.equal(f.sidebar.scrollTop,0);
 assert.ok(parseFloat(f.menuFrame.style.height)<=484-154-86);
});

test('pinned Back reserves its document space, remains fixed at document bottom and returns to mobile flow',()=>{
 const f=fixture();let spacer=null,inserted=false;
 const back=new f.Element('button');back.before=node=>{spacer=node;inserted=true;};
 back.getBoundingClientRect=()=>({top:back.dataset.detailBackPinned?152:152-f.view.scrollY,width:140,height:44});
 const originalQuery=f.container.querySelector;f.container.querySelector=selector=>selector===':scope > .cp-back'?back:originalQuery(selector);
 const create=f.doc.createElement;f.doc.createElement=tag=>{const element=create(tag);element.getBoundingClientRect=()=>({top:152-f.view.scrollY});const remove=element.remove.bind(element);element.remove=()=>{if(element===spacer)inserted=false;remove();};return element;};
 f.workspace.getBoundingClientRect=()=>({left:410,right:1510,width:1100,top:(back.dataset.detailBackPinned?152+parseFloat(spacer.style.height)+14:240)-f.view.scrollY});
 f.mount();assert.equal(back.dataset.detailBackPinned,'true');assert.equal(spacer.style.height,'74px');
 assert.equal(back.style.values['--detail-back-top'],'152px');assert.equal(back.style.values['--detail-back-x'],'410px');assert.equal(f.workspace.getBoundingClientRect().top,240);
 f.view.scrollY=400;assert.equal(back.getBoundingClientRect().top,152);assert.equal(f.workspace.getBoundingClientRect().top,-160);
 f.media.matches=false;f.media.dispatchEvent(new Event('change'));
 assert.equal(back.dataset.detailBackPinned,undefined);assert.equal(inserted,false);assert.deepEqual(back.style.values,{});
 f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.equal(back.style.values['--detail-back-top'],'152px');assert.equal(spacer.style.height,'74px');
});
