import test from 'node:test';
import assert from 'node:assert/strict';
import {setMaxListeners} from 'node:events';
import {renderProjectDetail,clearProjectDetail} from '../project-ui.mjs';
import {renderJournalDetail,clearJournalDetail} from '../journal-ui.mjs';
import {renderProfileDetail,clearProfileDetail} from '../profile-ui.mjs';

// Native-like DOM for behavior/lifecycle checks. Layout, focus trapping and the
// browser's Escape-to-cancel dispatch still require an actual browser check.
const descendants=root=>[root,...root.children.flatMap(descendants)];
const byClass=(root,name)=>descendants(root).filter(node=>node.className?.split(' ').includes(name));
class Element extends EventTarget{
 constructor(tag,doc){super();this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.children=[];this.dataset={};this.attributes=new Map();this._text='';this.style={setProperty(){}};this.classList={add:(...names)=>{this.className=[this.className,...names].filter(Boolean).join(' ');}};}
 addEventListener(type,callback,options){if(options?.signal)setMaxListeners(0,options.signal);super.addEventListener(type,callback,options);}
 set textContent(value){this._text=String(value);this.replaceChildren();}get textContent(){return this._text+this.children.map(node=>node.textContent).join('');}
 set innerHTML(value){this._html=String(value);this.replaceChildren();}get innerHTML(){return this._html;}
 setAttribute(name,value){this.attributes.set(name,String(value));}getAttribute(name){return this.attributes.get(name)??null;}removeAttribute(name){this.attributes.delete(name);}
 append(...nodes){for(const node of nodes){node.remove();this.children.push(node);node.parentNode=this;}}
 replaceChildren(...nodes){for(const child of this.children)child.parentNode=null;this.children=[];this.append(...nodes);}
 remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;}}
 get isConnected(){return this===this.ownerDocument.body||Boolean(this.parentNode?.isConnected);}
 contains(node){return this===node||this.children.some(child=>child.contains(node));}
 closest(selector){if(selector==='[hidden]'&&this.hidden)return this;return this.parentNode?.closest(selector)||null;}
 querySelector(selector){return descendants(this).find(node=>selector.startsWith('.')?node.className?.split(' ').includes(selector.slice(1)):node.tagName===selector.toUpperCase())||null;}
 focus(options){if(this.isConnected){this.ownerDocument.activeElement=this;this.focusOptions=options;}}
 showModal(){assert.equal(this.isConnected,true);this.open=true;this.ownerDocument.modal=this;}
 close(){this.open=false;if(this.ownerDocument.modal===this)this.ownerDocument.modal=null;this.dispatchEvent(new Event('close'));}
 getBoundingClientRect(){return {left:20,right:300,top:20,bottom:400,width:280,height:380};}
 cloneNode(deep){const result=new Element(this.tagName,this.ownerDocument);result._text=this._text;result._html=this._html;result.className=this.className;result.attributes=new Map(this.attributes);result.dataset={...this.dataset};if(deep)result.append(...this.children.map(child=>child.cloneNode(true)));return result;}
}
const entry={id:'one-project',section:'projects',campus:'paris',campusIds:['paris','tokyo'],title:'One shared project',cover:'shell',summary:'One description',tags:[],body:[]};
const campusOptions=[{id:'paris',name:'42 Paris',countryName:'France'},{id:'tokyo',name:'42 Tokyo',countryName:'Japon'}];
function fixture(t){
 const previous=globalThis.document,doc=new EventTarget(),view=new EventTarget();doc.baseURI='https://horizon.example/';doc.defaultView=view;
 doc.createElement=tag=>new Element(tag,doc);doc.createElementNS=(_,tag)=>doc.createElement(tag);doc.createTextNode=text=>Object.assign(doc.createElement('text'),{textContent:text});
 doc.body=doc.createElement('body');doc.activeElement=doc.body;view.matchMedia=()=>new EventTarget();view.cancelAnimationFrame=()=>{};
 const container=doc.createElement('div');doc.body.append(container);globalThis.document=doc;
 t.after(()=>{clearProjectDetail(container);clearJournalDetail(container);clearProfileDetail(container);if(previous===undefined)delete globalThis.document;else globalThis.document=previous;});
 const calls=[];
 const render=(options={},renderer=renderProjectDetail)=>renderer({container,entry,campusName:'42 Paris',campusOptions,getSectionHref:key=>'#project?tab='+key,onSectionNavigate(){},onBack(){},onExploreCampus:(...args)=>calls.push(args),...options});
 const trigger=()=>byClass(container,'cp-project-campus')[0];
 return {doc,container,calls,render,trigger};
}
function send(node,type,properties={}){const event=Object.assign(new Event(type,{cancelable:true}),properties);node.dispatchEvent(event);return event;}

