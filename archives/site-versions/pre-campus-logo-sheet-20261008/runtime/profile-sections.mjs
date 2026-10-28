import {validProjectFilters} from './content-filters.mjs?v=6';

export const profileSections=Object.freeze(['overview','projects','journey','contribution']);
export function normalizeProfileSection(value,{legacy=false}={}){
 const section=value==='journal'?'contribution':value;
 return profileSections.includes(section)?section:legacy?'journey':'overview';
}
export function normalizeProfileProjectFilters(value=[]){
 const values=Array.isArray(value)?value:String(value||'').split(',');
 if(values.includes('all'))return [];
 return [...new Set(values)].filter(item=>validProjectFilters.includes(item)&&item!=='all');
}
// Section history belongs to a single profile visit. The visible Back control
// leaves that visit; browser Back still retraces each selected section.
export function profileBackDistance(state){
 if(!state?.fromList&&!state?.fromDetail)return 0;
 const depth=Number.isSafeInteger(state?.profileDepth)&&state.profileDepth>=0?state.profileDepth:0;
 return depth+1;
}
