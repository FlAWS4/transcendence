// Additive refinement of the already-built native n22 entrance.
// No existing node is deleted. Historical birth-frame children are retained hidden.
export async function refineEntrance(plan,formatName){
 const f=plan.formats[formatName];
 await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('115:2'));
 const created=[],mutated=new Set(),preserved=[],evidence={};
 const get=async id=>{const n=await figma.getNodeByIdAsync(id);if(!n)throw new Error('Missing '+id);return n;};
 const touch=n=>{mutated.add(n.id);return n;};
 const make=n=>{created.push(n.id);return n;};
 const roots=await Promise.all([f.entry,f.scan,f.decipher,f.reveal,...f.logo,...f.ring,...f.archive,...f.homes.flat()].map(get));
 const fonts=new Map();
 for(const root of roots)for(const t of root.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);
 await Promise.all([...fonts.values()].map(font=>figma.loadFontAsync(font)));
 const vars={};for(const [key,id]of Object.entries({bg:'264:3',accent:'4:20',text:'264:5',ltr:'286:787',rtl:'286:788'}))vars[key]=await figma.variables.getVariableByIdAsync('VariableID:'+id);
 const paint=key=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',vars[key]);
 const smooth={type:'CUSTOM_CUBIC_BEZIER',easingFunctionCubicBezier:{x1:.22,y1:1,x2:.36,y2:1}};
 const track=(pairs,easing=smooth)=>({keyframes:pairs.map(([timelinePosition,value])=>({timelinePosition,value:{type:'FLOAT',value},easing}))});
 const scale=pairs=>({keyframes:pairs.map(([timelinePosition,value])=>({timelinePosition,value:{type:'VECTOR',value:{x:value,y:value}},easing:smooth}))});
 const frame=(parent,name,w,h)=>{const n=make(figma.createFrame());n.name=name;n.fills=[];n.clipsContent=false;parent.appendChild(n);n.resize(w,h);return n;};
 const clone=(source,parent)=>{const c=source.clone();parent.appendChild(c);created.push(c.id,...c.findAll(()=>true).map(n=>n.id));return c;};
 const navigate=id=>({type:'NODE',destinationId:id,navigation:'NAVIGATE',transition:null,resetVideoPosition:true});
 const after=async(n,t,actions)=>{touch(n);await n.setReactionsAsync([{trigger:{type:'AFTER_TIMEOUT',timeout:t},actions}]);};
 const scene=async id=>{const n=await get(id),s=n.children.find(c=>c.name==='Le seuil');if(!s)throw new Error('Missing Le seuil '+id);return{frame:n,scene:s,root:s.children.find(c=>c.name==='n22 · '+formatName)};};
 const arrival=await scene(f.entry),scan=await scene(f.scan),decipher=await scene(f.decipher),reveal=await scene(f.reveal);
 if(!scan.root||!decipher.root||!reveal.root)throw new Error('Expected n22 layers missing');
 if(!arrival.root.children.some(n=>n.name==='n22 · binary clip')){
  touch(arrival.root).visible=false;preserved.push(arrival.root.id);arrival.root.name='n22 · previous encrypted rest';
  arrival.root=clone(scan.root,arrival.scene);arrival.root.name='n22 · '+formatName;
 }
 // Correct proportional word spaces without changing or replacing glyph layers.
 const probe=make(figma.createText());arrival.scene.appendChild(probe);probe.name='n22 · space metrics';probe.fontName={family:'Jost',style:'Medium'};probe.fontSize=f.fontSize;probe.visible=false;
 const sizes=plan.cells.map(c=>{probe.characters=c.clear===' '?'A A':c.clear;let w=probe.width;if(c.clear===' '){probe.characters='AA';w-=probe.width;}return w+f.fontSize*.02;});
 const positions=[],rows=formatName==='mobile'?[Array.from({length:6},(_,i)=>i),Array.from({length:8},(_,i)=>i+7)]:[plan.cells.map(c=>c.index)];
 rows.forEach((row,ri)=>{const width=row.reduce((s,i)=>s+sizes[i],0);let left=(f.sceneWidth-width)/2;const y=f.sceneHeight/2+(ri-(rows.length-1)/2)*f.fontSize*1.38;for(const i of row){positions[i]={x:left+sizes[i]/2,y,w:sizes[i]};left+=sizes[i];}});
 const letters=plan.cells.filter(c=>c.rank>=0),position=(n,p,maxWidth=Infinity)=>{touch(n);const sx=Math.min(1,maxWidth/n.width);n.relativeTransform=[[sx,0,p.x-n.width*sx/2],[0,1,p.y-n.height/2]];};
 for(const a of [arrival,scan]){
  for(const kind of ['binary','hex','cipher']){
   const content=a.root.findOne(n=>n.type==='FRAME'&&n.name==='n22 · '+kind+' glyphs');
   if(!content)throw new Error('Missing scan glyphs '+kind);
   if(kind==='binary')content.children.forEach((n,i)=>{const p=positions[letters[Math.floor(i/8)].index];position(n,{x:p.x+(i%2?1:-1)*f.fontSize*.105,y:p.y+(Math.floor((i%8)/2)-1.5)*f.fontSize*.24});});
   else content.children.forEach((n,i)=>{const p=positions[letters[i].index];position(n,p,p.w*.98);});
  }
  const padding=f.fontSize*.24,left=Math.min(...letters.map(c=>positions[c.index].x-positions[c.index].w/2))-padding,right=Math.max(...letters.map(c=>positions[c.index].x+positions[c.index].w/2))+padding;
  for(const beam of a.root.children.filter(n=>n.name==='n22 · scanner')){touch(beam);beam.x=left;beam.resize(right-left,beam.height);}
  a.root.setTimelineDuration(a.root.timelines[0].id,plan.timing.scanDuration);touch(a.root);
 }
 for(const n of decipher.root.children){const match=/^n22 · (\d+) \/ /.exec(n.name);if(match){const p=positions[Number(match[1])];position(n,p,p.w*.98);}}
 reveal.root.children.forEach((n,i)=>{const p=positions[letters[i].index];position(n,p,p.w*.98);});
 touch(decipher.root).setTimelineDuration(decipher.root.timelines[0].id,plan.timing.decipherDuration);
 touch(reveal.root).setTimelineDuration(reveal.root.timelines[0].id,plan.timing.revealDuration);
 await touch(arrival.frame).setReactionsAsync([]);
 await touch(await get(f.confirm)).setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[navigate(f.decipher)]}]);
 await after(decipher.frame,plan.timing.decipherDuration,[navigate(f.reveal)]);
 await after(reveal.frame,plan.timing.revealDuration,[navigate(f.logo[0])]);
 for(let route=0;route<2;route++){
  const logoFrame=await get(f.logo[route]),ringFrame=await get(f.ring[route]),birth=await get(f.archive[route]);
  const logo=touch(logoFrame.children.find(n=>n.name==='42'));
  logo.manualKeyframeTracks={OPACITY:track(route?[[0,0],[.6,1]]:[[0,0],[.16,0],[.6,1]]),SCALE_XY:scale([[0,.82],[.6,1]]),TRANSLATION_Y:track([[0,14],[.6,0]])};
  logo.setTimelineDuration(logo.timelines[0].id,plan.timing.logoDuration);
  if(route===0){let phrase=logoFrame.children.find(n=>n.name==='n22 · phrase vers 42');if(!phrase){phrase=clone(reveal.scene,logoFrame);phrase.name='n22 · phrase vers 42';}touch(phrase);phrase.manualKeyframeTracks={OPACITY:track([[0,1],[.34,0]]),SCALE_XY:scale([[0,1],[.34,.96]]),TRANSLATION_Y:track([[0,0],[.34,-12]])};}
  const ring=touch(ringFrame.children.find(n=>n.name==='n22 · cercle'));
  if(!ring)throw new Error('Missing native ring');
  ring.manualKeyframeTracks={PATH_TRIM_END:track([[0,0],[plan.timing.ringDuration,1]])};ring.setTimelineDuration(ring.timelines[0].id,plan.timing.ringDuration);
  await after(logoFrame,plan.timing.logoDuration,[navigate(ringFrame.id)]);
  const actions=JSON.parse(JSON.stringify(birth.reactions[0].actions));
  const direct=list=>{for(const a of list){if(a.type==='NODE'){a.transition=null;a.resetVideoPosition=true;}if(a.type==='CONDITIONAL')for(const b of a.conditionalBlocks)direct(b.actions);}};direct(actions);
  for(const child of birth.children.filter(n=>!n.name.startsWith('n22 · raccord '))){touch(child);child.visible=false;preserved.push(child.id);}
  touch(birth).fills=[paint('bg')];
  const directions=[];
  for(let dir=0;dir<2;dir++){
   const destination=await get(f.homes[route][dir]);let wrapper=birth.children.find(n=>n.name==='n22 · raccord '+(dir?'RTL':'LTR'));
   if(!wrapper){wrapper=frame(birth,'n22 · raccord '+(dir?'RTL':'LTR'),f.width,f.height);const c=clone(destination,wrapper);c.name='n22 · accueil cible';c.x=0;c.y=0;c.fills=[];await c.setReactionsAsync([]);}
   touch(wrapper).setBoundVariable('visible',vars[dir?'rtl':'ltr']);
   const home=wrapper.children[0],geo=home.children.find(n=>n.name==='Monde · géographie précise'),brand=home.children.find(n=>n.name==='42');
   const duration=plan.timing.globeDuration,dx=f.width/2-(geo.x+geo.width/2),dy=f.height/2-(geo.y+geo.height/2);
   const travel={SCALE_XY:scale([[0,f.ringDiameter/geo.width],[duration,1]]),TRANSLATION_X:track([[0,dx],[duration,0]]),TRANSLATION_Y:track([[0,dy],[duration,0]])};
   touch(geo).manualKeyframeTracks={...travel,OPACITY:track([[0,0],[.12,0],[.85,1]])};
   let rim=home.children.find(n=>n.name==='n22 · contour devient globe');if(!rim){rim=make(figma.createEllipse());home.appendChild(rim);rim.name='n22 · contour devient globe';}
   touch(rim);rim.resize(geo.width,geo.height);rim.x=geo.x;rim.y=geo.y;rim.fills=[];rim.strokes=[paint('accent')];rim.strokeWeight=1;rim.strokeAlign='CENTER';rim.manualKeyframeTracks={...travel,OPACITY:track([[0,1],[.52,1],[duration,0]])};
   const drawing=brand.children.find(n=>n.type==='FRAME');
   touch(brand).manualKeyframeTracks={SCALE_XY:scale([[0,f.logoWidth/drawing.width],[1,1]]),TRANSLATION_X:track([[0,f.width/2-(brand.x+drawing.x+drawing.width/2)],[1,0]]),TRANSLATION_Y:track([[0,f.height/2-(brand.y+drawing.y+drawing.height/2)],[1,0]])};
   for(const child of home.children){if([geo,brand,rim].includes(child))continue;touch(child).manualKeyframeTracks={OPACITY:track(/Atmosphère|Lueur/.test(child.name)?[[0,0],[duration,1]]:[[0,0],[.65,0],[duration,1]])};}
   wrapper.setTimelineDuration(wrapper.timelines[0].id,duration);
   directions.push({direction:dir?'RTL':'LTR',wrapper:wrapper.id,clone:home.id,target:destination.id,geo:geo.id,rim:rim.id,brand:brand.id,finalGlobe:{x:geo.x,y:geo.y,w:geo.width,h:geo.height}});
  }
  await after(ringFrame,plan.timing.ringDuration,[navigate(birth.id)]);await after(birth,plan.timing.globeDuration,actions);
  evidence[route?'visitor':'member']={logo:logoFrame.id,ring:ringFrame.id,birth:birth.id,directions};
 }
 return{format:formatName,createdNodeIds:created,mutatedNodeIds:[...mutated],removedNodeIds:[],preservedHistoricalNodeIds:preserved,evidence,entry:f.entry,timing:plan.timing,confirmation:f.confirm,fontsLoaded:fonts.size,limitations:['Static native geography, without WebGL manipulation or data loading.','Figma confirmation begins deciphering immediately; web waits for an unfinished arrival scan.','Video verification pending for this refinement.']};
}
