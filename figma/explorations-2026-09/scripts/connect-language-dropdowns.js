figma.skipInvisibleInstanceChildren=false;
const page=await figma.getNodeByIdAsync('115:2');await figma.setCurrentPageAsync(page);
for(const family of ['Jost','Noto Sans Arabic','Noto Sans'])for(const style of ['Regular','Medium'])await figma.loadFontAsync({family,style});
const vars=Object.fromEntries((await figma.variables.getLocalVariablesAsync()).map(v=>[v.name,v]));
const oldIds=['124:228','130:426','130:443','130:462','130:479'];
const callers=page.findAll(n=>'reactions' in n&&n.reactions.some(r=>(r.actions||[r.action]).some(a=>a&&oldIds.includes(a.destinationId))));
const components=[await figma.getNodeByIdAsync('287:738'),await figma.getNodeByIdAsync('287:757')];
const createdNodeIds=[],mutatedNodeIds=[],overlays=[];
function trackTree(n){createdNodeIds.push(n.id);if('findAll' in n)createdNodeIds.push(...n.findAll(x=>true).map(x=>x.id));return n;}
const clean=r=>({trigger:JSON.parse(JSON.stringify(r.trigger)),actions:JSON.parse(JSON.stringify(r.actions||[r.action]))});
const maxX=Math.max(...page.children.map(n=>n.x+n.width))+160;
for(const [index,caller] of callers.entries()){
 for(const t of caller.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))await figma.loadFontAsync(s.fontName);
 let root=caller;while(root.parent.id!==page.id)root=root.parent;
 const sourceId=caller.reactions.flatMap(r=>r.actions||[r.action]).find(a=>oldIds.includes(a.destinationId)).destinationId;
 const source=await figma.getNodeByIdAsync(sourceId);
 const actions=source.children.map(r=>({name:r.name,reactions:r.reactions.map(clean)}));
 const overlay=trackTree(figma.createFrame());overlay.name=`Langues ancrées · ${root.name}`;page.appendChild(overlay);overlay.resize(root.width,root.height);overlay.x=maxX+(index%2)*1600;overlay.y=240+Math.floor(index/2)*1120;overlay.fills=[];overlay.clipsContent=true;
 overlay.reactions=[{trigger:{type:'ON_KEY_DOWN',device:'KEYBOARD',keyCodes:[27]},actions:[{type:'CLOSE'}]}];
 const outside=trackTree(figma.createRectangle());outside.name='Fermer · clic extérieur';overlay.appendChild(outside);outside.resize(root.width,root.height);outside.fills=[{type:'SOLID',color:{r:0,g:0,b:0},opacity:0}];outside.reactions=[{trigger:{type:'ON_CLICK'},actions:[{type:'CLOSE'}]}];
 const box=caller.absoluteBoundingBox,rb=root.absoluteBoundingBox,rtl=root.name.includes('RTL');
 const x=Math.max(16,Math.min(root.width-192,rtl?box.x-rb.x:box.x-rb.x+box.width-176));const y=box.y-rb.y+box.height+8;
 const menuIds=[];
 for(const [i,component] of components.entries()){
  const menu=trackTree(component.createInstance());menu.name=`Liste des langues · ${i?'RTL':'LTR'}`;overlay.appendChild(menu);menu.x=x;menu.y=y;menu.setBoundVariable('visible',vars[`i18n/welcome/language/${i?'rtl':'ltr'}`]);
  for(const row of menu.children){const original=actions.find(a=>a.name===row.name);if(!original)throw new Error('Unmatched locale');row.reactions=original.reactions;}
  menuIds.push(menu.id);
 }
 // RTL routes have their own explicit locale. Other overlays inherit prototype modes.
 if(rtl)overlay.setExplicitVariableModeForCollection('VariableCollectionId:95:2','95:2');
 caller.reactions=caller.reactions.map(r=>{const out=clean(r);out.actions=out.actions.map(a=>oldIds.includes(a.destinationId)?{...a,destinationId:overlay.id}:a);return out;});mutatedNodeIds.push(caller.id);
 overlays.push({id:overlay.id,rootId:root.id,buttonId:caller.id,sourceId,width:overlay.width,height:overlay.height,menuIds,anchor:{x,y,width:176,height:140,button:{x:box.x-rb.x,y:box.y-rb.y,width:box.width,height:box.height}},rtl,rows:actions});
}
return{createdNodeIds,mutatedNodeIds,overlays,checks:{callers:callers.length,noVisibleBackdrop:true,preservesOriginalLocaleAndNavigationActions:true,escCloses:true,outsideClickCloses:true}};
