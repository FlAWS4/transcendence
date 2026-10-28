import {findMentionToken,searchMentionProfiles,insertCommentMention} from './comment-mentions.mjs?v=1';

const copy={
 fr:{label:'Profils à mentionner',results:'{count} profil(s) · ↑ ↓ pour choisir, Entrée pour insérer, Échap pour fermer.',empty:'Aucun profil trouvé.'},
 en:{label:'Profiles to mention',results:'{count} profile(s) · ↑ ↓ to choose, Enter to insert, Escape to close.',empty:'No profile found.'},
 ar:{label:'ملفات للإشارة إليها',results:'{count} ملف · ↑ ↓ للاختيار، Enter للإدراج، Escape للإغلاق.',empty:'لم يُعثر على ملف.'},
};
const nameOf=(profile,locale)=>typeof profile?.title==='string'?profile.title:profile?.title?.[locale]||profile?.title?.fr||profile?.title?.en||'';
const tokenKey=token=>token?`${token.start}:${token.end}:${token.query}`:'';
function avatarURL(value,base){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,base);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}
}

// A native multiline textarea keeps focus while its listbox selection changes.
// The composer owns the text and persisted mention ranges; this is only the picker.
export function attachCommentMentionPicker({doc=document,input,profiles=[],locale='fr',signal,getMentions=()=>[],onChange,onLimit=()=>{}}){
 const t=copy[locale]||copy.fr;
 const node=(tag,className,text)=>{const el=doc.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const element=node('div','cp-mention-picker');element.hidden=true;
 const summary=node('p','cp-mention-summary');summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
 const list=node('ul','cp-mention-options');list.id=input.id+'-mentions';list.setAttribute('role','listbox');list.setAttribute('aria-label',t.label);
 element.append(summary,list);
 input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls',list.id);input.setAttribute('aria-haspopup','listbox');
 let candidates=[],active=0,token=null,dismissed='',composing=false;
 const currentToken=()=>findMentionToken(input.value,input.selectionStart,input.selectionEnd,getMentions());
 function close(){dismissed=tokenKey(currentToken());element.hidden=true;input.removeAttribute('aria-activedescendant');token=null;candidates=[];}
 function reset(){dismissed='';close();}
 function markSelection(scroll=false){
  [...list.children].forEach((option,index)=>option.setAttribute('aria-selected',String(index===active)));
  const selected=list.children[active];
  if(selected){input.setAttribute('aria-activedescendant',selected.id);if(scroll)selected.scrollIntoView?.({block:'nearest'});}
  else input.removeAttribute('aria-activedescendant');
 }
 function choose(index){
  const candidate=candidates[index],latest=currentToken();
  if(!candidate||!latest||tokenKey(latest)!==tokenKey(token))return close();
  const change=insertCommentMention(input.value,candidate,latest,{locale,mentions:getMentions(),limit:input.maxLength>0?input.maxLength:2000});
  if(!change.inserted){close();onLimit();input.focus({preventScroll:true});return;}
  input.value=change.value;input.setSelectionRange(change.caret,change.caret);onChange?.(change);
  close();input.focus({preventScroll:true});input.setSelectionRange(change.caret,change.caret);
 }
 function refresh(){
  if(composing||doc.activeElement!==input||!profiles.length)return close();
  const next=currentToken();
  if(!next||tokenKey(next)===dismissed)return close();
  if(!element.hidden&&tokenKey(next)===tokenKey(token))return;
  token=next;active=0;candidates=searchMentionProfiles(profiles,next.query,{locale,limit:6});
  list.replaceChildren();element.hidden=false;
  summary.textContent=candidates.length?t.results.replace('{count}',new Intl.NumberFormat(locale).format(candidates.length)):t.empty;
  for(const [index,profile]of candidates.entries()){
   const option=node('li','cp-mention-option');option.id=list.id+'-'+index;option.setAttribute('role','option');option.dataset.mentionProfile=profile.id;
   const avatar=node('span','cp-mention-avatar');avatar.setAttribute('aria-hidden','true');
   const name=nameOf(profile,locale),src=avatarURL(profile.avatar,doc.baseURI);
   const fallback=()=>{avatar.textContent=Array.from(name)[0]||'@';};
   if(src){const image=node('img');image.alt='';image.src=src;image.addEventListener('error',fallback,{once:true,signal});avatar.append(image);}else fallback();
   const person=node('span','cp-mention-person'),label=node('strong','',name);label.dir='auto';person.append(label);
   if(profile.intraLogin){const login=node('small','','@'+profile.intraLogin);login.dir='ltr';person.append(login);}
   option.append(avatar,person);
   option.addEventListener('pointerdown',event=>event.preventDefault(),{signal});
   option.addEventListener('click',()=>choose(index),{signal});list.append(option);
  }
  markSelection();
 }
 input.addEventListener('input',()=>{dismissed='';refresh();},{signal});
 input.addEventListener('click',()=>{dismissed='';refresh();},{signal});
 input.addEventListener('focus',refresh,{signal});
 input.addEventListener('blur',close,{signal});
 input.addEventListener('compositionstart',()=>{composing=true;close();},{signal});
 input.addEventListener('compositionend',()=>{composing=false;dismissed='';refresh();},{signal});
 input.addEventListener('keyup',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){dismissed='';refresh();}},{signal});
 input.addEventListener('keydown',event=>{
  if(composing||event.isComposing||event.keyCode===229)return;
  if(element.hidden)return;
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
  if(['ArrowDown','ArrowUp'].includes(event.key)&&candidates.length){event.preventDefault();active=(active+(event.key==='ArrowDown'?1:-1)+candidates.length)%candidates.length;markSelection(true);}
  else if(event.key==='Enter'&&!event.shiftKey&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&candidates.length){event.preventDefault();choose(active);}
  else if(event.key==='Tab')close();
 },{signal});
 signal?.addEventListener('abort',close,{once:true});
 return {element,refresh,close,reset};
}
