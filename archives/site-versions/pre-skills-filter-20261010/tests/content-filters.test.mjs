import test from 'node:test';
import assert from 'node:assert/strict';
import {previewEntries} from '../content-preview-data.mjs';
import {profiles,createDiscoveryEntries,entryAuthors,legacyProfileRoutes} from '../profile-data.mjs';
import {sortContentEntries} from '../content-preferences.mjs';
import {projectFilterOptions,projectFilterGroups,statusFilterOptions,profileFilterOptions,profileFilterGroups,isValidProfileFilterValue,validProjectFilters,validStatusFilters,applyContentCategory} from '../content-filters.mjs';

const entries=createDiscoveryEntries(previewEntries);
const ids=items=>items.map(item=>item.id);
const projects=entries.filter(entry=>entry.section==='projects');
const people=entries.filter(entry=>entry.section==='people');
const articles=entries.filter(entry=>entry.section==='journal');

test('filter options expose stable canonical values and localized labels in all three languages',()=>{
 assert.deepEqual(validProjectFilters,['all','libft','minishell','cub3d','so_long','born2beroot','ft_irc','ft_transcendence','ft_linear_regression','personal']);
 assert.deepEqual(validStatusFilters,['all','student','transcender','alumni']);
 for(const locale of ['fr','en','ar']){
  const projectOptions=projectFilterOptions(locale),statusOptions=statusFilterOptions(locale);
  assert.deepEqual(projectOptions.map(option=>option.value),validProjectFilters);
  assert.deepEqual(statusOptions.map(option=>option.value),validStatusFilters);
  assert.ok([...projectOptions,...statusOptions].every(option=>typeof option.label==='string'&&option.label.length>0));
  assert.equal(projectOptions.find(option=>option.value==='born2beroot').label,'Born2beroot');
 }
 assert.equal(projectFilterOptions('fr')[0].label,'Tous les projets');
 assert.equal(projectFilterOptions('en').at(-1).label,'Personal projects');
 assert.equal(statusFilterOptions('ar')[0].label,'جميع الأعضاء');
 assert.deepEqual(projectFilterOptions('en-GB'),projectFilterOptions('en'));
 assert.deepEqual(statusFilterOptions('AR_ma'),statusFilterOptions('ar'));
 assert.deepEqual(projectFilterOptions('unknown'),projectFilterOptions('fr'));
});

test('each existing project belongs to its requested project type',()=>{
 const expected={minishell:'minishell-under-the-prompt',cub3d:'raycast-find-the-light',ft_irc:'network-messages-between-us',ft_transcendence:'ft-transcendence-building-together',personal:'garden-small-useful-tools'};
 for(const [project,id]of Object.entries(expected)){
  assert.deepEqual(ids(applyContentCategory(entries,{section:'projects',project})),[id]);
  assert.deepEqual(ids(applyContentCategory(projects,{section:'projects',project})),[id]);
 }
});

test('so_long and Born2beroot stay empty until real demonstration entries exist',()=>{
 for(const project of ['so_long','born2beroot'])assert.deepEqual(applyContentCategory(entries,{section:'projects',project}),[]);
 assert.equal(projects.length,5);
 assert.deepEqual(applyContentCategory([{id:'unknown',section:'projects',tags:['so_long']}],{section:'projects',project:'so_long'}),[]);
});

test('student, transcender and alumni are distinct profile filters',()=>{
 const students=applyContentCategory(entries,{section:'people',status:'student'});
 const transcenders=applyContentCategory(entries,{section:'people',status:'transcender'});
 const alumni=applyContentCategory(entries,{section:'people',status:'alumni'});
 assert.equal(students.length,3);assert.equal(alumni.length,2);
 assert.deepEqual(ids(transcenders),['profile-noe-laurent']);
 assert.deepEqual(new Set([...ids(students),...ids(transcenders),...ids(alumni)]),new Set(ids(people)));
 for(const status of validStatusFilters.filter(value=>value!=='all'))assert.ok(applyContentCategory(entries,{section:'people',status}).every(entry=>entry.status===status));
});

test('all preserves the section and selections from other sections cannot hide its content',()=>{
 assert.deepEqual(applyContentCategory(entries,{section:'projects',status:'alumni'}),projects);
 assert.deepEqual(applyContentCategory(entries,{section:'people',project:'born2beroot'}),people);
 for(const project of validProjectFilters)for(const status of validStatusFilters){
  assert.deepEqual(applyContentCategory(entries,{section:'journal',project,status}),articles);
 }
 assert.deepEqual(applyContentCategory(entries,{section:'projects',project:'all',status:'transcender'}),projects);
 assert.deepEqual(applyContentCategory(entries,{section:'people',project:'minishell',status:'all'}),people);
});

