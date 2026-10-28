import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {matchesContentScope} from '../content-geography.mjs';
import {previewEntries} from '../content-preview-data.mjs';
import {createDiscoveryEntries} from '../profile-data.mjs';

const source=readFileSync(new URL('../welcome.mjs',import.meta.url),'utf8');
const dataset=JSON.parse(readFileSync(new URL('../campuses.json',import.meta.url),'utf8'));
const entries=createDiscoveryEntries(previewEntries);
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function harness(initial={}){
 const nodes=new Map(),historyCalls=[],cameraCalls=[],renders=[];
 const byId=id=>{if(!nodes.has(id))nodes.set(id,{disabled:true,hidden:true,textContent:''});return nodes.get(id);};
 const location={href:'http://test/#projects',hash:'#projects'};
 const history={state:{},pushState(state,_,url){this.state=state;location.hash=url;location.href='http://test/'+url;historyCalls.push(['push',url]);},replaceState(state,_,url){this.state=state;if(url){location.hash=url;location.href='http://test/'+url;}historyCalls.push(['replace',url]);}};
 const context=vm.createContext({Promise,Error,Map,URLSearchParams,network:null,networkData:null,searchCatalog:{campuses:[]},countries:[],campuses:[],
  campusById:new Map(),countryById:new Map(),route:{section:'projects',entryId:null,country:null,campus:null,...initial},section:initial.section||'projects',scope:{level:'world',country:null,campus:null},listPagination:null,
  mapReady:false,mapScope:null,globe:null,entryOpen:true,applyingRoute:false,loadFailed:false,preparation:null,campusPreparation:null,campusRendering:false,campusRenderError:null,
  dataControls:['scope-picker','scope-world','scope-country','reset','zoom-in','zoom-out'],byId,history,location,
  json:()=>Promise.resolve(dataset),initializeGlobe:()=>Promise.resolve(),trace:()=>{},applyGlobeView:()=>{},
  dockSearch:{refresh(){},suspendDocumentScroll(){return ()=>{};}},rememberScroll(){},updateScope(){},updateCampusStatus(){},renderContent(options){renders.push(options);},announce(){},t:key=>key,scopeName:()=>'',
  requestAnimationFrame:callback=>callback(),window:{scrollTo(){}},campusMap:{ownsMap:false},
  contentPreferences:{snapshot:()=>({})},discoveryEntries:entries,matchesContentScope,sortContentEntries:list=>list,applyContentCategory:list=>list,
 });
 for(const name of ['geographicScope','setContentScope','selectScope','syncMap','loadNetworkData','prepareGlobe','contentCandidates','contentLocationAnnouncement']){
  vm.runInContext(source.match(new RegExp('function '+name+'\\([^]*?\\n}'))[0],context);
 }
 vm.runInContext(`function routeURL(next){const params=new URLSearchParams();if(next.country)params.set('country',next.country);if(next.campus)params.set('campus',next.campus);return '#'+next.section+(next.entryId?'/'+next.entryId:'')+(params.size?'?'+params:'');}`,context);
 const callback=source.slice(source.indexOf('   onScopeChange(next){'),source.indexOf('   onCampusLoad(state)'));
 vm.runInContext('function '+callback.trim().replace(/,$/,''),context);
 function readyMap(){
  context.mapReady=true;
  context.globe={destroy(){cameraCalls.push(['destroy']);},selectCampus(id){cameraCalls.push(['campus',id]);context.onScopeChange(context.geographicScope({campus:id}));},selectCountry(id){cameraCalls.push(['country',id]);context.onScopeChange(context.geographicScope({country:id}));},reset(){cameraCalls.push(['world']);context.onScopeChange(context.geographicScope({}));}};
 }
 return {context,byId,historyCalls,cameraCalls,readyMap,renders};
}

test('the complete local catalogue enables country/campus filtering while map preparation stays pending',async()=>{
 const {context:c,byId,cameraCalls}=harness();const pending=deferred();c.initializeGlobe=()=>pending.promise;c.prepareGlobe();
 await c.loadNetworkData();
 assert.equal(c.campuses.length,58);assert.equal(c.countries.length,30);assert.equal(c.globe,null);
 for(const id of ['scope-picker','scope-world','scope-country','reset'])assert.equal(byId(id).disabled,false,id);
 for(const id of ['zoom-in','zoom-out'])assert.equal(byId(id).disabled,true,id);
 c.selectScope({country:'FRA'});assert.equal(c.scope.level,'country');assert.equal(c.route.country,'FRA');assert.equal(c.route.campus,null);
 assert.ok(c.contentCandidates().length>0);assert.ok(c.contentCandidates().every(entry=>matchesContentScope(entry,{country:'FRA'},dataset.campuses)));
 c.selectScope({campus:'lyon'});assert.equal(c.route.country,'FRA');assert.equal(c.scope.campus,'lyon');assert.equal(c.scope.level,'campus');
 assert.ok(c.contentCandidates().every(entry=>matchesContentScope(entry,{campus:'lyon'},dataset.campuses)));
 c.selectScope({country:'BRA'});assert.equal(c.route.campus,null);assert.equal(c.scope.country,'BRA');
 c.selectScope({});assert.equal(c.scope.level,'world');assert.equal(c.route.country,null);assert.equal(c.contentCandidates().length,entries.filter(entry=>entry.section==='projects').length);assert.equal(cameraCalls.length,0);
 pending.resolve();
});

