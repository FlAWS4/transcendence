import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {mountCampusDetails} from './campus-details.mjs';

const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const network=JSON.parse(read('./campuses.json'));
const sites=JSON.parse(read('./campus-websites.json')).campuses;
const locales=JSON.parse(read('./campus-website-locales.json')).campuses;
const campuses=network.campuses.map(campus=>({...campus,
 ...(sites[campus.id]?.kind==='campus-site'?{websiteUrl:sites[campus.id].url}:{}),
 websiteLocales:locales[campus.id]}));
const globeSource=read('./integrated-globe.mjs'),welcomeSource=read('./welcome.mjs');
const markersCode=globeSource.slice(globeSource.indexOf(' function syncMarkers('),globeSource.indexOf(' function renderMarkers('));
const callback=welcomeSource.slice(welcomeSource.indexOf('onCampusDetails(campus){'),welcomeSource.indexOf('   formatPlace:'));
const fixedNow=new Date('2026-10-05T12:00:00Z');
const realProfiles=JSON.parse(read('./campus-profiles.json')).campuses;

class Element extends EventTarget {
 constructor(tagName,ownerDocument){super();this.tagName=tagName;this.ownerDocument=ownerDocument;this.children=[];this.attributes={};this.dataset={};this.classList={add(){},toggle(){}};}
 append(...children){for(const child of children){child.parentElement=this;this.children.push(child);}}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 closest(tag){let node=this;while(node){if(node.tagName===tag)return node;node=node.parentElement;}return null;}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(child=>child!==this);}
}
function documentFixture(clipboard){
 const doc={baseURI:'https://horizon.example/welcome/index.html',createElement:tag=>new Element(tag,doc),createElementNS:(_,tag)=>new Element(tag,doc),defaultView:{navigator:{clipboard}}};return doc;
}
const descendants=root=>[root,...root.children.flatMap(descendants)];
const byClass=(root,name)=>descendants(root).filter(node=>node.className?.split(' ').includes(name));
const textOf=root=>[root.textContent||'',...root.children.map(textOf)].join(' ');
const officialLink=root=>byClass(root,'campus-details-link')[0];
test('campus photos open the complete gallery at the selected photo and release their viewer',()=>{
 let opened,closed=0;
 const fixture=directFixture('paris',{profile:realProfiles.paris,onOpenMedia:options=>{opened=options;return{close(){closed++;}};}});
 const buttons=byClass(fixture.root,'campus-details-photo-open');
 assert.equal(buttons.length,2);
 buttons[1].dispatchEvent(new Event('click'));
 assert.equal(opened.index,1);assert.equal(opened.items.length,2);
 assert.equal(opened.items[1].type,'image');assert.equal(opened.trigger,buttons[1]);
 assert.equal(opened.locale,'fr');assert.ok(opened.items[1].alt);
 assert.equal(buttons[1].getAttribute('data-campus-sheet-swipe'),'');
 fixture.destroy();assert.equal(closed,1);
});
function directFixture(id='paris',options={}){
 const doc=documentFixture(options.clipboard),dialog=doc.createElement('dialog'),container=doc.createElement('div');dialog.id='dialog';dialog.append(container);
 const instance=mountCampusDetails({container,campus:campuses.find(item=>item.id===id),countryName:()=>({fr:'France',en:'France',ar:'فرنسا'}[options.locale||'fr']),now:fixedNow,...options});
 return {root:instance.element,dialog,...instance};
}
function markerFixture(id,{preview=true,locale='fr',profile={}}={}){
 const campus={...campuses.find(item=>item.id===id),profile},doc=documentFixture();
 const overlay=doc.createElement('div'),details=doc.createElement('div'),markers=new Map();
 const allCampuses=campuses.map(item=>item.id===id?campus:item);
 const ctx=vm.createContext({locale,document:doc,markers,scope:{level:'campus',country:campus.country,campus:id,...(preview?{previewCampus:id}:{})},
  campusById:new Map(allCampuses.map(item=>[item.id,item])),countries:new Map([[campus.country,{members:[campus]}]]),
  mountCampusDetails:options=>mountCampusDetails({...options,now:fixedNow}),previewEntries:[],countryName:()=>campus.country,
  dialog:{close(){}},campusMap:{close(){}},navigate(){throw new Error('Practical campus details do not route to sample content');},
  openDialog(_title,render){details.children=[];render(details);},
  createCampusDirection:()=>({isOffscreen:()=>false,destroy(){}}),maplibregl:{LngLat:{convert:value=>value}},map:{getCanvasContainer:()=>overlay},
  renderMarkers(){},markersDirty:false,flight:false,worldPreparing:false,
  container:{focus(){throw new Error('The campus information view owns focus');}},
 });
 vm.runInContext('options={'+callback+'};'+markersCode,ctx);ctx.syncMarkers();
 return {ctx,open(){markers.get(id).button.dispatchEvent(new Event('click'));return details.children[0];}};
}

