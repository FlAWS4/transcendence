// Rendering primitives of the version B Explorer « Halo » (SPEC-B-HALO §4.1, §4.3–4.7, §4.10, §7.1): the shared gradients,
// the silhouettes of the Monde globe, the continents and the countries (land or clipped flag, sheen, rim, the Urals cut of
// Europe and Asia, the forced-colours outline; the sheet's locator), the campus dots, the printed campus logos and the
// small inline icons of the selector and the sheet. DOM only through `doc` (createElementNS, createElement, setAttribute,
// append; no markup parsing, no document or window global); every colour comes from explorer-art.css, so a theme switch
// never re-renders; the only SVG filter primitive is the feGaussianBlur of the cut masks of Europe and Asia.
// Every stroked layer (rims, flag rim, sea rim, outlines, dot rings, locator) is a direct <path d> or <circle>, never a
// <use> clone, whose vector-effect Chrome ignores (D2); its width is set in CSS (on-screen token / the item's scale --s).
// The Monde globe is SHAPES.world when it carries `sphere` (A1: orthographic, centred on 12°E 24°N): 51 campuses lie on
// its visible face and get a dot; the 7 on the far side get none (Gyeongsan, Iskandar Puteri, Kuala Lumpur, Penang,
// Seoul, Singapore, Tokyo). A shape without metadata ({viewBox,d}) is drawn without dots or cuts, its flag as a centred
// 4:3 cover, and a world without `sphere` (the former flat map) as a continent without cuts (§4.3, tolerance).
const SVG='http://www.w3.org/2000/svg';
const KINDS=new Set(['world','continent','country']);
const FLAG_FACE=[640,480];               // the 4:3 viewBox of assets/flags/*.svg
const REGION=.3;                         // mask and filter regions: the viewBox grown by 30 % on each side (§4.3)
const CUT_BLUR=5,CUT_FADE=10,CUT_CLEAR=18; // px at the cursor scale k (§4.5): σ, fade half-width, rim clearing half-width
const DOT_RADIUS={country:4.2,other:3.4};  // × max(vbW, vbH)/300 units (§4.7)
const LOCATOR_DOT=6,LOCATOR_RING=1.6;    // locator dot: × max(vbW, vbH)/300 units; its ring: × the dot's radius (§5.2)
const FALLBACK_ASPECT=3;                 // fitLogo without a known aspect ratio (§7.1)
let counter=0;                           // ids hx{n}-…, unique in the page

const finite=(...values)=>values.every(Number.isFinite);
const num=(value,digits=4)=>{const factor=10**digits,rounded=Math.round(value*factor)/factor;return Object.is(rounded,-0)?'0':String(rounded);};
const byId=([a],[b])=>a<b?-1:a>b?1:0;

// An SVG element factory on `doc`: attributes through setAttribute (null and undefined skipped), children appended.
function factory(doc){
 return (tag,attributes,...children)=>{
  const element=doc.createElementNS(SVG,tag);
  for(const [name,value] of Object.entries(attributes||{}))if(value!==null&&value!==undefined)element.setAttribute(name,String(value));
  if(children.length)element.append(...children);
  return element;
 };
}
function viewBoxOf(viewBox){
 const values=String(viewBox??'').trim().split(/[\s,]+/).map(Number);
 return values.length===4&&finite(...values)&&values[2]>0&&values[3]>0?values:null;
}
const viewBoxText=([x,y,width,height])=>`${num(x)} ${num(y)} ${num(width)} ${num(height)}`;
function sphereOf(sphere){
 const values=Array.isArray(sphere)&&sphere.length===3?sphere.map(Number):[];
 return values.length===3&&finite(...values)&&values[2]>0?values:null;
}
// The runs of a continent's artificial edge (§4.5), as lists of finite points, at least two each.
const cutsOf=cuts=>(Array.isArray(cuts)?cuts:[])
 .map(cut=>(Array.isArray(cut?.points)?cut.points:[]).filter(point=>Array.isArray(point)&&finite(Number(point[0]),Number(point[1]))).map(([x,y])=>[Number(x),Number(y)]))
 .filter(points=>points.length>=2);
