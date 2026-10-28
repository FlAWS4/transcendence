import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('./integrated-globe.mjs',import.meta.url),'utf8');
const start=source.indexOf('  transformCameraUpdate(next){');
const callback=source.slice(start,source.indexOf('\n  }});',start))+'}';
function fixture(){
 const ctx=vm.createContext({scope:{level:'campus'},flight:false,worldPreparing:false,
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
 const update=vm.runInContext('({'+callback+'})',ctx).transformCameraUpdate;
 return {ctx,update};
}
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,actual+' vs '+expected);

test('manual zoom out and back in restores the same inclination at each height',()=>{
 const {update}=fixture();let pitch=34;
 const outward=[17.8,17,16,15,14.5];const observed=new Map();
 for(const zoom of outward){pitch=update({zoom,pitch}).pitch;observed.set(zoom,pitch);}
 near(pitch,0);
 for(const zoom of [...outward].reverse()){pitch=update({zoom,pitch}).pitch;near(pitch,observed.get(zoom));}
 near(pitch,34);
});

test('free campus zoom matches the existing approach from overhead to 34 degrees',()=>{
 const {update}=fixture();
 for(const t of [0,.1,.25,.5,.75,.9,1]){
  const zoom=14.5+(17.8-14.5)*t;
  near(update({zoom,pitch:0}).pitch,34*t);
 }
 near(update({zoom:19,pitch:0}).pitch,34);
 near(update({zoom:14,pitch:34}).pitch,0);
});

test('panning at unchanged zoom keeps inclination stable regardless of previous zoom direction',()=>{
 const {update}=fixture();const zoom=16.4;
 const pitch=update({zoom,pitch:0}).pitch;
 near(update({zoom,pitch}).pitch,pitch);
 near(update({zoom,pitch:34}).pitch,pitch);
});

test('travel, approach, retreat and world preparation retain their existing camera choreography',()=>{
 const {ctx,update}=fixture();ctx.flight=true;
 near(update({zoom:14.5,pitch:0}).pitch,0);
 near(update({zoom:16.15,pitch:17}).pitch,17);
 near(update({zoom:17.8,pitch:34}).pitch,34);
 near(update({zoom:14.01,pitch:0}).pitch,0);
 ctx.flight=false;ctx.worldPreparing=true;
 near(update({zoom:16,pitch:0}).pitch,0);
});

test('world and country stay flat without inheriting an incline from campus',()=>{
 const {ctx,update}=fixture();
 for(const level of ['country','world']){
  ctx.scope.level=level;
  for(const zoom of [1,3,6,8.8])near(update({zoom,pitch:34}).pitch,0);
 }
});

test('zoom buttons complete repeated round trips without losing inclination or escaping campus bounds',()=>{
 const {ctx,update}=fixture();let zoom=17.8,pitch=34;
 Object.assign(ctx,{ready:true,reduced:false,padding:{},navigationPolicy:()=>({level:'campus'}),
  getNavigationZoomRange:()=>({min:14.5,max:19}),map:{stop(){},getCenter:()=>({lat:48.89}),getZoom:()=>zoom,
   easeTo(options){zoom=options.zoom;pitch=update({zoom,pitch}).pitch;}}});
 vm.runInContext(source.slice(source.indexOf(' function zoomBy('),source.indexOf(' function countryAt(')),ctx);
 for(let round=0;round<3;round++){
  for(let i=0;i<12;i++)ctx.zoomBy(.8);
  near(zoom,14.5);near(pitch,0);
  for(let i=0;i<12;i++)ctx.zoomBy(1.25);
  near(zoom,19);near(pitch,34);
 }
});
