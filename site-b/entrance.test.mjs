import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {model} from './decryption/shared.mjs';
import {scannerTogetherPhase} from './decryption/scanner-return-together.mjs';

const source=(await readFile(new URL('./entrance.mjs',import.meta.url),'utf8'))
 .replace(/^import .*;\n/gm,'').replace('export function mountEntrance','function mountEntrance');
// Keyframes and options are built in the module's own realm.
const plain=value=>JSON.parse(JSON.stringify(value));
const near=(actual,expected,tolerance,message)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${message??''} ${actual} ≠ ${expected} ±${tolerance}`);

// The main entrance opts into the rotating labels; cycleLabels:false mirrors the
// older panels composition, which shares this module without the rotation.
// horizon: 'laid-out' (the selector's first view stands in the stage), 'compact' (its line is not displayed) or 'none'
// (no view yet: h.layHorizon() lays it out later, as the preparation does). landing: where the header's 42 stands, the
// entrance's 42 landing there as the page arrives (§R): 'left' (the header in French and English), 'right' (mirrored in
// Arabic) or 'none' (no header 42). dock: 'bottom', or upright on the 'left' or 'right' side (§W's rail); missing: the
// page's parts that are not displayed.
function harness({reducedMotion=false,deferFonts=false,interactions=false,cycleLabels=true,siteLanguage='fr',prepare=()=>Promise.resolve(),stageOptions={},horizon='laid-out',landing='left',dock='bottom',missing=[]}={}){
 let now=0,nextFrame=0,nextTimer=0,locale=siteLanguage,theme='light',dialog=null,destroyed=0;
 const frames=new Map(),timers=new Map(),animations=new Set(),events=[],rendered=[],opened=[],landings=[],revealed=[],reveals=[],listeners={},mediaListeners={};
 let resolveFontLoad,rejectFontLoad,resolveFontsReady;
 const fontLoad=deferFonts?new Promise((resolve,reject)=>{resolveFontLoad=resolve;rejectFontLoad=reject;}):Promise.resolve([]);
 const fontsReady=deferFonts?new Promise(resolve=>{resolveFontsReady=resolve;}):Promise.resolve();
 const nodes=new Map();
 class Element{
  constructor(name){this.name=name;this.children=[];this.hidden=false;this.style={};this.dataset={};this.attributes={};this.listeners={};this.className='';}
  set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
  append(...children){this.children.push(...children);for(const child of children)child.parentElement=this;}replaceChildren(...children){this.children=[];this._text='';this.append(...children);}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(child=>child!==this);this.parentElement=null;}
  get textContent(){return this.children.length?this.children.map(child=>child.textContent).join(''):this._text||'';}set textContent(value){this.children=[];this._text=value;}
  setAttribute(name,value){this.attributes[name]=value;}
  getAttribute(name){return this.attributes[name]??null;}
  addEventListener(name,callback){this.listeners[name]=callback;}
  click(){this.listeners.click?.();}focus(){this.focused=true;document.activeElement=this;}
  contains(node){return this===node||this.children.some(child=>child.contains(node));}
  querySelector(selector){return this.children.find(n=>n.name===selector||selector[0]==='.'&&n.className.split(' ').includes(selector.slice(1)))||this.children.map(n=>n.querySelector(selector)).find(Boolean)||null;}
  // Version B: the Explorer stage and the entrance are the fixed full viewport (1440×900); the 42 symbol is centred on it.
  getBoundingClientRect(){return this.box||(this.id==='explorer'||this.id==='entrance'?{left:0,top:0,width:1440,height:900,right:1440,bottom:900}:{left:620,top:380,width:200,height:200,right:820,bottom:580});}
  animate(keyframes,options){
   let resolve;const finished=new Promise(r=>{resolve=r;});
   const animation={element:this,keyframes,options,end:now+(options.delay||0)+options.duration,finished,finish(){animations.delete(animation);resolve();},cancel(){animations.delete(animation);resolve();}};
   animations.add(animation);return animation;
  }
 }
 for(const id of ['entrance','entrance-scene','entrance-access','entrance-status','entrance-symbol','entrance-arc','main','explorer']){const n=new Element(id);n.id=id;}
 nodes.get('entrance-arc').append(new Element('path'));nodes.get('entrance-arc').hidden=true;
 // The selector's horizon line: a polyline in its track's units (the track starts 170 px above the viewport), as at
 // 1440×900 since §U: its centre at y 536, 41.09 px under the centred 42, and its ends, 40 px past each side, at y 699 on
 // screen. A matrix with f = y − 706 puts its centre at y on screen (a shorter band's, the 42 then rising above it).
 const lines=[];
 function horizonLine({displayed=true,d='M-40 869L720 706L1480 869',matrix={a:1,b:0,c:0,d:1,e:0,f:-170}}={}){
  const line=new Element('path');line.className='explorer-horizon-line';line.attributes.d=d;
  line.box=displayed?{left:-40,top:536,width:1520,height:163,right:1480,bottom:699}:{left:0,top:0,width:0,height:0,right:0,bottom:0};
  line.getScreenCTM=()=>displayed?line.matrix:null;line.matrix=matrix;return line;
 }
 if(horizon!=='none')lines.push(horizonLine({displayed:horizon!=='compact'}));
 nodes.get('explorer').querySelectorAll=selector=>selector==='.explorer-horizon-line'?[...lines]:[];
 // The band (the stage's content box) of the desktop layout: 168.3 px above, 196 px below.
 nodes.get('explorer').computed={paddingTop:'168.3px',paddingBottom:'196px'};
 // Every inline style written on the stage (unset ones read '' as in a CSSStyleDeclaration): none is ever written.
 const stageStyles=[];nodes.get('explorer').style=new Proxy({},{get(target,name){return name in target?target[name]:'';},set(target,name,value){stageStyles.push([name,value]);target[name]=value;return true;}});
 if(interactions)for(const id of ['entry-theme-toggle','dialog']){const node=new Element(id);node.id=id;}
 // The 42 of the entrance (128 × 89.82 px, centred on the 1440 × 900 viewport, moved by its symbol's translate) and the
 // header's (58 × 40.7 px at 48, 40 px from the top-left corner, or from the top-right one when mirrored); the boxes the
 // entrance reads are counted.
 const logo=new Element('.entrance-logo'),image=new Element('img');logo.append(image);nodes.get('entrance-symbol').append(logo);
 image.box={left:656,top:405.09,width:128,height:89.82,right:784,bottom:494.91};
 const header=new Element('img'),boxReads=[];header.box=landing==='right'?{left:1334,top:40,width:58,height:40.7,right:1392,bottom:80.7}:{left:48,top:40,width:58,height:40.7,right:106,bottom:80.7};
 const moved=box=>{const dy=Number((nodes.get('entrance-symbol').style.translate||'0px 0px').split(' ')[1].replace('px',''));return dy?{...box,top:box.top+dy,bottom:box.bottom+dy}:box;};
 for(const node of [image,header]){const read=node.getBoundingClientRect.bind(node);node.getBoundingClientRect=()=>{boxReads.push(node===image?'logo':'header');return node===image?moved(read()):read();};}
 // The page's parts that arrive from their edge (§R): the header's controls and the scope pill at the top, the dock at the
 // bottom or upright on a side, the search and the dice above it.
 const dockBox={bottom:{left:420,top:800,width:600,height:64},left:{left:16,top:120,width:72,height:520},right:{left:1352,top:120,width:72,height:520}}[dock];
 const page=Object.fromEntries([['.header .utilities',{left:1300,top:40,width:92,height:44}],['#scope-bar',{left:560,top:72,width:320,height:80}],['#main-nav',dockBox],
  ['.dock-search-toggle',{left:560,top:730,width:240,height:48}],['.dock-random-toggle',{left:810,top:730,width:48,height:48}]].map(([selector,box])=>{
  const node=new Element(selector);node.box={...box,right:box.left+box.width,bottom:box.top+box.height};node.getClientRects=()=>missing.includes(selector)?[]:[node.box];return [selector,node];}));
 const document={body:{dataset:{}},documentElement:{lang:siteLanguage,dir:siteLanguage==='ar'?'rtl':'ltr'},activeElement:null,hidden:false,fonts:{load:()=>fontLoad,ready:fontsReady},getElementById:id=>nodes.get(id),createElement:name=>new Element(name),addEventListener:(name,callback)=>listeners[name]=callback,
  querySelector:selector=>page[selector]??null};
 const media={matches:reducedMotion,addEventListener:(name,callback)=>mediaListeners[name]=callback};
 const context=vm.createContext({document,window:{addEventListener:(name,callback)=>listeners[`window:${name}`]=callback},matchMedia:()=>media,performance:{now:()=>now},model,
  requestAnimationFrame:callback=>{frames.set(++nextFrame,callback);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),
  AbortController,setTimeout:(callback,delay)=>{timers.set(++nextTimer,{callback,at:now+delay});return nextTimer;},clearTimeout:id=>timers.delete(id),
  getComputedStyle:node=>node.computed||{paddingTop:'0px',paddingBottom:'0px'},
  mount:()=>({render(time){rendered.push(time);nodes.get('entrance-scene').dataset.phase=scannerTogetherPhase(time);},destroy(){destroyed++;}}),
 });
 vm.runInContext(source,context);
 const entrance=context.mountEntrance({getLocale:()=>locale,cycleLabels,prepare,
  ...(interactions?{getTheme:()=>theme,onToggleTheme:()=>{theme=theme==='light'?'dark':'light';}}:{}),
  ...(landing==='none'?{}:{landing:header}),
  ...(typeof stageOptions==='function'?stageOptions(nodes,Element):stageOptions),onOpen:mode=>opened.push(mode),onEvent:event=>events.push(event),
  onLand:mode=>landings.push({mode,phase:document.body.dataset.entry,symbol:nodes.get('entrance-symbol').hidden?'hidden':'shown',opened:opened.length}),
  onReveal:(mode,detail)=>{revealed.push({mode,opened:opened.length});reveals.push(plain(detail));},
  openDialog(title,build){dialog=nodes.get('dialog')||new Element('dialog');dialog.children=[];dialog.title=title;dialog.open=true;build(dialog);},closeDialog(){const closing=dialog;dialog=null;if(closing){closing.open=false;closing.listeners.close?.();}},
 });
 async function flush(){for(let n=0;n<12;n++)await Promise.resolve();}
 async function advance(ms){now+=ms;const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(now);for(const animation of [...animations])if(animation.end<=now)animation.finish();for(const [id,timer]of [...timers])if(timer.at<=now&&timers.delete(id))timer.callback();await flush();}
 // A scan counts presented frames, so regular playback must not simulate one
 // long blocked frame. advance() deliberately retains that distinction.
 async function play(ms){while(ms>0){const step=Math.min(16,ms);await advance(step);ms-=step;}}
 async function start(){await flush();await advance(0);}
 return{nodes,frames,timers,animations,events,rendered,opened,landings,revealed,reveals,document,entrance,advance,flush,play,start,stageStyles,lines,horizonLine,header,boxReads,page,
  layHorizon(options){lines.push(horizonLine(options));},
  // The running animation of one element (the arc, the 42).
  animation(element){return [...animations].find(animation=>animation.element===element);},
  fonts:{loaded(){resolveFontLoad?.([]);},failed(){rejectFontLoad?.(new Error('font unavailable'));},ready(){resolveFontsReady?.();}},
  get phase(){return document.body.dataset.entry;},get destroyed(){return destroyed;},get lastRender(){return rendered.at(-1);},
  get locale(){return locale;},get theme(){return theme;},
  get displayLocale(){return nodes.get('entry-login').attributes.lang;},get dialogTitle(){return dialog?.title;},
  confirm(){nodes.get('entry-login').click();dialog.children[1].click();},guest(){nodes.get('entry-guest').click();},
  language(value){locale=value;entrance.refresh();},hidden(value){document.hidden=value;listeners.visibilitychange();},
  reduced(value){media.matches=value;mediaListeners.change();},resize(){listeners['window:resize']();},
  hover(value){nodes.get('entrance-access').listeners[value?'pointerenter':'pointerleave']?.({pointerType:'mouse'});},
  focus(id,keyboard=true){listeners[keyboard?'keydown':'pointerdown']?.(keyboard?{key:'Tab'}:{pointerType:'mouse'});nodes.get(id).focus();nodes.get('entrance').listeners.focusin?.();},
  pointer(){listeners.pointerdown?.({pointerType:'mouse'});},key(event){listeners.keydown?.(typeof event==='string'?{key:event}:event);},
  // A closing modal dialog returns focus to its opener, whatever closed it.
  restoreFocus(id){nodes.get(id).focus();nodes.get('entrance').listeners.focusin?.();},
  blur(){document.activeElement=null;nodes.get('entrance').listeners.focusout?.();},
  cancelDialog(){dialog.children[2].click();},
 };
}

// The page's parts arriving from their edge (§R), as [selector, slide, delay]: each with a fade to its own opacity and a
// slide composed with its own transform, 0.5 s with the selector's easing, from the first frame on (fill backwards).
function arrivals(h){
 return Object.entries(h.page).map(([selector,node])=>{
  const own=[...h.animations].filter(animation=>animation.element===node);if(!own.length)return null;
  assert.equal(own.length,2,selector);const [fade,slide]=own,delay=fade.options.delay;
  assert.deepEqual(plain(fade.keyframes),[{opacity:0},{}],selector);assert.deepEqual(plain(fade.options),{duration:500,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'},selector);
  assert.deepEqual(plain(slide.keyframes)[1],{transform:'translate(0px,0px)'},selector);assert.deepEqual(plain(slide.options),{duration:500,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards',composite:'add'},selector);
  return [selector,plain(slide.keyframes)[0].transform,delay];
 }).filter(Boolean);
}

test('arrival plays both scanner passes, keeps access available, then holds the cipher',async()=>{
 const h=harness();await h.start();assert.equal(h.phase,'scanning');assert.equal(h.lastRender,0);
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
 assert.equal(h.nodes.get('entrance-access').hidden,false);
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-up');
 await h.play(1250);assert.equal(h.phase,'encrypted');assert.equal(h.nodes.get('entrance-scene').dataset.phase,'cipher');
 assert.equal(h.frames.size,0);assert.equal(h.lastRender,3649.999);
 h.language('en');assert.equal(h.lastRender,3649.999);assert.equal(h.frames.size,0);
 assert.equal(h.events.some(e=>e.decoded),false);
});

test('late sign-in starts only final resolution, holds the slogan, then draws the arc on the horizon; the page then arrives, every part by its own motion (no opening from the arc): the 42 flies onto the header\'s first, the rest once it has landed',async()=>{
 const h=harness();await h.start();await h.play(3650);h.confirm();assert.equal(h.phase,'decrypting');assert.equal(h.lastRender,3650);
 await h.advance(0);await h.advance(3150);assert.equal(h.phase,'slogan');assert.equal(h.lastRender,6800);assert.equal(h.opened.length,0);
 await h.advance(1299);assert.equal(h.phase,'slogan');
 await h.advance(1);assert.equal(h.phase,'opening');
 const arc=h.nodes.get('entrance-arc'),symbol=h.nodes.get('entrance-symbol'),logo=symbol.querySelector('img');
 // No ring any more: the 42 stands alone in its symbol, and the arc waits for it.
 assert.equal(symbol.querySelector('circle'),null);assert.equal(arc.hidden,true);
 await h.advance(600);assert.equal(h.phase,'arc');assert.equal(arc.hidden,false);
 // The arc is the horizon line mapped to the viewport (same curve, same extent), drawn from its centre outwards.
 assert.equal(arc.querySelector('path').attributes.d,'M-40 699L720 536L1480 699');assert.equal(arc.dataset.shape,'horizon');
 // It passes 41.09 px under the 42's bottom edge: the 42 stays at the centre (§U).
 assert.equal(symbol.style.translate,'');assert.equal(h.animation(symbol),undefined);
 const draw=h.animation(arc);assert.deepEqual(plain(draw.keyframes),[{clipPath:'inset(0% 50% 0% 50%)'},{clipPath:'inset(0% 0% 0% 0%)'}]);
 assert.equal(draw.options.duration,800);assert.equal(draw.options.easing,'cubic-bezier(.22,1,.36,1)');
 assert.deepEqual({...h.events.find(event=>event.horizonArc).horizonArc},{centre:720,band:false,durationMs:800});
 assert.deepEqual(h.revealed,[]);
 await h.advance(800);assert.equal(h.phase,'arriving');assert.equal(h.opened.length,0);assert.equal(arc.style.clipPath,'');
 // The page learns the identity as it starts arriving, so its header is already the member's; the arc's handover, over
 // which its real horizon fades in now; and when and for how long its continents slide in: after the flight (§R).
 assert.deepEqual(plain(h.revealed),[{mode:'member',opened:0}]);assert.deepEqual(h.reveals,[{delay:1000,duration:1200,handover:400}]);
 assert.deepEqual({...h.events.find(event=>event.arrival).arrival},{band:false,flightMs:1000,durationMs:1200});
 // No opening from the arc any more (§R): the entrance's background gives way at once; nothing parts, clips or masks.
 assert.equal(h.nodes.get('entrance').style.background,'transparent');assert.equal(h.nodes.get('entrance').children.length,0,'no part of a background');
 assert.ok([...h.animations].every(animation=>animation.keyframes.every(keyframe=>!['clipPath','maskImage','maskPosition'].some(name=>name in keyframe))),'no clip or mask');
 // The 42 flies from the centre onto the header's 42 (centred at 77, 60.35 px, 58 px wide), shrinking to its size.
 assert.deepEqual(plain(h.animation(logo).keyframes),[{transform:'none'},{transform:'translate(-643px,-389.65px) scale(0.453125)'}]);
 assert.deepEqual(plain(h.animation(logo).options),{duration:1000,easing:'cubic-bezier(.33,0,.67,1)',fill:'forwards'});
 assert.deepEqual({...h.events.find(event=>event.brandFlight).brandFlight},{transform:'translate(-643px,-389.65px) scale(0.453125)',durationMs:1000});
 // The drawn arc fades out in 0.4 s as the real horizon line, at its very place, fades in.
 assert.deepEqual(plain(h.animation(arc).keyframes),[{opacity:1},{opacity:0}]);assert.deepEqual(plain(h.animation(arc).options),{duration:400,easing:'linear',fill:'forwards'});
 // The page's other parts come in from their edge once the 42 has landed (hidden until then), each with a short slide
 // and a fade, slightly staggered.
 assert.deepEqual(arrivals(h),[['.header .utilities','translate(0px,-18px)',1000],['#scope-bar','translate(0px,-18px)',1060],['#main-nav','translate(0px,18px)',1120],
  ['.dock-search-toggle','translate(0px,18px)',1200],['.dock-random-toggle','translate(0px,18px)',1260]]);
 // The 42's box is read as it appears and before the arc (its place above the arc, §U), then both 42s' once as the arrival
 // starts.
 assert.deepEqual(h.boxReads,['logo','logo','logo','header']);
 await h.advance(399);assert.equal(arc.hidden,false);await h.advance(1);assert.equal(h.animation(arc),undefined,'the arc has faded');
 await h.advance(599);assert.equal(h.phase,'arriving');assert.deepEqual(h.landings,[]);
 // Landed: the page's own 42 takes over in that very task, and the page brings its name in; it is not open yet.
 await h.advance(1);assert.equal(h.phase,'landed');assert.deepEqual(h.landings,[{mode:'member',phase:'landed',symbol:'hidden',opened:0}]);
 await h.advance(1199);assert.equal(h.phase,'landed');assert.deepEqual(h.boxReads,['logo','logo','logo','header'],'nothing read per frame');
 // Every part has arrived: the page opens.
 await h.advance(1);assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);assert.equal(h.landings.length,1);
 // The stage itself is never clipped, faded, moved or scaled by the entrance.
 assert.deepEqual(h.stageStyles,[]);assert.equal(arc.hidden,true);assert.equal(h.animations.size,0);
 assert.equal(h.nodes.get('main').inert,false);assert.equal(h.document.activeElement,h.nodes.get('explorer'),'the stage takes the focus by default');
 assert.equal(h.nodes.get('entrance').hidden,true);assert.equal(h.destroyed,1);
 assert.equal(h.events.filter(e=>e.scanComplete).length,1);assert.equal(h.events.some(event=>event.entry==='waiting'||event.entry==='ring'),false);
});

test('early sign-in waits for the existing scan and never replays it',async()=>{
 const h=harness();await h.start();await h.play(900);const initialRenders=h.rendered.filter(t=>t===0).length;
 h.confirm();assert.equal(h.phase,'scanning');assert.equal(h.lastRender,900);
 await h.play(2750);assert.equal(h.phase,'decrypting');assert.equal(h.lastRender,3650);
 await h.advance(0);await h.advance(100);assert.equal(h.lastRender,3750);
 assert.equal(h.rendered.filter(t=>t===0).length,initialRenders);assert.equal(h.events.filter(e=>e.decryptionVariant===22).length,1);
});

test('visitor interrupts the scan and follows the common 42, arc and arrival path without decryption or slogan',async()=>{
 const h=harness();await h.start();await h.play(800);h.guest();assert.equal(h.phase,'opening');assert.equal(h.frames.size,0);
 await h.advance(600);assert.equal(h.phase,'arc');await h.advance(800);assert.equal(h.phase,'arriving');
 h.resize();await h.flush();assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);assert.deepEqual(plain(h.revealed),[{mode:'visitor',opened:0}]);
 assert.equal(h.events.some(e=>e.decoded||e.sloganHoldMs||e.decryptionVariant),false);
 assert.ok(h.rendered.every(t=>t<=800));
});

test('a slow preparation: without a view the arc waits for its horizon, and the status shows once an arc\'s time has passed',async()=>{
 let ready;const h=harness({horizon:'none',prepare:()=>new Promise(resolve=>{ready=resolve;})});
 await h.start();h.guest();await h.advance(600);
 const arc=h.nodes.get('entrance-arc'),status=h.nodes.get('entrance-status');
 assert.equal(h.phase,'opening');assert.equal(arc.hidden,true);assert.equal(status.hidden,true);
 await h.advance(799);assert.equal(h.phase,'opening');assert.equal(status.hidden,true);
 await h.advance(1);assert.equal(h.phase,'waiting');assert.equal(status.hidden,false);assert.equal(status.textContent,'Le monde se prépare…');assert.equal(arc.hidden,true);
 await h.advance(5000);assert.equal(h.phase,'waiting');
 // The preparation lays the first view out, then resolves: the status goes and the arc forms on that horizon.
 h.layHorizon();ready();await h.flush();
 assert.equal(h.phase,'arc');assert.equal(status.hidden,true);assert.equal(arc.querySelector('path').attributes.d,'M-40 699L720 536L1480 699');
 await h.advance(800);assert.equal(h.phase,'arriving');await h.advance(2200);assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);
 assert.equal(h.timers.size,0);
});

test('a preparation ending within an arc\'s time shows no status: the arc forms as soon as the horizon exists',async()=>{
 let ready;const h=harness({horizon:'none',prepare:()=>new Promise(resolve=>{ready=resolve;})});
 await h.start();h.guest();await h.advance(600);await h.advance(500);assert.equal(h.phase,'opening');assert.equal(h.timers.size,1);
 h.layHorizon();ready();await h.flush();assert.equal(h.phase,'arc');assert.equal(h.nodes.get('entrance-status').hidden,true);
 assert.equal(h.timers.size,0,'the status timer is cleared');assert.equal(h.events.some(event=>event.entry==='waiting'),false);
 await h.advance(800);await h.advance(2200);assert.equal(h.phase,'welcome');
});

test('with the horizon laid out but the preparation still running, the status shows after the arc',async()=>{
 let ready;const h=harness({prepare:()=>new Promise(resolve=>{ready=resolve;})});
 await h.start();h.guest();await h.advance(600);assert.equal(h.phase,'arc');
 const status=h.nodes.get('entrance-status'),arc=h.nodes.get('entrance-arc');assert.equal(status.hidden,true);
 await h.advance(800);assert.equal(h.phase,'waiting');assert.equal(status.hidden,false);assert.equal(status.textContent,'Le monde se prépare…');assert.equal(arc.hidden,false);
 h.language('en');assert.equal(status.textContent,'Getting the world ready…');
 ready();await h.flush();assert.equal(h.phase,'arriving');assert.equal(status.hidden,true);
 await h.advance(2200);assert.equal(h.phase,'welcome');
});

test('a compact row, which draws no horizon, gets a gentle arc across the band\'s vertical centre that fades out at the end',async()=>{
 const h=harness({horizon:'compact'});await h.start();h.guest();await h.advance(600);assert.equal(h.phase,'arc');
 const arc=h.nodes.get('entrance-arc');assert.equal(arc.dataset.shape,'band');
 // The band runs from 168.3 to 704 px, centre 436.15; the arc drops 24 px (3 % of the width, at most 24) at its ends.
 const points=arc.querySelector('path').attributes.d.slice(1).split('L').map(pair=>pair.split(' ').map(Number));
 assert.equal(points.length,65);assert.deepEqual(points[32],[720,436.15]);assert.deepEqual(points[0],[-40,460.15]);assert.deepEqual(points[64],[1480,460.15]);
 assert.ok(points.every(([x,y],index)=>index===0||x>points[index-1][0]&&(index<=32?y<=points[index-1][1]:y>=points[index-1][1])),'one arc, highest at the centre');
 // It would cross the centred 42 (58.76 px above its bottom edge): the 42 shows 98.76 px higher, the arc 40 px under it (§U).
 assert.equal(h.nodes.get('entrance-symbol').style.translate,'0px -98.76px');
 await h.advance(800);assert.equal(h.phase,'arriving');
 // The row has no line to hand over to: the arc stays until it fades over the arrival's last 15 %; the page fades no horizon in.
 assert.deepEqual(plain(h.animation(arc).keyframes),[{opacity:1},{opacity:1,offset:.85},{opacity:0}]);assert.deepEqual(plain(h.animation(arc).options),{duration:2200,fill:'forwards'});
 assert.deepEqual({...h.events.find(event=>event.arrival).arrival},{band:true,flightMs:1000,durationMs:1200});assert.deepEqual(h.reveals,[{delay:1000,duration:1200,handover:0}]);
 await h.advance(2200);assert.equal(h.phase,'welcome');
});

test('a preparation failing at once shows the error message and its three actions after the 42, without an arc',async()=>{
 for(const reducedMotion of [false,true]){
  const h=harness({reducedMotion,horizon:'none',prepare:()=>Promise.reject(new Error('offline'))});
  await h.start();h.guest();await h.advance(600);assert.equal(h.phase,'error');
  const status=h.nodes.get('entrance-status');assert.equal(status.hidden,false);assert.equal(status.textContent,'Le monde n’a pas pu se préparer.');
  assert.equal(h.nodes.get('entrance-access').children.length,3);assert.equal(h.nodes.get('entrance-arc').hidden,true);
  assert.equal(h.events.some(event=>event.entry==='arc'||event.horizonArc),false);
 }
});

test('a preparation failing after the arc hides it with the 42, and going back clears the entrance',async()=>{
 let fail;const h=harness({prepare:()=>new Promise((resolve,reject)=>{fail=reject;})});
 await h.start();await h.play(3650);h.guest();await h.advance(600);await h.advance(800);assert.equal(h.phase,'waiting');
 fail(new Error('offline'));await h.flush();assert.equal(h.phase,'error');
 const arc=h.nodes.get('entrance-arc'),access=h.nodes.get('entrance-access');
 assert.equal(arc.hidden,true);assert.equal(h.nodes.get('entrance-symbol').hidden,true);
 assert.deepEqual(access.children.map(button=>button.textContent),['Réessayer','Revenir au message','Continuer quand même']);
 access.children[1].click();assert.equal(h.phase,'encrypted');
 assert.equal(arc.hidden,true);assert.equal(arc.style.clipPath,'');assert.equal(h.nodes.get('entrance').style.background,'');
});

test('reduced motion turned on during the arc or the arrival opens the Explorer at once',async()=>{
 for(const phase of ['arc','arriving']){
  const h=harness();await h.start();h.guest();await h.advance(600);if(phase==='arriving')await h.advance(800);
  assert.equal(h.phase,phase);h.reduced(true);await h.flush();
  assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);assert.equal(h.animations.size,0);
  assert.equal(h.nodes.get('entrance').hidden,true);
 }
});

test('a resize while the arc is drawn moves it onto the horizon laid out again',async()=>{
 const h=harness();await h.start();h.guest();await h.advance(600);assert.equal(h.phase,'arc');
 const path=h.nodes.get('entrance-arc').querySelector('path');
 // The selector lays its horizon out again on its next frame: 20 px lower here.
 h.lines[0].matrix={a:1,b:0,c:0,d:1,e:0,f:-150};h.resize();
 await h.advance(16);assert.equal(path.attributes.d,'M-40 699L720 536L1480 699');
 await h.advance(16);assert.equal(path.attributes.d,'M-40 719L720 556L1480 719');
 assert.equal(h.phase,'arc');await h.advance(800);assert.equal(h.phase,'arriving');
 assert.equal(path.attributes.d,'M-40 719L720 556L1480 719','the arrival starts on the horizon as laid out again');
});

test('a horizon written in another path syntax is sampled along its length',async()=>{
 const h=harness({horizon:'none'}),line=h.horizonLine({d:'M-40 830Q720 504 1480 830'});
 line.getTotalLength=()=>1520;line.getPointAtLength=length=>({x:-40+length,y:830});h.lines.push(line);
 await h.start();h.guest();await h.advance(600);assert.equal(h.phase,'arc');
 const d=h.nodes.get('entrance-arc').querySelector('path').attributes.d;
 assert.equal(d.split('L').length,65);assert.ok(d.startsWith('M-40 660L-16.25 660L'));assert.ok(d.endsWith('L1480 660'));
});

test('the 42 flies onto the header\'s 42 first (§R), top-right when the header is mirrored in Arabic; nothing else moves before it has landed; the page learns it landed then, and opens once the rest has arrived',async()=>{
 for(const [landing,transform]of [['left','translate(-643px,-389.65px) scale(0.453125)'],['right','translate(643px,-389.65px) scale(0.453125)']]){
  const h=harness({landing,siteLanguage:landing==='right'?'ar':'fr'});await h.start();h.guest();await h.advance(600);await h.advance(800);assert.equal(h.phase,'arriving');
  const logo=h.nodes.get('entrance-symbol').querySelector('img'),flight=h.animation(logo);
  assert.deepEqual(plain(flight.keyframes),[{transform:'none'},{transform}],landing);
  assert.deepEqual(plain(flight.options),{duration:1000,easing:'cubic-bezier(.33,0,.67,1)',fill:'forwards'},landing);
  // During the flight the page's other parts wait at their start (their animations begin once it has landed), and so do
  // the continents and the selector's centre parts (onReveal's delay, the flight's time).
  assert.ok(arrivals(h).every(([,,delay])=>delay>=1000),landing);assert.equal(h.reveals[0].delay,1000);
  assert.equal(h.nodes.get('entrance-symbol').hidden,false,'the 42 shows all along its flight');assert.deepEqual(h.opened,[]);
  // Its last frame lands exactly on the header's 42: the same centre and width.
  const [dx,dy,k]=transform.match(/-?[\d.]+/g).map(Number),from=logo.box,to=h.header.box;
  assert.equal(from.left+from.width/2+dx,to.left+to.width/2);near(from.top+from.height/2+dy,to.top+to.height/2,1e-9);assert.equal(from.width*k,to.width);near(from.height*k,to.height,.01);
  await h.advance(999);assert.deepEqual(h.landings,[]);
  await h.advance(1);assert.deepEqual(h.landings,[{mode:'visitor',phase:'landed',symbol:'hidden',opened:0}]);
  await h.advance(1200);assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);assert.equal(h.landings.length,1);
  assert.equal(h.nodes.get('entrance-symbol').hidden,true);assert.equal(h.nodes.get('entrance').hidden,true);
 }
});

test('without a header 42 to land on, the 42 fades out with the drawn arc and the rest arrives after the same time; reduced motion and « Continuer quand même » open without a flight; no landing is told',async()=>{
 for(const box of [null,{left:0,top:0,width:0,height:0,right:0,bottom:0}]){
  const h=harness({landing:box?'left':'none'});if(box)h.header.box=box;
  await h.start();h.guest();await h.advance(600);await h.advance(800);assert.equal(h.phase,'arriving');
  const fade=h.animation(h.nodes.get('entrance-symbol').querySelector('img'));
  assert.deepEqual(plain(fade.keyframes),[{opacity:1},{opacity:0}]);assert.deepEqual(plain(fade.options),{duration:400,easing:'linear',fill:'forwards'});
  assert.equal(h.events.some(event=>event.brandFlight),false);assert.ok(arrivals(h).every(([,,delay])=>delay>=1000));
  await h.advance(1000);assert.equal(h.phase,'arriving');await h.advance(1200);assert.equal(h.phase,'welcome');assert.deepEqual(h.landings,[]);
 }
 const r=harness({reducedMotion:true});r.guest();await r.flush();assert.equal(r.phase,'welcome');assert.deepEqual(r.landings,[]);assert.deepEqual(r.opened,['visitor']);
 assert.deepEqual(r.reveals,[],'no arrival');assert.deepEqual(r.boxReads,[],'nothing measured');
 const e=harness({reducedMotion:true,prepare:()=>Promise.reject(new Error('offline'))});e.guest();await e.flush();assert.equal(e.phase,'error');
 e.nodes.get('entrance-access').children[2].click();assert.equal(e.phase,'welcome');assert.deepEqual(e.landings,[]);assert.deepEqual(e.opened,['visitor']);
});

test('a resize, a language change or reduced motion during the flight or after the landing ends the arrival at once (every part at its place, the 42 on the header\'s); the page learns it landed, once',async()=>{
 for(const interrupt of [h=>h.resize(),h=>h.language('en'),h=>h.reduced(true)])for(const after of [100,1300]){
  const h=harness();await h.start();h.guest();await h.advance(600);await h.advance(800);await h.advance(after);assert.equal(h.phase,after<1000?'arriving':'landed');assert.ok(h.animations.size>5);
  interrupt(h);await h.flush();
  assert.equal(h.phase,'welcome');assert.equal(h.landings.length,1);assert.equal(h.animations.size,0);assert.equal(h.nodes.get('entrance-symbol').hidden,true);
 }
});

test('the page\'s wiring (welcome.mjs, §R): the arrival starts the selector\'s (its horizon at once, its continents after the flight); the landing brings the name in next to the 42 and fades the Arabic line in with it; the page then opens as before',async()=>{
 const welcome=await readFile(new URL('./welcome.mjs',import.meta.url),'utf8');
 const start=welcome.indexOf('  onReveal(mode'),end=welcome.indexOf('  onEvent(event)',start);assert.ok(start>0&&end>start,'the handlers of mountEntrance');
 const run=({land=true,reduced=false}={})=>{
  const calls=[];
  const context=vm.createContext({identity:'visitor',entryOpen:false,route:{section:'explore'},performance:{now:()=>0},trace(){},accountMenu:{refresh(){calls.push('account');}},
   explorer:{arrive(options){calls.push(['arrive',plain(options)]);return true;}},applyRoute(options){calls.push(['route',plain(options)]);},
   brandWordmark:{arrive(){calls.push('cascade');return reduced?0:675;}},document:{querySelector(selector){return {animate(keyframes,options){calls.push(['fade',selector,plain(keyframes),plain(options)]);}};}}});
  const handlers=vm.runInContext('({'+welcome.slice(start,end)+'})',context);
  handlers.onReveal('member',{delay:1000,duration:1200,handover:400});if(land)handlers.onLand('member');handlers.onOpen('member');
  return {calls,identity:context.identity,entryOpen:context.entryOpen};
 };
 assert.deepEqual(run(),{identity:'member',entryOpen:true,calls:['account',['arrive',{delay:1000,duration:1200,handover:400}],'cascade',
  ['fade','.brand .arabic-brand',[{opacity:0},{opacity:1}],{duration:675,easing:'ease-out'}],'account',['route',{focus:false}]]});
 // No landing (no header 42): no cascade; a word shown at once (reduced motion): no fade.
 assert.deepEqual(run({land:false}).calls.slice(2),['account',['route',{focus:false}]]);
 assert.deepEqual(run({reduced:true}).calls.slice(2),['cascade','account',['route',{focus:false}]]);
});

test('the dock upright on a side (§W\'s rail) comes in from that side, the search and the dice with it; a part that is not displayed is left out; the header and the scope pill still come down from the top',async()=>{
 for(const [dock,slide]of [['left','translate(-18px,0px)'],['right','translate(18px,0px)']]){
  const h=harness({dock,siteLanguage:dock==='right'?'ar':'fr',landing:dock==='right'?'right':'left'});await h.start();h.guest();await h.advance(600);await h.advance(800);assert.equal(h.phase,'arriving');
  assert.deepEqual(arrivals(h),[['.header .utilities','translate(0px,-18px)',1000],['#scope-bar','translate(0px,-18px)',1060],['#main-nav',slide,1120],['.dock-search-toggle',slide,1200],['.dock-random-toggle',slide,1260]],dock);
 }
 const h=harness({missing:['.dock-random-toggle','.header .utilities']});await h.start();h.guest();await h.advance(600);await h.advance(800);
 assert.deepEqual(arrivals(h).map(([selector])=>selector),['#scope-bar','#main-nav','.dock-search-toggle']);
 // Ended (or interrupted), every part is back to its own styles: no animation is left on it.
 await h.advance(2200);assert.equal(h.phase,'welcome');assert.ok(Object.values(h.page).every(node=>![...h.animations].some(animation=>animation.element===node)));
});

// « Placer le 42 plus haut » (26 Oct 2026, the user's answer to §U's after-build note): on the short bands, where the line
// could not come down enough, the entrance's 42 shows higher than the centre so that the arc passes clearly under it,
// about 40 px under its bottom edge as elsewhere; the Explorer does not change; the 42 then flies to the header as
// everywhere. Lines are placed with their apex on screen (f = apex − 706); the centred 42's bottom edge is at 494.91 px.
const lineAt=apex=>({a:1,b:0,c:0,d:1,e:0,f:apex-706});

test('§U, the 42 higher on short bands: where the arc would pass less than 20 px under the centred 42, the 42 shows higher from its first frame, the arc 40 px under its bottom edge; elsewhere it stays at the centre; its top never rises above the header\'s 42; it then flies from there onto the header\'s 42',async()=>{
 // [apex, the 42's lift, landing, where its top stops]: 1440×900 (41.09 px under), just over and just under 20 px, the
 // pre-§U 1440×900 line, a line 15.91 px above the 42's bottom edge (as at 1280×720), and lines too high for 40 px under
 // the 42 below the header's 42 (its top then stops at that 42's bottom edge, 80.7 px) or, without a header 42, inside the
 // viewport (its top at 0).
 for(const [apex,lift,landing,top]of [[536,0,'left'],[515,0,'left'],[514.8,20.11,'left'],[497,37.91,'left'],[479,55.91,'left'],[479,55.91,'right'],[150,324.39,'left',80.7],[150,384.91,'none'],[100,405.09,'none',0]]){
  const label=`apex ${apex}, ${landing}`,h=harness({landing,siteLanguage:landing==='right'?'ar':'fr'});h.lines[0].matrix=lineAt(apex);
  await h.start();h.guest();assert.equal(h.phase,'opening',label);
  const symbol=h.nodes.get('entrance-symbol'),logo=symbol.querySelector('img');
  // It appears at its place (no glide, only its usual appearance), and stays there through the arc.
  assert.equal(symbol.style.translate,lift?`0px ${-lift}px`:'',label);assert.equal(h.animation(symbol),undefined,label);
  await h.advance(600);assert.equal(h.phase,'arc',label);assert.equal(h.animation(symbol),undefined,label);
  // The Explorer does not change: the arc is its line, where it stands.
  assert.equal(h.nodes.get('entrance-arc').querySelector('path').attributes.d,`M-40 ${apex+163}L720 ${apex}L1480 ${apex+163}`,label);
  const box=logo.getBoundingClientRect();
  if(top!==undefined)near(box.top,top,.011,label);else if(lift)near(apex-box.bottom,40,.011,label);
  await h.advance(800);assert.equal(h.phase,'arriving',label);
  // The flight starts from there and lands exactly on the header's 42 (centred at 77 or 1363, 60.35 px).
  if(landing!=='none'){
   const [dx,dy,k]=plain(h.animation(logo).keyframes)[1].transform.match(/-?[\d.]+/g).map(Number),to=h.header.box;
   near(box.left+box.width/2+dx,to.left+to.width/2,1e-9,label);near(box.top+box.height/2+dy,to.top+to.height/2,.006,label);assert.equal(box.width*k,to.width,label);
  }
  await h.advance(2200);assert.equal(h.phase,'welcome',label);
 }
 // The 42's motion at a short band (as at 1280×720): from 394.09 px, its centre raised 55.91 px, onto the header's 42.
 const h=harness();h.lines[0].matrix=lineAt(479);await h.start();h.guest();await h.advance(600);await h.advance(800);
 assert.deepEqual(plain(h.animation(h.nodes.get('entrance-symbol').querySelector('img')).keyframes),[{transform:'none'},{transform:'translate(-643px,-333.74px) scale(0.453125)'}]);
});

test('§U: when the horizon comes after the 42 (a slow preparation), the 42 glides up to its place before the arc is drawn',async()=>{
 // The preparation outlasts an arc's time: the 42 waits at the centre with the status, then the view comes on a short band.
 let ready;const h=harness({horizon:'none',prepare:()=>new Promise(resolve=>{ready=resolve;})});
 await h.start();h.guest();const symbol=h.nodes.get('entrance-symbol'),arc=h.nodes.get('entrance-arc'),status=h.nodes.get('entrance-status');
 assert.equal(symbol.style.translate,'','at the centre while no horizon is known');
 await h.advance(600);await h.advance(800);assert.equal(h.phase,'waiting');assert.equal(status.hidden,false);assert.equal(symbol.style.translate,'');
 h.layHorizon({matrix:lineAt(479)});ready();await h.flush();
 // It glides up 55.91 px in 0.6 s with its appearance's easing, the status gone; the arc waits for it.
 const glide=h.animation(symbol);
 assert.deepEqual(plain(glide.keyframes),[{translate:'0px 0px'},{translate:'0px -55.91px'}]);assert.deepEqual(plain(glide.options),{duration:600,easing:'cubic-bezier(.22,1,.36,1)'});
 assert.equal(symbol.style.translate,'0px -55.91px','it stays there once the glide has ended');assert.equal(status.hidden,true);
 assert.equal(arc.hidden,true);assert.equal(h.events.some(event=>event.horizonArc),false);
 await h.advance(599);assert.equal(arc.hidden,true);
 await h.advance(1);assert.equal(h.phase,'arc');assert.equal(arc.hidden,false);assert.equal(h.animation(symbol),undefined);
 near(479-symbol.querySelector('img').getBoundingClientRect().bottom,40,.011,'the arc 40 px under it');
 await h.advance(800);assert.equal(h.phase,'arriving');
 assert.deepEqual(plain(h.animation(symbol.querySelector('img')).keyframes)[1],{transform:'translate(-643px,-333.74px) scale(0.453125)'});
 await h.advance(2200);assert.equal(h.phase,'welcome');
 // The view coming during the 42's appearance, or a preparation ending within an arc's time: the same glide, then the arc;
 // on a band where the arc passes clearly under the 42, no glide at all.
 for(const [when,apex,lift]of [['appearance',479,55.91],['arc time',479,55.91],['arc time',536,0]]){
  let done;const g=harness({horizon:'none',prepare:()=>new Promise(resolve=>{done=resolve;})});
  await g.start();g.guest();
  if(when==='appearance'){await g.advance(300);g.layHorizon({matrix:lineAt(apex)});await g.advance(300);}
  else{await g.advance(600);await g.advance(500);g.layHorizon({matrix:lineAt(apex)});}
  done();await g.flush();const moved=g.animation(g.nodes.get('entrance-symbol'));
  assert.equal(g.nodes.get('entrance-symbol').style.translate,lift?`0px ${-lift}px`:'',when);
  if(lift){assert.deepEqual(plain(moved.keyframes)[1],{translate:`0px ${-lift}px`},when);assert.equal(g.nodes.get('entrance-arc').hidden,true,when);await g.advance(600);}
  else assert.equal(moved,undefined,when);
  assert.equal(g.phase,'arc',when);assert.equal(g.nodes.get('entrance-arc').hidden,false,when);
 }
});

test('§U: a resize during the arc moves the 42 with the line at once; reduced motion (no arc) never raises it; back to the message brings it to the centre, a retry raises it to the same place',async()=>{
 const h=harness();h.lines[0].matrix=lineAt(479);await h.start();h.guest();await h.advance(600);assert.equal(h.phase,'arc');
 const symbol=h.nodes.get('entrance-symbol');assert.equal(symbol.style.translate,'0px -55.91px');
 // The selector lays its line out again 20 px lower: the 42 follows it (still 40 px above it), then a tall band's line
 // (41.09 px under the centred 42) brings it back to the centre; no glide.
 h.lines[0].matrix=lineAt(499);h.resize();await h.advance(16);await h.advance(16);assert.equal(symbol.style.translate,'0px -35.91px');
 h.lines[0].matrix=lineAt(536);h.resize();await h.advance(16);await h.advance(16);assert.equal(symbol.style.translate,'');assert.equal(h.animation(symbol),undefined);
 const r=harness({reducedMotion:true});r.lines[0].matrix=lineAt(479);r.guest();await r.flush();assert.equal(r.phase,'welcome');assert.equal(r.nodes.get('entrance-symbol').style.translate,'');
 let fail;const e=harness({prepare:()=>new Promise((resolve,reject)=>{fail=reject;})});e.lines[0].matrix=lineAt(479);
 await e.start();e.guest();await e.advance(600);await e.advance(800);assert.equal(e.phase,'waiting');
 fail(new Error('offline'));await e.flush();assert.equal(e.phase,'error');
 const raised=e.nodes.get('entrance-symbol');
 e.nodes.get('entrance-access').children[0].click();assert.equal(e.phase,'opening');assert.equal(raised.style.translate,'0px -55.91px','a retry: the same place');
 await e.advance(600);await e.advance(800);fail(new Error('offline'));await e.flush();assert.equal(e.phase,'error');
 e.nodes.get('entrance-access').children[1].click();assert.equal(e.phase,'scanning');assert.equal(raised.style.translate,'','back to the message: at the centre');
});

// The entrance's light background made the page's (26 Oct 2026): §R's instant switch from the one to the other must show
// no change, so the entrance paints exactly the light .atmosphere layer of welcome.css at each of its widths (over an
// opaque white that keeps it opaque where forced colours drop gradients); dark mode is the plain ink on both sides.
test('in light mode the entrance\'s background is exactly the page\'s (the .atmosphere layer of welcome.css) at every width, so the switch of the arrival shows no change; dark keeps the plain ink',async()=>{
 const squash=value=>value.replace(/\s+/g,' ').replace(/\s*([(),])\s*/g,'$1').trim();
 // [media, selector, {property: value}] of a sheet's rules, at the top level or in an @media block.
 const rules=async name=>{
  const text=(await readFile(new URL(`./${name}`,import.meta.url),'utf8')).replace(/\/\*[\s\S]*?\*\//g,''),found=[];
  const walk=(chunk,media)=>{for(let index=0;index<chunk.length;){
   const open=chunk.indexOf('{',index);if(open<0)break;
   let depth=1,cursor=open+1;while(depth&&cursor<chunk.length){if(chunk[cursor]==='{')depth++;else if(chunk[cursor]==='}')depth--;cursor++;}
   const prelude=squash(chunk.slice(index,open)),body=chunk.slice(open+1,cursor-1);
   if(prelude.startsWith('@media'))walk(body,prelude.replace(/:\s+/g,':'));
   else found.push([media,prelude,Object.fromEntries(body.split(';').filter(part=>part.includes(':')).map(part=>{const colon=part.indexOf(':');return [part.slice(0,colon).trim(),squash(part.slice(colon+1))];}))]);
   index=cursor;
  }};
  walk(text,null);return found;
 };
 const [entrance,welcome,preview]=await Promise.all(['entrance.css','welcome.css','content-preview.css'].map(rules));
 const background=(sheet,selector)=>sheet.filter(([,rule,body])=>rule===selector&&body.background).map(([media,,body])=>[media,body.background]);
 const page=background(welcome,':root[data-theme=light] .atmosphere');
 assert.deepEqual(page.map(([media])=>media),[null,'@media(max-width:700px)'],'the page paints its light background at two widths');
 assert.deepEqual(background(entrance,':root[data-theme=light] .entrance'),page.map(([media,value])=>[media,squash(`${value} #FFFFFF`)]));
 // No other rule paints the entrance: the plain ink of the dark theme (the page's body) is its own background.
 assert.deepEqual(entrance.filter(([,rule,body])=>/(^|[\s>])\.entrance$/.test(rule)&&Object.keys(body).some(name=>name.startsWith('background'))).map(([media,rule,body])=>[media,rule,body.background]),
  [[null,'.entrance','var(--h42-color-bg)'],[null,':root[data-theme=light] .entrance',squash(page[0][1]+' #FFFFFF')],['@media(max-width:700px)',':root[data-theme=light] .entrance',squash(page[1][1]+' #FFFFFF')]]);
 // The same box: the entrance covers the viewport, the layer covers the app, which the Explorer sizes to the viewport.
 assert.match(entrance.find(([media,rule])=>!media&&rule==='.entrance')[2].position+' '+entrance.find(([media,rule])=>!media&&rule==='.entrance')[2].inset,/^fixed 0$/);
 assert.deepEqual(welcome.find(([media,rule])=>!media&&rule==='.atmosphere')[2],{position:'absolute',inset:'0','z-index':'-1','pointer-events':'none'});
 assert.deepEqual(preview.find(([media,rule])=>!media&&rule===':root .app[data-navigation=dock][data-section=explore]')[2],{height:'100svh','min-height':'0'});
});

