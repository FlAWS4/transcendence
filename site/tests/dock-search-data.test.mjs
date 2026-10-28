import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {previewEntries as allPreviewEntries} from '../content-preview-data.mjs';
import {createDiscoveryEntries,entryAuthors} from '../profile-data.mjs';
import {normalizeDockSearch,searchDockData} from '../dock-search-data.mjs';

const network=JSON.parse(readFileSync(new URL('../campuses.json',import.meta.url),'utf8'));
// Preserve exact historical ranking expectations while new samples are tested below.
const previewEntries=allPreviewEntries.filter(entry=>!entry.demo);
const corpus={campuses:network.campuses,countries:network.countries,entries:previewEntries};
const search=(query,options={})=>searchDockData({...corpus,query,...options});
const ids=result=>result.results.map(item=>item.id);

test('the expanded public corpus has 78 results per section and every new title is searchable in all three languages',()=>{
 const entries=createDiscoveryEntries(allPreviewEntries);
 assert.equal(entries.length,234);
 for(const section of ['projects','people','journal'])assert.equal(entries.filter(entry=>entry.section===section).length,78);
 for(const entry of entries.filter(item=>item.demo))for(const locale of ['fr','en','ar']){
  const result=searchDockData({...corpus,entries,entryAuthors,locale,query:entry.title[locale],limit:100});
  assert.ok(ids(result).includes(entry.id),entry.id+' '+locale);
  assert.equal(new Set(ids(result)).size,result.results.length);
 }
});

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
  assert.deepEqual(ids(result),['paris','minishell-under-the-prompt','ft-transcendence-building-together','path-learning-to-ask']);
  assert.equal(result.total,4);assert.equal(result.hasMore,false);
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
 assert.equal(expected.length,13);
 for(const [locale,query]of [['fr','France'],['en','France'],['ar','فَرَنْسَا'],['fr','FRA'],['en','fr']]){
  const result=search(query,{locale,limit:20});
  assert.deepEqual(ids(result),expected);assert.equal(result.total,13);assert.equal(result.hasMore,false);
  assert.ok(result.results.every(item=>item.countryId==='FRA'));
 }
 const limited=search('France');assert.equal(limited.results.length,8);assert.equal(limited.total,13);assert.equal(limited.hasMore,true);
});

test('exact campus IDs use relationships, while incomplete names keep lexical matching',()=>{
 assert.deepEqual(ids(search('sao')),['sao','garden-small-useful-tools','path-making-room-to-learn']);
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
 assert.equal(second.results.length,5);assert.equal(second.hasMore,false);
 assert.equal(first.total,13);assert.equal(second.total,13);
 const all=[...ids(first),...ids(second)];
 assert.equal(new Set(all).size,13);assert.deepEqual(all,ids(search('France',{limit:20})));
 assert.ok([...first.results,...second.results].every(item=>item.countryId==='FRA'));
 assert.deepEqual(search('France',{offset:13}),{results:[],total:13,hasMore:false});
 assert.deepEqual(search('France',{offset:-3}),first);
 assert.deepEqual(search('France',{offset:8.9,limit:8}),second);
 assert.equal(search('France',{offset:8,limit:0}).hasMore,true);
 assert.deepEqual(ids(search('Paris',{offset:1,limit:8})),['minishell-under-the-prompt','ft-transcendence-building-together','path-learning-to-ask']);
});


test('profile biography, role, timeline and embedded journey participate in global search',()=>{
 const profile={id:'profile-test',kind:'profile',section:'people',campus:'paris',
  title:{fr:'Leïla Exemple',en:'Leila Example',ar:'ليلى المثال'},summary:{fr:'Étudiante en informatique',en:'Computing student',ar:'طالبة حوسبة'},
  role:{fr:'Étudiante',en:'Student',ar:'طالبة'},bio:{fr:'Curieuse de systèmes distribués',en:'Curious about distributed systems',ar:'مهتمة بالأنظمة الموزعة'},
  milestones:[{date:'2024',label:{fr:'Première Piscine',en:'First Piscine',ar:'أول بيسين'},text:{fr:'Découverte de la coopération',en:'Learning cooperation',ar:'اكتشاف التعاون'}}],
  journey:{title:{fr:'Un nouveau départ',en:'A new beginning',ar:'بداية جديدة'},body:[{heading:{fr:'La question du débogage',en:'The debugging question',ar:'سؤال التنقيح'},text:{fr:'Repérer une fuite mémoire',en:'Find a memory leak',ar:'اكتشاف تسرب الذاكرة'}}]}};
 const local=query=>searchDockData({query,locale:'fr',campuses:network.campuses,countries:network.countries,entries:[profile]});
 for(const query of ['leila','étudiante','systèmes distribués','première piscine','2024 coopération','nouveau départ','fuite mémoire'])assert.deepEqual(ids(local(query)),['profile-test'],query);
 assert.equal(local('distributed systems').total,0);
 assert.deepEqual(ids(searchDockData({query:'distributed systems',locale:'en',entries:[profile]})),['profile-test']);
 assert.deepEqual(ids(searchDockData({query:'تَسَرُّب الذَّاكِرَة',locale:'ar',entries:[profile]})),['profile-test']);
});

