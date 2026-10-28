
import {mountGlobe} from './globe.mjs';
import {previewEntries} from '../horizon-welcome/content-preview-data.mjs';
import {coverArt} from '../horizon-welcome/content-preview-art.mjs';

const icons={
 explore:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
 projects:'<path d="m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 4a4 4 0 0 1 3 4v1"/>',
 journal:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 3v18m4-12h3m-3 4h3"/>',
 moon:'<path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 down:'<path d="m7 10 5 5 5-5"/>',back:'<path d="M19 12H5m6-6-6 6 6 6"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>'
};
const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const concept=document.body.dataset.concept;
const names={explore:'Explorer',projects:'Projets',people:'Parcours',journal:'Journal'};
const pages={
 projects:{eyebrow:'Construire, essayer, partager',title:'Des idées qui prennent forme.',intro:'Derrière chaque projet, une question, des essais et des choses à transmettre.'},
 people:{eyebrow:'Les chemins de la communauté',title:'Chaque parcours commence quelque part.',intro:'Les premières questions, les détours et les moments qui font avancer.'},
 journal:{eyebrow:'La vie du réseau',title:'Ce qui nous fait avancer.',intro:'Des rencontres et des histoires, à l’échelle d’un campus ou à l’autre bout du monde.'}
};
const places={world:'Monde',france:'France',paris:'42 Paris'};
const campusNames={paris:'42 Paris',lyon:'42 Lyon',tokyo:'42 Tokyo',rio:'42 Rio',sao:'42 São Paulo'};
const nav=document.querySelector('.primary-nav');
nav.innerHTML='<span class="nav-indicator" aria-hidden="true"></span>'+Object.entries(names).map(([id,label])=>'<button type="button" data-section="'+id+'" aria-controls="content">'+icon(id)+'<span>'+label+'</span></button>').join('');
let section='explore',scope='world',entryId=null;
const globe=mountGlobe(document.querySelector('#globe'));
const content=document.querySelector('#content');
const inner=document.querySelector('.content-inner');
const scopeButton=document.querySelector('.scope-pill'),menu=document.querySelector('.scope-menu');
function position(){
 const current=nav.querySelector('[aria-current]');
 if(current){
  const indicator=nav.querySelector('.nav-indicator');
  indicator.style.width=current.offsetWidth+'px';
  indicator.style.transform='translateX('+(current.offsetLeft-parseFloat(getComputedStyle(indicator).left))+ 'px)';
 }
 const rect=document.querySelector('.scope-thumb').getBoundingClientRect();
 document.documentElement.style.setProperty('--badge-x',(rect.x+rect.width/2)+'px');
 document.documentElement.style.setProperty('--badge-y',(rect.y+rect.height/2)+'px');
}
const note='<p class="sample-note">Étude de navigation · Contenus de démonstration</p>';
function selection(){
 return previewEntries.filter(e=>e.section===section&&(scope==='world'||scope==='paris'&&e.campus==='paris'||scope==='france'&&['paris','lyon'].includes(e.campus)));
}
function renderContent(){
 if(section==='explore')return;
 const data=pages[section],entry=entryId?previewEntries.find(e=>e.id===entryId):null;
 if(entry){
  inner.innerHTML='<button class="article-back" type="button" data-back>'+icon('back')+'Tous les '+names[section].toLowerCase()+'</button><header class="article-header"><p class="eyebrow">'+entry.eyebrow.fr+' · '+campusNames[entry.campus]+'</p><h1 tabindex="-1">'+entry.title.fr+'</h1><p class="intro">'+entry.summary.fr+'</p></header><div class="article-art">'+coverArt(entry.cover)+'</div><div class="article-body">'+entry.body.map(p=>'<h2>'+p.heading.fr+'</h2><p>'+p.text.fr+'</p>').join('')+'</div>'+note;
  inner.querySelector('[data-back]').addEventListener('click',()=>{entryId=null;writeRoute();renderContent();content.scrollTop=0;});
  return;
 }
 const entries=selection().slice(0,3);
 inner.innerHTML='<header class="content-heading"><p class="eyebrow">'+data.eyebrow+'</p><h1 tabindex="-1">'+data.title+'</h1><p class="intro">'+data.intro+'</p></header><div class="content-meta"><span>'+places[scope]+' · '+names[section]+'</span><span>'+entries.length+(entries.length===1?' récit à découvrir':' récits à découvrir')+'</span></div><div class="cards">'+entries.map(entry=>'<button class="card" type="button" data-entry="'+entry.id+'"><div class="card-art">'+coverArt(entry.cover)+'</div><p class="eyebrow">'+campusNames[entry.campus]+' · '+(entry.tags?.[0]||'Communauté')+'</p><h2>'+entry.title.fr+'</h2><p>'+entry.summary.fr+'</p><span class="card-link">Découvrir '+icon('arrow')+'</span></button>').join('')+'</div>'+(entries.length?'':'<div class="empty">Aucun récit de démonstration dans ce périmètre.<br><button type="button" data-all>Voir le monde</button></div>')+note;
 inner.querySelectorAll('[data-entry]').forEach(button=>button.addEventListener('click',()=>{entryId=button.dataset.entry;writeRoute();renderContent();content.scrollTop=0;inner.querySelector('h1').focus({preventScroll:true});}));
 inner.querySelector('[data-all]')?.addEventListener('click',()=>setScope('world'));
}
function writeRoute(){history.replaceState(null,'','#'+section+(entryId?'/'+entryId:''));}
function navigate(next,{fromHash=false}={}){
 section=next;entryId=fromHash?entryId:null;
 document.body.dataset.view=section==='explore'?'world':'content';
 nav.querySelectorAll('button').forEach(b=>{if(b.dataset.section===section)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 document.querySelector('.world-copy').setAttribute('aria-hidden',String(section!=='explore'));
 content.inert=section==='explore';content.setAttribute('aria-hidden',String(section==='explore'));
 document.querySelector('.globe-frame').inert=section!=='explore';
 document.querySelector('.globe-frame').setAttribute('aria-hidden',String(section!=='explore'));
 renderContent();content.scrollTop=0;position();if(!fromHash)writeRoute();
 document.querySelector('#announcement').textContent=names[section]+' · '+places[scope];
}
nav.addEventListener('click',event=>{const b=event.target.closest('[data-section]');if(b)navigate(b.dataset.section);});
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();navigate('explore');});
function closeMenu(){menu.hidden=true;scopeButton.setAttribute('aria-expanded','false');}
scopeButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;scopeButton.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('[aria-checked=true]').focus();});
function setScope(id){
 scope=id;document.querySelector('.scope-name').textContent=places[id];
 menu.querySelectorAll('button').forEach(button=>button.setAttribute('aria-checked',String(button.dataset.scope===id)));
 globe.setScope(id);document.querySelector('.world-copy strong').textContent=id==='world'?'Le réseau, à portée de main.':id==='france'?'Un territoire, des trajectoires.':'Un point de départ : 42 Paris.';
 document.querySelector('.world-copy p').innerHTML=(id==='world'?'58 campus <span class="dot">·</span> 30 pays':id==='france'?'Paris <span class="dot">·</span> Lyon et le réseau français':'Paris, France')+' <span class="dot">·</span> Glisse pour explorer';
 entryId=null;renderContent();content.scrollTop=0;position();closeMenu();document.querySelector('#announcement').textContent=names[section]+' · '+places[scope];scopeButton.focus({preventScroll:true});
}
menu.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>setScope(button.dataset.scope)));
document.addEventListener('pointerdown',event=>{if(!event.target.closest('.scope-wrap'))closeMenu();});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&!menu.hidden){closeMenu();scopeButton.focus();}
 if(event.target.closest('.scope-menu')&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
  event.preventDefault();const items=[...menu.querySelectorAll('button')],index=items.indexOf(document.activeElement);
  items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();
 }
});
document.querySelector('.theme-button').addEventListener('click',event=>{
 const button=event.currentTarget,dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';
 button.innerHTML=icon(dark?'sun':'moon');button.setAttribute('aria-label',dark?'Activer le thème clair':'Activer le thème sombre');
});
window.addEventListener('resize',position);
document.fonts.ready.then(position);
function readRoute(){const [next,id]=location.hash.slice(1).split('/');entryId=previewEntries.some(e=>e.id===id&&e.section===next)?id:null;navigate(names[next]?next:'explore',{fromHash:true});}
window.addEventListener('hashchange',readRoute);readRoute();
