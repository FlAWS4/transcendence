import test from 'node:test';
import assert from 'node:assert/strict';
import {setMaxListeners} from 'node:events';
import {createProjectFilterDialog,projectFilterDialogSections,projectFilterDialogLabel} from '../project-filter-dialog.mjs';
import {projectFilterOptions,projectFilterGroups,profileFilterOptions,profileFilterGroups} from '../content-filters.mjs';
import {previewEntries} from '../content-preview-data.mjs';
import {profiles} from '../profile-data.mjs';

const descendants=root=>[root,...root.children.flatMap(descendants)];
const byClass=(root,name)=>descendants(root).find(node=>node.className?.split(' ').includes(name));
class Element extends EventTarget{
 constructor(tag,doc){super();this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.children=[];this.dataset={};this.attributes=new Map();this._text='';}
 addEventListener(type,callback,options){if(options?.signal)setMaxListeners(0,options.signal);super.addEventListener(type,callback,options);}
 set textContent(value){this._text=String(value);this.replaceChildren();}get textContent(){return this._text+this.children.map(node=>node.textContent).join('');}
 set innerHTML(value){this._html=String(value);this.replaceChildren();}
 setAttribute(name,value){this.attributes.set(name,String(value));}getAttribute(name){return this.attributes.get(name)??null;}
 append(...nodes){for(const node of nodes){node.remove();this.children.push(node);node.parentNode=this;}}
 replaceChildren(...nodes){for(const child of this.children)child.parentNode=null;this.children=[];this.append(...nodes);}
 remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;}}
 get childElementCount(){return this.children.length;}
 get isConnected(){return this===this.ownerDocument.body||Boolean(this.parentNode?.isConnected);}
 contains(node){return this===node||this.children.some(child=>child.contains(node));}
 closest(selector){if(selector==='[hidden]'&&this.hidden)return this;return this.parentNode?.closest(selector)||null;}
 focus(options){if(this.isConnected){this.ownerDocument.activeElement=this;this.focusOptions=options;}}
 showModal(){assert.equal(this.isConnected,true);this.open=true;this.ownerDocument.modal=this;}
 close(){this.open=false;if(this.ownerDocument.modal===this)this.ownerDocument.modal=null;this.dispatchEvent(new Event('close'));}
 getBoundingClientRect(){return {left:20,right:300,top:20,bottom:400};}
}
const send=(node,type,props={})=>{const event=Object.assign(new Event(type,{cancelable:true}),props);node.dispatchEvent(event);return event;};
function fixture(kind='projects',locale='fr',values=[]){
 const doc={createElement:tag=>new Element(tag,doc)};doc.body=doc.createElement('body');
 const trigger=doc.createElement('button');doc.body.append(trigger);trigger.focus();const applied=[];let closed=0;
 const dialog=createProjectFilterDialog({doc,trigger,onApply:values=>applied.push(values),onClose:()=>closed++});
 const filter={kind,values,options:kind==='people'?profileFilterOptions(profiles,locale):projectFilterOptions(locale,previewEntries),groups:kind==='people'?profileFilterGroups(locale):projectFilterGroups(locale,previewEntries)};
 const open=()=>dialog.open(filter,locale);open();
 const input=value=>descendants(doc.modal).find(node=>node.tagName==='INPUT'&&node.value===value);
 const choose=(value,checked=true)=>{const node=input(value);assert.ok(node,value);node.checked=checked;send(node,'change');};
 const action=name=>send(byClass(doc.modal,'cp-project-filter-'+name),'click');
 const apply=()=>send(byClass(doc.modal,'cp-project-filter-form'),'submit');
 return {doc,trigger,dialog,filter,applied,open,input,choose,action,apply,get closed(){return closed;}};
}

test('both kinds preserve facet order, supplied labels and unique choices',()=>{
 for(const locale of ['fr','en','ar']){
  const projects=projectFilterDialogSections({kind:'projects',options:projectFilterOptions(locale,previewEntries)});
  assert.deepEqual(Object.keys(projects),['projects','technologies','skills']);assert.ok(projects.projects.length);assert.ok(projects.technologies.length);assert.ok(projects.skills.length);
  const people=projectFilterDialogSections({kind:'people',options:[...profileFilterOptions(profiles,locale),{value:'student',label:'duplicate'},null]});
  assert.deepEqual(Object.keys(people),['status','arrival']);assert.equal(people.status.length,3);assert.ok(people.arrival.length);assert.ok(people.arrival.every(item=>item.value.startsWith('arrival:')));
  assert.ok(projectFilterDialogLabel(locale));
 }
});

