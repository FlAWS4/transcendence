import test from 'node:test';
import assert from 'node:assert/strict';
import {contentCategoryGroupState,toggleContentCategoryGroup} from '../content-controls.mjs';
import {projectFilterOptions,projectFilterGroups,profileFilterGroups,applyContentCategory} from '../content-filters.mjs';
import {getProfileEntries,profiles} from '../profile-data.mjs';
import {previewEntries} from '../content-preview-data.mjs';

const options=projectFilterOptions('fr');
const common=options.filter(option=>option.group==='common-core').map(option=>option.value);
const specialty=options.filter(option=>option.group==='specialization').map(option=>option.value);

test('bulk common core selection fills the group, becomes mixed after a removal, and preserves independent choices',()=>{
 const first=toggleContentCategoryGroup(['personal'],common);
 assert.equal(common.length,6);assert.equal(first.length,7);
 assert.equal(contentCategoryGroupState(first,common),'true');
 assert.equal(contentCategoryGroupState(first.filter(value=>value!=='libft'),common),'mixed');
 assert.deepEqual(toggleContentCategoryGroup(first,common),['personal']);
 assert.equal(contentCategoryGroupState(['personal'],common),'false');
 const partial=['cub3d','ft_linear_regression'];
 const completed=toggleContentCategoryGroup(partial,common);
 assert.ok(completed.includes('ft_linear_regression'));assert.equal(contentCategoryGroupState(completed,common),'true');
 assert.deepEqual(partial,['cub3d','ft_linear_regression']);
});
test('specialization bulk selection is independent and global reset clears all group states',()=>{
 const both=toggleContentCategoryGroup(toggleContentCategoryGroup([],common),specialty);
 assert.equal(contentCategoryGroupState(both,common),'true');
 assert.equal(contentCategoryGroupState(both,specialty),'true');
 assert.deepEqual(toggleContentCategoryGroup(both,specialty),common);
 assert.equal(contentCategoryGroupState([],common),'false');
 assert.equal(contentCategoryGroupState([],specialty),'false');
});
test('personal projects are a direct checkbox; only project categories request a bulk option',()=>{
 for(const locale of ['fr','en','ar']){
  const personal=projectFilterOptions(locale).find(option=>option.value==='personal');
  assert.ok(!('group' in personal));assert.ok(personal.label.length>0);
  assert.ok(projectFilterGroups(locale).every(group=>group.selectAllLabel?.length>0));
  assert.ok(profileFilterGroups(locale).every(group=>!('selectAllLabel' in group)));
 }
});
test('the same bulk criteria scope global and author projects without inventing missing types',()=>{
 const selection=toggleContentCategoryGroup([],common);
 assert.equal(applyContentCategory(previewEntries,{section:'projects',project:selection}).length,3);
 const authorProjects=getProfileEntries(profiles[0].id,previewEntries,{section:'projects'});
 assert.deepEqual(applyContentCategory(authorProjects,{section:'projects',project:selection}),authorProjects);
 assert.equal(applyContentCategory(authorProjects,{section:'projects',project:['personal']}).length,0);
 assert.equal(applyContentCategory(previewEntries,{section:'projects',project:['personal']}).length,1);
 assert.equal(applyContentCategory(previewEntries,{section:'projects',project:[]}).length,4);
});
