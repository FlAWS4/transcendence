import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {continentIds,continentName} from '../continents.mjs';
import {scopeIndications,mountScopePill} from '../scope-pill.mjs';

// Version B, refinements of 26 Oct 2026 (EXPLORER-B-REFINEMENTS-20261025): §S, the « Revenir au monde » command's globe
// shown in the filter wherever the filter shows, and §T, the filter's fixed width (the longest indication, per language
// and form).
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const welcome=read('welcome.mjs'),dockCss=read('dock-navigation.css');
const catalogue=JSON.parse(read('campuses.json'));
const STYLESHEETS=['welcome.css','dock-navigation.css','control-glass.css','content-preview.css','sticky-header.css','design-review-selection.css','globe-framing.css',
 'readable-glass.css','responsive-content.css','responsive-dock.css','awards.css','floating-search.css','entrance.css','explorer-selector.css'];

// A small fake DOM: elements with attributes, classes, hidden, style, text, children, deep clones, and the selectors the
// pill uses (tag, .class, [attribute], and one child combinator).
const SVG='http://www.w3.org/2000/svg';
class Node{
 constructor(doc,tag,namespaceURI='http://www.w3.org/1999/xhtml'){Object.assign(this,{ownerDocument:doc,localName:tag,namespaceURI,attrs:new Map(),children:[],parentNode:null,text:'',style:{}});}
 setAttribute(name,value){this.attrs.set(String(name),String(value));}
 getAttribute(name){return this.attrs.get(String(name))??null;}
 hasAttribute(name){return this.attrs.has(String(name));}
 removeAttribute(name){this.attrs.delete(String(name));}
 get className(){return this.getAttribute('class')||'';}
 set className(value){this.setAttribute('class',value);}
 get id(){return this.getAttribute('id')||'';}
 get hidden(){return this.hasAttribute('hidden');}
 set hidden(value){if(value)this.setAttribute('hidden','');else this.removeAttribute('hidden');}
 get textContent(){return this.text+this.children.map(child=>child.textContent).join('');}
 set textContent(value){for(const child of [...this.children])child.remove();this.text=String(value);}
 append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
 remove(){if(!this.parentNode)return;const list=this.parentNode.children;list.splice(list.indexOf(this),1);this.parentNode=null;}
 cloneNode(deep=false){
  const copy=new Node(this.ownerDocument,this.localName,this.namespaceURI);
  for(const [name,value] of this.attrs)copy.attrs.set(name,value);
  Object.assign(copy.style,this.style);copy.text=this.text;
  if(deep)for(const child of this.children)copy.append(child.cloneNode(true));
  return copy;
 }
 matches(selector){
  const parts=selector.split('>').map(part=>part.trim()),last=parts.pop();
  if(!simple(this,last))return false;
  return parts.length?Boolean(this.parentNode?.matches?.(parts.join('>'))):true;
 }
 querySelectorAll(selector){const found=[];const walk=node=>{for(const child of node.children){if(child.matches(selector))found.push(child);walk(child);}};walk(this);return found;}
 querySelector(selector){return this.querySelectorAll(selector)[0]??null;}
 getBoundingClientRect(){return this.ownerDocument.layout(this);}
}
function simple(node,selector){
 const match=selector.match(/^([a-z]*)((?:\.[\w-]+)*)((?:\[[\w-]+\])*)$/i);
 assert.ok(match,'selector '+selector);
 const [,tag,classes,attributes]=match,list=node.className.split(/\s+/).filter(Boolean);
 return (!tag||node.localName===tag)&&classes.split('.').filter(Boolean).every(name=>list.includes(name))
  &&[...attributes.matchAll(/\[([\w-]+)\]/g)].every(([,name])=>node.hasAttribute(name));
}
function walkAll(root){const found=[];const walk=node=>{for(const child of node.children){found.push(child);walk(child);}};walk(root);return found;}
const element=(doc,tag,attributes={},...children)=>{const node=new Node(doc,tag,tag==='svg'||tag==='use'?SVG:undefined);for(const [name,value] of Object.entries(attributes))node.setAttribute(name,value);node.append(...children);return node;};

