import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {continentIds,continentOfCountry,continentName} from '../continents.mjs';
import {scopeIndications,mountScopePill} from '../scope-pill.mjs';

// Version B, refinements of 26 Oct 2026 (EXPLORER-B-REFINEMENTS-20261025): §S, the « Revenir au monde » command's globe
// shown in the filter wherever the filter shows; §T, the filter's fixed width, then §Y, the filter as the whole path in
// steps (the steps still to choose as placeholders), at the width of its longest path per language and form, centred on
// the page's axis.
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const welcome=read('welcome.mjs'),dockCss=read('dock-navigation.css');
const catalogue=JSON.parse(read('campuses.json'));
const STYLESHEETS=['welcome.css','dock-navigation.css','control-glass.css','content-preview.css','sticky-header.css','design-review-selection.css','globe-framing.css',
 'readable-glass.css','responsive-content.css','responsive-dock.css','awards.css','floating-search.css','entrance.css','explorer-selector.css'];

// A small fake DOM: elements with attributes, classes, hidden, dataset, an inline style with custom properties, text,
// children, deep clones, and the selectors the pill uses (tag, .class, [attribute], and one child combinator).
const SVG='http://www.w3.org/2000/svg';
class Style{
 #custom=new Map();
 setProperty(name,value){this.#custom.set(name,String(value));}
 getPropertyValue(name){return this.#custom.get(name)??'';}
 removeProperty(name){this.#custom.delete(name);}
 clone(){const copy=Object.assign(new Style(),this);for(const [name,value] of this.#custom)copy.setProperty(name,value);return copy;}
}
class Node{
 constructor(doc,tag,namespaceURI='http://www.w3.org/1999/xhtml'){Object.assign(this,{ownerDocument:doc,localName:tag,namespaceURI,attrs:new Map(),children:[],parentNode:null,text:'',style:new Style()});}
 setAttribute(name,value){this.attrs.set(String(name),String(value));}
 getAttribute(name){return this.attrs.get(String(name))??null;}
 hasAttribute(name){return this.attrs.has(String(name));}
 // The inline style is the style attribute: removing it clears every declaration.
 removeAttribute(name){this.attrs.delete(String(name));if(name==='style')this.style=new Style();}
 get className(){return this.getAttribute('class')||'';}
 set className(value){this.setAttribute('class',value);}
 get id(){return this.getAttribute('id')||'';}
 get hidden(){return this.hasAttribute('hidden');}
 set hidden(value){if(value)this.setAttribute('hidden','');else this.removeAttribute('hidden');}
 get dataset(){
  const attribute=name=>'data-'+String(name).replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());
  return new Proxy({},{get:(_,name)=>this.getAttribute(attribute(name))??undefined,set:(_,name,value)=>{this.setAttribute(attribute(name),value);return true;}});
 }
 get textContent(){return this.text+this.children.map(child=>child.textContent).join('');}
 set textContent(value){for(const child of [...this.children])child.remove();this.text=String(value);}
 append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
 remove(){if(!this.parentNode)return;const list=this.parentNode.children;list.splice(list.indexOf(this),1);this.parentNode=null;}
 cloneNode(deep=false){
  const copy=new Node(this.ownerDocument,this.localName,this.namespaceURI);
  for(const [name,value] of this.attrs)copy.attrs.set(name,value);
  copy.style=this.style.clone();copy.text=this.text;
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
const separator=doc=>element(doc,'svg',{class:'scope-separator'},element(doc,'use',{href:'#i-down'}));

// The placeholders' words, as localize() writes them from welcome.mjs's copy.
const WORDS={fr:{country:'Pays',campus:'Campus'},en:{country:'Country',campus:'Campus'},ar:{country:'الدولة',campus:'الفرع'}};
const PENDING={world:['country','campus'],continent:['country','campus'],country:['campus'],campus:[]};
const letters=text=>[...(text||'')].length;
const rect=(left,width,height=48)=>({left,right:left+width,width,height});

// The page around the pill, as in both B pages: the bar with the ← and the pill (medallion, world command, summary, trail:
// the continent, the country, the current place, the two placeholders), and the room the bar leaves the pill.
function page({lang='fr',width=1440,height=900,compact='false',reading='false',section='explore',room=536,laidOut=true}={}){
 const listeners=new Map(),fontListeners=[];
 let resolveFonts;
 const doc={documentElement:null,defaultView:null,layouts:0,room,laidOut,
  fonts:{ready:new Promise(resolve=>{resolveFonts=resolve;}),addEventListener(type,callback){fontListeners.push([type,callback]);}},
  createElement:tag=>new Node(doc,tag),createElementNS:(namespace,tag)=>new Node(doc,tag,namespace)};
 const win={innerWidth:width,innerHeight:height,
  addEventListener(type,callback){listeners.set(type,[...(listeners.get(type)||[]),callback]);},
  dispatch(type){for(const callback of listeners.get(type)||[])callback({type});},
  getComputedStyle:node=>({fontSize:node.computedFontSize||'15px',direction:doc.documentElement.getAttribute('dir')==='rtl'?'rtl':'ltr'})};
 doc.defaultView=win;
 doc.documentElement=element(doc,'html');doc.documentElement.lang=lang;
 doc.body=element(doc,'body');doc.documentElement.append(doc.body);
 const app={dataset:{compactScope:compact,reading,section}};
 const placeholder=step=>element(doc,'li',{class:'scope-step scope-placeholder',id:`scope-${step}-placeholder`,'data-step':step,'aria-hidden':'true'},separator(doc),element(doc,'span',{'data-copy':step==='country'?'breadcrumbCountry':'breadcrumbCampus'}));
 const trail=element(doc,'ol',{class:'scope-trail'},
  element(doc,'li',{class:'scope-ancestor scope-world',id:'scope-world-item',hidden:''},element(doc,'button',{id:'scope-world'},element(doc,'span',{id:'scope-world-name'})),separator(doc)),
  element(doc,'li',{class:'scope-step scope-continent',id:'scope-continent-item',hidden:''},element(doc,'span',{id:'scope-continent-name',dir:'auto'}),separator(doc)),
  element(doc,'li',{class:'scope-ancestor scope-country',id:'scope-country-item',hidden:''},element(doc,'button',{id:'scope-country'},element(doc,'span',{id:'scope-country-name',dir:'auto'})),separator(doc)),
  element(doc,'li',{class:'scope-current'},element(doc,'button',{class:'scope-picker',id:'scope-picker','aria-label':'Monde · Choisir un pays ou un campus'},element(doc,'span',{id:'scope-name',dir:'auto'}),element(doc,'svg',{class:'chevron'},element(doc,'use',{href:'#i-down'})))),
  placeholder('country'),placeholder('campus'));
 trail.querySelector('.scope-picker').computedFontSize='14px';trail.querySelector('.scope-picker>span').computedFontSize='14px';
 const seat=element(doc,'span',{class:'scope-medallion',id:'scope-medallion','aria-hidden':'true'});
 const path=element(doc,'nav',{class:'scope-path',id:'scope-path','aria-label':'Chemin géographique'},seat,element(doc,'button',{class:'icon-button world-control scope-world-return',id:'reset'},element(doc,'svg',{},element(doc,'use',{href:'#i-globe'}))),element(doc,'span',{class:'sr-only',id:'scope-reading-summary',hidden:''}),trail);
 // The ←: 44 px, 38 px on phones; reading drops it (display:none, so 0 px).
 const back=element(doc,'button',{class:'scope-back icon-button',id:'scope-back'});
 Object.defineProperty(back,'offsetWidth',{get:()=>app.dataset.reading==='true'?0:win.innerWidth<=700?38:44});
 const bar=element(doc,'div',{class:'scope-bar',id:'scope-bar'},back,path);
 doc.body.append(bar);
 // Layout. A copy of the pill: 56 px of chrome (its border, the seat, the trail's padding), its name at 7 px a letter with
 // its chevron (24 px, hidden while reading), and each step it shows at 30 + 7 px a letter: the continent (not in the
 // short form), the country (not in the compact form) and the placeholders shown (the first one only in the short form);
 // 54 px tall for an Arabic name, 48 otherwise; its trail starts 45 px from its starting edge (the border and the seat).
 // The live pill is as wide as set within the bar's room, and that room when it asks for 100000 px. laidOut false: 0 px.
 const seen=[];
 doc.layout=node=>{
  doc.layouts++;
  if(node===path){const set=parseFloat(path.style.width);return rect(0,doc.laidOut?Number.isFinite(set)?Math.min(set,doc.room):0:0);}
  const copy=node.matches('.scope-path')?node:node.matches('.scope-trail')?node.parentNode:null;
  if(!copy||copy===path)return rect(0,0);
  if(node===copy)seen.push(copy);
  const shown=item=>Boolean(item)&&!item.hidden,short=copy.dataset.form==='short';
  const name=copy.querySelector('.scope-picker>span').textContent,continent=copy.querySelector('.scope-continent'),country=copy.querySelector('.scope-country');
  const steps=[!short&&shown(continent)&&continent.querySelector('span').textContent,app.dataset.compactScope!=='true'&&shown(country)&&country.querySelector('button>span').textContent,
   ...copy.querySelectorAll('.scope-placeholder').filter(shown).slice(0,short?1:2).map(step=>step.querySelector('span').textContent)].filter(Boolean);
  const outer=doc.laidOut?56+7*letters(name)-(app.dataset.reading==='true'?24:0)+steps.reduce((sum,text)=>sum+30+7*letters(text),0):0;
  const tall=/\p{Script=Arabic}/u.test(name)?54:48,inner=outer-46;
  if(node===copy)return rect(0,outer,tall);
  return doc.documentElement.getAttribute('dir')==='rtl'?rect(outer-45-inner,inner,tall):rect(45,inner,tall);
 };
 // The live trail as welcome.mjs's updateScope paints it, its words as localize() writes them.
 function show({level,name,crumb='',continent=null}){
  bar.dataset.level=level;trail.querySelector('.scope-picker>span').textContent=name;
  const country=trail.querySelector('.scope-country');country.hidden=level!=='campus';country.querySelector('button>span').textContent=level==='campus'?crumb:'';
  const step=trail.querySelector('.scope-continent');step.hidden=!continent;step.querySelector('span').textContent=continent||'';
  for(const node of trail.querySelectorAll('.scope-placeholder')){node.hidden=!PENDING[level].includes(node.dataset.step);node.querySelector('span').textContent=WORDS[doc.documentElement.lang][node.dataset.step];}
 }
 show({level:'world',name:lang==='ar'?'العالم':lang==='en'?'World':'Monde'});
 return {doc,win,app,bar,back,path,trail,seat,seen,show,fontsLoaded:()=>{resolveFonts();for(const [type,callback] of fontListeners)if(type==='loadingdone')callback();}};
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

test('§Y every path of the pill: « Monde », the continents, the countries with their continent, each campus with its continent and country',()=>{
 const list=scopeIndications({world:'Monde',continents:['Afrique','Europe'],countries:[{name:'France',continent:'Europe'},{name:'',continent:'Europe'}],
  campuses:[{name:'42 Paris',country:'France',continent:'Europe'},{name:'',country:'France',continent:'Europe'}]});
 assert.deepEqual(list,[{level:'world',name:'Monde'},{level:'continent',name:'Afrique'},{level:'continent',name:'Europe'},{level:'country',name:'France',continent:'Europe'},
  {level:'campus',name:'42 Paris',crumb:'France',continent:'Europe'}]);
 // welcome.mjs gives the 93 paths of the catalogue in the current language: 1 + 4 continents + 30 countries + 58 campuses,
 // each country's continent from the catalogue it already has (continents.mjs), no second request.
 const getter=welcome.match(/^ getIndications:(\(\)=>network\?scopeIndications\([^\n]+\):\[\])\}\);$/m)[1];
 assert.doesNotMatch(getter,/fetch|json\(/);
 const copySource=[welcome.match(/^const copy = \{[^]*?\n\};$/m)[0],...welcome.match(/^Object\.assign\(copy\.(?:fr|en|ar), \{[^]*?\n\}\);$/gm)].join('\n');
 const constant=name=>welcome.match(new RegExp('^const '+name+' = [^\\n]+$','m'))[0];
 for(const [locale,world,first,abu,country,asia,paris] of [['fr','Monde','Afrique','42 Abu Dhabi','Émirats arabes unis','Asie','Europe'],['en','World','Africa','42 Abu Dhabi','United Arab Emirates','Asia','Europe'],
  ['ar','العالم','أفريقيا','42 Abu Dhabi','الإمارات العربية المتحدة','آسيا','أوروبا']]){
  const context=vm.createContext({locale,network:catalogue,countries:catalogue.countries,campuses:catalogue.campuses,countryById:new Map(catalogue.countries.map(item=>[item.id,item])),
   regionNames:new Intl.DisplayNames(locale,{type:'region'}),continentIds,continentOfCountry,continentName,scopeIndications});
  vm.runInContext([copySource,constant('t'),constant('countryName'),'var getIndications='+getter].join('\n'),context);
  const items=JSON.parse(JSON.stringify(context.getIndications()));
  assert.equal(items.length,93,locale);
  assert.deepEqual(items[0],{level:'world',name:world});assert.deepEqual(items[1],{level:'continent',name:first});
  assert.deepEqual(items.find(item=>item.name===country),{level:'country',name:country,continent:asia},locale);
  assert.deepEqual(items.find(item=>item.name===abu),{level:'campus',name:abu,crumb:country,continent:asia},locale);
  assert.equal(items.find(item=>item.name==='42 Paris').continent,paris);
  assert.deepEqual(items.map(item=>item.level).join(),['world',...Array(4).fill('continent'),...Array(30).fill('country'),...Array(58).fill('campus')].join());
  assert.ok(items.filter(item=>item.level==='country'||item.level==='campus').every(item=>item.continent),'every country and campus has its continent');
  context.network=null;assert.equal(context.getIndications().length,0,'nothing before the catalogue');
 }
});

const FR=scopeIndications({world:'Monde',continents:['Amériques','Asie'],countries:[{name:'Émirats arabes unis',continent:'Asie'},{name:'France',continent:'Europe'}],
 campuses:[{name:'42 Abu Dhabi',country:'Émirats arabes unis',continent:'Asie'},{name:'42 Paris',country:'France',continent:'Europe'}]});
const AR=scopeIndications({world:'العالم',continents:['الأمريكتان','آسيا'],countries:[{name:'الإمارات العربية المتحدة',continent:'آسيا'},{name:'فرنسا',continent:'أوروبا'}],
 campuses:[{name:'42 Abu Dhabi',country:'الإمارات العربية المتحدة',continent:'آسيا'},{name:'42 Paris',country:'فرنسا',continent:'أوروبا'}]});
// The width of a path in the fake layout: the full form shows the continent, the country and every placeholder; the short
// form the current step and the next placeholder, a campus with its country; the compact form hides the country.
function widthOf({level,name,crumb,continent},{form='full',compact=false,reading=false,lang='fr'}={}){
 const steps=[form==='full'&&continent,!compact&&crumb,...PENDING[level].slice(0,form==='short'?1:2).map(step=>WORDS[lang][step])].filter(Boolean);
 return 56+7*letters(name)-(reading?24:0)+steps.reduce((sum,text)=>sum+30+7*letters(text),0);
}
const longest=(list,options={})=>Math.max(...list.map(item=>widthOf(item,options)));
const live=(p,item)=>p.show({level:item.level,name:item.name,crumb:item.crumb,continent:item.continent});

test('§Y the pill takes the width of its longest full path and the height of its tallest, measured on painted copies',()=>{
 const p=page();let list=FR;
 const pill=mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>list});
 assert.equal(p.path.style.width??'','','nothing is set at mount');
 const width=pill.fit();
 assert.equal(width,longest(FR));assert.equal(width,widthOf(FR[5]),'« Asie › Émirats arabes unis › 42 Abu Dhabi »');
 assert.equal(width,361);assert.equal(p.path.style.width,'361px');assert.equal(p.path.style.minHeight,'48px');assert.equal(pill.width,width);
 assert.equal(p.path.dataset.form,'full','the full path fits the bar (536 px)');
 // At « Monde » the full path is « Monde › Pays › Campus »: no « Continent » step, Monde is that level.
 assert.equal(widthOf(FR[0]),56+35+(30+28)+(30+42));
 assert.equal(p.seen.length,FR.length,'one copy per path');
 // The copies: in the bar, out of the accessibility tree and of reach, without ids, each with its path's steps (the
 // continent before a country or a campus, the country before a campus, the placeholders still to choose); the picker's
 // font size copied from the live picker (an id rule sets it); no <use> clones; the full form.
 for(const [index,copy] of p.seen.entries()){
  const item=FR[index],box=copy.parentNode;
  assert.equal(box.getAttribute('aria-hidden'),'true');assert.equal(box.inert,true);assert.match(box.style.cssText,/visibility:hidden/);
  assert.equal(copy.style.width,'max-content');assert.equal(copy.dataset.form,'full');
  assert.deepEqual([copy,...walkAll(copy)].filter(node=>node.id),[],'no id');
  assert.equal(walkAll(copy).filter(node=>node.localName==='use').length,0);
  assert.equal(copy.querySelector('.scope-picker>span').textContent,item.name);
  assert.equal(copy.querySelector('.scope-continent').hidden,!item.continent,item.name);
  assert.equal(copy.querySelector('.scope-continent>span').textContent,item.continent||'');
  assert.equal(copy.querySelector('.scope-country').hidden,!item.crumb);
  if(item.crumb)assert.equal(copy.querySelector('.scope-country').querySelector('button>span').textContent,item.crumb);
  assert.deepEqual(copy.querySelectorAll('.scope-placeholder').filter(node=>!node.hidden).map(node=>node.dataset.step),PENDING[item.level],item.name);
  assert.equal(copy.querySelector('.scope-picker').style.fontSize,'14px');assert.equal(copy.querySelector('.scope-picker>span').style.fontSize,'14px');
  assert.ok(copy.querySelector('.scope-medallion'),'the copy has the seat');
 }
 assert.equal(p.bar.children.length,2,'the copies are gone after the measure: the ← and the pill only');
 assert.equal(p.trail.querySelector('.scope-picker>span').textContent,'Monde','the live pill is untouched');
 assert.equal(p.trail.querySelector('.scope-continent').hidden,true);
 // Nothing changed (a filter change, the same language and form): no new measure.
 const layouts=p.doc.layouts;
 live(p,FR[5]);assert.equal(pill.fit(),width);live(p,FR[0]);assert.equal(pill.fit(),width);
 assert.equal(p.doc.layouts,layouts,'no layout read');
 // A new measure clones the live pill: its copies carry none of its inline style (width, height, the steps' margin).
 p.doc.documentElement.lang='ar';list=AR;live(p,AR[0]);p.seen.length=0;pill.fit();
 for(const copy of p.seen){assert.equal(copy.style.minHeight,undefined);assert.equal(copy.style.getPropertyValue('--scope-shift'),'');assert.equal(copy.style.width,'max-content');}
 // Arabic: an Arabic name makes the line taller; one height for every path.
 assert.equal(p.path.style.minHeight,'54px');assert.equal(pill.width,longest(AR,{lang:'ar'}));
 // Before the catalogue there is nothing to measure: the pill keeps its natural size.
 list=[];assert.equal(pill.fit(),null);assert.equal(p.path.style.width,'');assert.equal(p.path.style.minHeight,'');
});

test('§Y phones: where the full path does not fit, the short form, the current step and the next one, a campus with its country',()=>{
 const p=page({width:390,height:844,room:272});
 const pill=mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>FR});
 const width=pill.fit();
 assert.ok(longest(FR)>272.5,'the full path does not fit the bar');
 assert.equal(p.path.dataset.form,'short');assert.equal(width,longest(FR,{form:'short'}));
 // « Monde › Pays », « Asie › Pays », « Émirats arabes unis › Campus », « Émirats arabes unis › 42 Abu Dhabi »: the
 // longest short form, a campus with its country (« France › 42 Paris » as before).
 assert.equal(widthOf(FR[0],{form:'short'}),56+35+58);assert.equal(width,widthOf(FR[5],{form:'short'}));assert.equal(width,56+84+30+133);
 // Measured in both forms, the short copies last.
 const short=p.seen.slice(-FR.length);
 assert.equal(p.seen.length,2*FR.length);assert.ok(short.every(copy=>copy.dataset.form==='short'));
 // The bar is narrower than that: the pill takes the room it has, and a longer path ends with « … » (CSS).
 assert.ok(width>272);
 // The compact form (the dock's container query, read by moveIndicator): the short form at once, the country hidden.
 const compact=page({width:360,height:740,room:244,compact:'true'});
 const small=mountScopePill({app:compact.app,bar:compact.bar,path:compact.path,trail:compact.trail,getIndications:()=>FR});
 assert.equal(small.fit(),longest(FR,{form:'short',compact:true}));assert.equal(compact.path.dataset.form,'short');
 assert.equal(compact.seen.length,FR.length,'one form measured');assert.equal(small.width,widthOf(FR[3],{form:'short'}),'« Émirats arabes unis › Campus »');
 // A desktop window in the compact form keeps it too: the short form.
 const wide=page({compact:'true'});
 const pinned=mountScopePill({app:wide.app,bar:wide.bar,path:wide.path,trail:wide.trail,getIndications:()=>FR});
 pinned.fit();assert.equal(wide.path.dataset.form,'short');
});

test('§Y the steps are centred on the pill\'s whole width; a path too long for that starts right after the seat',()=>{
 for(const dir of ['ltr','rtl']){
  const p=page();p.doc.documentElement.setAttribute('dir',dir);
  const pill=mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>FR});
  const width=pill.fit(),shift=item=>Math.max(0,width/2-45-(widthOf(item)-46)/2);
  // « Monde › Pays › Campus » (221 px in a 361 px pill): its trail starts 48 px after the seat, so its middle is the pill's.
  assert.equal(p.path.style.getPropertyValue('--scope-shift'),shift(FR[0]).toFixed(2)+'px',dir);assert.equal(shift(FR[0]),48);
  for(const item of FR){
   live(p,item);pill.fit();
   const value=p.path.style.getPropertyValue('--scope-shift');
   if(shift(item)>0){assert.equal(value,shift(item).toFixed(2)+'px',item.name);assert.equal(45+shift(item)+(widthOf(item)-46)/2,width/2,'its middle is the pill\'s');}
   else assert.equal(value,'',item.name+' starts after the seat');
  }
 }
 // On a phone the pill is the bar's room, narrower than the set width: the steps are centred on the pill shown.
 const phone=page({width:390,height:844,room:272});
 const pill=mountScopePill({app:phone.app,bar:phone.bar,path:phone.path,trail:phone.trail,getIndications:()=>FR});
 pill.fit();
 assert.equal(phone.path.style.getPropertyValue('--scope-shift'),(272/2-45-(widthOf(FR[0],{form:'short'})-46)/2).toFixed(2)+'px');
 live(phone,FR[5]);pill.fit();assert.equal(phone.path.style.getPropertyValue('--scope-shift'),'','too long: after the seat, and « … »');
 // A place the catalogue does not know (no measure): no margin.
 phone.show({level:'campus',name:'42 Ailleurs',crumb:'France',continent:'Europe'});pill.fit();assert.equal(phone.path.style.getPropertyValue('--scope-shift'),'');
});

