export const THEME_PREFERENCE_KEY='horizon-archive-pre-codex-audit-fixes-20261015-theme-preference-v1';
export const THEME_PREFERENCES=Object.freeze(['light','dark','system']);
export const normalizeThemePreference=value=>THEME_PREFERENCES.includes(value)?value:'light';
export const resolveThemePreference=(preference,systemDark=false)=>preference==='dark'||preference==='system'&&systemDark?'dark':'light';

// Missing or invalid saved choices retain Horizon's established light default.
// Independent studies and archived readers use their own theme state.
export function createThemePreferences({storage,mediaQuery,eventTarget,onChange=()=>{}}={}){
 let preference='light',systemDark=Boolean(mediaQuery?.matches),destroyed=false;
 const getStorage=()=>typeof storage==='function'?storage():storage;
 const snapshot=()=>{const theme=resolveThemePreference(preference,systemDark);return {preference,theme,dark:theme==='dark'};};
 const read=()=>{try{return normalizeThemePreference(getStorage()?.getItem(THEME_PREFERENCE_KEY));}catch{return 'light';}};
 const notifyIfChanged=before=>{const next=snapshot();if(!destroyed&&(next.preference!==before.preference||next.theme!==before.theme))onChange(next);return next;};
 preference=read();
 function setPreference(value){
  if(destroyed||!THEME_PREFERENCES.includes(value))return snapshot();
  const before=snapshot();preference=value;systemDark=Boolean(mediaQuery?.matches);
  try{getStorage()?.setItem(THEME_PREFERENCE_KEY,value);}catch{/* Current-page use remains available without storage. */}
  return notifyIfChanged(before);
 }
 function restore(){
  if(destroyed)return snapshot();
  const before=snapshot();preference=read();systemDark=Boolean(mediaQuery?.matches);
  return notifyIfChanged(before);
 }
 const onSystemChange=event=>{
  if(destroyed)return;
  const before=snapshot();systemDark=typeof event.matches==='boolean'?event.matches:Boolean(mediaQuery?.matches);
  if(preference==='system')notifyIfChanged(before);
 };
 const onStorage=event=>{if(event.key===THEME_PREFERENCE_KEY||event.key===null)restore();};
 if(mediaQuery?.addEventListener)mediaQuery.addEventListener('change',onSystemChange);
 else mediaQuery?.addListener?.(onSystemChange);
 eventTarget?.addEventListener('storage',onStorage);
 function destroy(){
  if(destroyed)return;destroyed=true;
  if(mediaQuery?.removeEventListener)mediaQuery.removeEventListener('change',onSystemChange);
  else mediaQuery?.removeListener?.(onSystemChange);
  eventTarget?.removeEventListener('storage',onStorage);
 }
 return {snapshot,setPreference,restore,destroy};
}
