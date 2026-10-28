import test from 'node:test';
import assert from 'node:assert/strict';
import {setMaxListeners} from 'node:events';
import {createComments} from '../comments.mjs';

// Interaction fixture only: geometry is supplied, not rendered by a browser.
const walk=root=>[root,...root.children.flatMap(walk)];
const event=(type,props={})=>Object.assign(new Event(type,{cancelable:true}),props);
const datasetKey=key=>key.replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
function matches(node,selector){
 const attribute=selector.match(/\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]/);
 const base=selector.replace(/\[.*\]/,'');
 if(base.startsWith('.')&&!node.className.split(' ').includes(base.slice(1)))return false;
 if(base&&!base.startsWith('.')&&node.tagName!==base)return false;
 if(attribute){const key=attribute[1],value=key==='hidden'?node.hidden?'':null:key.startsWith('data-')?node.dataset[datasetKey(key.slice(5))]??null:node.getAttribute(key);return value!==null&&(attribute[2]===undefined||value===attribute[2]);}
 return true;
}
class Element extends EventTarget{
 constructor(tag,doc){super();this.tagName=tag;this.ownerDocument=doc;this.children=[];this.dataset={};this.attributes={};this.style={};this.className='';this.hidden=false;this.disabled=false;this.value='';this.selectionStart=0;this.selectionEnd=0;this._text='';this.scrollTop=0;this.clientTop=1;}
 append(...children){for(const child of children){child.parentElement=this;this.children.push(child);}}
 insertBefore(child,before){child.parentElement=this;this.children.splice(this.children.indexOf(before),0,child);}
 replaceChildren(...children){for(const child of this.children)child.parentElement=null;this.children=[];this._text='';this.append(...children);}
 set textContent(value){this.replaceChildren();this._text=String(value);}
 get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 set innerHTML(value){this.replaceChildren();this._html=value;}
 get innerHTML(){return this._html||'';}
 setAttribute(key,value){this.attributes[key]=String(value);}
 getAttribute(key){return this.attributes[key]??null;}
 removeAttribute(key){delete this.attributes[key];}
 contains(target){return walk(this).includes(target);}
 querySelectorAll(selector){return walk(this).slice(1).filter(node=>matches(node,selector));}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 closest(selector){let node=this;while(node){if(matches(node,selector))return node;node=node.parentElement;}return null;}
 get isConnected(){return this.ownerDocument.body.contains(this);}
 focus(){
  if(this.disabled||this.closest('[hidden]')||!this.isConnected)return;
  const doc=this.ownerDocument,previous=doc.activeElement;doc.activeElement=this;
  if(previous!==this){let parent=previous;while(parent){parent.dispatchEvent(event('focusout',{relatedTarget:this}));parent=parent.parentElement;}}
  this.dispatchEvent(new Event('focus'));
 }
 setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end;}
 setCustomValidity(value){this.validationMessage=value;}
 reportValidity(){return !this.validationMessage;}
 scrollIntoView(){}
 getBoundingClientRect(){
  const doc=this.ownerDocument,toggle=this.dataset.commentAction==='actions'?this:this.querySelector('[data-comment-action=actions]');
  let rect=doc.rects.get(toggle?.dataset.commentId)||{left:doc.dir==='rtl'?16:doc.width-60,top:300,width:44,height:44};
  if(this.className==='cp-comment-owner-menu'||this.className==='cp-control-panel'){
   const owner=this.parentElement.getBoundingClientRect(),height=Math.min(14+44*this.children.length,Number.parseFloat(this.style.maxHeight)||Infinity);
   rect={left:owner.left+(Number.parseFloat(this.style.left)||0),top:owner.top+(Number.parseFloat(this.style.top)||0),width:Math.min(180,doc.width-24),height};
  }else if(['menuitem','menuitemradio'].includes(this.getAttribute('role'))){
   const panel=this.parentElement.getBoundingClientRect();rect={left:panel.left+7,top:panel.top+7+this.parentElement.children.indexOf(this)*44-this.parentElement.scrollTop,width:panel.width-14,height:44};
  }
  return {...rect,right:rect.left+rect.width,bottom:rect.top+rect.height};
 }
}
let instance=0;
const created=Date.parse('2026-10-11T12:00:00Z');
const item=(id,text,extra={})=>({id,text,created,authorId:'local',...extra});
function fixture(t,{comments=[item('one','Premier'),item('two','Deuxième',{created:created+1000})],locale='fr',sort='newest',draft='',replyDrafts={}}={}){
 const doc=new EventTarget();doc.width=320;doc.dir=locale==='ar'?'rtl':'ltr';doc.rects=new Map();doc.baseURI='http://localhost/demo/';doc.documentElement={clientHeight:640,clientWidth:320};doc.body=new Element('body',doc);doc.activeElement=doc.body;
 doc.createElement=tag=>new Element(tag,doc);doc.createElementNS=(_,tag)=>doc.createElement(tag);doc.createTextNode=text=>{const node=new Element('#text',doc);node.textContent=text;return node;};doc.getElementById=id=>walk(doc.body).find(node=>node.id===id)||null;doc.querySelector=selector=>doc.body.querySelector(selector);
 const storage=new Map(),view=new EventTarget();view.sessionStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};view.getComputedStyle=()=>({direction:doc.dir,display:'block',visibility:'visible'});doc.defaultView=view;
 const entryId='actions-fixture-'+(++instance),key='horizon-comments-demo-v1:project:'+entryId;storage.set(key,JSON.stringify({comments,sort,draft,replyDrafts}));
 const controller=new AbortController();setMaxListeners(0,controller.signal);t.after(()=>controller.abort());const reports=[];
 const root=createComments({doc,entryId,kind:'project',locale,signal:controller.signal,currentAuthor:{id:'local',title:'Auteur local'},resolveAuthor:id=>({id,title:'Autre auteur'}),onReport:value=>reports.push(value)});doc.body.append(root);
 const action=(id,name)=>root.querySelectorAll('[data-comment-action]').find(node=>node.dataset.commentId===id&&node.dataset.commentAction===name);
 const menu=id=>action(id,'actions').parentElement.querySelector('[role=menu]');
 const stored=()=>JSON.parse(storage.get(key));
 return {doc,view,root,action,menu,stored,reports,controller,key,storage};
}
const click=node=>node.dispatchEvent(new Event('click'));
const key=(node,value)=>{const e=event('keydown',{key:value});node.dispatchEvent(e);return e;};
const outside=(doc,target)=>{const e=new Event('pointerdown');Object.defineProperty(e,'target',{value:target});doc.dispatchEvent(e);};
const type=(input,value)=>{input.value=value;input.setSelectionRange(value.length,value.length);input.dispatchEvent(new Event('input'));};

