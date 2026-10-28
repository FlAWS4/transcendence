// A local interaction study, not a deployment of the project's source code.
const copy={
 fr:{intro:'Ce Pong d’essai permet de comparer les deux modes de test. Il ne représente pas la réalisation du projet présenté.',embedded:'Dans la page',embeddedHint:'Essayez la démo directement ici.',external:'Dans un nouvel onglet',externalHint:'Retrouvez la même démo dans une page indépendante.',open:'Ouvrir la démo',newTab:'nouvel onglet',frame:'Pong — démo intégrée',empty:'Pas encore de version testable',emptyHint:'L’équipe n’a pas encore ajouté de démonstration à ce projet.'},
 en:{intro:'This sample Pong lets you compare both ways to try a project. It is not the implementation of the featured project.',embedded:'On this page',embeddedHint:'Try the demo right here.',external:'In a new tab',externalHint:'Open the same demo on its own page.',open:'Open demo',newTab:'new tab',frame:'Pong — embedded demo',empty:'No playable version yet',emptyHint:'The team has not added a demo for this project yet.'},
 ar:{intro:'تتيح لعبة بونغ التجريبية مقارنة طريقتي التجربة. وهي ليست تنفيذًا للمشروع المعروض.',embedded:'داخل الصفحة',embeddedHint:'جرّب العرض مباشرة هنا.',external:'في علامة تبويب جديدة',externalHint:'افتح العرض نفسه في صفحة مستقلة.',open:'فتح العرض',newTab:'علامة تبويب جديدة',frame:'بونغ — عرض مضمّن',empty:'لا توجد نسخة للتجربة بعد',emptyHint:'لم يضف الفريق عرضًا تجريبيًا لهذا المشروع بعد.'},
};
export function createProjectTrial({doc,entry,locale='fr',signal}){
 const t=copy[locale]||copy.fr;
 const node=(tag,className,text)=>{const el=doc.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const root=node('div','cp-project-trial');
 if(signal?.aborted)return root;
 if(entry.id!=='ft-transcendence-building-together'){
  const empty=node('section','cp-project-trial-empty');empty.append(node('h3','',t.empty),node('p','',t.emptyHint));root.append(empty);return root;
 }
 root.append(node('p','cp-project-section-intro',t.intro));
 const embedded=node('section','cp-project-trial-mode'),heading=node('h3','',t.embedded);heading.id='project-trial-embedded';embedded.setAttribute('aria-labelledby',heading.id);
 embedded.append(heading,node('p','',t.embeddedHint));
 const frame=node('iframe','cp-project-trial-frame');frame.title=t.frame;frame.setAttribute('sandbox','allow-scripts');frame.referrerPolicy='no-referrer';frame.loading='lazy';
 const url=new URL('./project-demos/pong/index.html',import.meta.url);url.searchParams.set('lang',copy[locale]?locale:'fr');
 const theme=()=>doc.documentElement?.dataset.theme==='dark'?'dark':'light';url.searchParams.set('theme',theme());
 const frameURL=new URL(url);frameURL.searchParams.set('embedded','1');frame.src=frameURL.href;embedded.append(frame);
 const external=node('section','cp-project-trial-mode cp-project-trial-external'),externalHeading=node('h3','',t.external);externalHeading.id='project-trial-external';external.setAttribute('aria-labelledby',externalHeading.id);
 const link=node('a','cp-project-trial-open',t.open);link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',t.open+' · '+t.newTab);
 const marker=node('span','cp-project-trial-new-tab','↗');marker.setAttribute('aria-hidden','true');link.append(marker);
 external.append(externalHeading,node('p','',t.externalHint),link);root.append(embedded,external);
 const syncTheme=()=>{url.searchParams.set('theme',theme());link.href=url.href;frame.contentWindow?.postMessage({type:'horizon-demo-theme',theme:theme()},'*');};
 const Observer=doc.defaultView?.MutationObserver,observer=Observer?new Observer(syncTheme):null;
 observer?.observe(doc.documentElement,{attributes:true,attributeFilter:['data-theme']});
 frame.addEventListener('load',syncTheme,{signal});
 signal?.addEventListener('abort',()=>{observer?.disconnect();frame.remove();},{once:true});
 return root;
}