test('hidden tabs pause the scan rather than skipping it when shown',async()=>{
 const h=harness();await h.start();await h.play(800);h.hidden(true);await h.advance(10000);assert.equal(h.lastRender,800);
 h.hidden(false);await h.advance(0);await h.play(500);assert.equal(h.lastRender,1300);assert.equal(h.phase,'scanning');
});

test('reduced motion holds the cipher until confirmation, then completes without timed animation',async()=>{
 const h=harness({reducedMotion:true});assert.equal(h.phase,'encrypted');assert.equal(h.lastRender,3649.999);
 assert.equal(h.frames.size,0);assert.equal(h.animations.size,0);
 h.confirm();await h.flush();assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);
 assert.equal(h.animations.size,0);assert.equal(h.frames.size,0);
 // No ring and no arc: the Explorer appears at once.
 assert.equal(h.nodes.get('entrance-arc').hidden,true);assert.equal(h.nodes.get('entrance-arc').querySelector('path').attributes.d,undefined);
 assert.equal(h.events.some(event=>['ring','arc','arriving'].includes(event.entry)),false);assert.deepEqual(h.stageStyles,[]);assert.deepEqual(h.revealed,[]);
});

test('enabling reduced motion during an early confirmed scan finishes the pending sign-in',async()=>{
 const h=harness();await h.start();await h.play(500);h.confirm();h.reduced(true);await h.flush();
 assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);assert.equal(h.frames.size,0);
});

