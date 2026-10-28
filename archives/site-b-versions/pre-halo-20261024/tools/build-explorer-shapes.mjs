// Rebuilds site-b/explorer-shapes.mjs, the simplified silhouettes of the version B Explorer carousel: the world,
// the four UN M49 continents of continents.mjs and the 30 countries of campuses.json.
//   node site-b/tools/build-explorer-shapes.mjs --source /path/to/ne_10m_admin_0_countries.geojson [--out FILE] [--check]
// The source must be the Natural Earth 5.1.1 file pinned in site/geography/PROVENANCE.md: other bytes are refused.
// --check rebuilds in memory and fails when FILE differs. Only d3 v7.9.0 (shared/map-data/d3.min.js) is loaded.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CONTINENTS} from '../continents.mjs';

const require=createRequire(import.meta.url);
const d3=require('../../shared/map-data/d3.min.js');

export const SOURCE=Object.freeze({
 title:'Natural Earth 1:10m Cultural Vectors, Admin 0 - Countries',version:'5.1.1',
 url:'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.1/geojson/ne_10m_admin_0_countries.geojson',
 sha256:'239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255',bytes:13287234,
 licence:'public domain (https://www.naturalearthdata.com/about/terms-of-use/)',
});

// Sizes are in units of the final viewBox (long side 100), areas in square units.
export const PARAMETERS=Object.freeze({
 long:100,margin:2,decimals:1,
 densify:0.25,      // degrees: longest lon/lat step before projection, so parallels stay curved
 raster:10,         // coverage pixels per unit for the union
 supersample:4,     // samples per pixel side: the traced coverage has no stair steps
 closing:1,         // pixels: shared borders and hairline gaps between parts disappear
 weight:0.7,        // Visvalingam-Whyatt weighted by the angle, as in Mapshaper: spikes go first, outlines stay smooth
 tolerance:0.02,    // smallest weighted triangle kept, even when the budget allows more
 budget:Object.freeze({country:250,continent:500,world:1500}),  // points per silhouette
 minPart:Object.freeze({country:3,continent:1,world:0.4}),      // smaller islands or exclaves are dropped
 minHole:Object.freeze({country:8,continent:3,world:1}),        // smaller holes are filled
});

// Countries keep their main landmass(es). window: lon/lat rectangle [west,south,east,north] the parts are clipped to;
// drop: rectangles that remove every polygon whose bounds they contain. Remaining specks go with minPart.
// with: other Natural Earth features merged into the silhouette, their shared border removed by the union.
export const COUNTRY_RULES=Object.freeze({
 FRA:{window:[-6,41,10,52]},        // metropolitan France and Corsica
 ESP:{window:[-10,35.5,5,44.5]},    // mainland and Balearic Islands, without the Canaries
 PRT:{window:[-10,36.5,-6,42.5]},   // mainland, without the Azores and Madeira
 NLD:{window:[3,50.5,7.5,54]},      // European Netherlands, without the Caribbean islands
 JPN:{window:[128,30.9,146.5,46]},  // the four main islands, without the Ryukyu and Ogasawara islands (Izu islands are specks)
 ARM:{drop:[[45.3,40.5,45.7,40.8]]},// without the Artsvashen exclave
 MAR:{with:['ESH']},                // with the whole of Western Sahara, the user's choice of 2026-10-24
});

// The Europe/Asia line through Russia, south to north, the user's choice of 2026-10-24: the crest of the Urals from
// Orsk, where the Ural River turns west, to Konstantinov Kamen, their northern end, then Baydaratskaya Bay and the
// Kara Sea, between Vaygach on the European side and Yamal on the Asian side. South of Orsk it follows the meridian
// to the Kazakh border instead of the river's westward course. Points are approximate, enough at the silhouettes'
// scale (about 1° per unit); the sea points were checked against the Natural Earth coast.
export const URALS=Object.freeze([
 [58.6,51.2],[59,53.4],[59.4,54.6],[59.8,55.3],[60,56.9],[59.3,58.5],[59.1,59.6],[59.45,61.75],[59.3,63.5],[60.1,65],
 [61.2,65.6],[62.8,66.2],[64.4,66.7],[65.5,67.6],[66.2,68.5],[67.6,68.75],[66.7,69.25],[65,69.75],[64,70.5],[64,72],
].map(point=>Object.freeze(point)));
const NOVAYA_ZEMLYA=[51,70.4,69.5,77.2];

