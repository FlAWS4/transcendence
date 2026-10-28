// Phase1. Adaptation of the skill createSemanticTokens helper; safe by exact name.
// Run only after discovery / API ownership handoff. No existing token is overwritten.
const page=await figma.getNodeByIdAsync('5:3');await figma.setCurrentPageAsync(page);
const fonts=await figma.listAvailableFontsAsync();
for(const family of ['Jost','Noto Sans Arabic'])for(const style of ['Regular','Medium']){
 if(!fonts.some(f=>f.fontName.family===family&&f.fontName.style===style))throw new Error(`Missing verified font ${family} ${style}`);
 await figma.loadFontAsync({family,style});
}
const collections=await figma.variables.getLocalVariableCollectionsAsync();
const collection=id=>collections.find(c=>c.id===id);
const primitive=collection('VariableCollectionId:3:2'),colors=collection('VariableCollectionId:3:3'),measures=collection('VariableCollectionId:3:4'),languages=collection('VariableCollectionId:95:2');
const existing=await figma.variables.getLocalVariablesAsync(),variables=Object.fromEntries(existing.map(v=>[v.name,v]));
const createdVariableIds=[],createdStyleIds=[],used={};
function token(name,owner,type,scopes,values,syntax){
 let v=variables[name];
 if(v&&(v.resolvedType!==type||v.variableCollectionId!==owner.id))throw new Error(`Conflicting variable ${name}`);
 if(!v){v=figma.variables.createVariable(name,owner,type);v.scopes=scopes;
  for(const [mode,value] of Object.entries(values))v.setValueForMode(mode,value);
  v.setVariableCodeSyntax('WEB',syntax);createdVariableIds.push(v.id);variables[name]=v;
 }
 used[name]=v.id;return v;
}
function alias(name){const v=variables[name];if(!v)throw new Error(`Missing prior token ${name}`);return {type:'VARIABLE_ALIAS',id:v.id};}
function primitiveColor(name,rgba){
 const candidate=existing.find(v=>v.variableCollectionId===primitive.id&&v.resolvedType==='COLOR'&&Object.entries(rgba).every(([key,value])=>Math.abs(v.valuesByMode['3:0']?.[key]-value)<1e-8));
 return candidate||token(name,primitive,'COLOR',[],{'3:0':rgba},`var(--${name.replaceAll('/','-')})`);
}
const transparent=primitiveColor('welcome/transparent',{r:0,g:0,b:0,a:0});
const mainShadow=primitiveColor('welcome/menu-shadow-light',{r:24/255,g:61/255,b:60/255,a:18/255});
const secondaryShadow=primitiveColor('welcome/menu-shadow-secondary-light',{r:24/255,g:61/255,b:60/255,a:6/255});
const shadowDark=primitiveColor('welcome/menu-shadow-dark',{r:0,g:0,b:0,a:.2});
const a=v=>({type:'VARIABLE_ALIAS',id:v.id});
token('color/welcome/language-active',colors,'COLOR',['TEXT_FILL','STROKE_COLOR'],{'3:1':alias('color/welcome/scope-icon'),'3:2':alias('color/welcome/pin')},'var(--h42-color-focus)');
token('color/welcome/language-active-background',colors,'COLOR',['FRAME_FILL'],{'3:1':alias('color/welcome/soft'),'3:2':alias('color/welcome/nav-active-fill')},'var(--warm-soft)');
token('color/welcome/language-border',colors,'COLOR',['STROKE_COLOR'],{'3:1':alias('color/welcome/border'),'3:2':alias('color/welcome/nav-active-border')},'var(--warm-line)');
token('color/welcome/language-shadow-main',colors,'COLOR',['EFFECT_COLOR'],{'3:1':a(mainShadow),'3:2':a(shadowDark)},'var(--shadow)');
token('color/welcome/language-shadow-secondary',colors,'COLOR',['EFFECT_COLOR'],{'3:1':a(secondaryShadow),'3:2':a(transparent)},'var(--shadow)');
token('effect/welcome/language-shadow-y',colors,'FLOAT',['EFFECT_FLOAT'],{'3:1':alias('space/22'),'3:2':alias('space/16')},'var(--shadow)');
token('effect/welcome/language-shadow-blur',colors,'FLOAT',['EFFECT_FLOAT'],{'3:1':alias('space/64'),'3:2':alias('space/48')},'var(--shadow)');
token('radius/18',measures,'FLOAT',['CORNER_RADIUS'],{'3:3':18},'var(--radius-language-menu)');
for(const [locale,index] of [['fr',0],['en',1],['ar',2]]){
 const modes=callback=>Object.fromEntries(['95:0','95:1','95:2'].map((mode,i)=>[mode,callback(i===index)]));
 token(`i18n/welcome/language/${locale}/background`,languages,'COLOR',['FRAME_FILL'],modes(selected=>selected?alias('color/welcome/language-active-background'):a(transparent)),'var(--warm-soft)');
 token(`i18n/welcome/language/${locale}/text`,languages,'COLOR',['TEXT_FILL','STROKE_COLOR'],modes(selected=>alias(selected?'color/welcome/language-active':'color/welcome/text')),'var(--h42-color-text)');
 token(`i18n/welcome/language/${locale}/weight`,languages,'FLOAT',['FONT_WEIGHT'],modes(selected=>selected?500:400),'var(--language-option-weight)');
 token(`i18n/welcome/language/${locale}/check`,languages,'FLOAT',['OPACITY'],modes(selected=>selected?100:0),'var(--language-option-selected)');
}
token('i18n/welcome/language/ltr',languages,'BOOLEAN',['ALL_SCOPES'],{'95:0':true,'95:1':true,'95:2':false},'var(--language-menu-ltr)');
token('i18n/welcome/language/rtl',languages,'BOOLEAN',['ALL_SCOPES'],{'95:0':false,'95:1':false,'95:2':true},'var(--language-menu-rtl)');
const styles=await figma.getLocalTextStylesAsync(),textStyles={};
for(const [name,family] of [['Latin','Jost'],['Arabic','Noto Sans Arabic']]){
 let style=styles.find(s=>s.name===`42/Welcome/Language ${name}`);
 if(!style){style=figma.createTextStyle();style.name=`42/Welcome/Language ${name}`;style.fontName={family,style:'Regular'};style.fontSize=14;style.lineHeight={unit:'PIXELS',value:22};style.letterSpacing={unit:'PIXELS',value:0};createdStyleIds.push(style.id);}
 textStyles[name]=style.id;
}
const effectStyles=await figma.getLocalEffectStylesAsync();let effect=effectStyles.find(s=>s.name==='42/Welcome/Language menu');
if(!effect){effect=figma.createEffectStyle();effect.name='42/Welcome/Language menu';
 let main={type:'DROP_SHADOW',color:{r:0,g:0,b:0,a:.1},offset:{x:0,y:22},radius:64,spread:0,visible:true,blendMode:'NORMAL'};
 for(const [field,name] of [['color','color/welcome/language-shadow-main'],['offsetY','effect/welcome/language-shadow-y'],['radius','effect/welcome/language-shadow-blur']])main=figma.variables.setBoundVariableForEffect(main,field,variables[name]);
 const secondary=figma.variables.setBoundVariableForEffect({type:'DROP_SHADOW',color:{r:0,g:0,b:0,a:.1},offset:{x:0,y:3},radius:12,spread:0,visible:true,blendMode:'NORMAL'},'color',variables['color/welcome/language-shadow-secondary']);
 effect.effects=[main,secondary];createdStyleIds.push(effect.id);
}
return {createdNodeIds:[],mutatedNodeIds:[],createdVariableIds,createdStyleIds,variables:used,textStyles,effectStyleId:effect.id,checks:{existingValuesPreserved:true,allScopesExplicit:true,fontFamilies:['Jost','Noto Sans Arabic']}};
