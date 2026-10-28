figma.skipInvisibleInstanceChildren=false;
const page=await figma.getNodeByIdAsync('115:2');await figma.setCurrentPageAsync(page);
for(const family of ['Jost','Noto Sans Arabic','Noto Sans'])for(const style of ['Regular','Medium'])await figma.loadFontAsync({family,style});
const overlays=page.children.filter(n=>n.name.startsWith('Langues ancrées ·'));
const checks=[],state=[];
for(const overlay of overlays){
 const callers=page.findAll(n=>'reactions' in n&&n.reactions.some(r=>(r.actions||[r.action]).some(a=>a&&a.destinationId===overlay.id)));
 const menu=overlay.children.filter(n=>n.type==='INSTANCE');const caller=callers[0];let root=caller;while(root.parent.id!==page.id)root=root.parent;
 const rb=root.absoluteBoundingBox,cb=caller.absoluteBoundingBox;
 const locales=[];
 for(const m of menu){
  for(const row of m.children){
   const actions=row.reactions[0].actions;
   for(const a of actions)if(a.type==='NODE'&&!await figma.getNodeByIdAsync(a.destinationId))throw new Error('Broken locale destination');
   locales.push({direction:m.name,id:row.id,locale:row.name,mode:actions.find(a=>a.type==='SET_VARIABLE_MODE').variableModeId,destination:actions.find(a=>a.type==='NODE')?.destinationId||'CLOSE'});
  }
 }
 const values={sameViewport:overlay.width===root.width&&overlay.height===root.height,oneCaller:callers.length===1,underButton:Math.abs(menu[0].y-(cb.y-rb.y+cb.height+8))<.01,insideViewport:menu[0].x>=0&&menu[0].x+176<=root.width,compact:menu.every(m=>m.width===176&&m.height===140&&m.children.every(r=>r.height===42)),transparent:overlay.fills.length===0&&overlay.overlayBackground.type==='NONE',centerViewport:overlay.overlayPositionType==='CENTER',outsideCloses:overlay.children[0].reactions[0].actions[0].type==='CLOSE',escCloses:overlay.reactions[0].trigger.keyCodes[0]===27};
 checks.push({id:overlay.id,...values});if(Object.values(values).some(v=>!v))throw new Error('Failed dropdown geometry');
 state.push({id:overlay.id,rootId:root.id,buttonId:caller.id,width:overlay.width,height:overlay.height,menuIds:menu.map(n=>n.id),anchor:{x:menu[0].x,y:menu[0].y,width:176,height:140},locales});
}
const ltr=await figma.getNodeByIdAsync('287:738'),rtl=await figma.getNodeByIdAsync('287:757');
const qa=figma.createAutoLayout('HORIZONTAL');qa.name='QA temporaire · Langues clair/sombre';qa.x=Math.max(...page.children.map(n=>n.x+n.width))+80;qa.y=240;qa.itemSpacing=40;qa.paddingTop=24;qa.paddingBottom=24;qa.paddingLeft=24;qa.paddingRight=24;qa.fills=[{type:'SOLID',color:{r:.88,g:.91,b:.92}}];
const temp=[qa.id];const visual=[];
for(const [mode,locale,comp] of [['3:1','95:0',ltr],['3:1','95:1',ltr],['3:2','95:2',rtl]]){
 const menu=comp.createInstance();qa.appendChild(menu);temp.push(menu.id,...menu.findAll(n=>true).map(n=>n.id));menu.setExplicitVariableModeForCollection('VariableCollectionId:3:3',mode);menu.setExplicitVariableModeForCollection('VariableCollectionId:95:2',locale);visual.push({mode,locale,size:{w:menu.width,h:menu.height},selected:menu.children.map(r=>({name:r.name,check:r.findOne(n=>n.name==='Selected language').opacity,text:r.findOne(n=>n.type==='TEXT').fontName}))});
}
await qa.screenshot({scale:2});qa.remove();
return{createdNodeIds:temp,removedNodeIds:temp,mutatedNodeIds:[],overlays:state,checks,visual,limits:['Figma uses transparent viewport overlays because overlay anchoring properties are read-only in the API.','Choice, outside click and Escape actions are wired; browser prototype interaction still needs a live playthrough.','Historical centered overlays remain unreferenced on the active route.']};
