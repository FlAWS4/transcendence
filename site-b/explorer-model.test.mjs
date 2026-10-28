import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildExplorerView,countLabel} from './explorer-model.mjs';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const network=read('./campuses.json'),[websites,websiteLocales,profiles]=['./campus-websites.json','./campus-website-locales.json','./campus-profiles.json'].map(read);
// Enriched as the controller does it (spec §8.10): website, verified languages and profile, no location overrides.
const campuses=network.campuses.map(campus=>{
 const site=websites.campuses[campus.id];
 return {...campus,...(site?.kind==='campus-site'?{websiteUrl:site.url}:{}),websiteLocales:websiteLocales.campuses[campus.id],profile:profiles.campuses?.[campus.id]||{}};
});
const catalog={countries:network.countries,campuses},countryById=new Map(network.countries.map(country=>[country.id,country]));
// Country labels as in welcome.mjs: Intl region names on iso2, the catalogue's English name as fallback.
const countryNameFor=locale=>{const names=new Intl.DisplayNames(locale,{type:'region'});return id=>{const country=countryById.get(id);return country?names.of(country.iso2)||country.name:id;};};
const view=(scope,locale='fr',options={})=>buildExplorerView({scope,catalog,locale,countryName:countryNameFor(locale),...options});
const ids=items=>items.map(item=>item.id);
const campusCount=id=>campuses.filter(campus=>campus.country===id).length;
const EUROPE=['ALB','AUT','BEL','CHE','CZE','DEU','ESP','FRA','GBR','ITA','LUX','NLD','POL','PRT'];
const CONTINENT_IDS=['africa','americas','asia','europe'];

test('L1 in French: the four continents only, the cursor on the first (Monde removed, 25 Oct 2026)',()=>{
 assert.deepEqual(view({level:'world'},'fr'),{key:'continents',level:'continents',depth:1,parent:null,step:{index:1,total:3},cursorId:'africa',items:[
  {kind:'continent',id:'africa',name:'Afrique',campuses:6,countries:3,countText:'6 campus · 3 pays',ariaLabel:'Afrique · 6 campus · 3 pays'},
  {kind:'continent',id:'americas',name:'Amériques',campuses:4,countries:2,countText:'4 campus · 2 pays',ariaLabel:'Amériques · 4 campus · 2 pays'},
  {kind:'continent',id:'asia',name:'Asie',campuses:16,countries:11,countText:'16 campus · 11 pays',ariaLabel:'Asie · 16 campus · 11 pays'},
  {kind:'continent',id:'europe',name:'Europe',campuses:32,countries:14,countText:'32 campus · 14 pays',ariaLabel:'Europe · 32 campus · 14 pays'},
 ]});
});

test('Europe in Arabic: its 14 countries sorted on their Arabic names (spec §5, example 2)',()=>{
 const name=countryNameFor('ar'),forms={1:'فرع واحد',2:'فرعان',3:'3 فروع',4:'4 فروع',8:'8 فروع'},collator=new Intl.Collator('ar');
 const items=EUROPE.map(id=>({kind:'country',id,name:name(id),campuses:campusCount(id),countText:forms[campusCount(id)],ariaLabel:`${name(id)} · ${forms[campusCount(id)]}`}))
  .sort((a,b)=>collator.compare(a.name,b.name));
 const result=view({level:'continent',continent:'europe'},'ar');
 assert.deepEqual(result,{key:'countries:europe',level:'countries',depth:2,parent:{kind:'continent',id:'europe',name:'أوروبا'},step:{index:2,total:3},items,cursorId:items[0].id});
 assert.equal(result.items.length,14);assert.equal(result.cursorId,result.items[0].id);
 assert.deepEqual(result.items.find(item=>item.id==='FRA'),{kind:'country',id:'FRA',name:'فرنسا',campuses:8,countText:'8 فروع',ariaLabel:'فرنسا · 8 فروع'});
});