// Continents: every Natural Earth country whose REGION_UN is the region, clipped to the window so far islands,
// the antimeridian and Antarctica stay out. Russia (REGION_UN Europe) is split along URALS: Europe keeps the west,
// Asia adds the east (split). Novaya Zemlya, Svalbard and Franz Josef Land are left out of both.
// unwrap: longitudes below -160° are shifted by 360° (Chukotka joins Asia).
export const CONTINENT_RULES=Object.freeze({
 africa:{region:'Africa',window:[-26,-36,64,38]},
 americas:{region:'Americas',window:[-172,-57,-10,84],drop:[[-161,18,-154,23]]},             // without Hawaii
 asia:{region:'Asia',window:[25,-12,192,82],unwrap:true,add:{RUS:[25,0,192,82]},split:{RUS:'east'},drop:[[44,79.5,66,82.5],NOVAYA_ZEMLYA]},
 europe:{region:'Europe',window:[-25,34,70,72],split:{RUS:'west'},drop:[NOVAYA_ZEMLYA]},
});

const featureId=({ISO_A3,ADM0_A3})=>ISO_A3!=='-99'?ISO_A3:ADM0_A3; // as site/geography: FRA, NOR; Palestine is PSE
const polygonsOf=geometry=>geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
const boundsOf=rings=>{
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(const ring of rings)for(const [x,y] of ring){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 return [x0,y0,x1,y1];
};
const contains=(outer,inner)=>inner[0]>=outer[0]&&inner[1]>=outer[1]&&inner[2]<=outer[2]&&inner[3]<=outer[3];
// Signed shoelace area; positive for a ring drawn clockwise on screen (y down), as the final outer rings are.
export const ringArea=ring=>{
 let sum=0;
 for(let i=0,n=ring.length,j=n-1;i<n;j=i++)sum+=ring[j][0]*ring[i][1]-ring[i][0]*ring[j][1];
 return sum/2;
};
const open=ring=>ring.length>1&&ring[0][0]===ring.at(-1)[0]&&ring[0][1]===ring.at(-1)[1]?ring.slice(0,-1):ring.slice();

/** Clips a ring to the rectangle [x0,y0,x1,y1] (Sutherland-Hodgman, one side after the other) and returns it closed,
 * or [] when nothing is left. Exact for filled areas: inside the rectangle every winding number is unchanged and
 * outside it is zero, so a ring that leaves and re-enters comes back as one ring whose pieces are joined by
 * zero-width edges along the border. Those edges cover no area under the nonzero or even-odd rule. */
export function clipRing(ring,[x0,y0,x1,y1]){
 const sides=[
  [p=>p[0]>=x0,(a,b)=>[x0,a[1]+(b[1]-a[1])*(x0-a[0])/(b[0]-a[0])]],
  [p=>p[0]<=x1,(a,b)=>[x1,a[1]+(b[1]-a[1])*(x1-a[0])/(b[0]-a[0])]],
  [p=>p[1]>=y0,(a,b)=>[a[0]+(b[0]-a[0])*(y0-a[1])/(b[1]-a[1]),y0]],
  [p=>p[1]<=y1,(a,b)=>[a[0]+(b[0]-a[0])*(y1-a[1])/(b[1]-a[1]),y1]],
 ];
 let points=open(ring);
 for(const [keeps,cut] of sides){
  const next=[];
  for(let i=0;i<points.length;i++){
   const a=points[(i||points.length)-1],b=points[i],aIn=keeps(a),bIn=keeps(b);
   if(bIn){if(!aIn)next.push(cut(a,b));next.push(b);}
   else if(aIn)next.push(cut(a,b));
  }
  points=next;
  if(!points.length)break;
 }
 return points.length>=3?[...points,points[0]]:[];
}

/** Clips a polygon (outer ring then holes) to a rectangle; null when the outer ring is outside. */
export function clipPolygon(polygon,box){
 const outer=clipRing(polygon[0],box);
 return outer.length?[outer,...polygon.slice(1).map(ring=>clipRing(ring,box)).filter(ring=>ring.length)]:null;
}

/** Keeps the 'west' or 'east' side of a south-to-north line (latitudes increasing, extended to the poles) and returns
 * the pieces, one per band between two successive latitudes. A shear makes the band's segment vertical, so each band is
 * clipped exactly as a rectangle; the pieces share horizontal edges, which the union of buildShape removes. */
export function clipSide(polygon,line,side){
 const points=[[line[0][0],-90],...line,[line.at(-1)[0],90]],pieces=[];
 for(let i=1;i<points.length;i++){
  const [ax,ay]=points[i-1],[bx,by]=points[i],at=y=>ax+(bx-ax)*(y-ay)/(by-ay);
  const piece=clipPolygon(polygon.map(ring=>ring.map(([x,y])=>[x-at(y),y])),side==='west'?[-Infinity,ay,0,by]:[0,ay,Infinity,by]);
  if(piece)pieces.push(piece.map(ring=>ring.map(([x,y])=>[x+at(y),y])));
 }
 return pieces;
}

const densify=(ring,step)=>{
 const out=[ring[0]];
 for(let i=1;i<ring.length;i++){
  const [ax,ay]=ring[i-1],[bx,by]=ring[i],n=Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))/step);
  for(let k=1;k<n;k++)out.push([ax+(bx-ax)*k/n,ay+(by-ay)*k/n]);
  out.push(ring[i]);
 }
 return out;
};

