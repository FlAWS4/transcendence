import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectTrial,normalizeProjectRepository} from '../project-trial.mjs';

// Simulated DOM: exercises data, form events and focus, without claiming layout.
class Element extends EventTarget {
 constructor(tagName,doc){super();this.tagName=tagName.toUpperCase();this.ownerDocument=doc;this.children=[];this.attributes={};this.dataset={};this._text='';this.value='';this.hidden=false;}
 append(...children){for(const child of children){child.remove();child.parentNode=this;this.children.push(child);}}
 replaceChildren(...children){for(const child of this.children)child.parentNode=null;this.children=[];this.append(...children);}
 remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(child=>child!==this);this.parentNode=null;}}
 set textContent(value){this._text=String(value);this.replaceChildren();}
 get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 removeAttribute(name){delete this.attributes[name];}
 focus(){this.ownerDocument.activeElement=this;}
}
const descendants=root=>[root,...root.children.flatMap(descendants)];
const byTag=(root,tag)=>descendants(root).filter(node=>node.tagName===tag.toUpperCase());
const byClass=(root,name)=>descendants(root).filter(node=>(node.className||'').split(/\s+/).includes(name));
const button=(root,label)=>byTag(root,'button').find(node=>node.textContent===label);
const click=node=>node.dispatchEvent(new Event('click'));
const input=(node,value)=>{node.value=value;node.dispatchEvent(new Event('input'));};
const submit=root=>{const event=new Event('submit',{cancelable:true});byTag(root,'form')[0].dispatchEvent(event);assert.equal(event.defaultPrevented,true);};
const memoryStorage=()=>{const values=new Map();return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value))};};
let nextId=0;
function fixture({entry={id:'repository-test-'+(++nextId)},locale='fr',storage=memoryStorage(),aborted=false,renderer=createProjectTrial}={}){
 const doc={activeElement:null,defaultView:{sessionStorage:storage}};doc.createElement=tag=>new Element(tag,doc);
 const controller=new AbortController();if(aborted)controller.abort();
 const root=renderer({doc,entry,locale,signal:controller.signal,storage});
 return {doc,controller,root,entry,storage};
}
function edit(f,{url,instructions}={}){
 click(byClass(f.root,'cp-project-repository-edit')[0]);
 if(url!==undefined)input(byTag(f.root,'input')[0],url);
 if(instructions!==undefined)input(byTag(f.root,'textarea')[0],instructions);
}

test('repository normalization accepts only explicit HTTP(S) URLs without credentials',()=>{
 for(const url of ['',null,123,'github.com/example/project','/project','//example.com/project','javascript:alert(1)','data:text/html,test','file:///tmp/project','ftp://example.com/project','https://','https://user:secret@example.com/project','http://user@example.com']){
  assert.equal(normalizeProjectRepository({url}),null,String(url));
 }
 for(const url of ['https://github.com/example/project','http://git.example.org/a/b',' HTTPS://GitLab.com/a/b ']){
  const normalized=normalizeProjectRepository({url,instructions:'<script>literal</script>\nmake'});
  assert.equal(normalized.url,new URL(url.trim()).href);assert.equal(normalized.instructions,'<script>literal</script>\nmake');
 }
 assert.equal(normalizeProjectRepository(null),null);
 const source={url:'https://git.example.org/a',instructions:{fr:'Bonjour',en:'Hello',ar:'مرحبا',unknown:'Ignore'}};
 assert.deepEqual(normalizeProjectRepository(source).instructions,{fr:'Bonjour',en:'Hello',ar:'مرحبا'});assert.equal(source.instructions.unknown,'Ignore');
});

test('fictional projects have no invented repository, frame, or demo launch link',()=>{
 for(const [locale,empty,add]of [['fr','Aucun dépôt renseigné','Ajouter un lien'],['en','No repository added','Add a link'],['ar','لم يُضف مستودع بعد','إضافة رابط']]){
  const f=fixture({locale,entry:{id:'empty-'+locale,demoUrl:'https://example.org/demo',repository:{url:'javascript:alert(1)'}}});
  assert.equal(byTag(f.root,'iframe').length,0);assert.equal(byTag(f.root,'a').length,0);assert.equal(byTag(f.root,'h3')[0].textContent,empty);assert.ok(button(f.root,add));
  f.controller.abort();
 }
});

