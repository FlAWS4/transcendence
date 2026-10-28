import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTENT_PAGE_SIZE,normalizeContentPage,paginateContentEntries,contentPageNumbers} from '../content-pagination.mjs';
import {contentPageSummary} from '../content-pagination-ui.mjs';
import {matchesContentScope} from '../content-geography.mjs';
import {applyContentCategory} from '../content-filters.mjs';
import {sortContentEntries} from '../content-preferences.mjs';

const campuses=[{id:'paris',country:'FRA'},{id:'lyon',country:'FRA'},{id:'tokyo',country:'JPN'}];
const fixtures=Array.from({length:35},(_,i)=>({id:`project-${i}`,section:'projects',technologies:i%2?['c']:['typescript'],campusIds:i%3?['paris','lyon']:['tokyo'],publishedAt:`2026-10-${String(i%28+1).padStart(2,'0')}`}));
const ids=entries=>entries.map(entry=>entry.id);

test('URL page accepts only positive decimal integers safe to index',()=>{
 for(const value of [undefined,null,'','abc','0','-1','2.5','1e2','0x10',' 2 ','Infinity',Infinity,NaN,0,-2,1.5,Number.MAX_SAFE_INTEGER+1])assert.equal(normalizeContentPage(value),1,String(value));
 for(const value of [2,'2','002'])assert.equal(normalizeContentPage(value),2);
 assert.equal(normalizeContentPage('99999'),99999);
});

test('35 records are partitioned into 12,12,11 without omission or overlap',()=>{
 assert.equal(CONTENT_PAGE_SIZE,12);
 const pages=[1,2,3].map(page=>paginateContentEntries(fixtures,page));
 assert.deepEqual(pages.map(page=>page.items.length),[12,12,11]);
 assert.deepEqual(pages.map(({from,to})=>[from,to]),[[1,12],[13,24],[25,35]]);
 assert.deepEqual(ids(pages.flatMap(page=>page.items)),ids(fixtures));
 assert.ok(pages.every(page=>page.total===35&&page.pageCount===3));
});

test('empty, single-page and excessive page requests have consistent bounds',()=>{
 const empty=paginateContentEntries([],5);assert.deepEqual(empty,{items:[],page:1,pageCount:0,total:0,from:0,to:0});
 const single=paginateContentEntries(fixtures.slice(0,4),'99999');assert.equal(single.page,1);assert.equal(single.pageCount,1);assert.equal(single.to,4);
 const last=paginateContentEntries(fixtures,'99999');assert.equal(last.page,3);assert.deepEqual(ids(last.items),ids(fixtures.slice(24)));
 assert.equal(paginateContentEntries(fixtures,'invalid').page,1);
});

test('shared campus publications are filtered and deduplicated before page boundaries',()=>{
 const scoped=fixtures.filter(entry=>matchesContentScope(entry,{country:'FRA'},campuses));
 const first=paginateContentEntries([...scoped,...scoped],1),second=paginateContentEntries([...scoped,...scoped],2);
 assert.equal(first.total,23);assert.equal(first.pageCount,2);assert.equal(first.items.length,12);assert.equal(second.items.length,11);
 assert.deepEqual(ids([...first.items,...second.items]),ids(scoped));
 assert.ok([...first.items,...second.items].every(entry=>entry.campusIds.includes('paris')&&entry.campusIds.includes('lyon')));
});

test('category and favorites filters and date sorting all precede pagination',()=>{
 const categories=applyContentCategory(fixtures,{section:'projects',project:['tech:typescript']});
 const favorites=categories.slice(0,15).map(entry=>entry.id);
 const sorted=sortContentEntries(categories,{favoritesOnly:true,favorites,sort:'oldest'});
 assert.equal(sorted.length,15);
 const one=paginateContentEntries(sorted,1),two=paginateContentEntries(sorted,2);
 assert.equal(one.total,15);assert.equal(one.items.length,12);assert.equal(two.items.length,3);
 assert.deepEqual(ids([...one.items,...two.items]),ids(sorted));
 assert.ok(two.items.every(entry=>entry.technologies.includes('typescript')&&favorites.includes(entry.id)));
});

test('profile and Chronicle records use the same shared page size',()=>{
 for(const section of ['people','journal']){
  const entries=fixtures.map(entry=>({...entry,section,campus:'paris',kind:section==='people'?'profile':'article'}));
  const filtered=applyContentCategory(entries,{section});
  assert.equal(paginateContentEntries(filtered,2).items.length,CONTENT_PAGE_SIZE);
  assert.equal(paginateContentEntries(filtered,3).items.length,11);
 }
});

test('page controls retain the current page and both ends in at most seven slots',()=>{
 for(const total of [1,2,7,8,20,100])for(let page=1;page<=total;page++){
  const slots=contentPageNumbers(page,total),numbers=slots.filter(value=>value!==null);
  assert.ok(slots.length<=7,JSON.stringify({page,total,slots}));
  assert.equal(numbers[0],1);assert.equal(numbers.at(-1),total);assert.ok(numbers.includes(page));
  assert.deepEqual(numbers,[...new Set(numbers)].sort((a,b)=>a-b));
  assert.ok(numbers.every(value=>value>=1&&value<=total));
 }
 assert.deepEqual(contentPageNumbers(1,0),[]);
 assert.deepEqual(contentPageNumbers(50,100),[1,null,49,50,51,null,100]);
});

test('page status is localized in French, English and Arabic',()=>{
 const state={page:2,pageCount:3};
 assert.equal(contentPageSummary(state,'fr'),'Page 2 sur 3');
 assert.equal(contentPageSummary(state,'en'),'Page 2 of 3');
 assert.match(contentPageSummary(state,'ar'),/^الصفحة .+ من .+$/);
});