// Planar lon/lat area, only to report how much of a polygon a window cut away.
const lonLatArea=polygon=>polygon.reduce((sum,ring)=>sum+ringArea(ring),0);

function selectParts(polygons,{window,drop,unwrap,side},cuts,label){
 const out=[];
 for(let polygon of polygons){
  if(unwrap&&boundsOf([polygon[0]])[2]<-160)polygon=polygon.map(ring=>ring.map(([x,y])=>[x+360,y]));
  if(drop?.some(box=>contains(box,boundsOf([polygon[0]]))))continue;
  if(!window){out.push(polygon);continue;}
  const clipped=clipPolygon(polygon,window);
  if(!clipped)continue;
  const kept=side?clipSide(clipped,URALS,side):[clipped];
  const before=Math.abs(lonLatArea(polygon)),after=kept.reduce((sum,piece)=>sum+Math.abs(lonLatArea(piece)),0);
  if(after<before*(1-1e-9))cuts.push({part:label,kept:+(after/before).toFixed(4),bounds:boundsOf([polygon[0]]).map(v=>+v.toFixed(2))});
  out.push(...kept);
 }
 return out;
}

class Heap{ // binary min-heap of [key,index,stamp]; ties are broken by index, so builds are reproducible
 items=[];
 static less=(a,b)=>a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
 push(item){
  const a=this.items;let i=a.length;a.push(item);
  while(i>0){const parent=(i-1)>>1;if(!Heap.less(item,a[parent]))break;a[i]=a[parent];i=parent;}
  a[i]=item;
 }
 pop(){
  const a=this.items,top=a[0],last=a.pop();
  if(a.length){
   let i=0;
   for(;;){
    let child=2*i+1;if(child>=a.length)break;
    if(child+1<a.length&&Heap.less(a[child+1],a[child]))child++;
    if(!Heap.less(a[child],last))break;
    a[i]=a[child];i=child;
   }
   a[i]=last;
  }
  return top;
 }
}

/** Visvalingam-Whyatt effective areas of a closed ring (last point not repeated). With a weight k, each triangle
 * counts area*(1-k*cos(angle at the vertex)), so sharp spikes are removed before smooth bends (Mapshaper's weighted
 * variant). Locked points and the three points that would be left at the end get Infinity, so a ring never falls
 * below a triangle. Areas never decrease along the elimination, hence any threshold gives one consistent
 * simplification. */
