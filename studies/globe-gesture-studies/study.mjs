import {attachPressGesture} from './press-gesture.mjs?v=1';

// This adapter belongs only to the frozen study. The live prototype is untouched.
const variant=['1','2','3'].includes(new URLSearchParams(location.search).get('variant'))?new URLSearchParams(location.search).get('variant'):'1';
const root=document.documentElement;
for(let n=0;n<200&&!window.horizonStudy;n++)await new Promise(resolve=>setTimeout(resolve,25));
if(!window.horizonStudy)throw new Error('Le socle des essais n’a pas pu démarrer.');
const app=document.getElementById('app'),stage=document.getElementById('globe');
const originalGroup=document.querySelector('#main > .globe-footer .globe-controls');
const originals={out:document.getElementById('zoom-out'),world:document.getElementById('reset'),in:document.getElementById('zoom-in')};
const storageKey='horizon-globe-controls-study-20261013-pinned';
let pinned=false;try{pinned=localStorage.getItem(storageKey)==='true';}catch{}
let open=false,reason='',hold=false,holdOrigin=null,holdMoved=false,lastAnchor=null,closeTimer=0,announceTimer=0,hoverSuppressed=false;
let available=true,previousLocale='',lastPosition='',lastState='';
const copy={
 fr:{names:['Gestes directs','Halo à découvrir','Sous le doigt'],controls:'Commandes du globe',close:'Fermer les commandes',move:'Déplacer sans glisser',north:'Déplacer la vue vers le haut',south:'Déplacer la vue vers le bas',west:'Déplacer la vue vers la gauche',east:'Déplacer la vue vers la droite',world:'Revenir au Monde',pin:'Toujours afficher les commandes',guide:'Essai {n} · Mode d’emploi',helpTitle:'Essai {n} — {name}',intro:['Glisse pour tourner. Utilise la molette ou pince pour zoomer. Le petit globe du filtre te ramène au Monde.','Survole ou touche la poignée au bord du globe. Les commandes se déploient en arc et restent disponibles tant que tu les utilises.','Maintiens une zone vide de la carte un instant. Relâche puis touche une commande, ou glisse vers elle avant de relâcher. Un glissement ordinaire reste une rotation.'],access:'Tous les gestes ont une alternative : ouvre Commandes du globe pour zoomer et déplacer la vue par simples clics. Au clavier, Tab rejoint le globe ; les flèches déplacent, + et − zooment, Début revient au Monde et Entrée ouvre les commandes. Échap ferme les commandes.',compare:'Comparer les trois essais',back:'Revenir au globe',changed:'Vue déplacée.',zoomed:'Zoom ajusté.',returned:'Retour au Monde.',holdHelp:'Appui prolongé facultatif. Entrée ou le bouton Commandes ouvre aussi les commandes.',stageHelp:'Entrée ouvre les commandes du globe. Les gestes ont des alternatives par simple clic.',studyNote:'Essais locaux · interface active conservée'},
 en:{names:['Direct gestures','Discoverable halo','At your fingertip'],controls:'Globe controls',close:'Close controls',move:'Move without dragging',north:'Move the view up',south:'Move the view down',west:'Move the view left',east:'Move the view right',world:'Back to World',pin:'Always show controls',guide:'Study {n} · How to use',helpTitle:'Study {n} — {name}',intro:['Drag to turn. Use the wheel or pinch to zoom. The small globe in the filter returns to World.','Hover over or tap the handle at the globe’s edge. Controls unfold in an arc and stay available while you use them.','Hold an empty area of the map briefly. Release and tap a control, or slide to one before releasing. Ordinary dragging still turns the globe.'],access:'Every gesture has an alternative: open Globe controls to zoom and move using single clicks. Keyboard: Tab reaches the globe; arrows move, + and − zoom, Home returns to World and Enter opens controls. Escape closes controls.',compare:'Compare all three studies',back:'Return to globe',changed:'View moved.',zoomed:'Zoom adjusted.',returned:'Returning to World.',holdHelp:'Long press is optional. Enter or the Controls button also opens controls.',stageHelp:'Enter opens globe controls. Every gesture has a single-click alternative.',studyNote:'Local studies · main interface preserved'},
 ar:{names:['إيماءات مباشرة','هالة تفاعلية','تحت الإصبع'],controls:'أدوات الكرة الأرضية',close:'إغلاق الأدوات',move:'تحريك دون سحب',north:'تحريك العرض إلى الأعلى',south:'تحريك العرض إلى الأسفل',west:'تحريك العرض إلى اليسار',east:'تحريك العرض إلى اليمين',world:'العودة إلى العالم',pin:'إظهار الأدوات دائمًا',guide:'تجربة {n} · طريقة الاستخدام',helpTitle:'تجربة {n} — {name}',intro:['اسحب للتدوير واستخدم العجلة أو إصبعين للتكبير. تعيدك الكرة الصغيرة في المرشح إلى العالم.','مرّر المؤشر أو المس المقبض عند حافة الكرة. تظهر الأدوات على قوس وتبقى ظاهرة أثناء استخدامها.','اضغط مطولًا على مساحة فارغة في الخريطة. ارفع إصبعك ثم اختر أداة، أو اسحب إليها قبل الرفع. السحب العادي يستمر في تدوير الكرة.'],access:'لكل إيماءة بديل: افتح أدوات الكرة الأرضية للتكبير والتحريك بنقرات بسيطة. استخدم Tab للوصول إلى الكرة، والأسهم للتحريك، و+ و− للتكبير، وHome للعودة إلى العالم، وEnter لفتح الأدوات، وEscape لإغلاقها.',compare:'مقارنة التجارب الثلاث',back:'العودة إلى الكرة',changed:'تم تحريك العرض.',zoomed:'تم ضبط التكبير.',returned:'العودة إلى العالم.',holdHelp:'الضغط المطول اختياري. يمكن فتح الأدوات عبر Enter أو زر الأدوات.',stageHelp:'يفتح Enter الأدوات. لكل إيماءة بديل بنقرة بسيطة.',studyNote:'تجارب محلية · الواجهة الحالية محفوظة'}
};
const t=()=>copy[root.lang]||copy.fr;
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;};
const button=(className,label)=>{const node=el('button',className,label);node.type='button';return node;};
const icon=id=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS(svg.namespaceURI,'use');svg.setAttribute('aria-hidden','true');use.setAttribute('href','#i-'+id);svg.append(use);return svg;};
const layer=el('div','study-layer');layer.id='study-layer';layer.dataset.variant=variant;
const trigger=button('study-trigger');trigger.id='study-trigger';trigger.setAttribute('aria-controls','study-palette');trigger.setAttribute('aria-expanded','false');
trigger.append(el('span','study-trigger-mark','⋮'),el('span','study-trigger-label'));
const palette=el('section','study-palette');palette.id='study-palette';palette.hidden=true;palette.inert=true;palette.setAttribute('aria-labelledby','study-palette-title');
const paletteTop=el('div','study-palette-top'),paletteTitle=el('h2');paletteTitle.id='study-palette-title';
const closer=button('study-close','×');paletteTop.append(paletteTitle,closer);
originalGroup.classList.add('study-zoom');originalGroup.setAttribute('role','group');
originalGroup.replaceChildren(originals.out,originals.world,originals.in);
for(const [key,node]of Object.entries(originals)){node.dataset.studyAction=key;node.title=node.getAttribute('aria-label');}
const moveLabel=el('p','study-move-label');moveLabel.id='study-move-label';
const moveGroup=el('div','study-directions');moveGroup.setAttribute('role','group');moveGroup.setAttribute('aria-labelledby',moveLabel.id);
const directions=[['west','ArrowLeft','←'],['north','ArrowUp','↑'],['south','ArrowDown','↓'],['east','ArrowRight','→']];
for(const [name,key,glyph] of directions){const node=button('study-direction',glyph);node.dataset.direction=name;node.dataset.key=key;moveGroup.append(node);node.addEventListener('click',()=>{stage.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));say(t().changed);});}
const pinLabel=el('label','study-pin'),pin=el('input');pin.type='checkbox';pin.checked=pinned;const pinText=el('span');pinLabel.append(pin,pinText);
palette.append(paletteTop,originalGroup,moveLabel,moveGroup,pinLabel);
layer.append(trigger,palette);document.body.append(layer);

