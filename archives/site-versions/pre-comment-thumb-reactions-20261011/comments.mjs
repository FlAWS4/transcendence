// Local prototype only: no account, network request or shared discussion.
const memory=new Map();
export const COMMENT_LIMIT=2000;
const copy={
 fr:{intro:'Une question, une idée ou un retour à partager ?',label:'Votre commentaire',placeholder:'Écrivez votre commentaire…',hint:'Démonstration : commentaires, réponses et réactions restent dans cet onglet. Les compteurs 0 ou 1 reflètent uniquement votre choix local.',add:'Ajouter (démo)',empty:'Aucun commentaire pour le moment.',first:'Ouvrez la discussion en partageant votre premier retour.',you:'Vous',remove:'Supprimer',removeLabel:'Supprimer votre commentaire',saved:'Commentaire ajouté à la démonstration.',removed:'Commentaire supprimé.',required:'Écrivez quelques mots avant d’envoyer.',count:'{count} / 2 000 caractères',list:'Commentaires de cet essai',reply:'Répondre',replyLabel:'Votre réponse',replyPlaceholder:'Écrivez votre réponse…',sendReply:'Répondre (démo)',cancel:'Annuler',replySaved:'Réponse ajoutée à la démonstration.',draftKept:'Brouillon de réponse conservé dans cet onglet.',draft:'Brouillon',replyTo:'En réponse à',deleted:'Ce commentaire a été supprimé. Les réponses sont conservées.',deletedTarget:'un message supprimé',replies:'Réponses à ce commentaire',like:'J’aime',dislike:'Je n’aime pas',liked:'J’aime enregistré dans cet onglet.',disliked:'Je n’aime pas enregistré dans cet onglet.',reactionRemoved:'Réaction retirée.',localReaction:'Réaction locale de démonstration',emoji:'Emoji',emojiPicker:'Choisir un emoji',limitReached:'Il ne reste pas assez de place pour cet emoji.'},
 en:{intro:'Have a question, an idea or some feedback?',label:'Your comment',placeholder:'Write your comment…',hint:'Demo: comments, replies and reactions stay in this tab. Counts of 0 or 1 reflect only your local choice.',add:'Add (demo)',empty:'No comments yet.',first:'Start the discussion with your first thoughts.',you:'You',remove:'Delete',removeLabel:'Delete your comment',saved:'Comment added to the demo.',removed:'Comment deleted.',required:'Write a few words before sending.',count:'{count} / 2,000 characters',list:'Comments in this demo',reply:'Reply',replyLabel:'Your reply',replyPlaceholder:'Write your reply…',sendReply:'Reply (demo)',cancel:'Cancel',replySaved:'Reply added to the demo.',draftKept:'Reply draft kept in this tab.',draft:'Draft',replyTo:'In reply to',deleted:'This comment was deleted. Its replies are preserved.',deletedTarget:'a deleted message',replies:'Replies to this comment',like:'Like',dislike:'Dislike',liked:'Like saved in this tab.',disliked:'Dislike saved in this tab.',reactionRemoved:'Reaction removed.',localReaction:'Local demo reaction',emoji:'Emoji',emojiPicker:'Choose an emoji',limitReached:'There is not enough room for this emoji.'},
 ar:{intro:'هل لديك سؤال أو فكرة أو ملاحظة؟',label:'تعليقك',placeholder:'اكتب تعليقك…',hint:'عرض تجريبي: تبقى التعليقات والردود والتفاعلات في علامة التبويب هذه. يعكس العدد ٠ أو ١ اختيارك المحلي فقط.',add:'إضافة (تجريبي)',empty:'لا توجد تعليقات بعد.',first:'ابدأ النقاش بمشاركة رأيك.',you:'أنت',remove:'حذف',removeLabel:'حذف تعليقك',saved:'أُضيف التعليق إلى العرض التجريبي.',removed:'حُذف التعليق.',required:'اكتب بضع كلمات قبل الإرسال.',count:'{count} / ٢٠٠٠ حرف',list:'تعليقات هذا العرض التجريبي',reply:'رد',replyLabel:'ردك',replyPlaceholder:'اكتب ردك…',sendReply:'رد (تجريبي)',cancel:'إلغاء',replySaved:'أُضيف الرد إلى العرض التجريبي.',draftKept:'حُفظت مسودة الرد في علامة التبويب هذه.',draft:'مسودة',replyTo:'ردًا على',deleted:'حُذف هذا التعليق مع الاحتفاظ بالردود.',deletedTarget:'رسالة محذوفة',replies:'الردود على هذا التعليق',like:'أعجبني',dislike:'لم يعجبني',liked:'حُفظ الإعجاب في علامة التبويب هذه.',disliked:'حُفظ عدم الإعجاب في علامة التبويب هذه.',reactionRemoved:'أُزيل التفاعل.',localReaction:'تفاعل تجريبي محلي',emoji:'رمز تعبيري',emojiPicker:'اختر رمزًا تعبيريًا',limitReached:'لا توجد مساحة كافية لهذا الرمز التعبيري.'},
};
const emojiOptions=[['😀','Sourire','Smile','ابتسامة'],['😂','Rire','Laugh','ضحك'],['😍','Admiration','Love','إعجاب'],['👏','Applaudissements','Applause','تصفيق'],['🎉','Fête','Celebration','احتفال'],['❤️','Cœur','Heart','قلب'],['🔥','Feu','Fire','نار'],['👍','Pouce levé','Thumbs up','إبهام مرفوع'],['🙏','Merci','Thanks','شكر'],['💡','Idée','Idea','فكرة'],['🚀','Fusée','Rocket','صاروخ'],['✨','Étincelles','Sparkles','بريق']];
const editingCopy={
 fr:{edit:'Modifier',editLabel:'Modifier votre commentaire',saveEdit:'Enregistrer (démo)',edited:'Commentaire modifié dans cet essai.',editedMark:'modifié',editCancelled:'Modification annulée.'},
 en:{edit:'Edit',editLabel:'Edit your comment',saveEdit:'Save (demo)',edited:'Comment updated in this demo.',editedMark:'edited',editCancelled:'Edit cancelled.'},
 ar:{edit:'تعديل',editLabel:'تعديل تعليقك',saveEdit:'حفظ (تجريبي)',edited:'عُدّل التعليق في هذا العرض التجريبي.',editedMark:'معدّل',editCancelled:'أُلغي التعديل.'},
};
const textDraft=value=>typeof value==='string'?value.slice(0,COMMENT_LIMIT):'';
const isRecord=value=>value&&typeof value==='object'&&!Array.isArray(value);