export function effectiveAreas(points,weight=0,locked=null){
 const n=points.length,prev=new Int32Array(n),next=new Int32Array(n),stamp=new Int32Array(n),gone=new Uint8Array(n);
 const area=new Float64Array(n).fill(Infinity),heap=new Heap();
 for(let i=0;i<n;i++){prev[i]=(i+n-1)%n;next[i]=(i+1)%n;}
 const triangle=i=>{
  if(locked?.has(i))return Infinity;
  const [ax,ay]=points[prev[i]],[bx,by]=points[i],[cx,cy]=points[next[i]];
  const ux=ax-bx,uy=ay-by,vx=cx-bx,vy=cy-by,size=Math.abs(ux*vy-vx*uy)/2,norm=Math.hypot(ux,uy)*Math.hypot(vx,vy);
  return weight&&norm?size*(1-weight*Math.max(-1,Math.min(1,(ux*vx+uy*vy)/norm))):size;
 };
 for(let i=0;i<n;i++)heap.push([triangle(i),i,0]);
 let left=n,floor=0;
 while(left>3){
  const [value,i,s]=heap.pop();
  if(gone[i]||s!==stamp[i])continue;
  floor=Math.max(floor,value);area[i]=floor;gone[i]=1;left--;
  const p=prev[i],q=next[i];next[p]=q;prev[q]=p;
  for(const j of [p,q]){stamp[j]++;heap.push([triangle(j),j,stamp[j]]);}
 }
 return area;
}

// One threshold for every ring of a silhouette: the largest triangles are kept up to the budget. The leftmost, top,
// rightmost and bottom points are locked, so the simplified outline still spans the frame it was fitted to.
function simplifyRings(rings,budget,tolerance,weight){
 const extreme=[];
 rings.forEach((ring,k)=>ring.forEach(([x,y],i)=>[x,y,-x,-y].forEach((value,side)=>{
  if(!extreme[side]||value<extreme[side][2])extreme[side]=[k,i,value];
 })));
 const locked=rings.map((_,k)=>new Set(extreme.filter(([ring])=>ring===k).map(([,i])=>i)));
 const areas=rings.map((ring,k)=>effectiveAreas(ring,weight,locked[k]));
 const room=budget-areas.reduce((sum,values)=>sum+values.filter(value=>value===Infinity).length,0);
 if(room<0)throw new Error(`${rings.length} rings cannot fit in ${budget} points; raise minPart`);
 const finite=areas.flatMap(values=>[...values].filter(Number.isFinite)).sort((a,b)=>b-a);
 const cut=room<finite.length?finite[room]:-Infinity;
 return rings.map((ring,k)=>ring.filter((_,i)=>areas[k][i]>cut&&areas[k][i]>=tolerance));
}

// Scanline fill of one polygon (even-odd between its rings) into the mask; pixel (c,r) covers [c,c+1]x[r,r+1] and is
// filled when its centre is inside. Polygons are OR-ed, so countries that share a border form one area.
function fillPolygon(mask,width,height,rings){
 const edges=[];let low=Infinity,high=-Infinity;
 for(const ring of rings)for(let i=1;i<ring.length;i++){
  const [x0,y0]=ring[i-1],[x1,y1]=ring[i];
  if(y0===y1)continue;
  edges.push(x0,y0,x1,y1);low=Math.min(low,y0,y1);high=Math.max(high,y0,y1);
 }
 const r0=Math.max(0,Math.ceil(low-0.5)),r1=Math.min(height-1,Math.ceil(high-0.5)-1);
 if(r1<r0)return;
 const rows=Array.from({length:r1-r0+1},()=>[]);
 for(let e=0;e<edges.length;e+=4){
  const x0=edges[e],y0=edges[e+1],x1=edges[e+2],y1=edges[e+3],slope=(x1-x0)/(y1-y0);
  const first=Math.max(r0,Math.ceil(Math.min(y0,y1)-0.5)),last=Math.min(r1,Math.ceil(Math.max(y0,y1)-0.5)-1);
  for(let r=first;r<=last;r++)rows[r-r0].push(x0+(r+0.5-y0)*slope);
 }
 for(let r=r0;r<=r1;r++){
  const xs=rows[r-r0].sort((a,b)=>a-b);
  for(let k=0;k+1<xs.length;k+=2){
   const c0=Math.max(0,Math.ceil(xs[k]-0.5)),c1=Math.min(width-1,Math.ceil(xs[k+1]-0.5)-1);
   mask.fill(1,r*width+c0,r*width+c1+1);
  }
 }
}

