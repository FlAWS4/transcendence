import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {previewEntries} from '../content-preview-data.mjs';
import {profiles,entryAuthors,createDiscoveryEntries,getAuthors,getProfileEntries} from '../profile-data.mjs';
import {demoProfiles,demoEditorialEntries} from '../demo-content-seed.mjs';
import {expandedProfiles,expandedEditorialEntries} from '../demo-content-expanded.mjs';
import {previewEntries as threePageEntries} from '../../archives/site-versions/pre-seven-page-demo-content-20261013/content-preview-data.mjs';
import {profiles as threePageProfiles,entryAuthors as threePageAuthors} from '../../archives/site-versions/pre-seven-page-demo-content-20261013/profile-data.mjs';
const allDemoProfiles=[...demoProfiles,...expandedProfiles];
const allDemoEditorial=[...demoEditorialEntries,...expandedEditorialEntries];
import {previewEntries as originalEditorial} from '../../archives/site-versions/pre-demo-pagination-content-20261013/content-preview-data.mjs';
import {profiles as originalProfiles,entryAuthors as originalAuthors} from '../../archives/site-versions/pre-demo-pagination-content-20261013/profile-data.mjs';
import {validProjectFilters,validTechnologyFilters,validSkillFilters,applyContentCategory} from '../content-filters.mjs';
import {publishedAt,sortContentEntries} from '../content-preferences.mjs';
import {paginateContentEntries} from '../content-pagination.mjs';
import {getContentCampusIds,matchesContentScope} from '../content-geography.mjs';
const catalog=JSON.parse(readFileSync(new URL('../campuses.json',import.meta.url),'utf8'));
const campusById=new Map(catalog.campuses.map(c=>[c.id,c]));
const discovery=createDiscoveryEntries(previewEntries);
const localized=value=>{for(const lang of ['fr','en','ar'])assert.ok(typeof value?.[lang]==='string'&&value[lang].trim(),`missing ${lang}`);};

// Only the explicit demonstration qualifier is removed from this caption.
function withoutDemoCaption(entry){
 const expected=structuredClone(entry);
 if(expected.id==='minishell-under-the-prompt')for(const block of expected.body||[])for(const media of block.media||[]){
  if(!media.caption)continue;
  media.caption.fr=media.caption.fr.replace('Schéma de démonstration créé','Schéma créé');
  media.caption.en=media.caption.en.replace('Demonstration diagram created','Diagram created');
  media.caption.ar=media.caption.ar.replace('مخطط تجريبي أُنشئ','مخطط أُنشئ');
 }
 return expected;
}

test('enrichment preserves every original record, author relation and complete journey',()=>{
 for(const entry of originalEditorial)assert.deepEqual(previewEntries.find(e=>e.id===entry.id),withoutDemoCaption(entry));
 for(const profile of originalProfiles)assert.deepEqual(profiles.find(e=>e.id===profile.id),profile);
 for(const [id,authors] of Object.entries(originalAuthors))assert.deepEqual(entryAuthors[id],authors);
 assert.equal(demoProfiles.length,20);assert.equal(demoEditorialEntries.length,45);
});

test('the actual corpus has four profile pages of 24 and seven editorial pages of 12 after sorting',()=>{
 assert.equal(discovery.length,234);assert.equal(new Set(discovery.map(e=>e.id)).size,234);
 for(const section of ['projects','people','journal'])for(const sort of ['newest','oldest','favorites']){
  const entries=sortContentEntries(discovery.filter(e=>e.section===section),{sort});
  const sizes=section==='people'?[24,24,24,6]:[12,12,12,12,12,12,6];
  const pages=sizes.map((_,i)=>paginateContentEntries(entries,i+1,section));
  assert.deepEqual(pages.map(p=>p.items.length),sizes);
  assert.ok(pages.every(p=>p.total===78&&p.pageCount===sizes.length));
  assert.deepEqual(pages.flatMap(p=>p.items).map(e=>e.id),entries.map(e=>e.id));
  assert.equal(new Set(pages.flatMap(p=>p.items).map(e=>e.id)).size,78);
 }
 assert.ok(discovery.every(e=>['projects','people','journal'].includes(e.section)));
});