// The campus positions {id:[x,y]} with finite coordinates, sorted by id.
const pinsOf=pins=>pins&&typeof pins==='object'
 ?Object.entries(pins).filter(([,point])=>Array.isArray(point)&&finite(Number(point[0]),Number(point[1]))).map(([id,[x,y]])=>[id,[Number(x),Number(y)]]).sort(byId)
 :[];
const validRect=rect=>Array.isArray(rect)&&rect.length===4&&finite(...rect.map(Number))&&Number(rect[2])>0&&Number(rect[3])>0;
// Pre-metadata entries have no flag rectangle: a centred 4:3 cover of [x0, y0, x1, y1].
function coverRect([x0,y0,x1,y1]){
 const width=Math.max(x1-x0,(y1-y0)*FLAG_FACE[0]/FLAG_FACE[1]),height=width*FLAG_FACE[1]/FLAG_FACE[0];
 return [(x0+x1-width)/2,(y0+y1-height)/2,width,height];
}

const defsByDocument=new WeakMap();
/** The hidden SVG of the shared gradients (§4.1), inserted once as the first child of doc.body and returned on every
 * call. Never display:none (Chrome does not paint gradients defined in an undisplayed SVG); every stop colour reads a
 * --hx- token, so a theme switch never re-renders. */
export function ensureArtDefs(doc){
 if(!doc||typeof doc!=='object')return null;
 const known=defsByDocument.get(doc);
 if(known&&known.isConnected!==false)return known;
 const existing=typeof doc.getElementById==='function'?doc.getElementById('hx-defs'):null;
 if(existing){defsByDocument.set(doc,existing);return existing;}
 const node=factory(doc);
 const stop=([offset,token,opacity=null])=>node('stop',{offset,style:`stop-color:var(${token})`+(opacity===null?'':`;stop-opacity:${opacity}`)});
 const linear=(id,[x1,y1,x2,y2],stops)=>node('linearGradient',{id,x1,y1,x2,y2},...stops.map(stop));
 const svg=node('svg',{id:'hx-defs','aria-hidden':'true',width:0,height:0,style:'position:absolute;width:0;height:0;overflow:hidden'},node('defs',null,
  linear('hx-land-grad',[0,0,1,1],[[0,'--hx-land-a'],[.55,'--hx-land-b'],[1,'--hx-land-c']]),
  linear('hx-land-soft-grad',[0,0,1,1],[[0,'--hx-land-b'],[1,'--hx-land-c']]),
  linear('hx-sheen-grad',[0,0,.6,1],[[0,'--hx-sheen-hi'],[.45,'--hx-sheen-hi',0],[1,'--hx-sheen-lo']]),
  node('radialGradient',{id:'hx-sea-grad',cx:.38,cy:.32,r:.75},stop([0,'--hx-sea-a']),stop([1,'--hx-sea-b'])),
  linear('hx-horizon-line-grad',[0,0,1,0],[[0,'--hx-teal',0],[.3,'--hx-teal',.55],[.5,'--hx-pink',.5],[.7,'--hx-teal',.55],[1,'--hx-teal',0]]),
  linear('hx-horizon-glow-grad',[0,0,1,0],[[0,'--hx-teal',0],[.35,'--hx-teal',.5],[.5,'--hx-pink',.45],[.65,'--hx-teal',.5],[1,'--hx-teal',0]])));
 const body=doc.body;
 if(body&&typeof body.prepend==='function')body.prepend(svg);
 else if(body&&typeof body.insertBefore==='function')body.insertBefore(svg,body.firstChild??null);
 else if(body&&typeof body.append==='function')body.append(svg);
 defsByDocument.set(doc,svg);
 return svg;
}

/** The transform that places the 640×480 face of a flag on the rectangle [x,y,w,h] (units): 'matrix(w/640 0 0 h/480 x y)'.
 * Pure; an invalid rectangle gives the identity. */
