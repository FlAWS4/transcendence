import {ALPHABET,KEY,encrypt} from '../horizon-decryption-engine.mjs';
import {resolutionOrder} from '../decryption-examples/scanner-return-together.mjs';

export const WORDMARK_DURATION=1600;
const FIRST_SETTLE=1100;
const clamp=value=>Math.max(0,Math.min(1,value));

/** Same alphabet, 42 reverse rotations and seeded resolution order as entrance22.
 * Only the final text transformation is adapted to the small header wordmark. */
export function wordmarkGlyphs(word,time){
 const order=resolutionOrder(word,'random'),ranks=new Map(order.map((index,rank)=>[index,rank]));
 const cipher=encrypt(word);
 return Array.from(word,(letter,index)=>{
  const end=FIRST_SETTLE+ranks.get(index)/Math.max(1,word.length-1)*(WORDMARK_DURATION-FIRST_SETTLE);
  const progress=clamp(time/end),steps=Math.floor(progress*KEY),settled=steps===KEY;
  const origin=ALPHABET.indexOf(cipher[index]);
  return {character:settled?letter:ALPHABET[(origin-steps+ALPHABET.length)%ALPHABET.length],settled};
 });
}

/** Mount only the Latin text span, never the 42 image or the Arabic brand line.
 * setAwards(true/false,{animate:false}) supports a direct route before entrance.
 * destroy() finishes the latest requested word and removes all work/listeners. */
export function mountBrandWordmark({element,brandLink=element.closest('a'),motion}={}){
 const doc=element.ownerDocument,view=doc.defaultView;
 const reduced=motion||view.matchMedia('(prefers-reduced-motion:reduce)');
 const measure=doc.createElement('canvas').getContext('2d');
 const original={width:element.style.width,ariaHidden:element.getAttribute('aria-hidden'),ariaLabel:element.getAttribute('aria-label')};
 let target=element.textContent.trim()==='AWARDS'?'AWARDS':'HORIZON';
 let cells=[],visual=[],width=0,fontSize=0,transition=null,frame=0,sequence=0,disposed=false;

 element.dataset.brandWordmark='true';
 if(brandLink)element.setAttribute('aria-hidden','true');
 function label(){
  const name=target==='AWARDS'?'42 Awards':'42 Horizon';
  if(brandLink)brandLink.setAttribute('aria-label',name);
  else element.setAttribute('aria-label',name);
  element.dataset.wordmarkTarget=target;
 }
 function geometry(word){
  const style=view.getComputedStyle(element),size=parseFloat(style.fontSize)||25;
  measure.font=`${style.fontStyle||'normal'} ${style.fontWeight||'500'} ${size}px ${style.fontFamily||'Jost, sans-serif'}`;
  const spacing=parseFloat(style.letterSpacing)||0;
  let previous=0;
  const letters=Array.from(word,(character,index)=>{
   const right=measure.measureText(word.slice(0,index+1)).width+spacing*(index+1);
   const cell={character,left:previous,width:Math.max(0,right-previous),opacity:1,active:false};previous=right;return cell;
  });
  return {letters,width:Math.max(0,previous),fontSize:size};
 }
 function ensureCells(count){
  while(cells.length<count){
   const cell=doc.createElement('span');cell.className='brand-wordmark-cell';cell.setAttribute('aria-hidden','true');element.append(cell);cells.push(cell);
  }
  while(cells.length>count)cells.pop().remove();
 }
 function paint(next,nextWidth){
  visual=next; width=nextWidth;ensureCells(next.length);
  element.style.width=nextWidth+'px';
  next.forEach((item,index)=>{
   const cell=cells[index];cell.textContent=item.character;cell.style.transform=`translateX(${item.left}px)`;
   cell.style.width=item.width+'px';cell.style.opacity=String(item.opacity);cell.dataset.active=String(item.active);
  });
  element.dataset.wordmarkText=next.filter(item=>item.opacity>.5).map(item=>item.character).join('');
 }
 function cancelFrame(){sequence++;if(frame)view.cancelAnimationFrame(frame);frame=0;}
 function finish(){
  cancelFrame();transition=null;
  const final=geometry(target);fontSize=final.fontSize;paint(final.letters,final.width);
  element.dataset.wordmarkPhase='settled';label();
 }
 function draw(elapsed){
  const progress=clamp(elapsed/WORDMARK_DURATION),eased=progress*progress*(3-2*progress);
  const glyphs=wordmarkGlyphs(target,elapsed),{from,to,fromWidth}=transition;
  const next=Array.from({length:Math.max(from.length,to.letters.length)},(_,index)=>{
   const start=from[index]||{character:to.letters[index].character,left:fromWidth,width:0,opacity:0};
   const end=to.letters[index]||{character:start.character,left:to.width,width:0,opacity:0};
   return {
    character:elapsed===0?start.character:(glyphs[index]?.character||start.character),
    left:start.left+(end.left-start.left)*eased,width:start.width+(end.width-start.width)*eased,
    opacity:start.opacity+(end.opacity-start.opacity)*eased,
    active:elapsed===0?Boolean(start.active):Boolean(glyphs[index]&&!glyphs[index].settled),
   };
  });
  paint(next,fromWidth+(to.width-fromWidth)*eased);
 }
 function tick(now,token){
  if(disposed||token!==sequence||!transition)return;
  frame=0;
  if(transition.start===null)transition.start=now;
  const elapsed=Math.max(0,now-transition.start);transition.elapsed=elapsed;
  if(elapsed>=WORDMARK_DURATION){finish();return;}
  draw(elapsed);frame=view.requestAnimationFrame(time=>tick(time,token));
 }
 function setAwards(awards,{animate=true}={}){
  if(disposed)return false;
  const word=awards?'AWARDS':'HORIZON';
  if(word===target){if(!animate||reduced.matches||doc.hidden)finish();return false;}
  target=word;label();cancelFrame();
  if(!animate||reduced.matches||doc.hidden){finish();return true;}
  const to=geometry(target);fontSize=to.fontSize;
  transition={from:visual.map(item=>({...item})),fromWidth:width,to,start:null,elapsed:0};
  element.dataset.wordmarkPhase='switching';draw(0);
  const token=sequence;frame=view.requestAnimationFrame(now=>tick(now,token));return true;
 }
 function refresh(){
  if(disposed)return;
  if(!transition){finish();return;}
  const to=geometry(target),ratio=to.fontSize/fontSize;
  transition.from=transition.from.map(item=>({...item,left:item.left*ratio,width:item.width*ratio}));
  transition.fromWidth*=ratio;transition.to=to;fontSize=to.fontSize;draw(transition.elapsed);
 }
 function motionChanged(){if(reduced.matches&&!disposed)finish();}
 function visibilityChanged(){if(doc.hidden&&!disposed)finish();}
 element.replaceChildren();finish();
 view.addEventListener('resize',refresh);
 reduced.addEventListener('change',motionChanged);
 doc.addEventListener('visibilitychange',visibilityChanged);
 doc.fonts?.ready.then(refresh);
 return {setAwards,refresh,destroy(){
  if(disposed)return;
  finish();disposed=true;
  view.removeEventListener('resize',refresh);reduced.removeEventListener('change',motionChanged);doc.removeEventListener('visibilitychange',visibilityChanged);
  element.textContent=target;element.style.width=original.width;
  for(const key of ['brandWordmark','wordmarkTarget','wordmarkText','wordmarkPhase'])delete element.dataset[key];
  for(const [name,value]of [['aria-hidden',original.ariaHidden],['aria-label',original.ariaLabel]]){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);}
  cells=[];visual=[];
 }};
}
