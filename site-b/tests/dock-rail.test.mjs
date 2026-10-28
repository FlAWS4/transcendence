import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createExplorerBand} from '../explorer-band.mjs';

// Refinements §W (26 Oct 2026): « À partir d'une certaine hauteur minimale, je veux que le menu et les boutons ne soient
// plus en bas mais sur le côté gauche », for « Paysage et moins de 720 px » on « Toutes les pages », the labels following
// the width as in the bottom dock and the icons alone when it is too narrow. Refinements §X (26 Oct 2026): « Je veux que le
// nouveau menu, quand la hauteur devient trop faible, soit dans le même style que le menu dans les premières versions du
// site A », then « Le menu est beaucoup trop gros, réduis la taille, recentre un peu ça, et pour les deux boutons du bas
// fais-en uniquement des icônes finalement » and « Le menu ne doit plus être affecté par l'effet de disparition lorsqu'il
// passe à gauche » (« Moyenne, environ 70 % », « Centré en hauteur »), and « Le bouton pour la sélection au hasard doit
// passer sous la recherche quand le texte du menu à gauche disparaît ». The rail is responsive-dock.css's; welcome.mjs reads
// the same query for the band, the tooltips and the switch; the old menu's values are welcome.css's base .main-nav,
// .main-nav button and .nav-indicator rules.
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const css=read('responsive-dock.css'),welcome=read('welcome.mjs'),search=read('dock-search.mjs');
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
const RULES=rulesOf(css),OLD=rulesOf(read('welcome.css'));
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
  if(name==='prefers-reduced-motion'||name==='forced-colors')return false;
  return assert.fail('unsupported feature '+name);
 });
}
// The declarations a selector gets at a viewport from this sheet, in source order (later wins).
function style(selector,viewport,rules=RULES){
 const out={};
 for(const rule of rules)if(rule.selectors.includes(selector)&&rule.conditions.every(condition=>matches(condition,viewport)))
  for(const [name,value] of rule.declarations)out[name]=value;
 return out;
}
// The old menu's declarations for a selector of welcome.css, in its base rules or in one @media block.
const old=(selector,condition='')=>Object.fromEntries(OLD.filter(rule=>rule.selectors.includes(selector)&&(rule.conditions[0]||'')===condition).flatMap(rule=>rule.declarations));
const OLD_MIDDLE='@media(max-width:1050px) and (min-width:701px)',OLD_NARROW='@media(max-width:700px)';
const SHELL=':root .app[data-navigation=dock] #main>.dock-shell',NAV=SHELL+'>.main-nav.has-dock-search',APP=':root .app[data-navigation=dock]';
const BUTTON=SHELL+'>.main-nav>button[data-section]',LABEL=BUTTON+'>span',RTL_APP=':root[dir=rtl] .app[data-navigation=dock]';
const TOGGLE=SHELL+'>.dock-search-toggle',DICE=':root[data-theme] .app[data-navigation=dock] #main>.dock-shell[data-has-discovery=true]>.dock-random-toggle';
const PILL=SHELL+'>.main-nav>.nav-indicator',LIGHT=':root[data-theme=light] .app[data-navigation=dock] #main>.dock-shell';
const size=text=>{const [width,height]=text.split('x').map(Number);return {width,height};};
const isRail=viewport=>matches('@media '+RAIL,viewport);
// A length of the rail at a viewport, computed from the sheet's own expression (var() with its fallback, calc(), clamp(),
// min(), max(); px, svh, vw and % of a given base; no safe area).
function length(expression,vars,viewport,percent=NaN){
 let js=expression;
 for(let depth=0;/var\(/.test(js);depth++){
  assert.ok(depth<20,'var() too deep: '+expression);
  js=js.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g,(_,name,fallback)=>'('+(vars[name]??fallback??assert.fail('unset '+name))+')');
 }
 js=js.replace(/env\([^()]*\)/g,'0').replace(/(\d*\.?\d+)svh/g,(_,n)=>String(n*viewport.height/100)).replace(/(\d*\.?\d+)vw/g,(_,n)=>String(n*viewport.width/100))
  .replace(/(\d*\.?\d+)%/g,(_,n)=>String(n*percent/100)).replace(/(\d*\.?\d+)px/g,'$1').replace(/\bcalc\(/g,'(').replace(/\bmin\(/g,'Math.min(').replace(/\bmax\(/g,'Math.max(');
 assert.match(js,/^[\d\s.+\-*/(),a-zA-Z]*$/,'a plain arithmetic expression: '+js);
 return Function('clamp','return '+js)((low,value,high)=>Math.max(low,Math.min(value,high)));
}
// The rail at a viewport: its custom properties and, from them, its geometry (the bottom margin is 16 px): the five rows
// and their gaps (the nav), then the break and the row of the search and the dice (the shell's tail; in the icons-alone
// column, the search's row, a gap and the dice's).
function rail(viewport,{rtl=false}={}){
 const vars={...style(APP,viewport),...(rtl?style(RTL_APP,viewport):{})};
 const value=(name,percent)=>length(vars[name]??assert.fail('unset '+name),vars,viewport,percent);
 const row=value('--dock-rail-row'),gap=value('--dock-rail-gap'),pause=value('--dock-rail-break'),lift=value('--dock-rail-lift');
 const nav=5*row+4*gap,tail=value('--dock-rail-tail'),height=nav+tail,bottom=viewport.height-16-lift,width=value('--dock-rail-width');
 return {vars,value,top:value('--dock-rail-top'),free:value('--dock-rail-free'),row,gap,pause,lift,nav,tail,height,bottom,railTop:bottom-height,width,
  part:value('--dock-rail-part'),block:value('--dock-rail-block'),
  inset:value('--dock-rail-inset'),cell:value('--dock-rail-cell'),pad:value('--dock-rail-pad'),icon:value('--dock-rail-icon'),iconGap:value('--dock-rail-icon-gap'),
  label:value('--dock-rail-label'),pairGap:value('--dock-rail-pair-gap'),full:value('--dock-rail-row-max'),room:value('--dock-rail-room'),
  searchX:value('--dock-rail-search-x',width),searchY:value('--dock-rail-search-y'),diceX:value('--dock-rail-dice-x',width)};
}
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-6,`${message}: ${actual} ≠ ${expected}`);
// welcome.mjs's copy (the page's three languages) with its t(), as the page evaluates them.
const copySource=[welcome.match(/^const copy = \{[^]*?\n\};$/m)[0],...welcome.match(/^Object\.assign\(copy\.(?:fr|en|ar), \{[^]*?\n\}\);$/gm),welcome.match(/^const t = [^\n]+$/m)[0]].join('\n');
// The header's inline padding (welcome.css), where its 42 starts: 48 px, 32 px from 701 to 1050 px, 22 px at 700 px and less.
const headerSide=condition=>parseFloat(old('.header',condition).padding.split(' ').at(-1));

test('§W the switch rule: a landscape window at most 720 px tall shows the rail; every other window keeps the bottom dock',()=>{
 // One query for both: the stylesheet's rail rules and welcome.mjs's band, tooltips and switch.
 assert.match(welcome,/^const DOCK_RAIL='\(orientation:landscape\) and \(max-height:720px\)';$/m);
 assert.match(welcome,/^const dockRail=matchMedia\(DOCK_RAIL\),dockRailIcons=matchMedia\(DOCK_RAIL\+' and \(max-width:700px\)'\);$/m);
 // Every rule of the rail (its custom properties, or the shell and the page parts it moves) is inside that query.
 const railRules=RULES.filter(rule=>rule.declarations.some(([name,value])=>/--dock-rail/.test(name+value))||rule.selectors.some(selector=>selector.startsWith(SHELL)));
 assert.ok(railRules.length>30,'the rail\'s rules are found');
 for(const rule of railRules)assert.match(rule.conditions[0]||'',/^@media \(orientation:landscape\) and \(max-height:(720|520)px\)/,'a rule of the rail outside its query: '+rule.selectors.join());
 // « Paysage et moins de 720 px »: 720 px tall included (1280×720 shows the rail), a square window is not landscape.
 for(const viewport of ['1280x720','667x375','640x360','844x390','853x480','1024x600','1366x657','1600x700','2560x719','721x720'])assert.equal(isRail(size(viewport)),true,viewport);
 for(const viewport of ['1280x721','1440x900','1366x768','390x844','375x667','720x720','768x1024','1024x1366','320x640'])assert.equal(isRail(size(viewport)),false,viewport);
 // The rail takes the shell out of the bottom: at the inline start, lifted from the bottom margin (§X), never across the window.
 const shell=style(SHELL,size('1280x720'));
 assert.deepEqual([shell.top,shell.bottom,shell['margin-bottom'],shell.width,shell['flex-direction'],shell.transform],['auto','var(--dock-rail-bottom)','var(--dock-rail-lift)','var(--dock-rail-width)','column','none']);
 assert.deepEqual(style(SHELL,size('1440x900')),{},'no rail rule in a bottom-dock window');
 assert.deepEqual(style(SHELL,size('390x844')),{});
 // Without a container, the bottom dock's stages (its container queries) never reach the rail's buttons.
 assert.equal(style(NAV,size('667x375'))['container-type'],'normal');
});

test('§X the old menu\'s look: no panel, muted rows and icon buttons, the current destination over one soft pill (turquoise in light, plum in dark)',()=>{
 const v=size('1280x720');
 // No panel: the dock's glass (the nav's ::before) is not drawn, the nav has no border; the closed search and the dice have
 // no background, border, shadow or blur of their own.
 assert.equal(style(':root[data-theme] .app[data-navigation=dock] #main>.dock-shell>.main-nav.has-dock-search::before',v).content,'none');
 assert.deepEqual([style(NAV,v).border,style(NAV,v).padding],['0','0 8px']);
 const closed=style(':root[data-theme] .app[data-navigation=dock] #main>.dock-shell:not([data-search-open=true])>.dock-search-toggle',v),dice=style(DICE,v);
 for(const part of [closed,dice]){
  assert.equal(part.background,'transparent');assert.equal(part['box-shadow'],'none');assert.equal(part['backdrop-filter'],'none');assert.equal(part['-webkit-backdrop-filter'],'none');
 }
 assert.equal(closed['border-width'],'0');assert.equal(dice.border,'0');
 // Each destination row and both icon buttons: the icon (stroke 1.6, as the old .main-nav button svg) at the row's padding
 // from its start, in the page's muted colour (taken outside the dock's glass controls), the text colour on hover, rounded
 // as the old 66 px rows (22 px), in proportion.
 const oldButton=old('.main-nav button'),oldIcon=old('.main-nav button svg');
 assert.deepEqual([oldButton['min-height'],oldButton['border-radius']],['66px','22px']);
 for(const selector of [BUTTON,TOGGLE,DICE]){
  const row=style(selector,v);
  assert.deepEqual([row['justify-content'],row['flex-direction'],row['border-radius'],row.color,row['font-weight'],row.padding],
   ['flex-start','row','calc(var(--dock-rail-row) * 22 / 66)','var(--dock-rail-muted)',oldButton['font-weight'],'0 var(--dock-rail-pad)'],selector);
  const icon=style(selector+'>svg',v);
  assert.deepEqual([icon.width,icon.height,icon.flex,icon['stroke-width'],icon.transform],['var(--dock-rail-icon)','var(--dock-rail-icon)','0 0 var(--dock-rail-icon)',oldIcon['stroke-width'],'none'],selector);
 }
 assert.equal(style(APP,v)['--dock-rail-muted'],'var(--h42-color-muted)');
 assert.equal(old('.main-nav button').color,'var(--h42-color-muted)');assert.equal(old(':root[data-theme=light] .main-nav button').color,'#536163');
 for(const selector of [BUTTON+':hover',TOGGLE+':hover',DICE+':not(:disabled):hover'])assert.equal(style(selector,v).color,'var(--h42-color-text)',selector);
 // The same hover: the dock turns the magnifier and the dice on hover (dock-search.css, welcome.css); on the rail their icons
 // keep still, as the rows' (above, an id in each selector outweighs those rules). The same focus: the dice's ring as the
 // rows' (welcome.css's buttons, 5 px out; the dock's dice, 4 px).
 assert.equal(style(':root .app[data-navigation=dock] .dock-shell > .dock-search-toggle:hover svg',size('1440x900'),rulesOf(read('dock-search.css'))).transform,'rotate(-12deg)');
 assert.equal(old('.random-campus:not(:disabled):hover svg').transform,'rotate(-12deg)');
 assert.equal(old('button:focus-visible')['outline-offset'],'5px');
 assert.equal(style(DICE+':focus-visible',v)['outline-offset'],old('button:focus-visible')['outline-offset']);
 // The current destination: the text colour, weight 500, its icon turned and coloured (pink; teal 75 % in ink in light).
 const current=style(BUTTON+'[aria-current]',v),currentIcon=style(BUTTON+'[aria-current]>svg',v);
 assert.deepEqual([current.color,current['font-weight']],[old('.main-nav button[aria-current]').color,old('.main-nav button[aria-current]')['font-weight']]);
 assert.deepEqual([currentIcon.color,currentIcon.transform],[old('.main-nav button[aria-current] svg').color,old('.main-nav button[aria-current] svg').transform]);
 assert.equal(currentIcon.transform,'rotate(-8deg) scale(1.08)');
 assert.equal(style(LIGHT+'>.main-nav>button[data-section][aria-current]>svg',v).color,old(':root[data-theme=light] .main-nav button[aria-current] svg').color);
 // One soft pill behind it, rounded as the old pill (23 px on 66 px rows) in proportion, gliding from row to row with the
 // old menu's transform transition: dark, the old plum pill (--warm-soft, --warm-line); light, the turquoise pill of
 // welcome.css's light theme, value for value.
 const pill=style(PILL,v),oldPill=old('.nav-indicator');
 assert.equal(oldPill['border-radius'],'23px');
 assert.deepEqual([pill['border-radius'],pill.background,pill.border,pill['box-shadow']],['calc(var(--dock-rail-row) * 23 / 66)',oldPill.background,oldPill.border,'none']);
 assert.equal(pill.transition.split(',')[0],oldPill.transition.split(',')[0]);assert.equal(oldPill.transition.split(',')[0],'transform .48s var(--ease)');
 assert.deepEqual(style(LIGHT+'>.main-nav>.nav-indicator',v),old(':root[data-theme=light] .nav-indicator'));
 // As tall as a row, from the inline start of the rows, moved down by whole rows: the slot of the current section (0 to 4,
 // the destinations only).
 assert.deepEqual([pill.top,pill.left,pill.right,pill['inset-inline-start'],pill.height],['0','auto','auto','8px','var(--dock-rail-row) !important']);
 assert.equal(pill.transform,'translateY(calc(var(--dock-indicator-slot) * (var(--dock-rail-row) + var(--dock-rail-gap)))) !important');
 const slots=RULES.flatMap(rule=>rule.declarations.filter(([name])=>name==='--dock-indicator-slot').map(([,value])=>Number(value)));
 assert.deepEqual([...new Set(slots)].sort(),[0,1,2,3,4],'the pill never goes to the search or the dice');
 // The search and the dice stand outside the menu (the nav holds the pill): the shell holds them after it.
 assert.match(search,/shell\.append\(nav, toggle\);/);assert.match(welcome,/^nav\.parentElement\.append\(discoveryButton\);$/m);
 // Forced colours: the pill and the current destination in system colours, over both themes' colours.
 const forced=RULES.filter(rule=>rule.conditions.some(condition=>condition.includes('(forced-colors:active)')));
 assert.deepEqual(Object.fromEntries(forced.find(rule=>rule.selectors.includes(':root[data-theme] .app[data-navigation=dock] #main>.dock-shell>.main-nav>.nav-indicator')).declarations),{background:'Canvas',border:'2px solid Highlight','box-shadow':'none'});
 assert.deepEqual(forced.find(rule=>rule.selectors.includes(':root[data-theme] .app[data-navigation=dock] #main>.dock-shell>.main-nav>button[data-section][aria-current]>svg')).declarations,[['color','Highlight']]);
 assert.ok(forced.every(rule=>rule.conditions[0].startsWith('@media '+RAIL)));
});

test('§X the steps at about 70 % of the old menu: 18 px labels in a 180 px menu wider than 1050 px, 16 px labels in a 150 px menu down to 701 px, the icons alone at 700 px and less',()=>{
 const wide=rail(size('1280x720')),middle=rail(size('1024x600')),narrow=rail(size('667x375'));
 // The corrections' sizes: wider than 1050 px, labels 18 px, icons 20 px, rows 44 px, a 180 px menu; from 701 to 1050 px,
 // labels 16 px, rows 40 px (icons 18 px); at 700 px and less, the icons alone, 18 px, in rows as wide as tall (40 px), one
 // column a cell wide (a 56 px menu, the dice under the search: below).
 assert.deepEqual([wide.label,wide.icon,wide.full,wide.width],[18,20,44,180]);
 assert.deepEqual([middle.label,middle.icon,middle.full,middle.width],[16,18,40,150]);
 assert.deepEqual([narrow.icon,narrow.full,narrow.cell,narrow.width],[18,40,40,56]);
 // The rest in proportion, about 70 % of the old menu's values (welcome.css: the base rules, then the 701–1050 px block).
 const oldWide={nav:old('.main-nav'),button:old('.main-nav button')},oldMiddle={nav:old('.main-nav',OLD_MIDDLE),button:old('.main-nav button',OLD_MIDDLE)};
 assert.deepEqual([oldWide.nav.width,oldWide.button['font-size'],oldWide.button['min-height'],oldWide.button.padding,oldWide.button.gap,oldWide.nav.gap],['248px','26px','66px','15px 20px','19px','12px']);
 assert.deepEqual([oldMiddle.nav.width,oldMiddle.button['font-size'],oldMiddle.button.padding,oldMiddle.button.gap],['206px','23px','15px 16px','12px']);
 const about70=(value,was,what)=>assert.ok(value/was>=.65&&value/was<=.75,`${what}: ${value} for ${was} (${Math.round(value/was*100)} %)`);
 for(const [value,was,what] of [[wide.label,26,'wide label'],[wide.full,66,'wide row'],[wide.width,248,'wide menu'],[wide.pad,20,'wide padding'],[wide.iconGap,19,'wide icon gap'],[wide.gap,12,'wide gap'],
  [middle.label,23,'middle label'],[middle.width,206,'middle menu'],[middle.pad,16,'middle padding'],[middle.iconGap,12,'middle icon gap']])about70(value,was,what);
 near(wide.gap,8,'wide gap');assert.equal(Math.round(wide.icon*middle.full/wide.full),middle.icon,'the middle step\'s icons in proportion to its rows');
 // The steps' place: the wide menu at the old menu's 48 px, the header's side; in the two narrower steps the pill (8 px in the
 // menu) lines up with the header's 42, as in the old middle step (24 + 8 = 32 px).
 assert.equal(old('.main-nav').left,'48px');assert.equal(old('.main-nav',OLD_MIDDLE).left,'24px');
 assert.deepEqual([wide.inset,middle.inset,narrow.inset],[48,24,14]);
 assert.equal(wide.inset,headerSide(''));assert.equal(middle.inset+8,headerSide(OLD_MIDDLE));assert.equal(narrow.inset+8,headerSide(OLD_NARROW));
 // In windows at most 520 px tall the header's side is 32 px (content-preview.css; 22 px at 700 px and less): the wide menu
 // keeps to it, the narrower steps' pills too.
 const shortHeader=rulesOf(read('content-preview.css')).filter(rule=>rule.selectors.includes(':root .app[data-navigation=dock] .header')&&rule.conditions[0]==='@media (max-height: 520px)');
 assert.equal(Object.fromEntries(shortHeader.flatMap(rule=>rule.declarations)).padding,'16px 32px');
 assert.deepEqual([rail(size('1280x500')).inset,rail(size('1024x500')).inset+8,rail(size('667x375')).inset+8],[32,32,22]);
 // The rows: as wide as the menu where the labels show (the pill too), as wide as an icon in its padding otherwise.
 for(const viewport of ['1280x720','1024x600','701x500'].map(size)){
  assert.equal(style(BUTTON,viewport).width,'auto');assert.equal(style(PILL,viewport).width,'calc(100% - 16px) !important');
 }
 assert.equal(style(BUTTON,size('667x375')).width,'var(--dock-rail-cell)');assert.equal(style(PILL,size('667x375')).width,'var(--dock-rail-cell) !important');
 assert.equal(narrow.cell,narrow.pad+narrow.icon+narrow.pad);
 // The labels beside their icons from 701 px on, at the step's size; the longest (« Chroniques », « Chronicles », 88 px at
 // 18 px and 78 px at 16 px in Jost) fits its row: 103 px and 86 px of room.
 for(const viewport of ['1280x720','1024x600','701x500'].map(size)){
  const label=style(LABEL,viewport);
  assert.deepEqual([label.position,label['clip-path'],label['text-overflow'],label['white-space'],label.overflow,label['font-size']],['static','none','ellipsis','nowrap','hidden','var(--dock-rail-label)']);
 }
 assert.equal(wide.width-16-wide.pad-wide.icon-wide.iconGap-wide.pad,103);assert.equal(middle.width-16-middle.pad-middle.icon-middle.iconGap-middle.pad,86);
 // At 700 px and less, the labels stay in their buttons, visually hidden (never display:none, visibility:hidden or aria-hidden).
 assert.deepEqual(style(LABEL,size('667x375')),{position:'absolute','inline-size':'1px','block-size':'1px',overflow:'hidden','clip-path':'inset(50%)','white-space':'nowrap'});
 // The boundaries: the steps' queries and welcome.mjs's icons-alone query meet at 700/701 and 1050/1051 px.
 for(const [viewport,width] of [['1051x700',180],['1050x700',150],['701x690',150],['700x690',56]])assert.equal(rail(size(viewport)).width,width,viewport);
 assert.ok(RULES.some(rule=>rule.selectors.includes(LABEL)&&rule.conditions.includes('@media (orientation:landscape) and (max-height:720px) and (min-width:701px)')));
 // The tooltips: each label as its button's title in the icons-alone step, none in the labelled steps or the bottom dock.
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

test('§X centred in the free height between the header and the bottom margin, air above and below; the rows shrink together to a 32 px floor, never over the header',()=>{
 // The free height: from 8 px under the header to the 16 px bottom margin. The five rows, their four gaps (2/11 of a row,
 // the old 12 px of 66), the break (3/11) and the row of the search and the dice make seven rows.
 assert.equal(old('.main-nav').gap,'12px');
 const full=rail(size('1280x720'));
 assert.deepEqual([full.top,full.free,full.row,full.gap,full.pause,full.height,full.lift],[132,572,44,8,12,308,132]);
 assert.deepEqual([full.railTop,full.bottom],[264,572]);
 // Centred, with air above and below: 132 px between the rail and each end of the free height (140 px under the header).
 near(full.railTop-full.top,720-16-full.bottom,'1280×720 centred');assert.equal(full.railTop-full.top,132);
 const middle=rail(size('1024x600'));assert.deepEqual([middle.row,middle.height,middle.railTop,middle.bottom],[40,280,210,490]);
 // The header's height per case (welcome.css, content-preview.css): 124 / 108 / 76 / 78 / 62 px; the free height starts 8 px under it.
 for(const [viewport,header] of [['1280x720',124],['1366x657',124],['1600x700',124],['1024x600',108],['853x480',76],['844x390',76],['1280x500',76],['667x375',62],['640x360',62],['700x600',78],['740x360',76],['568x320',62],['1280x380',76]]){
  const v=size(viewport),r=rail(v);
  assert.equal(r.top,header+8,viewport+' top');
  assert.ok(r.row>=32&&r.row<=r.full,viewport+' rows');
  // The gaps and the break in elevenths of a row; where the labels show, in proportion, and seven rows (the icons-alone
  // column, 700 px wide and less, has its own share: its test below).
  near(r.gap,2*r.part,viewport+' gaps');near(r.pause,3*r.part,viewport+' break');near(r.height,r.block,viewport+' the block');
  if(v.width>700){near(r.part,r.row/11,viewport+' in proportion');near(r.height,7*r.row,viewport+' seven rows');}
  // Never over the header nor under the bottom margin while 32 px rows fit (all these windows), and centred.
  assert.ok(r.railTop>=r.top-1e-9&&r.bottom<=v.height-16+1e-9,`${viewport}: the rail (${r.railTop} to ${r.bottom}) within its free height`);
  near(r.railTop-r.top,v.height-16-r.bottom,viewport+' centred');
 }
 // At full size where the free height allows it; shorter rows filling it otherwise: 844×390 keeps its 40 px rows with 5 px
 // to spare at each end, 740×360 fills it (about 37 px).
 const phone=rail(size('844x390'));assert.deepEqual([phone.row,phone.height,phone.lift],[40,280,5]);
 near(rail(size('740x360')).row,260/7,'740×360');
 assert.equal(rail(size('1280x380')).row,40);assert.equal(rail(size('1280x380')).lift,0);
 // The 32 px floor: under it (a free height under 224 px) the block keeps under the header and runs into the bottom margin.
 const floor=rail(size('1280x310'));assert.deepEqual([floor.row,floor.height],[32,224]);
 near(floor.railTop,floor.top,'1280×310 under the header');near(floor.bottom,310-16+14,'1280×310 14 px into the margin');
 // The labels keep their step's size at every height: their line (dock-search.css's 1.25) fits the 32 px floor.
 const lineHeight=Number(style(':root .app[data-navigation=dock] .main-nav.has-dock-search > button[data-section]',size('1440x900'),rulesOf(read('dock-search.css')))['line-height']);
 assert.equal(lineHeight,1.25);assert.ok(18*lineHeight<32);
 // welcome.mjs: on the rail the band reaches the window's bottom margin (the shell's foot plus its lift), whatever the
 // rail's own height; under the bottom dock, the controls below bound it as before.
 const edge=welcome.match(/getBottomEdge:(\(\)=>\{[^\n]*?\}),?\}\);$/m)[1];
 const shell={getBoundingClientRect:()=>({bottom:572})},context=vm.createContext({dockRail:{matches:true},document:{querySelector:selector=>selector==='.dock-shell'?shell:null},getComputedStyle:node=>({marginBottom:node===shell?'132px':'0px'})});
 const bottomEdge=vm.runInContext('('+edge+')',context);
 assert.equal(bottomEdge(),704);context.dockRail.matches=false;assert.equal(bottomEdge(),null);
 const observed=[],written={};class Observer{observe(target){observed.push(target);}disconnect(){}}
 const element=rect=>({hidden:false,getClientRects:()=>[rect],getBoundingClientRect:()=>rect,closest:()=>null});
 let bound=704;
 const stage={dataset:{},style:{setProperty(name,value){written[name]=value;}},getBoundingClientRect:()=>({top:0,height:720}),ownerDocument:{defaultView:{ResizeObserver:Observer,innerHeight:720},fonts:{ready:Promise.resolve()}}};
 const band=createExplorerBand({stage,app:{dataset:{section:'explore'}},getTopElements:()=>[element({bottom:162.3})],getBottomElements:()=>[element({top:533}),element({top:571})],getBottomEdge:()=>bound});
 assert.deepEqual({...band.state},{top:178.3,bottom:16,mode:'normal',band:525.7},'1280×720 on the rail: 16 px from the window\'s foot, no 16 px of air on top of it');
 bound=null;assert.deepEqual({...band.measure()},{top:178.3,bottom:203,mode:'normal',band:338.7},'the bottom dock\'s band: the note room\'s top + 16 px');
 assert.equal(written['--explorer-bottom'],'203px');
 // Nothing at the bottom of the content pages either: the content ends with its own margin, and the back-to-top shortcut
 // takes the corner (back-to-top.mjs would lift it over the dock's controls, which now stand beside it).
 const landscape=size('667x375');
 assert.equal(style(':root .app[data-navigation=dock] .content-sheet',landscape)['padding-bottom'],'calc(72px + env(safe-area-inset-bottom, 0px))');
 assert.equal(style(':root .app[data-navigation=dock] > .back-to-top:not([hidden])',landscape).bottom,'var(--dock-rail-bottom) !important');
});

test('§W in Arabic the rail stands on the right: logical sides, the page beside it on the left, the search\'s surface mirrored',()=>{
 const shell=rulesOf(css).find(rule=>rule.selectors.includes(SHELL)).declarations.map(([name])=>name);
 // left and right are cleared before the inline start is set: the left side in French and English, the right in Arabic.
 assert.ok(shell.indexOf('left')<shell.indexOf('inset-inline-start')&&shell.indexOf('right')<shell.indexOf('inset-inline-start'));
 const pill=RULES.find(rule=>rule.selectors.includes(PILL)&&rule.conditions.length===1).declarations.map(([name])=>name);
 assert.ok(pill.indexOf('left')<pill.indexOf('inset-inline-start')&&pill.indexOf('right')<pill.indexOf('inset-inline-start'));
 const v=size('1280x720');
 assert.equal(style(':root .app[data-navigation=dock] #main',v)['padding-inline-start'],'var(--dock-rail-room)');
 assert.equal(style(':root .app[data-navigation=dock] #main>#explorer.explorer-selector',v)['inset-inline-start'],'var(--dock-rail-room)');
 // The page's column starts 12 px after the rail: 240 px at 1280×720, 186 px at 1024×600, 82 px at 667×375.
 assert.deepEqual(['1280x720','1024x600','667x375'].map(viewport=>rail(size(viewport)).room),[240,186,82]);
 // The scope bar and the loading status: centred on the page's column, right of the rail, or left of it in Arabic.
 assert.equal(style(':root .app[data-navigation=dock] #main>.scope-bar',v).left,'calc(50vw + var(--dock-rail-room) / 2)');
 assert.equal(style(':root[dir=rtl] .app[data-navigation=dock] #main>.scope-bar',v).left,'calc(50vw - var(--dock-rail-room) / 2)');
 assert.equal(style(':root[dir=rtl] .app[data-navigation=dock] #main>.loading-status',v).left,'calc(50% - var(--dock-rail-room) / 2)');
 // The rows mirror with the document (row direction, start-aligned, the narrow rows at the column's start).
 for(const selector of [BUTTON,TOGGLE,DICE])assert.equal(style(selector,v)['justify-content'],'flex-start');
 assert.equal(style(NAV,v)['align-items'],'stretch');assert.equal(style(NAV,v).padding,'0 8px');
 // The search under the destinations' icons and the dice beside it, on the right in Arabic, the dice then on its left; in
 // the icons-alone column the dice under the search, on the right with it.
 for(const viewport of ['1280x720','1024x600'].map(size)){
  const ltr=rail(viewport),rtl=rail(viewport,{rtl:true});
  assert.deepEqual([ltr.searchX,ltr.diceX],[8,8+ltr.cell+ltr.pairGap]);
  assert.deepEqual([rtl.searchX+rtl.cell,rtl.diceX+rtl.cell],[rtl.width-8,rtl.width-8-rtl.cell-rtl.pairGap]);
 }
 for(const viewport of ['667x375','568x320'].map(size)){
  const ltr=rail(viewport),rtl=rail(viewport,{rtl:true});
  assert.deepEqual([ltr.searchX,ltr.diceX],[8,8]);
  assert.deepEqual([rtl.searchX+rtl.cell,rtl.diceX+rtl.cell],[rtl.width-8,rtl.width-8]);
 }
 // The search's surface opens beside the rail, on its page side.
 const open=SHELL+'[data-search-open=true]>.dock-search-toggle';
 assert.equal(style(open,v).left,'calc(100% + 12px)');
 assert.equal(style(':root[dir=rtl] .app[data-navigation=dock] #main>.dock-shell[data-search-open=true]>.dock-search-toggle',v).left,'calc(-12px - var(--dock-rail-flyout-width))');
 // The field and the results from the nav's padding box (no border): the field 5 px inside the surface, the results on it.
 assert.equal(style(SHELL+'>.main-nav .dock-search-form',v)['inset-inline-start'],'calc(var(--dock-rail-width) + 17px)');
 assert.equal(style(SHELL+'>.main-nav .dock-search-panel',v)['inset-inline-start'],'calc(var(--dock-rail-width) + 12px)');
 // The menu stands upright in every rail, even at the 32 px floor (5 × 32 + 4 × 5.8 = 183 px for the widest, 180 px menu):
 // that is how the entrance (entrance.mjs) and the search (dock-search.mjs) find its side; the bottom dock lies across.
 for(const viewport of ['1280x720','1280x310','1051x300','1050x300','1024x600','701x300','667x375','640x360','568x320'].map(size)){
  const r=rail(viewport);assert.ok(r.nav>r.width,'upright');assert.ok(r.inset+r.width<viewport.width/2,'beside the middle');
 }
 assert.match(read('entrance.mjs'),/side=dock&&dock\.height>dock\.width\?/);
 assert.match(search,/if \(navBox && navBox\.height > navBox\.width\) return;/);
});

test('§X the search and the dice: two icon buttons under the destinations, side by side where the labels show, the dice under the search in the icons-alone column; named and with their tooltips; the search opens beside the rail as from the capsule',()=>{
 const wide=size('1280x720'),narrow=size('667x375');
 // In the shell's tail, after the break: the search under the destinations' icons (the same 8 px and padding from the side),
 // the dice on the shell's foot; each an icon in its row's padding, as tall as a row.
 for(const viewport of [wide,size('1024x600'),narrow]){
  const toggle=style(TOGGLE,viewport),die=style(DICE,viewport),r=rail(viewport);
  assert.deepEqual([toggle.left,toggle.right,toggle.top,toggle.bottom,toggle.width,toggle.height,toggle.transform],['var(--dock-rail-search-x)','auto','auto','var(--dock-rail-search-y)','var(--dock-rail-cell)','var(--dock-rail-row)','none']);
  assert.deepEqual([die.left,die.bottom,die.width,die.height,die.transform],['var(--dock-rail-dice-x)','0','var(--dock-rail-cell)','var(--dock-rail-row)','none']);
  assert.equal(r.cell,r.pad+r.icon+r.pad);assert.equal(r.searchX,8);
  assert.ok(r.diceX+r.cell<=r.width-8+1e-9,'within the menu');
  assert.ok(r.pause>r.gap,'a larger break before them');
 }
 // Where the labels show, side by side on the shell's foot: the dice one pair gap beside the search.
 for(const viewport of [wide,size('1024x600')]){
  const r=rail(viewport);
  assert.equal(r.searchY,0);assert.ok(r.diceX>=r.searchX+r.cell+4,'apart');
  assert.equal(r.vars['--dock-rail-tail'],'calc(var(--dock-rail-break) + var(--dock-rail-row))');
 }
 // In the icons-alone column, the dice under the search (the next test).
 assert.equal(rail(narrow).diceX,rail(narrow).searchX);assert.ok(rail(narrow).searchY>=rail(narrow).row,'the search above the dice');
 assert.equal(style(SHELL,wide).padding,'0 0 var(--dock-rail-tail)');
 // Icons only: the magnifier shown, the capsule's words hidden; no label of their own any more (« Rechercher » and
 // « Au hasard » were withdrawn with their copy).
 for(const viewport of [wide,narrow]){
  assert.equal(style(TOGGLE+'>svg',viewport).display,'block');assert.equal(style(TOGGLE+'>.dock-search-toggle-label',viewport).display,'none');
 }
 assert.deepEqual(style(':root .app[data-navigation=dock] .dock-shell > .dock-search-toggle > svg',size('1440x900')),{display:'none'},'the bottom dock\'s capsule keeps its words alone');
 for(const gone of ['dock-search-toggle-rail','dock-random-label','atRandom'])assert.ok(!css.includes(gone)&&!welcome.includes(gone)&&!search.includes(gone),gone);
 // Their names are their accessible names and their tooltips: the search's « Rechercher dans Horizon » (dock-search.mjs),
 // the dice's per-section meaning (welcome.mjs), the same on the rail and under the bottom dock.
 assert.match(search,/toggle\.setAttribute\('aria-label', text\('open'\)\);\n {4}toggle\.title = text\('open'\);/);
 const button={dataset:{},attributes:{},title:'',disabled:false,setAttribute(name,value){this.attributes[name]=value;}};
 const dice=vm.createContext({byId:()=>button,section:'explore',locale:'fr',entryOpen:true,randomCampus:{},campuses:[{}],route:{entryId:null},
  contentCandidates:()=>[{}],randomDiscovery:{canPick:()=>true},randomContextKey:()=>'key'});
 vm.runInContext(copySource+'\n'+welcome.match(/^const discoveryCopy=\{[^]*?\n\};$/m)[0]+'\n'+welcome.match(/^function updateRandomDiscovery\(\)\{[^]*?\n\}/m)[0],dice);
 const name=()=>{vm.runInContext('updateRandomDiscovery()',dice);assert.equal(button.title,button.attributes['aria-label']);return button.attributes['aria-label'];};
 assert.equal(name(),'Visiter un campus');
 dice.section='projects';assert.equal(name(),'Découvrir un projet');
 dice.locale='en';assert.equal(name(),'Discover a project');
 dice.locale='ar';dice.section='explore';assert.equal(name(),'زيارة فرع');
 // The rail never sets their display: on Awards they stay hidden (awards.css), as under the bottom dock.
 for(const viewport of [wide,narrow]){assert.equal(style(TOGGLE,viewport).display,undefined);assert.equal(style(DICE,viewport).display,undefined);}
 // Open: the button grows into one glass surface beside the rail, level with its own foot, the field at its bottom and the
 // results above (the measured panel's height + the field's 60 px); its magnifier fades; the dice fades as under the
 // capsule; the closed state's « no panel » rule gives way to the dock's glass.
 const open=style(SHELL+'[data-search-open=true]>.dock-search-toggle',wide);
 assert.deepEqual([open.width,open.height,open.bottom],['var(--dock-rail-flyout-width)','calc(var(--dock-results-height, 120px) + var(--dock-rail-form))','var(--dock-keyboard-offset, 0px)']);
 assert.equal(style(SHELL+'[data-search-open=true]>.dock-search-toggle>svg',wide).opacity,'0');
 assert.ok(RULES.some(rule=>rule.selectors.includes(':root[data-theme] .app[data-navigation=dock] #main>.dock-shell:not([data-search-open=true])>.dock-search-toggle')));
 assert.equal(style(DICE.replace('[data-has-discovery=true]','[data-has-discovery=true][data-search-open=true]'),wide).transform,'scale(.86)');
 assert.equal(style(SHELL+'>.main-nav .dock-search-form',wide).bottom,'calc(var(--dock-keyboard-offset, 0px) + 5px - var(--dock-rail-tail))');
 assert.match(style(SHELL+'>.main-nav .dock-search-panel',wide)['max-height'],/- var\(--dock-rail-lift\) /,'the results never rise above the window: the lift counts');
 // The rail stays, dimmed (its buttons are inert while the search is open); the pill keeps its row.
 assert.deepEqual(style(SHELL+'>.main-nav[data-search-open=true]>button[data-section]',wide),{opacity:'.32',transform:'none'});
 assert.deepEqual(style(SHELL+'>.main-nav[data-search-open=true]>.nav-indicator',wide),{opacity:'.32'});
});

test('§X the icons-alone step: one column, the dice under the search; its 8 2/11 rows centred in the free height, the spacing shrinking first under 32 px rows, then the rows, never under 24 px',()=>{
 // « Le bouton pour la sélection au hasard doit passer sous la recherche quand le texte du menu à gauche disparaît »: at
 // 700 px and less the menu is one column a cell wide, the search under the destinations' icons and the dice under it, at
 // the rows' 8 px from the side (on the right in Arabic); where the labels show, they stay side by side (above).
 for(const viewport of ['700x690','667x375','640x360','568x320'].map(size))for(const rtl of [false,true]){
  const r=rail(viewport,{rtl}),where=`${viewport.width}x${viewport.height}${rtl?' ar':''}`;
  assert.equal(r.width,16+r.cell,where);assert.equal(r.diceX,r.searchX,where+' the same column');
  assert.equal(rtl?r.width-r.searchX-r.cell:r.searchX,8,where+' the rows\' column');
  // The dice on the shell's foot, the search one row and one gap above it: the rows' gap between them, as between the rows.
  near(r.searchY,r.row+r.gap,where+' one row and a gap up');near(r.tail,r.pause+r.row+r.gap+r.row,where+' the break, the search, a gap, the dice');
 }
 assert.equal(style(DICE,size('667x375')).bottom,'0');assert.equal(style(TOGGLE,size('667x375')).bottom,'var(--dock-rail-search-y)');
 // The block: the five rows and their four gaps, the break, the search, a gap and the dice, 7 rows and 13 elevenths of a row
 // (8 2/11 rows at full size), centred in the free height: 130 px of air above and below at 700×690.
 const roomy=rail(size('700x690'));
 assert.deepEqual([roomy.top,roomy.free,roomy.row],[86,588,40]);
 near(roomy.part,40/11,'700×690 spacing');near(roomy.height,40*90/11,'700×690 8 2/11 rows');near(roomy.block,roomy.height,'700×690 the block');
 near(roomy.railTop-roomy.top,690-16-roomy.bottom,'700×690 centred');near(roomy.lift,(588-40*90/11)/2,'700×690 air');
 // The phones in landscape fill their free height: 667×375 and 640×360 with rows of about 35 and 33 px, the spacing in
 // proportion; 568×320 with 32 px rows, the spacing shrunk (gaps of about 1.5 px, the break 2.3 px).
 for(const [viewport,row,part] of [['667x375',289*11/90,289/90],['640x360',274*11/90,274/90],['568x320',32,10/13]]){
  const v=size(viewport),r=rail(v);
  near(r.row,row,viewport+' rows');near(r.part,part,viewport+' spacing');near(r.height,r.block,viewport+' the block');
  near(r.height,r.free,viewport+' fills its free height');near(r.lift,0,viewport+' no lift');near(r.railTop,r.top,viewport+' under the header');
 }
 // Shorter: under 224 px of free height (310 px tall) the spacing is gone and the rows shrink, never under 24 px (WCAG 2.5.8),
 // under which the block keeps under the header and runs into the bottom margin.
 const fold=rail(size('653x280'));near(fold.row,194/7,'653×280 rows');near(fold.part,0,'653×280 no spacing');near(fold.height,fold.free,'653×280 fills');
 const floor=rail(size('600x250'));assert.deepEqual([floor.row,floor.part,floor.height],[24,0,168]);
 near(floor.railTop,floor.top,'600×250 under the header');near(floor.bottom,250-16+4,'600×250 4 px into the margin');
 // The labelled steps keep their 32 px floor and their spacing in proportion (the previous tests), even that short.
 for(const viewport of ['701x300','1280x300'].map(size)){const r=rail(viewport);assert.equal(r.row,32);near(r.part,32/11,'labelled spacing');near(r.height,224,'labelled block');}
});

test('§X no scroll fade on the rail: while a content page scrolls it stays as at rest, shown and usable; the bottom dock keeps its fade',()=>{
 const searchCss=rulesOf(read('dock-search.css')),discovery=rulesOf(read('contextual-discovery.css'));
 // The bottom dock's fade (dock-search.mjs marks the shell while the document scrolls): its rows, pill, search and dice go
 // transparent and let the pointer through, in every window (no media condition).
 const SCROLLING=':root .app[data-navigation=dock]:not([data-menu-scroll-study=background]) .dock-shell[data-document-scrolling=true]:not([data-search-open=true]):not(:has(:focus-visible))';
 const fades=[...searchCss,...discovery].filter(rule=>rule.selectors.some(selector=>selector.includes('[data-document-scrolling=true]'))&&rule.declarations.some(([name,value])=>name==='opacity'&&value==='0'));
 for(const part of [' > .main-nav.has-dock-search > button[data-section]',' > .main-nav.has-dock-search .nav-indicator',' > .dock-search-toggle'])
  assert.ok(searchCss.some(rule=>rule.selectors.includes(SCROLLING+part)&&rule.conditions.length===0&&rule.declarations.some(([name,value])=>name==='opacity'&&value==='0')),part);
 assert.ok(discovery.some(rule=>rule.selectors.some(selector=>selector.endsWith('[data-document-scrolling=true]:not([data-search-open=true]):not(:has(:focus-visible)) > .dock-random-toggle'))&&rule.conditions.length===0));
 assert.ok(searchCss.some(rule=>rule.selectors.includes(SCROLLING+' *')&&rule.declarations.some(([name,value])=>name==='pointer-events'&&value==='none')));
 // The rail's answer, in the rail's query only: the same parts at their resting opacity (1; the disabled dice its .42) and
 // usable again. An id (#main) in each of its selectors outweighs those rules, which have none.
 const ON=':root .app[data-navigation=dock] #main>.dock-shell[data-document-scrolling=true]:not([data-search-open=true])';
 const DICE_ON=':root[data-theme] .app[data-navigation=dock] #main>.dock-shell[data-document-scrolling=true]:not([data-search-open=true])>.dock-random-toggle';
 const v=size('1280x720'),bottom=size('1440x900');
 for(const selector of [ON+'>.main-nav>:is(button[data-section],.nav-indicator)',ON+'>.dock-search-toggle',DICE_ON+':not(:disabled)']){
  assert.equal(style(selector,v).opacity,'1',selector);assert.deepEqual(style(selector,bottom),{},'the bottom dock keeps its fade');
 }
 assert.equal(style(DICE_ON+':disabled',v).opacity,'.42');
 assert.equal(style(':root[data-theme] .app[data-navigation=dock] .dock-shell[data-has-discovery=true] > .dock-random-toggle:disabled',bottom,discovery).opacity,'.42');
 for(const selector of [ON,ON+'>:is(.main-nav,.dock-search-toggle,.dock-random-toggle)',ON+'>.main-nav>button[data-section]']){
  assert.equal(style(selector,v)['pointer-events'],'auto',selector);assert.deepEqual(style(selector,bottom),{});
 }
 const answers=RULES.filter(rule=>rule.selectors.some(selector=>selector.includes('[data-document-scrolling=true]')));
 assert.equal(answers.length,3);
 for(const rule of answers){
  assert.equal(rule.conditions[0],'@media '+RAIL);
  for(const selector of rule.selectors)assert.match(selector,/ #main>\.dock-shell\[data-document-scrolling=true\]:not\(\[data-search-open=true\]\)/);
 }
 for(const rule of fades)for(const selector of rule.selectors)assert.ok(!selector.includes('#'),selector);
 // At rest those parts are shown (dock-search.css: opacity 1), so the rail looks the same while the page scrolls; with the
 // search open nothing fades, and the rail keeps its dimmed state.
 for(const part of [' > .main-nav.has-dock-search > button[data-section]',' > .main-nav.has-dock-search .nav-indicator',' > .dock-search-toggle'])
  assert.equal(style(':root .app[data-navigation=dock]:not([data-menu-scroll-study=background]) .dock-shell:not([data-search-open=true])'+part,bottom,searchCss).opacity,'1',part);
 // The back-to-top shortcut (back-to-top.css) keeps its own fade with the dock's mark: it is no part of the menu.
 assert.match(read('back-to-top.css'),/:has\(\.dock-shell\[data-document-scrolling=true\]:not\(\[data-search-open=true\]\)\)[^{]*> \.back-to-top:not\(:focus-visible\) \{\n {2}opacity: 0;/);
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
