import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SHAPES} from './explorer-shapes.mjs';
import {ensureArtDefs,createSilhouette,createDots,createPrintedLogo,fitLogo,flagMatrix,icon,ICON_NAMES} from './explorer-art.mjs';

// A rich fake DOM: namespaced elements, case-preserving attributes, append/prepend of elements only, a connected body,
// getElementById, and the call log of the document factories.
const SVG='http://www.w3.org/2000/svg',HTML='http://www.w3.org/1999/xhtml';
class FakeElement{
 constructor(doc,namespaceURI,tag){Object.assign(this,{ownerDocument:doc,namespaceURI,localName:String(tag),children:[],parentNode:null,attrs:new Map()});}
 setAttribute(name,value){this.attrs.set(String(name),String(value));}
 getAttribute(name){return this.attrs.has(String(name))?this.attrs.get(String(name)):null;}
 hasAttribute(name){return this.attrs.has(String(name));}
 append(...nodes){for(const node of nodes){assert.ok(node instanceof FakeElement,'only elements are appended');node.remove();node.parentNode=this;this.children.push(node);}}
 prepend(...nodes){for(const node of [...nodes].reverse()){assert.ok(node instanceof FakeElement,'only elements are prepended');node.remove();node.parentNode=this;this.children.unshift(node);}}
 remove(){if(!this.parentNode)return;const list=this.parentNode.children;list.splice(list.indexOf(this),1);this.parentNode=null;}
 get firstChild(){return this.children[0]??null;}
 get isConnected(){let node=this;while(node.parentNode)node=node.parentNode;return node===this.ownerDocument.documentElement;}
 get classes(){return (this.getAttribute('class')||'').split(/\s+/).filter(Boolean);}
 is(name){return this.classes.includes(name);}
}
function fakeDocument({baseURI=null,body=true}={}){
 const doc={calls:[]};
 doc.documentElement=new FakeElement(doc,HTML,'html');
 if(body){doc.body=new FakeElement(doc,HTML,'body');doc.documentElement.append(doc.body);}
 doc.createElementNS=(namespace,tag)=>{doc.calls.push('createElementNS');return new FakeElement(doc,namespace,tag);};
 doc.createElement=tag=>{doc.calls.push('createElement');return new FakeElement(doc,HTML,tag);};
 doc.getElementById=id=>all(doc.documentElement).find(node=>node.getAttribute('id')===id)??null;
 if(baseURI)doc.baseURI=baseURI;
 return doc;
}
// The strict document of the other builders' fakes (SPEC-B-HALO §7.4 « required »): factories, setAttribute, append.
function strictDocument(){
 class Strict{
  constructor(namespaceURI,tag){Object.assign(this,{namespaceURI,localName:tag,children:[],attrs:new Map()});}
  setAttribute(name,value){this.attrs.set(String(name),String(value));}
  getAttribute(name){return this.attrs.get(String(name))??null;}
  append(...nodes){for(const node of nodes){if(!(node instanceof Strict))throw new TypeError('append: Element only');this.children.push(node);}}
 }
 return {baseURI:'https://horizon.test/site-b/index.html',createElement:tag=>new Strict(HTML,tag),createElementNS:(namespace,tag)=>new Strict(namespace,tag),body:new Strict(HTML,'body')};
}
const all=root=>{const found=[];const walk=node=>{found.push(node);node.children.forEach(walk);};walk(root);return found;};
const byTag=(root,tag)=>all(root).filter(node=>node.localName===tag);
const byClass=(root,name)=>all(root).filter(node=>node.is(name));
const one=(root,name)=>{const found=byClass(root,name);assert.equal(found.length,1,name);return found[0];};
const signature=node=>node.localName+(node.classes.length?'.'+node.classes.join('.'):'');
const numberOf=(node,name)=>Number(node.getAttribute(name));
const near=(actual,expected,tolerance,label)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual} instead of ${expected}`);
const ancestorsInside=(node,root)=>{const list=[];for(let parent=node.parentNode;parent&&parent!==root;parent=parent.parentNode)list.push(parent);return list;};

// Fixtures: a cut continent (two runs), a plain continent, a flagged country, a pre-metadata entry, a globe.
const continentWithCuts={viewBox:'0 0 100 80',d:'M10 10L90 10 90 70 10 70Z',box:[10,10,90,70],label:[50,40],
 pins:{b:[20,20],a:[30,30],c:[40,40]},cuts:[{points:[[90,10],[88,30],[90,50]]},{points:[[90,55],[90,70]]}]};
const continentPlain={viewBox:'0 0 100 60',d:'M5 5L95 5 95 55 5 55Z',box:[5,5,95,55],label:[50,30],pins:{z:[50,30]}};
const countryWithFlag={viewBox:'0 0 100 50',d:'M5 5L95 5 95 45 5 45ZM40 20L40 30 60 30 60 20Z',box:[5,5,95,45],label:[50,25],pins:{y:[70,25],x:[30,25]},flag:[4.1,-8.6,91.8,68.9],focus:[50,25]};
const premetadata={viewBox:'0 0 100 50',d:'M2 2L98 2 98 48 2 48Z'};
const globe={viewBox:'0 0 100 100',d:'M30 30L70 30 70 70 30 70Z',box:[30,30,70,70],label:[50,50],pins:{p:[40,40],q:[60,60]},sphere:[50,50,48]};
const STROKED=['hx-rim','hx-flag-rim','hx-sea-rim','hx-outline','hx-dot','hx-locator-dot','hx-locator-ring'];
const KIND_OF={world:'world',continents:'continent',countries:'country'};

// Every id defined in the svg, and every reference url(#…) / href="#…" made by it.
function idsAndReferences(svg){
 const ids=all(svg).map(node=>node.getAttribute('id')).filter(Boolean),references=[];
 for(const node of all(svg))for(const [name,value] of node.attrs){
  for(const match of value.matchAll(/url\(#([^)]+)\)/g))references.push(match[1]);
  if(name==='href'&&value.startsWith('#'))references.push(value.slice(1));
 }
 return {ids,references};
}
function assertSelfContained(svg,label){
 const {ids,references}=idsAndReferences(svg);
 assert.equal(new Set(ids).size,ids.length,`${label}: duplicate id`);
 for(const reference of references)assert.ok(ids.includes(reference),`${label}: url(#${reference}) resolves in its own SVG`);
}
function assertOutlineLast(svg,d,label,{after=[]}={}){
 const layers=svg.children.slice(1),tail=layers.slice(layers.length-after.length);
 assert.deepEqual(tail.map(signature),after,`${label}: only ${after.join(', ')||'nothing'} after the outline`);
 const shapeLayers=layers.slice(0,layers.length-after.length),outlines=byClass(svg,'hx-outline');
 const last=shapeLayers.at(-1),path=outlines.find(node=>node.localName==='path');
 assert.ok(path,`${label}: path.hx-outline`);
 assert.ok(shapeLayers.slice(-2).includes(path),`${label}: the outline closes the shape layers`);
 assert.equal(path.getAttribute('d'),d,`${label}: the outline draws the shape's d`);
 for(const outline of outlines){
  assert.equal(outline.parentNode,svg,`${label}: the outline has the svg as its only ancestor (no mask, clip or g)`);
  assert.equal(outline.getAttribute('mask'),null);assert.equal(outline.getAttribute('clip-path'),null);
 }
 assert.ok(last.is('hx-outline'),`${label}: the last shape layer is an outline`);
}