test('§Y the pill keeps one place: after it the bar keeps a room as wide as the ←, none while reading',()=>{
 for(const [options,back] of [[{},44],[{width:390,height:844,room:272},38],[{reading:'true',room:460},0]]){
  const p=page(options);
  mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>FR}).fit();
  assert.equal(p.bar.style.getPropertyValue('--scope-back'),back+'px',JSON.stringify(options));
 }
 // The room is the bar's last flex item; reading drops it with the ← (globe-framing.css).
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock]:not([data-reading=true]) .scope-bar::after'),{content:"''",flex:'0 0 var(--scope-back,44px)','pointer-events':'none'});
 assert.match(read('globe-framing.css'),/:root \.app\[data-navigation=dock\]\[data-reading=true\] :is\(\.scope-back,\.scope-picker \.chevron\) \{ display:none; \}/);
 // The ←: hidden at the world level, it keeps its box outside reading (§T).
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock]:not([data-reading=true]) .scope-back:disabled'),{display:'inline-flex',visibility:'hidden'});
 // The bar itself stays centred on the page's axis, and on the column's beside the side rail (responsive-dock.css).
 assert.match(read('content-preview.css'),/:root \.app\[data-navigation=dock\] \.scope-bar \{\n  position: absolute;[^}]*left: 50%;\n  right: auto;\n  transform: translateX\(-50%\);/);
 assert.match(read('responsive-dock.css'),/:root \.app\[data-navigation=dock\] #main>\.scope-bar \{ left:calc\(50vw \+ var\(--dock-rail-room\) \/ 2\); \}/);
});

