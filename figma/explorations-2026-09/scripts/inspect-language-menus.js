// Read-only use_figma script. Run after the concurrent library/screen writers finish.
const page=await figma.getNodeByIdAsync('115:2');await figma.setCurrentPageAsync(page);
const ids=['124:228','130:426','130:443','130:462','130:479'];
const overlays=[];
function summary(node){
 const result={id:node.id,type:node.type,name:node.name,x:node.x,y:node.y,width:node.width,height:node.height,visible:node.visible};
 if('characters'in node)Object.assign(result,{characters:node.characters,fontName:node.fontName,fontSize:node.fontSize});
 if('reactions'in node)result.reactions=node.reactions;
 if('mainComponent'in node&&node.type==='INSTANCE')result.mainComponent={id:node.mainComponent?.id,name:node.mainComponent?.name,key:node.mainComponent?.key};
 if('fills'in node)result.fills=node.fills;
 if('boundVariables'in node)result.boundVariables=node.boundVariables;
 return result;
}
for(const id of ids){
 const node=await figma.getNodeByIdAsync(id);if(!node){overlays.push({id,missing:true});continue;}
 overlays.push({...summary(node),overlayPositionType:node.overlayPositionType,overlayBackground:node.overlayBackground,overlayBackgroundInteraction:node.overlayBackgroundInteraction,
  children:node.children.map(summary),interactionNodes:node.findAll(n=>'reactions'in n&&n.reactions.length).map(summary)});
}
const callers=page.findAll(node=>'reactions'in node&&node.reactions.some(reaction=>ids.some(id=>JSON.stringify(reaction).includes(id)))).map(node=>{
 let frame=node;while(frame.parent&&frame.parent.type!=='PAGE')frame=frame.parent;
 return {...summary(node),root:{id:frame.id,name:frame.name,width:frame.width,height:frame.height,explicitVariableModes:frame.explicitVariableModes},bounds:node.absoluteBoundingBox,
  relativeBounds:{x:node.absoluteBoundingBox.x-frame.x,y:node.absoluteBoundingBox.y-frame.y,width:node.width,height:node.height}};
});
return {overlays,callers,styles:{text:(await figma.getLocalTextStylesAsync()).map(s=>({id:s.id,name:s.name,fontName:s.fontName,fontSize:s.fontSize})),effects:(await figma.getLocalEffectStylesAsync()).map(s=>({id:s.id,name:s.name,effects:s.effects}))},
 variables:(await figma.variables.getLocalVariablesAsync()).filter(v=>/welcome|language|radius\/18|i18n\/font|color\/action/.test(v.name)).map(v=>({id:v.id,name:v.name,collection:v.variableCollectionId,type:v.resolvedType,scopes:v.scopes,values:v.valuesByMode})),
 fonts:(await figma.listAvailableFontsAsync()).filter(font=>['Jost','Noto Sans Arabic'].includes(font.fontName.family))};
