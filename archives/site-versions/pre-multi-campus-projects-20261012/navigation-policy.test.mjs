import test from 'node:test';
import assert from 'node:assert/strict';
import {constrainNavigation,getNavigationZoomRange,CAMPUS_RADIUS_KM} from './navigation-policy.mjs';

const close = (actual,expected,tolerance=1e-9) => assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} ≠ ${expected}`);
const world = {level:'world',worldZoom:1.2};
const france = {center:[2.3,46.5],bounds:[[-5,42],[8,51]],members:[{coordinates:[2.31839,48.89669]},{coordinates:[7.33,47.74]}]};
const distanceKm = (a,b) => {
 const d=Math.PI/180,p1=a[1]*d,p2=b.lat*d;
 const h=Math.sin((p2-p1)/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin((b.lng-a[0])*d/2)**2;
 return 6371.0088*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
};

test('world: wrap longitude, limit polar latitude, preserve apparent globe size',()=>{
 for(const lat of [-90,-75,-30,0,18,60,75,90]){
  const result=constrainNavigation(world,{lng:541,lat},-100);
  const allowedLat=Math.max(-75,Math.min(75,lat));
  assert.equal(result.center.lng,-179);assert.equal(result.center.lat,allowedLat);
  close(result.zoom,world.worldZoom+Math.log2(Math.cos(allowedLat*Math.PI/180)/Math.cos(18*Math.PI/180)));
  const range=getNavigationZoomRange(world,lat);close(range.max-range.min,1.8);
  close(constrainNavigation(world,[0,lat],100).zoom,range.max);
 }
});

test('world: limits also respect the absolute zoom envelope',()=>{
 assert.deepEqual(getNavigationZoomRange({...world,worldZoom:-2},75),{min:-2,max:-2});
 assert.deepEqual(getNavigationZoomRange({...world,worldZoom:18},18),{min:18,max:19});
});

test('France: country rectangle, 3% margins and local zoom range',()=>{
 const policy={level:'country',country:france,countryZoom:5,worldZoom:1.2};
 const result=constrainNavigation(policy,{lng:25,lat:65},20);
 close(result.center.lng,8.39);close(result.center.lat,51.27);close(result.zoom,7.1);
 const other=constrainNavigation(policy,[-20,30],0);
 close(other.center.lng,-5.39);close(other.center.lat,41.73);close(other.zoom,4.75);
 assert.deepEqual(constrainNavigation(policy,[2.3,46.5],6),{center:{lng:2.3,lat:46.5},zoom:6});
});

test('USA: include all members outside the main polygon bounding box',()=>{
 const country={center:[-110,38],bounds:[[-125,25],[-66,49]],members:[{coordinates:[-157.85,21.3]},{coordinates:[-149.9,61.2]}]};
 const policy={level:'country',country,countryZoom:3};
 for(const coordinates of country.members.map(c=>c.coordinates)){
  const result=constrainNavigation(policy,coordinates,4);
  close(result.center.lng,coordinates[0]);close(result.center.lat,coordinates[1]);
 }
 const result=constrainNavigation(policy,[-180,90],4);
 close(result.center.lng,-157.85-(157.85-66)*.03);close(result.center.lat,61.2+(61.2-21.3)*.03);
});

test('country: crossing the antimeridian stays a narrow continuous interval',()=>{
 const policy={level:'country',countryZoom:4,country:{center:[179,0],bounds:[[170,-10],[-170,10]],members:[{coordinates:[-175,3]}]}};
 const east=constrainNavigation(policy,[-175,3],5);
 close(east.center.lng,185);close(east.center.lat,3);
 const west=constrainNavigation(policy,[160,0],5);close(west.center.lng,169.4);
 const farEast=constrainNavigation(policy,[-160,0],5);close(farEast.center.lng,190.6);
});

test('country: minimum margin covers tiny countries and zoom is capped at 9.5',()=>{
 const policy={level:'country',countryZoom:9,country:{center:[103.85,1.3],bounds:[[103.84,1.29],[103.86,1.31]],members:[]}};
 const result=constrainNavigation(policy,[104,2],12);
 close(result.center.lng,103.91);close(result.center.lat,1.36);close(result.zoom,9.5);
});

test('flight: ignore all local constraints while retaining global safety bounds',()=>{
 const policy={level:'campus',inFlight:true,campus:{coordinates:[2.3,48.9]},worldZoom:1.2};
 assert.deepEqual(constrainNavigation(policy,{lng:540,lat:89},30),{center:{lng:540,lat:85},zoom:19});
 assert.deepEqual(constrainNavigation(policy,[-170,-89],-8),{center:{lng:-170,lat:-85},zoom:-2});
 assert.deepEqual(getNavigationZoomRange(policy,90),{min:-2,max:19});
});

test('campus: preserve nearby points and clamp distant points to a 3 km circle',()=>{
 const campus={coordinates:[2.31839,48.89669]},policy={level:'campus',campus};
 const nearby=constrainNavigation(policy,[2.32,48.9],16);
 close(nearby.center.lng,2.32);close(nearby.center.lat,48.9);close(nearby.zoom,16);
 for(const point of [[3,49],[1,48],[2.3,80],[2.3,-80]]){
  const result=constrainNavigation(policy,point,30);
  close(distanceKm(campus.coordinates,result.center),CAMPUS_RADIUS_KM,1e-8);close(result.zoom,19);
 }
 close(constrainNavigation(policy,campus.coordinates,1).zoom,14.5);
});

test('campus: radial limit crosses the antimeridian without a longitude jump',()=>{
 const campus={coordinates:[179.99,10]},policy={level:'campus',campus};
 const result=constrainNavigation(policy,[-179.7,10],17);
 assert.ok(result.center.lng>180 && result.center.lng<180.1);
 close(distanceKm(campus.coordinates,result.center),CAMPUS_RADIUS_KM,1e-8);
});

test('policy functions leave caller data unchanged',()=>{
 const policy={level:'country',country:structuredClone(france),countryZoom:5};
 const before=structuredClone(policy),point={lng:35,lat:70};
 constrainNavigation(policy,point,10);
 assert.deepEqual(policy,before);assert.deepEqual(point,{lng:35,lat:70});
});