test('ensureArtDefs: one hidden SVG of six token gradients, first child of body, never display:none, idempotent',()=>{
 const doc=fakeDocument();
 const intruder=new FakeElement(doc,HTML,'div');doc.body.append(intruder);
 const defs=ensureArtDefs(doc);
 assert.equal(defs.namespaceURI,SVG);assert.equal(defs.localName,'svg');
 assert.equal(doc.body.firstChild,defs,'first child of body');
 for(const [name,value] of [['id','hx-defs'],['aria-hidden','true'],['width','0'],['height','0'],['style','position:absolute;width:0;height:0;overflow:hidden']])assert.equal(defs.getAttribute(name),value,name);
 assert.ok(!/display\s*:\s*none/.test(defs.getAttribute('style')),'never display:none');
 assert.equal(ensureArtDefs(doc),defs,'idempotent');
 assert.equal(byTag(doc.body,'svg').length,1,'inserted once');
 const gradients=defs.children[0].children;
 assert.deepEqual(gradients.map(node=>`${node.localName}#${node.getAttribute('id')}`),[
  'linearGradient#hx-land-grad','linearGradient#hx-land-soft-grad','linearGradient#hx-sheen-grad','radialGradient#hx-sea-grad',
  'linearGradient#hx-horizon-line-grad','linearGradient#hx-horizon-glow-grad']);
 const stops=id=>gradients.find(node=>node.getAttribute('id')===id).children.map(stop=>[Number(stop.getAttribute('offset')),stop.getAttribute('style')]);
 const vector=id=>['x1','y1','x2','y2'].map(name=>Number(gradients.find(node=>node.getAttribute('id')===id).getAttribute(name)));
 assert.deepEqual(stops('hx-land-grad'),[[0,'stop-color:var(--hx-land-a)'],[.55,'stop-color:var(--hx-land-b)'],[1,'stop-color:var(--hx-land-c)']]);
 assert.deepEqual(vector('hx-land-grad'),[0,0,1,1]);
 assert.deepEqual(stops('hx-land-soft-grad'),[[0,'stop-color:var(--hx-land-b)'],[1,'stop-color:var(--hx-land-c)']]);
 assert.deepEqual(stops('hx-sheen-grad'),[[0,'stop-color:var(--hx-sheen-hi)'],[.45,'stop-color:var(--hx-sheen-hi);stop-opacity:0'],[1,'stop-color:var(--hx-sheen-lo)']]);
 assert.deepEqual(vector('hx-sheen-grad'),[0,0,.6,1]);
 const sea=gradients[3];
 assert.deepEqual(['cx','cy','r'].map(name=>Number(sea.getAttribute(name))),[.38,.32,.75]);
 assert.deepEqual(stops('hx-sea-grad'),[[0,'stop-color:var(--hx-sea-a)'],[1,'stop-color:var(--hx-sea-b)']]);
 assert.deepEqual(stops('hx-horizon-line-grad'),[[0,'stop-color:var(--hx-teal);stop-opacity:0'],[.3,'stop-color:var(--hx-teal);stop-opacity:0.55'],[.5,'stop-color:var(--hx-pink);stop-opacity:0.5'],[.7,'stop-color:var(--hx-teal);stop-opacity:0.55'],[1,'stop-color:var(--hx-teal);stop-opacity:0']]);
 assert.deepEqual(stops('hx-horizon-glow-grad'),[[0,'stop-color:var(--hx-teal);stop-opacity:0'],[.35,'stop-color:var(--hx-teal);stop-opacity:0.5'],[.5,'stop-color:var(--hx-pink);stop-opacity:0.45'],[.65,'stop-color:var(--hx-teal);stop-opacity:0.5'],[1,'stop-color:var(--hx-teal);stop-opacity:0']]);
 for(const id of ['hx-horizon-line-grad','hx-horizon-glow-grad'])assert.deepEqual(vector(id),[0,0,1,0]);
 for(const stop of all(defs).filter(node=>node.localName==='stop'))assert.match(stop.getAttribute('style'),/^stop-color:var\(--hx-[a-z-]+\)(?:;stop-opacity:[\d.]+)?$/,'every stop colour is a token');
 // One per document; an existing #hx-defs is reused; a removed one is drawn again.
 const other=fakeDocument();
 assert.notEqual(ensureArtDefs(other),defs);
 const third=fakeDocument(),existing=new FakeElement(third,SVG,'svg');existing.setAttribute('id','hx-defs');third.body.append(existing);
 assert.equal(ensureArtDefs(third),existing);
 defs.remove();
 const again=ensureArtDefs(doc);
 assert.notEqual(again,defs);assert.equal(doc.body.firstChild,again);
 // Fakes without prepend, or without a body, never throw.
 const strict=strictDocument(),strictDefs=ensureArtDefs(strict);
 assert.equal(strict.body.children[0],strictDefs);
 assert.equal(ensureArtDefs(strict),strictDefs);
 assert.equal(ensureArtDefs(fakeDocument({body:false})).getAttribute('id'),'hx-defs');
 assert.equal(ensureArtDefs(null),null);
});

test('world with sphere: the globe (sea, land, sea rim, sheen) closed by the land and sphere outlines',()=>{
 const doc=fakeDocument(),svg=createSilhouette(doc,{shape:globe,kind:'world',scale:2.5});
 assert.equal(svg.namespaceURI,SVG);assert.equal(svg.localName,'svg');
 for(const [name,value] of [['class','hx-art'],['viewBox','0 0 100 100'],['data-kind','world'],['data-variant','item'],['aria-hidden','true'],['focusable','false'],['preserveAspectRatio','xMidYMid meet']])assert.equal(svg.getAttribute(name),value,name);
 assert.deepEqual(svg.children.map(signature),['defs','circle.hx-sea','use.hx-land','circle.hx-sea-rim','circle.hx-sphere-sheen','path.hx-outline','circle.hx-outline']);
 for(const circle of byTag(svg,'circle'))assert.deepEqual(['cx','cy','r'].map(name=>numberOf(circle,name)),[50,50,48]);
 assert.deepEqual(svg.children[0].children.map(signature),['path'],'only the shape in defs: no clip, mask or filter');
 assert.equal(svg.children[2].getAttribute('href'),'#'+svg.children[0].children[0].getAttribute('id'));
 assertOutlineLast(svg,globe.d,'globe',{after:['circle.hx-outline']});
 assertSelfContained(svg,'globe');
 assert.equal(byClass(svg,'hx-rim').length,0,'no rim on the globe land');
 assert.deepEqual([...new Set(doc.calls)],['createElementNS']);
});

test('world without sphere (the flat map before A1): drawn as a continent without cuts',()=>{
 const flat={...continentWithCuts,label:[50,40]},svg=createSilhouette(fakeDocument(),{shape:flat,kind:'world',scale:3});
 assert.equal(svg.getAttribute('data-kind'),'world');
 assert.deepEqual(svg.children.map(signature),['defs','g.hx-body','path.hx-outline']);
 assert.deepEqual(svg.children[1].children.map(signature),['use.hx-land','use.hx-sheen','g']);
 assert.deepEqual(svg.children[1].children[2].children.map(signature),['path.hx-rim']);
 assert.equal(byTag(svg,'mask').length+byTag(svg,'filter').length,0,'a world never uses the cut masks');
 assert.equal(svg.children[1].getAttribute('mask'),null);
 assert.equal(byClass(svg,'hx-sea').length,0);
 assertOutlineLast(svg,flat.d,'flat world');
 // A malformed sphere falls back the same way.
 assert.deepEqual(createSilhouette(fakeDocument(),{shape:{...globe,sphere:[50,50]},kind:'world'}).children.map(signature),['defs','g.hx-body','path.hx-outline']);
});

