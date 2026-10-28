import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getContentCampusIds,contentCampusNames,matchesContentScope} from '../content-geography.mjs';
import {previewEntries} from './legacy-content-fixture.mjs';
import {createDiscoveryEntries} from '../profile-data.mjs';

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
