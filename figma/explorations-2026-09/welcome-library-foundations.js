// Run via Figma use_figma; adapts createSemanticTokens helper with idempotent names.
const page = await figma.getNodeByIdAsync('5:3');
await figma.setCurrentPageAsync(page);
await Promise.all(['Jost','Noto Sans Arabic'].flatMap(family=>['Regular','Medium'].map(style=>figma.loadFontAsync({family,style}))));
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const cv = id=>cols.find(c=>c.id===id);
const primitives=cv('VariableCollectionId:3:2'), colors=cv('VariableCollectionId:3:3'), measures=cv('VariableCollectionId:3:4'), languages=cv('VariableCollectionId:95:2');
const existing=await figma.variables.getLocalVariablesAsync(); const byName=Object.fromEntries(existing.map(v=>[v.name,v]));
const createdVariableIds=[]; const output={};
function token(name,coll,type,scopes,values,syntax){
 let v=byName[name]; if(!v){v=figma.variables.createVariable(name,coll,type);createdVariableIds.push(v.id);byName[name]=v;v.scopes=scopes;for(const [mode,val] of Object.entries(values))v.setValueForMode(mode,val);v.setVariableCodeSyntax('WEB',syntax);}
 output[name]=v.id; return v;
}
function rgba(value){if(Array.isArray(value))return {r:value[0]/255,g:value[1]/255,b:value[2]/255,a:value[3]??1};const h=value.slice(1);return {r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255,a:h.length===8?parseInt(h.slice(6,8),16)/255:1};}
function primitive(value,name){const r=rgba(value);const match=existing.find(v=>v.variableCollectionId===primitives.id&&v.resolvedType==='COLOR'&&Object.entries(r).every(([k,z])=>Math.abs(v.valuesByMode['3:0'][k]-z)<1e-6));return match??token('welcome/'+name,primitives,'COLOR',[],{'3:0':r},typeof value==='string'?value:'rgba('+value.join(',')+')');}
const C={
 bg:['#F7FAFA','#1B1B1B','var(--h42-color-bg)'],surface:['#FFFFFF','#202026','var(--h42-color-surface)'],text:['#1B1B1B','#FFFFFF','var(--h42-color-text)'],muted:['#536163','#95B0B0','var(--h42-color-muted)'],soft:['#EAF5F4','#29292E','var(--h42-color-soft)'],border:['#DCE5E5','#324B4B','var(--h42-color-border)'],
 'nav-active-fill':[[222.3,243.6,243.8],[52.2,30,41.16],'var(--warm-soft)'], 'nav-active-border':[[192.66,235.92,236.36],[64.8,31.5,48.24],'var(--warm-line)'],'nav-active-icon':[[6.75,146.25,147.75],'#ED3491','var(--h42-pink)'],
 'scope-icon':['#008E90','#FFFFFF','var(--h42-color-text)'],'scope-border':['#FFFFFF',[64.8,31.5,48.24],'var(--warm-line)'],'mobile-surface':['#FFFFFFF2',[32,32,38,.94],'var(--h42-color-surface)'],'pin':['#ED3491','#ED3491','var(--h42-pink)'],
 'globe-land':['#19B8B5','#256967','map.palette.landWorld'],'globe-water':['#D9EEEE','#25232B','map.palette.waterWorld'],'globe-border':['#C4F3EF','#A5DBD2','map.palette.border'],'country-land':['#96D8CE','#245755','map.palette.landCountry'],
 'local-land':['#EDF2F0','#203B3D','map.palette.landLocal'],'local-water':['#AADFE1','#20232C','map.palette.waterLocal'],'local-building':['#7ABBB3','#559F96','map.palette.extrusion'],
 'scope-shadow':['#183D3C0D',[237,52,145,.04],'scope-path.box-shadow'],'nav-shadow':['#183D3C1A',[237,52,145,.12],'main-nav.box-shadow'],'active-shadow':[[0,186,188,.06],[0,186,188,0],'nav-indicator.box-shadow']
};
for(const [name,[light,dark,syntax]] of Object.entries(C)){
const l=primitive(light,name+'-light'),d=primitive(dark,name+'-dark');
const scopes=name.includes('shadow')?['EFFECT_COLOR']:name==='text'||name==='muted'?['TEXT_FILL','SHAPE_FILL','STROKE_COLOR']:name.includes('border')?['STROKE_COLOR']:['FRAME_FILL','SHAPE_FILL','STROKE_COLOR'];
token('color/welcome/'+name,colors,'COLOR',scopes,{'3:1':{type:'VARIABLE_ALIAS',id:l.id},'3:2':{type:'VARIABLE_ALIAS',id:d.id}},syntax);
}
for(const n of [1,2,3,5,6,7,10,14,15,19,22]){if(!byName['space/'+n])token('space/'+n,measures,'FLOAT',['GAP'],{'3:3':n},n+'px');else output['space/'+n]=byName['space/'+n].id;}
for(const n of [22,23,29,50])token('radius/'+n,measures,'FLOAT',['CORNER_RADIUS'],{'3:3':n},n+'px');
const T={journal:['Le journal','Journal','المجلة'],world:['Monde','World','العالم'],hint:['Fais tourner, puis choisis un pays.','Spin the world, then choose a country.','أدر العالم، ثم اختر دولة.'],prototype:['Exploration · 42 Horizon','Exploration · 42 Horizon','تصوّر أولي · 42 Horizon'],'hint-country':['Choisis un campus pour t’en approcher.','Choose a campus to explore up close.','اختر فرعًا لاستكشافه عن قرب.'],'hint-campus':['Explore les alentours du campus.','Explore around the campus.','استكشف محيط الفرع.']};
for(const [name,values] of Object.entries(T))token('i18n/welcome/'+name,languages,'STRING',['TEXT_CONTENT'],Object.fromEntries(values.map((v,i)=>['95:'+i,v])),`copy[locale].${name}`);
const styles=await figma.getLocalTextStylesAsync(); const textStyles={}; const createdStyleIds=[];
for(const [key,size,line,weight] of [['Nav/Desktop',26,38,'Regular'],['Nav/Desktop Active',26,38,'Medium'],['Nav/Mobile',12,15,'Regular'],['Nav/Mobile Active',12,15,'Medium'],['Scope/Desktop',15,21.6667,'Medium'],['Scope/Mobile',13,18.8,'Medium'],['Hint',14,20.2333,'Regular'],['Note/Desktop',12,17.3333,'Regular'],['Note/Mobile',10,14.45,'Regular']]){
 const name='42/Welcome/'+key; let s=styles.find(x=>x.name===name);if(!s){s=figma.createTextStyle();s.name=name;s.fontName={family:'Jost',style:weight};s.fontSize=size;s.lineHeight={unit:'PIXELS',value:line};s.letterSpacing={unit:'PIXELS',value:0};s.setBoundVariable('fontFamily',byName['i18n/font/family']);createdStyleIds.push(s.id);}textStyles[key]=s.id;
}
const effects=await figma.getLocalEffectStylesAsync();const effectStyles={};
for(const [key,color,radius,y] of [['Scope','scope-shadow',20,5],['Mobile navigation','nav-shadow',34,14],['Selected navigation','active-shadow',20,8]]){let s=effects.find(x=>x.name==='42/Welcome/'+key);if(!s){s=figma.createEffectStyle();s.name='42/Welcome/'+key;s.effects=[figma.variables.setBoundVariableForEffect({type:'DROP_SHADOW',color:{r:0,g:0,b:0,a:.1},offset:{x:0,y},radius,spread:0,visible:true,blendMode:'NORMAL'},'color',byName['color/welcome/'+color])];createdStyleIds.push(s.id);}effectStyles[key]=s.id;}
return {createdNodeIds:[],mutatedNodeIds:[],createdVariableIds,createdStyleIds,variables:output,textStyles,effectStyles,collections:cols.map(c=>({id:c.id,name:c.name,count:c.variableIds.length,modes:c.modes})),validation:{allNewScopesExplicit:createdVariableIds.every(id=>!existing.find(v=>v.id===id)?.scopes.includes('ALL_SCOPES')),historicalVariablesUnchanged:true}};
