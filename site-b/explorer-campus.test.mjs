import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mountExplorerCampus} from './explorer-campus.mjs';

// Campus sheet « Halo » (SPEC-B-HALO §5.2–5.6, §7.4, §9.1 B). The fake DOM implements exactly the « required » list of
// §7.4 (D13); every optional member is switched on per test. B's elements are proxies: a read or a write outside the
// contract is recorded (reads) or refused (writes), and append throws on anything but an Element.
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const network=JSON.parse(read('./campuses.json'));
const sites=JSON.parse(read('./campus-websites.json')).campuses;
const locales=JSON.parse(read('./campus-website-locales.json')).campuses;
const profiles=JSON.parse(read('./campus-profiles.json')).campuses;
const PRINTS={
 paris:{kind:'mask',src:'assets/campus-logos/print/paris.png',width:193,height:138,aspectRatio:1.3986},
 mulhouse:{kind:'mask',src:'assets/campus-logos/print/mulhouse.png',width:351,height:150,aspectRatio:2.339},
 codam:{kind:'sticker',src:'assets/campus-logos/codam.png',width:640,height:214,aspectRatio:2.9907},
};
const enriched=id=>{
 const campus=network.campuses.find(item=>item.id===id);
 return {...campus,...(sites[id]?.kind==='campus-site'?{websiteUrl:sites[id].url}:{}),websiteLocales:locales[id],
  profile:profiles[id]||{},logo:PRINTS[id]?{src:'assets/campus-logos/'+id+'.png',print:PRINTS[id]}:null};
};
const FRANCE={fr:'France',en:'France',ar:'فرنسا'};
const FRA_SHAPE={viewBox:'0 0 100 94.8',d:'M2 2L98 2L98 92.8L2 92.8Z',pins:{lyon:[63.1,52.4],paris:[47,22.9]}};
const country=(language='fr',extra={})=>({id:'FRA',iso2:'FR',name:FRANCE[language],shape:FRA_SHAPE,flagHref:'assets/flags/fr.svg',...extra});
const SVG='http://www.w3.org/2000/svg';
const tag=language=>language==='ar'?'ar-u-nu-latn':language;
const NEW_TAB={fr:'S’ouvre dans un nouvel onglet',en:'Opens in a new tab',ar:'يفتح في علامة تبويب جديدة'};

// ---- the fake DOM ----
const METHODS=['addEventListener','removeEventListener','dispatchEvent','append','remove','setAttribute','getAttribute','closest'];
const READS=new Set([...METHODS,'parentElement','children','dataset','ownerDocument']);
const WRITES=new Set(['textContent','className','id','lang','dir','hidden','inert','tabIndex','href','hreflang','rel','target','type','disabled','alt','src','loading','decoding','width','height','dateTime']);
const OPTIONAL=new Set(['removeAttribute','replaceChildren','contains','getBoundingClientRect','style','clientWidth','clientHeight','scrollHeight','scrollTop','animate']);
const raws=new WeakMap();
const raw=node=>raws.get(node)??node;

function fakeDocument({optional=[],metrics=null,rect=null,clipboard,fonts=null,matchMedia=null,ResizeObserver=null,baseURI='https://horizon.example/site-b/index.html'}={}){
 const features=new Set(optional),violations=[];
 const docTarget={violations,features,created:[]};
 const view=new Proxy({},{get(_,name){
  if(name==='ResizeObserver')return ResizeObserver||undefined;
  if(name==='matchMedia')return matchMedia||undefined;
  if(name==='navigator')return clipboard===undefined?undefined:{clipboard};
  if(typeof name!=='symbol')violations.push('view.'+String(name));return undefined;
 },set(_,name){throw new TypeError('defaultView.'+String(name)+' is read-only here');}});
 let doc;
 const element=(tagName,namespace=null)=>{
  const target={tagName,namespace,children:[],parentElement:null,attributes:new Map(),dataset:{},listeners:new Map(),props:{},styles:new Map(),animations:[]};
  const api={
   addEventListener:(type,listener)=>{if(!target.listeners.has(type))target.listeners.set(type,new Set());target.listeners.get(type).add(listener);},
   removeEventListener:(type,listener)=>{target.listeners.get(type)?.delete(listener);},
   dispatchEvent:event=>{for(const listener of [...(target.listeners.get(event.type)||[])])listener.call(proxy,event);return !event.defaultPrevented;},
   append:(...nodes)=>{for(const node of nodes){
    if(!raws.has(node))throw new TypeError('append: Element arguments only');
    const child=raws.get(node);if(child.parentElement)raws.get(child.parentElement).children=raws.get(child.parentElement).children.filter(item=>item!==node);
    child.parentElement=proxy;target.children.push(node);
   }},
   remove:()=>{if(target.parentElement){const parent=raws.get(target.parentElement);parent.children=parent.children.filter(item=>item!==proxy);target.parentElement=null;}},
   setAttribute:(name,value)=>{target.attributes.set(name,String(value));},
   getAttribute:name=>target.attributes.has(name)?target.attributes.get(name):null,
   closest:selector=>{
    if(!/^(\.[\w-]+|[a-z][\w-]*)$/.test(selector))throw new TypeError('closest: a single tag name or a single .class, got '+selector);
    for(let node=proxy;node;node=raws.get(node).parentElement){
     const item=raws.get(node);
     if(selector.startsWith('.')?String(item.props.className||'').split(/\s+/).includes(selector.slice(1)):item.tagName===selector)return node;
    }
    return null;
   },
   removeAttribute:name=>{target.attributes.delete(name);},
   replaceChildren:(...nodes)=>{for(const node of target.children)raws.get(node).parentElement=null;target.children=[];api.append(...nodes);},
   contains:node=>{for(let item=node;item;item=raws.get(item).parentElement)if(item===proxy)return true;return false;},
   getBoundingClientRect:()=>rect?.(target)||{x:0,y:0,width:0,height:0,top:0,left:0,right:0,bottom:0},
   animate:(...args)=>{target.animations.push(args);return {cancel(){},finished:Promise.resolve()};},
  };
  const style={setProperty:(name,value)=>{target.styles.set(name,String(value));},getPropertyValue:name=>target.styles.get(name)??''};
  const proxy=new Proxy(target,{
   get(_,name){
    if(typeof name==='symbol')return undefined;
    if(OPTIONAL.has(name)){
     if(!features.has(name))return undefined;
     if(name==='style')return style;
     if(['clientWidth','clientHeight','scrollHeight','scrollTop'].includes(name))return metrics?.(target,name);
     return api[name];
    }
    if(READS.has(name)){
     if(name==='children')return [...target.children];
     if(name==='ownerDocument')return doc;
     if(name==='parentElement'||name==='dataset')return target[name];
     return api[name];
    }
    violations.push((WRITES.has(name)?'read back ':'read ')+tagName+'.'+name);
    return target.props[name];
   },
   set(_,name,value){
    if(!WRITES.has(name))throw new TypeError('write of '+tagName+'.'+String(name)+' is outside the DOM contract');
    target.props[name]=value;return true;
   },
  });
  raws.set(proxy,target);docTarget.created.push(target);return proxy;
 };
 doc=new Proxy(docTarget,{get(_,name){
  if(name==='createElement')return tagName=>element(String(tagName).toLowerCase());
  if(name==='createElementNS')return (namespace,tagName)=>element(tagName,namespace);
  if(name==='baseURI')return baseURI;
  if(name==='defaultView')return view;
  if(name==='fonts')return fonts||undefined;
  if(['violations','features','created'].includes(name))return docTarget[name];
  if(typeof name!=='symbol')violations.push('document.'+String(name));return undefined;
 }});
 return doc;
}
// A body (C's scroller) inside C's campus section.
function frame(doc,{density='normal'}={}){
 const section=doc.createElement('section'),body=doc.createElement('div');
 section.className='explorer-campus';section.dataset.density=density;body.className='explorer-campus-body';
 section.append(body);return {section,body};
}
// ---- the fake art (§7.1 API) ----
function fakeArt({printed=true,silhouette=true}={}){
 const calls=[];
 return {calls,shapes:null,
  ensureArtDefs(doc){calls.push(['ensureArtDefs']);},
  createSilhouette(doc,options){
   calls.push(['createSilhouette',options]);if(!silhouette)return null;
   const svg=doc.createElementNS(SVG,'svg');svg.setAttribute('class','hx-art');svg.setAttribute('data-kind',options.kind);svg.setAttribute('data-variant',options.variant);svg.setAttribute('aria-hidden','true');return svg;
  },
  createDots(doc){return doc.createElementNS(SVG,'svg');},
  createPrintedLogo(doc,{print,width,height}){
   calls.push(['createPrintedLogo',{print,width,height}]);if(!printed)return null;
   const logo=doc.createElement(print.kind==='sticker'?'img':'span');logo.className='hx-logo';logo.setAttribute('data-print',print.kind);logo.setAttribute('aria-hidden','true');
   logo.style?.setProperty?.('width',width+'px');logo.style?.setProperty?.('height',height+'px');return logo;
  },
  fitLogo(print,maxW,maxH,{minH=0}={}){const ratio=print?.aspectRatio||3,height=Math.max(Math.min(maxH,maxW/ratio),minH);return {width:height*ratio,height};},
  icon(doc,name){const svg=doc.createElementNS(SVG,'svg');svg.setAttribute('class','hx-icon');svg.setAttribute('data-icon',name);svg.setAttribute('aria-hidden','true');return svg;},
  flagHref:()=>null,logo:()=>null,
 };
}
// ---- helpers reading the raw tree ----
const descendants=node=>{const item=raw(node);return [item,...item.children.flatMap(descendants)];};
const classes=item=>String(item.props.className??item.attributes.get('class')??'').split(/\s+/).filter(Boolean);
const byClass=(node,name)=>descendants(node).filter(item=>classes(item).includes(name));
const one=(node,name)=>{const found=byClass(node,name);assert.equal(found.length,1,name);return found[0];};
const byTag=(node,name)=>descendants(node).filter(item=>item.tagName===name);
const textOf=node=>{const item=raw(node);return String(item.props.textContent??'')+item.children.map(textOf).join('');};
const attr=(node,name)=>raw(node).attributes.get(name)??null;
const prop=(node,name)=>raw(node).props[name];
const click=node=>raw(node).listeners.get('click')?.forEach(listener=>listener({type:'click',detail:1,preventDefault(){}}));
const settle=()=>new Promise(resolve=>setImmediate(resolve));
// formatRangeToParts grouped into runs of one source, as the sheet groups them (item 14).
const rangeParts=(range,startsOn,endsOn)=>{
 const segments=[];
 for(const part of range.formatRangeToParts(new Date(startsOn+'T00:00:00Z'),new Date(endsOn+'T00:00:00Z'))){const last=segments.at(-1);if(last?.source===part.source)last.text+=part.value;else segments.push({source:part.source,text:part.value});}
 return segments;
};
function mount(id,{language='fr',now='2026-10-24T12:00:00Z',density='normal',art=fakeArt(),docOptions={},countryExtra={},campus=enriched(id),...options}={}){
 const doc=fakeDocument(docOptions),{section,body}=frame(doc,{density});
 const handle=mountExplorerCampus({container:body,campus,country:country(language,countryExtra),locale:language,headingId:'explorer-campus-title-7',art,now:new Date(now),...options});
 return {doc,section,body,art,handle,root:handle.element};
}
const noViolations=doc=>assert.deepEqual(doc.violations,[],'accesses outside the DOM contract');

