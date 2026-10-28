import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {mountCampusDetails} from './campus-details.mjs';
import {mountExplorerCampus} from './explorer-campus.mjs';

const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const network=JSON.parse(read('./campuses.json'));
const sites=JSON.parse(read('./campus-websites.json')).campuses;
const locales=JSON.parse(read('./campus-website-locales.json')).campuses;
const campuses=network.campuses.map(campus=>({...campus,
 ...(sites[campus.id]?.kind==='campus-site'?{websiteUrl:sites[campus.id].url}:{}),
 websiteLocales:locales[campus.id]}));
// Version B: the Explorer's campus screen is halo's sheet (renderCampus → mountExplorerCampus), and the content
// pages' buttons open that campus in Explorer (exploreCampus). Both are taken from the active controller; A's
// campus-details.mjs keeps its own direct tests.
const welcomeSource=read('./welcome.mjs');
const welcomeFunction=name=>{const start=welcomeSource.indexOf('function '+name+'(');assert.ok(start>=0,name);const line=welcomeSource.slice(start).split('\n')[0];return line.endsWith('}')?line:welcomeSource.slice(start).match(/^function [^]*?\n}/)[0];};
const fixedNow=new Date('2026-10-05T12:00:00Z');
const realProfiles=JSON.parse(read('./campus-profiles.json')).campuses;