// Keep the measured 32px docking anchor intact inside a separate 44px target.
const medallion=document.getElementById('scope-medallion');
const worldReturn=button('study-world-return');worldReturn.id='study-world-return';medallion.before(worldReturn);worldReturn.append(medallion);medallion.append(icon('globe'));
worldReturn.addEventListener('click',()=>{originals.world.click();say(t().returned);});
const help=el('p','sr-only');help.id='study-stage-help';document.body.append(help);stage.setAttribute('aria-describedby',help.id);
const live=el('p','sr-only');live.setAttribute('role','status');live.setAttribute('aria-live','polite');document.body.append(live);
function say(message){clearTimeout(announceTimer);live.textContent='';announceTimer=setTimeout(()=>live.textContent=message,120);}
for(const [action,node]of Object.entries(originals))node.addEventListener('click',()=>{say(action==='world'?t().returned:t().zoomed);});

const guideButton=button('study-guide-button');guideButton.id='study-guide-button';document.body.append(guideButton);
const guide=el('dialog','study-guide');guide.id='study-guide';guide.setAttribute('aria-labelledby','study-guide-title');
const guideTitle=el('h2');guideTitle.id='study-guide-title';const intro=el('p'),access=el('p'),studyNote=el('p','study-note');
const guidePinLabel=el('label','study-pin'),guidePin=el('input'),guidePinText=el('span');guidePin.type='checkbox';guidePinLabel.append(guidePin,guidePinText);
const compare=el('a','study-compare');compare.href='../index.html';const returnButton=button('study-guide-return');
guide.append(guideTitle,intro,access,guidePinLabel,compare,studyNote,returnButton);document.body.append(guide);
guideButton.addEventListener('click',()=>{closeControls({restore:false,temporary:true});guide.showModal();returnButton.focus();syncAvailability();});
returnButton.addEventListener('click',()=>guide.close());guide.addEventListener('close',()=>{syncAvailability();guideButton.focus({preventScroll:true});});
function setPinned(value){pinned=Boolean(value);pin.checked=guidePin.checked=pinned;try{localStorage.setItem(storageKey,String(pinned));}catch{}if(pinned&&available)openControls('pinned');else if(!pinned&&reason==='pinned')reason='manual';}
pin.addEventListener('change',()=>setPinned(pin.checked));guidePin.addEventListener('change',()=>setPinned(guidePin.checked));

