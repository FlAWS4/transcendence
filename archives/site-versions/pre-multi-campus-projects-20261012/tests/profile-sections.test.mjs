import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProfileSection,normalizeProfileProjectFilters,profileBackDistance} from '../profile-sections.mjs';
import {profiles,getProfileEntries} from '../profile-data.mjs';
import {previewEntries} from '../content-preview-data.mjs';
import {applyContentCategory} from '../content-filters.mjs';

test('old journal links and former journey links remain meaningful; unknown sections use overview',()=>{
 assert.equal(normalizeProfileSection('journal'),'contribution');
 assert.equal(normalizeProfileSection(null,{legacy:true}),'journey');
 assert.equal(normalizeProfileSection('projects',{legacy:true}),'projects');
 assert.equal(normalizeProfileSection('constructor'),'overview');
 assert.equal(normalizeProfileSection('missing'),'overview');
});
test('direct project filter links accept multiple known categories, reset with all and ignore unknown values',()=>{
 assert.deepEqual(normalizeProfileProjectFilters('minishell,cub3d,minishell,missing'),['minishell','cub3d']);
 assert.deepEqual(normalizeProfileProjectFilters(['all','cub3d']),[]);
 assert.deepEqual(normalizeProfileProjectFilters(null),[]);
 assert.deepEqual(normalizeProfileProjectFilters('ft_transcendence'),['ft_transcendence']);
 assert.deepEqual(normalizeProfileProjectFilters('constructor,__proto__'),[]);
});
test('profile filtering cannot introduce projects by another author and empty demo types remain empty',()=>{
 const projects=getProfileEntries(profiles[0].id,previewEntries,{section:'projects'});
 assert.equal(projects.length,2);
 assert.deepEqual(applyContentCategory(projects,{section:'projects',project:['minishell','cub3d','ft_transcendence']}),projects);
 assert.deepEqual(applyContentCategory(projects,{section:'projects',project:['cub3d']}),[]);
 assert.deepEqual(applyContentCategory(projects,{section:'projects',project:['libft']}),[]);
 assert.deepEqual(applyContentCategory(projects,{section:'projects',project:[]}),projects);
});
test('visible Back leaves the entire profile visit while direct links fall back to the directory',()=>{
 assert.equal(profileBackDistance({fromList:true,profileDepth:3}),4);
 assert.equal(profileBackDistance({fromDetail:true,profileDepth:2}),3);
 assert.equal(profileBackDistance({fromList:true}),1);
 assert.equal(profileBackDistance({profileDepth:3}),0);
 assert.equal(profileBackDistance(null),0);
 assert.equal(profileBackDistance({fromList:true,profileDepth:-1}),1);
});

test('profile project URLs preserve technology and skill facets and keep the author scope',()=>{
 const selected=['minishell','ft_transcendence','tech:c','skill:parsing'];
 const query=new URLSearchParams({project:selected.join(',')});
 assert.deepEqual(normalizeProfileProjectFilters(new URLSearchParams(query.toString()).get('project')),selected);
 assert.deepEqual(normalizeProfileProjectFilters('tech:c,skill:parsing,skill:parsing,skill:unknown,tech:unknown'),['tech:c','skill:parsing']);
 assert.deepEqual(normalizeProfileProjectFilters(['all','tech:c','skill:parsing']),[]);
 const authored=getProfileEntries(profiles[0].id,previewEntries,{section:'projects'});
 assert.deepEqual(applyContentCategory(authored,{section:'projects',project:selected}).map(entry=>entry.id),['minishell-under-the-prompt']);
 assert.deepEqual(applyContentCategory(authored,{section:'projects',project:['tech:c','skill:raycasting']}),[]);
});