test('category composes with campus, favorite-only and chronological sorting',()=>{
 const france=new Set(['paris','lyon']);
 const scoped=entries.filter(entry=>france.has(entry.campus));
 const result=sortContentEntries(applyContentCategory(scoped,{section:'people',status:'transcender'}),{favoritesOnly:true,favorites:['profile-noe-laurent'],sort:'oldest'});
 assert.deepEqual(ids(result),['profile-noe-laurent']);
 assert.deepEqual(sortContentEntries(applyContentCategory(scoped,{section:'people',status:'student'}),{favoritesOnly:true,favorites:['profile-noe-laurent']}),[]);
 assert.deepEqual(applyContentCategory(entries.filter(entry=>entry.campus==='tokyo'),{section:'projects',project:'minishell'}),[]);
});

test('invalid restored selections safely fall back to all without cross-section filtering',()=>{
 for(const value of ['unknown','constructor','__proto__',null,42]){
  assert.deepEqual(applyContentCategory(entries,{section:'projects',project:value}),projects);
  assert.deepEqual(applyContentCategory(entries,{section:'people',status:value}),people);
 }
 assert.deepEqual(applyContentCategory(),[]);
 assert.deepEqual(applyContentCategory(entries),entries);
 assert.deepEqual(applyContentCategory(entries,{section:'explore'}),[]);
});

test('filtering preserves source order, record identity, and the untouched source corpus',()=>{
 const before=JSON.stringify(entries),filtered=applyContentCategory(entries,{section:'people'});
 assert.deepEqual(filtered,people);assert.notEqual(filtered,entries);assert.equal(filtered[0],people[0]);
 filtered.reverse();assert.equal(JSON.stringify(entries),before);
 const options=projectFilterOptions();options[0].label='Changed';options.pop();
 assert.equal(projectFilterOptions()[0].label,'Tous les projets');assert.equal(projectFilterOptions().length,10);
});

test('the Transcender example has a completed common core before an ongoing specialisation',()=>{
 const noe=profiles.find(profile=>profile.id==='profile-noe-laurent');
 assert.equal(noe.status,'transcender');
 assert.equal(noe.milestones[0].date,'2023');
 assert.equal(noe.milestones[1].date,'2024–2025');
 assert.equal(noe.milestones[2].date,'2026');
 assert.equal(noe.milestones[1].label.en,'Common core completed');
 assert.equal(noe.milestones[2].label.en,'Specialisation in progress');
 assert.ok(Number(noe.publishedAt.slice(0,4))>=Number(noe.milestones[2].date));
 for(const locale of ['fr','en','ar']){
  assert.match(noe.bio[locale],/2025/);
  assert.ok(noe.role[locale].length>0&&noe.eyebrow[locale].length>0);
 }
 assert.deepEqual(entryAuthors['minishell-under-the-prompt'],['profile-leila-mansour','profile-noe-laurent']);
 for(const [journeyId,profileId]of Object.entries(legacyProfileRoutes)){
  assert.equal(entries.find(entry=>entry.id===profileId).journey,previewEntries.find(entry=>entry.id===journeyId));
 }
});


test('multiple project or status selections form a union without changing source order',()=>{
 assert.deepEqual(ids(applyContentCategory(entries,{section:'projects',project:['cub3d','minishell']})),['minishell-under-the-prompt','raycast-find-the-light']);
 const current=applyContentCategory(entries,{section:'people',status:['student','transcender']});
 assert.equal(current.length,4);
 assert.deepEqual(current,people.filter(entry=>entry.status==='student'||entry.status==='transcender'));
 assert.deepEqual(applyContentCategory(entries,{section:'projects',project:['so_long','born2beroot']}),[]);
 assert.deepEqual(ids(applyContentCategory(entries,{section:'projects',project:['so_long','minishell']})),['minishell-under-the-prompt']);
});

test('empty, all and unknown-only choices retain all records of the requested section',()=>{
 for(const selection of [[],['all'],'all','',null,undefined,['unknown'],['',null,42],['all','cub3d'],['student','all']]){
  assert.deepEqual(applyContentCategory(entries,{section:'projects',project:selection}),projects);
  assert.deepEqual(applyContentCategory(entries,{section:'people',status:selection}),people);
 }
});