function localize(){
 const c=t();trigger.setAttribute('aria-label',c.controls);trigger.title=c.controls;trigger.querySelector('.study-trigger-label').textContent=c.controls;
 paletteTitle.textContent=c.controls;closer.setAttribute('aria-label',c.close);closer.title=c.close;originalGroup.setAttribute('aria-label',c.controls);
 moveLabel.textContent=c.move;for(const node of moveGroup.children){node.setAttribute('aria-label',c[node.dataset.direction]);node.title=c[node.dataset.direction];}
 worldReturn.setAttribute('aria-label',c.world);worldReturn.title=c.world;pinText.textContent=guidePinText.textContent=c.pin;guidePin.checked=pinned;
 guideButton.textContent=c.guide.replace('{n}',variant);guideTitle.textContent=c.helpTitle.replace('{n}',variant).replace('{name}',c.names[Number(variant)-1]);intro.textContent=c.intro[Number(variant)-1];access.textContent=c.access;compare.textContent=c.compare;returnButton.textContent=c.back;studyNote.textContent=c.studyNote;
 help.textContent=variant==='3'?c.holdHelp:c.stageHelp;document.title='Horizon · '+c.helpTitle.replace('{n}',variant).replace('{name}',c.names[Number(variant)-1]);
 for(const node of Object.values(originals))node.title=node.getAttribute('aria-label');
}
function openControls(source='manual',anchor=null,focus=false){
 if(!available)return;clearTimeout(closeTimer);reason=source;lastAnchor=anchor;open=true;palette.hidden=false;palette.inert=false;trigger.setAttribute('aria-expanded','true');layer.dataset.open='true';
 palette.dataset.layout=variant==='2'&&!pinned?'halo':variant==='3'&&!pinned?'radial':'panel';
 position();if(focus)([...originalGroup.querySelectorAll('button'),...moveGroup.children].find(node=>!node.disabled)||closer).focus({preventScroll:true});
}
function endHold(){if(hold){hold=false;window.horizonStudy.globe?.endControlGesture();}for(const node of originalGroup.children)node.classList.remove('study-target');}
function closeControls({restore=false,temporary=false}={}){
 clearTimeout(closeTimer);if(!open)return;const hadFocus=palette.contains(document.activeElement);open=false;endHold();palette.hidden=true;palette.inert=true;trigger.setAttribute('aria-expanded','false');layer.dataset.open='false';lastAnchor=null;
 if(!temporary&&pinned)setPinned(false);if((restore||hadFocus)&&available)trigger.focus({preventScroll:true});
}
function scheduleClose(){clearTimeout(closeTimer);if(reason!=='hover'||pinned)return;closeTimer=setTimeout(()=>{if(!palette.matches(':hover')&&!trigger.matches(':hover')&&!palette.contains(document.activeElement)&&document.activeElement!==trigger)closeControls();},500);}
trigger.addEventListener('click',()=>{hoverSuppressed=false;if(open&&reason!=='hover'&&reason!=='focus')closeControls({restore:true});else openControls(pinned?'pinned':'manual',null,true);});
closer.addEventListener('click',()=>{hoverSuppressed=true;closeControls({restore:true});});
if(variant==='2'){
 trigger.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&!hoverSuppressed&&!open)openControls('hover');clearTimeout(closeTimer);});
 trigger.addEventListener('pointerleave',()=>{hoverSuppressed=false;scheduleClose();});
 document.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'&&hoverSuppressed&&!trigger.contains(event.target)&&(!open||!palette.contains(event.target)))hoverSuppressed=false;},true);
 trigger.addEventListener('focus',()=>{if(!hoverSuppressed&&!open)openControls('focus');});
 palette.addEventListener('pointerenter',()=>clearTimeout(closeTimer));palette.addEventListener('pointerleave',scheduleClose);
}
palette.addEventListener('focusout',()=>{if(reason==='focus')setTimeout(()=>{if(!palette.contains(document.activeElement)&&document.activeElement!==trigger&&!pinned)closeControls();},0);});
document.addEventListener('pointerdown',event=>{if(open&&!pinned&&!hold&&!palette.contains(event.target)&&!trigger.contains(event.target))closeControls({restore:false});},true);
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&open){event.preventDefault();event.stopImmediatePropagation();hoverSuppressed=true;press?.cancel();closeControls({restore:true});trigger.focus({preventScroll:true});return;}
 if(event.target===stage&&['Enter',' '].includes(event.key)&&available){event.preventDefault();event.stopImmediatePropagation();openControls('manual',null,true);}
},true);

