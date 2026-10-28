const copy={
 fr:{filter:'Filtrer',title:'Filtrer les projets',intro:'Choisissez vos critères, puis appliquez-les pour voir les projets correspondants.',projects:'Projets',technologies:'Technologies',skills:'Savoir-faire',apply:'Appliquer',cancel:'Annuler',reset:'Réinitialiser',close:'Fermer les filtres',empty:'Aucun choix disponible.',all:'Aucun critère sélectionné',selected:'{count} critères sélectionnés',resetNotice:'La sélection est réinitialisée. Appliquez pour confirmer.'},
 en:{filter:'Filter',title:'Filter projects',intro:'Choose your criteria, then apply them to see matching projects.',projects:'Projects',technologies:'Technologies',skills:'Skills',apply:'Apply',cancel:'Cancel',reset:'Reset',close:'Close filters',empty:'No options available.',all:'No criteria selected',selected:'{count} criteria selected',resetNotice:'Selection reset. Apply to confirm.'},
 ar:{filter:'تصفية',title:'تصفية المشاريع',intro:'اختر المعايير ثم طبّقها لعرض المشاريع المطابقة.',projects:'المشاريع',technologies:'التقنيات',skills:'المهارات',apply:'تطبيق',cancel:'إلغاء',reset:'إعادة ضبط',close:'إغلاق المرشحات',empty:'لا توجد خيارات متاحة.',all:'لم تُحدَّد معايير',selected:'عدد المعايير المحددة: {count}',resetNotice:'أُعيد ضبط الاختيارات. اضغط تطبيق للتأكيد.'},
};
const languageOf=locale=>Object.hasOwn(copy,locale)?locale:'fr';
export const projectFilterDialogLabel=locale=>copy[languageOf(locale)].filter;

/** Preserve caller order and labels. Only facet routing is specific to projects. */
export function projectFilterDialogSections(filter={}){
 const sections={projects:[],technologies:[],skills:[]},seen=new Set();
 for(const option of Array.isArray(filter.options)?filter.options:[]){
  if(!option||typeof option.value!=='string'||option.value==='all'||seen.has(option.value))continue;
  seen.add(option.value);
  const section=option.group==='technologies'||option.value.startsWith('tech:')?'technologies':option.group==='skills'||option.value.startsWith('skill:')?'skills':'projects';
  sections[section].push(option);
 }
 return sections;
}