test('owner menus are unique, localized and keyboard accessible on comments and replies',t=>{
 for(const locale of ['fr','en','ar']){
  const f=fixture(t,{locale,comments:[item('one','Parent'),item('reply','Réponse',{parentId:'one',replyToId:'one'})]});
  assert.equal(f.menu('one').hidden,true);assert.equal(f.action('one','actions').getAttribute('aria-label'),{fr:'Actions du commentaire',en:'Comment actions',ar:'إجراءات التعليق'}[locale]);
  click(f.action('one','actions'));assert.equal(f.doc.activeElement,f.action('one','edit'));assert.equal(f.menu('one').hidden,false);
  key(f.menu('one'),'End');assert.equal(f.doc.activeElement,f.action('one','report'));key(f.menu('one'),'ArrowDown');assert.equal(f.doc.activeElement,f.action('one','edit'));
  key(f.action('reply','actions'),'ArrowUp');assert.equal(f.menu('one').hidden,true);assert.equal(f.doc.activeElement,f.action('reply','report'));
  assert.equal(key(f.menu('reply'),'Escape').defaultPrevented,true);assert.equal(f.doc.activeElement,f.action('reply','actions'));assert.equal(f.menu('reply').hidden,true);
  click(f.action('one','actions'));assert.equal(key(f.menu('one'),'Tab').defaultPrevented,false);assert.equal(f.doc.activeElement,f.action('one','actions'));assert.equal(f.menu('one').hidden,true);
 }
});

