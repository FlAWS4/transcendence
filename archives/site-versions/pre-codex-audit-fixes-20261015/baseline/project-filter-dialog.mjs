const copy={
 fr:{filter:'Filtrer',title:'Filtrer les projets',intro:'Sélectionnez une catégorie entière ou dépliez-la pour choisir ses critères.',projects:'Projets',technologies:'Technologies',skills:'Savoir-faire',apply:'Appliquer',cancel:'Annuler',reset:'Réinitialiser',close:'Fermer les filtres',empty:'Aucun choix disponible.',all:'Aucun critère sélectionné',selected:'{count} critères sélectionnés',selectedOne:'1 critère sélectionné',resetNotice:'La sélection est réinitialisée. Appliquez pour confirmer.',selectAll:'Tout sélectionner',deselectAll:'Tout désélectionner'},
 en:{filter:'Filter',title:'Filter projects',intro:'Select a whole category or expand it to choose individual criteria.',projects:'Projects',technologies:'Technologies',skills:'Skills',apply:'Apply',cancel:'Cancel',reset:'Reset',close:'Close filters',empty:'No options available.',all:'No criteria selected',selected:'{count} criteria selected',selectedOne:'1 criterion selected',resetNotice:'Selection reset. Apply to confirm.',selectAll:'Select all',deselectAll:'Deselect all'},
 ar:{filter:'تصفية',title:'تصفية المشاريع',intro:'اختر فئة كاملة أو افتحها لاختيار المعايير بشكل فردي.',projects:'المشاريع',technologies:'التقنيات',skills:'المهارات',apply:'تطبيق',cancel:'إلغاء',reset:'إعادة ضبط',close:'إغلاق المرشحات',empty:'لا توجد خيارات متاحة.',all:'لم تُحدَّد معايير',selected:'عدد المعايير المحددة: {count}',resetNotice:'أُعيد ضبط الاختيارات. اضغط تطبيق للتأكيد.',selectAll:'تحديد الكل',deselectAll:'إلغاء تحديد الكل'},
};
const profileCopy={fr:{title:'Filtrer les profils',status:'Statut',arrival:'Rentrée'},en:{title:'Filter profiles',status:'Status',arrival:'Arrival year'},ar:{title:'تصفية الأعضاء',status:'الحالة',arrival:'سنة الالتحاق'}};
const languageOf=locale=>Object.hasOwn(copy,locale)?locale:'fr';
export const projectFilterDialogLabel=locale=>copy[languageOf(locale)].filter;

/** Keep the caller's options and labels; route each value to its own facet. */
export function projectFilterDialogSections(filter={}){
 const people=filter.kind==='people',sections=people?{status:[],arrival:[]}:{projects:[],technologies:[],skills:[]},seen=new Set();
 for(const option of Array.isArray(filter.options)?filter.options:[]){
  if(!option||typeof option.value!=='string'||option.value==='all'||seen.has(option.value))continue;
  seen.add(option.value);
  const section=people?(option.group==='arrival'||option.value.startsWith('arrival:')?'arrival':'status'):option.group==='technologies'||option.value.startsWith('tech:')?'technologies':option.group==='skills'||option.value.startsWith('skill:')?'skills':'projects';
  sections[section].push(option);
 }
 return sections;
}

