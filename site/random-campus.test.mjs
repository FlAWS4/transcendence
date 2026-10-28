import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRandomCampusCandidate, campusJourneyDuration, campusJourneyEasing } from './random-campus.mjs';

test('all 58 campuses are eligible and the candidate consumed is the one chosen before clicking', async () => {
 const { campuses } = JSON.parse(await readFile(new URL('./campuses.json', import.meta.url)));
 assert.equal(campuses.length,58);
 for(let i=0;i<58;i++){
  let calls=0;
  const queue=createRandomCampusCandidate(campuses,{random:()=>{calls++;return (i+.5)/58;}});
  const before=queue.peek();assert.equal(before.id,campuses[i].id);
  for(let n=0;n<10;n++)assert.equal(queue.peek(),before);
  assert.equal(calls,1);assert.equal(queue.take(),before);
  assert.notEqual(queue.peek().id,before.id);assert.equal(calls,2);
 }
});
test('manual navigation only redraws when it would repeat the current campus',()=>{
 const campuses=['a','b','c'].map(id=>({id}));let draws=0;
 const queue=createRandomCampusCandidate(campuses,{random:()=>{draws++;return 0;}});
 assert.equal(queue.peek().id,'a');
 assert.equal(queue.setCurrent('c').id,'a');assert.equal(draws,1);
 assert.equal(queue.setCurrent('a').id,'b');assert.equal(draws,2);
 assert.equal(queue.setCurrent(null).id,'b');assert.equal(draws,2);
});
test('empty catalogues and a sole current campus have no false destination',()=>{
 assert.equal(createRandomCampusCandidate([]).take(),null);
 const queue=createRandomCampusCandidate([{id:'only'}]);
 assert.equal(queue.take().id,'only');assert.equal(queue.peek(),null);
});
test('cross-campus duration is bounded and easing has gradual endpoints',()=>{
 assert.equal(campusJourneyDuration(0),3000);assert.equal(campusJourneyDuration(21000),3400);
 assert.ok(campusJourneyDuration(100)<campusJourneyDuration(5000));
 assert.equal(campusJourneyEasing(0),0);assert.equal(campusJourneyEasing(1),1);assert.equal(campusJourneyEasing(.5),.5);
 assert.ok(campusJourneyEasing(.01)<.00002);assert.ok(1-campusJourneyEasing(.99)<.00002);
 let before=0;for(let i=1;i<=100;i++){const next=campusJourneyEasing(i/100);assert.ok(next>before);before=next;}
});

test('engine anticipation waits for world, the current flight and selected raw coverage, then uses the unchanged candidate',async()=>{
 const source=await readFile(new URL('./integrated-globe.mjs',import.meta.url),'utf8');
 const code=source.slice(source.indexOf(' function scheduleRandomAnticipation('),source.indexOf(' function preloadCampus('));
 const campus={id:'paris'},calls=[];let timer=null;
 const state=vm.createContext({destroyed:false,ready:true,worldRender:{phase:'preparing'},worldPreparing:true,flight:true,preparing:false,
  randomPreloadTimer:0,randomCandidate:{peek:()=>campus},preloadRadius:()=>5.75,scope:{level:'world'},
  clearTimeout:()=>{timer=null;},setTimeout:callback=>{timer=callback;return 1;},
  map:{isMoving:()=>false},campusPreloader:{anticipate:(c,options)=>calls.push([c,options.radiusKm]),getState:()=>({ready:false})},options:{},
 });vm.runInContext(code,state);
 state.scheduleRandomAnticipation();assert.equal(timer,null);
 state.worldRender.phase='ready';state.worldPreparing=false;
 state.scheduleRandomAnticipation();assert.equal(timer,null,'a selected flight retains priority');
 state.flight=false;state.scheduleRandomAnticipation();assert.equal(typeof timer,'function');
 state.flight=true;timer();assert.equal(calls.length,0,'a late timer cannot compete with a new journey');
 state.flight=false;state.scheduleRandomAnticipation();timer();
 assert.equal(calls.length,1);assert.equal(calls[0][0],campus);assert.equal(calls[0][1],5.75);
 state.scope.level='campus';state.scheduleRandomAnticipation();assert.equal(timer,null,'new viewport coverage keeps network priority');
});
