import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SHAPES} from './explorer-shapes.mjs';
import {CONTINENTS} from './continents.mjs';
import {SOURCE,PARAMETERS,COUNTRY_RULES,CONTINENT_RULES,URALS,clipRing,clipSide,effectiveAreas,ringArea,verifySource} from './tools/build-explorer-shapes.mjs';

const source=readFileSync(new URL('./explorer-shapes.mjs',import.meta.url),'utf8');
const {countries}=JSON.parse(readFileSync(new URL('./campuses.json',import.meta.url),'utf8'));
const entries=[
 ['world','world',SHAPES.world],
 ...Object.entries(SHAPES.continents).map(([id,shape])=>[id,'continent',shape]),
 ...Object.entries(SHAPES.countries).map(([id,shape])=>[id,'country',shape]),
];
const number=/^\d+(\.\d)?$/; // non-negative, at most one decimal

// "M x y L x y x y ... Z" subpaths into rings of [x,y].
function ringsOf(d){
 assert.match(d,/^M[\d. LMZ]+Z$/);
 return d.slice(0,-1).split('Z').map(subpath=>{
  assert.ok(subpath.startsWith('M')&&subpath.indexOf('L')>1,subpath.slice(0,20));
  const tokens=subpath.slice(1).split('L').flatMap(part=>part.trim().split(' '));
  assert.equal(tokens.length%2,0);
  for(const token of tokens)assert.match(token,number);
  const ring=[];
  for(let i=0;i<tokens.length;i+=2)ring.push([Number(tokens[i]),Number(tokens[i+1])]);
  return ring;
 });
}
const sizeOf=viewBox=>{
 const match=/^0 0 (\d+(?:\.\d)?) (\d+(?:\.\d)?)$/.exec(viewBox);
 assert.ok(match,viewBox);
 return [Number(match[1]),Number(match[2])];
};
const boundsOf=points=>[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];

test('one silhouette for the world, each continent of continents.mjs and each catalogue country',()=>{
 assert.deepEqual(Object.keys(SHAPES),['world','continents','countries']);
 assert.deepEqual(Object.keys(SHAPES.continents),CONTINENTS.map(continent=>continent.id));
 assert.deepEqual(Object.keys(SHAPES.countries),countries.map(country=>country.id).sort());
 assert.equal(entries.length,35);
 for(const [id,,shape] of entries){
  assert.deepEqual(Object.keys(shape),['viewBox','d'],id);
  assert.equal(typeof shape.d,'string',id);assert.ok(shape.d.length>20,id);
 }
});

test('each viewBox has a long side of 100, the outline fills it inside the margin and keeps its aspect',()=>{
 const {long,margin}=PARAMETERS;
 for(const [id,,shape] of entries){
  const [width,height]=sizeOf(shape.viewBox),[x0,y0,x1,y1]=boundsOf(ringsOf(shape.d).flat());
  assert.equal(Math.max(width,height),long,id);assert.ok(Math.min(width,height)>=20,id);
  assert.ok(x0>=margin-0.1&&y0>=margin-0.1&&x1<=width-margin+0.1&&y1<=height-margin+0.1,`${id} stays inside the margin`);
  // fitted: the long side spans the viewBox minus both margins, the short side is centred
  const [spanLong,spanShort,sizeShort,startShort]=width>=height?[x1-x0,y1-y0,height,y0]:[y1-y0,x1-x0,width,x0];
  assert.ok(Math.abs(spanLong-(long-2*margin))<=0.2,`${id} long span ${spanLong}`);
  assert.ok(Math.abs(startShort-(sizeShort-spanShort-startShort))<=0.3,`${id} centred`);
  assert.ok(sizeShort-spanShort<=2*margin+0.3,`${id} short side has no extra room`);
 }
});

