// Inputs SPEC, LIB, GEO and IDS are injected from the recorded source and library ledger.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('115:2'));
const roots=await Promise.all(IDS.map(id=>figma.getNodeByIdAsync(id)));
const available=await figma.listAvailableFontsAsync();
const currentFonts=roots.flatMap(r=>r.findAllWithCriteria({types:['TEXT']}).flatMap(t=>t.getStyledTextSegments(['fontName']).map(s=>s.fontName)));
const productFonts=available.filter(f=>['Jost','Noto Sans Arabic','Noto Sans','Noto Sans Symbols2'].includes(f.fontName.family)&&['Regular','Medium'].includes(f.fontName.style)).map(f=>f.fontName);
await Promise.all([...new Map([...currentFonts,...productFonts,{family:'Inter',style:'Regular'}].map(f=>[JSON.stringify(f),f])).values()].map(f=>figma.loadFontAsync(f)));
const vv=await figma.variables.getLocalVariablesAsync(); const vars=Object.fromEntries(vv.map(v=>[v.name,v]));
const fontVar=vars['i18n/font-family']||vv.find(v=>v.id==='VariableID:95:54');
const created=[],mutated=[],removed=[],result=[];
const track=n=>{created.push(n.id);return n;};
const paint=name=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',vars[name]);
const fill=(n,key)=>{n.fills=[paint(key)];};
const rgba=(hex,a=1)=>({r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255,a});
const text=async(parent,value,size=14,color='color/welcome/text',style='Regular',variable)=>{
  const t=figma.createText();parent.appendChild(t);created.push(t.id);t.fontName={family:'Jost',style};t.fontSize=size;t.characters=value;t.textAutoResize='WIDTH_AND_HEIGHT';t.lineHeight={unit:'PIXELS',value:size*1.45};fill(t,color);if(fontVar&&variable)t.setBoundVariable('fontFamily',fontVar);if(variable)t.setBoundVariable('characters',vars[variable]||vv.find(v=>v.id===variable));return t;
};
const instance=async(id,parent,name)=>{const c=await figma.getNodeByIdAsync(id);const n=c.createInstance();parent.appendChild(n);n.name=name||c.name;track(n);return n;};
const clear=n=>{removed.push(n.id);n.remove();};
for(const root of roots){
  const mobile=root.width<500,rtl=root.name.includes('RTL');const W=root.width,H=root.height;
  const oldGlobe=root.children.find(n=>n.name==='Monde');const oldMask=root.children.find(n=>n.name==='Le monde rejoint le menu');const oldMenu=root.children.find(n=>n.name==='Menu');
  const logo=root.children.find(n=>n.name==='42');const horizon=root.children.find(n=>n.name==='HORIZON · Alignment');const utils=root.children.find(n=>n.name==='Commandes');
  if(!oldGlobe||!oldMenu||!logo||!horizon||!utils)throw new Error('Unexpected existing welcome '+root.id);
  const utilityReactions=Object.fromEntries(utils.children.map(n=>[n.name,n.reactions]));
  fill(root,'color/welcome/bg');mutated.push(root.id);root.clipsContent=true;
  clear(oldGlobe);if(oldMask)clear(oldMask);clear(oldMenu);
  const atmosphere=figma.createRectangle();root.insertChild(0,atmosphere);created.push(atmosphere.id);atmosphere.name='Atmosphère · accueil';atmosphere.resize(W,H);
  const stop=(position,key)=>({position,color:{r:1,g:1,b:1,a:1},boundVariables:{color:figma.variables.createVariableAlias(vars[key])}});
  atmosphere.fills=[{type:'GRADIENT_LINEAR',gradientTransform:[[.6,.8,-.2],[-.8,.6,.5]],gradientStops:[stop(0,'color/welcome/background-highlight'),stop(1,'color/welcome/bg')]}];
  for(const [name,col,cx,cy,rx,ry,a] of [['Lueur turquoise','#00BABC',mobile?.83:.77,mobile?.39:.42,.65,.65,.071],['Lueur rose','#EC3391',mobile?.03:.08,mobile?.86:.97,.60,.65,.045]]){
    const halo=figma.createRectangle();root.insertChild(1,halo);created.push(halo.id);halo.name=name;halo.resize(W,H);halo.fills=[{type:'GRADIENT_RADIAL',gradientTransform:[[1/(2*rx),0,.5-cx/(2*rx)],[0,1/(2*ry),.5-cy/(2*ry)]],gradientStops:[{position:0,color:rgba(col,a)},{position:1,color:rgba(col,0)}]}];
  }
  const geo=await instance(LIB.worldGeo[mobile?'Mobile':'Desktop'],root,'Monde · géographie précise');const view=GEO.views[mobile?'mobile':'desktop'];geo.rescale(view.diameter/geo.width);geo.x=mobile?195-view.diameter/2:(rtl?473.04:966.96)-view.diameter/2;geo.y=mobile?384.5-view.diameter/2:542-view.diameter/2;
  const pins=figma.createFrame();root.appendChild(pins);created.push(pins.id);pins.name='Pays · repères';pins.resize(W,H);pins.fills=[];pins.clipsContent=false;
  const labelCountries=new Set(mobile?['LUX','MAR','PSE','AGO']:['CAN','ITA','MAR','PSE','BRA','AGO','MDG']);
  for(const marker of view.markers.filter(m=>m.visible)){
    const mx=marker.globeLocal[0]+geo.x,my=marker.globeLocal[1]+geo.y;
    const dot=figma.createEllipse();pins.appendChild(dot);created.push(dot.id);dot.name='Pays · '+marker.id;dot.resize(8,8);dot.x=mx-4;dot.y=my-4;fill(dot,'color/welcome/pin');dot.effects=[{type:'DROP_SHADOW',color:rgba('#ED3491',.25),offset:{x:0,y:0},radius:6,spread:3,visible:true,blendMode:'NORMAL'}];
    if(labelCountries.has(marker.id)){
      const bubble=figma.createAutoLayout('HORIZONTAL');pins.appendChild(bubble);created.push(bubble.id);bubble.name='Libellé pays · '+marker.id;bubble.paddingLeft=22;bubble.paddingRight=15;bubble.paddingTop=12;bubble.paddingBottom=12;bubble.cornerRadius=28;fill(bubble,'color/welcome/surface');bubble.strokes=[paint('color/welcome/scope-border')];bubble.strokeWeight=1;bubble.counterAxisAlignItems='CENTER';bubble.effectStyleId=LIB.effectStyles.Scope;
      let v=vars['i18n/welcome/country/'+marker.id];if(!v){const coll=await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:95:2');v=figma.variables.createVariable('i18n/welcome/country/'+marker.id,coll,'STRING');v.scopes=['TEXT_CONTENT'];v.setVariableCodeSyntax('WEB','countryLabel('+JSON.stringify(marker.id)+')');for(const [lang,mode]of [['fr','95:0'],['en','95:1'],['ar','95:2']])v.setValueForMode(mode,marker.labels[lang]);vars[v.name]=v;}
      const t=await text(bubble,marker.labels.fr,mobile?12:14,'color/welcome/text','Medium',v.name);t.lineHeight={unit:'PIXELS',value:18};bubble.x=mx-13;bubble.y=my-bubble.height/2;pins.appendChild(dot);
    }
  }
  // Retain logo and Horizon instances and their original entry/language bindings.
  const scale=(mobile?45:58)/(mobile?48:60);logo.rescale(scale);const brandW=mobile?138.2:187.1;const brandX=rtl?W-(mobile?22:48)-brandW:(mobile?22:48);const sy=mobile?15:19.333333;
  logo.x=brandX-sy;logo.y=(mobile?46:62)-logo.height/2;mutated.push(logo.id,...logo.findAll(()=>true).map(n=>n.id));
  const hInstance=horizon.children.find(n=>n.type==='INSTANCE');
  for(const t of hInstance.findAllWithCriteria({types:['TEXT']})){
    const arabic=/[\u0600-\u06FF]/.test(t.characters);t.setBoundVariable('fontSize',null);t.setBoundVariable('lineHeight',null);t.fontSize=arabic?(mobile?11:14):(mobile?18:25);t.lineHeight={unit:'PIXELS',value:arabic?(mobile?16.5:21):(mobile?20.7:28.75)};t.letterSpacing={unit:'PIXELS',value:arabic?0:(mobile?-.63:-.875)};mutated.push(t.id);
  }
  horizon.x=brandX+(mobile?45+16:58+22);horizon.y=(mobile?46:62)-horizon.height/2;mutated.push(horizon.id,hInstance.id);
  // Replace utility visuals while preserving the original destinations.
  const oldLanguage=utils.children.find(n=>n.name==='Action · FR');for(const c of [...utils.children])if(c!==oldLanguage)clear(c);utils.layoutMode='HORIZONTAL';utils.itemSpacing=mobile?2:14;utils.primaryAxisSizingMode='AUTO';utils.counterAxisSizingMode='AUTO';utils.fills=[];
  const utilKinds=rtl?['Profil','Thème','Action · FR']:['Action · FR','Thème','Profil'];
  for(const name of utilKinds){
    let btn;
    if(name==='Action · FR'){
      btn=oldLanguage;utils.appendChild(btn);btn.resize(mobile?40:44,44);btn.fills=[];btn.strokes=[];
      for(const t of btn.findAllWithCriteria({types:['TEXT']})){t.setBoundVariable('fontSize',null);t.fontSize=14;fill(t,'color/welcome/text');mutated.push(t.id);}
      mutated.push(btn.id);
    }else{
      btn=await instance(LIB.iconButton[mobile?'Small':'Regular'],utils,name);btn.resize(mobile?40:44,44);const icon=btn.findAllWithCriteria({types:['INSTANCE']})[0];if(icon)icon.swapComponent(await figma.getNodeByIdAsync(LIB.icons[name==='Profil'?'i-user':'i-moon']));
    }
    await btn.setReactionsAsync((utilityReactions[name]||[]).filter(r=>r.trigger?.type!=='ON_HOVER'));
  }
  utils.x=rtl?(mobile?22:48):W-(mobile?22:48)-utils.width;utils.y=mobile?24:40;mutated.push(utils.id);
  const nav=await instance(LIB.navigation[(mobile?'Mobile':'Desktop')+'|'+(rtl?'RTL':'LTR')+'|explore'],root,'Navigation principale');nav.x=mobile?20:(rtl?W-48-248:48);nav.y=mobile?744:(H-nav.height)/2;
  const scope=await instance(LIB.scope[(mobile?'Mobile':'Desktop')+'|'+(rtl?'RTL':'LTR')],root,'Chemin géographique');scope.x=(mobile?195:(rtl?475.2:964.8))-scope.width/2;scope.y=mobile?107:130;
  const footer=figma.createAutoLayout(mobile?'VERTICAL':'HORIZONTAL');root.appendChild(footer);created.push(footer.id);footer.name='Commandes du globe';footer.fills=[];footer.itemSpacing=mobile?13:24;footer.counterAxisAlignItems='CENTER';
  const hint=await text(footer,'Fais tourner, puis choisis un pays.',14,'color/welcome/muted','Regular','i18n/welcome/hint');
  const controls=await instance(LIB.controls[mobile?'Mobile':'Desktop'],footer,'Zoom');footer.x=(mobile?195:(rtl?475.2:964.8))-footer.width/2;footer.y=H-(mobile?137:50)-footer.height;
  const note=await text(root,'Exploration · 42 Horizon',mobile?10:12,'color/welcome/muted','Regular','i18n/welcome/prototype');note.name='À propos du prototype';note.x=mobile?(W-note.width)/2:(rtl?W-56-note.width:56);note.y=H-(mobile?112:48)-note.height;
  const attribution=await text(root,'Natural Earth · OpenFreeMap · © OpenMapTiles · OpenStreetMap',mobile?6:9,'color/welcome/muted');attribution.name='Sources géographiques';attribution.x=mobile?(W-attribution.width)/2:W-40-attribution.width;attribution.y=H-10-attribution.height;
  root.placeholder=false;result.push({id:root.id,nav:nav.id,scope:scope.id,geo:geo.id,pins:pins.id,controls:controls.id,footer:footer.id,mobile,rtl,bounds:{w:W,h:H},gap:geo.y-scope.y-scope.height});
}
return {createdNodeIds:created,mutatedNodeIds:mutated,removedNodeIds:removed,frames:result};
