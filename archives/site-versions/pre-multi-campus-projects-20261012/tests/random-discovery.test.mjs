import test from 'node:test';
import assert from 'node:assert/strict';
import {createRandomDiscovery,availableRandomEntries} from '../random-discovery.mjs';

const records=(...ids)=>ids.map(id=>({id,title:id}));
const draw=(picker,entries,count,options)=>Array.from({length:count},()=>picker.pick(entries,options)?.id??null);

test('empty sources have no destination and a current singleton can be drawn only once',()=>{
 const picker=createRandomDiscovery({random:()=>0});
 assert.equal(picker.pick([]),null);assert.equal(picker.pick(),null);
 assert.equal(picker.pick(records('a'),{currentId:'a'}).id,'a');
 assert.equal(picker.pick(records('a'),{currentId:'a'}),null);
 assert.deepEqual(availableRandomEntries(records('a'),'a'),[]);
});

test('one distinct available record can be selected and source identity is retained',()=>{
 const entries=records('a'),picker=createRandomDiscovery({random:()=>0});
 assert.equal(picker.pick(entries,{currentId:'other'}),entries[0]);
 assert.equal(picker.pick(entries),entries[0]);
 assert.equal(picker.pick(entries,{currentId:'a'}),null);
});

test('a context visits every candidate before starting a new cycle',()=>{
 const entries=records('a','b','c','d'),picker=createRandomDiscovery({random:()=>0});
 assert.deepEqual(draw(picker,entries,8),['a','b','c','d','a','b','c','d']);
});

test('cycle boundaries do not immediately repeat the previous draw when another record exists',()=>{
 const entries=records('a','b','c'),picker=createRandomDiscovery({random:()=>1});
 const result=draw(picker,entries,15);
 for(let index=1;index<result.length;index++)assert.notEqual(result[index],result[index-1]);
 for(let index=0;index<result.length;index+=3)assert.equal(new Set(result.slice(index,index+3)).size,3);
 assert.deepEqual(result.slice(0,6),['c','b','a','c','b','a']);
 const alternating=createRandomDiscovery({random:()=>0.5});
 assert.deepEqual(draw(alternating,records('a','b'),6),['b','a','b','a','b','a']);
});

test('the displayed record is excluded and can be visited later when it is no longer current',()=>{
 const entries=records('a','b','c'),picker=createRandomDiscovery({random:()=>0});
 assert.equal(picker.pick(entries,{currentId:'a'}).id,'b');
 assert.equal(picker.pick(entries,{currentId:'b'}).id,'a');
 assert.equal(picker.pick(entries,{currentId:'a'}).id,'c');
 for(let index=0;index<12;index++)assert.notEqual(picker.pick(entries,{currentId:'a'}).id,'a');
});

test('an unavailable current record at the end of a bag does not stall discovery',()=>{
 const entries=records('a','b','c'),picker=createRandomDiscovery({random:()=>0});
 assert.deepEqual(draw(picker,entries,6,{currentId:'c'}),['a','b','a','b','a','b']);
});

test('candidate changes preserve unvisited records, admit new ones and never return removed records',()=>{
 const picker=createRandomDiscovery({random:()=>0}),original=records('a','b','c');
 assert.equal(picker.pick(original).id,'a');
 const changed=records('b','c','d');
 assert.deepEqual(draw(picker,changed,3),['b','c','d']);
 assert.ok(draw(picker,changed,12).every(id=>['b','c','d'].includes(id)));
 assert.equal(picker.pick([]),null);
 assert.equal(picker.pick(records('fresh')).id,'fresh');
});

test('reordering or refreshing the same records preserves the bag and returns fresh objects',()=>{
 const picker=createRandomDiscovery({random:()=>0}),original=records('a','b','c');
 assert.equal(picker.pick(original),original[0]);
 const fresh=records('c','b','a');
 const result=picker.pick(fresh);assert.equal(result.id,'b');assert.equal(result,fresh[1]);
 assert.equal(picker.pick(fresh).id,'c');
});

