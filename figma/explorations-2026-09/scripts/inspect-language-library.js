// Read-only use_figma script, current existing family before deciding reuse.
const page=await figma.getNodeByIdAsync('5:3');await figma.setCurrentPageAsync(page);
const ids=['97:143','59:73','47:32'];
const describe=n=>({id:n.id,name:n.name,type:n.type,width:n.width,height:n.height,
 ...('characters'in n?{characters:n.characters,fontName:n.fontName,fontSize:n.fontSize}:{}),
 ...('fills'in n?{fills:n.fills}:{}),...('strokes'in n?{strokes:n.strokes}:{}),
 ...('boundVariables'in n?{boundVariables:n.boundVariables}:{}),
 ...('reactions'in n?{reactions:n.reactions}:{})});
const components=[];
for(const id of ids){const n=await figma.getNodeByIdAsync(id);if(!n){components.push({id,missing:true});continue;}const owner=n.type==='COMPONENT_SET'?n:n.type==='COMPONENT'&&n.parent?.type==='COMPONENT_SET'?n.parent:n;components.push({...describe(n),key:n.key,properties:['COMPONENT','COMPONENT_SET'].includes(owner.type)?owner.componentPropertyDefinitions:null,children:'children'in n?n.children.map(describe):[],descendants:n.findAll(()=>true).map(describe)});}
return {components};