/** Draft changes never reach the caller until Apply. Native dialog owns modality. */
export function createProjectFilterDialog({doc,trigger,idPrefix='content',onApply,onClose=()=>{}}){
 let active=null;
 const restoreFocus=()=>{if(trigger.isConnected&&!trigger.closest('[hidden]'))trigger.focus({preventScroll:true});};
 function close(restore=true){
  if(!active)return;
  const current=active;active=null;
  current.controller.abort();
  if(current.dialog.open)current.dialog.close();
  current.dialog.remove();onClose();
  if(restore)restoreFocus();
 }
 function open(filter,locale='fr'){
  close(false);
  const language=languageOf(locale),t=copy[language],sections=projectFilterDialogSections(filter),allOptions=Object.values(sections).flat();
  const valid=new Set(allOptions.map(option=>option.value));
  const draft=new Set((Array.isArray(filter.values)?filter.values:[]).filter(value=>valid.has(value)));
  const controller=new AbortController(),signal=controller.signal;
  const node=(tag,className,text)=>{const element=doc.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
  const dialog=node('dialog','cp-project-filter-dialog');dialog.id=idPrefix+'-category-dialog';dialog.dir=language==='ar'?'rtl':'ltr';dialog.lang=language;
  dialog.setAttribute('aria-labelledby',dialog.id+'-title');dialog.setAttribute('aria-describedby',dialog.id+'-intro');
  const form=node('form','cp-project-filter-form');form.noValidate=true;
  const header=node('header','cp-project-filter-header'),heading=node('div'),title=node('h2','',t.title);title.id=dialog.id+'-title';title.tabIndex=-1;
  const intro=node('p','',t.intro);intro.id=dialog.id+'-intro';heading.append(title,intro);
  const dismiss=node('button','cp-project-filter-close');dismiss.type='button';dismiss.setAttribute('aria-label',t.close);
  dismiss.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  dismiss.addEventListener('click',()=>close(),{signal});header.append(heading,dismiss);
  const body=node('div','cp-project-filter-body'),inputs=[],collectives=[];
  const count=node('p','cp-project-filter-count'),status=node('p','cp-project-filter-status');status.setAttribute('role','status');
  const update=()=>{
   for(const {input,value}of inputs)input.checked=draft.has(value);
   for(const {input,values}of collectives){const total=values.filter(value=>draft.has(value)).length;input.checked=total===values.length;input.indeterminate=total>0&&total<values.length;input.setAttribute('aria-checked',input.indeterminate?'mixed':String(input.checked));}
   count.textContent=draft.size?t.selected.replace('{count}',new Intl.NumberFormat(language).format(draft.size)):t.all;
  };
  const appendChoice=(parent,option)=>{
   const label=node('label','cp-project-filter-choice'),input=node('input');input.type='checkbox';input.value=option.value;input.name='criteria';
   const text=node('span','',option.label||option.value);label.append(input,text);parent.append(label);inputs.push({input,value:option.value});
   input.addEventListener('change',()=>{if(input.checked)draft.add(option.value);else draft.delete(option.value);status.textContent='';update();},{signal});
  };
  for(const sectionName of ['projects','technologies','skills']){
   const section=node('fieldset','cp-project-filter-section');section.dataset.facet=sectionName;
   section.append(node('legend','',t[sectionName]));
   const options=sections[sectionName],groups=Array.isArray(filter.groups)?filter.groups:[],grouped=new Set();
   if(sectionName==='projects'){
    const groupGrid=node('div','cp-project-filter-groups');
    for(const definition of groups){
     const members=options.filter(option=>option.group===definition.value);if(!members.length)continue;
     const group=node('fieldset','cp-project-filter-group');group.append(node('legend','',definition.label||definition.value));
     if(definition.selectAllLabel){
      const label=node('label','cp-project-filter-choice cp-project-filter-all'),input=node('input');input.type='checkbox';
      const values=members.map(option=>option.value);label.append(input,node('span','',definition.selectAllLabel));group.append(label);collectives.push({input,values});
      input.addEventListener('change',()=>{for(const value of values)if(input.checked)draft.add(value);else draft.delete(value);status.textContent='';update();},{signal});
     }
     const choices=node('div','cp-project-filter-options');
     for(const option of members){appendChoice(choices,option);grouped.add(option.value);}
     group.append(choices);groupGrid.append(group);
    }
    if(groupGrid.childElementCount)section.append(groupGrid);
   }
   const remaining=options.filter(option=>!grouped.has(option.value));
   if(remaining.length){const choices=node('div','cp-project-filter-options');for(const option of remaining)appendChoice(choices,option);section.append(choices);}
   if(!options.length)section.append(node('p','cp-project-filter-empty',t.empty));
   body.append(section);
  }
  const footer=node('footer','cp-project-filter-footer'),meta=node('div','cp-project-filter-meta');meta.append(count,status);
  const actions=node('div','cp-project-filter-actions'),reset=node('button','cp-project-filter-reset',t.reset),cancel=node('button','cp-project-filter-cancel',t.cancel),apply=node('button','cp-project-filter-apply',t.apply);
  reset.type='button';cancel.type='button';apply.type='submit';
  reset.addEventListener('click',()=>{draft.clear();update();status.textContent=t.resetNotice;},{signal});
  cancel.addEventListener('click',()=>close(),{signal});actions.append(reset,cancel,apply);footer.append(meta,actions);
  form.append(header,body,footer);dialog.append(form);
  form.addEventListener('submit',event=>{event.preventDefault();const values=allOptions.filter(option=>draft.has(option.value)).map(option=>option.value);close(false);try{onApply(values);}finally{restoreFocus();}},{signal});
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();},{signal});
  dialog.addEventListener('close',()=>close(),{signal});
  let backdropDown=false;
  const outside=event=>{const rect=dialog.getBoundingClientRect();return event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom);};
  dialog.addEventListener('pointerdown',event=>{backdropDown=outside(event);},{signal});
  dialog.addEventListener('click',event=>{if(backdropDown&&outside(event))close();backdropDown=false;},{signal});
  active={dialog,controller};update();doc.body.append(dialog);dialog.showModal();title.focus({preventScroll:true});
 }
 return {open,close,get isOpen(){return Boolean(active?.dialog.open);},contains:target=>Boolean(target&&active?.dialog.contains(target))};
}
