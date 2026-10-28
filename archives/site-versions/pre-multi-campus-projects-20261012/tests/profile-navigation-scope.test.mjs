import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../welcome.mjs',import.meta.url),'utf8');
function fixture(route){
 const calls=[];
 const context=vm.createContext({route,URLSearchParams,profileById:new Map([['profile-ines-morel',{}]]),
  sampleCampus:id=>({lyon:{country:'FRA'},rio:{country:'BRA'}})[id],
  normalizeProfileSection:value=>value||'overview',normalizeProfileProjectFilters:value=>value||[],
  normalizeProjectSection:value=>value||'overview',normalizeJournalSection:value=>value||'article',
  navigate:(next,options)=>calls.push({next,options})});
 for(const name of ['routeURL','relatedRoute'])vm.runInContext(source.match(new RegExp('function '+name+'\\([^]*?\\n}'))[0],context);
 for(const name of ['followRoute','followRelated'])vm.runInContext(source.match(new RegExp('function '+name+'\\([^\\n]*'))[0],context);
 return {context,calls};
}
const profile={id:'profile-ines-morel',section:'people',kind:'profile',campus:'lyon'};

test('profile links from projects and chronicles preserve world, country and campus filters',()=>{
 for(const section of ['projects','journal'])for(const [country,campus]of [[null,null],['BRA',null],['BRA','rio']]){
  const route={section,entryId:'source',country,campus,projectTab:'comments',journalTab:'authors',profileProjects:['minishell']};
  const before=JSON.stringify(route),{context}=fixture(route),next=context.relatedRoute(profile);
  assert.equal(next.country,country);assert.equal(next.campus,campus);assert.equal(next.section,'people');assert.equal(next.entryId,profile.id);
  assert.equal(next.profileTab,'overview');assert.equal(next.profileProjects.length,0);assert.equal(JSON.stringify(route),before);
  const href=context.routeURL(next),params=new URLSearchParams(href.split('?')[1]);
  assert.equal(params.get('country'),country);assert.equal(params.get('campus'),campus);
 }
});

test('normal and modified clicks share the preserved destination without breaking native link actions',()=>{
 const {context,calls}=fixture({section:'projects',entryId:'minishell',country:'BRA',campus:'rio'});
 let prevented=0;
 context.followRelated({button:0,preventDefault:()=>prevented++},profile);
 assert.equal(prevented,1);assert.equal(calls.length,1);assert.equal(calls[0].next.country,'BRA');assert.equal(calls[0].next.campus,'rio');assert.equal(calls[0].options.fromDetail,true);
 for(const props of [{button:1},{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true}])context.followRelated({button:0,preventDefault:()=>prevented++,...props},profile);
 assert.equal(prevented,1);assert.equal(calls.length,1);
});

test('the targeted profile fix leaves existing project and article destinations unchanged',()=>{
 const {context}=fixture({section:'people',entryId:profile.id,country:'FRA',campus:'lyon'});
 for(const section of ['projects','journal']){
  const next=context.relatedRoute({id:'other-content',section,kind:section==='projects'?'project':'article',campus:'rio'});
  assert.equal(next.country,'BRA');assert.equal(next.campus,'rio');assert.equal(next.section,section);
 }
});