function selectedAction(point){return [...originalGroup.children].find(node=>{const r=node.getBoundingClientRect();return !node.disabled&&point.x>=r.left-5&&point.x<=r.right+5&&point.y>=r.top-5&&point.y<=r.bottom+5;});}
const press=variant==='3'?attachPressGesture({surface:stage,
 canStart:event=>available&&!open&&!pinned&&Boolean(window.horizonStudy.globe)&&!window.horizonStudy.globe.getNavigationState().inFlight&&!event.target.closest('button,a,input,select,[role=button]'),
 onOpen:point=>{hold=true;holdOrigin=point;holdMoved=false;window.horizonStudy.globe.beginControlGesture();openControls('hold',point);},
 onMove:point=>{holdMoved||=Math.hypot(point.x-holdOrigin.x,point.y-holdOrigin.y)>18;const selected=holdMoved?selectedAction(point):null;for(const node of originalGroup.children)node.classList.toggle('study-target',node===selected);},
 onCommit:point=>{const selected=holdMoved?selectedAction(point):null;endHold();reason='manual';if(selected){selected.click();closeControls();stage.focus({preventScroll:true});}},
 onCancel:()=>{endHold();closeControls({restore:false,temporary:true});}
}):null;

function syncAvailability(){
 const otherOverlay=Boolean(document.querySelector('dialog[open], #scope-popover:not([hidden]), #account-menu:not([hidden])'))||document.querySelector('.dock-shell')?.dataset.searchOpen==='true';
 const next=app.dataset.section==='explore'&&stage.parentElement?.id==='main'&&!otherOverlay;
 if(!next&&open){press?.cancel();closeControls({restore:false,temporary:true});}
 available=next;layer.hidden=!next;layer.inert=!next;guideButton.hidden=otherOverlay&&!guide.open;worldReturn.disabled=app.dataset.section!=='explore'||originals.world.disabled;
 if(!next&&layer.contains(document.activeElement))document.getElementById('scope-picker').focus({preventScroll:true});
 if(next&&pinned&&!open)openControls('pinned');
}
function position(){
 if(!available)return;
 const w=innerWidth,h=innerHeight,scope=document.getElementById('scope-bar').getBoundingClientRect(),dock=document.querySelector('.dock-shell')?.getBoundingClientRect();
 const dockTop=dock?.top||h-80;const upper=scope.bottom+12,lower=Math.max(upper+44,dockTop-62);
 // Real projected silhouette, with a stable edge fallback at country/campus level.
 const geometry=window.horizonStudy.globe?.getWorldScreenGeometry();
 let x=w-35,y=Math.min(lower-30,h*.59);
 if(variant==='2'&&geometry){x=geometry.center.x+geometry.radius*.90+10;y=geometry.center.y+geometry.radius*.32;}
 x=Math.max(32,Math.min(w-32,x));y=Math.max(upper+28,Math.min(lower-30,y));
 const trW=variant==='2'?48:Math.min(154,w*.45);const tx=Math.max(12,Math.min(w-trW-12,x-trW/2));
 trigger.style.left=tx+'px';trigger.style.top=(y-24)+'px';trigger.style.width=trW+'px';
 // Keep status and retry separate from all control geometry.
 document.querySelector('#main > .globe-footer').style.setProperty('--study-status-y',(scope.bottom+10)+'px');
 if(!open)return;
 const rect=palette.getBoundingClientRect();let px,py;
 if(lastAnchor&&variant==='3'&&!pinned){px=lastAnchor.x-rect.width/2;py=lastAnchor.y-80;}
 else if(variant==='2'&&!pinned){px=tx-rect.width-8;py=y-rect.height/2;}
 else{px=tx+trW-rect.width;py=y-rect.height-36;}
 // Low landscape windows use the full central height, remaining scrollable.
 const minY=h<520?64:Math.min(upper+32,180),maxY=Math.max(minY,dockTop-62-rect.height);
 px=Math.max(12,Math.min(w-rect.width-12,px));py=Math.max(minY,Math.min(maxY,py));
 const key=[px,py,rect.width,rect.height].join(':');if(key!==lastPosition){palette.style.left=px+'px';palette.style.top=py+'px';lastPosition=key;}
}
function refresh(){
 if(document.hidden)return;
 if(previousLocale!==root.lang){previousLocale=root.lang;localize();}
 syncAvailability();
 const state=window.horizonStudy.globe?.getNavigationState();const locked=!state||state.inFlight;
 for(const node of moveGroup.children)node.disabled=locked;
 const next=JSON.stringify([innerWidth,innerHeight,state?.center,state?.zoom,state?.level,open,pinned,app.dataset.section,root.lang]);
 if(next!==lastState){lastState=next;position();}
}
const appObserver=new MutationObserver(refresh);appObserver.observe(app,{attributes:true,attributeFilter:['data-section']});
const disabledObserver=new MutationObserver(()=>{worldReturn.disabled=app.dataset.section!=='explore'||originals.world.disabled;for(const node of Object.values(originals))node.title=node.getAttribute('aria-label');});
for(const node of Object.values(originals))disabledObserver.observe(node,{attributes:true,attributeFilter:['disabled','aria-label']});
root.dataset.globeStudy=variant;localize();refresh();
const refreshInterval=setInterval(refresh,180);addEventListener('resize',()=>{
 // The halo follows projected coordinates. Refresh that projection before
 // placing its handle; MapLibre's queued resize can still describe the old
 // viewport here, making the handle move again after the user targets it.
 if(variant==='2')window.horizonStudy.globe?.refreshLayout({animate:false});
 lastState='';refresh();
});
addEventListener('pagehide',event=>{press?.cancel();clearTimeout(closeTimer);clearTimeout(announceTimer);if(event.persisted)return;clearInterval(refreshInterval);press?.destroy();appObserver.disconnect();disabledObserver.disconnect();});
addEventListener('pageshow',()=>{lastState='';refresh();});
window.horizonControlsStudy={get state(){return {variant,open,pinned,available,reason,hold};}};