// Square structuring element of radius r, as two separable sliding-window passes; outside the raster counts as empty.
function morph(mask,width,height,r,dilate){
 const full=2*r+1;
 const pass=(input,horizontal)=>{
  const out=new Uint8Array(input.length),lines=horizontal?height:width,length=horizontal?width:height,step=horizontal?1:width;
  for(let line=0;line<lines;line++){
   const base=horizontal?line*width:line;
   let sum=0;
   for(let i=0;i<r&&i<length;i++)sum+=input[base+i*step];
   for(let i=0;i<length;i++){
    if(i+r<length)sum+=input[base+(i+r)*step];
    if(i>r)sum-=input[base+(i-r-1)*step];
    out[base+i*step]=dilate?+(sum>0):+(sum===full);
   }
  }
  return out;
 };
 return pass(pass(mask,true),false);
}
const closing=(mask,width,height,r)=>r?morph(morph(mask,width,height,r,true),width,height,r,false):mask;

const ceilTenth=value=>Math.ceil(value*10-1e-9)/10;
// Uniform scale and offset that centre a box in a viewBox whose long side is 100 with the margin on every side,
// which is what projection.fitExtent does; the short side is rounded up to 0.1.
function frameFor([x0,y0,x1,y1]){
 const {long,margin}=PARAMETERS,w=x1-x0,h=y1-y0,scale=(long-2*margin)/Math.max(w,h);
 const width=w>=h?long:ceilTenth(w*scale+2*margin),height=w>=h?ceilTenth(h*scale+2*margin):long;
 return {width,height,scale,dx:(width-w*scale)/2-x0*scale,dy:(height-h*scale)/2-y0*scale};
}

const round=value=>Math.round(value*10**PARAMETERS.decimals)/10**PARAMETERS.decimals;
function cleanRing(points){
 const out=[];
 for(const [x,y] of points){
  const p=[round(x),round(y)],q=out.at(-1);
  if(!q||q[0]!==p[0]||q[1]!==p[1])out.push(p);
 }
 while(out.length>1&&out[0][0]===out.at(-1)[0]&&out[0][1]===out.at(-1)[1])out.pop();
 return out.length>=3&&Math.abs(ringArea(out))>=0.01?out:null;
}
const pathOf=polygons=>polygons.flat().map(ring=>`M${ring[0].join(' ')}L${ring.slice(1).map(p=>p.join(' ')).join(' ')}Z`).join('');