test('the campus screen of 42 Paris in English carries the enriched campus and its 8 siblings (spec §5, example 3)',()=>{
 const paris=campuses.find(campus=>campus.id==='paris'),result=view({level:'campus',country:'FRA',campus:'paris'},'en');
 assert.deepEqual(result,{key:'campus:paris',level:'campus',depth:4,parent:{kind:'country',id:'FRA',name:'France'},step:null,items:[],cursorId:null,campus:paris,siblings:[
  {id:'angouleme',name:'42 Angoulême'},{id:'le-havre',name:'42 Le Havre'},{id:'lyon',name:'42 Lyon'},{id:'marseille',name:'42 Marseille'},
  {id:'mulhouse',name:'42 Mulhouse'},{id:'nice',name:'42 Nice'},{id:'paris',name:'42 Paris'},{id:'perpignan',name:'42 Perpignan'},
 ]});
 assert.equal(result.campus,paris);assert.equal(result.campus.websiteUrl,'https://www.42.fr/');
 assert.equal(result.campus.profile.logo.src,'./assets/campuses/paris-logo-official.svg');
});

test('58 campuses in 30 countries reads exactly like A’s Explorer hint in French, English and Arabic',()=>{
 // The hint templates of the unchanged version A, filled the way A's message() fills them.
 const templates=[...readFileSync(new URL('../site/welcome.mjs',import.meta.url),'utf8').matchAll(/[^A-Za-z]hint:'([^']+)'/g)].map(match=>match[1]);
 assert.equal(templates.length,3);
 ['fr','en','ar'].forEach((locale,index)=>assert.equal(countLabel({campuses:58,countries:30},locale),templates[index].replace(/\{(\w+)\}/g,(_,name)=>String({campuses:58,countries:30}[name]))));
 assert.equal(countLabel({campuses:58,countries:30},'fr'),'58 campus · 30 pays');
 assert.equal(countLabel({campuses:58,countries:30},'en'),'58 campuses · 30 countries');
 assert.equal(countLabel({campuses:58,countries:30},'ar'),'58 فرعًا · 30 دولة');
});

test('plural forms: French invariable, English one/other, every Arabic category from zero to other',()=>{
 const cases={
  fr:[[0,'0 campus','0 pays'],[1,'1 campus','1 pays'],[2,'2 campus','2 pays'],[58,'58 campus','58 pays']],
  en:[[0,'0 campuses','0 countries'],[1,'1 campus','1 country'],[2,'2 campuses','2 countries'],[30,'30 campuses','30 countries']],
  ar:[[0,'0 فرع','0 دولة'],[1,'فرع واحد','دولة واحدة'],[2,'فرعان','دولتان'],[3,'3 فروع','3 دول'],[10,'10 فروع','10 دول'],[11,'11 فرعًا','11 دولة'],
   [58,'58 فرعًا','58 دولة'],[99,'99 فرعًا','99 دولة'],[100,'100 فرع','100 دولة'],[102,'102 فرع','102 دولة'],[103,'103 فروع','103 دول']],
 };
 const arabic=new Intl.PluralRules('ar');
 assert.deepEqual(new Set(cases.ar.map(([count])=>arabic.select(count))),new Set(['zero','one','two','few','many','other']));
 for(const [locale,rows] of Object.entries(cases))for(const [count,campusText,countryText] of rows){
  assert.equal(countLabel({campuses:count,countries:count},locale),`${campusText} · ${countryText}`,`${locale} ${count}`);
  assert.equal(countLabel({campuses:count},locale),campusText,`${locale} ${count}`);
 }
 // French has a form only for "other": its "one" and "many" categories use it too.
 const french=new Intl.PluralRules('fr');assert.deepEqual([french.select(1),french.select(1000000)],['one','many']);
 assert.equal(countLabel({campuses:1,countries:1000000},'fr'),`1 campus · ${new Intl.NumberFormat('fr',{numberingSystem:'latn'}).format(1000000)} pays`);
});

