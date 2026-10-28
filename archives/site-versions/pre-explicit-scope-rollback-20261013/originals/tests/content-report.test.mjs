import test from 'node:test';
import assert from 'node:assert/strict';
import {setMaxListeners} from 'node:events';
import {REPORT_STORAGE_KEY,REPORT_DETAIL_LIMIT,createReportStore,reportTargetKey,openReportDialog,createReportButton} from '../content-report.mjs';

const moment='2026-10-11T12:00:00.000Z';
const project={kind:'project',id:'shared-id'};
const comment=(parentKind='project',parentId='one')=>({kind:'comment',id:'local-1',parentKind,parentId});
function memoryStorage(initial=null){
 let saved=initial,writes=0;
 return {getItem:key=>key===REPORT_STORAGE_KEY?saved:null,setItem(key,value){assert.equal(key,REPORT_STORAGE_KEY);saved=value;writes++;},get saved(){return saved;},get writes(){return writes;}};
}

test('comment reports identify both the local comment and its parent, without collisions between content kinds',()=>{
 const targets=[project,{kind:'article',id:'shared-id'},{kind:'profile',id:'shared-id'},comment(),comment('article'),comment('project','two'),{...comment(),id:'local-2'}];
 assert.equal(new Set(targets.map(reportTargetKey)).size,targets.length);
 assert.equal(reportTargetKey({...comment(),title:'Changed visible text'}),reportTargetKey(comment()));
 assert.notEqual(reportTargetKey({kind:'comment',id:'x","project","y',parentKind:'project',parentId:'z'}),reportTargetKey({kind:'comment',id:'x',parentKind:'project',parentId:'y","project","z'}));
 for(const target of [null,{},project.id,{kind:'project',id:1},{kind:'project',id:''},{kind:'unknown',id:'one'},{kind:'comment',id:'one'},{...comment(),parentKind:'profile'},{...comment(),parentId:''}])assert.equal(reportTargetKey(target),null);
});

test('a saved report survives a reload, is deduplicated, and returned objects cannot modify stored evidence',()=>{
 const storage=memoryStorage(),store=createReportStore({storage:()=>storage,now:()=>moment}),target={...comment(),title:'A visible excerpt'};
 const first=store.submit({target,reason:'privacy',details:'  Keep this literal <b>text</b>.  '});
 assert.equal(first.ok,true);assert.equal(first.duplicate,false);
 assert.deepEqual(first.report,{target:comment(),reason:'privacy',details:'Keep this literal <b>text</b>.',createdAt:moment});
 target.parentId='mutated';first.report.target.id='mutated';first.report.details='mutated';
 const returned=store.get(comment());returned.target.parentId='mutated';
 const restored=createReportStore({storage:()=>storage,now:()=>{throw new Error('A duplicate must not get a new timestamp.');}});
 assert.equal(restored.get(comment()).target.id,'local-1');assert.equal(restored.get(comment()).target.parentId,'one');
 const duplicate=restored.submit({target:comment(),reason:'spam',details:'A replacement attempt'});
 assert.equal(duplicate.duplicate,true);assert.equal(duplicate.report.reason,'privacy');assert.equal(duplicate.report.createdAt,moment);assert.equal(storage.writes,1);
 assert.equal(restored.get(comment('article')),null);
});