test('profile criteria remain a draft until Apply and reopen from applied values',()=>{
 const f=fixture('people');f.choose('student');const year=f.filter.options.find(item=>item.value.startsWith('arrival:')).value;f.choose(year);
 assert.deepEqual(f.applied,[]);assert.deepEqual(f.filter.values,[]);assert.match(byClass(f.doc.modal,'cp-project-filter-count').textContent,/2/);
 assert.equal(f.apply().defaultPrevented,true);assert.deepEqual(f.applied,[['student',year]]);assert.equal(f.dialog.isOpen,false);assert.equal(f.doc.activeElement,f.trigger);
 f.filter.values=f.applied[0];f.open();assert.equal(f.input('student').checked,true);assert.equal(f.input(year).checked,true);f.dialog.close();
});

test('Cancel, Escape and dismissal discard profile edits and restore keyboard focus',()=>{
 for(const method of ['cancel','escape','close']){
  const f=fixture('people','en',['alumni']);f.choose('student');
  if(method==='escape')assert.equal(send(f.doc.modal,'cancel').defaultPrevented,true);else f.action(method);
  assert.deepEqual(f.applied,[]);assert.equal(f.dialog.isOpen,false);assert.equal(f.doc.activeElement,f.trigger);assert.equal(f.closed,1);
  f.open();assert.equal(f.input('student').checked,false);assert.equal(f.input('alumni').checked,true);f.dialog.close();
 }
});

test('Reset remains a draft for profiles and projects; Apply commits an empty selection',()=>{
 for(const kind of ['people','projects']){
  const choice=kind==='people'?'student':'minishell';const f=fixture(kind,'fr',[choice]);f.action('reset');
  assert.equal(f.input(choice).checked,false);assert.deepEqual(f.applied,[]);assert.deepEqual(f.filter.values,[choice]);assert.ok(byClass(f.doc.modal,'cp-project-filter-status').textContent.length);
  f.action('cancel');f.open();assert.equal(f.input(choice).checked,true);f.action('reset');f.apply();assert.deepEqual(f.applied,[[]]);
 }
});

test('project bulk selection and indeterminate state preserve technology and skill drafts',()=>{
 const f=fixture('projects','fr',['tech:c','skill:parsing']);
 const collective=descendants(f.doc.modal).find(node=>node.tagName==='INPUT'&&!node.value);
 collective.checked=true;send(collective,'change');assert.equal(f.input('minishell').checked,true);assert.equal(f.input('tech:c').checked,true);assert.equal(f.input('skill:parsing').checked,true);
 f.choose('libft',false);assert.equal(collective.indeterminate,true);assert.equal(collective.getAttribute('aria-checked'),'mixed');assert.deepEqual(f.applied,[]);
 f.apply();assert.ok(f.applied[0].includes('minishell'));assert.ok(!f.applied[0].includes('libft'));assert.ok(f.applied[0].includes('tech:c'));assert.ok(f.applied[0].includes('skill:parsing'));
});

test('profile modal labels, sections and direction follow all three interface languages',()=>{
 for(const [locale,title,status,arrival]of [['fr','Filtrer les profils','Statut','Rentrée'],['en','Filter profiles','Status','Arrival year'],['ar','تصفية الأعضاء','الحالة','سنة الالتحاق']]){
  const f=fixture('people',locale);assert.equal(f.doc.modal.lang,locale);assert.equal(f.doc.modal.dir,locale==='ar'?'rtl':'ltr');assert.equal(f.doc.modal.dataset.kind,'people');
  assert.equal(descendants(f.doc.modal).find(node=>node.tagName==='H2').textContent,title);
  const labels=descendants(f.doc.modal).filter(node=>node.className==='cp-project-filter-section-label').map(node=>node.textContent);assert.deepEqual(labels,[status,arrival]);f.dialog.close();
 }
});

test('one selected criterion uses singular French and English copy',()=>{
 for(const [locale,expected]of [['fr','1 critère sélectionné'],['en','1 criterion selected']]){
  const f=fixture('people',locale);f.choose('student');assert.equal(byClass(f.doc.modal,'cp-project-filter-count').textContent,expected);f.dialog.close();
 }
});

test('a closed or replaced modal cannot apply stale changes',()=>{
 const f=fixture('people');const oldInput=f.input('student'),oldForm=byClass(f.doc.modal,'cp-project-filter-form');f.dialog.close();
 oldInput.checked=true;send(oldInput,'change');send(oldForm,'submit');assert.deepEqual(f.applied,[]);
 f.open();assert.equal(f.input('student').checked,false);f.dialog.close();
});

test('only a gesture starting and ending on the backdrop dismisses the modal',()=>{
 const f=fixture('people');const dialog=f.doc.modal;
 send(dialog,'pointerdown',{clientX:50,clientY:50});send(dialog,'click',{clientX:0,clientY:0});assert.equal(f.dialog.isOpen,true);
 send(dialog,'pointerdown',{clientX:0,clientY:0});send(dialog,'click',{clientX:0,clientY:0});assert.equal(f.dialog.isOpen,false);assert.deepEqual(f.applied,[]);assert.equal(f.doc.activeElement,f.trigger);
});
