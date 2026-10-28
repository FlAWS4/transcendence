// UN M49 regions = the 42 network catalogue's regionId 2-5. Turkey follows M49 (Asia) although the 42 network
// lists 42 Istanbul under Europe. No campus in Oceania.
// Checked on 2026-10-24: the 30 countries of campuses.json match Natural Earth 5.1.1 REGION_UN, and 57 of the 58
// campuses match the regionId of the live 42 catalogue (the exception is 42 Istanbul). campuses.json has no region.
const frozen=({names,countries,...continent})=>Object.freeze({...continent,names:Object.freeze(names),countries:Object.freeze(countries)});
export const CONTINENTS=Object.freeze([
 {id:'africa',  m49:'002', names:{fr:'Afrique',  en:'Africa',  ar:'أفريقيا'},   countries:['AGO','MAR','MDG']},
 {id:'americas',m49:'019', names:{fr:'Amériques',en:'Americas',ar:'الأمريكتان'},countries:['BRA','CAN']},
 {id:'asia',    m49:'142', names:{fr:'Asie',     en:'Asia',    ar:'آسيا'},     countries:['ARE','ARM','JOR','JPN','KOR','LBN','MYS','PSE','SGP','THA','TUR']},
 {id:'europe',  m49:'150', names:{fr:'Europe',   en:'Europe',  ar:'أوروبا'},   countries:['ALB','AUT','BEL','CHE','CZE','DEU','ESP','FRA','GBR','ITA','LUX','NLD','POL','PRT']},
].map(frozen));
export const WORLD_NAMES=Object.freeze({fr:'Monde',en:'World',ar:'العالم'}); // = welcome.mjs breadcrumbWorld
export const continentIds=new Set(CONTINENTS.map(continent=>continent.id));
const continentById=new Map(CONTINENTS.map(continent=>[continent.id,continent]));
const continentByCountry=new Map(CONTINENTS.flatMap(continent=>continent.countries.map(country=>[country,continent.id])));

/** ISO 3166-1 alpha-3 code → continent id, or null outside the mapping. */
export function continentOfCountry(iso3){return continentByCountry.get(iso3)??null;}

/** Explicit names: Intl region names differ between engines. French when the language has no name. */
export function continentName(id,locale){
 const names=continentById.get(id)?.names;
 return names?Object.hasOwn(names,locale)?names[locale]:names.fr:null;
}

// Like a country, a continent contains the union of its campuses: true when any of the
// given campus ids lies in one of its countries. Unknown continents and campuses match nothing.
export function matchesContinent(campusIds,continent,campusById){
 const countries=continentById.get(continent)?.countries;
 return Boolean(countries)&&(campusIds||[]).some(id=>countries.includes(campusById?.get(id)?.country));
}
