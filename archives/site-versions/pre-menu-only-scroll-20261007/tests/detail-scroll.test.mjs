import test from 'node:test';
import assert from 'node:assert/strict';
import {createDetailScroll,detailSidebarGeometry} from '../detail-scroll.mjs';

function fixture(){
 const media=new EventTarget();media.matches=true;
 const region=()=>({scrollTop:0,dataset:{},attributes:{},style:{values:{},setProperty(key,value){this.values[key]=value;},removeProperty(key){delete this.values[key];}},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];if(key==='tabindex')delete this.tabIndex;},getBoundingClientRect:()=>({width:246})});
 let sidebar,reading,container;
 const workspace={getBoundingClientRect:()=>({top:240,left:410,right:1510,width:1100})};
 const app={},doc={getElementById:()=>null,querySelector:()=>null};
 const sheet={ownerDocument:doc,style:region().style,querySelectorAll:()=>[container],closest:()=>app};
 const view={innerHeight:1047,scrollY:0,matchMedia:()=>media,addEventListener(){},requestAnimationFrame(){return 1;},getComputedStyle:element=>element===app?{getPropertyValue:()=> '124px'}:{gridTemplateColumns:'246px 790px',columnGap:'64px',direction:'ltr'}};
 function fresh(){sidebar=region();reading=region();container={hidden:false,querySelector:selector=>selector.startsWith(':scope')?null:selector==='h1'?{id:'person-title'}:selector.includes('sidebar')?sidebar:selector.includes('workspace')?workspace:reading};}
 fresh();const scroll=createDetailScroll({sheet,view});
 return {scroll,media,view,doc,sheet,workspace,fresh,get container(){return container;},get sidebar(){return sidebar;},get reading(){return reading;},mount:(identity='person',tab='journey',previous)=>scroll.sync({identity,key:identity+'/'+tab,previous})};
}

test('only the identity sidebar owns an inner scroll; reading remains document content',()=>{
 const f=fixture();f.mount();f.sidebar.scrollTop=40;f.reading.scrollTop=260;
 assert.deepEqual(f.scroll.capture(),{identity:'person',key:'person/journey',sidebar:40});
 assert.equal(f.scroll.didScroll(f.reading),false);assert.equal(f.scroll.didScroll({scrollTop:60}),false);
 assert.equal(f.scroll.didScroll(f.sidebar),true);assert.equal(f.scroll.didScroll(f.sidebar),false);
 assert.equal(f.sidebar.attributes['aria-labelledby'],'person-title');assert.equal(f.sidebar.tabIndex,0);
 assert.equal(f.reading.tabIndex,undefined);assert.deepEqual(f.reading.style.values,{});
 assert.equal(f.sidebar.style.values['--detail-sidebar-width'],'246px');
});

test('re-rendering a favorite or language and switching sections preserve the identity scroll only',()=>{
 const f=fixture();f.mount();f.sidebar.scrollTop=80;const saved=f.scroll.capture();
 f.fresh();f.mount('person','journey',saved);assert.equal(f.sidebar.scrollTop,80);
 assert.equal(f.scroll.didScroll(f.sidebar),false,'restored positions do not fade the dock');
 f.fresh();f.mount('person','projects',saved);assert.equal(f.sidebar.scrollTop,80);
 f.fresh();f.mount('another','journey',saved);assert.equal(f.sidebar.scrollTop,0);
});

test('history restores the matching sidebar only, ignoring old right-column offsets and invalid values',()=>{
 const f=fixture();f.mount();f.scroll.restore({key:'different/journey',sidebar:30});assert.equal(f.sidebar.scrollTop,0);
 f.scroll.restore({key:'person/journey',sidebar:42,reading:314});
 assert.equal(f.sidebar.scrollTop,42);assert.equal(f.reading.scrollTop,0);assert.equal(f.scroll.didScroll(f.sidebar),false);
 f.scroll.restore({key:'person/journey',sidebar:-5});assert.equal(f.sidebar.scrollTop,0);
 f.scroll.sync();assert.equal(f.scroll.capture(),null);
});

