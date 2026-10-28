export const WORDMARK_DURATION=1250;
// The entrance's arrival (26 Oct 2026, refinements §R): a word comes in from an empty word as AWARDS does in the cascade,
// over the incoming part of the same timeline (from 46 % of it, where the first incoming letter starts, to its end).
const ARRIVAL_FROM=.46*WORDMARK_DURATION;
export const WORDMARK_ARRIVAL=WORDMARK_DURATION-ARRIVAL_FROM;
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>value*value*(3-2*value);

/** Study 08, expressed on one reversible HORIZON → AWARDS timeline.
 * Characters stay literal; only their opacity and vertical position change.
 * `time` is the canonical time, decreasing when returning to HORIZON. `incoming` (AWARDS's part of the timeline) is
 * also asked for HORIZON by the entrance's arrival (§R), which brings it in as AWARDS comes in. */
export function wordmarkGlyphs(word,time,incoming=word!=='HORIZON'){
 const progress=clamp(time/WORDMARK_DURATION),outgoing=!incoming;
 return Array.from(word,(character,index)=>{
  const position=index/Math.max(1,word.length-1);
  const amount=smooth(clamp(outgoing?(progress-position*.22)/.2:(progress-.46-position*.26)/.24));
  return {character,opacity:outgoing?1-amount:amount,y:outgoing?-.26*amount:.26*(1-amount)};
 });
}

/** Mount only the Latin text span, never the 42 image or the Arabic brand line.
 * setAwards(true/false,{animate:false}) supports a direct route before entrance.
 * arrive() runs the entrance's arrival of the current word (§R) and returns its duration (0: shown at once).
 * destroy() finishes the latest requested word and removes all work/listeners. */