test('invalid requests and malformed persisted records are rejected without preventing valid reports',()=>{
 const valid={target:project,reason:'spam',details:'Valid',createdAt:moment};
 const invalid=[null,{...valid,target:{kind:'comment',id:'orphan'}},{...valid,reason:'invented'},{...valid,details:1},{...valid,details:'x'.repeat(REPORT_DETAIL_LIMIT+1)},{...valid,createdAt:'not a date'}];
 const storage=memoryStorage(JSON.stringify({version:1,reports:[...invalid,valid]})),store=createReportStore({storage:()=>storage,now:()=>moment});
 assert.deepEqual(store.get(project),valid);
 for(const request of [{target:comment(),reason:''},{target:{kind:'project',id:''},reason:'spam'},{target:comment(),reason:'other',details:3},{target:comment(),reason:'other',details:'x'.repeat(REPORT_DETAIL_LIMIT+1)}])assert.equal(store.submit(request).ok,false);
 assert.equal(store.get(comment()),null);assert.equal(storage.writes,0);
 assert.equal(store.submit({target:comment(),reason:'other',details:'x'.repeat(REPORT_DETAIL_LIMIT)}).ok,true);
 for(const saved of ['invalid JSON',JSON.stringify({version:2,reports:[valid]}),JSON.stringify({version:1,reports:{}})]){
  const corrupted=memoryStorage(saved),clean=createReportStore({storage:()=>corrupted,now:()=>moment});
  assert.equal(clean.get(project),null);assert.equal(clean.submit({target:project,reason:'spam'}).ok,true);
 }
});

test('denied or exhausted session storage retains usable in-memory deduplication',()=>{
 for(const storage of [()=>{throw new Error('SecurityError');},()=>({getItem(){throw new Error('Denied');},setItem(){throw new Error('QuotaExceeded');}}),()=>null]){
  const store=createReportStore({storage,now:()=>moment});
  assert.equal(store.submit({target:project,reason:'harassment'}).ok,true);
  assert.equal(store.submit({target:project,reason:'spam'}).duplicate,true);
  assert.equal(store.get(project).reason,'harassment');assert.equal(store.get(project).createdAt,moment);
 }
});

test('local report retention is bounded while the most recent distinct targets survive a reload',()=>{
 const storage=memoryStorage(),store=createReportStore({storage:()=>storage,now:()=>moment});
 for(let i=0;i<205;i++)store.submit({target:{kind:'project',id:String(i)},reason:'spam'});
 const saved=JSON.parse(storage.saved);assert.equal(saved.reports.length,200);
 const restored=createReportStore({storage:()=>storage});
 assert.equal(restored.get({kind:'project',id:'4'}),null);assert.ok(restored.get({kind:'project',id:'5'}));assert.ok(restored.get({kind:'project',id:'204'}));
});

// A small native-like DOM exercises event lifetimes, validation and focus. It
// deliberately provides no layout or browser rendering assertions.
class Element extends EventTarget{
 constructor(tag,doc){super();this.tagName=tag;this.ownerDocument=doc;this.children=[];this.attributes=new Map();this.dataset={};this.value='';this.validityMessage='';this.open=false;this._text='';}
 // DOM events have no Node-specific listener warning; retain the actual abort
 // semantics while permitting the dialog's controls to share their lifecycle.
 addEventListener(type,callback,options){if(options?.signal)setMaxListeners(0,options.signal);super.addEventListener(type,callback,options);}
 set textContent(value){this._text=String(value);this.replaceChildren();}get textContent(){return this._text+this.children.map(node=>node.textContent).join('');}
 set innerHTML(value){this.ownerDocument.htmlWrites.push(String(value));this._text='';this.replaceChildren();}
 setAttribute(name,value){this.attributes.set(name,String(value));}getAttribute(name){return this.attributes.get(name)??null;}removeAttribute(name){this.attributes.delete(name);}
 append(...nodes){for(const node of nodes){node.remove();this.children.push(node);node.parentNode=this;}}
 replaceChildren(...nodes){for(const child of this.children)child.parentNode=null;this.children=[];this.append(...nodes);}
 remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;}}
 get isConnected(){return this===this.ownerDocument.body||Boolean(this.parentNode?.isConnected);}
 contains(node){return this===node||this.children.some(child=>child.contains(node));}
 closest(selector){if(selector==='[hidden]'&&this.hidden)return this;return this.parentNode?.closest(selector)||null;}
 focus(options){if(this.isConnected){this.ownerDocument.activeElement=this;this.focusOptions=options;}}
 setCustomValidity(message){this.validityMessage=message;}reportValidity(){this.validityReports=(this.validityReports||0)+1;if(this.validityMessage)this.focus();return !this.validityMessage;}
 showModal(){assert.equal(this.isConnected,true);this.open=true;this.ownerDocument.modal=this;}
 close(){this.open=false;if(this.ownerDocument.modal===this)this.ownerDocument.modal=null;this.dispatchEvent(new Event('close'));}
 getBoundingClientRect(){return {left:20,right:300,top:20,bottom:400,width:280,height:380};}
}
function domFixture(){
 const storage=memoryStorage(),doc={htmlWrites:[],defaultView:{sessionStorage:storage},createElement:tag=>new Element(tag,doc)};
 doc.body=new Element('body',doc);doc.activeElement=doc.body;
 const trigger=doc.createElement('button');doc.body.append(trigger);trigger.focus();
 const store=createReportStore({storage:()=>storage,now:()=>moment});
 const find=(root,predicate)=>{if(predicate(root))return root;for(const child of root.children){const found=find(child,predicate);if(found)return found;}return null;};
 const byClass=(root,name)=>find(root,node=>node.className?.split(' ').includes(name));
 const byTag=(root,tag)=>find(root,node=>node.tagName===tag);
 const open=(options={})=>openReportDialog({doc,target:project,trigger,store,...options});
 return {doc,storage,trigger,store,find,byClass,byTag,open};
}
function send(node,type,properties={}){const event=Object.assign(new Event(type,{cancelable:true}),properties);node.dispatchEvent(event);return event;}

