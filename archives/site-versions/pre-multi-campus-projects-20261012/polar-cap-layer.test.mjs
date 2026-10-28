import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createPolarCapMesh,createPolarCapLayer,POLAR_CAP_LATITUDE} from './polar-cap-layer.mjs';

test('cap vertices lie on the sphere and entirely south of 85.23 degrees',() => {
 const {vertices,indices}=createPolarCapMesh();
 assert.equal(vertices.length/3,1801);
 assert.equal(indices.length/3,3420);
 for(let index=0;index<vertices.length;index+=3) {
  const [x,y,z]=vertices.slice(index,index+3);
  assert.ok(Math.abs(Math.hypot(x,y,z)-1)<1e-7);
  assert.ok(Math.asin(y)*180/Math.PI<=POLAR_CAP_LATITUDE+1e-4);
 }
 assert.ok(Math.max(...indices)<vertices.length/3);
});

test('triangles have consistent outward orientation and no degenerate pole',() => {
 const {vertices:v,indices:i}=createPolarCapMesh({segments:36,rings:4});
 for(let t=0;t<i.length;t+=3) {
  const a=Array.from(v.slice(i[t]*3,i[t]*3+3));
  const b=Array.from(v.slice(i[t+1]*3,i[t+1]*3+3), (value,j)=>value-a[j]);
  const c=Array.from(v.slice(i[t+2]*3,i[t+2]*3+3), (value,j)=>value-a[j]);
  const cross=[b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0]];
  assert.ok(cross.reduce((sum,value,j)=>sum+value*a[j],0)>0);
 }
});

test('the cap covers only real Antarctic interior in the current source',() => {
 const require=createRequire(import.meta.url),d3=require('../map-data/d3.min.js');
 const world=JSON.parse(readFileSync(new URL('./geography/world-countries.geojson',import.meta.url),'utf8'));
 const antarctica=world.features.find(feature=>feature.id==='ATA');
 // Avoid the artificial ±180° ring edge itself: D3 boundary membership there
 // is numerically ambiguous even though its two adjacent sides are land.
 for(let lng=-179.5;lng<180;lng+=10)for(const lat of [POLAR_CAP_LATITUDE,-86,-88,-89.99]) {
  assert.ok(d3.geoContains(antarctica,[lng,lat]),`${lng},${lat} is real land`);
 }
});

test('layer exposes the MapLibre custom-layer contract and inert setters before attach',() => {
 const layer=createPolarCapLayer();
 assert.equal(layer.type,'custom');assert.equal(layer.renderingMode,'2d');
 layer.setTheme(true);layer.setVisible(false);
 assert.doesNotThrow(()=>layer.render({}, {defaultProjectionData:{projectionTransition:0}}));
 assert.doesNotThrow(()=>layer.onRemove());
});

test('draw gating, GL capability restoration, theme and GPU cleanup',() => {
 const state=new Set(['DEPTH_TEST','STENCIL_TEST']),uniforms=new Map(),handlers=new Map();
 const count={draw:0,programs:0,deletedPrograms:0,deletedBuffers:0,deletedVAOs:0};
 const gl={};
 for(const key of ['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','ARRAY_BUFFER','ELEMENT_ARRAY_BUFFER','STATIC_DRAW','FLOAT','DEPTH_TEST','CULL_FACE','STENCIL_TEST','TRIANGLES','UNSIGNED_SHORT'])gl[key]=key;
 Object.assign(gl,{
  isContextLost:()=>false,createShader:()=>({}),shaderSource(){},compileShader(){},getShaderParameter:()=>true,deleteShader(){},
  createProgram(){count.programs++;return {};},attachShader(){},linkProgram(){},getProgramParameter:()=>true,
  deleteProgram(){count.deletedPrograms++;},createBuffer:()=>({}),deleteBuffer(){count.deletedBuffers++;},bindBuffer(){},bufferData(){},
  createVertexArray:()=>({}),deleteVertexArray(){count.deletedVAOs++;},bindVertexArray(){},getAttribLocation:()=>0,
  enableVertexAttribArray(){},vertexAttribPointer(){},getUniformLocation:(_,name)=>name,useProgram(){},uniformMatrix4fv(){},
  uniform4fv:(name,value)=>uniforms.set(name,value),drawElements(){count.draw++;},
  isEnabled:flag=>state.has(flag),enable:flag=>state.add(flag),disable:flag=>state.delete(flag),
 });
 const map={on:(name,callback)=>handlers.set(name,callback),off:name=>handlers.delete(name),triggerRepaint(){}};
 const layer=createPolarCapLayer();layer.onAdd(map,gl);
 const data={projectionTransition:1,clippingPlane:[0,-1,0,-.3],mainMatrix:new Float32Array(16)};
 layer.render(gl,{defaultProjectionData:data});
 assert.equal(count.draw,1);
 assert.deepEqual([...state].sort(),['DEPTH_TEST','STENCIL_TEST']);
 layer.setTheme(true,{duration:0});layer.render(gl,{defaultProjectionData:data});
 assert.deepEqual(uniforms.get('u_color'),[37/255,105/255,103/255,1]);
 layer.setVisible(false);layer.render(gl,{defaultProjectionData:data});
 layer.setVisible(true);layer.render(gl,{defaultProjectionData:{...data,projectionTransition:.5}});
 layer.render(gl,{defaultProjectionData:{...data,clippingPlane:[0,1,0,-.3]}});
 assert.equal(count.draw,2,'hidden, transitioning and occluded caps do not draw');
 handlers.get('webglcontextlost')();layer.render(gl,{defaultProjectionData:data});
 assert.equal(count.draw,2);
 handlers.get('webglcontextrestored')();layer.render(gl,{defaultProjectionData:data});
 assert.equal(count.programs,2);assert.equal(count.draw,3);
 layer.onRemove();
 assert.equal(handlers.size,0);assert.equal(count.deletedPrograms,1);assert.equal(count.deletedBuffers,2);assert.equal(count.deletedVAOs,1);
});
