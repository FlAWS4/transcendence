const copy={
 fr:{account:'Compte',guest:'Visiteur',menu:'Menu du compte',settings:'Paramètres',theme:'Thème',language:'Langue',light:'Clair',dark:'Sombre',system:'Système',signin:'Se connecter',signout:'Se déconnecter',back:'Retour',close:'Fermer',messages:'Messagerie',notifications:'Notifications',noMessages:'Aucune conversation pour le moment',messagesHint:'Découvre les membres dans Profils.',noNotifications:'Aucune notification',notificationsHint:'',profiles:'Découvrir les profils'},
 en:{account:'Account',guest:'Visitor',menu:'Account menu',settings:'Settings',theme:'Theme',language:'Language',light:'Light',dark:'Dark',system:'System',signin:'Sign in',signout:'Sign out',back:'Back',close:'Close',messages:'Messages',notifications:'Notifications',noMessages:'No conversations yet',messagesHint:'Discover members in Profiles.',noNotifications:'No notifications',notificationsHint:'',profiles:'Discover profiles'},
 ar:{account:'الحساب',guest:'زائر',menu:'قائمة الحساب',settings:'الإعدادات',theme:'المظهر',language:'اللغة',light:'فاتح',dark:'داكن',system:'النظام',signin:'تسجيل الدخول',signout:'تسجيل الخروج',back:'رجوع',close:'إغلاق',messages:'الرسائل',notifications:'الإشعارات',noMessages:'لا توجد محادثات بعد',messagesHint:'اكتشف الأعضاء في الملفات الشخصية.',noNotifications:'لا توجد إشعارات',notificationsHint:'',profiles:'اكتشف الملفات الشخصية'},
};
const paths={
 user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
 messages:'<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 3-2Z"/><path d="M7 9h10M7 13h6"/>',
 notifications:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 theme:'<path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z"/>',
 language:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 exit:'<path d="M9 4H4v16h5M11 12h10m-4-4 4 4-4 4"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 back:'<path d="m14 6-6 6 6 6"/>',
 check:'<path d="m5 12 4 4 10-10"/>',
};
const svg=name=>`<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]||paths.user}</svg>`;
const signUpLabel={fr:'Créer un compte',en:'Create an account',ar:'إنشاء حساب'};

