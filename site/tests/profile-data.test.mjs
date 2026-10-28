import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {previewEntries} from '../content-preview-data.mjs';
import {profiles,profileById,entryAuthors,legacyProfileRoutes,getAuthors,getProfileEntries,createDiscoveryEntries} from '../profile-data.mjs';

const network=JSON.parse(readFileSync(new URL('../campuses.json',import.meta.url),'utf8'));
const corpus=createDiscoveryEntries(previewEntries);
const localized=value=>{
  for(const locale of ['fr','en','ar'])assert.equal(typeof value[locale],'string');
  assert.ok(['fr','en','ar'].every(locale=>value[locale].trim().length>0));
};

test('the directory has 78 distinct fictional people and preserves the six original campus assignments',()=>{
  assert.equal(profiles.length,78);
  assert.equal(new Set(profiles.map(profile=>profile.id)).size,78);
  assert.equal(new Set(profiles.map(profile=>profile.title.fr)).size,78);
  assert.deepEqual(profiles.filter(profile=>!profile.demo).reduce((counts,profile)=>({...counts,[profile.campus]:(counts[profile.campus]||0)+1}),{}),{paris:2,lyon:1,tokyo:1,rio:1,sao:1});
  for(const profile of profiles){
    assert.ok(network.campuses.some(campus=>campus.id===profile.campus));
    assert.equal(profileById.get(profile.id),profile);
    assert.equal(profile.kind,'profile');assert.equal(profile.section,'people');
    assert.ok(profile.id.startsWith('profile-'));
    assert.ok(['student','transcender','alumni'].includes(profile.status));
    assert.match(profile.publishedAt,/^2026-\d{2}-\d{2}$/);
    assert.ok(Number.isFinite(Date.parse(profile.publishedAt)));
    assert.ok(!('favoriteCount' in profile)&&!('followers' in profile));
  }
});

test('every profile has localized identity, introduction and before/during/current-or-after milestones',()=>{
  for(const profile of profiles){
    for(const field of ['title','summary','eyebrow','role','bio'])localized(profile[field]);
    assert.ok(profile.tags.length>=2);assert.equal(profile.milestones.length,3);
    for(const milestone of profile.milestones){
      assert.equal(typeof milestone.date,'string');localized(milestone.label);localized(milestone.text);
    }
    assert.equal(profile.milestones[0].label.en,'Before 42');
    assert.equal(profile.milestones.at(-1).label.en,({student:'Today',transcender:'Specialisation in progress',alumni:'After 42'})[profile.status]);
  }
});

test('portraits reuse the six local standalone SVG assets without remote resources',()=>{
  const drawings=new Set();
  for(const profile of profiles){
    assert.match(profile.avatar,/^\.\/assets\/profile-avatars\/[a-z-]+\.svg$/);
    const svg=readFileSync(new URL('../'+profile.avatar,import.meta.url),'utf8');
    assert.match(svg,/viewBox="0 0 256 256"/);assert.match(svg,/fictional illustrated portrait/);
    assert.doesNotMatch(svg,/<script|<foreignObject|<image|(?:href|src)=/i);
    drawings.add(svg);
  }
  assert.equal(drawings.size,6);
});

test('all original editorial samples have known unique authors and at least one author from their campus',()=>{
  assert.deepEqual(Object.keys(entryAuthors).sort(),previewEntries.map(entry=>entry.id).sort());
  for(const entry of previewEntries){
    const authors=getAuthors(entry);
    assert.ok(authors.length>=1);assert.equal(authors.length,new Set(entryAuthors[entry.id]).size);
    assert.equal(authors.length,entryAuthors[entry.id].length);
    assert.ok(authors.every(author=>profileById.has(author.id)));
    assert.ok(authors.some(author=>author.campus===entry.campus));
    assert.deepEqual(authors,getAuthors(entry.id));
  }
  assert.equal(getAuthors('minishell-under-the-prompt').length,2);
  assert.equal(getAuthors('raycast-find-the-light').length,1);
  assert.deepEqual(getAuthors('garden-small-useful-tools').map(author=>author.campus),['rio','sao']);
});

test('each directory profile has a project and reverse relations retain source ordering',()=>{
  for(const profile of profiles){
    const linked=getProfileEntries(profile.id,previewEntries);
    assert.ok(linked.some(entry=>entry.section==='projects'));
    assert.deepEqual(linked,previewEntries.filter(entry=>entryAuthors[entry.id].includes(profile.id)));
    assert.deepEqual(getProfileEntries(profile.id,previewEntries,{section:'journal'}),linked.filter(entry=>entry.section==='journal'));
  }
});

