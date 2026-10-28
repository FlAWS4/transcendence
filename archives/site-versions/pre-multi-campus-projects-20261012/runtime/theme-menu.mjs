const archivePageURL=new URL(location.pathname+location.search,location.origin).href;
const copy={
 fr:{choose:'Choisir le thème',light:'Clair',dark:'Sombre',system:'Système'},
 en:{choose:'Choose a theme',light:'Light',dark:'Dark',system:'System'},
 ar:{choose:'اختيار المظهر',light:'فاتح',dark:'داكن',system:'النظام'},
};
const words=locale=>{const language=String(locale||'fr').toLowerCase().split(/[-_]/)[0];return Object.hasOwn(copy,language)?copy[language]:copy.fr;};
const icons={light:'#i-sun',dark:'#i-moon',system:'#i-system'};

export function mountThemeMenu({wrapper,trigger,menu,preferences,getLocale=()=> 'fr',onOpen=()=>{}}){
 const doc=wrapper.ownerDocument,options=[...menu.querySelectorAll('[data-theme-choice]')];
 const controller=new AbortController(),signal=controller.signal;
 function highlight(option){
  const index=options.indexOf(option);if(index>=0)menu.style.setProperty('--theme-highlight-y',`${6+index*48}px`);
 }
 function refresh(){
  const t=words(getLocale()),{preference}=preferences.snapshot();
  menu.setAttribute('aria-label',t.choose);trigger.setAttribute('aria-label',t.choose+' · '+t[preference]);trigger.title=t.choose+' · '+t[preference];
  trigger.dataset.themePreference=preference;trigger.querySelector('use').setAttribute('href',archivePageURL+icons[preference]);
  options.forEach(option=>{option.querySelector('[data-theme-label]').textContent=t[option.dataset.themeChoice];option.setAttribute('aria-checked',String(option.dataset.themeChoice===preference));});
  highlight(options.includes(doc.activeElement)?doc.activeElement:options.find(option=>option.dataset.themeChoice===preference));
 }
 function close(restoreFocus=false){
  if(menu.hidden)return;
  menu.hidden=true;trigger.setAttribute('aria-expanded','false');
  if(restoreFocus)trigger.focus({preventScroll:true});
 }
 function open(index){
  onOpen();refresh();
  const selected=options.findIndex(option=>option.dataset.themeChoice===preferences.snapshot().preference);
  const option=options[index===undefined?Math.max(0,selected):Math.max(0,Math.min(index,options.length-1))];
  if(!option)return;
  menu.hidden=false;trigger.setAttribute('aria-expanded','true');highlight(option);option.focus({preventScroll:true});
 }
 trigger.addEventListener('click',()=>menu.hidden?open():close(true),{signal});
 trigger.addEventListener('keydown',event=>{
  if(!['ArrowDown','ArrowUp'].includes(event.key))return;
  event.preventDefault();open(event.key==='ArrowUp'?options.length-1:0);
 },{signal});
 options.forEach(option=>{
  option.addEventListener('click',()=>{preferences.setPreference(option.dataset.themeChoice);refresh();close(true);},{signal});
  option.addEventListener('pointerenter',()=>highlight(option),{signal});
 });
 menu.addEventListener('focusin',event=>highlight(event.target),{signal});
 menu.addEventListener('pointerleave',()=>highlight(options.includes(doc.activeElement)?doc.activeElement:options.find(option=>option.dataset.themeChoice===preferences.snapshot().preference)),{signal});
 menu.addEventListener('keydown',event=>{
  const index=options.indexOf(doc.activeElement);
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return;}
  if(event.key==='Tab'){close(true);return;}
  const destination={ArrowDown:(index+1)%options.length,ArrowUp:(index+options.length-1)%options.length,Home:0,End:options.length-1}[event.key];
  if(destination!==undefined){event.preventDefault();options[destination].focus({preventScroll:true});highlight(options[destination]);}
 },{signal});
 doc.addEventListener('pointerdown',event=>{if(!wrapper.contains(event.target))close();},{signal});
 wrapper.addEventListener('focusout',event=>{if(!wrapper.contains(event.relatedTarget))close();},{signal});
 refresh();return {open,close,refresh,destroy(){close();controller.abort();}};
}