// The page around the pill, as in both B pages: the bar, the pill (medallion, world command, summary, trail).
function page({lang='fr',width=1440,height=900,compact='false',reading='false',laidOut=true}={}){
 const listeners=new Map(),fontListeners=[];
 const win={innerWidth:width,innerHeight:height,
  addEventListener(type,callback){listeners.set(type,[...(listeners.get(type)||[]),callback]);},
  dispatch(type){for(const callback of listeners.get(type)||[])callback({type});},
  getComputedStyle:node=>({fontSize:node.computedFontSize||'15px'})};
 let resolveFonts;
 const doc={documentElement:null,defaultView:win,layouts:0,
  fonts:{ready:new Promise(resolve=>{resolveFonts=resolve;}),addEventListener(type,callback){fontListeners.push([type,callback]);}},
  createElement:tag=>new Node(doc,tag),createElementNS:(namespace,tag)=>new Node(doc,tag,namespace)};
 doc.documentElement=element(doc,'html');doc.documentElement.lang=lang;
 doc.body=element(doc,'body');doc.documentElement.append(doc.body);
 const app={dataset:{compactScope:compact,reading}};
 const trail=element(doc,'ol',{class:'scope-trail'},
  element(doc,'li',{class:'scope-ancestor scope-world',id:'scope-world-item',hidden:''},element(doc,'button',{id:'scope-world'},element(doc,'span',{id:'scope-world-name'})),element(doc,'svg',{class:'scope-separator'},element(doc,'use',{href:'#i-down'}))),
  element(doc,'li',{class:'scope-ancestor scope-country',id:'scope-country-item',hidden:''},element(doc,'button',{id:'scope-country'},element(doc,'span',{id:'scope-country-name',dir:'auto'})),element(doc,'svg',{class:'scope-separator'},element(doc,'use',{href:'#i-down'}))),
  element(doc,'li',{class:'scope-current'},element(doc,'button',{class:'scope-picker',id:'scope-picker','aria-label':'Monde · Choisir un pays ou un campus'},element(doc,'span',{id:'scope-name',dir:'auto'}),element(doc,'svg',{class:'chevron'},element(doc,'use',{href:'#i-down'})))));
 trail.querySelector('.scope-picker').computedFontSize='14px';trail.querySelector('.scope-picker>span').computedFontSize='14px';
 trail.querySelector('.scope-picker>span').textContent='Monde';
 const seat=element(doc,'span',{class:'scope-medallion',id:'scope-medallion','aria-hidden':'true'});
 const path=element(doc,'nav',{class:'scope-path',id:'scope-path','aria-label':'Chemin géographique'},seat,element(doc,'button',{class:'icon-button world-control scope-world-return',id:'reset'},element(doc,'svg',{},element(doc,'use',{href:'#i-globe'}))),element(doc,'span',{class:'sr-only',id:'scope-reading-summary',hidden:''}),trail);
 const bar=element(doc,'div',{class:'scope-bar',id:'scope-bar'},element(doc,'button',{class:'scope-back icon-button',id:'scope-back'}),path);
 doc.body.append(bar);
 // Layout: a copy of the pill is 56 px of chrome, 7 px per letter of its name and, unless the compact form hides it,
 // 30 + 7 px per letter of its country; reading hides the chevron (24 px). laidOut false: no box (0 px).
 const seen=[];
 doc.layout=node=>{
  doc.layouts++;
  if(node.matches('.scope-path')&&node!==path){
   seen.push(node);
   const name=node.querySelector('.scope-picker>span').textContent,country=node.querySelector('.scope-country');
   const crumb=country&&!country.hidden&&app.dataset.compactScope!=='true'?30+7*[...country.querySelector('button>span').textContent].length:0;
   return {width:laidOut?56+7*[...name].length+crumb-(app.dataset.reading==='true'?24:0):0};
  }
  return {width:0};
 };
 return {doc,win,app,bar,path,trail,seat,seen,fontsLoaded:()=>{resolveFonts();for(const [type,callback] of fontListeners)if(type==='loadingdone')callback();}};
}
const settle=()=>new Promise(resolve=>setTimeout(resolve,0));

