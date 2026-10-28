import test from 'node:test';
import assert from 'node:assert/strict';
import {attachCommentMentionPicker} from '../comment-mention-picker.mjs';
import {profiles} from '../profile-data.mjs';

class Element extends EventTarget{
 constructor(tag,doc){super();this.tagName=tag;this.doc=doc;this.children=[];this.attributes={};this.dataset={};this.value='';this.selectionStart=0;this.selectionEnd=0;this.maxLength=2000;}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 setAttribute(key,value){this.attributes[key]=String(value);}
 getAttribute(key){return this.attributes[key]??null;}
 removeAttribute(key){delete this.attributes[key];}
 focus(){this.doc.activeElement=this;this.dispatchEvent(new Event('focus'));}
 setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end;}
 scrollIntoView(){}
}
const event=(type,props={})=>Object.assign(new Event(type,{cancelable:true}),props);
function fixture(options={}){
 const doc={baseURI:'http://localhost/demo/',activeElement:null,createElement:tag=>new Element(tag,doc)};
 const input=doc.createElement('textarea');input.id='comment';doc.activeElement=input;
 let mentions=[],changes=[],limits=0;
 const picker=attachCommentMentionPicker({doc,input,profiles,locale:'fr',getMentions:()=>mentions,onChange:change=>{mentions=change.mentions;changes.push(change);},onLimit:()=>limits++,...options});
 const type=value=>{input.value=value;input.setSelectionRange(value.length,value.length);input.dispatchEvent(new Event('input'));};
 const key=(value,extra={})=>{const e=event('keydown',{key:value,...extra});input.dispatchEvent(e);return e;};
 return {doc,input,picker,type,key,list:picker.element.children[1],get changes(){return changes;},get mentions(){return mentions;},get limits(){return limits;}};
}

test('typing @ progressively filters profiles, and the login inserts the accented full name',()=>{
 const f=fixture({profiles:profiles.filter(profile=>!profile.demo)});f.type('@');assert.equal(f.picker.element.hidden,false);assert.equal(f.list.children.length,6);
 f.type('@i');assert.equal(f.list.children[0].dataset.mentionProfile,'profile-ines-morel');assert.ok(f.list.children.length<6);
 f.type('@ine');assert.deepEqual(f.list.children.map(el=>el.dataset.mentionProfile),['profile-ines-morel']);
 f.type('@imorel');assert.equal(f.key('Enter').defaultPrevented,true);
 assert.equal(f.input.value,'@Inès Morel ');assert.equal(f.input.selectionStart,f.input.value.length);
 assert.equal(f.mentions[0].profileId,'profile-ines-morel');assert.equal(f.changes.length,1);
 assert.equal(f.picker.element.hidden,true);assert.equal(f.doc.activeElement,f.input);assert.equal(f.input.getAttribute('aria-activedescendant'),null);
});

test('new demonstration profiles can also be mentioned by their full name',()=>{
 const profile=profiles.find(item=>item.demo),f=fixture();
 f.type('@'+profile.title.fr.replaceAll(' ','-'));
 assert.equal(f.list.children[0].dataset.mentionProfile,profile.id);
 f.key('Enter');
 assert.equal(f.mentions[0].profileId,profile.id);
 assert.equal(f.input.value,'@'+profile.title.fr+' ');
});

test('accented and unaccented hyphenated names can be picked with a pointer inside surrounding text',()=>{
 for(const query of ['inès-morel','ines-morel']){
  const f=fixture();f.type('Bonjour @'+query+' !');f.input.setSelectionRange(9+query.length,9+query.length);f.input.dispatchEvent(new Event('click'));
  assert.equal(f.list.children.length,1);
  const down=event('pointerdown');f.list.children[0].dispatchEvent(down);assert.equal(down.defaultPrevented,true);
  f.list.children[0].dispatchEvent(new Event('click'));
  assert.equal(f.input.value,'Bonjour @Inès Morel !');assert.equal(f.changes.length,1);
 }
});

test('keyboard selection keeps focus in the multiline field and Escape dismisses without inserting',()=>{
 const f=fixture();f.type('@');const second=f.list.children[1];f.key('ArrowDown');
 assert.equal(second.getAttribute('aria-selected'),'true');assert.equal(f.input.getAttribute('aria-activedescendant'),second.id);assert.equal(f.doc.activeElement,f.input);
 assert.equal(f.key('Escape').defaultPrevented,true);assert.equal(f.picker.element.hidden,true);assert.equal(f.input.value,'@');assert.equal(f.changes.length,0);
 f.picker.refresh();assert.equal(f.picker.element.hidden,true);
 f.type('@i');assert.equal(f.picker.element.hidden,false);f.key('Tab');assert.equal(f.picker.element.hidden,true);
});

test('composition, modified Enter and an empty result never choose a profile accidentally',()=>{
 const f=fixture();f.type('@ines');assert.equal(f.key('Enter',{shiftKey:true}).defaultPrevented,false);assert.equal(f.changes.length,0);
 f.input.dispatchEvent(new Event('compositionstart'));assert.equal(f.picker.element.hidden,true);
 assert.equal(f.key('Enter',{isComposing:true}).defaultPrevented,false);
 f.input.dispatchEvent(new Event('compositionend'));assert.equal(f.picker.element.hidden,false);
 f.type('@personne-inexistante');assert.equal(f.list.children.length,0);assert.equal(f.key('Enter').defaultPrevented,false);assert.equal(f.changes.length,0);
});

test('a mention that cannot fit is refused in full and leaves the text and selection intact',()=>{
 const f=fixture();f.input.maxLength=12;f.type('Salut @i');f.key('Enter');
 assert.equal(f.input.value,'Salut @i');assert.equal(f.limits,1);assert.equal(f.changes.length,0);assert.equal(f.mentions.length,0);assert.equal(f.picker.element.hidden,true);
});

test('an existing mention does not reopen suggestions inside its visible full name',()=>{
 const f=fixture();f.type('@imorel');f.key('Enter');f.input.setSelectionRange(5,5);f.input.dispatchEvent(new Event('click'));
 assert.equal(f.picker.element.hidden,true);assert.equal(f.changes.length,1);
});

test('selecting text or moving to a stale token leaves Enter available for native text editing',()=>{
 const f=fixture();f.type('@i');f.input.setSelectionRange(0,2);f.input.dispatchEvent(new Event('select'));
 assert.equal(f.picker.element.hidden,true);assert.equal(f.key('Enter').defaultPrevented,false);
 f.type('@i');f.input.setSelectionRange(0,2);
 assert.equal(f.key('Enter').defaultPrevented,false);assert.equal(f.picker.element.hidden,true);assert.equal(f.changes.length,0);
});
