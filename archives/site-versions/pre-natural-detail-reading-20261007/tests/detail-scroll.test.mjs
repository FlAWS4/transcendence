import test from 'node:test';
import assert from 'node:assert/strict';
import {createDetailScroll} from '../detail-scroll.mjs';

function fixture(){
 const media=new EventTarget();media.matches=true;
 const region=()=>({scrollTop:0,dataset:{},attributes:{},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];if(key==='tabindex')delete this.tabIndex;}});
 let sidebar,reading,container;
 const sheet={querySelectorAll:()=>[container]};
 function fresh(){sidebar=region();reading=region();container={hidden:false,querySelector:selector=>selector==='h1'?{id:'person-title'}:selector==='h2'?{id:'section-title'}:selector.includes('sidebar')?sidebar:reading};}
 fresh();const scroll=createDetailScroll({sheet,view:{matchMedia:()=>media}});
 return {scroll,media,fresh,get sidebar(){return sidebar;},get reading(){return reading;},mount:(identity='person',tab='journey',previous)=>scroll.sync({identity,key:identity+'/'+tab,previous})};
}

test('reading and identity columns remember their own offset; unrelated nested scroll is ignored',()=>{
 const f=fixture();f.mount();f.sidebar.scrollTop=40;f.reading.scrollTop=260;
 assert.deepEqual(f.scroll.capture(),{identity:'person',key:'person/journey',sidebar:40,reading:260});
 assert.equal(f.scroll.didScroll({scrollTop:60}),false);
 assert.equal(f.scroll.didScroll(f.reading),true);assert.equal(f.scroll.didScroll(f.reading),false);
 assert.equal(f.scroll.didScroll(f.sidebar),true);
 assert.equal(f.reading.attributes['aria-labelledby'],'section-title');assert.equal(f.sidebar.attributes['aria-labelledby'],'person-title');
 assert.equal(f.reading.tabIndex,0);assert.equal(f.sidebar.tabIndex,0);
});
test('re-rendering a favorite or language preserves both columns; another section preserves only identity',()=>{
 const f=fixture();f.mount();f.sidebar.scrollTop=80;f.reading.scrollTop=380;const saved=f.scroll.capture();
 f.fresh();f.mount('person','journey',saved);
 assert.equal(f.sidebar.scrollTop,80);assert.equal(f.reading.scrollTop,380);
 assert.equal(f.scroll.didScroll(f.reading),false,'restored positions do not fade the dock');
 f.fresh();f.mount('person','projects',saved);
 assert.equal(f.sidebar.scrollTop,80);assert.equal(f.reading.scrollTop,0);
 f.fresh();f.mount('another','journey',saved);
 assert.equal(f.sidebar.scrollTop,0);assert.equal(f.reading.scrollTop,0);
});
test('history restores the matching route only, ignores invalid offsets and suppresses restoration scroll events',()=>{
 const f=fixture();f.mount();f.scroll.restore({key:'different/journey',sidebar:30,reading:90});
 assert.equal(f.reading.scrollTop,0);
 f.scroll.restore({key:'person/journey',sidebar:42,reading:314});
 assert.equal(f.sidebar.scrollTop,42);assert.equal(f.reading.scrollTop,314);assert.equal(f.scroll.didScroll(f.reading),false);
 f.scroll.restore({key:'person/journey',sidebar:-5,reading:Infinity});
 assert.equal(f.sidebar.scrollTop,0);assert.equal(f.reading.scrollTop,0);
 f.scroll.sync();assert.equal(f.scroll.capture(),null);
});
test('mobile returns to one document flow without independent regions or extra keyboard stops',()=>{
 const f=fixture();f.mount();f.sidebar.scrollTop=30;f.reading.scrollTop=150;
 f.media.matches=false;f.media.dispatchEvent(new Event('change'));
 assert.equal(f.scroll.capture(),null);assert.equal(f.scroll.didScroll(f.reading),false);
 assert.equal(f.reading.dataset.detailScroll,undefined);assert.equal(f.reading.tabIndex,undefined);assert.equal(f.reading.scrollTop,0);
 f.scroll.restore({key:'person/journey',sidebar:30,reading:150});assert.equal(f.reading.scrollTop,0);
 f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.equal(f.reading.dataset.detailScroll,'reading');assert.equal(f.reading.tabIndex,0);
 assert.equal(f.scroll.didScroll(f.reading),false,'breakpoint resets do not trigger the dock fade');
 f.reading.scrollTop=80;assert.equal(f.scroll.didScroll(f.reading),true);assert.equal(f.scroll.capture().reading,80);
});