test('map failure returns to the same scan position and a finished scan is never replayed',async()=>{
 for(const elapsed of [800,3650]){
  const h=harness({prepare:()=>Promise.reject(new Error('offline'))});await h.start();await h.play(elapsed);h.guest();
  await h.advance(600);await h.advance(800);assert.equal(h.phase,'error');
  h.nodes.get('entrance-access').children[1].click();assert.equal(h.phase,elapsed<3650?'scanning':'encrypted');assert.equal(h.lastRender,Math.min(elapsed,3649.999));
  assert.equal(h.frames.size,elapsed<3650?1:0);assert.equal(h.nodes.get('entrance-scene').hidden,false);
 }
});

test('a failed Explorer preparation can be skipped in all locales without decrypting the visitor message',async()=>{
 for(const [locale,label]of [['fr','Continuer quand même'],['en','Continue anyway'],['ar','المتابعة على أي حال']]){
  let attempts=0;
  const h=harness({reducedMotion:true,prepare:()=>{attempts++;return Promise.reject(new Error('WebGL unavailable'));}});
  h.language(locale);h.guest();await h.flush();assert.equal(h.phase,'error');assert.equal(h.nodes.get('entrance-status').hidden,false);
  const actions=h.nodes.get('entrance-access').children;assert.equal(actions.length,3);assert.equal(actions[2].textContent,label);
  actions[2].click();assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);assert.equal(h.nodes.get('main').inert,false);assert.equal(h.nodes.get('entrance').hidden,true);
  assert.equal(attempts,1);assert.equal(h.destroyed,1);assert.equal(h.events.some(event=>event.decoded),false);assert.equal(h.events.filter(event=>event.explorerUnavailable).length,1);
  assert.equal(h.events.some(event=>event.globeUnavailable),false);assert.equal(h.document.activeElement,h.nodes.get('explorer'));
 }
});

