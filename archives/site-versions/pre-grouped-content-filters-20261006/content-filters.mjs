// Category filters only describe records already present in the demo corpus.
// Listing so_long or Born2beroot does not invent matching projects.
export const validProjectFilters=Object.freeze(['all','minishell','cub3d','so_long','born2beroot','ft_irc','personal']);
export const validStatusFilters=Object.freeze(['all','student','transcender','alumni']);
const projectKinds=Object.freeze({
 'minishell-under-the-prompt':'minishell',
 'raycast-find-the-light':'cub3d',
 'network-messages-between-us':'ft_irc',
 'garden-small-useful-tools':'personal',
});
const copy={
 fr:{allProjects:'Tous les projets',personal:'Projet personnel',allProfiles:'Tous les profils',student:'Étudiants',transcender:'Transcender',alumni:'Alumni'},
 en:{allProjects:'All projects',personal:'Personal project',allProfiles:'All profiles',student:'Students',transcender:'Transcender',alumni:'Alumni'},
 ar:{allProjects:'جميع المشاريع',personal:'مشروع شخصي',allProfiles:'جميع الملفات الشخصية',student:'الطلاب',transcender:'ترانسيندر',alumni:'الخريجون'},
};
const languageOf=locale=>String(locale||'fr').toLowerCase().split(/[-_]/)[0];
const words=locale=>copy[languageOf(locale)]||copy.fr;

export function projectFilterOptions(locale='fr'){
 const text=words(locale);
 return validProjectFilters.map(value=>({value,label:value==='all'?text.allProjects:value==='personal'?text.personal:value==='born2beroot'?'Born2beroot':value}));
}

export function statusFilterOptions(locale='fr'){
 const text=words(locale);
 return validStatusFilters.map(value=>({value,label:value==='all'?text.allProfiles:text[value]}));
}

// Empty sets mean all. A saved single choice remains valid after switching to
// multiple selection. Unknown values never hide an otherwise valid selection.
function selectedValues(value,allowed){
 const values=Array.isArray(value)?value:[value];
 if(values.includes('all'))return new Set();
 return new Set(values.filter(item=>allowed.includes(item)&&item!=='all'));
}

/**
 * Accept a mixed corpus or an already scoped list. Multiple selected categories
 * form a union within the active section; [] and 'all' retain the whole section.
 * Journal entries never inherit project/profile selections. Geography, favorites
 * and sort remain composable filters owned by the caller.
 * Transcender means common core completed, with specialisation still in progress.
 */
export function applyContentCategory(entries=[],{section,project=[],status=[]}={}){
 const scoped=section?entries.filter(entry=>entry.section===section):[...entries];
 if(section==='projects'){
  const selected=selectedValues(project,validProjectFilters);
  if(selected.size)return scoped.filter(entry=>Object.hasOwn(projectKinds,entry.id)&&selected.has(projectKinds[entry.id]));
 }
 if(section==='people'){
  const selected=selectedValues(status,validStatusFilters);
  if(selected.size)return scoped.filter(entry=>selected.has(entry.status));
 }
 return scoped;
}