// The declarations of the rules whose selector is exactly `selector`, merged in order.
const rules=css=>[...css.replace(/\/\*[^]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,head,body])=>({head:head.trim(),body}));
function rule(css,selector){
 const found=rules(css).filter(({head})=>head===selector).map(({body})=>body);
 assert.ok(found.length,'a rule '+selector);
 return Object.fromEntries(found.join(';').split(';').map(part=>part.trim()).filter(Boolean).map(part=>{const index=part.indexOf(':');return [part.slice(0,index).trim(),part.slice(index+1).trim()];}));
}

// welcome.mjs's applyRoute, evaluated with stubs for what it calls: which sections hide the world command.
function routeHarness(){
 const nodes=new Map(),readings=[];
 const byId=id=>{if(!nodes.has(id))nodes.set(id,{id,hidden:false,inert:false,attributes:{},setAttribute(name,value){this.attributes[name]=String(value);}});return nodes.get(id);};
 const context=vm.createContext({routeApplyVersion:0,entryOpen:true,route:{section:'explore',entryId:null},section:'explore',history:{state:{}},app:{dataset:{}},buttons:[],byId,
  restoreContentPage:()=>false,dockSearch:null,scopePopover:null,themeMenu:null,accountMenu:null,motion:{matches:true},
  contentTransitions:{captureExit:()=>null,cancel(){},exit(){},enter(){}},brandWordmark:{setAwards(){}},readingScope:{setReading(reading){readings.push(reading);}},
  updateScope(){},syncScope(){},renderContent(){},moveIndicator(){},requestAnimationFrame(){},announce(){},contentLocationAnnouncement:()=>''});
 vm.runInContext(welcome.match(/^function applyRoute\([^]*?\n\}/m)[0],context);
 return {byId,readings,visit(section,entryId=null){context.route={section,entryId};context.applyRoute();return byId('reset');}};
}

