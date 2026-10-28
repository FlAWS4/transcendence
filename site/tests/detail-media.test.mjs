import test from 'node:test';
import assert from 'node:assert/strict';
import {getEntryMedia,collectEntryMedia,renderProjectDetail,clearProjectDetail} from '../project-ui.mjs';
import {renderJournalDetail,clearJournalDetail} from '../journal-ui.mjs';
import {renderProfileDetail,clearProfileDetail,renderProfileCard,createAuthorByline} from '../profile-ui.mjs';

const descendants=root=>[root,...root.children.flatMap(descendants)];
const byClass=(root,name)=>descendants(root).filter(node=>node.className?.split(' ').includes(name));
class Element extends EventTarget {
 constructor(tagName,doc){super();this.tagName=tagName.toUpperCase();this.ownerDocument=doc;this.children=[];this.dataset={};this.attributes={};this.style={setProperty(){}};this.classList={add:(...names)=>{this.className=[this.className,...names].filter(Boolean).join(' ');}};}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=[...children];}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 querySelector(tag){return descendants(this).find(child=>child.tagName===tag.toUpperCase());}
 cloneNode(deep){const copy=new Element(this.tagName,this.ownerDocument);copy.className=this.className;copy.innerHTML=this.innerHTML;copy.attributes={...this.attributes};copy.dataset={...this.dataset};if(deep)copy.children=this.children.map(child=>child.cloneNode(true));return copy;}
}
function render(renderer,cleanup,options){
 const previous=globalThis.document,doc=new EventTarget(),view=new EventTarget();
 doc.baseURI='https://horizon.example/';doc.defaultView=view;
 doc.createElement=tag=>new Element(tag,doc);doc.createElementNS=(_,tag)=>doc.createElement(tag);doc.createTextNode=text=>Object.assign(doc.createElement('text'),{textContent:text});
 view.matchMedia=()=>new EventTarget();view.cancelAnimationFrame=()=>{};
 const container=doc.createElement('div');globalThis.document=doc;
 try{renderer({container,getSectionHref:key=>'#example?tab='+key,onSectionNavigate(){},onBack(){},...options});return container;}
 finally{cleanup(container);if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
}
const example={id:'example',cover:'shell',title:{fr:'Projet exemple',en:'Example project',ar:'مشروع تجريبي'},eyebrow:'42',summary:'Résumé',body:[],tags:[]};

test('provided media retain order and localized attribution without accepting executable or unsupported sources',()=>{
 const entry={...example,media:[
  {type:'image',src:'./images/first.jpg',alt:{fr:'Image une',en:'Image one'},caption:{fr:'Légende',en:'Caption'},credit:'Photographe'},
  {type:'video',src:'https://horizon.example/video.webm',poster:'./poster.jpg',alt:{en:'Video'}},
  {type:'image',src:'javascript:alert(1)'},{type:'image',src:'data:image/svg+xml,<svg/>'},{type:'image',src:'blob:https://horizon.example/local'},{type:'audio',src:'./audio.mp3'},null,
 ]};
 const before=JSON.stringify(entry),media=getEntryMedia(entry,'en');
 assert.equal(media.length,2);assert.deepEqual(media[0],{type:'image',src:'./images/first.jpg',alt:'Image one',caption:'Caption',credit:'Photographe'});
 assert.equal(media[1].type,'video');assert.equal(media[1].poster,'./poster.jpg');assert.equal(media[1].alt,'Video');
 assert.equal(JSON.stringify(entry),before);
 assert.deepEqual(getEntryMedia(example),[]);assert.deepEqual(getEntryMedia({...example,media:{type:'image',src:'./one.jpg'}}),[]);
 assert.equal(getEntryMedia({...example,media:[{type:'image',src:'./one.jpg'}]},'ar')[0].alt,example.title.ar);
 assert.equal(getEntryMedia({...example,media:[{type:'video',src:'./one.webm',poster:'javascript:bad'}]})[0].poster,undefined);
});

test('media collection deduplicates resolved sources while retaining body placement and local captions',()=>{
 const entry={...example,media:[{type:'image',src:'./one.jpg',caption:{fr:'Principale',en:'Main'}}],body:[
  {heading:'First',text:'Kept text',media:[
   {type:'image',src:'https://horizon.example/one.jpg',caption:{en:'In context'}},
   {type:'video',src:'./two.webm',poster:'./poster.jpg'},
   {type:'video',src:'https://horizon.example/two.webm'},
  ]},
  {heading:'Second',media:[{type:'video',src:'./two.webm'},{type:'image',src:'./three.jpg'}]},
 ]};
 const before=JSON.stringify(entry),collection=collectEntryMedia(entry,'en','https://horizon.example/');
 assert.equal(collection.hasPrimaryMedia,true);
 assert.deepEqual(collection.items.map(item=>item.src),['./one.jpg','./two.webm','./three.jpg']);
 assert.deepEqual(collection.bodyMedia.map(group=>group.map(item=>item.index)),[[0,1],[1,2]]);
 assert.equal(collection.items[0].caption,'Main');
 assert.equal(collection.bodyMedia[0][0].media.caption,'In context');
 assert.equal(collection.items[1].poster,'./poster.jpg');
 assert.equal(JSON.stringify(entry),before);
});

test('body media use the same URL validation and never replace an absent primary image',()=>{
 const entry={...example,media:[{type:'image',src:'javascript:bad'}],body:[{media:[
  {type:'image',src:'./safe.svg'},
  {type:'video',src:'https://horizon.example/demo.webm',poster:'javascript:bad'},
  {type:'image',src:'javascript:alert(1)'},
  {type:'image',src:'data:image/svg+xml,<svg onload="alert(1)"/>'},
  {type:'image',src:'file:///tmp/private.png'},
  {type:'video',src:'blob:https://horizon.example/local'},
  {type:'audio',src:'./sound.mp3'},
 ]},null,{media:{type:'image',src:'./not-an-array.jpg'}}]};
 const collection=collectEntryMedia(entry,'fr','https://horizon.example/');
 assert.equal(collection.hasPrimaryMedia,false);
 assert.deepEqual(collection.items.map(item=>item.type),['image','video']);
 assert.equal(collection.items[1].poster,undefined);
 assert.deepEqual(collection.bodyMedia.map(group=>group.map(item=>item.index)),[[0,1],[],[]]);
 assert.deepEqual(collectEntryMedia({...example,body:{}},'fr').bodyMedia,[]);
});

test('project overview keeps its main illustration when realization only has inline media',()=>{
 const entry={...example,body:[{heading:'Stage',text:'Original account',media:[{type:'image',src:'./detail.svg',caption:'Inline diagram'}]}]};
 const overview=render(renderProjectDetail,clearProjectDetail,{entry,activeSection:'overview'});
 assert.deepEqual(byClass(overview,'cp-project-media-open').map(button=>button.dataset.mediaType),['illustration']);
 assert.equal(byClass(overview,'cp-project-lead-media').length,1);
 assert.equal(byClass(overview,'cp-project-inline-media').length,0);
 const gallery=render(renderProjectDetail,clearProjectDetail,{entry,activeSection:'media'});
 assert.deepEqual(byClass(gallery,'cp-project-media-open').map(button=>button.dataset.mediaType),['illustration','image']);
 assert.equal(byClass(gallery,'cp-project-media').length,2);
 assert.ok(descendants(gallery).some(node=>node.textContent==='Inline diagram'));
 const withPrimary=render(renderProjectDetail,clearProjectDetail,{entry:{...entry,media:[{type:'image',src:'./main.jpg'}]},activeSection:'overview'});
 assert.deepEqual(byClass(withPrimary,'cp-project-media-open').map(button=>button.dataset.mediaType),['image']);
 assert.ok(byClass(withPrimary,'cp-project-lead-media')[0].children[0].children.some(node=>node.src==='./main.jpg'));
});

test('realization and chronicle articles place media after their own text, while the gallery lists each source once',()=>{
 const entry={...example,media:[{type:'image',src:'./one.jpg'}],body:[
  {heading:'First step',text:'Text one',media:[{type:'image',src:'./one.jpg',caption:'Reused image'},{type:'video',src:'./two.webm',poster:'./two.jpg'}]},
  {heading:'Second step',text:'Text two',media:[{type:'image',src:'./three.jpg',caption:'<script>not markup</script>'}]},
 ]};
 for(const [renderer,cleanup,activeSection]of [[renderProjectDetail,clearProjectDetail,'implementation'],[renderJournalDetail,clearJournalDetail,'article']]){
  const root=render(renderer,cleanup,{entry,activeSection});
  const blocks=byClass(root,'cp-project-block').filter(block=>block.children.some(child=>child.textContent==='Text one'||child.textContent==='Text two'));
  assert.equal(blocks.length,2);
  assert.equal(blocks[0].children[1].textContent,'Text one');
  assert.deepEqual(byClass(blocks[0],'cp-project-media-open').map(button=>button.dataset.mediaType),['image','video']);
  assert.equal(blocks[1].children[1].textContent,'Text two');
  assert.equal(byClass(blocks[1],'cp-project-media-open').length,1);
  assert.ok(descendants(root).some(node=>node.textContent==='<script>not markup</script>'&&node.innerHTML===undefined));
  assert.equal(descendants(root).filter(node=>node.tagName==='VIDEO').length,0);
  const gallery=render(renderer,cleanup,{entry,activeSection:'media'});
  assert.equal(byClass(gallery,'cp-project-media').length,3);
 }
});

test('project and chronicle media expose image and video buttons without loading an inline video player',()=>{
 for(const [renderer,cleanup]of [[renderProjectDetail,clearProjectDetail],[renderJournalDetail,clearJournalDetail]])for(const locale of ['fr','en','ar']){
  const entry={...example,media:[{type:'image',src:'./one.jpg',alt:'Photo',caption:'Légende'},{type:'video',src:'./two.webm',poster:'./poster.jpg',alt:'Clip',credit:'Crédit'}]};
  const root=render(renderer,cleanup,{entry,locale,activeSection:'media'}),buttons=byClass(root,'cp-project-media-open');
  assert.equal(buttons.length,2);assert.ok(buttons.every(button=>button.tagName==='BUTTON'&&button.type==='button'&&button.getAttribute('aria-haspopup')==='dialog'));
  assert.deepEqual(buttons.map(button=>button.dataset.mediaType),['image','video']);
  assert.match(buttons[1].getAttribute('aria-label'),/Clip/);assert.equal(byClass(root,'cp-project-media-play').length,1);
  assert.equal(descendants(root).filter(node=>node.tagName==='VIDEO').length,0);
  assert.ok(descendants(root).some(node=>node.src==='./poster.jpg'));assert.equal(byClass(root,'cp-project-media').length,2);
 }
});

// 13 October 2026: explicit demo qualifiers were removed from the interface copy, so the
// illustration caption is now "Illustration" (previous expectation kept in
// checks/20261014-detail-media-before.test.mjs).
test('existing illustrative covers keep their caption and gain native zoom buttons',()=>{
 for(const [renderer,cleanup]of [[renderProjectDetail,clearProjectDetail],[renderJournalDetail,clearJournalDetail]]){
  const root=render(renderer,cleanup,{entry:example,activeSection:'media'}),buttons=byClass(root,'cp-project-media-open');
  assert.equal(buttons.length,1);assert.ok(buttons.every(button=>button.dataset.mediaType==='illustration'));
  assert.ok(descendants(root).some(node=>node.textContent==='Illustration'));
  assert.ok(!descendants(root).some(node=>/démonstration|demonstration/i.test(node.textContent||'')&&node.children.length===0));
  assert.ok(buttons[0].children[0].innerHTML.includes('<svg'));
 }
});

test('only the main profile portrait becomes a zoom button; profile cards and author portraits retain route links',()=>{
 const profile={id:'person',title:{fr:'Personne'},avatar:'./person.svg',status:'student'};
 const root=render(renderProfileDetail,clearProfileDetail,{profile,activeSection:'projects'}),face=byClass(root,'cp-profile-portrait-open')[0];
 assert.equal(face.tagName,'BUTTON');assert.equal(face.getAttribute('aria-label'),'Agrandir le portrait : Personne');assert.equal(face.children[0].src,profile.avatar);
 const previous=globalThis.document;globalThis.document=root.ownerDocument;
 try{
  const card=renderProfileCard({profile,href:'#people/person'}),byline=createAuthorByline({authors:[profile],getHref:()=> '#people/person'});
  assert.equal(byClass(card,'cp-card-open')[0].href,'#people/person');assert.equal(byClass(byline,'cp-author-link')[0].href,'#people/person');
  assert.equal(byClass(card,'cp-profile-portrait-open').length,0);assert.equal(byClass(byline,'cp-profile-portrait-open').length,0);
 }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});

test('project overview contains the entire team with its designated lead and profile links',()=>{
 for(const locale of ['fr','en','ar'])for(const size of [0,1,5,50]){
  const authors=Array.from({length:size},(_,index)=>({id:'person-'+index,title:{fr:'Personne '+index,en:'Person '+index,ar:'شخص '+index},role:{fr:'Rôle '+index},avatar:'./person-'+index+'.svg'}));
  const entry={...example,leadAuthorId:authors.at(-1)?.id},before=JSON.stringify(authors);
  const root=render(renderProjectDetail,clearProjectDetail,{entry,authors,locale,activeSection:'overview',getAuthorHref:author=>'#people/'+author.id});
  const team=byClass(root,'cp-project-team');assert.equal(team.length,1);
  const heading=team[0].children[0];assert.equal(heading.id,'project-team-title');assert.equal(heading.tabIndex,-1);assert.equal(team[0].getAttribute('aria-labelledby'),heading.id);
  const expected=size?[authors.at(-1),...authors.slice(0,-1)]:[];
  assert.deepEqual(byClass(team[0],'cp-author-link').map(link=>link.href),expected.map(author=>'#people/'+author.id));
  assert.equal(byClass(team[0],'cp-author-more').length,0);assert.equal(byClass(team[0],'cp-author-responsibility').length,size?1:0);
  assert.equal(JSON.stringify(authors),before);
  assert.equal(descendants(root).some(node=>node.dataset.projectSectionLink==='team'),false);
 }
 const legacy=render(renderProjectDetail,clearProjectDetail,{entry:example,activeSection:'team'});
 assert.equal(legacy.dataset.projectSection,'overview');assert.equal(byClass(legacy,'cp-project-team').length,1);
});

test('chronicle authors remain a separate complete section and the article does not acquire a project team or trial',()=>{
 const authors=Array.from({length:4},(_,index)=>({id:'writer-'+index,title:{fr:'Auteur '+index},avatar:'./writer.svg'}));
 const entry={...example,leadAuthorId:'writer-2'},options={entry,authors,getAuthorHref:author=>'#people/'+author.id};
 const article=render(renderJournalDetail,clearJournalDetail,{...options,activeSection:'article'});
 assert.equal(byClass(article,'cp-project-team').length,0);assert.equal(byClass(article,'cp-authors').length,0);assert.equal(byClass(article,'cp-project-trial').length,0);
 assert.equal(descendants(article).some(node=>node.dataset.journalSectionLink==='test'),false);
 const root=render(renderJournalDetail,clearJournalDetail,{...options,activeSection:'authors'});
 assert.equal(root.dataset.journalSection,'authors');assert.equal(byClass(root,'cp-project-team').length,0);
 assert.deepEqual(byClass(root,'cp-author-link').map(link=>link.href),['writer-2','writer-0','writer-1','writer-3'].map(id=>'#people/'+id));
 assert.equal(byClass(root,'cp-author-more').length,0);assert.equal(byClass(root,'cp-author-responsibility')[0].title,'Responsable de l’article');
});
