import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {previewEntries} from '../content-preview-data.mjs';
import {normalizeDockSearch,searchDockData} from '../dock-search-data.mjs';

const network=JSON.parse(readFileSync(new URL('../campuses.json',import.meta.url),'utf8'));
const corpus={campuses:network.campuses,countries:network.countries,entries:previewEntries};
const search=(query,options={})=>searchDockData({...corpus,query,...options});
const ids=result=>result.results.map(item=>item.id);

test('empty queries and omitted corpora do not reveal unrelated suggestions',()=>{
 for(const query of ['', '  \n ', '\u0640\u064e'])assert.deepEqual(search(query),{results:[],total:0,hasMore:false});
 assert.deepEqual(searchDockData({query:'Paris'}),{results:[],total:0,hasMore:false});
});

test('campus names match accents, Unicode decomposition and casing',()=>{
 for(const query of ['São Paulo','sao paulo','SA\u0303O PAULO'])assert.equal(search(query).results[0].id,'sao');
 for(const query of ['Québec','quebec','QUE\u0301BEC'])assert.equal(search(query).results[0].id,'quebec');
});

test('countries are searchable and displayed in the current interface language',()=>{
 for(const [locale,query,label]of [['fr','Japon','Japon'],['en','Japan','Japan'],['ar','اليَابَان','اليابان']]){
  const result=search(query,{locale});
  const campus=result.results.find(item=>item.id==='tokyo');
  assert.equal(campus.subtitle,label);assert.equal(campus.countryId,'JPN');
  assert.ok(ids(result).includes('network-messages-between-us'));
  assert.ok(ids(result).includes('journal-share-the-unfinished'));
 }
});

test('Arabic harakat, hamza decomposition and tatweel do not prevent title matches',()=>{
 const result=search('تَعَلُّم طَرْح السُّؤَال',{locale:'ar'});
 assert.equal(result.results[0].id,'path-learning-to-ask');
 assert.equal(result.results[0].title,'تعلّم طرح السؤال المناسب');
 assert.equal(normalizeDockSearch('الــأَوَامِر','ar'),normalizeDockSearch('الاوامر','ar'));
 assert.equal(search('الــأَوَامِر',{locale:'ar'}).results[0].id,'minishell-under-the-prompt');
});

test('editorial titles and searchable body copy follow the selected language',()=>{
 const english=search('a doorway into the third',{locale:'en-GB'}).results[0];
 assert.equal(english.id,'raycast-find-the-light');assert.equal(english.type,'project');
 assert.equal(english.title,'A doorway into the third dimension');
 assert.equal(english.section,'projects');assert.equal(english.entryId,english.id);
 assert.equal(english.campusId,'lyon');assert.equal(english.countryId,'FRA');
 assert.equal(search('a doorway into the third',{locale:'fr'}).total,0);
 assert.ok(ids(search('premier couloir')).includes('raycast-find-the-light'));
});

test('all query words must occur, and can span a campus and technical tags',()=>{
 assert.deepEqual(ids(search('paris parsing')),['minishell-under-the-prompt']);
 assert.equal(search('paris sockets').total,0);
 assert.deepEqual(ids(search('C++')),['network-messages-between-us']);
 assert.deepEqual(ids(search('minishell')),['minishell-under-the-prompt']);
});

test('a whole campus name returns its campus and every attached story, not address mentions',()=>{
 for(const locale of ['fr','en','ar'])for(const query of ['Paris','42 Paris','42Paris','  PARIS  ']){
  const result=search(query,{locale});
  assert.deepEqual(ids(result),['paris','minishell-under-the-prompt','path-learning-to-ask']);
  assert.equal(result.total,3);assert.equal(result.hasMore,false);
  assert.equal(result.results[0].type,'campus');assert.equal(result.results[0].countryId,'FRA');
  assert.equal(result.results[0].section,'explore');assert.equal(result.results[0].entryId,null);
  assert.ok(result.results.every(item=>item.campusId==='paris'));
 }
 // The official Lyon address contains Paris, but is not a relationship to Paris.
 assert.match(network.campuses.find(campus=>campus.id==='lyon').address,/Paris/i);
});

