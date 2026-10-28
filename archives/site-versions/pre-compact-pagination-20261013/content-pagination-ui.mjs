import {contentPageNumbers} from './content-pagination.mjs?v=1';

const copy={
 fr:{label:'Pagination des contenus',previous:'Précédent',next:'Suivant',page:'Page {page}',summary:'Page {page} sur {pages}'},
 en:{label:'Content pagination',previous:'Previous',next:'Next',page:'Page {page}',summary:'Page {page} of {pages}'},
 ar:{label:'صفحات المحتوى',previous:'السابق',next:'التالي',page:'الصفحة {page}',summary:'الصفحة {page} من {pages}'},
};
export function contentPageSummary({page,pageCount},locale='fr'){
 const language=Object.hasOwn(copy,locale)?locale:'fr',number=new Intl.NumberFormat(language);
 return copy[language].summary.replace('{page}',number.format(page)).replace('{pages}',number.format(pageCount));
}

export function renderContentPagination({container,state,locale='fr',getHref,onNavigate}){
 const language=Object.hasOwn(copy,locale)?locale:'fr',t=copy[language],number=new Intl.NumberFormat(language),doc=container.ownerDocument;
 container.replaceChildren();container.hidden=!state.total;container.setAttribute('aria-label',t.label);
 if(!state.total)return;
 const summary=doc.createElement('p');summary.className='cp-pagination-summary';summary.textContent=contentPageSummary(state,language);
 summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');summary.setAttribute('aria-atomic','true');
 const controls=doc.createElement('div');controls.className='cp-pagination-controls';
 const link=(page,label,{disabled=false,current=false,className=''}={})=>{
  const node=doc.createElement(disabled?'button':'a');node.className='cp-pagination-link '+className;node.textContent=label;
  if(disabled){node.type='button';node.disabled=true;}
  else{
   node.href=getHref(page);node.dataset.page=String(page);
   node.addEventListener('click',event=>{
    if(current){if(!event.button&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey)event.preventDefault();return;}
    onNavigate(event,page);
   });
  }
  if(current)node.setAttribute('aria-current','page');
  return node;
 };
 controls.append(link(state.page-1,t.previous,{disabled:state.page===1,className:'cp-pagination-previous'}));
 const pages=doc.createElement('div');pages.className='cp-pagination-pages';
 for(const page of contentPageNumbers(state.page,state.pageCount)){
  if(page===null){const ellipsis=doc.createElement('span');ellipsis.className='cp-pagination-ellipsis';ellipsis.textContent='…';ellipsis.setAttribute('aria-hidden','true');pages.append(ellipsis);}
  else{const node=link(page,number.format(page),{current:page===state.page});node.setAttribute('aria-label',t.page.replace('{page}',number.format(page)));pages.append(node);}
 }
 controls.append(pages,link(state.page+1,t.next,{disabled:state.page===state.pageCount,className:'cp-pagination-next'}));
 container.append(summary,controls);
}
