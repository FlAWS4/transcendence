import test from 'node:test';
import assert from 'node:assert/strict';
import {mountAccountMenu} from '../account-menu.mjs';
const all=root=>[root,...root.children.flatMap(all)];
class Element extends EventTarget{
 constructor(tag,doc){super();this.tagName=tag;this.ownerDocument=doc;this.children=[];this.dataset={};this.attributes={};this.hidden=false;this.style={};this.className='';this.classList={add:name=>{this.className+=' '+name;},toggle:(name,on)=>{if(on)this.className+=' '+name;else this.className=this.className.replace(name,'');}};}
 append(...children){for(const child of children){child.remove();child.parentElement=this;this.children.push(child);}}
 prepend(child){child.remove();child.parentElement=this;this.children.unshift(child);}
 insertBefore(child,next){child.remove();child.parentElement=this;this.children.splice(this.children.indexOf(next),0,child);}
 before(child){this.parentElement.insertBefore(child,this);}
 remove(){if(this.parentElement){this.parentElement.children=this.parentElement.children.filter(child=>child!==this);this.parentElement=null;}}
 replaceChildren(...children){for(const child of [...this.children])child.remove();this.append(...children);}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 contains(node){return all(this).includes(node);}
 querySelectorAll(selector){return all(this).slice(1).filter(node=>{
  if(selector==='button:not(:disabled)')return node.tagName==='button'&&!node.disabled;
  const data=selector.match(/^\[data-([\w-]+)(?:="([^"]+)")?\]$/);
  if(data){const key=data[1].replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());return data[2]?node.dataset[key]===data[2]:Object.hasOwn(node.dataset,key);}
  if(selector.startsWith('#'))return node.id===selector.slice(1);
  return node.tagName===selector;
 });}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 focus(){this.ownerDocument.activeElement=this;}
 getBoundingClientRect(){return {bottom:88};}
}
function fixture(){
 const doc=new EventTarget(),view=new EventTarget();view.innerHeight=700;doc.defaultView=view;doc.createElement=tag=>new Element(tag,doc);
 const utilities=doc.createElement('div'),trigger=doc.createElement('button');utilities.append(trigger);
 let identity='visitor',locale='fr',theme='light';const calls=[];
 const profile={title:{fr:'Leïla Mansour',en:'Leïla Mansour',ar:'ليلى منصور'},avatar:'./assets/profile-avatars/leila-mansour.svg'};
 const controller=mountAccountMenu({trigger,utilities,getIdentity:()=>identity,getLocale:()=>locale,getProfile:()=>profile,getTheme:()=>theme,
  onTheme:value=>{theme=value;controller.refresh();},onLocale:value=>{locale=value;controller.refresh();},onAccount:()=>calls.push('account'),onSignIn:()=>calls.push('signin'),onSignOut:()=>{identity='visitor';controller.refresh();calls.push('signout');},onProfiles:()=>calls.push('profiles')});
 const find=selector=>utilities.querySelector(selector),panel=find('#account-menu');
 return {doc,view,utilities,trigger,controller,panel,find,calls,member(){identity='member';controller.refresh();},get theme(){return theme;},get locale(){return locale;}};
}
const click=node=>node.dispatchEvent(new Event('click'));
const key=(node,value)=>{const event=new Event('keydown',{cancelable:true});event.key=value;node.dispatchEvent(event);return event;};
test('visitor has one generic account access and theme/language settings, without member utilities',()=>{
 const f=fixture();assert.equal(f.trigger.getAttribute('aria-label'),'Menu du compte');assert.equal(f.find('#account-messages').hidden,true);assert.equal(f.find('#account-notifications').hidden,true);
 click(f.trigger);assert.equal(f.panel.hidden,false);assert.ok(f.find('[data-account-action="signin"]'));assert.equal(f.find('[data-account-action="account"]'),null);
 click(f.find('[data-account-action="settings"]'));assert.equal(f.panel.querySelectorAll('[data-account-theme]').length,3);assert.equal(f.panel.querySelectorAll('[data-account-locale]').length,3);
});
test('settings update shared preferences and keep the selected control focused across refresh',()=>{
 const f=fixture();f.controller.open();click(f.find('[data-account-action="settings"]'));
 f.find('[data-account-theme="dark"]').focus();click(f.doc.activeElement);assert.equal(f.theme,'dark');assert.equal(f.panel.hidden,false);assert.equal(f.doc.activeElement.dataset.accountTheme,'dark');assert.equal(f.doc.activeElement.getAttribute('aria-pressed'),'true');
 f.find('[data-account-locale="ar"]').focus();click(f.doc.activeElement);assert.equal(f.locale,'ar');assert.equal(f.doc.activeElement.dataset.accountLocale,'ar');assert.equal(f.find('#account-menu-title').textContent,'الإعدادات');assert.equal(f.trigger.getAttribute('aria-label'),'قائمة الحساب');
});
test('Theme and Language each open only their category for visitor and member, with focused return',()=>{
 for(const isMember of [false,true]){
  const f=fixture();if(isMember)f.member();f.controller.open();
  for(const [action,group,other,title]of [['theme','theme','locale','Thème'],['language','locale','theme','Langue']]){
   click(f.find(`[data-account-action="${action}"]`));assert.equal(f.find('#account-menu-title').textContent,title);
   assert.equal(f.panel.querySelectorAll(`[data-account-${group}]`).length,3);assert.equal(f.panel.querySelectorAll(`[data-account-${other}]`).length,0);
   assert.ok(Object.hasOwn(f.doc.activeElement.dataset,group==='theme'?'accountTheme':'accountLocale'));
   click(f.find('[data-account-action="back"]'));assert.equal(f.find('#account-menu-title').textContent,'Menu du compte');assert.equal(f.doc.activeElement.dataset.accountAction,action);
  }
  click(f.find('[data-account-action="settings"]'));assert.equal(f.panel.querySelectorAll('[data-account-theme]').length,3);assert.equal(f.panel.querySelectorAll('[data-account-locale]').length,3);
 }
});
test('dedicated preferences retain their screen and focused selection through updates in all locales',()=>{
 const f=fixture();f.controller.open();click(f.find('[data-account-action="language"]'));
 for(const [locale,title]of [['en','Language'],['ar','اللغة'],['fr','Langue']]){
  f.find(`[data-account-locale="${locale}"]`).focus();click(f.doc.activeElement);assert.equal(f.locale,locale);assert.equal(f.find('#account-menu-title').textContent,title);
  assert.equal(f.panel.querySelectorAll('[data-account-theme]').length,0);assert.equal(f.doc.activeElement.dataset.accountLocale,locale);assert.equal(f.doc.activeElement.getAttribute('aria-pressed'),'true');
 }
 click(f.find('[data-account-action="back"]'));click(f.find('[data-account-action="theme"]'));
 for(const theme of ['dark','system','light']){
  f.find(`[data-account-theme="${theme}"]`).focus();click(f.doc.activeElement);assert.equal(f.theme,theme);assert.equal(f.find('#account-menu-title').textContent,'Thème');
  assert.equal(f.panel.querySelectorAll('[data-account-locale]').length,0);assert.equal(f.doc.activeElement.dataset.accountTheme,theme);assert.equal(f.doc.activeElement.getAttribute('aria-pressed'),'true');
 }
 key(f.panel,'Home');assert.equal(f.doc.activeElement.dataset.accountAction,'back');key(f.panel,'End');assert.equal(f.doc.activeElement.dataset.accountTheme,'system');
 key(f.panel,'Escape');assert.equal(f.panel.hidden,true);assert.equal(f.doc.activeElement,f.trigger);
});
test('simulated member receives the supplied avatar and account action, and signs out locally',()=>{
 const f=fixture();f.member();assert.equal(f.trigger.querySelector('img').src,'./assets/profile-avatars/leila-mansour.svg');assert.equal(f.find('#account-messages').hidden,false);assert.equal(f.find('#account-notifications').hidden,false);
 f.controller.open();click(f.find('[data-account-action="account"]'));assert.deepEqual(f.calls,['account']);assert.equal(f.panel.hidden,true);
 f.controller.open();click(f.find('[data-account-action="signout"]'));assert.equal(f.find('#account-messages').hidden,true);assert.equal(f.trigger.querySelector('img'),null);assert.equal(f.doc.activeElement,f.trigger);assert.deepEqual(f.calls,['account','signout']);
});
test('messages and notifications open truthful empty panels and Escape restores the associated trigger',()=>{
 const f=fixture();f.member();const messages=f.find('#account-messages');click(messages);assert.equal(f.find('#account-menu-title').textContent,'Messagerie');assert.ok(f.find('[data-account-action="profiles"]'));assert.equal(f.panel.querySelector('strong').textContent,'Aucune conversation pour le moment');
 key(f.panel,'Escape');assert.equal(f.panel.hidden,true);assert.equal(f.doc.activeElement,messages);
 click(f.find('#account-notifications'));assert.equal(f.panel.querySelector('strong').textContent,'Aucune notification');key(f.panel,'Escape');assert.equal(f.doc.activeElement,f.find('#account-notifications'));
});
test('keyboard arrows move focus, external focus and pointer close without stealing focus',()=>{
 const f=fixture();assert.equal(key(f.trigger,'ArrowDown').defaultPrevented,true);const first=f.doc.activeElement;key(f.panel,'End');assert.notEqual(f.doc.activeElement,first);key(f.panel,'Home');assert.equal(f.doc.activeElement,first);key(f.panel,'ArrowDown');assert.notEqual(f.doc.activeElement,first);
 const outside=f.doc.createElement('button');outside.focus();const blur=new Event('focusout');blur.relatedTarget=outside;f.utilities.dispatchEvent(blur);assert.equal(f.panel.hidden,true);assert.equal(f.doc.activeElement,outside);
 f.controller.open();const pointer=new Event('pointerdown');Object.defineProperty(pointer,'target',{value:outside});f.doc.dispatchEvent(pointer);assert.equal(f.panel.hidden,true);
});
test('guest sign-in is delegated without inventing an authenticated identity',()=>{
 const f=fixture();f.controller.open();click(f.find('[data-account-action="signin"]'));assert.deepEqual(f.calls,['signin']);assert.equal(f.panel.hidden,true);assert.equal(f.find('#account-messages').hidden,true);
});
test('destroy removes member utilities and returns the original trigger to the header',()=>{
 const f=fixture();f.member();f.controller.open();f.controller.destroy();assert.equal(f.trigger.parentElement,f.utilities);assert.equal(f.find('#account-menu'),null);assert.equal(f.find('#account-messages'),null);click(f.trigger);assert.equal(f.panel.hidden,true);
});