test('retry still prepares and reveals the Explorer after a failed attempt',async()=>{
 let attempts=0;
 const h=harness({reducedMotion:true,prepare:()=>++attempts===1?Promise.reject(new Error('offline')):Promise.resolve()});
 h.guest();await h.flush();assert.equal(h.phase,'error');h.nodes.get('entrance-access').children[0].click();await h.flush();
 assert.equal(attempts,2);assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['visitor']);assert.equal(h.events.some(event=>event.explorerUnavailable),false);assert.equal(h.destroyed,1);
});

test('continuing anyway preserves the simulated member identity',async()=>{
 const h=harness({reducedMotion:true,prepare:()=>Promise.reject(new Error('offline'))});h.confirm();await h.flush();assert.equal(h.phase,'error');
 h.nodes.get('entrance-access').children[2].click();assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);assert.equal(h.events.filter(event=>event.decoded).length,1);
});

test('the arriving stage and its focus are options of the entrance',async()=>{
 const focused=[];let custom;
 const h=harness({stageOptions:(nodes,Element)=>{custom=new Element('section');custom.id='custom-stage';return {stage:custom,onFocusStage:()=>focused.push('stage')};}});
 // This stage draws no horizon: the arc crosses its middle (380 + 200 / 2 px), 14.91 px above the 42's bottom edge, so the
 // 42 first glides up 54.91 px (§U); the stage itself is never styled.
 await h.start();h.guest();await h.advance(600);assert.equal(h.phase,'opening');
 assert.deepEqual(plain(h.animation(h.nodes.get('entrance-symbol')).keyframes),[{translate:'0px 0px'},{translate:'0px -54.91px'}]);
 await h.advance(600);assert.equal(h.phase,'arc');await h.advance(800);assert.equal(h.phase,'arriving');
 assert.equal(h.nodes.get('entrance-arc').dataset.shape,'band');assert.match(h.nodes.get('entrance-arc').querySelector('path').attributes.d,/L720 480L/);
 assert.deepEqual(Object.keys(custom.style),[]);assert.deepEqual(h.stageStyles,[]);assert.deepEqual(focused,[]);
 await h.advance(2200);assert.equal(h.phase,'welcome');assert.deepEqual(focused,['stage']);assert.equal(h.document.activeElement,null);
});

