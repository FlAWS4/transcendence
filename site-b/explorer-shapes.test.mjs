import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SHAPES} from './explorer-shapes.mjs';
import {CONTINENTS,continentOfCountry} from './continents.mjs';
import {SOURCE,PARAMETERS,COUNTRY_RULES,CONTINENT_RULES,URALS,METADATA,GLOBE,FLAG_RULES,clipRing,clipSide,effectiveAreas,ringArea,
 verifySource,haloLabel,polylabel,signedDistance,flagRect,lengthOf} from './tools/build-explorer-shapes.mjs';

const source=readFileSync(new URL('./explorer-shapes.mjs',import.meta.url),'utf8');
const {countries,campuses}=JSON.parse(readFileSync(new URL('./campuses.json',import.meta.url),'utf8'));
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
// Polygons of a path: each outer ring (clockwise, positive area) followed by its holes, as the generator prints them.
function polygonsOf(d){
 const polygons=[];
 for(const ring of ringsOf(d)){if(ringArea(ring)>0)polygons.push([ring]);else polygons.at(-1).push(ring);}
 return polygons;
}
const largest=polygons=>polygons.reduce((a,b)=>Math.abs(ringArea(b[0]))>Math.abs(ringArea(a[0]))?b:a);
const round=value=>Math.round(value*10)/10;
const header=source.slice(0,source.indexOf('\nconst freeze='));
const EMBLEMS=Object.keys(FLAG_RULES).filter(id=>typeof FLAG_RULES[id]==='object');
// Halo's anchors computed by the prototype of the spec (SPEC-B-HALO, Appendix B), pull 0.45, precision 0.1.
const APPENDIX_LABELS={
 africa:[58.5,44.5],americas:[39.7,64.9],asia:[45.8,46.0],europe:[52.1,53.3],
 AGO:[44.1,56.5],ALB:[19.5,51.6],ARE:[60.4,59.6],ARM:[48.4,44.0],AUT:[65.6,28.9],BEL:[55.4,30.6],BRA:[62.5,43.4],
 CAN:[25.5,50.5],CHE:[45.8,27.4],CZE:[48.6,29.9],DEU:[33.4,46.5],ESP:[41.5,37.9],FRA:[48.0,47.2],GBR:[29.1,49.3],
 ITA:[44.7,46.6],JOR:[30.7,63.4],JPN:[53.3,65.0],KOR:[31.8,46.3],LBN:[37.9,49.0],LUX:[34.3,58.3],MAR:[44.1,55.4],
 MDG:[24.8,49.0],MYS:[61.5,26.7],NLD:[44.0,50.3],POL:[53.1,43.6],PRT:[19.3,54.9],PSE:[67.4,33.0],SGP:[50.0,25.5],
 THA:[26.3,34.4],TUR:[49.8,23.3],
};
// The campuses on the visible face of the Monde globe centred on 12°E 24°N (SPEC-B-HALO, Appendix B), and the 7 others.
const GLOBE_PINS=['1337-ben-guerir','1337-khouribga','1337-med','1337-rabat','abu-dhabi','amman','angouleme','antananarivo',
 'antwerp','bangkok','barcelona','beirut','belo-horizonte','berlin','brussels','codam','firenze','heilbronn','irbid','istanbul',
 'kocaeli','lausanne','le-havre','lisboa','london','luanda','luxembourg','lyon','madrid','malaga','marseille','milano',
 'mulhouse','nablus','nice','paris','perpignan','porto','prague','quebec','rio','roma','sao','tirana','urduliz','vienna',
 'warsaw','wels','wolfsburg','yerevan','zurich'];
const FAR_SIDE=['gyeongsan','iskandar-puteri','kuala-lumpur','penang','seoul','singapore','tokyo'];

test('one silhouette for the world, each continent of continents.mjs and each catalogue country',()=>{
 assert.deepEqual(Object.keys(SHAPES),['world','continents','countries']);
 assert.deepEqual(Object.keys(SHAPES.continents),CONTINENTS.map(continent=>continent.id));
 assert.deepEqual(Object.keys(SHAPES.countries),countries.map(country=>country.id).sort());
 assert.equal(entries.length,35);
 for(const [id,kind,shape] of entries){
  // §6.1 of SPEC-B-HALO: viewBox, d, box, label, pins, then cuts (europe, asia), flag and focus (countries, focus on
  // the emblem flags only) or sphere (world).
  const keys=['viewBox','d','box','label','pins',...(id==='europe'||id==='asia'?['cuts']:[]),
   ...(kind==='country'?['flag',...(EMBLEMS.includes(id)?['focus']:[])]:[]),...(kind==='world'?['sphere']:[])];
  assert.deepEqual(Object.keys(shape),keys,id);
  assert.equal(typeof shape.d,'string',id);assert.ok(shape.d.length>20,id);
 }
});

