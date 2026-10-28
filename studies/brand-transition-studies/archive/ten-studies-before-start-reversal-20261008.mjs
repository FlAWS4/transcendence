export const studies=Object.freeze([
 {id:'soft',number:'01',title:'Fondu velouté',description:'Le nom s’efface doucement, puis le suivant se précise.',duration:850},
 {id:'vertical',number:'02',title:'Passage vertical',description:'Les deux noms se relaient derrière une ouverture, comme un rouleau.',duration:900},
 {id:'shared',number:'03',title:'Le R comme repère',description:'Le R reste visible, rejoint sa nouvelle place et accueille les autres lettres.',duration:1200},
 {id:'sweep',number:'04',title:'Balayage lumineux',description:'Un trait fin traverse le mot et révèle le nouveau nom sur son passage.',duration:1050},
 {id:'pivot',number:'05',title:'Pivot de face',description:'Le nom pivote dans la profondeur et présente sa nouvelle face.',duration:950},
 {id:'diagonal',number:'06',title:'Coupe diagonale',description:'Une découpe oblique remplace le nom, sans déplacer les lettres.',duration:1000},
 {id:'compress',number:'07',title:'Compression',description:'Le nom se resserre au centre, puis le suivant reprend toute sa largeur.',duration:950},
 {id:'cascade',number:'08',title:'Cascade de lettres',description:'Les lettres se retirent une à une, puis le nouveau nom se compose.',duration:1250},
 {id:'iris',number:'09',title:'Ouverture centrale',description:'Le nouveau nom apparaît au centre et s’ouvre vers les deux côtés.',duration:1100},
 {id:'shutters',number:'10',title:'Deux volets',description:'Les deux moitiés du nom s’écartent, puis les suivantes se rassemblent.',duration:1100},
]);
const clamp=n=>Math.min(1,Math.max(0,n));
const ease=n=>{const p=clamp(n);return p*p*(3-2*p);};

// All studies share deterministic, reversible frames so their sliders can
// inspect the exact animation, including a reverse triggered while it is moving.
export function transitionFrame(variant,progress,{forward=true,width=180,fromR=0,toR=0}={}){
 const p=clamp(progress),q=ease(p),direction=forward?1:-1;
 const state={progress:p,sourceOpacity:1,targetOpacity:0,sourceY:0,targetY:0,sourceBlur:0,targetBlur:0,sourceClip:'none',targetClip:'none',shared:false,sharedX:0,sharedAccent:0,sweep:false,sweepX:0,sweepOpacity:0};
 if(variant==='soft'){
  state.sourceOpacity=1-ease(p/.48);state.targetOpacity=ease((p-.52)/.48);
  state.sourceBlur=4*ease(p/.48);state.targetBlur=4*(1-ease((p-.52)/.48));
 }else if(variant==='vertical'){
  state.sourceOpacity=1;state.targetOpacity=1;
  state.sourceY=-direction*q*1.42;state.targetY=direction*(1-q)*1.42;
 }else if(variant==='shared'){
  state.sourceOpacity=1-ease(p/.3);state.targetOpacity=ease((p-.7)/.3);
  state.sourceY=-direction*.15*ease(p/.3);state.targetY=direction*.15*(1-ease((p-.7)/.3));
  state.shared=true;state.sharedX=fromR+(toR-fromR)*ease((p-.3)/.4);
  state.sharedAccent=Math.sin(Math.PI*p);
 }else if(variant==='sweep'){
  const x=width*(forward?q:1-q);
  state.sourceOpacity=1;state.targetOpacity=1;
  state.sourceClip=forward?`inset(-10px -10px -10px ${x}px)`:`inset(-10px ${width-x}px -10px -10px)`;
  state.targetClip=forward?`inset(-10px ${width-x}px -10px -10px)`:`inset(-10px -10px -10px ${x}px)`;
  state.sweep=true;state.sweepX=x;state.sweepOpacity=Math.sin(Math.PI*p);
 }else if(['pivot','diagonal','compress','cascade','iris','shutters'].includes(variant)){
  Object.assign(state,additionalFrame(variant,p,{forward,width}));
 }
 // Endpoints are always exact: no displaced or clipped remnants, even if the
 // animation is interrupted by reduced motion or a backgrounded browser tab.
 if(p===0){state.sourceOpacity=1;state.targetOpacity=0;state.sourceBlur=0;state.sourceY=0;state.sourceClip='none';}
 if(p===1){state.sourceOpacity=0;state.targetOpacity=1;state.targetBlur=0;state.targetY=0;state.targetClip='none';}
 return state;
}

