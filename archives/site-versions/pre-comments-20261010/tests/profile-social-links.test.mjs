import test from 'node:test';
import assert from 'node:assert/strict';
import {profiles,normalizeProfileSocialLinks} from '../profile-data.mjs';
import {renderProfileSocialLinks} from '../profile-ui.mjs';

// Lightweight DOM fixture, as used by the existing campus-details render tests.
class Element {
 constructor(tagName){this.tagName=tagName;this.children=[];this.attributes={};this.classList={add(){}};}
 append(...children){this.children.push(...children);}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
}
const descendants=root=>[root,...root.children.flatMap(descendants)];
function render(profile,locale='fr'){
 const previous=globalThis.document;
 globalThis.document={createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag)};
 try{return renderProfileSocialLinks({profile,locale});}
 finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
}
const linksIn=root=>descendants(root).filter(element=>element.tagName==='a');

test('fictional profiles do not claim social accounts; absent or empty lists stay empty',()=>{
 assert.ok(profiles.every(profile=>Array.isArray(profile.socialLinks)&&profile.socialLinks.length===0));
 for(const profile of [undefined,{},...profiles]){
  const root=render(profile);
  assert.equal(linksIn(root).length,0);
  assert.ok(descendants(root).some(element=>element.textContent==='Aucun lien renseigné.'));
 }
});

test('only absolute HTTP(S) destinations without credentials become links',()=>{
 const unsafe=['javascript:alert(1)','JAVASCRIPT:alert(1)','data:text/html,<script>alert(1)</script>','file:///tmp/test','mailto:person@example.test','//example.test','/profile','https://','https://name:password@example.test',null,42];
 assert.deepEqual(normalizeProfileSocialLinks(unsafe.map(url=>({platform:'github',url}))),[]);
 assert.equal(linksIn(render({socialLinks:unsafe.map(url=>({url}))})).length,0);
 const normalized=normalizeProfileSocialLinks([{url:' https://example.test/profile '},{url:'https://example.test/profile'},{url:'http://example.test/other'}]);
 assert.deepEqual(normalized.map(link=>link.url),['https://example.test/profile','http://example.test/other']);
 for(const input of [null,undefined,{},'https://example.test'])assert.deepEqual(normalizeProfileSocialLinks(input),[]);
});

test('known networks and custom sites render separate named external links without HTML interpolation',()=>{
 const names=['github','facebook','x','instagram','linkedin'];
 const injection='<img src=x onerror=alert(1)>';
 const input=[...names.map(platform=>({platform,url:`https://example.test/${platform}`})),{platform:'custom',label:injection,url:'https://example.test/custom'}];
 const snapshot=JSON.stringify(input),root=render({socialLinks:input}),links=linksIn(root);
 assert.equal(links.length,6);
 assert.deepEqual(links.map(link=>link.children[0].textContent),['GitHub','Facebook','X','Instagram','LinkedIn',injection]);
 assert.equal(descendants(root).some(element=>element.tagName==='img'),false);
 for(const link of links){
  assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');
  assert.equal(link.getAttribute('aria-label'),`Ouvrir ${link.children[0].textContent} · nouvel onglet`);
  assert.equal(link.children[0].dir,'auto');
  assert.equal(link.children[1].getAttribute('aria-hidden'),'true');
 }
 assert.equal(JSON.stringify(input),snapshot);
});

test('custom and unknown platforms use a supplied label or safe hostname; interface copy covers FR EN AR',()=>{
 const normalized=normalizeProfileSocialLinks([{platform:'mastodon',label:'Mastodon',url:'https://social.example.test/@user'},{platform:'constructor',url:'https://portfolio.example.test'}]);
 assert.deepEqual(normalized.map(link=>[link.platform,link.label]),[['custom','Mastodon'],['custom','portfolio.example.test']]);
 const expected={fr:['Réseaux et liens','Aucun lien renseigné.','nouvel onglet'],en:['Socials and links','No links added.','new tab'],ar:['الشبكات والروابط','لم تُضف روابط بعد.','علامة تبويب جديدة']};
 for(const [locale,[title,empty,newTab]]of Object.entries(expected)){
  const blank=render({},locale),filled=render({socialLinks:[{platform:'github',url:'https://example.test/git'}]},locale);
  assert.equal(blank.children[0].textContent,title);
  assert.equal(blank.children[1].textContent,empty);
  assert.ok(linksIn(filled)[0].getAttribute('aria-label').includes(newTab));
 }
});
