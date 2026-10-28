import {normalizeCommentMentions,updateCommentMentions,trimCommentMentions} from './comment-mentions.mjs?v=2';
import {attachCommentMentionPicker} from './comment-mention-picker.mjs?v=3';

// Local prototype only: no account, network request or shared discussion.
const memory=new Map();
export const COMMENT_LIMIT=2000;
const copy={
 fr:{intro:'Une question, une idée ou un retour à partager ?',label:'Votre commentaire',placeholder:'Écrivez votre commentaire…',hint:'Démonstration : commentaires, réponses et réactions restent dans cet onglet. Les compteurs 0 ou 1 reflètent uniquement votre choix local.',add:'Ajouter (démo)',empty:'Aucun commentaire pour le moment.',first:'Ouvrez la discussion en partageant votre premier retour.',you:'Vous',remove:'Supprimer',removeLabel:'Supprimer votre commentaire',saved:'Commentaire ajouté à la démonstration.',required:'Écrivez quelques mots avant d’envoyer.',count:'{count} / 2 000 caractères',list:'Commentaires de cet essai',reply:'Répondre',replyLabel:'Votre réponse',replyPlaceholder:'Écrivez votre réponse…',sendReply:'Répondre (démo)',cancel:'Annuler',replySaved:'Réponse ajoutée à la démonstration.',draftKept:'Brouillon de réponse conservé dans cet onglet.',draft:'Brouillon',replyTo:'En réponse à',deleted:'Ce commentaire a été supprimé. Les réponses sont conservées.',deletedTarget:'un message supprimé',replies:'Réponses à ce commentaire',like:'J’aime',dislike:'Je n’aime pas',localReaction:'Réaction locale de démonstration',emoji:'Emoji',emojiPicker:'Choisir un emoji',limitReached:'Il ne reste pas assez de place pour cet emoji.'},
 en:{intro:'Have a question, an idea or some feedback?',label:'Your comment',placeholder:'Write your comment…',hint:'Demo: comments, replies and reactions stay in this tab. Counts of 0 or 1 reflect only your local choice.',add:'Add (demo)',empty:'No comments yet.',first:'Start the discussion with your first thoughts.',you:'You',remove:'Delete',removeLabel:'Delete your comment',saved:'Comment added to the demo.',required:'Write a few words before sending.',count:'{count} / 2,000 characters',list:'Comments in this demo',reply:'Reply',replyLabel:'Your reply',replyPlaceholder:'Write your reply…',sendReply:'Reply (demo)',cancel:'Cancel',replySaved:'Reply added to the demo.',draftKept:'Reply draft kept in this tab.',draft:'Draft',replyTo:'In reply to',deleted:'This comment was deleted. Its replies are preserved.',deletedTarget:'a deleted message',replies:'Replies to this comment',like:'Like',dislike:'Dislike',localReaction:'Local demo reaction',emoji:'Emoji',emojiPicker:'Choose an emoji',limitReached:'There is not enough room for this emoji.'},
 ar:{intro:'هل لديك سؤال أو فكرة أو ملاحظة؟',label:'تعليقك',placeholder:'اكتب تعليقك…',hint:'عرض تجريبي: تبقى التعليقات والردود والتفاعلات في علامة التبويب هذه. يعكس العدد ٠ أو ١ اختيارك المحلي فقط.',add:'إضافة (تجريبي)',empty:'لا توجد تعليقات بعد.',first:'ابدأ النقاش بمشاركة رأيك.',you:'أنت',remove:'حذف',removeLabel:'حذف تعليقك',saved:'أُضيف التعليق إلى العرض التجريبي.',required:'اكتب بضع كلمات قبل الإرسال.',count:'{count} / ٢٠٠٠ حرف',list:'تعليقات هذا العرض التجريبي',reply:'رد',replyLabel:'ردك',replyPlaceholder:'اكتب ردك…',sendReply:'رد (تجريبي)',cancel:'إلغاء',replySaved:'أُضيف الرد إلى العرض التجريبي.',draftKept:'حُفظت مسودة الرد في علامة التبويب هذه.',draft:'مسودة',replyTo:'ردًا على',deleted:'حُذف هذا التعليق مع الاحتفاظ بالردود.',deletedTarget:'رسالة محذوفة',replies:'الردود على هذا التعليق',like:'أعجبني',dislike:'لم يعجبني',localReaction:'تفاعل تجريبي محلي',emoji:'رمز تعبيري',emojiPicker:'اختر رمزًا تعبيريًا',limitReached:'لا توجد مساحة كافية لهذا الرمز التعبيري.'},
};
const emojiOptions=[['😀','Sourire','Smile','ابتسامة'],['😂','Rire','Laugh','ضحك'],['😍','Admiration','Love','إعجاب'],['👏','Applaudissements','Applause','تصفيق'],['🎉','Fête','Celebration','احتفال'],['❤️','Cœur','Heart','قلب'],['🔥','Feu','Fire','نار'],['👍','Pouce levé','Thumbs up','إبهام مرفوع'],['🙏','Merci','Thanks','شكر'],['💡','Idée','Idea','فكرة'],['🚀','Fusée','Rocket','صاروخ'],['✨','Étincelles','Sparkles','بريق']];
const editingCopy={
 fr:{actions:'Actions du commentaire',edit:'Modifier',editLabel:'Modifier votre commentaire',saveEdit:'Enregistrer (démo)',edited:'Commentaire modifié dans cet essai.',editedMark:'modifié',editCancelled:'Modification annulée.'},
 en:{actions:'Comment actions',edit:'Edit',editLabel:'Edit your comment',saveEdit:'Save (demo)',edited:'Comment updated in this demo.',editedMark:'edited',editCancelled:'Edit cancelled.'},
 ar:{actions:'إجراءات التعليق',edit:'تعديل',editLabel:'تعديل تعليقك',saveEdit:'حفظ (تجريبي)',edited:'عُدّل التعليق في هذا العرض التجريبي.',editedMark:'معدّل',editCancelled:'أُلغي التعديل.'},
};
const authorCopy={
 fr:{using:'Pour cet essai, vous utilisez le profil fictif {name}.',unavailable:'Auteur indisponible',own:'vous',mentionHint:'Tapez @ pour mentionner un profil.',mentionLimit:'Il ne reste pas assez de place pour cette mention.'},
 en:{using:'For this demo, you are using the fictional profile {name}.',unavailable:'Author unavailable',own:'you',mentionHint:'Type @ to mention a profile.',mentionLimit:'There is not enough room for this mention.'},
 ar:{using:'في هذا العرض، تستخدم الملف الخيالي {name}.',unavailable:'الكاتب غير متاح',own:'أنت',mentionHint:'اكتب @ للإشارة إلى ملف شخصي.',mentionLimit:'لا توجد مساحة كافية لهذه الإشارة.'},
};
const actionCopy={
 fr:{report:'Signaler',reportLabel:'Signaler ce commentaire',sort:'Trier les commentaires',newest:'Du plus récent au plus ancien',oldest:'Du plus ancien au plus récent',popular:'Les plus populaires'},
 en:{report:'Report',reportLabel:'Report this comment',sort:'Sort comments',newest:'Newest first',oldest:'Oldest first',popular:'Most popular'},
 ar:{report:'إبلاغ',reportLabel:'الإبلاغ عن هذا التعليق',sort:'ترتيب التعليقات',newest:'من الأحدث إلى الأقدم',oldest:'من الأقدم إلى الأحدث',popular:'الأكثر إعجابًا'},
};
const commentSort=value=>['newest','oldest','popular'].includes(value)?value:'newest';
const textDraft=value=>typeof value==='string'?value.slice(0,COMMENT_LIMIT):'';
const isRecord=value=>value&&typeof value==='object'&&!Array.isArray(value);
const authorId=value=>typeof value==='string'&&value.trim()?value:null;
const localized=(value,locale)=>typeof value==='string'?value:value?.[locale]||value?.en||value?.fr||'';