export function mountBrandWordmark({element,brandLink=element.closest('a'),motion}={}){
 const doc=element.ownerDocument,view=doc.defaultView;
 const reduced=motion||view.matchMedia('(prefers-reduced-motion:reduce)');
 const measure=doc.createElement('canvas').getContext('2d');
 const original={width:element.style.width,ariaHidden:element.getAttribute('aria-hidden'),ariaLabel:element.getAttribute('aria-label')};
 let target=element.textContent.trim()==='AWARDS'?'AWARDS':'HORIZON';
 let position=target==='AWARDS'?1:0,cells=[],metrics,transition=null,arrival=null,frame=0,sequence=0,disposed=false;

 element.dataset.brandWordmark='true';
 if(brandLink)element.setAttribute('aria-hidden','true');
 function label(){
  const name=target==='AWARDS'?'42 Awards':'42 Horizon';
  if(brandLink)brandLink.setAttribute('aria-label',name);
  else element.setAttribute('aria-label',name);
  element.dataset.wordmarkTarget=target;
 }
 function measureWords(){
  const style=view.getComputedStyle(element),size=parseFloat(style.fontSize)||25;
  measure.font=`${style.fontStyle||'normal'} ${style.fontWeight||'500'} ${size}px ${style.fontFamily||'Jost, sans-serif'}`;
  const spacing=parseFloat(style.letterSpacing)||0;
  metrics=Object.fromEntries(['HORIZON','AWARDS'].map(word=>[word,{
   letters:Array.from(word,(character,index)=>{
    const glyphWidth=measure.measureText(character).width;
    // Prefix measurement preserves kerning when splitting the existing word.
    const left=measure.measureText(word.slice(0,index+1)).width-glyphWidth+spacing*index;
    return {character,left,width:Math.max(0,glyphWidth+spacing)};
   }),
   width:Math.max(0,measure.measureText(word).width+word.length*spacing),
  }]));
 }
 function ensureCells(count){
  while(cells.length<count){
   const cell=doc.createElement('span');cell.className='brand-wordmark-cell';cell.setAttribute('aria-hidden','true');element.append(cell);cells.push(cell);
  }
  while(cells.length>count)cells.pop().remove();
 }
 function paint(){
  const words=transition?['HORIZON','AWARDS']:[target];
  const next=words.flatMap(word=>{
   // An arrival poses the word's letters on the incoming part of the timeline (its width is the word's own).
   const poses=arrival?wordmarkGlyphs(word,arrival.time,true):wordmarkGlyphs(word,position*WORDMARK_DURATION);
   return metrics[word].letters.map((letter,index)=>({...letter,...poses[index]}));
  });
  ensureCells(next.length);
  // Change natural header width in the brief gap between the two cascades.
  // Neither the final N nor the incoming word can overhang its reserved width.
  const resize=smooth(clamp((position-.42)/.04));
  element.style.width=(metrics.HORIZON.width+(metrics.AWARDS.width-metrics.HORIZON.width)*resize)+'px';
  next.forEach((item,index)=>{
   const cell=cells[index];cell.textContent=item.character;
   cell.style.transform=`translate(${item.left}px, ${item.y}em)`;
   cell.style.width=item.width+'px';cell.style.opacity=String(item.opacity);
  });
  element.dataset.wordmarkText=next.filter(item=>item.opacity>.5).map(item=>item.character).join('');
 }
 function cancelFrame(){sequence++;if(frame)view.cancelAnimationFrame(frame);frame=0;}
 function finish(){
  cancelFrame();transition=null;arrival=null;position=target==='AWARDS'?1:0;
  measureWords();paint();element.dataset.wordmarkPhase='settled';label();
 }
 function tick(now,token){
  if(disposed||token!==sequence||!transition)return;
  frame=0;
  if(transition.start===null)transition.start=now;
  const elapsed=Math.max(0,now-transition.start);
  if(elapsed>=transition.duration){finish();return;}
  const progress=clamp(elapsed/transition.duration);
  position=transition.from+(transition.to-transition.from)*progress;paint();
  frame=view.requestAnimationFrame(time=>tick(time,token));
 }
 function setAwards(awards,{animate=true}={}){
  if(disposed)return false;
  const word=awards?'AWARDS':'HORIZON';
  if(word===target){if(!animate||reduced.matches||doc.hidden)finish();return false;}
  // Another word during an arrival: the cascade starts from the arriving word as if it had arrived.
  target=word;label();cancelFrame();arrival=null;
  const destination=target==='AWARDS'?1:0;
  if(!animate||reduced.matches||doc.hidden||position===destination){finish();return true;}
  measureWords();
  // Reverse the same timeline from the visible frame; never restart a cascade.
  transition={from:position,to:destination,start:null,duration:Math.abs(destination-position)*WORDMARK_DURATION};
  element.dataset.wordmarkPhase='switching';paint();
  const token=sequence;frame=view.requestAnimationFrame(now=>tick(now,token));return true;
 }
 /** The entrance's arrival (26 Oct 2026, refinements §R, « afficher Horizon de la même façon que AWARDS »): the current
  * word comes in from an empty word, its letters rising one after the other as AWARDS's do in the cascade, over the
  * incoming part of its timeline (WORDMARK_ARRIVAL ms), at the word's own width. Returns that duration; 0 when the word
  * shows at once (reduced motion, a hidden page). */
 function arrive(){
  if(disposed)return 0;
  cancelFrame();transition=null;position=target==='AWARDS'?1:0;
  if(reduced.matches||doc.hidden){finish();return 0;}
  measureWords();arrival={start:null,time:ARRIVAL_FROM};element.dataset.wordmarkPhase='arriving';paint();label();
  const token=sequence;frame=view.requestAnimationFrame(now=>arrivalTick(now,token));return WORDMARK_ARRIVAL;
 }
 function arrivalTick(now,token){
  if(disposed||token!==sequence||!arrival)return;
  frame=0;
  if(arrival.start===null)arrival.start=now;
  const elapsed=Math.max(0,now-arrival.start);
  if(elapsed>=WORDMARK_ARRIVAL){finish();return;}
  arrival.time=ARRIVAL_FROM+elapsed;paint();
  frame=view.requestAnimationFrame(time=>arrivalTick(time,token));
 }
 function refresh(){
  if(disposed)return;
  measureWords();paint();
 }
 function motionChanged(){if(reduced.matches&&!disposed)finish();}
 function visibilityChanged(){if(doc.hidden&&!disposed)finish();}
 element.replaceChildren();finish();
 view.addEventListener('resize',refresh);
 reduced.addEventListener('change',motionChanged);
 doc.addEventListener('visibilitychange',visibilityChanged);
 doc.fonts?.ready.then(refresh);
 return {setAwards,arrive,refresh,destroy(){
  if(disposed)return;
  finish();disposed=true;
  view.removeEventListener('resize',refresh);reduced.removeEventListener('change',motionChanged);doc.removeEventListener('visibilitychange',visibilityChanged);
  element.textContent=target;element.style.width=original.width;
  for(const key of ['brandWordmark','wordmarkTarget','wordmarkText','wordmarkPhase'])delete element.dataset[key];
  for(const [name,value]of [['aria-hidden',original.ariaHidden],['aria-label',original.ariaLabel]]){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);}
  cells=[];
 }};
}
