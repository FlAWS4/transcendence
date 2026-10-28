import test from 'node:test';
import assert from 'node:assert/strict';
import {createGeographyLoader} from './geography-loader.mjs';
function fixture(timeoutMs=100){
 const workers=[],states=[];
 const loader=createGeographyLoader({url:'map.gz',rawUrl:'map.json',timeoutMs,onState:s=>states.push(s),workerFactory:()=>{
  const w={postMessage(data){this.request=data;},terminate(){this.terminated=true;}};workers.push(w);return w;
 }});
 return {loader,workers,states};
}
test('background preparation and entry reuse one request and result',async()=>{
 const {loader,workers}=fixture(),first=loader.load(),second=loader.load();
 assert.equal(first,second);assert.equal(workers.length,1);
 const world={type:'FeatureCollection',features:[{id:'FRA'}]};
 workers[0].onmessage({data:{phase:'prepared',world,features:1}});
 assert.equal(await first,world);assert.equal(await loader.load(),world);
 assert.equal(workers.length,1);assert.equal(workers[0].terminated,true);
});
test('download failure is bounded and an explicit retry uses a fresh worker',async()=>{
 const {loader,workers}=fixture(),first=loader.load();
 workers[0].onmessage({data:{phase:'error',message:'offline'}});
 await assert.rejects(first,/offline/);
 const retry=loader.load();assert.equal(workers.length,2);
 workers[1].onmessage({data:{phase:'prepared',world:{features:[]},features:0}});
 await retry;
});
test('a silent worker times out and can be retried',async()=>{
 const {loader,workers}=fixture(15);
 await assert.rejects(loader.load(),/timed out/);assert.equal(workers[0].terminated,true);
 const retry=loader.load();workers[1].onmessage({data:{phase:'prepared',world:{},features:1}});await retry;
});
test('worker construction failure does not poison subsequent calls',async()=>{
 let attempts=0;
 const loader=createGeographyLoader({workerFactory:()=>{attempts++;throw new Error('unavailable');}});
 await assert.rejects(loader.load(),/unavailable/);await assert.rejects(loader.load(),/unavailable/);assert.equal(attempts,2);
});
