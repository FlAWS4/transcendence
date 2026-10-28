// Historical initial-construction transaction. No writes occur on import.
// Existing entrances must use entrance-sync-refine.mjs (the current build target).
// Scope is the existing entrance, decryption and logo/ring frames of ONE format.
// The root coordinator must grant the Figma mutation slot before execution.
export async function applyEntranceSync(plan, formatName) {
 const f=plan.formats[formatName]; if(!f)throw new Error('Unknown format');
 await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('115:2'));
 const existing=await figma.getNodeByIdAsync(f.entry);
 if(existing.findOne(n=>n.name.startsWith('n22 ·')))throw new Error('Entrance already constructed: use additive entrance-sync-refine.mjs.');
 const created=[],mutated=new Set(),removed=[], evidence={};
 const track=(values,easing='LINEAR')=>({keyframes:values.map(([t,v])=>({timelinePosition:t,value:{type:'FLOAT',value:v},easing:typeof easing==='string'?{type:easing}:easing}))});
 const node=async id=>{const n=await figma.getNodeByIdAsync(id);if(!n)throw new Error('Missing '+id);return n;};
 const touch=n=>{mutated.add(n.id);return n;};
 const made=n=>{created.push(n.id);return n;};
 const vars={};
 for(const [key,id] of Object.entries({bg:'264:3',text:'264:5',accent:'4:20',logo:'65:2',primary:'273:296',primaryText:'273:297',secondary:'273:298',secondaryText:'273:299',secondaryBorder:'273:300',space12:'4:29',space24:'4:31',space14:'264:65',fontFamily:'45:3',fontMedium:'45:5',ltr:'286:787',rtl:'286:788'})){
  vars[key]=await figma.variables.getVariableByIdAsync('VariableID:'+id);if(!vars[key])throw new Error('Missing role '+key);
 }
 const paint=(key,opacity=1)=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0},opacity},'color',vars[key]);
 const targetIds=[f.entry,f.scan,f.decipher,f.reveal,...f.logo,...f.ring,...f.archive,...f.homes.flat()];
 const targets=await Promise.all(targetIds.map(node));
 const fontNames=new Map();
 for(const root of targets)for(const t of root.findAllWithCriteria({types:['TEXT']}))for(const segment of t.getStyledTextSegments(['fontName']))fontNames.set(JSON.stringify(segment.fontName),segment.fontName);
 for(const {fontName:font}of await figma.listAvailableFontsAsync())if(['Noto Sans','Noto Sans Symbols2'].includes(font.family)&&['Regular','Medium'].includes(font.style))fontNames.set(JSON.stringify(font),font);
 for(const font of [{family:'Jost',style:'Medium'},{family:'Jost',style:'Regular'},{family:'Cousine',style:'Regular'},{family:'Noto Sans Arabic',style:'Regular'},{family:'Noto Sans Arabic',style:'Medium'}])fontNames.set(JSON.stringify(font),font);
 await Promise.all([...fontNames.values()].map(font=>figma.loadFontAsync(font)));
 // Before any mutation, ensure Motion is available on a descendant.
 const probe=(await node(f.scene)).timelines;
 if(!probe.length)throw new Error('No native timeline available');
 const plain=(parent,name,w,h)=>{const n=made(figma.createFrame());n.name=name;n.fills=[];n.clipsContent=false;parent.appendChild(n);n.resize(w,h);return n;};
 const text=(parent,chars,size,key,mono=false)=>{const n=made(figma.createText());n.name=chars;n.fontName={family:mono?'Cousine':'Jost',style:mono?'Regular':'Medium'};n.fontSize=size;n.characters=chars;n.textAutoResize='WIDTH_AND_HEIGHT';n.fills=[paint(key)];parent.appendChild(n);if(!mono){n.setBoundVariable('fontFamily',vars.fontFamily);n.setBoundVariable('fontStyle',vars.fontMedium);}return n;};
 const centerText=(parent,chars,size,key,cx,cy,mono=false,maxWidth=Infinity)=>{const n=text(parent,chars,size,key,mono);const sx=Math.min(1,maxWidth/n.width);n.relativeTransform=[[sx,0,cx-n.width*sx/2],[0,1,cy-n.height/2]];return n;};
 const sizes=[];const measure=plain(targets[0],'n22 · temporary measure',f.sceneWidth,f.sceneHeight);
 for(const c of plan.cells){const n=text(measure,c.clear,f.fontSize,'text');let width=n.width;if(c.clear===' '){n.characters='A A';const withSpace=n.width;n.characters='AA';width=withSpace-n.width;}sizes.push(width+f.fontSize*.02);}
 removed.push(measure.id,...measure.children.map(n=>n.id));measure.remove();
 const positions=[];const rows=formatName==='mobile'?[Array.from({length:6},(_,i)=>i),Array.from({length:8},(_,i)=>i+7)]:[plan.cells.map(c=>c.index)];
 rows.forEach((row,ri)=>{const width=row.reduce((s,i)=>s+sizes[i],0);let left=(f.sceneWidth-width)/2;const y=f.sceneHeight/2+(ri-(rows.length-1)/2)*f.fontSize*1.38;for(const i of row){positions[i]={x:left+sizes[i]/2,y,w:sizes[i]};left+=sizes[i];}});
 const visible=plan.cells.filter(c=>c.rank>=0),padding=f.fontSize*.24;
 const top=Math.min(...visible.map(c=>positions[c.index].y))-f.fontSize*.65-padding;
 const bottom=Math.max(...visible.map(c=>positions[c.index].y))+f.fontSize*.65+padding;
 const left=Math.min(...visible.map(c=>positions[c.index].x-positions[c.index].w/2))-padding;
 const right=Math.max(...visible.map(c=>positions[c.index].x+positions[c.index].w/2))+padding;
 const beamAt=k=>top+(bottom-top)*k.position;
 const beamKeys=plan.scan.map(k=>[k.time,beamAt(k)]);
 const representation=(parent,kind)=>{for(const c of visible){const p=positions[c.index];if(kind==='binary'){
  [...c.binary].forEach((digit,i)=>centerText(parent,digit,f.fontSize*.23,'text',p.x+(i%2?1:-1)*f.fontSize*.105,p.y+(Math.floor(i/2)-1.5)*f.fontSize*.24,true));
 }else centerText(parent,kind==='hex'?c.hex:kind==='final'?c.clear:c.cipher,kind==='hex'?f.fontSize*.43:f.fontSize,'text',p.x,p.y,kind==='hex',p.w*.98);}};
 const sceneFor=async id=>{const frame=touch(await node(id));frame.fills=[paint('bg')];const scene=touch(frame.children.find(n=>n.type==='FRAME'&&n.name==='Le seuil'));
  if(!scene)throw new Error('Le seuil absent '+id);
  for(const child of [...scene.children])if(child.name.startsWith('n22 ·')){removed.push(child.id,...('findAll' in child?child.findAll(()=>true).map(n=>n.id):[]));child.remove();}else{touch(child).visible=false;}
  scene.resize(f.sceneWidth,f.sceneHeight);scene.x=(f.width-f.sceneWidth)/2;scene.y=(f.height-f.sceneHeight)/2;scene.clipsContent=false;
  return {frame,scene,root:plain(scene,'n22 · '+formatName,f.sceneWidth,f.sceneHeight)};};
 const first=await sceneFor(f.entry);
 // Arrival scans once and rests encrypted; only confirmation enters deciphering.
 await first.frame.setReactionsAsync([]);
 const scanArchive=await sceneFor(f.scan);
 for(const scan of [first,scanArchive]){
 function clippedRepresentation(kind,lower,opacityKeys){
  const clip=plain(scan.root,'n22 · '+kind+' clip',f.sceneWidth,lower?f.sceneHeight-top:top);clip.clipsContent=true;clip.y=lower?top:0;
  const content=plain(clip,'n22 · '+kind+' glyphs',f.sceneWidth,f.sceneHeight);content.y=lower?-top:0;representation(content,kind);
  clip.opacity=opacityKeys[0][1];clip.manualKeyframeTracks={OPACITY:track(opacityKeys,'HOLD'),HEIGHT:track(beamKeys.map(([t,y])=>[t,lower?f.sceneHeight-y:y]))};
  if(lower){clip.manualKeyframeTracks={...clip.manualKeyframeTracks,TRANSLATION_Y:track(beamKeys.map(([t,y])=>[t,y-top]))};content.manualKeyframeTracks={TRANSLATION_Y:track(beamKeys.map(([t,y])=>[t,top-y]))};}
 }
 clippedRepresentation('binary',true,[[0,1],[2,0]]);
 clippedRepresentation('hex',false,[[0,0],[.6,1],[3.4,0]]);
 clippedRepresentation('cipher',true,[[0,0],[2,1]]);
 for(const [height,alpha] of [[f.fontSize*.3,.07],[6,.16],[1.5,1]]){
  const beam=made(figma.createRectangle());beam.name='n22 · scanner';scan.root.appendChild(beam);beam.resize(right-left,height);beam.x=left;beam.y=top-height/2;beam.fills=[paint('accent',alpha)];beam.opacity=0;
  beam.manualKeyframeTracks={TRANSLATION_Y:track(beamKeys.map(([t,y])=>[t,y-top])),OPACITY:track([[0,0],[.6,0],[.74,alpha],[3.26,alpha],[3.4,0]])};
 }
 scan.root.setTimelineDuration(scan.root.timelines[0].id,plan.timing.scanDuration);
 }
 const decipher=await sceneFor(f.decipher);
 for(const c of visible){const p=positions[c.index];for(const [i,g]of c.glyphs.entries()){
  const n=centerText(decipher.root,g.character,f.fontSize,g.settled?'text':'accent',p.x,p.y,false,p.w*.98);n.name=`n22 · ${c.index} / ${i} / ${g.character}`;n.opacity=i===0?1:0;
  const keys=i===0?[[0,1]]:[[0,0],[g.start,1]];if(!g.settled)keys.push([g.end,0]);n.manualKeyframeTracks={OPACITY:track(keys,'HOLD')};
 }}
 decipher.root.setTimelineDuration(decipher.root.timelines[0].id,plan.timing.decipherDuration);
 const reveal=await sceneFor(f.reveal);representation(reveal.root,'final');
 reveal.root.setTimelineDuration(reveal.root.timelines[0].id,plan.timing.revealDuration);
 const navigate=(id,transition=null)=>({type:'NODE',destinationId:id,navigation:'NAVIGATE',transition,resetVideoPosition:true});
 const after=async(n,seconds,actions)=>{touch(n);await n.setReactionsAsync([{trigger:{type:'AFTER_TIMEOUT',timeout:seconds},actions}]);};
 await after(scanArchive.frame,plan.timing.scanDuration,[navigate(f.decipher)]);
 await after(decipher.frame,plan.timing.decipherDuration,[navigate(f.reveal)]);
 await after(reveal.frame,plan.timing.revealDuration,[navigate(f.logo[0])]);
 const confirm=touch(await node(f.confirm));await confirm.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[navigate(f.decipher)]}]);
 const guest=touch(await node(f.guest));await guest.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[navigate(f.logo[1])]}]);
 const access=touch(await node(f.access));access.setBoundVariable('itemSpacing',formatName==='mobile'?vars.space12:vars.space24);access.y=f.height/2+(formatName==='mobile'?130:155);
 for(const [id,primary]of[[f.login,true],[f.guest,false]]){const b=touch(await node(id));b.fills=[paint(primary?'primary':'secondary')];b.strokes=primary?[]:[paint('secondaryBorder')];b.strokeWeight=1;b.cornerRadius=14;b.setBoundVariable('paddingTop',vars.space14);b.setBoundVariable('paddingBottom',vars.space14);b.paddingLeft=28;b.paddingRight=28;
  for(const label of b.findAllWithCriteria({types:['TEXT']})){touch(label);label.fontSize=formatName==='mobile'?16:17;label.fills=[paint(primary?'primaryText':'secondaryText')];}
  b.resize(formatName==='mobile'?342:b.width,52);
 }
 const accessWidth=formatName==='mobile'?342:access.children.reduce((sum,child)=>sum+child.width,0)+access.itemSpacing*(access.children.length-1);
 access.resize(accessWidth,formatName==='mobile'?116:52);access.x=(f.width-access.width)/2;
 const smooth={type:'CUSTOM_CUBIC_BEZIER',easingFunctionCubicBezier:{x1:.22,y1:1,x2:.36,y2:1}};
 const scale=values=>({keyframes:values.map(([t,s])=>({timelinePosition:t,value:{type:'VECTOR',value:{x:s,y:s}},easing:smooth}))});
 const cloneInto=(source,parent)=>{const c=source.clone();parent.appendChild(c);created.push(c.id,...c.findAll(()=>true).map(n=>n.id));return c;};
 for(let route=0;route<2;route++){
  const logoFrame=touch(await node(f.logo[route])),ringFrame=touch(await node(f.ring[route]));
  for(const [frame,animated]of[[logoFrame,true],[ringFrame,false]]){
   frame.fills=[paint('bg')];
   for(const child of [...frame.children])if(child.name.startsWith('n22 ·')){removed.push(child.id);child.remove();}else if(child.name==='42'&&child.type==='INSTANCE'){
    const logo=touch(child);logo.manualKeyframeTracks={};logo.visible=true;logo.opacity=1;const targetWidth=f.logoWidth/.6;logo.rescale(targetWidth/logo.width);
    const drawing=logo.children.find(n=>n.type==='FRAME');logo.x=f.width/2-(drawing.x+drawing.width/2);logo.y=f.height/2-(drawing.y+drawing.height/2);
    if(animated)logo.manualKeyframeTracks={OPACITY:track(route?[[0,0],[plan.timing.logoDuration,1]]:[[0,0],[.16,0],[plan.timing.logoDuration,1]],smooth),SCALE_XY:scale([[0,.82],[plan.timing.logoDuration,1]]),TRANSLATION_Y:track([[0,14],[plan.timing.logoDuration,0]],smooth)};
   }else{touch(child).opacity=0;}
  }
  if(route===0){
   const phrase=cloneInto(reveal.scene,logoFrame);phrase.name='n22 · phrase vers 42';
   phrase.manualKeyframeTracks={OPACITY:track([[0,1],[.34,0]],smooth),SCALE_XY:scale([[0,1],[.34,.96]]),TRANSLATION_Y:track([[0,0],[.34,-12]],smooth)};
  }
  // Path trim needs an open, centre-stroked path. A 0.1px seam is visually closed.
  const ring=made(figma.createVector());ring.name='n22 · cercle';ringFrame.appendChild(ring);ring.vectorPaths=[{windingRule:'NONZERO',data:'M 100 0 C 155.228 0 200 44.772 200 100 C 200 155.228 155.228 200 100 200 C 44.772 200 0 155.228 0 100 C 0 44.772 44.772 0 99.9 0'}];ring.resize(f.ringDiameter,f.ringDiameter);ring.x=(f.width-f.ringDiameter)/2;ring.y=(f.height-f.ringDiameter)/2;ring.fills=[];ring.strokes=[paint('accent')];ring.strokeWeight=1;ring.strokeAlign='CENTER';ring.manualKeyframeTracks={PATH_TRIM_END:track([[0,0],[plan.timing.ringDuration,1]],smooth)};
  const logo=logoFrame.children.find(n=>n.name==='42');logo.setTimelineDuration(logo.timelines[0].id,plan.timing.logoDuration);ring.setTimelineDuration(ring.timelines[0].id,plan.timing.ringDuration);
  await after(logoFrame,plan.timing.logoDuration,[navigate(ringFrame.id)]);
  const birth=touch(await node(f.archive[route]));const actions=JSON.parse(JSON.stringify(birth.reactions[0].actions));
  const replaceTransition=list=>{for(const action of list){if(action.type==='NODE'){action.transition=null;action.resetVideoPosition=true;}if(action.type==='CONDITIONAL')for(const block of action.conditionalBlocks)replaceTransition(block.actions);}};replaceTransition(actions);
  for(const child of [...birth.children]){removed.push(child.id,...('findAll'in child?child.findAll(()=>true).map(n=>n.id):[]));child.remove();}
  birth.fills=[paint('bg')];
  const directions=[];
  for(let direction=0;direction<2;direction++){
   const destination=await node(f.homes[route][direction]);
   const wrapper=plain(birth,'n22 · raccord '+(direction?'RTL':'LTR'),f.width,f.height);
   wrapper.setBoundVariable('visible',vars[direction?'rtl':'ltr']);
   const home=cloneInto(destination,wrapper);home.name='n22 · accueil cible';home.x=0;home.y=0;home.fills=[];home.manualKeyframeTracks={};await home.setReactionsAsync([]);
   const geo=home.children.find(n=>n.name==='Monde · géographie précise');
   const brand=home.children.find(n=>n.name==='42');
   if(!geo||!brand)throw new Error('Destination missing globe or 42: '+destination.id);
   const duration=plan.timing.globeDuration,s0=f.ringDiameter/geo.width;
   const dx=f.width/2-(geo.x+geo.width/2),dy=f.height/2-(geo.y+geo.height/2);
   const travel={SCALE_XY:scale([[0,s0],[duration,1]]),TRANSLATION_X:track([[0,dx],[duration,0]],smooth),TRANSLATION_Y:track([[0,dy],[duration,0]],smooth)};
   geo.manualKeyframeTracks={...travel,OPACITY:track([[0,0],[.12,0],[.85,1]],smooth)};
   const rim=made(figma.createEllipse());rim.name='n22 · contour devient globe';home.appendChild(rim);rim.resize(geo.width,geo.height);rim.x=geo.x;rim.y=geo.y;rim.fills=[];rim.strokes=[paint('accent')];rim.strokeWeight=1;rim.strokeAlign='CENTER';rim.manualKeyframeTracks={...travel,OPACITY:track([[0,1],[.52,1],[duration,0]],smooth)};
   const drawing=brand.children.find(n=>n.type==='FRAME');
   const brandScale=f.logoWidth/drawing.width;
   const brandCenter={x:brand.x+drawing.x+drawing.width/2,y:brand.y+drawing.y+drawing.height/2};
   brand.manualKeyframeTracks={SCALE_XY:scale([[0,brandScale],[1,1]]),TRANSLATION_X:track([[0,f.width/2-brandCenter.x],[1,0]],smooth),TRANSLATION_Y:track([[0,f.height/2-brandCenter.y],[1,0]],smooth)};
   for(const child of home.children){if(child===geo||child===brand||child===rim)continue;const background=/Atmosphère|Lueur/.test(child.name);child.manualKeyframeTracks={OPACITY:track(background?[[0,0],[duration,1]]:[[0,0],[.65,0],[duration,1]],smooth)};}
   wrapper.setTimelineDuration(wrapper.timelines[0].id,duration);
   directions.push({direction:direction?'RTL':'LTR',wrapper:wrapper.id,homeClone:home.id,target:destination.id,geo:geo.id,brand:brand.id,rim:rim.id,finalGlobe:{x:geo.x,y:geo.y,width:geo.width,height:geo.height},initialDiameter:f.ringDiameter});
  }
  await after(ringFrame,plan.timing.ringDuration,[navigate(birth.id)]);
  await after(birth,plan.timing.globeDuration,actions);
  evidence[route?'visitor':'member']={logo:logoFrame.id,ring:ringFrame.id,birth:birth.id,homes:f.homes[route],directions};
 }
 return {format:formatName,createdNodeIds:[...new Set(created.filter(id=>!removed.includes(id)))],mutatedNodeIds:[...mutated],removedNodeIds:[...new Set(removed)],evidence,entry:f.entry,n22:{duration:6.8,cells:visible.length,statesPerCell:43,order:plan.order,scanOnArrival:plan.timing.scanDuration,decipherAfterConfirmation:plan.timing.decipherDuration,readableHold:plan.timing.revealDuration,phraseToLogo:plan.timing.logoDuration,ringDraw:plan.timing.ringDuration,circleToGlobe:plan.timing.globeDuration,stages:[f.entry,f.decipher,f.reveal],archivedScan:f.scan},limitations:['Native glyph layers approximate Canvas rasterization; Cousine substitutes system monospace.','Native timing and circle-to-globe need export_video verification.','Figma confirmation starts deciphering immediately; the website also waits for an unfinished arrival scan.','Circle becomes the exact static Figma globe; no WebGL manipulation or preload is reproduced.']};
}