test('keys keep independent cycles and reset can target one context or all contexts',()=>{
 const picker=createRandomDiscovery({random:()=>0}),entries=records('a','b','c');
 assert.equal(picker.pick(entries,{key:'projects'}).id,'a');
 assert.equal(picker.pick(entries,{key:'people'}).id,'a');
 assert.equal(picker.pick(entries,{key:'projects'}).id,'b');
 picker.reset('projects');
 assert.equal(picker.pick(entries,{key:'projects'}).id,'a');
 assert.equal(picker.pick(entries,{key:'people'}).id,'b');
 picker.reset();
 assert.equal(picker.pick(entries,{key:'projects'}).id,'a');
 assert.equal(picker.pick(entries,{key:'people'}).id,'a');
 assert.equal(picker.pick(entries).id,'a');assert.equal(picker.pick(entries).id,'b');
 picker.reset();assert.equal(picker.pick(entries).id,'a');
});

test('random boundaries and invalid samples always select an eligible record',()=>{
 const entries=records('a','b','c');
 for(const [sample,expected]of [[0,'a'],[1,'c'],[-1,'a'],[20,'c'],[0.999999,'c'],[NaN,'a'],[Infinity,'a'],[-Infinity,'a'],[undefined,'a'],['0.5','a']]){
  assert.equal(createRandomDiscovery({random:()=>sample}).pick(entries).id,expected);
 }
 assert.equal(createRandomDiscovery({random:()=>{throw new Error('Unavailable entropy');}}).pick(entries).id,'a');
});

test('duplicate or malformed candidates do not bias bags and are never mutated',()=>{
 const a={id:'a',nested:{value:1}},b={id:'b'},entries=[a,{id:'a',duplicate:true},null,{},b];
 const before=JSON.stringify(entries),picker=createRandomDiscovery({random:()=>0});
 assert.deepEqual(availableRandomEntries(entries),[a,b]);
 assert.deepEqual(draw(picker,entries,4),['a','b','a','b']);
 assert.equal(JSON.stringify(entries),before);
 assert.deepEqual(availableRandomEntries(null),[]);
 assert.deepEqual(draw(createRandomDiscovery({random:()=>0}),records(0,1),2),[0,1]);
});

test('changes caused by filters never escape the currently supplied candidates',()=>{
 const picker=createRandomDiscovery({random:()=>0}),all=records('a','b','c','d');
 picker.pick(all,{key:'same-context'});
 const favorites=all.filter(entry=>entry.id==='b'||entry.id==='d');
 assert.deepEqual(draw(picker,favorites,4,{key:'same-context'}),['b','d','b','d']);
 const campus=favorites.filter(entry=>entry.id==='d');
 assert.equal(picker.pick(campus,{key:'same-context',currentId:'d'}),null);
 assert.equal(picker.pick(campus,{key:'same-context',currentId:'b'}),campus[0]);
});


test('readiness is read-only and a singleton stays disabled after its first draw on its detail',()=>{
 const picker=createRandomDiscovery({random:()=>0}),entries=records('only'),options={key:'one-result',currentId:'only'};
 for(let index=0;index<3;index++)assert.equal(picker.canPick(entries,options),true);
 assert.equal(picker.pick(entries,options),entries[0]);
 for(let index=0;index<3;index++){
  assert.equal(picker.canPick(entries,options),false);
  assert.equal(picker.pick(entries,options),null);
 }
 assert.equal(picker.canPick(entries,{key:'one-result'}),true);
 assert.equal(picker.pick(entries,{key:'one-result'}),entries[0]);
 assert.equal(picker.canPick(entries,options),false);
});

test('singleton readiness follows the current ID and keeps contexts independent',()=>{
 const picker=createRandomDiscovery({random:()=>0}),entries=records('a');
 assert.equal(picker.canPick([],{}),false);
 assert.equal(picker.canPick(entries,{key:'first',currentId:'other'}),true);
 picker.pick(entries,{key:'first',currentId:'a'});
 assert.equal(picker.canPick(entries,{key:'first',currentId:'a'}),false);
 assert.equal(picker.canPick(entries,{key:'second',currentId:'a'}),true);
 assert.equal(picker.canPick(records('b'),{key:'first',currentId:'b'}),true);
 assert.equal(picker.canPick(records('a','b'),{key:'first',currentId:'a'}),true);
 picker.reset('first');
 assert.equal(picker.canPick(entries,{key:'first',currentId:'a'}),true);
});
