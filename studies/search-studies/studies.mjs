const sections = [['explore','Explorer','compass'],['projects','Projets','projects'],['people','Parcours','people'],['journal','Journal','journal']];
const labels = {tab:'Chercher',flip:'Rechercher',invitation:'Que cherches-tu ?',floating:'Chercher dans Horizon'};
const icon = name => '<svg aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const controllers = [];
const announcement = document.getElementById('announcement');
for (const study of document.querySelectorAll('.study')) {
  const variant = study.dataset.variant;
  const title = study.querySelector('h2').textContent;
  const access = '<button class="search-access" type="button" aria-expanded="false" aria-controls="search-'+variant+'" aria-label="Ouvrir la recherche — '+title+'"><span>'+labels[variant]+'</span>'+(variant==='invitation'?'<span class="access-arrow" aria-hidden="true">↗</span>':'')+'</button>';
  study.querySelector('.demo').innerHTML = '<div class="dock" data-open="false"><div class="panel">'+
    (variant==='invitation'?access:'')+
    '<nav class="navigation" aria-label="'+title+'">'+sections.map(([id,label,symbol],i)=>'<button class="nav-item" type="button" data-section="'+id+'" aria-label="'+label+'" title="'+label+'" '+(i===0?'aria-current="page"':'')+'>'+icon(symbol)+'<span class="nav-label" aria-hidden="true">'+label+'</span></button>').join('')+'</nav>'+
    '<form class="search-form" role="search" aria-label="Recherche — '+title+'" id="search-'+variant+'" aria-hidden="true" inert><input class="search-input" type="search" placeholder="Rechercher dans Horizon…" aria-label="Rechercher dans Horizon" autocomplete="off" enterkeyhint="search"><button class="search-close" type="button" aria-label="Fermer la recherche">'+icon('close')+'</button></form></div>'+
    (variant!=='invitation'?access:'')+'</div>';
  const dock = study.querySelector('.dock'), navigation = study.querySelector('.navigation'), trigger = study.querySelector('.search-access');
  const form = study.querySelector('.search-form'), input = study.querySelector('input'), close = study.querySelector('.search-close');
  function setOpen(open, restore=true) {
    dock.dataset.open = String(open);
    navigation.inert = open;
    form.inert = !open;
    form.setAttribute('aria-hidden',String(!open));
    navigation.setAttribute('aria-hidden',String(open));
    trigger.inert = open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) input.focus({preventScroll:true});
    else if (restore) trigger.focus({preventScroll:true});
  }
  const controller = {close:()=>setOpen(false,false)};
  controllers.push(controller);
  trigger.addEventListener('click',()=>{
    controllers.forEach(other=>{if(other!==controller)other.close();});
    setOpen(true);
  });
  close.addEventListener('click',()=>setOpen(false));
  dock.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&dock.dataset.open==='true'){event.preventDefault();setOpen(false);}
  });
  const buttons=[...navigation.querySelectorAll('button')];
  function select(button) {
    for(const item of buttons)item.removeAttribute('aria-current');
    button.setAttribute('aria-current','page');
    announcement.textContent=title+' : '+button.getAttribute('aria-label');
  }
  buttons.forEach(button=>button.addEventListener('click',()=>select(button)));
  navigation.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const index=buttons.indexOf(document.activeElement);if(index<0)return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    buttons[next].focus();select(buttons[next]);
  });
  form.addEventListener('submit',event=>{event.preventDefault();announcement.textContent='Modèle interactif : la recherche réelle reste dans Horizon.';});
}
const theme = document.getElementById('theme-toggle');
theme.addEventListener('click',()=>{
  const dark=document.documentElement.dataset.theme!=='dark';
  document.documentElement.dataset.theme=dark?'dark':'light';
  theme.setAttribute('aria-pressed',String(dark));
  theme.setAttribute('aria-label',dark?'Activer le thème clair':'Activer le thème sombre');
  theme.querySelector('use').setAttribute('href',dark?'#i-sun':'#i-moon');
});
const sizes=[...document.querySelectorAll('[data-width]')];
sizes.forEach(button=>button.addEventListener('click',()=>{
  document.documentElement.style.setProperty('--demo-width',button.dataset.width+'px');
  sizes.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
}));