// The required DOM contract of SPEC-B-HALO §7.4 (D13), shared with the sheet's own fake: Elements only in
// append (text always goes through textContent), closest with a single tag name or a single .class, the
// properties written as plain fields; the optional APIs are absent, so both sheets must work without them.
class Element extends EventTarget {
 constructor(tagName,ownerDocument){super();this.tagName=tagName;this.ownerDocument=ownerDocument;this.children=[];this.attributes={};this.dataset={};}
 append(...children){for(const child of children){if(!(child instanceof Element))throw new TypeError('append() takes Elements only');child.parentElement=this;this.children.push(child);}}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 closest(selector){const name=selector.startsWith('.')?selector.slice(1):null;let node=this;while(node){if(name?String(node.className||'').split(/\s+/).includes(name):node.tagName===selector)return node;node=node.parentElement;}return null;}
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
// welcome.mjs's art object as a fake (§9.1 D): no silhouette, no printed logo, no icon; every text stays.
const fakeArt=()=>({shapes:null,ensureArtDefs(){},createSilhouette:()=>null,createDots:()=>null,createPrintedLogo:()=>null,
 fitLogo:(print,width,height)=>({width,height}),icon:()=>null,flagHref:()=>null,logo:()=>null});
function explorerFixture(profile={}){
 const doc=documentFixture(),body=doc.createElement('div'),navigations=[],mounts=[],history={state:{cp:true,scroll:120}};
 const enriched=campuses.map(item=>({...item,profile:item.id==='paris'?profile:realProfiles[item.id]||{}}));
 const ctx=vm.createContext({campusById:new Map(enriched.map(item=>[item.id,item])),countryById:new Map(network.countries.map(country=>[country.id,country])),
  countryName:id=>id==='FRA'?'France':id,explorerArt:fakeArt(),
  mountExplorerCampus:options=>{mounts.push(options);return mountExplorerCampus({...options,now:fixedNow});},
  history:{get state(){return history.state;},replaceState(state){history.state=state;}},location:{href:'http://test/#projects/minishell'},
  navigate:next=>navigations.push(JSON.parse(JSON.stringify(next))),explorerMemory:{geographyKey:'world:',list:'countries'},
 });
 vm.runInContext(welcomeFunction('renderCampus')+'\n'+welcomeFunction('exploreCampus'),ctx);
 return {ctx,body,navigations,mounts,history,render(locale){return ctx.renderCampus(body,'paris',locale,{headingId:'explorer-campus-title-3'});}};
}

test('the Explorer campus screen keeps the selected official website language, and content buttons open it',()=>{
 const fixture=explorerFixture();
 for(const [locale,url,hreflang] of [['fr','https://42.fr/','fr'],['en','https://42.fr/en/homepage/','en'],['ar','https://42.fr/en/homepage/','en'],['fr','https://42.fr/','fr']]){
  const view=fixture.render(locale),root=view.element,destination=byClass(root,'explorer-sheet-cta')[0];
  assert.equal(root.lang,locale);assert.equal(root.dir,locale==='ar'?'rtl':'ltr');
  assert.equal(destination.href,url);assert.equal(destination.hreflang,hreflang);
  // The selector labels its campus section with this heading and focuses it.
  assert.equal(view.heading.id,'explorer-campus-title-3');assert.equal(view.heading.tagName,'h2');assert.equal(view.heading.tabIndex,-1);
  assert.equal(fixture.body.children[0],root);assert.equal(root.closest('dialog'),null,'mounted in the screen, not in a dialog');
  assert.equal(destination.closest('.explorer-sheet'),root);
  view.destroy();assert.equal(fixture.body.children.length,0);
 }
 // renderCampus hands the sheet the shared art object and the campus's country (§7.3).
 const options=fixture.mounts.at(-1);
 assert.equal(options.art,fixture.ctx.explorerArt);assert.equal(options.locale,'fr');assert.equal(options.headingId,'explorer-campus-title-3');
 assert.deepEqual({...options.country},{id:'FRA',iso2:'FR',name:'France',shape:null,flagHref:null});
 assert.equal(fixture.ctx.renderCampus(fixture.body,'nowhere','fr'),null);
 // "Explorer {campus}" navigates to that campus; Back will find the button again through returnFocus.
 fixture.ctx.exploreCampus('paris');
 assert.deepEqual(fixture.navigations,[{section:'explore',entryId:null,continent:null,country:'FRA',campus:'paris',query:'',page:1}]);
 assert.equal(fixture.history.state.returnFocus,'campus');assert.equal(fixture.history.state.scroll,120);assert.equal(fixture.ctx.explorerMemory,null);
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


test('the Explorer campus screen renders the sourced Paris profile and dates its published statistic',()=>{
 const missing={fr:'Pas encore renseignés ici : promotions et alumni.',en:'Not provided here yet: cohorts and alumni.',ar:'لم تُضف هنا بعد: الدفعات والخريجون.'};
 for(const locale of ['fr','en','ar']){
  const root=explorerFixture(realProfiles.paris).render(locale).element;
  const images=byClass(root,'explorer-sheet-photo-image');assert.equal(images.length,2);
  assert.equal(images[0].alt,realProfiles.paris.photos[0].alt[locale]);
  for(const photo of realProfiles.paris.photos)assert.ok(readFileSync(new URL(photo.src,import.meta.url)).length>0);
  const fact=key=>byClass(root,'explorer-sheet-fact').find(node=>node.dataset.key===key);
  const opening=descendants(fact('opening')).find(node=>node.tagName==='time');
  assert.equal(opening.textContent,'2013');assert.equal(opening.dateTime,'2013');
  assert.equal(byClass(root,'explorer-sheet-contact-value').length,3);
  assert.equal(byClass(root,'explorer-sheet-contact-value')[0].href,'mailto:apply@42paris.fr');
  const contacts=byClass(root,'explorer-sheet-contacts')[0];
  assert.equal(descendants(byClass(contacts,'explorer-sheet-source')[0]).find(node=>node.tagName==='a').href,realProfiles.paris.contactSourceUrl);
  assert.deepEqual(byClass(root,'explorer-sheet-piscine').map(row=>[row.dataset.startsOn,row.dataset.endsOn]),[['2027-01-25','2027-02-19'],['2027-03-01','2027-03-26']]);
  // The only published figure keeps its text and its date; the absent ones are said once, in the missing line.
  assert.deepEqual(byClass(root,'explorer-sheet-fact').map(node=>node.dataset.key),['opening','students']);
  const students=descendants(fact('students')).find(node=>node.tagName==='dd').children[0];
  assert.equal(students.textContent,'5 000+');assert.equal(students.dir,'ltr');
  assert.equal(descendants(byClass(fact('students'),'explorer-sheet-asof')[0]).find(node=>node.tagName==='time').dateTime,'2025');
  assert.equal(byClass(byClass(root,'explorer-sheet-piscines')[0],'explorer-sheet-note').at(-1).textContent,realProfiles.paris.piscinesNote[locale]);
  assert.equal(textOf(byClass(root,'explorer-sheet-missing')[0]).trim(),missing[locale]);
 }
});

test('outside a dialog no campus sheet is mounted, and destroy still releases the media viewer',()=>{
 const doc=documentFixture(),panel=doc.createElement('section'),container=doc.createElement('div');panel.append(container);
 let closed=0;
 const instance=mountCampusDetails({container,campus:campuses.find(item=>item.id==='paris'),countryName:()=>'France',profile:realProfiles.paris,now:fixedNow,onOpenMedia:()=>({close(){closed++;}})});
 assert.equal(container.children[0],instance.element);assert.equal(instance.element.closest('dialog'),null);
 assert.equal(panel.dataset.expanded,undefined,'no sheet state outside a dialog');assert.equal(instance.element.dataset.expanded,'false');
 byClass(instance.element,'campus-details-photo-open')[0].dispatchEvent(new Event('click'));
 instance.destroy();assert.equal(closed,1);assert.equal(container.children.length,0);
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
