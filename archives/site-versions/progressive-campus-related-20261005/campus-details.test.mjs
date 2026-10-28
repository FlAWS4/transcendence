import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {mountCampusDetails} from './campus-details.mjs';
import {previewEntries} from './content-preview-data.mjs';

const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const network=JSON.parse(read('./campuses.json'));
const sites=JSON.parse(read('./campus-websites.json')).campuses;
const locales=JSON.parse(read('./campus-website-locales.json')).campuses;
const campuses=network.campuses.map(campus=>({...campus,
 ...(sites[campus.id]?.kind==='campus-site'?{websiteUrl:sites[campus.id].url}:{}),
 websiteLocales:locales[campus.id]}));
const globeSource=read('./integrated-globe.mjs'),welcomeSource=read('./welcome.mjs');
const callback=welcomeSource.slice(welcomeSource.indexOf('onCampusDetails(campus){'),welcomeSource.indexOf('   formatPlace:'));
const markersCode=globeSource.slice(globeSource.indexOf(' function syncMarkers('),globeSource.indexOf(' function renderMarkers('));

class Element extends EventTarget {
 constructor(tagName,ownerDocument){
  super();this.tagName=tagName;this.ownerDocument=ownerDocument;this.children=[];this.attributes={};this.dataset={};
  this.classList={add(){},toggle(){}};
 }
 append(...children){for(const child of children){child.parentElement=this;this.children.push(child);}}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 closest(tag){let node=this;while(node){if(node.tagName===tag)return node;node=node.parentElement;}return null;}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(child=>child!==this);}
}
function documentFixture(clipboard){
 const doc={createElement:tag=>new Element(tag,doc),createElementNS:(_,tag)=>new Element(tag,doc),defaultView:{navigator:{clipboard}}};
 return doc;
}
const descendants=root=>[root,...root.children.flatMap(descendants)];
const byClass=(root,name)=>descendants(root).filter(node=>node.className?.split(' ').includes(name));
const textOf=root=>[root.textContent||'',...root.children.map(textOf)].join(' ');
const officialLink=root=>byClass(root,'campus-details-link')[0];
function directFixture(id='paris',options={}){
 const doc=documentFixture(options.clipboard),dialog=doc.createElement('dialog'),container=doc.createElement('div');dialog.id='dialog';dialog.append(container);
 const instance=mountCampusDetails({container,campus:campuses.find(item=>item.id===id),countryName:()=>({fr:'France',en:'France',ar:'فرنسا'}[options.locale||'fr']),
  entries:previewEntries,...options});
 return {root:instance.element,dialog,...instance};
}
function markerFixture(id,{preview=true,locale='fr'}={}){
 const campus=campuses.find(item=>item.id===id),doc=documentFixture();
 const overlay=doc.createElement('div'),details=doc.createElement('div'),markers=new Map(),navigationCalls=[];
 const ctx=vm.createContext({locale,document:doc,markers,scope:{level:'campus',country:campus.country,campus:id,...(preview?{previewCampus:id}:{})},
  campusById:new Map(campuses.map(item=>[item.id,item])),countries:new Map([[campus.country,{members:[campus]}]]),
  mountCampusDetails,previewEntries,countryName:()=>campus.country,
  dialog:{close(){navigationCalls.push({action:'close-details'});}},
  campusMap:{close(){navigationCalls.push({action:'close-map'});}},
  navigate(route){navigationCalls.push({action:'navigate',route});},
  openDialog(_title,render){details.children=[];render(details);},
  createCampusDirection:()=>({isOffscreen:()=>false,destroy(){}}),maplibregl:{LngLat:{convert:value=>value}},map:{getCanvasContainer:()=>overlay},
  renderMarkers(){},markersDirty:false,flight:false,worldPreparing:false,
  container:{focus(){throw new Error('The campus information view owns focus');}},
 });
 vm.runInContext("options={"+callback+"};"+markersCode,ctx);ctx.syncMarkers();
 return {ctx,navigationCalls,open(){markers.get(id).button.dispatchEvent(new Event('click'));return details.children[0];}};
}

test('Explorer and content-map marker clicks keep the selected website language',()=>{
 for(const preview of [false,true]){
  const fixture=markerFixture('paris',{preview});
  for(const [locale,url,hreflang] of [['fr','https://42.fr/','fr'],['en','https://42.fr/en/homepage/','en'],['ar','https://42.fr/en/homepage/','en'],['fr','https://42.fr/','fr']]){
   fixture.ctx.locale=locale;const root=fixture.open(),destination=officialLink(root);
   assert.equal(root.lang,locale);assert.equal(root.dir,locale==='ar'?'rtl':'ltr');
   assert.equal(destination.href,url);assert.equal(destination.hreflang,hreflang);
  }
 }
});

