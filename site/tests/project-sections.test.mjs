import test from 'node:test';
import assert from 'node:assert/strict';
import {projectSections,normalizeProjectSection,projectBackDistance} from '../project-ui.mjs';
import {profileBackDistance} from '../profile-sections.mjs';

test('project direct links use the five project sections and safely default to overview',()=>{
 assert.deepEqual(projectSections,['overview','implementation','media','test','comments']);
 for(const section of projectSections)assert.equal(normalizeProjectSection(section),section);
 for(const section of [undefined,null,'team','journey','contribution','constructor','missing'])assert.equal(normalizeProjectSection(section),'overview');
});
test('project Back leaves its section visit while profile and project history depths stay independent',()=>{
 assert.equal(projectBackDistance({fromList:true,projectDepth:3,profileDepth:7}),4);
 assert.equal(projectBackDistance({fromDetail:true,returnSection:'people',projectDepth:2}),3);
 assert.equal(projectBackDistance({fromDetail:true,returnSection:'people'}),1);
 assert.equal(projectBackDistance({projectDepth:3}),0);
 assert.equal(projectBackDistance(null),0);
 assert.equal(projectBackDistance({fromList:true,projectDepth:-1}),1);
 const profileReturn={fromDetail:true,returnSection:'projects',profileDepth:1,projectDepth:0};
 assert.equal(profileBackDistance(profileReturn),2);
 assert.equal(projectBackDistance(profileReturn),1);
});
