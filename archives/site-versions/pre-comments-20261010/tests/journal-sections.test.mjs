import test from 'node:test';
import assert from 'node:assert/strict';
import {journalSections,normalizeJournalSection,journalBackDistance} from '../journal-ui.mjs';
import {projectSections,normalizeProjectSection,projectBackDistance} from '../project-ui.mjs';
import {profileBackDistance} from '../profile-sections.mjs';

test('journal direct links keep Article as the default and expose only its three sections',()=>{
 assert.deepEqual(journalSections,['article','media','authors']);
 for(const section of journalSections)assert.equal(normalizeJournalSection(section),section);
 for(const section of [undefined,null,'overview','implementation','team','constructor','missing'])assert.equal(normalizeJournalSection(section),'article');
 assert.deepEqual(projectSections,['overview','implementation','media','team']);
 assert.equal(normalizeProjectSection('article'),'overview');
 assert.equal(normalizeProjectSection('team'),'team');
});
test('journal Back leaves the article visit without using depths from a profile or project',()=>{
 assert.equal(journalBackDistance({fromList:true,journalDepth:2,profileDepth:9,projectDepth:7}),3);
 assert.equal(journalBackDistance({fromDetail:true,returnSection:'people',journalDepth:3}),4);
 assert.equal(journalBackDistance({fromDetail:true,returnSection:'people'}),1);
 assert.equal(journalBackDistance({journalDepth:2}),0);
 assert.equal(journalBackDistance(null),0);
 assert.equal(journalBackDistance({fromList:true,journalDepth:-1}),1);
 const authorVisit={fromDetail:true,returnSection:'journal',profileDepth:1,journalDepth:0};
 assert.equal(profileBackDistance(authorVisit),2);
 assert.equal(journalBackDistance(authorVisit),1);
 assert.equal(projectBackDistance({fromList:true,projectDepth:2,journalDepth:8}),3);
});