/** All categories start folded; their independent draft survives every fold. */
export function createProjectFilterDialog({doc,trigger,idPrefix='content',onApply,onClose=()=>{}}){
 let active=null;
 const restoreFocus=()=>{if(trigger.isConnected&&!trigger.closest('[hidden]'))trigger.focus({preventScroll:true});};
 function close(restore=true){
  if(!active)return;
  const current=active;active=null;current.controller.abort();
  if(current.dialog.open)current.dialog.close();
  current.dialog.remove();onClose();if(restore)restoreFocus();
 }
 function open(filter,locale='fr'){
  close(false);
  const language=languageOf(locale),people=filter.kind==='people',t={...copy[language],...(people?profileCopy[language]:{})},sections=projectFilterDialogSections(filter),allOptions=Object.values(sections).flat();
  const valid=new Set(allOptions.map(option=>option.value)),draft=new Set((Array.isArray(filter.values)?filter.values:[]).filter(value=>valid.has(value)));
  const controller=new AbortController(),signal=controller.signal,number=new Intl.NumberFormat(language);
  const node=(tag,className,text)=>{const element=doc.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
  const dialog=node('dialog','cp-project-filter-dialog');dialog.id=idPrefix+'-category-dialog';dialog.dir=language==='ar'?'rtl':'ltr';dialog.lang=language;dialog.dataset.kind=people?'people':'projects';
  dialog.setAttribute('aria-labelledby',dialog.id+'-title');dialog.setAttribute('aria-describedby',dialog.id+'-intro');
  const form=node('form','cp-project-filter-form');form.noValidate=true;
  const header=node('header','cp-project-filter-header'),heading=node('div','cp-project-filter-heading'),title=node('h2','',t.title);title.id=dialog.id+'-title';title.tabIndex=-1;
  const intro=node('p','',t.intro);intro.id=dialog.id+'-intro';heading.append(title,intro);
  const dismiss=node('button','cp-project-filter-close');dismiss.type='button';dismiss.setAttribute('aria-label',t.close);dismiss.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  dismiss.addEventListener('click',()=>close(),{signal});header.append(heading,dismiss);
  const body=node('div','cp-project-filter-body'),inputs=[],collectives=[];
  const count=node('p','cp-project-filter-count'),status=node('p','cp-project-filter-status');status.setAttribute('role','status');
  const selectionText=total=>total===1&&t.selectedOne?t.selectedOne:t.selected.replace('{count}',number.format(total));
  function update(){
   for(const {input,value}of inputs)input.checked=draft.has(value);
   for(const {button,label,badge,values,title}of collectives){
    const total=values.filter(value=>draft.has(value)).length,all=values.length>0&&total===values.length;
    button.disabled=!values.length;button.setAttribute('aria-pressed',all?'true':total?'mixed':'false');
    label.textContent=all?t.deselectAll:t.selectAll;button.setAttribute('aria-label',label.textContent+' · '+title);
    badge.textContent=number.format(total);badge.dataset.selected=String(total>0);badge.setAttribute('aria-label',selectionText(total));
   }
   count.textContent=draft.size?selectionText(draft.size):t.all;
  }
  function appendChoice(parent,option){
   const label=node('label','cp-project-filter-choice'),input=node('input');input.type='checkbox';input.value=option.value;input.name='criteria';
   label.append(input,node('span','',option.label||option.value));parent.append(label);inputs.push({input,value:option.value});
   input.addEventListener('change',()=>{if(input.checked)draft.add(option.value);else draft.delete(option.value);status.textContent='';update();},{signal});
  }
  let groupId=0;
  function appendGroup(parent,{key,title,options,nested=false,render}){
   const group=node('section',nested?'cp-project-filter-group':'cp-project-filter-section');group.dataset[nested?'group':'facet']=key;
   const row=node('div','cp-project-filter-category'),heading=node(nested?'h4':'h3','cp-project-filter-category-heading');
   const toggle=node('button','cp-project-filter-toggle');toggle.type='button';toggle.id=dialog.id+'-toggle-'+(++groupId);toggle.setAttribute('aria-expanded','false');
   const choices=node('div','cp-project-filter-children');choices.id=dialog.id+'-choices-'+groupId;choices.hidden=true;toggle.setAttribute('aria-controls',choices.id);group.setAttribute('aria-labelledby',toggle.id);
   const badge=node('span','cp-project-filter-section-count');
   toggle.append(node('span','cp-project-filter-section-label',title),badge);const arrow=node('span','cp-project-filter-chevron');arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 20 20"><path d="m5 7.5 5 5 5-5"/></svg>';toggle.append(arrow);
   toggle.addEventListener('click',()=>{choices.hidden=!choices.hidden;toggle.setAttribute('aria-expanded',String(!choices.hidden));},{signal});
   const bulk=node('button','cp-project-filter-all');bulk.type='button';const check=node('span','cp-project-filter-bulk-check');check.setAttribute('aria-hidden','true');const label=node('span');bulk.append(check,label);
   const values=options.map(option=>option.value);collectives.push({button:bulk,label,badge,values,title});
   bulk.addEventListener('click',()=>{const all=values.length>0&&values.every(value=>draft.has(value));for(const value of values)if(all)draft.delete(value);else draft.add(value);status.textContent='';update();},{signal});
   heading.append(toggle);row.append(heading,bulk);group.append(row,choices);parent.append(group);
   if(render)render(choices);else if(options.length){const grid=node('div','cp-project-filter-options');for(const option of options)appendChoice(grid,option);choices.append(grid);}else choices.append(node('p','cp-project-filter-empty',t.empty));
  }
  for(const [sectionName,options]of Object.entries(sections)){
   const groups=Array.isArray(filter.groups)?filter.groups:[],title=groups.find(group=>group.value===sectionName)?.label||t[sectionName];
   appendGroup(body,{key:sectionName,title,options,...(sectionName==='projects'?{render(parent){
    const grouped=new Set();
    for(const definition of groups){const members=options.filter(option=>option.group===definition.value);if(!members.length)continue;members.forEach(option=>grouped.add(option.value));appendGroup(parent,{key:definition.value,title:definition.label||definition.value,options:members,nested:true});}
    const remaining=options.filter(option=>!grouped.has(option.value));if(remaining.length){const direct=node('div','cp-project-filter-options cp-project-filter-direct');for(const option of remaining)appendChoice(direct,option);parent.append(direct);}
    if(!options.length)parent.append(node('p','cp-project-filter-empty',t.empty));
   }}:{})});
  }
  const footer=node('footer','cp-project-filter-footer'),meta=node('div','cp-project-filter-meta'),actions=node('div','cp-project-filter-actions');
  const reset=node('button','cp-project-filter-reset',t.reset),cancel=node('button','cp-project-filter-cancel',t.cancel),apply=node('button','cp-project-filter-apply',t.apply);reset.type='button';cancel.type='button';apply.type='submit';
  reset.addEventListener('click',()=>{draft.clear();update();status.textContent=t.resetNotice;},{signal});cancel.addEventListener('click',()=>close(),{signal});
  meta.append(count,reset);actions.append(cancel,apply);footer.append(meta,status,actions);form.append(header,body,footer);dialog.append(form);
  form.addEventListener('submit',event=>{event.preventDefault();const values=allOptions.filter(option=>draft.has(option.value)).map(option=>option.value);close(false);try{onApply(values);}finally{restoreFocus();}},{signal});
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();},{signal});dialog.addEventListener('close',()=>close(),{signal});
  let backdropDown=false;
  const outside=event=>{const rect=dialog.getBoundingClientRect();return event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom);};
  dialog.addEventListener('pointerdown',event=>{backdropDown=outside(event);},{signal});dialog.addEventListener('click',event=>{if(backdropDown&&outside(event))close();backdropDown=false;},{signal});
  active={dialog,controller};update();doc.body.append(dialog);dialog.showModal();title.focus({preventScroll:true});
 }
 return {open,close,get isOpen(){return Boolean(active?.dialog.open);},contains:target=>Boolean(target&&active?.dialog.contains(target))};
}
