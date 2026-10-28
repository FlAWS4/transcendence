// Category filters only describe records already present in the demo corpus.
// Available project types can honestly return no matching demonstration record.
export const validProjectFilters=Object.freeze(['all','libft','minishell','cub3d','so_long','born2beroot','ft_irc','ft_transcendence','ft_linear_regression','personal']);
const technologyNames=Object.freeze({c:'C',cpp:'C++',typescript:'TypeScript',css:'CSS',posix:'POSIX',sockets:'Sockets'});
const skillNames=Object.freeze({
 parsing:{fr:'Analyse syntaxique',en:'Parsing',ar:'التحليل النحوي'},
 raycasting:{fr:'Raycasting',en:'Raycasting',ar:'إلقاء الأشعة'},
 textures:{fr:'Textures',en:'Textures',ar:'إكساء السطوح'},
 irc:{fr:'IRC',en:'IRC',ar:'IRC'},
 web:{fr:'Développement web',en:'Web development',ar:'تطوير الويب'},
 accessibility:{fr:'Accessibilité',en:'Accessibility',ar:'إمكانية الوصول'},
 collaboration:{fr:'Collaboration',en:'Collaboration',ar:'التعاون'},
});
export const validTechnologyFilters=Object.freeze(Object.keys(technologyNames).map(id=>'tech:'+id));
export const validSkillFilters=Object.freeze(Object.keys(skillNames).map(id=>'skill:'+id));
export const isValidProjectFilterValue=value=>validProjectFilters.includes(value)||validTechnologyFilters.includes(value)||validSkillFilters.includes(value);
const availableValues=(entries,field)=>new Set(entries.filter(entry=>entry?.section==='projects').flatMap(entry=>Array.isArray(entry[field])?entry[field]:[]));
export const validStatusFilters=Object.freeze(['all','student','transcender','alumni']);
const projectGroups=Object.freeze({
 libft:'common-core',minishell:'common-core',cub3d:'common-core',so_long:'common-core',born2beroot:'common-core',ft_irc:'common-core',ft_transcendence:'common-core',
 ft_linear_regression:'specialization',personal:'personal',
});
const projectKinds=Object.freeze({
 'ft-transcendence-building-together':'ft_transcendence',
 'minishell-under-the-prompt':'minishell',
 'raycast-find-the-light':'cub3d',
 'network-messages-between-us':'ft_irc',
 'garden-small-useful-tools':'personal',
});
const copy={
 fr:{technologies:'Technologies',skills:'Savoir-faire',allCommonCore:'Tous les projets du tronc commun',allSpecialization:'Tous les projets de spécialisation',commonCore:'Tronc commun',specialization:'Spécialisation',personalProjects:'Projets personnels',allProjects:'Tous les projets',personal:'Projet personnel',allProfiles:'Tous les profils',statusGroup:'Statut',arrivalGroup:'Rentrée',student:'Cadet',transcender:'Transcender',alumni:'Alumni'},
 en:{technologies:'Technologies',skills:'Skills',allCommonCore:'All common-core projects',allSpecialization:'All specialization projects',commonCore:'Common core',specialization:'Specialisation',personalProjects:'Personal projects',allProjects:'All projects',personal:'Personal project',allProfiles:'All profiles',statusGroup:'Status',arrivalGroup:'Arrival year',student:'Cadet',transcender:'Transcender',alumni:'Alumni'},
 ar:{technologies:'التقنيات',skills:'المهارات',allCommonCore:'جميع مشاريع الجذع المشترك',allSpecialization:'جميع مشاريع التخصص',commonCore:'الجذع المشترك',specialization:'التخصّص',personalProjects:'المشاريع الشخصية',allProjects:'جميع المشاريع',personal:'مشروع شخصي',allProfiles:'جميع الأعضاء',statusGroup:'الحالة',arrivalGroup:'سنة الالتحاق',student:'كاديت',transcender:'ترانسيندر',alumni:'الخريجون'},
};
const languageOf=locale=>String(locale||'fr').toLowerCase().split(/[-_]/)[0];
const words=locale=>Object.hasOwn(copy,languageOf(locale))?copy[languageOf(locale)]:copy.fr;

export function projectFilterGroups(locale='fr',entries=[]){
 const text=words(locale);
 const technologies=availableValues(entries,'technologies'),skills=availableValues(entries,'skills');
 return [
  {value:'common-core',label:text.commonCore,selectAllLabel:text.allCommonCore},
  {value:'specialization',label:text.specialization,selectAllLabel:text.allSpecialization},
  ...(Object.keys(technologyNames).some(id=>technologies.has(id))?[{value:'technologies',label:text.technologies}]:[]),
  ...(Object.keys(skillNames).some(id=>skills.has(id))?[{value:'skills',label:text.skills}]:[]),
 ];
}