test('verified English, local and network-profile fallbacks remain available',()=>{
 for(const [id,url,hreflang] of [['sao','https://42sp.org.br/en','en'],['lyon','https://42lyon.fr/','fr'],['tokyo','https://42tokyo.jp/','ja'],['rio','https://42.rio/','pt'],['quebec','https://www.42network.org/campus/42-quebec/','en']]){
  const {root}=directFixture(id,{locale:'ar'}),destination=officialLink(root);
  assert.equal(destination.href,url,id);assert.equal(destination.hreflang,hreflang,id);
  assert.equal(destination.target,'_blank');assert.equal(destination.rel,'noopener noreferrer');
  assert.match(byClass(root,'campus-details-link-note')[0].textContent,/الموقع باللغة/);
 }
});

test('Arabic campus destinations and manual external-site language instructions survive',()=>{
 assert.equal(officialLink(directFixture('1337-khouribga',{locale:'ar'}).root).href,'https://www.1337.ma/ar/');
 const {root}=directFixture('luanda',{locale:'en'});
 assert.equal(officialLink(root).href,'https://www.42luanda.com/');
 assert.ok(byClass(root,'campus-details-link-note').some(note=>note.textContent==='Select English from the website’s language menu.'));
});

test('related content uses exact campus relationships and counts content, not people or school activity',()=>{
 const {root}=directFixture('paris');
 assert.equal(byClass(root,'campus-details-card').length,2);
 assert.equal(byClass(root,'campus-details-count')[0].textContent,'2 contenus de démonstration');
 assert.deepEqual(byClass(root,'campus-details-group-count').map(node=>node.textContent),['1 projet','1 parcours']);
 assert.match(textOf(root),/Derrière une ligne de commande/);
 assert.match(textOf(root),/Apprendre à poser la bonne question/);
 assert.doesNotMatch(textOf(root),/Une porte vers la troisième dimension|Autour d’un bug/);
 assert.match(byClass(root,'campus-details-demo')[0].textContent,/fictifs/);
 assert.equal(descendants(root).filter(node=>node.tagName==='img').length,0);
 assert.equal(byClass(root,'campus-details-mark')[0].getAttribute('aria-hidden'),'true');
});

test('catalogue-only campuses retain useful facts with an honest empty state and no empty rubric links',()=>{
 const {root}=directFixture('tirana');
 assert.equal(byClass(root,'campus-details-card').length,0);
 assert.equal(byClass(root,'campus-details-browse').length,0);
 assert.equal(byClass(root,'campus-details-count').length,0);
 assert.equal(byClass(root,'campus-details-empty').length,1);
 assert.match(textOf(root),/Aucun contenu de démonstration/);
 assert.equal(descendants(root).find(node=>node.tagName==='address').textContent,campuses.find(c=>c.id==='tirana').address);
 assert.equal(officialLink(root).href,'https://42tirana.al/');
});

test('each populated section gets one preview and its real sample count, without duplicates',()=>{
 const first=previewEntries.find(entry=>entry.id==='minishell-under-the-prompt');
 const extra={...first,id:'second-paris-project',title:{fr:'Second exemple'}};
 const {root}=directFixture('paris',{entries:[...previewEntries,extra,first,{...first,id:'foreign',campus:'paris-other'},{...first,id:'wrong-section',section:'staff'}]});
 assert.equal(byClass(root,'campus-details-card').length,2);
 assert.equal(byClass(root,'campus-details-count')[0].textContent,'3 contenus de démonstration');
 assert.deepEqual(byClass(root,'campus-details-group-count').map(node=>node.textContent),['2 projets','1 parcours']);
});

test('detail and section links navigate with the campus scope, clearing any previous detail',()=>{
 const received=[],{root}=directFixture('paris',{onNavigate:(route,event)=>{event.preventDefault();received.push(route);}});
 const project=byClass(root,'campus-details-card')[0],browse=byClass(root,'campus-details-browse')[0];
 assert.equal(project.href,'#projects/minishell-under-the-prompt?country=FRA&campus=paris');
 assert.equal(browse.href,'#projects?country=FRA&campus=paris');
 project.dispatchEvent(new Event('click',{cancelable:true}));browse.dispatchEvent(new Event('click',{cancelable:true}));
 assert.deepEqual(received,[
  {section:'projects',entryId:'minishell-under-the-prompt',country:'FRA',campus:'paris',query:''},
  {section:'projects',entryId:null,country:'FRA',campus:'paris',query:''},
 ]);
 const modified=new Event('click',{cancelable:true});Object.defineProperty(modified,'ctrlKey',{value:true});project.dispatchEvent(modified);
 assert.equal(received.length,2);assert.equal(modified.defaultPrevented,false);
});