test('author names connect a visible profile to its project and journal without changing destinations',()=>{
 const author={id:'profile-visible',kind:'profile',section:'people',campus:'paris',title:{fr:'Amina Martin'},summary:{fr:'Profil illustratif'}};
 const project={id:'project-linked',section:'projects',campus:'lyon',title:{fr:'Un jeu en raycasting'},summary:{fr:'Un projet collectif'},tags:['C']};
 const article={id:'article-linked',section:'journal',campus:'tokyo',title:{fr:'Une soirée entre pairs'}};
 const entryAuthors={'project-linked':['profile-visible'],'article-linked':['profile-visible']};
 const corpus={entries:[project,article,author],entryAuthors,campuses:network.campuses,countries:network.countries};
 assert.deepEqual(ids(searchDockData({...corpus,query:'Amina Martin'})),['profile-visible','project-linked','article-linked']);
 assert.deepEqual(ids(searchDockData({...corpus,query:'Amina raycasting'})),['project-linked']);
 const projectResult=searchDockData({...corpus,query:'Amina raycasting'}).results[0];
 assert.equal(projectResult.entryId,'project-linked');assert.equal(projectResult.campusId,'lyon');assert.equal(projectResult.countryId,'FRA');
 assert.deepEqual(ids(searchDockData({...corpus,query:'Paris'})),['paris','profile-visible']);
});

test('an author omitted from the public corpus adds no searchable identity to a project',()=>{
 const entries=[{id:'project',section:'projects',campus:'paris',title:{fr:'Un projet discret'}}];
 const entryAuthors={project:['hidden-profile']};
 assert.equal(searchDockData({query:'hidden-profile',entries,entryAuthors}).total,0);
 assert.equal(searchDockData({query:'Amina Martin',entries,entryAuthors}).total,0);
 assert.equal(searchDockData({query:'projet',entries,entryAuthors:{project:'hidden-profile'}}).total,1);
});

test('profile result type and route keep the technical people key',()=>{
 const profile={id:'profile-route',kind:'profile',section:'people',campus:'paris',title:{fr:'Sam Exemple'}};
 const result=searchDockData({query:'Sam Exemple',entries:[profile],campuses:network.campuses,countries:network.countries}).results[0];
 assert.equal(result.type,'people');assert.equal(result.section,'people');assert.equal(result.entryId,'profile-route');assert.equal(result.countryId,'FRA');
});

const discoveryEntries=createDiscoveryEntries(previewEntries).filter(entry=>!entry.demo);
const searchDiscovery=(query,options={})=>searchDockData({...corpus,entries:discoveryEntries,entryAuthors,query,...options});

test('the original corpus retains five projects, two articles and six profiles without duplicate journeys',()=>{
 assert.equal(discoveryEntries.length,13);
 assert.equal(discoveryEntries.filter(entry=>entry.section==='projects').length,5);
 assert.equal(discoveryEntries.filter(entry=>entry.section==='journal').length,2);
 assert.equal(discoveryEntries.filter(entry=>entry.kind==='profile').length,6);
 assert.equal(discoveryEntries.some(entry=>entry.id==='path-learning-to-ask'),false);
 assert.equal(discoveryEntries.some(entry=>entry.id==='path-making-room-to-learn'),false);
 for(const [query,expected]of [['Leïla Mansour',['profile-leila-mansour','minishell-under-the-prompt','ft-transcendence-building-together']],
 ['Inès Morel',['profile-ines-morel','raycast-find-the-light','ft-transcendence-building-together','journal-an-evening-debugging','journal-share-the-unfinished']],
 ['Caio Mendes',['profile-caio-mendes','garden-small-useful-tools','journal-share-the-unfinished']]]){
  assert.deepEqual(ids(searchDiscovery(query)),expected);
 }
 assert.deepEqual(ids(searchDiscovery('ليلى منصور',{locale:'ar'})),['profile-leila-mansour','minishell-under-the-prompt','ft-transcendence-building-together']);
});

test('Paris and Tokyo return the campus and all attached active content including profiles',()=>{
 for(const locale of ['fr','en','ar']){
  assert.deepEqual(ids(searchDiscovery('Paris',{locale})),['paris','minishell-under-the-prompt','ft-transcendence-building-together','profile-leila-mansour','profile-noe-laurent']);
  assert.deepEqual(ids(searchDiscovery('Tokyo',{locale})),['tokyo','network-messages-between-us','ft-transcendence-building-together','journal-share-the-unfinished','profile-haru-mizuno']);
 }
});

test('the original journeys remain searchable inside their profile destination in every language',()=>{
 for(const [journeyId,profileId]of [['path-learning-to-ask','profile-leila-mansour'],['path-making-room-to-learn','profile-caio-mendes']]){
  const journey=previewEntries.find(entry=>entry.id===journeyId);
  for(const locale of ['fr','en','ar']){
   const result=searchDiscovery(journey.title[locale],{locale});
   assert.deepEqual(ids(result),[profileId]);assert.equal(result.results[0].entryId,profileId);assert.equal(result.results[0].type,'people');
  }
 }
});