// Legacy local messages use the current fictional profile only for display.
// A stored unknown author never inherits that profile or a fabricated route.
export function resolveCommentAuthor(item,{currentAuthor=null,resolveAuthor,locale='fr'}={}){
 const id=authorId(item?.authorId),currentId=authorId(currentAuthor?.id),legacy=id===null;
 const candidate=legacy||id===currentId?currentAuthor:resolveAuthor?.(id);
 const profile=candidate&&authorId(candidate.id)&&authorId(candidate.id)===(legacy?currentId:id)?candidate:null;
 return {profile,own:legacy||Boolean(currentId&&id===currentId),legacy,name:localized(profile?.title,locale)||(authorCopy[locale]||authorCopy.fr).unavailable};
}
function webURL(value,base){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,base);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}
}

// Existing v1 comments migrate without losing their text, identifiers or dates.
export function normalizeCommentsState(raw){
 const source=isRecord(raw)?raw:{},seen=new Set();
 const comments=(Array.isArray(source.comments)?source.comments:[]).filter(item=>{
  if(!isRecord(item)||typeof item.id!=='string'||!item.id||seen.has(item.id)||typeof item.text!=='string'||item.text.length>COMMENT_LIMIT||(!item.text.trim()&&!item.deleted)||!Number.isFinite(item.created)||!Number.isFinite(new Date(item.created).getTime()))return false;
  seen.add(item.id);return true;
 }).map(item=>({id:item.id,authorId:authorId(item.authorId),text:item.deleted?'':item.text,mentions:normalizeCommentMentions(item.deleted?'':item.text,item.mentions),created:item.created,editedAt:Number.isFinite(item.editedAt)&&item.editedAt>=item.created&&Number.isFinite(new Date(item.editedAt).getTime())?item.editedAt:null,parentId:typeof item.parentId==='string'?item.parentId:null,replyToId:typeof item.replyToId==='string'?item.replyToId:null,deleted:item.deleted===true,reaction:item.deleted?null:['like','dislike'].includes(item.reaction)?item.reaction:item.liked===true?'like':null}));
 const byId=new Map(comments.map(item=>[item.id,item])),parents=new Map(comments.map(item=>[item.id,item.parentId]));
 for(const item of comments){
  let ancestor=item.id,parent=parents.get(ancestor);const visited=new Set([item.id]);
  while(parent&&byId.has(parent)&&!visited.has(parent)){visited.add(parent);ancestor=parent;parent=parents.get(parent);}
  item.parentId=parent&&visited.has(parent)?null:ancestor===item.id?null:ancestor;
  if(!item.parentId)item.replyToId=null;else if(!item.replyToId)item.replyToId=item.parentId;
 }
 const retained=comments.filter(item=>!item.deleted||comments.some(reply=>reply.parentId===item.id&&!reply.deleted));
 const threadIds=new Set(retained.filter(item=>!item.parentId).map(item=>item.id));
 const replyDrafts=Object.fromEntries(Object.entries(isRecord(source.replyDrafts)?source.replyDrafts:{}).filter(([id,draft])=>threadIds.has(id)&&isRecord(draft)).map(([id,draft])=>[id,{text:textDraft(draft.text),mentions:normalizeCommentMentions(textDraft(draft.text),draft.mentions),targetId:typeof draft.targetId==='string'?draft.targetId:id}]));
 const draft=textDraft(source.draft);
 return {version:2,sort:commentSort(source.sort),draft,draftMentions:normalizeCommentMentions(draft,source.draftMentions),comments:retained,replyDrafts};
}

