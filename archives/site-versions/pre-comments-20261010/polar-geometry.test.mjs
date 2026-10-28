import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {removePolarBorderSeams} from './polar-geometry.mjs';

const require = createRequire(import.meta.url);
const topojson = require('../map-data/topojson.min.js');
const d3 = require('../map-data/d3.min.js');
const countEdges = geometry => geometry.coordinates.reduce((sum,line) => sum+Math.max(0,line.length-1),0);

test('removes the artificial polar cap and dateline legs, preserving the coast',() => {
 const ring = [[0,-80],[180,-75],[180,-85],[180,-90],[0,-90],[-180,-90],[-180,-85],[-180,-75],[0,-80]];
 const input = {type:'MultiLineString',coordinates:[ring]};
 const before = structuredClone(input);
 const output = removePolarBorderSeams(input);
 assert.deepEqual(output.coordinates,[[[-180,-75],[0,-80],[180,-75]]]);
 assert.deepEqual(input,before);
 output.coordinates[0][0][0] = 123;
 assert.deepEqual(input,before,'result coordinates do not share mutable point arrays');
});

test('keeps genuine coastline near the south pole and dateline',() => {
 const coordinates = [[[178,-84],[179,-84.4],[180,-84.35]],[[180,-16],[-180,-16.1]],[[180,65],[180,66]]];
 assert.deepEqual(removePolarBorderSeams({type:'MultiLineString',coordinates}).coordinates,coordinates);
});

test('splits an open line without joining over a removed seam',() => {
 const output = removePolarBorderSeams({type:'LineString',coordinates:[[170,-77],[180,-80],[180,-84],[-170,-78]]});
 assert.deepEqual(output.coordinates,[[[170,-77],[180,-80]],[[180,-84],[-170,-78]]]);
});

test('drops all-artificial lines and obsolete bounding boxes',() => {
 const output = removePolarBorderSeams({type:'MultiLineString',bbox:[-180,-90,180,-85],coordinates:[[[180,-90],[0,-90],[-180,-90]],[[180,-89],[180,-90]]]});
 assert.deepEqual(output,{type:'MultiLineString',coordinates:[]});
 assert.equal(removePolarBorderSeams(null),null);
 assert.equal(removePolarBorderSeams(undefined),undefined);
});

test('current Natural Earth mesh loses exactly its 748 Antarctic closing segments',() => {
 const topology = JSON.parse(readFileSync(new URL('./geography/world-countries.topo.json',import.meta.url),'utf8'));
 const before = topojson.mesh(topology,topology.objects.countries);
 const features = topojson.feature(topology,topology.objects.countries).features;
 const antarctica = features.find(feature => feature.id === 'ATA');
 const originalArea = d3.geoArea(antarctica),originalBounds = d3.geoBounds(antarctica);
 const after = removePolarBorderSeams(before);
 assert.equal(countEdges(before)-countEdges(after),748);
 assert.equal(after.coordinates.length,before.coordinates.length,'the real Antarctic coast remains one continuous line');
 assert.ok(after.coordinates.flat().every(point => point[1] > -89.99999),'no false south polar parallel remains');
 for(const line of after.coordinates)for(let index=1;index<line.length;index++) {
  const a=line[index-1],b=line[index];
  assert.ok(!(a[1]<-60 && b[1]<-60 && Math.abs(a[0])===180 && a[0]===b[0]),'no false Antarctic dateline leg remains');
 }
 assert.deepEqual(removePolarBorderSeams(after),after,'cleaning is idempotent');
 assert.equal(d3.geoArea(antarctica),originalArea);
 assert.deepEqual(d3.geoBounds(antarctica),originalBounds);
 assert.ok(d3.geoContains(antarctica,[0,-89.9]),'selection still includes the South Pole');
});