test('a shared project names every associated campus once and chooses a destination without changing its identity',t=>{
 const f=fixture(t);f.render({entry:{...entry,campusIds:['paris','tokyo','paris']}});
 const names=byClass(f.container,'cp-project-campus-names')[0];assert.equal(names.textContent,'42 Paris · 42 Tokyo');assert.equal(names.children.filter(node=>node.tagName==='BDI').length,2);
 const trigger=f.trigger();assert.equal(trigger.textContent,'Explorer un campus');assert.equal(trigger.getAttribute('aria-haspopup'),'dialog');send(trigger,'click');
 const dialog=f.doc.modal,choices=byClass(dialog,'cp-project-campus-choice');assert.ok(dialog.open);assert.equal(dialog.lang,'fr');assert.equal(dialog.dir,'ltr');assert.equal(choices.length,2);assert.equal(f.doc.activeElement,choices[0]);assert.equal(f.calls.length,0);
 assert.equal(choices[1].textContent,'42 TokyoJapon');assert.equal(trigger.getAttribute('aria-expanded'),'true');assert.equal(trigger.getAttribute('aria-controls'),dialog.id);
 send(choices[1],'click');assert.equal(dialog.isConnected,false);assert.deepEqual(f.calls, [['tokyo',trigger]]);assert.equal(trigger.getAttribute('aria-expanded'),'false');assert.equal(trigger.getAttribute('aria-controls'),null);
 assert.equal(f.container.querySelector('h1').textContent,entry.title);assert.equal(entry.id,'one-project');
});

test('native Escape/cancel and the dismiss action restore the original trigger without opening a campus',t=>{
 const f=fixture(t);f.render();const trigger=f.trigger();trigger.focus();send(trigger,'click');const dialog=f.doc.modal;
 assert.equal(send(dialog,'cancel').defaultPrevented,true);assert.equal(dialog.isConnected,false);assert.equal(f.doc.activeElement,trigger);assert.deepEqual(trigger.focusOptions,{preventScroll:true});assert.equal(f.calls.length,0);
 send(trigger,'click');const reopened=f.doc.modal;send(byClass(reopened,'cp-project-campus-dismiss')[0],'click');assert.equal(reopened.isConnected,false);assert.equal(f.doc.activeElement,trigger);assert.equal(f.calls.length,0);
});

test('a pointer gesture inside then outside does not dismiss; a backdrop gesture does',t=>{
 const f=fixture(t);f.render();send(f.trigger(),'click');const dialog=f.doc.modal;
 send(dialog,'pointerdown',{clientX:50,clientY:50});send(dialog,'click',{clientX:0,clientY:0});assert.equal(dialog.open,true);
 send(dialog,'pointerdown',{clientX:0,clientY:0});send(dialog,'click',{clientX:0,clientY:0});assert.equal(dialog.isConnected,false);assert.equal(f.doc.activeElement,f.trigger());assert.equal(f.calls.length,0);
});