// A single HORIZON→AWARDS timeline defines both directions. Reversing swaps
// layer roles at the complementary progress, keeping every visible part still.
function additionalFrame(variant,progress,{forward,width}){
 const time=forward?progress:1-progress,q=ease(time);
 const horizon={opacity:1,transform:'none',clip:'none'},awards={opacity:1,transform:'none',clip:'none'};
 if(variant==='pivot'){
  const outgoing=Math.min(90,q*180),incoming=Math.max(-90,(q-1)*180);
  horizon.opacity=time<.5?1:0;awards.opacity=time>=.5?1:0;
  horizon.transform=`perspective(5em) rotateX(${outgoing}deg)`;awards.transform=`perspective(5em) rotateX(${incoming}deg)`;
  horizon.shade=1-.24*Math.sin(outgoing*Math.PI/180);awards.shade=1+.12*Math.sin(incoming*Math.PI/180);
 }else if(variant==='diagonal'){
  const top=-32+164*q,bottom=top+32;
  horizon.clip=`polygon(${top}% -10%, 110% -10%, 110% 110%, ${bottom}% 110%)`;
  awards.clip=`polygon(-10% -10%, ${top}% -10%, ${bottom}% 110%, -10% 110%)`;
 }else if(variant==='compress'){
  horizon.opacity=time<.5?1:0;awards.opacity=time>=.5?1:0;
  horizon.transform=`scaleX(${Math.max(0,Math.cos(Math.PI*q))})`;
  awards.transform=`scaleX(${Math.max(0,-Math.cos(Math.PI*q))})`;
 }else if(variant==='cascade'){
  horizon.glyphs=[...Array(7)].map((_,index)=>{const amount=ease((time-index/6*.22)/.2);return {opacity:1-amount,y:-.26*amount};});
  awards.glyphs=[...Array(6)].map((_,index)=>{const amount=ease((time-.46-index/5*.26)/.24);return {opacity:amount,y:.26*(1-amount)};});
 }else if(variant==='iris'){
  const left=width*(1-q)/2,right=width*(1+q)/2;
  horizon.pieces=[{clip:`inset(-10px ${width-left}px -10px -10px)`,x:0},{clip:`inset(-10px -10px -10px ${right}px)`,x:0}];
  awards.pieces=[{clip:`inset(-10px ${width/2}px -10px ${left}px)`,x:0},{clip:`inset(-10px ${width-right}px -10px ${width/2}px)`,x:0}];
 }else if(variant==='shutters'){
  const outgoing=ease(time/.46),incoming=ease((time-.54)/.46);
  horizon.opacity=1-outgoing;awards.opacity=incoming;
  const halves=amount=>[{clip:'inset(-10px 50% -10px -10px)',x:-.45*amount},{clip:'inset(-10px -10px -10px 50%)',x:.45*amount}];
  horizon.pieces=halves(outgoing);awards.pieces=halves(1-incoming);
 }
 const state={};
 for(const [prefix,layer]of [['source',forward?horizon:awards],['target',forward?awards:horizon]]){
  state[prefix+'Opacity']=layer.opacity;state[prefix+'Transform']=layer.transform;state[prefix+'Clip']=layer.clip;
  if(layer.shade!==undefined)state[prefix+'Shade']=layer.shade;
  if(layer.glyphs)state[prefix+'Glyphs']=layer.glyphs;
  if(layer.pieces)state[prefix+'Pieces']=layer.pieces;
 }
 return state;
}