test('valid data render safe external links and literal localized instructions without changing the source',()=>{
 for(const [locale,label,instructions]of [['fr','Voir le dépôt','<strong>Compiler</strong>\nmake'],['en','View repository','Build\nmake'],['ar','عرض المستودع','ابنِ المشروع\nmake']]){
  const entry={id:'localized-'+locale,repository:{url:'https://git.example.org/team/game',instructions:{fr:'<strong>Compiler</strong>\nmake',en:'Build\nmake',ar:'ابنِ المشروع\nmake'}}},before=JSON.stringify(entry),f=fixture({entry,locale});
  const link=byTag(f.root,'a')[0],address=byClass(f.root,'cp-project-repository-url')[0],text=byClass(f.root,'cp-project-repository-instructions')[0];
  assert.equal(link.href,entry.repository.url);assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');assert.ok(link.textContent.startsWith(label));
  assert.match(link.getAttribute('aria-label'),locale==='fr'?/nouvel onglet/:locale==='en'?/new tab/:/علامة تبويب جديدة/);
  assert.equal(address.tagName,'BDI');assert.equal(address.dir,'ltr');assert.equal(text.textContent,instructions);assert.equal(text.dir,'auto');assert.equal(text.children.length,0);assert.equal(JSON.stringify(entry),before);assert.equal(byTag(f.root,'iframe').length,0);f.controller.abort();
 }
});

test('inline author form validates, saves locally and restores after a module reload for the correct project',async()=>{
 const f=fixture();edit(f,{url:'javascript:alert(1)',instructions:'git clone …\n<script>texte</script>'});
 const url=byTag(f.root,'input')[0],textarea=byTag(f.root,'textarea')[0];
 assert.equal(url.required,true);assert.equal(url.type,'url');assert.equal(url.dir,'ltr');assert.equal(textarea.maxLength,5000);assert.equal(textarea.dir,'auto');
 assert.equal(f.doc.activeElement,url);assert.match(byClass(f.root,'cp-project-repository-note')[0].textContent,/cet onglet/);
 submit(f.root);assert.equal(byTag(f.root,'a').length,0);assert.equal(url.getAttribute('aria-invalid'),'true');assert.equal(f.doc.activeElement,url);assert.equal(byClass(f.root,'cp-project-repository-error')[0].hidden,false);assert.equal(f.storage.values.size,0);
 input(url,'https://github.com/team/game');assert.equal(url.getAttribute('aria-invalid'),null);assert.equal(byClass(f.root,'cp-project-repository-error')[0].hidden,true);submit(f.root);
 assert.equal(byTag(f.root,'form').length,0);assert.equal(f.doc.activeElement,button(f.root,'Modifier le lien'));assert.equal(byTag(f.root,'a')[0].href,'https://github.com/team/game');
 const saved=JSON.parse(f.storage.getItem('horizon-project-repository-v1:'+f.entry.id));assert.equal(saved.instructions,'git clone …\n<script>texte</script>');f.controller.abort();
 const {createProjectTrial:reloaded}=await import('../project-trial.mjs?repository-reload-save');
 const restored=fixture({entry:f.entry,storage:f.storage,renderer:reloaded});assert.equal(byTag(restored.root,'a')[0].href,saved.url);assert.equal(byClass(restored.root,'cp-project-repository-instructions')[0].textContent,saved.instructions);
 const unrelated=fixture({storage:f.storage,renderer:reloaded});assert.equal(byTag(unrelated.root,'a').length,0);restored.controller.abort();unrelated.controller.abort();
});

test('cancel discards changes and removal persists a tombstone instead of reviving supplied data',async()=>{
 const f=fixture({entry:{id:'remove-initial',repository:{url:'https://git.example.org/initial',instructions:'Initial'}}});
 edit(f,{url:'https://git.example.org/changed',instructions:'Changed'});click(button(f.root,'Annuler'));
 assert.equal(byTag(f.root,'a')[0].href,'https://git.example.org/initial');assert.equal(f.storage.values.size,0);assert.equal(f.doc.activeElement,button(f.root,'Modifier le lien'));
 edit(f);assert.equal(byTag(f.root,'textarea')[0].value,'Initial');click(button(f.root,'Retirer le lien'));
 assert.equal(byTag(f.root,'a').length,0);assert.equal(byTag(f.root,'form').length,0);assert.equal(f.doc.activeElement,button(f.root,'Ajouter un lien'));assert.equal(f.storage.getItem('horizon-project-repository-v1:'+f.entry.id),'null');f.controller.abort();
 const {createProjectTrial:reloaded}=await import('../project-trial.mjs?repository-reload-remove');const restored=fixture({entry:f.entry,storage:f.storage,renderer:reloaded});assert.equal(byTag(restored.root,'a').length,0);restored.controller.abort();
});