test('a delayed first visible frame still starts at the initial binary message',async()=>{
 const h=harness();await h.flush();
 await h.advance(2400);
 assert.equal(h.lastRender,0);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'binary');
 assert.equal(h.events.find(event=>event.scanStartedAt!==undefined).scanFirstFrameElapsedMs,0);
 await h.play(599);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'binary');
 await h.play(1);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
});

test('font loading and the font layout barrier cannot consume either scanner pass',async()=>{
 const h=harness({deferFonts:true});await h.flush();await h.advance(5000);
 assert.equal(h.frames.size,0);assert.equal(h.lastRender,0);assert.equal(h.nodes.get('entrance-access').hidden,false);
 h.fonts.loaded();await h.flush();await h.advance(2000);
 assert.equal(h.frames.size,0);assert.equal(h.lastRender,0);
 h.fonts.ready();await h.flush();await h.advance(1000);
 assert.equal(h.lastRender,0);
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-up');
 await h.play(1250);assert.equal(h.phase,'encrypted');
});

test('a blocked main thread cannot skip the visible scanner passes',async()=>{
 const h=harness();await h.start();await h.play(900);const before=h.lastRender;
 await h.advance(1800);
 assert.ok(h.lastRender>before);assert.ok(h.lastRender-before<=64);
 assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
 await h.play(3650-h.lastRender);assert.equal(h.phase,'encrypted');
 assert.equal(h.events.filter(event=>event.scanComplete).length,1);
});