test('continent with cuts: the body fades and the rim is cleared along each run; the outline stays outside both',()=>{
 const k=3.249,svg=createSilhouette(fakeDocument(),{shape:continentWithCuts,kind:'continent',scale:k});
 const [defs,body,outline]=svg.children;
 assert.deepEqual(svg.children.map(signature),['defs','g.hx-body','path.hx-outline']);
 assert.deepEqual(defs.children.map(signature),['path','filter','mask','mask']);
 const [shapePath,filter,fade,clear]=defs.children,prefix=shapePath.getAttribute('id').replace(/-shape$/,'');
 assert.match(prefix,/^hx\d+$/);
 assert.equal(shapePath.getAttribute('d'),continentWithCuts.d);
 assert.deepEqual([filter,fade,clear].map(node=>node.getAttribute('id')),[`${prefix}-soft`,`${prefix}-fade`,`${prefix}-clear`]);
 // Regions: the viewBox grown by 30 % on each side, in user space.
 for(const node of [filter,fade,clear]){
  assert.deepEqual(['x','y','width','height'].map(name=>numberOf(node,name)),[-30,-24,160,128]);
  assert.equal(node.getAttribute(node===filter?'filterUnits':'maskUnits'),'userSpaceOnUse');
 }
 assert.equal(filter.getAttribute('color-interpolation-filters'),'sRGB');
 assert.deepEqual(filter.children.map(signature),['feGaussianBlur']);
 near(numberOf(filter.children[0],'stdDeviation'),5/k,1e-4,'σ = 5 px at the cursor scale');
 for(const [mask,width] of [[fade,20],[clear,36]]){
  assert.deepEqual(mask.children.map(signature),['rect','polyline','polyline'],'one polyline per run');
  assert.equal(mask.children[0].getAttribute('fill'),'#fff');
  assert.deepEqual(['x','y','width','height'].map(name=>numberOf(mask.children[0],name)),[-30,-24,160,128]);
  mask.children.slice(1).forEach((line,index)=>{
   assert.equal(line.getAttribute('points'),continentWithCuts.cuts[index].points.map(point=>point.join(',')).join(' '));
   for(const [name,value] of [['fill','none'],['stroke','#000'],['stroke-linecap','round'],['stroke-linejoin','round'],['filter',`url(#${prefix}-soft)`]])assert.equal(line.getAttribute(name),value,name);
   near(numberOf(line,'stroke-width'),width/k,1e-4,`${mask.getAttribute('id')} width`);
  });
 }
 assert.equal(body.getAttribute('mask'),`url(#${prefix}-fade)`,'body under fade');
 assert.deepEqual(body.children.map(signature),['use.hx-land','use.hx-sheen','g']);
 assert.equal(body.children[2].getAttribute('mask'),`url(#${prefix}-clear)`,'rim under clear');
 assert.deepEqual(body.children[2].children.map(signature),['path.hx-rim']);
 assert.equal(body.children[2].children[0].getAttribute('d'),continentWithCuts.d);
 assert.equal(outline.parentNode,svg);
 assertOutlineLast(svg,continentWithCuts.d,'cut continent');
 assertSelfContained(svg,'cut continent');
 // Without a scale the masks are sized for 1 px per unit.
 const unscaled=createSilhouette(fakeDocument(),{shape:continentWithCuts,kind:'continent'});
 assert.equal(numberOf(byTag(unscaled,'feGaussianBlur')[0],'stdDeviation'),5);
});

test('continent without cuts: no filter, no mask; land, sheen and rim as direct layers',()=>{
 const svg=createSilhouette(fakeDocument(),{shape:continentPlain,kind:'continent',scale:4});
 assert.deepEqual(svg.children.map(signature),['defs','g.hx-body','path.hx-outline']);
 assert.deepEqual(svg.children[0].children.map(signature),['path']);
 assert.equal(byTag(svg,'filter').length+byTag(svg,'mask').length+byTag(svg,'clipPath').length,0);
 assert.ok(all(svg).every(node=>node.getAttribute('mask')===null&&node.getAttribute('filter')===null));
 assertOutlineLast(svg,continentPlain.d,'plain continent');
 // Cuts on another kind are ignored (only continents are cut).
 assert.equal(byTag(createSilhouette(fakeDocument(),{shape:{...countryWithFlag,cuts:continentWithCuts.cuts},kind:'country',flagHref:'f.svg'}),'mask').length,0);
});

test('country item: land underlay, the 640×480 flag placed by flagMatrix, sheen over the viewBox, all clipped; then the flag rim and the outline',()=>{
 const svg=createSilhouette(fakeDocument(),{shape:countryWithFlag,kind:'country',flagHref:'assets/flags/fr.svg',scale:3});
 assert.equal(svg.getAttribute('data-kind'),'country');assert.equal(svg.getAttribute('data-variant'),'item');
 assert.deepEqual(svg.children.map(signature),['defs','g','path.hx-flag-rim','path.hx-outline']);
 const [defs,group,rim]=svg.children,prefix=defs.children[0].getAttribute('id').replace(/-shape$/,'');
 assert.deepEqual(defs.children.map(signature),['path','clipPath']);
 assert.equal(defs.children[1].getAttribute('id'),`${prefix}-clip`);
 assert.deepEqual(defs.children[1].children.map(node=>[signature(node),node.getAttribute('href')]),[['use',`#${prefix}-shape`]]);
 assert.equal(group.getAttribute('clip-path'),`url(#${prefix}-clip)`);
 assert.deepEqual(group.children.map(signature),['use.hx-land','image.hx-flag','rect.hx-sheen']);
 const image=group.children[1];
 for(const [name,value] of [['href','assets/flags/fr.svg'],['width','640'],['height','480'],['preserveAspectRatio','none'],['transform',flagMatrix(countryWithFlag.flag)]])assert.equal(image.getAttribute(name),value,name);
 assert.deepEqual(['x','y','width','height'].map(name=>numberOf(group.children[2],name)),[0,0,100,50],'sheen over the viewBox');
 assert.equal(rim.getAttribute('d'),countryWithFlag.d);
 assertOutlineLast(svg,countryWithFlag.d,'country');
 assertSelfContained(svg,'country');
 // Without a flag file the land underlay shows alone.
 const bare=createSilhouette(fakeDocument(),{shape:countryWithFlag,kind:'country',flagHref:null});
 assert.deepEqual(bare.children[1].children.map(signature),['use.hx-land','rect.hx-sheen']);
 assert.deepEqual(createSilhouette(fakeDocument(),{shape:countryWithFlag,kind:'country',flagHref:'  '}).children[1].children.map(signature),['use.hx-land','rect.hx-sheen']);
});