test('changing a section removes its dialog and prevents stale choices from navigating',t=>{
 const f=fixture(t);f.render();const oldTrigger=f.trigger();send(oldTrigger,'click');const dialog=f.doc.modal,choice=byClass(dialog,'cp-project-campus-choice')[1];
 f.render({activeSection:'implementation'});assert.equal(dialog.isConnected,false);assert.equal(f.doc.modal,null);
 send(choice,'click');send(oldTrigger,'click');assert.equal(f.calls.length,0);assert.equal(f.doc.modal,null);
});

test('one-campus projects keep a direct Explore action, including the legacy single-campus field',t=>{
 const f=fixture(t);f.render({entry:{...entry,campusIds:['tokyo']}});let trigger=f.trigger();assert.equal(trigger.textContent,'Explorer 42 Tokyo');assert.equal(trigger.getAttribute('aria-haspopup'),null);send(trigger,'click');assert.deepEqual(f.calls,[['tokyo',trigger]]);assert.equal(f.doc.modal,undefined);
 const legacy={...entry};delete legacy.campusIds;f.render({entry:legacy,campusOptions:undefined});trigger=f.trigger();assert.equal(trigger.textContent,'Explorer 42 Paris');send(trigger,'click');assert.deepEqual(f.calls[1],['paris',trigger]);
});

test('a project with no associated or resolvable campus never gets a misleading Explore action',t=>{
 const f=fixture(t);for(const options of [{entry:{...entry,campusIds:[]}},{campusOptions:[]},{entry:{...entry,campus:undefined,campusIds:undefined},campusOptions:undefined}]){f.render(options);assert.equal(f.trigger(),undefined);assert.equal(byClass(f.container,'cp-project-campus-names').length,0);}
});

test('campus choices are localized in English and Arabic and names retain their own writing direction',t=>{
 const f=fixture(t);
 for(const [locale,label,title,close,dir] of [['en','Explore a campus','Choose a campus','Close','ltr'],['ar','استكشف أحد الفروع','اختر فرعًا','إغلاق','rtl']]){
  f.render({locale});assert.equal(f.trigger().textContent,label);send(f.trigger(),'click');const dialog=f.doc.modal;
  assert.equal(dialog.lang,locale);assert.equal(dialog.dir,dir);assert.equal(dialog.querySelector('h2').textContent,title);assert.equal(byClass(dialog,'cp-project-campus-dismiss')[0].textContent,close);
  assert.ok(descendants(dialog).filter(node=>node.tagName==='BDI').every(node=>node.dir==='auto'));
 }
});

test('articles ignore project campus associations and retain the existing event callback',t=>{
 const f=fixture(t);f.render({entry:{...entry,section:'journal'}},renderJournalDetail);
 const facts=byClass(f.container,'cp-project-facts')[0],trigger=f.trigger();assert.equal(facts.textContent,'42 Paris');assert.equal(trigger.textContent,'Explorer 42 Paris');assert.equal(trigger.getAttribute('aria-haspopup'),null);
 const event=send(trigger,'click');assert.equal(f.calls.length,1);assert.equal(f.calls[0][0],event);assert.equal(f.doc.modal,undefined);
});

test('profile project cards list all publication campuses while article contribution cards stay unchanged',t=>{
 const f=fixture(t),profile={id:'author',campus:'unrelated',title:'Author',avatar:'./portrait.svg',tags:[],milestones:[]};
 const render=activeSection=>renderProfileDetail({container:f.container,profile,activeSection,entries:[entry,{...entry,id:'article',section:'journal'}],getCampusName:id=>campusOptions.find(campus=>campus.id===id)?.name,getEntryHref:item=>'#'+item.id,getSectionHref:key=>'#profile/'+key});
 render('projects');const names=byClass(f.container,'cp-project-campus-names');assert.equal(names.length,1);assert.equal(names[0].textContent,'42 Paris · 42 Tokyo');assert.equal(byClass(f.container,'cp-profile-related-card').length,1);
 render('contribution');assert.equal(byClass(f.container,'cp-project-campus-names').length,0);assert.equal(byClass(f.container,'cp-profile-related-card').length,1);
});