function buildShape(key,kind,parts){
 const {raster:R,supersample:S,margin,densify:step,closing:radius,tolerance,weight}=PARAMETERS;
 const minPart=PARAMETERS.minPart[kind],minHole=PARAMETERS.minHole[kind],budget=PARAMETERS.budget[kind];
 const lonLat=parts.map(polygon=>polygon.map(ring=>densify(ring,step)));
 let projection,centre=null;
 if(kind==='world')projection=d3.geoNaturalEarth1();
 else{
  centre=d3.geoCentroid({type:'MultiPolygon',coordinates:lonLat});
  projection=d3.geoAzimuthalEqualArea().rotate([-centre[0],-centre[1]]);
 }
 // Provisional fit of every candidate part, which sets the raster; the kept outline is re-fitted below.
 const sample={type:'MultiPoint',coordinates:lonLat.flat(2)};
 const [[a0,b0],[a1,b1]]=d3.geoPath(projection.fitSize([1000,1000],sample)).bounds(sample);
 const provisional=frameFor([a0,b0,a1,b1]);
 projection.fitExtent([[margin,margin],[provisional.width-margin,provisional.height-margin]],sample);
 // Union: S x S samples per pixel, closed, averaged into a coverage whose 0.5 contour is traced with sub-pixel
 // accuracy (a binary raster would leave stair steps that the simplification keeps).
 const width=Math.ceil(provisional.width*R),height=Math.ceil(provisional.height*R),fineWidth=width*S,fineHeight=height*S;
 const fine=new Uint8Array(fineWidth*fineHeight);
 for(const polygon of lonLat)fillPolygon(fine,fineWidth,fineHeight,polygon.map(ring=>ring.map(point=>{const [x,y]=projection(point);return [x*R*S,y*R*S];})));
 const closed=closing(fine,fineWidth,fineHeight,radius*S),coverage=new Float32Array(width*height);
 for(let y=0;y<fineHeight;y++){
  const row=Math.floor(y/S)*width,offset=y*fineWidth;
  for(let x=0;x<fineWidth;x++)if(closed[offset+x])coverage[row+Math.floor(x/S)]+=1/(S*S);
 }
 const traced=d3.contours().size([width,height]).thresholds([0.5])(coverage)[0].coordinates
  .map(polygon=>polygon.map(ring=>open(ring).map(([x,y])=>[x/R,y/R])));
 // Specks are judged in final units; parts outside the extent of the first selection never come back.
 const first=traced.filter(polygon=>Math.abs(ringArea(polygon[0]))>=minPart);
 if(!first.length)throw new Error(`${key}: nothing left above ${minPart} square units`);
 const extent=boundsOf(first.map(polygon=>polygon[0])),frame=frameFor(extent),s2=frame.scale**2;
 const place=([x,y])=>[x*frame.scale+frame.dx,y*frame.scale+frame.dy];
 let kept=traced.filter(polygon=>contains(extent,boundsOf([polygon[0]]))&&Math.abs(ringArea(polygon[0]))*s2>=minPart)
  .map(polygon=>[polygon[0],...polygon.slice(1).filter(hole=>Math.abs(ringArea(hole))*s2>=minHole)].map(ring=>ring.map(place)));
 // Simplify every ring with one threshold. A part or hole that the simplification shrinks under its minimum (the
 // triangle left of an islet) is dropped, and the others are simplified again with the points it freed.
 let simplified;
 for(;;){
  const rings=simplifyRings(kept.flat(),budget,tolerance,weight),next=[],drawn=[];
  let index=0,changed=false;
  for(const polygon of kept){
   const own=polygon.map(()=>rings[index++]);
   if(Math.abs(ringArea(own[0]))<minPart){changed=true;continue;}
   const holes=polygon.map((_,k)=>k).slice(1).filter(k=>Math.abs(ringArea(own[k]))>=minHole);
   if(holes.length<polygon.length-1)changed=true;
   next.push([polygon[0],...holes.map(k=>polygon[k])]);
   drawn.push([own[0],...holes.map(k=>own[k])]);
  }
  if(!next.length)throw new Error(`${key}: nothing left after simplification`);
  kept=next;simplified=drawn;
  if(!changed)break;
 }
 // Re-fit (a dropped islet may have set the extent), round, then orient: outer rings clockwise on screen, holes
 // anticlockwise.
 const refit=frameFor(boundsOf(simplified.map(polygon=>polygon[0])));
 const polygons=[];
 for(const polygon of simplified){
  const rings=polygon.map(ring=>cleanRing(ring.map(([x,y])=>[x*refit.scale+refit.dx,y*refit.scale+refit.dy])));
  if(!rings[0])continue;
  polygons.push(rings.filter(Boolean).map((ring,k)=>(ringArea(ring)>0)===(k===0)?ring:ring.reverse()));
 }
 const d=pathOf(polygons),points=polygons.flat().reduce((sum,ring)=>sum+ring.length,0);
 // Fidelity: the simplified outline rasterised again, against the traced union (same pixels).
 const scale=frame.scale*refit.scale,dx=frame.dx*refit.scale+refit.dx,dy=frame.dy*refit.scale+refit.dy;
 const back=new Uint8Array(width*height),unplace=([x,y])=>[(x-dx)/scale*R,(y-dy)/scale*R];
 for(const polygon of polygons)fillPolygon(back,width,height,polygon.map(ring=>[...ring,ring[0]].map(unplace)));
 let both=0,either=0;
 for(let i=0;i<coverage.length;i++){const union=coverage[i]>=0.5?1:0;both+=union&back[i];either+=union|back[i];}
 const viewBox=`0 0 ${refit.width} ${refit.height}`;
 return {
  shape:{viewBox,d},
  stats:{key,kind,points,budget,parts:polygons.length,holes:polygons.reduce((sum,p)=>sum+p.length-1,0),
   dropped:traced.length-polygons.length,iou:+(both/either).toFixed(4),bytes:d.length,
   centre:centre&&centre.map(v=>+v.toFixed(2)),viewBox},
 };
}

