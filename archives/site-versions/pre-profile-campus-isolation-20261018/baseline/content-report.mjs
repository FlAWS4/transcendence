export const REPORT_STORAGE_KEY='horizon-archive-pre-profile-campus-isolation-20261018-content-reports-v1';
export const REPORT_DETAIL_LIMIT=1000;
export const REPORT_REASONS=Object.freeze(['spam','harassment','hate','privacy','impersonation','other']);
const copy={
 fr:{action:'Signaler',project:'Signaler ce projet',article:'Signaler cet article',profile:'Signaler ce profil',comment:'Signaler ce commentaire',intro:'Ce signalement reste dans cet onglet, sans envoi à une équipe de modération.',reason:'Motif du signalement',choose:'Choisissez un motif',details:'Précisions (facultatif)',placeholder:'Expliquez ce qui pose problème…',required:'Choisissez un motif pour continuer.',tooLong:'Limitez les précisions à 1 000 caractères.',submit:'Enregistrer le signalement',cancel:'Annuler',close:'Fermer',saved:'Signalement enregistré.',already:'Vous avez déjà signalé ce contenu.',reasons:{spam:'Spam ou publicité indésirable',harassment:'Harcèlement ou intimidation',hate:'Contenu haineux ou violent',privacy:'Atteinte à la vie privée',impersonation:'Usurpation d’identité',other:'Autre motif'}},
 en:{action:'Report',project:'Report this project',article:'Report this article',profile:'Report this profile',comment:'Report this comment',intro:'This report stays in this tab and is not sent to a moderation team.',reason:'Reason for reporting',choose:'Choose a reason',details:'Details (optional)',placeholder:'Explain what is wrong…',required:'Choose a reason to continue.',tooLong:'Keep details within 1,000 characters.',submit:'Save report',cancel:'Cancel',close:'Close',saved:'Report saved.',already:'You have already reported this content.',reasons:{spam:'Spam or unwanted advertising',harassment:'Harassment or bullying',hate:'Hateful or violent content',privacy:'Privacy violation',impersonation:'Impersonation',other:'Another reason'}},
 ar:{action:'إبلاغ',project:'الإبلاغ عن هذا المشروع',article:'الإبلاغ عن هذا المقال',profile:'الإبلاغ عن هذا الملف',comment:'الإبلاغ عن هذا التعليق',intro:'يبقى البلاغ في علامة التبويب هذه ولا يُرسل إلى فريق الإشراف.',reason:'سبب الإبلاغ',choose:'اختر سببًا',details:'تفاصيل (اختياري)',placeholder:'وضّح المشكلة…',required:'اختر سببًا للمتابعة.',tooLong:'يجب ألا تتجاوز التفاصيل ١٠٠٠ حرف.',submit:'حفظ البلاغ',cancel:'إلغاء',close:'إغلاق',saved:'حُفظ البلاغ.',already:'لقد أبلغت عن هذا المحتوى.',reasons:{spam:'رسائل مزعجة أو إعلانات غير مرغوبة',harassment:'مضايقة أو تنمّر',hate:'محتوى يحض على الكراهية أو العنف',privacy:'انتهاك الخصوصية',impersonation:'انتحال الهوية',other:'سبب آخر'}},
};
const languageOf=locale=>Object.hasOwn(copy,locale)?locale:'fr';
const kinds=['project','article','profile','comment'];
export function reportTargetKey(target){
 if(!target||!kinds.includes(target.kind)||typeof target.id!=='string'||!target.id)return null;
 if(target.kind==='comment'&&(!['project','article'].includes(target.parentKind)||typeof target.parentId!=='string'||!target.parentId))return null;
 return JSON.stringify([target.kind,target.id,target.kind==='comment'?target.parentKind:null,target.kind==='comment'?target.parentId:null]);
}
/** Local prototype state only: no account, network request or moderation queue. */
export function createReportStore({storage=()=>globalThis.sessionStorage,now=()=>new Date().toISOString()}={}){
 const records=new Map();
 try{
  const saved=JSON.parse(storage()?.getItem(REPORT_STORAGE_KEY)||'null');
  if(saved?.version===1&&Array.isArray(saved.reports))for(const item of saved.reports.slice(-200)){
   const key=reportTargetKey(item?.target);
   if(key&&REPORT_REASONS.includes(item.reason)&&typeof item.details==='string'&&item.details.length<=REPORT_DETAIL_LIMIT&&typeof item.createdAt==='string'&&Number.isFinite(Date.parse(item.createdAt)))records.set(key,{target:JSON.parse(JSON.stringify(item.target)),reason:item.reason,details:item.details,createdAt:item.createdAt});
  }
 }catch{}
 const get=target=>{const item=records.get(reportTargetKey(target));return item?JSON.parse(JSON.stringify(item)):null;};
 function submit({target,reason,details=''}){
  const key=reportTargetKey(target);
  if(!key||!REPORT_REASONS.includes(reason)||typeof details!=='string'||details.length>REPORT_DETAIL_LIMIT)return {ok:false};
  if(records.has(key))return {ok:true,duplicate:true,report:get(target)};
  const reference={kind:target.kind,id:target.id,...(target.kind==='comment'?{parentKind:target.parentKind,parentId:target.parentId}:{})};
  records.set(key,{target:reference,reason,details:details.trim(),createdAt:now()});
  while(records.size>200)records.delete(records.keys().next().value);
  try{storage()?.setItem(REPORT_STORAGE_KEY,JSON.stringify({version:1,reports:[...records.values()]}));}catch{}
  return {ok:true,duplicate:false,report:get(target)};
 }
 return {get,submit};
}
const stores=new WeakMap(),dialogs=new WeakMap();
let sequence=0;
const flag='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4m0 0c5-4 9 4 14 0v10c-5 4-9-4-14 0"/></svg>';
export function createReportButton({doc=document,target,locale='fr',signal,sizeLabel=''}){
 const t=copy[languageOf(locale)],button=doc.createElement('button');button.type='button';button.className='cp-report-trigger';button.dataset.reportKind=target.kind;
 button.title=t[target.kind];button.setAttribute('aria-label',t[target.kind]);button.setAttribute('aria-haspopup','dialog');button.innerHTML=flag;
 const label=doc.createElement('span');label.textContent=t.action;button.append(label);
 if(sizeLabel){const measure=doc.createElement('span');measure.className='cp-report-size-label';measure.setAttribute('aria-hidden','true');measure.textContent=sizeLabel;button.append(measure);}
 button.addEventListener('click',()=>openReportDialog({doc,target,locale,trigger:button,signal}),{signal});return button;
}
export function openReportDialog({doc=document,target,locale='fr',trigger,signal,store}){
 if(signal?.aborted||!reportTargetKey(target))return null;
 dialogs.get(doc)?.close(false);
 if(!store){if(!stores.has(doc))stores.set(doc,createReportStore({storage:()=>doc.defaultView.sessionStorage}));store=stores.get(doc);}
 const language=languageOf(locale),t=copy[language],lifecycle=new AbortController(),events={signal:lifecycle.signal};
 const node=(tag,className,text)=>{const el=doc.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const dialog=node('dialog','cp-report-dialog'),id='content-report-'+(++sequence);dialog.id=id;dialog.lang=language;dialog.dir=language==='ar'?'rtl':'ltr';
 dialog.setAttribute('aria-labelledby',id+'-title');dialog.setAttribute('aria-describedby',id+'-intro');
 let closed=false;
 function close(restore=true){
  if(closed)return;closed=true;lifecycle.abort();
  if(dialogs.get(doc)?.dialog===dialog)dialogs.delete(doc);
  if(dialog.open)dialog.close();dialog.remove();
  if(restore&&trigger?.isConnected&&!trigger.closest('[hidden]'))trigger.focus({preventScroll:true});
 }
 const form=node('form','cp-report-form');form.noValidate=true;
 const header=node('header','cp-report-header'),title=node('h2','',t[target.kind]);title.id=id+'-title';title.tabIndex=-1;
 const dismiss=node('button','cp-report-close');dismiss.type='button';dismiss.setAttribute('aria-label',t.close);dismiss.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';dismiss.addEventListener('click',()=>close(),events);header.append(title,dismiss);
 const body=node('div','cp-report-body'),intro=node('p','cp-report-intro',t.intro);intro.id=id+'-intro';body.append(intro);
 if(target.title){const context=node('p','cp-report-target',String(target.title));context.dir='auto';body.append(context);}
 const fields=node('div','cp-report-fields'),reasonLabel=node('label','',t.reason),reason=node('select');reason.id=id+'-reason';reason.name='reason';reason.required=true;reasonLabel.htmlFor=reason.id;
 const placeholder=node('option','',t.choose);placeholder.value='';reason.append(placeholder);
 for(const value of REPORT_REASONS){const option=node('option','',t.reasons[value]);option.value=value;reason.append(option);}
 const detailsLabel=node('label','',t.details),details=node('textarea');details.id=id+'-details';details.name='details';details.maxLength=REPORT_DETAIL_LIMIT;details.rows=4;details.dir='auto';details.placeholder=t.placeholder;detailsLabel.htmlFor=details.id;
 const count=node('p','cp-report-count');count.id=id+'-count';details.setAttribute('aria-describedby',count.id);
 const updateCount=()=>{count.textContent=new Intl.NumberFormat(language).format(details.value.length)+' / '+new Intl.NumberFormat(language).format(REPORT_DETAIL_LIMIT);};updateCount();
 details.addEventListener('input',()=>{details.setCustomValidity('');updateCount();},events);reason.addEventListener('change',()=>reason.setCustomValidity(''),events);
 fields.append(reasonLabel,reason,detailsLabel,details,count);body.append(fields);
 const footer=node('footer','cp-report-footer'),cancel=node('button','cp-report-cancel',t.cancel),submit=node('button','cp-report-submit',t.submit);cancel.type='button';submit.type='submit';cancel.addEventListener('click',()=>close(),events);footer.append(cancel,submit);
 function showSaved(report,duplicate=false){
  const result=node('p','cp-report-result',duplicate?t.already:t.saved);result.tabIndex=-1;
  const summary=node('p','cp-report-saved-reason',t.reason+' : '+t.reasons[report.reason]);fields.replaceChildren(result,summary);
  const done=node('button','cp-report-submit',t.close);done.type='button';done.addEventListener('click',()=>close(),events);footer.replaceChildren(done);result.focus({preventScroll:true});
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!REPORT_REASONS.includes(reason.value)){reason.setCustomValidity(t.required);reason.reportValidity();reason.focus({preventScroll:true});return;}
  if(details.value.length>REPORT_DETAIL_LIMIT){details.setCustomValidity(t.tooLong);details.reportValidity();return;}
  const result=store.submit({target,reason:reason.value,details:details.value});if(result.ok)showSaved(result.report,result.duplicate);
 },events);
 form.append(header,body,footer);dialog.append(form);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();},events);dialog.addEventListener('close',()=>close(),events);
 let backdropDown=false;
 const outside=event=>{const rect=dialog.getBoundingClientRect();return event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom);};
 dialog.addEventListener('pointerdown',event=>{backdropDown=outside(event);},events);dialog.addEventListener('click',event=>{if(backdropDown&&outside(event))close();backdropDown=false;},events);
 signal?.addEventListener('abort',()=>close(false),{once:true,...events});
 const api={dialog,close};dialogs.set(doc,api);doc.body.append(dialog);dialog.showModal();
 const saved=store.get(target);if(saved)showSaved(saved,true);else title.focus({preventScroll:true});
 return api;
}
