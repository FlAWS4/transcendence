import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getContentCampusIds,contentCampusNames,matchesContentScope} from '../content-geography.mjs';
import {previewEntries} from './legacy-content-fixture.mjs';
import {createDiscoveryEntries} from '../profile-data.mjs';
import {previewEntries as siteEntries} from '../content-preview-data.mjs';
import {CONTINENTS,continentOfCountry} from '../continents.mjs';
// Version A's module, read only: B must keep its answers for every scope A can express.
import {matchesContentScope as matchesContentScopeA} from '../../site/content-geography.mjs';

const {campuses}=JSON.parse(readFileSync(new URL('../campuses.json',import.meta.url),'utf8'));
const projects=previewEntries.filter(entry=>entry.section==='projects');
const shared=projects.find(entry=>entry.id==='ft-transcendence-building-together');

test('project associations are explicit, normalized and independent of historical campus',()=>{
 const entry={section:'projects',campus:'rio',campusIds:[' paris ','tokyo','paris','',null,42,'  ']};
 assert.deepEqual(getContentCampusIds(entry),['paris','tokyo']);
 assert.deepEqual(getContentCampusIds({...entry,campusIds:[]}),[]);
 assert.deepEqual(getContentCampusIds({...entry,campusIds:[' ',null]}),[]);
 const result=getContentCampusIds(entry);result.push('lyon');
 assert.equal(entry.campusIds.length,7);
});

test('older projects remain compatible while articles and profiles keep their own campus',()=>{
 assert.deepEqual(getContentCampusIds({section:'projects',campus:' paris '}),['paris']);
 for(const section of ['journal','people'])assert.deepEqual(getContentCampusIds({section,campus:'tokyo',campusIds:['paris','lyon']}),['tokyo']);
 for(const entry of [undefined,null,{}, {section:'projects',campus:42}])assert.deepEqual(getContentCampusIds(entry),[]);
});

test('world, every participating campus and the union of their countries contain one shared project',()=>{
 for(const scope of [{},{country:'FRA'},{country:'JPN'},{country:'BRA'},{campus:'paris'},{campus:'lyon'},{campus:'tokyo'},{campus:'rio'}]){
  const selected=projects.filter(entry=>matchesContentScope(entry,scope,campuses));
  assert.equal(selected.filter(entry=>entry.id===shared.id).length,1,JSON.stringify(scope));
 }
 assert.equal(projects.filter(entry=>matchesContentScope(entry,{},campuses)).length,5);
 for(const scope of [{country:'DEU'},{campus:'sao'},{country:'FRA',campus:'tokyo'}])assert.equal(matchesContentScope(shared,scope,campuses),false);
 assert.equal(matchesContentScope(shared,{country:'JPN',campus:'tokyo'},campuses),true);
});

test('unknown or unassigned places remain visible worldwide without matching an unrelated country',()=>{
 for(const entry of [{section:'projects',campus:'paris',campusIds:[]},{section:'projects',campusIds:['unknown']}]){
  assert.equal(matchesContentScope(entry,{},campuses),true);
  assert.equal(matchesContentScope(entry,{country:'FRA'},campuses),false);
  assert.equal(matchesContentScope(entry,{campus:'paris'},campuses),false);
 }
 assert.equal(matchesContentScope(shared,{country:'FRA'}),false);
});

test('fictional project campus snapshots cover their original teams without changing the articles',()=>{
 assert.deepEqual(Object.fromEntries(projects.map(entry=>[entry.id,getContentCampusIds(entry)])),{
  'minishell-under-the-prompt':['paris'],
  'raycast-find-the-light':['lyon'],
  'network-messages-between-us':['tokyo'],
  'garden-small-useful-tools':['rio','sao'],
  'ft-transcendence-building-together':['paris','lyon','tokyo','rio']
 });
 for(const article of previewEntries.filter(entry=>entry.section==='journal')){
  assert.equal(Object.hasOwn(article,'campusIds'),false);
  assert.deepEqual(getContentCampusIds(article),[article.campus]);
 }
});