test('outside interaction, page movement and abort close the menu without a hidden focus target',t=>{
 const f=fixture(t),outsideButton=f.doc.createElement('button');f.doc.body.append(outsideButton);
 click(f.action('one','actions'));outside(f.doc,outsideButton);assert.equal(f.menu('one').hidden,true);assert.equal(f.doc.activeElement,f.action('one','actions'));outsideButton.focus();assert.equal(f.doc.activeElement,outsideButton);
 click(f.action('one','actions'));outsideButton.focus();assert.equal(f.menu('one').hidden,true);assert.equal(f.doc.activeElement,outsideButton);
 click(f.action('one','actions'));f.view.dispatchEvent(new Event('resize'));assert.equal(f.menu('one').hidden,true);assert.equal(f.doc.activeElement,f.action('one','actions'));
 click(f.action('one','actions'));f.doc.dispatchEvent(new Event('scroll'));assert.equal(f.menu('one').hidden,true);
 click(f.action('one','actions'));f.controller.abort();assert.equal(f.menu('one').hidden,true);click(f.action('one','actions'));assert.equal(f.menu('one').hidden,true);
});

test('edit cancellation and save return to the visible opener, retaining the main and reply drafts',t=>{
 const f=fixture(t,{comments:[item('one','Avant')],draft:'Commentaire en préparation',replyDrafts:{one:{text:'Réponse en préparation',targetId:'one'}}});
 click(f.action('one','actions'));click(f.action('one','edit'));let input=f.doc.getElementById('project-edit-input-one');assert.equal(f.doc.activeElement,input);
 assert.equal(f.action('one','edit'),undefined);assert.ok(f.action('one','remove'));assert.ok(f.action('one','report'));
 type(input,'À annuler');click(input.parentElement.querySelector('.cp-comments-cancel'));assert.equal(f.stored().comments[0].text,'Avant');assert.equal(f.doc.activeElement,f.action('one','actions'));assert.equal(f.menu('one').hidden,true);
 click(f.action('one','actions'));click(f.action('one','edit'));input=f.doc.getElementById('project-edit-input-one');type(input,'Après');input.parentElement.dispatchEvent(event('submit'));
 assert.equal(f.stored().comments[0].text,'Après');assert.equal(f.stored().draft,'Commentaire en préparation');assert.equal(f.stored().replyDrafts.one.text,'Réponse en préparation');assert.equal(f.doc.activeElement,f.action('one','actions'));
});

test('deleting a reply while its parent is edited restores that editor, then pruning the thread reaches the main composer',t=>{
 const f=fixture(t,{comments:[item('one','Parent'),item('reply','Réponse',{parentId:'one',replyToId:'one'})]});
 click(f.action('one','actions'));click(f.action('one','edit'));type(f.doc.getElementById('project-edit-input-one'),'Brouillon parent');
 click(f.action('reply','actions'));click(f.action('reply','remove'));assert.equal(f.doc.activeElement,f.doc.getElementById('project-edit-input-one'));assert.equal(f.doc.activeElement.value,'Brouillon parent');
 click(f.action('one','actions'));click(f.action('one','remove'));assert.equal(f.stored().comments.length,0);assert.equal(f.doc.activeElement,f.doc.getElementById('project-comment-input'));
 assert.equal(f.root.querySelectorAll('[role=status]').map(node=>node.textContent).join(''),'');
 const g=fixture(t,{comments:[item('one','Parent'),item('reply','Réponse',{parentId:'one',replyToId:'one'})]});
 click(g.action('one','actions'));click(g.action('one','remove'));assert.equal(g.action('one','actions'),undefined);assert.equal(g.stored().comments[0].deleted,true);
 click(g.action('reply','actions'));click(g.action('reply','remove'));assert.equal(g.stored().comments.length,0);assert.equal(g.doc.activeElement,g.doc.getElementById('project-comment-input'));
});