export function flagMatrix(rect){
 if(!validRect(rect))return 'matrix(1 0 0 1 0 0)';
 const [x,y,width,height]=rect.map(Number);
 return `matrix(${num(width/FLAG_FACE[0],6)} 0 0 ${num(height/FLAG_FACE[1],6)} ${num(x)} ${num(y)})`;
}

/** One silhouette (§4.3), built once per item at its cursor scale `scale` (px per unit; it sizes the cut masks only).
 * Layers, bottom to top: the globe (sea, land, sea rim, sheen), a continent's body (land, sheen, rim; faded and its rim
 * cleared along the Urals cut), a country's clipped flag on its land underlay with its sheen and flag rim, or the sheet's
 * locator (soft land, rim); then the forced-colours outline, unmasked and unclipped (and the globe's sphere outline); the
 * locator's ring and dot come last. Returns null for an unusable shape. */
export function createSilhouette(doc,{shape,kind,flagHref=null,scale=1,variant='item',hotPin=null}={}){
 if(!doc||!shape||typeof shape!=='object'||!KINDS.has(kind))return null;
 const box=viewBoxOf(shape.viewBox),d=typeof shape.d==='string'?shape.d.trim():'';
 if(!box||!d)return null;
 const [vx,vy,vw,vh]=box,n=++counter,node=factory(doc);
 const id=name=>`hx${n}-${name}`,ref=name=>`url(#${id(name)})`,link=name=>`#${id(name)}`;
 const k=Number(scale)>0&&Number.isFinite(Number(scale))?Number(scale):1,unit=px=>num(px/k);
 const region={x:num(vx-REGION*vw),y:num(vy-REGION*vh),width:num(vw*(1+2*REGION)),height:num(vh*(1+2*REGION))};
 const locator=kind==='country'&&variant==='locator';
 const sphere=kind==='world'?sphereOf(shape.sphere):null;
 const cuts=kind==='continent'?cutsOf(shape.cuts):[];
 const defs=node('defs',null,node('path',{id:id('shape'),d}));
 const outline=()=>node('path',{class:'hx-outline',d});
 let layers;
 if(sphere){
  const [cx,cy,r]=sphere.map(value=>num(value)),disc=className=>node('circle',{class:className,cx,cy,r});
  layers=[disc('hx-sea'),node('use',{class:'hx-land',href:link('shape')}),disc('hx-sea-rim'),disc('hx-sphere-sheen'),outline(),disc('hx-outline')];
 }else if(kind==='country'&&!locator){
  defs.append(node('clipPath',{id:id('clip')},node('use',{href:link('shape')})));
  const href=typeof flagHref==='string'&&flagHref.trim()?flagHref.trim():null;
  const fallback=validRect(shape.box)?shape.box.map(Number):[vx+2,vy+2,vx+vw-2,vy+vh-2];
  const rect=validRect(shape.flag)?shape.flag.map(Number):coverRect(fallback);
  layers=[
   node('g',{'clip-path':ref('clip')},
    node('use',{class:'hx-land',href:link('shape')}),
    ...(href?[node('image',{class:'hx-flag',href,width:FLAG_FACE[0],height:FLAG_FACE[1],preserveAspectRatio:'none',transform:flagMatrix(rect)})]:[]),
    node('rect',{class:'hx-sheen',x:num(vx),y:num(vy),width:num(vw),height:num(vh)})),
   node('path',{class:'hx-flag-rim',d}),
   outline()];
 }else if(locator){
  layers=[node('use',{class:'hx-land hx-land-soft',href:link('shape')}),node('path',{class:'hx-rim',d}),outline()];
  const hot=hotPin==null?null:pinsOf(shape.pins).find(([campus])=>campus===String(hotPin));
  if(hot){
   const radius=Math.max(vw,vh)/300*LOCATOR_DOT,[x,y]=hot[1];
   layers.push(node('circle',{class:'hx-locator-ring','data-campus':hot[0],cx:num(x),cy:num(y),r:num(radius*LOCATOR_RING)}),
    node('circle',{class:'hx-locator-dot','data-campus':hot[0],cx:num(x),cy:num(y),r:num(radius)}));
  }
 }else{
  // A continent, or a world without sphere: the body fades along each cut run (a blurred black core of half-width
  // 10 px) and its rim is cleared within 18 px of it; the outline stays outside both masks.
  if(cuts.length){
   const points=run=>run.map(([x,y])=>`${num(x)},${num(y)}`).join(' ');
   const line=(run,halfWidth)=>node('polyline',{points:points(run),fill:'none',stroke:'#000','stroke-width':unit(2*halfWidth),'stroke-linecap':'round','stroke-linejoin':'round',filter:ref('soft')});
   defs.append(
    node('filter',{id:id('soft'),filterUnits:'userSpaceOnUse',...region,'color-interpolation-filters':'sRGB'},node('feGaussianBlur',{stdDeviation:unit(CUT_BLUR)})),
    node('mask',{id:id('fade'),maskUnits:'userSpaceOnUse',...region},node('rect',{fill:'#fff',...region}),...cuts.map(run=>line(run,CUT_FADE))),
    node('mask',{id:id('clear'),maskUnits:'userSpaceOnUse',...region},node('rect',{fill:'#fff',...region}),...cuts.map(run=>line(run,CUT_CLEAR))));
  }
  layers=[
   node('g',{class:'hx-body',mask:cuts.length?ref('fade'):null},
    node('use',{class:'hx-land',href:link('shape')}),
    node('use',{class:'hx-sheen',href:link('shape')}),
    node('g',{mask:cuts.length?ref('clear'):null},node('path',{class:'hx-rim',d}))),
   outline()];
 }
 return node('svg',{class:'hx-art',viewBox:viewBoxText(box),'data-kind':kind,'data-variant':locator?'locator':'item','aria-hidden':'true',focusable:'false',preserveAspectRatio:'xMidYMid meet'},defs,...layers);
}

