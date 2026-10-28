import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {previewEntries} from '../content-preview-data.mjs';
import {profiles,entryAuthors,createDiscoveryEntries,getAuthors,getProfileEntries} from '../profile-data.mjs';
import {demoProfiles,demoEditorialEntries} from '../demo-content-seed.mjs';
import {previewEntries as originalEditorial} from '../archive/pre-demo-pagination-content-20261013/content-preview-data.mjs';
import {profiles as originalProfiles,entryAuthors as originalAuthors} from '../archive/pre-demo-pagination-content-20261013/profile-data.mjs';
import {validProjectFilters,validTechnologyFilters,validSkillFilters,applyContentCategory} from '../content-filters.mjs';
import {publishedAt,sortContentEntries} from '../content-preferences.mjs';
import {paginateContentEntries} from '../content-pagination.mjs';
import {getContentCampusIds,matchesContentScope} from '../content-geography.mjs';
const catalog=JSON.parse(readFileSync(new URL('../campuses.json',import.meta.url),'utf8'));
const campusById=new Map(catalog.campuses.map(c=>[c.id,c]));
const discovery=createDiscoveryEntries(previewEntries);
const localized=value=>{for(const lang of ['fr','en','ar'])assert.ok(typeof value?.[lang]==='string'&&value[lang].trim(),`missing ${lang}`);};

test('enrichment preserves every original record, author relation and complete journey',()=>{
 for(const entry of originalEditorial)assert.deepEqual(previewEntries.find(e=>e.id===entry.id),entry);
 for(const profile of originalProfiles)assert.deepEqual(profiles.find(e=>e.id===profile.id),profile);
 for(const [id,authors] of Object.entries(originalAuthors))assert.deepEqual(entryAuthors[id],authors);
 assert.equal(demoProfiles.length,20);assert.equal(demoEditorialEntries.length,45);
});

test('each actual discovery section has three distinct pages of 12,12,2 after sorting',()=>{
 assert.equal(discovery.length,78);assert.equal(new Set(discovery.map(e=>e.id)).size,78);
 for(const section of ['projects','people','journal'])for(const sort of ['newest','oldest','favorites']){
  const entries=sortContentEntries(discovery.filter(e=>e.section===section),{sort});
  const pages=[1,2,3].map(page=>paginateContentEntries(entries,page));
  assert.deepEqual(pages.map(p=>p.items.length),[12,12,2]);
  assert.ok(pages.every(p=>p.total===26&&p.pageCount===3));
  assert.deepEqual(pages.flatMap(p=>p.items).map(e=>e.id),entries.map(e=>e.id));
  assert.equal(new Set(pages.flatMap(p=>p.items).map(e=>e.id)).size,26);
 }
 assert.ok(discovery.every(e=>['projects','people','journal'].includes(e.section)));
});

test('new demo content has complete translations, explicit valid dates and local art',()=>{
 for(const entry of [...demoProfiles,...demoEditorialEntries]){
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
 for(const profile of demoProfiles){
  const authored=getProfileEntries(profile.id,discovery);
  assert.ok(authored.some(e=>e.section==='projects'));assert.ok(authored.some(e=>e.section==='journal'));
 }
 for(const entry of demoEditorialEntries){
  const authors=getAuthors(entry);assert.ok(authors.length);assert.equal(new Set(authors.map(a=>a.id)).size,authors.length);
  assert.ok(authors.some(a=>a.id===entry.leadAuthorId));assert.ok(authors.some(a=>a.campus===entry.campus));
  if(entry.section==='projects')assert.deepEqual(new Set(getContentCampusIds(entry)),new Set(authors.map(a=>a.campus)));
 }
 assert.ok(demoEditorialEntries.filter(e=>e.section==='projects'&&e.campusIds.length>1).length>=5);
});

test('new project types, technologies and skills are valid and participate in real filters',()=>{
 for(const entry of demoEditorialEntries.filter(e=>e.section==='projects')){
  assert.ok(validProjectFilters.includes(entry.projectType)&&entry.projectType!=='all');
  for(const type of entry.technologies)assert.ok(validTechnologyFilters.includes('tech:'+type));
  for(const skill of entry.skills)assert.ok(validSkillFilters.includes('skill:'+skill));
  assert.ok(applyContentCategory(discovery,{section:'projects',project:entry.projectType}).some(e=>e.id===entry.id));
 }
});

test('multicampus projects filter into every author campus and country without duplicating pages',()=>{
 const projects=discovery.filter(e=>e.section==='projects');
 for(const entry of demoEditorialEntries.filter(e=>e.section==='projects'))for(const campus of entry.campusIds){
  const country=campusById.get(campus).country;
  assert.ok(matchesContentScope(entry,{campus,country},catalog.campuses));
  const countryEntries=projects.filter(e=>matchesContentScope(e,{country},catalog.campuses));
  assert.equal(countryEntries.filter(e=>e.id===entry.id).length,1);
 }
 assert.ok(new Set(demoProfiles.map(p=>p.campus)).size>=15);
});
