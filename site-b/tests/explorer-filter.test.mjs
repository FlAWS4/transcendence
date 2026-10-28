import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {matchesContentScope} from '../content-geography.mjs';
import {continentIds,continentOfCountry,continentName} from '../continents.mjs';
import {countLabel,buildExplorerView} from '../explorer-model.mjs';
import {createRandomCampusCandidate} from '../random-campus.mjs';
import {normalizeContentPage} from '../content-pagination.mjs';
import {normalizeProfileSection,normalizeProfileProjectFilters} from '../profile-sections.mjs';
import {normalizeProjectSection} from '../project-ui.mjs';
import {normalizeJournalSection} from '../journal-ui.mjs';
import {previewEntries} from '../content-preview-data.mjs';
import {createDiscoveryEntries,profileById,legacyProfileRoutes} from '../profile-data.mjs';
import {createExplorerBand} from '../explorer-band.mjs';
import {SHAPES} from '../explorer-shapes.mjs';

// Version B's controller, evaluated from welcome.mjs as version A's filter test evaluates it:
// the Explorer filter and its history, the catalogue preparation and the dice.
const source=readFileSync(new URL('../welcome.mjs',import.meta.url),'utf8');
const read=name=>JSON.parse(readFileSync(new URL('../'+name,import.meta.url),'utf8'));
const files={'./campuses.json':read('campuses.json'),'./campus-websites.json?v=1':read('campus-websites.json'),'./campus-website-locales.json?v=1':read('campus-website-locales.json'),'./campus-profiles.json?v=2':read('campus-profiles.json'),'./campus-logos.json?v=b3':read('campus-logos.json')};
// The shared art object of the selector and the sheet (SPEC-B-HALO §7.5): welcome.mjs's own line, evaluated with stubs
// for its six imports from explorer-art.mjs; its flagHref and logo read the catalogue lazily.
const artSource=source.match(/^const explorerArt=\{[^\n]+\};$/m)[0].replace(/^const /,'');
const artStubs={ensureArtDefs(){},createSilhouette:()=>null,createDots:()=>null,createPrintedLogo:()=>null,fitLogo:(print,width,height)=>({width,height}),artIcon:()=>null};
const entries=createDiscoveryEntries(previewEntries);
// Objects built inside the vm belong to its realm: compare their JSON form.
const plain=value=>JSON.parse(JSON.stringify(value));
function functionSource(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0,'Active function '+name+' must exist');const line=source.slice(start).split('\n')[0];return line.endsWith('}')?line:source.slice(start).match(/^function [^]*?\n}/)[0];}
const constant=name=>source.match(new RegExp('^const '+name+' = [^\\n]+$','m'))[0];
const copySource=[source.match(/^const copy = \{[^]*?\n\};$/m)[0],...source.match(/^Object\.assign\(copy\.(?:fr|en|ar), \{[^]*?\n\}\);$/gm)].join('\n');
const handler=id=>source.match(new RegExp("^byId\\('"+id+"'\\)\\.addEventListener\\('click',(\\(\\)=>\\{[^\\n]*\\})\\);$",'m'))[1];
const diceHandler=source.match(/^byId\('random-campus'\)\.addEventListener\('click',(\(\)=>\{[^]*?\n\})\);$/m)[1];
const FUNCTIONS=['readRoute','routeURL','geographicScope','setContentScope','selectScope','syncScope','syncExplorer','validateExplorer','ascendScope','resetScope','loadNetworkData','prepareExplorer','contentCandidates','contentLocationAnnouncement','updateScope'];

