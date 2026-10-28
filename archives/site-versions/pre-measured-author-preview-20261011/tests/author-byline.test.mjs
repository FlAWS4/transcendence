import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthorByline} from '../profile-ui.mjs';

class Element extends EventTarget {
 constructor(tagName){super();this.tagName=tagName;this.children=[];this.dataset={};this.attributes={};this._text='';}
 append(...children){this.children.push(...children);}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
}
const descendants=root=>[root,...root.children.flatMap(descendants)];
const byClass=(root,name)=>descendants(root).filter(node=>node.className?.split(' ').includes(name));
const people=count=>Array.from({length:count},(_,index)=>({id:'person-'+index,title:{fr:'Personne '+index,en:'Person '+index,ar:'شخص '+index},role:{fr:'Contribution '+index},avatar:'./person-'+index+'.svg'}));
function render(options){
 const previous=globalThis.document;
 globalThis.document={createElement:tag=>new Element(tag),createElementNS:(_namespace,tag)=>new Element(tag)};
 try{return createAuthorByline({getHref:author=>'#people/'+author.id,...options});}
 finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
}

test('full project and article bylines preserve arbitrary team sizes and every profile link',()=>{
 for(const size of [0,1,2,5,7,50]){
  const authors=people(size),root=render({authors});
  assert.deepEqual(byClass(root,'cp-author-link').map(link=>link.href),authors.map(author=>'#people/'+author.id));
  assert.equal(byClass(root,'cp-author-role').length,size);
  assert.equal(byClass(root,'cp-author-more').length,0);
 }
});

test('large compact bylines show a bounded preview and a localized real link to every author',()=>{
 for(const locale of ['fr','en','ar'])for(const [section,size]of [['projects',5],['journal',4],['projects',50]]){
  const authors=people(size),snapshot=JSON.stringify(authors),href='#'+section+'/example?tab='+(section==='journal'?'authors':'team');
  let clicked=0;
  const root=render({authors,locale,compact:true,allAuthorsHref:href,onAllAuthorsNavigate:()=>clicked++});
  assert.equal(byClass(root,'cp-author-link').length,2);
  const more=byClass(root,'cp-author-more')[0];assert.equal(more.href,href);
  assert.equal(more.children[1].textContent,new Intl.NumberFormat(locale).format(size-2));
  assert.ok(more.getAttribute('aria-label').includes(new Intl.NumberFormat(locale).format(size)));
  more.dispatchEvent(new Event('click'));assert.equal(clicked,1);
  assert.equal(JSON.stringify(authors),snapshot);
 }
});

test('a compact byline without a complete-list destination never hides people, and solo teams need no extra link',()=>{
 for(const size of [1,2,7,50]){
  const root=render({authors:people(size),compact:true});
  assert.equal(byClass(root,'cp-author-link').length,size);assert.equal(root.dataset.collapsible,'false');
  assert.equal(byClass(root,'cp-author-more').length,0);
  assert.ok(byClass(root,'cp-author-item').every(item=>!item.dataset.secondary));
 }
 for(const size of [0,1]){
  const root=render({authors:people(size),compact:true,allAuthorsHref:'#projects/example?tab=team'});
  assert.equal(byClass(root,'cp-author-link').length,size);
  assert.equal(byClass(root,'cp-author-more').length,0);
 }
});