export function verifySource(bytes){
 const sha256=createHash('sha256').update(bytes).digest('hex');
 if(sha256!==SOURCE.sha256||bytes.length!==SOURCE.bytes)
  throw new Error(`Refused source: SHA-256 ${sha256}, ${bytes.length} bytes; expected the Natural Earth ${SOURCE.version} file ${SOURCE.sha256} (${SOURCE.bytes} bytes).`);
}

/** Builds every silhouette from the parsed Natural Earth GeoJSON. */
export function buildShapes(geojson){
 const features=geojson.features.filter(feature=>feature.properties.ADM0_A3!=='ATA');
 const byId=new Map(features.map(feature=>[featureId(feature.properties),feature]));
 const catalogue=JSON.parse(readFileSync(new URL('../campuses.json',import.meta.url),'utf8')).countries.map(country=>country.id).sort();
 for(const continent of CONTINENTS)for(const id of continent.countries){
  const region=byId.get(id)?.properties.REGION_UN;
  if(region!==CONTINENT_RULES[continent.id].region)throw new Error(`${id}: REGION_UN ${region} does not match ${continent.id}`);
 }
 const cuts=[],stats=[],shapes={world:null,continents:{},countries:{}};
 const record=result=>{stats.push(result.stats);return Object.freeze(result.shape);};
 shapes.world=record(buildShape('world','world',features.flatMap(feature=>polygonsOf(feature.geometry))));
 for(const {id} of CONTINENTS){
  const rule=CONTINENT_RULES[id],parts=[];
  for(const feature of features){
   const fid=featureId(feature.properties),extra=rule.add?.[fid];
   if(feature.properties.REGION_UN!==rule.region&&!extra)continue;
   parts.push(...selectParts(polygonsOf(feature.geometry),{...rule,window:extra??rule.window,side:rule.split?.[fid]},cuts,`${id}/${fid}`));
  }
  shapes.continents[id]=record(buildShape(id,'continent',parts));
 }
 for(const id of catalogue){
  const rule=COUNTRY_RULES[id]??{},members=[id,...rule.with??[]].map(fid=>{
   const feature=byId.get(fid);
   if(!feature)throw new Error(`${fid} is missing from Natural Earth`);
   return feature;
  });
  shapes.countries[id]=record(buildShape(id,'country',selectParts(members.flatMap(feature=>polygonsOf(feature.geometry)),rule,cuts,id)));
 }
 return {shapes,stats,cuts};
}

const describeRules=()=>[
 ...Object.entries(COUNTRY_RULES).map(([id,rule])=>`${id} ${rule.window?`window ${rule.window.join(',')}`:''}${rule.drop?`drop ${rule.drop.map(box=>box.join(',')).join(' ')}`:''}${rule.with?`with ${rule.with.join(',')}`:''}`),
 ...Object.entries(CONTINENT_RULES).map(([id,rule])=>`${id} REGION_UN ${rule.region} window ${rule.window.join(',')}${rule.add?` + ${Object.entries(rule.add).map(([fid,box])=>`${fid} ${box.join(',')}`).join(' ')}`:''}${rule.split?` ${Object.entries(rule.split).map(([fid,side])=>`${fid} ${side} of URALS`).join(' ')}`:''}${rule.drop?` drop ${rule.drop.map(box=>box.join(',')).join(' ')}`:''}${rule.unwrap?' unwrap':''}`),
 `URALS ${URALS.map(point=>point.join(',')).join(' ')}`,
];

