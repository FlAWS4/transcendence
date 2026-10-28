import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {normalizeContentPage} from '../content-pagination.mjs';
import {profileBackDistance} from '../profile-sections.mjs';

const source=readFileSync(new URL('../welcome.mjs',import.meta.url),'utf8');
function functionSource(name){const start=source.indexOf('function '+name+'('),line=source.slice(start).split('\n')[0];return line.endsWith('}')?line:source.slice(start).match(/^function [^]*?\n}/)[0];}
function harness(preferences={}){
 let state={sort:'newest',favoritesOnly:false,favorites:['p'],project:[],status:[],view:'grid',...preferences},index=0;
 const entries=[{state:{cp:true,scroll:460},url:'#projects?page=2'}];
 const context={route:{section:'projects',entryId:null,page:2},sections:['explore','projects','people','journal','awards'],defaultSection:'projects',section:'projects',URLSearchParams,normalizeContentPage,
  profileById:new Map(),legacyProfileRoutes:{},discoveryEntries:[{id:'p',section:'projects'}],normalizeProfileSection:x=>x||'overview',normalizeProfileProjectFilters:()=>[],normalizeProjectSection:x=>x||'overview',normalizeJournalSection:x=>x||'article',
  contentPreferences:{snapshot:()=>state},scrollY:460,detailScroll:{capture:()=>null},profileBackDistance,projectBackDistance:s=>profileBackDistance({...s,profileDepth:s?.projectDepth}),journalBackDistance:s=>profileBackDistance({...s,profileDepth:s?.journalDepth}),
  location:{hash:entries[0].url,href:entries[0].url},restoredScroll:null};
 const locate=url=>{context.location.hash=url;context.location.href=url;};
 context.applyRoute=({scroll=0}={})=>{context.restoredScroll=context.restoreContentPage()?0:scroll;};
 context.history={get state(){return entries[index].state;},replaceState(next,_,url){entries[index]={state:next,url};locate(url);},pushState(next,_,url){entries.splice(index+1);entries.push({state:next,url});index++;locate(url);},go(steps){index+=steps;locate(entries[index].url);context.route=context.readRoute();context.applyRoute({scroll:this.state.scroll});},back(){this.go(-1);}};
 vm.createContext(context);
 for(const name of ['contentPaginationCriteria','rememberScroll','restoreContentPage','routeURL','readRoute','navigate','resetContentPage','returnFromContent'])vm.runInContext(functionSource(name),context);
 return {context,change(values){state={...state,...values};}};
}

test('return from a detail resets page and scroll if favorites changed the originating list',()=>{
 for(const preferences of [{favoritesOnly:true},{sort:'favorites'}]){
  const f=harness(preferences),c=f.context;c.navigate({entryId:'p'},{fromList:true});
  f.change({favorites:['another']});c.resetContentPage();c.returnFromContent();
  assert.equal(c.route.page,1);assert.equal(c.location.hash,'#projects');assert.equal(c.restoredScroll,0);
 }
});

test('ordinary return and a favorite unrelated to the current order preserve page2 and scroll',()=>{
 const f=harness(),c=f.context;c.navigate({entryId:'p'},{fromList:true});f.change({favorites:['another']});c.returnFromContent();
 assert.equal(c.route.page,2);assert.equal(c.location.hash,'#projects?page=2');assert.equal(c.restoredScroll,460);
});

test('view changes preserve the originating page while an actual filter change resets it',()=>{
 const f=harness(),c=f.context;c.navigate({entryId:'p'},{fromList:true});f.change({view:'list'});c.returnFromContent();
 assert.equal(c.route.page,2);assert.equal(c.restoredScroll,460);
 c.navigate({entryId:'p'},{fromList:true});f.change({project:['tech:c']});c.returnFromContent();
 assert.equal(c.route.page,1);assert.equal(c.restoredScroll,0);
});