test('the new controls, sample labels and expansion are localized in all three languages',()=>{
 for(const [locale,expand,collapse,demo] of [
  ['fr','Déployer la fiche','Réduire la fiche','Contenus de démonstration'],
  ['en','Expand campus details','Collapse campus details','Demonstration content'],
  ['ar','توسيع بطاقة الفرع','طي بطاقة الفرع','محتوى توضيحي'],
 ]){
  const {root,dialog}=directFixture('paris',{locale}),button=byClass(root,'campus-details-expand')[0];
  assert.equal(root.lang,locale);assert.equal(root.dir,locale==='ar'?'rtl':'ltr');
  assert.equal(button.textContent,expand);assert.equal(button.getAttribute('aria-expanded'),'false');assert.equal(button.getAttribute('aria-controls'),'dialog');
  button.dispatchEvent(new Event('click'));
  assert.equal(button.textContent,collapse);assert.equal(button.getAttribute('aria-expanded'),'true');assert.equal(dialog.dataset.expanded,'true');
  button.dispatchEvent(new Event('click'));
  assert.equal(dialog.dataset.expanded,'false');assert.equal(button.getAttribute('aria-expanded'),'false');
  assert.ok(byClass(root,'campus-details-demo')[0].textContent.startsWith(demo));
  const firstTitle=descendants(byClass(root,'campus-details-card')[0]).find(node=>node.tagName==='h5').textContent;
  assert.equal(firstTitle,previewEntries[0].title[locale]);
 }
});

test('successful address copying announces completion without changing the address',async()=>{
 const written=[],{root}=directFixture('paris',{clipboard:{async writeText(value){written.push(value);}}});
 const button=byClass(root,'campus-details-copy')[0],status=byClass(root,'campus-details-copy-status')[0];
 button.dispatchEvent(new Event('click'));await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(written,[campuses.find(campus=>campus.id==='paris').address]);
 assert.equal(status.textContent,'Adresse copiée.');assert.equal(status.getAttribute('role'),'status');assert.equal(button.disabled,false);
});

test('clipboard denial and unsupported clipboard provide manual-copy feedback, not a false success',async()=>{
 for(const options of [{clipboard:undefined},{onCopyAddress:async()=>{throw new Error('Not allowed');}}]){
  const {root}=directFixture('paris',options),button=byClass(root,'campus-details-copy')[0],status=byClass(root,'campus-details-copy-status')[0];
  button.dispatchEvent(new Event('click'));await new Promise(resolve=>setImmediate(resolve));
  assert.match(status.textContent,/Sélectionnez l’adresse/);assert.doesNotMatch(status.textContent,/Adresse copiée/);assert.equal(button.disabled,false);
 }
});

test('an injected copier uses the official address and cannot finish on a destroyed component',async()=>{
 let finish,written;
 const {root,destroy}=directFixture('paris',{onCopyAddress:value=>{written=value;return new Promise(resolve=>{finish=resolve;});}});
 const button=byClass(root,'campus-details-copy')[0],status=byClass(root,'campus-details-copy-status')[0];
 button.dispatchEvent(new Event('click'));assert.equal(button.disabled,true);
 assert.equal(written,campuses.find(campus=>campus.id==='paris').address);
 destroy();finish();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(status.textContent,'');
});


test('the active welcome callback closes campus overlays before navigating to a related detail or section',()=>{
 for(const preview of [false,true]){
  for(const [className,entryId] of [['campus-details-card','minishell-under-the-prompt'],['campus-details-browse',null]]){
   const fixture=markerFixture('paris',{preview}),root=fixture.open();
   assert.equal(byClass(root,'campus-details-card').length,2,'the real callback supplies the editorial corpus');
   const event=new Event('click',{cancelable:true});byClass(root,className)[0].dispatchEvent(event);
   assert.equal(event.defaultPrevented,true);
   assert.deepEqual(fixture.navigationCalls,[
    {action:'close-details'},
    {action:'close-map'},
    {action:'navigate',route:{section:'projects',entryId,country:'FRA',campus:'paris',query:''}},
   ]);
  }
 }
});