// Existing v1 comments migrate without losing their text, identifiers or dates.
export function normalizeCommentsState(raw){
 const source=isRecord(raw)?raw:{},seen=new Set();
 const comments=(Array.isArray(source.comments)?source.comments:[]).filter(item=>{
  if(!isRecord(item)||typeof item.id!=='string'||!item.id||seen.has(item.id)||typeof item.text!=='string'||item.text.length>COMMENT_LIMIT||(!item.text.trim()&&!item.deleted)||!Number.isFinite(item.created)||!Number.isFinite(new Date(item.created).getTime()))return false;
  seen.add(item.id);return true;
 }).map(item=>({id:item.id,text:item.deleted?'':item.text,created:item.created,editedAt:Number.isFinite(item.editedAt)&&item.editedAt>=item.created&&Number.isFinite(new Date(item.editedAt).getTime())?item.editedAt:null,parentId:typeof item.parentId==='string'?item.parentId:null,replyToId:typeof item.replyToId==='string'?item.replyToId:null,deleted:item.deleted===true,reaction:item.deleted?null:['like','dislike'].includes(item.reaction)?item.reaction:item.liked===true?'like':null}));
 const byId=new Map(comments.map(item=>[item.id,item])),parents=new Map(comments.map(item=>[item.id,item.parentId]));
 for(const item of comments){
  let ancestor=item.id,parent=parents.get(ancestor);const visited=new Set([item.id]);
  while(parent&&byId.has(parent)&&!visited.has(parent)){visited.add(parent);ancestor=parent;parent=parents.get(parent);}
  item.parentId=parent&&visited.has(parent)?null:ancestor===item.id?null:ancestor;
  if(!item.parentId)item.replyToId=null;else if(!item.replyToId)item.replyToId=item.parentId;
 }
 const retained=comments.filter(item=>!item.deleted||comments.some(reply=>reply.parentId===item.id&&!reply.deleted));
 const threadIds=new Set(retained.filter(item=>!item.parentId).map(item=>item.id));
 const replyDrafts=Object.fromEntries(Object.entries(isRecord(source.replyDrafts)?source.replyDrafts:{}).filter(([id,draft])=>threadIds.has(id)&&isRecord(draft)).map(([id,draft])=>[id,{text:textDraft(draft.text),targetId:typeof draft.targetId==='string'?draft.targetId:id}]));
 return {version:2,draft:textDraft(source.draft),comments:retained,replyDrafts};
}

