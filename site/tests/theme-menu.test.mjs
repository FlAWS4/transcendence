import test from 'node:test';
import assert from 'node:assert/strict';
import {mountThemeMenu} from '../theme-menu.mjs';
import {createThemePreferences} from '../theme-preferences.mjs';

const all=root=>[root,...root.children.flatMap(all)];
class Element extends EventTarget{
 constructor(tag,doc){super();this.tagName=tag;this.ownerDocument=doc;this.children=[];this.dataset={};this.attributes={};this.hidden=false;this.style={setProperty:(key,value)=>{this.style[key]=value;}};}
 append(...children){for(const child of children){child.parentElement=this;this.children.push(child);}}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 contains(target){return all(this).includes(target);}
 querySelectorAll(selector){return all(this).slice(1).filter(item=>selector==='[data-theme-choice]'?item.dataset.themeChoice:selector==='[data-theme-label]'?item.isLabel:item.tagName===selector);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 focus(){this.ownerDocument.activeElement=this;}
}
function fixture(){
 const doc=new EventTarget(),wrapper=new Element('div',doc),trigger=new Element('button',doc),menu=new Element('div',doc),icon=new Element('use',doc);menu.hidden=true;trigger.append(icon);wrapper.append(trigger,menu);
 const options=['light','dark','system'].map(mode=>{const option=new Element('button',doc),label=new Element('span',doc);option.dataset.themeChoice=mode;label.isLabel=true;option.append(label);menu.append(option);return option;});
 let locale='fr',opened=0;const mediaQuery=new EventTarget();mediaQuery.matches=false;
 const preferences=createThemePreferences({mediaQuery,onChange:()=>controller.refresh()});
 const controller=mountThemeMenu({wrapper,trigger,menu,preferences,getLocale:()=>locale,onOpen:()=>opened++});
 return {doc,wrapper,trigger,menu,icon,options,preferences,controller,setLocale:value=>{locale=value;controller.refresh();},get opened(){return opened;}};
}
const click=element=>element.dispatchEvent(new Event('click'));
const key=(element,value)=>{const event=new Event('keydown',{cancelable:true});event.key=value;element.dispatchEvent(event);return event;};

test('the menu opens on its current preference and one selection updates appearance, labels and focus',()=>{
 const f=fixture();assert.equal(f.trigger.getAttribute('aria-label'),'Choisir le thème · Clair');
 click(f.trigger);assert.equal(f.menu.hidden,false);assert.equal(f.doc.activeElement,f.options[0]);assert.equal(f.trigger.getAttribute('aria-expanded'),'true');
 click(f.options[1]);assert.equal(f.preferences.snapshot().preference,'dark');assert.equal(f.menu.hidden,true);assert.equal(f.doc.activeElement,f.trigger);assert.equal(f.icon.getAttribute('href'),'#i-moon');
 assert.deepEqual(f.options.map(option=>option.getAttribute('aria-checked')),['false','true','false']);
 click(f.trigger);assert.equal(f.doc.activeElement,f.options[1]);click(f.trigger);assert.equal(f.menu.hidden,true);assert.equal(f.opened,2);
});

test('arrows, Home, End and Escape navigate the three choices without changing a preference prematurely',()=>{
 const f=fixture();assert.equal(key(f.trigger,'ArrowUp').defaultPrevented,true);assert.equal(f.doc.activeElement,f.options[2]);
 key(f.menu,'ArrowDown');assert.equal(f.doc.activeElement,f.options[0]);key(f.menu,'ArrowUp');assert.equal(f.doc.activeElement,f.options[2]);
 key(f.menu,'Home');assert.equal(f.doc.activeElement,f.options[0]);key(f.menu,'End');assert.equal(f.doc.activeElement,f.options[2]);
 assert.equal(f.preferences.snapshot().preference,'light');assert.equal(key(f.menu,'Escape').defaultPrevented,true);assert.equal(f.doc.activeElement,f.trigger);assert.equal(f.menu.hidden,true);
 key(f.trigger,'ArrowDown');assert.equal(f.doc.activeElement,f.options[0]);
});

test('Tab closes before native traversal and outside pointer/focus dismiss without stealing focus',()=>{
 const f=fixture();f.controller.open();assert.equal(key(f.menu,'Tab').defaultPrevented,false);assert.equal(f.doc.activeElement,f.trigger);assert.equal(f.menu.hidden,true);
 f.controller.open();const pointer=new Event('pointerdown');Object.defineProperty(pointer,'target',{value:f.options[1]});f.doc.dispatchEvent(pointer);assert.equal(f.menu.hidden,false);
 const outside=new Element('button',f.doc);outside.focus();const blur=new Event('focusout');blur.relatedTarget=outside;f.wrapper.dispatchEvent(blur);assert.equal(f.menu.hidden,true);assert.equal(f.doc.activeElement,outside);
 f.controller.open();const external=new Event('pointerdown');Object.defineProperty(external,'target',{value:outside});f.doc.dispatchEvent(external);assert.equal(f.menu.hidden,true);
});

test('the selected System option and menu names are localized independently of the effective appearance',()=>{
 const f=fixture();f.controller.open();click(f.options[2]);assert.equal(f.preferences.snapshot().theme,'light');assert.equal(f.icon.getAttribute('href'),'#i-system');
 f.setLocale('ar');assert.deepEqual(f.options.map(option=>option.querySelector('[data-theme-label]').textContent),['فاتح','داكن','النظام']);assert.equal(f.trigger.getAttribute('aria-label'),'اختيار المظهر · النظام');
 f.setLocale('en-GB');assert.equal(f.menu.getAttribute('aria-label'),'Choose a theme');assert.equal(f.options[2].querySelector('[data-theme-label]').textContent,'System');
 f.setLocale('constructor');assert.equal(f.menu.getAttribute('aria-label'),'Choisir le thème');
 f.preferences.setPreference('dark');assert.equal(f.options[1].getAttribute('aria-checked'),'true');
});

test('destroy closes the popup and removes its event handlers',()=>{
 const f=fixture();f.controller.open();f.controller.destroy();assert.equal(f.menu.hidden,true);click(f.trigger);assert.equal(f.menu.hidden,true);
 click(f.options[1]);assert.equal(f.preferences.snapshot().preference,'light');
});