export function mountStudyGallery(doc=document){
 const view=doc.defaultView,motion=view.matchMedia('(prefers-reduced-motion: reduce)'),measure=doc.createElement('canvas').getContext('2d');
 const template=doc.getElementById('study-template'),container=doc.getElementById('studies'),announcement=doc.getElementById('announcement');
 let speed=1;
 const cards=studies.map(study=>{
  const card=template.content.firstElementChild.cloneNode(true);card.dataset.variant=study.id;card.id='study-'+study.id;
  const heading=card.querySelector('h2');heading.id='title-'+study.id;heading.textContent=study.title;card.setAttribute('aria-labelledby',heading.id);
  card.querySelector('.number').textContent=study.number;card.querySelector('.study-description').textContent=study.description;
  card.querySelector('.destinations').setAttribute('aria-label','Nom à afficher — '+study.title);
  const slider=card.querySelector('input'),output=card.querySelector('output');slider.id='timeline-'+study.id;output.setAttribute('for',slider.id);
  slider.setAttribute('aria-label','Déroulé — '+study.title);
  card.querySelector('.replay').setAttribute('aria-label','Rejouer — '+study.title);
  const frame=card.querySelector('.word-frame'),source=card.querySelector('.word-source'),target=card.querySelector('.word-target'),shared=card.querySelector('.shared-letter'),sweep=card.querySelector('.sweep-light'),brand=card.querySelector('.brand-demo');
  const state={from:'HORIZON',to:'AWARDS',progress:0,frameId:0,metrics:{},width:0,destroyed:false,startedAt:null,startProgress:0};
  function cancel(){if(state.frameId)view.cancelAnimationFrame(state.frameId);state.frameId=0;state.startedAt=null;}
  function setLayer(layer,word){
   layer.replaceChildren();
   if(['iris','shutters'].includes(study.id)){
    for(let index=0;index<2;index++){const span=doc.createElement('span');span.className='word-piece';span.textContent=word;layer.append(span);}return;
   }
   if(study.id!=='shared'&&study.id!=='cascade'){layer.textContent=word;return;}
   [...word].forEach((letter,index)=>{
    const span=doc.createElement('span');span.className='glyph';span.textContent=letter;
    const positions=study.id==='cascade'?state.metrics[word]?.cascadeLetters:state.metrics[word]?.letters;
    span.style.left=positions?.[index]+'px';if(study.id==='shared'&&letter==='R')span.style.visibility='hidden';layer.append(span);
   });
  }
  function updateWords(){
   setLayer(source,state.from);setLayer(target,state.to);
   const route=card.querySelector('.stage-route');route.replaceChildren(doc.createTextNode(state.from+' '));
   const arrow=doc.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');route.append(arrow,doc.createTextNode(' '+state.to));
  }
  function geometry(){
   const css=view.getComputedStyle(frame),size=parseFloat(css.fontSize),spacing=parseFloat(css.letterSpacing)||0;
   measure.font=`${css.fontWeight} ${size}px ${css.fontFamily}`;
   for(const word of ['HORIZON','AWARDS']){
    const letters=[...word].map((letter,index)=>measure.measureText(word.slice(0,index)).width+index*spacing);
    const cascadeLetters=[...word].map((letter,index)=>measure.measureText(word.slice(0,index+1)).width-measure.measureText(letter).width+index*spacing);
    state.metrics[word]={letters,cascadeLetters,width:measure.measureText(word).width+(word.length-1)*spacing};
   }
   state.width=Math.max(...Object.values(state.metrics).map(metrics=>metrics.width));frame.style.width=state.width+'px';
   updateWords();paint(state.progress);
  }
  function paint(progress){
   state.progress=clamp(progress);
   const data=transitionFrame(study.id,state.progress,{forward:state.to==='AWARDS',width:state.width,fromR:state.metrics[state.from]?.letters[state.from.indexOf('R')]||0,toR:state.metrics[state.to]?.letters[state.to.indexOf('R')]||0});
   for(const [layer,which] of [[source,'source'],[target,'target']]){
    layer.style.opacity=String(data[which+'Opacity']);layer.style.transform=data[which+'Transform']??`translateY(${data[which+'Y']}em)`;layer.style.filter=`blur(${data[which+'Blur']}px)`+(data[which+'Shade']===undefined?'':` brightness(${data[which+'Shade']})`);layer.style.clipPath=data[which+'Clip'];
    data[which+'Glyphs']?.forEach((glyph,index)=>{const span=layer.children[index];span.style.opacity=String(glyph.opacity);span.style.transform=`translateY(${glyph.y}em)`;});
    data[which+'Pieces']?.forEach((piece,index)=>{const span=layer.children[index];span.style.clipPath=piece.clip;span.style.transform=`translateX(${piece.x}em)`;});
   }
   shared.style.display=data.shared?'block':'none';shared.style.transform=`translateX(${data.sharedX}px)`;
   shared.style.color=`color-mix(in srgb, var(--study-accent) ${data.sharedAccent*100}%, var(--h42-color-text))`;
   sweep.style.display=data.sweep?'block':'none';sweep.style.transform=`translateX(${data.sweepX}px)`;sweep.style.opacity=String(data.sweepOpacity);
   const percentage=Math.round(state.progress*100);slider.value=String(percentage);output.value=percentage+' %';slider.setAttribute('aria-valuetext',`${state.from} vers ${state.to}, ${percentage} pour cent`);
   const current=state.progress===0?state.from:state.progress===1?state.to:null;
   card.dataset.phase=current?'settled':'transition';card.dataset.word=current||'';brand.setAttribute('aria-label',current?'42 '+current:`42 : ${state.from} vers ${state.to}`);
   card.querySelectorAll('[data-target]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.target===(current||(state.to)))));
  }
  function finish(){cancel();paint(1);}
  function animate(){
   cancel();state.startProgress=state.progress;
   if(motion.matches||doc.hidden){finish();return;}
   const tick=now=>{
    if(state.destroyed)return;
    if(state.startedAt===null)state.startedAt=now;
    const next=state.startProgress+(now-state.startedAt)*speed/study.duration;
    if(next>=1){finish();announcement.textContent=study.title+' : 42 '+state.to;return;}
    paint(next);state.frameId=view.requestAnimationFrame(tick);
   };
   state.frameId=view.requestAnimationFrame(tick);
  }
  function go(word){
   if(word!==state.from&&word!==state.to)return;
   if(state.progress===0&&word===state.from||state.progress===1&&word===state.to)return;
   if(word!==state.to){const previous=state.from;state.from=state.to;state.to=previous;state.progress=1-state.progress;updateWords();paint(state.progress);}
   animate();
  }
  card.querySelectorAll('[data-target]').forEach(button=>button.addEventListener('click',()=>go(button.dataset.target)));
  card.querySelector('.replay').addEventListener('click',()=>{cancel();paint(0);animate();});
  slider.addEventListener('input',()=>{cancel();paint(Number(slider.value)/100);});
  container.append(card);geometry();
  return {go,finishActive(){if(state.frameId)finish();},refresh:geometry,setSpeed(){card.querySelector('.duration').textContent=(study.duration/speed/1000).toLocaleString('fr',{maximumFractionDigits:2})+' s';if(state.frameId)animate();},destroy(){state.destroyed=true;cancel();}};
 });
 function refresh(){cards.forEach(card=>card.refresh());}
 function motionChanged(){doc.getElementById('motion-note').hidden=!motion.matches;if(motion.matches)cards.forEach(card=>card.finishActive());}
 doc.querySelectorAll('[data-all-target]').forEach(button=>button.addEventListener('click',()=>cards.forEach(card=>card.go(button.dataset.allTarget))));
 doc.getElementById('speed').addEventListener('change',event=>{speed=Number(event.target.value)||1;cards.forEach(card=>card.setSpeed());});
 const theme=doc.getElementById('theme-toggle');theme.addEventListener('click',()=>{const dark=doc.documentElement.dataset.theme!=='dark';doc.documentElement.dataset.theme=dark?'dark':'light';theme.setAttribute('aria-pressed',String(dark));theme.textContent=dark?'Passer en clair':'Passer en sombre';});
 view.addEventListener('resize',refresh);motion.addEventListener('change',motionChanged);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)cards.forEach(card=>card.finishActive());});
 doc.fonts?.ready.then(refresh);cards.forEach(card=>card.setSpeed());doc.getElementById('motion-note').hidden=!motion.matches;
 return {cards,refresh};
}
if(typeof document!=='undefined')mountStudyGallery();