test('§S the « Revenir au monde » globe shows in the filter on every section, at the same place as on the Explorer',()=>{
 const h=routeHarness();
 // The controller no longer hides it outside the Explorer: lists, detail pages (reading), and back to the Explorer.
 for(const [section,entryId] of [['explore'],['projects'],['people'],['journal'],['projects','minishell'],['people','person'],['journal','article'],['explore'],['awards'],['projects']]){
  assert.equal(h.visit(section,entryId).hidden,false,section+(entryId?'/'+entryId:''));
  // On Awards the whole filter is hidden and inert, the world command with it (awards.css, unchanged).
  assert.equal(h.byId('scope-bar').inert,section==='awards');assert.equal(h.byId('scope-bar').attributes['aria-hidden'],String(section==='awards'));
 }
 assert.match(read('awards.css'),/\.app\[data-navigation=dock\]\[data-section=awards\] \.scope-bar \{\n  opacity:0;\n  visibility:hidden;/);
 // Reading (a detail page) is passed on, and the reading scope makes the command inert there (reading-scope.mjs).
 assert.deepEqual(h.readings,[false,false,false,false,true,true,true,false,false,false]);
 assert.match(welcome,/^const readingScope=mountReadingScope\(\{[^\n]*,back:byId\('scope-back'\),reset:byId\('reset'\),[^\n]*\}\);$/m);
 // No stylesheet hides it by section: display:none only with the hidden attribute; the globe controls of the former map
 // (.globe-controls .world-control) are another element.
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock] .scope-world-return[hidden]'),{display:'none'});
 for(const name of STYLESHEETS)for(const {head,body} of rules(read(name)))for(const selector of head.split(',').map(part=>part.trim()))
  if(/scope-world-return|#reset\b|world-control/.test(selector)&&/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0\b/.test(body))
   assert.ok(/\[hidden\]$|\.globe-controls \.world-control$/.test(selector),name+': '+selector);
 // Same place and look everywhere: its rules belong to the dock layout, never to a section.
 for(const name of STYLESHEETS)for(const {head} of rules(read(name)))for(const selector of head.split(',').map(part=>part.trim()))
  if(/scope-world-return|#reset\b/.test(selector))assert.doesNotMatch(selector,/data-section|data-reading/,name+': '+selector);
 // The command and its pictogram in both pages; the medallion's seat stays empty (nothing is drawn into it).
 for(const name of ['index.html','content-preview.html']){
  const html=read(name);
  assert.match(html,/<span class="scope-medallion" id="scope-medallion" aria-hidden="true"><\/span>\n\s*<button class="icon-button world-control scope-world-return" id="reset" type="button" aria-label="Revenir au monde" title="Revenir au monde"><svg aria-hidden="true"><use href="#i-globe"\/><\/svg><\/button>/,name);
  assert.match(html,/<symbol id="i-globe" viewBox="0 0 24 24">/,name);
 }
 assert.deepEqual(welcome.match(/[^\n]*scope-medallion[^\n]*/g).map(line=>line.match(/[^,(]*byId\('scope-medallion'\)/)[0]),['anchor:byId(\'scope-medallion\')'],
  'welcome.mjs names the seat only as the reading move\'s anchor');
 assert.doesNotMatch(dockCss,/scope-medallion[^{]*>\s*svg|scope-medallion:not\(:empty\)/);
});

test('§S it works as on the Explorer: a click returns the filter to the world on every section',()=>{
 assert.match(welcome,/^byId\('reset'\)\.addEventListener\('click',\(\)=>resetScope\(\)\);$/m);
 const reset=welcome.match(/^function resetScope\(\)\{[^]*?\n\}/m)[0];
 assert.doesNotMatch(reset,/section/,'no section condition');
});

test('§T every indication of the pill: « Monde », the continents, the countries, then each campus with its country',()=>{
 const list=scopeIndications({world:'Monde',continents:['Afrique','Europe'],countries:['France',''],campuses:[{name:'42 Paris',country:'France'},{name:'',country:'France'}]});
 assert.deepEqual(list,[{name:'Monde'},{name:'Afrique'},{name:'Europe'},{name:'France'},{name:'42 Paris',crumb:'France'}]);
 // welcome.mjs gives the 93 indications of the catalogue in the current language: 1 + 4 continents + 30 countries + 58 campuses.
 const getter=welcome.match(/^ getIndications:(\(\)=>network\?scopeIndications\([^\n]+\):\[\])\}\);$/m)[1];
 const copySource=[welcome.match(/^const copy = \{[^]*?\n\};$/m)[0],...welcome.match(/^Object\.assign\(copy\.(?:fr|en|ar), \{[^]*?\n\}\);$/gm)].join('\n');
 const constant=name=>welcome.match(new RegExp('^const '+name+' = [^\\n]+$','m'))[0];
 for(const [locale,world,first,abu,country] of [['fr','Monde','Afrique','42 Abu Dhabi','Émirats arabes unis'],['en','World','Africa','42 Abu Dhabi','United Arab Emirates'],['ar','العالم','أفريقيا','42 Abu Dhabi','الإمارات العربية المتحدة']]){
  const context=vm.createContext({locale,network:catalogue,countries:catalogue.countries,campuses:catalogue.campuses,countryById:new Map(catalogue.countries.map(item=>[item.id,item])),
   regionNames:new Intl.DisplayNames(locale,{type:'region'}),continentIds,continentName,scopeIndications});
  vm.runInContext([copySource,constant('t'),constant('countryName'),'var getIndications='+getter].join('\n'),context);
  const items=context.getIndications();
  assert.equal(items.length,93,locale);
  assert.equal(items[0].name,world);assert.equal(items[1].name,first);
  assert.deepEqual(JSON.parse(JSON.stringify(items.find(item=>item.name===abu))),{name:abu,crumb:country},locale);
  assert.equal(items.filter(item=>item.crumb).length,58,'each campus carries its country');
  context.network=null;assert.equal(context.getIndications().length,0,'nothing before the catalogue');
 }
});

const FR=[{name:'Monde'},{name:'Amériques'},{name:'Émirats arabes unis'},{name:'42 Abu Dhabi',crumb:'Émirats arabes unis'},{name:'42 Iskandar Puteri',crumb:'Malaisie'}];
const AR=[{name:'العالم'},{name:'الأمريكتان'},{name:'الإمارات العربية المتحدة'},{name:'42 Abu Dhabi',crumb:'الإمارات العربية المتحدة'},{name:'42 Iskandar Puteri',crumb:'ماليزيا'}];
const widthOf=({name,crumb},{compact=false,reading=false}={})=>56+7*[...name].length+(crumb&&!compact?30+7*[...crumb].length:0)-(reading?24:0);
// The width set: the longest indication, rounded up to the next whole pixel.
const expected=(list,form={},scale=1)=>Math.ceil(Math.max(...list.map(item=>widthOf(item,form)*scale))-.01);

test('§T the pill takes the width of its longest indication, measured on copies of the live pill',()=>{
 const p=page();let list=FR;
 const pill=mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>list});
 assert.equal(p.path.style.width??'','','nothing is set at mount');
 const width=pill.fit();
 assert.equal(width,expected(FR));assert.equal(width,widthOf(FR[3]),'« Émirats arabes unis › 42 Abu Dhabi »');
 assert.equal(p.path.style.width,width+'px');assert.equal(pill.width,width);
 // No indication is cut at the pill's own width: the « … » can only come from the bar's limit (phones).
 for(const item of FR)assert.ok(widthOf(item)<=width,item.name);
 assert.equal(p.seen.length,FR.length,'one copy per indication');
 // The copies: in the bar, out of the accessibility tree and of reach, without ids, each with its texts; the country
 // only for a campus; the picker's font size copied from the live picker (an id rule sets it); no <use> clones.
 for(const [index,copy] of p.seen.entries()){
  const item=FR[index],box=copy.parentNode;
  assert.equal(box.getAttribute('aria-hidden'),'true');assert.equal(box.inert,true);assert.match(box.style.cssText,/visibility:hidden/);
  assert.equal(copy.style.width,'max-content');
  assert.deepEqual([copy,...walkAll(copy)].filter(node=>node.id),[],'no id');
  assert.equal(walkAll(copy).filter(node=>node.localName==='use').length,0);
  assert.equal(copy.querySelector('.scope-picker>span').textContent,item.name);
  assert.equal(copy.querySelector('.scope-country').hidden,!item.crumb);
  if(item.crumb)assert.equal(copy.querySelector('.scope-country').querySelector('button>span').textContent,item.crumb);
  assert.equal(copy.querySelector('.scope-picker').style.fontSize,'14px');assert.equal(copy.querySelector('.scope-picker>span').style.fontSize,'14px');
  assert.ok(copy.querySelector('.scope-medallion'),'the copy has the seat');
 }
 assert.equal(p.bar.children.length,2,'the copies are gone after the measure: the ← and the pill only');
 assert.equal(p.trail.querySelector('.scope-picker>span').textContent,'Monde','the live pill is untouched');
 // Nothing changed (a filter change, the same language and form): no new measure.
 const layouts=p.doc.layouts;
 assert.equal(pill.fit(),width);assert.equal(pill.fit(),width);
 assert.equal(p.doc.layouts,layouts,'no layout read');
 // Before the catalogue there is nothing to measure: the pill keeps its natural width.
 list=[];assert.equal(pill.fit(),null);assert.equal(p.path.style.width,'');
});