test('the collective project and article retain every author in discovery and reverse contributions',()=>{
  for(const [id,total,section] of [['ft-transcendence-building-together',5,'projects'],['journal-share-the-unfinished',4,'journal']]){
    const entry=corpus.find(item=>item.id===id),authors=getAuthors(entry);
    assert.equal(authors.length,total);
    assert.deepEqual(entry.authorIds,authors.map(author=>author.id));
    for(const author of authors)assert.ok(getProfileEntries(author.id,corpus,{section}).includes(entry));
  }
});

test('sample responsibilities are explicit author references and survive discovery without changing collaboration order',()=>{
 const entries=previewEntries.filter(entry=>entry.section==='projects'||entry.section==='journal');
 assert.equal(entries.length,156);
 for(const entry of entries){
  assert.equal(typeof entry.leadAuthorId,'string');
  assert.ok(getAuthors(entry).some(author=>author.id===entry.leadAuthorId));
  const discovered=corpus.find(item=>item.id===entry.id);
  assert.equal(discovered.leadAuthorId,entry.leadAuthorId);
  assert.deepEqual(discovered.authorIds,entryAuthors[entry.id]);
 }
 const project=entries.find(entry=>entry.id==='ft-transcendence-building-together');
 const article=entries.find(entry=>entry.id==='journal-share-the-unfinished');
 assert.equal(entryAuthors[project.id].indexOf(project.leadAuthorId),4);
 assert.equal(entryAuthors[article.id].indexOf(article.leadAuthorId),3);
});

test('legacy journey IDs resolve once to their author profile without a route cycle',()=>{
  assert.equal(Object.keys(legacyProfileRoutes).length,2);
  for(const [oldId,profileId]of Object.entries(legacyProfileRoutes)){
    const profile=profileById.get(profileId),journey=previewEntries.find(entry=>entry.id===oldId);
    assert.ok(profile&&journey);assert.equal(journey.section,'people');
    assert.equal(profile.journeyEntryId,oldId);
    assert.deepEqual(entryAuthors[oldId],[profileId]);
    assert.equal(legacyProfileRoutes[profileId],undefined);
    assert.ok(!Object.keys(legacyProfileRoutes).includes(profileId));
  }
});

test('discovery keeps 78 records per list and both original journeys inside their profiles',()=>{
  assert.equal(corpus.length,234);
  assert.equal(corpus.filter(entry=>entry.section==='projects').length,78);
  assert.equal(corpus.filter(entry=>entry.section==='journal').length,78);
  assert.equal(corpus.filter(entry=>entry.kind==='profile').length,78);
  assert.equal(new Set(corpus.map(entry=>entry.id)).size,234);
  assert.ok(corpus.every(entry=>!Object.hasOwn(legacyProfileRoutes,entry.id)));
  for(const original of previewEntries){
    if(original.section==='people'){
      const owner=corpus.find(profile=>profile.id===legacyProfileRoutes[original.id]);
      assert.equal(owner.journey,original);assert.deepEqual(owner.journey.body,original.body);
    }else{
      const current=corpus.find(entry=>entry.id===original.id);
      const {authorIds,...copy}=current;
      assert.deepEqual(copy,original);assert.deepEqual(authorIds,entryAuthors[original.id]);
    }
  }
});

test('discovery construction and relationship lookups do not mutate source entries',()=>{
  const before=JSON.stringify(previewEntries),peopleBefore=JSON.stringify(profiles);
  const one=createDiscoveryEntries(previewEntries),two=createDiscoveryEntries(previewEntries);
  one[0].authorIds.reverse();one.reverse();
  assert.equal(JSON.stringify(previewEntries),before);assert.equal(JSON.stringify(profiles),peopleBefore);
  assert.deepEqual(two,corpus);assert.notEqual(two[0].authorIds,entryAuthors[two[0].id]);
  for(const profile of profiles)assert.ok(!('journey' in profile));
  assert.doesNotThrow(()=>JSON.stringify(corpus));
});

test('missing records and unknown identifiers fail closed without leaking unrelated authors',()=>{
  for(const id of [undefined,null,'missing','constructor','toString','__proto__']){
    assert.deepEqual(getAuthors(id),[]);assert.deepEqual(getProfileEntries(id,previewEntries),[]);
  }
  assert.deepEqual(getAuthors({id:'missing'}),[]);
  assert.deepEqual(getProfileEntries(profiles[0].id),[]);
  assert.ok(createDiscoveryEntries().every(profile=>profile.kind==='profile'&&profile.journey===null));
  const extras=createDiscoveryEntries([{id:'constructor',section:'projects'}]);
  assert.deepEqual(extras[0].authorIds,[]);
});