test('country locator: soft land, rim and outline, then the ring and the dot at the hot pin; no flag, no sheen, no clip',()=>{
 const shape={...countryWithFlag,viewBox:'0 0 90 100'},svg=createSilhouette(fakeDocument(),{shape,kind:'country',variant:'locator',hotPin:'x',flagHref:'assets/flags/fr.svg',scale:2});
 assert.equal(svg.getAttribute('data-variant'),'locator');
 assert.deepEqual(svg.children.map(signature),['defs','use.hx-land.hx-land-soft','path.hx-rim','path.hx-outline','circle.hx-locator-ring','circle.hx-locator-dot']);
 assert.deepEqual(svg.children[0].children.map(signature),['path'],'no clip, mask or filter');
 const [ring,dot]=svg.children.slice(-2),radius=100/300*6;
 for(const circle of [ring,dot]){assert.equal(numberOf(circle,'cx'),30);assert.equal(numberOf(circle,'cy'),25);assert.equal(circle.getAttribute('data-campus'),'x');}
 near(numberOf(dot,'r'),radius,1e-4,'dot radius max(vbW, vbH)/300 × 6');
 near(numberOf(ring,'r'),radius*1.6,1e-4,'ring radius 1.6 × the dot');
 assert.equal(byTag(svg,'image').length+byClass(svg,'hx-sheen').length+byClass(svg,'hx-flag-rim').length,0);
 assertOutlineLast(svg,shape.d,'locator',{after:['circle.hx-locator-ring','circle.hx-locator-dot']});
 assertSelfContained(svg,'locator');
 // An unknown or absent hot pin draws no dot; the locator variant is a country variant only.
 assert.deepEqual(createSilhouette(fakeDocument(),{shape,kind:'country',variant:'locator',hotPin:'nowhere'}).children.map(signature),['defs','use.hx-land.hx-land-soft','path.hx-rim','path.hx-outline']);
 assert.deepEqual(createSilhouette(fakeDocument(),{shape,kind:'country',variant:'locator'}).children.map(signature),['defs','use.hx-land.hx-land-soft','path.hx-rim','path.hx-outline']);
 const continent=createSilhouette(fakeDocument(),{shape:continentPlain,kind:'continent',variant:'locator',hotPin:'z'});
 assert.equal(continent.getAttribute('data-variant'),'item');assert.equal(byClass(continent,'hx-locator-dot').length,0);
});

test('every stroked layer is a direct path or circle (never a use clone); ids are unique across calls and resolve in their own SVG',()=>{
 const doc=fakeDocument(),svgs=[
  createSilhouette(doc,{shape:globe,kind:'world'}),createSilhouette(doc,{shape:continentWithCuts,kind:'world'}),
  createSilhouette(doc,{shape:continentWithCuts,kind:'continent',scale:2}),createSilhouette(doc,{shape:continentPlain,kind:'continent'}),
  createSilhouette(doc,{shape:countryWithFlag,kind:'country',flagHref:'f.svg'}),createSilhouette(doc,{shape:countryWithFlag,kind:'country',variant:'locator',hotPin:'y'}),
  createDots(doc,{shape:continentWithCuts,kind:'continent'}),createDots(doc,{shape:countryWithFlag,kind:'country'})];
 for(const svg of svgs){
  assert.ok(svg);
  for(const name of STROKED)for(const node of byClass(svg,name))assert.ok(['path','circle'].includes(node.localName),`${name} is a ${node.localName}`);
  for(const use of byTag(svg,'use'))assert.ok(!use.classes.some(name=>STROKED.includes(name)),'no stroked use');
  for(const node of byClass(svg,'hx-rim').concat(byClass(svg,'hx-flag-rim'),byClass(svg,'hx-outline')))if(node.localName==='path')assert.ok(node.getAttribute('d').length>0);
  assertSelfContained(svg,svg.getAttribute('class'));
  // Stroke widths and colours are the stylesheet's, never attributes of a drawn layer.
  for(const node of all(svg))if(node.classes.some(name=>STROKED.includes(name)))for(const name of ['stroke','stroke-width','fill','vector-effect'])assert.equal(node.getAttribute(name),null,`${signature(node)} ${name}`);
 }
 const ids=svgs.flatMap(svg=>idsAndReferences(svg).ids);
 assert.equal(new Set(ids).size,ids.length,'ids unique across calls');
 assert.ok(ids.every(id=>/^hx\d+-(?:shape|clip|soft|fade|clear)$/.test(id)),'ids hx{n}-shape|clip|soft|fade|clear');
});

test('pre-metadata entries ({viewBox,d}) are tolerated: no dots, no cuts, the flag as a centred 4:3 cover of the inner viewBox',()=>{
 const svg=createSilhouette(fakeDocument(),{shape:premetadata,kind:'country',flagHref:'assets/flags/it.svg',scale:3});
 const image=byTag(svg,'image')[0];
 // [2,2,98,48]: 96 × 46, so a 96 × 72 face centred at (50, 25).
 assert.equal(image.getAttribute('transform'),flagMatrix([2,-11,96,72]));
 assert.equal(createDots(fakeDocument(),{shape:premetadata,kind:'country'}).children.length,0);
 const continent=createSilhouette(fakeDocument(),{shape:premetadata,kind:'continent'});
 assert.equal(byTag(continent,'mask').length,0);
 // A box without a flag rectangle covers the box instead.
 const boxed=createSilhouette(fakeDocument(),{shape:{...premetadata,box:[10,10,50,40]},kind:'country',flagHref:'f.svg'});
 assert.equal(byTag(boxed,'image')[0].getAttribute('transform'),flagMatrix([10,10,40,30]));
 // Malformed metadata is ignored, never thrown on.
 const messy={...premetadata,pins:{a:['x',1],b:null,c:[5,6]},cuts:[{points:[[1,1]]},{points:'no'},null],flag:[1,2,'x',4]};
 assert.ok(createSilhouette(fakeDocument(),{shape:messy,kind:'continent'}));
 assert.equal(byTag(createSilhouette(fakeDocument(),{shape:messy,kind:'continent'}),'mask').length,0,'runs of fewer than two points are dropped');
 assert.deepEqual(createDots(fakeDocument(),{shape:messy,kind:'continent'}).children.map(node=>node.getAttribute('data-campus')),['c']);
});

test('unusable shapes give null',()=>{
 const doc=fakeDocument();
 for(const [shape,kind] of [[null,'country'],[undefined,'world'],[{viewBox:'0 0 100 50'},'country'],[{viewBox:'0 0 100 50',d:'  '},'country'],[{viewBox:'0 0 0 50',d:'M0 0Z'},'continent'],[{viewBox:'a b c d',d:'M0 0Z'},'continent'],[{d:'M0 0Z'},'country'],[premetadata,'campus'],[premetadata,undefined]])
  assert.equal(createSilhouette(doc,{shape,kind}),null,JSON.stringify([shape,kind]));
 assert.equal(createSilhouette(null,{shape:premetadata,kind:'country'}),null);
 assert.equal(createSilhouette(doc),null);
 assert.equal(createDots(doc,{shape:null,kind:'country'}),null);
 assert.equal(createDots(doc,{shape:{viewBox:'nope'},kind:'country'}),null);
 assert.equal(createDots(doc),null);
});

test('createDots: one circle per pin sorted by id, radius by kind, the silhouette\'s viewBox; empty without pins',()=>{
 const doc=fakeDocument(),dots=createDots(doc,{shape:continentWithCuts,kind:'continent'});
 for(const [name,value] of [['class','hx-dots'],['viewBox','0 0 100 80'],['data-kind','continent'],['aria-hidden','true'],['focusable','false'],['preserveAspectRatio','xMidYMid meet']])assert.equal(dots.getAttribute(name),value,name);
 assert.deepEqual(dots.children.map(node=>[signature(node),node.getAttribute('data-campus'),numberOf(node,'cx'),numberOf(node,'cy')]),[['circle.hx-dot','a',30,30],['circle.hx-dot','b',20,20],['circle.hx-dot','c',40,40]]);
 for(const circle of dots.children)near(numberOf(circle,'r'),100/300*3.4,1e-4,'continent radius');
 const country=createDots(doc,{shape:{...countryWithFlag,viewBox:'0 0 60 90'},kind:'country'});
 assert.deepEqual(country.children.map(node=>node.getAttribute('data-campus')),['x','y']);
 for(const circle of country.children)near(numberOf(circle,'r'),90/300*4.2,1e-4,'country radius');
 near(numberOf(createDots(doc,{shape:globe,kind:'world'}).children[0],'r'),100/300*3.4,1e-4,'world radius');
 assert.equal(createDots(doc,{shape:{...continentPlain,pins:{}},kind:'continent'}).children.length,0);
 assert.equal(createDots(doc,{shape:premetadata,kind:'continent'}).localName,'svg','an empty layer, not null');
 assert.deepEqual([...new Set(doc.calls)],['createElementNS']);
});