test('§Y a pill without a layout box keeps its natural size and measures again at the next call',()=>{
 const p=page({laidOut:false});
 const pill=mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>FR});
 assert.equal(pill.fit(),null);assert.equal(p.path.style.width,'','never 0 px');assert.equal(p.path.style.minHeight,'');
 assert.equal(p.path.style.getPropertyValue('--scope-shift'),'');
 const layouts=p.doc.layouts;pill.fit();assert.ok(p.doc.layouts>layouts,'measured again');
 p.doc.laidOut=true;assert.equal(pill.fit(),longest(FR),'measured once laid out');
});

test('§Y measured again on a language change, a resize, a change of form, of section, reading, and when the fonts load',async()=>{
 const p=page();let list=FR;const measures=[];
 const scale=()=>p.win.innerWidth<700?.9:1;
 const pill=mountScopePill({app:p.app,bar:p.bar,path:p.path,trail:p.trail,getIndications:()=>list,
  measure:(items,form)=>{
   measures.push(form);const options={form,compact:p.app.dataset.compactScope==='true',reading:p.app.dataset.reading==='true',lang:p.doc.documentElement.lang};
   return items.map(item=>{const width=widthOf(item,options)*scale();return {width,height:48,start:45,trail:width-46};});
  }});
 assert.equal(pill.fit(),longest(FR));assert.deepEqual(measures,['full']);
 // Language: localize() sets the language and updates the bar, whose update fits the pill.
 p.doc.documentElement.lang='ar';list=AR;live(p,AR[0]);
 assert.equal(pill.fit(),Math.ceil(longest(AR,{lang:'ar'})-.01));assert.equal(measures.length,2);
 // Resize: the pill's own listener (the font sizes and the bar's room follow the viewport): the short form on a phone.
 p.win.innerWidth=390;p.win.innerHeight=844;p.doc.room=272;p.win.dispatch('resize');
 assert.deepEqual(measures.slice(2),['full','short']);assert.equal(pill.width,Math.ceil(longest(AR,{form:'short',lang:'ar'})*.9-.01));
 // The compact form (the dock's container query, read by moveIndicator): the short form at once, without the country.
 p.app.dataset.compactScope='true';pill.fit();assert.deepEqual(measures.slice(4),['short']);
 assert.equal(pill.width,Math.ceil(longest(AR,{form:'short',compact:true,lang:'ar'})*.9-.01));
 // A content section (its bar may differ) and reading (no chevron, no ←): measured again.
 p.app.dataset.section='projects';pill.fit();assert.equal(measures.length,6);
 p.app.dataset.reading='true';pill.fit();assert.equal(measures.length,7);
 assert.equal(pill.width,Math.ceil(longest(AR,{form:'short',compact:true,reading:true,lang:'ar'})*.9-.01));
 // The real fonts: a measure again when they have loaded, even with nothing else changed.
 p.fontsLoaded();await settle();
 assert.ok(measures.length>=8);
 const before=measures.length;live(p,AR[3]);pill.fit();assert.equal(measures.length,before,'then nothing until the next change');
});