// Only top-level discussions are ranked. Popularity is this demo's local like.
export function sortCommentThreads(comments=[],sort='newest'){
 const mode=commentSort(sort);
 return comments.map((comment,index)=>({comment,index})).filter(({comment})=>!comment.parentId).sort((a,b)=>{
  if(mode==='popular'){const likes=Number(b.comment.reaction==='like')-Number(a.comment.reaction==='like');if(likes)return likes;}
  const date=mode==='oldest'?a.comment.created-b.comment.created:b.comment.created-a.comment.created;
  return date||(mode==='oldest'?a.index-b.index:b.index-a.index);
 }).map(({comment})=>comment);
}

// Replies stay one level deep. Deleting a parent never deletes its replies.
export function updateCommentsState(previous,action){
 const state=normalizeCommentsState(previous),find=id=>state.comments.find(item=>item.id===id);
 if(action.type==='sort')state.sort=commentSort(action.value);
 else if(action.type==='draft'){state.draft=textDraft(action.text);state.draftMentions=normalizeCommentMentions(state.draft,action.mentions);}
 else if(action.type==='reply-draft'){
  const thread=find(action.threadId);if(thread&&!thread.parentId){const text=textDraft(action.text);state.replyDrafts[action.threadId]={text,mentions:normalizeCommentMentions(text,action.mentions),targetId:action.targetId||thread.id};}
 }else if(action.type==='add'){
  const {value:text,mentions}=trimCommentMentions(typeof action.text==='string'?action.text:'',action.mentions);
  if(!text||text.length>COMMENT_LIMIT||typeof action.id!=='string'||!action.id||find(action.id)||!Number.isFinite(action.created)||!Number.isFinite(new Date(action.created).getTime()))return state;
  const target=action.replyToId?find(action.replyToId):null;if(action.replyToId&&!target)return state;
  const parentId=target?(target.parentId||target.id):null;
  state.comments.push({id:action.id,authorId:authorId(action.authorId),text,mentions,created:action.created,editedAt:null,parentId,replyToId:target?.id||null,deleted:false,reaction:null});
  if(parentId)delete state.replyDrafts[parentId];else{state.draft='';state.draftMentions=[];}
 }else if(action.type==='edit'){
  const item=find(action.id),{value:text,mentions}=trimCommentMentions(typeof action.text==='string'?action.text:'',action.mentions);
  if(item&&!item.deleted&&text&&text.length<=COMMENT_LIMIT&&Number.isFinite(action.editedAt)&&action.editedAt>=item.created&&Number.isFinite(new Date(action.editedAt).getTime())&&(text!==item.text||JSON.stringify(mentions)!==JSON.stringify(item.mentions))){item.text=text;item.mentions=mentions;item.editedAt=action.editedAt;}
 }else if(action.type==='remove'){
  const item=find(action.id);if(!item)return state;
  if(state.comments.some(reply=>reply.parentId===item.id)){item.text='';item.mentions=[];item.deleted=true;item.reaction=null;}
  else{state.comments=state.comments.filter(comment=>comment.id!==item.id);delete state.replyDrafts[item.id];}
 }else if(action.type==='react'&&['like','dislike'].includes(action.reaction)){
  const item=find(action.id);if(item&&!item.deleted)item.reaction=item.reaction===action.reaction?null:action.reaction;
 }
 return normalizeCommentsState(state);
}