test('Explorer and content-map marker clicks keep the selected official website language',()=>{
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
 const {root}=directFixture('luanda',{locale:'en'});
 assert.ok(byClass(root,'campus-details-link-note').some(note=>note.textContent==='Select English from the website’s language menu.'));
 assert.equal(officialLink(directFixture('1337-khouribga',{locale:'ar'}).root).href,'https://www.1337.ma/ar/');
});

test('missing campus facts remain explicit and never become fictional photos, dates or student counts',()=>{
 const {root}=directFixture('tirana',{entries:[{campus:'tirana',section:'projects',id:'sample'}]});
 assert.equal(byClass(root,'campus-details-related').length,0);
 assert.equal(byClass(root,'campus-details-card').length,0);
 assert.equal(descendants(root).filter(node=>node.tagName==='img').length,0);
 assert.match(textOf(byClass(root,'campus-details-photos')[0]),/Photos non renseignées/);
 assert.match(textOf(byClass(root,'campus-details-contacts')[0]),/Non renseigné/);
 assert.equal(byClass(root,'campus-details-opening-date')[0].textContent,'Non renseigné');
 assert.deepEqual(byClass(root,'campus-details-stat-value').map(node=>node.textContent),['—','—','—']);
 assert.match(textOf(byClass(root,'campus-details-piscines')[0]),/Dates à consulter sur le site officiel/);
 assert.equal(descendants(root).find(node=>node.tagName==='address').textContent,campuses.find(c=>c.id==='tirana').address);
});

test('directions use the official address and campus name, not approximate coordinates',()=>{
 const campus=campuses.find(item=>item.id==='paris'),{root}=directFixture();
 const link=byClass(root,'campus-details-directions')[0],url=new URL(link.href);
 assert.equal(url.origin,'https://www.google.com');assert.equal(url.pathname,'/maps/dir/');assert.equal(url.searchParams.get('api'),'1');
 assert.equal(url.searchParams.get('destination'),campus.name+', '+campus.address.replace(/\s+/g,' '));
 assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');
});

test('campus name remains the fallback until an official logo loads and returns on failure',()=>{
 const {root}=directFixture('paris',{profile:{logo:{src:'./assets/campuses/paris-logo.svg'}}});
 const name=byClass(root,'campus-details-name')[0],logo=byClass(root,'campus-details-logo-image')[0];
 assert.equal(name.textContent,'42 Paris');assert.notEqual(name.hidden,true);assert.equal(logo.hidden,true);
 logo.naturalWidth=300;logo.dispatchEvent(new Event('load'));
 assert.equal(name.hidden,true);assert.equal(logo.hidden,false);assert.equal(logo.alt,'42 Paris');
 logo.dispatchEvent(new Event('error'));assert.equal(name.hidden,false);assert.equal(logo.hidden,true);
 for(const profile of [{},{logo:{src:'javascript:alert(1)'}}]){
  const fallback=directFixture('paris',{profile}).root;
  assert.equal(byClass(fallback,'campus-details-logo-image').length,0);
  assert.notEqual(byClass(fallback,'campus-details-name')[0].hidden,true);
 }
});

