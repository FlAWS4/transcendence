import test from 'node:test';
import assert from 'node:assert/strict';
import {projectCampusIndicator,continuousBearing} from './campus-direction.mjs';

const close=(actual,expected,epsilon=1e-8)=>assert.ok(Math.abs(actual-expected)<=epsilon,`${actual} ≠ ${expected}`);
const desktop={width:1440,height:960};

test('a visible campus keeps its reticle at its actual projected position',()=>{
 for(const point of [{x:720,y:480},{x:300,y:240},{x:1100,y:700}]){
  const result=projectCampusIndicator(point,desktop);
  assert.equal(result.mode,'reticle');close(result.x,point.x);close(result.y,point.y);
 }
});

test('cardinal offscreen bearings match an arrow whose drawing points up',()=>{
 const cases=[
  [{x:720,y:-100},{x:720,y:40,angle:0}],
  [{x:1600,y:480},{x:1400,y:480,angle:90}],
  [{x:720,y:1100},{x:720,y:920,angle:180}],
  [{x:-100,y:480},{x:40,y:480,angle:-90}],
 ];
 for(const [point,expected]of cases){
  const result=projectCampusIndicator(point,desktop);assert.equal(result.mode,'edge');
  for(const key of ['x','y','angle'])close(result[key],expected[key]);
 }
});

test('diagonal projection follows the centre-to-campus ray rather than clamping axes independently',()=>{
 const result=projectCampusIndicator({x:2000,y:-500},desktop);
 assert.equal(result.mode,'edge');close(result.y,40);
 close(result.x,720+1280*(440/980));
 assert.ok(result.x<1400,'independent coordinate clamping would incorrectly select the corner');
 close(result.angle,Math.atan2(1280,980)*180/Math.PI);
});

test('exact corner directions reach that corner without distorting the bearing',()=>{
 for(const [sx,sy]of [[-1,-1],[1,-1],[-1,1],[1,1]]){
  const point={x:720+sx*1360,y:480+sy*880};
  const result=projectCampusIndicator(point,desktop);
  assert.equal(result.mode,'edge');close(result.x,sx>0?1400:40);close(result.y,sy>0?920:40);
  close(result.angle,Math.atan2(sx*1360,-sy*880)*180/Math.PI);
 }
});

test('desktop, portrait and landscape projections stay on the inset rectangle and the same forward ray',()=>{
 for(const viewport of [desktop,{width:390,height:844},{width:320,height:568},{width:667,height:390}]){
  const {width,height}=viewport,cx=width/2,cy=height/2;
  for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1],[1,.2],[.2,1],[-1,.35],[.35,-1],[-1,-1],[1,1]]){
   const point={x:cx+dx*width*4,y:cy+dy*height*4};
   const result=projectCampusIndicator(point,viewport);assert.equal(result.mode,'edge');
   assert.ok(result.x>=40-1e-8&&result.x<=width-40+1e-8);
   assert.ok(result.y>=40-1e-8&&result.y<=height-40+1e-8);
   assert.ok([result.x-40,result.x-(width-40),result.y-40,result.y-(height-40)].some(v=>Math.abs(v)<1e-8));
   const rx=result.x-cx,ry=result.y-cy,px=point.x-cx,py=point.y-cy;
   close((rx*py-ry*px)/Math.hypot(px,py),0);
   assert.ok(rx*px+ry*py>0,'indicator must point toward the campus, not to the opposite edge');
  }
 }
});

test('different horizontal and vertical fade margins retain the extra 36px inset',()=>{
 const fadeX=28,fadeY=54,insetX=fadeX+36,insetY=fadeY+36;
 const options={width:390,height:844,insetX,insetY};
 const right=projectCampusIndicator({x:1000,y:422},options);
 close(right.x,390-insetX);close(right.y,422);
 const top=projectCampusIndicator({x:195,y:-100},options);
 close(top.x,195);close(top.y,insetY);
 // Even the outer half of the 44px target stays clear of the faded area.
 assert.ok(right.x+22<=390-fadeX);assert.ok(top.y-22>=fadeY);
});

test('the arrow appears before the campus enters the viewport fade margin',()=>{
 assert.equal(projectCampusIndicator({x:39,y:480},desktop).mode,'edge');
 assert.equal(projectCampusIndicator({x:41,y:480},desktop).mode,'reticle');
 assert.equal(projectCampusIndicator({x:1401,y:480},desktop).mode,'edge');
 assert.equal(projectCampusIndicator({x:1399,y:480},desktop).mode,'reticle');
});

test('six-pixel return hysteresis prevents flicker at all four edges',()=>{
 const cases=[
  [{x:43,y:480},{x:47,y:480}],
  [{x:1397,y:480},{x:1393,y:480}],
  [{x:720,y:43},{x:720,y:47}],
  [{x:720,y:917},{x:720,y:913}],
 ];
 for(const [near,inside]of cases){
  assert.equal(projectCampusIndicator(near,desktop).mode,'reticle');
  assert.equal(projectCampusIndicator(near,{...desktop,wasOffscreen:true}).mode,'edge');
  assert.equal(projectCampusIndicator(inside,{...desktop,wasOffscreen:true}).mode,'reticle');
 }
});

test('custom hysteresis changes only the return threshold',()=>{
 const point={x:47,y:480};
 assert.equal(projectCampusIndicator(point,{...desktop,wasOffscreen:true,hysteresis:10}).mode,'edge');
 assert.equal(projectCampusIndicator(point,{...desktop,wasOffscreen:true,hysteresis:0}).mode,'reticle');
 assert.equal(projectCampusIndicator(point,{...desktop,wasOffscreen:false,hysteresis:10}).mode,'reticle');
});

test('non-finite campus projections do not produce a misplaced arrow',()=>{
 for(const point of [{x:NaN,y:480},{x:720,y:NaN},{x:Infinity,y:0},{x:0,y:-Infinity}]){
  assert.equal(projectCampusIndicator(point,desktop).mode,'hidden');
 }
});

test('viewports smaller than the minimum target hide the indicator',()=>{
 for(const viewport of [{width:43,height:844},{width:390,height:43},{width:0,height:0},{width:-1,height:960}]){
  assert.equal(projectCampusIndicator({x:2000,y:1000},viewport).mode,'hidden');
 }
});

test('bearing crosses north by the short route without a full revolution',()=>{
 close(continuousBearing(359,0),360);
 close(continuousBearing(1,359),-1);
 close(continuousBearing(179,-179),181);
 close(continuousBearing(-179,179),-181);
});

test('bearing remains continuous after accumulated turns and repeated changes',()=>{
 close(continuousBearing(720,10),730);
 close(continuousBearing(-720,-10),-730);
 close(continuousBearing(-45,315),-45);
 let previous=350;
 for(const next of [10,20,359,1,350,5]){
  const value=continuousBearing(previous,next);
  assert.ok(Math.abs(value-previous)<=180,'successive directions must use the shortest turn');
  close(((value-next)%360+360)%360,0);
  previous=value;
 }
});