test('§T a pill without a layout box keeps its natural width and measures again at the next call',()=>{
 const p=page({laidOut:false});
 const pill=mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>FR});
 assert.equal(pill.fit(),null);assert.equal(p.path.style.width,'','never 0 px');
 const layouts=p.doc.layouts;pill.fit();assert.ok(p.doc.layouts>layouts,'measured again');
});

test('§T recomputed on a language change, a resize, a change of form and when the fonts load',async()=>{
 const p=page();let list=FR,measures=0;
 const scale=()=>p.win.innerWidth<700?.9:1;
 const pill=mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>list,
  measure:items=>{measures++;const form={compact:p.app.dataset.compactScope==='true',reading:p.app.dataset.reading==='true'};return items.map(item=>widthOf(item,form)*scale());}});
 assert.equal(pill.fit(),expected(FR));assert.equal(measures,1);
 // Language: localize() sets the language and updates the bar, whose update fits the pill.
 p.doc.documentElement.lang='ar';list=AR;
 assert.equal(pill.fit(),expected(AR));assert.equal(measures,2);
 assert.notEqual(expected(AR),expected(FR));
 // Resize: the pill's own listener (the font sizes and the bar's limits follow the viewport).
 p.win.innerWidth=390;p.win.innerHeight=844;p.win.dispatch('resize');
 assert.equal(measures,3);assert.equal(pill.width,expected(AR,{},.9));
 // The compact form (the dock's container query, read by moveIndicator) hides the country of a campus.
 p.app.dataset.compactScope='true';pill.fit();assert.equal(measures,4);
 assert.equal(pill.width,expected(AR,{compact:true},.9));
 assert.ok(pill.width<expected(AR,{},.9),'the campus alone is shorter than « country › campus »');
 // Reading hides the chevron (and the ←).
 p.app.dataset.reading='true';pill.fit();assert.equal(measures,5);
 assert.equal(pill.width,expected(AR,{compact:true,reading:true},.9));
 // The real fonts: a measure again when they have loaded, even with nothing else changed.
 p.fontsLoaded();await settle();
 assert.ok(measures>=6);
 const before=measures;pill.fit();assert.equal(measures,before,'then nothing until the next change');
});