test('each viewBox has a long side of 100, the outline fills it inside the margin and keeps its aspect',()=>{
 const {long,margin}=PARAMETERS;
 // The world is exempt: its frame is the sphere's, so its land box [2,2,98,90.9] is off-centre by design.
 for(const [id,,shape] of entries.filter(([id])=>id!=='world')){
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

test('the world is the Monde globe, an orthographic hemisphere centred on 12°E 24°N (SPEC-B-HALO §4.6, §6.2)',()=>{
 assert.deepEqual(GLOBE,{centre:[12,24],limb:0.12});
 assert.ok(Object.isFrozen(GLOBE)&&Object.isFrozen(GLOBE.centre));
 const world=SHAPES.world;
 assert.equal(world.viewBox,'0 0 100 100');
 assert.deepEqual(world.sphere,[50,50,48]);
 assert.deepEqual(world.label,[50,50],'the name is centred on the sphere');
 for(const [x,y] of ringsOf(world.d).flat())assert.ok(Math.hypot(x-50,y-50)<=48.2,`${x},${y} lies outside the sphere`);
 assert.deepEqual(world.box,[2,2,98,90.9]);
 // the 51 campuses of the visible face, more than 0.12 rad inside the horizon; the 7 others are on the far side
 assert.deepEqual(Object.keys(world.pins),GLOBE_PINS);
 assert.deepEqual([...GLOBE_PINS,...FAR_SIDE].sort(),campuses.map(campus=>campus.id).sort());
 assert.ok(ringsOf(world.d).some(ring=>ringArea(ring)<0),'lakes and the Caspian are holes');
});

test('the module header describes the globe, its far side and halo\'s labels',()=>{
 assert.ok(header.includes('12°E 24°N'),'the centre of the globe');
 for(const id of FAR_SIDE)assert.ok(header.includes(id),`${id} is named on the far side`);
 assert.ok(header.includes('the 51 on the visible face'));
 assert.ok(header.includes('Halo\'s anchor')&&header.includes(`minus ${METADATA.pull} times`));
 assert.ok(header.includes('sphere [cx,cy,r]'));
 // the former world (Natural Earth 1 projection, label on land in Siberia, every campus pinned) is gone; the
 // source title « Natural Earth 1:10m » stays
 assert.doesNotMatch(header,/Natural Earth 1(?!:10m)/);
 assert.ok(!header.includes('pole is in Siberia')&&!header.includes('world: all of them'));
 assert.ok(header.includes('the former label'),'the focus line names the pole of inaccessibility');
});

test('labels are halo\'s anchors: the pole of inaccessibility pulled toward the centre of the box',()=>{
 assert.equal(METADATA.pull,0.45);
 for(const [id,,shape] of entries.filter(([id])=>id!=='world')){
  const main=largest(polygonsOf(shape.d)),[x0,y0,x1,y1]=shape.box,[x,y]=haloLabel(main,[(x0+x1)/2,(y0+y1)/2]);
  const [lx,ly]=shape.label,[ax,ay]=APPENDIX_LABELS[id];
  assert.ok(Math.abs(lx-x)<=0.15&&Math.abs(ly-y)<=0.15,`${id}: ${shape.label} for ${x.toFixed(2)},${y.toFixed(2)}`);
  assert.ok(Math.abs(lx-ax)<=0.2&&Math.abs(ly-ay)<=0.2,`${id}: ${shape.label}, Appendix B ${APPENDIX_LABELS[id]}`);
  assert.ok(signedDistance(lx,ly,main)>=3,`${id}: the name sits at least 3 units inside its largest polygon`);
 }
});

test('boxes and pins come from the outline and the catalogue',()=>{
 const offOutline=([x,y],polygons)=>Math.max(0,-Math.max(...polygons.map(polygon=>signedDistance(x,y,polygon))));
 const ids=filter=>campuses.filter(filter).map(campus=>campus.id).sort();
 for(const [id,kind,shape] of entries){
  const [x0,y0,x1,y1]=boundsOf(ringsOf(shape.d).flat());
  shape.box.forEach((value,i)=>assert.ok(Math.abs(value-[x0,y0,x1,y1][i])<=0.05,`${id} box ${shape.box}`));
  const keys=Object.keys(shape.pins);
  assert.deepEqual(keys,[...keys].sort(),`${id} pins sorted by id`);
  if(kind==='continent')assert.deepEqual(keys,ids(campus=>continentOfCountry(campus.country)===id),id);
  if(kind==='country')assert.deepEqual(keys,ids(campus=>campus.country===id),id);
  const polygons=polygonsOf(shape.d);
  for(const [campus,point] of Object.entries(shape.pins)){
   assert.ok(point.every(value=>Number.isFinite(value)&&round(value)===value),`${id}/${campus} rounded to 0.1`);
   assert.ok(offOutline(point,polygons)<=1.6,`${id}/${campus} lies ${offOutline(point,polygons).toFixed(2)} units off the outline`);
  }
 }
 assert.deepEqual(Object.fromEntries(Object.entries(SHAPES.continents).map(([id,shape])=>[id,Object.keys(shape.pins).length])),
  {africa:6,americas:4,asia:16,europe:32});
 assert.equal(Object.values(SHAPES.countries).reduce((sum,shape)=>sum+Object.keys(shape.pins).length,0),58);
});

test('cut runs lie on the outline of Europe and Asia only, along the Urals',()=>{
 for(const [id,,shape] of entries){
  if(id!=='europe'&&id!=='asia'){assert.equal(shape.cuts,undefined,id);continue;}
  const vertices=new Set(ringsOf(shape.d).flat().map(point=>point.join(',')));
  assert.ok(shape.cuts.length>=1,id);
  for(const {points} of shape.cuts){
   for(const point of points)assert.ok(vertices.has(point.join(',')),`${id}: ${point} is not an outline vertex`);
   assert.ok(lengthOf(points)>=METADATA.cut.minLength,`${id}: a run of ${lengthOf(points).toFixed(2)} units`);
  }
  assert.ok(Math.max(...shape.cuts.map(({points})=>lengthOf(points)))>=METADATA.cut.longest,id);
 }
 // the runs of the current build (SPEC-B-HALO §4.5): Europe from (85.6, 2) to (98, 38), Asia from (27.6, 35.3) to (37.5, 21.2)
 const ends=({points})=>[points.length,points[0],points.at(-1)];
 assert.deepEqual(SHAPES.continents.europe.cuts.map(ends),[[15,[85.6,2],[98,38]]]);
 assert.deepEqual(SHAPES.continents.asia.cuts.map(ends),[[10,[27.6,35.3],[37.5,21.2]]]);
});

test('flags follow FLAG_RULES and the emblems keep their focus, unchanged by the new labels',()=>{
 assert.deepEqual([...EMBLEMS].sort(),['AGO','ALB','BRA','CAN','ESP','JOR','JPN','KOR','LBN','MAR','PRT','TUR']);
 for(const [id,shape] of Object.entries(SHAPES.countries)){
  assert.deepEqual(shape.flag,flagRect(FLAG_RULES[id],shape.box,shape.focus??null).map(round),id);
  if(!EMBLEMS.includes(id)){assert.equal(shape.focus,undefined,id);continue;}
  if(id==='JOR'){
   // its rule's `at` point (36.38°E 31.42°N) projected like the outline, set above the name
   assert.deepEqual(shape.focus,[30.7,47]);
   continue;
  }
  const [x,y]=polylabel(largest(polygonsOf(shape.d)));
  assert.deepEqual(shape.focus,[round(x),round(y)],`${id}: the pole of inaccessibility, the former label`);
 }
 // the names moved, the emblems did not (SPEC-B-HALO Appendix B)
 assert.deepEqual(SHAPES.countries.MAR.focus,[63.7,29.5]);assert.deepEqual(SHAPES.countries.MAR.label,[44.1,55.4]);
 assert.deepEqual(SHAPES.countries.PRT.focus,[26.6,30.1]);assert.deepEqual(SHAPES.countries.PRT.label,[19.3,54.9]);
});

test('the module stays under 125 KB',()=>{
 assert.ok(Buffer.byteLength(source)<125*1024,`${Buffer.byteLength(source)} bytes`);
});

test('haloLabel: the centre of a square, the thick arm of an L nearest the centre of the box',()=>{
 const square=[[[0,0],[10,0],[10,10],[0,10]]],[sx,sy,sd]=haloLabel(square,[5,5]);
 assert.ok(Math.abs(sx-5)<=0.1&&Math.abs(sy-5)<=0.1&&Math.abs(sd-5)<=0.1,`${sx},${sy}`);
 // a thick vertical arm (10 wide) and a thin foot (4 high): every point of the arm's axis is a pole of
 // inaccessibility; the pull chooses the one nearest the centre of the box (25, 25)
 const shape=[[[0,0],[10,0],[10,46],[50,46],[50,50],[0,50]]],centre=[25,25];
 const [x,y,clearance]=haloLabel(shape,centre),[px,py]=polylabel(shape);
 assert.ok(x>0&&x<10&&y>0&&y<46&&clearance>=4.8,`inside the thick arm: ${x},${y} (${clearance})`);
 assert.ok(Math.abs(y-25)<=0.2,`level with the centre: ${y}`);
 assert.ok(Math.hypot(x-centre[0],y-centre[1])<Math.hypot(px-centre[0],py-centre[1])-1,`closer to the centre than polylabel's ${px},${py}`);
 // without pull it is the pole of inaccessibility again
 assert.ok(Math.abs(haloLabel(shape,centre,{pull:0})[2]-polylabel(shape)[2])<=0.1);
});
