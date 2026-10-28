// Repository links entered here belong to this local author-interface trial.
const copy={
 fr:{repository:'Dépôt du projet',open:'Voir le dépôt',newTab:'nouvel onglet',instructions:'Instructions pour tester',empty:'Aucun dépôt renseigné',emptyHint:'L’auteur n’a pas encore partagé de lien pour tester ce projet.',add:'Ajouter un lien',edit:'Modifier le lien',url:'Lien du dépôt',urlHint:'Adresse complète commençant par https:// ou http://.',optional:'Instructions pour tester (facultatif)',save:'Enregistrer',cancel:'Annuler',remove:'Retirer le lien',note:'Essai auteur : les modifications restent dans cet onglet.',invalid:'Saisissez une adresse HTTP ou HTTPS valide, sans identifiant ni mot de passe.',tooLong:'Les instructions sont limitées à 5 000 caractères.'},
 en:{repository:'Project repository',open:'View repository',newTab:'new tab',instructions:'How to try the project',empty:'No repository added',emptyHint:'The author has not shared a link to try this project yet.',add:'Add a link',edit:'Edit link',url:'Repository link',urlHint:'Full address starting with https:// or http://.',optional:'Instructions to try the project (optional)',save:'Save',cancel:'Cancel',remove:'Remove link',note:'Author trial: changes stay in this tab.',invalid:'Enter a valid HTTP or HTTPS address without a username or password.',tooLong:'Instructions are limited to 5,000 characters.'},
 ar:{repository:'مستودع المشروع',open:'عرض المستودع',newTab:'علامة تبويب جديدة',instructions:'طريقة تجربة المشروع',empty:'لم يُضف مستودع بعد',emptyHint:'لم يشارك المؤلف رابطًا لتجربة هذا المشروع بعد.',add:'إضافة رابط',edit:'تعديل الرابط',url:'رابط المستودع',urlHint:'عنوان كامل يبدأ بـ https:// أو http://.',optional:'تعليمات تجربة المشروع (اختياري)',save:'حفظ',cancel:'إلغاء',remove:'إزالة الرابط',note:'تجربة للمؤلف: تبقى التعديلات في علامة التبويب هذه.',invalid:'أدخل عنوان HTTP أو HTTPS صالحًا بدون اسم مستخدم أو كلمة مرور.',tooLong:'الحد الأقصى للتعليمات هو 5000 حرف.'},
};
const prefix='horizon-project-repository-v1:';
const memory=new Map(),drafts=new Map();
let nextFieldId=0;
const localized=(value,locale)=>typeof value==='string'?value:value?.[locale]||value?.en||value?.fr||value?.ar||'';