test('§T the pill shrinks to the bar on phones with an ellipsis, keeps its text where it was, and the ← keeps its room',()=>{
 const welcomeCss=read('welcome.css'),framing=read('globe-framing.css'),preview=read('content-preview.css');
 // The pill and its trail may shrink below the set width, inside the bar's max-width; the name then ends with « … ».
 assert.match(welcomeCss,/\.scope-path\{min-width:0;/);
 assert.match(welcomeCss,/\.scope-trail\{display:flex;align-items:center;gap:2px;list-style:none;margin:0;padding:2px 5px;min-width:0\}\.scope-trail li\{display:flex;align-items:center;min-width:0\}/);
 assert.match(welcomeCss,/\.scope-picker>span,\.scope-ancestor button>span\{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\}/);
 assert.match(preview,/:root \.app\[data-navigation=dock\] \.scope-bar \{\n  position: absolute;[^}]*width: max-content;\n  max-width: min\(640px, calc\(100% - 64px\)\);/);
 assert.match(preview,/@media \(max-width: 700px\) \{[^]*?:root \.app\[data-navigation=dock\] \.scope-bar \{ max-width: calc\(100% - 32px\); \}/);
 // The trail is not stretched: the text keeps its place at the start of the pill.
 assert.doesNotMatch(dockCss+welcomeCss+framing,/scope-(trail|current|picker)[^{]*\{[^}]*(flex-grow|flex:\s*1|justify-content|margin-inline-start:\s*auto)/);
 // The ←: hidden at the world level, it keeps its box outside reading (reading still drops it).
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock]:not([data-reading=true]) .scope-back:disabled'),{display:'inline-flex',visibility:'hidden'});
 assert.match(framing,/:root \.app\[data-navigation=dock\]\[data-reading=true\] :is\(\.scope-back,\.scope-picker \.chevron\) \{ display:none; \}/);
 assert.match(welcomeCss,/\.scope-back:disabled\{display:none\}/,'version A\'s rule, overridden in the dock layout only');
});

test('§T welcome.mjs fits the pill on every update of the bar, on a change of form and before a reading move is measured',()=>{
 assert.match(welcome,/^import \{scopeIndications,mountScopePill\} from '\.\/scope-pill\.mjs\?v=[\w-]+';$/m);
 assert.match(welcome,/^const scopePill=mountScopePill\(\{app,bar:byId\('scope-bar'\),path:byId\('scope-path'\),trail:document\.querySelector\('\.scope-trail'\),$/m);
 assert.match(welcome,/^const readingScope=mountReadingScope\(\{[^\n]*,fit:scopePill\.fit\}\);$/m);
 const update=welcome.match(/^function updateScope\(\) \{[^]*?\n\}/m)[0];
 assert.match(update,/byId\('scope-name'\)\.textContent=name;[^]*scopePill\.fit\(\);scopePopover\?\.position\(\);\n explorerBand\.measure\(\);\n\}$/);
 const indicator=welcome.match(/^function moveIndicator\(\) \{[^]*?\n\}/m)[0];
 assert.match(indicator,/app\.dataset\.compactScope=String\(compact\);[^]*?scopePill\.fit\(\);scopePopover\?\.position\(\);\n \}/);
});