test('draft text survives a locale rerender; cancel restores the saved value without writing the draft',()=>{
 const f=fixture();edit(f,{url:'https://git.example.org/draft',instructions:'Brouillon\nمسودة'});assert.equal(f.storage.values.size,0);f.controller.abort();
 const next=fixture({entry:f.entry,storage:f.storage,locale:'ar'});assert.equal(byTag(next.root,'form').length,1);assert.equal(byTag(next.root,'input')[0].value,'https://git.example.org/draft');assert.equal(byTag(next.root,'textarea')[0].value,'Brouillon\nمسودة');assert.ok(button(next.root,'إلغاء'));click(button(next.root,'إلغاء'));assert.equal(byTag(next.root,'form').length,0);assert.equal(byTag(next.root,'a').length,0);next.controller.abort();
 const again=fixture({entry:f.entry,storage:f.storage,locale:'en'});assert.equal(byTag(again.root,'form').length,0);assert.ok(button(again.root,'Add a link'));again.controller.abort();
});

test('blocked storage falls back to memory for saved values and removals within this tab',()=>{
 const storage={getItem(){throw new Error('blocked');},setItem(){throw new Error('quota');}},f=fixture({storage});
 edit(f,{url:'https://git.example.org/fallback'});submit(f.root);f.controller.abort();
 const next=fixture({entry:f.entry,storage});assert.equal(byTag(next.root,'a')[0].href,'https://git.example.org/fallback');edit(next);click(button(next.root,'Retirer le lien'));next.controller.abort();
 const removed=fixture({entry:{...f.entry,repository:{url:'https://git.example.org/initial'}},storage});assert.equal(byTag(removed.root,'a').length,0);removed.controller.abort();
});

test('malformed stored URLs never become links and oversized instructions cannot be saved',()=>{
 for(const raw of ['{broken',JSON.stringify({url:'javascript:alert(1)'}),JSON.stringify({url:'https://user:secret@example.com'})]){
  const storage=memoryStorage(),entry={id:'invalid-stored-'+(++nextId)};storage.setItem('horizon-project-repository-v1:'+entry.id,raw);const f=fixture({entry,storage});assert.equal(byTag(f.root,'a').length,0);f.controller.abort();
 }
 const f=fixture();edit(f,{url:'https://git.example.org/a',instructions:'x'.repeat(5001)});submit(f.root);assert.equal(f.storage.values.size,0);assert.equal(f.doc.activeElement,byTag(f.root,'textarea')[0]);assert.equal(byTag(f.root,'textarea')[0].getAttribute('aria-invalid'),'true');assert.match(byClass(f.root,'cp-project-repository-error')[0].textContent,/5 000/);f.controller.abort();
});

test('cancelled render and disposed controls cannot open editors or write saved data',()=>{
 const cancelled=fixture({aborted:true});assert.equal(cancelled.root.children.length,0);
 const f=fixture();const oldButton=byClass(f.root,'cp-project-repository-edit')[0];edit(f,{url:'https://git.example.org/a'});const form=byTag(f.root,'form')[0];f.controller.abort();form.dispatchEvent(new Event('submit',{cancelable:true}));assert.equal(f.storage.values.size,0);click(oldButton);assert.equal(byTag(f.root,'form')[0],form);
});

test('unsupported locales fall back to French and omitted instructions do not add an empty section',()=>{
 const f=fixture({entry:{id:'fallback-locale',repository:{url:'https://git.example.org/a'}},locale:'<script>'});assert.equal(byTag(f.root,'h3')[0].textContent,'Dépôt du projet');assert.equal(byTag(f.root,'h4').length,0);assert.equal(byClass(f.root,'cp-project-repository-instructions').length,0);f.controller.abort();
});
