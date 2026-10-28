import {validProjectFilters,validStatusFilters} from './content-filters.mjs?v=2';
// Dates belong to the fictional editorial samples, not real campus publications.
export const samplePublicationDates = Object.freeze({
 'minishell-under-the-prompt':'2026-10-03',
 'raycast-find-the-light':'2026-09-28',
 'network-messages-between-us':'2026-09-21',
 'garden-small-useful-tools':'2026-09-15',
 'path-learning-to-ask':'2026-10-02',
 'path-making-room-to-learn':'2026-09-18',
 'journal-an-evening-debugging':'2026-10-01',
 'journal-share-the-unfinished':'2026-09-24',
});
export const CONTENT_PREFERENCES_KEY='horizon-content-preferences-v1';
const sorts=new Set(['newest','oldest','favorites']);
const views=new Set(['grid','list']);
const projects=new Set(validProjectFilters),statuses=new Set(validStatusFilters);
function selectedValues(value,allowed){
 const values=Array.isArray(value)?value:[value];
 return values.includes('all')?[]:[...new Set(values.filter(item=>item!=='all'&&allowed.has(item)))];
}
export function createContentPreferences({storage,validIds=[],idAliases={}}={}){
 const allowed=new Set(validIds);
 let state={view:'grid',sort:'newest',project:[],status:[],favoritesOnly:false,favorites:[]};
 const getStorage=()=>typeof storage==='function'?storage():storage;
 function restore(){
  try{
   const persisted=JSON.parse(getStorage()?.getItem(CONTENT_PREFERENCES_KEY)||'null');
   const legacyView=getStorage()?.getItem('horizon-content-view');
   state={
    view:views.has(persisted?.view)?persisted.view:views.has(legacyView)?legacyView:'grid',
    sort:sorts.has(persisted?.sort)?persisted.sort:'newest',
    project:selectedValues(persisted?.project,projects),
    status:selectedValues(persisted?.status,statuses),
    favoritesOnly:persisted?.favoritesOnly===true,
    favorites:[...new Set(Array.isArray(persisted?.favorites)?persisted.favorites.filter(id=>typeof id==='string').map(id=>Object.hasOwn(idAliases,id)?idAliases[id]:id).filter(id=>allowed.has(id)):[])],
   };
  }catch{}
  return snapshot();
 }
 function snapshot(){return {...state,project:[...state.project],status:[...state.status],favorites:[...state.favorites]};}
 function persist(){
  try{
   getStorage()?.setItem(CONTENT_PREFERENCES_KEY,JSON.stringify({version:1,...state}));
   getStorage()?.setItem('horizon-content-view',state.view);
  }catch{}
 }
 function setPreference(name,value){
  if(name==='view'&&views.has(value)||name==='sort'&&sorts.has(value)||name==='favoritesOnly'&&typeof value==='boolean'||(name==='project'||name==='status')&&(Array.isArray(value)||typeof value==='string')){
   state[name]=name==='project'?selectedValues(value,projects):name==='status'?selectedValues(value,statuses):value;persist();
  }
  return snapshot();
 }
 function isFavorite(id){return state.favorites.includes(id);}
 function toggleFavorite(id){
  if(!allowed.has(id))return false;
  state.favorites=isFavorite(id)?state.favorites.filter(item=>item!==id):[...state.favorites,id];
  persist();return isFavorite(id);
 }
 restore();
 return {snapshot,restore,setPreference,isFavorite,toggleFavorite};
}
export function publishedAt(entry){return entry.publishedAt||samplePublicationDates[entry.id]||null;}
export function sortContentEntries(entries,{sort='newest',favorites=[],favoritesOnly=false}={}){
 const saved=new Set(favorites);
 const time=entry=>{const date=publishedAt(entry);const value=date?Date.parse(date):NaN;return Number.isFinite(value)?value:null;};
 return entries.map((entry,index)=>({entry,index})).filter(({entry})=>!favoritesOnly||saved.has(entry.id)).sort((a,b)=>{
  // This prototype has one local user, hence a truthful favorite count of 0/1.
  if(sort==='favorites'){const delta=Number(saved.has(b.entry.id))-Number(saved.has(a.entry.id));if(delta)return delta;}
  const left=time(a.entry),right=time(b.entry);
  if(left===null||right===null){if(left!==right)return left===null?1:-1;}
  else if(left!==right)return sort==='oldest'?left-right:right-left;
  return a.index-b.index;
 }).map(({entry})=>entry);
}
