import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createExplorerBand} from '../explorer-band.mjs';

// Refinements §W (26 Oct 2026): « À partir d'une certaine hauteur minimale, je veux que le menu et les boutons ne soient
// plus en bas mais sur le côté gauche », for « Paysage et moins de 720 px » on « Toutes les pages », the labels following
// the width as in the bottom dock and the icons alone when it is too narrow. The rail is responsive-dock.css's; welcome.mjs
// reads the same query for the band, the tooltips and the switch.
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const css=read('responsive-dock.css'),welcome=read('welcome.mjs');
const RAIL='(orientation:landscape) and (max-height:720px)';

// The style rules of a sheet, each with the conditions of the @media blocks around it (any depth); @container blocks are
// kept as conditions too, so that a rule inside one is never taken for the rail's (the rail is no container).
function rulesOf(text){
 const rules=[];
 const walk=(chunk,conditions)=>{
  let index=0;
  while(index<chunk.length){
   const open=chunk.indexOf('{',index);if(open<0)break;
   const prelude=chunk.slice(index,open).trim();
   let depth=1,cursor=open+1;
   while(depth&&cursor<chunk.length){if(chunk[cursor]==='{')depth++;else if(chunk[cursor]==='}')depth--;cursor++;}
   const body=chunk.slice(open+1,cursor-1);
   if(prelude.startsWith('@'))walk(body,[...conditions,prelude.replace(/\s+/g,' ')]);
   else rules.push({conditions,selectors:prelude.split(/,(?![^(]*\))/).map(part=>part.trim().replace(/\s+/g,' ')),
    declarations:body.split(';').map(part=>part.trim()).filter(Boolean).map(part=>{const colon=part.indexOf(':');return [part.slice(0,colon).trim(),part.slice(colon+1).trim()];})});
   index=cursor;
  }
 };
 walk(text.replace(/\/\*[\s\S]*?\*\//g,''),[]);
 return rules;
}
const RULES=rulesOf(css);
// A media query of this sheet against a viewport: features joined by « and » (CSS: portrait when height ≥ width).
function matches(condition,{width,height}){
 if(condition.startsWith('@container'))return false;
 const query=condition.replace(/^@media\s*/,'');
 return query.split(/\s+and\s+/).every(part=>{
  const [,name,value]=part.trim().match(/^\(([\w-]+)\s*:\s*([\w.-]+)\)$/)||assert.fail('unsupported '+part);
  const px=parseFloat(value);
  if(name==='orientation')return value===(height>=width?'portrait':'landscape');
  if(name==='max-height')return height<=px;if(name==='min-height')return height>=px;
  if(name==='max-width')return width<=px;if(name==='min-width')return width>=px;
  if(name==='prefers-reduced-motion')return false;
  return assert.fail('unsupported feature '+name);
 });
}
// The declarations a selector gets at a viewport from this sheet, in source order (later wins).
function style(selector,viewport){
 const out={};
 for(const rule of RULES)if(rule.selectors.includes(selector)&&rule.conditions.every(condition=>matches(condition,viewport)))
  for(const [name,value] of rule.declarations)out[name]=value;
 return out;
}
const SHELL=':root .app[data-navigation=dock] #main>.dock-shell',NAV=SHELL+'>.main-nav.has-dock-search',APP=':root .app[data-navigation=dock]';
const BUTTON=SHELL+'>.main-nav>button[data-section]',LABEL=BUTTON+'>span',RTL_APP=':root[dir=rtl] .app[data-navigation=dock]';
const TOGGLE=SHELL+'>.dock-search-toggle',DICE=':root[data-theme] .app[data-navigation=dock] #main>.dock-shell[data-has-discovery=true]>.dock-random-toggle';
const size=text=>{const [width,height]=text.split('x').map(Number);return {width,height};};
const isRail=viewport=>matches('@media '+RAIL,viewport);
// The rail's custom properties at a viewport, resolved for the arithmetic below (px values and the item clamp).
function rail(viewport,{rtl=false}={}){
 const vars={...style(APP,viewport),...(rtl?style(RTL_APP,viewport):{})};
 const px=name=>parseFloat(vars[name]);
 const top=px('--dock-rail-top'),width=px('--dock-rail-width'),rows=Number(vars['--dock-rail-rows']),fixed=px('--dock-rail-fixed');
 const item=Math.min(48,Math.max(32,(viewport.height-top-16-fixed)/rows)),button=Math.min(44,item);
 const gap=px('--dock-rail-button-gap'),side=rows===6;
 const tail=8+(side?button:2*button+gap),nav=8+5*item+4*2;
 return {vars,top,width,item,button,gap,tail,nav,height:nav+tail,inset:px('--dock-rail-inset'),room:px('--dock-rail-inset')+width+12,side};
}

test('§W the switch rule: a landscape window at most 720 px tall shows the rail; every other window keeps the bottom dock',()=>{
 // One query for both: the stylesheet's rail rules and welcome.mjs's band, tooltips and switch.
 assert.match(welcome,/^const DOCK_RAIL='\(orientation:landscape\) and \(max-height:720px\)';$/m);
 assert.match(welcome,/^const dockRail=matchMedia\(DOCK_RAIL\),dockRailIcons=matchMedia\(DOCK_RAIL\+' and \(max-width:1050px\)'\);$/m);
 // Every rule of the rail (its custom properties, or the shell and the page parts it moves) is inside that query.
 const railRules=RULES.filter(rule=>rule.declarations.some(([name,value])=>/--dock-rail/.test(name+value))||rule.selectors.some(selector=>selector.startsWith(SHELL)));
 assert.ok(railRules.length>20,'the rail\'s rules are found');
 for(const rule of railRules)assert.match(rule.conditions[0]||'',/^@media \(orientation:landscape\) and \(max-height:(720|520)px\)/,'a rule of the rail outside its query: '+rule.selectors.join());
 // « Paysage et moins de 720 px »: 720 px tall included (1280×720 shows the rail), a square window is not landscape.
 for(const viewport of ['1280x720','667x375','640x360','844x390','853x480','1024x600','1366x657','1600x700','2560x719','721x720'])assert.equal(isRail(size(viewport)),true,viewport);
 for(const viewport of ['1280x721','1440x900','1366x768','390x844','375x667','720x720','768x1024','1024x1366','320x640'])assert.equal(isRail(size(viewport)),false,viewport);
 // The rail takes the shell out of the bottom: at the inline start, from the bottom margin up, never across the window.
 const shell=style(SHELL,size('1280x720'));
 assert.equal(shell.bottom,'var(--dock-rail-bottom)');assert.equal(shell.top,'auto');assert.equal(shell.width,'var(--dock-rail-width)');
 assert.equal(shell['flex-direction'],'column');assert.equal(shell.transform,'none');
 assert.deepEqual(style(SHELL,size('1440x900')),{},'no rail rule in a bottom-dock window');
 assert.deepEqual(style(SHELL,size('390x844')),{});
 // Without a container, the bottom dock's stages (its container queries) never reach the rail's buttons.
 assert.equal(style(NAV,size('667x375'))['container-type'],'normal');
});

test('§W the rail fits under the header at every rail height, and its band reaches its foot',()=>{
 // The header's height per case (welcome.css, content-preview.css): 124 / 108 / 76 / 78 / 62 px; the rail starts 8 px under it.
 for(const [viewport,header] of [['1280x720',124],['1366x657',124],['1024x600',108],['853x480',76],['844x390',76],['1280x500',76],['667x375',62],['640x360',62],['700x600',78]]){
  const v=size(viewport),r=rail(v);
  assert.equal(r.top,header+8,viewport+' top');
  const railTop=v.height-16-r.height;
  assert.ok(railTop>=header-1e-9,`${viewport}: the rail (top ${railTop}) stays under the header (${header})`);
  assert.ok(r.item>=32&&r.item<=48&&r.button<=44,viewport+' sizes');
 }
 // Room enough at 1280×720: 48 px rows; at 667×375 the rows share the height: about 37 px.
 assert.equal(rail(size('1280x720')).item,48);
 assert.ok(Math.abs(rail(size('667x375')).item-37)<.01);
 // welcome.mjs: on the rail the band ends at the rail's foot (the window's bottom margin); otherwise at the controls below.
 assert.match(welcome,/getBottomEdge:\(\)=>dockRail\.matches\?document\.querySelector\('\.dock-shell'\)\?\.getBoundingClientRect\(\)\.bottom\?\?null:null\}\);/);
 const observed=[],written={};class Observer{observe(target){observed.push(target);}disconnect(){}}
 const element=rect=>({hidden:false,getClientRects:()=>[rect],getBoundingClientRect:()=>rect,closest:()=>null});
 let edge=704;
 const stage={dataset:{},style:{setProperty(name,value){written[name]=value;}},getBoundingClientRect:()=>({top:0,height:720}),ownerDocument:{defaultView:{ResizeObserver:Observer,innerHeight:720},fonts:{ready:Promise.resolve()}}};
 const band=createExplorerBand({stage,app:{dataset:{section:'explore'}},getTopElements:()=>[element({bottom:162.3})],getBottomElements:()=>[element({top:533}),element({top:571})],getBottomEdge:()=>edge});
 assert.deepEqual({...band.state},{top:178.3,bottom:16,mode:'normal',band:525.7},'1280×720 on the rail: 16 px from the window\'s foot, no 16 px of air on top of it');
 edge=null;assert.deepEqual({...band.measure()},{top:178.3,bottom:203,mode:'normal',band:338.7},'the bottom dock\'s band: the note room\'s top + 16 px');
 assert.equal(written['--explorer-bottom'],'203px');
 // Nothing at the bottom of the content pages either: the content ends with its own margin, and the back-to-top shortcut
 // takes the corner (back-to-top.mjs would lift it over the dock's controls, which now stand beside it).
 const phone=size('667x375');
 assert.equal(style(':root .app[data-navigation=dock] .content-sheet',phone)['padding-bottom'],'calc(72px + env(safe-area-inset-bottom, 0px))');
 assert.equal(style(':root .app[data-navigation=dock] > .back-to-top:not([hidden])',phone).bottom,'var(--dock-rail-bottom) !important');
});

