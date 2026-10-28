import {icon,escapeHTML as esc} from './icons.mjs';
import {mountGlobe} from './globe.mjs';
import {createState,mountView} from './views.mjs';

const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const variant=['1','2','3'].includes(params.get('variant'))?params.get('variant'):'1';
const names={'1':'Accès directs','2':'Volet compagnon','3':'Deux espaces'};
const key='horizon-connected-study-v1-'+variant;
let state=createState(),cleanup,toastTimer,route='',lastPersonal='home',lastPublic='explore',menuOpen=false,accountMode='login',authTarget='home';
try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved)state={...state,...saved};}catch{}
if(state.signedIn===undefined)state.signedIn=true;
document.body.dataset.variant=variant;
let theme=params.get('theme');try{theme=theme||localStorage.getItem('horizon-connected-theme');}catch{}
document.documentElement.dataset.theme=theme==='dark'?'dark':'light';
$('variant-title').textContent=`0${variant} · ${names[variant]}`;
$('variants').innerHTML=['1','2','3'].map(v=>`<a href="?variant=${v}${theme==='dark'?'&theme=dark':''}#explore" ${v===variant?'aria-current="page"':''} aria-label="Piste ${v} : ${names[v]}">0${v}</a>`).join('');
$('scope-icon').innerHTML=icon('globe');
const globalLinks=[['explore','compass','Explorer'],['public-projects','projects','Projets'],['public-profiles','user','Profils'],['public-journal','journal','Le journal'],['awards','award','42 Awards']];
const personalLinks=[['home','home','Vue d’ensemble'],['profile','user','Mon profil'],['projects','projects','Mes projets'],['articles','journal','Mes articles'],['messages','message','Messages'],['notifications','bell','Notifications'],['participations','award','Mes Awards'],['settings','settings','Paramètres'],['help','help','Assistance']];
const isPublic=value=>value==='explore'||value==='search'||value==='profile/preview'||value==='awards'||value.startsWith('awards/')||value.startsWith('candidate/')||value.startsWith('person/')||value.startsWith('public-')||value.startsWith('project-read/')||value.startsWith('article-read/');
function needsAccount(value){
 if(!isPublic(value)||['awards/vote','awards/review'].includes(value))return true;
 if(value.startsWith('project-read/')||value.startsWith('article-read/')){
  const [type,id]=value.split('/');if(id==='public-learning')return false;
  const item=state[type==='project-read'?'projects':'articles']?.find(i=>i.id===id);
  return item&&!(item.status==='published'&&item.visibility==='public');
 }
 return false;
}
function counts(){return {messages:(state.conversations||[]).reduce((n,c)=>n+(Number(c.unread)||0),0),notifications:(state.notifications||[]).filter(n=>!n.read).length};}
function badge(n){return n?`<span class="badge">${n}</span>`:'';}
function onChange(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}renderHeader();}
function notify(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
function link(to,symbol,label,extra=''){return `<a href="#${to}" ${extra}>${icon(symbol)}<span>${label}</span></a>`;}
function renderHeader(){
 const c=counts(),total=c.messages+c.notifications,personal=!isPublic(route),signed=state.signedIn;
 $('mode-switch').innerHTML=variant==='3'?`${link(lastPublic,'compass','Découvrir',!personal?'aria-current="page"':'')}${link(signed?lastPersonal:'signin','user',`Mon espace ${signed?badge(total):''}`,personal?'aria-current="page"':'')}`:'';
 const themeButton=`<button class="icon-button theme-toggle" type="button" aria-label="${document.documentElement.dataset.theme==='dark'?'Activer le thème clair':'Activer le thème sombre'}">${icon(document.documentElement.dataset.theme==='dark'?'sun':'moon')}</button>`;
 const accountButton=`<button id="account-trigger" class="account-trigger glass" type="button" aria-label="${signed?'Ouvrir mon espace':'Se connecter'}" aria-expanded="${menuOpen}" ${variant==='1'?'aria-controls="account-popover"':''}>${signed?'<img src="assets/leila-mansour.svg" alt="">':icon('user')}<span>${variant==='1'?(signed?'Leïla':'Connexion'):'Mon espace'}</span>${variant==='2'&&signed?badge(total):icon('chevron')}</button>`;
 $('utilities').innerHTML=themeButton+(variant==='1'&&signed?`${link('messages','message',`<span class="sr-only">Messages</span>${badge(c.messages)}`,'class="icon-button utility-link" aria-label="Messages'+(c.messages?', '+c.messages+' non lus':'')+'"')}${link('notifications','bell',`<span class="sr-only">Notifications</span>${badge(c.notifications)}`,'class="icon-button utility-link" aria-label="Notifications'+(c.notifications?', '+c.notifications+' non lues':'')+'"')}`:'')+(variant!=='3'?accountButton:'');
 $('personal-sidebar').innerHTML=`<div class="sidebar-identity"><img class="avatar" src="assets/leila-mansour.svg" alt=""><div><strong>${esc(state.profile?.name||'Leïla Mansour')}</strong><span>@lmansour · 42 Paris</span></div></div><label class="mobile-section-label">Dans mon espace<select id="personal-select" aria-label="Rubrique de mon espace">${personalLinks.map(([to,,label])=>`<option value="${to}" ${activePersonal()===to?'selected':''}>${label}</option>`).join('')}</select></label><nav aria-label="Mon espace">${personalLinks.map(([to,symbol,label])=>link(to,symbol,label+badge(to==='messages'?c.messages:to==='notifications'?c.notifications:0),activePersonal()===to?'aria-current="page"':'')).join('')}</nav><button class="button quiet signout" type="button">${icon('logout')}Se déconnecter</button>`;
 $('account-popover').innerHTML=`<div class="popover-identity"><img class="avatar" src="assets/leila-mansour.svg" alt=""><div><strong>${esc(state.profile?.name||'Leïla Mansour')}</strong><small>@lmansour · 42 Paris</small></div></div><nav aria-label="Accès au compte">${link('home','home','Mon espace')}${link('profile','user','Modifier mon profil')}${link('projects','projects','Mes projets')}${link('articles','journal','Mes articles')}${link('participations','award','Mes participations')}${link('settings','settings','Paramètres')}</nav><button type="button" class="button quiet signout">${icon('logout')}Se déconnecter</button>`;
 $('global-dock').innerHTML=globalLinks.map(([to,symbol,label])=>link(to,symbol,label,(activeGlobal()===to?'aria-current="page" ':'')+`title="${label}"`)).join('');
 $('entry-hint').innerHTML=`<a class="floating-search" href="#search">${icon('search')}<span>Chercher dans Horizon</span></a>`;
}
function activePersonal(){if(route.startsWith('project-'))return 'projects';if(route.startsWith('article-'))return 'articles';return route.split('/')[0];}
function activeGlobal(){if(route.startsWith('awards'))return 'awards';if(route.startsWith('project-read'))return 'public-projects';if(route.startsWith('article-read'))return 'public-journal';return isPublic(route)?route:lastPublic;}
function toggleMenu(open,restore=false){menuOpen=open;$('account-popover').hidden=!open;const button=$('account-trigger');button?.setAttribute('aria-expanded',String(open));if(open)$('account-popover').querySelector('a')?.focus();else if(restore)button?.focus();}
function navigate(to){if(/^(project|article)-new$/.test(route)&&/^(project|article)-edit\//.test(to)){history.replaceState(null,'','#'+to);render();}else if(to===location.hash.slice(1))render();else location.hash=to;}
function render(){
 let next=location.hash.slice(1)||'explore';
 if(next==='signin'){openAuth('home');history.replaceState(null,'','#explore');next='explore';}
 if(needsAccount(next)&&!state.signedIn){openAuth(next);history.replaceState(null,'','#explore');next='explore';}
 route=next;const personal=!isPublic(route),explore=route==='explore';
 if(personal)lastPersonal=route;else lastPublic=route;
 toggleMenu(false);cleanup?.();cleanup=null;
 document.body.dataset.personal=String(personal);document.body.dataset.explore=String(explore);
 $('workspace').hidden=explore;$('explorer-stage').hidden=!(explore||(variant==='2'&&personal));$('explore-hint').hidden=!explore;
 $('global-dock').hidden=variant==='3'&&personal;
 $('personal-sidebar').hidden=!personal;
 $('workspace').classList.toggle('public-view',!personal);
 const back=$('workspace').querySelector('.workspace-return');back.innerHTML=icon(variant==='2'&&personal?'close':'back')+(variant==='2'&&personal?'Fermer mon espace':'Retour à Explorer');
 $('workspace').querySelector('.workspace-label').textContent=personal?'MON ESPACE':'HORIZON · LE RÉSEAU';
 renderHeader();
 if(!explore){
  if(route==='search')renderSearch();
  else cleanup=mountView($('view'),{route,state,navigate,notify,onChange});
  const h=$('view').querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}
  $('workspace').scrollTop=0;window.scrollTo({top:0,behavior:'instant'});
 }else{$('view').replaceChildren();}
 syncSidebarFrame();
 document.title=`Horizon · ${names[variant]} — ${explore?'Explorer':personal?'Mon espace':'Découvrir'}`;
}
// The return link and sidebar stay in the left viewport column. The reading
// column and top-right label keep their natural positions in the document.
function syncSidebarFrame(){
 const sidebar=$('personal-sidebar'),workspace=$('workspace');
 if(variant==='2'||sidebar.hidden||!window.matchMedia('(min-width:761px)').matches)return;
 const grid=getComputedStyle(workspace),rect=workspace.getBoundingClientRect();
 const columnWidth=parseFloat(grid.gridTemplateColumns);
 if(!Number.isFinite(columnWidth))return;
 const left=rect.left+(parseFloat(grid.borderLeftWidth)||0)+(parseFloat(grid.paddingLeft)||0);
 const flowTop=workspace.querySelector('.view-container').getBoundingClientRect().top+window.scrollY;
 const returnFlowTop=workspace.querySelector('.workspace-top').getBoundingClientRect().top+window.scrollY;
 const returnToSidebar=flowTop-returnFlowTop;
 const viewportHeight=document.documentElement.clientHeight||window.innerHeight;
 const bottomSpace=16,headerBottom=document.querySelector('.site-header').getBoundingClientRect().bottom;
 const returnTop=Math.min(returnFlowTop,Math.max(headerBottom+12,viewportHeight-bottomSpace-160-returnToSidebar));
 const top=returnTop+returnToSidebar;
 const dock=$('global-dock'),dockRect=dock.getBoundingClientRect();
 const overlapsDock=!dock.hidden&&left<dockRect.right&&left+columnWidth>dockRect.left;
 const endPadding=overlapsDock?Math.max(20,viewportHeight-bottomSpace-dockRect.top+12):20;
 for(const [name,value] of Object.entries({left,top,width:columnWidth,height:Math.max(0,viewportHeight-top-bottomSpace),'end-padding':endPadding})){
  sidebar.style.setProperty(`--personal-sidebar-${name}`,`${value}px`);
 }
 for(const [name,value] of Object.entries({left,top:returnTop,width:columnWidth})){
  workspace.style.setProperty(`--personal-return-${name}`,`${value}px`);
 }
}
let sidebarFrame=0;
function scheduleSidebarFrame(){cancelAnimationFrame(sidebarFrame);sidebarFrame=requestAnimationFrame(syncSidebarFrame);}
window.addEventListener('resize',scheduleSidebarFrame);
document.fonts?.ready.then(scheduleSidebarFrame);
function renderSearch(){
 $('view').innerHTML='<div class="page-heading"><p class="eyebrow">DÉCOUVRIR HORIZON</p><h1 class="page-title">Trouver son chemin.</h1></div><label class="field">Rechercher un espace<input id="search-query" type="search" placeholder="Projet, profil, Awards…"></label><div class="stack" id="search-results"></div>';
 const show=()=>{const query=$('search-query').value.toLocaleLowerCase('fr');const hits=[...globalLinks,...personalLinks].filter(([, ,label])=>label.toLocaleLowerCase('fr').includes(query));$('search-results').innerHTML=hits.length?hits.map(([to,symbol,label])=>link(to,symbol,label,'class="list-row"')).join(''):'<p class="muted">Aucun espace trouvé.</p>';};$('search-query').addEventListener('input',show);show();
}
function openAuth(target){authTarget=target;accountMode='login';updateAuth();$('auth-status').textContent='';if(!$('auth-dialog').open)$('auth-dialog').showModal();}
function updateAuth(){const signup=accountMode==='signup';$('signup-name').hidden=!signup;$('auth-title').textContent=signup?'Rejoindre Horizon':'Retrouver Horizon';document.querySelectorAll('[data-auth-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.authMode===accountMode)));}
document.addEventListener('click',event=>{
 if(event.target.closest('.skip-link')){event.preventDefault();(route==='explore'?$('globe').querySelector('svg'):$('view')).focus();return;}
 const element=event.target.closest('a,button');
 if(element?.classList.contains('theme-toggle')){const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem('horizon-connected-theme',dark?'dark':'light');}catch{}document.querySelectorAll('#variants a').forEach(a=>{const u=new URL(a.href);u.searchParams.set('theme',dark?'dark':'light');a.href=u.href;});renderHeader();}
 if(element?.id==='account-trigger'){if(!state.signedIn)openAuth('home');else if(variant==='1')toggleMenu(!menuOpen);else navigate(isPublic(route)?lastPersonal:'explore');}
 else if(menuOpen&&!event.target.closest('#account-popover'))toggleMenu(false);
 if(element?.classList.contains('signout')){state.signedIn=false;onChange();navigate('explore');notify('Vous explorez maintenant la démonstration en visiteur.');}
 if(element?.dataset.authMode){accountMode=element.dataset.authMode;updateAuth();}
 if(element?.id==='close-auth')$('auth-dialog').close();
 if(element?.id==='recovery'){$('auth-status').textContent='Dans le service final, un lien permettrait de récupérer l’accès. Aucun email envoyé dans cet essai.';}
 if(element?.id==='reset-demo'){state=createState();state.signedIn=true;onChange();document.querySelector('.lab-info').open=false;navigate('explore');notify('Cette piste a retrouvé ses données de départ.');}
});
document.addEventListener('change',event=>{if(event.target.id==='personal-select')navigate(event.target.value);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('auth-dialog').open){if(menuOpen){event.preventDefault();toggleMenu(false,true);}else if(variant==='2'&&!isPublic(route)){navigate('explore');setTimeout(()=>$('account-trigger')?.focus(),0);}}});
$('auth-form').addEventListener('submit',event=>{event.preventDefault();const name=new FormData(event.target).get('displayName')?.toString().trim().slice(0,70);if(accountMode==='signup'&&name)state.profile.name=name;state.signedIn=true;onChange();$('auth-dialog').close();navigate(authTarget);notify('Compte fictif ouvert. Aucun compte réel créé ou connecté.');});
$('close-auth').innerHTML=icon('close');
window.addEventListener('hashchange',render);
const globe=mountGlobe($('globe'));$('scope').addEventListener('change',event=>globe.setScope(event.target.value));
render();
