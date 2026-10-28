import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {normalizeProjectSection} from '../project-ui.mjs';
import {normalizeJournalSection} from '../journal-ui.mjs';
import {normalizeProfileSection,normalizeProfileProjectFilters} from '../profile-sections.mjs';
import {normalizeContentPage} from '../content-pagination.mjs';

// Exercise the active router functions, following the existing scope tests;
// no duplicate implementation of their normalization or URL construction.
const source=fs.readFileSync(new URL('../welcome.mjs',import.meta.url),'utf8');
function fixture(hash='#projects/example'){
 const calls=[],context=vm.createContext({URLSearchParams,location:{hash},sections:['projects','people','journal'],defaultSection:'projects',
  discoveryEntries:[{id:'example',section:'projects'},{id:'article',section:'journal'},{id:'person',section:'people'}],
  profileById:new Map([['person',{}]]),legacyProfileRoutes:{},normalizeProjectSection,normalizeJournalSection,normalizeProfileSection,normalizeProfileProjectFilters,normalizeContentPage,
  history:{state:{fromList:true,projectDepth:2},pushState:(state,_,url)=>calls.push({state,url})},
  section:'projects',rememberScroll(){},applyRoute:options=>calls.push({apply:options}),sampleCampus:()=>({country:'FRA'})});
 for(const name of ['readRoute','routeURL','navigate','changeProjectSection','relatedRoute']){
  const definition=source.match(new RegExp('function '+name+'\\([^]*?\\n}'));
  assert.ok(definition,'Active function '+name+' must exist');vm.runInContext(definition[0],context);
 }
 context.route=context.readRoute();return {context,calls};
}

test('legacy team links become overview links targeting the team without dropping geographic scope',()=>{
 for(const hash of ['#projects/example?tab=team&country=BRA&campus=rio','#projects/example?focus=team&country=BRA&campus=rio']){
  const {context}=fixture(hash),route=context.route;
  assert.equal(route.projectTab,'overview');assert.equal(route.projectFocus,'team');
  const canonical=context.routeURL(route),query=new URLSearchParams(canonical.split('?')[1]);
  assert.equal(query.get('focus'),'team');assert.equal(query.has('tab'),false);
  assert.equal(query.get('country'),'BRA');assert.equal(query.get('campus'),'rio');
  context.location.hash=canonical;assert.equal(context.readRoute().projectFocus,'team');
 }
 const {context}=fixture('#projects/example?tab=test&focus=team');
 assert.equal(context.route.projectTab,'test');assert.equal(new URLSearchParams(context.routeURL(context.route).split('?')[1]).has('focus'),false);
});

test('actual card destinations send project +N to overview/team and chronicle +N to its authors section',()=>{
 const definition=source.match(/const allAuthorsRoute=[^\n]+;/);assert.ok(definition);
 for(const section of ['projects','journal']){
  const {context}=fixture(),entryId=section==='projects'?'example':'article';
  context.entry={section};context.next={section,entryId,country:'FRA',campus:'paris',projectTab:'overview',journalTab:'article'};
  const destination=vm.runInContext(definition[0]+'\nallAuthorsRoute',context),url=context.routeURL(destination),query=new URLSearchParams(url.split('?')[1]);
  assert.ok(url.startsWith('#'+section+'/'+entryId+'?'));
  assert.equal(query.get('country'),'FRA');assert.equal(query.get('campus'),'paris');
  if(section==='projects'){assert.equal(query.get('focus'),'team');assert.equal(query.has('tab'),false);}
  else{assert.equal(query.get('tab'),'authors');assert.equal(query.has('focus'),false);}
 }
});

test('changing project sections clears the team target while preserving its history depth and origin',()=>{
 const {context,calls}=fixture('#projects/example?focus=team');let prevented=0;
 context.changeProjectSection({button:0,preventDefault:()=>prevented++},'test');
 assert.equal(prevented,1);assert.equal(context.route.projectTab,'test');assert.equal(context.route.projectFocus,null);
 assert.equal(calls[0].url,'#projects/example?tab=test');assert.equal(calls[0].state.projectDepth,3);assert.equal(calls[0].state.fromList,true);
 assert.equal(calls[1].apply.projectSectionChange,true);
 for(const properties of [{button:1},{metaKey:true},{ctrlKey:true},{shiftKey:true},{altKey:true}])context.changeProjectSection({button:0,preventDefault:()=>prevented++,...properties},'media');
 assert.equal(prevented,1);assert.equal(calls.length,2);
});

test('opening another content or an author does not carry the project team anchor into that destination',()=>{
 const {context}=fixture('#projects/example?focus=team&country=BRA&campus=rio');
 const profile=context.relatedRoute({id:'person',section:'people',kind:'profile',campus:'paris'});
 assert.equal(profile.projectFocus,null);assert.equal(profile.country,'BRA');assert.equal(profile.campus,'rio');assert.equal(context.routeURL(profile).includes('focus='),false);
 context.navigate({entryId:'another-project'});
 assert.equal(context.route.projectFocus,null);assert.equal(context.route.projectTab,'overview');
});

test('a fresh team destination focuses its heading, but Back restores even a deliberately saved scroll position of zero',()=>{
 const {context}=fixture('#projects/example?focus=team'),positions=[],focused=[],anchors=[];let onPopState;
 const node=id=>({dataset:{},setAttribute(){},querySelector(){return null;},focus(){focused.push(id);},scrollIntoView(options){anchors.push({id,options});}});
 Object.assign(context,{routeApplyVersion:0,entryOpen:true,app:node('app'),buttons:[],scopePopover:null,themeMenu:null,accountMenu:null,dockSearch:null,
  document:{querySelector:()=>node('query')},byId:node,brandWordmark:{setAwards(){}},readingScope:{setReading(){}},
  contentTransitions:{cancel(){},enter(){}},detailScroll:{restore(){},centerActive(){}},motion:{matches:true},explorer:{focus(){focused.push('explorer');}},
  updateScope(){},syncScope(){},renderContent(){},restoreContentPage:()=>false,moveIndicator(){},announce(){},contentLocationAnnouncement:()=>'',t:value=>value,scopeName:()=>'',
  requestAnimationFrame:callback=>callback(),window:{scrollTo:options=>positions.push(options.top),addEventListener:(_type,callback)=>{onPopState=callback;}},
  dialog:{open:false}});
 vm.runInContext(source.match(/function applyRoute\([^]*?\n}/)[0],context);
 vm.runInContext(source.match(/window\.addEventListener\('popstate',[^\n]+/)[0],context);
 context.applyRoute({scroll:0,focus:true});
 assert.deepEqual(focused,['project-team-title']);assert.equal(anchors.length,1);assert.equal(anchors[0].options.block,'start');
 for(const scroll of [0,220]){
  positions.length=focused.length=anchors.length=0;context.history.state={scroll};onPopState();
  assert.deepEqual(positions,[scroll]);assert.equal(anchors.length,0);assert.deepEqual(focused,['project-title']);
 }
});
