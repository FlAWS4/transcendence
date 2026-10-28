import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveGlobeCenter} from './globe-layout.mjs';

const style=values=>({getPropertyValue:name=>values[name]??''});
const layout=(width,height,values={'--horizon-responsive-globe':'1'})=>
 resolveGlobeCenter({width,height,style:style(values)});
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} ≠ ${expected}`);

test('desktop framing and its horizontal centre stay unchanged',()=>{
 for(const width of [900,1200,1920])assert.deepEqual(layout(width,960),{x:.5,y:.5,lift:0});
 const centre=layout(390,844,{'--horizon-responsive-globe':'1','--hg-center-x':'.55'});
 assert.equal(centre.x,.55);
});

test('portrait framing rises progressively as the available width shrinks',()=>{
 const widths=[900,850,700,540,390,360,320];
 const centres=widths.map(width=>layout(width,844));
 for(let i=1;i<centres.length;i++){
  assert.ok(centres[i].lift>=centres[i-1].lift);
  assert.ok(centres[i].y<=centres[i-1].y);
 }
 near(centres[4].lift,64*510/540);
 near(centres.at(-1).lift,64);
 near(centres.at(-1).y*844,422-64);
});

test('width ramp stays continuous at its bounds and existing layout thresholds',()=>{
 for(const width of [360,700,900]){
  const before=layout(width-.001,844),after=layout(width+.001,844);
  assert.ok(Math.abs(before.lift-after.lift)<.001);
 }
});

test('short landscape keeps its centre, with a continuous height ramp',()=>{
 assert.deepEqual(layout(667,390),{x:.5,y:.5,lift:0});
 assert.equal(layout(390,440).lift,0);
 near(layout(360,530).lift,32);
 near(layout(360,620).lift,64);
 near(layout(320,640).lift,64);
 near(layout(320,640).y*640,256);
 for(const height of [440,620]){
  assert.ok(Math.abs(layout(390,height-.001).lift-layout(390,height+.001).lift)<.001);
 }
});

test('campus portals and historical layouts do not opt in implicitly',()=>{
 const custom={'--hg-center-x':'45%','--hg-center-y':'.48'};
 assert.deepEqual(layout(390,844,custom),{x:.45,y:.48,lift:0});
 assert.deepEqual(layout(390,844,{...custom,'--horizon-responsive-globe':'0'}),{x:.45,y:.48,lift:0});
});

test('missing dimensions and CSS values keep a finite fallback centre',()=>{
 assert.deepEqual(layout(0,0),{x:.5,y:.5,lift:0});
 assert.deepEqual(layout(1000,800,{'--hg-center-x':'invalid','--hg-center-y':''}),{x:.5,y:.5,lift:0});
 assert.deepEqual(layout(1000,800,{'--hg-center-x':'0','--hg-center-y':'0%'}),{x:0,y:0,lift:0});
});