test('§Y the trail in both pages: the continent step before the country, the placeholders after the current place, never commands',()=>{
 for(const name of ['index.html','content-preview.html']){
  const html=read(name),trail=html.match(/<ol class="scope-trail">\n([^]*?)\n\s*<\/ol>/)[1];
  const items=[...trail.matchAll(/<li ([^>]*)>([^]*?)<\/li>/g)].map(([,attributes,body])=>({attributes,body}));
  assert.deepEqual(items.map(item=>item.attributes.match(/id="([^"]+)"/)?.[1]??'current'),
   ['scope-world-item','scope-continent-item','scope-country-item','current','scope-country-placeholder','scope-campus-placeholder'],name);
  // The continent: plain text (no command leads to it), hidden until a country is chosen; read before the country.
  assert.equal(items[1].attributes,'class="scope-step scope-continent" id="scope-continent-item" hidden');
  assert.equal(items[1].body,'<span id="scope-continent-name" dir="auto"></span><svg class="scope-separator" aria-hidden="true"><use href="#i-down"/></svg>');
  // The placeholders: plain text after a separator, out of the accessibility tree and of reach, their words from the copy.
  for(const [index,step,key,word] of [[4,'country','breadcrumbCountry','Pays'],[5,'campus','breadcrumbCampus','Campus']]){
   assert.equal(items[index].attributes,`class="scope-step scope-placeholder" id="scope-${step}-placeholder" data-step="${step}" aria-hidden="true"`);
   assert.equal(items[index].body,`<svg class="scope-separator" aria-hidden="true"><use href="#i-down"/></svg><span data-copy="${key}">${word}</span>`);
  }
  for(const item of [items[1],items[4],items[5]])assert.doesNotMatch(item.body,/<button|<a |tabindex|role=/);
  // The trail stays inside the path, which reading makes inert (reading-scope.mjs): the placeholders only show there.
  assert.match(html,/<nav class="scope-path" id="scope-path" aria-label="Chemin géographique">[^]*?<ol class="scope-trail">[^]*?<\/ol>\n\s*<\/nav>/);
  assert.doesNotMatch(trail,/Continent|القارة/);
 }
 assert.equal(read('index.html').match(/<ol class="scope-trail">[^]*?<\/ol>/)[0],read('content-preview.html').match(/<ol class="scope-trail">[^]*?<\/ol>/)[0]);
});

