const page=await figma.getNodeByIdAsync('5:3');await figma.setCurrentPageAsync(page);
for(const family of ['Jost','Noto Sans Arabic','Noto Sans'])for(const style of ['Regular','Medium'])await figma.loadFontAsync({family,style});
const variables=Object.fromEntries((await figma.variables.getLocalVariablesAsync()).map(v=>[v.name,v]));
const styles=await figma.getLocalTextStylesAsync();const effect=(await figma.getLocalEffectStylesAsync()).find(s=>s.name==='42/Welcome/Language menu');
const createdNodeIds=[],components=[];
function track(n){createdNodeIds.push(n.id);return n;}
function bind(n,field,name){n.setBoundVariable(field,variables[name]);}
function paint(name){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',variables[name]);}
const check=await figma.getNodeByIdAsync('47:32');
const right=Math.max(...page.children.map(n=>n.x+n.width));
for(const direction of ['LTR','RTL']){
 const component=track(figma.createComponent());component.name=`Direction=${direction}`;component.description='Compact language list aligned below the language control. Theme and selected locale inherit shared variables. Rows are 42px; menu is 176px. Native labels remain in their own script.';
 component.x=right+80+(direction==='RTL'?216:0);component.y=900;component.layoutMode='VERTICAL';component.resize(176,140);component.primaryAxisSizingMode='AUTO';component.counterAxisSizingMode='FIXED';
 for(const field of ['paddingLeft','paddingRight','paddingTop','paddingBottom']){component[field]=6;bind(component,field,'space/6');}
 component.itemSpacing=0;bind(component,'itemSpacing','space/0');component.cornerRadius=18;bind(component,'cornerRadius','radius/18');component.fills=[paint('color/welcome/surface')];component.strokes=[paint('color/welcome/language-border')];component.strokeWeight=1;component.strokeAlign='INSIDE';await component.setEffectStyleIdAsync(effect.id);component.clipsContent=false;
 for(const [locale,label] of [['fr','Français'],['en','English'],['ar','العربية']]){
  const row=track(figma.createAutoLayout('HORIZONTAL'));row.name=`Langue · ${locale}`;component.appendChild(row);row.resize(162,42);row.layoutSizingHorizontal='FILL';row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';row.counterAxisAlignItems='CENTER';row.primaryAxisAlignItems='SPACE_BETWEEN';row.paddingLeft=12;row.paddingRight=12;bind(row,'paddingLeft','space/12');bind(row,'paddingRight','space/12');row.itemSpacing=16;bind(row,'itemSpacing','space/16');row.cornerRadius=12;bind(row,'cornerRadius','radius/12');row.fills=[paint(`i18n/welcome/language/${locale}/background`)];
  const text=track(figma.createText());text.name='Native language';await text.setTextStyleIdAsync(styles.find(s=>s.name===`42/Welcome/Language ${locale==='ar'?'Arabic':'Latin'}`).id);text.characters=label;text.textAutoResize='WIDTH_AND_HEIGHT';text.fills=[paint(`i18n/welcome/language/${locale}/text`)];bind(text,'fontWeight',`i18n/welcome/language/${locale}/weight`);
  const icon=track(check.createInstance());icon.name='Selected language';icon.rescale(2/3);bind(icon,'opacity',`i18n/welcome/language/${locale}/check`);
  for(const n of icon.findAll(n=>true)){createdNodeIds.push(n.id);if('strokes' in n&&Array.isArray(n.strokes)&&n.strokes.length)n.strokes=n.strokes.map(p=>p.type==='SOLID'?paint(`i18n/welcome/language/${locale}/text`):p);if(n.type==='FRAME')n.fills=[];}
  for(const node of direction==='RTL'?[icon,text]:[text,icon])row.appendChild(node);
 }
 components.push(component);
}
const set=track(figma.combineAsVariants(components,page));set.name='Welcome/LanguageMenu';set.description='Anchored language menu replacing the centered selector on the active immersive route. Direction controls row order; shared locale variables control check, accent, and weight. Light/dark modes inherit the screen theme.';set.x=right+80;set.y=900;set.layoutMode='HORIZONTAL';set.itemSpacing=40;set.paddingLeft=24;set.paddingRight=24;set.paddingTop=24;set.paddingBottom=24;set.primaryAxisSizingMode='AUTO';set.counterAxisSizingMode='AUTO';set.fills=[];
return{createdNodeIds,mutatedNodeIds:[],setId:set.id,components:components.map(n=>({id:n.id,name:n.name,width:n.width,height:n.height,rows:n.children.map(r=>({id:r.id,name:r.name,width:r.width,height:r.height}))}))};