test('paths are closed rings of distinct points: outer rings clockwise, holes anticlockwise inside them',()=>{
 for(const [id,,shape] of entries){
  const rings=ringsOf(shape.d),outer=rings.filter(ring=>ringArea(ring)>0);
  assert.ok(outer.length>=1,id);assert.ok(ringArea(rings[0])>0,`${id} starts with an outer ring`);
  for(const ring of rings){
   assert.ok(ring.length>=3,id);
   assert.ok(Math.abs(ringArea(ring))>=0.01,`${id} ring without area`);
   ring.forEach((point,i)=>{const next=ring[(i+1)%ring.length];assert.ok(point[0]!==next[0]||point[1]!==next[1],`${id} repeats a point`);});
   if(ringArea(ring)<0){
    const [a0,b0,a1,b1]=boundsOf(ring);
    assert.ok(outer.some(o=>{const [c0,d0,c1,d1]=boundsOf(o);return a0>=c0&&b0>=d0&&a1<=c1&&b1<=d1;}),`${id} hole outside every outer ring`);
   }
  }
  assert.ok(rings.reduce((sum,ring)=>sum+ringArea(ring),0)>0,id);
 }
});

test('points stay within the budgets and the module stays small',()=>{
 const counts={};
 for(const [id,kind,shape] of entries){
  const points=ringsOf(shape.d).reduce((sum,ring)=>sum+ring.length,0);
  counts[id]=points;
  assert.ok(points<=PARAMETERS.budget[kind],`${id}: ${points} points for ${PARAMETERS.budget[kind]}`);
  assert.ok(points>=40,`${id}: ${points} points`);
 }
 assert.ok(Buffer.byteLength(source)<250*1024,`${Buffer.byteLength(source)} bytes`);
});

test('countries keep their main landmasses only',()=>{
 const parts=id=>ringsOf(SHAPES.countries[id].d).filter(ring=>ringArea(ring)>0).length;
 assert.equal(parts('FRA'),2,'metropolitan France and Corsica');
 assert.equal(parts('PRT'),1,'mainland Portugal');
 assert.equal(parts('ESP'),4,'mainland Spain, Mallorca, Menorca, Ibiza');
 assert.equal(parts('MYS'),2,'Peninsular Malaysia and Malaysian Borneo');
 assert.equal(parts('PSE'),2,'West Bank and Gaza Strip');
 assert.equal(parts('AGO'),2,'Angola and Cabinda');
 assert.equal(parts('ARM'),1,'Armenia without the Artsvashen exclave');
 assert.equal(parts('SGP'),1);
 assert.ok(parts('JPN')>=3&&parts('JPN')<=6,'Hokkaido, Honshu, Shikoku and Kyushu (joined to Honshu over the Kanmon Strait)');
 // landscape and portrait countries keep their orientation
 for(const [id,landscape] of [['MYS',true],['TUR',true],['AUT',true],['CHE',true],['PRT',false],['ALB',false],['GBR',false],['ITA',false]]){
  const [width,height]=sizeOf(SHAPES.countries[id].viewBox);
  assert.equal(width>height,landscape,id);
 }
});

test('Morocco includes the whole of Western Sahara, the user\'s choice of 2026-10-24',()=>{
 assert.deepEqual(COUNTRY_RULES.MAR,{with:['ESH']});
 assert.ok(source.includes('//  MAR with ESH')&&source.includes('Western Sahara feature (ESH)'));
 const {viewBox,d}=SHAPES.countries.MAR,rings=ringsOf(d),[width,height]=sizeOf(viewBox);
 assert.equal(rings.filter(ring=>ringArea(ring)>0).length,1,'one outline: no border left inside');
 // Natural Earth's Morocco alone, which stops at the berm, fills 0.216 of its viewBox; with Western Sahara, 0.239
 assert.ok(rings.reduce((sum,ring)=>sum+ringArea(ring),0)/(width*height)>0.23);
});

test('Russia is split between Europe and Asia along the Urals, the user\'s choice of 2026-10-24',()=>{
 assert.deepEqual(CONTINENT_RULES.europe.split,{RUS:'west'});
 assert.deepEqual(CONTINENT_RULES.asia.split,{RUS:'east'});
 // south to north, from the Ural River at Orsk to the Kara Sea, never back on the old 50.5°E meridian
 assert.deepEqual(URALS[0],[58.6,51.2]);
 for(let i=1;i<URALS.length;i++)assert.ok(URALS[i][1]>URALS[i-1][1],'latitudes increase');
 assert.ok(URALS.every(([lon])=>lon>=58&&lon<=68));
 assert.ok(source.includes('along the Urals')&&source.includes('//  URALS 58.6,51.2 59,53.4'));
 assert.ok(source.includes('RUS west of URALS')&&source.includes('RUS east of URALS'));
});