test('all three content lists keep their country and campus filters after the map fails',async()=>{
 for(const section of ['projects','people','journal']){
  const {context:c,byId}=harness({section});await c.loadNetworkData();
  c.initializeGlobe=()=>Promise.reject(new Error('WebGL unavailable'));
  await assert.rejects(c.prepareGlobe(),/WebGL unavailable/);
  assert.equal(c.loadFailed,true);assert.equal(c.mapReady,false);assert.equal(byId('scope-picker').disabled,false);
  c.selectScope({country:'JPN'});assert.equal(c.route.country,'JPN');assert.equal(c.route.campus,null);
  c.selectScope({campus:'tokyo'});assert.equal(c.route.campus,'tokyo');assert.equal(c.route.country,'JPN');
  assert.ok(c.contentCandidates().every(entry=>matchesContentScope(entry,{campus:'tokyo'},dataset.campuses)));
  c.selectScope({country:'JPN',campus:null});assert.equal(c.scope.level,'country');
  c.selectScope({});assert.equal(c.scope.level,'world');assert.ok(c.contentCandidates().length>0);
 }
});

test('direct links and history restore normalize geography without waiting for WebGL',async()=>{
 const {context:c}=harness({country:'BRA',campus:'paris',entryId:'ft-transcendence'});await c.loadNetworkData();
 assert.equal(c.route.country,'FRA');assert.equal(c.route.campus,'paris');assert.equal(c.route.entryId,'ft-transcendence');assert.equal(c.scope.level,'campus');
 c.route={section:'projects',country:'BRA',campus:null};c.syncMap();assert.equal(c.scope.country,'BRA');assert.equal(c.scope.campus,null);
 c.route={section:'projects',country:'INVALID',campus:'missing'};c.syncMap();assert.equal(c.scope.level,'world');assert.equal(c.route.country,null);assert.equal(c.route.campus,null);
});

test('initial and retried map callbacks cannot erase a filter; readiness synchronizes the selected destination once',async()=>{
 const {context:c,cameraCalls,historyCalls,readyMap}=harness();await c.loadNetworkData();c.selectScope({campus:'tokyo'});
 const before=historyCalls.length;
 c.onScopeChange({level:'world',country:null,campus:null});assert.equal(c.scope.campus,'tokyo');assert.equal(c.route.campus,'tokyo');assert.equal(historyCalls.length,before);
 readyMap();c.syncMap();assert.deepEqual(cameraCalls,[['campus','tokyo']]);assert.equal(c.route.campus,'tokyo');assert.equal(historyCalls.length,before);
 c.syncMap();assert.equal(cameraCalls.length,1);
 c.selectScope({campus:'tokyo'});assert.deepEqual(cameraCalls.at(-1),['campus','tokyo']);assert.equal(historyCalls.length,before,'reselecting allows map recentering without another route');
 c.onScopeChange({level:'country',country:'FRA',campus:null});assert.equal(c.route.country,'FRA');assert.equal(c.route.campus,null);
});

test('filter changes made before entrance completion are restored only after entry opens',async()=>{
 const {context:c,readyMap,cameraCalls}=harness({country:'FRA',campus:'lyon'});c.entryOpen=false;await c.loadNetworkData();
 readyMap();c.onScopeChange({level:'world',country:null,campus:null});c.syncMap();assert.equal(c.scope.level,'world');assert.equal(c.route.campus,'lyon');assert.equal(cameraCalls.length,0);
 c.entryOpen=true;c.syncMap();assert.equal(c.scope.campus,'lyon');assert.deepEqual(cameraCalls,[['campus','lyon']]);
});

test('a failed catalogue request can be retried independently of the map',async()=>{
 const {context:c,byId}=harness({country:'JPN'});let attempts=0;
 c.json=()=>++attempts===1?Promise.reject(new Error('catalogue unavailable')):Promise.resolve(dataset);
 await assert.rejects(c.loadNetworkData(),/catalogue unavailable/);assert.equal(byId('scope-picker').disabled,true);assert.equal(c.networkData,null);
 await c.loadNetworkData();assert.equal(attempts,2);assert.equal(byId('scope-picker').disabled,false);assert.equal(c.scope.country,'JPN');
});

test('incidental catalogue completion, matching map callbacks and map failure preserve an open filter draft',async()=>{
 const {context:c,renders,readyMap}=harness();await c.loadNetworkData();
 assert.equal(renders.at(-1).keepControlsOpen,true);assert.equal(renders.at(-1).keepProfileControlsOpen,true);
 readyMap();c.onScopeChange({level:'world',country:null,campus:null});assert.equal(renders.at(-1).keepControlsOpen,true);
 c.initializeGlobe=()=>Promise.reject(new Error('renderer unavailable'));await assert.rejects(c.prepareGlobe(),/renderer unavailable/);assert.equal(renders.at(-1).keepControlsOpen,true);
 c.selectScope({country:'FRA'});assert.equal(renders.at(-1).keepControlsOpen,false,'an actual geographic change still replaces the list context');
});