test('§W the rail\'s steps by width: the labels beside the icons wider than 1050 px, the icons alone otherwise, every name kept',()=>{
 const wide=size('1280x720'),narrow=size('1024x600');
 // The labelled step: the dock's first stage, buttons wider than the 112 px a destination needs for it in the dock (560/5).
 const labelled=rail(wide);assert.equal(labelled.width,140);assert.ok(labelled.width-8>=560/5);
 assert.deepEqual([style(BUTTON,wide)['justify-content'],style(LABEL,wide).position,style(LABEL,wide)['clip-path']],['flex-start','static','none']);
 assert.equal(style(LABEL,wide)['text-overflow'],'ellipsis');
 // The icons alone: the label stays in the button, visually hidden (never display:none, visibility:hidden or aria-hidden).
 assert.equal(rail(narrow).width,56);
 assert.deepEqual(style(LABEL,narrow),{position:'absolute','inline-size':'1px','block-size':'1px',overflow:'hidden','clip-path':'inset(50%)','white-space':'nowrap'});
 assert.equal(style(BUTTON,narrow)['justify-content'],'center');
 for(const viewport of [wide,narrow,size('667x375')]){const label=style(LABEL,viewport);assert.notEqual(label.display,'none');assert.notEqual(label.visibility,'hidden');}
 // The boundary is welcome.mjs's: its icons-alone query ends where the labelled rule starts.
 assert.ok(RULES.some(rule=>rule.selectors.includes(LABEL)&&rule.conditions.includes('@media (orientation:landscape) and (max-height:720px) and (min-width:1051px)')));
 assert.equal(rail(size('1051x700')).width,140);assert.equal(rail(size('1050x700')).width,56);
 // The tooltips: each label as its button's title in the icons-alone step, none in the labelled step or the bottom dock.
 const buttons=['Explorer','Projets','Profils','Chroniques','42 Awards'].map(text=>({textContent:' '+text+' ',attributes:{},set title(value){this.attributes.title=value;},get title(){return this.attributes.title;},removeAttribute(name){delete this.attributes[name];}}));
 const context=vm.createContext({buttons,dockRailIcons:{matches:true}});
 vm.runInContext(welcome.match(/^function syncDockTitles\(\)\{[^]*?\n\}/m)[0],context);
 vm.runInContext('syncDockTitles()',context);
 assert.deepEqual(buttons.map(button=>button.attributes.title),['Explorer','Projets','Profils','Chroniques','42 Awards']);
 context.dockRailIcons.matches=false;vm.runInContext('syncDockTitles()',context);
 assert.deepEqual(buttons.map(button=>button.attributes.title),[undefined,undefined,undefined,undefined,undefined]);
 // They follow the language and the step: at each localize() and on the query's change.
 assert.match(welcome,/^ nav\.setAttribute\('aria-label',[^\n]*\);syncDockTitles\(\);$/m);
 assert.match(welcome,/dockRailIcons\.addEventListener\('change',syncDockTitles\);/);
});