test('clipSide keeps exact areas on each side of a bent line',()=>{
 const square=[[0,0],[10,0],[10,10],[0,10],[0,0]],line=[[4,0],[6,5],[4,10]];
 const area=pieces=>pieces.reduce((sum,piece)=>sum+Math.abs(ringArea(piece[0])),0),edge=y=>4+0.4*Math.min(y,10-y);
 const west=clipSide([square],line,'west'),east=clipSide([square],line,'east');
 assert.ok(Math.abs(area(west)-50)<1e-9&&Math.abs(area(east)-50)<1e-9);
 for(const piece of west)for(const [x,y] of piece[0])assert.ok(x<=edge(y)+1e-9);
 for(const piece of east)for(const [x,y] of piece[0])assert.ok(x>=edge(y)-1e-9);
});

test('the module is frozen plain data that names its source and generator',()=>{
 assert.ok(Object.isFrozen(SHAPES)&&Object.isFrozen(SHAPES.continents)&&Object.isFrozen(SHAPES.countries));
 for(const [,,shape] of entries)assert.ok(Object.isFrozen(shape));
 assert.throws(()=>{SHAPES.countries.FRA.d='';},TypeError);
 assert.doesNotMatch(source,/^\s*import\b/m);
 for(const text of [SOURCE.sha256,SOURCE.url,'Natural Earth','5.1.1','public domain','site-b/tools/build-explorer-shapes.mjs','site/geography/PROVENANCE.md'])
  assert.ok(source.includes(text),text);
});

test('the generator refuses any other source',()=>{
 assert.throws(()=>verifySource(Buffer.from('{"type":"FeatureCollection","features":[]}')),/Refused source/);
 assert.throws(()=>verifySource(Buffer.alloc(SOURCE.bytes)),/Refused source/);
});

test('the rectangle clipper keeps exact areas, including a ring that leaves and re-enters',()=>{
 const box=[0,2,3,4],area=ring=>Math.abs(ringArea(ring.slice(0,-1)));
 const inside=[[0.5,2.5],[1,2.5],[1,3],[0.5,2.5]];
 assert.equal(area(clipRing(inside,box)),area(inside));
 assert.deepEqual(clipRing([[5,5],[6,5],[6,6],[5,5]],box),[]);
 // a ring that contains the whole window gives the window
 assert.equal(area(clipRing([[-1,0],[5,0],[5,9],[-1,9],[-1,0]],box)),6);
 // a U whose two prongs cross the window: two unit squares joined by zero-width edges along y=2
 const u=[[0,0],[3,0],[3,3],[2,3],[2,1],[1,1],[1,3],[0,3],[0,0]],clipped=clipRing(u,box);
 assert.ok(Math.abs(area(clipped)-2)<1e-12);
 for(const [x,y] of clipped)assert.ok(x>=0&&x<=3&&y>=2&&y<=4);
 assert.deepEqual(clipped[0],clipped.at(-1),'returned closed');
 assert.equal(Math.sign(ringArea(clipped.slice(0,-1))),Math.sign(ringArea(u.slice(0,-1))),'orientation kept');
});

test('Visvalingam-Whyatt keeps three points and removes a collinear point first',()=>{
 const square=[[0,0],[1,0],[2,0],[2,2],[0,2]];
 for(const weight of [0,PARAMETERS.weight]){
  const areas=effectiveAreas(square,weight);
  assert.equal([...areas].filter(value=>value===Infinity).length,3);
  assert.equal(areas[1],0,'the midpoint of a side has no area');
  assert.ok([...areas].every(value=>value>=0));
 }
 // weighted: a spike is cheaper than a right angle of the same triangle area
 const spike=effectiveAreas([[0,0],[4,0],[4,4],[2,4],[2.05,6],[1.95,4],[0,4]],PARAMETERS.weight);
 const plain=effectiveAreas([[0,0],[4,0],[4,4],[2,4],[2.05,6],[1.95,4],[0,4]],0);
 assert.ok(spike[4]<plain[4]);
});
