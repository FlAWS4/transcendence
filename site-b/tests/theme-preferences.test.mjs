import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createThemePreferences,THEME_PREFERENCE_KEY,normalizeThemePreference,resolveThemePreference} from '../theme-preferences.mjs';

const storage=initial=>{const values=new Map(Object.entries(initial||{}));return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};
class SystemTheme extends EventTarget{
 constructor(dark=false){super();this.matches=dark;}
 change(dark){this.matches=dark;const event=new Event('change');event.matches=dark;this.dispatchEvent(event);}
}
const storageEvent=key=>{const event=new Event('storage');event.key=key;return event;};

test('the established light default ignores the OS until System is explicitly chosen',()=>{
 const mediaQuery=new SystemTheme(true),saved=storage(),changes=[];
 const state=createThemePreferences({storage:saved,mediaQuery,onChange:next=>changes.push(next)});
 assert.deepEqual(state.snapshot(),{preference:'light',theme:'light',dark:false});
 mediaQuery.change(false);mediaQuery.change(true);assert.equal(changes.length,0);
 assert.equal(saved.getItem(THEME_PREFERENCE_KEY),null);
 assert.deepEqual(state.setPreference('system'),{preference:'system',theme:'dark',dark:true});
 assert.equal(saved.getItem(THEME_PREFERENCE_KEY),'system');assert.equal(changes.length,1);
});

test('Light, Dark and System survive reloading without modifying study or archive preferences',()=>{
 const saved=storage({'horizon-awards-studies-theme':'dark','horizon-content-view':'list'}),mediaQuery=new SystemTheme(true);
 for(const preference of ['dark','system','light']){
  const state=createThemePreferences({storage:saved,mediaQuery});state.setPreference(preference);state.destroy();
  const restored=createThemePreferences({storage:saved,mediaQuery});
  assert.equal(restored.snapshot().preference,preference);assert.equal(restored.snapshot().theme,preference==='light'?'light':'dark');restored.destroy();
 }
 assert.equal(saved.getItem('horizon-awards-studies-theme'),'dark');assert.equal(saved.getItem('horizon-content-view'),'list');
});

test('system changes update only the effective theme while the saved preference stays System',()=>{
 const saved=storage({[THEME_PREFERENCE_KEY]:'system'}),mediaQuery=new SystemTheme(false),changes=[];
 const state=createThemePreferences({storage:saved,mediaQuery,onChange:next=>changes.push(next)});
 mediaQuery.change(true);mediaQuery.change(true);mediaQuery.change(false);
 assert.deepEqual(changes.map(item=>item.theme),['dark','light']);assert.equal(saved.getItem(THEME_PREFERENCE_KEY),'system');
 state.setPreference('dark');const count=changes.length;mediaQuery.change(true);mediaQuery.change(false);
 assert.equal(changes.length,count);assert.equal(state.snapshot().theme,'dark');
 state.setPreference('system');assert.equal(state.snapshot().theme,'light');
 state.setPreference('light');mediaQuery.change(true);assert.equal(state.snapshot().theme,'light');
});

test('a preference change is observable even when the effective appearance is unchanged',()=>{
 const mediaQuery=new SystemTheme(false),changes=[];
 const state=createThemePreferences({mediaQuery,onChange:next=>changes.push(next)});
 state.setPreference('system');state.setPreference('system');state.setPreference('light');
 assert.deepEqual(changes.map(item=>item.preference),['system','light']);
});

test('corrupt storage, unavailable storage and invalid choices do not break theme selection',()=>{
 for(const value of ['auto','constructor','__proto__','"dark"',null,42]){
  assert.equal(normalizeThemePreference(value),'light');
  const state=createThemePreferences({storage:storage({[THEME_PREFERENCE_KEY]:value}),mediaQuery:new SystemTheme(true)});
  assert.equal(state.snapshot().theme,'light');state.setPreference('dark');state.setPreference(value);assert.equal(state.snapshot().preference,'dark');
 }
 const blocked=createThemePreferences({storage:()=>{throw Error('blocked');},mediaQuery:new SystemTheme(true)});
 assert.equal(blocked.snapshot().theme,'light');assert.equal(blocked.setPreference('system').theme,'dark');
 assert.equal(resolveThemePreference('system',false),'light');assert.equal(resolveThemePreference('dark',false),'dark');
});

test('storage changes from another tab restore the shared preference and a cleared key restores light',()=>{
 const saved=storage(),eventTarget=new EventTarget(),mediaQuery=new SystemTheme(true),changes=[];
 const state=createThemePreferences({storage:saved,eventTarget,mediaQuery,onChange:next=>changes.push(next)});
 saved.setItem(THEME_PREFERENCE_KEY,'system');eventTarget.dispatchEvent(storageEvent(THEME_PREFERENCE_KEY));assert.equal(state.snapshot().theme,'dark');
 saved.setItem(THEME_PREFERENCE_KEY,'light');eventTarget.dispatchEvent(storageEvent('unrelated'));assert.equal(state.snapshot().preference,'system');
 eventTarget.dispatchEvent(storageEvent(THEME_PREFERENCE_KEY));assert.equal(state.snapshot().preference,'light');
 state.setPreference('dark');saved.removeItem(THEME_PREFERENCE_KEY);eventTarget.dispatchEvent(storageEvent(null));assert.equal(state.snapshot().theme,'light');
 assert.equal(changes.length,4);
});

test('destroy releases OS and storage listeners, including legacy matchMedia listeners',()=>{
 const saved=storage({[THEME_PREFERENCE_KEY]:'system'}),eventTarget=new EventTarget(),mediaQuery=new SystemTheme(),changes=[];
 const state=createThemePreferences({storage:saved,eventTarget,mediaQuery,onChange:next=>changes.push(next)});
 state.destroy();mediaQuery.change(true);saved.setItem(THEME_PREFERENCE_KEY,'dark');eventTarget.dispatchEvent(storageEvent(THEME_PREFERENCE_KEY));
 assert.equal(changes.length,0);assert.equal(state.snapshot().theme,'light');state.setPreference('dark');assert.equal(state.snapshot().theme,'light');
 let callback=null;const legacy={matches:false,addListener:fn=>{callback=fn;},removeListener:fn=>{assert.equal(fn,callback);callback=null;}};
 const legacyState=createThemePreferences({storage:storage({[THEME_PREFERENCE_KEY]:'system'}),mediaQuery:legacy});
 legacy.matches=true;callback({matches:true});assert.equal(legacyState.snapshot().theme,'dark');legacyState.destroy();assert.equal(callback,null);
});

test('the pre-style bootstrap matches the model for all choices, OS states and invalid storage',()=>{
 const source=readFileSync(new URL('../theme-bootstrap.js',import.meta.url),'utf8');
 for(const preference of [undefined,'light','dark','system','unknown'])for(const systemDark of [false,true]){
  const saved=storage(preference?{[THEME_PREFERENCE_KEY]:preference}:{}),document={documentElement:{dataset:{}}};
  runInNewContext(source,{document,localStorage:saved,matchMedia:()=>({matches:systemDark})});
  const state=createThemePreferences({storage:saved,mediaQuery:new SystemTheme(systemDark)}).snapshot();
  assert.equal(document.documentElement.dataset.theme,state.theme);assert.equal(document.documentElement.dataset.themePreference,state.preference);
 }
 const document={documentElement:{dataset:{}}};runInNewContext(source,{document,localStorage:{getItem(){throw Error('blocked');}}});assert.equal(document.documentElement.dataset.theme,'light');
});