test('campus changes and project responsibility do not rewrite publication geography',()=>{
 const entries=structuredClone(createDiscoveryEntries(previewEntries));
 const project=entries.find(entry=>entry.id===shared.id);
 for(const profile of entries.filter(entry=>entry.kind==='profile'))profile.campus='berlin';
 project.leadAuthorId='profile-haru-mizuno';
 assert.deepEqual(getContentCampusIds(project),['paris','lyon','tokyo','rio']);
 assert.equal(matchesContentScope(project,{country:'DEU'},campuses),false);
 assert.equal(matchesContentScope(project,{campus:'tokyo'},campuses),true);
});

test('display labels preserve association order with a readable fallback',()=>{
 const campusName=id=>campuses.find(campus=>campus.id===id)?.name;
 assert.deepEqual(contentCampusNames(shared,campusName),['42 Paris','42 Lyon','42 Tokyo','42 Rio']);
 assert.deepEqual(contentCampusNames({section:'projects',campusIds:['paris','unknown']},campusName),['42 Paris','unknown']);
 assert.deepEqual(contentCampusNames({section:'projects',campusIds:[]},campusName),[]);
});

// Continent cases (version B). The lists are built as welcome.mjs builds them.
const discoveryEntries=createDiscoveryEntries(siteEntries);
const listCounts=scope=>['projects','people','journal'].map(section=>discoveryEntries.filter(entry=>entry.section===section&&matchesContentScope(entry,scope,campuses)).length);
const continentsOf=entry=>new Set(getContentCampusIds(entry).map(id=>continentOfCountry(campuses.find(campus=>campus.id===id)?.country)).filter(Boolean));

test('continent lists of the site data: Europe 44/42/42, Asia 25/20/20, Africa 10/9/11, Americas 9/7/5 (projects/profiles/chronicles)',()=>{
 assert.deepEqual(Object.fromEntries(CONTINENTS.map(({id})=>[id,listCounts({continent:id,country:null,campus:null})])),{europe:[44,42,42],asia:[25,20,20],africa:[10,9,11],americas:[9,7,5]});
 for(const world of [{},{continent:null,country:null,campus:null},{continent:''}])assert.deepEqual(listCounts(world),[78,78,78]);
});

test('a continent contains exactly the union of its countries, which contain their campuses',()=>{
 for(const {id,countries} of CONTINENTS){
  for(const entry of discoveryEntries)assert.equal(matchesContentScope(entry,{continent:id},campuses),countries.some(country=>matchesContentScopeA(entry,{country},campuses)),`${id} ${entry.id}`);
 }
 for(const campus of campuses){
  const continent=continentOfCountry(campus.country);
  for(const entry of discoveryEntries){
   if(matchesContentScope(entry,{country:campus.country,campus:campus.id},campuses))assert.ok(matchesContentScope(entry,{country:campus.country},campuses),`${campus.id} ${entry.id}`);
   if(matchesContentScope(entry,{country:campus.country},campuses))assert.ok(matchesContentScope(entry,{continent},campuses),`${campus.country} ${entry.id}`);
  }
 }
 // Paris and Lyon are both in Europe: the shared project is still one record of the European list.
 assert.equal(discoveryEntries.filter(entry=>matchesContentScope(entry,{continent:'europe'},campuses)&&entry.id===shared.id).length,1);
});

test('a project spanning several continents is counted once in each of them',()=>{
 assert.deepEqual([...continentsOf(shared)].sort(),['americas','asia','europe']);
 for(const {id} of CONTINENTS)assert.equal(matchesContentScope(shared,{continent:id},campuses),id!=='africa',id);
 const discoveryProjects=discoveryEntries.filter(entry=>entry.section==='projects');
 assert.equal(discoveryProjects.filter(entry=>continentsOf(entry).size>1).length,9);
 const memberships=CONTINENTS.reduce((total,{id})=>total+discoveryProjects.filter(entry=>matchesContentScope(entry,{continent:id},campuses)).length,0);
 assert.equal(memberships,88);assert.equal(memberships,discoveryProjects.reduce((total,entry)=>total+continentsOf(entry).size,0));
 const acrossTerminals=discoveryProjects.find(entry=>entry.id==='demo-project-across-the-terminals');
 assert.deepEqual(CONTINENTS.filter(({id})=>matchesContentScope(acrossTerminals,{continent:id},campuses)).map(({id})=>id),['africa','asia']);
});