/** Match the explicit public-web-URL policy used for profile social links. */
export function normalizeProjectRepository(value){
 if(!value||typeof value.url!=='string')return null;
 const candidate=value.url.trim();
 if(!/^https?:\/\//i.test(candidate))return null;
 let url;
 try{url=new URL(candidate);}catch{return null;}
 if(!['http:','https:'].includes(url.protocol)||!url.hostname||url.username||url.password)return null;
 let instructions='';
 if(typeof value.instructions==='string')instructions=value.instructions;
 else if(value.instructions&&typeof value.instructions==='object'){
  instructions=Object.fromEntries(['fr','en','ar'].filter(key=>typeof value.instructions[key]==='string').map(key=>[key,value.instructions[key]]));
 }
 return {url:url.href,instructions};
}

export function createProjectTrial({doc,entry,locale='fr',signal,storage}){
 const language=Object.hasOwn(copy,locale)?locale:'fr',t=copy[language];
 const node=(tag,className,text)=>{const el=doc.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const root=node('div','cp-project-trial');
 if(signal?.aborted)return root;
 const id=typeof entry?.id==='string'&&entry.id.trim()?entry.id:null;
 let store=storage;
 if(store===undefined){try{store=doc.defaultView?.sessionStorage;}catch{store=null;}}
 let repository=normalizeProjectRepository(entry?.repository);
 if(id&&memory.has(id))repository=memory.get(id);
 else if(id&&store){
  try{
   const raw=store.getItem(prefix+id);
   if(raw!==null){const saved=JSON.parse(raw);if(saved===null)repository=null;else{const parsed=normalizeProjectRepository(saved);if(parsed)repository=parsed;}}
  }catch{/* Blocked or malformed storage leaves the supplied project data intact. */}
 }
 let draft=id?drafts.get(id):null,renderController=null;
 signal?.addEventListener('abort',()=>renderController?.abort(),{once:true});
 const listen=(element,type,handler)=>element.addEventListener(type,handler,{signal:renderController.signal});
 const clearDraft=()=>{draft=null;if(id)drafts.delete(id);};
 function persist(value){
  repository=value;
  if(!id)return;
  memory.set(id,value);
  try{store?.setItem(prefix+id,JSON.stringify(value));}catch{/* This tab still has the memory copy. */}
 }
 function render({focusAction=false,focusField=false}={}){
  if(signal?.aborted)return;
  renderController?.abort();renderController=new AbortController();
  root.replaceChildren();
  if(repository){
   const section=node('section','cp-project-trial-mode');
   section.append(node('h3','',t.repository));
   const address=node('bdi','cp-project-repository-url',repository.url);address.dir='ltr';section.append(address);
   const link=node('a','cp-project-trial-open',t.open);link.href=repository.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',t.open+' · '+t.newTab);
   const marker=node('span','cp-project-trial-new-tab','↗');marker.setAttribute('aria-hidden','true');link.append(marker);section.append(link);
   const instructions=localized(repository.instructions,language);
   if(instructions.trim()){const text=node('p','cp-project-repository-instructions',instructions);text.dir='auto';section.append(node('h4','',t.instructions),text);}
   root.append(section);
  }else{
   const empty=node('section','cp-project-trial-empty');empty.append(node('h3','',t.empty),node('p','',t.emptyHint));root.append(empty);
  }
  if(!draft){
   const edit=node('button','cp-project-repository-edit',repository?t.edit:t.add);edit.type='button';
   listen(edit,'click',()=>{
    draft={url:repository?.url||'',instructions:localized(repository?.instructions,language)};
    if(id)drafts.set(id,draft);
    render({focusField:true});
   });
   root.append(edit);if(focusAction)edit.focus();return;
  }
  const form=node('form','cp-project-repository-form');form.noValidate=true;
  const note=node('p','cp-project-repository-note',t.note);note.id='project-repository-note-'+(++nextFieldId);form.append(note);
  const urlField=node('label','cp-project-repository-field'),urlLabel=node('span','',t.url),urlInput=node('input','cp-project-repository-input');
  urlInput.type='url';urlInput.name='repository-url';urlInput.required=true;urlInput.dir='ltr';urlInput.value=draft.url;urlInput.autocomplete='off';urlInput.spellcheck=false;
  const hint=node('span','cp-project-repository-note',t.urlHint);hint.id='project-repository-hint-'+nextFieldId;
  urlInput.setAttribute('aria-describedby',hint.id+' '+note.id);urlField.append(urlLabel,urlInput,hint);
  const instructionsField=node('label','cp-project-repository-field'),instructionsLabel=node('span','',t.optional),instructionsInput=node('textarea','cp-project-repository-textarea');
  instructionsInput.name='repository-instructions';instructionsInput.rows=5;instructionsInput.maxLength=5000;instructionsInput.dir='auto';instructionsInput.value=draft.instructions;
  instructionsField.append(instructionsLabel,instructionsInput);
  const error=node('p','cp-project-repository-error');error.id='project-repository-error-'+nextFieldId;error.setAttribute('role','alert');error.hidden=true;
  const actions=node('div','cp-project-repository-actions'),save=node('button','',t.save),cancel=node('button','',t.cancel);save.type='submit';cancel.type='button';actions.append(save,cancel);
  form.append(urlField,instructionsField,error,actions);root.append(form);
  const syncDraft=()=>{draft.url=urlInput.value;draft.instructions=instructionsInput.value;if(id)drafts.set(id,draft);};
  const clearError=()=>{error.hidden=true;error.textContent='';urlInput.removeAttribute('aria-invalid');instructionsInput.removeAttribute('aria-invalid');urlInput.setAttribute('aria-describedby',hint.id+' '+note.id);instructionsInput.removeAttribute('aria-describedby');};
  listen(urlInput,'input',()=>{syncDraft();clearError();});listen(instructionsInput,'input',()=>{syncDraft();clearError();});
  listen(form,'submit',event=>{
   event.preventDefault();syncDraft();clearError();
   const value=normalizeProjectRepository({url:draft.url,instructions:draft.instructions});
   const invalidInput=!value?urlInput:draft.instructions.length>5000?instructionsInput:null;
   if(invalidInput){
    error.textContent=!value?t.invalid:t.tooLong;error.hidden=false;
    invalidInput.setAttribute('aria-invalid','true');invalidInput.setAttribute('aria-describedby',(invalidInput===urlInput?hint.id+' ':'')+error.id);invalidInput.focus();return;
   }
   persist(value);clearDraft();render({focusAction:true});
  });
  listen(cancel,'click',()=>{clearDraft();render({focusAction:true});});
  if(repository){const remove=node('button','',t.remove);remove.type='button';actions.append(remove);listen(remove,'click',()=>{persist(null);clearDraft();render({focusAction:true});});}
  if(focusField)urlInput.focus();
 }
 render();return root;
}