test('active French geography paginates all fifteen results without changing their campus scope',()=>{
 const first=searchDiscovery('France'),second=searchDiscovery('France',{offset:8});
 assert.equal(first.total,15);assert.equal(first.results.length,8);assert.equal(first.hasMore,true);
 assert.equal(second.total,15);assert.equal(second.results.length,7);assert.equal(second.hasMore,false);
 const all=[...first.results,...second.results];
 assert.equal(new Set(all.map(item=>item.id)).size,15);assert.ok(all.every(item=>item.countryId==='FRA'));
 assert.deepEqual(all,searchDiscovery('France',{limit:20}).results);
 assert.equal(all.filter(item=>item.type==='people').length,3);
});

test('each participating campus opens the same project once at the queried place',()=>{
 for(const [query,campusId,countryId] of [['Paris','paris','FRA'],['Lyon','lyon','FRA'],['Tokyo','tokyo','JPN'],['Rio','rio','BRA'],['Japon','tokyo','JPN'],['Brésil','rio','BRA']]){
  const results=searchDiscovery(query,{limit:20}).results.filter(item=>item.entryId==='ft-transcendence-building-together');
  assert.equal(results.length,1,query);
  assert.equal(results[0].campusId,campusId);assert.equal(results[0].countryId,countryId);
  assert.equal(results[0].geographicMatch,true);
  assert.deepEqual(results[0].campusIds,['paris','lyon','tokyo','rio']);
  assert.deepEqual(results[0].countryIds,['FRA','JPN','BRA']);
  assert.equal(results[0].subtitle,'42 Paris · 42 Lyon · 42 Tokyo · 42 Rio');
 }
 assert.equal(searchDiscovery('France',{limit:20}).results.filter(item=>item.entryId==='ft-transcendence-building-together').length,1);
 assert.equal(searchDiscovery('Brésil',{limit:20}).results.filter(item=>item.entryId==='garden-small-useful-tools').length,1);
});

test('text search combines any associated campus or localized country with project terms',()=>{
 for(const [locale,query] of [['fr','Tokyo TypeScript'],['fr','Japon TypeScript'],['en','Japan TypeScript'],['ar','اليابان TypeScript']]){
  const result=searchDiscovery(query,{locale});
  assert.deepEqual(ids(result),['ft-transcendence-building-together'],query);
  assert.equal(result.results[0].geographicMatch,false);
 }
 assert.deepEqual(searchDiscovery('São Paulo CSS').results.filter(item=>item.type==='project').map(item=>item.id),['garden-small-useful-tools']);
});

test('multi-campus matches and repeated supplied records never duplicate project IDs',()=>{
 const project={id:'shared',section:'projects',campus:'paris',campusIds:['paris','lyon','paris','tokyo'],title:{fr:'Un projet commun'}};
 const options={entries:[project,project,{...project}],campuses:network.campuses,countries:network.countries};
 for(const query of ['projet commun','France','Japon']){
  const result=searchDockData({...options,query,limit:20});
  assert.equal(result.results.filter(item=>item.id==='shared').length,1);
  assert.equal(result.total,new Set(result.results.map(item=>item.id)).size);
 }
});

test('an explicit empty project association neither falls back to the old campus nor its authors',()=>{
 const project={id:'unplaced',section:'projects',campus:'paris',campusIds:[],title:{fr:'Un projet indépendant'}};
 const author={id:'author',kind:'profile',section:'people',campus:'tokyo',title:{fr:'Une personne'}};
 const options={entries:[project,author],entryAuthors:{unplaced:['author']},campuses:network.campuses,countries:network.countries};
 for(const query of ['Paris','Tokyo'])assert.ok(!ids(searchDockData({...options,query})).includes('unplaced'));
 const result=searchDockData({...options,query:'projet indépendant'}).results[0];
 assert.equal(result.campusId,null);assert.equal(result.countryId,null);assert.deepEqual(result.campusIds,[]);assert.deepEqual(result.countryIds,[]);
});

test('project search associations remain stable when its lead or authors move campus',()=>{
 const entries=structuredClone(discoveryEntries);
 for(const profile of entries.filter(entry=>entry.kind==='profile'))profile.campus='berlin';
 const project=entries.find(entry=>entry.id==='ft-transcendence-building-together');
 project.leadAuthorId='profile-haru-mizuno';
 for(const query of ['Paris','Tokyo','Rio'])assert.ok(ids(searchDiscovery(query,{entries})).includes(project.id));
 assert.ok(!ids(searchDiscovery('Berlin',{entries})).includes(project.id));
 const result=searchDiscovery('ft_transcendence',{entries}).results[0];
 result.campusIds.push('berlin');result.countryIds.push('DEU');
 assert.deepEqual(project.campusIds,['paris','lyon','tokyo','rio']);
});