export function renderModule({shapes}){
 const p=PARAMETERS,entry=(key,{viewBox,d})=>` ${key}:shape('${viewBox}','${d}'),`;
 return [
  '// Generated by site-b/tools/build-explorer-shapes.mjs: do not edit, change the generator and rebuild.',
  '// Simplified silhouettes of the version B Explorer carousel: the world, the four UN M49 continents of continents.mjs',
  '// and the 30 countries of campuses.json (ISO 3166-1 alpha-3). Each entry is {viewBox,d}: one compound path, long side',
  `// ${p.long} units with a ${p.margin}-unit margin, coordinates rounded to ${10**-p.decimals}. Outer rings are clockwise and holes anticlockwise:`,
  '// fill without stroke, nonzero or evenodd give the same result; internal borders are already merged.',
  `// Source: ${SOURCE.title} ${SOURCE.version}, ${SOURCE.licence}.`,
  `//  ${SOURCE.url}`,
  `//  SHA-256 ${SOURCE.sha256}, ${SOURCE.bytes} bytes: the file pinned in site/geography/PROVENANCE.md`,
  '//  (retrieved 2026-09-27); the generator refuses any other bytes. Its boundaries are those of the version A globe',
  '//  (site/geography), except for Morocco: Natural Earth\'s Morocco stops at the berm, so its silhouette also merges the',
  '//  Western Sahara feature (ESH) and shows the whole territory, the user\'s choice of 2026-10-24. Russia is split',
  '//  between Europe and Asia along the Urals (URALS below: their crest, then Baydaratskaya Bay and the Kara Sea), also',
  '//  the user\'s choice of 2026-10-24.',
  '// Method: parts clipped to lon/lat windows (Sutherland-Hodgman), edges densified, azimuthal equal-area projection',
  '//  centred on the spherical centroid (world: Natural Earth 1, without Antarctica), fitted with fitExtent; union by',
  `//  rasterisation (${p.raster} px per unit, ${p.supersample}x${p.supersample} samples, ${p.closing} px closing), coverage traced with d3.contours; parts under`,
  `//  ${p.minPart.country}/${p.minPart.continent}/${p.minPart.world} and holes under ${p.minHole.country}/${p.minHole.continent}/${p.minHole.world} square units (country/continent/world), before or after simplification, dropped;`,
  `//  outline re-fitted; Visvalingam-Whyatt weighted by the angle (k=${p.weight}) to at most ${p.budget.country}/${p.budget.continent}/${p.budget.world} points, smallest`,
  `//  triangle ${p.tolerance}. Rules:`,
  ...describeRules().map(rule=>`//  ${rule}`),
  'const shape=(viewBox,d)=>Object.freeze({viewBox,d});',
  'export const SHAPES=Object.freeze({',
  entry('world',shapes.world),
  ' continents:Object.freeze({',
  ...Object.entries(shapes.continents).map(([key,value])=>entry(` ${key}`,value)),
  ' }),',
  ' countries:Object.freeze({',
  ...Object.entries(shapes.countries).map(([key,value])=>entry(` ${key}`,value)),
  ' }),',
  '});',
  '',
 ].join('\n');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),valued=new Set(['--source','--out']),options={},positional=[];
 for(let i=0;i<args.length;i++){
  if(valued.has(args[i]))options[args[i].slice(2)]=args[++i];
  else if(args[i].startsWith('--'))options[args[i].slice(2)]=true;
  else positional.push(args[i]);
 }
 const source=options.source??positional[0];
 if(typeof source!=='string'){
  console.error('Usage: node site-b/tools/build-explorer-shapes.mjs --source ne_10m_admin_0_countries.geojson [--out FILE] [--check]');
  process.exit(2);
 }
 const out=resolve(typeof options.out==='string'?options.out:fileURLToPath(new URL('../explorer-shapes.mjs',import.meta.url)));
 const bytes=readFileSync(resolve(source));
 verifySource(bytes);
 const result=buildShapes(JSON.parse(bytes.toString('utf8'))),text=renderModule(result);
 console.log(JSON.stringify({stats:result.stats,cuts:result.cuts,moduleBytes:Buffer.byteLength(text)}));
 if(options.check){
  let current='';
  try{current=readFileSync(out,'utf8');}catch{}
  if(current!==text){console.error(`${out} differs from a fresh build.`);process.exit(1);}
  console.error(`${out} is up to date.`);
 }else writeFileSync(out,text);
}