// Replies stay one level deep. Deleting a parent never deletes its replies.
export function updateCommentsState(previous,action){
 const state=normalizeCommentsState(previous),find=id=>state.comments.find(item=>item.id===id);
 if(action.type==='draft')state.draft=textDraft(action.text);
 else if(action.type==='reply-draft'){
  const thread=find(action.threadId);if(thread&&!thread.parentId)state.replyDrafts[action.threadId]={text:textDraft(action.text),targetId:action.targetId||thread.id};
 }else if(action.type==='add'){
  const text=typeof action.text==='string'?action.text.trim():'';
  if(!text||text.length>COMMENT_LIMIT||typeof action.id!=='string'||!action.id||find(action.id)||!Number.isFinite(action.created)||!Number.isFinite(new Date(action.created).getTime()))return state;
  const target=action.replyToId?find(action.replyToId):null;if(action.replyToId&&!target)return state;
  const parentId=target?(target.parentId||target.id):null;
  state.comments.push({id:action.id,text,created:action.created,editedAt:null,parentId,replyToId:target?.id||null,deleted:false,reaction:null});
  if(parentId)delete state.replyDrafts[parentId];else state.draft='';
 }else if(action.type==='edit'){
  const item=find(action.id),text=typeof action.text==='string'?action.text.trim():'';
  if(item&&!item.deleted&&text&&text.length<=COMMENT_LIMIT&&Number.isFinite(action.editedAt)&&action.editedAt>=item.created&&Number.isFinite(new Date(action.editedAt).getTime())&&text!==item.text){item.text=text;item.editedAt=action.editedAt;}
 }else if(action.type==='remove'){
  const item=find(action.id);if(!item)return state;
  if(state.comments.some(reply=>reply.parentId===item.id)){item.text='';item.deleted=true;item.reaction=null;}
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

export function createComments({doc=document,entryId,kind,locale='fr',signal}){
 const view=doc.defaultView,t={...(copy[locale]||copy.fr),...(editingCopy[locale]||editingCopy.fr)},key='horizon-comments-demo-v1:'+kind+':'+entryId;
 let state=readState(view,key),activeThread=null,activeEdit=null;
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
 const focusAction=(id,action)=>{const target=[...discussion.querySelectorAll('[data-comment-action]')].find(el=>el.dataset.commentId===id&&el.dataset.commentAction===action);if(!target)return false;target.focus({preventScroll:true});return true;};
 const restoreThreadFocus=id=>{if(focusAction(id,'reply'))return;const editor=doc.getElementById(kind+'-edit-input-'+id);if(editor)editor.focus({preventScroll:true});else if(!focusAction(id,'edit'))mainComposer.input.focus({preventScroll:true});};

 function composer({threadId=null,targetId=null,editingId=null}={}){
  const editing=Boolean(editingId),reply=Boolean(threadId),draft=editing?editDrafts.get(editingId)??findItem(editingId)?.text??'':reply?state.replyDrafts[threadId]?.text||'':state.draft;
  const form=node('form','cp-comments-form'+(reply?' cp-comments-reply-form':editing?' cp-comments-edit-form':''));if(reply)form.id=kind+'-reply-form-'+threadId;if(editing)form.id=kind+'-edit-form-'+editingId;
  if(reply){const target=findItem(targetId),context=node('p','cp-reply-context',t.replyTo+' '+(target&&!target.deleted?t.you+' : '+target.text.slice(0,100):t.deletedTarget));context.dir='auto';form.append(context);}
  const label=node('label','cp-comments-label',editing?t.editLabel:reply?t.replyLabel:t.label),input=node('textarea');
  input.id=editing?kind+'-edit-input-'+editingId:reply?kind+'-reply-input-'+threadId:kind+'-comment-input';input.name=editing?'edit':reply?'reply':'comment';input.rows=reply||editing?3:4;input.maxLength=COMMENT_LIMIT;input.required=true;input.dir='auto';input.placeholder=reply?t.replyPlaceholder:t.placeholder;input.value=draft;label.htmlFor=input.id;
  const hint=node('p','cp-comments-hint',t.hint);hint.id=input.id+'-hint';input.setAttribute('aria-describedby',hint.id);
  const controls=node('div','cp-comments-controls'),counter=node('span','cp-comments-count'),actions=node('div','cp-comments-compose-actions');
  const submit=node('button','cp-comments-submit',editing?t.saveEdit:reply?t.sendReply:t.add);submit.type='submit';
  const localStatus=node('p','cp-comments-status');localStatus.setAttribute('role','status');
  const updateCount=()=>{counter.textContent=t.count.replace('{count}',new Intl.NumberFormat(locale).format(input.value.length));};updateCount();
  const saveDraft=()=>{input.setCustomValidity('');if(editing)editDrafts.set(editingId,input.value);else commit(reply?{type:'reply-draft',threadId,targetId,text:input.value}:{type:'draft',text:input.value});updateCount();localStatus.textContent='';};
  const emojiWrapper=node('div','cp-comments-emoji'),emojiButton=button('cp-comments-emoji-toggle','☺ '+t.emoji),palette=node('div','cp-comments-emoji-palette');
  palette.id=input.id+'-emojis';palette.hidden=true;palette.setAttribute('role','group');palette.setAttribute('aria-label',t.emojiPicker);emojiButton.setAttribute('aria-controls',palette.id);emojiButton.setAttribute('aria-expanded','false');
  let selection={start:input.value.length,end:input.value.length};
  const closePalette=(restore=false)=>{palette.hidden=true;emojiButton.setAttribute('aria-expanded','false');if(restore)emojiButton.focus({preventScroll:true});};
  input.addEventListener('focus',()=>closePalette(),{signal});
  emojiButton.addEventListener('click',()=>{if(!palette.hidden){closePalette();return;}selection={start:input.selectionStart,end:input.selectionEnd};palette.hidden=false;emojiButton.setAttribute('aria-expanded','true');palette.querySelector('button').focus({preventScroll:true});},{signal});
  for(const option of emojiOptions){const pick=button('cp-comments-emoji-choice',option[0]);pick.setAttribute('aria-label',option[locale==='en'?2:locale==='ar'?3:1]);pick.addEventListener('click',()=>{const change=insertCommentEmoji(input.value,option[0],selection.start,selection.end);closePalette();input.focus({preventScroll:true});if(!change.inserted){localStatus.textContent=t.limitReached;input.setSelectionRange(selection.start,selection.end);return;}input.value=change.value;input.setSelectionRange(change.caret,change.caret);saveDraft();},{signal});palette.append(pick);}
  emojiWrapper.addEventListener('keydown',event=>{if(event.key==='Escape'&&!palette.hidden){event.preventDefault();event.stopPropagation();closePalette(true);}},{signal});
  emojiWrapper.append(emojiButton,palette);actions.append(emojiWrapper);
  if(reply||editing){const cancel=button('cp-comments-cancel',t.cancel);cancel.addEventListener('click',()=>{if(editing){activeEdit=null;editDrafts.delete(editingId);render();announce(t.editCancelled);if(!focusAction(editingId,'edit'))mainComposer.input.focus({preventScroll:true});}else{activeThread=null;render();announce(t.draftKept);if(!focusAction(targetId,'reply')&&!focusAction(threadId,'reply'))mainComposer.input.focus({preventScroll:true});}},{signal});actions.append(cancel);}
  actions.append(submit);controls.append(counter,actions);form.append(label,input,hint,controls,localStatus);
  input.addEventListener('input',saveDraft,{signal});
  form.addEventListener('submit',event=>{
   event.preventDefault();const text=input.value.trim();if(!text){input.setCustomValidity(t.required);input.reportValidity();return;}if(text.length>COMMENT_LIMIT)return;
   if(editing){commit({type:'edit',id:editingId,text,editedAt:Date.now()});activeEdit=null;editDrafts.delete(editingId);render();announce(t.edited);if(!focusAction(editingId,'edit'))mainComposer.input.focus({preventScroll:true});return;}
   const target=reply?(findItem(targetId)?.id||threadId):null,id=nextId();commit({type:'add',id,text,created:Date.now(),replyToId:target});
   if(reply){activeThread=null;render();announce(t.replySaved);[...discussion.querySelectorAll('article[data-comment-id]')].find(el=>el.dataset.commentId===id)?.focus({preventScroll:true});}
   else{input.value='';updateCount();render();announce(t.saved);input.focus({preventScroll:true});}
  },{signal});
  return {form,input};
 }
 const mainComposer=composer();root.append(mainComposer.form,status);
 const discussion=node('div','cp-comments-discussion');root.append(discussion);
 function message(item){
  const row=node('article','cp-comment'+(item.deleted?' cp-comment-deleted':''));row.dataset.commentId=item.id;row.tabIndex=-1;
  const top=node('div','cp-comment-top'),identity=node('div','cp-comment-identity'),avatar=node('span','cp-comment-avatar');avatar.setAttribute('aria-hidden','true');
  avatar.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';
  const details=node('div'),time=node('time');time.dateTime=new Date(item.created).toISOString();time.textContent=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(item.created);details.append(node('strong','',t.you),time);if(item.editedAt&&!item.deleted){const edited=node('span','cp-comment-edited',t.editedMark);edited.title=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(item.editedAt);details.append(edited);}identity.append(avatar,details);top.append(identity);
  if(!item.deleted){
   const ownerActions=node('div','cp-comment-owner-actions'),edit=button('cp-comment-edit',t.edit);edit.setAttribute('aria-label',t.editLabel);edit.dataset.commentAction='edit';edit.dataset.commentId=item.id;edit.setAttribute('aria-expanded',String(activeEdit===item.id));edit.setAttribute('aria-controls',kind+'-edit-form-'+item.id);
   edit.addEventListener('click',()=>{activeEdit=item.id;activeThread=null;if(!editDrafts.has(item.id))editDrafts.set(item.id,item.text);render();doc.getElementById(kind+'-edit-input-'+item.id)?.focus();},{signal});ownerActions.append(edit);
   const remove=button('cp-comment-remove',t.remove);remove.setAttribute('aria-label',t.removeLabel);remove.dataset.commentAction='remove';remove.dataset.commentId=item.id;remove.addEventListener('click',()=>{const threadId=item.parentId||item.id;commit({type:'remove',id:item.id});editDrafts.delete(item.id);if(activeEdit===item.id)activeEdit=null;if(!findItem(threadId))activeThread=null;render();announce(t.removed);restoreThreadFocus(threadId);},{signal});ownerActions.append(remove);top.append(ownerActions);
  }
  row.append(top);
  if(activeEdit===item.id&&!item.deleted){row.append(composer({editingId:item.id}).form);return row;}
  if(item.parentId&&item.replyToId!==item.parentId){const target=findItem(item.replyToId),context=node('p','cp-reply-context',t.replyTo+' '+(target&&!target.deleted?t.you+' : '+target.text.slice(0,80):t.deletedTarget));context.dir='auto';row.append(context);}
  const body=node('p','cp-comment-text',item.deleted?t.deleted:item.text);body.dir='auto';row.append(body);
  const actions=node('div','cp-comment-actions');
  if(!item.deleted){for(const reaction of ['like','dislike']){const reactionButton=button('cp-comment-reaction');reactionButton.dataset.commentAction=reaction;reactionButton.dataset.commentId=item.id;reactionButton.setAttribute('aria-pressed',String(item.reaction===reaction));reactionButton.title=t.localReaction;const glyph=node('span','cp-reaction-icon',reaction==='like'?'♡':'');glyph.setAttribute('aria-hidden','true');if(reaction==='dislike')glyph.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 3h13v10h-6l1 5c.3 2-2 3-3 1l-5-6V3ZM3 3h4v10H3z"/></svg>';const count=node('span','cp-reaction-count',new Intl.NumberFormat(locale).format(Number(item.reaction===reaction)));reactionButton.append(glyph,node('span','',t[reaction]),count);reactionButton.addEventListener('click',()=>{commit({type:'react',id:item.id,reaction});const next=findItem(item.id)?.reaction;render();focusAction(item.id,reaction);announce(next==='like'?t.liked:next==='dislike'?t.disliked:t.reactionRemoved);},{signal});actions.append(reactionButton);}}
  const threadId=item.parentId||item.id,reply=button('cp-comment-reply',t.reply);reply.dataset.commentAction='reply';reply.dataset.commentId=item.id;reply.setAttribute('aria-expanded',String(activeThread===threadId&&state.replyDrafts[threadId]?.targetId===item.id));reply.setAttribute('aria-controls',kind+'-reply-form-'+threadId);
  if(!item.parentId&&state.replyDrafts[threadId]?.text)reply.append(node('span','cp-comment-draft',t.draft));
  reply.addEventListener('click',()=>{activeThread=threadId;activeEdit=null;commit({type:'reply-draft',threadId,targetId:item.id,text:state.replyDrafts[threadId]?.text||''});render();doc.getElementById(kind+'-reply-input-'+threadId)?.focus();},{signal});actions.append(reply);row.append(actions);return row;
 }
 function render(){
  discussion.replaceChildren();
  if(!state.comments.length){const empty=node('div','cp-comments-empty');empty.append(node('h3','',t.empty),node('p','',t.first));discussion.append(empty);return;}
  const list=node('ol','cp-comments-list');list.setAttribute('aria-label',t.list);
  for(const item of state.comments.filter(item=>!item.parentId).reverse()){
   const thread=node('li','cp-comment-thread');thread.append(message(item));const replies=state.comments.filter(reply=>reply.parentId===item.id);
   if(replies.length){const children=node('ol','cp-comment-replies');children.setAttribute('aria-label',t.replies);for(const child of replies){const li=node('li');li.append(message(child));children.append(li);}thread.append(children);}
   if(activeThread===item.id){const draft=state.replyDrafts[item.id];thread.append(composer({threadId:item.id,targetId:draft?.targetId||item.id}).form);}
   list.append(thread);
  }
  discussion.append(list);
 }
 render();return root;
}