test('dialog submission requires a valid reason, caps details, and saves locally without a network request',t=>{
 const fetch=t.mock.method(globalThis,'fetch',()=>{throw new Error('Reporting must stay local.');});
 const f=domFixture(),target={...project,title:'<img src=x onerror=alert(1)> & text'},api=f.open({target});
 assert.equal(api.dialog.open,true);assert.equal(f.doc.activeElement.tagName,'h2');
 assert.equal(f.byClass(api.dialog,'cp-report-target').textContent,target.title);
 assert.ok(f.doc.htmlWrites.every(value=>value.startsWith('<svg')));
 assert.equal(f.byClass(api.dialog,'cp-report-intro').textContent,'Choisissez le motif du signalement.');
 const form=f.byTag(api.dialog,'form'),reason=f.byTag(api.dialog,'select'),details=f.byTag(api.dialog,'textarea');
 assert.equal(details.maxLength,REPORT_DETAIL_LIMIT);assert.equal(reason.required,true);
 assert.equal(send(form,'submit').defaultPrevented,true);assert.ok(reason.validityMessage);assert.equal(f.doc.activeElement,reason);assert.equal(f.store.get(target),null);
 reason.value='privacy';send(reason,'change');assert.equal(reason.validityMessage,'');
 details.value='x'.repeat(REPORT_DETAIL_LIMIT+1);send(form,'submit');assert.ok(details.validityMessage);assert.equal(f.store.get(target),null);
 details.value='  Literal <script>text</script>  ';send(details,'input');assert.equal(details.validityMessage,'');send(form,'submit');
 assert.equal(f.store.get(target).details,'Literal <script>text</script>');assert.equal(f.storage.writes,1);
 assert.equal(f.doc.activeElement,f.byClass(api.dialog,'cp-report-result'));assert.equal(f.byTag(api.dialog,'select'),null);
 assert.equal(fetch.mock.callCount(),0);
 send(f.byClass(api.dialog,'cp-report-submit'),'click');assert.equal(api.dialog.isConnected,false);assert.equal(f.doc.activeElement,f.trigger);
});

test('reopening an existing report shows its recorded reason without allowing a second report',()=>{
 const f=domFixture();f.store.submit({target:project,reason:'privacy'});
 const api=f.open();assert.match(f.byClass(api.dialog,'cp-report-result').textContent,/déjà signalé/);
 assert.match(f.byClass(api.dialog,'cp-report-saved-reason').textContent,/vie privée/);assert.equal(f.byTag(api.dialog,'select'),null);
 assert.equal(f.doc.activeElement,f.byClass(api.dialog,'cp-report-result'));api.close();assert.equal(f.storage.writes,1);
});

