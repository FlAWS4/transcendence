// Local prototype only: no account, network request or shared discussion.
const memory = new Map();
const limit = 2000;
const copy = {
 fr:{intro:'Une question, une idée ou un retour à partager ?',label:'Votre commentaire',placeholder:'Écrivez votre commentaire…',hint:'Démonstration : vos commentaires restent dans cet onglet, sans publication réelle.',add:'Ajouter (démo)',empty:'Aucun commentaire pour le moment.',first:'Ouvrez la discussion en partageant votre premier retour.',you:'Vous',remove:'Supprimer',removeLabel:'Supprimer votre commentaire',saved:'Commentaire ajouté à la démonstration.',removed:'Commentaire supprimé.',required:'Écrivez quelques mots avant d’ajouter votre commentaire.',count:'{count} / 2 000 caractères',list:'Commentaires de cet essai'},
 en:{intro:'Have a question, an idea or some feedback?',label:'Your comment',placeholder:'Write your comment…',hint:'Demo: your comments stay in this tab and are not published.',add:'Add (demo)',empty:'No comments yet.',first:'Start the discussion with your first thoughts.',you:'You',remove:'Delete',removeLabel:'Delete your comment',saved:'Comment added to the demo.',removed:'Comment deleted.',required:'Write a few words before adding your comment.',count:'{count} / 2,000 characters',list:'Comments in this demo'},
 ar:{intro:'هل لديك سؤال أو فكرة أو ملاحظة؟',label:'تعليقك',placeholder:'اكتب تعليقك…',hint:'عرض تجريبي: تبقى تعليقاتك في علامة التبويب هذه ولا تُنشر فعليًا.',add:'إضافة (تجريبي)',empty:'لا توجد تعليقات بعد.',first:'ابدأ النقاش بمشاركة رأيك.',you:'أنت',remove:'حذف',removeLabel:'حذف تعليقك',saved:'أُضيف التعليق إلى العرض التجريبي.',removed:'حُذف التعليق.',required:'اكتب بضع كلمات قبل إضافة تعليقك.',count:'{count} / ٢٠٠٠ حرف',list:'تعليقات هذا العرض التجريبي'},
};

function readState(view,key){
 if(memory.has(key))return memory.get(key);
 let raw;
 try{raw=JSON.parse(view.sessionStorage.getItem(key));}catch{}
 const state={draft:typeof raw?.draft==='string'?raw.draft.slice(0,limit):'',comments:[]};
 if(Array.isArray(raw?.comments))state.comments=raw.comments.filter(item=>item&&typeof item.id==='string'&&typeof item.text==='string'&&item.text.trim()&&item.text.length<=limit&&Number.isFinite(item.created)&&Number.isFinite(new Date(item.created).getTime())).map(({id,text,created})=>({id,text,created}));
 memory.set(key,state);return state;
}

export function createComments({doc=document,entryId,kind,locale='fr',signal}){
 const view=doc.defaultView,t=copy[locale]||copy.fr,key='horizon-comments-demo-v1:'+kind+':'+entryId,state=readState(view,key);
 const save=()=>{try{view.sessionStorage.setItem(key,JSON.stringify(state));}catch{/* In-memory use still works when storage is unavailable. */}};
 const node=(tag,className,text)=>{const el=doc.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const root=node('div','cp-comments');
 root.append(node('p','cp-project-section-intro',t.intro));
 const form=node('form','cp-comments-form'),label=node('label','cp-comments-label',t.label),input=node('textarea');
 input.id=kind+'-comment-input';input.name='comment';input.rows=4;input.maxLength=limit;input.required=true;input.dir='auto';input.placeholder=t.placeholder;input.value=state.draft;label.htmlFor=input.id;
 const hint=node('p','cp-comments-hint',t.hint);hint.id=kind+'-comment-hint';input.setAttribute('aria-describedby',hint.id);
 const controls=node('div','cp-comments-controls'),counter=node('span','cp-comments-count'),submit=node('button','cp-comments-submit',t.add);submit.type='submit';
 const updateCount=()=>{counter.textContent=t.count.replace('{count}',new Intl.NumberFormat(locale).format(input.value.length));};updateCount();
 const status=node('p','cp-comments-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 controls.append(counter,submit);form.append(label,input,hint,controls,status);root.append(form);
 const discussion=node('div','cp-comments-discussion');root.append(discussion);
 function render(){
  discussion.replaceChildren();
  if(!state.comments.length){const empty=node('div','cp-comments-empty');empty.append(node('h3','',t.empty),node('p','',t.first));discussion.append(empty);return;}
  const list=node('ol','cp-comments-list');list.setAttribute('aria-label',t.list);
  for(const item of [...state.comments].reverse()){
   const row=node('li','cp-comment'),top=node('div','cp-comment-top'),identity=node('div','cp-comment-identity'),avatar=node('span','cp-comment-avatar');avatar.setAttribute('aria-hidden','true');
   avatar.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';
   const details=node('div'),time=node('time');time.dateTime=new Date(item.created).toISOString();time.textContent=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(item.created);
   details.append(node('strong','',t.you),time);identity.append(avatar,details);
   const remove=node('button','cp-comment-remove',t.remove);remove.type='button';remove.setAttribute('aria-label',t.removeLabel);
   remove.addEventListener('click',()=>{state.comments=state.comments.filter(comment=>comment.id!==item.id);save();render();status.textContent=t.removed;input.focus({preventScroll:true});},{signal});
   top.append(identity,remove);const body=node('p','cp-comment-text',item.text);body.dir='auto';row.append(top,body);list.append(row);
  }
  discussion.append(list);
 }
 input.addEventListener('input',()=>{input.setCustomValidity('');state.draft=input.value;save();updateCount();status.textContent='';},{signal});
 form.addEventListener('submit',event=>{
  event.preventDefault();const text=input.value.trim();
  if(!text){input.setCustomValidity(t.required);input.reportValidity();return;}
  if(text.length>limit)return;
  state.comments.push({id:view.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2),text,created:Date.now()});state.draft='';save();input.value='';updateCount();render();status.textContent=t.saved;input.focus({preventScroll:true});
 },{signal});
 render();return root;
}