test('real counts read naturally, with Latin digits, and the countries part only when it is given',()=>{
 const l1=view({level:'world'},'ar').items,text=id=>l1.find(item=>item.id===id).countText;
 assert.deepEqual(CONTINENT_IDS.map(text),['6 فروع · 3 دول','4 فروع · دولتان','16 فرعًا · 11 دولة','32 فرعًا · 14 دولة']);
 assert.equal(view({level:'world'},'en').items.find(item=>item.id==='americas').countText,'4 campuses · 2 countries');
 assert.equal(view({level:'continent',continent:'europe'},'en').items.find(item=>item.id==='ALB').countText,'1 campus');
 assert.equal(countLabel({campuses:8},'ar'),'8 فروع');assert.equal(countLabel({campuses:8,countries:undefined},'en'),'8 campuses');
 assert.equal(countLabel({campuses:2,countries:1},'de'),'2 campus · 1 pays');
 const views=[view({level:'world'},'ar'),...CONTINENT_IDS.map(continent=>view({level:'continent',continent},'ar'))];
 for(const item of views.flatMap(result=>result.items))assert.doesNotMatch(item.countText,/[٠-٩۰-۹]/u,item.id);
});

test('continents, countries and campuses are sorted with the collator of the UI language',()=>{
 for(const locale of ['fr','en','ar']){
  const collator=new Intl.Collator(locale),sorted=items=>items.every((item,index)=>!index||collator.compare(items[index-1].name,item.name)<=0);
  const l1=view({level:'world'},locale).items;
  assert.ok(sorted(l1),locale);assert.equal(l1.length,4,locale);
  assert.deepEqual(new Set(ids(l1)),new Set(CONTINENT_IDS));
  const levels=[...CONTINENT_IDS.map(continent=>view({level:'continent',continent},locale)),
   ...network.countries.map(country=>view({level:'country',country:country.id},locale))];
  for(const result of levels)assert.ok(sorted(result.items),`${locale} ${result.key}`);
 }
 // The order really changes with the language: Allemagne is second in French, Germany sixth in English.
 assert.equal(ids(view({level:'continent',continent:'europe'},'fr').items).indexOf('DEU'),1);
 assert.equal(ids(view({level:'continent',continent:'europe'},'en').items).indexOf('DEU'),5);
 assert.deepEqual(ids(view({level:'world'},'fr').items),['africa','americas','asia','europe']);
 assert.deepEqual(ids(view({level:'world'},'en').items),['africa','americas','asia','europe']);
 assert.deepEqual(ids(view({level:'world'},'ar').items),['asia','africa','americas','europe'],'Intl.Collator(\'ar\') puts Asia first');
 assert.deepEqual(ids(view({level:'country',country:'FRA'},'fr').items),['angouleme','le-havre','lyon','marseille','mulhouse','nice','paris','perpignan']);
});

test('the cursor stays on a requested item, otherwise the first item, and there is none on the campus screen',()=>{
 // Ascending (§2.2): the controller passes the item that represents the previous view.
 assert.equal(view({level:'country',country:'FRA'},'fr',{cursorId:'paris'}).cursorId,'paris');
 assert.equal(view({level:'continent',continent:'europe'},'fr',{cursorId:'FRA'}).cursorId,'FRA');
 assert.equal(view({level:'world'},'fr',{cursorId:'europe'}).cursorId,'europe');
 // Descending, or a cursor that is not an item of this level (Monde is no longer one): the first item.
 assert.equal(view({level:'country',country:'FRA'},'fr').cursorId,'angouleme');
 assert.equal(view({level:'world'},'fr',{cursorId:'FRA'}).cursorId,'africa');
 assert.equal(view({level:'world'},'fr',{cursorId:'world'}).cursorId,'africa');
 assert.equal(view({level:'world'},'ar',{cursorId:'world'}).cursorId,'asia','the first continent of the locale’s order');
 const asia=view({level:'continent',continent:'asia'},'en',{cursorId:'FRA'});assert.equal(asia.cursorId,asia.items[0].id);
 assert.equal(view({level:'campus',country:'FRA',campus:'paris'},'fr',{cursorId:'paris'}).cursorId,null);
 // The same cursor survives a language change even though the order changes.
 for(const locale of ['fr','en','ar']){const result=view({level:'continent',continent:'europe'},locale,{cursorId:'ITA'});assert.equal(result.cursorId,'ITA');assert.ok(ids(result.items).includes('ITA'));}
});