// ---- Paris ----
for(const language of ['fr','en','ar']){
 test(`Paris (${language}): heart, facts, website, photos, contacts, address, Piscines and the missing line`,async()=>{
  const opened=[];
  const {doc,body,art,handle,root}=mount('paris',{language,onOpenMedia:options=>{opened.push(options);return {close(){}};},docOptions:{optional:['style','clientWidth','removeAttribute','replaceChildren'],metrics:(target,name)=>name==='clientWidth'&&classes(target).includes('explorer-sheet-lantern')?165.9:undefined,clipboard:{async writeText(){}}}});
  assert.equal(raw(body).children[0],root);
  assert.equal(prop(root,'lang'),language);assert.equal(prop(root,'dir'),language==='ar'?'rtl':'ltr');
  assert.match(prop(root,'id'),/^explorer-sheet-\d+$/);
  assert.equal(raw(root).dataset.layout,'wide');assert.equal(raw(root).dataset.fit,'full');assert.equal(raw(root).dataset.sparse,'false');
  // Heart: lantern with the printed logo fitted to .76·d × .36·d, the h2, the country line.
  const heart=one(root,'explorer-sheet-heart'),lantern=one(root,'explorer-sheet-lantern');
  assert.equal(raw(handle.lantern),lantern);assert.equal(attr(lantern,'aria-hidden'),'true');
  assert.equal(raw(lantern).children[0],handle.logo);assert.equal(attr(handle.logo,'data-print'),'mask');
  const fitted=art.fitLogo(PRINTS.paris,.76*165.9,.36*165.9);
  assert.equal(raw(handle.logo).styles.get('width'),fitted.width+'px');assert.equal(raw(handle.logo).styles.get('height'),fitted.height+'px');
  assert.deepEqual(art.calls.find(call=>call[0]==='createPrintedLogo')[1].print,PRINTS.paris);
  const heading=one(root,'explorer-sheet-title');
  assert.equal(raw(handle.heading),heading);assert.equal(prop(heading,'id'),'explorer-campus-title-7');
  assert.equal(attr(heading,'tabindex'),'-1');assert.equal(prop(heading,'tabIndex'),-1);
  assert.equal(raw(heading.children[0]).tagName,'bdi');assert.equal(textOf(heading),'42 Paris');
  assert.equal(raw(heading).dataset.script,'latin','a Latin-script name (item 11)');
  const line=one(root,'explorer-sheet-country'),flag=one(line,'explorer-sheet-flag');
  assert.equal(flag.tagName,'img');assert.equal(flag.props.alt,'');assert.equal(flag.props.width,20);assert.equal(flag.props.height,15);
  assert.equal(flag.props.src,'assets/flags/fr.svg');assert.equal(textOf(line),FRANCE[language]);
  // Facts: « 2013 » in a time, « 5 000+ » LTR, labels with the as-of date and A's Source links.
  const facts=byClass(root,'explorer-sheet-fact');
  assert.deepEqual(facts.map(fact=>fact.dataset.key),['opening','students']);
  const opening=byTag(facts[0],'dd')[0],openingTime=byTag(opening,'time')[0];
  assert.equal(openingTime.props.dateTime,'2013');assert.equal(textOf(openingTime),'2013');
  const students=byTag(facts[1],'dd')[0];
  assert.equal(students.children.length,1);assert.equal(raw(students.children[0]).props.dir,'ltr');assert.equal(textOf(students),profiles.paris.stats.students.value);assert.match(textOf(students),/^5\s000\+$/u);
  const labels={fr:['Ouverture','Étudiants · en 2025'],en:['Opened','Students · in 2025'],ar:['الافتتاح','الطلاب · في 2025']}[language];
  const source={fr:'Source',en:'Source',ar:'المصدر'}[language];
  assert.equal(textOf(byTag(facts[0],'dt')[0]),labels[0]+' · '+source);
  assert.equal(textOf(byTag(facts[1],'dt')[0]),labels[1]+' · '+source);
  assert.equal(byTag(byTag(facts[1],'dt')[0],'time')[0].props.dateTime,'2025');
  const factSources=byClass(heart,'explorer-sheet-source');
  assert.deepEqual(factSources.map(link=>link.props.href),['https://42.fr/le-campus-de-paris/42-paris-campus/','https://42.fr/']);
  for(const link of factSources){
   assert.equal(link.tagName,'a');assert.equal(textOf(link),source);assert.equal(link.props.target,'_blank');assert.equal(link.props.rel,'noopener noreferrer');
   assert.equal(attr(link,'aria-label'),source+'. '+NEW_TAB[language]);
  }
  // Website pill per language (A's resolution), with A's fallback-language note in Arabic.
  const cta=one(root,'explorer-sheet-cta'),expected={fr:['https://42.fr/','fr'],en:['https://42.fr/en/homepage/','en'],ar:['https://42.fr/en/homepage/','en']}[language];
  const site={fr:'Site officiel du campus',en:'Official campus website',ar:'الموقع الرسمي للفرع'}[language];
  assert.equal(cta.props.href,expected[0]);assert.equal(cta.props.hreflang,expected[1]);assert.equal(cta.props.target,'_blank');
  assert.equal(attr(cta,'aria-label'),site+' · 42 Paris. '+NEW_TAB[language]);assert.equal(textOf(cta),site);
  assert.equal(attr(cta.children[1],'data-icon'),'external');
  const notes=raw(heart).children.map(raw).filter(item=>classes(item).includes('explorer-sheet-note')).map(textOf);
  assert.deepEqual(notes,language==='ar'?['الموقع باللغة '+new Intl.DisplayNames('ar',{type:'language'}).of('en')]:[]);
  const verified=one(root,'explorer-sheet-verified'),verifiedTime=byTag(verified,'time')[0];
  assert.equal(verifiedTime.props.dateTime,'2026-10-08');
  assert.equal(textOf(verified),{fr:'Dernière vérification : ',en:'Last checked: ',ar:'آخر تحقق: '}[language]+new Intl.DateTimeFormat(tag(language),{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(Date.UTC(2026,9,8)));
  // Heart items in order, for C's entrance.
  assert.deepEqual(handle.heartItems.map(raw),[heading,line,one(root,'explorer-sheet-facts'),cta,...(language==='ar'?[byClass(heart,'explorer-sheet-note')[0]]:[]),verified]);
  // Photos: two prints, the back one aria-hidden and inert, the count, a turn, the media viewer.
  const prints=byClass(root,'explorer-sheet-photo');
  assert.equal(prints.length,2);assert.deepEqual(prints.map(item=>item.dataset.depth),['0','1']);
  assert.deepEqual(prints.map(item=>item.styles.get('z-index')),['10','9']);
  assert.equal(attr(prints[0],'aria-hidden'),null);assert.equal(prints[0].props.inert,false);
  assert.equal(attr(prints[1],'aria-hidden'),'true');assert.equal(prints[1].props.inert,true);
  const images=byClass(root,'explorer-sheet-photo-image');
  assert.deepEqual(images.map(image=>image.props.alt),profiles.paris.photos.map(photo=>photo.alt[language]));
  assert.deepEqual(images.map(image=>image.props.loading),['eager','lazy']);
  assert.equal(images[0].props.src,'https://horizon.example/site-b/assets/campuses/paris-campus.jpg');
  const count=one(root,'explorer-sheet-photo-count');
  assert.equal(textOf(count),'1 / 2');assert.equal(attr(count,'role'),'status');assert.equal(attr(count,'aria-live'),'polite');assert.equal(attr(count,'aria-atomic'),'true');assert.equal(count.props.dir,'ltr');
  const credit=one(root,'explorer-sheet-credit');
  assert.equal(textOf(credit),'42 Paris · '+source);assert.equal(byTag(credit,'bdi')[0].props.dir,'auto');
  // « · Source » is one unbreakable tail after a breakable space (item 13).
  const creditTail=one(credit,'explorer-sheet-credit-tail');
  assert.deepEqual(raw(credit).children.map(textOf),['42 Paris',' ','· '+source]);assert.equal(raw(raw(credit).children[2]),creditTail);
  assert.equal(byTag(creditTail,'a')[0].props.href,'https://42.fr/le-campus-de-paris/42-paris-campus/');
  const next=one(root,'explorer-sheet-photo-next');
  assert.equal(attr(next,'aria-label'),{fr:'Photo suivante',en:'Next photo',ar:'الصورة التالية'}[language]);
  assert.equal(attr(next,'aria-controls'),prop(one(root,'explorer-sheet-stack'),'id'));
  click(next);
  assert.deepEqual(prints.map(item=>item.dataset.depth),['1','0']);assert.equal(textOf(count),'2 / 2');
  assert.equal(attr(prints[0],'aria-hidden'),'true');assert.equal(prints[0].props.inert,true);assert.equal(attr(prints[1],'aria-hidden'),null);
  assert.equal(textOf(credit),'42 Paris · '+source);
  const opens=byClass(root,'explorer-sheet-photo-open');
  assert.equal(attr(opens[1],'aria-haspopup'),'dialog');
  assert.equal(attr(opens[1],'aria-label'),{fr:'Agrandir la photo',en:'Enlarge photo',ar:'تكبير الصورة'}[language]+' : '+profiles.paris.photos[1].alt[language]);
  click(opens[1]);
  assert.equal(opened.length,1);assert.equal(opened[0].index,1);assert.equal(opened[0].locale,language);assert.equal(raw(opened[0].trigger),opens[1]);
  assert.deepEqual(opened[0].items.map(item=>item.type),['image','image']);assert.equal(opened[0].items[1].alt,profiles.paris.photos[1].alt[language]);
  // Contacts: three mailto links, then their Source.
  const contacts=one(root,'explorer-sheet-contacts');
  const values=byClass(contacts,'explorer-sheet-contact-value');
  assert.deepEqual(values.map(value=>value.props.href),['mailto:apply@42paris.fr','mailto:contact@42paris.fr','mailto:referent-handicap@42.fr']);
  assert.ok(values.every(value=>value.tagName==='a'&&value.props.dir==='auto'&&value.props.target===undefined));
  assert.deepEqual(byClass(contacts,'explorer-sheet-contact-label').map(textOf),profiles.paris.contacts.map(contact=>contact.label[language]));
  const contactSource=byTag(one(contacts,'explorer-sheet-source'),'a')[0];
  assert.equal(contactSource.props.href,'https://42.fr/entrer-en-contact/');assert.equal(attr(contactSource,'aria-label'),source+'. '+NEW_TAB[language]);
  // Address, Copy and Directions.
  const where=one(root,'explorer-sheet-address'),address=byTag(where,'address')[0];
  assert.equal(textOf(address),handle.element&&network.campuses.find(item=>item.id==='paris').address);assert.equal(address.props.dir,'auto');
  const directions=one(where,'explorer-sheet-directions'),route=new URL(directions.props.href);
  assert.equal(route.origin+route.pathname,'https://www.google.com/maps/dir/');assert.equal(route.searchParams.get('api'),'1');
  assert.equal(route.searchParams.get('destination'),'42 Paris, 96, boulevard Bessières 75017 PARIS France');
  assert.equal(directions.props.target,'_blank');assert.equal(directions.props.rel,'noopener noreferrer');
  assert.equal(attr(directions,'aria-label'),{fr:'Itinéraire dans Google Maps',en:'Directions in Google Maps',ar:'الاتجاهات في خرائط Google'}[language]);
  // Piscines: two upcoming, « Prochaine » on the first, formatRange dates, the note and the dates link.
  const rows=byClass(root,'explorer-sheet-piscine');
  assert.deepEqual(rows.map(row=>[row.dataset.startsOn,row.dataset.endsOn]),[['2027-01-25','2027-02-19'],['2027-03-01','2027-03-26']]);
  assert.deepEqual(byClass(root,'explorer-sheet-chip').map(textOf),[{fr:'Prochaine',en:'Next',ar:'القادمة'}[language]]);
  assert.equal(raw(raw(byClass(root,'explorer-sheet-chip')[0].parentElement).parentElement),rows[0]);
  const range=new Intl.DateTimeFormat(tag(language),{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  assert.deepEqual(byClass(root,'explorer-sheet-piscine-dates').map(textOf),[range.formatRange(Date.UTC(2027,0,25),Date.UTC(2027,1,19)),range.formatRange(Date.UTC(2027,2,1),Date.UTC(2027,2,26))]);
  // Each end of a range is A's <time datetime> around its part of the text (item 14).
  byClass(root,'explorer-sheet-piscine-dates').forEach((dates,index)=>{
   const [startsOn,endsOn]=[rows[index].dataset.startsOn,rows[index].dataset.endsOn];
   const expected=rangeParts(range,startsOn,endsOn).filter(part=>part.source!=='shared').map(part=>[part.source==='startRange'?startsOn:endsOn,part.text]);
   assert.deepEqual(byTag(dates,'time').map(time=>[time.props.dateTime,textOf(time)]),expected);
   assert.deepEqual(expected.map(item=>item[0]),[startsOn,endsOn]);
  });
  assert.deepEqual(byClass(rows[0],'explorer-sheet-source'),[],'the Piscine source equals the dates link');
  const pool=one(root,'explorer-sheet-piscines');
  assert.deepEqual(byClass(pool,'explorer-sheet-note').map(textOf),[profiles.paris.piscinesNote[language]]);
  const dates=one(pool,'explorer-sheet-dates-link');
  assert.equal(dates.props.href,'https://42.fr/admissions/admissions/');
  assert.equal(textOf(dates),{fr:'Consulter les dates officielles',en:'Check official dates',ar:'الاطلاع على المواعيد الرسمية'}[language]);
  assert.equal(attr(dates,'aria-label'),textOf(dates)+'. '+NEW_TAB[language]);
  // The missing line.
  assert.equal(textOf(one(root,'explorer-sheet-missing')),{fr:'Pas encore renseignés ici : promotions et alumni.',en:'Not provided here yet: cohorts and alumni.',ar:'لم تُضف هنا بعد: الدفعات والخريجون.'}[language]);
  assert.equal(attr(one(root,'explorer-sheet-missing').children[0],'data-icon'),'sparkle');
  // Wings in reading order.
  assert.deepEqual(raw(root).children.map(child=>classes(raw(child))[0]),['explorer-sheet-heart','explorer-sheet-wing','explorer-sheet-wing']);
  assert.deepEqual([raw(handle.wings.start).dataset.wing,raw(handle.wings.end).dataset.wing],['start','end']);
  assert.deepEqual(raw(handle.wings.start).children.map(child=>classes(raw(child))[1]),['explorer-sheet-photos','explorer-sheet-contacts']);
  assert.deepEqual(raw(handle.wings.end).children.map(child=>classes(raw(child))[1]??classes(raw(child))[0]),['explorer-sheet-address','explorer-sheet-piscines','explorer-sheet-missing']);
  await settle();noViolations(doc);
 });
}

test('copying the address announces success, denial and a missing clipboard, and never after destroy',async()=>{
 const address=network.campuses.find(item=>item.id==='paris').address;
 const written=[];
 let fixture=mount('paris',{docOptions:{clipboard:{async writeText(value){written.push(value);}}}});
 let button=one(fixture.root,'explorer-sheet-copy'),status=one(fixture.root,'explorer-sheet-status');
 assert.equal(attr(status,'role'),'status');assert.equal(attr(status,'aria-live'),'polite');assert.equal(attr(status,'aria-atomic'),'true');
 assert.equal(textOf(button),'Copier l’adresse');assert.equal(attr(button.children[0],'data-icon'),'copy');
 click(button);assert.equal(button.props.disabled,true);await settle();
 assert.deepEqual(written,[address]);assert.equal(textOf(status),'Adresse copiée.');assert.equal(button.props.disabled,false);
 for(const options of [{docOptions:{}},{onCopyAddress:async()=>{throw new Error('Not allowed');}}]){
  fixture=mount('paris',options);button=one(fixture.root,'explorer-sheet-copy');status=one(fixture.root,'explorer-sheet-status');
  click(button);await settle();
  assert.equal(textOf(status),'La copie automatique est indisponible. Sélectionnez l’adresse ci-dessus pour la copier.');assert.equal(button.props.disabled,false);
 }
 let finish;fixture=mount('paris',{onCopyAddress:()=>new Promise(resolve=>{finish=resolve;})});
 button=one(fixture.root,'explorer-sheet-copy');status=one(fixture.root,'explorer-sheet-status');
 click(button);click(button);fixture.handle.destroy();finish();await settle();
 assert.equal(textOf(status),'');noViolations(fixture.doc);
});

test('Mulhouse: four photos, the opening month, a dated count, no upcoming Piscine and four contacts',async()=>{
 const {doc,root}=mount('mulhouse',{now:'2026-10-08T12:00:00Z'});
 assert.equal(byClass(root,'explorer-sheet-photo').length,4);
 assert.deepEqual(byClass(root,'explorer-sheet-photo').map(item=>item.dataset.depth),['0','1','2','2']);
 const facts=byClass(root,'explorer-sheet-fact'),openingTime=byTag(facts[0],'time')[0];
 assert.equal(openingTime.props.dateTime,'2021-11');
 assert.equal(textOf(openingTime),new Intl.DateTimeFormat('fr',{year:'numeric',month:'long',timeZone:'UTC'}).format(Date.UTC(2021,10,1)));
 assert.equal(textOf(byTag(facts[1],'dd')[0]),'413');assert.match(textOf(byTag(facts[1],'dt')[0]),/^Étudiants · en 2024 · Source$/);
 assert.equal(byClass(root,'explorer-sheet-timeline').length,0);
 const pool=one(root,'explorer-sheet-piscines');
 assert.deepEqual(byClass(pool,'explorer-sheet-note').map(textOf),['Les dates des Piscines sont publiées sur le site officiel du campus.',profiles.mulhouse.piscinesNote.fr]);
 assert.equal(one(pool,'explorer-sheet-dates-link').props.href,'https://www.42mulhouse.fr/admissions/');
 const values=byClass(root,'explorer-sheet-contact-value');
 assert.deepEqual(values.map(value=>value.props.href),['mailto:contact@42mulhouse.fr','tel:+33367230282','mailto:referent-handicap@42mulhouse.fr','https://www.42mulhouse.fr/faq/#contact']);
 assert.equal(values[3].props.target,'_blank');assert.equal(attr(values[3],'aria-label'),'Écrire au campus. S’ouvre dans un nouvel onglet');
 assert.equal(textOf(values[3]),'Écrire au campus');
 assert.equal(textOf(one(root,'explorer-sheet-credit')),'42 Mulhouse · Luc Boegly · Source');
 assert.equal(textOf(byTag(one(root,'explorer-sheet-credit'),'bdi')[0]),'42 Mulhouse · Luc Boegly');assert.equal(textOf(one(root,'explorer-sheet-credit-tail')),'· Source');
 assert.equal(textOf(one(root,'explorer-sheet-missing')),'Pas encore renseignés ici : promotions et alumni.');
 noViolations(doc);
});

test('Lyon (sparse): the locator replaces the photos, no contacts nor facts, the website gives the dates',async()=>{
 const {doc,root,art,handle}=mount('lyon',{docOptions:{optional:['clientHeight','style'],metrics:(target,name)=>name==='clientHeight'&&classes(target).includes('explorer-sheet-locator-art')?220:undefined}});
 assert.equal(raw(root).dataset.sparse,'true');
 assert.equal(handle.lantern,null);assert.equal(handle.logo,null,'no print in the manifest: no lantern');
 assert.deepEqual(art.calls.map(call=>call[0]),['ensureArtDefs','createSilhouette']);
 const options=art.calls[1][1];
 assert.equal(options.kind,'country');assert.equal(options.variant,'locator');assert.equal(options.hotPin,'lyon');assert.equal(options.shape,FRA_SHAPE);
 assert.equal(options.scale,220/94.8);
 const locator=one(root,'explorer-sheet-locator'),artBox=one(locator,'explorer-sheet-locator-art');
 assert.equal(attr(artBox,'aria-hidden'),'true');assert.equal(attr(artBox.children[0],'data-variant'),'locator');
 assert.equal(artBox.styles.get('--ratio'),String(Math.round(100/94.8*10000)/10000));
 assert.equal(textOf(byTag(locator,'figcaption')[0]),'Où se trouve 42 Lyon');
 // The figure is named by its caption (item 12).
 const caption=byTag(locator,'figcaption')[0];
 assert.equal(caption.props.id,prop(root,'id')+'-locator');assert.equal(attr(locator,'aria-labelledby'),caption.props.id);
 assert.equal(byClass(root,'explorer-sheet-photos').length,0);assert.equal(byClass(root,'explorer-sheet-contacts').length,0);
 assert.equal(byClass(root,'explorer-sheet-facts').length,0);
 const pool=one(root,'explorer-sheet-piscines');
 assert.deepEqual(byClass(pool,'explorer-sheet-note').map(textOf),['Les dates des Piscines sont publiées sur le site officiel du campus.']);
 assert.equal(one(pool,'explorer-sheet-dates-link').props.href,'https://42lyon.fr/');
 assert.equal(textOf(one(root,'explorer-sheet-missing')),'Pas encore renseignés ici : photos, contacts, date d’ouverture et chiffres.');
 assert.deepEqual(handle.heartItems.map(raw),[one(root,'explorer-sheet-title'),one(root,'explorer-sheet-country'),one(root,'explorer-sheet-cta')]);
 for(const [language,text] of [['en','Not provided here yet: photos, contacts, opening date and figures.'],['ar','لم تُضف هنا بعد: الصور، جهات التواصل، تاريخ الافتتاح والأرقام.']]){
  const other=mount('lyon',{language});
  assert.equal(textOf(one(other.root,'explorer-sheet-missing')),text);
  assert.equal(textOf(byTag(one(other.root,'explorer-sheet-locator'),'figcaption')[0]),{en:'Where 42 Lyon is',ar:'موقع 42 Lyon'}[language]);
  assert.equal(attr(one(other.root,'explorer-sheet-locator'),'aria-labelledby'),byTag(one(other.root,'explorer-sheet-locator'),'figcaption')[0].props.id);
 }
 noViolations(doc);
});

test('Piscines: an ongoing one says « En cours », ended and imprecise ones disappear; an unsafe contact stays text',()=>{
 const campus={...enriched('paris'),profile:{
  piscines:[
   {label:'Finished',startsOn:'2026-09-01',endsOn:'2026-10-23'},
   {label:'Ongoing',startsOn:'2026-10-20',endsOn:'2026-10-24',sourceUrl:'https://campus.example/piscine'},
   {label:'Later',startsOn:'2027-03-01',endsOn:'2027-03-26'},
   {label:'Sooner',startsOn:'2027-01-25'},
   {label:'Invalid',startsOn:'2027-02-30'},{label:'Month only',startsOn:'2027-07'},{label:'Wrong order',startsOn:'2027-04-10',endsOn:'2027-04-01'},
  ],piscineSourceUrl:'https://campus.example/admissions',
  contacts:[{label:'Unsafe',value:'Visible text',href:'javascript:alert(1)'},{label:'Phone',value:'+33 1 23 45 67 89',href:'tel:+33123456789'}],
 }};
 const {doc,root}=mount('paris',{campus});
 assert.deepEqual(byClass(root,'explorer-sheet-piscine-name').map(name=>textOf(raw(name).children[0])),['Ongoing','Sooner','Later']);
 assert.deepEqual(byClass(root,'explorer-sheet-chip').map(textOf),['En cours','Prochaine']);
 const rows=byClass(root,'explorer-sheet-piscine');
 assert.equal(rows[1].dataset.endsOn,undefined);
 assert.equal(textOf(byClass(rows[1],'explorer-sheet-piscine-dates')[0]),new Intl.DateTimeFormat('fr',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(Date.UTC(2027,0,25)));
 // A Piscine's own source shows only when it differs from the dates link.
 assert.deepEqual(byClass(rows[0],'explorer-sheet-source').map(link=>link.props.href),['https://campus.example/piscine']);
 assert.equal(one(root,'explorer-sheet-dates-link').props.href,'https://campus.example/admissions');
 const values=byClass(root,'explorer-sheet-contact-value');
 assert.equal(values[0].tagName,'span');assert.equal(textOf(values[0]),'Visible text');assert.equal(values[1].props.href,'tel:+33123456789');
 noViolations(doc);
 // As in A: only photos resolve against the page; a relative link or an unsafe schedule stays out, with no fallback.
 const other=mount('paris',{campus:{...enriched('paris'),profile:{contacts:[{label:'Relative',value:'Page',href:'contact.html'}],contactSourceUrl:'sources.html',piscines:[],piscineSourceUrl:'javascript:alert(1)'}}});
 assert.equal(byClass(other.root,'explorer-sheet-contact-value')[0].tagName,'span');
 assert.equal(byClass(other.root,'explorer-sheet-source').length,0);
 assert.equal(byClass(other.root,'explorer-sheet-dates-link').length,0);
});

test('Piscine dates: a <time datetime> for each end, one for a single day or an open start, the text shown unchanged',()=>{
 const campus={...enriched('paris'),profile:{piscines:[{label:'Range',startsOn:'2027-01-25',endsOn:'2027-02-19'},{label:'One day',startsOn:'2027-03-01',endsOn:'2027-03-01'},{label:'Open',startsOn:'2027-04-12'}]}};
 for(const language of ['fr','en','ar']){
  const range=new Intl.DateTimeFormat(tag(language),{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const {doc,root}=mount('paris',{language,campus}),dates=byClass(root,'explorer-sheet-piscine-dates');
  assert.deepEqual(dates.map(textOf),[range.formatRange(Date.UTC(2027,0,25),Date.UTC(2027,1,19)),range.formatRange(Date.UTC(2027,2,1),Date.UTC(2027,2,1)),range.format(Date.UTC(2027,3,12))]);
  assert.deepEqual(dates.map(line=>byTag(line,'time').map(time=>time.props.dateTime)),[['2027-01-25','2027-02-19'],['2027-03-01'],['2027-04-12']]);
  const parts=rangeParts(range,'2027-01-25','2027-02-19');
  assert.deepEqual(byTag(dates[0],'time').map(textOf),parts.filter(part=>part.source!=='shared').map(part=>part.text));
  // The shared parts (« – », the year) stay plain text between and after the two times.
  assert.deepEqual(raw(dates[0]).children.map(textOf),parts.map(part=>part.text));
  assert.equal(textOf(byTag(dates[1],'time')[0]),textOf(dates[1]),'one day: the whole text is the start date');
  assert.equal(textOf(byTag(dates[2],'time')[0]),textOf(dates[2]),'no end: the start date');
  noViolations(doc);
 }
 // Without formatRangeToParts: A's two full dates around « – », each in its time.
 const original=Intl.DateTimeFormat.prototype.formatRangeToParts;
 try{
  Intl.DateTimeFormat.prototype.formatRangeToParts=undefined;
  const range=new Intl.DateTimeFormat('fr',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const {root}=mount('paris',{campus}),dates=byClass(root,'explorer-sheet-piscine-dates');
  assert.equal(textOf(dates[0]),range.format(Date.UTC(2027,0,25))+' – '+range.format(Date.UTC(2027,1,19)));
  assert.deepEqual(byTag(dates[0],'time').map(time=>[time.props.dateTime,textOf(time)]),[['2027-01-25',range.format(Date.UTC(2027,0,25))],['2027-02-19',range.format(Date.UTC(2027,1,19))]]);
 }finally{Intl.DateTimeFormat.prototype.formatRangeToParts=original;}
});

test('photo credit: « · Source » is one unbreakable tail; an author or a source alone has no separator',()=>{
 const photos=[{src:'assets/a.jpg',credit:'Jane Doe'},{src:'assets/b.jpg',sourceUrl:'https://photos.example/b'},{src:'assets/c.jpg',credit:{fr:'Studio',ar:'استوديو'},sourceUrl:'https://photos.example/c'},{src:'assets/d.jpg'}];
 const {doc,root}=mount('paris',{campus:{...enriched('paris'),profile:{photos}}});
 const credit=one(root,'explorer-sheet-credit'),next=one(root,'explorer-sheet-photo-next');
 assert.equal(textOf(credit),'Jane Doe');assert.equal(byClass(credit,'explorer-sheet-credit-tail').length,0);assert.equal(byTag(credit,'a').length,0);
 click(next);
 assert.equal(textOf(credit),'Source');assert.equal(byClass(credit,'explorer-sheet-credit-tail').length,0);
 assert.equal(raw(credit).children.length,1);assert.equal(raw(raw(credit).children[0]).tagName,'a');
 click(next);
 assert.deepEqual(raw(credit).children.map(textOf),['Studio',' ','· Source']);
 assert.equal(byTag(one(credit,'explorer-sheet-credit-tail'),'a')[0].props.href,'https://photos.example/c');assert.equal(prop(credit,'hidden'),false);
 click(next);
 assert.equal(raw(credit).children.length,0);assert.equal(prop(credit,'hidden'),true);
 noViolations(doc);
});

test('the h2 marks a Latin-script name (every catalogue name), never an Arabic-script one',()=>{
 for(const campus of network.campuses){
  const {root}=mount('paris',{language:'ar',campus:{...enriched('paris'),name:campus.name}});
  assert.equal(raw(one(root,'explorer-sheet-title')).dataset.script,'latin',campus.name);
 }
 for(const name of ['٤٢ الرباط','42 الرباط']){
  const {doc,root}=mount('paris',{language:'ar',campus:{...enriched('paris'),name}});
  assert.equal(raw(one(root,'explorer-sheet-title')).dataset.script,undefined,name);noViolations(doc);
 }
});

test('figures: a real zero is kept, absent ones are listed, day-precise dates read « au »',()=>{
 const campus={...enriched('paris'),profile:{stats:{students:{value:1200,asOf:'2026-09',sourceUrl:'https://campus.example/students'},cohorts:{value:0,asOf:'2026-10-05'},alumni:{value:null}}}};
 const {root}=mount('paris',{campus});
 const facts=byClass(root,'explorer-sheet-fact');
 assert.deepEqual(facts.map(fact=>fact.dataset.key),['students','cohorts']);
 assert.deepEqual(facts.map(fact=>textOf(byTag(fact,'dd')[0])),[new Intl.NumberFormat('fr').format(1200),'0']);
 assert.equal(textOf(byTag(facts[0],'dt')[0]),'Étudiants · en '+new Intl.DateTimeFormat('fr',{year:'numeric',month:'long',timeZone:'UTC'}).format(Date.UTC(2026,8,1))+' · Source');
 assert.equal(textOf(byTag(facts[1],'dt')[0]),'Promotions · au '+new Intl.DateTimeFormat('fr',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(Date.UTC(2026,9,5)));
 assert.equal(textOf(one(root,'explorer-sheet-missing')),'Pas encore renseignés ici : photos, contacts, date d’ouverture et alumni.');
 assert.equal(raw(root).dataset.sparse,'false');
});

test('handle: lantern and logo only with a print the art module could draw; without art every text stays',()=>{
 let fixture=mount('paris');
 assert.deepEqual(Object.keys(fixture.handle).sort(),['destroy','element','heading','heartItems','lantern','logo','wings']);
 assert.ok(fixture.handle.lantern&&fixture.handle.logo);
 fixture=mount('paris',{art:fakeArt({printed:false})});
 assert.equal(fixture.handle.lantern,null);assert.equal(fixture.handle.logo,null);assert.equal(byClass(fixture.root,'explorer-sheet-lantern').length,0);
 fixture=mount('paris',{campus:{...enriched('paris'),logo:null}});
 assert.equal(fixture.handle.lantern,null);assert.deepEqual(fixture.art.calls.filter(call=>call[0]==='createPrintedLogo'),[]);
 // The Codam sticker keeps its own size attributes on refit.
 fixture=mount('codam',{docOptions:{optional:['style','clientWidth'],metrics:(target,name)=>name==='clientWidth'&&classes(target).includes('explorer-sheet-lantern')?150:undefined}});
 assert.equal(fixture.handle.logo&&raw(fixture.handle.logo).tagName,'img');
 const sticker=fixture.art.fitLogo(PRINTS.codam,.76*150,.36*150);
 assert.equal(prop(fixture.handle.logo,'width'),Math.round(sticker.width));assert.equal(prop(fixture.handle.logo,'height'),Math.round(sticker.height));
 // No art at all: no logo, no locator drawing, no icon, every text.
 for(const id of ['paris','lyon']){
  fixture=mount(id,{art:null});
  assert.equal(fixture.handle.lantern,null);assert.equal(byClass(fixture.root,'hx-icon').length,0);
  assert.equal(textOf(one(fixture.root,'explorer-sheet-title')),network.campuses.find(item=>item.id===id).name);
  assert.ok(textOf(one(fixture.root,'explorer-sheet-missing')).length>0);
  assert.equal(textOf(one(fixture.root,'explorer-sheet-cta')),'Site officiel du campus');
  noViolations(fixture.doc);
 }
 assert.equal(byClass(fixture.root,'explorer-sheet-locator-art').length,0);
 assert.equal(textOf(byTag(one(fixture.root,'explorer-sheet-locator'),'figcaption')[0]),'Où se trouve 42 Lyon');
 assert.equal(attr(one(fixture.root,'explorer-sheet-locator'),'aria-labelledby'),prop(fixture.root,'id')+'-locator');
});

// ---- layout and fit cascade ----
function mediaFake(width){
 const lists=[];
 const evaluate=query=>{const [,kind,value]=query.match(/\((max|min)-width:\s*(\d+)px\)/);return kind==='max'?state.width<=Number(value):state.width>=Number(value);};
 const state={width,lists,matchMedia(query){
  const listeners=new Set(),list={media:query,get matches(){return evaluate(query);},addEventListener:(type,listener)=>{if(type==='change')listeners.add(listener);},removeEventListener:(type,listener)=>{listeners.delete(listener);},listeners};
  lists.push(list);return list;
 },resize(next){
  const before=lists.map(list=>list.matches);state.width=next;
  lists.forEach((list,index)=>{if(list.matches!==before[index])for(const listener of [...list.listeners])listener({type:'change',matches:list.matches});});
 }};
 return state;
}
test('data-layout follows matchMedia and the density: wide, stacked, single; wide without matchMedia',()=>{
 for(const [width,density,layout] of [[1440,'normal','wide'],[1024,'normal','stacked'],[390,'normal','single'],[1440,'tiny','single'],[700,'short','stacked'],[1100,'short','wide']]){
  const media=mediaFake(width),{root}=mount('paris',{density,docOptions:{matchMedia:media.matchMedia}});
  assert.equal(raw(root).dataset.layout,layout,width+' '+density);
 }
 assert.equal(raw(mount('paris').root).dataset.layout,'wide');
 const media=mediaFake(1440),fixture=mount('paris',{docOptions:{matchMedia:media.matchMedia}});
 media.resize(1024);assert.equal(raw(fixture.root).dataset.layout,'stacked');
 media.resize(600);assert.equal(raw(fixture.root).dataset.layout,'single');
 media.resize(1280);assert.equal(raw(fixture.root).dataset.layout,'wide');
 noViolations(fixture.doc);
});

function cascadeFixture({heights,density='normal',width=1440,client=497,id='paris',fonts=null}={}){
 const tried=[],media=mediaFake(width),observers=[];
 let box={width:1440,height:client};
 class Observer{constructor(callback){this.callback=callback;this.targets=[];this.disconnected=false;observers.push(this);}observe(target,options){this.targets.push([target,options]);}disconnect(){this.disconnected=true;}}
 const docOptions={optional:['clientHeight','scrollHeight','clientWidth','getBoundingClientRect','style'],matchMedia:media.matchMedia,ResizeObserver:Observer,fonts,
  rect:target=>classes(target).includes('explorer-campus-body')?{x:0,y:0,width:box.width,height:box.height}:null,
  metrics:(target,name)=>{
   if(!classes(target).includes('explorer-campus-body'))return name==='clientWidth'&&classes(target).includes('explorer-sheet-lantern')?160:undefined;
   if(name==='clientHeight')return box.height;
   if(name==='scrollHeight'){const fit=raw(target.children[0]).dataset.fit;tried.push(fit);return heights[fit];}
   return undefined;
  }};
 const fixture=mount(id,{density,docOptions});
 return {...fixture,tried,media,observers,resize(next){box={...box,...next};},fit:()=>raw(fixture.root).dataset.fit};
}
test('fit cascade: full → snug → tight → tighter → scroll, keeping the first step that fits',()=>{
 let fixture=cascadeFixture({heights:{full:560,snug:540,tight:510,tighter:497,scroll:560}});
 assert.deepEqual(fixture.tried,['full','snug','tight','tighter']);assert.equal(fixture.fit(),'tighter');
 fixture=cascadeFixture({heights:{full:530,snug:498,tight:470,tighter:460,scroll:530}});
 assert.deepEqual(fixture.tried,['full','snug']);assert.equal(fixture.fit(),'snug');
 fixture=cascadeFixture({heights:{full:497,snug:497,tight:497,tighter:497,scroll:497}});
 assert.deepEqual(fixture.tried,['full']);assert.equal(fixture.fit(),'full');
 fixture=cascadeFixture({heights:{full:600,snug:590,tight:580,tighter:570,scroll:600}});
 assert.deepEqual(fixture.tried,['full','snug','tight','tighter']);assert.equal(fixture.fit(),'scroll');
 // Not wide, or not a normal band: full, without measuring.
 for(const options of [{width:1024},{width:390},{density:'short'},{density:'tiny'}]){
  fixture=cascadeFixture({heights:{full:900},...options});
  assert.deepEqual(fixture.tried,[]);assert.equal(fixture.fit(),'full');
 }
 noViolations(fixture.doc);
});
test('fit cascade runs from the container observer only on a change, on a layout change and once after fonts',async()=>{
 let resolveFonts;const fonts={ready:new Promise(resolve=>{resolveFonts=resolve;})};
 const fixture=cascadeFixture({heights:{full:560,snug:540,tight:510,tighter:497,scroll:560},fonts});
 assert.equal(fixture.observers.length,1);
 const [observer]=fixture.observers;
 assert.equal(observer.targets.length,1);assert.equal(observer.targets[0][0],fixture.body);assert.deepEqual(observer.targets[0][1],{box:'border-box'});
 fixture.tried.length=0;
 observer.callback([{target:fixture.body}]);
 assert.deepEqual(fixture.tried,[],'same size, density and layout: nothing runs');
 fixture.resize({height:520});observer.callback([{target:fixture.body}]);
 assert.deepEqual(fixture.tried,['full','snug','tight']);assert.equal(fixture.fit(),'tight');
 fixture.tried.length=0;observer.callback([{target:fixture.body}]);assert.deepEqual(fixture.tried,[]);
 // A density change from C (the band) re-runs it; a layout change too.
 raw(fixture.section).dataset.density='short';observer.callback([{target:fixture.body}]);
 assert.equal(fixture.fit(),'full');assert.deepEqual(fixture.tried,[]);
 raw(fixture.section).dataset.density='normal';observer.callback([{target:fixture.body}]);
 assert.deepEqual(fixture.tried,['full','snug','tight']);
 fixture.tried.length=0;fixture.media.resize(1024);
 assert.equal(raw(fixture.root).dataset.layout,'stacked');assert.equal(fixture.fit(),'full');assert.deepEqual(fixture.tried,[]);
 fixture.media.resize(1440);assert.deepEqual(fixture.tried,['full','snug','tight']);
 // Copy adds the status line without any re-run (D12).
 fixture.tried.length=0;click(one(fixture.root,'explorer-sheet-copy'));await settle();
 assert.deepEqual(fixture.tried,[]);
 // fonts.ready: once.
 resolveFonts();await settle();
 assert.deepEqual(fixture.tried,['full','snug','tight']);
 noViolations(fixture.doc);
});
test('the logo follows the lantern at every step of the cascade',()=>{
 const sizes=[];let diameter=160;
 const tried=[];
 const docOptions={optional:['clientHeight','scrollHeight','clientWidth','style'],
  metrics:(target,name)=>{
   if(classes(target).includes('explorer-sheet-lantern')&&name==='clientWidth'){const fit=raw(raw(raw(target.parentElement).parentElement)).dataset.fit;diameter=fit==='tighter'?128:164.7;sizes.push([fit,diameter]);return diameter;}
   if(!classes(target).includes('explorer-campus-body'))return undefined;
   if(name==='clientHeight')return 482;
   if(name==='scrollHeight'){const fit=raw(target.children[0]).dataset.fit;tried.push(fit);return fit==='tighter'?470:500;}
   return undefined;
  }};
 const {handle,art}=mount('paris',{language:'ar',docOptions});
 assert.deepEqual(tried,['full','snug','tight','tighter']);
 assert.deepEqual(sizes.map(item=>item[0]),['full','snug','tight','tighter']);
 const fitted=art.fitLogo(PRINTS.paris,.76*128,.36*128);
 assert.equal(raw(handle.logo).styles.get('width'),fitted.width+'px');assert.equal(raw(handle.logo).styles.get('height'),fitted.height+'px');
});

test('destroy closes the viewer, disconnects the observer, removes the listeners and the sheet',async()=>{
 let closed=0;
 const fixture=cascadeFixture({heights:{full:497}});
 const opened=mount('paris',{onOpenMedia:()=>({close(){closed++;}})});
 click(byClass(opened.root,'explorer-sheet-photo-open')[0]);opened.handle.destroy();
 assert.equal(closed,1);assert.equal(raw(opened.body).children.length,0);
 const listeners=()=>fixture.media.lists.reduce((sum,list)=>sum+list.listeners.size,0);
 assert.equal(listeners(),2);
 fixture.handle.destroy();
 assert.equal(listeners(),0);assert.equal(fixture.observers[0].disconnected,true);assert.equal(raw(fixture.body).children.length,0);
 fixture.handle.destroy();
});

test('accessibility: nothing focusable under aria-hidden content unless inert, lang and dir on the root',()=>{
 for(const [id,language] of [['paris','fr'],['paris','ar'],['mulhouse','en'],['lyon','ar']]){
  const {root}=mount(id,{language,now:'2026-10-08T12:00:00Z'});
  assert.equal(prop(root,'lang'),language);assert.equal(prop(root,'dir'),language==='ar'?'rtl':'ltr');
  const focusable=item=>item.tagName==='button'||(item.tagName==='a'&&item.props.href)||Number(item.attributes.get('tabindex'))>=0;
  const visit=(item,hidden,inert)=>{
   const isHidden=hidden||item.attributes.get('aria-hidden')==='true',isInert=inert||item.props.inert===true;
   if(isHidden&&!isInert)assert.ok(!focusable(item),'focusable inside aria-hidden content: '+classes(item).join('.'));
   for(const child of item.children)visit(raw(child),isHidden,isInert);
  };
  visit(raw(root),false,false);
  // Exactly one h2, the photo pager's status and the copy status are live regions.
  assert.equal(byTag(root,'h2').length,1);
 }
});

// ---- static checks on the module and its stylesheet ----
const css=read('./explorer-campus.css').replace(/\/\*[^]*?\*\//g,'');
const source=read('./explorer-campus.mjs');
const selectorsOf=text=>{
 const rules=[];
 for(const match of text.matchAll(/(?<=^|[{}])\s*([^{}@\s][^{}]*)\{[^{}]*\}/g)){
  let depth=0,current='';
  for(const char of match[1]){if(char==='('||char==='[')depth++;if(char===')'||char===']')depth--;if(char===','&&!depth){rules.push(current.trim());current='';}else current+=char;}
  rules.push(current.trim());
 }
 return rules;
};
test('CSS: every rule under .explorer-sheet (or the density prefix), no width media query, 24 px Source targets',()=>{
 const selectors=selectorsOf(css);
 assert.ok(selectors.length>100);
 const scoped=/^(?:\.explorer-sheet(?![\w-])|section\.explorer-campus(?:\[data-density=\w+\]|:is\(\[data-density=\w+\](?:,\[data-density=\w+\])*\))\s+\.explorer-sheet(?![\w-]))/;
 for(const selector of selectors)assert.match(selector,scoped,selector);
 assert.doesNotMatch(css,/@media[^{]*(?:min|max)-(?:width|height)/);
 assert.doesNotMatch(css,/\.explorer-(?!sheet|campus\[|campus:is)[\w-]+/,'no class of another builder');
 const block=selector=>{const index=css.indexOf(selector+'{');assert.ok(index>=0,selector);return css.slice(index,css.indexOf('}',index));};
 assert.match(block('.explorer-sheet a.explorer-sheet-source'),/display:inline-block;min-block-size:24px/);
 assert.match(block('.explorer-sheet p.explorer-sheet-source > a'),/display:inline-block;min-block-size:24px/);
 assert.match(block('.explorer-sheet .explorer-sheet-title:focus'),/outline:none/);
 // A fact's value never wraps (« novembre 2021 »); only its label line may.
 assert.match(block('.explorer-sheet .explorer-sheet-fact dd'),/white-space:nowrap;unicode-bidi:isolate/);
 // Paragraphs are spaced by padding: a margin reset of the frame's p elements cannot move them.
 const paragraphs=['explorer-sheet-country','explorer-sheet-note','explorer-sheet-verified','explorer-sheet-credit','explorer-sheet-status','explorer-sheet-dates','explorer-sheet-missing','explorer-sheet-piscine-name','explorer-sheet-piscine-dates','p.explorer-sheet-source'];
 for(const match of css.matchAll(/(?<=^|[{}])\s*([^{}@\s][^{}]*)\{([^{}]*)\}/g)){
  const targets=match[1].split(',').map(selector=>selector.trim().split(/[\s>+~]+/).pop());
  if(targets.some(target=>paragraphs.some(name=>new RegExp((name.startsWith('p.')?'^':'\\.')+name.replace('.','\\.')+'(?![\\w-])').test(target)&&!target.includes('::'))))assert.doesNotMatch(match[2],/(^|;)margin/,match[1]);
 }
 assert.doesNotMatch(css,/explorer-sheet-title:focus-visible/);
});
test('CSS fixes of 25 Oct: the photo bar above the prints, « · Source » unbroken, tiny prints capped, short wide heart',()=>{
 const block=selector=>{const index=css.indexOf(selector+'{');assert.ok(index>=0,selector);return css.slice(index,css.indexOf('}',index));};
 // Item 9: the bar is positioned above every print (CSS z-index 10 / 9 / 8, inline 10 − depth).
 assert.match(block('.explorer-sheet .explorer-sheet-photo-bar'),/position:relative;z-index:11;/);
 const prints=[...css.matchAll(/\.explorer-sheet-photo(?![\w-])[^{}]*\{[^{}]*?z-index:(\d+)/g)].map(match=>Number(match[1]));
 assert.deepEqual(prints,[10,9,8]);
 // Item 13: « · Source » never splits.
 assert.match(block('.explorer-sheet .explorer-sheet-credit-tail'),/white-space:nowrap/);
 // Item 10: tiny prints 160 px wide at most.
 assert.match(block('section.explorer-campus[data-density=tiny] .explorer-sheet[data-layout=single] .explorer-sheet-stack'),/inline-size:min\(calc\(100% - 14px\),160px\)/);
 // Item 11: the short wide heart (lantern 88 / 4, country line 1.4, facts 6, pill 10; Latin name 1.15 under Arabic).
 const short='section.explorer-campus[data-density=short] .explorer-sheet[data-layout=wide]';
 assert.match(block(short+' .explorer-sheet-lantern'),/--d:88px;margin-block-end:4px/);
 assert.match(block(short+' .explorer-sheet-country'),/line-height:1\.4/);
 assert.match(block(short+' .explorer-sheet-facts'),/margin-block-start:6px/);
 assert.match(block(short+' .explorer-sheet-cta'),/margin-block-start:10px/);
 assert.match(block(short+':lang(ar) .explorer-sheet-title[data-script=latin]'),/line-height:1\.15/);
 // Elsewhere the Arabic h2 keeps its 1.4 line, so the fit results of the normal band do not move.
 assert.match(block('.explorer-sheet:lang(ar) .explorer-sheet-title'),/line-height:1\.4/);
 assert.equal(css.match(/data-script=latin/g).length,1);
});
test('colours come from the tokens: no literal in the stylesheet or the module, no token defined here',()=>{
 const values=[...css.matchAll(/\{([^{}]*)\}/g)].flatMap(match=>match[1].split(';')).map(declaration=>declaration.slice(declaration.indexOf(':')+1).replace(/var\(--[\w-]+(?:,[^()]*)?\)|--[\w-]+/g,''));
 const forced=css.slice(css.indexOf('@media (forced-colors: active)'));
 for(const value of values){
  assert.doesNotMatch(value,/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i,value);
  assert.doesNotMatch(value,/\b(?:white|black|red|green|blue|gray|grey|pink|teal|navy|silver|orange|purple)\b/i,value);
 }
 for(const system of ['ButtonText','Canvas','CanvasText','Highlight','GrayText'])assert.equal(css.split(system).length-1,(forced.split(system).length-1),system+' only in forced colours');
 assert.doesNotMatch(css,/--hx-[\w-]+\s*:/,'tokens are defined by explorer-art.css only');
 assert.match(css,/var\(--control-glass-surface\)/);
 assert.doesNotMatch(source,/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
 assert.doesNotMatch(source,/innerHTML|insertAdjacentHTML|outerHTML/);
 assert.doesNotMatch(source,/import[^;]*explorer-art|import[^;]*explorer-shapes|studies\//);
 assert.match(source,/^import \{resolveCampusWebsite\} from '\.\/campus-website\.mjs\?v=1';$/m);
 assert.match(source,/^import \{openMediaViewer\} from '\.\/media-viewer\.mjs\?v=1';$/m);
});
// No halo (25 Oct 2026): nothing is drawn behind or around the heart's logo, in any layout, fit step or mode; Codam's
// white plate belongs to its print (explorer-art.css) and stays.
test('CSS: no glow around the heart logo: no lantern pseudo-element, no glow token, the lantern paints nothing',()=>{
 assert.doesNotMatch(css,/explorer-sheet-lantern::/,'no ::before / ::after on the lantern');
 assert.doesNotMatch(css,/--hx-(?:glow|cursor-glow|logo-glow)\b/,'no glow token');
 const lanterns=[...css.matchAll(/([^{}]*explorer-sheet-lantern[^{}]*)\{([^{}]*)\}/g)].filter(match=>/\.explorer-sheet-lantern(?:::?[\w-]+)?$/.test(match[1].split(',').at(-1).trim()));
 assert.ok(lanterns.length>=6,'the lantern rules of every layout');
 for(const [,selector,body]of lanterns)assert.doesNotMatch(body,/(^|;)\s*(background|box-shadow|filter|backdrop-filter)\s*:/,selector.trim());
});

// ---- contract with the real art module and data (skipped while their producers' work is missing, §8) ----
const artModule=await import('./explorer-art.mjs').catch(()=>null);
const artReady=typeof artModule?.fitLogo==='function'&&typeof artModule?.ensureArtDefs==='function';
const shapesModule=await import('./explorer-shapes.mjs').catch(()=>null);
const shapesReady=Boolean(shapesModule?.SHAPES?.world?.sphere);
const logos=JSON.parse(read('./campus-logos.json')).campuses;
const printsReady=Boolean(logos.paris?.print&&logos.codam?.print);
// A looser document for A2's module, which is not bound by B's DOM contract.
function richDocument(){
 const doc=fakeDocument({optional:[...OPTIONAL]});
 return doc;
}
test('contract: the real art module draws the heart logo and the Lyon locator',{skip:!artReady&&'explorer-art.mjs does not export fitLogo and ensureArtDefs yet (A2)'},()=>{
 const art={...artModule,shapes:shapesModule?.SHAPES||null,flagHref:()=>'assets/flags/fr.svg',logo:id=>logos[id]?.print||null};
 const print=printsReady?logos.paris.print:PRINTS.paris;
 const doc=richDocument(),{body}=frame(doc);
 const handle=mountExplorerCampus({container:body,campus:{...enriched('paris'),logo:{print}},country:country('fr'),locale:'fr',headingId:'h',art,now:new Date('2026-10-24T12:00:00Z')});
 assert.ok(handle.logo,'createPrintedLogo returned the heart logo');assert.ok(handle.lantern);
 const expected=artModule.fitLogo(print,.76*160,.36*160);
 assert.ok(expected.height<=.36*160+1e-9&&expected.width<=.76*160+1e-9);
 const lyonShape=shapesModule?.SHAPES?.countries?.FRA||FRA_SHAPE;
 const lyon=mountExplorerCampus({container:frame(doc).body,campus:enriched('lyon'),country:country('fr',{shape:lyonShape}),locale:'fr',headingId:'l',art});
 const svg=byClass(lyon.element,'hx-art')[0];
 assert.ok(svg,'the locator silhouette');assert.equal(svg.attributes.get('data-variant'),'locator');
 assert.ok(byClass(lyon.element,'hx-icon').length>0,'icons from the art module');
});
test('contract: the regenerated shapes give France the Lyon pin',{skip:!shapesReady&&'SHAPES.world.sphere is missing (A1 has not regenerated explorer-shapes.mjs yet)'},()=>{
 assert.ok(shapesModule.SHAPES.countries.FRA.pins.lyon);
});
test('contract: the manifest prints feed the heart (mask) and Codam (sticker)',{skip:!printsReady&&'campus-logos.json has no print field yet (A1)'},()=>{
 assert.equal(logos.paris.print.kind,'mask');assert.equal(logos.codam.print.kind,'sticker');
 const {handle,art}=mount('codam',{campus:{...enriched('codam'),logo:logos.codam}});
 assert.equal(raw(handle.logo).tagName,'img');assert.equal(art.calls.find(call=>call[0]==='createPrintedLogo')[1].print,logos.codam.print);
});