test('§W in Arabic the rail stands on the right: logical sides, the page beside it on the left, the search\'s surface mirrored',()=>{
 const shell=rulesOf(css).find(rule=>rule.selectors.includes(SHELL)).declarations.map(([name])=>name);
 // left and right are cleared before the inline start is set: the left side in French and English, the right in Arabic.
 assert.ok(shell.indexOf('left')<shell.indexOf('inset-inline-start')&&shell.indexOf('right')<shell.indexOf('inset-inline-start'));
 const v=size('1280x720');
 assert.equal(style(':root .app[data-navigation=dock] #main',v)['padding-inline-start'],'var(--dock-rail-room)');
 assert.equal(style(':root .app[data-navigation=dock] #main>#explorer.explorer-selector',v)['inset-inline-start'],'var(--dock-rail-room)');
 // The scope bar and the loading status: centred on the page's column, right of the rail, or left of it in Arabic.
 assert.equal(style(':root .app[data-navigation=dock] #main>.scope-bar',v).left,'calc(50vw + var(--dock-rail-room) / 2)');
 assert.equal(style(':root[dir=rtl] .app[data-navigation=dock] #main>.scope-bar',v).left,'calc(50vw - var(--dock-rail-room) / 2)');
 assert.equal(style(':root[dir=rtl] .app[data-navigation=dock] #main>.loading-status',v).left,'calc(50% - var(--dock-rail-room) / 2)');
 // The search's surface opens beside the rail, on its page side.
 const open=SHELL+'[data-search-open=true]>.dock-search-toggle';
 assert.equal(style(open,v).left,'calc(100% + 12px)');
 assert.equal(style(':root[dir=rtl] .app[data-navigation=dock] #main>.dock-shell[data-search-open=true]>.dock-search-toggle',v).left,'calc(-12px - var(--dock-rail-flyout-width))');
 for(const part of ['.dock-search-form','.dock-search-panel'])assert.match(style(SHELL+'>.main-nav '+part,v)['inset-inline-start'],/^calc\(var\(--dock-rail-width\) \+ 1[16]px\)$/);
 // The labelled step's two buttons side by side swap in Arabic: the search on the right, the dice on its left, as the capsule.
 const ltr=rail(v).vars,rtl=rail(v,{rtl:true}).vars;
 assert.equal(ltr['--dock-rail-search-x'],'calc(50% - var(--dock-rail-button) - var(--dock-rail-button-gap) / 2)');
 assert.equal(rtl['--dock-rail-search-x'],'calc(50% + var(--dock-rail-button-gap) / 2)');
 assert.equal(rtl['--dock-rail-dice-x'],ltr['--dock-rail-search-x']);
 // The menu stands upright in every rail (taller than wide), which is how the entrance finds its side (entrance.mjs).
 for(const viewport of ['1280x720','667x375','640x360','1024x600'].map(size)){const r=rail(viewport);assert.ok(r.nav>r.width,'upright');}
});