test('createPrintedLogo: a mask span in the theme ink or Codam\'s sticker image, sized and with an absolute URL; null when missing or unsafe',()=>{
 const doc=fakeDocument({baseURI:'https://horizon.test/site-b/index.html'});
 const mask=createPrintedLogo(doc,{print:{kind:'mask',src:'assets/campus-logos/print/paris.png',width:193,height:138,aspectRatio:1.3986},width:83.916,height:60});
 assert.equal(mask.localName,'span');assert.equal(mask.namespaceURI,HTML);
 for(const [name,value] of [['class','hx-logo'],['data-print','mask'],['aria-hidden','true']])assert.equal(mask.getAttribute(name),value,name);
 const url='https://horizon.test/site-b/assets/campus-logos/print/paris.png';
 assert.equal(mask.getAttribute('style'),`width:83.92px;height:60px;-webkit-mask-image:url("${url}");mask-image:url("${url}")`);
 assert.equal(mask.children.length,0);
 const sticker=createPrintedLogo(doc,{print:{kind:'sticker',src:'assets/campus-logos/codam.png',width:640,height:214,aspectRatio:2.9907},width:152.4,height:50.96});
 assert.equal(sticker.localName,'img');
 for(const [name,value] of [['class','hx-logo'],['data-print','sticker'],['alt',''],['decoding','async'],['src','https://horizon.test/site-b/assets/campus-logos/codam.png'],['width','152'],['height','51'],['style','width:152.4px;height:50.96px']])assert.equal(sticker.getAttribute(name),value,name);
 // SVG masks keep their original file; file: pages work; the default base when the document has none.
 assert.match(createPrintedLogo(fakeDocument({baseURI:'file:///srv/site-b/index.html'}),{print:{kind:'mask',src:'assets/campus-logos/wels.svg'},width:50,height:20}).getAttribute('style'),/url\("file:\/\/\/srv\/site-b\/assets\/campus-logos\/wels\.svg"\)/);
 assert.match(createPrintedLogo(fakeDocument(),{print:{kind:'mask',src:'a.png'},width:10,height:10}).getAttribute('style'),/url\("https:\/\/horizon\.invalid\/a\.png"\)/);
 assert.match(createPrintedLogo(doc,{print:{kind:'mask',src:'a.png'},width:10,height:10,baseURI:'http://127.0.0.1:8765/site-b/'}).getAttribute('style'),/url\("http:\/\/127\.0\.0\.1:8765\/site-b\/a\.png"\)/);
 // Quotes and backslashes cannot break out of the CSS string.
 assert.ok(!/url\("[^"]*"[^;]*"\)/.test(createPrintedLogo(doc,{print:{kind:'mask',src:'odd"name\\x.png'},width:10,height:10}).getAttribute('style')));
 // Missing sizes are left to the caller (style.width/height), never invented.
 assert.equal(createPrintedLogo(doc,{print:{kind:'mask',src:'a.png'}}).getAttribute('style'),'-webkit-mask-image:url("https://horizon.test/site-b/a.png");mask-image:url("https://horizon.test/site-b/a.png")');
 const unsized=createPrintedLogo(doc,{print:{kind:'sticker',src:'a.png'},width:-1,height:'x'});
 assert.equal(unsized.getAttribute('width'),null);assert.equal(unsized.getAttribute('style'),null);
 for(const print of [null,undefined,{},{kind:'mask'},{kind:'mask',src:''},{kind:'mask',src:'  '},{kind:'plate',src:'a.png'},{kind:'mask',src:42},
  {kind:'mask',src:'javascript:alert(1)'},{kind:'sticker',src:'data:image/png;base64,AAAA'},{kind:'mask',src:'blob:https://horizon.test/x'},{kind:'mask',src:'http://['}])
  assert.equal(createPrintedLogo(doc,{print,width:10,height:10}),null,JSON.stringify(print));
 assert.equal(createPrintedLogo(null,{print:{kind:'mask',src:'a.png'}}),null);
 assert.deepEqual([...new Set(doc.calls)],['createElement']);
});

test('fitLogo: width-limited, height-limited, the minimum height and an unknown aspect (pure)',()=>{
 // Halo's level box at 1440×900 (bh 200): .76·200 × .30·200.
 const paris=fitLogo({aspectRatio:1.3986},152,60);
 near(paris.height,60,1e-9,'Paris height-limited');near(paris.width,83.916,1e-6,'Paris width');
 const nice=fitLogo({aspectRatio:2.1375},152,60);
 near(nice.width*.58,74.4,.1,'Nice ±1 on screen');near(nice.height*.58,34.8,.1,'Nice ±1 height');
 const mulhouse=fitLogo({aspectRatio:2.339},152,60);
 near(mulhouse.height*.42,25.2,.1,'Mulhouse ±2 on screen');
 const kualaLumpur=fitLogo({aspectRatio:3.6711},152,60);
 near(kualaLumpur.width,152,1e-9,'Kuala Lumpur width-limited');near(kualaLumpur.height,152/3.6711,1e-9,'its height');
 near(28/(kualaLumpur.height*.58),1.167,.002,'the ±1 floor factor of §4.10');
 assert.deepEqual(fitLogo({aspectRatio:2},100,80,{minH:60}),{width:120,height:60},'minH wins over the width limit');
 assert.deepEqual(fitLogo({aspectRatio:2},100,80,{minH:10}),{width:100,height:50});
 for(const print of [null,undefined,{},{aspectRatio:0},{aspectRatio:-2},{aspectRatio:'x'},{aspectRatio:Infinity}])assert.deepEqual(fitLogo(print,90,60),{width:90,height:30},'unknown aspect: 3');
 assert.deepEqual(fitLogo({aspectRatio:'2.5'},100,100),{width:100,height:40},'a numeric string');
 assert.deepEqual(fitLogo({aspectRatio:2},NaN,undefined),{width:0,height:0});
 const print=Object.freeze({aspectRatio:2});fitLogo(print,10,10);
});

test('flagMatrix: the 640×480 face placed on [x,y,w,h]; identity for an invalid rectangle',()=>{
 assert.equal(flagMatrix([4.1,-8.6,91.8,68.9]),'matrix(0.143438 0 0 0.143542 4.1 -8.6)');
 assert.equal(flagMatrix([0,0,640,480]),'matrix(1 0 0 1 0 0)');
 assert.equal(flagMatrix([-32.5,1.4,167.5,125.6]),'matrix(0.261719 0 0 0.261667 -32.5 1.4)');
 assert.equal(flagMatrix(['1','2','64','48']),'matrix(0.1 0 0 0.1 1 2)');
 for(const rect of [null,undefined,[],[1,2,3],[1,2,0,4],[1,2,3,-4],[1,2,'x',4],'1 2 3 4',[1,2,3,4,5]])assert.equal(flagMatrix(rect),'matrix(1 0 0 1 0 0)',JSON.stringify(rect));
});