test('§Y the placeholders\' words in the three languages (no « Continent »: Monde is that step), written by localize()',()=>{
 const copySource=[welcome.match(/^const copy = \{[^]*?\n\};$/m)[0],...welcome.match(/^Object\.assign\(copy\.(?:fr|en|ar), \{[^]*?\n\}\);$/gm)].join('\n');
 const context=vm.createContext({});vm.runInContext(copySource+';var result=copy;',context);
 for(const [locale,words] of Object.entries(WORDS)){
  assert.equal(context.result[locale].breadcrumbCountry,words.country,locale);assert.equal(context.result[locale].breadcrumbCampus,words.campus,locale);
  assert.ok(!Object.values(context.result[locale]).some(value=>/^(Continent|القارة)$/.test(value)),locale);
 }
 assert.match(welcome,/^ document\.querySelectorAll\('\[data-copy\]'\)\.forEach\(element=>\{element\.textContent=t\(element\.dataset\.copy\);\}\);$/m);
});

test('§Y the stylesheet: the steps\' look, the placeholders muted and never cut, the chosen steps in the text colour, the short form',()=>{
 const welcomeCss=read('welcome.css'),framing=read('globe-framing.css'),preview=read('content-preview.css');
 // The trail's margin centres it (scope-pill.mjs); nothing stretches it.
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock] .scope-path>.scope-trail'),{'margin-inline-start':'var(--scope-shift,0px)'});
 assert.doesNotMatch(dockCss+welcomeCss+framing,/scope-(trail|current|picker)[^{]*\{[^}]*(flex-grow|flex:\s*1|justify-content|margin-inline-start:\s*auto)/);
 // A step that is not a button takes the ancestors' size and padding; only a chosen name ends with « … ».
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock] .scope-step>span'),{display:'block','min-width':'0',padding:'8px 7px',overflow:'hidden','text-overflow':'ellipsis','white-space':'nowrap',
  'font-size':'clamp(.8125rem,calc(.7625rem + .25vw),.9375rem)'});
 assert.match(dockCss,/:root \.app\[data-navigation=dock\] \.scope-step>span \{\n display:block;min-width:0;padding:8px 10px;/);
 assert.match(dockCss,/@media\(max-width:700px\) \{\n :root \.app\[data-navigation=dock\] \.scope-step>span \{ padding:8px 7px; \}\n\}/);
 assert.match(read('responsive-content.css'),/:root \.app\[data-navigation=dock\] :is\(\.scope-picker,\.scope-ancestor button\) \{ font-size:clamp\(\.8125rem,calc\(\.7625rem \+ \.25vw\),\.9375rem\); \}/);
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock] .scope-placeholder'),{'flex-shrink':'0'});
 // The chosen steps in the text colour (the country before a campus was muted), the ones still to choose muted: the
 // theme's own tone (tokens.css), GrayText in forced colours.
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock] :is(.scope-ancestor button,.scope-continent>span)'),{color:'var(--h42-color-text)'});
 assert.match(dockCss,/\n:root \.app\[data-navigation=dock\] \.scope-placeholder>span \{ color:var\(--h42-muted\); \}\n/);
 assert.deepEqual(rule(dockCss,':root[data-theme=dark] .app[data-navigation=dock] .scope-placeholder>span'),{color:'var(--h42-cadet)'});
 assert.match(dockCss,/@media\(forced-colors:active\) \{\n :root \.app\[data-navigation=dock\] \.scope-placeholder>span \{ color:GrayText; \}\n\}/);
 const tokens=readFileSync(new URL('../../shared/brand/tokens.css',import.meta.url),'utf8');
 assert.match(tokens,/--h42-muted: rgba\(91, 91, 96, 1\);/);assert.match(tokens,/--h42-cadet: rgba\(149, 176, 176, 1\);/);
 // The short form: the continent and every placeholder after the first one shown are hidden; a campus keeps its country
 // (only the compact form hides it, as before).
 assert.deepEqual(rule(dockCss,':root .app[data-navigation=dock] .scope-path[data-form=short] :is(.scope-continent,.scope-placeholder:not([hidden])~.scope-placeholder)'),{display:'none'});
 assert.match(framing,/:root \.app\[data-navigation=dock\]\[data-compact-scope=true\] \.scope-ancestor \{ display:none; \}/);
 assert.doesNotMatch(dockCss,/data-form=short[^{]*scope-(ancestor|country)/);
 // The pill and its trail may shrink below the set width, inside the bar's max-width; a name then ends with « … ».
 assert.match(welcomeCss,/\.scope-path\{min-width:0;/);
 assert.match(welcomeCss,/\.scope-trail\{display:flex;align-items:center;gap:2px;list-style:none;margin:0;padding:2px 5px;min-width:0\}\.scope-trail li\{display:flex;align-items:center;min-width:0\}/);
 assert.match(welcomeCss,/\.scope-picker>span,\.scope-ancestor button>span\{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\}/);
 assert.match(welcomeCss,/\[hidden\]\{display:none!important\}/,'a hidden step never shows');
 assert.match(preview,/:root \.app\[data-navigation=dock\] \.scope-bar \{\n  position: absolute;[^}]*width: max-content;\n  max-width: min\(640px, calc\(100% - 64px\)\);/);
 assert.match(preview,/@media \(max-width: 700px\) \{[^]*?:root \.app\[data-navigation=dock\] \.scope-bar \{ max-width: calc\(100% - 32px\); \}/);
 assert.match(welcomeCss,/\.scope-back:disabled\{display:none\}/,'version A\'s rule, overridden in the dock layout only');
});

test('§Y welcome.mjs paints the live steps on every update of the bar, then fits the pill; on a change of form and before a reading move',()=>{
 assert.match(welcome,/^import \{scopeIndications,mountScopePill\} from '\.\/scope-pill\.mjs\?v=[\w-]+';$/m);
 assert.match(welcome,/^const scopePill=mountScopePill\(\{app,bar:byId\('scope-bar'\),path:byId\('scope-path'\),trail:document\.querySelector\('\.scope-trail'\),$/m);
 assert.match(welcome,/^const readingScope=mountReadingScope\(\{[^\n]*,fit:scopePill\.fit\}\);$/m);
 const update=welcome.match(/^function updateScope\(\) \{[^]*?\n\}/m)[0];
 assert.match(update,/byId\('scope-bar'\)\.dataset\.level=scope\.level;[^]*byId\('scope-continent-item'\)\.hidden=!continent;byId\('scope-continent-name'\)\.textContent=continent\|\|'';\n byId\('scope-country-placeholder'\)\.hidden=Boolean\(scope\.country\);byId\('scope-campus-placeholder'\)\.hidden=Boolean\(scope\.campus\);\n byId\('scope-name'\)\.textContent=name;[^]*scopePill\.fit\(\);scopePopover\?\.position\(\);\n explorerBand\.measure\(\);\n\}$/);
 assert.match(update,/const continent=scope\.country\?continentName\(scope\.continent,locale\):null;/);
 const indicator=welcome.match(/^function moveIndicator\(\) \{[^]*?\n\}/m)[0];
 assert.match(indicator,/app\.dataset\.compactScope=String\(compact\);[^]*?scopePill\.fit\(\);scopePopover\?\.position\(\);\n \}/);
 // localize() writes the placeholders' words before its updateScope() measures the pill again.
 const localize=welcome.match(/^function localize\(\)\{[^]*?\n\}/m)[0];
 assert.ok(localize.indexOf("querySelectorAll('[data-copy]')")<localize.indexOf('updateScope();'));
});