test('§W the search and the dice become round buttons at the rail\'s foot; the search opens beside the rail as from the capsule',()=>{
 const wide=size('1280x720'),narrow=size('667x375');
 // Closed: round, as large as the rail allows (44 px at most), the magnifier shown and the capsule's words hidden.
 for(const viewport of [wide,narrow]){
  const toggle=style(TOGGLE,viewport),dice=style(DICE,viewport);
  assert.deepEqual([toggle.width,toggle.height,toggle['border-radius'],toggle.left,toggle.bottom],['var(--dock-rail-button)','var(--dock-rail-button)','50%','var(--dock-rail-search-x)','var(--dock-rail-search-bottom)']);
  assert.deepEqual([dice.width,dice.height,dice.left,dice.bottom],['var(--dock-rail-button)','var(--dock-rail-button)','var(--dock-rail-dice-x)','0']);
  assert.equal(style(TOGGLE+'>svg',viewport).display,'block');assert.equal(style(TOGGLE+'>.dock-search-toggle-label',viewport).display,'none');
 }
 // The rail never sets their display: on Awards they stay hidden (awards.css), as under the bottom dock.
 for(const viewport of [wide,narrow])assert.equal(style(TOGGLE,viewport).display,undefined);
 // The bottom dock's capsule keeps its words only.
 assert.deepEqual(style(':root .app[data-navigation=dock] .dock-shell > .dock-search-toggle > svg',size('1440x900')),{display:'none'});
 // Side by side in the labelled step (the search first), stacked otherwise (the search above the dice); the shell keeps their room.
 const w=rail(wide),n=rail(narrow);
 assert.equal(w.vars['--dock-rail-search-bottom'],'0px');assert.equal(w.vars['--dock-rail-tail'],'calc(8px + var(--dock-rail-button))');
 assert.equal(n.vars['--dock-rail-search-bottom'],'calc(var(--dock-rail-button) + var(--dock-rail-button-gap))');
 assert.equal(n.vars['--dock-rail-dice-x'],'var(--dock-rail-search-x)');
 assert.equal(style(SHELL,wide).padding,'0 0 var(--dock-rail-tail)');
 // Open: the button grows into one glass surface beside the rail, level with its own foot, the field at its bottom and
 // the results above (the measured panel's height + the field's 60 px); the dice fades as under the capsule.
 const open=style(SHELL+'[data-search-open=true]>.dock-search-toggle',wide);
 assert.deepEqual([open.width,open.height,open.bottom],['var(--dock-rail-flyout-width)','calc(var(--dock-results-height, 120px) + var(--dock-rail-form))','calc(var(--dock-rail-search-bottom) + var(--dock-keyboard-offset, 0px))']);
 assert.equal(style(DICE.replace('[data-has-discovery=true]','[data-has-discovery=true][data-search-open=true]'),wide).transform,'scale(.86)');
 // The rail stays, dimmed (its buttons are inert while the search is open).
 assert.equal(style(SHELL+'>.main-nav[data-search-open=true]>:is(button[data-section],.nav-indicator)',wide).opacity,'.32');
 // The current destination keeps its marker, now moving down the rail.
 const indicator=style(SHELL+'>.main-nav>.nav-indicator',narrow);
 assert.equal(indicator.top,'calc(4px + var(--dock-indicator-slot) * (var(--dock-rail-item) + 2px))');
 assert.equal(indicator.transform,'none !important');
});