test('narrow card previews keep the first author and one complete-list link counting every remaining person',()=>{
 for(const locale of ['fr','en','ar'])for(const size of [2,3,7,50])for(const section of ['projects','journal']){
  const authors=people(size),href='#'+section+'/example?tab='+(section==='projects'?'team':'authors');
  const root=render({authors,locale,compact:true,allAuthorsHref:href,leadAuthorId:authors.at(-1).id});
  assert.equal(root.dataset.collapsible,'true');assert.equal(byClass(root,'cp-author-link').length,2);
  const items=byClass(root,'cp-author-item'),secondary=items.filter(item=>item.dataset.secondary==='true');
  assert.equal(secondary.length,1);assert.equal(byClass(secondary[0],'cp-author-link')[0].href,'#people/person-0');
  assert.equal(byClass(root,'cp-author-link')[0].href,'#people/person-'+(size-1));
  const more=byClass(root,'cp-author-more');assert.equal(more.length,1);assert.equal(more[0].href,href);
  assert.equal(byClass(root,'cp-author-more-item')[0].dataset.narrowOnly,String(size===2));
  assert.equal(byClass(root,'cp-author-more-count-wide')[0].textContent,new Intl.NumberFormat(locale).format(size-2));
  assert.equal(byClass(root,'cp-author-more-count-narrow')[0].textContent,new Intl.NumberFormat(locale).format(size-1));
  assert.ok(more[0].getAttribute('aria-label').includes(new Intl.NumberFormat(locale).format(size)));
  const full=render({authors,locale,allAuthorsHref:href});
  assert.equal(full.dataset.collapsible,'false');assert.equal(byClass(full,'cp-author-link').length,size);assert.equal(byClass(full,'cp-author-more').length,0);
 }
});

test('an explicit lead beyond the preview is displayed first everywhere without reordering source collaborators',()=>{
 const authors=people(7),snapshot=JSON.stringify(authors),leadAuthorId=authors[6].id;
 for(const compact of [false,true]){
  const root=render({authors,leadAuthorId,compact,allAuthorsHref:'#projects/example?tab=team'});
  const expected=compact?['person-6','person-0']:['person-6','person-0','person-1','person-2','person-3','person-4','person-5'];
  assert.deepEqual(byClass(root,'cp-author-link').map(link=>link.href),expected.map(id=>'#people/'+id));
  assert.equal(byClass(root,'cp-author-responsibility').length,1);
  assert.equal(byClass(root,'cp-author-responsibility')[0].textContent,'');
  assert.equal(byClass(root,'cp-author-responsibility')[0].title,'Chef de projet');
  assert.match(byClass(root,'cp-author-link')[0].getAttribute('aria-label'),/Personne 6\. Chef de projet/);
  if(compact)assert.equal(byClass(root,'cp-author-more')[0].children[1].textContent,'5');
 }
 assert.equal(JSON.stringify(authors),snapshot);
});

test('crowns replace visible responsibility text while profile links retain the precise localized role',()=>{
 const authors=people(2);
 for(const [locale,project,article]of [
  ['fr','Chef de projet','Responsable de l’article'],
  ['en','Project lead','Article lead'],
  ['ar','المسؤول عن المشروع','المسؤول عن المقال'],
 ])for(const [authorContext,label]of [['project',project],['article',article]])for(const compact of [false,true]){
  const root=render({authors,locale,authorContext,compact,leadAuthorId:'person-1'});
  const badge=byClass(root,'cp-author-responsibility')[0],links=byClass(root,'cp-author-link');
  assert.equal(badge.textContent,'');assert.equal(badge.title,label);assert.equal(badge.getAttribute('aria-hidden'),'true');
  assert.equal(badge.children.length,1);assert.equal(badge.children[0].tagName,'svg');
  assert.equal(badge.children[0].getAttribute('aria-hidden'),'true');assert.equal(badge.children[0].getAttribute('focusable'),'false');
  assert.ok(links[0].getAttribute('aria-label').includes(label));
  assert.equal(links[0].href,'#people/person-1');
  assert.equal(links[1].getAttribute('aria-label'),null);
 }
});

test('missing or invalid responsibility never labels the first author, including a solo contribution',()=>{
 for(const authors of [people(1),people(5)])for(const leadAuthorId of [undefined,null,'','other-person',42]){
  const root=render({authors,leadAuthorId});
  assert.equal(byClass(root,'cp-author-responsibility').length,0);
  assert.deepEqual(byClass(root,'cp-author-link').map(link=>link.href),authors.map(author=>'#people/'+author.id));
 }
 const solo=render({authors:people(1),leadAuthorId:'person-0',compact:true,allAuthorsHref:'#journal/solo?tab=authors',authorContext:'article'});
 assert.equal(byClass(solo,'cp-author-responsibility').length,1);
 assert.equal(byClass(solo,'cp-author-more').length,0);
 assert.ok(byClass(solo,'cp-author-link')[0].getAttribute('aria-label').includes('Responsable de l’article'));
});