test('unknown or unassigned places stay in World only, and a continent without the catalogue matches nothing',()=>{
 for(const entry of [{section:'projects',campus:'paris',campusIds:[]},{section:'projects',campusIds:['unknown']},{section:'journal'},{section:'people',campus:'nowhere'}]){
  assert.equal(matchesContentScope(entry,{},campuses),true);assert.equal(matchesContentScope(entry,{continent:null},campuses),true);
  for(const {id} of CONTINENTS)assert.equal(matchesContentScope(entry,{continent:id},campuses),false,id);
 }
 assert.equal(matchesContentScope(shared,{continent:'europe'}),false);assert.equal(matchesContentScope(shared,{continent:'europe'},[]),false);
 for(const continent of ['oceania','world','EUROPE'])assert.equal(matchesContentScope(shared,{continent},campuses),false,continent);
 // A country or a campus always wins: the continent that comes with it is never read.
 assert.equal(matchesContentScope(shared,{continent:'africa',country:'FRA'},campuses),true);
 assert.equal(matchesContentScope(shared,{continent:'europe',country:'DEU'},campuses),false);
 assert.equal(matchesContentScope(shared,{continent:'africa',campus:'tokyo'},campuses),true);
 assert.equal(matchesContentScope(shared,{continent:'asia',country:'FRA',campus:'tokyo'},campuses),false);
});

test('every scope version A can express gives A’s result for every entry, whatever continent comes with it',()=>{
 const countryIds=[...new Set(campuses.map(campus=>campus.country))],otherCountry=id=>id==='FRA'?'JPN':'FRA',otherContinent=id=>id==='europe'?'africa':'europe';
 assert.equal(countryIds.length,30);
 const scopes=[{},{country:null,campus:null},{country:'',campus:''},{country:'ZZZ'},{campus:'nowhere'},{country:'FRA',campus:'nowhere'},
  ...countryIds.map(country=>({country})),...campuses.flatMap(({id,country})=>[{campus:id},{country,campus:id},{country:otherCountry(country),campus:id}])];
 // What B may receive instead: A's object, a route (continent null), a scope with its derived continent, a stale or unknown one.
 const variants=scope=>{
  if(!scope.country&&!scope.campus)return [scope,{...scope,continent:null},{...scope,continent:''}];
  const own=continentOfCountry(scope.country||campuses.find(campus=>campus.id===scope.campus)?.country);
  return [scope,{...scope,continent:null},{...scope,continent:own},{...scope,continent:otherContinent(own)},{...scope,continent:'oceania'}];
 };
 const entries=[...discoveryEntries,...previewEntries,{section:'projects',campusIds:['unknown']},{section:'projects',campus:'paris',campusIds:[]},
  {section:'projects',campus:' tokyo '},{section:'journal',campus:'paris',campusIds:['lyon']},{section:'people'},{},null,undefined];
 // welcome.mjs's catalogue before campuses.json has loaded.
 const sampleCampuses=[{id:'paris',name:'42 Paris',country:'FRA'},{id:'lyon',name:'42 Lyon',country:'FRA'},{id:'tokyo',name:'42 Tokyo',country:'JPN'},{id:'rio',name:'42 Rio',country:'BRA'},{id:'sao',name:'42 São Paulo',country:'BRA'}];
 let checked=0;
 for(const places of [campuses,sampleCampuses,[],undefined])for(const scope of scopes){
  const expected=entries.map(entry=>matchesContentScopeA(entry,scope,places));
  for(const variant of variants(scope)){assert.deepEqual(entries.map(entry=>matchesContentScope(entry,variant,places)),expected,JSON.stringify(variant));checked+=entries.length;}
 }
 assert.ok(checked>1000000,String(checked));
});
