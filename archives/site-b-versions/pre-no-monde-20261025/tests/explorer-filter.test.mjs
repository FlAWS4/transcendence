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
// the Explorer filter, its list and path in history, the catalogue preparation and the dice.
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
const FUNCTIONS=['readRoute','routeURL','geographicScope','geographyKey','explorerState','setContentScope','selectScope','syncScope','syncExplorer','validateExplorer','ascendScope','resetScope','loadNetworkData','prepareExplorer','contentCandidates','contentLocationAnnouncement','updateScope'];

function harness({hash='#explore',section,state={cp:true,scroll:0},entryOpen=true,respond={},shapes='ok'}={}){
 let clock=0,nextTimer=0,network=null;
 const timers=new Map(),nodes=new Map(),calls=[],shows=[],announcements=[],traces=[],renders=[],requests=[],cursors=[],atNetwork=[];
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
  loadFailed:false,preparation:null,preloadTrace:{attempts:0},explorerMemory:null,explorerView:null,randomCampus:null,listPagination:null,
  regionNames:new Intl.DisplayNames('fr',{type:'region'}),dataControls:['scope-picker','scope-world','scope-country','reset'],
  byId,document,history,location,json,loadExplorerShapes,...artStubs,requestAnimationFrame:callback=>callback(),window:{scrollTo(){}},performance:{now:()=>clock},
  setTimeout:(callback,delay)=>{timers.set(++nextTimer,{callback,at:clock+delay});return nextTimer;},clearTimeout:id=>timers.delete(id),
  app:{dataset:{}},scopePopover:null,explorerBand:{measure(){}},dockSearch:{refresh(){},suspendDocumentScroll(){return ()=>{};}},
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
 return {c,byId,calls,shows,announcements,traces,renders,requests,cursors,atNetwork,
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
 assert.equal(h.view.key,'continents');assert.equal(h.view.cursorId,'world');assert.equal(h.options.direction,'none');
 assert.equal(h.pushes(),0);assert.equal(h.state.explorerList,null);assert.equal(h.state.explorerVia,null);
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

test('each validation adds exactly one entry; Monde keeps the address and opens the 30 countries',async()=>{
 const h=await ready();
 h.c.validateExplorer({kind:'world',id:'world'});
 assert.equal(h.pushes(),1);assert.equal(h.url,'#explore');assert.equal(h.state.explorerList,'countries');
 assert.equal(h.view.key,'countries:world');assert.equal(h.view.items.length,30);assert.equal(h.options.direction,'descend');
 assert.equal(h.c.scope.level,'world');assert.equal(h.announcements.at(-1),'Explorer · Monde · 30 pays');
 h.c.validateExplorer({kind:'country',id:'FRA'});
 assert.equal(h.pushes(),2);assert.equal(h.url,'#explore?country=FRA');assert.equal(h.state.explorerVia,'world');assert.equal(h.state.explorerList,null);
 assert.equal(h.view.key,'campuses:FRA');assert.equal(h.view.cursorId,'angouleme');assert.equal(h.announcements.at(-1),'Explorer · France');
 h.c.validateExplorer({kind:'campus',id:'paris'});
 assert.equal(h.pushes(),3);assert.equal(h.url,'#explore?country=FRA&campus=paris');assert.equal(h.state.explorerVia,'world');
 assert.equal(h.view.key,'campus:paris');assert.equal(h.view.siblings.length,8);
 // A sibling of the strip is a validated campus: the path is kept.
 h.c.validateExplorer({kind:'campus',id:'lyon'});
 assert.equal(h.pushes(),4);assert.equal(h.url,'#explore?country=FRA&campus=lyon');assert.equal(h.state.explorerVia,'world');assert.equal(h.view.key,'campus:lyon');
 const continent=await ready();
 continent.c.validateExplorer({kind:'continent',id:'europe'});
 assert.equal(continent.pushes(),1);assert.equal(continent.url,'#explore?continent=europe');assert.equal(continent.view.key,'countries:europe');
 assert.equal(continent.announcements.at(-1),'Explorer · Europe');assert.equal(continent.c.route.continent,'europe');
 continent.c.validateExplorer({kind:'country',id:'FRA'});
 assert.equal(continent.pushes(),2);assert.equal(continent.url,'#explore?country=FRA');assert.equal(continent.state.explorerVia,null);assert.equal(continent.c.route.continent,null);
});

test('ascending follows the path that was taken, one entry each, with the cursor on the level left',async()=>{
 const h=await ready();
 for(const step of [{kind:'world',id:'world'},{kind:'country',id:'FRA'},{kind:'campus',id:'lyon'}])h.c.validateExplorer(step);
 const expected=[['#explore?country=FRA','campuses:FRA','lyon'],['#explore','countries:world','FRA'],['#explore','continents','world']];
 for(const [url,key,cursor] of expected){
  const before=h.pushes();h.c.ascendScope();
  assert.equal(h.pushes(),before+1,key);assert.equal(h.url,url);assert.equal(h.view.key,key);assert.equal(h.view.cursorId,cursor);assert.equal(h.options.direction,'ascend');
 }
 assert.equal(h.state.explorerList,null);
 const before=h.pushes();h.c.ascendScope();assert.equal(h.pushes(),before,'nothing above World');
 const continent=await ready();
 for(const step of [{kind:'continent',id:'europe'},{kind:'country',id:'FRA'},{kind:'campus',id:'paris'}])continent.c.validateExplorer(step);
 for(const [url,key,cursor] of [['#explore?country=FRA','campuses:FRA','paris'],['#explore?continent=europe','countries:europe','FRA'],['#explore','continents','europe']]){
  continent.c.ascendScope();assert.equal(continent.url,url);assert.equal(continent.view.key,key);assert.equal(continent.view.cursorId,cursor);
 }
 assert.equal(continent.pushes(),6);
});

test('reset goes back to World L1; on World it only moves the cursor back to Monde, without history',async()=>{
 const h=await ready();
 h.c.validateExplorer({kind:'world',id:'world'});h.c.resetScope();
 assert.equal(h.pushes(),2);assert.equal(h.state.explorerList,null);assert.equal(h.view.key,'continents');
 assert.deepEqual(h.cursors,[]);
 // Only the cursor is elsewhere: the selector's public setCursor moves it back to Monde, with no new view (H2f).
 const shows=h.shows.length,calls=h.calls.length;h.c.resetScope();
 assert.equal(h.calls.length,calls,'no history call');assert.equal(h.shows.length,shows,'no show()');
 assert.deepEqual(h.cursors,['world']);
 assert.equal(h.view.items.length,5);assert.equal(h.view.key,'continents');
 h.c.validateExplorer({kind:'campus',id:'tokyo'});h.c.resetScope();
 assert.equal(h.url,'#explore');assert.equal(h.c.scope.level,'world');assert.equal(h.view.key,'continents');
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
 assert.equal(h.view.key,'continents');assert.equal(h.view.cursorId,'world');assert.equal(h.options.direction,'none');
 assert.equal(h.c.route.country,'FRA');assert.equal(h.c.route.campus,'paris');assert.equal(h.c.scope.level,'world');
 assert.equal(h.calls.length,0,'no history before entry');assert.equal(h.c.explorerMemory,null);
 h.c.entryOpen=true;h.c.syncScope();
 assert.equal(h.view.key,'campus:paris');assert.equal(h.options.direction,'descend');assert.equal(h.pushes(),0);
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

test('the Explorer dice drops the list and the path, then announces its destination last',async()=>{
 const h=await ready();
 h.c.validateExplorer({kind:'world',id:'world'});h.c.validateExplorer({kind:'country',id:'FRA'});
 const expected=h.c.randomCampus.peek(),before=h.pushes();h.dice();
 assert.equal(h.pushes(),before+1);assert.equal(h.c.scope.campus,expected.id);assert.equal(h.state.explorerVia,null);assert.equal(h.state.explorerList,null);
 assert.equal(h.view.key,'campus:'+expected.id);
 assert.equal(h.announcements.at(-1),`Destination choisie : ${expected.name}, ${new Intl.DisplayNames('fr',{type:'region'}).of(h.c.countryById.get(expected.country).iso2)}.`);
 assert.equal(h.announcements.at(-2),'Explorer · '+expected.name);
 assert.notEqual(h.c.randomCampus.peek().id,expected.id,'the next candidate excludes the current campus');
 h.c.ascendScope();assert.equal(h.c.scope.level,'country');h.c.ascendScope();assert.equal(h.c.scope.level,'continent','the dropped path ascends through the continent');
});

test('the status line counts the filter on Explorer and is hidden on the campus screen; ← follows the Monde list',async()=>{
 const h=await ready();const status=h.byId('globe-status'),hint=h.byId('globe-hint'),back=h.byId('scope-back');
 assert.equal(status.hidden,false);assert.equal(hint.textContent,'58 campus · 30 pays');assert.equal(back.disabled,true);
 h.c.validateExplorer({kind:'world',id:'world'});assert.equal(back.disabled,false,'← closes the Monde list');assert.equal(h.byId('scope-name').textContent,'Monde');
 h.c.resetScope();h.c.validateExplorer({kind:'continent',id:'europe'});
 assert.equal(hint.textContent,'32 campus · 14 pays');assert.equal(h.byId('scope-name').textContent,'Europe');assert.equal(back.disabled,false);
 assert.equal(h.byId('scope-reading-summary').textContent,'Contexte géographique : Europe');
 h.c.validateExplorer({kind:'country',id:'FRA'});assert.equal(hint.textContent,'8 campus');assert.equal(status.hidden,false);
 h.c.validateExplorer({kind:'campus',id:'paris'});assert.equal(status.hidden,true);assert.equal(h.byId('scope-country-item').hidden,false);
 h.visit('#projects?country=FRA&campus=paris','projects');assert.equal(status.hidden,true);
 h.visit('#projects','projects');assert.equal(h.c.scope.level,'world');assert.equal(back.disabled,true);
});

test('the list and the path: kept by a section round trip, by Back and by a reload; dropped by an outside choice',async()=>{
 const h=await ready();
 h.c.validateExplorer({kind:'world',id:'world'});
 h.visit('#projects','projects');assert.equal(h.view.key,'countries:world');assert.equal(h.options.direction,'none','hidden outside Explorer');
 h.visit('#explore','explore');assert.equal(h.view.key,'countries:world');assert.equal(h.state.explorerList,'countries');
 h.c.validateExplorer({kind:'country',id:'FRA'});
 h.back();assert.equal(h.view.key,'countries:world');h.back(2);assert.equal(h.view.key,'countries:world');
 h.back();assert.equal(h.view.key,'continents','the entry before Monde keeps World L1');
 h.forward();assert.equal(h.view.key,'countries:world');h.forward(3);assert.equal(h.view.key,'campuses:FRA');assert.equal(h.c.explorerState().via,'world');
 // A reload rebuilds the entry from the previous history state.
 const startup=source.match(/^history\.replaceState\(\{cp:true,scroll:0,explorerList[^\n]+$/m)[0];
 h.c.applyRoute=()=>{};vm.runInContext(startup,h.c);assert.equal(h.state.explorerVia,'world');assert.equal(h.state.scroll,0);
 // The popover choosing the place already shown only drops the path: no new entry.
 const pushes=h.pushes();h.c.selectScope({country:'FRA'});
 assert.equal(h.pushes(),pushes);assert.equal(h.calls.at(-1)[0],'replace');assert.equal(h.state.explorerVia,null);assert.equal(h.c.explorerState().via,null);
 h.c.ascendScope();assert.equal(h.url,'#explore?continent=europe');
 // Unchanged filter, list and path: neither a history call nor an announcement.
 const calls=h.calls.length,spoken=h.announcements.length;h.c.selectScope({continent:'europe'});
 assert.equal(h.calls.length,calls,'no history call');assert.equal(h.announcements.length,spoken);assert.equal(h.view.key,'countries:europe');
 // An outside choice (search, account link, content button) forgets the list kept for the round trip.
 h.c.resetScope();h.c.validateExplorer({kind:'world',id:'world'});h.c.explorerMemory=null;
 h.visit('#explore','explore');assert.equal(h.view.key,'continents');
});

test('Arabic and English announcements and counts follow the selected language',async()=>{
 for(const [locale,world,europe] of [['en','Explore · World · 30 countries','32 campuses · 14 countries'],['ar','استكشف · العالم · 30 دولة','32 فرعًا · 14 دولة']]){
  const h=await ready();h.c.locale=locale;h.c.regionNames=new Intl.DisplayNames(locale,{type:'region'});
  h.c.validateExplorer({kind:'world',id:'world'});assert.equal(h.announcements.at(-1),world);
  h.c.resetScope();h.c.validateExplorer({kind:'continent',id:'europe'});assert.equal(h.byId('globe-hint').textContent,europe);
  assert.equal(h.announcements.at(-1),locale==='en'?'Explore · Europe':'استكشف · أوروبا');
 }
});

// The free band of the Explorer stage, measured on rectangles like those of the integrated page in Chrome.
function bandFixture({height=900,status={bottom:162.3},bar={bottom:132},about={top:713},search={top:751},section='explore'}={}){
 const observed=[],written={};let notify;
 class Observer{constructor(callback){notify=callback;}observe(target,options){observed.push([target,options]);}disconnect(){observed.length=0;}}
 const element=(rect,laidOut=true)=>({hidden:false,rect,laidOut,open:false,getClientRects(){return this.laidOut?[this.rect]:[];},getBoundingClientRect(){return this.rect;},closest(selector){return this.open&&selector==='[data-search-open=true]'?{}:null;}});
 const nodes={status:element(status),bar:element(bar),about:element(about,Boolean(about)),search:element(search),random:element({top:search.top})};
 const app={dataset:{section}},stage={dataset:{},style:{setProperty(name,value){written[name]=value;}},getBoundingClientRect:()=>({top:0,height}),ownerDocument:{defaultView:{ResizeObserver:Observer,innerHeight:height},fonts:{ready:Promise.resolve()}}};
 const band=createExplorerBand({stage,app,getTopElements:()=>[nodes.status,nodes.bar],getBottomElements:()=>[nodes.about,nodes.search,nodes.random]});
 return {band,stage,app,nodes,written,observed,notify:()=>notify()};
}

test('the Explorer band sits between the status line and the first bottom control, 16 px from each, and gets tighter when short',()=>{
 const desktop=bandFixture();
 assert.deepEqual({...desktop.band.state},{top:178.3,bottom:203,mode:'normal',band:518.7});
 assert.deepEqual(desktop.written,{'--explorer-top':'178.3px','--explorer-bottom':'203px'});assert.equal(desktop.stage.dataset.band,'normal');
 assert.deepEqual(desktop.observed.map(([target,options])=>target===desktop.stage?options:target),[{box:'border-box'},desktop.nodes.status,desktop.nodes.bar,desktop.nodes.about,desktop.nodes.search,desktop.nodes.random]);
 // The campus screen hides the status line: the filter itself bounds the band.
 desktop.nodes.status.hidden=true;desktop.notify();assert.equal(desktop.band.state.top,148);
 // 853×480 (150 %): no #about, the search capsule bounds it; under 260 px the cards become one row of pills.
 const zoomed=bandFixture({height:480,status:{bottom:154.3},about:null,search:{top:354}});
 assert.deepEqual({...zoomed.band.state},{top:162.3,bottom:142,mode:'compact',band:175.7});
 // 667×375: under 120 px even with 8 px at the top, the stage scrolls.
 const landscape=bandFixture({height:375,status:{bottom:148.84},about:null,search:{top:249}});
 assert.equal(landscape.band.state.mode,'scroll');assert.equal(landscape.band.state.top,156.84);assert.equal(landscape.stage.dataset.band,'scroll');
 // An open search grows the capsule into its results, and other sections hide the stage: the band is kept.
 const kept=bandFixture();kept.nodes.about.laidOut=false;kept.nodes.search.open=true;kept.nodes.search.rect={top:300};
 assert.equal(kept.band.measure().bottom,203);assert.equal(kept.written['--explorer-bottom'],'203px');
 kept.nodes.search.open=false;kept.app.dataset.section='projects';assert.equal(kept.band.measure().bottom,203);
 kept.app.dataset.section='explore';assert.equal(kept.band.measure().bottom,616);
 kept.band.destroy();assert.equal(kept.observed.length,0);assert.equal(kept.band.measure().bottom,616);
});

test('the band is created before the selector, so its observer runs first on a resize (final check, no ResizeObserver loop)',()=>{
 const band=source.indexOf('const explorerBand=createExplorerBand('),selector=source.indexOf('const explorer=createExplorerSelector(');
 assert.ok(band>0&&selector>0);assert.ok(band<selector);
});