test('sign-in confirmed before fonts are ready waits for the full visible scan',async()=>{
 const h=harness({deferFonts:true});h.confirm();await h.advance(5000);
 assert.equal(h.phase,'scanning');assert.equal(h.lastRender,0);
 h.fonts.loaded();h.fonts.ready();await h.start();
 await h.play(3649);assert.equal(h.phase,'scanning');
 await h.play(1);assert.equal(h.phase,'decrypting');assert.equal(h.lastRender,3650);
 await h.advance(0);await h.advance(3150);assert.equal(h.phase,'slogan');
 assert.equal(h.events.filter(event=>event.decryptionVariant===22).length,1);
});

test('a visitor can leave before font readiness without the scan restarting later',async()=>{
 const h=harness({deferFonts:true});h.guest();assert.equal(h.phase,'opening');
 h.fonts.loaded();h.fonts.ready();await h.flush();assert.equal(h.frames.size,0);
 await h.advance(600);await h.advance(800);assert.equal(h.phase,'arriving');
 h.resize();await h.flush();assert.equal(h.phase,'welcome');
 assert.deepEqual(h.opened,['visitor']);assert.ok(h.rendered.every(time=>time===0));
 assert.equal(h.events.some(event=>event.scanStartedAt!==undefined||event.decoded),false);
});