test('duplicate and unknown selections are ignored without masking recognized selections',()=>{
 const selected=['cub3d','unknown','cub3d','minishell',null,'',42];
 const before=[...selected];
 assert.deepEqual(ids(applyContentCategory(entries,{section:'projects',project:selected})),['minishell-under-the-prompt','raycast-find-the-light']);
 assert.deepEqual(selected,before);
 assert.deepEqual(ids(applyContentCategory(entries,{section:'people',status:['transcender','constructor','transcender']})),['profile-noe-laurent']);
 assert.deepEqual(applyContentCategory(entries,{section:'projects',project:['minishell']}),applyContentCategory(entries,{section:'projects',project:'minishell'}));
 assert.deepEqual(applyContentCategory(entries,{section:'people',status:['student']}),applyContentCategory(entries,{section:'people',status:'student'}));
});

test('multiple category choices still intersect campus and favorites, and never filter journal',()=>{
 const paris=entries.filter(entry=>entry.campus==='paris');
 const selected=applyContentCategory(paris,{section:'people',status:['student','transcender']});
 assert.equal(selected.length,2);
 assert.deepEqual(ids(sortContentEntries(selected,{favoritesOnly:true,favorites:['profile-noe-laurent']})),['profile-noe-laurent']);
 assert.deepEqual(applyContentCategory(entries,{section:'journal',project:['minishell','cub3d'],status:['student','transcender']}),articles);
 assert.deepEqual(applyContentCategory(entries,{section:'people',project:['minishell','cub3d']}),people);
});


test('project options keep two localized groups with bulk labels and a direct personal choice',()=>{
 const common=['libft','minishell','cub3d','so_long','born2beroot','ft_irc','ft_transcendence'];
 for(const locale of ['fr','en','ar']){
  const groups=projectFilterGroups(locale),options=projectFilterOptions(locale);
  assert.deepEqual(groups.map(group=>group.value),['common-core','specialization']);
  assert.ok(groups.every(group=>typeof group.label==='string'&&group.label.trim().length>0));
  assert.ok(!Object.hasOwn(options.find(option=>option.value==='all'),'group'));
  for(const option of options.filter(option=>!['all','personal'].includes(option.value)))assert.ok(groups.some(group=>group.value===option.group));
  assert.deepEqual(options.filter(option=>option.group==='common-core').map(option=>option.value),common);
  assert.deepEqual(options.filter(option=>option.group==='specialization').map(option=>option.value),['ft_linear_regression']);
  assert.ok(!Object.hasOwn(options.find(option=>option.value==='personal'),'group'));
  assert.ok(groups.every(group=>typeof group.selectAllLabel==='string'&&group.selectAllLabel.length>0));
  assert.ok(statusFilterOptions(locale).every(option=>!Object.hasOwn(option,'group')));
 }
 assert.deepEqual(projectFilterGroups('fr').map(group=>group.label),['Tronc commun','Spécialisation']);
 assert.deepEqual(projectFilterGroups('en-GB'),projectFilterGroups('en'));
 assert.deepEqual(projectFilterGroups('AR_ma'),projectFilterGroups('ar'));
 assert.deepEqual(projectFilterGroups('unknown'),projectFilterGroups('fr'));
});

test('new grouped project types stay empty and compose with existing selections without invented records',()=>{
 for(const project of ['libft','ft_linear_regression']){
  assert.deepEqual(applyContentCategory(entries,{section:'projects',project}),[]);
  assert.deepEqual(applyContentCategory(entries,{section:'projects',project:[project]}),[]);
 }
 assert.deepEqual(applyContentCategory(entries,{section:'projects',project:['libft','ft_linear_regression']}),[]);
 assert.deepEqual(ids(applyContentCategory(entries,{section:'projects',project:['libft','cub3d','ft_linear_regression','minishell']})),['minishell-under-the-prompt','raycast-find-the-light']);
 assert.deepEqual(applyContentCategory(entries,{section:'journal',project:['libft','ft_linear_regression']}),articles);
 assert.equal(projects.length,5);
 const groups=projectFilterGroups('fr');groups[0].label='Changed';groups.pop();
 assert.equal(projectFilterGroups('fr')[0].label,'Tronc commun');assert.equal(projectFilterGroups('fr').length,2);
});


const cohortProfiles=[
 {id:'cadet-2024',section:'people',status:'student',arrivalYear:2024,promotionNumber:8,campus:'paris'},
 {id:'cadet-2023',section:'people',status:'student',arrivalYear:2023,promotionNumber:7,campus:'paris'},
 {id:'transcender-2023',section:'people',status:'transcender',arrivalYear:2023,promotionNumber:7,campus:'lyon'},
 {id:'alumni-2022',section:'people',status:'alumni',arrivalYear:2022,promotionNumber:4,campus:'paris'},
 {id:'unknown-arrival',section:'people',status:'student',campus:'lyon'},
];