export function insertCommentEmoji(value,emoji,start=value.length,end=start){
 const from=Math.max(0,Math.min(value.length,Number.isFinite(start)?start:value.length));
 const to=Math.max(from,Math.min(value.length,Number.isFinite(end)?end:from));
 const next=value.slice(0,from)+emoji+value.slice(to);
 return next.length>COMMENT_LIMIT?{value,caret:from,inserted:false}:{value:next,caret:from+emoji.length,inserted:true};
}
function readState(view,key){
 if(memory.has(key))return memory.get(key);
 let raw;try{raw=JSON.parse(view.sessionStorage.getItem(key));}catch{}
 const state=normalizeCommentsState(raw);memory.set(key,state);return state;
}

export function createComments({doc=document,entryId,kind,locale='fr',signal,currentAuthor=null,resolveAuthor,getAuthorHref,onAuthorNavigate,mentionProfiles=[],onReport}){
 const view=doc.defaultView,t={...(copy[locale]||copy.fr),...(editingCopy[locale]||editingCopy.fr),...(authorCopy[locale]||authorCopy.fr),...(actionCopy[locale]||actionCopy.fr)},key='horizon-archive-pre-action-palette-and-no-zoom-20261013-comments-demo-v1:'+kind+':'+entryId;
 let state=readState(view,key),activeThread=null,activeEdit=null,openedActions=null;
 const editDrafts=new Map();
 const save=()=>{memory.set(key,state);try{view.sessionStorage.setItem(key,JSON.stringify(state));}catch{/* In-memory use still works when storage is unavailable. */}};
 const commit=action=>{state=updateCommentsState(state,action);save();};
 const node=(tag,className,text)=>{const el=doc.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const button=(className,text)=>{const el=node('button',className,text);el.type='button';return el;};
 const root=node('div','cp-comments');root.append(node('p','cp-project-section-intro',t.intro));
 const status=node('p','cp-comments-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const announce=text=>{status.textContent=text;};
 const nextId=()=>view.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);
 const findItem=id=>state.comments.find(item=>item.id===id);
 const identityOf=item=>resolveCommentAuthor(item,{currentAuthor,resolveAuthor,locale});
 const replyContext=(target,limit)=>t.replyTo+' '+(target&&!target.deleted?identityOf(target).name+' : '+target.text.slice(0,limit):t.deletedTarget);
 const renderMentionText=(element,text,mentions)=>{
  let cursor=0;
  for(const mention of normalizeCommentMentions(text,mentions)){
   element.append(doc.createTextNode(text.slice(cursor,mention.start)));
   const profile=resolveAuthor?.(mention.profileId)||mentionProfiles.find(profile=>profile.id===mention.profileId);
   const href=profile?.id===mention.profileId?webURL(getAuthorHref?.(profile),doc.baseURI):null;
   const value=text.slice(mention.start,mention.end);
   if(href){const link=node('a','cp-comment-mention',value);link.href=href;link.dir='auto';if(onAuthorNavigate)link.addEventListener('click',event=>onAuthorNavigate(event,profile),{signal});element.append(link);}
   else element.append(doc.createTextNode(value));
   cursor=mention.end;
  }
  element.append(doc.createTextNode(text.slice(cursor)));
 };
 const focusAction=(id,action)=>{const target=[...discussion.querySelectorAll('[data-comment-action]')].find(el=>el.dataset.commentId===id&&el.dataset.commentAction===action&&!el.closest('[hidden]'));if(!target)return false;target.focus({preventScroll:true});return true;};
 const restoreThreadFocus=id=>{if(focusAction(id,'reply'))return;const editor=doc.getElementById(kind+'-edit-input-'+id);if(editor)editor.focus({preventScroll:true});else if(!focusAction(id,'actions'))mainComposer.input.focus({preventScroll:true});};
 function closeActions(restoreFocus=false){
  if(!openedActions)return;
  const menu=openedActions;openedActions=null;menu.panel.hidden=true;menu.trigger.setAttribute('aria-expanded','false');
  if(restoreFocus&&menu.trigger.isConnected)menu.trigger.focus({preventScroll:true});
 }
 function positionActions(menu){
  const viewport=view.visualViewport,viewportTop=viewport?.offsetTop||0,viewportLeft=viewport?.offsetLeft||0;
  const viewportHeight=viewport?.height||doc.documentElement.clientHeight,viewportWidth=viewport?.width||doc.documentElement.clientWidth;
  const visibleRect=element=>{
   if(!element||element.closest('[hidden]'))return null;
   const style=view.getComputedStyle(element),rect=element.getBoundingClientRect();
   return style.display==='none'||style.visibility==='hidden'||!rect.width||!rect.height?null:rect;
  };
  const header=[doc.querySelector('.app > .header'),doc.getElementById('scope-bar')].map(visibleRect).filter(Boolean);
  const dock=[doc.querySelector('.dock-search-toggle'),doc.getElementById('main-nav')].map(visibleRect).filter(Boolean);
  const topLimit=Math.max(viewportTop+8,...header.map(rect=>rect.bottom+8));
  const bottomLimit=Math.min(viewportTop+viewportHeight-8,...dock.map(rect=>rect.top-8));
  menu.panel.style.maxHeight='none';
  const anchor=menu.trigger.getBoundingClientRect(),wrapper=menu.wrapper.getBoundingClientRect(),panel=menu.panel.getBoundingClientRect();
  const below=Math.max(0,bottomLimit-anchor.bottom-6),above=Math.max(0,anchor.top-topLimit-6),down=panel.height<=below||below>=above;
  const room=down?below:above,height=Math.min(panel.height,room);
  menu.panel.style.maxHeight=room+'px';menu.panel.style.top=(down?anchor.bottom+6-wrapper.top:anchor.top-6-height-wrapper.top)+'px';
  const rtl=view.getComputedStyle(root).direction==='rtl',preferred=rtl?anchor.left:anchor.right-panel.width;
  const left=Math.max(viewportLeft+12,Math.min(preferred,viewportLeft+viewportWidth-panel.width-12));
  menu.panel.style.left=left-wrapper.left+'px';
 }
 function openActions(menu,last=false){
  closeActions();openedActions=menu;menu.panel.hidden=false;menu.trigger.setAttribute('aria-expanded','true');positionActions(menu);
  const items=menu.items.filter(item=>!item.disabled);focusActionItem(menu,items[last?items.length-1:0]);
 }
 function focusActionItem(menu,item){
  if(!item)return;item.focus({preventScroll:true});
  const panel=menu.panel.getBoundingClientRect(),target=item.getBoundingClientRect(),top=panel.top+menu.panel.clientTop+5,bottom=panel.bottom-menu.panel.clientTop-5;
  // Scroll the bounded popup only; focusing an option must not move the page.
  if(target.top<top)menu.panel.scrollTop-=top-target.top;
  else if(target.bottom>bottom)menu.panel.scrollTop+=target.bottom-bottom;
 }
 doc.addEventListener('pointerdown',event=>{if(openedActions&&!openedActions.wrapper.contains(event.target))closeActions(true);},{signal});
 root.addEventListener('focusout',event=>{if(openedActions&&!openedActions.wrapper.contains(event.relatedTarget))closeActions();},{signal});
 const closeMovedActions=()=>closeActions(Boolean(openedActions?.panel.contains(doc.activeElement)));
 view.addEventListener('resize',closeMovedActions,{signal});view.visualViewport?.addEventListener('resize',closeMovedActions,{signal});
 doc.addEventListener('scroll',event=>{if(openedActions&&!openedActions.panel.contains(event.target))closeMovedActions();},{signal,capture:true,passive:true});
 signal?.addEventListener('abort',()=>closeActions(),{once:true});

 function composer({threadId=null,targetId=null,editingId=null}={}){
  const editing=Boolean(editingId),reply=Boolean(threadId),storedDraft=editing?editDrafts.get(editingId)??findItem(editingId):reply?state.replyDrafts[threadId]:{text:state.draft,mentions:state.draftMentions},draft=storedDraft?.text||'';
  let mentions=normalizeCommentMentions(draft,storedDraft?.mentions),previousValue=draft,pendingEdit=null,picker;
  const form=node('form','cp-comments-form'+(reply?' cp-comments-reply-form':editing?' cp-comments-edit-form':''));if(reply)form.id=kind+'-reply-form-'+threadId;if(editing)form.id=kind+'-edit-form-'+editingId;
  if(reply){const context=node('p','cp-reply-context',replyContext(findItem(targetId),100));context.dir='auto';form.append(context);}
  const label=node('label','cp-comments-label',editing?t.editLabel:reply?t.replyLabel:t.label),input=node('textarea');
  input.id=editing?kind+'-edit-input-'+editingId:reply?kind+'-reply-input-'+threadId:kind+'-comment-input';input.name=editing?'edit':reply?'reply':'comment';input.rows=reply||editing?3:4;input.maxLength=COMMENT_LIMIT;input.required=true;input.dir='auto';input.placeholder=reply?t.replyPlaceholder:t.placeholder;input.value=draft;label.htmlFor=input.id;
  const currentName=localized(currentAuthor?.title,locale);
  const hint=node('p','cp-comments-hint',(currentName?t.using.replace('{name}',currentName)+' ':'')+(mentionProfiles.length?t.mentionHint+' ':'')+t.hint);hint.id=input.id+'-hint';input.setAttribute('aria-describedby',hint.id);
  const controls=node('div','cp-comments-controls'),counter=node('span','cp-comments-count'),actions=node('div','cp-comments-compose-actions');
  const submit=node('button','cp-comments-submit',editing?t.saveEdit:reply?t.sendReply:t.add);submit.type='submit';
  const localStatus=node('p','cp-comments-status');localStatus.setAttribute('role','status');
  const updateCount=()=>{counter.textContent=t.count.replace('{count}',new Intl.NumberFormat(locale).format(input.value.length));};updateCount();
  const saveDraft=(edit=pendingEdit)=>{mentions=updateCommentMentions(previousValue,input.value,mentions,edit||undefined);previousValue=input.value;pendingEdit=null;input.setCustomValidity('');if(editing)editDrafts.set(editingId,{text:input.value,mentions});else commit(reply?{type:'reply-draft',threadId,targetId,text:input.value,mentions}:{type:'draft',text:input.value,mentions});updateCount();localStatus.textContent='';};
  const emojiWrapper=node('div','cp-comments-emoji'),emojiButton=button('cp-comments-emoji-toggle','☺ '+t.emoji),palette=node('div','cp-comments-emoji-palette');
  palette.id=input.id+'-emojis';palette.hidden=true;palette.setAttribute('role','group');palette.setAttribute('aria-label',t.emojiPicker);emojiButton.setAttribute('aria-controls',palette.id);emojiButton.setAttribute('aria-expanded','false');
  let selection={start:input.value.length,end:input.value.length};
  const closePalette=(restore=false)=>{palette.hidden=true;emojiButton.setAttribute('aria-expanded','false');if(restore)emojiButton.focus({preventScroll:true});};
  input.addEventListener('focus',()=>closePalette(),{signal});
  emojiButton.addEventListener('click',()=>{if(!palette.hidden){closePalette();return;}selection={start:input.selectionStart,end:input.selectionEnd};palette.hidden=false;emojiButton.setAttribute('aria-expanded','true');palette.querySelector('button').focus({preventScroll:true});},{signal});
  for(const option of emojiOptions){const pick=button('cp-comments-emoji-choice',option[0]);pick.setAttribute('aria-label',option[locale==='en'?2:locale==='ar'?3:1]);pick.addEventListener('click',()=>{const change=insertCommentEmoji(input.value,option[0],selection.start,selection.end);closePalette();input.focus({preventScroll:true});picker?.close();if(!change.inserted){localStatus.textContent=t.limitReached;input.setSelectionRange(selection.start,selection.end);return;}input.value=change.value;input.setSelectionRange(change.caret,change.caret);saveDraft({start:selection.start,end:selection.end});},{signal});palette.append(pick);}
  emojiWrapper.addEventListener('keydown',event=>{if(event.key==='Escape'&&!palette.hidden){event.preventDefault();event.stopPropagation();closePalette(true);}},{signal});
  emojiWrapper.append(emojiButton,palette);actions.append(emojiWrapper);
  if(reply||editing){const cancel=button('cp-comments-cancel',t.cancel);cancel.addEventListener('click',()=>{if(editing){activeEdit=null;editDrafts.delete(editingId);render();announce(t.editCancelled);if(!focusAction(editingId,'actions'))mainComposer.input.focus({preventScroll:true});}else{activeThread=null;render();announce(t.draftKept);if(!focusAction(targetId,'reply')&&!focusAction(threadId,'reply'))mainComposer.input.focus({preventScroll:true});}},{signal});actions.append(cancel);}
  actions.append(submit);controls.append(counter,actions);form.append(label,input,hint,controls,localStatus);
  input.addEventListener('beforeinput',event=>{const start=input.selectionStart,end=input.selectionEnd;pendingEdit=!event.isComposing&&(event.inputType?.startsWith('insert')||start!==end)?{start,end}:null;},{signal});
  input.addEventListener('input',()=>saveDraft(),{signal});
  picker=attachCommentMentionPicker({doc,input,profiles:mentionProfiles,locale,signal,getMentions:()=>mentions,
   onChange({value,mentions:nextMentions,caret}){input.value=value;mentions=normalizeCommentMentions(value,nextMentions);previousValue=value;pendingEdit=null;input.focus({preventScroll:true});input.setSelectionRange(caret,caret);saveDraft();},
   onLimit(){localStatus.textContent=t.mentionLimit;},
  });
  form.insertBefore(picker.element,hint);
  form.addEventListener('submit',event=>{
   event.preventDefault();const text=input.value;if(!text.trim()){input.setCustomValidity(t.required);input.reportValidity();return;}if(text.length>COMMENT_LIMIT)return;
   picker.close();
   if(editing){if(!identityOf(findItem(editingId)).own)return;commit({type:'edit',id:editingId,text,mentions,editedAt:Date.now()});activeEdit=null;editDrafts.delete(editingId);render();announce(t.edited);if(!focusAction(editingId,'actions'))mainComposer.input.focus({preventScroll:true});return;}
   const target=reply?(findItem(targetId)?.id||threadId):null,id=nextId();commit({type:'add',id,authorId:currentAuthor?.id,text,mentions,created:Date.now(),replyToId:target});
   if(reply){activeThread=null;render();announce(t.replySaved);[...discussion.querySelectorAll('article[data-comment-id]')].find(el=>el.dataset.commentId===id)?.focus({preventScroll:true});}
   else{input.value='';mentions=[];previousValue='';pendingEdit=null;picker.reset();updateCount();render();announce(t.saved);input.focus({preventScroll:true});}
  },{signal});
  return {form,input};
 }
 const mainComposer=composer();root.append(mainComposer.form,status);
 const discussion=node('div','cp-comments-discussion');root.append(discussion);
 function message(item){
  const row=node('article','cp-comment'+(item.deleted?' cp-comment-deleted':''));row.dataset.commentId=item.id;row.tabIndex=-1;
  const author=identityOf(item),href=author.profile?webURL(getAuthorHref?.(author.profile),doc.baseURI):null;
  const top=node('div','cp-comment-top'),identity=node('div','cp-comment-identity'),authorLink=node(href?'a':'div','cp-comment-author'),avatar=node('span','cp-comment-avatar');avatar.setAttribute('aria-hidden','true');
  if(href){authorLink.href=href;authorLink.dataset.commentAuthor=author.profile.id;if(onAuthorNavigate)authorLink.addEventListener('click',event=>onAuthorNavigate(event,author.profile),{signal});}
  const fallbackAvatar=()=>{avatar.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';};
  const avatarSrc=webURL(author.profile?.avatar,doc.baseURI);
  if(avatarSrc){const image=node('img');image.alt='';image.src=avatarSrc;image.addEventListener('error',fallbackAvatar,{signal,once:true});avatar.append(image);}else fallbackAvatar();
  const name=node('strong'),displayName=node('bdi','',author.name);displayName.dir='auto';name.append(displayName);
  if(author.own&&author.profile)name.append(node('span','cp-comment-own',' ('+t.own+')'));
  authorLink.append(avatar,name);
  const details=node('div','cp-comment-meta'),time=node('time');time.dateTime=new Date(item.created).toISOString();time.textContent=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(item.created);details.append(time);if(item.editedAt&&!item.deleted){const edited=node('span','cp-comment-edited',t.editedMark);edited.title=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(item.editedAt);details.append(edited);}identity.append(authorLink,details);top.append(identity);
  if(!item.deleted){
   const wrapper=node('div','cp-comment-owner-actions'),trigger=button('cp-comment-menu-toggle'),panel=node('div','cp-comment-owner-menu'),items=[];
   trigger.dataset.commentAction='actions';trigger.dataset.commentId=item.id;trigger.setAttribute('aria-label',t.actions);trigger.title=t.actions;
   trigger.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
   panel.id=kind+'-comment-actions-'+item.id;panel.hidden=true;panel.setAttribute('role','menu');panel.setAttribute('aria-label',t.actions);
   trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',panel.id);
   const menu={wrapper,trigger,panel,items};
   const addAction=(action,label,description,run)=>{
    const option=button('cp-comment-'+action,label);option.dataset.commentAction=action;option.dataset.commentId=item.id;option.setAttribute('role','menuitem');option.setAttribute('aria-label',description);option.tabIndex=-1;
    option.addEventListener('click',()=>{if(option.disabled)return;closeActions();run();},{signal});items.push(option);panel.append(option);return option;
   };
   if(author.own){
    if(activeEdit!==item.id)addAction('edit',t.edit,t.editLabel,()=>{activeEdit=item.id;activeThread=null;if(!editDrafts.has(item.id))editDrafts.set(item.id,{text:item.text,mentions:item.mentions});render();doc.getElementById(kind+'-edit-input-'+item.id)?.focus();});
    addAction('remove',t.remove,t.removeLabel,()=>{const threadId=item.parentId||item.id;commit({type:'remove',id:item.id});editDrafts.delete(item.id);if(activeEdit===item.id)activeEdit=null;if(!findItem(threadId))activeThread=null;render();status.textContent='';restoreThreadFocus(threadId);});
   }
   addAction('report',t.report,t.reportLabel,()=>{trigger.focus({preventScroll:true});onReport?.({comment:{...item,mentions:item.mentions.map(mention=>({...mention}))},trigger});}).disabled=typeof onReport!=='function';
   trigger.disabled=items.every(option=>option.disabled);
   trigger.addEventListener('click',()=>openedActions===menu?closeActions(true):openActions(menu),{signal});
   trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();openActions(menu,event.key==='ArrowUp');}},{signal});
   panel.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeActions(true);return;}
    if(event.key==='Tab'){closeActions(true);return;}
    const available=items.filter(option=>!option.disabled),current=available.indexOf(doc.activeElement),index={ArrowDown:(current+1)%available.length,ArrowUp:(current+available.length-1)%available.length,Home:0,End:available.length-1}[event.key];
    if(index!==undefined){event.preventDefault();focusActionItem(menu,available[index]);}
   },{signal});
   wrapper.append(trigger,panel);top.append(wrapper);
  }
  row.append(top);
  if(activeEdit===item.id&&!item.deleted&&author.own){row.append(composer({editingId:item.id}).form);return row;}
  if(item.parentId&&item.replyToId!==item.parentId){const context=node('p','cp-reply-context',replyContext(findItem(item.replyToId),80));context.dir='auto';row.append(context);}
  const body=node('p','cp-comment-text');body.dir='auto';renderMentionText(body,item.deleted?t.deleted:item.text,item.deleted?[]:item.mentions);row.append(body);
  const actions=node('div','cp-comment-actions');
  if(!item.deleted){for(const reaction of ['like','dislike']){const reactionButton=button('cp-comment-reaction');reactionButton.dataset.commentAction=reaction;reactionButton.dataset.commentId=item.id;reactionButton.setAttribute('aria-pressed',String(item.reaction===reaction));reactionButton.title=t[reaction];reactionButton.setAttribute('aria-label',t[reaction]+' · '+new Intl.NumberFormat(locale).format(Number(item.reaction===reaction))); const glyph=node('span','cp-reaction-icon');glyph.setAttribute('aria-hidden','true');glyph.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path transform="'+(reaction==='like'?'matrix(1 0 0 -1 0 24)':'matrix(-1 0 0 1 24 0)')+'" d="M7 3h13v10h-6l1 5c.3 2-2 3-3 1l-5-6V3ZM3 3h4v10H3z"/></svg>';const count=node('span','cp-reaction-count',new Intl.NumberFormat(locale).format(Number(item.reaction===reaction)));count.setAttribute('aria-hidden','true');reactionButton.append(glyph,count);reactionButton.addEventListener('click',()=>{commit({type:'react',id:item.id,reaction});render();focusAction(item.id,reaction);status.textContent='';},{signal});actions.append(reactionButton);}}
  const threadId=item.parentId||item.id,reply=button('cp-comment-reply',t.reply);reply.dataset.commentAction='reply';reply.dataset.commentId=item.id;reply.setAttribute('aria-expanded',String(activeThread===threadId&&state.replyDrafts[threadId]?.targetId===item.id));reply.setAttribute('aria-controls',kind+'-reply-form-'+threadId);
  if(!item.parentId&&state.replyDrafts[threadId]?.text)reply.append(node('span','cp-comment-draft',t.draft));
  reply.addEventListener('click',()=>{activeThread=threadId;activeEdit=null;commit({type:'reply-draft',threadId,targetId:item.id,text:state.replyDrafts[threadId]?.text||'',mentions:state.replyDrafts[threadId]?.mentions||[]});render();doc.getElementById(kind+'-reply-input-'+threadId)?.focus();},{signal});actions.append(reply);row.append(actions);return row;
 }
 function render(){
  closeActions();
  discussion.replaceChildren();
  const toolbar=node('div','cp-comments-toolbar'),sortLabel=node('label','cp-comments-sort-label',t.sort),sort=node('select','cp-comments-sort');
  sort.id=kind+'-comment-sort';sortLabel.htmlFor=sort.id;sort.setAttribute('aria-label',t.sort);sort.title=t.sort;
  for(const value of ['newest','oldest','popular']){const option=node('option','',t[value]);option.value=value;sort.append(option);}sort.value=state.sort;
  sort.addEventListener('change',()=>{commit({type:'sort',value:sort.value});render();discussion.querySelector('.cp-comments-sort')?.focus({preventScroll:true});},{signal});
  toolbar.append(sortLabel,sort);discussion.append(toolbar);
  if(!state.comments.length){const empty=node('div','cp-comments-empty');empty.append(node('h3','',t.empty),node('p','',t.first));discussion.append(empty);return;}
  const list=node('ol','cp-comments-list');list.setAttribute('aria-label',t.list);
  for(const item of sortCommentThreads(state.comments,state.sort)){
   const thread=node('li','cp-comment-thread');thread.append(message(item));const replies=state.comments.filter(reply=>reply.parentId===item.id).sort((a,b)=>a.created-b.created);
   if(replies.length){const children=node('ol','cp-comment-replies');children.setAttribute('aria-label',t.replies);for(const child of replies){const li=node('li');li.append(message(child));children.append(li);}thread.append(children);}
   if(activeThread===item.id){const draft=state.replyDrafts[item.id];thread.append(composer({threadId:item.id,targetId:draft?.targetId||item.id}).form);}
   list.append(thread);
  }
  discussion.append(list);
 }
 render();return root;
}
