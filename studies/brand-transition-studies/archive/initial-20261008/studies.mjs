export const studies=Object.freeze([
 {id:'soft',number:'01',title:'Fondu velouté',description:'Le nom s’efface doucement, puis le suivant se précise.',duration:850},
 {id:'vertical',number:'02',title:'Passage vertical',description:'Les deux noms se relaient derrière une ouverture, comme un rouleau.',duration:900},
 {id:'shared',number:'03',title:'Le R comme repère',description:'Le R reste visible, rejoint sa nouvelle place et accueille les autres lettres.',duration:1200},
 {id:'sweep',number:'04',title:'Balayage lumineux',description:'Un trait fin traverse le mot et révèle le nouveau nom sur son passage.',duration:1050},
]);
const clamp=n=>Math.min(1,Math.max(0,n));
const ease=n=>{const p=clamp(n);return p*p*(3-2*p);};

// All four studies share deterministic, reversible frames so their sliders can
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
 }
 // Endpoints are always exact: no displaced or clipped remnants, even if the
 // animation is interrupted by reduced motion or a backgrounded browser tab.
 if(p===0){state.sourceOpacity=1;state.targetOpacity=0;state.sourceBlur=0;state.sourceY=0;state.sourceClip='none';}
 if(p===1){state.sourceOpacity=0;state.targetOpacity=1;state.targetBlur=0;state.targetY=0;state.targetClip='none';}
 return state;
}

export function mountStudyGallery(doc=document){
 const view=doc.defaultView,motion=view.matchMedia('(prefers-reduced-motion: reduce)'),measure=doc.createElement('canvas').getContext('2d');
 const template=doc.getElementById('study-template'),container=doc.getElementById('studies'),announcement=doc.getElementById('announcement');
 let speed=1;
 const cards=studies.map(study=>{
  const card=template.content.firstElementChild.cloneNode(true);card.dataset.variant=study.id;
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
   if(study.id!=='shared'){layer.textContent=word;return;}
   [...word].forEach((letter,index)=>{
    const span=doc.createElement('span');span.className='glyph';span.textContent=letter;
    span.style.left=state.metrics[word]?.letters[index]+'px';if(letter==='R')span.style.visibility='hidden';layer.append(span);
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
    state.metrics[word]={letters,width:measure.measureText(word).width+(word.length-1)*spacing};
   }
   state.width=Math.max(...Object.values(state.metrics).map(metrics=>metrics.width));frame.style.width=state.width+'px';
   updateWords();paint(state.progress);
  }
  function paint(progress){
   state.progress=clamp(progress);
   const data=transitionFrame(study.id,state.progress,{forward:state.to==='AWARDS',width:state.width,fromR:state.metrics[state.from]?.letters[state.from.indexOf('R')]||0,toR:state.metrics[state.to]?.letters[state.to.indexOf('R')]||0});
   for(const [layer,which] of [[source,'source'],[target,'target']]){
    layer.style.opacity=String(data[which+'Opacity']);layer.style.transform=`translateY(${data[which+'Y']}em)`;layer.style.filter=`blur(${data[which+'Blur']}px)`;layer.style.clipPath=data[which+'Clip'];
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