test('verified photo assets keep localized alternative text, credits and sources with keyboard-operable navigation',()=>{
 const profile={photos:[
  {src:'./assets/first.jpg',alt:{fr:'Vue du lieu',en:'Campus view',ar:'منظر الفرع'},credit:'Campus · source officielle',sourceUrl:'https://campus.example/photos'},
  {src:'https://campus.example/second.jpg',alt:{fr:'Salle de travail',en:'Working space',ar:'قاعة العمل'},credit:'Campus'},
  {src:'javascript:alert(1)',alt:'Unsafe'},
 ]};
 const {root}=directFixture('paris',{locale:'en',profile}),figures=byClass(root,'campus-details-photo'),images=byClass(root,'campus-details-photo-image');
 assert.equal(images.length,2);assert.equal(images[0].src,'https://horizon.example/welcome/assets/first.jpg');
 assert.equal(images[0].alt,'Campus view');assert.equal(images[1].alt,'Working space');
 assert.match(textOf(figures[0]),/Campus · source officielle/);
 assert.equal(byClass(figures[0],'campus-details-source')[0].href,'https://campus.example/photos');
 assert.deepEqual(figures.map(figure=>figure.hidden),[false,true]);
 const next=byClass(root,'campus-details-photo-next')[0],previous=byClass(root,'campus-details-photo-prev')[0];
 assert.equal(next.getAttribute('aria-label'),'Next photo');next.dispatchEvent(new Event('click'));
 assert.deepEqual(figures.map(figure=>figure.hidden),[true,false]);assert.equal(byClass(root,'campus-details-photo-status')[0].textContent,'2 / 2');
 previous.dispatchEvent(new Event('click'));assert.deepEqual(figures.map(figure=>figure.hidden),[false,true]);
});

test('contact labels are translated and unsafe contact links stay plain text',()=>{
 const profile={contacts:[
  {label:{fr:'Admissions',en:'Admissions',ar:'القبول'},value:'apply@campus.example',href:'mailto:apply@campus.example'},
  {label:'Accueil',value:'+33 1 23 45 67 89',href:'tel:+33123456789'},
  {label:'Unsafe',value:'Visible text',href:'javascript:alert(1)'},
 ]};
 const {root}=directFixture('paris',{locale:'ar',profile}),values=byClass(root,'campus-details-contact-value');
 assert.equal(byClass(root,'campus-details-contact-label')[0].textContent,'القبول');
 assert.equal(values[0].href,'mailto:apply@campus.example');assert.equal(values[1].href,'tel:+33123456789');
 assert.equal(values[2].tagName,'span');assert.equal(values[2].textContent,'Visible text');
});

test('year-only opening information never acquires a month or day',()=>{
 const {root}=directFixture('paris',{profile:{openedOn:'2013',openedLabel:'2013',openedSourceUrl:'https://campus.example/history',verifiedAt:'2026-10-05'}});
 const opening=byClass(root,'campus-details-opening')[0],time=descendants(opening).find(node=>node.tagName==='time');
 assert.equal(time.textContent,'2013');assert.equal(time.dateTime,'2013');
 assert.equal(byClass(opening,'campus-details-source')[0].href,'https://campus.example/history');
 assert.match(textOf(byClass(root,'campus-details-verified')[0]),/5 octobre 2026/);
});