test('no Monde item and no list of all 30 countries: a stale list option still gives the four continents',()=>{
 // Before 25 Oct 2026 the controller passed list 'countries' to open the Monde list; it no longer exists.
 for(const locale of ['fr','en','ar']){
  const l1=view({level:'world'},locale);
  for(const list of ['countries',undefined,null,'','continents','campuses'])assert.deepEqual(view({level:'world'},locale,{list}),l1,`${locale} ${String(list)}`);
  assert.equal(l1.key,'continents');assert.equal(l1.items.length,4);assert.ok(l1.items.every(item=>item.kind==='continent'),locale);
 }
 for(const scope of [{level:'continent',continent:'asia'},{level:'country',continent:'europe',country:'FRA'},{level:'campus',continent:'europe',country:'FRA',campus:'paris'}])
  assert.deepEqual(view(scope,'fr',{list:'countries'}),view(scope,'fr'),scope.level);
 // No level of any filter holds a world item or the old key.
 const scopes=[{level:'world'},...CONTINENT_IDS.map(continent=>({level:'continent',continent})),...network.countries.map(country=>({level:'country',country:country.id})),{level:'campus',campus:'paris'}];
 for(const scope of scopes){const result=view(scope,'fr',{list:'countries'});assert.notEqual(result.key,'countries:world');assert.ok(result.items.every(item=>item.kind!=='world'&&item.id!=='world'),result.key);}
});

test('every card carries the counts it announces, and validating it shows exactly that many cards',()=>{
 for(const locale of ['fr','en','ar']){
  const l1=view({level:'world'},locale);
  assert.deepEqual(Object.fromEntries(l1.items.map(({id,campuses:count,countries})=>[id,[count,countries]])),{africa:[6,3],americas:[4,2],asia:[16,11],europe:[32,14]});
  // The world filter (no continent validated) is the union of the four: 58 campuses in 30 countries.
  assert.equal(l1.items.reduce((total,card)=>total+card.campuses,0),58);assert.equal(l1.items.reduce((total,card)=>total+card.countries,0),30);
  for(const card of l1.items){
   assert.deepEqual(Object.keys(card),['kind','id','name','campuses','countries','countText','ariaLabel']);
   assert.equal(card.countText,countLabel({campuses:card.campuses,countries:card.countries},locale));
   const next=view({level:'continent',continent:card.id},locale);
   assert.equal(next.items.length,card.countries,card.id);assert.equal(next.items.reduce((total,item)=>total+item.campuses,0),card.campuses,card.id);
   for(const country of next.items){
    assert.deepEqual(Object.keys(country),['kind','id','name','campuses','countText','ariaLabel']);
    assert.equal(country.countText,countLabel({campuses:country.campuses},locale));assert.equal(country.name,countryNameFor(locale)(country.id));
    const l3=view({level:'country',country:country.id},locale);
    assert.equal(l3.items.length,country.campuses,country.id);assert.deepEqual(l3.parent,{kind:'country',id:country.id,name:country.name});
    for(const place of l3.items){
     assert.deepEqual(Object.keys(place),['kind','id','name','countText','ariaLabel']);
     assert.equal(place.kind,'campus');assert.equal(place.countText,country.name);assert.equal(place.name,campuses.find(campus=>campus.id===place.id).name);
    }
   }
  }
  for(const result of [l1,view({level:'continent',continent:'europe'},locale),view({level:'country',country:'MAR'},locale)])
   for(const card of result.items)assert.equal(card.ariaLabel,`${card.name} · ${card.countText}`);
 }
 assert.deepEqual(view({level:'country',country:'FRA'},'en').items[0],{kind:'campus',id:'angouleme',name:'42 Angoulême',countText:'France',ariaLabel:'42 Angoulême · France'});
});