test('fonts becoming ready in a hidden tab wait for the first visible frame',async()=>{
 const h=harness({deferFonts:true});h.hidden(true);h.fonts.loaded();h.fonts.ready();await h.flush();
 await h.advance(10000);assert.equal(h.frames.size,0);assert.equal(h.lastRender,0);
 h.hidden(false);await h.advance(3000);assert.equal(h.lastRender,0);
 await h.play(1200);assert.equal(h.nodes.get('entrance-scene').dataset.phase,'scan-down');
});

test('failed fonts use fallback rather than preventing the initial scan',async()=>{
 const h=harness({deferFonts:true});await h.flush();h.fonts.failed();h.fonts.ready();await h.start();
 assert.equal(h.lastRender,0);await h.play(3650);assert.equal(h.phase,'encrypted');
});

test('reduced motion during pending fonts completes sign-in without a late restart',async()=>{
 const h=harness({deferFonts:true});h.confirm();h.reduced(true);await h.flush();
 assert.equal(h.phase,'welcome');assert.deepEqual(h.opened,['member']);
 h.fonts.loaded();h.fonts.ready();await h.flush();await h.advance(1000);
 assert.equal(h.phase,'welcome');assert.equal(h.frames.size,0);assert.equal(h.destroyed,1);
 assert.equal(h.events.some(event=>event.scanStartedAt!==undefined),false);
});

test('only entry labels cycle every four seconds without replacing the two actions',async()=>{
 const h=harness({interactions:true,reducedMotion:true});const login=h.nodes.get('entry-login'),guest=h.nodes.get('entry-guest');
 for(const [locale,loginText,guestText]of [['en','Sign in','Visit'],['ar','تسجيل الدخول','زيارة'],['fr','Se connecter','Visiter']]){
  const before=h.displayLocale;await h.advance(3999);assert.equal(h.displayLocale,before);await h.advance(1);assert.equal(h.displayLocale,locale);
  assert.equal(h.nodes.get('entry-login'),login);assert.equal(h.nodes.get('entry-guest'),guest);
  assert.equal(login.querySelector('.entrance-action-label').textContent,loginText);assert.equal(guest.querySelector('.entrance-action-label').textContent,guestText);assert.equal(login.attributes.lang,locale);assert.equal(guest.attributes.lang,locale);
 }
});

test('scanner completion does not restart the independent four-second language clock',async()=>{
 const h=harness({interactions:true});await h.start();await h.play(3999);assert.equal(h.phase,'encrypted');assert.equal(h.displayLocale,'fr');
 await h.play(1);assert.equal(h.displayLocale,'en');assert.equal(h.lastRender,3649.999);assert.equal(h.events.filter(event=>event.scanComplete).length,1);
});