test('desktop to mobile to desktop removes fixed coordinates and the extra keyboard stop, then restores only the sidebar mode',()=>{
 const f=fixture();f.mount();f.sidebar.scrollTop=150;
 f.media.matches=false;f.media.dispatchEvent(new Event('change'));
 assert.equal(f.scroll.capture(),null);assert.equal(f.scroll.didScroll(f.sidebar),false);
 assert.equal(f.sidebar.dataset.detailScroll,undefined);assert.equal(f.sidebar.tabIndex,undefined);assert.equal(f.sidebar.scrollTop,0);assert.deepEqual(f.sidebar.style.values,{});
 f.scroll.restore({key:'person/journey',sidebar:150});assert.equal(f.sidebar.scrollTop,0);
 f.media.matches=true;f.media.dispatchEvent(new Event('change'));
 assert.equal(f.sidebar.dataset.detailScroll,'sidebar');assert.equal(f.sidebar.tabIndex,0);assert.equal(f.reading.tabIndex,undefined);
 assert.equal(f.scroll.didScroll(f.sidebar),false);f.sidebar.scrollTop=80;assert.equal(f.scroll.didScroll(f.sidebar),true);
});

test('sidebar positioning stays fixed at the end of a long document and follows RTL columns',()=>{
 const base={rect:{top:240,left:410,right:1510},columnWidth:246,scrollY:0,topLimit:136,bottomLimit:885};
 const initial=detailSidebarGeometry(base);
 assert.deepEqual(initial,{left:410,width:246,top:240,height:645});
 const atBottom=detailSidebarGeometry({...base,scrollY:1440,rect:{...base.rect,top:-1200}});
 assert.deepEqual(atBottom,initial,'natural document position prevents grid-end pushback');
 assert.equal(detailSidebarGeometry({...base,rtl:true}).left,1264);
 const short=detailSidebarGeometry({...base,bottomLimit:370});
 assert.equal(short.top,210);assert.equal(short.height,160);
});

test('the sidebar reaches the viewport bottom and reserves extra padding only for a horizontally overlapping dock',()=>{
 const f=fixture();f.mount();
 assert.equal(f.sidebar.style.values['--detail-sidebar-height'],'791px');
 assert.equal(f.sidebar.style.values['--detail-sidebar-clearance'],'12px');
 assert.equal(f.sheet.style.values['--detail-reading-inset'],'310px');
 f.doc.getElementById=()=>({getClientRects:()=>[{}],getBoundingClientRect:()=>({left:900,right:1200,top:950})});
 f.mount();assert.equal(f.sidebar.style.values['--detail-sidebar-clearance'],'12px');
 f.doc.getElementById=()=>({getClientRects:()=>[{}],getBoundingClientRect:()=>({left:430,right:800,top:950})});
 f.mount();assert.equal(f.sidebar.style.values['--detail-sidebar-clearance'],'93px');
 assert.equal(f.sidebar.style.values['--detail-sidebar-height'],'791px');
});

test('the pinned Back button reserves its original document space and returns to normal flow on mobile',()=>{
 const f=fixture();let spacer=null,inserted=false;
 const style=()=>({values:{},setProperty(key,value){this.values[key]=value;},removeProperty(key){delete this.values[key];}});
 const back={dataset:{},style:style(),before(node){spacer=node;inserted=true;},getBoundingClientRect(){return {top:back.dataset.detailBackPinned?152:152-f.view.scrollY,width:140,height:44};}};
 const originalQuery=f.container.querySelector;
 f.container.querySelector=selector=>selector===':scope > .cp-back'?back:originalQuery(selector);
 f.doc.createElement=()=>({style:style(),setAttribute(){},remove(){inserted=false;},getBoundingClientRect:()=>({top:152-f.view.scrollY})});
 f.workspace.getBoundingClientRect=()=>({left:410,right:1510,width:1100,top:(back.dataset.detailBackPinned?152+parseFloat(spacer.style.height)+14:240)-f.view.scrollY});
 f.mount();
 assert.equal(back.dataset.detailBackPinned,'true');assert.equal(spacer.style.height,'74px');
 assert.equal(back.style.values['--detail-back-top'],'152px');assert.equal(back.style.values['--detail-back-x'],'410px');
 assert.equal(f.workspace.getBoundingClientRect().top,240,'pinning Back does not move the reading start');
 f.view.scrollY=400;assert.equal(back.getBoundingClientRect().top,152);assert.equal(f.workspace.getBoundingClientRect().top,-160);
 f.media.matches=false;f.media.dispatchEvent(new Event('change'));
 assert.equal(back.dataset.detailBackPinned,undefined);assert.equal(inserted,false);assert.deepEqual(back.style.values,{});
 f.media.matches=true;f.media.dispatchEvent(new Event('change'));
 assert.equal(back.style.values['--detail-back-top'],'152px');assert.equal(spacer.style.height,'74px');
});