function harness({hash='#explore',section,state={cp:true,scroll:0},entryOpen=true,respond={},shapes='ok'}={}){
 let clock=0,nextTimer=0,network=null;
 const timers=new Map(),nodes=new Map(),calls=[],shows=[],announcements=[],traces=[],renders=[],requests=[],cursors=[],atNetwork=[],fits=[];
 const document={activeElement:null,body:{dataset:{entry:'welcome'}}};
 const byId=id=>{
  if(!nodes.has(id))nodes.set(id,{id,disabled:true,hidden:false,textContent:'',title:'',dataset:{},attributes:{},setAttribute(name,value){this.attributes[name]=String(value);},getAttribute(name){return this.attributes[name]??null;},removeAttribute(name){delete this.attributes[name];},focus(){document.activeElement=this;}});
  return nodes.get(id);
 };
 // As in both pages' markup: « Le monde se prépare… » describes the region until it is ready.
 byId('explorer').setAttribute('aria-describedby','loading');
 const clone=value=>value==null?null:structuredClone(value);
 const entriesOfHistory=[{state:clone(state),url:hash}];let index=0;
 const toHash=url=>String(url).replace(/^http:\/\/test\//,'');
 const history={
  get state(){return entriesOfHistory[index].state;},
  pushState(next,_,url){entriesOfHistory.splice(index+1);entriesOfHistory.push({state:clone(next),url:toHash(url)});index++;calls.push(['push',toHash(url)]);},
  replaceState(next,_,url){entriesOfHistory[index]={state:clone(next),url:url===undefined?entriesOfHistory[index].url:toHash(url)};calls.push(['replace',entriesOfHistory[index].url]);},
  go(steps){index+=steps;},
 };
 const location={get hash(){return entriesOfHistory[index].url;},get href(){return 'http://test/'+entriesOfHistory[index].url;}};
 // Each file answers from the repository unless the test overrides it; a stalled request ends only on abort.
 const json=(url,{signal}={})=>{
  requests.push(url);const answer=respond[url]??'ok';
  if(answer==='stall')return new Promise((_,reject)=>signal?.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
  if(answer==='fail')return Promise.reject(new Error('unavailable '+url));
  return Promise.resolve(structuredClone(files[url]));
 };
 // welcome.mjs's loadExplorerShapes, faked (the vm has no import()): the real SHAPES, null for a failed import, or a
 // stalled import that resolves null when the catalogue's abort fires, as the real one does.
 const loadExplorerShapes=({signal}={})=>{
  if(shapes==='stall')return new Promise(resolve=>signal?.addEventListener('abort',()=>resolve(null),{once:true}));
  return Promise.resolve(shapes==='fail'?null:SHAPES);
 };
 const sandbox={
  URLSearchParams,AbortController,structuredClone,Intl,
  matchesContentScope,continentIds,continentOfCountry,continentName,countLabel,buildExplorerView,
  createRandomCampusCandidate:list=>createRandomCampusCandidate(list,{random:()=>.5}),
  normalizeContentPage,normalizeProfileSection,normalizeProfileProjectFilters,normalizeProjectSection,normalizeJournalSection,
  profileById,legacyProfileRoutes,discoveryEntries:entries,sections:['explore','projects','people','journal','awards'],defaultSection:'explore',
  contentPreferences:{snapshot:()=>({})},sortContentEntries:list=>list,applyContentCategory:list=>list,
  locale:'fr',section:section??hash.slice(1).split(/[/?]/)[0],entryOpen,scope:{level:'world',continent:null,country:null,campus:null},
  networkData:null,campuses:[],countries:[],campusById:new Map(),countryById:new Map(),searchCatalog:{campuses:[],countries:[]},
  loadFailed:false,preparation:null,preloadTrace:{attempts:0},explorerView:null,randomCampus:null,listPagination:null,
  regionNames:new Intl.DisplayNames('fr',{type:'region'}),dataControls:['scope-picker','scope-world','scope-country','reset'],
  byId,document,history,location,json,loadExplorerShapes,...artStubs,requestAnimationFrame:callback=>callback(),window:{scrollTo(){}},performance:{now:()=>clock},
  setTimeout:(callback,delay)=>{timers.set(++nextTimer,{callback,at:clock+delay});return nextTimer;},clearTimeout:id=>timers.delete(id),
  app:{dataset:{}},scopePopover:null,explorerBand:{measure(){}},scopePill:{fit(){fits.push({locale:sandbox.locale,network:Boolean(network)});}},dockSearch:{refresh(){},suspendDocumentScroll(){return ()=>{};}},
  // The selector: show() records the shapes the view was built with; setCursor answers as the real one (true when
  // the current level holds the id), without a new view.
  explorer:{show(view,options){shows.push({view,options,shapes:sandbox.explorerArt.shapes});},focus(){},localize(){},
   setCursor(id,options){cursors.push(id);const view=shows.at(-1)?.view;return Boolean(view&&view.level!=='campus'&&view.items.some(item=>item.id===id));}},
  trace(update){traces.push(update);},announce(text){announcements.push(text);},renderContent(options){renders.push(options);},rememberScroll(){},
  randomDiscovery:{pick(){throw new Error('content dice only');}},
 };
 // The shapes the catalogue's arrival sees: welcome.mjs sets them before network (§7.5).
 Object.defineProperty(sandbox,'network',{get:()=>network,set(next){atNetwork.push(sandbox.explorerArt.shapes);network=next;},enumerable:true,configurable:true});
 const context=vm.createContext(sandbox);
 context.app.dataset.section=context.section;
 vm.runInContext([artSource,copySource,constant('t'),constant('message'),constant('countryName'),constant('scopeName'),constant('scopeHint'),...FUNCTIONS.map(functionSource)].join('\n'),context);
 context.route=context.readRoute();
 const c=context;
 return {c,byId,calls,shows,announcements,traces,renders,requests,cursors,atNetwork,fits,
  pushes:()=>calls.filter(([kind])=>kind==='push').length,
  get view(){return shows.at(-1)?.view;},get options(){return shows.at(-1)?.options;},get url(){return location.hash;},get state(){return history.state;},
  // A browser history move: the restored entry is read again, as the popstate handler and applyRoute do.
  back(steps=1){history.go(-steps);c.route=c.readRoute();c.syncScope();},
  forward(steps=1){history.go(steps);c.route=c.readRoute();c.syncScope();},
  visit(url,nextSection){history.pushState({cp:true,scroll:0},'',url);c.section=nextSection;c.app.dataset.section=nextSection;c.route=c.readRoute();c.syncScope();},
  click(id){vm.runInContext('('+handler(id)+')',context)();},
  dice(){byId('random-campus').disabled=false;vm.runInContext('('+diceHandler+')',context)();},
  async advance(ms){clock+=ms;for(const [id,timer]of [...timers])if(timer.at<=clock&&timers.delete(id))timer.callback();for(let n=0;n<12;n++)await Promise.resolve();},
 };
}
async function ready(options){const h=harness(options);await h.c.prepareExplorer();return h;}

test('the catalogue and the campus sheet data load together, without any map, and the first view is shown',async()=>{
 const h=await ready();
 assert.deepEqual(h.requests,['./campuses.json','./campus-websites.json?v=1','./campus-website-locales.json?v=1','./campus-profiles.json?v=2','./campus-logos.json?v=b3']);
 assert.equal(h.c.campuses.length,58);assert.equal(h.c.countries.length,30);
 const paris=h.c.campusById.get('paris');
 assert.equal(paris.websiteUrl,'https://www.42.fr/');assert.equal(paris.websiteLocales.locales.en,'https://42.fr/en/homepage/');
 assert.equal(paris.profile.logo.src,'./assets/campuses/paris-logo-official.svg');assert.deepEqual(plain(h.c.campusById.get('tirana').profile),{});
 assert.equal('locationSource' in paris,false,'B has no location overrides');
 // Halo's printed logos come from the manifest: Paris is an ink mask, Codam the only colour sticker.
 assert.equal(paris.logo.print.kind,'mask');assert.equal(paris.logo.print.src,'assets/campus-logos/print/paris.png');
 assert.equal(h.c.campusById.get('codam').logo.print.kind,'sticker');
 assert.equal(h.c.explorerArt.logo('paris'),paris.logo.print);assert.equal(h.c.explorerArt.logo('nowhere'),null);
 assert.equal(h.c.explorerArt.flagHref('FRA'),'assets/flags/fr.svg');assert.equal(h.c.explorerArt.flagHref('PSE'),'assets/flags/ps.svg');assert.equal(h.c.explorerArt.flagHref('XXX'),null);
 // The silhouettes arrive with the catalogue, set before network: the first view is built with them.
 assert.equal(h.c.explorerArt.shapes,SHAPES);assert.equal(h.atNetwork.length,1);assert.equal(h.atNetwork[0],SHAPES);assert.equal(h.shows[0].shapes,SHAPES);
 for(const id of ['scope-picker','scope-world','scope-country','reset'])assert.equal(h.byId(id).disabled,false,id);
 assert.equal(h.byId('loading').hidden,true);assert.equal(h.traces.at(-1).phase,'ready');assert.equal(h.traces[0].phase,'loading');
 // Once ready, « Le monde se prépare… » no longer describes the region (H2f).
 assert.equal(h.byId('explorer').getAttribute('aria-describedby'),null);
 // Level 1 is the four continents only, the cursor on the first; no continent validated is the world filter.
 assert.equal(h.view.key,'continents');assert.deepEqual(h.view.items.map(item=>item.id),['africa','americas','asia','europe']);
 assert.equal(h.view.cursorId,'africa');assert.equal(h.options.direction,'none');assert.equal(h.c.scope.level,'world');
 assert.equal(h.pushes(),0);assert.deepEqual(plain(h.state),{cp:true,scroll:0},'the entry carries no Explorer list or path');
 // The first continent follows the locale's order: Asia in Arabic.
 const ar=harness();ar.c.locale='ar';ar.c.regionNames=new Intl.DisplayNames('ar',{type:'region'});await ar.c.prepareExplorer();
 assert.deepEqual(ar.view.items.map(item=>item.id),['asia','africa','americas','europe']);assert.equal(ar.view.cursorId,'asia');
});

test('the logo manifest and the silhouettes are optional: without them the catalogue still loads',async()=>{
 const h=await ready({respond:{'./campus-logos.json?v=b3':'fail'},shapes:'fail'});
 assert.equal(h.c.loadFailed,false);assert.equal(h.traces.at(-1).phase,'ready');assert.equal(h.c.campuses.length,58);
 assert.ok(h.c.campuses.every(campus=>campus.logo===null),'no manifest: lanterns and names only');assert.equal(h.c.explorerArt.logo('paris'),null);
 assert.equal(h.c.explorerArt.shapes,null,'a failed import: name-only items');assert.equal(h.shows[0].shapes,null);
 assert.equal(h.view.key,'continents');assert.equal(h.byId('explorer').getAttribute('aria-describedby'),null);
 // A stalled import gates the arrival until the catalogue's 20 s abort, then the view is built without shapes.
 const stalled=harness({shapes:'stall'});let done=false;const preparing=stalled.c.prepareExplorer().then(()=>{done=true;});
 await stalled.advance(19999);assert.equal(done,false);assert.equal(stalled.shows.length,0);
 await stalled.advance(1);await preparing;
 assert.equal(stalled.c.loadFailed,false);assert.equal(stalled.c.campuses.length,58);assert.equal(stalled.c.explorerArt.shapes,null);
 assert.equal(stalled.c.campusById.get('paris').logo.print.kind,'mask');assert.equal(stalled.view.key,'continents');
});

test('each validation adds exactly one entry; a continent applies its filter and opens its countries on the first',async()=>{
 const h=await ready();
 h.c.validateExplorer({kind:'continent',id:'europe'});
 assert.equal(h.pushes(),1);assert.equal(h.url,'#explore?continent=europe');assert.equal(h.c.scope.level,'continent');assert.equal(h.c.route.continent,'europe');
 assert.equal(h.view.key,'countries:europe');assert.equal(h.view.items.length,14);assert.equal(h.view.cursorId,'ALB');assert.equal(h.options.direction,'descend');
 assert.equal(h.announcements.at(-1),'Explorer · Europe');assert.deepEqual(plain(h.state),{cp:true,scroll:0});
 h.c.validateExplorer({kind:'country',id:'FRA'});
 assert.equal(h.pushes(),2);assert.equal(h.url,'#explore?country=FRA');assert.equal(h.c.route.continent,null);assert.deepEqual(plain(h.state),{cp:true,scroll:0});
 assert.equal(h.view.key,'campuses:FRA');assert.equal(h.view.cursorId,'angouleme');assert.equal(h.announcements.at(-1),'Explorer · France');
 h.c.validateExplorer({kind:'campus',id:'paris'});
 assert.equal(h.pushes(),3);assert.equal(h.url,'#explore?country=FRA&campus=paris');
 assert.equal(h.view.key,'campus:paris');assert.equal(h.view.siblings.length,8);
 // A sibling of the strip is a validated campus.
 h.c.validateExplorer({kind:'campus',id:'lyon'});
 assert.equal(h.pushes(),4);assert.equal(h.url,'#explore?country=FRA&campus=lyon');assert.equal(h.view.key,'campus:lyon');assert.deepEqual(plain(h.state),{cp:true,scroll:0});
 // Monde is no longer an item: a world validation, which no view can send any more, does nothing.
 const shows=h.shows.length,spoken=h.announcements.length;h.c.validateExplorer({kind:'world',id:'world'});
 assert.equal(h.pushes(),4);assert.equal(h.shows.length,shows);assert.equal(h.announcements.length,spoken);assert.equal(h.view.key,'campus:lyon');
});

test('ascending follows the continent path, one entry each, with the cursor on the level left',async()=>{
 const h=await ready();
 for(const step of [{kind:'continent',id:'europe'},{kind:'country',id:'FRA'},{kind:'campus',id:'paris'}])h.c.validateExplorer(step);
 for(const [url,key,cursor] of [['#explore?country=FRA','campuses:FRA','paris'],['#explore?continent=europe','countries:europe','FRA'],['#explore','continents','europe']]){
  const before=h.pushes();h.c.ascendScope();
  assert.equal(h.pushes(),before+1,key);assert.equal(h.url,url);assert.equal(h.view.key,key);assert.equal(h.view.cursorId,cursor);assert.equal(h.options.direction,'ascend');
 }
 // Level 1 again: the world filter, the cursor on the continent left; nothing above it.
 assert.equal(h.c.scope.level,'world');assert.equal(h.byId('globe-hint').textContent,'58 campus · 30 pays');assert.equal(h.view.items.length,4);
 const before=h.pushes();h.c.ascendScope();assert.equal(h.pushes(),before,'nothing above World');assert.equal(h.view.cursorId,'europe');
 assert.equal(h.pushes(),6);
});

test('reset goes back to World L1 with the cursor on the first continent; on World it only moves the cursor there, without history',async()=>{
 const h=await ready();
 h.c.validateExplorer({kind:'continent',id:'europe'});h.c.resetScope();
 assert.equal(h.pushes(),2);assert.equal(h.url,'#explore');assert.equal(h.c.scope.level,'world');assert.equal(h.view.key,'continents');
 assert.equal(h.view.cursorId,'africa','the first continent, not the one left');assert.equal(h.options.direction,'ascend');
 assert.equal(h.byId('globe-hint').textContent,'58 campus · 30 pays');assert.deepEqual(h.cursors,[]);
 // Only the cursor is elsewhere: the selector's public setCursor moves it back to the first continent, with no new view (H2f).
 const shows=h.shows.length,calls=h.calls.length;h.c.resetScope();
 assert.equal(h.calls.length,calls,'no history call');assert.equal(h.shows.length,shows,'no show()');
 assert.deepEqual(h.cursors,['africa']);
 assert.equal(h.view.items.length,4);assert.equal(h.view.key,'continents');
 h.c.validateExplorer({kind:'campus',id:'tokyo'});h.c.resetScope();
 assert.equal(h.url,'#explore');assert.equal(h.c.scope.level,'world');assert.equal(h.view.key,'continents');assert.equal(h.view.cursorId,'africa');
 // The World crumb resets the same way; in Arabic the first continent of the order is Asia.
 const ar=await ready();ar.c.locale='ar';ar.c.regionNames=new Intl.DisplayNames('ar',{type:'region'});
 ar.c.validateExplorer({kind:'continent',id:'europe'});ar.click('scope-world');
 assert.equal(ar.url,'#explore');assert.equal(ar.view.key,'continents');assert.equal(ar.view.cursorId,'asia');
 ar.c.resetScope();assert.deepEqual(ar.cursors,['asia']);
});

test('on content pages ← keeps version A’s rule, while Explorer ascends through the continent',async()=>{
 const h=await ready({hash:'#projects'});
 h.c.selectScope({campus:'paris'});h.click('scope-back');assert.equal(h.url,'#projects?country=FRA');
 h.click('scope-back');assert.equal(h.url,'#projects','a country goes back to World, not to its continent');
 h.c.setContentScope(h.c.geographicScope({continent:'asia'}));assert.equal(h.url,'#projects?continent=asia');
 h.click('scope-back');assert.equal(h.url,'#projects');assert.equal(h.c.scope.level,'world');
 const explorer=await ready();
 explorer.c.selectScope({country:'JPN'});explorer.click('scope-back');assert.equal(explorer.url,'#explore?continent=asia');assert.equal(explorer.view.key,'countries:asia');
 explorer.c.selectScope({campus:'tokyo'});explorer.click('scope-country');assert.equal(explorer.url,'#explore?country=JPN');
 // From a continent's countries, ← returns to level 1: the world filter, the cursor on that continent, ← off.
 explorer.click('scope-back');assert.equal(explorer.url,'#explore?continent=asia');
 explorer.click('scope-back');assert.equal(explorer.url,'#explore');assert.equal(explorer.view.key,'continents');assert.equal(explorer.view.cursorId,'asia');
 assert.equal(explorer.c.scope.level,'world');assert.equal(explorer.byId('scope-back').disabled,true);
});

test('deep links and restored entries are normalised, and a continent survives the address round trip',async()=>{
 for(const [hash,url,level] of [['#explore?country=BRA&campus=paris','#explore?country=FRA&campus=paris','campus'],['#projects?continent=europe&country=FRA','#projects?country=FRA','country'],
  ['#explore?continent=oceania','#explore','world'],['#explore?continent=asia','#explore?continent=asia','continent'],['#journal?country=INVALID&campus=missing','#journal','world']]){
  const h=await ready({hash});assert.equal(h.url,url,hash);assert.equal(h.c.scope.level,level,hash);assert.equal(h.pushes(),0);
 }
 const h=await ready();h.c.validateExplorer({kind:'continent',id:'africa'});
 const fresh=await ready({hash:h.url});assert.equal(fresh.c.scope.level,'continent');assert.equal(fresh.c.scope.continent,'africa');assert.equal(fresh.view.key,'countries:africa');
 assert.equal(h.c.routeURL({section:'projects',continent:'europe',country:'FRA',campus:'paris',page:2}),'#projects?country=FRA&campus=paris&page=2');
 assert.equal(h.c.routeURL({section:'projects',continent:'europe',query:'c',page:2}),'#projects?continent=europe&q=c&page=2');
 assert.deepEqual(plain(h.c.geographicScope({continent:'asia',country:'FRA'})),{level:'country',continent:'europe',country:'FRA',campus:null});
 assert.deepEqual(plain(h.c.geographicScope({continent:'europe',campus:'istanbul'})),{level:'campus',continent:'asia',country:'TUR',campus:'istanbul'});
});

test('continent lists: Europe 44/42/42, Asia 25/20/20, Africa 10/9/11, Americas 9/7/5, World 78/78/78',async()=>{
 const h=await ready();
 const counts=()=>['projects','people','journal'].map(name=>{h.c.section=name;const total=h.c.contentCandidates().length;h.c.section='explore';return total;});
 assert.deepEqual(counts(),[78,78,78]);
 for(const [id,expected] of [['europe',[44,42,42]],['asia',[25,20,20]],['africa',[10,9,11]],['americas',[9,7,5]]]){
  h.c.resetScope();h.c.validateExplorer({kind:'continent',id});assert.deepEqual(counts(),expected,id);
 }
 h.c.ascendScope();assert.deepEqual(counts(),[78,78,78]);
});

test('before the entrance opens, the selector shows World whatever the address; the route applies after entry',async()=>{
 const h=harness({hash:'#explore?country=FRA&campus=paris',entryOpen:false});
 await h.c.loadNetworkData();assert.equal(h.shows.length,0);
 await h.c.prepareExplorer();
 assert.equal(h.view.key,'continents');assert.equal(h.view.cursorId,'africa');assert.equal(h.options.direction,'none');
 assert.equal(h.c.route.country,'FRA');assert.equal(h.c.route.campus,'paris');assert.equal(h.c.scope.level,'world');
 assert.equal(h.calls.length,0,'no history before entry');
 h.c.entryOpen=true;h.c.syncScope();
 assert.equal(h.view.key,'campus:paris');assert.equal(h.options.direction,'descend');assert.equal(h.pushes(),0);
 // Without a deep link, the entrance opens on level 1 with the cursor on the first continent.
 const plainEntry=harness({entryOpen:false});await plainEntry.c.prepareExplorer();plainEntry.c.entryOpen=true;plainEntry.c.syncScope();
 assert.equal(plainEntry.view.key,'continents');assert.equal(plainEntry.view.cursorId,'africa');assert.equal(plainEntry.c.scope.level,'world');assert.equal(plainEntry.calls.length,0);
});

test('catalogue failure, timeout, a late success and a retry',async()=>{
 const failing=harness({respond:{'./campuses.json':'fail'}});
 // Whatever its state, a failure describes the region by the error message again (H2f).
 failing.byId('explorer').removeAttribute('aria-describedby');
 await assert.rejects(failing.c.prepareExplorer(),/unavailable/);
 assert.equal(failing.c.loadFailed,true);assert.equal(failing.byId('loading').hidden,false);
 assert.equal(failing.byId('loading').textContent,'Les campus n’ont pas pu se charger. Recharge la page pour réessayer.');
 assert.equal(failing.byId('explorer').getAttribute('aria-describedby'),'loading');
 assert.equal(failing.shows.length,0,'#explorer stays empty');assert.equal(failing.c.randomCampus,null);assert.equal(failing.byId('scope-picker').disabled,true);
 assert.equal(failing.traces.at(-1).phase,'error');assert.equal(failing.c.preparation,null);assert.equal(failing.c.networkData,null);
 // A later catalogue success (here the next attempt) clears the error and renders.
 failing.c.json=(url,options)=>Promise.resolve(structuredClone(files[url]));
 await failing.c.loadNetworkData();
 assert.equal(failing.c.loadFailed,false);assert.equal(failing.byId('loading').hidden,true);assert.equal(failing.byId('loading').textContent,'Le monde se prépare…');
 assert.equal(failing.byId('explorer').getAttribute('aria-describedby'),null,'the late success no longer describes the region');
 assert.equal(failing.view.key,'continents');assert.notEqual(failing.c.randomCampus,null);
 await failing.c.prepareExplorer();assert.equal(failing.traces.at(-1).phase,'ready');
 const stalled=harness({respond:{'./campuses.json':'stall'}});
 let settled=false;const attempt=stalled.c.prepareExplorer().catch(error=>{settled=error;});
 await stalled.advance(19999);assert.equal(settled,false);
 await stalled.advance(1);await attempt;assert.match(settled.message,/aborted/);assert.equal(stalled.c.loadFailed,true);
 assert.equal(stalled.byId('explorer').getAttribute('aria-describedby'),'loading');
 stalled.c.json=url=>{stalled.requests.push(url);return Promise.resolve(structuredClone(files[url]));};
 await stalled.c.prepareExplorer();assert.equal(stalled.c.loadFailed,false);assert.equal(stalled.view.key,'continents');
 assert.equal(stalled.byId('explorer').getAttribute('aria-describedby'),null);
 assert.equal(stalled.requests.filter(url=>url==='./campuses.json').length,2,'the retry makes a fresh request');
 // The campus screen's side files are optional: a failure, or a stall until the timeout, keeps the catalogue.
 const partial=harness({respond:{'./campus-websites.json?v=1':'fail','./campus-profiles.json?v=2':'stall'}});
 let done=false;const preparing=partial.c.prepareExplorer().then(()=>{done=true;});
 await partial.advance(0);assert.equal(done,false,'waits for the stalled profiles');
 await partial.advance(20000);await preparing;
 assert.equal(partial.c.campuses.length,58);assert.equal(partial.c.campusById.get('paris').websiteUrl,undefined);assert.deepEqual(plain(partial.c.campusById.get('paris').profile),{});
 assert.equal(partial.c.campusById.get('paris').websiteLocales.defaultLanguage,'fr');assert.equal(partial.c.loadFailed,false);
});

test('the Explorer dice adds one entry, then announces its destination last; ascending goes through the continent',async()=>{
 const h=await ready();
 h.c.validateExplorer({kind:'continent',id:'europe'});h.c.validateExplorer({kind:'country',id:'FRA'});
 const expected=h.c.randomCampus.peek(),before=h.pushes();h.dice();
 assert.equal(h.pushes(),before+1);assert.equal(h.c.scope.campus,expected.id);assert.deepEqual(plain(h.state),{cp:true,scroll:0});
 assert.equal(h.view.key,'campus:'+expected.id);
 assert.equal(h.announcements.at(-1),`Destination choisie : ${expected.name}, ${new Intl.DisplayNames('fr',{type:'region'}).of(h.c.countryById.get(expected.country).iso2)}.`);
 assert.equal(h.announcements.at(-2),'Explorer · '+expected.name);
 assert.notEqual(h.c.randomCampus.peek().id,expected.id,'the next candidate excludes the current campus');
 h.c.ascendScope();assert.equal(h.c.scope.level,'country');h.c.ascendScope();assert.equal(h.c.scope.level,'continent','ascending goes through the continent');
});

test('the status line counts the filter on Explorer and is hidden on the campus screen; with no continent validated the bar shows Monde',async()=>{
 const h=await ready();const status=h.byId('globe-status'),hint=h.byId('globe-hint'),back=h.byId('scope-back');
 // No continent validated: the world filter, named Monde in the scope bar, with the network's counts; nothing to close.
 assert.equal(status.hidden,false);assert.equal(hint.textContent,'58 campus · 30 pays');assert.equal(back.disabled,true);
 assert.equal(h.byId('scope-name').textContent,'Monde');assert.equal(h.byId('scope-bar').dataset.level,'world');
 assert.equal(h.byId('scope-reading-summary').textContent,'Contexte géographique : Monde');
 h.c.validateExplorer({kind:'continent',id:'europe'});
 assert.equal(hint.textContent,'32 campus · 14 pays');assert.equal(h.byId('scope-name').textContent,'Europe');assert.equal(back.disabled,false);
 assert.equal(h.byId('scope-reading-summary').textContent,'Contexte géographique : Europe');
 h.c.validateExplorer({kind:'country',id:'FRA'});assert.equal(hint.textContent,'8 campus');assert.equal(status.hidden,false);
 h.c.validateExplorer({kind:'campus',id:'paris'});assert.equal(status.hidden,true);assert.equal(h.byId('scope-country-item').hidden,false);
 h.visit('#projects?country=FRA&campus=paris','projects');assert.equal(status.hidden,true);
 h.visit('#projects','projects');assert.equal(h.c.scope.level,'world');assert.equal(back.disabled,true);
 h.visit('#explore','explore');assert.equal(h.byId('scope-name').textContent,'Monde');assert.equal(hint.textContent,'58 campus · 30 pays');assert.equal(h.view.key,'continents');
});

test('the filter shown survives a section round trip, Back, Forward and a reload; an unchanged choice adds nothing',async()=>{
 const h=await ready();
 h.c.validateExplorer({kind:'continent',id:'asia'});
 h.visit('#projects?continent=asia','projects');assert.equal(h.view.key,'countries:asia');assert.equal(h.options.direction,'none','hidden outside Explorer');
 h.visit('#explore?continent=asia','explore');assert.equal(h.view.key,'countries:asia');
 h.c.validateExplorer({kind:'country',id:'JPN'});
 h.back();assert.equal(h.view.key,'countries:asia');assert.equal(h.view.cursorId,'JPN');h.back(2);assert.equal(h.view.key,'countries:asia');
 h.back();assert.equal(h.view.key,'continents');assert.equal(h.view.cursorId,'asia');assert.equal(h.c.scope.level,'world');
 h.forward();assert.equal(h.view.key,'countries:asia');h.forward(3);assert.equal(h.view.key,'campuses:JPN');
 // A reload rebuilds its entry from the address alone.
 const startup=source.match(/^history\.replaceState\(\{cp:true,scroll:0\},'',routeURL\(route\)\);applyRoute\(\);$/m)[0];
 h.c.applyRoute=()=>{};vm.runInContext(startup,h.c);assert.deepEqual(plain(h.state),{cp:true,scroll:0});assert.equal(h.url,'#explore?country=JPN');
 // Unchanged filter: neither a history call nor an announcement.
 const calls=h.calls.length,spoken=h.announcements.length;h.c.selectScope({country:'JPN'});
 assert.equal(h.calls.length,calls,'no history call');assert.equal(h.announcements.length,spoken);assert.equal(h.view.key,'campuses:JPN');
});

test('entries left by the version with Monde (explorerList « countries », explorerVia « world ») fall back to level 1 and the continent path',async()=>{
 // Restored by Back, Forward or a reload in the same tab: nothing reads these fields any more, the address decides.
 const list=await ready({state:{cp:true,scroll:0,explorerList:'countries',explorerVia:null}});
 assert.equal(list.view.key,'continents');assert.deepEqual(list.view.items.map(item=>item.id),['africa','americas','asia','europe']);assert.equal(list.view.cursorId,'africa');
 assert.equal(list.c.scope.level,'world');assert.equal(list.byId('scope-back').disabled,true,'no list to close');assert.equal(list.byId('globe-hint').textContent,'58 campus · 30 pays');
 assert.equal(list.pushes(),0);list.c.ascendScope();assert.equal(list.pushes(),0,'nothing above World');assert.equal(list.view.key,'continents');
 list.c.resetScope();assert.equal(list.pushes(),0);assert.deepEqual(list.cursors,['africa']);
 // Back onto such an entry: level 1, the cursor on the continent left.
 const back=await ready();back.c.history.replaceState({cp:true,scroll:0,explorerList:'countries',explorerVia:null},'','#explore');
 back.c.validateExplorer({kind:'continent',id:'americas'});back.back();
 assert.equal(back.url,'#explore');assert.equal(back.view.key,'continents');assert.equal(back.view.cursorId,'americas');
 back.forward();assert.equal(back.view.key,'countries:americas');
 // A country reached through the Monde list now ascends through its continent.
 const via=await ready({hash:'#explore?country=FRA&campus=paris',state:{cp:true,scroll:0,explorerList:null,explorerVia:'world'}});
 assert.equal(via.view.key,'campus:paris');
 for(const [url,key,cursor] of [['#explore?country=FRA','campuses:FRA','paris'],['#explore?continent=europe','countries:europe','FRA'],['#explore','continents','europe']]){
  via.c.ascendScope();assert.equal(via.url,url);assert.equal(via.view.key,key);assert.equal(via.view.cursorId,cursor);
 }
 // A reload drops the old fields.
 const startup=source.match(/^history\.replaceState\(\{cp:true,scroll:0\},'',routeURL\(route\)\);applyRoute\(\);$/m)[0];
 const reload=await ready({state:{cp:true,scroll:0,explorerList:'countries',explorerVia:'world'}});reload.c.applyRoute=()=>{};vm.runInContext(startup,reload.c);
 assert.deepEqual(plain(reload.state),{cp:true,scroll:0});assert.equal(reload.view.key,'continents');
});

test('Arabic and English announcements and counts follow the selected language',async()=>{
 for(const [locale,world,europe,counts,first] of [['en','Explore · The world','32 campuses · 14 countries','58 campuses · 30 countries','africa'],['ar','استكشف · العالم','32 فرعًا · 14 دولة','58 فرعًا · 30 دولة','asia']]){
  const h=await ready();h.c.locale=locale;h.c.regionNames=new Intl.DisplayNames(locale,{type:'region'});
  h.c.validateExplorer({kind:'continent',id:'europe'});assert.equal(h.byId('globe-hint').textContent,europe);
  assert.equal(h.announcements.at(-1),locale==='en'?'Explore · Europe':'استكشف · أوروبا');
  h.c.resetScope();assert.equal(h.announcements.at(-1),world);assert.equal(h.byId('globe-hint').textContent,counts);assert.equal(h.view.cursorId,first);
 }
});

test('version B §T: every update of the bar fits the pill, from the catalogue\'s arrival on; the picker keeps the whole indication',async()=>{
 const h=harness();
 h.c.updateScope();assert.deepEqual(plain(h.fits.at(-1)),{locale:'fr',network:false},'before the catalogue: nothing to measure yet');
 await h.c.prepareExplorer();
 assert.ok(h.fits.some(fit=>fit.network),'fitted once the catalogue is there');
 const count=h.fits.length;
 h.c.validateExplorer({kind:'campus',id:'abu-dhabi'});
 assert.ok(h.fits.length>count,'each update asks again; the pill measures only when its language, form or viewport changed');
 // The whole indication stays in the picker's accessible name and title, whatever « … » the pill shows on a phone.
 assert.equal(h.byId('scope-picker').getAttribute('aria-label'),'42 Abu Dhabi · Choisir un pays ou un campus');
 assert.equal(h.byId('scope-picker').title,'42 Abu Dhabi');assert.equal(h.byId('scope-country').title,'Émirats arabes unis');
 assert.equal(h.byId('scope-reading-summary').textContent,'Contexte géographique : Émirats arabes unis › 42 Abu Dhabi');
 h.c.locale='ar';h.c.regionNames=new Intl.DisplayNames('ar',{type:'region'});h.c.updateScope();
 assert.deepEqual(plain(h.fits.at(-1)),{locale:'ar',network:true},'a language change fits the pill in the new language');
});

test('version B §Y: the bar shows the whole path in steps, the continent before a country or a campus, then the steps still to choose',async()=>{
 const h=await ready();
 const steps=()=>({continent:h.byId('scope-continent-item').hidden?null:h.byId('scope-continent-name').textContent,country:h.byId('scope-country-item').hidden?null:h.byId('scope-country-name').textContent,
  name:h.byId('scope-name').textContent,pending:['country','campus'].filter(step=>!h.byId(`scope-${step}-placeholder`).hidden)});
 // « Monde › Pays › Campus »: no continent step, Monde is that level; a continent takes its place.
 assert.deepEqual(steps(),{continent:null,country:null,name:'Monde',pending:['country','campus']});
 h.c.validateExplorer({kind:'continent',id:'europe'});
 assert.deepEqual(steps(),{continent:null,country:null,name:'Europe',pending:['country','campus']});
 // « Europe › France › Campus », then « Europe › France › 42 Paris », the continent from the catalogue (continents.mjs).
 h.c.validateExplorer({kind:'country',id:'FRA'});
 assert.deepEqual(steps(),{continent:'Europe',country:null,name:'France',pending:['campus']});
 const fits=h.fits.length;h.c.validateExplorer({kind:'campus',id:'paris'});
 assert.deepEqual(steps(),{continent:'Europe',country:'France',name:'42 Paris',pending:[]});
 assert.ok(h.fits.length>fits,'the pill is fitted once the steps are painted');
 // The names stay those of today: the picker's keeps the full current place, the reading summary its context.
 assert.equal(h.byId('scope-picker').getAttribute('aria-label'),'42 Paris · Choisir un pays ou un campus');assert.equal(h.byId('scope-path').getAttribute('aria-label'),'Chemin géographique');
 assert.equal(h.byId('scope-reading-summary').textContent,'Contexte géographique : France › 42 Paris');
 // Ascending, the reset, the content pages' filter (a campus straight from its country) and the language.
 h.c.ascendScope();assert.deepEqual(steps(),{continent:'Europe',country:null,name:'France',pending:['campus']});
 h.c.resetScope();assert.deepEqual(steps(),{continent:null,country:null,name:'Monde',pending:['country','campus']});
 h.visit('#projects?country=JPN&campus=tokyo','projects');assert.deepEqual(steps(),{continent:'Asie',country:'Japon',name:'42 Tokyo',pending:[]});
 h.visit('#projects?continent=africa','projects');assert.deepEqual(steps(),{continent:null,country:null,name:'Afrique',pending:['country','campus']});
 h.visit('#projects?country=JPN&campus=tokyo','projects');
 h.c.locale='ar';h.c.regionNames=new Intl.DisplayNames('ar',{type:'region'});h.c.updateScope();
 assert.deepEqual(steps(),{continent:'آسيا',country:'اليابان',name:'42 Tokyo',pending:[]});
 h.c.locale='en';h.c.regionNames=new Intl.DisplayNames('en',{type:'region'});h.c.selectScope({country:'TUR'});
 assert.deepEqual(steps(),{continent:'Asia',country:null,name:new Intl.DisplayNames('en',{type:'region'}).of('TR'),pending:['campus']},'Turkey in Asia (M49)');
});

// The free band of the Explorer stage, measured on rectangles like those of the integrated page in Chrome.
function bandFixture({height=900,status={bottom:162.3},bar={bottom:132},room={top:713},search={top:751},section='explore'}={}){
 const observed=[],written={};let notify;
 class Observer{constructor(callback){notify=callback;}observe(target,options){observed.push([target,options]);}disconnect(){observed.length=0;}}
 const element=(rect,laidOut=true)=>({hidden:false,rect,laidOut,open:false,getClientRects(){return this.laidOut?[this.rect]:[];},getBoundingClientRect(){return this.rect;},closest(selector){return this.open&&selector==='[data-search-open=true]'?{}:null;}});
 const nodes={status:element(status),bar:element(bar),room:element(room,Boolean(room)),search:element(search),random:element({top:search.top})};
 const app={dataset:{section}},stage={dataset:{},style:{setProperty(name,value){written[name]=value;}},getBoundingClientRect:()=>({top:0,height}),ownerDocument:{defaultView:{ResizeObserver:Observer,innerHeight:height},fonts:{ready:Promise.resolve()}}};
 const band=createExplorerBand({stage,app,getTopElements:()=>[nodes.status,nodes.bar],getBottomElements:()=>[nodes.room,nodes.search,nodes.random]});
 return {band,stage,app,nodes,written,observed,notify:()=>notify()};
}

test('the Explorer band sits between the status line and the first bottom control, 16 px from each, and gets tighter when short',()=>{
 const desktop=bandFixture();
 assert.deepEqual({...desktop.band.state},{top:178.3,bottom:203,mode:'normal',band:518.7});
 assert.deepEqual(desktop.written,{'--explorer-top':'178.3px','--explorer-bottom':'203px'});assert.equal(desktop.stage.dataset.band,'normal');
 assert.deepEqual(desktop.observed.map(([target,options])=>target===desktop.stage?options:target),[{box:'border-box'},desktop.nodes.status,desktop.nodes.bar,desktop.nodes.room,desktop.nodes.search,desktop.nodes.random]);
 // The campus screen hides the status line: the filter itself bounds the band.
 desktop.nodes.status.hidden=true;desktop.notify();assert.equal(desktop.band.state.top,148);
 // 853×480 (150 %): no note room (hidden 520 px tall or less), the search capsule bounds it; under 260 px the cards become one row of pills.
 const zoomed=bandFixture({height:480,status:{bottom:154.3},room:null,search:{top:354}});
 assert.deepEqual({...zoomed.band.state},{top:162.3,bottom:142,mode:'compact',band:175.7});
 // 667×375: under 120 px even with 8 px at the top, the stage scrolls.
 const landscape=bandFixture({height:375,status:{bottom:148.84},room:null,search:{top:249}});
 assert.equal(landscape.band.state.mode,'scroll');assert.equal(landscape.band.state.top,156.84);assert.equal(landscape.stage.dataset.band,'scroll');
 // An open search grows the capsule into its results, and other sections hide the stage: the band is kept.
 const kept=bandFixture();kept.nodes.room.laidOut=false;kept.nodes.search.open=true;kept.nodes.search.rect={top:300};
 assert.equal(kept.band.measure().bottom,203);assert.equal(kept.written['--explorer-bottom'],'203px');
 kept.nodes.search.open=false;kept.app.dataset.section='projects';assert.equal(kept.band.measure().bottom,203);
 kept.app.dataset.section='explore';assert.equal(kept.band.measure().bottom,616);
 kept.band.destroy();assert.equal(kept.observed.length,0);assert.equal(kept.band.measure().bottom,616);
});

test('the band is created before the selector, so its observer runs first on a resize (final check, no ResizeObserver loop)',()=>{
 const band=source.indexOf('const explorerBand=createExplorerBand('),selector=source.indexOf('const explorer=createExplorerSelector(');
 assert.ok(band>0&&selector>0);assert.ok(band<selector);
});

// Refinements §N (26 Oct 2026): « Supprime le texte Exploration 42 Horizon », with its dialog; « Garder la place vide ».
test('no « Exploration · 42 Horizon » note or dialog: an empty room keeps the note\'s box and bounds the band in its place',()=>{
 const file=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
 for(const page of ['index.html','content-preview.html']){
  const html=file(page);
  assert.doesNotMatch(html,/id="about"|data-copy="prototype"|Exploration · 42 Horizon|<button class="prototype-note"/,page);
  assert.equal(html.match(/<span class="prototype-note" id="note-room" aria-hidden="true"><\/span>/g)?.length,1,page);
 }
 // The listener, the note's label and the dialog's copy and source link go with them.
 assert.doesNotMatch(source,/byId\('about'\)|\bprototype:'|aboutTitle|aboutSource|aboutDemo|networkText|networkSource|networkUnavailable|network-source/);
 assert.doesNotMatch(file('entrance.css'),/#about/);
 assert.doesNotMatch(file('welcome.css'),/\.network-source|\.prototype-note:hover/);
 assert.doesNotMatch(file('content-preview.css'),/:not\(\[data-section=explore\]\) \.prototype-note/);
 // The room is the band's first bottom bound on the Explorer only, sized before the band is created and at each language change.
 assert.match(source,/getBottomElements:\(\)=>\[byId\('note-room'\),document\.querySelector\('\.dock-search-toggle'\),document\.querySelector\('\.dock-random-toggle'\)\]/);
 assert.match(source,/^ byId\('note-room'\)\.hidden=section!=='explore';$/m);
 assert.ok(source.indexOf('\nsizeNoteRoom();\n')>0&&source.indexOf('\nsizeNoteRoom();\n')<source.indexOf('const explorerBand=createExplorerBand('));
 assert.match(functionSource('localize'),/forEach\(element=>\{element\.textContent=t\(element\.dataset\.copy\);\}\);\n sizeNoteRoom\(\);\n/);
 // As tall as the note was in Chrome: 25 px (Jost 13 px, 3 px paddings), 34 px in Arabic (its glyphs' fallback font).
 const room={style:{}},context=vm.createContext({byId:id=>id==='note-room'?room:null,locale:'fr'});
 vm.runInContext(functionSource('sizeNoteRoom'),context);
 for(const [locale,height] of [['fr','25px'],['en','25px'],['ar','34px']]){context.locale=locale;vm.runInContext('sizeNoteRoom()',context);assert.equal(room.style.height,height,locale);}
});