test('hover and action focus pause language changes and resume with a full interval',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(2500);h.hover(true);await h.advance(20000);assert.equal(h.displayLocale,'fr');assert.equal(h.timers.size,0);
 h.hover(false);await h.advance(3999);assert.equal(h.displayLocale,'fr');await h.advance(1);assert.equal(h.displayLocale,'en');
 h.focus('entry-login');await h.advance(20000);assert.equal(h.displayLocale,'en');assert.equal(h.timers.size,0);
 h.blur();await h.flush();await h.advance(3999);assert.equal(h.displayLocale,'en');await h.advance(1);assert.equal(h.displayLocale,'ar');
});

test('hidden tabs never catch up missed entry languages',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(1000);h.hidden(true);await h.advance(100000);assert.equal(h.displayLocale,'fr');assert.equal(h.timers.size,0);
 h.hidden(false);await h.advance(3999);assert.equal(h.displayLocale,'fr');await h.advance(1);assert.equal(h.displayLocale,'en');
});

test('an open access dialog holds its language and cancelling resumes from that language',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(4000);h.nodes.get('entry-login').click();await h.advance(20000);assert.equal(h.displayLocale,'en');assert.equal(h.timers.size,0);
 assert.equal(h.dialogTitle,'Connexion — prototype');assert.equal(h.locale,'fr');h.cancelDialog();await h.advance(3999);assert.equal(h.displayLocale,'en');await h.advance(1);assert.equal(h.displayLocale,'ar');
});

test('early sign-in stops the label cycle while fonts, scan and decryption complete',async()=>{
 const h=harness({interactions:true,deferFonts:true});await h.advance(4000);assert.equal(h.displayLocale,'en');h.confirm();assert.equal(h.phase,'scanning');assert.equal(h.nodes.get('entry-theme-toggle').hidden,true);
 await h.advance(20000);assert.equal(h.displayLocale,'en');assert.equal(h.timers.size,0);h.fonts.loaded();h.fonts.ready();await h.start();await h.play(3650);assert.equal(h.phase,'decrypting');assert.equal(h.displayLocale,'en');
 await h.advance(0);await h.advance(3150);assert.equal(h.phase,'slogan');assert.equal(h.displayLocale,'en');assert.equal(h.timers.size,0);
});

test('visiting leaves the site language unchanged and no label timer behind',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(4000);await h.advance(4000);assert.equal(h.displayLocale,'ar');assert.equal(h.locale,'fr');h.guest();await h.flush();assert.equal(h.phase,'welcome');
 await h.advance(20000);assert.equal(h.displayLocale,'ar');assert.equal(h.timers.size,0);assert.equal(h.nodes.get('entry-theme-toggle').hidden,true);
});

test('background theme activation is named, pauses for keyboard focus and never runs during opening',async()=>{
 const h=harness({interactions:true,reducedMotion:true});const toggle=h.nodes.get('entry-theme-toggle');assert.equal(toggle.hidden,false);assert.equal(toggle.attributes['aria-label'],'Passer au mode sombre');
 h.focus('entry-theme-toggle');toggle.click();assert.equal(h.theme,'dark');assert.equal(toggle.attributes['aria-label'],'Passer au mode clair');await h.advance(20000);assert.equal(h.displayLocale,'fr');
 h.focus('entry-theme-toggle',false);toggle.click();assert.equal(h.theme,'light');await h.advance(4000);assert.equal(h.displayLocale,'en');assert.equal(toggle.attributes['aria-label'],'Passer au mode sombre');
 h.guest();toggle.click();assert.equal(h.theme,'light');await h.flush();assert.equal(h.phase,'welcome');assert.equal(toggle.hidden,true);
});

test('Arabic entry labels neither change the site direction nor translate its sign-in dialog',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.flush();const renders=h.rendered.length;
 await h.advance(4000);await h.advance(4000);assert.equal(h.displayLocale,'ar');assert.equal(h.locale,'fr');assert.equal(h.document.documentElement.lang,'fr');assert.equal(h.document.documentElement.dir,'ltr');assert.equal(h.rendered.length,renders);
 h.nodes.get('entry-login').click();assert.equal(h.dialogTitle,'Connexion — prototype');assert.equal(h.displayLocale,'ar');
});

test('the label cycle starts in the site language and keeps other entry controls in that language',async()=>{
 const h=harness({interactions:true,reducedMotion:true,siteLanguage:'ar'});assert.equal(h.displayLocale,'ar');await h.advance(4000);assert.equal(h.displayLocale,'fr');assert.equal(h.locale,'ar');assert.equal(h.document.documentElement.dir,'rtl');
 assert.equal(h.nodes.get('entry-theme-toggle').attributes['aria-label'],'التبديل إلى الوضع الداكن');h.nodes.get('entry-login').click();assert.equal(h.dialogTitle,'تسجيل الدخول — نموذج أولي');
});

test('only the label text animates, settles on focus, and respects reduced motion',async()=>{
 const h=harness({interactions:true,deferFonts:true});await h.advance(4000);assert.equal(h.displayLocale,'en');assert.equal(h.animations.size,4);assert.ok([...h.animations].every(animation=>animation.element.className.includes('entrance-action-label')));
 h.focus('entry-login');await h.flush();assert.equal(h.animations.size,0);assert.equal(h.nodes.get('entry-login').querySelector('.entrance-action-label').textContent,'Sign in');
 h.reduced(true);h.blur();await h.flush();await h.advance(4000);assert.equal(h.displayLocale,'ar');assert.equal(h.animations.size,0);
});

test('cancelling sign-in with the pointer returns focus to its button without stopping the labels',async()=>{
 const h=harness({interactions:true,reducedMotion:true});await h.advance(4000);assert.equal(h.displayLocale,'en');
 h.pointer();h.nodes.get('entry-login').click();assert.equal(h.dialogTitle,'Connexion — prototype');
 h.pointer();h.cancelDialog();h.restoreFocus('entry-login');
 await h.advance(3999);assert.equal(h.displayLocale,'en');await h.advance(1);assert.equal(h.displayLocale,'ar');
});

test('keyboard focus restored after a dialog still holds the labels until it leaves the actions',async()=>{
 const h=harness({interactions:true,reducedMotion:true});h.focus('entry-login');h.nodes.get('entry-login').click();
 h.key('Escape');h.cancelDialog();h.restoreFocus('entry-login');await h.advance(20000);assert.equal(h.displayLocale,'fr');
 h.blur();await h.flush();await h.advance(4000);assert.equal(h.displayLocale,'en');
});

test('modifier, lock, function keys and shortcuts do not hold the labels after a pointer action',async()=>{
 const h=harness({interactions:true,reducedMotion:true});const toggle=h.nodes.get('entry-theme-toggle');
 h.focus('entry-theme-toggle',false);toggle.click();
 for(const event of [{key:'Shift'},{key:'Alt'},{key:'Control'},{key:'Meta'},{key:'NumLock'},{key:'ScrollLock'},{key:'PrintScreen'},{key:'F11'},{key:'Escape'},{key:'c',ctrlKey:true},{key:'Tab',altKey:true}])h.key(event);
 await h.advance(4000);assert.equal(h.displayLocale,'en');
 h.key('Tab');await h.advance(20000);assert.equal(h.displayLocale,'en');
});

test('a page that does not opt in keeps plain site-language labels without rotation',async()=>{
 const h=harness({reducedMotion:true,cycleLabels:false});const login=h.nodes.get('entry-login'),guest=h.nodes.get('entry-guest');
 assert.equal(login.textContent,'Se connecter');assert.equal(guest.textContent,'Visiter');assert.equal(login.querySelector('.entrance-action-label'),null);
 assert.equal(login.getAttribute('aria-description'),null);assert.equal(login.getAttribute('lang'),'fr');
 await h.advance(20000);assert.equal(login.textContent,'Se connecter');assert.equal(h.timers.size,0);
 h.language('en');assert.equal(login.textContent,'Sign in');assert.equal(guest.textContent,'Visit');assert.equal(login.getAttribute('lang'),'en');
});

test('Escape after a pointer-opened sign-in closes it without holding the labels',async()=>{
 const h=harness({interactions:true,reducedMotion:true});h.pointer();h.nodes.get('entry-login').click();
 h.key('Escape');h.cancelDialog();h.restoreFocus('entry-login');
 await h.advance(3999);assert.equal(h.displayLocale,'fr');await h.advance(1);assert.equal(h.displayLocale,'en');
});

test('focus moved without keys or pointer, as by assistive technology, holds the labels',async()=>{
 const h=harness({interactions:true,reducedMotion:true});h.restoreFocus('entry-login');
 await h.advance(20000);assert.equal(h.displayLocale,'fr');assert.equal(h.timers.size,0);
 h.blur();await h.flush();await h.advance(4000);assert.equal(h.displayLocale,'en');
});