test('new demo content has complete translations, explicit valid dates and local art',()=>{
 for(const entry of [...allDemoProfiles,...allDemoEditorial]){
  assert.equal(entry.demo,true);localized(entry.title);localized(entry.summary);
  assert.match(publishedAt(entry),/^2026-\d{2}-\d{2}$/);
  assert.equal(new Date(publishedAt(entry)).toISOString().slice(0,10),publishedAt(entry));
  assert.ok(publishedAt(entry)<='2026-10-13');assert.ok(campusById.has(entry.campus));
  if(entry.kind==='profile'){
   localized(entry.bio);localized(entry.role);localized(entry.eyebrow);
   assert.deepEqual(entry.socialLinks,[]);assert.equal(entry.journeyEntryId,null);
   assert.equal(entry.milestones.length,3);entry.milestones.forEach(m=>{localized(m.label);localized(m.text);});
   assert.ok(readFileSync(new URL('../'+entry.avatar,import.meta.url),'utf8').includes('<svg'));
  }else{
   assert.ok(entry.body.length>=1);entry.body.forEach(block=>{localized(block.heading);localized(block.text);});
   assert.ok(['shell','raycast','network','garden','journal'].includes(entry.cover));
  }
 }
});

test('every new author has a project and an article, explicit leads belong to their teams',()=>{
 for(const profile of allDemoProfiles){
  const authored=getProfileEntries(profile.id,discovery);
  assert.ok(authored.some(e=>e.section==='projects'));assert.ok(authored.some(e=>e.section==='journal'));
 }
 for(const entry of allDemoEditorial){
  const authors=getAuthors(entry);assert.ok(authors.length);assert.equal(new Set(authors.map(a=>a.id)).size,authors.length);
  assert.ok(authors.some(a=>a.id===entry.leadAuthorId));assert.ok(authors.some(a=>a.campus===entry.campus));
  if(entry.section==='projects')assert.deepEqual(new Set(getContentCampusIds(entry)),new Set(authors.map(a=>a.campus)));
 }
 assert.ok(allDemoEditorial.filter(e=>e.section==='projects'&&e.campusIds.length>1).length>=5);
});

test('new project types, technologies and skills are valid and participate in real filters',()=>{
 for(const entry of allDemoEditorial.filter(e=>e.section==='projects')){
  assert.ok(validProjectFilters.includes(entry.projectType)&&entry.projectType!=='all');
  for(const type of entry.technologies)assert.ok(validTechnologyFilters.includes('tech:'+type));
  for(const skill of entry.skills)assert.ok(validSkillFilters.includes('skill:'+skill));
  assert.ok(applyContentCategory(discovery,{section:'projects',project:entry.projectType}).some(e=>e.id===entry.id));
 }
});

test('multicampus projects filter into every author campus and country without duplicating pages',()=>{
 const projects=discovery.filter(e=>e.section==='projects');
 for(const entry of allDemoEditorial.filter(e=>e.section==='projects'))for(const campus of entry.campusIds){
  const country=campusById.get(campus).country;
  assert.ok(matchesContentScope(entry,{campus,country},catalog.campuses));
  const countryEntries=projects.filter(e=>matchesContentScope(e,{country},catalog.campuses));
  assert.equal(countryEntries.filter(e=>e.id===entry.id).length,1);
 }
 assert.ok(new Set(allDemoProfiles.map(p=>p.campus)).size>=15);
});

test('the three-page intermediate corpus is preserved exactly when expanding to seven pages',()=>{
 assert.equal(expandedProfiles.length,52);assert.equal(expandedEditorialEntries.length,104);
 for(const entry of threePageEntries)assert.deepEqual(previewEntries.find(e=>e.id===entry.id),withoutDemoCaption(entry));
 for(const profile of threePageProfiles)assert.deepEqual(profiles.find(e=>e.id===profile.id),profile);
 for(const [id,authors] of Object.entries(threePageAuthors))assert.deepEqual(entryAuthors[id],authors);
 assert.equal(new Set(discovery.flatMap(e=>e.campusIds||[e.campus])).size,58);
});