test('report is available to every non-deleted author without granting edit or delete, and passes a detached value plus visible opener',t=>{
 const f=fixture(t,{comments:[item('one','Local'),item('other','Autre',{authorId:'other'})]});
 assert.equal(f.action('other','edit'),undefined);assert.equal(f.action('other','remove'),undefined);assert.ok(f.action('other','report'));
 click(f.action('other','actions'));click(f.action('other','report'));assert.equal(f.reports.length,1);assert.equal(f.reports[0].trigger,f.action('other','actions'));assert.equal(f.doc.activeElement,f.reports[0].trigger);assert.equal(f.menu('other').hidden,true);
 f.reports[0].comment.text='Mutation externe';assert.equal(f.stored().comments.find(item=>item.id==='other').text,'Autre');
});

test('sorting persists across reconstruction without losing an edit or a reply draft; replies stay chronological',t=>{
 const f=fixture(t,{comments:[item('old','Ancien',{created:created-100}),item('new','Nouveau'),item('late','Réponse tardive',{parentId:'old',replyToId:'old',created:created+50}),item('early','Réponse tôt',{parentId:'old',replyToId:'old',created:created-50})]});
 click(f.action('old','actions'));click(f.action('old','edit'));type(f.doc.getElementById('project-edit-input-old'),'Édition en cours');
 click(f.root.querySelector('.cp-comments-sort'));click(f.root.querySelector('[data-value=oldest]'));assert.equal(f.stored().sort,'oldest');assert.equal(f.doc.getElementById('project-edit-input-old').value,'Édition en cours');assert.equal(f.doc.activeElement,f.root.querySelector('.cp-comments-sort'));
 assert.deepEqual(f.root.querySelectorAll('article[data-comment-id]').map(node=>node.dataset.commentId),['old','early','late','new']);
 click(f.action('new','reply'));type(f.doc.getElementById('project-reply-input-new'),'Réponse conservée');click(f.root.querySelector('.cp-comments-sort'));click(f.root.querySelector('[data-value=popular]'));
 assert.equal(f.stored().replyDrafts.new.text,'Réponse conservée');assert.equal(f.doc.getElementById('project-reply-input-new').value,'Réponse conservée');assert.equal(f.stored().sort,'popular');
});

test('the three comment sort choices retain selection, keyboard focus and exclusive menu dismissal',t=>{
 for(const locale of ['fr','en','ar']){
  const f=fixture(t,{locale,sort:'oldest'}),trigger=()=>f.root.querySelector('.cp-comments-sort'),panel=()=>f.root.querySelector('.cp-control-panel');
  assert.equal(trigger().getAttribute('aria-haspopup'),'menu');click(trigger());
  assert.equal(panel().hidden,false);assert.equal(f.doc.activeElement.dataset.value,'oldest');
  assert.deepEqual(panel().children.map(item=>item.dataset.value),['newest','oldest','popular']);
  assert.deepEqual(panel().children.map(item=>item.getAttribute('aria-checked')),['false','true','false']);
  key(panel(),'End');assert.equal(f.doc.activeElement.dataset.value,'popular');key(panel(),'ArrowDown');assert.equal(f.doc.activeElement.dataset.value,'newest');
  key(panel(),'Escape');assert.equal(panel().hidden,true);assert.equal(f.doc.activeElement,trigger());
  key(trigger(),'ArrowUp');assert.equal(f.doc.activeElement.dataset.value,'popular');click(f.doc.activeElement);
  assert.equal(f.stored().sort,'popular');assert.equal(f.doc.activeElement,trigger());assert.equal(panel().hidden,true);
  click(trigger());click(f.action('one','actions'));assert.equal(panel().hidden,true);assert.equal(f.menu('one').hidden,false);
  click(trigger());assert.equal(f.menu('one').hidden,true);outside(f.doc,f.doc.body);assert.equal(panel().hidden,true);assert.equal(f.doc.activeElement,trigger());
  click(trigger());key(panel(),'Tab');assert.equal(panel().hidden,true);assert.equal(f.doc.activeElement,trigger());
  click(trigger());f.controller.abort();assert.equal(panel().hidden,true);
 }
});