test('§W the dock and the rail swap at once on a resize or a rotation, with their state',()=>{
 const switchDock=welcome.match(/^function switchDock\(\)\{[^]*?\n\}/m)[0];
 const frames=[],calls=[],app={dataset:{}};
 const context=vm.createContext({app,requestAnimationFrame:callback=>frames.push(callback),syncDockTitles:()=>calls.push('titles'),explorerBand:{measure:()=>calls.push('band')},moveIndicator:()=>calls.push('indicator')});
 vm.runInContext(switchDock,context);vm.runInContext('switchDock()',context);
 assert.equal(app.dataset.dockSwitch,'true');assert.deepEqual(calls,['titles','band','indicator']);
 frames.shift()();assert.equal(app.dataset.dockSwitch,'true','still for the frame of the switch');
 frames.shift()();assert.equal(app.dataset.dockSwitch,undefined);
 assert.match(welcome,/^dockRail\.addEventListener\('change',switchDock\);/m);
 // That frame has no transition in the dock (responsive-dock.css): its parts take their other place at once.
 assert.ok(RULES.some(rule=>rule.selectors.includes(':root .app[data-navigation=dock][data-dock-switch] :is(.dock-shell,.dock-shell *)')&&rule.declarations.some(([name,value])=>name==='transition'&&value==='none !important')));
});
