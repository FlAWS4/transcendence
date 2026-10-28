const contentTypes={projects:'project',people:'people',journal:'journal'};
const languageOf=locale=>['fr','en','ar'].includes(String(locale).toLowerCase().split(/[-_]/)[0])?String(locale).toLowerCase().split(/[-_]/)[0]:'fr';
const localized=(value,locale)=>typeof value==='string'?value:value?.[locale]||value?.fr||value?.en||value?.ar||'';

/** Accent/harakat insensitive, while preserving technical terms such as C++. */
export function normalizeDockSearch(value,locale='fr'){
 return String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').replace(/\u0640/gu,'')
  .replace(/[’‘]/gu,"'").replace(/[‐‑‒–—]/gu,'-').toLocaleLowerCase(languageOf(locale)).trim().replace(/\s+/gu,' ');
}

/**
 * Search the supplied public corpus, across all sections and geographic scopes.
 * No catalogue is loaded here: the caller controls which records are visible.
 * Results are safe data descriptors, not HTML or navigation side effects.
 */
export function searchDockData({query='',locale='fr',campuses=[],countries=[],entries=[],limit=8,offset=0}={}){
 const language=languageOf(locale),normalize=value=>normalizeDockSearch(value,language),text=normalize(query);
 if(!text)return {results:[],total:0,hasMore:false};
 const maximum=Number.isFinite(limit)?Math.max(0,Math.min(20,Math.trunc(limit))):8;
 const start=Number.isFinite(offset)?Math.max(0,Math.trunc(offset)):0;
 const terms=text.split(' '),regions=new Intl.DisplayNames(language,{type:'region'});
 const countryById=new Map(countries.map(country=>[country.id,country]));
 const campusById=new Map(campuses.map(campus=>[campus.id,campus]));
 const countryName=id=>{
  const country=countryById.get(id);if(!country)return id||'';
  try{return country.iso2?regions.of(country.iso2)||country.name:country.name;}
  catch{return country.name||id||'';}
 };
 // A complete geographic name expresses a relationship, not an address/body match.
 // Derive aliases only from the supplied IDs and official campus names.
 const matchingCampuses=campuses.filter(campus=>{
  const name=normalize(campus.name);
  return [normalize(campus.id),name,name.replace(/^42\s+/u,''),name.replace(/^42\s+/u,'42')].includes(text);
 });
 const matchingCountries=new Set(countries.filter(country=>
  [country.id,country.iso2,country.name,countryName(country.id)].some(value=>normalize(value)===text)).map(country=>country.id));
 const geographicCampusIds=matchingCampuses.length?new Set(matchingCampuses.map(campus=>campus.id))
  :matchingCountries.size?new Set(campuses.filter(campus=>matchingCountries.has(campus.country)).map(campus=>campus.id)):null;
 const ranked=[];
 function add(result,{identity=[],context=[],body=[]}){
  if(geographicCampusIds){
   if(geographicCampusIds.has(result.campusId))ranked.push({result,score:result.type==='campus'?1000:500,order:ranked.length});
   return;
  }
  const title=normalize(result.title),identities=identity.map(normalize),contexts=context.map(normalize),bodies=body.map(normalize);
  const groups=[[8,[title]],[6,identities],[3,contexts],[1,bodies]];
  let score=title===text?1000:title.startsWith(text)?900:title.includes(text)?800:0;
  for(const term of terms){
   const matching=groups.find(([,values])=>values.some(value=>value.includes(term)));
   if(!matching)return;
   score+=matching[0];
   if(identities.some(value=>value===term))score+=12;
  }
  ranked.push({result,score,order:ranked.length});
 }
 for(const campus of campuses){
  const country=countryName(campus.country);
  add({id:campus.id,type:'campus',title:campus.name,subtitle:country,section:'explore',entryId:null,campusId:campus.id,countryId:campus.country},
   {identity:[campus.id],context:[country,countryById.get(campus.country)?.name,campus.country],body:[campus.address]});
 }
 for(const entry of entries){
  if(!contentTypes[entry.section])continue;
  const campus=campusById.get(entry.campus),country=campus?countryName(campus.country):'';
  const title=localized(entry.title,language),summary=localized(entry.summary,language),eyebrow=localized(entry.eyebrow,language);
  add({id:entry.id,type:contentTypes[entry.section],title,subtitle:[campus?.name,eyebrow].filter(Boolean).join(' · '),section:entry.section,
   entryId:entry.id,campusId:entry.campus,countryId:campus?.country||null},
   {identity:[entry.id,...(entry.tags||[])],context:[campus?.name,country,countryById.get(campus?.country)?.name,eyebrow,summary],
    body:(entry.body||[]).flatMap(part=>[localized(part.heading,language),localized(part.text,language)])});
 }
 ranked.sort((a,b)=>b.score-a.score||a.order-b.order);
 const total=ranked.length,results=ranked.slice(start,start+maximum).map(item=>item.result);
 return {results,total,hasMore:start+results.length<total};
}