test('a single-campus country still opens a one-card campus level, and its campus screen has only itself',()=>{
 const single=network.countries.map(country=>country.id).filter(id=>campusCount(id)===1);
 assert.equal(single.length,16);
 for(const id of single){
  const l3=view({level:'country',country:id},'fr');
  assert.equal(l3.key,`campuses:${id}`);assert.equal(l3.items.length,1);assert.equal(l3.cursorId,l3.items[0].id);assert.deepEqual(l3.step,{index:3,total:3});
 }
 const tirana=view({level:'campus',country:'ALB',campus:'tirana'},'fr');
 assert.equal(tirana.key,'campus:tirana');assert.deepEqual(tirana.siblings,[{id:'tirana',name:'42 Tirana'}]);
 assert.deepEqual(tirana.parent,{kind:'country',id:'ALB',name:'Albanie'});
});

test('levels and keys follow the filter; unknown ids fall back to their nearest valid ancestor',()=>{
 const key=(scope,options)=>view(scope,'fr',options).key;
 assert.equal(key({level:'continent',continent:'europe'}),'countries:europe');
 assert.equal(key({level:'country',continent:'europe',country:'FRA'}),'campuses:FRA');
 assert.equal(key({level:'campus',continent:'europe',country:'FRA',campus:'paris'}),'campus:paris');
 assert.equal(key({level:'campus',country:'JPN',campus:'paris'}),'campus:paris');
 assert.deepEqual(view({level:'campus',country:'JPN',campus:'paris'},'fr').parent,{kind:'country',id:'FRA',name:'France'});
 assert.equal(key({level:'campus',country:'FRA',campus:'nowhere'}),'campuses:FRA');
 assert.equal(key({level:'country',country:'ZZZ',continent:'asia'}),'countries:asia');
 for(const scope of [{level:'campus',campus:'nowhere'},{level:'country',country:'ZZZ'},{level:'continent',continent:'oceania'},{level:'world',continent:'europe',country:'FRA',campus:'paris'},{level:'mars'},{},null,undefined])
  assert.equal(key(scope),'continents',JSON.stringify(scope));
 assert.equal(key({level:'continent',continent:'oceania'},{list:'countries'}),'continents');
 const levels=[[{level:'world'},'continents',1],[{level:'continent',continent:'asia'},'countries',2],[{level:'country',country:'TUR'},'campuses',3],[{level:'campus',campus:'kocaeli'},'campus',4]];
 for(const [scope,level,depth] of levels){const result=view(scope,'en');assert.equal(result.level,level);assert.equal(result.depth,depth);assert.deepEqual(result.step,depth<4?{index:depth,total:3}:null);}
 assert.deepEqual(view({level:'country',country:'TUR'},'en').parent,{kind:'country',id:'TUR',name:countryNameFor('en')('TUR')});
});

test('the model is pure: inputs are left untouched and a missing catalogue or label function degrades gracefully',()=>{
 const before=structuredClone(catalog);
 for(const locale of ['fr','en','ar'])for(const scope of [{level:'world'},{level:'continent',continent:'europe'},{level:'country',country:'FRA'},{level:'campus',campus:'paris'}])view(scope,locale);
 assert.deepEqual(catalog,before);
 const bare=buildExplorerView({scope:{level:'country',country:'NLD'},catalog,locale:'en'});
 assert.deepEqual(bare.parent,{kind:'country',id:'NLD',name:'The Netherlands'});assert.equal(bare.items[0].countText,'The Netherlands');
 const empty=buildExplorerView({scope:{level:'world'},locale:'fr'});
 assert.deepEqual(empty.items.map(item=>item.countText),['0 campus · 0 pays','0 campus · 0 pays','0 campus · 0 pays','0 campus · 0 pays']);
 assert.equal(buildExplorerView().key,'continents');
});