test('finished Piscines disappear, an ongoing final day remains, and invalid or unspecified days are not invented',()=>{
 const profile={piscines:[
  {label:'Finished',startsOn:'2026-09-01',endsOn:'2026-10-04'},
  {label:'Ongoing',startsOn:'2026-10-01',endsOn:'2026-10-05',sourceUrl:'https://campus.example/piscine'},
  {label:'Later',startsOn:'2027-03-01',endsOn:'2027-03-26'},
  {label:'Sooner',startsOn:'2027-01-25',endsOn:'2027-02-19'},
  {label:'Invalid date',startsOn:'2027-02-30'},
  {label:'Month only',startsOn:'2027-07'},
  {label:'Wrong order',startsOn:'2027-04-10',endsOn:'2027-04-01'},
 ],piscinesNote:{fr:'Sessions estivales : jours à confirmer.'},piscineSourceUrl:'https://campus.example/admissions'};
 const {root}=directFixture('paris',{profile,now:new Date('2026-10-05T23:59:59Z')});
 assert.deepEqual(byClass(root,'campus-details-piscine-label').map(node=>node.textContent),['Ongoing','Sooner','Later']);
 assert.equal(byClass(root,'campus-details-piscine-state')[0].textContent,'En cours');
 assert.equal(byClass(root,'campus-details-piscine-note')[0].textContent,'Sessions estivales : jours à confirmer.');
 const tomorrow=directFixture('paris',{profile,now:new Date('2026-10-06T00:00:00Z')}).root;
 assert.deepEqual(byClass(tomorrow,'campus-details-piscine-label').map(node=>node.textContent),['Sooner','Later']);
 assert.equal(byClass(root,'campus-details-dates-link')[0].href,'https://campus.example/admissions');
});

test('when all Piscines have ended, the official schedule link replaces stale dates',()=>{
 const {root}=directFixture('paris',{profile:{piscines:[{startsOn:'2026-09-01',endsOn:'2026-09-30'}]}});
 assert.equal(byClass(root,'campus-details-piscine-list').length,0);
 assert.match(textOf(byClass(root,'campus-details-piscines')[0]),/Dates à consulter/);
 assert.equal(byClass(root,'campus-details-dates-link')[0].href,'https://42.fr/');
});

test('statistics use only supplied values, keep a real zero and attach dates and sources to the right measure',()=>{
 const {root}=directFixture('paris',{profile:{stats:{
  students:{value:1200,asOf:'2026-09',sourceUrl:'https://campus.example/students'},
  cohorts:{value:0,asOf:'2026-10-05',sourceUrl:'https://campus.example/cohorts'},
  alumni:{value:null},
 }}});
 const values=byClass(root,'campus-details-stat-value');
 assert.equal(values[0].textContent,new Intl.NumberFormat('fr').format(1200));assert.equal(values[1].textContent,'0');assert.equal(values[2].textContent,'—');
 const stats=byClass(root,'campus-details-stat');assert.equal(byClass(stats[0],'campus-details-source')[0].href,'https://campus.example/students');
 assert.match(textOf(byClass(stats[0],'campus-details-stat-date')[0]),/septembre 2026/);
 assert.equal(byClass(stats[2],'campus-details-source').length,0);
});

test('practical headings remain localized in French, English and Arabic',()=>{
 for(const [locale,photos,stats] of [
  ['fr','Photos','Le campus en chiffres'],
  ['en','Photos','Campus in figures'],
  ['ar','الصور','الفرع بالأرقام'],
 ]){
  const {root}=directFixture('paris',{locale});
  assert.equal(root.lang,locale);assert.equal(root.dir,locale==='ar'?'rtl':'ltr');
  assert.equal(byClass(root,'campus-details-photos')[0].children[0].textContent,photos);
  assert.equal(byClass(root,'campus-details-stats')[0].children[0].textContent,stats);
 }
});

test('address copying announces success and preserves the official address',async()=>{
 const written=[],{root}=directFixture('paris',{clipboard:{async writeText(value){written.push(value);}}});
 const button=byClass(root,'campus-details-copy')[0],status=byClass(root,'campus-details-copy-status')[0];
 button.dispatchEvent(new Event('click'));await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(written,[campuses.find(campus=>campus.id==='paris').address]);assert.equal(status.textContent,'Adresse copiée.');assert.equal(status.getAttribute('role'),'status');assert.equal(button.disabled,false);
});

