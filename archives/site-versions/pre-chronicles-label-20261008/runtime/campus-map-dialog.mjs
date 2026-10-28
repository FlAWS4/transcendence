const copy={
 fr:{title:'Autour du campus',close:'Fermer la carte',hint:'Explore le quartier, jusqu’à 3 km autour du campus.',map:'Carte du quartier. Glisse pour te déplacer et utilise la molette ou deux doigts pour zoomer. Échap ferme la carte.',in:'Zoomer',out:'Dézoomer',center:'Recentrer sur le campus',loading:'Préparation du quartier…',error:'La carte n’a pas pu se préparer.',retry:'Réessayer'},
 en:{title:'Around the campus',close:'Close the map',hint:'Explore the neighbourhood, within 3 km of the campus.',map:'Neighbourhood map. Drag to move and use the wheel or two fingers to zoom. Escape closes the map.',in:'Zoom in',out:'Zoom out',center:'Recenter on the campus',loading:'Preparing the neighbourhood…',error:'The map could not be prepared.',retry:'Try again'},
 ar:{title:'حول الفرع',close:'إغلاق الخريطة',hint:'استكشف الحي ضمن نطاق 3 كم حول الفرع.',map:'خريطة الحي. اسحب للتنقل واستخدم العجلة أو إصبعين للتكبير. اضغط Escape لإغلاق الخريطة.',in:'تكبير',out:'تصغير',center:'العودة إلى موقع الفرع',loading:'نجهّز الحي…',error:'تعذّر تجهيز الخريطة.',retry:'إعادة المحاولة'}
};
const icon=name=>`<svg aria-hidden="true"><use href="${location.href.split('#')[0]}#i-${name}"/></svg>`;

/** Temporarily lends the existing geographic scene to a dedicated modal. */
export function createCampusMapDialog({getGlobe,prepare,getLocale,getCampus,countryName,onRestore}){
 const dialog=document.createElement('dialog');dialog.id='campus-map-dialog';dialog.setAttribute('aria-labelledby','campus-map-name');
 dialog.innerHTML=`<header class="campus-map-header"><div><p id="campus-map-kicker"></p><h2 id="campus-map-name" dir="auto"></h2></div><button type="button" class="icon-button" id="campus-map-close" autofocus>${icon('close')}</button></header><div class="campus-map-viewport" id="campus-map-viewport"><p id="campus-map-status" role="status"></p></div><footer class="campus-map-footer"><p id="campus-map-hint"></p><div class="globe-controls"><button type="button" class="icon-button" id="campus-map-out">${icon('minus')}</button><button type="button" class="icon-button" id="campus-map-center">${icon('compass')}</button><button type="button" class="icon-button" id="campus-map-in">${icon('plus')}</button></div><button type="button" class="campus-map-retry" id="campus-map-retry" hidden></button><div class="campus-map-credits"></div></footer>`;
 document.body.append(dialog);
 const find=id=>dialog.querySelector(`#${id}`),viewport=find('campus-map-viewport'),status=find('campus-map-status');
 let session=null,ownsMap=false,sequence=0,campusId=null,text=copy.fr,original=null,latestView=null,released=true,started=false;
 const close=()=>{if(dialog.open){dialog.close();release();}};
 const buttons=[find('campus-map-out'),find('campus-map-center'),find('campus-map-in')];
 find('campus-map-close').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
 find('campus-map-out').addEventListener('click',()=>getGlobe()?.zoomBy(.8));
 find('campus-map-in').addEventListener('click',()=>getGlobe()?.zoomBy(1.25));
 find('campus-map-center').addEventListener('click',()=>getGlobe()?.selectCampus(campusId));
 find('campus-map-retry').addEventListener('click',()=>{
  if(!session){start(sequence);return;}
  if(!started){started=session.start();updateStatus(started?'loading':'error');return;}
  getGlobe()?.selectCampus(campusId,{retry:true});
 });
 function updateView(view){latestView=view;find('campus-map-out').disabled=!view.canZoomOut;find('campus-map-in').disabled=!view.canZoomIn;find('campus-map-center').disabled=!view.canZoomOut&&!view.canZoomIn;}
 function updateStatus(state){
  status.hidden=state==='ready';status.textContent=text[state==='error'?'error':'loading'];
  find('campus-map-retry').hidden=state!=='error';
 }
 async function start(current){
  updateStatus('loading');buttons.forEach(button=>{button.disabled=true;});
  try{
   await prepare();if(current!==sequence||!dialog.open)return;
   const globe=getGlobe(),stage=document.getElementById('globe'),credits=document.querySelector('#main > .map-credit');
   ownsMap=true;
   session=globe?.beginCampusPreview(campusId);
   if(!session){ownsMap=false;throw new Error('Campus unavailable');}
   original={stage,parent:stage.parentElement,next:stage.nextSibling,inert:stage.inert,aria:stage.getAttribute('aria-hidden'),label:stage.getAttribute('aria-label'),credits,creditParent:credits?.parentElement,creditNext:credits?.nextSibling,scroll:scrollY};
   viewport.append(stage);stage.inert=false;stage.removeAttribute('aria-hidden');stage.setAttribute('aria-label',text.map);
   if(credits)dialog.querySelector('.campus-map-credits').append(credits);
   started=session.start();if(!started)updateStatus('error');
  }catch(error){if(current===sequence&&dialog.open)updateStatus('error');}
 }
 function open(id){
  const campus=getCampus(id);if(!campus||dialog.open)return;
  campusId=id;text=copy[getLocale()]||copy.fr;latestView=null;released=false;started=false;
  dialog.lang=getLocale();dialog.dir=getLocale()==='ar'?'rtl':'ltr';
  find('campus-map-name').textContent=campus.name;
  find('campus-map-kicker').textContent=`${text.title} · ${countryName(campus.country)}`;
  find('campus-map-hint').textContent=text.hint;
  for(const [suffix,key]of [['close','close'],['in','in'],['out','out'],['center','center']]){find(`campus-map-${suffix}`).setAttribute('aria-label',text[key]);find(`campus-map-${suffix}`).title=text[key];}
  find('campus-map-retry').textContent=text.retry;
  dialog.showModal();start(++sequence);
 }
 function release(){
  if(released)return;released=true;
  sequence++;
  if(original){
   const {stage,parent,next,credits,creditParent,creditNext}=original;
   parent.insertBefore(stage,next?.parentNode===parent?next:null);
   stage.inert=original.inert;
   if(original.aria===null)stage.removeAttribute('aria-hidden');else stage.setAttribute('aria-hidden',original.aria);
   stage.setAttribute('aria-label',original.label||'');
   if(credits)creditParent.insertBefore(credits,creditNext?.parentNode===creditParent?creditNext:null);
   session?.restore();
   const scroll=original.scroll;requestAnimationFrame(()=>window.scrollTo({top:scroll,behavior:'instant'}));
  }
  session=null;original=null;ownsMap=false;
  onRestore?.(latestView);
 }
 dialog.addEventListener('close',release);
 return {open,close,updateView,updateStatus,get ownsMap(){return ownsMap;},get isOpen(){return dialog.open;}};
}