test('Escape/cancel, explicit cancellation and replacing a dialog discard unsaved changes and restore the appropriate focus',()=>{
 const f=domFixture();let api=f.open();f.byTag(api.dialog,'select').value='spam';f.byTag(api.dialog,'textarea').value='Unsaved';
 assert.equal(send(api.dialog,'cancel').defaultPrevented,true);assert.equal(api.dialog.isConnected,false);assert.equal(f.doc.activeElement,f.trigger);assert.equal(f.store.get(project),null);
 api=f.open();send(f.byClass(api.dialog,'cp-report-cancel'),'click');assert.equal(api.dialog.isConnected,false);assert.equal(f.doc.activeElement,f.trigger);
 const old=f.open(),oldForm=f.byTag(old.dialog,'form'),oldReason=f.byTag(old.dialog,'select'),other=f.doc.createElement('button');f.doc.body.append(other);
 const current=f.open({trigger:other,target:{kind:'profile',id:'person'}});assert.equal(old.dialog.isConnected,false);assert.equal(current.dialog.open,true);assert.equal(f.doc.activeElement.tagName,'h2');
 oldReason.value='spam';send(oldForm,'submit');assert.equal(f.store.get(project),null);
 current.close();assert.equal(f.doc.activeElement,other);
});

test('aborting a route removes the dialog and listeners, without refocusing a removed or hidden trigger',()=>{
 const controller=new AbortController(),f=domFixture(),api=f.open({signal:controller.signal});
 const form=f.byTag(api.dialog,'form'),reason=f.byTag(api.dialog,'select');reason.value='spam';
 const next=f.doc.createElement('button');f.doc.body.append(next);next.focus();f.trigger.remove();controller.abort();
 assert.equal(api.dialog.isConnected,false);assert.equal(f.doc.activeElement,next);send(form,'submit');assert.equal(f.store.get(project),null);
 assert.equal(f.open({signal:controller.signal}),null);
 f.doc.body.append(f.trigger);f.trigger.hidden=true;const hidden=f.open();next.focus();hidden.close();assert.equal(f.doc.activeElement,next);
});

test('backdrop dismissal requires a gesture starting and ending outside the dialog',()=>{
 const f=domFixture(),api=f.open();
 send(api.dialog,'pointerdown',{clientX:50,clientY:50});send(api.dialog,'click',{clientX:10,clientY:10});assert.equal(api.dialog.isConnected,true);
 send(api.dialog,'pointerdown',{clientX:10,clientY:10});send(api.dialog,'click',{clientX:50,clientY:50});assert.equal(api.dialog.isConnected,true);
 send(api.dialog,'pointerdown',{clientX:10,clientY:10});send(api.dialog,'click',{clientX:10,clientY:10});assert.equal(api.dialog.isConnected,false);assert.equal(f.doc.activeElement,f.trigger);
});

test('report buttons preserve translated accessible names and open the targeted local dialog',()=>{
 for(const [locale,label,direction]of [['fr','Signaler ce commentaire','ltr'],['en','Report this comment','ltr'],['ar','الإبلاغ عن هذا التعليق','rtl']]){
  const f=domFixture(),controller=new AbortController(),target=comment('article','chronicle');
  const button=createReportButton({doc:f.doc,target,locale,signal:controller.signal});f.doc.body.append(button);
  assert.equal(button.getAttribute('aria-label'),label);assert.equal(button.getAttribute('aria-haspopup'),'dialog');send(button,'click');
  const dialog=f.doc.modal;assert.equal(dialog.dir,direction);assert.equal(dialog.lang,locale);assert.equal(f.byTag(dialog,'h2').textContent,label);
  f.byTag(dialog,'select').value='other';send(f.byTag(dialog,'form'),'submit');
  const saved=createReportStore({storage:()=>f.storage});assert.ok(saved.get(target));assert.equal(saved.get(comment('project','chronicle')),null);
  controller.abort();assert.equal(dialog.isConnected,false);send(button,'click');assert.equal(f.doc.modal,null);
 }
});
