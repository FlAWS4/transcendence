import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CONTINENTS,WORLD_NAMES,continentIds,continentOfCountry,continentName,matchesContinent} from './continents.mjs';

const {countries,campuses}=JSON.parse(readFileSync(new URL('./campuses.json',import.meta.url),'utf8'));
const campusById=new Map(campuses.map(campus=>[campus.id,campus]));
const sizes=id=>{const members=CONTINENTS.find(continent=>continent.id===id).countries;return [members.length,campuses.filter(campus=>members.includes(campus.country)).length];};

test('every catalogue country belongs to exactly one continent, and the mapping names no other country',()=>{
 assert.equal(countries.length,30);
 for(const {id} of countries){
  const owners=CONTINENTS.filter(continent=>continent.countries.includes(id));
  assert.equal(owners.length,1,id);assert.equal(continentOfCountry(id),owners[0].id);
 }
 assert.deepEqual(CONTINENTS.flatMap(continent=>continent.countries).sort(),countries.map(country=>country.id).sort());
 for(const campus of campuses)assert.ok(continentIds.has(continentOfCountry(campus.country)),campus.id);
 assert.equal(continentOfCountry('TUR'),'asia');assert.deepEqual(campuses.filter(campus=>campus.country==='TUR').map(campus=>campus.id),['istanbul','kocaeli']);
 for(const unknown of ['AUS','fra','',null,undefined])assert.equal(continentOfCountry(unknown),null);
});

test('the four UN M49 regions of the network: Europe 14/32, Asia 11/16, Africa 3/6, Americas 2/4, no Oceania',()=>{
 assert.deepEqual(CONTINENTS.map(({id,m49})=>[id,m49]),[['africa','002'],['americas','019'],['asia','142'],['europe','150']]);
 assert.deepEqual([...continentIds],['africa','americas','asia','europe']);
 assert.deepEqual(Object.fromEntries(CONTINENTS.map(({id})=>[id,sizes(id)])),{europe:[14,32],asia:[11,16],africa:[3,6],americas:[2,4]});
 for(const {id} of CONTINENTS)assert.ok(sizes(id)[1]>=1,id);
 assert.equal(CONTINENTS.reduce((total,{id})=>total+sizes(id)[1],0),58);
 assert.equal(continentIds.has('oceania'),false);
});

test('continent and world names are explicit in French, English and Arabic, with French as fallback',()=>{
 assert.deepEqual(Object.fromEntries(CONTINENTS.map(({id,names})=>[id,names])),{
  africa:{fr:'Afrique',en:'Africa',ar:'أفريقيا'},americas:{fr:'Amériques',en:'Americas',ar:'الأمريكتان'},
  asia:{fr:'Asie',en:'Asia',ar:'آسيا'},europe:{fr:'Europe',en:'Europe',ar:'أوروبا'}
 });
 for(const {id,names} of CONTINENTS)for(const locale of ['fr','en','ar'])assert.equal(continentName(id,locale),names[locale]);
 assert.equal(continentName('americas','de'),'Amériques');assert.equal(continentName('asia'),'Asie');assert.equal(continentName('asia','__proto__'),'Asie');
 for(const unknown of ['oceania','world','',null,undefined])assert.equal(continentName(unknown,'fr'),null);
 // Same labels as A's breadcrumb, read from the unchanged version A source.
 const breadcrumb=[...readFileSync(new URL('../site/welcome.mjs',import.meta.url),'utf8').matchAll(/breadcrumbWorld:'([^']+)'/g)].map(match=>match[1]);
 assert.deepEqual(breadcrumb,[WORLD_NAMES.fr,WORLD_NAMES.en,WORLD_NAMES.ar]);
 assert.deepEqual(WORLD_NAMES,{fr:'Monde',en:'World',ar:'العالم'});
});

test('a continent matches the union of the given campuses; unknown continents and campuses match nothing',()=>{
 assert.equal(matchesContinent(['paris'],'europe',campusById),true);
 assert.equal(matchesContinent(['paris','tokyo','rio'],'asia',campusById),true);
 assert.equal(matchesContinent(['paris','tokyo','rio'],'americas',campusById),true);
 assert.equal(matchesContinent(['paris','tokyo','rio'],'africa',campusById),false);
 assert.equal(matchesContinent(['istanbul'],'asia',campusById),true);assert.equal(matchesContinent(['istanbul'],'europe',campusById),false);
 assert.equal(matchesContinent(['1337-med','antananarivo'],'africa',campusById),true);
 for(const continent of ['oceania','',null,undefined])assert.equal(matchesContinent(['paris','unknown'],continent,campusById),false,String(continent));
 assert.equal(matchesContinent(['unknown'],'europe',campusById),false);
 assert.equal(matchesContinent([],'europe',campusById),false);assert.equal(matchesContinent(undefined,'europe',campusById),false);
 assert.equal(matchesContinent(['paris'],'europe',new Map()),false);assert.equal(matchesContinent(['paris'],'europe'),false);
});

test('the shared mapping cannot be changed by a consumer',()=>{
 for(const value of [CONTINENTS,WORLD_NAMES,...CONTINENTS,...CONTINENTS.flatMap(continent=>[continent.names,continent.countries])])assert.ok(Object.isFrozen(value));
 assert.throws(()=>{CONTINENTS[0].countries.push('AUS');},TypeError);
 assert.throws(()=>{CONTINENTS.sort((a,b)=>b.id.localeCompare(a.id));},TypeError);
 assert.equal(continentOfCountry('AUS'),null);assert.equal(CONTINENTS[0].id,'africa');
});
