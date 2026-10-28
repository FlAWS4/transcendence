import test from 'node:test';
import assert from 'node:assert/strict';
import {createContentPreferences,sortContentEntries,publishedAt,CONTENT_PREFERENCES_KEY,samplePublicationDates} from '../content-preferences.mjs';
import {previewEntries} from '../content-preview-data.mjs';
const ids=previewEntries.map(entry=>entry.id);
function memoryStorage(initial={}){const values=new Map(Object.entries(initial));return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
test('legacy list preference is retained and new changes reload together',()=>{
 const storage=memoryStorage({'horizon-content-view':'list'});
 const state=createContentPreferences({storage,validIds:ids});
 assert.equal(state.snapshot().view,'list');
 state.setPreference('sort','oldest');state.setPreference('favoritesOnly',true);state.toggleFavorite(ids[2]);
 const restored=createContentPreferences({storage,validIds:ids}).snapshot();
 assert.deepEqual(restored,{view:'list',sort:'oldest',project:[],status:[],favoritesOnly:true,favorites:[ids[2]]});
});
test('adding and removing a favorite persist exactly once without duplicate IDs',()=>{
 const storage=memoryStorage(),state=createContentPreferences({storage,validIds:ids});
 assert.equal(state.toggleFavorite(ids[0]),true);assert.equal(state.isFavorite(ids[0]),true);
 assert.deepEqual(JSON.parse(storage.getItem(CONTENT_PREFERENCES_KEY)).favorites,[ids[0]]);
 assert.equal(state.toggleFavorite(ids[0]),false);assert.deepEqual(createContentPreferences({storage,validIds:ids}).snapshot().favorites,[]);
 assert.equal(state.toggleFavorite('not-content'),false);
});
test('malformed or unknown saved settings never add unknown content',()=>{
 const storage=memoryStorage({[CONTENT_PREFERENCES_KEY]:JSON.stringify({view:'tiny',sort:'random',favoritesOnly:'true',favorites:[ids[0],ids[0],'unknown',42]})});
 const state=createContentPreferences({storage,validIds:ids});
 assert.deepEqual(state.snapshot(),{view:'grid',sort:'newest',project:[],status:[],favoritesOnly:false,favorites:[ids[0]]});
 state.setPreference('view','bad');state.setPreference('sort','bad');state.setPreference('favoritesOnly','bad');
 assert.equal(state.snapshot().view,'grid');assert.equal(state.snapshot().sort,'newest');assert.equal(state.snapshot().favoritesOnly,false);
});
test('corrupt JSON and blocked localStorage keep the page usable',()=>{
 const corrupt=createContentPreferences({storage:memoryStorage({[CONTENT_PREFERENCES_KEY]:'{' }),validIds:ids});
 assert.deepEqual(corrupt.snapshot().favorites,[]);
 const blocked=createContentPreferences({storage:()=>{throw Error('blocked');},validIds:ids});
 blocked.setPreference('view','list');assert.equal(blocked.toggleFavorite(ids[0]),true);
 assert.equal(blocked.snapshot().view,'list');assert.deepEqual(blocked.snapshot().favorites,[ids[0]]);
});
test('snapshots cannot mutate the favorite store',()=>{
 const state=createContentPreferences({validIds:ids});state.toggleFavorite(ids[0]);
 const snapshot=state.snapshot();snapshot.favorites.push(ids[1]);snapshot.view='list';
 assert.deepEqual(state.snapshot().favorites,[ids[0]]);assert.equal(state.snapshot().view,'grid');
});
test('restore reflects a favorite changed in another tab and a cleared storage',()=>{
 const storage=memoryStorage(),first=createContentPreferences({storage,validIds:ids}),second=createContentPreferences({storage,validIds:ids});
 second.toggleFavorite(ids[3]);first.restore();assert.equal(first.isFavorite(ids[3]),true);
 storage.removeItem(CONTENT_PREFERENCES_KEY);first.restore();assert.deepEqual(first.snapshot().favorites,[]);
});
test('newest and oldest use publication dates and keep input order unchanged',()=>{
 const entries=[{id:'a',publishedAt:'2026-01-01'},{id:'b',publishedAt:'2026-09-01'},{id:'c',publishedAt:'2026-04-01'}];
 assert.deepEqual(sortContentEntries(entries).map(x=>x.id),['b','c','a']);
 assert.deepEqual(sortContentEntries(entries,{sort:'oldest'}).map(x=>x.id),['a','c','b']);
 assert.deepEqual(entries.map(x=>x.id),['a','b','c']);
});
test('local favorites sort first; dates break ties without inventing public scores',()=>{
 const entries=[{id:'a',publishedAt:'2026-01-01',favoriteCount:999},{id:'b',publishedAt:'2026-09-01'},{id:'c',publishedAt:'2026-04-01'}];
 assert.deepEqual(sortContentEntries(entries,{sort:'favorites',favorites:['a','c']}).map(x=>x.id),['c','a','b']);
 assert.deepEqual(sortContentEntries(entries,{sort:'favorites'}).map(x=>x.id),['b','c','a']);
});
test('favorites-only narrows the already scoped collection and may be empty',()=>{
 const projects=previewEntries.filter(entry=>entry.section==='projects');
 assert.deepEqual(sortContentEntries(projects,{favoritesOnly:true,favorites:[ids[0],ids[4]]}).map(x=>x.id),[ids[0]]);
 assert.deepEqual(sortContentEntries(projects,{favoritesOnly:true,favorites:[ids[4]]}),[]);
});
test('missing dates remain last in both directions, tied dates stay stable',()=>{
 const entries=[{id:'a'},{id:'b',publishedAt:'2026-01-01'},{id:'c',publishedAt:'invalid'},{id:'d',publishedAt:'2026-01-01'}];
 for(const sort of ['oldest','newest'])assert.deepEqual(sortContentEntries(entries,{sort}).map(x=>x.id),['b','d','a','c']);
});
test('all eight sample entries have explicitly separated illustrative dates',()=>{
 assert.equal(Object.keys(samplePublicationDates).length,previewEntries.length);
 for(const entry of previewEntries){assert.match(publishedAt(entry),/^2026-\d{2}-\d{2}$/);assert.ok(Number.isFinite(Date.parse(publishedAt(entry))));}
});

test('saved journey favorites migrate to their public profiles without duplication',()=>{
 const storage=memoryStorage({[CONTENT_PREFERENCES_KEY]:JSON.stringify({favorites:['old-journey','profile-person','project','unknown']})});
 const state=createContentPreferences({storage,validIds:['profile-person','project'],idAliases:{'old-journey':'profile-person'}});
 assert.deepEqual(state.snapshot().favorites,['profile-person','project']);
 state.toggleFavorite('profile-person');
 assert.deepEqual(createContentPreferences({storage,validIds:['profile-person','project'],idAliases:{'old-journey':'profile-person'}}).snapshot().favorites,['project']);
});

test('project and status filters persist independently with other preferences',()=>{
 const storage=memoryStorage(),state=createContentPreferences({storage,validIds:ids});
 state.setPreference('project','cub3d');
 state.setPreference('status','transcender');
 state.setPreference('sort','oldest');
 state.toggleFavorite(ids[0]);
 const restored=createContentPreferences({storage,validIds:ids}).snapshot();
 assert.deepEqual(restored.project,['cub3d']);
 assert.deepEqual(restored.status,['transcender']);
 assert.equal(restored.sort,'oldest');
 assert.deepEqual(restored.favorites,[ids[0]]);
 state.setPreference('project','all');
 assert.deepEqual(state.snapshot().status,['transcender']);
});
test('unknown category values restore safely without losing favorites or views',()=>{
 const storage=memoryStorage({[CONTENT_PREFERENCES_KEY]:JSON.stringify({view:'list',project:'unknown',status:'administrator',favorites:[ids[0]]})});
 const state=createContentPreferences({storage,validIds:ids});
 assert.deepEqual(state.snapshot().project,[]);assert.deepEqual(state.snapshot().status,[]);
 assert.equal(state.snapshot().view,'list');assert.deepEqual(state.snapshot().favorites,[ids[0]]);
 state.setPreference('project','not-a-project');state.setPreference('status','not-a-status');
 assert.deepEqual(state.snapshot().project,[]);assert.deepEqual(state.snapshot().status,[]);
});

test('multiple choices persist, snapshots are isolated, and all clears every choice',()=>{
 const storage=memoryStorage(),state=createContentPreferences({storage,validIds:ids});
 state.setPreference('project',['cub3d','minishell','cub3d','unknown']);
 state.setPreference('status',['student','transcender']);
 assert.deepEqual(state.snapshot().project,['cub3d','minishell']);
 assert.deepEqual(state.snapshot().status,['student','transcender']);
 const snapshot=state.snapshot();snapshot.project.push('personal');snapshot.status.length=0;
 assert.deepEqual(createContentPreferences({storage,validIds:ids}).snapshot().project,['cub3d','minishell']);
 assert.deepEqual(state.snapshot().status,['student','transcender']);
 state.setPreference('status',['all','alumni']);
 assert.deepEqual(state.snapshot().status,[]);
 assert.deepEqual(state.snapshot().project,['cub3d','minishell']);
 state.setPreference('project',[]);
 assert.deepEqual(createContentPreferences({storage,validIds:ids}).snapshot().project,[]);
});
test('single-choice category settings migrate to multiple selections',()=>{
 const storage=memoryStorage({[CONTENT_PREFERENCES_KEY]:JSON.stringify({project:'cub3d',status:'alumni'})});
 const state=createContentPreferences({storage,validIds:ids});
 assert.deepEqual(state.snapshot().project,['cub3d']);assert.deepEqual(state.snapshot().status,['alumni']);
 state.setPreference('project',['cub3d','so_long']);
 assert.deepEqual(createContentPreferences({storage,validIds:ids}).snapshot().project,['cub3d','so_long']);
});


test('status and arrival selections persist together and All resets both facets',()=>{
 const storage=memoryStorage(),state=createContentPreferences({storage,validIds:ids});
 state.setPreference('status',['student','transcender','arrival:2023','arrival:2024','arrival:2023']);
 state.setPreference('project',['cub3d']);state.setPreference('view','list');state.toggleFavorite(ids[0]);
 const restored=createContentPreferences({storage,validIds:ids}).snapshot();
 assert.deepEqual(restored.status,['student','transcender','arrival:2023','arrival:2024']);
 assert.deepEqual(restored.project,['cub3d']);assert.equal(restored.view,'list');assert.deepEqual(restored.favorites,[ids[0]]);
 restored.status.push('arrival:2022');assert.equal(state.snapshot().status.length,4);
 state.setPreference('status',['arrival:2024','all','alumni']);
 assert.deepEqual(createContentPreferences({storage,validIds:ids}).snapshot().status,[]);
 assert.deepEqual(state.snapshot().project,['cub3d']);
});

test('old status preferences and saved years restore without accepting promotion or malformed tokens',()=>{
 const storage=memoryStorage({[CONTENT_PREFERENCES_KEY]:JSON.stringify({status:'student'})});
 const state=createContentPreferences({storage,validIds:ids});
 assert.deepEqual(state.snapshot().status,['student']);
 state.setPreference('status',['student','arrival:2024','promotion:8','arrival:02024','arrival:2024.5','arrival:9999',null]);
 assert.deepEqual(createContentPreferences({storage,validIds:ids}).snapshot().status,['student','arrival:2024']);
 storage.setItem(CONTENT_PREFERENCES_KEY,JSON.stringify({status:['alumni','arrival:2022','promotion:4','unknown','arrival:2022']}));
 assert.deepEqual(state.restore().status,['alumni','arrival:2022']);
 state.setPreference('status','arrival:2021');
 assert.deepEqual(createContentPreferences({storage,validIds:ids}).snapshot().status,['arrival:2021']);
});
