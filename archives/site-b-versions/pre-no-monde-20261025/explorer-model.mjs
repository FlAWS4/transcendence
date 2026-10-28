import {CONTINENTS,WORLD_NAMES,continentIds,continentOfCountry,continentName} from './continents.mjs?v=b1';

// Card counts. French stays invariable; English and Arabic follow Intl.PluralRules,
// and a category without its own form uses "other". Digits stay Latin, as in A's hint.
const COUNT_FORMS={
 fr:{campuses:{other:'{n} campus'},countries:{other:'{n} pays'}},
 en:{campuses:{one:'{n} campus',other:'{n} campuses'},countries:{one:'{n} country',other:'{n} countries'}},
 ar:{campuses:{zero:'{n} فرع',one:'فرع واحد',two:'فرعان',few:'{n} فروع',many:'{n} فرعًا',other:'{n} فرع'},
  countries:{zero:'{n} دولة',one:'دولة واحدة',two:'دولتان',few:'{n} دول',many:'{n} دولة',other:'{n} دولة'}},
};
const languageOf=locale=>Object.hasOwn(COUNT_FORMS,locale)?locale:'fr';
const formatters=new Map();
function formattersOf(language){
 if(!formatters.has(language))formatters.set(language,{number:new Intl.NumberFormat(language,{numberingSystem:'latn'}),plural:new Intl.PluralRules(language)});
 return formatters.get(language);
}

/** '58 campus · 30 pays'; a count left undefined is left out ('8 فروع' for a country). */
export function countLabel({campuses,countries}={},locale){
 const language=languageOf(locale),{number,plural}=formattersOf(language);
 return [['campuses',campuses],['countries',countries]].filter(([,count])=>count!=null).map(([kind,count])=>{
  const forms=COUNT_FORMS[language][kind];
  return (forms[plural.select(count)]??forms.other).replace('{n}',number.format(count));
 }).join(' · ');
}

/**
 * One level of the Explorer selector, derived from the filter alone (spec §5).
 * `list` only matters at World; `cursorId` is kept when it names an item, else the first item.
 * scope.level sets the deepest level; an unknown id falls back to its nearest valid ancestor.
 */
export function buildExplorerView({scope,list,catalog,locale,countryName,cursorId}={}){
 const language=languageOf(locale),collator=new Intl.Collator(language),byName=(a,b)=>collator.compare(a.name,b.name);
 const countries=catalog?.countries||[],campuses=catalog?.campuses||[];
 const countryById=new Map(countries.map(country=>[country.id,country])),campusById=new Map(campuses.map(campus=>[campus.id,campus]));
 const nameOfCountry=id=>countryName?.(id)||countryById.get(id)?.name||id;
 const campusesOf=id=>campuses.filter(campus=>campus.country===id);
 const item=(kind,id,name,counts,countText=countLabel(counts,language))=>({kind,id,name,...counts,countText,ariaLabel:`${name} · ${countText}`});
 const countryItem=({id})=>item('country',id,nameOfCountry(id),{campuses:campusesOf(id).length});
 const view=(key,level,depth,parent,items,extra)=>({key,level,depth,parent,step:depth<4?{index:depth,total:3}:null,items,
  cursorId:items.some(entry=>entry.id===cursorId)?cursorId:items[0]?.id??null,...extra});
 const world={kind:'world',id:'world',name:WORLD_NAMES[language]};
 const rank=Math.max(0,['world','continent','country','campus'].indexOf(scope?.level));
 const campus=rank>2?campusById.get(scope.campus):undefined;
 const country=campus?campus.country:rank>1&&countryById.has(scope.country)?scope.country:null;
 const continent=!country&&rank>0&&continentIds.has(scope.continent)?scope.continent:null;
 const parentCountry=()=>({kind:'country',id:country,name:nameOfCountry(country)});
 if(campus)return view(`campus:${campus.id}`,'campus',4,parentCountry(),[],{campus,siblings:campusesOf(country).map(({id,name})=>({id,name})).sort(byName)});
 if(country)return view(`campuses:${country}`,'campuses',3,parentCountry(),campusesOf(country).map(place=>item('campus',place.id,place.name,{},nameOfCountry(country))).sort(byName));
 if(continent)return view(`countries:${continent}`,'countries',2,{kind:'continent',id:continent,name:continentName(continent,language)},countries.filter(place=>continentOfCountry(place.id)===continent).map(countryItem).sort(byName));
 if(list==='countries')return view('countries:world','countries',2,world,countries.map(countryItem).sort(byName));
 return view('continents','continents',1,null,[
  item('world','world',world.name,{campuses:campuses.length,countries:countries.length}),
  ...CONTINENTS.map(({id})=>item('continent',id,continentName(id,language),{
   campuses:campuses.filter(place=>continentOfCountry(place.country)===id).length,
   countries:countries.filter(place=>continentOfCountry(place.id)===id).length,
  })).sort(byName),
 ]);
}