export function projectFilterOptions(locale='fr',entries=[]){
 const text=words(locale),language=languageOf(locale);
 const technologies=availableValues(entries,'technologies'),skills=availableValues(entries,'skills');
 return [...validProjectFilters.map(value=>({value,label:value==='all'?text.allProjects:value==='personal'?text.personalProjects:value==='born2beroot'?'Born2beroot':value,
  ...(['all','personal'].includes(value)?{}:{group:projectGroups[value]}),
 })),
 ...Object.entries(technologyNames).filter(([id])=>technologies.has(id)).map(([id,label])=>({value:'tech:'+id,label,group:'technologies'})),
 ...Object.entries(skillNames).filter(([id])=>skills.has(id)).map(([id,labels])=>({value:'skill:'+id,label:Object.hasOwn(labels,language)?labels[language]:labels.fr,group:'skills'})),
 ];
}

export function statusFilterOptions(locale='fr'){
 const text=words(locale);
 return validStatusFilters.map(value=>({value,label:value==='all'?text.allProfiles:text[value]}));
}

// Keep stored choices independent of the current campus or corpus so moving to
// another location does not silently discard a selected year.
const isArrivalYear=value=>Number.isInteger(value)&&value>=1900&&value<=2199;
export function isValidProfileFilterValue(value){
 return validStatusFilters.includes(value)||(typeof value==='string'&&/^arrival:(?:19|20|21)\d{2}$/.test(value));
}

export function profileFilterGroups(locale='fr'){
 const text=words(locale);
 return [{value:'status',label:text.statusGroup},{value:'arrival',label:text.arrivalGroup}];
}

export function profileFilterOptions(profiles=[],locale='fr'){
 const language=languageOf(locale),numberLocale=Object.hasOwn(copy,language)?language:'fr';
 const number=new Intl.NumberFormat(numberLocale,{useGrouping:false});
 const years=[...new Set(profiles.map(profile=>profile?.arrivalYear).filter(isArrivalYear))].sort((a,b)=>b-a);
 return [
  ...statusFilterOptions(locale).map(option=>option.value==='all'?option:{...option,group:'status'}),
  ...years.map(year=>({value:'arrival:'+year,label:number.format(year),group:'arrival'})),
 ];
}

// Empty sets mean all. A saved single choice remains valid after switching to
// multiple selection. Unknown values never hide an otherwise valid selection.
function selectedValues(value,allowed){
 const values=Array.isArray(value)?value:[value];
 if(values.includes('all'))return new Set();
 return new Set(values.filter(item=>item!=='all'&&(typeof allowed==='function'?allowed(item):allowed.includes(item))));
}

/**
 * Accept a mixed corpus or an already scoped list. Multiple selected categories
 * form a union within each facet. Project type, technology and skills intersect,
 * as do profile status and arrival year;
 * [] and 'all' retain the whole section.
 * Journal entries never inherit project/profile selections. Geography, favorites
 * and sort remain composable filters owned by the caller.
 * Transcender means common core completed, with specialisation still in progress.
 */
export function applyContentCategory(entries=[],{section,project=[],status=[]}={}){
 const scoped=section?entries.filter(entry=>entry.section===section):[...entries];
 if(section==='projects'){
  const selected=selectedValues(project,isValidProjectFilterValue);
  const types=new Set([...selected].filter(value=>validProjectFilters.includes(value)));
  const technologies=new Set([...selected].filter(value=>value.startsWith('tech:')).map(value=>value.slice(5)));
  const skills=new Set([...selected].filter(value=>value.startsWith('skill:')).map(value=>value.slice(6)));
  return scoped.filter(entry=>(!types.size||(Object.hasOwn(projectKinds,entry.id)&&types.has(projectKinds[entry.id])))
   &&(!technologies.size||(Array.isArray(entry.technologies)&&entry.technologies.some(id=>technologies.has(id))))
   &&(!skills.size||(Array.isArray(entry.skills)&&entry.skills.some(id=>skills.has(id)))));
 }
 if(section==='people'){
  const selected=selectedValues(status,isValidProfileFilterValue);
  const statuses=new Set([...selected].filter(value=>validStatusFilters.includes(value)));
  const years=new Set([...selected].filter(value=>value.startsWith('arrival:')));
  if(selected.size)return scoped.filter(entry=>(!statuses.size||statuses.has(entry.status))&&(!years.size||years.has('arrival:'+entry.arrivalYear)));
 }
 return scoped;
}
