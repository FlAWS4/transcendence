import test from 'node:test';
import assert from 'node:assert/strict';
import {getEntryMedia,renderProjectDetail,clearProjectDetail} from '../project-ui.mjs';
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

test('project and chronicle media expose image and video buttons without loading an inline video player',()=>{
 for(const [renderer,cleanup]of [[renderProjectDetail,clearProjectDetail],[renderJournalDetail,clearJournalDetail]])for(const locale of ['fr','en','ar']){
  const entry={...example,media:[{type:'image',src:'./one.jpg',alt:'Photo',caption:'Légende'},{type:'video',src:'./two.webm',poster:'./poster.jpg',alt:'Clip',credit:'Crédit'}]};
  const root=render(renderer,cleanup,{entry,locale,activeSection:'media'}),buttons=byClass(root,'cp-project-media-open');
  assert.equal(buttons.length,3);assert.ok(buttons.every(button=>button.tagName==='BUTTON'&&button.type==='button'&&button.getAttribute('aria-haspopup')==='dialog'));
  assert.deepEqual(buttons.map(button=>button.dataset.mediaType),['image','image','video']);
  assert.match(buttons[2].getAttribute('aria-label'),/Clip/);assert.equal(byClass(root,'cp-project-media-play').length,1);
  assert.equal(descendants(root).filter(node=>node.tagName==='VIDEO').length,0);
  assert.ok(descendants(root).some(node=>node.src==='./poster.jpg'));assert.equal(byClass(root,'cp-project-media').length,2);
 }
});

test('existing illustrative covers keep their demonstration caption and gain native zoom buttons',()=>{
 for(const [renderer,cleanup]of [[renderProjectDetail,clearProjectDetail],[renderJournalDetail,clearJournalDetail]]){
  const root=render(renderer,cleanup,{entry:example,activeSection:'media'}),buttons=byClass(root,'cp-project-media-open');
  assert.equal(buttons.length,2);assert.ok(buttons.every(button=>button.dataset.mediaType==='illustration'));
  assert.ok(descendants(root).some(node=>node.textContent==='Illustration de démonstration'));
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