test('icon: the mock-up\'s ten symbols as inline 24×24 SVG; null for an unknown name',()=>{
 assert.deepEqual([...ICON_NAMES],['back','check','copy','enter','expand','external','next','prev','route','sparkle']);
 assert.ok(Object.isFrozen(ICON_NAMES));
 const expected={
  back:[['path',{d:'m10 6-6 6 6 6m-6-6h16'}]],
  check:[['path',{d:'m5 12 4 4 10-10'}]],
  copy:[['rect',{x:'8',y:'8',width:'12',height:'12',rx:'3'}],['path',{d:'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2'}]],
  enter:[['path',{d:'M19 5v6a3 3 0 0 1-3 3H6'}],['path',{d:'m10 10-4 4 4 4'}]],
  expand:[['path',{d:'M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7'}]],
  external:[['path',{d:'M14 4h6v6m0-6-9 9'}],['path',{d:'M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4'}]],
  next:[['path',{d:'m9.5 6 6 6-6 6'}]],
  prev:[['path',{d:'m14.5 6-6 6 6 6'}]],
  route:[['circle',{cx:'6',cy:'19',r:'2'}],['path',{d:'M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16'}],['path',{d:'M18 2.5c-1.7 0-3 1.3-3 3 0 2.2 3 5 3 5s3-2.8 3-5c0-1.7-1.3-3-3-3Z'}]],
  sparkle:[['path',{d:'M12 3.5c.6 4.2 2.3 6 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.5 5.9-2.3 6.5-6.5Z'}],['path',{d:'M18.5 15.5c.3 1.8 1 2.5 2.8 2.8-1.8.3-2.5 1-2.8 2.8-.3-1.8-1-2.5-2.8-2.8 1.8-.3 2.5-1 2.8-2.8Z'}]],
 };
 const doc=fakeDocument();
 for(const name of ICON_NAMES){
  const svg=icon(doc,name);
  assert.equal(svg.namespaceURI,SVG);assert.equal(svg.localName,'svg');
  for(const [attribute,value] of [['class','hx-icon'],['data-icon',name],['viewBox','0 0 24 24'],['width','24'],['height','24'],['aria-hidden','true'],['focusable','false']])assert.equal(svg.getAttribute(attribute),value,`${name} ${attribute}`);
  assert.deepEqual(svg.children.map(node=>[node.localName,Object.fromEntries(node.attrs)]),expected[name],name);
  assert.ok(all(svg).every(node=>node.getAttribute('fill')===null&&node.getAttribute('stroke')===null),'drawn with the site\'s stroke rule');
 }
 assert.notEqual(icon(doc,'back'),icon(doc,'back'),'a new node per call');
 for(const name of ['','nope','Back','toString','__proto__','constructor',null,undefined,3])assert.equal(icon(doc,name),null,String(name));
 assert.equal(icon(null,'back'),null);
});

test('the module works with the other builders\' strict fakes (factories, setAttribute, append of elements)',()=>{
 const doc=strictDocument();
 assert.ok(createSilhouette(doc,{shape:continentWithCuts,kind:'continent',scale:2}));
 assert.ok(createSilhouette(doc,{shape:countryWithFlag,kind:'country',flagHref:'f.svg'}));
 assert.ok(createSilhouette(doc,{shape:countryWithFlag,kind:'country',variant:'locator',hotPin:'x'}));
 assert.ok(createSilhouette(doc,{shape:globe,kind:'world'}));
 assert.ok(createDots(doc,{shape:countryWithFlag,kind:'country'}));
 assert.ok(createPrintedLogo(doc,{print:{kind:'mask',src:'a.png'},width:10,height:10}));
 assert.ok(createPrintedLogo(doc,{print:{kind:'sticker',src:'a.png'},width:10,height:10}));
 for(const name of ICON_NAMES)assert.ok(icon(doc,name));
});

test('real shapes: every entry of explorer-shapes.mjs draws, with the Urals cut on Europe and Asia only and each flag on its rectangle',()=>{
 const doc=fakeDocument();
 for(const [group,entries] of Object.entries({world:{world:SHAPES.world},continents:SHAPES.continents,countries:SHAPES.countries}))
  for(const [id,shape] of Object.entries(entries)){
   const kind=KIND_OF[group],svg=createSilhouette(doc,{shape,kind,flagHref:kind==='country'?'assets/flags/x.svg':null,scale:2.5});
   assert.ok(svg,`${id} draws`);
   assertSelfContained(svg,id);
   assert.ok(byTag(svg,'filter').every(filter=>filter.children.every(node=>node.localName==='feGaussianBlur')),'feGaussianBlur only');
   const runs=kind==='continent'&&Array.isArray(shape.cuts)?shape.cuts.length:0;
   assert.equal(byTag(svg,'filter').length,runs?1:0,`${id}: one blur filter only on a cut shape`);
   assert.equal(byTag(svg,'polyline').length,2*runs,`${id}: a fade and a clear line per run`);
   if(kind==='country'){
    assert.equal(byTag(svg,'image')[0].getAttribute('transform'),flagMatrix(shape.flag),`${id} flag`);
    assertOutlineLast(svg,shape.d,id);
   }
   const dots=createDots(doc,{shape,kind});
   assert.deepEqual(dots.children.map(node=>node.getAttribute('data-campus')),Object.keys(shape.pins||{}).sort(),`${id} dots`);
  }
 assert.ok(SHAPES.continents.europe.cuts?.length>=1&&SHAPES.continents.asia.cuts?.length>=1,'the module carries the Urals runs');
 for(const id of ['africa','americas'])assert.equal(byTag(createSilhouette(doc,{shape:SHAPES.continents[id],kind:'continent'}),'mask').length,0,id);
 const europe=createSilhouette(doc,{shape:SHAPES.continents.europe,kind:'continent',scale:3});
 assert.equal(byTag(europe,'polyline')[0].getAttribute('points'),SHAPES.continents.europe.cuts[0].points.map(point=>point.join(',')).join(' '));
});

test('the Monde globe of A1: sphere, outlines of land and sphere, 51 dots; the 7 far-side campuses have none',{skip:SHAPES.world?.sphere?false:'SHAPES.world.sphere is not generated yet (A1)'},()=>{
 const doc=fakeDocument(),svg=createSilhouette(doc,{shape:SHAPES.world,kind:'world',scale:2.5});
 assert.deepEqual(svg.children.map(signature),['defs','circle.hx-sea','use.hx-land','circle.hx-sea-rim','circle.hx-sphere-sheen','path.hx-outline','circle.hx-outline']);
 assert.deepEqual(['cx','cy','r'].map(name=>numberOf(byClass(svg,'hx-sea')[0],name)),SHAPES.world.sphere.map(Number));
 const dots=createDots(doc,{shape:SHAPES.world,kind:'world'}).children.map(node=>node.getAttribute('data-campus'));
 assert.equal(dots.length,51);
 for(const hidden of ['gyeongsan','iskandar-puteri','kuala-lumpur','penang','seoul','singapore','tokyo'])assert.ok(!dots.includes(hidden),hidden);
});

