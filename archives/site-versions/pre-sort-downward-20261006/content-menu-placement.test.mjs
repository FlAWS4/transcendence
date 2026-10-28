import test from 'node:test';
import assert from 'node:assert/strict';
import {contentMenuPlacement,contentMenuPageMoved} from '../content-controls.mjs';

test('a long Arabic mobile menu opens above its button and stays clear of the dock',()=>{
 const result=contentMenuPlacement({anchorTop:310,anchorBottom:352,naturalHeight:281,topLimit:118,bottomLimit:496});
 assert.deepEqual(result,{side:'above',top:118,height:183,maxHeight:183});
 assert.ok(result.top+result.height<=310-9);
 assert.ok(result.top+result.height<496);
});
test('a compact menu stays below the trigger when it fits',()=>{
 const result=contentMenuPlacement({anchorTop:310,anchorBottom:352,naturalHeight:98,topLimit:118,bottomLimit:496});
 assert.equal(result.side,'below');assert.equal(result.top,361);assert.equal(result.height,98);
});
test('an entire menu fits above a low trigger without internal clipping',()=>{
 const result=contentMenuPlacement({anchorTop:470,anchorBottom:512,naturalHeight:281,topLimit:118,bottomLimit:548});
 assert.equal(result.side,'above');assert.equal(result.height,281);assert.equal(result.top,180);
});
test('a trigger near the header uses the available lower space with scrolling',()=>{
 const result=contentMenuPlacement({anchorTop:135,anchorBottom:177,naturalHeight:281,topLimit:118,bottomLimit:420});
 assert.deepEqual(result,{side:'below',top:186,height:234,maxHeight:234});
});
test('desktop keeps a fully expanded dropdown below the toolbar',()=>{
 const result=contentMenuPlacement({anchorTop:402,anchorBottom:444,naturalHeight:267,topLimit:137,bottomLimit:829});
 assert.equal(result.side,'below');assert.equal(result.height,267);assert.equal(result.top,453);
});
test('header and dock bounds also support a shifted visual viewport',()=>{
 const result=contentMenuPlacement({anchorTop:290,anchorBottom:332,naturalHeight:300,topLimit:160,bottomLimit:490});
 assert.deepEqual(result,{side:'below',top:341,height:149,maxHeight:149});
});
test('equal constrained spaces prefer below; no negative height is emitted',()=>{
 const result=contentMenuPlacement({anchorTop:200,anchorBottom:240,naturalHeight:300,topLimit:100,bottomLimit:340});
 assert.equal(result.side,'below');assert.equal(result.maxHeight,91);
 const tiny=contentMenuPlacement({anchorTop:120,anchorBottom:162,naturalHeight:300,topLimit:118,bottomLimit:166});
 assert.equal(tiny.maxHeight,0);assert.equal(tiny.height,0);
});
test('arbitrary bounded triggers never let the panel overlap the trigger or reserved UI',()=>{
 for(let top=120;top<450;top+=17)for(let height=42;height<400;height+=37){
  const result=contentMenuPlacement({anchorTop:top,anchorBottom:top+42,naturalHeight:height,topLimit:110,bottomLimit:520});
  assert.ok(result.top>=110);assert.ok(result.top+result.height<=520);
  if(result.side==='above')assert.ok(result.top+result.height<=top-9);
  else assert.ok(result.top>=top+42+9);
 }
});

test('a spurious document scroll event without movement keeps an open menu',()=>{
 const opened={x:0,y:0};
 assert.equal(contentMenuPageMoved(opened,{x:0,y:0}),false);
 assert.equal(contentMenuPageMoved(null,{x:0,y:40}),false);
});
test('subpixel scroll noise is ignored but a real change from the opening position closes',()=>{
 const opened={x:0,y:123.25};
 assert.equal(contentMenuPageMoved(opened,{x:.5,y:123.75}),false);
 assert.equal(contentMenuPageMoved(opened,{x:0,y:123.8}),true);
 assert.equal(contentMenuPageMoved(opened,{x:0,y:122.7}),true);
 assert.equal(contentMenuPageMoved(opened,{x:1,y:123.25}),true);
});