/** The campus dots of a shape (§4.7): an SVG with the silhouette's viewBox, one circle.hx-dot[data-campus] per pin,
 * sorted by id, of radius max(vbW, vbH)/300 × (country 4.2, otherwise 3.4) units; no circle without pins. The caller
 * places it over the figure, above the name. Null for an unusable shape. */
export function createDots(doc,{shape,kind}={}){
 if(!doc||!shape||typeof shape!=='object')return null;
 const box=viewBoxOf(shape.viewBox);
 if(!box)return null;
 const node=factory(doc),radius=num(Math.max(box[2],box[3])/300*(kind==='country'?DOT_RADIUS.country:DOT_RADIUS.other));
 return node('svg',{class:'hx-dots',viewBox:viewBoxText(box),'data-kind':KINDS.has(kind)?kind:null,'aria-hidden':'true',focusable:'false',preserveAspectRatio:'xMidYMid meet'},
  ...pinsOf(shape.pins).map(([campus,[x,y]])=>node('circle',{class:'hx-dot','data-campus':campus,cx:num(x),cy:num(y),r:radius})));
}

const positive=value=>{const number=Number(value);return Number.isFinite(number)&&number>0?number:null;};
const cssURL=href=>`url("${href.replace(/[\\"]/g,'\\$&').replace(/\n/g,'\\a ')}")`;
/** The printed campus logo (§4.10, §6.3) from the manifest's `print` entry, sized width × height px (fitLogo), or null.
 * A mask print is a span painted in the theme's ink through the print as a CSS mask (no disc, no plate); a sticker
 * (Codam's colour logo) is the original image on a small plate. The URL is made absolute against baseURI and must be
 * http(s) or file. Decorative: the caller names the item. */