test('whole localized country names and ISO codes return only their campuses and attached stories',()=>{
 const frenchCampuses=network.campuses.filter(campus=>campus.country==='FRA').map(campus=>campus.id);
 const expected=[...frenchCampuses,...previewEntries.filter(entry=>frenchCampuses.includes(entry.campus)).map(entry=>entry.id)];
 assert.equal(expected.length,12);
 for(const [locale,query]of [['fr','France'],['en','France'],['ar','فَرَنْسَا'],['fr','FRA'],['en','fr']]){
  const result=search(query,{locale,limit:20});
  assert.deepEqual(ids(result),expected);assert.equal(result.total,12);assert.equal(result.hasMore,false);
  assert.ok(result.results.every(item=>item.countryId==='FRA'));
 }
 const limited=search('France');assert.equal(limited.results.length,8);assert.equal(limited.total,12);assert.equal(limited.hasMore,true);
});

test('exact campus IDs use relationships, while incomplete names keep lexical matching',()=>{
 assert.deepEqual(ids(search('sao')),['sao','path-making-room-to-learn']);
 assert.deepEqual(ids(search('le-havre')),['le-havre']);
 const partial=search('pari');assert.ok(ids(partial).includes('paris'));assert.ok(ids(partial).includes('lyon'));
});

test('search stays global when the caller also carries a current route or geographic context',()=>{
 const result=search('Tokyo',{scope:{country:'FRA',campus:'paris'},section:'people'});
 assert.deepEqual(new Set(result.results.map(item=>item.type)),new Set(['campus','project','journal']));
 assert.ok(result.results.every(item=>item.campusId==='tokyo'));
});

test('only the records supplied by the caller are exposed',()=>{
 const result=searchDockData({query:'Paris',countries:network.countries,campuses:network.campuses.filter(campus=>campus.id==='paris'),
  entries:previewEntries.filter(entry=>entry.id==='path-learning-to-ask')});
 assert.deepEqual(ids(result),['paris','path-learning-to-ask']);
 assert.equal(searchDockData({query:'minishell',entries:[]}).total,0);
});

test('results are bounded, deterministic and report omitted matches accurately',()=>{
 const small=search('42',{limit:3}),again=search('42',{limit:3}),large=search('42',{limit:1000});
 assert.deepEqual(small,again);assert.equal(small.results.length,3);assert.equal(small.hasMore,true);
 assert.equal(large.results.length,20);assert.equal(large.total,small.total);
 const empty=search('42',{limit:0});assert.equal(empty.results.length,0);assert.equal(empty.hasMore,true);
 assert.deepEqual(search('definitely-no-horizon-record'),{results:[],total:0,hasMore:false});
});

test('search and result edits never mutate the catalogue or source stories',()=>{
 const before=JSON.stringify(corpus),result=search('Paris');
 result.results[0].title='Changed result';result.results.reverse();
 assert.equal(JSON.stringify(corpus),before);assert.equal(search('Paris').results[0].title,'42 Paris');
});

test('geographic results paginate without omissions, duplicates or unrelated matches',()=>{
 const first=search('France',{limit:8}),second=search('France',{offset:8,limit:8});
 assert.equal(first.results.length,8);assert.equal(first.hasMore,true);
 assert.equal(second.results.length,4);assert.equal(second.hasMore,false);
 assert.equal(first.total,12);assert.equal(second.total,12);
 const all=[...ids(first),...ids(second)];
 assert.equal(new Set(all).size,12);assert.deepEqual(all,ids(search('France',{limit:20})));
 assert.ok([...first.results,...second.results].every(item=>item.countryId==='FRA'));
 assert.deepEqual(search('France',{offset:12}),{results:[],total:12,hasMore:false});
 assert.deepEqual(search('France',{offset:-3}),first);
 assert.deepEqual(search('France',{offset:8.9,limit:8}),second);
 assert.equal(search('France',{offset:8,limit:0}).hasMore,true);
 assert.deepEqual(ids(search('Paris',{offset:1,limit:8})),['minishell-under-the-prompt','path-learning-to-ask']);
});
