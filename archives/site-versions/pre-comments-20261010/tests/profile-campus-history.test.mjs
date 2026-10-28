import test from 'node:test';
import assert from 'node:assert/strict';
import {profiles,getProfileCampusContext,normalizeProfileCampusHistory} from '../profile-data.mjs';
import {renderProfileCampusInfo,renderProfileCampusHistory} from '../profile-ui.mjs';

class Element extends EventTarget {
 constructor(tagName){super();this.tagName=tagName;this.children=[];this.attributes={};this.dataset={};this.classList={add(){}};}
 append(...children){this.children.push(...children);}
 prepend(...children){this.children.unshift(...children);}
 setAttribute(name,value){this.attributes[name]=String(value);}
}
const descendants=root=>root?[root,...root.children.flatMap(descendants)]:[];
const textOf=root=>[root.textContent||'',...root.children.map(textOf)].join('');
const byFact=(root,key)=>descendants(root).find(element=>element.dataset.profileFact===key);
const campusNames={paris:'42 Paris',lyon:'42 Lyon',tokyo:'42 Tokyo'};
function render(fn,profile,locale='fr',onExploreCampus){
 const previous=globalThis.document;
 globalThis.document={createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag),createTextNode:text=>Object.assign(new Element('#text'),{textContent:text})};
 try{return fn({profile,locale,getCampusName:id=>campusNames[id],onExploreCampus});}
 finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
}
const original={id:'test-profile',status:'student',campus:'paris',arrivalYear:2024,promotionNumber:8};
const first={campus:'paris',date:'2024'};

test('the six existing profiles gain no invented transfers or current-campus field',()=>{
 for(const profile of profiles){
  assert.equal(profile.campusHistory,undefined);
  const context=getProfileCampusContext(profile);
  assert.equal(context.originCampus,profile.campus);assert.equal(context.currentCampus,profile.campus);
  assert.equal(context.arrivalYear,profile.arrivalYear);assert.equal(context.promotionNumber,profile.promotionNumber);
  assert.equal(context.hasCampusChanges,false);assert.deepEqual(context.history,[{campus:profile.campus,date:String(profile.arrivalYear)}]);
  assert.equal(byFact(render(renderProfileCampusInfo,profile),'currentCampus'),undefined);
  assert.equal(render(renderProfileCampusHistory,profile),null);
 }
});

test('A to B retains the first campus, enrollment year and cohort without mutating discovery campus',()=>{
 const profile={...original,campus:'lyon',campusHistory:[first,{campus:'lyon',date:'2025-09',promotionNumber:99}]};
 const snapshot=JSON.stringify(profile),context=getProfileCampusContext(profile);
 assert.equal(context.originCampus,'paris');assert.equal(context.currentCampus,'lyon');assert.equal(context.hasCampusChanges,true);
 assert.equal(context.arrivalYear,2024);assert.equal(context.promotionNumber,8);assert.equal(profile.campus,'lyon');
 assert.equal(JSON.stringify(profile),snapshot);
 const info=render(renderProfileCampusInfo,profile);
 assert.equal(textOf(byFact(info,'campus')),'Campus42 Paris');assert.equal(textOf(byFact(info,'currentCampus')),'Campus actuel42 Lyon');
 assert.equal(textOf(byFact(info,'promotionNumber')),'Promotion8');assert.equal(textOf(byFact(info,'arrivalYear')),'Rentrée2024');
});

test('A to B to A still has changes and shows Current campus even when current equals origin',()=>{
 const profile={...original,campusHistory:[first,{campus:'lyon',date:'2025-09-01'},{campus:'paris',date:'2026-02-15'}]};
 const context=getProfileCampusContext(profile);
 assert.equal(context.originCampus,context.currentCampus);assert.equal(context.hasCampusChanges,true);assert.equal(context.promotionNumber,8);
 assert.equal(textOf(byFact(render(renderProfileCampusInfo,profile),'currentCampus')),'Campus actuel42 Paris');
 const history=render(renderProfileCampusHistory,profile);
 assert.deepEqual(descendants(history).filter(el=>el.tagName==='li').map(el=>el.dataset.campus),['paris','lyon','paris']);
 assert.deepEqual(descendants(history).filter(el=>el.tagName==='time').map(el=>el.dateTime),['2024','2025-09-01','2026-02-15']);
});

test('consecutive repeats are not transfers; missing dates and malformed input do not invent chronology',()=>{
 const history=[null,{},first,{campus:'paris',date:'2025'},{campus:'lyon',date:'2025-02-30'},{campus:'lyon'},{campus:'tokyo'}];
 assert.deepEqual(normalizeProfileCampusHistory(history),[{campus:'paris',date:'2024'},{campus:'lyon',date:null},{campus:'tokyo',date:null}]);
 assert.equal(getProfileCampusContext({...original,campusHistory:[first,{campus:'paris',date:'2025'}]}).hasCampusChanges,false);
 assert.equal(getProfileCampusContext({...original,campus:'lyon',campusHistory:[first]}).hasCampusChanges,false,'a current-campus mismatch alone is not a recorded transfer');
 assert.equal(getProfileCampusContext({campusHistory:[{campus:'paris',date:'2024-09'}]}).arrivalYear,2024);
 assert.deepEqual(normalizeProfileCampusHistory('not an array'),[]);
 const rendered=render(renderProfileCampusHistory,{...original,campus:'tokyo',campusHistory:history});
 assert.deepEqual(descendants(rendered).filter(el=>el.tagName==='time').map(el=>el.dateTime),['2024']);
});

test('FR EN AR labels and dates cover the conditional overview and supplied transfer history',()=>{
 const profile={...original,campus:'lyon',campusHistory:[first,{campus:'lyon',date:'2025-09-01'}]};
 const expected={fr:['Campus actuel','Historique des campus','Première rentrée','Changement de campus'],en:['Current campus','Campus history','First enrollment','Campus transfer'],ar:['الحرم الحالي','سجلّ الأحرام','الالتحاق الأول','الانتقال إلى حرم آخر']};
 for(const [locale,[current,title,initial,transfer]] of Object.entries(expected)){
  const info=render(renderProfileCampusInfo,profile,locale),history=render(renderProfileCampusHistory,profile,locale);
  assert.equal(textOf(byFact(info,'currentCampus')),current+'42 Lyon');
  assert.equal(history.children[0].textContent,title);assert.ok(textOf(history).includes(initial));assert.ok(textOf(history).includes(transfer));
  assert.ok(descendants(history).filter(el=>el.tagName==='time').every(el=>el.textContent.length>0));
 }
});

test('Explore opens the first campus without changes and the current campus after any recorded transfer',()=>{
 const scenarios=[
  [{...original},'paris'],
  [{...original,campus:'lyon',campusHistory:[first]},'paris'],
  [{...original,campus:'lyon',campusHistory:[first,{campus:'lyon',date:'2025'}]},'lyon'],
  [{...original,campusHistory:[first,{campus:'lyon',date:'2025'},{campus:'paris',date:'2026'}]},'paris']
 ];
 for(const [profile,destination] of scenarios){
  let opened=null,passedProfile=null;
  const root=render(renderProfileCampusInfo,profile,'fr',(_event,person,campus)=>{opened=campus;passedProfile=person;});
  const button=descendants(root).find(el=>el.tagName==='button');
  assert.ok(textOf(button).includes('Explorer '+campusNames[destination]));button.dispatchEvent(new Event('click'));
  assert.equal(opened,destination);assert.equal(passedProfile,profile);
 }
});