test('profile groups expose statuses and existing arrival years, never promotion numbers',()=>{
 const supplied=[...cohortProfiles,{arrivalYear:2024},{arrivalYear:'2025'},{arrivalYear:2024.5},{arrivalYear:NaN},null];
 for(const locale of ['fr','en','ar']){
  const groups=profileFilterGroups(locale),options=profileFilterOptions(supplied,locale);
  assert.deepEqual(groups.map(group=>group.value),['status','arrival']);
  assert.ok(groups.every(group=>typeof group.label==='string'&&group.label.trim()));
  assert.ok(groups.every(group=>!Object.hasOwn(group,'selectAllLabel')));
  assert.equal(options[0].value,'all');assert.ok(!Object.hasOwn(options[0],'group'));
  assert.deepEqual(options.filter(option=>option.group==='status').map(option=>option.value),['student','transcender','alumni']);
  assert.deepEqual(options.filter(option=>option.group==='arrival').map(option=>option.value),['arrival:2024','arrival:2023','arrival:2022']);
  assert.ok(options.every(option=>option.label&&isValidProfileFilterValue(option.value)));
  assert.ok(!options.some(option=>option.value.startsWith('promotion:')));
 }
 assert.deepEqual(profileFilterGroups('fr').map(group=>group.label),['Statut','Rentrée']);
 assert.deepEqual(profileFilterOptions(supplied,'en-GB'),profileFilterOptions(supplied,'en'));
 assert.deepEqual(profileFilterOptions(supplied,'AR_ma'),profileFilterOptions(supplied,'ar'));
 assert.deepEqual(profileFilterOptions(supplied,'unknown'),profileFilterOptions(supplied,'fr'));
 assert.deepEqual(profileFilterOptions().map(option=>option.value),validStatusFilters);
 const changed=profileFilterOptions(supplied);changed[1].label='Changed';changed.pop();
 assert.equal(profileFilterOptions(supplied)[1].label,'Cadet');
 assert.equal(supplied.length,10);
});

test('profile filters union choices within a facet and intersect status with arrival year',()=>{
 const filter=status=>ids(applyContentCategory(cohortProfiles,{section:'people',status}));
 assert.deepEqual(filter(['arrival:2024','arrival:2023']),['cadet-2024','cadet-2023','transcender-2023']);
 assert.deepEqual(filter(['student','alumni','arrival:2024','arrival:2023']),['cadet-2024','cadet-2023']);
 assert.deepEqual(filter(['transcender','arrival:2024']),[]);
 assert.deepEqual(filter(['transcender','arrival:2023']),['transcender-2023']);
 assert.deepEqual(filter('arrival:2022'),['alumni-2022']);
 assert.deepEqual(filter(['student']),['cadet-2024','cadet-2023','unknown-arrival']);
 const all=ids(cohortProfiles);
 for(const value of [[],['all','student','arrival:2024'],['promotion:8'],['arrival:2024.5'],['arrival:02024']])assert.deepEqual(filter(value),all);
 assert.deepEqual(filter(['student','arrival:2023','arrival:2023','promotion:7','unknown']),['cadet-2023']);
});

test('arrival filters compose with geography and favorites without filtering other sections',()=>{
 const scoped=cohortProfiles.filter(profile=>profile.campus==='paris');
 const filtered=applyContentCategory(scoped,{section:'people',status:['student','arrival:2023','arrival:2024']});
 assert.deepEqual(ids(filtered),['cadet-2024','cadet-2023']);
 assert.deepEqual(ids(sortContentEntries(filtered,{favoritesOnly:true,favorites:['cadet-2023']})),['cadet-2023']);
 assert.deepEqual(applyContentCategory(entries,{section:'projects',status:['arrival:2023','student']}),projects);
 assert.deepEqual(applyContentCategory(entries,{section:'journal',status:['arrival:2023','student']}),articles);
 assert.equal(filtered[0],cohortProfiles[0]);assert.equal(cohortProfiles.length,5);
});

test('profile filter validator rejects malformed years and never enables promotion filtering',()=>{
 for(const value of ['all','student','transcender','alumni','arrival:1900','arrival:2024','arrival:2199'])assert.equal(isValidProfileFilterValue(value),true);
 for(const value of ['promotion:8','arrival:1899','arrival:2200','arrival:02024','arrival:2024.0','arrival:+2024','arrival:2024x','year:2024',2024,null,undefined,{},'constructor','__proto__'])assert.equal(isValidProfileFilterValue(value),false);
});