export function mountAccountMenu({trigger,utilities,getLocale=()=> 'fr',getIdentity=()=> 'visitor',getProfile=()=>null,getTheme=()=> 'light',onTheme=()=>{},onLocale=()=>{},onAccount=()=>{},onSignIn=()=>{},onSignUp=()=>{},onSignOut=()=>{},onProfiles=()=>{},onOpen=()=>{}}){
 const doc=trigger.ownerDocument,view=doc.defaultView,controller=new AbortController(),signal=controller.signal;
 const wrapper=doc.createElement('div');wrapper.className='account-switcher';trigger.before(wrapper);wrapper.append(trigger);
 const panel=doc.createElement('section');panel.id='account-menu';panel.className='account-menu';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','account-menu-title');wrapper.append(panel);
 const extraTrigger=(id,icon)=>{const button=doc.createElement('button');button.type='button';button.id=id;button.className='utility account-extra-trigger';button.innerHTML=svg(icon);button.hidden=true;utilities.insertBefore(button,wrapper);return button;};
 const messages=extraTrigger('account-messages','messages'),notifications=extraTrigger('account-notifications','notifications');
 let screen='home',activeTrigger=trigger,rendering=false;
 const locale=()=>Object.hasOwn(copy,getLocale())?getLocale():'fr',words=()=>copy[locale()],member=()=>getIdentity()==='member';
 const name=()=>{const profile=getProfile();return profile?.title?.[locale()]||profile?.title?.en||'';};
 const buttons=()=>[...panel.querySelectorAll('button:not(:disabled)')];
 function position(){if(!panel.hidden)panel.style.maxHeight=Math.max(96,view.innerHeight-wrapper.getBoundingClientRect().bottom-18)+'px';}
 function close(restoreFocus=false){
  if(panel.hidden)return;
  panel.hidden=true;for(const button of [trigger,messages,notifications])button.setAttribute('aria-expanded','false');
  if(restoreFocus)(activeTrigger.hidden?trigger:activeTrigger).focus({preventScroll:true});
 }
 function action(key,label,icon,handler,{detail='',className=''}={}){
  const button=doc.createElement('button');button.type='button';button.className='account-option '+className;button.dataset.accountAction=key;
  button.setAttribute('aria-label',detail?`${label} · ${detail}`:label);
  button.innerHTML=svg(icon);const text=doc.createElement('span');text.textContent=label;button.append(text);
  if(detail){const value=doc.createElement('small');value.textContent=detail;button.append(value);}
  button.addEventListener('click',handler);return button;
 }
 function show(next,focusKey){screen=next;render();position();(focusKey?panel.querySelector(focusKey):buttons()[0])?.focus({preventScroll:true});}
 function choiceGroup(key,label,values,current,callback){
  const group=doc.createElement('fieldset');group.className='account-choice-group';const legend=doc.createElement('legend');legend.textContent=label;group.append(legend);
  for(const [value,text]of values){
   const button=doc.createElement('button');button.type='button';button.className='account-choice';button.dataset[key]=value;
   button.setAttribute('aria-pressed',String(value===current));button.innerHTML=svg(key==='accountTheme'?'theme':'language');
   const span=doc.createElement('span');span.textContent=text;button.append(span);const check=doc.createElement('span');check.className='account-choice-check';check.innerHTML=svg('check');button.append(check);
   button.addEventListener('click',()=>callback(value));group.append(button);
  }
  panel.append(group);
 }
 function render(){
  rendering=true;
  const t=words(),isMember=member(),focused=doc.activeElement;
  const focusSelector=panel.contains(focused)?focused.dataset.accountTheme?`[data-account-theme="${focused.dataset.accountTheme}"]`:focused.dataset.accountLocale?`[data-account-locale="${focused.dataset.accountLocale}"]`:focused.dataset.accountAction?`[data-account-action="${focused.dataset.accountAction}"]`:null:null;
  panel.replaceChildren();
  const top=doc.createElement('div');top.className='account-menu-top';const title=doc.createElement('h2');title.id='account-menu-title';title.textContent=screen==='home'?t.menu:screen==='settings'?t.settings:t[screen];top.append(title);
  if(['settings','theme','language'].includes(screen)){
   const origin=screen;top.prepend(action('back',t.back,'back',()=>show('home',`[data-account-action="${origin}"]`)));
  }
  const exit=action('close',t.close,'close',()=>close(true));exit.classList.add('account-menu-close');exit.setAttribute('aria-label',t.close);
  if(screen==='home'){title.classList.add('sr-only');top.classList.add('account-menu-top-home');}
  if(screen!=='home'||!isMember)top.append(exit);panel.append(top);
  if(screen==='home'){
   if(isMember){
    const profile=getProfile(),identity=doc.createElement('div');identity.className='account-identity';
    if(profile?.avatar){const image=doc.createElement('img');image.src=profile.avatar;image.alt='';image.width=36;image.height=36;identity.append(image);}
    const text=doc.createElement('div'),strong=doc.createElement('strong');strong.textContent=name();text.append(strong);
    if(profile?.intraLogin){const login=doc.createElement('small'),value=doc.createElement('bdi');login.className='account-username';value.dir='ltr';value.textContent='@'+profile.intraLogin;login.append(value);text.append(login);}
    identity.append(text,exit);panel.append(identity);
   }else{
    const access=doc.createElement('div');access.className='account-auth-actions';
    for(const [key,label,handler]of [['signin',t.signin,onSignIn],['signup',signUpLabel[locale()],onSignUp]]){
     const button=doc.createElement('button');button.type='button';button.className='entrance-action account-auth-action'+(key==='signup'?' secondary':'');button.dataset.accountAction=key;button.textContent=label;
     button.addEventListener('click',()=>{close(true);handler();});access.append(button);
    }
    panel.append(access);
   }
   if(isMember)panel.append(action('account',t.account,'user',()=>{close();onAccount();}));
   panel.append(action('settings',t.settings,'settings',()=>show('settings')));
   panel.append(action('theme',t.theme,'theme',()=>show('theme','[data-account-theme]'),{detail:t[getTheme()]||t.light}));
   panel.append(action('language',t.language,'language',()=>show('language','[data-account-locale]'),{detail:{fr:'Français',en:'English',ar:'العربية'}[locale()]}));
   if(isMember){const separator=doc.createElement('div');separator.className='account-menu-separator';panel.append(separator);panel.append(action('signout',t.signout,'exit',()=>{close(true);onSignOut();}));}
  }else if(['settings','theme','language'].includes(screen)){
   if(screen!=='language')choiceGroup('accountTheme',t.theme,[['light',t.light],['dark',t.dark],['system',t.system]],getTheme(),onTheme);
   if(screen!=='theme')choiceGroup('accountLocale',t.language,[['fr','Français'],['en','English'],['ar','العربية']],locale(),onLocale);
  }else{
   const empty=doc.createElement('div');empty.className='account-empty';empty.innerHTML=svg(screen);const strong=doc.createElement('strong');strong.textContent=screen==='messages'?t.noMessages:t.noNotifications;
   empty.append(strong);const hint=screen==='messages'?t.messagesHint:t.notificationsHint;if(hint){const text=doc.createElement('p');text.textContent=hint;empty.append(text);}panel.append(empty);
   if(screen==='messages')panel.append(action('profiles',t.profiles,'user',()=>{close();onProfiles();}));
  }
  if(focusSelector)panel.querySelector(focusSelector)?.focus({preventScroll:true});
  rendering=false;
 }
 function refresh(){
  const t=words(),isMember=member(),profile=getProfile();
  trigger.classList.toggle('account-has-avatar',isMember&&Boolean(profile?.avatar));trigger.replaceChildren();
  if(isMember&&profile?.avatar){const image=doc.createElement('img');image.src=profile.avatar;image.alt='';image.width=36;image.height=36;trigger.append(image);}else trigger.innerHTML=svg('user');
  trigger.setAttribute('aria-label',isMember?`${t.account} · ${name()}`:t.menu);trigger.title=isMember?`${t.account} · ${name()}`:t.menu;
  for(const [button,key]of [[messages,'messages'],[notifications,'notifications']]){button.hidden=!isMember;button.setAttribute('aria-label',t[key]);button.title=t[key];}
  if(!isMember&&['messages','notifications'].includes(screen))close(true);
  if(!panel.hidden){render();position();}
 }
 function open(next='home',source=trigger,last=false){
  if(next!=='home'&&!member())return;
  onOpen();activeTrigger=source;screen=next;refresh();render();panel.hidden=false;
  for(const button of [trigger,messages,notifications])button.setAttribute('aria-expanded',String(button===source));position();
  const targets=buttons();(last?targets.at(-1):targets[0])?.focus({preventScroll:true});
 }
 for(const [button,key]of [[trigger,'home'],[messages,'messages'],[notifications,'notifications']]){
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-expanded','false');
  button.addEventListener('click',()=>!panel.hidden&&activeTrigger===button?close(true):open(key,button),{signal});
  button.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();open(key,button,event.key==='ArrowUp');}},{signal});
 }
 panel.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return;}
  const list=buttons(),index=list.indexOf(doc.activeElement),next={ArrowDown:(index+1)%list.length,ArrowUp:(index+list.length-1)%list.length,Home:0,End:list.length-1}[event.key];
  if(next!==undefined){event.preventDefault();list[next]?.focus({preventScroll:true});}
 },{signal});
 doc.addEventListener('pointerdown',event=>{if(!wrapper.contains(event.target)&&event.target!==messages&&!messages.contains(event.target)&&event.target!==notifications&&!notifications.contains(event.target))close();},{signal});
 utilities.addEventListener('focusout',event=>{if(!rendering&&!utilities.contains(event.relatedTarget))close();},{signal});
 view.addEventListener('resize',position,{signal});
 refresh();return {open,close,refresh,destroy(){close();controller.abort();messages.remove();notifications.remove();wrapper.before(trigger);wrapper.remove();}};
}