// ----- Stylesheet (parsed text of explorer-art.css) -------------------------------------------------------------------
const css=readFileSync(new URL('./explorer-art.css',import.meta.url),'utf8');
const source=readFileSync(new URL('./explorer-art.mjs',import.meta.url),'utf8');
const bare=css.replace(/\/\*[\s\S]*?\*\//g,'');
const squash=value=>value.replace(/\s+/g,' ').replace(/\s*([(),/])\s*/g,'$1').trim();
// Flat list of {media, selector, declarations}, at-rules nested one level (enough for this file).
function rulesOf(text){
 const rules=[];
 const walk=(chunk,media)=>{
  let index=0;
  while(index<chunk.length){
   const open=chunk.indexOf('{',index);
   if(open<0)break;
   const prelude=chunk.slice(index,open).trim();
   let depth=1,cursor=open+1;
   while(depth&&cursor<chunk.length){if(chunk[cursor]==='{')depth++;else if(chunk[cursor]==='}')depth--;cursor++;}
   const body=chunk.slice(open+1,cursor-1);
   if(prelude.startsWith('@media'))walk(body,squash(prelude));
   else if(prelude.startsWith('@keyframes'))rules.push({media,selector:squash(prelude),declarations:new Map(),text:squash(body)});
   else rules.push({media,selector:squash(prelude),declarations:new Map(body.split(';').map(part=>part.trim()).filter(Boolean).map(part=>{const colon=part.indexOf(':');return [part.slice(0,colon).trim(),squash(part.slice(colon+1))];}))});
   index=cursor;
  }
 };
 walk(text,null);
 return rules;
}
const RULES=rulesOf(bare);
const rule=(selector,media=null)=>{const found=RULES.filter(entry=>entry.selector===selector&&entry.media===media);assert.equal(found.length,1,`one rule ${selector} ${media||''}`);return found[0].declarations;};

const LIGHT={
 '--hx-ink':'var(--h42-ink)','--hx-muted':'#536163','--hx-accent':'var(--readable-glass-accent)','--hx-pink':'var(--h42-pink)',
 '--hx-pink-text':'#C92177','--hx-chip-text':'#A3155F','--hx-teal':'var(--h42-teal)','--hx-focus':'var(--h42-color-focus)',
 '--hx-land-a':'#3FC2BE','--hx-land-b':'#A9E2DB','--hx-land-c':'#F4D3E3','--hx-sea-a':'#FFFFFF','--hx-sea-b':'#DCF0EF',
 '--hx-rim':'rgb(255 255 255/.9)','--hx-flag-rim':'rgb(24 61 60/.3)','--hx-flag-rim-width':'1.2px',
 '--hx-sheen-hi':'rgb(255 255 255/.55)','--hx-sheen-lo':'rgb(0 0 0/.18)','--hx-text-halo':'#FFFFFF','--hx-text-glow':'rgb(255 255 255/.85)',
 '--hx-pool':'radial-gradient(closest-side,rgb(255 255 255/.95),color-mix(in srgb,var(--hx-teal)28%,transparent)46%,color-mix(in srgb,var(--hx-teal)8%,transparent)78%,transparent 100%)',
 '--hx-logo-ink':'#1B1B1B','--hx-dot':'#ED3491','--hx-dot-ring':'#FFFFFF','--hx-go-bg':'var(--h42-teal)','--hx-go-ink':'#1B1B1B',
 '--hx-go-shadow':'0 8px 20px color-mix(in srgb,var(--hx-go-bg)30%,transparent)','--hx-hair':'rgb(24 61 60/.12)','--hx-hair-strong':'rgb(24 61 60/.22)',
 '--hx-frame':'#FFFFFF','--hx-photo-shadow':'0 22px 44px rgb(24 61 60/.16),0 3px 10px rgb(24 61 60/.08)',
 '--hx-pill-surface':'rgb(255 255 255/.78)','--hx-pill-solid':'#FFFFFF','--hx-pill-edge':'rgb(24 61 60/.12)',
 '--hx-shape-shadow':'drop-shadow(0 10px 18px rgb(24 61 60/.14))',
 '--hx-sib-current':'radial-gradient(closest-side,color-mix(in srgb,var(--hx-teal)16%,transparent),transparent)',
 '--hx-sticker-bg':'#FFFFFF','--hx-sticker-shadow':'0 6px 18px rgb(0 0 0/.12)','--hx-expand-bg':'rgb(255 255 255/.82)','--hx-expand-ink':'#1B1B1B',
 '--hx-rim-width':'1.2px','--hx-sea-rim-width':'1.2px','--hx-dot-ring-width':'1.3px','--hx-outline-width':'1.5px',
 '--hx-name-stroke':'4px','--hx-name-core':'2px','--hx-focus-ring-width':'2px','--hx-focus-ring-offset':'3px',
};
const DARK={
 '--hx-ink':'var(--h42-white)','--hx-muted':'#A9C0C0','--hx-accent':'var(--readable-glass-accent)','--hx-pink-text':'#F485BD','--hx-chip-text':'#F7A3CC',
 '--hx-focus':'var(--h42-color-focus)','--hx-land-a':'#2C8C88','--hx-land-b':'#255F5E','--hx-land-c':'#6A2C51','--hx-sea-a':'#34333B','--hx-sea-b':'#222127',
 '--hx-rim':'rgb(255 255 255/.28)','--hx-flag-rim':'rgb(255 255 255/.35)','--hx-flag-rim-width':'1.4px','--hx-text-halo':'#1B1B1B','--hx-text-glow':'rgb(27 27 27/.8)',
 '--hx-pool':'radial-gradient(closest-side,color-mix(in srgb,var(--hx-pink)34%,transparent),color-mix(in srgb,var(--hx-teal)14%,transparent)62%,transparent 100%)',
 '--hx-logo-ink':'#F4F7F7','--hx-dot':'#F485BD','--hx-dot-ring':'#1B1B1B','--hx-go-bg':'color-mix(in srgb,var(--h42-pink)75%,var(--h42-white))',
 '--hx-hair':'rgb(255 255 255/.12)','--hx-hair-strong':'rgb(255 255 255/.24)','--hx-frame':'#2E2E34',
 '--hx-photo-shadow':'0 22px 48px rgb(0 0 0/.45),0 3px 10px rgb(0 0 0/.3)','--hx-pill-surface':'rgb(41 41 46/.78)','--hx-pill-solid':'#29292E',
 '--hx-pill-edge':'rgb(255 255 255/.16)','--hx-shape-shadow':'drop-shadow(0 10px 22px rgb(0 0 0/.45))',
 '--hx-sib-current':'radial-gradient(closest-side,color-mix(in srgb,var(--hx-pink)22%,transparent),transparent)',
};

test('CSS tokens: every token of §2.1 in both themes, the width tokens included, with the spec\'s values',()=>{
 assert.deepEqual(Object.fromEntries(rule(':root')),LIGHT);
 assert.deepEqual(Object.fromEntries(rule(':root[data-theme=dark]')),DARK);
 const tokenRules=RULES.filter(entry=>[...entry.declarations.keys()].some(name=>name.startsWith('--')));
 assert.deepEqual(tokenRules.map(entry=>entry.selector),[':root',':root[data-theme=dark]'],'tokens are defined in these two blocks only');
});

test('CSS strokes: on-screen widths divided by the item scale, non-scaling; the locator\'s fixed strokes; the art reset',()=>{
 for(const [selector,token,media] of [['.hx-rim','--hx-rim-width'],['.hx-flag-rim','--hx-flag-rim-width'],['.hx-sea-rim','--hx-sea-rim-width'],['.hx-dot','--hx-dot-ring-width'],['svg.hx-art .hx-outline','--hx-outline-width','@media(forced-colors:active)']]){
  const declarations=rule(selector,media??null);
  assert.equal(declarations.get('stroke-width'),`calc(var(${token})/var(--s,1))`,selector);
  assert.equal(declarations.get('vector-effect'),'non-scaling-stroke',selector);
 }
 assert.equal(rule('.hx-rim').get('stroke'),'var(--hx-rim)');
 assert.equal(rule('.hx-flag-rim').get('stroke'),'var(--hx-flag-rim)');
 assert.equal(rule('.hx-sea-rim').get('stroke'),'color-mix(in srgb,var(--hx-pink)22%,transparent)');
 assert.deepEqual(Object.fromEntries(rule('.hx-dot')),{fill:'var(--hx-dot)',stroke:'var(--hx-dot-ring)','stroke-width':'calc(var(--hx-dot-ring-width)/var(--s,1))','vector-effect':'non-scaling-stroke'});
 assert.deepEqual(Object.fromEntries(rule('.hx-locator-dot')),{fill:'var(--hx-pink)',stroke:'var(--hx-dot-ring)','stroke-width':'2px','vector-effect':'non-scaling-stroke'});
 assert.deepEqual(Object.fromEntries(rule('.hx-locator-ring')),{fill:'none',stroke:'var(--hx-pink)','stroke-width':'1.4px','vector-effect':'non-scaling-stroke',opacity:'.5'});
 assert.deepEqual(Object.fromEntries(rule('svg.hx-art,svg.hx-dots')),{display:'block',width:'100%',height:'100%',fill:'initial',stroke:'none','stroke-width':'0',overflow:'visible','pointer-events':'none'});
 for(const [selector,fill] of [['.hx-land','url(#hx-land-grad)'],['.hx-land-soft','url(#hx-land-soft-grad)'],['.hx-sheen','url(#hx-sheen-grad)'],['.hx-sea','url(#hx-sea-grad)'],['.hx-sphere-sheen','url(#hx-sheen-grad)']])assert.equal(rule(selector).get('fill'),fill,selector);
 assert.equal(rule('.hx-sheen').get('mix-blend-mode'),'soft-light');
 assert.deepEqual(Object.fromEntries(rule('.hx-sphere-sheen')),{fill:'url(#hx-sheen-grad)',opacity:'.5','mix-blend-mode':'soft-light'});
 assert.equal(rule('.hx-outline').get('display'),'none');
 // The ping, never under reduced motion.
 assert.equal(rule('.hx-locator-ring','@media(prefers-reduced-motion:no-preference)').get('animation'),'hx-ping 2.4s var(--ease)infinite');
 assert.equal(RULES.find(entry=>entry.selector==='@keyframes hx-ping').text,'from{transform:scale(.6);opacity:.7}to{transform:scale(2.2);opacity:0}');
 assert.ok(RULES.filter(entry=>entry.declarations.has('animation')).every(entry=>entry.media==='@media(prefers-reduced-motion:no-preference)'));
});

// No halo (25 Oct 2026): the glow tokens of the items and of the sheet's heart logo are gone from every block, light,
// dark and forced; the lights that stay are the pool and the names' halo and glow over the shapes.
test('CSS tokens: no glow token for the items or the heart logo, in any theme; the pool and the names\' glow stay',()=>{
 const glows=['--hx-glow-quiet','--hx-glow-hover','--hx-cursor-glow','--hx-logo-glow','--hx-logo-glow-quiet'];
 for(const entry of RULES)for(const name of entry.declarations.keys())assert.ok(!glows.includes(name),`${entry.selector} ${entry.media||''} ${name}`);
 assert.doesNotMatch(bare,/--hx-(?:glow|cursor-glow|logo-glow)\b/,'no glow token is defined or read');
 for(const selector of [':root',':root[data-theme=dark]'])for(const name of ['--hx-pool','--hx-text-halo','--hx-text-glow'])assert.ok(rule(selector).has(name),`${selector} ${name}`);
});

test('CSS logos and forced colours (§2.7, §4.10); no .explorer- selector; colour literals only in the token blocks',()=>{
 assert.deepEqual(Object.fromEntries(rule('.hx-logo[data-print=mask]')),{'background-color':'var(--hx-logo-ink)','-webkit-mask-size':'contain','mask-size':'contain','-webkit-mask-position':'center','mask-position':'center','-webkit-mask-repeat':'no-repeat','mask-repeat':'no-repeat'});
 assert.ok(RULES.every(entry=>![...entry.declarations.keys()].some(name=>/^(?:-webkit-)?mask$/.test(name))),'mask longhands only');
 const sticker=rule('.hx-logo[data-print=sticker]');
 for(const [name,value] of [['padding','6px 10px'],['border-radius','10px'],['background','var(--hx-sticker-bg)'],['box-shadow','var(--hx-sticker-shadow)']])assert.equal(sticker.get(name),value,name);
 const forced='@media(forced-colors:active)';
 assert.equal(rule('svg.hx-art',forced).get('forced-color-adjust'),'none');
 assert.equal(rule('svg.hx-art :is(.hx-sheen,.hx-rim,.hx-flag-rim,.hx-sea-rim,.hx-sphere-sheen,.hx-flag)',forced).get('display'),'none');
 assert.equal(rule('svg.hx-art :is(.hx-land,.hx-sea)',forced).get('fill'),'Canvas');
 assert.deepEqual(Object.fromEntries(rule('svg.hx-art .hx-outline',forced)),{display:'inline',fill:'none',stroke:'CanvasText','stroke-width':'calc(var(--hx-outline-width)/var(--s,1))','stroke-linejoin':'round','vector-effect':'non-scaling-stroke'});
 assert.equal(rule('svg.hx-dots',forced).get('forced-color-adjust'),'none');
 assert.deepEqual(Object.fromEntries(rule('svg.hx-dots .hx-dot',forced)),{fill:'CanvasText',stroke:'Canvas'});
 assert.equal(rule('svg.hx-art .hx-locator-dot',forced).get('fill'),'Highlight');
 assert.equal(rule('svg.hx-art .hx-locator-ring',forced).get('stroke'),'Highlight');
 assert.deepEqual(Object.fromEntries(rule('.hx-logo[data-print=mask]',forced)),{'forced-color-adjust':'none','background-color':'CanvasText'});
 assert.equal(rule('.hx-logo[data-print=sticker]',forced).get('border'),'1px solid CanvasText');
 assert.ok(!/\.explorer-/.test(bare),'no .explorer- selector');
 // Literal colours: only in the two token blocks (system colours only in forced-colours rules).
 const literal=/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i,system=/\b(?:Canvas|CanvasText|Highlight|HighlightText|ButtonText|ButtonFace|GrayText|LinkText)\b/;
 for(const entry of RULES.filter(entry=>!entry.selector.startsWith(':root')&&!entry.selector.startsWith('@keyframes')))for(const [name,value] of entry.declarations){
  assert.ok(!literal.test(value),`${entry.selector} ${name}: ${value}`);
  if(system.test(value))assert.equal(entry.media,forced,`${entry.selector} ${name}: system colours only when forced`);
 }
});

test('the module: no colour literal but the black and white of the masks, no markup parsing, no global, no stroked use',()=>{
 const code=source.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'');
 const hexes=[...code.matchAll(/#[0-9a-f]{3,8}\b/gi)].map(match=>match[0].toLowerCase());
 assert.deepEqual([...new Set(hexes)].sort(),['#000','#fff']);
 assert.ok(!/\b(?:rgba?|hsla?)\(/.test(code));
 assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|DOMParser|\bdocument\.|\bwindow\b|getContext|feTurbulence|studies\//.test(code));
 assert.ok(!/'use',\{class:'hx-(?:rim|flag-rim|sea-rim|outline)/.test(code),'no stroked class on a use');
 assert.equal([...code.matchAll(/'feGaussianBlur'/g)].length,1,'one filter primitive');
});
