// Prepared locally, not executed. Run only while holding the Figma write lease.
// Required skills: figma-use, figma-generate-library, figma-use-motion.
// Scope: page 5:3, two new semantic variables, two Welcome text styles.
const page = await figma.getNodeByIdAsync('5:3');
await figma.setCurrentPageAsync(page);
const navSet = await figma.getNodeByIdAsync('272:296');
const dice = await figma.getNodeByIdAsync('276:304');
if (navSet?.type !== 'COMPONENT_SET' || dice?.type !== 'COMPONENT') throw new Error('Expected Welcome assets are missing.');
const sections = ['explore', 'projects', 'people', 'journal'];
const matrix = navSet.children.filter(n => n.type === 'COMPONENT').map(node => ({node, props:node.variantProperties}));
if (matrix.length !== 16) throw new Error('Navigation variant count changed; inspect before applying.');
const plans = [], conflicts = [], before = [];
for (const {node,props} of matrix) {
  const items = node.children.filter(n => n.type === 'INSTANCE' && /^nav\//.test(n.name));
  if (items.length !== 4) throw new Error(`Expected four navigation items in ${node.id}.`);
  for (const section of sections) {
    const source = items.find(n => n.name === 'nav/' + section);
    const destination = matrix.find(v => v.props.Size === props.Size && v.props.Direction === props.Direction && v.props.Selection === section)?.node;
    if (!source || !destination || destination.parent.id !== navSet.id) throw new Error(`Missing destination for ${node.id}/${section}.`);
    const reactions = JSON.parse(JSON.stringify(source.reactions));
    before.push({sourceId:source.id,reactions});
    const protectedClicks = reactions.filter(r => r.trigger?.type === 'ON_CLICK' && (r.actions??[]).some(a => a.type !== 'NODE' || a.navigation !== 'CHANGE_TO'));
    if (protectedClicks.length) conflicts.push({sourceId:source.id,reactions:protectedClicks});
    plans.push({source,destination,reactions,sourceVariant:node,isSelected:props.Selection === section});
  }
}
// Never overwrite screen-level behavior that appeared after the creation audit.
if (conflicts.length) return {status:'needs-inspection',createdNodeIds:[],mutatedNodeIds:[],conflicts,before};

const fonts = [];
for (const {node} of matrix) for (const text of node.findAllWithCriteria({types:['TEXT']})) {
  for (const segment of text.getStyledTextSegments(['fontName'])) fonts.push(segment.fontName);
}
fonts.push(...['Jost','Noto Sans Arabic'].flatMap(family => ['Regular','Medium'].map(style => ({family,style}))));
await Promise.all([...new Map(fonts.map(f => [JSON.stringify(f),f])).values()].map(f => figma.loadFontAsync(f)));
const variables = Object.fromEntries((await figma.variables.getLocalVariablesAsync()).map(v => [v.name,v]));
const colorCollection = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:3');
const createdNodeIds=[], mutatedNodeIds=[], createdVariableIds=[], mutatedVariableIds=[], mutatedStyleIds=[];
function semantic(name,type,scopes,light,dark,syntax) {
  let v=variables[name];
  if(!v){v=figma.variables.createVariable(name,colorCollection,type);variables[name]=v;createdVariableIds.push(v.id);}
  else mutatedVariableIds.push(v.id);
  v.scopes=scopes;
  v.setValueForMode('3:1',{type:'VARIABLE_ALIAS',id:light});
  v.setValueForMode('3:2',{type:'VARIABLE_ALIAS',id:dark});
  v.setVariableCodeSyntax('WEB',syntax);
  return v;
}
const randomIcon = semantic('color/welcome/random-icon','COLOR',['SHAPE_FILL','STROKE_COLOR'],'VariableID:264:20','VariableID:39:2','var(--h42-pink)');
const scopeStyle = semantic('type/welcome/scope-style','STRING',['FONT_STYLE'],'VariableID:45:5','VariableID:45:4','font-weight');
const paint = name => figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',variables[name]);
const effectStyle = (await figma.getLocalEffectStylesAsync()).find(s => s.name === '42/Welcome/Selected navigation');
if(!effectStyle) throw new Error('Welcome navigation effect style missing.');

// One consistently named moving layer, matching the absolute indicator in CSS.
for(const {node,props} of matrix){
  const items=node.children.filter(n=>n.type==='INSTANCE' && /^nav\//.test(n.name));
  const selected=items.find(n=>n.name==='nav/'+props.Selection);
  let indicator=node.children.find(n=>n.type==='RECTANGLE' && n.name==='Selection indicator');
  if(!indicator){indicator=figma.createRectangle();indicator.name='Selection indicator';node.appendChild(indicator);indicator.layoutPositioning='ABSOLUTE';createdNodeIds.push(indicator.id);}
  else mutatedNodeIds.push(indicator.id);
  node.insertChild(0,indicator);
  indicator.layoutPositioning='ABSOLUTE';
  indicator.resize(selected.width,selected.height);indicator.x=selected.x;indicator.y=selected.y;
  indicator.fills=[paint('color/welcome/nav-active-fill')];indicator.strokes=[paint('color/welcome/nav-active-border')];indicator.strokeAlign='INSIDE';indicator.setBoundVariable('strokeWeight',variables['stroke/thin']);
  for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) indicator.setBoundVariable(k,variables['radius/'+(props.Size==='Mobile'?22:23)]);
  indicator.effectStyleId=effectStyle.id;
  for(const item of items){item.fills=[];item.strokes=[];item.effects=[];mutatedNodeIds.push(item.id);}
  mutatedNodeIds.push(node.id);
}
const destinations=[], inactiveItemIds=[];
for(const {source,destination,reactions,sourceVariant,isSelected} of plans){
  const kept=reactions.filter(r=>r.trigger?.type!=='ON_CLICK');
  // The current tab has no action. In particular, never CHANGE_TO the same variant.
  if(isSelected){
    if(kept.length!==reactions.length){await source.setReactionsAsync(kept);mutatedNodeIds.push(source.id);}
    inactiveItemIds.push(source.id);
    continue;
  }
  if(destination.id===sourceVariant.id) throw new Error(`Unexpected self-transition for ${source.id}.`);
  await source.setReactionsAsync([...kept,{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',navigation:'CHANGE_TO',destinationId:destination.id,transition:{type:'SMART_ANIMATE',duration:.48,easing:{type:'CUSTOM_CUBIC_BEZIER',easingFunctionCubicBezier:{x1:.22,y1:1,x2:.36,y2:1}}}}]}]);
  mutatedNodeIds.push(source.id);destinations.push({sourceId:source.id,sourceVariantId:sourceVariant.id,destinationId:destination.id,valid:destination.parent.id===navSet.id&&destination.id!==sourceVariant.id});
}

// Change only SVG paths, never the transparent icon containers.
const diceRoots=[dice,...page.findAllWithCriteria({types:['INSTANCE']}).filter(n=>n.mainComponent?.id===dice.id)];
for(const root of diceRoots) for(const path of root.findAllWithCriteria({types:['VECTOR','ELLIPSE','RECTANGLE','BOOLEAN_OPERATION']})){
  for(const property of ['fills','strokes']) if(property in path && Array.isArray(path[property])) path[property]=path[property].map(p=>p.type==='SOLID'?figma.variables.setBoundVariableForPaint(p,'color',randomIcon):p);
  mutatedNodeIds.push(path.id);
}
for(const style of (await figma.getLocalTextStylesAsync()).filter(s=>['42/Welcome/Scope/Desktop','42/Welcome/Scope/Mobile'].includes(s.name))){style.setBoundVariable('fontStyle',scopeStyle);mutatedStyleIds.push(style.id);}
for(const id of ['271:1213','271:1222','271:1231','271:1240']){
  const text=await figma.getNodeByIdAsync(id);if(text?.type==='TEXT'){text.setBoundVariable('fontStyle',scopeStyle);mutatedNodeIds.push(text.id);}
}
const errors=matrix.flatMap(({node})=>node.findAllWithCriteria({types:['TEXT']}).flatMap(n=>n.getStyledTextSegments(['fontName']).filter(s=>!['Jost','Noto Sans Arabic'].includes(s.fontName.family)).map(s=>({id:n.id,font:s.fontName}))));
return {status:'applied',createdNodeIds:[...new Set(createdNodeIds)],mutatedNodeIds:[...new Set(mutatedNodeIds)],createdVariableIds,mutatedVariableIds,mutatedStyleIds,variables:{randomIcon:randomIcon.id,scopeStyle:scopeStyle.id},reactionCount:destinations.length,destinations,inactiveItemIds,before,validation:{variantCount:matrix.length,destinationsValid:destinations.every(d=>d.valid),expected48Transitions:destinations.length===48,expected16InactiveItems:inactiveItemIds.length===16,fontErrors:errors},note:'CHANGE_TO selection state only, selected tab inactive. Screen content/route behavior remains owned by page115:2.'};