test('supplied narrow RTL/LTR geometry keeps the menu within the viewport and opens upward near its bottom',t=>{
 for(const locale of ['fr','ar']){
  const f=fixture(t,{locale});f.doc.rects.set('one',{left:locale==='ar'?10:270,top:550,width:44,height:44});click(f.action('one','actions'));
  const menu=f.menu('one'),offset=Number.parseFloat(menu.style.left),left=f.doc.rects.get('one').left+offset;
  assert.ok(left>=12);assert.ok(left+180<=308);assert.ok(Number.parseFloat(menu.style.top)<0);assert.ok(Number.parseFloat(menu.style.maxHeight)>0);
 }
});

test('keyboard navigation reveals each item inside a height-limited menu without closing it',t=>{
 const f=fixture(t);f.doc.documentElement.clientHeight=200;f.doc.rects.set('one',{left:260,top:78,width:44,height:44});
 key(f.action('one','actions'),'ArrowUp');const menu=f.menu('one');assert.equal(f.doc.activeElement,f.action('one','report'));assert.ok(menu.scrollTop>0);
 assert.ok(f.doc.activeElement.getBoundingClientRect().bottom<=menu.getBoundingClientRect().bottom-6);
 const scroll=new Event('scroll');Object.defineProperty(scroll,'target',{value:menu});f.doc.dispatchEvent(scroll);assert.equal(menu.hidden,false);
 key(menu,'Home');assert.equal(f.doc.activeElement,f.action('one','edit'));assert.ok(f.doc.activeElement.getBoundingClientRect().top>=menu.getBoundingClientRect().top+6);assert.equal(menu.hidden,false);
});

test('the comment sort panel opens upward when its button is low, keeping its three choices visible',t=>{
 for(const locale of ['fr','ar']){
  const f=fixture(t,{locale});f.doc.rects.set(undefined,{left:locale==='ar'?16:200,top:560,width:104,height:44});
  click(f.root.querySelector('.cp-comments-sort'));const panel=f.root.querySelector('.cp-control-panel'),bounds=panel.getBoundingClientRect();
  assert.equal(panel.hidden,false);assert.equal(bounds.height,14+44*3);assert.ok(bounds.top>=8);assert.ok(bounds.bottom<=560-9);
 }
});

test('on mobile the comment sort panel stays clear of the back-to-top button',t=>{
 const f=fixture(t),backToTop=f.doc.createElement('button');backToTop.id='back-to-top';
 backToTop.getBoundingClientRect=()=>({left:260,top:450,width:44,height:44,right:304,bottom:494});f.doc.body.append(backToTop);
 click(f.root.querySelector('.cp-comments-sort'));let bounds=f.root.querySelector('.cp-control-panel').getBoundingClientRect();
 assert.equal(bounds.height,14+44*3);assert.ok(bounds.bottom<=450-8);
 backToTop.hidden=true;outside(f.doc,f.doc.body);click(f.root.querySelector('.cp-comments-sort'));bounds=f.root.querySelector('.cp-control-panel').getBoundingClientRect();
 assert.equal(bounds.top,344+9);assert.equal(bounds.height,14+44*3);
});

test('a sort button partly under the floating controls keeps its panel above them',t=>{
 const f=fixture(t),backToTop=f.doc.createElement('button');backToTop.id='back-to-top';
 backToTop.getBoundingClientRect=()=>({left:16,top:450,width:44,height:44,right:60,bottom:494});f.doc.body.append(backToTop);
 f.doc.rects.set(undefined,{left:200,top:470,width:104,height:44});
 click(f.root.querySelector('.cp-comments-sort'));const bounds=f.root.querySelector('.cp-control-panel').getBoundingClientRect();
 assert.equal(bounds.height,14+44*3);assert.equal(bounds.bottom,450-8);
});