test('clipboard denial and missing clipboard give manual-copy instructions instead of false success',async()=>{
 for(const options of [{clipboard:undefined},{onCopyAddress:async()=>{throw new Error('Not allowed');}}]){
  const {root}=directFixture('paris',options),button=byClass(root,'campus-details-copy')[0],status=byClass(root,'campus-details-copy-status')[0];
  button.dispatchEvent(new Event('click'));await new Promise(resolve=>setImmediate(resolve));
  assert.match(status.textContent,/Sélectionnez l’adresse/);assert.doesNotMatch(status.textContent,/Adresse copiée/);assert.equal(button.disabled,false);
 }
});

test('a destroyed campus component cannot announce a late clipboard result',async()=>{
 let finish,written;const {root,destroy}=directFixture('paris',{onCopyAddress:value=>{written=value;return new Promise(resolve=>{finish=resolve;});}});
 const button=byClass(root,'campus-details-copy')[0],status=byClass(root,'campus-details-copy-status')[0];
 button.dispatchEvent(new Event('click'));assert.equal(button.disabled,true);assert.equal(written,campuses.find(campus=>campus.id==='paris').address);
 destroy();finish();await new Promise(resolve=>setImmediate(resolve));assert.equal(status.textContent,'');
});


test('the active welcome callback renders the sourced Paris profile and dates its published statistic',()=>{
 for(const locale of ['fr','en','ar']){
  const root=markerFixture('paris',{locale,profile:realProfiles.paris}).open();
  const images=byClass(root,'campus-details-photo-image');assert.equal(images.length,2);
  assert.equal(images[0].alt,realProfiles.paris.photos[0].alt[locale]);
  for(const photo of realProfiles.paris.photos)assert.ok(readFileSync(new URL(photo.src,import.meta.url)).length>0);
  assert.equal(textOf(byClass(root,'campus-details-opening-date')[0]).trim(),'2013');
  assert.equal(byClass(root,'campus-details-contact-value').length,3);
  assert.equal(byClass(root,'campus-details-contact-value')[0].href,'mailto:apply@42paris.fr');
  const contacts=byClass(root,'campus-details-contacts')[0];
  assert.equal(byClass(contacts,'campus-details-source')[0].href,realProfiles.paris.contactSourceUrl);
  assert.equal(byClass(root,'campus-details-piscine-dates').length,2);
  assert.deepEqual(byClass(root,'campus-details-piscine-dates').flatMap(dates=>descendants(dates).filter(node=>node.tagName==='time').map(node=>node.dateTime)),['2027-01-25','2027-02-19','2027-03-01','2027-03-26']);
  assert.deepEqual(byClass(root,'campus-details-stat-value').map(node=>node.textContent),['5 000+','—','—']);
  assert.equal(descendants(byClass(root,'campus-details-stat-date')[0]).find(node=>node.tagName==='time').dateTime,'2025');
  assert.equal(byClass(root,'campus-details-piscine-note')[0].textContent,realProfiles.paris.piscinesNote[locale]);
 }
});

test('Mulhouse preserves the opening month, the historical student count and an undated future schedule',()=>{
 const {root}=directFixture('mulhouse',{profile:realProfiles.mulhouse,now:new Date('2026-10-08T12:00:00Z')});
 assert.equal(byClass(root,'campus-details-photo-image').length,4);
 for(const photo of realProfiles.mulhouse.photos)assert.ok(readFileSync(new URL(photo.src,import.meta.url)).length>0);
 assert.equal(descendants(byClass(root,'campus-details-opening')[0]).find(node=>node.tagName==='time').dateTime,'2021-11');
 assert.deepEqual(byClass(root,'campus-details-stat-value').map(node=>node.textContent),['413','—','—']);
 assert.equal(descendants(byClass(root,'campus-details-stat-date')[0]).find(node=>node.tagName==='time').dateTime,'2024');
 assert.equal(byClass(root,'campus-details-piscine-list').length,0);
 assert.match(byClass(root,'campus-details-piscine-note')[0].textContent,/terminées/);
 assert.equal(byClass(root,'campus-details-contact-value').length,4);
});