export function createPrintedLogo(doc,{print,width,height,baseURI=doc?.baseURI||'https://horizon.invalid/'}={}){
 if(!doc||!print||typeof print!=='object'||typeof print.src!=='string'||!print.src.trim())return null;
 if(print.kind!=='mask'&&print.kind!=='sticker')return null;
 let url;
 try{url=new URL(print.src.trim(),baseURI);}catch{return null;}
 if(!/^(?:https?|file):$/.test(url.protocol))return null;
 const w=positive(width),h=positive(height);
 const size=[w===null?null:`width:${num(w,2)}px`,h===null?null:`height:${num(h,2)}px`].filter(Boolean);
 const set=(element,attributes)=>{for(const [name,value] of Object.entries(attributes))if(value!==null&&value!==undefined)element.setAttribute(name,String(value));return element;};
 if(print.kind==='sticker')return set(doc.createElement('img'),{class:'hx-logo','data-print':'sticker',alt:'',decoding:'async',src:url.href,
  width:w===null?null:Math.round(w),height:h===null?null:Math.round(h),style:size.length?size.join(';'):null});
 const mask=cssURL(url.href);
 return set(doc.createElement('span'),{class:'hx-logo','data-print':'mask','aria-hidden':'true',style:[...size,`-webkit-mask-image:${mask}`,`mask-image:${mask}`].join(';')});
}

/** The box of a printed logo in maxW × maxH px (halo: .76·d × .30·d on the levels, .36·d in the sheet), at least minH
 * high: h = max(min(maxH, maxW/ar), minH), w = h·ar, ar = print.aspectRatio (3 when unknown). Pure. */
export function fitLogo(print,maxW,maxH,{minH=0}={}){
 const aspect=Number(print?.aspectRatio),ar=Number.isFinite(aspect)&&aspect>0?aspect:FALLBACK_ASPECT;
 const limit=value=>{const number=Number(value);return number>0?number:0;};
 const height=Math.max(Math.min(limit(maxH),limit(maxW)/ar),limit(minH));
 return {width:height*ar,height};
}

// The mock-up's sprite symbols (halo/index.html), copied verbatim; drawn with the site's icon rule (no fill, stroke
// currentColor 1.6, round caps and joins), sized and mirrored by the caller.
const ICONS={
 back:[['path',{d:'m10 6-6 6 6 6m-6-6h16'}]],
 check:[['path',{d:'m5 12 4 4 10-10'}]],
 copy:[['rect',{x:8,y:8,width:12,height:12,rx:3}],['path',{d:'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2'}]],
 enter:[['path',{d:'M19 5v6a3 3 0 0 1-3 3H6'}],['path',{d:'m10 10-4 4 4 4'}]],
 expand:[['path',{d:'M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7'}]],
 external:[['path',{d:'M14 4h6v6m0-6-9 9'}],['path',{d:'M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4'}]],
 next:[['path',{d:'m9.5 6 6 6-6 6'}]],
 prev:[['path',{d:'m14.5 6-6 6 6 6'}]],
 route:[['circle',{cx:6,cy:19,r:2}],['path',{d:'M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16'}],['path',{d:'M18 2.5c-1.7 0-3 1.3-3 3 0 2.2 3 5 3 5s3-2.8 3-5c0-1.7-1.3-3-3-3Z'}]],
 sparkle:[['path',{d:'M12 3.5c.6 4.2 2.3 6 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.5 5.9-2.3 6.5-6.5Z'}],['path',{d:'M18.5 15.5c.3 1.8 1 2.5 2.8 2.8-1.8.3-2.5 1-2.8 2.8-.3-1.8-1-2.5-2.8-2.8 1.8-.3 2.5-1 2.8-2.8Z'}]],
};
export const ICON_NAMES=Object.freeze(['back','check','copy','enter','expand','external','next','prev','route','sparkle']);

/** A small inline icon (24×24 viewBox, decorative), or null for an unknown name. */
export function icon(doc,name){
 if(!doc||typeof name!=='string'||!Object.hasOwn(ICONS,name))return null;
 const node=factory(doc);
 return node('svg',{class:'hx-icon','data-icon':name,viewBox:'0 0 24 24',width:24,height:24,'aria-hidden':'true',focusable:'false'},
  ...ICONS[name].map(([tag,attributes])=>node(tag,attributes)));
}
